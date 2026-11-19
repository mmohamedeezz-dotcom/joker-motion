// The voice, made carefully: 1) the script gets full Egyptian tashkeel so the reader cannot guess a vowel wrong,
// 2) the take is transcribed back and compared with the script, 3) a take with wrong or missing words is made again.
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { tts } from "./lib.mjs";
import { keyOf, transcribe, compare } from "./asr.mjs";

const strip = (s) => String(s).replace(/[ً-ْٰـ]/g, "");
const letters = (s) => strip(s).replace(/[إأآ]/g, "ا").replace(/[^ء-ي\s]/g, "").replace(/\s+/g, " ").trim();

async function ask(prompt, models = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-flash-latest"]) {
  let last = "";
  for (let a = 0; a < models.length * 2; a++) {
    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + models[a % models.length] + ":generateContent", { method: "POST", signal: AbortSignal.timeout(45000),
        headers: { "x-goog-api-key": keyOf(), "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0 } }) });
      if (res.ok) return (((await res.json()).candidates || [])[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
      last = "HTTP " + res.status;
    } catch (e) { last = String(e.message || e); }
    await new Promise((ok) => setTimeout(ok, 1500));
  }
  throw new Error("text model unavailable: " + last);
}

/** lines of plain script -> the same lines fully vowelled for Cairene pronunciation; a line that changed a word falls back to the plain line */
export async function diacritize(lines) {
  const out = await ask("شكّل النص ده تشكيل كامل بالنطق المصري القاهري (مش فصحى)، عشان قارئ آلي يقراه صح.\nالقواعد:\n- ممنوع تغيّر أو تزوّد أو تشيل أي كلمة أو حرف أو علامة ترقيم. التشكيل بس.\n- نفس عدد السطور ونفس الترتيب، كل سطر في سطر، من غير ترقيم ومن غير أي كلام تاني.\n- النطق مصري: الجيم جيم قاهرية، «ده» و«إنت» و«مش» و«بكرة» زي ما المصريين بيقولوها، وآخر الكلمة ساكن غالباً.\n- حط الشدة والسكون في مكانهم، وأسماء البراندات تتشكّل زي ما بتتنطق.\n\nالنص:\n" + lines.join("\n"));
  const got = out.split("\n").map((x) => x.trim()).filter(Boolean);
  let kept = 0;
  const res = lines.map((ln, i) => { const g = got[i] || ""; if (g && letters(g) === letters(ln)) { kept++; return g; } return ln; });
  return { lines: res, kept, total: lines.length };
}

/** a listener's verdict on a take: the words it heard, the words it found mispronounced, and a 0-10 score for natural Cairene delivery */
async function judge(file, script) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "wav", "-"], { maxBuffer: 1 << 28 }), models = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-omni-1.2-flash"];
  const prompt = "إنت مراجع تعليق صوتي مصري. اسمع التسجيل وقارنه بالنص المكتوب، ورجّع JSON بس بالشكل ده: {\"heard\":\"الكلام زي ما اتقال بالحرف\",\"wrong\":[\"كل كلمة اتنطقت غلط أو بنطق فصحى أو بحركات غلط\"],\"score\":رقم من 0 لـ 10 للنطق المصري القاهري الطبيعي (10 = واحد مصري بيتكلم عادي، 0 = مذيع فصحى أو آلي)}\nالنص المكتوب:\n" + script;
  for (let a = 0; a < models.length; a++) {
    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + models[a] + ":generateContent", { method: "POST", signal: AbortSignal.timeout(40000), headers: { "x-goog-api-key": keyOf(), "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "audio/wav", data: r.stdout.toString("base64") } }] }], generationConfig: { temperature: 0, responseMimeType: "application/json" } }) });
      if (!res.ok) continue;
      const t = (((await res.json()).candidates || [])[0]?.content?.parts || []).map((p) => p.text || "").join(""), j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
      if (typeof j.heard === "string" && j.heard.trim().length > 10) return { heard: j.heard, wrong: Array.isArray(j.wrong) ? j.wrong.slice(0, 12) : [], score: Number(j.score) || 0, model: models[a] };
    } catch (e) { /* next model */ }
  }
  return null;
}

/** make the take. One reading; it is transcribed back, and read again only if words are missing or changed. */
export async function makeVoice(lines, out, opt = {}, log = () => {}) {
  const plain = lines.map(strip).join(" "), tries = opt.takes || 2; let best = null;
  for (let t = 1; t <= tries; t++) {
    const f = out.replace(/\.wav$/, ".t" + t + ".wav");
    await tts(lines.join("\n"), f, opt);
    let cmp = null;
    try { const heard = await transcribe(f, ["gemini-3.5-transcribe"]); if (heard && heard.length > plain.length * 0.4) cmp = compare(plain, heard); } catch (e) { log("listen-back skipped: " + e.message.slice(0, 60)); }
    log("take " + t + (cmp ? ": " + cmp.errors + " of " + cmp.words + " words differ" + (cmp.miss.length ? " (" + cmp.miss.slice(0, 6).join(", ") + ")" : "") : ": not checked"));
    if (!best || (cmp && (!best.cmp || cmp.errors < best.cmp.errors))) best = { f, cmp };
    if (!cmp || cmp.errors <= Math.max(1, Math.round(cmp.words * 0.03))) break;
  }
  fs.copyFileSync(best.f, out);
  return { say: lines, check: best.cmp };
}

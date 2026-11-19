// Listen back: transcribe a voice file with Gemini and compare it with the script, word by word.
//   node tools/asr.mjs <audio.wav> ["the script text"]
import fs from "node:fs";
import { spawnSync } from "node:child_process";
export function keyOf() {
  let k = process.env.GEMINI_API_KEY;
  if (!k && process.env.JM_GEMINI_KEY_FILE && fs.existsSync(process.env.JM_GEMINI_KEY_FILE)) k = fs.readFileSync(process.env.JM_GEMINI_KEY_FILE, "utf8").trim().split(/\s+/)[0];
  if (!k) throw new Error("NO_KEY");
  return k;
}
const norm = (s) => String(s).replace(/[ً-ْٰ]/g, "").replace(/[إأآا]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[^؀-ۿ0-9a-zA-Z\s]/g, " ").replace(/\s+/g, " ").trim();
export async function transcribe(file, models = (process.env.JM_ASR_MODEL || "gemini-3.5-transcribe,gemini-3.7-flash,gemini-3.6-flash,gemini-3.8-flash").split(",")) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", "16000", "-f", "wav", "-"], { maxBuffer: 1 << 28 });
  let res = null, last = "";
  for (let a = 0; a < models.length * 2; a++) {
    const model = models[a % models.length];
    try {
      res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", { method: "POST", signal: AbortSignal.timeout(45000), headers: { "x-goog-api-key": keyOf(), "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "اكتب الكلام اللي في التسجيل ده بالحرف زي ما اتقال بالظبط بالعامية المصرية، من غير تصحيح ومن غير تشكيل ومن غير أي تعليق. لو كلمة اتقالت غلط أو مش واضحة اكتبها زي ما سمعتها." }, { inline_data: { mime_type: "audio/wav", data: r.stdout.toString("base64") } }] }], generationConfig: { temperature: 0 } }) });
      if (res.ok) break; last = "HTTP " + res.status; res = null;
    } catch (e) { last = String(e.message || e); res = null; }
    await new Promise((ok) => setTimeout(ok, 1500));
  }
  if (!res) throw new Error("ASR unavailable: " + last);
  const j = await res.json(); return ((j.candidates || [])[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
}
/** word-level diff: which script words were not heard as written */
export function compare(script, heard) {
  const a = norm(script).split(" "), b = norm(heard).split(" "), n = a.length, m = b.length, d = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = 0; i <= n; i++) d[i][0] = i; for (let j = 0; j <= m; j++) d[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  const miss = []; let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) { i--; j--; }
    else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) { miss.unshift(a[i - 1] + "→" + b[j - 1]); i--; j--; }
    else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { miss.unshift(a[i - 1] + "→∅"); i--; }
    else { miss.unshift("∅→" + b[j - 1]); j--; }
  }
  return { words: n, errors: d[n][m], wer: +(d[n][m] / n).toFixed(3), miss };
}
if (process.argv[1] && process.argv[1].endsWith("asr.mjs")) {
  const heard = await transcribe(process.argv[2]); console.log("HEARD:", heard);
  if (process.argv[3]) console.log(JSON.stringify(compare(process.argv[3], heard)));
}

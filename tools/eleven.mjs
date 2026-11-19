// ElevenLabs voice with exact word times (the same call the campaign engine's renderer uses: eleven_v3, Arabic, with-timestamps).
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { SR, decode } from "./lib.mjs";
export function elevenKey() {
  let k = process.env.ELEVENLABS_API_KEY;
  if (!k && process.env.JM_ELEVEN_KEY_FILE && fs.existsSync(process.env.JM_ELEVEN_KEY_FILE)) k = fs.readFileSync(process.env.JM_ELEVEN_KEY_FILE, "utf8").trim().split(/\s+/)[0];
  return k || "";
}
/** text (lines) -> { audio: Float32Array mono 48k, words: [{text,start,end}] } with the reader's real word times */
export async function elevenTake(text, { voice = process.env.ELEVENLABS_VOICE_ID || "QvNF0qyyt1Tuy1YAmnzH", speed = 1.05 } = {}, out) {
  const tries = [["eleven_v3", { stability: 0.5, similarity_boost: 0.8, speed }, "ar"], ["eleven_v3", null, "ar"], ["eleven_multilingual_v2", { stability: 0.45, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, speed }, null]];
  let last = "";
  for (const [model, vs, lang] of tries) {
    const body = { text, model_id: model }; if (vs) body.voice_settings = vs; if (lang) body.language_code = lang;
    const res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voice + "/with-timestamps?output_format=mp3_44100_128", { method: "POST", signal: AbortSignal.timeout(120000), headers: { "xi-api-key": elevenKey(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) { last = model + " HTTP " + res.status + " " + (await res.text()).slice(0, 160); continue; }
    const j = await res.json(), al = j.alignment || j.normalized_alignment || {}, ch = al.characters || [], st = al.character_start_times_seconds || [], en = al.character_end_times_seconds || [];
    fs.writeFileSync(out, Buffer.from(j.audio_base64, "base64"));
    const words = []; let cur = null;
    for (let i = 0; i < ch.length; i++) {
      if (/\s/.test(ch[i])) { cur = null; continue; }
      if (!cur) { cur = { text: "", start: st[i], end: en[i] }; words.push(cur); }
      cur.text += ch[i]; cur.end = en[i];
    }
    // a lone punctuation mark belongs to the word before it
    const merged = []; for (const w of words) { if (/^[،,.:؛!؟?…]+$/.test(w.text) && merged.length) { merged[merged.length - 1].text += w.text; merged[merged.length - 1].end = w.end; } else merged.push(w); }
    return { audio: decode(out, 1), words: merged, model };
  }
  throw new Error("ElevenLabs: " + last);
}
/** cut the long pauses of a take whose word times are known; every word keeps its own real time */
export function tightenWords(x, words, meta, holds = new Set()) {
  const out = [], timed = []; let src = 0, shift = 0;
  const kind = (i) => (meta[i - 1].beat !== meta[i].beat ? 2 : /[،,.:؛!؟?…]$/.test(meta[i - 1].say) ? 1 : 0);
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (i > 0) {
      const gap = w.start - words[i - 1].end, kd = kind(i), want = kd === 2 ? (holds.has(meta[i].beat) ? 0.72 : 0.3) : kd === 1 ? 0.22 : 0.14;
      if (gap > want + 0.06) {
        const a = Math.round((words[i - 1].end + 0.07) * SR), b = Math.round((w.start - Math.max(0.04, want - 0.07)) * SR);
        if (b > a) { const piece = x.slice(src, a), f = Math.min(480, piece.length); for (let k = 0; k < f; k++) piece[piece.length - 1 - k] *= k / f; out.push(piece); src = b; shift += (b - a) / SR; }
      }
    }
    timed.push({ text: meta[i].say, start: +(Math.max(0, w.start - shift)).toFixed(3), end: +(Math.max(0, w.end - shift)).toFixed(3) });
  }
  out.push(x.slice(src)); out.push(new Float32Array(Math.round(0.3 * SR)));
  let n = 0; for (const p of out) n += p.length; const audio = new Float32Array(n); let o = 0; for (const p of out) { audio.set(p, o); o += p.length; }
  // lead-in: the first word starts at once
  const lead = Math.max(0, Math.round((timed[0].start - 0.03) * SR)), cut = audio.slice(lead), d = lead / SR;
  timed.forEach((t) => { t.start = +(Math.max(0, t.start - d)).toFixed(3); t.end = +(Math.max(0, t.end - d)).toFixed(3); });
  const spoken = timed[timed.length - 1].end - timed[0].start;
  return { audio: cut, words: timed, stats: { exact: true, wps: +(timed.length / spoken).toFixed(2), seconds: +(cut.length / SR).toFixed(2) } };
}

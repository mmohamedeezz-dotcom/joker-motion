#!/usr/bin/env node
// Joker Motion — one command from a spec to an MP4.
//   node tools/make.mjs specs/<name>.json [--voice take.wav] [--out out/<name>.mp4] [--draft] [--no-render] [--snap 0,1.5,3]
// Voice: --voice <file> uses a ready recording; without it the script is read by Gemini TTS (GEMINI_API_KEY).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, SR, engine, decode, encode, alignAndTighten, mix, master } from "./lib.mjs";
import { makeVoice } from "./voice.mjs";
import { elevenKey, elevenTake, tightenWords } from "./eleven.mjs";

const args = process.argv.slice(2), specFile = args.find((a) => !a.startsWith("--") && a.endsWith(".json"));
const opt = (k) => { const i = args.indexOf("--" + k); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
if (!specFile) { console.error("usage: node tools/make.mjs specs/<name>.json [--voice take.wav] [--out file.mp4] [--draft] [--no-render] [--snap t,t]"); process.exit(2); }
const t0 = Date.now(), lap = (m) => console.log(("[" + ((Date.now() - t0) / 1000).toFixed(1) + "s] ").padEnd(10) + m);

// the agent's answer may arrive wrapped in a code fence or with a line of talk around it: keep the JSON object only
const rawSpec = fs.readFileSync(specFile, "utf8"), j0 = rawSpec.indexOf("{");
let j1 = -1; for (let i = j0, d = 0, q = false, e = false; i >= 0 && i < rawSpec.length; i++) { const c = rawSpec[i]; if (q) { if (e) e = false; else if (c === "\\") e = true; else if (c === '"') q = false; } else if (c === '"') q = true; else if (c === "{") d++; else if (c === "}" && --d === 0) { j1 = i; break; } }
if (j0 < 0 || j1 < 0) { console.error("no JSON object in the spec"); process.exit(2); }
const spec = JSON.parse(rawSpec.slice(j0, j1 + 1)), name = path.basename(specFile, ".json");
const JM = engine();
// a scene the library does not have becomes a drawing from the icon library, so one wrong name never stops a video
const swapped = [];
for (const b of spec.beats || []) {
  if (b.scene && !b.scenes) { b.scenes = [b.scene]; delete b.scene; }
  b.scenes = (b.scenes || []).filter((s) => s && typeof s === "object").slice(0, 2);
  for (const s of b.scenes) if (!JM.scenes[s.type]) { swapped.push(s.type); s.icon = s.icon || String(s.type || "star").replace(/_/g, "-"); s.type = "icon"; }
}
if (swapped.length) console.log("unknown scenes drawn as icons: " + swapped.join(", "));
const parsed = JM.parse(spec);
if (!parsed.words.length) { console.error("the spec has no words"); process.exit(2); }

const job = path.join(ROOT, "jobs", name);
fs.rmSync(job, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, "template"), job, { recursive: true });
fs.cpSync(path.join(ROOT, "engine"), path.join(job, "engine"), { recursive: true });
fs.mkdirSync(path.join(job, "assets/fonts"), { recursive: true });
for (const f of ["display.ttf", "text.ttf"]) fs.copyFileSync(path.join(ROOT, "fonts", f), path.join(job, "assets/fonts", f));
// the client's logo: downloaded into the job so the render never depends on the network; if it fails the brand name is drawn instead
if (spec.logo && /^https?:\/\//i.test(String(spec.logo))) {
  try {
    const r = await fetch(String(spec.logo)); if (!r.ok) throw new Error("HTTP " + r.status);
    const ext = ((/\.(png|jpe?g|webp|svg)(?:[?#]|$)/i.exec(String(spec.logo)) || [])[1] || "png").toLowerCase();
    fs.writeFileSync(path.join(job, "assets", "logo." + ext), Buffer.from(await r.arrayBuffer()));
    spec.logo = "assets/logo." + ext; lap("logo: " + spec.logo);
  } catch (e) { console.log("logo download failed (" + e.message + "), drawing the brand name"); delete spec.logo; }
} else if (spec.logo) delete spec.logo;

// 1 · the voice
//   --voice <file>: a ready recording · ElevenLabs when its key is set (exact word times) · else Gemini TTS
const holds = new Set((spec.beats || []).map((b, i) => (b.hold ? i : -1)).filter((i) => i >= 0));
let raw = opt("voice"), al = null;
const wantEleven = !opt("mute") && (!raw || raw === true) && elevenKey() && (opt("eleven") || process.env.JM_VOICE === "eleven" || (spec.voice && spec.voice.provider === "eleven"));
if (opt("mute")) {
  // picture test with no voice: words at the reading pace over silence
  let t = 0; const n = Math.round(SR * (parsed.words.length / 2.3 + 1)), x = new Float32Array(n);
  parsed.words.forEach((w, i) => { if (i && w.beat !== parsed.words[i - 1].beat) t += 0.3; const d = 0.2 + w.say.length * 0.045; for (let k = Math.round(t * SR); k < Math.min(n, Math.round((t + d - 0.03) * SR)); k++) x[k] = 0.2 * Math.sin(k * 0.05); t += d; });
  raw = path.join(job, "assets/take.wav"); encode(raw, x.slice(0, Math.round((t + 0.2) * SR)), 1);
} else if (wantEleven) {
  try {
    const tk = await elevenTake(JM.voiceText(spec), { ...(spec.voice && spec.voice.eleven ? { voice: spec.voice.eleven } : {}) }, path.join(job, "assets/take.mp3"));
    if (tk.words.length === parsed.words.length) { al = tightenWords(tk.audio, tk.words, parsed.words, holds); lap("voice: ElevenLabs " + tk.model + ", exact word times"); }
    else { raw = path.join(job, "assets/take.mp3"); lap("voice: ElevenLabs " + tk.model + ", word count " + tk.words.length + " vs " + parsed.words.length + ": timed by pauses"); }
  } catch (e) { lap("ElevenLabs failed (" + e.message.slice(0, 90) + "), using Gemini"); }
}
if (!al && (!raw || raw === true)) {
  raw = path.join(job, "assets/take.wav");
  const v = await makeVoice(JM.voiceText(spec).split("\n"), raw, { voice: (spec.voice && spec.voice.name) || "Puck", ...(spec.voice && spec.voice.style ? { style: spec.voice.style + "\n# TRANSCRIPT:" } : {}) }, lap);
  fs.writeFileSync(path.join(job, "assets/voice.json"), JSON.stringify(v, null, 1));
  lap("voice generated");
}
if (!al) al = alignAndTighten(decode(raw, 1), parsed.words, holds);
encode(path.join(job, "assets/vo.wav"), al.audio, 1);
fs.writeFileSync(path.join(job, "assets/vo.words.json"), JSON.stringify({ source: al.stats.exact ? "word times from the voice service's own alignment; long pauses cut" : "pauses cut to the pace; words timed inside each pause-to-pause span by letters (no alignment model)", words: al.words }, null, 1));
lap("voice timed: " + JSON.stringify(al.stats));

// the drawings this video uses, from the icon library (a wrong name is replaced by its closest match)
const ICONS = JSON.parse(fs.readFileSync(path.join(ROOT, "icons/phosphor.json"), "utf8")), pick = {}, fixed = [];
const closest = (n) => { const tk = String(n).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean); let best = "star", sc = 0; for (const k in ICONS) { const kt = k.split("-"), s = tk.filter((x) => kt.includes(x)).length * 2 - kt.length * 0.1; if (s > sc) { sc = s; best = k; } } return best; };
const fix = (n) => { if (ICONS[n]) return n; const c = closest(n); fixed.push(n + "→" + c); return c; };
for (const b of spec.beats) for (const s of b.scenes || []) {
  for (const k of ["icon", "a", "b"]) if (typeof s[k] === "string" && (k === "icon" || s.type === "icon_swap")) s[k] = fix(s[k]);
  if (Array.isArray(s.around)) s.around = s.around.map(fix);
  if (Array.isArray(s.items)) s.items.forEach((x) => { if (x && typeof x === "object" && x.icon) x.icon = fix(x.icon); });
}
JSON.stringify(spec, (k, v) => { if (typeof v === "string" && ICONS[v]) pick[v] = ICONS[v]; return v; });
pick.star = ICONS.star; pick.user = ICONS.user;
fs.writeFileSync(path.join(job, "icons.js"), "window.JM_ICONS = " + JSON.stringify(pick) + ";\n");
if (fixed.length) lap("icon names fixed: " + fixed.join(", "));

// 2 · the picture's data
fs.writeFileSync(path.join(job, "timing.js"), "window.KHAAM_WORDS = " + JSON.stringify(al.words) + ";\n");
fs.writeFileSync(path.join(job, "spec.js"), "window.JM_SPEC = " + JSON.stringify(spec) + ";\n");

// 3 · the sound, from the same timing
const plan = JM.mount(JM.stubHost(), spec, al.words), dur = +plan.end.toFixed(2);
const mx = mix(al.audio, plan.sfx, plan.end), lv = master(path.join(job, "assets/mix.wav"), mx.audio);
fs.writeFileSync(path.join(job, "sound.json"), JSON.stringify({ duration: dur, loudness: lv, effects: mx.used }, null, 1));
lap("sound mixed: " + mx.used.length + " of " + mx.asked + " cues kept, " + (mx.used.length / dur).toFixed(2) + "/s, " + JSON.stringify(lv));

for (const f of ["index.html"]) fs.writeFileSync(path.join(job, f), fs.readFileSync(path.join(job, f), "utf8").replaceAll("__DUR__", String(dur)));

// 4 · render
const hf = (a) => spawnSync("npx", ["--yes", "hyperframes@0.8.225", ...a], { cwd: job, stdio: "inherit", env: { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1" } }).status;
if (opt("snap")) { const at = opt("snap") === "beats" ? plan.beats.map((b) => (b.t1 - 0.22).toFixed(2)).join(",") : String(opt("snap")); hf(["snapshot", "--at", at]); lap("snapshots in " + path.join(job, "snapshots")); }
if (!opt("no-render")) {
  const out = path.resolve(opt("out") && opt("out") !== true ? opt("out") : path.join(ROOT, "out", name + ".mp4"));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const st = hf(["render", ...(opt("draft") ? ["--quality", "draft"] : []), "--output", out]);
  if (st !== 0) { console.error("render failed"); process.exit(1); }
  lap("rendered " + out);
}
console.log(JSON.stringify({ job, duration: dur, words: parsed.words.length, beats: spec.beats.length, sfx: mx.used.length, ...lv, seconds: +((Date.now() - t0) / 1000).toFixed(1) }));

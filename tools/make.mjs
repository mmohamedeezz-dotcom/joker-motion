#!/usr/bin/env node
// Joker Motion — one command from a spec to an MP4.
//   node tools/make.mjs specs/<name>.json [--voice take.wav] [--out out/<name>.mp4] [--draft] [--no-render] [--snap 0,1.5,3]
// Voice: --voice <file> uses a ready recording; without it the script is read by Gemini TTS (GEMINI_API_KEY).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, SR, engine, decode, encode, tts, alignAndTighten, mix, master } from "./lib.mjs";

const args = process.argv.slice(2), specFile = args.find((a) => !a.startsWith("--") && a.endsWith(".json"));
const opt = (k) => { const i = args.indexOf("--" + k); return i < 0 ? null : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
if (!specFile) { console.error("usage: node tools/make.mjs specs/<name>.json [--voice take.wav] [--out file.mp4] [--draft] [--no-render] [--snap t,t]"); process.exit(2); }
const t0 = Date.now(), lap = (m) => console.log(("[" + ((Date.now() - t0) / 1000).toFixed(1) + "s] ").padEnd(10) + m);

const spec = JSON.parse(fs.readFileSync(specFile, "utf8")), name = path.basename(specFile, ".json");
const JM = engine(), parsed = JM.parse(spec);
const unknown = [...new Set((spec.beats || []).flatMap((b) => (b.scenes || (b.scene ? [b.scene] : [])).map((s) => s.type)).filter((t) => !JM.scenes[t]))];
if (unknown.length) { console.error("unknown scenes: " + unknown.join(", ")); process.exit(2); }
if (!parsed.words.length) { console.error("the spec has no words"); process.exit(2); }

const job = path.join(ROOT, "jobs", name);
fs.rmSync(job, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, "template"), job, { recursive: true });
fs.cpSync(path.join(ROOT, "engine"), path.join(job, "engine"), { recursive: true });
fs.mkdirSync(path.join(job, "assets/fonts"), { recursive: true });
for (const f of ["display.ttf", "text.ttf"]) fs.copyFileSync(path.join(ROOT, "fonts", f), path.join(job, "assets/fonts", f));

// 1 · the voice
let raw = opt("voice");
if (opt("mute")) {
  // picture test with no voice: words at the reading pace over silence
  let t = 0; const n = Math.round(SR * (parsed.words.length / 2.3 + 1)), x = new Float32Array(n);
  parsed.words.forEach((w, i) => { if (i && w.beat !== parsed.words[i - 1].beat) t += 0.3; const d = 0.2 + w.say.length * 0.045; for (let k = Math.round(t * SR); k < Math.min(n, Math.round((t + d - 0.03) * SR)); k++) x[k] = 0.2 * Math.sin(k * 0.05); t += d; });
  raw = path.join(job, "assets/take.wav"); encode(raw, x.slice(0, Math.round((t + 0.2) * SR)), 1);
} else if (!raw || raw === true) {
  raw = path.join(job, "assets/take.wav");
  await tts(JM.voiceText(spec), raw, { voice: (spec.voice && spec.voice.name) || "Puck", ...(spec.voice && spec.voice.style ? { style: spec.voice.style + "\n# TRANSCRIPT:" } : {}) });
  lap("voice generated");
}
const holds = new Set((spec.beats || []).map((b, i) => (b.hold ? i : -1)).filter((i) => i >= 0));
const al = alignAndTighten(decode(raw, 1), parsed.words, holds);
encode(path.join(job, "assets/vo.wav"), al.audio, 1);
fs.writeFileSync(path.join(job, "assets/vo.words.json"), JSON.stringify({ source: "pauses cut to the pace; words timed inside each pause-to-pause span by letters (no alignment model)", words: al.words }, null, 1));
lap("voice timed: " + JSON.stringify(al.stats));

// the drawings this video uses, from the icon library (a wrong name is replaced by its closest match)
const ICONS = JSON.parse(fs.readFileSync(path.join(ROOT, "icons/phosphor.json"), "utf8")), pick = {}, fixed = [];
const closest = (n) => { const tk = String(n).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean); let best = "star", sc = 0; for (const k in ICONS) { const kt = k.split("-"), s = tk.filter((x) => kt.includes(x)).length * 2 - kt.length * 0.1; if (s > sc) { sc = s; best = k; } } return best; };
const fix = (n) => { if (ICONS[n]) return n; const c = closest(n); fixed.push(n + "→" + c); return c; };
for (const b of spec.beats) for (const s of b.scenes || (b.scene ? [b.scene] : [])) {
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
lap("sound mixed: " + mx.used.length + " effects, " + JSON.stringify(lv));

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

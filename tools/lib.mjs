// Joker Motion — voice, timing and sound helpers (Node 22+, FFmpeg on PATH, no other dependency).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const SR = 48000;

/* ---------- the engine, loaded once (the same files the browser runs) ---------- */
export function engine() {
  if (!globalThis.JM || !globalThis.JM.mount) {
    for (const f of ["engine/core.js", "engine/scenes_1.js", "engine/scenes_2.js", "engine/scenes_3.js", "engine/scenes_icons.js"]) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), "utf8"), { filename: f });
  }
  return globalThis.JM;
}

/* ---------- audio in and out through FFmpeg ---------- */
function ff(args, input) {
  const r = spawnSync("ffmpeg", ["-v", "error", ...args], { input, maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error("ffmpeg: " + String(r.stderr).slice(0, 400));
  return r.stdout;
}
export function decode(file, ch = 1) {
  const b = ff(["-i", file, "-f", "f32le", "-ac", String(ch), "-ar", String(SR), "-"]);
  return new Float32Array(b.buffer, b.byteOffset, b.byteLength >> 2).slice();
}
export function encode(file, data, ch = 1, extra = []) {
  ff(["-y", "-f", "f32le", "-ac", String(ch), "-ar", String(SR), "-i", "-", ...extra, "-c:a", "pcm_s16le", file], Buffer.from(data.buffer, data.byteOffset, data.byteLength));
}

/* ---------- Gemini TTS: one take for the whole script ---------- */
export const VOICE_STYLE = `# AUDIO PROFILE: Karim, a 32-year-old Egyptian guy from Cairo, a real person not an announcer.
# SCENE: He is talking to a close friend at a cafe in Cairo about something he believes in.
# DIRECTOR'S NOTES: Authentic Cairene Egyptian colloquial Arabic (Masri) only, never Modern Standard Arabic and never Gulf accent. Pronounce ج as hard g, ق as a glottal stop where Egyptians do. Natural, relaxed, confident, a little smile in the voice. Fast natural flow like real speech, words connected, no robotic pauses, no dramatic announcer tone.
# TRANSCRIPT:`;
export async function tts(text, out, { voice = "Puck", model = "gemini-3.8-flash-tts", style = VOICE_STYLE } = {}) {
  let key = process.env.GEMINI_API_KEY;
  if (!key && process.env.JM_GEMINI_KEY_FILE && fs.existsSync(process.env.JM_GEMINI_KEY_FILE)) key = fs.readFileSync(process.env.JM_GEMINI_KEY_FILE, "utf8").trim().split(/\s+/)[0];
  if (!key) throw new Error("NO_TTS_KEY: set GEMINI_API_KEY (or pass --voice <file.wav>)");
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
    method: "POST", headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: style + text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } } })
  });
  if (!res.ok) throw new Error("TTS HTTP " + res.status + ": " + (await res.text()).slice(0, 300));
  const part = (await res.json()).candidates[0].content.parts[0].inlineData, raw = Buffer.from(part.data, "base64");
  if (raw.subarray(0, 4).toString() === "RIFF") fs.writeFileSync(out, raw);
  else {
    const rate = +(/rate=(\d+)/.exec(part.mimeType || "") || [0, 24000])[1], tmp = out + ".pcm";
    fs.writeFileSync(tmp, raw); ff(["-y", "-f", "s16le", "-ar", String(rate), "-ac", "1", "-i", tmp, out]); fs.unlinkSync(tmp);
  }
  return out;
}

/* ---------- pauses -> word times, then the pauses are cut to the pace (never a time-stretch) ---------- */
function speechSpans(x, thrDb = -38, minSil = 0.18) {
  const hop = Math.round(SR * 0.01), n = Math.floor(x.length / hop), thr = Math.pow(10, thrDb / 20), loud = new Uint8Array(n);
  let peak = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > peak) peak = a; }
  for (let f = 0; f < n; f++) { let m = 0; for (let i = f * hop, e = i + hop; i < e; i++) { const a = Math.abs(x[i]); if (a > m) m = a; } loud[f] = m > thr * Math.max(0.3, peak) ? 1 : 0; }
  const spans = []; let s = -1, quiet = 0; const need = Math.round(minSil / 0.01);
  for (let f = 0; f < n; f++) {
    if (loud[f]) { if (s < 0) s = f; quiet = 0; }
    else if (s >= 0 && ++quiet >= need) { spans.push([s * 0.01, (f - quiet + 1) * 0.01]); s = -1; quiet = 0; }
  }
  if (s >= 0) spans.push([s * 0.01, n * 0.01]);
  return spans.filter(([a, b]) => b - a > 0.06);
}
const weight = (w) => w.replace(/[ً-ْ،,.:؛!؟?]/g, "").length + 1.2;

/** words: [{say, beat}], holds: Set of beat indexes that take the held beat before them. Returns {audio, words}. */
export function alignAndTighten(x, words, holds = new Set()) {
  const spans = speechSpans(x), K = spans.length, N = words.length;
  if (!K) throw new Error("the voice file is silent");
  const W = words.map((w) => weight(w.say)), cum = [0]; W.forEach((v) => cum.push(cum[cum.length - 1] + v));
  const total = spans.reduce((a, [s, e]) => a + (e - s), 0), rate = total / cum[N];
  // boundary kinds after word i (1..N-1): 2 = beat end, 1 = punctuation, 0 = inside a phrase
  const kind = (i) => (words[i - 1].beat !== words[i].beat ? 2 : /[،,.:؛!؟?…]$/.test(words[i - 1].say) ? 1 : 0);
  // DP: put the K-1 pauses on word boundaries so every span's length fits its letters; pauses prefer punctuation
  const segs = Math.min(K, N), INF = 1e9;
  const dp = Array.from({ length: segs + 1 }, () => new Float64Array(N + 1).fill(INF)), from = Array.from({ length: segs + 1 }, () => new Int32Array(N + 1));
  dp[0][0] = 0;
  const merged = spans.slice(0, segs); if (K > segs) merged[segs - 1] = [spans[segs - 1][0], spans[K - 1][1]];
  for (let k = 1; k <= segs; k++) {
    const dur = merged[k - 1][1] - merged[k - 1][0];
    for (let j = k; j <= N - (segs - k); j++) {
      for (let i = k - 1; i < j; i++) {
        if (dp[k - 1][i] >= INF) continue;
        const pen = k === segs ? 0 : [0.5, 0, -0.15][kind(j)];
        const c = dp[k - 1][i] + Math.abs(dur - (cum[j] - cum[i]) * rate) + pen;
        if (c < dp[k][j]) { dp[k][j] = c; from[k][j] = i; }
      }
    }
  }
  const cuts = [N]; for (let k = segs, j = N; k > 0; k--) { j = from[k][j]; cuts.unshift(j); }
  // rebuild the audio with new gaps and time each word inside its span by letters
  const out = [], timed = [], fade = Math.round(0.008 * SR); let pos = 0;
  merged.forEach(([s, e], k) => {
    const pre = k ? Math.min(0.03, s) : 0, post = 0.05, a = Math.round((s - pre) * SR), b = Math.min(x.length, Math.round((e + post) * SR));
    const piece = x.slice(a, b);
    for (let i = 0; i < Math.min(fade, piece.length); i++) { const g = i / fade; piece[i] *= g; piece[piece.length - 1 - i] *= g; }
    const start = pos / SR + pre, i0 = cuts[k], i1 = cuts[k + 1], tot = cum[i1] - cum[i0];
    for (let i = i0; i < i1; i++) timed.push({ text: words[i].say, start: +(start + (e - s) * (cum[i] - cum[i0]) / tot).toFixed(3), end: +(start + (e - s) * (cum[i + 1] - cum[i0]) / tot - 0.02).toFixed(3) });
    out.push(piece); pos += piece.length;
    if (k < merged.length - 1) {
      const kd = kind(i1), orig = merged[k + 1][0] - e;
      let gap = kd === 2 ? (holds.has(words[i1].beat) ? 0.72 : 0.3) : kd === 1 ? 0.22 : Math.min(orig, 0.13);
      const z = new Float32Array(Math.round(Math.max(0, gap - pre - post) * SR)); out.push(z); pos += z.length;
    }
  });
  const tail = new Float32Array(Math.round(0.3 * SR)); out.push(tail); pos += tail.length;
  const audio = new Float32Array(pos); let o = 0; for (const p of out) { audio.set(p, o); o += p.length; }
  const spoken = timed[N - 1].end - timed[0].start;
  return { audio, words: timed, stats: { spans: K, wps: +(N / spoken).toFixed(2), seconds: +(pos / SR).toFixed(2) } };
}

/* ---------- sound effects ----------
   A kind is a role, not a file: every kind draws from a pool in the library (sfx/index.json, 944 measured sounds).
   g = level in dB (after loudness matching), pr = priority when moments collide (3 = the beat's main hit … 0 = decoration),
   at = "peak" for sounds that swell to the move, max = longest file allowed. */
export const KINDS = {
  // designed motion sounds (Earshot)
  whoosh: { g: -13, pr: 1, at: "peak", re: /^earshot\/whoosh fast\/whoosh_fast (crisp|tight|whip|sleeve)/ },
  swipe: { g: -14, pr: 0, at: "peak", re: /^earshot\/whoosh swipe\// },
  swish: { g: -13, pr: 0, at: "peak", re: /^earshot\/whoosh swish\/swish (bright|soft|flick|zing)/ },
  wipe: { g: -9, pr: 2, at: "peak", re: /^earshot\/whoosh big\/pro_whoosh_big (long|tonal|swell|windy)/ },
  swell: { g: -14, pr: 1, at: "peak", re: /^earshot\/riser reverse swell\/reverse_swell short/ },
  pop: { g: -10, pr: 1, re: /^earshot\/pop in\/pro_pop_in (airy|round|double)/ },
  pop_big: { g: -8, pr: 2, re: /^earshot\/pop in\/pro_pop_in (deep|knock)/ },
  blip: { g: -15, pr: 0, re: /^earshot\/pop ui\/|^kenney\/interface\/select_/ },
  boop: { g: -12, pr: 0, re: /^earshot\/pop\/(pro_pop (boop|thup)|pop [013])/ },
  hit: { g: -4, pr: 3, re: /^earshot\/impact cut hit\/cut_hit (punch|kick)/ },
  sub: { g: -9, pr: 2, re: /^earshot\/sub drop\/pro_sub_drop quick/ },
  shimmer: { g: -15, pr: 0, re: /^earshot\/chime shimmer sparkle\/pro_shimmer m[12]/, max: 3.2 },
  mallet: { g: -11, pr: 1, re: /^earshot\/chime mallet\/mallet (up4|glock|marimba|celesta)/ },
  sting: { g: -7, pr: 3, re: /^earshot\/chime logo sting\/logo_sting (spark|soft_bloom)/ },
  key: { g: -16, pr: 0, re: /^earshot\/typing key\/fit / },
  // interface (Kenney)
  tick: { g: -15, pr: 0, re: /^kenney\/ui\/(rollover|click)\d|^kenney\/interface\/tick_/ },
  toggle: { g: -10, pr: 1, re: /^kenney\/ui\/switch(1|2|3|7|13|21)\.|^kenney\/interface\/(switch|toggle)_/ },
  ding: { g: -10, pr: 2, re: /^kenney\/interface\/confirmation_|^earshot\/chime notification ding\// },
  error: { g: -10, pr: 2, re: /^kenney\/interface\/error_00[1-4]/ },
  drop: { g: -12, pr: 1, re: /^kenney\/interface\/drop_/ },
  grow: { g: -14, pr: 0, re: /^kenney\/interface\/maximize_/ },
  // real recordings (Kenney): the thing you see is the thing you hear
  tap: { g: -11, pr: 1, re: /^kenney\/impact\/impactWood_light|^kenney\/rpg\/bookPlace/ },
  thud: { g: -8, pr: 2, re: /^kenney\/impact\/impactWood_(medium|heavy)|^kenney\/impact\/impactPlank_medium/ },
  stamp: { g: -4, pr: 3, re: /^kenney\/impact\/impactPunch_heavy|^kenney\/impact\/impactSoft_heavy/ },
  coin: { g: -9, pr: 2, re: /^kenney\/casino\/(chip-lay|chips-stack|chips-collide)/ },
  coins: { g: -9, pr: 2, re: /^kenney\/rpg\/handleCoins/ },
  card: { g: -10, pr: 2, re: /^kenney\/casino\/card-(place|slide|shove)/ },
  paper: { g: -9, pr: 2, re: /^kenney\/rpg\/bookFlip|^kenney\/casino\/card-fan/ },
  cloth: { g: -11, pr: 1, re: /^kenney\/rpg\/cloth\d/ },
  leather: { g: -9, pr: 2, re: /^kenney\/rpg\/(dropLeather|handleSmallLeather|beltHandle)/ },
  door: { g: -8, pr: 2, re: /^kenney\/rpg\/doorOpen/ },
  latch: { g: -8, pr: 2, re: /^kenney\/rpg\/(metalLatch|metalClick)/ },
  metal: { g: -9, pr: 2, re: /^kenney\/impact\/impactMetal_(light|medium)/ },
  bell: { g: -9, pr: 2, re: /^kenney\/impact\/impactBell_heavy/ },
  glass: { g: -12, pr: 1, re: /^kenney\/interface\/glass_|^kenney\/impact\/impactGlass_light/ },
  plate: { g: -10, pr: 1, re: /^kenney\/foley\/platesHit/ },
  box: { g: -9, pr: 2, re: /^kenney\/casino\/cards-pack-(open|take-out)/ }
};
let INDEX = null; const pools = {}, cache = new Map();
function pool(kind) {
  if (!INDEX) INDEX = JSON.parse(fs.readFileSync(path.join(ROOT, "sfx/index.json"), "utf8"));
  if (!pools[kind]) { const k = KINDS[kind]; pools[kind] = Object.keys(INDEX).filter((f) => k.re.test(f) && INDEX[f].d <= (k.max || 1.6)).sort(); }
  return pools[kind];
}
function sound(rel) { if (!cache.has(rel)) cache.set(rel, decode(path.join(ROOT, "sfx", rel), 2)); return cache.get(rel); }

/** which cues survive: the important sound wins a crowded moment, decoration thins out */
export function thin(cues) {
  const kept = [], LIMIT = [2, 3, 4, 99];
  cues.filter((c) => KINDS[c.kind]).map((c, i) => ({ ...c, pr: KINDS[c.kind].pr, i })).sort((a, b) => b.pr - a.pr || a.t - b.t || a.i - b.i).forEach((c) => {
    if (kept.some((k) => k.kind === c.kind && Math.abs(k.t - c.t) < 0.09)) return;
    if (kept.filter((k) => Math.abs(k.t - c.t) < 0.11).length >= 2) return;
    if (kept.filter((k) => Math.abs(k.t - c.t) < 0.75).length >= LIMIT[c.pr]) return;
    kept.push(c);
  });
  return kept.sort((a, b) => a.t - b.t);
}

/** voice (mono Float32Array), cues [{t, kind, gain}], end (s) -> stereo Float32Array (interleaved), effects ducked under speech */
export function mix(voice, cues, end) {
  const N = Math.round(end * SR), sfx = new Float32Array(N * 2), low = new Float32Array(N * 2), turn = {}, used = [];
  thin(cues).forEach((c) => {
    const k = KINDS[c.kind], files = pool(c.kind); if (!files.length) return;
    const rel = files[(turn[c.kind] = (turn[c.kind] || 0) + 1) % files.length], m = INDEX[rel], y = sound(rel), n = y.length >> 1;
    // loudness-matched on the loudest 50 ms, then the kind's level; never above a safe peak
    const g = Math.min(0.22 / m.r, 0.9 / m.pk) * Math.pow(10, (k.g + Math.max(-6, Math.min(4, c.gain || 0)) * 0.6) / 20);
    const first = Math.round(m.s * SR), anchor = first + (k.at === "peak" ? Math.round(m.pt * SR) : 0), last = Math.min(n, first + Math.round((m.d + 0.06) * SR));
    const s0 = Math.round(c.t * SR) - anchor, fade = Math.round(0.04 * SR), bus = k.pr === 0 ? low : sfx;
    for (let i = Math.max(first, -s0); i < last && s0 + i < N; i++) {
      const tail = Math.min(1, (Math.min(last, N - s0) - i) / fade), o = (s0 + i) * 2;
      bus[o] += y[2 * i] * g * tail; bus[o + 1] += y[2 * i + 1] * g * tail;
    }
    used.push({ t: c.t, kind: c.kind, sound: rel });
  });
  let vp = 0; for (let i = 0; i < voice.length; i++) vp = Math.max(vp, Math.abs(voice[i]));
  const vg = Math.pow(10, -3 / 20) / Math.max(1e-6, vp), win = Math.round(0.03 * SR), kk = Math.round(0.08 * SR), act = new Float32Array(N), env = new Float32Array(N);
  let acc = 0;
  for (let i = 0; i < N; i++) { acc += Math.abs(voice[i] || 0) * vg; if (i >= win) acc -= Math.abs(voice[i - win] || 0) * vg; env[i] = acc / win; }
  acc = 0; for (let i = 0; i < N; i++) { acc += env[i] > 0.02 ? 1 : 0; if (i >= kk) acc -= env[i - kk] > 0.02 ? 1 : 0; act[i] = Math.min(1, acc / kk); }
  const out = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const d = Math.pow(10, -7 * act[i] / 20), d0 = Math.pow(10, -11 * act[i] / 20), v = (voice[i] || 0) * vg;
    out[2 * i] = v + sfx[2 * i] * d + low[2 * i] * d0; out[2 * i + 1] = v + sfx[2 * i + 1] * d + low[2 * i + 1] * d0;
  }
  return { audio: out, used, asked: cues.length };
}

/** write the mix at -14 LUFS with a true ceiling (plain gain + limiter, not single-pass loudnorm) */
export function master(file, stereo) {
  const pre = file.replace(/\.wav$/, ".pre.wav"); encode(pre, stereo, 2);
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  const m = /"input_i"\s*:\s*"(-?[\d.]+)"/.exec(r.stderr || ""), gain = m ? -14 - parseFloat(m[1]) : 0;
  ff(["-y", "-i", pre, "-af", "volume=" + gain.toFixed(2) + "dB,alimiter=limit=0.82:attack=2:release=60:level=disabled", "-ar", String(SR), "-c:a", "pcm_s16le", file]);
  fs.unlinkSync(pre);
  const r2 = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "loudnorm=I=-14:TP=-1.5:print_format=json", "-f", "null", "-"], { encoding: "utf8" });
  const i2 = /"input_i"\s*:\s*"(-?[\d.]+)"/.exec(r2.stderr || ""), tp = /"input_tp"\s*:\s*"(-?[\d.]+)"/.exec(r2.stderr || "");
  return { lufs: i2 ? +i2[1] : null, true_peak: tp ? +tp[1] : null };
}

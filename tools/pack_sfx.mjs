// One-time: build the sound library in sfx/ and measure every file (sfx/index.json).
//   node tools/pack_sfx.mjs <kenney mirror folder> <earshot folder>
// Kenney packs (CC0): real recordings of chips, cards, books, doors, leather, wood, metal, glass + interface sounds.
// Earshot 0.4.0 (MIT): designed motion sounds (whooshes, pops, risers, chimes).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, SR, decode } from "./lib.mjs";
const [ken, ear] = process.argv.slice(2), out = path.join(ROOT, "sfx");
fs.rmSync(out, { recursive: true, force: true });
const PACKS = { "kenney-casino-audio": "casino", "kenney-foley-sounds": "foley", "kenney-impact-sounds": "impact", "kenney-interface-sounds": "interface", "kenney-rpg-audio": "rpg", "kenney-ui-audio": "ui" };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
let n = 0;
for (const [p, short] of Object.entries(PACKS)) {
  const dst = path.join(out, "kenney", short); fs.mkdirSync(dst, { recursive: true });
  for (const f of walk(path.join(ken, p))) if (/\.ogg$/i.test(f) && !/preview/i.test(f)) { fs.copyFileSync(f, path.join(dst, path.basename(f))); n++; }
  const lic = walk(path.join(ken, p)).find((f) => /licen/i.test(f)); if (lic) fs.copyFileSync(lic, path.join(dst, "LICENSE.txt"));
}
for (const fam of fs.readdirSync(ear)) {
  const src = path.join(ear, fam); if (!fs.statSync(src).isDirectory()) continue;
  const dst = path.join(out, "earshot", fam); fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) if (f.endsWith(".wav")) {
    const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(src, f), "-c:a", "libopus", "-b:a", "112k", path.join(dst, f.slice(fam.length + 1).replace(/\.wav$/, ".opus"))]);
    if (r.status === 0) n++;
  }
}
// measure: trimmed length, where it starts, how loud its loudest 50 ms is, where its peak is
const idx = {};
for (const f of walk(out)) {
  if (!/\.(ogg|opus)$/.test(f)) continue;
  let x; try { x = decode(f, 1); } catch (e) { continue; }
  let pk = 0, pi = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > pk) { pk = a; pi = i; } }
  if (pk < 0.003) continue;
  let s = 0; while (s < x.length && Math.abs(x[s]) < pk * 0.04) s++;
  let e = x.length - 1; while (e > s && Math.abs(x[e]) < pk * 0.02) e--;
  const w = Math.round(SR * 0.05); let best = 0, acc = 0;
  for (let i = s; i <= e; i++) { acc += x[i] * x[i]; if (i - s >= w) acc -= x[i - w] * x[i - w]; if (acc > best) best = acc; }
  idx[path.relative(out, f).split(path.sep).join("/")] = { s: +(s / SR).toFixed(3), d: +((e - s) / SR).toFixed(3), pk: +pk.toFixed(3), r: +Math.sqrt(best / w).toFixed(4), pt: +((pi - s) / SR).toFixed(3) };
}
fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(idx));
console.log("files", n, "indexed", Object.keys(idx).length);

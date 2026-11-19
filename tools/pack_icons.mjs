// One-time: pack Phosphor duotone SVGs (MIT) into icons/phosphor.json  { name: [accentMarkup, lineMarkup] }  + ICONS.md
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";
const src = process.argv[2], out = {}, dir = path.join(src, "assets/duotone");
for (const f of fs.readdirSync(dir).sort()) {
  const svg = fs.readFileSync(path.join(dir, f), "utf8"), els = svg.match(/<(path|circle|rect|line|polyline|polygon|ellipse)\b[^>]*\/>/g) || [];
  const a = els.filter((e) => /opacity="0\.2"/.test(e)).map((e) => e.replace(/\s*opacity="0\.2"/, "")).join(""), b = els.filter((e) => !/opacity="0\.2"/.test(e)).join("");
  out[f.replace(/-duotone\.svg$/, "")] = [a, b];
}
fs.writeFileSync(path.join(ROOT, "icons/phosphor.json"), JSON.stringify(out));
let cat = {};
try { const m = await import(path.join(src, "dist/index.mjs")); for (const i of m.icons) (cat[i.categories[0]] = cat[i.categories[0]] || []).push(i.name); } catch (e) { cat = { all: Object.keys(out) }; }
fs.writeFileSync(path.join(ROOT, "ICONS.md"), "# مكتبة الرسومات (" + Object.keys(out).length + " رسمة، Phosphor Icons، MIT)\n\nأي اسم من دول ينفع في `icon`. الرسمة بتتلون بألوان العالم اللوني تلقائي.\n\n" + Object.entries(cat).map(([k, v]) => "## " + k + "\n" + v.join(" ")).join("\n\n") + "\n");
console.log("icons", Object.keys(out).length, "categories", Object.keys(cat).length);

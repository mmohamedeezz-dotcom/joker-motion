// Writes SCENES.md (the catalogue the agent reads) from the scene library itself.
import fs from "node:fs";
import path from "node:path";
import { ROOT, engine } from "./lib.mjs";
const JM = engine(), rows = Object.entries(JM.scenes).map(([k, d]) => `| \`${k}\` | ${d.doc} | ${d.params || "-"} | ${Object.keys(d.cues || {}).join(", ") || "-"} | ${d.w >= 700 ? "لوحده" : "لوحده أو مع مشهد تاني"} |`);
fs.writeFileSync(path.join(ROOT, "SCENES.md"), `# مكتبة المشاهد (${rows.length} مشهد)\n\nالملف ده بيتولد من \`engine/scenes.js\` بالأمر \`node tools/catalog.mjs\`.\n\n| النوع | المعنى | الباراميترز | اللحظات (on) | الاستخدام |\n|---|---|---|---|---|\n${rows.join("\n")}\n`);
console.log("scenes:", rows.length);

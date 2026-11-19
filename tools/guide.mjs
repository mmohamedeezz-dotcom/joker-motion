// Writes n8n/motion-guide.md: the instructions the campaign engine's agent gets for the «موشن» style
// (rules + the scene catalogue + the drawing names), generated from the library itself.
import fs from "node:fs";
import path from "node:path";
import { ROOT, engine } from "./lib.mjs";
const JM = engine(), icons = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, "icons/phosphor.json"), "utf8")));
const scenes = Object.entries(JM.scenes).map(([k, d]) => `${k} | ${d.doc} | ${d.params || "-"} | ${Object.keys(d.cues || {}).join(", ") || "-"} | ${d.w >= 700 ? "لوحده" : "لوحده أو مع مشهد"}`);
const txt = `الستايل المطلوب في الرد ده: «موشن». الريل ده بيتنفذ بمحرك «Joker Motion»، مش بمكتبة kit. كل قواعد HTML و kit.css و data-vo و data-sfx اللي فوق ما تنطبقش على أصل الموشن.
- رأس البلوك زي ما هو بالحرف: <<<ASSET kind="reel" code="R1" dur="30" title="عنوان قصير">>> وبعده JSON واحد بس، وبعده <<<END>>>. ممنوع HTML وممنوع علامات الكود وممنوع أي كلام جوه البلوك غير الـ JSON.
- أصل موشن واحد بس في الرد.
- المحرك بيعمل لوحده: صوت الراوي (مصري طبيعي)، الكابشن كلمة كلمة، الرسم، الحركة، المؤثرات، والمكساج. إنت بتكتب السكريبت وتختار المشاهد بس.

قواعد السكريبت:
- عامية مصرية قاهرية. من 55 لـ 75 كلمة منطوقة في المجموع (حوالي 25 لـ 33 ثانية).
- كل حاجة من حقايق البراند بس: ممنوع أي رقم أو وعد أو سعر أو ضمان مش موجود، وأي شرط لازم يفضل. الأرقام تتكتب حروف زي ما بتتنطق.
- أول beat هو الهوك: جملة قصيرة للمشاهد مباشرة، من غير اسم البراند، وأهم كلمتين فيها في شريط اللون.
- كل beat جملة واحدة (4 لـ 12 كلمة) ومعاها مشهد أو مشهدين من المكتبة يرسموا معناها حرفيًا. من 6 لـ 9 beats.
- المشهد اللي استخدامه «لوحده» ما يتحطش مع مشهد تاني. ما تكررش نفس نوع المشهد في الفيديو (ما عدا icon).
- الألوان رحلة: world = paper للمشكلة، deep للحل، pop للمكسب، close للخلاصة، وآخر beat deep. المتاح: paper, deep, pop, close, hot, night. غيّر العالم 3 لـ 5 مرات.
- "hold": true على beat واحد بس: الجملة اللي بيبدأ عندها الحل.
- آخر beat فيه الدعوة للفعل أو الشروط، ومشهده checklist أو signature أو path_to باسم البراند.

كتابة النص (text) في كل beat:
- «/» سطر جديد في الكابشن (السطر كلمة لـ 3). «|» مجموعة كابشن جديدة (المجموعة 2 لـ 6 كلمات).
- [كلمتين مهمين] شريط لون، مرة في المجموعة. *كلمة* لون مميز.
- {كلام} بيتقال بالصوت بس وما يتكتبش في الكابشن، عشان المشهد نفسه بيكتبه (اسم البراند، الختم، الشروط).
- «،» و«.» و«؟» للإلقاء بس. من غير تشكيل ومن غير «…».

اللحظات (on): كل مشهد ليه لحظات. اربط كل لحظة بكلمة موجودة بنفس الحروف في نفس الـ beat: "on": {"hit": "هيكفي"}. ينفع "كلمة:end" و"كلمة+0.2".

شكل الـ JSON:
{"title":"اسم القطعة","brand":"اسم البراند","palette":{"paper":"#EFEDE8","ink":"#151515","accent":"#F0522B","deep":"#10294A","pop":"#F2B544","cream":"#F4F1EA"},"voice":{"name":"Puck"},
"beats":[
{"world":"paper","text":"جنب شغلك، / لأن بكرة / [مش هيكفي].","scenes":[{"type":"bars","labels":["دخلك","مصاريفك"],"on":{"grow":"بكرة","hit":"هيكفي"}},{"type":"calendar","a":"النهارده","b":"بكرة","on":{"flip":"بكرة"}}]},
{"world":"deep","hold":true,"text":"هنا فكرة {كسب العمل}.","scenes":[{"type":"stamp","a":"كسب","b":"العمل","on":{"hit":"كسب","second":"العمل"}}]},
{"world":"deep","text":"[للانضمام]: {من سكان التجمع الخامس، ومؤهل عالي}.","scenes":[{"type":"checklist","items":[{"s":"من سكان","t":"التجمع الخامس"},{"t":"مؤهل عالٍ"}],"name":"اسم البراند","on":{"first":"من","last":"ومؤهل"}}]}
]}
- palette: deep و pop من ألوان البراند في الدليل (deep الغامق، pop الفاتح البارز)، accent لون دافي للمشكلة، والباقي زي المثال.

مكتبة المشاهد (النوع | المعنى | الباراميترز | اللحظات | الاستخدام):
${scenes.join("\n")}

مشاهد icon و icon_row و icon_swap و icon_orbit و icon_card و icon_count بترسم أي حاجة تانية باسم إنجليزي من القايمة دي (لو المعنى له مشهد مخصوص فوق استخدمه هو):
${icons.join(" ")}
`;
fs.mkdirSync(path.join(ROOT, "n8n"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "n8n/motion-guide.md"), txt);
console.log("guide", txt.length, "chars,", scenes.length, "scenes,", icons.length, "icons");

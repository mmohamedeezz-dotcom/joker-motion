# Joker Motion

محرك بيحوّل ملف JSON واحد (سكريبت + مشاهد من المكتبة) لفيديو موشن 9:16 بالصوت والمؤثرات.

```bash
node tools/make.mjs specs/gamb-shoghlak.json --voice samples/gamb-shoghlak.wav --draft
```

- `engine/` المحرك ومكتبة المشاهد (`SCENES.md`) و`icons/` 1,512 رسمة Phosphor (MIT، `ICONS.md`).
- `AGENT.md` تعليمات الوكيل اللي بيكتب الـ JSON.
- `tools/make.mjs` صوت (Gemini TTS أو ملف جاهز) ← توقيت الكلمات ← مكساج ← رندر (HyperFrames 0.8.225).
- `.github/workflows/render.yml` رندر سحابي: `workflow_dispatch` بـ `job_id` و`spec_b64`، والنتيجة في release اسمه `renders`.

التراخيص: الخطوط Lalezar و Alexandria (OFL)، المؤثرات متولدة بـ Earshot 0.4.0 (MIT)، GSAP 3.15 (رخصة GreenSock المجانية)، HyperFrames (Apache-2.0).

/* Joker Motion — scene library, part 2: brand and trust, building, growth, ownership. */
(function (G) {
  "use strict";
  var JM = G.JM, def = JM.scene;

  def("stamp", { w: 620, h: 620, doc: "ختم دائري بيخبط باسم الحل أو النموذج (إعلان الفكرة الأساسية)", params: "a (السطر الأول), b (السطر التاني)", cues: { hit: 0.4, second: 0.75 },
    build: function (S, p) {
      var d = S.d, K = S.K, C = S.c, col = C.hi, rays = S.grp(310, 310, 0, 0), g = S.grp(0, 0, 620, 620);
      S.part(d.c(310, 310, 292, C.bg, { sw: 20, sc: col }) + d.c(310, 310, 252, "none", { sw: 7, sc: col, da: "4 22" }) + d.star(92, 310, 26, col, { sw: 0.01 }) + d.star(528, 310, 26, col, { sw: 0.01 }), { p: g });
      S.txt(p.a || "", 110, 110, 400, 210, 176, col, { p: g }); var b = S.txt(p.b || "", 110, 296, 400, 210, 176, C.ink, { p: g });
      S.set(g, { scale: 2.2, autoAlpha: 0, rotation: 14 }); S.set(b, { autoAlpha: 0, scale: 0.6 });
      var t = S.T("hit");
      S.to(g, { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.22, ease: "power4.in" }, t); S.shake(t + 0.22); S.sfx("stamp", t + 0.22, 1); S.sfx("sub", t + 0.22, 0);
      S.to(b, { autoAlpha: 1, scale: 1, duration: 0.26, ease: "back.out(2.6)" }, S.T("second")); S.sfx("shimmer", S.T("second"), 0);
      for (var r = 0; r < 12; r++) {
        var ray = S.box(-9, -9, 18, 70, { bg: col, r: 9, p: rays }), a = r * 30 * Math.PI / 180;
        S.set(ray, { rotation: r * 30, x: Math.sin(a) * 330, y: -Math.cos(a) * 330 - 35, scaleY: 0, transformOrigin: "50% 100%" });
        S.to(ray, { x: Math.sin(a) * 430, y: -Math.cos(a) * 430 - 35, scaleY: 1, duration: 0.22, ease: "power3.out" }, t + 0.22);
        S.to(ray, { scaleY: 0, x: Math.sin(a) * 500, y: -Math.cos(a) * 500 - 35, duration: 0.25, ease: "power2.in" }, t + 0.46);
      }
      S.to(g, { rotation: -5, scale: 1.04, duration: 0.8, ease: "sine.inOut" }, S.T("second") + 0.25);
    } });

  def("shield", { w: 440, h: 520, doc: "درع عليه علامة صح (ضمان، أمان، ثقة، حماية)", params: "label", cues: { pop: 0.2, check: 0.6 },
    build: function (S, p) {
      var d = S.d, K = S.K, sh = "M220 14L408 84V230Q408 372 220 432Q32 372 32 230V84Z", g = S.org(S.grp(0, 0, 440, 520), 220, 230);
      S.part(d.p(sh, K.n) + d.p("M220 14L408 84V230Q408 372 220 432Z", "#FFFFFF", { s: 0, op: 0.12 }) + d.p("M220 62L364 116V228Q364 334 220 384Q76 334 76 228V116Z", "none", { sw: 7, sc: K.y, da: "4 22" }) + d.p(sh, "none"), { p: g });
      var tk = S.part(d.l("M140 222l58 58 108-120", { sw: 36, sc: K.y, cls: "a" }), { p: g });
      S.pop(g, S.T("pop"), { from: 0.3, s: "pop_big" });
      S.draw(S.q(tk, ".a"), S.T("check"), 0.3, { ease: "power2.out" }); S.sfx("ding", S.T("check") + 0.2, 1); S.pulse(g, S.T("check") + 0.3, 1.08, { q: 1 });
      if (p.label) { var l = S.label(p.label, 60, 420, 320, 96, K.y, K.l); S.pop(l, S.T("check") + 0.35, {}); }
      S.stars([[40, 40, 28, K.y], [410, 380, 22, K.o]], S.T("check") + 0.3, { q: 1 });
    } });

  def("stars", { w: 780, h: 240, doc: "خمس نجوم بتتملى (تقييم، رضا العملاء، جودة)", params: "n (1-5)", cues: { fill: 0.15, done: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, n = Math.max(1, Math.min(5, p.n || 5)), ts = S.spread(5, S.T("fill"), S.T("done"));
      for (var k = 0; k < 5; k++) {
        var cx = 700 - k * 155, pts = [];
        for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5, r = i % 2 ? 32 : 72; pts.push((cx + Math.sin(a) * r).toFixed(1) + " " + (120 - Math.cos(a) * r).toFixed(1)); }
        var st = S.org(S.part(d.p("M" + pts.join("L") + "z", k < n ? K.y : K.w)), cx, 120);
        S.pop(st, ts[k], { from: 0.2, rot0: -70, s: k < n ? "mallet" : "tick", g: k - 3 });
      }
    } });

  def("trophy", { w: 440, h: 540, doc: "كاس (فوز، إنجاز، الأول)", params: "label", cues: { pop: 0.3 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.org(S.grp(0, 0, 440, 540), 220, 430), h1 = "M118 80Q30 80 40 160Q50 222 128 222", h2 = "M322 80Q410 80 400 160Q390 222 312 222";
      S.part(d.l(h1, { sw: 34 }) + d.l(h1, { sw: 14, sc: K.y }) + d.l(h2, { sw: 34 }) + d.l(h2, { sw: 14, sc: K.y }) + d.r(196, 280, 48, 84, 0, K.y) + d.r(116, 360, 208, 64, 18, K.n) + d.r(150, 378, 140, 26, 10, K.y, { sw: 6 }) +
        d.p("M106 34H334V176Q334 290 220 290Q106 290 106 176Z", K.y) + d.p("M286 40h42V176Q328 262 258 282Q286 240 286 176z", "#FFFFFF", { s: 0, op: 0.35 }) + d.p("M106 34H334V176Q334 290 220 290Q106 290 106 176Z", "none"), { p: g });
      S.txt("١", 150, 60, 140, 190, 150, K.l, { p: g });
      S.rise(g, S.T("pop"), { y: 500, s: "whoosh" }); S.sfx("bell", S.T("pop") + 0.35, 0); S.sfx("sting", S.T("pop") + 0.5, -2); S.sway(g, S.T("pop") + 0.5, 4, { rep: 3 });
      if (p.label) { var l = S.label(p.label, 60, 440, 320, 96, K.o, K.l); S.pop(l, S.T("pop") + 0.45, {}); }
      S.stars([[50, 30, 30, K.y], [400, 300, 24, K.o], [70, 330, 20, K.n]], S.T("pop") + 0.4, { q: 1 });
    } });

  def("signature", { w: 920, h: 260, doc: "اسم البراند كبير وتحته خط (توقيع، خاتمة)", params: "name", cues: { show: 0.5 },
    build: function (S, p) {
      var K = S.K, C = S.c, n = S.txt(p.name || "", 0, 0, 920, 190, 150, C.ink), u = S.box(250, 196, 420, 26, { bg: C.hi, r: 13, bd: [7, K.l] }), t = S.T("show");
      S.fade(n, t, { y: 40 }); S.sfx("sting", t + 0.05, 0); S.grow(u, t + 0.3, "x", "100% 50%", { d: 0.5 }); S.stars([[150, 40, 30, C.hi], [790, 150, 24, C.hi]], t + 0.4, { q: 1 });
    } });

  def("big_word", { w: 920, h: 460, doc: "كلمة واحدة ضخمة بتخبط الشاشة (الكلمة المفتاح، الرقم، الوعد)", params: "text, sub", cues: { hit: 0.3 },
    build: function (S, p) {
      var K = S.K, C = S.c, e1 = S.txt(p.text || "", 0, 20, 920, 320, 300, C.hi, { css: "-webkit-text-stroke:20px " + K.l + ";paint-order:stroke fill;" }), t = S.T("hit");
      S.set(e1, { scale: 2.4, autoAlpha: 0 }); S.to(e1, { scale: 1, autoAlpha: 1, duration: 0.2, ease: "power4.in" }, t);
      S.sfx("hit", t + 0.2, 1); S.sfx("sub", t + 0.2, 0); S.shake(t + 0.2);
      if (p.sub) { var l = S.label(p.sub, 210, 350, 500, 104, K.w, K.l, { size: 56 }); S.pop(l, t + 0.4, { rot0: 8, rot: -3 }); }
      S.to(e1, { scale: 1.05, duration: 1.2, ease: "sine.inOut" }, t + 0.3); S.stars([[70, 60, 34, K.y], [850, 300, 28, K.y]], t + 0.3, { q: 1 });
    } });

  def("checklist", { w: 900, h: 720, doc: "شروط أو مميزات بتدخل واحدة واحدة وتتعلّم صح (شروط الانضمام، المميزات، الخطوات)", params: "items:[{t:'النص', s:'سطر صغير فوقه'}] لحد 3, name (اسم البراند تحتهم)", cues: { first: 0.1, last: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, C = S.c, it = (p.items || []).slice(0, 3), n = it.length || 1, ts = S.spread(n, S.T("first"), S.T("last")), gap = n === 3 ? 222 : 250, chips = [];
      it.forEach(function (x, i) {
        if (typeof x === "string") x = { t: x };
        var g = S.grp(0, i * gap, 900, 200);
        S.box(0, 0, 900, 200, { bg: K.w, r: 100, bd: [10, K.l], p: g }); S.box(724, 26, 148, 148, { bg: K.n === K.w ? K.o : (i % 2 ? K.o : P(S)), r: "50%", bd: [9, K.l], p: g }); S.txt(String(i + 1), 724, 26, 130, 130, 92, i % 2 ? K.l : K.y, { p: g });
        if (x.s) { S.txt(x.s, 170, 12, 530, 66, 42, K.l, { p: g, l: 1 }); S.txt(x.t, 170, 66, 530, 116, 84, K.l, { p: g }); } else S.txt(x.t, 170, 0, 530, 180, 92, K.l, { p: g });
        var k = S.org(S.part(d.tick(92, 100, 56, K.y, K.l), { p: g }), 92, 100);
        S.slide(g, ts[i] - 0.1, 1100, { d: 0.4 }); S.set(k, { scale: 0 });
        var tk = i + 1 < n ? Math.min(ts[i + 1] - 0.2, ts[i] + 0.7) : ts[i] + 0.6;
        S.to(k, { scale: 1, duration: 0.3, ease: "back.out(3)" }, tk); S.sfx("ding", tk, i); chips.push(g);
      });
      var tl = ts[n - 1] + 0.8;
      if (p.name) { var s = S.txt(p.name, 0, n * gap + 10, 900, 170, 120, C.ink), u = S.box(240, n * gap + 176, 420, 24, { bg: C.hi, r: 12, bd: [7, K.l] }); S.fade(s, tl, { y: 40 }); S.sfx("sting", tl, 1); S.grow(u, tl + 0.3, "x", "100% 50%", { d: 0.5 }); }
      S.to(chips, { y: -10, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1, stagger: 0.2 }, tl + 0.2);
      function P(S2) { return S2.P.deep; }
    } });

  def("steps", { w: 900, h: 560, doc: "تلات خطوات مرقمة ومتوصلة بخط (إزاي تبدأ، طريقة الطلب)", params: "items:[نص,نص,نص]", cues: { first: 0.1, last: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, it = (p.items || ["سجّل", "اختار", "استلم"]).slice(0, 3), n = it.length, ts = S.spread(n, S.T("first"), S.T("last")), w = 900 / n, cols = [K.o, K.y, K.n];
      S.part(d.l("M" + (w / 2) + " 144H" + (900 - w / 2), { sw: 12, da: "4 26" }));
      var fill = S.box(w / 2, 132, 900 - w, 24, { bg: K.y, r: 12, bd: [7, K.l] }); S.set(fill, { scaleX: 0, transformOrigin: "100% 50%" }); S.to(fill, { scaleX: 1, duration: Math.max(0.4, ts[n - 1] - ts[0]), ease: "none" }, ts[0]);
      it.forEach(function (tx, i) {
        var x = 900 - (i + 1) * w, c = S.grp(x + w / 2 - 92, 52, 184, 184);
        S.box(0, 0, 184, 184, { bg: cols[i % 3], r: "50%", bd: [10, K.l], p: c }); S.txt(String(i + 1), 0, 0, 164, 164, 120, i % 3 === 2 ? K.c : K.l, { p: c });
        var l = S.box(x + 14, 290, w - 28, 160, { bg: K.w, r: 36, bd: [10, K.l] }); S.txt(tx, 10, 0, w - 68, 140, 70, K.l, { p: l });
        S.pop(c, ts[i], { s: "pop" }); S.rise(l, ts[i] + 0.12, { y: 120, q: 1 });
      });
    } });

  /* ============ building, growth, ownership ============ */
  def("building", { w: 700, h: 660, doc: "مبنى بيتبني بلوك بلوك، وبلوك ملوّن بيركب في مكانه (كيان بيبني مشروع وإنت جزء منه، فريق، نظام)", params: "label (اسم البلوك الملوّن), roof:false", cues: { build: 0.05, done: 0.45, fly: 0.6, lock: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 700, 660), t0 = S.T("build"), t1 = Math.max(t0 + 0.8, S.T("done")), n = 0;
      S.floor(640, 30, 670, { p: g });
      for (var row = 0; row < 4; row++) for (var col = 0; col < 3; col++) {
        if (row === 1 && col === 1) continue;
        var x = 105 + col * 164, y = 522 - row * 122;
        var b = S.part(d.r(x, y, 160, 118, 14, K.w) + (col === 2 ? d.r(x + 118, y + 6, 36, 106, 0, K.sh, { s: 0 }) : "") + d.r(x + 48, y + 28, 64, 62, 10, (row + col) % 2 ? K.y : K.n) + d.l("M" + (x + 60) + " " + (y + 76) + "l30-36", { sw: 7, sc: "#FFFFFF", op: 0.6 }) + d.r(x, y, 160, 118, 14, "none"), { p: g });
        S.drop(b, t0 + (t1 - t0 - 0.3) * (n / 10), { y: 420, rot0: n % 2 ? 9 : -9, d: 0.26, s: "tap", g: (n % 3) - 2 }); n++;
      }
      var hole = S.part(d.r(269, 400, 160, 118, 14, "none", { sw: 7, sc: K.o, da: "16 14" }), { p: g }); S.set(hole, { autoAlpha: 0 }); S.to(hole, { autoAlpha: 1, duration: 0.2 }, t0 + 0.5);
      if (p.roof !== false) { var roof = S.part(d.l("M350 110V60") + d.p("M350 60h70l-18 22 18 22h-70z", K.o) + d.r(70, 110, 560, 44, 22, K.o), { p: g }); S.drop(roof, t1 - 0.12, { y: 300, d: 0.22, s: "thud", g: -2 }); }
      var you = S.grp(269, 400, 160, 118, { p: g }); S.box(0, 0, 160, 118, { bg: K.o, r: 14, bd: [10, K.l], p: you }); S.txt(p.label || "إنت", 6, 0, 128, 98, 70, K.l, { p: you });
      var tf = S.T("fly"), tk = Math.max(tf + 0.35, S.T("lock"));
      S.set(you, { x: -520, y: 330, rotation: -50, autoAlpha: 0, scale: 1.5 });
      S.to(you, { autoAlpha: 1, duration: 0.1 }, tf); S.to(you, { x: -150, y: -210, rotation: -15, duration: tk - tf - 0.05, ease: "power2.out" }, tf); S.sfx("whoosh", tf + 0.1, 1);
      S.to(you, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.24, ease: "power3.in" }, tk - 0.02); S.to(hole, { autoAlpha: 0, duration: 0.05 }, tk + 0.2);
      S.shake(tk + 0.22, g); S.sfx("hit", tk + 0.22, 0); S.pulse(you, tk + 0.7, 1.2); S.stars([[40, 200, 30, K.y], [660, 60, 24, K.y]], tk + 0.3, { q: 1 });
    } });

  def("gear_tag", { w: 320, h: 330, doc: "ترس بيلف ومعاه اسم (الإدارة، النظام، التشغيل شغّال من غيرك)", params: "label", cues: { pop: 0.2, tag: 0.6 },
    build: function (S, p) {
      var d = S.d, K = S.K, pts = [], T = 8;
      for (var i = 0; i < T * 4; i++) { var a = (i + 0.5) * Math.PI / (T * 2), r = (i % 4 < 2) ? 100 : 74; pts.push((160 + Math.cos(a) * r).toFixed(1) + " " + (110 + Math.sin(a) * r).toFixed(1)); }
      var w = S.org(S.grp(0, 0, 320, 330), 160, 110), gr = S.org(S.part(d.p("M" + pts.join("L") + "z", K.y) + d.c(160, 110, 34, S.c.bg), { p: w }), 160, 110);
      S.pop(w, S.T("pop"), { from: 0.3, s: "toggle" }); S.fromTo(gr, { rotation: 0 }, { rotation: 300, duration: Math.max(1, S.t1 - S.T("pop")), ease: "none" }, S.T("pop"));
      var tag = S.grp(0, 226, 320, 96); S.label(p.label || "الإدارة", 10, 0, 300, 92, K.w, K.l, { p: tag }); S.part(d.tick(52, 46, 30, K.o, K.w), { p: tag });
      S.slide(tag, S.T("tag"), 300, { s: "pop" });
    } });

  def("wallet", { w: 460, h: 480, doc: "محفظة بتتملى كروت (محفظة عملاء، مدخرات، رصيد بيتبني)", params: "label, n (2-4)", cues: { first: 0.2, last: 0.85 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.org(S.grp(0, 0, 460, 480), 220, 470), n = Math.max(2, Math.min(4, p.n || 4)), ts = S.spread(n, S.T("first"), S.T("last"));
      S.part(d.p("M14 190a36 36 0 0 1 36-36h330a36 36 0 0 1 36 36v60H14z", JM.mix(K.n, "#000000", 0.3)), { p: g });
      var cards = S.grp(0, 0, 460, 480, { p: g });
      S.part(d.r(14, 200, 402, 266, 44, K.n) + d.r(38, 224, 354, 218, 28, "none", { sw: 6, sc: K.c, da: "4 20" }) + d.p("M330 290h100a22 22 0 0 1 22 22v44a22 22 0 0 1-22 22H330a44 44 0 0 1 0-88z", K.y) + d.c(338, 334, 15, K.l, { s: 0 }), { p: g });
      S.txt(p.label || "عملاء", 40, 250, 270, 170, 88, K.c, { p: g });
      S.rise(g, S.t0, { y: 500, s: "leather" });
      for (var c = n - 1; c >= 0; c--) {
        var cy = 150 - c * 38, cx = 60 + (c % 2) * 26, f = c % 2 ? K.y : K.w;
        var cd = S.org(S.part(d.r(cx, cy, 320, 180, 20, f) + d.c(cx + 262, cy + 54, 30, c % 2 ? K.w : K.o, { sw: 7 }) + d.l("M" + (cx + 36) + " " + (cy + 44) + "h150M" + (cx + 36) + " " + (cy + 78) + "h90", { sw: 13 }), { p: cards }), cx + 160, cy + 180);
        S.set(cd, { y: -700, rotation: c % 2 ? 16 : -16, autoAlpha: 0 });
        S.to(cd, { y: 0, rotation: c % 2 ? 4 : -4, autoAlpha: 1, duration: 0.3, ease: "power3.in" }, ts[c] - 0.2); S.sfx("card", ts[c] + 0.1, 2);
        S.fromTo(g, { scaleY: 1 }, { scaleY: 0.95, duration: 0.08, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, ts[c] + 0.1);
      }
      S.stars([[430, 110, 28, K.o], [30, 120, 22, K.y]], ts[n - 1] + 0.25, { q: 1 });
    } });

  def("share_ring", { w: 400, h: 400, doc: "حلقة نسبة بتتملى وفي نصها كلمة (حصتك، نسبتك، حقك)", params: "label, pct (0-100)", cues: { pop: 0.1, fill: 0.5, land: 0.9 },
    build: function (S, p) {
      var K = S.K, C = S.c, g = S.grp(0, 0, 400, 400), ring = S.box(0, 0, 400, 400, { r: "50%", bd: [10, K.l], p: g }), pct = p.pct || 40;
      S.box(78, 78, 244, 244, { bg: C.bg, r: "50%", bd: [10, K.l], p: g }); S.txt(p.label || "حقك", 90, 90, 220, 200, 108, C.ink, { p: g });
      S.pop(g, S.T("pop"), { from: 0.4 });
      var tf = S.T("fill"), tl = Math.max(tf + 0.5, S.T("land"));
      S.ring(ring, K.n === C.bg ? K.o : K.n, K.w, [{ to: pct * 0.3, t: S.T("pop") + 0.3, d: 0.4 }, { to: pct, t: tf, d: tl - tf, ease: "power2.inOut" }]);
      S.sfx("swell", tl, 0); S.pulse(g, tl + 0.1, 1.1, { s: "mallet", g: 1 }); S.stars([[370, 30, 28, K.o]], tl + 0.15, { q: 1 });
    } });

  def("tag", { w: 400, h: 170, doc: "ورقة متعلقة عليها شرط أو ملحوظة (حسب تعاقدك، لفترة محدودة، تطبق الشروط)", params: "label", cues: { drop: 0.3 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.org(S.grp(0, 0, 400, 170), 200, 16);
      S.part(d.l("M200 16V60", { sw: 8 }) + d.c(200, 16, 12, K.o), { p: g });
      S.box(10, 50, 380, 104, { bg: K.w, r: 22, bd: [9, K.l], p: g }); S.txt(p.label || "", 22, 50, 356, 88, 46, K.l, { p: g, l: 1 });
      S.set(g, { y: -90, rotation: -24, autoAlpha: 0 });
      S.to(g, { y: 0, rotation: 5, autoAlpha: 1, duration: 0.5, ease: "elastic.out(1,0.5)" }, S.T("drop")); S.sfx("paper", S.T("drop"), 0);
    } });

  def("badge_flip", { w: 420, h: 720, doc: "كارنيه بيقلب من كلمة لكلمة ومعاه مفتاح (وظيفة ← تمليك، موظف ← شريك، مستأجر ← مالك)", params: "a, b", cues: { a: 0.3, flip: 0.7 },
    build: function (S, p) {
      var d = S.d, K = S.K, P = S.P, g = S.org(S.grp(0, 0, 420, 720), 210, 0);
      S.part(d.p("M176 0h68l-10 150h-48z", K.o), { p: g });
      var fa = S.org(S.grp(0, 0, 420, 720, { p: g }), 210, 410), fb = S.org(S.grp(0, 0, 420, 720, { p: g }), 210, 410);
      S.part(d.r(10, 130, 400, 570, 44, K.w) + d.r(346, 136, 58, 558, 0, K.sh, { s: 0 }) + d.r(10, 130, 400, 570, 44, "none") + d.r(160, 162, 100, 28, 14, K.l, { s: 0 }) + d.c(210, 320, 84, K.y) + d.person(210, 260, 0.62, K.n, K.w) + d.l("M90 446h240M130 486h160", { sw: 14, sc: K.g }), { p: fa });
      S.txt(p.a || "وظيفتك", 30, 510, 360, 160, 100, K.l, { p: fa });
      S.part(d.r(10, 130, 400, 570, 44, P.deep) + d.r(34, 154, 352, 522, 26, "none", { sw: 6, sc: P.pop, da: "4 20" }) + d.r(160, 162, 100, 28, 14, P.pop, { s: 0 }) +
        d.r(84, 306, 150, 30, 8, P.pop) + d.r(96, 332, 28, 46, 6, P.pop) + d.r(146, 332, 28, 34, 6, P.pop) + d.c(270, 322, 62, P.pop) + d.c(270, 322, 24, P.deep), { p: fb });
      S.txt(p.b || "تمليك", 30, 440, 360, 220, 140, P.pop, { p: fb });
      S.set(g, { rotation: 10 }); S.set(fb, { scaleX: 0, autoAlpha: 0 });
      S.fromTo(g, { y: -900 }, { y: 0, duration: 0.4, ease: "power3.out" }, S.t0 + 0.05); S.sfx("thud", S.t0 + 0.4, -3);
      S.to(g, { rotation: -5, duration: 0.5, ease: "sine.inOut" }, S.t0 + 0.45); S.to(g, { rotation: 0, duration: 0.5, ease: "sine.inOut" }, S.t0 + 0.95);
      S.to(fa, { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" }, S.T("a"));
      var t = S.T("flip") - 0.05;
      S.to(fa, { scaleX: 0, duration: 0.12, ease: "power2.in" }, t); S.tsetv(fb, t + 0.12); S.to(fb, { scaleX: 1, duration: 0.3, ease: "back.out(2.4)" }, t + 0.12);
      S.sfx("card", t + 0.08, 3); S.sfx("sting", t + 0.2, 0); S.stars([[30, 150, 28, K.y], [396, 660, 24, K.o]], t + 0.35, { q: 1 });
    } });

  def("plant", { w: 340, h: 500, doc: "نبتة في قصرية بتكبر ورقة ورقة (حاجة ليك بتكبر، استثمار، نمو مع الوقت)", params: "", cues: { grow: 0.1, done: 0.9 },
    build: function (S) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 340, 500), ts = S.spread(4, S.T("grow") + 0.3, S.T("done"));
      S.floor(486, 10, 330, { p: g });
      var stem = S.org(S.part(d.l("M170 360V120", { sw: 14 }), { p: g }), 170, 360);
      var L = [[170, 300, 112, -26, K.n], [170, 262, 104, 206, K.n], [170, 204, 100, -30, K.y], [170, 160, 92, 210, K.y]].map(function (l) { return S.org(S.part(d.leaf(l[0], l[1], l[2], l[3], l[4]), { p: g }), l[0], l[1]); });
      S.part(d.p("M78 394h184l-22 92H100z", K.o) + d.p("M222 394h40l-22 92h-30z", "#000000", { s: 0, op: 0.14 }) + d.r(54, 350, 232, 48, 14, K.o) + d.l("M84 374h60", { sw: 8, sc: "#FFFFFF", op: 0.6 }), { p: g });
      S.set(g, { autoAlpha: 0, y: 80 }); S.to(g, { autoAlpha: 1, y: 0, duration: 0.3, ease: "back.out(1.6)" }, S.T("grow"));
      S.set(stem, { scaleY: 0 }); S.to(stem, { scaleY: 1, duration: 0.5, ease: "power2.out" }, S.T("grow") + 0.1);
      L.forEach(function (l, i) { S.set(l, { scale: 0 }); S.to(l, { scale: 1, duration: 0.28, ease: "back.out(2.6)" }, ts[i]); S.sfx("blip", ts[i], 1); });
      S.stars([[40, 80, 26, K.y], [300, 40, 22, K.o]], ts[3] + 0.2, { q: 1 });
    } });

  def("path_to", { w: 920, h: 720, doc: "طريق بيترسم من نقطة البداية لحد اسم البراند (ابدأ رحلتك مع…)", params: "name (اسم البراند، كلمة أو اتنين)", cues: { go: 0.05, name: 0.6, name2: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, C = S.c, pd = "M70 660C390 660 250 500 480 490S820 500 810 340", parts = String(p.name || "").split(/\s+/).filter(Boolean);
      S.part(d.l(pd, { sw: 10, da: "2 30", op: 0.35 }));
      var sv = S.part(d.l(pd, { sw: 30, cls: "a" }) + d.l(pd, { sw: 12, sc: K.y, cls: "b" }));
      var st = S.org(S.part(d.c(70, 660, 36, K.w) + d.c(70, 660, 12, K.l, { s: 0 })), 70, 660), dot = S.box(-36, -36, 72, 72, { bg: K.o, r: "50%", bd: [10, K.l] });
      S.pop(st, S.t0, {});
      var t = S.T("go"), tn = Math.max(t + 0.5, S.T("name"));
      S.draw(S.q(sv, ".a"), t, tn - t + 0.1, { ease: "power1.inOut", s: "swish" }); S.draw(S.q(sv, ".b"), t, tn - t + 0.1, { ease: "power1.inOut" }); S.follow(dot, S.q(sv, ".a"), t, tn - t + 0.1, "power1.inOut");
      var one = parts.length < 2, w1 = S.txt(one ? p.name : parts[0], one ? 0 : 440, 10, one ? 920 : 440, 250, 190, C.hi === C.card ? C.second : C.hi, {}), w2 = one ? null : S.txt(parts.slice(1).join(" "), 0, 10, 460, 250, 190, C.hi === C.card ? C.second : C.hi, {});
      S.set(w1, { autoAlpha: 0, y: 70, scale: 0.8 }); S.to(w1, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(2.2)" }, tn); S.sfx("pop_big", tn, 0);
      var tl = tn;
      if (w2) { tl = Math.max(tn + 0.2, S.T("name2")); S.set(w2, { autoAlpha: 0, y: 70, scale: 0.8 }); S.to(w2, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(2.2)" }, tl); S.sfx("pop_big", tl, 0); }
      var u = S.box(40, 262, 840, 28, { bg: K.y, r: 14, bd: [8, K.l] }); S.grow(u, tl + 0.2, "x", "100% 50%", { s: "swipe", g: -2 });
      S.to(dot, { scale: 1.5, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, tn + 0.15); S.stars([[860, 240, 30, K.o], [60, 60, 26, K.y]], tl + 0.4, { q: 1 });
    } });

  def("house", { w: 600, h: 560, doc: "بيت بيتبني (عقار، سكن، ملكية، بيتك)", params: "label", cues: { build: 0.1, roof: 0.5, door: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 600, 560);
      S.floor(530, 20, 580, { p: g });
      var body = S.org(S.part(d.r(110, 260, 380, 270, 8, K.w) + d.r(426, 266, 58, 258, 0, K.sh, { s: 0 }) + d.r(110, 260, 380, 270, 8, "none"), { p: g }), 300, 530);
      var roof = S.part(d.r(400, 90, 56, 120, 6, K.n) + d.p("M300 50L560 270H40z", K.o) + d.p("M300 50L560 270H470L300 120z", "#000000", { s: 0, op: 0.14 }) + d.p("M300 50L560 270H40z", "none"), { p: g });
      var door = S.org(S.part(d.p("M250 530V400a50 50 0 0 1 100 0v130z", K.n) + d.c(330, 460, 9, K.y, { sw: 6 }), { p: g }), 300, 530);
      var w1 = S.org(S.part(d.r(140, 330, 84, 84, 10, K.y) + d.l("M182 330v84M140 372h84", { sw: 7 }), { p: g }), 182, 372), w2 = S.org(S.part(d.r(376, 330, 84, 84, 10, K.y) + d.l("M418 330v84M376 372h84", { sw: 7 }), { p: g }), 418, 372);
      var bush = S.org(S.part(d.p("M30 530a40 40 0 0 1 20-70 44 44 0 0 1 76 16 34 34 0 0 1 4 54z", K.n), { p: g }), 80, 530);
      S.set(body, { scaleY: 0 }); S.to(body, { scaleY: 1, duration: 0.4, ease: "back.out(1.6)" }, S.T("build")); S.sfx("whoosh", S.T("build") + 0.05, 0);
      S.drop(roof, S.T("roof") - 0.3, { y: 500 });
      [w1, w2, door, bush].forEach(function (e, i) { S.pop(e, S.T("door") + i * 0.12, { s: "blip", g: i }); });
      if (p.label) { var l = S.label(p.label, 340, 0, 250, 92, K.y, K.l); S.pop(l, S.T("door") + 0.5, { rot0: 14, rot: 5, s: "mallet" }); }
      S.stars([[60, 120, 28, K.y]], S.T("door") + 0.5, { q: 1 });
    } });

  def("key", { w: 520, h: 300, doc: "مفتاح كبير بيدخل ويلف (استلام، ملكية، الحل، الدخول)", params: "", cues: { in: 0.2, turn: 0.7 },
    build: function (S) {
      var d = S.d, K = S.K, g = S.org(S.part(d.r(20, 126, 300, 50, 14, K.y) + d.r(44, 172, 50, 74, 10, K.y) + d.r(126, 172, 50, 52, 10, K.y) + d.c(400, 150, 112, K.y) + d.c(400, 150, 44, S.c.bg) + d.l("M330 96a90 90 0 0 1 70-34", { sw: 12, sc: "#FFFFFF", op: 0.7 })), 260, 150);
      S.slide(g, S.T("in"), 900, { s: "whoosh", d: 0.4 }); S.set(g, { rotation: -14 });
      S.to(g, { rotation: 20, duration: 0.3, ease: "back.out(3)" }, S.T("turn")); S.sfx("latch", S.T("turn"), 3); S.sfx("sting", S.T("turn") + 0.15, -1); S.stars([[60, 50, 28, K.o], [480, 280, 22, K.y]], S.T("turn") + 0.2, { q: 1 });
    } });

  def("lock", { w: 400, h: 500, doc: "قفل بيتفتح (فرصة اتفتحت، وصول، سر، حماية بيانات)", params: "open:false لو بيتقفل", cues: { act: 0.5 },
    build: function (S, p) {
      var d = S.d, K = S.K, arc = "M110 250V150a90 90 0 0 1 180 0v100", sh = S.org(S.part(d.l(arc, { sw: 50 }) + d.l(arc, { sw: 28, sc: K.g })), 290, 250);
      var g = S.org(S.part(d.r(30, 220, 340, 270, 50, K.y) + d.r(306, 226, 58, 258, 0, "#000000", { s: 0, op: 0.12 }) + d.r(30, 220, 340, 270, 50, "none") + d.c(200, 330, 36, K.l, { s: 0 }) + d.r(184, 340, 32, 80, 12, K.l, { s: 0 }) + d.l("M64 262h70", { sw: 9, sc: "#FFFFFF", op: 0.7 })), 200, 355);
      S.pop(S.root, S.t0, { from: 0.5 });
      var t = S.T("act");
      if (p.open === false) { S.set(sh, { y: -70 }); S.to(sh, { y: 0, duration: 0.2, ease: "power3.in" }, t); S.sfx("latch", t + 0.2, 4); S.shake(t + 0.2, g); }
      else { S.to(sh, { y: -70, rotation: 24, duration: 0.34, ease: "back.out(3)" }, t); S.sfx("latch", t, 4); S.sfx("mallet", t + 0.15, 0); S.pulse(g, t + 0.1, 1.06, { q: 1 }); S.stars([[50, 120, 28, K.o], [370, 60, 22, K.y]], t + 0.2, { q: 1 }); }
    } });

  def("door", { w: 440, h: 640, doc: "باب بيتفتح ووراه نور (فرصة، بداية جديدة، ادخل)", params: "", cues: { open: 0.5 },
    build: function (S) {
      var d = S.d, K = S.K, t = S.T("open"), rays = "";
      for (var i = 0; i < 5; i++) { var a = (-60 + i * 30) * Math.PI / 180; rays += "M" + (220 + Math.sin(a) * 60).toFixed(0) + " " + (330 - Math.cos(a) * 60).toFixed(0) + "L" + (220 + Math.sin(a) * 170).toFixed(0) + " " + (330 - Math.cos(a) * 170).toFixed(0); }
      S.floor(616, 0, 440); S.part(d.r(30, 20, 380, 596, 14, K.n) + d.r(58, 48, 324, 568, 6, K.y));
      var ry = S.part(d.l(rays, { sw: 14, sc: K.w })); S.set(ry, { autoAlpha: 0, scale: 0.5, transformOrigin: "220px 330px" });
      var leaf = S.org(S.part(d.r(58, 48, 324, 568, 6, K.o) + d.r(92, 86, 256, 220, 10, "none", { sw: 8 }) + d.r(92, 340, 256, 240, 10, "none", { sw: 8 }) + d.c(96, 330, 16, K.y, { sw: 7 })), 382, 330);
      S.rise(S.root, S.t0, { y: 300 });
      S.to(leaf, { scaleX: 0.16, duration: 0.45, ease: "power3.inOut" }, t); S.to(ry, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, t + 0.2);
      S.sfx("door", t + 0.1, 3); S.sfx("shimmer", t + 0.3, 2);
    } });
})(typeof window !== "undefined" ? window : globalThis);

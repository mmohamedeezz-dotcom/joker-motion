/* Joker Motion — scene library, part 3: selling, products, places, digital, feelings. */
(function (G) {
  "use strict";
  var JM = G.JM, def = JM.scene;

  def("shop", { w: 600, h: 600, doc: "محل بيتفتح: تندة مخططة ويافطة وباب وفاترينة (محل، مطعم، كافيه، مشروعك)", params: "label (اسم على اليافطة)", cues: { build: 0.05, open: 0.7 },
    build: function (S, p) {
      var d = S.d, K = S.K, t = S.T("build"), to = Math.max(t + 0.7, S.T("open"));
      S.floor(540, 30, 570);
      var body = S.org(S.part(d.r(110, 240, 380, 300, 0, K.w) + d.r(424, 246, 60, 288, 0, K.sh, { s: 0 }) + d.r(110, 240, 380, 300, 0, "none")), 300, 540);
      var door = S.org(S.part(d.r(150, 340, 124, 200, 8, K.n) + d.r(170, 362, 84, 76, 6, K.c) + d.c(250, 470, 9, K.y, { sw: 6 })), 212, 540);
      var win = S.org(S.part(d.r(310, 330, 150, 124, 6, K.y) + d.l("M334 430l56-78M372 436l40-56", { sw: 12, sc: "#FFFFFF", op: 0.75 }) + d.r(298, 452, 174, 20, 6, K.l, { s: 0 })), 385, 392);
      var aw = S.org(S.part(d.p("M74 160h452l34 78H40z", K.o) + d.p("M164 160l-22 78h88l8-78zM300 160v78h88l-14-78zM452 160l22 78h86l-34-78z", K.w, { s: 0 }) + d.p("M74 160h452l34 78H40z", "none") +
        d.p("M40 238a52 40 0 0 0 104 0zM248 238a52 40 0 0 0 104 0zM456 238a52 40 0 0 0 104 0z", K.o) + d.p("M144 238a52 40 0 0 0 104 0zM352 238a52 40 0 0 0 104 0z", K.w)), 300, 160);
      var sign = S.org(S.grp(0, 0, 600, 600), 300, 160);
      S.part(d.r(205, 92, 14, 70, 0, K.l, { s: 0 }) + d.r(381, 92, 14, 70, 0, K.l, { s: 0 }) + d.r(150, 30, 300, 92, 20, K.n), { p: sign });
      if (p.label) S.txt(p.label, 164, 30, 272, 82, 58, K.y, { p: sign }); else S.part(d.star(210, 76, 26, K.y) + d.l("M260 62h140M260 92h96", { sw: 13, sc: K.c }), { p: sign });
      var pot = S.org(S.part(d.leaf(530, 474, 96, -112, K.n) + d.leaf(530, 474, 84, -52, K.n) + d.p("M506 540l-14-70h76l-14 70z", K.o)), 530, 540);
      S.set(body, { scaleY: 0 }); S.to(body, { scaleY: 1, duration: 0.4, ease: "back.out(1.5)" }, t); S.sfx("whoosh", t + 0.05, 0);
      S.set(aw, { scaleY: 0, autoAlpha: 0 }); S.to(aw, { scaleY: 1, autoAlpha: 1, duration: 0.34, ease: "back.out(2.2)" }, t + 0.3); S.sfx("swipe", t + 0.34, 2);
      S.pop(door, t + 0.5, { s: "tap" }); S.pop(win, t + 0.62, { s: "blip" }); S.pop(pot, t + 0.74, { q: 1 });
      S.set(sign, { y: -200, rotation: -12, autoAlpha: 0 }); S.to(sign, { y: 0, rotation: 0, autoAlpha: 1, duration: 0.5, ease: "elastic.out(1,0.55)" }, to); S.sfx("thud", to + 0.1, 0);
      S.stars([[70, 70, 30, K.y], [550, 110, 22, K.o]], to + 0.3, { q: 1 });
    } });

  def("cart", { w: 540, h: 500, doc: "عربية تسوق والحاجات بتقع فيها (شراء، طلبات، مبيعات)", params: "n (2-4)", cues: { first: 0.2, last: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 540, 500), n = Math.max(2, Math.min(4, p.n || 3)), ts = S.spread(n, S.T("first"), S.T("last")), cols = [K.o, K.y, K.n, K.w];
      var items = S.grp(0, 0, 540, 500, { p: g });
      S.part(d.p("M126 176H500L444 354H170z", K.w) + d.l("M210 176l14 178M300 176v178M392 176l-14 178M148 264h322", { sw: 7 }) + d.l("M20 110h76l74 244", { sw: 16 }) + d.l("M170 354h274", { sw: 16 }) + d.c(196, 432, 36, K.n) + d.c(196, 432, 10, K.c, { s: 0 }) + d.c(416, 432, 36, K.n) + d.c(416, 432, 10, K.c, { s: 0 }), { p: g });
      S.floor(470, 20, 520, { p: g }); S.slide(g, S.t0, 800, { s: "whoosh", d: 0.4 });
      for (var i = 0; i < n; i++) {
        var x = 170 + i * 74, h = 120 + (i % 2) * 44, b = S.org(S.part(d.r(x, 196 - h, 92, h, 14, cols[i % 4]) + d.l("M" + (x + 20) + " " + (212 - h) + "h36", { sw: 8, sc: i % 4 === 2 ? K.c : K.l }), { p: items }), x + 46, 196);
        S.drop(b, ts[i] - 0.3, { y: 600, rot0: i % 2 ? 20 : -20, rot: i % 2 ? 6 : -6, s: "tap", g: 3 });
        S.fromTo(g, { y: 0 }, { y: 10, duration: 0.07, yoyo: true, repeat: 1, immediateRender: false }, ts[i]);
      }
      S.stars([[470, 60, 28, K.y]], ts[n - 1] + 0.2, { q: 1 });
    } });

  def("box_open", { w: 520, h: 540, doc: "صندوق بيتفتح ويطلع منه المنتج أو الهدية (عرض، منتج جديد، مفاجأة)", params: "label", cues: { open: 0.4 },
    build: function (S, p) {
      var d = S.d, K = S.K, t = S.T("open"), out = S.grp(110, 170, 300, 190);
      S.box(0, 0, 300, 190, { bg: K.o, r: 30, bd: [10, K.l], p: out }); S.txt(p.label || "جديد", 10, 0, 260, 170, 96, K.l, { p: out });
      S.floor(520, 20, 500); S.part(d.r(60, 270, 400, 250, 10, K.y) + d.r(396, 276, 58, 238, 0, "#000000", { s: 0, op: 0.12 }) + d.r(60, 270, 400, 250, 10, "none") + d.r(236, 270, 48, 250, 0, K.w) + d.r(160, 400, 200, 60, 12, K.w, { sw: 7 }) + d.l("M184 430h150", { sw: 8, sc: K.g }));
      var lidL = S.org(S.part(d.p("M40 230h230v44H40z", K.y)), 40, 274), lidR = S.org(S.part(d.p("M250 230h230v44H250z", K.y)), 480, 274);
      S.rise(S.root, S.t0, { y: 400 }); S.set(out, { y: 160, scale: 0.4, autoAlpha: 0 });
      S.to(lidL, { rotation: -116, duration: 0.3, ease: "back.out(2)" }, t); S.to(lidR, { rotation: 116, duration: 0.3, ease: "back.out(2)" }, t); S.sfx("pop_big", t, 0);
      S.to(out, { y: -150, scale: 1, autoAlpha: 1, rotation: -6, duration: 0.45, ease: "back.out(2)" }, t + 0.12);
      S.sway(out, t + 0.7, 5, { rep: 3 }); S.stars([[70, 110, 30, K.y], [460, 60, 26, K.o], [470, 200, 20, K.n]], t + 0.3, {});
    } });

  def("laptop", { w: 680, h: 480, doc: "لابتوب والشاشة فيها شغل بيتبني (شغل أونلاين، داشبورد، موقع)", params: "", cues: { on: 0.2, done: 0.85 },
    build: function (S) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 680, 480), ts = S.spread(4, S.T("on") + 0.2, S.T("done")), cols = [K.n, K.y, K.o, K.n];
      S.part(d.r(80, 14, 520, 370, 30, K.l, { s: 0 }) + d.r(104, 38, 472, 318, 12, K.w, { s: 0 }) + d.r(104, 38, 472, 54, 12, K.sh, { s: 0 }) + d.c(134, 65, 9, K.o, { s: 0 }) + d.c(162, 65, 9, K.y, { s: 0 }) + d.c(190, 65, 9, K.n, { s: 0 }) +
        d.p("M10 384h660l-30 70a16 16 0 0 1-14 8H54a16 16 0 0 1-14-8z", K.w) + d.r(276, 384, 128, 20, 10, K.g, { s: 0 }) + d.l("M150 330h380", { sw: 6, sc: K.g }), { p: g });
      S.rise(g, S.t0, { y: 500 });
      [230, 150, 210, 120].forEach(function (h, i) { var e = S.box(160 + i * 96, 330 - h, 70, h, { bg: cols[i], r: "12px 12px 0 0", bd: [8, K.l], p: g }); S.grow(e, ts[i], "y", "50% 100%", { d: 0.3, ease: "back.out(2)", s: "blip", g: i - 1 }); });
      S.stars([[640, 40, 28, K.y]], ts[3] + 0.2, { q: 1 });
    } });

  def("search", { w: 760, h: 300, doc: "خانة بحث بيتكتب فيها وعدسة (العميل بيدوّر، سؤال شائع، جوجل)", params: "text", cues: { type: 0.15, done: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 760, 300), t = S.T("type"), dur = Math.max(0.5, S.T("done") - t);
      S.box(0, 60, 760, 180, { bg: K.w, r: 90, bd: [10, K.l], p: g }); S.part(d.c(100, 144, 40, K.y) + d.l("M130 174l40 40", { sw: 18 }), { p: g });
      var m = S.grp(200, 66, 520, 168, { p: g, css: "overflow:hidden;" }); S.txt(p.text || "", 0, 0, 520, 168, 84, K.l, { p: m }); var cover = S.box(0, 0, 520, 168, { bg: K.w, p: m });
      S.rise(g, S.t0, { y: 300, s: "pop" });
      S.set(cover, { transformOrigin: "0% 50%" }); S.to(cover, { scaleX: 0, duration: dur, ease: "steps(8)" }, t);
      for (var i = 0; i < 6; i++) S.sfx("key", t + dur * i / 6, 0);
      S.pulse(g, t + dur + 0.1, 1.05, { s: "ding", g: -2 }); S.stars([[700, 30, 28, K.o]], t + dur + 0.1, { q: 1 });
    } });

  def("pin", { w: 460, h: 620, doc: "علامة مكان بتقع على الخريطة (الموقع، الفرع، منطقتك)", params: "label", cues: { drop: 0.3 },
    build: function (S, p) {
      var d = S.d, K = S.K, t = S.T("drop");
      for (var i = 0; i < 2; i++) { var r = S.org(S.part(d.e(230, 560, 100 + i * 60, 30 + i * 16, "none", { sw: 8 })), 230, 560); S.set(r, { scale: 0, autoAlpha: 1 }); S.to(r, { scale: 1, autoAlpha: 0, duration: 0.8, ease: "power2.out", repeat: 2, repeatDelay: 0.1 }, t + 0.3 + i * 0.15); }
      var g = S.org(S.part(d.p("M230 560C150 430 100 370 100 270A130 130 0 0 1 360 270C360 370 310 430 230 560Z", K.o) + d.p("M230 150A130 130 0 0 1 360 270C360 370 310 430 230 560C290 420 300 360 300 270A80 80 0 0 0 230 150z", "#000000", { s: 0, op: 0.14 }) + d.c(230, 270, 54, K.w)), 230, 560);
      S.drop(g, t, { y: 700, s: "thud", g: 2 });
      if (p.label) { var l = S.label(p.label, 60, 20, 340, 100, K.n, K.c); S.pop(l, t + 0.5, { rot0: -10, rot: -4 }); }
      S.stars([[60, 200, 28, K.y], [410, 420, 22, K.y]], t + 0.4, { q: 1 });
    } });

  def("bulb", { w: 420, h: 540, doc: "لمبة بتنوّر (فكرة، حل، لحظة فهم)", params: "", cues: { on: 0.5 },
    build: function (S) {
      var d = S.d, K = S.K, t = S.T("on"), g = S.org(S.grp(0, 0, 420, 540), 210, 300), gl = "M210 90A140 140 0 0 1 300 340Q286 356 286 384H134Q134 356 120 340A140 140 0 0 1 210 90Z";
      S.part(d.p(gl, K.w) + d.l("M176 384V300l34-40 34 40v84", { sw: 8 }), { p: g });
      var lit = S.part(d.p(gl, K.y) + d.l("M176 384V300l34-40 34 40v84", { sw: 8 }) + d.l("M134 190a84 84 0 0 1 50-50", { sw: 12, sc: "#FFFFFF", op: 0.8 }), { p: g });
      S.part(d.r(134, 384, 152, 46, 12, K.g) + d.l("M140 408h140", { sw: 7 }) + d.r(156, 430, 108, 36, 10, K.g) + d.p("M176 466h68l-12 30h-44z", K.l), { p: g });
      S.pop(g, S.t0, { from: 0.4 }); S.set(lit, { autoAlpha: 0 });
      S.to(lit, { autoAlpha: 1, duration: 0.1 }, t); S.sfx("toggle", t, 3); S.sfx("shimmer", t + 0.08, 3); S.pulse(g, t, 1.1, { q: 1 });
      var rays = "";
      for (var i = 0; i < 7; i++) { var a = (-90 + i * 30) * Math.PI / 180; rays += "M" + (210 + Math.sin(a) * 170).toFixed(0) + " " + (230 - Math.cos(a) * 170).toFixed(0) + "L" + (210 + Math.sin(a) * 214).toFixed(0) + " " + (230 - Math.cos(a) * 214).toFixed(0); }
      var ry = S.part(d.l(rays, { sw: 14 })); S.set(ry, { scale: 0.6, autoAlpha: 0, transformOrigin: "210px 230px" }); S.to(ry, { scale: 1, autoAlpha: 1, duration: 0.25, ease: "back.out(3)" }, t + 0.05);
    } });

  def("rocket", { w: 420, h: 660, doc: "صاروخ بيطلع (انطلاقة، نمو سريع، بداية قوية)", params: "", cues: { go: 0.55 },
    build: function (S) {
      var d = S.d, K = S.K, t = S.T("go"), g = S.grp(0, 0, 420, 660), bd = "M210 60c70 70 100 170 100 260v130a16 16 0 0 1-16 16H126a16 16 0 0 1-16-16V320c0-90 30-190 100-260z";
      var fl = S.org(S.part(d.p("M160 470c-10 50 10 90 50 120 40-30 60-70 50-120z", K.y) + d.p("M186 470c-4 30 6 52 24 70 18-18 28-40 24-70z", K.o, { sw: 7 }), { p: g }), 210, 470);
      S.part(d.p("M126 350l-66 90 30 56 60-40zM294 350l66 90-30 56-60-40z", K.o) + d.p(bd, K.w) + d.p("M262 170c30 50 42 110 42 160v124h-38z", K.sh, { s: 0 }) + d.p(bd, "none") +
        d.p("M210 60c-32 32-56 70-72 110h144c-16-40-40-78-72-110z", K.o) + d.c(210, 270, 52, K.n) + d.l("M186 256a30 30 0 0 1 30-18", { sw: 10, sc: K.c }) + d.l("M110 420h200") + d.r(180, 352, 60, 16, 8, K.l, { s: 0 }), { p: g });
      S.rise(g, S.t0, { y: 500 }); S.set(fl, { scaleY: 0.3 });
      S.fromTo(g, { x: -5 }, { x: 5, duration: 0.05, yoyo: true, repeat: Math.max(2, Math.round((t - S.t0 - 0.5) / 0.05)), ease: "none", immediateRender: false }, S.t0 + 0.45);
      S.to(fl, { scaleY: 1.3, duration: 0.2 }, t - 0.2); S.sfx("swell", t, 3);
      S.to(g, { y: -1300, duration: 0.6, ease: "power3.in" }, t); S.to(g, { autoAlpha: 0, duration: 0.1 }, t + 0.52); S.sfx("whoosh", t + 0.3, 4);
      [[60, 560, 0.9], [240, 580, 0.8]].forEach(function (c, i) { var cl = S.org(S.part(d.cloud(c[0], c[1] - 60, c[2])), c[0] + 80, c[1]); S.set(cl, { scale: 0 }); S.to(cl, { scale: 1.3, duration: 0.4, ease: "back.out(2)" }, t + i * 0.08); });
    } });

  def("heart", { w: 440, h: 420, doc: "قلب بينبض (حب العملاء، إعجاب، اهتمام، صحة)", params: "", cues: { beat: 0.3 },
    build: function (S) {
      var d = S.d, K = S.K, hp = "M220 380C60 260 30 180 30 130A95 95 0 0 1 220 110A95 95 0 0 1 410 130C410 180 380 260 220 380Z";
      var g = S.org(S.part(d.p(hp, K.o) + d.p("M320 40A95 95 0 0 1 410 130C410 180 380 260 220 380C330 250 350 180 350 130A80 80 0 0 0 320 40z", "#000000", { s: 0, op: 0.14 }) + d.p(hp, "none") + d.l("M80 130a56 56 0 0 1 50-56", { sw: 14, sc: "#FFFFFF", op: 0.8 })), 220, 220);
      S.pop(g, S.t0, { from: 0.3 });
      var t = S.T("beat"), n = Math.max(2, Math.min(6, Math.floor((S.t1 - t) / 0.55)));
      for (var i = 0; i < n; i++) S.pulse(g, t + i * 0.55, 1.16, { s: "boop", g: i ? -3 : 1 });
      S.stars([[40, 40, 26, K.y], [410, 330, 22, K.y]], t + 0.1, { q: 1 });
    } });

  def("gift", { w: 460, h: 520, doc: "هدية بتنط وشريطها بيتفك (هدية، بونص، عرض مجاني)", params: "", cues: { pop: 0.4 },
    build: function (S) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 460, 520), t = S.T("pop");
      S.floor(504, 20, 440, { p: g });
      S.part(d.r(60, 230, 340, 270, 12, K.o) + d.r(340, 236, 54, 258, 0, "#000000", { s: 0, op: 0.12 }) + d.r(60, 230, 340, 270, 12, "none") + d.r(200, 230, 60, 270, 0, K.y), { p: g });
      var lid = S.org(S.part(d.r(30, 150, 400, 90, 16, K.o) + d.r(196, 150, 68, 90, 0, K.y) + d.p("M230 150C180 60 100 70 110 120S190 150 230 150zM230 150C280 60 360 70 350 120S270 150 230 150z", K.y) + d.c(230, 146, 20, K.y), { p: g }), 230, 240);
      S.rise(g, S.t0, { y: 500 });
      S.to(lid, { y: -80, rotation: -10, duration: 0.3, ease: "back.out(3)" }, t); S.sfx("pop_big", t, 0);
      for (var i = 0; i < 8; i++) { var c = S.box(215, 220, 30, 30, { bg: [K.y, K.n, K.w][i % 3], r: i % 3 ? "50%" : 6, bd: [6, K.l] }), a = (-70 + i * 20) * Math.PI / 180; S.set(c, { autoAlpha: 0 }); S.to(c, { autoAlpha: 1, x: Math.sin(a) * (180 + i * 14), y: -Math.cos(a) * 260, rotation: 200, duration: 0.5, ease: "power2.out" }, t + 0.05); S.to(c, { y: "+=160", autoAlpha: 0, duration: 0.5, ease: "power2.in" }, t + 0.55); }
      S.stars([[60, 80, 30, K.y], [410, 60, 24, K.y]], t + 0.1, {});
    } });

  def("hourglass", { w: 360, h: 520, doc: "ساعة رملية بتقلب (العرض هيخلص، استنى، وقت محدود)", params: "", cues: { flip: 0.6 },
    build: function (S) {
      var d = S.d, K = S.K, g = S.org(S.grp(0, 0, 360, 520), 180, 260), gl = "M60 50H300V120Q300 200 196 260Q300 320 300 400V470H60V400Q60 320 164 260Q60 200 60 120Z";
      S.part(d.p(gl, K.w) + d.p("M92 404Q180 330 268 404V464H92Z", K.o, { s: 0 }) + d.l("M180 262V400", { sw: 9, sc: K.o }), { p: g });
      var top = S.org(S.part(d.p("M100 110H260Q250 160 180 200Q110 160 100 110Z", K.o, { s: 0 }), { p: g }), 180, 200);
      S.part(d.p(gl, "none") + d.r(26, 14, 308, 44, 16, K.n) + d.r(26, 462, 308, 44, 16, K.n) + d.l("M92 130q4 40 40 70", { sw: 9, sc: K.g }), { p: g });
      S.pop(g, S.t0, { from: 0.4 });
      S.to(top, { scaleY: 0.2, duration: Math.max(0.5, S.T("flip") - S.t0 - 0.3), ease: "none" }, S.t0 + 0.3);
      S.to(g, { rotation: 180, duration: 0.5, ease: "back.inOut(1.6)" }, S.T("flip")); S.sfx("swipe", S.T("flip") + 0.2, 3); S.sfx("thud", S.T("flip") + 0.5, -2);
    } });

  def("quote", { w: 860, h: 480, doc: "كارت اقتباس أو رأي عميل (شهادة، رأي، جملة مهمة)", params: "text, by", cues: { show: 0.2 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 860, 480);
      S.box(0, 60, 860, 400, { bg: K.w, r: 50, bd: [10, K.l], p: g }); S.part(d.c(740, 70, 70, K.o) + d.p("M700 86q0-40 34-52v24q-12 8-12 20h14v32h-36zM752 86q0-40 34-52v24q-12 8-12 20h14v32h-36z", K.l, { s: 0 }), { p: g });
      S.txt(p.text || "", 50, 130, 740, 210, 76, K.l, { p: g, wrap: 1 });
      if (p.by) S.label(p.by, 40, 350, 330, 96, K.y, K.l, { p: g });
      S.part(d.star(96, 120, 20, K.y) + d.star(146, 120, 20, K.y) + d.star(196, 120, 20, K.y), { p: g });
      S.set(g, { rotation: -2 }); S.rise(g, S.T("show"), { y: 500 }); S.sway(g, S.T("show") + 0.6, 1.5);
    } });

  def("toggle", { w: 520, h: 300, doc: "زرار بيتحول من مقفول لمفتوح (فعّل، ابدأ، شغّل)", params: "label", cues: { on: 0.5 },
    build: function (S, p) {
      var K = S.K, tr = S.box(60, 30, 400, 190, { bg: K.g, r: 95, bd: [10, K.l] }), k = S.box(82, 52, 146, 146, { bg: K.w, r: "50%", bd: [10, K.l] }), t = S.T("on");
      S.pop(S.root, S.t0, { from: 0.5 });
      S.to(k, { x: 210, duration: 0.24, ease: "back.out(2.4)" }, t); S.to(tr, { backgroundColor: K.o, duration: 0.16 }, t); S.sfx("toggle", t, 4); S.sfx("ding", t + 0.12, -2);
      if (p.label) S.txt(p.label, 0, 226, 520, 74, 50, S.c.ink, { l: 1 });
      S.stars([[30, 30, 26, K.y], [490, 230, 22, K.y]], t + 0.15, { q: 1 });
    } });

  def("delivery", { w: 680, h: 440, doc: "عربية توصيل بتدخل وتقف (توصيل، شحن، خدمة لحد البيت)", params: "label (على جنب العربية)", cues: { in: 0.1, stop: 0.6 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 680, 440), t = S.T("in"), ts = Math.max(t + 0.5, S.T("stop"));
      S.floor(400, 10, 670);
      S.part(d.r(40, 90, 380, 250, 18, K.o) + d.r(40, 290, 380, 50, 0, "#000000", { s: 0, op: 0.12 }) + d.r(40, 90, 380, 250, 18, "none") + d.p("M420 160h120l90 90v90H420z", K.w) + d.p("M450 190h78l56 60H450z", K.y) + d.l("M470 240l30-40", { sw: 8, sc: "#FFFFFF", op: 0.7 }) + d.r(600, 290, 36, 26, 8, K.y, { sw: 6 }) + d.r(20, 330, 630, 26, 10, K.n), { p: g });
      if (p.label) S.txt(p.label, 60, 120, 340, 150, 84, K.l, { p: g });
      var w1 = S.org(S.part(d.c(150, 360, 50, K.l) + d.c(150, 360, 20, K.c, { s: 0 }) + d.l("M150 330v60", { sw: 6, sc: K.g }), { p: g }), 150, 360), w2 = S.org(S.part(d.c(520, 360, 50, K.l) + d.c(520, 360, 20, K.c, { s: 0 }) + d.l("M520 330v60", { sw: 6, sc: K.g }), { p: g }), 520, 360);
      var ln = S.part(d.l("M-10 150h-90M-10 220h-140M-10 290h-70", { sw: 12 }), { p: g });
      S.set(g, { x: -1100 }); S.to(g, { x: 0, duration: ts - t, ease: "power3.out" }, t); S.sfx("whoosh", t + 0.15, 3);
      S.fromTo([w1, w2], { rotation: -720 }, { rotation: 0, duration: ts - t, ease: "power3.out", immediateRender: false }, t); S.to(ln, { autoAlpha: 0, duration: 0.2 }, ts - 0.1);
      S.fromTo(g, { rotation: 0 }, { rotation: 2.5, duration: 0.12, yoyo: true, repeat: 1, transformOrigin: "50% 100%", immediateRender: false }, ts); S.sfx("thud", ts, -2); S.stars([[640, 100, 28, K.y]], ts + 0.15, { q: 1 });
    } });
})(typeof window !== "undefined" ? window : globalThis);

/* Joker Motion — scene library, part 1: money, time, numbers, work, people, comparison.
   Drawing language: heavy ink line, flat palette fills (S.K), a shade strip, a highlight, a hard shadow (engine), small
   side details. Every moving piece is its own S.part so it can arrive on its own word. */
(function (G) {
  "use strict";
  var JM = G.JM, def = JM.scene;

  def("calendar", { w: 400, h: 450, doc: "تقويم بيقلب من كلمة لكلمة (النهارده ← بكرة، قبل ← بعد)", params: "a, b", cues: { flip: 0.5 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 400, 450);
      S.part(d.r(20, 60, 360, 370, 36, K.w) + d.r(312, 156, 62, 268, 0, K.sh, { s: 0 }) + d.p("M20 156V96a36 36 0 0 1 36-36h288a36 36 0 0 1 36 36v60z", K.n) +
        d.r(60, 372, 44, 26, 8, K.g, { s: 0 }) + d.r(120, 372, 44, 26, 8, K.g, { s: 0 }) + d.r(180, 372, 44, 26, 8, K.g, { s: 0 }) + d.r(240, 372, 44, 26, 8, K.g, { s: 0 }) +
        d.r(20, 60, 360, 370, 36, "none"), { p: g });
      var hot = S.part(d.p("M20 156V96a36 36 0 0 1 36-36h288a36 36 0 0 1 36 36v60z", K.o), { p: g });
      S.part(d.r(92, 22, 28, 80, 14, K.w) + d.r(280, 22, 28, 80, 14, K.w), { p: g });
      var a = S.txt(p.a || "النهارده", 30, 170, 340, 190, 100, K.l, { p: g }), b = S.txt(p.b || "بكرة", 30, 170, 340, 190, 136, K.o, { p: g });
      S.set(g, { rotation: -4 }); S.set(b, { scaleY: 0, transformOrigin: "50% 0%" }); S.set(a, { transformOrigin: "50% 0%" }); S.set(hot, { autoAlpha: 0 });
      S.fromTo(g, { y: 60 }, { y: 0, duration: 0.6, ease: "back.out(1.6)" }, S.t0);
      var t = S.T("flip");
      S.to(a, { scaleY: 0, duration: 0.12, ease: "power2.in" }, t); S.to(b, { scaleY: 1, duration: 0.3, ease: "back.out(2.4)" }, t + 0.12);
      S.to(hot, { autoAlpha: 1, duration: 0.12 }, t + 0.12); S.to(g, { rotation: 3, duration: 0.3, ease: "back.out(3)" }, t + 0.12);
      S.sfx("paper", t + 0.07, 2); S.sfx("boop", t + 0.2, 0); S.stars([[360, 40, 26, K.y]], t + 0.25, { q: 1 });
    } });

  def("bars", { w: 440, h: 470, doc: "عمودين بيتقارنوا، والتاني بيعدّي الأول (المصاريف أعلى من الدخل، الطلب أعلى من العرض)", params: "labels:[أ,ب]", cues: { grow: 0.45, hit: 0.85 },
    build: function (S, p) {
      var d = S.d, K = S.K, L = p.labels || ["دخلك", "مصاريفك"];
      var b1 = S.box(40, 0, 150, 250, { bg: K.n, r: "20px 20px 0 0", bd: [10, K.l], css: "top:auto;bottom:86px;" }), b2 = S.box(250, 0, 150, 170, { bg: K.o, r: "20px 20px 0 0", bd: [10, K.l], css: "top:auto;bottom:86px;" });
      S.box(18, 14, 22, 9999, { bg: "rgba(255,255,255,0.28)", r: 11, p: b1, css: "height:auto;bottom:0;" }); S.box(18, 14, 22, 9999, { bg: "rgba(255,255,255,0.38)", r: 11, p: b2, css: "height:auto;bottom:0;" });
      S.floor(384, 6, 434);
      S.label(L[0], 14, 402, 200, 64, K.w, K.l); S.label(L[1], 226, 402, 208, 64, K.w, K.l);
      var dash = S.part(d.l("M10 130H430", { sw: 8, da: "22 20" })), x = S.org(S.part(d.cross(325, 40, 44, K.w, K.o)), 325, 40);
      S.set(x, { scale: 0 }); S.org(dash, 10, 130); S.set(dash, { scaleX: 0 });
      S.fromTo(b1, { height: 90 }, { height: 250, duration: 0.7, ease: "power3.out" }, S.t0); S.fromTo(b2, { height: 60 }, { height: 170, duration: 0.8, ease: "power3.out" }, S.t0 + 0.1);
      S.to(dash, { scaleX: 1, duration: 0.4, ease: "power2.out" }, S.t0 + 0.55); S.sfx("swipe", S.t0 + 0.6, -5);
      var tg = S.T("grow"), th = S.T("hit");
      S.to(b2, { height: 290, duration: 0.4, ease: "power2.out" }, tg + 0.1);
      S.to(b2, { height: 372, duration: 0.34, ease: "back.out(2.6)" }, th); S.sfx("whoosh", th, -2);
      S.to(x, { scale: 1, duration: 0.3, ease: "back.out(3)" }, th + 0.2); S.sfx("hit", th + 0.2, 0); S.shake(th + 0.2, S.root, "x");
      S.to(b1, { height: 232, duration: 0.5, ease: "power1.inOut" }, th + 0.4);
    } });

  def("counter", { w: 680, h: 440, doc: "رقم كبير بيعدّ لحد قيمته (نسبة، عدد عملاء، مبلغ)", params: "from, to, prefix, suffix, label", cues: { count: 0.2, land: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, to = p.to == null ? 100 : p.to, pre = p.prefix || "", suf = p.suffix || "", g = S.grp(0, 0, 680, 440);
      S.part(d.r(20, 30, 640, 290, 50, K.n) + d.r(46, 56, 588, 238, 30, "none", { sw: 6, sc: K.c, da: "4 20" }) + d.c(74, 84, 10, K.y, { s: 0 }) + d.c(606, 84, 10, K.y, { s: 0 }), { p: g });
      var n = S.txt(pre + to + suf, 40, 40, 600, 270, 220, K.y, { p: g });
      S.rise(g, S.t0); S.fade(n, S.t0 + 0.2);
      var t = S.T("count"), tl = Math.max(t + 0.4, S.T("land"));
      S.count(n, p.from || 0, to, t, tl - t, function (v) { return pre + v + suf; });
      for (var k = 0; k < 6; k++) S.sfx("tick", t + (tl - t) * k / 6, -2);
      S.pulse(n, tl, 1.12, { s: "mallet" });
      var lab = S.label(p.label || "", 130, 296, 420, 110, K.o, K.l, { size: 56 }); S.pop(lab, tl + 0.1, { rot0: -8, rot: -3 });
      S.stars([[60, 10, 30, K.y], [640, 360, 24, K.o]], tl + 0.15, { q: 1 });
    } });

  def("percent", { w: 520, h: 520, doc: "ختم خصم أو نسبة بيلف ويخبط (عرض، خصم، عمولة)", params: "value:'50%', label", cues: { hit: 0.4 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 520, 520), pts = [];
      for (var i = 0; i < 28; i++) { var a = i * Math.PI / 14, r = i % 2 ? 212 : 248; pts.push((260 + Math.sin(a) * r).toFixed(1) + " " + (260 - Math.cos(a) * r).toFixed(1)); }
      S.part(d.p("M" + pts.join("L") + "z", K.o) + d.c(260, 260, 176, "none", { sw: 6, da: "4 20" }), { p: g });
      S.txt(p.value || "50%", 50, 120, 420, 200, 200, K.l, { p: g }); S.txt(p.label || "خصم", 100, 300, 320, 100, 74, K.l, { p: g });
      var t = S.T("hit");
      S.set(g, { scale: 2.4, autoAlpha: 0, rotation: 40 });
      S.to(g, { scale: 1, autoAlpha: 1, rotation: -10, duration: 0.24, ease: "power4.in" }, t); S.sfx("stamp", t + 0.24, 0); S.sfx("sub", t + 0.24, 0); S.shake(t + 0.24);
      S.to(g, { rotation: -4, scale: 1.05, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 3 }, t + 0.4);
      S.stars([[40, 60, 30, K.y], [480, 470, 26, K.y]], t + 0.3, { q: 1 });
    } });

  def("coins", { w: 460, h: 520, doc: "عملات بتترص فوق بعض (فلوس بتتجمع، دخل بيزيد)", params: "n (3-7), label", cues: { stack: 0.15, land: 0.9 },
    build: function (S, p) {
      var d = S.d, K = S.K, n = Math.max(3, Math.min(7, p.n || 5)), ts = S.spread(n, S.T("stack"), S.T("land"));
      S.floor(486, 20, 440);
      for (var i = 0; i < n; i++) {
        var cx = 220 + (i % 2 ? 12 : -8), cy = 440 - i * 52;
        var c = S.part(d.p("M" + (cx - 130) + " " + cy + "v26a130 34 0 0 0 260 0v-26z", K.y) + d.l("M" + (cx - 70) + " " + (cy + 30) + "v22M" + cx + " " + (cy + 36) + "v22M" + (cx + 70) + " " + (cy + 30) + "v22", { sw: 6 }) + d.e(cx, cy, 130, 34, K.y) + d.e(cx, cy, 84, 18, K.w, { sw: 7 }));
        S.drop(c, ts[i] - 0.3, { y: 600, rot0: i % 2 ? 10 : -10, s: "coin", g: i - 2 });
      }
      if (p.label) { var l = S.label(p.label, 236, 20, 220, 92, K.n, K.c); S.pop(l, ts[n - 1] + 0.1, { rot0: 14, rot: 6, s: "mallet" }); }
      S.stars([[60, 150, 30, K.o], [400, 250, 22, K.y]], ts[n - 1] + 0.2, { q: 1 });
    } });

  def("bill", { w: 560, h: 380, doc: "ورقة فلوس بتدخل أو بتطير (مصروف، مرتب، عمولة)", params: "value, label, out:true لو بتطير", cues: { go: 0.5 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 560, 380);
      S.part(d.r(40, 40, 500, 250, 28, K.w, { t: "rotate(-7 290 165)" }) + d.r(14, 76, 532, 262, 30, K.y) + d.r(40, 102, 480, 210, 16, "none", { sw: 6, da: "4 18" }) + d.c(280, 207, 70, K.w) + d.c(84, 146, 16, K.l, { s: 0 }) + d.c(476, 268, 16, K.l, { s: 0 }), { p: g });
      S.txt(p.value || "$", 210, 137, 140, 140, 96, K.l, { p: g });
      if (p.label) { var l = S.label(p.label, 330, 286, 220, 84, K.n, K.c, { p: g }); S.set(l, { rotation: -4 }); }
      S.slide(g, S.t0, p.out ? 0 : 900, { s: "paper" }); S.set(g, { rotation: -4 });
      var t = S.T("go");
      if (p.out) { S.to(g, { x: -1100, y: -300, rotation: -38, duration: 0.5, ease: "power2.in" }, t); S.sfx("whoosh", t + 0.2, 2); }
      else { S.pulse(g, t, 1.1, { s: "mallet" }); S.sway(g, t + 0.3, 3); S.stars([[30, 40, 26, K.o]], t + 0.1, { q: 1 }); }
    } });

  def("clock", { w: 440, h: 470, doc: "ساعة منبّه عقاربها بتجري (الوقت بيعدّي، استعجال، ميعاد)", params: "label", cues: { spin: 0.2 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 440, 470), ticks = "";
      for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6, r0 = i % 3 ? 150 : 138; ticks += "M" + (220 + Math.sin(a) * r0).toFixed(1) + " " + (240 - Math.cos(a) * r0).toFixed(1) + "L" + (220 + Math.sin(a) * 166).toFixed(1) + " " + (240 - Math.cos(a) * 166).toFixed(1); }
      S.part(d.l("M110 400l-34 50M330 400l34 50") + d.c(98, 82, 46, K.o) + d.c(342, 82, 46, K.o) + d.r(200, 22, 40, 34, 10, K.l, { s: 0 }) + d.c(220, 240, 196, K.w) +
        d.p("M330 78A196 196 0 0 1 330 402A230 230 0 0 0 330 78z", K.sh, { s: 0 }) + d.c(220, 240, 196, "none") + d.l(ticks, { sw: 9 }), { p: g });
      var h = S.org(S.part(d.l("M220 240V140", { sw: 18 }), { p: g }), 220, 240), mn = S.org(S.part(d.l("M220 240V92", { sw: 12, sc: K.o }), { p: g }), 220, 240);
      S.part(d.c(220, 240, 18, K.l, { s: 0 }) + d.c(220, 240, 7, K.y, { s: 0 }), { p: g });
      S.pop(g, S.t0, { from: 0.4 });
      var t = S.T("spin"), dur = Math.max(0.8, S.t1 - t - 0.2);
      S.to(mn, { rotation: 1080, duration: dur, ease: "power1.inOut" }, t); S.to(h, { rotation: 150, duration: dur, ease: "power1.inOut" }, t);
      for (var k = 0; k < 5; k++) S.sfx("tick", t + dur * k / 5, -3);
      S.fromTo(g, { rotation: -3 }, { rotation: 3, duration: 0.07, yoyo: true, repeat: 9, ease: "none", immediateRender: false }, t + dur * 0.75);
      if (p.label) { var l = S.label(p.label, 100, 392, 240, 76, K.y, K.l); S.pop(l, t + 0.3, {}); }
    } });

  def("chart_line", { w: 720, h: 500, doc: "لوحة عليها خط بياني طالع (نمو، مبيعات، تطور)", params: "label, down:true لو نازل", cues: { draw: 0.2, peak: 0.85 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 720, 500), path = p.down ? "M90 130L230 220L350 180L490 330L640 400" : "M90 400L230 300L350 340L490 180L640 100", ey = p.down ? 400 : 100;
      S.part(d.r(20, 20, 680, 440, 36, K.w) + d.r(636, 26, 58, 428, 0, K.sh, { s: 0 }) + d.l("M70 130H650M70 220H650M70 310H650", { sw: 5, sc: K.g, da: "2 16" }) + d.l("M70 60V410H656") + d.r(20, 20, 680, 440, 36, "none"), { p: g });
      [[130, 90], [270, 150], [410, 110], [550, 200]].forEach(function (b) { S.part(d.r(b[0], 410 - b[1], 70, b[1], 10, K.sh, { s: 0 }), { p: g }); });
      var sv = S.part(d.l(path, { sw: 20, sc: K.o, cls: "a" }), { p: g });
      S.rise(g, S.t0, { y: 500 });
      var t = S.T("draw"), tp = Math.max(t + 0.5, S.T("peak"));
      S.draw(S.q(sv, ".a"), t, tp - t, { s: "swish" });
      var dot = S.org(S.part(d.c(640, ey, 30, K.y), { p: g }), 640, ey); S.pop(dot, tp, { s: "mallet" });
      if (p.label) { var l = S.label(p.label, p.down ? 380 : 90, p.down ? 60 : 50, 290, 92, K.n, K.c, { p: g }); S.pop(l, tp + 0.15, { rot0: -10, rot: -4 }); }
      S.stars([[660, p.down ? 300 : 30, 28, K.y]], tp + 0.1, { q: 1 });
    } });

  def("arrow_up", { w: 440, h: 440, doc: "سلالم طالعة وسهم (زيادة، تقدم، نمو خطوة خطوة)", params: "", cues: { draw: 0.3 },
    build: function (S) {
      var d = S.d, K = S.K, t = S.T("draw"), cols = [K.w, K.y, K.o];
      S.floor(404, 10, 430);
      [[40, 110], [160, 190], [280, 280]].forEach(function (b, i) { var e = S.box(b[0], 0, 110, b[1], { bg: cols[i], r: "16px 16px 0 0", bd: [10, K.l], css: "top:auto;bottom:36px;" }); S.grow(e, S.t0 + 0.1 + i * 0.14, "y", "50% 100%", { d: 0.34, ease: "back.out(1.8)", s: "blip", g: i }); });
      var sv = S.part(d.l("M40 250L160 160L250 190L380 40", { sw: 22, sc: K.n, cls: "a" }) + d.l("M300 36h86v86", { sw: 22, sc: K.n, cls: "b" }));
      S.draw(S.q(sv, ".a"), t, 0.5, { s: "swish" }); S.draw(S.q(sv, ".b"), t + 0.45, 0.22, { ease: "power2.out" }); S.sfx("mallet", t + 0.6, 0);
      S.stars([[60, 60, 28, K.y]], t + 0.6, { q: 1 });
    } });

  /* ============ work, tasks, people ============ */
  def("task_card", { w: 580, h: 620, doc: "كليب بورد مهام بيتملى (شغل ومسؤوليات، روتين، ضغط)", params: "title, rows (2-4)", cues: { rows: 0.15, done: 0.75 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 580, 620), n = Math.max(2, Math.min(4, p.rows || 4));
      S.part(d.r(20, 50, 540, 560, 44, K.n) + d.r(56, 104, 468, 470, 22, K.w) + d.r(470, 110, 48, 458, 0, K.sh, { s: 0 }) + d.r(56, 104, 468, 470, 22, "none") + d.r(196, 14, 188, 86, 26, K.y) + d.c(290, 46, 15, K.l, { s: 0 }), { p: g });
      S.txt(p.title || "شغلك", 250, 120, 250, 110, 84, K.l, { p: g, css: "justify-content:flex-start;" }); S.part(d.r(84, 140, 70, 70, 18, K.o), { p: g });
      S.set(g, { rotation: -3 }); S.rise(g, S.t0, { y: 500 });
      var ts = S.spread(n, S.T("rows"), S.T("done"));
      for (var r = 0; r < n; r++) {
        var y = 250 + r * 80, wl = [270, 200, 300, 230][r];
        var row = S.part(d.r(432, y, 56, 56, 14, K.w) + d.l("M" + (400 - wl) + " " + (y + 28) + "H400", { sw: 16, sc: K.g }), { p: g }), tk = S.org(S.part(d.l("M444 " + (y + 28) + "l12 14 26-32", { sw: 13, sc: K.o }), { p: g }), 460, y + 28);
        S.set(row, { autoAlpha: 0, x: 60 }); S.set(tk, { scale: 0 });
        S.to(row, { autoAlpha: 1, x: 0, duration: 0.22, ease: "power3.out" }, ts[r] - 0.12);
        S.to(tk, { scale: 1, duration: 0.24, ease: "back.out(3)" }, ts[r] + 0.1); S.sfx("tick", ts[r] + 0.1, 0);
      }
    } });

  def("idea_card", { w: 420, h: 380, doc: "كارت صغير فيه نبتة واسم (فكرة جديدة، حاجة ليك، بداية صغيرة)", params: "label", cues: { pop: 0.2, grow: 0.5, name: 0.8 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 420, 380);
      S.part(d.r(14, 14, 392, 352, 42, K.w) + d.r(344, 20, 56, 340, 0, K.sh, { s: 0 }) + d.r(14, 14, 392, 352, 42, "none") + d.p("M140 236a70 34 0 0 1 140 0z", K.n) + d.l("M210 206V120"), { p: g });
      var l1 = S.org(S.part(d.leaf(210, 150, 100, -28, K.o), { p: g }), 210, 150), l2 = S.org(S.part(d.leaf(210, 178, 92, 208, K.y), { p: g }), 210, 178);
      var tx = S.txt(p.label || "حاجة ليك", 20, 246, 380, 100, 72, K.l, { p: g });
      S.pop(g, S.T("pop"), { rot0: -14, rot: 6 });
      S.set([l1, l2], { scale: 0 });
      var t = S.T("grow");
      S.to(l1, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, t); S.to(l2, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, t + 0.18); S.sfx("blip", t, 0); S.sfx("blip", t + 0.18, 0);
      S.fade(tx, S.T("name")); S.pulse(g, S.T("name") + 0.25, 1.1); S.stars([[384, 30, 26, K.y]], S.T("name") + 0.2, { q: 1 });
    } });

  def("people", { w: 760, h: 440, doc: "ناس بتزيد واحد ورا التاني (عملاء، فريق، جمهور)", params: "n (3-7), label", cues: { grow: 0.1, done: 0.85 },
    build: function (S, p) {
      var d = S.d, K = S.K, n = Math.max(3, Math.min(7, p.n || 5)), ts = S.spread(n, S.T("grow"), S.T("done")), w = 660 / n, k = Math.min(1, w / 150);
      for (var i = 0; i < n; i++) {
        var hi = i === n - 1, cx = 50 + i * w + w / 2, top = 380 - 200 * k, cols = [K.n, K.y, K.w];
        var g = S.org(S.part(d.person(cx, top, k, hi ? K.o : cols[i % 3], hi ? K.y : K.w)), cx, 380);
        S.pop(g, ts[n - 1 - i], { from: 0.2, s: hi ? "pop" : "blip", ease: "back.out(2.6)" });
      }
      S.floor(380, 20, 740);
      if (p.label) { var l = S.label(p.label, 230, 0, 300, 92, K.y, K.l); S.pop(l, ts[n - 1] + 0.2, { rot0: -8, rot: -3, s: "mallet" }); }
    } });

  def("chat", { w: 780, h: 640, doc: "رسايل شات بتظهر ورا بعض (استفسار عميل، رد، حوار)", params: "items:[نص,نص,نص]", cues: { first: 0.1, last: 0.85 },
    build: function (S, p) {
      var d = S.d, K = S.K, it = (p.items || ["السعر كام؟", "ابعتلي التفاصيل", "تمام، احجزلي"]).slice(0, 3), ts = S.spread(it.length, S.T("first"), S.T("last"));
      it.forEach(function (tx, i) {
        var me = i % 2 === 1, w = Math.min(600, 170 + String(tx).length * 34), x = me ? 110 : 670 - w, y = 20 + i * 200, g = S.grp(0, 0, 780, 640);
        S.part(d.c(me ? 54 : 726, y + 96, 44, me ? K.y : K.n) + d.p(me ? "M" + (x + 6) + " " + (y + 90) + "l-34 44 54-12z" : "M" + (x + w - 6) + " " + (y + 90) + "l34 44-54-12z", me ? K.o : K.w), { p: g });
        var bx = S.box(x, y, w, 150, { bg: me ? K.o : K.w, r: 44, bd: [10, K.l], p: g }); S.txt(tx, 14, 0, w - 48, 130, 60, K.l, { p: bx, l: 1 });
        S.org(g, me ? 54 : 726, y + 130); S.pop(g, ts[i], { from: 0.3, s: me ? "ding" : "pop", g: me ? -3 : 0 });
      });
    } });

  def("phone", { w: 440, h: 720, doc: "موبايل وعليه إشعارات بتنط (طلبات، رسايل، حجوزات)", params: "items:[نص,نص,نص]", cues: { first: 0.2, last: 0.9 },
    build: function (S, p) {
      var d = S.d, K = S.K, g = S.grp(0, 0, 440, 720), it = (p.items || ["طلب جديد", "طلب جديد", "طلب جديد"]).slice(0, 3), ts = S.spread(it.length, S.T("first"), S.T("last"));
      S.part(d.r(50, 14, 340, 692, 60, K.l, { s: 0 }) + d.r(74, 40, 292, 640, 38, K.w, { s: 0 }) + d.p("M74 190V78a38 38 0 0 1 38-38h216a38 38 0 0 1 38 38v112z", K.n, { s: 0 }) + d.r(170, 28, 100, 28, 14, K.l, { s: 0 }) +
        d.c(128, 126, 30, K.y, { sw: 8 }) + d.l("M180 112h130M180 144h84", { sw: 14, sc: K.c }) + d.r(100, 596, 240, 60, 30, K.y, { sw: 8 }), { p: g });
      var clip = S.grp(74, 196, 292, 390, { p: g, css: "overflow:hidden;" });
      S.rise(g, S.t0, { y: 700 }); S.set(g, { rotation: 3 });
      it.forEach(function (tx, i) {
        var n = S.box(14, 12 + i * 124, 264, 108, { bg: i % 2 ? K.sh : K.w, r: 26, bd: [7, K.l], p: clip }); S.box(180, 14, 62, 62, { bg: i % 2 ? K.y : K.o, r: 18, bd: [6, K.l], p: n });
        S.txt(tx, 10, 0, 160, 94, 32, K.l, { p: n, l: 1 }); S.slide(n, ts[i], 320, { s: "ding", g: -2 });
      });
      var tl = ts[it.length - 1] + 0.25, bdg = S.org(S.part(d.tick(398, 380, 46, K.n, K.y)), 398, 380), hrt = S.org(S.part(d.c(40, 250, 44, K.y) + d.p("M40 274c-28-18-32-34-25-44 7-10 20-7 25 3 5-10 18-13 25-3 7 10 3 26-25 44z", K.w, { sw: 7 })), 40, 250);
      S.pop(bdg, tl, { s: "pop" }); S.pop(hrt, tl + 0.12, { q: 1 }); S.sway(g, tl, -2);
    } });

  def("megaphone", { w: 540, h: 440, doc: "ميكروفون إعلان بيطلع موجات (إعلان، تسويق، صوتك يوصل)", params: "", cues: { shout: 0.3 },
    build: function (S) {
      var d = S.d, K = S.K, g = S.org(S.part(d.r(96, 240, 60, 130, 22, K.n) + d.p("M40 170h90L330 50v290L130 250H40a20 20 0 0 1-20-20v-40a20 20 0 0 1 20-20z", K.o) + d.p("M130 170L330 50v80L130 200z", K.w, { s: 0, op: 0.35 }) + d.l("M130 170v80") + d.r(316, 30, 40, 330, 20, K.y)), 100, 230);
      S.set(g, { rotation: -12 }); S.pop(g, S.t0, { from: 0.4, rot0: -30, rot: -12 });
      var t = S.T("shout");
      for (var i = 0; i < 3; i++) {
        var a = S.part(d.l("M" + (400 + i * 46) + " " + (110 - i * 34) + "q" + (46 + i * 12) + " " + (80 + i * 34) + " 0 " + (160 + i * 68), { sw: 16, sc: i === 1 ? K.o : K.l }));
        S.set(a, { autoAlpha: 0, x: -40 }); S.to(a, { autoAlpha: 1, x: 0, duration: 0.22, ease: "back.out(2)" }, t + i * 0.12);
        S.to(a, { x: 14, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 3 }, t + 0.4 + i * 0.1); S.sfx("blip", t + i * 0.12, 2 - i);
      }
      S.to(g, { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1 }, t); S.stars([[60, 60, 28, K.y], [470, 400, 22, K.o]], t + 0.3, { q: 1 });
    } });

  def("handshake_cards", { w: 820, h: 460, doc: "كارتين بيقربوا ويتقفلوا على بعض (شراكة، تعاقد، اتفاق)", params: "a, b", cues: { meet: 0.5 },
    build: function (S, p) {
      var d = S.d, K = S.K, a = S.grp(410, 90, 380, 300), b = S.grp(30, 90, 380, 300);
      S.box(0, 0, 380, 300, { bg: K.n, r: "0 44px 44px 0", bd: [10, K.l], p: a }); S.txt(p.a || "إنت", 20, 0, 320, 280, 110, K.c, { p: a });
      S.box(0, 0, 380, 300, { bg: K.y, r: "44px 0 0 44px", bd: [10, K.l], p: b }); S.txt(p.b || "الكيان", 20, 0, 320, 280, 110, K.l, { p: b });
      S.set(a, { x: 520, autoAlpha: 0 }); S.set(b, { x: -520, autoAlpha: 0 });
      S.to(a, { x: 60, autoAlpha: 1, duration: 0.4, ease: "power3.out" }, S.t0); S.to(b, { x: -60, autoAlpha: 1, duration: 0.4, ease: "power3.out" }, S.t0 + 0.08); S.sfx("whoosh", S.t0 + 0.1, 0);
      var t = S.T("meet");
      S.to([a, b], { x: 0, duration: 0.2, ease: "power3.in" }, t); S.sfx("hit", t + 0.2, -1); S.shake(t + 0.2, S.root, "x");
      var k = S.org(S.part(d.tick(410, 90, 62, K.o, K.w)), 410, 90); S.pop(k, t + 0.25, { s: "ding" }); S.stars([[90, 40, 28, K.y], [740, 430, 24, K.o]], t + 0.3, { q: 1 });
    } });

  /* ============ weight, doubt, comparison ============ */
  def("seesaw", { w: 780, h: 480, doc: "ميزان: حاجة صغيرة قصاد حاجة تقيلة (إمكانيات قليلة قصاد مشروع كبير، سعر قصاد قيمة)", params: "b (اسم التقيل)", cues: { drop: 0.5, settle: 0.9 },
    build: function (S, p) {
      var d = S.d, K = S.K;
      S.floor(440, 150, 630); S.part(d.p("M390 300l70 140H320z", K.n));
      var saw = S.org(S.grp(0, 0, 780, 480), 390, 292);
      S.part(d.r(10, 268, 760, 34, 17, K.y), { p: saw });
      var seed = S.grp(0, 0, 780, 480, { p: saw }); S.part(d.p("M60 268a50 26 0 0 1 100 0z", K.n) + d.l("M110 244V170") + d.leaf(110, 196, 84, -30, K.o) + d.leaf(110, 216, 76, 210, K.o), { p: seed });
      var blk = S.grp(510, 20, 250, 250, { p: saw }); S.box(0, 0, 250, 250, { bg: K.n, r: 30, bd: [10, K.l], p: blk }); S.box(22, 22, 22, 196, { bg: "rgba(255,255,255,0.16)", r: 11, p: blk }); S.txt(p.b || "مشروع كامل", 20, 14, 210, 202, 66, K.c, { p: blk, wrap: 1 });
      S.set(saw, { rotation: -7 }); S.set(blk, { y: -900, autoAlpha: 0 });
      S.rise(saw, S.t0, { y: 300, s: "swipe" });
      var t = S.T("drop");
      S.to(blk, { y: 0, autoAlpha: 1, duration: 0.32, ease: "power3.in" }, t); S.sfx("whoosh", t + 0.1, 0);
      S.to(saw, { rotation: 15, duration: 0.5, ease: "elastic.out(1.1,0.45)" }, t + 0.32); S.sfx("thud", t + 0.32, 3);
      S.to(seed, { y: -70, duration: 0.18, ease: "power2.out" }, t + 0.34); S.to(seed, { y: 0, duration: 0.28, ease: "bounce.out" }, t + 0.52);
      S.to(saw, { rotation: 17, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 1 }, S.T("settle")); S.sfx("thud", S.T("settle"), -5);
    } });

  def("glyph", { w: 340, h: 420, doc: "علامة كبيرة بتنط (؟ للسؤال، ! للتنبيه)", params: "ch:'؟'", cues: { pop: 0.3, again: 0.9 },
    build: function (S, p) {
      var d = S.d, K = S.K, rays = S.part(d.l("M40 70l40 40M300 70l-40 40M20 220h50M270 220h50", { sw: 12 })), g = S.txt(p.ch || "؟", 0, 0, 340, 420, 330, K.o, { css: "-webkit-text-stroke:18px " + K.l + ";paint-order:stroke fill;" });
      S.set(rays, { scale: 0.4, autoAlpha: 0, transformOrigin: "170px 220px" });
      S.pop(g, S.T("pop"), { rot0: -40, rot: -12, ease: "back.out(2.6)", s: "pop_big" }); S.to(rays, { scale: 1, autoAlpha: 1, duration: 0.25, ease: "back.out(2)" }, S.T("pop") + 0.12);
      S.to(g, { scale: 1.2, rotation: 8, duration: 0.3, ease: "back.out(2)" }, S.T("again"));
    } });

  def("compare", { w: 900, h: 560, doc: "كارتين: الغلط قصاد الصح (قبل وبعد، الطريقة القديمة والجديدة)", params: "a (الغلط), b (الصح)", cues: { a: 0.1, b: 0.6 },
    build: function (S, p) {
      var d = S.d, K = S.K, a = S.grp(470, 60, 400, 480), b = S.grp(30, 60, 400, 480);
      S.box(0, 0, 400, 480, { bg: K.w, r: 44, bd: [10, K.l], p: a }); S.box(0, 0, 400, 480, { bg: K.n, r: 44, bd: [10, K.l], p: b });
      S.txt(p.a || "قبل", 24, 190, 332, 250, 84, K.l, { p: a, wrap: 1 }); S.txt(p.b || "بعد", 24, 190, 332, 250, 84, K.c, { p: b, wrap: 1 });
      var x = S.org(S.part(d.cross(670, 150, 74, K.o, K.w)), 670, 150), k = S.org(S.part(d.tick(230, 150, 74, K.y, K.l)), 230, 150);
      S.set(a, { rotation: 3 }); S.set(b, { rotation: -3 }); S.set([x, k], { scale: 0 });
      var ta = S.T("a"), tb = S.T("b");
      S.slide(a, ta, 600); S.to(x, { scale: 1, duration: 0.3, ease: "back.out(3)" }, ta + 0.3); S.sfx("error", ta + 0.3, 0);
      S.slide(b, tb, -600); S.to(k, { scale: 1, duration: 0.3, ease: "back.out(3)" }, tb + 0.3); S.sfx("ding", tb + 0.3, 0);
      S.to([a, x], { autoAlpha: 0.5, duration: 0.3 }, tb + 0.1); S.to(b, { scale: 1.06, duration: 0.3, ease: "back.out(2)" }, tb + 0.35); S.stars([[40, 40, 30, K.y]], tb + 0.4, { q: 1 });
    } });

  def("target", { w: 480, h: 500, doc: "هدف وسهم بيصيبه (تركيز، جمهور مستهدف، نتيجة)", params: "", cues: { hit: 0.6 },
    build: function (S) {
      var d = S.d, K = S.K, g = S.org(S.part(d.l("M150 400l-50 80M330 400l50 80") + d.c(240, 240, 200, K.o) + d.c(240, 240, 146, K.w) + d.c(240, 240, 92, K.o) + d.c(240, 240, 40, K.y)), 240, 240);
      S.floor(480, 40, 440); S.pop(g, S.t0, { from: 0.3 });
      var ar = S.org(S.part(d.l("M240 240L420 90", { sw: 14 }) + d.p("M240 240l44-10-18-22z", K.l) + d.p("M420 90l44-4-20 30zM396 110l44-4-20 30z", K.n)), 240, 240);
      S.set(ar, { x: 500, y: -420, autoAlpha: 0 });
      var t = S.T("hit");
      S.to(ar, { x: 0, y: 0, autoAlpha: 1, duration: 0.2, ease: "power3.in" }, t - 0.2); S.sfx("whoosh", t - 0.1, 0); S.sfx("thud", t, 2);
      S.fromTo(ar, { rotation: -4 }, { rotation: 4, duration: 0.05, yoyo: true, repeat: 5, ease: "none", immediateRender: false }, t);
      S.shake(t, g, "x"); S.stars([[60, 60, 30, K.y], [430, 400, 24, K.n]], t + 0.1, { q: 1 });
    } });
})(typeof window !== "undefined" ? window : globalThis);

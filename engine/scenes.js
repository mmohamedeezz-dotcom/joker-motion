/* Joker Motion — scene library. Every scene is drawn in its own box (w × h), takes its colours from the beat's
   world (S.c), its times from spoken words (S.T("cue")), and plays its own sounds through the move helpers.
   doc = what it means · params = what the spec may pass · cues = default moments (share of the beat). */
(function (G) {
  "use strict";
  var JM = G.JM, def = JM.scene;

  /* ============ time, money, numbers ============ */
  def("calendar", { w: 400, h: 450, doc: "تقويم بيقلب من كلمة لكلمة (النهارده ← بكرة، قبل ← بعد)", params: "a, b", cues: { flip: 0.5 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 20, 400, 430);
      S.box(0, 0, 400, 430, { bg: C.card, r: 40, bd: [9, C.bd], p: g });
      var head = S.box(9, 9, 382, 104, { bg: C.solid, r: "30px 30px 0 0", p: g });
      S.box(92, -22, 26, 74, { bg: C.solid, r: 13, bd: [5, C.bg], p: g }); S.box(282, -22, 26, 74, { bg: C.solid, r: 13, bd: [5, C.bg], p: g });
      var a = S.txt(p.a || "النهارده", 20, 130, 360, 280, 104, C.onCard, { p: g }), b = S.txt(p.b || "بكرة", 20, 130, 360, 280, 140, C.hi === C.card ? C.second : C.hi, { p: g });
      S.set(g, { rotation: -4 }); S.set(b, { scaleY: 0, transformOrigin: "50% 0%" }); S.set(a, { transformOrigin: "50% 0%" });
      S.fromTo(g, { y: 60 }, { y: 0, duration: 0.6, ease: "back.out(1.6)" }, S.t0);
      var t = S.T("flip");
      S.to(a, { scaleY: 0, duration: 0.12, ease: "power2.in" }, t);
      S.to(b, { scaleY: 1, duration: 0.3, ease: "back.out(2.4)" }, t + 0.12);
      S.to(head, { backgroundColor: C.hi === C.card ? C.second : C.hi, duration: 0.15 }, t + 0.12);
      S.to(g, { rotation: 3, duration: 0.3, ease: "back.out(3)" }, t + 0.12);
      S.sfx("swipe", t + 0.07, 3); S.sfx("boop", t + 0.2, 0);
    } });

  def("bars", { w: 440, h: 470, doc: "عمودين بيتقارنوا، والتاني بيعدّي الأول (المصاريف أعلى من الدخل، الطلب أعلى من العرض)", params: "labels:[أ,ب], win:'b'|'a'", cues: { grow: 0.45, hit: 0.85 },
    build: function (S, p) {
      var C = S.c, L = p.labels || ["دخلك", "مصاريفك"];
      S.box(0, 380, 440, 10, { bg: C.solid, r: 5 });
      var b1 = S.box(36, 0, 150, 250, { bg: C.solid, r: "22px 22px 0 0", css: "top:auto;bottom:90px;" }), b2 = S.box(248, 0, 150, 170, { bg: C.hi, r: "22px 22px 0 0", css: "top:auto;bottom:90px;" });
      S.txt(L[0], 6, 396, 210, 70, 42, C.ink, { l: 1 }); S.txt(L[1], 218, 396, 216, 70, 42, C.ink, { l: 1 });
      var dash = S.box(0, 126, 440, 0, { css: "border-top:7px dashed " + C.solid + ";" }), x = S.cross(282, 0, 82, C.solid, C.bg);
      S.set(x, { scale: 0 }); S.set(dash, { scaleX: 0, transformOrigin: "0% 50%" });
      S.fromTo(b1, { height: 90 }, { height: 250, duration: 0.7, ease: "power3.out" }, S.t0);
      S.fromTo(b2, { height: 60 }, { height: 170, duration: 0.8, ease: "power3.out" }, S.t0 + 0.1);
      S.to(dash, { scaleX: 1, duration: 0.4, ease: "power2.out" }, S.t0 + 0.55); S.sfx("swipe", S.t0 + 0.6, -5);
      var tg = S.T("grow"), th = S.T("hit");
      S.to(b2, { height: 290, duration: 0.4, ease: "power2.out" }, tg + 0.1);
      S.to(b2, { height: 372, duration: 0.34, ease: "back.out(2.6)" }, th); S.sfx("whoosh", th, -2);
      S.to(x, { scale: 1, duration: 0.3, ease: "back.out(3)" }, th + 0.2); S.sfx("hit", th + 0.2, 0); S.shake(th + 0.2, S.root, "x");
      S.to(b1, { height: 232, duration: 0.5, ease: "power1.inOut" }, th + 0.4);
    } });

  def("counter", { w: 680, h: 440, doc: "رقم كبير بيعدّ لحد قيمته (نسبة، عدد عملاء، مبلغ)", params: "from, to, prefix, suffix, label", cues: { count: 0.2, land: 0.8 },
    build: function (S, p) {
      var C = S.c, to = p.to == null ? 100 : p.to, pre = p.prefix || "", suf = p.suffix || "";
      var card = S.box(0, 20, 680, 300, { bg: C.solid, r: 50 });
      var n = S.txt(pre + to + suf, 20, 30, 640, 280, 230, C.hi === C.solid ? C.onSolid : C.hi);
      var lab = S.box(120, 300, 440, 110, { bg: C.hi, r: 55 }); S.txt(p.label || "", 0, 0, 440, 110, 58, C.onHi, { p: lab, l: 1 });
      S.rise(card, S.t0); S.fade(n, S.t0 + 0.2);
      var t = S.T("count"), tl = Math.max(t + 0.4, S.T("land"));
      S.count(n, p.from || 0, to, t, tl - t, function (v) { return pre + v + suf; });
      for (var k = 0; k < 6; k++) S.sfx("tick", t + (tl - t) * k / 6, -2);
      S.pulse(n, tl, 1.12, { s: "mallet" }); S.pop(lab, tl + 0.1, { rot0: -8, rot: -3 });
    } });

  def("percent", { w: 520, h: 520, doc: "ختم خصم أو نسبة بيلف ويخبط (عرض، خصم، عمولة)", params: "value:'50%', label", cues: { hit: 0.4 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 520, 520), pts = [];
      for (var i = 0; i < 28; i++) { var a = i * Math.PI / 14, r = i % 2 ? 222 : 258; pts.push((260 + Math.sin(a) * r).toFixed(1) + "," + (260 - Math.cos(a) * r).toFixed(1)); }
      S.svg(0, 0, 520, 520, '<polygon points="' + pts.join(" ") + '" fill="' + C.hi + '"/>', { p: g });
      S.txt(p.value || "50%", 40, 110, 440, 210, 210, C.onHi, { p: g }); S.txt(p.label || "خصم", 90, 300, 340, 110, 76, C.onHi, { p: g });
      var t = S.T("hit");
      S.set(g, { scale: 2.4, autoAlpha: 0, rotation: 40 });
      S.to(g, { scale: 1, autoAlpha: 1, rotation: -10, duration: 0.24, ease: "power4.in" }, t); S.sfx("hit", t + 0.24, 0); S.sfx("sub", t + 0.24, 0); S.shake(t + 0.24);
      S.to(g, { rotation: -4, scale: 1.05, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 3 }, t + 0.4);
    } });

  def("coins", { w: 460, h: 520, doc: "عملات بتترص فوق بعض (فلوس بتتجمع، دخل بيزيد)", params: "n (3-7), label", cues: { stack: 0.15, land: 0.9 },
    build: function (S, p) {
      var C = S.c, n = Math.max(3, Math.min(7, p.n || 5)), ts = S.spread(n, S.T("stack"), S.T("land"));
      S.box(40, 500, 380, 10, { bg: C.solid, r: 5 });
      for (var i = 0; i < n; i++) {
        var c = S.grp(90 + (i % 2 ? 14 : -8), 430 - i * 58, 280, 76);
        S.box(0, 16, 280, 60, { bg: C.solid, r: 30, p: c }); S.box(0, 0, 280, 60, { bg: C.hi, r: 30, bd: [7, C.solid], p: c });
        S.box(110, 18, 60, 22, { bg: C.solid, r: 11, op: 0.85, p: c });
        S.drop(c, ts[i] - 0.3, { y: 600, rot0: i % 2 ? 10 : -10, s: "tap", g: i - 2 });
      }
      if (p.label) { var l = S.box(250, 30, 210, 96, { bg: C.solid, r: 48 }); S.txt(p.label, 0, 0, 210, 96, 54, C.onSolid, { p: l, l: 1 }); S.pop(l, ts[n - 1] + 0.1, { rot0: 14, rot: 6, s: "mallet" }); }
    } });

  def("bill", { w: 560, h: 380, doc: "ورقة فلوس بتطير أو بتدخل (مصروف، مرتب، عمولة)", params: "value, label, out:true لو بتطير", cues: { go: 0.5 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 50, 560, 280);
      S.box(0, 0, 560, 280, { bg: C.hi, r: 36, bd: [9, C.solid], p: g }); S.box(28, 28, 504, 224, { r: 20, bd: [5, C.solid, "dashed"], p: g });
      S.box(205, 65, 150, 150, { bg: C.solid, r: "50%", p: g }); S.txt(p.value || "$", 205, 65, 150, 150, 92, C.hi, { p: g });
      if (p.label) S.txt(p.label, 30, 180, 500, 80, 44, C.onHi, { p: g, l: 1, css: "justify-content:flex-start;padding-right:20px;" });
      S.slide(g, S.t0, p.out ? 0 : 900, { s: "swipe" }); S.set(g, { rotation: -5 });
      var t = S.T("go");
      if (p.out) { S.to(g, { x: -1100, y: -300, rotation: -38, duration: 0.5, ease: "power2.in" }, t); S.sfx("whoosh", t + 0.2, 2); }
      else { S.pulse(g, t, 1.1, { s: "mallet" }); S.sway(g, t + 0.3, 4); }
    } });

  def("clock", { w: 440, h: 460, doc: "ساعة عقاربها بتجري (الوقت بيعدّي، استعجال، ميعاد)", params: "label", cues: { spin: 0.2 },
    build: function (S, p) {
      var C = S.c, g = S.grp(10, 10, 420, 420);
      S.box(0, 0, 420, 420, { bg: C.card, r: "50%", bd: [14, C.bd], p: g });
      for (var i = 0; i < 12; i++) { var m = S.box(203, 26, 14, i % 3 ? 26 : 46, { bg: C.onCard, r: 7, op: i % 3 ? 0.4 : 1, p: g }); S.set(m, { rotation: i * 30, transformOrigin: "50% " + (184) + "px" }); }
      var h = S.box(200, 110, 20, 110, { bg: C.onCard, r: 10, p: g }), mn = S.box(203, 60, 14, 160, { bg: C.hi === C.card ? C.second : C.hi, r: 7, p: g });
      S.box(188, 188, 44, 44, { bg: C.onCard, r: "50%", p: g });
      S.set(h, { transformOrigin: "50% 100%" }); S.set(mn, { transformOrigin: "50% 100%" });
      S.pop(g, S.t0, { from: 0.4 });
      var t = S.T("spin"), d = Math.max(0.8, S.t1 - t - 0.2);
      S.to(mn, { rotation: 1080, duration: d, ease: "power1.inOut" }, t); S.to(h, { rotation: 150, duration: d, ease: "power1.inOut" }, t);
      for (var k = 0; k < 5; k++) S.sfx("tick", t + d * k / 5, -3);
      if (p.label) { var l = S.box(110, 384, 220, 76, { bg: C.hi, r: 38 }); S.txt(p.label, 0, 0, 220, 76, 44, C.onHi, { p: l, l: 1 }); S.pop(l, t + 0.3, {}); }
    } });

  def("chart_line", { w: 720, h: 500, doc: "خط بياني طالع (نمو، مبيعات، تطور)", params: "label, down:true لو نازل", cues: { draw: 0.2, peak: 0.85 },
    build: function (S, p) {
      var C = S.c, d = p.down ? "M 50 110 L 200 200 L 320 160 L 470 320 L 650 400" : "M 50 400 L 200 300 L 320 340 L 470 170 L 650 80";
      S.box(40, 440, 660, 10, { bg: C.solid, r: 5 }); S.box(40, 30, 10, 420, { bg: C.solid, r: 5 });
      for (var i = 0; i < 4; i++) S.box(60, 110 + i * 90, 630, 0, { css: "border-top:4px dashed " + C.soft + ";" });
      var sv = S.svg(0, 0, 720, 500, '<path class="a" d="' + d + '" fill="none" stroke="' + C.hi + '" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>');
      var t = S.T("draw"), tp = Math.max(t + 0.5, S.T("peak"));
      S.draw(S.q(sv, ".a"), t, tp - t, { s: "swish" });
      var dot = S.box(650 - 34, (p.down ? 400 : 80) - 34, 68, 68, { bg: C.solid, r: "50%", bd: [10, C.hi] }); S.pop(dot, tp, { s: "mallet" });
      if (p.label) { var l = S.box(p.down ? 380 : 60, p.down ? 60 : 40, 300, 100, { bg: C.solid, r: 50 }); S.txt(p.label, 0, 0, 300, 100, 54, C.onSolid, { p: l, l: 1 }); S.pop(l, tp + 0.15, { rot0: -10, rot: -4 }); }
    } });

  def("arrow_up", { w: 440, h: 440, doc: "سهم طالع بيترسم (زيادة، تقدم)", params: "", cues: { draw: 0.3 },
    build: function (S) {
      var C = S.c, sv = S.svg(0, 0, 440, 440, '<path class="a" d="M 30 400 L 150 280 L 215 335 L 360 110" fill="none" stroke="' + C.hi + '" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><path class="b" d="M 260 96 L 372 96 L 364 208" fill="none" stroke="' + C.hi + '" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>');
      var t = S.T("draw");
      S.draw(S.q(sv, ".a"), t, 0.5, { s: "swish" }); S.draw(S.q(sv, ".b"), t + 0.45, 0.22, { ease: "power2.out" }); S.sfx("mallet", t + 0.6, 0);
    } });

  /* ============ work, tasks, people ============ */
  def("task_card", { w: 580, h: 620, doc: "كارت مهام بيتملى (شغل ومسؤوليات، روتين، ضغط)", params: "title, rows (2-4)", cues: { rows: 0.15, done: 0.75 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 580, 620), n = Math.max(2, Math.min(4, p.rows || 4));
      S.box(0, 0, 580, 620, { bg: C.solid, r: 48, p: g }); S.txt(p.title || "شغلك", 180, 30, 360, 140, 104, C.onSolid, { p: g, css: "justify-content:flex-start;" });
      S.box(48, 54, 92, 92, { bg: C.hi === C.solid ? C.second : C.hi, r: 26, p: g });
      S.set(g, { rotation: -3 }); S.rise(g, S.t0, { y: 500 });
      var ts = S.spread(n, S.T("rows"), S.T("done"));
      for (var r = 0; r < n; r++) {
        var y = 196 + r * 100, ring = S.box(468, y, 64, 64, { r: "50%", bd: [7, C.onSolid], p: g }), ln = S.box(440 - [330, 250, 360, 290][r], y + 20, [330, 250, 360, 290][r], 24, { bg: S.rgba(C.onSolid, 0.45), r: 12, p: g }), k = S.box(468, y, 64, 64, { bg: C.hi === C.solid ? C.second : C.hi, r: "50%", p: g });
        S.set([ring, ln], { autoAlpha: 0, x: 60 }); S.set(k, { scale: 0 });
        S.to([ring, ln], { autoAlpha: 1, x: 0, duration: 0.22, ease: "power3.out" }, ts[r] - 0.12);
        S.to(k, { scale: 1, duration: 0.24, ease: "back.out(3)" }, ts[r] + 0.1); S.sfx("tick", ts[r] + 0.1, 0);
      }
    } });

  def("idea_card", { w: 420, h: 380, doc: "كارت صغير فيه نبتة واسم (فكرة جديدة، حاجة ليك، بداية صغيرة)", params: "label", cues: { pop: 0.2, grow: 0.5, name: 0.8 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 10, 420, 360), col = C.hi === C.card ? C.second : C.hi;
      S.box(0, 0, 420, 360, { bg: C.card, r: 44, bd: [9, C.bd], p: g }); S.box(203, 118, 14, 104, { bg: C.onCard, r: 7, p: g });
      var l1 = S.leaf(210, 92, 84, 50, col, { p: g }), l2 = S.leaf(126, 132, 84, 50, col, { p: g, flip: 0 });
      S.box(150, 214, 120, 16, { bg: C.onCard, r: 8, p: g });
      var tx = S.txt(p.label || "حاجة ليك", 10, 236, 400, 100, 72, C.onCard, { p: g });
      S.pop(g, S.T("pop"), { rot0: -14, rot: 6 });
      S.set(l1, { scale: 0, transformOrigin: "0% 100%" }); S.set(l2, { scale: 0, transformOrigin: "100% 100%" });
      var t = S.T("grow");
      S.to(l1, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, t); S.to(l2, { scale: 1, duration: 0.3, ease: "back.out(2.5)" }, t + 0.18); S.sfx("blip", t, 0); S.sfx("blip", t + 0.18, 0);
      S.fade(tx, S.T("name")); S.pulse(g, S.T("name") + 0.25, 1.1);
    } });

  def("people", { w: 760, h: 440, doc: "ناس بتزيد واحد ورا التاني (عملاء، فريق، جمهور)", params: "n (3-7), label", cues: { grow: 0.1, done: 0.85 },
    build: function (S, p) {
      var C = S.c, n = Math.max(3, Math.min(7, p.n || 5)), ts = S.spread(n, S.T("grow"), S.T("done")), w = 660 / n;
      for (var i = 0; i < n; i++) {
        var hi = i === n - 1, x = 50 + i * w + (w - 96) / 2, g = S.grp(x, 120, 96, 240), col = hi ? C.hi : C.solid;
        S.box(18, 0, 60, 60, { bg: col, r: "50%", p: g }); S.box(0, 76, 96, 164, { bg: col, r: "48px 48px 14px 14px", p: g });
        S.pop(g, ts[n - 1 - i], { from: 0.2, s: hi ? "pop" : "blip", ease: "back.out(2.6)" }); S.set(g, { transformOrigin: "50% 100%" });
      }
      S.box(30, 366, 700, 10, { bg: C.solid, r: 5 });
      if (p.label) { var l = S.box(230, 0, 300, 96, { bg: C.hi, r: 48 }); S.txt(p.label, 0, 0, 300, 96, 54, C.onHi, { p: l, l: 1 }); S.pop(l, ts[n - 1] + 0.2, { rot0: -8, rot: -3, s: "mallet" }); }
    } });

  def("chat", { w: 780, h: 640, doc: "رسايل شات بتظهر ورا بعض (استفسار عميل، رد، حوار)", params: "items:[نص,نص,نص]", cues: { first: 0.1, last: 0.85 },
    build: function (S, p) {
      var C = S.c, it = (p.items || ["السعر كام؟", "ابعتلي التفاصيل", "تمام، احجزلي"]).slice(0, 3), ts = S.spread(it.length, S.T("first"), S.T("last"));
      it.forEach(function (tx, i) {
        var me = i % 2 === 1, w = Math.min(640, 150 + String(tx).length * 34), x = me ? 0 : 780 - w, g = S.grp(x, 20 + i * 200, w, 160);
        S.box(0, 0, w, 150, { bg: me ? C.hi : C.solid, r: me ? "40px 40px 40px 8px" : "40px 40px 8px 40px", p: g });
        S.txt(tx, 20, 0, w - 40, 150, 62, me ? C.onHi : C.onSolid, { p: g, l: 1 });
        S.pop(g, ts[i], { from: 0.3, s: me ? "ding" : "pop", g: me ? -3 : 0 }); S.set(g, { transformOrigin: me ? "0% 100%" : "100% 100%" });
      });
    } });

  def("phone", { w: 440, h: 720, doc: "موبايل وعليه إشعارات بتنط (طلبات، رسايل، حجوزات)", params: "items:[نص,نص,نص]", cues: { first: 0.2, last: 0.9 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 440, 720), it = (p.items || ["طلب جديد", "طلب جديد", "طلب جديد"]).slice(0, 4), ts = S.spread(it.length, S.T("first"), S.T("last"));
      S.box(0, 0, 440, 720, { bg: C.solid, r: 64, p: g }); S.box(22, 22, 396, 676, { bg: C.bg, r: 46, p: g }); S.box(150, 40, 140, 30, { bg: C.solid, r: 15, p: g });
      S.rise(g, S.t0, { y: 700 }); S.set(g, { rotation: 3 });
      it.forEach(function (tx, i) {
        var n = S.grp(44, 110 + i * 136, 352, 116, { p: g });
        S.box(0, 0, 352, 116, { bg: C.card, r: 28, bd: [6, C.bd], p: n }); S.box(258, 22, 72, 72, { bg: C.hi === C.card ? C.second : C.hi, r: 22, p: n });
        S.txt(tx, 14, 0, 236, 116, 44, C.onCard, { p: n, l: 1 });
        S.slide(n, ts[i], 380, { s: "ding", g: -2 });
      });
      S.sway(g, ts[it.length - 1] + 0.2, -2);
    } });

  def("megaphone", { w: 540, h: 440, doc: "ميكروفون إعلان بيطلع موجات (إعلان، تسويق، صوتك يوصل)", params: "", cues: { shout: 0.3 },
    build: function (S) {
      var C = S.c, g = S.grp(20, 60, 340, 320);
      S.svg(0, 0, 340, 320, '<polygon points="20,120 20,200 110,200 300,300 300,20 110,120" fill="' + C.solid + '"/><rect x="60" y="200" width="56" height="110" rx="20" fill="' + C.solid + '"/><rect x="286" y="10" width="34" height="300" rx="17" fill="' + C.hi + '"/>', { p: g });
      S.set(g, { rotation: -12, transformOrigin: "20% 60%" }); S.pop(g, S.t0, { from: 0.4, rot0: -30, rot: -12 });
      var t = S.T("shout");
      for (var i = 0; i < 3; i++) {
        var a = S.svg(360 + i * 52, 110 - i * 40, 80, 220 + i * 80, '<path d="M 10 10 Q ' + (70) + " " + (110 + i * 40) + " 10 " + (210 + i * 80) + '" fill="none" stroke="' + C.hi + '" stroke-width="18" stroke-linecap="round"/>');
        S.set(a, { autoAlpha: 0, x: -40, scale: 0.7 });
        S.to(a, { autoAlpha: 1, x: 0, scale: 1, duration: 0.22, ease: "back.out(2)" }, t + i * 0.12);
        S.to(a, { x: 14, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 3 }, t + 0.4 + i * 0.1);
        S.sfx("blip", t + i * 0.12, 2 - i);
      }
      S.to(g, { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1 }, t);
    } });

  def("handshake_cards", { w: 820, h: 460, doc: "كارتين بيقربوا ويتقفلوا على بعض (شراكة، تعاقد، اتفاق)", params: "a, b", cues: { meet: 0.5 },
    build: function (S, p) {
      var C = S.c, a = S.grp(410, 80, 380, 300), b = S.grp(30, 80, 380, 300);
      S.box(0, 0, 380, 300, { bg: C.solid, r: "0 44px 44px 0", p: a }); S.txt(p.a || "إنت", 20, 0, 340, 300, 110, C.onSolid, { p: a });
      S.box(0, 0, 380, 300, { bg: C.hi, r: "44px 0 0 44px", p: b }); S.txt(p.b || "الكيان", 20, 0, 340, 300, 110, C.onHi, { p: b });
      S.set(a, { x: 520, autoAlpha: 0 }); S.set(b, { x: -520, autoAlpha: 0 });
      S.to(a, { x: 60, autoAlpha: 1, duration: 0.4, ease: "power3.out" }, S.t0); S.to(b, { x: -60, autoAlpha: 1, duration: 0.4, ease: "power3.out" }, S.t0 + 0.08); S.sfx("whoosh", S.t0 + 0.1, 0);
      var t = S.T("meet");
      S.to([a, b], { x: 0, duration: 0.2, ease: "power3.in" }, t); S.sfx("hit", t + 0.2, -1); S.shake(t + 0.2, S.root, "x");
      var k = S.check(350, 20, 120, C.bg, C.ink); S.pop(k, t + 0.25, { s: "ding" });
    } });

  /* ============ weight, doubt, comparison ============ */
  def("seesaw", { w: 780, h: 480, doc: "ميزان: حاجة صغيرة قصاد حاجة تقيلة (إمكانيات قليلة قصاد مشروع كبير، سعر قصاد قيمة)", params: "b (اسم التقيل)", cues: { drop: 0.5, settle: 0.9 },
    build: function (S, p) {
      var C = S.c;
      S.svg(328, 290, 124, 130, '<polygon points="62,0 124,124 0,124" fill="' + C.solid + '"/>');
      var saw = S.grp(0, 0, 780, 300);
      S.box(0, 270, 780, 30, { bg: C.solid, r: 15, p: saw });
      var seed = S.grp(26, 150, 150, 120, { p: saw });
      S.box(68, 30, 14, 90, { bg: C.solid, r: 7, p: seed }); S.leaf(74, 6, 84, 50, C.hi, { p: seed }); S.leaf(-8, 40, 84, 50, C.hi, { p: seed });
      var blk = S.grp(510, 20, 250, 250, { p: saw });
      S.box(0, 0, 250, 250, { bg: C.solid, r: 30, p: blk }); S.txt(p.b || "مشروع كامل", 14, 14, 222, 222, 70, C.onSolid, { p: blk, wrap: 1 });
      S.set(saw, { rotation: -7, transformOrigin: "50% 95%" }); S.set(blk, { y: -900, autoAlpha: 0 });
      S.rise(saw, S.t0, { y: 300, s: "swipe" });
      var t = S.T("drop");
      S.to(blk, { y: 0, autoAlpha: 1, duration: 0.32, ease: "power3.in" }, t); S.sfx("whoosh", t + 0.1, 0);
      S.to(saw, { rotation: 15, duration: 0.5, ease: "elastic.out(1.1,0.45)" }, t + 0.32); S.sfx("thud", t + 0.32, 3);
      S.to(seed, { y: -70, duration: 0.18, ease: "power2.out" }, t + 0.34); S.to(seed, { y: 0, duration: 0.28, ease: "bounce.out" }, t + 0.52);
      S.to(saw, { rotation: 17, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 1 }, S.T("settle")); S.sfx("thud", S.T("settle"), -5);
    } });

  def("glyph", { w: 340, h: 420, doc: "علامة كبيرة بتنط (؟ للسؤال، ! للتنبيه)", params: "ch:'؟'", cues: { pop: 0.3, again: 0.9 },
    build: function (S, p) {
      var C = S.c, g = S.txt(p.ch || "؟", 0, 0, 340, 420, 330, C.hi);
      S.pop(g, S.T("pop"), { rot0: -40, rot: -12, ease: "back.out(2.6)", s: "pop_big" });
      S.to(g, { scale: 1.2, rotation: 8, duration: 0.3, ease: "back.out(2)" }, S.T("again"));
    } });

  def("compare", { w: 900, h: 560, doc: "كارتين: الغلط قصاد الصح (قبل وبعد، الطريقة القديمة والجديدة)", params: "a (الغلط), b (الصح)", cues: { a: 0.1, b: 0.6 },
    build: function (S, p) {
      var C = S.c, a = S.grp(470, 40, 400, 480), b = S.grp(30, 40, 400, 480);
      S.box(0, 0, 400, 480, { bg: C.card, r: 44, bd: [9, C.bd], p: a }); S.txt(p.a || "قبل", 20, 190, 360, 260, 88, C.onCard, { p: a, wrap: 1 });
      var x = S.cross(130, 40, 140, C.onCard, C.card, { p: a });
      S.box(0, 0, 400, 480, { bg: C.solid, r: 44, p: b }); S.txt(p.b || "بعد", 20, 190, 360, 260, 88, C.onSolid, { p: b, wrap: 1 });
      var k = S.check(130, 40, 140, C.hi === C.solid ? C.second : C.hi, C.solid, { p: b });
      S.set(a, { rotation: 3 }); S.set(b, { rotation: -3 });
      var ta = S.T("a"), tb = S.T("b");
      S.slide(a, ta, 600); S.set(x, { scale: 0 }); S.to(x, { scale: 1, duration: 0.3, ease: "back.out(3)" }, ta + 0.3); S.sfx("thud", ta + 0.3, -3);
      S.slide(b, tb, -600); S.set(k, { scale: 0 }); S.to(k, { scale: 1, duration: 0.3, ease: "back.out(3)" }, tb + 0.3); S.sfx("ding", tb + 0.3, 0);
      S.to(a, { scale: 0.9, autoAlpha: 0.55, duration: 0.3 }, tb + 0.1); S.to(b, { scale: 1.06, duration: 0.3, ease: "back.out(2)" }, tb + 0.35);
    } });

  def("target", { w: 480, h: 480, doc: "هدف وسهم بيصيبه (تركيز، جمهور مستهدف، نتيجة)", params: "", cues: { hit: 0.6 },
    build: function (S) {
      var C = S.c, g = S.grp(20, 40, 420, 420);
      S.box(0, 0, 420, 420, { bg: C.solid, r: "50%", p: g }); S.box(60, 60, 300, 300, { bg: C.bg, r: "50%", p: g }); S.box(120, 120, 180, 180, { bg: C.solid, r: "50%", p: g }); S.box(165, 165, 90, 90, { bg: C.hi, r: "50%", p: g });
      S.pop(g, S.t0, { from: 0.3 });
      var ar = S.grp(230, 110, 320, 60);
      S.box(0, 20, 280, 20, { bg: C.hi === C.bg ? C.second : C.hi, r: 10, p: ar }); S.svg(250, 0, 70, 60, '<polygon points="0,30 70,0 50,30 70,60" fill="' + (C.hi === C.bg ? C.second : C.hi) + '"/>', { p: ar });
      S.set(ar, { rotation: -35, transformOrigin: "0% 50%", x: 700, y: -500, autoAlpha: 0 });
      var t = S.T("hit");
      S.to(ar, { x: 0, y: 0, autoAlpha: 1, duration: 0.22, ease: "power3.in" }, t - 0.22); S.sfx("whoosh", t - 0.12, 0); S.sfx("thud", t, 2);
      S.shake(t, g, "x"); S.to(g, { scale: 1.06, duration: 0.14, yoyo: true, repeat: 1 }, t);
    } });

  /* ============ brand, proof, trust ============ */
  def("stamp", { w: 620, h: 620, doc: "ختم دائري بيخبط باسم الحل أو النموذج (إعلان الفكرة الأساسية)", params: "a (السطر الأول), b (السطر التاني)", cues: { hit: 0.4, second: 0.75 },
    build: function (S, p) {
      var C = S.c, rays = S.grp(310, 310, 0, 0), g = S.grp(0, 0, 620, 620);
      S.box(0, 0, 620, 620, { r: "50%", bd: [16, C.hi], p: g }); S.box(34, 34, 552, 552, { r: "50%", bd: [6, C.hi, "dashed"], p: g });
      S.txt(p.a || "", 60, 100, 500, 220, 176, C.hi, { p: g }); var b = S.txt(p.b || "", 60, 290, 500, 220, 176, C.ink, { p: g });
      S.set(g, { scale: 2.2, autoAlpha: 0, rotation: 14 }); S.set(b, { autoAlpha: 0, scale: 0.6 });
      var t = S.T("hit");
      S.to(g, { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.22, ease: "power4.in" }, t); S.shake(t + 0.22); S.sfx("hit", t + 0.22, 1); S.sfx("sub", t + 0.22, 0);
      S.to(b, { autoAlpha: 1, scale: 1, duration: 0.26, ease: "back.out(2.6)" }, S.T("second")); S.sfx("shimmer", S.T("second"), 0);
      for (var r = 0; r < 12; r++) {
        var ray = S.box(-9, -9, 18, 70, { bg: C.hi, r: 9, p: rays }), a = r * 30 * Math.PI / 180;
        S.set(ray, { rotation: r * 30, x: Math.sin(a) * 330, y: -Math.cos(a) * 330 - 35, scaleY: 0, transformOrigin: "50% 100%" });
        S.to(ray, { x: Math.sin(a) * 430, y: -Math.cos(a) * 430 - 35, scaleY: 1, duration: 0.22, ease: "power3.out" }, t + 0.22);
        S.to(ray, { scaleY: 0, x: Math.sin(a) * 500, y: -Math.cos(a) * 500 - 35, duration: 0.25, ease: "power2.in" }, t + 0.46);
      }
      S.to(g, { rotation: -5, scale: 1.04, duration: 0.8, ease: "sine.inOut" }, S.T("second") + 0.25);
    } });

  def("shield", { w: 440, h: 520, doc: "درع عليه علامة صح (ضمان، أمان، ثقة، حماية)", params: "label", cues: { pop: 0.2, check: 0.6 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 440, 440);
      S.svg(0, 0, 440, 440, '<path d="M 220 10 L 410 80 L 410 230 Q 410 370 220 430 Q 30 370 30 230 L 30 80 Z" fill="' + C.solid + '"/><path d="M 220 54 L 370 110 L 370 228 Q 370 338 220 386 Q 70 338 70 228 L 70 110 Z" fill="none" stroke="' + C.hi + '" stroke-width="8" stroke-dasharray="4 22" stroke-linecap="round"/><path class="a" d="M 140 220 L 200 280 L 310 160" fill="none" stroke="' + C.hi + '" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>', { p: g });
      S.pop(g, S.T("pop"), { from: 0.3, s: "pop_big" });
      S.draw(S.q(g, ".a"), S.T("check"), 0.3, { ease: "power2.out" }); S.sfx("ding", S.T("check") + 0.2, 1); S.pulse(g, S.T("check") + 0.3, 1.08, { q: 1 });
      if (p.label) { var l = S.box(70, 420, 300, 96, { bg: C.hi, r: 48 }); S.txt(p.label, 0, 0, 300, 96, 54, C.onHi, { p: l, l: 1 }); S.pop(l, S.T("check") + 0.35, {}); }
    } });

  def("stars", { w: 780, h: 240, doc: "خمس نجوم بتتملى (تقييم، رضا العملاء، جودة)", params: "n (1-5)", cues: { fill: 0.15, done: 0.8 },
    build: function (S, p) {
      var C = S.c, n = Math.max(1, Math.min(5, p.n || 5)), ts = S.spread(5, S.T("fill"), S.T("done")), pts = [];
      for (var i = 0; i < 10; i++) { var a = i * Math.PI / 5, r = i % 2 ? 30 : 70; pts.push((70 + Math.sin(a) * r).toFixed(1) + "," + (72 - Math.cos(a) * r).toFixed(1)); }
      for (var k = 0; k < 5; k++) {
        var st = S.svg(640 - k * 150, 40, 140, 144, '<polygon points="' + pts.join(" ") + '" fill="' + (k < n ? C.hi : C.soft) + '" stroke="' + C.solid + '" stroke-width="9" stroke-linejoin="round"/>');
        S.pop(st, ts[k], { from: 0.2, rot0: -60, s: k < n ? "mallet" : "tick", g: k - 3 });
      }
    } });

  def("trophy", { w: 440, h: 540, doc: "كاس (فوز، إنجاز، الأول)", params: "label", cues: { pop: 0.3 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 440, 460);
      S.svg(0, 0, 440, 460, '<path d="M 110 30 L 330 30 L 330 170 Q 330 280 220 280 Q 110 280 110 170 Z" fill="' + C.hi + '" stroke="' + C.solid + '" stroke-width="12"/><path d="M 110 70 Q 30 70 40 150 Q 50 210 120 210" fill="none" stroke="' + C.solid + '" stroke-width="22" stroke-linecap="round"/><path d="M 330 70 Q 410 70 400 150 Q 390 210 320 210" fill="none" stroke="' + C.solid + '" stroke-width="22" stroke-linecap="round"/><rect x="196" y="280" width="48" height="80" fill="' + C.solid + '"/><rect x="120" y="356" width="200" height="60" rx="18" fill="' + C.solid + '"/>', { p: g });
      S.txt("١", 150, 60, 140, 190, 150, C.onHi, { p: g });
      S.rise(g, S.T("pop"), { y: 500, s: "whoosh" }); S.sfx("sting", S.T("pop") + 0.35, 0); S.sway(g, S.T("pop") + 0.5, 4, { rep: 3 });
      if (p.label) { var l = S.box(60, 440, 320, 96, { bg: C.solid, r: 48 }); S.txt(p.label, 0, 0, 320, 96, 54, C.onSolid, { p: l, l: 1 }); S.pop(l, S.T("pop") + 0.45, {}); }
    } });

  def("signature", { w: 920, h: 260, doc: "اسم البراند كبير وتحته خط (توقيع، خاتمة)", params: "name", cues: { show: 0.5 },
    build: function (S, p) {
      var C = S.c, n = S.txt(p.name || "", 0, 0, 920, 190, 150, C.ink), u = S.box(250, 196, 420, 16, { bg: C.hi, r: 8 }), t = S.T("show");
      S.fade(n, t, { y: 40 }); S.sfx("sting", t + 0.05, 0); S.grow(u, t + 0.3, "x", "100% 50%", { d: 0.5 });
    } });

  def("big_word", { w: 920, h: 460, doc: "كلمة واحدة ضخمة بتخبط الشاشة (الكلمة المفتاح، الرقم، الوعد)", params: "text, sub", cues: { hit: 0.3 },
    build: function (S, p) {
      var C = S.c, e2 = S.txt(p.text || "", 14, 44, 920, 320, 300, C.hi), e1 = S.txt(p.text || "", 0, 30, 920, 320, 300, C.ink), t = S.T("hit");
      S.set([e1, e2], { scale: 2.4, autoAlpha: 0 });
      S.to(e2, { scale: 1, autoAlpha: 1, duration: 0.2, ease: "power4.in" }, t - 0.03); S.to(e1, { scale: 1, autoAlpha: 1, duration: 0.2, ease: "power4.in" }, t);
      S.sfx("hit", t + 0.2, 1); S.sfx("sub", t + 0.2, 0); S.shake(t + 0.2);
      if (p.sub) { var l = S.box(210, 350, 500, 104, { bg: C.solid, r: 52 }); S.txt(p.sub, 0, 0, 500, 104, 58, C.onSolid, { p: l, l: 1 }); S.pop(l, t + 0.4, { rot0: 8, rot: -3 }); }
      S.to([e1, e2], { scale: 1.05, duration: 1.2, ease: "sine.inOut" }, t + 0.3);
    } });

  def("checklist", { w: 900, h: 720, doc: "شروط أو مميزات بتدخل واحدة واحدة وتتعلّم صح (شروط الانضمام، المميزات، الخطوات)", params: "items:[{t:'النص', s:'سطر صغير فوقه'}] لحد 3, name (اسم البراند تحتهم)", cues: { first: 0.1, last: 0.8 },
    build: function (S, p) {
      var C = S.c, it = (p.items || []).slice(0, 3), n = it.length || 1, ts = S.spread(n, S.T("first"), S.T("last")), gap = n === 3 ? 222 : 250, chips = [];
      it.forEach(function (x, i) {
        if (typeof x === "string") x = { t: x };
        var g = S.grp(0, i * gap, 900, 200);
        S.box(0, 0, 900, 200, { bg: C.card, r: 100, bd: [9, C.bd === C.card ? C.hi : C.bd], p: g });
        S.box(722, 28, 144, 144, { bg: C.bg === C.card ? C.solid : C.bg, r: "50%", p: g }); S.txt(String(i + 1), 722, 28, 144, 144, 96, C.hi === C.card ? C.second : C.hi, { p: g });
        if (x.s) { S.txt(x.s, 160, 14, 540, 66, 42, C.onCard, { p: g, l: 1 }); S.txt(x.t, 160, 70, 540, 120, 84, C.onCard, { p: g }); }
        else S.txt(x.t, 160, 0, 540, 200, 92, C.onCard, { p: g });
        var k = S.check(40, 50, 100, C.hi === C.card ? C.second : C.hi, C.card, { p: g });
        S.slide(g, ts[i] - 0.1, 1100, { d: 0.4 }); S.set(k, { scale: 0 });
        var tk = i + 1 < n ? Math.min(ts[i + 1] - 0.2, ts[i] + 0.7) : ts[i] + 0.6;
        S.to(k, { scale: 1, duration: 0.3, ease: "back.out(3)" }, tk); S.sfx("ding", tk, i);
        chips.push(g);
      });
      var tl = ts[n - 1] + 0.8;
      if (p.name) { var s = S.txt(p.name, 0, n * gap + 10, 900, 170, 120, C.ink), u = S.box(240, n * gap + 176, 420, 14, { bg: C.hi, r: 7 }); S.fade(s, tl, { y: 40 }); S.sfx("sting", tl, 1); S.grow(u, tl + 0.3, "x", "100% 50%", { d: 0.5 }); }
      S.to(chips, { y: -10, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1, stagger: 0.2 }, tl + 0.2);
    } });

  def("steps", { w: 900, h: 560, doc: "تلات خطوات مرقمة ومتوصلة بخط (إزاي تبدأ، طريقة الطلب)", params: "items:[نص,نص,نص]", cues: { first: 0.1, last: 0.8 },
    build: function (S, p) {
      var C = S.c, it = (p.items || ["سجّل", "اختار", "استلم"]).slice(0, 3), n = it.length, ts = S.spread(n, S.T("first"), S.T("last")), w = 900 / n;
      var line = S.box(w / 2, 136, 900 - w, 16, { bg: C.soft, r: 8 }), fill = S.box(w / 2, 136, 900 - w, 16, { bg: C.hi, r: 8 });
      S.set(fill, { scaleX: 0, transformOrigin: "100% 50%" }); S.to(fill, { scaleX: 1, duration: Math.max(0.4, ts[n - 1] - ts[0]), ease: "none" }, ts[0]);
      it.forEach(function (tx, i) {
        var x = 900 - (i + 1) * w, c = S.grp(x + w / 2 - 90, 54, 180, 180);
        S.box(0, 0, 180, 180, { bg: C.solid, r: "50%", bd: [12, C.hi], p: c }); S.txt(String(i + 1), 0, 0, 180, 180, 120, C.onSolid, { p: c });
        var l = S.box(x + 14, 290, w - 28, 150, { bg: C.card, r: 36, bd: [8, C.bd] }); S.txt(tx, 10, 0, w - 48, 150, 70, C.onCard, { p: l });
        S.pop(c, ts[i], { s: "pop" }); S.rise(l, ts[i] + 0.12, { y: 120, q: 1 });
      });
    } });

  /* ============ building, growth, ownership ============ */
  def("building", { w: 700, h: 660, doc: "مبنى بيتبني بلوك بلوك، وبلوك ملوّن بيركب في مكانه (كيان بيبني مشروع وإنت جزء منه، فريق، نظام)", params: "label (اسم البلوك الملوّن), roof:false", cues: { build: 0.05, done: 0.45, fly: 0.6, lock: 0.8 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 700, 660), t0 = S.T("build"), t1 = Math.max(t0 + 0.8, S.T("done")), n = 0;
      var ground = S.box(10, 644, 680, 10, { bg: C.solid, r: 5, p: g }); S.grow(ground, S.t0, "x", "50% 50%", { d: 0.3 });
      for (var row = 0; row < 4; row++) for (var col = 0; col < 3; col++) {
        if (row === 1 && col === 1) continue;
        var b = S.grp(105 + col * 168, 528 - row * 126, 154, 112, { p: g });
        S.box(0, 0, 154, 112, { bg: C.solid, r: 18, p: b }); S.box(50, 30, 54, 52, { bg: C.bg, r: 10, op: 0.9, p: b });
        var tb = t0 + (t1 - t0 - 0.3) * (n / 10);
        S.drop(b, tb, { y: 420, rot0: n % 2 ? 9 : -9, d: 0.26, s: "tap", g: (n % 3) - 2 }); n++;
      }
      var hole = S.box(273, 402, 154, 112, { r: 18, bd: [6, C.hi, "dashed"], p: g }); S.set(hole, { autoAlpha: 0 }); S.to(hole, { autoAlpha: 1, duration: 0.2 }, t0 + 0.5);
      if (p.roof !== false) { var roof = S.box(72, 120, 556, 34, { bg: C.hi, r: 17, p: g }); S.drop(roof, t1 - 0.12, { y: 300, d: 0.22, s: "thud", g: -2 }); }
      var you = S.grp(273, 402, 154, 112, { p: g });
      S.box(0, 0, 154, 112, { bg: C.hi, r: 18, p: you }); S.txt(p.label || "إنت", 6, 0, 142, 112, 72, C.onHi, { p: you });
      var tf = S.T("fly"), tk = Math.max(tf + 0.35, S.T("lock"));
      S.set(you, { x: -520, y: 330, rotation: -50, autoAlpha: 0, scale: 1.5 });
      S.to(you, { autoAlpha: 1, duration: 0.1 }, tf); S.to(you, { x: -150, y: -210, rotation: -15, duration: tk - tf - 0.05, ease: "power2.out" }, tf); S.sfx("whoosh", tf + 0.1, 1);
      S.to(you, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.24, ease: "power3.in" }, tk - 0.02); S.to(hole, { autoAlpha: 0, duration: 0.05 }, tk + 0.2);
      S.shake(tk + 0.22, g); S.sfx("hit", tk + 0.22, 0); S.pulse(you, tk + 0.7, 1.2);
    } });

  def("gear_tag", { w: 320, h: 330, doc: "ترس بيلف ومعاه اسم (الإدارة، النظام، التشغيل شغّال من غيرك)", params: "label", cues: { pop: 0.2, tag: 0.6 },
    build: function (S, p) {
      var C = S.c, w = S.grp(60, 0, 200, 200), gr = S.grp(20, 20, 160, 160, { p: w });
      S.box(0, 0, 160, 160, { r: "50%", bd: [30, C.solid, "dashed"], p: gr }); S.box(24, 24, 112, 112, { r: "50%", bd: [22, C.solid], p: gr });
      S.pop(w, S.T("pop"), { from: 0.3, s: "toggle" }); S.fromTo(gr, { rotation: 0 }, { rotation: 300, duration: Math.max(1, S.t1 - S.T("pop")), ease: "none" }, S.T("pop"));
      var tag = S.grp(10, 220, 300, 92); S.box(0, 0, 300, 92, { bg: C.solid, r: 46, p: tag }); S.txt(p.label || "الإدارة", 84, 0, 204, 92, 46, C.onSolid, { p: tag, l: 1 }); S.check(12, 12, 68, C.onSolid, C.hi === C.onSolid ? C.solid : C.hi, { p: tag });
      S.slide(tag, S.T("tag"), 300, { s: "pop" });
    } });

  def("wallet", { w: 460, h: 480, doc: "محفظة بتتملى كروت (محفظة عملاء، مدخرات، رصيد بيتبني)", params: "label, n (2-4)", cues: { first: 0.2, last: 0.85 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 460, 480), n = Math.max(2, Math.min(4, p.n || 4)), ts = S.spread(n, S.T("first"), S.T("last"));
      S.box(0, 90, 460, 390, { bg: C.solid, r: 40, op: 0.82, p: g });
      var cards = S.grp(0, 0, 460, 480, { p: g });
      S.box(0, 240, 460, 240, { bg: C.solid, r: "26px 26px 40px 40px", p: g }); S.box(18, 258, 424, 204, { r: "18px 18px 28px 28px", bd: [5, C.onSolid, "dashed"], p: g });
      S.txt(p.label || "عملاء", 30, 270, 400, 180, 92, C.onSolid, { p: g });
      S.rise(g, S.t0, { y: 500 });
      for (var c = n - 1; c >= 0; c--) {
        var cd = S.grp(40 + (c % 2) * 26, 176 - c * 46, 360, 190, { p: cards });
        S.box(0, 0, 360, 190, { bg: C.card, r: 24, bd: [5, C.solid], p: cd }); S.box(272, 22, 64, 64, { bg: C.onCard, r: "50%", p: cd });
        S.box(62, 30, 190, 18, { bg: C.onCard, r: 9, op: 0.85, p: cd }); S.box(132, 62, 120, 18, { bg: C.onCard, r: 9, op: 0.35, p: cd });
        S.set(cd, { y: -700, rotation: c % 2 ? 16 : -16, autoAlpha: 0 });
        S.to(cd, { y: 0, rotation: c % 2 ? 3 : -3, autoAlpha: 1, duration: 0.3, ease: "power3.in" }, ts[c] - 0.2); S.sfx("tap", ts[c] + 0.1, 3);
        S.fromTo(g, { scaleY: 1 }, { scaleY: 0.95, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: "50% 100%", ease: "power2.out", immediateRender: false }, ts[c] + 0.1);
      }
    } });

  def("share_ring", { w: 400, h: 400, doc: "حلقة نسبة بتتملى وفي نصها كلمة (حصتك، نسبتك، حقك)", params: "label, pct (0-100)", cues: { pop: 0.1, fill: 0.5, land: 0.9 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 400, 400), ring = S.box(0, 0, 400, 400, { r: "50%", p: g }), pct = p.pct || 40;
      S.box(74, 74, 252, 252, { bg: C.bg, r: "50%", p: g }); S.txt(p.label || "حقك", 80, 80, 240, 240, 112, C.ink, { p: g });
      S.pop(g, S.T("pop"), { from: 0.4 });
      var tf = S.T("fill"), tl = Math.max(tf + 0.5, S.T("land"));
      S.ring(ring, C.solid, C.soft, [{ to: pct * 0.3, t: S.T("pop") + 0.3, d: 0.4 }, { to: pct, t: tf, d: tl - tf, ease: "power2.inOut" }]);
      S.sfx("swell", tl, 0); S.pulse(g, tl + 0.1, 1.1, { s: "mallet", g: 1 });
    } });

  def("tag", { w: 400, h: 150, doc: "ورقة متعلقة عليها شرط أو ملحوظة (حسب تعاقدك، لفترة محدودة، تطبق الشروط)", params: "label", cues: { drop: 0.3 },
    build: function (S, p) {
      var C = S.c, g = S.grp(10, 30, 380, 96);
      S.box(0, 0, 380, 96, { bg: C.card, r: 20, bd: [6, C.bd], p: g }); S.box(176, -16, 28, 28, { bg: C.second, r: "50%", p: g }); S.txt(p.label || "", 10, 0, 360, 96, 46, C.onCard, { p: g, l: 1 });
      S.set(g, { y: -90, rotation: -24, autoAlpha: 0, transformOrigin: "50% 0%" });
      S.to(g, { y: 0, rotation: 5, autoAlpha: 1, duration: 0.5, ease: "elastic.out(1,0.5)" }, S.T("drop")); S.sfx("boop", S.T("drop"), 1);
    } });

  def("badge_flip", { w: 420, h: 720, doc: "كارنيه بيقلب من كلمة لكلمة ومعاه مفتاح (وظيفة ← تمليك، موظف ← شريك، مستأجر ← مالك)", params: "a, b", cues: { a: 0.3, flip: 0.7 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 420, 720), deep = S.P.deep, pop = S.P.pop;
      S.box(197, 0, 26, 150, { bg: C.solid, p: g });
      var fa = S.grp(0, 130, 420, 560, { p: g }), fb = S.grp(0, 130, 420, 560, { p: g });
      S.box(0, 0, 420, 560, { bg: C.card, r: 44, bd: [9, C.bd], p: fa }); S.box(160, 34, 100, 24, { bg: C.onCard, r: 12, p: fa }); S.box(140, 104, 140, 140, { bg: C.onCard, r: "50%", p: fa });
      S.box(80, 284, 260, 20, { bg: C.onCard, r: 10, op: 0.2, p: fa }); S.box(120, 326, 180, 20, { bg: C.onCard, r: 10, op: 0.2, p: fa }); S.txt(p.a || "وظيفتك", 20, 370, 380, 160, 100, C.onCard, { p: fa });
      S.box(0, 0, 420, 560, { bg: deep, r: 44, bd: [9, C.bd], p: fb }); S.box(160, 34, 100, 24, { bg: pop, r: 12, p: fb });
      var key = S.grp(80, 110, 260, 150, { p: fb });
      S.box(150, 15, 110, 110, { r: "50%", bd: [26, pop], p: key }); S.box(0, 58, 162, 26, { bg: pop, r: 13, p: key }); S.box(14, 74, 26, 50, { bg: pop, r: "0 0 10px 10px", p: key }); S.box(62, 74, 26, 38, { bg: pop, r: "0 0 10px 10px", p: key });
      S.txt(p.b || "تمليك", 20, 300, 380, 220, 140, pop, { p: fb });
      S.set(g, { transformOrigin: "50% 0%", rotation: 10 }); S.set(fb, { scaleX: 0, autoAlpha: 0 });
      S.fromTo(g, { y: -900 }, { y: 0, duration: 0.4, ease: "power3.out" }, S.t0 + 0.05); S.sfx("thud", S.t0 + 0.4, -3);
      S.to(g, { rotation: -5, duration: 0.5, ease: "sine.inOut" }, S.t0 + 0.45); S.to(g, { rotation: 0, duration: 0.5, ease: "sine.inOut" }, S.t0 + 0.95);
      S.to(fa, { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" }, S.T("a"));
      var t = S.T("flip") - 0.05;
      S.to(fa, { scaleX: 0, duration: 0.12, ease: "power2.in" }, t); S.tsetv(fb, t + 0.12); S.to(fb, { scaleX: 1, duration: 0.3, ease: "back.out(2.4)" }, t + 0.12);
      S.fromTo(key, { rotation: -40, scale: 0.6 }, { rotation: 0, scale: 1, duration: 0.4, ease: "back.out(2.2)", immediateRender: false }, t + 0.16);
      S.sfx("swipe", t + 0.08, 3); S.sfx("sting", t + 0.2, 0);
    } });

  def("plant", { w: 340, h: 500, doc: "نبتة في قصرية بتكبر ورقة ورقة (حاجة ليك بتكبر، استثمار، نمو مع الوقت)", params: "", cues: { grow: 0.1, done: 0.9 },
    build: function (S) {
      var C = S.c, g = S.grp(0, 0, 340, 500), ts = S.spread(4, S.T("grow") + 0.3, S.T("done"));
      var stem = S.box(163, 120, 16, 260, { bg: C.solid, r: 8, p: g });
      var L = [S.leaf(171, 250, 110, 64, C.second, { p: g }), S.leaf(60, 200, 110, 64, C.second, { p: g }), S.leaf(171, 130, 110, 64, C.hi, { p: g }), S.leaf(76, 80, 96, 56, C.hi, { p: g })];
      S.box(76, 372, 190, 120, { bg: C.solid, r: "14px 14px 44px 44px", p: g }); S.box(56, 352, 230, 40, { bg: C.solid, r: 14, p: g });
      S.set(g, { autoAlpha: 0, y: 80 }); S.to(g, { autoAlpha: 1, y: 0, duration: 0.3, ease: "back.out(1.6)" }, S.T("grow"));
      S.grow(stem, S.T("grow") + 0.1, "y", "50% 100%", { d: 0.5, ease: "power2.out" });
      L.forEach(function (l, i) { S.set(l, { scale: 0, transformOrigin: (i % 2 ? "100%" : "0%") + " 100%" }); S.to(l, { scale: 1, duration: 0.28, ease: "back.out(2.6)" }, ts[i]); S.sfx("blip", ts[i], 1); });
    } });

  def("path_to", { w: 920, h: 720, doc: "طريق بيترسم من نقطة البداية لحد اسم البراند (ابدأ رحلتك مع…)", params: "name (اسم البراند، كلمة أو اتنين)", cues: { go: 0.05, name: 0.6, name2: 0.8 },
    build: function (S, p) {
      var C = S.c, d = "M 70 680 C 390 680 250 510 480 500 S 820 510 810 340", parts = String(p.name || "").split(/\s+/).filter(Boolean);
      var sv = S.svg(0, 0, 920, 720, '<path d="' + d + '" fill="none" stroke="' + C.solid + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 30" opacity="0.35"/><path class="a" d="' + d + '" fill="none" stroke="' + C.hi + '" stroke-width="18" stroke-linecap="round"/>');
      var st = S.box(38, 648, 64, 64, { bg: C.solid, r: "50%" }), dot = S.box(-34, -34, 68, 68, { bg: C.second, r: "50%", bd: [8, C.bg] });
      S.pop(st, S.t0, {});
      var t = S.T("go"), tn = Math.max(t + 0.5, S.T("name"));
      S.draw(S.q(sv, ".a"), t, tn - t + 0.1, { ease: "power1.inOut", s: "swish" }); S.follow(dot, S.q(sv, ".a"), t, tn - t + 0.1, "power1.inOut");
      var one = parts.length < 2, w1 = S.txt(one ? p.name : parts[0], one ? 0 : 440, 10, one ? 920 : 440, 250, 190, C.hi, {}), w2 = one ? null : S.txt(parts.slice(1).join(" "), 0, 10, 460, 250, 190, C.hi, {});
      S.set(w1, { autoAlpha: 0, y: 70, scale: 0.8 }); S.to(w1, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(2.2)" }, tn); S.sfx("pop_big", tn, 0);
      var tl = tn;
      if (w2) { tl = Math.max(tn + 0.2, S.T("name2")); S.set(w2, { autoAlpha: 0, y: 70, scale: 0.8 }); S.to(w2, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(2.2)" }, tl); S.sfx("pop_big", tl, 0); }
      var u = S.box(40, 262, 840, 22, { bg: C.second, r: 11 }); S.grow(u, tl + 0.2, "x", "100% 50%", { s: "swipe", g: -2 });
      S.to(dot, { scale: 1.5, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, tn + 0.15);
    } });

  def("house", { w: 600, h: 540, doc: "بيت بيتبني (عقار، سكن، ملكية، بيتك)", params: "label", cues: { build: 0.1, roof: 0.5, door: 0.8 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 600, 540);
      S.box(40, 520, 520, 10, { bg: C.solid, r: 5, p: g });
      var body = S.box(120, 250, 360, 270, { bg: C.card, r: "0 0 16px 16px", bd: [10, C.bd], p: g });
      var roof = S.svg(60, 60, 480, 210, '<polygon points="240,6 474,200 6,200" fill="' + C.solid + '" stroke="' + C.solid + '" stroke-width="12" stroke-linejoin="round"/>', { p: g });
      var door = S.box(255, 360, 90, 160, { bg: C.hi === C.card ? C.second : C.hi, r: "45px 45px 0 0", p: g }), w1 = S.box(160, 300, 70, 70, { bg: C.onCard, r: 14, p: g }), w2 = S.box(370, 300, 70, 70, { bg: C.onCard, r: 14, p: g });
      S.grow(body, S.T("build"), "y", "50% 100%", { d: 0.4, ease: "back.out(1.6)", s: "whoosh" });
      S.drop(roof, S.T("roof") - 0.3, { y: 500 });
      [w1, w2, door].forEach(function (e, i) { S.pop(e, S.T("door") + i * 0.12, { s: "blip", g: i }); });
      if (p.label) { var l = S.box(360, 0, 240, 96, { bg: C.hi, r: 48 }); S.txt(p.label, 0, 0, 240, 96, 54, C.onHi, { p: l, l: 1 }); S.pop(l, S.T("door") + 0.5, { rot0: 14, rot: 5, s: "mallet" }); }
    } });

  def("key", { w: 520, h: 300, doc: "مفتاح كبير بيدخل ويلف (استلام، ملكية، الحل، الدخول)", params: "", cues: { in: 0.2, turn: 0.7 },
    build: function (S) {
      var C = S.c, g = S.grp(0, 20, 520, 260);
      S.box(300, 20, 220, 220, { r: "50%", bd: [52, C.hi], p: g }); S.box(0, 104, 324, 52, { bg: C.hi, r: 26, p: g }); S.box(28, 136, 52, 100, { bg: C.hi, r: "0 0 20px 20px", p: g }); S.box(124, 136, 52, 76, { bg: C.hi, r: "0 0 20px 20px", p: g });
      S.slide(g, S.T("in"), 900, { s: "whoosh", d: 0.4 }); S.set(g, { rotation: -14 });
      S.to(g, { rotation: 20, duration: 0.3, ease: "back.out(3)" }, S.T("turn")); S.sfx("toggle", S.T("turn"), 3); S.sfx("sting", S.T("turn") + 0.15, -1);
    } });

  def("lock", { w: 400, h: 500, doc: "قفل بيتفتح (فرصة اتفتحت، وصول، سر، حماية بيانات)", params: "open:false لو بيتقفل", cues: { act: 0.5 },
    build: function (S, p) {
      var C = S.c, sh = S.grp(80, 0, 240, 280), g = S.grp(0, 200, 400, 300);
      S.box(0, 0, 240, 300, { r: "120px 120px 0 0", bd: [44, C.solid], p: sh });
      S.box(0, 0, 400, 300, { bg: C.hi, r: 50, bd: [10, C.solid], p: g }); S.box(165, 90, 70, 70, { bg: C.solid, r: "50%", p: g }); S.box(186, 130, 28, 90, { bg: C.solid, r: 14, p: g });
      S.pop(S.root, S.t0, { from: 0.5 });
      var t = S.T("act");
      if (p.open === false) { S.set(sh, { y: -70 }); S.to(sh, { y: 0, duration: 0.2, ease: "power3.in" }, t); S.sfx("toggle", t + 0.2, 4); S.shake(t + 0.2, g); }
      else { S.to(sh, { y: -80, rotation: -18, duration: 0.34, ease: "back.out(3)", transformOrigin: "100% 100%" }, t); S.sfx("toggle", t, 4); S.sfx("mallet", t + 0.15, 0); S.pulse(g, t + 0.1, 1.06, { q: 1 }); }
    } });

  def("door", { w: 440, h: 640, doc: "باب بيتفتح ووراه نور (فرصة، بداية جديدة، ادخل)", params: "", cues: { open: 0.5 },
    build: function (S) {
      var C = S.c;
      S.box(20, 20, 400, 610, { bg: C.hi, r: "24px 24px 0 0", bd: [14, C.solid] });
      for (var i = 0; i < 5; i++) { var r = S.box(210, 320, 14, 150, { bg: C.onHi, r: 7, op: 0.5 }); S.set(r, { rotation: -60 + i * 30, transformOrigin: "50% 0%", scaleY: 0 }); S.to(r, { scaleY: 1, duration: 0.3, ease: "power2.out" }, S.T("open") + 0.2 + i * 0.04); }
      var d = S.box(34, 34, 372, 596, { bg: C.solid, r: "12px 12px 0 0" }); S.box(60, 300, 44, 44, { bg: C.hi, r: "50%", p: d });
      S.set(d, { transformOrigin: "100% 50%" }); S.rise(S.root, S.t0, { y: 300 });
      S.to(d, { scaleX: 0.16, duration: 0.45, ease: "power3.inOut" }, S.T("open")); S.sfx("swipe", S.T("open") + 0.1, 3); S.sfx("shimmer", S.T("open") + 0.3, 2);
    } });

  /* ============ selling, product, digital ============ */
  def("cart", { w: 540, h: 500, doc: "عربية تسوق والحاجات بتقع فيها (شراء، طلبات، مبيعات)", params: "n (2-4)", cues: { first: 0.2, last: 0.8 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 540, 500), n = Math.max(2, Math.min(4, p.n || 3)), ts = S.spread(n, S.T("first"), S.T("last"));
      var items = S.grp(0, 0, 540, 500, { p: g });
      S.svg(0, 0, 540, 500, '<path d="M 20 110 L 100 110 L 160 360 L 440 360 L 500 170 L 126 170" fill="none" stroke="' + C.solid + '" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><circle cx="190" cy="440" r="38" fill="' + C.solid + '"/><circle cx="410" cy="440" r="38" fill="' + C.solid + '"/>', { p: g });
      S.slide(g, S.t0, 800, { s: "whoosh", d: 0.4 });
      for (var i = 0; i < n; i++) {
        var b = S.box(170 + i * 78, 200 - (i % 2) * 40, 100, 130 + (i % 2) * 40, { bg: i % 2 ? C.second : C.hi, r: 18, bd: [7, C.solid], p: items });
        S.drop(b, ts[i] - 0.3, { y: 600, rot0: i % 2 ? 20 : -20, rot: i % 2 ? 5 : -5, s: "tap", g: 3 });
        S.fromTo(g, { y: 0 }, { y: 10, duration: 0.07, yoyo: true, repeat: 1, immediateRender: false }, ts[i]);
      }
    } });

  def("box_open", { w: 520, h: 520, doc: "صندوق بيتفتح ويطلع منه المنتج أو الهدية (عرض، منتج جديد، مفاجأة)", params: "label", cues: { open: 0.4 },
    build: function (S, p) {
      var C = S.c, t = S.T("open"), out = S.grp(110, 150, 300, 200);
      S.box(0, 0, 300, 200, { bg: C.hi, r: 30, bd: [8, C.solid], p: out }); S.txt(p.label || "جديد", 10, 0, 280, 200, 96, C.onHi, { p: out });
      S.box(60, 250, 400, 260, { bg: C.solid, r: "0 0 30px 30px" }); S.box(240, 250, 20, 260, { bg: C.hi });
      var lidL = S.box(40, 210, 230, 50, { bg: C.solid, r: 14 }), lidR = S.box(250, 210, 230, 50, { bg: C.solid, r: 14 });
      S.rise(S.root, S.t0, { y: 400 });
      S.set(lidL, { transformOrigin: "0% 100%" }); S.set(lidR, { transformOrigin: "100% 100%" }); S.set(out, { y: 160, scale: 0.4, autoAlpha: 0 });
      S.to(lidL, { rotation: -110, duration: 0.3, ease: "back.out(2)" }, t); S.to(lidR, { rotation: 110, duration: 0.3, ease: "back.out(2)" }, t); S.sfx("pop_big", t, 0);
      S.to(out, { y: -130, scale: 1, autoAlpha: 1, rotation: -6, duration: 0.45, ease: "back.out(2)" }, t + 0.12); S.sfx("shimmer", t + 0.25, 3);
      S.sway(out, t + 0.7, 5, { rep: 3 });
    } });

  def("laptop", { w: 680, h: 480, doc: "لابتوب والشاشة فيها شغل بيتبني (شغل أونلاين، داشبورد، موقع)", params: "", cues: { on: 0.2, done: 0.85 },
    build: function (S) {
      var C = S.c, g = S.grp(0, 0, 680, 480), ts = S.spread(4, S.T("on") + 0.2, S.T("done"));
      S.box(80, 10, 520, 360, { bg: C.solid, r: 30, p: g }); var scr = S.box(104, 34, 472, 312, { bg: C.bg, r: 14, p: g }); S.box(0, 380, 680, 44, { bg: C.solid, r: "8px 8px 30px 30px", p: g }); S.box(280, 380, 120, 16, { bg: C.bg, r: "0 0 10px 10px", op: 0.5, p: g });
      S.rise(g, S.t0, { y: 500 });
      [[250, 0], [160, 1], [290, 2], [210, 3]].forEach(function (b, i) { var e = S.box(40 + i * 104, 280 - b[0], 80, b[0], { bg: i === 2 ? C.hi : C.solid, r: "14px 14px 0 0", p: scr }); S.grow(e, ts[i], "y", "50% 100%", { d: 0.3, ease: "back.out(2)", s: "blip", g: i - 1 }); });
    } });

  def("search", { w: 760, h: 300, doc: "خانة بحث بيتكتب فيها وعدسة (العميل بيدوّر، سؤال شائع، جوجل)", params: "text", cues: { type: 0.15, done: 0.8 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 60, 760, 170), t = S.T("type"), d = Math.max(0.5, S.T("done") - t);
      S.box(0, 0, 760, 170, { bg: C.card, r: 85, bd: [10, C.bd], p: g });
      S.svg(40, 35, 100, 100, '<circle cx="42" cy="42" r="30" fill="none" stroke="' + C.onCard + '" stroke-width="14"/><line x1="64" y1="64" x2="92" y2="92" stroke="' + C.onCard + '" stroke-width="16" stroke-linecap="round"/>', { p: g });
      var m = S.grp(160, 0, 560, 170, { p: g, css: "overflow:hidden;" }), tx = S.txt(p.text || "", 0, 0, 560, 170, 84, C.onCard, { p: m }), cover = S.box(0, 0, 560, 170, { bg: C.card, p: m });
      S.rise(g, S.t0, { y: 300, s: "pop" });
      S.set(cover, { transformOrigin: "0% 50%" }); S.to(cover, { scaleX: 0, duration: d, ease: "steps(8)" }, t);
      for (var i = 0; i < 6; i++) S.sfx("key", t + d * i / 6, 0);
      S.pulse(g, t + d + 0.1, 1.05, { s: "ding", g: -2 }); void tx;
    } });

  def("pin", { w: 460, h: 620, doc: "علامة مكان بتقع على الخريطة (الموقع، الفرع، منطقتك)", params: "label", cues: { drop: 0.3 },
    build: function (S, p) {
      var C = S.c, t = S.T("drop");
      for (var i = 0; i < 2; i++) { var r = S.box(130 - i * 60, 520 - i * 20, 200 + i * 120, 60 + i * 40, { r: "50%", bd: [8, C.solid] }); S.set(r, { scale: 0, autoAlpha: 1 }); S.to(r, { scale: 1, autoAlpha: 0, duration: 0.8, ease: "power2.out", repeat: 2, repeatDelay: 0.1 }, t + 0.3 + i * 0.15); }
      var g = S.grp(90, 120, 280, 440);
      S.svg(0, 0, 280, 440, '<path d="M 140 430 C 60 300 10 240 10 140 A 130 130 0 0 1 270 140 C 270 240 220 300 140 430 Z" fill="' + C.hi + '" stroke="' + C.solid + '" stroke-width="12"/><circle cx="140" cy="140" r="54" fill="' + C.solid + '"/>', { p: g });
      S.drop(g, t, { y: 700, s: "thud", g: 2 });
      if (p.label) { var l = S.box(60, 0, 340, 100, { bg: C.solid, r: 50 }); S.txt(p.label, 0, 0, 340, 100, 54, C.onSolid, { p: l, l: 1 }); S.pop(l, t + 0.5, { rot0: -10, rot: -4 }); }
    } });

  def("bulb", { w: 420, h: 540, doc: "لمبة بتنوّر (فكرة، حل، لحظة فهم)", params: "", cues: { on: 0.5 },
    build: function (S) {
      var C = S.c, t = S.T("on"), g = S.grp(60, 90, 300, 440);
      var glass = S.box(0, 0, 300, 300, { bg: C.soft, r: "50%", bd: [12, C.solid], p: g });
      S.box(96, 290, 108, 40, { bg: C.solid, r: 10, p: g }); S.box(106, 336, 88, 30, { bg: C.solid, r: 10, p: g }); S.box(120, 372, 60, 28, { bg: C.solid, r: "0 0 20px 20px", p: g });
      S.pop(g, S.t0, { from: 0.4 });
      S.to(glass, { backgroundColor: C.hi, duration: 0.12 }, t); S.sfx("toggle", t, 3); S.sfx("shimmer", t + 0.08, 3); S.pulse(g, t, 1.1, { q: 1 });
      for (var i = 0; i < 7; i++) { var r = S.box(203, 240, 14, 70, { bg: C.hi, r: 7 }), a = (-90 + i * 30) * Math.PI / 180; S.set(r, { rotation: -90 + i * 30, x: Math.sin(a) * 190, y: -Math.cos(a) * 190 - 35, scaleY: 0, transformOrigin: "50% 100%" }); S.to(r, { scaleY: 1, duration: 0.22, ease: "back.out(3)" }, t + 0.06 + i * 0.03); }
    } });

  def("rocket", { w: 420, h: 660, doc: "صاروخ بيطلع (انطلاقة، نمو سريع، بداية قوية)", params: "", cues: { go: 0.55 },
    build: function (S) {
      var C = S.c, g = S.grp(110, 120, 200, 480), t = S.T("go");
      var fl = S.box(60, 360, 80, 150, { bg: C.hi, r: "40px 40px 60px 60px", p: g });
      S.svg(0, 0, 200, 420, '<path d="M 100 0 C 180 80 190 220 170 340 L 30 340 C 10 220 20 80 100 0 Z" fill="' + C.solid + '"/><polygon points="30,250 -30,380 40,340" fill="' + C.second + '"/><polygon points="170,250 230,380 160,340" fill="' + C.second + '"/><circle cx="100" cy="150" r="40" fill="' + C.bg + '"/>', { p: g });
      S.rise(g, S.t0, { y: 500 }); S.set(fl, { scaleY: 0.3, transformOrigin: "50% 0%" });
      S.fromTo(g, { x: -5 }, { x: 5, duration: 0.05, yoyo: true, repeat: Math.max(2, Math.round((t - S.t0 - 0.5) / 0.05)), ease: "none", immediateRender: false }, S.t0 + 0.45);
      S.to(fl, { scaleY: 1.2, duration: 0.2 }, t - 0.2); S.sfx("swell", t, 3);
      S.to(g, { y: -1300, duration: 0.6, ease: "power3.in" }, t); S.to(g, { autoAlpha: 0, duration: 0.1 }, t + 0.52); S.sfx("whoosh", t + 0.3, 4);
      for (var i = 0; i < 4; i++) { var s = S.box(60 + i * 80, 560, 70, 70, { bg: C.soft, r: "50%" }); S.set(s, { scale: 0 }); S.to(s, { scale: 2.2, autoAlpha: 0, y: 30, duration: 0.7, ease: "power2.out" }, t + i * 0.06); }
    } });

  def("heart", { w: 440, h: 420, doc: "قلب بينبض (حب العملاء، إعجاب، اهتمام، صحة)", params: "", cues: { beat: 0.3 },
    build: function (S) {
      var C = S.c, g = S.svg(20, 20, 400, 380, '<path d="M 200 360 C 40 240 10 160 10 110 A 95 95 0 0 1 200 90 A 95 95 0 0 1 390 110 C 390 160 360 240 200 360 Z" fill="' + C.hi + '" stroke="' + C.solid + '" stroke-width="12" stroke-linejoin="round"/>');
      S.pop(g, S.t0, { from: 0.3 });
      var t = S.T("beat"), n = Math.max(2, Math.min(6, Math.floor((S.t1 - t) / 0.55)));
      for (var i = 0; i < n; i++) S.pulse(g, t + i * 0.55, 1.16, { s: "boop", g: i ? -3 : 1 });
    } });

  def("gift", { w: 460, h: 500, doc: "هدية بتنط وشريطها بيتفك (هدية، بونص، عرض مجاني)", params: "", cues: { pop: 0.4 },
    build: function (S) {
      var C = S.c, g = S.grp(0, 0, 460, 500), t = S.T("pop");
      S.box(50, 210, 360, 280, { bg: C.hi, r: "0 0 30px 30px", bd: [10, C.solid], p: g }); S.box(200, 210, 60, 280, { bg: C.solid, p: g });
      var lid = S.grp(20, 140, 420, 90, { p: g }); S.box(0, 0, 420, 90, { bg: C.hi, r: 20, bd: [10, C.solid], p: lid }); S.box(180, 0, 60, 90, { bg: C.solid, p: lid });
      var bw = S.grp(130, 40, 200, 110, { p: g }); S.box(0, 10, 90, 90, { r: "50% 50% 0 50%", bd: [22, C.solid], p: bw }); S.box(110, 10, 90, 90, { r: "50% 50% 50% 0", bd: [22, C.solid], p: bw });
      S.rise(g, S.t0, { y: 500 });
      S.to(lid, { y: -70, rotation: -10, duration: 0.3, ease: "back.out(3)" }, t); S.to(bw, { y: -90, rotation: -10, duration: 0.3, ease: "back.out(3)" }, t); S.sfx("pop_big", t, 0); S.sfx("shimmer", t + 0.1, 3);
      for (var i = 0; i < 8; i++) { var c = S.box(215, 200, 30, 30, { bg: i % 2 ? C.second : C.solid, r: i % 3 ? "50%" : 6 }), a = (-70 + i * 20) * Math.PI / 180; S.set(c, { autoAlpha: 0 }); S.to(c, { autoAlpha: 1, x: Math.sin(a) * (180 + i * 14), y: -Math.cos(a) * 260, rotation: 200, duration: 0.5, ease: "power2.out" }, t + 0.05); S.to(c, { y: "+=160", autoAlpha: 0, duration: 0.5, ease: "power2.in" }, t + 0.55); }
    } });

  def("hourglass", { w: 360, h: 520, doc: "ساعة رملية بتقلب (العرض هيخلص، استنى، وقت محدود)", params: "", cues: { flip: 0.6 },
    build: function (S) {
      var C = S.c, g = S.grp(0, 0, 360, 520);
      S.svg(0, 0, 360, 520, '<rect x="30" y="10" width="300" height="40" rx="16" fill="' + C.solid + '"/><rect x="30" y="470" width="300" height="40" rx="16" fill="' + C.solid + '"/><path d="M 60 50 L 300 50 L 300 120 Q 300 200 190 260 Q 300 320 300 400 L 300 470 L 60 470 L 60 400 Q 60 320 170 260 Q 60 200 60 120 Z" fill="' + C.card + '" stroke="' + C.solid + '" stroke-width="12" stroke-linejoin="round"/><path d="M 90 400 Q 180 330 270 400 L 270 462 L 90 462 Z" fill="' + C.hi + '"/>', { p: g });
      var top = S.box(110, 90, 140, 70, { bg: C.hi === C.card ? C.second : C.hi, r: "0 0 70px 70px", p: g }), dr = S.box(174, 180, 12, 230, { bg: C.hi === C.card ? C.second : C.hi, r: 6, p: g });
      S.pop(g, S.t0, { from: 0.4 }); S.set(top, { transformOrigin: "50% 100%" });
      S.to(top, { scaleY: 0.2, duration: Math.max(0.5, S.T("flip") - S.t0 - 0.3), ease: "none" }, S.t0 + 0.3);
      S.to(g, { rotation: 180, duration: 0.5, ease: "back.inOut(1.6)" }, S.T("flip")); S.sfx("swipe", S.T("flip") + 0.2, 3); S.sfx("thud", S.T("flip") + 0.5, -2); void dr;
    } });

  def("quote", { w: 860, h: 480, doc: "كارت اقتباس أو رأي عميل (شهادة، رأي، جملة مهمة)", params: "text, by", cues: { show: 0.2 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 20, 860, 440);
      S.box(0, 40, 860, 400, { bg: C.card, r: 50, bd: [9, C.bd], p: g }); S.txt("”", 660, -40, 180, 200, 300, C.hi === C.card ? C.second : C.hi, { p: g });
      S.txt(p.text || "", 50, 110, 760, 220, 78, C.onCard, { p: g, wrap: 1 });
      if (p.by) { var l = S.box(40, 350, 320, 90, { bg: C.solid, r: 45, p: g }); S.txt(p.by, 0, 0, 320, 90, 46, C.onSolid, { p: l, l: 1 }); }
      S.set(g, { rotation: -2 }); S.rise(g, S.T("show"), { y: 500 }); S.sway(g, S.T("show") + 0.6, 1.5);
    } });

  def("toggle", { w: 520, h: 300, doc: "زرار بيتحول من مقفول لمفتوح (فعّل، ابدأ، شغّل)", params: "label", cues: { on: 0.5 },
    build: function (S, p) {
      var C = S.c, tr = S.box(60, 30, 400, 190, { bg: C.soft, r: 95, bd: [10, C.solid] }), k = S.box(80, 50, 150, 150, { bg: C.solid, r: "50%" }), t = S.T("on");
      S.pop(S.root, S.t0, { from: 0.5 });
      S.to(k, { x: 210, duration: 0.24, ease: "back.out(2.4)" }, t); S.to(tr, { backgroundColor: C.hi, duration: 0.16 }, t); S.sfx("toggle", t, 4); S.sfx("ding", t + 0.12, -2);
      if (p.label) S.txt(p.label, 0, 226, 520, 74, 50, C.ink, { l: 1 });
    } });
})(typeof window !== "undefined" ? window : globalThis);

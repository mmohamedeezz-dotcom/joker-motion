/* Joker Motion — scenes on the icon library (1,512 Phosphor drawings, ICONS.md): any object the others do not cover. */
(function (G) {
  "use strict";
  var JM = G.JM, def = JM.scene;
  /* ============ the icon library (1,512 drawings, ICONS.md): any object, in the brand's colours ============ */
  function burst(S, cx, cy, r, t, n, col) {
    for (var i = 0; i < n; i++) {
      var ray = S.box(cx - 8, cy - 8, 16, 56, { bg: col, r: 8 }), a = i * 2 * Math.PI / n;
      S.set(ray, { rotation: i * 360 / n, x: Math.sin(a) * r, y: -Math.cos(a) * r - 28, scaleY: 0, transformOrigin: "50% 100%" });
      S.to(ray, { x: Math.sin(a) * (r + 70), y: -Math.cos(a) * (r + 70) - 28, scaleY: 1, duration: 0.2, ease: "power3.out" }, t);
      S.to(ray, { scaleY: 0, x: Math.sin(a) * (r + 130), y: -Math.cos(a) * (r + 130) - 28, duration: 0.24, ease: "power2.in" }, t + 0.22);
    }
  }
  def("icon", { enter: "in", w: 560, h: 660, doc: "رسمة واحدة كبيرة من مكتبة الرسومات لأي حاجة بتتقال (أي اسم من ICONS.md)", params: "icon, label, move:'pop'|'drop'|'rise'|'swing'|'slam'", cues: { in: 0.1, hit: 0.7 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 560, 560), t = S.T("in"), th = Math.max(t + 0.45, S.T("hit")), mv = p.move || "pop";
      var disc = S.box(50, 60, 460, 460, { bg: C.soft, r: "50%", p: g }), ic = S.icon(p.icon, 40, 40, 480, { p: g });
      S.set(disc, { scale: 0 }); S.to(disc, { scale: 1, duration: 0.4, ease: "back.out(1.8)" }, t);
      if (mv === "drop") S.drop(ic, t, { y: 900, rot0: -14 });
      else if (mv === "rise") S.rise(ic, t, { y: 600 });
      else if (mv === "slam") { S.set(ic, { scale: 2.6, autoAlpha: 0, rotation: 16 }); S.to(ic, { scale: 1, autoAlpha: 1, rotation: -4, duration: 0.22, ease: "power4.in" }, t); S.sfx("hit", t + 0.22, 0); S.shake(t + 0.22, g); }
      else if (mv === "swing") { S.set(ic, { transformOrigin: "50% 0%" }); S.pop(ic, t, { rot0: -30, rot: 8 }); S.sway(ic, t + 0.4, -8, { rep: 3, d: 0.6 }); }
      else S.pop(ic, t, { from: 0.3, rot0: -18, rot: 0, s: "pop_big", ease: "back.out(2.2)" });
      burst(S, 280, 290, 250, th, 10, C.hi); S.pulse(ic, th, 1.12, { s: "mallet" });
      S.to(ic, { y: -12, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: 3 }, th + 0.4);
      if (p.label) { var l = S.box(80, 556, 400, 104, { bg: C.solid, r: 52 }); S.txt(p.label, 0, 0, 400, 104, 58, C.onSolid, { p: l, l: 1 }); S.pop(l, t + 0.3, { rot0: 8, rot: -3 }); }
    } });

  def("icon_row", { enter: "first", w: 900, h: 460, doc: "رسمتين أو تلاتة جنب بعض بيظهروا واحدة واحدة مع أسمائهم (خدمات، مميزات، أنواع)", params: "items:[{icon,label}] (2-3)", cues: { first: 0.1, last: 0.8 },
    build: function (S, p) {
      var C = S.c, it = (p.items || []).slice(0, 3), n = it.length || 1, w = 900 / n, ts = S.spread(n, S.T("first"), S.T("last")), sz = Math.min(270, w - 30);
      it.forEach(function (x, i) {
        var cx = 900 - (i + 0.5) * w, g = S.grp(cx - sz / 2, 10, sz, 440);
        S.box(0, 20, sz, sz, { bg: i % 2 ? C.soft : C.card, r: 50, bd: [8, C.bd], p: g }); S.icon(x.icon, sz * 0.12, 20 + sz * 0.12, sz * 0.76, { p: g, shadow: false, fill: C.hi === C.card && !(i % 2) ? C.second : C.hi, line: i % 2 ? C.solid : C.onCard });
        if (x.label) { var l = S.box(0, sz + 44, sz, 90, { bg: C.solid, r: 45, p: g }); S.txt(x.label, 0, 0, sz, 90, 48, C.onSolid, { p: l, l: 1 }); }
        S.set(g, { rotation: i % 2 ? 3 : -3 }); S.rise(g, ts[i], { y: 300, s: i ? "pop" : "whoosh" }); S.pulse(g, ts[i] + 0.45, 1.06, { s: "blip" });
      });
    } });

  def("icon_swap", { enter: "a", w: 560, h: 680, doc: "رسمة بتتحول لرسمة تانية (من مشكلة لحل، من قبل لبعد)", params: "a (اسم رسمة), b (اسم رسمة), a_label, b_label", cues: { a: 0.1, swap: 0.6 },
    build: function (S, p) {
      var C = S.c, t = S.T("a"), tw = Math.max(t + 0.5, S.T("swap"));
      var ga = S.grp(0, 0, 560, 680), gb = S.grp(0, 0, 560, 680);
      S.box(50, 60, 460, 460, { bg: C.soft, r: "50%", p: ga }); S.icon(p.a, 60, 70, 440, { p: ga, fill: C.soft });
      S.box(50, 60, 460, 460, { bg: C.hi, r: "50%", p: gb }); S.icon(p.b, 60, 70, 440, { p: gb, fill: C.card, shade: S.rgba(C.onHi, 0.25) });
      if (p.a_label) { var la = S.box(90, 556, 380, 100, { bg: C.card, r: 50, bd: [7, C.bd], p: ga }); S.txt(p.a_label, 0, 0, 380, 100, 54, C.onCard, { p: la, l: 1 }); }
      if (p.b_label) { var lb = S.box(90, 556, 380, 100, { bg: C.solid, r: 50, p: gb }); S.txt(p.b_label, 0, 0, 380, 100, 54, C.onSolid, { p: lb, l: 1 }); }
      S.pop(ga, t, { from: 0.4, rot0: -10 }); S.set(gb, { scaleX: 0, autoAlpha: 0 });
      S.to(ga, { scaleX: 0, duration: 0.13, ease: "power2.in" }, tw); S.tsetv(gb, tw + 0.13); S.to(gb, { scaleX: 1, duration: 0.3, ease: "back.out(2.4)" }, tw + 0.13);
      S.sfx("swipe", tw + 0.08, 3); S.sfx("sting", tw + 0.22, -1); burst(S, 280, 290, 250, tw + 0.25, 10, C.solid);
    } });

  def("icon_orbit", { enter: "in", w: 900, h: 720, max: 1, doc: "رسمة في النص وحواليها رسومات صغيرة بتطلع (منظومة، كل الخدمات في مكان واحد، قنوات)", params: "icon, around:[اسم رسمة ×3-6], label", cues: { in: 0.05, first: 0.3, last: 0.9 },
    build: function (S, p) {
      var C = S.c, ar = (p.around || []).slice(0, 6), n = ar.length || 1, ts = S.spread(n, S.T("first"), S.T("last")), ringEl = S.box(160, 70, 580, 580, { r: "50%", bd: [6, C.soft, "dashed"] });
      S.fromTo(ringEl, { rotation: 0 }, { rotation: 40, duration: Math.max(1, S.t1 - S.t0), ease: "none" }, S.t0);
      var mid = S.grp(280, 190, 340, 340); S.box(0, 0, 340, 340, { bg: C.solid, r: "50%", p: mid }); S.icon(p.icon, 60, 60, 220, { p: mid, shadow: false, fill: C.hi, line: C.onSolid });
      S.pop(mid, S.T("in"), { from: 0.3, s: "pop_big" });
      ar.forEach(function (nm, i) {
        var a = (-90 + i * 360 / n + 30) * Math.PI / 180, cx = 450 + Math.cos(a) * 290, cy = 360 + Math.sin(a) * 290, g = S.grp(cx - 85, cy - 85, 170, 170);
        S.box(0, 0, 170, 170, { bg: C.card, r: "50%", bd: [7, C.bd], p: g }); S.icon(nm, 35, 35, 100, { p: g, shadow: false, fill: C.hi === C.card ? C.second : C.hi, line: C.onCard });
        S.set(g, { x: (450 - cx) * 0.7, y: (360 - cy) * 0.7, scale: 0.2, autoAlpha: 0 });
        S.to(g, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.36, ease: "back.out(2)" }, ts[i]); S.sfx("blip", ts[i], i - 2);
      });
      if (p.label) { var l = S.box(300, 500, 300, 90, { bg: C.hi, r: 45 }); S.txt(p.label, 0, 0, 300, 90, 50, C.onHi, { p: l, l: 1 }); S.pop(l, S.T("in") + 0.3, {}); }
    } });

  def("icon_card", { enter: "in", w: 580, h: 700, doc: "كارت منتج أو خدمة: رسمة فوق واسم وسطرين (باقة، منتج، خدمة)", params: "icon, title, tag (شارة صغيرة)", cues: { in: 0.1, tag: 0.7 },
    build: function (S, p) {
      var C = S.c, g = S.grp(0, 0, 580, 700), t = S.T("in");
      S.box(14, 18, 580, 680, { bg: C.soft, r: 56, p: g }); S.box(0, 0, 580, 680, { bg: C.card, r: 56, bd: [9, C.bd], p: g });
      S.box(40, 40, 500, 330, { bg: C.hi === C.card ? C.second : C.hi, r: 36, p: g }); var ic = S.icon(p.icon, 160, 65, 260, { p: g, shadow: false, fill: C.card, line: C.solid === C.card ? C.onCard : C.solid });
      S.txt(p.title || "", 30, 390, 520, 130, 96, C.onCard, { p: g }); S.box(120, 540, 340, 22, { bg: C.onCard, r: 11, op: 0.25, p: g }); S.box(180, 590, 220, 22, { bg: C.onCard, r: 11, op: 0.25, p: g });
      S.set(g, { rotation: -3 }); S.rise(g, t, { y: 700 }); S.pop(ic, t + 0.3, { from: 0.2, rot0: -30, s: "pop" });
      if (p.tag) { var l = S.box(330, -30, 280, 96, { bg: C.solid, r: 48 }); S.txt(p.tag, 0, 0, 280, 96, 50, C.onSolid, { p: l, l: 1 }); S.pop(l, S.T("tag"), { rot0: 20, rot: 7, s: "ding" }); }
      S.sway(g, t + 0.8, -1, { d: 1 });
    } });

  def("icon_count", { enter: "first", w: 900, h: 400, doc: "نفس الرسمة متكررة والملوّن منها هو النسبة (٣ من كل ٥، ٨ من ١٠)", params: "icon, n (3-6), k (كام واحدة ملوّنة), label", cues: { first: 0.1, last: 0.8 },
    build: function (S, p) {
      var C = S.c, n = Math.max(3, Math.min(6, p.n || 5)), k = p.k == null ? 3 : p.k, w = 900 / n, sz = Math.min(190, w - 10), ts = S.spread(n, S.T("first"), S.T("last"));
      for (var i = 0; i < n; i++) {
        var on = i < k, ic = S.icon(p.icon || "user", 900 - (i + 0.5) * w - sz / 2, 30, sz, { fill: on ? C.hi : C.soft, line: on ? C.solid : C.soft, shadow: on });
        S.pop(ic, ts[i], { from: 0.2, s: on ? "pop" : "tick", g: on ? 0 : -2 });
      }
      if (p.label) { var l = S.box(250, 270, 400, 104, { bg: C.solid, r: 52 }); S.txt(p.label, 0, 0, 400, 104, 58, C.onSolid, { p: l, l: 1 }); S.pop(l, ts[n - 1] + 0.3, { rot0: 6, rot: -2, s: "mallet" }); }
    } });
})(typeof window !== "undefined" ? window : globalThis);

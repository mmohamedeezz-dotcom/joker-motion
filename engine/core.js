/* Joker Motion engine — core.
   One spec (JSON) + the narration's word times -> captions, colour worlds, scenes and sound cues.
   The same file runs in the browser (real DOM + GSAP, host = JM.browserHost) and in Node (a stub host that only
   collects the sound cues), so picture and sound always come from the same timing. */
(function (G) {
  "use strict";
  var JM = G.JM = G.JM || {};
  JM.scenes = JM.scenes || {};
  JM.scene = function (name, def) { JM.scenes[name] = def; };

  /* ---------- text markup ----------
     «/» new line · «|» new caption group · [ … ] colour bar · *word* key colour · { … } spoken but drawn by the scene
     «، . : ؛ !» are spoken (TTS) but never shown. */
  var PUNCT = /[،,.:؛!]/g, HARAKAT = /[ً-ْٰ]/g;
  function shown(w) { return w.replace(PUNCT, "").replace(HARAKAT, ""); }
  function bare(w) { return shown(w).replace(/[؟?]/g, ""); }
  JM.bare = bare;

  JM.parse = function (spec) {
    var words = [], beats = [];
    (spec.beats || []).forEach(function (b, bi) {
      var toks = String(b.text || "").replace(/([|\/\[\]{}])/g, " $1 ").split(/\s+/).filter(Boolean);
      var groups = [], g = null, line = null, pill = false, ghost = false, first = words.length;
      function newGroup() { g = { lines: [], first: words.length, n: 0, ghost: 0 }; groups.push(g); line = null; }
      function newLine() { line = { items: [], pill: pill }; g.lines.push(line); }
      newGroup();
      toks.forEach(function (t) {
        if (t === "|") { if (g.n || g.ghost) newGroup(); return; }
        if (t === "/") { line = null; return; }
        if (t === "[") { pill = true; line = null; return; }
        if (t === "]") { pill = false; line = null; return; }
        if (t === "{") { ghost = true; return; }
        if (t === "}") { ghost = false; return; }
        if (/^[،,.:؛!؟?…]+$/.test(t)) { if (words.length > first) words[words.length - 1].say += t; return; }
        var key = /^\*.+\*$/.test(t); if (key) t = t.slice(1, -1);
        var idx = words.length;
        words.push({ say: t, text: shown(t), beat: bi });
        if (ghost) { g.ghost++; return; }
        if (!line) newLine();
        line.items.push({ text: shown(t), key: key, i: idx });
        g.n++;
      });
      groups = groups.filter(function (x) { return x.n; });
      beats.push({ spec: b, first: first, n: words.length - first, groups: groups });
    });
    return { words: words, beats: beats };
  };
  /* the text the voice reads: one sentence per beat, markup removed */
  JM.voiceText = function (spec) {
    return (spec.beats || []).map(function (b) {
      var s = String(b.text || "").replace(/[|\/\[\]{}*]/g, " ").replace(/\s+/g, " ").trim();
      return /[.؟!،…]$/.test(s) ? s : s + ".";
    }).join("\n");
  };

  /* ---------- colour ---------- */
  function rgba(hex, a) {
    var h = hex.replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&");
    var n = parseInt(h, 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  JM.rgba = rgba;
  JM.palette = function (p) {
    p = p || {};
    return { paper: p.paper || "#EFEDE8", ink: p.ink || "#151515", accent: p.accent || "#F0522B", deep: p.deep || "#10294A", pop: p.pop || "#F2B544", cream: p.cream || "#F4F1EA" };
  };
  JM.worlds = function (P) {
    function W(o) { o.soft = rgba(o.ink, 0.16); o.dots = rgba(o.ink, 0.12); o.track = rgba(o.ink, 0.16); return o; }
    return {
      paper: W({ bg: P.paper, ink: P.ink, bar: P.accent, barInk: P.ink, solid: P.ink, onSolid: P.paper, hi: P.accent, onHi: P.ink, card: "#FFFFFF", onCard: P.ink, bd: P.ink, second: P.deep, prog: P.accent }),
      deep: W({ bg: P.deep, ink: P.cream, bar: P.pop, barInk: P.deep, solid: P.cream, onSolid: P.deep, hi: P.pop, onHi: P.deep, card: P.cream, onCard: P.deep, bd: P.cream, second: P.accent, prog: P.pop }),
      pop: W({ bg: P.pop, ink: P.deep, bar: P.deep, barInk: P.cream, solid: P.deep, onSolid: P.cream, hi: P.cream, onHi: P.deep, card: P.cream, onCard: P.deep, bd: P.deep, second: P.accent, prog: P.deep }),
      close: W({ bg: P.paper, ink: P.ink, bar: P.deep, barInk: P.paper, solid: P.ink, onSolid: P.paper, hi: P.deep, onHi: P.paper, card: "#FFFFFF", onCard: P.ink, bd: P.ink, second: P.pop, prog: P.deep }),
      hot: W({ bg: P.accent, ink: P.ink, bar: P.ink, barInk: P.paper, solid: P.ink, onSolid: P.paper, hi: P.paper, onHi: P.ink, card: P.paper, onCard: P.ink, bd: P.ink, second: P.deep, prog: P.ink }),
      night: W({ bg: P.ink, ink: P.paper, bar: P.accent, barInk: P.ink, solid: P.paper, onSolid: P.ink, hi: P.accent, onHi: P.ink, card: P.paper, onCard: P.ink, bd: P.paper, second: P.pop, prog: P.accent })
    };
  };

  var FONT_K = { d: 0.47, l: 0.58 };
  function fitSize(text, size, width, font) {
    var n = String(text).replace(/\s/g, "").length + (String(text).split(/\s+/).length - 1) * 0.6;
    return Math.max(24, Math.min(size, Math.floor(width / (Math.max(1, n) * FONT_K[font || "d"]))));
  }
  JM.fitSize = fitSize;

  /* ---------- mount ---------- */
  JM.mount = function (H, spec, WORDS) {
    var P = JM.palette(spec.palette), WL = JM.worlds(P), parsed = JM.parse(spec), N = parsed.words.length;
    if (!N) throw new Error("spec has no words");
    function ws(i) { var w = WORDS[Math.max(0, Math.min(i, WORDS.length - 1))]; return w ? w.start : 0; }
    function we(i) { var w = WORDS[Math.max(0, Math.min(i, WORDS.length - 1))]; return w ? w.end : 0; }
    var END = we(N - 1) + (spec.tail || 2.3), sfx = [];
    function addSfx(kind, t, gain) { if (t >= -0.02 && t < END) sfx.push({ t: Math.max(0, Math.round(t * 1000) / 1000), kind: kind, gain: gain || 0 }); }

    var beats = parsed.beats, world = "paper";
    beats.forEach(function (b, bi) {
      if (b.spec.world && WL[b.spec.world]) world = b.spec.world;
      b.world = world; b.c = WL[world];
      b.t0 = bi === 0 ? 0 : ws(b.first) - 0.12;
    });
    beats.forEach(function (b, bi) { b.t1 = bi + 1 < beats.length ? beats[bi + 1].t0 : END; b.tw = we(b.first + b.n - 1); });

    H.rootBg(beats[0].c.bg);
    var WIPES = ["circle", "corner", "up", "circle", "side"], wipeN = 0;
    function dots(c, t0) {
      var d = H.mk(null, "div", "position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;background-image:radial-gradient(circle," + c.dots + " 3px,transparent 3.5px);background-size:54px 54px", null, { "data-layout-allow-overflow": "" });
      H.fromTo(d, { x: 0, y: 0 }, { x: 54, y: -54, duration: Math.max(1, END - t0), ease: "none" }, t0);
      return d;
    }
    var progSteps = [];
    beats.forEach(function (b, bi) {
      if (bi === 0) { dots(b.c, 0); }
      else if (b.world !== beats[bi - 1].world) {
        var bg = H.mk(null, "div", "position:absolute;left:0;top:0;width:1080px;height:1920px;background:" + b.c.bg), dd = dots(b.c, b.t0);
        var kind = b.spec.wipe || WIPES[wipeN++ % WIPES.length], from, to;
        if (kind === "up") { from = "inset(100% 0% 0% 0%)"; to = "inset(0% 0% 0% 0%)"; }
        else if (kind === "side") { from = "inset(0% 0% 0% 100%)"; to = "inset(0% 0% 0% 0%)"; }
        else if (kind === "corner") { from = "circle(0% at 28% 62%)"; to = "circle(140% at 28% 62%)"; }
        else { from = "circle(0% at 50% 60%)"; to = "circle(125% at 50% 60%)"; }
        H.set([bg, dd], { clipPath: from });
        H.to([bg, dd], { clipPath: to, duration: 0.48, ease: "power3.inOut" }, b.t0 - 0.1);
        addSfx("wipe", b.t0 + 0.14, 0);
        progSteps.push({ t: b.t0 + 0.1, c: b.c });
      }
      buildScene(b, bi);
    });

    /* ----- scenes ----- */
    function buildScene(b, bi) {
      var list = b.spec.scenes || (b.spec.scene ? [b.spec.scene] : []);
      list = list.filter(function (s) { return s && JM.scenes[s.type]; }).slice(0, 2);
      var layer = H.mk(null, "div", "position:absolute;left:0;top:0;width:1080px;height:1920px;visibility:hidden");
      b.layer = layer;
      H.tset(layer, { visibility: "visible" }, b.t0);
      H.fromTo(layer, { scale: 1 }, { scale: b.spec.push || 1.05, duration: b.t1 - b.t0, ease: "none", transformOrigin: "50% 60%" }, b.t0);
      if (bi + 1 < beats.length) H.to(layer, { autoAlpha: 0, y: -50, duration: 0.14, ease: "power2.in" }, b.t1 - 0.14);
      var STAGE = { x: 80, y: 790, w: 920, h: 720 };
      list.forEach(function (sp, k) {
        var def = JM.scenes[sp.type], bx;
        if (list.length === 1) bx = STAGE;
        else bx = { x: k === 0 ? 560 : 80, y: STAGE.y + (k === 0 ? 0 : 70), w: 440, h: STAGE.h - 70 };
        var s = Math.min(bx.w / def.w, bx.h / def.h, sp.max || def.max || 1.45) * (sp.scale || 1);
        var ox = bx.x + (bx.w - def.w * s) / 2 + (sp.dx || 0), oy = bx.y + (bx.h - def.h * s) / 2 + (sp.dy || 0);
        var wrap = H.mk(layer, "div", "position:absolute;left:" + Math.round(ox) + "px;top:" + Math.round(oy) + "px;width:" + def.w + "px;height:" + def.h + "px");
        H.set(wrap, { scale: s, transformOrigin: "0% 0%" });
        var root = H.mk(wrap, "div", "position:absolute;left:0;top:0;width:" + def.w + "px;height:" + def.h + "px");
        var S = sceneApi(b, sp, def, root, k);
        try { def.build(S, sp); } catch (e) { if (G.console) G.console.error("scene " + sp.type + ": " + e.message); throw e; }
      });
    }

    function sceneApi(b, sp, def, root, k) {
      var S = { c: b.c, P: P, t0: b.t0 + (k ? 0.12 : 0), t1: b.t1, tw: b.tw, w: def.w, h: def.h, root: root, p: sp, rgba: rgba };
      S.wt = function (i) { return ws(b.first + Math.max(0, Math.min(b.n - 1, i))); };
      S.wend = function (i) { return we(b.first + Math.max(0, Math.min(b.n - 1, i))); };
      S.n = b.n;
      function find(word) {
        var m = /^(.*?)(?:#(\d+))?$/.exec(word), want = bare(m[1]), nth = +(m[2] || 1), hit = -1, c = 0, i;
        for (i = 0; i < b.n; i++) if (bare(parsed.words[b.first + i].text) === want && ++c === nth) return i;
        for (i = 0; i < b.n; i++) if (bare(parsed.words[b.first + i].text).indexOf(want) >= 0) { hit = i; break; }
        return hit;
      }
      /* cue time: sp.on[name] = "word", "word:end", "word+0.2", 0.5 (share of the beat); else the scene's default share */
      S.T = function (name, dflt) {
        var v = sp.on && sp.on[name], f = def.cues && def.cues[name];
        if (v == null) v = dflt != null ? dflt : (f != null ? f : 0);
        if (typeof v === "number") { return v <= 0 ? S.t0 + 0.02 : S.wt(Math.round(v * (b.n - 1))) - 0.05; }
        var m = /^(.*?)(:end)?([+-]\d*\.?\d+)?$/.exec(String(v)), i = find(m[1]);
        if (i < 0) i = Math.round((f || 0) * (b.n - 1));
        return (m[2] ? S.wend(i) : S.wt(i) - 0.05) + (m[3] ? parseFloat(m[3]) : 0);
      };
      /* n times spread over the beat's words (rows, cards, leaves) */
      S.spread = function (n, from, to) {
        var a = from == null ? S.t0 + 0.15 : from, z = to == null ? Math.max(a + 0.2 * n, S.tw - 0.15) : to, out = [];
        for (var i = 0; i < n; i++) out.push(n === 1 ? a : a + (z - a) * i / (n - 1));
        return out;
      };
      S.sfx = addSfx;
      function css(x, y, w, h) { return "position:absolute;left:" + x + "px;top:" + y + "px;" + (w != null ? "width:" + w + "px;" : "") + (h != null ? "height:" + h + "px;" : ""); }
      S.grp = function (x, y, w, h, o) { o = o || {}; return H.mk(o.p || root, "div", css(x, y, w, h) + (o.css || "")); };
      S.box = function (x, y, w, h, o) {
        o = o || {};
        var st = css(x, y, w, h) + "box-sizing:border-box;";
        if (o.bg) st += "background:" + o.bg + ";";
        if (o.r != null) st += "border-radius:" + (typeof o.r === "number" ? o.r + "px" : o.r) + ";";
        if (o.bd) st += "border:" + o.bd[0] + "px " + (o.bd[2] || "solid") + " " + o.bd[1] + ";";
        if (o.op != null) st += "opacity:" + o.op + ";";
        return H.mk(o.p || root, "div", st + (o.css || ""));
      };
      S.txt = function (text, x, y, w, h, size, color, o) {
        o = o || {};
        var f = o.l ? "l" : "d", sz = o.wrap ? size : fitSize(text, size, w * 0.94, f);
        var st = css(x, y, w, h) + "display:flex;align-items:center;justify-content:center;text-align:center;color:" + color + ";font-size:" + sz + "px;" +
          (o.l ? "font-family:'Second',sans-serif;font-weight:800;line-height:1.5;" : "font-family:'Display',sans-serif;line-height:1.3;") +
          (o.wrap ? "white-space:normal;line-height:1.22;" : "white-space:nowrap;");
        return H.mk(o.p || root, "div", st + (o.css || ""), null, { dir: "rtl" }, String(text));
      };
      S.svg = function (x, y, w, h, inner, o) {
        o = o || {};
        return H.mk(o.p || root, "div", css(x, y, w, h) + (o.css || ""), '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + (o.vw || w) + " " + (o.vh || h) + '" style="overflow:visible">' + inner + "</svg>");
      };
      S.q = function (el, sel) { return H.q(el, sel); };
      S.leaf = function (x, y, w, h, color, o) { o = o || {}; return S.box(x, y, w, h, { bg: color, r: o.flip ? "100% 0 100% 0" : "0 100% 0 100%", p: o.p }); };
      S.check = function (x, y, d, bg, fg, o) {
        o = o || {};
        var e = S.box(x, y, d, d, { bg: bg, r: "50%", p: o.p });
        H.mk(e, "div", "position:absolute;left:27%;top:22%;width:26%;height:44%;border-right:" + Math.round(d * 0.09) + "px solid " + fg + ";border-bottom:" + Math.round(d * 0.09) + "px solid " + fg + ";transform:rotate(40deg)");
        return e;
      };
      S.cross = function (x, y, d, bg, fg, o) {
        o = o || {};
        var e = S.box(x, y, d, d, { bg: bg, r: "50%", p: o.p }), t = Math.round(d * 0.11), l = Math.round(d * 0.66);
        [45, -45].forEach(function (a) { H.mk(e, "div", "position:absolute;left:" + (d - l) / 2 + "px;top:" + (d - t) / 2 + "px;width:" + l + "px;height:" + t + "px;border-radius:" + t / 2 + "px;background:" + fg + ";transform:rotate(" + a + "deg)"); });
        return e;
      };
      S.set = H.set; S.to = H.to; S.fromTo = H.fromTo; S.tsetv = function (el, t) { H.tset(el, { autoAlpha: 1 }, t); };
      /* ready moves; each plays its own sound unless o.q */
      S.pop = function (el, t, o) {
        o = o || {};
        H.set(el, { scale: o.from == null ? 0.5 : o.from, autoAlpha: 0, rotation: o.rot0 || 0 });
        H.to(el, { scale: 1, autoAlpha: 1, rotation: o.rot || 0, duration: o.d || 0.34, ease: o.ease || "back.out(2)" }, t);
        if (!o.q) addSfx(o.s || "pop", t, o.g || 0);
      };
      S.rise = function (el, t, o) {
        o = o || {};
        H.set(el, { y: o.y || 460, autoAlpha: 0 });
        H.to(el, { y: 0, autoAlpha: 1, duration: o.d || 0.4, ease: "back.out(1.5)" }, t);
        if (!o.q) addSfx(o.s || "whoosh", t + 0.1, o.g || 0);
      };
      S.drop = function (el, t, o) {
        o = o || {};
        H.set(el, { y: -(o.y || 800), autoAlpha: 0, rotation: o.rot0 || 0 });
        H.to(el, { y: 0, autoAlpha: 1, rotation: o.rot || 0, duration: o.d || 0.3, ease: "power3.in" }, t);
        H.fromTo(el, { scaleY: 0.88 }, { scaleY: 1, duration: 0.22, ease: "back.out(3)", transformOrigin: "50% 100%", immediateRender: false }, t + (o.d || 0.3));
        if (!o.q) addSfx(o.s || "thud", t + (o.d || 0.3), o.g || 0);
      };
      S.slide = function (el, t, dx, o) {
        o = o || {};
        H.set(el, { x: dx, autoAlpha: 0 });
        H.to(el, { x: 0, autoAlpha: 1, duration: o.d || 0.36, ease: "back.out(1.4)" }, t);
        if (!o.q) addSfx(o.s || "swipe", t + 0.08, o.g || 0);
      };
      S.pulse = function (el, t, k, o) {
        o = o || {};
        H.to(el, { scale: k || 1.14, duration: 0.17, yoyo: true, repeat: 1, ease: "power2.out" }, t);
        if (!o.q) addSfx(o.s || "boop", t, o.g || 0);
      };
      S.grow = function (el, t, axis, origin, o) {
        o = o || {};
        var a = {}, z = { duration: o.d || 0.4, ease: o.ease || "power3.out" };
        a[axis === "x" ? "scaleX" : "scaleY"] = 0; a.transformOrigin = origin || (axis === "x" ? "100% 50%" : "50% 100%");
        z[axis === "x" ? "scaleX" : "scaleY"] = 1;
        H.set(el, a); H.to(el, z, t);
        if (o.s) addSfx(o.s, t + 0.05, o.g || 0);
      };
      S.shake = function (t, el, axis) {
        var a = {}, z = { duration: 0.05, repeat: 3, yoyo: true, ease: "none", immediateRender: false };
        a[axis || "y"] = 0; z[axis || "y"] = 14;
        H.fromTo(el || root, a, z, t);
      };
      S.fade = function (el, t, o) { o = o || {}; H.set(el, { autoAlpha: 0, y: o.y == null ? 24 : o.y }); H.to(el, { autoAlpha: 1, y: 0, duration: o.d || 0.26, ease: "power3.out" }, t); };
      S.sway = function (el, t, deg, o) { o = o || {}; H.to(el, { rotation: deg, duration: o.d || 0.8, ease: "sine.inOut", yoyo: true, repeat: o.rep == null ? 1 : o.rep }, t); };
      S.draw = function (pathEl, t, d, o) { H.draw(pathEl, t, d, (o && o.ease) || "power2.inOut"); if (o && o.s) addSfx(o.s, t + d * 0.4, o.g || 0); };
      S.follow = H.follow; S.ring = H.ring; S.count = H.count;
      return S;
    }

    /* ----- captions: words appear as they are spoken; the keyword sits in a colour bar ----- */
    var caps = H.mk(null, "div", "position:absolute;left:0;top:0;width:1080px;height:1920px");
    var built = [];
    beats.forEach(function (b, bi) {
      b.groups.forEach(function (g, gi) {
        var c = b.c, base = b.spec.size || (bi === 0 && gi === 0 ? 150 : 132);
        var box = H.mk(caps, "div", "position:absolute;left:0;top:262px;width:1080px;display:flex;flex-direction:column;align-items:center;visibility:hidden");
        var items = [];
        g.lines.forEach(function (ln) {
          var txt = ln.items.map(function (x) { return x.text; }).join(" ");
          var size = fitSize(txt, base, ln.pill ? 880 : 960, "d") - (ln.pill ? 0 : 0);
          var row = H.mk(box, "div", "display:flex;justify-content:center;align-items:center;gap:0 30px", null, { dir: "rtl" }), host = row, bg = null;
          if (ln.pill) {
            host = H.mk(row, "div", "position:relative;display:flex;gap:0 30px;padding:0 38px;margin:8px 0", null, { dir: "rtl" });
            bg = H.mk(host, "div", "position:absolute;left:0;top:6px;right:0;bottom:6px;border-radius:30px;z-index:0;background:" + c.bar);
          }
          ln.items.forEach(function (it, wi) {
            var el = H.mk(host, "span", "display:inline-block;white-space:nowrap;line-height:1.32;position:relative;z-index:1;font-family:'Display',sans-serif;font-size:" + size + "px;color:" + (ln.pill ? c.barInk : (it.key ? c.bar : c.ink)), null, null, it.text);
            items.push({ el: el, i: it.i, bg: wi === 0 ? bg : null });
          });
        });
        built.push({ box: box, items: items, first: g.first, last: bi === beats.length - 1 && gi === b.groups.length - 1 });
      });
    });
    built.forEach(function (b, k) {
      var t0 = Math.max(0, ws(b.first) - 0.06);
      var t1 = k + 1 < built.length ? Math.max(t0 + 0.3, ws(built[k + 1].first) - 0.04) : END;
      H.tset(b.box, { visibility: "visible" }, t0);
      b.items.forEach(function (it) {
        var t = ws(it.i) - (it.i === b.first ? 0.05 : 0.14);
        if (it.bg) { H.set(it.bg, { scaleX: 0, transformOrigin: "100% 50%" }); H.to(it.bg, { scaleX: 1, duration: 0.22, ease: "power3.out" }, Math.max(0, t - 0.04)); }
        if (k === 0 && it.i <= 1) { H.fromTo(it.el, { scale: 1.05 }, { scale: 1, duration: 0.5, ease: "power2.out" }, 0); return; }
        H.set(it.el, { opacity: 0, y: 46, scale: 0.82 });
        H.to(it.el, { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: "back.out(2.2)" }, Math.max(0, t));
      });
      if (!b.last) { H.to(b.box, { opacity: 0, y: -34, duration: 0.07, ease: "power2.in" }, t1 - 0.07); H.tset(b.box, { visibility: "hidden" }, t1); }
    });
    addSfx("pop_big", 0, 1);

    /* ----- progress line ----- */
    var c0 = beats[0].c;
    var track = H.mk(null, "div", "position:absolute;left:90px;top:1596px;width:900px;height:6px;border-radius:3px;background:" + c0.track);
    var fill = H.mk(null, "div", "position:absolute;left:90px;top:1596px;width:900px;height:6px;border-radius:3px;background:" + c0.prog);
    H.set(fill, { scaleX: 0, transformOrigin: "100% 50%" });
    H.to(fill, { scaleX: 1, duration: END, ease: "none" }, 0);
    progSteps.forEach(function (s) { H.to(track, { backgroundColor: s.c.track, duration: 0.2 }, s.t); H.to(fill, { backgroundColor: s.c.prog, duration: 0.2 }, s.t); });

    return { end: END, sfx: sfx, beats: beats.map(function (b) { return { t0: b.t0, t1: b.t1, world: b.world }; }), words: parsed.words };
  };

  /* ---------- hosts ---------- */
  JM.stubHost = function () {
    var o = {}, f = function () { return o; }, n = function () {};
    return { mk: f, q: f, set: n, tset: n, to: n, fromTo: n, rootBg: n, draw: n, follow: n, ring: n, count: n };
  };
  JM.browserHost = function (root, gsap, tl) {
    var doc = root.ownerDocument;
    var H = {
      rootBg: function (c) { root.style.background = c; },
      mk: function (parent, tag, style, html, attrs, text) {
        var e = doc.createElement(tag); if (style) e.style.cssText = style;
        if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
        if (html) e.innerHTML = html; if (text != null) e.textContent = text;
        (parent || root).appendChild(e); return e;
      },
      q: function (el, sel) { return el.querySelector(sel); },
      set: function (el, v) { gsap.set(el, v); },
      tset: function (el, v, t) { tl.set(el, v, Math.max(0, t)); },
      to: function (el, v, t) { tl.to(el, v, Math.max(0, t)); },
      fromTo: function (el, a, z, t) { tl.fromTo(el, a, z, Math.max(0, t)); },
      draw: function (p, t, d, ease) { var L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); tl.to(p, { strokeDashoffset: 0, duration: d, ease: ease }, Math.max(0, t)); },
      follow: function (dot, p, t, d, ease) {
        var L = p.getTotalLength(), pr = { v: 0 };
        function place() { var q = p.getPointAtLength(L * pr.v); gsap.set(dot, { x: q.x, y: q.y }); }
        place(); tl.to(pr, { v: 1, duration: d, ease: ease || "power1.inOut", onUpdate: place }, Math.max(0, t));
      },
      ring: function (el, on, off, steps) {
        var pv = { p: 0 };
        function paint() { el.style.background = "conic-gradient(" + on + " " + pv.p + "%, " + off + " 0)"; }
        paint(); steps.forEach(function (s) { tl.to(pv, { p: s.to, duration: s.d, ease: s.ease || "power2.out", onUpdate: paint }, Math.max(0, s.t)); });
      },
      count: function (el, from, to, t, d, fmt) {
        var v = { n: from };
        function paint() { el.textContent = fmt ? fmt(Math.round(v.n)) : String(Math.round(v.n)); }
        paint(); tl.to(v, { n: to, duration: d, ease: "power2.out", onUpdate: paint }, Math.max(0, t));
      }
    };
    return H;
  };
})(typeof window !== "undefined" ? window : globalThis);

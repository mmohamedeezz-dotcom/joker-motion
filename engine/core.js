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
      /* a one-letter prefix written apart («فـ يمسك», «و / كمان») belongs to the next word: never show it alone */
      for (var q = 0; q < toks.length - 1; q++) {
        if (!/^[فوبلك]ـ?$/.test(toks[q])) continue;
        var nq = q + 1; while (nq < toks.length && /^[|\/\[\]{}]$/.test(toks[nq])) nq++;
        if (nq < toks.length && /^\*?[\u0621-\u064A]/.test(toks[nq])) { var pre = toks[q].replace("ـ", ""); toks[nq] = toks[nq].charAt(0) === "*" ? "*" + pre + toks[nq].slice(1) : pre + toks[nq]; toks.splice(q, 1); q--; }
      }
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
    var beats = spec.beats || [];
    return beats.map(function (b, i) {
      var plain = String(b.text || "").replace(/[|\/\[\]{}*]/g, " ").replace(/\s+([،.؟!:])/g, "$1").replace(/\s+/g, " ").trim();
      plain = plain.replace(/(^|\s)([فوبلك])ـ?\s+(?=[\u0621-\u064A])/g, "$1$2");
      var n = plain.split(" ").length, say = String(b.say || "").replace(/\s+/g, " ").trim();
      var s = say && say.split(" ").length === n ? say : plain;          // the vowelled line is used only if it has the same words
      if (!/[.؟!،…:]$/.test(s)) s += i === beats.length - 1 ? "." : "،";
      return s;
    }).join("\n");
  };

  /* ---------- colour ---------- */
  function rgba(hex, a) {
    var h = hex.replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&");
    var n = parseInt(h, 16); return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  JM.rgba = rgba;
  function mix(hex, to, a) {
    function p(h) { h = h.replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&"); var n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
    var x = p(hex), y = p(to);
    return "rgb(" + x.map(function (v, i) { return Math.round(v + (y[i] - v) * a); }).join(",") + ")";
  }
  JM.mix = mix;
  JM.palette = function (p) {
    p = p || {};
    return { paper: p.paper || "#EFEDE8", ink: p.ink || "#151515", accent: p.accent || "#F0522B", deep: p.deep || "#10294A", pop: p.pop || "#F2B544", cream: p.cream || "#F4F1EA" };
  };
  JM.worlds = function (P) {
    function W(o) { o.soft = rgba(o.ink, 0.16); o.dots = rgba(o.ink, 0.12); o.track = rgba(o.ink, 0.16);
      o.grad = "linear-gradient(165deg," + mix(o.bg, "#ffffff", 0.16) + " 0%," + o.bg + " 48%," + mix(o.bg, "#000000", 0.14) + " 100%)";
      o.blobs = [rgba(o.hi === o.card ? o.second : o.hi, 0.34), rgba(o.second, 0.26), "rgba(255,255,255,0.30)"]; return o; }
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

    var RICH = spec.style === "rich";
    H.rootBg(RICH ? beats[0].c.grad : beats[0].c.bg);
    var WIPES = ["circle", "corner", "up", "circle", "side"], wipeN = 0, TRANS = ["left", "zoom", "up", "right", "zoom"], sceneryN = 0;
    /* the world behind a scene: paper dots (flat) or a lit gradient with slow colour blobs (rich) */
    function scenery(c, t0, host) {
      var k = sceneryN++, d;
      if (!RICH) {
        d = H.mk(host, "div", "position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;background-image:radial-gradient(circle," + c.dots + " 3px,transparent 3.5px);background-size:54px 54px", null, { "data-layout-allow-overflow": "" });
        H.fromTo(d, { x: 0, y: 0 }, { x: 54, y: -54, duration: Math.max(1, END - t0), ease: "none" }, t0);
        return;
      }
      var spots = [[-260, 420, 1000, 0, 180, -120], [520, 1050, 1100, 1, -200, 140], [120, -340, 900, 2, 120, 160]];
      spots.forEach(function (sp, i) {
        var b = H.mk(host, "div", "position:absolute;left:" + (sp[0] + (k % 2 ? 160 : 0)) + "px;top:" + (sp[1] - (k % 3) * 120) + "px;width:" + sp[2] + "px;height:" + sp[2] + "px;border-radius:50%;background:radial-gradient(circle," + c.blobs[sp[3]] + " 0%,transparent 66%)", null, { "data-layout-allow-overflow": "" });
        H.fromTo(b, { x: 0, y: 0, scale: 1 }, { x: sp[4], y: sp[5], scale: 1.18, duration: Math.max(2, END - t0), ease: "sine.inOut" }, t0);
      });
      d = H.mk(host, "div", "position:absolute;left:-60px;top:-60px;width:1200px;height:2040px;opacity:0.5;background-image:radial-gradient(circle," + c.dots + " 2.5px,transparent 3px);background-size:60px 60px", null, { "data-layout-allow-overflow": "" });
      H.fromTo(d, { x: 0, y: 0 }, { x: 60, y: -60, duration: Math.max(1, END - t0), ease: "none" }, t0);
    }
    var progSteps = [];
    beats.forEach(function (b, bi) {
      b.wipe = false;
      if (bi === 0) { scenery(b.c, 0, null); }
      else if (b.world !== beats[bi - 1].world) {
        b.wipe = true;
        var bg = H.mk(null, "div", "position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;background:" + (RICH ? b.c.grad : b.c.bg));
        scenery(b.c, b.t0, bg);
        var kind = b.spec.wipe || WIPES[wipeN++ % WIPES.length], from, to;
        if (kind === "up") { from = "inset(100% 0% 0% 0%)"; to = "inset(0% 0% 0% 0%)"; }
        else if (kind === "side") { from = "inset(0% 0% 0% 100%)"; to = "inset(0% 0% 0% 0%)"; }
        else if (kind === "corner") { from = "circle(0% at 28% 62%)"; to = "circle(140% at 28% 62%)"; }
        else { from = "circle(0% at 50% 60%)"; to = "circle(125% at 50% 60%)"; }
        H.set(bg, { clipPath: from });
        H.to(bg, { clipPath: to, duration: 0.48, ease: "power3.inOut" }, b.t0 - 0.1);
        addSfx("wipe", b.t0 + 0.14, 0);
        progSteps.push({ t: b.t0 + 0.1, c: b.c });
      }
      buildScene(b, bi);
    });

    /* ----- scenes ----- */
    function buildScene(b, bi) {
      var list = b.spec.scenes || (b.spec.scene ? [b.spec.scene] : []);
      list = list.filter(function (s) { return s && JM.scenes[s.type]; }).slice(0, 2);
      var outer = H.mk(null, "div", "position:absolute;left:0;top:0;width:1080px;height:1920px;visibility:hidden");
      var layer = H.mk(outer, "div", "position:absolute;left:0;top:0;width:1080px;height:1920px");
      b.layer = layer;
      H.tset(outer, { visibility: "visible" }, Math.max(0, b.t0 - 0.04));
      H.fromTo(layer, { scale: 1 }, { scale: b.spec.push || 1.06, duration: b.t1 - b.t0, ease: "none", transformOrigin: "50% 60%" }, b.t0);
      /* how the scene arrives and leaves: a push or a zoom-through between scenes of one world, a soft settle after a colour wipe */
      var nx = beats[bi + 1], tr = b.spec.trans || TRANS[bi % TRANS.length], MOVE = { left: { x: 1150 }, right: { x: -1150 }, up: { y: 1500 }, zoom: { scale: 0.72, autoAlpha: 0 } };
      if (bi > 0) {
        var a = b.wipe ? { scale: 0.88, autoAlpha: 0 } : MOVE[tr], z = { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: b.wipe ? 0.4 : 0.36, ease: "power3.out", transformOrigin: "50% 62%" };
        H.set(outer, a); H.to(outer, z, Math.max(0, b.t0 - 0.04));
        if (!b.wipe) addSfx("whoosh", b.t0 + 0.04, -3);
      }
      if (nx) {
        var ntr = nx.spec.trans || TRANS[(bi + 1) % TRANS.length], OUT = { left: { x: -1150 }, right: { x: 1150 }, up: { y: -1500 }, zoom: { scale: 1.5, autoAlpha: 0 } };
        var o2 = (nx.world !== b.world) ? { autoAlpha: 0, y: -50 } : OUT[ntr], zo = { duration: 0.2, ease: "power3.in", transformOrigin: "50% 62%" };
        for (var kk in o2) zo[kk] = o2[kk];
        H.to(outer, zo, b.t1 - 0.2); H.tset(outer, { visibility: "hidden" }, b.t1 + 0.02);
      }
      var STAGE = { x: 80, y: 790, w: 920, h: 720 };
      list.forEach(function (sp, k) {
        var def = JM.scenes[sp.type], bx;
        if (list.length === 1) bx = STAGE;
        else bx = { x: k === 0 ? 560 : 80, y: STAGE.y + (k === 0 ? 0 : 70), w: 440, h: STAGE.h - 70 };
        var s = Math.min(bx.w / def.w, bx.h / def.h, sp.max || def.max || 1.45) * (sp.scale || 1);
        var ox = bx.x + (bx.w - def.w * s) / 2 + (sp.dx || 0), oy = bx.y + (bx.h - def.h * s) / 2 + (sp.dy || 0);
        var wrap = H.mk(layer, "div", "position:absolute;left:" + Math.round(ox) + "px;top:" + Math.round(oy) + "px;width:" + def.w + "px;height:" + def.h + "px");;
        H.set(wrap, { scale: s, transformOrigin: "0% 0%" });
        if (!def.plain && sp.backdrop !== false) backdrop(b, wrap, def, s, bi + k, b.t0 + k * 0.1);
        var root = H.mk(wrap, "div", "position:absolute;left:0;top:0;width:" + def.w + "px;height:" + def.h + "px");
        var S = sceneApi(b, sp, def, root, k, s);
        try { def.build(S, sp); } catch (e) { if (G.console) G.console.error("scene " + sp.type + ": " + e.message); throw e; }
      });
    }

    /* a tinted stage behind a drawing: it is there from the beat's first frame, so the screen is never empty while a
       drawing waits for its word; small shapes drift around it */
    function backdrop(b, wrap, def, zoom, n, t) {
      var c = b.c, cx = def.w / 2, cy = def.h / 2, d = Math.min(Math.max(def.w, def.h) * 1.06, 760 / zoom), dark = b.world === "deep" || b.world === "night";
      var tint = dark ? "rgba(255,255,255,0.07)" : (b.world === "pop" || b.world === "hot" ? "rgba(255,255,255,0.22)" : rgba(c.hi === c.card ? c.second : c.hi, 0.16));
      var kinds = ["50%", "38% 62% 55% 45% / 48% 42% 58% 52%", (d * 0.16).toFixed(0) + "px", "62% 38% 44% 56% / 55% 60% 40% 45%"];
      var g = H.mk(wrap, "div", "position:absolute;left:0;top:0;width:" + def.w + "px;height:" + def.h + "px");
      var blob = H.mk(g, "div", "position:absolute;left:" + (cx - d / 2).toFixed(0) + "px;top:" + (cy - d / 2).toFixed(0) + "px;width:" + d.toFixed(0) + "px;height:" + d.toFixed(0) + "px;border-radius:" + kinds[n % 4] + ";background:" + tint);
      H.set(blob, { scale: 0.2, autoAlpha: 0, rotation: n % 2 ? -18 : 14 });
      H.to(blob, { scale: 1, autoAlpha: 1, rotation: n % 2 ? -6 : 5, duration: 0.5, ease: "back.out(1.6)" }, t);
      H.to(blob, { rotation: n % 2 ? 6 : -7, scale: 1.05, duration: Math.max(1.2, b.t1 - t - 0.5), ease: "sine.inOut" }, t + 0.5);
      var cols = [c.hi === c.card ? c.second : c.hi, dark ? "rgba(255,255,255,0.5)" : rgba(c.ink, 0.45), c.second], u = 22 / zoom;
      [[-0.56, -0.42, 0], [0.58, -0.3, 1], [-0.5, 0.44, 2], [0.52, 0.5, 0], [0.62, 0.08, 1]].forEach(function (q, i) {
        var x = cx + q[0] * d, y = cy + q[1] * d, e;
        if (i % 3 === 0) e = H.mk(g, "div", "position:absolute;left:" + (x - u).toFixed(0) + "px;top:" + (y - u).toFixed(0) + "px;width:" + (2 * u).toFixed(0) + "px;height:" + (2 * u).toFixed(0) + "px;border-radius:50%;background:" + cols[q[2]]);
        else if (i % 3 === 1) e = H.mk(g, "div", "position:absolute;left:" + (x - u).toFixed(0) + "px;top:" + (y - u).toFixed(0) + "px;width:" + (2 * u).toFixed(0) + "px;height:" + (2 * u).toFixed(0) + "px;border-radius:50%;box-sizing:border-box;border:" + (u * 0.42).toFixed(1) + "px solid " + cols[q[2]]);
        else e = H.mk(g, "div", "position:absolute;left:" + (x - u * 1.3).toFixed(0) + "px;top:" + (y - u * 0.22).toFixed(0) + "px;width:" + (u * 2.6).toFixed(0) + "px;height:" + (u * 0.44).toFixed(1) + "px;border-radius:" + u + "px;background:" + cols[q[2]]);
        H.set(e, { scale: 0, rotation: i * 40 });
        H.to(e, { scale: 1, duration: 0.3, ease: "back.out(3)" }, t + 0.12 + i * 0.07);
        H.to(e, { y: (i % 2 ? 26 : -30) / zoom, x: (i % 2 ? -16 : 20) / zoom, rotation: i * 40 + (i % 2 ? 50 : -40), duration: Math.max(1.2, b.t1 - t - 0.6), ease: "sine.inOut" }, t + 0.45);
      });
    }

    function sceneApi(b, sp, def, root, k, zoom) {
      /* the hard shadow, drawn (not filtered): cheap on any machine, the same offset on screen at every scene size */
      var SHX = (12 / zoom).toFixed(1), SHY = (14 / zoom).toFixed(1), SHC = (b.world === "deep" || b.world === "night") ? "rgba(0,0,0,0.32)" : rgba(P.ink, 0.15), SHO = (b.world === "deep" || b.world === "night") ? 0.32 : 0.15, SHK = (b.world === "deep" || b.world === "night") ? "#000000" : P.ink;
      var C0 = b.c, S = { c: b.c, P: P, t0: b.t0 + (k ? 0.12 : 0), t1: b.t1, tw: b.tw, w: def.w, h: def.h, root: root, p: sp, rgba: rgba };
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
        var raw = S.T0(name, dflt);
        return (def.enter === name && k === 0 && sp.late !== true) ? Math.min(raw, S.t0 + 0.22) : raw;
      };
      S.T0 = function (name, dflt) {
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
        if (o.bd && o.sh !== 0 && o.bg) st += "box-shadow:" + SHX + "px " + SHY + "px 0 " + SHC + ";";
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
      /* a drawing from the icon library, in the world's colours: accent fill + ink line + a soft offset shadow */
      S.icon = function (name, x, y, size, o) {
        o = o || {};
        var IC = G.JM_ICONS || {}, d = IC[name] || IC.star || ["", ""], fill = o.fill || C0.hi, line = o.line || C0.solid;
        var sh = o.shadow === false ? "" : '<g transform="translate(9 11)" fill="' + (o.shade || C0.soft) + '">' + d[0] + d[1] + "</g>";
        return H.mk(o.p || root, "div", css(x, y, size, size), '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 256 256" style="overflow:visible">' + sh + '<g fill="' + fill + '">' + d[0] + '</g><g fill="' + line + '">' + d[1] + "</g></svg>");
      };
      /* a colour illustration from the art library (ART.md), with a soft shadow; falls back to the icon library */
      S.art = function (name, x, y, size, o) {
        o = o || {};
        var A = G.JM_ART || {}, w = H.mk(o.p || root, "div", css(x, y, size, size));
        if (!A[name]) { S.icon(name, 0, 0, size, { p: w }); return w; }
        H.mk(w, "img", "position:absolute;left:0;top:0;width:" + size + "px;height:" + size + "px;" + (o.shadow === false ? "" : "filter:drop-shadow(0 " + Math.round(size * 0.045) + "px " + Math.round(size * 0.05) + "px rgba(0,0,0,0.28));") + (o.blur ? "filter:blur(" + o.blur + "px);opacity:0.92;" : ""), null, { src: A[name], alt: "" });
        return w;
      };
      S.ground = function (cx, y, w, o) { o = o || {}; return H.mk(o.p || root, "div", css(cx - w / 2, y, w, Math.round(w * 0.16)) + "border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,0.30) 0%,rgba(0,0,0,0) 68%)"); };
      S.glow = function (cx, cy, d, col, o) { o = o || {}; return H.mk(o.p || root, "div", css(cx - d / 2, cy - d / 2, d, d) + "border-radius:50%;background:radial-gradient(circle," + (col || "rgba(255,255,255,0.75)") + " 0%,rgba(255,255,255,0) 68%)"); };
      S.spark = function (x, y, d, col, o) { o = o || {}; return H.mk(o.p || root, "div", css(x, y, d, d), '<svg xmlns="http://www.w3.org/2000/svg" width="' + d + '" height="' + d + '" viewBox="0 0 100 100"><path d="M50 0C55 35 65 45 100 50C65 55 55 65 50 100C45 65 35 55 0 50C35 45 45 35 50 0Z" fill="' + col + '"/></svg>'); };
      S.plate = function (x, y, w, h, o) { o = o || {}; return H.mk(o.p || root, "div", css(x, y, w, h) + "border-radius:" + (o.r == null ? 44 : o.r) + "px;background:" + (o.bg || "linear-gradient(160deg,#FFFFFF 0%,#F1EEE8 100%)") + ";box-shadow:0 " + (o.lift || 22) + "px " + (o.soft || 48) + "px rgba(0,0,0,0.20),0 2px 0 rgba(255,255,255,0.9) inset;"); };
      /* ---------- the drawing kit: heavy ink line, flat palette fills, parts that move on their own ---------- */
      var dark = b.world === "deep" || b.world === "night", K = { l: P.ink, w: "#FFFFFF", o: P.accent, n: P.deep, y: P.pop, c: P.cream, sh: "#E2DDD3", g: "#CFCAC0" };
      if (b.world === "deep") K.n = mix(P.deep, "#000000", 0.45);
      if (b.world === "pop") K.y = P.cream;
      if (b.world === "hot") { K.o = P.pop; K.y = "#FFFFFF"; }
      S.K = K;
      function A(f, o) {
        o = o || {};
        return ' fill="' + (f || "none") + '"' + (o.s === 0 ? ' stroke="none"' : ' stroke="' + (o.sc || K.l) + '" stroke-width="' + (o.sw || 10) + '" stroke-linejoin="round" stroke-linecap="round"') +
          (o.op != null ? ' opacity="' + o.op + '"' : "") + (o.t ? ' transform="' + o.t + '"' : "") + (o.da ? ' stroke-dasharray="' + o.da + '"' : "") + (o.cls ? ' class="' + o.cls + '"' : "") + "/>";
      }
      S.d = {
        r: function (x, y, w, h, rx, f, o) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx || 0) + '"' + A(f, o); },
        c: function (cx, cy, r, f, o) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + A(f, o); },
        e: function (cx, cy, rx, ry, f, o) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"' + A(f, o); },
        p: function (dd, f, o) { return '<path d="' + dd + '"' + A(f, o); },
        l: function (dd, o) { return '<path d="' + dd + '"' + A("none", o); },
        g: function (inner, t) { return '<g transform="' + t + '">' + inner + "</g>"; },
        star: function (cx, cy, r, f, o) { var q = r * 0.3; return '<path d="M' + cx + " " + (cy - r) + "l" + q + " " + (r - q) + " " + (r - q) + " " + q + " " + (q - r) + " " + q + " " + (-q) + " " + (r - q) + " " + (-q) + " " + (q - r) + " " + (q - r) + " " + (-q) + " " + (r - q) + " " + (-q) + 'z"' + A(f, { sw: (o && o.sw) || 7 }); },
        tick: function (cx, cy, r, f, tc) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + A(f) + '<path d="M' + (cx - r * 0.42) + " " + cy + "l" + (r * 0.3) + " " + (r * 0.32) + " " + (r * 0.56) + " " + (-r * 0.64) + '"' + A("none", { sc: tc || K.l, sw: Math.max(8, r * 0.2) }); },
        cross: function (cx, cy, r, f, tc) { var k = r * 0.38; return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"' + A(f) + '<path d="M' + (cx - k) + " " + (cy - k) + "l" + 2 * k + " " + 2 * k + "M" + (cx + k) + " " + (cy - k) + "l" + (-2 * k) + " " + 2 * k + '"' + A("none", { sc: tc || K.l, sw: Math.max(8, r * 0.2) }); },
        cloud: function (x, y, k, f) { return '<path transform="translate(' + x + " " + y + ") scale(" + k + ')" d="M10 80a40 40 0 0 1 60-36 50 50 0 0 1 92 10 36 36 0 0 1 8 70H20a30 30 0 0 1-10-44z"' + A(f || K.w, { sw: 10 / k }); },
        leaf: function (x, y, len, ang, f) { return '<path transform="translate(' + x + " " + y + ") rotate(" + ang + ')" d="M0 0C' + (len * 0.25) + " " + (-len * 0.5) + " " + (len * 0.8) + " " + (-len * 0.45) + " " + len + " 0C" + (len * 0.8) + " " + (len * 0.45) + " " + (len * 0.25) + " " + (len * 0.5) + ' 0 0z"' + A(f); },
        person: function (x, y, k, f, f2) { return '<g transform="translate(' + x + " " + y + ") scale(" + k + ')"><path d="M-70 200v-50a70 70 0 0 1 140 0v50z"' + A(f, { sw: 10 / k }) + '<circle cx="0" cy="34" r="40"' + A(f2 || K.w, { sw: 10 / k }) + "</g>"; }
      };
      /* one moving piece of a drawing: its own layer the size of the scene box */
      S.part = function (inner, o) {
        o = o || {};
        return H.mk(o.p || root, "div", "position:absolute;left:0;top:0;width:" + def.w + "px;height:" + def.h + "px", '<svg xmlns="http://www.w3.org/2000/svg" width="' + def.w + '" height="' + def.h + '" viewBox="0 0 ' + def.w + " " + def.h + '" style="overflow:visible">' + (o.sh === 0 ? "" : '<g class="jm-sh" transform="translate(' + SHX + " " + SHY + ')" opacity="' + SHO + '" style="--k:' + SHK + '">' + inner + "</g>") + inner + "</svg>");
      };
      S.floor = function (y, x0, x1, o) { o = o || {}; var m = (x0 + x1) / 2; return S.part(S.d.l("M" + x0 + " " + y + "H" + x1) + S.d.l("M" + (x0 + 30) + " " + (y + 26) + "h60M" + (m - 10) + " " + (y + 26) + "h24M" + (x1 - 130) + " " + (y + 26) + "h90", { sw: 8, op: 0.4 }), { p: o.p, sh: 0 }); };
      S.label = function (text, x, y, w, h, fill, color, o) {
        o = o || {};
        var e = S.box(x, y, w, h, { bg: fill, r: h / 2, bd: [8, K.l], p: o.p }); S.txt(text, 8, 0, w - 16, h - 16, o.size || Math.round(h * 0.5), color, { p: e, l: o.d ? 0 : 1 }); return e;
      };
      /* sparkles that pop around a drawing: [[x, y, r, colour], …] */
      S.stars = function (list, t, o) {
        o = o || {};
        list.forEach(function (st, i) {
          var e = S.part(S.d.star(st[0], st[1], st[2], st[3] || K.y), o);
          H.set(e, { scale: 0, rotation: -60, transformOrigin: st[0] + "px " + st[1] + "px" });
          H.to(e, { scale: 1, rotation: 0, duration: 0.3, ease: "back.out(3)" }, t + i * 0.09);
          H.to(e, { scale: 0.72, duration: 0.5, ease: "sine.inOut", yoyo: true, repeat: 5 }, t + 0.4 + i * 0.13);
        });
        if (!o.q) addSfx("shimmer", t, o.g || 0);
      };
      /* a quiet target where an impact will land, so the frame is alive before the hit */
      S.await = function (cx, cy, r, t0, t1) {
        var e = S.part(S.d.c(cx, cy, r, "none", { sw: 6, sc: C0.soft, da: "10 22" }), { sh: 0 });
        H.set(e, { scale: 0.6, autoAlpha: 0, transformOrigin: cx + "px " + cy + "px" });
        H.to(e, { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(2)" }, t0);
        H.to(e, { rotation: 90, duration: Math.max(0.3, t1 - t0), ease: "none" }, t0);
        H.to(e, { scale: 1.25, autoAlpha: 0, duration: 0.14, ease: "power2.in" }, t1 - 0.06);
        return e;
      };
      S.org = function (el, x, y) { H.set(el, { transformOrigin: x + "px " + y + "px" }); return el; };
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
        /* the caption lives between top:262 and the scene stage (y 790): measure every line first and shrink the whole
           group together when it would run into the drawings, so text never sits on text or on a scene */
        var CAP_H = 506, fits = g.lines.map(function (ln) { return fitSize(ln.items.map(function (x) { return x.text; }).join(" "), base, ln.pill ? 880 : 960, "d"); });
        var capH = fits.reduce(function (s, z, li) { return s + z * 1.32 + (g.lines[li].pill ? 16 : 0); }, 0), capK = capH > CAP_H ? CAP_H / capH : 1;
        g.lines.forEach(function (ln, li) {
          var size = Math.floor(fits[li] * capK);
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
      var t1 = k + 1 < built.length ? Math.max(t0 + 0.3, ws(built[k + 1].first) - 0.12) : END;   // the old group is gone before the next one shows: never two captions on top of each other
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

    /* ----- end card: the client's real logo, as it is, on a calm ground that suits it (light by default, ink when the
       logo is made for dark grounds). It sits in the tail after the last word, so it never fights a scene's colours ----- */
    if (spec.logo) {
      var tE = we(N - 1) + 0.3, dk = spec.logo_bg === "dark", ground = dk ? P.ink : P.paper;
      var card = H.mk(null, "div", "position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:50;visibility:hidden;background:" + ground);
      var lgw = H.mk(card, "div", "position:absolute;left:190px;top:700px;width:700px;height:420px;display:flex;align-items:center;justify-content:center");
      H.mk(lgw, "img", "width:100%;height:100%;object-fit:contain;display:block", null, { src: String(spec.logo), alt: "" });
      H.set(card, { clipPath: "circle(0% at 50% 50%)" });
      H.tset(card, { visibility: "visible" }, tE);
      H.to(card, { clipPath: "circle(120% at 50% 50%)", duration: 0.5, ease: "power3.inOut" }, tE);
      H.set(lgw, { autoAlpha: 0, scale: 0.86 });
      H.to(lgw, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, tE + 0.25);
      addSfx("wipe", tE + 0.1, 0);
    }

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

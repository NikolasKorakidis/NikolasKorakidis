// Showreel timeline. Every visual is a pure function of time t (seconds), so the same code
// plays live in the browser and renders frame-exact for video export (window.reel.seek).
(() => {
  const $ = (id) => document.getElementById(id);
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const outExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const outBack = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const lerp = (a, b, x) => a + (b - a) * x;
  const css = (el, o) => { for (const k in o) el.style[k] = o[k]; };
  const show = (el, on) => { el.style.visibility = on ? 'visible' : 'hidden'; };

  // Scene windows: [start, end]
  const SC = {
    intro: [0, 2.6], steven: [2.4, 8], kharon: [7.8, 11.6], argo: [11.4, 15], smug: [14.8, 18.2],
    apps: [18, 21.4], creator: [21.2, 23.8], end: [23.6, 28],
  };
  const DURATION = 28;
  const ORDER = ['intro', 'steven', 'kharon', 'argo', 'smug', 'apps', 'creator', 'end'];
  const inScene = (t, k) => t >= SC[k][0] && t < SC[k][1];

  // Kinetic word: slides up out of its mask
  const rise = (el, t, a, d = 0.6) => { const x = outExpo(seg(t, a, a + d)); css(el, { transform: `translateY(${(1 - x) * 110}%)` }); };
  // Clip reveal from one side
  const wipeIn = (el, t, a, d = 0.7, dir = 'l') => {
    const x = inOut(seg(t, a, a + d)) * 100;
    const m = { l: `inset(0 ${100 - x}% 0 0)`, r: `inset(0 0 0 ${100 - x}%)`, u: `inset(${100 - x}% 0 0 0)`, d: `inset(0 0 ${100 - x}% 0)` }[dir];
    css(el, { clipPath: m });
  };
  // Full-screen colour wipe used between scenes
  const wipe = (el, t, a, d, dir) => {
    const x = inOut(seg(t, a, a + d));
    let tr;
    if (dir === 'up') tr = `translateY(${lerp(100, -100, x)}%)`;
    else if (dir === 'left') tr = `translateX(${lerp(100, -100, x)}%)`;
    else tr = `translateX(${lerp(-100, 100, x)}%) skewX(-12deg)`;
    css(el, { transform: tr }); show(el, x > 0 && x < 1);
  };

  const videos = [...document.querySelectorAll('video[data-scene]')];
  let RENDER = false;

  function videoTime(v, t) {
    const [a] = SC[v.dataset.scene]; const off = +(v.dataset.offset || 0);
    return Math.max(0, t - a - off);
  }

  function draw(t) {
    // ---------- persistent chrome ----------
    const idx = ORDER.findIndex((k, i) => t >= SC[k][0] && (i === ORDER.length - 1 || t < SC[ORDER[i + 1]][0]));
    $('scene-no').textContent = String(Math.max(1, idx + 1)).padStart(2, '0') + ' / ' + String(ORDER.length).padStart(2, '0');
    const s = Math.floor(t), f = Math.floor((t % 1) * 24);
    $('tc').textContent = `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
    css($('prog'), { transform: `scaleX(${t / DURATION})` });
    const label = { intro: 'SHOWREEL', steven: 'FEATURED / BROWSER GAME', kharon: 'GAME / GODOT 4', argo: 'GAME / THREE.JS', smug: 'GAME / GODOT + JSBSIM', apps: 'APPS / REACT NATIVE', creator: 'CREATOR / YOUTUBE', end: 'PORTFOLIO' }[ORDER[Math.max(0, idx)]];
    $('scene-label').textContent = label;

    // ---------- 1. intro ----------
    const intro = $('s-intro'); show(intro, inScene(t, 'intro'));
    if (inScene(t, 'intro')) {
      document.querySelectorAll('#s-intro .gl').forEach((g, i) => css(g, { transform: `scaleX(${outExpo(seg(t, 0.05 + i * 0.06, 0.9 + i * 0.06))})` }));
      rise($('i-1'), t, 0.25); rise($('i-2'), t, 0.42);
      css($('i-3'), { opacity: seg(t, 0.9, 1.3), letterSpacing: `${lerp(30, 10, outExpo(seg(t, 0.9, 1.8)))}px` });
      css($('i-bar'), { transform: `scaleX(${outExpo(seg(t, 0.7, 1.5))})` });
      const z = 1 + 0.04 * seg(t, 0, 2.6); css($('i-name'), { transform: `scale(${z})` });
    }
    wipe($('w-yellow'), t, 2.0, 0.75, 'up');

    // ---------- 2. Steven ----------
    const st = $('s-steven'); show(st, inScene(t, 'steven'));
    if (inScene(t, 'steven')) {
      const a = SC.steven[0];
      css($('st-marquee'), { transform: `translateX(${-((t - a) * 160) % 1600}px)` });
      const p = outBack(seg(t, a + 0.25, a + 1.0));
      css($('st-panel'), { transform: `translate(-50%,-50%) rotate(${lerp(-12, -3, p)}deg) scale(${lerp(0.4, 1, p)})`, opacity: seg(t, a + 0.25, a + 0.45) });
      const cut = t >= a + 3.0;
      show($('v-st-menu'), t < a + 1.9); show($('v-st-dive'), t >= a + 1.9 && !cut); show($('v-st-kraken'), cut);
      css($('st-flash'), { opacity: (t >= a + 1.9 && t < a + 2.0) || (cut && t < a + 3.12) ? 0.8 : 0 });
      ['st-t1', 'st-t2', 'st-t3'].forEach((id, i) => {
        const x = outExpo(seg(t, a + 0.7 + i * 0.12, a + 1.2 + i * 0.12));
        css($(id), { transform: `translateX(${(1 - x) * -120}%) skewX(${(1 - x) * -20}deg)` });
      });
      css($('st-pill'), { transform: `scale(${outBack(seg(t, a + 1.5, a + 1.9))})` });
      css($('st-tag'), { opacity: cut ? 0 : seg(t, a + 1.9, a + 2.2) });
      css($('st-boss'), { opacity: cut ? seg(t, a + 3.1, a + 3.3) : 0, transform: `translateY(${cut ? (1 - outExpo(seg(t, a + 3.1, a + 3.6))) * 30 : 30}px)` });
      css($('st-hand'), { transform: `rotate(${Math.sin((t - a) * 6) * 8}deg)` });
    }
    wipe($('w-navy'), t, 7.4, 0.7, 'skew');

    // ---------- 3. Echoes of Kharon ----------
    const kh = $('s-kharon'); show(kh, inScene(t, 'kharon'));
    if (inScene(t, 'kharon')) {
      const a = SC.kharon[0];
      document.querySelectorAll('#s-kharon .kp').forEach((el, i) => {
        wipeIn(el, t, a + 0.25 + i * 0.14, 0.6, 'u');
        css(el.firstElementChild, { transform: `scale(${1.25 - 0.15 * seg(t, a, a + 3.8)}) translateY(${(i - 1) * 4}%)` });
      });
      const letters = document.querySelectorAll('#kh-title span');
      letters.forEach((l, i) => { const x = outExpo(seg(t, a + 0.6 + i * 0.03, a + 1.0 + i * 0.03)); css(l, { opacity: x, transform: `translateY(${(1 - x) * 40}px)` }); });
      css($('kh-sub'), { opacity: seg(t, a + 1.2, a + 1.5) });
      const m = inOut(seg(t, a + 1.6, a + 2.4));
      css($('kh-ship'), { opacity: 1 - m, transform: `scale(${1 - m * 0.3})` }); css($('kh-mech'), { opacity: m, transform: `scale(${0.7 + m * 0.3})` });
      [['kh-c1', 2, 1.9], ['kh-c2', 3, 2.1], ['kh-c3', 60, 2.3]].forEach(([id, n, d]) => {
        const x = outExpo(seg(t, a + d, a + d + 0.9)); $(id).textContent = Math.round(n * x) + (id === 'kh-c3' ? '' : ''); css($(id).parentElement, { opacity: seg(t, a + d, a + d + 0.2) });
      });
    }
    wipe($('w-gold'), t, 11.0, 0.7, 'left');

    // ---------- 4. Argonisos ----------
    const ar = $('s-argo'); show(ar, inScene(t, 'argo'));
    if (inScene(t, 'argo')) {
      const a = SC.argo[0];
      const r = inOut(seg(t, a + 0.2, a + 1.3)) * 75;
      css($('ar-hero'), { clipPath: `circle(${r}% at 70% 50%)` });
      css($('ar-hero').firstElementChild, { transform: `scale(${1.2 - 0.12 * seg(t, a, a + 3.6)})` });
      document.querySelectorAll('#s-argo .at').forEach((el, i) => { const x = outBack(seg(t, a + 1.6 + i * 0.12, a + 2.1 + i * 0.12)); css(el, { transform: `scale(${x})` }); });
      rise($('ar-t1'), t, a + 0.7, 0.7); rise($('ar-t2'), t, a + 0.95, 0.7);
      css($('ar-key'), { transform: `scaleX(${outExpo(seg(t, a + 0.5, a + 1.5))})` });
    }
    wipe($('w-orange'), t, 14.4, 0.7, 'up');

    // ---------- 5. Smuggler ----------
    const sm = $('s-smug'); show(sm, inScene(t, 'smug'));
    if (inScene(t, 'smug')) {
      const a = SC.smug[0];
      css($('sm-strip'), { transform: `translateX(${lerp(8, -42, inOut(seg(t, a, a + 3.4)))}%) rotate(-4deg)` });
      const st2 = outBack(seg(t, a + 0.7, a + 1.05));
      css($('sm-stamp'), { transform: `translate(-50%,-50%) rotate(-8deg) scale(${lerp(2.4, 1, st2)})`, opacity: seg(t, a + 0.7, a + 0.8) });
      const line = 'FLY LOW. STAY QUIET. GET PAID.'; const n = Math.floor(line.length * seg(t, a + 1.3, a + 2.6));
      $('sm-type').textContent = line.slice(0, n) + (Math.floor(t * 4) % 2 && n < line.length ? '▌' : '');
      css($('sm-year'), { opacity: seg(t, a + 0.3, a + 0.6) });
    }
    wipe($('w-lime'), t, 17.6, 0.7, 'skew');

    // ---------- 6. Apps ----------
    const ap = $('s-apps'); show(ap, inScene(t, 'apps'));
    if (inScene(t, 'apps')) {
      const a = SC.apps[0];
      document.querySelectorAll('#s-apps .ph').forEach((el, i) => {
        const x = outBack(seg(t, a + 0.3 + i * 0.15, a + 1.0 + i * 0.15));
        const fl = Math.sin((t - a) * 1.6 + i) * 6;
        css(el, { transform: `translateY(${(1 - x) * 700 + fl}px) rotate(${(i - 1) * 6 * (1 - x) + (i - 1) * 3}deg)` });
      });
      rise($('ap-t1'), t, a + 0.2); rise($('ap-t2'), t, a + 0.35);
      document.querySelectorAll('#s-apps .chip').forEach((el, i) => css(el, { opacity: seg(t, a + 1.2 + i * 0.1, a + 1.4 + i * 0.1) }));
    }
    wipe($('w-red'), t, 20.8, 0.7, 'left');

    // ---------- 7. Creator ----------
    const cr = $('s-creator'); show(cr, inScene(t, 'creator'));
    if (inScene(t, 'creator')) {
      const a = SC.creator[0];
      const words = document.querySelectorAll('#s-creator .cw'); const k = Math.min(words.length - 1, Math.floor(Math.max(0, t - a - 0.2) / 0.42));
      words.forEach((w, i) => { show(w, i === k); if (i === k) { const x = outExpo(seg(t, a + 0.2 + i * 0.42, a + 0.45 + i * 0.42)); css(w, { transform: `scale(${lerp(1.6, 1, x)})` }); } });
      css($('cr-bg'), { transform: `translateX(${-(t - a) * 220}px)` }); css($('cr-rec'), { opacity: Math.floor(t * 2.5) % 2 ? 1 : 0.15 });
    }
    wipe($('w-black'), t, 23.3, 0.6, 'up');

    // ---------- 8. End ----------
    const en = $('s-end'); show(en, inScene(t, 'end'));
    if (inScene(t, 'end')) {
      const a = SC.end[0];
      rise($('e-1'), t, a + 0.3); rise($('e-2'), t, a + 0.45);
      css($('e-bar'), { transform: `scaleX(${outExpo(seg(t, a + 0.8, a + 1.6))})` });
      document.querySelectorAll('#s-end .role').forEach((el, i) => css(el, { opacity: seg(t, a + 1.0 + i * 0.12, a + 1.3 + i * 0.12), transform: `translateY(${(1 - outExpo(seg(t, a + 1.0 + i * 0.12, a + 1.5 + i * 0.12))) * 16}px)` }));
      css($('e-url'), { opacity: seg(t, a + 1.8, a + 2.2) });
      document.querySelectorAll('#s-end .thumb').forEach((el, i) => { const x = outExpo(seg(t, a + 0.2 + i * 0.08, a + 0.9 + i * 0.08)); css(el, { opacity: 0.55 * x, transform: `translateY(${(1 - x) * 60 - (t - a) * 14}px)` }); });
    }
  }

  async function seek(t) {
    draw(t);
    const waits = [];
    for (const v of videos) {
      const on = inScene(t, v.dataset.scene);
      if (!on) continue;
      const target = Math.min(videoTime(v, t), (v.duration || 99) - 0.05);
      if (Math.abs(v.currentTime - target) > 0.001) waits.push(new Promise((r) => { v.addEventListener('seeked', r, { once: true }); v.currentTime = target; }));
    }
    await Promise.all(waits);
  }

  // Live playback: real clock, videos play natively and are nudged if they drift
  let start = null, paused = false, pauseAt = 0;
  function tick(now) {
    if (RENDER) return;
    if (start === null) start = now;
    const t = paused ? pauseAt : ((now - start) / 1000) % DURATION;
    draw(t);
    for (const v of videos) {
      const on = inScene(t, v.dataset.scene);
      if (on) { const want = videoTime(v, t); if (Math.abs(v.currentTime - want) > 0.3) v.currentTime = want; if (v.paused && !paused) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    }
    requestAnimationFrame(tick);
  }

  window.reel = {
    DURATION, SC,
    render() { RENDER = true; videos.forEach((v) => v.pause()); },
    seek,
    jump(k) { const now = performance.now(); start = now - SC[k][0] * 1000 - 1; paused = false; },
    toggle() { const now = performance.now(); if (paused) { start = now - pauseAt * 1000; paused = false; } else { pauseAt = ((now - start) / 1000) % DURATION; paused = true; videos.forEach((v) => v.pause()); } return paused; },
    ready: Promise.all(videos.map((v) => (v.readyState >= 1 ? 1 : new Promise((r) => v.addEventListener('loadedmetadata', r, { once: true }))))),
  };
  if (!/[?&]render\b/.test(location.search)) {
    // Live: scale the 1280×720 stage to the window, and take chapter commands from a parent page
    const fit = () => { const k = Math.min(innerWidth / 1280, innerHeight / 720); document.getElementById('stage').style.transform = `scale(${k})`; };
    addEventListener('resize', fit); fit();
    addEventListener('message', (e) => {
      if (e.data?.jump && SC[e.data.jump]) window.reel.jump(e.data.jump);
      if (e.data?.toggle) parent.postMessage({ paused: window.reel.toggle() }, '*');
    });
    let last = '';
    setInterval(() => { const k = document.getElementById('scene-label').textContent; if (k !== last) { last = k; parent.postMessage({ scene: ORDER.find((o) => inScene(((performance.now() - (start ?? 0)) / 1000) % DURATION, o)) }, '*'); } }, 200);
    requestAnimationFrame(tick);
  } else window.reel.render();
})();

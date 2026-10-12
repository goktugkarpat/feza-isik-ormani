/* ortak.js – herkesin kullandığı yardımcılar, palet, olay yolu (OLAY), nesne türleri (TUR), oyuncu/ejderha durumları.
   Sözleşme: src/SPEC.md. Klasik script: üst düzey adlar bütün dosyalarla ortak. ?sessiz → ses yok. */
'use strict';
const Q = new URLSearchParams(location.search);
const SESSIZ = Q.has('sessiz');
const cv = document.getElementById('c'), g = cv.getContext('2d');
const T = 40, VH = 560;   // ROWS/COLS/grid bolum.js'te
let W = 0, H = 0, DPR = 1, S = 1, VW = 800;

// ── yardımcılar ──
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mixc = (a, b, t, al = 1) => { const A = hex(a), B = hex(b); return `rgba(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))},${al})`; };

// Renk paleti: karanlık (Ori gecesi) → aydınlık (Gris pembe-şeftali-mor)
const PAL = {
  skyTop: ['#060b1e', '#0c2048'], skyMid: ['#10204a', '#1c5a8a'], skyLow: ['#1d4470', '#7fd0d8'],
  hill: ['#13284c', '#1f5680'], l1: ['#0f2244', '#173f68'], l2: ['#0a1834', '#0f2c50'], l3: ['#06102a', '#0a1e3c'],
  ground: ['#03060f', '#050c1e'], rim: ['#7fe8ff', '#c8fff4'], fog: ['#2a5a8a', '#5ab8cc'], sun: ['#bfe6ff', '#fff2cc'],
  grass: ['#0a1830', '#0e2846'], water: ['#0e2448', '#1a5a80'], wash: ['#2a4a8a', '#7ac0e0'],
};
let light = 0, lightTarget = 0;   // 0..1 dünyanın aydınlığı
const C = (k, al = 1) => mixc(PAL[k][0], PAL[k][1], light, al);

// ── parlama sprite'ları ──
const glowCache = {};
function glow(col) {
  if (glowCache[col]) return glowCache[col];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  const [r, gg, b] = hex(col);
  gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(0.22, `rgba(${r},${gg},${b},0.55)`);
  gr.addColorStop(0.5, `rgba(${r},${gg},${b},0.16)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return glowCache[col] = c;
}
const dglow = (col, x, y, r, a = 1) => { g.globalAlpha = a; g.drawImage(glow(col), x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; };

// ── Feza ──
const P = { x: 0, y: 0, vx: 0, vy: 0, f: 1, ground: true, coyote: 0, buf: 0, dj: true, run: 0, land: 0,
  blink: 2, blinkT: 0, hairV: 0, hairY: 0, idle: 0, safeX: 0, safeY: 0, fade: 0, air: 0, jumpT: 0, lean: 0 };
const PW = 11, PH = 60;

// ── Pırıl ──
const D = { x: 0, y: 0, vx: 0, vy: 0, f: 1, t: 0, spin: 0, mode: 'follow', modeT: 0, blink: 3, blinkT: 0, look: 0 };

// ── parçacıklar ──
const parts = [];
const ripples = [];
function burst(x, y, n, cols, spd = 120, life = 1.2, size = 10) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = spd * (0.3 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life, max: life, col: cols[i % cols.length], size: size * (0.5 + Math.random()) }); }
}


// ── olay yolu: OLAY.on(ad, fn) / OLAY.emit(ad, veri) ──
const OLAY = (() => {
  const L = {};
  return {
    on(ad, fn) { (L[ad] || (L[ad] = [])).push(fn); },
    emit(ad, v) { const a = L[ad]; if (a) for (const fn of a.slice()) { try { fn(v); } catch (e) { console.error('[OLAY ' + ad + ']', e); } } },
  };
})();

// ── nesne türleri: her modül kendi türlerini kaydeder (bkz. SPEC.md) ──
const TUR = (() => {
  const H = {};
  return {
    kaydet(tip, h) { H[tip] = Object.assign(H[tip] || {}, h); },
    al(tip) { return H[tip] || null; },
  };
})();
const NESNELER = [];   // bolum.js doldurur: {tip, x, y, ...}
let DURUM = 'baslik';  // 'baslik' | 'giris' | 'oyun' | 'final' | 'son'
let now = 0;           // saniye (oyun.js her karede günceller)

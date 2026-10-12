/* Feza ve Pırıl: Işık Ormanı – kısa deneme (atmosfer, Feza, Pırıl, animasyonlar, müzik).
   Tek dosya, Canvas 2D, kütüphane yok; file:// ile de çalışır. ?sessiz → ses yok. */
'use strict';
const Q = new URLSearchParams(location.search);
const SESSIZ = Q.has('sessiz');
const cv = document.getElementById('c'), g = cv.getContext('2d');
const T = 40, ROWS = 16, VH = 560;
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

// ── bölüm (kısa deneme yolu) ──
const COLS = 86;
const grid = Array.from({ length: ROWS }, () => new Uint8Array(COLS));   // 0 boş, 1 zemin, 2 üstten geçilen
const ground = (a, b, h) => { for (let x = a; x <= b; x++) for (let y = ROWS - h; y < ROWS; y++) grid[y][x] = 1; };
const plat = (a, b, y) => { for (let x = a; x <= b; x++) grid[y][x] = 2; };
ground(0, 16, 3); ground(17, 22, 4); ground(23, 27, 5);
plat(29, 30, 9); plat(32, 33, 8);
ground(34, 46, 4); plat(37, 38, 10); plat(40, 43, 7);
ground(47, 55, 3); plat(57, 58, 11);
ground(61, 85, 3);
const topOf = c => { for (let y = 0; y < ROWS; y++) if (grid[y][c] === 1) return y; return ROWS; };
const cell = (tx, ty) => (tx < 0 || tx >= COLS) ? 1 : (ty < 0 || ty >= ROWS) ? 0 : grid[ty][tx];

// Işık çiçekleri (açtıkça renk geri gelir) ve sondaki ağaç
const FLOWERS = [[8, 13], [25, 11], [32.5, 8], [41.5, 7], [51, 13], [57.5, 11], [68, 13]].map(([c, r]) => ({ x: c * T + (c % 1 ? 0 : T / 2), y: r * T, open: 0, done: false }));
const TREE = { x: 79 * T, y: 13 * T, lit: 0 };

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
const P = { x: 3 * T, y: 13 * T, vx: 0, vy: 0, f: 1, ground: true, coyote: 0, buf: 0, dj: true, run: 0, land: 0,
  blink: 2, blinkT: 0, hairV: 0, hairY: 0, idle: 0, safeX: 3 * T, safeY: 13 * T, fade: 0, air: 0, jumpT: 0, lean: 0 };
const PW = 11, PH = 60;

// ── Pırıl ──
const D = { x: 2 * T, y: 11 * T, vx: 0, vy: 0, f: 1, t: 0, spin: 0, mode: 'follow', modeT: 0, blink: 3, blinkT: 0, look: 0 };

// ── parçacıklar ──
const parts = [];
const ripples = [];
function burst(x, y, n, cols, spd = 120, life = 1.2, size = 10) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = spd * (0.3 + Math.random()); parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life, max: life, col: cols[i % cols.length], size: size * (0.5 + Math.random()) }); }
}


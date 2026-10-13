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
// hex('#rrggbb') → [r, g, b]. Sonuç önbellekten gelir (her çağrıda yeni dizi yok): dönen diziyi DEĞİŞTİRMEYİN, yalnız okuyun.
const hexOnb = new Map();
const hex = h => {
  let A = hexOnb.get(h);
  if (A === undefined) {
    if (hexOnb.size >= 4096) hexOnb.clear();   // sınırlı (ışıkla karışan renkler çok çeşitli olabilir)
    A = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    hexOnb.set(h, A);
  }
  return A;
};
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
// glow(renk) → 128×128 yumuşak ışık sprite'ı. Önbellek sınırlı: renk kanal başına 4'lük adıma yuvarlanır (en çok 2/255 fark,
// gözle seçilmez) ve en çok GLOW_MAX sprite tutulur; dolunca en uzun süredir kullanılmayan bırakılır (LRU). Aynı renk dizesi
// için arama tek bir Map okumasıdır (dize kesme/ayrıştırma yok). Bırakılan bir sprite'ı elinde tutan çizim onu kullanmaya
// devam edebilir (tuval değiştirilmez, yalnız önbellekten çıkar).
const GLOW_MAX = 96, GLOW_BOY = 128;
const glowQ = new Map();   // nicelenmiş renk (r<<16|g<<8|b) → kayıt { c: tuval|null, u: son kullanım, r, gg, b }
const glowS = new Map();   // gelen renk dizesi → aynı kayıt
const glowSay = { sprite: 0, yapilan: 0, atilan: 0 };   // test/ölçüm için
let glowSaat = 0;
const glowN = v => { v = (v + 2) >> 2 << 2; return v > 255 ? 255 : v < 0 ? 0 : v; };
function glowKayit(col) {
  let r = parseInt(col.slice(1, 3), 16), gg = parseInt(col.slice(3, 5), 16), b = parseInt(col.slice(5, 7), 16);
  if (r !== r) r = 255; if (gg !== gg) gg = 255; if (b !== b) b = 255;   // '#rrggbb' değilse beyaz (eskiden hata verirdi)
  r = glowN(r); gg = glowN(gg); b = glowN(b);
  const k = r << 16 | gg << 8 | b;
  let e = glowQ.get(k);
  if (e === undefined) { e = { c: null, u: 0, r, gg, b }; glowQ.set(k, e); }
  return e;
}
function glowCiz(e) {
  if (glowSay.sprite >= GLOW_MAX) {   // en eski kullanılanı bırak (seyrek: yalnız yeni bir renk gelince)
    let en = null;
    for (const q of glowQ.values()) if (q.c !== null && (en === null || q.u < en.u)) en = q;
    if (en) { en.c = null; glowSay.sprite--; glowSay.atilan++; }
  }
  const c = document.createElement('canvas'); c.width = c.height = GLOW_BOY;
  const h = GLOW_BOY / 2, x = c.getContext('2d'), gr = x.createRadialGradient(h, h, 0, h, h, h);
  const r = e.r, gg = e.gg, b = e.b;
  gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(0.22, `rgba(${r},${gg},${b},0.55)`);
  gr.addColorStop(0.5, `rgba(${r},${gg},${b},0.16)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, GLOW_BOY, GLOW_BOY);
  e.c = c; glowSay.sprite++; glowSay.yapilan++;
}
function glow(col) {
  let e = glowS.get(col);
  if (e === undefined) {
    if (glowS.size >= 2048) glowS.clear();   // dize tablosu da sınırlı (sprite'lar glowQ'da kalır)
    e = glowKayit(col); glowS.set(col, e);
  }
  if (e.c === null) glowCiz(e);
  e.u = ++glowSaat;
  return e.c;
}
// a ≤ 0,002 → 8 bitlik tuvalde hiç iz bırakmaz: çizme
const dglow = (col, x, y, r, a = 1) => { if (a <= 0.002) return; g.globalAlpha = a; g.drawImage(glow(col), x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; };

// ── Feza ──
const P = { x: 0, y: 0, vx: 0, vy: 0, f: 1, ground: true, coyote: 0, buf: 0, dj: true, run: 0, land: 0,
  blink: 2, blinkT: 0, hairV: 0, hairY: 0, idle: 0, safeX: 0, safeY: 0, fade: 0, air: 0, jumpT: 0, lean: 0,
  ucus: null };   // ucus: Bölüm 3 uçuş kancası (ucus.js koyar; doluyken oyun.js normal fiziği atlar, ucus.adim(dt, girdi) çağırır)
const PW = 11, PH = 60;

// ── Pırıl ──
const D = { x: 0, y: 0, vx: 0, vy: 0, f: 1, t: 0, spin: 0, mode: 'follow', modeT: 0, blink: 3, blinkT: 0, look: 0 };

// ── parçacıklar ──
// Parçacık nesneleri havuzdan gelir (ölünce oyun.js drawFx havuza geri koyar): sürekli yeni nesne/çöp yok.
const parts = [];
const ripples = [];
const partsHavuz = [];
function parca(x, y, vx, vy, life, col, size) {
  const p = partsHavuz.length ? partsHavuz.pop() : { x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 0, col: '', size: 0, havuz: true };
  p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.col = col; p.size = size;
  parts.push(p); return p;
}
function burst(x, y, n, cols, spd = 120, life = 1.2, size = 10) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = spd * (0.3 + Math.random()); parca(x, y, Math.cos(a) * s, Math.sin(a) * s - 20, life, cols[i % cols.length], size * (0.5 + Math.random())); }
}


// ── olay yolu: OLAY.on(ad, fn) / OLAY.emit(ad, veri) ──
const OLAY = (() => {
  const L = {};
  return {
    on(ad, fn) { (L[ad] || (L[ad] = [])).push(fn); },
    emit(ad, v) { const a = L[ad]; if (a) for (let i = 0, n = a.length; i < n; i++) { try { a[i](v); } catch (e) { console.error('[OLAY ' + ad + ']', e); } } },   // (n sabit: yayın sırasında eklenen dinleyici bu sefer çağrılmaz; kopya dizi yok)
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

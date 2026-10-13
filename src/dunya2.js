/* dunya2.js – Bölüm 2 "Yıldız Gölü": gece gökyüzü (samanyolu, hilal, aurora), uyanan yıldızların gökte yerleşmesi ve takımyıldızı,
   uzak dağ/ağaç siluetleri (paralaks), geniş sakin göl + göğün yansıması, zemin/kıyı/adalar, ışık tozu kümeleri, ön plan yaprakları.
   Sözleşme: src/BOLUM2.md. Klasik script; adlar "dn2"/"DN2" önekli. dunya.js'e bağımlılık YOK (yalnız ortak.js ve bolum2.js'in
   ROWS/COLS/T/topOf/grid/BOLUM adları, yildiz.js'in YILDIZLAR dizisi; hepsi tembel okunur).
   Performans: gökyüzü ve uzak katmanlar ekran dışı tuvallere bir kez boyanır (boyut değişince yeniden); zemin 512 birimlik
   parçalar halinde önbelleklenir; karede ctx.filter/shadowBlur yok, yalnız küçük sprite'lar ve ince çizgiler çizilir.
   Dışarıya açılan: dn2Background dn2World dn2Foreground dn2Motes dn2Petals dn2Vignette, dn2GokNokta(o) (yıldızın gökteki yeri). */
'use strict';

const DN2 = { ok: false, LH: 0, GREF: 0, GTOP: 0, lakes: [], fill: 0, full: 0, prev: -1, dt: 0.016, hy: 0, q: 1, tm: 0, put: -1 };
const dn2Hx = (h, a) => { const A = hex(h); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };
const dn2Mix = (a, b, t) => { const A = hex(a), B = hex(b); let s = '#'; for (let i = 0; i < 3; i++) s += Math.round(lerp(A[i], B[i], t)).toString(16).padStart(2, '0'); return s; };
const dn2Ok = () => W > 0 && H > 0 && S > 0 && isFinite(S) && isFinite(W) && isFinite(H) && isFinite(cam.x) && isFinite(cam.y) && isFinite(VW);
const dn2Sat = (h, k) => { const A = hex(h), m = (A[0] + A[1] + A[2]) / 3; let r = '#'; for (let i = 0; i < 3; i++) r += clamp(Math.round(m + (A[i] - m) * k), 0, 255).toString(16).padStart(2, '0'); return r; };
// ── Feza odağı: Feza'nın çevresinde (yatay ~±240, dikey ~±140 dünya birimi) ışıltı/parçacık/süs soluklaşır (karakter öne çıksın) ──
const DN2F = { x: -9999, y: -9999, on: false };
function dn2FocusUpdate() { const ok = isFinite(P.x) && isFinite(P.y) && (DURUM === 'oyun' || DURUM === 'giris'); DN2F.on = ok; if (ok) { DN2F.x = (P.x - cam.x) * S; DN2F.y = (P.y - 40 - cam.y) * S; } }
function dn2Foc(px, py) { if (!DN2F.on) return 1; const dx = (px - DN2F.x) / (240 * S), dy = (py - DN2F.y) / (140 * S), d = Math.sqrt(dx * dx + dy * dy); return 0.18 + 0.82 * smooth(clamp((d - 0.55) / 0.95, 0, 1)); }
const dn2Cv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
const dn2Eg = (col, x, y, rx, ry, a) => { if (a <= 0.003) return; g.globalAlpha = a; g.drawImage(glow(col), x - rx, y - ry, rx * 2, ry * 2); g.globalAlpha = 1; };   // elips ışık
const dn2Gs = (n, R) => { let s = 0; for (let i = 0; i < n; i++) s += R(); return (s / n - 0.5) * 2; };   // yaklaşık gauss (-1..1)

// ── yıldız sprite'ı: sıcak çekirdek + ince artı ışıkları ──
const dn2StarC = {};
function dn2StarSpr(col) {
  let c = dn2StarC[col]; if (c) return c;
  c = dn2StarC[col] = dn2Cv(160, 160); const x = c.getContext('2d'), h = 80;
  const core = (r, a0, a1, a2) => { const rg = x.createRadialGradient(0, 0, 0, 0, 0, r); rg.addColorStop(0, a0); rg.addColorStop(0.3, a1); rg.addColorStop(1, a2); return rg; };
  x.translate(h, h); x.globalCompositeOperation = 'lighter';
  x.fillStyle = core(h, dn2Hx(col, 0.55), dn2Hx(col, 0.16), dn2Hx(col, 0)); x.fillRect(-h, -h, 160, 160);
  const flare = (ang, len, wid, a) => { x.save(); x.rotate(ang); x.scale(1, wid / len); x.fillStyle = core(len, dn2Hx(dn2Mix(col, '#ffffff', 0.4), a), dn2Hx(col, a * 0.6), dn2Hx(col, 0)); x.beginPath(); x.arc(0, 0, len, 0, 6.283); x.fill(); x.restore(); };
  flare(0, 78, 4.5, 0.9); flare(Math.PI / 2, 78, 4.5, 0.9); flare(Math.PI / 4, 40, 3, 0.5); flare(-Math.PI / 4, 40, 3, 0.5);
  const wc = dn2Mix(col, '#ffffff', 0.55), A2 = hex(wc); x.fillStyle = core(14, `rgba(${A2[0]},${A2[1]},${A2[2]},1)`, `rgba(${A2[0]},${A2[1]},${A2[2]},0.8)`, `rgba(${A2[0]},${A2[1]},${A2[2]},0)`); x.beginPath(); x.arc(0, 0, 14, 0, 6.283); x.fill();
  return c;
}

// ═══════════ başlangıç: bölüm verisi (tembel) ═══════════
function dn2Init() {
  if (DN2.ok) return; DN2.ok = true;
  DN2.LH = ROWS * T;
  const tops = []; for (let c = 0; c < COLS; c++) { const t = topOf(c); if (t < ROWS) tops.push(t * T); }
  tops.sort((a, b) => a - b);
  DN2.GREF = tops.length ? tops[tops.length >> 1] : DN2.LH - 4 * T; DN2.GTOP = tops.length ? tops[0] : DN2.LH - 4 * T;
  const defSu = (typeof BOLUM !== 'undefined' && BOLUM && BOLUM.su != null) ? BOLUM.su : (ROWS - 4) * T + 10;
  let src = typeof BOLUM !== 'undefined' && BOLUM ? (Array.isArray(BOLUM.gollar) && BOLUM.gollar.length ? BOLUM.gollar : BOLUM.gol ? [BOLUM.gol] : null) : null;
  if (!src) {   // ızgaradaki geniş boşluklar = göl
    src = []; let c = 0;
    while (c < COLS) { if (topOf(c) < ROWS) { c++; continue; } const a = c; while (c < COLS && topOf(c) >= ROWS) c++; if (c - a >= 3) src.push({ x0: a * T, x1: c * T, su: defSu }); }
  }
  DN2.lakes = src.filter(G => G && G.x1 > G.x0).map((G, i) => ({ x0: G.x0, x1: G.x1, su: G.su != null ? G.su : defSu, i }));
  DN2.pits = [];   // su olmayan çukurlar
  { let c = 0; while (c < COLS) { if (topOf(c) < ROWS) { c++; continue; } const a = c; while (c < COLS && topOf(c) >= ROWS) c++; const x0 = a * T, x1 = c * T; if (!DN2.lakes.some(G => x1 > G.x0 + 1 && x0 < G.x1 - 1)) DN2.pits.push([x0, x1]); } }
  dn2BuildSoil();
  dn2BuildDeco();
}
function dn2OnLake(x, pad) { for (let i = 0; i < DN2.lakes.length; i++) { const G = DN2.lakes[i]; if (x > G.x0 - pad && x < G.x1 + pad) return G; } return null; }

// ═══════════ yıldızlar: uyanma / yerleşme durumu ═══════════
const DN2_FALL = [[.12, .34], [.2, .2], [.3, .28], [.36, .14], [.46, .22], [.52, .1], [.6, .2], [.7, .14], [.78, .3], [.86, .22], [.9, .4], [.62, .38], [.42, .4]];
let dn2Stars = null, dn2EdgeL = [], dn2StarsN = -1;
function dn2StarList() {
  const Y = typeof YILDIZLAR !== 'undefined' && Array.isArray(YILDIZLAR) && YILDIZLAR.length ? YILDIZLAR : null;
  if (Y) return Y;
  if (!dn2Stars) dn2Stars = DN2_FALL.map(p => ({ gokX: p[0], gokY: p[1], dn2Fake: true }));
  return dn2Stars;
}
const dn2Pt = { x: 0, y: 0 };
function dn2SkyPt(o, out) {   // yıldızın gökteki ekran konumu (piksel): yildiz.js ile aynı ekran oranı (ylGok)
  const gx = o.gokX !== undefined ? o.gokX : o.x, gy = o.gokY !== undefined ? o.gokY : o.y;
  out.x = clamp(+gx || 0, 0.02, 0.98) * W; out.y = clamp(+gy || 0, 0.03, 0.6) * H;
  return out;
}
function dn2GokNokta(o) {   // dünya koordinatında (kamera şimdiki) yıldızın gökte yerleşeceği nokta: yükselen yıldız oraya uçsun
  dn2Init(); dn2SkyPt(o, dn2Pt);
  return { x: cam.x + dn2Pt.x / S, y: cam.y + dn2Pt.y / S };
}
const DN2_TURTLE = [[0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 1], [1, 2], [7, 9], [9, 10], [3, 11], [11, 12], [12, 13], [13, 6], [4, 12], [5, 12], [11, 2], [13, 8]];
function dn2EdgesGet() {   // takımyıldızı çizgileri: 14 yıldız = kaplumbağa; başka sayıda en kısa dallanma ağacı
  const L = dn2StarList(); if (dn2StarsN === L.length) return dn2EdgeL; dn2StarsN = L.length;
  if (L.length === 14) return dn2EdgeL = DN2_TURTLE;
  const n = L.length, P = L.map(o => { const q = dn2SkyPt(o, {}); return [q.x / W * 1.33, q.y / H]; });
  const d = (i, j) => Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]);
  const E = [], inT = new Array(n).fill(false); if (n < 2) return dn2EdgeL = E;
  inT[0] = true; for (let k = 1; k < n; k++) { let bi = -1, bj = -1, bd = 1e9; for (let i = 0; i < n; i++) if (inT[i]) for (let j = 0; j < n; j++) if (!inT[j]) { const dd = d(i, j); if (dd < bd) { bd = dd; bi = i; bj = j; } } inT[bj] = true; E.push([bi, bj]); }
  return dn2EdgeL = E;
}
// yerleşme zamanı: 'yildizYerlesti' olayı ya da uyanıştan sonra tahmini uçuş süresi
let dn2PendingPut = 0;
OLAY.on('yildiz', d => { const o = d && (d.o || d); if (o && typeof o === 'object') { if (o.dn2Wake === undefined) o.dn2Wake = now; dn2WakeRing(o); } });
OLAY.on('yildizYerlesti', d => { if (d && d.yl) return;
 
  const o = d && (d.o || d.yildiz || d);
  if (o && typeof o === 'object' && (o.gokX !== undefined || o.dn2Wake !== undefined)) { o.dn2Put = now; if (o.dn2Wake === undefined) o.dn2Wake = now; }
  else dn2PendingPut++;
});
OLAY.on('hayvanUyandi', () => { DN2.beast = now; });
const DN2_FLY = 3.4;   // yerleşme olayı gelmezse uyanıştan bu kadar sonra yerleş
function dn2PutT(o, i) {   // yerleşme zamanı (sn) ya da null
  if (o.uyandi !== undefined) { if (!o.uyandi) return null; return o.t > 0 ? o.t : now - 9; }   // yildiz.js: uyandi = gökte yerleşti, t = yerleşme anı
  if (o.dn2Put !== undefined) return o.dn2Put;
  if (o.dn2Wake !== undefined && now - o.dn2Wake > 3.4) return o.dn2Put = o.dn2Wake + 3.4;
  return null;
}
function dn2Update(tm) {   // her karede bir kez (dn2Background içinde): zaman, gökyüzü doluluğu
  const nw = isFinite(now) ? now : 0;
  DN2.dt = DN2.prev < 0 || !isFinite(DN2.prev) ? 0.016 : clamp(nw - DN2.prev, 0, 0.1); DN2.prev = nw; DN2.tm = tm;
  const L = dn2StarList(); let placed = 0, partial = 0;
  for (let i = 0; i < L.length; i++) { const t = dn2PutT(L[i], i); if (t !== null && now >= t) { placed++; partial += smooth(clamp((now - t) / 2.5, 0, 1)) - 1; } }
  const total = Math.max(1, L.length);
  let tgt = (placed + partial) / total;
  if (L[0] && L[0].dn2Fake && typeof SAYAC !== 'undefined' && SAYAC.yildizTop) tgt = SAYAC.yildiz / SAYAC.yildizTop;
  if (DN2.beast !== undefined || DURUM === 'final' || DURUM === 'son') tgt = 1;
  tgt = isFinite(tgt) ? clamp(tgt, 0, 1) : 0;
  if (!isFinite(DN2.fill)) DN2.fill = 0; if (!isFinite(DN2.full)) DN2.full = 0;
  DN2.fill += (tgt - DN2.fill) * (1 - Math.exp(-DN2.dt * 1.6));
  if (Math.abs(tgt - DN2.fill) < 0.0005) DN2.fill = tgt;
  const fullT = tgt >= 0.999 ? 1 : 0;
  if (fullT && DN2.fullT === undefined && DN2.fill > 0.9) DN2.fullT = now;
  DN2.full += (fullT - DN2.full) * (1 - Math.exp(-DN2.dt * 0.7));
}

// ince gürültü (dither): koyu gradyanlarda bant oluşmasın
let dn2NoiseP = null;
function dn2Dither(x, w, h, amt) {
  if (!dn2NoiseP) { const c = dn2Cv(96, 96), t = c.getContext('2d'), im = t.createImageData(96, 96), R = rng(99); for (let i = 0; i < 96 * 96; i++) { const v = R() < 0.5 ? 0 : 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = Math.round(R() * 255); } t.putImageData(im, 0, 0); dn2NoiseP = x.createPattern(c, 'repeat'); }
  x.save(); x.globalAlpha = amt; x.fillStyle = dn2NoiseP; x.fillRect(0, 0, w, h); x.restore();
}
// ═══════════ gökyüzü tuvalleri (boş gece + dolu gece; aradaki geçiş karede karışım) ═══════════
const DN2_SK = { A: null, B: null, C: null, w: 0, h: 0, yh: 0, k: 0.5, cf: -1 };
const DN2_SKYC = {   // [boş gece, yıldızlı gece]: üstten ufka
  g: [['#03041a', '#0a0c46'], ['#070a2e', '#1a1670'], ['#0e1244', '#33268a'], ['#171d5e', '#4e3aa4'], ['#20337a', '#6a58c4'], ['#2a4a8a', '#8fc6e8']],
  at: [0, 0.3, 0.58, 0.8, 0.92, 1],
};
function dn2PaintSky(c, kk, w, h, yh) {
  const x = c.getContext('2d'), R = rng(2024), m = lerp(0.45, 1, kk);
  const gr = x.createLinearGradient(0, 0, 0, yh);
  for (let i = 0; i < 6; i++) gr.addColorStop(DN2_SKYC.at[i], dn2Mix(DN2_SKYC.g[i][0], DN2_SKYC.g[i][1], kk));
  x.fillStyle = gr; x.fillRect(0, 0, w, yh);
  x.fillStyle = dn2Mix('#2a4a8a', '#8fc6e8', kk); x.fillRect(0, yh - 1, w, h - yh + 1);
  // samanyolu: eğimli bir şerit, yumuşak lekeler + koyu toz şeritleri + incecik yıldız tozu
  const bz = (t, a, b, c2, d2) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c2 + t * t * t * d2; };
  const mw = t => [bz(t, -0.08 * w, 0.28 * w, 0.62 * w, 1.08 * w), bz(t, yh * 0.92, yh * 0.64, yh * 0.42, yh * 0.06)];
  x.globalCompositeOperation = 'lighter';
  const cols = ['#5a6cff', '#8a5cff', '#ff78d0', '#4fc8ff', '#a090ff'];
  for (let i = 0; i < 70; i++) {
    const t = R(), [px, py] = mw(t), nx = 0.55, ny = 0.83, off = dn2Gs(3, R) * 0.1 * w, r = (0.05 + R() * 0.12) * w, core = 1 - Math.abs(off) / (0.12 * w);
    const cx = px + nx * off * 0.6, cy = py - ny * off * 0.6, a = (0.025 + 0.05 * clamp(core, 0, 1)) * m * (0.6 + R() * 0.8);
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r), col = cols[Math.floor(R() * cols.length)];
    rg.addColorStop(0, dn2Hx(col, a)); rg.addColorStop(1, dn2Hx(col, 0)); x.fillStyle = rg; x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  for (let i = 0; i < 12; i++) {   // parlak çekirdek
    const t = 0.25 + R() * 0.55, [px, py] = mw(t), r = (0.04 + R() * 0.06) * w, rg = x.createRadialGradient(px, py, 0, px, py, r);
    rg.addColorStop(0, dn2Hx('#cfd8ff', 0.07 * m)); rg.addColorStop(1, 'rgba(200,216,255,0)'); x.fillStyle = rg; x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  x.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 14; i++) {   // koyu toz şeritleri
    const t = 0.1 + R() * 0.8, [px, py] = mw(t), off = dn2Gs(2, R) * 0.05 * w, r = (0.02 + R() * 0.05) * w;
    x.save(); x.translate(px + off, py); x.rotate(-0.9 + R() * 0.3); x.scale(2.6, 1);
    const rg = x.createRadialGradient(0, 0, 0, 0, 0, r); rg.addColorStop(0, `rgba(4,5,26,${0.2 * m})`); rg.addColorStop(1, 'rgba(4,5,26,0)'); x.fillStyle = rg; x.beginPath(); x.arc(0, 0, r, 0, 6.283); x.fill(); x.restore();
  }
  x.globalCompositeOperation = 'lighter';
  // ufuk parıltısı
  { const rg = x.createRadialGradient(w * 0.5, yh, 0, w * 0.5, yh, w * 0.7); rg.addColorStop(0, dn2Hx('#7ae0e8', 0.12 + 0.2 * kk)); rg.addColorStop(0.5, dn2Hx('#7a6ae0', 0.06 + 0.1 * kk)); rg.addColorStop(1, 'rgba(120,100,220,0)');
    x.save(); x.translate(0, yh); x.scale(1, 0.45); x.translate(0, -yh); x.fillStyle = rg; x.fillRect(0, yh - w, w, w * 2); x.restore(); }
  x.globalCompositeOperation = 'source-over';
  // gradyanların piksel başına titreşimi büyütülünce kareli ızgara gibi görünmesin: GPU'da yarıya küçült + geri büyüt (okuma yok); toz ve hilal sonra (keskin kalsın)
  dn2Blur2(x, w, h);
  x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 1100; i++) {   // yıldız tozu
    let px, py; if (R() < 0.62) { const t = R(), q = mw(t), off = dn2Gs(3, R) * 0.09 * w; px = q[0] + 0.55 * off; py = q[1] - 0.83 * off; } else { px = R() * w; py = Math.pow(R(), 1.3) * yh * 0.98; }
    if (py > yh * 0.97 || px < 0 || px > w) continue;
    const s = (0.5 + Math.pow(R(), 4) * 1.4) * (w / 1000 + 0.5), a = (0.1 + R() * 0.5) * m * (py < yh * 0.9 ? 1 : 0.4);
    x.fillStyle = R() < 0.7 ? dn2Hx('#dce8ff', a) : dn2Hx('#ffe0c8', a); x.fillRect(px, py, s, s);
  }
  x.globalCompositeOperation = 'source-over';
  // hilal: çok soluk
  const mx = w * 0.72, my = yh * 0.4, mr = w * 0.026;
  { const rg = x.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 7); rg.addColorStop(0, dn2Hx('#bcd0ff', 0.16 * m)); rg.addColorStop(1, 'rgba(188,208,255,0)'); x.globalCompositeOperation = 'lighter'; x.fillStyle = rg; x.fillRect(mx - mr * 7, my - mr * 7, mr * 14, mr * 14); x.globalCompositeOperation = 'source-over'; }
  const mc = dn2Cv(mr * 3.4, mr * 3.4), mt = mc.getContext('2d'), cc = mr * 1.7;
  mt.fillStyle = dn2Hx('#e6eeff', 0.5 + 0.4 * kk); mt.beginPath(); mt.arc(cc, cc, mr, 0, 6.283); mt.fill();
  mt.globalCompositeOperation = 'destination-out'; mt.fillStyle = '#000'; mt.beginPath(); mt.arc(cc + mr * 0.55, cc - mr * 0.28, mr * 0.86, 0, 6.283); mt.fill();
  x.drawImage(mc, mx - cc, my - cc);
  dn2Dither(x, w, h, 0.016);
}
const dn2BlurC = dn2Cv(2, 2);
function dn2Blur2(x, w, h) {   // 2x2 ortalama (yarı boyuta bilinear küçültme) + geri büyütme; tamamen GPU'da
  const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1); if (dn2BlurC.width !== hw || dn2BlurC.height !== hh) { dn2BlurC.width = hw; dn2BlurC.height = hh; }
  const t = dn2BlurC.getContext('2d'); t.imageSmoothingEnabled = true; t.globalCompositeOperation = 'copy'; t.drawImage(x.canvas, 0, 0, hw * 2, hh * 2, 0, 0, hw, hh);
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.imageSmoothingEnabled = true; x.globalCompositeOperation = 'copy'; x.drawImage(dn2BlurC, 0, 0, w, h); x.restore();
}
function dn2SkyBuild() {
  const k = 0.5, w = Math.max(64, Math.round(W * k)), h = Math.round(0.85 * H * k);
  if (DN2_SK.w === w && DN2_SK.h === h && DN2_SK.A) return;
  const S_ = DN2_SK; S_.w = w; S_.h = h; S_.k = w / W; S_.yh = Math.round(0.75 * H * S_.k);
  S_.A = dn2Cv(w, h); S_.B = dn2Cv(w, h); S_.C = dn2Cv(w, h); S_.cf = -1; S_.bOk = false;
  dn2PaintSky(S_.A, 0, w, h, S_.yh);   // boş gece hemen; dolu gece sonraki karede (ilk karede takılma olmasın)
}
function dn2SkyStep() { const S_ = DN2_SK; if (S_.A && !S_.bOk) { dn2PaintSky(S_.B, 1, S_.w, S_.h, S_.yh); S_.bOk = true; S_.cf = -1; } }
function dn2SkyComp(f) {
  const S_ = DN2_SK; if (Math.abs(S_.cf - f) < 0.003) return S_.C; S_.cf = f;
  const x = S_.C.getContext('2d'); x.globalCompositeOperation = 'copy'; x.globalAlpha = 1; x.drawImage(S_.A, 0, 0);
  x.globalCompositeOperation = 'source-over'; if (S_.bOk) { x.globalAlpha = f; x.drawImage(S_.B, 0, 0); } x.globalAlpha = 1;
  return S_.C;
}

// ── aurora: ışık perdeleri (ince dilimlerle dalgalanır) ──
const dn2AurC = {};
function dn2AurSpr(c0, c1) {
  const key = c0 + c1; if (dn2AurC[key]) return dn2AurC[key];
  const c = dn2AurC[key] = dn2Cv(192, 256), x = c.getContext('2d'), R = rng(c0.charCodeAt(1) * 31 + 7);
  const gr = x.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, dn2Hx(c1, 0)); gr.addColorStop(0.45, dn2Hx(c1, 0.35)); gr.addColorStop(0.82, dn2Hx(c0, 0.8)); gr.addColorStop(0.96, dn2Hx('#ffffff', 0.55)); gr.addColorStop(1, dn2Hx(c0, 0));
  x.fillStyle = gr; x.fillRect(0, 0, 192, 256);
  const st = dn2Cv(192, 1), sx = st.getContext('2d'), im = sx.createImageData(192, 1); let v = 0.6; const vv = []; for (let i = 0; i < 192; i++) { v = clamp(v + (R() - 0.5) * 0.5, 0.15, 1); vv.push(v); }
  for (let i = 0; i < 192; i++) { let m = 0, n = 0; for (let d = -5; d <= 5; d++) { const j = i + d; if (j >= 0 && j < 192) { m += vv[j]; n++; } } m /= n; im.data[i * 4 + 3] = Math.round(255 * (0.7 + m * 0.3) * smooth(Math.min(1, Math.min(i, 191 - i) / 30))); }
  sx.putImageData(im, 0, 0);
  x.globalCompositeOperation = 'destination-in'; x.drawImage(st, 0, 0, 192, 256);
  return c;
}
const DN2_AUR = [
  { c0: '#4cffd2', c1: '#5a7cff', u0: 0.12, u1: 0.74, y: 0.27, h: 0.36, ph: 0, sp: 0.17, a: 1 },
  { c0: '#a98aff', c1: '#ff7ad8', u0: 0.38, u1: 1.04, y: 0.22, h: 0.3, ph: 2.1, sp: 0.13, a: 0.85 },
  { c0: '#5fffd0', c1: '#3aa8ff', u0: -0.06, u1: 0.5, y: 0.34, h: 0.28, ph: 4.2, sp: 0.21, a: 0.7 },
];
function dn2Aurora(tm, hyOff) {   // perde dilimleri eğik (kayma dönüşümü) çizilir: alt kenar kesintisiz dalgalanır, merdiven görünmez; daha az dilim → daha ucuz
  const au = (0.045 + 0.62 * Math.pow(DN2.fill, 0.9) + 0.25 * DN2.full) * (1 + 0.2 * (DN2.reg ? DN2.reg.gol : 0)) + 0.5 * Math.exp(-(now - (DN2.lastPut || -99)) * 0.7) * (now - (DN2.lastPut || -99) < 6 ? 1 : 0); if (au < 0.03) return;
  g.globalCompositeOperation = 'lighter';
  const N = 40, K = 80 / N;
  const ybAt = (A, jj) => A.y * H + Math.sin(tm * A.sp + jj * 0.11 + A.ph) * 0.03 * H + Math.sin(tm * A.sp * 1.7 + jj * 0.26 + A.ph) * 0.012 * H + hyOff;
  for (let ci = 0; ci < DN2_AUR.length; ci++) {
    const A = DN2_AUR[ci], spr = dn2AurSpr(A.c0, A.c1), sw = spr.width / N, dw = W * (A.u1 - A.u0) / N;
    let yb0 = ybAt(A, 0);
    for (let j = 0; j < N; j++) {
      const x0 = (A.u0 + (A.u1 - A.u0) * (j / N)) * W, jm = (j + 0.5) * K, yb1 = ybAt(A, (j + 1) * K);
      const hh = A.h * H * (0.72 + 0.34 * Math.sin(tm * 0.31 + jm * 0.2 + A.ph));
      const a = au * A.a * (0.5 + 0.5 * Math.sin(tm * 0.55 + jm * 0.2 + A.ph * 2)) * Math.pow(Math.sin(Math.PI * (j + 0.5) / N), 0.7);
      if (a >= 0.01) { const k = (yb1 - yb0) / dw; g.setTransform(1, k, 0, 1, 0, 0); g.globalAlpha = Math.min(0.42, a * 0.7); g.drawImage(spr, j * sw, 0, sw, spr.height, x0, yb0 - hh - k * x0, dw + 0.6, hh); }
      yb0 = yb1;
    }
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// ── sönük arka plan yıldızları (canlı pırıltı) ──
const DN2_BGS = (() => { const R = rng(808), a = []; for (let i = 0; i < 90; i++) a.push({ x: R(), y: Math.pow(R(), 1.35) * 0.56, s: 0.5 + Math.pow(R(), 3) * 1.6, ph: R() * 6.28, sp: 0.6 + R() * 1.7, c: R() }); return a; })();
function dn2BgStars(tm) {
  const am = 0.1 + 0.9 * DN2.fill; g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < DN2_BGS.length; i++) {
    if (i / DN2_BGS.length > 0.3 + 0.7 * DN2.fill) continue;   // başta gökyüzü seyrek: doldukça yıldız artar
    const s = DN2_BGS[i], tw = 0.5 + 0.5 * Math.sin(tm * s.sp + s.ph), r = (2 + s.s * 2.3) * S;
    const x = s.x * W - cam.x * 0.0012 * S, y = s.y * H;
    dn2Eg(s.c < 0.7 ? '#dff4ff' : '#ffe8c8', x, y, r, r, am * (0.1 + 0.24 * tw) * (0.4 + 0.3 * s.s) * dn2Foc(x, y));
  }
  g.globalCompositeOperation = 'source-over';
}

// ── takımyıldızı: uyanan yıldızlar gökte yerini alır ──
const DN2_SC = ['#fff2c8', '#cfe8ff', '#ffd0f0', '#c8fff0', '#ffe0a0', '#d8d0ff'];
const dn2Ring = { a: 0 };
function dn2StarState(o, i) {   // null | {age, x, y}
  const t = dn2PutT(o, i); if (t === null || now < t) return null;
  const p = dn2SkyPt(o, {}); if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(now - t)) return null; return { age: now - t, x: p.x, y: p.y };
}
function dn2Constellation(tm, hyPx, refl, rsy) {   // refl: suda yansıma (rsy = su çizgisi); değilse gökte
  const L = dn2StarList(), E = dn2EdgesGet(); if (!L.length) return;
  const F = refl ? 1 : 0, ay = refl ? 0.3 : 1;
  const my = y => refl ? hyPx + (1 - y / hyPx) * (H - hyPx) : y;
  const st = []; for (let i = 0; i < L.length; i++) st.push(dn2StarState(L[i], i));
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  // çizgiler: yeni yıldız eski yıldıza doğru uzanır
  for (let e = 0; e < E.length; e++) {
    const A = st[E[e][0]], B = st[E[e][1]];
    if (!A !== !B && !refl) {   // ön çizgi: uyanmış yıldızdan henüz uyanmamış komşu yuvaya çok soluk kesikli çizgi (şekil belli belirsiz belirsin)
      const P1 = A || B, o = L[A ? E[e][1] : E[e][0]], q = dn2SkyPt(o, dn2Pt); if (isFinite(q.x) && isFinite(q.y)) { g.strokeStyle = '#b8ccff'; g.globalAlpha = 0.09 * (0.6 + 0.4 * Math.sin(tm * 1.1 + e)); g.lineWidth = 1 * S; g.setLineDash([3 * S, 7 * S]); g.beginPath(); g.moveTo(P1.x, P1.y); g.lineTo(q.x, q.y); g.stroke(); g.setLineDash([]); g.globalAlpha = 1; }
      continue; }
    if (!A || !B) continue;
    const newer = A.age < B.age ? A : B, older = newer === A ? B : A, age = newer.age - 0.35; if (age <= 0) continue;
    const p = smooth(clamp(age / 1.6, 0, 1)), x0 = newer.x, y0 = my(newer.y), x1 = lerp(newer.x, older.x, p), y1 = lerp(my(newer.y), my(older.y), p);
    const gl = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(tm * 0.9 + e)) , fa = ay * Math.min(1, 0.4 + DN2.fill * 0.8);
    g.strokeStyle = '#a8c8ff'; g.lineWidth = 4.2 * S; g.globalAlpha = 0.07 * gl * fa; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = '#e4f0ff'; g.lineWidth = 1.15 * S; g.globalAlpha = 0.5 * gl * fa * (0.35 + 0.65 * p); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    if (p >= 1 && !refl) { const u = (tm * 0.2 + e * 0.37) % 1; dn2Eg('#d8ecff', lerp(x0, older.x, u), lerp(y0, my(older.y), u), 7 * S, 7 * S, 0.5 * Math.sin(u * Math.PI) * fa); }
  }
  g.globalAlpha = 1;
  // yuvalar: henüz uyanmamış yıldızların yerinde çok soluk, küçük dört uçlu yıldız izi (buraya yıldız gelecek hissi)
  if (!refl) for (let i = 0; i < L.length; i++) { if (st[i]) continue; const p = dn2SkyPt(L[i], dn2Pt), bs = (L[i].boyut || 12) / 12, pul = 0.5 + 0.5 * Math.sin(tm * 0.8 + i * 1.3);
    if (!isFinite(p.x) || !isFinite(p.y)) continue; const a = (0.1 + 0.06 * pul) * (1 - 0.6 * DN2.fill), r = (8 + bs * 3) * S;
    dn2Eg('#b8c8ff', p.x, p.y, r * 1.8, r * 1.8, 0.06 * (0.6 + pul * 0.4));
    g.globalAlpha = a; g.drawImage(dn2StarSpr('#cfdcff'), p.x - r, p.y - r, r * 2, r * 2); g.globalAlpha = 1; }
  // yıldızlar (aynı anda çok yıldız yerleşirse halka/parıltı sönükleşir: karışıklık olmasın)
  let nYoung = 0; for (let i = 0; i < st.length; i++) if (st[i] && st[i].age < 2.4) nYoung++;
  const cr = nYoung > 2 ? 1 / Math.sqrt(nYoung - 1) : 1;
  for (let i = 0; i < L.length; i++) {
    const s = st[i]; if (!s) continue; const age = s.age, col = L[i].renk ? dn2Sat(L[i].renk, 1.7) : DN2_SC[i % DN2_SC.length], ph = i * 1.7, bs = (L[i].boyut || 12) / 12;
    const pulse = 0.84 + 0.16 * Math.sin(tm * (1.3 + (i % 5) * 0.17) + ph);
    const bump = age < 3 ? Math.exp(-age * 2.8) * (0.6 + 0.4 * Math.cos(age * 5)) : 0;   // her zaman ≥ 0: yerleşince küçülüp kaybolmaz
    const sc = Math.max(0.05, (1 + 2.6 * bump) * pulse), fl = clamp(age / 0.1, 0, 1);
    const x = s.x, y = my(s.y), r = (15 + bs * 5) * S * sc * (refl ? 0.8 : 1), a = fl * (refl ? 0.38 : 1);
    if (!refl && age < 0.12 && now - (DN2.lastPut || -99) > 0.3) DN2.lastPut = now;
    if (age < 2.4) { const q = age / 2.4, k2 = (1 - q) * (1 - q); dn2Eg(col, x, y, (120 + 160 * q) * S, (120 + 160 * q) * S * (refl ? 0.4 : 1), 0.3 * k2 * a * cr); dn2Eg('#ffffff', x, y, 40 * S * (1 + q), 40 * S * (1 + q) * (refl ? 0.4 : 1), 0.22 * k2 * a * cr); }
    if (age < 1.9) {   // ışık halkaları
      for (let k = 0; k < 2; k++) { const aa = age - k * 0.28; if (aa <= 0 || aa > 1.5) continue; const q = aa / 1.5, rr = (10 + q * 82) * S;
        g.strokeStyle = col; g.lineWidth = (2.2 - q * 1.4) * S; g.globalAlpha = (1 - q) * (1 - q) * 0.7 * a * cr;
        g.beginPath(); if (refl) g.ellipse(x, y, rr, rr * 0.22, 0, 0, 6.283); else g.arc(x, y, rr, 0, 6.283); g.stroke(); }
      g.globalAlpha = 1;
      for (let k = 0; k < 8; k++) { const q = clamp((age - 0.05) / 1.7, 0, 1); if (q <= 0 || q >= 1) break; const an = k * 0.785 + i, d = (14 + 60 * (1 - (1 - q) * (1 - q))) * S * (0.7 + 0.5 * ((k * 37) % 10) / 10);
        dn2Eg(k % 2 ? '#ffffff' : col, x + Math.cos(an) * d, my(s.y + Math.sin(an) * d / S * (refl ? 0 : 1)) + (refl ? Math.sin(an) * d * 0.2 : 0), 6 * S * (1 - q), 6 * S * (1 - q), (1 - q) * 0.8 * a); }
    }
    dn2Eg(col, x, y, r * 2.2, r * 2.2 * (refl ? 0.6 : 1), 0.3 * pulse * a);

    g.globalAlpha = Math.min(1, a * (0.8 + 0.2 * pulse) * (age < 0.3 ? 0.55 : 1)); const sp = dn2StarSpr(col); g.drawImage(sp, x - r * 1.7, y - r * 1.7 * (refl ? 0.6 : 1), r * 3.4, r * 3.4 * (refl ? 0.6 : 1)); g.globalAlpha = 1;
    if (age < 0.3 && !refl) dn2Eg('#ffffff', x, y, r * 2.4 * (1 - age / 0.3 * 0.5), r * 2.4 * (1 - age / 0.3 * 0.5), (1 - age / 0.3) * 0.35);
    if (!refl && age < 1.9) {   // yerleşince ~1 sn renkli, yüzlü küçük yıldız gövdesi; sonra ışıltıya geçer
      const ba = (age < 0.15 ? age / 0.15 : age < 1.1 ? 1 : 1 - (age - 1.1) / 0.8) * a, br = r * 1.1 * (0.9 + 0.1 * Math.sin(age * 6)); if (ba > 0.02) {
        g.globalCompositeOperation = 'source-over'; g.save(); g.translate(x, y); g.rotate(Math.sin(age * 3) * 0.12); g.beginPath();
        for (let k = 0; k < 10; k++) { const an = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? br * 0.47 : br; k ? g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : g.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath();
        const bg = g.createRadialGradient(0, -br * 0.1, 1, 0, 0, br); bg.addColorStop(0, dn2Mix(col, '#ffffff', 0.7)); bg.addColorStop(0.55, col); bg.addColorStop(1, dn2Mix(col, '#2a1a70', 0.45));
        g.globalAlpha = Math.min(1, ba); g.fillStyle = bg; g.fill(); g.strokeStyle = dn2Mix(col, '#ffffff', 0.5); g.lineWidth = 1.2 * S; g.stroke();
        g.fillStyle = '#3a2a6a'; g.globalAlpha = Math.min(1, ba) * 0.85; g.beginPath(); g.arc(-br * 0.2, br * 0.02, br * 0.05 + S * 0.4, 0, 6.283); g.arc(br * 0.2, br * 0.02, br * 0.05 + S * 0.4, 0, 6.283); g.fill();   // gözler
        g.strokeStyle = '#3a2a6a'; g.lineWidth = 0.9 * S; g.beginPath(); g.arc(0, br * 0.1, br * 0.14, 0.2, Math.PI - 0.2); g.stroke(); g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'lighter'; } }
  }
  g.globalCompositeOperation = 'source-over';
}
// ── ara sıra kayan yıldız ──
let dn2Shoot = { t: -99, x: 0, y: 0, a: 0, len: 0, nxt: 6 };
function dn2Shooter(tm) {
  const S_ = dn2Shoot, f = DN2.fill; if (f < 0.12) return;
  if (tm > S_.nxt) { S_.t = tm; S_.x = W * (0.2 + Math.random() * 0.7); S_.y = H * (0.06 + Math.random() * 0.22); S_.a = 0.35 + Math.random() * 0.3; S_.len = 1; S_.nxt = tm + 7 + Math.random() * 9; }
  const e = tm - S_.t; if (e < 0 || e > 1.0) return;
  const q = e / 1.0, x = S_.x + Math.cos(S_.a) * q * W * 0.2, y = S_.y + Math.sin(S_.a) * q * W * 0.2, ln = W * 0.07 * Math.sin(q * Math.PI);
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = '#e8f4ff'; g.lineWidth = 1.8 * S; g.globalAlpha = 0.7 * Math.sin(q * Math.PI);
  const gr = g.createLinearGradient(x, y, x - Math.cos(S_.a) * ln, y - Math.sin(S_.a) * ln); gr.addColorStop(0, 'rgba(235,245,255,0.9)'); gr.addColorStop(1, 'rgba(235,245,255,0)');
  g.strokeStyle = gr; g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(S_.a) * ln, y - Math.sin(S_.a) * ln); g.stroke(); g.globalAlpha = 1;
  dn2Eg('#ffffff', x, y, 8 * S, 8 * S, 0.8 * Math.sin(q * Math.PI)); g.globalCompositeOperation = 'source-over';
}

// ═══════════ uzak katmanlar: dağlar ve ağaç siluetleri (kendini tekrarlayan şeritler, paralaks) ═══════════
const DN2_LAY = [
  { f: 0.045, P: 2600, up: 250, dn: 6, yo: 0, top: '#181f62', bot: '#3a4690', kind: 'mt', seed: 11, ra: 0.5 },
  { f: 0.1, P: 2400, up: 150, dn: 6, yo: 2, top: '#121958', bot: '#2e3a86', kind: 'ridge', seed: 22, ra: 0.38 },
  { f: 0.21, P: 2200, up: 120, dn: 6, yo: 16, top: '#0d1450', bot: '#232e7a', kind: 'trees', seed: 33, ra: 0.3 },
  { f: 0.36, P: 2000, up: 110, dn: 6, yo: 40, top: '#080d40', bot: '#18226a', kind: 'trees2', seed: 44, ra: 0.22 },
  { f: 0.02, P: 3000, up: 230, dn: 6, yo: -2, top: '#3a4698', bot: '#6a76c0', kind: 'mt', seed: 71, ra: 0.5 },   // en uzak, sisli ve açık dağ sırası
  { f: 0.62, P: 1800, up: 100, dn: 6, yo: 78, top: '#04062c', bot: '#0b1048', kind: 'reeds', seed: 91, ra: 0.3 },   // yakın kıyı: koyu saz ve çalı siluetleri
];
function dn2RidgeF(u, n) {   // 0..1 tepeli (sivri) profil; u 0..1 periyodik
  const h = [[2, 1, 0.3], [3, 0.8, 1.7], [5, 0.55, 2.9], [8, 0.3, 4.1], [13, 0.16, 5.3], [21, 0.08, 0.5]]; let v = 0, a = 0;
  for (const q of h) { v += q[1] * (1 - Math.abs(Math.sin(Math.PI * q[0] * u + q[2] + n))); a += q[1]; }
  return v / a;
}
function dn2PaintLayer(L) {
  const q = clamp(H / VH * 0.62, 0.5, Math.min(1.5, 3900 / L.P)); L.q = q;
  const w = Math.round(L.P * q), h = Math.round((L.up + L.dn) * q), c = L.cv && L.cv.width === w && L.cv.height === h ? L.cv : (L.cv = dn2Cv(w, h)), x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.setTransform(q, 0, 0, q, 0, 0);
  const R = rng(L.seed), foot = L.up, p = new Path2D();
  const gr = x.createLinearGradient(0, foot - L.up, 0, foot + 2); gr.addColorStop(0, L.top); gr.addColorStop(0.72, dn2Mix(L.top, L.bot, 0.55)); gr.addColorStop(1, L.bot);
  const wrap = (fn) => { for (const o of [-L.P, 0, L.P]) { x.save(); x.translate(o, 0); fn(p, o); x.restore(); } };
  if (L.kind === 'mt') {
    p.moveTo(-10, foot + L.dn);
    for (let i = -4; i <= L.P + 4; i += 4) p.lineTo(i, foot - L.up * (0.12 + 0.88 * Math.pow(dn2RidgeF(((i % L.P) + L.P) % L.P / L.P, 0.2), 1.25)));
    p.lineTo(L.P + 10, foot + L.dn); p.closePath();
    x.fillStyle = gr; x.fill(p);
    x.save(); x.clip(p);   // zirve ışıkları (ayın aydınlattığı yamaçlar) + sis vadileri
    for (let i = 0; i < 26; i++) { const ux = R() * L.P, hy = foot - L.up * (0.12 + 0.88 * Math.pow(dn2RidgeF(ux / L.P, 0.2), 1.25)), r = 60 + R() * 90;
      for (const o of [-L.P, 0, L.P]) { const rg = x.createRadialGradient(ux + o, hy + r * 0.3, 0, ux + o, hy + r * 0.3, r); rg.addColorStop(0, dn2Hx('#b0b8ff', 0.2)); rg.addColorStop(1, 'rgba(176,184,255,0)'); x.fillStyle = rg; x.fillRect(ux + o - r, hy - r, r * 2, r * 2.2); } }
    for (let k = 0; k < 2; k++) {   // yakın, daha koyu ikinci sırt: dağa derinlik/kabartı verir
      const q2 = new Path2D(), amp = 0.5 - k * 0.18; q2.moveTo(-10, foot + L.dn);
      for (let i = -4; i <= L.P + 4; i += 4) q2.lineTo(i, foot - L.up * amp * (0.1 + 0.9 * Math.pow(dn2RidgeF((((i % L.P) + L.P) % L.P) / L.P, 1.7 + k * 2.3), 1.1)));
      q2.lineTo(L.P + 10, foot + L.dn); q2.closePath();
      const g2 = x.createLinearGradient(0, foot - L.up * amp, 0, foot); g2.addColorStop(0, dn2Hx('#0c1250', 0.55 + k * 0.1)); g2.addColorStop(1, dn2Hx('#2a3688', 0.1)); x.fillStyle = g2; x.fill(q2);
      x.strokeStyle = dn2Hx('#aab8ff', 0.22); x.lineWidth = 1.1; x.stroke(q2);
    }
    x.strokeStyle = dn2Hx('#9aa8ff', 0.16); x.lineWidth = 7; x.stroke(p);
    x.strokeStyle = dn2Hx('#c8d2ff', 0.22); x.lineWidth = 3; x.stroke(p);
    x.strokeStyle = dn2Hx('#eef2ff', 0.38); x.lineWidth = 1.1; x.stroke(p);
    x.restore();
  } else if (L.kind === 'reeds') {
    const tp = new Path2D(), tips = [];
    p.moveTo(-10, foot + L.dn); for (let i = -4; i <= L.P + 4; i += 4) p.lineTo(i, foot - 10 * (0.4 + 0.6 * dn2RidgeF((((i % L.P) + L.P) % L.P) / L.P, L.seed)));
    p.lineTo(L.P + 10, foot + L.dn); p.closePath();
    for (let i = 0; i < 90; i++) { const bx = R() * L.P, hh = 24 + R() * 70, lean = (R() - 0.5) * 22, big = false;
      for (const o of [-L.P, 0, L.P]) { const cx = bx + o, by = foot - 2;
        if (big) { tp.moveTo(cx - 8 - R() * 6, by); tp.quadraticCurveTo(cx - 3, by - hh * 0.5, cx + lean, by - hh * 0.9); tp.quadraticCurveTo(cx + 5, by - hh * 0.5, cx + 9, by); tp.closePath(); }
        else { tp.moveTo(cx - 1.4, by); tp.quadraticCurveTo(cx + lean * 0.3, by - hh * 0.55, cx + lean, by - hh); tp.lineTo(cx + lean + 1.2, by - hh); tp.quadraticCurveTo(cx + lean * 0.3 + 2, by - hh * 0.55, cx + 1.4, by); tp.closePath();
          if (R() < 0.3) { tp.moveTo(cx + lean + 2.4, by - hh + 8); tp.ellipse(cx + lean, by - hh + 8, 2.4, 9, 0, 0, 6.283); if (o === 0) tips.push([cx + lean, by - hh]); } } } }
    x.fillStyle = dn2Hx('#7a8aff', 0.4); x.save(); x.translate(0, -1.2); x.fill(tp); x.restore();
    x.fillStyle = gr; x.globalAlpha = 0.4; x.fill(p); x.globalAlpha = 1; x.fill(tp);
    x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.6; for (const t of tips) { const col = ['#8ff0ff', '#c9a8ff', '#ffc8ee'][Math.floor(R() * 3)]; x.drawImage(glow(col), t[0] - 5, t[1] - 5, 10, 10); }
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  } else {
    // taban tepesi
    p.moveTo(-10, foot + L.dn);
    const hillH = L.kind === 'ridge' ? 26 : 16;
    for (let i = -4; i <= L.P + 4; i += 4) { const u = ((i % L.P) + L.P) % L.P / L.P; p.lineTo(i, foot - hillH * (0.4 + 0.6 * dn2RidgeF(u, L.seed))); }
    p.lineTo(L.P + 10, foot + L.dn); p.closePath();
    const nT = L.kind === 'ridge' ? 120 : L.kind === 'trees' ? 56 : 40, blobs = [];
    const tp = new Path2D();
    for (let i = 0; i < nT; i++) {
      const bx = (i + R() * 0.7) / nT * L.P, hs = hillH * (0.4 + 0.6 * dn2RidgeF(bx / L.P, L.seed)), th = L.up * 0.62 * (0.3 + 0.7 * Math.pow(R(), 1.4)) * (L.kind === 'ridge' ? 0.7 : 1), tw = th * (L.kind === 'trees2' ? 0.5 : 0.34) * (0.8 + R() * 0.5), kind = R();
      for (const o of [-L.P, 0, L.P]) {
        const cx = bx + o, by = foot - hs + 4;
        if (kind < 0.5) { // çam: üst üste ince üçgenler
          const n = 4 + Math.floor(R() * 2); tp.moveTo(cx - 1.4, by); tp.lineTo(cx - 1.4, by - th * 0.2); tp.lineTo(cx + 1.4, by - th * 0.2); tp.lineTo(cx + 1.4, by);
          for (let k = 0; k < n; k++) { const u0 = 0.12 + k * 0.82 / n, u1 = 0.12 + (k + 1.55) * 0.82 / n, ww = tw * 0.5 * (1 - u0 * 0.85); tp.moveTo(cx - ww, by - th * u0); tp.lineTo(cx, by - th * Math.min(1, u1)); tp.lineTo(cx + ww, by - th * u0); tp.closePath(); }
        } else if (kind < 0.8) { // yuvarlak taçlı (söğüt/fener) ağaç
          tp.moveTo(cx - 1.6, by); tp.lineTo(cx - 1, by - th * 0.5); tp.lineTo(cx + 1, by - th * 0.5); tp.lineTo(cx + 1.6, by); tp.closePath();
          tp.moveTo(cx + tw * 0.5, by - th * 0.7); tp.ellipse(cx, by - th * 0.7, tw * 0.5, th * 0.32, 0, 0, 6.283); tp.moveTo(cx + tw * 0.3, by - th * 0.5); tp.ellipse(cx - tw * 0.1, by - th * 0.52, tw * 0.34, th * 0.22, 0, 0, 6.283);
        } else { // sivri uzun selvi
          tp.moveTo(cx - tw * 0.28, by); tp.quadraticCurveTo(cx - tw * 0.36, by - th * 0.5, cx, by - th); tp.quadraticCurveTo(cx + tw * 0.36, by - th * 0.5, cx + tw * 0.28, by); tp.closePath();
        }
        if (L.kind !== 'ridge' && kind >= 0.5 && kind < 0.8 && o === 0 && R() < 0.8) blobs.push([cx, by - th * 0.7, tw * 0.5, th * 0.3]);
      }
    }
    x.fillStyle = dn2Hx('#a8b8ff', L.ra * 0.9); x.save(); x.translate(0, -1.3); x.fill(tp); x.restore();
    x.fillStyle = gr; x.globalAlpha = L.kind === 'ridge' ? 1 : 0.5; x.fill(p); x.globalAlpha = 1; x.fill(tp);
    if (L.kind !== 'ridge') {   // ışık çiçeği lekeleri: taçlarda soluk renkli parıltılar
      x.globalCompositeOperation = 'lighter';
      for (const b of blobs) for (let k = 0; k < 2; k++) { const ang = R() * 6.283, rr = Math.sqrt(R()), px = b[0] + Math.cos(ang) * b[2] * rr, py = b[1] + Math.sin(ang) * b[3] * rr, col = ['#ffc8ee', '#a8f0ff', '#d8c8ff'][Math.floor(R() * 3)], r = 3 + R() * 5;
        const rg = x.createRadialGradient(px, py, 0, px, py, r); rg.addColorStop(0, dn2Hx(col, 0.38)); rg.addColorStop(1, dn2Hx(col, 0)); x.fillStyle = rg; x.fillRect(px - r, py - r, r * 2, r * 2); }
      x.globalCompositeOperation = 'source-over';
    }
  }
}
function dn2Hy() {   // uzak kıyının (ufuk) ekran y'si
  const g0 = (DN2.GREF - cam.y) * S;
  if (!isFinite(g0)) return DN2.hy = 0.58 * H;
  return DN2.hy = clamp(0.76 * H + 0.4 * (g0 - 0.76 * H) - 104 * S, 0.3 * H, 0.74 * H);
}
function dn2DrawLayer(L, hy, flip, alpha) {
  if (!L.cv) return;
  const Pw = L.P * S, ox = ((-cam.x * L.f * S) % Pw + Pw) % Pw, foot = hy + L.yo * S + (cam.y - DN2.GREF) * 0 * S;
  const dw = Pw, dh = (L.up + L.dn) * S, top = foot - L.up * S;
  g.globalAlpha = alpha;
  if (flip) { g.save(); g.setTransform(1, 0, 0, -0.9, 0, foot * 1.9); }
  for (let x0 = ox - Pw; x0 < W; x0 += Pw) g.drawImage(L.cv, x0, top, dw + 1, dh);
  if (flip) g.restore();
  g.globalAlpha = 1;
}
const dn2Haze = (y, hgt, a, col) => dn2Eg(col, W * 0.5, y, W * 0.75, hgt, a);

// ═══════════ su yansıması: gökyüzünün ters kopyası (dalgalı dilimler) ═══════════
function dn2SkyRefl(x0, x1, sy, hy, alpha, tm, depthFade) {   // [x0,x1] piksel aralığı; sy: yansımanın başladığı y (su çizgisi). Eşleme hep ufka bağlı (uzak göl ile yakın su kesintisiz)
  const S_ = DN2_SK, src = S_.C; if (!src || sy >= H) return;
  const N = 22, k = S_.k, oyS = hy - S_.yh / k, span = H - hy, y00 = Math.max(sy, hy), r0u = (y00 - hy) / span;
  g.save(); g.beginPath(); g.rect(x0, y00, x1 - x0, H - y00); g.clip();
  for (let i = 0; i < N; i++) {
    const ya = y00 + (H - y00) * (i / N), yb = y00 + (H - y00) * ((i + 1) / N), u0 = (ya - hy) / span, u1 = (yb - hy) / span;
    const s0 = hy * (1 - u0), s1 = hy * (1 - u1), r1 = (s0 - oyS) * k, r0 = (s1 - oyS) * k; if (r1 <= 0) continue;
    const rr0 = Math.max(0, r0), off = (Math.sin(tm * 1.5 + i * 1.1) * (0.5 + u0 * 3.2) + Math.sin(tm * 0.8 + i * 0.5) * 0.9) * S;
    g.globalAlpha = alpha * (depthFade ? clamp(1 - (ya - y00) / Math.max(1, H - y00) * 0.45, 0.35, 1) : 1);
    g.setTransform(1, 0, 0, -1, 0, ya + yb);
    g.drawImage(src, 0, rr0, src.width, Math.max(0.5, r1 - rr0), x0 + off - 4 * S, ya, x1 - x0 + 8 * S, yb - ya + 1);
  }
  g.restore(); g.globalAlpha = 1;
}
function dn2AurRefl(x0, x1, sy, hy, tm) {   // aurora renklerinin suda yumuşak yansıması
  const au = (0.045 + 0.62 * Math.pow(DN2.fill, 0.9) + 0.25 * DN2.full); if (au < 0.05) return;
  g.globalCompositeOperation = 'lighter'; const span = H - hy, y00 = Math.max(sy, hy);
  g.save(); g.beginPath(); g.rect(x0, y00, x1 - x0, H - y00); g.clip();
  for (let ci = 0; ci < DN2_AUR.length; ci++) { const A = DN2_AUR[ci], cy = hy + (1 - (A.y * H - A.h * H * 0.4) / hy) * span, cx = ((A.u0 + A.u1) / 2 + Math.sin(tm * A.sp + A.ph) * 0.05) * W;
    dn2Eg(A.c0, cx, cy, W * (A.u1 - A.u0) * 0.5, span * 0.35, au * 0.12 * A.a); }
  g.restore(); g.globalCompositeOperation = 'source-over';
}

// ── bölgesel karakter: kıyı, göl, Pofuduk kıyısı, kaplumbağa kıyısı için ışık/renk tonu ──
const DN2_REGC = { patika: ['#5fe0c8', 0.6], goletKiyi: ['#ff9ad8', 0.7], yildizGol: ['#5a78ff', 0.8], pofuduk: ['#ffa8e8', 0.65], hayvan: ['#ffd890', 0.7] };
function dn2Region() {
  const R = DN2.reg || (DN2.reg = { r: 90, g: 110, b: 220, a: 0, gol: 0, hex: '#5a6ad0' });
  const cx = cam.x + VW / 2, L = typeof BOLUM !== 'undefined' && BOLUM && BOLUM.bolgeler ? BOLUM.bolgeler : [];
  let sr = 0, sg = 0, sb = 0, sw = 0, sa = 0, gol = 0;
  for (let i = 0; i < L.length; i++) { const b = L[i], c = DN2_REGC[b.ad]; if (!c) continue; const w = clamp(Math.min(cx - b.x0 + 6 * T, b.x1 + 6 * T - cx) / (12 * T), 0, 1); if (w <= 0) continue; const A = hex(c[0]); sr += A[0] * w; sg += A[1] * w; sb += A[2] * w; sw += w; sa += c[1] * w; if (b.ad === 'yildizGol') gol = Math.max(gol, w); }
  if (sw > 0) { R.r = sr / sw; R.g = sg / sw; R.b = sb / sw; R.a = sa / Math.max(1, sw); }
  R.gol = gol; R.hex = '#' + [R.r, R.g, R.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  return R;
}
// ay yolu: suda dikey titreşen ışık sütunu (ay + parlak yıldızlar)
let dn2MoonC = null;
function dn2MoonSpr() {
  if (dn2MoonC) return dn2MoonC; const c = dn2MoonC = dn2Cv(96, 96), x = c.getContext('2d'); x.fillStyle = '#eef3ff'; x.beginPath(); x.arc(48, 48, 30, 0, 6.283); x.fill();
  x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(48 + 17, 48 - 9, 26, 0, 6.283); x.fill(); return c;
}
function dn2MoonRoad(x0, x1, y0, tm) {   // suda ayın geniş, titreşen ışık yolu (suyun orta-üst bandı) + hilalin yansıması
  const S_ = DN2_SK; if (!S_.A) return; const mx = 0.72 * W, hy = DN2.hy; if (mx < x0 - 80 || mx > x1 + 80) return;
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, H - y0); g.clip(); g.globalCompositeOperation = 'lighter';
  const am = 0.7 + 0.3 * DN2.fill, n = 30, top = Math.max(y0, hy), span = (H - top) * 0.62;
  dn2Eg('#a8bcff', mx, top + span * 0.45, 70 * S, span * 0.6, 0.14 * am);   // geniş yumuşak ışık
  { const cg = g.createLinearGradient(0, top, 0, top + span * 1.1); cg.addColorStop(0, 'rgba(210,222,255,0.36)'); cg.addColorStop(0.7, 'rgba(210,222,255,0.1)'); cg.addColorStop(1, 'rgba(210,222,255,0)'); g.fillStyle = cg; g.globalAlpha = am * (0.75 + 0.25 * Math.sin(tm * 1.7)); g.fillRect(mx - 9 * S, top, 18 * S, span * 1.1); g.globalAlpha = 1; }
  for (let i = 0; i < n; i++) { const u = Math.pow(i / n, 1.15), y = top + 3 * S + u * span, ww = (22 + u * 120) * S * (0.45 + 0.55 * Math.sin(tm * 2.0 + i * 1.9) ** 2), xx = mx + Math.sin(tm * 0.8 + i * 2.3) * (4 + u * 30) * S;
    dn2Eg('#eef3ff', xx, y, ww, (1.6 + u * 2.4) * S, Math.min(1, (0.95 - u * 0.5) * am) * (0.45 + 0.55 * Math.sin(tm * 2.6 + i) ** 2)); }
  // (hilalin suda yansıması gökyüzü yansımasının içinde zaten var; ayrıca çizilmiyor)
  g.restore(); g.globalCompositeOperation = 'source-over';
}
// ay ışığı hüzmeleri: hilalden aşağı-sola yelpaze gibi açılan çok yumuşak ışık şeritleri (tek önbellekli sprite, döndürülerek)
let dn2RayC = null;
function dn2RaySpr() {
  if (dn2RayC) return dn2RayC; const c = dn2RayC = dn2Cv(64, 256), x = c.getContext('2d');
  const hg = x.createLinearGradient(0, 0, 64, 0); hg.addColorStop(0, 'rgba(190,205,255,0)'); hg.addColorStop(0.5, 'rgba(190,205,255,1)'); hg.addColorStop(1, 'rgba(190,205,255,0)'); x.fillStyle = hg; x.fillRect(0, 0, 64, 256);
  x.globalCompositeOperation = 'destination-in'; const vg = x.createLinearGradient(0, 0, 0, 256); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.12, 'rgba(0,0,0,0.9)'); vg.addColorStop(0.45, 'rgba(0,0,0,0.45)'); vg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = vg; x.fillRect(0, 0, 64, 256);
  return c;
}
const DN2_RAYS = [[0.5, 0.11, 1.05, 0], [0.72, 0.07, 1.2, 1.7], [0.95, 0.14, 0.95, 3.1], [1.18, 0.06, 1.1, 4.4], [0.34, 0.05, 0.8, 5.2]];   // [açı (dikeyden sola), genişlik (W oranı), boy (H oranı), faz]
function dn2MoonRays(tm, hy) {
  const sp = dn2RaySpr(), mx = 0.72 * W, my = hy - 0.45 * H; g.globalCompositeOperation = 'lighter';
  for (const r of DN2_RAYS) { const a = (0.085 + 0.04 * Math.sin(tm * 0.21 + r[3])) * (0.75 + 0.25 * DN2.fill); if (a < 0.01) continue;
    g.save(); g.translate(mx, my); g.rotate(r[0] + Math.sin(tm * 0.05 + r[3]) * 0.02); g.globalAlpha = a; g.drawImage(sp, -r[1] * W * 0.5, 0, r[1] * W, r[2] * H); g.restore(); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
// ═══════════ bölgesel uzak simgeler (yavaş paralaks): her bölgenin ufkunda kendine özgü bir siluet ═══════════
// patika: uzakta Bölüm 1'in Işık Ağacı (yanmış, sıcak ışıklı) · Pofuduk kıyıları: dev ışıklı mantarlar · çayır: ışık çiçeği tarlası · kaplumbağa kıyısı: yıldız oymalı taş kemer
const DN2_LM_F = 0.15;
const DN2_LM = [   // [tür, dünya sütunu, ölçek]
  ['agac', 16, 1.1], ['mantar', 182, 1], ['cicek', 318, 0.9], ['mantar', 372, 0.8], ['kemer', 466, 1], ['kemer', 512, 0.75],
];
const dn2LmC = {};
function dn2LmSpr(kind) {   // 420x320 birim tasarım alanı, taban ortası (210, 300); 1.5x çözünürlük
  if (dn2LmC[kind]) return dn2LmC[kind];
  const q = 1.5, Wd = 420, Hd = 320, c = dn2LmC[kind] = dn2Cv(Wd * q, Hd * q), x = c.getContext('2d'), R = rng(kind.length * 97 + kind.charCodeAt(0));
  x.setTransform(q, 0, 0, q, 210 * q, 300 * q); x.lineCap = 'round'; x.lineJoin = 'round';
  const body = (y0, y1) => { const gr = x.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#161e62'); gr.addColorStop(1, '#2a3686'); return gr; };
  const rim = '#b8c4ff';
  const lights = (pts, cols, r, a) => { x.globalCompositeOperation = 'lighter'; for (const p of pts) { x.globalAlpha = a; x.drawImage(glow(cols[Math.floor(R() * cols.length)]), p[0] - r, p[1] - r, r * 2, r * 2); } x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; };
  if (kind === 'agac') {   // uzaktaki Işık Ağacı: arkadan aydınlanan şemsiye taç, sarkan altın fenerler
    { x.save(); x.translate(0, -185); x.scale(1.55, 1); const hg = x.createRadialGradient(0, 0, 6, 0, 0, 112); hg.addColorStop(0, 'rgba(255,214,150,0.4)'); hg.addColorStop(0.45, 'rgba(255,190,150,0.14)'); hg.addColorStop(1, 'rgba(255,190,150,0)');
      x.fillStyle = hg; x.fillRect(-114, -114, 228, 228); x.restore(); }
    const tr = new Path2D(); tr.moveTo(-24, 4); tr.quadraticCurveTo(-12, -60, -10, -150); tr.lineTo(10, -150); tr.quadraticCurveTo(12, -60, 26, 4); tr.closePath();
    for (const [ex, ey, w] of [[-120, -205, 7], [120, -210, 7], [-60, -250, 6], [60, -252, 6], [0, -262, 5]]) { tr.moveTo(-w, -120); tr.quadraticCurveTo(ex * 0.4, ey + 30, ex, ey); tr.quadraticCurveTo(ex * 0.4 + w, ey + 42, w, -112); tr.closePath(); }
    const cl = []; for (let i = 0; i <= 8; i++) { const an = Math.PI * (0.1 + 0.8 * i / 8); cl.push([-Math.cos(an) * 150, -196 - Math.sin(an) * 52, 40 + 9 * Math.sin(i * 1.7)]); }
    for (const cx of [-72, 0, 72]) cl.push([cx, -248 - (cx ? 0 : 8), 40]);
    const cr = new Path2D(); for (const [cx, cy, r] of cl) { cr.moveTo(cx + r, cy); cr.ellipse(cx, cy, r, r * 0.66, 0, 0, 6.283); }
    x.save(); x.translate(2.5, -3); x.fillStyle = dn2Hx('#ffd8b0', 0.38); x.fill(cr); x.restore();   // üst-sağ kenar ışığı
    x.fillStyle = body(-300, 0); x.fill(tr); x.fill(cr);
    for (const [cx, cy, r] of cl) { x.fillStyle = dn2Hx('#0c1248', 0.35); x.beginPath(); x.ellipse(cx - r * 0.15, cy + r * 0.25, r * 0.8, r * 0.38, 0, 0, 6.283); x.fill(); }   // alt gölge (hacim)
    x.strokeStyle = dn2Hx('#ffe0b0', 0.6); x.lineWidth = 2; x.beginPath(); x.moveTo(0, -6); x.quadraticCurveTo(-4, -70, 1, -148); x.stroke();
    const lan = []; for (let i = 0; i < 11; i++) { const lx = -150 + i * 30 + (R() - 0.5) * 10, top = -170 - Math.sin(Math.PI * (i / 10)) * 30, ly = top + 18 + R() * 34; x.strokeStyle = dn2Hx('#2a3480', 0.9); x.lineWidth = 1; x.beginPath(); x.moveTo(lx, top); x.lineTo(lx, ly); x.stroke(); lan.push([lx, ly]); }
    lights(lan, ['#ffd890', '#ffe6b0', '#ffc8e8'], 7, 0.95);
    const pts = []; for (const [cx, cy, r] of cl) if (R() < 0.7) pts.push([cx + (R() - 0.5) * r, cy - r * 0.2 + (R() - 0.5) * r * 0.4]); lights(pts, ['#ffe6b0', '#fff2d0'], 5, 0.7);
  } else if (kind === 'mantar') {
    for (const [mx, h, cw, col] of [[-90, 170, 70, '#ff9ad8'], [40, 230, 95, '#c9a2ff'], [140, 120, 50, '#ffb0e0']]) {
      const st = new Path2D(); st.moveTo(mx - 9, 4); st.quadraticCurveTo(mx - 4 + (R() - 0.5) * 20, -h * 0.5, mx - 6, -h); st.lineTo(mx + 6, -h); st.quadraticCurveTo(mx + 4, -h * 0.5, mx + 11, 4); st.closePath();
      x.fillStyle = body(-h, 0); x.fill(st);
      x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.55; x.drawImage(glow(col), mx - cw * 1.3, -h - cw * 0.2, cw * 2.6, cw * 1.2); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      const cp = new Path2D(); cp.moveTo(mx - cw, -h + 4); cp.bezierCurveTo(mx - cw * 0.9, -h - cw * 0.75, mx + cw * 0.9, -h - cw * 0.75, mx + cw, -h + 4); cp.quadraticCurveTo(mx, -h - 6, mx - cw, -h + 4); cp.closePath();
      const gr = x.createLinearGradient(0, -h - cw * 0.6, 0, -h + 4); gr.addColorStop(0, '#1a2066'); gr.addColorStop(1, dn2Mix(col, '#1a2066', 0.6)); x.fillStyle = gr; x.fill(cp);
      x.strokeStyle = dn2Hx(col, 0.7); x.lineWidth = 2; x.beginPath(); x.moveTo(mx - cw, -h + 4); x.quadraticCurveTo(mx, -h - 6, mx + cw, -h + 4); x.stroke();
      x.strokeStyle = dn2Hx(rim, 0.3); x.lineWidth = 1.4; x.beginPath(); x.moveTo(mx + cw * 0.2, -h - cw * 0.55); x.quadraticCurveTo(mx + cw * 0.75, -h - cw * 0.45, mx + cw * 0.95, -h); x.stroke();
      const sp = []; for (let i = 0; i < 6; i++) sp.push([mx + (R() - 0.5) * cw * 1.3, -h - cw * (0.12 + R() * 0.4)]); lights(sp, [col, '#ffffff'], 5, 0.8);
    }
  } else if (kind === 'cicek') {
    for (let i = 0; i < 22; i++) { const fx = -190 + R() * 380, h = 40 + R() * 120, lean = (R() - 0.5) * 24, col = ['#7fe8d8', '#ffd890', '#c9a2ff', '#ff9ad8'][Math.floor(R() * 4)], r = 6 + h * 0.05;
      x.strokeStyle = '#1e2770'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(fx, 4); x.quadraticCurveTo(fx + lean * 0.3, -h * 0.5, fx + lean, -h); x.stroke();
      x.fillStyle = '#1e2770'; x.beginPath(); x.ellipse(fx + lean * 0.2 + 6, -h * 0.35, 8, 2.6, -0.5, 0, 6.283); x.fill();
      x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.45; x.drawImage(glow(col), fx + lean - r * 2.2, -h - r * 2.2, r * 4.4, r * 4.4); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      x.fillStyle = dn2Hx(dn2Mix(col, '#2a3686', 0.35), 0.75); for (let k = 0; k < 5; k++) { const an = k * 1.2566; x.beginPath(); x.ellipse(fx + lean + Math.cos(an) * r * 0.6, -h + Math.sin(an) * r * 0.6, r * 0.5, r * 0.28, an, 0, 6.283); x.fill(); } }
    x.fillStyle = body(-30, 8); x.beginPath(); x.moveTo(-210, 8); x.quadraticCurveTo(-100, -14, 0, -6); x.quadraticCurveTo(110, -16, 210, 8); x.closePath(); x.fill();
  } else {   // kemer: yıldız oymalı taş kemer + dikili taşlar
    const ar = new Path2D(); ar.moveTo(-120, 4); ar.lineTo(-112, -150); ar.quadraticCurveTo(-100, -232, 0, -240); ar.quadraticCurveTo(100, -232, 112, -150); ar.lineTo(120, 4); ar.lineTo(76, 4); ar.lineTo(70, -140); ar.quadraticCurveTo(62, -192, 0, -196); ar.quadraticCurveTo(-62, -192, -70, -140); ar.lineTo(-76, 4); ar.closePath();
    for (const [sx, h, w] of [[-175, 120, 30], [170, 92, 26], [205, 60, 20]]) { ar.moveTo(sx - w / 2, 4); ar.lineTo(sx - w / 2 + 3, -h + 10); ar.quadraticCurveTo(sx, -h - 6, sx + w / 2 - 3, -h + 10); ar.lineTo(sx + w / 2, 4); ar.closePath(); }
    x.fillStyle = body(-240, 0); x.fill(ar);
    x.save(); x.clip(ar); x.strokeStyle = dn2Hx(rim, 0.25); x.lineWidth = 4; x.translate(-2, 2); x.stroke(ar); x.restore();
    const H2 = [[-92, -60], [-96, -110], [-80, -170], [-40, -214], [10, -220], [56, -200], [92, -150], [96, -90], [92, -40]];   // kemerde yıldız oyması (takımyıldızı)
    x.globalCompositeOperation = 'lighter'; x.strokeStyle = dn2Hx('#ffe0a0', 0.55); x.lineWidth = 1.2; x.beginPath(); H2.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); x.globalCompositeOperation = 'source-over';
    lights(H2, ['#ffe0a0', '#ffffff'], 6, 0.9); lights([[-175, -70], [170, -50]], ['#ffd890'], 9, 0.7);
    const hg = x.createRadialGradient(0, -90, 4, 0, -90, 80); hg.addColorStop(0, 'rgba(255,224,160,0.22)'); hg.addColorStop(1, 'rgba(255,224,160,0)'); x.globalCompositeOperation = 'lighter'; x.fillStyle = hg; x.fillRect(-80, -180, 160, 180); x.globalCompositeOperation = 'source-over';
  }
  return c;
}
function dn2Landmarks(tm, hy, refl) {
  const cx = cam.x + VW / 2, f = DN2_LM_F;
  for (const L of DN2_LM) {
    const wx = L[1] * T, sx = (wx - cx) * f * S + W / 2, k = L[2] * S * 0.56, w = 420 * k; if (sx + w / 2 < -20 || sx - w / 2 > W + 20) continue;
    const sp = dn2LmSpr(L[0]), by = hy + 12 * S;
    if (refl) { g.save(); g.globalAlpha = 0.3; g.setTransform(1, 0, 0, -0.85, 0, by * 1.85); g.drawImage(sp, sx - 210 * k, by - 300 * k, w, 320 * k); g.restore(); g.globalAlpha = 1; continue; }
    g.globalAlpha = 0.92; g.drawImage(sp, sx - 210 * k, by - 300 * k, w, 320 * k); g.globalAlpha = 1;
    if (L[0] === 'agac' || L[0] === 'kemer') { const pul = 0.75 + 0.25 * Math.sin(tm * 0.9 + L[1]); g.globalCompositeOperation = 'lighter'; dn2Eg(L[0] === 'agac' ? '#ffd8a0' : '#ffe0a0', sx, by - (L[0] === 'agac' ? 170 : 100) * k, 150 * k, 110 * k, 0.1 * pul); g.globalCompositeOperation = 'source-over'; }
  }
}
// ═══════════ dn2Background: gökyüzü → uzak dağlar → uzak göl düzlemi ═══════════
function dn2Background(tm) {
  if (!dn2Ok()) return; if (!isFinite(tm)) tm = 0;
  dn2Init(); dn2Update(tm); dn2Region(); dn2FocusUpdate();
  dn2SkyBuild();
  { let done = 0; for (const L of DN2_LAY) if (!L.cv || Math.abs(L.q - clamp(H / VH * 0.62, 0.5, Math.min(1.5, 3900 / L.P))) > 0.001) { if (done++ < 1 || !L.cv && DN2.frames > 6) dn2PaintLayer(L); } if (!done) dn2SkyStep(); DN2.frames = (DN2.frames || 0) + 1; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  const hy = dn2Hy(), S_ = DN2_SK, f = DN2.fill;
  const sky = dn2SkyComp(f);
  g.drawImage(sky, 0, hy - S_.yh / S_.k, W, sky.height / S_.k);
  const hyOff = (hy - 0.6 * H) * 0.5;
  dn2Aurora(tm, hyOff);
  dn2BgStars(tm);
  dn2Constellation(tm, hy, false, 0);
  dn2Shooter(tm);
  if (DN2.fullT !== undefined && now - DN2.fullT < 4) {   // gökyüzü tamamen dolunca: yumuşak bir ışık dalgası göğü süpürür
    const e = (now - DN2.fullT) / 4, r = (0.1 + e * 1.1) * W, cx = W * 0.5, cy = hy;
    g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(cx, cy, r * 0.45, cx, cy, r + 1); rg.addColorStop(0, 'rgba(180,200,255,0)'); rg.addColorStop(0.8, `rgba(190,210,255,${0.12 * (1 - e)})`); rg.addColorStop(1, 'rgba(190,210,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, W, hy); g.globalCompositeOperation = 'source-over';
  }
  // dağlar (en uzak sisli sıra + ana sıra)
  dn2DrawLayer(DN2_LAY[4], hy, false, 0.55);
  dn2Haze(hy - 40 * S, 70 * S, 0.12 + 0.1 * f, '#8a9cff');
  dn2DrawLayer(DN2_LAY[0], hy, false, 1);
  dn2Eg('#8a9cff', W * 0.5, hy - 10 * S, W * 0.8, 60 * S, 0.16 + 0.12 * f);
  dn2MoonRays(tm, hy);
  // uzak göl düzlemi
  { const gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, dn2Mix('#2a3a82', '#5a6cc0', f)); gr.addColorStop(0.18, dn2Mix('#18246a', '#2a3690', f)); gr.addColorStop(0.6, '#0a1040'); gr.addColorStop(1, '#050824');
    g.fillStyle = gr; g.fillRect(0, hy, W, H - hy + 1); }
  dn2SkyRefl(0, W, hy, hy, 0.78, tm, true);
  dn2AurRefl(0, W, hy, hy, tm); dn2MoonRoad(0, W, hy, tm);
  g.globalCompositeOperation = 'source-over';
  dn2Constellation(tm, hy, true, hy);
  dn2DrawLayer(DN2_LAY[0], hy, true, 0.4); dn2DrawLayer(DN2_LAY[1], hy, true, 0.45); dn2DrawLayer(DN2_LAY[2], hy, true, 0.5); dn2DrawLayer(DN2_LAY[3], hy, true, 0.5);
  dn2Landmarks(tm, hy, true);
  { const gr = g.createLinearGradient(0, hy, 0, H); gr.addColorStop(0, 'rgba(8,12,50,0)'); gr.addColorStop(0.5, 'rgba(8,12,50,0.22)'); gr.addColorStop(1, 'rgba(5,8,36,0.6)'); g.fillStyle = gr; g.fillRect(0, hy, W, H - hy + 1); }
  // ufuk çizgisindeki ışıltı + yüzeyde ince çizgiler
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = '#bcd0ff'; g.lineWidth = Math.max(1, 1 * S); g.globalAlpha = 0.18 + 0.1 * f; g.beginPath();
  for (let i = 0; i < 44; i++) { const u = ((i * 0.618) % 1), y = hy + 3 * S + u * u * (H - hy) * 0.8, x = ((i * 173 + tm * (6 + i % 5 * 3) * (i % 2 ? 1 : -1)) % (VW + 200) + VW + 200) % (VW + 200) - 100; g.moveTo(x * S, y); g.lineTo((x + 10 + u * 70) * S, y); }
  g.stroke(); g.globalAlpha = 1;
  for (let i = 0; i < 34; i++) { const u = (i * 0.618 + 0.07) % 1, xx = ((i * 0.37 + 0.13) % 1) * W, yy = hy + (6 + u * u * (H - hy) * 0.7), tw = Math.max(0, Math.sin(tm * (1.2 + i % 5 * 0.35) + i * 2.1)); dn2Eg(i % 3 ? '#cfe0ff' : '#ffe6c0', xx, yy, (5 + u * 14) * S, (1 + u * 1.5) * S, tw * tw * (0.25 + 0.6 * f)); }
  g.globalCompositeOperation = 'source-over';
  dn2DrawLayer(DN2_LAY[1], hy, false, 1);
  dn2Landmarks(tm, hy, false);
  dn2Haze(hy + 4 * S, 22 * S, 0.26 + 0.18 * f, '#6a7ee0');
  dn2DrawLayer(DN2_LAY[2], hy, false, 1);
  dn2Haze(hy + 22 * S, 26 * S, 0.22 + 0.14 * f, '#5a6ad0');
  dn2DrawLayer(DN2_LAY[3], hy, false, 1);
  dn2Haze(hy + 52 * S, 30 * S, 0.2 + 0.1 * f, '#4a5ac8');
  dn2DrawLayer(DN2_LAY[5], hy, true, 0.35);
  dn2DrawLayer(DN2_LAY[5], hy, false, 1);
  { const R = DN2.reg; dn2Haze(hy + 10 * S, 40 * S, 0.1 + 0.14 * R.a, R.hex); g.fillStyle = `rgba(${R.r | 0},${R.g | 0},${R.b | 0},${0.05 * R.a})`; g.fillRect(0, hy - 40 * S, W, H); }
}
// ═══════════ zemin: toprak profili, taşlar/kristaller, parçalı önbellek ═══════════
const DN2_SOIL = ['#2a3178', '#212766', '#181c54', '#10143f', '#0a0d2e', '#060822'];
const dn2Sy = [];   // sütun başına yumuşatılmış yüzey y'si
function dn2BuildSoil() {
  const raw = []; for (let c = 0; c < COLS; c++) { const t = topOf(c); raw.push(t < ROWS ? t * T : null); }
  for (let c = 0; c < COLS; c++) { let sum = 0, n = 0; for (let d = -3; d <= 3; d++) { const v = raw[clamp(c + d, 0, COLS - 1)]; if (v !== null) { sum += v; n++; } } dn2Sy.push(n ? sum / n : DN2.LH); }
  const p = new Path2D(), tp = new Path2D(); let c = 0; DN2.segs = [];
  const arcs = (path, P2) => { path.moveTo(P2[0][0], P2[0][1]);
    for (let i = 1; i < P2.length - 1; i++) {
      const [x0, y0] = P2[i - 1], [x1, y1] = P2[i], [x2, y2] = P2[i + 1];
      if ((x0 === x1 && x1 === x2) || (y0 === y1 && y1 === y2)) continue;
      path.arcTo(x1, y1, x2, y2, dn2OnLake(x1, T + 1) ? 20 : 13);
    }
    path.lineTo(P2[P2.length - 1][0], P2[P2.length - 1][1]); };
  while (c < COLS) {
    if (topOf(c) >= ROWS) { c++; continue; }
    const pts = [], a = c;
    while (c < COLS && topOf(c) < ROWS) { const y = topOf(c) * T; pts.push([c * T, y], [(c + 1) * T, y]); c++; }
    const bot = DN2.LH + 340, lakeL = !!dn2OnLake(a * T - 8, 0), lakeR = !!dn2OnLake(c * T + 8, 0);
    // göle bakan yanlar dik duvar değil: su altında göle doğru yayılan yumuşak kıyı eğimi (su rengine bürünür, bkz. dn2PaintTile)
    const bank = (ex, dir) => { const G = dn2OnLake(ex + dir * 8, 0), su = G ? G.su : pts[0][1] + 10, out = []; for (let i = 0; i <= 6; i++) { const u = i / 6; out.push([ex + dir * 150 * Math.pow(u, 1.7), su + 4 + 190 * u]); } out.push([ex + dir * 170, bot]); return out; };
    const P2 = [...(lakeL ? bank(a * T, -1).reverse() : [[a * T, bot]]), ...pts, ...(lakeR ? bank(c * T, 1) : [[c * T, bot]])];
    arcs(p, P2); p.closePath();
    // yalnız üst yüzey (dış yan duvarlar hariç): parlak kenar ışığı yalnız burada; duvarlar koyu ve yumuşak kalır
    arcs(tp, [[a * T, pts[0][1] + (lakeL ? 12 : 54)], ...pts, [c * T, pts[pts.length - 1][1] + (lakeR ? 12 : 54)]]);
    DN2.segs.push({ x0: a * T, x1: c * T, lakeL, lakeR });
  }
  DN2.gpath = p; DN2.gtop = tp;
  // gömülü taşlar, kristaller, ışıyan damarlar
  const R = rng(77); DN2.gems = []; DN2.veins = [];
  for (let c2 = 0; c2 < COLS; c2 += 1) {
    const t = raw[c2]; if (t === null) continue;
    for (let k = 0; k < 2; k++) if (R() < (k ? 0.12 : 0.55)) {   // seyrek: tek tek dağılmış parıltı "duvar kâğıdı" gibi durmasın (ışık cepleri aşağıda)
      const x = c2 * T + R() * T, y = t + 18 + Math.pow(R(), 1.3) * 190, r = R();
      DN2.gems.push(r < 0.72 ?{ k: 'r', x, y, rx: 5 + R() * 14, ry: 3 + R() * 8, a: (R() - 0.5) * 0.6 } : { k: 'c', x, y, s: 0.7 + R() * 0.9, a: (R() - 0.5) * 1.4, col: dn2Sat(['#7fe8d8', '#a8a0f0', '#ffd890'][Math.floor(R() * 3)], 0.8) });
    }
    if (R() < 0.16) { const x = c2 * T + R() * T, y = t + 40 + R() * 150, L = 40 + R() * 90, an = R() * 3.14; DN2.veins.push({ x, y, x2: x + Math.cos(an) * L, y2: y + Math.sin(an) * L * 0.6, cx: x + Math.cos(an + 1) * L * 0.5, cy: y + Math.sin(an + 1) * L * 0.4, c: R() < 0.5 ? '#6fe0d0' : '#9a90e8' }); }
  }
  DN2.roots = []; DN2.pebs = [];
  for (let c3 = 0; c3 < COLS; c3++) { const t = raw[c3]; if (t === null) continue; const R3 = rng(c3 * 7 + 1);
    if (R3() < 0.35) DN2.roots.push({ x: c3 * T + R3() * T, y: t + 6, L: 30 + R3() * 90, d1: (R3() - 0.5) * 30, d2: (R3() - 0.5) * 40, d3: (R3() - 0.5) * 50, w: 1.6 + R3() * 2.4 });
    for (let k = 0; k < 2; k++) if (R3() < 0.3) { const cx0 = c3 * T + R3() * T, cy0 = t + 24 + R3() * 120; for (let m = 0, n = 2 + Math.floor(R3() * 4); m < n; m++) DN2.pebs.push({ x: cx0 + (R3() - 0.5) * 24, y: cy0 + (R3() - 0.5) * 12, r: 1.8 + R3() * 3.2, a: R3() * 3, c: ['#2a3282', '#1c2468', '#343e94'][Math.floor(R3() * 3)] }); } }
  // ışık cepleri (toprak içinde küçük, sıcak ışıklı kovuklar: kristal + minik mantar), toprak renk lekeleri, gömülü yıldız taşları
  DN2.pockets = []; DN2.blobs = []; DN2.sstones = []; const R4 = rng(4242), PC = ['#6fe8d8', '#b9a0ff', '#ffd890', '#ff9ad8'];
  for (const sg of DN2.segs) {
    for (let x = sg.x0 + 60 + R4() * 200; x < sg.x1 - 60; x += 210 + R4() * 230) {
      const t = raw[clamp(Math.floor(x / T), 0, COLS - 1)]; if (t === null) continue;
      if ((sg.lakeL && x < sg.x0 + 120) || (sg.lakeR && x > sg.x1 - 120)) continue;
      DN2.pockets.push({ x, y: t + 78 + R4() * 150, rx: 30 + R4() * 26, ry: 17 + R4() * 10, col: PC[Math.floor(R4() * PC.length)], n: 2 + Math.floor(R4() * 3), m: R4() < 0.6, ph: R4() * 6.28, seed: Math.floor(R4() * 9999) });
    }
    for (let x = sg.x0 + R4() * 120; x < sg.x1; x += 90 + R4() * 120) { const t = raw[clamp(Math.floor(x / T), 0, COLS - 1)]; if (t === null) continue;
      DN2.blobs.push({ x, y: t + 60 + R4() * 300, r: 70 + R4() * 120, col: ['#3b3ca8', '#1d5f80', '#4b2f92', '#2a4aa0'][Math.floor(R4() * 4)], a: 0.12 + R4() * 0.12 }); }
    for (let x = sg.x0 + R4() * 200; x < sg.x1; x += 160 + R4() * 260) { const t = raw[clamp(Math.floor(x / T), 0, COLS - 1)]; if (t === null) continue;
      DN2.sstones.push({ x, y: t + 30 + R4() * 200, s: 2.6 + R4() * 2.4, a: R4() * 1.2 }); }
  }
  DN2.gc = new Map();
}
function dn2Star5(x, cx, cy, r, rot) { x.beginPath(); for (let k = 0; k < 10; k++) { const an = rot - Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; k ? x.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr) : x.moveTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } x.closePath(); }
function dn2PaintTile(x, k, y0, th, sc) {
  const TW = 512, X0 = k * TW, X1 = X0 + TW, R = rng(k * 131 + 9), mt = DN2.GTOP;
  const inT = (a, b, pad) => b > X0 - pad && a < X1 + pad;
  x.save(); x.clip(DN2.gpath);
  const gg = x.createLinearGradient(0, mt, 0, DN2.LH + 40);
  gg.addColorStop(0, DN2_SOIL[0]); gg.addColorStop(0.18, DN2_SOIL[1]); gg.addColorStop(0.5, DN2_SOIL[3]); gg.addColorStop(1, DN2_SOIL[5]); x.fillStyle = gg; x.fillRect(X0 - 30, y0 - 30, TW + 60, th + 60);
  for (const b of DN2.blobs) {   // toprakta yumuşak renk lekeleri (turkuaz / mor / çivit): düz, tek renk blok görünmesin
    if (!inT(b.x - b.r, b.x + b.r, 0)) continue; const rg = x.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    rg.addColorStop(0, dn2Hx(b.col, b.a)); rg.addColorStop(1, dn2Hx(b.col, 0)); x.fillStyle = rg; x.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2); }
  const dep = [20, 46, 84, 130, 196];   // dalgalı toprak katmanları (derine inildikçe koyulaşır); çizgisiz, yumuşak
  dep.forEach((d, j) => {
    x.beginPath(); x.moveTo(X0 - 24, DN2.LH + 400);
    for (let px = X0 - 24; px <= X1 + 24; px += 12) { const c = clamp(Math.floor(px / T), 0, COLS - 1); x.lineTo(px, dn2Sy[c] + d + Math.sin(px * 0.021 + j * 2) * 5 + Math.sin(px * 0.053 + j) * 2.5); }
    x.lineTo(X1 + 24, DN2.LH + 400); x.closePath(); x.fillStyle = dn2Hx(DN2_SOIL[Math.min(5, j + 2)], 0.4); x.fill();
    if (j < 3) { x.save(); x.translate(0, 1.5); x.strokeStyle = dn2Hx('#7a8af0', 0.05); x.lineWidth = 3; x.stroke(); x.restore(); }
  });
  for (const r of DN2.roots) {   // kökler: yüzeyden inen sivrilen kıvrımlar, yan filizler; bazılarının ucunda minik ışık
    if (r.x < X0 - 60 || r.x > X1 + 60) continue; const ex = r.x + r.d3, ey = r.y + r.L;
    for (let s = 0; s < 3; s++) { const w = r.w * (1 - s * 0.32); x.strokeStyle = dn2Hx('#060826', 0.55 + s * 0.12); x.lineWidth = w; x.beginPath(); x.moveTo(r.x, r.y);
      const u = 1 - s * 0.22; x.bezierCurveTo(r.x + r.d1, r.y + r.L * 0.4 * u, r.x + r.d2, r.y + r.L * 0.7 * u, r.x + r.d3 * u, r.y + r.L * u); x.stroke(); }
    x.strokeStyle = dn2Hx('#060826', 0.6); x.lineWidth = r.w * 0.45; x.beginPath(); x.moveTo(r.x + r.d1 * 0.5, r.y + r.L * 0.35); x.quadraticCurveTo(r.x + r.d1 + 14, r.y + r.L * 0.5, r.x + r.d1 + 22 * Math.sign(r.d2 || 1), r.y + r.L * 0.62); x.stroke();
    x.strokeStyle = dn2Hx('#7a88f0', 0.2); x.lineWidth = 0.8; x.beginPath(); x.moveTo(r.x - 1, r.y); x.bezierCurveTo(r.x + r.d1 - 1, r.y + r.L * 0.4, r.x + r.d2 - 1, r.y + r.L * 0.7, ex - 1, ey); x.stroke();
    if (r.L > 70) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.55; x.drawImage(glow(r.w > 3 ? '#7fe8d8' : '#b9a0ff'), ex - 7, ey - 7, 14, 14); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
  }
  for (const pb of DN2.pebs) { if (pb.x < X0 - 10 || pb.x > X1 + 10) continue; x.fillStyle = dn2Hx(pb.c, 0.6); x.beginPath(); x.ellipse(pb.x, pb.y, pb.r, pb.r * 0.7, pb.a, 0, 6.283); x.fill(); x.fillStyle = 'rgba(190,200,255,0.14)'; x.beginPath(); x.ellipse(pb.x - pb.r * 0.25, pb.y - pb.r * 0.3, pb.r * 0.45, pb.r * 0.25, pb.a, 0, 6.283); x.fill(); }
  x.globalCompositeOperation = 'lighter'; x.lineWidth = 1.1;
  for (const v of DN2.veins) { if (v.x2 < X0 - 20 || v.x > X1 + 20) continue; x.strokeStyle = dn2Hx(v.c, 0.18); x.beginPath(); x.moveTo(v.x, v.y); x.quadraticCurveTo(v.cx, v.cy, v.x2, v.y2); x.stroke();
    x.globalAlpha = 0.5; x.drawImage(glow(v.c), v.x2 - 9, v.y2 - 9, 18, 18); x.globalAlpha = 1; }
  x.globalCompositeOperation = 'source-over';
  for (const m of DN2.gems) {
    if (m.x < X0 - 30 || m.x > X1 + 30) continue;
    if (m.k === 'r') { const rg = x.createRadialGradient(m.x - m.rx * 0.3, m.y - m.ry * 0.5, 0, m.x, m.y, Math.max(m.rx, m.ry)); rg.addColorStop(0, DN2_SOIL[2]); rg.addColorStop(1, DN2_SOIL[4]); x.fillStyle = rg; x.beginPath(); x.ellipse(m.x, m.y, m.rx, m.ry, m.a, 0, 6.283); x.fill();
      x.strokeStyle = dn2Hx('#8a9aff', 0.2); x.lineWidth = 1.2; x.beginPath(); x.ellipse(m.x, m.y, m.rx, m.ry, m.a, 3.4, 5.9); x.stroke(); }
    else { x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.3; x.drawImage(glow(m.col), m.x - 22 * m.s, m.y - 22 * m.s, 44 * m.s, 44 * m.s); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      x.save(); x.translate(m.x, m.y); x.rotate(m.a); x.scale(m.s * 0.8, m.s * 0.8); dn2Shard(x, m.col); x.restore(); }
  }
  for (const s of DN2.sstones) {   // gömülü minik yıldız taşları (Yıldız Gölü'nün toprağı): soluk altın
    if (s.x < X0 - 20 || s.x > X1 + 20) continue; x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.3; x.drawImage(glow('#ffd890'), s.x - s.s * 5, s.y - s.s * 5, s.s * 10, s.s * 10); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    dn2Star5(x, s.x, s.y, s.s, s.a); x.fillStyle = dn2Hx('#ffe6a8', 0.55); x.fill(); x.strokeStyle = dn2Hx('#fff6d8', 0.5); x.lineWidth = 0.6; x.stroke(); }
  for (const pk of DN2.pockets) {   // ışık cebi: koyu kovuk + içten sıcak ışık + taban kristalleri / minik mantarlar
    if (!inT(pk.x - pk.rx - 40, pk.x + pk.rx + 40, 0)) continue; const R2 = rng(pk.seed), cx = pk.x, cy = pk.y, rx = pk.rx, ry = pk.ry, fy = cy + ry * 0.55;
    let rg = x.createRadialGradient(cx, cy, 0, cx, cy, rx * 1.9); rg.addColorStop(0, dn2Hx(pk.col, 0.22)); rg.addColorStop(1, dn2Hx(pk.col, 0)); x.globalCompositeOperation = 'lighter'; x.fillStyle = rg; x.fillRect(cx - rx * 2, cy - rx * 2, rx * 4, rx * 4); x.globalCompositeOperation = 'source-over';
    const hol = new Path2D(); hol.moveTo(cx - rx, fy); hol.bezierCurveTo(cx - rx * 1.05, cy - ry * 0.9, cx - rx * 0.3, cy - ry * 1.15, cx + rx * 0.15, cy - ry * 1.05); hol.bezierCurveTo(cx + rx * 0.8, cy - ry * 0.95, cx + rx * 1.08, cy - ry * 0.2, cx + rx, fy); hol.quadraticCurveTo(cx, fy + ry * 0.35, cx - rx, fy); hol.closePath();
    rg = x.createRadialGradient(cx, fy, 0, cx, cy, rx * 1.1); rg.addColorStop(0, dn2Mix(pk.col, '#1a1d60', 0.45)); rg.addColorStop(0.55, dn2Mix(pk.col, '#0a0c34', 0.78)); rg.addColorStop(1, '#070924'); x.fillStyle = rg; x.fill(hol);
    x.strokeStyle = dn2Hx('#03041a', 0.7); x.lineWidth = 2.4; x.stroke(hol);
    x.save(); x.clip(hol);
    x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.5; x.drawImage(glow(pk.col), cx - rx * 1.2, fy - ry * 1.3, rx * 2.4, ry * 2.2); x.globalAlpha = 1;
    for (let i = 0; i < 7; i++) { x.globalAlpha = 0.6; const px = cx + (R2() - 0.5) * rx * 1.5, py = cy + (R2() - 0.6) * ry * 1.2; x.drawImage(glow('#ffffff'), px - 1.6, py - 1.6, 3.2, 3.2); } x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over';
    for (let i = 0; i < pk.n; i++) { const px = cx + (i - (pk.n - 1) / 2) * rx * 0.42 + (R2() - 0.5) * 6; x.save(); x.translate(px, fy + 2); x.rotate((R2() - 0.5) * 0.7); x.scale(0.75 + R2() * 0.5, 0.75 + R2() * 0.6); dn2Shard(x, dn2Mix(pk.col, '#ffffff', 0.25)); x.restore(); }
    if (pk.m) for (let i = 0; i < 2; i++) { const px = cx + (i ? 0.55 : -0.62) * rx, hh = 6 + R2() * 5, cw = 4 + R2() * 2.5, my = fy - (i ? 1 : 2);
      x.fillStyle = '#d8d0ff'; x.fillRect(px - 0.9, my - hh, 1.8, hh); x.fillStyle = dn2Mix(pk.col, '#ffffff', 0.35); x.beginPath(); x.ellipse(px, my - hh, cw, cw * 0.7, 0, Math.PI, 6.283); x.fill(); }
    x.restore();
    x.strokeStyle = dn2Hx(dn2Mix(pk.col, '#ffffff', 0.4), 0.35); x.lineWidth = 1.1; x.beginPath(); x.moveTo(cx - rx * 0.92, fy + 1); x.quadraticCurveTo(cx, fy + ry * 0.38, cx + rx * 0.92, fy + 1); x.stroke();
  }
  // kıyı dibi: su seviyesinin altında kalan toprak su rengine bürünür (göle inen keskin parlak duvar yerine suya gömülen yumuşak kıyı)
  for (const G of DN2.lakes) {
    for (const [ex, dir] of [[G.x0, 1], [G.x1, -1]]) {   // dir: toprağın gölden uzağa doğru yönü (sol kıyıda toprak solda → -1)
      const sx = ex, d = -dir, w = 190, o = 180; if (!inT(Math.min(sx - d * o, sx + d * w), Math.max(sx - d * o, sx + d * w), 30)) continue;
      const LK = dn2LK(G), A = hex(LK.body[1]), B = hex(LK.body[2]), ca = a => `rgba(${A[0]},${A[1]},${A[2]},${a})`;
      const hg = x.createLinearGradient(sx - d * o, 0, sx + d * w, 0); hg.addColorStop(0, ca(0.8)); hg.addColorStop(o / (o + w), ca(0.6)); hg.addColorStop((o + w * 0.45) / (o + w), ca(0.26)); hg.addColorStop(1, ca(0));
      x.fillStyle = hg; x.fillRect(Math.min(sx - d * o, sx + d * w) - 2, G.su + 3, o + w + 4, DN2.LH + 400 - G.su);
      const vg = x.createLinearGradient(0, G.su, 0, G.su + 230); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(${B[0]},${B[1]},${B[2]},0.5)`); x.fillStyle = vg; x.fillRect(Math.min(sx - d * o, sx) - 2, G.su + 3, o + 4, DN2.LH + 400 - G.su);
      x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.35; x.drawImage(glow('#6a88ff'), sx - 40, G.su - 10, 80, 60); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    }
  }
  // yüzey: kenar ışığı YALNIZ üst yüzeyde (yan duvarlar koyu kontur + ince soluk ışık); içe doğru yumuşak turkuaz ışıma
  x.strokeStyle = dn2Hx('#0a0d30', 0.75); x.lineWidth = 7; x.stroke(DN2.gpath);
  x.strokeStyle = dn2Hx('#6a7ae8', 0.18); x.lineWidth = 1.6; x.stroke(DN2.gpath);
  x.globalCompositeOperation = 'lighter';
  x.strokeStyle = dn2Hx('#3fb8c8', 0.05); x.lineWidth = 60; x.stroke(DN2.gtop); x.lineWidth = 36; x.stroke(DN2.gtop); x.strokeStyle = dn2Hx('#4fd0d0', 0.07); x.lineWidth = 20; x.stroke(DN2.gtop);
  x.globalCompositeOperation = 'source-over';
  x.strokeStyle = dn2Hx('#3a4aa8', 0.85); x.lineWidth = 16; x.stroke(DN2.gtop);
  x.strokeStyle = dn2Hx('#2a8c9c', 0.95); x.lineWidth = 10; x.stroke(DN2.gtop);
  x.strokeStyle = dn2Hx('#4fd0bc', 0.75); x.lineWidth = 4.5; x.stroke(DN2.gtop);
  x.globalCompositeOperation = 'lighter'; x.strokeStyle = dn2Hx('#9ff8ff', 0.07); x.lineWidth = 24; x.stroke(DN2.gtop); x.strokeStyle = dn2Hx('#d8ffff', 0.5); x.lineWidth = 1.2; x.stroke(DN2.gtop);
  x.globalCompositeOperation = 'source-over';
  x.restore();
  // yüzeyin üstünde yosun tomurcukları (kıyıyı yumuşatır) ve yuvarlak taşlar
  for (let c = Math.floor(X0 / T) - 1; c <= Math.ceil(X1 / T); c++) {
    const cc = clamp(c, 0, COLS - 1), t = topOf(cc); if (t >= ROWS) continue; const RR = rng(cc * 17 + 3);
    for (let n = 0; n < 4; n++) { const px = cc * T + RR() * T, py = t * T, r = 3 + RR() * 5; if (px < X0 - 10 || px > X1 + 10) continue;
      x.fillStyle = dn2Hx(RR() < 0.5 ? '#2fa7b0' : '#3cc4b4', 0.95); x.beginPath(); x.ellipse(px, py + 1, r * 1.5, r, 0, Math.PI, 6.283); x.fill(); x.fillStyle = dn2Hx('#b8fff0', 0.35); x.beginPath(); x.ellipse(px, py - r * 0.1, r * 1.1, r * 0.5, 0, Math.PI, 6.283); x.fill(); }
    if (RR() < 0.18) { const px = cc * T + RR() * T, py = t * T, rx = 9 + RR() * 16, ry = rx * (0.5 + RR() * 0.2); if (px >= X0 - 20 && px <= X1 + 20) {
      const rg = x.createRadialGradient(px - rx * 0.3, py - ry, 0, px, py, rx); rg.addColorStop(0, '#3a4390'); rg.addColorStop(1, '#10143f'); x.fillStyle = rg; x.beginPath(); x.ellipse(px, py + 2, rx, ry, 0, Math.PI, 6.283); x.fill();
      x.strokeStyle = dn2Hx('#b8c4ff', 0.45); x.lineWidth = 1.2; x.beginPath(); x.ellipse(px, py + 2, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.8); x.stroke(); } }
  }
}
function dn2Shard(x, col) {   // küçük kristal kümesi (0,0 tabanda)
  x.fillStyle = dn2Hx(col, 0.85); x.beginPath(); x.moveTo(-3, 0); x.lineTo(-1, -17); x.lineTo(3, 0); x.moveTo(1.5, 0); x.lineTo(8, -10); x.lineTo(7, 1); x.moveTo(-2, 0); x.lineTo(-9, -8); x.lineTo(-6, 1); x.fill();
  x.fillStyle = 'rgba(255,255,255,0.6)'; x.beginPath(); x.moveTo(-1, -2); x.lineTo(-0.8, -15); x.lineTo(0.6, -2); x.fill();
}
const DN2_TW = 512;
const dn2GGeo = () => ({ TH: DN2.LH + 60 - (DN2.GTOP - 70), y0: DN2.GTOP - 70, sc: clamp(H / VH * 0.72, 0.6, 1.7) });
function dn2GMake(k, G) {
  let c = DN2.gc.get(k); if (c && c.sc === G.sc) return c;
  const cvs = c ? c.cv : dn2Cv(0, 0), PAD = 2, TW = DN2_TW; cvs.width = Math.round(TW * G.sc) + PAD * 2; cvs.height = Math.round(G.TH * G.sc) + PAD * 2;
  const x = cvs.getContext('2d'); x.setTransform(G.sc, 0, 0, G.sc, -k * TW * G.sc + PAD, -G.y0 * G.sc + PAD); x.lineCap = 'round'; x.lineJoin = 'round';
  dn2PaintTile(x, k, G.y0, G.TH, G.sc); c = { cv: cvs, sc: G.sc, pad: PAD }; DN2.gc.set(k, c); return c;
}
function dn2DrawGround() {
  const TW = DN2_TW, G = dn2GGeo(), TH = G.TH, y0 = G.y0, sc = G.sc;
  const k0 = Math.floor(cam.x / TW), k1 = Math.floor((cam.x + VW) / TW), dir = cam.x >= (DN2.px == null ? cam.x : DN2.px) ? 1 : -1; DN2.px = cam.x;
  const make = k => dn2GMake(k, G);
  for (let k = k0; k <= k1; k++) { if (k < -1 || k * TW > COLS * T) continue; const c = make(k);
    const sx0 = Math.round((k * TW - cam.x) * S), sx1 = Math.round(((k + 1) * TW - cam.x) * S), sy0 = Math.round((y0 - cam.y) * S), sy1 = Math.round((y0 + TH - cam.y) * S);
    g.drawImage(c.cv, c.pad, c.pad, c.cv.width - c.pad * 2, c.cv.height - c.pad * 2, sx0, sy0, sx1 - sx0 + 1, sy1 - sy0); }
  const ahead = dir > 0 ? k1 + 1 : k0 - 1;   // boşta: ilerideki parçayı hazırla (karede en çok bir)
  if (ahead >= 0 && ahead * TW < COLS * T && (!DN2.gc.get(ahead) || DN2.gc.get(ahead).sc !== sc)) make(ahead);
  for (const key of DN2.gc.keys()) if (key < k0 - 3 || key > k1 + 3) { const c = DN2.gc.get(key); c.cv.width = c.cv.height = 0; DN2.gc.delete(key); }
}

// ═══════════ zemin süsleri (canlı: sallanan ot, ışık çiçekleri, kristal parıltısı) ve adalar ═══════════
const DN2_FC = ['#7fe8d8', '#ffd890', '#a8a0f0', '#7fe8d8', '#ff9ad8'];
const dn2DS = {};
function dn2DecoSpr(kind, v, col) {
  const key = kind + v + col; if (dn2DS[key]) return dn2DS[key]; col = dn2Sat(col, 0.72);   // çevre renkleri sönük/sade: karakter ve hedefler öne çıksın
  const q = kind === 'c' ? 3 : 2, w = 90, h = 150, c = dn2DS[key] = dn2Cv(w * q, h * q), x = c.getContext('2d'), R = rng(v * 13 + 5 + col.length); x.setTransform(q, 0, 0, q, w * q / 2, h * q - 2);
  x.lineCap = 'round';
  if (kind === 'g') {   // ışık otu
    const n = 5 + v % 3;
    for (let i = 0; i < n; i++) { const an = (i - (n - 1) / 2) * 0.28 + (R() - 0.5) * 0.15, L = 20 + R() * 28; const ex = Math.sin(an) * L, ey = -Math.cos(an) * L;
      const gr = x.createLinearGradient(0, 0, ex, ey); gr.addColorStop(0, '#0b2a5e'); gr.addColorStop(0.65, '#1f7e9a'); gr.addColorStop(1, '#9ff8e0');
      x.strokeStyle = gr; x.lineWidth = 2.4; x.beginPath(); x.moveTo(i - n / 2, 0); x.quadraticCurveTo(ex * 0.3, ey * 0.7, ex + (an > 0 ? 3 : -3), ey); x.stroke();
      x.globalCompositeOperation = 'lighter'; x.drawImage(glow('#9ff8e0'), ex - 4 + (an > 0 ? 3 : -3), ey - 4, 8, 8); x.globalCompositeOperation = 'source-over'; }
  } else if (kind === 'f') {   // yıldız çiçeği
    const H2 = 26 + R() * 22, lean = (R() - 0.5) * 8;
    x.strokeStyle = '#1b8a88'; x.lineWidth = 2.2; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(lean, -H2 * 0.5, lean * 1.3, -H2); x.stroke();
    x.fillStyle = '#16787e'; for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(sd * 5, -H2 * 0.35, 6, 2.4, sd * -0.5, 0, 6.283); x.fill(); }
    x.translate(lean * 1.3, -H2); x.globalCompositeOperation = 'lighter'; x.drawImage(glow(col), -16, -16, 32, 32); x.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 5; i++) { x.save(); x.rotate(i * 1.2566 - 1.57); x.fillStyle = dn2Hx(col, 0.95); x.beginPath(); x.ellipse(0, -6, 3.1, 6.2, 0, 0, 6.283); x.fill(); x.fillStyle = 'rgba(255,255,255,0.45)'; x.beginPath(); x.ellipse(0, -7, 1.1, 3.6, 0, 0, 6.283); x.fill(); x.restore(); }
    x.fillStyle = '#fff6d0'; x.beginPath(); x.arc(0, 0, 2.6, 0, 6.283); x.fill();
  } else if (kind === 'r') {   // göl kıyısı sazı: uzun yapraklar, ucunda ışık
    for (let i = 0; i < 4; i++) { const an = (i - 1.5) * 0.14 + (R() - 0.5) * 0.08, L = 70 + R() * 55, ex = Math.sin(an) * L, ey = -Math.cos(an) * L;
      x.strokeStyle = '#0b2860'; x.lineWidth = 2.6; x.beginPath(); x.moveTo(i * 1.5 - 3, 0); x.quadraticCurveTo(ex * 0.2, ey * 0.55, ex, ey); x.stroke();
      x.strokeStyle = dn2Hx('#78e0e8', 0.5); x.lineWidth = 0.8; x.beginPath(); x.moveTo(i * 1.5 - 3.8, 0); x.quadraticCurveTo(ex * 0.2 - 1, ey * 0.55, ex, ey); x.stroke();
      if (i % 2 === 0) { x.fillStyle = '#10346a'; x.beginPath(); x.ellipse(ex, ey - 5, 2.6, 8, an, 0, 6.283); x.fill(); x.globalCompositeOperation = 'lighter'; x.drawImage(glow(col), ex - 9, ey - 14, 18, 18); x.globalCompositeOperation = 'source-over'; } }
  } else if (kind === 'b') {   // sarkık çan çiçeği (ışıklı)
    const H2 = 40 + R() * 20; x.strokeStyle = '#1b8a88'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-10, -H2 * 0.7, 4, -H2); x.quadraticCurveTo(14, -H2 - 6, 16, -H2 + 8); x.stroke();
    for (let i = 0; i < 3; i++) { const bx = 4 + i * 6 - 2, by = -H2 + 4 + i * 8 - (i === 2 ? 4 : 0) + 6; x.strokeStyle = '#1b8a88'; x.lineWidth = 1; x.beginPath(); x.moveTo(i * 4 - 1, -H2 + 2); x.lineTo(bx + 8, by - 6); x.stroke();
      x.save(); x.translate(bx + 8, by); x.globalCompositeOperation = 'lighter'; x.drawImage(glow(col), -14, -8, 28, 28); x.globalCompositeOperation = 'source-over';
      const gr = x.createLinearGradient(0, 0, 0, 12); gr.addColorStop(0, dn2Hx(col, 1)); gr.addColorStop(1, dn2Hx(dn2Mix(col, '#3a2a90', 0.5), 1)); x.fillStyle = gr; x.beginPath(); x.moveTo(-2.4, 0); x.quadraticCurveTo(-6.5, 7, -7, 12); x.quadraticCurveTo(0, 9, 7, 12); x.quadraticCurveTo(6.5, 7, 2.4, 0); x.closePath(); x.fill(); x.fillStyle = '#fff3c8'; x.beginPath(); x.arc(0, 11, 1.5, 0, 6.283); x.fill(); x.restore(); }
  } else if (kind === 'm') {   // ışıklı mantar (yuvarlak şapka, benekli)
    const hh = 12 + R() * 14, cw = 10 + R() * 8;
    x.fillStyle = '#c8c0ee'; x.beginPath(); x.moveTo(-2.4, 0); x.quadraticCurveTo(-1.6, -hh * 0.6, -2, -hh); x.lineTo(2, -hh); x.quadraticCurveTo(1.6, -hh * 0.6, 2.4, 0); x.fill();
    x.globalCompositeOperation = 'lighter'; x.drawImage(glow(col), -cw * 1.6, -hh - cw * 1.4, cw * 3.2, cw * 2.8); x.globalCompositeOperation = 'source-over';
    const gr = x.createRadialGradient(-cw * 0.3, -hh - cw * 0.4, 1, 0, -hh, cw * 1.1); gr.addColorStop(0, dn2Mix(col, '#ffffff', 0.5)); gr.addColorStop(1, dn2Mix(col, '#4a2a9a', 0.35)); x.fillStyle = gr; x.beginPath(); x.ellipse(0, -hh, cw, cw * 0.7, 0, Math.PI, 6.283); x.fill(); x.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc((i - 1) * cw * 0.5, -hh - cw * (0.25 + (i % 2) * 0.2), 1.4 + R(), 0, 6.283); x.fill(); }
  } else {   // kristal kümesi
    x.globalCompositeOperation = 'lighter'; x.drawImage(glow(col), -34, -48, 68, 68); x.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 4; i++) { x.save(); x.translate((i - 1.5) * 5, 0); x.rotate((i - 1.5) * 0.28); x.scale(0.8 + R() * 0.7, 0.8 + R() * 0.8); dn2Shard(x, col); x.restore(); }
  }
  return c;
}
function dn2RegName(x) { const L = typeof BOLUM !== 'undefined' && BOLUM && BOLUM.bolgeler ? BOLUM.bolgeler : []; for (let i = 0; i < L.length; i++) if (x >= L[i].x0 && x < L[i].x1) return L[i].ad; return ''; }
const DN2_REGP = {   // sade palet: turkuaz, altın, lila + tek pembe vurgu
  patika: { f: ['#7fe8d8', '#ffd890'], b: 0.04, m: 0.015, c: 0.04, bigc: 0 },
  goletKiyi: { f: ['#7fe8d8', '#ff9ad8'], b: 0.07, m: 0.02, c: 0.045, bigc: 0 },
  yildizGol: { f: ['#7fe8d8', '#a8a0f0'], b: 0.08, m: 0.01, c: 0.05, bigc: 0 },
  pofuduk: { f: ['#ffd890', '#ff9ad8', '#7fe8d8'], b: 0.04, m: 0.06, c: 0.04, bigc: 0 },
  hayvan: { f: ['#ffd890', '#7fe8d8'], b: 0.03, m: 0.015, c: 0.08, bigc: 0.5 },
};
function dn2BuildDeco() {
  const R = rng(321); DN2.deco = []; DN2.plats = [];
  for (let c = 0; c < COLS; c++) {
    const t = topOf(c); if (t >= ROWS) continue; const y = t * T, atLake = !!dn2OnLake(c * T, 70), x = c * T + R() * T, RP = DN2_REGP[dn2RegName(c * T + T / 2)] || DN2_REGP.patika, pick = a => a[Math.floor(R() * a.length)];
    const edge = topOf(Math.max(0, c - 1)) !== t || topOf(Math.min(COLS - 1, c + 1)) !== t;
    if (R() < (atLake ? 0.55 : 0.4)) DN2.deco.push({ k: atLake && R() < 0.6 ? 'r' : 'g', v: Math.floor(R() * 3), x, y: y + 2, ph: R() * 6, s: 0.8 + R() * 0.55, c: pick(RP.f) });
    if (R() < 0.2) DN2.deco.push({ k: 'f', v: Math.floor(R() * 3), x: c * T + R() * T, y: y + 2, ph: R() * 6, s: 0.85 + R() * 0.5, c: pick(RP.f) });
    if (R() < RP.b * (atLake ? 1.6 : 1)) DN2.deco.push({ k: 'b', v: Math.floor(R() * 3), x: c * T + R() * T, y: y + 2, ph: R() * 6, s: 0.9 + R() * 0.5, c: pick(RP.f) });
    if (R() < RP.m) DN2.deco.push({ k: 'm', v: Math.floor(R() * 3), x: c * T + R() * T, y: y + 2, ph: R() * 6, s: 0.9 + R() * 0.7, c: pick(RP.f) });
    if (R() < (edge ? 0.12 : 0.07) * (RP.c / 0.06)) DN2.deco.push({ k: 'c', v: 0, x: c * T + R() * T, y: y + 1, ph: R() * 6, s: (0.8 + R() * 0.6) * (R() < RP.bigc ? 2.2 : 1), c: pick(['#7fe8d8', '#a8a0f0', '#ffd890']) });
  }
  DN2.deco.sort((a, b) => a.x - b.x);
  for (let r = 0; r < ROWS; r++) { let c = 0; while (c < COLS) { if (grid[r][c] !== 2) { c++; continue; } const a = c; while (c < COLS && grid[r][c] === 2) c++; DN2.plats.push({ x0: a * T, x1: c * T, y: r * T, id: DN2.plats.length }); } }
}
function dn2DrawDeco(tm, live) {
  const D = DN2.deco, vx0 = cam.x - 60, vx1 = cam.x + VW + 60;
  let lo = 0, hi = D.length; while (lo < hi) { const m = (lo + hi) >> 1; if (D[m].x < vx0) lo = m + 1; else hi = m; }
  for (let i = lo; i < D.length && D[i].x < vx1; i++) {
    const d = D[i], sp = dn2DecoSpr(d.k, d.v, d.c), sw = d.k === 'c' || d.k === 'm' ? 0 : Math.sin(tm * (d.k === 'r' ? 0.8 : 1.3) + d.ph + d.x * 0.01) * (d.k === 'f' ? 0.05 : 0.08);
    const fc = dn2Foc((d.x - cam.x) * S, (d.y - 30 - cam.y) * S);
    g.save(); g.translate(d.x, d.y); g.rotate(sw); g.scale(d.s, d.s); g.globalAlpha = 0.38 + 0.62 * fc;
    g.drawImage(sp, -45, -150 + 1, 90, 150); g.restore(); g.globalAlpha = 1;
    if (d.k === 'f' || d.k === 'c' || d.k === 'b') { const pul = 0.6 + 0.4 * Math.sin(tm * 1.4 + d.ph); g.globalCompositeOperation = 'lighter'; const hh = d.k === 'f' ? 34 * d.s : d.k === 'b' ? 40 * d.s : 14 * d.s; dn2Eg(d.c, d.x + sw * hh * 0.6, d.y - hh, 26 * d.s * pul + 8, 26 * d.s * pul + 8, (d.k === 'f' ? 0.2 : d.k === 'b' ? 0.15 : 0.24) * (0.5 + DN2.fill * 0.5) * fc * fc); g.globalCompositeOperation = 'source-over'; }
  }
}
function dn2PlatSpr(p) {
  const w = p.x1 - p.x0; if (p.cv) return p.cv; const q = 2, c = p.cv = dn2Cv((w + 30) * q, 70 * q), x = c.getContext('2d'), R = rng(p.id * 7 + 1); x.setTransform(q, 0, 0, q, 15 * q, 8 * q); x.lineJoin = 'round';
  const body = new Path2D(); body.moveTo(0, 2); body.lineTo(w, 2); body.quadraticCurveTo(w + 4, 12, w - 8, 20); body.quadraticCurveTo(w * 0.7, 30, w * 0.5, 24); body.quadraticCurveTo(w * 0.3, 30, 10, 20); body.quadraticCurveTo(-4, 12, 0, 2); body.closePath();
  const gr = x.createLinearGradient(0, 0, 0, 30); gr.addColorStop(0, '#3a4496'); gr.addColorStop(0.5, '#1e2468'); gr.addColorStop(1, '#0c1040'); x.fillStyle = gr; x.fill(body);
  x.save(); x.clip(body); x.strokeStyle = '#2fa7b0'; x.lineWidth = 9; x.stroke(body); x.strokeStyle = '#5fe0c8'; x.lineWidth = 4; x.stroke(body); x.restore();
  x.fillStyle = '#2fa7b0'; for (let i = 0; i < w / 9; i++) { const px = 3 + R() * (w - 6), r = 2 + R() * 3; x.beginPath(); x.ellipse(px, 2, r * 1.5, r, 0, Math.PI, 6.283); x.fill(); }
  x.strokeStyle = dn2Hx('#d8ffff', 0.6); x.lineWidth = 1; x.beginPath(); x.moveTo(3, 1.5); x.lineTo(w - 3, 1.5); x.stroke();
  for (let i = 0; i < Math.max(2, w / 38); i++) { const px = 12 + R() * (w - 24), col = ['#7fe8d8', '#a8a0f0', '#ffd890'][Math.floor(R() * 3)]; x.save(); x.translate(px, 22); x.rotate(Math.PI + (R() - 0.5) * 0.5); x.scale(0.7 + R() * 0.5, 0.7 + R() * 0.5); dn2Shard(x, col); x.restore(); }
  x.strokeStyle = dn2Hx('#4fd8c8', 0.7); x.lineWidth = 1.2; for (let i = 0; i < w / 14; i++) { const px = 8 + R() * (w - 16), L = 8 + R() * 18; x.beginPath(); x.moveTo(px, 18); x.quadraticCurveTo(px + 2, 18 + L * 0.5, px - 1, 18 + L); x.stroke(); }
  return c;
}
function dn2DrawPlats(tm) {
  for (const p of DN2.plats) {
    if (p.x1 < cam.x - 40 || p.x0 > cam.x + VW + 40) continue; const w = p.x1 - p.x0, sp = dn2PlatSpr(p);
    g.globalCompositeOperation = 'lighter'; dn2Eg('#7ff0ff', (p.x0 + p.x1) / 2, p.y + 22, w * 0.55, 26, 0.16 + 0.06 * Math.sin(tm * 1.1 + p.id)); g.globalCompositeOperation = 'source-over';
    g.drawImage(sp, p.x0 - 15, p.y - 8, w + 30, 70);
  }
}

// ═══════════ su: gövde, dip, batık ışıklar, yansımalar, halkalar ═══════════
const dn2Rings = [];
function dn2WakeRing(o) {
  if (!DN2.ok) return; const G = dn2OnLake(o.x != null ? o.x : -999, 10); if (G) { o.dn2WakeLake = G; if (dn2Rings.length < 30) dn2Rings.push({ x: o.x, y: G.su, t: now, big: true }); }
}
OLAY.on('inis', d => { dn2Init(); const x = d && d.x != null ? d.x : P.x, y = d && d.y != null ? d.y : P.y; for (const G of DN2.lakes) if (x > G.x0 - 4 && x < G.x1 + 4 && Math.abs(y - G.su) < 26) { if (dn2Rings.length < 30) dn2Rings.push({ x, y: G.su, t: now, big: (d && d.siddet || 0) > 500 }); break; } });
// her gölün kendi karakteri: I = mavi-turkuaz "su çimeni" gölü, II = pembe-lila "nilüfer bahçesi", III = altın-turkuaz "ışık kabarcıkları"
const DN2_LK = [
  { body: ['#2a3f90', '#16286c', '#070b34'], tint: '', mist: ['#7a8cff', '#a890ff'], shaft: '#8fb0ff', fl: ['#7ff0d0', '#8ff0ff', '#b9a0ff'], kinds: ['g', 'g', 'g', 'b'], mote: ['#9ff6ff', '#c9b8ff'] },
  { body: ['#3a3392', '#262066', '#0b0a34'], tint: 'rgba(190,90,210,0.13)', mist: ['#c890ff', '#ff9ad8'], shaft: '#d6a8ff', fl: ['#ff9ad8', '#d6a8ff', '#ffc4ef'], kinds: ['l', 'l', 'g', 'b'], mote: ['#ffc4ef', '#d6a8ff'] },
  { body: ['#1f4a8e', '#13386a', '#05132e'], tint: 'rgba(90,190,200,0.07)', mist: ['#8fe8e0', '#ffd890'], shaft: '#ffe2a8', fl: ['#ffd890', '#7fe8d8', '#ffe6a8'], kinds: ['k', 'k', 'g', 'b'], mote: ['#ffe6a8', '#9ff6ff'] },
];
const dn2LK = G => DN2_LK[G.i % DN2_LK.length];
const dn2FS = {};
function dn2FloraSpr(k, v, col) {   // su altı bitkisi (taban 0,0'da; 60x130 birim, 2x çözünürlük)
  const key = k + v + col; if (dn2FS[key]) return dn2FS[key];
  const q = 2, w = 60, h = 130, c = dn2FS[key] = dn2Cv(w * q, h * q), x = c.getContext('2d'), R = rng(v * 17 + k.charCodeAt(0) * 3 + col.length); x.setTransform(q, 0, 0, q, w * q / 2, h * q - 2); x.lineCap = 'round';
  const dark = dn2Mix(col, '#0a1040', 0.72), mid = dn2Mix(col, '#1a2a70', 0.35);
  if (k === 'g') {   // su çimeni: ince uzun şeritler, uçları ışıklı
    const n = 4 + v; for (let i = 0; i < n; i++) { const an = (i - (n - 1) / 2) * 0.16 + (R() - 0.5) * 0.1, L = 34 + R() * 44, ex = Math.sin(an) * L + (R() - 0.5) * 8, ey = -Math.cos(an) * L;
      const gr = x.createLinearGradient(0, 0, ex, ey); gr.addColorStop(0, dark); gr.addColorStop(0.7, mid); gr.addColorStop(1, dn2Mix(col, '#ffffff', 0.3));
      x.strokeStyle = gr; x.lineWidth = 2.4 - i % 2 * 0.6; x.beginPath(); x.moveTo((i - n / 2) * 1.6, 0); x.bezierCurveTo(ex * 0.1 - 4, ey * 0.35, ex * 0.6 + 5, ey * 0.7, ex, ey); x.stroke();
      if (i % 2 === 0) { x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.8; x.drawImage(glow(col), ex - 5, ey - 5, 10, 10); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; } }
  } else if (k === 'l') {   // su nilüferi tomurcuğu: sap + yarı açık, içten ışıyan çanak
    const H2 = 40 + R() * 36, lean = (R() - 0.5) * 10;
    x.strokeStyle = dark; x.lineWidth = 2.2; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(lean * 0.2 - 4, -H2 * 0.5, lean, -H2); x.stroke();
    x.fillStyle = mid; for (const sd of [-1, 1]) { x.beginPath(); x.ellipse(sd * 7, -H2 * 0.3, 8, 3, sd * -0.4, 0, 6.283); x.fill(); }
    x.translate(lean, -H2); x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.9; x.drawImage(glow(col), -18, -24, 36, 36); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; x.save(); x.rotate(a); const gr = x.createLinearGradient(0, 0, 0, -16); gr.addColorStop(0, dn2Mix(col, '#3a1a70', 0.4)); gr.addColorStop(1, dn2Mix(col, '#ffffff', 0.45)); x.fillStyle = gr; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-6, -8, 0, -15 - (i === 2 ? 3 : 0)); x.quadraticCurveTo(6, -8, 0, 0); x.fill(); x.restore(); }
    x.fillStyle = '#fff3d0'; x.beginPath(); x.arc(0, -4, 1.8, 0, 6.283); x.fill();
  } else if (k === 'k') {   // altın yosun şeridi: dalgalı kurdele + ışık boncukları
    const L = 50 + R() * 50, n = 2 + (v % 2);
    for (let j = 0; j < n; j++) { const p = new Path2D(), ph = R() * 6, ww = 3 + R() * 1.6, dx = (j - (n - 1) / 2) * 6; p.moveTo(dx - ww / 2, 0);
      for (let s = 1; s <= 12; s++) { const u = s / 12; p.lineTo(dx + Math.sin(u * 7 + ph) * 6 * u - ww / 2 * (1 - u), -L * u * (0.85 + j * 0.1)); }
      for (let s = 12; s >= 0; s--) { const u = s / 12; p.lineTo(dx + Math.sin(u * 7 + ph) * 6 * u + ww / 2 * (1 - u) + 0.6, -L * u * (0.85 + j * 0.1)); }
      p.closePath(); const gr = x.createLinearGradient(0, 0, 0, -L); gr.addColorStop(0, dark); gr.addColorStop(1, dn2Mix(col, '#ffffff', 0.15)); x.fillStyle = gr; x.fill(p);
      x.globalCompositeOperation = 'lighter'; for (let s = 3; s < 12; s += 3) { const u = s / 12; x.globalAlpha = 0.7; x.drawImage(glow(col), dx + Math.sin(u * 7 + ph) * 6 * u - 3.5, -L * u * (0.85 + j * 0.1) - 3.5, 7, 7); } x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; }
  } else {   // yuvarlak ışık soğanı (küçük, tombul)
    const n = 1 + v % 3; for (let i = 0; i < n; i++) { const px = (i - (n - 1) / 2) * 9, hh = 8 + R() * 16, r = 4 + R() * 3;
      x.strokeStyle = dark; x.lineWidth = 1.6; x.beginPath(); x.moveTo(px, 0); x.quadraticCurveTo(px + 3, -hh * 0.5, px, -hh); x.stroke();
      x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.8; x.drawImage(glow(col), px - r * 3, -hh - r * 3, r * 6, r * 6); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      const gr = x.createRadialGradient(px - r * 0.3, -hh - r * 0.4, 0.5, px, -hh, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, dn2Mix(col, '#ffffff', 0.3)); gr.addColorStop(1, dn2Mix(col, '#2a1a70', 0.3)); x.fillStyle = gr; x.beginPath(); x.arc(px, -hh, r, 0, 6.283); x.fill(); }
  }
  return c;
}
function dn2LakeBuild(G) {
  if (G.bed) return; const R = rng(55 + G.i * 31), maxD = clamp(DN2.LH - G.su - 30, 40, 128), LK = dn2LK(G); G.bed = []; G.sunk = []; G.flora = [];
  const ph = R() * 6;
  for (let x = G.x0 - 20; x <= G.x1 + 20; x += 10) { const e = Math.min(x - G.x0, G.x1 - x), k = smooth(clamp(e / 240, 0, 1)); G.bed.push([x, G.su + 6 + (maxD - 6) * k + (Math.sin(x * 0.03 + ph) * 5 + Math.sin(x * 0.081) * 2.5) * k]); }
  const bedY = x => G.bed[clamp(Math.round((x - G.x0 + 20) / 10), 0, G.bed.length - 1)][1];
  for (let x = G.x0 + 30; x < G.x1 - 20; x += 22 + R() * 34) { const by = bedY(x);
    if (R() < 0.5) G.sunk.push({ k: 'w', x, y: by, h: 8 + R() * 18, ph: R() * 6, c: LK.fl[Math.floor(R() * LK.fl.length)] });
    else G.sunk.push({ k: 's', x, y: by - 1, r: 2 + R() * 3, ph: R() * 6, c: LK.mote[Math.floor(R() * 2)] }); }
  for (let i = 0, n = clamp(Math.round((G.x1 - G.x0) / 220), 1, 5); i < n; i++) { const x = lerp(G.x0 + 80, G.x1 - 80, R()), by = bedY(x); G.sunk.push({ k: 'c', x, y: by + 2, s: 0.9 + R() * 0.7, ph: R() * 6, c: i % 2 ? LK.fl[1] : LK.fl[0] }); }
  for (let x = G.x0 + 20 + R() * 30; x < G.x1 - 20; x += 30 + R() * 70) {   // kümeler halinde bitkiler (aralarda boş kumluk)
    if (R() < 0.22) { x += 60 + R() * 90; continue; }
    const k = LK.kinds[Math.floor(R() * LK.kinds.length)], by = bedY(x); if (by < G.su + 26) continue;
    G.flora.push({ k, v: Math.floor(R() * 3), x, y: by + 3, s: (0.75 + R() * 0.5) * clamp((by - G.su) / 110, 0.45, 1), ph: R() * 6, c: LK.fl[Math.floor(R() * LK.fl.length)], fl: R() < 0.5 ? -1 : 1 });
  }
}
function dn2Water(tm) {   // dünya dönüşümünde, zeminden önce: su gövdesi + dip + batık ışıklar
  const vx0 = cam.x - 40, vx1 = cam.x + VW + 40, bot = cam.y + H / S + 20;
  for (const G of DN2.lakes) {
    if (!(G.x1 > vx0 && G.x0 < vx1)) continue; dn2LakeBuild(G); const LK = dn2LK(G);
    const gr = G.gr || (G.gr = (() => { const q = g.createLinearGradient(0, G.su, 0, G.su + 150); q.addColorStop(0, LK.body[0]); q.addColorStop(0.3, LK.body[1]); q.addColorStop(1, LK.body[2]); return q; })());
    const xa = Math.max(vx0, G.x0 - 16), xb = Math.min(vx1, G.x1 + 16);
    g.fillStyle = gr; g.fillRect(xa, G.su, xb - xa, bot - G.su);
    // gökyüzü ve takımyıldızı yansıması (ekran uzayında)
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    const px0 = (xa - cam.x) * S, px1 = (xb - cam.x) * S, sy = Math.round((G.su - cam.y) * S);
    if (sy < H) { const hy = DN2.hy; dn2SkyRefl(px0, px1, sy, hy, 0.74, tm, true); dn2AurRefl(px0, px1, sy, hy, tm); dn2MoonRoad(px0, px1, sy, tm);
      g.save(); g.beginPath(); g.rect(px0, sy, px1 - px0, H - sy); g.clip(); dn2Constellation(tm, hy, true, sy); g.restore();
      if (LK.tint) { g.fillStyle = LK.tint; g.fillRect(px0, sy, px1 - px0, H - sy); } }
    g.restore();
    // dip
    g.beginPath(); g.moveTo(G.bed[0][0], DN2.LH + 400); for (const b of G.bed) g.lineTo(b[0], b[1]); g.lineTo(G.bed[G.bed.length - 1][0], DN2.LH + 400); g.closePath();
    const bg = G.bg || (G.bg = (() => { const q = g.createLinearGradient(0, G.su, 0, G.su + 260); q.addColorStop(0, dn2Hx(LK.body[1], 0.7)); q.addColorStop(0.5, dn2Hx(LK.body[2], 0.92)); q.addColorStop(1, '#04051a'); return q; })()); g.fillStyle = bg; g.fill();
    g.strokeStyle = dn2Hx(LK.fl[0], 0.12); g.lineWidth = 1.4; g.beginPath(); G.bed.forEach((b, i) => i ? g.lineTo(b[0], b[1]) : g.moveTo(b[0], b[1])); g.stroke();
    // su altı bitkileri (sallanır; her gölün kendi türleri ve renkleri)
    for (const f of G.flora) {
      if (f.x < vx0 - 40 || f.x > vx1 + 40) continue; const sp = dn2FloraSpr(f.k, f.v, f.c), sw = Math.sin(tm * (f.k === 'k' ? 0.7 : 0.9) + f.ph) * (f.k === 'b' ? 0.04 : 0.11);
      g.save(); g.translate(f.x, f.y); g.rotate(sw); g.scale(f.s * f.fl, f.s); g.globalAlpha = 0.9; g.drawImage(sp, -30, -130 + 1, 60, 130); g.restore();
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    for (const f of G.sunk) {
      if (f.x < vx0 || f.x > vx1) continue; const pul = (0.6 + 0.4 * Math.sin(tm * 1.2 + f.ph)) * 0.62 * dn2Foc((f.x - cam.x) * S, (f.y - f.h * 0.5 - cam.y) * S);
      if (f.k === 'w') { const sw = Math.sin(tm * 0.9 + f.ph) * 5; g.strokeStyle = dn2Hx(f.c, 0.28); g.lineWidth = 1.2; g.beginPath(); g.moveTo(f.x, f.y); g.quadraticCurveTo(f.x + sw * 1.4, f.y - f.h * 0.5, f.x + sw, f.y - f.h); g.stroke(); dn2Eg(f.c, f.x + sw, f.y - f.h, 9, 9, 0.5 * pul); dn2Eg('#ffffff', f.x + sw, f.y - f.h, 2.4, 2.4, 0.6 * pul); }
      else if (f.k === 'c') { dn2Eg(f.c, f.x, f.y - 2, 40 * f.s, 12 * f.s, 0.32 * pul); dn2Eg(f.c, f.x, f.y - 10 * f.s, 24 * f.s, 24 * f.s, 0.4 * pul); g.globalCompositeOperation = 'source-over'; g.save(); g.translate(f.x, f.y); g.scale(f.s, f.s); dn2Shard(g, f.c); g.restore(); g.globalCompositeOperation = 'lighter'; }
      else { dn2Eg(f.c, f.x, f.y, f.r * 4, f.r * 1.6, 0.45 * pul); dn2Eg('#ffffff', f.x, f.y - 1, f.r, f.r, 0.5 * pul); }
    }
    // suyun içinden inen ışık huzmeleri (gölün renginde) + suda yavaşça süzülen ışık zerreleri
    for (let i = 0; i < 6; i++) { const xx = G.x0 + (i + 0.5) / 6 * (G.x1 - G.x0) + Math.sin(tm * 0.2 + i) * 30; if (xx < vx0 - 60 || xx > vx1 + 60) continue; dn2Eg(LK.shaft, xx, G.su + 60, 20 + (i % 2) * 14, 80, 0.08 + 0.04 * Math.sin(tm * 0.5 + i * 1.7)); }
    const Lw = G.x1 - G.x0;
    for (let i = 0; i < 14; i++) { const x = G.x0 + ((i * 263.7 + tm * (5 + i % 4 * 2) * (i % 2 ? 1 : -1)) % Lw + Lw) % Lw; if (x < vx0 || x > vx1) continue;
      const y = G.su + 16 + ((i * 0.377) % 1) * 92 + Math.sin(tm * 0.6 + i * 1.3) * 7, tw = 0.5 + 0.5 * Math.sin(tm * 1.3 + i * 2.1);
      dn2Eg(LK.mote[i % 2], x, y, 5 + tw * 3, 5 + tw * 3, (0.25 + 0.35 * tw) * dn2Foc((x - cam.x) * S, (y - cam.y) * S)); }
    if (G.i % 3 === 2) {   // III: dipten yükselen ışık kabarcıkları
      for (let i = 0; i < 9; i++) { const per = 5 + (i % 3) * 1.3, e = ((tm + i * 1.71) % per) / per, x0 = G.x0 + 60 + ((i * 0.618) % 1) * (Lw - 120); if (x0 < vx0 || x0 > vx1) continue;
        const x = x0 + Math.sin(tm * 2 + i) * 4, y = lerp(G.su + 110, G.su + 3, e), r = 2 + (i % 3);
        dn2Eg('#ffe6a8', x, y, r * 3, r * 3, 0.35 * Math.sin(e * Math.PI)); g.strokeStyle = '#fff6d8'; g.globalAlpha = 0.45 * Math.sin(e * Math.PI); g.lineWidth = 0.8; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.stroke(); g.globalAlpha = 1;
        if (e > 0.96 && dn2Rings.length < 28 && !G['bb' + i]) { G['bb' + i] = 1; dn2Rings.push({ x, y: G.su, t: now, big: false }); } else if (e < 0.5) G['bb' + i] = 0; }
    }
    g.globalCompositeOperation = 'source-over';
    if (G.i % 3 === 1) {   // II: su yüzünde yavaşça sürüklenen nilüfer yaprakları / taç yaprakları
      for (let i = 0; i < 16; i++) { const x = G.x0 + ((i * 197.3 + tm * (3 + i % 3)) % Lw); if (x < vx0 || x > vx1) continue; const y = G.su + 1.5 + Math.sin(tm * 1.1 + i) * 0.8, rot = tm * 0.08 * (i % 2 ? 1 : -1) + i, s = 2.2 + (i % 4) * 0.6;
        g.save(); g.translate(x, y); g.scale(1, 0.38); g.rotate(rot); g.fillStyle = i % 3 ? '#ffb8e4' : '#e0b8ff'; g.globalAlpha = 0.75; g.beginPath(); g.ellipse(0, 0, s * 1.6, s, 0, 0, 6.283); g.fill(); g.fillStyle = '#fff0fa'; g.globalAlpha = 0.5; g.beginPath(); g.ellipse(-s * 0.4, -s * 0.2, s * 0.6, s * 0.35, 0, 0, 6.283); g.fill(); g.restore(); }
      g.globalAlpha = 1;
    }
  }
  g.globalCompositeOperation = 'lighter';
  for (const o of NESNELER) {   // yıldız taşları / adalar: altlarında yumuşak renkli ışıma halkası
    if ((o.tip !== 'yildizTasi' && o.tip !== 'yildizAda') || o.x < vx0 - 200 || o.x > vx1 + 200) continue; const G = dn2OnLake(o.x, 0); if (!G) continue;
    const col = ['#9fb4ff', '#8fe8e0'][Math.abs(Math.round(o.x / 160)) % 2], w = o.tip === 'yildizAda' ? (o.w || 250) : 100, pul = 0.7 + 0.3 * Math.sin(tm * 1.1 + o.x * 0.01);
    dn2Eg(col, o.x, G.su + 6, w * 0.8, 14, 0.13 * pul * (0.6 + 0.4 * DN2.fill));
    g.strokeStyle = col; g.globalAlpha = 0.1 * pul; g.lineWidth = 1.2; g.beginPath(); g.ellipse(o.x, G.su + 3, w * 0.55, 6, 0, 0, 6.283); g.stroke(); g.globalAlpha = 1; }
  for (const G of DN2.lakes) {   // sisli dalga bantları (yavaş kayan bulut gibi) ve ara sıra damla halkası
    if (!(G.x1 > vx0 && G.x0 < vx1)) continue; const LK = dn2LK(G);
    for (let i = 0; i < 5; i++) { const span = G.x1 - G.x0 + 600, x = G.x0 - 300 + ((i * 397 + tm * (5 + i * 1.7)) % span); if (x < vx0 - 300 || x > vx1 + 300) continue;
      dn2Eg(LK.mist[i % 2], x, G.su + 24 + i * 14, 230 + i * 30, 12 + (i % 3) * 5, 0.06 + 0.02 * Math.sin(tm * 0.3 + i)); }
    if (now - (G.dropT || 0) > 3.2 + (G.i % 3)) { G.dropT = now; if (dn2Rings.length < 28) { const dx = lerp(Math.max(G.x0 + 40, vx0), Math.min(G.x1 - 40, vx1), Math.random()); if (dx > vx0 && dx < vx1) dn2Rings.push({ x: dx, y: G.su, t: now, big: false }); } } }
  for (const q of DN2.pits) if (q[1] > vx0 && q[0] < vx1) dn2Eg('#5a6ad8', (q[0] + q[1]) / 2, DN2.LH - 10, (q[1] - q[0]) * 0.8, 70, 0.3);
  g.globalCompositeOperation = 'source-over';
}
// uyanmamış yıldızların suyun altında sönük ışığı; uyanınca parlar, yükselir
function dn2SunkStars(tm) {
  const L = dn2StarList(); if (L[0] && L[0].dn2Fake) return; g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < L.length; i++) {
    const o = L[i]; if (o.x === undefined || o.x < cam.x - 120 || o.x > cam.x + VW + 120) continue;
    const G = dn2OnLake(o.x, 0); if (!G || o.y < G.su - 10) continue;
    const wk = o.dn2Wake !== undefined ? now - o.dn2Wake : -1, pul = 0.65 + 0.35 * Math.sin(tm * 1.1 + i * 2);
    if (wk < 0) { dn2Eg('#9aa8ff', o.x, o.y - 6, 34, 34, 0.2 * pul); dn2Eg('#e0e8ff', o.x, o.y - 6, 8, 8, 0.3 * pul); }
    else if (wk < 2.8) { const q = wk / 2.8, a = Math.sin(Math.min(1, q * 1.4) * Math.PI * 0.5) * (1 - q);
      dn2Eg('#bff4ff', o.x, o.y - 6 - q * 60, 40 + q * 90, 40 + q * 90, 0.5 * a); dn2Eg('#ffffff', o.x, G.su + (o.y - G.su) * (1 - q), 10 + 20 * q, 160 * Math.min(1, q * 2), 0.25 * a); }
  }
  g.globalCompositeOperation = 'source-over';
}
const dn2RefC = dn2Cv(2, 2);
function dn2Petals(tm) {   // karakterlerden sonra: su yüzeyi (Feza'nın yansıması, halkalar, ışıltı)
  if (!dn2Ok()) return; if (!isFinite(tm)) tm = 0;
  dn2Init();
  // (Feza üstüne ek ışık katmanı yok: karakter hâlesini FEZA ajanı yönetir)
  for (const G of DN2.lakes) {
    if (!(G.x1 > cam.x - 80 && G.x0 < cam.x + VW + 80)) continue;
    const sy = Math.round((G.su - cam.y) * S); if (sy >= H || sy <= 8) continue;
    const xa = Math.max(cam.x, G.x0 - 16), xb = Math.min(cam.x + VW, G.x1 + 16); if (xb - xa < 2) continue;
    const px0 = Math.floor((xa - cam.x) * S), px1 = Math.ceil((xb - cam.x) * S), pw = px1 - px0, hh = Math.min(H - sy, sy, Math.round(150 * S)), k = 0.5, cw = Math.max(1, Math.ceil(pw * k)), chh = Math.max(1, Math.ceil(hh * k));
    if (dn2RefC.width < cw || dn2RefC.height < chh) { dn2RefC.width = Math.max(dn2RefC.width, cw); dn2RefC.height = Math.max(dn2RefC.height, chh); }
    const rx = dn2RefC.getContext('2d'); rx.setTransform(1, 0, 0, 1, 0, 0); rx.globalCompositeOperation = 'copy'; rx.drawImage(cv, px0, sy - hh, pw, hh, 0, 0, cw, chh);
    g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.beginPath(); g.rect(px0, sy, pw, H - sy); g.clip(); g.globalCompositeOperation = 'source-over';
    g.setTransform(1, 0, 0, -1, 0, 2 * sy);
    const N = 16;
    for (let i = 0; i < N; i++) { const d0 = hh * Math.pow(i / N, 1.25), d1 = hh * Math.pow((i + 1) / N, 1.25), u = (i + 0.5) / N, off = (Math.sin(tm * 1.7 + i * 1.3) * (0.4 + u * 2.6) + Math.sin(tm * 0.9 + i * 0.45) * 0.8) * S;
      g.globalAlpha = 0.5 * clamp(1 - (d0 + d1) / 2 / S / 100, 0, 1); if (g.globalAlpha < 0.01) continue; g.drawImage(dn2RefC, 0, (hh - d1) * k, cw, Math.max(0.5, (d1 - d0) * k), px0 + off, sy - d1, pw, d1 - d0 + 1); }
    g.globalAlpha = 1; g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = '#d0e4ff'; g.globalAlpha = 0.55; g.lineWidth = Math.max(1, 1 * S); g.beginPath(); g.moveTo(px0, sy + 0.5); g.lineTo(px1, sy + 0.5); g.stroke();
    g.globalAlpha = 0.2; g.lineWidth = Math.max(1, 0.8 * S); g.beginPath();
    for (let i = 0; i < 30; i++) { const u = ((i * 0.618) % 1), yy = sy + 3 * S + u * u * (H - sy) * 0.9, xx = cam.x + ((i * 97 + tm * (10 + i % 4 * 4) * (i % 2 ? 1 : -1)) % (VW + 100) + VW + 100) % (VW + 100) - 50; if (xx < xa || xx > xb) continue; const xs = (xx - cam.x) * S; g.moveTo(xs, yy); g.lineTo(xs + (12 + (i % 4) * 9) * S, yy); }
    g.stroke(); g.globalAlpha = 1;
    // yüzey ışıltıları (yıldız ışığı kırpışması)
    { const dep = H - sy;   // geniş su: yavaş dalga çizgileri (kayan hafif ışık dalgaları)
      g.strokeStyle = '#a8bcff'; g.lineWidth = Math.max(1, 1.2 * S); for (let i = 0; i < 7; i++) { const u = (i + 0.5) / 7, yy = sy + u * u * dep * 0.95 + 6 * S, amp = (1.5 + u * 5) * S; g.globalAlpha = (0.035 + 0.03 * Math.sin(tm * 0.5 + i)) * (1 - u * 0.4) * clamp(dn2Foc(DN2F.x, yy) * 1.0 + 0.0, 0.3, 1); g.beginPath(); for (let x = px0; x <= px1; x += 28 * S) { const y2 = yy + Math.sin(x * 0.011 / S * 2 + tm * (0.5 + i * 0.07) + i * 2) * amp; x === px0 ? g.moveTo(x, y2) : g.lineTo(x, y2); } g.stroke(); } g.globalAlpha = 1; }
    for (let i = 0; i < 26; i++) { const u = (i * 0.37 + 0.11) % 1, xx = px0 + ((u * 7.3 + i * 0.173) % 1) * pw, yy = sy + (3 + ((i * 0.618) % 1) * Math.min(260, (H - sy) / S * 0.92)) * S, tw = Math.max(0, Math.sin(tm * (1.5 + i % 5 * 0.4) + i * 2.3)); dn2Eg(i % 3 ? '#dff0ff' : '#ffe8c0', xx, yy, 6 * S, 1.2 * S, tw * tw * (0.2 + 0.32 * DN2.fill) * dn2Foc(xx, yy)); }
    g.restore();
    // buğu
    for (let i = 0; i < 6; i++) { const span = G.x1 - G.x0 + 300, x = G.x0 - 150 + ((i * 211 + tm * (6 + i % 3 * 3)) % span); dn2Eg('#8aa0ff', (x - cam.x) * S, (G.su - 5 - (i % 3) * 6 - cam.y) * S, (150 + (i % 4) * 40) * S, (17 + (i % 2) * 8) * S, 0.1 + 0.04 * Math.sin(tm * 0.4 + i)); }
    // halkalar
    g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); g.save(); g.beginPath(); g.rect(G.x0 - 20, G.su - 120, G.x1 - G.x0 + 40, 240); g.clip(); g.globalCompositeOperation = 'lighter';
    for (let i = dn2Rings.length - 1; i >= 0; i--) { const r = dn2Rings[i]; if (r.y !== G.su) continue; const e = now - r.t, life = r.big ? 2.4 : 1.4; if (e > life) { dn2Rings.splice(i, 1); continue; } const q = e / life;
      for (let j = 0; j < (r.big ? 3 : 2); j++) { const kk = q - j * 0.13; if (kk <= 0) continue; const rr = (r.big ? 24 : 16) + kk * (r.big ? 160 : 70); g.strokeStyle = '#c8f0ff'; g.globalAlpha = 0.55 * (1 - kk) * (j ? 0.6 : 1); g.lineWidth = 1.6; g.beginPath(); g.ellipse(r.x, G.su + 2, rr, rr * 0.16, 0, 0, 6.283); g.stroke(); } }
    g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// ═══════════ dn2World: su → zemin → süsler (karakterlerin arkası) ═══════════
function dn2World(tm) {
  if (!dn2Ok()) return; if (!isFinite(tm)) tm = 0;
  dn2Init(); g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); g.lineCap = 'round'; g.lineJoin = 'round';
  dn2Water(tm);
  g.setTransform(1, 0, 0, 1, 0, 0); dn2DrawGround(); g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
  dn2DrawPlats(tm); dn2DrawDeco(tm);
  if (DN2F.on) {   // Feza'nın ardında çok yumuşak koyu "sahne" lekesi: parlak çevrede karakter ayrışsın
    g.setTransform(1, 0, 0, 1, 0, 0); const fx = DN2F.x, fy = DN2F.y + 10 * S, r = 135 * S, k = 0.5 + 0.1 * DN2.fill;
    const rg = g.createRadialGradient(fx, fy, r * 0.15, fx, fy, r); rg.addColorStop(0, `rgba(6,8,34,${k})`); rg.addColorStop(0.55, `rgba(6,8,34,${k * 0.6})`); rg.addColorStop(1, 'rgba(6,8,34,0)');
    g.fillStyle = rg; g.fillRect(fx - r, fy - r, r * 2, r * 2); g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// ═══════════ ışık tozu kümeleri ═══════════
const DN2_MOT = (() => { const R = rng(19), a = []; for (let i = 0; i < 90; i++) a.push({ x: R() * 4000, y: R() * 700, z: 0.3 + R() * 1.3, ph: R() * 6.28, sp: 0.4 + R(), c: R(), cl: -1 });
  for (let k = 0; k < 14; k++) { const cx = R() * 4000, cy = R() * 600, z = 0.5 + R() * 1.1, c = R(); for (let j = 0; j < 7; j++) a.push({ x: cx, y: cy, ox: (R() - 0.5) * 60, oy: (R() - 0.5) * 40, orb: 6 + R() * 16, z, ph: R() * 6.28, sp: 0.25 + R() * 0.2, c: c, cl: k, tw: R() }); }
  for (let i = 0; i < 8; i++) a.push({ x: R() * 4000, y: R() * 600, z: 1.5 + R() * 0.4, ph: R() * 6.28, sp: 0.3 + R() * 0.4, c: R(), cl: -1, bk: true }); return a; })();
const DN2_MC = ['#9fe8ff', '#c9b8ff', '#ffe8b0', '#9fe8ff', '#c9b8ff'];
function dn2Motes(tm, zMin, zMax) {
  if (!dn2Ok()) return; if (!isFinite(tm)) tm = 0;
  g.setTransform(S, 0, 0, S, 0, 0); g.globalCompositeOperation = 'lighter';
  const wrap = VW * 1.4, hv = H / S + 140, vh = H / S, am = 0.6 + 0.4 * DN2.fill;
  for (let i = 0; i < DN2_MOT.length; i++) {
    const m = DN2_MOT[i]; if (m.z < zMin || m.z >= zMax) continue; if (!m.bk && m.cl < 0 && i % 3 === 0) continue;   // parıltı bütçesi: tek tozların 1/3'ü çizilmez
    const bx = m.x + (m.cl >= 0 ? Math.sin(tm * 0.11 * m.sp * 2 + m.cl) * 120 + Math.cos(tm * m.sp + m.ph) * m.orb + m.ox : Math.sin(tm * 0.3 * m.sp + m.ph) * 30);
    const x = ((bx - cam.x * m.z) % wrap + wrap) % wrap - VW * 0.2; if (x < -50 || x > VW + 50) continue;
    const by = m.y + (m.cl >= 0 ? Math.sin(tm * 0.17 * m.sp * 2 + m.cl * 2) * 50 + Math.sin(tm * m.sp * 0.8 + m.ph) * m.orb * 0.6 + m.oy : 0) - tm * (m.cl >= 0 ? 3 : 6) * m.sp;
    const y = ((by - cam.y * m.z) % hv + hv) % hv - 60; if (y < -50 || y > vh + 50) continue;
    const tw = 0.5 + 0.5 * Math.sin(tm * 2 * m.sp + m.ph), col = DN2_MC[Math.floor(m.c * DN2_MC.length) % DN2_MC.length];
    const fc = dn2Foc(x * S, y * S), fq = zMin >= 0.75 ? fc * fc : fc;   // Feza'nın önünden geçen tozlar iyice soluk
    if (m.bk) { const r = 16 + m.z * 12; dn2Eg(col, x, y, r, r, (0.035 + tw * 0.03) * am * fc); continue; }
    const r = (2 + m.z * 3.6) * (0.6 + tw * 0.6); dn2Eg(col, x, y, r, r, (0.14 + tw * 0.32) * am * fq);
    if (m.cl >= 0 && tw > 0.85 && fq > 0.5) { const sp = dn2StarSpr('#ffffff'), rr = r * 2.2; g.globalAlpha = (tw - 0.85) * 3 * 0.35 * am * fq; g.drawImage(sp, x - rr, y - rr, rr * 2, rr * 2); g.globalAlpha = 1; }
  }
  g.globalCompositeOperation = 'source-over';
}

// ═══════════ ön plan: sarkık ışık çiçekleri, saz, bulanık yapraklar ═══════════
const DN2_FG = { sc: 0, vine: [], reed: [], leaf: [] };
function dn2FgBake() {
  const sc = clamp(H / VH, 0.8, 2.4); if (DN2_FG.sc === sc) return; DN2_FG.sc = sc; const body = '#030418', rim = dn2Hx('#7a86ff', 0.5);
  const mk = (w, h, ox, oy, draw, q) => { const c = dn2Cv(w * sc * q, h * sc * q), x = c.getContext('2d'); x.setTransform(sc * q, 0, 0, sc * q, ox * sc * q, oy * sc * q); x.lineCap = 'round'; const info = draw(x); return { c, w, h, ox, oy, info }; };
  DN2_FG.vine = [0, 1, 2].map(i => mk(260, 300, 130, 20, x => {
    const R = rng(i * 91 + 4), fl = [], L = 150 + R() * 100;
    x.strokeStyle = body; x.lineWidth = 3.4; x.beginPath(); x.moveTo(0, -20); x.bezierCurveTo(-30 + R() * 20, L * 0.3, 40 - R() * 30, L * 0.6, (R() - 0.5) * 50, L); x.stroke();
    for (let k = 0; k < 7; k++) { const u = 0.1 + k * 0.13, px = Math.sin(u * 5 + i) * 16 * u, py = L * u; x.fillStyle = body; x.save(); x.translate(px, py); x.rotate((k % 2 ? 1 : -1) * (0.9 + R() * 0.5)); const ll = 20 + R() * 10; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(ll * 0.5, -7, ll, 0); x.quadraticCurveTo(ll * 0.5, 7, 0, 0); x.fill(); x.strokeStyle = rim; x.lineWidth = 0.9; x.stroke(); x.restore(); }
    for (let k = 0; k < 4; k++) { const u = 0.35 + k * 0.17, px = Math.sin(u * 5 + i) * 16 * u + (k % 2 ? 14 : -14), py = L * u + 12; x.strokeStyle = body; x.lineWidth = 1.6; x.beginPath(); x.moveTo(px - (k % 2 ? 14 : -14), py - 12); x.quadraticCurveTo(px, py - 14, px, py); x.stroke();
      const col = dn2Sat(['#b9a8ff', '#7fe8d8', '#ffd890', '#b9a8ff'][(i + k) % 4], 0.8), bw = 8 + R() * 3; x.save(); x.translate(px, py);
      const gr = x.createLinearGradient(0, 0, 0, 20); gr.addColorStop(0, dn2Hx(col, 0.95)); gr.addColorStop(1, dn2Hx(dn2Mix(col, '#2a1a70', 0.55), 0.95)); x.fillStyle = gr; x.beginPath(); x.moveTo(-bw * 0.3, 0); x.quadraticCurveTo(-bw, 10, -bw * 1.1, 19); x.quadraticCurveTo(0, 14, bw * 1.1, 19); x.quadraticCurveTo(bw, 10, bw * 0.3, 0); x.closePath(); x.fill();
      x.fillStyle = '#fff6d8'; x.beginPath(); x.arc(0, 19, 1.8, 0, 6.283); x.fill(); x.restore(); fl.push([px, py + 14, col]); }
    return fl; }, 1));
  // yeni türler: 3 = yıldız çıngırağı (iplerde sarkan minik ışıklı yıldızlar), 4 = ince söğüt saçakları (uçları ışıklı)
  DN2_FG.vine.push(mk(260, 300, 130, 20, x => {
    const R = rng(611), fl = []; x.strokeStyle = body; x.lineWidth = 4; x.beginPath(); x.moveTo(-110, -20); x.quadraticCurveTo(0, 40, 110, -10); x.stroke();
    for (let k = 0; k < 7; k++) { const u = (k + 0.5) / 7, px = -100 + u * 200, py = (1 - Math.pow(2 * u - 1, 2)) * 26 - 12 + (R() - 0.5) * 4, L = 40 + R() * 110;
      x.strokeStyle = dn2Hx('#1a1f5a', 0.9); x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (R() - 0.5) * 4, py + L); x.stroke();
      const col = ['#ffe6a8', '#cfe0ff', '#ffd0f0', '#c8fff0'][k % 4], sx = px, sy = py + L + 6, r = 6 + R() * 3; x.save(); x.translate(sx, sy); x.rotate((R() - 0.5) * 0.5);
      x.beginPath(); for (let j = 0; j < 10; j++) { const an = -Math.PI / 2 + j * Math.PI / 5, rr = j % 2 ? r * 0.46 : r; j ? x.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : x.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); } x.closePath();
      const gr = x.createRadialGradient(0, -r * 0.2, 0.5, 0, 0, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, col); gr.addColorStop(1, dn2Mix(col, '#5a4aa0', 0.4)); x.fillStyle = gr; x.fill(); x.restore(); fl.push([sx, sy, col]); }
    for (let k = 0; k < 9; k++) { const u = R(), px = -100 + u * 200, py = (1 - Math.pow(2 * u - 1, 2)) * 26 - 12; x.fillStyle = body; x.save(); x.translate(px, py); x.rotate((R() - 0.5) * 2); x.beginPath(); x.ellipse(8, 0, 9, 3.4, 0, 0, 6.283); x.fill(); x.strokeStyle = rim; x.lineWidth = 0.8; x.stroke(); x.restore(); }
    return fl; }, 1));
  DN2_FG.vine.push(mk(260, 300, 130, 20, x => {
    const R = rng(733), fl = []; x.strokeStyle = body; x.lineWidth = 5; x.beginPath(); x.moveTo(-130, -10); x.quadraticCurveTo(-20, 8, 120, -20); x.stroke();
    for (let k = 0; k < 16; k++) { const px = -110 + k * 14 + (R() - 0.5) * 6, py = -8 + Math.sin(k * 0.4) * 6, L = 70 + R() * 150, cw = (R() - 0.5) * 30;
      x.strokeStyle = body; x.lineWidth = 1.6 + R(); x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + cw, py + L * 0.6, px + cw * 0.4, py + L); x.stroke();
      for (let j = 1; j < 5; j++) { const u = j / 5, lx = px + cw * u * 0.9, ly = py + L * u; x.fillStyle = body; x.save(); x.translate(lx, ly); x.rotate((j % 2 ? 1 : -1) * 0.8); x.beginPath(); x.ellipse(5, 0, 6, 2, 0, 0, 6.283); x.fill(); x.restore(); }
      if (k % 3 === 0) fl.push([px + cw * 0.4, py + L, ['#7fe8d8', '#b9a8ff'][k % 2]]); }
    return fl; }, 1));
  DN2_FG.reed = [0, 1, 2].map(i => mk(300, 260, 150, 250, x => {
    const R = rng(i * 53 + 8), tips = [];
    for (let k = 0; k < 9; k++) { const an = (k - 4) * 0.17 + (R() - 0.5) * 0.12, L = 110 + R() * 110, ex = Math.sin(an) * L, ey = -Math.cos(an) * L; x.strokeStyle = body; x.lineWidth = 2.2 - k % 3 * 0.3; x.beginPath(); x.moveTo((k - 4) * 6, 4); x.quadraticCurveTo(ex * 0.3, ey * 0.55, ex + (an > 0 ? 8 : -8) * (k % 2), ey); x.stroke();
      if (k % 3 === 1) { x.fillStyle = body; x.beginPath(); x.ellipse(ex, ey - 9, 3.6, 11, an, 0, 6.283); x.fill(); tips.push([ex, ey - 10]); } }
    x.fillStyle = body; x.beginPath(); x.ellipse(0, 6, 60, 14, 0, 0, 6.283); x.fill(); return tips; }, 1));
  DN2_FG.leaf = [0, 1].map(i => mk(400, 340, 200, 40, x => {   // bulanık, odak dışı büyük yapraklar (düşük çözünürlükle boyanıp büyütülür)
    const R = rng(i * 7 + 2); x.fillStyle = '#040520'; for (let k = 0; k < 7; k++) { x.save(); x.translate((k - 3) * 38, 0); x.rotate((k - 3) * 0.3 + (R() - 0.5) * 0.3); x.beginPath(); x.ellipse(0, 90 + R() * 40, 26 + R() * 14, 110 + R() * 70, 0, 0, 6.283); x.fill(); x.restore(); } return null; }, 0.16));
}
const DN2_FGV = [0, 3, 1, 4, 2, 0, 3, 1];   // 8 sarkık süs, 5 tür (aynı görünüm art arda gelmesin)
function dn2Foreground(tm) {
  if (!dn2Ok()) return; if (!isFinite(tm)) tm = 0;
  dn2FgBake(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  const sc = DN2_FG.sc, span1 = 3280, span2 = 1500, dy = Math.min(0, cam.y - DN2.GREF + 0.76 * H / S);
  const pulse = 0.75 + 0.25 * Math.sin(tm * 1.3);
  // bulanık büyük yapraklar: alt köşelerde (kontrol bölgesi) DEĞİL; yalnız üst köşelerde çok hafif
  if (false) for (let i = 0; i < 2; i++) { const sp = DN2_FG.leaf[i], sw = Math.sin(tm * 0.35 + i * 2) * 0.04; g.save(); g.translate(i ? W * 0.97 : W * 0.03, H * 1.04); g.rotate(sw + (i ? 0.25 : -0.25)); g.scale(i ? -1 : 1, 1); g.globalAlpha = 0.92; g.drawImage(sp.c, -sp.ox * sc * 1.15, -sp.oy * sc * 2.0, sp.w * sc * 1.15, sp.h * sc * 1.15); g.restore(); }
  g.globalAlpha = 1;
  // sarkık ışık çiçekleri
  for (let n = 0; n < 8; n++) {
    const sp = DN2_FG.vine[DN2_FGV[n]], wx = ((n * 410 + 60 - cam.x * 1.18) % span1 + span1) % span1 - 260; if (wx > VW + 160) continue;
    const swy = Math.sin(tm * 0.6 + n * 1.7) * 0.05, s = 0.82 + ((n * 7) % 5) * 0.07, fl = (n * 3) % 4 < 2 ? -1 : 1;
    g.globalAlpha = clamp(Math.abs(wx - VW / 2) / (VW * 0.34), 0.0, 1) * (0.35 + 0.65 * dn2Foc(wx * S, 260 * S)); if (g.globalAlpha < 0.02) continue;
    g.save(); g.translate(wx * S, (-28 + Math.min(0, dy) * 0.05) * S); g.rotate(swy); g.scale(s * fl, s);
    g.drawImage(sp.c, -sp.ox * S, -sp.oy * S, sp.w * S, sp.h * S);
    g.globalCompositeOperation = 'lighter';
    for (const f of sp.info) dn2Eg(f[2], f[0] * S, f[1] * S, 24 * S, 24 * S, 0.16 * pulse * (0.5 + DN2.fill * 0.5));
    g.restore(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  }
  // alttan saz
  for (let n = 0; n < 4; n++) {
    const sp = DN2_FG.reed[n % 3], wx = ((n * 470 + 120 - cam.x * 1.45) % span2 + span2) % span2 - 300; if (wx > VW + 200) continue;
    const swy = Math.sin(tm * 0.7 + n * 2.2) * 0.035, s = 0.6 + (n % 2) * 0.12, fl = n % 2 ? -1 : 1, fx = isFinite(P.x) ? Math.abs(wx - (P.x - cam.x)) : 999, rx = wx / VW;
    g.globalAlpha = clamp(fx / 220, 0.18, 1) * smooth(clamp((rx - 0.1) / 0.1, 0, 1)) * smooth(clamp((0.62 - rx) / 0.1, 0, 1)); if (g.globalAlpha < 0.02) continue;   // yalnız ekranın alt-orta bölgesinde; sol/sağ alt kontrol bölgeleri boş
    g.save(); g.translate(wx * S, (H / S + 40 - Math.min(0, dy) * 0.3) * S); g.rotate(swy); g.scale(s * fl, s);
    g.drawImage(sp.c, -sp.ox * S, -sp.oy * S, sp.w * S, sp.h * S);
    g.globalCompositeOperation = 'lighter';
    for (const f of sp.info) dn2Eg(n % 2 ? '#b9a8ff' : '#7fe8d8', f[0] * S, f[1] * S, 12 * S, 12 * S, 0.3 * pulse);
    g.restore(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  }
}

// ═══════════ dışarıdan tetiklenebilir ısınma: dn2Isit() ═══════════
// Seçim/giriş ekranında her karede çağrılırsa ağır önbellekleri (gökyüzü, uzak katmanlar, ön plan, ilk zemin parçaları, süs sprite'ları)
// kare başına tek küçük adımla hazırlar; hepsi bitince true döner. Idempotent (bitince hep true), dn2Ok korumalı (tuval boyutu hazır değilse false).
function dn2Isit() {
  if (!dn2Ok()) return false; dn2Init(); if (DN2.prepDone) return true;
  const st = DN2.prep || (DN2.prep = { i: 0, sub: 0 });
  switch (st.i) {
    case 0: dn2SkyBuild(); st.i++; break;
    case 1: dn2SkyStep(); st.i++; break;
    case 2: { const L = DN2_LAY[st.sub]; if (L) { if (!L.cv || Math.abs(L.q - clamp(H / VH * 0.62, 0.5, Math.min(1.5, 3900 / L.P))) > 0.001) dn2PaintLayer(L); st.sub++; } if (st.sub >= DN2_LAY.length) { st.i++; st.sub = 0; } break; }
    case 3: dn2FgBake(); st.i++; break;
    case 4: { const G = dn2GGeo(); if (!st.keys) { const a = Math.floor(cam.x / DN2_TW); st.keys = [a, a + 1, a + 2, a - 1].filter(k => k >= 0 && k * DN2_TW < COLS * T); }
      const k = st.keys[st.sub]; if (k !== undefined) { dn2GMake(k, G); st.sub++; } if (st.sub >= st.keys.length) { st.i++; st.sub = 0; } break; }
    case 5: { if (!st.sp) { const set = new Map(); for (const d of DN2.deco) set.set(d.k + d.v + d.c, d); st.sp = [...set.values()]; }
      for (let n = 0; n < 14 && st.sub < st.sp.length; n++, st.sub++) { const d = st.sp[st.sub]; dn2DecoSpr(d.k, d.v, d.c); } if (st.sub >= st.sp.length) st.i++; break; }
    case 6: { if (!st.fl) { for (const A of DN2_AUR) dn2AurSpr(A.c0, A.c1); dn2MoonSpr(); dn2RaySpr(); for (const L of DN2_LM) dn2LmSpr(L[0]); st.fl = []; st.fi = 0; const set = new Set(); for (const G of DN2.lakes) { dn2LakeBuild(G); for (const f of G.flora) { const k = f.k + f.v + f.c; if (!set.has(k)) { set.add(k); st.fl.push(f); } } } break; }
      for (let n = 0; n < 6 && st.fi < st.fl.length; n++, st.fi++) { const f = st.fl[st.fi]; dn2FloraSpr(f.k, f.v, f.c); } if (st.fi >= st.fl.length) st.i++; break; }
    case 7: { const L = dn2StarList(); const cols = new Set(DN2_SC); for (const o of L) if (o.renk) cols.add(dn2Sat(o.renk, 1.7)); cols.add('#ffffff'); cols.add('#cfdcff'); const arr = [...cols]; for (let n = 0; n < 3 && st.sub < arr.length; n++, st.sub++) dn2StarSpr(arr[st.sub]); if (st.sub >= arr.length) { st.i++; st.sub = 0; } break; }
    case 8: for (const c of ['#a8bcff', '#eef3ff', '#dff4ff', '#ffe8c8', '#9fb4ff', '#8fe8e0', '#8aa0ff', '#7a8cff', '#a890ff', '#bcd0ff', '#d0e4ff', '#5a6ad8', '#cfdcff', '#b8c8ff']) glow(c); for (const c of DN2_MC) glow(c); for (const c of DN2_SC) glow(c); st.i++; break;
    case 9: dn2SkyComp(0); { const x = dn2Cv(2, 2).getContext('2d'); dn2Dither(x, 2, 2, 0.01); } st.i++; break;
    case 10: {   // kaynak tuvallerin bekleyen çizim komutlarını / doku yüklemesini şimdi tetikle (küçük tuvale çiz + oku): ilk karede takılma olmasın.
      // Her tuval ayrı dokunulur; adım başına ≈4 ms bütçe (bir adımda en az bir tuval) → kısa girişte uzun tek kare yok
      const sc = st.sc || (st.sc = dn2Cv(4, 4)), x = sc.getContext('2d', { willReadFrequently: true });
      if (!st.tl) { const S_ = DN2_SK, L = st.tl = [S_.A, S_.B, S_.C]; for (const l of DN2_LAY) L.push(l.cv); for (const k of DN2_FG.vine) L.push(k.c); for (const k of DN2_FG.reed) L.push(k.c); for (const k of DN2_FG.leaf) L.push(k.c);
        for (const c of DN2.gc.values()) L.push(c.cv); for (const k in dn2DS) L.push(dn2DS[k]); for (const k in dn2StarC) L.push(dn2StarC[k]); for (const k in dn2AurC) L.push(dn2AurC[k]); for (const k in dn2FS) L.push(dn2FS[k]); L.push(dn2RayC); for (const k in dn2LmC) L.push(dn2LmC[k]); st.ti = 0; }
      const t0 = performance.now();
      do { const c = st.tl[st.ti++]; if (c && c.width > 0) { x.drawImage(c, 0, 0, 2, 2); x.getImageData(0, 0, 1, 1); } } while (st.ti < st.tl.length && performance.now() - t0 < 4);
      if (st.ti >= st.tl.length) st.i++; break; }
    default: st.i++;
  }
  if (st.i >= 11) { DN2.prepDone = true; return true; }
  return false;
}
// ═══════════ vinyet (önbellekli ¼ çözünürlük; gökyüzü doldukça açılır) ═══════════
const dn2VigC = dn2Cv(2, 2); let dn2VigK = [NaN, 0, 0];
function dn2Vignette() {
  if (!(W > 0 && H > 0)) return;
  const w = Math.max(2, Math.round(W / 4)), h = Math.max(2, Math.round(H / 4)), f = Math.round(DN2.fill * 20) / 20;
  if (dn2VigK[0] !== f || dn2VigK[1] !== w || dn2VigK[2] !== h) {
    dn2VigK = [f, w, h]; dn2VigC.width = w; dn2VigC.height = h; const x = dn2VigC.getContext('2d');
    const tg = x.createLinearGradient(0, 0, 0, h); tg.addColorStop(0, `rgba(3,4,20,${0.22 - f * 0.1})`); tg.addColorStop(0.2, 'rgba(3,4,20,0)'); tg.addColorStop(0.8, 'rgba(3,4,20,0)'); tg.addColorStop(1, 'rgba(3,4,20,0.32)'); x.fillStyle = tg; x.fillRect(0, 0, w, h);
    const r = Math.hypot(w, h) / 2, vg = x.createRadialGradient(w / 2, h * 0.55, r * 0.4, w / 2, h * 0.55, r * 1.1), am = 0.5 - f * 0.18;   // yumuşak (kübik) düşüş: halka/bant yok
    for (let i = 0; i <= 8; i++) { const u = i / 8; vg.addColorStop(u, `rgba(4,4,26,${(am * u * u * (3 - 2 * u) * (0.5 + 0.5 * u)).toFixed(4)})`); }
    x.fillStyle = vg; x.fillRect(0, 0, w, h);
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.drawImage(dn2VigC, 0, 0, W, H);
}

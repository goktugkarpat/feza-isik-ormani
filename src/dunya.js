/* dunya.js – orman atmosferi: gökyüzü, katmanlar, zemin, bölge süsleri, göl yansıması, çiçek/tohum/nilüfer/ağaç çizimi, ön plan.
   Yön: çoğunlukla Ori (gece mavisi, biyolüminesans, ışık huzmeleri, katmanlı sis, koyu ön plan siluetleri),
   biraz Gris (gökyüzünde suluboya lekeleri, en uzakta zarif sade şekiller, renklerin dalga dalga geri gelmesi, kâğıt dokusu).
   Klasik script: üst düzey const/let/function'lar diğer dosyalarla ortak (ortak.js ve bolum.js önce yüklenir).
   Bu dosyanın iç adları "dn" önekiyle başlar.
   Bölüm boyutları HİÇ sabit yazılmaz: ROWS, COLS, T, topOf, grid, BOLUM.bolgeler, BOLUM.gol yüklenirken okunur.
   Performans: arka plan katmanları ve zemin gövdesi parça parça (512 birimlik) ekran dışı tuvallere çizilir; yalnızca
   boyut ya da aydınlık belirgin bir adım değişince yeniden boyanır (karede en fazla bir parça). Karede ctx.filter/shadowBlur yok.
   Göl yansıması: suyun üstündeki görünür şerit küçük bir tuvale kopyalanır, ters çevrilip yatay dilimlerde dalgalı çizilir. */
'use strict';

// ── renkler: 3 durak (gece mavisi → turkuaz → altın-turkuaz şafak) ──
const DNP = {
  skyTop: ['#030716', '#061a30', '#123048'],
  skyMid: ['#0a2048', '#0f4560', '#3a7a7c'],
  skyLow: ['#1a4c80', '#2b8c9c', '#e8c88e'],
  haze:   ['#1d4c84', '#1f6e88', '#3a8a84'],
  hazeHi: ['#4d8fd0', '#6fdad8', '#ffe2a0'],
  wash:   ['#2a5aa0', '#3aa0b0', '#f0b0a0'],
  gris:   ['#1f4c84', '#21718a', '#4a9488'],
  far:    ['#143462', '#124a60', '#22605e'],
  mid:    ['#0a1d42', '#0a2f44', '#143e46'],
  near:   ['#030916', '#04101c', '#081a1e'],
  canopy: ['#02050d', '#030a12', '#051214'],
  earth:  ['#06101e', '#071622', '#0c1e20'],
  rim:    ['#6adfff', '#7ff0e4', '#ffe2a6'],
  bio:    ['#3ad6ff', '#45f0d6', '#9ff2b4'],
  warm:   ['#8ac4ff', '#b4f2dc', '#ffd68c'],
  grass:  ['#071526', '#08202c', '#0e2c2a'],
  water:  ['#0a2350', '#0e4866', '#2a6a74'],
  moss:   ['#0b2834', '#0d3a3c', '#1f4a34'],
};
const dnHex = (a, b, t) => { const A = hex(a), B = hex(b); let s = '#'; for (let i = 0; i < 3; i++) s += Math.round(lerp(A[i], B[i], t)).toString(16).padStart(2, '0'); return s; };
function dcol(k, t) { const a = DNP[k]; t = clamp(t, 0, 1); return t < 0.5 ? dnHex(a[0], a[1], t * 2) : dnHex(a[1], a[2], t * 2 - 1); }
let dnMemoL = -1; const dnMemo = {};
function dc(k, al = 1) {   // anlık aydınlığa göre rgba
  if (dnMemoL !== light) { dnMemoL = light; for (const q in dnMemo) delete dnMemo[q]; }
  const A = dnMemo[k] || (dnMemo[k] = hex(dcol(k, light)));
  return `rgba(${A[0]},${A[1]},${A[2]},${al})`;
}
const dcAt = (k, t, al = 1) => { const A = hex(dcol(k, t)); return `rgba(${A[0]},${A[1]},${A[2]},${al})`; };
const dq = k => dcol(k, Math.round(light * 10) / 10);   // parlama sprite'ları için (az sayıda önbellek)
const dnRgba = (h, a) => { const A = hex(h); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };

// ── küçük yardımcılar ──
const dnEG = (col, x, y, rx, ry, a) => { g.globalAlpha = a; g.drawImage(glow(col), x - rx, y - ry, rx * 2, ry * 2); g.globalAlpha = 1; };
const dnG = (x, col, px, py, r, a) => { x.globalAlpha = a; x.drawImage(glow(col), px - r, py - r, r * 2, r * 2); x.globalAlpha = 1; };
function dnBez(p, t) {
  const m = 1 - t;
  return [m * m * m * p[0] + 3 * m * m * t * p[2] + 3 * m * t * t * p[4] + t * t * t * p[6],
          m * m * m * p[1] + 3 * m * m * t * p[3] + 3 * m * t * t * p[5] + t * t * t * p[7]];
}
function dnTaper(p, w0, w1, n = 14) {   // sivrilen kıvrık dal (Path2D)
  const L = [], Rr = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = dnBez(p, Math.max(0, t - 0.01)), b = dnBez(p, Math.min(1, t + 0.01)), c = dnBez(p, t);
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, Math.pow(t, 0.8)) / 2;
    L.push([c[0] - dy / l * w, c[1] + dx / l * w]); Rr.push([c[0] + dy / l * w, c[1] - dx / l * w]);
  }
  const path = new Path2D(); dnSmooth(path, L.concat(Rr.reverse())); return path;
}
function dnSmooth(path, pts) {
  path.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) path.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  path.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); path.closePath();
}
function dnLeaf(path, cx, cy, len, wid, ang) {   // sivri yaprak (hep saat yönünde → birleşimler delik açmaz)
  const c = Math.cos(ang), s = Math.sin(ang);
  path.moveTo(cx, cy);
  path.quadraticCurveTo(cx + c * len * 0.45 + s * wid, cy + s * len * 0.45 - c * wid, cx + c * len, cy + s * len);
  path.quadraticCurveTo(cx + c * len * 0.45 - s * wid, cy + s * len * 0.45 + c * wid, cx, cy);
}
// ışık huzmesi sprite'ı (yatayda yumuşak, aşağı doğru sönen)
const dnShaftC = {};
function dnShaft(col) {
  if (dnShaftC[col]) return dnShaftC[col];
  const c = document.createElement('canvas'); c.width = 64; c.height = 256;
  const x = c.getContext('2d'), [r, gg, b] = hex(col), cs = a => `rgba(${r},${gg},${b},${a})`;
  const h = x.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, cs(0)); h.addColorStop(0.25, cs(0.25)); h.addColorStop(0.5, cs(1)); h.addColorStop(0.75, cs(0.25)); h.addColorStop(1, cs(0));
  x.fillStyle = h; x.fillRect(0, 0, 64, 256);
  x.globalCompositeOperation = 'destination-in';
  const v = x.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.1, 'rgba(0,0,0,1)'); v.addColorStop(0.45, 'rgba(0,0,0,0.5)'); v.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = v; x.fillRect(0, 0, 64, 256);
  return dnShaftC[col] = c;
}
// bokeh diski (kenarı yumuşak, ortası düz)
const dnDiscC = {};
function dnDisc(col) {
  if (dnDiscC[col]) return dnDiscC[col];
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), [r, gg, b] = hex(col), rg = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, `rgba(${r},${gg},${b},0.55)`); rg.addColorStop(0.72, `rgba(${r},${gg},${b},0.45)`);
  rg.addColorStop(0.86, `rgba(${r},${gg},${b},0.6)`); rg.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  x.fillStyle = rg; x.fillRect(0, 0, 64, 64);
  return dnDiscC[col] = c;
}
// yıldız/ışıltı: dört kollu, yumuşak (önbellekli)
const dnStarC = {};
function dnStar(col) {
  if (dnStarC[col]) return dnStarC[col];
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), [r, gg, b] = hex(col);
  x.globalCompositeOperation = 'lighter';
  dnG(x, col, 32, 32, 22, 0.5);
  for (const [sx, sy] of [[1, 0.09], [0.09, 1]]) {
    const rg = x.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, `rgba(${r},${gg},${b},1)`); rg.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    x.save(); x.translate(32, 32); x.scale(sx, sy); x.translate(-32, -32); x.fillStyle = rg; x.beginPath(); x.arc(32, 32, 32, 0, 6.283); x.fill(); x.restore();
  }
  dnG(x, '#ffffff', 32, 32, 5, 1);
  return dnStarC[col] = c;
}

// ── kâğıt dokusu (Gris, çok hafif) ──
const DN_GRAIN = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), d = x.createImageData(256, 256), R = rng(99);
  for (let i = 0; i < d.data.length; i += 4) { const v = 110 + R() * 145; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 18 + R() * 26; }
  x.putImageData(d, 0, 0); return c;
})();
let grainPat = null;   // oyun.js resize() sıfırlar

// ── bölüm ölçüleri (yüklenirken bolum.js'ten) ──
const DN_LW = COLS * T, DN_LH = ROWS * T;
const DN_GY = (() => { const a = []; for (let c = 0; c < COLS; c++) { const t = topOf(c); if (t < ROWS) a.push(t * T); } a.sort((p, q) => p - q); return a.length ? a[a.length >> 1] : DN_LH - 4 * T; })();
const DN_GTOP = (() => { let m = DN_LH; for (let c = 0; c < COLS; c++) m = Math.min(m, topOf(c) * T); return m; })();
const DN_CAM0 = -40, DN_CAM1 = Math.max(-40, DN_LH - VH + 30);   // oyun.js stepCam sınırları
const DN_CREF = clamp(DN_GY - VH * 0.62, DN_CAM0, DN_CAM1);       // yerde dururkenki tipik kamera
const DN_DY0 = DN_CAM0 - DN_CREF, DN_DY1 = DN_CAM1 - DN_CREF;
const dnDY = () => cam.y - DN_CREF;                              // <0: yukarı tırmanırken
const DN_FYK = 0.75;                                             // dikey paralaks yatayınkinden biraz zayıf
const DN_GOL = BOLUM.gol || null;

// ── bölgeler: yumuşak geçişli ağırlıklar ──
const DN_REGS = (BOLUM.bolgeler || []).slice();
const DN_RN = ['patika', 'pofuduk', 'gol', 'dallar', 'sakli', 'aciklik'];
const DN_RB = 260;   // geçiş genişliği (birim)
function dnRegW(x, y, out) {
  out = out || {};
  for (const n of DN_RN) out[n] = 0;
  let tot = 0, best = null, bd = 1e9;
  for (const r of DN_REGS) {
    let w = smooth(clamp((x - r.x0) / DN_RB + 0.5, 0, 1)) * smooth(clamp((r.x1 - x) / DN_RB + 0.5, 0, 1));
    if (r.ust != null) w *= y == null ? 0.35 : smooth(clamp((r.ust + 140 - y) / 280, 0, 1)) * 3;
    const d = x < r.x0 ? r.x0 - x : x > r.x1 ? x - r.x1 : 0;
    if (r.ust == null && d < bd) { bd = d; best = r.ad; }
    if (w > 0) { out[r.ad] = (out[r.ad] || 0) + w; tot += w; }
  }
  if (tot <= 0) { if (best) out[best] = 1; else out.patika = 1; }
  else for (const k in out) out[k] /= tot;
  return out;
}
function dnRegPick(x, y, R) {   // yükleme anında: sınırlarda karışık seçim
  const w = dnRegW(x, y); let u = R(), last = 'patika';
  for (const k in w) { if (w[k] <= 0) continue; last = k; u -= w[k]; if (u <= 0) return k; }
  return last;
}
const dnLW = (lx, f) => (lx - 425) / f + 425;   // katman x'i → o katmanın ekran ortasında görüldüğü dünya x'i
const dnKeep = (lx, f, keep, R) => { const w = dnRegW(dnLW(lx, f)); let p = 0; for (const k in w) p += w[k] * (keep[k] == null ? 1 : keep[k]); return R() < p; };
const DNR = dnRegW(0, null);   // karedeki (kamera merkezindeki) ağırlıklar
let dnOpen = 0, dnBlaze = 0;   // açık gökyüzü (göl/açıklık), finalde orman alevlenir

// ── gökyüzü: suluboya (ekran boyunun 1/3'ü; aydınlık değişince yeniden boyanır) ──
const dnSky = document.createElement('canvas'), dnSg = dnSky.getContext('2d');
let skyLight = -1;   // oyun.js resize() -1 yapar → yeniden boya
const DN_WASH = (() => { const R = rng(3), a = []; for (let i = 0; i < 34; i++) a.push([R(), R() * 0.85, 0.1 + R() * 0.32, R(), R()]); return a; })();
function dnPaintSky() {
  const w = Math.max(2, Math.round(W / 3)), h = Math.max(2, Math.round(H / 3));
  if (dnSky.width !== w || dnSky.height !== h) { dnSky.width = w; dnSky.height = h; }
  skyLight = light;
  const x = dnSg, gr = x.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, dc('skyTop')); gr.addColorStop(0.42, dc('skyMid')); gr.addColorStop(0.78, dc('skyLow')); gr.addColorStop(1, dc('haze'));
  x.globalCompositeOperation = 'source-over'; x.fillStyle = gr; x.fillRect(0, 0, w, h);
  for (const [u, v, s, k, q] of DN_WASH) {   // suluboya lekeleri: kenarı biraz koyu "ıslak kenar" halkası
    const key = k < 0.35 ? 'haze' : k < 0.7 ? 'wash' : k < 0.85 ? 'hazeHi' : 'skyMid';
    const [r, gg, b] = hex(dcol(key, light)), cs = a => `rgba(${r},${gg},${b},${a})`;
    const rad = s * Math.max(w, h), cx = u * w, cy = v * h, a = 0.05 + q * 0.08;
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    rg.addColorStop(0, cs(a * 0.7)); rg.addColorStop(0.7, cs(a)); rg.addColorStop(0.9, cs(a * 1.5)); rg.addColorStop(1, cs(0));
    x.fillStyle = rg; x.save(); x.translate(cx, cy); x.scale(1.6, 0.8); x.translate(-cx, -cy);
    x.beginPath(); x.arc(cx, cy, rad, 0, 6.283); x.fill(); x.restore();
  }
}
const DN_STARS = (() => { const R = rng(808), a = []; for (let i = 0; i < 120; i++) a.push({ x: R(), y: Math.pow(R(), 1.5) * 0.55, s: 0.5 + Math.pow(R(), 3) * 2.2, ph: R() * 6.28, sp: 0.6 + R() * 1.8, c: R() }); return a; })();
// ay: yumuşak disk + hafif lekeler (önbellekli)
let dnMoonC = null;
function dnMoon() {
  if (dnMoonC) return dnMoonC;
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const rg = x.createRadialGradient(56, 54, 4, 64, 64, 60);
  rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.6, '#eaf6ff'); rg.addColorStop(0.92, '#c8e4ff'); rg.addColorStop(1, 'rgba(200,228,255,0)');
  x.fillStyle = rg; x.beginPath(); x.arc(64, 64, 60, 0, 6.283); x.fill();
  x.fillStyle = 'rgba(150,190,230,0.22)';
  for (const [a, b, r] of [[48, 50, 12], [78, 72, 9], [62, 86, 7], [82, 46, 6], [42, 76, 5]]) { x.beginPath(); x.arc(a, b, r, 0, 6.283); x.fill(); }
  return dnMoonC = c;
}

// ── parça önbellekli katmanlar ──
const DN_CH = 512;
const dnQS = v => Math.pow(2, Math.ceil(Math.log2(Math.max(0.05, v)) * 4 - 0.02) / 4);
// önbellek ölçeği kamera yakınlaşmasından BAĞIMSIZ (bölge geçişinde zoom değişince bütün parçalar yeniden boyanmasın → takılma yok);
// yakınlaşma ≤ ~1.06 olduğundan büyütme fark edilmez. iPad'de (dokunmatik, büyük tuval) bellek için tavan.
const DN_TOUCH = typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 1 || 'ontouchstart' in window);
const dnCS = () => Math.min(dnQS(H / VH), DN_TOUCH ? 2.379 : 4);   // önbellek ölçeği çeyrek oktav adımlı (kamera yakınlaşması sürekli değişse de yeniden boyama olmaz)
let dnBudget = 0;
// boşta önden boyama: kamera önündeki/arkasındaki parçalar karede ~2.5 ms'lik bütçeyle sırayla hazırlanır (ilk görüşte takılma olmasın)
const DN_Q = [];
function dnQueue(pri, key, fn) { for (const j of DN_Q) if (j.key === key) { if (pri < j.pri) j.pri = pri; return; } DN_Q.push({ pri, key, fn }); }
function dnRunQueue() {
  if (!DN_Q.length) return;
  DN_Q.sort((a, b) => a.pri - b.pri);
  const t0 = performance.now(); let n = 0;
  while (DN_Q.length && (n === 0 || performance.now() - t0 < 2.5)) { const j = DN_Q.shift(), t1 = performance.now(); j.fn(); n++; const d = performance.now() - t1; if (d > 4 && window.DN_LOG) DN_LOG.push(j.key + ':' + d.toFixed(1)); }
  DN_Q.length = 0;
}
// L: { f (yatay paralaks), fy (dikey), q (çözünürlük çarpanı), y0, y1, paint, steps (aydınlık adımı), world }
function dnLayer(o) { o.ch = new Map(); o.steps = o.steps || 25; return o; }
function dnBounds(f, fy, top, bot) { return [Math.min(top, 110 * f + DN_DY0 * fy - 40), Math.max(bot, VH / 0.75 + 110 * f + DN_DY1 * fy + 40)]; }
const dnOY = L => L.world ? cam.y : 110 * L.f + dnDY() * L.fy;
const dnOX = L => L.world ? cam.x : cam.x * L.f;
function dnRenderChunk(L, k, sc, lq, c) {
  const PAD = 2, w = Math.round(DN_CH * sc) + PAD * 2, h = Math.round((L.y1 - L.y0) * sc);
  if (!c) c = { cv: document.createElement('canvas') };
  if (c.cv.width !== w || c.cv.height !== h) { c.cv.width = w; c.cv.height = h; }
  const x = c.cv.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h);
  const s = (w - PAD * 2) / DN_CH;
  x.setTransform(s, 0, 0, s, -k * DN_CH * s + PAD, -L.y0 * (h / (L.y1 - L.y0)));
  x.lineCap = 'round'; x.lineJoin = 'round';
  L.paint(x, k * DN_CH - 20, (k + 1) * DN_CH + 20, lq, L);
  x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  c.sc = sc; c.l = lq; c.pad = PAD;
  L.ch.set(k, c);
  return c;
}
function dnDrawLayer(L, noPaint) {   // ekran dönüşümünde (birim matris ya da ayna) çağrılır
  const lq = Math.round(light * L.steps) / L.steps, sc = dnCS() * L.q;
  const ox = dnOX(L), oy = dnOY(L);
  const sy0 = Math.round((L.y0 - oy) * S), sy1 = Math.round((L.y1 - oy) * S);
  if (sy1 < 0 || sy0 > H) return;
  const k0 = Math.floor(ox / DN_CH), k1 = Math.floor((ox + VW) / DN_CH);
  const dir = cam.x >= (L.px == null ? cam.x : L.px) ? 1 : -1; if (!noPaint) L.px = cam.x;
  for (let k = k0 - 2; k <= k1 + 2; k++) {
    let c = L.ch.get(k);
    const vis = k >= k0 && k <= k1, missing = !c || c.sc !== sc, stale = missing || c.l !== lq;
    if (!noPaint && stale) {
      if (vis && missing) c = dnRenderChunk(L, k, sc, lq, c);
      else { const ahead = (k - (k0 + k1) / 2) * dir > 0; dnQueue(missing ? (ahead ? 0 : 1) : vis ? 2 : 3, 'L' + L.f + ':' + k, () => dnRenderChunk(L, k, sc, lq, L.ch.get(k))); }
    }
    if (!vis || !c) continue;
    const sx0 = Math.round((k * DN_CH - ox) * S), sx1 = Math.round(((k + 1) * DN_CH - ox) * S);
    g.drawImage(c.cv, c.pad, 0, c.cv.width - c.pad * 2, c.cv.height, sx0, sy0, sx1 - sx0, sy1 - sy0);
  }
  if (!noPaint) for (const k of L.ch.keys()) if (k < k0 - 3 || k > k1 + 3) L.ch.delete(k);
}

// ── budaklı ağaç geometrisi (Ori: kök yayılımı, kıvrık dallar, sarkan yosun) ──
function dnGnarl(o) {
  const R = rng(o.seed), parts = [], moss = [], vines = [], fungi = [], rims = [];
  const N = 22, ph = R() * 6.28, ph2 = R() * 6.28, amp = (0.25 + R() * 0.5) * o.w, lean = (R() - 0.5) * o.w * 1.4;
  const cxAt = t => o.x + (Math.sin(t * 2.4 + ph) - Math.sin(ph)) * amp + lean * t + Math.sin(t * 8 + ph2) * o.w * 0.07;
  const hwAt = t => o.w * (1 - 0.3 * t) * (1 + 0.06 * Math.sin(t * 13 + ph2)) + (o.roots ? o.w * 1.25 * Math.pow(1 - t, 7) : 0);
  const yAt = t => lerp(o.base, o.top, t);
  const Lp = [], Rp = [];
  for (let i = 0; i <= N; i++) { const t = i / N, c = cxAt(t), h = hwAt(t), y = yAt(t); Lp.push([c - h, y]); Rp.push([c + h, y]); }
  const trunk = new Path2D(); dnSmooth(trunk, Lp.concat(Rp.slice().reverse())); parts.push(trunk);
  for (let s = 0; s < 2; s++) {   // kabuk çizgileri
    const off = (s ? 0.45 : -0.3) + (R() - 0.5) * 0.2, pts = [];
    for (let i = 2; i <= N - 2; i += 2) { const t = i / N; pts.push([cxAt(t) + hwAt(t) * off + Math.sin(t * 20 + s * 3) * o.w * 0.06, yAt(t)]); }
    rims.push(pts);
  }
  if (o.roots) {
    const nr = 2 + Math.floor(R() * 3);
    for (let k = 0; k < nr; k++) {
      const sd = k % 2 ? 1 : -1, sx = cxAt(0.03) + sd * o.w * 0.5, sy = o.base - o.w * (0.6 + R() * 0.5);
      const ex = o.x + sd * o.w * (2.2 + R() * 2.4), ey = o.base + o.w * (0.2 + R() * 0.4);
      parts.push(dnTaper([sx, sy, sx + sd * o.w * 0.8, sy + o.w * 0.1, ex - sd * o.w * 0.9, ey - o.w * 0.6, ex, ey], o.w * (0.7 + R() * 0.3), 2));
    }
  }
  const nb = o.br || 0;
  for (let b = 0; b < nb; b++) {
    const y = lerp(o.brMin, o.brMax, (b + R() * 0.8) / nb), t = clamp((o.base - y) / (o.base - o.top), 0.05, 0.98);
    const sd = (b + (o.seed & 1)) % 2 ? 1 : -1, sx = cxAt(t), sy = yAt(t), Lb = o.w * (3.2 + R() * 4) * (o.brLen || 1);
    const ex = sx + sd * Lb, ey = sy - Lb * (o.flat ? 0.05 + R() * 0.12 : 0.15 + R() * 0.45);
    const p = [sx, sy, sx + sd * Lb * 0.35, sy + Lb * (0.02 - R() * 0.1), ex - sd * Lb * 0.35, ey + Lb * (0.1 + R() * 0.2), ex, ey];
    const w0 = hwAt(t) * 1.1;
    parts.push(dnTaper(p, w0, 1.5));
    const sp = dnBez(p, 0.55), sl = Lb * (0.35 + R() * 0.25);
    const q = [sp[0], sp[1], sp[0] + sd * sl * 0.3, sp[1] - sl * 0.3, sp[0] + sd * sl * 0.7, sp[1] - sl * 0.5, sp[0] + sd * sl, sp[1] - sl * (0.4 + R() * 0.5)];
    parts.push(dnTaper(q, w0 * 0.4, 1));
    if (o.moss) for (let m = 0; m < o.moss; m++) {
      const u = 0.15 + R() * 0.8, pt = dnBez(p, u), ww = lerp(w0, 1.5, u) * 0.4;
      moss.push([pt[0], pt[1] + ww, 6 + R() * o.w * 1.6 * (1.2 - u), R() * 6]);
    }
    if (o.vines && R() < 0.7) {
      const pt = dnBez(p, 0.4 + R() * 0.5), len = clamp(o.vineMax - pt[1], 0, 60 + R() * 160);
      if (len > 25) vines.push([pt[0], pt[1], len, R() * 6, R() < 0.75]);
    }
  }
  if (o.fungi) for (let f = 0; f < o.fungi; f++) {
    const y = lerp(o.fMin, o.fMax, R()), t = (o.base - y) / (o.base - o.top), sd = R() < 0.5 ? -1 : 1;
    const fx = cxAt(t) + sd * hwAt(t) * 0.9, n = 2 + Math.floor(R() * 2), s0 = Math.min(14, o.w * (0.25 + R() * 0.15));
    for (let i = 0; i < n; i++) fungi.push([fx - sd * i * 2, y + i * s0 * 1.3 + (R() - 0.5) * 4, s0 * (1 - i * 0.22), sd]);
  }
  return { parts, moss, vines, fungi, rims };
}
// dev mantar silueti (Pofuduk çayırı): kubbe şapka, ışıyan alt yüz, benekler
function dnMushGeo(o) {   // dev mantar: kubbe / şemsiye / çan (sivri) / dalgalı kenar; bazen 2-3'lü küme; kimisinde etek halkası
  const R = rng(o.seed), subs = [], kinds = ['kubbe', 'semsiye', 'can', 'dalga'];
  const kind0 = o.noCan ? ['kubbe', 'semsiye', 'dalga'][Math.floor(R() * 3)] : kinds[Math.floor(R() * kinds.length)], n = R() < 0.35 ? 2 + (R() < 0.4 ? 1 : 0) : 1;
  for (let m = 0; m < n; m++) {
    const sc = m ? 0.45 + R() * 0.25 : 1, kind = m ? kinds[Math.floor(R() * kinds.length)] : kind0;
    const bx = o.x + (m ? (m % 2 ? 1 : -1) * o.w * (0.7 + R() * 0.5) : 0), h = o.h * sc * (m ? 0.8 : 1), w = o.w * sc;
    const lean = (R() - 0.5) * w * 1.3 + (m ? (bx - o.x) * 0.25 : 0), cx = bx + lean, cy = o.base - h, sw = w * (kind === 'can' ? 0.16 : 0.2);
    const stem = new Path2D(), cap = new Path2D(), gill = new Path2D(), edge = new Path2D(), spots = [];
    const wob = (R() - 0.5) * w * 0.5;   // hafif S kıvrımlı sap
    stem.moveTo(bx - sw * 1.7, o.base); stem.bezierCurveTo(bx - sw * 0.7 + wob, o.base - h * 0.35, cx - sw - wob * 0.6, cy + h * 0.35, cx - sw, cy + 4);
    stem.lineTo(cx + sw, cy + 4); stem.bezierCurveTo(cx + sw - wob * 0.6, cy + h * 0.35, bx + sw * 0.7 + wob, o.base - h * 0.35, bx + sw * 1.7, o.base); stem.closePath();
    let cw = w, ch;
    if (kind === 'semsiye') {   // geniş, yassı, kenarları hafif kalkık
      ch = w * (0.3 + R() * 0.1); cw = w * 1.18;
      cap.moveTo(cx - cw, cy - ch * 0.05); cap.bezierCurveTo(cx - cw * 0.75, cy - ch * 1.3, cx + cw * 0.75, cy - ch * 1.3, cx + cw, cy - ch * 0.05);
      cap.quadraticCurveTo(cx + cw * 0.5, cy + ch * 0.05, cx, cy + 1); cap.quadraticCurveTo(cx - cw * 0.5, cy + ch * 0.05, cx - cw, cy - ch * 0.05); cap.closePath();
      edge.moveTo(cx - cw, cy - ch * 0.05); edge.quadraticCurveTo(cx - cw * 0.5, cy + ch * 0.05, cx, cy + 1); edge.quadraticCurveTo(cx + cw * 0.5, cy + ch * 0.05, cx + cw, cy - ch * 0.05);
    } else if (kind === 'can') {   // sivri çan (masal şapkası), ucu hafif kıvrık
      ch = w * (1.1 + R() * 0.5); cw = w * 0.72; const tipx = cx + (R() - 0.5) * cw * 0.8;
      cap.moveTo(cx - cw, cy + 4); cap.bezierCurveTo(cx - cw * 1.12, cy - ch * 0.35, tipx - cw * 0.55, cy - ch * 0.62, tipx, cy - ch);
      cap.bezierCurveTo(tipx + cw * 0.55, cy - ch * 0.62, cx + cw * 1.12, cy - ch * 0.35, cx + cw, cy + 4); cap.quadraticCurveTo(cx, cy - ch * 0.08, cx - cw, cy + 4); cap.closePath();
      edge.moveTo(cx - cw, cy + 4); edge.quadraticCurveTo(cx, cy - ch * 0.08, cx + cw, cy + 4);
    } else if (kind === 'dalga') {   // dalgalı (fırfırlı) kenar
      ch = w * (0.5 + R() * 0.2); const nW = 7;
      cap.moveTo(cx - cw, cy + 3); cap.bezierCurveTo(cx - cw * 0.9, cy - ch * 1.15, cx + cw * 0.9, cy - ch * 1.15, cx + cw, cy + 3);
      for (let i = nW; i > 0; i--) { const xa = cx - cw + (i / nW) * cw * 2, xb = cx - cw + ((i - 1) / nW) * cw * 2; cap.quadraticCurveTo((xa + xb) / 2, cy + 3 + w * 0.09 * (i % 2 ? 1 : -0.3), xb, cy + 3); }
      cap.closePath();
      edge.moveTo(cx - cw, cy + 3); for (let i = 0; i < nW; i++) { const xa = cx - cw + (i / nW) * cw * 2, xb = cx - cw + ((i + 1) / nW) * cw * 2; edge.quadraticCurveTo((xa + xb) / 2, cy + 3 + w * 0.09 * ((nW - i) % 2 ? 1 : -0.3), xb, cy + 3); }
    } else {   // kubbe
      ch = w * (0.55 + R() * 0.25);
      cap.moveTo(cx - cw, cy + 2); cap.bezierCurveTo(cx - cw * 0.9, cy - ch * 1.15, cx + cw * 0.9, cy - ch * 1.15, cx + cw, cy + 2);
      cap.quadraticCurveTo(cx, cy - ch * 0.12, cx - cw, cy + 2); cap.closePath();
      edge.moveTo(cx - cw, cy + 2); edge.quadraticCurveTo(cx, cy - ch * 0.12, cx + cw, cy + 2);
    }
    gill.moveTo(cx - cw * 0.9, cy + 1); gill.quadraticCurveTo(cx, cy - ch * 0.1, cx + cw * 0.9, cy + 1); gill.quadraticCurveTo(cx, cy + Math.min(ch, w) * 0.2, cx - cw * 0.9, cy + 1); gill.closePath();
    const ns = kind === 'can' ? 4 + Math.floor(R() * 3) : 3 + Math.floor(R() * 5);
    for (let i = 0; i < ns; i++) { const u = (R() - 0.5) * (kind === 'can' ? 0.9 : 1.5), v = 0.3 + R() * 0.55; spots.push([cx + u * cw * 0.8, cy - ch * v * (kind === 'can' ? 0.55 : 1) * (1 - Math.abs(u) * 0.4), w * (kind === 'can' ? 0.03 + R() * 0.03 : 0.05 + R() * 0.07)]); }
    const ring = kind !== 'semsiye' && R() < 0.45 ? [cx, cy + h * (0.18 + R() * 0.1), sw * 2.2] : null;   // etek halkası
    subs.push({ stem, cap, gill, edge, spots, cx, cy, cw, ch, ring, kind });
  }
  const sw0 = o.w * 0.2, babies = [];
  for (let i = 0; i < 2 + Math.floor(R() * 4); i++) { const sd = R() < 0.5 ? -1 : 1; babies.push([o.x + sd * (sw0 * 2 + R() * o.w * 0.9), o.base - 2, o.w * (0.08 + R() * 0.12), o.h * (0.06 + R() * 0.12)]); }
  return { subs, babies, cx: subs[0].cx, cy: subs[0].cy, cw: subs[0].cw, ch: subs[0].ch };
}
// katmandaki ağaçları boya (gölge siluet + kenar ışığı + yosun + biyolüminesans)
function dnPaintTrees(x, items, x0, x1, st) {
  for (const it of items) {
    if (it.x + it.ext < x0 || it.x - it.ext > x1) continue;
    if (it.mush) { dnPaintMushItem(x, it, st); continue; }
    const G = it.geo || (it.geo = dnGnarl(it)), gc = it.gc || st.glow;
    if (st.rim) { x.save(); x.translate(st.rdx, st.rdy); x.fillStyle = st.rim; for (const p of G.parts) x.fill(p); x.restore(); }
    x.fillStyle = st.body; for (const p of G.parts) x.fill(p);
    if (st.bark) {
      x.strokeStyle = it.bk && gc ? dnRgba(gc, 0.22 * (st.ga || 1)) : st.bark; x.lineWidth = st.barkW * (it.bk ? 1.3 : 1);
      if (it.bk) x.globalCompositeOperation = 'lighter';
      for (const pts of G.rims) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke(); }
      x.globalCompositeOperation = 'source-over';
    }
    if (G.moss.length) {
      x.strokeStyle = st.mossCol || st.body; x.lineWidth = st.mossW; x.beginPath();
      for (const [mx, my, len, ph] of G.moss) { x.moveTo(mx, my - 1); x.quadraticCurveTo(mx + Math.sin(ph) * 2, my + len * 0.5, mx + Math.sin(ph) * 4, my + len); }
      x.stroke();
    }
    for (const [vx, vy, len, ph, bulb] of G.vines) {
      x.strokeStyle = st.mossCol || st.body; x.lineWidth = st.mossW * 1.1;
      const ex = vx + Math.sin(ph) * 10, ey = vy + len;
      x.beginPath(); x.moveTo(vx, vy); x.quadraticCurveTo(vx + Math.sin(ph) * 16, vy + len * 0.5, ex, ey); x.stroke();
      if (bulb && gc) {
        x.globalCompositeOperation = 'lighter';
        dnG(x, gc, ex, ey, 18 * st.gs, 0.5 * st.ga); dnG(x, '#ffffff', ex, ey, 4 * st.gs, 0.5 * st.ga);
        x.globalCompositeOperation = 'source-over';
      }
    }
    if (G.fungi.length && gc) {
      x.globalCompositeOperation = 'lighter';
      for (const [fx, fy, s, sd] of G.fungi) dnG(x, gc, fx + sd * s, fy, s * 4.5, 0.4 * st.ga);
      x.globalCompositeOperation = 'source-over';
      const fcol = it.gc ? dnRgba(it.gc, 0.9) : st.fungus;
      for (const [fx, fy, s, sd] of G.fungi) {   // raf mantarı: üstü kubbe, altı ışıyan
        x.fillStyle = st.body; x.beginPath(); x.moveTo(fx - sd * 2, fy - s * 0.35); x.quadraticCurveTo(fx + sd * s * 1.3, fy - s * 0.85, fx + sd * s * 1.8, fy);
        x.quadraticCurveTo(fx + sd * s * 0.9, fy + s * 0.3, fx - sd * 2, fy + s * 0.2); x.fill();
        x.fillStyle = fcol; x.beginPath(); x.moveTo(fx, fy - s * 0.05); x.quadraticCurveTo(fx + sd * s * 1.2, fy - s * 0.2, fx + sd * s * 1.75, fy);
        x.quadraticCurveTo(fx + sd * s * 0.9, fy + s * 0.3, fx, fy + s * 0.2); x.fill();
      }
    }
  }
}
function dnPaintMushItem(x, it, st) {
  const G = it.geo || (it.geo = dnMushGeo(it)), gc = it.gc || st.glow;
  if (!st.ga) { x.fillStyle = st.body; for (const M of G.subs) { x.fill(M.stem); x.fill(M.cap); } return; }   // yalnız siluet geçişi (dış ışıma)
  for (let m = G.subs.length - 1; m >= 0; m--) {   // küçükler arkada
    const M = G.subs[m];
    if (st.rim) { x.save(); x.translate(st.rdx, st.rdy - 0.6); x.fillStyle = st.rim; x.fill(M.stem); x.fill(M.cap); x.restore(); }
    x.fillStyle = st.body; x.fill(M.stem); x.fill(M.cap);
    if (M.ring) { x.beginPath(); x.ellipse(M.ring[0], M.ring[1], M.ring[2], M.ring[2] * 0.35, 0, 0, 6.283); x.fill(); }
    const sg = x.createLinearGradient(0, M.cy, 0, it.base);   // sap: şapkanın ışığı aşağı doğru söner
    sg.addColorStop(0, dnRgba(gc, 0.3 * st.ga)); sg.addColorStop(0.5, dnRgba(gc, 0.05 * st.ga)); sg.addColorStop(1, dnRgba(gc, 0));
    x.fillStyle = sg; x.fill(M.stem);
    const cg = x.createRadialGradient(M.cx - M.cw * 0.3, M.cy - M.ch * 0.8, M.cw * 0.05, M.cx, M.cy, M.cw * 1.2);   // şapka: yumuşak parlaklık, kenara doğru koyu
    const ca = st.capA == null ? 1 : st.capA; cg.addColorStop(0, dnRgba(gc, 0.3 * st.ga * ca)); cg.addColorStop(0.5, dnRgba(gc, 0.1 * st.ga * ca)); cg.addColorStop(1, dnRgba(gc, 0.02 * ca));
    x.fillStyle = cg; x.fill(M.cap);
    x.globalCompositeOperation = 'lighter';
    dnG(x, gc, M.cx, M.cy + M.cw * 0.25, M.cw * 1.7, 0.36 * st.ga);
    x.fillStyle = dnRgba(gc, 0.6 * st.ga); x.fill(M.gill);
    x.save(); x.clip(M.gill); x.strokeStyle = dnRgba('#ffffff', 0.25 * st.ga); x.lineWidth = 1.1; x.beginPath();
    for (let i = -7; i <= 7; i++) { x.moveTo(M.cx, M.cy - M.ch * 0.1); x.lineTo(M.cx + i / 7 * M.cw, M.cy + 3); } x.stroke(); x.restore();
    x.strokeStyle = dnRgba(gc, 0.55 * st.ga); x.lineWidth = Math.max(1.2, M.cw * 0.035); x.stroke(M.edge);   // arkadan ışık alan şapka kenarı
    x.save(); x.clip(M.cap); x.strokeStyle = dnRgba(gc, 0.22 * st.ga * (st.capA == null ? 1 : st.capA)); x.lineWidth = M.cw * 0.12; x.stroke(M.cap); x.restore();
    if (M.ring) { x.strokeStyle = dnRgba(gc, 0.35 * st.ga); x.lineWidth = 1.2; x.beginPath(); x.ellipse(M.ring[0], M.ring[1], M.ring[2], M.ring[2] * 0.35, 0, 0, Math.PI); x.stroke(); }
    for (const [sx, sy, r] of M.spots) { dnG(x, gc, sx, sy, r * 3.2, 0.4 * st.ga); x.fillStyle = dnRgba('#fff0fa', 0.3 * st.ga); x.beginPath(); x.ellipse(sx, sy, r * 0.8, r * 0.55, 0, 0, 6.283); x.fill(); }
    x.globalCompositeOperation = 'source-over';
  }
  x.fillStyle = st.body;
  for (const [bx, by, bw, bh] of G.babies) { x.fillRect(bx - bw * 0.18, by - bh, bw * 0.36, bh); x.beginPath(); x.ellipse(bx, by - bh, bw, bw * 0.6, 0, Math.PI, 6.283); x.fill(); }
  x.globalCompositeOperation = 'lighter';
  for (const [bx, by, bw, bh] of G.babies) { dnG(x, gc, bx, by - bh, bw * 2.2, 0.4 * st.ga); x.fillStyle = dnRgba(gc, 0.6 * st.ga); x.beginPath(); x.ellipse(bx, by - bh, bw * 0.9, bw * 0.22, 0, 0, Math.PI); x.fill(); }
  x.globalCompositeOperation = 'source-over';
}
function dnMakeTrees(seed, from, to, gapMin, gapMax, f, fn) {
  const R = rng(seed), a = []; let x = from + R() * gapMin;
  while (x < to) {
    const o = fn(R, x, dnRegW(dnLW(x, f), null));
    if (o) { o.seed = Math.floor(R() * 1e9); o.ext = o.ext || o.w * 14; a.push(o); }
    x += gapMin + R() * (gapMax - gapMin);
  }
  return a;
}
const dnTop = (w, k) => { let b = null, bv = 0; for (const n in w) if (w[n] > bv) { bv = w[n]; b = n; } return b; };
const DN_SAKLI_C = '#c9a2ff';

// 1) en uzak: Gris'ten zarif sade şekiller (suluboya tepeler, ince ağaçlar, kemerler) – bölgeden bağımsız fon
const DN_BG = { gris: dnBounds(0.07, 0.07 * DN_FYK, 120, 660), far: dnBounds(0.22, 0.22 * DN_FYK, -150, 660),
  mid: dnBounds(0.45, 0.45 * DN_FYK, -150, 660), near: dnBounds(0.72, 0.72 * DN_FYK, -160, 720), can: dnBounds(0.86, 0.16, -110, 420) };
const DN_HILL = (lx, k) => k ? 418 + Math.sin(lx * 0.0062 + 3) * 30 + Math.sin(lx * 0.017 + 1) * 10 : 372 + Math.sin(lx * 0.0041 + 1) * 34 + Math.sin(lx * 0.012) * 14;
const DN_GRIS = (() => { const R = rng(41), a = []; let x = -100; while (x < DN_LW * 0.07 + 1600) { a.push({ x, h: 120 + R() * 150, w: 9 + R() * 9, k: R(), tilt: (R() - 0.5) * 0.06 }); x += 60 + R() * 110; } return a; })();
function dnPaintGris(x, x0, x1, t, L) {
  for (let k = 0; k < 2; k++) {
    const top = dcAt(k ? 'gris' : 'haze', t, 1), bot = dcAt('haze', t, 1);
    const gr = x.createLinearGradient(0, 330, 0, 640); gr.addColorStop(0, top); gr.addColorStop(0.6, bot);
    x.fillStyle = gr; x.globalAlpha = k ? 0.9 : 0.7;
    x.beginPath(); x.moveTo(x0, L.y1);
    for (let lx = x0; lx <= x1 + 8; lx += 8) x.lineTo(lx, DN_HILL(lx, k));
    x.lineTo(x1 + 8, L.y1); x.fill();
    x.strokeStyle = dcAt('far', t, 0.25); x.lineWidth = 1.2; x.beginPath();   // ıslak kenar
    for (let lx = x0; lx <= x1 + 8; lx += 8) lx === x0 ? x.moveTo(lx, DN_HILL(lx, k)) : x.lineTo(lx, DN_HILL(lx, k)); x.stroke();
  }
  x.globalAlpha = 1;
  const col = dcAt('gris', t, 0.85), edge = dcAt('far', t, 0.3);
  for (const it of DN_GRIS) {
    if (it.x < x0 - 60 || it.x > x1 + 60) continue;
    const by = DN_HILL(it.x, 1) + 6, ty = by - it.h;
    x.fillStyle = col; x.strokeStyle = edge; x.lineWidth = 1;
    x.beginPath();
    if (it.k < 0.62) {          // ince gövde + uzun damla taç
      x.moveTo(it.x - 1.6, by); x.lineTo(it.x + it.tilt * it.h - 0.5, ty); x.lineTo(it.x + it.tilt * it.h + 0.5, ty); x.lineTo(it.x + 1.6, by); x.fill();
      const cx = it.x + it.tilt * it.h, ch = it.h * 0.42;
      x.beginPath(); x.moveTo(cx, ty - ch); x.bezierCurveTo(cx + it.w, ty - ch * 0.5, cx + it.w * 0.8, ty + ch * 0.12, cx, ty + ch * 0.2);
      x.bezierCurveTo(cx - it.w * 0.8, ty + ch * 0.12, cx - it.w, ty - ch * 0.5, cx, ty - ch); x.fill(); x.stroke();
    } else if (it.k < 0.82) {   // servi üçgeni
      x.moveTo(it.x, ty - it.h * 0.25); x.quadraticCurveTo(it.x + it.w * 0.9, by - it.h * 0.3, it.x + it.w * 0.5, by); x.lineTo(it.x - it.w * 0.5, by);
      x.quadraticCurveTo(it.x - it.w * 0.9, by - it.h * 0.3, it.x, ty - it.h * 0.25); x.fill(); x.stroke();
    } else {                    // ince kemer
      x.lineWidth = 4; x.strokeStyle = col; const r = it.w * 3.2;
      x.arc(it.x, by, r, Math.PI, 0); x.stroke();
      x.lineWidth = 1; x.strokeStyle = edge; x.beginPath(); x.arc(it.x, by, r + 2, Math.PI, 0); x.stroke();
    }
  }
}
// 2) uzak orman (sisli, ince budaklı ağaçlar; gölde ve açıklıkta seyrek)
const DN_FAR = dnMakeTrees(51, -300, DN_LW * 0.22 + 2600, 80, 175, 0.22, (R, x, w) => {
  if (R() > w.patika + w.pofuduk + w.dallar + w.sakli + w.gol * 0.45 + w.aciklik * 0.35) return null;
  return { x, base: 520, top: DN_BG.far[0] + 10, w: 6 + R() * 9, roots: R() < 0.6, br: 1 + Math.floor(R() * 3), brMin: 40, brMax: 250, moss: 5, vines: false, gc: w.sakli > 0.5 ? DN_SAKLI_C : null };
});
const DN_SPORE_FAR = [];
function dnPaintFar(x, x0, x1, t) {
  const gr = x.createLinearGradient(0, -100, 0, 520);
  gr.addColorStop(0, dcAt('mid', t)); gr.addColorStop(0.45, dcAt('far', t)); gr.addColorStop(1, dcAt('haze', t));
  dnPaintTrees(x, DN_FAR, x0, x1, { body: gr, rim: dcAt('rim', t, 0.18), rdx: 1.2, rdy: 0, mossW: 1, glow: dcol('bio', t), ga: 0.5, gs: 0.7, fungus: dcAt('bio', t, 0.5) });
  const R = rng(Math.floor(x0) * 7 + 3); x.globalCompositeOperation = 'lighter';   // uzak biyolüminesan sporlar
  for (let i = 0; i < 26; i++) dnG(x, i % 4 ? dcol('bio', t) : dcol('warm', t), x0 + R() * (x1 - x0), 60 + R() * 300, 3 + R() * 6, 0.25 + R() * 0.3);
  x.globalCompositeOperation = 'source-over';
}
// 3) orta orman (kök yayılımlı gövdeler; dallarda dev yatay dallar, çayırda dev mantarlar, gölün ortası açık)
const DN_MID = dnMakeTrees(63, -300, DN_LW * 0.45 + 2600, 170, 300, 0.45, (R, x, w) => {
  if (R() > w.patika + w.pofuduk * 0.8 + w.dallar + w.sakli + w.gol * 0.12 + w.aciklik * 0.3) return null;
  const top = dnTop(w);
  if (top === 'pofuduk' && R() < 0.55) return { x, mush: true, base: 600, h: 150 + R() * 140, w: 50 + R() * 50, ext: 200, gc: R() < 0.35 ? '#ffb0e0' : R() < 0.45 ? '#c9a2ff' : R() < 0.5 ? '#ffd890' : null };
  const dal = top === 'dallar' || top === 'sakli';
  return { x, base: 585, top: DN_BG.mid[0] + 10, w: (dal ? 20 : 15) + R() * 15, roots: true, br: dal ? 4 + Math.floor(R() * 2) : 2 + Math.floor(R() * 2), brMin: dal ? -40 : -20, brMax: dal ? 300 : 250,
    brLen: dal ? 1.7 : 1, flat: dal, moss: dal ? 16 : 9, vines: true, vineMax: dal ? 380 : 330, fungi: R() < (dal ? 0.8 : 0.45) ? 1 + (dal ? 1 : 0) : 0, fMin: 120, fMax: 320,
    gc: top === 'sakli' ? DN_SAKLI_C : top === 'pofuduk' && R() < 0.5 ? '#ffb0e0' : null, bk: dal };
});
function dnPaintMid(x, x0, x1, t) {
  const gr = x.createLinearGradient(0, -100, 0, 590);
  gr.addColorStop(0, dcAt('near', t)); gr.addColorStop(0.5, dcAt('mid', t)); gr.addColorStop(1, dcAt('far', t));
  dnPaintTrees(x, DN_MID, x0, x1, { body: gr, rim: dcAt('rim', t, 0.32), rdx: 1.6, rdy: -0.4, bark: dcAt('rim', t, 0.06), barkW: 1.6, mossW: 1.1, glow: dcol('bio', t), ga: 0.8, gs: 1, fungus: dcAt('bio', t, 0.85) });
}
// 4) yakın dev gövdeler (neredeyse siyah, belirgin kenar ışığı; gölde ve açıklığın ortasında yok)
const DN_NEAR = dnMakeTrees(77, -400, DN_LW * 0.72 + 2600, 560, 860, 0.72, (R, x, w) => {
  if (R() > w.patika + w.pofuduk * 0.7 + w.dallar + w.sakli + w.aciklik * 0.15) return null;
  const top = dnTop(w), dal = top === 'dallar' || top === 'sakli';
  if (top === 'pofuduk' && R() < 0.5) return { x, mush: true, noCan: true, base: 720, h: 260 + R() * 120, w: 90 + R() * 50, ext: 260, gc: R() < 0.45 ? '#ffb0e0' : R() < 0.4 ? '#c9a2ff' : null };
  return { x, base: 700, top: DN_BG.near[0] + 10, w: 38 + R() * 22, roots: true, br: dal ? 3 : 1 + Math.floor(R() * 2), brMin: dal ? -100 : -60, brMax: dal ? 220 : 90, brLen: dal ? 1.1 : 0.7, flat: dal,
    moss: dal ? 22 : 14, vines: true, vineMax: 300, fungi: 1 + Math.floor(R() * 2), fMin: 140, fMax: 300, gc: top === 'sakli' ? DN_SAKLI_C : null, bk: dal };
});
function dnPaintNear(x, x0, x1, t) {
  const body = dcAt('near', t);
  dnPaintTrees(x, DN_NEAR, x0, x1, { body: dcAt('rim', t, 0.07), rim: null, mossW: 1.4 });   // yumuşak dış ışıma
  for (const it of DN_NEAR) { if (it.mush || it.x + it.ext < x0 || it.x - it.ext > x1) continue; x.save(); x.translate(-2.5, 0); x.fillStyle = dcAt('rim', t, 0.05); for (const p of it.geo.parts) x.fill(p); x.restore(); }
  dnPaintTrees(x, DN_NEAR, x0, x1, { body, rim: dcAt('rim', t, 0.55), rdx: 2, rdy: -0.5, bark: dcAt('rim', t, 0.05), barkW: 2.2, mossW: 1.4, capA: 0.45, glow: dcol('bio', t), ga: 1, gs: 1.2, fungus: dcAt('bio', t, 0.95) });
}
// 5) tepe yaprak örtüsü (çerçeve) + sarkan ışıklı sarmaşıklar; gölde ve açıklıkta gökyüzü açık
const DN_CAN = (() => {
  const R = rng(91), a = []; let x = -200;
  while (x < DN_LW * 0.86 + 2600) {
    const w = dnRegW(dnLW(x, 0.86), null), keep = w.patika + w.pofuduk + w.dallar + w.sakli + w.gol * 0.05 + w.aciklik * 0.05, dal = w.dallar + w.sakli;
    const r = (40 + R() * 55) * (0.6 + 0.4 * keep), cy = -30 + R() * 50 - (1 - keep) * 70 - dal * 15, s = Math.floor(R() * 1e9);
    if (keep > 0.08) a.push({ x, y: cy, r, seed: s, gc: w.sakli > 0.5 ? DN_SAKLI_C : null });
    x += r * (0.8 + R() * 0.6);
  }
  return a;
})();
function dnCanGeo(c) {
  const R = rng(c.seed), body = new Path2D(), vines = [], moss = [], twigs = [];
  body.ellipse(c.x, c.y, c.r * 0.9, c.r * 0.55, 0, 0, 6.283);
  for (let i = 0; i < 3; i++) { const ox = (R() - 0.5) * c.r * 1.3, oy = R() * c.r * 0.35, rr = c.r * (0.35 + R() * 0.25); body.moveTo(c.x + ox + rr, c.y + oy); body.ellipse(c.x + ox, c.y + oy, rr, rr * 0.7, 0, 0, 6.283); }
  body.rect(c.x - c.r, DN_BG.can[0] - 100, c.r * 2, c.y - DN_BG.can[0] + 100);
  const n = Math.floor(c.r * 0.55);
  for (let i = 0; i < n; i++) {   // yuvarlak, geniş yapraklar (sivri "diş" gibi durmasın)
    const a = R() * 6.283, d = c.r * (0.5 + R() * 0.45), lx = c.x + Math.cos(a) * d * 0.85, ly = c.y + Math.sin(a) * d * 0.5 + (Math.sin(a) > 0 ? c.r * 0.12 : 0);
    let ang = a + (R() - 0.5) * 1.4; if (Math.sin(a) > 0) ang = lerp(ang, Math.PI / 2, 0.25);
    const len = 10 + R() * 12; dnLeaf(body, lx, ly, len, len * (0.42 + R() * 0.15), ang);
  }
  if (R() < 0.5) twigs.push(dnTaper([c.x - c.r, c.y + c.r * 0.25, c.x - c.r * 0.3, c.y + c.r * 0.6, c.x + c.r * 0.4, c.y + c.r * 0.2, c.x + c.r * 1.3, c.y - c.r * 0.1], 9, 2));
  const nv = Math.floor(R() * 3.2);
  for (let i = 0; i < nv; i++) vines.push([c.x + (R() - 0.5) * c.r * 1.2, c.y + c.r * 0.4, 40 + R() * 190, R() * 6, R() < 0.7]);
  for (let i = 0; i < 6 + R() * 8; i++) moss.push([c.x + (R() - 0.5) * c.r * 1.6, c.y + c.r * (0.35 + R() * 0.15), 8 + R() * 30, R() * 6]);
  return { body, vines, moss, twigs };
}
function dnPaintCanopy(x, x0, x1, t) {
  const body = dcAt('canopy', t), rim = dcAt('rim', t, 0.4), glowc = dcol('bio', t);
  const vis = DN_CAN.filter(c => c.x + c.r * 2 > x0 && c.x - c.r * 2 < x1);
  for (const c of vis) c.geo || (c.geo = dnCanGeo(c));
  x.save(); x.translate(0, 2.2); x.fillStyle = rim; for (const c of vis) { x.fill(c.geo.body); for (const p of c.geo.twigs) x.fill(p); } x.restore();
  x.save(); x.translate(0, 6); x.fillStyle = dcAt('rim', t, 0.06); for (const c of vis) x.fill(c.geo.body); x.restore();
  x.fillStyle = body; for (const c of vis) { x.fill(c.geo.body); for (const p of c.geo.twigs) x.fill(p); }
  x.strokeStyle = body; x.lineWidth = 1.2; x.beginPath();
  for (const c of vis) for (const [mx, my, len, ph] of c.geo.moss) { x.moveTo(mx, my - 2); x.quadraticCurveTo(mx + Math.sin(ph) * 2, my + len * 0.5, mx + Math.sin(ph) * 3, my + len); }
  x.stroke();
  for (const c of vis) for (const [vx, vy, len, ph, bulb] of c.geo.vines) {
    const ex = vx + Math.sin(ph) * 8, ey = vy + len;
    x.strokeStyle = body; x.lineWidth = 1.5; x.beginPath(); x.moveTo(vx, vy); x.quadraticCurveTo(vx + Math.sin(ph) * 14, vy + len * 0.5, ex, ey); x.stroke();
    const lp = new Path2D(); let side = 1;
    for (let u = 0.2 + (ph % 0.1); u < 0.95; u += 0.09 + (Math.sin(u * 40 + ph) + 1) * 0.04) { side = -side; const px = lerp(vx, ex, u) + Math.sin(ph) * 14 * 2 * u * (1 - u), py = vy + len * u; dnLeaf(lp, px, py, 5 + (1 - u) * 5, 2.2, side > 0 ? 0.6 + Math.sin(u * 9) * 0.3 : Math.PI - 0.6 + Math.sin(u * 7) * 0.3); }
    x.fillStyle = body; x.fill(lp);
    if (bulb) {
      x.globalCompositeOperation = 'lighter';
      dnG(x, c.gc || glowc, ex, ey + 3, 26, 0.55); dnG(x, '#ffffff', ex, ey + 3, 5, 0.6);
      x.globalCompositeOperation = 'source-over';
    }
  }
}

const DN_LAYERS = {
  gris: dnLayer({ f: 0.07, fy: 0.07 * DN_FYK, q: 0.3, y0: DN_BG.gris[0], y1: DN_BG.gris[1], paint: dnPaintGris }),
  far: dnLayer({ f: 0.22, fy: 0.22 * DN_FYK, q: 0.42, y0: DN_BG.far[0], y1: DN_BG.far[1], paint: dnPaintFar }),
  mid: dnLayer({ f: 0.45, fy: 0.45 * DN_FYK, q: 0.55, y0: DN_BG.mid[0], y1: DN_BG.mid[1], paint: dnPaintMid }),
  near: dnLayer({ f: 0.72, fy: 0.72 * DN_FYK, q: 0.62, y0: DN_BG.near[0], y1: DN_BG.near[1], paint: dnPaintNear }),
  can: dnLayer({ f: 0.86, fy: 0.16, q: 0.6, y0: DN_BG.can[0], y1: DN_BG.can[1], paint: dnPaintCanopy }),
};
// ışık huzmeleri (orta derinlikte)
const DN_SHAFTS = (() => { const R = rng(13), a = []; let x = -200; while (x < DN_LW * 0.55 + 2000) { a.push({ x, w: 50 + R() * 120, a: 0.5 + R() * 0.5, ph: R() * 6, ang: 0.26 + R() * 0.16 }); x += 140 + R() * 260; } return a; })();
const DN_LAKEY = 430;   // uzak göl kıyısı (uzak katman uzayında)

// ── çizim: arka plan ──
function dnFog(y, h, a, key, f, fy) {   // y: katman uzayında (f paralaks)
  const yy = (y - 110 * f - dnDY() * (fy == null ? f * DN_FYK : fy)) * S, hh = h * S;
  if (yy + hh / 2 < 0 || yy - hh / 2 > H) return;
  const gr = g.createLinearGradient(0, yy - hh / 2, 0, yy + hh / 2);
  gr.addColorStop(0, dc(key, 0)); gr.addColorStop(0.5, dc(key, a)); gr.addColorStop(1, dc(key, 0));
  g.fillStyle = gr; g.fillRect(0, yy - hh / 2, W, hh);
}
function dnLightSrc() {   // uzaktaki ışık kaynağı (ay/şafak), ekran birimi
  const u = clamp(cam.x / Math.max(1, DN_LW - VW), 0, 1);
  return [VW * (0.72 - 0.34 * u), 132 - 110 * 0.05 - dnDY() * 0.04];
}
function drawBackground(tm) {
  dnBudget = 1;
  dnRegW(cam.x + VW / 2, cam.y + H / S * 0.55, DNR);
  dnOpen = clamp(DNR.gol + DNR.aciklik, 0, 1);
  dnBlaze = TREE && TREE.done && TREE.litT ? smooth(clamp((now - TREE.litT) / 2.4, 0, 1)) : 0;
  if (Math.abs(skyLight - light) > 0.02 || dnSky.width !== Math.max(2, Math.round(W / 3)) || dnSky.height !== Math.max(2, Math.round(H / 3))) dnPaintSky();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.drawImage(dnSky, 0, 0, W, H);
  // bölge tonu (gölde derin mavi, çayırda pembe-mor, saklı yolda mor, dallarda yeşil-turkuaz)
  const tint = (col, a) => { if (a > 0.004) { g.fillStyle = dnRgba(col, a); g.fillRect(0, 0, W, H); } };
  g.globalCompositeOperation = 'soft-light';
  tint('#ff9ad8', DNR.pofuduk * 0.22); tint('#2a5cff', DNR.gol * 0.28); tint('#b070ff', DNR.sakli * 0.35); tint('#40ffc8', DNR.dallar * 0.16); tint('#ffd080', DNR.aciklik * (0.08 + light * 0.2));
  g.globalCompositeOperation = 'source-over';
  const [lsx, lsy] = dnLightSrc(), sx = lsx * S, sy = lsy * S;
  // yıldızlar (açık gökyüzünde; şafakta söner)
  const sa = dnOpen * (1 - light * 0.75) + 0.12 * (1 - light);
  if (sa > 0.02) {
    g.globalCompositeOperation = 'lighter';
    const ox = cam.x * 0.012, oy = dnDY() * 0.02;
    for (const s of DN_STARS) {
      const x = ((s.x * VW * 1.2 - ox) % (VW * 1.2) + VW * 1.2) % (VW * 1.2) - VW * 0.1, y = s.y * H / S - oy;
      const tw = 0.55 + 0.45 * Math.sin(tm * s.sp + s.ph), r = (1.6 + s.s * 2.2) * S;
      g.globalAlpha = sa * tw * (0.35 + 0.25 * s.s); g.drawImage(s.s > 1.6 ? dnStar(s.c < 0.7 ? '#dff4ff' : '#ffe8c0') : glow(s.c < 0.7 ? '#dff4ff' : '#ffe8c0'), x * S - r * (s.s > 1.6 ? 3 : 1), y * S - r * (s.s > 1.6 ? 3 : 1), r * (s.s > 1.6 ? 6 : 2), r * (s.s > 1.6 ? 6 : 2));
    }
    g.globalAlpha = 1;
  }
  // ışık kaynağı: yumuşak hale; açık gökyüzünde ay diski
  g.globalCompositeOperation = 'lighter';
  dglow(dq('hazeHi'), sx, sy, H * 0.95, 0.22 + light * 0.14 + dnOpen * 0.06);
  dglow(dq('warm'), sx, sy, H * 0.32, 0.28 + light * 0.12);
  dglow('#ffffff', sx, sy, H * 0.07, 0.3 + light * 0.15);
  const ma = clamp(DNR.gol * 1.1 + DNR.aciklik * (1 - light) * 0.8, 0, 1) * (1 - light * 0.5);
  if (ma > 0.02) {
    g.globalCompositeOperation = 'source-over'; const mr = 30 * S;
    g.globalAlpha = ma * 0.95; g.drawImage(dnMoon(), sx - mr, sy - mr, mr * 2, mr * 2); g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter'; dglow('#cfe8ff', sx, sy, 110 * S, 0.35 * ma);
  }
  g.globalCompositeOperation = 'source-over';
  dnDrawLayer(DN_LAYERS.gris);
  dnFog(470, 300, 0.55, 'haze', 0.07);
  dnDrawLayer(DN_LAYERS.far);
  g.fillStyle = dc('haze', 0.12); g.fillRect(0, 0, W, H);
  dnFog(490, 260, 0.5, 'haze', 0.22);
  dnLake(tm, sx);
  g.globalCompositeOperation = 'lighter';
  dglow(dq('hazeHi'), sx, sy + H * 0.06, H * 0.8, 0.2 - light * 0.04);   // ışık kaynağının sisteki saçılması
  dglow(dq('warm'), sx, sy, H * 0.3, 0.16 - light * 0.04);
  const oyP = 110 * 0.35 + dnDY() * 0.35 * DN_FYK;   // orta derinlikte ışık cepleri
  for (let i = 0, n = Math.ceil(DN_LW * 0.35 / 520) + 3; i < n; i++) {
    const lx = i * 520 + 180 - cam.x * 0.35; if (lx < -400 || lx > VW + 400) continue;
    dglow(i % 3 === 1 ? dq('warm') : DNR.sakli > 0.4 ? '#b88aff' : dq('bio'), lx * S, (170 + (i * 67) % 120 - oyP) * S, (200 + (i * 53) % 100) * S, (0.13 + 0.04 * Math.sin(tm * 0.4 + i)) * (0.8 + light * 0.4));
  }
  // hacimsel ışık huzmeleri (dallarda ve açıklıkta güçlü, gölde zayıf)
  const shK = (1 + DNR.dallar * 0.5 + DNR.aciklik * 0.3 - DNR.gol * 0.55) * (1 + dnBlaze * 0.8);
  const shaft = dnShaft(dnBlaze > 0.3 ? '#ffe6b0' : dq('warm')), f = 0.5, ox = cam.x * f, oyS = 110 * f + dnDY() * f * DN_FYK;
  for (const s of DN_SHAFTS) {
    const px = s.x - ox; if (px < -300 || px > VW + 300) continue;
    const a = 0.6 * s.a * (0.6 + 0.4 * Math.sin(tm * 0.33 + s.ph)) * (0.75 + 0.5 * light) * shK;
    g.save(); g.setTransform(S, 0, 0, S, px * S, (-260 - oyS) * S); g.rotate(s.ang + Math.sin(tm * 0.12 + s.ph) * 0.02);
    g.globalAlpha = Math.min(1, a); g.drawImage(shaft, -s.w / 2, 0, s.w, 820); g.restore();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.globalAlpha = clamp(1 - DNR.gol * 0.6, 0, 1); dnDrawLayer(DN_LAYERS.mid);
  g.globalAlpha = 1; dnFog(560, 220, 0.38, 'haze', 0.45);
  g.globalAlpha = clamp(1 - DNR.gol * 1.15, 0, 1); if (g.globalAlpha > 0.01) dnDrawLayer(DN_LAYERS.near); g.globalAlpha = 1;
  g.globalCompositeOperation = 'lighter';   // önde ikinci, daha soluk huzme katmanı
  const ox2 = cam.x * 0.8, oy2 = 110 * 0.8 + dnDY() * 0.8 * DN_FYK;
  for (let i = 0; i < DN_SHAFTS.length; i += 3) {
    const s = DN_SHAFTS[i], px = s.x * 1.3 + 90 - ox2; if (px < -300 || px > VW + 300) continue;
    g.save(); g.setTransform(S, 0, 0, S, px * S, (-280 - oy2) * S); g.rotate(s.ang + 0.04);
    g.globalAlpha = Math.min(1, 0.22 * s.a * (0.5 + 0.5 * Math.sin(tm * 0.27 + s.ph * 2)) * (0.8 + 0.4 * light) * shK);
    g.drawImage(shaft, -s.w * 0.8, 0, s.w * 1.6, 780); g.restore();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  dnDrawLayer(DN_LAYERS.can);
  dnColourBloom();
  if (dnBlaze > 0) {   // final: orman alevlenir (sıcak altın ışık her yerden)
    g.globalCompositeOperation = 'lighter';
    const tx = (TREE.x - cam.x) * S, ty = (TREE.y - 330 - cam.y) * S;
    dglow('#ffd890', tx, ty, H * 1.6, 0.28 * dnBlaze); dglow('#fff2cc', tx, ty, H * 0.6, 0.22 * dnBlaze);
    g.globalCompositeOperation = 'source-over';
  }
  // okunurluk: karakterlerin arkasında çok hafif, yumuşak bir gölge
  const px = (P.x - cam.x) * S, py = (P.y - 34 - cam.y) * S;
  dglow('#020610', px, py, 120 * S, 0.22 + light * 0.18);
}
// Gris dokunuşu: açılan her çiçeğin çevresinde orman yavaşça rengini geri alır ve öyle kalır ('color' karışımı: parlaklık aynı,
// ton ve doygunluk çiçeğin bölgesine göre altın-şeftali / pembe / yeşil-turkuaz / mor; yayılarak büyür)
const DN_BLOOMHUE = { patika: ['#ffb060', '#7fe0a0'], pofuduk: ['#ff7ac8', '#ffc070'], gol: ['#40e0c0', '#a0a0ff'], dallar: ['#90e070', '#ffc060'], sakli: ['#c080ff', '#ff90d0'], aciklik: ['#ffc050', '#ff8890'] };
function dnColourBloom() {
  let any = false;
  for (const f of DN_FLW) {
    if (!f.done || !(f.bt >= 0)) continue;
    const e = now - f.bt, grow = smooth(clamp(e / 7, 0, 1)), r = (220 + 560 * grow) * S, x = (f.x - cam.x) * S, y = (f.y - 120 - cam.y) * S;
    if (x < -r || x > W + r) continue;
    const hue = f.dnHue || (f.dnHue = DN_BLOOMHUE[dnRegCol(f.x)] || DN_BLOOMHUE.patika), a = smooth(clamp(e / 2.5, 0, 1)) * (1 - dnBlaze * 0.6);
    if (!any) { g.globalCompositeOperation = 'color'; any = true; }
    dglow(hue[0], x, y, r, 0.7 * a); dglow(hue[1], x + r * 0.35, y - r * 0.25, r * 0.6, 0.45 * a);
  }
  if (any) {
    g.globalCompositeOperation = 'lighter';   // biraz sıcak ışık da kalır
    for (const f of DN_FLW) { if (!f.done || !(f.bt >= 0)) continue; const e = now - f.bt, x = (f.x - cam.x) * S, y = (f.y - 60 - cam.y) * S; if (x < -600 * S || x > W + 600 * S) continue;
      dglow(f.dnHue[0], x, y, 380 * S * (0.6 + 0.4 * smooth(clamp(e / 7, 0, 1))), 0.07 * smooth(clamp(e / 2.5, 0, 1))); }
    g.globalCompositeOperation = 'source-over';
  }
}
// uzak göl yüzeyi: uzak ağaçların ayna görüntüsü, ay yolu, sis (yalnız göl bölgesinde)
function dnLake(tm, msx) {
  const w = DNR.gol; if (w < 0.01) return;
  const L = DN_LAYERS.far, hy = Math.round((DN_LAKEY - dnOY(L)) * S);
  if (hy >= H) return;
  g.globalAlpha = w;
  const gr = g.createLinearGradient(0, hy, 0, H);
  gr.addColorStop(0, dc('hazeHi', 0.95)); gr.addColorStop(0.04, dc('haze')); gr.addColorStop(0.35, dc('water')); gr.addColorStop(1, '#040b20');
  g.fillStyle = gr; g.fillRect(0, hy, W, H - hy);
  g.save(); g.beginPath(); g.rect(0, hy, W, H - hy); g.clip();
  g.setTransform(1, 0, 0, -0.9, 0, hy * 1.9);   // uzak ağaçların yansıması (biraz basık)
  g.globalAlpha = w * 0.38; dnDrawLayer(L, true);
  g.restore();
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'lighter';
  const sh = H - hy;
  for (let i = 0; i < 26; i++) {   // ay yolu: titreşen pırıltılar
    const u = Math.pow(i / 26, 1.6), y = hy + 3 + u * sh * 0.9, ww = (6 + u * 60) * S * (0.6 + 0.4 * Math.sin(tm * 2.1 + i * 1.7));
    dnEG('#dff0ff', msx + Math.sin(tm * 0.8 + i * 2.3) * (4 + u * 30) * S, y, ww, (1.2 + u * 2) * S, w * (0.5 - u * 0.25) * (0.6 + 0.4 * Math.sin(tm * 3 + i)));
  }
  g.strokeStyle = dc('rim', 0.12 * w); g.lineWidth = Math.max(1, S * 0.8); g.beginPath();
  for (let i = 0; i < 22; i++) {   // yüzeyde ince ışık çizgileri
    const u = ((i * 0.618) % 1), y = hy + 4 + u * u * sh * 0.8, x = ((i * 173 + tm * (8 + i % 5 * 3) * (i % 2 ? 1 : -1)) % (VW + 200) + VW + 200) % (VW + 200) - 100;
    g.moveTo(x * S, y); g.lineTo((x + 20 + u * 60) * S, y);
  }
  g.stroke();
  dnEG(dq('hazeHi'), W * 0.5, hy, W * 0.7, 14 * S, 0.35 * w);   // kıyı sisi
  g.globalCompositeOperation = 'source-over';
}

// ── zemin geometrisi (yuvarlatılmış köşeler) – bir kez kurulur ──
function dnGroundPath() {
  const p = new Path2D(), G = BOLUM.gol;
  let c = 0;
  while (c < COLS) {
    if (topOf(c) >= ROWS) { c++; continue; }
    const pts = [], a = c;
    while (c < COLS && topOf(c) < ROWS) { const y = topOf(c) * T; pts.push([c * T, y], [(c + 1) * T, y]); c++; }
    const bot = DN_LH + 340, P2 = [[a * T, bot], ...pts, [c * T, bot]];
    p.moveTo(P2[0][0], P2[0][1]);
    for (let i = 1; i < P2.length - 1; i++) {
      const [x0, y0] = P2[i - 1], [x1, y1] = P2[i], [x2, y2] = P2[i + 1];
      if ((x0 === x1 && x1 === x2) || (y0 === y1 && y1 === y2)) continue;
      p.arcTo(x1, y1, x2, y2, G && x1 >= G.x0 - T && x1 <= G.x1 + T ? 22 : 14);
    }
    p.lineTo(P2[P2.length - 1][0], P2[P2.length - 1][1]); p.closePath();
  }
  return p;
}
const DN_GPATH = dnGroundPath();
// sütun bilgisi: bölge, yosun rengi
const DN_COLR = []; { const R = rng(5); for (let c = 0; c < COLS; c++) { const t = topOf(c); DN_COLR.push(dnRegPick(c * T + T / 2, t < ROWS ? t * T - 30 : null, R)); } }
const dnRegCol = x => DN_COLR[clamp(Math.floor(x / T), 0, COLS - 1)];
// yüzen adacıklar / dallar (ızgaradaki 2'ler)
const DN_PLATS = [];
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (grid[y][x] === 2 && (x === 0 || grid[y][x - 1] !== 2)) {
  let b = x; while (b + 1 < COLS && grid[y][b + 1] === 2) b++;
  const x0 = x * T, x1 = (b + 1) * T, yy = y * T, R = rng(x * 31 + y), path = new Path2D();
  const rw = dnRegW((x0 + x1) / 2, yy), dal = rw.dallar + rw.sakli > 0.5, sak = rw.sakli > 0.5;
  const roots = [], moss = [], cracks = [], lich = [], twigs = new Path2D(), leaves = new Path2D();
  if (!dal) {   // adacık: altı sivri toprak, kökler
    const pts = [[x0 - 3, yy + 2], [x0 + 5, yy - 0.3], [x1 - 5, yy - 0.3], [x1 + 3, yy + 2]];
    const n = (b - x + 1) * 3;
    for (let i = 0; i <= n; i++) { const u = i / n, d = Math.sin(u * Math.PI); pts.push([lerp(x1 + 1, x0 - 1, u), yy + 6 + d * (24 + R() * 16) + (i % 2 ? 5 : 0)]); }
    dnSmooth(path, pts);
    for (let v = 0; v < (b - x + 1) * 3; v++) roots.push([x0 + 8 + R() * (x1 - x0 - 16), 12 + R() * 34, R() * 6, R() < 0.6]);
  } else {      // yosunlu dev dal: düz üst, sarkık alt, sivri uçlar, ışıyan kabuk çatlakları
    const e0 = x0 - 16, e1 = x1 + 16, top = [], bot = [];
    top.push([e0, yy + 6], [x0 + 2, yy - 0.5]);
    for (let xx = x0 + 22; xx < x1 - 10; xx += 22) top.push([xx, yy - 0.5 - R() * 0.8]);
    top.push([x1 - 2, yy - 0.5], [e1, yy + 6]);
    const n = Math.max(4, Math.round((e1 - e0) / 18));
    for (let i = 0; i <= n; i++) { const u = i / n, th = 9 + 13 * Math.pow(Math.sin(u * Math.PI), 0.6) + (R() - 0.5) * 4; bot.push([lerp(e1 + 2, e0 - 2, u), yy + 4 + th]); }
    dnSmooth(path, top.concat(bot));
    for (let i = 0; i < 2; i++) { const pts = []; const off = 7 + i * 6; for (let xx = x0 + 6 + R() * 10; xx < x1 - 6; xx += 7 + R() * 6) pts.push([xx, yy + off + (R() - 0.5) * 3]); if (pts.length > 1) cracks.push(pts); }
    for (let xx = e0 + 8; xx < e1 - 8; xx += 5 + R() * 7) moss.push([xx, yy + 14 + R() * 8, 6 + R() * 26, R() * 6]);
    for (let xx = x0 + 6; xx < x1 - 6; xx += 10 + R() * 18) lich.push([xx, yy - 1 - R() * 2, R() * 6, 0.6 + R() * 0.8]);
    for (const sd of [-1, 1]) if (R() < 0.85) {   // uçlarda yapraklı ince dal
      const ex = sd < 0 ? e0 + 4 : e1 - 4, ty = yy + 3, l = 30 + R() * 30;
      const q = [ex, ty, ex + sd * l * 0.35, ty - 2, ex + sd * l * 0.6, ty - l * 0.35, ex + sd * l * 0.75, ty - l * (0.8 + R() * 0.4)];
      twigs.addPath(dnTaper(q, 5, 1, 8));
      for (let u = 0.4; u <= 1; u += 0.2) { const pt = dnBez(q, u); dnLeaf(leaves, pt[0], pt[1], 9 + R() * 6, 3.4, -Math.PI / 2 + (R() < 0.5 ? -1 : 1) * (0.6 + R() * 0.7)); }
    }
  }
  DN_PLATS.push({ x0, x1, y: yy, path, roots, dal, sak, moss, cracks, lich, twigs, leaves });
}
// göl kıyısında suya eğilen iki yaşlı söğüt (dünya derinliğinde): göğü çerçeveler, sarkan ışıklı sarmaşık perdeleri suya uzanır
const DN_WILLOWS = [];
if (DN_GOL) {
  const G = DN_GOL, mk = (bx, sd, seed, H0) => {
    const R = rng(seed), base = dnTopY(bx), parts = [], vines = [], crown = new Path2D(), lim = [];
    const tx = bx + sd * 150, ty = base - H0;   // gövde ucu suya doğru eğik
    const trunkP = [bx, base + 30, bx + sd * 10, base - H0 * 0.45, bx + sd * 40, base - H0 * 0.85, tx, ty];
    parts.push(dnTaper(trunkP, 46, 16, 20));
    for (const s2 of [-1, 1]) parts.push(dnTaper([bx + s2 * 10, base - 40, bx + s2 * 30, base - 10, bx + s2 * 60, base + 4, bx + s2 * (80 + R() * 20), base + 16], 26, 3, 10));
    const limbs = [[0.62, -1, 0.9], [0.8, 1, 1.25], [0.95, 1, 1.5], [0.98, -1, 0.8]];
    for (const [u, dir, len] of limbs) {
      const q = dnBez(trunkP, u), L = 170 * len, ex = q[0] + sd * dir * L * (dir > 0 ? 1 : 0.6), ey = q[1] - 50 - R() * 50;
      const p = [q[0], q[1], q[0] + sd * dir * L * 0.3, q[1] - 70, ex - sd * dir * L * 0.25, ey - 20, ex, ey + 12];
      parts.push(dnTaper(p, 20 * (1.1 - u * 0.4), 3, 14)); lim.push(p);
    }
    for (const p of lim) for (let t = 0.25; t <= 1.001; t += 0.07 + R() * 0.05) {   // sarkan sarmaşık perdesi
      const q = dnBez(p, t), len = Math.max(20, Math.min(G.su - 40 - q[1], 120 + R() * 260) * (0.55 + 0.45 * t));
      const lf = new Path2D(); let sd2 = 1;   // dinlenme hâlinde dikey şerit: sırayla sağa-sola sarkan yapraklar
      for (let u = 0.06; u < 1; u += 0.07 + R() * 0.05) { sd2 = -sd2; const l = 7 + (1 - u) * 6 + R() * 3; dnLeaf(lf, q[0], q[1] + 2 + len * u, l, l * 0.38, Math.PI / 2 + sd2 * (0.55 + R() * 0.35)); }
      vines.push([q[0], q[1] + 2, len, R() * 6, R() < 0.45, R() < 0.5 ? 0 : 1, lf]);
      if (R() < 0.42) { const r = 26 + R() * 24, cx = q[0], cy = q[1] - 4; crown.moveTo(cx + r, cy); crown.ellipse(cx, cy, r, r * 0.5, 0, 0, 6.283);
        for (let j = 0; j < 2; j++) { const bx = cx + (R() - 0.5) * r, by = cy - r * (0.25 + R() * 0.2), rr = r * (0.45 + R() * 0.2); crown.moveTo(bx + rr, by); crown.ellipse(bx, by, rr, rr * 0.6, 0, 0, 6.283); }
        for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283 + R() * 0.3, l = 11 + R() * 9; dnLeaf(crown, cx + Math.cos(a) * r * 0.85, cy + Math.sin(a) * r * (Math.sin(a) < 0 ? 0.62 : 0.42), l, l * 0.42, lerp(a, Math.PI / 2, Math.sin(a) > 0 ? 0.55 : 0.2)); } }
    }
    return { x: bx, sd, base, parts, vines, crown, x0: Math.min(bx, tx) - 450, x1: Math.max(bx, tx) + 450, ph: R() * 6 };
  };
  const lb = G.x0 - 3.5 * T, rb = G.x1 + 4.5 * T;
  if (topOf(Math.floor(lb / T)) < ROWS) DN_WILLOWS.push(mk(lb, 1, 4711, 360));
  if (topOf(Math.floor(rb / T)) < ROWS) DN_WILLOWS.push(mk(rb, -1, 9077, 330));
}
function dnDrawWillows(tm, vx0, vx1, bio) {
  for (const w of DN_WILLOWS) {
    if (w.x1 < vx0 || w.x0 > vx1) continue;
    g.save(); g.translate(2.2 * -w.sd, -1); g.fillStyle = dc('rim', 0.4); for (const q of w.parts) g.fill(q); g.fill(w.crown); g.restore();
    const tg = g.createLinearGradient(0, w.base - 420, 0, w.base); tg.addColorStop(0, dc('near')); tg.addColorStop(1, dc('mid'));
    g.fillStyle = tg; for (const q of w.parts) g.fill(q); g.fill(w.crown);
    const sway = t => Math.sin(tm * 0.7 + t) * 5 + Math.sin(tm * 1.3 + t * 2) * 2;
    for (let pass = 0; pass < 2; pass++) {   // önce arka (soluk), sonra ön sarmaşık perdesi; salınım = şeride kayma (shear) dönüşümü
      const col = pass ? dc('near') : dc('mid', 0.85); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = pass ? 1.4 : 1;
      for (const [vx, vy, len, ph, , layer, lf] of w.vines) { if (layer !== pass) continue; const k = sway(ph) / len;
        g.save(); g.transform(1, 0, k, 1, -k * vy, 0); g.beginPath(); g.moveTo(vx, vy); g.lineTo(vx, vy + len); g.stroke(); g.fill(lf); g.restore(); }
    }
    g.globalCompositeOperation = 'lighter';
    for (const [vx, vy, len, ph, bulb] of w.vines) if (bulb) { const sw = sway(ph), pul = 0.6 + 0.4 * Math.sin(tm * 1.5 + ph * 3); dglow(ph < 2 ? '#c9b2ff' : bio, vx + sw, vy + len + 2, 9, 0.6 * pul); dglow('#ffffff', vx + sw, vy + len + 2, 2, 0.7 * pul); }
    g.globalCompositeOperation = 'source-over';
  }
}
// dünya derinliğinde dev gövdeler: dal platformları bunlara bağlanır
const DN_TRUNKS = [];
{ const R = rng(515);
  for (const p of DN_PLATS) {
    if (!p.dal) continue;
    let tr = null;
    for (const sd of [1, -1]) { const ex = sd > 0 ? p.x1 + 14 : p.x0 - 14; for (const t of DN_TRUNKS) if (Math.abs(t.x - ex) < t.w * 0.5 + 30) { tr = t; p.js = sd; break; } if (tr) break; }
    if (!tr) {
      const sd = R() < 0.5 ? 1 : -1, tx = sd > 0 ? p.x1 + 30 : p.x0 - 30;
      if (DN_TRUNKS.some(t => Math.abs(t.x - tx) < 200)) continue;
      const base = dnTopY(tx) + 30, w = 48 + R() * 16, top = -400, parts = [];
      parts.push(dnTaper([tx, base, tx + (R() - 0.5) * 20, base * 0.66, tx + (R() - 0.5) * 20, base * 0.33, tx + (R() - 0.5) * 10, top], w, w * 0.7, 18));
      for (const s2 of [-1, 1]) for (let i = 0; i < 2; i++) { const ry = base - 30 - i * 26, ex = tx + s2 * (w * (1.1 + R() * 0.8)), ey = base - 26 + R() * 10; parts.push(dnTaper([tx + s2 * w * 0.25, ry - 30, tx + s2 * w * 0.6, ry, ex - s2 * 10, ey - 12, ex, ey], w * 0.42, 3, 10)); }
      const cracks = []; for (let i = 0; i < 3; i++) { const pts = [], ox = (i - 1) * w * 0.25; let xx = tx + ox; for (let y = base - 40; y > -60; y -= 22) { xx += (R() - 0.5) * 6; pts.push([xx, y]); } cracks.push(pts); }
      const fungi = []; for (let i = 0; i < 4; i++) fungi.push([tx + (R() < 0.5 ? -1 : 1) * w * 0.48, 120 + R() * (base - 200), 7 + R() * 6]);
      tr = { x: tx, w, base, parts, cracks, fungi, ph: R() * 6 }; DN_TRUNKS.push(tr); p.js = sd;
    }
    const sd = p.js, ex = sd > 0 ? p.x1 + 10 : p.x0 - 10;   // dalı gövdeye bağlayan kalın eklem
    p.joint = dnTaper([tr.x, p.y + 4, tr.x - sd * tr.w * 0.7, p.y + 7, ex + sd * 10, p.y + 10, ex - sd * 16, p.y + 11], 26, 18, 10);
  } }
// ── zemin kesiti (Ori): katmanlı toprak, kök ağı, gömülü taşlar, ışıyan oyuklar; önbellekli 2B karolar ──
const DN_SOIL = [   // derinlikle koyulaşan çivit-turkuaz katmanlar (gece → şafak)
  ['#0f2c40', '#0f3640', '#1c3a3a'], ['#0b2234', '#0b2a36', '#142e30'], ['#081a2c', '#08202e', '#0f2428'],
  ['#061325', '#061826', '#0b1c22'], ['#040d1c', '#04111e', '#08141a'], ['#02070f', '#030a12', '#050c10']];
const dnSoil = (i, t, a = 1) => { const s = DN_SOIL[i]; t = clamp(t, 0, 1); const h = t < 0.5 ? dnHex(s[0], s[1], t * 2) : dnHex(s[1], s[2], t * 2 - 1); return a < 1 ? dnRgba(h, a) : h; };
function dnTopY(x) { const c = clamp(Math.floor(x / T), 0, COLS - 1), t = topOf(c); if (t < ROWS) return t * T; for (let d = 1; d < 6; d++) { const a = topOf(clamp(c - d, 0, COLS - 1)), b = topOf(clamp(c + d, 0, COLS - 1)); if (a < ROWS || b < ROWS) return Math.min(a, b) * T; } return DN_LH; }
// katman sınırları: yüzeyi izleyen dalgalı çizgiler (yumuşatılmış yüzey + gürültü)
const DN_STRATA = [16, 40, 74, 118, 176].map((d, k) => {
  const p = new Path2D(), line = [], R = rng(300 + k), ph = R() * 6, ph2 = R() * 6;
  let first = true;
  for (let x = -40; x <= DN_LW + 40; x += 12) {
    const s = (dnTopY(x - 30) + dnTopY(x) * 2 + dnTopY(x + 30)) / 4;
    const y = s + d + Math.sin(x * 0.011 + ph) * (4 + k * 2) + Math.sin(x * 0.037 + ph2) * (2 + k) + (R() - 0.5) * 1.5;
    first ? p.moveTo(x, y) : p.lineTo(x, y); first = false; line.push(x, y);
  }
  p.lineTo(DN_LW + 40, DN_LH + 400); p.lineTo(-40, DN_LH + 400); p.closePath();
  return { p, line, d };
});
// kök ağı: yüzeyden dallanarak inen, uçları ışıyan kökler
const DN_ROOTS = [], DN_RTIPS = [];
{
  const R = rng(31);
  const grow = (x, y, ang, w, len, dep, list) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, bend = (R() - 0.5) * len * 0.5;
    const p = [x, y, x + Math.cos(ang) * len * 0.33 - Math.sin(ang) * bend, y + Math.sin(ang) * len * 0.33 + Math.cos(ang) * bend * 0.3,
      x + Math.cos(ang) * len * 0.66 + Math.sin(ang) * bend, y + Math.sin(ang) * len * 0.66, ex, ey];
    const w1 = Math.max(0.8, w * 0.45);
    list.push({ path: dnTaper(p, w, w1, 10), p, w, x0: Math.min(x, ex) - w - Math.abs(bend), x1: Math.max(x, ex) + w + Math.abs(bend), vein: w > 2.5 && R() < 0.5 });
    if (dep < 3) {
      const nb = dep === 0 ? 1 + (R() < 0.5 ? 1 : 0) : R() < 0.5 ? 1 : 0;
      for (let i = 0; i < nb; i++) { const u = 0.45 + R() * 0.45, q = dnBez(p, u); grow(q[0], q[1], ang + (R() < 0.5 ? -1 : 1) * (0.35 + R() * 0.6), lerp(w, w1, u) * 0.8, len * (0.5 + R() * 0.35), dep + 1, list); }
      if (R() < 0.75) grow(ex, ey, ang + (R() - 0.5) * 0.5, w1 * 1.05, len * (0.55 + R() * 0.3), dep + 1, list);
    } else if (R() < 0.3) DN_RTIPS.push({ x: ex, y: ey, ph: R() * 6, s: 0.6 + R() * 0.7, vio: R() < 0.25 });
  };
  for (let x = 10 + R() * 30; x < DN_LW; x += 55 + R() * 70) {
    const c = Math.floor(x / T), t = topOf(c); if (t >= ROWS) continue;
    const depth = DN_LH + 120 - t * T, sd = R() < 0.5 ? -1 : 1;
    grow(x, t * T + 2, Math.PI / 2 + sd * (0.25 + R() * 0.7), 6 + R() * 8, Math.min(depth * 0.45, 40 + R() * 60), 0, DN_ROOTS);
  }
}
// gömülü taşlar, çakıllar
const DN_STONES = [], DN_PEB = [];
{ const R = rng(37); for (let c = 0; c < COLS; c++) { const t = topOf(c); if (t >= ROWS) continue; const reg = DN_COLR[c];
    const n = R() < 0.65 ? 1 + Math.floor(R() * 2) : 0;
    for (let i = 0; i < n; i++) { const big = R() < 0.3; DN_STONES.push({ x: c * T + R() * T, y: t * T + 22 + Math.pow(R(), 0.7) * 200, rx: big ? 18 + R() * 20 : 5 + R() * 9, ry: big ? 10 + R() * 12 : 3.5 + R() * 6, a: (R() - 0.5) * 0.7 }); }
    if (R() < 0.35) { const bx = c * T + R() * T, by = t * T + 14 + R() * 30; for (let i = 0; i < 4 + R() * 4; i++) DN_STONES.push({ x: bx + (R() - 0.5) * 22, y: by + (R() - 0.5) * 8, rx: 1.8 + R() * 2.6, ry: 1.4 + R() * 1.8, a: R() * 3 }); }
    const pp = reg === 'patika' ? 0.55 : reg === 'aciklik' ? 0.45 : reg === 'pofuduk' ? 0.3 : 0.12;
    if (R() < pp && topOf(c - 1) === t && topOf(c + 1) === t) DN_PEB.push({ x: c * T + 6 + R() * (T - 12), y: t * T + 2.5 + R() * 2, r: 2.2 + R() * 2.4, ph: R() * 6, c: reg === 'aciklik' ? '#ffe2a0' : reg === 'pofuduk' ? (R() < 0.5 ? '#ffc4e8' : '#bff6ff') : R() < 0.75 ? '#9ff6ff' : '#d6c4ff' });
  } }
// ışıyan oyuklar: içinde kristal kümeleri ve minik mantarlar, süzülen sporlar
const DN_HOLES = [];
{ const R = rng(43); let x = 200 + R() * 300;
  while (x < DN_LW - 100) {
    const c = Math.floor(x / T), t = topOf(c), tl = topOf(c - 2), tr = topOf(c + 2);
    if (t < ROWS && tl === t && tr === t && DN_LH - t * T >= 110 && !(DN_GOL && x > DN_GOL.x0 - 120 && x < DN_GOL.x1 + 120)) {
      const reg = DN_COLR[c], rx = 44 + R() * 34, ry = 20 + R() * 10, cy = t * T + 62 + R() * Math.min(60, DN_LH - t * T - 100);
      const p = new Path2D(), pts = [];
      for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, k = 0.85 + R() * 0.3, fl = Math.sin(a) > 0 ? 0.75 : 1; pts.push([x + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k * fl]); }
      dnSmooth(p, pts);
      const it = [], col = reg === 'sakli' ? '#c9a2ff' : reg === 'pofuduk' ? '#ff9ad8' : reg === 'aciklik' ? '#ffd890' : R() < 0.7 ? '#5fe8ff' : '#b88aff';
      const n = 3 + Math.floor(R() * 4);
      for (let i = 0; i < n; i++) it.push({ k: R() < 0.55 ? 'c' : 'm', x: x + (R() - 0.5) * rx * 1.3, s: 0.6 + R() * 0.8, a: (R() - 0.5) * 0.6 });
      DN_HOLES.push({ x, y: cy, rx, ry, p, it, col, floor: cy + ry * 0.62, ph: R() * 6 });
      x += 500 + R() * 600;
    } else x += 120;
  } }
// yüzeyde yosun bandı (sütun başına tümsekler) ve düzensiz üst siluet
const DN_MOSSP = new Path2D();
{ const R = rng(71); for (let c = 0; c < COLS; c++) { const t = topOf(c); if (t >= ROWS) continue;
    for (let i = 0; i < 3; i++) { const x = c * T + (i + 0.5) * T / 3 + (R() - 0.5) * 6, y = t * T + 3 + R() * 2.5; DN_MOSSP.moveTo(x + 10, y); DN_MOSSP.ellipse(x, y, 10 + R() * 5, 4 + R() * 3.5, 0, 0, 6.283); }
    if (R() < 0.3) { const x = c * T + R() * T, y = t * T - 0.5; DN_MOSSP.moveTo(x + 6, y); DN_MOSSP.ellipse(x, y, 6 + R() * 6, 2 + R() * 2.5, 0, 0, 6.283); } } }
// uçurum kenarlarından sarkan ışıklı yosun
const DN_DRIPS = [];
{ const R = rng(57);
  for (let c = 0; c < COLS; c++) {
    const t = topOf(c); if (t >= ROWS) continue;
    const tl = c > 0 ? topOf(c - 1) : 0, tr = c < COLS - 1 ? topOf(c + 1) : 0;
    if (tr > t) for (let i = 0; i < 5; i++) DN_DRIPS.push([(c + 1) * T + 0.5, t * T + 10 + i * 6 + R() * 6, 10 + R() * 30, R() * 6, 1]);
    if (tl > t) for (let i = 0; i < 5; i++) DN_DRIPS.push([c * T - 0.5, t * T + 10 + i * 6 + R() * 6, 10 + R() * 30, R() * 6, -1]);
  } }
function dnPaintGround(x, x0, x1, t, y0, y1) {
  const gg = x.createLinearGradient(0, DN_GTOP, 0, DN_GY + 260);
  gg.addColorStop(0, dnSoil(0, t)); gg.addColorStop(1, dnSoil(2, t));
  x.fillStyle = gg; x.fill(DN_GPATH);
  x.save(); x.clip(DN_GPATH);
  DN_STRATA.forEach((s, k) => {   // katmanlar: yumuşak değer basamakları + ince açık kenar
    x.fillStyle = dnSoil(k + 1, t); x.fill(s.p);
    x.strokeStyle = dnSoil(Math.max(0, k - 1), t, 0.55); x.lineWidth = 2.2; x.beginPath();
    let on = false;
    for (let i = 0; i < s.line.length; i += 2) { const px = s.line[i]; if (px < x0 - 20 || px > x1 + 20) { on = false; continue; } on ? x.lineTo(px, s.line[i + 1]) : x.moveTo(px, s.line[i + 1]); on = true; }
    x.stroke();
  });
  for (const s of DN_STONES) {   // gömülü taşlar ve çakıllar: yuvarlak, üstten kenar ışığı
    if (s.x < x0 - 40 || s.x > x1 + 40 || s.y < y0 - 40 || s.y > y1 + 40) continue;
    const rg = x.createRadialGradient(s.x - s.rx * 0.3, s.y - s.ry * 0.5, 0, s.x, s.y, Math.max(s.rx, s.ry));
    rg.addColorStop(0, dnSoil(0, t)); rg.addColorStop(1, dnSoil(3, t));
    x.fillStyle = rg; x.beginPath(); x.ellipse(s.x, s.y, s.rx, s.ry, s.a, 0, 6.283); x.fill();
    x.strokeStyle = dcAt('rim', t, s.rx > 8 ? 0.16 : 0.22); x.lineWidth = s.rx > 8 ? 1.5 : 0.9; x.beginPath(); x.ellipse(s.x, s.y, s.rx, s.ry, s.a, Math.PI * 1.08, Math.PI * 1.85); x.stroke();
  }
  // kök ağı: koyu gövde, üstte ince ışık, bazı köklerde ışıyan damar
  const vis = DN_ROOTS.filter(r => r.x1 > x0 - 10 && r.x0 < x1 + 10);
  x.save(); x.translate(0.6, -1.1); x.fillStyle = dcAt('rim', t, 0.13); for (const r of vis) x.fill(r.path); x.restore();
  x.fillStyle = dnSoil(4, t); for (const r of vis) x.fill(r.path);
  x.globalCompositeOperation = 'lighter';
  x.strokeStyle = dcAt('bio', t, 0.28); x.lineWidth = 0.9; x.beginPath();
  for (const r of vis) if (r.vein) { const p = r.p; x.moveTo(p[0], p[1]); x.bezierCurveTo(p[2], p[3], p[4], p[5], p[6], p[7]); }
  x.stroke();
  for (const r of DN_RTIPS) if (r.x > x0 - 30 && r.x < x1 + 30) dnG(x, r.vio ? '#b88aff' : dcol('bio', t), r.x, r.y, 10 * r.s, 0.25);
  x.globalCompositeOperation = 'source-over';
  for (const h of DN_HOLES) {   // oyuklar
    if (h.x + h.rx < x0 - 20 || h.x - h.rx > x1 + 20) continue;
    x.save(); x.translate(0, 1.5); x.fillStyle = dcAt('rim', t, 0.12); x.fill(h.p); x.restore();
    const hg = x.createRadialGradient(h.x, h.floor, 2, h.x, h.y, h.rx * 1.1);
    hg.addColorStop(0, dnRgba(h.col, 0.28)); hg.addColorStop(0.5, dnSoil(5, t)); hg.addColorStop(1, '#010309');
    x.fillStyle = hg; x.fill(h.p);
    x.save(); x.clip(h.p);
    x.fillStyle = dnSoil(3, t); x.beginPath(); x.ellipse(h.x, h.floor + h.ry * 0.5, h.rx * 1.1, h.ry * 0.62, 0, 0, 6.283); x.fill();   // zemin tümseği
    x.globalCompositeOperation = 'lighter'; dnG(x, h.col, h.x, h.floor, h.rx * 1.2, 0.35); x.globalCompositeOperation = 'source-over';
    for (const it of h.it) {
      const fy = h.floor + 1;
      if (it.k === 'c') {   // kristal kümesi
        x.save(); x.translate(it.x, fy); x.rotate(it.a); x.scale(it.s, it.s);
        x.fillStyle = dnRgba(h.col, 0.85); x.beginPath();
        x.moveTo(-2, 0); x.lineTo(0, -15); x.lineTo(2.5, 0); x.moveTo(1.5, 0); x.lineTo(6, -9); x.lineTo(5.5, 1); x.moveTo(-1, 0); x.lineTo(-6, -8); x.lineTo(-4.5, 1); x.fill();
        x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.moveTo(-0.5, -2); x.lineTo(0, -13); x.lineTo(0.8, -2); x.fill();
        x.restore();
      } else {   // minik mantar
        const s = it.s * 0.9, hh = 7 * s;
        x.fillStyle = dnSoil(1, t); x.fillRect(it.x - 0.7 * s, fy - hh, 1.4 * s, hh);
        x.fillStyle = dnRgba(h.col, 0.9); x.beginPath(); x.ellipse(it.x, fy - hh, 4.5 * s, 3 * s, 0, Math.PI, 6.283); x.fill();
      }
    }
    x.restore();
  }
  x.restore();
  // yüzey dudağı: açık renkli bant (iç kenar), dış hale
  x.save(); x.clip(DN_GPATH);
  x.strokeStyle = dnSoil(0, Math.min(1, t + 0.25), 0.9); x.lineWidth = 16; x.stroke(DN_GPATH);
  x.globalCompositeOperation = 'lighter';
  x.strokeStyle = dcAt('rim', t, 0.06); x.lineWidth = 30; x.stroke(DN_GPATH);
  x.strokeStyle = dcAt('rim', t, 0.1); x.lineWidth = 9; x.stroke(DN_GPATH);
  x.restore();
  x.globalCompositeOperation = 'lighter';
  x.strokeStyle = dcAt('rim', t, 0.05); x.lineWidth = 12; x.stroke(DN_GPATH);
  x.strokeStyle = dcAt('rim', t, 0.09); x.lineWidth = 5; x.stroke(DN_GPATH);
  x.globalCompositeOperation = 'source-over';
  x.fillStyle = dcAt('moss', t); x.fill(DN_MOSSP);   // yosun bandı (düzensiz üst siluet)
  x.save(); x.translate(0, -1.2); x.globalCompositeOperation = 'lighter'; x.fillStyle = dcAt('rim', t, 0.08); x.fill(DN_MOSSP); x.restore();
  x.globalCompositeOperation = 'lighter';
  x.strokeStyle = dcAt('rim', t, 0.7); x.lineWidth = 1.2; x.stroke(DN_GPATH);
  x.globalCompositeOperation = 'source-over';
}
// 2B karolu önbellek (zemin çok yüksek olabilir): karo 512×512 birim, bellek için q<1
const DN_GROUND = { q: 0.72, steps: 8, TH: 512, ch: new Map(), y0: DN_GTOP - 50, y1: DN_LH + 320 };
function dnDrawGround() {
  const L = DN_GROUND, lq = Math.round(light * L.steps) / L.steps, sc = dnCS() * L.q, TW = DN_CH, TH = L.TH;
  const k0 = Math.floor(cam.x / TW), k1 = Math.floor((cam.x + VW) / TW);
  const j0 = Math.max(Math.floor((Math.max(cam.y, L.y0) - L.y0) / TH), 0), j1 = Math.floor((Math.min(cam.y + H / S, L.y1) - L.y0) / TH);
  if (j1 < j0) return;
  const dir = cam.x >= (L.px == null ? cam.x : L.px) ? 1 : -1; L.px = cam.x;
  const render = (k, j, key) => {
      let c = L.ch.get(key);
      if (!c) c = { cv: document.createElement('canvas') };
      const PAD = 2, w = Math.round(TW * sc) + PAD * 2, h = Math.round(TH * sc) + PAD * 2;
      if (c.cv.width !== w || c.cv.height !== h) { c.cv.width = w; c.cv.height = h; }
      const x = c.cv.getContext('2d'), ty0 = L.y0 + j * TH;
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h);
      x.setTransform(sc, 0, 0, sc, -k * TW * sc + PAD, -ty0 * sc + PAD); x.lineCap = 'round'; x.lineJoin = 'round';
      dnPaintGround(x, k * TW - 20, (k + 1) * TW + 20, lq, ty0, ty0 + TH);
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
      c.sc = sc; c.l = lq; c.pad = PAD; L.ch.set(key, c);
      return c;
  };
  for (let k = k0 - 2; k <= k1 + 2; k++) for (let j = Math.max(0, j0 - 1); j <= j1 + 1; j++) {
    const key = k * 64 + j; let c = L.ch.get(key);
    const vis = k >= k0 && k <= k1 && j >= j0 && j <= j1, missing = !c || c.sc !== sc, stale = missing || c.l !== lq;
    if (L.y0 + j * TH > L.y1) continue;
    if (stale) {
      if (vis && missing) c = render(k, j, key);
      else { const ahead = (k - (k0 + k1) / 2) * dir > 0; dnQueue(missing ? (ahead ? 0 : 1) : vis ? 2 : 3, 'G' + key, () => render(k, j, key)); }
    }
    if (!vis || !c) continue;
    const sx0 = Math.round((k * TW - cam.x) * S), sx1 = Math.round(((k + 1) * TW - cam.x) * S);
    const sy0 = Math.round((L.y0 + j * TH - cam.y) * S), sy1 = Math.round((L.y0 + (j + 1) * TH - cam.y) * S);
    g.drawImage(c.cv, c.pad, c.pad, c.cv.width - c.pad * 2, c.cv.height - c.pad * 2, sx0, sy0, sx1 - sx0, sy1 - sy0);
  }
  for (const key of L.ch.keys()) { const k = Math.floor(key / 64), j = key - k * 64; if (k < k0 - 3 || k > k1 + 3 || j < j0 - 2 || j > j1 + 2) L.ch.delete(key); }
}
// çimen ve süsler (sabit rastgele; bölgeye göre)
const DN_DECO = [], DN_GRASS = [];
{
  const R = rng(7), FL = NESNELER.filter(n => n.tip === 'cicek' || n.tip === 'tohum' || n.tip === 'agac' || n.tip === 'buyukPofuduk');
  const nearObj = x => FL.some(f => Math.abs(f.x - x) < (f.tip === 'agac' ? 150 : f.tip === 'buyukPofuduk' ? 70 : 34));
  const golE = DN_GOL ? [DN_GOL.x0, DN_GOL.x1] : null;
  for (let c = 0; c < COLS; c++) {
    const tops = [];
    const t = topOf(c); if (t < ROWS) tops.push([t, false]);
    for (let y = 0; y < ROWS; y++) if (grid[y][c] === 2) tops.push([y, true]);
    for (const [ty, pl] of tops) {
      const reg = pl ? dnRegPick(c * T + T / 2, ty * T, R) : DN_COLR[c], cx = c * T + T / 2;
      const nG = reg === 'pofuduk' ? 8 : reg === 'aciklik' ? 7 : reg === 'gol' ? 7 : 5, hk = reg === 'pofuduk' ? 1.25 : reg === 'gol' ? 1.3 : 1;
      for (let i = 0; i < nG; i++) { const h = (5 + R() * 13) * hk; DN_GRASS.push({ x: c * T + R() * T, y: ty * T + 1, h, ph: R() * 6.28, lean: (R() - 0.5) * 0.5, tip: h > 14 && R() < 0.55, reg }); }
      const r = R(), x = c * T + 6 + R() * (T - 12), y = ty * T;
      if (nearObj(x)) continue;
      const nearWater = golE && !pl && (Math.abs(x - golE[0]) < 160 || Math.abs(x - golE[1]) < 160);
      if (nearWater && r < 0.5) { const n = 3 + Math.floor(R() * 4), it = []; for (let i = 0; i < n; i++) it.push([(R() - 0.5) * 22, 30 + R() * 34, R() * 6, R() < 0.5]); DN_DECO.push({ k: 'r', x, y, it }); continue; }
      const P0 = reg === 'pofuduk' ? [0.42, 0.5, 0.6, 0.72, 0.9] : reg === 'aciklik' ? [0.1, 0.18, 0.26, 0.3, 0.75] : reg === 'sakli' ? [0.16, 0.22, 0.34, 0.36, 0.8] : reg === 'dallar' ? [0.14, 0.28, 0.55, 0.55, 0.68] : [0.2, 0.32, 0.5, 0.55, 0.72];
      if (r < P0[0]) { const big = reg === 'pofuduk' && R() < 0.5, n = 2 + Math.floor(R() * (big ? 4 : 3)), it = []; for (let i = 0; i < n; i++) it.push([(R() - 0.5) * (big ? 26 : 16), (0.55 + R() * 0.7) * (big ? 1.5 : 1)]); DN_DECO.push({ k: 'm', x, y, it, ph: R() * 6, vio: reg === 'sakli' ? R() < 0.7 : R() < 0.22, pink: reg === 'pofuduk' && R() < 0.45 }); }
      else if (r < P0[1]) DN_DECO.push({ k: 'b', x, y, h: 14 + R() * 14, ph: R() * 6 });
      else if (r < P0[2]) DN_DECO.push({ k: 'n', x, y, s: 0.7 + R() * 0.6, ph: R() * 6, fl: R() < 0.5 ? -1 : 1 });
      else if (r < P0[3]) DN_DECO.push({ k: 'u', x, y, s: 0.8 + R() * 0.7, ph: R() * 6, seed: Math.floor(R() * 1e6) });
      else if (r < P0[4]) DN_DECO.push({ k: 'f', x, y, s: 0.7 + R() * 0.6, ph: R() * 6, thr: R() * 0.8, hue: reg === 'sakli' ? (R() < 0.6 ? '#d6b8ff' : '#ffc4ef') : R() < 0.4 ? '#ffd9a0' : R() < 0.65 ? '#c8fff0' : R() < 0.85 ? '#d6b8ff' : '#ffc4cf' });
    }
  }
}
// boşluklar (göl dışındaki çukurlar): koyu sisli derinlik
const DN_PITS = []; { let c = 0; while (c < COLS) { if (topOf(c) < ROWS) { c++; continue; } const a = c; while (c < COLS && topOf(c) >= ROWS) c++; const x0 = a * T, x1 = c * T; if (!DN_GOL || x1 <= DN_GOL.x0 || x0 >= DN_GOL.x1) DN_PITS.push([x0, x1]); } }
// saklı yolun ipucu: girişe uzanan ve yolu süsleyen minik ışıklar
const DN_TRAIL = [];
{
  const sr = DN_REGS.find(r => r.ad === 'sakli');
  if (sr) {
    const ps = DN_PLATS.filter(p => p.x1 > sr.x0 && p.x0 < sr.x1 && (sr.ust == null || p.y <= sr.ust + 1)).sort((a, b) => a.x0 - b.x0);
    const arc = (ax, ay, bx, by, n, i0) => { const mx = (ax + bx) / 2, my = Math.min(ay, by) - 70 - Math.abs(bx - ax) * 0.15; for (let i = 1; i < n; i++) { const u = i / n, m = 1 - u; DN_TRAIL.push([m * m * ax + 2 * m * u * mx + u * u * bx, m * m * ay + 2 * m * u * my + u * u * by, i0 + i]); } };
    if (ps.length) {
      const e = ps[0], ec = Math.floor(e.x0 / T);
      let A = null;
      for (let dc2 = 2; dc2 <= 6 && !A; dc2++) { const c = ec - dc2; if (c < 0) break; for (let r = Math.floor(e.y / T) + 1; r < ROWS; r++) if (grid[r][c]) { A = [c * T + T / 2, r * T - 14]; break; } }
      let i0 = 0;
      if (A) { arc(A[0], A[1], e.x0 + 10, e.y - 14, 12, 0); i0 = 12; }
      ps.forEach((p, k) => {
        for (let xx = p.x0 + 16; xx < p.x1 - 8; xx += 34) DN_TRAIL.push([xx, p.y - 16 - Math.sin(xx * 0.05) * 3, i0++]);
        const q = ps[k + 1]; if (q) { arc(p.x1 - 6, p.y - 16, q.x0 + 10, q.y - 16, 6, i0); i0 += 6; }
      });
    }
  }
}
// göl dibi (havza): kıyılardan ve adacıktan yumuşakça derinleşen yatak; batık bitkiler, taşlar, ışıyan kristaller, batık kütük
const DN_FLOOR = [], DN_SUNK = [], DN_BED = [], DN_BROCK = [], DN_WALLS = [];
let DN_BEDP = null, DN_BEDLINE = null, DN_LOG = null;
if (DN_GOL) {
  const G = DN_GOL, R = rng(88), c0 = Math.floor(G.x0 / T), c1 = Math.ceil(G.x1 / T) - 1;
  const solid = [];   // gölün içindeki kara parçaları (adacık) – su yüzeyinin üstüne çıkan sütunlar
  for (let c = c0; c <= c1; c++) if (topOf(c) < ROWS && topOf(c) * T < G.su) { if (solid.length && solid[solid.length - 1][1] === c * T) solid[solid.length - 1][1] = (c + 1) * T; else solid.push([c * T, (c + 1) * T]); }
  // su ile karşılaşan dik duvarlar (kıyılar ve adacık): sd = suya doğru yön
  const dry = c => topOf(c) < ROWS && topOf(c) * T < G.su;
  for (let c = c0 - 1; c <= c1 + 1; c++) {
    if (!dry(c)) continue;
    if (!dry(c + 1) && (c + 1) * T >= G.x0 && (c + 1) * T <= G.x1) DN_WALLS.push({ x: (c + 1) * T, sd: 1, top: topOf(c) * T });
    if (!dry(c - 1) && c * T >= G.x0 && c * T <= G.x1) DN_WALLS.push({ x: c * T, sd: -1, top: topOf(c) * T });
  }
  const maxD = clamp(DN_LH - G.su - 40, 40, 110), ph = R() * 6;
  const dist = x => { let d = Math.min(x - G.x0, G.x1 - x); for (const [a, b] of solid) d = Math.min(d, x < a ? a - x : x > b ? x - b : -1); return d; };
  const bedY = x => { const d = dist(x); if (d < 0) return G.su - 4; const k = smooth(clamp(d / 135, 0, 1)); return G.su + 8 + (maxD - 8) * k + (Math.sin(x * 0.031 + ph) * 4 + Math.sin(x * 0.083) * 2) * k; };
  DN_BEDP = new Path2D(); DN_BEDLINE = new Path2D();
  DN_BEDP.moveTo(G.x0 - 18, DN_LH + 400);
  for (let x = G.x0 - 18; x <= G.x1 + 18; x += 8) { const y = bedY(clamp(x, G.x0, G.x1)); DN_BED.push([x, y]); DN_BEDP.lineTo(x, y); if (x === G.x0 - 18) DN_BEDLINE.moveTo(x, y); else DN_BEDLINE.lineTo(x, y); }
  DN_BEDP.lineTo(G.x1 + 18, DN_LH + 400); DN_BEDP.closePath();
  const at = x => bedY(clamp(x, G.x0, G.x1));
  for (let x = G.x0 + 14; x < G.x1 - 10; x += 16 + R() * 26) {
    const d = dist(x); if (d < 6) continue;
    const y = at(x);
    if (R() < 0.62) DN_SUNK.push({ k: 'w', x, y: y + 2, h: (16 + R() * 40) * (0.6 + 0.6 * Math.min(1, d / 120)), ph: R() * 6, c: R() < 0.55 ? '#7ff0d0' : R() < 0.6 ? '#c9a2ff' : '#ffc4ef', n: 2 + Math.floor(R() * 3) });
    if (R() < 0.4) DN_SUNK.push({ k: 's', x: x + R() * 10, y: y + 1, r: 2.2 + R() * 3, ph: R() * 6, c: R() < 0.6 ? '#9ff6ff' : R() < 0.5 ? '#ffd0f0' : '#ffe2a0' });
    if (R() < 0.35) DN_BROCK.push({ x: x + R() * 12, y: y + 3, rx: 7 + R() * 16, ry: 4 + R() * 7, a: (R() - 0.5) * 0.4 });
  }
  for (let i = 0; i < 4; i++) {   // ışıyan batık kristal kümeleri (derin yerlerde)
    let x = 0, tries = 0; do { x = lerp(G.x0 + 60, G.x1 - 60, R()); } while (dist(x) < 70 && ++tries < 20);
    DN_SUNK.push({ k: 'c', x, y: at(x) + 3, s: 0.8 + R() * 0.6, ph: R() * 6, c: i % 2 ? '#c9a2ff' : '#7ff6ff' });
  }
  { let x = 0, tries = 0; do { x = lerp(G.x0 + 120, G.x1 - 120, R()); } while (dist(x) < 110 && ++tries < 30);   // batık kütük
    const y = at(x), L = 90 + R() * 40; DN_LOG = { path: dnTaper([x - L / 2, at(x - L / 2) + 2, x - L / 6, y - 6, x + L / 6, y - 4, x + L / 2, at(x + L / 2) - 8], 13, 6, 12), x, y, L,
      br: dnTaper([x + L * 0.1, y - 8, x + L * 0.16, y - 26, x + L * 0.3, y - 34, x + L * 0.36, y - 48], 4, 1, 8) }; }
  for (const [x, y] of DN_BED) if (dist(x) > 30) DN_FLOOR.push([x, y]);
}
// kostik ağı dokusu (döşenebilir Voronoi kenarları): su dibinde kayan ışık ağı
const DN_CAUS = (() => {
  const N = 96, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d'), d = x.createImageData(N, N), R = rng(1234), pts = [];
  for (let i = 0; i < 11; i++) pts.push([R() * N, R() * N]);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let f1 = 1e9, f2 = 1e9;
    for (const [px, py] of pts) { let dx = Math.abs(i - px), dy = Math.abs(j - py); if (dx > N / 2) dx = N - dx; if (dy > N / 2) dy = N - dy; const q = dx * dx + dy * dy; if (q < f1) { f2 = f1; f1 = q; } else if (q < f2) f2 = q; }
    const e = Math.sqrt(f2) - Math.sqrt(f1), v = Math.pow(clamp(1 - e / 5, 0, 1), 2.2), o = (j * N + i) * 4;
    d.data[o] = 190; d.data[o + 1] = 250; d.data[o + 2] = 255; d.data[o + 3] = v * 255;
  }
  x.putImageData(d, 0, 0); return c;
})();
let dnCausPat = null;
// göl üstünde yükselen ışıklı sporlar
const DN_LSPORE = (() => { if (!DN_GOL) return []; const R = rng(64), a = []; for (let i = 0; i < 34; i++) a.push({ x: lerp(DN_GOL.x0 - 40, DN_GOL.x1 + 40, R()), h: R(), sp: 6 + R() * 12, ph: R() * 6, s: 2 + R() * 4, c: R() }); return a; })();

function drawWorld(tm) {
  g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
  g.lineCap = 'round'; g.lineJoin = 'round';
  dnTreeWarmup();
  const vx0 = cam.x - 50, vx1 = cam.x + VW + 50, bio = DNR.sakli > 0.5 ? '#b88aff' : dq('bio');
  // göl suyu (taban; üstüne karede yansıma gelir) ve diğer çukurların sisli derinliği
  if (DN_GOL && DN_GOL.x1 > vx0 && DN_GOL.x0 < vx1) {
    const wy = DN_GOL.su, wg = g.createLinearGradient(0, wy, 0, wy + 140);
    wg.addColorStop(0, dc('water')); wg.addColorStop(1, '#030816');
    g.fillStyle = wg; g.fillRect(Math.max(vx0, DN_GOL.x0), wy, Math.min(vx1, DN_GOL.x1) - Math.max(vx0, DN_GOL.x0), cam.y + H / S + 20 - wy);
  }
  g.globalCompositeOperation = 'lighter';
  for (const [a, b] of DN_PITS) if (b > vx0 && a < vx1) { dnEG(dq('haze'), (a + b) / 2, DN_LH - 20, (b - a) * 0.8, 70, 0.5); dnEG(bio, (a + b) / 2, DN_LH + 10, (b - a) * 0.6, 40, 0.25); }
  g.globalCompositeOperation = 'source-over';
  dnDrawWillows(tm, vx0, vx1, bio);
  for (const t of DN_TRUNKS) {   // dünya derinliğindeki dev gövdeler
    if (t.x + t.w * 3 < vx0 || t.x - t.w * 3 > vx1) continue;
    g.save(); g.translate(2, -0.5); g.fillStyle = dc('rim', 0.45); for (const q of t.parts) g.fill(q); g.restore();
    const tg = g.createLinearGradient(t.x - t.w, 0, t.x + t.w, 0); tg.addColorStop(0, dc('near')); tg.addColorStop(0.7, dc('mid')); tg.addColorStop(1, dc('near'));
    g.fillStyle = tg; for (const q of t.parts) g.fill(q);
    g.globalCompositeOperation = 'lighter';
    g.lineWidth = 1.2;
    for (const pts of t.cracks) { g.strokeStyle = dnRgba(DNR.sakli > 0.5 ? '#c9a2ff' : dq('bio'), 0.14 + 0.08 * Math.sin(tm * 1.1 + pts[0][0])); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); }
    for (const [fx, fy, fs] of t.fungi) dglow(bio, fx, fy, fs * 4, 0.45);
    g.globalCompositeOperation = 'source-over';
    for (const [fx, fy, fs] of t.fungi) { const sd = fx > t.x ? 1 : -1; g.fillStyle = dc('bio', 0.85); g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx + sd * fs * 1.4, fy - fs * 0.5, fx + sd * fs * 1.7, fy + 1); g.quadraticCurveTo(fx + sd * fs, fy + fs * 0.3, fx, fy + 2); g.fill(); }
  }
  // zemin gövdesi (önbellekli)
  g.setTransform(1, 0, 0, 1, 0, 0); dnDrawGround(); g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
  g.globalCompositeOperation = 'lighter';
  for (const r of DN_RTIPS) {   // kök uçlarında nabız gibi ışık
    if (r.x < vx0 || r.x > vx1) continue;
    const pul = 0.5 + 0.5 * Math.sin(tm * 1.3 + r.ph);
    dglow(r.vio ? '#b88aff' : bio, r.x, r.y, 14 * r.s, 0.25 * pul); if (r.s > 1) dglow('#ffffff', r.x, r.y, 2 * r.s, 0.4 * pul);
  }
  for (const h of DN_HOLES) {   // oyuklarda süzülen sporlar ve kristal ışıltısı
    if (h.x + h.rx < vx0 || h.x - h.rx > vx1) continue;
    dnEG(h.col, h.x, h.floor - 4, h.rx * 1.1, h.ry * 1.1, 0.22 + 0.08 * Math.sin(tm * 0.9 + h.ph));
    for (let i = 0; i < 6; i++) {
      const k = ((tm * 0.18 + i / 6 + h.ph) % 1), sx = h.x + Math.sin(i * 2.7 + h.ph) * h.rx * 0.6 + Math.sin(tm * 0.7 + i) * 5, sy = h.floor - 4 - k * h.ry * 1.4;
      dglow(i % 2 ? h.col : '#ffffff', sx, sy, 3.5, Math.sin(k * Math.PI) * 0.8);
    }
    for (const it of h.it) if (it.k === 'c') dglow(h.col, it.x, h.floor - 6 * it.s, 16 * it.s, 0.35 + 0.2 * Math.sin(tm * 1.6 + it.x));
  }
  for (const p of DN_PEB) {   // patikanın ışıyan çakıl taşları
    if (p.x < vx0 || p.x > vx1) continue;
    const pul = 0.6 + 0.4 * Math.sin(tm * 1.1 + p.ph);
    dnEG(p.c, p.x, p.y, p.r * 10, p.r * 3.2, 0.5 * pul); dglow(p.c, p.x, p.y - 1, p.r * 3, 0.5 * pul); dglow('#ffffff', p.x, p.y, p.r * 1.4, 0.8 * pul);
  }
  g.strokeStyle = dc('rim', 0.28); g.lineWidth = 1.1; g.beginPath();   // uçurum kenarı yosunları
  for (const [dx, dy, len, ph, sd] of DN_DRIPS) {
    if (dx < vx0 || dx > vx1) continue;
    const sw = Math.sin(tm * 1.1 + ph) * 1.5;
    g.moveTo(dx, dy - len * 0.4); g.quadraticCurveTo(dx + sd * 1.5, dy, dx + sw, dy + len * 0.6);
  }
  g.stroke();
  for (const [dx, dy, len, ph] of DN_DRIPS) if (dx > vx0 && dx < vx1 && ph < 2.5) dglow(bio, dx + Math.sin(tm * 1.1 + ph) * 1.5, dy + len * 0.6, 6, 0.6);
  g.globalCompositeOperation = 'source-over';
  dnShores(tm, vx0, vx1, bio);
  for (const p of DN_PLATS) if (p.x1 + 60 > vx0 && p.x0 - 60 < vx1) p.dal ? dnBranch(p, tm, bio) : dnIsle(p, tm, bio);
  // çimen (tek yol, tek çizim)
  const pNear = P.ground ? 1 : 0;
  g.strokeStyle = dc('grass'); g.lineWidth = 1.6; g.beginPath();
  const tips = dnTips; tips.length = 0;
  for (const d of DN_GRASS) {
    if (d.x < vx0 || d.x > vx1) continue;
    const near = clamp(1 - Math.abs(P.x - d.x) / 30, 0, 1) * (pNear && Math.abs(P.y - d.y) < 8 ? 1 : 0);
    const bend = Math.sin(tm * 1.6 + d.ph + d.x * 0.01) * 2.2 + d.lean * 6 + near * Math.sign(d.x - P.x) * 7;
    g.moveTo(d.x, d.y); g.quadraticCurveTo(d.x + bend * 0.3, d.y - d.h * 0.6, d.x + bend, d.y - d.h);
    if (d.tip) tips.push(d);
    d.bx = d.x + bend;
  }
  g.stroke();
  g.globalCompositeOperation = 'lighter';
  for (const d of tips) {
    const bl = dnBloomAt(d.x), col = dnBlaze > 0.2 || bl > 0.5 ? '#ffe2a0' : d.reg === 'sakli' ? '#c9a2ff' : d.reg === 'pofuduk' && d.ph < 1.5 ? '#ffb8e8' : bio;
    dglow(col, d.bx, d.y - d.h, 4.5 + bl * 2, 0.45 + 0.2 * Math.sin(tm * 2 + d.ph) + bl * 0.2);
  }
  g.globalCompositeOperation = 'source-over';
  for (const d of DN_DECO) {   // süsler
    if (d.x < vx0 || d.x > vx1) continue;
    if (d.k === 'm') dnMush(d, tm, bio);
    else if (d.k === 'b') dnBulb(d, tm);
    else if (d.k === 'n') dnFern(d, tm);
    else if (d.k === 'u') dnBush(d, tm);
    else if (d.k === 'r') dnReed(d, tm);
    else dnDawnFlower(d, tm);
  }
  // saklı yol ipucu: sırayla yanıp sönen minik ışık izi
  if (DN_TRAIL.length) {
    g.globalCompositeOperation = 'lighter';
    for (const [tx, ty, i] of DN_TRAIL) {
      if (tx < vx0 || tx > vx1) continue;
      const chase = Math.max(0, Math.sin(tm * 2.4 - i * 0.45)), fl = Math.sin(tm * 1.7 + i * 2.1) * 3;
      dglow(i % 3 ? '#e6d4ff' : '#ffe8b0', tx, ty + fl, 10 + chase * 9, 0.45 + chase * 0.55);
      dglow('#ffffff', tx, ty + fl, 2.4 + chase * 1.4, 0.9);
    }
    g.globalCompositeOperation = 'source-over';
  }
  // göl üstünde yükselen sporlar (yansımaya da girer)
  if (DN_GOL && DN_GOL.x1 + 60 > vx0 && DN_GOL.x0 - 60 < vx1) {
    g.globalCompositeOperation = 'lighter';
    const span = 260;
    for (const s of DN_LSPORE) {
      const k = ((s.h * span + tm * s.sp) % span) / span, y = DN_GOL.su - 8 - k * span, x = s.x + Math.sin(tm * 0.6 + s.ph + k * 4) * 14;
      if (s.pk != null && k < s.pk && s.x > DN_GOL.x0 && s.x < DN_GOL.x1 && DN_RINGS.length < 24) DN_RINGS.push({ x: s.x + Math.sin(tm * 0.6 + s.ph) * 14, y: DN_GOL.su, t: now, sp: true });
      s.pk = k;
      const a = Math.sin(k * Math.PI) * (0.5 + 0.5 * Math.sin(tm * 2 + s.ph));
      dglow(s.c < 0.55 ? '#7ff0ff' : s.c < 0.8 ? '#c9b2ff' : '#ffe2a0', x, y, s.s * 2.2, a * 0.7);
    }
    g.globalCompositeOperation = 'source-over';
  }
}
const dnTips = [];
// göl kıyıları ve adacık: dik duvar yerine suya inen yumuşak, yosunlu şev; su kenarında taşlar, sarkan kökler
function dnShoreGeo(w) {
  const R = rng(Math.round(w.x) * 7 + (w.sd > 0 ? 1 : 0)), x = w.x, sd = w.sd, top = w.top, su = DN_GOL.su, out = 24 + R() * 8;
  const body = new Path2D();
  body.moveTo(x - sd * 12, top + 1); body.lineTo(x - sd * 2, top + 1);
  body.bezierCurveTo(x + sd * 10, top + 8, x + sd * out * 0.55, su - 20, x + sd * out, su + 2);
  body.lineTo(x + sd * out, su + 60); body.lineTo(x - sd * 12, su + 60); body.closePath();
  const edge = new Path2D(); edge.moveTo(x - sd * 2, top + 1); edge.bezierCurveTo(x + sd * 10, top + 8, x + sd * out * 0.55, su - 20, x + sd * out, su + 2);
  const moss = new Path2D();
  for (let i = 0; i < 6; i++) { const u = i / 6, mx = lerp(x - sd * 6, x + sd * out * 0.7, u * u), my = lerp(top + 2, su - 10, Math.pow(u, 1.4)), r = 6 + R() * 5; moss.moveTo(mx + r, my); moss.ellipse(mx, my, r, r * 0.55, sd * 0.6 * u, 0, 6.283); }
  const rocks = []; for (let i = 0; i < 3; i++) rocks.push([x + sd * (out * (0.55 + i * 0.32) + R() * 6), su + 1 - R() * 3, 5 + R() * 7, 3 + R() * 4]);
  const roots = []; for (let i = 0; i < 3; i++) { const u = 0.25 + R() * 0.5; roots.push([x + sd * out * u * 0.9, lerp(top + 6, su - 12, u), 8 + R() * 16, R() * 6]); }
  return { body, edge, moss, rocks, roots };
}
function dnShores(tm, vx0, vx1, bio) {
  if (!DN_WALLS.length) return;
  for (const w of DN_WALLS) {
    if (w.x + 60 < vx0 || w.x - 60 > vx1) continue;
    const G = w.geo || (w.geo = dnShoreGeo(w));
    const gr = g.createLinearGradient(0, w.top, 0, DN_GOL.su);
    gr.addColorStop(0, dnSoil(0, light)); gr.addColorStop(1, dnSoil(2, light));
    g.fillStyle = gr; g.fill(G.body);
    g.fillStyle = dc('moss'); g.fill(G.moss);
    g.strokeStyle = dc('grass'); g.lineWidth = 1.2; g.beginPath();
    for (const [rx, ry, len, ph] of G.roots) { const sw = Math.sin(tm * 1.2 + ph) * 2; g.moveTo(rx, ry); g.quadraticCurveTo(rx + sw * 0.4, ry + len * 0.6, rx + sw, ry + len); }
    g.stroke();
    for (const [rx, ry, a, b] of G.rocks) { g.fillStyle = dnSoil(3, light); g.beginPath(); g.ellipse(rx, ry, a, b, 0, Math.PI, 6.283); g.fill(); }
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = dc('rim', 0.08); g.lineWidth = 6; g.stroke(G.edge);
    g.strokeStyle = dc('rim', 0.55); g.lineWidth = 1.1; g.stroke(G.edge);
    g.save(); g.translate(0, -1); g.fillStyle = dc('rim', 0.07); g.fill(G.moss); g.restore();
    g.strokeStyle = dc('rim', 0.35); g.lineWidth = 0.9;
    for (const [rx, ry, a, b] of G.rocks) { g.beginPath(); g.ellipse(rx, ry, a, b, 0, Math.PI * 1.15, Math.PI * 1.7); g.stroke(); }
    for (const [rx, ry, len, ph] of G.roots) if (ph < 3) dglow(bio, rx + Math.sin(tm * 1.2 + ph) * 2, ry + len + 1, 5, 0.7);
    dnEG(dq('bio'), w.x + w.sd * 18, DN_GOL.su, 40, 5, 0.25);   // su kenarında ışık
    g.globalCompositeOperation = 'source-over';
  }
}
function dnIsle(p, tm, bio) {
  const pg = g.createLinearGradient(0, p.y, 0, p.y + 50);
  pg.addColorStop(0, dc('earth')); pg.addColorStop(1, '#02040a');
  g.fillStyle = pg; g.fill(p.path);
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = dc('rim', 0.08); g.lineWidth = 6; g.stroke(p.path);
  g.strokeStyle = dc('rim', 0.85); g.lineWidth = 1.3; g.beginPath(); g.moveTo(p.x0 + 2, p.y); g.lineTo(p.x1 - 2, p.y); g.stroke();
  dnEG(bio, (p.x0 + p.x1) / 2, p.y + 2, (p.x1 - p.x0) * 0.7, 10, 0.18);
  g.strokeStyle = dc('grass', 0.95); g.lineWidth = 1.1; g.beginPath();
  for (const [rx, len, ph] of p.roots) { const sx = rx + Math.sin(tm * 1.3 + ph) * 3; g.moveTo(rx, p.y + 12); g.quadraticCurveTo(rx, p.y + 12 + len * 0.6, sx, p.y + 14 + len); }
  g.globalCompositeOperation = 'source-over'; g.stroke(); g.globalCompositeOperation = 'lighter';
  for (const [rx, len, ph, b] of p.roots) if (b) { const sx = rx + Math.sin(tm * 1.3 + ph) * 3; dglow(ph < 1.2 ? '#c9a2ff' : bio, sx, p.y + 15 + len, 7, 0.85); }
  g.globalCompositeOperation = 'source-over';
}
function dnBranch(p, tm, bio) {   // yosunlu dal: koyu gövde, kenar ışığı, ışıyan kabuk çatlakları, sarkan yosun
  const lc = p.sak ? '#d6b8ff' : bio, y = p.y;
  g.fillStyle = dc('near'); g.fill(p.twigs); g.fill(p.leaves);
  if (p.joint) { g.save(); g.translate(0, -1.4); g.fillStyle = dc('rim', 0.45); g.fill(p.joint); g.restore(); g.fillStyle = dc('near'); g.fill(p.joint); }
    g.save(); g.translate(0, -1.6); g.fillStyle = dc('rim', 0.5); g.fill(p.path); g.restore();
  const pg = g.createLinearGradient(0, y, 0, y + 30); pg.addColorStop(0, dc('mid')); pg.addColorStop(0.35, dc('near')); pg.addColorStop(1, '#010309');
  g.fillStyle = pg; g.fill(p.path);
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = dc('rim', 0.07); g.lineWidth = 7; g.stroke(p.path);
  for (const pts of p.cracks) {   // kabuk çatlakları (nabız gibi)
    const a = 0.22 + 0.12 * Math.sin(tm * 1.4 + pts[0][0] * 0.01);
    g.strokeStyle = dnRgba(lc, a * 0.35); g.lineWidth = 3; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke();
    g.strokeStyle = dnRgba(lc, a); g.lineWidth = 0.9; g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = dc('near'); g.lineWidth = 1.2; g.beginPath();   // sarkan yosun
  for (const [mx, my, len, ph] of p.moss) { const sw = Math.sin(tm * 1.2 + ph) * 2.2; g.moveTo(mx, my - 4); g.quadraticCurveTo(mx + sw * 0.4, my + len * 0.5, mx + sw, my + len); }
  g.stroke();
  g.globalCompositeOperation = 'lighter';
  for (const [mx, my, len, ph] of p.moss) if (ph < 1.6) dglow(p.sak ? (ph < 0.8 ? '#ffc4ef' : '#c9a2ff') : bio, mx + Math.sin(tm * 1.2 + ph) * 2.2, my + len + 2, 6, 0.7);
  for (const [lx, ly, ph, s] of p.lich) dglow(p.sak ? (ph < 2 ? '#ffd0f0' : '#d6b8ff') : ph < 1 ? dq('warm') : bio, lx, ly, 5 * s, 0.4 + 0.25 * Math.sin(tm * 1.8 + ph));
  g.strokeStyle = dc('rim', 0.85); g.lineWidth = 1.2; g.beginPath(); g.moveTo(p.x0 - 4, y - 0.5); g.lineTo(p.x1 + 4, y - 0.5); g.stroke();
  g.globalCompositeOperation = 'source-over';
}
function dnMush(d, tm, bio) {
  const col = d.vio ? '#b88aff' : d.pink ? '#ff9ad8' : bio, pul = 0.8 + 0.2 * Math.sin(tm * 1.8 + d.ph), big = d.it[0][1] > 1.1;
  g.globalCompositeOperation = 'lighter';
  dnEG(col, d.x, d.y, big ? 60 : 46, 9, 0.35 * pul);
  dglow(col, d.x, d.y - 8, big ? 40 : 30, 0.38 * pul);
  g.globalCompositeOperation = 'source-over';
  const cap = d.vio ? '#e2d0ff' : d.pink ? '#ffd6ee' : '#b8fff4', gill = d.vio ? 'rgba(160,110,255,0.9)' : d.pink ? 'rgba(255,120,200,0.9)' : dc('bio', 0.9);
  for (const [dx, s] of d.it) {
    const x = d.x + dx, h = 9 * s, sq = 1 + Math.sin(tm * 2 + d.ph + dx) * 0.03;
    g.fillStyle = '#0c2030'; g.fillRect(x - 0.9 * s, d.y - h, 1.8 * s, h);
    g.fillStyle = cap;
    g.beginPath(); g.ellipse(x, d.y - h, 5.5 * s * sq, 3.6 * s / sq, 0, Math.PI, 6.283); g.fill();
    g.fillStyle = gill; g.beginPath(); g.ellipse(x, d.y - h, 5.5 * s * sq, 1.2 * s, 0, 0, Math.PI); g.fill();
    if (s > 0.9) { g.fillStyle = 'rgba(255,255,255,0.65)'; g.beginPath(); g.arc(x - 2 * s, d.y - h - 2 * s, 0.9 * s, 0, 6.283); g.arc(x + 1.6 * s, d.y - h - 2.6 * s, 0.6 * s, 0, 6.283); g.fill(); }
  }
}
function dnBulb(d, tm) {
  const sw = Math.sin(tm * 1.2 + d.ph) * 2.5, tx = d.x + sw, ty = d.y - d.h;
  g.strokeStyle = dc('grass'); g.lineWidth = 1.3;
  g.beginPath(); g.moveTo(d.x, d.y); g.quadraticCurveTo(d.x - 3, d.y - d.h * 0.6, tx, ty); g.quadraticCurveTo(tx + 5, ty + 1, tx + 6, ty + 6); g.stroke();
  const pul = 0.75 + 0.25 * Math.sin(tm * 2.2 + d.ph);
  g.globalCompositeOperation = 'lighter';
  dglow(dq('warm'), tx + 6, ty + 8, 22, 0.45 * pul); dglow('#ffffff', tx + 6, ty + 8, 4, 0.7);
  dnEG(dq('warm'), d.x, d.y, 26, 5, 0.25 * pul);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = dc('warm', 0.95); g.beginPath(); g.ellipse(tx + 6, ty + 8, 2.6, 3.4, 0, 0, 6.283); g.fill();
}
function dnFern(d, tm) {
  if (!d.path) {
    d.path = new Path2D();
    for (let f = 0; f < 3; f++) {
      const a0 = -1.9 + f * 0.55, L = 26 - f * 4;
      for (let i = 1; i < 7; i++) {
        const u = i / 7, px = Math.cos(a0) * L * u + u * u * 8, py = Math.sin(a0) * L * u + u * u * 10, ll = 7 * (1 - u) + 2;
        dnLeaf(d.path, px, py, ll, 1.8, a0 - 1.2); dnLeaf(d.path, px, py, ll, 1.8, a0 + 1.2);
      }
    }
  }
  g.save(); g.translate(d.x, d.y); g.scale(d.fl * d.s, d.s); g.rotate(Math.sin(tm * 0.9 + d.ph) * 0.05);
  g.fillStyle = dc('grass'); g.fill(d.path); g.restore();
}
function dnBush(d, tm) {   // yumuşak, yuvarlak çalı (pofuduk gibi tombul), üstünde ışıltılar
  if (!d.path) {
    const R = rng(d.seed); d.path = new Path2D(); d.dots = [];
    const n = 4 + Math.floor(R() * 3);
    for (let i = 0; i < n; i++) { const a = Math.PI + (i + 0.5) / n * Math.PI, r = 9 + R() * 6, x = Math.cos(a) * 14, y = Math.sin(a) * 8 - 4; d.path.moveTo(x + r, y); d.path.ellipse(x, y, r, r * 0.85, 0, 0, 6.283); if (R() < 0.6) d.dots.push([x + (R() - 0.5) * r, y - r * 0.5, R() * 6]); }
    d.path.rect(-18, -6, 36, 6);
  }
  const br = 1 + Math.sin(tm * 1.1 + d.ph) * 0.02;
  g.save(); g.translate(d.x, d.y); g.scale(d.s, d.s * br);
  g.save(); g.translate(0, -1.4); g.fillStyle = dc('rim', 0.4); g.fill(d.path); g.restore();
  g.fillStyle = dc('grass'); g.fill(d.path);
  g.globalCompositeOperation = 'lighter';
  for (const [x, y, ph] of d.dots) dglow(ph < 2 ? '#ffc4e8' : dq('bio'), x, y, 4, 0.5 + 0.3 * Math.sin(tm * 2 + ph));
  g.globalCompositeOperation = 'source-over'; g.restore();
}
function dnReed(d, tm) {   // göl kıyısında kamış/saz, uçlarda ışık
  g.strokeStyle = dc('grass'); g.lineWidth = 1.5; g.beginPath();
  for (const [dx, h, ph] of d.it) { const sw = Math.sin(tm * 0.9 + ph) * 3; g.moveTo(d.x + dx, d.y); g.quadraticCurveTo(d.x + dx, d.y - h * 0.6, d.x + dx + sw, d.y - h); }
  g.stroke();
  for (const [dx, h, ph, cat] of d.it) if (cat) { const sw = Math.sin(tm * 0.9 + ph) * 3; g.fillStyle = dc('near'); g.beginPath(); g.ellipse(d.x + dx + sw * 0.95, d.y - h + 5, 2.2, 6, sw * 0.04, 0, 6.283); g.fill(); }
  g.globalCompositeOperation = 'lighter';
  for (const [dx, h, ph, cat] of d.it) if (!cat) dglow(dq('bio'), d.x + dx + Math.sin(tm * 0.9 + ph) * 3, d.y - h, 4, 0.5);
  g.globalCompositeOperation = 'source-over';
}
function dnDawnFlower(d, tm) {   // renkler dalga dalga geri gelir (Gris): aydınlıkla ya da yakında açan bir ışık çiçeğiyle
  const o = smooth(clamp(Math.max((light - d.thr) / 0.2 + 0.25, dnBloomAt(d.x) * 1.2 - d.thr * 0.3), 0, 1));
  if (o <= 0.01) return;
  const sw = Math.sin(tm * 1.4 + d.ph) * 2, hh = 10 * d.s * o;
  g.strokeStyle = dc('grass'); g.lineWidth = 1.2; g.beginPath(); g.moveTo(d.x, d.y); g.quadraticCurveTo(d.x, d.y - hh * 0.6, d.x + sw, d.y - hh); g.stroke();
  g.globalCompositeOperation = 'lighter'; dglow(d.hue, d.x + sw, d.y - hh, 13 * d.s * o, 0.45); g.globalCompositeOperation = 'source-over';
  g.fillStyle = d.hue;
  for (let i = 0; i < 5; i++) { const a = i * 1.2566 + tm * 0.3; g.beginPath(); g.ellipse(d.x + sw + Math.cos(a) * 2.6 * o * d.s, d.y - hh + Math.sin(a) * 2.6 * o * d.s, 2.2 * o * d.s, 1.4 * o * d.s, a, 0, 6.283); g.fill(); }
}

// ── açılmış ışık çiçeklerinin çevresi: renk geri gelir ──
const DN_FLW = NESNELER.filter(n => n.tip === 'cicek');
function dnBloomAt(x) {
  let m = 0;
  for (const f of DN_FLW) { if (!f.done || f.bt == null || f.bt < 0) continue; const d = Math.abs(f.x - x), r = Math.min(260, (now - f.bt) * 220); if (d < r + 60) m = Math.max(m, clamp((r + 60 - d) / 80, 0, 1)); }
  return m;
}

// ── ışık çiçeği: kapalıyken davetkâr turkuaz tomurcuk, açınca altın-beyaz ışık (TUR 'cicek') ──
let dnFlowerSpr = null, dnFlowerSc = 0;
function dnFlowerSprite() {
  const sc = Math.min(4, dnCS() * 1.2), sz = 70;
  if (dnFlowerSpr && dnFlowerSc === sc) return dnFlowerSpr;
  const c = dnFlowerSpr || document.createElement('canvas'); c.width = c.height = Math.ceil(sz * sc);
  const x = c.getContext('2d'); x.setTransform(sc, 0, 0, sc, sz / 2 * sc, sz / 2 * sc);
  const ring = (n, len, wid, a0, c0, c1, c2) => {
    const rg = x.createRadialGradient(0, 0, 0, 0, 0, len); rg.addColorStop(0, c0); rg.addColorStop(0.55, c1); rg.addColorStop(1, c2);
    x.fillStyle = rg; const p = new Path2D();
    for (let i = 0; i < n; i++) { const a = a0 + i * 6.283 / n; dnLeaf(p, Math.cos(a) * 2, Math.sin(a) * 2, len, wid, a); }
    x.fill(p);
  };
  ring(8, 30, 8, 0.2, '#fffbe8', '#ffe2a0', 'rgba(127,240,230,0.85)');
  ring(8, 21, 6.5, 0.2 + 0.39, '#ffffff', '#fff0c8', 'rgba(255,200,170,0.95)');
  ring(6, 12, 4.5, 0.5, '#ffffff', '#fffbe8', '#ffe6a8');
  x.fillStyle = '#ffd36a'; x.beginPath(); x.arc(0, 0, 4.2, 0, 6.283); x.fill();
  x.fillStyle = '#fff8e0'; for (let i = 0; i < 7; i++) { const a = i * 0.9; x.beginPath(); x.arc(Math.cos(a) * 2.4, Math.sin(a) * 2.4, 0.7, 0, 6.283); x.fill(); }
  dnFlowerSc = sc; return dnFlowerSpr = c;
}
function dnFlower(fl, tm) {
  const o = smooth(clamp(fl.open, 0, 1)), x = fl.x, y = fl.y, pulse = 0.5 + 0.5 * Math.sin(tm * 2.4 + x);
  const e = fl.bt >= 0 ? now - fl.bt : -1, pop = e >= 0 ? Math.sin(Math.min(e, 3) * 7) * Math.exp(-e * 2.6) * 0.35 : 0;
  const sw = Math.sin(tm * 1.1 + x) * 1.2, hx = x + sw, hy = y - 26 - o * 4;
  const gold = '#ffd890', cyan = '#7ff0ff';
  g.globalCompositeOperation = 'lighter';
  dnEG(o > 0.3 ? gold : cyan, x, y + 1, 70 + o * 90, 10 + o * 8, 0.35 + o * 0.35);   // yerdeki ışık havuzu ve hale
  dglow(cyan, hx, hy, 46 + pulse * 10, 0.4 * (1 - o) + 0.12);
  if (o > 0.01) { dglow(gold, hx, hy, 70 + o * 60, 0.5 * o); dglow('#ffffff', hx, hy, 22 + o * 10, 0.5 * o); }
  if (e >= 0 && e < 3) {   // açılış anı: yerde yayılan ışık halkası + göğe yükselen ışık sütunu
    const k = e / 3, rr = 30 + e * 160;
    g.strokeStyle = `rgba(255,226,160,${0.55 * (1 - k)})`; g.lineWidth = 3 * (1 - k) + 0.5;
    g.beginPath(); g.ellipse(x, y + 1, rr, rr * 0.13, 0, 0, 6.283); g.stroke();
    dnEG('#fff2cc', x, y + 1, rr, rr * 0.16, 0.25 * (1 - k));
    const sh = dnShaft('#ffe6b0'); g.globalAlpha = 0.55 * Math.sin(Math.min(1, e / 2.4) * Math.PI);
    g.drawImage(sh, x - 40, y - 420, 80, 440); g.globalAlpha = 1;
    dglow('#ffffff', hx, hy, 90 * (1 - k), 0.6 * (1 - k));
  }
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = '#163e3e'; g.lineWidth = 2.2; g.lineCap = 'round';   // sap ve yapraklar
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 4, y - 12, hx, hy + 4); g.stroke();
  if (!fl.lp) { fl.lp = new Path2D(); dnLeaf(fl.lp, -1, -5, 13, 3.5, -2.6); dnLeaf(fl.lp, -1, -9, 12, 3.2, -0.5); dnLeaf(fl.lp, 0, -2, 9, 2.6, -0.2); }
  g.save(); g.translate(x, y); g.fillStyle = o > 0.5 ? '#2a6050' : '#1d5248'; g.fill(fl.lp);
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = o > 0.5 ? 'rgba(255,226,160,0.4)' : 'rgba(127,240,230,0.35)'; g.lineWidth = 0.8; g.stroke(fl.lp); g.restore(); g.globalCompositeOperation = 'source-over';
  if (o < 0.99) {   // kapalı tomurcuk (açtıkça söner)
    const b = 1 - o, s = 1 + pulse * 0.06;
    g.save(); g.translate(hx, hy + 2); g.scale(s * (1 + o * 0.6), s * b + 0.001);
    const bg = g.createLinearGradient(0, 4, 0, -14); bg.addColorStop(0, '#2a8a8a'); bg.addColorStop(0.5, '#9ff6ff'); bg.addColorStop(1, '#ffffff');
    g.fillStyle = bg; g.beginPath(); g.moveTo(0, -15); g.bezierCurveTo(8, -9, 7, 2, 0, 4); g.bezierCurveTo(-7, 2, -8, -9, 0, -15); g.fill();
    g.strokeStyle = 'rgba(40,120,130,0.8)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(0, 3); g.quadraticCurveTo(3, -5, 0, -14); g.moveTo(0, 3); g.quadraticCurveTo(-3, -5, 0, -14); g.stroke();
    g.restore();
    g.globalCompositeOperation = 'lighter';   // davetkâr dönen kıvılcımlar
    for (let i = 0; i < 3; i++) { const a = tm * 1.6 + i * 2.094; dglow('#c8fbff', hx + Math.cos(a) * 16, hy - 4 + Math.sin(a) * 7, 5, 0.8 * b); }
    g.globalCompositeOperation = 'source-over';
  }
  if (o > 0.01) {   // açık çiçek (önbellekli sprite, döner; açılırken esneyerek büyür)
    const spr = dnFlowerSprite(), sz = 70 * (0.3 + 0.7 * o) * (1 + pulse * 0.03 + pop);
    g.save(); g.translate(hx, hy); g.rotate(tm * 0.15 + x + (1 - o) * 1.5); g.scale(1, 0.92); g.globalAlpha = Math.min(1, o * 1.5);
    g.drawImage(spr, -sz / 2, -sz / 2, sz, sz); g.restore(); g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const k = (tm * 0.35 + i / 5) % 1; dglow(i % 2 ? gold : '#ffffff', hx + Math.sin(i * 2.3 + tm) * 14 * k, hy - k * 60, 4 * (1 - k) + 1, (1 - k) * 0.8 * o); }
    g.globalCompositeOperation = 'source-over';
  }
}
TUR.kaydet('cicek', {
  kur(o) { o.open = 0; o.bt = -1; },
  guncelle(o, dt) { o.open = lerp(o.open || 0, o.done ? 1 : 0, 1 - Math.exp(-dt * 2.6)); if (o.done && o.bt < 0) o.bt = now; },
  ciz(o, tm) { dnFlower(o, tm); },
});

// ── ışık tohumu: değerli, minik altın tohum; alınca Pırıl'a uçar (TUR 'tohum') ──
let dnSeedSpr = null, dnSeedSc = 0;
function dnSeedSprite() {
  const sc = Math.min(4, dnCS() * 1.5), sz = 32;
  if (dnSeedSpr && dnSeedSc === sc) return dnSeedSpr;
  const c = dnSeedSpr || document.createElement('canvas'); c.width = c.height = Math.ceil(sz * sc);
  const x = c.getContext('2d'); x.setTransform(sc, 0, 0, sc, sz / 2 * sc, sz / 2 * sc);
  const body = new Path2D(); body.moveTo(0, -9); body.bezierCurveTo(6.5, -5, 6.5, 6, 0, 8.5); body.bezierCurveTo(-6.5, 6, -6.5, -5, 0, -9);
  const rg = x.createRadialGradient(-1.5, -2, 0.5, 0, 0, 10); rg.addColorStop(0, '#ffffff'); rg.addColorStop(0.35, '#fff1b8'); rg.addColorStop(0.75, '#ffc94a'); rg.addColorStop(1, '#e08a1c');
  x.fillStyle = rg; x.fill(body);
  x.strokeStyle = 'rgba(255,250,220,0.9)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(0, -7); x.quadraticCurveTo(2.2, 0, 0, 7); x.stroke();
  const lf = new Path2D(); dnLeaf(lf, 0, -8.5, 7, 2.4, -1.1); dnLeaf(lf, 0, -8.5, 5.5, 2, -2.2);   // minik filiz
  x.fillStyle = '#b8ffcf'; x.fill(lf);
  x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(-2, -3, 1.4, 2.4, -0.4, 0, 6.283); x.fill();
  dnSeedSc = sc; return dnSeedSpr = c;
}
function dnSeedAt(x, y, sc, rot, a, tm) {
  g.globalCompositeOperation = 'lighter';
  dglow('#ffd27a', x, y, 48 * sc, 0.55 * a); dglow('#fff2cc', x, y, 14 * sc, 0.75 * a);
  g.globalCompositeOperation = 'source-over';
  const spr = dnSeedSprite(), s = 32 * sc;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a; g.drawImage(spr, -s / 2, -s / 2, s, s); g.restore(); g.globalAlpha = 1;
}
TUR.kaydet('tohum', {
  kur(o) { o.al = -1; o.ph = (o.x * 0.013) % 6.28; },
  guncelle(o, dt) {
    if (o.done && o.al < 0) { o.al = 0; o.fx = o.x; o.fy = o.y - 24 + Math.sin(now * 2 + o.ph) * 4; }
    if (o.al >= 0 && o.al < 1) o.al = Math.min(1, o.al + dt / 1.25);
  },
  ciz(o, tm) {
    if (o.done) return;
    if (o.x < cam.x - 80 || o.x > cam.x + VW + 80) return;
    const bob = Math.sin(tm * 2 + o.ph) * 4, x = o.x, y = o.y - 24 + bob, br = 0.5 + 0.5 * Math.sin(tm * 3 + o.ph);
    g.globalCompositeOperation = 'lighter';
    dnEG('#ffd890', x, o.y, 30, 5, 0.35 + br * 0.15);   // altında minik ışık havuzu
    const sh = dnShaft('#ffe6b0'); g.globalAlpha = 0.18 + br * 0.1; g.drawImage(sh, x - 9, y - 150, 18, 160); g.globalAlpha = 1;   // yukarı uzanan ince ışık ipucu
    for (let i = 0; i < 3; i++) { const a = tm * 2.2 + i * 2.094 + o.ph; dglow(i ? '#fff2cc' : '#ffffff', x + Math.cos(a) * 15, y + Math.sin(a) * 6, 3.5, 0.75); }
    g.globalCompositeOperation = 'source-over';
    dnSeedAt(x, y, 1 + br * 0.06, Math.sin(tm * 1.3 + o.ph) * 0.25, 1, tm);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.6 + br * 0.4;
    g.drawImage(dnStar('#fff2cc'), x - 2 - 14, y - 5 - 14, 28, 28); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  },
  cizOn(o, tm) {   // alınma: yükselir, parlar, kavis çizerek Pırıl'a uçar
    if (o.al < 0 || o.al >= 1) return;
    const a = o.al;
    let x, y, sc, al = 1;
    if (a < 0.28) { const k = smooth(a / 0.28); x = o.fx; y = o.fy - k * 34; sc = 1 + k * 0.6; }
    else { const k = smooth((a - 0.28) / 0.72), sx = o.fx, sy = o.fy - 34, ex = D.x, ey = D.y, mx = (sx + ex) / 2, my = Math.min(sy, ey) - 90;
      const m = 1 - k; x = m * m * sx + 2 * m * k * mx + k * k * ex; y = m * m * sy + 2 * m * k * my + k * k * ey; sc = 1.6 - k * 1.1; al = 1 - Math.max(0, (k - 0.85) / 0.15);
      g.globalCompositeOperation = 'lighter';
      for (let i = 1; i <= 7; i++) { const kk = Math.max(0, k - i * 0.035), mm = 1 - kk; const tx = mm * mm * sx + 2 * mm * kk * mx + kk * kk * ex, ty = mm * mm * sy + 2 * mm * kk * my + kk * kk * ey; dglow(i % 2 ? '#ffe6a0' : '#ffffff', tx + Math.sin(tm * 9 + i) * 2, ty, 7 - i * 0.6, 0.6 * (1 - i / 8)); }
      if (k > 0.85) { const f = (k - 0.85) / 0.15; dglow('#fff2cc', ex, ey, 30 + f * 70, 0.7 * (1 - f)); }
      g.globalCompositeOperation = 'source-over';
    }
    g.globalCompositeOperation = 'lighter'; dglow('#ffffff', x, y, 40 * sc, 0.4 * (a < 0.3 ? a / 0.3 : 1) * al); g.globalCompositeOperation = 'source-over';
    dnSeedAt(x, y, sc, tm * 6, al, tm);
  },
});

// ── nilüfer: ışık nefesiyle sudan yükselir, ışık patlamasıyla açar (TUR 'nilufer') ──
const DN_RINGS = [];   // suda yayılan halkalar (dünya birimi)
function dnPadPath(o) {
  if (o.pp) return o.pp;
  const p = new Path2D(), rx = 32, ry = 8, gap = 0.42, a0 = o.ph % 6.28;
  p.moveTo(0, 0); p.ellipse(0, 0, rx, ry, 0, a0 + gap / 2, a0 + 6.283 - gap / 2); p.closePath();
  return o.pp = p;
}
TUR.kaydet('nilufer', {
  kur(o) {
    o.acik = 0; o.t0 = -1; o.ph = 1 + (o.x * 0.37) % 4.5; o.sink = 0; o.on = false; o.cicekli = Math.round(o.x / T) % 2 === 1;
    o.cisim = { w: 64, h: 6, tip: 'ustten', aktif: false, dx: 0, dy: 0 };
    OLAY.on('aydinlat', gr => {
      if (gr !== o.grup || o.t0 >= 0) return;
      let mn = Infinity; for (const n of NESNELER) if (n.tip === 'nilufer' && n.grup === o.grup) mn = Math.min(mn, n.x);
      o.t0 = now + (o.x - mn) / T * 0.06;
    });
  },
  guncelle(o, dt) {
    if (o.t0 >= 0 && now >= o.t0) {
      if (o.acik === 0) { DN_RINGS.push({ x: o.x, y: o.y + 4, t: now, big: true }); burst(o.x, o.y - 10, 16, ['#bff6ff', '#ffe9b8', '#ffd0f0'], 110, 1.3, 7); }
      o.acik = Math.min(1, o.acik + dt / 1.2);
      if (o.acik > 0.3) o.cisim.aktif = true;
    }
    const on = o.cisim.aktif && P.ground && Math.abs(P.x - o.x) < 34 && Math.abs(P.y - (o.y - 6)) < 2;
    if (on && !o.on) DN_RINGS.push({ x: o.x, y: o.y + 4, t: now });
    o.on = on; o.sink = lerp(o.sink, on ? 2.5 : 0, 1 - Math.exp(-dt * 10));
  },
  ciz(o, tm) {
    const a = o.acik; if (a <= 0.001) return;
    const e = smooth(a), pop = 1 + Math.sin(Math.min(1, a) * Math.PI * 1.5) * 0.12 * (1 - a), bob = Math.sin(tm * 1.3 + o.ph) * 0.8 + o.sink;
    const x = o.x, y = o.y - 5 + (1 - e) * 10 + bob, sc = (0.35 + 0.65 * e) * pop;
    g.globalCompositeOperation = 'lighter';
    dnEG('#7ff0e0', x, o.y + 2, 60 * sc, 10, 0.4 * e);
    if (a < 1) { dglow('#fff2cc', x, y - 10, 140 * (1 - a * 0.6), 0.65 * Math.sin(a * Math.PI)); dglow('#9ff6ff', x, y, 70, 0.5 * Math.sin(a * Math.PI)); }
    g.globalCompositeOperation = 'source-over';
    g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha = Math.min(1, a * 2.5);
    const pp = dnPadPath(o);
    g.fillStyle = '#0a2a2a'; g.save(); g.translate(0, 3); g.fill(pp); g.restore();   // kalınlık
    const pg = g.createRadialGradient(-6, -2, 2, 0, 0, 34); pg.addColorStop(0, '#3fd0a8'); pg.addColorStop(0.7, '#1f8a78'); pg.addColorStop(1, '#156a64');
    g.fillStyle = pg; g.fill(pp);
    g.globalCompositeOperation = 'lighter';
    g.strokeStyle = 'rgba(160,255,230,0.35)'; g.lineWidth = 0.9; g.beginPath();
    for (let i = 0; i < 9; i++) { const an = o.ph + 0.6 + i * 0.62; g.moveTo(0, 0); g.lineTo(Math.cos(an) * 28, Math.sin(an) * 6.5); }
    g.stroke();
    g.strokeStyle = 'rgba(190,255,240,0.6)'; g.lineWidth = 1.1; g.stroke(pp);
    g.globalCompositeOperation = 'source-over';
    if (o.cicekli) {   // nilüfer çiçeği: pembe-beyaz, ışıyan
      const fx = 10 * Math.cos(o.ph), fo = smooth(clamp((a - 0.35) / 0.65, 0, 1));
      if (fo > 0) {
        g.globalCompositeOperation = 'lighter'; dglow('#ffd0f0', fx, -6, 30, 0.6 * fo); g.globalCompositeOperation = 'source-over';
        for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) {
          const an = -Math.PI / 2 + (i - 2) * (0.42 + r * 0.12) * fo, len = (r ? 10 : 13) * fo;
          g.fillStyle = r ? '#fff6fb' : '#ffb8e0'; const lp = new Path2D(); dnLeaf(lp, fx, -2, len, 3.4, an); g.fill(lp);
        }
        g.fillStyle = '#ffe28a'; g.beginPath(); g.arc(fx, -4, 2.2 * fo, 0, 6.283); g.fill();
      }
    }
    g.restore(); g.globalAlpha = 1;
  },
});

// ── Büyük Işık Ağacı: önbellekli iki hâl (soğuk ↔ yanınca altın); yanınca ışık gövdeden dışa yayılır (TUR 'agac') ──
const DN_TB = { x0: -400, x1: 400, y0: -540, y1: 60 };
let dnTreeG = null, dnTreeCool = null, dnTreeWarm = null, dnTreeSc = 0;
function dnTreeGeo(o) {
  let rs = 1;   // kökler ağacın durduğu düzlüğe sığsın (uçurumdan boşluğa sarkmasın)
  if (o) { const c = Math.floor(o.x / T), t = topOf(c); let a = c, b = c; while (a > 0 && topOf(a - 1) === t) a--; while (b < COLS - 1 && topOf(b + 1) === t) b++; rs = clamp(Math.min(o.x - a * T, (b + 1) * T - o.x) / 335, 0.45, 1); }
  const R = rng(4242), G = { parts: [], cracks: [], crown: new Path2D(), crownBack: new Path2D(), leaves: [], backLeaves: [], vines: [], ridges: [] };
  const jag = (pts, amt) => pts.map(([x, y], i) => [x + (i && i < pts.length - 1 ? (R() - 0.5) * amt : 0), y]);
  let ri = 0;   // kök yayılımı
  for (const [s, d, e, w] of [[-1, 210, 14, 30], [1, 240, 10, 30], [-1, 120, 6, 22], [1, 135, 4, 24], [-1, 320, 24, 18], [1, 330, 22, 18], [1, 70, -2, 16], [-1, 60, 0, 16]]) {
    const dd = d * rs, p = [s * 26, -80, s * (48 + dd * 0.12), -50, s * dd * 0.6, -16 - w * 0.2, s * dd, e];
    G.parts.push(dnTaper(p, w + 6, 3));
    if (ri++ < 2) { const pts = []; for (let u = 0.08; u <= 0.62; u += 0.06) { const q = dnBez(p, u); pts.push([q[0], q[1] - 2]); } G.cracks.push(jag(pts, 5)); }
  }
  const cxT = t => Math.sin(t * 3.4 + 0.5) * 14 - 6, hwT = t => 46 * (1 - 0.36 * t) + 62 * Math.pow(1 - t, 6) + Math.sin(t * 17) * 2.6 + (t > 0.85 ? (t - 0.85) * 120 : 0);
  const L = [], Rr = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; L.push([cxT(t) - hwT(t), -t * 320]); Rr.push([cxT(t) + hwT(t), -t * 320]); }
  const trunk = new Path2D(); dnSmooth(trunk, L.concat(Rr.reverse())); G.parts.push(trunk);
  for (let s = 0; s < 4; s++) { const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([cxT(t) + Math.sin(t * 5 + s * 1.7) * 26 * (1 - 0.3 * t) + (s - 1.5) * 9, -t * 300]); } G.ridges.push(pts); }
  for (const [x0, k] of [[-18, 0.45], [10, 0.6], [-2, 0.35]]) {   // gövdedeki ışık çatlakları (dallanan)
    const pts = []; let x = x0;
    for (let y = -30; y >= -300; y -= 14) {
      const t = -y / 320; x = clamp(x + (R() - 0.5) * 12, cxT(t) - hwT(t) * k - 6, cxT(t) + hwT(t) * k + 6); pts.push([x, y]);
      if (R() < 0.18) { const sd = R() < 0.5 ? -1 : 1, br = [[x, y]]; let bx = x, by = y; for (let j = 0; j < 3; j++) { bx += sd * (5 + R() * 8); by -= 6 + R() * 8; br.push([bx, by]); } G.cracks.push(br); }
    }
    G.cracks.push(pts);
  }
  const limbs = [[-14, -250, -70, -330, -170, -350, -265, -420, 30], [12, -262, 70, -340, 160, -360, 275, -430, 30],
    [-6, -290, -24, -370, -70, -430, -100, -505, 24], [6, -290, 34, -380, 80, -440, 120, -505, 24],
    [-24, -215, -100, -245, -200, -250, -320, -300, 20], [24, -222, 110, -250, 215, -265, 330, -310, 20], [0, -300, 4, -380, -6, -450, 6, -520, 20]];
  for (const [a, b, c, d, e, f, h, k, w] of limbs) {
    const p = [a, b, c, d, e, f, h, k]; G.parts.push(dnTaper(p, w, 5));
    const pts = []; for (let u = 0.04; u <= 0.3; u += 0.04) pts.push(dnBez(p, u)); G.cracks.push(jag(pts, 6));
    for (const u of [0.45, 0.72]) {
      const q = dnBez(p, u), sd = R() < 0.5 ? -1 : 1, l = 60 + R() * 70, an = Math.atan2(k - b, h - a) + sd * (0.5 + R() * 0.5);
      const ex = q[0] + Math.cos(an) * l, ey = q[1] + Math.sin(an) * l;
      G.parts.push(dnTaper([q[0], q[1], q[0] + Math.cos(an) * l * 0.4, q[1] + Math.sin(an) * l * 0.4 - 10, ex - Math.cos(an) * l * 0.3, ey - 6, ex, ey], w * 0.42, 1.5));
      if (R() < 0.75 && q[1] > -380) G.vines.push([q[0], q[1] + 4, Math.min(60 + R() * 150, -70 - q[1]), R() * 6]);
    }
  }
  const env = x => { const t = Math.min(1, Math.abs(x) / 345); return [-540 + t * t * 150, -330 + t * t * 25]; };
  const blob = (path, cx, cy, r, leavesOut, n) => {
    path.moveTo(cx + r, cy); path.ellipse(cx, cy, r, r * 0.6, 0, 0, 6.283);
    for (let i = 0; i < n; i++) {
      const a = R() * 6.283, lx = cx + Math.cos(a) * r * 0.85, ly = cy + Math.sin(a) * r * 0.52;
      let ang = a + (R() - 0.5) * 0.9; if (Math.sin(a) > 0) ang = lerp(ang, Math.PI / 2, 0.55);
      dnLeaf(path, lx, ly, 12 + R() * 14, 3.5 + R() * 3.5, ang);
    }
  };
  for (let i = 0; i < 22; i++) { const cx = (R() * 2 - 1) * 320, [yt] = env(cx); blob(G.crownBack, cx, yt + 10 + R() * 50, 40 + R() * 40, true, 26); }
  for (let i = 0; i < 46; i++) {
    const cx = (R() * 2 - 1) * 335, [yt, yb] = env(cx), cy = lerp(yt + 40, yb - 25, R()), r = (38 + R() * 38) * (1 - Math.abs(cx) / 900);
    blob(G.crown, cx, cy, r, true, Math.floor(r * 0.75));
    if (cy > yb - 60 && R() < 0.5) G.vines.push([cx + (R() - 0.5) * r, cy + r * 0.45, 30 + R() * 110, R() * 6]);
  }
  for (let i = 0; i < 300; i++) { const cx = (R() * 2 - 1) * 330, [yt, yb] = env(cx), cy = lerp(yt + 20, yb, Math.pow(R(), 0.8)); G.leaves.push([cx, cy, 8 + R() * 10, 2.5 + R() * 2.5, R() * 6.283, R()]); }
  for (let i = 0; i < 90; i++) { const cx = (R() * 2 - 1) * 310, [yt] = env(cx); G.backLeaves.push([cx, yt + R() * 60, 8 + R() * 9, 2.5 + R() * 2, R() * 6.283, R()]); }
  return G;
}
function dnTreePaint(c, sc, warm) {
  const G = dnTreeG, w = Math.ceil((DN_TB.x1 - DN_TB.x0) * sc), h = Math.ceil((DN_TB.y1 - DN_TB.y0) * sc);
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h);
  x.setTransform(sc, 0, 0, sc, -DN_TB.x0 * sc, -DN_TB.y0 * sc); x.lineCap = 'round'; x.lineJoin = 'round';
  const rim = warm ? 'rgba(255,220,150,0.9)' : 'rgba(110,236,240,0.65)', body = warm ? '#0d1316' : '#040d17', leafB = warm ? '#12302a' : '#05111b';
  const vein = warm ? '#ffe2a0' : '#7ff2ff', glowc = warm ? '#ffd890' : '#5fe8ff';
  const leafPass = (list, cols, alpha, skip) => {   // renk × parlaklık kovalarına toplu çizim (yaprak başına Path2D yok)
    const NB = 3, bk = [];
    for (const [lx, ly, len, wid, ang, r] of list) {
      if (r > skip) continue;
      const ci = Math.floor(r / skip * cols.length * 0.999), ai = Math.min(NB - 1, Math.floor(r / skip * NB)), key = ci * NB + ai;
      dnLeaf(bk[key] || (bk[key] = new Path2D()), lx, ly, len, wid, ang);
    }
    for (let key = 0; key < bk.length; key++) if (bk[key]) { const ci = Math.floor(key / NB), ai = key % NB; x.globalAlpha = alpha * (0.45 + (ai + 0.5) / NB * 0.55); x.fillStyle = cols[ci]; x.fill(bk[key]); }
    x.globalAlpha = 1;
  };
  x.globalCompositeOperation = 'lighter';
  dnG(x, glowc, 0, -400, 360, warm ? 0.5 : 0.25); dnG(x, warm ? '#fff2cc' : '#9ff6ff', 0, -230, 220, warm ? 0.3 : 0.12);
  x.globalCompositeOperation = 'source-over';
  x.save(); x.translate(0, 2); x.fillStyle = rim; x.globalAlpha = 0.5; x.fill(G.crownBack); x.restore(); x.globalAlpha = 1;
  x.fillStyle = warm ? '#16302e' : '#0a2232'; x.fill(G.crownBack);
  leafPass(G.backLeaves, warm ? ['#ffe6a0', '#bff6e0', '#ffd0b0'] : ['#3fd8ff', '#56f0dc'], warm ? 0.55 : 0.35, warm ? 0.8 : 0.45);
  for (const [dx, dy, a] of [[2.4, -1, 1], [-2, -1, 0.5]]) {
    x.save(); x.translate(dx, dy); x.globalAlpha = a; x.fillStyle = rim;
    for (const p of G.parts) x.fill(p); x.fill(G.crown); x.restore();
  }
  x.globalAlpha = 1;
  x.fillStyle = body; for (const p of G.parts) x.fill(p);
  x.strokeStyle = warm ? 'rgba(255,214,150,0.13)' : 'rgba(110,236,240,0.08)'; x.lineWidth = 2.4;
  for (const pts of G.ridges) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke(); }
  x.globalCompositeOperation = 'lighter';
  const crackPass = (lw, a) => {
    x.strokeStyle = vein; x.globalAlpha = a; x.lineWidth = lw; x.beginPath();
    for (const pts of G.cracks) { x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); }
    x.stroke();
  };
  crackPass(9, warm ? 0.12 : 0.05); crackPass(3.5, warm ? 0.25 : 0.12); crackPass(1.1, warm ? 0.8 : 0.55);
  x.globalAlpha = 1;
  dnG(x, warm ? '#fff2cc' : '#9ff6ff', -4, -150, 64, warm ? 0.9 : 0.45);   // kalp oyuğu
  x.globalCompositeOperation = 'source-over';
  const hg = x.createRadialGradient(-4, -152, 0, -4, -150, 20);
  hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.5, warm ? '#ffe6a8' : '#9ff6ff'); hg.addColorStop(1, warm ? 'rgba(255,200,120,0.25)' : 'rgba(60,200,230,0.25)');
  x.fillStyle = hg; x.beginPath(); x.moveTo(-4, -172); x.bezierCurveTo(6, -160, 6, -140, -3, -130); x.bezierCurveTo(-13, -140, -13, -160, -4, -172); x.fill();
  x.strokeStyle = body; x.lineWidth = 1.6;   // sarmaşıklar
  const vl = new Path2D();
  for (const [vx, vy, len, ph] of G.vines) {
    const ex = vx + Math.sin(ph) * 6, ey = vy + len;
    x.beginPath(); x.moveTo(vx, vy); x.quadraticCurveTo(vx + Math.sin(ph) * 12, vy + len * 0.5, ex, ey); x.stroke();
    let sd = 1; for (let u = 0.15; u < 0.92; u += 0.13) { sd = -sd; dnLeaf(vl, lerp(vx, ex, u) + Math.sin(ph) * 12 * 2 * u * (1 - u), vy + len * u, 7, 2.4, sd > 0 ? 0.7 : Math.PI - 0.7); }
  }
  x.fillStyle = body; x.fill(vl);
  x.fillStyle = leafB; x.fill(G.crown);
  if (warm) {
    x.save(); x.clip(G.crown); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) dnG(x, i % 3 ? '#ffd890' : '#9ff6e0', -300 + i * 75, -430 + (i % 2) * 50, 150, 0.26);
    x.restore(); x.globalCompositeOperation = 'source-over';
  }
  leafPass(G.leaves, warm ? ['#ffe6a0', '#fff6dc', '#ffd890', '#9ff6e6', '#ffcdb5'] : ['#3fd8ff', '#56f0dc', '#8ff5ff'], warm ? 0.95 : 0.6, warm ? 0.9 : 0.4);
  x.globalCompositeOperation = 'lighter';
  for (const [lx, ly, , , , r] of G.leaves) if (warm ? r < 0.5 : r < 0.18) dnG(x, glowc, lx, ly, 16, warm ? 0.32 : 0.28);
  for (const [vx, vy, len, ph] of G.vines) { const ex = vx + Math.sin(ph) * 6, ey = vy + len + 3; dnG(x, glowc, ex, ey, 20, 0.6); dnG(x, '#ffffff', ex, ey, 4, 0.8); }
  x.globalCompositeOperation = 'source-over';
  for (const [vx, vy, len, ph] of G.vines) { x.fillStyle = warm ? '#fff2cc' : '#c8fbff'; x.beginPath(); x.ellipse(vx + Math.sin(ph) * 6, vy + len + 3, 2.4, 3.2, 0, 0, 6.283); x.fill(); }
}
function dnTreePrep(o, warm, sc) {
  if (!dnTreeG) dnTreeG = dnTreeGeo(o);
  let c = warm ? dnTreeWarm : dnTreeCool; if (!c) { c = document.createElement('canvas'); if (warm) dnTreeWarm = c; else dnTreeCool = c; }
  if (c.dnSc !== sc) { dnTreePaint(c, sc, warm); c.dnSc = sc; }
}
function dnTreeWarmup() {   // yaklaşırken ağaç görüntülerini boşta önceden boya (ilk görüşte takılma olmasın)
  const o = TREE; if (!o) return; const sc = Math.min(dnCS(), 2.2);
  if (dnTreeCool && dnTreeCool.dnSc === sc && dnTreeWarm && dnTreeWarm.dnSc === sc) return;
  if (o.x + DN_TB.x0 > cam.x + VW + 2400 || o.x + DN_TB.x1 < cam.x - 1500) return;
  if (!dnTreeG) { dnQueue(4, 'TG', () => { dnTreeG = dnTreeG || dnTreeGeo(o); }); return; }
  dnQueue(4, 'TC', () => dnTreePrep(o, false, sc)); dnQueue(5, 'TW', () => dnTreePrep(o, true, sc));
}
function dnTree(o, tm) {
  const x = o.x, y = o.y;
  const sc = Math.min(dnCS(), 2.2);
  if (x + DN_TB.x1 < cam.x - 50 || x + DN_TB.x0 > cam.x + VW + 50) return;
  dnTreePrep(o, false, sc); dnTreePrep(o, true, sc); dnTreeSc = sc;
  const e = o.litT ? now - o.litT : -1, rv = e >= 0 ? smooth(clamp(e / 2, 0, 1)) : 0;   // yanma: ışık kalpten dışa yayılır
  const Lw = Math.max(rv, smooth(clamp((o.lit - 0.4) / 0.6, 0, 1)) * (e >= 0 ? 1 : 0.35)), pul = 0.5 + 0.5 * Math.sin(tm * 1.3);
  const bx = x + DN_TB.x0, by = y + DN_TB.y0, bw = DN_TB.x1 - DN_TB.x0, bh = DN_TB.y1 - DN_TB.y0;
  g.globalCompositeOperation = 'lighter';   // arkadaki büyük ışık ve dönen huzmeler
  dglow(Lw > 0.5 ? '#ffd890' : '#5fe8ff', x, y - 360, 520 + Lw * 200, 0.16 + 0.3 * Lw + pul * 0.04);
  if (Lw > 0.01) {
    const shaft = dnShaft('#ffe6b0');
    for (let i = 0; i < 14; i++) {
      const a = i * 0.4488 + tm * 0.05 + Math.sin(tm * 0.3 + i) * 0.05;
      g.save(); g.translate(x, y - 330); g.rotate(a); g.globalAlpha = Lw * (0.08 + 0.06 * Math.sin(tm * 0.8 + i * 1.7));
      g.drawImage(shaft, -40 - (i % 3) * 18, 20, 80 + (i % 3) * 36, 760); g.restore();
    }
    g.globalAlpha = 1;
  }
  g.globalCompositeOperation = 'source-over';
  const hx = x - 4, hy = y - 150, Rv = rv * 760;
  if (rv < 1) g.drawImage(dnTreeCool, bx, by, bw, bh);
  if (rv > 0 && rv < 1) { g.save(); g.beginPath(); g.arc(hx, hy, Rv, 0, 6.283); g.clip(); g.drawImage(dnTreeWarm, bx, by, bw, bh); g.restore(); }
  else if (rv >= 1) g.drawImage(dnTreeWarm, bx, by, bw, bh);
  else if (Lw > 0.001) { g.globalAlpha = Lw; g.drawImage(dnTreeWarm, bx, by, bw, bh); g.globalAlpha = 1; }   // çiçekler açtıkça hafif ısınır
  g.globalCompositeOperation = 'lighter';
  if (rv > 0 && rv < 1) {   // yayılan ışık cephesi
    g.strokeStyle = `rgba(255,236,180,${0.5 * (1 - rv)})`; g.lineWidth = 26 * (1 - rv) + 4; g.beginPath(); g.arc(hx, hy, Rv, 0, 6.283); g.stroke();
    g.strokeStyle = `rgba(255,255,255,${0.7 * (1 - rv)})`; g.lineWidth = 3; g.stroke();
    dglow('#ffffff', hx, hy, 160 * (1 - rv) + 40, 0.9 * (1 - rv));
  }
  dglow(Lw > 0.5 ? '#fff2cc' : '#9ff6ff', hx, hy, 60 + pul * 20 + Lw * 30, 0.35 + 0.45 * Lw);   // kalp atışı
  dnEG(Lw > 0.5 ? '#ffd890' : '#5fe8ff', x, y + 2, 260 + 220 * Lw, 22 + 16 * Lw, 0.3 + 0.4 * Lw);
  const R = rng(77);
  for (let i = 0; i < 34; i++) {   // taçta yüzen ışıklar
    const a = R() * 6.283, r = Math.sqrt(R()) * 300, sp = 0.3 + R() * 0.5;
    const px = x + Math.cos(a + tm * 0.05 * sp) * r, py = y - 380 + Math.sin(a) * r * 0.38 + Math.sin(tm * sp + i) * 10;
    const tw = 0.5 + 0.5 * Math.sin(tm * 2 * sp + i * 1.3);
    dglow(i % 3 ? (Lw > 0.5 ? '#ffe6a8' : '#9ff6ff') : '#ffffff', px, py, 5 + R() * 9, (0.25 + tw * 0.5) * (0.5 + 0.5 * Lw));
  }
  if (Lw > 0.01) for (let i = 0; i < 24; i++) {   // yükselen kıvılcımlar ve süzülen altın yapraklar
    const k = (tm * 0.12 + i / 24) % 1, px = x + Math.sin(i * 7.3) * 300 + Math.sin(tm * 0.5 + i) * 20, py = y - 300 - k * 300;
    dglow(i % 2 ? '#ffd890' : '#fff6e0', px, py, 6 * (1 - k) + 2, (1 - k) * k * 3 * Lw * 0.6);
    const k2 = (tm * 0.08 + i / 24 + 0.5) % 1, qx = x + Math.sin(i * 3.1) * 320 + Math.sin(tm * 0.9 + i) * 30, qy = y - 420 + k2 * 440;
    dglow('#ffe6a0', qx, qy, 4, Math.sin(k2 * Math.PI) * 0.7 * Lw);
  }
  g.globalCompositeOperation = 'source-over';
}
TUR.kaydet('agac', {
  kur(o) { o.lit = 0.4; o.litT = 0; },
  guncelle(o, dt) { o.lit = lerp(o.lit, o.done ? 1 : 0.4 + 0.5 * clamp(light / 0.9, 0, 1) * 0.5, 1 - Math.exp(-dt * 1.2)); if (o.done && !o.litT) o.litT = now; },
  ciz(o, tm) { dnTree(o, tm); },
});

// ── göl: gerçek yansıma (Feza ve Pırıl dahil), ay yolu, pırıltılar, sis ──
const dnRefC = document.createElement('canvas'), dnRx = dnRefC.getContext('2d');
function dnLakeBed(tm, wx0, wx1) {   // su altı: yatak, taşlar, kütük, salınan yosun, kostik ağı (yansımadan ve derinlik renginden önce)
  if (!DN_BEDP) return;
  const L = DN_GOL;
  g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
  const bg = g.createLinearGradient(0, L.su, 0, L.su + 140);
  bg.addColorStop(0, dnSoil(1, light)); bg.addColorStop(0.6, dnSoil(3, light)); bg.addColorStop(1, dnSoil(4, light));
  g.fillStyle = bg; g.fill(DN_BEDP);
  if (DN_LOG && DN_LOG.x + DN_LOG.L > wx0 && DN_LOG.x - DN_LOG.L < wx1) {
    g.save(); g.translate(0, -1.4); g.fillStyle = dc('rim', 0.25); g.fill(DN_LOG.path); g.fill(DN_LOG.br); g.restore();
    g.fillStyle = dnSoil(3, light); g.fill(DN_LOG.path); g.fill(DN_LOG.br);
  }
  for (const r of DN_BROCK) {   // yarı gömülü yuvarlak taşlar
    if (r.x + r.rx < wx0 || r.x - r.rx > wx1) continue;
    g.fillStyle = dnSoil(3, light); g.beginPath(); g.ellipse(r.x, r.y, r.rx, r.ry, r.a, Math.PI, 6.283); g.fill();
    g.strokeStyle = dc('rim', 0.22); g.lineWidth = 1; g.beginPath(); g.ellipse(r.x, r.y, r.rx, r.ry, r.a, Math.PI * 1.1, Math.PI * 1.75); g.stroke();
  }
  // su yosunu: dipten yükselen, akıntıyla salınan şeritler
  g.strokeStyle = dnSoil(0, Math.min(1, light + 0.5)); g.lineWidth = 2.4; g.beginPath();
  for (const f of DN_SUNK) { if (f.k !== 'w' || f.x < wx0 - 30 || f.x > wx1 + 30) continue;
    for (let j = 0; j < f.n; j++) { const ox = (j - f.n / 2) * 4, sw = Math.sin(tm * 0.9 + f.ph + j * 0.7) * 6, h = f.h * (1 - j * 0.15);
      g.moveTo(f.x + ox, f.y); g.bezierCurveTo(f.x + ox - sw * 0.5, f.y - h * 0.35, f.x + ox + sw * 1.3, f.y - h * 0.7, f.x + ox + sw, f.y - h); } }
  g.stroke();
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = dc('bio', 0.12); g.lineWidth = 4; g.stroke(DN_BEDLINE);   // ışığın değdiği yatak kenarı
  g.strokeStyle = dc('rim', 0.28); g.lineWidth = 1; g.stroke(DN_BEDLINE);
  if (!dnCausPat) dnCausPat = g.createPattern(DN_CAUS, 'repeat');
  g.save(); g.clip(DN_BEDP);
  g.strokeStyle = dnSoil(0, Math.min(1, light + 0.3), 0.22); g.lineWidth = 26; g.stroke(DN_BEDLINE);   // ışık alan yatak yüzeyi (derine doğru söner)
  g.strokeStyle = dnSoil(0, Math.min(1, light + 0.3), 0.25); g.lineWidth = 10; g.stroke(DN_BEDLINE);
  if (dnCausPat && dnCausPat.setTransform && typeof DOMMatrix !== 'undefined') {   // kayan kostik ağı: yalnız yatağın yüzeyinde (iki kat, ters yönlerde)
    for (let i = 0; i < 2; i++) {
      const sc = i ? 0.5 : 0.75;
      dnCausPat.setTransform(new DOMMatrix([sc, 0, 0, sc * 0.6, (i ? -tm * 7 : tm * 9) + Math.sin(tm * 0.5 + i) * 6, L.su + (i ? tm * 2 : 0)]));
      g.strokeStyle = dnCausPat; g.globalAlpha = (i ? 0.2 : 0.26) * (0.75 + 0.35 * light); g.lineWidth = i ? 12 : 22; g.stroke(DN_BEDLINE);
    }
    g.globalAlpha = 1;
  }
  g.restore();
  g.globalCompositeOperation = 'source-over';
  g.setTransform(1, 0, 0, 1, 0, 0);
}
function dnReflect(tm) {
  const L = DN_GOL; if (!L) return;
  const wx0 = Math.max(L.x0 - 16, cam.x), wx1 = Math.min(L.x1 + 16, cam.x + VW); if (wx1 - wx0 < 2) return;   // kıyı duvarlarının su altındaki kenarını da örter
  const sy = Math.round((L.su - cam.y) * S); if (sy >= H || sy <= 8) return;
  const px0 = Math.floor((wx0 - cam.x) * S), px1 = Math.ceil((wx1 - cam.x) * S), pw = px1 - px0;
  const hh = Math.min(H - sy, sy), k = 0.5, cw = Math.max(1, Math.ceil(pw * k)), chh = Math.max(1, Math.ceil(hh * k));
  if (dnRefC.width < cw || dnRefC.height < chh) { dnRefC.width = Math.max(dnRefC.width, cw); dnRefC.height = Math.max(dnRefC.height, chh); }
  dnRx.setTransform(1, 0, 0, 1, 0, 0); dnRx.globalCompositeOperation = 'copy';
  dnRx.drawImage(cv, px0, sy - hh, pw, hh, 0, 0, cw, chh);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
  g.save(); g.beginPath(); g.rect(px0, sy, pw, H - sy); g.clip();
  const wg = g.createLinearGradient(0, sy, 0, H); wg.addColorStop(0, dc('water')); wg.addColorStop(1, '#030816');
  g.fillStyle = wg; g.fillRect(px0, sy, pw, H - sy);
  dnLakeBed(tm, wx0, wx1);
  g.setTransform(1, 0, 0, -1, 0, 2 * sy);   // ayna: y' = 2·sy − y
  const N = 20;
  for (let i = 0; i < N; i++) {
    const d0 = hh * Math.pow(i / N, 1.3), d1 = hh * Math.pow((i + 1) / N, 1.3), u = (i + 0.5) / N;
    const off = (Math.sin(tm * 1.7 + i * 1.3) * (0.4 + u * 2.6) + Math.sin(tm * 0.9 + i * 0.45) * 0.8) * S;
    g.globalAlpha = 0.92 * clamp(1 - (d0 + d1) / 2 / S / 85, 0.06, 1);   // derinde yansıma söner, dip görünür
    g.drawImage(dnRefC, 0, (hh - d1) * k, cw, Math.max(0.5, (d1 - d0) * k), px0 + off, sy - d1, pw, d1 - d0 + 1);
  }
  g.globalAlpha = 1;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const tg = g.createLinearGradient(0, sy, 0, sy + 170 * S);   // derinleştikçe koyulaşan su rengi
  tg.addColorStop(0, dc('water', 0.18)); tg.addColorStop(0.4, dc('water', 0.34)); tg.addColorStop(1, 'rgba(3,10,26,0.6)');
  g.fillStyle = tg; g.fillRect(px0, sy, pw, H - sy);
  g.globalCompositeOperation = 'lighter';
  const sa = dnOpen * (1 - light * 0.7);   // suda yansıyan yıldızlar
  if (sa > 0.03) for (let i = 0; i < 40; i++) {
    const st = DN_STARS[i], xs = px0 + ((st.x * 1.7 + i * 0.13) % 1) * pw + Math.sin(tm * 1.5 + i) * 2 * S, ys = sy + (4 + st.y * 120) * S;
    if (ys > H) continue;
    const tw = 0.5 + 0.5 * Math.sin(tm * st.sp * 1.3 + st.ph);
    dnEG('#dff4ff', xs, ys, (2 + st.s * 2.4) * S, (0.8 + st.s * 0.5) * S, sa * tw * 0.55 * (1 - st.y));
  }
  const [msx] = dnLightSrc();   // ay yolu (yakın su)
  for (let i = 0; i < 14; i++) {
    const u = i / 14, y = sy + 4 + u * (H - sy) * 0.95, ww = (10 + u * 50) * S * (0.5 + 0.5 * Math.sin(tm * 2.3 + i * 1.9));
    dnEG('#dff0ff', msx * S + Math.sin(tm * 0.7 + i * 2.1) * (6 + u * 26) * S, y, ww, (1.4 + u * 2) * S, (0.32 - u * 0.12) * (0.35 + DNR.gol * 0.65));
  }
  g.strokeStyle = dc('rim', 0.5); g.lineWidth = Math.max(1, 0.9 * S); g.beginPath(); g.moveTo(px0, sy + 0.5); g.lineTo(px1, sy + 0.5); g.stroke();   // su çizgisi
  g.strokeStyle = dc('rim', 0.2); g.lineWidth = Math.max(1, 0.7 * S); g.beginPath();   // pırıltı çizgileri
  for (let i = 0; i < 26; i++) {
    const u = ((i * 0.618) % 1), yy = sy + 3 * S + u * u * (H - sy) * 0.9, xx = cam.x + ((i * 97 + tm * (10 + i % 4 * 4) * (i % 2 ? 1 : -1)) % (VW + 100) + VW + 100) % (VW + 100) - 50;
    if (xx < wx0 || xx > wx1) continue;
    const xs = (xx - cam.x) * S; g.moveTo(xs, yy); g.lineTo(xs + (12 + (i % 4) * 9) * S, yy);
  }
  g.stroke();
  g.globalCompositeOperation = 'source-over';
  g.restore();
}
function dnWaterFx(tm) {   // dünya dönüşümünde: halkalar, gizli nilüfer ipuçları, su sisi
  const L = DN_GOL; if (!L || L.x1 < cam.x - 100 || L.x0 > cam.x + VW + 100) return;
  g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
  g.save(); g.beginPath(); g.rect(L.x0, L.su - 200, L.x1 - L.x0, 400); g.clip();
  g.globalCompositeOperation = 'lighter';
  for (let i = DN_RINGS.length - 1; i >= 0; i--) {
    const r = DN_RINGS[i], e = now - r.t, life = r.big ? 2.2 : 1.3;
    if (e > life) { DN_RINGS.splice(i, 1); continue; }
    const k = e / life;
    if (r.sp) { const rr = 4 + k * 26; g.strokeStyle = `rgba(200,250,255,${0.35 * (1 - k)})`; g.lineWidth = 1; g.beginPath(); g.ellipse(r.x, L.su + 2, rr, rr * 0.18, 0, 0, 6.283); g.stroke(); continue; }
    for (let j = 0; j < (r.big ? 3 : 2); j++) {
      const kk = k - j * 0.12; if (kk <= 0) continue;
      const rr = (r.big ? 26 : 18) + kk * (r.big ? 150 : 70);
      g.strokeStyle = `rgba(200,250,255,${0.5 * (1 - kk) * (j ? 0.6 : 1)})`; g.lineWidth = 1.6;
      g.beginPath(); g.ellipse(r.x, L.su + 2, rr, rr * 0.16, 0, 0, 6.283); g.stroke();
    }
  }
  const vx0 = cam.x - 40, vx1 = cam.x + VW + 40;
  for (const f of DN_SUNK) {   // batık ışıklı bitkiler ve taşlar (suyun içinden parlar)
    if (f.x < vx0 || f.x > vx1) continue;
    const pul = 0.6 + 0.4 * Math.sin(tm * 1.2 + f.ph);
    if (f.k === 'w') { const sw = Math.sin(tm * 0.9 + f.ph) * 6; dglow(f.c, f.x + sw, f.y - f.h, 9, 0.55 * pul); dglow('#ffffff', f.x + sw, f.y - f.h, 2, 0.6 * pul); }
    else if (f.k === 'c') {   // batık kristal kümesi
      dnEG(f.c, f.x, f.y - 2, 40 * f.s, 12 * f.s, 0.35 * pul); dglow(f.c, f.x, f.y - 10 * f.s, 26 * f.s, 0.4 * pul);
      g.globalCompositeOperation = 'source-over'; g.save(); g.translate(f.x, f.y); g.scale(f.s, f.s); g.fillStyle = dnRgba(f.c, 0.8); g.beginPath();
      g.moveTo(-3, 0); g.lineTo(-1, -18); g.lineTo(2.5, 0); g.moveTo(1, 0); g.lineTo(7, -11); g.lineTo(6.5, 1); g.moveTo(-2, 0); g.lineTo(-8, -9); g.lineTo(-5.5, 1); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.moveTo(-1.5, -2); g.lineTo(-1, -15); g.lineTo(0, -2); g.fill(); g.restore(); g.globalCompositeOperation = 'lighter';
    }
    else { dnEG(f.c, f.x, f.y, f.r * 4, f.r * 1.6, 0.45 * pul); dglow('#ffffff', f.x, f.y - 1, f.r, 0.5 * pul); }
  }
  for (let i = 0; i < DN_FLOOR.length; i += 2) {   // dipte kayan ışık benekleri
    const [fx, fy] = DN_FLOOR[i]; if (fx < vx0 || fx > vx1) continue;
    const ph = fx * 0.07, xx = fx + Math.sin(tm * 0.6 + ph) * 10;
    dnEG('#9ff6ff', xx, fy + 2, 10 + 5 * Math.sin(tm * 1.3 + ph), 2.2, 0.1 + 0.1 * Math.sin(tm * 1.7 + ph * 3));
  }
  for (let i = 0; i < 14; i++) {   // yükselen minik kabarcıklar
    const bx = L.x0 + ((i * 0.618 + 0.1) % 1) * (L.x1 - L.x0), k = (tm * (0.08 + (i % 4) * 0.02) + i * 0.37) % 1;
    if (bx < vx0 || bx > vx1) continue;
    const by = lerp(L.su + 110, L.su + 6, k), xx = bx + Math.sin(tm * 2 + i) * 3;
    dglow('#cffaff', xx, by, 2.2, Math.sin(k * Math.PI) * 0.6);
  }
  if (DN_FLOOR.length) {   // su altına inen ışık huzmeleri
    const sh = dnShaft(dq('hazeHi'));
    for (let i = 0; i < 5; i++) { const xx = L.x0 + (i + 0.5) / 5 * (L.x1 - L.x0) + Math.sin(tm * 0.2 + i) * 30; if (xx < vx0 - 60 || xx > vx1 + 60) continue;
      g.save(); g.translate(xx, L.su); g.rotate(0.25 + Math.sin(tm * 0.15 + i * 2) * 0.05); g.globalAlpha = 0.16 + 0.08 * Math.sin(tm * 0.5 + i * 1.7); g.drawImage(sh, -20, -10, 40 + i % 2 * 30, 220); g.restore(); }
    g.globalAlpha = 1;
  }
  for (const o of NESNELER) {   // henüz çıkmamış nilüferler: su altında belli belirsiz ışıltı
    if (o.tip !== 'nilufer' || o.acik > 0.5) continue;
    const a = (0.16 + 0.1 * Math.sin(tm * 1.5 + o.ph)) * (1 - o.acik * 2);
    dnEG('#7ff0e0', o.x, L.su + 7, 34, 6, a);
  }
  g.restore();
  for (let i = 0; i < 7; i++) {   // su sisi (yavaş kayar)
    const span = L.x1 - L.x0 + 300, x = L.x0 - 150 + ((i * 211 + tm * (6 + i % 3 * 3)) % span);
    dnEG(dq('hazeHi'), x, L.su - 4 - (i % 3) * 6, 150 + (i % 4) * 40, 16 + (i % 2) * 8, 0.12 + 0.04 * Math.sin(tm * 0.4 + i));
  }
  g.globalCompositeOperation = 'source-over';
}

// ── süzülen sporlar ve bokeh ──
const DN_MOTES = (() => { const R = rng(17), a = []; for (let i = 0; i < 140; i++) { const z = 0.3 + R() * 1.25; a.push({ x: R() * 4000, y: R() * 700, z, ph: R() * 6.28, sp: 0.4 + R(), c: R(), bk: false }); }
  for (let i = 0; i < 9; i++) a.push({ x: R() * 4000, y: R() * 600, z: 1.5 + R() * 0.45, ph: R() * 6.28, sp: 0.3 + R() * 0.4, c: R(), bk: true }); return a; })();
function drawMotes(tm, zMin, zMax) {
  g.setTransform(S, 0, 0, S, 0, 0);
  g.globalCompositeOperation = 'lighter';
  const bz = dnBlaze, bio = bz > 0.5 ? '#ffd890' : DNR.sakli > 0.5 ? '#c9a2ff' : dq('bio'), warm = dq('warm'), wrap = VW * 1.4;
  for (const m of DN_MOTES) {
    if (m.z < zMin || m.z >= zMax) continue;
    const x = ((m.x + Math.sin(tm * 0.3 * m.sp + m.ph) * 30 - cam.x * m.z) % wrap + wrap) % wrap - VW * 0.2;
    const hv = H / S + 140, y = ((m.y - tm * 7 * m.sp * (1 + bz) - cam.y * m.z) % hv + hv) % hv - 60;
    const tw = 0.5 + 0.5 * Math.sin(tm * 2 * m.sp + m.ph);
    if (m.bk) {
      const r = 14 + m.z * 12, col = m.c < 0.6 ? bio : warm;
      g.globalAlpha = (0.05 + tw * 0.04) * (0.7 + light * 0.5); g.drawImage(dnDisc(col), x - r, y - r, r * 2, r * 2); g.globalAlpha = 1;
      continue;
    }
    const col = m.c < 0.5 ? bio : m.c < 0.75 ? (bz > 0.5 ? '#fff2cc' : '#c8f4ff') : m.c < 0.88 ? warm : DNR.pofuduk > 0.5 ? '#ffb8e8' : '#d6b8ff';
    dglow(col, x, y, (2 + m.z * 4.5) * (0.6 + tw * 0.6) * (1 + bz * 0.4), (0.22 + tw * 0.5) * (0.6 + light * 0.4));
  }
  g.globalCompositeOperation = 'source-over';
}
// ── karakterlerden sonra: göl yansıması + ışıltılı yapraklar (Gris dokunuşu) ──
const DN_PETALS = (() => { const R = rng(21), a = []; for (let i = 0; i < 22; i++) a.push({ x: R() * 1400, y: R() * 700, ph: R() * 6.28, sp: 0.5 + R(), s: 0.6 + R() * 0.6, c: R() }); return a; })();
function drawPetals(tm) {
  dnReflect(tm);
  dnWaterFx(tm);
  const a0 = clamp((light - 0.25) * 2, 0, 1) * (0.7 + 0.3 * DNR.aciklik) + dnBlaze * 0.5;
  if (a0 <= 0) return;
  g.setTransform(S, 0, 0, S, 0, 0);
  const n = Math.round(DN_PETALS.length * (0.6 + 0.4 * Math.max(DNR.aciklik, dnBlaze)));
  for (let i = 0; i < n; i++) {
    const p = DN_PETALS[i];
    const x = ((p.x + tm * 14 * p.sp + Math.sin(tm * p.sp + p.ph) * 40 - cam.x * 1.1) % (VW + 200) + VW + 200) % (VW + 200) - 100;
    const hv = H / S + 200, y = ((p.y + tm * 22 * p.sp - cam.y) % hv + hv) % hv - 80;
    const col = p.c < 0.45 ? '#ffe2a0' : p.c < 0.8 ? '#bff6e6' : '#ffc8c8';
    g.globalCompositeOperation = 'lighter'; dglow(col, x, y, 9 * p.s, 0.25 * Math.min(1, a0)); g.globalCompositeOperation = 'source-over';
    g.save(); g.translate(x, y); g.rotate(tm * p.sp * 1.5 + p.ph); g.scale(1, Math.sin(tm * 2 * p.sp + p.ph));
    g.globalAlpha = 0.8 * Math.min(1, a0); g.fillStyle = col;
    g.beginPath(); g.ellipse(0, 0, 4 * p.s, 2 * p.s, 0, 0, 6.283); g.fill(); g.restore();
  }
  g.globalAlpha = 1;
}

// ── ön plan: koyu yaprak siluetleri (üst çerçeve + alttan eğrelti), ince kenar ışığı ──
const DN_FG = { sc: 0, l: -1, top: [], fern: [] };
function dnFgSprites() {
  const sc = dnCS(), lq = Math.round(light * 10) / 10;
  if (DN_FG.sc === sc && DN_FG.l === lq) return;
  DN_FG.sc = sc; DN_FG.l = lq;
  const rim = dcAt('rim', lq, 0.75), body = '#010309';
  const mk = (i, w, h, ox, oy, draw) => {
    const c = (DN_FG._c || (DN_FG._c = {}))[i] || (DN_FG._c[i] = document.createElement('canvas'));
    c.width = Math.ceil(w * sc); c.height = Math.ceil(h * sc);
    const x = c.getContext('2d'); x.setTransform(sc, 0, 0, sc, ox * sc, oy * sc); x.lineCap = 'round';
    const p = new Path2D(); draw(p, rng(i.charCodeAt(0) * 97 + i.charCodeAt(1) * 13 + 5));
    x.save(); x.translate(0, 2); x.fillStyle = rim; x.fill(p); x.restore();
    x.save(); x.translate(0, 5); x.fillStyle = dcAt('rim', lq, 0.08); x.fill(p); x.restore();
    x.fillStyle = body; x.fill(p);
    return { c, w, h, ox, oy };
  };
  DN_FG.top = [0, 1, 2].map(i => mk('t' + i, 320, 190, 160, 20, (p, R) => {   // üstten sarkan yaprak kümeleri
    p.moveTo(150, -10); p.ellipse(0, -10, 150, 22 + R() * 10, 0, 0, 6.283);   // yumuşak yaprak kümesi
    for (let k = 0; k < 6; k++) { const bx = -120 + k * 48 + (R() - 0.5) * 20, rr = 22 + R() * 18; p.moveTo(bx + rr, 4); p.ellipse(bx, 4 + R() * 8, rr, rr * 0.6, 0, 0, 6.283); }
    for (let k = 0; k < 7; k++) {   // sarkan sarmaşıklar ve geniş, yuvarlak yapraklar
      const bx = -120 + k * 40 + (R() - 0.5) * 16, len = 40 + R() * 90 * (1 - Math.abs(k - 3) / 5), sw = (R() - 0.5) * 16;
      p.moveTo(bx - 1.2, 10); p.quadraticCurveTo(bx + sw, 10 + len * 0.5, bx + sw * 0.6 - 1, 10 + len); p.lineTo(bx + sw * 0.6 + 1, 10 + len); p.quadraticCurveTo(bx + sw + 2, 10 + len * 0.5, bx + 1.2, 10); p.closePath();
      for (let u = 0.25; u < 1; u += 0.22 + R() * 0.1) { const yy = 10 + len * u, xx = bx + sw * u, l = 8 + R() * 8; dnLeaf(p, xx, yy, l, l * 0.5, Math.PI / 2 + (R() < 0.5 ? -1 : 1) * (0.7 + R() * 0.6)); }
      dnLeaf(p, bx + sw * 0.6, 8 + len, 12 + R() * 6, 6, Math.PI / 2 + (R() - 0.5) * 0.6);
    }
    for (let k = 0; k < 14; k++) { const bx = (R() - 0.5) * 290, l = 16 + R() * 14; dnLeaf(p, bx, 8 + R() * 14, l, l * 0.48, Math.PI / 2 + (R() - 0.5) * 2.2); }
  }));
  DN_FG.fern = [0, 1, 2].map(i => mk('f' + i, 300, 130, 150, 125, (p, R) => {   // alttan eğrelti
    const nf = 5 + Math.floor(R() * 3);
    for (let f = 0; f < nf; f++) {
      const a0 = -Math.PI / 2 + (f - (nf - 1) / 2) * 0.42 + (R() - 0.5) * 0.15, L = 80 + R() * 50, droop = 0.6 + R() * 0.5, sd = Math.sign(Math.cos(a0)) || 1;
      const pts = []; for (let u = 0; u <= 1.001; u += 0.1) pts.push([Math.cos(a0) * L * u + sd * u * u * L * 0.35 * droop, Math.sin(a0) * L * u * (1 - u * 0.5 * droop) + u * u * L * 0.3 * droop]);
      for (let k = 1; k < pts.length; k++) {
        const u = k / (pts.length - 1), [px, py] = pts[k], [qx, qy] = pts[k - 1], ang = Math.atan2(py - qy, px - qx), ll = 22 * (1 - u) + 5;
        dnLeaf(p, qx, qy, ll, 3.4 * (1 - u) + 1.4, ang - 1.0); dnLeaf(p, qx, qy, ll, 3.4 * (1 - u) + 1.4, ang + 1.0);
      }
      p.moveTo(0, 0); for (const [px, py] of pts) p.lineTo(px + 1, py); for (let k = pts.length - 1; k >= 0; k--) p.lineTo(pts[k][0] - 1, pts[k][1]); p.closePath();
    }
    p.ellipse(0, 4, 40, 12, 0, 0, 6.283);
  }));
}
const DN_FGI = (() => { const R = rng(29), a = []; for (let i = 0; i < 6; i++) a.push({ x: i * 340 + R() * 140, v: i % 3, s: 0.8 + R() * 0.45, y: -10 - R() * 25, fl: R() < 0.5 ? -1 : 1 }); return a; })();
const DN_FGB = (() => { const R = rng(33), a = []; for (let i = 0; i < 5; i++) a.push({ x: i * 420 + R() * 200, v: i % 3, s: 0.95 + R() * 0.3, fl: R() < 0.5 ? -1 : 1 }); return a; })();
function drawForeground(tm) {
  dnFgSprites();
  g.setTransform(1, 0, 0, 1, 0, 0);
  const span1 = 2040, span2 = 2100, dy = dnDY();
  const topA = clamp(1 - dnOpen * 0.85, 0, 1);   // açık gökyüzünde üst çerçeve çekilir
  if (topA > 0.02) for (const it of DN_FGI) {
    const sp = DN_FG.top[it.v], wx = ((it.x - cam.x * 1.18) % span1 + span1) % span1 - 300;
    if (wx > VW + 200) continue;
    const sw = Math.sin(tm * 0.6 + it.x) * 0.025;
    g.save(); g.translate(wx * S, (it.y - 30 * (1 - topA) + Math.min(0, dy) * 0.08) * S); g.rotate(sw); g.scale(it.s * it.fl, it.s * (0.6 + 0.4 * topA));
    g.drawImage(sp.c, -sp.ox * S, -sp.oy * S, sp.w * S, sp.h * S); g.restore();
  }
  for (const it of DN_FGB) {
    const sp = DN_FG.fern[it.v], wx = ((it.x - cam.x * 1.45) % span2 + span2) % span2 - 300;
    if (wx > VW + 200) continue;
    const gw = DN_GOL ? dnRegW(cam.x + wx, null).gol : 0;   // gölün önünü kapatma
    if (gw > 0.97) continue;
    const sw = Math.sin(tm * 0.7 + it.x) * 0.03;
    g.save(); g.translate(wx * S, (H / S + 46 + 60 * gw - Math.min(0, dy) * 0.3) * S); g.rotate(sw); g.scale(it.s * it.fl, it.s);
    g.drawImage(sp.c, -sp.ox * S, -sp.oy * S, sp.w * S, sp.h * S); g.restore();
  }
}
function drawVignette() {
  dnRunQueue();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  if (dnBlaze > 0 && TREE && TREE.litT) {   // final: ağaçtan yayılan renk dalgası
    const e = now - TREE.litT, r = e * 900 * S, tx = (TREE.x - cam.x) * S, ty = (TREE.y - 200 - cam.y) * S;
    if (r < Math.hypot(W, H) * 2.2) {
      const rg = g.createRadialGradient(tx, ty, r * 0.7, tx, ty, r + 1);
      rg.addColorStop(0, 'rgba(255,220,150,0)'); rg.addColorStop(0.8, `rgba(255,226,160,${0.22 * (1 - e / 4)})`); rg.addColorStop(1, 'rgba(255,240,200,0)');
      g.globalCompositeOperation = 'lighter'; g.fillStyle = rg; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
    }
  }
  const tg = g.createLinearGradient(0, 0, 0, H);   // üstte gölge (yaprak örtüsü), altta hafif kararma
  tg.addColorStop(0, `rgba(2,4,14,${(0.45 - light * 0.15) * (1 - dnOpen * 0.5)})`); tg.addColorStop(0.22, 'rgba(2,4,14,0)');
  tg.addColorStop(0.8, 'rgba(2,4,14,0)'); tg.addColorStop(1, 'rgba(2,4,14,0.35)');
  g.fillStyle = tg; g.fillRect(0, 0, W, H);
  const r = Math.hypot(W, H) / 2, vg = g.createRadialGradient(W / 2, H * 0.55, r * 0.42, W / 2, H * 0.55, r * 1.05);
  vg.addColorStop(0, 'rgba(3,5,18,0)'); vg.addColorStop(1, `rgba(3,5,18,${0.62 - light * 0.22 - dnBlaze * 0.15})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  if (!grainPat) grainPat = g.createPattern(DN_GRAIN, 'repeat');   // çok hafif kâğıt dokusu
  g.globalAlpha = 0.09; g.globalCompositeOperation = 'overlay'; g.fillStyle = grainPat; g.fillRect(0, 0, W, H);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

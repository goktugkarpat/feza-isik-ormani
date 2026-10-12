/* dunya.js – orman atmosferi: gökyüzü, katmanlar, zemin, süsler, çiçek/ağaç çizimi, ön plan
   Yön: çoğunlukla Ori (gece mavisi, biyolüminesans, ışık huzmeleri, katmanlı sis, koyu ön plan siluetleri),
   biraz Gris (gökyüzünde suluboya lekeleri, en uzakta zarif sade şekiller, renklerin dalga dalga geri gelmesi, kâğıt dokusu).
   Klasik script: üst düzey const/let/function'lar diğer dosyalarla ortak (ortak.js önce yüklenir).
   Bu dosyanın iç adları "dn" önekiyle başlar (diğer dosyalarla çakışmasın diye).
   Performans: arka plan katmanları parça parça (512 birimlik) ekran dışı tuvallere çizilir ve yalnızca
   boyut değişince ya da aydınlık belirgin bir adım değişince yeniden boyanır (karede en fazla birkaç parça). */
'use strict';

// ── renkler: 3 durak (gece mavisi → turkuaz → altın-turkuaz şafak) ──
const DNP = {
  skyTop: ['#030716', '#061a30', '#0d2a40'],
  skyMid: ['#0a2048', '#0f4560', '#2c6a72'],
  skyLow: ['#1a4c80', '#2b8c9c', '#c8b98a'],
  haze:   ['#1d4c84', '#1f6e88', '#2b7c82'],
  hazeHi: ['#4d8fd0', '#6fdad8', '#ffe2a0'],
  wash:   ['#2a5aa0', '#3aa0b0', '#e8a8a0'],
  gris:   ['#1f4c84', '#21718a', '#3a8a86'],
  far:    ['#143462', '#124a60', '#1c5a60'],
  mid:    ['#0a1d42', '#0a2f44', '#103a48'],
  near:   ['#030916', '#04101c', '#061820'],
  canopy: ['#02050d', '#030a12', '#041016'],
  earth:  ['#040a16', '#05121c', '#081a20'],
  rim:    ['#6adfff', '#7ff0e4', '#ffe2a6'],
  bio:    ['#3ad6ff', '#45f0d6', '#7ff2c4'],
  warm:   ['#8ac4ff', '#b4f2dc', '#ffd68c'],
  grass:  ['#071526', '#08202c', '#0b2a2e'],
  water:  ['#0d2a56', '#11506a', '#2a7a7a'],
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

// ── kâğıt dokusu (Gris, çok hafif) ──
const DN_GRAIN = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), d = x.createImageData(256, 256), R = rng(99);
  for (let i = 0; i < d.data.length; i += 4) { const v = 110 + R() * 145; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 18 + R() * 26; }
  x.putImageData(d, 0, 0); return c;
})();
let grainPat = null;   // oyun.js resize() sıfırlar

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
  // suluboya lekeleri: kenarı biraz koyu "ıslak kenar" halkası
  for (const [u, v, s, k, q] of DN_WASH) {
    const key = k < 0.35 ? 'haze' : k < 0.7 ? 'wash' : k < 0.85 ? 'hazeHi' : 'skyMid';
    const [r, gg, b] = hex(dcol(key, light)), cs = a => `rgba(${r},${gg},${b},${a})`;
    const rad = s * Math.max(w, h), cx = u * w, cy = v * h, a = 0.05 + q * 0.08;
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
    rg.addColorStop(0, cs(a * 0.7)); rg.addColorStop(0.7, cs(a)); rg.addColorStop(0.9, cs(a * 1.5)); rg.addColorStop(1, cs(0));
    x.fillStyle = rg; x.save(); x.translate(cx, cy); x.scale(1.6, 0.8); x.translate(-cx, -cy);
    x.beginPath(); x.arc(cx, cy, rad, 0, 6.283); x.fill(); x.restore();
  }
}

// ── parça önbellekli katmanlar ──
const DN_CH = 512;
let dnBudget = 0;
function dnLayer(f, q, y0, y1, items, paint) { return { f, q, y0, y1, items, paint, ch: new Map() }; }
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
function dnDrawLayer(L) {
  const lq = Math.round(light * 25) / 25, sc = S * L.q;
  const ox = cam.x * L.f, oy = cam.y * L.f;
  const k0 = Math.floor(ox / DN_CH), k1 = Math.floor((ox + VW) / DN_CH);
  for (let k = k0 - 1; k <= k1 + 1; k++) {
    let c = L.ch.get(k);
    const vis = k >= k0 && k <= k1, stale = !c || c.sc !== sc || c.l !== lq;
    if (stale && ((vis && !c) || dnBudget > 0)) { c = dnRenderChunk(L, k, sc, lq, c); dnBudget--; }
    if (!vis || !c) continue;
    const sx0 = Math.round((k * DN_CH - ox) * S), sx1 = Math.round(((k + 1) * DN_CH - ox) * S);
    const sy0 = Math.round((L.y0 - oy) * S), sy1 = Math.round((L.y1 - oy) * S);
    g.drawImage(c.cv, c.pad, 0, c.cv.width - c.pad * 2, c.cv.height, sx0, sy0, sx1 - sx0, sy1 - sy0);
  }
  for (const k of L.ch.keys()) if (k < k0 - 3 || k > k1 + 3) L.ch.delete(k);
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
  // kabuk çizgileri (hafif kenar ışığı)
  for (let s = 0; s < 2; s++) {
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
    const ex = sx + sd * Lb, ey = sy - Lb * (0.15 + R() * 0.45);
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
// katmandaki ağaçları boya (gölge siluet + kenar ışığı + yosun + biyolüminesans)
function dnPaintTrees(x, items, x0, x1, st) {
  for (const it of items) {
    if (it.x + it.ext < x0 || it.x - it.ext > x1) continue;
    const G = it.geo || (it.geo = dnGnarl(it));
    if (st.rim) {
      x.save(); x.translate(st.rdx, st.rdy); x.fillStyle = st.rim; for (const p of G.parts) x.fill(p); x.restore();
    }
    x.fillStyle = st.body; for (const p of G.parts) x.fill(p);
    if (st.bark) {
      x.strokeStyle = st.bark; x.lineWidth = st.barkW;
      for (const pts of G.rims) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke(); }
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
      if (bulb && st.glow) {
        x.globalCompositeOperation = 'lighter';
        dnG(x, st.glow, ex, ey, 18 * st.gs, 0.5 * st.ga); dnG(x, '#ffffff', ex, ey, 4 * st.gs, 0.5 * st.ga);
        x.globalCompositeOperation = 'source-over';
      }
    }
    if (G.fungi.length && st.glow) {
      x.globalCompositeOperation = 'lighter';
      for (const [fx, fy, s, sd] of G.fungi) dnG(x, st.glow, fx + sd * s, fy, s * 4.5, 0.4 * st.ga);
      x.globalCompositeOperation = 'source-over';
      for (const [fx, fy, s, sd] of G.fungi) {   // raf mantarı: üstü kubbe, altı ışıyan
        x.fillStyle = st.body; x.beginPath(); x.moveTo(fx - sd * 2, fy - s * 0.35); x.quadraticCurveTo(fx + sd * s * 1.3, fy - s * 0.85, fx + sd * s * 1.8, fy);
        x.quadraticCurveTo(fx + sd * s * 0.9, fy + s * 0.3, fx - sd * 2, fy + s * 0.2); x.fill();
        x.fillStyle = st.fungus; x.beginPath(); x.moveTo(fx, fy - s * 0.05); x.quadraticCurveTo(fx + sd * s * 1.2, fy - s * 0.2, fx + sd * s * 1.75, fy);
        x.quadraticCurveTo(fx + sd * s * 0.9, fy + s * 0.3, fx, fy + s * 0.2); x.fill();
      }
    }
  }
}
function dnMakeTrees(seed, from, to, gapMin, gapMax, fn) {
  const R = rng(seed), a = []; let x = from + R() * gapMin;
  while (x < to) { const o = fn(R, x); o.seed = Math.floor(R() * 1e9); o.ext = o.w * 14; a.push(o); x += gapMin + R() * (gapMax - gapMin); }
  return a;
}

// 1) en uzak: Gris'ten zarif sade şekiller (suluboya tepeler, ince ağaçlar, kemerler)
const DN_HILL = (lx, k) => k ? 418 + Math.sin(lx * 0.0062 + 3) * 30 + Math.sin(lx * 0.017 + 1) * 10 : 372 + Math.sin(lx * 0.0041 + 1) * 34 + Math.sin(lx * 0.012) * 14;
const DN_GRIS = (() => { const R = rng(41), a = []; let x = -100; while (x < 1600) { a.push({ x, h: 120 + R() * 150, w: 9 + R() * 9, k: R(), tilt: (R() - 0.5) * 0.06 }); x += 60 + R() * 110; } return a; })();
function dnPaintGris(x, x0, x1, t) {
  for (let k = 0; k < 2; k++) {
    const top = dcAt(k ? 'gris' : 'haze', t, 1), bot = dcAt('haze', t, 1);
    const gr = x.createLinearGradient(0, 330, 0, 640); gr.addColorStop(0, top); gr.addColorStop(0.6, bot);
    x.fillStyle = gr; x.globalAlpha = k ? 0.9 : 0.7;
    x.beginPath(); x.moveTo(x0, 700);
    for (let lx = x0; lx <= x1 + 8; lx += 8) x.lineTo(lx, DN_HILL(lx, k));
    x.lineTo(x1 + 8, 700); x.fill();
    // ıslak kenar
    x.strokeStyle = dcAt('far', t, 0.25); x.lineWidth = 1.2; x.beginPath();
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

// 2) uzak orman (sisli, ince budaklı ağaçlar)
const DN_FAR = dnMakeTrees(51, -300, COLS * T * 0.22 + 2600, 80, 175, (R, x) => ({ x, base: 520, top: -150, w: 6 + R() * 9, roots: R() < 0.6, br: 1 + Math.floor(R() * 3), brMin: 40, brMax: 250, moss: 5, vines: false }));
function dnPaintFar(x, x0, x1, t) {
  const gr = x.createLinearGradient(0, -100, 0, 520);
  gr.addColorStop(0, dcAt('mid', t)); gr.addColorStop(0.45, dcAt('far', t)); gr.addColorStop(1, dcAt('haze', t));
  dnPaintTrees(x, DN_FAR, x0, x1, { body: gr, rim: dcAt('rim', t, 0.18), rdx: 1.2, rdy: 0, mossW: 1, glow: dcol('bio', t), ga: 0.5, gs: 0.7, fungus: dcAt('bio', t, 0.5) });
  // uzak biyolüminesan sporlar (sabit)
  const R = rng(Math.floor(x0) * 7 + 3); x.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) dnG(x, i % 4 ? dcol('bio', t) : dcol('warm', t), x0 + R() * (x1 - x0), 60 + R() * 300, 3 + R() * 6, 0.25 + R() * 0.3);
  x.globalCompositeOperation = 'source-over';
}
// 3) orta orman (kök yayılımlı büyük gövdeler, mantar rafları, sarkan sarmaşıklar)
const DN_MID = dnMakeTrees(63, -300, COLS * T * 0.45 + 2600, 170, 300, (R, x) => ({ x, base: 585, top: -150, w: 15 + R() * 15, roots: true, br: 2 + Math.floor(R() * 2), brMin: -20, brMax: 250, moss: 9, vines: true, vineMax: 330, fungi: R() < 0.45 ? 1 : 0, fMin: 120, fMax: 320 }));
function dnPaintMid(x, x0, x1, t) {
  const gr = x.createLinearGradient(0, -100, 0, 590);
  gr.addColorStop(0, dcAt('near', t)); gr.addColorStop(0.5, dcAt('mid', t)); gr.addColorStop(1, dcAt('far', t));
  dnPaintTrees(x, DN_MID, x0, x1, { body: gr, rim: dcAt('rim', t, 0.32), rdx: 1.6, rdy: -0.4, bark: dcAt('rim', t, 0.06), barkW: 1.6, mossW: 1.1, glow: dcol('bio', t), ga: 0.8, gs: 1, fungus: dcAt('bio', t, 0.85) });
}
// 4) yakın dev gövdeler (neredeyse siyah, belirgin turkuaz kenar ışığı)
const DN_NEAR = dnMakeTrees(77, -400, COLS * T * 0.72 + 2600, 560, 860, (R, x) => ({ x, base: 700, top: -160, w: 38 + R() * 22, roots: true, br: 1 + Math.floor(R() * 2), brMin: -60, brMax: 90, brLen: 0.7, moss: 14, vines: true, vineMax: 300, fungi: 1 + Math.floor(R() * 2), fMin: 140, fMax: 300 }));
function dnPaintNear(x, x0, x1, t) {
  const body = dcAt('near', t);
  // yumuşak dış ışıma + ince parlak kenar
  dnPaintTrees(x, DN_NEAR, x0, x1, { body: dcAt('rim', t, 0.07), rim: null, mossW: 1.4 });
  for (const it of DN_NEAR) { if (it.x + it.ext < x0 || it.x - it.ext > x1) continue; x.save(); x.translate(-2.5, 0); x.fillStyle = dcAt('rim', t, 0.05); for (const p of it.geo.parts) x.fill(p); x.restore(); }
  dnPaintTrees(x, DN_NEAR, x0, x1, { body, rim: dcAt('rim', t, 0.55), rdx: 2, rdy: -0.5, bark: dcAt('rim', t, 0.05), barkW: 2.2, mossW: 1.4, glow: dcol('bio', t), ga: 1, gs: 1.2, fungus: dcAt('bio', t, 0.95) });
}
// 5) tepe yaprak örtüsü (çerçeve) + sarkan ışıklı sarmaşıklar
const DN_CAN = (() => {
  const R = rng(91), a = []; let x = -200;
  while (x < COLS * T * 0.86 + 2600) {
    const r = 40 + R() * 55, cy = -10 + R() * 60, s = Math.floor(R() * 1e9);
    a.push({ x, y: cy, r, seed: s }); x += r * (0.8 + R() * 0.6);
  }
  return a;
})();
function dnCanGeo(c) {
  const R = rng(c.seed), body = new Path2D(), vines = [], moss = [], twigs = [];
  body.ellipse(c.x, c.y, c.r * 0.9, c.r * 0.55, 0, 0, 6.283);
  body.rect(c.x - c.r, -200, c.r * 2, c.y + 200);
  const n = Math.floor(c.r * 0.7);
  for (let i = 0; i < n; i++) {
    const a = R() * 6.283, d = c.r * (0.5 + R() * 0.45), lx = c.x + Math.cos(a) * d * 0.85, ly = c.y + Math.sin(a) * d * 0.5;
    let ang = a + (R() - 0.5) * 0.9; if (Math.sin(a) > 0) ang = lerp(ang, Math.PI / 2, 0.45);
    dnLeaf(body, lx, ly, 14 + R() * 18, 4 + R() * 4, ang);
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
      dnG(x, glowc, ex, ey + 3, 26, 0.55); dnG(x, '#ffffff', ex, ey + 3, 5, 0.6);
      x.globalCompositeOperation = 'source-over';
    }
  }
}

const DN_LAYERS = {
  gris: dnLayer(0.07, 0.3, 120, 660, null, dnPaintGris),
  far: dnLayer(0.22, 0.42, -150, 660, DN_FAR, dnPaintFar),
  mid: dnLayer(0.45, 0.55, -150, 660, DN_MID, dnPaintMid),
  near: dnLayer(0.72, 0.62, -160, 660, DN_NEAR, dnPaintNear),
  can: dnLayer(0.86, 0.6, -110, 420, DN_CAN, dnPaintCanopy),
};
// ışık huzmeleri (orta derinlikte)
const DN_SHAFTS = (() => { const R = rng(13), a = []; let x = -200; while (x < COLS * T * 0.55 + 2000) { a.push({ x, w: 50 + R() * 120, a: 0.5 + R() * 0.5, ph: R() * 6, ang: 0.26 + R() * 0.16 }); x += 140 + R() * 260; } return a; })();

// ── çizim: arka plan ──
function dnFog(y, h, a, key = 'haze', fy = 0.5) {
  const yy = (y - cam.y * fy) * S, hh = h * S;
  const gr = g.createLinearGradient(0, yy - hh / 2, 0, yy + hh / 2);
  gr.addColorStop(0, dc(key, 0)); gr.addColorStop(0.5, dc(key, a)); gr.addColorStop(1, dc(key, 0));
  g.fillStyle = gr; g.fillRect(0, yy - hh / 2, W, hh);
}
function drawBackground(tm) {
  dnBudget = 1;
  if (Math.abs(skyLight - light) > 0.02 || dnSky.width !== Math.max(2, Math.round(W / 3)) || dnSky.height !== Math.max(2, Math.round(H / 3))) dnPaintSky();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.drawImage(dnSky, 0, 0, W, H);
  // uzaktaki ışık kaynağı (ay/şafak): yumuşak, sert disk yok
  const sx = (560 - cam.x * 0.05) * S, sy = (150 - cam.y * 0.05) * S;
  g.globalCompositeOperation = 'lighter';
  dglow(dq('hazeHi'), sx, sy, H * 0.95, 0.22 + light * 0.14);
  dglow(dq('warm'), sx, sy, H * 0.32, 0.28 + light * 0.12);
  dglow('#ffffff', sx, sy, H * 0.07, 0.3 + light * 0.15);
  g.globalCompositeOperation = 'source-over';
  dnDrawLayer(DN_LAYERS.gris);
  dnFog(470, 300, 0.55, 'haze', 0.07);
  dnDrawLayer(DN_LAYERS.far);
  g.fillStyle = dc('haze', 0.12); g.fillRect(0, 0, W, H);
  dnFog(490, 260, 0.5, 'haze', 0.22);
  g.globalCompositeOperation = 'lighter';
  // ışık kaynağının sisteki saçılması (uzak ağaçların önünde)
  dglow(dq('hazeHi'), sx, sy + H * 0.06, H * 0.8, 0.2 - light * 0.04);
  dglow(dq('warm'), sx, sy, H * 0.3, 0.16 - light * 0.04);
  // orta derinlikte ışık cepleri (oyuncu bandının üstünde)
  for (let i = 0; i < 9; i++) {
    const lx = i * 520 + 180 - cam.x * 0.35; if (lx < -400 || lx > VW + 400) continue;
    dglow(i % 3 === 1 ? dq('warm') : dq('bio'), lx * S, (170 + (i * 67) % 120 - cam.y * 0.35) * S, (200 + (i * 53) % 100) * S, (0.13 + 0.04 * Math.sin(tm * 0.4 + i)) * (0.8 + light * 0.4));
  }
  // hacimsel ışık huzmeleri
  const shaft = dnShaft(dq('warm')), f = 0.5, ox = cam.x * f;
  for (const s of DN_SHAFTS) {
    const px = s.x - ox; if (px < -300 || px > VW + 300) continue;
    const a = 0.6 * s.a * (0.6 + 0.4 * Math.sin(tm * 0.33 + s.ph)) * (0.75 + 0.5 * light);
    g.save(); g.setTransform(S, 0, 0, S, px * S, (-60 - cam.y * f) * S); g.rotate(s.ang + Math.sin(tm * 0.12 + s.ph) * 0.02);
    g.globalAlpha = a; g.drawImage(shaft, -s.w / 2, 0, s.w, 560); g.restore();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  dnDrawLayer(DN_LAYERS.mid);
  dnFog(560, 220, 0.38, 'haze', 0.45);
  dnDrawLayer(DN_LAYERS.near);
  // önde ikinci, daha soluk huzme katmanı (yakın gövdelerin önünden geçen ışık)
  g.globalCompositeOperation = 'lighter';
  const ox2 = cam.x * 0.8;
  for (let i = 0; i < DN_SHAFTS.length; i += 3) {
    const s = DN_SHAFTS[i], px = s.x * 1.3 + 90 - ox2; if (px < -300 || px > VW + 300) continue;
    g.save(); g.setTransform(S, 0, 0, S, px * S, (-80 - cam.y * 0.8) * S); g.rotate(s.ang + 0.04);
    g.globalAlpha = 0.22 * s.a * (0.5 + 0.5 * Math.sin(tm * 0.27 + s.ph * 2)) * (0.8 + 0.4 * light);
    g.drawImage(shaft, -s.w * 0.8, 0, s.w * 1.6, 520); g.restore();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  dnDrawLayer(DN_LAYERS.can);
  // okunurluk: karakterlerin arkasında çok hafif, yumuşak bir gölge (fark edilmez ama ayırır)
  const px = (P.x - cam.x) * S, py = (P.y - 34 - cam.y) * S;
  dglow('#020610', px, py, 120 * S, 0.22 + light * 0.18);
}

// ── zemin geometrisi (yuvarlatılmış köşeler) – bir kez kurulur ──
function dnGroundPath() {
  const p = new Path2D(), R = 14;
  let c = 0;
  while (c < COLS) {
    if (topOf(c) >= ROWS) { c++; continue; }
    const pts = [], a = c;
    while (c < COLS && topOf(c) < ROWS) { const y = topOf(c) * T; pts.push([c * T, y], [(c + 1) * T, y]); c++; }
    const bot = ROWS * T + 80, P2 = [[a * T, bot], ...pts, [c * T, bot]];
    p.moveTo(P2[0][0], P2[0][1]);
    for (let i = 1; i < P2.length - 1; i++) {
      const [x0, y0] = P2[i - 1], [x1, y1] = P2[i], [x2, y2] = P2[i + 1];
      if ((x0 === x1 && x1 === x2) || (y0 === y1 && y1 === y2)) continue;
      p.arcTo(x1, y1, x2, y2, R);
    }
    p.lineTo(P2[P2.length - 1][0], P2[P2.length - 1][1]); p.closePath();
  }
  return p;
}
const DN_GPATH = dnGroundPath();
const DN_PLATS = [];
for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (grid[y][x] === 2 && (x === 0 || grid[y][x - 1] !== 2)) {
  let b = x; while (b + 1 < COLS && grid[y][b + 1] === 2) b++;
  const x0 = x * T, x1 = (b + 1) * T, yy = y * T, R = rng(x * 31 + y), path = new Path2D();
  const pts = [[x0 - 3, yy + 2], [x0 + 5, yy - 0.3], [x1 - 5, yy - 0.3], [x1 + 3, yy + 2]];
  const n = (b - x + 1) * 3;
  for (let i = 0; i <= n; i++) { const u = i / n, d = Math.sin(u * Math.PI); pts.push([lerp(x1 + 1, x0 - 1, u), yy + 6 + d * (24 + R() * 16) + (i % 2 ? 5 : 0)]); }
  dnSmooth(path, pts);
  const roots = []; for (let v = 0; v < (b - x + 1) * 3; v++) roots.push([x0 + 8 + R() * (x1 - x0 - 16), 12 + R() * 34, R() * 6, R() < 0.6]);
  DN_PLATS.push({ x0, x1, y: yy, path, roots });
}
// toprak altı parlayan kökler ve kristaller
const DN_ROOTS = [];
{ const R = rng(31); for (let c = 0; c < COLS; c++) { const t = topOf(c); if (t >= ROWS || R() < 0.4) continue;
    const x = c * T + R() * T, y = t * T + 6, dx = (R() - 0.5) * 90, dy = 30 + R() * 70;
    DN_ROOTS.push({ x, y, p: [x, y, x + dx * 0.2, y + dy * 0.4, x + dx * 0.7, y + dy * 0.6, x + dx, y + dy], ph: R() * 6, cr: R() < 0.35 ? (R() < 0.7 ? 0 : 1) : -1, cs: 0.7 + R() * 0.6 }); } }
// uçurum kenarlarından sarkan ışıklı yosun
const DN_DRIPS = [];
{ const R = rng(57);
  for (let c = 0; c < COLS; c++) {
    const t = topOf(c); if (t >= ROWS) continue;
    const tl = c > 0 ? topOf(c - 1) : 0, tr = c < COLS - 1 ? topOf(c + 1) : 0;
    if (tr > t) for (let i = 0; i < 4; i++) DN_DRIPS.push([(c + 1) * T + 0.5, t * T + 10 + i * 5 + R() * 6, 10 + R() * 26, R() * 6, 1]);
    if (tl > t) for (let i = 0; i < 4; i++) DN_DRIPS.push([c * T - 0.5, t * T + 10 + i * 5 + R() * 6, 10 + R() * 26, R() * 6, -1]);
  } }
// çimen ve süsler (sabit rastgele)
const DN_DECO = [], DN_GRASS = [];
{
  const R = rng(7);
  const nearFlower = x => FLOWERS.some(f => Math.abs(f.x - x) < 34) || Math.abs(x - TREE.x) < 150;
  for (let c = 0; c < COLS; c++) {
    const tops = [];
    const t = topOf(c); if (t < ROWS) tops.push(t);
    for (let y = 0; y < ROWS; y++) if (grid[y][c] === 2) tops.push(y);
    for (const ty of tops) {
      for (let i = 0; i < 6; i++) { const h = 5 + R() * 13; DN_GRASS.push({ x: c * T + R() * T, y: ty * T + 1, h, ph: R() * 6.28, lean: (R() - 0.5) * 0.5, tip: h > 14 && R() < 0.55 }); }
      const r = R(), x = c * T + 6 + R() * (T - 12);
      if (nearFlower(x)) continue;
      if (r < 0.22) { const n = 2 + Math.floor(R() * 3), it = []; for (let i = 0; i < n; i++) it.push([(R() - 0.5) * 16, 0.55 + R() * 0.7]); DN_DECO.push({ k: 'm', x, y: ty * T, it, ph: R() * 6, vio: R() < 0.22 }); }
      else if (r < 0.34) DN_DECO.push({ k: 'b', x, y: ty * T, h: 14 + R() * 14, ph: R() * 6 });
      else if (r < 0.52) DN_DECO.push({ k: 'n', x, y: ty * T, s: 0.7 + R() * 0.6, ph: R() * 6, fl: R() < 0.5 ? -1 : 1 });
      else if (r < 0.72) DN_DECO.push({ k: 'f', x, y: ty * T, s: 0.7 + R() * 0.6, ph: R() * 6, thr: R() * 0.8, hue: R() < 0.4 ? '#ffd9a0' : R() < 0.65 ? '#c8fff0' : R() < 0.85 ? '#d6b8ff' : '#ffc4cf' });
    }
  }
}

function drawWorld(tm) {
  g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const vx0 = cam.x - 50, vx1 = cam.x + VW + 50;
  // su (çukurlarda): koyu derin, ışıklı yüzey
  const wy = ROWS * T - 26;
  const wg = g.createLinearGradient(0, wy - 50, 0, wy + 110);
  wg.addColorStop(0, dc('haze', 0)); wg.addColorStop(0.3, dc('water', 0.92)); wg.addColorStop(1, '#02050c');
  g.fillStyle = wg; g.fillRect(vx0, wy - 50, vx1 - vx0, 180);
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = dc('rim', 0.35); g.fillRect(vx0, wy - 0.6, vx1 - vx0, 1.2);
  g.strokeStyle = dc('rim', 0.22); g.lineWidth = 1.4;
  g.beginPath();
  for (let i = 0; i < 18; i++) {
    const xx = cam.x + ((i * 97 + tm * 14 * (i % 2 ? 1 : -1)) % (VW + 100) + VW + 100) % (VW + 100) - 50, yy = wy + 5 + (i % 5) * 8;
    g.moveTo(xx, yy); g.lineTo(xx + 16 + (i % 4) * 9, yy);
  }
  g.stroke();
  g.globalCompositeOperation = 'source-over';
  // sondaki ruh ağacı (zeminin arkasında)
  drawTree(tm);
  // zemin gövdesi
  const gg = g.createLinearGradient(0, 430, 0, 660);
  gg.addColorStop(0, dc('earth')); gg.addColorStop(0.45, '#03070f'); gg.addColorStop(1, '#010208');
  g.fillStyle = gg; g.fill(DN_GPATH);
  // kenarların yumuşak ışıması (dışa doğru hale + içe doğru)
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = dc('rim', 0.05); g.lineWidth = 12; g.stroke(DN_GPATH);
  g.strokeStyle = dc('rim', 0.09); g.lineWidth = 5; g.stroke(DN_GPATH);
  g.save(); g.clip(DN_GPATH);
  g.strokeStyle = dc('rim', 0.05); g.lineWidth = 34; g.stroke(DN_GPATH);
  g.strokeStyle = dc('rim', 0.1); g.lineWidth = 12; g.stroke(DN_GPATH);
  // toprak içinde parlayan kökler ve kristaller
  const bio = dq('bio');
  g.lineWidth = 1.8;
  for (const r of DN_ROOTS) {
    if (r.x < vx0 - 60 || r.x > vx1 + 60) continue;
    const pul = 0.55 + 0.45 * Math.sin(tm * 1.3 + r.ph);
    g.strokeStyle = dc('rim', 0.13 * pul);
    g.beginPath(); g.moveTo(r.p[0], r.p[1]); g.bezierCurveTo(r.p[2], r.p[3], r.p[4], r.p[5], r.p[6], r.p[7]); g.stroke();
    if (r.cr >= 0) {
      const cx = r.p[6], cy = r.p[7], col = r.cr ? '#b88aff' : bio, s = r.cs;
      dglow(col, cx, cy, 30 * s, 0.45 * pul);
      g.fillStyle = r.cr ? 'rgba(214,190,255,0.75)' : dc('bio', 0.75);
      g.beginPath(); g.moveTo(cx, cy - 9 * s); g.lineTo(cx + 3 * s, cy); g.lineTo(cx, cy + 3 * s); g.lineTo(cx - 3 * s, cy); g.closePath();
      g.moveTo(cx + 4 * s, cy - 5 * s); g.lineTo(cx + 6.5 * s, cy + 1 * s); g.lineTo(cx + 3.5 * s, cy + 2 * s); g.closePath();
      g.moveTo(cx - 4 * s, cy - 4 * s); g.lineTo(cx - 2 * s, cy + 2 * s); g.lineTo(cx - 5.5 * s, cy + 1 * s); g.closePath(); g.fill();
    }
  }
  g.restore();
  g.strokeStyle = dc('rim', 0.85); g.lineWidth = 1.3; g.stroke(DN_GPATH);
  // uçurum kenarı yosunları
  g.strokeStyle = dc('rim', 0.28); g.lineWidth = 1.1; g.beginPath();
  for (const [dx, dy, len, ph, sd] of DN_DRIPS) {
    if (dx < vx0 || dx > vx1) continue;
    const sw = Math.sin(tm * 1.1 + ph) * 1.5;
    g.moveTo(dx, dy - len * 0.4); g.quadraticCurveTo(dx + sd * 1.5, dy, dx + sw, dy + len * 0.6);
  }
  g.stroke();
  for (const [dx, dy, len, ph] of DN_DRIPS) if (dx > vx0 && dx < vx1 && ph < 2.5) dglow(bio, dx + Math.sin(tm * 1.1 + ph) * 1.5, dy + len * 0.6, 6, 0.6);
  g.globalCompositeOperation = 'source-over';
  // yüzen adacıklar
  for (const p of DN_PLATS) {
    if (p.x1 < vx0 || p.x0 > vx1) continue;
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
  // çimen (tek yol, tek çizim)
  const pNear = P.ground ? 1 : 0;
  g.strokeStyle = dc('grass'); g.lineWidth = 1.6; g.beginPath();
  const tips = [];
  for (const d of DN_GRASS) {
    if (d.x < vx0 || d.x > vx1) continue;
    const near = clamp(1 - Math.abs(P.x - d.x) / 30, 0, 1) * (pNear && Math.abs(P.y - d.y) < 8 ? 1 : 0);
    const bend = Math.sin(tm * 1.6 + d.ph + d.x * 0.01) * 2.2 + d.lean * 6 + near * Math.sign(d.x - P.x) * 7;
    g.moveTo(d.x, d.y); g.quadraticCurveTo(d.x + bend * 0.3, d.y - d.h * 0.6, d.x + bend, d.y - d.h);
    if (d.tip) tips.push(d.x + bend, d.y - d.h, d.ph);
  }
  g.stroke();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < tips.length; i += 3) dglow(bio, tips[i], tips[i + 1], 4.5, 0.45 + 0.2 * Math.sin(tm * 2 + tips[i + 2]));
  g.globalCompositeOperation = 'source-over';
  // süsler
  for (const d of DN_DECO) {
    if (d.x < vx0 || d.x > vx1) continue;
    if (d.k === 'm') dnMush(d, tm, bio);
    else if (d.k === 'b') dnBulb(d, tm, bio);
    else if (d.k === 'n') dnFern(d, tm);
    else dnDawnFlower(d, tm);
  }
  // ışık çiçekleri
  for (const fl of FLOWERS) if (fl.x > vx0 - 60 && fl.x < vx1 + 60) drawFlower(fl, tm); else fl.open = lerp(fl.open, fl.done ? 1 : 0, 0.05);
}
function dnMush(d, tm, bio) {
  const col = d.vio ? '#b88aff' : bio, pul = 0.8 + 0.2 * Math.sin(tm * 1.8 + d.ph);
  g.globalCompositeOperation = 'lighter';
  dnEG(col, d.x, d.y, 46, 9, 0.35 * pul);
  dglow(col, d.x, d.y - 8, 30, 0.38 * pul);
  g.globalCompositeOperation = 'source-over';
  for (const [dx, s] of d.it) {
    const x = d.x + dx, h = 9 * s;
    g.fillStyle = '#0c2030'; g.fillRect(x - 0.9 * s, d.y - h, 1.8 * s, h);
    g.fillStyle = d.vio ? '#e2d0ff' : '#b8fff4';
    g.beginPath(); g.ellipse(x, d.y - h, 5.5 * s, 3.6 * s, 0, Math.PI, 6.283); g.fill();
    g.fillStyle = d.vio ? 'rgba(160,110,255,0.9)' : dc('bio', 0.9); g.beginPath(); g.ellipse(x, d.y - h, 5.5 * s, 1.2 * s, 0, 0, Math.PI); g.fill();
  }
}
function dnBulb(d, tm, bio) {
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
  const s = d.s, sw = Math.sin(tm * 0.9 + d.ph) * 0.05;
  g.save(); g.translate(d.x, d.y); g.scale(d.fl * s, s); g.rotate(sw);
  const path = new Path2D();
  for (let f = 0; f < 3; f++) {
    const a0 = -1.9 + f * 0.55, L = 26 - f * 4;
    for (let i = 1; i < 7; i++) {
      const u = i / 7, px = Math.cos(a0) * L * u + u * u * 8, py = Math.sin(a0) * L * u + u * u * 10, ll = 7 * (1 - u) + 2;
      dnLeaf(path, px, py, ll, 1.8, a0 - 1.2); dnLeaf(path, px, py, ll, 1.8, a0 + 1.2);
    }
  }
  g.fillStyle = dc('grass'); g.fill(path); g.restore();
}
function dnDawnFlower(d, tm) {   // renkler dalga dalga geri gelir (Gris)
  const o = smooth(clamp((light - d.thr) / 0.2 + 0.25, 0, 1));
  if (o <= 0.01) return;
  const sw = Math.sin(tm * 1.4 + d.ph) * 2, hh = 10 * d.s * o;
  g.strokeStyle = dc('grass'); g.lineWidth = 1.2; g.beginPath(); g.moveTo(d.x, d.y); g.quadraticCurveTo(d.x, d.y - hh * 0.6, d.x + sw, d.y - hh); g.stroke();
  g.globalCompositeOperation = 'lighter'; dglow(d.hue, d.x + sw, d.y - hh, 13 * d.s * o, 0.45); g.globalCompositeOperation = 'source-over';
  g.fillStyle = d.hue;
  for (let i = 0; i < 5; i++) { const a = i * 1.2566 + tm * 0.3; g.beginPath(); g.ellipse(d.x + sw + Math.cos(a) * 2.6 * o * d.s, d.y - hh + Math.sin(a) * 2.6 * o * d.s, 2.2 * o * d.s, 1.4 * o * d.s, a, 0, 6.283); g.fill(); }
}

// ── ışık çiçeği: kapalıyken davetkâr turkuaz tomurcuk, açınca altın-beyaz ışık ──
let dnFlowerSpr = null, dnFlowerSc = 0;
function dnFlowerSprite() {
  const sc = Math.min(4, S * 1.2), sz = 70;
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
function drawFlower(fl, tm) {
  fl.open = lerp(fl.open, fl.done ? 1 : 0, 0.05);
  const o = smooth(clamp(fl.open, 0, 1)), x = fl.x, y = fl.y, pulse = 0.5 + 0.5 * Math.sin(tm * 2.4 + x);
  const sw = Math.sin(tm * 1.1 + x) * 1.2, hx = x + sw, hy = y - 26 - o * 4;
  const gold = '#ffd890', cyan = '#7ff0ff';
  // yerdeki ışık havuzu ve hale
  g.globalCompositeOperation = 'lighter';
  dnEG(o > 0.3 ? gold : cyan, x, y + 1, 70 + o * 60, 10 + o * 6, 0.35 + o * 0.35);
  dglow(cyan, hx, hy, 46 + pulse * 10, 0.4 * (1 - o) + 0.12);
  if (o > 0.01) { dglow(gold, hx, hy, 70 + o * 50, 0.5 * o); dglow('#ffffff', hx, hy, 22 + o * 10, 0.5 * o); }
  g.globalCompositeOperation = 'source-over';
  // sap ve yapraklar
  g.strokeStyle = '#163e3e'; g.lineWidth = 2.2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 4, y - 12, hx, hy + 4); g.stroke();
  const lp = new Path2D(); dnLeaf(lp, x - 1, y - 5, 13, 3.5, -2.6); dnLeaf(lp, x - 1, y - 9, 12, 3.2, -0.5); dnLeaf(lp, x, y - 2, 9, 2.6, -0.2);
  g.fillStyle = '#1d5248'; g.fill(lp);
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(127,240,230,0.35)'; g.lineWidth = 0.8; g.stroke(lp); g.globalCompositeOperation = 'source-over';
  // kapalı tomurcuk (açtıkça söner)
  if (o < 0.99) {
    const b = 1 - o, s = 1 + pulse * 0.06;
    g.save(); g.translate(hx, hy + 2); g.scale(s * (1 + o * 0.6), s * b + 0.001);
    const bg = g.createLinearGradient(0, 4, 0, -14); bg.addColorStop(0, '#2a8a8a'); bg.addColorStop(0.5, '#9ff6ff'); bg.addColorStop(1, '#ffffff');
    g.fillStyle = bg; g.beginPath(); g.moveTo(0, -15); g.bezierCurveTo(8, -9, 7, 2, 0, 4); g.bezierCurveTo(-7, 2, -8, -9, 0, -15); g.fill();
    g.strokeStyle = 'rgba(40,120,130,0.8)'; g.lineWidth = 0.9; g.beginPath(); g.moveTo(0, 3); g.quadraticCurveTo(3, -5, 0, -14); g.moveTo(0, 3); g.quadraticCurveTo(-3, -5, 0, -14); g.stroke();
    g.restore();
    // davetkâr dönen kıvılcımlar
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) { const a = tm * 1.6 + i * 2.094; dglow('#c8fbff', hx + Math.cos(a) * 16, hy - 4 + Math.sin(a) * 7, 5, 0.8 * b); }
    g.globalCompositeOperation = 'source-over';
  }
  // açık çiçek (önbellekli sprite, döner)
  if (o > 0.01) {
    const spr = dnFlowerSprite(), sz = 70 * (0.3 + 0.7 * o) * (1 + pulse * 0.03);
    g.save(); g.translate(hx, hy); g.rotate(tm * 0.15 + x); g.scale(1, 0.92); g.globalAlpha = Math.min(1, o * 1.5);
    g.drawImage(spr, -sz / 2, -sz / 2, sz, sz); g.restore(); g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const k = (tm * 0.35 + i / 5) % 1; dglow(i % 2 ? gold : '#ffffff', hx + Math.sin(i * 2.3 + tm) * 14 * k, hy - k * 60, 4 * (1 - k) + 1, (1 - k) * 0.8 * o); }
    g.globalCompositeOperation = 'source-over';
  }
}

// ── ruh ağacı: önbellekli iki hâl (soğuk turkuaz ↔ yanınca altın), üstüne canlı ışıklar ──
const DN_TB = { x0: -400, x1: 400, y0: -540, y1: 60 };
let dnTreeG = null, dnTreeCool = null, dnTreeWarm = null, dnTreeSc = 0;
function dnTreeGeo() {
  const R = rng(4242), G = { parts: [], cracks: [], crown: new Path2D(), crownBack: new Path2D(), leaves: [], backLeaves: [], vines: [], ridges: [] };
  const jag = (pts, amt) => pts.map(([x, y], i) => [x + (i && i < pts.length - 1 ? (R() - 0.5) * amt : 0), y]);
  // kök yayılımı
  let ri = 0;
  for (const [s, d, e, w] of [[-1, 210, 14, 30], [1, 240, 10, 30], [-1, 120, 6, 22], [1, 135, 4, 24], [-1, 320, 24, 18], [1, 330, 22, 18], [1, 70, -2, 16], [-1, 60, 0, 16]]) {
    const p = [s * 26, -80, s * (48 + d * 0.12), -50, s * d * 0.6, -16 - w * 0.2, s * d, e];
    G.parts.push(dnTaper(p, w + 6, 3));
    if (ri++ < 2) { const pts = []; for (let u = 0.08; u <= 0.62; u += 0.06) { const q = dnBez(p, u); pts.push([q[0], q[1] - 2]); } G.cracks.push(jag(pts, 5)); }
  }
  // gövde (kıvrımlı, budaklı)
  const cxT = t => Math.sin(t * 3.4 + 0.5) * 14 - 6, hwT = t => 46 * (1 - 0.36 * t) + 62 * Math.pow(1 - t, 6) + Math.sin(t * 17) * 2.6 + (t > 0.85 ? (t - 0.85) * 120 : 0);
  const L = [], Rr = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; L.push([cxT(t) - hwT(t), -t * 320]); Rr.push([cxT(t) + hwT(t), -t * 320]); }
  const trunk = new Path2D(); dnSmooth(trunk, L.concat(Rr.reverse())); G.parts.push(trunk);
  for (let s = 0; s < 4; s++) { const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([cxT(t) + Math.sin(t * 5 + s * 1.7) * 26 * (1 - 0.3 * t) + (s - 1.5) * 9, -t * 300]); } G.ridges.push(pts); }
  // gövdedeki ışık çatlakları (dallanan)
  for (const [x0, k] of [[-18, 0.45], [10, 0.6], [-2, 0.35]]) {
    const pts = []; let x = x0;
    for (let y = -30; y >= -300; y -= 14) {
      const t = -y / 320; x = clamp(x + (R() - 0.5) * 12, cxT(t) - hwT(t) * k - 6, cxT(t) + hwT(t) * k + 6); pts.push([x, y]);
      if (R() < 0.18) { const sd = R() < 0.5 ? -1 : 1, br = [[x, y]]; let bx = x, by = y; for (let j = 0; j < 3; j++) { bx += sd * (5 + R() * 8); by -= 6 + R() * 8; br.push([bx, by]); } G.cracks.push(br); }
    }
    G.cracks.push(pts);
  }
  // ana dallar
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
  // taç: geniş, düzensiz, kenarları sarkık bir kütle (lolipop değil) + arkada daha soluk ikinci kat
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
  for (let i = 0; i < 300; i++) {
    const cx = (R() * 2 - 1) * 330, [yt, yb] = env(cx), cy = lerp(yt + 20, yb, Math.pow(R(), 0.8));
    G.leaves.push([cx, cy, 8 + R() * 10, 2.5 + R() * 2.5, R() * 6.283, R()]);
  }
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
  const leafPass = (list, cols, alpha, skip) => {
    for (const [lx, ly, len, wid, ang, r] of list) {
      if (r > skip) continue;
      const p = new Path2D(); dnLeaf(p, lx, ly, len, wid, ang); x.globalAlpha = alpha * (0.45 + r * 0.55 / skip); x.fillStyle = cols[Math.floor(r / skip * cols.length * 0.999)]; x.fill(p);
    }
    x.globalAlpha = 1;
  };
  // ağacın arkasındaki yumuşak ışık
  x.globalCompositeOperation = 'lighter';
  dnG(x, glowc, 0, -400, 360, warm ? 0.5 : 0.25); dnG(x, warm ? '#fff2cc' : '#9ff6ff', 0, -230, 220, warm ? 0.3 : 0.12);
  x.globalCompositeOperation = 'source-over';
  // arka taç katı (daha soluk = derinlik)
  x.save(); x.translate(0, 2); x.fillStyle = rim; x.globalAlpha = 0.5; x.fill(G.crownBack); x.restore(); x.globalAlpha = 1;
  x.fillStyle = warm ? '#16302e' : '#0a2232'; x.fill(G.crownBack);
  leafPass(G.backLeaves, warm ? ['#ffe6a0', '#bff6e0', '#ffd0b0'] : ['#3fd8ff', '#56f0dc'], warm ? 0.55 : 0.35, warm ? 0.8 : 0.45);
  // kenar ışığı (her iki yana)
  for (const [dx, dy, a] of [[2.4, -1, 1], [-2, -1, 0.5]]) {
    x.save(); x.translate(dx, dy); x.globalAlpha = a; x.fillStyle = rim;
    for (const p of G.parts) x.fill(p); x.fill(G.crown); x.restore();
  }
  x.globalAlpha = 1;
  x.fillStyle = body; for (const p of G.parts) x.fill(p);
  // kabuk sırtları
  x.strokeStyle = warm ? 'rgba(255,214,150,0.13)' : 'rgba(110,236,240,0.08)'; x.lineWidth = 2.4;
  for (const pts of G.ridges) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke(); }
  // ışık çatlakları
  x.globalCompositeOperation = 'lighter';
  const crackPass = (lw, a) => {
    x.strokeStyle = vein; x.globalAlpha = a; x.lineWidth = lw; x.beginPath();
    for (const pts of G.cracks) { x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); }
    x.stroke();
  };
  crackPass(9, warm ? 0.1 : 0.05); crackPass(3.5, warm ? 0.2 : 0.12); crackPass(1.1, warm ? 0.7 : 0.55);
  x.globalAlpha = 1;
  // kalp oyuğu
  dnG(x, warm ? '#fff2cc' : '#9ff6ff', -4, -150, 64, warm ? 0.9 : 0.45);
  x.globalCompositeOperation = 'source-over';
  const hg = x.createRadialGradient(-4, -152, 0, -4, -150, 20);
  hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.5, warm ? '#ffe6a8' : '#9ff6ff'); hg.addColorStop(1, warm ? 'rgba(255,200,120,0.25)' : 'rgba(60,200,230,0.25)');
  x.fillStyle = hg; x.beginPath(); x.moveTo(-4, -172); x.bezierCurveTo(6, -160, 6, -140, -3, -130); x.bezierCurveTo(-13, -140, -13, -160, -4, -172); x.fill();
  // sarmaşıklar (yapraklı, sarkan)
  x.strokeStyle = body; x.lineWidth = 1.6;
  const vl = new Path2D();
  for (const [vx, vy, len, ph] of G.vines) {
    const ex = vx + Math.sin(ph) * 6, ey = vy + len;
    x.beginPath(); x.moveTo(vx, vy); x.quadraticCurveTo(vx + Math.sin(ph) * 12, vy + len * 0.5, ex, ey); x.stroke();
    let sd = 1; for (let u = 0.15; u < 0.92; u += 0.13) { sd = -sd; dnLeaf(vl, lerp(vx, ex, u) + Math.sin(ph) * 12 * 2 * u * (1 - u), vy + len * u, 7, 2.4, sd > 0 ? 0.7 : Math.PI - 0.7); }
  }
  x.fillStyle = body; x.fill(vl);
  // ön taç
  x.fillStyle = leafB; x.fill(G.crown);
  // ışıyan yapraklar
  if (warm) {   // tacın içinden gelen sıcak ışık
    x.save(); x.clip(G.crown); x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) dnG(x, i % 3 ? '#ffd890' : '#9ff6e0', -300 + i * 75, -430 + (i % 2) * 50, 150, 0.22);
    x.restore(); x.globalCompositeOperation = 'source-over';
  }
  leafPass(G.leaves, warm ? ['#ffe6a0', '#fff6dc', '#ffd890', '#9ff6e6', '#ffcdb5'] : ['#3fd8ff', '#56f0dc', '#8ff5ff'], warm ? 0.95 : 0.6, warm ? 0.85 : 0.4);
  x.globalCompositeOperation = 'lighter';
  for (const [lx, ly, , , , r] of G.leaves) if (warm ? r < 0.45 : r < 0.18) dnG(x, glowc, lx, ly, 16, warm ? 0.3 : 0.28);
  for (const [vx, vy, len, ph] of G.vines) { const ex = vx + Math.sin(ph) * 6, ey = vy + len + 3; dnG(x, glowc, ex, ey, 20, 0.6); dnG(x, '#ffffff', ex, ey, 4, 0.8); }
  x.globalCompositeOperation = 'source-over';
  for (const [vx, vy, len, ph] of G.vines) { x.fillStyle = warm ? '#fff2cc' : '#c8fbff'; x.beginPath(); x.ellipse(vx + Math.sin(ph) * 6, vy + len + 3, 2.4, 3.2, 0, 0, 6.283); x.fill(); }
}
function drawTree(tm) {
  TREE.lit = lerp(TREE.lit, TREE.done ? 1 : 0.4, 0.02);
  const x = TREE.x, y = TREE.y;
  if (x + DN_TB.x1 < cam.x - 50 || x + DN_TB.x0 > cam.x + VW + 50) return;
  const sc = Math.min(S, 2.2);
  if (!dnTreeG) dnTreeG = dnTreeGeo();
  if (dnTreeSc !== sc) { dnTreeCool = dnTreeCool || document.createElement('canvas'); dnTreeWarm = dnTreeWarm || document.createElement('canvas'); dnTreePaint(dnTreeCool, sc, false); dnTreePaint(dnTreeWarm, sc, true); dnTreeSc = sc; }
  const Lw = smooth(clamp((TREE.lit - 0.4) / 0.6, 0, 1)), pul = 0.5 + 0.5 * Math.sin(tm * 1.3);
  const bx = x + DN_TB.x0, by = y + DN_TB.y0, bw = DN_TB.x1 - DN_TB.x0, bh = DN_TB.y1 - DN_TB.y0;
  // arkadaki büyük ışık ve huzmeler
  g.globalCompositeOperation = 'lighter';
  dglow(Lw > 0.5 ? '#ffd890' : '#5fe8ff', x, y - 360, 520, 0.16 + 0.22 * Lw + pul * 0.04);
  if (Lw > 0.01) {
    const shaft = dnShaft('#ffe6b0');
    for (let i = 0; i < 12; i++) {
      const a = i * 0.5236 + tm * 0.04 + Math.sin(tm * 0.3 + i) * 0.05;
      g.save(); g.translate(x, y - 330); g.rotate(a); g.globalAlpha = Lw * (0.07 + 0.05 * Math.sin(tm * 0.8 + i * 1.7));
      g.drawImage(shaft, -40 - (i % 3) * 18, 20, 80 + (i % 3) * 36, 620); g.restore();
    }
    g.globalAlpha = 1;
  }
  g.globalCompositeOperation = 'source-over';
  g.drawImage(dnTreeCool, bx, by, bw, bh);
  if (Lw > 0.001) { g.globalAlpha = Lw; g.drawImage(dnTreeWarm, bx, by, bw, bh); g.globalAlpha = 1; }
  // canlı ışıklar: kalp atışı, ateş böcekleri, yükselen kıvılcımlar
  g.globalCompositeOperation = 'lighter';
  dglow(Lw > 0.5 ? '#fff2cc' : '#9ff6ff', x - 4, y - 150, 60 + pul * 20, 0.35 + 0.35 * Lw);
  dnEG(Lw > 0.5 ? '#ffd890' : '#5fe8ff', x, y + 2, 260 + 140 * Lw, 22 + 10 * Lw, 0.3 + 0.35 * Lw);
  const R = rng(77);
  for (let i = 0; i < 34; i++) {
    const a = R() * 6.283, r = Math.sqrt(R()) * 300, sp = 0.3 + R() * 0.5;
    const px = x + Math.cos(a + tm * 0.05 * sp) * r, py = y - 380 + Math.sin(a) * r * 0.38 + Math.sin(tm * sp + i) * 10;
    const tw = 0.5 + 0.5 * Math.sin(tm * 2 * sp + i * 1.3);
    dglow(i % 3 ? (Lw > 0.5 ? '#ffe6a8' : '#9ff6ff') : '#ffffff', px, py, 5 + R() * 9, (0.25 + tw * 0.5) * (0.5 + 0.5 * Lw));
  }
  if (Lw > 0.01) for (let i = 0; i < 16; i++) {
    const k = (tm * 0.12 + i / 16) % 1, px = x + Math.sin(i * 7.3) * 260 + Math.sin(tm * 0.5 + i) * 20, py = y - 300 - k * 260;
    dglow(i % 2 ? '#ffd890' : '#fff6e0', px, py, 6 * (1 - k) + 2, (1 - k) * k * 3 * Lw * 0.6);
  }
  g.globalCompositeOperation = 'source-over';
}

// ── süzülen sporlar ve bokeh ──
const DN_MOTES = (() => { const R = rng(17), a = []; for (let i = 0; i < 140; i++) { const z = 0.3 + R() * 1.25; a.push({ x: R() * 4000, y: R() * 700, z, ph: R() * 6.28, sp: 0.4 + R(), c: R(), bk: false }); }
  for (let i = 0; i < 9; i++) a.push({ x: R() * 4000, y: R() * 600, z: 1.5 + R() * 0.45, ph: R() * 6.28, sp: 0.3 + R() * 0.4, c: R(), bk: true }); return a; })();
function drawMotes(tm, zMin, zMax) {
  g.setTransform(S, 0, 0, S, 0, 0);
  g.globalCompositeOperation = 'lighter';
  const bio = dq('bio'), warm = dq('warm'), wrap = VW * 1.4;
  for (const m of DN_MOTES) {
    if (m.z < zMin || m.z >= zMax) continue;
    const x = ((m.x + Math.sin(tm * 0.3 * m.sp + m.ph) * 30 - cam.x * m.z) % wrap + wrap) % wrap - VW * 0.2;
    const y = ((m.y - tm * 7 * m.sp - cam.y * m.z) % 700 + 700) % 700 - 60;
    const tw = 0.5 + 0.5 * Math.sin(tm * 2 * m.sp + m.ph);
    if (m.bk) {
      const r = 14 + m.z * 12, col = m.c < 0.6 ? bio : warm;
      g.globalAlpha = (0.05 + tw * 0.04) * (0.7 + light * 0.5); g.drawImage(dnDisc(col), x - r, y - r, r * 2, r * 2); g.globalAlpha = 1;
      continue;
    }
    const col = m.c < 0.5 ? bio : m.c < 0.75 ? '#c8f4ff' : m.c < 0.88 ? warm : '#d6b8ff';
    dglow(col, x, y, (2 + m.z * 4.5) * (0.6 + tw * 0.6), (0.22 + tw * 0.5) * (0.6 + light * 0.4));
  }
  g.globalCompositeOperation = 'source-over';
}
// ── ışık yükselince süzülen ışıltılı yapraklar (Gris dokunuşu) ──
const DN_PETALS = (() => { const R = rng(21), a = []; for (let i = 0; i < 18; i++) a.push({ x: R() * 1400, y: R() * 700, ph: R() * 6.28, sp: 0.5 + R(), s: 0.6 + R() * 0.6, c: R() }); return a; })();
function drawPetals(tm) {
  const a0 = clamp((light - 0.25) * 2, 0, 1);
  if (a0 <= 0) return;
  g.setTransform(S, 0, 0, S, 0, 0);
  for (const p of DN_PETALS) {
    const x = ((p.x + tm * 14 * p.sp + Math.sin(tm * p.sp + p.ph) * 40 - cam.x * 1.1) % (VW + 200) + VW + 200) % (VW + 200) - 100;
    const y = ((p.y + tm * 22 * p.sp - cam.y) % 760 + 760) % 760 - 80;
    const col = p.c < 0.45 ? '#ffe2a0' : p.c < 0.8 ? '#bff6e6' : '#ffc8c8';
    g.globalCompositeOperation = 'lighter'; dglow(col, x, y, 9 * p.s, 0.25 * a0); g.globalCompositeOperation = 'source-over';
    g.save(); g.translate(x, y); g.rotate(tm * p.sp * 1.5 + p.ph); g.scale(1, Math.sin(tm * 2 * p.sp + p.ph));
    g.globalAlpha = 0.8 * a0; g.fillStyle = col;
    g.beginPath(); g.ellipse(0, 0, 4 * p.s, 2 * p.s, 0, 0, 6.283); g.fill(); g.restore();
  }
  g.globalAlpha = 1;
}

// ── ön plan: koyu yaprak siluetleri (üst çerçeve + alttan eğrelti), ince turkuaz kenar ışığı ──
const DN_FG = { sc: 0, l: -1, top: [], fern: [] };
function dnFgSprites() {
  const sc = S, lq = Math.round(light * 10) / 10;
  if (DN_FG.sc === sc && DN_FG.l === lq) return;
  DN_FG.sc = sc; DN_FG.l = lq;
  const rim = dcAt('rim', lq, 0.75), body = '#010309';
  const mk = (i, w, h, ox, oy, draw) => {
    const c = (DN_FG._c || (DN_FG._c = {}))[i] || (DN_FG._c[i] = document.createElement('canvas'));
    c.width = Math.ceil(w * sc); c.height = Math.ceil(h * sc);
    const x = c.getContext('2d'); x.setTransform(sc, 0, 0, sc, ox * sc, oy * sc); x.lineCap = 'round';
    const p = new Path2D(); draw(p, rng(i * 97 + 5));
    x.save(); x.translate(0, 2); x.fillStyle = rim; x.fill(p); x.restore();
    x.save(); x.translate(0, 5); x.fillStyle = dcAt('rim', lq, 0.08); x.fill(p); x.restore();
    x.fillStyle = body; x.fill(p);
    return { c, w, h, ox, oy };
  };
  // üstten sarkan yaprak kümeleri
  DN_FG.top = [0, 1, 2].map(i => mk('t' + i, 320, 190, 160, 20, (p, R) => {
    p.rect(-160, -20, 320, 22);
    for (let k = 0; k < 9; k++) {
      const bx = -130 + k * 32 + (R() - 0.5) * 20, len = 50 + R() * 100 * (1 - Math.abs(k - 4) / 6), a0 = Math.PI / 2 + (R() - 0.5) * 0.9;
      dnLeaf(p, bx, -5, len, 9 + R() * 8, a0);
      for (let j = 0; j < 3; j++) dnLeaf(p, bx + (R() - 0.5) * 20, -5 + R() * 10, 25 + R() * 30, 5 + R() * 4, a0 + (R() - 0.5) * 1.6);
    }
    p.moveTo(-160, 0); p.ellipse(0, 0, 160, 26 + R() * 14, 0, 0, Math.PI); p.closePath();
  }));
  // alttan eğrelti (yerden yükselen, oyuncu yüksekliğine çıkmaz)
  DN_FG.fern = [0, 1, 2].map(i => mk('f' + i, 300, 130, 150, 125, (p, R) => {
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
  const span1 = 2040, span2 = 2100;
  for (const it of DN_FGI) {
    const sp = DN_FG.top[it.v], wx = ((it.x - cam.x * 1.18) % span1 + span1) % span1 - 300;
    if (wx > VW + 200) continue;
    const sw = Math.sin(tm * 0.6 + it.x) * 0.025;
    g.save(); g.translate(wx * S, (it.y - cam.y * 0.15) * S); g.rotate(sw); g.scale(it.s * it.fl, it.s);
    g.drawImage(sp.c, -sp.ox * S, -sp.oy * S, sp.w * S, sp.h * S); g.restore();
  }
  for (const it of DN_FGB) {
    const sp = DN_FG.fern[it.v], wx = ((it.x - cam.x * 1.45) % span2 + span2) % span2 - 300;
    if (wx > VW + 200) continue;
    const sw = Math.sin(tm * 0.7 + it.x) * 0.03;
    g.save(); g.translate(wx * S, (VH + 18 - (cam.y - 50) * 0.3) * S); g.rotate(sw); g.scale(it.s * it.fl, it.s);
    g.drawImage(sp.c, -sp.ox * S, -sp.oy * S, sp.w * S, sp.h * S); g.restore();
  }
}
function drawVignette() {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  // üstte gölge (yaprak örtüsü), altta hafif kararma
  const tg = g.createLinearGradient(0, 0, 0, H);
  tg.addColorStop(0, `rgba(2,4,14,${0.45 - light * 0.15})`); tg.addColorStop(0.22, 'rgba(2,4,14,0)');
  tg.addColorStop(0.8, 'rgba(2,4,14,0)'); tg.addColorStop(1, 'rgba(2,4,14,0.35)');
  g.fillStyle = tg; g.fillRect(0, 0, W, H);
  const r = Math.hypot(W, H) / 2, vg = g.createRadialGradient(W / 2, H * 0.55, r * 0.42, W / 2, H * 0.55, r * 1.05);
  vg.addColorStop(0, 'rgba(3,5,18,0)'); vg.addColorStop(1, `rgba(3,5,18,${0.62 - light * 0.22})`);
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // çok hafif kâğıt dokusu
  if (!grainPat) grainPat = g.createPattern(DN_GRAIN, 'repeat');
  g.globalAlpha = 0.09; g.globalCompositeOperation = 'overlay'; g.fillStyle = grainPat; g.fillRect(0, 0, W, H);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

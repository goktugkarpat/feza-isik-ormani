/* pofuduk.js – Pofuduklar (uykucu, tüylü orman dostları) ve Büyük Pofuduk: davranış + çizim.
   Sözleşme: src/SPEC.md › "Objects". Bu dosyanın özel adları `pf` önekli.
   tur: 'yol'     yolu kapatır (katı); üstüne zıplayınca uyanır, hapşırır, renklenir ve Feza'nın peşine takılır (geçit töreni)
        'minder'  uyanınca yumuşacık zıplatma minderi olur (cisim.tip 'ziplat', guc ≈ 1100)
        'basamak' uyanınca uzayıp üstüne çıkılan bir basamak olur (üstten geçilen)
   buyukPofuduk: Işık Ağacı'nın önünde horlar; buyukIcin çiçekleri açıldıkça 3 aşamada uyanır
        (OLAY 'buyukAsama' {o, asama}), sonra yere yatıp Feza'yı ağaca fırlatan kocaman bir minder olur.
   Çizim: tüyler önbellekli sprite'larda (renk × boy × ölçek); kare başına yalnız dönüşüm + birkaç küçük şekil.
   Hiçbir şey korkutucu değil: diş yok, kızgın yüz yok; gözler hep yumuşak ve mutlu. */
'use strict';

// ── renkler ──
const PF_GOZ = '#33234a', PF_AGIZ = '#6e2f58', PF_AGIZIC = '#a9426c', PF_DIL = '#ff9cb8';
const PF_UYKU = { a: '#9a94bd', l: '#e4def7', d: '#5b5580', y: '#e8a6d2', i: '#b6a4ff' };   // gri-lavanta uyku tüyü
const PF_RENK = [
  { a: '#ffb2d3', l: '#fff2f8', d: '#df78a8', y: '#ff7aae', i: '#ffc0e0' },   // pembe
  { a: '#9fe9c9', l: '#f0fff8', d: '#55b891', y: '#ff94b2', i: '#a6ffd8' },   // nane
  { a: '#a8d7ff', l: '#f0f8ff', d: '#5f96dc', y: '#ff98bf', i: '#b0e2ff' },   // gök mavisi
  { a: '#ffe08a', l: '#fffbe8', d: '#d9a746', y: '#ff9486', i: '#fff0a6' },   // tereyağı
  { a: '#d3b7ff', l: '#f7f0ff', d: '#9773db', y: '#ff8cc0', i: '#dcc6ff' },   // leylak
  { a: '#ffc39e', l: '#fff1e8', d: '#e3865c', y: '#ff8c98', i: '#ffd2b2' },   // şeftali
];
const PF_BUYUK = { a: '#f2bbea', l: '#fff4fd', d: '#ba7dc8', y: '#ff84b6', i: '#f9caff' };
const PF_BUYUK_UYKU = { a: '#958fb9', l: '#ded8f3', d: '#555078', y: '#dea0cc', i: '#ae9eff' };

// ── boyutlar ──
const PF_RX = 26, PF_RY = 23;            // küçük Pofuduk gövdesi (yarıçaplar)
const PF_BAS_W = 60, PF_BAS_H = 106;     // basamak olunca (uzamış hali; tek zıplamayla çıkılır)
const PF_MINDER_GUC = 1100;
const PF_BRX = 100, PF_BRY = 100;        // Büyük Pofuduk (cisim en fazla 200 geniş)
const PF_BUYUK_GUC = 1360;
const PF_SLOT = [-58, 60, -100, 104, -142, 146, -184, 188];

// ── sprite önbelleği ──
let pfRes = 0;
const PF_SPR = new Map();
function pfResGuncel() {
  const r = clamp(Math.round(S * 2) / 2, 1, 3);
  if (r !== pfRes) { pfRes = r; PF_SPR.clear(); }
}
const pfRgba = (h, a) => { const c = hex(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };

// Tüylü gövde: peluş ponpon. Siluet = süper-elips (n=2 elips; büyük n → yastık) + kenar boyunca yuvarlak tüy topakları;
// topaklar "yumuşak maksimum" ile birleşir → dalgalı ama hiç sivri olmayan, yuvarlak kabarık kenar. Üstüne: yumuşak tüylenmiş
// kenar (genişletilmiş soluk dolgular), topak başına ışık/gölge, kısa ince tüyler, kenarda çok ince yumuşak saçak.
// Gövde merkezi sprite merkezinde. Dünya boyu: c.ww × c.wh. Önbellekli (kare başına çizilmez).
const PF_OL = new Float32Array(2 * 260);
function pfKurk(pal, w, h, seed, n = 2) {
  const key = pal.a + w + 'x' + h + ':' + seed + ':' + n;
  let c = PF_SPR.get(key); if (c) return c;
  const R = rng(seed), rx = w / 2, ry = h / 2, r = Math.min(rx, ry), rm = (rx + ry) / 2;
  const pad = r * 0.2 + 3;
  c = document.createElement('canvas');
  c.width = Math.ceil((w + pad * 2) * pfRes); c.height = Math.ceil((h + pad * 2) * pfRes);
  c.ww = c.width / pfRes; c.wh = c.height / pfRes;
  const x = c.getContext('2d');
  x.setTransform(pfRes, 0, 0, pfRes, c.width / 2, c.height / 2);
  x.lineCap = 'round'; x.lineJoin = 'round';
  // süper-elipsin kutupsal yarıçapı (yön açısı a)
  const rb = a => { const cs = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a)); return 1 / Math.pow(Math.pow(cs / rx, n) + Math.pow(sn / ry, n), 1 / n); };
  // kenar topakları
  const NC = clamp(Math.round(Math.PI * 2 * rm / (r * 0.46)), 9, 26), a0 = R() * 6.283;
  const top = [];
  for (let i = 0; i < NC; i++) {
    const a = a0 + (i + (R() - 0.5) * 0.3) * 6.283 / NC, alt = Math.sin(a) > 0.62;
    const rc = r * (alt ? 0.15 : 0.19 + R() * 0.05), d = rb(a) - rc * (alt ? 1.02 : 0.98);
    top.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: rc, alt });
  }
  // dış çizgi: her yönde topakların / tabanın yumuşak maksimumu (vadiler yuvarlanır)
  const M = clamp(Math.round(rm * 2.4), 64, 256), kk = 1 / Math.max(0.6, r * 0.045);
  for (let j = 0; j < M; j++) {
    const a = j / M * 6.283, ux = Math.cos(a), uy = Math.sin(a);
    let s = Math.exp(kk * (rb(a) * 0.86 - rm));   // taban (biraz içeride)
    for (const q of top) {
      const b = ux * q.x + uy * q.y, dsc = b * b - (q.x * q.x + q.y * q.y) + q.r * q.r;
      if (dsc > 0) s += Math.exp(kk * (b + Math.sqrt(dsc) - rm));
    }
    const t = rm + Math.log(s) / kk;
    PF_OL[j * 2] = ux * t; PF_OL[j * 2 + 1] = uy * t;
  }
  const sil = new Path2D();
  const mxp = j => (PF_OL[(j % M) * 2] + PF_OL[((j + 1) % M) * 2]) / 2, myp = j => (PF_OL[(j % M) * 2 + 1] + PF_OL[((j + 1) % M) * 2 + 1]) / 2;
  sil.moveTo(mxp(0), myp(0));
  for (let j = 1; j <= M; j++) sil.quadraticCurveTo(PF_OL[(j % M) * 2], PF_OL[(j % M) * 2 + 1], mxp(j), myp(j));
  sil.closePath();
  const big = Math.max(rx, ry);
  // yumuşak tüylenmiş kenar: biraz büyütülmüş soluk dolgular
  for (const [k, al] of [[1.07, 0.1], [1.045, 0.16], [1.022, 0.28]]) {
    x.save(); x.scale(k, k + (k - 1) * 0.4); x.fillStyle = pfRgba(mixc8(pal.a, pal.d, 0.25), al); x.fill(sil); x.restore();
  }
  // ana dolgu: sol üstten gelen yumuşak ışık
  let gr = x.createRadialGradient(-rx * 0.3, -ry * 0.42, 0, -rx * 0.08, -ry * 0.08, big * 1.3);
  gr.addColorStop(0, pal.l); gr.addColorStop(0.4, pal.a); gr.addColorStop(0.8, mixc8(pal.a, pal.d, 0.5)); gr.addColorStop(1, pal.d);
  x.fillStyle = gr; x.fill(sil);
  x.save(); x.clip(sil);
  // göbek: hafif açık yama
  gr = x.createRadialGradient(0, ry * 0.25, 0, 0, ry * 0.25, r * 0.8);
  gr.addColorStop(0, pfRgba(pal.l, 0.3)); gr.addColorStop(1, pfRgba(pal.l, 0));
  x.fillStyle = gr; x.fillRect(-rx, -ry, w, h * 1.1);
  // iç pamuk kümeleri (çok yumuşak)
  const K = Math.round(w * h / (r * r * 0.4));
  for (let i = 0; i < K; i++) {
    let u, v; do { u = R() * 2 - 1; v = R() * 2 - 1; } while (Math.pow(Math.abs(u), n) + Math.pow(Math.abs(v), n) > 0.7);
    const px = u * rx, py = v * ry, kr = r * (0.22 + R() * 0.14), lum = -u * 0.4 - v * 0.7;
    let g2 = x.createRadialGradient(px, py + kr * 0.45, 0, px, py + kr * 0.45, kr);
    g2.addColorStop(0, pfRgba(pal.d, 0.1)); g2.addColorStop(1, pfRgba(pal.d, 0));
    x.fillStyle = g2; x.fillRect(px - kr, py - kr * 0.55, kr * 2, kr * 2);
    g2 = x.createRadialGradient(px - kr * 0.15, py - kr * 0.25, 0, px - kr * 0.15, py - kr * 0.25, kr * 0.9);
    g2.addColorStop(0, pfRgba(pal.l, 0.16 + clamp(lum, 0, 1) * 0.22)); g2.addColorStop(1, pfRgba(pal.l, 0));
    x.fillStyle = g2; x.fillRect(px - kr * 1.1, py - kr * 1.2, kr * 2, kr * 2);
  }
  // kenar topakları: her biri hafifçe yuvarlak görünsün (iç yanında yumuşak gölge, dış üstünde ışık)
  for (const q of top) {
    const lum = clamp((-q.x / rx) * 0.45 - (q.y / ry) * 0.8, -1, 1);
    const L = Math.hypot(q.x, q.y) || 1, ix = -q.x / L, iy = -q.y / L;
    const sx = q.x + ix * q.r * 0.9, sy = q.y + iy * q.r * 0.9;
    let g2 = x.createRadialGradient(sx, sy, q.r * 0.2, sx, sy, q.r * 1.05);
    g2.addColorStop(0, pfRgba(pal.d, 0)); g2.addColorStop(0.75, pfRgba(pal.d, q.alt ? 0.05 : 0.1)); g2.addColorStop(1, pfRgba(pal.d, 0));
    x.fillStyle = g2; x.fillRect(sx - q.r * 1.1, sy - q.r * 1.1, q.r * 2.2, q.r * 2.2);
    g2 = x.createRadialGradient(q.x - q.r * 0.25, q.y - q.r * 0.3, 0, q.x - q.r * 0.25, q.y - q.r * 0.3, q.r * 0.85);
    g2.addColorStop(0, pfRgba(pal.l, 0.12 + Math.max(0, lum) * 0.3)); g2.addColorStop(1, pfRgba(pal.l, 0));
    x.fillStyle = g2; x.fillRect(q.x - q.r * 1.2, q.y - q.r * 1.2, q.r * 2, q.r * 2);
  }
  // kısa ince tüyler (yumuşak, düşük kontrast); yönleri dışa, alt yarıda aşağı sarkık
  const len = clamp(r * 0.09, 1.8, 5), lw = clamp(r * 0.022, 0.5, 1.1);
  const Mt = Math.round(w * h / (len * len * 0.9));
  const yollar = [new Path2D(), new Path2D(), new Path2D()];
  for (let i = 0; i < Mt; i++) {
    let u, v; do { u = R() * 2 - 1; v = R() * 2 - 1; } while (Math.pow(Math.abs(u), n) + Math.pow(Math.abs(v), n) > 1);
    const px = u * rx, py = v * ry;
    let ang = Math.atan2(v, u) + (R() - 0.5) * 0.8;
    if (v > 0) ang = lerp(ang, Math.PI / 2, 0.35);
    const Lh = len * (0.6 + R() * 0.6), ex = px + Math.cos(ang) * Lh, ey = py + Math.sin(ang) * Lh;
    const cx = (px + ex) / 2 - Math.sin(ang) * Lh * 0.3, cy = (py + ey) / 2 + Math.cos(ang) * Lh * 0.3;
    const lum = -u * 0.55 - v * 0.85 + (R() - 0.5) * 0.7;
    const k = lum > 0.35 ? 0 : lum > -0.45 ? 1 : 2;
    yollar[k].moveTo(px, py); yollar[k].quadraticCurveTo(cx, cy, ex, ey);
  }
  x.lineWidth = lw;
  x.strokeStyle = pfRgba(pal.l, 0.3); x.stroke(yollar[0]);
  x.strokeStyle = pfRgba(pal.l, 0.1); x.stroke(yollar[1]);
  x.strokeStyle = pfRgba(pal.d, 0.14); x.stroke(yollar[2]);
  // alt gölge ve üst kenar ışığı (içeriden)
  gr = x.createLinearGradient(0, ry * 0.2, 0, ry * 1.05);
  gr.addColorStop(0, pfRgba(pal.d, 0)); gr.addColorStop(1, pfRgba(pal.d, 0.45));
  x.fillStyle = gr; x.fillRect(-rx * 1.3, ry * 0.2, w * 1.3, ry);
  gr = x.createLinearGradient(0, -ry * 1.05, 0, ry * 0.1);
  gr.addColorStop(0, pfRgba(pal.l, 0.55)); gr.addColorStop(1, pfRgba(pal.l, 0));
  x.strokeStyle = gr; x.lineWidth = clamp(r * 0.12, 1.4, 6); x.stroke(sil);
  x.restore();
  // kenarda çok ince, kısa, yumuşak saçak (dışa doğru; sivri değil, yarı saydam)
  const fl = clamp(r * 0.075, 1.2, 4.5), fw = clamp(r * 0.02, 0.45, 1);
  const sac = [new Path2D(), new Path2D()];
  for (let j = 0; j < M; j++) {
    const ax = PF_OL[j * 2], ay = PF_OL[j * 2 + 1], L = Math.hypot(ax, ay) || 1;
    if (ay / L > 0.7 && R() < 0.7) continue;
    for (let m = 0; m < 2; m++) {
      const jt = (R() - 0.5) * 0.5, nx0 = ax / L, ny0 = ay / L, cs = Math.cos(jt), sn = Math.sin(jt);
      const ux = nx0 * cs - ny0 * sn, uy = nx0 * sn + ny0 * cs, Lh = fl * (0.5 + R() * 0.7);
      const bx = ax - nx0 * fl * 0.8, by = ay - ny0 * fl * 0.8, ex = ax + ux * Lh, ey = ay + uy * Lh;
      const k = ay / L < -0.1 && ax < rx * 0.4 ? 0 : 1;
      sac[k].moveTo(bx, by); sac[k].quadraticCurveTo(ax + ux * Lh * 0.3 - uy * Lh * 0.25, ay + uy * Lh * 0.3 + ux * Lh * 0.25, ex, ey);
    }
  }
  x.lineWidth = fw;
  x.strokeStyle = pfRgba(mixc8(pal.a, pal.l, 0.5), 0.45); x.stroke(sac[0]);
  x.strokeStyle = pfRgba(mixc8(pal.a, pal.d, 0.35), 0.38); x.stroke(sac[1]);
  PF_SPR.set(key, c); return c;
}
// iki hex rengin karışımı (hex döner; önbellek kurulumunda kullanılır)
function mixc8(a, b, t) { const A = hex(a), B = hex(b); return '#' + [0, 1, 2].map(i => Math.round(lerp(A[i], B[i], t)).toString(16).padStart(2, '0')).join(''); }

// Yıldız pırıltısı (4 köşeli), 'z' harfi, yaprak sprite'ları
function pfYildiz(col) {
  const key = 'y' + col; let c = PF_SPR.get(key); if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), [r, gg, b] = hex(col);
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${gg},${b},0.7)`); gr.addColorStop(0.35, `rgba(${r},${gg},${b},0.22)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  x.fillStyle = '#ffffff'; x.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? 4.5 : 27; x.lineTo(32 + Math.cos(a) * rr, 32 + Math.sin(a) * rr); }
  x.closePath(); x.fill();
  x.fillStyle = `rgba(${r},${gg},${b},0.55)`; x.beginPath(); x.arc(32, 32, 6, 0, 6.283); x.fill();
  PF_SPR.set(key, c); return c;
}
function pfZ() {
  let c = PF_SPR.get('z'); if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 34, 0, 32, 34, 30);
  gr.addColorStop(0, 'rgba(200,180,255,0.45)'); gr.addColorStop(1, 'rgba(200,180,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = '#8f7fd6'; x.lineWidth = 11;
  const z = () => { x.beginPath(); x.moveTo(20, 20); x.lineTo(44, 20); x.lineTo(20, 46); x.lineTo(44, 46); x.stroke(); };
  z(); x.strokeStyle = '#f4efff'; x.lineWidth = 6; z();
  PF_SPR.set('z', c); return c;
}
function pfYaprak(col) {
  const key = 'l' + col; let c = PF_SPR.get(key); if (c) return c;
  c = document.createElement('canvas'); c.width = 40; c.height = 24;
  const x = c.getContext('2d');
  x.fillStyle = col; x.beginPath(); x.moveTo(3, 12); x.quadraticCurveTo(18, -2, 37, 12); x.quadraticCurveTo(18, 26, 3, 12); x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 1.6; x.beginPath(); x.moveTo(5, 12); x.quadraticCurveTo(20, 10, 34, 12); x.stroke();
  PF_SPR.set(key, c); return c;
}

// ── parçacıklar (pırıltı, z, yaprak, hapşu bulutu) ──
const pfP = [];
let pfPSon = -1, pfCizSon = -1;
function pfParca(tip, x, y, vx, vy, life, s, col) {
  if (pfP.length > 180) return;
  pfP.push({ tip, x, y, vx, vy, life, max: life, s, col, rot: Math.random() * 6.283, vr: (Math.random() - 0.5) * 6, ph: Math.random() * 6.283 });
}
function pfPirilti(x, y, n, cols, hiz, omur, boy, yon = null, yay = 6.283) {
  for (let i = 0; i < n; i++) {
    const a = yon === null ? Math.random() * 6.283 : yon + (Math.random() - 0.5) * yay, s = hiz * (0.35 + Math.random() * 0.75);
    pfParca(0, x, y, Math.cos(a) * s, Math.sin(a) * s, omur * (0.6 + Math.random() * 0.6), boy * (0.6 + Math.random() * 0.7), cols[i % cols.length]);
  }
}
function pfParcaGuncelle(dt) {
  for (let i = pfP.length - 1; i >= 0; i--) {
    const q = pfP[i]; q.life -= dt;
    if (q.life <= 0) { pfP.splice(i, 1); continue; }
    q.ph += dt;
    if (q.tip === 0) { q.vx *= Math.exp(-dt * 2.6); q.vy = q.vy * Math.exp(-dt * 2.6) + 30 * dt; q.rot += q.vr * dt * 0.3; }
    else if (q.tip === 1) { q.vx = q.vx * Math.exp(-dt * 1.5) + Math.cos(q.ph * 2.2) * 26 * dt; q.vy = lerp(q.vy, -26, 1 - Math.exp(-dt * 2)); }
    else if (q.tip === 2) { q.vx *= Math.exp(-dt * 1.4); q.vy = q.vy * Math.exp(-dt * 1.8) + 70 * dt; q.vx += Math.sin(q.ph * 4) * 60 * dt; q.rot += q.vr * dt; }
    else { q.vx *= Math.exp(-dt * 4); q.vy *= Math.exp(-dt * 4); q.vy -= 8 * dt; }
    q.x += q.vx * dt; q.y += q.vy * dt;
  }
}
function pfParcaCiz() {
  const z = pfZ();
  for (const q of pfP) {
    const a = q.life / q.max, gir = Math.min(1, (q.max - q.life) * 8);
    if (q.tip === 0) {
      g.globalCompositeOperation = 'lighter';
      const s = q.s * (0.5 + 0.5 * a) * gir * (0.85 + 0.15 * Math.sin(q.ph * 18));
      g.globalAlpha = Math.min(1, a * 1.6);
      g.save(); g.translate(q.x, q.y); g.rotate(q.rot); g.drawImage(pfYildiz(q.col), -s, -s, s * 2, s * 2); g.restore();
      g.globalCompositeOperation = 'source-over';
    } else if (q.tip === 1) {
      const s = q.s * (0.6 + 0.6 * (1 - a));
      g.globalAlpha = Math.min(1, a * 2) * Math.min(1, (q.max - q.life) * 3) * 0.95;
      g.save(); g.translate(q.x, q.y); g.rotate(Math.sin(q.ph * 2.2) * 0.25); g.drawImage(z, -s, -s, s * 2, s * 2); g.restore();
    } else if (q.tip === 2) {
      const spr = pfYaprak(q.col), s = q.s;
      g.globalAlpha = Math.min(1, a * 2.5);
      g.save(); g.translate(q.x, q.y); g.rotate(q.rot); g.scale(1, 0.4 + 0.6 * Math.abs(Math.cos(q.ph * 5)));
      g.drawImage(spr, -s, -s * 0.6, s * 2, s * 1.2); g.restore();
    } else {
      g.globalCompositeOperation = 'lighter';
      dglow(q.col, q.x, q.y, q.s * (1.4 - a * 0.6), a * 0.3);
      g.globalCompositeOperation = 'source-over';
    }
  }
  g.globalAlpha = 1;
}
function pfKareBasi(dt) {   // her karede bir kez: parçacıklar + Feza'nın izi
  if (pfPSon === now) return;
  pfPSon = now;
  pfParcaGuncelle(dt);
  pfIzGuncelle();
  pfSlotHesapla();
  if (pfFinal) pfFinal.t += dt;
}

// ── Feza'nın izi: geçit töreni bu izi takip eder (atlayışlarını taklit ederler) ──
const pfIz = [];
let pfIzBos = true;
const PF_H = { x: 0, y: 0, yer: true, bos: false };
function pfZeminAltta() {
  if (P.ground) return true;
  const tx = Math.floor(P.x / T);
  if (tx < 0 || tx >= COLS) return false;
  for (let ty = Math.max(0, Math.floor(P.y / T)); ty < ROWS; ty++) if (grid[ty][tx]) return true;
  if (typeof CISIMLER !== 'undefined') for (const o of CISIMLER) { const c = o.cisim; if (c.aktif && Math.abs(o.x - P.x) < c.w / 2 && o.y - c.h >= P.y - 4) return true; }
  return false;
}
function pfIzGuncelle() {
  if (P.fade > 0 || !pfZeminAltta()) { pfIzBos = true; return; }
  const L = pfIz.length, son = L ? pfIz[L - 1] : null;
  if (son && Math.abs(P.x - son.x) + Math.abs(P.y - son.y) < 7) { if (P.ground) son.yer = true; return; }
  pfIz.push({ x: P.x, y: P.y, yer: P.ground, bos: pfIzBos || !son || Math.hypot(P.x - son.x, P.y - son.y) > 70 });
  pfIzBos = false;
  let d = 0;
  for (let i = pfIz.length - 1; i > 0; i--) {
    if (!pfIz[i].bos) d += Math.hypot(pfIz[i].x - pfIz[i - 1].x, pfIz[i].y - pfIz[i - 1].y);
    if (d > 640) { pfIz.splice(0, i - 1); break; }
  }
  if (pfIz.length > 400) pfIz.splice(0, pfIz.length - 400);
}
// Feza'nın d birim gerisindeki iz noktası (boşluk segmentleri sıfır uzunlukta sayılır: sıçrayarak geçilir)
function pfIzHedef(d) {
  const H = PF_H;
  let i = pfIz.length - 1;
  H.bos = false;
  if (i < 0) { H.x = P.x; H.y = P.y; H.yer = P.ground; return H; }
  let px, py, pyer, yeniBos, acc = 0;
  if (pfIzBos) { const q = pfIz[i]; px = q.x; py = q.y; pyer = q.yer; yeniBos = q.bos; i--; H.bos = true; }
  else { px = P.x; py = P.y; pyer = P.ground; yeniBos = false; }
  for (; i >= 0; i--) {
    const seg = pfIz[i];
    if (yeniBos) { H.bos = true; break; }
    {
      const sl = Math.hypot(seg.x - px, seg.y - py);
      if (acc + sl >= d) { const k = sl > 0 ? (d - acc) / sl : 0; H.x = lerp(px, seg.x, k); H.y = lerp(py, seg.y, k); H.yer = pyer && seg.yer; return H; }
      acc += sl;
    }
    px = seg.x; py = seg.y; pyer = seg.yer; yeniBos = seg.bos;
  }
  H.x = px; H.y = py; H.yer = pyer; return H;
}
// x sütununda yRef'e yakın zemin üstü (yoksa null)
function pfYerBul(x, yRef, tol = 50) {
  const tx = Math.floor(x / T); if (tx < 0 || tx >= COLS) return null;
  for (let ty = Math.max(1, Math.floor((yRef - tol) / T)); ty <= Math.floor((yRef + tol) / T) && ty < ROWS; ty++) {
    const c = grid[ty][tx];
    if ((c === 1 && grid[ty - 1][tx] !== 1) || c === 2) { const yy = ty * T; if (Math.abs(yy - yRef) <= tol) return yy; }
  }
  return null;
}

// ── Feza'yı yumuşakça bir hedefe süzdür (Büyük Pofuduk fırlatışı) ──
let pfSuzul = null;   // { hx, yer, t }
function pfSuzdur(hx, yer) { pfSuzul = { hx, yer, t: 0, y0: P.y }; }
function pfSuzulGuncelle(dt) {
  const s = pfSuzul; if (!s) return;
  s.t += dt;
  if (P.fade > 0 || s.t > 3.5 || (P.ground && s.t > 0.1)) { pfSuzul = null; return; }
  const basili = P.bounce || (typeof jumpHeld !== 'undefined' && jumpHeld);
  const gUp = basili ? 2200 : 4620, gDn = 2750, h = Math.max(0, s.yer - P.y);
  let kalan;
  if (P.vy < 0) { const tu = -P.vy / gUp, ha = h + P.vy * P.vy / (2 * gUp); kalan = tu + Math.sqrt(2 * ha / gDn); }
  else kalan = (-P.vy + Math.sqrt(P.vy * P.vy + 2 * gDn * h)) / gDn;
  // hedef zemin daha yüksekteyse: önce dimdik yüksel (kenara çarpmasın), sonra hedefe süzül
  if (P.vy < 0 && P.y > s.yer - 12 && s.yer < s.y0 - 20) { P.vx = 0; return; }
  P.vx = clamp((s.hx - P.x) / Math.max(0.06, kalan), -900, 900);
  if (Math.abs(P.vx) > 20) P.f = Math.sign(P.vx);
}

// ── ortak çizim: bir Pofuduk (küçük ya da büyük) ──
// cz alanları her çizimde doldurulur (ayırma yok)
const PF_CZ = { x: 0, y: 0, zemin: 0, sw: 52, sx: 1, sy: 1, rot: 0, don: 1, w: 52, h: 46, gH: 46, n: 2, s0: null, s1: null, bloom: 0, p0: PF_UYKU, p1: PF_RENK[0],
  yuzY: 0.5, r: 23, gozO: 1, goz: 'uyku', goz2: '', lid: 0, kirp: 0, bakX: 0, ff: 0, agiz: 'o', agizB: 0, yanak: 0.3,
  dik: 0, kul: 0, tut: 0, sal: 0, ayak: 0, adim: 0, pati: 0, patiS: 0, kabarcik: 0, parla: 0.2, golge: 1, tutamYok: false, seed: 1 };
const PF_TUTAM = new Float32Array(32);
function pfCiz(cz, tm) {
  const r = cz.r, w = cz.w, Hh = cz.gH;
  const colA = cz.bloom <= 0 ? cz.p0.a : cz.bloom >= 1 ? cz.p1.a : mixc(cz.p0.a, cz.p1.a, cz.bloom);
  const colD = cz.bloom <= 0 ? cz.p0.d : cz.bloom >= 1 ? cz.p1.d : mixc(cz.p0.d, cz.p1.d, cz.bloom);
  const colL = cz.bloom <= 0 ? cz.p0.l : cz.bloom >= 1 ? cz.p1.l : mixc(cz.p0.l, cz.p1.l, cz.bloom);
  // ışıltı ve gölge (dönüşümsüz)
  g.globalCompositeOperation = 'lighter';
  dglow(cz.bloom > 0.5 ? cz.p1.i : cz.p0.i, cz.x, cz.y - Hh * cz.sy * 0.5, Math.max(w, Hh) * 1.15, cz.parla);
  g.globalCompositeOperation = 'source-over';
  if (cz.golge > 0) {
    g.globalAlpha = 0.28 * cz.golge; g.fillStyle = '#0a0618';
    g.beginPath(); g.ellipse(cz.x, cz.zemin, w * 0.5 * cz.sx * (0.55 + 0.45 * cz.golge), Math.max(2, r * 0.13), 0, 0, 6.283); g.fill();
    g.globalAlpha = 1;
  }
  g.save();
  g.translate(cz.x, cz.y);
  if (cz.rot) g.rotate(cz.rot);
  g.scale(cz.sx * cz.don, cz.sy);
  const ust = -Hh, ff = cz.ff;
  // ayaklar
  if (cz.ayak > 0.01) {
    g.fillStyle = colD;
    for (let s = -1; s <= 1; s += 2) {
      const lift = Math.max(0, Math.sin(cz.adim + (s > 0 ? Math.PI : 0))) * r * 0.16;
      g.beginPath(); g.ellipse(s * w * 0.2 + ff * r * 0.1, -r * 0.03 - lift + (1 - cz.ayak) * r * 0.16, r * 0.25, r * 0.14, 0, 0, 6.283); g.fill();
    }
  }
  // kulaklar (gövdenin arkasında)
  const kAc = lerp(1.25, 0.42, cz.dik);
  for (let s = -1; s <= 1; s += 2) {
    const kx = s * w * 0.3, ky = ust + Hh * 0.16, ang = s * (kAc + cz.kul * s * 0.6 + Math.sin(tm * 1.1 + s) * 0.03 * (1 - cz.dik));
    const ew = r * 0.5, eh = r * 0.62;
    g.save(); g.translate(kx, ky); g.rotate(ang);
    pfSprCiz(cz, ew, eh, cz.seed + 11 + s, -ew / 2, -eh * 0.92, ew, eh);
    g.restore();
  }
  // gövde
  pfSprCiz(cz, cz.sw, cz.h, cz.seed, 0, 0, 0, 0, true);
  // tepe tutamı (uykudayken yana sarkan gece külahı ucu, uyanınca kıvrık perçem)
  if (!cz.tutamYok) {
    const d = cz.dik, bx = 0, by = ust + Hh * 0.04;
    let cx = lerp(r * 0.12, -r * 0.22, d), cy = lerp(-r * 0.62, -r * 0.82, d), ex = lerp(r * 0.68, r * 0.2, d), ey = lerp(-r * 0.02 + cz.sal * r * 0.12, -r * 0.66, d);
    const ca = Math.cos(cz.tut), sa = Math.sin(cz.tut);
    const rcx = cx * ca - cy * sa, rcy = cx * sa + cy * ca, rex = ex * ca - ey * sa, rey = ex * sa + ey * ca;
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const t = i / n, it = 1 - t;
      const px = it * it * bx + 2 * it * t * (bx + rcx) + t * t * (bx + rex), py = it * it * by + 2 * it * t * (by + rcy) + t * t * (by + rey);
      const tx = 2 * it * rcx + 2 * t * (rex - rcx), ty = 2 * it * rcy + 2 * t * (rey - rcy), tl = Math.hypot(tx, ty) || 1;
      const wd = r * (0.26 * it + 0.08 * t);
      PF_TUTAM[i * 2] = px - ty / tl * wd; PF_TUTAM[i * 2 + 1] = py + tx / tl * wd;
      PF_TUTAM[(2 * n + 1 - i) * 2] = px + ty / tl * wd; PF_TUTAM[(2 * n + 1 - i) * 2 + 1] = py - tx / tl * wd;
    }
    g.fillStyle = colA; g.beginPath(); g.moveTo(PF_TUTAM[0], PF_TUTAM[1]);
    for (let i = 1; i < (n + 1) * 2; i++) g.lineTo(PF_TUTAM[i * 2], PF_TUTAM[i * 2 + 1]);
    g.closePath(); g.fill();
    g.strokeStyle = colL; g.globalAlpha = 0.7; g.lineWidth = r * 0.05; g.lineCap = 'round';
    g.beginPath(); g.moveTo(bx - r * 0.04, by - r * 0.05); g.quadraticCurveTo(bx + rcx * 0.9 - r * 0.05, by + rcy * 0.9, bx + rex * 0.85, by + rey * 0.85 - r * 0.04); g.stroke();
    g.globalAlpha = 1;
    const pr = r * lerp(0.48, 0.36, d);
    pfSprCiz(cz, pr, pr, cz.seed + 23, bx + rex - pr / 2, by + rey - pr / 2, pr, pr);
  }
  // yüz
  g.save();
  g.translate(ff * r * 0.16, ust + Hh * cz.yuzY);
  g.scale(r, r);
  pfYuz(cz, tm);
  g.restore();
  // patiler
  if (cz.pati > 0.02) {
    g.fillStyle = colA; g.strokeStyle = colD; g.lineWidth = r * 0.04;
    for (let s = -1; s <= 1; s += 2) {
      const yuk = cz.pati, sal = Math.sin(cz.patiS + (s > 0 ? 1.4 : 0)) * 0.35 * yuk;
      const px = s * (w * 0.44 + r * 0.04 * yuk), py = ust + Hh * lerp(0.66, 0.3, yuk) + sal * r * 0.3;
      g.save(); g.translate(px, py); g.rotate(s * (0.5 + yuk * 0.6 + sal));
      const pw = r * 0.36, ph = r * 0.44;
      pfSprCiz(cz, pw, ph, cz.seed + 31, -pw / 2, -ph * 0.75, pw, ph); g.restore();
    }
  }
  g.restore();
}
// Sprite'ı uyku/uyanık renkleri arasında geçişle çiz. govde=true → gövde sprite'ı (yerleşimi kendisi hesaplar)
function pfSprCiz(cz, w, h, seed, dx, dy, dw, dh, govde) {
  const n = govde ? cz.n : 2;
  for (let k = 0; k < 2; k++) {
    const a = k === 0 ? (cz.bloom >= 1 ? 0 : 1) : cz.bloom;
    if (a <= 0.001) continue;
    const spr = pfKurk(k === 0 ? cz.p0 : cz.p1, Math.round(w), Math.round(h), seed, n);
    g.globalAlpha = a;
    if (govde) {
      const kx = cz.w / w, ky = cz.gH / h, sw = spr.ww * kx, sh = spr.wh * ky;
      g.drawImage(spr, -sw / 2, -cz.gH / 2 - sh / 2, sw, sh);
    } else {
      const sw = spr.ww * dw / w, sh = spr.wh * dh / h;
      g.drawImage(spr, dx + dw / 2 - sw / 2, dy + dh / 2 - sh / 2, sw, sh);
    }
  }
  g.globalAlpha = 1;
}
// Yüz (birim: r; merkez yüz ortası)
function pfYuz(cz, tm) {
  const go = cz.gozO, ff = cz.ff;
  g.lineCap = 'round'; g.lineJoin = 'round';
  // yanaklar
  if (cz.yanak > 0.01) {
    g.globalAlpha = cz.yanak; g.fillStyle = cz.bloom > 0.5 ? cz.p1.y : cz.p0.y;
    for (let s = -1; s <= 1; s += 2) { g.beginPath(); g.ellipse(s * 0.6 + ff * 0.08, 0.27, 0.17, 0.1, 0, 0, 6.283); g.fill(); }
    g.globalAlpha = 1;
  }
  // gözler
  for (let s = -1; s <= 1; s += 2) {
    const tip = (s < 0 || !cz.goz2) ? cz.goz : cz.goz2;
    const ex = s * 0.36 * (1 - Math.abs(ff) * 0.12) + ff * 0.06, ey = 0;
    pfGoz(tip, ex, ey, go, cz, s);
  }
  // ağız
  const mx = ff * 0.1, my = 0.3, b = cz.agizB;
  g.fillStyle = PF_AGIZ; g.strokeStyle = PF_AGIZ; g.lineWidth = 0.055;
  switch (cz.agiz) {
    case 'o': g.beginPath(); g.ellipse(mx, my + 0.02, 0.035 + 0.06 * b, 0.04 + 0.07 * b, 0, 0, 6.283); g.fill(); break;
    case 'hapsu': g.beginPath(); g.ellipse(mx, my + 0.02, 0.06, 0.03, 0, 0, 6.283); g.fill(); break;
    case 'gulus':   // ω
      g.beginPath(); g.arc(mx - 0.065, my - 0.02, 0.065, 0.15 * Math.PI, 0.95 * Math.PI); g.stroke();
      g.beginPath(); g.arc(mx + 0.065, my - 0.02, 0.065, 0.05 * Math.PI, 0.85 * Math.PI); g.stroke(); break;
    case 'acik': {
      const ag = 0.1 + 0.16 * b;
      g.fillStyle = PF_AGIZIC; g.beginPath(); g.moveTo(mx - 0.14, my - 0.03); g.quadraticCurveTo(mx, my - 0.06, mx + 0.14, my - 0.03);
      g.quadraticCurveTo(mx + 0.1, my + ag, mx, my + ag); g.quadraticCurveTo(mx - 0.1, my + ag, mx - 0.14, my - 0.03); g.fill();
      g.fillStyle = PF_DIL; g.beginPath(); g.ellipse(mx, my + ag * 0.72, 0.075, 0.045 + ag * 0.12, 0, 0, 6.283); g.fill();
      g.strokeStyle = PF_AGIZ; g.lineWidth = 0.035; g.beginPath(); g.moveTo(mx - 0.14, my - 0.03); g.quadraticCurveTo(mx, my - 0.06, mx + 0.14, my - 0.03); g.stroke();
      break;
    }
    case 'esne': {
      const rx = 0.13 + 0.15 * b, ry = 0.08 + 0.24 * b;
      g.fillStyle = PF_AGIZIC; g.beginPath(); g.ellipse(mx, my + ry * 0.55, rx, ry, 0, 0, 6.283); g.fill();
      g.fillStyle = PF_DIL; g.beginPath(); g.ellipse(mx, my + ry * 1.18, rx * 0.62, ry * 0.32, 0, Math.PI, 0); g.fill();
      g.strokeStyle = PF_AGIZ; g.lineWidth = 0.04; g.beginPath(); g.ellipse(mx, my + ry * 0.55, rx, ry, 0, 0, 6.283); g.stroke();
      break;
    }
  }
  // horlama baloncuğu
  if (cz.kabarcik > 0.02) {
    const br = 0.05 + 0.3 * cz.kabarcik, bx = mx + 0.2 + br * 0.75, by = my - 0.02 - br * 0.25;
    g.fillStyle = 'rgba(200,235,255,0.22)'; g.beginPath(); g.arc(bx, by, br, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(235,248,255,0.75)'; g.lineWidth = 0.025; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(bx - br * 0.4, by - br * 0.4, br * 0.22, br * 0.13, -0.7, 0, 6.283); g.fill();
  }
}
function pfGoz(tip, ex, ey, go, cz, s) {
  g.strokeStyle = PF_GOZ; g.fillStyle = PF_GOZ; g.lineWidth = 0.065 * go;
  if (tip === 'uyku') {   // kapalı, aşağı kıvrık (huzurlu)
    g.beginPath(); g.arc(ex, ey - 0.05 * go, 0.12 * go, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke();
    g.lineWidth = 0.035 * go;   // küçük kirpikler
    g.beginPath(); g.moveTo(ex + s * 0.11 * go, ey + 0.0); g.lineTo(ex + s * 0.16 * go, ey + 0.035 * go); g.stroke();
    return;
  }
  if (tip === 'mutlu') {  // ^ ^
    g.beginPath(); g.arc(ex, ey + 0.07 * go, 0.12 * go, 1.12 * Math.PI, 1.88 * Math.PI); g.stroke(); return;
  }
  if (tip === 'sik') {    // > <  (hapşırırken / esnerken sıkıca kapalı)
    g.beginPath(); g.moveTo(ex - s * 0.11 * go, ey - 0.08 * go); g.lineTo(ex + s * 0.07 * go, ey); g.lineTo(ex - s * 0.11 * go, ey + 0.08 * go); g.stroke(); return;
  }
  // açık göz: kocaman ve parlak; kirp → kırpma; 'yarim' → uykulu göz kapağı
  const kirp = cz.kirp, lid = tip === 'yarim' ? cz.lid : 0;
  const rx = 0.135 * go, ry = 0.17 * go * (1 - kirp * 0.92);
  if (kirp > 0.82) { g.beginPath(); g.arc(ex, ey - 0.05 * go, 0.12 * go, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke(); return; }
  if (lid > 0) {
    const ly = ey - ry + ry * 2 * lid;
    g.save(); g.beginPath(); g.moveTo(ex - rx * 1.1, ly + 0.03 * go); g.quadraticCurveTo(ex, ly - 0.09 * go, ex + rx * 1.1, ly + 0.03 * go);
    g.lineTo(ex + rx * 1.3, ey + 0.4); g.lineTo(ex - rx * 1.3, ey + 0.4); g.closePath(); g.clip();
  }
  const bx = cz.bakX * 0.03 * go;
  g.beginPath(); g.ellipse(ex + bx, ey, rx, ry, 0, 0, 6.283); g.fill();
  g.fillStyle = '#5b3f86'; g.beginPath(); g.ellipse(ex + bx, ey + ry * 0.45, rx * 0.72, ry * 0.4, 0, 0, Math.PI); g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath(); g.ellipse(ex + bx - rx * 0.32, ey - ry * 0.38, rx * 0.42, ry * 0.36 * (ry > 0.05 ? 1 : 0.5), -0.3, 0, 6.283); g.fill();
  g.beginPath(); g.arc(ex + bx + rx * 0.38, ey + ry * 0.36, rx * 0.17, 0, 6.283); g.fill();
  if (lid > 0) {
    g.restore();
    const ly = ey - ry + ry * 2 * lid;
    g.strokeStyle = PF_GOZ; g.lineWidth = 0.06 * go;
    g.beginPath(); g.moveTo(ex - rx * 1.1, ly + 0.03 * go); g.quadraticCurveTo(ex, ly - 0.09 * go, ex + rx * 1.1, ly + 0.03 * go); g.stroke();
  }
}

// ── küçük Pofuduk ──
const pfKuyruk = [];   // Feza'nın peşindeki geçit töreni (uyanma sırasıyla)
let pfRenkSira = 0, pfFinal = null;

function pfYay(p, dt) {   // yaylar: ezilme, kulak, tutam (kararlılık için küçük adımlarla, yarı-örtük Euler)
  const n = Math.min(8, Math.ceil(dt / 0.008)), h = dt / n;
  for (let i = 0; i < n; i++) {
    p.sqv += (-(p.sq - p.sqH) * 190 - p.sqv * 9) * h; p.sq += p.sqv * h;
    p.kulv += (-p.kul * 150 - p.kulv * 6) * h; p.kul += p.kulv * h;
    p.tutv += (-p.tut * 120 - p.tutv * 5) * h; p.tut += p.tutv * h;
  }
  p.sq = clamp(p.sq, -0.28, 0.34); p.kul = clamp(p.kul, -0.9, 0.9); p.tut = clamp(p.tut, -1, 1);
  p.sqv = clamp(p.sqv, -12, 12);
}
function pfZipla(p, guc) { p.sqv += guc; p.kulv += guc * 1.6 * (Math.random() < 0.5 ? -1 : 1); p.tutv += guc * 1.2; }

TUR.kaydet('pofuduk', {
  kur(o) {
    const i = typeof o.renk === 'number' ? o.renk : pfRenkSira++;
    o.uyandi = false;
    o.cisim = { w: 52, h: 42, tip: o.tur === 'basamak' ? 'ustten' : 'kati', aktif: true, dx: 0, dy: 0 };
    o.pf = { pal: PF_RENK[i % PF_RENK.length], seed: 101 + i * 37, t: Math.random() * 10, nefesT: Math.random() * 3.2,
      durum: 'uyku', uT: 0, bloom: 0, dik: 0, sq: 0, sqv: 0, sqH: 0, kul: 0, kulv: 0, tut: 0, tutv: 0,
      f: 1, jy: 0, jv: 0, wy: 0, gy: 0, yt: o.y, faz: 0, kirpT: 1 + Math.random() * 3, kirp: 0, bakX: 0, ff: 0,
      goz: 'uyku', agiz: 'o', agizB: 0, pati: 0, patiS: 0, ayak: 0, adim: 0, zT: 1 + Math.random() * 2, kab: 0, nefesN: 0,
      mir: 0, mirT: 0, kikir: 0, davetT: 1, sihir: false, boy: 0, bsx: 1, bsy: 1, don: 1, rot: 0, sira: -1,
      sessiz: false, x0: o.x, y0: o.y, hopT: 2 + Math.random() * 3, dansI: 0, yer: true };
  },
  ustune(o, vy) {
    const p = o.pf;
    if (!o.uyandi) { pfUyandir(o, false); return; }
    if (o.tur === 'minder' && o.cisim.tip === 'ziplat') {   // her zıplayışta kocaman ezilme + kıkırdama
      pfZipla(p, 7.5); p.kikir = 0.75;
      pfPirilti(o.x, o.y - 26, 7, [p.pal.i, '#ffffff', p.pal.a], 150, 0.8, 9, -Math.PI / 2, 2.4);
      if (typeof AU !== 'undefined') AU.sfx('boing', 1);
    } else if (o.tur === 'basamak') { pfZipla(p, 2.5); }
  },
  guncelle(o, dt) {
    pfKareBasi(dt);
    pfSuzulGuncelle(dt);
    const p = o.pf; p.t += dt;
    if (p.durum === 'uyku') pfUykuGuncelle(o, p, dt);
    else pfUyanikGuncelle(o, p, dt);
    pfYay(p, dt);
  },
  ciz(o, tm) { pfKucukCiz(o, tm); },
  cizOn(o, tm) {
    if (pfCizSon === tm) return;
    pfCizSon = tm; pfParcaCiz();
  },
});

function pfUyandir(o, sessiz) {
  const p = o.pf;
  if (o.uyandi) return;
  o.uyandi = true; p.durum = 'uyaniyor'; p.uT = 0; p.sessiz = sessiz;
  pfZipla(p, 7); p.kab = 0;
  if (!sessiz) {
    if (o.tur === 'yol') { P.vy = -620; P.ground = false; }
    else if (o.tur === 'minder') { P.vy = -880; P.ground = false; P.dj = true; }
    pfPirilti(o.x, o.y - 30, 10, ['#ffffff', p.pal.i, '#fff3b0'], 170, 0.7, 9);
    if (typeof AU !== 'undefined') { AU.sfx('boing', 1); AU.sfx('bloom'); }
    OLAY.emit('uyandi', o);
  }
  if (o.tur === 'yol' || sessiz) o.cisim.aktif = false;
  else if (o.tur === 'minder') { o.cisim.tip = 'ziplat'; o.cisim.guc = PF_MINDER_GUC; o.cisim.h = 30; o.cisim.w = 66; }
}

function pfUykuGuncelle(o, p, dt) {
  // nefes: yavaş şişip inme, her nefeste büyüyen horlama baloncuğu, ara ara süzülen z'ler
  const per = 3.2;
  p.nefesT += dt;
  if (p.nefesT > per) { p.nefesT -= per; p.nefesN++; if (p.nefesN % 3 === 0 && p.kab > 0.5) { const r = PF_RY; pfPirilti(o.x + 11, o.y - 18, 4, ['#e8f6ff', '#ffffff'], 60, 0.5, 6); } }
  const u = p.nefesT / per, ic = u < 0.5 ? smooth(u / 0.5) : 1 - smooth((u - 0.5) / 0.5);
  p.nef = ic;
  p.kab = p.nefesN % 3 === 2 ? smooth(Math.min(1, p.nefesT / (per * 0.85))) : ic * 0.55;
  p.zT -= dt;
  if (p.zT <= 0) { p.zT = 2.2 + Math.random() * 1.2; pfParca(1, o.x + 14, o.y - 50, 18, -20, 2.6, 7 + Math.random() * 2, 0); }
  // tüy mıknatısı: üstünden atlarken Feza yumuşakça Pofuduk'un üstüne süzülür (uyandırmak kolay olsun)
  if (DURUM === 'oyun' && !P.ground && P.vy > -180 && Math.abs(P.x - o.x) < 50 && P.y < o.y - 36 && P.y > o.y - 190)
    P.vx = lerp(P.vx, (o.x - P.x) * 5, Math.min(1, dt * 12));
  // yanından itilince ya da Feza yakındayken: uykusunda gülümser, kıpırdanır
  const yakin = Math.abs(P.x - o.x) < 110 && Math.abs(P.y - o.y) < 90;
  p.mir = Math.max(0, p.mir - dt);
  p.goz = 'uyku';
  p.agiz = p.mir > 0 || yakin ? 'gulus' : 'o'; p.agizB = 0.25 + ic * 0.6;
  p.sqH = 0;
}

function pfUyanikGuncelle(o, p, dt) {
  p.uT += dt;
  // göz kırpma
  p.kirpT -= dt;
  if (p.kirpT < 0) { p.kirp = Math.min(1, -p.kirpT / 0.07); if (p.kirpT < -0.16) { p.kirpT = 2 + Math.random() * 3; p.kirp = 0; } } else p.kirp = 0;
  p.kikir = Math.max(0, p.kikir - dt);
  if (p.durum === 'uyaniyor') { pfUyanisAnim(o, p, dt); return; }
  if (pfFinal) { pfDans(o, p, dt); return; }
  if (p.durum === 'takip') pfTakip(o, p, dt);
  else if (p.durum === 'minder') pfMinder(o, p, dt);
  else if (p.durum === 'basamak') pfBasamak(o, p, dt);
}

// Uyanış: ezilme → gözler açılır → "a... a..." → HAPŞU! (pırıltı) → renk açar → sevinç zıplaması
function pfUyanisAnim(o, p, dt) {
  const t = p.uT, f = P.x < o.x ? -1 : 1;
  p.bakX = f * 0.6; p.ff = f * 0.35;
  p.dik = lerp(p.dik, t > 0.15 ? 1 : 0, 1 - Math.exp(-dt * 14));
  if (t < 0.15) { p.goz = 'sik'; p.agiz = 'o'; p.agizB = 0.3; }
  else if (t < 0.55) { p.goz = 'acik'; p.agiz = 'o'; p.agizB = 0.15; if (t > 0.38 && t < 0.46) p.kirp = 1; }
  else if (t < 0.92) {   // nefes çekiyor: geriye esner
    const k = smooth((t - 0.55) / 0.37);
    p.goz = 'sik'; p.agiz = 'o'; p.agizB = 0.2 + 0.5 * k; p.sqH = -0.1 * k; p.rot = -f * 0.12 * k;
  } else {
    if (!p.hapsu) {
      p.hapsu = true; p.sqH = 0; p.rot = 0; pfZipla(p, 9);
      const hx = o.x + f * 22, hy = o.y - (o.tur === 'basamak' ? PF_BAS_H * p.boy + 30 * (1 - p.boy) : 24) + 4;
      pfPirilti(hx, hy, 14, [p.pal.i, '#ffffff', p.pal.a, '#fff3b0'], 230, 0.9, 10, f > 0 ? 0 : Math.PI, 1.3);
      for (let i = 0; i < 4; i++) pfParca(3, hx + f * i * 8, hy, f * (90 + i * 50), (Math.random() - 0.5) * 40, 0.6, 10 + i * 3, p.pal.i);
      burst(o.x, o.y - 24, 10, [p.pal.i, p.pal.a], 150, 1.0, 6);
      if (typeof AU !== 'undefined') AU.sfx('hapsu', 1);
    }
    p.bloom = smooth(Math.min(1, (t - 0.92) / 0.5));
    if (t < 1.05) { p.goz = 'sik'; p.agiz = 'hapsu'; }
    else { p.goz = t < 1.5 ? 'mutlu' : 'acik'; p.agiz = 'acik'; p.agizB = 0.6; p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 10)); p.patiS += dt * 14; }
    if (t > 1.1 && !p.sevinc && o.tur !== 'basamak') { p.sevinc = true; p.jv = -260; }
  }
  // basamak: Feza'nın altında uzar (onu yukarı taşır)
  if (o.tur === 'basamak' && !p.sessiz) pfBasamakBoy(o, p, smooth(clamp((t - 0.12) / 0.7, 0, 1)));
  if (o.tur === 'minder') { const k = smooth(clamp((t - 0.2) / 0.5, 0, 1)); p.bsx = lerp(1, 1.24, k); p.bsy = lerp(1, 0.72, k); }
  pfHop(o, p, dt);
  if (t > 1.75) {
    p.durum = p.sessiz ? 'dans' : o.tur === 'yol' ? 'takip' : o.tur; p.pati = 0; p.bloom = 1;
    if (p.durum === 'takip') { p.sira = pfKuyruk.length; pfKuyruk.push(o); }
  }
}
function pfHop(o, p, dt) {   // balistik zıplama (jy: zeminden yukarı, eksi)
  if (p.jy < 0 || p.jv < 0) {
    p.jv += 1500 * dt; p.jy += p.jv * dt;
    if (p.jy >= 0) { p.jy = 0; p.jv = 0; pfZipla(p, 2.8); }
  }
}
function pfBasamakBoy(o, p, k) {
  const eskiH = o.cisim.h, yeniH = lerp(42, PF_BAS_H, k);
  p.boy = k; o.cisim.h = yeniH; o.cisim.w = lerp(52, PF_BAS_W - 4, k); o.cisim.dy = -(yeniH - eskiH);
}

// Geçit töreni: Feza'nın izini takip et; o durunca etrafında oyalan; boşlukları pırıltıyla süzülerek geç
function pfTakip(o, p, dt) {
  const i = p.sira;
  let tx, ty, yer = true, bos = false;
  const bekle = P.idle > 0.8 && P.ground && P.fade <= 0;
  let slot = null;
  const H = pfIzHedef(64 + i * 52);
  if (bekle || (P.ground && Math.abs(H.x - P.x) < 36 && Math.abs(H.y - P.y) < 70)) slot = pfSlotBul(i);
  if (slot) { tx = slot.x; ty = slot.y; }
  else { tx = H.x; ty = H.y; yer = H.yer; bos = H.bos; }
  pfGit(o, p, dt, tx, ty, yer, bos);
  pfAyir(o, p, dt);
  // yüz: Feza'ya bakar, mutlu
  const df = P.x - o.x;
  p.bakX = clamp(df / 120, -1, 1);
  if (p.sihir) { p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.5; }
  else if (p.kikir > 0) { p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.7; }
  else { p.goz = 'acik'; p.agiz = Math.abs(o.x - tx) > 4 ? 'acik' : 'gulus'; p.agizB = 0.25; }
  if (bekle && !p.sihir && p.jy === 0 && Math.abs(o.x - tx) < 4) {   // oyalanma: ara ara yerinde sevinç zıplaması
    p.f = df < 0 ? -1 : 1;
    p.hopT -= dt;
    if (p.hopT < 0) { p.hopT = 1.8 + Math.random() * 3; p.jv = -200 - Math.random() * 80; p.kikir = 0.4; if (Math.random() < 0.35) p.donH = 1; }
  }
  pfDonGuncelle(p, dt);
  pfHop(o, p, dt);
}
function pfAyir(o, p, dt) {   // kuyruktakiler üst üste binmesin: yakındakini yumuşakça it
  if (p.sihir) return;
  for (const q of pfKuyruk) {
    if (q === o || q.pf.sihir || Math.abs(o.y - q.y) > 40) continue;
    const d = o.x - q.x, ad = Math.abs(d);
    if (ad < 44) o.x += (ad < 0.5 ? (p.sira > q.pf.sira ? -1 : 1) : Math.sign(d)) * (44 - ad) * Math.min(1, dt * 7);
  }
}
// Bekleme yerleri: Feza durunca kuyruk çevresine dağılır (sırayla arka/ön); zemin yoksa aynı taraftan bir sonraki yer.
const PF_SLOTLAR = [];
function pfSlotHesapla() {
  let arka = 0, on = 0;
  for (let i = 0; i < pfKuyruk.length; i++) {
    const s = PF_SLOTLAR[i] || (PF_SLOTLAR[i] = { x: 0, y: 0, var: false });
    s.var = false;
    for (let deneme = 0; deneme < 2 && !s.var; deneme++) {
      const onde = (i % 2 === 1) !== (deneme === 1), k = onde ? on : arka;
      if (k > 2) continue;
      const sx = P.x + (onde ? 1 : -1) * P.f * (58 + k * 42), yy = pfYerBul(sx, P.y, 45);
      if (yy !== null) { s.x = sx; s.y = yy; s.var = true; if (onde) on++; else arka++; }
    }
  }
}
function pfSlotBul(i) { const s = PF_SLOTLAR[i]; return s && s.var ? s : null; }
function pfDonGuncelle(p, dt) {   // olduğu yerde bir tur (havada) — yatay ölçek cos ile
  if (p.donH) { p.donT = (p.donT || 0) + dt * 2.4; if (p.donT >= 1) { p.donT = 0; p.donH = 0; } }
  const yon = p.f;
  p.don = yon * (p.donH ? Math.cos(p.donT * Math.PI * 2) : 1);
  if (Math.abs(p.don) < 0.15) p.don = 0.15 * Math.sign(p.don || 1);
  p.ff = lerp(p.ff, p.f * 0.4 * Math.min(1, Math.abs(p.don)), 1 - Math.exp(-dt * 8));
}
// Hedefe hareket: yakınsa yürüyerek zıplaya zıplaya, uzaksa / boşluk varsa pırıltıyla süzülerek
function pfGit(o, p, dt, tx, ty, yer, bos) {
  const dx = tx - o.x, dy = ty - p.yt, d = Math.hypot(dx, dy);
  if (!p.sihir && (d > 130 || (bos && d > 30))) { p.sihir = true; p.jv = 0; p.jy = 0; pfPirilti(o.x, o.y - 20, 6, [p.pal.i, '#ffffff'], 90, 0.6, 7); }
  if (p.sihir) {
    const v = Math.max(Math.min(720, 160 + d * 4.5), d * 1.6), k = Math.min(1, v * dt / Math.max(d, 0.001));
    o.x += dx * k; p.yt += dy * k;
    p.gy = lerp(p.gy, -12 - Math.sin(p.t * 7) * 4, 1 - Math.exp(-dt * 8));
    p.wy = lerp(p.wy, 0, 1 - Math.exp(-dt * 12));
    if (Math.abs(dx) > 2) p.f = dx < 0 ? -1 : 1;
    if (Math.random() < dt * 22) pfParca(0, o.x - p.f * 12 + (Math.random() - 0.5) * 14, o.y + p.gy - 14 + (Math.random() - 0.5) * 14, -p.f * 30, 10, 0.7, 6 + Math.random() * 4, Math.random() < 0.5 ? p.pal.i : '#ffffff');
    p.ayak = lerp(p.ayak, 0.4, 1 - Math.exp(-dt * 6));
    if (d < 12) { p.sihir = false; p.jy = p.gy; p.gy = 0; p.jv = -60; pfZipla(p, 3); }
    o.y = p.yt; return;
  }
  p.gy = lerp(p.gy, 0, 1 - Math.exp(-dt * 10));
  const mx = clamp(dx * 9 * dt, -340 * dt, 340 * dt);
  o.x += mx;
  if (Math.abs(mx) > 0.05) p.f = mx < 0 ? -1 : 1;
  const hiz = Math.abs(mx) / Math.max(dt, 1e-4), gidiyor = hiz > 25;
  if (yer) {
    p.yt = lerp(p.yt, ty, 1 - Math.exp(-dt * 20));
    // zıplaya zıplaya yürüyüş: adım fazı katedilen yolla ilerler; durunca adım tamamlanır
    if (gidiyor || p.faz % Math.PI > 0.02) {
      const eski = Math.floor(p.faz / Math.PI);
      p.faz += (gidiyor ? Math.abs(mx) : 150 * dt) / 34 * Math.PI;
      if (Math.floor(p.faz / Math.PI) !== eski) { pfZipla(p, 2.4); if (!gidiyor) p.faz = Math.floor(p.faz / Math.PI) * Math.PI; }
      p.wy = -Math.abs(Math.sin(p.faz)) * 12 * (gidiyor ? Math.min(1, hiz / 140 + 0.4) : 0.6);
    } else p.wy = lerp(p.wy, 0, 1 - Math.exp(-dt * 12));
    p.adim = p.faz;
  } else {
    p.yt = lerp(p.yt, ty, 1 - Math.exp(-dt * 16));
    p.wy = lerp(p.wy, 0, 1 - Math.exp(-dt * 10));
  }
  p.ayak = lerp(p.ayak, 1, 1 - Math.exp(-dt * 6));
  o.y = p.yt;
}

// Minder: yassı ve yumuşacık; Feza yakındaysa "hadi zıpla!" diye hafifçe hoplar
function pfMinder(o, p, dt) {
  const df = P.x - o.x, yakin = Math.abs(df) < 170 && Math.abs(P.y - o.y) < 120;
  p.bakX = clamp(df / 120, -1, 1); p.ff = lerp(p.ff, clamp(df / 200, -1, 1) * 0.3, 1 - Math.exp(-dt * 5));
  p.bsx = 1.24; p.bsy = 0.72; p.f = 1; p.don = 1;
  if (p.kikir > 0) { p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.8; p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 12)); p.patiS += dt * 18; }
  else {
    p.goz = 'acik'; p.agiz = yakin ? 'acik' : 'gulus'; p.agizB = 0.3;
    p.pati = lerp(p.pati, yakin ? 0.55 : 0, 1 - Math.exp(-dt * 6)); p.patiS += dt * 7;
    if (yakin && P.ground) { p.davetT -= dt; if (p.davetT < 0) { p.davetT = 1.1; pfZipla(p, 3.2); } }
  }
  p.ayak = 0.6; p.nef = 0.5 + 0.5 * Math.sin(p.t * 2.2);
}
// Basamak: uzun, dimdik; üstünde Feza varken gülümser
function pfBasamak(o, p, dt) {
  const df = P.x - o.x, ustunde = typeof ustundeki !== 'undefined' && ustundeki === o;
  p.bakX = clamp(df / 120, -1, 1); p.ff = lerp(p.ff, clamp(df / 200, -1, 1) * 0.3, 1 - Math.exp(-dt * 5));
  o.cisim.dy = 0; p.f = 1; p.don = 1;
  p.sqH = ustunde ? 0.035 : 0;
  p.goz = ustunde || p.kikir > 0 ? 'mutlu' : 'acik'; p.agiz = ustunde ? 'acik' : 'gulus'; p.agizB = 0.4;
  p.pati = lerp(p.pati, ustunde ? 0.35 : 0, 1 - Math.exp(-dt * 6)); p.patiS += dt * 5;
  p.ayak = 1;
}

// Final: hepsi Feza'nın çevresinde zıplayıp dans eder
function pfDans(o, p, dt) {
  if (p.dansI === undefined || p.dansI < 0) p.dansI = 0;
  const i = p.dansI, sx = P.x + PF_SLOT[i % PF_SLOT.length] * 1.05;
  const yy = pfYerBul(sx, P.y, 60);
  const tx = sx, ty = yy === null ? P.y : yy;
  if (Math.abs(tx - o.x) > 14 || Math.abs(ty - p.yt) > 6 || p.sihir) {
    pfGit(o, p, dt, tx, ty, true, false);
    p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.6; pfHop(o, p, dt);
    return;
  }
  o.x = lerp(o.x, tx, 1 - Math.exp(-dt * 6));
  pfAyir(o, p, dt);
  // ritimli zıplama: her 0.6 sn'de bir; iki zıplamada bir dönüş
  const per = 0.6, ft = pfFinal.t + i * 0.15, k = Math.floor(ft / per);
  if (k !== p.dansK) {
    p.dansK = k; p.jv = -300 - (i % 2) * 40; pfZipla(p, 4.5);
    if (k % 2 === 0) p.donH = 1;
    if (Math.random() < 0.6) pfPirilti(o.x, o.y - 10, 4, [p.pal.i, '#ffffff', '#fff3b0'], 90, 0.6, 7, -Math.PI / 2, 2.6);
  }
  p.f = P.x < o.x ? -1 : 1;
  pfDonGuncelle(p, dt);
  p.goz = (k % 4 === 1) ? 'acik' : 'mutlu'; p.agiz = 'acik'; p.agizB = 0.75;
  p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 8)); p.patiS += dt * 12; p.ayak = 1;
  pfHop(o, p, dt);
}

function pfKucukCiz(o, tm) {
  pfResGuncel();
  const p = o.pf, cz = PF_CZ;
  const uyku = p.durum === 'uyku';
  const nef = uyku ? p.nef || 0 : 0.5 + 0.5 * Math.sin(p.t * 2.6);
  const bas = o.tur === 'basamak' ? p.boy : 0;
  const hy = p.jy + p.wy + p.gy;
  cz.x = o.x; cz.y = o.y + hy; cz.zemin = o.y;
  cz.golge = p.sihir ? 0.25 : clamp(1 + hy / 60, 0.3, 1);
  cz.rot = p.rot;
  const sq = p.sq * (1 - bas * 0.8);
  cz.sx = p.bsx * (1 + sq) * (1 - nef * 0.02 * (uyku ? 1 : 0.5));
  cz.sy = p.bsy * (1 - sq) * (1 + nef * 0.04 * (uyku ? 1 : 0.5)) * (uyku ? 0.95 : 1);
  cz.don = p.don || 1;
  cz.seed = p.seed; cz.p0 = PF_UYKU; cz.p1 = p.pal; cz.bloom = p.bloom;
  cz.r = PF_RY; cz.gozO = 1;
  if (bas > 0.001) {   // uzayan basamak: kapsül gövde, yüz üstte
    cz.n = 2.7; cz.sw = PF_BAS_W; cz.h = PF_BAS_H; cz.w = lerp(PF_RX * 2, PF_BAS_W, bas); cz.gH = lerp(PF_RY * 2, PF_BAS_H, bas);
    cz.yuzY = lerp(0.5, 0.24, bas);
  } else { cz.n = 2; cz.sw = PF_RX * 2; cz.h = PF_RY * 2; cz.w = PF_RX * 2; cz.gH = PF_RY * 2; cz.yuzY = 0.5; }
  cz.goz = p.goz; cz.goz2 = ''; cz.kirp = p.kirp; cz.bakX = p.bakX; cz.ff = p.ff; cz.lid = 0;
  cz.agiz = p.agiz; cz.agizB = p.agizB;
  cz.yanak = uyku ? 0.3 : 0.55;
  cz.dik = p.dik; cz.kul = p.kul; cz.tut = p.tut + (uyku ? Math.sin(p.t * 0.9) * 0.05 : Math.sin(p.t * 3) * 0.04);
  cz.sal = uyku ? nef : 0;
  cz.ayak = uyku ? 0 : p.ayak; cz.adim = p.adim;
  cz.pati = p.pati; cz.patiS = p.patiS;
  cz.kabarcik = uyku ? p.kab : 0;
  cz.parla = uyku ? 0.16 + nef * 0.1 : 0.2 + p.bloom * 0.12;
  cz.tutamYok = false;
  pfCiz(cz, tm);
}

// ── Büyük Pofuduk ──
const PF_ASAMA_BEKLE = [0, 2.4, 3.0];   // bir sonraki aşamadan önce en az bu kadar sn (animasyon bitsin)
TUR.kaydet('buyukPofuduk', {
  kur(o) {
    o.uyandi = false; o.uyanma = 0;
    o.cisim = { w: 196, h: 196, tip: 'kati', aktif: true, dx: 0, dy: 0 };
    o.pf = { t: 0, asama: 0, aT: 10, nefesT: 0, nefesN: 0, sq: 0, sqv: 0, sqH: 0, kul: 0, kulv: 0, tut: 0, tutv: 0,
      bloom: 0, dik: 0, yat: 0, hy: 0, hv: 0, kirp: 0, kirpT: 3, kikir: 0, mir: 0, hedefX: o.x, f: -1, don: 1, pati: 0, patiS: 0,
      zT: 1, dansK: -1, davetT: 1, x0: o.x, ff: -0.3, bakX: 0, nef: 0, kab: 0, goz: 'uyku', goz2: '', lid: 0, agiz: 'o', agizB: 0, rot: 0 };
  },
  ustune(o, vy) {
    const p = o.pf;
    if (o.cisim.tip === 'ziplat') {   // kocaman yumuşak minder: Feza'yı ağaca doğru fırlat
      pfZipla(p, 6); p.kikir = 0.9;
      pfPirilti(P.x, o.y - o.cisim.h, 12, [PF_BUYUK.i, '#ffffff', '#fff3b0'], 220, 0.9, 12, -Math.PI / 2, 2.2);
      if (P.x < o.x + 40 && typeof TREE !== 'undefined' && TREE) pfSuzdur(TREE.x - 18, TREE.y);
      if (typeof AU !== 'undefined') AU.sfx('boing', 1.5);
      return;
    }
    // uyurken tepesine çıkılırsa: göbeği onu nazikçe geri zıplatır
    P.vy = -760; P.ground = false; pfZipla(p, 4); p.mir = 1;
    pfSuzdur(o.x - o.cisim.w / 2 - 70, o.y);
  },
  guncelle(o, dt) {
    pfKareBasi(dt);
    pfSuzulGuncelle(dt);
    pfBuyukGuncelle(o, dt);
  },
  ciz(o, tm) { pfBuyukCiz(o, tm); },
  cizOn(o, tm) { if (pfCizSon === tm) return; pfCizSon = tm; pfParcaCiz(); },
});

function pfBuyukGuncelle(o, dt) {
  const p = o.pf; p.t += dt; p.aT += dt;
  let top = 0, acik = 0;
  for (const n of NESNELER) if (n.buyukIcin) { top++; if (n.done) acik++; }
  o.uyanma = top ? acik / top : 1;
  const hedef = top ? Math.min(3, Math.floor(acik * 3 / top + 1e-6)) : 3;
  if (p.asama < hedef && p.aT > PF_ASAMA_BEKLE[p.asama]) {
    p.asama++; p.aT = 0;
    OLAY.emit('buyukAsama', { o, asama: p.asama });
    pfZipla(p, 3);
    if (p.asama === 2 && typeof AU !== 'undefined') AU.sfx('esneme', 1);
  }
  p.kirpT -= dt;
  if (p.kirpT < 0) { p.kirp = Math.min(1, -p.kirpT / 0.1); if (p.kirpT < -0.24) { p.kirpT = 2.5 + Math.random() * 3; p.kirp = 0; } } else p.kirp = 0;
  p.kikir = Math.max(0, p.kikir - dt); p.mir = Math.max(0, p.mir - dt);
  const a = p.asama, t = p.aT, bx = o.x, top0 = o.y - PF_BRY * 2;
  const df = P.x - o.x;
  p.bakX = clamp(df / 200, -1, 1);
  // horlama (aşama 0–1): şişer, sonra üfler → yapraklar ve pırıltılar uçar
  if (a < 2 || (a === 2 && t < 0.1)) {
    const per = a === 0 ? 3.4 : 4.2;
    p.nefesT += dt;
    if (p.nefesT > per) { p.nefesT -= per; p.nefesN++; p.puf = false; }
    const u = p.nefesT / per;
    p.nef = u < 0.55 ? smooth(u / 0.55) : 1 - smooth((u - 0.55) / 0.45);
    p.kab = p.nefesN % 2 === 1 ? smooth(Math.min(1, u / 0.55)) * (u < 0.92 ? 1 : 0) : p.nef * 0.4;
    if (p.nefesN % 2 === 1 && u >= 0.92 && !p.pat) { p.pat = true; pfPirilti(bx + 30, o.y - 88, 6, ['#e8f6ff', '#ffffff'], 90, 0.6, 9); }
    if (u < 0.5) p.pat = false;
    if (u > 0.57 && !p.puf) {   // HORR-PUF
      p.puf = true; pfZipla(p, a === 0 ? 2.4 : 1.4);
      const mx = bx - 22, my = o.y - 80, n = a === 0 ? 5 : 3;
      for (let i = 0; i < n; i++) pfParca(2, mx - 10, my + (Math.random() - 0.5) * 24, -(130 + Math.random() * 170), -40 - Math.random() * 110, 2.4 + Math.random(), 9 + Math.random() * 5, ['#8fe3c2', '#b9f0a8', '#ffd1e6', '#a9dcff'][i % 4]);
      pfPirilti(mx - 6, my, a === 0 ? 8 : 4, ['#d8ccff', '#ffffff', '#bff4ff'], 160, 0.9, 9, Math.PI + 0.25, 0.9);
      for (let i = 0; i < 3; i++) pfParca(3, mx - i * 14, my + 4, -(70 + i * 40), -10, 0.9, 16 + i * 5, '#cfc4ff');
      pfParca(1, bx + 30, top0 + 40, 26, -26, 3, 14 + Math.random() * 4, 0);
      if (typeof AU !== 'undefined') AU.sfx('horlama', a === 0 ? 1 : 0.6);
    }
  } else { p.nef = 0.5 + 0.5 * Math.sin(p.t * 1.4); p.kab = Math.max(0, (p.kab || 0) - dt * 3); }
  p.sqH = 0;
  // aşamaya göre yüz ve duruş
  p.goz2 = ''; p.lid = 0; p.rot = 0;
  if (a === 0) {
    p.goz = 'uyku'; p.agiz = 'o'; p.agizB = 0.15 + p.nef * 0.35 + (p.nef < 0.9 && p.puf ? Math.sin(p.t * 40) * 0.08 : 0);
    if (p.mir > 0) p.agiz = 'gulus';
    p.dik = lerp(p.dik, 0, 1 - Math.exp(-dt * 3)); p.pati = lerp(p.pati, 0, 1 - Math.exp(-dt * 5));
  } else if (a === 1) {   // bir göz uykulu uykulu açılır, Feza'ya bakar
    const ac = smooth(clamp(t / 0.9, 0, 1)), uyuk = 0.5 + 0.5 * Math.sin(t * 0.9 - 1.5);
    p.goz = 'uyku'; p.goz2 = 'yarim'; p.lid = lerp(1, 0.42 + uyuk * 0.18, ac);
    if (df < 0) { p.goz = 'yarim'; p.goz2 = 'uyku'; }
    p.agiz = 'o'; p.agizB = 0.12 + p.nef * 0.25;
    p.dik = lerp(p.dik, 0.25, 1 - Math.exp(-dt * 3));
  } else if (a === 2) {   // kocaman bir esneme ve gerinme
    const ac = t < 0.7 ? smooth(t / 0.7) : t < 1.9 ? 1 : 1 - smooth(clamp((t - 1.9) / 0.5, 0, 1));
    if (t < 2.5) {
      p.goz = 'sik'; p.agiz = 'esne'; p.agizB = ac * (0.92 + Math.sin(t * 9) * 0.04);
      p.sqH = -0.1 * ac; p.pati = ac; p.patiS = Math.sin(t * 2) * 0.6 - 1.5; p.rot = Math.sin(t * 2.2) * 0.04 * ac;
      if (t > 0.6 && t < 1.9 && Math.random() < dt * 10) pfPirilti(bx, o.y - 90, 1, ['#ffffff', '#ffe9b8'], 60, 0.8, 8, -Math.PI / 2, 1.5);
    } else {   // uykulu ama uyanık: iki göz yarı açık, sallanır
      p.goz = 'yarim'; p.lid = 0.38 + 0.12 * Math.sin(t * 0.8); p.agiz = 'gulus'; p.agizB = 0.3;
      p.rot = Math.sin(t * 1.1) * 0.025; p.pati = lerp(p.pati, 0, 1 - Math.exp(-dt * 4));
    }
    p.dik = lerp(p.dik, 0.6, 1 - Math.exp(-dt * 3));
  } else {   // aşama 3: tam uyanık, sevinç, renk açar, sonra yere yatıp minder olur
    p.dik = lerp(p.dik, 1, 1 - Math.exp(-dt * 6));
    if (t < 0.35) { p.goz = 'acik'; p.agiz = 'o'; p.agizB = 0.6; p.kirp = 0; }
    else {
      if (!o.uyandi) {
        o.uyandi = true; pfZipla(p, 8);
        for (let i = 0; i < 22; i++) { const a = i / 22 * 6.283; pfParca(0, bx + Math.cos(a) * 90, o.y - 108 + Math.sin(a) * 80, Math.cos(a) * 240, Math.sin(a) * 200, 1.1 + Math.random() * 0.4, 10 + Math.random() * 6, i % 3 ? PF_BUYUK.i : '#fff3b0'); }
        burst(bx, o.y - 108, 18, [PF_BUYUK.i, '#ffd6f2', '#fff3b0'], 300, 1.4, 9);
        if (typeof AU !== 'undefined') AU.sfx('bloom', 1);
        OLAY.emit('uyandi', o);
      }
      p.bloom = smooth(clamp((t - 0.35) / 0.9, 0, 1));
      p.goz = (t > 1 && t < 2.5) ? 'mutlu' : 'acik'; p.agiz = 'acik'; p.agizB = 0.7;
    }
    if (t > 1.1 && !p.h1) { p.h1 = true; p.hv = -420; }
    if (t > 1.9 && !p.h2) { p.h2 = true; p.hv = -380; }
    if (t < 2.6) { p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 8)); p.patiS += dt * 12; }
    // yere yatma: alçalır ve yayvanlaşır; cisim de alçalır
    if (!pfFinal) {
      const yk = smooth(clamp((t - 2.7) / 1.0, 0, 1));
      p.yat = yk;
      const eskiH = o.cisim.h, yeniH = lerp(196, 96, yk);
      o.cisim.h = yeniH; o.cisim.dy = -(yeniH - eskiH);
      if (t > 3.7 && o.cisim.tip !== 'ziplat') { o.cisim.tip = 'ziplat'; o.cisim.guc = pfBuyukGuc(o); o.cisim.dy = 0; }
    }
    if (t > 2.6) {   // minder hali: davet eder, Feza'ya bakar
      const yakin = Math.abs(df) < 260;
      if (p.kikir > 0) { p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.9; p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 10)); p.patiS += dt * 16; }
      else {
        p.goz = 'acik'; p.agiz = yakin ? 'acik' : 'gulus'; p.agizB = 0.45;
        p.pati = lerp(p.pati, yakin ? 0.6 : 0.2, 1 - Math.exp(-dt * 5)); p.patiS += dt * 6;
        if (yakin && P.ground && t > 3.7) { p.davetT -= dt; if (p.davetT < 0) { p.davetT = 1.3; pfZipla(p, 2.4); } }
      }
    }
    if (pfFinal) pfBuyukDans(o, p, dt);
  }
  // zıplama (hy)
  if (p.hy < 0 || p.hv < 0) { p.hv += 1700 * dt; p.hy += p.hv * dt; if (p.hy >= 0) { p.hy = 0; p.hv = 0; pfZipla(p, 5); } }
  p.ff = lerp(p.ff, a === 0 ? -0.3 : clamp(df / 300, -1, 1) * 0.45, 1 - Math.exp(-dt * 3));
  pfYay(p, dt);
}
function pfBuyukGuc(o) {   // ağacın yüksekliğine göre: tepe noktası ağaç zemininin en az ~120 birim üstünde olsun
  const ag = typeof TREE !== 'undefined' && TREE ? TREE.y : o.y;
  const gerek = (o.y - 96) - ag + 120;
  return Math.max(PF_BUYUK_GUC, Math.min(1700, Math.sqrt(2 * 2200 * Math.max(0, gerek))));
}
function pfBuyukDans(o, p, dt) {
  o.cisim.aktif = false;
  const hx = (typeof TREE !== 'undefined' && TREE ? TREE.x : o.x) - 270;
  const yolVar = pfYerBul(o.x + PF_BRX + 20, o.y, 8) !== null && Math.abs(P.y - o.y) < 160;
  if (o.x < hx - 4 && yolVar) {   // ağaca doğru kocaman zıplamalarla yaklaş (önünde aynı seviyede zemin varsa)
    if (p.hy === 0 && p.hv === 0) { p.hv = -460; pfZipla(p, 3); }
    if (p.hy < 0) o.x = Math.min(hx, o.x + 260 * dt);
  } else {
    const per = 0.75, k = Math.floor(pfFinal.t / per);
    if (k !== p.dansK && p.hy === 0) { p.dansK = k; p.hv = -340; pfZipla(p, 5); pfPirilti(o.x, o.y - 30, 6, [PF_BUYUK.i, '#ffffff', '#fff3b0'], 160, 0.8, 10, -Math.PI / 2, 2.5); }
  }
  p.goz = Math.floor(pfFinal.t / 0.75) % 3 === 1 ? 'acik' : 'mutlu'; p.agiz = 'acik'; p.agizB = 0.9;
  p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 8)); p.patiS += dt * 10;
  p.yat = lerp(p.yat, 0.25, 1 - Math.exp(-dt * 3));
}

function pfBuyukCiz(o, tm) {
  pfResGuncel();
  const p = o.pf, cz = PF_CZ;
  const nef = p.nef || 0, yat = p.yat || 0;
  cz.x = o.x; cz.y = o.y + p.hy; cz.zemin = o.y; cz.golge = clamp(1 + p.hy / 120, 0.4, 1);
  cz.rot = p.rot || 0;
  const sq = p.sq;
  cz.sx = (1 + sq) * (1 - nef * 0.025) * lerp(1, 1.08, yat);
  cz.sy = (1 - sq) * (1 + nef * 0.05) * lerp(1, 0.53, yat);
  cz.don = 1; cz.seed = 7;
  cz.p0 = PF_BUYUK_UYKU; cz.p1 = PF_BUYUK; cz.bloom = p.bloom;
  cz.w = PF_BRX * 2; cz.sw = PF_BRX * 2; cz.h = PF_BRY * 2; cz.gH = PF_BRY * 2; cz.n = 2; cz.yuzY = 0.52;
  cz.r = PF_BRY * 0.8; cz.gozO = 0.8;
  cz.goz = p.goz; cz.goz2 = p.goz2 || ''; cz.kirp = p.asama >= 2 ? p.kirp : 0; cz.lid = p.lid || 0; cz.bakX = p.bakX; cz.ff = p.ff;
  cz.agiz = p.agiz; cz.agizB = p.agizB;
  cz.yanak = p.asama >= 3 ? 0.55 : 0.32;
  cz.dik = p.dik; cz.kul = p.kul; cz.tut = p.tut + Math.sin(p.t * 0.8) * 0.04;
  cz.sal = p.asama < 2 ? nef : 0;
  cz.ayak = p.asama >= 3 ? 1 : 0; cz.adim = 0;
  cz.pati = p.pati; cz.patiS = p.patiS;
  cz.kabarcik = p.asama < 2 ? (p.kab || 0) : 0;
  cz.parla = 0.18 + nef * 0.06 + p.bloom * 0.14;
  cz.tutamYok = false;
  pfCiz(cz, tm);
}

// ── olaylar ──
OLAY.on('carpti', o => {
  if (!o || !o.pf) return;
  const p = o.pf;
  if (o.tip === 'pofuduk') {
    if (!o.uyandi) { if (p.mir <= 0) { p.mir = 1.2; pfZipla(p, 2.2); pfParca(1, o.x + 12, o.y - 46, 16, -24, 2.2, 8, 0); } }
    else if (o.tur === 'minder' && o.cisim.tip === 'ziplat' && P.vy > -200) {   // yandan gelince de zıplatır (bağışlayıcı)
      P.vy = -PF_MINDER_GUC; P.ground = false; P.dj = true; P.jumpT = 0; P.bounce = true;
      OLAY.emit('ziplatti', o); TUR.al('pofuduk').ustune(o, 0);
    }
  } else if (o.tip === 'buyukPofuduk') {
    if (o.cisim.tip === 'ziplat') {
      if (P.vy > -200 && P.x < o.x) { P.vy = -o.cisim.guc; P.ground = false; P.dj = true; P.jumpT = 0; P.bounce = true; OLAY.emit('ziplatti', o); TUR.al('buyukPofuduk').ustune(o, 0); }
    } else if (p.mir <= 0) { p.mir = 1.4; pfZipla(p, 1.6); pfParca(1, o.x + 40, o.y - 200, 20, -24, 2.6, 14, 0); }
  }
});
OLAY.on('kurtarildi', () => { pfIzBos = true; });
function pfFinalBasla() {
  if (pfFinal) return;
  pfFinal = { t: 0 };
  let i = 0;
  for (const o of NESNELER) {
    if (o.tip === 'buyukPofuduk') { const p = o.pf; if (p.asama < 3) { p.asama = 3; p.aT = 2.6; o.uyandi = true; p.bloom = 1; } continue; }
    if (o.tip !== 'pofuduk') continue;
    const p = o.pf;
    p.dansI = i++;
    if (o.cisim) o.cisim.aktif = false;
    if (o.tur === 'basamak') { p.boy = 0; p.bsx = 1; p.bsy = 1; }
    if (o.tur === 'minder') { p.bsx = 1; p.bsy = 1; }
    if (!o.uyandi) pfUyandir(o, true);
    else p.durum = 'dans';
    // uzaktakiler ekranın kenarından pırıltıyla koşarak gelir
    if (Math.abs(o.x - P.x) > VW * 0.7) {
      const yan = PF_SLOT[p.dansI % PF_SLOT.length] < 0 ? -1 : 1;
      o.x = P.x + yan * (VW * 0.62); p.yt = P.y; o.y = P.y; p.sihir = true;
    }
  }
}
OLAY.on('agac', pfFinalBasla);
OLAY.on('durum', d => { if (d === 'final') pfFinalBasla(); });

// Test için (yalnız inceleme): window.pfTest
window.pfTest = { uyandir: o => pfUyandir(o, false), final: pfFinalBasla, iz: pfIz, kuyruk: pfKuyruk, parca: pfP };

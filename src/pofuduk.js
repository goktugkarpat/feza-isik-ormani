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
const PF_GOZ = '#33234a', PF_AGIZ = '#7a3a68', PF_AGIZIC = '#d4648f', PF_DIL = '#ffb0c8';
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
// Uyanık küçükler (geçit töreni + final dansı) Feza'nın yanında kaybolmasın diye biraz küçülür (yalnız çizim; cisimler aynı).
// Uykudakiler, minder ve basamak oyun sırasında tam boy kalır (bölüm onlara göre).
const PF_OLC = 0.78;
const PF_BAS_W = 60, PF_BAS_H = 106;     // basamak olunca (uzamış hali; tek zıplamayla çıkılır)
const PF_MINDER_GUC = 1100;
const PF_BRX = 100, PF_BRY = 100;        // Büyük Pofuduk (cisim en fazla 200 geniş)
const PF_BUYUK_GUC = 1360;

// ── sprite önbelleği ──
let pfRes = 0, pfResH = -1, pfZMax = 0;
const PF_SPR = new Map();
// Çözünürlük, kameranın o anki yakınlığına göre DEĞİL, bu ekranda olabilecek en yakın görüşe göre seçilir: böylece bölgeler
// arası yumuşak yakınlaştırmalarda önbellek hiç boşaltılmaz (boşaltmak = bütün tüyleri tek karede yeniden çizmek = takılma).
function pfResGuncel() {
  if (H !== pfResH || !pfZMax) {
    pfResH = H; pfZMax = 1;
    if (typeof BOLUM !== 'undefined' && BOLUM.kamera) for (const k of BOLUM.kamera) pfZMax = Math.max(pfZMax, k.zoom || 1);
    pfZMax *= (typeof OM_TABAN_ZOOM === 'number' ? OM_TABAN_ZOOM : 1) * 1.04;
  }
  const r = clamp(Math.round(Math.max(H / VH * pfZMax, S) * 2) / 2, 1, 3);
  if (r !== pfRes) { pfRes = r; PF_SPR.clear(); pfIsitSifirla(); }
}
// ── Önceden ısıtma: gereken bütün sprite'lar oyun başında, karelere yayılarak (kare başına 1–2 tane) hazırlanır.
//    Kuru çizim (pfKayit) gerçek çizim yollarını ekran dışında çalıştırır; pfKurk o sırada çizmez, yalnız kuyruğa yazar.
let pfKayit = false, pfIsitGerek = true;
const pfIsitQ = [], pfIsitSet = new Set();
const PF_BOS = (() => { const c = document.createElement('canvas'); c.width = c.height = 1; c.ww = c.wh = 1; return c; })();
function pfIsitSifirla() { pfIsitQ.length = 0; pfIsitSet.clear(); pfIsitGerek = true; }
function pfIsitKur() {
  pfIsitGerek = false;
  const cz = PF_CZ;
  pfKayit = true;
  g.save(); g.setTransform(1, 0, 0, 1, -1e6, -1e6);
  try {
    for (const o of NESNELER) {
      if (o.tip === 'pofuduk' && o.pf) {
        const vs = [{ bloom: 0.5, pati: 1, durum: 'takip' }, { bloom: 0, durum: 'uyku' }];
        if (o.tur === 'basamak') vs.push({ bloom: 0.5, pati: 1, boy: 1, durum: 'basamak' });
        if (o.tur === 'minder') vs.push({ bloom: 0.5, pati: 1, bsx: 1.24, bsy: 0.72, durum: 'minder' });
        for (const v of vs) { const p = Object.assign({}, o.pf, v); pfKucukCiz2({ x: 0, y: 0, tur: o.tur, pf: p }, p, cz, 0); }
      } else if (o.tip === 'buyukPofuduk' && o.pf) {
        for (const v of [{ bloom: 0.5, pati: 1, yat: 0.6, asama: 3 }, { bloom: 0, asama: 0 }]) pfBuyukCiz({ x: 0, y: 0, pf: Object.assign({}, o.pf, v) }, 0);
      }
    }
  } finally { g.restore(); pfKayit = false; }
  const renk = new Set(['#ffffff', '#fff3b0', '#e8f6ff', '#d8ccff', '#bff4ff', '#cfefff', '#ffe9b8', PF_BUYUK.i]);
  for (const p of PF_RENK) renk.add(p.i).add(p.a);
  for (const c of renk) pfIsitQ.push(() => pfYildiz(c));
  for (const c of ['#ff8fbf', '#ffb3d6', '#ff9cc4', '#ffc0dd']) pfIsitQ.push(() => pfKalp(c));
  for (const c of ['#8fe3c2', '#b9f0a8', '#ffd1e6', '#a9dcff']) pfIsitQ.push(() => pfYaprak(c));
  pfIsitQ.push(pfZ, () => pfYuva(false), () => pfYuva(true));
}
function pfIsitAdim() {   // çizim aşamasında (pfFx) çağrılır
  pfResGuncel();
  if (pfIsitGerek) pfIsitKur();
  if (!pfIsitQ.length) return;
  const t0 = performance.now();
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.004; g.globalCompositeOperation = 'source-over';
  // yeni sprite'ı ana tuvale görünmez bir piksel olarak çiz: tarayıcı onu şimdi (sakin bir karede) hazırlasın
  for (let n = 0; pfIsitQ.length && n < 3 && (n === 0 || performance.now() - t0 < 1.2); n++) { const c = pfIsitQ.shift()(); if (c && c.width) g.drawImage(c, 0, 0, 1, 1); }
  g.restore();
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
  if (pfKayit) { if (!pfIsitSet.has(key)) { pfIsitSet.add(key); pfIsitQ.push(() => pfKurk(pal, w, h, seed, n)); } return PF_BOS; }
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
  const NC = clamp(Math.round(Math.PI * 2 * rm / (r * 0.42)), 10, 30), a0 = R() * 6.283;
  const top = [];
  for (let i = 0; i < NC; i++) {
    const a = a0 + (i + (R() - 0.5) * 0.25) * 6.283 / NC, alt = Math.sin(a) > 0.62;
    const rc = r * (alt ? 0.24 : 0.25 + R() * 0.07), d = rb(a) - rc * (alt ? 1.01 : 0.985);
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
  const tuyRenk = mixc8(pal.a, pal.d, 0.2), fk = clamp(3.2 / rm, 0.012, 0.06);
  for (let i = 6; i >= 1; i--) {
    const k = 1 + fk * i / 6;
    x.save(); x.scale(k, k + (k - 1) * 0.3); x.fillStyle = pfRgba(tuyRenk, 0.09); x.fill(sil); x.restore();
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
    g2.addColorStop(0, pfRgba(pal.d, 0)); g2.addColorStop(0.72, pfRgba(pal.d, q.alt ? 0.07 : 0.15)); g2.addColorStop(1, pfRgba(pal.d, 0));
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
  x.strokeStyle = pfRgba(pal.l, 0.22); x.stroke(yollar[0]);
  x.strokeStyle = pfRgba(pal.l, 0.1); x.stroke(yollar[1]);
  x.strokeStyle = pfRgba(pal.d, 0.14); x.stroke(yollar[2]);
  // alt gölge ve üst kenar ışığı (içeriden)
  gr = x.createLinearGradient(0, ry * 0.2, 0, ry * 1.05);
  gr.addColorStop(0, pfRgba(pal.d, 0)); gr.addColorStop(1, pfRgba(pal.d, 0.45));
  x.fillStyle = gr; x.fillRect(-rx * 1.3, ry * 0.2, w * 1.3, ry);
  gr = x.createLinearGradient(0, -ry * 1.05, 0, ry * 0.1);
  gr.addColorStop(0, pfRgba(pal.l, 0.3)); gr.addColorStop(1, pfRgba(pal.l, 0));
  x.strokeStyle = gr; x.lineWidth = clamp(r * 0.2, 2, 11); x.stroke(sil);
  x.restore();
  // kenarda çok ince, kısa, yumuşak saçak (dışa doğru; sivri değil, yarı saydam)
  const fl = clamp(r * 0.075, 1.2, 4.5), fw = clamp(r * 0.02, 0.45, 1);
  const sac = [new Path2D(), new Path2D()];
  const NF = Math.round(M * 1.3);
  for (let f = 0; f < NF; f++) {
    const jf = R() * M, j0 = Math.floor(jf) % M, j1 = (j0 + 1) % M, ft = jf - Math.floor(jf);
    const ax = lerp(PF_OL[j0 * 2], PF_OL[j1 * 2], ft), ay = lerp(PF_OL[j0 * 2 + 1], PF_OL[j1 * 2 + 1], ft), L = Math.hypot(ax, ay) || 1;
    if (ay / L > 0.7 && R() < 0.7) continue;
    {
      const jt = (R() - 0.5) * 0.9, nx0 = ax / L, ny0 = ay / L, cs = Math.cos(jt), sn = Math.sin(jt);
      const ux = nx0 * cs - ny0 * sn, uy = nx0 * sn + ny0 * cs, Lh = fl * (0.3 + R() * R() * 1.1);
      const bx = ax - nx0 * fl * 0.8, by = ay - ny0 * fl * 0.8, ex = ax + ux * Lh, ey = ay + uy * Lh;
      const k = ay / L < -0.1 && ax < rx * 0.4 ? 0 : 1;
      sac[k].moveTo(bx, by); sac[k].quadraticCurveTo(ax + ux * Lh * 0.3 - uy * Lh * 0.25, ay + uy * Lh * 0.3 + ux * Lh * 0.25, ex, ey);
    }
  }
  x.lineWidth = fw;
  x.strokeStyle = pfRgba(mixc8(pal.a, pal.l, 0.5), 0.36); x.stroke(sac[0]);
  x.strokeStyle = pfRgba(mixc8(pal.a, pal.d, 0.3), 0.3); x.stroke(sac[1]);
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
function pfKalp(col) {
  const key = 'k' + col; let c = PF_SPR.get(key); if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), [r, gg, b] = hex(col);
  const gr = x.createRadialGradient(32, 34, 0, 32, 34, 32);
  gr.addColorStop(0, `rgba(${r},${gg},${b},0.45)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const kalp = () => { x.beginPath(); x.moveTo(32, 46); x.bezierCurveTo(14, 34, 14, 18, 25, 18); x.bezierCurveTo(29, 18, 32, 21, 32, 25); x.bezierCurveTo(32, 21, 35, 18, 39, 18); x.bezierCurveTo(50, 18, 50, 34, 32, 46); x.closePath(); };
  kalp(); x.fillStyle = col; x.fill();
  x.lineWidth = 2.5; x.strokeStyle = 'rgba(255,255,255,0.85)'; x.stroke();
  x.fillStyle = 'rgba(255,255,255,0.9)'; x.beginPath(); x.ellipse(25, 25, 3.2, 2.2, -0.6, 0, 6.283); x.fill();
  PF_SPR.set(key, c); return c;
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
let pfPSon = -1;
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
    else if (q.tip === 4) { q.vx = q.vx * Math.exp(-dt * 2) + Math.cos(q.ph * 5) * 50 * dt; q.vy = lerp(q.vy, -46, 1 - Math.exp(-dt * 3)); }
    else if (q.tip === 5) { q.vx *= Math.exp(-dt * 1.6); q.vy = q.vy * Math.exp(-dt * 1.6) - 14 * dt; q.rot += q.vr * dt; }
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
    } else if (q.tip === 4) {
      const s = q.s * Math.min(1, (q.max - q.life) * 6) * (1 + 0.25 * Math.max(0, 1 - (q.max - q.life) * 4)) * (0.92 + 0.08 * Math.sin(q.ph * 9));
      g.globalAlpha = Math.min(1, a * 2.2);
      g.save(); g.translate(q.x, q.y); g.rotate(Math.sin(q.ph * 4) * 0.2); g.drawImage(pfKalp(q.col), -s * 1.6, -s * 1.6, s * 3.2, s * 3.2); g.restore();
    } else if (q.tip === 5) {   // horlama nefesi: yumuşak bulutçuk + içinde dönen kıvrım ("fıırr" diye uçuşan nefes)
      const u = 1 - a, s = q.s * (0.55 + 0.75 * Math.sqrt(u)), al = Math.min(1, u * 7) * Math.min(1, a * 1.8);
      g.globalAlpha = al * 0.3; g.fillStyle = '#efeaff';
      for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(q.x + (k - 1) * s * 0.42, q.y + (k === 1 ? -s * 0.18 : s * 0.05), s * (k === 1 ? 0.5 : 0.38), 0, 6.283); g.fill(); }
      g.globalAlpha = al * 0.95; g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(1.2, s * 0.11); g.lineCap = 'round';
      g.beginPath();
      for (let k = 0; k <= 16; k++) { const th = q.rot + k * 0.42 * q.col, rr = s * 0.42 * (1 - k / 19); const X = q.x + Math.cos(th) * rr, Y = q.y + Math.sin(th) * rr * 0.8; if (k) g.lineTo(X, Y); else g.moveTo(X, Y); }
      g.stroke();
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
  pfSuzulGuncelle(dt);
  pfParcaGuncelle(dt);
  pfIzGuncelle();
  pfSlotHesapla(dt);
  pfEtkilesim(dt);
  if (pfFinal) { pfFinal.t += dt; pfVurusEsle(pfFinal); }
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
    if (d > 1100) { pfIz.splice(0, i - 1); break; }
  }
  if (pfIz.length > 700) pfIz.splice(0, pfIz.length - 700);
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
  yuzY: 0.5, kabO: 1, patiAgiz: 0, yuzO: 1, yuzSx: 1, yuzSy: 1, kivO: 1, yastik: 0, am: 1, isilti: 0, bakY: 0, r: 23, gozO: 1, goz: 'uyku', goz2: '', lid: 0, kirp: 0, bakX: 0, ff: 0, agiz: 'o', agizB: 0, yanak: 0.3,
  dik: 0, kul: 0, tut: 0, sal: 0, ayak: 0, adim: 0, pati: 0, patiS: 0, salla: 0, kabarcik: 0, parla: 0.2, golge: 1, tutamYok: false, seed: 1, olc: 1 };
const PF_TUTAM = new Float32Array(32);
function pfCiz(cz, tm) {
  const r = cz.r, w = cz.w, Hh = cz.gH;
  const colA = cz.bloom <= 0 ? cz.p0.a : cz.bloom >= 1 ? cz.p1.a : mixc(cz.p0.a, cz.p1.a, cz.bloom);
  const colD = cz.bloom <= 0 ? cz.p0.d : cz.bloom >= 1 ? cz.p1.d : mixc(cz.p0.d, cz.p1.d, cz.bloom);
  const colL = cz.bloom <= 0 ? cz.p0.l : cz.bloom >= 1 ? cz.p1.l : mixc(cz.p0.l, cz.p1.l, cz.bloom);
  // ışıltı ve gölge (dönüşümsüz)
  g.globalCompositeOperation = 'lighter';
  dglow(cz.bloom > 0.5 ? cz.p1.i : cz.p0.i, cz.x, cz.y - Hh * cz.sy * 0.5, Math.max(w, Hh) * 1.15 * cz.olc, cz.parla);
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
  if (cz.yastik > 0.01) {   // yastık hali: köşeli-yuvarlak peluş yastık gövdesi üstüne biner; iki düğme çukuru
    const n0 = cz.n; cz.n = 3.3; cz.am = smooth(Math.min(1, cz.yastik * 1.25));
    pfSprCiz(cz, cz.sw, cz.h, cz.seed + 5, 0, 0, 0, 0, true);
    cz.n = n0; cz.am = 1;
    g.globalAlpha = cz.yastik;
    for (let s = -1; s <= 1; s += 2) {
      const dx = s * w * 0.3, dy = ust + Hh * 0.62;
      g.fillStyle = colL; g.globalAlpha = 0.35 * cz.yastik; g.beginPath(); g.ellipse(dx - s * r * 0.01, dy - r * 0.05, r * 0.07, r * 0.05, 0, 0, 6.283); g.fill();
      g.fillStyle = colD; g.globalAlpha = 0.4 * cz.yastik; g.beginPath(); g.ellipse(dx, dy, r * 0.045, r * 0.035, 0, 0, 6.283); g.fill();
      g.strokeStyle = colD; g.lineWidth = r * 0.018; g.globalAlpha = 0.18 * cz.yastik;
      g.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.5; g.moveTo(dx + Math.cos(a) * r * 0.06, dy + Math.sin(a) * r * 0.05); g.lineTo(dx + Math.cos(a) * r * 0.16, dy + Math.sin(a) * r * 0.12); } g.stroke();
    }
    g.globalAlpha = 1;
  }
  // tepe tutamı: kıvırcık bir perçem (uykuda yana yatık ve gevşek, uyanınca dimdik ve kıvrık); tut = yay salınımı
  if (!cz.tutamYok) pfKivrim(cz, r, ust + Hh * 0.07, colA, colL, colD);
  // yüz
  g.save();
  g.translate(ff * r * 0.16, ust + Hh * cz.yuzY);
  g.scale(r * cz.yuzO * cz.yuzSx, r * cz.yuzO * cz.yuzSy);
  pfYuz(cz, tm);
  g.restore();
  // patiler
  if (cz.pati > 0.02 || cz.salla > 0.02) {
    g.fillStyle = colA; g.strokeStyle = colD; g.lineWidth = r * 0.04;
    for (let s = -1; s <= 1; s += 2) {
      const yuk = cz.pati, sal = Math.sin(cz.patiS + (s > 0 ? 1.4 : 0)) * 0.35 * yuk;
      let px = s * (w * 0.44 + r * 0.04 * yuk), py = ust + Hh * lerp(0.66, 0.3, yuk) + sal * r * 0.3, rt = s * (0.5 + yuk * 0.6 + sal), bk = 1;
      if (s > 0 && cz.salla > 0.001) {   // el sallama: öndeki pati yukarıda, bilekten tatlı tatlı sallanır
        const k = cz.salla, sw = Math.sin(tm * 13) * 0.45;
        px = lerp(px, w * 0.46, k); py = lerp(py, ust + Hh * 0.1, k); rt = lerp(rt, 0.35 + sw, k);
      } else if (cz.pati <= 0.02) continue;
      if (s > 0 && cz.patiAgiz > 0.001) {   // ağzın önüne gelen pati (esnerken pıt pıt)
        const k = cz.patiAgiz, pat = Math.sin(tm * 13) * 0.06 * k;
        const ax = ff * r * 0.16 + 0.2 * r * cz.yuzO, ay = ust + Hh * cz.yuzY + (0.5 + pat) * r * cz.yuzO * cz.yuzSy;
        px = lerp(px, ax, k); py = lerp(py, ay, k); rt = lerp(rt, -1.05, k); bk = lerp(1, 1.3, k);
      }
      g.save(); g.translate(px, py); g.rotate(rt);
      const pw = r * 0.36 * bk, ph = r * 0.44 * bk;   // sprite hep aynı boyda (yeni sprite yok), büyüme yalnız ölçekle
      pfSprCiz(cz, r * 0.36, r * 0.44, cz.seed + 31, -pw / 2, -ph * 0.75, pw, ph); g.restore();
    }
  }
  g.restore();
  cz.olc = 1;
}
// Sprite'ı uyku/uyanık renkleri arasında geçişle çiz. govde=true → gövde sprite'ı (yerleşimi kendisi hesaplar)
function pfSprCiz(cz, w, h, seed, dx, dy, dw, dh, govde) {
  const n = govde ? cz.n : 2;
  for (let k = 0; k < 2; k++) {
    const a = (k === 0 ? (cz.bloom >= 1 ? 0 : 1) : cz.bloom) * (govde ? cz.am : 1);
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
// Kıvırcık perçem: kökten yukarı kısa bir sap, sonra sağa doğru kıvrılıp içe dolanan, uca doğru incelen bir bukle.
const PF_KIV = new Float32Array(2 * 2 * 30);
function pfKivrim(cz, r, by, colA, colL, colD) {
  const d = cz.dik, N = 26, NS = 5, ko = cz.kivO;
  const Ls = r * ko * lerp(0.2, 0.3, d), Rc = r * ko * lerp(0.2, 0.23, d), tur = lerp(1.45, 1.75, d) * Math.PI;
  const fi = cz.tut + lerp(0.95, 0.08, d) + cz.sal * 0.08 * (1 - d);
  const ca = Math.cos(fi), sa = Math.sin(fi), wb = r * ko * 0.15, we = r * ko * 0.045;
  // merkez çizgisi (yerel; kök 0,0) → dönmüş, sonra iki yan
  let ox = 0, oy = 0;
  for (let i = 0; i <= N; i++) {
    let px, py;
    if (i < NS) { px = 0; py = -Ls * i / NS; }
    else { const u = (i - NS) / (N - NS), th = Math.PI + u * tur, R0 = Rc * (1 - 0.62 * u); px = Rc + Math.cos(th) * R0; py = -Ls + Math.sin(th) * R0; }
    const wx = px * ca - py * sa, wy = px * sa + py * ca;
    PF_KIV[i * 4] = wx; PF_KIV[i * 4 + 1] = wy;
    ox = wx; oy = wy;
  }
  // yanlar
  g.beginPath();
  for (let pass = 0; pass < 2; pass++) {
    for (let k = 0; k <= N; k++) {
      const i = pass === 0 ? k : N - k;
      const i0 = Math.max(0, i - 1), i1 = Math.min(N, i + 1);
      const tx = PF_KIV[i1 * 4] - PF_KIV[i0 * 4], ty = PF_KIV[i1 * 4 + 1] - PF_KIV[i0 * 4 + 1], tl = Math.hypot(tx, ty) || 1;
      const t = i / N, wd = lerp(wb, we, Math.pow(t, 0.8)) * (pass === 0 ? 1 : -1);
      const X = PF_KIV[i * 4] - ty / tl * wd, Y = by + PF_KIV[i * 4 + 1] + tx / tl * wd;
      if (k === 0 && pass === 0) g.moveTo(X, Y); else g.lineTo(X, Y);
      if (pass === 0 && k === N) g.arc(ox, by + oy, we, Math.atan2(ty, tx) - Math.PI / 2, Math.atan2(ty, tx) + Math.PI / 2);
    }
  }
  g.closePath();
  g.fillStyle = colA; g.fill();
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.globalAlpha = 0.35; g.strokeStyle = colD; g.lineWidth = r * ko * 0.022; g.stroke();
  // parlak sırt çizgisi (dış kenara yakın)
  g.globalAlpha = 0.7; g.strokeStyle = colL; g.lineWidth = r * ko * 0.04;
  g.beginPath();
  for (let i = 1; i <= N - 4; i++) {
    const i0 = i - 1, i1 = i + 1;
    const tx = PF_KIV[i1 * 4] - PF_KIV[i0 * 4], ty = PF_KIV[i1 * 4 + 1] - PF_KIV[i0 * 4 + 1], tl = Math.hypot(tx, ty) || 1;
    const wd = lerp(wb, we, Math.pow(i / N, 0.8)) * 0.45;
    const X = PF_KIV[i * 4] - ty / tl * wd, Y = by + PF_KIV[i * 4 + 1] + tx / tl * wd;
    if (i === 1) g.moveTo(X, Y); else g.lineTo(X, Y);
  }
  g.stroke(); g.globalAlpha = 1;
  // kökü örten küçük tüy topağı
  const pr = r * 0.4 * Math.sqrt(ko);
  pfSprCiz(cz, pr, pr * 0.8, cz.seed + 23, -pr / 2, by - pr * 0.25, pr, pr * 0.8);
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
    case 'esne': {   // yumuşak pembe küçük oval (koyu renk, diş yok)
      const rx = 0.07 + 0.07 * b, ry = 0.05 + 0.13 * b, cy = my + 0.02 + ry * 0.5;
      g.fillStyle = '#ef9cc0'; g.beginPath(); g.ellipse(mx, cy, rx, ry, 0, 0, 6.283); g.fill();
      g.fillStyle = '#ffc6dc'; g.beginPath(); g.ellipse(mx, cy + ry * 0.45, rx * 0.62, ry * 0.42, 0, 0, 6.283); g.fill();
      g.strokeStyle = '#b8709f'; g.lineWidth = 0.03; g.beginPath(); g.ellipse(mx, cy, rx, ry, 0, 0, 6.283); g.stroke();
      break;
    }
  }
  // horlama baloncuğu
  if (cz.kabarcik > 0.02) {
    const br = (0.05 + 0.24 * cz.kabarcik) * cz.kabO, bx = mx + 0.13 + br * 0.85, by = my + 0.07 - br * 0.15;
    g.fillStyle = 'rgba(200,235,255,0.22)'; g.beginPath(); g.arc(bx, by, br, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(235,248,255,0.75)'; g.lineWidth = 0.025; g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(bx - br * 0.4, by - br * 0.4, br * 0.22, br * 0.13, -0.7, 0, 6.283); g.fill();
  }
}
function pfGoz(tip, ex, ey, go, cz, s) {
  g.strokeStyle = PF_GOZ; g.fillStyle = PF_GOZ; g.lineWidth = 0.065 * go;
  if (tip === 'uyku') {   // kapalı, aşağı kıvrık (huzurlu, mışıl mışıl): kalın yumuşak hilal + iki minik kirpik
    g.lineWidth = 0.07 * go;
    g.beginPath(); g.arc(ex, ey - 0.06 * go, 0.13 * go, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
    g.lineWidth = 0.034 * go;
    g.beginPath();
    g.moveTo(ex + s * 0.12 * go, ey + 0.0); g.lineTo(ex + s * 0.18 * go, ey + 0.03 * go);
    g.moveTo(ex + s * 0.07 * go, ey + 0.05 * go); g.lineTo(ex + s * 0.1 * go, ey + 0.1 * go);
    g.stroke();
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
  const bx = cz.bakX * 0.03 * go; ey += cz.bakY * 0.035 * go;
  g.beginPath(); g.ellipse(ex + bx, ey, rx, ry, 0, 0, 6.283); g.fill();
  g.fillStyle = '#5b3f86'; g.beginPath(); g.ellipse(ex + bx, ey + ry * 0.45, rx * 0.72, ry * 0.4, 0, 0, Math.PI); g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath(); g.ellipse(ex + bx - rx * 0.32, ey - ry * 0.38, rx * 0.42, ry * 0.36 * (ry > 0.05 ? 1 : 0.5), -0.3, 0, 6.283); g.fill();
  g.beginPath(); g.arc(ex + bx + rx * 0.38, ey + ry * 0.36, rx * 0.17, 0, 6.283); g.fill();
  if (cz.isilti > 0.05 && ry > 0.06) {   // gözde minik yıldız pırıltısı (sevinç)
    const sx = ex + bx + rx * 0.3, sy = ey - ry * 0.42, k = rx * 0.42 * cz.isilti;
    g.globalAlpha = 0.95; g.beginPath(); g.moveTo(sx, sy - k); g.quadraticCurveTo(sx, sy, sx + k, sy); g.quadraticCurveTo(sx, sy, sx, sy + k);
    g.quadraticCurveTo(sx, sy, sx - k, sy); g.quadraticCurveTo(sx, sy, sx, sy - k); g.fill(); g.globalAlpha = 1;
  }
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

// Her yol arkadaşının minik bir huyu var (yalnız ara sıra, Feza dururken görünür; sakin kalsın):
// zipzip: daha hoplayıcı · selam: Pırıl'a el sallar · utangac: Feza'nın arkasına saklanıp bakar · pirilti: uçuşan ışığı kovalar
const PF_HUYLAR = ['zipzip', 'selam', 'utangac', 'pirilti'];
let pfHuySira = 0;
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
      sessiz: false, x0: o.x, y0: o.y, hopT: 2 + Math.random() * 3, dansI: 0, yer: true,
      huy: o.tur === 'yol' ? PF_HUYLAR[pfHuySira++ % PF_HUYLAR.length] : null, wyK: 1, olc: 1 };
    if (o.pf.huy === 'zipzip') o.pf.wyK = 1.35;
  },
  ustune(o, vy) {
    const p = o.pf;
    if (!o.uyandi) { pfUyandir(o, false); return; }
    if (o.tur === 'minder' && o.cisim.tip === 'ziplat') {   // her zıplayışta kocaman ezilme + kıkırdama
      pfZipla(p, 7.5); p.kikir = 0.9; p.kikirN = 0;
      pfPirilti(o.x, o.y - 26, 7, [p.pal.i, '#ffffff', p.pal.a], 150, 0.8, 9, -Math.PI / 2, 2.4);
      for (let i = 0; i < 2; i++) pfParca(4, o.x + (i ? 18 : -18), o.y - 30, (i ? 40 : -40), -60, 1.4 + i * 0.2, 6 + i, i ? '#ff8fbf' : '#ffb3d6');
      if (typeof AU !== 'undefined') AU.sfx('boing', 1);
    } else if (o.tur === 'basamak') { pfZipla(p, 2.5); }
  },
  guncelle(o, dt) {
    pfKareBasi(dt);
    const p = o.pf; p.t += dt;
    if (p.durum === 'uyku') pfUykuGuncelle(o, p, dt);
    else pfUyanikGuncelle(o, p, dt);
    if (p.durum !== 'uyaniyor') p.olc = lerp(p.olc, pfOlcHedef(o, p), 1 - Math.exp(-dt * 4));
    pfYay(p, dt);
  },
  ciz(o, tm) {
    if (pfFinal) { if (o.tur === 'minder') { pfYuvaCiz(o, false); pfYuvaCiz(o, true); } return; }   // finalde dansçılar pfFx'te çizilir
    pfKucukCiz(o, tm);
  },
});

function pfOlcHedef(o, p) { return o.uyandi && (p.durum === 'takip' || p.durum === 'dans' || pfFinal) ? PF_OLC : 1; }
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
  if (p.nefesT > per) { p.nefesT -= per; p.nefesN++; if (p.nefesN % 3 === 0 && p.kab > 0.5) { pfPirilti(o.x + 11, o.y - 18, 4, ['#e8f6ff', '#ffffff'], 60, 0.5, 6); pfParca(5, o.x + 17, o.y - 19, 46, -12, 1.4, 12, -1); } }
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
    if (o.tur === 'yol' || p.sessiz) { const k = clamp((t - 0.92) / 0.6, 0, 1); p.olc = lerp(1, PF_OLC, smooth(k)) + 0.07 * Math.sin(Math.PI * clamp(k * 1.7, 0, 1)) * (1 - k); }
    if (t < 1.05) { p.goz = 'sik'; p.agiz = 'hapsu'; }
    else { p.goz = t < 1.5 ? 'mutlu' : 'acik'; p.agiz = 'acik'; p.agizB = 0.6; p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 10)); p.patiS += dt * 14; }
    if (t > 1.1 && !p.sevinc && o.tur !== 'basamak') { p.sevinc = true; p.jv = -260; }
  }
  // basamak: Feza'nın altında uzar (onu yukarı taşır)
  if (o.tur === 'basamak' && !p.sessiz) pfBasamakBoy(o, p, smooth(clamp((t - 0.12) / 0.7, 0, 1)));
  if (o.tur === 'minder') { const k = smooth(clamp((t - 0.2) / 0.5, 0, 1)); p.bsx = lerp(1, 1.24, k); p.bsy = lerp(1, 0.72, k); }
  pfHop(o, p, dt);
  if (t > 1.75) {
    p.durum = p.sessiz ? 'dans' : o.tur === 'yol' ? 'takip' : o.tur; p.bloom = 1;
    if (p.durum === 'takip') { p.sira = pfKuyruk.length; pfKuyruk.push(o); }
  }
}
function pfHop(o, p, dt) {   // balistik zıplama (jy: zeminden yukarı, eksi)
  if (p.jy !== 0 || p.jv < 0) {
    p.jv += 1500 * dt; p.jy += p.jv * dt;
    if (p.jy >= 0 && p.jv > 0) { p.jy = 0; p.jv = 0; pfZipla(p, 2.8); }
  }
}
function pfBasamakBoy(o, p, k) {
  const eskiH = o.cisim.h, yeniH = lerp(42, PF_BAS_H, k);
  p.boy = k; o.cisim.h = yeniH; o.cisim.w = lerp(52, PF_BAS_W - 4, k); o.cisim.dy = -(yeniH - eskiH);
}

// Geçit töreni: Feza'nın izini takip et; o durunca etrafında oyalan (ara ara birbirine tosla, Pırıl'a bak);
// çok uzun beklerse yanında kıvrılıp kestir (o kıpırdayınca uyanır); boşlukları / yükseklikleri pırıltılı bir yayla süzülerek geç
const PF_UYU_SN = 11;   // Feza bu kadar sn hiç kıpırdamazsa kuyruk yanında uyuklar
let pfEtkT = 3;          // bir sonraki küçük etkileşime kalan süre
function pfTakip(o, p, dt) {
  const i = p.sira;
  if (p.gerin) { pfGerin(o, p, dt); return; }
  let tx, ty, yer = true, bos = false;
  const bekle = P.idle > 0.8 && P.ground && P.fade <= 0;
  const slot = pfSlotBul(i);
  if (slot) { tx = slot.x; ty = slot.y; }
  else if (p.sihir) { tx = p.aex; ty = p.aey; }
  else {   // uygun yer yok: olduğu yerde bekler — ama yalnız yerdeyse; değilse en yakın zemine (ya da Feza'nın yanına) süzülür
    tx = o.x; ty = p.yt;
    if (pfYerBul(o.x, p.yt, 8) === null && !pfUstteCisim(o.x, p.yt)) {
      const yy = pfZeminAlti(o.x, p.yt);
      if (yy !== null && yy - p.yt < 400) ty = yy;
      else { tx = P.x - P.f * 70; const y2 = pfYerBul(tx, P.y, 40); if (y2 !== null) ty = y2; else { tx = P.x; ty = P.y; } }
    }
  }
  if (!p.sihir && Math.abs(tx - o.x) > 24 && Math.abs(tx - o.x) < 140) bos = pfAradaBosluk(o.x, p.yt, tx, ty);
  if (!bekle || p.sihir) pfHuyBitir(o, p);
  if (p.saklan) {   // utangaç: Feza'nın hemen arkasına
    const sx = P.x - P.f * 17, yy = pfYerBul(sx, P.y, 30);
    if (yy !== null) { tx = sx; ty = yy; }
  } else if (p.kovala && !p.kovala.yak) {   // ışığın altına doğru (zemin varsa)
    const yy = pfYerBul(p.kovala.x, p.yt, 12);
    if (yy !== null) { tx = lerp(o.x, p.kovala.x, 0.9); ty = yy; }
  }
  pfGit(o, p, dt, tx, ty, yer, bos);
  pfAyir(o, p, dt);
  const yerinde = !p.sihir && p.jy === 0 && Math.abs(o.x - tx) < 5;
  // uyuklama: Feza çok uzun durursa yanında kıvrılıp uyur; kıpırdayınca gerinip uyanır
  const uyu = bekle && P.idle > PF_UYU_SN + i * 0.7 && yerinde && DURUM === 'oyun';
  p.uyuk = clamp((p.uyuk || 0) + (uyu ? dt * 0.8 : -dt * 7), 0, 1);
  if (p.sihir) p.uyuk = 0;
  if (p.uyuk > 0.6) p.uyudu = true;
  else if (p.uyudu && !uyu) {   // uyandı: önce tatlı bir gerinme + esneme, sonra zıplayıp peşine düşer (pfGerin)
    p.uyudu = false; p.gerin = { t: -Math.random() * 0.3 - i * 0.06 }; pfGerin(o, p, dt); return;
  }
  p.uyanT = Math.max(0, (p.uyanT || 0) - dt);
  const df = P.x - o.x;
  if (p.uyuk > 0.02) {
    const k = smooth(p.uyuk), nf = 0.5 + 0.5 * Math.sin(p.t * 1.9);
    p.goz = k > 0.45 ? 'uyku' : 'yarim'; p.lid = 0.3 + k * 1.2;
    p.agiz = 'o'; p.agizB = 0.2 + nf * 0.3 * k;
    p.sqH = 0.11 * k + nf * 0.025 * k; p.dikH = lerp(1, 0.12, k); p.ayak = lerp(p.ayak, 1 - k, 1 - Math.exp(-dt * 5));
    p.nefU = nf * k;
    p.f = df < 0 ? -1 : 1; pfDonGuncelle(p, dt);
    p.bakX = 0; p.bakY = 0;
    if (k > 0.8) { p.zT -= dt; if (p.zT <= 0) { p.zT = 2.4 + Math.random() * 1.6 + i * 0.4; pfParca(1, o.x + p.f * 10, o.y - 34, 14 * p.f, -18, 2.6, 6 + Math.random() * 2, 0); } }
    p.dik = lerp(p.dik, p.dikH, 1 - Math.exp(-dt * 4));
    pfHop(o, p, dt);
    return;
  }
  p.sqH = 0; p.nefU = 0;
  p.dik = lerp(p.dik, 1, 1 - Math.exp(-dt * 6));
  p.pati = lerp(p.pati, 0, 1 - Math.exp(-dt * 7));
  // bakış: genelde Feza'ya; ara ara Pırıl'a (yukarı)
  p.bakT = Math.max(0, (p.bakT || 0) - dt);
  if (p.bakT > 0) { p.bakX = clamp((D.x - o.x) / 90, -1, 1); p.bakY = clamp((D.y - (o.y - 30)) / 90, -1, 0.6); }
  else { p.bakX = clamp(df / 120, -1, 1); p.bakY = lerp(p.bakY || 0, 0, 1 - Math.exp(-dt * 6)); }
  if (p.uyanT > 0) { p.goz = p.uyanT > 0.3 ? 'sik' : 'acik'; p.agiz = 'o'; p.agizB = 0.5; }
  else if (p.sihir) { p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.5; }
  else if (p.kikir > 0) { p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.7; }
  else if (p.bakT > 0) { p.goz = 'acik'; p.agiz = 'o'; p.agizB = 0.45; }
  else { p.goz = 'acik'; p.agiz = Math.abs(o.x - tx) > 4 ? 'acik' : 'gulus'; p.agizB = 0.25; }
  // tosladığı arkadaşına doğru minik atılma (çizim kayması)
  if (p.tos) {
    p.tos.t += dt;
    const u = p.tos.t / 0.5;
    p.ox = p.tos.yon * 16 * Math.sin(Math.PI * Math.min(1, u));
    if (!p.tos.temas && u > 0.42) {
      p.tos.temas = true; const q = p.tos.q.pf;
      pfZipla(q, 6); q.kikir = 0.7; q.jv = -150; pfZipla(p, 5); p.kikir = 0.7;
      const mx = (o.x + p.tos.q.x) / 2;
      pfPirilti(mx, o.y - 22, 5, ['#ffffff', p.pal.i, q.pal.i], 90, 0.6, 7, -Math.PI / 2, 2.4);
      pfParca(4, mx, o.y - 40, 0, -40, 1.3, 7, '#ff9cc4');
      if (typeof AU !== 'undefined') AU.sfx('boing', 0.35);
    }
    if (u >= 1) { p.tos = null; p.ox = 0; }
  } else p.ox = lerp(p.ox || 0, 0, 1 - Math.exp(-dt * 10));
  p.kizar = lerp(p.kizar || 0, p.saklan ? 1 : 0, 1 - Math.exp(-dt * 4));
  p.salla = lerp(p.salla || 0, p.selamT > 0.35 ? 1 : 0, 1 - Math.exp(-dt * 9));
  if (p.zipK > 0 && p.jy === 0 && p.jv === 0) { p.zipK--; p.jv = -250; pfZipla(p, 3); p.kikir = 0.5; }
  if (pfHuyGuncelle(o, p, dt, df)) { pfDonGuncelle(p, dt); pfHop(o, p, dt); return; }
  if (bekle && !p.sihir && p.jy === 0 && Math.abs(o.x - tx) < 4) {   // oyalanma: ara ara yerinde sevinç zıplaması
    if (!p.tos && p.bakT <= 0) p.f = df < 0 ? -1 : 1;
    p.hopT -= dt;
    if (p.hopT < 0) { p.hopT = 2.4 + Math.random() * 3.5; if (!p.tos) { p.jv = -200 - Math.random() * 80; p.kikir = 0.4; if (Math.random() < 0.35) p.donH = 1; } }
  }
  pfDonGuncelle(p, dt);
  pfHop(o, p, dt);
}
// Kestirmeden uyanış (≈1 sn, yerinde): patiler havaya, uzun bir gerinme, minik bir esneme (pati ağza pıt), göz kırpıp zıplama
function pfGerin(o, p, dt) {
  const G = p.gerin; G.t += dt;
  const t = Math.max(0, G.t);
  p.uyuk = 0; p.nefU = 0; p.bakX = 0; p.bakY = -0.4; p.ff = lerp(p.ff, 0, 1 - Math.exp(-dt * 8));
  const ger = smooth(clamp(t / 0.35, 0, 1)) * (1 - smooth(clamp((t - 0.72) / 0.18, 0, 1)));
  p.sqH = -0.15 * ger; p.dik = lerp(p.dik, lerp(0.3, 1, smooth(clamp(t / 0.3, 0, 1))), 1 - Math.exp(-dt * 10));
  p.pati = lerp(p.pati, ger, 1 - Math.exp(-dt * 14)); p.patiS = 0.87 + Math.sin(t * 5) * 0.25;
  p.rot = Math.sin(t * 7) * 0.05 * ger;
  p.ayak = lerp(p.ayak, 1, 1 - Math.exp(-dt * 6));
  if (G.t < 0) { p.goz = 'uyku'; p.agiz = 'o'; p.agizB = 0.2; }
  else if (t < 0.74) {
    p.goz = 'sik'; p.agiz = 'esne'; p.agizB = smooth(clamp((t - 0.08) / 0.3, 0, 1)) * 0.9;
    p.patiAgiz = smooth(clamp((t - 0.42) / 0.14, 0, 1)) * (1 - smooth(clamp((t - 0.64) / 0.1, 0, 1)));
    if (!G.z && t > 0.15) { G.z = true; pfParca(1, o.x + 8, o.y - 44, 16, -26, 1.6, 6, 0); }   // son "z" uçup gider
  } else {
    p.patiAgiz = 0; p.goz = t < 0.84 ? 'yarim' : 'acik'; p.lid = lerp(0.5, 0, clamp((t - 0.74) / 0.1, 0, 1)); p.agiz = 'gulus'; p.agizB = 0.3;
  }
  if (t > 0.92 && !G.hop) {
    G.hop = true; p.jv = -230; pfZipla(p, 5); p.kikir = 0.5;
    pfPirilti(o.x, o.y - 30, 4, [p.pal.i, '#ffffff'], 80, 0.6, 7, -Math.PI / 2, 2);
  }
  pfHop(o, p, dt); o.y = p.yt;
  if (t > 1.1 && p.jy === 0) { p.gerin = null; p.patiAgiz = 0; p.rot = 0; p.sqH = 0; }
}
// Kuyruk beklerken küçük etkileşimler (her karede bir kez çağrılır)
function pfEtkilesim(dt) {
  if (pfKuyruk.length === 0 || pfFinal || !(P.idle > 1.6 && P.ground) || P.idle > PF_UYU_SN - 1) { pfEtkT = Math.max(pfEtkT, 1.5); return; }
  pfEtkT -= dt;
  if (pfEtkT > 0) return;
  pfEtkT = 2.6 + Math.random() * 3.2;
  const hazir = pfKuyruk.filter(q => !q.pf.sihir && q.pf.jy === 0 && !q.pf.tos && !q.pf.gerin && !pfHuyVar(q.pf) && (q.pf.uyuk || 0) < 0.01);
  if (!hazir.length) return;
  const a = hazir[Math.floor(Math.random() * hazir.length)];
  if (a.pf.huy && Math.random() < 0.5 && now - (a.pf.huyT || -99) > 10) { a.pf.huyT = now; pfHuyBasla(a); pfEtkT += 1.5; return; }
  if (Math.random() < 0.55) {   // en yakın arkadaşına tatlı bir tos
    let b = null, bd = 1e9;
    for (const q of hazir) { if (q === a) continue; const d = Math.abs(q.x - a.x); if (d < bd && d < 80 && Math.abs(q.y - a.y) < 10) { bd = d; b = q; } }
    if (b) { a.pf.tos = { q: b, t: 0, yon: Math.sign(b.x - a.x) || 1, temas: false }; a.pf.f = a.pf.tos.yon; a.pf.jv = -110; return; }
  }
  // Pırıl'a bak: biri (bazen ikisi) başını kaldırıp ona bakar, mutlu bir zıplama
  a.pf.bakT = 1.8; a.pf.kikir = 0; a.pf.f = D.x < a.x ? -1 : 1;
  if (Math.random() < 0.5) a.pf.jv = -170;
  if (hazir.length > 1 && Math.random() < 0.5) { const b = hazir[(hazir.indexOf(a) + 1) % hazir.length]; b.pf.bakT = 1.5; b.pf.f = D.x < b.x ? -1 : 1; }
}
// ── huylar ──
function pfHuyVar(p) { return !!(p.saklan || p.kovala || p.selamT > 0 || p.zipK > 0); }
function pfHuyBasla(o) {
  const p = o.pf;
  if (p.huy === 'zipzip') {   // iki kocaman sevinç zıplaması, ilkinde havada bir tur
    p.jv = -340; p.donH = 1; p.zipK = 1; p.kikir = 0.9; pfZipla(p, 4);
    pfPirilti(o.x, o.y - 8, 5, [p.pal.i, '#ffffff', '#fff3b0'], 100, 0.6, 7, -Math.PI / 2, 2.4);
    if (typeof AU !== 'undefined') AU.sfx('boing', 0.3);
  } else if (p.huy === 'selam') {   // Pırıl'a bakıp el sallar
    p.selamT = 2.4; p.bakT = 2.4; p.f = D.x < o.x ? -1 : 1; p.kikir = 0;
  } else if (p.huy === 'utangac') {
    p.saklan = { t: 0 };
  } else if (p.huy === 'pirilti') {   // yanında minik bir ışık belirir; zıplaya zıplaya peşine düşer, yakalayınca pırıl pırıl
    const dis = o.x < P.x ? -1 : 1;   // önce dış yana (Feza'nın ve arkadaşlarının içinden geçmesin)
    for (const d of [dis, -dis]) {
      const x = o.x + d * 70;
      if (pfKuyruk.some(q => q !== o && Math.abs(q.y - o.y) < 40 && (q.x - o.x) * d > 0 && Math.abs(q.x - o.x) < 110)) continue;   // o yanda arkadaşı var
      if (pfYerBul(x, o.y, 10) !== null && pfYerBul(o.x + d * 30, o.y, 10) !== null) { p.kovala = { t: 0, x0: x, x, y: o.y - 66, y0: o.y - 66, d }; break; }
    }
  }
}
function pfHuyBitir(o, p) {
  if (p.kovala) { if (!p.kovala.yak) pfPirilti(p.kovala.x, p.kovala.y, 4, [p.pal.i, '#ffffff'], 50, 0.5, 6); p.kovala = null; }
  if (p.saklan) p.saklan = null;
  p.selamT = 0;
}
// huy o karede yüzü/hareketi yönetiyorsa true
function pfHuyGuncelle(o, p, dt, df) {
  if (p.selamT > 0) {
    p.selamT -= dt;
    p.f = D.x < o.x ? -1 : 1;
    p.goz = p.selamT < 2.1 ? 'mutlu' : 'acik'; p.agiz = 'acik'; p.agizB = 0.55;
    if (!p.selamKalp && p.selamT < 1.3) { p.selamKalp = true; pfParca(4, o.x + p.f * 22, o.y - 52, p.f * 45, -70, 1.5, 6, '#ff9cc4'); }
    if (p.selamT <= 0) { p.selamT = 0; p.selamKalp = false; }
    return false;
  }
  if (p.saklan) {
    const S2 = p.saklan; S2.t += dt;
    const yerde = Math.abs(o.x - (P.x - P.f * 17)) < 8;
    p.f = P.f; p.bakX = P.f * 0.4;
    if (yerde) {
      const u = (S2.t % 1.5) / 1.5, bak = smooth(clamp((u - 0.45) / 0.15, 0, 1)) * (1 - smooth(clamp((u - 0.8) / 0.15, 0, 1)));
      p.ox = -P.f * 15 * bak; p.sqH = 0.07 * (1 - bak); p.bakX = -P.f * bak;
      p.goz = bak > 0.3 ? 'acik' : 'mutlu'; p.agiz = bak > 0.3 ? 'o' : 'gulus'; p.agizB = 0.3;
    } else { p.goz = 'acik'; p.agiz = 'gulus'; p.agizB = 0.3; }
    if (S2.t > 4.6) { p.saklan = null; p.sqH = 0; p.jv = -200; p.kikir = 0.7; pfZipla(p, 4); pfParca(4, o.x, o.y - 44, 0, -50, 1.3, 6, '#ffb3d6'); }
    return true;
  }
  if (p.kovala) {
    const K = p.kovala; K.t += dt;
    if (!K.yak) {
      K.x = K.x0 + Math.sin(K.t * 1.7) * 26 * K.d; K.y = K.y0 + Math.sin(K.t * 3.1) * 9 - Math.min(1, K.t) * 6;
      const dx = K.x - o.x;
      p.f = dx < 0 ? -1 : 1; p.bakX = clamp(dx / 40, -1, 1); p.bakY = -0.9;
      p.goz = 'acik'; p.agiz = 'o'; p.agizB = 0.5;
      if (Math.abs(dx) < 34 && p.jy === 0 && p.jv === 0) {
        if (K.t > 2.3) { K.yak = 0.001; p.jv = -300; pfZipla(p, 4); }
        else if (K.t > 0.8) { p.jv = -150; pfZipla(p, 2); }
      }
    } else {
      K.yak += dt;
      if (K.yak > 0.18 && !K.pat) {
        K.pat = true; p.kikir = 1;
        pfPirilti(K.x, K.y, 10, [p.pal.i, '#ffffff', '#fff3b0'], 130, 0.7, 8);
        pfParca(4, K.x, K.y - 6, 0, -60, 1.4, 7, '#ffb3d6');
        if (typeof AU !== 'undefined') AU.sfx('parilti', 0.5);
      }
      p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.7;
      if (K.yak > 0.6 && p.jy === 0) p.kovala = null;
    }
    return true;
  }
  return false;
}
function pfKovalaCiz(p, tm) {   // kovalanan ışık: yumuşak ışıltı + minik yıldız
  const K = p.kovala; if (!K || K.pat) return;
  const a = Math.min(1, K.t * 3), tw = 0.8 + 0.2 * Math.sin(tm * 14);
  g.globalCompositeOperation = 'lighter';
  dglow(p.pal.i, K.x, K.y, 18, 0.45 * a); dglow('#ffffff', K.x, K.y, 5, 0.9 * a);
  const s = 7 * a * tw; g.globalAlpha = a; g.save(); g.translate(K.x, K.y); g.rotate(tm * 1.5); g.drawImage(pfYildiz('#fff3b0'), -s, -s, s * 2, s * 2); g.restore();
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function pfUstteCisim(x, y) {   // (x, y) bir platform cismin (nilüfer, minder…) üstünde mi
  if (typeof CISIMLER === 'undefined') return false;
  for (const c of CISIMLER) { const k = c.cisim; if (k.aktif && Math.abs(c.x - x) < k.w / 2 + 6 && Math.abs(c.y - k.h - y) < 10) return true; }
  return false;
}
function pfAradaBosluk(x0, y0, x1, y1) {   // yürüyerek gidilecek düz yolda zemin yoksa (çukur) true → yayla süzülür
  const n = Math.ceil(Math.abs(x1 - x0) / 20);
  for (let k = 1; k < n; k++) { const u = k / n; if (pfYerBul(lerp(x0, x1, u), lerp(y0, y1, u), 44) === null) return true; }
  return false;
}
function pfAyir(o, p, dt) {   // kuyruktakiler üst üste binmesin: yakındakini yumuşakça it
  if (p.sihir || p.saklan) return;
  for (const q of pfKuyruk) {
    if (q === o || q.pf.sihir || q.pf.saklan || Math.abs(o.y - q.y) > 40) continue;
    const d = o.x - q.x, ad = Math.abs(d);
    if (ad < 41) {
      const nx = o.x + (ad < 0.5 ? (p.sira > q.pf.sira ? -1 : 1) : Math.sign(d)) * (41 - ad) * Math.min(1, dt * 7);
      if (pfYerBul(nx, p.yt, 12) !== null || pfYerBul(o.x, p.yt, 12) === null) o.x = nx;   // itilip kenardan boşluğa taşmasın
    }
  }
}
// Kuyruk yerleri (her karede bir kez, sırayla): HER hedef yerde (Feza'nın yürüdüğü zemin izi ya da çevresindeki zemin),
// birbirinden ≥ PF_ARA uzak, çiçek/tohumların ve Pırıl'ın üstünde değil. Feza'nın hemen yanında en çok PF_YAKIN_N tane;
// diğerleri izde daha geride (PF_UZAK_D'den sonra) bekler. Dar çıkıntıda yer yoksa izde aşağıda bekler, Feza ilerleyince
// pırıltılı bir yayla yetişir. Yer hiç bulunamazsa olduğu yerde (zaten yerde) bekler — asla havada, asla üst üste değil.
const PF_SLOTLAR = [], PF_ARA = 46, PF_YAKIN_N = 3, PF_UZAK_D = 290;
const pfEngel = [];   // {x, y, r} kaçınılacak yerler (bu kare)
let pfBekleSlotT = 0, pfBekleX = 0, pfBekleY = 0, pfBekleF = 0, pfBekleOnce = false;
function pfEngelKur() {
  pfEngel.length = 0;
  for (const n of NESNELER) {
    if ((n.tip === 'cicek' || n.tip === 'tohum') && Math.abs(n.x - P.x) < 900) pfEngel.push(n);
  }
}
function pfYerUygun(x, y, kadar) {
  if (Math.abs(x - P.x) < 36 && Math.abs(y - P.y) < 56) return false;                  // Feza'nın içinde değil
  for (const n of pfEngel) if (Math.abs(n.x - x) < 50 && n.y - y < 60 && y - n.y < 110) return false;   // çiçek / tohum
  if (typeof D !== 'undefined' && Math.abs(D.x - x) < 42 && D.y > y - 105 && D.y < y + 25) return false;  // Pırıl alçaktaysa
  for (let j = 0; j < kadar; j++) {
    const s = PF_SLOTLAR[j];
    if (s.var && Math.abs(s.x - x) < PF_ARA && Math.abs(s.y - y) < 56) return false;
  }
  return true;
}
// iz boyunca örnekler (Feza'dan geriye; boşluklar sıfır uzunlukta): f(x, y, yer, d) true dönerse durur
function pfIzTara(f) {
  let i = pfIz.length - 1; if (i < 0) return;
  let px, py, pyer, acc = 0, sonraki = 0;
  if (pfIzBos) { const q = pfIz[i]; px = q.x; py = q.y; pyer = q.yer; i--; }
  else { px = P.x; py = P.y; pyer = P.ground; }
  let bosOnce = pfIzBos ? pfIz[pfIz.length - 1].bos : false;
  for (; i >= 0; i--) {
    const q = pfIz[i];
    if (bosOnce) {   // boşluk (zıplanan çukur): atla; çok uzunsa (kurtarılma / ışınlanma) iz orada biter
      if (Math.abs(q.x - px) + Math.abs(q.y - py) > 360) return;
      px = q.x; py = q.y; pyer = q.yer; bosOnce = q.bos; continue;
    }
    const sl = Math.hypot(q.x - px, q.y - py);
    while (sonraki <= acc + sl) {
      const k = sl > 0 ? (sonraki - acc) / sl : 0;
      if (pyer && q.yer && f(lerp(px, q.x, k), lerp(py, q.y, k), sonraki)) return;
      sonraki += 8;
    }
    acc += sl; px = q.x; py = q.y; pyer = q.yer; bosOnce = q.bos;
  }
}
function pfSlotHesapla(dt) {
  const n = pfKuyruk.length; if (!n) return;
  for (let i = 0; i < n; i++) if (!PF_SLOTLAR[i]) PF_SLOTLAR[i] = { x: 0, y: 0, var: false, yakin: false };
  const bekle = P.idle > 0.8 && P.ground && P.fade <= 0;
  // beklerken yerler sık sık değişmesin (Pırıl uçuştukça titreşmesin): ≈0,7 sn'de bir ya da Feza kıpırdayınca
  if (bekle) {
    pfBekleSlotT -= dt;
    if (pfBekleOnce && pfBekleSlotT > 0 && Math.abs(P.x - pfBekleX) < 6 && Math.abs(P.y - pfBekleY) < 6 && P.f === pfBekleF) return;
    pfBekleSlotT = 0.7; pfBekleX = P.x; pfBekleY = P.y; pfBekleF = P.f; pfBekleOnce = true;
  } else pfBekleOnce = false;
  pfEngelKur();
  for (let i = 0; i < n; i++) { PF_SLOTLAR[i].var = false; PF_SLOTLAR[i].yakin = false; }
  // sıra: kuyruktaki uyanma sırası (p.sira)
  let yakinN = 0;
  if (bekle) {   // Feza'nın çevresi: arka, ön, arka… (aynı zemin; en çok PF_YAKIN_N)
    const yakin = P.idle > PF_UYU_SN ? 0.86 : 1;
    let arka = 0, on = 0;
    for (let i = 0; i < n && yakinN < PF_YAKIN_N; i++) {
      const s = PF_SLOTLAR[i];
      for (let deneme = 0; deneme < 4 && !s.var; deneme++) {
        const onde = (i % 2 === 1) !== (deneme % 2 === 1), k = (onde ? on : arka) + (deneme >> 1);
        if (k > 2) continue;
        const sx = P.x + (onde ? 1 : -1) * P.f * (54 + k * 44) * yakin, yy = pfYerBul(sx, P.y, 24);
        if (yy !== null && pfYerUygun(sx, yy, n)) { s.x = sx; s.y = yy; s.var = true; s.yakin = true; yakinN++; if (onde) on++; else arka++; }
      }
    }
  }
  // geri kalanlar: iz boyunca, sırayla
  let dMin = 60, yakinIz = yakinN;
  let i = 0;
  const sonrakiBos = () => { while (i < n && PF_SLOTLAR[i].var) i++; return i < n; };
  if (sonrakiBos()) pfIzTara((x, y, d) => {
    if (d < dMin) return false;
    if (yakinIz >= PF_YAKIN_N && d < PF_UZAK_D) return false;
    if (!pfYerUygun(x, y, n)) return false;
    const s = PF_SLOTLAR[i]; s.x = x; s.y = y; s.var = true;
    if (d < PF_UZAK_D) { s.yakin = true; yakinIz++; }
    dMin = d + 30;
    return !sonrakiBos();
  });
  // yakın iki arkadaşın yerleri çaprazsa (birbirinin içinden geçmeleri gerekecekse) yerlerini değiştir
  for (let j = 0; j < n; j++) for (let k = j + 1; k < n; k++) {
    const A = PF_SLOTLAR[j], B = PF_SLOTLAR[k], a = pfKuyruk[j], b = pfKuyruk[k];
    if (!A.var || !B.var || !a || !b || a.pf.sihir || b.pf.sihir) continue;
    if (Math.abs(a.x - b.x) < 70 && Math.abs(a.y - b.y) < 40 && Math.abs(A.y - B.y) < 40 && (a.x - b.x) * (A.x - B.x) < 0) {
      const x = A.x, y = A.y, yk = A.yakin; A.x = B.x; A.y = B.y; A.yakin = B.yakin; B.x = x; B.y = y; B.yakin = yk;
    }
  }
  // iz yetmediyse (Pırıl taşıdı, kurtarıldı…): kalanlar kendi yerlerinin çevresinde boş bir zemin bulur (üst üste kalmasın)
  for (let j = 0; j < n; j++) {
    const s = PF_SLOTLAR[j]; if (s.var) continue;
    const o = pfKuyruk[j]; if (!o || o.pf.sihir) continue;
    const yon = o.x < P.x ? -1 : 1;   // önce Feza'dan uzak yana
    for (let k = 0; k <= 12 && !s.var; k++) {
      const x = o.x + (k === 0 ? 0 : (k % 2 ? yon : -yon) * Math.ceil(k / 2) * 27), yy = pfYerBul(x, o.pf.yt, 30);
      if (yy !== null && pfYerUygun(x, yy, n)) { s.x = x; s.y = yy; s.var = true; }
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
// Yay (süzülme) yolu: başlangıç → hedef, kontrol noktası ikisinin de üstünde; yol üstünde zemin varsa yay yükseltilir
function pfKatiMi(x, y) { const tx = Math.floor(x / T), ty = Math.floor(y / T); return ty >= 0 && ty < ROWS && (tx < 0 || tx >= COLS || grid[ty][tx] === 1); }
function pfYayKur(p, x0, y0, x1, y1) {
  p.ax = x0; p.ay = y0; p.aex = x1; p.aey = y1; p.au = 0;
  let lift = Math.min(150, 34 + Math.abs(x1 - x0) * 0.16 + Math.max(0, y0 - y1) * 0.15);
  for (let k = 0; k < 10; k++) {
    let carp = false;
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - lift;
    for (let s = 1; s < 12 && !carp; s++) {
      const u = s / 12, it = 1 - u, bx = it * it * x0 + 2 * it * u * cx + u * u * x1, by = it * it * y0 + 2 * it * u * cy + u * u * y1;
      if (pfKatiMi(bx, by - 10) || pfKatiMi(bx, by - 34) || pfKatiMi(bx - 20, by - 22) || pfKatiMi(bx + 20, by - 22)) carp = true;
    }
    if (!carp) break;
    lift += 40;
  }
  p.alift = lift;
}
// Hedefe hareket: yakınsa yürüyerek zıplaya zıplaya (basamakta hoplar), uzaksa / boşluk ya da büyük yükseklik varsa yayla süzülerek
function pfGit(o, p, dt, tx, ty, yer, bos) {
  const dx = tx - o.x, dy = ty - p.yt, d = Math.hypot(dx, dy);
  if (!p.sihir && (d > 130 || (bos && d > 30) || Math.abs(dy) > 60)) {
    p.sihir = true; p.jv = 0;
    pfYayKur(p, o.x, p.yt + p.jy, tx, ty); p.jy = 0;
    pfZipla(p, 3.5);
    pfPirilti(o.x, o.y - 20, 6, [p.pal.i, '#ffffff'], 90, 0.6, 7);
  }
  if (p.sihir) {
    // hedef çok kaydıysa yayı şimdiki yerden yeniden kur; az kaydıysa ucu hedefe kaydır
    if (Math.abs(tx - p.aex) + Math.abs(ty - p.aey) > 50) pfYayKur(p, o.x, p.yt, tx, ty);
    else { p.aex = tx; p.aey = ty; }
    const L = Math.hypot(p.aex - p.ax, p.aey - p.ay) + p.alift * 1.3 + 1;
    const v = clamp(260 + L * 1.3, 300, 860);
    p.au = Math.min(1, p.au + v * dt / L);
    const u = 0.5 - 0.5 * Math.cos(Math.PI * p.au), it = 1 - u;
    const cx = (p.ax + p.aex) / 2, cy = Math.min(p.ay, p.aey) - p.alift;
    const nx = it * it * p.ax + 2 * it * u * cx + u * u * p.aex, ny = it * it * p.ay + 2 * it * u * cy + u * u * p.aey;
    const vx = nx - o.x;
    o.x = nx; p.yt = ny;
    p.gy = lerp(p.gy, -Math.sin(p.t * 9) * 3, 1 - Math.exp(-dt * 8));
    p.wy = lerp(p.wy, 0, 1 - Math.exp(-dt * 12));
    if (Math.abs(vx) > 0.3) p.f = vx < 0 ? -1 : 1;
    p.rot = lerp(p.rot, clamp(vx / Math.max(dt, 1e-3) / 2400, -0.3, 0.3), 1 - Math.exp(-dt * 8));
    if (Math.random() < dt * 26) pfParca(0, o.x - p.f * 10 + (Math.random() - 0.5) * 14, o.y + p.gy - 16 + (Math.random() - 0.5) * 14, -p.f * 30, 10, 0.7, 6 + Math.random() * 4, Math.random() < 0.5 ? p.pal.i : '#ffffff');
    p.ayak = lerp(p.ayak, 0.3, 1 - Math.exp(-dt * 6));
    if (p.au >= 1) {
      p.sihir = false; p.jy = p.gy; p.gy = 0; p.jv = -40; p.rot = 0; pfZipla(p, 4.5);
      pfPirilti(o.x, o.y - 6, 4, [p.pal.i, '#ffffff'], 70, 0.5, 6, -Math.PI / 2, 2.4);
    }
    o.y = p.yt; return;
  }
  p.rot = lerp(p.rot, 0, 1 - Math.exp(-dt * 10));
  p.gy = lerp(p.gy, 0, 1 - Math.exp(-dt * 10));
  const mx = clamp(dx * 9 * dt, -340 * dt, 340 * dt);
  o.x += mx;
  if (Math.abs(mx) > 0.05) p.f = mx < 0 ? -1 : 1;
  const hiz = Math.abs(mx) / Math.max(dt, 1e-4), gidiyor = hiz > 25;
  if (yer) {
    if (Math.abs(ty - p.yt) > 16 && p.jy === 0 && p.jv === 0) {   // basamak: zıplayarak çık / in (görüntü yerinde kalır, sonra hoplar)
      const fark = p.yt - ty; p.yt = ty; p.jy = fark;
      p.jv = fark > 0 ? -Math.sqrt(2 * 1500 * (fark + 16)) : -90; pfZipla(p, 2.5);
    } else if (p.jy === 0) p.yt = lerp(p.yt, ty, 1 - Math.exp(-dt * 20));
    // zıplaya zıplaya yürüyüş: adım fazı katedilen yolla ilerler; durunca adım tamamlanır
    if (gidiyor || p.faz % Math.PI > 0.02) {
      const eski = Math.floor(p.faz / Math.PI);
      p.faz += (gidiyor ? Math.abs(mx) : 150 * dt) / 34 * Math.PI;
      if (Math.floor(p.faz / Math.PI) !== eski) { pfZipla(p, 2.4); if (!gidiyor) p.faz = Math.floor(p.faz / Math.PI) * Math.PI; }
      p.wy = -Math.abs(Math.sin(p.faz)) * 12 * (p.wyK || 1) * (gidiyor ? Math.min(1, hiz / 140 + 0.4) : 0.6);
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
  if (p.kikir > 0) {
    p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.8; p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 12)); p.patiS += dt * 18;
    // kıkırdama: "hi-hi-hi" ritminde iki yana minik pırıltı kabarcıkları, gövde tatlı tatlı titrer
    const k = Math.floor((0.9 - p.kikir) / 0.15);
    if (k !== p.kikirN && k < 5) {
      p.kikirN = k; const s = k % 2 ? 1 : -1;
      pfPirilti(o.x + s * 30, o.y - 24, 2, ['#ffffff', p.pal.i, '#fff3b0'], 70, 0.45, 5, -Math.PI / 2 + s * 0.7, 0.8);
      pfZipla(p, 1.6);
    }
    p.ox = Math.sin(p.t * 38) * 1.2 * Math.min(1, p.kikir * 2);
  } else {
    p.ox = 0;
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

// ── Final: tepede, ağacın önünde, Feza'nın çevresinde dizilip hep birlikte dans ederler ──
// Koreografi (4 vuruş, vuruş 0,5 sn, döngü): hop · hop · havada bir tur · patiler havaya! Feza'dan dışa doğru minik dalga gecikmesi.
const PF_VURUS = 0.6;   // final müziği 4/4, ölçü 2,4 sn → dörtlük 0,6 sn (muzik.js BAR)
// Müzikle aynı fazda: final akorları her ölçüde değişir; akor değişimini (AU.akor) görünce ölçü başını yakala.
// Ses yoksa (?sessiz) akor hiç değişmez → faz 0 kalır.
function pfVurusEsle(F) {
  if (typeof AU === 'undefined' || !AU || typeof AU.akor !== 'function') return;
  const ak = AU.akor(); if (!ak || !ak.length) return;
  const k = ak[0] * 1000 + (ak[1] || 0) + (ak[2] || 0) * 0.001;
  if (F.akK !== undefined && k !== F.akK) {
    const bar = PF_VURUS * 4, hedef = ((F.t % bar) + bar) % bar;    // ölçü başı şimdi: (t - faz) % bar = 0 olmalı
    let fark = ((hedef - (F.faz || 0)) % bar + bar) % bar; if (fark > bar / 2) fark -= bar;
    F.faz = (F.faz || 0) + (F.akSay ? clamp(fark, -0.08, 0.08) : fark);   // ilk seferde otur, sonra küçük düzeltmeler
    F.akSay = (F.akSay || 0) + 1;
  }
  F.akK = k;
}
// Dans yerleri: Feza'nın durduğu düzlüğün (kenarlardan pay bırakarak) içinde, sırayla sağ/sol, Feza'dan uzaklaşarak
function pfZeminAlti(x, y) {   // x sütununda y'den aşağıya ilk zemin üstü
  const tx = Math.floor(x / T); if (tx < 0 || tx >= COLS) return null;
  for (let ty = Math.max(1, Math.floor((y - 20) / T)); ty < ROWS; ty++) { const c = grid[ty][tx]; if ((c === 1 && grid[ty - 1][tx] !== 1) || c === 2) return ty * T; }
  return null;
}
function pfSahne(F) {
  // sahne ağacın tepesinde: Feza ağaca havadan dokunduysa (ya da başka yerdeyse) yer, ağacın dibine göre seçilir
  let fx = P.x, fy = P.y;
  const agac = typeof TREE !== 'undefined' && TREE;
  if (agac && !(P.ground && Math.abs(P.y - TREE.y) < 30 && Math.abs(P.x - TREE.x) < 400)) { fx = TREE.x - 18; fy = TREE.y; }
  if (F.fx !== undefined && Math.abs(fx - F.fx) < 20) return F;
  const y = pfZeminAlti(fx, fy);
  if (y === null) return F;
  F.fx = fx; F.y = y;
  let Lr = fx, Rr = fx;
  while (Lr > fx - 460 && pfYerBul(Lr - 8, y, 4) !== null) Lr -= 8;
  while (Rr < fx + 460 && pfYerBul(Rr + 8, y, 4) !== null) Rr += 8;
  Rr = Math.min(Rr, COLS * T); F.Lr = Lr; F.Rr = Rr;
  const L = Lr + 24, R = Math.min(Rr - 22, COLS * T - 36), n = F.kucuk.length;
  // Büyük Pofuduk'un yeri: herkesin SOLUNDA (ağaç gövdesi açık kalsın), gövdesi (200 geniş) Feza'ya değmesin;
  // düzlük dar ise sol kenardan biraz taşar. Yer hiç yoksa sağ uç; o da yoksa yerinde kalır (null).
  const agacX = typeof TREE !== 'undefined' && TREE ? TREE.x : fx + 40;
  let bx = Math.min(Lr + 92, fx - 160, agacX - 190);
  if (bx < Lr + 40) bx = Rr - fx >= 300 ? Rr - 96 : fx - Lr >= 80 ? Lr + 60 : null;
  F.bx = bx;
  // küçüklerin yerleri: Feza ortada, iki yanında boşluk (sahnenin yıldızı o); küçükler iki yana eşit dağılır,
  // aralarında hep aynı mesafe (üst üste binme yok). Bir yana sığmayan öbür yana geçer; hiç sığmazsa aralık daralır.
  const G0 = 50;                                    // Feza'nın merkezinden ilk dansçıya
  const capOf = (sp, yon) => Math.max(0, Math.floor(((yon < 0 ? fx - L : R - fx) - G0) / sp) + 1);
  let sp = 46, cL = capOf(sp, -1), cR = capOf(sp, 1);
  while (cL + cR < n && sp > 30) { sp -= 2; cL = capOf(sp, -1); cR = capOf(sp, 1); }
  let nL = Math.min(cL, Math.ceil(n / 2)), nR = Math.min(cR, n - nL);
  nL = Math.min(cL, n - nR); nR = Math.min(cR, n - nL);
  const yer = [];
  for (let j = 0; j < nL; j++) yer.push(fx - G0 - j * sp);
  for (let j = 0; j < nR; j++) yer.push(fx + G0 + j * sp);
  for (let j = 0; yer.length < n; j++) yer.push(clamp(fx + (j % 2 ? -1 : 1) * (G0 + 14 + j * 9), L, R));   // çok dar: (olmamalı)
  yer.sort((a, b) => a - b);
  F.yer = yer.map(x => ({ x, y: pfYerBul(x, y, 30) ?? y, sira: 0, derin: 0 }));
  const uz = F.yer.slice().sort((a, b) => Math.abs(a.x - fx) - Math.abs(b.x - fx));
  // hafif yay: Feza'nın yanındakiler önde, dıştakiler azıcık geride (yalnız çizimde biraz yukarı + küçük; zemin aynı)
  const yanN = Math.max(1, Math.max(nL, nR) - 1);
  uz.forEach((s, k) => { s.sira = k; s.derin = smooth(clamp((Math.round((Math.abs(s.x - fx) - G0) / sp)) / yanN, 0, 1)); });
  return F;
}
function pfDans(o, p, dt) {
  const F = pfFinal;
  pfSahne(F);
  const s = F.yer && F.yer[p.dansI];
  // basamak / minder halinden yumuşakça normal boya dön
  p.boy = lerp(p.boy || 0, 0, 1 - Math.exp(-dt * 5)); if (p.boy < 0.01) p.boy = 0;
  p.bsx = lerp(p.bsx, 1, 1 - Math.exp(-dt * 5)); p.bsy = lerp(p.bsy, 1, 1 - Math.exp(-dt * 5));
  p.kizar = lerp(p.kizar || 0, 0, 1 - Math.exp(-dt * 4)); p.salla = lerp(p.salla || 0, 0, 1 - Math.exp(-dt * 6));
  p.saklan = null; p.kovala = null; p.gerin = null; p.selamT = 0; p.uyuk = 0; p.patiAgiz = 0; p.ox = lerp(p.ox || 0, 0, 1 - Math.exp(-dt * 8));
  p.derin = lerp(p.derin || 0, s && p.dansHazir ? s.derin : 0, 1 - Math.exp(-dt * 3));
  if (!s) { pfHop(o, p, dt); return; }
  const tx = s.x, ty = s.y;
  if (!p.dansHazir) {
    pfGit(o, p, dt, tx, ty, true, false);
    p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.6; p.pati = lerp(p.pati, 0.5, 1 - Math.exp(-dt * 6)); p.patiS += dt * 12;
    pfDonGuncelle(p, dt); pfHop(o, p, dt);
    if (!p.sihir && p.jy === 0 && Math.abs(tx - o.x) < 6 && Math.abs(ty - p.yt) < 4) p.dansHazir = true;
    return;
  }
  // yerinde: yer kayarsa (Feza birkaç adım attı) yürüyerek kay; hiç zıplayıp düşmez
  if (Math.abs(tx - o.x) > 30 || Math.abs(ty - p.yt) > 6) { p.dansHazir = false; return; }
  o.x = lerp(o.x, tx, 1 - Math.exp(-dt * 6)); p.yt = ty; o.y = ty; p.wy = lerp(p.wy, 0, 1 - Math.exp(-dt * 10)); p.gy = 0; p.rot = lerp(p.rot, 0, 1 - Math.exp(-dt * 10));
  const lt = F.t - (F.faz || 0) - s.sira * 0.07, k = Math.floor(lt / PF_VURUS), b = ((k % 4) + 4) % 4, u = lt / PF_VURUS - k;
  if (k !== p.dansK && lt > 0) {
    p.dansK = k;
    if (b === 0 || b === 1) { p.jv = -250; pfZipla(p, 3.5); }
    else if (b === 2) { p.jv = -335; p.donH = 1; p.donT = 0; pfZipla(p, 4.5); if (Math.random() < 0.7) pfPirilti(o.x, o.y - 8, 4, [p.pal.i, '#ffffff', '#fff3b0'], 90, 0.6, 7, -Math.PI / 2, 2.6); }
    else { pfZipla(p, -4); pfPirilti(o.x, o.y - 44, 3, ['#ffffff', p.pal.i, '#fff3b0'], 60, 0.7, 7, -Math.PI / 2, 1.6); }
  }
  const yukari = b === 3;
  p.sqH = yukari ? -0.12 * Math.sin(Math.PI * clamp(u * 1.15, 0, 1)) : 0;
  p.f = P.x < o.x ? -1 : 1;
  pfDonGuncelle(p, dt);
  if (yukari) p.ff = lerp(p.ff, 0, 1 - Math.exp(-dt * 12));
  p.bakX = yukari ? 0 : p.f * 0.5; p.bakY = yukari ? -0.5 : 0;
  p.goz = yukari ? 'acik' : 'mutlu'; p.agiz = 'acik'; p.agizB = yukari ? 0.8 : 0.65;
  if (yukari) { p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 16)); p.patiS = lerp(p.patiS % 6.283, 0.87, 1 - Math.exp(-dt * 14)); }
  else { p.pati = lerp(p.pati, 0.55, 1 - Math.exp(-dt * 10)); p.patiS += dt * 12; }
  p.ayak = 1; p.dik = lerp(p.dik, 1, 1 - Math.exp(-dt * 6));
  pfHop(o, p, dt);
}

// Minderin yosun yuvası: arkada koyu yosun çanağı, önde kabarık yosun kenarı, otlar ve minik ışıklı çiçekler (önbellekli)
function pfYuva(on) {
  const key = 'yuva' + (on ? 1 : 0); let c = PF_SPR.get(key); if (c) return c;
  const Wd = 112, Hd = 44, R = rng(on ? 77 : 78);
  c = document.createElement('canvas'); c.width = Math.ceil(Wd * pfRes); c.height = Math.ceil(Hd * pfRes); c.ww = Wd; c.wh = Hd;
  const x = c.getContext('2d'); x.setTransform(pfRes, 0, 0, pfRes, Wd / 2 * pfRes, (Hd - 8) * pfRes);   // (0,0) = zemin ortası
  x.lineCap = 'round';
  const yosun = '#2e7a68', acik = '#7fe0b4', koyu = '#123f3c';
  if (!on) {   // arka çanak + arkadan uzanan otlar
    x.strokeStyle = koyu; x.lineWidth = 1.6;
    for (let i = 0; i < 16; i++) { const bx = (R() - 0.5) * 92, h = 8 + R() * 14; x.beginPath(); x.moveTo(bx, -6); x.quadraticCurveTo(bx + (R() - 0.5) * 6, -6 - h * 0.6, bx + (R() - 0.5) * 10, -6 - h); x.stroke(); }
    const gr = x.createLinearGradient(0, -16, 0, 4); gr.addColorStop(0, '#24605a'); gr.addColorStop(1, koyu);
    x.fillStyle = gr; x.beginPath(); x.ellipse(0, -5, 50, 12, 0, Math.PI, 0); x.lineTo(50, 0); x.lineTo(-50, 0); x.fill();
  } else {     // ön kenar: yosun topakları dizisi
    const gr = x.createLinearGradient(0, -14, 0, 8); gr.addColorStop(0, acik); gr.addColorStop(0.35, yosun); gr.addColorStop(1, koyu);
    x.fillStyle = gr; x.beginPath(); x.moveTo(-50, 4);
    x.quadraticCurveTo(-56, -2, -50, -9);
    for (let i = 1; i <= 12; i++) {   // üst kenar: yuvarlak yosun topakları (ortası hafif aşağı kavisli dudak)
      const u = i / 12, px = -50 + u * 100, py = -9 + Math.sin(u * Math.PI) * 4;
      x.quadraticCurveTo(px - 4.2, py - 5 - R() * 2.5, px, py);
    }
    x.quadraticCurveTo(56, -2, 50, 4); x.quadraticCurveTo(0, 13, -50, 4); x.closePath(); x.fill();
    // yosun dokusu: minik açık noktalar
    for (let i = 0; i < 40; i++) { const px = (R() - 0.5) * 96, py = -6 + R() * 10; x.fillStyle = `rgba(160,255,210,${0.15 + R() * 0.25})`; x.beginPath(); x.arc(px, py, 0.6 + R() * 1.1, 0, 6.283); x.fill(); }
    // önde otlar
    for (let i = 0; i < 14; i++) {
      const bx = (R() - 0.5) * 100, h = 5 + R() * 10, ex = bx + (R() - 0.5) * 8;
      x.strokeStyle = R() < 0.5 ? '#1d5c52' : '#3d9a7e'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(bx, -2); x.quadraticCurveTo(bx, -2 - h * 0.6, ex, -2 - h); x.stroke();
      x.fillStyle = 'rgba(190,255,230,0.7)'; x.beginPath(); x.arc(ex, -2 - h, 0.7, 0, 6.283); x.fill();
    }
    // minik ışıklı çiçekler
    const cc = ['#ffb3d6', '#fff0a6', '#bfe4ff'];
    for (let i = 0; i < 4; i++) {
      const fx = -40 + i * 26 + (R() - 0.5) * 8, fy = -8 - R() * 4;
      const g2 = x.createRadialGradient(fx, fy, 0, fx, fy, 8); g2.addColorStop(0, 'rgba(255,240,250,0.55)'); g2.addColorStop(1, 'rgba(255,240,250,0)');
      x.fillStyle = g2; x.fillRect(fx - 8, fy - 8, 16, 16);
      x.fillStyle = cc[i % 3];
      for (let k = 0; k < 5; k++) { const a = k * 1.2566; x.beginPath(); x.arc(fx + Math.cos(a) * 1.9, fy + Math.sin(a) * 1.9, 1.5, 0, 6.283); x.fill(); }
      x.fillStyle = '#fffbe8'; x.beginPath(); x.arc(fx, fy, 1.1, 0, 6.283); x.fill();
    }
  }
  PF_SPR.set(key, c); return c;
}
function pfYuvaCiz(o, on) {   // yuva yerinde kalır (Pofuduk finalde oradan ayrılsa da)
  const s = pfYuva(on), x = o.pf.x0, y = o.pf.y0;
  g.drawImage(s, x - s.ww / 2, y - (s.wh - 8), s.ww, s.wh);
}
function pfKucukCiz(o, tm) {
  pfResGuncel();
  const p = o.pf, cz = PF_CZ;
  if (o.tur === 'minder') {
    pfYuvaCiz(o, false);
    pfKucukCiz2(o, p, cz, tm);
    pfYuvaCiz(o, true);
    return;
  }
  pfKucukCiz2(o, p, cz, tm);
  if (p.kovala) pfKovalaCiz(p, tm);
}
function pfKucukCiz2(o, p, cz, tm) {
  const uyku = p.durum === 'uyku';
  const nef = uyku ? p.nef || 0 : 0.5 + 0.5 * Math.sin(p.t * 2.6);
  const bas = o.tur === 'basamak' ? p.boy : 0;
  const hy = p.jy + p.wy + p.gy;
  cz.x = o.x + (p.ox || 0); cz.y = o.y + hy; cz.zemin = o.y;
  cz.golge = p.sihir ? 0.25 : clamp(1 + hy / 60, 0.3, 1);
  cz.rot = p.rot;
  const sq = p.sq * (1 - bas * 0.8);
  const der = p.durum === 'dans' ? p.derin || 0 : 0, olc = (p.olc || 1) * (1 - 0.07 * der);
  if (der) { cz.y -= der * 7; cz.zemin -= der * 7; }
  cz.sx = olc * p.bsx * (1 + sq) * (1 - nef * 0.02 * (uyku ? 1 : 0.5));
  cz.sy = olc * p.bsy * (1 - sq) * (1 + nef * 0.04 * (uyku ? 1 : 0.5)) * (uyku ? 0.95 : 1);
  cz.don = p.don || 1;
  cz.seed = p.seed; cz.p0 = PF_UYKU; cz.p1 = p.pal; cz.bloom = p.bloom;
  cz.r = PF_RY; cz.gozO = 1;
  if (bas > 0.001) {   // uzayan basamak: kapsül gövde, yüz üstte
    cz.n = 2.7; cz.sw = PF_BAS_W; cz.h = PF_BAS_H; cz.w = lerp(PF_RX * 2, PF_BAS_W, bas); cz.gH = lerp(PF_RY * 2, PF_BAS_H, bas);
    cz.yuzY = lerp(0.5, 0.24, bas);
  } else { cz.n = 2; cz.sw = PF_RX * 2; cz.h = PF_RY * 2; cz.w = PF_RX * 2; cz.gH = PF_RY * 2; cz.yuzY = 0.5; }
  cz.goz = p.goz; cz.goz2 = ''; cz.kirp = p.kirp; cz.bakX = p.bakX; cz.ff = p.ff; cz.lid = p.goz === 'yarim' ? p.lid || 0 : 0;
  cz.agiz = p.agiz; cz.agizB = p.agizB;
  cz.yanak = uyku ? 0.3 : 0.55;
  cz.dik = p.dik; cz.kul = p.kul; cz.tut = p.tut + (uyku ? Math.sin(p.t * 0.9) * 0.05 : Math.sin(p.t * 3) * 0.04);
  cz.sal = uyku ? nef : 0;
  cz.ayak = uyku ? 0 : p.ayak; cz.adim = p.adim;
  cz.pati = p.pati; cz.patiS = p.patiS;
  cz.kabarcik = uyku ? p.kab : 0;
  cz.parla = uyku ? 0.16 + nef * 0.1 : 0.2 + p.bloom * 0.12;
  cz.tutamYok = false;
  cz.yuzO = 1; cz.kivO = 1; cz.am = 1; cz.bakY = p.bakY || 0; cz.patiAgiz = p.patiAgiz || 0; cz.kabO = 1; cz.salla = p.salla || 0;
  if (p.kizar) cz.yanak = Math.min(1, cz.yanak + p.kizar * 0.4);
  cz.isilti = p.kikir > 0 || p.durum === 'dans' ? 1 : 0;
  cz.yastik = o.tur === 'minder' ? (p.bsx - 1) / 0.24 * 0.8 : 0;
  cz.yuzSx = 1 / p.bsx; cz.yuzSy = lerp(1, 0.85, (1 - p.bsy) / 0.28) / p.bsy;
  cz.olc = olc;
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
      zT: 1, dansK: -1, davetT: 1, x0: o.x, y0: o.y, ff: -0.3, bakX: 0, nef: 0, kab: 0, goz: 'uyku', goz2: '', lid: 0, agiz: 'o', agizB: 0, rot: 0 };
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
    pfBuyukGuncelle(o, dt);
  },
  ciz(o, tm) { pfCevreCiz(o, tm, false); if (!pfFinal) pfBuyukCiz(o, tm); },   // finalde gövde pfFx'te (ağacın önünde) çizilir
  cizOn(o, tm) { pfCevreCiz(o, tm, true); },
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
    pfUykuFxSil(o, p.asama >= 3);
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
      p.pufT = p.t; p.pufG = a === 0 ? 1 : 0.65; p.pufX = mx;
      PF_RUZGAR.x = mx; PF_RUZGAR.y = my; PF_RUZGAR.t = now; PF_RUZGAR.guc = p.pufG;
      for (let i = 0; i < n; i++) pfParca(2, mx - 10, my + (Math.random() - 0.5) * 24, -(130 + Math.random() * 170), -40 - Math.random() * 110, 2.4 + Math.random(), 9 + Math.random() * 5, ['#8fe3c2', '#b9f0a8', '#ffd1e6', '#a9dcff'][i % 4]);
      pfPirilti(mx - 6, my, a === 0 ? 8 : 4, ['#d8ccff', '#ffffff', '#bff4ff'], 160, 0.9, 9, Math.PI + 0.25, 0.9);
      for (let i = 0; i < 3; i++) pfParca(3, mx - i * 14, my + 4, -(70 + i * 40), -10, 0.9, 16 + i * 5, '#cfc4ff');
      // görünür nefes: ağızdan çıkan, dönerek uçuşan iki yumuşak kıvrım (horlamanın "fıırr"ı)
      pfParca(5, bx - 16, o.y - 62, -170 * p.pufG - 50, -30, 2.0, 46 * (0.75 + 0.25 * p.pufG), 1);
      pfParca(5, bx - 12, o.y - 54, -100 * p.pufG - 40, 4, 1.6, 26, -1);
      if (a < 2) pfParca(1, bx + 30, top0 + 40, 26, -26, 3, 14 + Math.random() * 4, 0);
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
      // tatlı, uykulu bir esneme: gözler yumuşakça kapalı, küçük pembe oval ağız, bir pati ağzına pıt pıt vurur, uzun gerinme
      p.goz = 'uyku'; p.agiz = 'esne'; p.agizB = ac * (0.8 + Math.sin(t * 7) * 0.04);
      p.sqH = -0.12 * ac; p.pati = ac; p.patiS = Math.sin(t * 1.6) * 0.5 - 1.5; p.rot = Math.sin(t * 1.5) * 0.05 * ac;
      p.patiAgiz = smooth(clamp((t - 0.85) / 0.45, 0, 1)) * (1 - smooth(clamp((t - 1.95) / 0.45, 0, 1)));
      if (t > 1.15 && !p.gozYasi) {   // gözün kenarında minik bir esneme pırıltısı
        p.gozYasi = true; pfPirilti(bx - 34, o.y - 108, 2, ['#ffffff', '#cfefff'], 30, 0.9, 7, Math.PI / 2, 0.6);
      }
      if (t > 0.6 && t < 1.9 && Math.random() < dt * 8) pfPirilti(bx, o.y - 120, 1, ['#ffffff', '#ffe9b8'], 60, 0.8, 8, -Math.PI / 2, 1.5);
    } else {   // uykulu ama uyanık: iki göz yarı açık, sallanır
      p.patiAgiz = 0;
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
  if (p.hy < 0 || p.hv < 0) { p.hv += 1700 * dt; p.hy += p.hv * dt; if (p.hy >= 0) { p.hy = 0; p.hv = 0; pfZipla(p, pfFinal ? 2.6 : 5); } }
  p.ff = lerp(p.ff, a === 0 ? -0.3 : clamp(df / 300, -1, 1) * 0.45, 1 - Math.exp(-dt * 3));
  pfYay(p, dt);
}
// Uyku efektleri (z'ler, horlama nefesi): esnemede z'ler, tam uyanınca hepsi HEMEN minik pırıltıya dönüşüp kaybolur
function pfUykuFxSil(o, hemen) {
  for (const q of pfP) {
    if ((q.tip !== 1 && q.tip !== 5) || Math.abs(q.x - o.x) > 420 || Math.abs(q.y - (o.y - 120)) > 360) continue;
    if (!hemen && q.tip === 5) continue;   // esnerken son nefes bulutçuğu uçup gitsin; z'ler hemen pıt diye söner
    q.tip = 0; q.col = '#ffffff'; q.s = 5; q.vx *= 0.3; q.vy = -30; q.max = q.life = 0.35;
  }
}
function pfBuyukGuc(o) {   // ağacın yüksekliğine göre: tepe noktası ağaç zemininin en az ~120 birim üstünde olsun
  const ag = typeof TREE !== 'undefined' && TREE ? TREE.y : o.y;
  const gerek = (o.y - 96) - ag + 120;
  return Math.max(PF_BUYUK_GUC, Math.min(1700, Math.sqrt(2 * 2200 * Math.max(0, gerek))));
}
// Finalde Büyük Pofuduk: Feza'ya bakıp sevinir → çömelir → kocaman mutlu bir sıçrayışla tepeye, düzlüğün boş yanına konar
// (gövde kenara değmesin diye önce dimdik yükselir, sonra yana süzülür) → herkesle aynı koreografide dans eder.
function pfBuyukDans(o, p, dt) {
  o.cisim.aktif = false;
  const F = pfFinal, t = F.t;
  if (p.fHedef === undefined && (t > 0.5 || P.ground)) {   // nereye konacak? (bir kez, Feza yere indikten sonra) — tercihen solda (ağacın gövdesini kapatmasın)
    p.fHedef = null;
    const S0 = pfSahne(F);
    if (S0.y !== undefined && Math.abs(S0.y - o.y) > 20 && S0.bx !== null && S0.bx !== undefined) {
      p.fHedef = { x: S0.bx, y: S0.y };
      if (p.fHedef) { const yy = pfYerBul(p.fHedef.x, S0.y, 30); if (yy !== null) p.fHedef.y = yy; }
    }
    p.fx0 = o.x; p.fy0 = o.y; p.fT0 = Math.max(0, t - 0.5);
  }
  p.yat = lerp(p.yat, 0, 1 - Math.exp(-dt * 4));
  const H = p.fHedef;
  let dansta = p.fHedef === null;
  if (p.fHedef === undefined) { p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.8; p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 10)); p.patiS += dt * 14; return; }
  if (H && !p.kondu) {
    const T0 = 0.55, T1 = 1.0, UC = 1.15, tl = t - p.fT0;
    if (tl < T1) {   // sevinç + çömelme
      p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.8;
      p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 10)); p.patiS += dt * 14;
      p.sqH = tl < T0 ? 0 : 0.2 * smooth(clamp((tl - T0) / 0.35, 0, 1));
      p.ff = lerp(p.ff, Math.sign(H.x - o.x) * 0.4, 1 - Math.exp(-dt * 6));
    } else {
      if (!p.ucti) {
        p.ucti = true; p.sqH = -0.1; p.sqv = -11;
        pfPirilti(o.x, o.y - 10, 14, [PF_BUYUK.i, '#ffffff', '#fff3b0'], 230, 0.8, 10, -Math.PI / 2, 2.2);
        burst(o.x, o.y - 10, 12, [PF_BUYUK.i, '#ffd6f2'], 200, 1.0, 7);
        if (typeof AU !== 'undefined') AU.sfx('boing', 1.3);
      }
      const u = clamp((tl - T1) / UC, 0, 1), it = 1 - u;
      const cy = Math.min(p.fy0, H.y) - 150;
      o.x = lerp(p.fx0, H.x, smooth(clamp((u - 0.22) / 0.78, 0, 1)));
      o.y = it * it * p.fy0 + 2 * it * u * cy + u * u * H.y;
      p.sqH = u < 0.45 ? -0.1 : 0.05 * smooth((u - 0.45) / 0.55);
      p.rot = Math.sin(Math.PI * u) * 0.1 * Math.sign(H.x - p.fx0);
      p.goz = u < 0.7 ? 'mutlu' : 'acik'; p.agiz = 'acik'; p.agizB = 0.9;
      p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 10)); p.patiS += dt * 18;
      if (Math.random() < dt * 30) pfParca(0, o.x + (Math.random() - 0.5) * 150, o.y - Math.random() * 160, 0, 20, 0.8, 7 + Math.random() * 5, Math.random() < 0.5 ? PF_BUYUK.i : '#ffffff');
      if (u >= 1) {
        p.kondu = true; o.x = H.x; o.y = H.y; p.rot = 0; p.sqH = 0; pfZipla(p, 7);
        for (let i = 0; i < 16; i++) { const a = Math.PI + i / 15 * Math.PI; pfParca(0, o.x + Math.cos(a) * 100, o.y - 4, Math.cos(a) * 220, -40 - Math.random() * 80, 0.9, 9 + Math.random() * 5, i % 2 ? PF_BUYUK.i : '#fff3b0'); }
        for (let i = 0; i < 4; i++) pfParca(3, o.x + (i - 1.5) * 50, o.y - 8, (i - 1.5) * 60, -20, 0.8, 22, '#f4e4ff');
        if (typeof AU !== 'undefined') AU.sfx('puf', 1);
      }
    }
  } else dansta = true;
  if (dansta) {
    const lt = t - (F.faz || 0) - 0.04, k = Math.floor(lt / PF_VURUS), b = ((k % 4) + 4) % 4, u = lt / PF_VURUS - k;
    if (k !== p.dansK && p.hy === 0 && p.hv === 0 && (!H || t > (p.konT || (p.konT = t)) + 0.3)) {
      p.dansK = k;
      if (b === 0 || b === 1) { p.hv = -290; pfZipla(p, 3); }
      else if (b === 2) { p.hv = -370; p.salT = 0; pfZipla(p, 4); pfPirilti(o.x, o.y - 30, 6, [PF_BUYUK.i, '#ffffff', '#fff3b0'], 160, 0.8, 10, -Math.PI / 2, 2.5); }
      else { pfZipla(p, -3); pfPirilti(o.x, o.y - 200, 5, ['#ffffff', PF_BUYUK.i, '#fff3b0'], 90, 0.8, 9, -Math.PI / 2, 1.8); }
    }
    const yukari = b === 3;
    p.sqH = yukari ? -0.1 * Math.sin(Math.PI * clamp(u * 1.15, 0, 1)) : 0;
    p.goz = yukari ? 'acik' : 'mutlu'; p.agiz = 'acik'; p.agizB = 0.9;
    if (yukari) { p.pati = lerp(p.pati, 1, 1 - Math.exp(-dt * 14)); p.patiS = lerp(p.patiS % 6.283, 0.87, 1 - Math.exp(-dt * 12)); }
    else { p.pati = lerp(p.pati, 0.6, 1 - Math.exp(-dt * 8)); p.patiS += dt * 10; }
  }
  // üçüncü vuruşta (küçükler havada dönerken) koca gövdeyle sağa-sola tatlı bir salınım: kocaman bir dönüş incecik görünürdü
  if (p.salT !== undefined && p.salT < 1) { p.salT = Math.min(1, p.salT + dt / 0.5); p.rot = Math.sin(p.salT * Math.PI * 2) * 0.16 * Math.sin(p.salT * Math.PI); }
  p.don = 1;
}

// ── Büyük Pofuduk'un çevresi: horlama esintisiyle eğilen otlar ve süzülen küçük ışık topları ──
// Diğer dosyalar isterse kullanabilir: PF_RUZGAR {x, y, t (now), guc} = son horlama üflemesi (ör. dunya.js otları için).
const PF_RUZGAR = { x: 0, y: 0, t: -99, guc: 0 };
// x konumundaki esinti (−1..1 civarı, ağızdan uzaklaşan yönde): dalga ağızdan dışa yayılır, sonra yaylanıp durulur
function pfEsinti(p, x) {
  if (p.pufT === undefined) return 0;
  const d = Math.abs(x - p.pufX), tau = p.t - p.pufT - d / 280;
  if (tau <= 0 || tau > 3) return 0;
  const itme = tau * 9 * Math.exp(1 - tau * 9), yay = -0.35 * Math.sin(tau * 11) * Math.exp(-tau * 2.6) * Math.min(1, tau * 6);
  return (itme + yay) * p.pufG * Math.exp(-d / 260) * (x < p.pufX ? -1 : 1);
}
function pfCevreKur(o) {
  const R = rng(4242), c = { ot: [], isik: [] };
  for (let i = 0; i < 46; i++) {
    const dx = (R() - 0.5) * 420, on = Math.abs(dx) > 70 ? R() < 0.45 : R() < 0.85;
    c.ot.push({ dx, h: (on ? 7 : 10) + R() * (on ? 10 : 18), w: 1.4 + R() * 1.4, ph: R() * 6.283, on, ton: R(), cicek: R() < 0.12 });
  }
  for (let i = 0; i < 11; i++) c.isik.push({ dx: -300 + i * 52 + (R() - 0.5) * 30, dy: -24 - R() * 190, ph: R() * 6.283, r: 2.2 + R() * 1.8, sp: 0.4 + R() * 0.5, col: ['#bff4ff', '#e6d6ff', '#fff3c4', '#ffd6ec'][i % 4], ex: 0, ey: 0 });
  return c;
}
function pfCevreCiz(o, tm, on) {
  const p = o.pf, c = p.cevre || (p.cevre = pfCevreKur(o));
  const zemin = p.y0 !== undefined ? p.y0 : o.y, ox = p.x0 !== undefined ? p.x0 : o.x, ac = typeof light !== 'undefined' ? light : 0;
  // otlar
  const koyu = mixc('#0a1830', '#164a52', ac), uc = mixc('#5fd0d8', '#bff7e6', ac, 0.85);
  g.lineCap = 'round';
  for (const b of c.ot) {
    if (b.on !== on) continue;
    const x = ox + b.dx, es = pfEsinti(p, x);
    const sal = Math.sin(p.t * 1.3 + b.ph) * 0.07, ang = sal + es * 1.1;
    const tx = x + Math.sin(ang) * b.h, ty = zemin - Math.cos(ang) * b.h;
    g.fillStyle = koyu;
    g.beginPath(); g.moveTo(x - b.w, zemin + 2); g.quadraticCurveTo(x + Math.sin(ang) * b.h * 0.45 - b.w * 0.5, zemin - b.h * 0.55, tx, ty);
    g.quadraticCurveTo(x + Math.sin(ang) * b.h * 0.45 + b.w * 0.5, zemin - b.h * 0.55, x + b.w, zemin + 2); g.fill();
    if (b.cicek) {   // minik ışıklı tomurcuk
      g.globalCompositeOperation = 'lighter'; dglow('#ffd6ec', tx, ty, 7, 0.35 + ac * 0.3); g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#ffe6f2'; g.beginPath(); g.arc(tx, ty, 1.6, 0, 6.283); g.fill();
    } else { g.fillStyle = uc; g.beginPath(); g.arc(tx, ty, 0.8, 0, 6.283); g.fill(); }
  }
  if (on) return;
  // süzülen ışık topları (arka katman): kendi yavaş dansları + esintide sallanma
  g.globalCompositeOperation = 'lighter';
  for (const l of c.isik) {
    const bx = ox + l.dx + Math.sin(p.t * l.sp + l.ph) * 14, by = zemin + l.dy + Math.sin(p.t * l.sp * 1.3 + l.ph * 2) * 10;
    const es = pfEsinti(p, bx);
    l.ex = lerp(l.ex, es * 50, 0.25); l.ey = lerp(l.ey, -Math.abs(es) * 10, 0.25);
    const x = bx + l.ex, y = by + l.ey, pul = 0.75 + 0.25 * Math.sin(p.t * 2.3 + l.ph);
    dglow(l.col, x, y, l.r * 7, (0.5 + ac * 0.2) * pul);
    dglow('#ffffff', x, y, l.r * 2.2, 0.95 * pul);
  }
  g.globalCompositeOperation = 'source-over';
}

function pfBuyukCiz(o, tm) {
  pfResGuncel();
  const p = o.pf, cz = PF_CZ;
  const nef = p.nef || 0, yat = p.yat || 0;
  cz.x = o.x; cz.y = o.y + p.hy; cz.zemin = o.y; cz.golge = p.ucti && !p.kondu ? 0 : clamp(1 + p.hy / 120, 0.4, 1);
  cz.rot = p.rot || 0;
  const sq = p.sq;
  const ysx = lerp(1, 1.16, yat), ysy = lerp(1, 0.52, yat);
  cz.sx = (1 + sq) * (1 - nef * 0.025) * ysx;
  cz.sy = (1 - sq) * (1 + nef * 0.05) * ysy;
  cz.yuzSx = 1 / ysx; cz.yuzSy = lerp(1, 0.78, yat) / ysy;
  cz.patiAgiz = p.asama === 2 ? p.patiAgiz || 0 : 0; cz.kabO = 0.6;
  cz.yastik = yat; cz.kivO = 1.45; cz.yuzO = 1.22; cz.isilti = p.asama >= 3 ? p.bloom : 0; cz.bakY = p.bakY || 0; cz.am = 1;
  cz.don = p.don || 1; cz.seed = 7; cz.salla = 0;
  cz.p0 = PF_BUYUK_UYKU; cz.p1 = PF_BUYUK; cz.bloom = p.bloom;
  cz.w = PF_BRX * 2; cz.sw = PF_BRX * 2; cz.h = PF_BRY * 2; cz.gH = PF_BRY * 2; cz.n = 2; cz.yuzY = lerp(0.55, 0.5, yat);
  cz.r = PF_BRY * 0.8; cz.gozO = p.asama >= 3 ? 0.92 : 0.85;
  cz.goz = p.goz; cz.goz2 = p.goz2 || ''; cz.kirp = p.asama >= 2 ? p.kirp : 0; cz.lid = p.lid || 0; cz.bakX = p.bakX; cz.ff = p.ff;
  cz.agiz = p.agiz; cz.agizB = p.agizB;
  cz.yanak = p.asama >= 3 ? 0.6 : 0.42;
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
    } else if (p.mir <= 0) {   // tosladı: uyurken uykulu bir "z", uyanıksa (z yok!) kıkırdayıp minik bir kalp
      p.mir = 1.4; pfZipla(p, 1.6);
      if (p.asama < 2) pfParca(1, o.x + 40, o.y - 200, 20, -24, 2.6, 14, 0);
      else { p.kikir = Math.max(p.kikir, 0.5); pfParca(4, o.x - 60, o.y - 150, -30, -60, 1.3, 8, '#ff9cc4'); }
    }
  }
});
OLAY.on('kurtarildi', () => { pfIzBos = true; });
function pfFinalBasla() {
  if (pfFinal) return;
  const kucuk = NESNELER.filter(o => o.tip === 'pofuduk' && o.pf);
  pfFinal = { t: 0, kucuk, buyuk: NESNELER.find(o => o.tip === 'buyukPofuduk' && o.pf) || null };
  pfSahne(pfFinal);
  // yerleri soldan sağa, dansçıları da şimdiki konumlarına göre soldan sağa eşle (kimse kimsenin içinden geçmesin)
  const sirali = kucuk.slice().sort((a, b) => a.x - b.x);
  sirali.forEach((o, i) => { o.pf.dansI = i; });
  const bo = pfFinal.buyuk;
  if (bo) { const p = bo.pf; if (p.asama < 3) { p.asama = 3; p.aT = 2.6; bo.uyandi = true; p.bloom = 1; } pfUykuFxSil(bo, true); }
  const solX = cam.x - 70, sagX = cam.x + VW + 70;
  for (const o of kucuk) {
    const p = o.pf;
    if (o.cisim) { o.cisim.aktif = false; o.cisim.dy = 0; }
    p.dansHazir = false; p.dansK = -99; p.tos = null;
    const gorunur = o.x > cam.x - 40 && o.x < cam.x + VW + 40 && o.y > cam.y - 60 && o.y < cam.y + VH / cam.zoom + 60;
    if (gorunur) {   // ekrandaysa: uyanmadıysa (sessizce) uyanıp gelir; diğerleri olduğu yerden yumuşakça dans yerine
      if (!o.uyandi) pfUyandir(o, true); else if (p.durum !== 'uyaniyor') p.durum = 'dans';
      continue;
    }
    // uzaktakiler: ekranın kenarının hemen dışından, havadan, pırıltılı bir yayla süzülerek gelir (ani belirme yok)
    o.uyandi = true; p.durum = 'dans'; p.bloom = 1; p.olc = PF_OLC; p.dik = 1; p.boy = 0; p.bsx = 1; p.bsy = 1; p.uyuk = 0; p.uyudu = false; p.gerin = null;
    const s = pfFinal.yer && pfFinal.yer[p.dansI];
    let sx = s && s.x >= pfFinal.fx ? sagX : solX;
    if (sx > COLS * T - 30) sx = solX;
    if (sx < 30) sx = sagX;
    const y = (s ? s.y : P.y) - 170;
    o.x = sx; o.y = y; p.yt = y; p.jy = 0; p.jv = 0; p.wy = 0; p.gy = 0; p.sihir = false;
  }
}
OLAY.on('agac', pfFinalBasla);
OLAY.on('durum', d => { if (d === 'final') pfFinalBasla(); });

// Test için (yalnız inceleme): window.pfTest
window.pfTest = { uyandir: o => pfUyandir(o, false), final: pfFinalBasla, iz: pfIz, kuyruk: pfKuyruk, parca: pfP, huy: pfHuyBasla, get spr() { return PF_SPR.size; } };

// ── Efekt katmanı: pırıltılar / z'ler / yapraklar, ekranda hiç Pofuduk olmasa bile çizilsin (görünmez yardımcı nesne;
//    her karede kameranın ortasına taşınır, böylece oyun.js'in ekran dışı elemesine takılmaz; listenin sonunda → en üstte) ──
TUR.kaydet('pfFx', {
  guncelle(o, dt) {
    pfKareBasi(dt);
    if (typeof cam !== 'undefined') { o.x = cam.x + VW / 2; o.y = cam.y + VH / 2; }
  },
  // finalde dansçılar: ağacın ÖNÜNDE (ağaç listede onlardan sonra geliyor), Feza'nın ARKASINDA; önce Büyük Pofuduk, sonra küçükler
  ciz(o, tm) {
    const F = pfFinal; if (!F) return;
    const x0 = cam.x - 160, x1 = cam.x + VW + 160;
    if (F.buyuk && F.buyuk.x > x0 - 100 && F.buyuk.x < x1 + 100) pfBuyukCiz(F.buyuk, tm);
    // yaydaki derinlik sırası: dıştakiler (geridekiler) önce, Feza'nın yanındakiler en son (en önde)
    const L = F.cizL || (F.cizL = F.kucuk.slice());
    for (let i = 1; i < L.length; i++) { const a = L[i], da = a.pf.derin || 0; let j = i - 1; while (j >= 0 && (L[j].pf.derin || 0) < da) { L[j + 1] = L[j]; j--; } L[j + 1] = a; }
    for (const k of L) if (k.x > x0 && k.x < x1) pfKucukCiz2(k, k.pf, PF_CZ, tm);
  },
  cizOn(o, tm) { pfIsitAdim(); pfParcaCiz(); },
});
NESNELER.push({ tip: 'pfFx', x: 0, y: 0, id: 'pfFx' });

// ── Güvenlik: bir Pofuduk'taki hata asla bütün kareyi bozmasın (hata bir kez günlüğe yazılır, çizim durumu geri yüklenir) ──
(() => {
  const goruldu = new Set();
  const yaz = (ad, e) => { const k = ad + ':' + (e && e.message); if (!goruldu.has(k)) { goruldu.add(k); console.error('[pofuduk ' + ad + ']', e); } };
  for (const tip of ['pofuduk', 'buyukPofuduk', 'pfFx']) {
    const h = TUR.al(tip); if (!h) continue;
    for (const m of ['kur', 'guncelle', 'ustune', 'dokun']) {
      const f = h[m]; if (typeof f !== 'function') continue;
      h[m] = function (a, b) { try { return f.call(this, a, b); } catch (e) { yaz(tip + '.' + m, e); } };
    }
    for (const m of ['ciz', 'cizOn']) {
      const f = h[m]; if (typeof f !== 'function') continue;
      h[m] = function (a, b) {
        g.save();
        try { f.call(this, a, b); } catch (e) { yaz(tip + '.' + m, e); }
        g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      };
    }
  }
})();

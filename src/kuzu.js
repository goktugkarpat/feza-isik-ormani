/* kuzu.js – Bölüm 3 "Bulut Ülkesi": Bulut Kuzucukları (davranış + çizim). POF ajanı, önek kz. Sözleşme: src/BOLUM3.md.
   nesne('kuzu', c, y, {r?}) – y = ayakların bastığı zemin (yakındaki zemine kendisi oturur).
   Durumlar (o.kz.durum):
     'uzgun'   gri, solgun, uykulu-mahzun: yavaş nefes, ara ara iç çekme, minik titreme, gökyüzüne bakıp kulak düşürme.
               Feza yaklaşınca umutla ona döner (hafif ışıltı: "bana dokun").
     'sarilma' Feza dokununca (o.r≈70): ona sokulur → ışıltılı "pof" → renk dalgası yünü boyar (bulunma sırasıyla gökkuşağı rengi).
     'sevinc'  üç sevinç zıplaması (ortadaki havada takla) → 'takip'
     'takip'   Feza'nın izinde sürü (bulunma sırasıyla: kırmızı en önde). Birbirine / Feza'ya binmez; boşluk, yükseklik ya da
               araya giren biri varsa yumuşak bir yayla süzülerek geçer (bulutturlar); uzak kalan hızlanarak yetişir (ışınlanma yok).
               Feza dururken: bulut otlar, kulak sallar, birbirine tos vurur, zıplar, ara sıra "mee".
     'ucus'    P.ucus doluyken Pırıl'ın arkasında kuyruk olup uçar.
     'yay'     OLAY 'gokkusagiBasla' → gökkuşağındaki yerine süzülür, rengiyle parlar, gökkuşağı dalgası dansı.
   Olaylar: OLAY 'kuzu' {o, renkI} (dokununca), 'kuzuYayda' {o, renkI, x, y} (gökkuşağındaki yerine varınca).
            AU.sfx('kuzuRenk', renkI) (renk dalgası anı), AU.sfx('kuzuMee') (ara sıra, ekrandayken; en sık ≈5 sn'de bir).
   Çizim: yün gövde, baş ve kuyruk sprite'ları önbellekli (renk × tohum, çözünürlüğe göre); kare başına birkaç drawImage + küçük
   vektör parçalar (göz, kulak, bacak, ağız). Korkutucu hiçbir şey yok: gözyaşı yok, yalnız solgun ve mahzun. */
'use strict';

// ── renkler ── (pastel ama doygun; i = ışıltı rengi, y = yanak)
const KZ_RENK = [
  { a: '#ff7a7a', l: '#ffe4e0', d: '#d4404f', y: '#ff5f7a', i: '#ff9a96' },   // 0 kırmızı
  { a: '#ffb36e', l: '#fff1e2', d: '#e07d38', y: '#ff7a7a', i: '#ffc890' },   // 1 turuncu
  { a: '#ffdc62', l: '#fffbe2', d: '#d6a72c', y: '#ff9480', i: '#ffec96' },   // 2 sarı
  { a: '#8fdc8a', l: '#effde8', d: '#4ea860', y: '#ff94a4', i: '#acf2a4' },   // 3 yeşil
  { a: '#7cc4ff', l: '#eaf6ff', d: '#3f88d6', y: '#ff94b4', i: '#a2d8ff' },   // 4 mavi
  { a: '#6f7ce6', l: '#e6e9ff', d: '#3c44a6', y: '#ff94c6', i: '#98a4ff' },   // 5 lacivert
  { a: '#c492f0', l: '#f7edff', d: '#8b56c8', y: '#ff8cc6', i: '#dab4ff' },   // 6 mor
];
// gökteki yayla aynı renkler (dunya3.js DN3_RB ya da bulut.js BU_GK varsa ana renk oradan; açık/koyu tonlar ondan türetilir)
(() => {
  const RB = typeof DN3_RB !== 'undefined' && DN3_RB && DN3_RB.length >= 7 ? DN3_RB : typeof BU_GK !== 'undefined' && BU_GK && BU_GK.length >= 7 ? BU_GK : null;
  if (!RB) return;
  const m = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + [0, 1, 2].map(i => Math.round(A[i] + (B[i] - A[i]) * t).toString(16).padStart(2, '0')).join(''); };
  for (let i = 0; i < 7; i++) {
    const a = RB[i]; if (typeof a !== 'string' || a.length !== 7) continue;
    const p = KZ_RENK[i];
    p.a = m(a, '#ffffff', 0.12); p.l = m(a, '#ffffff', 0.84); p.d = m(a, '#4a3470', 0.3); p.i = m(a, '#ffffff', 0.35);
  }
})();
const KZ_GRI = { a: '#b4b1c0', l: '#f0eff5', d: '#7b788c', y: '#d8b9c8', i: '#dcd8ea' };
const KZ_GOZ = '#2f2542', KZ_AGIZ = '#7a3d62', KZ_AGIZIC = '#d9668f', KZ_DIL = '#ffb3c8';
function kzRgba(h, a) { const c = hex(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
function kzMix(a, b, t) { const A = hex(a), B = hex(b); return '#' + [0, 1, 2].map(i => Math.round(lerp(A[i], B[i], t)).toString(16).padStart(2, '0')).join(''); }
function kzPalHazir(p, gri) {   // yüz, kulak içi, bacak, tırnak renkleri (bir kez)
  p.f = gri ? kzMix('#e3e1ea', p.a, 0.1) : kzMix('#fff6f0', p.a, 0.15);
  p.fd = kzMix(p.f, p.d, 0.4);
  p.ic = gri ? '#cdbfcb' : kzMix('#ffbfd0', p.a, 0.18);
  p.bac = kzMix(p.f, p.d, 0.2);
  p.tir = kzMix(p.d, '#5a4a6a', 0.45);
  p.bac2 = kzMix(p.bac, p.d, 0.25);   // uzaktaki bacaklar
  p.kul = kzMix(p.f, p.a, gri ? 0.3 : 0.4);   // kulak dışı
  p.kulK = kzRgba(p.d, 0.45);
}
kzPalHazir(KZ_GRI, true);
for (const p of KZ_RENK) kzPalHazir(p, false);

// ── boyutlar (dünya birimi; Feza 60 boyunda) ──
const KZ_BW = 54, KZ_BH = 38, KZ_BAC = 9, KZ_HW = 26, KZ_HH = 24;
const KZ_OLC = 0.84;        // sürüdekiler biraz küçülür (Feza'nın yanında kalabalık görünmesin)
const KZ_ARA = 56;          // sürüde iki kuzu arası (en az)
const KZ_FEZA = 54;         // Feza'ya en yakın
const KZ_ILK = 62;          // izde ilk kuzunun Feza'ya uzaklığı
const KZ_G = 1500;          // zıplama yerçekimi (görüntü)

// ── sprite önbelleği (çözünürlük: bu ekranda olabilecek en yakın görüşe göre; yakınlaştırmada boşaltılmaz) ──
let kzRes = 0, kzResH = -1, kzZMax = 0;
const KZ_SPR = new Map();
function kzResGuncel() {
  if (H !== kzResH || !kzZMax) {
    kzResH = H; kzZMax = 1;
    if (typeof BOLUM !== 'undefined' && BOLUM.kamera) for (const k of BOLUM.kamera) kzZMax = Math.max(kzZMax, k.zoom || 1);
    kzZMax *= (typeof OM_TABAN_ZOOM === 'number' ? OM_TABAN_ZOOM : 1) * 1.04;
  }
  const r = clamp(Math.round(Math.max(H / VH * kzZMax, S) * 2) / 2, 1, 3);
  if (r !== kzRes && H > 0) { kzRes = r; KZ_SPR.clear(); }
}
function kzTuval(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w * kzRes)); c.height = Math.max(1, Math.ceil(h * kzRes));
  c.ww = c.width / kzRes; c.wh = c.height / kzRes;
  return c;
}
// Bulut yünü: yuvarlak topaklardan kabarık bir bulut (birleşik daireler) + topak başına gölge/ışık + kıvırcık yün halkaları.
function kzYun(pal, w, h, seed) {
  const key = 'y' + pal.a + w + 'x' + h + ':' + seed;
  let c = KZ_SPR.get(key); if (c) return c;
  if (!(kzRes > 0)) kzResGuncel();
  if (!(kzRes > 0)) return null;
  const R = rng(seed), pad = Math.ceil(h * 0.14) + 3;
  c = kzTuval(w + pad * 2, h + pad * 2);
  const x = c.getContext('2d'); if (!x) return null;
  x.setTransform(kzRes, 0, 0, kzRes, c.width / 2, c.height / 2);
  const rx = w / 2, ry = h / 2, big = Math.max(rx, ry);
  const top = [], N = clamp(Math.round(w / 4.6), 7, 14), a0 = R() * 6.283;
  for (let i = 0; i < N; i++) {
    const a = a0 + (i + (R() - 0.5) * 0.35) * 6.283 / N, sn = Math.sin(a), alt = sn > 0.5;
    const rb = ry * (alt ? 0.4 : 0.48 + R() * 0.16);
    top.push({ x: Math.cos(a) * (rx - rb * 0.95), y: sn * (ry - rb * (alt ? 1 : 0.92)), r: rb, alt });
  }
  const ic = [];
  for (let i = 0; i < 4; i++) ic.push({ x: (R() - 0.5) * rx * 0.9, y: (R() - 0.65) * ry * 0.7, r: ry * (0.36 + R() * 0.14) });
  const sil = new Path2D();
  sil.ellipse(0, 0, rx * 0.84, ry * 0.8, 0, 0, 6.283);
  for (const q of top) { sil.moveTo(q.x + q.r, q.y); sil.arc(q.x, q.y, q.r, 0, 6.283); }
  // yumuşak dış hare (bulut kenarı)
  x.save(); x.scale(1.04, 1.06); x.fillStyle = kzRgba(pal.a, 0.22); x.fill(sil); x.restore();
  let gr = x.createRadialGradient(-rx * 0.28, -ry * 0.55, 0, -rx * 0.05, -ry * 0.1, big * 1.25);
  gr.addColorStop(0, pal.l); gr.addColorStop(0.42, pal.a); gr.addColorStop(0.86, kzMix(pal.a, pal.d, 0.55)); gr.addColorStop(1, pal.d);
  x.fillStyle = gr; x.fill(sil);
  x.save(); x.clip(sil);
  const topak = (q, golge, isik) => {
    let g2 = x.createRadialGradient(q.x, q.y, q.r * 0.5, q.x, q.y, q.r * 1.06);
    g2.addColorStop(0, kzRgba(pal.d, 0)); g2.addColorStop(0.8, kzRgba(pal.d, golge)); g2.addColorStop(1, kzRgba(pal.d, 0));
    x.fillStyle = g2; x.beginPath(); x.arc(q.x, q.y, q.r * 1.06, 0, 6.283); x.fill();
    const lum = clamp(-q.x / rx * 0.4 - q.y / ry * 0.8, -1, 1);
    g2 = x.createRadialGradient(q.x - q.r * 0.3, q.y - q.r * 0.38, 0, q.x - q.r * 0.3, q.y - q.r * 0.38, q.r * 0.82);
    g2.addColorStop(0, kzRgba(pal.l, isik + Math.max(0, lum) * 0.42)); g2.addColorStop(1, kzRgba(pal.l, 0));
    x.fillStyle = g2; x.fillRect(q.x - q.r * 1.15, q.y - q.r * 1.2, q.r * 1.7, q.r * 1.7);
  };
  for (const q of ic) topak(q, 0.1, 0.16);
  top.sort((a, b) => b.y - a.y);   // alttakiler önce: üstteki topaklar onların üstüne biner
  for (const q of top) topak(q, q.alt ? 0.12 : 0.2, 0.22);
  // kıvırcık yün halkaları (yumuşak, düşük kontrast)
  x.lineCap = 'round';
  const K = Math.round(w * h / 90);
  for (let i = 0; i < K; i++) {
    let u, v; do { u = R() * 2 - 1; v = R() * 2 - 1; } while (u * u + v * v > 0.8);
    const px = u * rx, py = v * ry, rr = 1.5 + R() * 2.1, a = R() * 6.283, lum = -u * 0.5 - v * 0.9 + (R() - 0.5) * 0.6;
    x.lineWidth = 0.9 + R() * 0.4;
    x.strokeStyle = lum > 0 ? kzRgba(pal.l, 0.34) : kzRgba(pal.d, 0.14);
    x.beginPath(); x.arc(px, py, rr, a, a + 3.4 + R()); x.stroke();
  }
  gr = x.createLinearGradient(0, ry * 0.05, 0, ry * 1.02);
  gr.addColorStop(0, kzRgba(pal.d, 0)); gr.addColorStop(1, kzRgba(pal.d, 0.42));
  x.fillStyle = gr; x.fillRect(-rx * 1.2, ry * 0.05, w * 1.2, ry);
  gr = x.createLinearGradient(0, -ry * 1.05, 0, ry * 0.15);
  gr.addColorStop(0, kzRgba(pal.l, 0.6)); gr.addColorStop(1, kzRgba(pal.l, 0));
  x.strokeStyle = gr; x.lineWidth = clamp(ry * 0.22, 2, 6); x.stroke(sil);
  x.restore();
  KZ_SPR.set(key, c); return c;
}
// Baş: yumuşak krem yüz (renkli kuzuda hafif renk ışıltılı) + alnında yün perçemi. Gözler/ağız/kulaklar ayrı (oynar).
function kzBas(pal) {
  const key = 'b' + pal.a;
  let c = KZ_SPR.get(key); if (c) return c;
  if (!(kzRes > 0)) kzResGuncel();
  if (!(kzRes > 0)) return null;
  const hw = KZ_HW / 2, hh = KZ_HH / 2;
  c = kzTuval(KZ_HW + 12, KZ_HH + 16);
  const x = c.getContext('2d'); if (!x) return null;
  x.setTransform(kzRes, 0, 0, kzRes, c.width / 2, c.height / 2);   // (0,0) = yüz merkezi
  // yüz: üstü biraz geniş, çenesi yuvarlak
  const yuz = new Path2D();
  yuz.moveTo(0, -hh);
  yuz.bezierCurveTo(hw * 0.9, -hh, hw * 1.05, -hh * 0.2, hw * 0.92, hh * 0.3);
  yuz.bezierCurveTo(hw * 0.8, hh * 0.95, hw * 0.35, hh * 1.02, 0, hh * 1.02);
  yuz.bezierCurveTo(-hw * 0.35, hh * 1.02, -hw * 0.8, hh * 0.95, -hw * 0.92, hh * 0.3);
  yuz.bezierCurveTo(-hw * 1.05, -hh * 0.2, -hw * 0.9, -hh, 0, -hh);
  x.save(); x.scale(1.06, 1.06); x.fillStyle = kzRgba(pal.fd, 0.25); x.fill(yuz); x.restore();
  let gr = x.createRadialGradient(-hw * 0.25, -hh * 0.35, 0, 0, 0, hw * 1.25);
  gr.addColorStop(0, kzMix(pal.f, '#ffffff', 0.55)); gr.addColorStop(0.55, pal.f); gr.addColorStop(1, pal.fd);
  x.fillStyle = gr; x.fill(yuz);
  x.save(); x.clip(yuz);
  gr = x.createRadialGradient(0, hh * 0.5, 0, 0, hh * 0.5, hw * 0.6);   // burun-ağız bölgesi: biraz daha açık
  gr.addColorStop(0, kzRgba('#ffffff', 0.38)); gr.addColorStop(1, kzRgba('#ffffff', 0));
  x.fillStyle = gr; x.fillRect(-hw, 0, hw * 2, hh * 1.2);
  gr = x.createLinearGradient(0, hh * 0.3, 0, hh * 1.05);
  gr.addColorStop(0, kzRgba(pal.fd, 0)); gr.addColorStop(1, kzRgba(pal.fd, 0.35));
  x.fillStyle = gr; x.fillRect(-hw, hh * 0.3, hw * 2, hh);
  x.restore();
  // perçem: alında birkaç yün topağı
  const T5 = [[-0.5, -0.78, 0.36], [-0.17, -0.98, 0.4], [0.2, -0.95, 0.38], [0.52, -0.72, 0.32], [0.02, -0.66, 0.34]];
  const pc = new Path2D();
  for (const t of T5) { const px = t[0] * hw, py = t[1] * hh, r = t[2] * hw; pc.moveTo(px + r, py); pc.arc(px, py, r, 0, 6.283); }
  gr = x.createRadialGradient(-hw * 0.3, -hh * 1.2, 0, 0, -hh * 0.7, hw * 1.1);
  gr.addColorStop(0, pal.l); gr.addColorStop(0.5, pal.a); gr.addColorStop(1, kzMix(pal.a, pal.d, 0.6));
  x.fillStyle = gr; x.fill(pc);
  for (const t of T5) {
    const px = t[0] * hw, py = t[1] * hh, r = t[2] * hw;
    const g2 = x.createRadialGradient(px - r * 0.3, py - r * 0.35, 0, px - r * 0.3, py - r * 0.35, r * 0.8);
    g2.addColorStop(0, kzRgba(pal.l, 0.7)); g2.addColorStop(1, kzRgba(pal.l, 0));
    x.fillStyle = g2; x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  x.lineWidth = 0.8; x.strokeStyle = kzRgba(pal.d, 0.25); x.stroke(pc);
  KZ_SPR.set(key, c); return c;
}
function kzSprAl(k) {   // kuzunun sprite'ları (çözünürlük değişince yeniden)
  if (k.sprRes === kzRes && k.spr0) return;
  k.sprRes = kzRes;
  k.spr0 = kzYun(KZ_GRI, KZ_BW, KZ_BH, k.seed); k.bas0 = kzBas(KZ_GRI); k.kuy0 = kzYun(KZ_GRI, 13, 12, k.seed + 5);
  k.spr1 = k.bas1 = k.kuy1 = null;
  if (k.pal) { k.spr1 = kzYun(k.pal, KZ_BW, KZ_BH, k.seed); k.bas1 = kzBas(k.pal); k.kuy1 = kzYun(k.pal, 13, 12, k.seed + 5); }
  if (!k.spr0 || !k.bas0 || (k.pal && !k.spr1)) k.sprRes = 0;   // tuval henüz hazır değil: sonra yeniden dene
}

// ── zemin yardımcıları ──
let kzZeminN = null;   // son kzZeminBul'un bulduğu cisim (yüzen bulut vb.) ya da null
function kzZeminBul(x, y, yukari, asagi) {   // [y-yukari, y+asagi] aralığındaki en üst yüzey (yoksa null)
  let best = null; kzZeminN = null;
  const tx = Math.floor(x / T);
  if (tx >= 0 && tx < COLS) {
    const t0 = Math.max(1, Math.floor((y - yukari) / T)), t1 = Math.min(ROWS - 1, Math.floor((y + asagi) / T));
    for (let ty = t0; ty <= t1; ty++) {
      const c = grid[ty][tx];
      if ((c === 1 && grid[ty - 1][tx] !== 1) || c === 2) { const yy = ty * T; if (yy >= y - yukari && yy <= y + asagi) { best = yy; break; } }
    }
  }
  if (typeof CISIMLER !== 'undefined') for (let i = 0; i < CISIMLER.length; i++) {
    const n = CISIMLER[i], c = n.cisim;
    if (!c || !c.aktif || c.tip === 'ziplat' || n.tip === 'kuzu' || Math.abs(n.x - x) > c.w / 2 - 4) continue;
    const top = n.y - c.h;
    if (top >= y - yukari && top <= y + asagi && (best === null || top < best)) { best = top; kzZeminN = n; }
  }
  return best;
}
function kzKati(x, y) { const tx = Math.floor(x / T), ty = Math.floor(y / T); return ty >= 0 && ty < ROWS && (tx < 0 || tx >= COLS || grid[ty][tx] === 1); }
function kzAltZeminVar(x, y) {   // bu sütunda y'nin altında herhangi bir zemin var mı (boşluğun üstünde değil mi)
  const tx = Math.floor(x / T);
  if (tx >= 0 && tx < COLS) for (let ty = Math.max(0, Math.floor(y / T)); ty < ROWS; ty++) if (grid[ty][tx]) return true;
  if (typeof CISIMLER !== 'undefined') for (const n of CISIMLER) { const c = n.cisim; if (c && c.aktif && n.tip !== 'kuzu' && Math.abs(n.x - x) < c.w / 2 && n.y - c.h >= y - 4) return true; }
  return false;
}
function kzArasiBos(x0, y0, x1, y1) {   // yürünecek düz yolda zemin kopuyorsa true (o zaman süzülür)
  const n = Math.ceil(Math.abs(x1 - x0) / 16);
  for (let i = 1; i < n; i++) { const u = i / n; if (kzZeminBul(lerp(x0, x1, u), lerp(y0, y1, u), 16, 16) === null) return true; }
  return false;
}
function kzEkranda(o, pay = 0) {
  if (typeof cam === 'undefined') return false;
  const z = cam.zoom || 1;
  return o.x > cam.x - pay && o.x < cam.x + VW + pay && o.y > cam.y - 60 - pay && o.y < cam.y + VH / z + 60 + pay;
}

// ── parçacıklar: bulut pofları (nefes, iç çekme, süzülme izi, otlanan bulut kırıntıları). Pırıltılar pofuduk.js'in pfPirilti'si ──
const kzP = [];
function kzPuf(x, y, vx, vy, life, s, col, al) {
  if (kzP.length > 110) return;
  kzP.push({ x, y, vx, vy, life, max: life, s, col: col || '#ffffff', al: al === undefined ? 0.6 : al, ph: Math.random() * 6.283 });
}
function kzIsilti(x, y, n, cols, hiz, omur, boy, yon, yay) {
  if (typeof pfPirilti === 'function') pfPirilti(x, y, n, cols, hiz, omur, boy, yon === undefined ? null : yon, yay === undefined ? 6.283 : yay);
}
function kzParcaGuncelle(dt) {
  for (let i = kzP.length - 1; i >= 0; i--) {
    const q = kzP[i]; q.life -= dt;
    if (q.life <= 0) { kzP.splice(i, 1); continue; }
    q.ph += dt;
    q.vx *= Math.exp(-dt * 2.2); q.vy = q.vy * Math.exp(-dt * 2.2) - 10 * dt;
    q.x += q.vx * dt; q.y += q.vy * dt;
  }
}
function kzParcaCiz() {
  for (const q of kzP) {
    const a = q.life / q.max, gir = Math.min(1, (q.max - q.life) * 7), s = q.s * (0.6 + 0.65 * (1 - a));
    const al = q.al * a * gir;
    if (al < 0.01) continue;
    g.globalAlpha = al; g.fillStyle = q.col;
    g.beginPath();
    g.arc(q.x - s * 0.42, q.y + s * 0.08, s * 0.4, 0, 6.283);
    g.moveTo(q.x + s * 0.5, q.y); g.arc(q.x, q.y - s * 0.12, s * 0.5, 0, 6.283);
    g.moveTo(q.x + s * 0.8, q.y + s * 0.1); g.arc(q.x + s * 0.44, q.y + s * 0.1, s * 0.36, 0, 6.283);
    g.fill();
  }
  g.globalAlpha = 1;
}
function kzPof(x, y, pal, buyuk) {   // ışıltılı "pof": bulut halkası + pırıltılar
  const n = buyuk ? 10 : 6;
  for (let i = 0; i < n; i++) { const a = i / n * 6.283 + Math.random() * 0.3, v = (buyuk ? 120 : 80) + Math.random() * 40; kzPuf(x + Math.cos(a) * 10, y + Math.sin(a) * 7, Math.cos(a) * v, Math.sin(a) * v * 0.6, 0.7 + Math.random() * 0.3, buyuk ? 11 : 8, '#ffffff', 0.7); }
  kzIsilti(x, y, buyuk ? 16 : 7, ['#ffffff', pal.i, '#fff3b0', pal.a], buyuk ? 220 : 120, buyuk ? 0.95 : 0.6, buyuk ? 11 : 8);
}

// ── sürü ──
const kzSuru = [];       // renklenip peşe takılanlar (katılma sırasıyla)
let kzRenkSira = 0, kzTohum = 0, kzYay = null, kzMeeT = 2, kzSon = -1, kzFxVar = false, kzUcVardi = false, kzEtkT = 4;
const KZ_SLOT = [];
const kzIz = [];         // Feza'nın yürüdüğü zemin izi {x, y, yer, bos}
let kzIzBos = true;
const kzUcIz = [];       // uçuşta Pırıl'ın izi {x, y}
function kzIzGuncelle() {
  if (P.ucus || P.fade > 0 || !kzAltZeminVar(P.x, P.y)) { kzIzBos = true; return; }
  const L = kzIz.length, son = L ? kzIz[L - 1] : null;
  if (son && Math.abs(P.x - son.x) + Math.abs(P.y - son.y) < 8) { if (P.ground) son.yer = true; return; }
  kzIz.push({ x: P.x, y: P.y, yer: P.ground, bos: kzIzBos || !son || Math.hypot(P.x - son.x, P.y - son.y) > 80 });
  kzIzBos = false;
  let d = 0;
  for (let i = kzIz.length - 1; i > 0; i--) {
    if (!kzIz[i].bos) d += Math.hypot(kzIz[i].x - kzIz[i - 1].x, kzIz[i].y - kzIz[i - 1].y);
    if (d > 1500) { kzIz.splice(0, i - 1); break; }
  }
  if (kzIz.length > 600) kzIz.splice(0, kzIz.length - 600);
}
// iz boyunca Feza'dan geriye 8 birimde bir örnek (boşluk segmentleri sıfır uzunlukta): f(x, y, d) true dönerse durur
function kzIzTara(f) {
  let i = kzIz.length - 1; if (i < 0) return;
  let px, py, acc = 0, sonraki = 0, bosOnce;
  if (kzIzBos) { const q = kzIz[i]; px = q.x; py = q.y; bosOnce = q.bos; i--; }
  else { px = P.x; py = P.y; bosOnce = false; }
  for (; i >= 0; i--) {
    const q = kzIz[i];
    if (bosOnce) {
      if (Math.abs(q.x - px) + Math.abs(q.y - py) > 420) return;   // kurtarılma / büyük atlama: iz burada biter
      px = q.x; py = q.y; bosOnce = q.bos; continue;
    }
    const sl = Math.hypot(q.x - px, q.y - py);
    while (sonraki <= acc + sl) {
      const k = sl > 0 ? (sonraki - acc) / sl : 0;
      if (f(lerp(px, q.x, k), lerp(py, q.y, k), sonraki)) return;
      sonraki += 8;
    }
    acc += sl; px = q.x; py = q.y; bosOnce = q.bos;
  }
}
const kzEngel = [];
function kzEngelKur() {
  kzEngel.length = 0;
  for (const n of NESNELER) {
    if (Math.abs(n.x - P.x) > 1100) continue;
    if ((n.tip === 'kuzu' && n.kz && n.kz.durum === 'uzgun') || n.tip === 'tohum' || n.tip === 'bulutSekil' || n.tip === 'ucusKapisi') kzEngel.push(n);
  }
}
function kzYerUygun(x, y, kadar) {
  if (Math.abs(x - P.x) < KZ_FEZA && Math.abs(y - P.y) < 64) return false;
  for (const e of kzEngel) if (Math.abs(e.x - x) < 46 && Math.abs(e.y - y) < 64) return false;
  if (typeof D !== 'undefined' && Math.abs(D.x - x) < 40 && D.y > y - 100 && D.y < y + 20) return false;   // Pırıl alçaktaysa
  for (let j = 0; j < kadar; j++) { const s = KZ_SLOT[j]; if (s.var && Math.abs(s.x - x) < KZ_ARA && Math.abs(s.y - y) < 44) return false; }
  return true;
}
let kzSlotT = 0, kzSlotX = 0, kzSlotY = 0, kzSlotF = 0, kzSlotN = 0;
function kzSlotHesapla(dt) {
  const n = kzSuru.length; if (!n) return;
  for (let i = 0; i < n; i++) if (!KZ_SLOT[i]) KZ_SLOT[i] = { x: P.x, y: P.y, yer: true, var: false };
  const bekle = P.idle > 0.8 && P.ground && !P.ucus;
  if (bekle) {   // beklerken yerler titreşmesin: ≈0,7 sn'de bir ya da Feza kıpırdayınca
    kzSlotT -= dt;
    if (kzSlotT > 0 && kzSlotN === n && Math.abs(P.x - kzSlotX) < 6 && Math.abs(P.y - kzSlotY) < 6 && P.f === kzSlotF) return;
    kzSlotT = 0.7; kzSlotX = P.x; kzSlotY = P.y; kzSlotF = P.f; kzSlotN = n;
  } else kzSlotT = 0;
  kzEngelKur();
  for (let i = 0; i < n; i++) KZ_SLOT[i].var = false;
  let i = 0, dMin = KZ_ILK;
  kzIzTara((x, y, d) => {
    if (d > 1300) return true;
    if (d < dMin) return false;
    const ys = kzZeminBul(x, y, 8, 40); if (ys === null) return false;
    if (!kzYerUygun(x, ys, i)) return false;
    const s = KZ_SLOT[i]; s.x = x; s.y = ys; s.yer = true; s.var = true; i++; dMin = d + 30;
    return i >= n;
  });
  // iz yetmezse (bölüm başı, kurtarılma, uçuş sonrası): Feza'nın çevresinde, önce arkasında, aynı zeminde
  for (; i < n; i++) {
    const s = KZ_SLOT[i];
    for (let m = 0; m < 18 && !s.var; m++) {
      const yonu = m % 2 === 0 ? -P.f : P.f, kat = m >> 1;
      const x = P.x + yonu * (KZ_FEZA + 6 + kat * KZ_ARA), ys = kzZeminBul(x, P.y, 40, 50);
      if (ys !== null && kzYerUygun(x, ys, i)) { s.x = x; s.y = ys; s.yer = true; s.var = true; }
    }
    if (!s.var) { s.x = P.x - P.f * (72 + i * 46); s.y = P.y - 70 - (i % 2) * 36; s.yer = false; s.var = true; }   // hiç yer yok: küçük bir bulut gibi havada bekler
  }
}
function kzUcIzGuncelle() {
  const L = kzUcIz.length, son = L ? kzUcIz[L - 1] : null;
  if (son && Math.abs(P.x - son.x) + Math.abs(P.y - son.y) < 6) return;
  kzUcIz.push({ x: P.x, y: P.y });
  if (kzUcIz.length > 400) kzUcIz.splice(0, kzUcIz.length - 400);
}
const KZ_UH = { x: 0, y: 0 };
function kzUcIzNokta(d) {   // uçuş izinde Feza'dan d birim geride
  let i = kzUcIz.length - 1, px = P.x, py = P.y, acc = 0;
  for (; i >= 0; i--) {
    const q = kzUcIz[i], sl = Math.hypot(q.x - px, q.y - py);
    if (acc + sl >= d) { const k = sl > 0 ? (d - acc) / sl : 0; KZ_UH.x = lerp(px, q.x, k); KZ_UH.y = lerp(py, q.y, k); return KZ_UH; }
    acc += sl; px = q.x; py = q.y;
  }
  KZ_UH.x = px - (d - acc); KZ_UH.y = py; return KZ_UH;
}

function kzKareBasi(dt) {   // her karede bir kez
  if (kzSon === now) return;
  kzSon = now;
  kzResGuncel();
  kzParcaGuncelle(dt);
  kzMeeT -= dt;
  if (kzYay) kzYay.t += dt;
  const uc = !!P.ucus;
  if (uc) { if (!kzUcVardi) kzUcIz.length = 0; kzUcIzGuncelle(); }
  else if (kzUcVardi) { kzIz.length = 0; kzIzBos = true; kzSlotT = 0; }   // uçuş bitti: Feza yeni yerde
  kzUcVardi = uc;
  kzIzGuncelle();
  kzSlotHesapla(dt);
  kzEtkilesim(dt);
}

// ── yaylar (ezilme, kulak, kuyruk) ──
function kzYayFiz(k, dt) {
  const n = Math.min(8, Math.ceil(dt / 0.008)), h = dt / n;
  for (let i = 0; i < n; i++) {
    k.sqv += (-(k.sq - k.sqH) * 180 - k.sqv * 9) * h; k.sq += k.sqv * h;
    k.kulv += (-k.kul * 140 - k.kulv * 5.5) * h; k.kul += k.kulv * h;
    k.kuyv += (-k.kuy * 160 - k.kuyv * 5) * h; k.kuy += k.kuyv * h;
  }
  k.sq = clamp(k.sq, -0.2, 0.18); k.kul = clamp(k.kul, -1, 1); k.kuy = clamp(k.kuy, -1.2, 1.2); k.sqv = clamp(k.sqv, -12, 12);
}
function kzZipla(k, guc) { k.sqv += guc; k.kulv += guc * 1.5 * (Math.random() < 0.5 ? -1 : 1); k.kuyv += guc * 2; }
function kzHop(k, dt) {   // görüntü zıplaması (hy: eksi = yukarı)
  if (k.hy !== 0 || k.hv < 0) {
    k.hv += KZ_G * dt; k.hy += k.hv * dt;
    if (k.hy >= 0 && k.hv > 0) { k.hy = 0; k.hv = 0; kzZipla(k, 3); k.indi = true; }
  }
}
function kzMee(o, k, zorla) {
  if (!zorla && (kzMeeT > 0 || !kzEkranda(o))) return;
  kzMeeT = 5 + Math.random() * 5;
  k.meeT = 0.55;
  if (typeof AU !== 'undefined' && AU && AU.sfx) AU.sfx('kuzuMee');
}

// ── tür ──
TUR.kaydet('kuzu', {
  kur(o) {
    kzFxEkle();
    if (!o.r) o.r = 70;
    o.ry = 24; o.done = false;
    const yy = kzZeminBul(o.x, o.y, 40, 90); if (yy !== null) o.y = yy;
    const i = kzTohum++;
    o.kz = { durum: 'uzgun', t: Math.random() * 10, st: 0, seed: 300 + i * 53, renkI: -1, pal: null, sira: -1,
      f: Math.random() < 0.5 ? -1 : 1, yon: 0, yonH: 0, nefT: Math.random() * 4, icT: 2 + Math.random() * 6, ic: -1, titreT: 5 + Math.random() * 8, titre: -1,
      gokT: 3 + Math.random() * 7, gok: -1, umut: 0, umutMee: false, isT: 0,
      sq: 0, sqv: 0, sqH: 0, kul: 0, kulv: 0, kulA: 1.0, kuy: 0, kuyv: 0, bas: 0, basY: 0, basR: 0,
      hy: 0, hv: 0, wy: 0, gy: 0, faz: 0, rot: 0, takla: 0, ox: 0, oy: 0, titreX: 0, olc: 1, nef: 0,
      ac: 0.5, egim: 1, mutlu: 0, kirp: 0, kirpT: 1 + Math.random() * 3, bakX: 0, bakY: 0, agiz: 'uzgun', agizB: 0, yanak: 0.12, isilti: 0,
      hava: false, yayU: 1, ax: 0, ay: 0, aex: 0, aey: 0, alift: 0, tx: o.x, ty: o.y, vx: 0, vy: 0,
      renkU: 0, renkOx: 0, parla: 0, zemin: o.y, binek: null, meeT: 0, otla: 0, cigne: 0, tos: null, sevT: 0, hopN: 0,
      bos: 2 + Math.random() * 3, bakT: 0, onT: 0, kulT: 0, x0: o.x, yayVar: false,
      spr0: null, spr1: null, bas0: null, bas1: null, kuy0: null, kuy1: null, sprRes: 0 };
  },
  dokun(o) { kzSaril(o); },
  guncelle(o, dt) { kzKareBasi(dt); kzGuncelle(o, dt); },
  ciz(o, tm) { kzCiz(o, o.kz, tm); },
});

function kzSaril(o) {
  const k = o.kz; if (!k || o.done || k.durum !== 'uzgun') return;
  o.done = true;
  k.renkI = kzRenkSira++ % KZ_RENK.length; k.pal = KZ_RENK[k.renkI]; k.sprRes = 0;
  k.durum = 'sarilma'; k.st = 0; k.yan = o.x >= P.x ? 1 : -1; k.x0 = o.x; k.pofT = false;
  k.f = -k.yan; k.yonH = -k.yan;
  kzZipla(k, 4);
  OLAY.emit('kuzu', { o, renkI: k.renkI });
}

function kzGuncelle(o, dt) {
  const k = o.kz; if (!k) return;
  k.t += dt; k.st += dt;
  // göz kırpma
  k.kirpT -= dt;
  if (k.kirpT < 0) { const sn = k.durum === 'uzgun' ? 0.26 : 0.15; k.kirp = Math.sin(Math.PI * clamp(-k.kirpT / sn, 0, 1)); if (k.kirpT < -sn) { k.kirpT = (k.durum === 'uzgun' ? 2.6 : 2) + Math.random() * 3; k.kirp = 0; } }
  else k.kirp = 0;
  k.meeT = Math.max(0, k.meeT - dt);
  if (k.durum === 'takip' && P.ucus) { k.durum = 'ucus'; k.hava = true; k.yayU = 1; k.vx = 0; k.vy = 0; }
  else if (k.durum === 'ucus' && !P.ucus) { k.durum = 'takip'; k.hava = true; k.yayU = 1; k.hy = 0; k.hv = 0; }
  switch (k.durum) {
    case 'uzgun': kzUzgun(o, k, dt); break;
    case 'sarilma': kzSarilma(o, k, dt); break;
    case 'sevinc': kzSevinc(o, k, dt); break;
    case 'takip': kzTakip(o, k, dt); break;
    case 'ucus': kzUcus(o, k, dt); break;
    case 'yay': kzYayda(o, k, dt); break;
  }
  k.yon = lerp(k.yon, k.yonH, 1 - Math.exp(-dt * 8));
  const olcH = k.durum === 'uzgun' || k.durum === 'sarilma' ? 1 : KZ_OLC;
  k.olc = lerp(k.olc, olcH, 1 - Math.exp(-dt * 3));
  if (k.meeT > 0) { k.agiz = 'mee'; k.agizB = Math.sin(Math.PI * clamp(1 - k.meeT / 0.55, 0, 1)); }
  // gölge için alttaki zemin
  if (!k.hava && k.hy === 0) k.zemin = o.y;
  else { const z = kzZeminBul(o.x, o.y + k.hy - 10, 0, 160); k.zemin = z === null ? null : z; }
  kzYayFiz(k, dt);
}

// ── üzgün (gri) ──
function kzUzgun(o, k, dt) {
  const dx = P.x - o.x, d = Math.hypot(dx, (P.y - 30) - (o.y - 24));
  const yakin = DURUM === 'oyun' && d < 330 && P.fade <= 0;
  k.umut = lerp(k.umut, yakin ? 1 : 0, 1 - Math.exp(-dt * 3));
  if (yakin && !k.umutMee && d < 260) { k.umutMee = true; kzZipla(k, 2); kzMee(o, k); }
  // nefes (yavaş, ağır)
  k.nefT += dt; const per = 4.4, u = (k.nefT % per) / per;
  k.nef = u < 0.45 ? smooth(u / 0.45) : 1 - smooth((u - 0.45) / 0.55);
  let sqH = -0.02 * k.nef, basY = 3 - k.nef * 1.2, kulA = 1.05 + 0.05 * (1 - k.nef), ac = 0.5, egim = 1, bakY = 0.15, agiz = 'uzgun';
  // iç çekme: derin nefes al (başı kalkar, gözler kapanır), yavaşça bırak (bulutçuk), kulaklar biraz daha düşer
  k.icT -= dt;
  if (k.icT <= 0 && k.ic < 0 && k.titre < 0) { k.ic = 0; k.icT = 7 + Math.random() * 5; }
  if (k.ic >= 0) {
    k.ic += dt; const t = k.ic;
    const al = smooth(clamp(t / 0.8, 0, 1)), ver = smooth(clamp((t - 0.95) / 0.9, 0, 1));
    const e = al * (1 - ver);
    sqH = -0.07 * e + 0.05 * ver * (1 - smooth(clamp((t - 1.9) / 0.5, 0, 1)));
    basY = 3 - 4 * e + 3 * ver * (1 - smooth(clamp((t - 1.9) / 0.5, 0, 1)));
    kulA += -0.15 * e + 0.2 * ver * (1 - smooth(clamp((t - 2.0) / 0.6, 0, 1)));
    ac = lerp(0.5, 0.05, smooth(clamp((t - 0.3) / 0.4, 0, 1)) * (1 - smooth(clamp((t - 1.85) / 0.35, 0, 1))));
    bakY = -0.4 * e;
    agiz = t > 0.95 && t < 1.8 ? 'o' : 'uzgun';
    if (t > 1.0 && !k.icPuf) { k.icPuf = true; const fx = o.x + k.yon * KZ_BW * 0.48 * 0.72 + k.yon * 6; kzPuf(fx, o.y - 22, k.yon * 22 || 10, -8, 1.6, 7, '#eceaf4', 0.5); }
    if (t > 2.6) { k.ic = -1; k.icPuf = false; }
  }
  // gökyüzüne bakma (gökkuşağını arar), sonra genelde iç çeker
  k.gokT -= dt;
  if (k.gokT <= 0 && k.gok < 0 && k.ic < 0) { k.gok = 0; k.gokT = 9 + Math.random() * 8; }
  if (k.gok >= 0) {
    k.gok += dt; const e = smooth(clamp(k.gok / 0.5, 0, 1)) * (1 - smooth(clamp((k.gok - 1.7) / 0.5, 0, 1)));
    bakY = lerp(bakY, -1, e); basY -= 3 * e; ac = lerp(ac, 0.62, e); kulA -= 0.12 * e;
    if (k.gok > 2.2) { k.gok = -1; if (Math.random() < 0.7) k.icT = Math.min(k.icT, 0.3); }
  }
  // minik titreme (üşümüş gibi, çok hafif)
  k.titreT -= dt;
  if (k.titreT <= 0 && k.titre < 0 && k.ic < 0) { k.titre = 0; k.titreT = 9 + Math.random() * 7; }
  if (k.titre >= 0) {
    k.titre += dt; const e = Math.sin(Math.PI * clamp(k.titre / 0.6, 0, 1));
    k.titreX = Math.sin(k.titre * 70) * 0.9 * e; k.kul += Math.sin(k.titre * 55) * 0.02 * e;
    if (k.titre > 0.6) { k.titre = -1; k.titreX = 0; }
  } else k.titreX = 0;
  // Feza yakınsa: ona döner, gözleri biraz açılır (umut), kulaklar hafifçe kalkar
  if (k.umut > 0.05) {
    ac = lerp(ac, Math.max(ac, 0.72), k.umut); egim = lerp(egim, 0.55, k.umut); kulA -= 0.25 * k.umut; basY -= 1.5 * k.umut;
    if (k.gok < 0) bakY = lerp(bakY, clamp((P.y - 40 - (o.y - 30)) / 120, -0.8, 0.5), k.umut);
    k.bakX = lerp(k.bakX, clamp(dx / 150, -1, 1), 1 - Math.exp(-dt * 5));
    if (Math.abs(dx) > 8) k.f = dx < 0 ? -1 : 1;
    k.yonH = k.f * 0.75;
    // "bana dokun": başının üstünde ara ara süzülen minik ışıltı
    k.isT -= dt;
    if (k.isT <= 0 && d < 420) { k.isT = 1.1 + Math.random() * 0.5; kzIsilti(o.x + (Math.random() - 0.5) * 30, o.y - 52, 1, ['#ffffff', '#fff3b0'], 30, 0.9, 7, -Math.PI / 2, 0.8); }
  } else {
    k.bakX = lerp(k.bakX, 0, 1 - Math.exp(-dt * 2)); k.yonH = k.f * 0.45;
  }
  k.ac = lerp(k.ac, ac, 1 - Math.exp(-dt * 7)); k.egim = lerp(k.egim, egim, 1 - Math.exp(-dt * 4));
  k.basY = lerp(k.basY, basY, 1 - Math.exp(-dt * 6)); k.kulA = lerp(k.kulA, kulA, 1 - Math.exp(-dt * 4));
  k.sqH = sqH; k.bakY = lerp(k.bakY, bakY, 1 - Math.exp(-dt * 5));
  k.mutlu = 0; k.agiz = agiz; k.agizB = 0.3; k.yanak = 0.12; k.bas = 0; k.basR = 0; k.parla = 0;
}

// ── sarılma: ona sokulur → pof → renk dalgası ──
function kzSarilma(o, k, dt) {
  const t = k.st, yan = k.yan;
  const hedefX = P.x + yan * 25, yok = kzZeminBul(hedefX, o.y, 22, 22) === null || Math.abs(hedefX - k.x0) > 90;
  const gx = yok ? k.x0 + clamp(hedefX - k.x0, -30, 30) * 0.5 : hedefX;
  if (t < 0.32) {
    const u = smooth(t / 0.32);
    o.x = lerp(k.x0, gx, u); k.hy = -Math.sin(Math.PI * t / 0.32) * 13;
    k.mutlu = smooth(clamp(t / 0.2, 0, 1)); k.egim = lerp(k.egim, 0, 1 - Math.exp(-dt * 8)); k.ac = 0.8;
    k.kulA = lerp(k.kulA, 0.5, 1 - Math.exp(-dt * 8)); k.basY = lerp(k.basY, 0, 1 - Math.exp(-dt * 8));
    k.rot = -yan * 0.14 * u;
  } else {
    k.hy = 0;
    if (!yok) o.x = lerp(o.x, P.x + yan * 25, 1 - Math.exp(-dt * 8));
    if (!k.pofT) {
      k.pofT = true; kzZipla(k, -5);
      kzSprAl(k);
      k.renkOx = -yan * KZ_BW * 0.4;
      const px = o.x - yan * 12, py = o.y - 30;
      kzPof(px, py, k.pal, true);
      ripples.push({ x: px, y: py, r: 0, life: 1.6 });
      if (typeof AU !== 'undefined' && AU && AU.sfx) AU.sfx('kuzuRenk', k.renkI);
    }
    const s = t - 0.32;
    k.renkU = clamp(s / 0.95, 0, 1);
    // renk dalgasının önünde pırıltılar
    if (k.renkU > 0 && k.renkU < 1 && Math.random() < dt * 40) {
      const R0 = k.renkU * KZ_BW * 1.25, a = Math.random() * 6.283;
      const lx = k.renkOx + Math.cos(a) * R0, ly = Math.sin(a) * R0;
      if (Math.abs(lx) < KZ_BW * 0.5 && Math.abs(ly) < KZ_BH * 0.5) kzIsilti(o.x + lx, o.y - KZ_BAC - KZ_BH * 0.5 + ly, 1, ['#ffffff', k.pal.i, k.pal.l], 40, 0.5, 6);
    }
    const sar = smooth(clamp(s / 0.2, 0, 1)) * (1 - smooth(clamp((s - 0.85) / 0.2, 0, 1)));
    k.rot = -yan * (0.14 * sar + Math.sin(s * 9) * 0.035 * sar);
    k.sqH = 0.05 * sar;
    k.mutlu = 1; k.egim = 0; k.ac = 0.85;
    k.kulA = lerp(k.kulA, lerp(0.5, -0.15, k.renkU), 1 - Math.exp(-dt * 6));
    k.agiz = 'gulus'; k.agizB = 0.4;
  }
  k.yanak = lerp(k.yanak, 0.6, 1 - Math.exp(-dt * 4)); k.umut = lerp(k.umut, 0, 1 - Math.exp(-dt * 6));
  k.yonH = -yan * 0.85; k.bakX = -yan * 0.6; k.bakY = -0.2;
  if (t > 1.42) { k.durum = 'sevinc'; k.st = 0; k.hopN = 0; k.renkU = 1; k.rot = 0; k.sqH = 0; k.hv = -300; kzZipla(k, 4); }
}
// ── sevinç: üç zıplama (ortadaki takla) ──
function kzSevinc(o, k, dt) {
  k.mutlu = k.hy < -12 || k.st < 0.2 ? 1 : 0.9; k.agiz = 'acik'; k.agizB = 0.7; k.egim = 0; k.ac = 0.9; k.yanak = 0.6;
  k.kulA = lerp(k.kulA, -0.25, 1 - Math.exp(-dt * 8)); k.basY = lerp(k.basY, -1, 1 - Math.exp(-dt * 6));
  k.yonH = lerp(k.yonH, 0.25 * (P.x < o.x ? -1 : 1), 1 - Math.exp(-dt * 4));
  kzHop(k, dt);
  if (k.takla > 0) {   // ortadaki zıplamada havada bir takla
    k.takla += dt / 0.46;
    k.rot = -Math.sign(k.yonH || 1) * Math.PI * 2 * smooth(clamp(k.takla, 0, 1));
    if (k.takla >= 1) { k.takla = 0; k.rot = 0; }
  }
  if (k.indi) {
    k.indi = false; k.hopN++;
    kzIsilti(o.x, o.y - 6, 5, [k.pal.i, '#ffffff', k.pal.a], 100, 0.6, 7, -Math.PI / 2, 2.4);
    kzPuf(o.x - 16, o.y - 2, -30, -6, 0.6, 6); kzPuf(o.x + 16, o.y - 2, 30, -6, 0.6, 6);
    if (k.hopN === 1) { k.hv = -350; k.takla = 0.0001; kzZipla(k, 4); kzMee(o, k, true); }
    else if (k.hopN === 2) { k.hv = -230; kzZipla(k, 3); }
    else { k.durum = 'takip'; k.sira = kzSuru.length; kzSuru.push(o); k.ty = o.y; k.tx = o.x; k.bos = 1.5 + Math.random() * 2; }
  }
}

// ── sürü takibi ──
function kzTakip(o, k, dt) {
  const s = KZ_SLOT[k.sira];
  let tx = o.x, ty = o.y, yer = true;
  if (s && s.var) { tx = s.x; ty = s.y; yer = s.yer; }
  // yakında başka bir kuzu renklendi: sevinçle hopla
  if (k.sevT > 0) { k.sevT -= dt; if (k.sevT <= 0 && !k.hava && k.hy === 0) { k.hv = -260; kzZipla(k, 3); k.mutluT = 0.7; } }
  const bekle = P.idle > 1 && P.ground && P.fade <= 0;
  if (!bekle || k.hava) { k.otla = 0; if (k.tos && !k.tos.temas) k.tos = null; }
  kzGit(o, k, dt, tx, ty, yer);
  kzAyir(o, k, dt);
  const yerinde = !k.hava && k.hy === 0 && Math.abs(o.x - tx) < 6;
  // yüz ve duruş
  k.mutluT = Math.max(0, (k.mutluT || 0) - dt);
  k.egim = lerp(k.egim, 0, 1 - Math.exp(-dt * 5)); k.yanak = lerp(k.yanak, 0.5, 1 - Math.exp(-dt * 3)); k.parla = lerp(k.parla, 0.15, 1 - Math.exp(-dt * 3));
  let ac = 1, mutlu = k.mutluT > 0 ? 1 : 0, agiz = 'gulus', basY = -0.5, kulA = -0.05 + Math.sin(k.t * 1.3 + k.seed) * 0.05, bakX = clamp((P.x - o.x) / 140, -1, 1), bakY = 0;
  if (k.hava) { mutlu = 1; agiz = 'acik'; kulA = -0.35; }
  else if (Math.abs(o.x - tx) > 6) agiz = 'acik';
  // boşta küçük işler (Feza dururken)
  if (bekle && yerinde) {
    k.bos -= dt;
    if (k.bos <= 0 && !k.tos && k.otla <= 0) {
      k.bos = 2.6 + Math.random() * 4 + k.sira * 0.3;
      const r = Math.random();
      if (r < 0.38) { k.otla = 2.4 + Math.random() * 1.2; k.f = Math.random() < 0.5 ? -1 : 1; }
      else if (r < 0.58) { k.kulT = 0.7; }
      else if (r < 0.78) { k.hv = -230 - Math.random() * 60; kzZipla(k, 3); k.mutluT = 0.6; if (Math.random() < 0.45) kzMee(o, k); }
      else if (r < 0.9) { k.bakT = 1.8; }
      else { k.onT = 2.2; }
    }
  } else { k.bakT = 0; k.onT = 0; }
  if (k.otla > 0) {   // bulut otlamak: başını eğip bulut kırıntısı yer, çiğner
    k.otla -= dt;
    const e = smooth(clamp((2.4 - Math.max(0, k.otla - 0.4)) / 0.35, 0, 1)) * smooth(clamp(k.otla / 0.35, 0, 1));
    k.bas = lerp(k.bas, e, 1 - Math.exp(-dt * 8));
    k.cigne += dt;
    agiz = e > 0.5 && Math.sin(k.cigne * 13) > 0 ? 'o' : 'cigne'; ac = lerp(ac, 0.35, e); bakY = 0.8 * e; bakX = k.f * 0.5 * e;
    if (e > 0.6 && Math.random() < dt * 3) { const mx = o.x + k.yon * KZ_BW * 0.4 * k.olc + k.f * 8; kzPuf(mx, o.y - 3, k.f * 6, -14, 0.9, 3.5, '#ffffff', 0.7); }
    if (k.otla <= 0) { k.otla = 0; k.mutluT = 0.8; }
  } else k.bas = lerp(k.bas, 0, 1 - Math.exp(-dt * 6));
  if (k.kulT > 0) {   // kulak sallama: iki hızlı çırpış
    const eski = k.kulT; k.kulT -= dt;
    if ((eski > 0.65 && k.kulT <= 0.65) || (eski > 0.38 && k.kulT <= 0.38)) { k.kulv += 9 * (k.kulT > 0.5 ? 1 : -1); k.mutluT = Math.max(k.mutluT, 0.3); }
  }
  if (k.bakT > 0) { k.bakT -= dt; if (typeof D !== 'undefined') { bakX = clamp((D.x - o.x) / 80, -1, 1); bakY = clamp((D.y - (o.y - 40)) / 80, -1, 0.5); if (Math.abs(D.x - o.x) > 10) k.f = D.x < o.x ? -1 : 1; } agiz = 'o'; }
  // tos: yandaki arkadaşına doğru minik baş vuruşu
  if (k.tos) {
    const T0 = k.tos; T0.t += dt;
    const u = T0.t / 0.55;
    k.ox = T0.yon * 12 * Math.sin(Math.PI * Math.min(1, u)); k.basR = T0.yon * 0.15 * Math.sin(Math.PI * Math.min(1, u));
    k.f = T0.yon;
    if (!T0.temas && u > 0.45) {
      T0.temas = true; const q = T0.q.kz;
      kzZipla(q, 5); q.hv = -170; q.mutluT = 0.8; kzZipla(k, 5); k.mutluT = 0.8;
      const mx = (o.x + T0.q.x) / 2;
      kzIsilti(mx, o.y - 30, 6, ['#ffffff', k.pal.i, q.pal.i], 90, 0.6, 7, -Math.PI / 2, 2.4);
      kzPuf(mx, o.y - 28, 0, -20, 0.6, 6);
    }
    if (u >= 1) { k.tos = null; k.basR = 0; }
  } else { k.ox = lerp(k.ox, 0, 1 - Math.exp(-dt * 10)); k.basR = lerp(k.basR, 0, 1 - Math.exp(-dt * 8)); }
  if (k.onT > 0) { k.onT -= dt; mutlu = 1; }   // kameraya (Feza'ya) dönüp gülümser
  // yön: hareket ediyorsa gittiği yöne, beklerken Feza'ya; önden bakış ara sıra
  if (bekle && yerinde && !k.tos && k.otla <= 0 && k.bakT <= 0 && Math.abs(P.x - o.x) > 10) k.f = P.x < o.x ? -1 : 1;
  k.yonH = k.onT > 0 ? k.f * 0.08 : k.f;
  k.ac = lerp(k.ac, ac, 1 - Math.exp(-dt * 8)); k.mutlu = lerp(k.mutlu, mutlu, 1 - Math.exp(-dt * 12));
  k.agiz = agiz; k.agizB = 0.45;
  k.basY = lerp(k.basY, basY, 1 - Math.exp(-dt * 5)); k.kulA = lerp(k.kulA, kulA, 1 - Math.exp(-dt * 6));
  k.bakX = lerp(k.bakX, bakX, 1 - Math.exp(-dt * 6)); k.bakY = lerp(k.bakY, bakY, 1 - Math.exp(-dt * 6));
  k.umut = 0; k.titreX = 0;
  kzHop(k, dt); k.indi = false;
}
// Yay (süzülme) yolu: başlangıç → hedef; kontrol noktası ikisinin de üstünde; yol katı zemine değerse yükseltilir
function kzYayKur(k, x0, y0, x1, y1, enAz) {
  k.ax = x0; k.ay = y0; k.aex = x1; k.aey = y1; k.yayU = 0;
  let lift = Math.max(enAz || 0, Math.min(170, 28 + Math.abs(x1 - x0) * 0.16 + Math.max(0, y0 - y1) * 0.2));
  for (let it = 0; it < 10; it++) {
    let carp = false;
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - lift;
    for (let s = 1; s < 14 && !carp; s++) {
      const u = s / 14, v = 1 - u, bx = v * v * x0 + 2 * v * u * cx + u * u * x1, by = v * v * y0 + 2 * v * u * cy + u * u * y1;
      if (kzKati(bx, by - 10) || kzKati(bx, by - 36) || kzKati(bx - 22, by - 20) || kzKati(bx + 22, by - 20)) carp = true;
    }
    if (!carp) break;
    lift += 40;
  }
  k.alift = lift; k.aMin = enAz || 0;
}
// Yolda başka biri (Feza ya da yerinde duran bir kuzu) var mı: varsa üstünden süzülerek geçer
function kzEngelArada(o, k, tx) {
  if (Math.abs(tx - o.x) < 24) return 0;
  if ((P.x - o.x) * (tx - P.x) > 0 && Math.abs(P.y - o.y) < 70 && Math.abs(P.x - o.x) < Math.abs(tx - o.x)) return 86;
  for (const q of kzSuru) {
    if (q === o) continue;
    const z = q.kz;
    if (z.hava || Math.abs(q.y - o.y) > 22) continue;
    const ara = (q.x - o.x) * (tx - q.x) > 0 && Math.abs(q.x - o.x) > 6;
    if (!ara) continue;
    const kendiGidiyor = Math.abs(z.tx - q.x) > 30 && Math.sign(z.tx - q.x) === Math.sign(tx - o.x);
    if (!kendiGidiyor) return 58;
  }
  return 0;
}
function kzGit(o, k, dt, tx, ty, yer) {
  k.tx = tx; k.ty = ty;
  const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy);
  if (!k.hava) {
    let enAz = 0, ucmali = !yer || Math.abs(dy) > 14 || d > 300;
    if (!ucmali && Math.abs(dx) > 18) { enAz = kzEngelArada(o, k, tx); ucmali = enAz > 0 || kzArasiBos(o.x, o.y, tx, ty); }
    if (ucmali && d > 10 && k.hy === 0) {
      k.hava = true; k.hv = 0; k.binek = null;
      kzYayKur(k, o.x, o.y, tx, ty, enAz);
      kzZipla(k, 3.5);
      kzPuf(o.x, o.y - 4, -Math.sign(dx) * 30, -4, 0.7, 7);
    }
  }
  if (k.hava) {
    k.wy = lerp(k.wy, 0, 1 - Math.exp(-dt * 10));
    if (k.yayU < 1) {
      if (Math.abs(tx - k.aex) + Math.abs(ty - k.aey) > 50) kzYayKur(k, o.x, o.y, tx, ty, k.aMin);
      else { k.aex = tx; k.aey = ty; }
      const L = Math.hypot(k.aex - k.ax, k.aey - k.ay) + k.alift * 1.3 + 1;
      const v = clamp(240 + L * 1.2, 280, 950);
      k.yayU = Math.min(1, k.yayU + v * dt / L);
      const u = 0.5 - 0.5 * Math.cos(Math.PI * k.yayU), w = 1 - u;
      const cx = (k.ax + k.aex) / 2, cy = Math.min(k.ay, k.aey) - k.alift;
      const nx = w * w * k.ax + 2 * w * u * cx + u * u * k.aex, ny = w * w * k.ay + 2 * w * u * cy + u * u * k.aey;
      const vx = (nx - o.x) / Math.max(dt, 1e-3), vy = (ny - o.y) / Math.max(dt, 1e-3);
      o.x = nx; o.y = ny; k.vx = vx; k.vy = vy;
      if (Math.abs(vx) > 20) k.f = vx < 0 ? -1 : 1;
      k.rot = lerp(k.rot, clamp(vx / 2600, -0.28, 0.28) + clamp(vy / 3000, -0.15, 0.15) * k.f, 1 - Math.exp(-dt * 8));
      if (Math.random() < dt * 14) kzPuf(o.x - k.f * 20 * k.olc, o.y - 14 + (Math.random() - 0.5) * 10, -k.f * 20, 6, 0.8, 5 + Math.random() * 3, '#ffffff', 0.5);
      if (k.yayU >= 1 && yer && Math.abs(ty - o.y) < 2) {   // indi
        k.hava = false; o.y = ty; k.rot = 0; kzZipla(k, 4.5); k.hv = -60; k.hy = -0.01;
        kzPuf(o.x - 14, o.y - 2, -28, -4, 0.6, 6); kzPuf(o.x + 14, o.y - 2, 28, -4, 0.6, 6);
      }
    } else {   // havada bekliyor (hedef havada): küçük bir bulut gibi süzülür
      if (yer || Math.hypot(tx - o.x, ty - o.y) > 60) kzYayKur(k, o.x, o.y, tx, ty, 0);
      else { o.x = lerp(o.x, tx, 1 - Math.exp(-dt * 3)); o.y = lerp(o.y, ty, 1 - Math.exp(-dt * 3)); }
      k.rot = lerp(k.rot, 0, 1 - Math.exp(-dt * 6));
      if (Math.random() < dt * 2) kzPuf(o.x + (Math.random() - 0.5) * 30, o.y + 2, 0, 10, 1, 5, '#ffffff', 0.4);
    }
    k.gy = lerp(k.gy, Math.sin(k.t * 2.4) * 3, 1 - Math.exp(-dt * 4));
    return;
  }
  // yerde: zıplaya zıplaya yürü
  k.gy = lerp(k.gy, 0, 1 - Math.exp(-dt * 8)); k.rot = lerp(k.rot, 0, 1 - Math.exp(-dt * 10));
  if (k.binek && k.binek.cisim) { o.x += k.binek.cisim.dx || 0; o.y += k.binek.cisim.dy || 0; }
  const uzak = Math.max(0, Math.abs(dx) - 110);
  const maxv = 330 + uzak * 2;
  let mx = clamp(dx * 8 * dt, -maxv * dt, maxv * dt);
  if (Math.abs(mx) > 0.01) {   // öndeki arkadaşına binmesin: aynı yöne gidiyorsa arkasında sıraya girer
    const yn = Math.sign(mx);
    for (const q of kzSuru) {
      if (q === o || q.kz.hava || Math.abs(q.y - o.y) > 22) continue;
      const ara = (q.x - o.x) * yn;
      if (ara > 0 && ara < 60) mx = yn * Math.min(Math.abs(mx), Math.max(0, ara - 46));
    }
  }
  o.x += mx;
  const yy = kzZeminBul(o.x, o.y, 16, 16);
  if (yy === null) {   // ayağının altı kaydı (yüzen bulut gitti…): süzülerek hedefe
    k.hava = true; kzYayKur(k, o.x, o.y, tx, ty, 20); k.binek = null; return;
  }
  k.binek = kzZeminN;
  o.y = Math.abs(yy - o.y) < 1 ? yy : lerp(o.y, yy, 1 - Math.exp(-dt * 20));
  const hiz = Math.abs(mx) / Math.max(dt, 1e-4), gidiyor = hiz > 18;
  if (Math.abs(mx) > 0.05 && gidiyor) k.f = mx < 0 ? -1 : 1;
  if (gidiyor || k.faz % Math.PI > 0.03) {
    const eski = Math.floor(k.faz / Math.PI);
    k.faz += (gidiyor ? Math.abs(mx) : 140 * dt) / 30 * Math.PI;
    if (Math.floor(k.faz / Math.PI) !== eski) { kzZipla(k, 2); if (!gidiyor) k.faz = Math.floor(k.faz / Math.PI) * Math.PI; }
    k.wy = -Math.abs(Math.sin(k.faz)) * 6 * (gidiyor ? Math.min(1, hiz / 150 + 0.35) : 0.5);
  } else k.wy = lerp(k.wy, 0, 1 - Math.exp(-dt * 12));
}
// Yerdeki iki kuzu birbirine binmesin: yumuşakça it (kenardan boşluğa taşırmadan); havadakiler görüntüde yana açılır
function kzAyir(o, k, dt) {
  if (k.hava) {
    let px = 0, py = 0;
    for (const q of kzSuru) {
      if (q === o) continue;
      const z = q.kz, ddx = (o.x + k.ox) - (q.x + z.ox), ddy = (o.y + k.oy) - (q.y + z.oy), dd = Math.hypot(ddx, ddy);
      if (dd < 46) { const f = (46 - dd) / 46; if (dd < 0.5) { px += (k.sira > z.sira ? -1 : 1) * 20; } else { px += ddx / dd * f * 30; py += ddy / dd * f * 30; } }
    }
    k.ox = lerp(k.ox, clamp(px, -28, 28), 1 - Math.exp(-dt * 8)); k.oy = lerp(k.oy, clamp(py, -24, 24), 1 - Math.exp(-dt * 8));
    return;
  }
  k.oy = lerp(k.oy, 0, 1 - Math.exp(-dt * 8));
  if (k.tos) return;
  for (const q of kzSuru) {
    if (q === o || q.kz.hava || Math.abs(o.y - q.y) > 22) continue;
    const d = o.x - q.x, ad = Math.abs(d), en = KZ_ARA - 8;
    if (ad < en) {
      const nx = o.x + (ad < 0.5 ? (k.sira > q.kz.sira ? -1 : 1) : Math.sign(d)) * (en - ad) * Math.min(1, dt * (ad < 30 ? 12 : 5)) * 0.5;
      if (kzZeminBul(nx, o.y, 10, 10) !== null) o.x = nx;
    }
  }
}
// Feza dururken arada iki komşu kuzu tatlı bir tos vurur
function kzEtkilesim(dt) {
  if (kzSuru.length < 2 || kzYay || P.ucus || !(P.idle > 1.6 && P.ground)) { kzEtkT = Math.max(kzEtkT, 2); return; }
  kzEtkT -= dt; if (kzEtkT > 0) return;
  kzEtkT = 4 + Math.random() * 4;
  const hazir = kzSuru.filter(q => { const z = q.kz; return z.durum === 'takip' && !z.hava && z.hy === 0 && !z.tos && z.otla <= 0 && Math.abs(q.x - z.tx) < 6; });
  if (hazir.length < 2) return;
  const a = hazir[Math.floor(Math.random() * hazir.length)];
  let b = null, bd = 1e9;
  for (const q of hazir) { if (q === a) continue; const d = Math.abs(q.x - a.x); if (d < bd && d < 80 && Math.abs(q.y - a.y) < 10) { bd = d; b = q; } }
  if (!b) return;
  a.kz.tos = { q: b, t: 0, yon: Math.sign(b.x - a.x) || 1, temas: false }; b.kz.f = -a.kz.tos.yon; b.kz.bos = Math.max(b.kz.bos, 1.5);
}

// ── uçuşta: Pırıl'ın arkasında kuyruk ──
function kzUcus(o, k, dt) {
  const U = P.ucus;
  let tx, ty;
  if (U && U.kuyruk && typeof U.kuyruk.x === 'number') {   // ucus.js isterse kuyruk ucunu verir: {x, y, yon}
    const yon = U.kuyruk.yon || -1;
    tx = U.kuyruk.x + yon * (24 + k.sira * 30); ty = U.kuyruk.y + Math.sin(k.t * 2.2 + k.sira * 0.9) * 7;
  } else {
    const h = kzUcIzNokta(110 + k.sira * 30); tx = h.x; ty = h.y + 22 + Math.sin(k.t * 2.2 + k.sira * 0.9) * 7;
  }
  const w = 5.5, ex = tx - o.x, ey = ty - o.y;
  k.vx += (ex * w * w - 2 * w * k.vx) * dt; k.vy += (ey * w * w - 2 * w * k.vy) * dt;
  const sp = Math.hypot(k.vx, k.vy), vm = 1300;
  if (sp > vm) { k.vx *= vm / sp; k.vy *= vm / sp; }
  o.x += k.vx * dt; o.y += k.vy * dt;
  k.hy = 0; k.hv = 0; k.wy = 0; k.gy = lerp(k.gy, 0, 1 - Math.exp(-dt * 5));
  if (Math.abs(k.vx) > 30) k.f = k.vx < 0 ? -1 : 1;
  k.yonH = k.f;
  k.rot = lerp(k.rot, clamp(k.vy / 1600, -0.3, 0.3) * k.f, 1 - Math.exp(-dt * 6));
  k.mutlu = lerp(k.mutlu, 1, 1 - Math.exp(-dt * 8)); k.agiz = 'acik'; k.agizB = 0.6; k.kulA = lerp(k.kulA, -0.45, 1 - Math.exp(-dt * 6));
  k.bakX = k.f * 0.6; k.bakY = 0; k.parla = lerp(k.parla, 0.4, 1 - Math.exp(-dt * 3));
  kzAyir(o, k, dt);
  if (Math.random() < dt * 10) kzPuf(o.x - k.f * 22, o.y - 18 + (Math.random() - 0.5) * 8, -k.f * 40, 4, 0.7, 5 + Math.random() * 3, '#ffffff', 0.45);
}

// ── gökkuşağı ──
// OLAY 'gokkusagiBasla' verisi (LEVEL3 bulut.js): {konumlar:[{x,y}×7]} varsa kuzu renkI sırasıyla oraya;
// yoksa {x, y, r, w?} (yay merkezi, dış yarıçap, bant kalınlığı) ya da BOLUM.gokkusagi {x,y} (tepe) üstünde varsayılan yay.
function kzYayKonum(d) {
  if (d && Array.isArray(d.konumlar) && d.konumlar.length) return d.konumlar.map(p => ({ x: p.x, y: p.y }));
  let cx, cy, R, w;
  const kaynak = d && typeof d.r === 'number' ? d : d && d.o && typeof d.o.r === 'number' && d.o.r > 100 ? d.o : null;
  if (kaynak && typeof kaynak.x === 'number') { cx = kaynak.x; cy = kaynak.y; R = kaynak.r; w = kaynak.w || R * 0.08; }
  else {
    const gk = (typeof BOLUM !== 'undefined' && BOLUM.gokkusagi) || (d && d.o) || P;
    cx = gk.x; cy = gk.y + 30; R = 380; w = 30;
  }
  const L = [];
  for (let i = 0; i < 7; i++) {
    const th = Math.PI + 0.42 + i / 6 * (Math.PI - 0.84), Ri = R - w * (i + 0.5);
    L.push({ x: cx + Math.cos(th) * Ri, y: cy + Math.sin(th) * Ri - 6 });
  }
  return L;
}
function kzYayBasla(d) {
  if (kzYay) return;
  const L = NESNELER.filter(o => o.tip === 'kuzu' && o.kz);
  if (!L.length) return;
  kzYay = { t: 0, konum: kzYayKonum(d) };
  for (const o of L) {
    const k = o.kz;
    if (k.renkI < 0) {   // (olmamalı) renklenmemiş kalan: sessizce renklenir
      o.done = true; o.dokundu = true; k.renkI = kzRenkSira++ % KZ_RENK.length; k.pal = KZ_RENK[k.renkI]; k.renkU = 1; k.sprRes = 0;
      OLAY.emit('kuzu', { o, renkI: k.renkI });
    }
    k.durum = 'yay'; k.st = -0.35 - k.renkI * 0.24; k.yayVar = false; k.tos = null; k.otla = 0; k.takla = 0; k.renkU = 1;
    const p = kzYay.konum[k.renkI % kzYay.konum.length]; k.yx = p.x; k.yy = p.y;
  }
}
function kzYayda(o, k, dt) {
  k.mutlu = lerp(k.mutlu, 1, 1 - Math.exp(-dt * 6)); k.agiz = 'acik'; k.agizB = 0.7; k.egim = 0; k.ac = 0.95; k.yanak = 0.6; k.umut = 0; k.titreX = 0;
  k.kulA = lerp(k.kulA, -0.35, 1 - Math.exp(-dt * 5)); k.basY = lerp(k.basY, -1, 1 - Math.exp(-dt * 5)); k.bas = lerp(k.bas, 0, 1 - Math.exp(-dt * 6));
  if (k.st < 0) {   // sırasını bekler: yukarı bakar, hoplar
    k.bakY = lerp(k.bakY, -0.9, 1 - Math.exp(-dt * 5)); k.bakX = 0;
    if (!k.hava && k.hy === 0 && Math.random() < dt * 1.5) { k.hv = -200; kzZipla(k, 3); }
    kzHop(k, dt); k.indi = false;
    return;
  }
  if (!k.yayVar) {
    if (!k.hava || k.aex !== k.yx || k.aey !== k.yy) {
      if (!k.hava) { k.hava = true; kzZipla(k, 4); kzPof(o.x, o.y - 10, k.pal, false); }
      k.hy = 0; k.hv = 0;
      kzYayKur(k, o.x, o.y, k.yx, k.yy, 120);
    }
    const L = Math.hypot(k.aex - k.ax, k.aey - k.ay) + k.alift * 1.3 + 1, v = clamp(220 + L * 0.9, 260, 820);
    k.yayU = Math.min(1, k.yayU + v * dt / L);
    const u = 0.5 - 0.5 * Math.cos(Math.PI * k.yayU), w = 1 - u, cx = (k.ax + k.aex) / 2, cy = Math.min(k.ay, k.aey) - k.alift;
    const nx = w * w * k.ax + 2 * w * u * cx + u * u * k.aex, ny = w * w * k.ay + 2 * w * u * cy + u * u * k.aey;
    const vx = (nx - o.x) / Math.max(dt, 1e-3);
    o.x = nx; o.y = ny;
    if (Math.abs(vx) > 20) k.f = vx < 0 ? -1 : 1;
    k.yonH = k.f; k.rot = lerp(k.rot, clamp(vx / 2600, -0.28, 0.28), 1 - Math.exp(-dt * 8));
    k.parla = lerp(k.parla, 0.6, 1 - Math.exp(-dt * 3));
    if (Math.random() < dt * 24) kzIsilti(o.x - k.f * 16, o.y - 20 + (Math.random() - 0.5) * 16, 1, [k.pal.i, '#ffffff', k.pal.a], 30, 0.8, 6);
    if (k.yayU >= 1) {
      k.yayVar = true; k.varT = kzYay.t; k.rot = 0; kzZipla(k, 6);
      kzIsilti(o.x, o.y - 24, 14, [k.pal.i, '#ffffff', k.pal.a, '#fff3b0'], 200, 0.9, 10);
      kzPof(o.x, o.y - 20, k.pal, false);
      OLAY.emit('kuzuYayda', { o, renkI: k.renkI, x: o.x, y: o.y });
      if (k.renkI === 3) kzMee(o, k, true);
    }
    return;
  }
  // yerinde parlar: gökkuşağı dalgası (kırmızıdan mora sırayla zıplama; her ikinci dalgada takla)
  o.x = lerp(o.x, k.yx, 1 - Math.exp(-dt * 4)); o.y = lerp(o.y, k.yy, 1 - Math.exp(-dt * 4));
  k.parla = lerp(k.parla, 0.75 + 0.25 * Math.sin(kzYay.t * 2.2 + k.renkI), 1 - Math.exp(-dt * 2));
  k.yonH = lerp(k.yonH, 0.12 * (P.x < o.x ? -1 : 1), 1 - Math.exp(-dt * 3));
  k.bakX = clamp((P.x - o.x) / 200, -1, 1) * 0.6; k.bakY = 0.3;
  k.gy = Math.sin(kzYay.t * 2 + k.renkI * 0.5) * 4;
  const per = 2.6, lt = kzYay.t - k.renkI * 0.13, n = Math.floor(lt / per);
  if (n !== k.dalgaN && lt > 0 && k.hy === 0) {
    k.dalgaN = n; k.hv = -230; kzZipla(k, 4);
    if (n % 2 === 1) k.takla = 0.0001;
    kzIsilti(o.x, o.y - 10, 4, [k.pal.i, '#ffffff', '#fff3b0'], 90, 0.6, 7, Math.PI / 2, 2);
  }
  if (k.takla > 0) { k.takla += dt / 0.42; k.rot = -Math.PI * 2 * smooth(clamp(k.takla, 0, 1)); if (k.takla >= 1) { k.takla = 0; k.rot = 0; } }
  kzHop(k, dt); k.indi = false;
  if (Math.random() < dt * 3) kzIsilti(o.x + (Math.random() - 0.5) * 50, o.y - 20 + (Math.random() - 0.5) * 30, 1, [k.pal.i, '#ffffff'], 20, 1, 6, -Math.PI / 2, 1);
}

// ── çizim ──
function kzCiz(o, k, tm) {
  if (!k) return;
  kzResGuncel();
  kzSprAl(k);
  if (!k.spr0) return;
  const olc = k.olc, rU = k.pal ? k.renkU : 0;
  const X = o.x + k.ox + k.titreX, Y0 = o.y + k.oy, Y = Y0 + k.hy + k.wy + k.gy;
  const govdeY = -KZ_BAC - KZ_BH * 0.5 + 2;
  // ışıltı (dönüşümsüz)
  g.globalCompositeOperation = 'lighter';
  if (k.umut > 0.02) { const pu = 0.75 + 0.25 * Math.sin(tm * 3.1 + o.x * 0.01); dglow('#fff6e8', X, Y - 26, 78 * pu, 0.2 * k.umut); }
  if (rU > 0.01) dglow(k.pal.i, X, Y + govdeY * olc, (58 + 26 * k.parla) * olc, (0.13 + 0.14 * k.parla) * rU);
  g.globalCompositeOperation = 'source-over';
  // gölge
  if (k.zemin !== null && k.zemin !== undefined) {
    const h = Math.max(0, k.zemin - Y), a = clamp(1 - h / 140, 0, 1);
    if (a > 0.02) { g.globalAlpha = 0.2 * a; g.fillStyle = '#5a4060'; g.beginPath(); g.ellipse(X, k.zemin, KZ_BW * 0.42 * olc * (0.6 + 0.4 * a), 3.2, 0, 0, 6.283); g.fill(); g.globalAlpha = 1; }
  }
  const pal = rU >= 1 ? k.pal : KZ_GRI;
  const c = clamp(k.yon, -1, 1) * 0.72, s = Math.sqrt(1 - c * c), yon = c / 0.72;
  const nef = k.durum === 'uzgun' ? k.nef : 0.5 + 0.5 * Math.sin(k.t * 2.4);
  g.save();
  g.translate(X, Y);
  if (k.rot) { g.translate(0, govdeY * olc); g.rotate(k.rot); g.translate(0, -govdeY * olc); }
  g.scale(olc * (1 + k.sq) * (1 - nef * 0.012), olc * (1 - k.sq) * (1 + nef * 0.03));
  g.lineCap = 'round'; g.lineJoin = 'round';
  // bacaklar (gövdenin altında; uzaktakiler önce, biraz koyu)
  const havada = k.hava || k.durum === 'ucus' || (k.durum === 'yay' && (k.st >= 0));
  const bacCol = rU >= 1 ? k.pal.bac : rU > 0 ? mixc(KZ_GRI.bac, k.pal.bac, rU) : KZ_GRI.bac;
  const tirCol = rU >= 1 ? k.pal.tir : KZ_GRI.tir;
  for (let pass = 0; pass < 2; pass++) {
    const lz = pass === 0 ? -1 : 1;
    for (let lxS = -1; lxS <= 1; lxS += 2) {
      const bx = lxS * KZ_BW * 0.27 * yon * 0.85 + lz * KZ_BW * 0.15 * s;
      const faz = k.faz + (lxS * lz > 0 ? 0 : Math.PI);
      let sw = 0, lift = 0, boy = KZ_BAC;
      if (havada) { const p = Math.sin(k.t * 6 + (lxS > 0 ? 0 : 2) + lz); sw = -k.f * 2.5 + p * 1.5; lift = 3 + p; boy = KZ_BAC * 0.75; }
      else if (k.wy < -0.3 || k.faz % Math.PI > 0.03) { sw = Math.cos(faz) * 2.6 * Math.sign(yon || 1); lift = Math.max(0, Math.sin(faz)) * 2.4; }
      if (k.hy < -2 && !havada) { lift = Math.min(4, -k.hy * 0.1); boy = KZ_BAC * 0.85; }
      g.globalAlpha = 1;
      g.strokeStyle = pass === 0 ? (rU >= 0.5 ? k.pal.bac2 : KZ_GRI.bac2) : bacCol;
      g.lineWidth = 5.6;
      g.beginPath(); g.moveTo(bx, -boy - 5); g.lineTo(bx + sw, -lift - 3.2); g.stroke();
      g.fillStyle = tirCol; g.beginPath(); g.ellipse(bx + sw, -lift - 2.2, 3.1, 2.2, 0, 0, 6.283); g.fill();
    }
  }
  // kuyruk (gövdenin arkasında)
  {
    const kx = -yon * KZ_BW * 0.46, ky = govdeY - 4, ang = k.kuy * 0.8 + Math.sin(k.t * 3) * 0.05;
    const sp0 = k.kuy0;
    if (sp0 && Math.abs(yon) > 0.15) {
      g.save(); g.translate(kx, ky); g.rotate(ang * Math.sign(yon || 1));
      kzSprCiz(sp0, k.kuy1, rU, 0, 0, 1);
      g.restore();
    }
  }
  // gövde (renk dalgası: temas noktasından yayılan daire)
  kzGovde(k, rU, govdeY);
  // baş
  const yanY = -KZ_BAC - KZ_BH * 0.74, onY = -KZ_BAC - KZ_BH * 0.52;
  let hx = c * KZ_BW * 0.56, hy = lerp(onY, yanY, Math.abs(yon)) + k.basY;
  const bs = smooth(clamp(k.bas, 0, 1));
  hx += Math.sign(c || k.f) * 5 * bs; hy += 15 * bs;
  g.save();
  g.translate(hx, hy);
  const br = k.basR + Math.sign(c || k.f) * 0.55 * bs + (k.durum === 'uzgun' ? -c * 0.08 : 0);
  if (br) g.rotate(br);
  kzKafa(k, c, s, rU, tm);
  g.restore();
  g.restore();
}
function kzSprCiz(s0, s1, rU, cx, cy, k) {   // sprite'ı (gri → renkli geçişiyle) merkezden çiz
  if (rU < 1 && s0) { g.drawImage(s0, cx - s0.ww / 2 * k, cy - s0.wh / 2 * k, s0.ww * k, s0.wh * k); }
  if (rU > 0 && s1) { g.globalAlpha = Math.min(1, rU); g.drawImage(s1, cx - s1.ww / 2 * k, cy - s1.wh / 2 * k, s1.ww * k, s1.wh * k); g.globalAlpha = 1; }
}
function kzGovde(k, rU, gy) {
  const s0 = k.spr0, s1 = k.spr1;
  if (rU < 1 || !s1) g.drawImage(s0, -s0.ww / 2, gy - s0.wh / 2, s0.ww, s0.wh);
  if (rU > 0 && s1) {
    if (rU >= 1) { g.drawImage(s1, -s1.ww / 2, gy - s1.wh / 2, s1.ww, s1.wh); return; }
    const R0 = rU * KZ_BW * 1.25, cx = k.renkOx, cy = gy;
    g.save(); g.beginPath(); g.arc(cx, cy, R0, 0, 6.283); g.clip();
    g.drawImage(s1, -s1.ww / 2, gy - s1.wh / 2, s1.ww, s1.wh);
    g.restore();
    // dalganın parlak kenarı (gövdenin içinde)
    g.save(); g.beginPath(); g.ellipse(0, gy, KZ_BW * 0.5, KZ_BH * 0.52, 0, 0, 6.283); g.clip();
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.55 * (1 - rU); g.strokeStyle = '#ffffff'; g.lineWidth = 5;
    g.beginPath(); g.arc(cx, cy, R0, 0, 6.283); g.stroke();
    g.globalAlpha = 0.35 * (1 - rU); g.strokeStyle = k.pal.l; g.lineWidth = 11; g.stroke();
    g.restore();
  }
}
function kzKafa(k, c, s, rU, tm) {
  const hw = KZ_HW / 2, hh = KZ_HH / 2, yon = c / 0.72;
  const pal = rU >= 0.6 && k.pal ? k.pal : KZ_GRI;
  const basU = k.pal ? smooth(clamp((rU - 0.35) / 0.45, 0, 1)) : 0;   // baş, dalga gövdeyi büyük ölçüde geçince boyanır
  const fCol = basU <= 0 ? KZ_GRI.f : basU >= 1 ? k.pal.f : mixc(KZ_GRI.f, k.pal.f, basU);
  const icCol = basU >= 0.5 ? k.pal.ic : KZ_GRI.ic;
  // kulaklar (başın arkasında): yana doğru uzanır; üzgünken aşağı sarkar, mutluyken dik
  for (let sg = -1; sg <= 1; sg += 2) {
    const dirX = sg * s - c * 0.95, ad = Math.abs(dirX);
    const L = KZ_HW * 0.62 * clamp(ad * 0.85 + 0.3, 0.5, 1.05);
    const bx = sg * hw * 0.62 * s - c * hw * 0.25, by = -hh * 0.42;
    const dr = clamp(k.kulA + k.kul * sg * 0.7 + Math.sin(tm * 1.7 + sg + k.seed) * 0.03, -0.7, 1.45);
    const ang = dirX >= 0 ? dr : Math.PI - dr;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    g.save(); g.translate(bx + ca * L * 0.46, by + sa * L * 0.46); g.rotate(ang);
    g.fillStyle = basU >= 0.5 ? k.pal.kul : KZ_GRI.kul; g.beginPath(); g.ellipse(0, 0, L * 0.52, KZ_HW * 0.15, 0, 0, 6.283); g.fill();
    g.strokeStyle = basU >= 0.5 ? k.pal.kulK : KZ_GRI.kulK; g.lineWidth = 0.7; g.stroke();
    g.fillStyle = icCol; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(L * 0.06, 0.4, L * 0.34, KZ_HW * 0.075, 0, 0, 6.283); g.fill();
    g.globalAlpha = 1; g.restore();
  }
  // yüz sprite'ı
  const b0 = k.bas0, b1 = k.bas1;
  if (basU < 1 && b0) g.drawImage(b0, -b0.ww / 2, -b0.wh / 2, b0.ww, b0.wh);
  if (basU > 0 && b1) { g.globalAlpha = basU; g.drawImage(b1, -b1.ww / 2, -b1.wh / 2, b1.ww, b1.wh); g.globalAlpha = 1; }
  // yanaklar
  const yanCol = basU >= 0.5 ? k.pal.y : KZ_GRI.y;
  if (k.yanak > 0.02) {
    g.globalAlpha = k.yanak * 0.75; g.fillStyle = yanCol;
    for (let sg = -1; sg <= 1; sg += 2) {
      const ex = sg * hw * 0.6 * s + c * hw * 0.32;
      g.beginPath(); g.ellipse(ex, hh * 0.38, hw * 0.2 * (1 - Math.max(0, -sg * c) * 0.4), hh * 0.13, 0, 0, 6.283); g.fill();
    }
    g.globalAlpha = 1;
  }
  // gözler
  for (let sg = -1; sg <= 1; sg += 2) {
    const uzak = Math.max(0, -sg * yon);
    const ex = sg * hw * 0.4 * s + c * hw * 0.34, ey = -hh * 0.02;
    kzGoz(k, sg, ex, ey, 1 - uzak * 0.18, fCol);
  }
  // ağız
  const mx = c * hw * 0.42, my = hh * 0.5;
  g.strokeStyle = KZ_AGIZ; g.fillStyle = KZ_AGIZ; g.lineWidth = 1.05; g.lineCap = 'round';
  switch (k.agiz) {
    case 'uzgun': g.beginPath(); g.arc(mx, my + 2.2, 1.6, 1.25 * Math.PI, 1.75 * Math.PI); g.stroke(); break;
    case 'o': g.beginPath(); g.ellipse(mx, my + 0.6, 1.1, 1.3, 0, 0, 6.283); g.fill(); break;
    case 'cigne': g.beginPath(); g.moveTo(mx - 1.4, my + 0.5); g.quadraticCurveTo(mx, my + 1.4 + Math.sin(tm * 26) * 0.6, mx + 1.4, my + 0.5); g.stroke(); break;
    case 'gulus':
      g.beginPath(); g.arc(mx - 1.25, my - 0.2, 1.25, 0.15 * Math.PI, 0.95 * Math.PI); g.stroke();
      g.beginPath(); g.arc(mx + 1.25, my - 0.2, 1.25, 0.05 * Math.PI, 0.85 * Math.PI); g.stroke(); break;
    case 'mee': {
      const b = k.agizB, rx = 1.3 + 0.5 * b, ry = 1.2 + 1.7 * b;
      g.fillStyle = KZ_AGIZIC; g.beginPath(); g.ellipse(mx, my + ry * 0.6, rx, ry, 0, 0, 6.283); g.fill();
      g.fillStyle = KZ_DIL; g.beginPath(); g.ellipse(mx, my + ry * 1.05, rx * 0.65, ry * 0.4, 0, 0, 6.283); g.fill();
      g.lineWidth = 0.7; g.beginPath(); g.ellipse(mx, my + ry * 0.6, rx, ry, 0, 0, 6.283); g.stroke(); break;
    }
    default: {   // 'acik': mutlu açık ağız (dil)
      const ag = 1.6 + 1.4 * (k.agizB || 0.5);
      g.fillStyle = KZ_AGIZIC; g.beginPath(); g.moveTo(mx - 2.6, my - 0.4); g.quadraticCurveTo(mx, my - 0.9, mx + 2.6, my - 0.4);
      g.quadraticCurveTo(mx + 1.9, my + ag, mx, my + ag); g.quadraticCurveTo(mx - 1.9, my + ag, mx - 2.6, my - 0.4); g.fill();
      g.fillStyle = KZ_DIL; g.beginPath(); g.ellipse(mx, my + ag * 0.72, 1.35, 0.6 + ag * 0.18, 0, 0, 6.283); g.fill();
      g.lineWidth = 0.7; g.beginPath(); g.moveTo(mx - 2.6, my - 0.4); g.quadraticCurveTo(mx, my - 0.9, mx + 2.6, my - 0.4); g.stroke();
    }
  }
}
function kzGoz(k, sg, ex, ey, sc, fCol) {
  g.fillStyle = KZ_GOZ; g.strokeStyle = KZ_GOZ; g.lineCap = 'round';
  const rx = 2.9 * sc, ryT = 3.7 * sc;
  if (k.mutlu > 0.5) {   // ^ ^
    g.lineWidth = 1.25 * sc; g.beginPath(); g.arc(ex, ey + 1.6 * sc, 2.6 * sc, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke();
    if (k.isilti > 0.05) {}
    return;
  }
  const ac = k.ac * (1 - k.kirp);
  if (ac < 0.13) {   // kapalı: yumuşak aşağı kıvrık çizgi
    g.lineWidth = 1.15 * sc; g.beginPath(); g.arc(ex, ey - 1.3 * sc, 2.7 * sc, 0.18 * Math.PI, 0.82 * Math.PI); g.stroke();
    return;
  }
  const bx = k.bakX * 0.75 * sc, by = k.bakY * 0.7 * sc;
  const ry = ryT * Math.min(1, ac + 0.3);
  g.beginPath(); g.ellipse(ex + bx * 0.35, ey + by * 0.3, rx, ry, 0, 0, 6.283); g.fill();
  g.fillStyle = '#5b4684'; g.beginPath(); g.ellipse(ex + bx * 0.35, ey + by * 0.3 + ry * 0.42, rx * 0.72, ry * 0.4, 0, 0, Math.PI); g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath(); g.ellipse(ex + bx - rx * 0.28, ey + by - ry * 0.34, rx * 0.42, ry * 0.33, -0.3, 0, 6.283); g.fill();
  g.beginPath(); g.arc(ex + bx + rx * 0.36, ey + by + ry * 0.36, rx * 0.17, 0, 6.283); g.fill();
  // mahzun göz kapağı: üstü kapatır, dış köşe daha aşağıda (gözü yumuşakça "düşük" gösterir)
  const kap = clamp(1 - ac, 0, 1) * 0.85, eg = k.egim;
  if (kap > 0.03 || eg > 0.03) {
    const yIn = ey - ry + ry * 2 * clamp(kap - eg * 0.1, 0, 0.95), yOut = ey - ry + ry * 2 * clamp(kap + eg * 0.3, 0, 0.95);
    const xIn = ex - sg * rx * 1.3, xOut = ex + sg * rx * 1.3;
    g.save(); g.beginPath(); g.ellipse(ex + bx * 0.35, ey + by * 0.3, rx * 1.08, ry * 1.08, 0, 0, 6.283); g.clip();
    g.fillStyle = fCol; g.beginPath(); g.moveTo(xIn, yIn); g.lineTo(xOut, yOut); g.lineTo(xOut, ey - ry * 1.6); g.lineTo(xIn, ey - ry * 1.6); g.closePath(); g.fill();
    g.restore();
    g.lineWidth = 0.95 * sc; g.strokeStyle = KZ_GOZ;
    g.beginPath(); g.moveTo(lerp(xIn, xOut, 0.12), lerp(yIn, yOut, 0.12)); g.lineTo(lerp(xIn, xOut, 0.86), lerp(yIn, yOut, 0.86)); g.stroke();
  }
  if (eg > 0.05) {   // endişeli kaş: iç ucu yukarıda
    g.globalAlpha = 0.22 * eg; g.lineWidth = 0.8 * sc;
    g.beginPath(); g.moveTo(ex - sg * rx * 1.05, ey - ryT - 2.6 * sc - eg * 0.8); g.lineTo(ex + sg * rx * 0.95, ey - ryT - 1.4 * sc); g.stroke();
    g.globalAlpha = 1;
  }
}

// ── efekt katmanı (bulut pofları) + kare başı; ekranda kuzu olmasa da çalışır ──
function kzFxEkle() {
  if (kzFxVar) return;
  kzFxVar = true;
  NESNELER.push({ tip: 'kzFx', x: 0, y: 0, id: 'kzFx' });
}
TUR.kaydet('kzFx', {
  guncelle(o, dt) { kzKareBasi(dt); if (typeof cam !== 'undefined') { o.x = cam.x + VW / 2; o.y = cam.y + VH / 2; } },
  cizOn() { kzParcaCiz(); },
});
if (NESNELER.some(o => o.tip === 'kuzu')) kzFxEkle();

// ── olaylar ──
OLAY.on('boyut', () => { kzResH = -1; });
OLAY.on('kurtarildi', () => { kzIz.length = 0; kzIzBos = true; kzSlotT = 0; });
OLAY.on('gokkusagiBasla', d => kzYayBasla(d));
OLAY.on('kuzu', d => {   // yeni bir kuzu renklendi: sürüdekiler sırayla sevinçle hoplar
  if (!d || !d.o) return;
  let n = 0;
  for (const q of kzSuru) { const z = q.kz; if (z.durum !== 'takip' || Math.hypot(q.x - d.o.x, q.y - d.o.y) > 700) continue; z.sevT = 0.45 + n * 0.12; n++; }
});

// Test için (yalnız inceleme): window.kzTest
window.kzTest = { suru: kzSuru, iz: kzIz, slot: KZ_SLOT, parca: kzP, saril: kzSaril, yay: kzYayBasla, get spr() { return KZ_SPR.size; }, get yayDurum() { return kzYay; } };

// ── Güvenlik: bir kuzudaki hata asla bütün kareyi bozmasın (hata bir kez yazılır, çizim durumu geri yüklenir) ──
(() => {
  const goruldu = new Set();
  const yaz = (ad, e) => { const k = ad + ':' + (e && e.message); if (!goruldu.has(k)) { goruldu.add(k); console.error('[kuzu ' + ad + ']', e); } };
  for (const tip of ['kuzu', 'kzFx']) {
    const h = TUR.al(tip); if (!h) continue;
    for (const m of ['kur', 'guncelle', 'dokun']) {
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

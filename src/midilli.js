/* midilli.js — Şenlik Kalesi'nin büyülü midillileri (Bölüm 6).
   1) Ortak çizici: midilliCiz(c, x, y, s, t, o) — yumuşak yuvarlak hatlı pastel midilli, iri gözler, ışıklı yele/kuyruk,
      toynaktan yıldız tozu. Bütün parçalar renk başına bir kez önbellek tuvallerine çizilir; her karede yalnız drawImage,
      göz ve birkaç kısa yol çizilir (gradient/filtre/gölge üretilmez). HALKA (binek) ve SAHNE (final) de bunu kullanır.
      o = { uyku 0..1, yon 1|-1 (ara değer: dönüş), parilti 0..1, kos 0..1 (koşu/süzülme miktarı; adım fazı t'den),
            zipla 0..1, renk 0..4, alpha 0..1 (isteğe bağlı), bak -1..1 (isteğe bağlı, baş eğimi) }
      (x, y) toynak tabanının ortası; s = 1'de sırt yüksekliği ≈ Feza boyu (60 birim).
   2) Dünya nesnesi tip:'midilli' — uyur (zzz yok, yumuşak nefes ışığı); Feza üstüne zıplayınca uyanır, V6.midilli++,
      OLAY 'midilliUyandi' {n, o}; Feza'yı yükseğe sıçratır (cisim 'ziplat'); sonra yerinde neşeyle kıpırdar.
      İlk uyuyan midilli yakından görülünce bir kez OLAY 'midilliGor' {o} (Pırıl'ın p_f_midilli cümlesi için). */
'use strict';

// Beş tatlı pastel: g gövde, gk gövde gölgesi, y1/y2 yele uçları, tk toynak, i ışık, cz çizgi, gz göz bebeği rengi
const MD_RENK = [
  { g: '#ffdcec', gk: '#f3b6d2', y1: '#ff9fd2', y2: '#b9a2ff', tk: '#d98bb4', i: '#ffc2e2', cz: '#a8668f', gz: '#8d6bd8' },   // pembe
  { g: '#e9e0ff', gk: '#cbbcf3', y1: '#8fd6ff', y2: '#d6a0ff', tk: '#a690d8', i: '#c6e8ff', cz: '#7c6aae', gz: '#5aa7dc' },   // leylak
  { g: '#d6f6e8', gk: '#a9dcc7', y1: '#ffb4da', y2: '#ffe08e', tk: '#7fbfa6', i: '#fff0b0', cz: '#5d927f', gz: '#e0799f' },   // nane
  { g: '#ffeedb', gk: '#f2cba8', y1: '#ffa0b6', y2: '#a99cff', tk: '#d69c80', i: '#ffd0dc', cz: '#a8735d', gz: '#9a7be0' },   // şeftali
  { g: '#d9edff', gk: '#aac9ef', y1: '#b8a4ff', y2: '#ffc1e7', tk: '#8aa7d6', i: '#e5d8ff', cz: '#6585b4', gz: '#a07ae6' },   // gök
];
const MD_RES = 5;              // önbellek tuvali: dünya birimi başına piksel (s ≈ 2-3 büyütmede de keskin)
const MD_PI2 = Math.PI * 2;
const MD = { spr: [], yildiz: null, yildizSoluk: null, sira: 0, gorulen: false };
// Nokta (iskelet, sağa bakış): gövde merkezi, boyun dönme noktası, bacak kökleri, yele kökleri
const MD_BX = -2, MD_BY = -40, MD_RX = 26, MD_RY = 16, MD_KY = -30, MD_BL = 30;   // gövde elipsi; kalça yüksekliği, bacak boyu
const MD_NP = { x: 12, y: -50 };                    // baş+boyun bu noktadan döner (gövdenin içinde, ek yeri görünmez)
const MD_KALCA = [[-19, 0], [8, 0], [-13, 1], [14, 1]];   // [x, yakın mı]: uzak arka, uzak ön, yakın arka, yakın ön
const MD_YELE = [[19, -96, 20, 1.0], [13, -89, 23, 1.05], [9, -80, 23, 1.1], [6, -70, 21, 1.15], [4, -60, 18, 1.2], [2, -51, 13, 1.28]];

function mdTuval(x0, y0, w, h) {   // yerel koordinatlı önbellek tuvali: (x0, y0) sol üst köşe
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * MD_RES); c.height = Math.ceil(h * MD_RES);
  const q = c.getContext('2d'); q.scale(MD_RES, MD_RES); q.translate(-x0, -y0); q.lineCap = 'round'; q.lineJoin = 'round';
  c.x0 = x0; c.y0 = y0; c.w = w; c.h = h;
  return { c, q };
}
function mdKoy(c, spr) { c.drawImage(spr, spr.x0, spr.y0, spr.w, spr.h); }
function mdSoluk(col) { return mixc(col, '#b9b2c9', 0.6); }

// Yele/kuyruk lülesi: kökü (0,0), aşağı doğru 30 birim; ucu hafifçe kıvrık
function mdLule(c1, c2, cz) {
  const t = mdTuval(-9, -3, 18, 37), q = t.q;
  const yol = () => { q.beginPath(); q.moveTo(-4.8, 0); q.bezierCurveTo(-7.4, 9, -5.4, 20, -1.2, 27); q.quadraticCurveTo(1.6, 31.5, 4.6, 29.6);
    q.quadraticCurveTo(1.6, 27.6, 2.6, 23); q.bezierCurveTo(5.8, 15, 6.2, 6, 4.8, 0); q.quadraticCurveTo(0, -3, -4.8, 0); q.closePath(); };
  const gr = q.createLinearGradient(0, 0, 0, 30); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  yol(); q.strokeStyle = cz; q.lineWidth = 1.3; q.stroke(); q.fillStyle = gr; q.fill();
  q.strokeStyle = 'rgba(255,255,255,.55)'; q.lineWidth = 1.1; q.beginPath(); q.moveTo(-2.4, 3); q.bezierCurveTo(-4, 10, -3, 17, -0.6, 22); q.stroke();
  q.strokeStyle = 'rgba(255,255,255,.25)'; q.lineWidth = .7; q.beginPath(); q.moveTo(1.8, 4); q.bezierCurveTo(2.6, 11, 2, 17, 1, 21); q.stroke();
  return t.c;
}
// Bacak: kalça (0,0), toynak tabanı (0,36)
function mdBacak(p, uzak) {   // tombul, uca doğru hafifçe incelen bacak; tepesi gövdenin altında kalır
  const t = mdTuval(-7, -8, 14, 40), q = t.q, gv = uzak ? p.gk : p.g, tk = uzak ? mixc(p.tk, '#6e5a86', .25) : p.tk;
  const bac = () => { q.beginPath(); q.moveTo(-5.4, -7); q.lineTo(-4.4, 24); q.lineTo(4.4, 24); q.lineTo(5.4, -7); q.closePath(); };
  const toy = () => { q.beginPath(); q.moveTo(-5.6, 23); q.quadraticCurveTo(-6.2, 30, 0, 30); q.quadraticCurveTo(6.2, 30, 5.6, 23); q.quadraticCurveTo(0, 20.5, -5.6, 23); q.closePath(); };
  q.strokeStyle = p.cz; q.lineWidth = 1.6; bac(); q.stroke(); toy(); q.stroke();
  q.fillStyle = gv; bac(); q.fill(); q.fillStyle = tk; toy(); q.fill();
  q.fillStyle = 'rgba(255,255,255,.35)'; q.beginPath(); q.ellipse(-2.2, 25.5, 1.4, 2, 0, 0, MD_PI2); q.fill();
  q.fillStyle = uzak ? 'rgba(90,70,120,.10)' : 'rgba(255,255,255,.22)'; q.fillRect(-3.6, -6, 2.2, 28);
  return t.c;
}
// Gövde (yuvarlak fıçı): boyun ek yeri (sağ üst yay) çizgisiz, baş-boyun arkadan kesintisiz birleşsin
function mdGovde(p) {
  const t = mdTuval(MD_BX - MD_RX - 3, MD_BY - MD_RY - 3, MD_RX * 2 + 6, MD_RY * 2 + 6), q = t.q;
  q.fillStyle = p.g; q.beginPath(); q.ellipse(MD_BX, MD_BY, MD_RX, MD_RY, 0, 0, MD_PI2); q.fill();
  q.save(); q.clip();
  const gr = q.createLinearGradient(0, MD_BY - MD_RY, 0, MD_BY + MD_RY); gr.addColorStop(0, 'rgba(255,255,255,.38)'); gr.addColorStop(.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, p.gk);
  q.fillStyle = gr; q.fillRect(MD_BX - MD_RX, MD_BY - MD_RY, MD_RX * 2, MD_RY * 2);
  q.fillStyle = 'rgba(255,255,255,.28)'; q.beginPath(); q.ellipse(MD_BX - 4, MD_BY - 7, 13, 4.2, -.08, 0, MD_PI2); q.fill();
  // sağrıda minik yıldız beneği (büyülü midillinin işareti)
  q.fillStyle = mixc(p.y1, '#ffffff', .35); mdYildizYol(q, MD_BX - 12, MD_BY - 2, 4.2, 1.8); q.fill();
  q.fillStyle = mixc(p.y2, '#ffffff', .35); q.beginPath(); q.arc(MD_BX - 5, MD_BY + 1, 1.3, 0, MD_PI2); q.arc(MD_BX - 15, MD_BY + 5, 1, 0, MD_PI2); q.fill();
  q.restore();
  q.strokeStyle = p.cz; q.lineWidth = 1.6; q.beginPath(); q.ellipse(MD_BX, MD_BY, MD_RX, MD_RY, 0, -0.4, -1.42 + MD_PI2); q.stroke();
  return t.c;
}
function mdYildizYol(q, x, y, R, r) { q.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, k = i % 2 ? r : R; i ? q.lineTo(x + Math.cos(a) * k, y + Math.sin(a) * k) : q.moveTo(x + Math.cos(a) * k, y + Math.sin(a) * k); } q.closePath(); }
// Baş + boyun (sağa bakar): yuvarlak kafa, tombul burun, kulaklar, yanak allığı, gülümseme (göz canlı çizilir)
function mdBas(p) {
  const t = mdTuval(-2, -116, 58, 86), q = t.q;
  const boyun = () => { q.beginPath(); q.moveTo(0, -38); q.bezierCurveTo(1, -56, 7, -72, 16, -86); q.lineTo(34, -68); q.bezierCurveTo(31, -58, 27, -47, 23, -34); q.closePath(); };
  const kafa = () => { q.beginPath(); q.arc(27, -80, 17, 0, MD_PI2); };
  const burun = () => { q.beginPath(); q.ellipse(40.5, -72.5, 12, 10, -.12, 0, MD_PI2); };
  const kulak = (dx, dy) => { q.beginPath(); q.moveTo(13 + dx, -90 + dy); q.quadraticCurveTo(9 + dx, -106 + dy, 15.5 + dx, -110 + dy); q.quadraticCurveTo(24 + dx, -104 + dy, 24 + dx, -93 + dy); q.closePath(); };
  // uzak kulak (gölgede)
  kulak(-5, 2); q.strokeStyle = p.cz; q.lineWidth = 1.6; q.stroke(); q.fillStyle = p.gk; q.fill();
  // önce dış çizgiler, sonra dolgular: birleşik yumuşak siluet
  q.strokeStyle = p.cz; q.lineWidth = 1.6; boyun(); q.stroke(); kafa(); q.stroke(); burun(); q.stroke(); kulak(0, 0); q.stroke();
  q.fillStyle = p.g; boyun(); q.fill(); kafa(); q.fill(); burun(); q.fill(); kulak(0, 0); q.fill();
  q.fillStyle = mixc(p.y1, '#ffffff', .45); q.beginPath(); q.moveTo(15.5, -94); q.quadraticCurveTo(13.5, -103, 16.5, -106); q.quadraticCurveTo(21, -101, 21, -94); q.closePath(); q.fill();
  // ışık-gölge (yalnız dolgunun üstüne)
  q.save(); q.globalCompositeOperation = 'source-atop';
  const gr = q.createLinearGradient(10, -98, 24, -36); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, p.gk);
  q.fillStyle = gr; q.fillRect(-2, -116, 58, 86);
  q.fillStyle = 'rgba(255,255,255,.3)'; q.beginPath(); q.ellipse(22, -91, 8, 4, -.4, 0, MD_PI2); q.fill();
  q.fillStyle = mixc(p.g, '#ffffff', .35); q.beginPath(); q.ellipse(42, -70.5, 9, 7, -.1, 0, MD_PI2); q.fill();
  q.restore();
  // burun deliği, gülümseme, allık
  q.fillStyle = p.cz; q.globalAlpha = .55; q.beginPath(); q.ellipse(48.5, -75, 1.4, 1.8, .3, 0, MD_PI2); q.fill(); q.globalAlpha = 1;
  q.strokeStyle = p.cz; q.lineWidth = 1.3; q.beginPath(); q.moveTo(40, -66.5); q.quadraticCurveTo(44, -63.5, 48.4, -66.6); q.stroke();
  q.fillStyle = 'rgba(255,140,175,.4)'; q.beginPath(); q.ellipse(33.5, -69.5, 5, 2.9, -.1, 0, MD_PI2); q.fill();
  return t.c;
}
function mdSprite(r) {
  r = ((r | 0) % 5 + 5) % 5;
  if (MD.spr[r]) return MD.spr[r];
  const p = MD_RENK[r], czY = mixc(p.y2, '#4b3a6b', .45), czS = mixc(p.cz, '#9a93ad', .5);
  MD.spr[r] = {
    p, govde: mdGovde(p), bas: mdBas(p), bacak: mdBacak(p, false), bacakU: mdBacak(p, true),
    lA: mdLule(p.y1, p.y2, czY), lB: mdLule(p.y2, p.y1, czY), sA: mdLule(mdSoluk(p.y1), mdSoluk(p.y2), czS), sB: mdLule(mdSoluk(p.y2), mdSoluk(p.y1), czS),
  };
  return MD.spr[r];
}
function mdYildizSpr() {   // yıldız tozu: yumuşak ışık halesi + dört uçlu parıltı (bir kez, bütün renkler ortak)
  if (MD.yildiz) return MD.yildiz;
  const c = document.createElement('canvas'); c.width = c.height = 48; const q = c.getContext('2d');
  const gr = q.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, 'rgba(255,250,225,.95)'); gr.addColorStop(.25, 'rgba(255,225,240,.5)'); gr.addColorStop(1, 'rgba(255,210,240,0)');
  q.fillStyle = gr; q.fillRect(0, 0, 48, 48);
  q.fillStyle = '#fffbea'; q.beginPath(); q.moveTo(24, 6); q.quadraticCurveTo(26, 22, 42, 24); q.quadraticCurveTo(26, 26, 24, 42); q.quadraticCurveTo(22, 26, 6, 24); q.quadraticCurveTo(22, 22, 24, 6); q.fill();
  MD.yildiz = c; return c;
}
// Önbellekleri kareye yayarak ısıt (her çağrıda bir renk); hepsi hazırsa true
function midilliIsit() { for (let r = 0; r < 5; r++) if (!MD.spr[r]) { mdSprite(r); return false; } mdYildizSpr(); return true; }

// Gövdeye göre lüle çiz: (x, y) kök, a açı (0 = dümdüz aşağı; + değer geriye/sola), L uzunluk, k kalınlık
function mdLuleCiz(c, spr, x, y, a, L, k) {
  const sy = L / 30, sx = sy * (k || 1);
  c.save(); c.translate(x, y); c.rotate(a); c.scale(sx, sy); c.drawImage(spr, -9, -3, 18, 37); c.restore();
}
const MD_VARS = { uyku: 0, yon: 1, parilti: 0, kos: 0, zipla: 0, renk: 0 };
function midilliCiz(c, x, y, s, t, o) {
  if (!c || !Number.isFinite(x) || !Number.isFinite(y) || !(s > 0) || !Number.isFinite(t)) return;
  o = o || MD_VARS;
  const uyku = clamp(+o.uyku || 0, 0, 1), par = clamp(o.parilti == null ? 1 - uyku : +o.parilti || 0, 0, 1), kos = clamp(+o.kos || 0, 0, 1),
    z = clamp(+o.zipla || 0, 0, 1), alpha = o.alpha == null ? 1 : clamp(+o.alpha || 0, 0, 1);
  if (alpha < .003) return;
  let yon = Number.isFinite(o.yon) ? clamp(o.yon, -1, 1) : 1; if (Math.abs(yon) < .12) yon = yon < 0 ? -.12 : .12;
  const sp = mdSprite(o.renk || 0), p = sp.p, uyan = 1 - uyku, isik = par * uyan;
  // adım fazı (koşu) ve nefes
  const ph = t * (7 + kos * 4) * 1.0, adim = kos * (1 - z) * uyan, nefes = Math.sin(t * (uyku > .5 ? 1.25 : 2.2));
  const bob = -Math.abs(Math.sin(ph)) * 3.2 * adim + nefes * .5 * uyan;
  const yat = smooth(uyku) * 18;                       // uzanınca üst gövde iner
  const govRot = -z * .2 + Math.sin(ph * 2) * .025 * adim;
  const basRot = smooth(uyku) * .36 - z * .12 + (Number.isFinite(o.bak) ? o.bak * .12 : 0) + Math.sin(t * 1.3) * .03 * uyan - adim * .06;
  const ga = c.globalAlpha;
  c.save(); c.translate(x, y); c.scale(s * yon, s); if (alpha < 1) c.globalAlpha = ga * alpha;

  // uyku nefesi: göğüste yavaşça kabarıp sönen yumuşak ışık (zzz yerine); uyanınca yele ışığı
  c.globalCompositeOperation = 'lighter';
  if (uyku > .02) { const n = .5 + .5 * Math.sin(t * 1.25); c.globalAlpha = ga * alpha * uyku * (.10 + .14 * n); c.drawImage(glow(p.i), 2 - 34, -38 - 34, 68, 68); }
  if (isik > .02) {
    const pul = .75 + .25 * Math.sin(t * 2.6);
    c.globalAlpha = ga * alpha * isik * .34 * pul; c.drawImage(glow(p.y1), 8 - 32, -76 - 32 + yat, 64, 64); c.drawImage(glow(p.y2), -36 - 26, -38 - 26 + yat, 52, 52);
    c.globalAlpha = ga * alpha * isik * .22; c.drawImage(glow(p.i), -40, -88 + yat, 80, 80);
  }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = ga * alpha;

  // bacak açıları: [uzak arka, uzak ön, yakın arka, yakın ön]
  const bac = mdBacakHesap(ph, adim, z, uyku);
  // bütün bacaklar gövdeden önce: tepeleri gövdenin altında kalır (uzaklar gölgeli)
  for (let i = 0; i < 4; i++) mdBacakCiz(c, i < 2 ? sp.bacakU : sp.bacak, MD_KALCA[i][0], MD_KY + yat + bob, bac[i]);
  // üst gövde dönüşümü (zıplamada burun yukarı)
  c.save(); c.translate(0, yat + bob); c.translate(MD_BX, -40); c.rotate(govRot); c.translate(-MD_BX, 40);
  // kuyruk (gövdenin arkasında)
  const kAc = lerp(.42 + kos * .8 + z * .45, 1.25, smooth(uyku)), kSal = .05 + .1 * kos + .05 * isik;
  for (let j = 2; j >= 0; j--) {
    const a = kAc + (j - 1) * .2 + Math.sin(t * 1.9 - j * .8) * kSal, L = (34 - j * 4) * (1 - uyku * .1);
    mdLuleCiz(c, mdLuleSec(sp, j, uyku), -25, -46 + j * 1.5, a, L, 1.35);
  }
  // baş + boyun (gövdenin arkasında başlar; ek yeri gövdeyle örtülür)
  c.save(); c.translate(MD_NP.x, MD_NP.y); c.rotate(basRot); c.translate(-MD_NP.x, -MD_NP.y);
  mdKoy(c, sp.bas);
  c.restore();
  // gövde (nefesle hafifçe kabarır)
  c.save(); c.translate(0, MD_BY + MD_RY); c.scale(1 - nefes * .008, 1 + nefes * (uyku > .5 ? .028 : .012)); c.translate(0, -(MD_BY + MD_RY)); mdKoy(c, sp.govde); c.restore();
  c.restore();
  // yele + perçem + göz (baş dönüşümünde)
  c.save(); c.translate(0, yat + bob); c.translate(MD_BX, -40); c.rotate(govRot); c.translate(-MD_BX, 40);
  c.translate(MD_NP.x, MD_NP.y); c.rotate(basRot); c.translate(-MD_NP.x, -MD_NP.y);
  const ySal = .045 + .12 * kos + .08 * isik, akis = kos * .35 + z * .3;
  for (let i = MD_YELE.length - 1; i >= 0; i--) {
    const m = MD_YELE[i], a = m[3] + akis + Math.sin(t * 2.3 - i * .65) * ySal - uyku * .25;
    mdLuleCiz(c, mdLuleSec(sp, i, uyku), m[0], m[1], a, m[2], 1.3);
  }
  mdLuleCiz(c, mdLuleSec(sp, 1, uyku), 25, -97, -.55 + Math.sin(t * 2.1) * ySal * .6, 14, 1);
  mdLuleCiz(c, mdLuleSec(sp, 0, uyku), 22, -96.5, -.15 + Math.sin(t * 2.1 + .7) * ySal * .6, 12, .95);
  mdGoz(c, p, t, uyku, z);
  // alındaki yıldız (uyanınca parlar)
  const ys = mdYildizSpr();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = ga * alpha * (.25 + .75 * isik) * (.8 + .2 * Math.sin(t * 3)); c.drawImage(ys, 36 - 5.5, -92 - 5.5, 11, 11);
  // yeleden kuyruğa akan ışıltılar (ışıl ışıl dalgalanma)
  if (isik > .03) for (let i = 0; i < MD_YELE.length; i += 2) {
    const m = MD_YELE[i], u = (t * .55 + i * .37) % 1, a = m[3] + akis, L = m[2] * u, r = 3.2 + 1.6 * Math.sin(u * Math.PI);
    c.globalAlpha = ga * alpha * isik * Math.sin(u * Math.PI) * .9;
    c.drawImage(ys, m[0] - Math.sin(a) * L - r, m[1] + Math.cos(a) * L - r, r * 2, r * 2);
  }
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = ga * alpha;
  c.restore();
  if (isik > .03) {   // kuyruk ışıltıları
    c.save(); c.translate(0, yat + bob); c.globalCompositeOperation = 'lighter';
    for (let j = 0; j < 3; j++) { const u = (t * .45 + j * .33) % 1, a = kAc + (j - 1) * .2, L = 30 * u, r = 3 + 1.8 * Math.sin(u * Math.PI);
      c.globalAlpha = ga * alpha * isik * Math.sin(u * Math.PI) * .85; c.drawImage(ys, -25 - Math.sin(a) * L - r, -46 + Math.cos(a) * L - r, r * 2, r * 2); }
    c.restore();
  }
  // toynaktan yıldız tozu: sabit sayılı, analitik (durum yok); koşarken/zıplarken bolca, dururken azıcık
  const toz = isik * (.18 + .82 * Math.max(adim, z));
  if (toz > .02) {
    c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 10; k++) {
      const u = (t * (.85 + (k % 3) * .12) + k * .618) % 1, b = k & 3, a = bac[b];
      const hx = MD_KALCA[b][0] - Math.sin(a.a) * MD_BL * a.l, hy = MD_KY + yat + bob + Math.cos(a.a) * MD_BL * a.l;
      const px = hx - u * (16 + 26 * kos) + Math.sin(u * 9 + k) * 3, py = hy - 2 - u * (14 + 10 * z) - Math.sin(u * Math.PI) * 4, r = (2.2 + (k % 3) * 1.1) * (1 - u * .5);
      c.globalAlpha = ga * alpha * toz * Math.sin(u * Math.PI);
      c.drawImage(ys, px - r, py - r, r * 2, r * 2);
    }
    c.globalCompositeOperation = 'source-over';
  }
  c.globalAlpha = ga;
  c.restore();
}
function mdLuleSec(sp, i, uyku) { return uyku > .5 ? (i % 2 ? sp.sB : sp.sA) : (i % 2 ? sp.lB : sp.lA); }
// Bacak açı/uzunlukları (her çağrıda aynı 4 nesne yeniden kullanılır)
const MD_BAC = [{ a: 0, l: 1 }, { a: 0, l: 1 }, { a: 0, l: 1 }, { a: 0, l: 1 }];
function mdBacakHesap(ph, adim, z, uyku) {
  const yk = smooth(uyku);
  for (let i = 0; i < 4; i++) {
    const on = i === 1 || i === 3, faz = ph + (i === 0 || i === 3 ? 0 : Math.PI) + (on ? .4 : 0);
    let a = Math.sin(faz) * .55 * adim, l = 1 - Math.max(0, Math.cos(faz)) * .16 * adim;
    a += on ? -.85 * z : .75 * z; l *= 1 - .15 * z;
    // uzanırken bacaklar gövdenin altına katlanır
    a = lerp(a, on ? -1.5 : -1.3, yk); l = lerp(l, on ? .7 : .6, yk);
    MD_BAC[i].a = a; MD_BAC[i].l = l;
  }
  return MD_BAC;
}
function mdBacakCiz(c, spr, kx, ky, b) {
  c.save(); c.translate(kx, ky); c.rotate(b.a); c.scale(1, b.l); c.drawImage(spr, -7, -8, 14, 40); c.restore();
}
// İri sevimli göz: açıkken parlak benekli koyu göz + kirpik; uykuda kapalı yumuşak kavis
function mdGoz(c, p, t, uyku, z) {
  const gx = 32, gy = -83;
  const kirp = Math.pow(Math.max(0, Math.sin(t * .9 + 1.3)), 60);   // ara sıra göz kırpar
  const kapak = Math.max(kirp, smooth(clamp((uyku - .25) / .45, 0, 1)));
  c.lineCap = 'round';
  if (kapak > .82) {
    c.strokeStyle = '#4b3768'; c.lineWidth = 1.7;
    c.beginPath(); c.moveTo(gx - 4.6, gy + 1); c.quadraticCurveTo(gx, gy + 4.6, gx + 4.6, gy + 1); c.stroke();
    c.lineWidth = 1.1; c.beginPath(); c.moveTo(gx - 3.6, gy + 2.6); c.lineTo(gx - 5.4, gy + 4.6); c.moveTo(gx - 1.2, gy + 3.6); c.lineTo(gx - 2, gy + 5.8); c.stroke();
    return;
  }
  const ry = 6.8 * (1 - kapak), rx = 5.1;
  c.fillStyle = '#463462'; c.beginPath(); c.ellipse(gx, gy, rx, ry, 0, 0, MD_PI2); c.fill();
  if (ry > 2) {
    c.fillStyle = p.gz; c.beginPath(); c.ellipse(gx + .3, gy + ry * .38, rx * .66, ry * .42, 0, 0, MD_PI2); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(gx - 1.4, gy - ry * .45, 1.75, 0, MD_PI2); c.fill();
    c.beginPath(); c.arc(gx + 1.7, gy + ry * .3, .85, 0, MD_PI2); c.fill();
  }
  c.strokeStyle = '#463462'; c.lineWidth = 1.1;
  c.beginPath(); c.moveTo(gx - 3.6, gy - ry * .8); c.lineTo(gx - 5.8, gy - ry * .8 - 2.2); c.moveTo(gx - 1.6, gy - ry * .98); c.lineTo(gx - 2.8, gy - ry - 2.6); c.stroke();
  if (z > .3) { c.fillStyle = 'rgba(255,140,175,.5)'; c.beginPath(); c.ellipse(gx + 1, gy + 9, 3.2, 1.6, 0, 0, MD_PI2); c.fill(); }
}
const MIDILLI = { ciz: midilliCiz, isit: midilliIsit, renkler: MD_RENK };

// ════════════════════ dünya nesnesi: uyuyan büyülü midilli ════════════════════
// Uyurken yere uzanmış, 'kati' bir kutu: Feza üstüne zıplayınca uyanır ve onu yükseğe sıçratır (pofuduk minderi gibi).
// Uyanınca ayağa kalkar, kutu 'ziplat' olur (her inişte yeniden sıçratır). o.guc ile sıçrama gücü (varsayılan 1150 ≈ 7,5 kare).
function mdUyandir(o) {
  const m = o.md; if (o.uyandi) return;
  o.uyandi = true; m.uyanT = 0; m.zip = 1;
  o.cisim.tip = 'ziplat'; o.cisim.guc = o.guc || 1150;
  if (typeof V6 !== 'undefined') V6.midilli = (V6.midilli || 0) + 1;
  const p = MD_RENK[o.renk];
  burst(o.x, o.y - 40 * o.s, 22, [p.y1, p.y2, '#fff6d8', '#ffffff'], 150, 1.3, 7);
  ripples.push({ x: o.x, y: o.y - 20, r: 0, life: 2 });
  if (typeof dragonHappy === 'function') { try { dragonHappy(o); } catch (e) {} }
  OLAY.emit('midilliUyandi', { n: typeof V6 !== 'undefined' ? V6.midilli : 1, o });
}
TUR.kaydet('midilli', {
  kur(o) {
    o.s = o.s || .9; o.renk = Number.isFinite(o.renk) ? ((o.renk | 0) % 5 + 5) % 5 : MD.sira++ % 5;
    o.uyandi = false; o.yon = o.yon || -1;
    o.md = { t: (o.x * .013) % 7, uyku: 1, uyanT: -1, zip: 0, hop: 0, hopV: 0, hopT: 1.5, kos: 0, yon: o.yon, gor: false, sev: 0, davet: 0 };
    o.cw = o.w || 60 * o.s; o.ch = o.h || 38 * o.s;   // uyurken kutu (harita w/h verebilir); ayakta yükseklik ≈ 1,37 katı
    o.cisim = { w: o.cw, h: o.ch, tip: 'kati', aktif: true, dx: 0, dy: 0 };
  },
  ustune(o) {
    if (!o.uyandi) { mdUyandir(o); P.vy = -(o.guc || 1150); P.ground = false; P.dj = true; OLAY.emit('ziplatti', o); return; }   // ses: muzik.js 'ziplatti' (tip midilli)
    const m = o.md; m.zip = 1; m.sev = 1;
    burst(o.x, o.y - 50 * o.s, 9, [MD_RENK[o.renk].y1, MD_RENK[o.renk].y2, '#ffffff'], 110, .8, 5);
  },
  guncelle(o, dt) {
    if (!(dt > 0) || !Number.isFinite(dt)) return;
    const m = o.md; m.t += dt; m.zip = Math.max(0, m.zip - dt * 2.2); m.sev = Math.max(0, m.sev - dt * .5);
    const dx = P.x - o.x, yakin = Math.abs(dx) < 260 && Math.abs(P.y - o.y) < 200;
    if (!o.uyandi) {
      m.uyku = 1; m.davet = clamp(m.davet + (yakin ? dt : -dt) * 1.5, 0, 1);
      if (!m.gor && DURUM === 'oyun' && Math.abs(dx) < 380 && Math.abs(P.y - o.y) < 260) {
        m.gor = true; if (!MD.gorulen) { MD.gorulen = true; OLAY.emit('midilliGor', { o }); }
      }
      // yumuşak mıknatıs: üstünden atlarken Feza midillinin sırtına süzülür (uyandırmak kolay olsun)
      if (DURUM === 'oyun' && !P.ground && !P.ucus && P.vy > -180 && Math.abs(dx) < 46 * o.s + 10 && P.y < o.y - 34 * o.s && P.y > o.y - 200)
        P.vx = lerp(P.vx, -dx * 5, Math.min(1, dt * 12));
      return;
    }
    // uyanış: baş kalkar, ışık yeleye yayılır, ayağa kalkar
    m.uyanT += dt;
    m.uyku = 1 - smooth(clamp(m.uyanT / 1.1, 0, 1));
    o.cisim.h = o.ch * lerp(1, 1.37, 1 - m.uyku);
    // Feza'ya döner (yavaş, geçiş ezilmeden)
    const hedefYon = Math.abs(dx) > 30 ? (dx > 0 ? 1 : -1) : m.yon >= 0 ? 1 : -1;
    m.yon += (hedefYon - m.yon) * Math.min(1, dt * 5);
    // neşeli kıpırdanma: ara ara küçük sıçrayış, yerinde tepinme
    m.hopT -= dt;
    if (m.uyanT > 1.3 && m.hopT <= 0 && m.hop <= 0) { m.hopV = 140 + Math.random() * 60; m.hopT = 1.4 + Math.random() * 1.6; }
    if (m.hopV || m.hop > 0) { m.hop += m.hopV * dt; m.hopV -= 900 * dt; if (m.hop <= 0) { m.hop = 0; m.hopV = 0; } }
    m.kos = lerp(m.kos, (yakin ? .35 : .18) + m.sev * .3, Math.min(1, dt * 3));
  },
  ciz(o, tm) {
    const m = o.md, s = o.s, hop = m.hop || 0, p = MD_RENK[o.renk];
    // yer gölgesi
    g.save(); g.globalAlpha = .18 * (1 - Math.min(.6, hop / 60)); g.fillStyle = '#3a2a55'; g.beginPath(); g.ellipse(o.x, o.y - 1, 34 * s, 5 * s, 0, 0, MD_PI2); g.fill(); g.restore();
    const z = Math.max(m.zip, clamp(hop / 18, 0, 1));
    midilliCiz(g, o.x, o.y - hop, s, m.t, { uyku: m.uyku, yon: o.uyandi ? m.yon : o.yon, parilti: o.uyandi ? clamp(m.uyanT / 1.2, 0, 1) : 0, kos: o.uyandi ? m.kos * (1 - z) : 0, zipla: z, renk: o.renk });
    // uyurken davet: sırtının üstünde yavaşça inip kalkan küçük ışık damlası (Feza yaklaşınca belirir)
    if (!o.uyandi && m.davet > .02) {
      const yy = o.y - 62 * s - 10 - Math.abs(Math.sin(tm * 2.2)) * 10;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = m.davet * .5; g.drawImage(glow(p.i), o.x - 18, yy - 18, 36, 36);
      g.globalAlpha = m.davet * .85; g.drawImage(mdYildizSpr(), o.x - 6, yy - 6, 12, 12); g.restore();
    }
    // uyanış anı: genişleyen yumuşak ışık halkası
    if (o.uyandi && m.uyanT < 1.6) {
      const u = m.uyanT / 1.6;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (1 - u) * .45; g.strokeStyle = p.y1; g.lineWidth = 3 * (1 - u) + 1;
      g.beginPath(); g.ellipse(o.x, o.y - 30 * s, 30 + u * 110, 14 + u * 50, 0, 0, MD_PI2); g.stroke(); g.restore();
    }
  },
});

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
  // kulaklar ayrı tuvallerde (mdKulak): canlı oynasınlar diye başın arkasında ayrıca çizilir
  // önce dış çizgiler, sonra dolgular: birleşik yumuşak siluet
  q.strokeStyle = p.cz; q.lineWidth = 1.6; boyun(); q.stroke(); kafa(); q.stroke(); burun(); q.stroke();
  q.fillStyle = p.g; boyun(); q.fill(); kafa(); q.fill(); burun(); q.fill();
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
// Kulak: kökü (0,0) (başın içinde kalır), ucu yukarıda. uzak: gölgeli arka kulak
function mdKulak(p, uzak) {
  const t = mdTuval(-11, -21, 20, 26), q = t.q;
  q.beginPath(); q.moveTo(-5.5, 2); q.quadraticCurveTo(-9.5, -14, -3, -18); q.quadraticCurveTo(5.5, -12, 5.5, -1); q.closePath();
  q.strokeStyle = p.cz; q.lineWidth = 1.6; q.stroke(); q.fillStyle = uzak ? p.gk : p.g; q.fill();
  if (!uzak) { q.fillStyle = mixc(p.y1, '#ffffff', .45); q.beginPath(); q.moveTo(-3, -2); q.quadraticCurveTo(-5, -11, -2, -14); q.quadraticCurveTo(2.5, -9, 2.5, -2); q.closePath(); q.fill();
    q.fillStyle = 'rgba(255,255,255,.35)'; q.beginPath(); q.ellipse(-5, -9, 1.2, 3.5, -.2, 0, MD_PI2); q.fill(); }
  return t.c;
}
function mdSprite(r) {
  r = ((r | 0) % 5 + 5) % 5;
  if (MD.spr[r]) return MD.spr[r];
  const p = MD_RENK[r], czY = mixc(p.y2, '#4b3a6b', .45), czS = mixc(p.cz, '#9a93ad', .5);
  MD.spr[r] = {
    p, govde: mdGovde(p), bas: mdBas(p), kulak: mdKulak(p, false), kulakU: mdKulak(p, true), bacak: mdBacak(p, false), bacakU: mdBacak(p, true),
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
// Ek (isteğe bağlı) o alanları: ger 0..1 (gerinme: ön bacaklar ileri, sağrı yukarı), esne 0..1 (esneme: ağız açılır, gözler kapanır),
// saha 0..1 (dans: arka toynaklar üstünde şahlanma), dalga 0..1 (uyanışta yeleye yayılan ışık; verilmezse uykuya göre),
// kulak -1..1 (kulak eğimi ekleme: + öne dikilir), bak -1..1 (+ baş aşağı: burun sürtme).
// kos ≥ ~0,6 tırıstan yumuşakça dörtnala geçer: arka çift → ön çift sırasıyla vuran bacaklar, havada süzülme anı, gövde salınımı.
function midilliCiz(c, x, y, s, t, o) {
  if (!c || !Number.isFinite(x) || !Number.isFinite(y) || !(s > 0) || !Number.isFinite(t)) return;
  o = o || MD_VARS;
  const uyku = clamp(+o.uyku || 0, 0, 1), par = clamp(o.parilti == null ? 1 - uyku : +o.parilti || 0, 0, 1), kos = clamp(+o.kos || 0, 0, 1),
    z = clamp(+o.zipla || 0, 0, 1), alpha = o.alpha == null ? 1 : clamp(+o.alpha || 0, 0, 1);
  if (alpha < .003) return;
  const ger = clamp(+o.ger || 0, 0, 1), esne = clamp(+o.esne || 0, 0, 1), saha = clamp(+o.saha || 0, 0, 1), kulakO = clamp(+o.kulak || 0, -1, 1),
    bak = Number.isFinite(o.bak) ? clamp(o.bak, -1, 1.5) : 0, dalga = o.dalga == null ? -1 : clamp(+o.dalga || 0, 0, 1);
  let yon = Number.isFinite(o.yon) ? clamp(o.yon, -1, 1) : 1; if (Math.abs(yon) < .12) yon = yon < 0 ? -.12 : .12;
  const sp = mdSprite(o.renk || 0), p = sp.p, uyan = 1 - uyku, isik = par * uyan;
  // adım fazı (koşu), dörtnala karışımı ve nefes
  const gal = smooth(clamp((kos - .55) / .45, 0, 1));
  const ph = t * (7 + kos * 5), adim = kos * (1 - z) * uyan * (1 - saha), nefes = Math.sin(t * (uyku > .5 ? 1.25 : 2.2));
  const bob = -(Math.abs(Math.sin(ph)) * 3.2 * (1 - gal) + Math.max(0, Math.sin(ph + .6)) * 7.5 * gal) * adim + nefes * .5 * uyan + ger * 3;
  const yat = smooth(uyku) * 18;                       // uzanınca üst gövde iner
  const govRot = -z * .2 + Math.sin(ph * 2) * .025 * adim * (1 - gal) + Math.sin(ph + 2.2) * .09 * adim * gal + ger * .14;
  const basRot = smooth(uyku) * .36 - z * .12 + bak * .14 + Math.sin(t * 1.3) * .03 * uyan - adim * .06 + Math.sin(ph + 1.2) * .06 * adim * gal + ger * .2 - esne * .3 - saha * .1;
  const ga = c.globalAlpha;
  c.save(); c.translate(x, y); c.scale(s * yon, s); if (alpha < 1) c.globalAlpha = ga * alpha;
  if (saha > .002) { c.translate(-16, 0); c.rotate(-saha * .5); c.translate(16, 0); }   // şahlanma: arka toynaklar üstünde geriye yaslan

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
  const bac = mdBacakHesap(ph, adim, z, uyku, gal, ger, saha);
  // bütün bacaklar gövdeden önce: tepeleri gövdenin altında kalır (uzaklar gölgeli)
  for (let i = 0; i < 4; i++) mdBacakCiz(c, i < 2 ? sp.bacakU : sp.bacak, MD_KALCA[i][0], MD_KY + yat + bob, bac[i]);
  // üst gövde dönüşümü (zıplamada burun yukarı)
  c.save(); c.translate(0, yat + bob); c.translate(MD_BX, -40); c.rotate(govRot); c.translate(-MD_BX, 40);
  // kuyruk (gövdenin arkasında): adımı gecikmeyle izleyen ikincil dalga
  const kAc = lerp(.42 + kos * .8 + gal * .25 + z * .45 + saha * .5, 1.25, smooth(uyku)), kSal = .05 + .1 * kos + .05 * isik;
  const kYan = dalga >= 0 ? dalga > .82 : uyku <= .5;
  for (let j = 2; j >= 0; j--) {
    const a = kAc + (j - 1) * .2 + Math.sin(t * 1.9 - j * .8) * kSal + Math.cos(ph - 1 - j * .6) * .18 * adim, L = (34 - j * 4) * (1 - uyku * .1);
    mdLuleCiz(c, kYan ? (j % 2 ? sp.lB : sp.lA) : (j % 2 ? sp.sB : sp.sA), -25, -46 + j * 1.5, a, L, 1.35);
  }
  // baş + boyun (gövdenin arkasında başlar; ek yeri gövdeyle örtülür). Kulaklar başın arkasında, canlı.
  c.save(); c.translate(MD_NP.x, MD_NP.y); c.rotate(basRot); c.translate(-MD_NP.x, -MD_NP.y);
  const kirpK = Math.pow(Math.max(0, Math.sin(t * .53 + 2)), 40), dinle = Math.sin(t * 1.6) * .06 * uyan;
  const kul = -smooth(uyku) * .55 + kulakO * .4 - gal * .3 * adim + dinle + esne * .15;
  mdKulakCiz(c, sp.kulakU, 13.5, -90, kul + Math.sin(t * 1.6 + .8) * .05 * uyan - .08);
  mdKulakCiz(c, sp.kulak, 18.5, -92, kul - kirpK * .5 * (.4 + .6 * uyan));
  mdKoy(c, sp.bas);
  c.restore();
  // gövde (nefesle hafifçe kabarır)
  c.save(); c.translate(0, MD_BY + MD_RY); c.scale(1 - nefes * .008, 1 + nefes * (uyku > .5 ? .028 : .012)); c.translate(0, -(MD_BY + MD_RY)); mdKoy(c, sp.govde); c.restore();
  c.restore();
  // yele + perçem + göz (baş dönüşümünde)
  c.save(); c.translate(0, yat + bob); c.translate(MD_BX, -40); c.rotate(govRot); c.translate(-MD_BX, 40);
  c.translate(MD_NP.x, MD_NP.y); c.rotate(basRot); c.translate(-MD_NP.x, -MD_NP.y);
  const ySal = .045 + .12 * kos + .08 * isik, akis = kos * .35 + gal * .2 + z * .3, NY = MD_YELE.length;
  const yeleYan = i => dalga >= 0 ? dalga * (NY + 1) > i + 1 : uyku <= .5;
  for (let i = NY - 1; i >= 0; i--) {
    const m = MD_YELE[i], a = m[3] + akis + Math.sin(t * 2.3 - i * .65) * ySal - uyku * .25 + Math.cos(ph - i * .55) * .14 * adim + saha * .25;
    mdLuleCiz(c, yeleYan(i) ? (i % 2 ? sp.lB : sp.lA) : (i % 2 ? sp.sB : sp.sA), m[0], m[1], a, m[2], 1.3);
  }
  const pYan = yeleYan(0);
  mdLuleCiz(c, pYan ? sp.lB : sp.sB, 25, -97, -.55 + Math.sin(t * 2.1) * ySal * .6 + Math.cos(ph) * .1 * adim, 14, 1);
  mdLuleCiz(c, pYan ? sp.lA : sp.sA, 22, -96.5, -.15 + Math.sin(t * 2.1 + .7) * ySal * .6 + Math.cos(ph - .4) * .1 * adim, 12, .95);
  // esneme: açılan yuvarlak ağız + minik dil
  if (esne > .04) {
    const ex = 44.6, ey = -66.2, rx = 2.2 + esne * 2.4, ry = .8 + esne * 4.4;
    c.fillStyle = '#9b3f68'; c.beginPath(); c.ellipse(ex, ey, rx, ry, -.1, 0, MD_PI2); c.fill();
    c.fillStyle = '#ff8fb6'; c.beginPath(); c.ellipse(ex + .3, ey + ry * .45, rx * .7, ry * .45, 0, 0, MD_PI2); c.fill();
  }
  mdGoz(c, p, t, uyku, z, Math.max(esne > .3 ? 1 : 0, ger > .5 ? 1 : 0));
  // alındaki yıldız (uyanınca parlar)
  const ys = mdYildizSpr();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = ga * alpha * (.25 + .75 * isik) * (.8 + .2 * Math.sin(t * 3)); c.drawImage(ys, 36 - 5.5, -92 - 5.5, 11, 11);
  // uyanış ışık dalgası: yelenin içinden aşağı akan parlak cephe
  if (dalga > 0 && dalga < 1) {
    const fi = clamp(dalga * (NY + 1) - 1, 0, NY - 1), m = MD_YELE[Math.floor(fi)], u = fi % 1, a = m[3], L = m[2] * (.3 + .5 * u), r = 9 * Math.sin(dalga * Math.PI) + 3;
    c.globalAlpha = ga * alpha * .95; c.drawImage(ys, m[0] - Math.sin(a) * L - r, m[1] + Math.cos(a) * L - r, r * 2, r * 2);
    c.globalAlpha = ga * alpha * .5; c.drawImage(glow(p.i), m[0] - r * 2.4, m[1] + 8 - r * 2.4, r * 4.8, r * 4.8);
  }
  // yeleden kuyruğa akan ışıltılar (ışıl ışıl dalgalanma)
  if (isik > .03) for (let i = 0; i < NY; i += 2) {
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
  // toynaklar: yere değen toynakta minik parıltı + yıldız tozu (sabit sayılı, analitik; koşarken/zıplarken bolca, dururken azıcık)
  const toz = isik * (.18 + .82 * Math.max(adim, z));
  if (toz > .02) {
    c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 10; k++) {
      const u = (t * (.85 + (k % 3) * .12) + k * .618) % 1, b = k & 3, a = bac[b];
      const hx = MD_KALCA[b][0] - Math.sin(a.a) * MD_BL * a.l, hy = MD_KY + yat + bob + Math.cos(a.a) * MD_BL * a.l;
      const px = hx - u * (16 + 30 * kos) + Math.sin(u * 9 + k) * 3, py = hy - 2 - u * (14 + 10 * z) - Math.sin(u * Math.PI) * 4, r = (2.2 + (k % 3) * 1.1) * (1 - u * .5);
      c.globalAlpha = ga * alpha * toz * Math.sin(u * Math.PI);
      c.drawImage(ys, px - r, py - r, r * 2, r * 2);
    }
    if (adim > .05) for (let b = 2; b < 4; b++) {   // yakın toynaklar yere vurunca parlar
      const a = bac[b], yer = clamp(1 - Math.abs(a.a) * 3, 0, 1) * (a.l > .97 ? 1 : 0); if (yer < .05) continue;
      const hx = MD_KALCA[b][0] - Math.sin(a.a) * MD_BL * a.l, hy = MD_KY + yat + bob + Math.cos(a.a) * MD_BL * a.l;
      c.globalAlpha = ga * alpha * isik * yer * .8; c.drawImage(ys, hx - 6, hy - 7, 12, 12);
    }
    c.globalCompositeOperation = 'source-over';
  }
  c.globalAlpha = ga;
  c.restore();
}
function mdKulakCiz(c, spr, px, py, a) { c.save(); c.translate(px, py); c.rotate(a); c.drawImage(spr, -11, -21, 20, 26); c.restore(); }
// Bacak açı/uzunlukları (her çağrıda aynı 4 nesne yeniden kullanılır). Faz kaymaları: tırıs = çapraz çiftler; dörtnala = arka çift, sonra ön çift.
const MD_BAC = [{ a: 0, l: 1 }, { a: 0, l: 1 }, { a: 0, l: 1 }, { a: 0, l: 1 }];
const MD_TIRIS = [0, Math.PI + .4, Math.PI, .4], MD_DORT = [0, 3.0, .65, 3.7];
function mdBacakHesap(ph, adim, z, uyku, gal, ger, saha) {
  const yk = smooth(uyku), gen = lerp(.55, .82, gal || 0), kat = lerp(.16, .34, gal || 0);
  for (let i = 0; i < 4; i++) {
    const on = i === 1 || i === 3, faz = ph + lerp(MD_TIRIS[i], MD_DORT[i], gal || 0);
    let a = Math.sin(faz) * gen * adim, l = 1 - Math.max(0, Math.cos(faz)) * kat * adim;
    a += on ? -.85 * z : .75 * z; l *= 1 - .15 * z;
    if (ger) { a += on ? -.75 * ger : .2 * ger; if (on) l *= 1 - .12 * ger; }       // gerinme: ön bacaklar ileri uzanır
    if (saha) { if (on) { a -= (i === 3 ? .55 : .85) * saha; l *= 1 - .42 * saha; } else a += .5 * saha; }   // şahlanma: ön bacaklar katlanır, arkalar yere dik
    // uzanırken bacaklar gövdenin altına katlanır
    a = lerp(a, on ? -1.5 : -1.3, yk); l = lerp(l, on ? .7 : .6, yk);
    MD_BAC[i].a = a; MD_BAC[i].l = l;
  }
  return MD_BAC;
}
function mdBacakCiz(c, spr, kx, ky, b) {
  c.save(); c.translate(kx, ky); c.rotate(b.a); c.scale(1, b.l); c.drawImage(spr, -7, -8, 14, 40); c.restore();
}
// İri sevimli göz: açıkken parlak benekli koyu göz + kirpik; uykuda kapalı yumuşak kavis. Ara sıra (bazen çift) göz kırpar.
function mdGoz(c, p, t, uyku, z, kapat) {
  const gx = 32, gy = -83;
  const kf = t * .9 + 1.3, kirp = Math.max(Math.pow(Math.max(0, Math.sin(kf)), 60), Math.sin(kf * .31) > .6 ? Math.pow(Math.max(0, Math.sin(kf - .32)), 60) : 0);
  const kapak = Math.max(kirp, kapat || 0, smooth(clamp((uyku - .25) / .45, 0, 1)));
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
// Uyanış sekansı (m.uyanT): kulaklar dikilir + yeleye ışık yayılır + yıldız tozu halkası → ayağa kalkar → gerinir, esner →
// sevinçle sıçrar. Sonra Feza yanına gelince burnunu ona sürter (kalpler), ara ara neşeyle hoplar. Uykuda tatlı rüya baloncuğu.
function mdBump(u, a, b) { return u <= a || u >= b ? 0 : Math.sin((u - a) / (b - a) * Math.PI); }
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
    o.md = { t: (o.x * .013) % 7, uyku: 1, uyanT: -1, zip: 0, hop: 0, hopV: 0, hopT: 1.5, kos: 0, yon: o.yon, gor: false, sev: 0, davet: 0,
      dalga: 0, ger: 0, esne: 0, kulak: 0, bak: 0, sur: 0, surCd: 0, ilkHop: false, opt: { uyku: 1, yon: 1, parilti: 0, kos: 0, zipla: 0, renk: o.renk, dalga: 0, ger: 0, esne: 0, kulak: 0, bak: 0 } };
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
      m.kulak = Math.pow(Math.max(0, Math.sin(m.t * .7 + o.x)), 30) * .6;   // uykuda bile ara sıra kulağını oynatır
      if (!m.gor && DURUM === 'oyun' && Math.abs(dx) < 380 && Math.abs(P.y - o.y) < 260) {
        m.gor = true; if (!MD.gorulen) { MD.gorulen = true; OLAY.emit('midilliGor', { o }); }
      }
      // yumuşak mıknatıs: üstünden atlarken Feza midillinin sırtına süzülür (uyandırmak kolay olsun)
      if (DURUM === 'oyun' && !P.ground && !P.ucus && P.vy > -180 && Math.abs(dx) < 46 * o.s + 10 && P.y < o.y - 34 * o.s && P.y > o.y - 200)
        P.vx = lerp(P.vx, -dx * 5, Math.min(1, dt * 12));
      return;
    }
    // uyanış sekansı: ışık dalgası yeleye yayılır, ayağa kalkar, gerinir, esner, sevinçle sıçrar
    m.uyanT += dt; const u = m.uyanT;
    m.dalga = clamp(u / .8, 0, 1);
    m.uyku = 1 - smooth(clamp((u - .1) / 1.0, 0, 1));
    m.ger = mdBump(u, 1.2, 2.1); m.esne = mdBump(u, 1.35, 2.05);
    m.kulak = u < .5 ? Math.sin(u / .5 * Math.PI) : 0;
    o.cisim.h = o.ch * lerp(1, 1.37, 1 - m.uyku);
    // Feza'ya döner (yavaş, geçiş ezilmeden)
    const hedefYon = Math.abs(dx) > 30 ? (dx > 0 ? 1 : -1) : m.yon >= 0 ? 1 : -1;
    m.yon += (hedefYon - m.yon) * Math.min(1, dt * 5);
    if (!m.ilkHop && u > 2.15) { m.ilkHop = true; m.hopV = 230; const p = MD_RENK[o.renk]; burst(o.x, o.y - 10, 10, [p.y1, p.y2, '#fff6d8'], 120, .9, 5); }
    // burun sürtme: Feza yanında yerde durunca başını eğip ona sürter, kalpler
    m.surCd -= dt;
    if (u > 2.6 && m.sur <= 0 && m.surCd <= 0 && P.ground && Math.abs(dx) < 85 && Math.abs(P.y - o.y) < 40 && DURUM === 'oyun') {
      m.sur = 1.7; m.surCd = 7; if (typeof drFx === 'function') { try { for (let i = 0; i < 2; i++) drFx(o.x + m.yon * 40 * o.s, o.y - 70 * o.s - i * 12, 'heart'); } catch (e) {} }
    }
    if (m.sur > 0) m.sur = Math.max(0, m.sur - dt);
    m.bak = m.sur > 0 ? mdBump(1.7 - m.sur, 0, 1.7) * (1 + .15 * Math.sin(m.t * 14)) : 0;
    // neşeli kıpırdanma: ara ara küçük sıçrayış, yerinde tepinme
    m.hopT -= dt;
    if (u > 3 && m.hopT <= 0 && m.hop <= 0 && m.sur <= 0) { m.hopV = 140 + Math.random() * 60; m.hopT = 1.4 + Math.random() * 1.6; }
    if (m.hopV || m.hop > 0) { m.hop += m.hopV * dt; m.hopV -= 900 * dt; if (m.hop <= 0) { m.hop = 0; m.hopV = 0; } }
    m.kos = lerp(m.kos, m.sur > 0 ? 0 : (yakin ? .35 : .18) + m.sev * .3, Math.min(1, dt * 3));
  },
  ciz(o, tm) {
    const m = o.md, s = o.s, hop = m.hop || 0, p = MD_RENK[o.renk], ys = mdYildizSpr();
    // yer gölgesi
    g.save(); g.globalAlpha = .18 * (1 - Math.min(.6, hop / 60)); g.fillStyle = '#3a2a55'; g.beginPath(); g.ellipse(o.x, o.y - 1, 34 * s, 5 * s, 0, 0, MD_PI2); g.fill(); g.restore();
    const z = Math.max(m.zip, clamp(hop / 18, 0, 1)), op = m.opt;
    op.uyku = m.uyku; op.yon = o.uyandi ? m.yon : o.yon; op.parilti = o.uyandi ? clamp(m.uyanT / 1.2, 0, 1) : 0; op.kos = o.uyandi ? m.kos * (1 - z) : 0;
    op.zipla = z; op.renk = o.renk; op.dalga = o.uyandi ? m.dalga : 0; op.ger = m.ger; op.esne = m.esne; op.kulak = m.kulak; op.bak = m.bak;
    midilliCiz(g, o.x, o.y - hop, s, m.t, op);
    if (!o.uyandi) mdRuya(o, tm);
    // uyurken davet: sırtının üstünde yavaşça inip kalkan küçük ışık damlası (Feza yaklaşınca belirir)
    if (!o.uyandi && m.davet > .02) {
      const yy = o.y - 62 * s - 10 - Math.abs(Math.sin(tm * 2.2)) * 10;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = m.davet * .5; g.drawImage(glow(p.i), o.x - 18, yy - 18, 36, 36);
      g.globalAlpha = m.davet * .85; g.drawImage(ys, o.x - 6, yy - 6, 12, 12); g.restore();
    }
    // uyanış anı: genişleyen yumuşak ışık halkası + dışa saçılan yıldız tozu halkası
    if (o.uyandi && m.uyanT < 1.6) {
      const u = m.uyanT / 1.6, cx = o.x, cy = o.y - 34 * s;
      g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = (1 - u) * .45; g.strokeStyle = p.y1; g.lineWidth = 3 * (1 - u) + 1;
      g.beginPath(); g.ellipse(cx, o.y - 30 * s, 30 + u * 110, 14 + u * 50, 0, 0, MD_PI2); g.stroke();
      if (u < .3) { g.globalAlpha = (1 - u / .3) * .6; g.drawImage(glow(p.i), cx - 90, cy - 90, 180, 180); }
      const e = 1 - Math.pow(1 - u, 2.2);
      for (let k = 0; k < 14; k++) {
        const an = k / 14 * MD_PI2 + .2, rr = 20 + e * (70 + (k % 3) * 18), r = (5 + (k % 2) * 3) * (1 - u * .7);
        g.globalAlpha = (1 - u) * .95; g.drawImage(ys, cx + Math.cos(an) * rr - r, cy + Math.sin(an) * rr * .7 - u * 20 - r, r * 2, r * 2);
      }
      g.restore();
    }
  },
});
// Uykuda rüya baloncuğu: başın üstünden küçük kabarcıklarla yükselen, içinde yıldız/kalp/ay parlayan yumuşak baloncuk; tepede patlar.
const MD_RUYA_SURE = 4.4;
function mdRuya(o, tm) {
  const s = o.s, q = (tm + o.x * .013) / MD_RUYA_SURE, u = q % 1, ic = Math.floor(q) % 3, p = MD_RENK[o.renk];
  const hx = o.x + o.yon * 26 * s, hy = o.y - 50 * s;
  const gir = smooth(clamp(u / .25, 0, 1)), pat = u > .86 ? (u - .86) / .14 : 0;
  const bx = hx + o.yon * (10 + u * 12) + Math.sin(u * 7) * 3, by = hy - 18 - u * 46, R = (5 + 10 * gir) * s * (1 + pat * .25);
  g.save();
  // küçük düşünce kabarcıkları
  g.fillStyle = 'rgba(255,255,255,.5)';
  for (let k = 0; k < 2; k++) { const a = clamp(u * 4 - k * .6, 0, 1) * (1 - pat); if (a <= 0) continue; g.globalAlpha = a; g.beginPath(); g.arc(hx + o.yon * (3 + k * 5), hy - 6 - k * 7, (1.4 + k) * s, 0, MD_PI2); g.fill(); }
  if (pat < 1) {
    const a = gir * (1 - pat);
    g.globalAlpha = a * .22; g.fillStyle = mixc(p.i, '#ffffff', .4); g.beginPath(); g.arc(bx, by, R, 0, MD_PI2); g.fill();
    g.globalAlpha = a * .7; g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.2; g.stroke();
    g.globalAlpha = a * .8; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(bx - R * .4, by - R * .45, R * .16, R * .26, .6, 0, MD_PI2); g.fill();
    // içindeki rüya
    const r = R * .55, w = 1 + .08 * Math.sin(tm * 3);
    g.globalAlpha = a;
    if (ic === 0) { g.globalCompositeOperation = 'lighter'; g.drawImage(mdYildizSpr(), bx - r * w, by - r * w, r * 2 * w, r * 2 * w); }
    else if (ic === 1) { g.fillStyle = '#ff9fc8'; g.beginPath(); const hr = r * .55 * w; g.moveTo(bx, by + hr * 1.1); g.bezierCurveTo(bx - hr * 2, by - hr * .2, bx - hr * .9, by - hr * 1.6, bx, by - hr * .5); g.bezierCurveTo(bx + hr * .9, by - hr * 1.6, bx + hr * 2, by - hr * .2, bx, by + hr * 1.1); g.fill(); }
    else {   // hilal ay: kesişmeyen kısım (evenodd kırpma)
      g.save(); g.beginPath(); g.rect(bx - r * 2, by - r * 2, r * 4, r * 4); g.arc(bx + r * .38, by - r * .22, r * .6, 0, MD_PI2); g.clip('evenodd');
      g.fillStyle = '#fff1b8'; g.beginPath(); g.arc(bx, by, r * .72, 0, MD_PI2); g.fill(); g.restore();
    }
    g.globalCompositeOperation = 'source-over';
  }
  if (pat > 0) {   // patlayınca minik ışıltılar
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 6; k++) { const an = k / 6 * MD_PI2, rr = R * (1 + pat * 1.4), r = 3 * (1 - pat); g.globalAlpha = 1 - pat; g.drawImage(mdYildizSpr(), bx + Math.cos(an) * rr - r, by + Math.sin(an) * rr - r, r * 2, r * 2); }
  }
  g.restore();
}

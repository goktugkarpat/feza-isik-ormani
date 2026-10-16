/* halka.js – Bölüm 6 (Şenlik Kalesi) halka kapma mini oyunu (önek hk), nesne türü 'halkaMini'.
   Feza ışıklı büyülü bir midilliye biner; midilli fener süslü, bulutların üstünde kıvrılan bir ışık yolunda dörtnala koşar.
   Havada ışık halkaları parıldar: tekli, merdiven gibi yükselen kısa diziler, kanatlı süzülen halkalar ve iri "yıldız halkaları".
   Ekrana dokununca (ya da Boşluk/↑/W) midilli sıçrar, basılı tutunca biraz daha yükselir; havadayken önündeki halka onu nazikçe
   kendine çeker (mıknatıs). Halkadan geçince halka parlayıp genişleyerek yıldız tozuna dağılır, bir kıvılcım ekranın üstündeki
   yazısız ışık dizisine (sayaç) uçar, Pırıl sevinçle takla atar (OLAY 'halka' {n}). Kaçırılan halka ileri süzülüp sonra yeniden gelir.
   12 halkalık oyun yolundan sonra "büyük final koşusu": midilli çok hızlanır, kenarlardan ışık hızı çizgileri akar, yoldaki fenerler
   geçtikçe yanar, altın kemer halkaları art arda kendiliğinden toplanır; yolun ucunda midilli büyük bir sıçrayışla (sinematik
   yavaşlama) kalenin köprüsü önüne süzülerek iner, yıldız tozu patlar; sonra Feza'yı indirir (V6.mini, OLAY 'halkaBitti').
   Kaybetme, ceza, süre baskısı yok: ~12 sn dokunulmazsa sıradaki halka parlar ve Pırıl ona uçup gösterir; ~20 sn dokunulmazsa
   (ya da yolun sonuna az yer kaldıysa) Pırıl halkaları kendisi toplar; final koşusu her durumda gelir, yani yolculuk asla takılmaz.
   Sanal yol: haritadaki boşluk (~4500 birim) ~70 sn'lik hızlı koşuya yetmez. Bu yüzden yol, halkalar, fenerler ve tozlar "sanal yol"
   (o.v) üzerinde durur; dünyaya o.dx kaymasıyla çizilir (dünya x = sanal + o.dx). Midillinin dünya x'i (o.mx = hkEsle) başta ve sonda
   sanalla birebir (uçurum ve iniş düzlüğü yola yapışık), ortada yavaş ilerler: kamera ve uzak dünya yavaş, yol katmanı hızlı akar.
   HALKA.kayma() = yol katmanının dünyaya göre fazladan kayması (paralaks için, dunya6 isterse kullanır).
   Fizik devralma B5 lavsal.js gibi: P.ucus = o, motor her adımda o.adim(dt, OM_UCUS_GIRDI) çağırır; Feza ve Pırıl'ı bu dosya çizer.
   Yerleşim (bolum6.js): nesne('halkaMini', c, yuzey(c), { inisX, inisY (köprü önündeki iniş noktası), yol (isteğe bağlı: yolun taban y'si) })
     ya da aynı alanlar BOLUM.halka içinde. inisX yoksa x1 kullanılır.
   Olaylar: halkaBasla, halkaZipla, halkaInis, halka {n, top, kim, tip}, halkaKacti, halkaHiz (final koşusu başladı; eski adı halkaKosu
     da yayılır), halkaFener {i} (final koşusunda bir fener yandı), halkaKemer {i, top} (altın kemer halkası), halkaFinalSicrama,
     halkaFinalInis, halkaBitti. Konuşmalar ses.js'te bu olaylara bağlıdır; burada SES çağrılmaz.
   Bitince: V6.mini = true, o.hk.bitti = true (kapi.js uyumu için o.skl aynı nesne), OLAY 'halkaBitti'. Karede gradyan/filtre yok. */
'use strict';
const HK_TOP = 12;                                   // toplanacak halka (sayaç ışıkları)
const HK_BINIS = 1.6, HK_INIS = 1.7, HK_SIC = 2.9;   // biniş, iniş, final sıçrayışı (sn)
const HK_LY = 17400, HK_LF = 9400;                   // sanal yol: oyun bölümü, final koşusu (birim)
const HK_V0 = 300, HK_V1 = 420, HK_VF = 1080;        // koşu hızı: başta, oyun sonunda, finalde (birim/sn)
const HK_A0 = 520, HK_B0 = 700, HK_B1 = 800, HK_E = 1150;   // sanal→dünya eşlemesi: baştaki/sondaki birebir parça ve geçişler
const HK_IPUCU = 12, HK_YARDIM = 20;                 // dokunulmadan geçen süre: ipucu / Pırıl kendisi toplar
const HK_MOLC = 1;            // midilliCiz ölçeği (s = 1'de sırt ≈ 60 birim)
const HK_SIRT = 57;           // midillinin toynak tabanından eyere (Feza'nın oturma noktası)
const HK_SEDX = -9;           // eyerin toynak ortasına göre x kayması
const HK_GOVDE = 24;          // oturma noktasından Feza'nın göğsüne (halka denetim noktası)
const HK_TOL = 60;            // halka içi dikey tolerans (cömert)
const HK_RX = 24, HK_RY = 64;
const HK_RENK = ['#ffd77a', '#ff9fcf', '#c9a2ff', '#9fe8ff'];
const HK_IC = ['#fff6d6', '#ffe3f1', '#f1e6ff', '#e6faff'];
const HK_KOYU = ['#c98a2c', '#c0559a', '#7f5bc0', '#3d93b5'];
const HK_TOZ = ['#fff4c8', '#ffd77a', '#ff9fcf', '#c9a2ff', '#9fe8ff'];
// Halka dizisi (sanal konum, tür, yükseklik = denetim noktasının üstü, renk). Tür: tek · mer (merdiven) · suz (kanatlı süzülen) · yil (yıldız halkası)
const HK_DIZI = [
  [1300, 'tek', 72, 0], [2750, 'tek', 92, 1], [4250, 'suz', 100, 3],
  [5750, 'mer', 60, 0], [6100, 'mer', 105, 1], [6450, 'mer', 150, 2],
  [8050, 'tek', 120, 3], [9600, 'yil', 118, 0], [11150, 'suz', 135, 2],
  [12650, 'mer', 70, 1], [13000, 'mer', 125, 3], [14700, 'yil', 140, 0]];
const HK_KEMER = 8, HK_KEMER_V = 4300, HK_KEMER_ARA = 250;   // final altın kemeri: oyun yolundan sonra +4300'den başlar
const HK_FENER_ARA = 600, HK_FFENER_ARA = 320;               // fener direkleri: oyun yolunda / final koşusunda (hızla yanar)
const HALKA = {
  o: null, aktif() { return !!this.o && P.ucus === this.o; }, baslat(o) { o = o || this.o; if (o) hkBasla(o); return o; },
  kayma() { const o = this.o; return o && o.K ? o.K.xs - o.dx : 0; },   // yol katmanının dünyaya göre fazladan kayması (birim)
  hiz() { return this.o ? this.o.spd || 0 : 0; }, faz() { return this.o ? this.o.faz : null; }
};

function hkSfx(ad, v) { if (typeof AU !== 'undefined' && AU && typeof AU.sfx === 'function') { try { AU.sfx(ad, v); } catch (e) {} } }

// ── önbellekli çizimler (yalnız ilk kullanımda üretilir) ──
const hkHalkaArts = {};
function hkHalkaArt(k) {   // k: 0..3 renkli halka | 'yil' yıldız halkası. Sol yarı arkaya, sağ yarı öne çizilir. 2× çözünürlük.
  if (hkHalkaArts[k]) return hkHalkaArts[k];
  const yil = k === 'yil', rx = yil ? 31 : HK_RX, ry = yil ? 84 : HK_RY, hw = yil ? 54 : 40, hh = yil ? 106 : 80;
  const c = document.createElement('canvas'); c.width = hw * 4; c.height = hh * 4; const q = c.getContext('2d');
  q.scale(2, 2); q.translate(hw, hh);
  const i = yil ? 0 : k, col = HK_RENK[i], ic = HK_IC[i], koyu = HK_KOYU[i];
  if (yil) {   // gökkuşağı hâlesi (yumuşak, katmanlı)
    const gk = ['#ff9fcf', '#ffd77a', '#9fe8ff', '#c9a2ff'];
    for (let j = 0; j < 4; j++) { q.strokeStyle = gk[j]; q.globalAlpha = 0.16; q.lineWidth = 9; q.beginPath(); q.ellipse(0, 0, rx + 9 - j * 2.5, ry + 9 - j * 2.5, 0, 0, 6.2832); q.stroke(); }
  }
  for (let j = 0; j < 4; j++) { q.strokeStyle = col; q.globalAlpha = 0.07 + j * 0.05; q.lineWidth = 17 - j * 3.5; q.beginPath(); q.ellipse(0, 0, rx, ry, 0, 0, 6.2832); q.stroke(); }
  q.globalAlpha = 1;
  const gr = q.createLinearGradient(0, -ry, 0, ry); gr.addColorStop(0, ic); gr.addColorStop(0.45, col); gr.addColorStop(1, koyu);
  q.strokeStyle = gr; q.lineWidth = yil ? 6.5 : 5; q.beginPath(); q.ellipse(0, 0, rx, ry, 0, 0, 6.2832); q.stroke();
  q.strokeStyle = 'rgba(255,255,255,.85)'; q.lineWidth = 1.4; q.beginPath(); q.ellipse(-1, -1, rx - 1.5, ry - 1.5, 0, Math.PI * 0.95, Math.PI * 1.55); q.stroke();
  q.strokeStyle = 'rgba(255,255,255,.5)'; q.lineWidth = 1; q.beginPath(); q.ellipse(1, 1, rx + 0.5, ry + 0.5, 0, Math.PI * 0.05, Math.PI * 0.45); q.stroke();
  const tas = (x, y, r) => {   // küçük taş (elmas)
    q.fillStyle = koyu; q.beginPath(); q.moveTo(x, y - r); q.lineTo(x + r * 0.72, y); q.lineTo(x, y + r); q.lineTo(x - r * 0.72, y); q.closePath(); q.fill();
    q.fillStyle = ic; q.beginPath(); q.moveTo(x, y - r * 0.72); q.lineTo(x + r * 0.4, y); q.lineTo(x, y + r * 0.2); q.lineTo(x - r * 0.4, y); q.closePath(); q.fill();
  };
  if (yil) {   // kenarda sekiz yıldız ucu
    for (let j = 0; j < 8; j++) {
      const a = j / 8 * 6.2832, x = Math.cos(a) * rx, y = Math.sin(a) * ry, nx = Math.cos(a) / rx, ny = Math.sin(a) / ry, nl = Math.hypot(nx, ny), ux = nx / nl, uy = ny / nl, r = j % 2 ? 6 : 9;
      q.fillStyle = '#fff3c4'; q.beginPath(); q.moveTo(x + ux * r * 1.4, y + uy * r * 1.4); q.lineTo(x - uy * r * 0.45, y + ux * r * 0.45); q.lineTo(x - ux * r * 0.3, y - uy * r * 0.3); q.lineTo(x + uy * r * 0.45, y - ux * r * 0.45); q.closePath(); q.fill();
      q.fillStyle = '#ffc94d'; q.beginPath(); q.arc(x, y, 2.4, 0, 6.2832); q.fill();
    }
  } else for (const [x, y] of [[0, -ry], [0, ry], [-rx, 0], [rx, 0]]) tas(x, y, 5);
  return hkHalkaArts[k] = { c, hw, hh };
}
let hkFenerArt = null, hkFenerSonukArt = null;
function hkFenerCiz(sonuk) {   // fener gövdesi: 36×56 dünya birimi, asma noktası (18,0). sonuk: yanmamış (soluk mor cam)
  if (sonuk ? hkFenerSonukArt : hkFenerArt) return sonuk ? hkFenerSonukArt : hkFenerArt;
  const c = document.createElement('canvas'); c.width = 72; c.height = 112; const q = c.getContext('2d'); q.scale(2, 2); q.translate(18, 0);
  q.strokeStyle = '#3b2c55'; q.lineWidth = 1.6; q.beginPath(); q.moveTo(0, 0); q.lineTo(0, 8); q.stroke();
  q.fillStyle = '#4a3768'; q.beginPath(); q.moveTo(-10, 14); q.quadraticCurveTo(0, 4, 10, 14); q.closePath(); q.fill();
  const gr = q.createLinearGradient(0, 14, 0, 42);
  if (sonuk) { gr.addColorStop(0, '#9b8cc0'); gr.addColorStop(0.6, '#776aa0'); gr.addColorStop(1, '#5e5288'); }
  else { gr.addColorStop(0, '#fff3c4'); gr.addColorStop(0.6, '#ffc76a'); gr.addColorStop(1, '#ff9a6a'); }
  q.fillStyle = gr; q.beginPath(); q.moveTo(-9, 15); q.quadraticCurveTo(-14, 28, -8, 40); q.lineTo(8, 40); q.quadraticCurveTo(14, 28, 9, 15); q.closePath(); q.fill();
  q.strokeStyle = '#5a3f78'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(-3, 15); q.quadraticCurveTo(-5, 28, -3, 40); q.moveTo(3, 15); q.quadraticCurveTo(5, 28, 3, 40); q.stroke();
  q.fillStyle = '#4a3768'; q.beginPath(); q.moveTo(-9, 40); q.lineTo(9, 40); q.lineTo(5, 46); q.lineTo(-5, 46); q.closePath(); q.fill();
  q.fillStyle = sonuk ? '#8d7fb5' : '#ffd77a'; q.beginPath(); q.arc(0, 49, 2.2, 0, 6.2832); q.fill();
  q.fillStyle = sonuk ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.75)'; q.beginPath(); q.ellipse(-4.5, 24, 1.6, 5, 0.15, 0, 6.2832); q.fill();
  if (sonuk) hkFenerSonukArt = c; else hkFenerArt = c;
  return c;
}
let hkBulutArt = null, hkSisArt = null;
function hkBulutCiz() {   // yolun altındaki bulut yastığı: 260×110 dünya birimi
  if (hkBulutArt) return hkBulutArt;
  const c = document.createElement('canvas'); c.width = 520; c.height = 220; const q = c.getContext('2d'); q.scale(2, 2);
  const r = rng(6161);
  const tabaka = [['#5b4a86', 0.55, 0], ['#7a64a6', 0.7, -6], ['#a58cc6', 0.55, -12], ['#e5c9ee', 0.35, -17]];
  for (const [col, a, dy] of tabaka) {
    q.fillStyle = col; q.globalAlpha = a;
    for (let i = 0; i < 9; i++) { const x = 30 + i * 25 + r() * 10, rr = 22 + Math.sin(i / 8 * Math.PI) * 18 + r() * 8; q.beginPath(); q.arc(x, 72 + dy + (rr > 34 ? -6 : 0), rr * (1 + dy / 60), 0, 6.2832); q.fill(); }
  }
  q.globalAlpha = 1; return hkBulutArt = c;
}
function hkSisCiz() {   // önden hızla geçen ince bulut tülü: 320×90 birim, açık leylak-pembe
  if (hkSisArt) return hkSisArt;
  const c = document.createElement('canvas'); c.width = 640; c.height = 180; const q = c.getContext('2d'); q.scale(2, 2);
  const r = rng(717);
  for (const [col, a, dy] of [['#b79ad6', 0.22, 8], ['#e8cdf0', 0.22, 0], ['#fff0f6', 0.18, -6]]) {
    q.fillStyle = col; q.globalAlpha = a;
    for (let i = 0; i < 11; i++) { const x = 25 + i * 27 + r() * 8, rr = 14 + Math.sin(i / 10 * Math.PI) * 18 + r() * 6; q.beginPath(); q.ellipse(x, 52 + dy, rr * 1.5, rr * 0.8, 0, 0, 6.2832); q.fill(); }
  }
  q.globalAlpha = 1; return hkSisArt = c;
}
const hkYildizArts = [];
function hkYildizArt(ci) {   // dört köşeli parıltı yıldızı + yumuşak hâle: 24×24 birim (merkez 12,12), 2× çözünürlük
  if (hkYildizArts[ci]) return hkYildizArts[ci];
  const c = document.createElement('canvas'); c.width = c.height = 48; const q = c.getContext('2d'); q.scale(2, 2); q.translate(12, 12);
  const col = HK_TOZ[ci];
  const gr = q.createRadialGradient(0, 0, 0, 0, 0, 12); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)');
  q.globalAlpha = 0.45; q.fillStyle = gr; q.beginPath(); q.arc(0, 0, 12, 0, 6.2832); q.fill(); q.globalAlpha = 1;
  const yz = (r, f) => { q.fillStyle = f; q.beginPath(); q.moveTo(0, -r); q.quadraticCurveTo(r * 0.14, -r * 0.14, r, 0); q.quadraticCurveTo(r * 0.14, r * 0.14, 0, r); q.quadraticCurveTo(-r * 0.14, r * 0.14, -r, 0); q.quadraticCurveTo(-r * 0.14, -r * 0.14, 0, -r); q.fill(); };
  yz(8, col); yz(4, '#fffdf2');
  return hkYildizArts[ci] = c;
}
let hkKanatArt = null;
function hkKanatCiz() {   // süzülen halkanın minik ışık kanadı: 30×22 birim, kök (2,18)
  if (hkKanatArt) return hkKanatArt;
  const c = document.createElement('canvas'); c.width = 60; c.height = 44; const q = c.getContext('2d'); q.scale(2, 2);
  for (const [col, a, k] of [['#e6faff', 0.95, 1], ['#bfeaff', 0.8, 0.72], ['#ffffff', 0.9, 0.42]]) {
    q.fillStyle = col; q.globalAlpha = a; q.beginPath(); q.moveTo(2, 18);
    q.quadraticCurveTo(6 + 6 * k, 18 - 18 * k, 28 * k + 2, 2 + 4 * (1 - k)); q.quadraticCurveTo(18 * k + 2, 14, 2, 18); q.fill();
  }
  q.globalAlpha = 1; return hkKanatArt = c;
}

// ── sanal yol ──
function hkEsle(K, v) {   // sanal yol uzunluğu → midillinin dünya x'i (K.xs'ten itibaren). Başta ve sonda eğim 1, ortada K.r.
  if (K.lin) return v * K.lin;
  const r = K.r;
  if (v <= HK_A0) return v;
  if (v <= HK_A0 + HK_B0) { const u = (v - HK_A0) / HK_B0; return HK_A0 + HK_B0 * (u + (r - 1) * (u * u * u - u * u * u * u / 2)); }
  const X1 = HK_A0 + HK_B0 * (1 + r) / 2, v1 = HK_A0 + HK_B0, v2 = K.vE - HK_B1;
  if (v <= v2) return X1 + r * (v - v1);
  const X2 = X1 + r * (v2 - v1);
  if (v <= K.vE) { const u = (v - v2) / HK_B1; return X2 + HK_B1 * (r * u + (1 - r) * (u * u * u - u * u * u * u / 2)); }
  return X2 + HK_B1 * (1 + r) / 2 + (v - K.vE);
}
function hkYolV(o, v) {   // sanal konumda yolun üst kenarı (dünya y)
  const K = o.K;
  const a = smooth(clamp(v / 700, 0, 1));                                                     // uçurumdan kalkış
  const dalga = -(Math.sin(v * 0.0016) * 0.5 + 0.5) * 44 - (Math.sin(v * 0.00047 + 1.3) * 0.5 + 0.5) * 40 - Math.sin(v * 0.0041 + 0.7) * 9;
  const son = smooth(clamp((v - (K.vJ - 1000)) / 1000, 0, 1));                               // ucunda hafif yükselen sıçrama rampası
  return lerp(o.y0, K.yol + dalga * (1 - son * 0.7), a) - son * 36;
}
function hkYolY(o, x) { return hkYolV(o, x - o.dx); }   // dünya x'te yol

// ── yıldız tozu havuzu (sabit boy; konumlar sanal yolda: x + o.dx ile çizilir, yolla birlikte akar) ──
const HK_HAVUZ = 260;
const hkToz = []; for (let i = 0; i < HK_HAVUZ; i++) hkToz.push({ x: 0, y: 0, vx: 0, vy: 0, l: 0, m: 1, c: 0, s: 1, g: 40 });
let hkTozI = 0;
function hkDX() { return HALKA.o ? HALKA.o.dx || 0 : 0; }
function hkTozAt(wx, wy, vx, vy, life, ci, s, gr) { const p = hkToz[hkTozI]; hkTozI = (hkTozI + 1) % HK_HAVUZ; p.x = wx - hkDX(); p.y = wy; p.vx = vx; p.vy = vy; p.l = p.m = life; p.c = ci; p.s = s; p.g = gr === undefined ? 40 : gr; }
function hkTozPatla(x, y, n, hiz, vxEk, ci0) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.2832, v = hiz * (0.35 + Math.random() * 0.75); hkTozAt(x, y, Math.cos(a) * v + (vxEk || 0), Math.sin(a) * v * 0.8 - 30, 0.8 + Math.random() * 0.8, ci0 === undefined ? i % HK_TOZ.length : ci0, 2.4 + Math.random() * 3); }
}
function hkTozAdim(dt) { const k = Math.exp(-dt * 1.8); for (const p of hkToz) { if (p.l <= 0) continue; p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= k; p.vy = p.vy * k + p.g * dt; } }
function hkTozCiz() {
  const dx = hkDX(), xa = cam.x - 40 - dx, xb = cam.x + VW + 40 - dx;
  for (const p of hkToz) {
    if (p.l <= 0 || p.x < xa || p.x > xb) continue;
    const u = p.l / p.m, r = p.s * (1.6 + 1.4 * u) * (0.85 + 0.15 * Math.sin(p.l * 17 + p.c));
    g.globalAlpha = Math.min(1, u * 1.5); g.drawImage(hkYildizArt(p.c), p.x + dx - r, p.y - r, r * 2, r * 2);
  }
  g.globalAlpha = 1;
}
function hkYildiz(x, y, r, col, a) {   // tekil parıltı (sprite)
  if (a <= 0.01) return;
  const ci = Math.max(0, HK_TOZ.indexOf(col)); g.globalAlpha = Math.min(1, a); g.drawImage(hkYildizArt(ci), x - r * 1.5, y - r * 1.5, r * 3, r * 3); g.globalAlpha = 1;
}

// ── ekran efektleri: rüzgâr çizgileri, ışık hızı çizgileri, hızla geçen bulutlar, sayaç kıvılcımları (sabit havuzlar) ──
const HK_RUZ = 26, hkRuz = []; for (let i = 0; i < HK_RUZ; i++) hkRuz.push({ x: -1, y: 0, l: 0, k: 1 });
const HK_ISIK = 56, hkIsik = []; for (let i = 0; i < HK_ISIK; i++) hkIsik.push({ a: 0, d: -1, c: i % 3, w: 1 });
const HK_KIV = 8;

// ── kurulum / başlama ──
function hkKur(o) {
  const B = (typeof BOLUM !== 'undefined' && BOLUM.halka) || {};
  const al = k => Number.isFinite(o[k]) ? o[k] : Number.isFinite(B[k]) ? B[k] : null;
  const x1 = al('inisX') !== null ? al('inisX') : al('x1') !== null ? al('x1') : o.x + 190 * T;   // iniş noktası (köprü önü)
  const yol = al('yol') !== null ? al('yol') : o.y - 20;
  let gy = al('inisY') !== null ? al('inisY') : o.y;
  if (al('inisY') === null && typeof yuzey === 'function') { try { const v = yuzey(Math.floor(x1 / T)); if (Number.isFinite(v) && v < ROWS * T) gy = v; } catch (e) {} }
  const xs = o.x + 70, xJ = Math.max(xs + 1600, x1 - 950), vJ = HK_LY + HK_LF, vE = vJ - HK_E;
  const K = { x0: o.x, x1, xs, xJ, xL: x1 - 120, yol, gy, Ly: HK_LY, vJ, vE, r: 0.1, lin: 0 };
  // ortadaki eğim: ∫ eğim = xJ - xs olacak biçimde (kapalı biçim). Tutmazsa düz orantı.
  const pay = HK_B0 / 2 + (vE - HK_B1 - HK_A0 - HK_B0) + HK_B1 / 2, sabit = HK_A0 + HK_B0 / 2 + HK_B1 / 2 + HK_E;
  K.r = (xJ - xs - sabit) / pay;
  if (!(K.r > 0.02 && K.r <= 1) || vE - HK_B1 < HK_A0 + HK_B0) K.lin = (xJ - xs) / vJ;
  o.K = K;
  o.kx = o.x; o.y0 = o.y; o.faz = 'bekle'; o.t = 0; o.total = 0; o.done = false; o.hk = { bitti: false }; o.skl = o.hk;
  o.v = 0; o.vOn = 0; o.dx = xs; o.spd = 0; o.ts = 1;
  o.mx = o.x; o.my = o.y; o.h = 0; o.vh = 0; o.rot = 0; o.kos = 0; o.kosM = 0; o.joy = 0; o.idle = 0; o.bas = false; o.n = 0; o.isik = 0;
  o.mt = 0; o.ft = 0; o.pt = 0; o.sq = 0; o.sqv = 0; o.egil = 0; o.sevT = 0; o.tk = 0; o.tkYon = 1; o.kirp = 0; o.bonus = 0; o.kalk = 0;
  o.zorYardim = false; o.prX = 0; o.prY = 0; o.prW = 0; o.ipucu = 0; o.halkaA = 0; o.kacan = 0; o.gidisT = 0;
  o.hizA = 0; o.flas = 0; o.sayA = 0; o.nGor = 0; o.pop = new Float32Array(HK_TOP).fill(-1); o.fenerI = -1; o.izT = 0;
  o.kv = []; for (let i = 0; i < HK_KIV; i++) o.kv.push({ a: false, t: 0, sx: 0, sy: 0, i: 0 });
  o.iz = new Float32Array(84); o.iz2 = new Float32Array(84); o.izN = 0; o.izI = 0;   // yele ve kuyruk ışık izi (42 nokta; x sanal)
  o.halkalar = HK_DIZI.map(([v, tip, lift, ci], i) => ({ i, v, tip, lift, ci, d: 'bekle', t: 0, x: 0, y: 0, kac: 0, yardim: false, fv: 0, tv: 0, fl: 0, faz: i * 1.7 }));
  o.kemer = []; for (let i = 0; i < HK_KEMER; i++) o.kemer.push({ i, v: HK_LY + HK_KEMER_V + i * HK_KEMER_ARA, d: 'bekle', t: 0, x: 0, y: 0 });
  o.fzOpt = { el: { x: 20, y: -9 }, vy: 0, sevinc: 0, aci: 0, ruzgar: 0.5 };
  o.mOpt = { uyku: 0, yon: 1, parilti: 1, kos: 0, zipla: 0, renk: 3 };
  o.adim = (dt, input) => hkAdim(o, dt, input);
  if (typeof BOLUM !== 'undefined') {
    if (!BOLUM.ucus) BOLUM.ucus = { x0: o.x, x1, yUst: yol - 330, yAlt: yol + 80 };   // uçuş kamerası koridoru (harita vermediyse)
    BOLUM.halkaTop = HK_TOP;   // sonuç kartı ve ses: 12 halka (oyun.js SAYAC.halkaTop'u kurulumdan sonra buradan okur)
  }
  if (typeof SAYAC !== 'undefined' && SAYAC.halkaTop) SAYAC.halkaTop = HK_TOP;
  for (const k of [0, 1, 2, 3, 'yil']) hkHalkaArt(k);
  hkFenerCiz(false); hkFenerCiz(true); hkBulutCiz(); hkSisCiz(); hkKanatCiz(); for (let i = 0; i < HK_TOZ.length; i++) hkYildizArt(i);
  HALKA.o = o;
}
function hkBasla(o) {
  if (!o || o.done || o.faz !== 'bekle' || P.ucus || DURUM !== 'oyun' || P.fade > 0) return;
  if (typeof D !== 'undefined' && D.mode === 'tasi') return;
  o.faz = 'binis'; o.t = 0; o.total = 0; o.px0 = P.x; o.py0 = P.y; o.idle = 0; o.bas = false; o.h = 0; o.vh = 0; o.v = 0; o.vOn = 0; o.dx = o.K.xs; o.spd = 0;
  P.ucus = o; P.vx = P.vy = 0; P.kilit = 0; P.fade = 0; P.buf = 0; HALKA.o = o;
  if (typeof SAYAC !== 'undefined') SAYAC.halkaTop = HK_TOP;
  if (typeof omHepsiniBirak === 'function') omHepsiniBirak();
  o.prX = P.x - 80; o.prY = P.y - 90;
  OLAY.emit('halkaBasla', { o, top: HK_TOP });
}

// ── her fizik adımı (P.ucus === o iken motor çağırır) ──
function hkAdim(o, dt, input) {
  if (!(dt > 0) || !Number.isFinite(dt) || DURUM !== 'oyun' || P.ucus !== o) return;
  dt = Math.min(dt, 0.05);
  const K = o.K, basili = !!(input && (input.basili || input.eksenY < 0));
  o.ts = 1;
  if (o.faz === 'sicrama') { const u = clamp(o.t / HK_SIC, 0, 1); o.ts = 1 - 0.62 * Math.sin(Math.PI * clamp(u * 1.12, 0, 1)); }   // sinematik yavaşlama
  const dtA = dt * o.ts;   // canlandırma saati (yavaşlamada yavaşlar)
  o.t += dt; o.total += dt; o.joy = Math.max(0, o.joy - dt * 0.7); o.sevT = Math.max(0, o.sevT - dt); o.kirp = Math.max(0, o.kirp - dt); o.bonus = Math.max(0, o.bonus - dt);
  if (o.tk > 0) { o.tk += dt / 0.8; if (o.tk >= 1) { o.tk = 0; o.kirp = 0.7; } }
  P.vx = P.vy = 0; P.ground = false; P.f = 1;
  o.halkaA = Math.min(1, o.halkaA + dt * (o.faz === 'bekle' ? 0 : 0.9));
  // yay: zıplarken uzanma (+), inişte toplanma (−)
  o.sqv += (-o.sq * 170 - o.sqv * 13) * dt; o.sq += o.sqv * dt;
  const hizK = clamp(o.spd / HK_VF, 0, 1);
  o.mt += dtA * clamp(0.9 + o.spd / 420, 1, 2.5); o.ft += dtA; o.pt += dtA * (1 + o.spd / 700 + o.joy * 0.4);
  if (o.faz === 'binis') {
    const u = clamp(o.t / HK_BINIS, 0, 1), atla = smooth(clamp(u / 0.6, 0, 1)), yuru = smooth(clamp((u - 0.55) / 0.45, 0, 1));
    o.mx = lerp(o.kx, K.xs, yuru); o.my = hkYolY(o, o.mx); o.kosM = yuru * 0.7;
    if (u > 0.58 && !o.kalk) { o.kalk = 1; o.sqv -= 5; hkTozPatla(o.mx, o.my - 6, 14, 120, 0, 1); }   // Feza oturunca midilli sevinçle şahlanır
    o.rot = -0.2 * Math.sin(clamp((u - 0.58) / 0.42, 0, 1) * Math.PI);
    const sx = o.mx + HK_SEDX, sy = o.my - HK_SIRT;
    P.x = lerp(o.px0, sx, atla); P.y = lerp(o.py0, sy, atla) - Math.sin(atla * Math.PI) * 46;
    for (const r of o.halkalar) hkHalkaYer(o, r);
    if (u >= 1) { o.faz = 'yol'; o.t = 0; o.idle = 0; o.spd = 120; }
  } else if (o.faz === 'yol' || o.faz === 'hiz') {
    const hedef = o.faz === 'yol' ? lerp(HK_V0, HK_V1, smooth(clamp(o.v / HK_LY, 0, 1))) : HK_VF;
    o.spd = lerp(o.spd, hedef, 1 - Math.exp(-dt * (o.faz === 'hiz' ? 0.95 : 1.1)));
    o.vOn = o.v; o.v += o.spd * dt;
    o.mx = K.xs + hkEsle(K, o.v); o.dx = o.mx - o.v;
    // zıplama: dokununca sıçrar, basılı tutunca yavaş yükselir, bırakınca yumuşak iner
    if (basili && !o.bas) { o.vh = o.h < 6 ? 520 : Math.max(o.vh, 400); o.idle = 0; o.sqv += o.h < 6 ? 9 : 4; OLAY.emit('halkaZipla', { o }); }
    if (basili) o.idle = 0; else if (o.faz === 'yol') o.idle += dt;
    o.bas = basili;
    const gr = o.vh > 0 ? (basili ? 640 : 1250) : 980;
    o.vh -= gr * dt; if (o.vh < -430) o.vh = -430;
    o.h += o.vh * dt;
    if (o.h > 250) { o.h = 250 + (o.h - 250) * 0.6; if (o.vh > 0) o.vh *= 0.5; }
    if (o.faz === 'yol') hkMiknatis(o, dt);
    if (o.h <= 0) {
      if (o.vh < -200) { hkTozPatla(o.mx, hkYolV(o, o.v), 8, 80, o.spd * 0.3); o.sqv -= 7 * clamp(-o.vh / 430, 0.4, 1); OLAY.emit('halkaInis', { o }); }
      o.h = 0; o.vh = 0;
    }
    o.my = hkYolV(o, o.v) - o.h;
    o.kosM = lerp(o.kosM || 0, o.h > 4 ? 0.45 : 1, 1 - Math.exp(-dt * 6));
    const egim = (hkYolV(o, o.v + 20) - hkYolV(o, o.v - 20)) / 40;
    o.rot = lerp(o.rot, clamp(-o.vh / 1900 + Math.atan(egim) * 0.8 - hizK * 0.05, -0.26, 0.2), 1 - Math.exp(-dt * 8));
    o.egil = lerp(o.egil, clamp(o.vh / 520, 0, 1) + hizK * 0.5, 1 - Math.exp(-dt * 7));
    // toynaklardan yıldız tozu (hızla artar)
    if (o.h === 0 && Math.random() < dt * (5 + o.spd / 45)) hkTozAt(o.mx - 22 + Math.random() * 40, o.my - 2, -20 - Math.random() * 40, -40 - Math.random() * 50, 0.6 + Math.random() * 0.5, (Math.random() * 5) | 0, 1.4 + Math.random() * 1.8, 90);
    o.isik = lerp(o.isik, o.faz === 'hiz' ? 1 : o.n / HK_TOP, 1 - Math.exp(-dt * 2));
    if (o.faz === 'yol') {
      hkHalkalar(o, dt);
      if (o.v >= K.Ly) hkHizBasla(o);
    } else {
      o.hizA = Math.min(1, o.hizA + dt * 1.2); o.flas = Math.max(0, o.flas - dt * 1.4);
      for (const r of o.halkalar) if (r.d === 'alindi') { r.t += dt; r.v += o.spd * dt * 0.72; hkHalkaYer(o, r); if (r.t > 0.75) r.d = 'bitti'; }
      hkKemerAdim(o, dt); hkFenerYak(o);
      if (o.v >= K.vJ) hkSicramaBasla(o);
    }
  } else if (o.faz === 'sicrama') {
    const u = clamp(o.t / HK_SIC, 0, 1);
    o.mx = o.sx0 + o.sD * (1 - Math.pow(1 - u, o.sk));
    const p = Math.pow(u, 0.85), taban = lerp(o.sy0, K.gy, smooth(u));
    o.my = taban - o.sH * Math.pow(Math.sin(Math.PI * p), 1.35);
    const vx = o.sD * o.sk * Math.pow(1 - u, o.sk - 1) / HK_SIC, dy = (o.my - (o.smyOn === undefined ? o.my : o.smyOn)) / dt;
    o.smyOn = o.my; o.spd = vx;
    o.rot = lerp(o.rot, clamp(Math.atan2(dy, Math.max(vx, 60)) * 0.55, -0.32, 0.3), 1 - Math.exp(-dt * 6));
    o.kosM = lerp(o.kosM, 0.3, 1 - Math.exp(-dt * 4)); o.h = 60 * Math.sin(Math.PI * u);
    o.egil = lerp(o.egil, 0.2, 1 - Math.exp(-dt * 3));
    o.hizA = Math.max(0, o.hizA - dt * 0.5); o.flas = Math.max(0, o.flas - dt * 1.4);
    if (Math.random() < dtA * 26) hkTozAt(o.mx - 30 + Math.random() * 30, o.my - 30 + Math.random() * 30, -30 - Math.random() * 40, 10 + Math.random() * 30, 1.1, (Math.random() * 5) | 0, 2 + Math.random() * 2.5, 20);
    P.x = o.mx + HK_SEDX; P.y = o.my - HK_SIRT;
    if (u >= 1) hkSicramaBitti(o);
  } else if (o.faz === 'inis') {
    const u = clamp(o.t / HK_INIS, 0, 1), yuru = smooth(clamp(u / 0.55, 0, 1)), atla = smooth(clamp((u - 0.4) / 0.6, 0, 1));
    o.mx = lerp(o.ix, K.x1 - 70, yuru); o.my = K.gy; o.kosM = 0.6 * (1 - yuru); o.rot *= Math.exp(-dt * 5); o.h = 0; o.spd = 0;
    o.hizA = Math.max(0, o.hizA - dt * 0.8);
    const sx = o.mx + HK_SEDX, sy = o.my - HK_SIRT;
    P.x = lerp(sx, K.x1, atla); P.y = lerp(sy, K.gy, atla) - Math.sin(atla * Math.PI) * 40;
    o.prX = lerp(o.prX, P.x - 70, 1 - Math.exp(-dt * 4)); o.prY = lerp(o.prY, P.y - 90, 1 - Math.exp(-dt * 4));
    if (typeof D !== 'undefined') { D.x = o.prX; D.y = o.prY; }
    if (u >= 1) { hkIndi(o); return; }
    o.x = P.x; return;
  }
  if (o.faz !== 'sicrama') { P.x = o.mx + HK_SEDX; P.y = o.my - HK_SIRT; }
  hkPirilAdim(o, dt);
  // yele ve kuyruk ışık izi (~60 Hz örnek; x sanal yolda → arkada uzun bir şerit olarak akar)
  o.izT += dt;
  if (o.izT >= 1 / 60 || o.izN < 2) {
    o.izT = Math.min(o.izT - 1 / 60, 1 / 60); if (o.izT < 0) o.izT = 0;
    const c = Math.cos(o.rot), s = Math.sin(o.rot), I = o.izI * 2;
    o.iz[I] = o.mx + 16 * c + 70 * s - o.dx; o.iz[I + 1] = o.my - 70 * c + 16 * s;
    o.iz2[I] = o.mx - 30 * c + 36 * s - o.dx; o.iz2[I + 1] = o.my - 36 * c - 30 * s;
    o.izI = (o.izI + 1) % 42; o.izN = Math.min(42, o.izN + 1);
  }
  o.x = P.x;
  if (typeof D !== 'undefined') { D.x = o.prX; D.y = o.prY; }
}

// ── halkalar: konum, geçiş denetimi, kaçırma, Pırıl yardımı ──
function hkHalkaYer(o, r) {
  r.x = r.v + o.dx;
  let lift = r.lift;
  if (r.tip === 'suz' && r.d !== 'uc') lift += Math.sin(o.total * 1.5 + r.faz) * 34;
  if (r.d === 'uc') { const u = clamp(r.t / 1.6, 0, 1); lift = lerp(r.fl, r.lift, smooth(u)) + Math.sin(u * Math.PI) * 120; }
  r.y = hkYolV(o, r.v) - HK_SIRT - HK_GOVDE - lift;
}
function hkSonrakiHalka(o) {
  let en = null;
  for (const r of o.halkalar) if (r.d === 'bekle' && r.v > o.v - 10 && (!en || r.v < en.v)) en = r;
  return en;
}
function hkMiknatis(o, dt) {   // havadayken öndeki halka midilliyi nazikçe kendi yüksekliğine çeker (5 yaş kolaylığı)
  const r = hkSonrakiHalka(o); if (!r || r.yardim) return;
  const d = r.v - o.v; if (d <= 0 || d > 250 || o.h < 6) return;
  const hT = hkYolV(o, o.v) - HK_SIRT - HK_GOVDE - r.y;
  if (Math.abs(hT - o.h) > 170) return;
  const w = smooth(1 - d / 250);
  o.h = lerp(o.h, Math.max(hT, 8), 1 - Math.exp(-dt * 6 * w)); o.vh *= Math.exp(-dt * 3 * w);
}
function hkHalkalar(o, dt) {
  const K = o.K, fy = o.my - HK_SIRT - HK_GOVDE;
  const yardimModu = o.zorYardim || o.idle >= HK_YARDIM;
  const sira = hkSonrakiHalka(o);
  if (sira && yardimModu && sira.v - o.v < 900) sira.yardim = true;
  for (const r of o.halkalar) {
    r.t += dt;
    if (r.d === 'alindi') { r.v += o.spd * dt * 0.72; hkHalkaYer(o, r); if (r.t > 0.75) r.d = 'bitti'; continue; }   // binicilerle birlikte açılıp dağılır
    if (r.d === 'bitti') continue;
    if (r.d === 'uc') {   // kaçırılan halka ileri, boş yere süzülür (sanal yolda)
      const u = clamp(r.t / 1.6, 0, 1); r.v = lerp(r.fv, r.tv, smooth(u)); hkHalkaYer(o, r);
      if (u >= 1) { r.d = 'bekle'; r.t = 0; r.v = r.tv; }
      continue;
    }
    hkHalkaYer(o, r);
    if (r.v > o.vOn - 2 && r.v <= o.v + 2) {   // bu adımda halkanın hizasından geçildi
      const tol = r.tip === 'yil' ? HK_TOL + 22 : HK_TOL;
      if (Math.abs(fy - r.y) < tol) hkTopla(o, r, 'feza');
      else if (r.yardim) hkTopla(o, r, 'piril');
      else hkKacti(o, r);
    }
  }
  // güvenlik ağı: oyun yolunun sonuna gelindiyse kalanları Pırıl toplar
  if (o.v >= K.Ly - 300) for (const r of o.halkalar) if (r.d === 'bekle' || r.d === 'uc') { hkHalkaYer(o, r); hkTopla(o, r, 'piril'); }
  // ipucu: 12 sn dokunulmazsa sıradaki halka parlar, Pırıl ona uçup gösterir
  o.ipucu = lerp(o.ipucu, o.idle >= HK_IPUCU && !yardimModu ? 1 : 0, 1 - Math.exp(-dt * 2));
}
function hkKacti(o, r) {   // ceza yok: halka ileri uçup yeniden gelir; üçüncüde Pırıl yardım eder
  const K = o.K;
  let son = o.v + 1500;
  for (const q of o.halkalar) if (q !== r && (q.d === 'bekle' || q.d === 'uc')) son = Math.max(son, (q.d === 'uc' ? q.tv : q.v) + 650);
  r.kac++; o.kacan++;
  r.fv = r.v; r.fl = r.lift; r.lift = 66 + (o.kacan % 3) * 24; r.yardim = r.kac >= 3;
  let tv = son;
  if (tv > K.Ly - 1500) { tv = Math.min(tv, K.Ly - 700); r.yardim = true; o.zorYardim = true; }   // sona az yer kaldı: Pırıl toplar
  r.tv = Math.max(tv, o.v + 900); r.d = 'uc'; r.t = 0;
  if (r.tv > K.Ly - 350) { r.d = 'bekle'; r.v = o.v + 400; r.yardim = true; }
  OLAY.emit('halkaKacti', { o, n: o.n });
}
function hkTopla(o, r, kim) {
  r.d = 'alindi'; r.t = 0; o.n++; o.joy = 1; o.sevT = 1.2;
  if (!(o.tk > 0)) { o.tk = 0.001; o.tkYon = o.n % 3 === 0 ? -1 : 1; }   // Pırıl sevinçle takla atar
  const yil = r.tip === 'yil';
  hkTozPatla(r.x, r.y, yil ? 46 : 26, yil ? 270 : 210, o.spd * 0.55);
  hkTozPatla(r.x, r.y, 10, 90, o.spd * 0.7, yil ? 1 : 0);
  if (yil) o.bonus = 1.8;
  o.sqv += 3;
  hkKivilcim(o, r.x, r.y, o.n - 1);
  hkSfx('halka', o.n);
  OLAY.emit('halka', { n: Math.min(o.n, HK_TOP), top: HK_TOP, x: r.x, y: r.y, kim, o, tip: r.tip });
}
function hkKivilcim(o, wx, wy, i) {   // halkadan sayaca uçan ışık; havuz doluysa doğrudan yanar
  if (i < 0 || i >= HK_TOP) return;
  for (const k of o.kv) if (!k.a) { k.a = true; k.t = 0; k.sx = wx - cam.x; k.sy = wy - cam.y; k.i = i; return; }
  o.pop[i] = 0; o.nGor = Math.max(o.nGor, i + 1);
}
function hkHizBasla(o) {   // büyük final koşusu
  for (const r of o.halkalar) if (r.d === 'bekle' || r.d === 'uc') { hkHalkaYer(o, r); hkTopla(o, r, 'piril'); }
  o.faz = 'hiz'; o.t = 0; o.flas = 1; o.joy = 1; o.sevT = 1.4; o.sqv += 6; o.zorYardim = false;
  hkTozPatla(o.mx, o.my - 40, 30, 260, o.spd);
  for (const p of hkIsik) p.d = -1;
  OLAY.emit('halkaHiz', { o }); OLAY.emit('halkaKosu', { o });
}
function hkKemerAdim(o, dt) {   // altın kemer: binici geçtikçe kendiliğinden toplanır, yükselen çanlar
  for (const k of o.kemer) {
    k.x = k.v + o.dx; k.y = hkYolV(o, k.v) - HK_SIRT - HK_GOVDE - 14 - Math.sin(k.i / (HK_KEMER - 1) * Math.PI) * 26;
    if (k.d === 'alindi') { k.t += dt; k.v += o.spd * dt * 0.6; if (k.t > 0.7) k.d = 'bitti'; continue; }
    if (k.d === 'bekle' && k.v <= o.v + 6) {
      k.d = 'alindi'; k.t = 0; o.joy = 1; o.sevT = Math.max(o.sevT, 0.5);
      hkTozPatla(k.x, k.y, 14, 200, o.spd * 0.6, k.i % 2 ? 1 : 0);
      hkSfx('halkaNota', HK_TOP + k.i + 1);
      OLAY.emit('halkaKemer', { i: k.i + 1, top: HK_KEMER, o });
    }
  }
}
function hkFenerYak(o) {   // final koşusunda fener direkleri binici geçtikçe yanar
  const i = Math.floor((o.v - o.K.Ly - 160) / HK_FFENER_ARA);
  if (i > o.fenerI && i >= 0 && o.K.Ly + 160 + i * HK_FFENER_ARA < o.K.vJ - 150) {
    o.fenerI = i;
    const v = o.K.Ly + 160 + i * HK_FFENER_ARA, x = v + o.dx, y = hkYolV(o, v) - 142;
    for (let k = 0; k < 6; k++) hkTozAt(x + 14, y + 28, (Math.random() - 0.5) * 160, -60 - Math.random() * 80, 0.8, 1 + (k % 2), 2 + Math.random() * 2, 120);
    OLAY.emit('halkaFener', { i, o });
  }
}
function hkSicramaBasla(o) {
  const K = o.K;
  o.faz = 'sicrama'; o.t = 0; o.sx0 = o.mx; o.sy0 = o.my; o.smyOn = undefined;
  o.sD = Math.max(80, K.xL - o.mx); o.sk = clamp(o.spd * HK_SIC / o.sD, 1.4, 4.5);
  o.sH = clamp(170 + (o.sy0 - K.gy) * -0.2, 150, 260);
  o.vh = 0; o.bas = false; o.sqv += 10; o.sevT = HK_SIC + 0.6; o.joy = 1;
  hkTozPatla(o.mx, o.my - 4, 26, 220, 200);
  OLAY.emit('halkaFinalSicrama', { o });
}
function hkSicramaBitti(o) {
  o.faz = 'inis'; o.t = 0; o.ix = o.mx; o.iy = o.my; o.sqv -= 10; o.ts = 1;
  hkTozPatla(o.mx, o.my - 20, 60, 330, 0); hkTozPatla(o.mx, o.my - 4, 24, 160, 0, 1);
  o.flas = 0.8;
  OLAY.emit('halkaFinalInis', { o }); OLAY.emit('halkaInis', { o });
}
function hkPirilAdim(o, dt) {
  // Pırıl Feza'nın yanında uçar (yavaşça öne-arkaya yer değiştirir); ipucu/yardımda sıradaki halkaya süzülür; finalde yan yana koşar
  const s = 0.5 + 0.5 * Math.sin(o.total * 0.33);
  let evX = P.x + lerp(-82, 34, s) + Math.sin(o.total * 1.3) * 10, evY = P.y - lerp(66, 104, s) + Math.sin(o.total * 2.1) * 9;
  if (o.faz === 'hiz') { evX = P.x + 26 + Math.sin(o.total * 2.3) * 14; evY = P.y - 108 + Math.sin(o.total * 3.1) * 8; }
  if (o.faz === 'sicrama') { const a = clamp(o.t / HK_SIC, 0, 1) * 6.2832 - 1.6; evX = P.x + Math.cos(a) * 95; evY = P.y - 70 + Math.sin(a) * 75; }
  if (o.tk > 0) evY -= Math.sin(o.tk * Math.PI) * 26;
  const r = o.faz === 'yol' ? hkSonrakiHalka(o) : null;
  let w = 0, hx = evX, hy = evY;
  if (r) {
    const uzak = r.x - P.x;
    if (r.yardim) { w = smooth(clamp((620 - uzak) / 380, 0, 1)); hx = r.x + 6; hy = r.y; }
    else if (o.ipucu > 0.05) {   // ipucu: halkanın etrafında küçük bir daire çizer
      const a = o.total * 2.4; w = o.ipucu * 0.85 * smooth(clamp((900 - uzak) / 400, 0, 1));
      hx = r.x + Math.cos(a) * 34; hy = r.y + Math.sin(a) * 52;
    }
  }
  o.prW = lerp(o.prW, w, 1 - Math.exp(-dt * 3));
  const tx = lerp(evX, hx, o.prW), ty = lerp(evY, hy, o.prW), k = 1 - Math.exp(-dt * (r && r.yardim ? 8 : o.faz === 'sicrama' ? 6 : 4));
  o.prX = lerp(o.prX, tx, k); o.prY = lerp(o.prY, ty, k);
  if ((o.prW > 0.3 || o.faz === 'hiz') && Math.random() < dt * 16) hkTozAt(o.prX - 14, o.prY + 6, -40, 10, 0.6, 3, 1.8);
}
function hkIndi(o) {
  const K = o.K;
  P.x = K.x1; P.y = K.gy; P.vx = P.vy = 0; P.ground = true; P.safeX = P.x; P.safeY = P.y; P.ucus = null; P.dj = true; P.buf = 0; P.fade = 0;
  if (typeof D !== 'undefined') { D.x = P.x - 74; D.y = P.y - 91; D.vx = D.vy = 0; }
  o.done = true; o.faz = 'bitti'; o.t = 0; o.gidisT = 0; o.hk.bitti = true; o.mx = K.x1 - 70; o.my = K.gy; o.gx0 = o.mx; o.gy0 = o.my; o.ts = 1;
  if (typeof V6 !== 'undefined') V6.mini = true;
  o.nGor = HK_TOP;
  hkTozPatla(P.x, P.y - 20, 18, 150, 0);
  OLAY.emit('halkaBitti', { o, sure: o.total, toplanan: o.n });
}

// ── çizim ──
function hkParalaksCiz(o, tm) {   // yolun arkasında, yoldan yavaş akan bulut kümeleri (ekrana göre)
  if (!(o.v > 0) || o.faz === 'bekle') return;
  const a = clamp(o.halkaA, 0, 1) * (o.done ? 1 - smooth(clamp(o.gidisT / 2, 0, 1)) : 1); if (a <= 0.01) return;
  const bul = hkBulutCiz(), VHg = VH / cam.zoom, span = VW + 700;
  for (let i = 0; i < 6; i++) {   // orta uzaklık: yolun altında, yolun ~yarı hızıyla
    const sx = ((i * span / 6 - o.v * 0.42 + i * 97) % span + span) % span - 350;
    const y = o.K.yol + 70 + (i % 3) * 34;
    g.globalAlpha = 0.5 * a; g.drawImage(bul, cam.x + sx, y, 360, 150);
  }
  for (let i = 0; i < 4; i++) {   // uzak gök: yukarıda soluk, çok yavaş
    const sx = ((i * span / 4 - o.v * 0.12 + i * 211) % span + span) % span - 350;
    g.globalAlpha = 0.22 * a; g.drawImage(bul, cam.x + sx, cam.y + VHg * (0.08 + (i % 2) * 0.12), 300, 110);
  }
  g.globalAlpha = 1;
}
function hkYolCiz(o, tm) {
  const K = o.K, dx = o.dx;
  const v0 = Math.max(0, cam.x - 60 - dx), v1 = Math.min(K.vJ + 30, cam.x + VW + 60 - dx);
  if (v1 <= v0) return;
  // yolun altındaki bulut yastıkları (sanal konumlarda, analitik salınım)
  const bul = hkBulutCiz();
  for (let i = Math.floor((v0 - 260) / 190); i <= Math.ceil(v1 / 190); i++) {
    const v = i * 190 + ((i * 37) % 60); if (v < 140 || v > K.vJ - 60) continue;
    const y = hkYolV(o, v + 130) - 34 + ((i * 53) % 30) + Math.sin(tm * 0.5 + i) * 3;
    g.drawImage(bul, v + dx, y, 260, 110);
  }
  const n = Math.max(8, Math.ceil((v1 - v0) / 28)), Y = v => hkYolV(o, v);
  // yolun gövdesi: koyu taş şerit
  g.fillStyle = '#4b3a6c'; g.beginPath();
  for (let i = 0; i <= n; i++) { const v = lerp(v0, v1, i / n); if (i) g.lineTo(v + dx, Y(v) - 2); else g.moveTo(v + dx, Y(v) - 2); }
  for (let i = n; i >= 0; i--) { const v = lerp(v0, v1, i / n); g.lineTo(v + dx, Y(v) + 15); }
  g.closePath(); g.fill();
  if (v1 >= K.vJ) {   // yolun ucu: yuvarlak bulut başlığı
    const yy = Y(K.vJ);
    g.beginPath(); g.arc(K.vJ + dx, yy + 6.5, 9, 0, 6.2832); g.fill();
    dglow('#ffd77a', K.vJ + dx, yy, 34, 0.35 + 0.3 * Math.sin(tm * 4));
  }
  // kaldırım taşları
  g.strokeStyle = 'rgba(255,214,160,.22)'; g.lineWidth = 1;
  g.beginPath();
  for (let v = Math.floor(v0 / 34) * 34; v < v1; v += 34) { const y = Y(v); g.moveTo(v + dx, y + 1); g.lineTo(v + dx - 4, y + 13); }
  g.stroke();
  // üst kenar: ışık bantları (halkalar toplandıkça, finalde tam altın-pembe)
  const isik = o.isik || 0, a = 0.45 + 0.5 * isik;
  g.lineCap = 'round';
  g.strokeStyle = mixc('#b89adf', '#ffd77a', Math.round(isik * 8) / 8, Math.round(a * 20) / 20); g.lineWidth = 3;
  g.beginPath(); for (let i = 0; i <= n; i++) { const v = lerp(v0, v1, i / n); if (i) g.lineTo(v + dx, Y(v) - 2); else g.moveTo(v + dx, Y(v) - 2); } g.stroke();
  g.strokeStyle = 'rgba(255,170,215,' + (0.25 + 0.4 * isik).toFixed(2) + ')'; g.lineWidth = 1.5;
  g.beginPath(); for (let i = 0; i <= n; i++) { const v = lerp(v0, v1, i / n); if (i) g.lineTo(v + dx, Y(v) + 15); else g.moveTo(v + dx, Y(v) + 15); } g.stroke();
  // yolda kayan ışık damlaları
  for (let i = Math.floor(v0 / 160); i <= Math.ceil(v1 / 160); i++) {
    const v = i * 160 + (tm * 40) % 160; if (v > K.vJ) continue;
    dglow(i % 2 ? '#ffd77a' : '#ff9fcf', v + dx, Y(v) - 3, 14, 0.25 + 0.3 * isik);
  }
}
function hkFenerDirek(o, v, top, yb, i, tm, yan, flas) {   // direk + fener; yan: 0 sönük … 1 yanık
  const x = v + o.dx, isik = o.isik || 0;
  g.strokeStyle = '#3a2a55'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, yb); g.lineTo(x, top); g.quadraticCurveTo(x, top - 14, x + 14, top - 12); g.stroke();
  g.strokeStyle = 'rgba(255,214,160,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 1, yb - 4); g.lineTo(x + 1, top); g.stroke();
  const yakin = clamp(1 - Math.abs(x - P.x) / 300, 0, 1), sal = Math.sin(tm * 1.6 + i * 0.9) * 0.08;
  const lx = x + 14, ly = top - 10;
  if (yan > 0.02) dglow('#ffcf7a', lx, ly + 28, (46 + 20 * isik + 18 * yakin + 50 * flas) * (0.6 + 0.4 * yan), (0.28 + 0.3 * isik + 0.2 * yakin + 0.4 * flas) * yan);
  g.save(); g.translate(lx, ly); g.rotate(sal);
  if (yan < 0.98) g.drawImage(hkFenerCiz(true), -18, 0, 36, 56);
  if (yan > 0.02) { g.globalAlpha = yan; g.drawImage(hkFenerCiz(false), -18, 0, 36, 56); g.globalAlpha = 1; }
  g.restore();
  if (yan > 0.02) dglow('#fff3c4', lx + Math.sin(sal) * -28, ly + 28, 10 + 14 * flas, (0.5 + 0.4 * isik) * yan);
}
function hkCelenk(o, sv, sTop, ev, eTop, i, tm, yan) {   // iki direk arası sarkan ışık çiçekleri
  const dx = o.dx, sx = sv + dx + 14, sy = sTop - 10, ex = ev + dx - 2, ey = eTop - 6, my = Math.max(sy, ey) + 34, isik = o.isik || 0;
  g.strokeStyle = 'rgba(60,44,90,.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + ex) / 2, my, ex, ey); g.stroke();
  for (let k = 1; k < 8; k++) {
    const u = k / 8, bx = (1 - u) * (1 - u) * sx + 2 * u * (1 - u) * (sx + ex) / 2 + u * u * ex, by = (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * my + u * u * ey;
    const col = HK_TOZ[(k + i) % HK_TOZ.length], par = (0.45 + 0.4 * isik + 0.15 * Math.sin(tm * 2.2 + k * 1.7 + i)) * (0.25 + 0.75 * yan);
    if (yan > 0.05) dglow(col, bx, by + 4, 9 + 5 * isik, par * 0.5);
    g.fillStyle = yan > 0.5 ? col : '#7d6aa6'; g.globalAlpha = Math.min(1, 0.55 + par * 0.5); g.beginPath(); g.arc(bx, by + 4, 2.4, 0, 6.2832); g.fill(); g.globalAlpha = 1;
  }
}
function hkFenerlerCiz(o, tm) {
  const K = o.K, dx = o.dx, v0 = cam.x - 160 - dx, v1 = cam.x + VW + 160 - dx;
  // oyun yolu: seyrek direkler, hep yanık (halkalar toplandıkça parlar)
  let onV = null, onTop = 0;
  for (let i = Math.max(0, Math.floor((v0 - 400) / HK_FENER_ARA) - 1); ; i++) {
    const v = 400 + i * HK_FENER_ARA; if (v > Math.min(v1 + HK_FENER_ARA, K.Ly)) break;
    const yb = hkYolV(o, v) - 1, top = yb - 132;
    if (onV !== null) hkCelenk(o, onV, onTop, v, top, i, tm, 1);
    if (v > v0) hkFenerDirek(o, v, top, yb, i, tm, 1, 0);
    onV = v; onTop = top;
  }
  // final koşusu: sık direkler; binici geçtikçe parlayıp yanar
  onV = null; const sur = o.faz === 'hiz' || o.faz === 'sicrama' || o.faz === 'inis' || o.done;
  for (let i = Math.max(0, Math.floor((v0 - K.Ly - 160) / HK_FFENER_ARA) - 1); ; i++) {
    const v = K.Ly + 160 + i * HK_FFENER_ARA; if (v > Math.min(v1 + HK_FFENER_ARA, K.vJ - 150)) break;
    const yb = hkYolV(o, v) - 1, top = yb - 142, gec = o.v - v;
    const yan = o.done || o.faz === 'sicrama' || o.faz === 'inis' ? 1 : sur ? smooth(clamp((gec + 70) / 120, 0, 1)) : 0;
    const flas = sur && gec > -70 ? Math.exp(-Math.max(0, gec) / 260) : 0;
    if (onV !== null) hkCelenk(o, onV, onTop, v, top, i + 3, tm, yan);
    if (v > v0) hkFenerDirek(o, v, top, yb, i, tm, yan, o.done ? 0 : flas);
    onV = v; onTop = top;
  }
}
function hkHalkaCiz(o, r, tm, on) {
  if (r.x < cam.x - 120 || r.x > cam.x + VW + 120 || r.d === 'bitti') return;
  const yil = r.tip === 'yil', art = hkHalkaArt(yil ? 'yil' : r.ci), hw = art.hw, hh = art.hh;
  let a = o.halkaA, sc = 1;
  const y = r.y + Math.sin(tm * 1.8 + r.i) * 4;
  if (r.d === 'alindi') { const u = clamp(r.t / 0.7, 0, 1); a *= 1 - u * u; sc = 1 + smooth(u) * 1.1; if (u >= 1) return; }
  else if (r.d === 'uc') { sc = 0.75; a *= 0.85; }
  if (a <= 0.01) return;
  const sira = r.d === 'bekle' && r === hkSonrakiHalka(o);
  if (!on) {
    // arka: sıcak hâle + (ipucunda) nabız; yıldız halkasında dönen ışık
    const nab = sira ? o.ipucu * (0.5 + 0.5 * Math.sin(tm * 5)) : 0;
    dglow(HK_RENK[yil ? 0 : r.ci], r.x, y, (yil ? 100 : 70) * sc + nab * 30, (0.3 + nab * 0.35 + (yil ? 0.12 : 0)) * a);
    if (r.d === 'alindi') {   // parlayıp genişleyerek dağılır: beyaz çekirdek + yayılan ışık halkası
      const u = clamp(r.t / 0.7, 0, 1);
      dglow('#ffffff', r.x, y, 50 + u * 110, (1 - u) * 0.8);
      g.strokeStyle = 'rgba(255,248,225,' + ((1 - u) * 0.8).toFixed(2) + ')'; g.lineWidth = 3 * (1 - u) + 0.5;
      g.beginPath(); g.ellipse(r.x, y, HK_RX * (1 + u * 2.6), HK_RY * (1 + u * 1.3), 0, 0, 6.2832); g.stroke();
    }
    if (r.d === 'uc') { for (let k = 1; k < 6; k++) dglow(HK_RENK[r.ci], r.x - k * 22, y + k * 6, 14 - k * 2, a * (0.4 - k * 0.06)); }
    g.globalAlpha = a; g.drawImage(art.c, 0, 0, hw * 2, hh * 4, r.x - hw * sc, y - hh * sc, hw * sc, hh * 2 * sc); g.globalAlpha = 1;
  } else {
    g.globalAlpha = a; g.drawImage(art.c, hw * 2, 0, hw * 2, hh * 4, r.x, y - hh * sc, hw * sc, hh * 2 * sc); g.globalAlpha = 1;
    if (r.d !== 'bekle') return;
    const rx = yil ? 31 : HK_RX, ry = yil ? 84 : HK_RY;
    for (let k = 0; k < (yil ? 5 : 3); k++) { const ang = tm * 1.6 + k * 6.2832 / (yil ? 5 : 3); hkYildiz(r.x + Math.cos(ang) * rx, y + Math.sin(ang) * ry, yil ? 4 : 3.2, '#fff4c8', a * (0.55 + 0.45 * Math.cos(ang))); }
    if (r.tip === 'suz') {   // minik ışık kanatları çırpar
      const kn = hkKanatCiz(), cf = 0.55 + 0.45 * Math.sin(tm * 9 + r.i);
      g.globalAlpha = a * 0.9;
      g.save(); g.translate(r.x + HK_RX - 2, y - 6); g.scale(1, cf); g.drawImage(kn, -2, -18, 30, 22); g.restore();
      g.save(); g.translate(r.x - HK_RX + 2, y - 6); g.scale(-1, cf); g.drawImage(kn, -2, -18, 30, 22); g.restore();
      g.globalAlpha = 1;
    }
    if (yil) { const p = 0.5 + 0.5 * Math.sin(tm * 3 + r.i); dglow('#fff4c8', r.x, y - ry - 6, 16 + 6 * p, 0.55 * a); hkYildiz(r.x, y - ry - 6, 7 + 2 * p, '#ffd77a', a); }
  }
}
function hkMerdivenIzi(o, tm) {   // ard arda merdiven halkaları arasında yol gösteren ışık noktaları
  let on = null;
  for (const r of o.halkalar) {
    if (r.tip !== 'mer' || r.d !== 'bekle') { on = null; continue; }
    if (on && r.v - on.v < 500 && r.x > cam.x - 100 && on.x < cam.x + VW + 100) {
      for (let k = 1; k < 5; k++) { const u = k / 5, x = lerp(on.x, r.x, u), y = lerp(on.y, r.y, u) - Math.sin(u * Math.PI) * 10; dglow('#fff4c8', x, y, 6 + 2 * Math.sin(tm * 5 + k), 0.35 * o.halkaA); }
    }
    on = r;
  }
}
function hkKemerCiz(o, tm, on) {   // altın kemer halkaları (final)
  const art = hkHalkaArt(0);
  for (const k of o.kemer) {
    if (k.d === 'bitti' || k.x < cam.x - 120 || k.x > cam.x + VW + 120) continue;
    let a = 1, sc = 1.12;
    if (k.d === 'alindi') { const u = clamp(k.t / 0.7, 0, 1); a = 1 - u * u; sc = 1.12 + u; }
    if (!on) {
      dglow('#ffd77a', k.x, k.y, 80 * sc, 0.35 * a);
      if (k.d === 'alindi') dglow('#ffffff', k.x, k.y, 60 + k.t * 120, (1 - k.t / 0.7) * 0.7);
      g.globalAlpha = a; g.drawImage(art.c, 0, 0, 80, 320, k.x - 40 * sc, k.y - 80 * sc, 40 * sc, 160 * sc); g.globalAlpha = 1;
    } else {
      g.globalAlpha = a; g.drawImage(art.c, 80, 0, 80, 320, k.x, k.y - 80 * sc, 40 * sc, 160 * sc); g.globalAlpha = 1;
      if (k.d === 'bekle') hkYildiz(k.x, k.y - HK_RY * sc - 4, 4 + Math.sin(tm * 6 + k.i), '#fff4c8', 0.9);
    }
  }
}
function hkMidilliCiz(o, x, y, rot, tm) {
  const m = o.mOpt;
  m.kos = o.kosM || 0; m.zipla = clamp(o.h / 70, 0, 1); m.parilti = 1;
  dglow('#ffd7f0', x, y - 30, 78 + 30 * (o.hizA || 0), 0.28 + 0.12 * (o.hizA || 0));
  if (o.hizA > 0.05 || o.bonus > 0) { const k = Math.max(o.hizA, o.bonus / 1.8); dglow(HK_TOZ[2 + ((tm * 3) | 0) % 3], x - 20, y - 36, 70, 0.22 * k); }
  const sq = clamp(o.sq || 0, -1, 1);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(1 - 0.05 * sq, 1 + 0.07 * sq);
  if (typeof midilliCiz === 'function') { try { midilliCiz(g, 0, 0, HK_MOLC, tm, m); g.restore(); return; } catch (e) { g.restore(); g.save(); g.translate(x, y); g.rotate(rot); } }
  hkYerTutucu(o, tm); g.restore();
}
function hkYerTutucu(o, tm) {   // midilli.js yoksa basit, sevimli bir midilli (sağa bakar; 0,0 toynak tabanı)
  g.scale(1.18, 1.18);
  const k = tm * 9, uc = o.h > 4;
  const bacak = (bx, ph) => { const a = uc ? 0.5 * (bx > 0 ? -1 : 1) : Math.sin(k + ph) * 0.55; g.save(); g.translate(bx, -26); g.rotate(a); g.fillStyle = '#e9dcfb'; g.fillRect(-3, 0, 6, 24); g.fillStyle = '#b48ce0'; g.fillRect(-3.4, 21, 6.8, 5); g.restore(); };
  bacak(-14, 0); bacak(12, Math.PI);
  g.fillStyle = '#f6efff'; g.beginPath(); g.ellipse(0, -34, 26, 14, 0, 0, 6.2832); g.fill();
  bacak(-10, Math.PI); bacak(16, 0);
  g.beginPath(); g.moveTo(14, -42); g.quadraticCurveTo(22, -62, 30, -66); g.lineTo(38, -58); g.quadraticCurveTo(30, -48, 26, -34); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(36, -64, 13, 9, 0.35, 0, 6.2832); g.fill();
  g.fillStyle = '#3a2a55'; g.beginPath(); g.arc(39, -66, 2.2, 0, 6.2832); g.fill();
  g.fillStyle = '#ffb3d9'; g.beginPath(); g.ellipse(45, -59, 3, 2, 0.3, 0, 6.2832); g.fill();
  g.fillStyle = '#f6efff'; g.beginPath(); g.moveTo(30, -73); g.lineTo(33, -82); g.lineTo(36, -72); g.fill();
  const yele = ['#ff9fcf', '#c9a2ff', '#9fe8ff', '#ffd77a'];
  g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { g.strokeStyle = yele[i]; g.lineWidth = 4; g.beginPath(); g.moveTo(30 - i * 4, -72 + i * 7); g.quadraticCurveTo(18 - i * 5, -66 + i * 6 + Math.sin(tm * 6 + i) * 3, 10 - i * 6, -58 + i * 7); g.stroke(); }
  for (let i = 0; i < 3; i++) { g.strokeStyle = yele[i]; g.lineWidth = 5; g.beginPath(); g.moveTo(-24, -38); g.quadraticCurveTo(-40, -40 + i * 6 + Math.sin(tm * 5 + i) * 4, -46, -24 + i * 6); g.stroke(); }
}
function hkIzCiz(o, tm) {   // yele ve kuyruktan uzun ışık şeridi: üst üste üç çizgi (geniş-soluk → ince-parlak) uzunluğa göre incelir
  if (o.izN < 3) return;
  const dx = o.dx, N = o.izN, fin = o.hizA || 0;
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
  const serit = (A, oran, w, col) => {
    const m = Math.max(2, Math.floor(N * oran));
    g.strokeStyle = col; g.lineWidth = w; g.beginPath();
    for (let j = 0; j < m; j++) { const i = (o.izI - 1 - j + 42) % 42, x = A[i * 2] + dx, y = A[i * 2 + 1] + Math.sin(j * 0.55 - tm * 9) * j * 0.12; if (j) g.lineTo(x, y); else g.moveTo(x, y); }
    g.stroke();
  };
  serit(o.iz, 1, 15 + 6 * fin, fin > 0.5 ? 'rgba(255,215,122,.13)' : 'rgba(255,159,207,.12)');
  serit(o.iz, 0.62, 8, 'rgba(201,162,255,.22)');
  serit(o.iz, 0.32, 3.5, 'rgba(255,250,235,.5)');
  serit(o.iz2, 0.8, 11, 'rgba(159,232,255,.12)');
  serit(o.iz2, 0.4, 3, 'rgba(255,240,250,.38)');
  g.globalCompositeOperation = 'source-over';
  for (let j = 4; j < N; j += 6) { const i = (o.izI - 1 - j + 42) % 42; hkYildiz(o.iz[i * 2] + dx, o.iz[i * 2 + 1], 2.6 * (1 - j / N) + 1, HK_TOZ[(j / 6 | 0) % 5], (1 - j / N) * (0.6 + 0.4 * Math.sin(tm * 8 + j))); }
}
function hkEfektAdim(o, dt) {   // ekran havuzları (karede ayırma yok)
  const VHg = VH / cam.zoom, hk = clamp(o.spd / HK_VF, 0, 1), aktif = P.ucus === o && (o.faz === 'yol' || o.faz === 'hiz' || o.faz === 'sicrama');
  const ts = o.ts || 1;
  // rüzgâr çizgileri: hızla sayıları artar
  const nR = aktif ? Math.round(lerp(7, HK_RUZ, hk)) : 0;
  for (let i = 0; i < HK_RUZ; i++) {
    const p = hkRuz[i];
    if (p.x < -p.l - 10) { if (i >= nR) { p.x = -9999; continue; } p.x = VW + Math.random() * 300; p.y = VHg * (0.06 + Math.random() * 0.9); p.l = 40 + Math.random() * 90; p.k = 0.8 + Math.random() * 0.8; }
    p.x -= (o.spd * 1.5 + 200) * p.k * dt * ts;
  }
  // ışık hızı çizgileri (final): ileri-sağdaki bir noktadan kenarlara doğru
  const R0 = 0.42 * Math.max(VHg, VW * 0.5), Rm = Math.hypot(VW, VHg);
  for (const p of hkIsik) {
    if (p.d < 0 || p.d > Rm) {
      if (o.hizA < 0.05 || o.faz !== 'hiz') { p.d = -1; continue; }
      let a; do { a = Math.random() * 6.2832; } while (Math.abs(Math.sin(a)) < 0.42);
      p.a = a; p.d = R0 * (0.75 + Math.random() * 0.6); p.c = (Math.random() * 3) | 0; p.w = 0.7 + Math.random() * 0.8;
    }
    p.d += (260 + p.d * 2.6) * p.w * dt * ts;
  }
  // sayaç kıvılcımları
  for (const k of o.kv) {
    if (!k.a) continue;
    k.t += dt / 0.75;
    if (k.t >= 1) { k.a = false; o.pop[k.i] = 0; o.nGor = Math.max(o.nGor, k.i + 1); }
  }
  for (let i = 0; i < HK_TOP; i++) if (o.pop[i] >= 0 && o.pop[i] < 5) o.pop[i] += dt;
  const sayHedef = o.done ? 0 : (o.faz === 'yol' || o.faz === 'hiz') ? 1 : o.faz === 'sicrama' ? 0.6 : o.faz === 'inis' ? 0.3 : 0;
  o.sayA = lerp(o.sayA, sayHedef, 1 - Math.exp(-dt * 2.5));
}
function hkEkranCiz(o, tm) {   // ekrana göre çizilenler (dünya dönüşümü içinde cam.x/cam.y ile)
  const VHg = VH / cam.zoom, cx = cam.x, cy = cam.y, hk = clamp(o.spd / HK_VF, 0, 1);
  if (P.ucus === o && o.faz !== 'binis') {
    // önden hızla geçen bulut tülleri (ekranın alt kenarında)
    const sis = hkSisCiz(), span = VW + 900;
    for (let i = 0; i < 3; i++) {
      const sx = ((i * span / 3 - o.v * 1.45 + i * 131) % span + span) % span - 450;
      g.globalAlpha = 0.6 * o.halkaA; g.drawImage(sis, cx + sx, cy + VHg * (0.86 + (i % 2) * 0.06), 420, 120);
    }
    g.globalAlpha = 1;
    // rüzgâr çizgileri
    g.lineCap = 'round'; g.strokeStyle = 'rgba(255,246,236,' + (0.16 + 0.16 * hk).toFixed(2) + ')'; g.lineWidth = 1.4; g.beginPath();
    for (const p of hkRuz) { if (p.x < -500) continue; g.moveTo(cx + p.x, cy + p.y); g.lineTo(cx + p.x + p.l * (1 + hk), cy + p.y); }
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,' + (0.28 + 0.25 * hk).toFixed(2) + ')'; g.lineWidth = 1.8; g.beginPath();
    for (const p of hkRuz) { if (p.x < -500) continue; g.moveTo(cx + p.x, cy + p.y); g.lineTo(cx + p.x + 10, cy + p.y); }
    g.stroke();
    // ışık hızı çizgileri (renk başına tek çizim)
    if (o.hizA > 0.02) {
      const vx = VW * 0.8, vy = VHg * 0.44, renk = ['255,215,122', '255,159,207', '159,232,255'];
      for (let c = 0; c < 3; c++) {
        g.strokeStyle = 'rgba(' + renk[c] + ',' + (0.42 * o.hizA).toFixed(2) + ')'; g.lineWidth = 5; g.beginPath();
        for (const p of hkIsik) { if (p.d < 0 || p.c !== c) continue; const ca = Math.cos(p.a), sa = Math.sin(p.a), l = 40 + p.d * 0.35; g.moveTo(cx + vx + ca * p.d, cy + vy + sa * p.d); g.lineTo(cx + vx + ca * (p.d + l), cy + vy + sa * (p.d + l)); }
        g.stroke();
        g.strokeStyle = 'rgba(255,253,240,' + (0.6 * o.hizA).toFixed(2) + ')'; g.lineWidth = 1.6; g.stroke();   // aynı yol: beyaz çekirdek
      }
      if (o.flas > 0.01) dglow('#fff4c8', P.x + 40, P.y - 20, 260, o.flas * 0.55);
    }
  }
  if (o.flas > 0.01 && o.faz === 'inis') dglow('#fff4c8', o.mx, o.my - 30, 220, o.flas * 0.5);
  // sayaç: ekranın üstünde 12 küçük ışık noktası (yazısız), ince bir ip üstünde
  if (o.sayA > 0.02) {
    const a = o.sayA, w = Math.min(VW * 0.56, 440), x0 = cx + VW / 2 - w / 2, y0 = cy + 26;
    g.strokeStyle = 'rgba(64,48,104,' + (0.5 * a).toFixed(2) + ')'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x0 - 16, y0 - 6); g.quadraticCurveTo(x0 + w / 2, y0 + 30, x0 + w + 16, y0 - 6); g.stroke();
    const kosu = o.faz === 'hiz' || o.faz === 'sicrama';
    for (let i = 0; i < HK_TOP; i++) {
      const u = (i + 0.5) / HK_TOP, bx = x0 + w * u, by = y0 + Math.sin(u * Math.PI) * 13 + 2, yan = i < o.nGor;
      if (!yan) { g.globalAlpha = 0.75 * a; g.fillStyle = '#5d4a86'; g.beginPath(); g.arc(bx, by, 4.5, 0, 6.2832); g.fill(); g.fillStyle = '#8f7cbc'; g.beginPath(); g.arc(bx - 1.2, by - 1.2, 1.5, 0, 6.2832); g.fill(); g.globalAlpha = 1; continue; }
      const pt = o.pop[i], pop = pt >= 0 && pt < 0.6 ? Math.sin(pt / 0.6 * Math.PI) : 0, dal = kosu ? 0.5 + 0.5 * Math.sin(tm * 9 - i * 0.7) : 0;
      const col = HK_TOZ[1 + i % 4];
      dglow(col, bx, by, 15 + pop * 16 + dal * 8, (0.45 + 0.3 * pop + 0.3 * dal) * a);
      g.globalAlpha = a; g.fillStyle = col; g.beginPath(); g.arc(bx, by, 5 * (1 + pop * 0.6), 0, 6.2832); g.fill();
      g.fillStyle = '#fffbea'; g.beginPath(); g.arc(bx - 1.3, by - 1.3, 2 * (1 + pop * 0.4), 0, 6.2832); g.fill(); g.globalAlpha = 1;
      if (pop > 0.05) hkYildiz(bx, by, 6 + pop * 6, '#fff4c8', pop);
    }
    for (const k of o.kv) {   // halkadan sayaca uçan kıvılcımlar
      if (!k.a) continue;
      const u = smooth(clamp(k.t, 0, 1)), tu = (k.i + 0.5) / HK_TOP, tx = VW / 2 - w / 2 + w * tu, ty = 28 + Math.sin(tu * Math.PI) * 13;
      const x = cx + lerp(k.sx, tx, u) + Math.sin(u * Math.PI) * 40, y = cy + lerp(k.sy, ty, u) - Math.sin(u * Math.PI) * 60;
      dglow('#ffd77a', x, y, 22, 0.7); hkYildiz(x, y, 6, '#fff4c8', 1);
    }
  }
}
function hkBinicilerCiz(o, tm) {
  hkIzCiz(o, tm);
  hkMidilliCiz(o, o.mx, o.my, o.rot, o.mt);
  const f = o.fzOpt, eg = clamp(o.egil, 0, 1.5), sq = clamp(o.sq || 0, -1, 1);
  f.vy = o.faz === 'sicrama' ? 0 : -o.vh * 0.35; f.sevinc = Math.max(smooth(clamp(o.sevT / 0.4, 0, 1)), o.faz === 'hiz' ? 0.35 + 0.35 * Math.sin(o.total * 2.4) : 0);
  f.aci = -0.07 * eg + 0.05 * Math.max(0, -sq); f.ruzgar = clamp(0.5 + o.spd / 1100, 0.5, 1);
  f.el.x = 20 + 6 * eg; f.el.y = -9 + 4 * eg;   // zıplarken öne eğilip yeleye tutunur
  if (typeof fezaCizPoz === 'function') {
    try {
      if (o.faz === 'binis' && o.t < HK_BINIS * 0.6 || o.faz === 'inis' && o.t > HK_INIS * 0.4) fezaCizPoz(g, P.x, P.y, 1, 'sevinc', o.ft);
      else { g.save(); g.translate(o.mx, o.my); g.rotate(o.rot); fezaCizPoz(g, HK_SEDX, -HK_SIRT * (1 + 0.07 * sq), 1, 'binis', o.ft, null, f); g.restore(); }
    } catch (e) {}
  }
  if (typeof pirilCizPoz === 'function') {
    try {
      const tk = o.tk > 0 ? smooth(o.tk) : 0, poz = o.kirp > 0 && o.prW < 0.3 ? 'goz_kirp' : 'ucus';
      g.save(); g.translate(o.prX, o.prY); g.rotate(tk * 6.2832 * o.tkYon + (o.faz === 'hiz' ? 0.06 : 0)); g.scale(1 + 0.08 * Math.sin(tk * Math.PI), 1 - 0.08 * Math.sin(tk * Math.PI));
      pirilCizPoz(g, 0, 0, 0.95, poz, o.pt); g.restore();
    } catch (e) { g.restore(); }
  }
  if (o.bonus > 0) {   // yıldız halkası: binicilerin çevresinde altın parıltı yağmuru
    const b = o.bonus / 1.8;
    for (let k = 0; k < 6; k++) { const a = tm * 3 + k * 1.047; hkYildiz(o.mx + Math.cos(a) * 60, o.my - 60 + Math.sin(a) * 45, 4 + 2 * Math.sin(tm * 8 + k), HK_TOZ[k % 5], b); }
  }
}
TUR.kaydet('halkaMini', {
  kur: hkKur,
  dokun: hkBasla,
  guncelle(o, dt) {
    if (!(dt > 0) || !Number.isFinite(dt)) return;
    hkTozAdim(dt * (P.ucus === o ? o.ts || 1 : 1));
    if (DURUM === 'oyun' && !P.ucus && o.faz === 'bekle' && !o.done && Math.abs(P.x - o.kx) < 90 && Math.abs(P.y - o.y0) < 110) hkBasla(o);
    if (o.faz === 'bekle') { o.mt += dt; return; }
    // çizim ayıklaması o.x'e bakar: yolculuk sonrasında yolu ekrandaki yere taşı
    if (P.ucus !== o) o.x = clamp(cam.x + VW / 2, o.K.x0, o.K.x1 + 300);
    hkEfektAdim(o, dt);
    if (o.done) {
      o.gidisT += dt;   // midilli Feza'yı indirdikten sonra yıldız tozu bırakarak göğe süzülüp kaybolur
      const u = clamp(o.gidisT / 3.2, 0, 1);
      if (u < 1) { o.mt += dt * 1.4; o.mx = o.gx0 + smooth(clamp((u - 0.15) / 0.85, 0, 1)) * 260; o.my = o.gy0 - smooth(clamp((u - 0.25) / 0.75, 0, 1)) * 320; o.kosM = 0.8; o.h = u > 0.25 ? 20 : 0; if (u > 0.25 && Math.random() < dt * 20) hkTozAt(o.mx - 14, o.my - 10, -30, 20, 0.9, (Math.random() * 5) | 0, 2.5); }
    }
  },
  ciz(o, tm) {
    hkParalaksCiz(o, tm);
    hkYolCiz(o, tm); hkFenerlerCiz(o, tm);
    const yolda = o.faz === 'yol' || o.faz === 'binis' || o.faz === 'hiz';
    if (yolda) { hkMerdivenIzi(o, tm); for (const r of o.halkalar) hkHalkaCiz(o, r, tm, false); }
    if (o.faz === 'hiz') hkKemerCiz(o, tm, false);
    if (o.faz === 'bekle') {   // biniş öncesi: midilli yolun başında bekler, nazikçe başını sallar; eyerin üstünde davetkâr parıltı
      const x = o.kx, y = o.y0;
      o.rot = Math.sin(tm * 1.2) * 0.02; hkMidilliCiz(o, x, y, o.rot, tm);
      for (let i = 0; i < 3; i++) { const u = (tm * 0.35 + i / 3) % 1; hkYildiz(x - 4 + Math.sin(i * 2.1 + tm) * 16, y - HK_SIRT - 10 - u * 60, 4.5, '#fff4c8', Math.sin(u * Math.PI) * 0.85); }
    }
    if (o.done) { const u = clamp(o.gidisT / 3.2, 0, 1); if (u < 1) { g.globalAlpha = 1 - smooth(clamp((u - 0.55) / 0.45, 0, 1)); hkMidilliCiz(o, o.mx, o.my, -0.12 * smooth(clamp(u * 3, 0, 1)), o.mt); g.globalAlpha = 1; } }
  },
  cizOn(o, tm) {
    if (P.ucus === o) hkBinicilerCiz(o, tm);
    if (o.faz === 'yol' || o.faz === 'binis' || o.faz === 'hiz') for (const r of o.halkalar) hkHalkaCiz(o, r, tm, true);
    if (o.faz === 'hiz') hkKemerCiz(o, tm, true);
    hkTozCiz();
    if (o.faz !== 'bekle') hkEkranCiz(o, tm);
  }
});

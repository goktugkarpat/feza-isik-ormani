/* halka.js – Bölüm 6 (Şenlik Kalesi) halka kapma mini oyunu (önek hk), nesne türü 'halkaMini'.
   Feza ışıklı büyülü bir midilliye biner; midilli fener süslü, bulutların üstünde süzülen bir ışık yolunda kendiliğinden ilerler.
   Havada altın/pembe ışık halkaları parıldar. Ekrana dokununca (ya da Boşluk/↑/W) midilli zıplar, basılı tutunca biraz daha yükselir,
   bırakınca yumuşakça iner. Halkanın içinden geçince halka çan sesiyle parlayıp yıldız tozuna dağılır (OLAY 'halka' {n}).
   Kaçırılan halka ileri uçup sonra yeniden gelir; 8 halka toplanınca midilli kale köprüsüne dörtnala koşup Feza'yı indirir.
   Kaybetme, ceza, süre baskısı yok: ~12 sn dokunulmazsa sıradaki halka parlar ve Pırıl ona uçup gösterir; ~24 sn dokunulmazsa
   (ya da yolun sonuna az yer kaldıysa) Pırıl halkaları kendisi toplar, yani yolculuk asla takılmaz. Yazı ve öğretici el yok.
   Fizik devralma B5 lavsal.js gibi: P.ucus = o, motor her adımda o.adim(dt, OM_UCUS_GIRDI) çağırır; Feza ve Pırıl'ı bu dosya çizer.
   Yerleşim (bolum6.js): nesne('halkaMini', c, yuzey(c), { inisX, inisY (köprü önündeki iniş noktası), yol (isteğe bağlı: yolun taban y'si) })
     ya da aynı alanlar BOLUM.halka içinde. inisX yoksa x1 kullanılır; varsayılan: o.x + 190 kare, yol = o.y - 20.
   Konuşmalar (p_f_halka_giris / p_f_halka / p_f_halka_bitti) ses.js'te bu dosyanın olaylarına bağlıdır; burada SES çağrılmaz.
   Bitince: V6.mini = true, o.hk.bitti = true (kapi.js uyumu için o.skl aynı nesne), OLAY 'halkaBitti'. */
'use strict';
const HK_TOP = 8;            // toplanacak halka
const HK_SLOT = 14;          // halka yuvası (0..13 normal, 14 yedek); kaçırılan halka sondaki boş yuvaya uçar
const HK_SLOT_SN = 3.5;      // iki yuva arası süre (sn): mükemmel oyunda ~38 sn yolculuk
const HK_BINIS = 1.5, HK_INIS = 1.7;
const HK_IPUCU = 12, HK_YARDIM = 24;   // dokunulmadan geçen süre: ipucu / Pırıl kendisi toplar
const HK_MOLC = 1;            // midilliCiz ölçeği (s = 1'de sırt ≈ 60 birim)
const HK_SIRT = 57;          // midillinin toynak tabanından eyere (Feza'nın oturma noktası)
const HK_SEDX = -9;          // eyerin toynak ortasına göre x kayması (sırtın ortası)
const HK_GOVDE = 24;         // oturma noktasından Feza'nın göğsüne (halka denetim noktası)
const HK_TOL = 56;           // halka içi dikey tolerans (cömert)
const HK_RX = 24, HK_RY = 64;
const HK_YUK = [62, 80, 118, 96, 150, 110, 180, 132];   // ilk sekiz halkanın yüksekliği (denetim noktasının üstü); ilki çok alçak
const HK_RENK = ['#ffd77a', '#ff9fcf'];
const HK_TOZ = ['#fff4c8', '#ffd77a', '#ff9fcf', '#c9a2ff', '#9fe8ff'];
const HK_FENER_ARA = 250;
const HALKA = { o: null, aktif() { return !!this.o && P.ucus === this.o; }, baslat(o) { o = o || this.o; if (o) hkBasla(o); return o; } };

function hkSfx(ad, v) { if (typeof AU !== 'undefined' && AU && typeof AU.sfx === 'function') { try { AU.sfx(ad, v); } catch (e) {} } }

// ── önbellekli çizimler (karede gradyan/filtre yok) ──
const hkHalkaArts = [];
function hkHalkaArt(i) {   // 80×160 dünya birimi, merkez (40,80); 2× çözünürlük. Sol yarı arkaya, sağ yarı öne çizilir.
  if (hkHalkaArts[i]) return hkHalkaArts[i];
  const c = document.createElement('canvas'); c.width = 160; c.height = 320; const q = c.getContext('2d');
  q.scale(2, 2); q.translate(40, 80);
  const col = HK_RENK[i], ic = i ? '#ffe3f1' : '#fff6d6', koyu = i ? '#c0559a' : '#c98a2c';
  for (let k = 0; k < 4; k++) { q.strokeStyle = col; q.globalAlpha = 0.07 + k * 0.05; q.lineWidth = 17 - k * 3.5; q.beginPath(); q.ellipse(0, 0, HK_RX, HK_RY, 0, 0, 6.2832); q.stroke(); }
  q.globalAlpha = 1;
  const gr = q.createLinearGradient(0, -HK_RY, 0, HK_RY); gr.addColorStop(0, ic); gr.addColorStop(0.45, col); gr.addColorStop(1, koyu);
  q.strokeStyle = gr; q.lineWidth = 5; q.beginPath(); q.ellipse(0, 0, HK_RX, HK_RY, 0, 0, 6.2832); q.stroke();
  q.strokeStyle = 'rgba(255,255,255,.85)'; q.lineWidth = 1.4; q.beginPath(); q.ellipse(-1, -1, HK_RX - 1.5, HK_RY - 1.5, 0, Math.PI * 0.95, Math.PI * 1.55); q.stroke();
  q.strokeStyle = 'rgba(255,255,255,.5)'; q.lineWidth = 1; q.beginPath(); q.ellipse(1, 1, HK_RX + 0.5, HK_RY + 0.5, 0, Math.PI * 0.05, Math.PI * 0.45); q.stroke();
  // dört küçük taş (üst, alt, yanlar)
  for (const [x, y] of [[0, -HK_RY], [0, HK_RY], [-HK_RX, 0], [HK_RX, 0]]) {
    q.fillStyle = koyu; q.beginPath(); q.moveTo(x, y - 5); q.lineTo(x + 3.6, y); q.lineTo(x, y + 5); q.lineTo(x - 3.6, y); q.closePath(); q.fill();
    q.fillStyle = ic; q.beginPath(); q.moveTo(x, y - 3.6); q.lineTo(x + 2, y); q.lineTo(x, y + 1); q.lineTo(x - 2, y); q.closePath(); q.fill();
  }
  return hkHalkaArts[i] = c;
}
let hkFenerArt = null;
function hkFenerCiz() {   // fener gövdesi: 36×56 dünya birimi, asma noktası (18,0)
  if (hkFenerArt) return hkFenerArt;
  const c = document.createElement('canvas'); c.width = 72; c.height = 112; const q = c.getContext('2d'); q.scale(2, 2); q.translate(18, 0);
  q.strokeStyle = '#3b2c55'; q.lineWidth = 1.6; q.beginPath(); q.moveTo(0, 0); q.lineTo(0, 8); q.stroke();
  q.fillStyle = '#4a3768'; q.beginPath(); q.moveTo(-10, 14); q.quadraticCurveTo(0, 4, 10, 14); q.closePath(); q.fill();
  const gr = q.createLinearGradient(0, 14, 0, 42); gr.addColorStop(0, '#fff3c4'); gr.addColorStop(0.6, '#ffc76a'); gr.addColorStop(1, '#ff9a6a');
  q.fillStyle = gr; q.beginPath(); q.moveTo(-9, 15); q.quadraticCurveTo(-14, 28, -8, 40); q.lineTo(8, 40); q.quadraticCurveTo(14, 28, 9, 15); q.closePath(); q.fill();
  q.strokeStyle = '#5a3f78'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(-3, 15); q.quadraticCurveTo(-5, 28, -3, 40); q.moveTo(3, 15); q.quadraticCurveTo(5, 28, 3, 40); q.stroke();
  q.fillStyle = '#4a3768'; q.beginPath(); q.moveTo(-9, 40); q.lineTo(9, 40); q.lineTo(5, 46); q.lineTo(-5, 46); q.closePath(); q.fill();
  q.fillStyle = '#ffd77a'; q.beginPath(); q.arc(0, 49, 2.2, 0, 6.2832); q.fill();
  q.fillStyle = 'rgba(255,255,255,.75)'; q.beginPath(); q.ellipse(-4.5, 24, 1.6, 5, 0.15, 0, 6.2832); q.fill();
  return hkFenerArt = c;
}
let hkBulutArt = null;
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

// ── yolun biçimi ──
function hkYolY(o, x) {
  const K = o.K;
  const a = smooth(clamp((x - K.xs) / 340, 0, 1)), b = smooth(clamp((x - K.xe) / (K.x1 - K.xe), 0, 1));
  const dalga = -(Math.sin(x * 0.0019) * 0.5 + 0.5) * 30 - (Math.sin(x * 0.00063 + 1.3) * 0.5 + 0.5) * 38;
  return lerp(lerp(o.y0, K.yol + dalga, a), K.gy, b);
}
function hkSlotX(o, s) { return o.K.ilk + s * o.K.ara; }
function hkHalkaY(o, x, lift) { return hkYolY(o, x) - HK_SIRT - HK_GOVDE - lift; }

// ── yıldız tozu havuzu (sabit boy; karede ayırma yok) ──
const HK_HAVUZ = 120;
const hkToz = []; for (let i = 0; i < HK_HAVUZ; i++) hkToz.push({ x: 0, y: 0, vx: 0, vy: 0, l: 0, m: 1, c: 0, s: 1 });
let hkTozI = 0;
function hkTozAt(x, y, vx, vy, life, ci, s) { const p = hkToz[hkTozI]; hkTozI = (hkTozI + 1) % HK_HAVUZ; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.l = p.m = life; p.c = ci; p.s = s; }
function hkTozPatla(x, y, n, hiz) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.2832, v = hiz * (0.35 + Math.random() * 0.75); hkTozAt(x, y, Math.cos(a) * v, Math.sin(a) * v * 0.8 - 30, 0.9 + Math.random() * 0.8, i % HK_TOZ.length, 2.5 + Math.random() * 3); } }
function hkTozAdim(dt) { for (const p of hkToz) { if (p.l <= 0) continue; p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-dt * 1.8); p.vy = p.vy * Math.exp(-dt * 1.8) + 40 * dt; } }
function hkYildiz(x, y, r, rot, col, a) {
  if (a <= 0.01) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a; g.fillStyle = col;
  g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.15, -r * 0.15, r, 0); g.quadraticCurveTo(r * 0.15, r * 0.15, 0, r); g.quadraticCurveTo(-r * 0.15, r * 0.15, -r, 0); g.quadraticCurveTo(-r * 0.15, -r * 0.15, 0, -r); g.fill(); g.restore();
}
function hkTozCiz() {
  for (const p of hkToz) {
    if (p.l <= 0 || p.x < cam.x - 40 || p.x > cam.x + VW + 40) continue;
    const u = p.l / p.m, col = HK_TOZ[p.c];
    dglow(col, p.x, p.y, p.s * 4, u * 0.35);
    hkYildiz(p.x, p.y, p.s * (0.6 + 0.4 * u), p.l * 3 + p.c, col, Math.min(1, u * 1.4));
  }
}

// ── kurulum / başlama ──
function hkKur(o) {
  const B = (typeof BOLUM !== 'undefined' && BOLUM.halka) || {};
  const al = k => Number.isFinite(o[k]) ? o[k] : Number.isFinite(B[k]) ? B[k] : null;
  const x1 = al('inisX') !== null ? al('inisX') : al('x1') !== null ? al('x1') : o.x + 190 * T;   // iniş noktası (köprü önü)
  const yol = al('yol') !== null ? al('yol') : o.y - 20;
  let gy = al('inisY') !== null ? al('inisY') : o.y;
  if (al('inisY') === null && typeof yuzey === 'function') { try { const v = yuzey(Math.floor(x1 / T)); if (Number.isFinite(v) && v < ROWS * T) gy = v; } catch (e) {} }
  const xs = o.x + 70, xe = x1 - 340, ilk = xs + 520, ara = Math.max(150, (xe - 220 - ilk) / HK_SLOT);
  o.K = { x0: o.x, x1, xs, xe, yol, gy, ilk, ara, hiz: ara / HK_SLOT_SN };
  o.kx = o.x; o.y0 = o.y; o.faz = 'bekle'; o.t = 0; o.total = 0; o.done = false; o.hk = { bitti: false }; o.skl = o.hk;
  o.mx = o.x; o.my = o.y; o.h = 0; o.vh = 0; o.rot = 0; o.kos = 0; o.joy = 0; o.idle = 0; o.bas = false; o.n = 0; o.isik = 0;
  o.zorYardim = false; o.prX = 0; o.prY = 0; o.prW = 0; o.ipucu = 0; o.halkaA = 0; o.kacan = 0; o.gidisT = 0;
  o.iz = new Float32Array(48); o.izN = 0; o.izI = 0;   // yele ışık izi (24 nokta)
  o.halkalar = [];
  for (let i = 0; i < HK_TOP; i++) { const x = hkSlotX(o, i); o.halkalar.push({ s: i, x, y: hkHalkaY(o, x, HK_YUK[i]), lift: HK_YUK[i], d: 'bekle', t: 0, r: i % 2, fx: 0, fy: 0, tx: 0, ty: 0, yardim: false }); }
  o.fzOpt = { el: { x: 20, y: -9 }, vy: 0, sevinc: 0, aci: 0, ruzgar: 0.5 };
  o.mOpt = { uyku: 0, yon: 1, parilti: 1, kos: 0, zipla: 0, renk: 3 };
  o.adim = (dt, input) => hkAdim(o, dt, input);
  if (typeof BOLUM !== 'undefined' && !BOLUM.ucus) BOLUM.ucus = { x0: o.x, x1, yUst: yol - 330, yAlt: yol + 80 };   // uçuş kamerası koridoru (harita vermediyse)
  hkHalkaArt(0); hkHalkaArt(1); hkFenerCiz(); hkBulutCiz();
  HALKA.o = o;
}
function hkBasla(o) {
  if (!o || o.done || o.faz !== 'bekle' || P.ucus || DURUM !== 'oyun' || P.fade > 0) return;
  if (typeof D !== 'undefined' && D.mode === 'tasi') return;
  o.faz = 'binis'; o.t = 0; o.total = 0; o.px0 = P.x; o.py0 = P.y; o.idle = 0; o.bas = false; o.h = 0; o.vh = 0;
  P.ucus = o; P.vx = P.vy = 0; P.kilit = 0; P.fade = 0; P.buf = 0; HALKA.o = o;
  if (typeof omHepsiniBirak === 'function') omHepsiniBirak();
  o.prX = P.x - 80; o.prY = P.y - 90;
  OLAY.emit('halkaBasla', { o, top: HK_TOP });
}

// ── her fizik adımı (P.ucus === o iken motor çağırır) ──
function hkAdim(o, dt, input) {
  if (!(dt > 0) || !Number.isFinite(dt) || DURUM !== 'oyun' || P.ucus !== o) return;
  dt = Math.min(dt, 0.05);
  o.t += dt; o.total += dt; o.joy = Math.max(0, o.joy - dt * 0.8);
  P.vx = P.vy = 0; P.ground = false; P.f = 1;
  const K = o.K, basili = !!(input && (input.basili || input.eksenY < 0));
  o.halkaA = Math.min(1, o.halkaA + dt * (o.faz === 'bekle' ? 0 : 0.9));
  if (o.faz === 'binis') {
    const u = clamp(o.t / HK_BINIS, 0, 1), atla = smooth(clamp(u / 0.6, 0, 1)), yuru = smooth(clamp((u - 0.55) / 0.45, 0, 1));
    o.mx = lerp(o.kx, K.xs, yuru); o.my = hkYolY(o, o.mx); o.kos += dt * (0.6 + yuru * 1.6); o.kosM = yuru * 0.7;
    const sx = o.mx + HK_SEDX, sy = o.my - HK_SIRT;
    P.x = lerp(o.px0, sx, atla); P.y = lerp(o.py0, sy, atla) - Math.sin(atla * Math.PI) * 46;
    if (u >= 1) { o.faz = 'yol'; o.t = 0; o.idle = 0; }
  } else if (o.faz === 'yol' || o.faz === 'kosu') {
    const onX = o.mx;
    if (o.faz === 'yol') o.mx += K.hiz * dt;
    else { const u = clamp(o.t / o.kosuSure, 0, 1), e = u * u * (3 - 2 * u); o.mx = lerp(o.kosuX, K.xe, e); }
    // zıplama: dokununca sıçrar, basılı tutunca yavaş yükselir, bırakınca yumuşak iner
    if (o.faz === 'yol') {
      if (basili && !o.bas) { o.vh = o.h < 6 ? 520 : Math.max(o.vh, 400); o.idle = 0; OLAY.emit('halkaZipla', { o }); }
      if (basili) o.idle = 0; else o.idle += dt;
    }
    o.bas = basili;
    const tut = basili && o.faz === 'yol';
    const gr = o.vh > 0 ? (tut ? 640 : 1250) : 980;
    o.vh -= gr * dt; if (o.vh < -430) o.vh = -430;
    o.h += o.vh * dt;
    if (o.h > 250) { o.h = 250 + (o.h - 250) * 0.6; if (o.vh > 0) o.vh *= 0.5; }
    if (o.h <= 0) { if (o.vh < -200) { hkTozPatla(o.mx, hkYolY(o, o.mx), 6, 70); OLAY.emit('halkaInis', { o }); } o.h = 0; o.vh = 0; }
    if (o.faz === 'kosu') { o.h *= Math.exp(-dt * 3); o.vh = Math.min(o.vh, 0); }
    o.my = hkYolY(o, o.mx) - o.h;
    const hiz = (o.mx - onX) / dt;
    o.kos += dt * (1.2 + hiz / 160); o.kosM = lerp(o.kosM || 0, o.faz === 'kosu' ? 1 : o.h > 4 ? 0.45 : 0.75, 1 - Math.exp(-dt * 5));
    const egim = (hkYolY(o, o.mx + 20) - hkYolY(o, o.mx - 20)) / 40;
    o.rot = lerp(o.rot, clamp(-o.vh / 1900 + Math.atan(egim) * 0.8, -0.26, 0.2), 1 - Math.exp(-dt * 8));
    if (o.h === 0 && Math.random() < dt * (3 + hiz / 120)) hkTozAt(o.mx - 18, o.my - 2, -40 - Math.random() * 40, -30 - Math.random() * 30, 0.7, 2 + (Math.random() * 3 | 0), 2 + Math.random() * 2);
    o.isik = lerp(o.isik, o.n / HK_TOP, 1 - Math.exp(-dt * 2));
    if (o.faz === 'yol') hkHalkalar(o, dt);
    if (o.faz === 'kosu' && o.t >= o.kosuSure) { o.faz = 'inis'; o.t = 0; o.ix = o.mx; o.iy = o.my; }
  } else if (o.faz === 'inis') {
    const u = clamp(o.t / HK_INIS, 0, 1), yuru = smooth(clamp(u / 0.55, 0, 1)), atla = smooth(clamp((u - 0.4) / 0.6, 0, 1));
    o.mx = lerp(o.ix, K.x1 - 70, yuru); o.my = hkYolY(o, o.mx); o.kos += dt * (1.6 - yuru); o.kosM = 1 - yuru * 0.8; o.rot *= Math.exp(-dt * 5);
    const sx = o.mx + HK_SEDX, sy = o.my - HK_SIRT;
    P.x = lerp(sx, K.x1, atla); P.y = lerp(sy, K.gy, atla) - Math.sin(atla * Math.PI) * 40;
    o.prX = lerp(o.prX, P.x - 70, 1 - Math.exp(-dt * 4)); o.prY = lerp(o.prY, P.y - 90, 1 - Math.exp(-dt * 4));
    if (u >= 1) { hkIndi(o); return; }
    o.x = P.x; return;
  }
  P.x = o.mx + HK_SEDX; P.y = o.my - HK_SIRT;
  hkPirilAdim(o, dt);
  // yele ışık izi
  const yx = o.mx + 16, yy = o.my - HK_SIRT - 12;
  o.iz[o.izI * 2] = yx; o.iz[o.izI * 2 + 1] = yy; o.izI = (o.izI + 1) % 24; o.izN = Math.min(24, o.izN + 1);
  o.x = P.x;
  if (typeof D !== 'undefined') { D.x = o.prX; D.y = o.prY; }
}

// ── halkalar: geçiş denetimi, kaçırma, Pırıl yardımı ──
function hkSonrakiHalka(o) {
  let en = null;
  for (const r of o.halkalar) if (r.d === 'bekle' && r.x > o.mx - 10 && (!en || r.x < en.x)) en = r;
  return en;
}
function hkHalkalar(o, dt) {
  const fx = o.mx, fy = o.my - HK_SIRT - HK_GOVDE;
  const yardimModu = o.zorYardim || o.idle >= HK_YARDIM;
  const sira = hkSonrakiHalka(o);
  if (sira && yardimModu && sira.x - o.mx < 520) sira.yardim = true;
  for (const r of o.halkalar) {
    r.t += dt;
    if (r.d === 'uc') {   // kaçırılan halka ileri, boş yuvaya süzülür
      const u = clamp(r.t / 1.7, 0, 1), e = smooth(u);
      r.x = lerp(r.fx, r.tx, e); r.y = lerp(r.fy, r.ty, e) - Math.sin(u * Math.PI) * 120;
      if (u >= 1) { r.d = 'bekle'; r.t = 0; r.x = r.tx; r.y = r.ty; }
      continue;
    }
    if (r.d !== 'bekle') continue;
    const dx = fx - r.x;
    if (Math.abs(dx) < 18 && (Math.abs(fy - r.y) < HK_TOL || r.yardim && dx > -4)) { hkTopla(o, r, Math.abs(fy - r.y) < HK_TOL ? 'feza' : 'piril'); continue; }
    if (dx > 22) {   // kaçtı: ceza yok, halka ileri uçup yeniden gelir
      let son = 0; for (const q of o.halkalar) if (q !== r && (q.d === 'bekle' || q.d === 'uc') && q.s > son) son = q.s;
      let s = son + 1;
      if (s >= HK_SLOT) { s = HK_SLOT; o.zorYardim = true; }
      if (HK_SLOT - s < 2) o.zorYardim = true;   // sona az yer kaldı: kalanları Pırıl toplar
      r.s = s; r.d = 'uc'; r.t = 0; r.fx = r.x; r.fy = r.y; r.tx = hkSlotX(o, s);
      o.kacan++; r.lift = 64 + (o.kacan % 3) * 28;   // geri gelen halka biraz daha alçakta
      r.ty = hkHalkaY(o, r.tx, r.lift); r.yardim = false;
      OLAY.emit('halkaKacti', { o, n: o.n });
    }
  }
  // ipucu: 12 sn dokunulmazsa sıradaki halka parlar, Pırıl ona uçup gösterir
  o.ipucu = lerp(o.ipucu, o.idle >= HK_IPUCU && !yardimModu ? 1 : 0, 1 - Math.exp(-dt * 2));
}
function hkTopla(o, r, kim) {
  r.d = 'alindi'; r.t = 0; o.n++; o.joy = 1;
  hkTozPatla(r.x, r.y, 26, 210);
  if (typeof burst === 'function') burst(r.x, r.y, 10, HK_TOZ, 160, 1.1, 7);
  hkSfx('halka', o.n);
  OLAY.emit('halka', { n: o.n, top: HK_TOP, x: r.x, y: r.y, kim, o });
  if (kim === 'piril' && typeof dragonHappy === 'function') { try { dragonHappy({ x: r.x, y: r.y }); } catch (e) {} }
  if (o.n >= HK_TOP) {
    o.faz = 'kosu'; o.t = 0; o.kosuX = o.mx; o.kosuSure = clamp((o.K.xe - o.mx) / 650, 2.4, 5.5);
    o.vh = Math.min(o.vh, 0);
    OLAY.emit('halkaKosu', { o });
  }
}
function hkPirilAdim(o, dt) {
  // Pırıl normalde Feza'nın arkasında yukarıda uçar; ipucu/yardımda sıradaki halkaya süzülür
  const evX = P.x - 78 + Math.sin(o.total * 1.3) * 10, evY = P.y - 70 + Math.sin(o.total * 2.1) * 9;
  const r = o.faz === 'yol' ? hkSonrakiHalka(o) : null;
  let w = 0, hx = evX, hy = evY;
  if (r) {
    const uzak = r.x - o.mx;
    if (r.yardim) { w = smooth(clamp((620 - uzak) / 380, 0, 1)); hx = r.x + 6; hy = r.y; }
    else if (o.ipucu > 0.05) {   // ipucu: halkanın etrafında küçük bir daire çizip geri döner
      const a = o.total * 2.4; w = o.ipucu * 0.85 * smooth(clamp((900 - uzak) / 400, 0, 1));
      hx = r.x + Math.cos(a) * 34; hy = r.y + Math.sin(a) * 52;
    }
  }
  o.prW = lerp(o.prW, w, 1 - Math.exp(-dt * 3));
  const tx = lerp(evX, hx, o.prW), ty = lerp(evY, hy, o.prW), k = 1 - Math.exp(-dt * (r && r.yardim ? 7 : 4));
  o.prX = lerp(o.prX, tx, k); o.prY = lerp(o.prY, ty, k);
  if (o.prW > 0.3 && Math.random() < dt * 14) hkTozAt(o.prX - 12, o.prY + 6, -30, 10, 0.6, 3, 2);
}
function hkIndi(o) {
  const K = o.K;
  P.x = K.x1; P.y = K.gy; P.vx = P.vy = 0; P.ground = true; P.safeX = P.x; P.safeY = P.y; P.ucus = null; P.dj = true; P.buf = 0; P.fade = 0;
  if (typeof D !== 'undefined') { D.x = P.x - 74; D.y = P.y - 91; D.vx = D.vy = 0; }
  o.done = true; o.faz = 'bitti'; o.t = 0; o.gidisT = 0; o.hk.bitti = true; o.mx = K.x1 - 70; o.my = hkYolY(o, o.mx); o.gx0 = o.mx; o.gy0 = o.my;
  if (typeof V6 !== 'undefined') V6.mini = true;
  hkTozPatla(P.x, P.y - 20, 18, 150);
  OLAY.emit('halkaBitti', { o, sure: o.total, toplanan: o.n });
}

// ── çizim ──
function hkYolCiz(o, tm) {
  const K = o.K, x0 = Math.max(K.x0 - 20, cam.x - 60), x1 = Math.min(K.x1 + 40, cam.x + VW + 60);
  if (x1 <= x0) return;
  // yolun altındaki bulut yastıkları (sabit dünya konumları, analitik salınım)
  const bul = hkBulutCiz();
  for (let i = Math.floor((x0 - 260) / 190); i <= Math.ceil(x1 / 190); i++) {
    const x = i * 190 + ((i * 37) % 60); if (x < K.xs - 120 || x > K.xe + 160) continue;
    const y = hkYolY(o, x + 130) - 34 + ((i * 53) % 30) + Math.sin(tm * 0.5 + i) * 3;
    g.drawImage(bul, x, y, 260, 110);
  }
  const n = Math.max(8, Math.ceil((x1 - x0) / 28));
  // yolun gövdesi: koyu taş şerit + alt ışıltı
  g.fillStyle = '#4b3a6c'; g.beginPath();
  for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); if (i) g.lineTo(x, hkYolY(o, x) - 2); else g.moveTo(x, hkYolY(o, x) - 2); }
  for (let i = n; i >= 0; i--) { const x = lerp(x0, x1, i / n); g.lineTo(x, hkYolY(o, x) + 15); }
  g.closePath(); g.fill();
  // kaldırım taşları: yürüyen hafif çizgiler
  g.strokeStyle = 'rgba(255,214,160,.22)'; g.lineWidth = 1;
  g.beginPath();
  for (let x = Math.floor(x0 / 34) * 34; x < x1; x += 34) { const y = hkYolY(o, x); g.moveTo(x, y + 1); g.lineTo(x - 4, y + 13); }
  g.stroke();
  // üst kenar: ışık bantları (fenerler yandıkça altın-pembe parlar)
  const a = 0.45 + 0.5 * (o.isik || 0);
  g.lineCap = 'round';
  g.strokeStyle = mixc('#b89adf', '#ffd77a', o.isik || 0, a); g.lineWidth = 3;
  g.beginPath(); for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); if (i) g.lineTo(x, hkYolY(o, x) - 2); else g.moveTo(x, hkYolY(o, x) - 2); } g.stroke();
  g.strokeStyle = 'rgba(255,170,215,' + (0.25 + 0.4 * (o.isik || 0)).toFixed(3) + ')'; g.lineWidth = 1.5;
  g.beginPath(); for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); if (i) g.lineTo(x, hkYolY(o, x) + 15); else g.moveTo(x, hkYolY(o, x) + 15); } g.stroke();
  // yolda kayan ışık damlaları
  for (let i = Math.floor(x0 / 160); i <= Math.ceil(x1 / 160); i++) {
    const x = i * 160 + (tm * 40) % 160, y = hkYolY(o, x) - 3;
    dglow(i % 2 ? '#ffd77a' : '#ff9fcf', x, y, 14, 0.25 + 0.3 * (o.isik || 0));
  }
}
function hkFenerlerCiz(o, tm) {
  const K = o.K, x0 = Math.max(K.xs, cam.x - 140), x1 = Math.min(K.xe + 200, cam.x + VW + 140);
  if (x1 <= x0) return;
  const art = hkFenerCiz(), isik = o.isik || 0;
  let onX = null, onY = 0;
  for (let i = Math.floor((x0 - K.xs) / HK_FENER_ARA); i <= Math.ceil((x1 - K.xs) / HK_FENER_ARA); i++) {
    const x = K.xs + 60 + i * HK_FENER_ARA; if (x > K.xe + 160) break;
    const yb = hkYolY(o, x) - 1, top = yb - 132;
    // direk: ince kıvrık demir, uçta kanca
    g.strokeStyle = '#3a2a55'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, yb); g.lineTo(x, top); g.quadraticCurveTo(x, top - 14, x + 14, top - 12); g.stroke();
    g.strokeStyle = 'rgba(255,214,160,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 1, yb - 4); g.lineTo(x + 1, top); g.stroke();
    // fener dizisi: bir önceki direkle arasında sarkan ışık çiçekleri
    if (onX !== null) {
      const sx = onX + 14, sy = onY - 10, ex = x - 2, ey = top - 6, my = Math.max(sy, ey) + 34;
      g.strokeStyle = 'rgba(60,44,90,.8)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo((sx + ex) / 2, my, ex, ey); g.stroke();
      for (let k = 1; k < 8; k++) {
        const u = k / 8, bx = (1 - u) * (1 - u) * sx + 2 * u * (1 - u) * (sx + ex) / 2 + u * u * ex, by = (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * my + u * u * ey;
        const col = HK_TOZ[(k + i) % HK_TOZ.length], par = 0.45 + 0.4 * isik + 0.15 * Math.sin(tm * 2.2 + k * 1.7 + i);
        dglow(col, bx, by + 4, 9 + 5 * isik, par * 0.5);
        g.fillStyle = col; g.globalAlpha = Math.min(1, 0.55 + par * 0.5); g.beginPath(); g.arc(bx, by + 4, 2.4, 0, 6.2832); g.fill(); g.globalAlpha = 1;
      }
    }
    onX = x; onY = top;
    // fener: Feza yaklaşınca biraz daha parlar
    const yakin = clamp(1 - Math.abs(x - P.x) / 300, 0, 1), sal = Math.sin(tm * 1.6 + i * 0.9) * 0.08;
    const lx = x + 14, ly = top - 10;
    dglow('#ffcf7a', lx, ly + 28, 46 + 20 * isik + 18 * yakin, 0.28 + 0.3 * isik + 0.2 * yakin);
    g.save(); g.translate(lx, ly); g.rotate(sal); g.drawImage(art, -18, 0, 36, 56); g.restore();
    dglow('#fff3c4', lx + Math.sin(sal) * -28, ly + 28, 10, 0.5 + 0.4 * isik);
  }
}
function hkHalkaCiz(o, r, tm, on) {
  if (r.x < cam.x - 90 || r.x > cam.x + VW + 90) return;
  const art = hkHalkaArt(r.r);
  let a = o.halkaA, sc = 1, y = r.y + Math.sin(tm * 1.8 + r.s) * 4;
  if (r.d === 'alindi') { const u = clamp(r.t / 0.6, 0, 1); a *= 1 - u; sc = 1 + u * 0.7; if (u >= 1) return; }
  else if (r.d === 'uc') { sc = 0.75; a *= 0.85; }
  if (a <= 0.01) return;
  const sira = r.d === 'bekle' && r === hkSonrakiHalka(o);
  if (!on) {
    // arka: sıcak hâle + parıltı + (ipucunda) nabız
    const nab = sira ? o.ipucu * (0.5 + 0.5 * Math.sin(tm * 5)) : 0;
    dglow(HK_RENK[r.r], r.x, y, 70 * sc + nab * 30, (0.3 + nab * 0.35) * a);
    if (r.d === 'alindi') { const u = clamp(r.t / 0.6, 0, 1); dglow('#ffffff', r.x, y, 60 + u * 80, (1 - u) * 0.7); }
    if (r.d === 'uc') { for (let k = 1; k < 6; k++) dglow(HK_RENK[r.r], r.x - k * 22, y + k * 6, 14 - k * 2, a * (0.4 - k * 0.06)); }
    g.globalAlpha = a; g.drawImage(art, 0, 0, 80, 320, r.x - 40 * sc, y - 80 * sc, 40 * sc, 160 * sc); g.globalAlpha = 1;
  } else {
    g.globalAlpha = a; g.drawImage(art, 80, 0, 80, 320, r.x, y - 80 * sc, 40 * sc, 160 * sc); g.globalAlpha = 1;
    // halka üzerinde dönen üç minik yıldız
    if (r.d === 'bekle') for (let k = 0; k < 3; k++) { const ang = tm * 1.6 + k * 2.094; hkYildiz(r.x + Math.cos(ang) * HK_RX, y + Math.sin(ang) * HK_RY, 3.2, tm + k, '#fffbe6', a * (0.55 + 0.45 * Math.cos(ang))); }
  }
}
function hkMidilliCiz(o, x, y, rot, tm) {
  const m = o.mOpt;
  m.kos = o.kosM || 0; m.zipla = clamp(o.h / 110, 0, 1); m.parilti = 1;
  dglow('#ffd7f0', x, y - 30, 78, 0.28);
  g.save(); g.translate(x, y); g.rotate(rot);
  if (typeof midilliCiz === 'function') { try { midilliCiz(g, 0, 0, HK_MOLC, tm, m); g.restore(); return; } catch (e) { g.restore(); g.save(); g.translate(x, y); g.rotate(rot); } }
  hkYerTutucu(o, tm); g.restore();
}
function hkYerTutucu(o, tm) {   // midilli.js yoksa basit, sevimli bir midilli (sağa bakar; 0,0 toynak tabanı)
  g.scale(1.18, 1.18);   // sırtı HK_SIRT hizasına gelsin
  const k = o.kos * 6.2832, uc = o.h > 4;
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
function hkIzCiz(o) {
  if (o.izN < 2) return;
  g.globalCompositeOperation = 'lighter';
  for (let j = 1; j < o.izN; j++) {
    const i = (o.izI - 1 - j + 48) % 24, x = o.iz[i * 2], y = o.iz[i * 2 + 1], u = 1 - j / o.izN;
    dglow(HK_TOZ[j % HK_TOZ.length], x - j * 4, y + Math.sin(j * 0.9) * 3, 6 + u * 8, u * 0.35);
  }
  g.globalCompositeOperation = 'source-over';
}
TUR.kaydet('halkaMini', {
  kur: hkKur,
  dokun: hkBasla,
  guncelle(o, dt) {
    if (!(dt > 0) || !Number.isFinite(dt)) return;
    hkTozAdim(dt);
    if (DURUM === 'oyun' && !P.ucus && o.faz === 'bekle' && !o.done && Math.abs(P.x - o.kx) < 90 && Math.abs(P.y - o.y0) < 110) hkBasla(o);
    if (o.faz === 'bekle') { o.kos += dt * 0.2; o.kosM = 0; return; }
    // çizim ayıklaması o.x'e bakar: yolculukta/sonrasında yolu ekrandaki yere taşı
    if (P.ucus !== o) o.x = clamp(cam.x + VW / 2, o.K.x0, o.K.x1 + 300);
    if (o.done) {
      o.gidisT += dt;   // midilli Feza'yı indirdikten sonra yıldız tozu bırakarak göğe süzülüp kaybolur
      const u = clamp(o.gidisT / 3.2, 0, 1);
      if (u < 1) { o.mx = o.gx0 + smooth(clamp((u - 0.15) / 0.85, 0, 1)) * 260; o.my = o.gy0 - smooth(clamp((u - 0.25) / 0.75, 0, 1)) * 320; o.kos += dt * 1.4; o.kosM = 0.8; o.h = u > 0.25 ? 20 : 0; if (u > 0.25 && Math.random() < dt * 20) hkTozAt(o.mx - 14, o.my - 10, -30, 20, 0.9, (Math.random() * 5) | 0, 2.5); }
    }
  },
  ciz(o, tm) {
    hkYolCiz(o, tm); hkFenerlerCiz(o, tm);
    if (o.faz === 'yol' || o.faz === 'kosu' || o.faz === 'binis') for (const r of o.halkalar) if (r.d !== 'bitti') hkHalkaCiz(o, r, tm, false);
    if (o.faz === 'bekle') {   // biniş öncesi: midilli yolun başında bekler, nazikçe başını sallar; eyerin üstünde davetkâr parıltı
      const x = o.kx, y = o.y0;
      o.rot = Math.sin(tm * 1.2) * 0.02; hkMidilliCiz(o, x, y, o.rot, tm);
      for (let i = 0; i < 3; i++) { const u = (tm * 0.35 + i / 3) % 1; hkYildiz(x - 4 + Math.sin(i * 2.1 + tm) * 16, y - HK_SIRT - 10 - u * 60, 4.5, tm + i, '#fff0c8', Math.sin(u * Math.PI) * 0.85); }
    }
    if (o.done) { const u = clamp(o.gidisT / 3.2, 0, 1); if (u < 1) { g.globalAlpha = 1 - smooth(clamp((u - 0.55) / 0.45, 0, 1)); hkMidilliCiz(o, o.mx, o.my, -0.12 * smooth(clamp(u * 3, 0, 1)), tm); g.globalAlpha = 1; } }
  },
  cizOn(o, tm) {
    if (P.ucus === o) {
      hkIzCiz(o);
      hkMidilliCiz(o, o.mx, o.my, o.rot, tm);
      const f = o.fzOpt; f.vy = -o.vh * 0.35; f.sevinc = smooth(clamp(o.joy, 0, 1)); f.aci = 0; f.ruzgar = o.faz === 'kosu' ? 1 : 0.55;
      if (typeof fezaCizPoz === 'function') {
        try {
          if (o.faz === 'binis' && o.t < HK_BINIS * 0.6 || o.faz === 'inis' && o.t > HK_INIS * 0.4) fezaCizPoz(g, P.x, P.y, 1, 'sevinc', tm);
          else { g.save(); g.translate(o.mx, o.my); g.rotate(o.rot); fezaCizPoz(g, HK_SEDX, -HK_SIRT, 1, 'binis', tm, null, f); g.restore(); }
        } catch (e) {}
      }
      if (typeof pirilCizPoz === 'function') { try { pirilCizPoz(g, o.prX, o.prY, 0.95, o.joy > 0.6 && o.prW < 0.3 ? 'goz_kirp' : 'ucus', tm); } catch (e) {} }
    }
    if (o.faz === 'yol' || o.faz === 'kosu' || o.faz === 'binis') for (const r of o.halkalar) hkHalkaCiz(o, r, tm, true);
    hkTozCiz();
    if (o.faz === 'kosu') {   // dörtnala koşu: arkada uzanan ışık çizgileri
      g.strokeStyle = 'rgba(255,240,210,.5)'; g.lineWidth = 1.5; g.beginPath();
      for (let i = 0; i < 6; i++) { const y = o.my - 20 - i * 18 + Math.sin(tm * 9 + i) * 4, x = o.mx - 70 - ((tm * 900 + i * 53) % 220); g.moveTo(x, y); g.lineTo(x - 40, y); }
      g.stroke();
    }
  }
});

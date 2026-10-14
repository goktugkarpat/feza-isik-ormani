/* ucus.js – Bölüm 3 Pırıl'ın sırtında uçuş (UCUS, önek uc). Sözleşme: src/BOLUM3.md ("Uçuş kancası").
   • ucusKapisi türü (LEVEL3 yerleştirir, Büyük Boşluk'un başında; koridor BOLUM.ucus = {x0,x1,yUst,yAlt}):
     Feza gelince kısa sahne: Pırıl yanına süzülür, ışıkla BÜYÜR ("Bin sırtıma!"), Feza sırtına zıplar → P.ucus = o, OLAY 'ucusBasla'.
   • Uçuş: kendi kendine ileri gider; Feza parmağını hangi yükseklikte tutarsa Pırıl yumuşakça oraya süzülür (girdi.hedefY, klavyede eksenY).
     Yolda ışıltı dizileri (toplayınca yükselen notalar, OLAY 'isilti'), içinden geçilen pembe bulut kemerleri, yanında uçan kuş sürüsü,
     yumuşak bulutlar (yalnız hafifçe iter; çarpma/kaybetme YOK), ışık izi ve pırıltılar.
   • İniş: koridorun sonunda Gökkuşağı Tepesi'ne yumuşak iniş, Feza yere atlar, Pırıl ışıkla küçülür, P.ucus = null, OLAY 'ucusBitti', o.done = true.
   • CORE kancası: P.ucus doluyken stepPlayer normal fiziği atlar ve o.adim(dt, girdi) çağırır (girdi.hedefY dünya y'si). Kanca yoksa (eski oyun.js)
     bu dosya aynı işi guncelle içinde kendisi yapar (yedek).
   • Kuzucuklar için: UC.takip(i) → uçuş sırasında i. kuzucuğun durması gereken yer (Pırıl'ın kuyruğunun arkasında, ışık izinin üstünde) ya da null. */
'use strict';

const UC_OLC = 2.2;                    // uçarken Pırıl'ın büyüklüğü (normal = 1)
const UC_KOLTUK = { x: -1, y: -9 };    // binek pozunda Feza'nın oturduğu yer, Pırıl'ın gövde ortasına göre (olcek 1 birimi; çizimde pirilBinekKoltuk)
const UC_KUYRUK = { x: -40, y: 1 };    // kuyruk ucu (ışık izi buradan çıkar)
const UC_SURE = 38;                    // hedef uçuş süresi (sn), hız koridor uzunluğundan çıkar
const UC_KANAT_HZ = 1.15;              // büyük Pırıl'ın kanat çırpma sıklığı
const UC_RENK = ['#ff8fa8', '#ffb877', '#ffe17a', '#9be89a', '#8cc8ff', '#9aa6ff', '#d4a2ff'];   // gökkuşağı (pastel)
const UC_IZ_N = 90;
let UC_KURDELE = null;   // ışık izi kurdelesinin 7 rengi (ilk çizimde hazırlanır)
const UC_YILDIZ = ['#ff6f8e', '#ff9a4a', '#ffcf2e', '#6fd86a', '#55aaff', '#6f7cff', '#b77bff'];   // toplanan yıldızlar (doygun: aydınlık gökte seçilsin)
const UC_AYAK = 13;                    // binek pozunda ayak tabanı gövde ortasının bu kadar altında (×olcek)

function ucSfx(ad, v) { if (typeof AU !== 'undefined' && AU && typeof AU.sfx === 'function') { try { AU.sfx(ad, v); } catch (e) {} } }
function ucSoyle(k) { if (typeof SES !== 'undefined' && SES && typeof SES.soyle === 'function') { try { SES.soyle(k); } catch (e) {} } }
const ucEase = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const ucOut = u => u <= 0 ? 0 : u >= 1 ? 1 : 1 - (1 - u) * (1 - u) * (1 - u);
function ucBack(u) { if (u <= 0) return 0; if (u >= 1) return 1; const c = 1.9, v = u - 1; return 1 + (c + 1) * v * v * v + c * v * v; }

// ── pozlar (PIRIL/FEZA ajanları ekliyor; yoksa yedek) ──
let ucPozVar = null;
function ucPozlar() {
  if (ucPozVar) return ucPozVar;
  const p = typeof pirilCizPoz === 'function', f = typeof fezaCizPoz === 'function';
  ucPozVar = { piril: p, feza: f, binek: p && String(pirilCizPoz).indexOf("'binek'") >= 0, binis: f && String(fezaCizPoz).indexOf("'binis'") >= 0 };
  return ucPozVar;
}

// ── önbellekli bulut ponponu (kemer + yumuşak bulut) ──
const ucPon = {};
function ucPonpon(renk, duz) {   // duz: daha yumuşak gölgeli (halkalarda boncuk gibi görünmesin)
  const anah = duz ? renk + 'd' : renk;
  if (ucPon[anah]) return ucPon[anah];
  const N = 128, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d'), h = N / 2, A = hex(renk);
  const L = k => `${Math.round(lerp(A[0], 255, k))},${Math.round(lerp(A[1], 255, k))},${Math.round(lerp(A[2], 255, k))}`;
  const gr = x.createRadialGradient(h - 12, h - 16, 2, h, h, h);
  gr.addColorStop(0, `rgba(${L(duz ? 0.42 : 0.78)},1)`); gr.addColorStop(0.45, `rgba(${L(duz ? 0.24 : 0.4)},1)`);
  gr.addColorStop(0.8, `rgba(${L(0)},1)`); gr.addColorStop(0.92, `rgba(${L(0)},0.6)`); gr.addColorStop(1, `rgba(${L(0)},0)`);
  x.fillStyle = gr; x.beginPath(); x.arc(h, h, h, 0, 6.283); x.fill();
  return ucPon[anah] = c;
}
function ucPonCiz(renk, x, y, r, a, duz) { if (a <= 0.01) return; g.globalAlpha = a; g.drawImage(ucPonpon(renk, duz), x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; }

// dört uçlu ışıltı yıldızı
function ucYildiz(x, y, s, rot, a, renk, kenar, k0) {   // dört uçlu tombul yıldız (kenar verilirse çizgili)
  if (a <= 0.01) return;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a; g.fillStyle = renk;
  const k = s * (k0 || 0.12);
  g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(k, -k, s, 0); g.quadraticCurveTo(k, k, 0, s); g.quadraticCurveTo(-k, k, -s, 0); g.quadraticCurveTo(-k, -k, 0, -s); g.closePath();
  if (kenar) { g.strokeStyle = kenar; g.lineWidth = 2.2; g.lineJoin = 'round'; g.stroke(); }
  g.fill();
  g.restore(); g.globalAlpha = 1;
}

// ── koridor + yol içeriği ──
function ucKoridor(o) {
  const B = typeof BOLUM !== 'undefined' && BOLUM && BOLUM.ucus ? BOLUM.ucus : null;
  if (B && isFinite(B.x0) && isFinite(B.x1) && B.x1 > B.x0 + 400) return { x0: B.x0, x1: B.x1, yUst: isFinite(B.yUst) ? B.yUst : o.y - 520, yAlt: isFinite(B.yAlt) ? B.yAlt : o.y - 40 };
  return { x0: o.x, x1: o.x + 7200, yUst: o.y - 520, yAlt: o.y - 40 };
}
// uçuşta P.y (Feza'nın oturduğu nokta) için güvenli bant
function ucBant(o) { const K = o.K, ust = K.yUst + 110, alt = Math.max(ust + 60, K.yAlt - 40); return { ust, alt }; }

function ucInisYeri(o) {
  const K = o.K;
  if (typeof topOf === 'function' && typeof ROWS !== 'undefined' && typeof COLS !== 'undefined') {
    const c0 = Math.max(0, Math.floor(K.x1 / T));
    for (let c = c0; c < Math.min(COLS - 3, c0 + 40); c++) {
      let ok = true;
      for (let k = 0; k < 4; k++) if (topOf(c + k) >= ROWS || Math.abs(topOf(c + k) - topOf(c)) > 1) { ok = false; break; }
      if (ok) { const cc = c + 5; return { x: cc * T + T / 2, y: topOf(cc) * T }; }
    }
  }
  const GK = typeof BOLUM !== 'undefined' && BOLUM && BOLUM.gokkusagi;
  if (GK && isFinite(GK.x)) return { x: Math.max(K.x1, GK.x - 6 * T), y: GK.y };
  return { x: K.x1 + 120, y: K.yAlt + 40 };
}

// dar (dikey) ekran: iz/kuyruk/kuzucuk treni ve gökteki hayvanlar kısalır (Feza'nın solunda az yer var)
function ucDar() { return clamp((W / Math.max(H, 1)) / 1.33, 0.5, 1); }
// [xa, xb] aralığındaki en yüksek zemin üstü (dünya y; zemin yoksa +∞) — iniş yolu bulut sütunlarının içinden geçmesin
function ucZeminUst(xa, xb) {
  if (typeof topOf !== 'function' || typeof ROWS === 'undefined') return 1e9;
  let m = 1e9;
  for (let c = Math.max(0, Math.floor(xa / T)), c1 = Math.min(COLS - 1, Math.floor(xb / T)); c <= c1; c++) { const t = topOf(c); if (t < ROWS) m = Math.min(m, t * T); }
  return m;
}
function ucIcerik(o) {
  const K = o.K, b = ucBant(o), r = rng(4242), L = K.x1 - K.x0;
  const yM = (b.ust + b.alt) / 2 - 30, yH = b.alt - b.ust;   // Feza'nın gövdesi P.y'nin ~30 üstünde
  const yuk = f => yM - yH * f * 0.5;                           // f: -1 alt .. 1 üst
  o.isk = []; o.dizi = []; o.kemer = []; o.bulut = [];
  const dizi = (noktalar, renkler) => {
    const d = { n: noktalar.length, top: 0, son: -9 }, di = o.dizi.length; o.dizi.push(d);
    noktalar.forEach((p, i) => { const rk = renkler ? renkler[i % renkler.length] : '#ffc93a'; o.isk.push({ x: p[0], y: p[1], d: di, i, renk: rk, kenar: mixHex(rk, '#8a3f6a', 0.45), al: false, t: 0, ph: r() * 6.28, s: 1 }); });
  };
  const yay = (x, y, w, h, n, ters) => { const a = []; for (let i = 0; i < n; i++) { const u = i / (n - 1); a.push([x + u * w, y - (ters ? -1 : 1) * Math.sin(u * Math.PI) * h]); } return a; };
  const dalga = (x, y, w, h, n, k) => { const a = []; for (let i = 0; i < n; i++) { const u = i / (n - 1); a.push([x + u * w, y + Math.sin(u * Math.PI * 2 * (k || 1)) * h]); } return a; };
  const cizgi = (x, y, w, dy, n) => { const a = []; for (let i = 0; i < n; i++) { const u = i / (n - 1); a.push([x + u * w, y + u * dy]); } return a; };
  const kalp = (cx, cy, s, n) => { const a = []; for (let i = 0; i < n; i++) { const t = i / n * 6.283; a.push([cx + 16 * Math.pow(Math.sin(t), 3) * s, cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s]); } return a; };
  const X = f => K.x0 + L * f;
  const altin = ['#ffc93a', '#ffd65c', '#ffbf2e'], pembe = ['#ff8cc0', '#ffa3cf', '#ff7fb4'], gok = UC_YILDIZ;
  // ritim: ışıltı → kemer → ışıltı → yumuşak bulut ... (her şey Feza'nın kendiliğinden geçeceği yüksekliklere yakın)
  dizi(yay(X(0.055), yuk(0.05), 520, 70, 8), altin);
  o.kemer.push({ x: X(0.14), y: yuk(0.2), rx: 46, ry: 128, renk: '#ffb3d1', gecti: false, parla: 0, ph: 0 });
  dizi(dalga(X(0.19), yuk(0.1), 700, 55, 10), pembe);
  o.bulut.push({ x: X(0.27), y: yuk(0.75), r: 80, renk: '#ffe1cf', ez: 0, ezV: 0, ph: 1 });
  dizi(cizgi(X(0.255), yuk(-0.2), 420, 0, 6), altin);
  o.bulut.push({ x: X(0.31), y: yuk(-0.85), r: 74, renk: '#e8d6ff', ez: 0, ezV: 0, ph: 2 });
  dizi(cizgi(X(0.34), yuk(-0.35), 460, -yH * 0.55, 7), altin);
  o.kemer.push({ x: X(0.40), y: yuk(0.45), rx: 46, ry: 130, renk: '#ffc6a8', gecti: false, parla: 0, ph: 1 });
  o.ortaX = X(0.47);
  dizi(kalp(X(0.49), yuk(0.05) - 10, 5.2, 16), ['#ff6fa8', '#ff8cc0', '#ff5f9e']);
  dizi(dalga(X(0.56), yuk(-0.1), 760, 80, 11, 1), pembe);
  o.kemer.push({ x: X(0.645), y: yuk(-0.45), rx: 46, ry: 126, renk: '#e5b8ff', gecti: false, parla: 0, ph: 2 });
  o.bulut.push({ x: X(0.70), y: yuk(0.1), r: 92, renk: '#ffd6e4', ez: 0, ezV: 0, ph: 3 });
  dizi(yay(X(0.675), yuk(0.75), 420, 30, 6), altin);
  dizi(yay(X(0.675), yuk(-0.7), 420, 30, 6, true), altin);
  dizi(cizgi(X(0.75), yuk(-0.3), 380, -yH * 0.4, 6), altin);
  o.kemer.push({ x: X(0.80), y: yuk(0.35), rx: 46, ry: 128, renk: '#ffb3d1', gecti: false, parla: 0, ph: 3 });
  dizi(yay(X(0.85), yuk(-0.15), 640, 120, 7), gok);   // son dizi: gökkuşağı renkleri, inişe doğru
  // kuş sürüsü: koridorun ortasında yanlarında uçar
  o.vayX = X(0.575);
  o.kus = { bas: X(0.29), son: X(0.55), a: 0, list: [] };
  for (let i = 0; i < 7; i++) o.kus.list.push({ ox: 150 + (i % 4) * 60 + r() * 30, oy: -150 - Math.floor(i / 2) * 26 + r() * 20 + (i % 2) * 50, ph: r() * 6.28, s: 0.8 + r() * 0.4, hz: 2.6 + r() * 0.8 });
  o.iskTop = o.isk.length;
}

// ── bulut hayvanları: "Bulutlarda ne var?"da canlanan hayvanlar uçuşun ortasında gökyüzünde yanlarına gelip selam verir ──
const ucHayvanlar = [];
OLAY.on('sekil', e => { const ad = e && e.hayvan; if (ad && ucHayvanlar.indexOf(ad) < 0) ucHayvanlar.push(ad); });
const UC_VAY_SURE = 11;   // gökte kalış süresi (sn)
function ucVayListe() {
  const a = ucHayvanlar.slice(0, 4);
  for (const d of ['balina', 'tavsan', 'kus', 'fil']) { if (a.length >= 3) break; if (a.indexOf(d) < 0) a.push(d); }
  return a;
}
function ucVayGuncelle(o, dt, mx) {
  if (!o.vay) { if (o.bagli && o.faz === 'ucus' && mx > o.vayX) { o.vay = { t: 0, liste: ucVayListe(), giris: [] }; } return; }
  const V = o.vay; V.t += dt;
  V.liste.forEach((ad, i) => {
    if (!V.giris[i] && V.t > 0.4 + i * 0.9) { V.giris[i] = true; const ix = typeof SKL_HAYVAN !== 'undefined' ? SKL_HAYVAN.indexOf(ad) : i; ucSfx('sekilCanlan', ix < 0 ? i : ix); if (i === 0) { ucSoyle('p_b_selam'); if (typeof dragonHappy === 'function') { try { dragonHappy(o); } catch (e) {} } } o.sevT = 1.3; }
  });
}
let ucVayBuf = null;
function ucVayCiz(o, tm) {
  const V = o.vay; if (!V || V.t > UC_VAY_SURE + 4) return;
  if (typeof sklPoz !== 'function' || typeof sklBulutCiz !== 'function' || typeof sklYeni !== 'function') return;
  if (!ucVayBuf) ucVayBuf = sklYeni();
  const vh = H / S, n = V.liste.length;
  for (let i = 0; i < n; i++) {
    const ad = V.liste[i], t = V.t - 0.4 - i * 0.9; if (t < 0) continue;
    // ekranın sağından süzülerek gelir, yanlarında uçar, sonunda geride kalır (sola akar)
    const gel = ucOut(clamp(t / 2.4, 0, 1)), git = ucEase(clamp((t - (UC_VAY_SURE - i * 0.9)) / 3, 0, 1));
    const hedefF = 0.4 + (i / Math.max(1, n - 1)) * 0.36;
    const fx = lerp(1.3, hedefF, gel) - git * (hedefF + 0.5);
    const fy = 0.22 + (i % 2) * 0.08 + Math.sin(tm * 0.8 + i * 1.7) * 0.02;
    const R = (ad === 'balina' ? 96 : 74) * (0.7 + 0.3 * gel) * lerp(0.62, 1, (ucDar() - 0.5) * 2);
    const x = cam.x + VW * fx, y = cam.y + vh * fy;
    if (x < cam.x - R * 2 || x > cam.x + VW + R * 2) continue;
    const tt = t % 3.9, amp = smooth(clamp(Math.min(tt, 3.9 - tt) / 0.5, 0, 1));
    try {
      sklPoz(ad, tt, amp, ucVayBuf);
      dglow('#fff3e0', x, y, R * 2.4, 0.35);
      sklBulutCiz(x, y, R, ucVayBuf, ucVayBuf.length, sklRenkler(ad, 1), 0.08, tm);
      sklYuzCiz(x, y, R, ucVayBuf, ad, 1, tm, i * 1.3);
    } catch (e) { o.vay.t = 1e9; return; }
    // selam: etraflarında süzülen minik kalp-yıldızlar
    if (gel > 0.5 && git < 0.5) for (let k = 0; k < 3; k++) {
      const u = (tm * 0.5 + k / 3 + i * 0.27) % 1;
      ucYildiz(x + Math.sin(k * 2.4 + tm) * R * 0.9, y - R * 0.6 - u * 60, 6, tm + k, Math.sin(u * Math.PI) * 0.9, UC_YILDIZ[(i * 2 + k) % 7], null, 0.3);
    }
  }
}

// ── durum ──
const UC = {
  o: null,
  aktif() { return !!(this.o && P.ucus === this.o); },
  // i. kuzucuğun uçuş sırasında durması gereken yer (ışık izinin üstünde, kuyruğun arkasında). Uçuş yoksa null.
  takip(i) {
    const o = this.o; if (!o || P.ucus !== o || !o.iz || o.izN < 2) return null;
    const k = Math.min(o.izN - 1, 6 + i * 5), j = (o.izI - 1 - k + UC_IZ_N * 4) % UC_IZ_N;
    return { x: o.iz[j * 2], y: o.iz[j * 2 + 1] + 8 + Math.sin(now * 3 + i) * 4 };
  },
  // test: uçuşu hemen başlat (kapı nesnesi verilmezse ilk ucusKapisi)
  baslat(o) { o = o || NESNELER.find(n => n.tip === 'ucusKapisi'); if (o) { o.dokundu = true; ucBasla(o); } return o; },
};

function ucBasla(o) {
  if (o.faz !== 'bekle' || o.done) return;
  UC.o = o;
  o.faz = 'gel'; o.t = 0; o.ft = 0;
  o.gx = P.x; o.gy = P.y;                                  // Feza'nın durduğu yer
  o.dx = isFinite(D.x) ? D.x : P.x - 60; o.dy = isFinite(D.y) ? D.y : P.y - 100;
  o.d0x = o.dx; o.d0y = o.dy; o.olc = 1; o.rot = 0; o.vy = 0; o.vx = 0;
  o.bagli = false; o.fpoz = 'ayakta'; o.fx = P.x; o.fy = P.y; o.flash = 0; o.halka = -1;
  o.izN = 0; o.izI = 0; o.izT = 0; o.kanat = 0; o.ortaSoy = false; o.dizSon = -1; o.bosKare = 0;
  o.ix = ucInisYeri(o); o.inT = 0;
  P.vx = P.vy = 0;
  P.ucus = o;
  if (typeof dragonHappy === 'function') { try { dragonHappy(o); } catch (e) {} }
}

// Feza'nın koltuk noktası (P) ← Pırıl'ın merkezi + döndürülmüş koltuk
function ucKoltuk(o, cx, cy) {
  const s = o.olc, c = Math.cos(o.rot), si = Math.sin(o.rot), kx = UC_KOLTUK.x * s, ky = UC_KOLTUK.y * s;
  return { x: cx + kx * c - ky * si, y: cy + kx * si + ky * c };
}
function ucMerkez(o) {   // çizimde: bağlıyken merkez P'den (CORE yumuşatmasıyla aynı) çıkar
  if (!o.bagli) return { x: o.dx, y: o.dy };
  const s = o.olc, c = Math.cos(o.rot), si = Math.sin(o.rot), kx = UC_KOLTUK.x * s, ky = UC_KOLTUK.y * s;
  return { x: P.x - (kx * c - ky * si), y: P.y - (kx * si + ky * c) };
}

// otomatik pilot: parmak yokken yaklaşan ışıltıya/kemere doğru çok yumuşak yönelir
function ucOtoY(o, cx) {
  let en = null, ex = 1e9;
  for (const s of o.isk) if (!s.al && s.x > cx + 40 && s.x - cx < ex && s.x - cx < 900) { ex = s.x - cx; en = s.y + 30; }
  for (const k of o.kemer) if (!k.gecti && k.x > cx + 40 && k.x - cx < ex && k.x - cx < 900) { ex = k.x - cx; en = k.y + 30; }
  return en;
}

// ── her fizik adımı (CORE stepPlayer'dan; yoksa guncelle'den) ──
function ucAdim(o, dt, girdi) {
  o.adimN = (o.adimN || 0) + 1;
  if (!(dt > 0)) return;
  o.t += dt;
  P.vx = 0; P.vy = 0; P.ground = false;
  const f = o.faz;
  if (f === 'gel') {   // küçük Pırıl Feza'nın önüne süzülür
    const u = ucEase(o.t / 0.8);
    const hx = o.gx + 95, hy = o.gy - 80;
    o.dx = lerp(o.d0x, hx, u); o.dy = lerp(o.d0y, hy, u) - Math.sin(u * Math.PI) * 30;
    o.fpoz = 'ayakta_yan';
    if (o.t >= 0.8) {
      o.faz = 'buyu'; o.t = 0; o.b0x = o.dx; o.b0y = o.dy;
      ucSfx('pirilBuyu'); ucSoyle('p_b_ucus');
      burst(o.dx, o.dy, 34, ['#ffffff', '#ffe9ff', '#d8b8ff', '#fff3b0'], 230, 1.4, 10);
      o.halka = 0;
      if (typeof omDikkat === 'function' && typeof omDkEkle === 'function') {
        try { omDikkat('ucusBuyu', 3.4, () => { omDkEkle(o.gx - 150, o.gy - 260, o.gx + 260, o.gy + 20); }, 1, 0.72); } catch (e) {}
      }
    }
  } else if (f === 'buyu') {   // ışıkla büyür, Feza'nın yanına alçalır
    const u = clamp(o.t / 1.25, 0, 1);
    o.olc = lerp(1, UC_OLC, ucBack(u));
    o.dx = lerp(o.b0x, o.gx + 128, ucEase(u)); o.dy = lerp(o.b0y, o.gy - 34, ucEase(u)) + Math.sin(o.t * 6.5) * 2 * u;
    o.flash = Math.sin(clamp(o.t / 0.9, 0, 1) * Math.PI);
    o.fpoz = o.t > 0.9 ? 'sevinc' : 'ayakta_yan';
    if (o.t >= 1.7) { o.faz = 'bin'; o.t = 0; const k = ucKoltuk(o, o.dx, o.dy); o.hk = k; o.fx = o.gx; o.fy = o.gy; }
  } else if (f === 'bin') {    // Feza zıplar, sırtına oturur
    const u = clamp(o.t / 0.6, 0, 1), e = ucEase(u);
    o.dy = o.gy - 34 + Math.sin(o.t * 6.5) * 2;
    const k = ucKoltuk(o, o.dx, o.dy);
    o.fx = lerp(o.gx, k.x, e); o.fy = lerp(o.gy, k.y, e) - Math.sin(u * Math.PI) * 60;
    o.fpoz = u < 0.5 ? 'sevinc' : 'binis';
    P.x = o.fx; P.y = o.fy;
    if (u >= 1) {
      o.faz = 'oturdu'; o.t = 0; o.bagli = true; o.fpoz = 'binis';
      burst(k.x, k.y, 14, ['#ffffff', '#ffe9ff', '#fff3b0'], 120, 0.9, 7);
      ucSfx('bulutZip', 0.3);
    }
  } else if (f === 'oturdu' || f === 'ucus') {
    const b = ucBant(o);
    if (f === 'oturdu') {   // otururken çökme, sonra havalanma
      if (o.t < 0.35) o.dy = o.gy - 34 + Math.sin(o.t / 0.35 * Math.PI) * 7;
      else { o.faz = 'ucus'; o.t = 0; o.vx = 30; o.vy = -120; o.kH = clamp((b.ust + b.alt) / 2, b.ust, b.alt); ucSfx('ucusBasla'); OLAY.emit('ucusBasla', o);
        burst(o.dx, o.dy + 30, 26, ['#ffffff', '#ffe1cf', '#ffd0e6'], 160, 1.1, 12); }
    }
    if (o.faz === 'ucus') {
      const K = o.K, V = o.V;
      // yatay: yumuşakça sabit hıza çıkar (parmak yalnız yüksekliği seçer)
      o.boost = Math.max(0, (o.boost || 0) - dt * 0.9);
      // son ≈5 sn: Gökkuşağı Tepesi ufukta → "İşte Gökkuşağı Tepesi!", Pırıl sevinir, Feza kolunu kaldırır, yavaşlayıp süzülme
      const yaklas = Math.min(K.x1, o.ix.x - 520) - 5 * V, yu = clamp((o.dx - yaklas) / (5 * V), 0, 1);
      if (yu > 0 && !o.yaklasti) { o.yaklasti = true; ucSoyle('p_b_tepe'); o.sevT = 1.8; if (typeof D !== 'undefined') D.bkSev = 1; ucSfx('isiltiTamam'); }
      o.yak = yu;
      const hz = V * (1 + 0.4 * ucEase(o.boost)) * lerp(1, 0.78, ucEase(yu));   // kemerden geçince kısa "vınnn" hızlanması
      o.vx += (hz - o.vx) * (1 - Math.exp(-dt * 0.9));
      o.dx += o.vx * dt;
      // dikey hedef: parmağın yüksekliği (Feza'nın gövdesi parmağa gelsin) / klavye / otomatik pilot
      const parmak = girdi && girdi.hedefY !== null && girdi.hedefY !== undefined && isFinite(girdi.hedefY);
      if (parmak) { o.kH = girdi.hedefY + 34; o.oto = 0; o.denedi = true; }
      else if (girdi && girdi.eksenY) { o.denedi = true; o.kH += clamp(girdi.eksenY, -1, 1) * 340 * dt; o.oto = 0; }
      else {
        o.oto = Math.min(1, (o.oto || 0) + dt * 0.5);   // bırakınca 2 sn içinde yavaşça devreye girer
        const oy = ucOtoY(o, o.dx);
        if (oy !== null) o.kH += (oy - o.kH) * (1 - Math.exp(-dt * 0.9 * o.oto));
      }
      o.kH = clamp(o.kH, b.ust, b.alt);
      // yay: P.y hedefe; merkez = P - koltuk → merkez hedefi
      const kx = ucKoltuk(o, 0, 0), hedefC = o.kH - kx.y;
      const kk = 9, cc = 5.4;
      let ay = (hedefC - o.dy) * kk - o.vy * cc;
      // yumuşak bulutlar: içine girince hafifçe dışarı iter (çarpma yok)
      for (const bl of o.bulut) {
        const ddx = o.dx - bl.x, ddy = o.dy - bl.y, d = Math.hypot(ddx * 0.8, ddy), R = bl.r + 55;
        if (d < R) { const it = (1 - d / R); ay += Math.sign(ddy || 1) * it * 900; if (!bl.dokundu) { bl.dokundu = true; bl.ezV += 3; ucSfx('bulutZip', 0.25); } bl.ezV += it * dt * 6; }
        else if (d > R + 80) bl.dokundu = false;
      }
      o.vy = clamp(o.vy + ay * dt, -330, 330);
      o.kanat += dt * UC_KANAT_HZ * (1 + clamp(-o.vy / 330, 0, 1) * 0.5);
      o.dy += o.vy * dt;
      o.dy = clamp(o.dy, b.ust - kx.y - 30, b.alt - kx.y + 30);
      o.rot += (clamp(o.vy / 1100, -0.22, 0.22) - o.rot) * (1 - Math.exp(-dt * 5));
      o.ilerle = clamp((o.dx - K.x0) / (K.x1 - K.x0), 0, 1);
      if (!o.ortaSoy && o.dx > o.ortaX) { o.ortaSoy = true; ucSoyle('p_b_ucus2'); if (typeof dragonHappy === 'function') { try { dragonHappy(o); } catch (e) {} } }
      // iniş başlangıcı
      if (o.dx >= Math.min(K.x1, o.ix.x - 520)) {
        o.faz = 'inis'; o.t = 0; o.i0x = o.dx; o.i0y = o.dy; o.ivx = o.vx; o.ivy = o.vy;
        o.iSure = clamp((o.ix.x - 70 - o.dx) / Math.max(o.vx, 80) * 1.6, 2.2, 4.5);
      }
    }
    const bob = Math.sin(o.kanat * 6.283 - 1.2) * 3.2;
    const k = ucKoltuk(o, o.dx, o.dy + bob);
    P.x = k.x; P.y = k.y;
  } else if (f === 'inis') {   // tepeye süzülerek iniş (Hermite eğrisi; başlangıç hızıyla kesintisiz)
    const u = clamp(o.t / o.iSure, 0, 1), sur = o.iSure;
    const x1 = o.ix.x - 70, y1 = o.ix.y - UC_AYAK * UC_OLC;   // Pırıl'ın ayakları yere değecek
    const h = (p0, v0, p1, v1) => { const u2 = u * u, u3 = u2 * u; return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * v0 * sur + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * v1 * sur; };
    const ox = o.dx, oy = o.dy;
    o.dx = h(o.i0x, o.ivx, x1, 0); o.dy = h(o.i0y, o.ivy, y1, 0);
    const ust = ucZeminUst(o.dx - 95, o.dx + 85) - UC_AYAK * UC_OLC - 6;   // gövde (kuyruk dahil) zeminin/sütunun üstünde kalsın
    if (o.dy > ust) o.dy = lerp(o.dy, ust, u < 0.98 ? 1 : 0);
    if (dt > 0) { o.vx = (o.dx - ox) / dt; o.vy = (o.dy - oy) / dt; }
    o.kanat += dt * UC_KANAT_HZ * lerp(1, 1.8, ucEase((u - 0.6) / 0.4));   // yere yaklaşırken kanatlar hızlanır (fren)
    o.rot += (lerp(clamp(o.vy / 1100, -0.22, 0.22), -0.12, ucEase((u - 0.55) / 0.35)) * (u < 0.95 ? 1 : 0) - o.rot) * (1 - Math.exp(-dt * 5));
    const bob = Math.sin(o.kanat * 6.283 - 1.2) * 3.2 * (1 - u);
    const k = ucKoltuk(o, o.dx, o.dy + bob); P.x = k.x; P.y = k.y;
    if (u >= 1) {
      o.faz = 'in'; o.t = 0; o.rot = 0;
      ucSfx('ucusIn');
      burst(o.dx, o.ix.y - 6, 30, ['#ffffff', '#ffe1cf', '#ffd0e6', '#fff3b0'], 170, 1.2, 13);
    }
  } else if (f === 'in') {     // yere değiş: yumuşak çökme
    const u = clamp(o.t / 0.45, 0, 1);
    o.dy = o.ix.y - UC_AYAK * UC_OLC + Math.sin(u * Math.PI) * 9;
    const k = ucKoltuk(o, o.dx, o.dy); P.x = k.x; P.y = k.y;
    if (u >= 1) { o.faz = 'atla'; o.t = 0; o.bagli = false; o.fx = k.x; o.fy = k.y; o.fpoz = 'sevinc'; }
  } else if (f === 'atla') {   // Feza sırttan öne atlar
    const u = clamp(o.t / 0.6, 0, 1), e = ucEase(u);
    const tx = o.ix.x + 40, ty = o.ix.y;
    P.x = lerp(o.fx, tx, e); P.y = lerp(o.fy, ty, u * u) - Math.sin(u * Math.PI) * 50;
    o.fpoz = 'sevinc';
    if (u >= 1) {
      P.x = tx; P.y = ty; o.faz = 'kucul'; o.t = 0; o.k0x = o.dx; o.k0y = o.dy; o.halka = 0;
      burst(tx, ty - 4, 10, ['#ffffff', '#ffe1cf'], 90, 0.7, 8);
      ucSfx('pirilBuyu', 0);   // (ses yoksa sessiz)
    }
  } else if (f === 'kucul') {  // Pırıl ışıkla normal boyuna döner
    const u = clamp(o.t / 1.0, 0, 1);
    o.olc = lerp(UC_OLC, 1, ucEase(u));
    o.flash = Math.sin(clamp(o.t / 0.8, 0, 1) * Math.PI) * 0.55;
    o.dx = lerp(o.k0x, P.x - 50, ucEase(u)); o.dy = lerp(o.k0y, P.y - 95, ucEase(u)) - Math.sin(u * Math.PI) * 20;
    P.x = o.ix.x + 40; P.y = o.ix.y;
    o.fpoz = u < 0.75 ? 'sevinc' : 'ayakta_yan';
    if (u >= 1) ucBitir(o);
  }
}

function ucBitir(o) {
  o.faz = 'bitti'; o.done = true; o.bagli = false; o.flash = 0;
  P.x = o.ix.x + 40; P.y = o.ix.y; P.vx = P.vy = 0; P.ground = true; P.safeX = P.x; P.safeY = P.y; P.kilit = 0; P.f = 1;
  D.x = o.dx; D.y = o.dy; D.vx = D.vy = 0;
  if (D.trail && D.trail.length) D.trail.length = 0;
  P.ucus = null;
  o.x = o.kx; o.y = o.ky;
  OLAY.emit('ucusBitti', o);
  if (typeof dragonHappy === 'function') { try { dragonHappy(o); } catch (e) {} }
}

// ── görsel güncelleme (her karede) ──
function ucGorsel(o, dt) {
  // ışık izi: kuyruk ucunun geçmişi
  const ucusta = o.bagli || o.faz === 'inis';
  if (o.faz !== 'bekle' && o.faz !== 'bitti') {
    const m = ucMerkez(o), s = o.olc, c = Math.cos(o.rot), si = Math.sin(o.rot);
    const tx = m.x + (UC_KUYRUK.x * c - UC_KUYRUK.y * si) * s, ty = m.y + (UC_KUYRUK.x * si + UC_KUYRUK.y * c) * s;
    if (!o.kuyruk) o.kuyruk = { x: 0, y: 0, yon: -1 };   // kuzu.js: peşteki kuzucuklar kuyruk ucunun arkasına dizilir
    o.kuyruk.x = tx; o.kuyruk.y = ty; o.kuyruk.yon = -ucDar();   // yon'un büyüklüğü = kuzucuk aralığı çarpanı (dikey ekranda sık dizilir)
    o.izT += dt;
    if (ucusta && o.izT > 1 / 40) {
      o.izT = 0;
      o.iz[o.izI * 2] = tx; o.iz[o.izI * 2 + 1] = ty; o.izI = (o.izI + 1) % UC_IZ_N; o.izN = Math.min(Math.round(UC_IZ_N * ucDar()), o.izN + 1);
    } else if (!ucusta && o.izN > 0 && o.izT > 1 / 40) { o.izT = 0; o.izN--; }
    // kanatlardan dökülen pırıltılar
    if (ucusta && Math.random() < dt * 18) {
      const a = Math.random() * 6.283;
      parca(m.x - 10 * s + Math.cos(a) * 18 * s, m.y - 14 * s + Math.sin(a) * 10 * s, -o.vx * 0.15 - 30, 20 + Math.random() * 40, 1.1, UC_RENK[(Math.random() * 7) | 0], 5 + Math.random() * 4);
    }
    if (o.halka >= 0) { o.halka += dt; if (o.halka > 1.4) o.halka = -1; }
    // ışıltı toplama
    if (ucusta) {
      const fx = P.x, fy = P.y - 30;
      for (const sp of o.isk) {
        if (sp.al) { sp.t += dt; continue; }
        if (sp.x < m.x - 160 || sp.x > m.x + 160) continue;
        const d1 = Math.hypot(sp.x - m.x, sp.y - m.y), d2 = Math.hypot(sp.x - fx, sp.y - fy);
        if (d1 < 26 * s + 18 || d2 < 52) ucTopla(o, sp);
      }
      for (const k of o.kemer) {
        if (!k.gecti && m.x > k.x && m.x - k.x < 120 && Math.abs(fy + 10 - k.y) < k.ry * 0.8) {
          k.gecti = true; k.parla = 1; o.sevT = 1.3; o.boost = 1; k.zipV = 3.5;
          ucSfx('kemer');
          for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283; parca(k.x + Math.cos(a) * k.rx, k.y + Math.sin(a) * k.ry, Math.cos(a) * 60 - 40, Math.sin(a) * 60, 1.2, UC_RENK[i % 7], 8); }
          OLAY.emit('ucusKemer', { o, k });
        }
      }
    } else for (const sp of o.isk) if (sp.al) sp.t += dt;
  }
  for (const k of o.kemer) { k.parla = Math.max(0, k.parla - dt * 0.7); k.zipV = (k.zipV || 0) + (-(k.zip || 0) * 60 - (k.zipV || 0) * 6) * dt; k.zip = (k.zip || 0) + k.zipV * dt; }
  for (const bl of o.bulut) { bl.ezV += (-bl.ez * 40 - bl.ezV * 5) * dt; bl.ez += bl.ezV * dt; }
  if (o.faz !== 'bekle' && o.faz !== 'bitti') ucVayGuncelle(o, dt, ucMerkez(o).x);
  // kuş sürüsü görünürlüğü
  if (o.kus) { const m = ucusta ? ucMerkez(o).x : -1e9, ic = m > o.kus.bas && m < o.kus.son; o.kus.a = clamp(o.kus.a + (ic ? dt * 0.6 : -dt * 0.5), 0, 1); if (ic && !o.kus.gel) { o.kus.gel = true; ucSfx('kuslar'); } }
  if (o.sevT > 0) o.sevT -= dt;
  o.flash = Math.max(0, o.flash - (o.faz === 'buyu' || o.faz === 'kucul' ? 0 : dt * 2));
}
function ucTopla(o, sp) {
  sp.al = true; sp.t = 0;
  const d = o.dizi[sp.d];
  if (o.dizSon !== sp.d) { o.dizSon = sp.d; o.sira = 0; }
  const sira = o.sira++;
  d.top++;
  ucSfx('isiltiTopla', sira);
  burst(sp.x, sp.y, 7, [sp.renk, '#ffffff'], 110, 0.8, 6);
  o.toplanan = (o.toplanan || 0) + 1;
  const tamam = d.top >= d.n;
  OLAY.emit('isilti', { o, sira, x: sp.x, y: sp.y, tamam, toplanan: o.toplanan, toplam: o.iskTop });
  if (tamam) { burst(sp.x, sp.y, 22, UC_RENK, 190, 1.3, 9); ucSfx('isiltiTamam'); o.sevT = 1.3; }
}

// ── çizim ──
function ucKemerCiz(k, tm, on) {   // ön (on) ya da arka yarım: içinden geçilen bulut halkası (arka yarı biraz gölgeli)
  const zp = clamp(k.zip || 0, -0.3, 0.3), krx = k.rx * (1 + zp * 0.5), kry = k.ry * (1 - zp * 0.25);
  const N = 26, renk = on ? k.renk : (k.arka || (k.arka = mixHex(k.renk, '#b07aa8', 0.22)));
  const sw = Math.sin(tm * 1.3 + k.ph) * 2;
  if (!on) { g.globalCompositeOperation = 'lighter'; dglow('#fff0f6', k.x, k.y, k.ry * 1.1, 0.12 + 0.3 * k.parla); g.globalCompositeOperation = 'source-over'; }
  // gövde: kalın yumuşak halka (ponponların arası boş görünmesin)
  g.save(); g.translate(k.x, k.y + sw); g.scale(1, kry / krx);
  g.strokeStyle = on ? (k.govde || (k.govde = mixHex(k.renk, '#ffffff', 0.25))) : renk; g.lineWidth = 40 * krx / kry; g.lineCap = 'round';
  g.beginPath(); if (on) g.arc(0, 0, krx, Math.PI * 0.5, Math.PI * 1.5); else g.arc(0, 0, krx, -Math.PI * 0.5, Math.PI * 0.5); g.stroke();
  g.restore();
  for (let i = 0; i < N; i++) {
    const a = i / N * 6.283 + 0.07, c = Math.cos(a);
    if ((c < 0) !== on) continue;
    const w = Math.sin(tm * 1.3 + i * 0.8 + k.ph) * 2;
    const dis = 1 + 0.12 * Math.sin(i * 1.7 + k.ph);   // ponponlar biraz dışa/içe: kabarık kenar
    const x = k.x + c * krx * dis * 1.15, y = k.y + Math.sin(a) * kry * dis + w + sw;
    const r = 27 + Math.sin(i * 2.3 + k.ph) * 4 + k.parla * 5;
    ucPonCiz(renk, x, y, r, 1, true);
  }
  if (on && k.parla > 0.01) { g.globalCompositeOperation = 'lighter'; dglow('#ffe9f4', k.x, k.y, k.ry * 1.6, 0.4 * k.parla); g.globalCompositeOperation = 'source-over'; }
}
function mixHex(a, b, t) { const A = hex(a), B = hex(b), h2 = v => Math.round(v).toString(16).padStart(2, '0'); return '#' + h2(lerp(A[0], B[0], t)) + h2(lerp(A[1], B[1], t)) + h2(lerp(A[2], B[2], t)); }
function ucBulutCiz(bl, tm) {
  const ez = clamp(bl.ez, -0.4, 0.4), sx = 1 + ez * 0.6, sy = 1 - ez * 0.5;
  const R = bl.r, y0 = bl.y + Math.sin(tm * 0.7 + bl.ph) * 6;
  g.save(); g.translate(bl.x, y0); g.scale(sx, sy);
  ucPonCiz(bl.renk, -R * 0.6, R * 0.15, R * 0.62, 0.95); ucPonCiz(bl.renk, R * 0.6, R * 0.18, R * 0.6, 0.95);
  ucPonCiz(bl.renk, -R * 0.15, -R * 0.2, R * 0.78, 0.97); ucPonCiz(bl.renk, R * 0.3, -R * 0.05, R * 0.66, 0.97);
  ucPonCiz(bl.renk, 0, R * 0.3, R * 0.7, 0.97);
  // uykulu gülen yüz (tatlı, korkutmaz)
  g.strokeStyle = 'rgba(150,90,130,0.55)'; g.lineWidth = 2.2; g.lineCap = 'round';
  g.beginPath(); g.arc(-R * 0.22, R * 0.02, 5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.beginPath(); g.arc(R * 0.18, R * 0.02, 5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.beginPath(); g.arc(-R * 0.02, R * 0.16, 5, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
  g.fillStyle = 'rgba(255,140,170,0.3)'; g.beginPath(); g.arc(-R * 0.4, R * 0.15, 7, 0, 6.283); g.arc(R * 0.36, R * 0.15, 7, 0, 6.283); g.fill();
  g.restore();
}
function ucIskCiz(o, tm, x0, x1) {
  // hâle: aydınlık gökte de seçilsin diye renkli (source-over) yumuşak ışık + küçük beyaz çekirdek ışığı
  for (const sp of o.isk) {
    if (sp.x < x0 || sp.x > x1) continue;
    if (sp.al) { if (sp.t > 0.6) continue; const u = sp.t / 0.6; dglow(sp.renk, sp.x, sp.y - u * 30, 30 + u * 50, 0.5 * (1 - u)); continue; }
    const tw = 0.8 + 0.2 * Math.sin(tm * 5 + sp.ph), y = sp.y + Math.sin(tm * 2 + sp.ph) * 4;
    dglow(sp.renk, sp.x, y, 30 * tw, 0.42);
  }
  for (const sp of o.isk) {
    if (sp.x < x0 || sp.x > x1) continue;
    if (sp.al) { if (sp.t > 0.45) continue; const u = sp.t / 0.45; ucYildiz(sp.x, sp.y - u * 30, 13 * (1 + u * 1.2), u * 2, 1 - u, '#ffffff'); continue; }
    const tw = 0.88 + 0.12 * Math.sin(tm * 5 + sp.ph), y = sp.y + Math.sin(tm * 2 + sp.ph) * 4, rot = Math.sin(tm * 1.2 + sp.ph) * 0.25;
    ucYildiz(sp.x, y, 14 * tw, rot, 1, sp.renk, sp.kenar, 0.3);
    ucYildiz(sp.x - 1.5, y - 2, 6 * tw, rot, 0.9, '#ffffff', null, 0.3);
    const p = (tm * 0.7 + sp.ph) % 3;   // ara sıra parlama
    if (p < 0.4) ucYildiz(sp.x + 6, y - 8, 7 * Math.sin(p / 0.4 * Math.PI), tm, 0.95, '#ffffff');
  }
}
function ucKuslarCiz(o, tm) {   // yanlarında uçan beyaz-pembe kuşçuklar
  const K = o.kus; if (!K || K.a <= 0.01) return;
  const m = ucMerkez(o);
  for (const k of K.list) {
    const x = m.x + k.ox + Math.sin(tm * 0.6 + k.ph) * 25 + (1 - K.a) * 260, y = m.y + k.oy + Math.sin(tm * 0.9 + k.ph) * 14 - (1 - K.a) * 120;
    const fl = Math.sin(tm * k.hz * 6.283 + k.ph), s = 11 * k.s;
    g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = K.a;
    // arka kanat
    g.fillStyle = '#f3d6e4';
    g.beginPath(); g.moveTo(-0.1, -0.2); g.quadraticCurveTo(0.2, -0.3 - fl * 1.3, 0.55, -0.35 - fl * 1.5); g.quadraticCurveTo(0.45, -0.1, 0.4, -0.05); g.fill();
    // gövde + kuyruk
    g.fillStyle = '#fffaf6'; g.strokeStyle = '#c493b6'; g.lineWidth = 0.13; g.lineJoin = 'round';
    g.beginPath(); g.ellipse(0, 0, 1.0, 0.5, -0.08, 0, 6.283); g.moveTo(-0.8, -0.05); g.lineTo(-1.45, -0.35); g.lineTo(-1.4, 0.15); g.closePath();
    g.moveTo(1.37, -0.28); g.arc(0.95, -0.28, 0.42, 0, 6.283); g.stroke(); g.fill();
    // gaga, göz, yanak
    g.fillStyle = '#ffb877'; g.beginPath(); g.moveTo(1.3, -0.33); g.lineTo(1.62, -0.22); g.lineTo(1.3, -0.12); g.fill();
    g.fillStyle = '#5a3a5a'; g.beginPath(); g.arc(1.08, -0.36, 0.085, 0, 6.283); g.fill();
    g.fillStyle = 'rgba(255,150,180,0.5)'; g.beginPath(); g.arc(1.0, -0.16, 0.12, 0, 6.283); g.fill();
    // ön kanat
    g.fillStyle = '#ffd6e6';
    g.beginPath(); g.moveTo(-0.3, -0.15); g.quadraticCurveTo(-0.1, -0.35 - fl * 1.6, 0.35 - fl * 0.1, -0.25 - fl * 1.9); g.quadraticCurveTo(0.45, -0.05, 0.35, 0.05); g.closePath(); g.stroke(); g.fill();
    g.restore();
  }
  g.globalAlpha = 1;
}
function ucIzCiz(o, tm) {
  const n = o.izN; if (n < 2) return;
  if (!UC_KURDELE) UC_KURDELE = UC_YILDIZ.map(c => mixHex(c, '#ffffff', 0.3));
  g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < n; k += 2) {
    const j = (o.izI - 1 - k + UC_IZ_N * 4) % UC_IZ_N, u = k / UC_IZ_N;
    const x = o.iz[j * 2], y = o.iz[j * 2 + 1] + Math.sin(tm * 3 + k * 0.4) * 3 * u;
    dglow(UC_RENK[(k >> 2) % 7], x, y, 26 * (1 - u * 0.5), 0.22 * (1 - u));
  }
  g.globalCompositeOperation = 'source-over';
  // gökkuşağı kurdelesi: 7 ince renkli iplik, kuyruktan uzaklaştıkça hafifçe açılır ve solar (aydınlık gökte de seçilsin diye source-over)
  g.lineCap = 'round'; g.lineJoin = 'round';
  const KS = 16;
  for (let st = 0; st < 7; st++) {
    g.strokeStyle = UC_KURDELE[st]; g.lineWidth = 3.8;
    const of = (st - 3) * 3.3;
    for (let k0 = 0; k0 < n - 1; k0 += KS) {
      const u = k0 / UC_IZ_N, k1 = Math.min(n - 1, k0 + KS);
      g.globalAlpha = 0.75 * (1 - u) * (1 - u);
      g.beginPath();
      for (let k = k0; k <= k1; k++) {
        const j = (o.izI - 1 - k + UC_IZ_N * 4) % UC_IZ_N, uu = k / UC_IZ_N, yy = o.iz[j * 2 + 1] + of * (1 + uu * 1.6) + Math.sin(tm * 3 - k * 0.35) * 4 * uu;
        if (k === k0) g.moveTo(o.iz[j * 2], yy); else g.lineTo(o.iz[j * 2], yy);
      }
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  for (let k = 3; k < n; k += 5) {   // izde göz kırpan minik yıldızlar
    const j = (o.izI - 1 - k + UC_IZ_N * 4) % UC_IZ_N, u = k / UC_IZ_N, tw = Math.sin(tm * 7 + k * 1.3);
    if (tw > 0.2) ucYildiz(o.iz[j * 2] + Math.sin(k) * 6, o.iz[j * 2 + 1] + Math.cos(k * 1.7) * 8, 6 * tw * (1 - u), tm + k, (1 - u), '#ffffff');
  }
  g.globalCompositeOperation = 'source-over';
}
const UC_RZ = [[0.45, 1.2, 0.09, 7], [1, 2, 0.15, 6], [1.8, 3.2, 0.2, 4]];   // paralaks katmanları: [hız, kalınlık, alfa, sayı]
function ucRuzgar(o, tm) {   // hızı hissettiren rüzgâr çizgileri (3 derinlik; kemerden geçince parlar ve uzar)
  const a = o.bagli ? clamp(o.vx / Math.max(o.V, 1), 0, 1.4) : 0; if (a < 0.05) return;
  const top = cam.y, h = H / S, bst = ucEase(o.boost || 0);
  g.strokeStyle = '#ffffff'; g.lineCap = 'round';
  let n0 = 0;
  for (const [hz, lw, al, n] of UC_RZ) {
    g.lineWidth = lw;
    for (let j = 0; j < n; j++) {
      const i = n0 + j, sp = hz * (0.85 + (i * 0.37) % 0.3), L = (40 + 60 * hz) * (1 + bst * 1.2);
      const x = cam.x + VW - ((tm * 620 * sp * (1 + bst * 0.6) + i * 197) % (VW + 400)) + 200, y = top + h * ((i * 0.618 + 0.05) % 1);
      g.globalAlpha = al * a * (1 + bst * 1.5) * (0.6 + 0.4 * Math.sin(i * 1.7 + tm));
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y); g.stroke();
    }
    n0 += n;
  }
  g.globalAlpha = 1;
}
const ucFzOpt = { el: { x: 0, y: 0 }, vy: 0, sevinc: undefined, aci: 0 };
function ucBinici(o, tm) {
  const pz = ucPozlar();
  const m = ucMerkez(o), s = o.olc;
  // büyük Pırıl'ın altında yumuşak ışık hâlesi
  g.globalCompositeOperation = 'lighter';
  dglow('#d8b8ff', m.x, m.y, 70 * s, 0.35); dglow('#fff0ff', m.x - 8 * s, m.y - 14 * s, 26 * s, 0.25);
  g.globalCompositeOperation = 'source-over';
  const kanatT = o.kanat / UC_KANAT_HZ;   // binek pozu: tm gerçek zamanla aynı hızda (UC_KANAT_HZ ile çırpar)
  g.save(); g.translate(m.x, m.y); g.rotate(o.rot);
  if (pz.piril) {
    try {
      if (pz.binek && s > 1.6) pirilCizPoz(g, 0, 0, s, 'binek', o.bagli || o.faz === 'inis' ? kanatT : tm);
      else pirilCizPoz(g, 0, 0, s, 'ucus', (o.bagli ? kanatT * (UC_KANAT_HZ / 3.4) : tm));
    } catch (e) { pz.piril = false; }
  }
  if (!pz.piril) { g.fillStyle = '#b48cf0'; g.beginPath(); g.ellipse(0, 0, 26 * s, 18 * s, 0, 0, 6.283); g.fill(); }
  if (o.bagli && pz.feza) {
    try {
      if (pz.binis) {
        const k = typeof pirilBinekKoltuk === 'function' && pz.binek ? pirilBinekKoltuk(kanatT, 0, s) : null;
        const sv = o.sevT > 0 ? Math.sin(clamp(1 - o.sevT / 1.3, 0, 1) * Math.PI) : undefined;
        const op = ucFzOpt; op.vy = o.vy; op.sevinc = sv; op.aci = k ? k.aci : 0;
        if (k) { op.el.x = k.elX - k.x; op.el.y = k.elY - k.y; fezaCizPoz(g, k.x, k.y, 1, 'binis', tm, null, op); }
        else { op.el.x = 17; op.el.y = -10; fezaCizPoz(g, UC_KOLTUK.x * s, UC_KOLTUK.y * s, 1, 'binis', tm, null, op); }
      } else fezaCizPoz(g, UC_KOLTUK.x * s, UC_KOLTUK.y * s + 6, 1, 'ayakta', tm);
    } catch (e) { pz.feza = false; }
  }
  g.restore();
}
function ucFezaAyri(o, tm) {   // sahne anlarında (binmeden önce / indikten sonra) Feza
  const pz = ucPozlar(); if (!pz.feza) return;
  let poz = o.fpoz;
  if (poz === 'binis' && !pz.binis) poz = 'sevinc';
  try { fezaCizPoz(g, P.x, P.y, 1, poz, tm); } catch (e) { pz.feza = false; }
}
function ucFlash(o) {
  if (o.flash > 0.01) {
    const m = ucMerkez(o);
    g.globalCompositeOperation = 'lighter';
    dglow('#fff6ff', m.x, m.y, 180 * (0.6 + o.flash * 0.6), 0.3 * o.flash);
    dglow('#c9a0ff', m.x, m.y, 380, 0.22 * o.flash);
    g.globalCompositeOperation = 'source-over';
  }
  if (o.halka >= 0) {
    const m = ucMerkez(o), u = o.halka / 1.4;
    g.strokeStyle = `rgba(255,240,255,${(0.7 * (1 - u)).toFixed(3)})`; g.lineWidth = 6 * (1 - u) + 1;
    g.beginPath(); g.arc(m.x, m.y, 30 + u * 260, 0, 6.283); g.stroke();
  }
}
function ucKapiCiz(o, tm) {   // bekleyen kapı: yerde lila ışık halkası, dönen renkli yıldızlar, yükselen pırıltılar, ışıktan kanatlar
  const x = o.kx, y = o.ky, p = 0.5 + 0.5 * Math.sin(tm * 2.2);
  g.save(); g.translate(x, y - 4); g.scale(1, 0.28); dglow('#b98cff', 0, 0, 120, 0.55); dglow('#ffffff', 0, 0, 60, 0.5); g.restore();
  dglow('#c9a0ff', x, y - 70, 120 + p * 16, 0.35);
  // ışıktan kanatlar (burada uçulacak!)
  g.save(); g.translate(x, y - 95 - p * 6);
  const fl = Math.sin(tm * 2.2) * 0.22;
  for (const sd of [-1, 1]) {
    g.save(); g.scale(sd, 1); g.rotate(-0.25 + fl);
    g.beginPath(); g.moveTo(6, 0); g.quadraticCurveTo(40, -50, 96, -44); g.quadraticCurveTo(74, -24, 82, -10); g.quadraticCurveTo(56, -8, 60, 6); g.quadraticCurveTo(32, 6, 6, 10); g.closePath();
    g.globalAlpha = 0.5 + 0.2 * p; g.fillStyle = '#e6d4ff'; g.fill();
    g.globalAlpha = 0.8; g.strokeStyle = '#a77cff'; g.lineWidth = 2.5; g.lineJoin = 'round'; g.stroke();
    g.globalAlpha = 0.6; g.strokeStyle = '#ffffff'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(14, -2); g.quadraticCurveTo(46, -30, 84, -38); g.moveTo(16, 2); g.quadraticCurveTo(44, -10, 70, -12); g.stroke();
    g.restore();
  }
  g.restore(); g.globalAlpha = 1;
  // yerde dönen renkli yıldız halkası (arka yarı önce)
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < 7; i++) {
    const a = tm * 1.2 + i / 7 * 6.283, on = Math.sin(a) > 0;
    if (on !== (pass === 1)) continue;
    ucYildiz(x + Math.cos(a) * 58, y - 14 + Math.sin(a) * 14, on ? 9 : 7, tm * 2 + i, on ? 1 : 0.7, UC_YILDIZ[i], mixHex(UC_YILDIZ[i], '#8a3f6a', 0.45), 0.3);
  }
  // yükselen pırıltılar
  for (let i = 0; i < 9; i++) {
    const u = (tm * 0.35 + i / 9) % 1, a = Math.sin(u * Math.PI);
    ucYildiz(x + Math.sin(i * 2.1 + tm * 1.3) * 40 * (1 - u * 0.5), y - 20 - u * 200, 6, tm + i, a, UC_YILDIZ[i % 7], null, 0.3);
  }
}

// parmak ipucu (yazısız): uçuşun başında hiç dokunulmadıysa ekranın sağında yukarı-aşağı kayan yumuşak bir "dokunuş" ışığı
function ucIpucu(o, tm) {
  if (o.faz !== 'ucus') { return; }
  const hedef = !o.denedi && o.t > 1.2 && o.t < 12 ? 1 : 0;
  const dtt = clamp(tm - (o.ipSon || tm), 0, 0.1); o.ipSon = tm;
  o.ipA = clamp((o.ipA || 0) + (hedef ? dtt * 1.8 : -dtt * 3), 0, 1);
  if (o.ipA <= 0.01) return;
  const vh = H / S, x = cam.x + VW * 0.8, y0 = cam.y + vh * 0.3, y1 = cam.y + vh * 0.68;
  const u = 0.5 - 0.5 * Math.cos(tm * 1.6), y = lerp(y0, y1, u), a = o.ipA;
  g.globalAlpha = 0.5 * a; g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.setLineDash([2, 12]); g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); g.setLineDash([]);
  g.globalAlpha = 0.7 * a; g.lineWidth = 4;   // uçlarda minik oklar
  g.beginPath(); g.moveTo(x - 12, y0 + 4); g.lineTo(x, y0 - 8); g.lineTo(x + 12, y0 + 4); g.moveTo(x - 12, y1 - 4); g.lineTo(x, y1 + 8); g.lineTo(x + 12, y1 - 4); g.stroke();
  g.globalAlpha = 1;
  for (let i = 3; i >= 0; i--) {   // iz
    const uu = 0.5 - 0.5 * Math.cos(tm * 1.6 - i * 0.12), yy = lerp(y0, y1, uu);
    dglow(i ? '#c9a0ff' : '#ffffff', x, yy, 34 - i * 4, (i ? 0.3 : 0.7) * a);
  }
  g.globalAlpha = 0.85 * a; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, 17 + 2.5 * Math.sin(tm * 6), 0, 6.283); g.fill();
  g.globalAlpha = 0.9 * a; g.strokeStyle = '#b98cff'; g.lineWidth = 3; g.stroke();
  g.globalAlpha = 1;
}

// inişe hazırlık: Gökkuşağı Tepesi'nde altın ışık (ekran dışındaysa sağ kenarda o yönde parlar) — "işte orada!"
function ucTepeIsik(o, tm) {
  const GK = typeof BOLUM !== 'undefined' && BOLUM && BOLUM.gokkusagi; if (!GK || !isFinite(GK.x)) return;
  const a = ucEase(o.yak) * (o.faz === 'ucus' || o.faz === 'inis' ? 1 : 0), vh = H / S;
  if (a < 0.02) return;
  const p = 0.75 + 0.25 * Math.sin(tm * 3);
  const x = Math.min(GK.x, cam.x + VW - 20), y = clamp(GK.y - 120, cam.y + 60, cam.y + vh - 80);
  dglow('#ffc23a', x, y, 190 * p, 0.55 * a); dglow('#ffe9a0', x, y, 90, 0.8 * a); dglow('#ffffff', x, y, 34, 0.9 * a);
  ucYildiz(x, y, 22 * p, tm * 0.5, a, '#ffd23a', '#c07a2a', 0.3); ucYildiz(x - 2, y - 3, 9 * p, tm * 0.5, a, '#ffffff', null, 0.3);
  for (let i = 0; i < 6; i++) { const u = (tm * 0.4 + i / 6) % 1; ucYildiz(x + Math.sin(i * 2.3 + tm) * 40, y + 60 - u * 160, 7, tm + i, Math.sin(u * Math.PI) * a, UC_YILDIZ[i % 7], null, 0.3); }
}

// görünür alan (dünya)
function ucGor() { return { x0: cam.x - 120, x1: cam.x + VW + 120 }; }

TUR.kaydet('ucusKapisi', {
  kur(o) {
    o.r = o.r || 70; o.done = false; o.faz = 'bekle'; o.t = 0;
    o.kx = o.x; o.ky = o.y;
    o.K = ucKoridor(o);
    const L = o.K.x1 - Math.min(o.x, o.K.x0);
    o.V = clamp(L / UC_SURE, 170, 380);
    o.iz = new Float32Array(UC_IZ_N * 2); o.izN = 0; o.izI = 0; o.izT = 0;
    o.olc = 1; o.rot = 0; o.flash = 0; o.halka = -1; o.kanat = 0; o.bagli = false; o.vx = 0; o.vy = 0;
    ucIcerik(o);
    o.adim = (dt, girdi) => { o.coreVar = true; ucAdim(o, dt, girdi); };   // CORE stepPlayer çağırır
    if (!UC.o) UC.o = o;
  },
  dokun(o) {
    if (o.done || o.faz !== 'bekle') return;
    if (P.fade > 0) { o.dokundu = false; return; }
    ucBasla(o);
  },
  guncelle(o, dt) {
    if (o.faz === 'bekle' || o.faz === 'bitti') { ucGorsel(o, dt); return; }
    // CORE kancası yoksa (P.ucus doluyken o.adim çağrılmadıysa) uçuşu kendimiz yürütürüz
    if (P.ucus === o) {
      if (!o.coreVar && o.adimN === o.adimOnce && ++o.bosKare > 2) { P.kilit = Math.max(P.kilit || 0, 0.1); ucAdim(o, dt, ucGirdi()); o.yedek = true; }
      o.adimOnce = o.adimN;
    }
    ucGorsel(o, dt);
    if (o.faz !== 'bekle' && o.faz !== 'bitti') {
      o.x = cam.x + VW / 2;   // nesne çizim ayıklaması (oyun.js) uçuş boyunca bizi atlamasın
      D.x = ucMerkez(o).x; D.y = ucMerkez(o).y;
    }
  },
  ciz(o, tm) {
    const v = ucGor();
    if (o.faz === 'bekle' && !o.done) ucKapiCiz(o, tm);
    if (o.vay) ucVayCiz(o, tm);
    if (o.yak > 0 && o.faz !== 'bitti') ucTepeIsik(o, tm);
    for (const k of o.kemer) if (k.x > v.x0 - 200 && k.x < v.x1 + 200) ucKemerCiz(k, tm, false);
    for (const bl of o.bulut) if (bl.x > v.x0 - 200 && bl.x < v.x1 + 200) ucBulutCiz(bl, tm);
    ucIskCiz(o, tm, v.x0, v.x1);
    if (o.faz !== 'bekle' && o.faz !== 'bitti') ucIzCiz(o, tm);
  },
  cizOn(o, tm) {
    if (o.faz === 'bekle' || o.faz === 'bitti') {
      const v = ucGor();
      for (const k of o.kemer) if (k.x > v.x0 - 200 && k.x < v.x1 + 200) ucKemerCiz(k, tm, true);
      return;
    }
    const v = ucGor();
    ucKuslarCiz(o, tm);
    ucBinici(o, tm);
    if (!o.bagli) ucFezaAyri(o, tm);   // binmeden önce / indikten sonra Feza Pırıl'ın önünde
    for (const k of o.kemer) if (k.x > v.x0 - 200 && k.x < v.x1 + 200) ucKemerCiz(k, tm, true);
    ucRuzgar(o, tm);
    ucFlash(o);
    ucIpucu(o, tm);
  },
});

// yedek girdi (CORE kancası yokken): parmağın dünya y'si, klavye ↑/↓
function ucGirdi() {
  const G = typeof GIRDI !== 'undefined' ? GIRDI : null, k = typeof keys !== 'undefined' ? keys : {};
  let hedefY = null;
  if (G && G.hedefY !== null && G.hedefY !== undefined) hedefY = cam.y + G.hedefY / (S / (DPR || 1));
  const yuk = !!(k.ArrowUp || k.KeyW || k.Space), as = !!(k.ArrowDown || k.KeyS);
  return { eksenY: (as ? 1 : 0) - (yuk ? 1 : 0), eksenX: (k.ArrowRight || k.KeyD ? 1 : 0) - (k.ArrowLeft || k.KeyA ? 1 : 0), basili: hedefY !== null, hedefY };
}

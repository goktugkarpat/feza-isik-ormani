/* sekil.js – Bölüm 3 mini oyunu "Bulutlarda ne var?" (MINI3). Sözleşme: src/BOLUM3.md (## MINI3 notları).
   LEVEL3 iki yere koyar: nesne('bulutSekil', c, y, {sira: 0|1}) (y = zemin). Zeminin üstünde (≈230 birim yukarıda) şekilsiz, kabarık, büyük bir bulut
   süzülür; içinde "biri saklanıyor" (sıcak ışık nabzı, ara sıra iki göz kırpıp kaybolur). Feza yaklaşınca Pırıl bulutun yanına gelir
   (p_b_sekil1), el ipucu bulutu ovmayı gösterir (yazı yok). Feza bulutu parmağıyla ovar/dokunur (klavye: zıplama tuşu): her dokunuş bulutu biraz
   şekillendirir (kabarık daireler hayvan siluetine yumuşakça kayar), ışıltı + "pof". Yanlış yok. ≈8 dokunuş ya da kısa bir ovma → bulut CANLANIR
   (tavşan zıplar · balina gökkuşağı fışkırtır · fil hortumuyla yağmur yağdırır, altında çiçekler açar · kuş kanat çırpar · ayıcık el sallar),
   sonra gökyüzünde süzülerek uzaklaşır; yerine yeni şekilsiz bulut gelir. Her yerde 2 hayvan; 2. yerin sonunda sürpriz: bulut FEZA olur (p_b_sekil3).
   Sıra her açılışta karışır. Takılırsa (≈12 sn) Pırıl da ovmaya yardım eder, bulut kendiliğinden tamamlanır (≈20 sn). Feza yürüyüp giderse
   o anki bulut kendi kendine hayvana dönüşüp uçar, etkinlik biter. Bir kez oynanır.
   Ses: AU.sfx('sekilOv', 0..1 ilerleme), ('sekilCanlan', hayvan no: SKL_HAYVAN sırası), ('sekilBitti'); OLAY 'sekil' {o, hayvan (ad), i}.
   Pırıl: piril.js'te 'sekil' modu yoksa takim.js'in 'takim' modu (D.tkO = vekil nokta) kullanılır.
   Önek: skl* (sk* sarki.js'te dolu). */
'use strict';
const SKL_HAYVAN = ['tavsan', 'balina', 'fil', 'kus', 'ayicik', 'kalp', 'yildiz', 'feza'];
const SKL_N = 26;          // bulut başına kabarık daire sayısı (morf için sabit)
const SKL_R = 108;         // bulut yarıçapı (dünya birimi; birim şekil uzayında 1)
const SKL_YUK = 198;       // bulut merkezinin zeminden yüksekliği
// renkler: [gövde, gölge (alt), parlak (tepe), kenar ışığı (güneş, sağ üst)]
const SKL_RENK = {
  sekilsiz: ['#ffe5ec', '#d6a6cf', '#fffaf5', '#ffcf8c'],
  tavsan: ['#ffe2ee', '#df9fc6', '#fff9fc', '#ffcf94'],
  balina: ['#e2e6ff', '#a3a2dc', '#fafbff', '#ffd59e'],
  fil: ['#ebe0ff', '#b09ad8', '#fdfaff', '#ffd08e'],
  kus: ['#ffeedb', '#e5ac98', '#fffbf3', '#ffc47a'],
  ayicik: ['#ffeed6', '#ddae8c', '#fffaf1', '#ffc47a'],
  kalp: ['#ffe2ee', '#e098be', '#fff9fc', '#ff9ac0'],
  yildiz: ['#fff4d2', '#ddb258', '#fffdf5', '#ffd766'],
  feza: ['#fff0e6', '#e3aeb0', '#fffbf7', '#ffcf8c'],
};
const SKL_GOK = ['#ff8a8a', '#ffb870', '#ffe07a', '#9be59a', '#8cc8ff', '#b59cff'];   // gökkuşağı bantları (pastel)
const SKL_CICEK = ['#ff9ec4', '#ffd36e', '#b9a2ff', '#8fd8ff', '#ffa98a'];
const SKL = { sira: null, soz1: false, soz2: false, soz3: false, akt: null, ptr: -1, ptrO: null, pxSon: 0, pySon: 0 };
function sklListe(sira) {   // oturumda bir kez karışır: 1. yer 2 hayvan, 2. yer 2 hayvan + sürpriz (Feza)
  if (!SKL.sira) {
    const kar = x => { for (let i = x.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; const q = x[i]; x[i] = x[j]; x[j] = q; } return x; };
    const gos = kar(['balina', 'fil']), dig = kar(['tavsan', 'kus', 'ayicik', 'kalp', 'yildiz']);   // her yerde bir "gösterili" hayvan (gökkuşağı / çiçek)
    const a = kar([gos[0], dig[0]]).concat(kar([gos[1], dig[1]]));
    SKL.sira = a;
  }
  return sira ? [SKL.sira[2], SKL.sira[3], 'feza'] : [SKL.sira[0], SKL.sira[1]];
}
function sklSoz(k, onc) { if (typeof SES !== 'undefined' && SES && SES.soyle) { try { SES.soyle(k, { oncelik: onc || 2 }); } catch (e) {} } }
function sklSfx(ad, v) { if (typeof AU !== 'undefined' && AU && typeof AU.sfx === 'function') { try { AU.sfx(ad, v); } catch (e) {} } }
const sklPx = (wx, wy) => ({ x: (wx - cam.x) * S / DPR, y: (wy - cam.y) * S / DPR });   // dünya → CSS px
const sklYeni = () => { const a = []; for (let i = 0; i < SKL_N; i++) a.push({ x: 0, y: 0, r: 0 }); a.yx = 0; a.yy = 0; a.ys = 1; a.yon = 0; a.fx = 0; a.fy = 0; a.kv = new Float32Array(12); a.kvN = 0; a.rot = 0; a.mutlu = 0; return a; };
const SKL_POZ = sklYeni(), SKL_CIZ = sklYeni();

// ═══════════ hayvan pozları (birim uzay: bulut merkezi 0,0; y aşağı; ≈ x∈[-1.4,1.4], y∈[-1.4,0.95]) ═══════════
let sklK = 0, sklOut = null;
function sklC(x, y, r) { if (sklK >= SKL_N) return; const q = sklOut[sklK++]; q.x = x; q.y = y; q.r = r; }
function sklKv(i, a0, a1) { const o = sklOut; if (o.kvN >= 4) return; o.kv[o.kvN * 3] = i; o.kv[o.kvN * 3 + 1] = a0; o.kv[o.kvN * 3 + 2] = a1; o.kvN++; }   // iç kıvrım çizgisi (kulak, but)
function sklZincir(bx, by, ang, egri, n, uz, r0, r1) {   // tabandan açıyla uzanan, kıvrılan daire zinciri (kulak, hortum, kanat, kol)
  let x = bx, y = by, a = ang; const ad = uz / n;
  for (let i = 0; i < n; i++) { a += egri / n; x += Math.cos(a) * ad; y += Math.sin(a) * ad; sklC(x, y, lerp(r0, r1, (i + 1) / n)); }
  return a;
}
function sklPoz(ad, t, a, out) {
  sklK = 0; sklOut = out;
  let rot = 0, pvx = 0, pvy = 0.85, dx = 0, dy = 0, sx = 1, sy = 1;
  out.yx = 0; out.yy = 0; out.ys = 1; out.yon = 0; out.fx = 0; out.fy = 0; out.kvN = 0; out.mutlu = 0;
  const ga = a * smooth(clamp(t / 0.5, 0, 1));   // canlanmanın ilk yarım saniyesi yumuşak giriş
  if (ad === 'tavsan') {
    const hz = t < 3.9 ? Math.max(0, Math.sin(t * 3.3 - 0.4)) : 0, hop = ga * hz;
    const kul = ga * 0.26 * Math.sin(t * 8.5);
    sklC(-0.08, 0.22, 0.6); sklC(0.3, 0.12, 0.42); sklC(-0.5, 0.32, 0.42); sklC(0.08, 0.5, 0.4);
    sklC(0.56, -0.36, 0.4); sklC(0.83, -0.25, 0.24); sklC(0.4, -0.18, 0.28); sklKv(2, -0.9, 1.0);
    sklZincir(0.44, -0.66, -1.78 - kul, -0.3, 3, 0.66, 0.17, 0.13);
    sklZincir(0.68, -0.66, -1.36 + kul * 0.8, 0.3, 3, 0.62, 0.17, 0.13);
    sklC(-0.96, 0.2, 0.2); sklC(0.38, 0.76 + hop * 0.12, 0.19); sklC(-0.22, 0.8 + hop * 0.08, 0.21);
    out.yx = 0.64; out.yy = -0.38; out.ys = 0.8; out.yon = 1; out.mutlu = hop > 0.25 ? 1 : 0;
    dy = -hop * 0.45; rot = -hop * 0.14;
    const in0 = ga * Math.max(0, -Math.sin(t * 3.3 - 0.4)) * (t < 3.9 ? 1 : 0); sx = 1 + in0 * 0.08; sy = 1 - in0 * 0.08;   // inişte basılma
  } else if (ad === 'balina') {
    const kq = ga * 0.38 * Math.sin(t * 3.4);
    sklC(0.05, 0.0, 0.62); sklC(0.55, 0.05, 0.55); sklC(-0.45, 0.06, 0.5); sklC(0.3, 0.36, 0.42); sklC(-0.2, 0.36, 0.42);
    sklC(0.95, 0.13, 0.38); sklC(0.66, 0.36, 0.32); sklC(-0.85, 0.02, 0.34);
    const ka = sklZincir(-1.0, -0.02, -2.75 + kq, 0.35, 2, 0.42, 0.22, 0.16);
    const q = sklOut[sklK - 1], nx2 = Math.cos(ka + 1.57), ny2 = Math.sin(ka + 1.57);
    sklC(q.x + Math.cos(ka) * 0.16 + nx2 * 0.17, q.y + Math.sin(ka) * 0.16 + ny2 * 0.17, 0.16);
    sklC(q.x + Math.cos(ka) * 0.16 - nx2 * 0.17, q.y + Math.sin(ka) * 0.16 - ny2 * 0.17, 0.16);
    sklC(0.12 + ga * 0.05 * Math.sin(t * 4), 0.62, 0.17); sklKv(sklK - 1, -2.6, -0.5);
    out.yx = 0.86; out.yy = -0.02; out.ys = 0.78; out.yon = 1; out.fx = 0.5; out.fy = -0.6; out.mutlu = a > 0 && t > 0.8 && t < 3.8 ? 1 : 0;
    dy = ga * Math.sin(t * 2.0) * 0.07; rot = ga * Math.sin(t * 1.6) * 0.05;
  } else if (ad === 'fil') {
    const kalk = ga * smooth(clamp((t - 0.3) / 0.9, 0, 1)) * (t < 4.2 ? 1 : smooth(clamp(1 - (t - 4.2) / 0.8, 0, 1)));
    const kq = ga * 0.1 * Math.sin(t * 5.5);
    sklC(-0.1, 0.15, 0.62); sklC(0.3, 0.1, 0.46); sklC(-0.52, 0.22, 0.45); sklC(0.0, 0.42, 0.45);
    sklC(0.68, -0.28, 0.44); sklC(0.42 - kq * 0.4, -0.2 - kq * 0.3, 0.4 + kq); sklKv(5, -1.3, 2.3);
    sklZincir(1.02, -0.14, lerp(1.25, -0.45, kalk), lerp(0.55, -1.5, kalk), 5, 0.78, 0.17, 0.1);
    const u = sklOut[sklK - 1]; out.fx = u.x; out.fy = u.y;
    sklC(-0.48, 0.75, 0.2); sklC(-0.08, 0.78, 0.2); sklC(0.34, 0.75, 0.2); sklC(-1.08, 0.12, 0.1);
    out.yx = 0.74; out.yy = -0.36; out.ys = 0.78; out.yon = 1; out.mutlu = a > 0 && t > 1.1 && t < 3.9 ? 1 : 0;
    rot = ga * Math.sin(t * 2.4) * 0.03; dy = -ga * 0.04 * Math.abs(Math.sin(t * 2.4));
  } else if (ad === 'kus') {
    const cir = Math.sin(t * 9), kn = -2.85 + ga * 0.75 * cir;   // kanat: sırtta yatık (tüy gibi uzun kuyruk/boyun değil); çırparken yukarı kalkar
    sklC(0.0, 0.2, 0.56); sklC(-0.36, 0.26, 0.4); sklC(0.3, 0.28, 0.38); sklC(0.4, -0.42, 0.34); sklC(0.2, -0.16, 0.3);   // yuvarlak gövde + daha küçük, yüksek ve net kafa
    sklC(-0.88, 0.02, 0.22); sklC(-1.04, -0.16, 0.17); sklC(-1.06, 0.2, 0.17);   // kısa, kabarık kuyruk tutamı (yelpaze)
    sklZincir(0.0, -0.02, kn, -0.2 + ga * 0.3 * cir, 4, 0.44, 0.26, 0.15);   // kanat: dinlenirken gövdenin içinde yatar, çırparken yukarı kalkar
    sklC(0.05, 0.72, 0.1); sklC(0.25, 0.72, 0.1);
    out.yx = 0.48; out.yy = -0.44; out.ys = 0.7; out.yon = 1; out.mutlu = a > 0 && t > 0.6 && Math.sin(t * 1.7) > 0.2 ? 1 : 0;
    dy = -ga * (0.12 + 0.1 * Math.sin(t * 2.2)); rot = ga * 0.06 * Math.sin(t * 2.2);
  } else if (ad === 'ayicik') {
    const sall = ga * smooth(clamp(t / 0.6, 0, 1));
    const kol = lerp(0.95, -1.05 + 0.5 * Math.sin(t * 7), sall);
    sklC(0, 0.2, 0.52); sklC(0, 0.48, 0.44); sklC(-0.26, 0.3, 0.35); sklC(0.26, 0.3, 0.35);
    sklC(0, -0.52, 0.46); sklC(0, -0.36, 0.2); sklC(-0.36, -0.9, 0.18); sklC(0.36, -0.9, 0.18);
    sklZincir(-0.42, -0.02, 2.2, 0.2, 2, 0.46, 0.2, 0.18);
    sklZincir(0.42, -0.02, kol, -0.25 * sall, 2, 0.46, 0.2, 0.18);
    sklC(-0.3, 0.82, 0.22); sklC(0.3, 0.82, 0.22);
    out.yx = 0; out.yy = -0.58; out.ys = 0.9; out.yon = 0; out.mutlu = a > 0 && t > 2.4 ? 1 : 0;
    rot = ga * 0.09 * Math.sin(t * 2.4); dy = -ga * 0.05 * Math.abs(Math.sin(t * 4.8));
  } else if (ad === 'kalp') {
    const cir = Math.sin(t * 9.5), kn = -2.4 + ga * 0.7 * cir;
    // Kalp ana kütlesi (üst iki yuvarlak lob + alt koni)
    sklC(-0.35, -0.32, 0.44); sklC(0.35, -0.32, 0.44); sklC(0, -0.05, 0.52);
    sklC(-0.25, 0.35, 0.38); sklC(0.25, 0.35, 0.38); sklC(0, 0.68, 0.28); sklC(0, 0.92, 0.16);
    // İki tatlı bulut kanadı (canlandığında kanat çırpar)
    sklZincir(-0.48, -0.15, kn - 0.2, -0.3, 3, 0.52, 0.22, 0.13);
    sklZincir(0.48, -0.15, -Math.PI - kn + 0.2, 0.3, 3, 0.52, 0.22, 0.13);
    out.yx = 0; out.yy = -0.05; out.ys = 0.85; out.yon = 0; out.mutlu = 1;
    // Kalp atışı ve kanat salınımı
    const nabiz = ga * Math.sin(t * 8) * 0.06;
    dy = -ga * (0.12 + 0.08 * Math.sin(t * 3)); rot = ga * 0.06 * Math.sin(t * 2.5);
    sx = 1 + nabiz; sy = 1 - nabiz;
  } else if (ad === 'yildiz') {
    const cir = Math.sin(t * 10), kn = -2.6 + ga * 0.65 * cir;
    // Tombul 5 köşeli bulut yıldızı
    sklC(0, 0, 0.52);
    sklC(0, -0.82, 0.32); sklC(0.78, -0.26, 0.32); sklC(-0.78, -0.26, 0.32);
    sklC(0.48, 0.66, 0.32); sklC(-0.48, 0.66, 0.32);
    // İki minik peri bulut kanadı
    sklZincir(-0.52, 0.05, kn, -0.2, 3, 0.46, 0.2, 0.12);
    sklZincir(0.52, 0.05, -Math.PI - kn, 0.2, 3, 0.46, 0.2, 0.12);
    out.yx = 0; out.yy = -0.02; out.ys = 0.82; out.yon = 0; out.mutlu = 1;
    dy = -ga * (0.14 + 0.09 * Math.sin(t * 3.2)); rot = ga * 0.08 * Math.sin(t * 2);
    const tw = ga * Math.sin(t * 6) * 0.05; sx = 1 + tw; sy = 1 - tw;
  } else {   // 'feza' (sürpriz): kocaman kafa, kabarık saç, iki kolla el sallar
    const w = ga * smooth(clamp(t / 0.6, 0, 1)), z = ga * Math.abs(Math.sin(t * 3.4));
    sklC(0, -0.56, 0.44); sklC(0, 0.12, 0.36); sklC(0, 0.38, 0.34);
    sklC(-0.32, -0.9, 0.2); sklC(0, -1.0, 0.22); sklC(0.32, -0.9, 0.2); sklC(0.47, -0.66, 0.15); sklC(-0.47, -0.66, 0.15); sklC(0.16, -1.04, 0.16);
    sklZincir(-0.3, -0.04, lerp(2.3, -2.2 - 0.4 * Math.sin(t * 7), w), 0, 2, 0.5, 0.15, 0.14);
    sklZincir(0.3, -0.04, lerp(0.85, -0.95 + 0.4 * Math.sin(t * 7 + 1), w), 0, 2, 0.5, 0.15, 0.14);
    sklC(-0.17, 0.74, 0.17); sklC(0.17, 0.74, 0.17);
    out.yx = 0; out.yy = -0.52; out.ys = 0.9; out.yon = 0; out.mutlu = a > 0 && ((t > 0.3 && t < 1.7) || t > 3.3) ? 1 : 0;
    dy = -z * 0.18; sx = 1 + (1 - z) * 0.03 * ga; sy = 1 - (1 - z) * 0.03 * ga;
  }
  // boş kalanlar: büyük gövde dairelerinin içine dolgu (silueti değiştirmez, morfta "kabarıklık" katar)
  const k = Math.max(1, sklK);
  for (let i = sklK; i < SKL_N; i++) { const s = out[(i - k) % Math.min(k, 6)], q = out[i], f = 0.22 + 0.1 * ((i * 7) % 3); q.x = s.x + Math.cos(i * 2.4) * s.r * f; q.y = s.y + Math.sin(i * 2.4) * s.r * f; q.r = s.r * 0.66; }
  // genel dönüşüm (zıplama, salınma, basılma) alt noktaya göre
  const c = Math.cos(rot), sn = Math.sin(rot), rk = Math.sqrt(sx * sy);
  const tr = (x, y) => { const X = (x - pvx) * sx, Y = (y - pvy) * sy; return [X * c - Y * sn + pvx + dx, X * sn + Y * c + pvy + dy]; };
  for (let i = 0; i < SKL_N; i++) { const q = out[i], p = tr(q.x, q.y); q.x = p[0]; q.y = p[1]; q.r *= rk; }
  let p = tr(out.yx, out.yy); out.yx = p[0]; out.yy = p[1];
  p = tr(out.fx, out.fy); out.fx = p[0]; out.fy = p[1];
  out.rot = rot;
  return out;
}

// ═══════════ nesne ═══════════
TUR.kaydet('bulutSekil', {
  kur(o) {
    const k = o.skl = { durum: 'bekle', t: 0, liste: sklListe(o.sira | 0), i: 0, p: 0, pv: 0, pvV: 0, bosT: 0, topT: 0, terk: false,
      gor: 1, b: [], d: [], j: [], jv: [], pk: [], pof: [], damla: [], cicek: [], ucan: [], halka: [], kikir: 0, onceH: 0, ph: Math.random() * 6.283, sonPof: 0, sfxT: 0,
      gozT: 2 + Math.random() * 2, goz: null, el: 0, dkT: 0, pr: { x: o.x, y: o.y }, canT: 0, vur: 0, cx: o.x, cy: o.y - SKL_YUK, bitti: false, kutT: 0, gokA: 0 };
    for (let i = 0; i < SKL_N; i++) { k.b.push({ x: 0, y: 0, r: 0 }); k.d.push(0); k.j.push(0); k.jv.push(0); }
    sklBlob(o);
  },
  guncelle(o, dt) { sklGuncelle(o, dt); },
  ciz(o, tm) { sklCiz(o, tm); },
  cizOn(o, tm) { sklCizOn(o, tm); },
});
function sklHayvan(o) { const k = o.skl; return k.liste[Math.min(k.i, k.liste.length - 1)]; }
function sklBlob(o) {   // yeni şekilsiz bulut: hedef hayvanın silueti yatay bir kümülüse sıkıştırılır + gürültü (morf kesişmesin, pürüzsüz)
  const k = o.skl; sklPoz(sklHayvan(o), 0, 0, SKL_POZ);
  for (let i = 0; i < SKL_N; i++) {
    const q = SKL_POZ[i], b = k.b[i];
    let x = q.x * 0.74 + (Math.random() - 0.5) * 0.3, y = q.y * 0.36 - 0.02 + (Math.random() - 0.5) * 0.16;
    const e = Math.hypot(x / 1.02, y / 0.46); if (e > 1) { x /= e; y /= e; }
    b.x = x; b.y = Math.min(y, 0.24); b.r = lerp(q.r, 0.42, 0.55) * (0.8 + Math.random() * 0.4) * (y < -0.2 ? 0.9 : 1);
    k.d[i] = Math.random(); k.j[i] = 0; k.jv[i] = 0;
  }
  k.p = 0; k.pv = 0; k.pvV = 0; k.bosT = 0; k.topT = 0; k.sonPof = 0;
}
function sklDur(o, d) { o.skl.durum = d; o.skl.t = 0; }
function sklAktifMi(k) { return k.durum === 'ov' || k.durum === 'yeni' || k.durum === 'canlan' || k.durum === 'ara'; }

// ── Pırıl ──
function sklPirilVar() { return typeof DR_SEKIL !== 'undefined' && DR_SEKIL; }   // piril.js ileride kendi 'sekil' dalını eklerse (D.sklO, sklPirilYer)
function sklPirilYer(o) {   // Pırıl'ın duracağı yer (bulutun solunda, bulutla aynı hizada); yardımda bulutun kenarında ovar gibi salınır
  const k = o.skl, yard = k.durum === 'ov' && k.topT > 12 && !k.terk;
  if (k.durum === 'canlan' || k.durum === 'ara') {   // canlandı: hayvanın önüne geçmeden, sol yanda sevinçle hoplar
    const zp = k.durum === 'canlan' && k.t < 3 ? Math.abs(Math.sin(k.t * 6.5)) * 0.32 : 0;
    return { x: k.cx - SKL_R * 1.85, y: k.cy + SKL_R * (0.2 - zp), bakX: k.cx, bakY: k.cy - SKL_R * 0.3 };
  }
  return { x: k.cx - SKL_R * (yard ? 1.12 + 0.18 * Math.sin(k.t * 3.2) : 1.55), y: k.cy + SKL_R * (yard ? -0.1 + 0.25 * Math.cos(k.t * 3.2) : 0.12), bakX: k.cx, bakY: k.cy };
}
function sklPirilAl(o) {
  const k = o.skl;
  if (sklPirilVar()) { if (D.mode !== 'sekil') drMode('sekil'); D.sklO = o; return; }
  if (D.mode === 'takim' && D.tkO === k.pr) return;
  const uygun = D.mode === 'follow' || D.mode === 'orbit' || D.mode === 'yol' || D.mode === 'ilgi' || D.mode === 'oyna' || D.mode === 'merak' || D.mode === 'sevin' || D.mode === 'happy' || D.mode === 'yay';
  if (!uygun || typeof drMode !== 'function' || typeof tkPirilYer !== 'function') return;
  D.tkO = k.pr; D.tkVur = 0; D.tkKut = false; drMode('takim');
}
function sklPirilBirak(o) {
  const k = o.skl;
  if (sklPirilVar()) { if (D.mode === 'sekil' && D.sklO === o) drMode('follow'); if (D.sklO === o) { D.sklO = null; D.sklKut = false; } return; }
  if (D.tkO === k.pr) { D.tkKut = false; if (D.mode === 'takim') drMode('follow'); D.tkO = null; }
}
function sklVekil(o) {   // 'takim' dalı Pırıl'ı (tkO.x-40, tkO.y-150) noktasına götürür
  const y = sklPirilYer(o); o.skl.pr.x = y.x + 40; o.skl.pr.y = y.y + 150;
}
function sklBirak(o) {
  sklPirilBirak(o);
  if (SKL.akt === o) SKL.akt = null;
  if (typeof skAktif !== 'undefined' && skAktif === o) skAktif = null;
  if (SKL.ptrO === o) { SKL.ptr = -1; SKL.ptrO = null; }
}

// ── güncelleme ──
function sklGuncelle(o, dt) {
  const k = o.skl, oyun = DURUM === 'oyun' && !(P.fade > 0);
  k.t += dt; k.ph += dt;
  k.cx = o.x + SKL_R * 0.25; k.cy = o.y - SKL_YUK + Math.sin(k.ph * 0.9) * 5;
  const dx = Math.abs(P.x - o.x), dy = Math.abs(P.y - o.y);
  // ilerleme yayı (pürüzsüz morf; geri gitmez)
  const hedef = k.p;
  k.pvV += ((hedef - k.pv) * 60 - k.pvV * 13) * dt; k.pv += k.pvV * dt; if (k.pv > hedef) { k.pv = hedef; k.pvV = Math.min(k.pvV, 0); } k.pv = clamp(k.pv, 0, 1);
  for (let i = 0; i < SKL_N; i++) { k.jv[i] += (-k.j[i] * 170 - k.jv[i] * 9) * dt; k.j[i] += k.jv[i] * dt; }
  k.vur = Math.max(0, k.vur - dt * 2.5);
  sklParcaGuncelle(o, dt);
  for (let i = k.ucan.length - 1; i >= 0; i--) {
    const u = k.ucan[i];
    u.sure = (u.sure || 0) + dt;
    u.t += dt;
    u.u += dt / 7.5;
    if (u.sure < 1.3) {
      // 1. Aşama: Feza'ya veda selamı (tatlı el sallama, hafifçe yükselip süzülme)
      const sT = u.sure / 1.3;
      u.x += Math.sin(u.sure * 3.5) * 12 * dt;
      u.y -= (22 + 16 * sT) * dt;
      u.rot = Math.sin(u.sure * 7.5) * 0.14;   // neşeyle sağa sola sallanarak selam verir
      u.sx = 1 + Math.sin(u.sure * 15) * 0.05;
      u.sy = 1 - Math.sin(u.sure * 15) * 0.05;
      if (Math.random() < dt * 9 && k.pk.length < 150) {
        k.pk.push({ x: u.x + (Math.random() - 0.5) * 36, y: u.y - 12, vx: (Math.random() - 0.5) * 35, vy: -45 - Math.random() * 25, l: 0.8, m: 0.8, c: '#ffd56a', r: 3, tip: Math.random() < 0.5 ? 'yildiz' : 'kalp' });
      }
    } else if (u.sure < 2.5) {
      // 2. Aşama: Akrobatik 360° takla (tam bir artistik somersault ve altın konfeti patlaması)
      const ft = (u.sure - 1.3) / 1.2;
      u.y -= (70 * Math.sin(ft * Math.PI) + 25) * dt;
      u.x += (40 + 20 * ft) * dt;
      u.rot = -Math.PI * 2 * smooth(ft);   // akrobatik geriye 360° tam takla
      const sq = Math.sin(ft * Math.PI);
      u.sx = 1 + 0.22 * sq;
      u.sy = 1 - 0.16 * sq;
      if (ft >= 0.48 && !u.taklaBurst) {
        u.taklaBurst = true;
        k.halka.push({ x: u.x, y: u.y, l: 0.55, l0: 0.55, b: 3.2 });
        for (let q = 0; q < 18; q++) {
          const ang = q * (Math.PI * 2 / 18), sp = 90 + Math.random() * 70;
          k.pk.push({ x: u.x, y: u.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 25, l: 0.85, m: 0.85, c: SKL_GOK[q % 6], r: 3 + Math.random() * 2.5, tip: q % 2 === 0 ? 'yildiz' : null });
        }
      }
    } else {
      // 3. Aşama: Gökyüzünde süzülüş (doğrulur, yıldız tozu ve yumuşak bulut buharı bırakarak uzaklaşır)
      u.rot = lerp(u.rot || 0, 0, dt * 6);
      u.sx = lerp(u.sx || 1, 1, dt * 6);
      u.sy = lerp(u.sy || 1, 1, dt * 6);
      const hz = 1 + 1.6 * Math.max(0, 1 - u.u * 4);
      u.x += (48 + 35 * u.u) * hz * dt + Math.cos(u.t * 2.4) * 18 * dt;
      u.y -= (55 + 65 * u.u) * hz * dt;
      if (Math.random() < dt * 18 && k.pk.length < 150) {
        const tip = Math.random() < 0.45 ? 'yildiz' : (u.ad === 'kalp' && Math.random() < 0.5 ? 'kalp' : null);
        k.pk.push({ x: u.x + (Math.random() - 0.5) * 28, y: u.y + (Math.random() - 0.5) * 20, vx: -25 - Math.random() * 25, vy: 15 + Math.random() * 20, l: 0.7, m: 0.7, c: '#fff6c2', r: 2.5 + Math.random() * 2, tip });
      }
    }
    if (u.u >= 1) k.ucan.splice(i, 1);
  }
  // gizlenen göz (yalnız şekilsizken): "biri saklanıyor"
  if (k.pv < 0.45 && (k.durum === 'bekle' || k.durum === 'ov')) {
    if (k.goz) { k.goz.t += dt; if (k.goz.t > 1.6) k.goz = null; }
    else if ((k.gozT -= dt) <= 0) { k.gozT = 3 + Math.random() * 3; const q = k.b[(Math.random() * SKL_N) | 0]; k.goz = { x: clamp(q.x, -0.6, 0.6), y: clamp(q.y, -0.25, 0.15), t: 0 }; }
  } else k.goz = null;
  if (!oyun) return;
  const aktif = sklAktifMi(k);
  if (aktif && !k.terk && SKL.akt !== o) SKL.akt = o;
  // Feza yürüyüp gitti: o anki bulut kendi kendine hayvana dönüşüp uçar, etkinlik biter
  if (aktif && !k.terk && (dx > 520 || dy > 420)) { k.terk = true; sklPirilBirak(o); if (SKL.akt === o) SKL.akt = null; if (typeof skAktif !== 'undefined' && skAktif === o) skAktif = null; if (SKL.ptrO === o) { SKL.ptr = -1; SKL.ptrO = null; } }
  if (k.durum === 'bekle') {
    if (!k.bitti && dx < 210 && dy < 120 && P.ground && !SKL.akt) {
      SKL.akt = o; if (typeof skAktif !== 'undefined') skAktif = o;
      sklDur(o, 'ov'); k.ilk = true; P.kilit = Math.max(P.kilit || 0, 1.3);
      if (!SKL.soz1) { SKL.soz1 = true; sklSoz('p_b_sekil1'); k.elBek = 2.4; } else k.elBek = 1.4;
      sklPirilAl(o);
    }
    return;
  }
  if (k.durum === 'bitti') return;
  if (!k.terk) {
    sklVekil(o);
    if (sklPirilVar() ? D.mode !== 'sekil' : D.mode !== 'takim') sklPirilAl(o);
    if ((k.dkT -= dt) <= 0 && typeof omDikkat === 'function') {
      k.dkT = 0.4;
      omDikkat('sekil', 1.0, () => { omDkEkle(k.cx - SKL_R * 1.6, k.cy - SKL_R * (k.gokA > 0.05 ? 2.0 : 1.45), k.cx + SKL_R * (k.gokA > 0.05 ? 2.2 : 1.5), o.y + 10); }, 0.8, 0.8);
    }
  }
  if (k.durum === 'ov') {
    k.topT += dt; k.bosT += dt;
    if (k.terk) k.p = Math.min(1, k.p + dt * 0.9);
    else if (k.topT > 12) {   // takıldı: Pırıl ovmaya yardım eder (≈20 sn'de tamam)
      const once = k.p; k.p = Math.min(1, k.p + dt * 0.125);
      if (Math.floor(once * 10) !== Math.floor(k.p * 10)) { sklOvEtki(o, -0.85 + Math.random() * 0.3, -0.1 + Math.random() * 0.3, 0.6); if (!sklPirilVar()) D.tkVur = 0.28; }
    }
    if (!SKL.soz2 && !k.terk && k.p >= 0.5) { SKL.soz2 = true; sklSoz('p_b_sekil2'); }   // ilk bulutun yarısında: "Bak bak, bir şey çıkıyor!"
    if (k.p >= 1 && k.pv > 0.985) { k.pv = 1; sklCanlan(o); }
  } else if (k.durum === 'canlan') {
    sklCanliGuncelle(o, dt);
    if (!k.terk && !sklPirilVar() && k.t < 2.6 && (k.t % 0.55) < dt) D.tkVur = 0.3;   // (yedek 'takim' modu) Pırıl yanında sevinçle zıplar
    if (!k.terk && k.t < 2.6 && D.mode === 'sekil' && typeof drFx === 'function' && Math.floor((k.t - dt) / 0.32) !== Math.floor(k.t / 0.32)) { try { drFx(D.x, D.y - 6, Math.random() < 0.6 ? 'heart' : 'star'); } catch (e) {} }   // Pırıl sevinçten kalp saçar
    const sure = k.terk ? 3.0 : (sklHayvan(o) === 'feza' ? 5.6 : 5.0);
    if (k.t > sure) sklUcur(o);
  } else if (k.durum === 'ara') {
    if (k.t > 1.7) { if (k.terk || k.i >= k.liste.length) sklBitir(o); else { sklBlob(o); k.gor = 0; sklDur(o, 'yeni'); } }
  } else if (k.durum === 'yeni') {
    k.gor = Math.min(1, k.t / 1.1);
    if (k.t > 1.1) { k.gor = 1; sklDur(o, 'ov'); k.elBek = 2.6; k.ilk = false; }
  }
}
function sklCanlan(o) {
  const k = o.skl, ad = sklHayvan(o);
  sklDur(o, 'canlan'); k.canT = 0;
  sklSfx('sekilCanlan', SKL_HAYVAN.indexOf(ad));
  if (!k.terk) OLAY.emit('sekil', { o, hayvan: ad, i: k.i });   // Feza gittiyse (kendiliğinden dönüşüm) olay yok: ses.js "Buldun!" demesin
  for (let i = 0; i < SKL_N; i++) k.jv[i] += 2.6 + k.d[i] * 1.5;   // bütün kabarıklar sevinçle titrer
  k.halka.push({ x: k.cx, y: k.cy, l: 0.5, l0: 0.5, b: 3 }, { x: k.cx, y: k.cy, l: 0.75, l0: 0.75, b: 4 });   // büyük ışık halkaları
  for (let i = 0; i < 26; i++) { const a = Math.random() * 6.283, s = 80 + Math.random() * 160; k.pk.push({ x: k.cx + Math.cos(a) * SKL_R * 0.6, y: k.cy + Math.sin(a) * SKL_R * 0.4, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, l: 0.9 + Math.random() * 0.6, m: 1.5, c: i % 3 ? '#fff4c8' : SKL_GOK[i % 6], r: 3 + Math.random() * 3 }); }
  if (!k.terk) {
    if (ad === 'feza' && !SKL.soz3) { SKL.soz3 = true; sklSoz('p_b_sekil4', 3); }   // sürpriz: "Bak, bu sensin!" (ses.js'te yoksa sessiz geçer); p_b_sekil3'ü ses.js 'sekil' olayında kendisi söyler
    D.expr = 'happy'; D.exprT = 1.5;
  }
}
function sklUcur(o) {   // canlı hayvan gökyüzüne süzülür, yerine yeni bulut gelir
  const k = o.skl;
  k.ucan.push({ ad: sklHayvan(o), x: k.cx, y: k.cy, t: k.t + 100, u: 0, s: SKL_R, d: k.d.slice(), sure: 0, rot: 0, sx: 1, sy: 1, taklaBurst: false });
  k.i++; k.p = 0; k.pv = 0; k.gor = 0;
  if (!sklPirilVar()) D.tkKut = false; else D.sklKut = false;
  sklDur(o, 'ara');
}
function sklBitir(o) {
  const k = o.skl; k.bitti = true; sklDur(o, 'bitti'); k.gor = 0;
  if (!k.terk) sklSfx('sekilBitti');
  D.expr = 'happy'; D.exprT = 1;
  sklBirak(o);
}
function sklCanliGuncelle(o, dt) {   // hayvana özel etkiler (dünya koordinatı)
  const k = o.skl, ad = sklHayvan(o), t = k.t;
  if (ad === 'fil' && t > 1.0 && t < 4.0 && !k.terk) {   // hortumdan minik yağmur → yerde çiçekler
    sklPoz('fil', t, 1, SKL_POZ);
    if (Math.random() < dt * 22) { const x = k.cx + SKL_POZ.fx * SKL_R, y = k.cy + SKL_POZ.fy * SKL_R; k.damla.push({ x, y, vx: 40 + Math.random() * 90, vy: -170 - Math.random() * 90, l: 3 }); }
  }
  if (ad === 'balina') k.gokA = t < 0.6 ? 0 : t < 4.2 ? Math.min(1, (t - 0.6) / 1.4) : Math.max(0, 1 - (t - 4.2) / 0.8);
  else k.gokA = 0;
  if (ad === 'balina' && t > 0.6 && t < 3.6 && Math.random() < dt * 20) { sklPoz('balina', t, 1, SKL_POZ); const x = k.cx + SKL_POZ.fx * SKL_R, y = k.cy + SKL_POZ.fy * SKL_R; k.pk.push({ x, y, vx: (Math.random() - 0.3) * 90, vy: -140 - Math.random() * 80, l: 0.8, m: 0.8, c: SKL_GOK[(Math.random() * 6) | 0], r: 2.5 + Math.random() * 2 }); }
  if (Math.random() < dt * 6) { const a = Math.random() * 6.283; k.pk.push({ x: k.cx + Math.cos(a) * SKL_R, y: k.cy + Math.sin(a) * SKL_R * 0.7, vx: 0, vy: -30, l: 0.8, m: 0.8, c: '#fff4c8', r: 2.5 }); }
  if (k.terk) return;
  sklPoz(ad, t, 1, SKL_POZ);
  const yx = k.cx + SKL_POZ.yx * SKL_R, yy = k.cy + SKL_POZ.yy * SKL_R, pr = (q) => Math.floor((t - dt) / q) !== Math.floor(t / q);
  if (ad === 'tavsan' && t < 3.9) {   // her inişte ayak altından kabarık "pof"lar
    const h = Math.sin(t * 3.3 - 0.4);
    if (k.onceH > 0 && h <= 0 && t > 0.5) for (let q = 0; q < 4; q++) k.pof.push({ x: k.cx + (q - 1.5) * SKL_R * 0.3, y: k.cy + SKL_R * 0.9, r: 12 + Math.random() * 8, l: 0.5, m: 0.5 });
    k.onceH = h;
  } else if (ad === 'kus' && SKL_POZ.mutlu > 0.5 && pr(0.42)) sklKalp(k, yx + SKL_R * 0.4, yy - 6, 'nota', 1);   // şarkı söyler
  else if (ad === 'ayicik' && t > 2.4 && pr(0.5)) sklKalp(k, yx + (Math.random() - 0.5) * 40, yy - SKL_R * 0.6, 'kalp', 1);   // sarılma kalpleri
  else if (ad === 'kalp' && pr(0.34)) sklKalp(k, yx + (Math.random() - 0.5) * 36, yy - SKL_R * 0.45, 'kalp', 2);   // kanatlanan kalp sevinç saçıyor
  else if (ad === 'yildiz' && pr(0.3)) sklKalp(k, yx + (Math.random() - 0.5) * 44, yy - SKL_R * 0.5, 'yildiz', 2);   // parıldayan yıldız ışıldıyor
  else if (ad === 'feza' && pr(0.38)) sklKalp(k, yx + (Math.random() - 0.5) * SKL_R * 1.4, yy - SKL_R * 0.4, Math.random() < 0.5 ? 'kalp' : 'yildiz', 1);
}
const SKL_KALP = ['#ff8fb8', '#ff9fd0', '#ffb3a0'], SKL_NOTA = ['#9f86ff', '#ff8fb8', '#6fc3ff', '#ffb35e'];
function sklKalp(k, x, y, tip, n) {
  for (let i = 0; i < n; i++) k.pk.push({ x: x + (Math.random() - 0.5) * 16, y, vx: (Math.random() - 0.3) * 40, vy: -70 - Math.random() * 30, l: 1.5, m: 1.5, tip, r: Math.random() * 6,
    c: tip === 'nota' ? SKL_NOTA[(Math.random() * 4) | 0] : tip === 'yildiz' ? '#ffd56a' : SKL_KALP[(Math.random() * 3) | 0] });
}
function sklParcaGuncelle(o, dt) {
  const k = o.skl;
  for (let i = k.pk.length - 1; i >= 0; i--) { const p = k.pk[i]; p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 1.5; p.vy = p.vy * (1 - dt * 1.5) + (p.tip ? -12 : 50) * dt; if (p.tip) p.x += Math.sin(p.l * 5 + p.r) * 18 * dt; if (p.l <= 0) k.pk.splice(i, 1); }
  for (let i = k.pof.length - 1; i >= 0; i--) { const p = k.pof[i]; p.l -= dt; p.r += dt * 40; p.y -= dt * 14; if (p.l <= 0) k.pof.splice(i, 1); }
  for (let i = k.damla.length - 1; i >= 0; i--) {
    const p = k.damla[i]; p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.l -= dt;
    if (p.y >= o.y - 2) {
      k.damla.splice(i, 1);
      if (k.cicek.length < 11 && !k.cicek.some(c => Math.abs(c.x - p.x) < 22)) k.cicek.push({ x: p.x, t: 0, c: SKL_CICEK[k.cicek.length % SKL_CICEK.length], s: 0.8 + Math.random() * 0.4, ph: Math.random() * 6 });
      for (let q = 0; q < 3; q++) k.pk.push({ x: p.x, y: o.y - 3, vx: (Math.random() - 0.5) * 80, vy: -60 - Math.random() * 40, l: 0.4, m: 0.4, c: '#cfeaff', r: 2 });
    } else if (p.l <= 0) k.damla.splice(i, 1);
  }
  for (const c of k.cicek) c.t += dt;
  for (let i = k.halka.length - 1; i >= 0; i--) { k.halka[i].l -= dt; if (k.halka[i].l <= 0) k.halka.splice(i, 1); }
  k.kikir = Math.max(0, k.kikir - dt);
  if (k.pk.length > 160) k.pk.splice(0, k.pk.length - 160);
}
// ovma/dokunma etkisi: (ux,uy) birim uzayda; g = güç (dokunuş 1, ovma küçük)
const SKL_PERI = ['#fffde6', '#ffd2ea', '#c4eaff', '#e6caff', '#ffe8b4'];
function sklOvEtki(o, ux, uy, gg) {
  const k = o.skl;
  for (let i = 0; i < SKL_N; i++) { const b = k.b[i], d = Math.hypot(b.x - ux, b.y - uy); if (d < 0.9) k.jv[i] += (1 - d / 0.9) * 2.8 * gg; }
  const wx = k.cx + ux * SKL_R, wy = k.cy + uy * SKL_R;
  const n = Math.round(5 + 6 * gg);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.283, s = 40 + Math.random() * 120;
    const periCol = SKL_PERI[Math.floor(Math.random() * SKL_PERI.length)];
    const tip = (gg >= 0.7 && Math.random() < 0.35) ? 'yildiz' : null;
    k.pk.push({ x: wx, y: wy, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 32, l: 0.65 + Math.random() * 0.5, m: 1.15, c: periCol, r: 2.6 + Math.random() * 2.8, tip });
  }
  if (k.pof.length < 16) k.pof.push({ x: wx + (Math.random() - 0.5) * 20, y: wy, r: 12 + 12 * gg, l: 0.6, m: 0.6 });
  if (gg >= 0.8 && k.halka.length < 6) k.halka.push({ x: wx, y: wy, l: 0.52 });
  k.vur = Math.min(1, k.vur + 0.45 * gg);
}
function sklIlerle(o, miktar, ux, uy, gg) {   // girdi → ilerleme (+ ses, etki)
  const k = o.skl;
  if (k.durum === 'canlan') { k.vur = 1; k.kikir = 0.7; sklOvEtki(o, ux, uy, 0.5); sklKalp(k, k.cx + ux * SKL_R, k.cy + uy * SKL_R - 10, 'kalp', 2); return; }   // canlı hayvana dokunuş: kıkır kıkır ışıltı
  if (k.durum !== 'ov' || k.terk) return;
  const once = k.p; k.p = Math.min(1, k.p + miktar); k.bosT = 0;
  sklOvEtki(o, ux, uy, gg);
  if (gg >= 1 || Math.floor(once * 9) !== Math.floor(k.p * 9) || k.p >= 1) { if (now - k.sfxT > 0.11) { k.sfxT = now; sklSfx('sekilOv', k.p); } }
}

// ── girdi (capture): buluta dokunuş/ovma yürüme girdisine ulaşmaz; zıplama düğmesi her zaman önce ──
function sklEkran(o) { const k = o.skl, p = sklPx(k.cx, k.cy), r = SKL_R * S / DPR; return { x: p.x, y: p.y, r }; }
function sklIsabet(o, x, y) { const e = sklEkran(o); return Math.hypot((x - e.x) / (e.r * 1.75), (y - e.y) / (e.r * 1.35)) < 1; }
function sklAlabilir(o) { const k = o && o.skl; return !!k && !k.terk && (k.durum === 'ov' || k.durum === 'canlan' || k.durum === 'yeni'); }
addEventListener('pointerdown', e => {
  const o = SKL.akt;
  if (!o || DURUM !== 'oyun' || !sklAlabilir(o) || e.pointerType === 'mouse' && e.button !== 0) return;
  if (typeof dugmede === 'function' && dugmede(e.clientX, e.clientY)) return;
  if (SKL.ptr !== -1 || !sklIsabet(o, e.clientX, e.clientY)) return;
  e.preventDefault(); e.stopPropagation();
  SKL.ptr = e.pointerId; SKL.ptrO = o; SKL.pxSon = e.clientX; SKL.pySon = e.clientY;
  try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* yoksay */ }
  try { const s = sklEkran(o); sklIlerle(o, 0.115, (e.clientX - s.x) / s.r, (e.clientY - s.y) / s.r, 1); } catch (er) { console.warn('[sekil]', er); }
}, true);
addEventListener('pointermove', e => {
  if (e.pointerId !== SKL.ptr || !SKL.ptrO) return;
  e.stopPropagation();
  const o = SKL.ptrO; if (!sklAlabilir(o)) return;
  const d = Math.hypot(e.clientX - SKL.pxSon, e.clientY - SKL.pySon); if (d < 4) return;
  SKL.pxSon = e.clientX; SKL.pySon = e.clientY;
  try {
    const s = sklEkran(o), k = o.skl;
    const m = Math.min(d, s.r * 0.6) / (s.r * 9);   // ≈ bulutu 3-4 kez boydan boya ovmak = tamam
    k.ovBirik = (k.ovBirik || 0) + m;
    if (k.ovBirik > 0.035 || k.durum === 'canlan') { const g0 = k.ovBirik; k.ovBirik = 0; sklIlerle(o, g0, clamp((e.clientX - s.x) / s.r, -1.4, 1.4), clamp((e.clientY - s.y) / s.r, -1, 1), 0.45); }
  } catch (er) { console.warn('[sekil]', er); }
}, true);
function sklParmakBitir(e) { if (e.pointerId !== SKL.ptr) return; SKL.ptr = -1; SKL.ptrO = null; e.stopPropagation(); }
addEventListener('pointerup', sklParmakBitir, true); addEventListener('pointercancel', sklParmakBitir, true);
addEventListener('blur', () => { SKL.ptr = -1; SKL.ptrO = null; });
addEventListener('keydown', e => {   // klavye yedeği: zıplama tuşu bulutu ovar (Feza zıplamaz)
  const o = SKL.akt;
  if (!o || DURUM !== 'oyun' || !(e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW')) return;
  const k = o.skl; if (k.terk || !(k.durum === 'ov' || k.durum === 'canlan')) return;
  e.preventDefault(); e.stopPropagation();
  if (e.repeat) return;
  sklIlerle(o, 0.115, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.6, 1);
}, true);

// ═══════════ çizim ═══════════
// birim uzayda daire birleşimi yolu: her daire (ox,oy)·r kaydırılmış, k·r yarıçaplı
function sklYol(a, n, ox, oy, kk) {
  g.beginPath();
  for (let i = 0; i < n; i++) { const q = a[i]; if (q.r <= 0.004) continue; const r = q.r * kk, x = q.x + ox * q.r, y = q.y + oy * q.r; g.moveTo(x + r, y); g.arc(x, y, r, 0, 6.283); }
}
const sklRenkC = { k: '', c: null };
function sklRenkler(ad, u) {   // şekilsiz → hayvan renk karışımı (rgba dizeleri; aynı (ad,u) için önbellek)
  const key = ad + ((u * 20) | 0);
  if (sklRenkC.k === key) return sklRenkC.c;
  const A = SKL_RENK.sekilsiz, B = SKL_RENK[ad] || A, t = ((u * 20) | 0) / 20;
  sklRenkC.k = key; sklRenkC.c = [0, 1, 2, 3].map(i => mixc(A[i], B[i], t, 1)).concat([0, 1, 2, 3].map(i => '#' + hex(A[i]).map((v, j) => Math.round(lerp(v, hex(B[i])[j], t)).toString(16).padStart(2, '0')).join('')));
  return sklRenkC.c;
}
// hacimli bulut: gölge (alt) → güneş kenar ışığı (sağ üst) → gövde (dikey gradyan) → tepe parlaklıkları → iç sıcak ışık
function sklBulutCiz(cx, cy, R, a, n, rk, isik, tm) {
  g.save(); g.translate(cx, cy); g.scale(R, R);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.globalAlpha = 0.55; sklYol(a, n, 0.01, 0.1, 1.09); g.fillStyle = '#9d76bf'; g.fill(); g.globalAlpha = 1;   // yumuşak koyu kontur: kalabalık bulut fonundan ayrışsın
  sklYol(a, n, 0.02, 0.16, 1.0); g.fillStyle = rk[1]; g.fill();
  sklYol(a, n, 0.1, -0.1, 0.97); g.fillStyle = rk[3]; g.fill();
  sklYol(a, n, 0, 0, 0.95);
  const gr = g.createLinearGradient(0, -1.3, 0, 1.0); gr.addColorStop(0, rk[2]); gr.addColorStop(0.55, rk[0]); gr.addColorStop(1, mixc(rk[4], rk[5], 0.5, 1));
  g.fillStyle = gr; g.fill();
  g.globalAlpha = 0.62; sklYol(a, n, -0.08, -0.17, 0.6); g.fillStyle = rk[2]; g.fill(); g.globalAlpha = 1;
  if (isik > 0.01) { g.globalCompositeOperation = 'lighter'; dglow('#ffd9a8', 0, 0.05, 1.25, isik); g.globalCompositeOperation = 'source-over'; }
  g.restore();
}
function sklYuzCiz(cx, cy, R, a, ad, al, tm, ph) {
  if (al < 0.02) return;
  g.save(); g.translate(cx, cy); g.scale(R, R); g.globalAlpha = al;
  if (a.kvN) {   // iç kıvrımlar (kulak kenarı, but, yüzgeç): gölge renginde ince yay
    g.strokeStyle = 'rgba(150,110,170,0.38)'; g.lineWidth = 0.035; g.lineCap = 'round';
    for (let i = 0; i < a.kvN; i++) { const q = a[a.kv[i * 3]]; if (!q || q.r < 0.02) continue; g.beginPath(); g.arc(q.x, q.y, q.r * 0.93, a.kv[i * 3 + 1] + a.rot, a.kv[i * 3 + 2] + a.rot); g.stroke(); }
  }
  sklDetay(a, ad);
  const s = a.ys, x = a.yx, y = a.yy, yan = a.yon;
  const kirp = ((tm + ph) % 3.4) < 0.13;
  const ex0 = yan ? x - 0.07 * s : x - 0.15 * s, ex1 = yan ? x + 0.13 * s : x + 0.15 * s;
  g.fillStyle = 'rgba(255,150,180,0.42)';
  g.beginPath(); g.ellipse(ex0 - 0.07 * s, y + 0.12 * s, 0.075 * s, 0.045 * s, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(ex1 + 0.08 * s, y + 0.12 * s, 0.075 * s, 0.045 * s, 0, 0, 6.283); g.fill();
  g.fillStyle = '#4b3352'; g.strokeStyle = '#4b3352'; g.lineCap = 'round'; g.lineWidth = 0.028 * s;
  for (const ex of [ex0, ex1]) {
    const er = (ex === ex0 && yan ? 0.85 : 1) * 0.058 * s;
    if (a.mutlu > 0.5) { g.lineWidth = 0.034 * s; g.beginPath(); g.arc(ex, y + er * 0.55, er * 1.05, Math.PI + 0.45, 2 * Math.PI - 0.45); g.stroke(); g.lineWidth = 0.028 * s; continue; }   // mutlu: ^ ^
    if (kirp) { g.beginPath(); g.moveTo(ex - er, y); g.quadraticCurveTo(ex, y + er * 0.7, ex + er, y); g.stroke(); continue; }
    g.beginPath(); g.ellipse(ex, y, er, er * 1.18, 0, 0, 6.283); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ex - er * 0.3, y - er * 0.38, er * 0.36, 0, 6.283); g.fill(); g.fillStyle = '#4b3352';
  }
  const mx = (ex0 + ex1) / 2;
  if (a.mutlu > 0.5) {   // kocaman gülüş: açık ağız + dil
    g.beginPath(); g.arc(mx, y + 0.07 * s, 0.075 * s, 0.1, Math.PI - 0.1); g.closePath(); g.fill();
    g.fillStyle = '#ff8fae'; g.beginPath(); g.arc(mx, y + 0.115 * s, 0.035 * s, 0, Math.PI); g.fill(); g.fillStyle = '#4b3352';
  } else { g.beginPath(); g.arc(mx, y + 0.08 * s, 0.065 * s, 0.25, Math.PI - 0.25); g.stroke(); }
  if (ad === 'tavsan') { g.fillStyle = '#ff9fbf'; g.beginPath(); g.ellipse(mx, y + 0.07 * s, 0.03 * s, 0.022 * s, 0, 0, 6.283); g.fill(); }
  else if (ad === 'ayicik') { g.fillStyle = '#7a5466'; g.beginPath(); g.ellipse(mx, y + 0.17 * s, 0.055 * s, 0.038 * s, 0, 0, 6.283); g.fill(); }
  else if (ad === 'kus') { g.fillStyle = '#ffb35e'; g.beginPath(); g.moveTo(x + 0.27 * s, y + 0.02 * s); g.lineTo(x + 0.46 * s, y + 0.08 * s); g.lineTo(x + 0.27 * s, y + 0.14 * s); g.closePath(); g.fill(); }
  else if (ad === 'kalp') { g.fillStyle = '#ff6f98'; g.beginPath(); g.arc(mx, y + 0.05 * s, 0.025 * s, 0, 6.283); g.fill(); }
  else if (ad === 'yildiz') { g.fillStyle = '#ffbe3b'; g.beginPath(); g.arc(mx, y + 0.05 * s, 0.028 * s, 0, 6.283); g.fill(); }
  g.restore(); g.globalAlpha = 1;
}
// a dizisini doldurur: şekilsiz (b) ile hayvan pozu (SKL_POZ) arasında, her daire kendi gecikmesiyle; gor: belirme (0..1)
function sklKarisim(k, u, gor, tm, poz) {
  for (let i = 0; i < SKL_N; i++) {
    const b = k.b[i], q = poz[i], c = SKL_CIZ[i];
    const ui = smooth(clamp((u * 1.35 - k.d[i] * 0.35), 0, 1));
    const nef = (1 - ui) * 0.025;
    const gi = gor >= 1 ? 1 : smooth(clamp(gor * 1.6 - k.d[i] * 0.6, 0, 1));
    c.x = lerp(b.x, q.x, ui) + Math.sin(tm * 1.3 + i * 1.7) * nef;
    c.y = lerp(b.y, q.y, ui) + Math.cos(tm * 1.1 + i * 2.3) * nef;
    c.r = lerp(b.r, q.r, ui) * (1 + 0.14 * Math.sin(ui * Math.PI) + k.j[i] * 0.16) * gi;
  }
  SKL_CIZ.yx = poz.yx; SKL_CIZ.yy = poz.yy; SKL_CIZ.ys = poz.ys; SKL_CIZ.yon = poz.yon; SKL_CIZ.kvN = poz.kvN; SKL_CIZ.kv.set(poz.kv); SKL_CIZ.rot = poz.rot; SKL_CIZ.mutlu = poz.mutlu;
  return SKL_CIZ;
}
function sklGokkusagi(k, tm) {   // balinanın tepesinden fışkıran gökkuşağı (dünya uzayı)
  if (k.gokA < 0.01) return;
  sklPoz('balina', k.t, 1, SKL_POZ);
  const sx = k.cx + SKL_POZ.fx * SKL_R, sy = k.cy + SKL_POZ.fy * SKL_R, rr = SKL_R * 1.15, ccx = sx + rr, bu = smooth(clamp((k.t - 0.6) / 1.6, 0, 1));
  const bw = SKL_R * 0.075;
  g.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const r = rr - (i - 2.5) * bw;
    g.strokeStyle = mixc(SKL_GOK[i], '#ffffff', 0.15, 0.82 * k.gokA); g.lineWidth = bw * 1.05;
    g.beginPath(); g.arc(ccx, sy, r, Math.PI, Math.PI + Math.PI * bu); g.stroke();
  }
  g.globalCompositeOperation = 'lighter';
  const ea = Math.PI + Math.PI * bu; dglow('#fff4d0', ccx + Math.cos(ea) * rr, sy + Math.sin(ea) * rr, SKL_R * 0.5, 0.45 * k.gokA);
  dglow('#ffe9c0', ccx, sy - rr * 0.5, rr * 1.4, 0.12 * k.gokA);
  g.globalCompositeOperation = 'source-over';
}
function sklCicekCiz(o, tm) {
  const k = o.skl;
  for (const c of k.cicek) {
    const u = smooth(clamp(c.t / 0.7, 0, 1)), s = c.s * u, sal = Math.sin(tm * 1.6 + c.ph) * 0.12;
    if (s < 0.02) continue;
    const by = o.y, h = 26 * s;
    g.save(); g.translate(c.x, by); g.rotate(sal);
    g.strokeStyle = '#7fc98a'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(4, -h * 0.5, 0, -h); g.stroke();
    g.fillStyle = '#93d79c'; g.beginPath(); g.ellipse(5, -h * 0.4, 6 * s, 3 * s, -0.5, 0, 6.283); g.fill();
    g.translate(0, -h); g.rotate(tm * 0.2 + c.ph);
    g.fillStyle = c.c; for (let i = 0; i < 5; i++) { const a = i * 1.2566; g.beginPath(); g.ellipse(Math.cos(a) * 6 * s, Math.sin(a) * 6 * s, 5.5 * s, 4 * s, a, 0, 6.283); g.fill(); }
    g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(0, 0, 3.6 * s, 0, 6.283); g.fill();
    g.restore();
    if (c.t < 1.2) { g.globalCompositeOperation = 'lighter'; dglow(c.c, c.x, by - h, 26, (1 - c.t / 1.2) * 0.6); g.globalCompositeOperation = 'source-over'; }
  }
}
function sklYildizSekilCiz(cx, cy, r) {
  g.beginPath();
  for (let j = 0; j < 10; j++) {
    const an = -1.5708 + j * 0.6283, rr = j % 2 ? r * 0.44 : r;
    const px = cx + Math.cos(an) * rr, py = cy + Math.sin(an) * rr;
    if (j === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
  g.fill();
  g.stroke();
}
function sklAltinYildizCemberi(k, tm, katman) {
  if (k.durum !== 'canlan') return;
  const belir = smooth(clamp(k.t / 0.65, 0, 1));
  const son = clamp((5.2 - k.t) / 0.8, 0, 1);
  const al = belir * son;
  if (al <= 0.02) return;
  const Rx = SKL_R * (1.35 + 0.06 * Math.sin(k.t * 3.2));
  const Ry = SKL_R * (0.42 + 0.02 * Math.sin(k.t * 3.2));
  const tilt = -0.18;
  const cx = k.cx, cy = k.cy + 10;
  const donme = tm * 2.2;
  const nYildiz = 7;
  g.save();
  g.translate(cx, cy);
  g.rotate(tilt);
  if (katman === 0) {
    g.strokeStyle = 'rgba(255, 228, 130, ' + (0.42 * al).toFixed(3) + ')';
    g.lineWidth = 3.2;
    g.beginPath();
    g.ellipse(0, 0, Rx * belir, Ry * belir, 0, Math.PI, 2 * Math.PI);
    g.stroke();
  } else {
    g.strokeStyle = 'rgba(255, 242, 160, ' + (0.75 * al).toFixed(3) + ')';
    g.lineWidth = 4.2;
    g.beginPath();
    g.ellipse(0, 0, Rx * belir, Ry * belir, 0, 0, Math.PI);
    g.stroke();
    g.strokeStyle = 'rgba(255, 255, 255, ' + (0.85 * al).toFixed(3) + ')';
    g.lineWidth = 1.8;
    g.beginPath();
    g.ellipse(0, 0, Rx * belir, Ry * belir, 0, 0, Math.PI);
    g.stroke();
  }
  for (let i = 0; i < nYildiz; i++) {
    const a = donme + i * (Math.PI * 2 / nYildiz);
    const sn = Math.sin(a);
    if (katman === 0 && sn >= 0) continue;
    if (katman === 1 && sn < 0) continue;
    const sx = Math.cos(a) * Rx * belir;
    const sy = sn * Ry * belir;
    const derinlik = (0.78 + 0.32 * Math.max(0, sn)) * belir;
    const tw = 1 + 0.22 * Math.sin(tm * 9 + i * 1.8);
    const r = 7.5 * derinlik * tw;
    g.globalCompositeOperation = 'lighter';
    dglow('#ffd700', sx, sy, r * 3.2, 0.58 * al);
    dglow('#ffffff', sx, sy, r * 1.4, 0.75 * al);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#ffdf5d';
    g.strokeStyle = 'rgba(255, 255, 255, ' + (0.95 * al).toFixed(3) + ')';
    g.lineWidth = 1.5;
    sklYildizSekilCiz(sx, sy, r);
  }
  g.restore();
}
function sklCiz(o, tm) {
  const k = o.skl;
  sklCicekCiz(o, tm);
  // uçup giden hayvanlar (arkada): küçülür, sonda daireler tek tek erir
  for (const u of k.ucan) {
    sklPoz(u.ad, u.t, 1, SKL_POZ);
    const er = clamp((u.u - 0.7) / 0.3, 0, 1);
    for (let i = 0; i < SKL_N; i++) { const q = SKL_POZ[i], c = SKL_CIZ[i]; c.x = q.x; c.y = q.y; c.r = q.r * (er > 0 ? smooth(clamp(1 - er * 1.6 + u.d[i] * 0.6, 0, 1)) : 1); }
    SKL_CIZ.yx = SKL_POZ.yx; SKL_CIZ.yy = SKL_POZ.yy; SKL_CIZ.ys = SKL_POZ.ys; SKL_CIZ.yon = SKL_POZ.yon; SKL_CIZ.kvN = SKL_POZ.kvN; SKL_CIZ.kv.set(SKL_POZ.kv); SKL_CIZ.rot = SKL_POZ.rot; SKL_CIZ.mutlu = 1;
    const R = u.s * lerp(1, 0.55, smooth(u.u));
    g.save();
    g.translate(u.x, u.y);
    if (u.rot) g.rotate(u.rot);
    if (u.sx || u.sy) g.scale(u.sx || 1, u.sy || 1);
    // Göğe süzülürken etrafındaki kutsal altın-şeftali ışıltı hâlesi
    g.globalCompositeOperation = 'lighter';
    dglow('#ffe29a', 0, 0, R * 2.4, 0.28 * (1 - er));
    dglow('#ffc0d8', 0, 0, R * 1.6, 0.18 * (1 - er));
    g.globalCompositeOperation = 'source-over';
    sklBulutCiz(0, 0, R, SKL_CIZ, SKL_N, sklRenkler(u.ad, 1), 0.12 * (1 - er), tm);
    sklYuzCiz(0, 0, R, SKL_CIZ, u.ad, 1 - smooth(clamp(er * 2, 0, 1)), tm, 1.3);
    g.restore();
  }
  if (k.durum === 'bitti' || (k.durum === 'ara')) return;
  const ad = sklHayvan(o), canli = k.durum === 'canlan';
  if (canli) sklGokkusagi(k, tm);
  if (canli) sklPoz(ad, k.t, 1, SKL_POZ); else sklPoz(ad, 0, 0, SKL_POZ);
  const a = sklKarisim(k, canli ? 1 : k.pv, k.gor, tm, SKL_POZ);
  // canlanma anı: kısa büyüme sıçraması; dokunulunca kıkır zıplama
  const sic = canli ? 1 + 0.12 * Math.sin(clamp(k.t / 0.5, 0, 1) * Math.PI) : 1;
  const R = SKL_R * sic * (1 + k.vur * 0.04);
  // altında yumuşak pembe ışık (zemin/gökle ayrışsın)
  dglow('#fff3e0', k.cx, k.cy, SKL_R * 2.6, 0.4 + 0.08 * Math.sin(k.ph * 1.7));   // arkasında sıcak hale (fondan ayrışır)
  g.globalCompositeOperation = 'lighter'; dglow('#ffc8a0', k.cx, k.cy, SKL_R * 2.2, 0.12 + 0.06 * Math.sin(k.ph * 1.7)); g.globalCompositeOperation = 'source-over';
  const isik = canli ? 0.15 * (1 - clamp(k.t / 1.5, 0, 1)) + 0.05 : (0.08 + 0.07 * Math.sin(k.ph * 2.1)) * (1 - k.pv * 0.5) + k.vur * 0.12;
  if (canli) sklAltinYildizCemberi(k, tm, 0);
  sklBulutCiz(k.cx, k.cy, R, a, SKL_N, sklRenkler(ad, canli ? 1 : smooth(k.pv)), isik, tm);
  const yuzA = canli ? 1 : smooth(clamp((k.pv - 0.72) / 0.28, 0, 1));
  if (k.kikir > 0 && canli) a.mutlu = 1;   // dokununca kıkırdar
  sklYuzCiz(k.cx, k.cy, R, a, ad, yuzA, tm, k.ph);
  if (canli) sklAltinYildizCemberi(k, tm, 1);
  if (k.goz && yuzA < 0.05) sklGozCiz(k);
}
function sklGozCiz(k) {   // bulutun içinden bakan iki küçük göz (belirir, bir kez kırpar, kaybolur)
  const z = k.goz, u = z.t / 1.6, al = smooth(clamp(u * 5, 0, 1)) * smooth(clamp((1 - u) * 5, 0, 1)) * 0.85;
  if (al < 0.02) return;
  const x = k.cx + z.x * SKL_R, y = k.cy + z.y * SKL_R, kap = u > 0.45 && u < 0.53;
  g.globalAlpha = al; g.fillStyle = '#5a4060'; g.strokeStyle = '#5a4060'; g.lineWidth = 2.4; g.lineCap = 'round';
  for (const ex of [x - 9, x + 9]) {
    if (kap) { g.beginPath(); g.moveTo(ex - 4, y); g.lineTo(ex + 4, y); g.stroke(); }
    else { g.beginPath(); g.ellipse(ex, y, 4.2, 5.4, 0, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - 1.3, y - 1.8, 1.5, 0, 6.283); g.fill(); g.fillStyle = '#5a4060'; }
  }
  g.globalAlpha = 1;
}
function sklCizOn(o, tm) {
  const k = o.skl;
  g.globalCompositeOperation = 'lighter';
  for (const p of k.pk) if (!p.tip) dglow(p.c, p.x, p.y, p.r * 4 * Math.min(1, p.l * 2), Math.min(1, p.l / p.m * 1.6) * 0.8);
  for (const h of k.halka) { const u = 1 - h.l / (h.l0 || 0.5), bb = h.b || 1; g.strokeStyle = 'rgba(255,240,220,' + (0.7 * (1 - u)).toFixed(3) + ')'; g.lineWidth = 3 * (1 - u) + 0.5; g.beginPath(); g.arc(h.x, h.y, (8 + u * 44) * bb, 0, 6.283); g.stroke(); }
  g.globalCompositeOperation = 'source-over';
  for (const p of k.pk) if (p.tip) sklSimge(p);
  g.globalCompositeOperation = 'lighter';
  for (const p of k.damla) dglow('#bfe4ff', p.x, p.y, 7, 0.8);
  g.globalCompositeOperation = 'source-over';
  for (const p of k.pof) dglow('#ffffff', p.x, p.y, p.r, (p.l / p.m) * 0.55);
  // el ipucu: bulutu ovan el (yazı yok). İlk seferde Pırıl'ın davetinden sonra; sonra boşta kalınca
  const goster = k.durum === 'ov' && !k.terk && k.p < 0.92 && k.bosT > (k.elBek || 2) && SKL.ptrO !== o && DURUM === 'oyun';
  k.el = clamp(k.el + (goster ? 0.03 : -0.08), 0, 1);
  if (k.el > 0.01) sklElCiz(o, tm, k.el);
}
// ── el ipucu (arayuz.js el simgesi ile aynı stil; önbellekte) ──
let sklElC = null;
function sklRr(x, a, b, w, h, r) { x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function sklElSprite() {
  if (sklElC) return sklElC;
  const c = document.createElement('canvas'); c.width = 176; c.height = 220; const x = c.getContext('2d');
  x.translate(64, 26);
  const avuc = () => { x.beginPath(); sklRr(x, -13, 50, 60, 76, 24); };
  const isaret = () => { x.beginPath(); sklRr(x, -11, 0, 22, 84, 11); };
  const kivrik = [[9, 52, 36, 21], [9, 71, 35, 20], [9, 89, 31, 19]];
  const bas = () => { x.beginPath(); x.ellipse(-2, 104, 22, 11, -0.42, 0, 6.283); };
  const kol = () => { x.beginPath(); sklRr(x, -6, 122, 50, 30, 9); };
  const hepsi = () => { avuc(); x.fill(); isaret(); x.fill(); for (const k of kivrik) { x.beginPath(); sklRr(x, k[0], k[1], k[2], k[3], k[3] / 2); x.fill(); } bas(); x.fill(); kol(); x.fill(); };
  x.save(); x.shadowColor = 'rgba(190,150,255,1)'; x.shadowBlur = 26; x.fillStyle = '#fffaf6'; hepsi(); x.restore();
  x.lineJoin = 'round'; x.strokeStyle = '#7c5cd0'; x.lineWidth = 4.5;
  const parca = (yol, renk) => { yol(); x.fillStyle = renk; x.fill(); x.stroke(); };
  parca(kol, '#c9b4ff'); parca(avuc, '#fff8f2');
  for (let i = kivrik.length - 1; i >= 0; i--) { const k = kivrik[i]; parca(() => { x.beginPath(); sklRr(x, k[0], k[1], k[2], k[3], k[3] / 2); }, '#fff3ea'); }
  parca(isaret, '#fffaf6'); parca(bas, '#fff5ee');
  x.fillStyle = 'rgba(255,205,225,0.95)'; x.beginPath(); sklRr(x, -6.5, 4, 13, 14, 6.5); x.fill();
  x.strokeStyle = 'rgba(124,92,208,0.45)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(-6, 40); x.quadraticCurveTo(0, 43, 6, 40); x.stroke();
  return sklElC = c;
}
function sklElCiz(o, tm, al) {
  const k = o.skl, e = sklEkran(o);
  const per = 2.8, u = (tm % per) / per;
  const in0 = smooth(clamp(u / 0.14, 0, 1)), cik = smooth(clamp((u - 0.82) / 0.14, 0, 1)), bas = in0 * (1 - cik);
  const w = clamp((u - 0.14) / 0.68, 0, 1);
  const ox = Math.sin(w * Math.PI * 4) * e.r * 0.55, oy = -Math.cos(w * Math.PI * 4) * e.r * 0.06 + e.r * 0.05;
  const hx = (e.x + ox) * DPR, hy = (e.y + oy) * DPR, boy = Math.min(H * 0.16, W * 0.13);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'lighter';
  dglow('#d8c0ff', hx, hy, boy * (0.4 + bas * 0.2), al * bas * 0.5);
  if (bas > 0.5) for (let q = 1; q < 5; q++) { const w2 = clamp(w - q * 0.025, 0, 1); dglow('#fff0c8', (e.x + Math.sin(w2 * Math.PI * 4) * e.r * 0.55) * DPR, (e.y - Math.cos(w2 * Math.PI * 4) * e.r * 0.06 + e.r * 0.05) * DPR, boy * 0.12 * (1 - q / 5), al * 0.6 * (1 - q / 5)); }
  g.globalCompositeOperation = 'source-over';
  const s = boy / 220, kalk = (1 - bas) * boy * 0.16;
  g.translate(hx, hy); g.rotate(-0.15 + Math.sin(w * Math.PI * 4) * 0.12); g.translate(0, kalk); g.scale(s * (1 + bas * 0.03), s * (1 - bas * 0.05));
  g.globalAlpha = al * 0.95; g.drawImage(sklElSprite(), -64, -26); g.globalAlpha = 1;
  g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
}
function sklSimge(p) {   // yüzen kalp / nota / yıldız (birkaç yol; alfa ömürle)
  const al = Math.min(1, p.l / p.m * 2) * Math.min(1, (p.m - p.l) * 6), sc = 0.7 + 0.3 * Math.min(1, (p.m - p.l) * 4);
  if (al < 0.02) return;
  g.save(); g.translate(p.x, p.y); g.scale(sc, sc); g.rotate(Math.sin(p.l * 4 + p.r) * 0.25); g.globalAlpha = al;
  g.globalCompositeOperation = 'lighter'; dglow(p.c, 0, 0, 22, 0.35 * al); g.globalCompositeOperation = 'source-over'; g.globalAlpha = al;
  g.fillStyle = p.c; g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.6; g.lineJoin = 'round';
  g.beginPath();
  if (p.tip === 'kalp') { g.moveTo(0, 7); g.bezierCurveTo(-13, -2, -7, -12, 0, -5); g.bezierCurveTo(7, -12, 13, -2, 0, 7); }
  else if (p.tip === 'yildiz') { for (let i = 0; i < 10; i++) { const a = -1.5708 + i * 0.6283, r = i % 2 ? 4 : 9; if (i) g.lineTo(Math.cos(a) * r, Math.sin(a) * r); else g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); }
  else { g.ellipse(-3, 6, 5, 3.8, -0.4, 0, 6.283); g.rect(0.6, -9, 2.4, 15); g.moveTo(3, -9); g.quadraticCurveTo(10, -6, 8, 0); g.quadraticCurveTo(8, -4, 3, -5); }
  g.fill(); g.stroke();
  g.restore(); g.globalAlpha = 1;
}
// hayvana özel küçük ayrıntılar (birim uzay; daire sıraları sklPoz'daki yazılış sırası)
function sklDaire(q, k, ox, oy, renk) { if (!q || q.r < 0.02) return; g.fillStyle = renk; g.beginPath(); g.arc(q.x + ox * q.r, q.y + oy * q.r, q.r * k, 0, 6.283); g.fill(); }
function sklDetay(a, ad) {
  if (ad === 'tavsan') { for (const i of [8, 9, 11, 12]) sklDaire(a[i], 0.45, 0, 0.1, 'rgba(255,150,185,0.38)'); }   // kulak içi pembe
  else if (ad === 'ayicik') {
    sklDaire(a[6], 0.5, 0, 0.1, 'rgba(225,160,140,0.45)'); sklDaire(a[7], 0.5, 0, 0.1, 'rgba(225,160,140,0.45)');   // kulak içi
    g.fillStyle = 'rgba(255,252,240,0.7)'; g.beginPath(); g.ellipse(a[0].x, a[0].y + 0.08, a[0].r * 0.55, a[0].r * 0.6, 0, 0, 6.283); g.fill();   // göbek
    sklDaire(a[12], 0.4, 0, 0.25, 'rgba(240,160,170,0.5)'); sklDaire(a[13], 0.4, 0, 0.25, 'rgba(240,160,170,0.5)');   // pati
  } else if (ad === 'feza') {
    g.beginPath(); for (let i = 3; i <= 8; i++) { const q = a[i]; if (q && q.r > 0.02) { g.moveTo(q.x + q.r * 0.95, q.y - q.r * 0.05); g.arc(q.x, q.y - q.r * 0.05, q.r * 0.95, 0, 6.283); } }
    { const q = a[0]; g.moveTo(q.x + q.r * 0.8, q.y - q.r * 0.34); g.ellipse(q.x, q.y - q.r * 0.34, q.r * 0.8, q.r * 0.62, 0, 0, 6.283); }
    g.fillStyle = 'rgba(190,124,88,0.27)'; g.fill();   // kahverengimsi bulut saçlar (tek yol: üst üste koyulaşmaz)
    g.fillStyle = 'rgba(140,170,255,0.55)';   // pijamadaki minik yıldızlar
    for (const [i, ox, oy] of [[1, -0.35, -0.1], [1, 0.4, 0.25], [2, -0.1, 0.35]]) { const q = a[i]; if (!q) continue; const cx = q.x + ox * q.r, cy = q.y + oy * q.r, r = 0.045; g.beginPath(); for (let j = 0; j < 10; j++) { const an = -1.5708 + j * 0.6283, rr = j % 2 ? r * 0.45 : r; if (j) g.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); else g.moveTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr); } g.fill(); }
  } else if (ad === 'fil') {
    sklDaire(a[5], 0.55, 0.12, 0.08, 'rgba(255,170,200,0.13)');   // kulak içi
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 0.03; for (const i of [11, 12, 13]) { const q = a[i]; if (!q) continue; g.beginPath(); g.arc(q.x, q.y + q.r * 0.2, q.r * 0.6, 0.5, Math.PI - 0.5); g.stroke(); }   // tırnaklar
  } else if (ad === 'kus') { { const w0 = a[8], w1 = a[11]; if (w0 && w1 && w0.r > 0.02) { const ang = Math.atan2(w1.y - w0.y, w1.x - w0.x), ln = Math.hypot(w1.x - w0.x, w1.y - w0.y) + w0.r * 0.9;
      g.save(); g.translate((w0.x + w1.x) / 2, (w0.y + w1.y) / 2); g.rotate(ang); g.fillStyle = 'rgba(255,205,150,0.6)'; g.strokeStyle = 'rgba(232,160,100,0.7)'; g.lineWidth = 0.025;
      g.beginPath(); g.ellipse(0, 0, ln * 0.62, w0.r * 0.62, 0, 0, 6.283); g.fill(); g.stroke(); g.restore(); } }   // tek parça kanat
    sklDaire(a[12], 0.8, 0, 0, 'rgba(255,180,100,0.55)'); sklDaire(a[13], 0.8, 0, 0, 'rgba(255,180,100,0.55)'); }   // kanat içi ve ayaklar turuncu
  else if (ad === 'balina') {   // karın çizgileri
    g.strokeStyle = 'rgba(150,140,210,0.3)'; g.lineWidth = 0.025;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(0.05 + i * 0.08, 0.5 + i * 0.07); g.quadraticCurveTo(0.45, 0.62 + i * 0.05, 0.8, 0.42 + i * 0.03); g.stroke(); }
  } else if (ad === 'kalp') {
    // Kalbin göğsünde sıcak ışıltı yayı
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 0.03;
    g.beginPath(); g.arc(0, 0.05, 0.22, 0.2, Math.PI - 0.2); g.stroke();
  } else if (ad === 'yildiz') {
    // Yıldızın merkezinde sıcak altın çekirdek halkası
    g.strokeStyle = 'rgba(255,248,180,0.75)'; g.lineWidth = 0.032;
    g.beginPath(); g.arc(0, 0.02, 0.2, 0, 6.283); g.stroke();
  }
}

/* bolum2.js – Bölüm 2 "Yıldız Gölü" yerleşimi (zemin ızgarası + nesneler). Sözleşme: src/BOLUM2.md. Yalnız VERİ üretir.
   Bölüm 1 bolum.js ile aynı adlar/biçim (ROWS COLS grid ground plat topOf cell yuzey nx nesne BOLUM FLOWERS TREE).
   Izgara: 0 boş · 1 zemin · 2 üstten geçilen dal. Satır 0 en üst. Bir kare T=40 birim. Ana yol h=4 (yüzey y=720).
   Fizik payları (Bölüm 1 ile aynı): tek zıplama ≈121 birim (3 kare) yukarı, ≈157 birim ileri; çift zıplama ≈217; minder 1080 → ≈265.
   Tasarım kuralları (5 yaş): taşlar geniş (132) ve 168 aralıkta (boşluk ≈ 36; QA: geç zıplayan da geçer), komşu taşlar arası yükselti ≤ 1 kare;
   düşülebilen yerler yalnız göller (Pırıl geri taşır); basamaklar ≤ 2 kare; çift zıplama GEREKMEZ (yüksek yıldızlar isteğe bağlı).
   Akış (≈440 sütun): 1 Işık Ağacı Patikası → 2 Kıyı → 3 Yıldız Gölü I (taş zinciri, yüzen ada, yükselen taşlar, ikinci ada) →
   4 Pofuduk Kıyısı (uykucular, şarkı 1) → 5 Yıldız Gölü II (ada + minder, ikinci ada) → 6 Şarkı kıyısı 2 → 7 Yıldız Kaplumbağası kıyısı.
   Gökyüzü takımyıldızı: 14 yıldızın gökteki yeri (o.gokX/o.gokY) yildiz.js'te `YL_YER` tablosundan, nesneler soldan sağa sırayla atanır. */
'use strict';
const ROWS = 30, COLS = 535;   // 22 + 8 boş alt kare (aşağıya bak)
const BL2_DY = 0, BL2_EKSTRA = 8;   // ROWS 22→30: zemin altına 8 kare daha (oyun.js kamera alt sınırı ROWS'a bağlı; göl kadrajı için kamera aşağı inebilsin). Yüzey yüksekliği (y=720) değişmez.
const grid = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
const ground = (a, b, h) => { for (let x = a; x <= b; x++) for (let y = ROWS - h - BL2_EKSTRA; y < ROWS; y++) grid[y][x] = 1; };
const plat = (a, b, row) => { for (let x = a; x <= b; x++) grid[row][x] = 2; };
const topOf = c => { for (let y = 0; y < ROWS; y++) if (grid[y][c] === 1) return y; return ROWS; };
const cell = (tx, ty) => (tx < 0 || tx >= COLS) ? 1 : (ty < 0 || ty >= ROWS) ? 0 : grid[ty][tx];
const yuzey = c => topOf(Math.floor(c)) * T;
const nx = c => c * T + T / 2;
function nesne(tip, c, y, o = {}) { const n = Object.assign({ tip, x: nx(c), y, id: tip + NESNELER.length }, o); NESNELER.push(n); return n; }
const blDal = row => row * T;

// ── Zemin profili: [ilk sütun, son sütun, yükseklik] ──
const BL2_ZEMIN = [
  // 1. Işık Ağacı Patikası (0–52): geniş, düz, güvenli; küçük bir tümsek (ilk yıldız tepede)
  [0, 1, 9], [2, 3, 6], [4, 23, 4], [24, 27, 5], [28, 32, 6], [33, 36, 5], [37, 52, 4],
  // 2. Kıyı (53–72): iki küçük basamak, sonra göle iniş
  [53, 60, 4], [61, 67, 5], [68, 72, 4],
  // 3. Yıldız Gölü I = sütun 73–144 (taşlar ve adalar; zemin yok)
  // 4. Pofuduk Kıyısı (145–216): çukurlarda uykucular, tümsek, dal + minder, şarkı düzlüğü
  [150, 157, 4], [158, 161, 5], [162, 169, 4], [170, 177, 5], [178, 182, 6], [183, 186, 5], [187, 196, 4], [197, 200, 5], [201, 208, 4], [209, 212, 5], [213, 216, 4],
  // 5. Yıldız Gölü II = sütun 217–283
  // 6. Şarkı kıyısı 2 (284–331): ikinci şarkı düzlüğü, çukurda uykucu
  [288, 299, 4], [300, 303, 5], [304, 311, 4], [312, 315, 5], [316, 331, 4],
  // 7a. Yıldız Çayırı (332–395): ikinci uykucu çukuru, tümsekler, tohumlar
  [332, 347, 4], [348, 353, 5], [354, 359, 6], [360, 365, 5], [366, 381, 4], [382, 389, 3], [390, 395, 4],
  // 7b. Yıldız Gölü III = sütun 396–426 (kısa: taşlar + küçük ada)
  // 8. Yıldız Kaplumbağası kıyısı (427–534): tümsekler, yuva çukuru; en sonda yüksek "Yıldız Tepesi"
  [427, 432, 5], [433, 438, 6], [439, 444, 5], [445, 480, 4], [481, 493, 4], [494, 509, 3], [510, 534, 12],
];
for (const [a, b, h] of BL2_ZEMIN) ground(a, b, h);
// ── Dallar (üstten geçilir): [ilk, son, satır] ──
const BL2_DAL = [
  [360, 365, 15],                  // Yıldız Çayırı: alçak gizli dal (2 kare), üstünde tohumlar
  [171, 177, 13],                  // Pofuduk Kıyısı: minderin tam üstündeki dal (üstünde isteğe bağlı yıldız)
];
for (const [a, b, r] of BL2_DAL) plat(a, b, r);

const BL2_SU = (22 - 4) * T + 10;   // göl yüzeyi y=730
const BL2_X0 = 73 * T, BL2_X1 = 150 * T;       // Yıldız Gölü I
const BL2_Y0 = 217 * T, BL2_Y1 = 288 * T;      // Yıldız Gölü II
const BOLUM = {
  ad: 'Yıldız Gölü',
  baslangic: { x: nx(6), y: yuzey(6) },
  bolgeler: [
    { ad: 'patika', x0: 0, x1: 53 * T },
    { ad: 'goletKiyi', x0: 53 * T, x1: 73 * T },
    { ad: 'yildizGol', x0: BL2_X0, x1: BL2_X1 },
    { ad: 'pofuduk', x0: 150 * T, x1: 217 * T },
    { ad: 'yildizGol', x0: BL2_Y0, x1: BL2_Y1 },
    { ad: 'pofuduk', x0: 288 * T, x1: 396 * T },
    { ad: 'yildizGol', x0: 396 * T, x1: 427 * T },
    { ad: 'hayvan', x0: 427 * T, x1: COLS * T },
  ],
  gol: { x0: BL2_X0, x1: BL2_X1, su: BL2_SU, ada: null },
  gollar: null,
  yildizHayvan: { x: nx(502), y: (22 - 3) * T },
  kamera: [
    { x0: 0, x1: 18 * T, zoom: 1.06 },
    { x0: 66 * T, x1: 152 * T, zoom: 0.82, yOfs: 100 },        // göl I: geniş, taşlar + gökyüzü
    { x0: 154 * T, x1: 215 * T, zoom: 0.9, yOfs: -20 },
    { x0: 217 * T, x1: 290 * T, zoom: 0.8, yOfs: 100 },         // göl II: yüksek taş + ada
    { x0: 291 * T, x1: 330 * T, zoom: 0.9, yOfs: -20 },
    { x0: 396 * T, x1: 426 * T, zoom: 0.82, yOfs: 100 },       // göl III
    { x0: 476 * T, x1: COLS * T, zoom: 0.72, yOfs: -110 },    // kaplumbağa + yüksek tepe birlikte
  ],
};
BOLUM.gollar = [BOLUM.gol, { x0: BL2_Y0, x1: BL2_Y1, su: BL2_SU, ada: null }, { x0: 396 * T, x1: 427 * T, su: BL2_SU, ada: null }];
P.x = P.safeX = BOLUM.baslangic.x; P.y = P.safeY = BOLUM.baslangic.y;
D.x = P.x - 40; D.y = P.y - 100;

const blSoz = (c, anahtar, r, gecC, konu) => nesne('konusma', c, yuzey(c), { anahtar, r, gec: nx(gecC), konu: konu || null });
const bl2X = (x, tip, y, o) => nesne(tip, Math.floor(x / T), y + BL2_DY, Object.assign({ x }, o || {}));   // dünya x ile yerleştir

// ── Nesneler (soldan sağa) ──
// 1. Patika: ilk (sönük) yıldız tümseğin tepesinde bir su birikintisinde
const blYil1 = nesne('yildiz', 11.5, yuzey(11) - 34, { r: 54, birikinti: true });   // ilk ekranda (yatay ve dikey iPad) görünür: başlangıç sütun 6, yıldız ~220 birim sağda
blSoz(8, 'y_yildiz', 60, 13, blYil1);
// 2. Kıyı: göl girişi cümlesi, kıyıda ikinci yıldız
blSoz(62, 'y_gol', 80, 74);
nesne('yildiz', 66.5, yuzey(66) - 34, { r: 54, birikinti: true });
// 3. Yıldız Gölü I — zincirler: a (kıyıdan ada A'ya), b (ada A'dan ada B'ye), c (ada B'den karşı kıyıya).
// Taşlar 132 geniş, merkezler 168 aralıkta (boşluk ≈ 36; tek zıplama ≈ 165 ileri) → geç zıplayan çocuk da bir sonraki taşa iner (QA ölçümü).
// Taşlar 132 geniş; iki sabit kenar (L: öncekinin sağ kenarı, R: sonrakinin sol kenarı) arasına eşit boşlukla (≈12-24 birim) dizilir (kolay atlama: ≤1 kare yükselti, çift zıplama yok).
const blAr = (L, R, n) => { const gp = (R - L - 132 * n) / (n + 1); return { gp, xs: Array.from({ length: n }, (_, i) => L + gp + 66 + i * (132 + gp)) }; };
const blZ = (zincir, L, R, ys) => { const a = blAr(L, R, ys.length); a.xs.forEach((x, i) => bl2X(x, 'yildizTasi', ys[i], { zincir, sira: i })); return a.xs; };
blZ('a', 2920, 4165, [716, 710, 704, 708, 712, 708, 704, 700]);
bl2X(4308, 'yildizAda', 700, { w: 300, zincir: 'adaA' });
blZ('b', 4451, 5187, [690, 680, 670, 660, 650]);
bl2X(5350, 'yildizAda', 640, { w: 340, zincir: 'adaB' });
const blXc = blZ('c', 5513, 6000, [664, 688, 712]);
bl2X(3542, 'yildiz', 662, { r: 70 });                       // taş 3 ile 4 arası, suyun üstü
bl2X(4308, 'yildiz', 640, { r: 66 });                       // ada A'nın ortası
bl2X(5161, 'yildiz', 596, { r: 70 });                       // ada B'ye geçerken
bl2X(5420, 'yildiz', 592, { r: 66 });        // yüksek taşın üstü
// 4. Pofuduk Kıyısı
const blPofA = nesne('pofuduk', 165.5, yuzey(165), { tur: 'yol' });
blSoz(158, 'y_pofuduk', 70, 166, blPofA);
nesne('pofuduk', 174.5, yuzey(174), { tur: 'minder' });
nesne('yildiz', 174.5, blDal(13) - 40, { r: 60, secmeli: true });
nesne('yildiz', 180.5, yuzey(180) - 34, { r: 54, birikinti: true });
const blTakim1 = nesne('takim', 191.5, yuzey(191), { sekil: 0 });
nesne('miniKapi', 191.5 + 4.75, yuzey(196), { bagId: blTakim1.id, stil: 'takim' });   // takımyıldızı bitene kadar ilerisi kapalı (kapi.js)   // Takımyıldızı çiz 1: kıyıda, 4 nokta (takim.js)
nesne('pofuduk', 204.5, yuzey(204), { tur: 'yol' });
// 5. Yıldız Gölü II
blZ('d', 8680, 9616, [708, 704, 700, 696, 692, 690]);
bl2X(9769, 'yildizAda', 690, { w: 320, zincir: 'adaC' });
bl2X(9850, 'yildiz', 642, { r: 66 });
blZ('e', 9922, 10877, [692, 694, 696, 698, 700, 700]);
bl2X(10474, 'yildiz', 644, { r: 70 });
bl2X(11040, 'yildizAda', 700, { w: 340, zincir: 'adaD' });
bl2X(11040, 'yildiz', 648, { r: 66 });
blZ('f', 11203, 11520, [706, 714]);
const blTakim2 = bl2X(9700, 'takim', 690, { sekil: 1 });
bl2X(9900, 'miniKapi', 690, { bagId: blTakim2.id, stil: 'takim' });   // Takımyıldızı çiz 2: ada C üstünde, 6 nokta (kuğu)
// 6. Şarkı kıyısı 2
const blTakim3 = nesne('takim', 298.5, yuzey(298), { sekil: 2 });
nesne('miniKapi', 298.5 + 4.75, yuzey(303), { bagId: blTakim3.id, stil: 'takim' });   // Takımyıldızı çiz 3: kıyıda, 7 nokta (kaplumbağa)
nesne('pofuduk', 307.5, yuzey(307), { tur: 'yol' });
nesne('pofuduk', 322, yuzey(322), { tur: 'basamak' });
nesne('tohum', 350.5, yuzey(350) - 20, { r: 44 });
nesne('tohum', 357, yuzey(357) - 20, { r: 44 });
nesne('pofuduk', 379, yuzey(379), { tur: 'basamak' });
// Yıldız taşı bulmacası: yerden 1,5 kare yüksekte üç taş; üçüne de basınca ışık gösterisi
[368, 371.5, 375].forEach((c, i) => bl2X(c * T + 20, 'yildizTasi', 668, { zincir: 'bulmaca', sira: i, hep: true }));
nesne('yildizBulmaca', 371, 0, { zincir: 'bulmaca' });
nesne('pofuduk', 385.5, yuzey(385), { tur: 'yol' });
// 7b. Yıldız Gölü III
const blXg = blZ('g', 15840, 16297, [710, 706, 702]);
bl2X(16460, 'yildizAda', 700, { w: 340, zincir: 'adaE' });
bl2X(16460, 'tohum', 650, { r: 56 });
blZ('h', 16623, 17080, [702, 706, 710]);
bl2X(16224, 'tohum', 650, { r: 56 });
// 8. Yıldız Kaplumbağası kıyısı: üç büyük yıldız (kaplumbağanın sırtındaki üç noktayı yakar)
const blHayvanSoz = blSoz(479, 'y_hayvan', 60, 495);
nesne('yildiz', 435.5, yuzey(435) - 34, { r: 54, buyukIcin: true, nok: 0 });
nesne('yildiz', 462.5, yuzey(462) - 34, { r: 54, buyukIcin: true, nok: 1 });
nesne('yildiz', 486, yuzey(486) - 34, { r: 54, buyukIcin: true, nok: 2 });
nesne('yildizBas', 496.5, yuzey(496), {});
blHayvanSoz.konu = nesne('yildizHayvan', 502, yuzey(502), {});


// ── Süsler: suda sıçrayan yıldız balıkları, süzülen ışık balonları (yalnız güzellik; sayaçlara girmez) ──
for (const x of [3400, 3900, 4700, 5000, 5700, 8900, 9300, 10200, 10600, 11300, 16100, 16400, 16900]) bl2X(x, 'yildizBalik', 730, {});
for (const c of [14, 40, 56, 156, 186, 212, 296, 316, 340, 362, 376, 392, 440, 470]) nesne('isikBalon', c, yuzey(c), { h: 130 + (c * 7) % 70 });


// ── Sürprizler (hepsi 5 yaş için güvenli, isteğe bağlı): yüzen tohum yolları, balon geçidi, gizli dal ──
for (let i = 0; i < 5; i++) bl2X(5560 + i * 94, 'tohum', 590 - Math.sin(i / 4 * Math.PI) * 50, { r: 46 });      // göl I: üçüncü zincirin üstünde yay
for (let i = 0; i < 4; i++) bl2X(blXg[0] + i * 110, 'tohum', 640 - Math.sin(i / 3 * Math.PI) * 40, { r: 46 });    // göl III: zincir üstünde yay
nesne('tohum', 362, blDal(15) - 24, { r: 46 }); nesne('tohum', 364, blDal(15) - 24, { r: 46 });                  // gizli dal
for (const c of [341, 343, 345, 347]) nesne('isikBalon', c, yuzey(c), { h: 170 + (c % 3) * 22 });               // balon geçidi

// Ritim sürprizleri (güvenli, isteğe bağlı): patikada tohum yayı + balon geçidi
for (let i = 0; i < 5; i++) nesne('tohum', 40 + i * 1.8, yuzey(40) - 40 - Math.sin(i / 4 * Math.PI) * 70, { r: 46 });
for (const c of [29, 31, 33]) nesne('isikBalon', c, yuzey(c), { h: 150 + (c % 3) * 22 });
const FLOWERS = [];
const TREE = null;

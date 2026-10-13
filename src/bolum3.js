/* bolum3.js – Bölüm 3 "Bulut Ülkesi" yerleşimi (zemin ızgarası + nesneler). Sözleşme: src/BOLUM3.md. Yalnız VERİ üretir (LEVEL3, önek bl3).
   Bölüm 1/2 ile aynı adlar/biçim (ROWS COLS grid ground plat topOf cell yuzey nx nesne BOLUM FLOWERS TREE).
   Izgara: 0 boş (bulutların altı: boşluk, düşen Feza'yı Pırıl geri taşır) · 1 yumuşak bulut zemin · 2 üstten geçilen ince bulut.
   Satır 0 en üst, bir kare T=40. Ana yol h=4 (yüzey y=720); h=5 → 680, 6 → 640, 7 → 600, 8 → 560, 9 → 520.
   Fizik payları: tek zıplama ≈121 birim (3 kare) yukarı / ≈157 ileri. Tasarım (5 yaş): ana yolda basamaklar ≤ 2 kare (yüksek duvarları
   esinti taşır), boşluklar ≤ 2 kare (yüzen bulutlu yerler hariç: bulut kenardan kenara gider, uçlarda bekler), çift zıplama GEREKMEZ.
   Akış (≈524 sütun, ≈5-7 dk): 1 Pembe Bulutlar (0–56: zıplatan bulutlar, boing zinciri) → 1b Gökyüzü Merdiveni (57–92: zıplatan bulutlarla
   göğe basamaklar) → 2 Kuzucuk Çayırı (93–175: bulut mağarasında saklı kuzucuk + asansör bulutu, yüzen bulut) → 2b Uykucu Bulut Kuşu (176–189) →
   3 Rüzgâr Yolu (190–268: esintiler, yüzen bulut, rüzgâr kuyusu, uçurtmalar) → 3b Tüy Köprüsü (269–284) → 4 Bulut Şekilleri (285–317) →
   5 Büyük Boşluk (318–453: kapı 326 + Pırıl'ın sırtında uçuş) → 6 Gökkuşağı Tepesi (454–523: 7. kuzucuk, tepe, gökkuşağı kaydırağı).
   Platform türlerimde (bulutZip, bulutYuzen, bulutKopru) nesnenin y'si ÜST YÜZEYDİR (kur() alt kenara çevirir); esinti için y = sütunun dibi. */
'use strict';
const ROWS = 30, COLS = 524;
const BL3_EKSTRA = 8;   // yüzeyin altında 8 kare daha bulut (kamera alt sınırı ROWS'a bağlı)
const grid = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
const ground = (a, b, h) => { for (let x = a; x <= b; x++) for (let y = ROWS - h - BL3_EKSTRA; y < ROWS; y++) grid[y][x] = 1; };
const plat = (a, b, row) => { for (let x = a; x <= b; x++) grid[row][x] = 2; };
const topOf = c => { for (let y = 0; y < ROWS; y++) if (grid[y][c] === 1) return y; return ROWS; };
const cell = (tx, ty) => (tx < 0 || tx >= COLS) ? 1 : (ty < 0 || ty >= ROWS) ? 0 : grid[ty][tx];
const yuzey = c => topOf(Math.floor(c)) * T;
const nx = c => c * T + T / 2;
function nesne(tip, c, y, o = {}) { const n = Object.assign({ tip, x: nx(c), y, id: tip + NESNELER.length }, o); NESNELER.push(n); return n; }
const bl3H = h => (22 - h) * T;   // h yüksekliğindeki zeminin yüzey y'si
const bl3Sat = row => row * T;   // ince bulutun (ızgara 2) üst y'si

// Bölüm sütunları: ilk taslak (458 sütun) bölgelerine yeni anlar eklendi; bl3K(c) eski sütunu yeni yerine taşır.
//   Eklenen aralıklar: 57–92 "Gökyüzü Merdiveni" · 176–189 "Uykucu Bulut Kuşu" geçidi · 269–284 "Tüy Köprüsü".
const bl3K = c => c + (c >= 219 ? 66 : c >= 140 ? 50 : c >= 57 ? 36 : 0);
const bl3Z = (a, b, h) => ground(bl3K(a), bl3K(b), h);
const bl3Blok = (a, b, r0, r1) => { for (let x = a; x <= b; x++) for (let y = r0; y <= r1; y++) grid[y][x] = 1; };   // havada duran bulut kütlesi (mağara tavanı)

// ── Zemin profili ──
// 1. Pembe Bulutlar (0–56): uyanış bulutu, düzlük; 21–23, 27–28, 31–32 çukurlarında yüzey hizasında zıplatan bulutlar ("boing" zinciri); 45–46 küçük boşluk
for (const [a, b, h] of [[0, 2, 8], [3, 20, 4], [24, 26, 4], [29, 30, 4], [33, 34, 4], [35, 38, 5], [39, 44, 4], [47, 56, 4]]) bl3Z(a, b, h);
// 1b. Gökyüzü Merdiveni (57–92): altta düz yol; zıplatan bulutlarla basamak basamak göğe çıkan ince bulutlar (isteğe bağlı, tohumlar)
ground(57, 73, 4); ground(74, 77, 5); ground(78, 92, 4);
// 2. Kuzucuk Çayırı (93–175): 119–120 küçük boşluk; 133–142 platoda BULUT MAĞARASI (içinde kuzucuk; tavanı üst yol), 143–144 asansör çukuru;
//    153–159 yüzen bulutlu boşluk
for (const [a, b, h] of [[57, 68, 5], [69, 82, 4], [85, 92, 4], [93, 96, 5], [97, 106, 6], [109, 112, 5], [113, 116, 4], [124, 139, 4]]) bl3Z(a, b, h);
ground(bl3K(107), bl3K(108), 5);                       // mağara çıkışındaki çukur: asansör bulutu burada dinlenir (yüzeyi platoyla aynı hizada)
bl3Blok(bl3K(99), bl3K(106), 12, 13);                  // mağara tavanı (alt yüzü y=560; içeride 80 birim boşluk), üstü y=480 yürünür
// 2b. 176–189: geniş boşluk; uykucu bulut kuşu Feza'yı sırtında karşıya taşır
// 3. Rüzgâr Yolu (190–268): esinti → yüksek düzlük → yüzen bulut → esinti → bulut adası → iniş → rüzgâr kuyusu (265–268)
for (const [a, b, h] of [[140, 150, 4], [151, 162, 8], [163, 170, 6], [177, 186, 6], [187, 194, 4], [195, 204, 9], [205, 208, 7], [209, 214, 5]]) bl3Z(a, b, h);
// 3b. Tüy Köprüsü (269–284): rüzgârda salınan üç dev tüy (yüzen platform), uçurtmalar
ground(269, 272, 4);
// 4. Bulut Şekilleri (285–317) · Büyük Boşluk kıyısı (318–330, kapı 326) · 5. uçuş (331–453, zemin yok)
for (const [a, b, h] of [[219, 235, 4], [236, 239, 5], [240, 264, 4]]) bl3Z(a, b, h);
// 6. Gökkuşağı Tepesi (454–523): iniş çayırı, basamaklar, tepe (h=9, 487–499), kaydırak inişi
for (const [a, b, h] of [[388, 402, 4], [403, 407, 5], [408, 412, 6], [413, 416, 7], [417, 420, 8], [421, 433, 9], [434, 437, 7], [438, 441, 5], [442, 457, 4]]) bl3Z(a, b, h);
// ── İnce bulutlar (üstten geçilir) — isteğe bağlı sürpriz yerleri ──
for (const [a, b, r] of [[42, 47, 12], [126, 129, 15], [132, 136, 13], [229, 232, 15]]) plat(bl3K(a), bl3K(b), r);
for (const [a, b, r] of [[62, 66, 14], [68, 72, 11], [74, 80, 8], [83, 87, 12]]) plat(a, b, r);   // Gökyüzü Merdiveni basamakları (560 → 440 → 320, iniş 480)

// ── Gökkuşağı Tepesi geometrisi (bulut.js 'gokkusagi' okur): tepe üstü y=520; yay merkezi (cx, cy), dış yarıçap R ──
const BL3_TEPE = { c: bl3K(427), y: bl3H(9) };
const BL3_YAY = { cx: nx(bl3K(428.5)), cy: bl3H(9) - 86 + 600, R: 600, bant: 15 };   // tepe: yayın en üstü Feza'nın ~86 birim üstünde
const BL3_UCUS = { x0: nx(bl3K(260)), x1: bl3K(389) * T, yUst: 120, yAlt: 700 };

const BOLUM = {
  ad: 'Bulut Ülkesi',
  baslangic: { x: nx(6), y: yuzey(6) },
  bolgeler: [
    { ad: 'pembeBulut', x0: 0, x1: 93 * T },
    { ad: 'kuzuCayir', x0: 93 * T, x1: 190 * T },
    { ad: 'ruzgar', x0: 190 * T, x1: 285 * T },
    { ad: 'sekil', x0: 285 * T, x1: 318 * T },
    { ad: 'bosluk', x0: 318 * T, x1: 331 * T },
    { ad: 'ucus', x0: 331 * T, x1: 454 * T },
    { ad: 'tepe', x0: 454 * T, x1: COLS * T },
  ],
  gol: null,
  gollar: [],
  gokkusagi: { x: BL3_YAY.cx, y: BL3_TEPE.y, cx: BL3_YAY.cx, cy: BL3_YAY.cy, R: BL3_YAY.R },
  ucus: BL3_UCUS,
  kamera: [
    { x0: 0, x1: 18 * T, zoom: 1.06 },
    { x0: 40 * T, x1: 50 * T, zoom: 0.92, yOfs: -40 },            // yüksek pembe bulut görünsün
    { x0: 60 * T, x1: 86 * T, zoom: 0.78, yOfs: -150 },           // Gökyüzü Merdiveni: basamaklar göğe doğru görünsün
    { x0: 129 * T, x1: 145 * T, zoom: 0.9, yOfs: -40 },           // bulut mağarası + üst yol
    { x0: 174 * T, x1: 192 * T, zoom: 0.82, yOfs: 10 },           // bulut kuşu geçidi: karşı kıyı görünsün
    { x0: 193 * T, x1: 212 * T, zoom: 0.88, yOfs: -50 },          // esinti 1 + yüksek düzlük
    { x0: 236 * T, x1: 254 * T, zoom: 0.86, yOfs: -60 },          // esinti 2 + bulut adası
    { x0: 268 * T, x1: 286 * T, zoom: 0.84, yOfs: 0 },            // tüy köprüsü
    { x0: 320 * T, x1: 332 * T, zoom: 0.86, yOfs: -40 },          // Büyük Boşluk'un kıyısı: geniş gökyüzü
    { x0: 466 * T, x1: COLS * T, zoom: 0.8, yOfs: -60 },          // tepe + gökkuşağı
  ],
};
P.x = P.safeX = BOLUM.baslangic.x; P.y = P.safeY = BOLUM.baslangic.y;
D.x = P.x - 40; D.y = P.y - 100;

const bl3Soz = (c, anahtar, r, gecC, konu) => nesne('konusma', c, yuzey(c), { anahtar, r, gec: nx(gecC), konu: konu || null });
const bl3X = (x, tip, y, o) => nesne(tip, Math.floor(x / T), y, Object.assign({ x }, o || {}));   // dünya x ile yerleştir
const bl3Kuzu = (c, y) => nesne('kuzu', c, y === undefined ? yuzey(c) : y, {});

// ════════ 1. Pembe Bulutlar ════════
bl3Soz(7, 'b_giris', 80, 12);
bl3Soz(15, 'b_zip', 70, 23);
bl3X(nx(22), 'bulutZip', bl3H(4), { w: 120, h: 30, guc: 900, gom: true });          // çukurda, zeminle aynı hizada: üstünden geçerken kendiliğinden "boing"
bl3X(nx(41), 'bulutZip', bl3H(4) - 18, { w: 104, guc: 1040 });               // yüksek pembe buluta çıkaran (alçak: üstünden yürüyünce de zıplatır)
for (let i = 0; i < 3; i++) nesne('tohum', 43.5 + i * 1.6, bl3Sat(12) - 34 - Math.sin(i / 2 * Math.PI) * 26, { r: 46 });
for (const c of [27.5, 31.5]) bl3X(nx(c), 'bulutZip', bl3H(4), { w: 80, h: 30, guc: 860, gom: true });   // boing zinciri: iki küçük çukur, üstünden yürüyünce sek sek
for (let i = 0; i < 4; i++) nesne('tohum', 26.5 + i * 2, yuzey(24) - 90 - Math.sin(i / 3 * Math.PI) * 40, { r: 44 });   // zincirin sekmelerinde

// ════════ 1b. Gökyüzü Merdiveni ════════
// Yolda alçak zıplatan bulut → 560'taki basamak → ucundaki zıplatan bulut → 440 → zıplatan bulut → 320 (tepe: tohum yayı + uçurtma).
// Hepsi kendiliğinden (yürüyünce zıplatır); istemeyen alttan düz yolda devam eder; tepeden 480'deki bulut basamağına ya da yola iner.
bl3X(nx(60), 'bulutZip', bl3H(4) - 18, { w: 96, guc: 1000 });
bl3X(nx(66), 'bulutZip', bl3Sat(14) - 18, { w: 80, guc: 980 });
bl3X(nx(72), 'bulutZip', bl3Sat(11) - 18, { w: 80, guc: 980 });
for (let i = 0; i < 5; i++) nesne('tohum', 74.6 + i * 1.4, bl3Sat(8) - 40 - Math.sin(i / 4 * Math.PI) * 40, { r: 44 });
nesne('tohum', 64, bl3Sat(14) - 40, { r: 44 }); nesne('tohum', 70, bl3Sat(11) - 40, { r: 44 });
nesne('ucurtma', 81, bl3Sat(8), { ip: 160, renk: 1 });

// ════════ 2. Kuzucuk Çayırı ════════
const bl3K1 = bl3Kuzu(bl3K(75));
bl3Soz(bl3K(63), 'b_kuzu', 80, bl3K(76), bl3K1);
bl3Kuzu(bl3K(103), bl3H(6));                                                      // BULUT MAĞARASINDA saklı (tavanın altında; yol içinden geçer)
// mağaranın çıkışındaki çukurda asansör bulutu: dinlenirken yüzeyi plato hizasında (üstünden yürünür), kalkınca tavana (üst yol) çıkar
bl3X(bl3K(107) * T + 40, 'bulutYuzen', bl3H(6), { w: 80, ay: 172, sure: 6.5 });
for (let i = 0; i < 4; i++) nesne('tohum', bl3K(100) + i * 1.8, bl3Sat(12) - 36, { r: 44 });   // mağara tavanında (üst yol)
bl3X(bl3K(117) * T + 80, 'bulutYuzen', bl3H(4), { w: 160, ax: 120, sure: 5.2 });       // boşluk: kenardan kenara (uçlarda bekler)
bl3X(nx(bl3K(126.5)), 'bulutZip', bl3H(4) - 18, { w: 96, guc: 980 });               // basamak bulutlarına (isteğe bağlı)
nesne('tohum', bl3K(134), bl3Sat(13) - 30, { r: 46 });
bl3Kuzu(bl3K(131));
// 2b. Uykucu bulut kuşu (176–189 boşluğu): Feza sırtına basınca uyanır, karşıya uçar, Feza inince geri döner
bl3X(176 * T + 85, 'bulutKus', bl3H(4), { w: 170, ax: 14 * T - 170, ay: 70, sure: 5.5 });
nesne('tohum', 183, bl3H(4) - 150, { r: 50 });                                   // uçuşun ortasında (kuşun sırtından alınır)

// ════════ 3. Rüzgâr Yolu ════════
bl3Soz(bl3K(141), 'b_esinti', 80, bl3K(149));
bl3X(bl3K(151) * T - 55, 'esinti', bl3H(4), { w: 110, h: 250 });                 // yüksek düzlüğe taşır (duvar 4 kare; sütun duvara dayalı)
nesne('tohum', bl3K(149.1), bl3H(4) - 150, { r: 44 }); nesne('tohum', bl3K(149.1), bl3H(4) - 215, { r: 44 });   // esintide süzülürken
bl3Kuzu(bl3K(157));
bl3X(bl3K(171) * T + 70, 'bulutYuzen', bl3H(6), { w: 140, ax: 100, sure: 4.8 });   // yüzen bulutlu boşluk
bl3X(bl3K(195) * T - 55, 'esinti', bl3H(4), { w: 110, h: 290 });                 // bulut adasına taşır (duvara dayalı)
bl3Kuzu(bl3K(200));
bl3X(bl3K(217) * T, 'esinti', bl3H(4) + 100, { w: 160, h: 300, kuyu: true });     // rüzgâr kuyusu
nesne('ucurtma', bl3K(145), bl3H(4), { ip: 250, renk: 0 });
nesne('ucurtma', bl3K(166), bl3H(6), { ip: 210, renk: 1 });
nesne('ucurtma', bl3K(182), bl3H(6), { ip: 260, renk: 2 });
nesne('ucurtma', bl3K(211), bl3H(5), { ip: 230, renk: 3 });
nesne('tohum', bl3K(217), bl3H(4) - 150, { r: 46 });                             // kuyunun üstünde süzülürken
// 3b. Tüy Köprüsü: üç dev tüy rüzgârda salınır; üstlerinden yürüyerek geçilir (basınca esneyip ışıldar)
for (let i = 0; i < 3; i++) bl3X(273 * T + 83 + i * 157, 'bulutYuzen', bl3H(4), { w: 160, sure: 3.4, faz: i * 0.33, gorunum: 'tuy', renk: i });   // yüzey yolla aynı hizada, aralar ≈9 birim (yürünür); salınım yalnız görsel
nesne('ucurtma', 270, bl3H(4), { ip: 280, renk: 2 }); nesne('ucurtma', 286, bl3H(4), { ip: 240, renk: 0 });
for (let i = 0; i < 3; i++) nesne('tohum', 275 + i * 4, bl3H(4) - 110 - (i % 2) * 30, { r: 46 });

// ════════ 4. Bulut Şekilleri ════════
nesne('bulutSekil', bl3K(225), yuzey(bl3K(225)), { sira: 0 });
nesne('tohum', bl3K(230.5), bl3Sat(15) - 30, { r: 46 });
bl3Kuzu(bl3K(237.5));                                                             // tümseğin üstünde
nesne('bulutSekil', bl3K(248), yuzey(bl3K(248)), { sira: 1 });

// ════════ 5. Büyük Boşluk → uçuş ════════
const bl3Kapi = nesne('ucusKapisi', bl3K(260), yuzey(bl3K(260)), { x1: BL3_UCUS.x1, yUst: BL3_UCUS.yUst, yAlt: BL3_UCUS.yAlt });
// Yedek köprü: ucus.js'in türü YOKSA (yalnız o zaman) boşluğun üstünde bulut basamakları (bulut.js 'bulutKopru')
for (let x = bl3K(265) * T + 70, i = 0; x < bl3K(388) * T; x += 136, i++) bl3X(x, 'bulutKopru', bl3H(4), { w: 150, sira: i });   // bitişik, düz

// ════════ 6. Gökkuşağı Tepesi ════════
bl3Kuzu(bl3K(396));
nesne('tohum', bl3K(392), yuzey(bl3K(392)) - 70, { r: 46 });
bl3Soz(bl3K(401), 'b_tepe', 80, bl3K(418));
bl3X(nx(bl3K(405)), 'bulutZip', bl3H(5) - 18, { w: 96, guc: 980 });             // tepeye kısa yol (isteğe bağlı)
nesne('gokkusagi', BL3_TEPE.c, BL3_TEPE.y, { x: BL3_YAY.cx, cx: BL3_YAY.cx, cy: BL3_YAY.cy, R: BL3_YAY.R, bant: BL3_YAY.bant, tepeX0: nx(bl3K(421)) - 20, tepeX1: nx(bl3K(433)) + 20 });

// ── Süsler (yalnız güzellik; sayaçlara girmez) ──
for (const [c, y, n] of [[30, 260, 5], [78, 120, 6], [154, 200, 7], [255, 150, 6], [366, 180, 8], [426, 240, 5], [481, 150, 6]]) nesne('kusSuru', c, y, { n });
for (const c of [10, 33, 88, 124, 156, 211, 266, 278, 296, 336, 396, 461, 512]) nesne('tuy', c, yuzey(Math.min(c, COLS - 1)) - 120 - (c * 13) % 90, {});
const FLOWERS = [];
const TREE = null;

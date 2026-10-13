/* bolum3.js – Bölüm 3 "Bulut Ülkesi" yerleşimi (zemin ızgarası + nesneler). Sözleşme: src/BOLUM3.md. Yalnız VERİ üretir (LEVEL3, önek bl3).
   Bölüm 1/2 ile aynı adlar/biçim (ROWS COLS grid ground plat topOf cell yuzey nx nesne BOLUM FLOWERS TREE).
   Izgara: 0 boş (bulutların altı: boşluk, düşen Feza'yı Pırıl geri taşır) · 1 yumuşak bulut zemin · 2 üstten geçilen ince bulut.
   Satır 0 en üst, bir kare T=40. Ana yol h=4 (yüzey y=720); h=5 → 680, 6 → 640, 7 → 600, 8 → 560, 9 → 520.
   Fizik payları: tek zıplama ≈121 birim (3 kare) yukarı / ≈157 ileri. Tasarım (5 yaş): ana yolda basamaklar ≤ 2 kare (yüksek duvarları
   esinti taşır), boşluklar ≤ 2 kare (yüzen bulutlu yerler hariç: bulut kenardan kenara gider, uçlarda bekler), çift zıplama GEREKMEZ.
   Akış (≈458 sütun, ≈5-7 dk): 1 Pembe Bulutlar (0–56: zıplatan bulutlar, boing zinciri) → 2 Kuzucuk Çayırı (57–139: 3 kuzucuk, yüzen bulut) →
   3 Rüzgâr Yolu (140–218: iki esinti, yüzen bulut, rüzgâr kuyusu, 2 kuzucuk, uçurtmalar) → 4 Bulut Şekilleri (219–259: 2 mini oyun, 1 kuzucuk) →
   5 Büyük Boşluk (260–387: kapı + Pırıl'ın sırtında uçuş koridoru) → 6 Gökkuşağı Tepesi (388–457: 7. kuzucuk, tepe, gökkuşağı kaydırağı).
   Platform türlerimde (bulutZip, bulutYuzen, bulutKopru) nesnenin y'si ÜST YÜZEYDİR (kur() alt kenara çevirir); esinti için y = sütunun dibi. */
'use strict';
const ROWS = 30, COLS = 458;
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

// ── Zemin profili: [ilk sütun, son sütun, yükseklik] (boş sütunlar = boşluk) ──
const BL3_ZEMIN = [
  // 1. Pembe Bulutlar (0–56): uyanış bulutu, düzlük; 21–23 çukurunda yüzeyle aynı hizada zıplatan bulut (üstünden yürüyünce "boing")
  [0, 2, 8], [3, 20, 4], [24, 26, 4], [29, 30, 4], [33, 34, 4], [35, 38, 5], [39, 44, 4], [47, 56, 4],   // 27–28, 31–32: boing zinciri · 45–46: ilk küçük boşluk
  // 2. Kuzucuk Çayırı (57–139)
  [57, 68, 5], [69, 82, 4], [85, 92, 4], [93, 96, 5], [97, 108, 6], [109, 112, 5], [113, 116, 4],   // 83–84 küçük boşluk
  [124, 139, 4],                                                                       // 117–123: yüzen bulutlu boşluk (7 kare)
  // 3. Rüzgâr Yolu (140–214): esinti → yüksek bulut düzlüğü → yüzen bulut → esinti → bulut adası → iniş basamakları
  [140, 150, 4], [151, 162, 8], [163, 170, 6], [177, 186, 6], [187, 194, 4], [195, 204, 9], [205, 208, 7], [209, 214, 5],   // 171–176 yüzen bulutlu boşluk
  // 215–218: rüzgâr kuyusu (dipte esinti: düşen Feza süzülerek karşıya geçer)
  // 4. Bulut Şekilleri (215–259): geniş düzlük, ortada küçük tümsek
  [219, 235, 4], [236, 239, 5], [240, 264, 4],
  // 5. Büyük Boşluk: 265–387 (uçuş koridoru; zemin yok)
  // 6. Gökkuşağı Tepesi (388–457): iniş çayırı, basamaklar, tepe (h=9), kaydırak inişi
  [388, 402, 4], [403, 407, 5], [408, 412, 6], [413, 416, 7], [417, 420, 8], [421, 433, 9], [434, 437, 7], [438, 441, 5], [442, 457, 4],
];
for (const [a, b, h] of BL3_ZEMIN) ground(a, b, h);
// ── İnce bulutlar (üstten geçilir): [ilk, son, satır] — hepsi isteğe bağlı sürpriz yerleri ──
const BL3_INCE = [
  [42, 47, 12],     // Pembe: zıplatan bulutla çıkılan yüksek pembe bulut (tohumlar)
  [126, 129, 15],   // Çayır: basamak bulutları (2 kare + 2 kare)
  [132, 136, 13],
  [229, 232, 15],   // Şekiller: iki mini oyunun arasında alçak bulut (tohum)
];
for (const [a, b, r] of BL3_INCE) plat(a, b, r);

// ── Gökkuşağı Tepesi geometrisi (bulut.js 'gokkusagi' okur): tepe üstü y=520; yay merkezi (cx, cy), dış yarıçap R ──
const BL3_TEPE = { c: 427, y: bl3H(9) };
const BL3_YAY = { cx: nx(428.5), cy: bl3H(9) - 86 + 600, R: 600, bant: 15 };   // tepe: yayın en üstü Feza'nın ~86 birim üstünde
const BL3_UCUS = { x0: nx(260), x1: 389 * T, yUst: 120, yAlt: 700 };

const BOLUM = {
  ad: 'Bulut Ülkesi',
  baslangic: { x: nx(6), y: yuzey(6) },
  bolgeler: [
    { ad: 'pembeBulut', x0: 0, x1: 57 * T },
    { ad: 'kuzuCayir', x0: 57 * T, x1: 140 * T },
    { ad: 'ruzgar', x0: 140 * T, x1: 219 * T },
    { ad: 'sekil', x0: 219 * T, x1: 252 * T },
    { ad: 'bosluk', x0: 252 * T, x1: 265 * T },
    { ad: 'ucus', x0: 265 * T, x1: 388 * T },
    { ad: 'tepe', x0: 388 * T, x1: COLS * T },
  ],
  gol: null,
  gollar: [],
  gokkusagi: { x: BL3_YAY.cx, y: BL3_TEPE.y, cx: BL3_YAY.cx, cy: BL3_YAY.cy, R: BL3_YAY.R },
  ucus: BL3_UCUS,
  kamera: [
    { x0: 0, x1: 18 * T, zoom: 1.06 },
    { x0: 40 * T, x1: 50 * T, zoom: 0.92, yOfs: -40 },            // yüksek pembe bulut görünsün
    { x0: 143 * T, x1: 162 * T, zoom: 0.88, yOfs: -50 },          // esinti 1 + yüksek düzlük
    { x0: 186 * T, x1: 204 * T, zoom: 0.86, yOfs: -60 },          // esinti 2 + bulut adası
    { x0: 254 * T, x1: 266 * T, zoom: 0.86, yOfs: -40 },          // Büyük Boşluk'un kıyısı: geniş gökyüzü
    { x0: 400 * T, x1: COLS * T, zoom: 0.8, yOfs: -60 },          // tepe + gökkuşağı
  ],
};
P.x = P.safeX = BOLUM.baslangic.x; P.y = P.safeY = BOLUM.baslangic.y;
D.x = P.x - 40; D.y = P.y - 100;

const bl3Soz = (c, anahtar, r, gecC, konu) => nesne('konusma', c, yuzey(c), { anahtar, r, gec: nx(gecC), konu: konu || null });
const bl3X = (x, tip, y, o) => nesne(tip, Math.floor(x / T), y, Object.assign({ x }, o || {}));   // dünya x ile yerleştir
const bl3Kuzu = c => nesne('kuzu', c, yuzey(c), {});

// ════════ 1. Pembe Bulutlar ════════
bl3Soz(7, 'b_giris', 80, 12);
bl3Soz(15, 'b_zip', 70, 23);
bl3X(nx(22), 'bulutZip', bl3H(4), { w: 120, h: 30, guc: 900, gom: true });          // çukurda, zeminle aynı hizada: üstünden geçerken kendiliğinden "boing"
bl3X(nx(41), 'bulutZip', bl3H(4) - 18, { w: 104, guc: 1040 });               // yüksek pembe buluta çıkaran (alçak: üstünden yürüyünce de zıplatır)
for (let i = 0; i < 3; i++) nesne('tohum', 43.5 + i * 1.6, bl3Sat(12) - 34 - Math.sin(i / 2 * Math.PI) * 26, { r: 46 });
for (const c of [27.5, 31.5]) bl3X(nx(c), 'bulutZip', bl3H(4), { w: 80, h: 30, guc: 860, gom: true });   // boing zinciri: iki küçük çukur, üstünden yürüyünce sek sek
for (let i = 0; i < 4; i++) nesne('tohum', 26.5 + i * 2, yuzey(24) - 90 - Math.sin(i / 3 * Math.PI) * 40, { r: 44 });   // zincirin sekmelerinde

// ════════ 2. Kuzucuk Çayırı ════════
const bl3K1 = bl3Kuzu(75);
bl3Soz(63, 'b_kuzu', 80, 76, bl3K1);
bl3Kuzu(103);                                                                    // küçük plato üstünde
bl3X(117 * T + 80, 'bulutYuzen', bl3H(4), { w: 160, ax: 120, sure: 5.2 });       // 117–123 boşluğu: kenardan kenara (uçlarda bekler)
bl3X(nx(126.5), 'bulutZip', bl3H(4) - 18, { w: 96, guc: 980 });               // basamak bulutlarına (isteğe bağlı)
nesne('tohum', 134, bl3Sat(13) - 30, { r: 46 });
bl3Kuzu(131);

// ════════ 3. Rüzgâr Yolu ════════
bl3Soz(141, 'b_esinti', 80, 149);
bl3X(151 * T - 55, 'esinti', bl3H(4), { w: 110, h: 250 });                      // yüksek düzlüğe taşır (duvar 4 kare; sütun duvara dayalı: duvarın dibi hep esintinin içinde)
nesne('tohum', 149.1, bl3H(4) - 150, { r: 44 }); nesne('tohum', 149.1, bl3H(4) - 215, { r: 44 });   // esintide süzülürken
bl3Kuzu(157);
bl3X(171 * T + 70, 'bulutYuzen', bl3H(6), { w: 140, ax: 100, sure: 4.8 });       // 171–176 boşluğu
bl3X(195 * T - 55, 'esinti', bl3H(4), { w: 110, h: 290 });                      // bulut adasına taşır (adanın yüzeyi 200 birim yukarıda; duvara dayalı)
bl3Kuzu(200);
bl3X(217 * T, 'esinti', bl3H(4) + 100, { w: 160, h: 300, kuyu: true });          // rüzgâr kuyusu (dibi görünmez: bulutların arasından)
nesne('ucurtma', 145, bl3H(4), { ip: 250, renk: 0 });
nesne('ucurtma', 166, bl3H(6), { ip: 210, renk: 1 });
nesne('ucurtma', 182, bl3H(6), { ip: 260, renk: 2 });
nesne('ucurtma', 211, bl3H(5), { ip: 230, renk: 3 });
nesne('tohum', 217, bl3H(4) - 150, { r: 46 });                                  // kuyunun üstünde süzülürken

// ════════ 4. Bulut Şekilleri ════════
nesne('bulutSekil', 225, yuzey(225), { sira: 0 });
nesne('tohum', 230.5, bl3Sat(15) - 30, { r: 46 });
bl3Kuzu(237.5);                                                                  // tümseğin üstünde
nesne('bulutSekil', 248, yuzey(248), { sira: 1 });

// ════════ 5. Büyük Boşluk → uçuş ════════
const bl3Kapi = nesne('ucusKapisi', 260, yuzey(260), { x1: BL3_UCUS.x1, yUst: BL3_UCUS.yUst, yAlt: BL3_UCUS.yAlt });
// Yedek köprü: ucus.js'in türü YOKSA (yalnız o zaman) boşluğun üstünde yavaşça beliren bulut basamakları (bulut.js 'bulutKopru')
for (let x = 265 * T + 70, i = 0; x < 388 * T; x += 136, i++) bl3X(x, 'bulutKopru', bl3H(4), { w: 150, sira: i });   // bitişik, düz (boşluksuz yürünür)

// ════════ 6. Gökkuşağı Tepesi ════════
bl3Kuzu(396);
nesne('tohum', 392, yuzey(392) - 70, { r: 46 });
bl3Soz(401, 'b_tepe', 80, 418);
bl3X(nx(405), 'bulutZip', bl3H(5) - 18, { w: 96, guc: 980 });                  // tepeye kısa yol (isteğe bağlı)
nesne('gokkusagi', BL3_TEPE.c, BL3_TEPE.y, { x: BL3_YAY.cx, cx: BL3_YAY.cx, cy: BL3_YAY.cy, R: BL3_YAY.R, bant: BL3_YAY.bant, tepeX0: nx(421) - 20, tepeX1: nx(433) + 20 });

// ── Süsler (yalnız güzellik; sayaçlara girmez) ──
for (const [c, y, n] of [[30, 260, 5], [118, 200, 7], [205, 150, 6], [300, 180, 8], [360, 240, 5], [415, 150, 6]]) nesne('kusSuru', c, y, { n });
for (const c of [10, 33, 88, 120, 175, 230, 270, 330, 395, 446]) nesne('tuy', c, yuzey(Math.min(c, COLS - 1)) - 120 - (c * 13) % 90, {});
const FLOWERS = [];
const TREE = null;

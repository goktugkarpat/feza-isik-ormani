/* bolum.js – "Işık Ormanı: Uykucu Pofuduklar" bölümünün yerleşimi (zemin ızgarası + nesneler).
   Sözleşme: src/SPEC.md. Bu dosya yalnız VERİ üretir; davranış/çizim ilgili modüllerdedir.
   Izgara: 0 boş · 1 zemin (katı) · 2 üstten geçilen dal. Satır 0 en üst. Bir kare T=40 birim.
   Zemin her sütunda "yükseklik" olarak verilir (alttan kaç kare dolu); ana yol h=4 (yüzey satırı 18, y=720).
   Fizik payları (SPEC): tek zıplama ≈121 birim (3 kare) yükseğe, ≈157 birim (≈4 kare) ileriye;
   çift zıplama ≈217 birim (5,4 kare); minder 1080 → ≈265; Büyük Pofuduk 1500 → ≈510.
   Tasarım kuralları: tek zıplamalık boşluklar ≤ 2 kare, basamaklar ≤ 2 kare; tek çift-zıplama yeri (4 kare);
   düşülebilen tek yer göl (Pırıl geri taşır). */
'use strict';
const ROWS = 22, COLS = 300;
const grid = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
const ground = (a, b, h) => { for (let x = a; x <= b; x++) for (let y = ROWS - h; y < ROWS; y++) grid[y][x] = 1; };
const plat = (a, b, row) => { for (let x = a; x <= b; x++) grid[row][x] = 2; };
const topOf = c => { for (let y = 0; y < ROWS; y++) if (grid[y][c] === 1) return y; return ROWS; };
const cell = (tx, ty) => (tx < 0 || tx >= COLS) ? 1 : (ty < 0 || ty >= ROWS) ? 0 : grid[ty][tx];
const yuzey = c => topOf(Math.floor(c)) * T;              // c sütununun zemin üstü (dünya y)
const nx = c => c * T + T / 2;                             // sütun ortası (dünya x)
function nesne(tip, c, y, o = {}) { const n = Object.assign({ tip, x: nx(c), y, id: tip + NESNELER.length }, o); NESNELER.push(n); return n; }
const blDal = row => row * T;                              // dalın üstü (dünya y)

// ── Zemin profili: [ilk sütun, son sütun, yükseklik] ──
const BL_ZEMIN = [
  // 1. Uyanış Patikası (0–46): düz, güvenli; minik basamaklarla küçük bir tepe
  [0, 1, 9], [2, 2, 7], [3, 16, 4], [17, 21, 5], [22, 25, 6], [26, 29, 7], [30, 32, 6], [33, 35, 5], [36, 46, 4],
  // 2. İlk Pofuduk (47–86): set, Pofuduk'un uyuduğu çukur, çiçekli basamak, göle iniş
  [47, 49, 5], [50, 57, 6], [58, 65, 4], [66, 73, 5], [74, 79, 4], [80, 84, 3],
  // 3. Karanlık Göl (85–140): kıyı (h2), su 100–126, ortada adacık, karşı kıyı
  [85, 99, 2], [112, 115, 2], [127, 132, 2], [133, 135, 3], [136, 140, 4],
  // 4. Yüksek Dallar (141–203): minder, yüksek dal, çift zıplama sırtı, çukur + basamak Pofuduk
  [141, 158, 4], [159, 166, 5], [167, 176, 9], [177, 178, 8], [179, 180, 7], [181, 182, 6], [183, 189, 4], [190, 199, 7],
  // 5. Saklı Yol (200–252): ana yol aşağıda, saklı yol dallarda
  [200, 201, 6], [202, 203, 5], [204, 214, 4], [215, 219, 5], [220, 238, 4], [239, 242, 5],
  // 6. Açıklık (243–299): sakin düzlük, küçük tümsek; Büyük Pofuduk ağaç tepesinin dibindeki yuvasında (1 kare çukur:
  //    uyurken başından çift zıplamayla tepeye çıkılamasın); tepe 9 kare yüksek, yalnız onun zıplatmasıyla çıkılır
  [243, 252, 4], [253, 256, 5], [257, 269, 4], [270, 271, 5], [272, 275, 6], [276, 280, 4], [281, 286, 3], [287, 299, 13],
];
for (const [a, b, h] of BL_ZEMIN) ground(a, b, h);
// ── Dallar (üstten geçilir): [ilk, son, satır] ──
const BL_DAL = [
  [39, 42, 16],                                   // patikada ilk dal (2 kare): "dallara çıkılabilir"
  [76, 78, 16],                                   // göle inmeden küçük bir dal
  [146, 156, 12],                                 // minderin tam üstündeki yüksek dal
  [196, 199, 13], [202, 205, 11], [208, 212, 9], [215, 219, 9], [223, 227, 10], [231, 234, 12], [238, 240, 14], // saklı yol
  [254, 256, 15],                                 // açıklığa girişte oyunluk dal
  [273, 278, 14],                                 // Büyük Pofuduk'un solundaki dal (ikinci çiçek)
];
for (const [a, b, r] of BL_DAL) plat(a, b, r);

const BL_SU = ROWS * T - 26;   // göl yüzeyi (dunya.js suyu buraya çizer)
const BOLUM = {
  ad: 'Işık Ormanı: Uykucu Pofuduklar',
  baslangic: { x: nx(5), y: yuzey(5) },
  // dunya.js / muzik.js bölgeye göre süsleme ve ezgi seçer. Ana bölgeler bitişik ve sıralı; 'sakli' bir ÜST KATMAN:
  // yalnız Feza yukarıdaki dallardayken (P.y < ust) geçerli, listede sonra geldiği için o an 'dallar'ın yerine geçer.
  bolgeler: [
    { ad: 'patika', x0: 0, x1: 47 * T },
    { ad: 'pofuduk', x0: 47 * T, x1: 85 * T },
    { ad: 'gol', x0: 85 * T, x1: 141 * T },
    { ad: 'dallar', x0: 141 * T, x1: 243 * T },
    { ad: 'aciklik', x0: 243 * T, x1: COLS * T },
    { ad: 'sakli', x0: 195 * T, x1: 243 * T, ust: 15 * T },   // saklı yol: dallar satır 9–14 (y < 600)
  ],
  gol: { x0: 100 * T, x1: 127 * T, su: BL_SU, ada: { x0: 112 * T, x1: 116 * T } },   // su yüzeyi (yansımalar), adacık
  // Kamera ipuçları (oyun.js isterse kullanır): zoom < 1 → daha geniş görüş; yOfs < 0 → kamera biraz yukarı bakar.
  kamera: [
    { x0: 0, x1: 20 * T, zoom: 1.06 },                         // başlangıç: biraz yakın, sıcak
    { x0: 88 * T, x1: 132 * T, zoom: 0.84, yOfs: 30 },         // göl: geniş, suyu ve yansımaları göster
    { x0: 143 * T, x1: 162 * T, zoom: 0.9, yOfs: -60 },        // minder + yüksek dal
    { x0: 165 * T, x1: 177 * T, zoom: 0.94, yOfs: -30 },       // çift zıplama sırtı
    { x0: 195 * T, x1: 242 * T, zoom: 0.86, yOfs: -70 },       // saklı yol yukarıda
    { x0: 262 * T, x1: COLS * T, zoom: 0.78, yOfs: -90 },      // açıklık: Büyük Pofuduk + yüksekte ağaç birlikte
  ],
};
P.x = P.safeX = BOLUM.baslangic.x; P.y = P.safeY = BOLUM.baslangic.y;
D.x = P.x - 40; D.y = P.y - 100;

// ── Nesneler (soldan sağa) ──
// 1. Uyanış Patikası
nesne('konusma', 6.5, yuzey(6), { anahtar: 'p_merhaba', r: 70 });
nesne('cicek', 12, yuzey(12), { r: 34 });                       // ilk çiçek: başlangıçtan görünür, 7 kare ötede
nesne('konusma', 15, yuzey(15), { anahtar: 'p_zipla', r: 50 });  // minik basamağın hemen önü
nesne('cicek', 27.5, yuzey(27), { r: 34 });                     // tepenin üstü
// 2. İlk Pofuduk
nesne('konusma', 52, yuzey(52), { anahtar: 'p_uyuyor', r: 90 });
nesne('pofuduk', 62, yuzey(62), { tur: 'yol' });                // setten atlayan Feza tam üstüne düşer
nesne('cicek', 69.5, yuzey(69), { r: 34 });
// 3. Karanlık Göl
nesne('konusma', 92, yuzey(92), { anahtar: 'p_karanlik', r: 80 });
nesne('karanlik', 97, yuzey(97), { grup: 'gol', r: 70 });
for (const c of [101.5, 105, 108.5, 117.5, 121, 124.5]) nesne('nilufer', c, BL_SU + 2, { grup: 'gol' });
nesne('cicek', 113.5, yuzey(113), { r: 34 });                   // adacık
nesne('pofuduk', 130, yuzey(130), { tur: 'yol' });              // karşı kıyıda uyuyan ikinci Pofuduk
// 4. Yüksek Dallar
nesne('konusma', 142, yuzey(142), { anahtar: 'p_minder', r: 80 });
nesne('pofuduk', 147, yuzey(147), { tur: 'minder' });           // dal tam üstünde (dallar alttan geçilir)
nesne('cicek', 153, blDal(12), { r: 34 });
nesne('konusma', 163, yuzey(163), { anahtar: 'p_ciftzipla', r: 60 });
nesne('cicek', 172, yuzey(172), { r: 34 });                     // çift zıplamayla çıkılan sırt
nesne('pofuduk', 188.8, yuzey(188), { tur: 'basamak' });        // çukurdan çıkış: uyanınca basamak olur
// 5. Saklı Yol (dallar: üç tohum) + ana yol (aşağıda)
nesne('konusma', 194, yuzey(194), { anahtar: 'p_sakli', r: 70 });
nesne('tohum', 203.5, blDal(11), { r: 30 });                    // girişte görünen ilk tohum
nesne('tohum', 217, blDal(9), { r: 30 });
nesne('tohum', 232.5, blDal(12), { r: 30 });
nesne('cicek', 217, yuzey(217), { r: 34 });                     // ana yolda, küçük tümseğin üstü
nesne('pofuduk', 229, yuzey(229), { tur: 'yol' });
// 6. Açıklık
nesne('pofuduk', 249, yuzey(249), { tur: 'yol' });
nesne('konusma', 264, yuzey(264), { anahtar: 'p_buyuk', r: 80 });
nesne('cicek', 268, yuzey(268), { r: 34, buyukIcin: true });     // yerde
nesne('cicek', 276, blDal(14), { r: 34, buyukIcin: true });      // tümsekten dala
nesne('cicek', 280.5, yuzey(280), { r: 34, buyukIcin: true });   // Büyük Pofuduk'un burnunun dibinde
nesne('buyukPofuduk', 284.3, yuzey(284), {});                   // yuvasında; ağacın tepesine çıkan yolu kapatır
nesne('konusma', 289, yuzey(289), { anahtar: 'p_agac', r: 70 });
nesne('agac', 294, yuzey(294), { r: 90 });

// Eski adlar (dunya.js uyumluluğu)
const FLOWERS = NESNELER.filter(n => n.tip === 'cicek');
const TREE = NESNELER.find(n => n.tip === 'agac');

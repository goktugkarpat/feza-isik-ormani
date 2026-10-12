/* bolum.js – "Işık Ormanı: Uykucu Pofuduklar" bölümünün yerleşimi (zemin ızgarası + nesneler).
   Sözleşme: src/SPEC.md. Bu dosya yalnız VERİ üretir; davranış/çizim ilgili modüllerdedir.
   Izgara: 0 boş · 1 zemin (katı) · 2 üstten geçilen dal. Satır 0 en üst. Bir kare T=40 birim.
   Zemin her sütunda "yükseklik" olarak verilir (alttan kaç kare dolu); ana yol h=4 (yüzey satırı 18, y=720).
   Fizik payları (SPEC): tek zıplama ≈121 birim (3 kare) yükseğe, ≈157 birim (≈4 kare) ileriye;
   çift zıplama ≈217 birim (5,4 kare); minder 1080 → ≈265; Büyük Pofuduk 1500 → ≈510.
   Tasarım kuralları (5 yaş): ana yolda boşluk yok (yalnız iki göl; nilüferler neredeyse bitişik), basamaklar ≤ 2 kare ve ≥ 4 kare
   geniş; tek çift-zıplama yeri (4 kare) ve dibinde her zaman basamak Pofuduk seçeneği; düşülebilen yerler yalnız göller (Pırıl geri taşır).
   Akış (≈450 sütun): 1 Patika → 2 İlk Pofuduk → 2b Pofuduk Çayırı (üç uykucuyu uyandır) → 3 Karanlık Göl → 4 Yüksek Dallar →
   4b Küçük Gölcük (ikinci ışık nefesi) → 4c Dal merdiveni (minder) → 5 Saklı Yol (tohumlar) → 5b Tepecik (inişte ödül) → 6 Açıklık.
   Doğrulama: scratchpad/isik/bolum3 (solve.py gerçek stepPlayer'ı özensiz girdilerle çalıştırır; botlar gerçek oyunda). */
'use strict';
const ROWS = 22, COLS = 450;
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
  // 1. Uyanış Patikası (0–49): uzun, düz, güvenli başlangıç; minik basamaklarla küçük bir tepe
  [0, 1, 9], [2, 2, 7], [3, 21, 4], [22, 26, 5], [27, 30, 6], [31, 34, 7], [35, 37, 6], [38, 40, 5], [41, 49, 4],
  // 2. İlk Pofuduk (50–89): set, Pofuduk'un uyuduğu çukur, çiçekli basamak
  [50, 54, 5], [55, 62, 6], [63, 70, 4], [71, 78, 5], [79, 93, 4],
  // 2b. Pofuduk Çayırı (90–144): üç çukurda üç uykucu Pofuduk, aralarda tümsekler ve çiçekler
  [94, 97, 5], [98, 107, 4], [108, 111, 5], [112, 115, 6], [116, 125, 4], [126, 129, 5], [130, 139, 4], [140, 144, 6],
  // 3. Karanlık Göl (145–200): kıyılar h5, su 160–186, ortada adacık, karşı kıyıdan yola iniş
  [145, 159, 5], [172, 175, 5], [187, 192, 5], [193, 200, 4],
  // 4. Yüksek Dallar (201–259): minder, yüksek dal, çift zıplama sırtı, çukur + basamak Pofuduk, düzlük
  [201, 218, 4], [219, 226, 5], [227, 236, 9], [237, 238, 8], [239, 240, 7], [241, 242, 6], [243, 249, 4], [250, 259, 6],
  // 4b. Küçük Gölcük (260–293): ikinci karanlık su; Pırıl yine ışık üfler, nilüferler + çiçekli adacık
  [260, 268, 5], [275, 277, 5], [284, 289, 5], [290, 293, 4],
  // 4c. Dal merdiveni (294–321): minder Pofuduk → dal → daha yüksek dal (çiçek) → set
  [294, 311, 4], [312, 321, 6],
  // 5. Saklı Yol (322–364): ana yol aşağıda, saklı yol dallarda (girişi setin üstünde)
  [322, 323, 6], [324, 325, 5], [326, 336, 4], [337, 341, 5], [342, 360, 4], [361, 364, 5],
  // 5b. Tepecik (365–392): açıklıktan önce minik basamaklı bir tepe, tepesinde çiçek; yavaşça iniş
  [365, 367, 6], [368, 370, 7], [371, 377, 8], [378, 380, 7], [381, 383, 6], [384, 386, 5], [387, 392, 4],
  // 6. Açıklık (393–449): sakin düzlük, küçük tümsek; Büyük Pofuduk ağaç tepesinin dibindeki yuvasında (1 kare çukur:
  //    uyurken başından çift zıplamayla tepeye çıkılamasın); tepe 8 kare yüksek (7 kare olunca uyurken çıkılabiliyor – bot sınadı), yalnız onun zıplatmasıyla çıkılır
  [393, 402, 4], [403, 406, 5], [407, 419, 4], [417, 420, 5], [421, 425, 6], [426, 430, 4], [431, 437, 3], [438, 449, 12],
];
for (const [a, b, h] of BL_ZEMIN) ground(a, b, h);
// ── Dallar (üstten geçilir): [ilk, son, satır] ──
const BL_DAL = [
  [44, 47, 16],                                   // patikada ilk dal (2 kare): "dallara çıkılabilir"
  [80, 83, 16],                                   // çayıra girmeden küçük bir dal
  [206, 216, 12],                                 // minderin tam üstündeki yüksek dal
  [297, 305, 12], [307, 311, 10],                 // dal merdiveni: minderle 12. satıra (çiçek), oradan zıplayıp 10. satıra → sete iniş
  [318, 321, 14], [324, 327, 12], [330, 334, 10], [337, 341, 9], [344, 348, 10], [351, 354, 12], [357, 360, 14], // saklı yol
  [424, 428, 14],                                 // Büyük Pofuduk'un solundaki dal (ikinci çiçek)
];
for (const [a, b, r] of BL_DAL) plat(a, b, r);

const BL_SU = (ROWS - 4) * T + 10;   // göl yüzeyi y=730 (kıyıdan 50 aşağıda); dunya.js suyu buraya çizer, oyun.js düşmeyi buna göre sayar
const BOLUM = {
  ad: 'Işık Ormanı: Uykucu Pofuduklar',
  baslangic: { x: nx(5), y: yuzey(5) },
  // dunya.js / muzik.js bölgeye göre süsleme ve ezgi seçer. Ana bölgeler bitişik ve sıralı (aynı ad iki kez geçebilir:
  // ikinci 'gol' küçük gölcük, ikinci 'dallar' dal merdiveni + saklı yolun altı, ikinci 'patika' açıklıktan önceki tepecik).
  // 'sakli' bir ÜST KATMAN: yalnız Feza yukarıdaki dallardayken (P.y < ust) geçerli, listede sonra geldiği için o an 'dallar'ın yerine geçer.
  bolgeler: [
    { ad: 'patika', x0: 0, x1: 50 * T },
    { ad: 'pofuduk', x0: 50 * T, x1: 145 * T },
    { ad: 'gol', x0: 145 * T, x1: 201 * T },
    { ad: 'dallar', x0: 201 * T, x1: 258 * T },
    { ad: 'gol', x0: 258 * T, x1: 294 * T },
    { ad: 'dallar', x0: 294 * T, x1: 365 * T },
    { ad: 'patika', x0: 365 * T, x1: 393 * T },
    { ad: 'aciklik', x0: 393 * T, x1: COLS * T },
    { ad: 'sakli', x0: 317 * T, x1: 365 * T, ust: 15 * T },   // saklı yol: dallar satır 9–14 (y < 600)
  ],
  // Ana göl (eski tek göl alanı; oyun.js düşme/kamera, dunya.js havza bunu kullanır)
  gol: { x0: 160 * T, x1: 187 * T, su: BL_SU, ada: { x0: 172 * T, x1: 176 * T } },
  // Bütün göller (ana göl ilk sırada). İkincisi küçük gölcük: dunya.js su/havza çizimi, oyun.js düşme kontrolü bunu da dolaşmalı.
  gollar: null,
  // Saklı yolun girişi (ilk dalın orta-üstü): dunya.js parlayan yaprak kemeri, piril.js 'p_sakli' sırasında buraya işaret edebilir.
  sakliGiris: { x: 320 * T, y: blDal(14), dal: [318 * T, 322 * T] },
  // Kamera ipuçları (oyun.js isterse kullanır): zoom < 1 → daha geniş görüş; yOfs < 0 → kamera biraz yukarı bakar.
  kamera: [
    { x0: 0, x1: 20 * T, zoom: 1.06 },                         // başlangıç: biraz yakın, sıcak
    { x0: 148 * T, x1: 192 * T, zoom: 0.84, yOfs: 30 },        // göl: geniş, suyu ve yansımaları göster
    { x0: 203 * T, x1: 222 * T, zoom: 0.9, yOfs: -60 },        // minder + yüksek dal
    { x0: 225 * T, x1: 237 * T, zoom: 0.94, yOfs: -30 },       // çift zıplama sırtı
    { x0: 261 * T, x1: 290 * T, zoom: 0.86, yOfs: 30 },        // küçük gölcük
    { x0: 295 * T, x1: 312 * T, zoom: 0.88, yOfs: -70 },       // dal merdiveni
    { x0: 317 * T, x1: 364 * T, zoom: 0.86, yOfs: -70 },       // saklı yol yukarıda
    { x0: 370 * T, x1: 380 * T, zoom: 0.92, yOfs: -30 },       // tepecik: ileride açıklık görünsün
    { x0: 412 * T, x1: COLS * T, zoom: 0.74, yOfs: -90 },      // açıklık: Büyük Pofuduk + yüksekte ağaç birlikte
  ],
};
BOLUM.gollar = [BOLUM.gol, { x0: 269 * T, x1: 284 * T, su: BL_SU, ada: { x0: 275 * T, x1: 278 * T } }];
P.x = P.safeX = BOLUM.baslangic.x; P.y = P.safeY = BOLUM.baslangic.y;
D.x = P.x - 40; D.y = P.y - 100;

// konusma tetikleyicileri: gec = Feza bu x'i geçtiyse cümle bayatlamıştır (ses.js sıradan atabilir);
// konu = cümlenin anlattığı nesne (uyandıysa / aydınlandıysa / açıldıysa cümle gereksiz).
const blSoz = (c, anahtar, r, gecC, konu) => nesne('konusma', c, yuzey(c), { anahtar, r, gec: nx(gecC), konu: konu || null });

// ── Nesneler (soldan sağa) ──
// 1. Uyanış Patikası
blSoz(6.5, 'p_merhaba', 70, 22);
nesne('cicek', 15, yuzey(15), { r: 34 });                       // ilk çiçek: başlangıçtan görünür, 10 kare ötede
blSoz(19, 'p_zipla', 50, 27);                                    // ilk basamağın (22) hemen önü
nesne('cicek', 32.5, yuzey(32), { r: 34 });                     // tepenin üstü
// 2. İlk Pofuduk
const blPof1 = nesne('pofuduk', 67, yuzey(67), { tur: 'yol' }); // setten atlayan Feza tam üstüne düşer
blSoz(61, 'p_uyuyor', 70, 68, blPof1);                          // setin ucunda: çukurdaki Pofuduk ekranda
nesne('cicek', 74.5, yuzey(74), { r: 34 });
// 2b. Pofuduk Çayırı: üç uykucu, hepsini uyandır (uyananlar Feza'nın peşine takılır)
nesne('pofuduk', 102.5, yuzey(102), { tur: 'yol' });
nesne('cicek', 113.5, yuzey(113), { r: 34 });                   // iki çukur arasındaki tümsekte
nesne('pofuduk', 120.5, yuzey(120), { tur: 'yol' });
nesne('pofuduk', 134.5, yuzey(134), { tur: 'yol' });
nesne('cicek', 142, yuzey(142), { r: 34 });                     // çayırın sonundaki set: göle bakan ödül
// 3. Karanlık Göl
const blKar1 = nesne('karanlik', 157, yuzey(157), { grup: 'gol', r: 70 });
blSoz(152, 'p_karanlik', 80, 160, blKar1);
for (const c of [160.9, 162.8, 164.7, 166.6, 168.5, 170.4, 176.6, 178.5, 180.4, 182.3, 184.2, 186.1]) nesne('nilufer', c, BL_SU + 2, { grup: 'gol' });
nesne('cicek', 173.5, yuzey(173), { r: 34 });                   // adacık
nesne('pofuduk', 190, yuzey(190), { tur: 'yol' });              // karşı kıyıda uyuyan Pofuduk
// 4. Yüksek Dallar
const blMin1 = nesne('pofuduk', 207, yuzey(207), { tur: 'minder' });   // dal tam üstünde (dallar alttan geçilir)
blSoz(202, 'p_minder', 80, 212, blMin1);
nesne('cicek', 213, blDal(12), { r: 34 });
blSoz(223, 'p_ciftzipla', 60, 229);
nesne('pofuduk', 225.8, yuzey(225), { tur: 'basamak' });        // sırtın dibinde: çift zıplayamayana basamak (uyurken bile)
nesne('cicek', 232, yuzey(232), { r: 34 });                     // çift zıplamayla çıkılan sırt
nesne('cicek', 254.5, yuzey(254), { r: 34 });                   // inişten sonraki düzlük: gölcüğe bakan ödül
// 4b. Küçük Gölcük: ikinci karanlık nokta (aynı ışık nefesi), iki kısa nilüfer dizisi, ortada çiçekli adacık
const blKar2 = nesne('karanlik', 266, yuzey(266), { grup: 'gol2', r: 70 });
blSoz(262, 'p_karanlik', 70, 268, blKar2);
for (const c of [269.9, 271.8, 273.7, 278.8, 280.8, 282.8]) nesne('nilufer', c, BL_SU + 2, { grup: 'gol2' });
nesne('cicek', 276, yuzey(276), { r: 34 });                     // gölcüğün adacığı
// 4c. Dal merdiveni: minder Pofuduk (dal tam üstünde) → 12. satırdaki çiçek → zıplayıp 10. satıra → sete iniş
nesne('pofuduk', 300, yuzey(300), { tur: 'minder' });
nesne('cicek', 303, blDal(12), { r: 34 });
// 5. Saklı Yol: girişte Pırıl yukarıyı gösterir; bir tohum girişten görünen dalda, bir "tadımlık" tohum ana yolda (hemen üstündeki
//    dalda öbürü parlar), üçüncüsü saklı yolun tepesinde
blSoz(318, 'p_sakli', 70, 326);                                 // giriş dalı (318–321, 2 kare yukarıda) tam önünde
nesne('tohum', 325.5, blDal(12), { r: 34 });                    // girişten görünen ikinci tohum
nesne('tohum', 328, yuzey(328), { r: 50 });                     // ana yolda (herkes bulur): hemen üstteki dalda bir tohum daha görünür
nesne('tohum', 339, blDal(9), { r: 34 });                       // saklı yolun tepesi
nesne('cicek', 339, yuzey(339), { r: 34 });                     // ana yolda, küçük tümseğin üstü
nesne('pofuduk', 351, yuzey(351), { tur: 'yol' });
// 5b. Tepecik: basamaklı tırmanış, tepede çiçek, yumuşak iniş
nesne('cicek', 374, yuzey(374), { r: 34 });
// 6. Açıklık
nesne('pofuduk', 397, yuzey(397), { tur: 'yol' });
nesne('cicek', 404.5, yuzey(404), { r: 34 });                  // açıklığa girerken tümsekte küçük bir ödül
const blBuyukSoz = blSoz(416, 'p_buyuk', 60, 430);              // ≈414,5'te tetiklenir = merkezinden ≈20 kare: oyun.js'in 'dikkat' kamerasıyla 4:3 iPad'de tam ekranda; ilk çiçeğe 8 kare var
nesne('cicek', 423, yuzey(423), { r: 34, buyukIcin: true });     // tümseğin üstü (p_buyuk'tan hemen sonra)
nesne('cicek', 425, blDal(14), { r: 34, buyukIcin: true });      // tümsekten dala
nesne('cicek', 430.5, yuzey(430), { r: 34, buyukIcin: true });   // Büyük Pofuduk'un burnunun dibinde
blBuyukSoz.konu = nesne('buyukPofuduk', 434.6, yuzey(434), {});   // yuvasında; ağacın tepesine çıkan yolu kapatır
nesne('konusma', 439, yuzey(439), { anahtar: 'p_agac', r: 70, gec: nx(449), konu: null });
nesne('agac', 444, yuzey(444), { r: 90 });

// Eski adlar (dunya.js uyumluluğu)
const FLOWERS = NESNELER.filter(n => n.tip === 'cicek');
const TREE = NESNELER.find(n => n.tip === 'agac');

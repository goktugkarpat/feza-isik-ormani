/* bolum.js – "Işık Ormanı: Uykucu Pofuduklar" bölümünün yerleşimi (zemin ızgarası + nesneler).
   Sözleşme: src/SPEC.md › "Bölüm". Bu dosya yalnız VERİ üretir; davranış/çizim ilgili modüllerdedir.
   Izgara: 0 boş · 1 zemin (katı) · 2 üstten geçilen dal/adacık. Satır 0 en üst. Bir kare T=40 birim. */
'use strict';
const ROWS = 22, COLS = 250;
const grid = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
const ground = (a, b, h) => { for (let x = a; x <= b; x++) for (let y = ROWS - h; y < ROWS; y++) grid[y][x] = 1; };
const plat = (a, b, row) => { for (let x = a; x <= b; x++) grid[row][x] = 2; };
const topOf = c => { for (let y = 0; y < ROWS; y++) if (grid[y][c] === 1) return y; return ROWS; };
const cell = (tx, ty) => (tx < 0 || tx >= COLS) ? 1 : (ty < 0 || ty >= ROWS) ? 0 : grid[ty][tx];
const yuzey = c => topOf(c) * T;                         // c sütununun zemin üstü (dünya y)
const nx = c => c * T + T / 2;                            // sütun ortası (dünya x)
function nesne(tip, c, y, o = {}) { const n = Object.assign({ tip, x: nx(c), y, id: tip + NESNELER.length }, o); NESNELER.push(n); return n; }

// ── 1. Uyanış Patikası (0–40): yürü, zıpla, ilk çiçek ──
ground(0, 22, 4); ground(23, 29, 5); ground(30, 41, 4);
plat(14, 16, 15);
// ── 2. İlk Pofuduk (42–72) ──
ground(42, 74, 4);
// ── 3. Karanlık Göl (75–104): Pırıl ışık nefesi → nilüferler ──
ground(75, 78, 4); ground(101, 112, 4);
// ── 4. Yüksek Dallar (113–158): zıplatan Pofuduk, çift zıplama ──
ground(113, 160, 4);
plat(121, 127, 13); plat(131, 137, 10); plat(141, 146, 13);
// ── 5. Saklı Yol (dallarda, isteğe bağlı) ──
plat(148, 156, 9); plat(160, 168, 8); plat(172, 180, 10);
ground(161, 200, 4);
// ── 6. Açıklık: Büyük Pofuduk ve Işık Ağacı (200–249) ──
ground(201, 249, 4);
plat(209, 213, 14);

const BOLUM = {
  ad: 'Işık Ormanı: Uykucu Pofuduklar',
  baslangic: { x: nx(4), y: yuzey(4) },
  bolgeler: [   // dunya.js / muzik.js bölgeye göre süsleme ve ezgi seçer
    { ad: 'patika', x0: 0, x1: 42 * T }, { ad: 'pofuduk', x0: 42 * T, x1: 75 * T }, { ad: 'gol', x0: 75 * T, x1: 113 * T },
    { ad: 'dallar', x0: 113 * T, x1: 161 * T }, { ad: 'sakli', x0: 147 * T, x1: 182 * T, ust: 11 * T }, { ad: 'aciklik', x0: 200 * T, x1: COLS * T },
  ],
  gol: { x0: 79 * T, x1: 101 * T, su: (ROWS - 2) * T },   // su yüzeyi (yansımalar)
};
P.x = P.safeX = BOLUM.baslangic.x; P.y = P.safeY = BOLUM.baslangic.y;
D.x = P.x - 40; D.y = P.y - 100;

// Ana hedefler: ışık çiçekleri (sırayla), Büyük Pofuduk, ağaç
nesne('konusma', 6, yuzey(6), { anahtar: 'p_merhaba', r: 60 });
nesne('cicek', 19, yuzey(19), { r: 34 });
nesne('konusma', 15, 15 * T, { anahtar: 'p_zipla', r: 90 });
nesne('cicek', 36, yuzey(36), { r: 34 });
nesne('konusma', 47, yuzey(47), { anahtar: 'p_uyuyor', r: 120 });
nesne('pofuduk', 52, yuzey(52), { tur: 'yol' });
nesne('cicek', 66, yuzey(66), { r: 34 });
nesne('karanlik', 77, yuzey(77), { grup: 'gol', r: 70 });
for (const c of [81, 85, 89, 93, 97]) nesne('nilufer', c, BOLUM.gol.su - 6, { grup: 'gol' });
nesne('cicek', 106, yuzey(106), { r: 34 });
nesne('pofuduk', 118, yuzey(118), { tur: 'minder' });
nesne('cicek', 124, 13 * T, { r: 34 });
nesne('konusma', 128, 13 * T, { anahtar: 'p_ciftzipla', r: 60 });
nesne('cicek', 134, 10 * T, { r: 34 });
nesne('pofuduk', 143, 13 * T, { tur: 'yol' });
nesne('tohum', 152, 9 * T, { r: 30 }); nesne('tohum', 164, 8 * T, { r: 30 }); nesne('tohum', 176, 10 * T, { r: 30 });
nesne('pofuduk', 170, yuzey(170), { tur: 'basamak' });
nesne('cicek', 186, yuzey(186), { r: 34 });
nesne('konusma', 203, yuzey(203), { anahtar: 'p_buyuk', r: 120 });
nesne('cicek', 206, yuzey(206), { r: 34, buyukIcin: true });
nesne('cicek', 211, 14 * T, { r: 34, buyukIcin: true });
nesne('cicek', 217, yuzey(217), { r: 34, buyukIcin: true });
nesne('buyukPofuduk', 225, yuzey(225), {});
nesne('agac', 238, yuzey(238), { r: 90 });

// Eski adlar (dunya.js uyumluluğu)
const FLOWERS = NESNELER.filter(n => n.tip === 'cicek');
const TREE = NESNELER.find(n => n.tip === 'agac');

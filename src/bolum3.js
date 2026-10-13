/* bolum3.js – Bölüm 3 "Bulut Ülkesi" yerleşimi (zemin ızgarası + nesneler). Sözleşme: src/BOLUM3.md. Yalnız VERİ üretir.
   GEÇİCİ İSKELET (lead): LEVEL3 ajanı baştan yazacak. Bölüm 1/2 ile aynı adlar/biçim. */
'use strict';
const ROWS = 30, COLS = 400;
const BL3_EKSTRA = 8;
const grid = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
const ground = (a, b, h) => { for (let x = a; x <= b; x++) for (let y = ROWS - h - BL3_EKSTRA; y < ROWS; y++) grid[y][x] = 1; };
const plat = (a, b, row) => { for (let x = a; x <= b; x++) grid[row][x] = 2; };
const topOf = c => { for (let y = 0; y < ROWS; y++) if (grid[y][c] === 1) return y; return ROWS; };
const cell = (tx, ty) => (tx < 0 || tx >= COLS) ? 1 : (ty < 0 || ty >= ROWS) ? 0 : grid[ty][tx];
const yuzey = c => topOf(Math.floor(c)) * T;
const nx = c => c * T + T / 2;
function nesne(tip, c, y, o = {}) { const n = Object.assign({ tip, x: nx(c), y, id: tip + NESNELER.length }, o); NESNELER.push(n); return n; }

ground(0, COLS - 1, 4);

const BOLUM = {
  ad: 'Bulut Ülkesi',
  baslangic: { x: nx(6), y: yuzey(6) },
  bolgeler: [{ ad: 'bulutYol', x0: 0, x1: COLS * T }],
  gol: null,
  gollar: [],
  kamera: [{ x0: 0, x1: 18 * T, zoom: 1.06 }],
};
P.x = P.safeX = BOLUM.baslangic.x; P.y = P.safeY = BOLUM.baslangic.y;
D.x = P.x - 40; D.y = P.y - 100;
const FLOWERS = [];
const TREE = null;

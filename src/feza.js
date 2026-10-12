/* feza.js – Feza modeli ve animasyonları (drawFeza, fezaUpdate)
   Klasik script: üst düzey const/let/function'lar diğer dosyalarla ortak (ortak.js önce yüklenir).
   Bu dosyadaki bütün yardımcı adlar fz/FZ ile başlar (başka dosyalarla çakışmasın).
   Yerel koordinat: ayak tabanı (0,0), sağa bakıyor, yukarı = -y. Boy ~60 birim, ekrana 1.3 ölçekle çizilir.
   Uzuv açıları: aşağıdan ölçülür, + = ileri. Diz bükülmesi (-), dirsek bükülmesi (+). */
'use strict';

// ── renkler ──
const FZ = {
  skin: '#f8d5bc', skinHi: '#fee9da', skinS: '#e6b498', skinD: '#cf9a7e', skinF: '#e7bba0',
  hair: ['#3e2718', '#5e3d27', '#6e4a2f', '#875c3a', '#a87a52'],
  pj: '#f8f2e5', pjS: '#ddd4c3', pjF: '#ddd3c1', pjLine: '#bdb2a0',
  brow: '#5b3a24', lash: '#26150b', lip: '#b05a48', mouth: '#6e2626', tongue: '#d4606c',
  shoe: '#f6f6f3', shoeF: '#d4d5d8', blue: '#3b7be2', blueF: '#2d5fb0', sole: '#d9dbe2', soleF: '#b4b6bf',
  cloud: '#97a1b4', pink: '#f28fae', sky: '#86bbea', yel: '#f3c94c', star: '#f07c9c'
};
const FZ_TH = 8.0, FZ_SH = 7.6, FZ_FT = 2.1, FZ_AIRHIP = -18.6, FZ_UA = 6.6, FZ_FA = 6.0, FZ_SC = 1.4;
const FZ_KEYS = ['lean', 'hx', 'bob', 'lt1', 'lt2', 'bt1', 'bt2', 'la1', 'la2', 'ba1', 'ba2', 'shr', 'head', 'gx', 'gy',
  'lid', 'happy', 'brow', 'mSmile', 'mOpen', 'mRound', 'sx', 'sy', 'air', 'breath', 'hOpen'];
const FZ_REST = { lean: 0.03, hx: 0, bob: 0, lt1: 0.04, lt2: -0.08, bt1: -0.04, bt2: -0.06, la1: 0.12, la2: 0.35,
  ba1: -0.1, ba2: 0.35, shr: 0, head: 0, gx: 0.5, gy: 0.05, lid: 1, happy: 0, brow: 0, mSmile: 0.7, mOpen: 0, mRound: 0,
  sx: 1, sy: 1, air: 0, breath: 0, hOpen: 0 };
// saç tutamları: kök x,y · uç x,y · kalınlık · kavis · renk · yay etkisi  (kafa merkezine göre)
const FZ_BACK = [
  [-8.8, -8.0, -12.2, 1.8, 2.2, -1.0, 1, 0.6], [-7.6, -4.2, -11.2, 5.4, 2.2, -1.3, 2, 0.7],
  [-6.0, -1.6, -9.2, 6.4, 2.0, -1.0, 1, 0.7], [-4.6, 0.6, -6.6, 6.6, 1.5, -0.6, 0, 0.5]];
const FZ_TOP = [
  [-6.0, -12.0, -9.4, -12.4, 1.8, 0.6, 2, 0.6], [3.4, -13.0, 6.2, -13.2, 1.6, -0.5, 3, 0.6]];
const FZ_SIDE = [
  [-5.8, -6.0, -5.2, 3.2, 1.8, 0.7, 1, 0.6], [-3.6, -7.0, -1.6, 0.6, 1.8, 0.9, 2, 0.5],
  [-1.4, -7.0, 0.4, -1.2, 1.4, 0.6, 1, 0.4]];
const FZ_FRINGE = [
  [-2.6, -11.0, 0.0, -5.8, 1.8, -1.3, 1, 0.5], [-0.6, -12.0, 2.4, -4.8, 2.2, -1.7, 2, 0.6],
  [1.4, -12.2, 4.8, -4.2, 2.2, -1.7, 1, 0.65], [3.2, -12.0, 6.6, -3.7, 2.1, -1.6, 2, 0.7],
  [4.8, -11.4, 8.8, -4.3, 2.0, -1.3, 1, 0.7], [6.4, -10.4, 10.1, -5.0, 1.6, -0.9, 2, 0.6],
  [7.4, -8.8, 10.5, -6.6, 1.1, -0.4, 3, 0.6], [0.6, -12.0, 3.6, -5.2, 0.8, -1.5, 3, 0.6],
  [3.8, -11.8, 7.4, -4.8, 0.75, -1.4, 3, 0.7]];

const fzC = document.createElement('canvas'), fzX = fzC.getContext('2d');
const fzR = document.createElement('canvas'), fzRX = fzR.getContext('2d');
const FZ_T = {};
// çizim fonksiyonlarının okuduğu durum: oyunda P, ara sahnelerde fzCS (oyundaki sprite durumuna dokunmadan)
let fzQ = P;

// ── yardımcı şekiller ──
function fzJ(ax, ay, l1, a1, l2, a2) {   // eklem zinciri: [kökx, köky, dizx, dizy, uçx, uçy, uç açısı]
  const kx = ax + Math.sin(a1) * l1, ky = ay + Math.cos(a1) * l1;
  return [ax, ay, kx, ky, kx + Math.sin(a1 + a2) * l2, ky + Math.cos(a1 + a2) * l2, a1 + a2];
}
function fzTaper(x, ax, ay, bx, by, r1, r2, col) {   // iki ucu yuvarlak, incelen kapsül
  const a = Math.atan2(by - ay, bx - ax);
  x.fillStyle = col; x.beginPath();
  x.arc(ax, ay, r1, a + 1.5708, a - 1.5708);
  x.arc(bx, by, r2, a - 1.5708, a + 1.5708);
  x.closePath(); x.fill();
}
function fzEl(x, cx, cy, rx, ry) { x.moveTo(cx + rx, cy); x.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); }
function fzLock(x, rx, ry, tx, ty, w, bend, col) {   // ucu yuvarlak, kıvrık saç tutamı
  const dx = tx - rx, dy = ty - ry, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const cx = (rx + tx) / 2 + nx * bend, cy = (ry + ty) / 2 + ny * bend;
  const a = Math.atan2(ty - cy, tx - cx), wt = w * 0.38, ex = -Math.sin(a) * wt, ey = Math.cos(a) * wt;
  x.fillStyle = col; x.beginPath();
  x.moveTo(rx + nx * w, ry + ny * w);
  x.quadraticCurveTo(cx + nx * w * 0.75, cy + ny * w * 0.75, tx + ex, ty + ey);
  x.arc(tx, ty, wt, a + 1.5708, a - 1.5708, true);
  x.quadraticCurveTo(cx - nx * w * 0.75, cy - ny * w * 0.75, rx - nx * w, ry - ny * w);
  x.closePath(); x.fill();
}

// ── pijama deseni: bulut, uçak, yıldız ──
function fzCloud(x, cx, cy, s) {
  x.beginPath(); x.moveTo(cx - 1.25 * s, cy + 0.35 * s);
  x.arc(cx - 0.7 * s, cy, 0.5 * s, 2.6, 5.2); x.arc(cx + 0.05 * s, cy - 0.3 * s, 0.68 * s, 3.6, 6.0);
  x.arc(cx + 0.8 * s, cy + 0.05 * s, 0.45 * s, 4.4, 1.0); x.closePath();
  x.fillStyle = '#ffffff'; x.fill(); x.strokeStyle = FZ.cloud; x.lineWidth = 0.28; x.stroke();
}
function fzPlane(x, cx, cy, s, col, rot) {
  x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s, s); x.fillStyle = col;
  x.beginPath(); x.ellipse(0, 0, 1.55, 0.42, 0, 0, 6.2832); x.fill();
  x.beginPath(); x.moveTo(0.35, 0); x.lineTo(-0.35, -1.3); x.lineTo(-0.75, -1.25); x.lineTo(-0.35, 0);
  x.lineTo(-0.75, 1.25); x.lineTo(-0.35, 1.3); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(-1.1, 0); x.lineTo(-1.55, -0.6); x.lineTo(-1.7, 0.6); x.closePath(); x.fill();
  x.restore();
}
function fzStar(x, cx, cy, r) {
  x.beginPath();
  for (let i = 0; i < 10; i++) { const a = -1.5708 + i * 0.6283, rr = i & 1 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  x.closePath(); x.fill();
}
function fzPrint(x) {
  fzCloud(x, -2.4, -11.4, 1.1); fzCloud(x, 2.6, -4.8, 1.0); fzCloud(x, -3.4, -1.0, 0.9);
  fzPlane(x, 2.7, -11.6, 1.0, FZ.pink, -0.3); fzPlane(x, -2.5, -6.4, 0.95, FZ.sky, 0.25); fzPlane(x, 3.5, 0.0, 0.85, FZ.yel, -0.15);
  x.fillStyle = FZ.star;
  fzStar(x, -4.5, -13.4, 0.6); fzStar(x, 0.2, -8.6, 0.55); fzStar(x, 4.8, -7.8, 0.55); fzStar(x, -0.4, -2.8, 0.5); fzStar(x, -5.0, -4.6, 0.5); fzStar(x, 0.9, 0.9, 0.45);
}

// ── uzuvlar ──
function fzShoe(x, ax, ay, rot, far) {
  x.save(); x.translate(ax, ay); x.rotate(rot); x.scale(0.86, 0.86);
  x.fillStyle = far ? '#d2cdc4' : '#f3efe7'; x.beginPath(); x.ellipse(0.1, -0.3, 1.85, 1.1, 0, 0, 6.2832); x.fill();  // çorap
  x.fillStyle = far ? FZ.shoeF : FZ.shoe; x.beginPath();
  x.moveTo(-2.5, 1.7); x.lineTo(-2.6, -0.3); x.quadraticCurveTo(-2.4, -1.2, -1.3, -1.05); x.lineTo(0.6, -0.85);
  x.quadraticCurveTo(1.9, -0.55, 2.9, 0.15); x.quadraticCurveTo(4.7, 0.5, 4.7, 1.7); x.closePath(); x.fill();
  x.fillStyle = far ? FZ.blueF : FZ.blue;
  x.beginPath(); x.moveTo(2.4, -0.1); x.quadraticCurveTo(4.6, 0.4, 4.7, 1.6); x.lineTo(3.0, 1.6); x.quadraticCurveTo(3.1, 0.6, 2.4, -0.1); x.fill();  // burun
  x.fillRect(-2.65, -0.5, 0.9, 2.0);                                                                                                      // topuk
  x.strokeStyle = far ? FZ.blueF : FZ.blue; x.lineWidth = 0.55; x.lineCap = 'round';
  x.beginPath(); x.moveTo(-1.5, 1.1); x.quadraticCurveTo(0.6, 1.0, 2.0, 0.1); x.stroke();                                               // şerit
  x.strokeStyle = far ? '#9fb3d6' : '#bcd3f5'; x.lineWidth = 0.35;
  x.beginPath(); x.moveTo(0.2, -0.75); x.lineTo(0.7, -0.25); x.moveTo(1.1, -0.55); x.lineTo(1.6, -0.05); x.stroke();                    // bağcık
  x.fillStyle = far ? FZ.soleF : FZ.sole; x.beginPath(); x.roundRect(-2.75, 1.5, 7.6, 0.95, 0.45); x.fill();                            // taban
  x.restore();
}
function fzLeg(x, j, far, R) {
  const sk = far ? FZ.skinF : FZ.skin, pj = far ? FZ.pjF : FZ.pj;
  const [hx, hy, kx, ky, ax, ay, sa] = j;
  const lift = clamp(-(ay + FZ_FT) / 2.5, 0, 1), rot = clamp(-sa * 0.6, -0.55, 1.0) * lerp(lift, 1, R.air);
  fzTaper(x, kx, ky, ax, ay, 2.45, 1.7, sk);    // baldır
  fzTaper(x, lerp(kx, ax, 0.12), lerp(ky, ay, 0.12), lerp(kx, ax, 0.5), lerp(ky, ay, 0.5), 2.55, 2.1, sk);   // tombul baldır kası
  fzTaper(x, hx, hy, kx, ky, 2.85, 2.5, sk);    // uyluk
  if (!far) { x.fillStyle = 'rgba(255,240,228,0.55)'; x.beginPath(); x.ellipse(kx + 0.5, ky - 0.2, 0.9, 0.7, 0, 0, 6.2832); x.fill(); }
  fzShoe(x, ax, ay, rot, far);
  const mx = lerp(hx, kx, 0.55), my = lerp(hy, ky, 0.55);
  fzTaper(x, hx, hy, mx, my, 3.4, 3.15, pj);    // şort paçası
  x.strokeStyle = far ? '#b9ae9a' : FZ.pjLine; x.lineWidth = 0.4;
  const a = Math.atan2(my - hy, mx - hx), c = Math.cos(a + 1.5708) * 3.0, s = Math.sin(a + 1.5708) * 3.0;
  x.beginPath(); x.moveTo(mx + c, my + s); x.lineTo(mx - c, my - s); x.stroke();
  if (!far) { x.fillStyle = FZ.sky; x.beginPath(); x.arc(lerp(hx, mx, 0.55) + 0.8, lerp(hy, my, 0.55), 0.4, 0, 6.2832); x.fill(); }
}
function fzArm(x, sx, sy, a1, a2, far, open) {
  const j = fzJ(sx, sy, FZ_UA, a1, FZ_FA, a2);
  const sk = far ? FZ.skinF : FZ.skin, pj = far ? FZ.pjF : FZ.pj;
  fzTaper(x, j[2], j[3], j[4], j[5], 1.55, 1.35, sk);   // ön kol
  fzTaper(x, j[0], j[1], j[2], j[3], 1.8, 1.55, sk);    // üst kol
  // el: avuç + başparmak
  const dx = Math.sin(j[6]), dy = Math.cos(j[6]), hx = j[4] + dx * 1.2, hy = j[5] + dy * 1.2;
  x.fillStyle = sk; x.beginPath(); x.ellipse(hx, hy, 2.05, 1.8, 1.5708 - j[6], 0, 6.2832); x.fill();
  if (open > 0.4) {   // açık el (el sallarken): yelpaze gibi dört parmak
    for (let f = 0; f < 4; f++) {
      const fa = j[6] - 0.45 + f * 0.3, fl = 1.5 + (f === 1 || f === 2 ? 0.3 : 0) * open;
      fzTaper(x, hx + dx * 0.8, hy + dy * 0.8, hx + Math.sin(fa) * (0.8 + fl), hy + Math.cos(fa) * (0.8 + fl), 0.55, 0.45, sk);
    }
  }
  x.beginPath(); x.arc(hx + dy * 1.3 + dx * 0.2, hy - dx * 1.3 + dy * 0.2, 0.75, 0, 6.2832); x.fill();
  x.strokeStyle = 'rgba(190,120,95,0.45)'; x.lineWidth = 0.3; x.beginPath(); x.moveTo(hx + dx * 0.4, hy + dy * 0.4); x.lineTo(hx + dx * 1.5, hy + dy * 1.5); x.stroke();
  // kol ağzı
  const mx = lerp(j[0], j[2], 0.56), my = lerp(j[1], j[3], 0.56);
  fzTaper(x, j[0], j[1], mx, my, 2.75, 2.5, pj);
  x.strokeStyle = far ? '#b9ae9a' : FZ.pjLine; x.lineWidth = 0.4;
  const a = Math.atan2(my - j[1], mx - j[0]), c = Math.cos(a + 1.5708) * 2.4, s = Math.sin(a + 1.5708) * 2.4;
  x.beginPath(); x.moveTo(mx + c, my + s); x.lineTo(mx - c, my - s); x.stroke();
  if (!far) { x.fillStyle = FZ.star; fzStar(x, lerp(j[0], mx, 0.45), lerp(j[1], my, 0.45), 0.45); }
}

// önden görünüşte hedef noktalı kol (iki kemikli ters kinematik): omuz sx,sy → el tx,ty; bend: dirseğin yanı
function fzArmIK(x, sx, sy, tx, ty, bend, open) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 0.01;
  const L1 = FZ_UA, L2 = FZ_FA + 1.0, dd = clamp(d, 1.2, L1 + L2 - 0.05);
  const a0 = Math.atan2(dy, dx), c = clamp((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1), a = a0 + bend * Math.acos(c);
  const ex = sx + Math.cos(a) * L1, ey = sy + Math.sin(a) * L1;
  const hx = sx + dx / d * dd, hy = sy + dy / d * dd;
  fzTaper(x, ex, ey, hx, hy, 1.55, 1.35, FZ.skin);
  fzTaper(x, sx, sy, ex, ey, 1.8, 1.55, FZ.skin);
  x.fillStyle = FZ.skin; x.beginPath(); x.arc(hx, hy, 1.9, 0, 6.2832); x.fill();
  if (open > 0.4) { const fa0 = Math.atan2(hy - ey, hx - ex); for (let f = 0; f < 4; f++) { const fa = fa0 - 0.45 + f * 0.3; fzTaper(x, hx, hy, hx + Math.cos(fa) * 2.4, hy + Math.sin(fa) * 2.4, 0.55, 0.45, FZ.skin); } }
  else { x.strokeStyle = 'rgba(190,120,95,0.5)'; x.lineWidth = 0.3; x.beginPath(); x.arc(hx, hy, 1.1, a0 + 0.6, a0 + 2.2); x.stroke(); }   // yumruk kıvrımı
  fzTaper(x, sx, sy, lerp(sx, ex, 0.55), lerp(sy, ey, 0.55), 2.35, 2.2, FZ.pj);
}

// ── gövde ──
function fzTorso(x, R, tm) {
  const lift = R.air * clamp(fzQ.vy / 700, -0.4, 1) * 1.4, fl = R.air * Math.sin(tm * 23) * 0.35;
  const hb = 1.4 - lift + fl, hf = 1.4 - lift * 0.7 - fl, b = R.breath;
  x.save(); x.scale((1 + 0.012 * b) * 1.06, (1 + 0.018 * b) * 0.9);
  x.beginPath();
  x.moveTo(-5.4, hb);
  x.quadraticCurveTo(-6.1, -5, -5.7, -9.4);
  x.quadraticCurveTo(-5.6, -13.7, -2.5, -15.0);
  x.quadraticCurveTo(0.9, -16.0, 3.9, -14.6);
  x.quadraticCurveTo(6.1, -13.1, 5.9, -9.4);
  x.quadraticCurveTo(7.6, -4.6, 6.1, hf);
  x.quadraticCurveTo(0.3, (hb + hf) / 2 + 1.1, -5.4, hb);
  x.closePath();
  x.fillStyle = FZ.pj; x.fill();
  x.save(); x.clip();
  fzPrint(x);
  const sg = x.createLinearGradient(-6.5, 0, 7.5, 0);
  sg.addColorStop(0, 'rgba(70,58,110,0.32)'); sg.addColorStop(0.42, 'rgba(70,58,110,0)'); sg.addColorStop(0.8, 'rgba(255,250,240,0.08)'); sg.addColorStop(1, 'rgba(70,58,110,0.16)');
  x.fillStyle = sg; x.fillRect(-8, -17, 17, 21);
  x.strokeStyle = 'rgba(140,122,140,0.45)'; x.lineWidth = 0.42; x.lineCap = 'round';
  x.beginPath(); x.moveTo(2.4, -10.6); x.quadraticCurveTo(3.8, -8.7, 3.3, -6.9);      // koltuk altı kırışığı
  x.moveTo(-1.4, -1.0); x.quadraticCurveTo(1.6, -0.2, 4.0, -1.4);                      // göbek kırışığı
  x.moveTo(-4.7, -8.3); x.quadraticCurveTo(-4.1, -5.6, -4.8, -2.8); x.stroke();          // sırt
  x.fillStyle = 'rgba(70,58,110,0.12)'; x.fillRect(-8, hb - 1.4, 17, 4);                // etek gölgesi
  x.restore();
  x.strokeStyle = FZ.pjLine; x.lineWidth = 0.45;
  x.beginPath(); x.moveTo(-5.2, hb - 0.45); x.quadraticCurveTo(0.3, (hb + hf) / 2 + 0.6, 5.95, hf - 0.45); x.stroke();
  x.restore();
}
function fzShorts(x) {
  x.fillStyle = FZ.pj; x.beginPath(); x.ellipse(0.3, 0.6, 5.9, 3.7, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(70,58,110,0.14)'; x.beginPath(); x.ellipse(-1.4, 1.6, 4.4, 2.6, 0, 0, 6.2832); x.fill();
  fzPlane(x, -2.2, 1.6, 0.7, FZ.sky, 0.2); x.fillStyle = FZ.star; fzStar(x, 2.6, 2.0, 0.45);
}

// ── kafa ──
function fzEye(x, cx, cy, w, h, R, far) {
  const lid = R.lid * fzQ.a_lidM;
  x.lineCap = 'round';
  if (R.happy > 0.5) {   // mutlu kapalı göz ^ ^
    x.strokeStyle = FZ.lash; x.lineWidth = far ? 0.6 : 0.75;
    x.beginPath(); x.moveTo(cx - w, cy + 0.6); x.quadraticCurveTo(cx, cy - h * 1.1, cx + w, cy + 0.6); x.stroke(); return;
  }
  if (lid < 0.2) {       // göz kırpma
    x.strokeStyle = FZ.lash; x.lineWidth = far ? 0.55 : 0.7;
    x.beginPath(); x.moveTo(cx - w, cy + 0.5); x.quadraticCurveTo(cx, cy + 1.3, cx + w, cy + 0.5); x.stroke(); return;
  }
  const eh = h * Math.min(lid, 1.15), ec = cy + h - eh;
  x.save();
  x.beginPath(); x.ellipse(cx, ec, w, eh, 0, 0, 6.2832); x.fillStyle = '#fcf7f2'; x.fill(); x.clip();
  const ri = far ? 1.5 : 1.75, rx = far ? ri * 0.72 : ri * 0.92;
  const ix = cx + R.gx * w * 0.3 + (far ? 0.12 : 0.05), iy = cy + R.gy * h * 0.25 + 0.2;
  const ig = x.createRadialGradient(ix, iy + ri * 0.3, ri * 0.1, ix, iy, ri);
  ig.addColorStop(0, '#b27a45'); ig.addColorStop(0.5, '#70401f'); ig.addColorStop(1, '#2b160a');
  x.fillStyle = ig; x.beginPath(); x.ellipse(ix, iy, rx, ri, 0, 0, 6.2832); x.fill();
  x.fillStyle = '#130803'; x.beginPath(); x.ellipse(ix, iy, rx * 0.5, ri * 0.52, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(60,30,15,0.35)'; x.fillRect(cx - w, ec - eh, w * 2, eh * 0.45);           // üst kapak gölgesi
  x.fillStyle = '#ffffff';
  x.beginPath(); x.arc(ix + rx * 0.32, iy - ri * 0.36, ri * 0.33, 0, 6.2832); x.fill();
  x.beginPath(); x.arc(ix - rx * 0.32, iy + ri * 0.4, ri * 0.14, 0, 6.2832); x.fill();
  x.restore();
  x.strokeStyle = FZ.lash; x.lineWidth = far ? 0.5 : 0.62;
  x.beginPath(); x.ellipse(cx, ec, w * 1.02, eh * 1.02, 0, Math.PI * 1.08, Math.PI * 1.95); x.stroke();
}
function fzMouth(x, R) {
  const cx = 4.9, cy = 5.0, sm = R.mSmile, op = R.mOpen, ro = R.mRound;
  const w = lerp(lerp(3.0, 4.3, sm) + op * 0.5, 1.7, ro), h = op * lerp(2.2, 2.3, ro), up = sm * 0.8 * (1 - ro);
  const lx = cx - w * 0.55, rx = cx + w * 0.45, ly = cy - up, ry = cy - up * 0.55;
  x.lineCap = 'round';
  if (h < 0.4) {   // kapalı, yaramaz gülümseme
    x.strokeStyle = FZ.lip; x.lineWidth = 0.55;
    x.beginPath(); x.moveTo(lx, ly); x.quadraticCurveTo(cx - 0.2, cy + 0.6 + sm * 0.7, rx, ry); x.stroke();
    x.lineWidth = 0.32; x.strokeStyle = 'rgba(176,90,72,0.7)';
    x.beginPath(); x.moveTo(lx - 0.35, ly - 0.4); x.quadraticCurveTo(lx - 0.55, ly + 0.05, lx - 0.15, ly + 0.35); x.stroke();   // gamze
    x.beginPath(); x.moveTo(cx - 0.6, cy + 1.6 + sm * 0.3); x.quadraticCurveTo(cx + 0.2, cy + 2.0 + sm * 0.3, cx + 0.9, cy + 1.5 + sm * 0.3); x.stroke();  // alt dudak
    return;
  }
  x.beginPath(); x.moveTo(lx, ly);
  x.quadraticCurveTo(cx, (ly + ry) / 2 + 0.25 * (1 - ro) - ro * h * 0.9, rx, ry);
  x.quadraticCurveTo(cx + 0.1, cy + h * (1.7 - ro * 0.3), lx, ly); x.closePath();
  x.fillStyle = FZ.mouth; x.fill();
  x.save(); x.clip();
  x.fillStyle = FZ.tongue; x.beginPath(); x.ellipse(cx + 0.3, cy + h * 1.25, w * 0.26, h * 0.4, 0, 0, 6.2832); x.fill();
  if (ro < 0.5) { x.fillStyle = '#fbf8f3'; x.fillRect(lx, Math.min(ly, ry) - 1, rx - lx, 1.15 + up * 0.35); }
  x.restore();
  x.strokeStyle = FZ.lip; x.lineWidth = 0.35; x.stroke();
}
function fzHair(x, tm) {
  const hx = fzQ.a_hx, hy = fzQ.a_hy, H = FZ.hair;
  const L = (arr, k) => {
    for (let i = 0; i < arr.length; i++) {
      const l = arr[i], w = l[7], sw = Math.sin(tm * 1.7 + i * 1.9 + k) * 0.18 * w;
      fzLock(x, l[0], l[1], l[2] + hx * w + sw, l[3] + hy * w, l[4], l[5], H[l[6]]);
    }
  };
  L(FZ_BACK, 0);
  // saç kütlesi
  const hg = x.createLinearGradient(0, -13, 0, 8);
  hg.addColorStop(0, H[3]); hg.addColorStop(0.35, H[2]); hg.addColorStop(1, H[0]);
  x.fillStyle = hg; x.beginPath();
  const bx = hx * 0.3, byy = hy * 0.35;   // tepedeki kabarık dalgalar yaylarla hafifçe oynar
  x.moveTo(9.2, -3.6);
  x.quadraticCurveTo(10.6, -7.4, 8.4, -10.2);
  x.quadraticCurveTo(8.4 + bx, -12.8 + byy, 5.6, -12.7);
  x.quadraticCurveTo(4.2 + bx, -14.9 + byy, 1.6, -14.3);
  x.quadraticCurveTo(-0.6 + bx, -15.9 + byy, -2.9, -14.3);
  x.quadraticCurveTo(-5.6 + bx, -14.9 + byy, -6.8, -12.5);
  x.quadraticCurveTo(-9.6 + bx, -12.6 + byy, -9.8, -9.6);
  x.quadraticCurveTo(-12.2 + bx, -7.6 + byy, -11.5, -4.4);
  x.quadraticCurveTo(-12.3 + bx, -1.4, -11.0, 1.0);
  x.quadraticCurveTo(-11.2 + bx, 4.4, -9.8, 7.0 + hy * 0.4);
  x.lineTo(-7.2, 6.2);
  x.quadraticCurveTo(-5.4, 2.8, -4.2, 0.0);
  x.quadraticCurveTo(-2.4, -1.6, -0.4, -0.9);
  x.lineTo(0.2, -3.4);
  x.quadraticCurveTo(4.2, -4.6, 9.2, -3.6);
  x.closePath(); x.fill();
  L(FZ_TOP, 1); L(FZ_SIDE, 2); L(FZ_FRINGE, 3);
  // parlak teller
  x.lineCap = 'round';
  x.strokeStyle = 'rgba(205,155,105,0.45)'; x.lineWidth = 0.9;
  x.beginPath(); x.arc(-0.6, -2.0, 10.6, -2.85, -2.35); x.stroke();
  x.beginPath(); x.arc(-0.4, -1.8, 10.8, -2.15, -1.8); x.stroke();
  x.beginPath(); x.arc(0.2, -1.6, 10.4, -1.55, -1.15); x.stroke();
  // uçuşan teller
  x.strokeStyle = H[2]; x.lineWidth = 0.3;
  x.beginPath(); x.moveTo(-1.6, -14.4); x.quadraticCurveTo(-2.6, -16.0 + hy * 0.3, -4.4 + hx * 0.4, -16.0 + hy * 0.5);
  x.moveTo(-8.4, -10.8); x.quadraticCurveTo(-10.2, -12.0, -11.6 + hx * 0.4, -11.4 + hy * 0.5); x.stroke();
  x.strokeStyle = 'rgba(200,150,100,0.35)'; x.lineWidth = 0.4;
  x.beginPath(); x.moveTo(1.6, -9.6); x.quadraticCurveTo(4.6, -8.6, 5.6 + hx * 0.5, -5.2 + hy * 0.5);
  x.moveTo(-0.6, -9.4); x.quadraticCurveTo(1.6, -8.0, 2.4 + hx * 0.5, -4.6 + hy * 0.5);
  x.moveTo(-7.0, -6.2); x.quadraticCurveTo(-9.6, -2.0, -9.6 + hx * 0.8, 3.4 + hy); x.stroke();
}
function fzHead(x, R, tm) {
  // kafa ve yüz şekli: kafatası + yanak + çene
  const sg = x.createRadialGradient(3.6, -1.6, 1, 2.0, 0.5, 11.5);
  sg.addColorStop(0, FZ.skinHi); sg.addColorStop(0.5, FZ.skin); sg.addColorStop(1, FZ.skinS);
  x.fillStyle = sg; x.beginPath();
  fzEl(x, -0.3, -1.6, 8.6, 8.6); fzEl(x, 3.0, 3.0, 6.0, 5.0); fzEl(x, 6.7, 2.6, 2.8, 3.3);
  fzEl(x, 4.0, 5.6, 3.0, 2.4); fzEl(x, -1.2, 2.8, 5.6, 4.6);
  x.fill();
  x.save(); x.clip();
  // çene altı gölgesi, saç çizgisi gölgesi, yanak pembeliği (yüzün içinde kalsın)
  x.fillStyle = 'rgba(190,115,90,0.22)'; x.beginPath(); x.ellipse(1.6, 7.6, 5.0, 1.3, 0.1, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(150,80,55,0.16)'; x.beginPath(); x.ellipse(4.2, -3.6, 6.2, 1.5, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(255,125,125,0.16)'; x.beginPath(); x.ellipse(1.6, 3.6, 2.7, 2.0, 0, 0, 6.2832); x.ellipse(7.9, 3.1, 1.3, 1.6, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(255,120,120,0.16)'; x.beginPath(); x.ellipse(1.6, 3.6, 1.6, 1.15, 0, 0, 6.2832); x.ellipse(7.9, 3.1, 0.8, 1.0, 0, 0, 6.2832); x.fill();
  x.restore();
  // kulak
  x.fillStyle = FZ.skin; x.beginPath(); x.ellipse(-2.3, 2.0, 1.9, 2.55, 0.1, 0, 6.2832); x.fill();
  x.strokeStyle = 'rgba(190,115,90,0.7)'; x.lineWidth = 0.4; x.lineCap = 'round';
  x.beginPath(); x.arc(-2.1, 2.1, 1.05, -1.4, 1.9); x.stroke();
  x.beginPath(); x.arc(-2.0, 2.3, 0.45, -0.5, 2.2); x.stroke();
  // gözler ve kaşlar
  fzEye(x, 2.0, -0.4, 1.65, 2.15, R, false);
  fzEye(x, 6.5, -0.6, 1.1, 2.0, R, true);
  const br = -0.65 * R.brow;
  x.strokeStyle = FZ.brow; x.lineWidth = 0.6; x.lineCap = 'round';
  x.beginPath(); x.moveTo(0.3, -3.4 + br); x.quadraticCurveTo(1.9, -4.3 + br * 1.2, 3.5, -3.8 + br);
  x.moveTo(5.9, -3.9 + br); x.quadraticCurveTo(7.0, -4.5 + br * 1.2, 8.0, -3.8 + br); x.stroke();
  // burun
  x.strokeStyle = 'rgba(200,120,95,0.55)'; x.lineWidth = 0.42;
  x.beginPath(); x.moveTo(6.5, 1.0); x.quadraticCurveTo(7.4, 2.4, 6.4, 3.0); x.stroke();
  x.fillStyle = 'rgba(200,120,95,0.5)'; x.beginPath(); x.ellipse(5.8, 3.0, 0.75, 0.35, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(255,245,236,0.85)'; x.beginPath(); x.arc(6.0, 1.9, 0.38, 0, 6.2832); x.fill();
  fzMouth(x, R);
  fzHair(x, tm);
}

// ── tüm vücut (yerel koordinat) ──
function fzDraw(x, tm) {
  const R = fzQ.a_R, hip = fzQ.a_hipY, hx = R.hx;
  const legF = fzJ(hx + 0.8, hip, FZ_TH, R.lt1, FZ_SH, R.lt2), legB = fzJ(hx - 1.2, hip, FZ_TH, R.bt1, FZ_SH, R.bt2);
  const by = -0.28 * R.breath - R.shr;
  x.save(); x.translate(hx, hip); x.rotate(R.lean);
  fzArm(x, -0.8, -11.8 + by * 0.6, R.ba1, R.ba2, true, 0);
  x.restore();
  fzLeg(x, legB, true, R);
  x.save(); x.translate(hx, hip); x.rotate(R.lean * 0.4); fzShorts(x); x.restore();
  const tuck = R.lt1 > 0.9;   // diz göğse çekilince ön bacak gövdenin önünde
  if (!tuck) fzLeg(x, legF, false, R);
  x.save(); x.translate(hx, hip); x.rotate(R.lean);
  fzTorso(x, R, tm);
  x.restore();
  if (tuck) fzLeg(x, legF, false, R);
  x.save(); x.translate(hx, hip); x.rotate(R.lean);
  // boyun ve yaka
  fzTaper(x, 1.6, -11.6 + by, 2.0, -14.6 + by, 2.3, 2.2, FZ.skinS);
  x.strokeStyle = FZ.pjS; x.lineWidth = 0.8;
  x.beginPath(); x.ellipse(1.7, -13.2 + by, 2.5, 0.9, -0.12, 0.25, 2.9); x.stroke();
  x.save(); x.translate(1.9, -14.4 + by); x.rotate(R.head); x.scale(1.03, 1.03); x.translate(1.3, -7.7);
  fzHead(x, R, tm);
  x.restore();
  fzArm(x, 1.2, -11.4 + by, R.la1, R.la2, false, R.hOpen);
  x.restore();
}

// ── önden görünüş: dönüşlerde ve ara sıra kameraya bakarken ──
function fzHairFront(x, tm, back) {
  const hx = fzQ.a_hx * 0.5, hy = fzQ.a_hy, H = FZ.hair;
  if (back) {   // başın arkasında kalan saç kütlesi (kafaya yakın, yanlara taşmaz)
    x.fillStyle = H[1]; x.beginPath();
    x.moveTo(-9.0, 3.4); x.quadraticCurveTo(-11.2, -4, -9.4, -10.4); x.quadraticCurveTo(-5, -15.6, 0, -15.4);
    x.quadraticCurveTo(5, -15.6, 9.4, -10.4); x.quadraticCurveTo(11.2, -4, 9.0, 3.4); x.lineTo(-9.0, 3.4); x.closePath(); x.fill();
    return;
  }
  // yan görünüşle aynı kestane tonları
  const hg = x.createLinearGradient(0, -15, 0, 6);
  hg.addColorStop(0, H[3]); hg.addColorStop(0.38, H[2]); hg.addColorStop(1, H[0]);
  x.fillStyle = hg; x.beginPath();
  const b = hy * 0.35, c = hx * 0.6;
  x.moveTo(-9.3, -0.4); x.quadraticCurveTo(-10.9, -5.0, -9.4, -8.6);
  x.quadraticCurveTo(-10.0 + c, -12.0 + b, -7.0, -12.4);                       // dağınık, kabarık tepe
  x.quadraticCurveTo(-6.6 + c, -15.2 + b, -3.6, -14.6);
  x.quadraticCurveTo(-1.8 + c, -16.6 + b, 0.6, -15.4);
  x.quadraticCurveTo(3.0 + c, -16.6 + b, 4.6, -14.4);
  x.quadraticCurveTo(7.6 + c, -14.8 + b, 7.6, -12.0);
  x.quadraticCurveTo(10.2 + c, -11.4 + b, 9.4, -8.6);
  x.quadraticCurveTo(10.9, -5.0, 9.3, -0.4);
  x.lineTo(8.2, -1.6); x.quadraticCurveTo(7.8, -3.6, 5.6, -4.6); x.lineTo(-5.6, -4.6); x.quadraticCurveTo(-7.8, -3.6, -8.2, -1.6);
  x.closePath(); x.fill();
  // yanlar: kulağın üstünü örter, kulak memesi hizasında kafaya yakın biter
  fzLock(x, -8.0, -7.6, -9.1 + hx * 0.3, 3.2 + hy * 0.3, 1.5, 0.35, H[1]);
  fzLock(x, 8.0, -7.6, 9.1 + hx * 0.3, 3.2 + hy * 0.3, 1.5, -0.35, H[1]);
  fzLock(x, -7.2, -8.6, -8.6 + hx * 0.3, 0.6 + hy * 0.3, 1.3, 0.2, H[2]);
  fzLock(x, 7.2, -8.6, 8.6 + hx * 0.3, 0.6 + hy * 0.3, 1.3, -0.2, H[2]);
  // birkaç kısa, yumuşak tutam
  fzLock(x, -4.6, -13.4, -7.4 + hx, -15.0 + hy * 0.5, 1.3, 0.4, H[2]);
  fzLock(x, 2.6, -14.4, 5.4 + hx, -16.0 + hy * 0.5, 1.2, -0.4, H[3]);
  // kakül: düz kesik değil, dağınık; çoğu bir yana taranmış
  const F = FZ_FRONT_FRINGE;
  for (let i = 0; i < F.length; i++) {
    const l = F[i], sw = Math.sin(tm * 1.7 + i * 1.9) * 0.12;
    fzLock(x, l[0], l[1], l[2] + hx * 0.7 + sw, l[3] + hy * 0.7, l[4], l[5], H[l[6]]);
  }
  x.strokeStyle = 'rgba(205,155,105,0.45)'; x.lineWidth = 0.9; x.lineCap = 'round';
  x.beginPath(); x.arc(0, -1.5, 12.0, -2.55, -2.1); x.stroke();
  x.beginPath(); x.arc(0, -1.5, 12.3, -1.3, -0.85); x.stroke();
  x.strokeStyle = 'rgba(200,150,100,0.35)'; x.lineWidth = 0.4;
  x.beginPath(); x.moveTo(-0.4, -12.8); x.quadraticCurveTo(2.6, -10.4, 3.8 + hx * 0.5, -5.8 + hy * 0.5); x.stroke();
}
const FZ_FRONT_FRINGE = [
  [-3.2, -12.6, -7.4, -4.6, 1.8, 1.0, 1], [-2.0, -13.4, -4.6, -3.6, 1.9, 0.7, 2], [-0.8, -13.8, -1.8, -5.4, 1.8, 0.4, 1],
  [0.2, -13.8, 1.4, -3.4, 2.0, -0.6, 2], [1.4, -13.6, 4.0, -4.8, 1.9, -1.0, 1], [2.6, -13.2, 6.0, -3.6, 1.9, -1.3, 2],
  [3.8, -12.4, 8.0, -5.2, 1.6, -1.2, 1], [-1.4, -13.6, -0.2, -6.0, 0.8, -0.3, 3], [1.8, -13.4, 4.8, -5.6, 0.75, -1.0, 3],
  [3.2, -12.8, 6.8, -4.6, 0.7, -1.2, 3]];
function fzHeadFront(x, R, tm) {
  fzHairFront(x, tm, true);
  x.fillStyle = FZ.skinS;   // kulaklar
  x.beginPath(); x.ellipse(-8.5, 1.8, 1.6, 2.3, 0.15, 0, 6.2832); x.ellipse(8.5, 1.8, 1.6, 2.3, -0.15, 0, 6.2832); x.fill();
  const sg = x.createRadialGradient(0, -1.0, 1, 0, 0.5, 11.5);
  sg.addColorStop(0, FZ.skinHi); sg.addColorStop(0.55, FZ.skin); sg.addColorStop(1, FZ.skinS);
  x.fillStyle = sg; x.beginPath();
  fzEl(x, 0, -1.6, 8.5, 8.5); fzEl(x, -4.0, 3.2, 4.7, 4.5); fzEl(x, 4.0, 3.2, 4.7, 4.5); fzEl(x, 0, 5.4, 4.2, 2.8);
  x.fill();
  x.save(); x.clip();
  x.fillStyle = 'rgba(150,80,55,0.16)'; x.beginPath(); x.ellipse(0, -3.8, 7.4, 1.5, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(255,125,125,0.17)'; x.beginPath(); x.ellipse(-4.8, 3.4, 2.5, 1.9, 0, 0, 6.2832); x.ellipse(4.8, 3.4, 2.5, 1.9, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(255,120,120,0.16)'; x.beginPath(); x.ellipse(-4.8, 3.4, 1.5, 1.1, 0, 0, 6.2832); x.ellipse(4.8, 3.4, 1.5, 1.1, 0, 0, 6.2832); x.fill();
  x.restore();
  fzEye(x, -3.2, -0.4, 1.6, 2.15, R, false);
  fzEye(x, 3.2, -0.4, 1.6, 2.15, R, false);
  const br = -0.65 * R.brow;
  x.strokeStyle = FZ.brow; x.lineWidth = 0.6; x.lineCap = 'round';
  x.beginPath(); x.moveTo(-4.8, -3.4 + br); x.quadraticCurveTo(-3.3, -4.2 + br * 1.2, -1.8, -3.7 + br);
  x.moveTo(1.8, -3.7 + br); x.quadraticCurveTo(3.3, -4.2 + br * 1.2, 4.8, -3.4 + br); x.stroke();
  x.fillStyle = 'rgba(200,120,95,0.5)'; x.beginPath(); x.ellipse(0, 2.9, 0.85, 0.38, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(255,245,236,0.85)'; x.beginPath(); x.arc(0.1, 1.9, 0.4, 0, 6.2832); x.fill();
  x.save(); x.translate(-4.6, 0.3); fzMouth(x, R); x.restore();
  fzHairFront(x, tm, false);
}
function fzDrawFront(x, tm) {
  const R = fzQ.a_R, hip = fzQ.a_hipY, by = -0.28 * R.breath - R.shr;
  // bacaklar (önden: uzunluk dikey izdüşüm)
  for (let i = 0; i < 2; i++) {
    const sd = i ? 1 : -1, a1 = i ? R.lt1 : R.bt1, a2 = i ? R.lt2 : R.bt2;
    const hx0 = sd * 2.5, ky = hip + FZ_TH * Math.cos(a1), fy = ky + FZ_SH * Math.cos(a1 + a2), kx = sd * 2.8, fx = sd * 2.7;
    fzTaper(x, kx, ky, fx, fy, 2.45, 1.7, FZ.skin);
    fzTaper(x, hx0, hip, kx, ky, 2.85, 2.5, FZ.skin);
    x.fillStyle = 'rgba(255,240,228,0.5)'; x.beginPath(); x.ellipse(kx, ky, 1.0, 0.8, 0, 0, 6.2832); x.fill();
    x.fillStyle = '#f3efe7'; x.beginPath(); x.ellipse(fx, fy - 0.2, 1.6, 1.0, 0, 0, 6.2832); x.fill();   // çorap
    x.fillStyle = FZ.shoe; x.beginPath(); x.ellipse(fx, fy + 0.9, 2.1, 1.35, 0, 0, 6.2832); x.fill();   // ayakkabı önden
    x.fillStyle = FZ.blue; x.beginPath(); x.ellipse(fx, fy + 1.35, 1.7, 0.8, 0, 0, 3.1416); x.fill();
    x.fillStyle = FZ.sole; x.fillRect(fx - 2.1, fy + 1.7, 4.2, 0.55);
    fzTaper(x, hx0, hip, lerp(hx0, kx, 0.5), lerp(hip, ky, 0.5), 3.3, 3.1, FZ.pj);   // şort paçası
  }
  x.save(); x.translate(0, hip);
  x.fillStyle = FZ.pj; x.beginPath(); x.roundRect(-6.0, -1.0, 12.0, 4.6, 2.0); x.fill();
  x.strokeStyle = FZ.pjLine; x.lineWidth = 0.4; x.beginPath(); x.moveTo(0, 1.0); x.lineTo(0, 3.6); x.stroke();
  fzPlane(x, -3.2, 2.0, 0.65, FZ.sky, 0.2); x.fillStyle = FZ.star; fzStar(x, 3.2, 2.2, 0.45);
  // gövde
  const lift = R.air * clamp(fzQ.vy / 700, -0.4, 1) * 1.4, fl = R.air * Math.sin(tm * 23) * 0.35, hb = 1.4 - lift + fl, b = R.breath;
  x.save(); x.scale(1 + 0.012 * b, 1 + 0.018 * b);
  x.beginPath(); x.moveTo(-6.1, hb);
  x.quadraticCurveTo(-7.0, -5, -6.3, -9.4); x.quadraticCurveTo(-6.5, -12.9, -3.2, -13.6);
  x.quadraticCurveTo(0, -14.3, 3.2, -13.6); x.quadraticCurveTo(6.5, -12.9, 6.3, -9.4);
  x.quadraticCurveTo(7.0, -5, 6.1, hb - fl * 2); x.quadraticCurveTo(0, hb + 1.1, -6.1, hb); x.closePath();
  x.fillStyle = FZ.pj; x.fill();
  x.save(); x.clip();
  x.save(); x.translate(0.4, 1.8); x.scale(1.1, 0.92); fzPrint(x); x.restore();
  const sg = x.createLinearGradient(-7, 0, 7, 0);
  sg.addColorStop(0, 'rgba(70,58,110,0.3)'); sg.addColorStop(0.3, 'rgba(70,58,110,0)'); sg.addColorStop(0.7, 'rgba(70,58,110,0)'); sg.addColorStop(1, 'rgba(70,58,110,0.3)');
  x.fillStyle = sg; x.fillRect(-8, -15, 16, 19);
  x.fillStyle = 'rgba(70,58,110,0.12)'; x.fillRect(-8, hb - 1.4, 16, 4);
  x.restore();
  x.restore();
  // ara sahne: kucaktaki oyuncak gövdenin önüne, kolların arkasına çizilir
  if (fzQ.ara) fzQ.ara();
  // kollar iki yanda (ara sahnede hedef noktalı kollar: ovuşturma, sarılma, kollar havada)
  if (fzQ.ik) for (let i = 0; i < 2; i++) { const k = fzQ.ik[i]; fzArmIK(x, (i ? 5.5 : -5.5), -11.0 + by, k[0], k[1], i ? -1 : 1, k[2] || 0); }
  else for (let i = 0; i < 2; i++) {
    const sd = i ? 1 : -1, a1 = i ? R.la1 : R.ba1, a2 = i ? R.la2 : R.ba2, op = i ? R.hOpen : 0;
    const sx = sd * 5.5, sy = -11.0 + by;
    const ex = sx + sd * (0.5 + 0.3 * FZ_UA * Math.abs(Math.sin(a1))), ey = sy + FZ_UA * Math.cos(a1);
    const b2 = a1 + a2, wx = ex + sd * (0.2 + 0.25 * FZ_FA * Math.abs(Math.sin(b2))), wy = ey + FZ_FA * Math.cos(b2);
    fzTaper(x, ex, ey, wx, wy, 1.55, 1.35, FZ.skin);
    fzTaper(x, sx, sy, ex, ey, 1.8, 1.55, FZ.skin);
    const dl = Math.hypot(wx - ex, wy - ey) || 1, hx2 = wx + (wx - ex) / dl * 1.2, hy2 = wy + (wy - ey) / dl * 1.2;
    x.fillStyle = FZ.skin; x.beginPath(); x.arc(hx2, hy2, 1.9, 0, 6.2832); x.fill();
    if (op > 0.4) for (let f = 0; f < 4; f++) { const fa = Math.atan2(hy2 - wy, hx2 - wx) - 0.45 + f * 0.3; fzTaper(x, hx2, hy2, hx2 + Math.cos(fa) * 2.4, hy2 + Math.sin(fa) * 2.4, 0.55, 0.45, FZ.skin); }
    fzTaper(x, sx, sy, lerp(sx, ex, 0.55), lerp(sy, ey, 0.55), 2.35, 2.2, FZ.pj);
  }
  // boyun, yaka, kafa
  fzTaper(x, 0, -11.4 + by, 0, -14.4 + by, 2.4, 2.3, FZ.skinS);
  x.strokeStyle = FZ.pjS; x.lineWidth = 0.8; x.beginPath(); x.ellipse(0, -13.0 + by, 2.7, 1.0, 0, 0.15, 2.99); x.stroke();
  x.save(); x.translate(0, -14.4 + by); x.rotate(R.head * 0.3); x.scale(1.03, 1.03); x.translate(0, -7.7);
  fzHeadFront(x, R, tm);
  x.restore();
  x.restore();
}

// ── kenar ışığı (Ori tarzı): silueti ışığa doğru kaydırıp çıkarınca ince parlak kenar kalır ──
function fzRim(lx, ly, d, col, al) {
  if (al < 0.02) return;
  const px = fzC.width, r = fzRX;
  r.globalCompositeOperation = 'source-over'; r.clearRect(0, 0, px, px); r.drawImage(fzC, 0, 0);
  r.globalCompositeOperation = 'source-in'; r.fillStyle = col; r.fillRect(0, 0, px, px);
  r.globalCompositeOperation = 'destination-out'; r.drawImage(fzC, -lx * d, -ly * d);
  r.globalCompositeOperation = 'source-over';
  // ince, yumuşak kenar: bant bir kez, yarısı ışığa doğru kaydırılarak bir kez daha (dış kenar daha parlak)
  fzX.globalCompositeOperation = 'source-atop';
  fzX.globalAlpha = al * 0.5; fzX.drawImage(fzR, 0, 0);
  fzX.globalAlpha = al * 0.6; fzX.drawImage(fzR, lx * d * 0.5, ly * d * 0.5);
  fzX.globalAlpha = 1; fzX.globalCompositeOperation = 'source-over';
}

function drawFeza(tm) {
  if (P.fade > 0 && !P.respawned) return;
  if (!P.a_R) fezaInit();
  const SZ = 120, OY = SZ - 14, px = Math.ceil(SZ * S), x = fzX, R = P.a_R;
  if (fzC.width !== px) { fzC.width = fzC.height = px; fzR.width = fzR.height = px; }
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, px, px);
  // dönüş: yan -> önden -> yeni yan. Genişlik hiç 0.92'nin altına inmez; ayna çevirme önden görünüşteyken olur.
  const u = P.a_turnU < 1 ? P.a_turnU : P.a_fu > 0 ? P.a_fu : 1, front = u > 0.3 && u < 0.72;
  const fsc = P.a_side * (u < 0.3 ? lerp(1, 0.92, u / 0.3) : u >= 0.72 && u < 1 ? lerp(0.92, 1, (u - 0.72) / 0.28) : 1);
  x.setTransform(S, 0, 0, S, SZ / 2 * S, OY * S);
  x.scale(fsc * R.sx * FZ_SC, R.sy * FZ_SC);
  if (P.a_spin) { x.translate(0, -30); x.rotate(P.a_spin); x.translate(0, 30); }
  if (front) fzDrawFront(x, tm); else fzDraw(x, tm);
  // ışıklandırma: ortam rengi (aşağıdan mavi) + Pırıl'ın mor ışığı
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = 'source-atop';
  const lg = x.createLinearGradient(0, px * 0.1, 0, px);
  lg.addColorStop(0, 'rgba(20,40,90,0.12)'); lg.addColorStop(1, C('l3', 0.55 - light * 0.2));
  x.fillStyle = lg; x.fillRect(0, 0, px, px);
  const dx = (D.x - P.x) * S + px / 2, dy = (D.y - P.y) * S + OY * S;
  const rg = x.createRadialGradient(dx, dy, 0, dx, dy, px * 0.9);
  rg.addColorStop(0, 'rgba(200,150,255,0.35)'); rg.addColorStop(1, 'rgba(200,150,255,0)');
  x.fillStyle = rg; x.fillRect(0, 0, px, px);
  x.globalCompositeOperation = 'source-over';
  // kenar ışıkları: sağ üstteki ay + Pırıl
  fzRim(0.72, -0.69, 0.75 * S, C('rim'), 0.75 - light * 0.25);
  const ddx = D.x - P.x, ddy = D.y - (P.y - 38), dd = Math.hypot(ddx, ddy) || 1;
  fzRim(ddx / dd, ddy / dd, 0.75 * S, '#d2a6ff', 0.6 * clamp(1.2 - dd / 220, 0, 1));
  let a = 1; if (P.fade > 0) a = 1 - clamp(P.fade / 0.6, 0, 1);
  g.globalAlpha = a;
  g.drawImage(fzC, (P.x - cam.x - SZ / 2) * S, (P.y - cam.y - OY) * S);
  g.globalAlpha = 1;
}

// ── animasyon ──
function fezaInit() {
  P.a_pose = Object.assign({}, FZ_REST); P.a_R = Object.assign({}, FZ_REST);
  P.a_t = 0; P.a_face = P.f; P.a_side = P.f; P.a_turnU = 1; P.a_turnTo = P.f; P.a_turnDur = 0.16; P.a_front = false; P.a_fu = 0; P.a_state = 'idle'; P.a_sw = 1; P.a_wasG = P.ground; P.a_prevVy = 0;
  P.a_landT = 9; P.a_landP = 0; P.a_take = 0; P.a_skid = 0; P.a_skidDir = 1; P.a_idle = 0; P.a_waving = false; P.a_waveDir = 1;
  P.a_lookT = 1.2; P.a_look = 0; P.a_blink = 2.5; P.a_lidM = 1; P.a_spin = 0;
  P.a_hx = P.a_hy = P.a_hvx = P.a_hvy = 0; P.a_hipY = -(FZ_TH + FZ_SH + FZ_FT); P.a_hipV = 0;
}
// oyun.js her karede fizikten sonra çağırır
function fezaUpdate(dt) {
  if (!P.a_pose) fezaInit();
  if (!(dt > 0)) return;
  dt = Math.min(dt, 0.05);
  const t = (P.a_t += dt), sp = Math.abs(P.vx), vy = P.vy, gr = P.ground && P.fade <= 0;
  // olaylar: yere iniş, kalkış, kayma (ters yöne dönerken)
  if (gr && !P.a_wasG) { P.a_landT = 0; P.a_landP = clamp(P.a_prevVy / 850, 0.18, 1); }
  if (!gr && P.a_wasG && vy < -300) P.a_take = 1;
  P.a_wasG = gr; P.a_prevVy = vy;
  P.a_landT += dt; P.a_take = Math.max(0, P.a_take - dt / 0.18);
  if (gr && sp > 110 && Math.sign(P.vx) !== P.f) { if (P.a_skid <= 0) { P.a_skidDir = Math.sign(P.vx); P.a_skid = 0.12; } }
  else P.a_skid = gr ? P.a_skid - dt : 0;
  const still = gr && sp < 5 && !P.flip;
  P.a_idle = still ? P.a_idle + dt : 0;
  const wc = P.a_idle - 4, waving = wc >= 0 && wc % 10 < 2.8;
  if (waving && !P.a_waving) P.a_waveDir = Math.sign(D.x - P.x) || P.f;
  P.a_waving = waving;
  // yön: dönüşte genişlik sıfırdan geçerek yumuşak çevrilir
  const ft = P.a_skid > 0 ? P.a_skidDir : waving ? P.a_waveDir : P.f;
  if (P.a_turnU >= 1 && ft !== P.a_side) { P.a_turnU = 0; P.a_turnTo = ft; P.a_turnDur = sp > 60 || !gr ? 0.1 : 0.16; }
  else if (P.a_turnU < 1 && ft !== P.a_turnTo) { P.a_turnTo = ft; P.a_turnU = 1 - P.a_turnU; }   // yarıda vazgeçti
  if (P.a_turnU < 1) {
    P.a_turnU = Math.min(1, P.a_turnU + dt / P.a_turnDur);
    if (P.a_turnU >= 0.5 && P.a_side !== P.a_turnTo) {   // ayna çevirme (önden görünüşün içinde, görünmez)
      P.a_side = P.a_turnTo; P.a_pose.gx = -P.a_pose.gx; P.a_hx = -P.a_hx; P.a_hvx = -P.a_hvx;
    }
  }
  P.a_face = P.a_side;
  // kameraya bakma: aynı geçiş (önce gözler, kısa daralma, önden görünüş; dönüşte geri)
  if (P.a_turnU < 1) P.a_fu = 0;
  else if (P.a_front) { if (P.a_fu < 0.5) P.a_fu = Math.min(0.5, P.a_fu + dt / 0.16); }
  else if (P.a_fu > 0) { P.a_fu += (P.a_fu < 0.3 ? -1 : 1) * dt / 0.16; if (P.a_fu >= 1 || P.a_fu <= 0) P.a_fu = 0; }
  const lvx = P.vx * ft;
  // Pırıl'a bakış yönü (yerel)
  const gpx = clamp((D.x - P.x) * ft / 45, -1, 1), gpy = clamp((D.y - (P.y - 58)) / 45, -1, 1);
  // durum
  let st;
  if (P.flip > 0) st = 'flip';
  else if (!gr) st = vy < -170 ? 'rise' : vy < 170 ? 'apex' : 'fall';
  else if (P.a_skid > 0) st = 'skid';
  else if (sp > 5) st = 'run';
  else st = waving ? 'wave' : 'idle';
  if (st !== P.a_state) { P.a_state = st; P.a_sw = 0; }
  P.a_sw += dt;
  const T = Object.assign(FZ_T, FZ_REST);
  P.a_front = false;
  if (st === 'idle' || st === 'wave') {
    const b = Math.sin(t * 2.4), s = Math.sin(t * 0.8);
    T.breath = b; T.hx = s * 0.45; T.lean = 0.02 + 0.012 * b - s * 0.015;
    T.lt1 = 0.05 + 0.08 * Math.max(0, s); T.lt2 = -0.08 - 0.24 * Math.max(0, s);
    T.bt1 = -0.04 + 0.06 * Math.max(0, -s); T.bt2 = -0.06 - 0.22 * Math.max(0, -s);
    T.la1 = 0.12 + 0.04 * b; T.ba1 = -0.1 + 0.03 * b; T.head = -0.02 * b;
    // etrafa bakınma
    P.a_lookT -= dt;
    if (P.a_lookT <= 0) {
      const r = Math.random();
      P.a_look = P.a_idle < 1.5 ? (r < 0.5 ? 0 : 1) : r < 0.35 ? 1 : r < 0.55 ? 0 : r < 0.7 ? 2 : r < 0.8 ? 3 : r < 0.9 ? 4 : 5;
      P.a_lookT = 1.2 + Math.random() * 2.2;
    }
    const lk = P.a_look;
    if (lk === 1) { T.gx = gpx; T.gy = gpy; T.head = -gpy * 0.16; T.brow = 0.15; }
    else if (lk === 2) { T.gx = 0.3; T.gy = -0.85; T.head = -0.12; T.brow = 0.3; }
    else if (lk === 3) { T.gx = 0.5; T.gy = 0.8; T.head = 0.1; }
    else if (lk === 4) { T.gx = -1; T.gy = 0; T.head = 0.03; }
    else if (lk === 5 && st === 'idle' && P.a_turnU >= 1) { P.a_front = true; T.gx = 0; T.gy = 0; T.mSmile = 1; T.brow = 0.2; }   // kameraya bakar
    T.mSmile = 0.75;
    if (st === 'wave') {   // Pırıl'a dönüp el sallar
      T.shr = 0.6; T.la1 = 1.65; T.la2 = 0.75 + 0.4 * Math.sin(t * 11); T.lean = -0.06;
      T.gx = gpx; T.gy = gpy; T.head = -0.12 - gpy * 0.1; T.mOpen = 0.6; T.hOpen = 1; T.mSmile = 1; T.brow = 0.4;
    }
  } else if (st === 'run') {
    const r = clamp(sp / 250, 0, 1), q = P.run, amp = 0.3 + 0.55 * r, sq = Math.sin(q);
    T.lt1 = sq * amp + 0.08 * r; T.lt2 = -(0.12 + (0.3 + 1.1 * r) * Math.max(0, Math.cos(q - 0.5)));
    T.bt1 = -sq * amp + 0.08 * r; T.bt2 = -(0.12 + (0.3 + 1.1 * r) * Math.max(0, Math.cos(q + Math.PI - 0.5)));
    T.la1 = -sq * (0.25 + 0.75 * r) + 0.1; T.la2 = 0.45 + 0.85 * r;
    T.ba1 = sq * (0.25 + 0.75 * r) + 0.1; T.ba2 = 0.45 + 0.85 * r;
    T.lean = 0.05 + 0.17 * r; T.hx = 0.6 * r; T.head = -T.lean * 0.55 + 0.05 * Math.cos(2 * q) * r;
    T.mSmile = 1; T.mOpen = r > 0.7 ? 0.5 : 0; T.gx = 0.9; T.gy = 0.1; T.brow = 0.1; T.breath = 0;
  } else if (st === 'skid') {
    T.lean = -0.32; T.hx = -1.0; T.lt1 = 0.75; T.lt2 = -0.15; T.bt1 = 0.05; T.bt2 = -0.9;
    T.la1 = 1.3; T.la2 = 0.3; T.ba1 = 1.0; T.ba2 = 0.35; T.head = -0.18;
    T.mRound = 0.8; T.mOpen = 0.5; T.mSmile = 0.3; T.brow = 0.8; T.gx = 1; T.lid = 1.1;
  } else if (st === 'rise') {
    T.air = 1; T.lt1 = 1.35; T.lt2 = -1.95; T.bt1 = -0.2; T.bt2 = -0.6;
    T.la1 = -2.9; T.la2 = 0.25; T.hOpen = 1; T.ba1 = 1.7; T.ba2 = 0.5; T.shr = 0.8; T.lean = -0.04; T.head = -0.12;
    T.mOpen = 0.75; T.mSmile = 1; T.gx = 0.6; T.gy = -0.5; T.brow = 0.4; T.lid = 1.05;
  } else if (st === 'apex') {
    T.air = 1; T.lt1 = 1.0; T.lt2 = -1.5; T.bt1 = 0.25; T.bt2 = -0.9;
    T.la1 = -2.4; T.la2 = 0.4; T.ba1 = 1.6; T.ba2 = 0.6; T.shr = 0.5; T.lean = 0; T.head = -0.05;
    T.mOpen = 0.5; T.mSmile = 1; T.gx = 0.6; T.gy = 0.3; T.brow = 0.3;
  } else if (st === 'fall') {
    const f = clamp((vy - 170) / 600, 0.3, 1);
    T.air = 1; T.lt1 = 0.3 + 0.12 * Math.sin(t * 9); T.lt2 = -0.5; T.bt1 = -0.12 - 0.1 * Math.sin(t * 9 + 1); T.bt2 = -0.35;
    T.hOpen = 1; T.la1 = -2.15 + 0.3 * Math.sin(t * 13) * f; T.la2 = 0.5 + 0.2 * Math.sin(t * 11);
    T.ba1 = 1.9 + 0.3 * Math.sin(t * 13 + 2) * f; T.ba2 = 0.7; T.shr = 0.5;
    T.lean = 0.05; T.head = -0.04; T.mRound = 1; T.mOpen = 0.65; T.mSmile = 0.2;
    T.brow = 0.2 + 0.6 * f; T.lid = 1.12; T.gx = 0.5; T.gy = 0.7;
  } else {   // flip: Pırıl iter, toparlanıp ileri takla
    T.air = 1; T.lt1 = 2.05; T.lt2 = -2.45; T.bt1 = 1.85; T.bt2 = -2.35;
    T.la1 = 1.25; T.la2 = 1.25; T.ba1 = 1.05; T.ba2 = 1.35; T.lean = 0.25; T.head = 0.3;
    T.happy = 1; T.mOpen = 0.9; T.mSmile = 1; T.brow = 0.3;
  }
  // yumuşak geçiş (üstel yaklaşım); durum değişiminden sonra hız artar
  const k = st === 'flip' ? 30 : lerp(10, 32, clamp(P.a_sw / 0.3, 0, 1)), m = 1 - Math.exp(-k * dt), cur = P.a_pose;
  if (P.a_turnU < 0.5) { T.gx = -1; T.gy = 0; }   // dönüşte önce gözler yeni yöne bakar
  for (const key of FZ_KEYS) cur[key] += (T[key] - cur[key]) * m;
  // göz kırpma (bazen çift)
  P.a_blink -= dt;
  if (P.a_blink < -0.13) P.a_blink = Math.random() < 0.2 ? 0.22 : 1.8 + Math.random() * 3;
  P.a_lidM += ((P.a_blink < 0 ? 0 : 1) - P.a_lidM) * (1 - Math.exp(-dt * 45));
  // çizim pozu = yumuşak poz + iniş çökmesi + kalkış uzaması
  const R = Object.assign(P.a_R, cur), lt = P.a_landT;
  const cr = gr ? P.a_landP * (lt < 0.05 ? lt / 0.05 : Math.exp(-(lt - 0.05) * 7.5)) : 0, tk = P.a_take;
  R.lt1 += 0.8 * cr; R.lt2 -= 1.5 * cr; R.bt1 += 0.6 * cr; R.bt2 -= 1.4 * cr; R.lean += 0.25 * cr; R.head += 0.12 * cr;
  R.la1 += 0.5 * cr; R.ba1 += 0.4 * cr; R.sx += 0.1 * cr; R.sy -= 0.08 * cr; R.lid *= 1 - 0.3 * cr;
  R.sy += 0.08 * tk; R.sx -= 0.06 * tk; R.lt1 -= 0.6 * tk * R.lt1; R.lt2 *= 1 - 0.7 * tk;
  // takla açısı (başı ve sonu yavaş)
  const u = P.flip > 0 ? 1 - P.flip : 0;
  P.a_spin = u > 0 ? (u - Math.sin(u * 6.2832) / 6.2832) * 6.2832 : 0;
  // kalça yüksekliği: yerdeyken en alttaki ayak tam yere bassın
  const fy = (a1, a2) => FZ_TH * Math.cos(a1) + FZ_SH * Math.cos(a1 + a2) + FZ_FT;
  const hipG = -Math.max(fy(R.lt1, R.lt2), fy(R.bt1, R.bt2));
  const hip = lerp(hipG, FZ_AIRHIP, R.air) + R.bob;
  P.a_hipV = (hip - P.a_hipY) / dt; P.a_hipY = hip;
  // saç yayları: hız ve ivmeye gecikmeli tepki
  const tx = clamp(-lvx * 0.011, -3, 3) + (st === 'flip' ? -1.2 : 0);
  const ty = clamp(-vy * 0.0036, -3, 3) + clamp(-P.a_hipV * 0.05, -1.5, 1.5) + (st === 'flip' ? -1.5 : 0);
  for (let i = 0; i < 2; i++) {
    const h = dt / 2;
    P.a_hvx += ((tx - P.a_hx) * 230 - P.a_hvx * 10) * h; P.a_hx += P.a_hvx * h;
    P.a_hvy += ((ty - P.a_hy) * 230 - P.a_hvy * 10) * h; P.a_hy += P.a_hvy * h;
  }
  P.a_hx = clamp(P.a_hx, -3.5, 3.5); P.a_hy = clamp(P.a_hy, -3.5, 3.5);
}

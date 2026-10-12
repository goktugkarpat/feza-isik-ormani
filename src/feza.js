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
  'lid', 'happy', 'brow', 'mSmile', 'mOpen', 'mRound', 'sx', 'sy', 'air', 'breath', 'hOpen', 'arm', 'spr'];
const FZ_REST = { lean: 0.03, hx: 0, bob: 0, lt1: 0.04, lt2: -0.08, bt1: -0.04, bt2: -0.06, la1: 0.12, la2: 0.35,
  ba1: -0.1, ba2: 0.35, shr: 0, head: 0, gx: 0.5, gy: 0.05, lid: 1, happy: 0, brow: 0, mSmile: 0.7, mOpen: 0, mRound: 0,
  sx: 1, sy: 1, air: 0, breath: 0, hOpen: 0, arm: 1, spr: 0 };
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
function fzArm(x, sx, sy, a1, a2, far, open, al) {   // al: kol boyu çarpanı (çizgi film esnemesi)
  const j = fzJ(sx, sy, FZ_UA * al, a1, FZ_FA * al, a2);
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
function fzArmIK(x, sx, sy, tx, ty, bend, open, al) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 0.01;
  const L1 = FZ_UA * al, L2 = (FZ_FA + 1.0) * al, dd = clamp(d, 1.2, L1 + L2 - 0.05);
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
  const yol = () => {
    x.beginPath(); x.moveTo(lx, ly);
    x.quadraticCurveTo(cx, (ly + ry) / 2 + 0.25 * (1 - ro) - ro * h * 0.9, rx, ry);
    x.quadraticCurveTo(cx + 0.1, cy + h * (1.7 - ro * 0.3), lx, ly); x.closePath();
  };
  yol(); x.fillStyle = FZ.mouth; x.fill();
  x.save(); x.clip();
  x.fillStyle = FZ.tongue; x.beginPath(); x.ellipse(cx + 0.3, cy + h * 1.25, w * 0.26, h * 0.4, 0, 0, 6.2832); x.fill();
  if (ro < 0.5) { x.fillStyle = '#fbf8f3'; x.fillRect(lx, Math.min(ly, ry) - 1, rx - lx, 1.15 + up * 0.35); }
  x.restore();
  yol(); x.strokeStyle = FZ.lip; x.lineWidth = 0.35; x.stroke();
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
  fzArm(x, -0.8, -11.8 + by * 0.6, R.ba1, R.ba2, true, 0, R.arm);
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
  fzArm(x, 1.2, -11.4 + by, R.la1, R.la2, false, R.hOpen, R.arm);
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
    const sa = Math.sin(R.spr * 0.6), ca = Math.cos(R.spr * 0.6);   // spr: bacaklar iki yana açılır (yıldız pozu)
    const hx0 = sd * 2.5, ky = hip + ca * FZ_TH * Math.cos(a1), fy = ky + ca * FZ_SH * Math.cos(a1 + a2), kx = sd * (2.8 + sa * FZ_TH), fx = kx + sd * (sa * FZ_SH - 0.1);
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
  // boyun gövdenin arkasında (yakanın altında ten görünmesin)
  fzTaper(x, 0, -11.4 + by, 0, -14.6 + by, 2.4, 2.3, FZ.skinS);
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
  const ikArms = () => { for (let i = 0; i < 2; i++) { const k = fzQ.ik[i]; fzArmIK(x, (i ? 5.5 : -5.5), -11.0 + by, k[0], k[1], i ? -1 : 1, k[2] || 0, R.arm); } };
  if (fzQ.ik) { if (!fzQ.ikUst) ikArms(); }
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
  x.strokeStyle = FZ.pjS; x.lineWidth = 0.8; x.beginPath(); x.ellipse(0, -13.0 + by, 2.7, 1.0, 0, 0.15, 2.99); x.stroke();
  x.save(); x.translate(0, -14.4 + by); x.rotate(R.head * 0.3); x.scale(1.03, 1.03); x.translate(0, -7.7);
  fzHeadFront(x, R, tm);
  x.restore();
  if (fzQ.ik && fzQ.ikUst) ikArms();   // eller yüzün önünde (göz ovuşturma)
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
  fzQ = P;
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
  // çizim yeri: (varsa) ara değerli fizik konumu + animasyon kayması (Pırıl taşırken havada)
  const bx = (P.rx ?? P.x) + P.a_ox, by = (P.ry ?? P.y) + P.a_oy;
  // ışıklandırma: ortam rengi (aşağıdan mavi) + Pırıl'ın mor ışığı
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = 'source-atop';
  const lg = x.createLinearGradient(0, px * 0.1, 0, px);
  lg.addColorStop(0, 'rgba(20,40,90,0.12)'); lg.addColorStop(1, C('l3', 0.55 - light * 0.2));
  x.fillStyle = lg; x.fillRect(0, 0, px, px);
  const dx = (D.x - bx) * S + px / 2, dy = (D.y - by) * S + OY * S;
  const rg = x.createRadialGradient(dx, dy, 0, dx, dy, px * 0.9);
  rg.addColorStop(0, 'rgba(200,150,255,0.35)'); rg.addColorStop(1, 'rgba(200,150,255,0)');
  x.fillStyle = rg; x.fillRect(0, 0, px, px);
  x.globalCompositeOperation = 'source-over';
  // kenar ışıkları: sağ üstteki ay + Pırıl
  fzRim(0.72, -0.69, 0.75 * S, C('rim'), 0.75 - light * 0.25);
  const ddx = D.x - bx, ddy = D.y - (by - 38), dd = Math.hypot(ddx, ddy) || 1;
  fzRim(ddx / dd, ddy / dd, 0.75 * S, '#d2a6ff', 0.6 * clamp(1.2 - dd / 220, 0, 1));
  let a = 1; if (P.fade > 0) a = 1 - clamp((P.fade - 0.22) / 0.38, 0, 1);
  g.globalAlpha = a;
  g.drawImage(fzC, (bx - cam.x - SZ / 2) * S, (by - cam.y - OY) * S);
  g.globalAlpha = 1;
}

// ── animasyon ──
const FZ_CARRY = 0.95;   // Pırıl'ın taşıma süresi (kurtarildi → yere konma)
const FZ_STAR_IK = [[-12.6, -25.5, 1], [12.6, -25.5, 1]];   // yıldız pozunda eller (önden)
const FZ_GER_IK = [[-7.6, 0.8, 0], [7.6, 0.8, 0]];          // gerinirken eller (önden, değişir)
const FZ_SEV_IK = [[-12.4, -25.5, 1], [12.4, -25.5, 1]];     // sevinirken eller (önden)
const FZ_SEQ = [[4, 'wave'], [9.5, 'yawn'], [15, 'stretch'], [20.5, 'sit'], [26, 'look'], [31, 'wave']];   // uzun beklemede sırayla
const FZ_ACT = { wave: 2.8, yawn: 2.7, stretch: 2.5, look: 2.2, nod: 3.2 };
function fezaInit() {
  P.a_pose = Object.assign({}, FZ_REST); P.a_R = Object.assign({}, FZ_REST);
  P.a_t = 0; P.a_face = P.f; P.a_side = P.f; P.a_turnU = 1; P.a_turnTo = P.f; P.a_turnDur = 0.16; P.a_front = false; P.a_fu = 0; P.a_state = 'idle'; P.a_sw = 1; P.a_wasG = P.ground; P.a_prevVy = 0;
  P.a_landT = 9; P.a_landP = 0; P.a_take = 0; P.a_skid = 0; P.a_skidDir = 1; P.a_idle = 0; P.a_waveDir = 1;
  P.a_lookT = 1.2; P.a_look = 0; P.a_blink = 2.5; P.a_lidM = 1; P.a_spin = 0;
  P.a_hx = P.a_hy = P.a_hvx = P.a_hvy = 0; P.a_hipY = -(FZ_TH + FZ_SH + FZ_FT); P.a_hipV = 0;
  P.a_ph = 0; P.a_launch = 0; P.a_launchBig = false; P.a_stomp = 0; P.a_cheerT = 9; P.a_cheerO = null; P.a_cheerDir = 1;
  P.a_push = 0; P.a_bump = 0; P.a_carryT = 9; P.a_wasCarry = false; P.a_ox = 0; P.a_oy = 0; P.a_elX = P.x; P.a_elY = P.y; P.a_tutun = 0;
  P.a_act = ''; P.a_actT = 0; P.a_seq = 0; P.a_nextAct = FZ_SEQ[0][0]; P.a_sit = 0; P.a_edgeT = 0; P.a_edge = 0;
  P.a_bal = 0; P.a_balKick = 0; P.a_awe = 0; P.a_big = null;
}

// ── oyun olayları → animasyon ──
if (typeof OLAY !== 'undefined') {
  OLAY.on('ziplatti', o => { if (!P.a_pose) return; P.a_launch = 1; P.a_launchBig = !!(o && o.tip === 'buyukPofuduk'); P.a_stomp = 0; P.a_sit = 0; });
  OLAY.on('uyandi', o => { if (!P.a_pose || !o || o.tip !== 'pofuduk' || Math.abs(o.x - P.x) > 90 || P.ground) return; P.a_stomp = 1; });
  const sevin = o => {
    if (!P.a_pose || !o || Math.abs(o.x - P.x) > 300) return;
    P.a_cheerT = 0; P.a_cheerO = o; P.a_cheerDir = Math.sign(o.x - P.x) || P.f; P.a_sit = 0; P.a_act = '';
  };
  OLAY.on('cicek', sevin); OLAY.on('tohum', sevin);
  OLAY.on('carpti', o => { if (!P.a_pose || !o) return; if (P.a_push <= 0) P.a_bump = 1; P.a_push = 0.2; });
  OLAY.on('kurtarildi', () => { if (!P.a_pose) return; P.a_carryT = 0; P.a_sit = 0; P.a_act = ''; });
}
function fzMover() {   // üstünde durduğu cisim hareket ediyor mu
  const o = typeof ustundeki !== 'undefined' ? ustundeki : null;
  return !!(o && o.cisim && (Math.abs(o.cisim.dx || 0) + Math.abs(o.cisim.dy || 0) > 0.02));
}
function fzEdge() {    // ayakta dururken uçurum kenarı: + sağda, - solda (0..1 güç)
  if (typeof cell !== 'function' || (typeof ustundeki !== 'undefined' && ustundeki)) return 0;
  const ty = Math.round(P.y / T);
  if (Math.abs(P.y - ty * T) > 1) return 0;
  const zemin = (cx, r) => { const c = cell(cx, r); return c === 1 || c === 2; };
  const cx = Math.floor(P.x / T);
  for (let s = 1; s >= -1; s -= 2) {
    const nx = cx + s;
    if (zemin(nx, ty) || zemin(nx, ty - 1) || zemin(nx, ty + 1)) continue;   // zemin devam ediyor / duvar / küçük basamak
    const ex = s > 0 ? (cx + 1) * T : cx * T, dist = (ex - P.x) * s;           // kenara uzaklık (eksi = kenarın ötesinde)
    const k = clamp((13 - dist) / 10, 0, 1);
    if (k > 0) return s * k;
  }
  return 0;
}
function fzBig() {     // hayranlıkla bakılacak büyük şeyler
  if (P.a_big) return P.a_big;
  P.a_big = [];
  if (typeof NESNELER !== 'undefined') for (const o of NESNELER) if (o.tip === 'buyukPofuduk' || o.tip === 'agac') P.a_big.push(o);
  return P.a_big;
}

// oyun.js her karede fizikten sonra çağırır
function fezaUpdate(dt) {
  if (!P.a_pose) fezaInit();
  if (!(dt > 0)) return;
  dt = Math.min(dt, 0.05);
  const t = (P.a_t += dt), sp = Math.abs(P.vx), vy = P.vy;
  // Pırıl'ın kurtarması: patilerine tutunmuş, sallanarak yavaşça iner
  if (P.fade > 0 && !P.respawned) P.a_carryT = 9;
  P.a_carryT += dt;
  let carry = P.a_carryT < FZ_CARRY;
  if (carry && P.fade <= 0 && (sp > 30 || vy < -100)) { P.a_carryT = 9; carry = false; }
  const gr = P.ground && P.fade <= 0 && !carry;
  // olaylar: yere iniş, kalkış, kayma (ters yöne dönerken)
  if (gr && !P.a_wasG) {
    P.a_landT = 0; P.a_landP = P.a_wasCarry ? 0.34 : clamp(P.a_prevVy / 850, 0.18, 1);
    if (fzMover()) P.a_balKick = 1;
  }
  if (!gr && P.a_wasG && vy < -300 && P.a_launch <= 0 && P.a_stomp <= 0) P.a_take = 1;
  P.a_wasG = gr; P.a_prevVy = vy; P.a_wasCarry = carry;
  P.a_landT += dt; P.a_take = Math.max(0, P.a_take - dt / 0.18);
  if (gr) { P.a_launch = 0; P.a_stomp = 0; }
  P.a_launch = Math.max(0, P.a_launch - dt / (P.a_launchBig ? 1.05 : 0.8));
  P.a_stomp = Math.max(0, P.a_stomp - dt / 0.55);
  P.a_push = Math.max(0, P.a_push - dt); P.a_bump = Math.max(0, P.a_bump - dt / 0.3);
  P.a_balKick = Math.max(0, P.a_balKick - dt / 1.1);
  P.a_cheerT += dt;
  const cheer = P.a_cheerT < 1.9 && P.a_cheerO;
  if (gr && sp > 110 && Math.sign(P.vx) !== P.f) { if (P.a_skid <= 0) { P.a_skidDir = Math.sign(P.vx); P.a_skid = 0.12; } }
  else P.a_skid = gr ? P.a_skid - dt : 0;
  // bekleme: el sallama, esneme, gerinme, oturma...
  const mover = gr && fzMover();
  const still = gr && sp < 5 && !P.flip && P.a_push <= 0;
  P.a_idle = still ? P.a_idle + dt : 0;
  const edge = still && !mover ? fzEdge() : 0;
  P.a_edgeT = edge ? P.a_edgeT + dt : 0;
  if (edge) P.a_edge = edge;
  const oops = edge && ((P.a_edgeT - 0.25) % 8) > 0 && ((P.a_edgeT - 0.25) % 8) < 1.9;
  if (!still) { P.a_act = ''; P.a_seq = 0; P.a_nextAct = FZ_SEQ[0][0]; P.a_sit = 0; }
  else if (!P.a_act && !cheer && !oops && P.a_idle >= P.a_nextAct) {
    let a;
    if (P.a_seq < FZ_SEQ.length) { a = FZ_SEQ[P.a_seq++][1]; P.a_nextAct = P.a_seq < FZ_SEQ.length ? FZ_SEQ[P.a_seq][0] : P.a_idle + 7; }
    else { a = ['wave', 'yawn', 'stretch', 'nod', 'look'][Math.floor(Math.random() * 5)]; P.a_nextAct = P.a_idle + 6 + Math.random() * 4; }
    if (a === 'sit' && edge) a = 'look';
    if (a === 'nod' && !P.a_sit) a = 'look';
    if (a === 'sit') P.a_sit = 0.001; else { P.a_act = a; P.a_actT = 0; }
    if (a === 'wave') P.a_waveDir = Math.sign(D.x - P.x) || P.f;
  }
  if (P.a_act) { P.a_actT += dt; if (P.a_actT > FZ_ACT[P.a_act]) P.a_act = ''; }
  if (P.a_sit > 0) P.a_sit += dt;
  const act = still ? P.a_act : '';
  // yön: dönüşte genişlik sıfırdan geçerek yumuşak çevrilir
  let ft = P.f;
  if (P.a_skid > 0) ft = P.a_skidDir;
  else if (act === 'wave') ft = P.a_waveDir;
  else if (still && cheer && Math.abs(P.a_cheerO.x - P.x) > 14) ft = P.a_cheerDir;
  if (P.a_turnU >= 1 && ft !== P.a_side) { P.a_turnU = 0; P.a_turnTo = ft; P.a_turnDur = sp > 60 || !gr ? 0.1 : 0.16; }
  else if (P.a_turnU < 1 && ft !== P.a_turnTo) { P.a_turnTo = ft; P.a_turnU = 1 - P.a_turnU; }   // yarıda vazgeçti
  if (P.a_turnU < 1) {
    P.a_turnU = Math.min(1, P.a_turnU + dt / P.a_turnDur);
    if (P.a_turnU >= 0.5 && P.a_side !== P.a_turnTo) {   // ayna çevirme (önden görünüşün içinde, görünmez)
      P.a_side = P.a_turnTo; P.a_pose.gx = -P.a_pose.gx; P.a_hx = -P.a_hx; P.a_hvx = -P.a_hvx;
    }
  }
  P.a_face = P.a_side;
  const sd = P.a_side;
  // kameraya bakma: aynı geçiş (önce gözler, kısa daralma, önden görünüş; dönüşte geri)
  if (P.a_turnU < 1) P.a_fu = 0;
  else if (P.a_front) { if (P.a_fu < 0.5) P.a_fu = Math.min(0.5, P.a_fu + dt / 0.16); }
  else if (P.a_fu > 0) { P.a_fu += (P.a_fu < 0.3 ? -1 : 1) * dt / 0.16; if (P.a_fu >= 1 || P.a_fu <= 0) P.a_fu = 0; }
  const lvx = P.vx * ft;
  // Pırıl'a bakış yönü (yerel)
  const gpx = clamp((D.x - P.x) * sd / 45, -1, 1), gpy = clamp((D.y - (P.y - 58)) / 45, -1, 1);
  // koşu adımı: yavaş yürüyüşte kısa adım, koşuda uzun adım (ayak kaymasın)
  const r = clamp(sp / 250, 0, 1);
  if (gr) P.a_ph += dt * 6.2832 * sp / lerp(64, 122, clamp((r - 0.45) / 0.55, 0, 1));
  // durum
  let st;
  if (carry) st = 'carry';
  else if (P.flip > 0) st = 'flip';
  else if (!gr) st = P.a_launch > 0 ? 'launch' : P.a_stomp > 0 ? 'stomp' : vy < -170 ? 'rise' : vy < 170 ? 'apex' : 'fall';
  else if (P.a_push > 0) st = 'push';
  else if (P.a_skid > 0) st = 'skid';
  else if (sp > 5) st = 'run';
  else if (P.a_sit > 0) st = 'sit';
  else if (oops) st = 'edge';
  else st = 'idle';
  if (st !== P.a_state) { P.a_state = st; P.a_sw = 0; }
  P.a_sw += dt;
  const T = Object.assign(FZ_T, FZ_REST);
  P.a_front = false;
  let kmax = 32, kmin = 10;
  const b = Math.sin(t * 2.4), s = Math.sin(t * 0.8);
  if (st === 'idle' || st === 'sit' || st === 'edge') {
    T.breath = b; T.hx = s * 0.45; T.lean = 0.02 + 0.012 * b - s * 0.015;
    T.lt1 = 0.05 + 0.08 * Math.max(0, s); T.lt2 = -0.08 - 0.24 * Math.max(0, s);
    T.bt1 = -0.04 + 0.06 * Math.max(0, -s); T.bt2 = -0.06 - 0.22 * Math.max(0, -s);
    T.la1 = 0.12 + 0.04 * b; T.ba1 = -0.1 + 0.03 * b; T.head = -0.02 * b;
    // etrafa bakınma
    P.a_lookT -= dt;
    if (P.a_lookT <= 0) {
      const q = Math.random();
      P.a_look = P.a_idle < 1.5 ? (q < 0.5 ? 0 : 1) : q < 0.35 ? 1 : q < 0.55 ? 0 : q < 0.7 ? 2 : q < 0.8 ? 3 : q < 0.9 ? 4 : 5;
      P.a_lookT = 1.2 + Math.random() * 2.2;
    }
    const lk = act === 'look' ? 1 : P.a_look;
    if (lk === 1) { T.gx = gpx; T.gy = gpy; T.head = -gpy * 0.16; T.brow = 0.15; }
    else if (lk === 2) { T.gx = 0.3; T.gy = -0.85; T.head = -0.12; T.brow = 0.3; }
    else if (lk === 3) { T.gx = 0.5; T.gy = 0.8; T.head = 0.1; }
    else if (lk === 4) { T.gx = -1; T.gy = 0; T.head = 0.03; }
    else if (lk === 5 && st === 'idle' && !act && !cheer && P.a_turnU >= 1) { P.a_front = true; T.gx = 0; T.gy = 0; T.brow = 0.2; }   // kameraya bakar
    T.mSmile = act === 'look' ? 1 : 0.75;
    if (st === 'sit') {   // oturur: önce çömelir, sonra bacaklar önde, ayaklar sallanır
      kmin = kmax = 7;
      if (P.a_sit < 0.5) {
        T.lt1 = 1.25; T.lt2 = -2.2; T.bt1 = 1.1; T.bt2 = -2.1; T.lean = 0.22; T.hx = -1.5;
        T.la1 = 0.8; T.la2 = 0.7; T.ba1 = 0.6; T.ba2 = 0.7; T.head = 0.05;
      } else {
        const w = Math.sin(t * 2.3), w2 = Math.sin(t * 2.3 + 2.2);
        T.lt1 = 1.38 + 0.12 * w; T.lt2 = -0.18 - 0.22 * Math.max(0, w); T.bt1 = 1.3 + 0.12 * w2; T.bt2 = -0.2 - 0.22 * Math.max(0, w2);
        T.lean = -0.13 + 0.012 * b; T.hx = -4.2;
        T.la1 = 0.62; T.la2 = 0.5; T.ba1 = 0.35; T.ba2 = 0.55; T.head = -0.03 * b + (lk === 1 ? -gpy * 0.16 : 0);
      }
    } else if (st === 'edge') {   // uçurum kenarı: "eyvah" sallanması, kollar çark gibi döner
      const k = Math.abs(P.a_edge), sl = Math.sign(P.a_edge) * sd, e = (P.a_edgeT - 0.25) % 8;
      const fade = clamp(e / 0.15, 0, 1) * clamp((1.9 - e) / 0.35, 0, 1), ro = Math.sin(e * 8.5);
      kmin = kmax = 18;
      T.lean = sl * (0.08 + 0.14 * ro) * (0.5 + 0.5 * k) * fade; T.hx = sl * ro * 0.9 * fade;
      T.la1 = 1.6 + 1.5 * Math.sin(e * 13) * fade; T.la2 = 0.35; T.ba1 = 1.6 + 1.5 * Math.sin(e * 13 + 3.1) * fade; T.ba2 = 0.35; T.hOpen = 1;
      if (sl > 0) { T.lt1 = 0.25 + 0.15 * ro; T.lt2 = -0.35; } else { T.bt1 = -0.3 + 0.12 * ro; T.bt2 = -0.35; }
      T.shr = 0.5; T.mRound = 1; T.mOpen = 0.7; T.mSmile = 0.1; T.brow = 1; T.lid = 1.15; T.gx = sl; T.gy = 0.9; T.head = 0.12 * sl;
      if (e > 1.5) { T.mRound = 0; T.mOpen = 0.35; T.mSmile = 1; T.brow = 0.3; T.lid = 0.8; }   // oh, kurtuldum
    }
    // bekleme hareketleri
    const at = P.a_actT;
    if (act === 'wave') {   // Pırıl'a dönüp el sallar
      T.shr = 0.6; T.la1 = 1.65; T.la2 = 0.75 + 0.4 * Math.sin(t * 11); if (st !== 'sit') T.lean = -0.06;
      T.gx = gpx; T.gy = gpy; T.head = -0.12 - gpy * 0.1; T.mOpen = 0.6; T.hOpen = 1; T.mSmile = 1; T.brow = 0.4;
    } else if (act === 'yawn') {   // esneme: baş geride, ağız kocaman açık; sonunda el ağza pat pat
      const w = smooth(clamp(at / 0.45, 0, 1)) * smooth(clamp((2.7 - at) / 0.6, 0, 1));
      const big = smooth(clamp((at - 0.25) / 0.4, 0, 1)) * smooth(clamp((1.95 - at) / 0.45, 0, 1));
      const hand = smooth(clamp((at - 1.25) / 0.3, 0, 1)) * smooth(clamp((2.35 - at) / 0.3, 0, 1)), fold = smooth(clamp((at - 1.15) / 0.2, 0, 1)) * smooth(clamp((2.5 - at) / 0.25, 0, 1));
      const pat = hand * Math.max(0, Math.sin((at - 1.55) * 15)) * (at > 1.55 && at < 2.15 ? 1 : 0);
      kmin = kmax = 12;
      T.head = lerp(T.head, -0.32, big * (1 - 0.5 * hand)); T.lean = lerp(T.lean, -0.06, big); T.shr = 0.8 * big;
      T.mRound = big; T.mOpen = lerp(0.1, 1.15, big); T.mSmile = lerp(0.6, 0, big); T.lid = lerp(1, 0.05, w); T.brow = 0.7 * big;
      T.ba1 = lerp(T.ba1, -0.75, big); T.ba2 = lerp(T.ba2, 0.7, big);
      T.la2 = lerp(T.la2, 2.1, fold) - 0.6 * hand; T.la1 = lerp(T.la1, 1.62 - 0.12 * pat, hand); T.hOpen = hand;
      if (at > 2.0) { T.lid = lerp(T.lid, 0.6, w); T.mSmile = 0.5; }
    } else if (act === 'stretch') {   // gerinme: kollar havada, parmak ucunda
      const w = clamp(at / 0.55, 0, 1) * clamp((2.5 - at) / 0.6, 0, 1), ws = smooth(w);
      kmin = kmax = 9;
      // önden: kollar yukarıda V, yumruklar sıkılı, gözler kapalı
      if (P.a_turnU >= 1 && at > 0.05 && at < 2.35) { P.a_front = true; P.ik = FZ_GER_IK; }
      const up = smooth(clamp((at - 0.12) / 0.5, 0, 1)) * smooth(clamp((2.3 - at) / 0.5, 0, 1)), wig = Math.sin(at * 9) * 0.5 * up;
      FZ_GER_IK[0][0] = -lerp(7.6, 12.8, up) - wig; FZ_GER_IK[1][0] = lerp(7.6, 12.8, up) + wig;
      FZ_GER_IK[0][1] = FZ_GER_IK[1][1] = lerp(0.8, -26.5, up); T.arm = lerp(1, 1.27, up);
      T.la1 = 0.2; T.ba1 = 0.1; T.lean = lerp(T.lean, -0.1, ws); T.head = lerp(T.head, -0.22, ws); T.shr = 0.8 * ws;
      T.happy = ws; T.mOpen = 0.55 * ws; T.mRound = 0.5 * ws; T.sy = 1 + 0.035 * ws; T.sx = 1 - 0.02 * ws;
      if (st !== 'sit') { T.bob = -1.6 * ws; T.lt1 = lerp(T.lt1, 0.04, ws); T.bt1 = lerp(T.bt1, -0.04, ws); T.lt2 = lerp(T.lt2, -0.02, ws); T.bt2 = lerp(T.bt2, -0.02, ws); }
    } else if (act === 'nod') {   // uykulu baş düşmesi (otururken), sonra silkinip uyanır
      const w = clamp(at / 1.2, 0, 1), up = clamp((at - 2.3) / 0.25, 0, 1);
      kmin = kmax = at > 2.3 ? 20 : 5;
      T.lid = lerp(lerp(1, 0.05, w), 1.15, up); T.head = lerp(0.32 * w, -0.1, up); T.lean = lerp(T.lean, 0.06, w * (1 - up));
      T.mSmile = 0.4; T.mOpen = up * 0.4; T.mRound = up; T.brow = up * 0.9;
    }
  } else if (st === 'run') {
    // yürüyüş (yavaş) ↔ koşu (hızlı) karışımı
    const q = P.a_ph, sq = Math.sin(q), wr = smooth(clamp((r - 0.5) / 0.4, 0, 1));
    const ka = Math.max(0, Math.cos(q - 0.5)), kb = Math.max(0, Math.cos(q + Math.PI - 0.5));
    const amp = lerp(0.44, 0.85, wr);
    T.lt1 = sq * amp + 0.08 * wr; T.lt2 = -(lerp(0.08, 0.12, wr) + lerp(0.62, 1.4, wr) * ka);
    T.bt1 = -sq * amp + 0.08 * wr; T.bt2 = -(lerp(0.08, 0.12, wr) + lerp(0.62, 1.4, wr) * kb);
    const aa = lerp(0.32, 1.0, wr);
    T.la1 = -sq * aa + lerp(0.08, 0.1, wr); T.la2 = lerp(0.35, 1.3, wr);
    T.ba1 = sq * aa + lerp(0.02, 0.1, wr); T.ba2 = lerp(0.35, 1.3, wr);
    T.lean = lerp(0.04, 0.22, wr); T.hx = lerp(0.15, 0.6, wr);
    T.head = -T.lean * 0.55 + lerp(0.025, 0.05, wr) * Math.cos(2 * q);
    T.mSmile = 1; T.mOpen = wr > 0.6 ? 0.5 * wr : 0; T.gx = lerp(0.7, 0.9, wr); T.gy = 0.1; T.brow = 0.1; T.breath = 0;
  } else if (st === 'push') {   // katı Pofuduk'u itmeye çalışır
    const q = t * 5.5, pq = Math.sin(q);
    T.lean = 0.4; T.hx = 1.4;
    T.lt1 = 0.3 + 0.2 * pq; T.lt2 = -0.6 - 0.35 * Math.max(0, Math.cos(q));
    T.bt1 = -0.55 - 0.18 * pq; T.bt2 = -0.12 - 0.35 * Math.max(0, -Math.cos(q));
    T.la1 = 1.55; T.la2 = 0.35; T.ba1 = 1.4; T.ba2 = 0.4; T.hOpen = 1; T.shr = 0.3;
    T.lid = 0.85; T.brow = -0.75; T.mSmile = 0.15; T.mRound = 0; T.mOpen = 0; T.gx = 1; T.gy = 0.1; T.head = -0.12;
  } else if (st === 'skid') {
    T.lean = -0.32; T.hx = -1.0; T.lt1 = 0.75; T.lt2 = -0.15; T.bt1 = 0.05; T.bt2 = -0.9;
    T.la1 = 1.3; T.la2 = 0.3; T.ba1 = 1.0; T.ba2 = 0.35; T.head = -0.18;
    T.mRound = 0.8; T.mOpen = 0.5; T.mSmile = 0.3; T.brow = 0.8; T.gx = 1; T.lid = 1.1;
  } else if (st === 'carry') {   // Pırıl'ın patilerine tutunmuş, bacaklar sallanır
    const cu = P.a_carryT / FZ_CARRY, sw = Math.sin(t * 5.2);
    // Peter Pan gibi: ön el ileri-yukarıda Pırıl'ın patisinde (kol çizgi film gibi esner), gövde geride,
    // arka kol neşeyle açık, bacaklar sırayla tekmeler; yere yaklaşınca Pırıl bırakır, ayaklar yere uzanır
    T.air = 1; kmin = kmax = 22;
    const dn = smooth(clamp((cu - 0.62) / 0.3, 0, 1)), sw2 = Math.sin(t * 5.2 + 1.7);
    T.arm = lerp(1.45, 1, dn); T.la1 = lerp(2.05, 0.4, dn); T.la2 = lerp(0.04, 0.4, dn); T.hOpen = 0;
    T.ba1 = lerp(-1.05 + 0.25 * Math.sin(t * 4.4), -0.1, dn); T.ba2 = lerp(0.5, 0.35, dn); T.shr = 0.6 * (1 - dn);
    T.lt1 = lerp(0.05 + 0.32 * sw, 0.06, dn); T.lt2 = lerp(-0.35 - 0.45 * Math.max(0, -sw), -0.05, dn);
    T.bt1 = lerp(-0.35 + 0.25 * sw2, -0.05, dn); T.bt2 = lerp(-0.4 - 0.45 * Math.max(0, -sw2), -0.08, dn);
    T.lean = lerp(-0.2 + 0.04 * Math.sin(t * 3.1), 0.02, dn); T.head = lerp(-0.28, 0.05, dn);
    T.gx = 1; T.gy = lerp(-0.6, 0.6, dn); T.mSmile = 1; T.mOpen = lerp(0.6, 0.3, dn); T.brow = 0.5; T.happy = cu > 0.15 && cu < 0.55 ? 1 : 0;
  } else if (st === 'launch') {   // minder / Büyük Pofuduk fırlattı: sevinçli yıldız pozu, sonra toparlanma
    const el = (1 - P.a_launch) * (P.a_launchBig ? 1.05 : 0.8), star = P.a_launchBig ? 0.42 : 0.32;
    T.air = 1; kmin = kmax = 26;
    if (el < star) {   // önden: kollar ve bacaklar iki yana açık (X)
      if (P.a_turnU >= 1) { P.a_front = true; P.ik = FZ_STAR_IK; }
      T.spr = 0.85; T.lt1 = 0.2; T.lt2 = -0.35; T.bt1 = 0.2; T.bt2 = -0.35; T.arm = 1.15;
      T.la1 = 2.3; T.la2 = 0.1; T.ba1 = -2.2; T.ba2 = 0; T.hOpen = 1; T.shr = 0.7;
      T.lean = 0; T.head = -0.1; T.happy = 1; T.mOpen = 0.75; T.mSmile = 1; T.brow = 0.6; T.sy = 1.04; T.sx = 0.97; T.gx = 0;
    } else {
      T.lt1 = 2.0; T.lt2 = -2.4; T.bt1 = 1.8; T.bt2 = -2.3;
      T.la1 = 1.25; T.la2 = 1.25; T.ba1 = 1.05; T.ba2 = 1.35; T.lean = 0.2; T.head = 0.2;
      T.happy = 1; T.mOpen = 0.8; T.mSmile = 1; T.brow = 0.3;
    }
  } else if (st === 'stomp') {   // uyuyan Pofuduk'un üstüne bastı: mutlu sekme
    T.air = 1; kmin = kmax = 26;
    T.lt1 = 1.35; T.lt2 = -2.0; T.bt1 = 1.0; T.bt2 = -1.9;
    T.arm = 1.2; T.la1 = 2.15; T.la2 = 0.2; T.ba1 = 1.75; T.ba2 = 0.4; T.hOpen = 1; T.shr = 0.6;
    T.lean = 0.05; T.head = 0.1; T.happy = 1; T.mOpen = 0.9; T.mSmile = 1; T.brow = 0.5; T.gy = 0.6;
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
  // ── üst katmanlar ──
  // büyük şeylere hayranlıkla bakma (Büyük Pofuduk, Işık Ağacı)
  let aw = 0, agx = 0, agy = 0;
  if (gr && (st === 'idle' || st === 'run' || st === 'sit')) {
    for (const o of fzBig()) {
      const tree = o.tip === 'agac', range = tree ? 470 : 330, d = Math.abs(o.x - P.x);
      if (d > range) continue;
      const w = smooth(clamp((range - d) / (range * 0.45), 0, 1));
      if (w > aw) {
        aw = w; const tx = (o.x - P.x) * sd, ty = (o.y - (tree ? 300 : 150)) - (P.y - 55), L = Math.hypot(tx, ty) || 1;
        agx = clamp(tx / L * 1.4, -1, 1); agy = clamp(ty / L * 2, -1, 0.2);
      }
    }
  }
  P.a_awe += (aw * (act || cheer ? 0 : 1) - P.a_awe) * (1 - Math.exp(-dt * 2.5));
  if (P.a_awe > 0.01) {
    const w = P.a_awe;
    T.gx = lerp(T.gx, agx, w); T.gy = lerp(T.gy, agy, w); T.head = lerp(T.head, agy * 0.45 * Math.max(0, agx * 0.5 + 0.5), w); T.lean -= 0.06 * w * Math.max(0, -agy);
    T.mRound = lerp(T.mRound, 0.85, w); T.mOpen = lerp(T.mOpen, 0.55, w); T.mSmile = lerp(T.mSmile, 0.35, w); T.brow = lerp(T.brow, 0.85, w); T.lid = lerp(T.lid, 1.12, w);
  }
  // çiçek açtı / tohum bulundu: önce uzanır, sonra kollar havada sevinir
  if (cheer && st !== 'carry' && st !== 'flip' && st !== 'launch') {
    const ct = P.a_cheerT, o = P.a_cheerO;
    const ox = (o.x - P.x) * sd, oy = (o.y - 22) - (P.y - 44), ang = clamp(Math.atan2(ox, oy), 0.35, 2.7);
    if (ct < 0.55) {
      T.la1 = ang; T.la2 = 0.1; T.hOpen = 1; T.lean += 0.08; T.ba1 = 0.3;
      T.gx = clamp(ox / 30, -1, 1); T.gy = clamp(oy / 30, -1, 1); T.head = 0.15 * clamp(oy / 40, -1, 1);
      T.mRound = 0.8; T.mOpen = 0.5; T.mSmile = 0.5; T.brow = 0.8; T.lid = 1.12;
    } else {
      const c2 = ct - 0.55, wv = Math.sin(c2 * 14);
      // yerinde: önden, kollar havada V, zıplar; koşarken/havada: yandan yumruk havada
      if (still && P.a_turnU >= 1 && ct < 1.75) {
        P.a_front = true; P.ik = FZ_SEV_IK;
        FZ_SEV_IK[0][0] = -12.4 - wv * 0.8; FZ_SEV_IK[1][0] = 12.4 - wv * 0.8; FZ_SEV_IK[0][1] = FZ_SEV_IK[1][1] = -25.5 + Math.abs(wv) * 0.8;
      }
      T.arm = 1.22; T.la1 = 2.2 + 0.12 * wv; T.la2 = 0.25; T.ba1 = 1.9 - 0.12 * wv; T.ba2 = 0.35; T.hOpen = 1; T.shr = 0.7;
      T.happy = 1; T.mOpen = 0.9; T.mSmile = 1; T.mRound = 0; T.brow = 0.5; T.head = -0.1; T.lean = st === 'run' ? T.lean : -0.04; T.lid = 1;
      if (still) { const hop = Math.abs(Math.sin(c2 * Math.PI / 0.4)) * (c2 < 1.2 ? 1 : 0); T.bob = -4.5 * hop; T.lt1 = 0.05 + 0.4 * hop; T.lt2 = -0.1 - 0.7 * hop; T.bt1 = 0.0 + 0.3 * hop; T.bt2 = -0.1 - 0.6 * hop; kmin = kmax = 30; }
    }
  }
  // hareketli cismin üstünde denge
  P.a_bal += ((mover ? 1 : 0) - P.a_bal) * (1 - Math.exp(-dt * 6));
  const bal = Math.max(P.a_bal * 0.6, P.a_balKick);
  if (bal > 0.01 && (st === 'idle' || st === 'run' || st === 'sit') && !cheer && !act) {
    const bw = Math.sin(t * 7.5) * P.a_balKick;
    T.la1 = lerp(T.la1, 1.45 + 0.6 * bw, bal); T.la2 = lerp(T.la2, 0.25, bal); T.ba1 = lerp(T.ba1, -1.15 - 0.6 * bw, bal); T.ba2 = lerp(T.ba2, 0.3, bal); T.hOpen = Math.max(T.hOpen, bal);
    if (st !== 'sit') { T.lt2 -= 0.3 * bal; T.bt2 -= 0.3 * bal; T.lean += 0.08 * bw + 0.04 * Math.sin(t * 2.6) * bal; }
    T.mRound = lerp(T.mRound, 0.6, P.a_balKick); T.mOpen = lerp(T.mOpen, 0.45, P.a_balKick); T.brow = lerp(T.brow, 0.7, P.a_balKick);
  }
  // yumuşak geçiş (üstel yaklaşım); durum değişiminden sonra hız artar
  const k = st === 'flip' ? 30 : lerp(kmin, kmax, clamp(P.a_sw / 0.3, 0, 1)), m = 1 - Math.exp(-k * dt), cur = P.a_pose;
  if (P.a_turnU < 0.5) { T.gx = -1; T.gy = 0; }   // dönüşte önce gözler yeni yöne bakar
  for (const key of FZ_KEYS) cur[key] += (T[key] - cur[key]) * m;
  // göz kırpma (bazen çift)
  P.a_blink -= dt;
  if (P.a_blink < -0.13) P.a_blink = Math.random() < 0.2 ? 0.22 : 1.8 + Math.random() * 3;
  P.a_lidM += ((P.a_blink < 0 ? 0 : 1) - P.a_lidM) * (1 - Math.exp(-dt * 45));
  // çizim pozu = yumuşak poz + iniş çökmesi + kalkış uzaması + çarpma
  const R = Object.assign(P.a_R, cur), lt = P.a_landT;
  const cr = gr ? P.a_landP * (lt < 0.05 ? lt / 0.05 : Math.exp(-(lt - 0.05) * 7.5)) : 0, tk = P.a_take;
  R.lt1 += 0.8 * cr; R.lt2 -= 1.5 * cr; R.bt1 += 0.6 * cr; R.bt2 -= 1.4 * cr; R.lean += 0.25 * cr; R.head += 0.12 * cr;
  R.la1 += 0.5 * cr; R.ba1 += 0.4 * cr; R.sx += 0.1 * cr; R.sy -= 0.08 * cr; R.lid *= 1 - 0.3 * cr;
  R.sy += 0.08 * tk; R.sx -= 0.06 * tk; R.lt1 -= 0.6 * tk * R.lt1; R.lt2 *= 1 - 0.7 * tk;
  const bu = P.a_bump * P.a_bump;   // Pofuduk'a tosladı: kısa geri sekme
  R.lean -= 0.3 * bu; R.head -= 0.2 * bu; R.sx += 0.06 * bu; R.sy -= 0.05 * bu; R.hx -= 1.2 * bu;
  const sb = P.a_stomp > 0.8 ? (P.a_stomp - 0.8) / 0.2 : 0;   // basınca kısa ezilme
  R.sy -= 0.1 * sb; R.sx += 0.08 * sb;
  // takla açısı (başı ve sonu yavaş); büyük fırlatmada toparlanınca ağır bir takla
  const u = P.flip > 0 ? 1 - P.flip : 0;
  let spin = u > 0 ? (u - Math.sin(u * 6.2832) / 6.2832) * 6.2832 : 0;
  if (st === 'launch' && P.a_launchBig) {
    const el = (1 - P.a_launch) * 1.05, u2 = clamp((el - 0.45) / 0.6, 0, 1);
    spin = (u2 - Math.sin(u2 * 6.2832) / 6.2832) * 6.2832;
  }
  P.a_spin = spin;
  // kalça yüksekliği: yerdeyken en alttaki ayak tam yere bassın
  const fy = (a1, a2) => FZ_TH * Math.cos(a1) + FZ_SH * Math.cos(a1 + a2) + FZ_FT;
  const hipG = -Math.max(fy(R.lt1, R.lt2), fy(R.bt1, R.bt2));
  const hip = lerp(hipG, FZ_AIRHIP, R.air) + R.bob;
  P.a_hipV = (hip - P.a_hipY) / dt; P.a_hipY = hip;
  // taşınırken çizim kayması: yukarıdan sallanarak yavaşça iner (Pırıl P.a_elX/elY'deki ellere tutunabilir)
  if (carry) {
    const cu = clamp(P.a_carryT / FZ_CARRY, 0, 1);
    P.a_oy = -50 * (1 - cu) * (1 - cu); P.a_ox = Math.sin(t * 3.1) * 2.5 * (1 - cu);
  } else { const dk = Math.exp(-dt * 14); P.a_oy *= dk; P.a_ox *= dk; }
  P.a_tutun += ((carry ? 1 : 0) - P.a_tutun) * (1 - Math.exp(-dt * 20));
  {   // ön elin dünya konumu (Pırıl taşırken bu ele tutunur)
    const cl = Math.cos(R.lean), sl = Math.sin(R.lean), sx0 = 1.2, sy0 = -11.4;
    const shx = R.hx + sx0 * cl - sy0 * sl, shy = hip + sx0 * sl + sy0 * cl, aa = R.la1 + R.lean, L = (FZ_UA + FZ_FA) * R.arm + 1.4;
    P.a_elX = (P.rx ?? P.x) + P.a_ox + sd * FZ_SC * (shx + Math.sin(aa) * L);
    P.a_elY = (P.ry ?? P.y) + P.a_oy + FZ_SC * (shy + Math.cos(aa) * L);
  }
  // saç yayları: hız ve ivmeye gecikmeli tepki (fırlatılınca saçlar uçuşur)
  const lim = st === 'launch' ? 3.8 : 3;
  const tx = clamp(-lvx * 0.011, -3, 3) + (st === 'flip' ? -1.2 : 0);
  const ty = clamp(-vy * 0.0036, -lim, lim) + clamp(-P.a_hipV * 0.05, -1.5, 1.5) + (st === 'flip' ? -1.5 : 0) + (st === 'carry' ? 1.2 : 0);
  for (let i = 0; i < 2; i++) {
    const h = dt / 2;
    P.a_hvx += ((tx - P.a_hx) * 230 - P.a_hvx * 10) * h; P.a_hx += P.a_hvx * h;
    P.a_hvy += ((ty - P.a_hy) * 230 - P.a_hvy * 10) * h; P.a_hy += P.a_hvy * h;
  }
  P.a_hx = clamp(P.a_hx, -3.5, 3.5); P.a_hy = clamp(P.a_hy, -3.5, lim + 0.5);
  if (!P.a_front && P.a_fu === 0) P.ik = null;
}

// ── ara sahne çizimi: fezaCizPoz(ctx, x, y, olcek, poz, tm, ara) ──
// Herhangi bir dönüşümle verilen ctx'e çizer; oyundaki Feza'nın durumuna dokunmaz.
// olcek 1 = oyundaki boy (≈62 birim); eksi olcek aynalar. Pozlar:
//   'uyku'   : yatakta yan yatmış uyuyor, kucağında bir şeye sarılmış. x,y = yatağın üstünde kalçasının değdiği nokta,
//              baş solda (eksi olcek → sağda). ara(ctx, kx, ky, olcek) verilirse kolların ARKASINA, gövdenin önüne çizilir
//              (Pırıl peluşu için); kx,ky = kucak noktası (ctx koordinatında).
//   'uyanis' : tm = pozun başından beri geçen saniye. 0–1.1 sn yattığı yerden doğrulur, 1.1–2.4 gözlerini ovuşturur,
//              2.4–3.6 kollarını açıp esner/gerinir, 3.6–4.2 kollar iner ve kocaman gülümser (sonra öyle kalır).
//              x,y = kalçanın yatağa değdiği nokta (uyku ile aynı; geçiş kesintisiz).
//   'sevinc' : önden, kollar havada zıplıyor (tm ile döngü). x,y = ayak tabanı (yer).
//   'ayakta' : önden ayakta, gülümsüyor. 'ayakta_yan' : yandan (3/4) ayakta, sağa bakar. x,y = ayak tabanı.
// Dönüş: kucak noktası {x, y} (ctx koordinatında).
const fzCS = { a_R: Object.assign({}, FZ_REST), a_hipY: 0, a_hx: 0, a_hy: 0, a_lidM: 1, vy: 0, ik: null, ikUst: false, ara: null };
const FZ_UYAN = [   // t, yatış, sol el x,y, sağ el x,y, kapak, ağız açık, yuvarlak, gülüş, mutlu, baş, kaş, kollar üstte
  [0.0, 1, 2.0, -7.5, -2.2, -6.2, 0.05, 0.1, 0.4, 0.4, 0, 0.3, 0, 0],
  [0.5, 0.88, 2.0, -7.5, -2.2, -6.2, 0.05, 0.15, 0.4, 0.4, 0, 0.25, 0.1, 0],
  [1.1, 0, -2.5, -15.5, 2.5, -15.5, 0.05, 0.3, 0.7, 0.2, 0, -0.05, 0.3, 1],
  [1.4, 0, -3.4, -21.8, 3.4, -21.8, 0.05, 0.3, 0.8, 0.1, 0, 0.1, 0.4, 1],
  [2.4, 0, -3.4, -21.8, 3.4, -21.8, 0.05, 0.3, 0.8, 0.1, 0, -0.1, 0.4, 1],
  [2.9, 0, -9.0, -30.5, 9.0, -30.5, 0.05, 1.0, 0.9, 0, 0, -0.35, 0.8, 1],
  [3.6, 0, -9.4, -31.0, 9.4, -31.0, 0.05, 1.1, 0.9, 0, 0, -0.4, 0.8, 1],
  [4.2, 0, -8.4, -0.5, 8.4, -0.5, 1, 0.6, 0, 1, 0, 0.1, 0.5, 0],
  [9.9, 0, -8.4, -0.5, 8.4, -0.5, 1, 0.6, 0, 1, 0, 0.1, 0.5, 0]];
function fezaCizPoz(ctx, x, y, olcek, poz, tm, ara) {
  tm = tm || 0;
  const Q = fzCS, R = Object.assign(Q.a_R, FZ_REST);
  Q.ik = null; Q.ikUst = false; Q.ara = null; Q.a_hx = Q.a_hy = 0; Q.vy = 0;
  Q.a_lidM = (tm % 3.9) < 0.12 ? 0 : 1;
  let front = true, lie = 0, seated = false;
  const b = Math.sin(tm * 2.2); R.breath = b; R.mSmile = 0.8;
  if (poz === 'uyku') {
    lie = 1; seated = true; R.breath = Math.sin(tm * 1.5) * 1.4;
    R.lt1 = 0.9; R.lt2 = -1.3; R.bt1 = 0.8; R.bt2 = -1.2; R.lid = 0.05; Q.a_lidM = 1;
    R.mSmile = 0.4; R.mOpen = 0.1 + 0.05 * Math.sin(tm * 1.5); R.head = 0.3;
    Q.ik = [[2.0, -7.5 + 0.2 * R.breath, 0], [-2.2, -6.2 + 0.2 * R.breath, 0]];
    Q.a_hx = -2.5;
  } else if (poz === 'uyanis') {
    seated = true;
    let i = 0; while (i < FZ_UYAN.length - 2 && tm >= FZ_UYAN[i + 1][0]) i++;
    const A = FZ_UYAN[i], B = FZ_UYAN[i + 1], w = smooth(clamp((tm - A[0]) / (B[0] - A[0]), 0, 1)), L = j => lerp(A[j], B[j], w);
    lie = L(1);
    R.lt1 = lerp(1.45, 0.9, lie); R.lt2 = lerp(-0.1, -1.3, lie); R.bt1 = lerp(1.4, 0.8, lie); R.bt2 = lerp(-0.12, -1.2, lie);
    let rub = 0; if (tm > 1.3 && tm < 2.5) rub = Math.sin(clamp((tm - 1.3) / 1.2, 0, 1) * Math.PI);
    const rx = Math.cos(tm * 13) * 0.8 * rub, ry = Math.sin(tm * 13) * 0.6 * rub;
    Q.ik = [[L(2) + rx, L(3) + ry, 0], [L(4) - rx, L(5) + ry, 0]];
    if (tm > 2.6 && tm < 4.0) { Q.ik[0][2] = Q.ik[1][2] = smooth(clamp((tm - 2.6) / 0.3, 0, 1)) * smooth(clamp((4.0 - tm) / 0.3, 0, 1)); }
    Q.ikUst = L(13) > 0.5;
    R.lid = L(6); if (R.lid < 0.2) Q.a_lidM = 1;
    R.mOpen = L(7); R.mRound = L(8); R.mSmile = L(9); R.head = L(11); R.brow = L(12);
    if (tm > 4.0) { R.happy = clamp((4.6 - tm) / 0.3, 0, 1) > 0.5 ? 1 : 0; R.gx = 0.2 * Math.sin(tm * 0.7); }
    R.breath = b * (1 - lie * 0.5);
    Q.a_hx = -2.5 * lie;
  } else if (poz === 'sevinc') {
    const ph = (tm % 0.72) / 0.72, hop = Math.sin(ph * Math.PI);
    R.bob = -8 * hop; R.lt1 = 0.6 * hop; R.lt2 = -1.1 * hop; R.bt1 = 0.5 * hop; R.bt2 = -1.0 * hop;
    R.happy = 1; R.mOpen = 0.9; R.mSmile = 1; R.brow = 0.5;
    const wv = Math.sin(tm * 9) * 0.6;
    Q.ik = [[-9.6 + wv, -29.5 - hop * 1.2, 1], [9.6 - wv, -29.5 - hop * 1.2, 1]];
    Q.a_hy = Math.cos(ph * 6.2832) * 2;
    R.sy = 1 + 0.06 * hop - (ph < 0.08 || ph > 0.92 ? 0.05 : 0); R.sx = 2 - R.sy;
  } else if (poz === 'ayakta_yan') {
    front = false; R.la1 = 0.12 + 0.04 * b; R.ba1 = -0.1 + 0.03 * b; R.mSmile = 0.85; R.gx = 0.5;
  } else {   // 'ayakta' önden
    R.mSmile = 1; R.mOpen = 0.25; R.brow = 0.2; R.la1 = 0.12 + 0.04 * b; R.ba1 = 0.12 + 0.04 * b;
  }
  const fy = (a1, a2) => FZ_TH * Math.cos(a1) + FZ_SH * Math.cos(a1 + a2) + FZ_FT;
  const hip = -Math.max(fy(R.lt1, R.lt2), fy(R.bt1, R.bt2)) + R.bob;
  Q.a_hipY = hip;
  ctx.save();
  const m0 = ctx.getTransform();
  const sc = olcek * FZ_SC;
  ctx.translate(x, y); ctx.scale(sc * R.sx, Math.abs(sc) * R.sy);
  if (seated) {   // yatağa göre: yatarken kalçanın yanı, otururken kalçanın altı yatağa değer
    ctx.rotate(-1.5708 * lie);
    ctx.translate(lerp(0, 7.0, lie), -hip - lerp(3.6, 0, lie));
  }
  const mm = ctx.getTransform(), inv = m0.inverse();
  const kucak = inv.multiply(mm).transformPoint(new DOMPoint(0, hip - 6.5));
  if (typeof ara === 'function') Q.ara = () => { ctx.save(); ctx.setTransform(m0); ara(ctx, kucak.x, kucak.y, olcek); ctx.restore(); };
  const eski = fzQ; fzQ = Q;
  try { if (front) fzDrawFront(ctx, tm); else fzDraw(ctx, tm); }
  finally { fzQ = eski; ctx.restore(); }
  return { x: kucak.x, y: kucak.y };
}

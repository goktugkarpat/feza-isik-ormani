/* deniz.js – İnci Denizi: denizatları, ahtapotun üç kabuğu, vatoz yolculuğu ve Büyük İnci.
   Canvas 2D; hareketler dt ile, önbellekli gövde kaplamaları; başarısızlık/süre baskısı yok. */
'use strict';
const DNZ = { ati: [], oct: null, ride: null, pearl: null, aktif: null, ptr: -1, kol: -1, sel: -1, sohbet: Object.create(null) };
const dnzPal = ['#ffcbb4', '#c9b8f6', '#9be6de', '#ffd992', '#efb9d8'];
const dnzKabukPal = ['#f5bdcb', '#a6dfd5', '#f4d898'];
function dnzSoz(k) { if (DNZ.sohbet[k]) return; DNZ.sohbet[k] = true; if (typeof SES !== 'undefined' && SES.soyle) SES.soyle(k, { oncelik: 3 }); }
function dnzSes(v) { if (typeof AU !== 'undefined' && AU.sfx) AU.sfx('inci', v || 0); }
function dnzOval(c, x, y, rx, ry, renk, rot) { c.fillStyle = renk; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); c.fill(); }
// "buraya dokun" ipucu (denizatı için; yazı yok): nabız halkaları + yumuşak parmak ucu. a = saydamlık, r = halka yarıçapı
function dnzEl(c, x, y, a, r) {
  if (!(a > 0) || !(r > 0)) return;
  const t = (typeof now === 'number' ? now : performance.now() / 1000), u = (t * 1.1) % 1;
  c.save();
  c.globalAlpha = a * 0.75 * (1 - u); c.strokeStyle = '#e6fff8'; c.lineWidth = 2.6;
  c.beginPath(); c.arc(x, y, r * (0.45 + 0.65 * u), 0, Math.PI * 2); c.stroke();
  c.globalAlpha = a * 0.5; c.fillStyle = 'rgba(214,255,246,.55)';
  c.beginPath(); c.arc(x, y, r * 0.2, 0, Math.PI * 2); c.fill();
  c.globalAlpha = a * 0.85; c.fillStyle = '#fff5e6'; c.strokeStyle = 'rgba(120,150,170,.55)'; c.lineWidth = 1.6;
  c.beginPath(); c.ellipse(x + r * 0.42, y + r * 0.62, r * 0.17, r * 0.34, -0.5, 0, Math.PI * 2); c.fill(); c.stroke();
  c.restore();
}
// genişleyen ışık halkası (kabuk yuvası dolunca, vatoz kemeri geçilince): t = geçen sn, ~1,4 sn'de söner
function dnzIsikHalka(c, x, y, t, renk, r) {
  const u = t / 1.4;
  if (!(u >= 0 && u < 1) || !(r > 0)) return;
  const e = 1 - (1 - u) * (1 - u);
  c.save(); c.globalAlpha = 0.6 * (1 - u); c.strokeStyle = renk; c.lineWidth = 2 + (1 - u) * 3.5;
  c.beginPath(); c.arc(x, y, r * (0.25 + 0.75 * e), 0, Math.PI * 2); c.stroke(); c.restore();
}
function dnzGoz(c, x, y, r, kap, mutlu, gazeX=0, gazeY=0) {
  gazeX=clamp(gazeX,-1,1);gazeY=clamp(gazeY,-1,1);
  c.strokeStyle = '#354965'; c.lineWidth = Math.max(1.3, r * .33); c.lineCap = 'round';
  if (kap > .8 || mutlu) { c.beginPath(); c.arc(x, y + (mutlu ? r * .5 : -r * .35), r * .85, mutlu ? Math.PI * 1.15 : .15, mutlu ? Math.PI * 1.85 : Math.PI - .15); c.stroke(); return; }
  dnzOval(c, x, y, r * 1.03, r * 1.22 * (1 - kap * .8), '#fffefa');
  dnzOval(c, x + r * (.12+gazeX*.18), y + r * (.14+gazeY*.06), r * .7, r * .94 * (1 - kap * .8), '#30425d');
  dnzOval(c, x - r * .22+gazeX*r*.2, y-r*.36+gazeY*r*.16, r * .25, r * .31, '#ffffff');
}
const dnzKabukSpr = [];
function dnzSevinc(x, y, renk, n) { if (typeof burst === 'function') burst(x, y, n || 22, [renk, '#fff8d9', '#cbfff1'], 88, 1.6, 5); }
function dnzSedefYildizCiz(c, x, y, r, a, col) {
  if (a <= 0.01) return;
  c.save(); c.translate(x, y); c.globalAlpha = a;
  c.fillStyle = col || '#fff8d6';
  c.beginPath();
  c.moveTo(0, -r * 1.5); c.quadraticCurveTo(r * 0.18, -r * 0.18, r * 1.5, 0);
  c.quadraticCurveTo(r * 0.18, r * 0.18, 0, r * 1.5);
  c.quadraticCurveTo(-r * 0.18, r * 0.18, -r * 1.5, 0);
  c.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r * 1.5);
  c.closePath(); c.fill();
  c.fillStyle = '#ffffff';
  c.beginPath(); c.arc(0, 0, r * 0.35, 0, Math.PI * 2); c.fill();
  c.restore();
}
function dnzSedefYildizlar(x, y, col, n) {
  if (typeof parts === 'undefined') return;
  const cols = ['#ffffff', '#fff9d6', '#c9fffa', '#ffd6f0', col];
  for (let i = 0; i < (n || 14); i++) {
    const ang = Math.random() * Math.PI * 2, spd = 35 + Math.random() * 75;
    parts.push({
      x: x + Math.cos(ang) * 4, y: y + Math.sin(ang) * 4,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 15,
      life: 0.95 + Math.random() * 0.5, max: 1.45,
      col: cols[i % cols.length], size: 4.2 + Math.random() * 3.2, havuz: true
    });
  }
}
function dnzAtOdul(o, dt) {
  const k = o.dnz;
  dt = dt || 0.016;
  if (!k.halkalar) k.halkalar = [];
  for (let i = k.halkalar.length - 1; i >= 0; i--) {
    k.halkalar[i].t += dt;
    if (k.halkalar[i].t > k.halkalar[i].maxT) k.halkalar.splice(i, 1);
  }
  const t = k.bulT, dur = 3.2;
  const homeX = o.x, homeY = o.y - 42;
  if (t > dur) {
    k.takla = 0; k.sqx = k.sqy = 1; k.tailCoil = 0; k.tailWhip = 0; k.prevTakla = 0;
    const targetX = homeX + Math.sin(k.t * 1.4 + k.seed) * 8;
    const targetY = homeY + Math.sin(k.t * 1.1 + k.seed) * 6;
    k.hx += (targetX - k.hx) * (1 - Math.exp(-dt * 4));
    k.hy += (targetY - k.hy) * (1 - Math.exp(-dt * 4));
    return;
  }
  const fezaX = P.x, fezaY = P.y - 25;
  const dFeza = Math.hypot(fezaX - homeX, fezaY - homeY);
  const reach = Math.min(1, 350 / Math.max(1, dFeza));
  const cx = lerp(homeX, fezaX, reach);
  const cy = lerp(homeY, fezaY, reach);
  const dir = k.face || (cx < homeX ? -1 : 1) || 1;
  const A0 = dir > 0 ? Math.PI * 0.85 : Math.PI * 0.15;
  const eio = u => u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;   // ease-in-out (kübik)
  const prevT = k.prevTakla || 0;
  // zaman çizelgesi (sn): hazırlık 0.45 → takla 1.45 → iniş/sallanma 0.7 → eve dönüş (kalan)
  const T1 = 0.45, T2 = T1 + 1.45, T3 = T2 + 0.7;
  k.sqx = 1; k.sqy = 1;
  if (t < T1) {   // anticipation: geriye gerilir, çömelir, kuyruk kıvrılır
    const p = smooth(t / T1), back = Math.sin(p * Math.PI * 0.5);
    const reachX = cx + Math.cos(A0) * 65, reachY = cy + Math.sin(A0) * 45;
    k.hx = lerp(homeX, lerp(homeX, reachX, 0.55), p);
    k.hy = lerp(homeY, lerp(homeY, reachY, 0.55), p) + back * 10 - Math.sin(p * Math.PI) * 6;
    k.takla = -0.34 * dir * back;
    k.sqx = 1 + 0.07 * back; k.sqy = 1 - 0.09 * back; k.tailCoil = back;
  } else if (t < T2) {
    const loopU = (t - T1) / (T2 - T1), e = eio(loopU);
    const ang = A0 + e * Math.PI * 2 * dir;
    const rx = 68, ry = 52;
    // hazırlıktan yumuşak giriş: yarıçap ilk anda küçükten açılır
    const open = smooth(clamp(loopU / 0.18, 0, 1));
    const sx = lerp(homeX, cx + Math.cos(A0) * 65, 0.55), sy = lerp(homeY, cy + Math.sin(A0) * 45, 0.55);
    k.hx = lerp(sx, cx + Math.cos(ang) * rx, open);
    k.hy = lerp(sy + 10, cy + Math.sin(ang) * ry - 8, open);
    k.takla = lerp(-0.34 * dir, 0, open) + 0.35 * dir * open + e * Math.PI * 2 * dir;
    const sp = Math.min(1, Math.abs(k.takla - prevT) / Math.max(dt, 1e-3) / 9);   // dönüş hızına göre squash-stretch
    k.sqx = 1 + 0.16 * sp; k.sqy = 1 - 0.12 * sp; k.tailCoil = 0; k.tailWhip = sp;
    if (loopU >= 0.18 && !k.ring1) {
      k.ring1 = true;
      k.halkalar.push({ x: cx, y: cy - 10, t: 0, maxT: 2.2, r0: 24, r1: 135, renk: k.renk });
      dnzSevinc(k.hx, k.hy, k.renk, 8);
      dnzSedefYildizlar(cx, cy - 10, k.renk, 14);
    }
    if (loopU >= 0.52 && !k.ring2) {
      k.ring2 = true;
      k.halkalar.push({ x: cx, y: cy - 10, t: 0, maxT: 2.2, r0: 28, r1: 150, renk: '#fff5c2' });
      dnzSevinc(k.hx, k.hy, '#ffffff', 10);
      dnzSedefYildizlar(cx, cy - 10, '#ffffff', 16);
    }
    if (loopU >= 0.82 && !k.ring3) {
      k.ring3 = true;
      k.halkalar.push({ x: k.hx, y: k.hy, t: 0, maxT: 1.8, r0: 16, r1: 85, renk: k.renk });
      dnzSedefYildizlar(k.hx, k.hy, k.renk, 12);
    }
    if (Math.random() < dt * 40 && typeof parts !== 'undefined') {   // kabarcık/ışık yayı
      parts.push({ x: k.hx + (Math.random() - 0.5) * 8, y: k.hy + 6 + (Math.random() - 0.5) * 8, vx: (Math.random() - 0.5) * 24, vy: -10 - Math.random() * 22, life: 0.8, max: 0.8, col: Math.random() < 0.5 ? k.renk : '#e9fffb', size: 2.4 + Math.random() * 1.6 });
    }
  } else if (t < T3) {   // iniş: yavaşlayan aşma ve geri sallanma (sönümlü yay), squash→recover
    const su = (t - T2), endAng = A0 + Math.PI * 2 * dir;
    const leaveX = cx + Math.cos(endAng) * 65, leaveY = cy + Math.sin(endAng) * 45;
    const ov = Math.exp(-su * 5.5) * Math.cos(su * 15);
    k.hx = lerp(leaveX, homeX, smooth(clamp(su / (T3 - T2), 0, 1)) * 0.35);
    k.hy = lerp(leaveY, homeY, smooth(clamp(su / (T3 - T2), 0, 1)) * 0.35) + 10 * Math.exp(-su * 5) * Math.sin(su * 10);
    k.takla = Math.PI * 2 * dir + 0.35 * dir * (1 - smooth(clamp(su / 0.25, 0, 1))) + 0.26 * dir * ov * (dir > 0 ? 1 : 1);
    k.sqx = 1 - 0.07 * Math.exp(-su * 6) * Math.cos(su * 16); k.sqy = 1 + 0.09 * Math.exp(-su * 6) * Math.cos(su * 16);
    k.tailWhip = Math.exp(-su * 3);
  } else {
    const rt = smooth(clamp((t - T3) / Math.max(0.1, dur - T3), 0, 1));
    const su = T3 - T2, endAng = A0 + Math.PI * 2 * dir;
    const mx = lerp(cx + Math.cos(endAng) * 65, homeX, 0.35), my = lerp(cy + Math.sin(endAng) * 45, homeY, 0.35);
    k.hx = lerp(mx, homeX, rt); k.hy = lerp(my, homeY, rt) + Math.sin(rt * Math.PI) * 10;
    k.takla = Math.PI * 2 * dir; k.tailWhip = 0;
  }
  k.prevTakla = k.takla;
}
function dnzKabukSprite(i) {
  if (dnzKabukSpr[i]) return dnzKabukSpr[i];
  const c = document.createElement('canvas'); c.width = c.height = 144; const q = c.getContext('2d'); q.scale(1.35, 1.35); q.translate(53.33, 54.5); const r = 41, rnd = rng(743 + i * 37);
  q.beginPath();
  if (i === 0) { q.moveTo(-29, 23); for (let j = 0; j <= 48; j++) { const t = Math.PI + j / 48 * Math.PI, rr = r + Math.sin(j / 48 * Math.PI * 12) * 2.6, px = Math.cos(t) * rr, py = Math.sin(t) * rr; if (j) q.lineTo(px, py); else q.lineTo(px, py); } q.lineTo(29, 23); q.quadraticCurveTo(0, 38, -29, 23); q.closePath(); }
  else if (i === 1) { const pts = []; for (let j = 0; j < 10; j++) { const t = -Math.PI / 2 + j * Math.PI / 5, rr = j % 2 ? 23 : r; pts.push([Math.cos(t) * rr, Math.sin(t) * rr]); } q.moveTo((pts[9][0] + pts[0][0]) / 2, (pts[9][1] + pts[0][1]) / 2); for (let j = 0; j < 10; j++) { const a = pts[j], b = pts[(j + 1) % 10]; q.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); } q.closePath(); }
  else { q.moveTo(38, 1); q.bezierCurveTo(44, -24, 16, -37, -6, -33); q.bezierCurveTo(-37, -31, -47, -8, -35, 14); q.bezierCurveTo(-28, 30, -7, 34, 20, 23); q.quadraticCurveTo(38, 19, 38, 1); q.closePath(); }
  const gr = q.createRadialGradient(-16, -24, 1, 4, 4, 60), bright = ['#fff3e9', '#e5fff2', '#fff5d5'][i], dark = ['#b77b9b', '#538f9c', '#aa8258'][i]; gr.addColorStop(0, bright); gr.addColorStop(.42, dnzKabukPal[i]); gr.addColorStop(1, dark); q.fillStyle = gr; q.fill(); q.save(); q.clip();
  for (let j = 0; j < 280; j++) { const xx = -46 + rnd() * 92, yy = -44 + rnd() * 82; dnzOval(q, xx, yy, .15 + rnd() * .8, .15 + rnd() * .3, 'rgba(250,255,237,' + (.06 + rnd() * .16) + ')'); }
  if (i === 0) { for (let j = -6; j <= 6; j++) { const tx = j * 5.8, ty = -Math.sqrt(Math.max(0, r * r - tx * tx)); q.strokeStyle = 'rgba(129,77,105,.2)'; q.lineWidth = 3; q.beginPath(); q.moveTo(0, 27); q.quadraticCurveTo(tx * .5 - 1, -1, tx, ty); q.stroke(); q.strokeStyle = 'rgba(255,248,225,.76)'; q.lineWidth = 1.25; q.beginPath(); q.moveTo(1, 24); q.quadraticCurveTo(tx * .5 + 1, -1, tx + 1.5, ty); q.stroke(); } }
  else if (i === 1) { for (let j = 0; j < 5; j++) { const a = -Math.PI / 2 + j * Math.PI * 2 / 5; q.strokeStyle = 'rgba(68,126,141,.22)'; q.lineWidth = 4; q.beginPath(); q.moveTo(0, 3); q.quadraticCurveTo(Math.cos(a) * 15, Math.sin(a) * 15, Math.cos(a) * 36, Math.sin(a) * 36); q.stroke(); q.strokeStyle = 'rgba(235,255,222,.68)'; q.lineWidth = 1.2; q.stroke(); for (let n = 1; n < 5; n++) dnzOval(q, Math.cos(a) * n * 6.5 - 2, Math.sin(a) * n * 6.5 + 2, 1.5, 1.2, 'rgba(239,255,224,.54)'); } }
  else { for (let z = 0; z < 3; z++) { q.beginPath(); for (let j = 0; j <= 75; j++) { const t = j / 75 * Math.PI * 4.1, rr = 2 + j / 75 * 31; const px = Math.cos(t) * rr - 3 + z * 1.2, py = Math.sin(t) * rr * .75 + z; if (j) q.lineTo(px, py); else q.moveTo(px, py); } q.strokeStyle = z === 0 ? 'rgba(134,91,61,.3)' : z === 1 ? 'rgba(255,250,218,.8)' : 'rgba(220,174,120,.36)'; q.lineWidth = z === 0 ? 4 : 1.3; q.stroke(); } dnzOval(q, 29, 12, 7, 15, '#e8cca1', .44); dnzOval(q, 30, 13, 4, 10, '#af845c', .44); dnzOval(q, 31, 14, 2.5, 6.5, '#8c7256', .44); }
  q.restore(); q.strokeStyle = 'rgba(104,125,142,.4)'; q.lineWidth = 1; q.stroke(); dnzOval(q, -17, -22, 13, 4.2, 'rgba(255,255,242,.45)', -.4);
  dnzKabukSpr[i] = c; return c;
}
function dnzKabuk(c, x, y, r, i, a) { c.save(); c.translate(x, y); c.rotate(a || 0); const s = r / 41; c.drawImage(dnzKabukSprite(i), -53.33 * s, -54.5 * s, 106.67 * s, 106.67 * s); c.restore(); }
const dnzAtSpr = new Map(), dnzAtTailPal = new Map();
function dnzAtSprite(renk) {
  if (dnzAtSpr.has(renk)) return dnzAtSpr.get(renk);
  dnzAtTailPal.set(renk,mixc(renk,'#86b8bf',.58));
  const c = document.createElement('canvas'); c.width = 160; c.height = 220; const x = c.getContext('2d'); x.translate(80, 75);
  const gr = x.createLinearGradient(-30, -45, 34, 55); gr.addColorStop(0, mixc(renk, '#f6dca8', .32)); gr.addColorStop(.34, renk); gr.addColorStop(1, '#86b8bf');
  // A real curved silhouette: neck, rounded belly, lifted muzzle and coiled tail.
  x.beginPath(); x.moveTo(-12, -37); x.bezierCurveTo(-31, -22, -27, 1, -10, 19); x.bezierCurveTo(13, 42, 11, 55, -1, 64); x.bezierCurveTo(-23, 80, -23, 101, -3, 103); x.bezierCurveTo(17, 105, 23, 85, 10, 79); x.bezierCurveTo(2, 74, -8, 81, -2, 86); x.bezierCurveTo(3, 90, 8, 83, 10, 87); x.bezierCurveTo(12, 96, -1, 99, -6, 93); x.bezierCurveTo(-16, 81, 23, 64, 26, 44); x.bezierCurveTo(31, 18, 4, 4, 5, -10); x.lineTo(29, -12); x.quadraticCurveTo(43, -10, 43, -23); x.quadraticCurveTo(40, -32, 28, -30); x.lineTo(13, -31); x.quadraticCurveTo(0, -46, -12, -37); x.closePath(); x.fillStyle = gr; x.fill(); x.strokeStyle = '#6a9ba4'; x.lineWidth = 1.3; x.stroke(); x.save(); x.clip(); const texture = rng(213 + dnzPal.indexOf(renk) * 91); for (let n = 0; n < 260; n++) { const xx = -35 + texture() * 80, yy = -41 + texture() * 103; dnzOval(x, xx, yy, .22 + texture() * .73, .3 + texture() * .48, n % 3 ? 'rgba(255,246,217,.17)' : 'rgba(69,119,132,.08)'); } x.restore();
  x.fillStyle = 'rgba(255,239,200,.29)'; x.beginPath(); x.moveTo(4, 4); x.bezierCurveTo(13, 12, 25, 30, 19, 48); x.quadraticCurveTo(8, 36, 0, 24); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(92,144,151,.36)'; x.lineWidth = 1.5; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(-2 + i * 2.5, 13 + i * 5); x.quadraticCurveTo(6 + i * 2.7, 18 + i * 5, 16 + i * .8, 16 + i * 5); x.stroke(); }
  for (let i = 0; i < 6; i++) { dnzOval(x, -17 + i * 1.4, -22 + i * 8, 2.5, 3.5, '#fff0d9', -.5); }
  // Crown is a soft skin ridge, not a costume.
  x.fillStyle = renk; x.beginPath(); x.moveTo(-17, -32); x.quadraticCurveTo(-28, -48, -16, -48); x.quadraticCurveTo(-9, -59, -5, -45); x.quadraticCurveTo(7, -51, 6, -38); x.closePath(); x.fill();
  dnzAtSpr.set(renk, c); return c;
}
function dnzAtOyna(o) {
  const k = o.dnz; if (!o.done || k.playCd > 0 || DURUM !== 'oyun') return false;
  k.playCd = 4.2; k.bulT = 0; k.sev = 3.4; k.ring1 = false; k.ring2 = false; k.ring3 = false;
  k.face = P.x < k.hx ? -1 : 1;
  if (!k.halkalar) k.halkalar = [];
  k.halkalar.push({ x: P.x, y: P.y - 25, t: 0, maxT: 2.6, r0: 22, r1: 145, renk: k.renk });
  dnzSevinc(k.hx, k.hy, k.renk, 16); dnzSes(.28);
  OLAY.emit('denizatiOyun', { o, x: k.hx, y: k.hy, sure: 3.4 }); return true;
}
function dnzAtCiz(c, x, y, s, tm, renk, mutlu, seed, k) {
  const spr = dnzAtSprite(renk), joy = k && k.sev > .1 ? Math.min(1, k.sev) : 0, invitation = k ? k.invite || 0 : 0, moment = k ? k.bulT : 0;
  const takla = k ? (k.takla || 0) : 0;
  c.save(); c.translate(x, y + Math.sin(tm * 1.6 + seed) * 4 + Math.sin(tm * 0.62 + seed * 1.7) * 2.2);   // nefes alan çift sinüs salınımı
  c.rotate(Math.sin(tm * 1.3 + seed) * .055 + Math.sin(moment * 5) * .18 * joy - invitation * .07 + takla);
  c.scale(s * (k ? k.face : 1) * (k && k.sqx || 1), s * (k && k.sqy || 1));
  // The prehensile tail opens to greet Feza, coils again, then draws a playful little spiral.
  const relax = invitation * .32 + joy * (.3 + .25 * Math.sin(moment * 4.5)), sway = Math.sin(tm * 1.7 + seed) * 4 + (k ? (k.tailWhip || 0) * Math.sin(tm * 13) * 7 - (k.tailCoil || 0) * 6 + joy * Math.sin(moment * 9) * 3.5 : 0);
  c.lineCap = 'round'; c.strokeStyle = '#77a2ae'; c.lineWidth = 8.2; c.beginPath(); c.moveTo(14, 52); c.bezierCurveTo(18 + sway, 67, -2 + sway, 70, 18 + sway, 79);
  for (let i = 0; i <= 24; i++) { const u = i / 24, ang = -.52 + u * Math.PI * (1.9 - relax * .7), r = 19 * (1 - u * .79), xx = 2 + Math.cos(ang) * r + sway, yy = 89 + Math.sin(ang) * r * (.82 + relax * .3) + relax * 7; c.lineTo(xx, yy); } c.stroke(); c.strokeStyle = dnzAtTailPal.get(renk); c.lineWidth = 5.8; c.stroke(); c.strokeStyle = 'rgba(255,242,211,.32)'; c.lineWidth = 1.2; c.stroke();
  c.drawImage(spr, 0, 65, 160, 71, -80, -10, 160, 71);
  const fin = Math.sin(tm * (12.5 + joy * 6) + seed), spread = 1 + invitation * .22 + joy * .32;
  c.save(); c.translate(-20, -1); c.scale(spread, 1); c.fillStyle = 'rgba(236,255,240,.61)'; c.beginPath(); c.moveTo(0, -3); c.bezierCurveTo(-8, -17, -32 - fin * 4, -20, -25, 0); c.quadraticCurveTo(-17, 18, 0, -3); c.fill(); c.strokeStyle = 'rgba(105,155,167,.42)'; c.lineWidth = .9; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(0, -3); c.quadraticCurveTo(-13, -11 + i * 6, -23 - fin * 2, -13 + i * 6); c.stroke(); } c.restore();
  // Neck and face are articulated separately from the belly and tail.
  c.save(); c.translate(0, -12); c.rotate(Math.sin(tm * 1.7 + seed) * .035 + Math.sin(moment * 4.3) * .11 * joy + invitation * .085); c.drawImage(spr, 0, 0, 160, 65, -80, -63, 160, 65);
  const blink = Math.sin(tm * .86 + seed * 2.2) > .992 ? 1 : 0; dnzGoz(c, 7, -14, 7, blink, mutlu && Math.sin(moment * 3.7) > .1, invitation * .7, joy ? -.3 : 0); c.strokeStyle = 'rgba(97,120,131,.72)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(2, -26 - joy); c.quadraticCurveTo(7, -28 - joy * 3, 12, -26 - joy); c.stroke(); dnzOval(c, 16, 0, 6.3, 3.5, 'rgba(247,156,178,.56)');
  c.strokeStyle = '#567788'; c.lineWidth = 1.45; c.beginPath(); if (joy > .1 && moment < .32) { dnzOval(c, 34, -3, 2.3, 3.2, '#657e8e'); } else { c.moveTo(28, -3); c.quadraticCurveTo(33, joy ? 4 : 1, 38, -4); c.stroke(); } c.restore(); c.restore();
}
function dnzAtBul(o) {
  if (o.done || DURUM !== 'oyun' || P.fade > 0) return;
  o.done = true; o.dnz.sev = 3.8; o.dnz.bulT = 0; o.dnz.uyan = 1; o.dnz.playCd = 4.5;
  o.dnz.ring1 = false; o.dnz.ring2 = false; o.dnz.ring3 = false;
  if (!o.dnz.halkalar) o.dnz.halkalar = [];
  o.dnz.halkalar.push({ x: P.x, y: P.y - 25, t: 0, maxT: 2.8, r0: 22, r1: 155, renk: o.dnz.renk });
  dnzSevinc(o.x, o.y - 42, o.dnz.renk, 20); if (D.tkO === o.dnz.pr && typeof drMode === 'function') { D.tkO = null; drMode('follow'); } OLAY.emit('denizati', { o, x: o.x, y: o.y - 42, renk: o.dnz.renk, sure: 3.8 });
  if (typeof dragonHappy === 'function') dragonHappy(o);
}
TUR.kaydet('denizati', {
  kur(o) { o.r = 140; o.ry = 42; o.dnz = { t: 0, sev: 0, bulT: 0, takla: 0, ring1: false, ring2: false, ring3: false, halkalar: [], yardim: 0, hint: 0, invite: 0, playCd: 0, face: -1, uyan: 0, pr: { x: o.x + 20, y: o.y + 90 }, renk: dnzPal[DNZ.ati.length % 5], seed: DNZ.ati.length * 1.63, hx: o.x, hy: o.y - 42, floor: typeof yuzey === 'function' ? yuzey(Math.floor(o.x / T)) : 1000 }; dnzAtSprite(o.dnz.renk); for (const color of ['#fff1be', '#fff8d9', '#cbfff1', o.dnz.renk]) glow(color); if (typeof sklElSprite === 'function') sklElSprite(); DNZ.ati.push(o); },
  dokun: dnzAtBul,
  guncelle(o, dt) {
    const k = o.dnz; k.t += dt; k.sev = Math.max(0, k.sev - dt); k.playCd = Math.max(0, k.playCd - dt);
    k.invite += ((Math.abs(P.x - o.x) < 360 ? 1 : 0) - k.invite) * (1 - Math.exp(-dt * 2.8));
    if (o.done) {
      k.bulT += dt;
      dnzAtOdul(o, dt);
      const distToFeza = Math.hypot(P.x - k.hx, P.y - 30 - k.hy);
      if (distToFeza < 88 && k.playCd <= 0 && DURUM === 'oyun') {
        dnzAtOyna(o);
      }
      return;
    }
    const dist = Math.hypot(P.x - o.x, P.y - 30 - (o.y - 42));
    if (DURUM !== 'oyun') return;
    const curTarget = dist < 450 ? Math.max(0, 1 - dist / 450) : 0;
    k.curiosity = (k.curiosity || 0) + (curTarget - (k.curiosity || 0)) * (1 - Math.exp(-dt * 2.6));
    const curAngle = Math.atan2((P.y - 30) - (o.y - 42), P.x - o.x);
    const curDist = k.curiosity * 46;
    k.hx = o.x + Math.cos(curAngle) * curDist + Math.sin(k.t * 1.4 + k.seed) * 8;
    k.hy = o.y - 42 + Math.sin(curAngle) * (curDist * 0.42) + Math.sin(k.t * 1.1 + k.seed) * 6;
    if (dist < 520) {
      k.hint += dt;
      if (Math.abs(P.x - o.x) > 85) k.face = P.x < o.x ? -1 : 1;
      dnzSoz('p_i_denizati');
    }
    if (!o.done) {
      if (!k.ruyaKabarciklar) k.ruyaKabarciklar = [];
      k.ruyaT = (k.ruyaT || 0) + dt;
      if (k.ruyaT > 1.8) {
        k.ruyaT = 0;
        k.ruyaKabarciklar.push({
          x: k.hx + (k.face > 0 ? 18 : -18),
          y: k.hy - 14,
          vy: -22 - Math.random() * 8,
          wob: Math.random() * 6.28,
          r: 3.2 + Math.random() * 2.8,
          life: 3.2,
          max: 3.2
        });
      }
      for (let i = k.ruyaKabarciklar.length - 1; i >= 0; i--) {
        const b = k.ruyaKabarciklar[i];
        b.life -= dt;
        b.y += b.vy * dt;
        b.x += Math.sin(b.life * 3.5 + b.wob) * 14 * dt;
        if (b.life <= 0) k.ruyaKabarciklar.splice(i, 1);
      }
    }
    if (dist < 150) dnzAtBul(o);
    else if (dist < 420 && k.hint > 14) {
      k.yardim += dt;
      if (k.yardim < dt * 1.1) {
        OLAY.emit('denizatiYardim', { o, sure: 4 });
        if (typeof omDikkat === 'function') omDikkat('denizatiYardim', 4, () => omDkEkle(o.x - 170, o.y - 160, o.x + 170, o.y + 80), .7, .8);
      }
      if (k.yardim > 3.5) dnzAtBul(o);
    }
  },
  ciz(o, tm) {
    const k = o.dnz;
    const xx = k.hx, yy = k.hy;
    if (!o.done && k.ruyaKabarciklar && k.ruyaKabarciklar.length) {
      for (const b of k.ruyaKabarciklar) {
        const alpha = Math.sin((b.life / b.max) * Math.PI) * 0.75;
        g.save();
        g.globalAlpha = alpha;
        g.strokeStyle = '#d6fbf5';
        g.lineWidth = 1.2;
        g.fillStyle = 'rgba(255, 235, 248, 0.22)';
        g.beginPath();
        g.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        dnzOval(g, b.x - b.r * 0.32, b.y - b.r * 0.35, b.r * 0.35, b.r * 0.22, '#ffffff');
        g.restore();
      }
    }
    if (k.halkalar && k.halkalar.length) {
      for (const h of k.halkalar) {
        const u = clamp(h.t / h.maxT, 0, 1);
        if (u >= 1) continue;
        const r = h.r0 + smooth(u) * (h.r1 - h.r0);
        const alpha = Math.sin(u * Math.PI) * 0.72;
        g.save();
        g.globalAlpha = alpha;
        g.strokeStyle = h.renk;
        g.lineWidth = 3.4 * (1 - u * 0.6);
        g.beginPath();
        g.ellipse(h.x, h.y, r, r * 0.78, 0, 0, Math.PI * 2);
        g.stroke();
        g.lineWidth = 11 * (1 - u * 0.5);
        g.globalAlpha = alpha * 0.32;
        g.stroke();
        for (let s = 0; s < 6; s++) {
          const sa = s * Math.PI / 3 + h.t * 1.5;
          const sx = h.x + Math.cos(sa) * r, sy = h.y + Math.sin(sa) * r * 0.78;
          const starAlpha = alpha * (0.5 + 0.5 * Math.sin(tm * 6 + s));
          if (starAlpha > 0.05) {
            dnzSedefYildizCiz(g, sx, sy, 3.8 * (1 - u * 0.5), starAlpha, h.renk);
          }
        }
        g.restore();
      }
    }
    const floor = typeof yuzey === 'function' ? yuzey(Math.floor(o.x / T)) : k.floor;
    // Yuva tabanındaki sedef pırıltısı ve hâle
    dglow(k.renk, o.x, floor - 42, 120, 0.14 + 0.04 * Math.sin(tm * 1.8 + k.seed));
    dglow('#fff9df', o.x, floor - 20, 65, 0.1);

    // Yuva su bitkileri
    g.globalAlpha = .8;
    for (let j = 0; j < 6; j++) {
      const bx = o.x + (j < 3 ? -65 + j * 18 : 32 + (j - 3) * 18), bFloor = typeof yuzey === 'function' ? yuzey(Math.floor(bx / T)) : k.floor;
      const h = Math.max(130, Math.min(370, (bFloor - o.y + 45) * (.58 + (j % 3) * .2))), bend = Math.sin(tm * .85 + j * .65 + k.seed) * 24 + (j < 3 ? -42 : 42), tipX = bx + bend, tipY = bFloor - h, width = 4 + (j % 2) * 1.5, curl = j < 3 ? -42 : 42;
      g.fillStyle = j % 2 ? '#3aa59b' : '#288f8e'; g.beginPath(); g.moveTo(bx - width, bFloor + 2); g.bezierCurveTo(bx - width + curl, bFloor - h * .32, tipX - width - curl, tipY + h * .4, tipX - 2, tipY + 4); g.quadraticCurveTo(tipX, tipY - 2, tipX + 2, tipY + 4); g.bezierCurveTo(tipX + width - curl, tipY + h * .4, bx + width + curl, bFloor - h * .32, bx + width, bFloor + 2); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(169,229,200,.32)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(bx, bFloor); g.bezierCurveTo(bx + curl, bFloor - h * .32, tipX - curl, tipY + h * .4, tipX, tipY + 7); g.stroke();
    }
    g.globalAlpha = 1;

    // Yuvayı çevreleyen ışıklı su kabarcıkları
    for (let b = 0; b < 7; b++) {
      const bSeed = k.seed * 3.1 + b * 1.73;
      const bProg = ((tm * 0.32 + b * 0.142) % 1);
      const bWave = Math.sin(bProg * 6.28 + bSeed) * 32 + (b % 2 ? -20 : 20);
      const bx = o.x + bWave;
      const by = (floor - 15) - bProg * 220;
      const br = 2.4 + (b % 3) * 1.3;
      const bAlpha = Math.sin(bProg * Math.PI) * 0.68;
      g.save();
      g.globalAlpha = bAlpha;
      g.strokeStyle = b % 2 ? '#cafff4' : '#fff7df';
      g.lineWidth = 1.25;
      g.beginPath();
      g.arc(bx, by, br, 0, Math.PI * 2);
      g.stroke();
      dnzOval(g, bx - br * 0.3, by - br * 0.3, br * 0.35, br * 0.22, '#ffffff');
      if (br > 3.2) dglow(k.renk, bx, by, br * 2.8, 0.2 * bAlpha);
      g.restore();
    }

    // Denizatını ve yuvasını çevreleyen narin sedef pırıltıları
    for (let s = 0; s < 6; s++) {
      const sSeed = k.seed * 2.1 + s * 1.37;
      const sAng = tm * 0.75 + s * 1.05 + sSeed;
      const sRad = 32 + Math.sin(tm * 1.3 + sSeed) * 18;
      const sx = xx + Math.cos(sAng) * sRad;
      const sy = yy + Math.sin(sAng) * (sRad * 0.65);
      const sSparkle = Math.max(0, Math.sin(tm * 3.4 + sSeed));
      if (sSparkle > 0.12) {
        const sSize = (1.4 + (s % 3) * 0.8) * sSparkle;
        const sCol = ['#ffffff', '#fff2b8', '#a8ffeb', '#fbb6de'][s % 4];
        g.save();
        g.globalAlpha = sSparkle * 0.82;
        g.fillStyle = sCol;
        g.beginPath();
        g.moveTo(sx, sy - sSize * 2.2);
        g.lineTo(sx + sSize * 0.6, sy);
        g.lineTo(sx, sy + sSize * 2.2);
        g.lineTo(sx - sSize * 0.6, sy);
        g.closePath();
        g.fill();
        g.beginPath();
        g.moveTo(sx - sSize * 2.2, sy);
        g.lineTo(sx, sy + sSize * 0.6);
        g.lineTo(sx + sSize * 2.2, sy);
        g.lineTo(sx, sy - sSize * 0.6);
        g.closePath();
        g.fill();
        dglow(sCol, sx, sy, 12, sSparkle * 0.24);
        g.restore();
      }
    }

    dglow(o.done ? '#fff1be' : '#b7fff1', xx, yy - 10, o.done ? 51 : 53, o.done ? .12 : .16 + .055 * Math.sin(tm * 2));
    dnzAtCiz(g, xx, yy, .67, tm, k.renk, k.sev > .1, k.seed, k);
    if (!o.done && k.hint > 2 && Math.abs(P.x - o.x) < 520) dnzEl(g, xx + 8, yy + 12 + Math.sin(tm * 3) * 6, .76 * (k.hint < 10 ? 1 : .65), 47);
  },
});

// Octopus arms each have a resting curled pose, a shell endpoint and a separate unfolding spring.
function dnzOctAktif(o) {
  if (o.done || DNZ.aktif === o || DURUM !== 'oyun') return;
  DNZ.aktif = o; o.dnz.bas = true; o.dnz.sure = 0; P.vx = P.vy = 0; P.kilit = Math.max(P.kilit || 0, .7); if (typeof omDikkat === 'function' && typeof omDkEkle === 'function') omDikkat('ahtapot', 45, () => omDkEkle(o.x - 260, o.y - 250, o.x + 260, o.y + 165), 1, .4); dnzSoz('p_i_ahtapot');
}
function dnzOctYer(o, i) { const k = o.dnz.kol[i]; return { x: o.x + k.x, y: o.y + k.y }; }
function dnzOctBitir(o) {
  if (o.done) return; o.done = true; o.dnz.kut = 0; DNZ.aktif = null; DNZ.ptr = -1; DNZ.kol = -1; DNZ.sel = -1; P.kilit = 0; if (typeof omDikkat === 'function' && typeof omDkEkle === 'function') omDikkat('ahtapot', 3, () => omDkEkle(o.x - 260, o.y - 250, o.x + 420, o.y + 165), 1, .4); OLAY.emit('ahtapotTamam', { o, x: o.x, y: o.y - 80, sure: 4 }); dnzSoz('p_i_ahtapot_bitti');
}
function dnzOctBirak(o, i) {
  const k = o.dnz.kol[i]; if (k.done) return; k.done = true; k.x = k.tx; k.y = k.ty; k.vur = 1; k.doneT = 0; o.dnz.sev = 2.2; o.dnz.balletT = 3.2; DNZ.sel = -1; k.hover = 0; dnzSevinc(o.x + k.tx, o.y + k.ty, dnzKabukPal[i], 16); dnzSes((i + 1) / 3); if (typeof AU !== 'undefined' && AU.sfx) AU.sfx('kabukYer', i);
  if (typeof parts !== 'undefined') {
    for (let b = 0; b < 20; b++) {
      const ang = -Math.PI * 0.5 + (Math.random() - 0.5) * 1.8;
      const spd = 35 + Math.random() * 80;
      parts.push({
        x: o.x + k.tx + (Math.random() - 0.5) * 24,
        y: o.y + k.ty - 6,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        life: 1.1 + Math.random() * 0.8,
        max: 1.9,
        col: Math.random() < 0.65 ? dnzKabukPal[i] : (Math.random() < 0.5 ? '#ffffff' : '#caffec'),
        size: 3.2 + Math.random() * 3.2
      });
    }
  }
  if (o.dnz.kol.every(q => q.done)) dnzOctBitir(o);
}
const DNZ_ARM_N = 22, dnzArmPts = new Float32Array(DNZ_ARM_N * 4);
const dnzOctFrontEndX=[-157,27,155],dnzOctFrontBaseX=[-50,0,50];
const dnzOctBackX = [-143, -79, 19, 93, 144], dnzOctBackY = [62, 104, 103, 96, 58], dnzOctBaseX = [-53, -29, -2, 28, 53];
function dnzArm(c, sx, sy, ex, ey, i, tm, u, renk, back, ballet) {
  const bAmp = ballet ? Math.min(1.0, ballet) : 0;
  const side = sx < 0 ? -1 : sx > 0 ? 1 : i % 2 ? 1 : -1, phase = tm * (1.42 + i * .047 + bAmp * 0.95) - i * .89;
  const curl = (1 - u) * (back ? 26 : 13) + Math.sin(phase * 1.4 + i) * bAmp * 14, follow = Math.sin(phase - 1.3) * (7 + bAmp * 11);
  const c1x = sx + side * (33 + curl), c1y = sy + 40 + Math.cos(phase) * (9 + bAmp * 12);
  const c2x = ex - side * (28 + curl * .6) + follow, c2y = ey + 32 + Math.sin(phase - .7) * (13 + bAmp * 15);
  const adx = ex - sx, ady = ey - sy, length = Math.max(1, Math.hypot(adx, ady)), nx = -ady / length, ny = adx / length, arr = dnzArmPts;
  // Travelling muscular waves: shoulders lead, tips answer later. Shell endpoints remain exact while dragged.
  for (let j = 0; j < DNZ_ARM_N; j++) {
    const t = j / (DNZ_ARM_N - 1), a = 1 - t, envelope = Math.sin(t * Math.PI), wave = Math.sin(phase - t * Math.PI * (3.2 + bAmp * 1.6)) * (back ? 10.5 : 7.5 + bAmp * 9) * envelope;
    let xx = a*a*a*sx + 3*a*a*t*c1x + 3*a*t*t*c2x + t*t*t*ex + nx * wave, yy = a*a*a*sy + 3*a*a*t*c1y + 3*a*t*t*c2y + t*t*t*ey + ny * wave;
    if (back && t > .65) { const v = (t - .65) / .35, turn = v * Math.PI * (1.5 - u * .9 + bAmp * 0.75), cr = (1 - u) * 16 + 3 + bAmp * 6; xx += nx * Math.sin(turn) * cr; yy += ny * Math.sin(turn) * cr - Math.sin(v * Math.PI) * cr * .58; }
    arr[j*4] = xx; arr[j*4+1] = yy;
  }
  // Normals follow the actual bent centreline; suckers rotate with the skin rather than staying screen-horizontal.
  for (let j = 0; j < DNZ_ARM_N; j++) { const lo = Math.max(0,j-1)*4, hi = Math.min(DNZ_ARM_N-1,j+1)*4, dx = arr[hi]-arr[lo], dy = arr[hi+1]-arr[lo+1], ln = Math.hypot(dx,dy)||1, t = j/(DNZ_ARM_N-1), w = 13.7*(1-t*.76)+Math.sin(t*Math.PI)*1.1;
    arr[j*4+2] = -dy/ln*w; arr[j*4+3] = dx/ln*w; }
  const last = (DNZ_ARM_N-1)*4;
  c.beginPath();c.moveTo(arr[0]+arr[2],arr[1]+arr[3]);for(let j=1;j<DNZ_ARM_N;j++){const a=j*4,b=(j-1)*4,x=arr[a]+arr[a+2],y=arr[a+1]+arr[a+3],px=arr[b]+arr[b+2],py=arr[b+1]+arr[b+3];c.quadraticCurveTo(px,py,(px+x)*.5,(py+y)*.5);}c.quadraticCurveTo(arr[last]+arr[last+2],arr[last+1]+arr[last+3],arr[last]+arr[last+3],arr[last+1]-arr[last+2]);c.quadraticCurveTo(arr[last]-arr[last+2],arr[last+1]-arr[last+3],(arr[last]-arr[last+2]+arr[last-4]-arr[last-2])*.5,(arr[last+1]-arr[last+3]+arr[last-3]-arr[last-1])*.5);for(let j=DNZ_ARM_N-2;j>=0;j--){const a=j*4,b=Math.max(0,j-1)*4,x=arr[a]-arr[a+2],y=arr[a+1]-arr[a+3],xx=arr[b]-arr[b+2],yy=arr[b+1]-arr[b+3];c.quadraticCurveTo(x,y,(x+xx)*.5,(y+yy)*.5);}c.quadraticCurveTo(arr[0]-arr[2],arr[1]-arr[3],arr[0]+arr[2],arr[1]+arr[3]);c.closePath();c.fillStyle=renk;c.fill();c.strokeStyle='rgba(94,61,137,.3)';c.lineWidth=.9;c.stroke();
  c.lineCap='round';c.strokeStyle='rgba(245,229,255,.38)';c.lineWidth=4.5;c.beginPath();for(let j=0;j<DNZ_ARM_N-1;j++){const a=j*4,x=arr[a]+arr[a+2]*.43,y=arr[a+1]+arr[a+3]*.43;if(j)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();
  c.strokeStyle='rgba(105,64,151,.16)';c.lineWidth=3.3;c.beginPath();for(let j=0;j<DNZ_ARM_N-1;j++){const a=j*4,x=arr[a]-arr[a+2]*.66,y=arr[a+1]-arr[a+3]*.66;if(j)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();
  for(let j=3;j<DNZ_ARM_N-1;j+=3){const a=j*4,rr=3.4*(1-j/(DNZ_ARM_N*1.7)),xx=arr[a]-arr[a+2]*.41,yy=arr[a+1]-arr[a+3]*.41,ang=Math.atan2(arr[a+3],arr[a+2]);dnzOval(c,xx,yy,rr*1.28,rr*.82,'rgba(255,219,240,.81)',ang);dnzOval(c,xx+.15,yy+.25,rr*.6,rr*.31,'rgba(145,88,139,.39)',ang);}
}
let dnzOctHead = null;
function dnzOctSprite() {
  if (dnzOctHead) return dnzOctHead;
  const c = document.createElement('canvas'); c.width = 480; c.height = 460; const q = c.getContext('2d'); q.scale(2, 2); q.translate(120, 145); const rnd = rng(986);
  // Broad soft mantle narrowing into the muscular arm crown, with no flat bottom edge.
  q.beginPath(); q.moveTo(-56, 25); q.bezierCurveTo(-72, 8, -83, -28, -76, -66); q.bezierCurveTo(-69, -114, -28, -128, 11, -121); q.bezierCurveTo(58, -120, 87, -87, 77, -42); q.bezierCurveTo(74, -14, 66, 9, 50, 25); q.quadraticCurveTo(0, 44, -56, 25); q.closePath();
  const gr = q.createRadialGradient(-29, -91, 5, 1, -38, 115); gr.addColorStop(0, '#efdafa'); gr.addColorStop(.32, '#c3a3e1'); gr.addColorStop(.58, '#b08cce'); gr.addColorStop(.82, '#9271ba'); gr.addColorStop(1, '#72529d'); q.fillStyle = gr; q.fill(); q.save(); q.clip();
  for (let i = 0; i < 22; i++) { const xx = -80 + rnd() * 155, yy = -119 + rnd() * 147, rr = 6 + rnd() * 14; dnzOval(q, xx, yy, rr, rr * .72, i % 3 === 0 ? 'rgba(140,93,169,.067)' : 'rgba(237,207,249,.085)', rnd()); }
  for (let i = 0; i < 430; i++) { const xx = -83 + rnd() * 165, yy = -130 + rnd() * 174; dnzOval(q, xx, yy, .25 + rnd() * .8, .3 + rnd() * .65, 'rgba(246,220,253,' + (.035 + rnd() * .085) + ')'); }
  // Bloomed forehead sheen and a quiet translucent warm cheek light are baked once.
  const sheen = q.createRadialGradient(-33, -90, 1, -30, -85, 38); sheen.addColorStop(0, 'rgba(255,246,255,.43)'); sheen.addColorStop(.65, 'rgba(254,237,255,.1)'); sheen.addColorStop(1, 'rgba(254,237,255,0)'); q.fillStyle = sheen; q.fillRect(-75, -127, 92, 84);
  const sh = q.createLinearGradient(0, -35, 0, 40); sh.addColorStop(0, 'rgba(88,44,127,0)'); sh.addColorStop(1, 'rgba(88,44,127,.28)'); q.fillStyle = sh; q.fillRect(-90, -36, 180, 90);
  q.restore(); q.strokeStyle = 'rgba(211,184,240,.38)'; q.lineWidth = 1.4; q.beginPath(); q.moveTo(-71, -33); q.bezierCurveTo(-79, -91, -50, -120, -20, -119); q.stroke();
  dnzOval(q, -39, -7, 12, 5.5, 'rgba(237,157,202,.38)', -.12); dnzOval(q, 41, -7, 12, 5.5, 'rgba(237,157,202,.38)', .12);
  dnzOval(q, -25, -26, 12, 11, 'rgba(173,139,199,.24)'); dnzOval(q, 25, -26, 12, 11, 'rgba(173,139,199,.24)');
  dnzOctHead = c; return c;
}
TUR.kaydet('ahtapot', {
  kur(o) { o.r = 230; o.ry = 80; o.dnz = { t: 0, sure: 0, bas: false, sev: 0, kut: 0, relax: 0, look: 0, notice: 0, balletT: 0, kol: [], px: P.x, py: P.y }; for (let i = 0; i < 3; i++) { const xx = [-83, 18, 98][i], yy = [-2, 9, -8][i]; o.dnz.kol.push({ x: xx, y: yy, x0: xx, y0: yy, tx: [-178, 0, 178][i], ty: 108 + (i === 1 ? 17 : 0), done: false, u: 0, vur: 0, doneT: 0, hover: 0, ox: xx, oy: yy }); } dnzOctSprite(); glow('#caffec'); for (let i = 0; i < 3; i++) dnzKabukSprite(i); DNZ.oct = o; },
  dokun: dnzOctAktif,
  guncelle(o, dt) { const k = o.dnz; k.t += dt; if (o.done) for (let i = 0; i < DNZ.ati.length; i++) { const a = DNZ.ati[i]; if (a.done) continue; a.dnz.autoT = (a.dnz.autoT == null ? 1.6 + i * 0.9 : a.dnz.autoT) - dt; if (a.dnz.autoT <= 0) dnzAtBul(a); }   // atlanmış denizatları ışıkla toplu uyanır: vatoz/İnci şartı kilitlemez
    k.balletT = Math.max(0, (k.balletT || 0) - dt); let completed = 0; for(const arm of k.kol)if(arm.done)completed++; k.relax += (completed/3-k.relax)*(1-Math.exp(-dt*2.1)); k.look += (clamp((P.x-o.x)/260,-1,1)-k.look)*(1-Math.exp(-dt*3)); k.notice += ((Math.abs(P.x-o.x)<350?1:0)-k.notice)*(1-Math.exp(-dt*2)); k.sev = Math.max(0, k.sev - dt);
    if (k.balletT > 0 && Math.random() < 0.35 && typeof parts !== 'undefined') {
      const armIdx = Math.floor(Math.random() * 3);
      const armPt = k.kol[armIdx];
      parts.push({
        x: o.x + armPt.x + (Math.random() - 0.5) * 22,
        y: o.y + armPt.y - 12,
        vx: (Math.random() - 0.5) * 30,
        vy: -35 - Math.random() * 40,
        life: 1.3 + Math.random() * 0.7,
        max: 2.0,
        col: dnzKabukPal[armIdx],
        size: 3.0 + Math.random() * 2.6
      });
    }
    if (o.done) { k.kut += dt; for (const a of k.kol) { a.doneT += dt; a.u = Math.min(1, a.u + dt * 1.15); a.vur = Math.max(0, a.vur - dt * 1.5); } return; }
    if (DURUM !== 'oyun') return;
    if (!k.bas && Math.hypot(P.x - o.x, P.y - 30 - (o.y - 75)) < 235) dnzOctAktif(o);
    if (DNZ.aktif !== o) return;
    k.sure += dt; P.vx = P.vy = 0; P.kilit = Math.max(P.kilit || 0, .06);
    for (let i = 0; i < 3; i++) { const a = k.kol[i]; if (a.done) a.doneT += dt; a.u = Math.min(1, a.u + (a.done ? dt * 1.15 : 0)); a.vur = Math.max(0, a.vur - dt * 1.5); if (!a.done && DNZ.kol !== i) { const help = k.sure > 15 + i * 4; const destX = help ? a.tx : a.x0, destY = help ? a.ty : a.y0; a.x += (destX - a.x) * (1 - Math.exp(-dt * (help ? 1.1 : 5))); a.y += (destY - a.y) * (1 - Math.exp(-dt * (help ? 1.1 : 5))); if (help && Math.hypot(a.tx - a.x, a.ty - a.y) < 10) dnzOctBirak(o, i); } }
    if (k.sure > 35) { for (let i = 0; i < 3; i++) dnzOctBirak(o, i); }
  },
  ciz(o, tm) {
    const k = o.dnz; g.save(); g.translate(o.x, o.y); const happy = o.done || k.sev > .4;
    // Ahtapot resifini çevreleyen büyüleyici, rüya gibi ışık haleleri
    const octHaloPulse = 0.85 + 0.15 * Math.sin(tm * 1.1);
    dglow('#9962cf', 0, -45, 270, 0.15 * octHaloPulse);
    dglow('#42e4cc', 0, -25, 210, 0.13 * octHaloPulse);
    dglow('#ffdaf0', 0, -65, 150, 0.11 * octHaloPulse);
    for (let hr = 0; hr < 3; hr++) {
      const hProg = ((tm * 0.2 + hr * 0.333) % 1);
      const hrR = 95 + hProg * 180;
      const hrAlpha = Math.sin(hProg * Math.PI) * 0.2;
      g.save();
      g.globalAlpha = hrAlpha;
      g.strokeStyle = hr % 2 ? '#b88fee' : '#69f2dc';
      g.lineWidth = 2.4 * (1 - hProg * 0.55);
      g.beginPath();
      g.ellipse(0, -45, hrR * 1.15, hrR * 0.72, 0, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }
    // Ahtapot resifinin iki yanında süzülen su bitkileri
    for (let p = 0; p < 8; p++) {
      const side = p < 4 ? -1 : 1;
      const pIdx = p % 4;
      const px0 = side * (145 + pIdx * 28);
      const pyFloor = 120;
      const pH = 185 + pIdx * 35;
      const pSway = Math.sin(tm * 1.15 + pIdx * 0.8 + side) * (26 + pIdx * 6);
      const pMid = pSway * 0.44;
      const pTipX = px0 + pSway;
      const pTipY = pyFloor - pH;
      g.save();
      g.lineWidth = 4.2 - pIdx * 0.6;
      g.lineCap = 'round';
      g.strokeStyle = pIdx % 2 ? 'rgba(68, 224, 204, 0.52)' : 'rgba(168, 114, 216, 0.5)';
      g.beginPath();
      g.moveTo(px0, pyFloor);
      g.bezierCurveTo(px0 + side * 18, pyFloor - pH * 0.35, px0 + pMid, pyFloor - pH * 0.7, pTipX, pTipY);
      g.stroke();
      g.strokeStyle = 'rgba(235, 255, 248, 0.7)';
      g.lineWidth = 1.3;
      g.stroke();
      const bPulse = 0.8 + 0.2 * Math.sin(tm * 2.4 + p);
      const bCol = pIdx % 2 ? '#6af5e3' : '#ffc4ee';
      dglow(bCol, pTipX, pTipY, 20, 0.3 * bPulse);
      dnzOval(g, pTipX, pTipY, 3.4, 4.4, '#ffffff', pSway * 0.02);
      dnzOval(g, pTipX, pTipY, 2.2, 3.0, bCol);
      g.restore();
    }
    // Back five arms: clearly connected beneath mantle, with curled tips.
    for (let i = 0; i < 5; i++) { const r=k.relax, ph=tm*(1.2+i*.073)+i*1.8, xx=lerp(dnzOctBackX[i]*.72,dnzOctBackX[i],r)+Math.sin(ph)*13+k.look*(i===0?12:4), yy=lerp(dnzOctBackY[i]*.62,dnzOctBackY[i]*.82,r)+Math.cos(ph-.7)*15, bx=dnzOctBaseX[i]; dnzArm(g,bx,-25,xx,yy,i+4,tm,r,i%2?'#a287c6':'#b292d1',true); }
    // Three matching sand hollows: shape, rim and interior all readable.
    for (let i = 0; i < 3; i++) { const a = k.kol[i]; dglow(dnzKabukPal[i], a.tx, a.ty - 5, a.done ? 55 : 43 + a.hover * 15, a.done ? .22 : .09 + a.hover * .17); dnzOval(g, a.tx, a.ty + 5, 33, 12, 'rgba(92,145,143,.19)'); g.save(); g.globalAlpha = a.done ? 1 : .62 + a.hover * .24; dnzKabuk(g, a.tx, a.ty - 5, (a.done ? 26 : 23) * (1 + a.hover * .13), i, 0); g.restore(); if (a.done) dnzIsikHalka(g, a.tx, a.ty - 5, a.doneT, dnzKabukPal[i], 52); if (!a.done && DNZ.aktif === o) { g.strokeStyle = dnzKabukPal[i]; g.lineWidth = 2; g.beginPath(); g.ellipse(a.tx, a.ty, 37 + Math.sin(tm * 2) * 2, 20, 0, 0, Math.PI * 2); g.stroke(); } }
    for (let i = 0; i < 3; i++) { const a = k.kol[i], u = smooth(a.u), ex = a.done ? lerp(a.x, dnzOctFrontEndX[i] + Math.sin(tm * (1.8+i*.12) + i) * 20, u) : a.x, ey = a.done ? lerp(a.y, 39 + Math.sin(tm * (1.65+i*.07) + i) * 25, u) : a.y; dnzArm(g, dnzOctFrontBaseX[i], -38, ex, ey, i, tm, u, '#bea0e0'); if (!a.done && DNZ.kol !== i) { dglow(dnzKabukPal[i], a.x, a.y - 9, 38, .16 + .05 * Math.sin(tm * 2 + i)); dnzKabuk(g, a.x, a.y - 9, 27 * (1 + .04 * Math.sin(tm * 2 + i)), i, Math.sin(tm * 1.1 + i) * .07); } }
    g.save(); const bounce = happy ? Math.sin(tm * 3) * 3 : Math.sin(tm * 1.1) * 2; g.translate(k.look*3, -41 + bounce - k.notice*3); g.rotate(k.look*.025+Math.sin(tm*.93)*.017); const breath = Math.sin(tm * 1.15); g.scale(1 + breath * .012, 1 - breath * .009); g.drawImage(dnzOctSprite(), -120, -145, 240, 230); const blink = Math.sin(tm * .7) > .994 ? 1 : 0; const giggle=happy&&Math.sin(tm*2.5)>.25;const eyeX=DNZ.kol>=0?clamp(k.kol[DNZ.kol].x/130,-1,1):k.look,eyeY=DNZ.kol>=0?.6:clamp((P.y-30-o.y+67)/150,-.5,.5);dnzGoz(g,-26,-26,10.5,blink,giggle,eyeX,eyeY);dnzGoz(g,26,-26,10.5,blink,giggle,eyeX,eyeY);g.strokeStyle='rgba(110,75,138,.6)';g.lineWidth=1.7;g.beginPath();g.moveTo(-34,-43-k.notice*2);g.quadraticCurveTo(-26,-47-k.notice*3,-17,-43);g.moveTo(17,-43);g.quadraticCurveTo(26,-47-k.notice*3,34,-43-k.notice*2);g.stroke(); g.strokeStyle = '#725384'; g.lineWidth = 2.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(-7, -2); g.quadraticCurveTo(0, happy ? 11 : 4, 7, -2); g.stroke(); g.restore();
    g.restore();
    // Coral arch rises smoothly after all three arms are free; no abrupt disappearance.
    const ax = typeof BOLUM !== 'undefined' && BOLUM.deniz ? BOLUM.deniz.ahtapotX : o.x + 380, up = o.done ? smooth(clamp(k.kut / 2.5, 0, 1)) : 0;
    g.save(); g.translate(ax, o.y - up * 230); g.strokeStyle = '#bc85af'; g.lineWidth = 23; g.lineCap = 'round'; g.beginPath(); g.moveTo(-40, 120); g.bezierCurveTo(-70, 6, -75, -132, 0, -147); g.bezierCurveTo(75, -132, 70, 6, 40, 120); g.stroke(); g.strokeStyle = '#f5b9c4'; g.lineWidth = 13; g.stroke(); for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI; dnzOval(g, Math.cos(a) * 56, Math.sin(a) * 145, 10, 12, '#e9b6d1', a); } g.restore(); if (o.done && k.kut < 5) { for (let j = 0; j < 10; j++) { const age=clamp((k.kut-j*.11)/3.5,0,1), side=j%2?-1:1, x=o.x+side*(98+(j%5)*12)+Math.sin(age*4+j)*6, y=o.y+72-age*125+(j%3)*10, fade=Math.sin(age*Math.PI)*Math.max(0,1-k.kut/5); if(fade>0){g.save();g.globalAlpha=fade*.7;dnzOval(g,x,y,1.9+(j%3)*.5,2.3+(j%3)*.5,j%3?'#d9eadf':'#eedebd');g.restore();} } for (let j = 0; j < 7; j++) { const u = (k.kut / 2.5 + j / 7) % 1, x = lerp(o.x + 40, ax, u), y = lerp(o.y - 35, o.y - 160, u) - Math.sin(u * Math.PI) * 44 + Math.sin(u * 5 + j) * 8, fade = Math.sin(u * Math.PI) * Math.max(0, 1 - k.kut / 5); dglow('#caffec', x, y, 15, fade * .45); dnzOval(g, x, y, 2.2, 2.8, 'rgba(236,255,218,' + (fade * .85) + ')'); } }
  },
  cizOn(o, tm) { const k = o.dnz; if (DNZ.kol >= 0 && DNZ.aktif === o) { const a = k.kol[DNZ.kol]; dnzKabuk(g, o.x + a.x, o.y + a.y - 9, 27, DNZ.kol, -.1); } if (DNZ.aktif !== o || DNZ.ptr >= 0 || k.sure < 2.5) return; let i = k.kol.findIndex(a => !a.done); if (i < 0) return; const a = k.kol[i], u = smooth(clamp((tm % 3.8 - .65) / 2.25, 0, 1)); const hx = o.x + lerp(a.x0, a.tx, u), hy = o.y + lerp(a.y0, a.ty, u) - 8; if (typeof sklElSprite === 'function') { g.globalAlpha = .82; g.drawImage(sklElSprite(), hx - 20, hy - 3, 58, 73); g.globalAlpha = 1; } else { g.fillStyle = '#fff7e8'; g.strokeStyle = '#9076bd'; g.lineWidth = 2; g.beginPath(); g.roundRect(hx - 7, hy, 14, 34, 6); g.fill(); g.stroke(); dnzOval(g, hx + 8, hy + 30, 16, 12, '#fff7e8'); } },
});

// Shared capture input: shell dragging never also steers Feza, even when the drag leaves the canvas.
function dnzPointerWorld(e) { const r = cv.getBoundingClientRect(); return { x: cam.x + (e.clientX - r.left) * DPR / S, y: cam.y + (e.clientY - r.top) * DPR / S }; }
function dnzClaim(e) { e.preventDefault(); e.stopImmediatePropagation(); }
addEventListener('pointerdown', e => {
  if (DURUM !== 'oyun' || e.pointerType === 'mouse' && e.button !== 0 || e.target !== cv) return;
  const p = dnzPointerWorld(e), o = DNZ.aktif;
  if (o && !o.done && DNZ.ptr < 0) { if (DNZ.sel >= 0) { const a = o.dnz.kol[DNZ.sel]; if (!a.done && Math.hypot(p.x - o.x - a.tx, p.y - o.y - a.ty + 9) < 94) { dnzOctBirak(o, DNZ.sel); dnzClaim(e); return; } } let best = -1, dd = 66; for (let i = 0; i < 3; i++) { const a = o.dnz.kol[i]; if (a.done) continue; const d = Math.hypot(p.x - o.x - a.x, p.y - o.y - a.y + 9); if (d < dd) { best = i; dd = d; } } if (best >= 0) { DNZ.ptr = e.pointerId; DNZ.kol = best; DNZ.sel = best; o.dnz.kol[best].hover = .55; o.dnz.kol[best].ox = p.x; o.dnz.kol[best].oy = p.y; o.dnz.sure = Math.min(o.dnz.sure, 14); dnzClaim(e); try { cv.setPointerCapture(e.pointerId); } catch (_) {} return; } }
  for(const a of DNZ.ati)if(Math.hypot(p.x-a.dnz.hx,p.y-a.dnz.hy)<100&&Math.abs(a.x-P.x)<500){if(!a.done){dnzAtBul(a);dnzClaim(e);return;}if(dnzAtOyna(a)){dnzClaim(e);return;}}
}, true);
addEventListener('pointermove', e => { if (e.pointerId !== DNZ.ptr || !DNZ.aktif || DNZ.kol < 0) return; dnzClaim(e); const o = DNZ.aktif, a = o.dnz.kol[DNZ.kol], p = dnzPointerWorld(e), xx = clamp(p.x - o.x, -250, 250), yy = clamp(p.y - o.y - 26, -120, 170), dist = Math.hypot(xx - a.tx, yy - a.ty), magnet = clamp(1 - dist / 130, 0, .88); a.hover = clamp(1 - dist / 150, 0, 1); a.x = lerp(xx, a.tx, magnet); a.y = lerp(yy, a.ty, magnet); if (magnet > .55 && Math.random() < .22 && typeof parts !== 'undefined') parts.push({ x: o.x + a.tx + (Math.random() - .5) * 26, y: o.y + a.ty + (Math.random() - .5) * 16, vx: (Math.random() - .5) * 10, vy: -12 - Math.random() * 15, life: .45, max: .45, col: dnzKabukPal[DNZ.kol], size: 2.2 }); }, true);
function dnzParmakSon(e) { if (e.pointerId !== DNZ.ptr) return; dnzClaim(e); const o = DNZ.aktif, i = DNZ.kol; DNZ.ptr = -1; DNZ.kol = -1; if (!o || i < 0) return; const a = o.dnz.kol[i]; if (e.type !== 'pointercancel' && Math.hypot(a.x - a.tx, a.y - a.ty) < 94) dnzOctBirak(o, i); }
addEventListener('pointerup', dnzParmakSon, true); addEventListener('pointercancel', dnzParmakSon, true);
addEventListener('blur', () => { DNZ.ptr = -1; DNZ.kol = -1; });
addEventListener('keydown', e => { if (!DNZ.aktif || !['Space', 'Enter', 'ArrowUp'].includes(e.code) || e.repeat) return; dnzClaim(e); const o = DNZ.aktif, i = o.dnz.kol.findIndex(a => !a.done); if (i >= 0) dnzOctBirak(o, i); }, true);

const dnzMantaArt = { govde: null, kanat: null };
function dnzMantaSprite(kanat) {
  const key = kanat ? 'kanat' : 'govde'; if (dnzMantaArt[key]) return dnzMantaArt[key];
  const c = document.createElement('canvas'); c.width = 420; c.height = 240; const q = c.getContext('2d'); q.scale(2, 2); q.translate(118, 77);
  const rnd = rng(kanat ? 852 : 194);
  if (kanat) {
    // Swept, fleshy pectoral fin: its round tip curls back, it never folds into a triangular flag.
    q.beginPath(); q.moveTo(48, -10); q.bezierCurveTo(30, -28, -9, -63, -71, -69); q.bezierCurveTo(-105, -74, -113, -62, -100, -54); q.bezierCurveTo(-85, -44, -82, -28, -56, -15); q.bezierCurveTo(-29, -2, 10, 13, 48, -10); q.closePath();
    const gr = q.createLinearGradient(-70, -72, 0, 13); gr.addColorStop(0, '#9fd2dc'); gr.addColorStop(.3, '#c1e4e4'); gr.addColorStop(.6, '#79acbc'); gr.addColorStop(1, '#456f91'); q.fillStyle = gr; q.fill();
    q.save(); q.clip();
    // Bone-free fin fibres: feathered shadows follow broad elastic fan muscles.
    for (let i = 0; i < 9; i++) { q.strokeStyle = 'rgba(49,99,131,' + (.075 + i % 3 * .013) + ')'; q.lineWidth = 1 + i % 2 * 1.4; q.beginPath(); q.moveTo(31 - i * 3, -8); q.bezierCurveTo(6 - i * 6, -18 - i * 1.8, -37 - i * 5, -35 - i * 2.3, -87 + i * 13, -64 + i * 4); q.stroke(); }
    for (let i = 0; i < 150; i++) { const xx = -105 + rnd() * 156, yy = -72 + rnd() * 82; dnzOval(q, xx, yy, .5 + rnd() * 1.5, .4 + rnd(), 'rgba(224,250,237,' + (.045 + rnd() * .13) + ')'); }
    q.restore(); q.strokeStyle = 'rgba(221,246,235,.63)'; q.lineWidth = 1.5; q.beginPath(); q.moveTo(44, -14); q.bezierCurveTo(11, -46, -65, -80, -99, -63); q.stroke();
    q.strokeStyle = 'rgba(52,91,124,.35)'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(-99, -53); q.bezierCurveTo(-74, -34, -53, -2, 20, -3); q.stroke();
    // Nacre freckles form a natural constellation along the fin's shoulder.
    for (let i = 0; i < 12; i++) { const u = i / 11; dnzOval(q, 14 - u * 96, -22 - Math.sin(u * Math.PI * .8) * 24, 1.2 + (i % 4) * .3, 1.1, 'rgba(234,251,237,.42)', -.3); }
  } else {
    q.beginPath(); q.moveTo(-66, 1); q.bezierCurveTo(-45, -28, -1, -37, 42, -22); q.bezierCurveTo(58, -18, 73, -4, 70, 3); q.bezierCurveTo(65, 17, 45, 23, 19, 22); q.bezierCurveTo(-18, 29, -48, 18, -66, 1); q.closePath();
    const gr = q.createRadialGradient(2, -23, 2, 0, -3, 78); gr.addColorStop(0, '#e1f4e9'); gr.addColorStop(.25, '#a8d5dc'); gr.addColorStop(.55, '#80b4c5'); gr.addColorStop(1, '#507997'); q.fillStyle = gr; q.fill();
    q.save(); q.clip();
    for (let i = 0; i < 230; i++) { const xx = -65 + rnd() * 135, yy = -29 + rnd() * 60; dnzOval(q, xx, yy, .4 + rnd(), .35 + rnd() * .55, 'rgba(238,254,237,' + (.05 + rnd() * .1) + ')'); }
    const sh = q.createLinearGradient(0, -9, 0, 29); sh.addColorStop(0, 'rgba(25,72,107,0)'); sh.addColorStop(1, 'rgba(25,72,107,.32)'); q.fillStyle = sh; q.fillRect(-80, -8, 170, 50);
    q.strokeStyle = 'rgba(62,110,134,.2)'; q.lineWidth = 1.1; for (let i = 0; i < 3; i++) { q.beginPath(); q.ellipse(37 - i * 7, 12, 4, 1.8, -.3, .4, 2.8); q.stroke(); }
    q.restore();
    q.strokeStyle = 'rgba(211,245,235,.5)'; q.lineWidth = 1.3; q.beginPath(); q.moveTo(-46, -10); q.bezierCurveTo(-18, -34, 20, -29, 42, -17); q.stroke();
    // Subtle raised eyelids and cephalic fins keep the face embedded in the mantle.
    dnzOval(q, 32, -11, 10, 7, '#aedbe0', .1); dnzOval(q, 55, -5, 7, 5, '#a9d6da', .2);
    q.fillStyle = '#97c6cd'; q.beginPath(); q.moveTo(59, 8); q.quadraticCurveTo(79, 17, 78, 6); q.quadraticCurveTo(72, 2, 67, 1); q.closePath(); q.fill();
    q.strokeStyle = 'rgba(226,249,236,.5)'; q.lineWidth = 1; q.beginPath(); q.moveTo(65, 7); q.quadraticCurveTo(76, 13, 75, 8); q.stroke();
  }
  dnzMantaArt[key] = c; return c;
}
function dnzMantaWing(c, sprite, phase) {
  const n=10, width=210/n;
  // Affine skin strips meet at the same displaced edge: the muscle wave bends the whole membrane without seams.
  for(let i=0;i<n;i++){const u=i/n,v=(i+1)/n,x=-118+i*width,y0=Math.sin(phase-u*1.8)*Math.pow(1-u,1.55)*13,y1=Math.sin(phase-v*1.8)*Math.pow(1-v,1.55)*13;
    c.save();c.translate(x,y0);c.transform(1,(y1-y0)/width,0,1,0,0);c.drawImage(sprite,i*42,0,Math.min(43,420-i*42),240,0,-77,width+.5,120);c.restore();}
}
function dnzVatoz(c, x, y, s, tm, tilt, sev) {
  c.save(); c.translate(x, y); c.rotate((tilt || 0) + Math.sin(tm * .74) * .012); c.scale(s, s);
  if (sev) {
    dglow('#caffec', 0, 0, 110, .26);
    dglow('#fff6d8', 35, -5, 65, .32);
  }
  const flapSpd = sev ? 3.4 : 2.0;
  const flutter = Math.sin(tm * flapSpd) * (sev ? 1.25 : 1.0), curl = Math.sin(tm * (flapSpd * 0.7) + .8) * (sev ? 1.3 : 1.0);
  // Living ribbon tail has its own slower wave, with a tapering translucent underside.
  c.lineCap = 'round'; c.strokeStyle = '#4d7d99'; c.lineWidth = 7; c.beginPath(); c.moveTo(-48, 3); c.bezierCurveTo(-85, 10 + flutter * 6, -113, -15 + curl * 12, -144, -2 + flutter * 10); c.bezierCurveTo(-178, 16 + curl * 9, -196, 8 - curl * 10, -187, -9); c.stroke(); c.strokeStyle = '#a4d4d5'; c.lineWidth = 3.4; c.stroke();
  c.strokeStyle = '#d2ece3'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(-149, -2 + flutter * 10); c.bezierCurveTo(-174, 10 + curl * 9, -195, 7 - curl * 10, -187, -9); c.stroke();
  const wing = dnzMantaSprite(true);
  // Rear fin is more distant and partially hidden; front fin flexes after it, like a swimming wave.
  c.save(); c.translate(-9, -1); c.rotate(-.015 + flutter * .035); c.scale(1, .72 + flutter * .12); dnzMantaWing(c, wing, tm * flapSpd); c.restore();
  c.save(); c.translate(-4, 2); c.scale(1.02, -(.95 + Math.sin(tm * flapSpd - .6) * .14)); c.rotate(.02 - flutter * .04); dnzMantaWing(c, wing, tm * flapSpd - .72); c.restore();
  c.drawImage(dnzMantaSprite(false), -118, -77, 210, 120);
  const blink = Math.sin(tm * .8) > .994 ? 1 : 0;
  dnzGoz(c, 34, -10, 4.9, blink, !!sev); dnzGoz(c, 55, -4, 3.6, blink, !!sev);
  dnzOval(c, 42, 2, sev ? 7.5 : 5.5, sev ? 3.2 : 2.2, sev ? 'rgba(255,160,185,.6)' : 'rgba(232,160,172,.43)', .15);
  c.strokeStyle = '#4c6d83'; c.lineWidth = 1.35; c.beginPath(); c.moveTo(40, 10); c.quadraticCurveTo(48, sev ? 17 : 14, 55, 10); c.stroke();
  c.restore();
}
function dnzRideIcerik(o) {
  o.kemer = []; o.odul = []; const L = o.K.x1 - o.K.x0;
  for (let i = 0; i < 5; i++) { const u = .14 + i * .17, y = clamp(o.ky - 35 + Math.sin(u * Math.PI * 3) * 65, o.K.yUst + 110, o.K.yAlt - 50); o.kemer.push({ x: o.K.x0 + L * u, y, gecti: false, t: -1, renk: dnzKabukPal[i % 3] }); }
  for (let i = 0; i < 12; i++) { const u = .09 + i * .071, y = clamp(o.ky - 35 + Math.sin(u * Math.PI * 3) * 65 + Math.sin(i * 1.3) * 25, o.K.yUst + 110, o.K.yAlt - 50); o.odul.push({ x: o.K.x0 + L * u, y, al: false, t: -1, r: 11 + i % 3 * 2, ph: i * 1.7 }); }
}
function dnzRideOdul(o, dt) {
  if (!o.kemer || o.faz !== 'yol') return;
  for (const k of o.kemer) {
    if (k.t >= 0) k.t += dt;
    if (!k.gecti && Math.abs(o.mx - k.x) < 95 && Math.abs(o.my - k.y) < 165) {
      k.gecti = true;
      k.t = 0;
      o.sevT = 2.4;
      o.boost = Math.min(1.8, (o.boost || 0) + 0.6);
      dnzSevinc(k.x, k.y, k.renk, 24);
      dnzSes(.45 + .14 * o.kemer.filter(a => a.gecti).length);
      OLAY.emit('vatozKemer', { o, k });
      if (typeof parts !== 'undefined') {
        for (let p = 0; p < 14; p++) {
          parts.push({
            x: k.x + (Math.random() - .5) * 40,
            y: k.y + (Math.random() - .5) * 110,
            vx: -80 - Math.random() * 90,
            vy: (Math.random() - .5) * 50,
            life: .85, max: .85,
            col: Math.random() < .5 ? k.renk : '#caffec',
            size: 2.8 + Math.random() * 2.2
          });
        }
      }
    }
  }
  for (const a of o.odul) {
    if (a.t >= 0) a.t += dt;
    if (!a.al && Math.hypot(o.mx + 38 - a.x, o.my - a.y) < 92) {
      a.al = true;
      a.t = 0;
      o.sevT = Math.max(o.sevT || 0, 1.1);
      o.boost = Math.min(1.8, (o.boost || 0) + 0.25);
      dnzSevinc(a.x, a.y, '#e5ffed', 7);
      dnzSes(.35);
    }
  }
}
function dnzRideIsikCiz(o, tm) {
  if (!o.kemer || o.faz === 'bekle' || o.faz === 'bitti') return;
  const minX = cam.x - 100, maxX = cam.x + W / S + 100;
  for (const k of o.kemer) {
    if (k.x < minX || k.x > maxX) continue;
    const a = k.gecti ? Math.max(0, 1 - k.t / 2.6) : .78;
    g.save(); g.globalAlpha = a; g.lineWidth = 7; g.strokeStyle = k.renk;
    g.beginPath(); g.ellipse(k.x, k.y, 46 + Math.sin(tm * 1.6) * 3, 98, .04 * Math.sin(tm), 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2.4; g.strokeStyle = '#e7ffe9'; g.stroke();
    for (let j = 0; j < 10; j++) {
      const t = j / 10 * Math.PI * 2;
      dnzOval(g, k.x + Math.cos(t) * 47, k.y + Math.sin(t) * 98, 4.2, 5.2, k.renk, t);
    }
    g.restore();
    if (k.gecti) {
      dnzIsikHalka(g, k.x, k.y, k.t, '#e8ffd2', 150);
      dnzIsikHalka(g, k.x, k.y, k.t * 1.35, k.renk, 185);
      const ku = clamp(k.t / 2.4, 0, 1);
      if (ku < 1) {
        const kr = 45 + smooth(ku) * 140;
        g.save(); g.globalAlpha = Math.sin(ku * Math.PI) * 0.65;
        g.strokeStyle = '#ffffff'; g.lineWidth = 2.5 * (1 - ku);
        g.beginPath(); g.ellipse(k.x, k.y, kr, kr * 1.5, 0, 0, Math.PI * 2); g.stroke();
        g.restore();
      }
    }
  }
  for (const a of o.odul) {
    if (a.x < minX || a.x > maxX || a.al && a.t > .7) continue;
    const u = a.al ? clamp(a.t / .7, 0, 1) : 0, r = a.r * (1 + u * 1.6), yy = a.y + Math.sin(tm * 1.4 + a.ph) * 7;
    g.save(); g.globalAlpha = (1 - u) * .8; g.strokeStyle = '#c4fff0'; g.lineWidth = 1.6; g.beginPath(); g.arc(a.x, yy, r, 0, Math.PI * 2); g.stroke(); dnzOval(g, a.x - r * .3, yy - r * .35, r * .2, r * .12, '#f7ffe4', -.5); dglow('#c6ffeb', a.x, yy, r * 1.8, .13 * (1 - u)); g.restore();
  }
}
function dnzRideBasla(o) {
  if (o.done || o.faz !== 'bekle' || DNZ.oct && !DNZ.oct.done || DNZ.ati.some(q => !q.done)) { o.dokundu = false; return; }
  o.faz = 'binis'; o.t = 0; o.rx = P.x; o.ry0 = P.y; o.mx = o.kx - 70; o.my = o.ky + 14; o.px0 = P.x; o.py0 = P.y; P.ucus = o; P.vx = P.vy = 0; P.kilit = 0; DNZ.aktif = null; dnzSoz('p_i_vatoz');
}
function dnzRideAdim(o, dt, input) {
  if (DURUM !== 'oyun' || dt <= 0) return;
  o.boost = Math.max(0, (o.boost || 0) - dt * 0.7);
  const speedMult = 1 + (o.boost || 0) * 0.38;
  o.t += dt * speedMult;
  o.total += dt;
  o.sevT = Math.max(0, (o.sevT || 0) - dt);
  if (o.faz === 'binis') {
    const u = smooth(clamp(o.t / 1.5, 0, 1));
    o.mx = lerp(o.kx - 70, o.K.x0, u);
    o.my = lerp(o.ky + 14, o.ky - 5, u);
    P.x = lerp(o.px0, o.mx + 7, u);
    P.y = lerp(o.py0, o.my - 10, u) - Math.sin(u * Math.PI) * 35;
    if (u >= 1) { o.faz = 'yol'; o.t = 0; }
  } else if (o.faz === 'yol') {
    const u = clamp(o.t / 18, 0, 1);
    const wave = Math.sin(o.total * 2.8) * 16 * (1 + (o.sevT > 0 ? 0.4 : 0));
    const targetY = input && input.eksenY ? o.my : input && input.basili && Number.isFinite(input.hedefY) ? input.hedefY + 15 : o.ky - 35 + Math.sin(u * Math.PI * 3) * 65 + wave;
    o.mx = lerp(o.K.x0, o.K.x1, smooth(u));
    o.my += (clamp(targetY, o.K.yUst + 110, o.K.yAlt - 50) - o.my) * (1 - Math.exp(-dt * 2.8));
    if (input && input.eksenY) o.my = clamp(o.my + input.eksenY * 150 * dt, o.K.yUst + 110, o.K.yAlt - 50);
    const flapPitch = Math.cos(o.total * 2.8) * 0.08 * (1 + (o.sevT > 0 ? 0.35 : 0));
    const targetRot = clamp((o.my - o.prevY) / Math.max(dt, .001) / 520, -.22, .22) + flapPitch;
    o.rot += (targetRot - o.rot) * (1 - Math.exp(-dt * 4.5));
    o.prevY = o.my;
    P.x = o.mx + 7;
    P.y = o.my - 10;
    if (u >= 1) { o.faz = 'inis'; o.t = 0; o.ix = P.x; o.iy = P.y; }
  } else if (o.faz === 'inis') {
    const u = smooth(clamp(o.t / 1.4, 0, 1));
    P.x = lerp(o.ix, o.K.x1 + 125, u);
    P.y = lerp(o.iy, o.ky, u);
    if (u >= 1) {
      o.done = true; o.faz = 'bitti'; P.ucus = null; P.vx = P.vy = 0; P.safeX = P.x; P.safeY = P.y;
      D.x = P.x - 80; D.y = P.y - 65; o.x = o.K.x1 + 85; OLAY.emit('vatozBitti', { o }); dnzSoz('p_i_vatoz_bitti');
    }
  }
  dnzRideOdul(o, dt);
  P.f = 1; P.ground = false;
  D.x = P.x - 95; D.y = P.y - 40; P.vx = P.vy = 0;
}
TUR.kaydet('vatozKapisi', {
  kur(o) { o.r = 110; o.ry = 35; o.kx = o.x; o.ky = o.y; o.faz = 'bekle'; o.t = 0; o.total = 0; o.rot = 0; o.boost = 0; o.pozOpt = { otur: 0, aci: 0, vy: 0, ruzgar: .12, sevinc: 0 }; o.mx = o.x - 70; o.my = o.y + 14; o.prevY = o.my; o.done = false; const k = typeof BOLUM !== 'undefined' && BOLUM.vatoz || {}; o.K = { x0: k.x0 || o.x, x1: k.x1 || o.x + 3600, yUst: k.yUst || 220, yAlt: k.yAlt || 800 }; dnzRideIcerik(o); o.sevT = 0; o.adim = (dt, input) => dnzRideAdim(o, dt, input); dnzMantaSprite(true); dnzMantaSprite(false); DNZ.ride = o; },
  dokun: dnzRideBasla,
  guncelle(o, dt) { if (DURUM === 'oyun' && o.faz === 'bekle' && Math.hypot(P.x - o.kx, P.y - 30 - o.ky) < 145) dnzRideBasla(o); if (P.ucus === o) o.x = P.x; },
  ciz(o, tm) {
    if (o.done) { dnzVatoz(g, o.x + Math.sin(tm * .6) * 40, o.ky - 50 + Math.sin(tm) * 15, 1, tm, -.07, true); return; }
    if (o.faz === 'bekle') { dnzVatoz(g, o.kx - 65, o.ky - 5 + Math.sin(tm * 1.1) * 12, 1.25, tm, .04, false); return; }
    dnzRideIsikCiz(o, tm);
    const sev = o.sevT > 0;
    const nBub = sev ? 16 : 9;
    for (let i = 0; i < nBub; i++) {
      const xx = o.mx - 75 - i * (sev ? 32 : 25), yy = o.my + 18 + Math.sin(tm * (sev ? 2.4 : 1.4) + i) * 14;
      g.strokeStyle = sev ? 'rgba(180,255,245,' + (.45 * (1 - i / nBub)) + ')' : 'rgba(207,248,242,' + (.26 * (1 - i / 10)) + ')';
      g.lineWidth = sev ? 1.8 : 1.3;
      g.beginPath(); g.arc(xx, yy, (sev ? 3.5 : 3) + i % 3, 0, Math.PI * 2); g.stroke();
    }
    dnzVatoz(g, o.mx, o.my + 12, 1.3, tm, o.rot, o.sevT > .5);
  },
  cizOn(o, tm) {
    if (P.ucus !== o) return;
    if (typeof fezaCizPoz === 'function') {
      const a = o.pozOpt;
      a.otur = o.faz === 'binis' ? smooth(clamp(o.t / 1.5, 0, 1)) : o.faz === 'inis' ? 1 - smooth(clamp(o.t / 1.4, 0, 1)) : 1;
      a.aci = o.rot;
      a.vy = Math.sin(tm * 1.4) * 12;
      a.sevinc = Math.max(.2, Math.min(1, (o.sevT || 0) * 0.8));
      a.ruzgar = 0.18 + (o.sevT > 0 ? 0.35 : 0);
      fezaCizPoz(g, P.x, P.y + 2, 1.15, 'denizBinek', tm, null, a);
    }
    if (typeof pirilCizPoz === 'function') {
      const pJoy = o.sevT > 0;
      const px = P.x - (pJoy ? 80 : 103) + Math.sin(tm * 3) * (pJoy ? 16 : 7);
      const py = P.y - (pJoy ? 60 : 47) + Math.sin(tm * (pJoy ? 3.6 : 2)) * 10 - (pJoy ? 14 : 0);
      pirilCizPoz(g, px, py, 1.05, pJoy ? 'goz_kirp' : 'ucus', tm);
    }
  },
});

let dnzPearlSpr = null;
function dnzPearlSprite() { if (dnzPearlSpr) return dnzPearlSpr; const c = document.createElement('canvas'); c.width = c.height = 180; const x = c.getContext('2d'), gr = x.createRadialGradient(65, 53, 2, 90, 90, 75); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.28, '#fff6e1'); gr.addColorStop(.61, '#e8e4f5'); gr.addColorStop(.82, '#bedbdc'); gr.addColorStop(1, '#8fb7c4'); x.fillStyle = gr; x.beginPath(); x.arc(90, 90, 71, 0, Math.PI * 2); x.fill(); x.strokeStyle = '#d7eaea'; x.lineWidth = 2; x.stroke(); dnzOval(x, 66, 49, 24, 11, 'rgba(255,255,255,.78)', -.4); dnzOval(x, 113, 130, 22, 8, 'rgba(244,215,239,.35)', -.4); dnzPearlSpr = c; return c; }
function dnzPearlBasla(o) { if (o.done || o.dnz.faz !== 'bekle') return; if (DNZ.ati.some(q => !q.done) || DNZ.oct && !DNZ.oct.done || DNZ.ride && !DNZ.ride.done) { o.dokundu = false; return; } o.dnz.faz = 'uyan'; o.dnz.t = 0; P.kilit = Math.max(P.kilit || 0, 1.2); OLAY.emit('inciUyan', { o }); dnzSoz('p_i_inci'); dnzSes(1); }
const dnzClamArt = { arka: null, on: null };
function dnzClamSprite(front) {
  const key = front ? 'on' : 'arka'; if (dnzClamArt[key]) return dnzClamArt[key];
  const c = document.createElement('canvas'); c.width = 720; c.height = 480; const q = c.getContext('2d'); q.scale(2, 2); q.translate(180, 160); const rnd = rng(front ? 613 : 572);
  if (!front) {
    q.beginPath(); q.moveTo(-136, 11); for (let i = 0; i <= 90; i++) { const a = Math.PI + i / 90 * Math.PI, f = 1 + Math.cos(i / 90 * Math.PI * 18) * .028; q.lineTo(Math.cos(a) * 143 * f, Math.sin(a) * 108 * f - 7); } q.bezierCurveTo(137, 31, 57, 49, 0, 43); q.bezierCurveTo(-60, 48, -132, 30, -136, 11); q.closePath();
    const gr = q.createRadialGradient(-45, -88, 4, 0, -15, 163); gr.addColorStop(0, '#fff0e3'); gr.addColorStop(.36, '#f1cad1'); gr.addColorStop(.7, '#cca8c3'); gr.addColorStop(1, '#8a799d'); q.fillStyle = gr; q.fill(); q.save(); q.clip();
    for (let j = 0; j < 23; j++) { const a = Math.PI + (j + .5) / 23 * Math.PI, tx = Math.cos(a) * 140, ty = Math.sin(a) * 105 - 6; q.strokeStyle = 'rgba(153,108,148,.18)'; q.lineWidth = 3.8; q.beginPath(); q.moveTo(0, 34); q.bezierCurveTo(tx * .22 - 2, 6, tx * .72 - 2, ty * .57, tx - 2, ty); q.stroke(); q.strokeStyle = 'rgba(255,251,231,.63)'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(0, 33); q.bezierCurveTo(tx * .22 + 1, 5, tx * .72 + 1, ty * .57, tx + 1, ty); q.stroke(); }
    for (let j = 0; j < 380; j++) dnzOval(q, -146 + rnd() * 290, -120 + rnd() * 170, .2 + rnd() * .6, .2 + rnd() * .4, 'rgba(254,246,235,' + (.04 + rnd() * .12) + ')'); q.restore();
    q.strokeStyle = 'rgba(254,234,216,.73)'; q.lineWidth = 1.8; q.beginPath(); for (let i = 0; i <= 90; i++) { const a = Math.PI + i / 90 * Math.PI, f = 1 + Math.cos(i / 90 * Math.PI * 18) * .028, xx = Math.cos(a) * 143 * f, yy = Math.sin(a) * 108 * f - 7; if (i) q.lineTo(xx, yy); else q.moveTo(xx, yy); } q.stroke();
    const bowl = q.createRadialGradient(-17, -1, 10, 0, 3, 135); bowl.addColorStop(0, '#bb97b5'); bowl.addColorStop(.65, '#d8b8cb'); bowl.addColorStop(.87, '#f1d4d4'); bowl.addColorStop(1, '#fff0dd'); q.fillStyle = bowl; q.beginPath(); q.ellipse(0, 7, 135, 43, 0, 0, Math.PI * 2); q.fill();
    q.strokeStyle = 'rgba(255,247,225,.78)'; q.lineWidth = 2.4; q.beginPath(); q.ellipse(0, 7, 132, 40, 0, Math.PI, Math.PI * 2); q.stroke();
    const shade = q.createRadialGradient(0, 13, 4, 0, 13, 80); shade.addColorStop(0, 'rgba(105,83,121,.25)'); shade.addColorStop(1, 'rgba(105,83,121,0)'); q.save(); q.scale(1, .28); q.fillStyle = shade; q.fillRect(-100, -10, 200, 160); q.restore();
  } else {
    q.beginPath(); q.moveTo(-141, 14); q.bezierCurveTo(-117, 39, -56, 51, 0, 48); q.bezierCurveTo(59, 51, 118, 36, 141, 14); q.bezierCurveTo(143, 42, 113, 53, 82, 63); q.quadraticCurveTo(0, 85, -85, 62); q.bezierCurveTo(-120, 54, -143, 40, -141, 14); q.closePath();
    const gr = q.createLinearGradient(0, 13, 0, 75); gr.addColorStop(0, '#f9e0d5'); gr.addColorStop(.27, '#ecc8d4'); gr.addColorStop(.63, '#c3a0ba'); gr.addColorStop(1, '#8d7b9e'); q.fillStyle = gr; q.fill(); q.save(); q.clip();
    for (let i = -12; i <= 12; i++) { q.strokeStyle = 'rgba(126,89,136,.16)'; q.lineWidth = 1.8; q.beginPath(); q.moveTo(i * 10.5, 14); q.quadraticCurveTo(i * 8.6, 48, i * 6.2, 73); q.stroke(); q.strokeStyle = 'rgba(255,236,221,.35)'; q.lineWidth = .8; q.beginPath(); q.moveTo(i * 10.5 + 2, 14); q.quadraticCurveTo(i * 8.6 + 2, 48, i * 6.2 + 2, 73); q.stroke(); }
    for (let i = 0; i < 130; i++) dnzOval(q, -145 + rnd() * 290, 13 + rnd() * 68, .3 + rnd() * .6, .2 + rnd() * .4, 'rgba(255,242,223,.12)'); q.restore();
    q.strokeStyle = '#fdf0df'; q.lineWidth = 3; q.beginPath(); q.moveTo(-140, 14); q.bezierCurveTo(-115, 39, -52, 49, 0, 46); q.bezierCurveTo(54, 49, 117, 36, 140, 14); q.stroke(); q.strokeStyle = 'rgba(160,199,202,.56)'; q.lineWidth = 1; q.beginPath(); q.moveTo(-137, 19); q.bezierCurveTo(-115, 43, -52, 54, 0, 51); q.bezierCurveTo(54, 54, 117, 41, 137, 19); q.stroke();
  }
  dnzClamArt[key] = c; return c;
}
function dnzPearlTapinakCiz(c, tm) {
  // 1) Rüya gibi ışık haleleri
  const haloPulse = 0.88 + 0.12 * Math.sin(tm * 0.95);
  dglow('#9ef5e6', 0, -65, 280, 0.18 * haloPulse);
  dglow('#ffd4ea', 0, -85, 220, 0.15 * haloPulse);
  dglow('#fff5cf', 0, -50, 160, 0.16 * haloPulse);
  for (let r = 0; r < 3; r++) {
    const rProg = ((tm * 0.18 + r * 0.333) % 1);
    const rad = 80 + rProg * 210;
    const rAlpha = Math.sin(rProg * Math.PI) * 0.2;
    c.save();
    c.globalAlpha = rAlpha;
    c.strokeStyle = r % 2 ? '#baffec' : '#fed6ea';
    c.lineWidth = 2.6 * (1 - rProg * 0.6);
    c.beginPath();
    c.ellipse(0, -60, rad * 1.15, rad * 0.68, 0, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }

  // 2) Tapınağın iki yanında süzülen kutsal su bitkileri
  for (let p = 0; p < 8; p++) {
    const side = p < 4 ? -1 : 1;
    const pIdx = p % 4;
    const px0 = side * (135 + pIdx * 25);
    const pyFloor = 55;
    const pH = 190 + pIdx * 40;
    const pSway = Math.sin(tm * 1.1 + pIdx * 0.75 + side * 1.2) * (28 + pIdx * 7);
    const pMidSway = pSway * 0.42;
    const pTipX = px0 + pSway;
    const pTipY = pyFloor - pH;
    
    c.save();
    c.lineWidth = 4.6 - pIdx * 0.7;
    c.lineCap = 'round';
    c.strokeStyle = pIdx % 2 ? 'rgba(102, 235, 218, 0.58)' : 'rgba(235, 178, 218, 0.55)';
    c.beginPath();
    c.moveTo(px0, pyFloor);
    c.bezierCurveTo(px0 + side * 20, pyFloor - pH * 0.38, px0 + pMidSway, pyFloor - pH * 0.72, pTipX, pTipY);
    c.stroke();
    c.strokeStyle = 'rgba(255, 252, 235, 0.75)';
    c.lineWidth = 1.3;
    c.stroke();
    
    // Küçük ışıldayan sedef damlaları
    for (let d = 1; d <= 3; d++) {
      const du = d / 4;
      const dx = px0 + (pTipX - px0) * du;
      const dy = pyFloor - pH * du;
      const dPulse = 0.8 + 0.2 * Math.sin(tm * 2.8 + p * 2 + d);
      dglow('#d2fef7', dx, dy, 12, 0.25 * dPulse);
      dnzOval(c, dx, dy, 2.5, 2.8, '#ffffff');
    }
    
    // Uçtaki ışıklı tomurcuk / inci goncası
    const tipPulse = 0.85 + 0.15 * Math.sin(tm * 2.2 + p);
    const tipCol = pIdx % 2 ? '#b8fff3' : '#ffdff1';
    dglow(tipCol, pTipX, pTipY, 22, 0.35 * tipPulse);
    dnzOval(c, pTipX, pTipY, 4.2, 5.2, '#ffffff');
    dnzOval(c, pTipX, pTipY, 2.6, 3.6, tipCol);
    c.restore();
  }
}

TUR.kaydet('buyukInci', {
  kur(o) { o.r = 155; o.ry = 80; o.dnz = { faz: 'bekle', t: 0, ay: 0 }; dnzClamSprite(false); dnzClamSprite(true); dnzPearlSprite(); DNZ.pearl = o; },
  dokun: dnzPearlBasla,
  guncelle(o, dt) { const k = o.dnz; k.ay += dt; if (k.faz === 'bekle') { if (DURUM === 'oyun' && Math.hypot(P.x - o.x, P.y - 30 - (o.y - 80)) < 175) dnzPearlBasla(o); return; } if (DURUM !== 'oyun') return; k.t += dt; if (k.t > 6 && !o.done) { o.done = true; k.faz = 'bitti'; OLAY.emit('inciTamam', { o }); } },
  ciz(o, tm) { const k = o.dnz, u = k.faz === 'bekle' ? 0 : smooth(clamp(k.t / 2.3, 0, 1)); g.save(); g.translate(o.x, o.y);
    dnzPearlTapinakCiz(g, tm);
    dnzOval(g, 0, 19, 158, 27, 'rgba(63,129,141,.2)');
    g.save(); g.scale(1, 1 + u * .055); g.drawImage(dnzClamSprite(false), -180, -160, 360, 240); g.restore();
    const py = -47 - u * 29 + Math.sin(tm * 1.3) * 3; dglow('#caffef', 0, py, 100 + u * 35, .1 + u * .18); g.drawImage(dnzPearlSprite(), -69, py - 69, 138, 138); dnzGoz(g, -16, py + 7, 6, k.faz === 'bekle' ? 1 : 0, false); dnzGoz(g, 16, py + 7, 6, k.faz === 'bekle' ? 1 : 0, false); g.strokeStyle = '#8498ab'; g.lineWidth = 1.6; g.beginPath(); g.arc(0, py + 22, 5, .1, 3.04); g.stroke();
    g.drawImage(dnzClamSprite(true), -180, -160, 360, 240); g.restore();
  },
  cizOn(o) { const k = o.dnz; if (k.faz === 'bekle' || k.t > 7) return; const u = clamp(k.t / 5.5, 0, 1), r = 70 + smooth(u) * 650; g.save(); g.globalAlpha = Math.sin(u * Math.PI) * .28; g.strokeStyle = '#c6fff1'; g.lineWidth = 24 * (1 - u) + 3; g.beginPath(); g.ellipse(o.x, o.y - 58, r, r * .8, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha *= .45; g.lineWidth *= 2; g.stroke(); g.restore(); },
});

TUR.kaydet('denizSus', {
  kur(o) {
    o.dnz = {
      seed: (o.sira || 0) * 1.37 + Math.random(),
      renk: dnzPal[(o.sira || 0) % 5]
    };
  },
  ciz(o, tm) {
    const k = o.dnz;
    if (o.tur === 'isikliAnemon') {
      // Büyülü ışıldayan deniz anemonu: zemine tutunmuş, narin dokunaçları süzülen ve ışık saçan
      g.save();
      g.translate(o.x, o.y);
      const anemonPals = [
        ['#ff7eb3', '#ffe4f0'],
        ['#4ee8cf', '#d6fff8'],
        ['#a882ff', '#eee4ff'],
        ['#ffc857', '#fff7db'],
        ['#5ce1e6', '#e0ffff']
      ];
      const pal = anemonPals[(o.sira || 0) % anemonPals.length];
      const dFeza = typeof P !== 'undefined' ? Math.hypot(P.x - o.x, P.y - o.y) : 999;
      const reach = Math.max(0, 1 - dFeza / 115);
      const fezaAng = typeof P !== 'undefined' ? Math.atan2((P.y - 20) - o.y, P.x - o.x) : 0;
      
      // Anemon gövdesi
      dglow(pal[0], 0, -6, 28, 0.22 + reach * 0.25);
      dnzOval(g, 0, 0, 16, 11, pal[0]);
      dnzOval(g, 0, -3, 13, 8, pal[1]);
      
      // Narin kıvrılan dokunaçlar
      const nTent = 12;
      for (let t = 0; t < nTent; t++) {
        const baseAng = -Math.PI * 0.88 + (t / (nTent - 1)) * Math.PI * 0.76;
        const len = 25 + Math.sin(t * 1.5 + k.seed) * 7;
        const wave = Math.sin(tm * 2.1 + t * 0.6 + k.seed) * 8;
        const curAng = baseAng + (reach * (fezaAng - baseAng) * 0.42);
        const midX = Math.cos(curAng) * (len * 0.5) + wave * 0.4;
        const midY = Math.sin(curAng) * (len * 0.5) - 4;
        const tipX = Math.cos(curAng) * len + wave;
        const tipY = Math.sin(curAng) * len - 6;
        
        g.lineWidth = 2.4;
        g.strokeStyle = pal[0];
        g.beginPath();
        g.moveTo(0, -4);
        g.quadraticCurveTo(midX, midY, tipX, tipY);
        g.stroke();
        
        g.lineWidth = 1.1;
        g.strokeStyle = pal[1];
        g.stroke();
        
        // Dokunaç ucundaki ışıklı minik inci/ampul
        const bGlow = 0.8 + 0.2 * Math.sin(tm * 3.2 + t * 0.8 + k.seed) + reach * 0.35;
        dglow(pal[1], tipX, tipY, 13, 0.3 * bGlow);
        dnzOval(g, tipX, tipY, 2.4, 2.4, '#ffffff');
      }
      
      // Yavaşça yükselen ışık kabarcığı
      const bubP = ((tm * 0.38 + k.seed) % 1);
      const bubY = -bubP * 65;
      const bubX = Math.sin(bubP * 6.28 + k.seed) * 10;
      const bubA = Math.sin(bubP * Math.PI) * 0.65;
      g.save();
      g.globalAlpha = bubA;
      g.strokeStyle = pal[1];
      g.lineWidth = 1.1;
      g.beginPath();
      g.arc(bubX, bubY, 2.2, 0, Math.PI * 2);
      g.stroke();
      dnzOval(g, bubX - 0.5, bubY - 0.5, 0.8, 0.5, '#ffffff');
      g.restore();
      g.restore();
      return;
    }

    if (o.tur === 'sedefKabuk') {
      // Mercan çatlaklarına yerleşmiş sedef kabuk: aralanıp parıldayan inci
      g.save();
      g.translate(o.x, o.y);
      const open = Math.max(0, Math.sin(tm * 0.75 + k.seed));
      const colIdx = (o.sira || 0) % 3;
      dnzKabuk(g, 0, 0, 20, colIdx, -0.08);
      if (open > 0.05) {
        const pearlY = -open * 9;
        const pearlR = 3.6 + open * 1.4;
        dglow('#caffec', 0, pearlY, 26 + open * 14, 0.2 + open * 0.3);
        dglow('#ffe2f0', 0, pearlY, 18, 0.25 * open);
        dnzOval(g, 0, pearlY, pearlR, pearlR * 0.95, '#ffffff');
        dnzOval(g, -pearlR * 0.28, pearlY - pearlR * 0.28, pearlR * 0.35, pearlR * 0.2, '#fffdec');
      }
      const sProg = ((tm * 0.35 + k.seed) % 1);
      const sA = Math.sin(sProg * Math.PI) * 0.75;
      if (sA > 0.1) {
        const sx = Math.sin(sProg * 5 + k.seed) * 12;
        const sy = -10 - sProg * 50;
        g.save();
        g.globalAlpha = sA;
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(sx, sy, 1.8, 0, Math.PI * 2);
        g.fill();
        dglow('#cbfff1', sx, sy, 10, 0.3 * sA);
        g.restore();
      }
      g.restore();
      return;
    }

    if (o.tur === 'isikliJelly') {
      // Yüzen narin minik deniz anası: rüya gibi süzülen, sevimli ışıklı kubbe ve kıvrımlı kollar
      g.save();
      const pulse = Math.sin(tm * 2.2 + k.seed);
      const isUp = pulse > 0;
      const jSwayX = Math.cos(tm * 0.55 + k.seed) * 14;
      const jSwayY = Math.sin(tm * 0.85 + k.seed) * 16 - (isUp ? pulse * 6 : 0);
      g.translate(o.x + jSwayX, o.y + jSwayY);
      
      const sX = 1 - pulse * 0.13, sY = 1 + pulse * 0.16;
      g.scale(sX, sY);
      const jCol = ['#ff9ee2', '#6ef6e4', '#c29eff', '#ffd478', '#7cebb5'][(o.sira || 0) % 5];
      dglow(jCol, 0, 0, 36, 0.24 + (isUp ? 0.1 : 0));
      
      // Kubbe gövde
      g.beginPath();
      g.moveTo(-17, 5);
      g.bezierCurveTo(-18, -17, 18, -17, 17, 5);
      for (let r = 0; r < 4; r++) {
        const rx0 = 17 - r * 8.5;
        const rx1 = 17 - (r + 1) * 8.5;
        g.quadraticCurveTo((rx0 + rx1) * 0.5, 8.5, rx1, 5);
      }
      g.closePath();
      const jGrad = g.createRadialGradient(0, -6, 2, 0, 0, 20);
      jGrad.addColorStop(0, '#ffffff');
      jGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.88)');
      jGrad.addColorStop(0.7, jCol);
      jGrad.addColorStop(1, 'rgba(255, 255, 255, 0.22)');
      g.fillStyle = jGrad;
      g.fill();
      g.strokeStyle = '#ffffff';
      g.lineWidth = 1.1;
      g.stroke();
      
      // İç ışık çekirdeği & sevimli gözler
      dnzOval(g, 0, -3, 5.5, 5.5, '#ffffff');
      dglow(jCol, 0, -3, 14, 0.38);
      dnzGoz(g, -5, -3, 2.3, 0, false, 0, 0);
      dnzGoz(g, 5, -3, 2.3, 0, false, 0, 0);
      
      // Süzülen narin dokunaçlar
      for (let t = -2; t <= 2; t++) {
        const tx = t * 5.5;
        const tLen = 22 + Math.abs(t) * -3;
        const tWave1 = Math.sin(tm * 2.5 + t * 0.8 + k.seed) * 5.5;
        const tWave2 = Math.cos(tm * 2.8 + t * 0.7 + k.seed) * 4.5;
        g.lineWidth = 1.25;
        g.strokeStyle = t === 0 ? '#ffffff' : jCol;
        g.beginPath();
        g.moveTo(tx, 6);
        g.bezierCurveTo(tx + tWave1, 13, tx - tWave2, 20, tx + tWave1 * 0.6, 6 + tLen);
        g.stroke();
        dnzOval(g, tx + tWave1 * 0.6, 6 + tLen, 1.3, 1.3, '#ffffff');
      }
      g.restore();
      return;
    }

    // Midye ve balık çeşitleri
    g.save();
    g.translate(o.x + Math.sin(tm * .6 + k.seed) * 24, o.y + Math.sin(tm * .9 + k.seed) * 9);
    if (o.tur === 'midye') {
      dglow('#caffec', 0, 0, 24, 0.15);
      dnzKabuk(g, 0, 0, 19, (o.sira || 0) % 3, -.1);
    } else {
      for (let i = 0; i < 4; i++) {
        const xx = i * -23, yy = (i % 2 ? 15 : -7);
        if (typeof dn4Fish === 'function') {
          dn4Fish(((o.sira || 0) + i) % 6, xx, yy, .34, tm, k.seed + i * .7, 18, Math.cos(tm * .9 + k.seed) * 8, .93, false);
          if (i === 0 && Math.sin(tm * 2.8 + k.seed) > 0.45) {
            dglow('#fff6cf', xx, yy, 14, 0.28);
          }
          continue;
        }
        g.fillStyle = k.renk;
        g.beginPath();
        g.moveTo(xx - 8, yy);
        g.lineTo(xx - 17, yy - 9);
        g.lineTo(xx - 17, yy + 9);
        g.closePath();
        g.fill();
        dnzOval(g, xx, yy, 11, 6, k.renk);
        dnzOval(g, xx + 4, yy - 1, 1.7, 2, '#3d6479');
        dnzOval(g, xx - 1, yy - 2, 3, 1, 'rgba(255,255,245,.55)');
      }
    }
    g.restore();
  },
});

const DENIZ = {
  get aktif() { return !!DNZ.aktif; }, get ahtapot() { return DNZ.oct; }, get vatoz() { return DNZ.ride; }, get inci() { return DNZ.pearl; }, get denizatlari() { return DNZ.ati; },
  hedef() { for (const a of DNZ.ati) if (!a.done) return a; if (DNZ.oct && !DNZ.oct.done) return DNZ.oct; if (DNZ.ride && !DNZ.ride.done) return { x: DNZ.ride.kx, y: DNZ.ride.ky }; return DNZ.pearl && !DNZ.pearl.done ? DNZ.pearl : null; },
  gecitX() { if (!DNZ.oct || DNZ.oct.done) return Infinity;   // duvar yalnız ahtapot bulmacası bitene kadar; atlanmış denizatları ilerlemeyi engellemez (ahtapot bitince ışıkla kendiliğinden uyanır)
    return typeof BOLUM !== 'undefined' && BOLUM.deniz ? BOLUM.deniz.ahtapotX - 110 : DNZ.oct.x + 270; },
  ikon(c, x, y, r, on) { dnzAtCiz(c, x - r * .05, y - r * .18, r / 65, 0, on ? '#ffdbad' : '#a0bec6', false, 0); },
  // Only diagnostics; no alternate reward or skip pathway in the actual game.
  test: { kabukYer(o, i) { const a = o.dnz.kol[i]; return { x: o.x + a.x, y: o.y + a.y - 9, tx: o.x + a.tx, ty: o.y + a.ty - 9 }; }, ahtapotBasla: dnzOctAktif, denizatiBul: dnzAtBul, vatozBasla: dnzRideBasla },
};

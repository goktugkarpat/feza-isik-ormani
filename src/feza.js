/* feza.js – Feza modeli ve animasyonları (drawFeza, fezaUpdate)
   Klasik script: üst düzey const/let/function'lar diğer dosyalarla ortak (ortak.js önce yüklenir).
   Bu dosyadaki bütün yardımcı adlar fz/FZ ile başlar (başka dosyalarla çakışmasın).
   Yerel koordinat: ayak tabanı (0,0), sağa bakıyor, yukarı = -y. Boy ~60 birim, ekrana 1.3 ölçekle çizilir.
   Uzuv açıları: aşağıdan ölçülür, + = ileri. Diz bükülmesi (-), dirsek bükülmesi (+).
   Animasyonlar: yürüyüş↔koşu (hıza göre adım), olaylarla: ziplatti (yıldız pozu, önden; Büyük Pofuduk'ta takla),
   uyandi (mutlu sekme), cicek/tohum (uzanır, sonra önden kollar havada sevinir), carpti (iter), kurtarildi (Pırıl'ın
   patisine Peter Pan gibi tutunur), uçurum kenarında "eyvah", hareketli cisimde denge, Büyük Pofuduk/ağaca hayranlık,
   uzun beklemede el sallama / esneme / gerinme / oturma / uyuklama; uçurum kenarında bir süre durunca kenara oturup
   ayaklarını boşlukta sallar; fırlatıldıktan sonra yere inince önden "ta-da!"; iterken gözler > <.
   OLAY 'adim' {x, y, hiz, inis?}: her ayak basışında (ses için).
   Dışa açık: P.a_elX, P.a_elY (ön elin dünya konumu; Pırıl taşırken tutar), P.a_state, fezaCizPoz (ara sahneler, en altta).
   Çizim konumu P.rx/P.ry varsa onu kullanır. */
'use strict';

// ── renkler ──
const FZ = {
  skin: '#f8d5bc', skinHi: '#fee9da', skinS: '#e6b498', skinD: '#cf9a7e', skinF: '#e7bba0',
  hair: ['#33221a', '#4b3324', '#5f412d', '#77543a', '#a07a58'],
  pj: '#f8f2e5', pjS: '#ddd4c3', pjF: '#ddd3c1', pjLine: '#bdb2a0',
  brow: '#5b3a24', lash: '#26150b', lip: '#b05a48', mouth: '#6e2626', tongue: '#d4606c',
  shoe: '#f6f6f3', shoeF: '#d4d5d8', blue: '#3b7be2', blueF: '#2d5fb0', sole: '#d9dbe2', soleF: '#b4b6bf',
  cloud: '#97a1b4', pink: '#f28fae', sky: '#86bbea', yel: '#f3c94c', star: '#f07c9c'
};
const FZ_TH = 8.0, FZ_SH = 7.6, FZ_FT = 2.1, FZ_AIRHIP = -18.6, FZ_UA = 6.6, FZ_FA = 6.0, FZ_SC = 1.4;
const FZ_KEYS = ['lean', 'hx', 'bob', 'lt1', 'lt2', 'bt1', 'bt2', 'la1', 'la2', 'ba1', 'ba2', 'shr', 'head', 'gx', 'gy',
  'lid', 'happy', 'sq', 'brow', 'mSmile', 'mOpen', 'mRound', 'sx', 'sy', 'air', 'breath', 'hOpen', 'arm', 'spr'];
const FZ_REST = { lean: 0.03, hx: 0, bob: 0, lt1: 0.04, lt2: -0.08, bt1: -0.04, bt2: -0.06, la1: 0.12, la2: 0.35,
  ba1: -0.1, ba2: 0.35, shr: 0, head: 0, gx: 0.5, gy: 0.05, lid: 1, happy: 0, sq: 0, brow: 0, mSmile: 0.7, mOpen: 0, mRound: 0,
  sx: 1, sy: 1, air: 0, breath: 0, hOpen: 0, arm: 1, spr: 0 };
const FZ_VMAX = { la1: 18, la2: 20, ba1: 18, ba2: 20, lt1: 22, lt2: 22, bt1: 22, bt2: 22, lean: 6, head: 7 };   // rad/sn
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
function fzArmIK(x, sx, sy, tx, ty, ust, open, al) {   // ust: yüzün önünde (kenar çizgisi olsun)
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy) || 0.01;
  const L1 = FZ_UA * al, L2 = (FZ_FA + 1.0) * al, dd = clamp(d, 1.2, L1 + L2 - 0.05);
  const a0 = Math.atan2(dy, dx), ac = Math.acos(clamp((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1)), sd = Math.sign(sx) || 1;
  // dirsek: iki çözümden dışa ve aşağı bakanı
  const sc = a => sd * Math.cos(a) + 0.6 * Math.sin(a), a = sc(a0 + ac) >= sc(a0 - ac) ? a0 + ac : a0 - ac;
  const ex = sx + Math.cos(a) * L1, ey = sy + Math.sin(a) * L1;
  const hx = sx + dx / d * dd, hy = sy + dy / d * dd;
  if (ust) {   // ten üstünde ten: ince koyu kenar
    fzTaper(x, ex, ey, hx, hy, 1.9, 1.7, FZ.skinD);
    x.fillStyle = FZ.skinD; x.beginPath(); x.arc(hx, hy, 2.25, 0, 6.2832); x.fill();
  }
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
// out: gözün dış köşesinin yönü (-1 sol, +1 sağ)
let fzEyeV = 1;   // 1: fotoğrafa daha yakın (biraz küçük iris, yumuşak kirpik; oyun boyunda da net okunuyor) · 0: eski büyük göz
function fzEye(x, cx, cy, w, h, R, far, pd, out) {
  const lid = R.lid * fzQ.a_lidM, ev = fzEyeV;
  if (ev) h *= 0.88;
  x.lineCap = 'round'; x.lineJoin = 'round';
  if (R.sq > 0.5) {      // sıkı sıkı kapalı (itme, zorlanma): > <  (uç burna doğru)
    pd = pd || 1; x.strokeStyle = FZ.lash; x.lineWidth = far ? 0.62 : 0.78;
    x.beginPath(); x.moveTo(cx - w * 0.75 * pd, cy - h * 0.45); x.lineTo(cx + w * 0.7 * pd, cy + 0.25); x.lineTo(cx - w * 0.75 * pd, cy + h * 0.55); x.stroke(); return;
  }
  if (R.happy > 0.5) {   // mutlu kapalı göz: kalın, yumuşak hilal ^ ^
    x.fillStyle = FZ.lash; x.beginPath();
    x.moveTo(cx - w * 1.05, cy + 0.75); x.quadraticCurveTo(cx, cy - h * 1.3, cx + w * 1.05, cy + 0.75);
    x.quadraticCurveTo(cx + w * 0.9, cy + 0.85, cx + w * 0.8, cy + 0.6); x.quadraticCurveTo(cx, cy - h * 0.4, cx - w * 0.8, cy + 0.6);
    x.quadraticCurveTo(cx - w * 0.9, cy + 0.85, cx - w * 1.05, cy + 0.75); x.fill(); return;
  }
  if (lid < 0.2) {       // göz kırpma
    x.strokeStyle = FZ.lash; x.lineWidth = far ? 0.55 : 0.7;
    x.beginPath(); x.moveTo(cx - w, cy + 0.5); x.quadraticCurveTo(cx, cy + 1.3, cx + w, cy + 0.5); x.stroke(); return;
  }
  const eh = h * Math.min(lid, 1.15), ec = cy + h - eh;
  // gülümserken yanaklar alt kapağı hafifçe yukarı iter (fotoğraftaki gibi gülen gözler)
  const ch = clamp((R.mSmile - 0.7) / 0.3, 0, 1) * (1 - clamp(R.mOpen, 0, 1) * 0.4) * (1 - R.mRound) * 0.3 * h;
  x.save();
  x.beginPath(); x.ellipse(cx, ec, w, eh, 0, 0, 6.2832); x.fillStyle = '#fdf8f3'; x.fill(); x.clip();
  const ri = (far ? 1.5 : 1.78) * (ev ? 0.86 : 1), rx = far ? ri * 0.7 : ri * 0.9;
  const ix = cx + R.gx * w * 0.3 + (far ? 0.12 : 0.05), iy = cy + R.gy * h * 0.25 + 0.2;
  const ig = x.createRadialGradient(ix, iy + ri * 0.5, ri * 0.05, ix, iy, ri);
  ig.addColorStop(0, '#d59d5e'); ig.addColorStop(0.38, '#9a5d2e'); ig.addColorStop(0.78, '#5a2f17'); ig.addColorStop(1, '#2c1408');
  x.fillStyle = ig; x.beginPath(); x.ellipse(ix, iy, rx, ri, 0, 0, 6.2832); x.fill();
  x.fillStyle = '#160803'; x.beginPath(); x.ellipse(ix, iy - ri * 0.04, rx * 0.47, ri * 0.5, 0, 0, 6.2832); x.fill();
  const sh = x.createLinearGradient(0, ec - eh, 0, ec - eh * 0.1);   // üst kapağın gölgesi
  sh.addColorStop(0, 'rgba(70,32,16,0.45)'); sh.addColorStop(1, 'rgba(70,32,16,0)');
  x.fillStyle = sh; x.fillRect(cx - w, ec - eh, w * 2, eh);
  x.strokeStyle = 'rgba(255,205,150,0.45)'; x.lineWidth = 0.22;     // irisin altında sıcak yansıma
  x.beginPath(); x.arc(ix, iy, ri * 0.72, 0.55, 2.55); x.stroke();
  x.fillStyle = '#ffffff';
  x.beginPath(); x.ellipse(ix + rx * 0.34, iy - ri * 0.38, ri * 0.32, ri * 0.28, -0.4, 0, 6.2832); x.fill();
  x.beginPath(); x.arc(ix - rx * 0.36, iy + ri * 0.42, ri * 0.13, 0, 6.2832); x.fill();
  if (ch > 0.02) { x.fillStyle = FZ.skin; x.beginPath(); x.ellipse(cx, cy + h + h * 0.95 - ch, w * 1.5, h, 0, 0, 6.2832); x.fill(); }
  x.restore();
  // kirpik çizgisi + dış köşede küçük kıvrım
  x.strokeStyle = ev ? '#3a2416' : FZ.lash; x.lineWidth = (far ? 0.55 : 0.72) * (ev ? 0.78 : 1);
  x.beginPath(); x.ellipse(cx, ec, w * 1.02, eh * 1.02, 0, Math.PI * 1.06, Math.PI * 1.96); x.stroke();
  if (out) {
    const ox = cx + out * w * 0.93, oy = ec - eh * 0.32;
    x.lineWidth = far ? 0.36 : 0.42; x.beginPath(); x.moveTo(ox, oy); x.quadraticCurveTo(ox + out * 0.3, oy - 0.05, ox + out * 0.42, oy - 0.3); x.stroke();
  }
  if (ch > 0.02) {   // alt kapak kıvrımı
    x.strokeStyle = 'rgba(180,108,84,0.35)'; x.lineWidth = 0.22;
    x.beginPath(); x.ellipse(cx, cy + h + h * 0.95 - ch, w * 1.05, h, 0, Math.PI * 1.34, Math.PI * 1.66); x.stroke();
  }
}
// kaş: dış uç (ox,oy) → iç uç (ix,iy); içe doğru kalınlaşır. brow>0 kalkar (ağız yuvarlaksa iç uç daha çok: şaşkın/endişeli),
// brow<0 iç uç aşağı (kararlı, itme), gülerken hafif kavis.
function fzBrow(x, ox, oy, ix, iy, R, far) {
  const up = Math.max(R.brow, 0) * 0.75, fur = Math.max(-R.brow, 0), wor = up * clamp(R.mRound * 1.4, 0, 1);
  const hap = Math.max(R.happy, clamp((R.mSmile - 0.8) * 5, 0, 1)) * 0.22;
  const oy2 = oy - up * 0.85 + fur * 0.05, iy2 = iy - up - wor * 0.45 + fur * 0.75;
  const mx = (ox + ix) / 2, my = (oy2 + iy2) / 2 - 0.45 - hap - up * 0.2 + wor * 0.3 + fur * 0.15;
  const th = far ? 0.55 : 0.72, s = ix > ox ? 1 : -1;
  x.fillStyle = FZ.brow; x.beginPath();
  x.moveTo(ox, oy2);
  x.quadraticCurveTo(mx, my - th * 0.6, ix, iy2 - th * 0.5);
  x.quadraticCurveTo(ix + s * th * 0.6, iy2, ix, iy2 + th * 0.5);
  x.quadraticCurveTo(mx, my + th * 0.45, ox, oy2 + 0.08);
  x.closePath(); x.fill();
}
// yumuşak yanak pembeliği (radyal geçiş)
function fzBlush(x, cx, cy, r, a) {
  const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  gg.addColorStop(0, 'rgba(255,112,108,0.42)'); gg.addColorStop(0.55, 'rgba(255,120,112,0.2)'); gg.addColorStop(1, 'rgba(255,125,115,0)');
  x.globalAlpha = a; x.fillStyle = gg; x.save(); x.translate(cx, cy); x.scale(1, 0.78); x.translate(-cx, -cy);
  x.beginPath(); x.arc(cx, cy, r, 0, 6.2832); x.fill(); x.restore(); x.globalAlpha = 1;
}
// ağız. fr: önden görünüş (simetrik, yaramaz tarafı sağda)
function fzMouth(x, R, fr) {
  const cx = 4.9, cy = 5.0, sm = R.mSmile, op = R.mOpen, ro = R.mRound;
  const w = lerp(lerp(3.0, 4.3, sm) + op * 0.5, 1.7, ro), h = op * lerp(2.2, 2.3, ro), up = sm * 0.8 * (1 - ro);
  const lx = cx - w * 0.55, rx = cx + w * 0.45, ly = cy - up * (fr ? 0.85 : 1), ry = cy - up * (fr ? 1.15 : 0.55);
  x.lineCap = 'round'; x.lineJoin = 'round';
  if (h < 0.4) {   // kapalı, yaramaz sırıtış: dudaklar birleşik, köşeler yanaklara gömülü
    const dip = 0.3 + sm * 0.75, mx = fr ? cx - 0.1 : cx - 0.3;
    x.fillStyle = '#86382f'; x.beginPath(); x.moveTo(lx, ly);
    x.quadraticCurveTo(mx, cy + dip, rx, ry);
    x.quadraticCurveTo(mx, cy + dip + 0.75 + sm * 0.3, lx, ly); x.fill();
    x.strokeStyle = 'rgba(168,88,70,0.6)'; x.lineWidth = 0.28;   // köşe kıvrımları (gamze)
    x.beginPath(); x.moveTo(lx + 0.25, ly - 0.05); x.quadraticCurveTo(lx - 0.45, ly - 0.1, lx - 0.4, ly - 0.75 * sm);
    if (fr || sm > 0.85) { x.moveTo(rx - 0.25, ry - 0.05); x.quadraticCurveTo(rx + 0.4, ry - 0.15, rx + 0.3, ry - 0.8 * sm); }
    x.stroke();
    x.fillStyle = 'rgba(225,118,105,0.2)'; x.beginPath(); x.ellipse(mx + 0.05, (ly + ry) / 2 * 0.5 + (cy + dip) * 0.5 + 0.9, w * 0.24, 0.32, 0, 0, 6.2832); x.fill();   // alt dudak
    x.fillStyle = 'rgba(255,240,230,0.45)'; x.beginPath(); x.ellipse(mx + 0.2, (ly + ry) / 2 * 0.5 + (cy + dip) * 0.5 + 0.85, w * 0.08, 0.14, 0, 0, 6.2832); x.fill();
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
// ── saç: yumuşak, dalgalı tutamlar. Her tutam kübik (S) eğri boyunca incelen, ucu yuvarlak bir şerit.
// tutam: [kökx, köky, k1x, k1y, k2x, k2y, uçx, uçy, yarı kalınlık, uç yarıçapı, ton, yay etkisi]  (kafa merkezine göre)
// Yan ve önden görünüş aynı kesim: tepede kabarık dalgalar, bir yana taranmış kakül, kulağın üstünü örten yanlar, kısa yumuşak ense.
const FZ_LN = 12, fzLS = new Float32Array((FZ_LN + 1) * 4), fzLW = new Float32Array(8);
function fzLkPath(x, w, tw, mode) {   // fzLW'deki eğri; mode 0: kapalı şerit, 1: alt kenar çizgisi, 2: parlak orta çizgi
  const p = fzLW, a = p[0], b = p[1], c = p[2], d = p[3], e = p[4], f = p[5], g2 = p[6], h = p[7], S4 = fzLS;
  for (let i = 0; i <= FZ_LN; i++) {
    const t = i / FZ_LN, u = 1 - t, A = u * u * u, B = 3 * u * u * t, Cc = 3 * u * t * t, Dd = t * t * t;
    const dx = 3 * u * u * (c - a) + 6 * u * t * (e - c) + 3 * t * t * (g2 - e), dy = 3 * u * u * (d - b) + 6 * u * t * (f - d) + 3 * t * t * (h - f);
    const L = Math.hypot(dx, dy) || 1, ww = (w + (tw - w) * t * t) * (1 + 0.14 * Math.sin(t * 3.1416)), k = i * 4;
    S4[k] = A * a + B * c + Cc * e + Dd * g2; S4[k + 1] = A * b + B * d + Cc * f + Dd * h;
    S4[k + 2] = -dy / L * ww; S4[k + 3] = dx / L * ww;
  }
  if (mode === 0) {
    x.moveTo(S4[0] + S4[2], S4[1] + S4[3]);
    for (let i = 1; i <= FZ_LN; i++) { const k = i * 4; x.lineTo(S4[k] + S4[k + 2], S4[k + 1] + S4[k + 3]); }
    const k = FZ_LN * 4, an = Math.atan2(S4[k + 3], S4[k + 2]);
    x.arc(S4[k], S4[k + 1], tw, an, an - Math.PI, true);
    for (let i = FZ_LN - 1; i >= 0; i--) { const k = i * 4; x.lineTo(S4[k] - S4[k + 2], S4[k + 1] - S4[k + 3]); }
    // kök ucu da yumuşak yuvarlak (düz kesik kenar görünmesin; tepede hafif, doğal bir tümsek verir)
    x.ellipse(S4[0], S4[1], w * 0.5, w, Math.atan2(S4[3], S4[2]) - 1.5708, -1.5708, 1.5708, true);
    x.closePath();
  } else if (mode === 1) {   // tutamı komşusundan ayıran ince gölge (uç tarafta)
    x.moveTo(S4[28] - S4[30] * 0.8, S4[29] - S4[31] * 0.8);
    for (let i = 8; i <= FZ_LN; i++) { const k = i * 4, q = i === FZ_LN ? 0.6 : 0.8; x.lineTo(S4[k] - S4[k + 2] * q, S4[k + 1] - S4[k + 3] * q); }
  } else {                   // ışık alan taraf: kısa parlak çizgi
    x.moveTo(S4[4] + S4[6] * 0.35, S4[5] + S4[7] * 0.35);
    for (let i = 2; i <= 6; i++) { const k = i * 4; x.lineTo(S4[k] + S4[k + 2] * 0.35, S4[k + 1] + S4[k + 3] * 0.35); }
  }
}
// mode 0: her tutamı kendi tonuyla doldur · 1: yalnız yolu ekle (birleşik kırpma) · 2: ayırma çizgileri · 3: parlak çizgiler
function fzLocks(x, D, tm, hx, hy, k, mode) {
  const H = FZ.hair;
  for (let i = 0; i < D.length; i++) {
    const l = D[i], sp = l[11], sw = Math.sin(tm * 1.7 + (l.length > 12 ? l[12] : i * 1.9 + k)) * 0.16 * sp, ex = hx * sp + sw, ey = hy * sp;
    fzLW[0] = l[0]; fzLW[1] = l[1]; fzLW[2] = l[2] + ex * 0.3; fzLW[3] = l[3] + ey * 0.3;
    fzLW[4] = l[4] + ex * 0.7; fzLW[5] = l[5] + ey * 0.7; fzLW[6] = l[6] + ex; fzLW[7] = l[7] + ey;
    if (mode === 0) { x.beginPath(); fzLkPath(x, l[8], l[9], 0); x.fillStyle = H[l[10]]; x.fill(); }
    else if (mode === 1) fzLkPath(x, l[8], l[9], 0);
    else if (l[10] >= 2) { x.beginPath(); fzLkPath(x, l[8], l[9], mode - 1); x.stroke(); }
  }
}
// saç kütlesi (tutamların altında); yollar tutamlarla aynı yönde (birleşik kırpma delik açmasın)
function fzMass(x, front, bx, by) {
  if (front) {
    // yanlar kulağın üstünü örter (fotoğraftaki gibi), kulak memesi görünür
    x.moveTo(9.5, 0.2); x.quadraticCurveTo(10.8, -7.6, 8.4, -11.4 + by * 0.6);
    x.quadraticCurveTo(5.6 + bx, -14.5 + by * 0.5, 1.0, -14.5 + by * 0.5); x.quadraticCurveTo(-3.6 + bx, -14.5 + by * 0.5, -7.4, -11.8 + by * 0.6);
    x.quadraticCurveTo(-10.8, -7.8, -9.5, 0.2); x.quadraticCurveTo(-8.6, 0.2, -8.0, -0.6);
    x.quadraticCurveTo(-7.8, -6.2, -4.0, -8.4); x.quadraticCurveTo(0, -9.4, 4.0, -8.4); x.quadraticCurveTo(7.8, -6.2, 8.0, -0.6); x.quadraticCurveTo(8.6, 0.2, 9.5, 0.2);
  } else {
    x.moveTo(8.2, -6.4); x.quadraticCurveTo(9.4, -10.6 + by, 5.4, -12.4 + by);
    x.quadraticCurveTo(1.2 + bx, -14.0 + by, -3.4, -12.9 + by); x.quadraticCurveTo(-8.2 + bx, -12.0 + by, -9.8, -6.8);
    // ense: kulağın arkasından boyuna doğru uzun (kısa "mullet"), kulağın üstünü örter
    x.quadraticCurveTo(-11.0, -1.0, -9.3, 2.6); x.quadraticCurveTo(-8.0, 4.6, -6.2, 4.4); x.lineTo(-5.0, 3.6);
    x.quadraticCurveTo(-4.7, 1.8, -4.1, 0.8); x.quadraticCurveTo(-2.4, -0.3, -0.4, 0.4); x.quadraticCurveTo(0.2, -2.6, 0.8, -5.2);
  }
  x.closePath();
}
// yan görünüş (sağa bakar)
const FZ_HS_NAPE = [
  [-7.0, -3.0, -10.0, 0.6, -9.2, 5.4, -11.3, 5.5, 1.9, 0.7, 1, 0.9], [-5.6, -0.6, -7.6, 2.6, -7.0, 7.0, -9.1, 6.8, 1.8, 0.7, 0, 0.8],
  [-4.8, 1.0, -5.6, 3.8, -4.8, 6.6, -6.5, 6.7, 1.3, 0.6, 1, 0.7]];
const FZ_HS = [
  [-5.0, -11.2, -7.6, -12.2, -9.8, -9.8, -10.0, -6.6, 2.4, 1.15, 2, 0.6],
  [-7.0, -8.0, -10.8, -4.6, -9.8, 0.4, -10.8, 3.0, 2.3, 0.9, 1, 0.75],
  [-4.2, -9.6, -8.2, -5.6, -6.6, -0.4, -8.2, 2.6, 2.3, 0.95, 2, 0.65],
  [-4.5, -11.8, -2.0, -14.8, 2.6, -14.6, 6.0, -12.6, 2.4, 1.2, 3, 0.45],
  [-1.6, -11.0, -4.4, -7.0, -2.0, -3.8, -4.3, 0.2, 2.5, 1.05, 3, 0.5],
  [0.8, -10.4, -0.8, -7.2, 1.2, -4.2, -0.9, 0.0, 1.7, 0.9, 2, 0.4]];
const FZ_HS_FR = [
  [0.0, -12.8, 1.2, -9.6, -0.6, -7.6, 1.4, -5.4, 2.4, 1.1, 2, 0.55],
  [2.2, -13.2, 4.0, -10.2, 2.4, -8.0, 4.2, -5.0, 2.5, 1.15, 3, 0.6],
  [4.4, -12.9, 6.6, -10.4, 5.2, -8.0, 6.9, -5.2, 2.4, 1.1, 2, 0.65],
  [6.0, -12.2, 8.6, -10.6, 7.6, -8.2, 8.8, -5.8, 2.0, 1.0, 3, 0.65],
  [3.2, -12.9, 4.4, -10.2, 3.4, -8.2, 5.4, -6.4, 1.0, 0.6, 3, 0.6]];
// önden görünüş (kakül sağdan ayrılıp sola taranmış)
const FZ_HF_NAPE = [
  [-7.4, -4.0, -10.0, -1.0, -9.6, 2.4, -11.8, 2.6, 1.3, 0.6, 1, 0.75], [7.4, -4.0, 10.0, -1.0, 9.6, 2.4, 11.8, 2.6, 1.3, 0.6, 1, 0.75]];
const FZ_HF = [
  [0.6, -13.6, 2.4, -15.2, 4.8, -15.1, 6.6, -13.4, 2.1, 1.5, 3, 0.2],
  [-6.4, -11.0, -10.0, -8.4, -9.0, -3.0, -11.6, -1.4, 1.8, 0.7, 2, 0.65], [6.4, -11.0, 10.0, -8.4, 9.0, -3.0, 11.6, -1.4, 1.8, 0.7, 2, 0.65],
  [-4.4, -12.2, -8.4, -9.0, -6.8, -4.8, -8.8, -1.6, 2.2, 1.0, 3, 0.5], [5.0, -12.2, 8.6, -9.0, 7.2, -4.8, 9.0, -1.8, 2.0, 0.95, 2, 0.5],
  [2.8, -12.6, -0.6, -15.0, -4.6, -14.6, -7.6, -11.6, 2.6, 1.25, 3, 0.45], [4.2, -12.6, 6.8, -14.2, 8.6, -12.6, 9.1, -9.4, 2.5, 1.2, 3, 0.45]];
const FZ_HF_FR = [
  [1.4, -13.4, -3.0, -12.6, -6.8, -10.0, -7.0, -5.8, 2.5, 1.15, 2, 0.6],
  [2.4, -13.4, -0.8, -11.4, -5.0, -9.6, -4.5, -5.2, 2.7, 1.2, 3, 0.6],
  [3.4, -13.2, 1.6, -11.0, -2.4, -9.0, -1.7, -5.0, 2.6, 1.2, 2, 0.6],
  [4.3, -13.0, 3.4, -10.4, 0.6, -8.8, 1.3, -5.3, 2.4, 1.1, 3, 0.6],
  [5.1, -12.8, 5.4, -10.4, 3.6, -8.4, 4.4, -5.7, 2.1, 1.0, 2, 0.6],
  [5.8, -12.6, 8.2, -11.0, 7.4, -8.0, 8.4, -5.6, 1.9, 0.95, 1, 0.55],
  [2.8, -13.4, 0.8, -11.0, -2.4, -9.2, -2.2, -6.2, 0.9, 0.55, 3, 0.6]];
// ── dönüşte saç: tutamlar yandan görünüşteki yerlerinden önden görünüşteki yerlerine kayar (çizim değişmez, saç döner).
// Her yuva bir yan tutamı ile bir ön tutamı eşler (en yakın komşu; eşi kalmayan tutamlara da yuva açılır).
// Önden görünüş EKRANA göre sabittir (kakül hep aynı yana taranmış): yön değişip tuval aynalanınca (dönüşün ortası)
// önden tutamlar da aynalanmış veriden okunur, böylece kakül hiçbir karede yer değiştirmez. Yuva eşleştirmesi iki
// durum için ayrı ayrı (normal / aynalı önden düzen) yapılır.
const FZ_HSA = FZ_HS_NAPE.concat(FZ_HS, FZ_HS_FR), FZ_HFA = FZ_HF_NAPE.concat(FZ_HF, FZ_HF_FR);
const FZ_SN = FZ_HS_NAPE.length, FZ_FN = FZ_HF_NAPE.length;
const fzMirL = l => { const m = l.slice(); m[0] = -m[0]; m[2] = -m[2]; m[4] = -m[4]; m[6] = -m[6]; return m; };
const FZ_HFM = [[FZ_HF_NAPE, FZ_HF, FZ_HF_FR], [FZ_HF_NAPE.map(fzMirL), FZ_HF.map(fzMirL), FZ_HF_FR.map(fzMirL)]];
function fzSlots(HFA) {
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) + Math.hypot(a[4] - b[4], a[5] - b[5]) + Math.hypot(a[6] - b[6], a[7] - b[7]);
  const near = (l, L) => { let bi = 0, bd = 1e9; L.forEach((m, j) => { const q = d(l, m); if (q < bd) { bd = q; bi = j; } }); return bi; };
  const sl = [], usedS = new Set();
  HFA.forEach((f, j) => { const i = near(f, FZ_HSA); sl.push([i, j]); usedS.add(i); });
  FZ_HSA.forEach((sv, i) => { if (!usedS.has(i)) sl.push([i, near(sv, HFA)]); });
  const S = sl.map(([i, j], n) => ({ i, j, ph: n * 1.9 + 0.7, l: new Array(13).fill(0) }));
  // çizim sıraları: yanda (ense yuvaları kütlenin arkasında), önden (ense yuvaları başın arkasında)
  const SO = S.slice().sort((a, b) => a.i - b.i || a.j - b.j), FO = S.slice().sort((a, b) => a.j - b.j || a.i - b.i);
  return { HFA, sl: S, SB: [SO.filter(q => q.i < FZ_SN).map(q => q.l), SO.filter(q => q.i >= FZ_SN).map(q => q.l)],
    FB: [FO.filter(q => q.j < FZ_FN).map(q => q.l), FO.filter(q => q.j >= FZ_FN).map(q => q.l)] };
}
const FZ_HV = [fzSlots(FZ_HFA), fzSlots(FZ_HFA.map(fzMirL))];
const FZ_NONE = [];
let fzFS = 1;   // tuvalin yatay işareti (sola bakarken -1); önden düzen buna göre aynalanır
function fzHairMix(w, V) {   // w: 0 yan … 1 önden
  for (const q of V.sl) {
    const a = FZ_HSA[q.i], b = V.HFA[q.j], l = q.l;
    for (let k = 0; k < 12; k++) l[k] = a[k] + (b[k] - a[k]) * w;
    l[10] = Math.round(l[10]); l[12] = q.ph;
  }
}
function fzMassF(x, bx, by) { x.save(); x.scale(fzFS, 1); fzMass(x, true, bx * fzFS, by); x.restore(); }   // önden kütle (ekrana göre sabit)
// kırpılmış gölgelendirme: alt taraf koyu, tepe sıcak, kafanın eğrisini izleyen yumuşak parlak bant
function fzHairShade(x, front, tm, hx, hy, bx, by, A, B) {
  x.save(); x.beginPath(); if (front) fzMassF(x, bx, by); else fzMass(x, false, bx, by); fzLocks(x, A, tm, hx, hy, 2, 1); fzLocks(x, B, tm, hx, hy, 3, 1); x.clip();
  // parlak halka: kafanın eğrisini izleyen, kenarları yumuşak bant (tutam kenarlarında kırılır)
  const cx = front ? 0.4 : 0.2, cy = -1.4 + hy * 0.15, r = front ? 10.2 : 10.0;
  const rg = x.createRadialGradient(cx, cy, r - 2.6, cx, cy, r + 1.6);
  rg.addColorStop(0, 'rgba(225,175,120,0)'); rg.addColorStop(0.5, 'rgba(225,175,120,0.3)'); rg.addColorStop(0.62, 'rgba(240,196,140,0.36)'); rg.addColorStop(1, 'rgba(225,175,120,0)');
  x.fillStyle = rg; x.fillRect(-14, -18, 28, 26);
  const gr = x.createLinearGradient(0, -16, 0, 6);
  gr.addColorStop(0, 'rgba(255,200,140,0.16)'); gr.addColorStop(0.4, 'rgba(60,30,15,0)'); gr.addColorStop(1, 'rgba(35,16,8,0.5)');
  x.fillStyle = gr; x.fillRect(-14, -18, 28, 26);
  x.restore();
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = 'rgba(45,24,12,0.22)'; x.lineWidth = 0.3; fzLocks(x, A, tm, hx, hy, 2, 2); fzLocks(x, B, tm, hx, hy, 3, 2);
}
function fzHair(x, tm) {
  const w = fzQ.a_hw || 0, hx = fzQ.a_hx * (1 - 0.5 * w), hy = fzQ.a_hy, bx = hx * 0.25, by = hy * 0.3;
  let A = FZ_HS, B = FZ_HS_FR, N = FZ_HS_NAPE;
  if (w > 0.001) { const V = FZ_HV[fzFS < 0 ? 1 : 0]; fzHairMix(w, V); N = V.SB[0]; A = V.SB[1]; B = FZ_NONE; }
  fzLocks(x, N, tm, hx, hy, 0, 0);
  const mg = x.createLinearGradient(0, -14, 0, 5);
  mg.addColorStop(0, FZ.hair[3]); mg.addColorStop(0.45, FZ.hair[2]); mg.addColorStop(1, FZ.hair[1]);
  x.fillStyle = mg; x.beginPath(); fzMass(x, false, bx, by); x.fill();
  if (w > 0.001) { x.globalAlpha = w * w; x.beginPath(); fzMassF(x, bx, by); x.fill(); }
  x.globalAlpha = 1;
  fzLocks(x, A, tm, hx, hy, 2, 0); fzLocks(x, B, tm, hx, hy, 3, 0);
  fzHairShade(x, false, tm, hx, hy, bx, by, A, B);
  // birkaç ince uçuşan tel
  x.strokeStyle = 'rgba(135,92,58,0.75)'; x.lineWidth = 0.22;
  x.beginPath(); x.moveTo(-3.4, -13.8); x.quadraticCurveTo(-4.4, -16.4 + hy * 0.4, -6.8 + hx * 0.5, -16.2 + hy * 0.5);
  x.moveTo(-9.8, -7.0); x.quadraticCurveTo(-12.4, -5.4, -12.2 + hx * 0.6, -2.4 + hy * 0.5); x.stroke();
}
function fzHairFront(x, tm, back) {
  const w = fzQ.a_hw === undefined ? 1 : fzQ.a_hw, hx = fzQ.a_hx * (1 - 0.5 * w), hy = fzQ.a_hy, H = FZ.hair, bx = hx * 0.25, by = hy * 0.3;
  const HM = FZ_HFM[fzFS < 0 ? 1 : 0];
  let A = HM[1], B = HM[2], N = HM[0];
  if (w < 0.999) { const V = FZ_HV[fzFS < 0 ? 1 : 0]; fzHairMix(w, V); N = V.FB[0]; A = V.FB[1]; B = FZ_NONE; }
  if (back) {   // başın arkasında kalan saç ve kısa, yumuşak ense uçları
    x.fillStyle = H[1]; x.beginPath();
    x.moveTo(9.2, 1.4); x.quadraticCurveTo(10.9, -6.0, 7.4, -11.8); x.quadraticCurveTo(0, -16.0, -7.4, -11.8);
    x.quadraticCurveTo(-10.9, -6.0, -9.2, 1.4); x.quadraticCurveTo(0, 3.0, 9.2, 1.4); x.closePath(); x.fill();
    fzLocks(x, N, tm, hx, hy, 0, 0);
    return;
  }
  const mg = x.createLinearGradient(0, -15, 0, 0);
  mg.addColorStop(0, H[3]); mg.addColorStop(0.5, H[2]); mg.addColorStop(1, H[1]);
  x.fillStyle = mg; x.beginPath(); fzMassF(x, bx, by); x.fill();
  fzLocks(x, A, tm, hx, hy, 2, 0); fzLocks(x, B, tm, hx, hy, 3, 0);
  fzHairShade(x, true, tm, hx, hy, bx, by, A, B);
  x.strokeStyle = 'rgba(135,92,58,0.75)'; x.lineWidth = 0.22;
  const fs = fzFS; x.beginPath(); x.moveTo(1.6 * fs, -14.8); x.quadraticCurveTo(0.8 * fs, -17.2 + hy * 0.4, -1.8 * fs + hx * 0.5, -17.0 + hy * 0.5);
  x.moveTo(-9.6 * fs, -7.0); x.quadraticCurveTo(-11.8 * fs, -6.0, -11.8 * fs + hx * 0.6, -3.4 + hy * 0.5); x.stroke();
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
  x.fillStyle = 'rgba(150,80,55,0.14)'; x.beginPath(); x.ellipse(4.4, -5.0, 6.0, 1.2, 0, 0, 6.2832); x.fill();
  const bl = clamp((R.mSmile - 0.5) / 0.5, 0, 1), ba = 0.8 + 0.35 * bl + 0.2 * R.happy;
  fzBlush(x, 1.5, 3.5 - 0.35 * bl, 3.3, ba); fzBlush(x, 7.9, 3.0 - 0.3 * bl, 1.9, ba * 0.85);
  x.restore();
  // kulak
  x.fillStyle = FZ.skin; x.beginPath(); x.ellipse(-2.3, 2.0, 1.9, 2.55, 0.1, 0, 6.2832); x.fill();
  x.strokeStyle = 'rgba(190,115,90,0.7)'; x.lineWidth = 0.4; x.lineCap = 'round';
  x.beginPath(); x.arc(-2.1, 2.1, 1.05, -1.4, 1.9); x.stroke();
  x.beginPath(); x.arc(-2.0, 2.3, 0.45, -0.5, 2.2); x.stroke();
  // gözler ve kaşlar
  fzEye(x, 2.0, -0.4, 1.65, 2.15, R, false, 1, -1);
  fzEye(x, 6.5, -0.6, 1.1, 2.0, R, true, 1, 1);
  // burun
  x.strokeStyle = 'rgba(200,120,95,0.55)'; x.lineWidth = 0.42;
  x.beginPath(); x.moveTo(6.5, 1.0); x.quadraticCurveTo(7.4, 2.4, 6.4, 3.0); x.stroke();
  x.fillStyle = 'rgba(200,120,95,0.5)'; x.beginPath(); x.ellipse(5.8, 3.0, 0.75, 0.35, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(255,245,236,0.85)'; x.beginPath(); x.arc(6.0, 1.9, 0.38, 0, 6.2832); x.fill();
  fzMouth(x, R, false);
  fzHair(x, tm);
  // kaşlar saçın üstünde (duygu her zaman okunsun)
  fzBrow(x, 0.3, -3.5, 3.5, -3.9, R, false); fzBrow(x, 8.0, -3.8, 5.9, -4.0, R, true);
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
  x.fillStyle = 'rgba(150,80,55,0.14)'; x.beginPath(); x.ellipse(0, -5.1, 7.4, 1.2, 0, 0, 6.2832); x.fill();
  const bl = clamp((R.mSmile - 0.5) / 0.5, 0, 1), ba = 0.8 + 0.35 * bl + 0.2 * R.happy;
  fzBlush(x, -4.8, 3.3 - 0.35 * bl, 3.1, ba); fzBlush(x, 4.8, 3.3 - 0.35 * bl, 3.1, ba);
  x.restore();
  fzEye(x, -3.2, -0.4, 1.6, 2.15, R, false, 1, -1);
  fzEye(x, 3.2, -0.4, 1.6, 2.15, R, false, -1, 1);
  x.fillStyle = 'rgba(200,120,95,0.5)'; x.beginPath(); x.ellipse(0, 2.9, 0.85, 0.38, 0, 0, 6.2832); x.fill();
  x.fillStyle = 'rgba(255,245,236,0.85)'; x.beginPath(); x.arc(0.1, 1.9, 0.4, 0, 6.2832); x.fill();
  x.save(); x.scale(fzFS, 1); x.translate(-4.6, 0.3); fzMouth(x, R, true); x.restore();
  fzHairFront(x, tm, false);
  fzBrow(x, -4.8, -3.5, -1.8, -3.8, R, false); fzBrow(x, 4.8, -3.5, 1.8, -3.8, R, false);
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
  x.save(); x.scale(fzFS, 1); fzPlane(x, -3.2, 2.0, 0.65, FZ.sky, 0.2); x.fillStyle = FZ.star; fzStar(x, 3.2, 2.2, 0.45); x.restore();
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
  x.save(); x.scale(fzFS, 1); x.translate(0.4, 1.8); x.scale(1.1, 0.92); fzPrint(x); x.restore();
  const sg = x.createLinearGradient(-7, 0, 7, 0);
  sg.addColorStop(0, 'rgba(70,58,110,0.3)'); sg.addColorStop(0.3, 'rgba(70,58,110,0)'); sg.addColorStop(0.7, 'rgba(70,58,110,0)'); sg.addColorStop(1, 'rgba(70,58,110,0.3)');
  x.fillStyle = sg; x.fillRect(-8, -15, 16, 19);
  x.fillStyle = 'rgba(70,58,110,0.12)'; x.fillRect(-8, hb - 1.4, 16, 4);
  x.restore();
  x.restore();
  // ara sahne: kucaktaki oyuncak gövdenin önüne, kolların arkasına çizilir
  if (fzQ.ara) fzQ.ara();
  // kollar iki yanda (ara sahnede hedef noktalı kollar: ovuşturma, sarılma, kollar havada)
  const ikArms = () => { for (let i = 0; i < 2; i++) { const k = fzQ.ik[i]; fzArmIK(x, (i ? 5.5 : -5.5), -11.0 + by, k[0], k[1], !!fzQ.ikUst, k[2] || 0, R.arm); } };
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

// bölgenin ışık rengi (dunya.js'in bölge ağırlıklarından): [ay kenarı, zemin yansıması]
const FZ_AMB = { patika: [[150, 225, 255], [90, 150, 220]], pofuduk: [[255, 190, 235], [210, 120, 190]], gol: [[130, 190, 255], [70, 120, 240]],
  dallar: [[140, 255, 225], [60, 190, 170]], sakli: [[205, 170, 255], [150, 100, 235]], aciklik: [[255, 225, 160], [235, 170, 90]] };
const fzAmbS = ['', ''];
const FZ_HALE = [[0, 1], [0.22, 0.55], [0.5, 0.16], [1, 0]], FZ_HALE_K = 0.24 * 0.85;   // ortak.js glow() profili × hale gücü
function fzAmb() {
  const w = typeof DNR !== 'undefined' && DNR ? DNR : null;
  for (let j = 0; j < 2; j++) {
    let r = 0, gg = 0, b = 0, t = 0;
    if (w) for (const k in FZ_AMB) { const q = w[k] || 0; if (q > 0) { const c = FZ_AMB[k][j]; r += c[0] * q; gg += c[1] * q; b += c[2] * q; t += q; } }
    if (t < 0.01) { const c = FZ_AMB.patika[j]; r = c[0]; gg = c[1]; b = c[2]; t = 1; }
    const L = j ? 0 : light * 0.35;   // gün ağarınca ay kenarı beyazlaşır
    fzAmbS[j] = `rgb(${Math.round(lerp(r / t, 255, L))},${Math.round(lerp(gg / t, 250, L))},${Math.round(lerp(b / t, 235, L))})`;
  }
  return fzAmbS;
}

function drawFeza(tm) {
  if (P.fade > 0 && !P.respawned) return;
  if (!P.a_R) fezaInit();
  fzQ = P;
  const SZ = 124, OY = SZ - 26, need = Math.ceil(SZ * S), x = fzX, R = P.a_R;
  // kamera yakınlaşırken S her karede biraz değişir: tuvali yalnızca yetmezse ya da çok büyük kalırsa yeniden ayır (32 px adımlarla, %15 pay)
  if (fzC.width < need || fzC.width > need * 1.3) { const n = Math.ceil(need * 1.15 / 32) * 32; fzC.width = fzC.height = n; fzR.width = fzR.height = n; }
  const px = fzC.width;
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.clearRect(0, 0, px, px);
  // dönüş: yan -> önden -> yeni yan. Genişlik hiç 0.92'nin altına inmez; ayna çevirme önden görünüşteyken olur.
  const u = P.a_turnU < 1 ? P.a_turnU : P.a_fu > 0 ? P.a_fu : 1, front = u > 0.3 && u < 0.72;
  P.a_hw = smooth(clamp((0.45 - Math.abs(u - 0.5)) / 0.3, 0, 1));   // saç dönüşü: yan → önden → yan
  const fsc = P.a_side * (u < 0.3 ? lerp(1, 0.92, u / 0.3) : u >= 0.72 && u < 1 ? lerp(0.92, 1, (u - 0.72) / 0.28) : 1);
  x.setTransform(S, 0, 0, S, SZ / 2 * S, OY * S);
  x.scale(fsc * R.sx * FZ_SC, R.sy * FZ_SC);
  if (P.a_spin) { x.translate(0, -30); x.rotate(P.a_spin); x.translate(0, 30); }
  fzFS = P.a_side < 0 ? -1 : 1;
  try { if (front) fzDrawFront(x, tm); else fzDraw(x, tm); } finally { fzFS = 1; }
  // çizim yeri: (varsa) ara değerli fizik konumu + animasyon kayması (Pırıl taşırken havada)
  const bx = (P.rx ?? P.x) + P.a_ox, by = (P.ry ?? P.y) + P.a_oy;
  if (window.fzDbgHook) window.fzDbgHook(fzC, (bx - cam.x - SZ / 2) * S, (by - cam.y - OY) * S);   // yalnız test (renk ölçümü)
  // ışıklandırma: renk tonu değil, değer. Saç kestane, ten sıcak kalsın; sahnenin rengi yalnız ince kenar ışıklarında.
  // 1) ayaklara doğru koyulaşan, nötre yakın gölge (gece mavisi saçı/teni mora çevirmesin)
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = 'source-atop';
  const lg = x.createLinearGradient(0, need * 0.1, 0, need), nt = 1 - light;
  lg.addColorStop(0, `rgba(34,18,12,${(0.06 + 0.06 * nt).toFixed(3)})`); lg.addColorStop(0.55, `rgba(22,16,24,${(0.12 + 0.1 * nt).toFixed(3)})`);
  lg.addColorStop(1, `rgba(14,16,32,${(0.3 + 0.14 * nt).toFixed(3)})`);
  x.fillStyle = lg; x.fillRect(0, 0, px, px);
  // 2) Pırıl'ın halesi (oyun.js omPirilHale: '#b88aff' r150 ×0.24 ve '#ffe0ff' r40 ×0.11, 'lighter') Feza'nın üstüne
  //    mor ışık EKLER; saç ve ten mora döner. Aynı haleyi burada önceden ÇIKARIRIZ ('difference' = çıkarma, taban ≥ ek
  //    olduğundan), ekleme sonrası renk doğal kalır. Pırıl'ın ışığından yalnız küçük leylak kenar ışığı (3) kalır.
  const dx = (D.x - bx) * S + SZ / 2 * S, dy = (D.y - by) * S + OY * S, pd = Math.hypot(D.x - bx, D.y - (by - 30));
  if (pd < 190) {
    fzRX.globalCompositeOperation = 'copy'; fzRX.drawImage(fzC, 0, 0); fzRX.globalCompositeOperation = 'source-over';
    x.globalCompositeOperation = 'difference';
    const k = FZ_HALE_K;
    let rg = x.createRadialGradient(dx, dy, 0, dx, dy, 150 * S);
    for (const [u, f] of FZ_HALE) rg.addColorStop(u, `rgb(${Math.round(184 * f * k)},${Math.round(138 * f * k)},${Math.round(255 * f * k)})`);
    x.fillStyle = rg; x.fillRect(0, 0, px, px);
    if (pd < 60) {
      rg = x.createRadialGradient(dx, dy, 0, dx, dy, 40 * S);
      for (const [u, f] of FZ_HALE) rg.addColorStop(u, `rgb(${Math.round(255 * f * k * 0.46)},${Math.round(224 * f * k * 0.46)},${Math.round(255 * f * k * 0.46)})`);
      x.fillStyle = rg; x.fillRect(0, 0, px, px);
    }
    x.globalCompositeOperation = 'destination-in'; x.drawImage(fzR, 0, 0);
  }
  x.globalCompositeOperation = 'source-over';
  // 3) kenar ışıkları: sağ üstteki ay (bölgenin rengiyle), aşağıdan zeminin yansıması, Pırıl'ın küçük leylak kenarı
  const amb = fzAmb();
  fzRim(0.72, -0.69, 0.75 * S, amb[0], 0.7 - light * 0.25);
  fzRim(-0.25, 0.97, 0.6 * S, amb[1], 0.4);
  const ddx = D.x - bx, ddy = D.y - (by - 38), dd = Math.hypot(ddx, ddy) || 1;
  fzRim(ddx / dd, ddy / dd, 0.7 * S, '#e2b8ff', 0.5 * clamp(1.2 - dd / 220, 0, 1));
  // Pırıl taşırken: sıcak bir kenar ışığı ve hafif sıcak dolgu (karanlık boşlukta solgun görünmesin, net okunsun)
  const tw = P.a_tasW || 0;
  if (tw > 0.02) {
    x.globalCompositeOperation = 'source-atop'; x.globalAlpha = 0.2 * tw; x.fillStyle = '#ffd2a0'; x.fillRect(0, 0, px, px);
    x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    fzRim(-0.35, -0.94, 0.85 * S, '#ffc77a', 0.85 * tw);
    fzRim(0.9, 0.42, 0.6 * S, '#ffb26b', 0.45 * tw);
  }
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
const FZ_TADA_IK = [[-6.6, 1.6, 1], [6.6, 1.6, 1]];          // fırlatmadan sonra yere inince "ta-da!" (önden, değişir)
const FZ_IKB = [[-6.6, 1.6, 0], [6.6, 1.6, 0]];              // o karede çizilen (karışmış) el hedefleri
const FZ_SEQ = [[4, 'wave'], [9.5, 'yawn'], [15, 'stretch'], [20.5, 'sit'], [26, 'look'], [31, 'wave']];   // uzun beklemede sırayla
const FZ_ACT = { wave: 2.8, yawn: 2.7, stretch: 2.5, look: 2.2, nod: 3.2 };
function fezaInit() {
  P.a_pose = Object.assign({}, FZ_REST); P.a_pv = {}; for (const k of FZ_KEYS) P.a_pv[k] = 0; P.a_R = Object.assign({}, FZ_REST);
  P.a_t = 0; P.a_face = P.f; P.a_side = P.f; P.a_turnU = 1; P.a_turnTo = P.f; P.a_turnDur = 0.16; P.a_front = false; P.a_fu = 0; P.a_state = 'idle'; P.a_sw = 1; P.a_wasG = P.ground; P.a_prevVy = 0;
  P.a_landT = 9; P.a_landP = 0; P.a_take = 0; P.a_skid = 0; P.a_skidDir = 1; P.a_idle = 0; P.a_waveDir = 1;
  P.a_lookT = 1.2; P.a_look = 0; P.a_blink = 2.5; P.a_lidM = 1; P.a_spin = 0;
  P.a_hx = P.a_hy = P.a_hvx = P.a_hvy = 0; P.a_hipY = -(FZ_TH + FZ_SH + FZ_FT); P.a_hipV = 0;
  P.a_ph = 0; P.a_launch = 0; P.a_launchBig = false; P.a_stomp = 0; P.a_cheerT = 9; P.a_cheerO = null; P.a_cheerDir = 1;
  P.a_push = 0; P.a_bump = 0; P.a_carryT = 9; P.a_wasCarry = false; P.a_ox = 0; P.a_oy = 0; P.a_elX = P.x; P.a_elY = P.y; P.a_tutun = 0;
  P.a_act = ''; P.a_actT = 0; P.a_seq = 0; P.a_nextAct = FZ_SEQ[0][0]; P.a_sit = 0; P.a_edgeT = 0; P.a_edge = 0;
  P.a_bal = 0; P.a_balKick = 0; P.a_awe = 0; P.a_big = null;
  P.a_tadaT = 9; P.a_fromL = false; P.a_ledge = 0; P.a_ledgeW = 0; P.a_ledgeOx = 0; P.a_stepN = 0;
}

// ── oyun olayları → animasyon ──
if (typeof OLAY !== 'undefined') {
  OLAY.on('ziplatti', o => { if (!P.a_pose) return; P.a_launch = 1; P.a_launchBig = !!(o && o.tip === 'buyukPofuduk'); P.a_stomp = 0; P.a_sit = 0; P.a_fromL = true; });
  OLAY.on('uyandi', o => { if (!P.a_pose || !o || o.tip !== 'pofuduk' || Math.abs(o.x - P.x) > 90 || P.ground) return; P.a_stomp = 1; });
  const sevin = o => {
    if (!P.a_pose || !o || Math.abs(o.x - P.x) > 300) return;
    P.a_cheerT = 0; P.a_cheerO = o; P.a_cheerDir = Math.sign(o.x - P.x) || P.f; P.a_sit = 0; P.a_act = '';
  };
  OLAY.on('cicek', sevin); OLAY.on('tohum', sevin);
  OLAY.on('carpti', o => { if (!P.a_pose || !o) return; if (P.a_push <= 0) P.a_bump = 1; P.a_push = 0.2; });
  OLAY.on('kurtarildi', () => { if (!P.a_pose) return; P.a_carryT = 0; P.a_fromL = false; P.a_oy = -50; P.a_sit = 0; P.a_act = ''; });
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
    const ex = s > 0 ? (cx + 1) * T : cx * T, dist = (ex - P.x) * s; P.a_edgeX = ex;           // kenara uzaklık (eksi = kenarın ötesinde)
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
    P.a_landT = 0; P.a_landP = P.a_wasCarry ? 0.34 : clamp(P.a_prevVy / 850, 0.18, 0.88) * (1 - 0.22 * clamp((sp - 120) / 130, 0, 1));   // koşarak inişte daha az çöker
    if (fzMover()) P.a_balKick = 1;
    if (P.a_fromL) { P.a_tadaT = 0; P.a_fromL = false; }
    if (!P.a_wasCarry) { P.a_pose.air = Math.min(P.a_pose.air, 0.15); P.a_pv.air = Math.min(P.a_pv.air, 0); }   // ayak yere değince kalça hemen yere göre (iniş yumuşak ama gecikmesiz)
    if (!P.a_wasCarry) OLAY.emit('adim', { x: P.x, y: P.y, hiz: sp, inis: true });   // parmak ucuyla yumuşak iniş
  }
  if (!gr && P.a_wasG && vy < -300 && P.a_launch <= 0 && P.a_stomp <= 0) { P.a_take = 1; P.a_takeP = clamp(-vy / 730, 0.5, 1.25); }   // ne kadar hızlı kalkarsa o kadar uzar
  P.a_wasG = gr; P.a_prevVy = vy; P.a_wasCarry = carry;
  P.a_landT += dt; P.a_tadaT += dt; P.a_take = Math.max(0, P.a_take - dt / 0.18);
  if (gr) { P.a_launch = 0; P.a_stomp = 0; }
  P.a_launch = Math.max(0, P.a_launch - dt / (P.a_launchBig ? 1.05 : 0.8));
  P.a_stomp = Math.max(0, P.a_stomp - dt / 0.55);
  P.a_push = Math.max(0, P.a_push - dt); P.a_bump = Math.max(0, P.a_bump - dt / 0.3);
  P.a_balKick = Math.max(0, P.a_balKick - dt / 1.1);
  P.a_cheerT += dt;
  const cheer = P.a_cheerT < 1.9 && P.a_cheerO;
  if (P.a_tadaT < 1.1 && (!gr || (sp > 60 && (P.a_tadaT > 0.14 || (typeof axis !== 'undefined' && axis !== 0))) || cheer)) P.a_tadaT = 9;   // koşmaya devam ederse ta-da yok (inişteki kısa kayma sayılmaz)   // koşmaya devam ederse ta-da yok
  const tada = P.a_tadaT < 1.1;
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
  P.a_getup = Math.max(0, (P.a_getup || 0) - dt);
  if (!still) { if (P.a_sit > 0.5) P.a_getup = 0.5; P.a_act = ''; P.a_seq = 0; P.a_nextAct = FZ_SEQ[0][0]; P.a_sit = 0; P.a_ledge = 0; }
  else if (!P.a_act && !cheer && !oops && !tada && P.a_idle >= P.a_nextAct) {
    let a;
    if (P.a_seq < FZ_SEQ.length) { a = FZ_SEQ[P.a_seq++][1]; P.a_nextAct = P.a_seq < FZ_SEQ.length ? FZ_SEQ[P.a_seq][0] : P.a_idle + 7; }
    else { a = ['wave', 'yawn', 'stretch', 'nod', 'look'][Math.floor(Math.random() * 5)]; P.a_nextAct = P.a_idle + 6 + Math.random() * 4; }
    if (edge && !P.a_sit && a !== 'wave') a = 'sit';              // uçurum kenarında bir süre: kenara oturup ayaklarını sallar
    if (P.a_ledge && (a === 'stretch' || a === 'yawn')) a = 'nod';  // kenarda otururken önden poz yok
    if (a === 'sit' && P.a_sit) a = 'look';
    if (a === 'nod' && !P.a_sit) a = 'look';
    if (a === 'sit') { P.a_sit = 0.001; P.a_ledge = edge ? Math.sign(edge) : 0; } else { P.a_act = a; P.a_actT = 0; }
    if (a === 'wave') P.a_waveDir = P.a_sit > 0 ? P.a_side : Math.sign(D.x - P.x) || P.f;   // otururken dönmez (kalça kayardı)
  }
  if (P.a_act) { P.a_actT += dt; if (P.a_actT > FZ_ACT[P.a_act]) P.a_act = ''; }
  if (P.a_sit > 0) P.a_sit += dt;
  const act = still ? P.a_act : '';
  // yön: dönüşte genişlik sıfırdan geçerek yumuşak çevrilir
  let ft = P.f;
  if (P.a_skid > 0) ft = P.a_skidDir;
  else if (P.a_ledge && P.a_sit > 0) ft = P.a_ledge;
  else if (act === 'wave') ft = P.a_waveDir;
  else if (still && cheer && Math.abs(P.a_cheerO.x - P.x) > 14) ft = P.a_cheerDir;
  if (P.a_turnU >= 1 && ft !== P.a_side) { P.a_turnU = 0; P.a_turnTo = ft; P.a_turnDur = sp > 60 || !gr ? 0.1 : 0.16; }
  else if (P.a_turnU < 1 && ft !== P.a_turnTo) { P.a_turnTo = ft; P.a_turnU = 1 - P.a_turnU; }   // yarıda vazgeçti
  if (P.a_turnU < 1) {
    P.a_turnU = Math.min(1, P.a_turnU + dt / P.a_turnDur);
    if (P.a_turnU >= 0.5 && P.a_side !== P.a_turnTo) {   // ayna çevirme (önden görünüşün içinde, görünmez)
      P.a_side = P.a_turnTo; P.a_pose.gx = -P.a_pose.gx; P.a_pv.gx = -P.a_pv.gx; P.a_hx = -P.a_hx; P.a_hvx = -P.a_hvx;
    }
  }
  P.a_face = P.a_side;
  const sd = P.a_side;
  // kameraya bakma: aynı geçiş (önce gözler, kısa daralma, önden görünüş; dönüşte geri)
  if (P.a_turnU < 1) P.a_fu = 0;
  else if (P.a_front) { if (P.a_fu > 0.5) P.a_fu = 1 - P.a_fu; if (P.a_fu < 0.5) P.a_fu = Math.min(0.5, P.a_fu + dt / 0.16); }   // çıkarken yeniden istenirse geri döner
  else if (P.a_fu > 0) { P.a_fu += (P.a_fu < 0.3 ? -1 : 1) * dt / 0.16; if (P.a_fu >= 1 || P.a_fu <= 0) P.a_fu = 0; }
  const lvx = P.vx * ft;
  // Pırıl'a bakış yönü (yerel)
  const gpx = clamp((D.x - P.x) * sd / 45, -1, 1), gpy = clamp((D.y - (P.y - 58)) / 45, -1, 1);
  // koşu adımı: yavaş yürüyüşte kısa adım, koşuda uzun adım (ayak kaymasın)
  const r = clamp(sp / 250, 0, 1);
  if (gr) P.a_ph += dt * 6.2832 * sp / lerp(64, 122, clamp((r - 0.45) / 0.55, 0, 1));
  {   // ayak basışı: bacak en önden geri dönmeye başlarken (her yarım döngüde bir ayak)
    const n = Math.floor((P.a_ph - 1.75) / Math.PI);
    if (n !== P.a_stepN) { P.a_stepN = n; if (gr && sp > 5 && P.a_skid <= 0) OLAY.emit('adim', { x: P.x, y: P.y, hiz: sp }); }
  }
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
  P.a_front = false; P.a_ikSrc = null;
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
      if (P.a_ledge && P.a_sit >= 0.35) {   // uçurum kenarında: popo kenarda, bacaklar boşlukta sallanır, eller kenarı tutar
        const w = Math.sin(t * 2.6), w2 = Math.sin(t * 2.6 + 2.4);
        T.lt1 = 1.48 + 0.06 * w; T.lt2 = -1.25 + 0.4 * w; T.bt1 = 1.42 + 0.06 * w2; T.bt2 = -1.25 + 0.4 * w2;
        T.lean = -0.05 + 0.012 * b; T.hx = -1.0;
        T.la1 = -0.22; T.la2 = 0.08; T.ba1 = -0.42; T.ba2 = 0.06; T.shr = 0.35;
        T.head = (lk === 1 ? -gpy * 0.16 : 0.06) - 0.02 * b; if (lk !== 1 && lk !== 2) { T.gy = 0.75; T.gx = 0.6; }
        T.mSmile = 1;
      } else if (P.a_sit < 0.5) {
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
      if (P.a_turnU >= 1 && at < 2.35) { P.a_front = true; P.a_ikSrc = FZ_GER_IK; }
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
    T.sq = 1; T.brow = -0.75; T.mSmile = 0.55; T.mRound = 0; T.mOpen = 0.4; T.gx = 1; T.gy = 0.1; T.head = -0.12;   // > < gözler, dişler sıkılı gülüş
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
    T.arm = lerp(1.6, 1, dn); T.la1 = lerp(2.62, 0.4, dn);   // el başın önünde-üstünde: Pırıl yüzünü örtmesin
    T.la2 = lerp(0.04, 0.4, dn); T.hOpen = 0;
    T.ba1 = lerp(-1.05 + 0.25 * Math.sin(t * 4.4), -0.1, dn); T.ba2 = lerp(0.5, 0.35, dn); T.shr = 0.6 * (1 - dn);
    T.lt1 = lerp(0.05 + 0.32 * sw, 0.06, dn); T.lt2 = lerp(-0.35 - 0.45 * Math.max(0, -sw), -0.05, dn);
    T.bt1 = lerp(-0.35 + 0.25 * sw2, -0.05, dn); T.bt2 = lerp(-0.4 - 0.45 * Math.max(0, -sw2), -0.08, dn);
    T.lean = lerp(-0.32 + 0.04 * Math.sin(t * 3.1), 0.02, dn); T.head = lerp(-0.28, 0.05, dn);
    T.gx = 1; T.gy = lerp(-0.6, 0.6, dn); T.mSmile = 1; T.mOpen = lerp(0.6, 0.3, dn); T.brow = 0.5; T.happy = cu > 0.15 && cu < 0.55 ? 1 : 0;
  } else if (st === 'launch') {   // minder / Büyük Pofuduk fırlattı: sevinçli yıldız pozu, sonra toparlanma
    const el = (1 - P.a_launch) * (P.a_launchBig ? 1.05 : 0.8), star = P.a_launchBig ? 0.42 : 0.32;
    T.air = 1; kmin = kmax = 26;
    if (el < star) {   // önden: kollar ve bacaklar iki yana açık (X)
      if (P.a_turnU >= 1) { P.a_front = true; P.a_ikSrc = FZ_STAR_IK; }
      T.spr = P.a_fu >= 0.3 ? 0.85 : 0; T.lt1 = 0.2; T.lt2 = -0.35; T.bt1 = 0.2; T.bt2 = -0.35; T.arm = 1.15;
      T.la1 = 2.3; T.la2 = 0.1; T.ba1 = -2.2; T.ba2 = 0; T.hOpen = 1; T.shr = 0.7;
      T.lean = 0; T.head = -0.1; T.happy = 1; T.mOpen = 0.75; T.mSmile = 1; T.brow = 0.6; T.sy = 1.04; T.sx = 0.97; T.gx = 0;
    } else {
      T.lt1 = 2.0; T.lt2 = -2.4; T.bt1 = 1.8; T.bt2 = -2.3;
      T.la1 = 0.7; T.la2 = 0.5; T.ba1 = 0.55; T.ba2 = 0.6; T.lean = 0.2; T.head = 0.2;
      T.happy = 1; T.mOpen = 0.8; T.mSmile = 1; T.brow = 0.3;
    }
  } else if (st === 'stomp') {   // uyuyan Pofuduk'un üstüne bastı: mutlu sekme
    T.air = 1; kmin = kmax = 26;
    T.lt1 = 1.35; T.lt2 = -2.0; T.bt1 = 1.0; T.bt2 = -1.9;
    T.arm = 1.15; T.la1 = 1.9; T.la2 = 0.45; T.ba1 = 1.75; T.ba2 = 0.4; T.hOpen = 1; T.shr = 0.6;
    T.lean = 0.05; T.head = 0.1; T.happy = 1; T.mOpen = 0.9; T.mSmile = 1; T.brow = 0.5; T.gy = 0.6;
  } else if (st === 'rise') {
    T.air = 1; T.lt1 = 1.35; T.lt2 = -1.95; T.bt1 = -0.2; T.bt2 = -0.6;
    T.la1 = -2.15; T.la2 = 0.3; T.hOpen = 1; T.ba1 = 1.2; T.ba2 = 0.35; T.shr = 0.8; T.lean = -0.04; T.head = -0.12;
    T.mOpen = 0.75; T.mSmile = 1; T.gx = 0.6; T.gy = -0.5; T.brow = 0.4; T.lid = 1.05;
  } else if (st === 'apex') {
    T.air = 1; T.lt1 = 1.0; T.lt2 = -1.5; T.bt1 = 0.25; T.bt2 = -0.9;
    T.la1 = -2.05; T.la2 = 0.4; T.ba1 = 1.25; T.ba2 = 0.45; T.shr = 0.5; T.lean = 0; T.head = -0.05;
    T.mOpen = 0.5; T.mSmile = 1; T.gx = 0.6; T.gy = 0.3; T.brow = 0.3;
  } else if (st === 'fall') {
    const f = clamp((vy - 170) / 600, 0.3, 1);
    T.air = 1; T.lt1 = 0.3 + 0.12 * Math.sin(t * 9); T.lt2 = -0.5; T.bt1 = -0.12 - 0.1 * Math.sin(t * 9 + 1); T.bt2 = -0.35;
    T.hOpen = 1; T.la1 = -2.15 + 0.3 * Math.sin(t * 13) * f; T.la2 = 0.5 + 0.2 * Math.sin(t * 11);
    T.ba1 = 1.35 + 0.2 * Math.sin(t * 13 + 2) * f; T.ba2 = 0.3; T.shr = 0.5;
    T.lean = 0.05; T.head = -0.04; T.mRound = 1; T.mOpen = 0.65; T.mSmile = 0.2;
    T.brow = 0.2 + 0.6 * f; T.lid = 1.12; T.gx = 0.5; T.gy = 0.7;
  } else {   // flip: Pırıl iter, toparlanıp ileri takla
    T.air = 1; T.lt1 = 2.05; T.lt2 = -2.45; T.bt1 = 1.85; T.bt2 = -2.35;
    T.la1 = 0.7; T.la2 = 0.5; T.ba1 = 0.55; T.ba2 = 0.6; T.lean = 0.25; T.head = 0.3;
    T.happy = 1; T.mOpen = 0.9; T.mSmile = 1; T.brow = 0.3;
  }
  if (P.a_getup > 0 && gr) { kmin = kmax = 6.5; T.lean += 0.15; }   // oturduğu yerden kalkarken acele etmeden
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
        P.a_front = true; P.a_ikSrc = FZ_SEV_IK;
        FZ_SEV_IK[0][0] = -12.4 - wv * 0.8; FZ_SEV_IK[1][0] = 12.4 - wv * 0.8; FZ_SEV_IK[0][1] = FZ_SEV_IK[1][1] = -25.5 + Math.abs(wv) * 0.8;
      }
      T.arm = 1.15; T.la1 = 1.9 + 0.1 * wv; T.la2 = 0.45; T.ba1 = 1.9 - 0.12 * wv; T.ba2 = 0.35; T.hOpen = 1; T.shr = 0.7;
      T.happy = 1; T.mOpen = 0.9; T.mSmile = 1; T.mRound = 0; T.brow = 0.5; T.head = -0.1; T.lean = st === 'run' ? T.lean : -0.04; T.lid = 1;
      if (still) { const hop = Math.abs(Math.sin(c2 * Math.PI / 0.4)) * (c2 < 1.2 ? 1 : 0); T.bob = -4.5 * hop; T.lt1 = 0.05 + 0.4 * hop; T.lt2 = -0.1 - 0.7 * hop; T.bt1 = 0.0 + 0.3 * hop; T.bt2 = -0.1 - 0.6 * hop; kmin = kmax = 30; }
    }
  }
  // fırlatıldıktan sonra yere inince: önden "ta-da!" (kollar iki yana-yukarı, parmak ucunda)
  if (tada && (st === 'idle' || st === 'edge' || st === 'run')) {
    const tt = P.a_tadaT, up = smooth(clamp((tt - 0.12) / 0.2, 0, 1)) * smooth(clamp((1.0 - tt) / 0.26, 0, 1));
    if (P.a_turnU >= 1 && tt > 0.06 && tt < 0.98) { P.a_front = true; P.a_ikSrc = FZ_TADA_IK; }
    const wg = Math.sin(tt * 16) * 0.5 * up;
    FZ_TADA_IK[0][0] = -lerp(6.6, 16.0, up) - wg; FZ_TADA_IK[1][0] = lerp(6.6, 16.0, up) + wg;
    FZ_TADA_IK[0][1] = FZ_TADA_IK[1][1] = lerp(1.6, -21.0, up); T.arm = lerp(1, 1.18, up);
    T.la1 = lerp(T.la1, 1.9, up); T.la2 = lerp(T.la2, 0.4, up); T.ba1 = lerp(T.ba1, 1.8, up); T.ba2 = lerp(T.ba2, 0.4, up); T.hOpen = 1; T.shr = 0.6 * up;
    T.happy = up > 0.25 ? 1 : 0; T.mOpen = 0.9 * up; T.mSmile = 1; T.mRound = 0; T.brow = 0.5 * up; T.head = -0.06 * up;
    T.bob = -1.6 * up; T.sy = 1 + 0.03 * up; T.sx = 1 - 0.02 * up; T.lt1 = lerp(T.lt1, 0.04, up); T.bt1 = lerp(T.bt1, -0.04, up); T.lt2 = lerp(T.lt2, -0.02, up); T.bt2 = lerp(T.bt2, -0.02, up);
    kmin = kmax = 18;
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
  const k = st === 'flip' ? lerp(16, 30, clamp(P.a_sw / 0.12, 0, 1)) : lerp(kmin, kmax, clamp(P.a_sw / 0.3, 0, 1)), cur = P.a_pose;
  if (P.a_turnU < 0.5) { T.gx = -1; T.gy = 0; }   // dönüşte önce gözler yeni yöne bakar
  // kritik sönümlü yay (tam çözüm): hareket yavaş başlar, yavaş biter — durum değişiminde hız sıçraması (pop) olmaz.
  // om = 1.7k: eski üstel yaklaşımla aynı sürede %90'a varır, en yüksek hızı ~%40 daha düşük.
  const om = 1.7 * k, ee = Math.exp(-om * dt), V = P.a_pv;
  for (const key of FZ_KEYS) {
    const x0 = cur[key] - T[key], c = (V[key] + om * x0) * dt;
    cur[key] = T[key] + (x0 + c) * ee; V[key] = (V[key] - om * c) * ee;
    const vm = FZ_VMAX[key];   // uzuvlar en çok ~0.37 rad/kare döner (60 Hz): uzak pozlara geçişte bile kol "ışınlanmaz"
    if (vm && Math.abs(V[key]) > vm) { const v2 = Math.sign(V[key]) * vm; cur[key] -= (V[key] - v2) * dt * 0.5; V[key] = v2; }
  }
  // göz kırpma (bazen çift)
  P.a_blink -= dt;
  if (P.a_blink < -0.13) P.a_blink = Math.random() < 0.2 ? 0.22 : 1.8 + Math.random() * 3;
  P.a_lidM += ((P.a_blink < 0 ? 0 : 1) - P.a_lidM) * (1 - Math.exp(-dt * 45));
  // çizim pozu = yumuşak poz + iniş çökmesi + kalkış uzaması + çarpma
  const R = Object.assign(P.a_R, cur), lt = P.a_landT;
  // kalkış uzaması iki karede yükselir (tek karede bacak düzelip kalça sıçramasın), sonra söner
  // iniş çökmesi fiziğe bağlı: kalça yere düşüş hızıyla değer ve hemen yavaşlamaya başlar. c(t) = p·A·(e^(-t/τ2) − e^(-t/τ1)):
  // ilk karede en hızlı çöker (dünyadaki kalça hızı düşüşten kesintisiz devam eder, sonra tekdüze yavaşlar; net iniş),
  // ~55 ms'de en dipte, ~0.13 sn zaman sabitiyle yumuşak kalkar. Sert inişte daha derin ve biraz daha çabuk.
  // Kalkış uzaması: 6.75 p (1-p)², kalkış hızıyla ölçekli (sonu yumuşak).
  const t1 = lerp(0.042, 0.032, P.a_landP), t2 = 0.13, tpk = Math.log(t2 / t1) * t1 * t2 / (t2 - t1);
  const lA = 1 / (Math.exp(-tpk / t2) - Math.exp(-tpk / t1)), tp = Math.pow(1 - P.a_take, 1.3);
  const cr = gr ? P.a_landP * lA * (Math.exp(-lt / t2) - Math.exp(-lt / t1)) : 0, tk = P.a_take > 0 ? 6.75 * tp * (1 - tp) * (1 - tp) * (P.a_takeP || 1) : 0;
  R.lt1 += 0.8 * cr; R.lt2 -= 1.5 * cr; R.bt1 += 0.6 * cr; R.bt2 -= 1.4 * cr; R.lean += 0.25 * cr; R.head += 0.12 * cr;
  R.la1 += 0.5 * cr; R.ba1 += 0.4 * cr; R.sx += 0.1 * cr; R.sy -= 0.08 * cr; R.lid *= 1 - 0.3 * cr;
  R.sy += 0.08 * tk; R.sx -= 0.06 * tk; R.lt1 -= 0.6 * tk * R.lt1; R.lt2 *= 1 - 0.7 * tk;
  const bu = P.a_bump * P.a_bump;   // Pofuduk'a tosladı: kısa geri sekme
  R.lean -= 0.3 * bu; R.head -= 0.2 * bu; R.sx += 0.06 * bu; R.sy -= 0.05 * bu; R.hx -= 1.2 * bu;
  const su = (1 - P.a_stomp) / 0.24, sb = P.a_stomp > 0 && su < 1 ? Math.sin(su * Math.PI) : 0;   // basınca kısa ezilme (3 karede iner, yumuşak döner)
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
  P.a_ledgeW += (((st === 'sit' && P.a_ledge && P.a_sit > 0.35) ? 1 : 0) - P.a_ledgeW) * (1 - Math.exp(-dt * 5));
  const hip = lerp(lerp(hipG, FZ_AIRHIP, R.air) + R.bob, -2.4, P.a_ledgeW);
  // popo kenarın tam üstüne gelsin (kalça yerel x ≈ hx)
  const lox = P.a_ledge && P.a_edgeX !== undefined ? clamp(P.a_edgeX - P.a_ledge * 2.5 - P.x - sd * FZ_SC * R.hx, -16, 16) : 0;
  P.a_hipV = (hip - P.a_hipY) / dt; P.a_hipY = hip;
  // taşınırken çizim kayması: yukarıdan sallanarak yavaşça iner (Pırıl P.a_elX/elY'deki ellere tutunabilir)
  {   // hedefe yumuşak yaklaşım: piril.js taşıma bitince süreyi ileri atlatsa da sıçrama olmaz
    const cu = carry ? clamp(P.a_carryT / FZ_CARRY, 0, 1) : 1, dk = 1 - Math.exp(-dt * 12);
    P.a_oy += (-50 * (1 - cu) * (1 - cu) - P.a_oy) * dk; P.a_ox += (Math.sin(t * 3.1) * 2.5 * (1 - cu) + lox * P.a_ledgeW - P.a_ox) * dk;
  }
  P.a_tasW = (P.a_tasW || 0) + (((typeof D !== 'undefined' && D.tasiyor) || carry ? 1 : 0) - (P.a_tasW || 0)) * (1 - Math.exp(-dt * 5));
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
    P.a_hvy += ((ty - P.a_hy) * 230 - P.a_hvy * 10) * h;
    P.a_hvx = clamp(P.a_hvx, -46, 46); P.a_hvy = clamp(P.a_hvy, -46, 46);   // fırlatmada bile saç bir karede sıçramasın
    P.a_hy += P.a_hvy * h;
  }
  P.a_hx = clamp(P.a_hx, -3.5, 3.5); P.a_hy = clamp(P.a_hy, -3.5, lim + 0.5);
  // önden pozlarda eller hedefe, önden görünüş belirdikten sonra yumuşakça gider (sıçrama olmasın)
  if (P.a_ikSrc) P.a_ikLast = P.a_ikSrc;
  P.a_ikW = (P.a_ikW || 0) + (((P.a_ikSrc && P.a_fu >= 0.3) ? 1 : 0) - (P.a_ikW || 0)) * (1 - Math.exp(-dt * 20));
  if (P.a_ikLast && (P.a_fu > 0 || P.a_ikW > 0.02)) {
    const w = P.a_ikW, src = P.a_ikLast;
    for (let i = 0; i < 2; i++) { const sd2 = i ? 1 : -1; FZ_IKB[i][0] = lerp(sd2 * 6.6, src[i][0], w); FZ_IKB[i][1] = lerp(1.6, src[i][1], w); FZ_IKB[i][2] = w > 0.5 ? src[i][2] : 0; }
    P.ik = FZ_IKB;
  } else { P.ik = null; P.a_ikW = 0; P.a_ikLast = null; }
}

// ── ara sahne çizimi: fezaCizPoz(ctx, x, y, olcek, poz, tm, ara) ──
// Herhangi bir dönüşümle verilen ctx'e çizer; oyundaki Feza'nın durumuna dokunmaz.
// olcek 1 = oyundaki boy (≈62 birim); eksi olcek aynalar. Pozlar:
//   'uyku'   : yatakta yan yatmış uyuyor, kucağında bir şeye sarılmış. x,y = yatağın üstünde, poposunun altındaki
//              nokta (kalça bunun ~5 birim solunda, baş daha solda; eksi olcek → baş sağda). ara(ctx, kx, ky, olcek) verilirse kolların ARKASINA, gövdenin önüne çizilir
//              (Pırıl peluşu için); kx,ky = kucak noktası (ctx koordinatında).
//   'uyanis' : tm = pozun başından beri geçen saniye. 0–1.1 sn yattığı yerden doğrulur, 1.1–2.4 gözlerini ovuşturur,
//              2.4–3.6 kollarını açıp esner/gerinir, 3.6–4.2 kollar iner ve kocaman gülümser (sonra öyle kalır).
//              x,y = uyku ile aynı nokta (geçiş kesintisiz). Otururken bacaklar önden kısa görünür: üstüne yorgan çizin.
//   'uykuya_dalis' : 'uyku' ile aynı yatış/sarılma; tm = başından beri saniye. Gözler açık ve ağır, 0.5–2.4 sn arası 3 yavaş
//              göz kırpma, 1.5–2.8 sn bir büyük iç çekiş (küçük "o" ağız), ~3.05 sn'de gözler kapanır; 3 sn'den sonra 'uyku' ile aynı görünür.
//   'bakis'  : 'uyku' ile aynı yatış/sarılma, gözler açık, yukarıdaki Pırıl'a hayranlıkla bakar (ara sıra kırpar).
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
  [2.9, 0, -12.6, -26.5, 12.6, -26.5, 0.05, 1.0, 0.9, 0, 0, -0.35, 0.8, 1],
  [3.6, 0, -13.0, -26.8, 13.0, -26.8, 0.05, 1.1, 0.9, 0, 0, -0.4, 0.8, 1],
  [4.2, 0, -8.2, 1.8, 8.2, 1.8, 1, 0.6, 0, 1, 0, 0.1, 0.5, 0],
  [9.9, 0, -8.2, 1.8, 8.2, 1.8, 1, 0.6, 0, 1, 0, 0.1, 0.5, 0]];
function fezaCizPoz(ctx, x, y, olcek, poz, tm, ara) {
  tm = tm || 0;
  const Q = fzCS, R = Object.assign(Q.a_R, FZ_REST);
  Q.ik = null; Q.ikUst = false; Q.ara = null; Q.a_hx = Q.a_hy = 0; Q.vy = 0;
  Q.a_lidM = ((tm + 1.5) % 3.9) < 0.12 ? 0 : 1;
  let front = true, lie = 0, seated = false;
  const b = Math.sin(tm * 2.2); R.breath = b; R.mSmile = 0.8;
  if (poz === 'uyku' || poz === 'uykuya_dalis' || poz === 'bakis') {
    lie = 1; seated = true; R.breath = Math.sin(tm * 1.5) * 1.4;
    R.lt1 = 0.9; R.lt2 = -1.3; R.bt1 = 0.8; R.bt2 = -1.2; R.lid = 0.05; Q.a_lidM = 1;
    R.mSmile = 0.4; R.mOpen = 0.1 + 0.05 * Math.sin(tm * 1.5); R.head = 0.3;
    if (poz === 'uykuya_dalis') {   // ağır kapaklar, 3 yavaş göz kırpma, ~3 sn'de kapanır; arada bir büyük iç çekiş (küçük "o" ağız)
      let lid = lerp(0.8, 0.45, clamp(tm / 2.6, 0, 1));
      for (let k = 0; k < 3; k++) { const u = (tm - 0.5 - k * 0.75) / 0.42; if (u > 0 && u < 1) lid = lerp(lid, 0.05, Math.sin(u * Math.PI)); }
      if (tm > 2.6) lid = lerp(lid, 0.05, smooth(clamp((tm - 2.6) / 0.45, 0, 1)));
      R.lid = lid; R.gy = 0.35 * (1 - lid); R.gx = 0.1; R.brow = 0.15 * (1 - clamp(tm / 3, 0, 1));
      const s = clamp((tm - 1.5) / 1.3, 0, 1), sg = Math.sin(s * Math.PI);   // iç çekiş: 1.5–2.8 sn
      R.breath += 2.4 * sg; R.mRound = sg > 0.35 ? 1 : 0; R.mOpen = lerp(R.mOpen, 0.42, sg > 0.35 ? sg : 0); R.mSmile = lerp(0.4, 0.15, sg);
    } else if (poz === 'bakis') {   // gözler açık, yukarıdaki parlayan Pırıl'a hayranlıkla bakar (yatarken ekranda yukarı = yerel +x)
      R.lid = 1.08; Q.a_lidM = ((tm + 0.7) % 3.4) < 0.13 ? 0 : 1; R.gx = 1; R.gy = -0.1;
      R.mRound = 0.55; R.mOpen = 0.45 + 0.06 * Math.sin(tm * 1.3); R.mSmile = 0.6; R.brow = 0.6; R.head = 0.15;
    }
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
    const gerin = smooth(clamp((tm - 2.5) / 0.4, 0, 1)) * smooth(clamp((4.0 - tm) / 0.4, 0, 1));
    Q.ik[0][2] = Q.ik[1][2] = gerin; R.arm = 1 + 0.27 * gerin;
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
    Q.ik = [[-12.6 + wv, -26 - hop * 1.2, 1], [12.6 - wv, -26 - hop * 1.2, 1]]; R.arm = 1.22;
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
    ctx.rotate(-1.5708 * lie);            // kalçanın alt-arka köşesi etrafında devrilir (kitap gibi)
    ctx.translate(6.6, -hip - 3.6);
  }
  const mm = ctx.getTransform(), inv = m0.inverse();
  const kucak = inv.multiply(mm).transformPoint(new DOMPoint(0, hip - 6.5));
  if (typeof ara === 'function') Q.ara = () => { ctx.save(); ctx.setTransform(m0); ara(ctx, kucak.x, kucak.y, olcek); ctx.restore(); };
  const eski = fzQ; fzQ = Q;
  try { if (front) fzDrawFront(ctx, tm); else fzDraw(ctx, tm); }
  finally { fzQ = eski; ctx.restore(); }
  return { x: kucak.x, y: kucak.y };
}

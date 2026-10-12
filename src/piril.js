/* piril.js – Pırıl (mor bebek ejderha, Ori'deki Sein gibi ışık veren rehber):
   davranış (stepDragon, dragonPush, dragonHappy, dragonCarry), ışık nefesi ('karanlik'), yol gösterme, tepkiler/sesler,
   çizim (drawDragon) ve ara sahne yardımcısı pirilCizPoz.
   Klasik script: üst düzey const/let/function'lar diğer dosyalarla ortak (ortak.js önce yüklenir). Özel adlar dr* ile başlar.
   Diğer modüller için dışa açık durum: D.tasiyor (Feza'yı taşıyor), D.pence {x,y} (pençelerin dünya konumu),
   D.mode, OLAY 'nefes' {asama:'basla'|'al'|'ver'|'bitti'}. */
'use strict';
const DR_TAIL_N = 9, DR_TAIL_LEN = 4.2;
const DR_COL = { pur: '#8550ee', purL: '#a77cff', purD: '#5c32bd', line: '#3a1a80', lav: '#ecdcff', lavD: '#cdb4f7',
  pink: '#ffb3e8', spine: '#f6a8ee', horn: '#fff1d6', hornD: '#e9cfa6', eye: '#2b1450', iris: '#7b46d8' };
const DR_NEFES = ['#fff6d6', '#d9f6ff', '#e8d6ff', '#ffffff', '#ffd6f2', '#bff4ff'];
const DR_IZ = ['#fff2a8', '#ffe0f6', '#e2ccff', '#ffffff'];
const DR_PAW = [-8, 16];  // taşırken Feza'nın elini tutan arka ayağın yerel konumu (kuş gibi)
const DR_HOLD = 0.12;    // taşırken P.fade bu değerde tutulur: fizik durur, Feza tam görünür (feza.js: fade<0.22 → opak)

function dragonInit() {
  if (D.init) return;
  D.init = true;
  D.face = D.f || 1;         // çizilen yan yön (±1)
  D.fs = D.face;             // yatay yerleşim çarpanı (dönüşte 0'a yaklaşır; çizimi inceltmez)
  D.tt = -1; D.fw = 0;       // dönüş ilerlemesi ve önden görünüş ağırlığı
  D.ft = D.f || 1;           // hedef yön
  D.tilt = 0; D.ph = 0; D.flapRate = 3.2; D.glide = 0; D.bob = 0;
  D.expr = 'normal'; D.exprT = 0; D.hop = 0;
  D.lookX = 1; D.lookY = 0.3; D.headTilt = 0; D.headRoll = 0;
  D.trail = []; D.fx = []; D.fxT = 0;
  D.nextOrbit = 4; D.pushHit = false; D.pose = 0;  // pose: 0 normal, 1 itme (kollar yukarı)
  // yüz ve gövde ayrıntıları
  D.puff = 0; D.blowM = 0; D.mouth = 0; D.talkT = 0; D.yawnT = -1; D.yawn = 0; D.yawned = false;
  D.stretch = 0; D.fold = 0; D.grip = 0; D.plush = 0; D.glowA = 1; D.eyeOv = null; D.eyeOvR = null; D.lid = 1;
  D.beckon = 0; D.beckonW = 0; D.mk = 'smile'; D.ma = 0;
  D.lookAt = { x: 0, y: 0 }; D.lookAtT = 0; D.tiltWant = null; D.faceHold = 0; D.lockF = 0;
  // ışık nefesi, yol gösterme, tepkiler
  D.nf = []; D.nfQ = []; D.nfA = 0; D.iz = []; D.pulse = []; D.izT = 0;
  D.guideCd = 18; D.yolSayT = -99; D.wrongT = 0; D.playCd = 10; D.yayCd = 0; D.kurtarT = -99;
  D.bayrak = {}; D.nCicek = 0; D.since = 0; D.praiseK = 0; D.praiseT = -99; D.wowO = null; D.gosterO = null; D.danceAfter = false;
  D.tasiyor = false; D.pence = { x: D.x, y: D.y + 12 };
  D.falls = []; D.assistCd = 0; D.stuckT = 0; D.jumps = 0; D.bestD = 1e9; D.bestH = null; D.yardim = false;
  D.tail = [];
  for (let i = 0; i < DR_TAIL_N; i++) D.tail.push({ x: D.x - D.f * (8 + i * DR_TAIL_LEN), y: D.y + 6 });
}

// yerel (ejderha) koordinatından dünyaya
function drLocal(lx, ly) {
  const sx = D.fs, c = Math.cos(D.tilt), s = Math.sin(D.tilt);
  return { x: D.x + sx * (lx * c - ly * s), y: D.y + D.bob + lx * s + ly * c };
}
function drMouthPos() {   // ağzın dünya konumu (baş eğimi ve şişkinlik dahil)
  const ht = D.headTilt, c = Math.cos(ht), s = Math.sin(ht);
  const lx = 4.5 + 14 * c - 4 * s, ly = -9 + 14 * s + 4 * c;
  return drLocal(lx * (1 + 0.15 * D.puff), ly * (1 + 0.12 * D.puff));
}
function drResetTail() {
  const r = drLocal(-7, 6);
  for (let i = 0; i < D.tail.length; i++) { D.tail[i].x = r.x - D.ft * i * DR_TAIL_LEN; D.tail[i].y = r.y + i * 1.5; }
}
function drHandOff() {   // Feza'nın tutunduğu elin ayağa göre yeri (feza.js P.a_elX/elY verir; yoksa tahmin)
  if (!D.hOff) D.hOff = { x: P.f * 12, y: -74 };
  if (P.a_elX !== undefined && P.rx !== undefined && P.fade > 0 && P.respawned) {
    const hx = P.a_elX - P.rx, hy = P.a_elY - P.ry;
    if (Math.abs(hx) < 40 && hy < -30 && hy > -110) { D.hOff.x = lerp(D.hOff.x, hx, 0.35); D.hOff.y = lerp(D.hOff.y, hy, 0.35); }
  }
  return D.hOff;
}
function drSparkle(x, y, n, spd) { burst(x, y, n, ['#d9b8ff', '#ffd6f2', '#ffffff'], spd, 0.8, 7); }
function drMode(m) { D.mode = m; D.modeT = 0; }
function drSay(k, opt) { if (typeof SES !== 'undefined' && SES && SES.soyle) { try { SES.soyle(k, opt); } catch (e) {} } }
function drSfx(k, v) { if (typeof AU !== 'undefined' && AU && AU.sfx) { try { AU.sfx(k, v); } catch (e) {} } }
function drFree() { return D.mode === 'follow' || D.mode === 'orbit'; }
function drBusy() { return D.mode === 'push' || D.mode === 'tasi' || D.mode === 'dalis' || D.mode === 'nefes' || D.mode === 'yardim'; }
function drPlaying() { return DURUM === 'oyun' && P.fade <= 0 && !(P.kilit > 0); }
function drGlow(x, col, px, py, r, a) { x.globalAlpha = a; x.drawImage(glow(col), px - r, py - r, r * 2, r * 2); x.globalAlpha = 1; }

// ── olaylar (oyun.js çağırır) ──
function dragonPush() {     // havada ikinci zıplama: Pırıl hızla süzülüp Feza'nın ayaklarının altından iter
  dragonInit();
  if (D.mode === 'tasi' || D.mode === 'nefes') return;
  D.mode = 'push'; D.modeT = 0; D.sx0 = D.x; D.sy0 = D.y; D.pushHit = false;
  D.dashT = clamp(Math.hypot(D.x - P.x, D.y - P.y - 23) / 700, 0.1, 0.2);
  D.expr = 'effort'; D.exprT = 0.6; D.yawnT = -1; D.beckonW = 0;
  drSparkle(D.x, D.y, 6, 60);
  drSfx('dbl');
}
function dragonHappy(target) {   // çiçek açıldı / ağaç yandı (target: {x, y})
  dragonInit();
  if (D.mode === 'tasi' || D.mode === 'dalis' || D.mode === 'nefes') return;
  const tree = (typeof TREE !== 'undefined' && target === TREE);
  D.mode = 'happy'; D.modeT = 0; D.hphase = 0; D.yawnT = -1; D.beckonW = 0;
  // Feza'nın yüzünü kapatmasın: çiçeğin Feza'dan uzak tarafında dön
  const side = Math.abs(target.x - P.x) > 6 ? Math.sign(target.x - P.x) : P.f;
  D.hside = side; D.hx = target.x + (tree ? 0 : side * 46); D.hy = target.y - (tree ? 230 : 38); D.hr = tree ? 64 : 26;
  D.expr = 'happy'; D.exprT = 3;
}
function dragonCarry() {   // oyun.js Feza'yı güvenli yere koydu: Pırıl onu sudan çıkarıp oraya UÇARAK taşır
  dragonInit();
  D.safeX = P.x; D.safeY = P.y;
  const fx = D.fallX !== undefined ? D.fallX : P.x;
  // aynı yerde tekrar tekrar düştüyse: ileriye, hedefe doğru bir sonraki güvenli yere taşı
  D.yardim = false;
  if (D.tekrarDus && D.assistCd <= 0) {
    const tg = drAssistTarget(P.x, P.y);
    if (tg) { D.safeX = tg.x; D.safeY = tg.y; D.yardim = true; D.yardimSoz = true; D.assistCd = 35; D.falls.length = 0; }
  }
  P.x = fx; P.y = ROWS * T + 260; P.vx = P.vy = 0; P.fade = DR_HOLD;   // tutulana dek ekranın altında
  drMode('tasi'); D.tp = 0; D.tasiyor = true; D.grabbed = false; D.wasFall = true;
  D.expr = 'effort'; D.exprT = 1; D.yawnT = -1; D.beckonW = 0;
}

// ── tepkiler, sesler ──
function drPraise() {
  if (D.t - D.praiseT < 14) return false;
  let k = 1 + Math.floor(Math.random() * 6); if (k === D.praiseK) k = k % 6 + 1;
  D.praiseK = k; D.praiseT = D.t; drSay('p_aferin' + k, { oncelik: 0 }); return true;
}
function drSayKurtar() { if (D.t - D.kurtarT > 25) { D.kurtarT = D.t; drSay('p_kurtar'); } else if (D.yardimSoz) { D.praiseT = -99; drPraise(); } D.yardimSoz = false; }
function drBuyuk() { if (D.buyukO === undefined) D.buyukO = NESNELER.find(n => n.tip === 'buyukPofuduk') || null; return D.buyukO; }
OLAY.on('konusma', v => { dragonInit(); if (v && v.kim === 'p') D.talkT = Math.max(D.talkT, v.sure || 2); });
OLAY.on('cicek', o => {
  dragonInit(); D.nCicek++;
  if (D.nCicek === 1) { drSay('p_cicek_ilk'); D.since = 0; return; }
  if (o && o.buyukIcin) return;   // Büyük Pofuduk aşamaları kendi cümlelerini söyler
  D.since++;
  if ((D.since >= 3 && Math.random() < 0.5) || D.since >= 5) { if (drPraise()) D.since = 0; }
});
OLAY.on('uyandi', o => {
  dragonInit(); if (!o) return;
  if (o.tip === 'buyukPofuduk') { D.wowO = o; D.gosterO = null; return; }
  if (!D.bayrak.uyandi) { D.bayrak.uyandi = true; drSay('p_uyandi'); }
  else if (Math.random() < 0.3) drPraise();
  if (!drBusy()) dragonHappy({ x: o.x, y: o.y - 24 });
});
OLAY.on('tohum', o => {
  dragonInit();
  if (!D.bayrak.tohum) { D.bayrak.tohum = true; drSay('p_tohum'); } else if (Math.random() < 0.35) drPraise();
  if (o && !drBusy()) dragonHappy({ x: o.x, y: o.y });
});
OLAY.on('buyukAsama', v => {
  dragonInit(); if (!v) return;
  const k = ['', 'p_buyuk_goz', 'p_buyuk_esne', 'p_buyuk_kalk'][v.asama];
  if (k && !D.bayrak[k]) { D.bayrak[k] = true; drSay(k); }
  if (v.o) D.wowO = v.o;
  // sonra sıradaki açılmamış çiçeği göster (Feza okuyamaz: görsel ipucu)
  if (v.asama < 3) D.gosterO = true;
});
OLAY.on('kurtarildi', () => { dragonInit(); if (D.mode !== 'tasi') drSayKurtar(); });
OLAY.on('dustu', () => {
  dragonInit();
  if (D.mode === 'tasi') return;
  D.fallX = P.x;
  for (let i = D.falls.length - 1; i >= 0; i--) if (D.t - D.falls[i].t > 90) D.falls.splice(i, 1);
  D.tekrarDus = D.falls.some(f => Math.abs(f.x - P.x) < 280);
  D.falls.push({ x: P.x, t: D.t }); drMode('dalis'); D.splashed = false;
  D.expr = 'effort'; D.exprT = 2.5; D.yawnT = -1; D.beckonW = 0; D.tasiyor = false;
});
OLAY.on('ziplatti', o => {
  dragonInit();
  const big = !!(o && o.tip === 'buyukPofuduk');
  if (!big && D.yayCd > 0) { if (!drBusy()) { D.expr = 'happy'; D.exprT = Math.max(D.exprT, 0.8); } return; }
  if (!(drFree() || D.mode === 'yol' || D.mode === 'oyna' || D.mode === 'merak')) return;
  drMode('yay'); D.yayDur = big ? 1.7 : 1.0; D.yayBig = big; D.yayDir = Math.random() < 0.5 ? 1 : -1;
  D.ya0 = Math.atan2(D.y - (P.y - 40), D.x - P.x); D.expr = 'wow'; D.exprT = 0.35; D.yayCd = big ? 0 : 7;
  drSparkle(D.x, D.y, 8, 90);
});
OLAY.on('ziplama', () => { dragonInit(); D.jumps++; });
OLAY.on('agac', () => { dragonInit(); D.danceAfter = true; });
OLAY.on('durum', d => { dragonInit(); if (d === 'final') D.danceAfter = true; });
OLAY.on('kayboldu', () => { dragonInit(); if (drPlaying() && drFree() && D.guideCd <= 0) drGuide(); });
OLAY.on('aydinlat', () => {   // başka yerden gelirse de nilüfer cümlesi bir kez
  dragonInit();
  if (D.mode !== 'nefes' && !D.bayrak.nilufer) { D.bayrak.nilufer = true; setTimeout(() => drSay('p_nilufer'), 1200); }
});

// ── yol gösterme ──
function drGoalOpen(o) {
  return (o.tip === 'cicek' && !o.done) || (o.tip === 'buyukPofuduk' && !o.uyandi) ||
    (o.tip === 'agac' && !(typeof TREE !== 'undefined' && TREE && TREE.done)) || (o.tip === 'karanlik' && !o.lit);
}
function drHedef() {
  let h = null;
  try { if (typeof HEDEF === 'function') h = HEDEF(); } catch (e) {}
  for (const o of NESNELER) if (o.tip === 'karanlik' && !o.lit && o.x > P.x - 200 && (!h || o.x < h.x)) h = o;
  // Büyük Pofuduk uyumuyorsa önce onun çiçekleri
  if (h && h.tip === 'buyukPofuduk') { let b = null; for (const o of NESNELER) if (o.buyukIcin && !o.done && (!b || Math.abs(o.x - P.x) < Math.abs(b.x - P.x))) b = o; if (b) h = b; }
  if (h && h.x < P.x - 450) {   // geride kalmış isteğe bağlı çiçek: öndekini seç
    let best = null; for (const o of NESNELER) if (drGoalOpen(o) && o.x > P.x - 150 && (!best || o.x < best.x)) best = o;
    if (best) h = best;
  }
  return h;
}
function drGoalToward(sg) { for (const o of NESNELER) if (drGoalOpen(o) && (o.x - P.x) * sg > 0 && Math.abs(o.x - P.x) < 700) return true; return false; }
function drGoalY(h) { return h.y - (h.tip === 'buyukPofuduk' ? 170 : h.tip === 'agac' ? 230 : h.tip === 'karanlik' ? 70 : 40); }
function drGuide(h0) {
  const h = h0 || drHedef(); if (!h) return false;
  let gx = h.x, gy = drGoalY(h);
  const lim = VW * 0.4, dx = gx - P.x;
  D.yolUzak = Math.abs(dx) > lim;
  if (D.yolUzak) { gx = P.x + Math.sign(dx) * lim; gy = P.y - 120; }
  gx = clamp(gx, cam.x + 50, cam.x + VW - 50); gy = clamp(gy, cam.y + 60, cam.y + VH - 70);
  D.gx = gx; D.gy = gy; D.gO = h; D.gDir = Math.sign(gx - P.x) || P.f;
  drMode('yol'); D.yp = 0; D.guideCd = 28; D.wrongT = 0; D.yawnT = -1;
  D.expr = 'happy'; D.exprT = 0.6;
  if (!h0 && D.t - D.yolSayT > 45) { D.yolSayT = D.t; drSay('p_yol', { oncelik: 0 }); }
  return true;
}
function drPulse(x, y, r, n) { for (let i = 0; i < n; i++) D.pulse.push({ x, y, r, t: -i * 0.45, life: 1.4 }); }

// ── takılınca yardım: hedefe doğru bir sonraki güvenli yere uçarak taşı ──
function drSurfaceAt(x, y0) {   // x sütununda y0'ın biraz üstünden aşağı ilk basılabilir yüzey (yoksa null)
  const c = Math.floor(x / T);
  for (let r = Math.max(1, Math.floor(y0 / T) - 1); r < ROWS; r++) { const v = cell(c, r); if ((v === 1 || v === 2) && cell(c, r - 1) === 0) return r * T; }
  return null;
}
function drStandOk(x, y) {   // düz ve boş mu (uyuyan Pofuduk gibi katı cisimlerin içine konmasın)
  if (drSurfaceAt(x - 16, y - 30) !== y || drSurfaceAt(x + 16, y - 30) !== y) return false;
  if (typeof CISIMLER !== 'undefined') for (const o of CISIMLER) { const c = o.cisim; if (c && c.aktif && c.tip !== 'ustten' && Math.abs(o.x - x) < c.w / 2 + 36 && y > o.y - c.h - 20 && y < o.y + 40) return false; }
  return true;
}
function drAssistTarget(px, py) {
  const h = drHedef(); if (!h) return null;
  const dir = Math.sign(h.x - px) || P.f;
  if (Math.abs(h.x - px) < 13 * T) {   // hedef yakınsa doğrudan onun yanına
    for (const off of [-dir * 44, -dir * 84, dir * 44, 0]) {
      const x = h.x + off, y = drSurfaceAt(x, h.y - 20);
      if (y !== null && Math.abs(y - h.y) < 70 && drStandOk(x, y)) return { x, y };
    }
  }
  const c0 = Math.floor(px / T);
  let gap = false;
  for (let i = 1; i <= 16; i++) {
    const x = (c0 + dir * i) * T + T / 2;
    const y = drSurfaceAt(x, py - 7 * T);
    if (y === null || y > py + 50) { gap = true; continue; }
    if (i >= 3 && (gap || y < py - 45) && drStandOk(x, y)) return { x, y };
  }
  return null;
}
function drCarryStart(tx, ty) {   // Feza'yı bulunduğu yerden (tx,ty)'ye taşı (yardım)
  D.safeX = tx; D.safeY = ty; D.yardim = true;
  P.fade = DR_HOLD; P.respawned = true; P.vx = P.vy = 0; P.kilit = Math.max(P.kilit || 0, 0.3);
  drMode('tasi'); D.tasiyor = true; D.grabbed = true; D.wasFall = false;
  D.pA = { x: P.x, y: P.y }; D.pE = { x: tx, y: ty };
  D.cpx = P.x; D.cpy = P.y;
  const dist = Math.hypot(D.pE.x - D.pA.x, D.pE.y - D.pA.y);
  D.pC = { x: lerp(D.pA.x, D.pE.x, 0.5), y: Math.min(D.pA.y, D.pE.y) - 80 - Math.abs(D.pE.x - D.pA.x) * 0.12 };
  D.tDur = clamp(1.0 + dist / 560, 1.3, 2.6);
  D.tDir = Math.abs(D.pE.x - D.pA.x) > 20 ? Math.sign(D.pE.x - D.pA.x) : P.f;
  drSparkle(P.x, P.y - 40, 12, 90);
  drSfx('dbl');
}
function drEncourage() { if (D.t - D.kurtarT > 25) { D.kurtarT = D.t; drSay('p_kurtar'); } else { D.praiseT = -99; drPraise(); } }

// ── ışık nefesi: Feza karanlık yere gelince Pırıl derin nefes alıp gölün üstüne ışık üfler ──
TUR.kaydet('karanlik', {
  kur(o) { o.lit = false; },
  dokun(o) { if (o.lit) return; dragonInit(); drBreathStart(o); },
  ciz(o, tm) {   // henüz aydınlanmamış yer: davet eden çok hafif nabız (sebep → sonuç)
    if (o.lit || DURUM !== 'oyun') return;
    const d = Math.abs(P.x - o.x); if (d > 700) return;
    const pu = 0.5 + 0.5 * Math.sin(tm * 2.6);
    g.globalCompositeOperation = 'lighter';
    drGlow(g, '#b88aff', o.x + 30, o.y - 30, 60 + pu * 14, 0.10 + pu * 0.08);
    g.globalCompositeOperation = 'source-over';
  },
});
function drBreathStart(o) {
  o.lit = true;
  const ns = NESNELER.filter(n => n.tip === 'nilufer' && n.grup === o.grup);
  let cx = o.x + P.f * 300, wy = o.y + 60, first = null;
  if (ns.length) {
    cx = 0; wy = 0; for (const n of ns) { cx += n.x; wy += n.y; } cx /= ns.length; wy /= ns.length;
    first = ns.reduce((a, b) => Math.abs(a.x - o.x) < Math.abs(b.x - o.x) ? a : b);
  }
  const dir = Math.sign(cx - o.x) || 1;
  D.nfO = o; D.nfDir = dir; D.nfL = ns;
  D.nfX = o.x + dir * 40; D.nfY = Math.min(o.y - 150, P.y - 150);
  D.nfAx = first ? lerp(first.x, cx, 0.3) : cx; D.nfAy = wy;
  D.nfDone = false; D.np = 0; D.trail.length = 0; D.yawnT = -1; D.beckonW = 0;
  drMode('nefes');
  P.kilit = Math.max(P.kilit || 0, 3.1);
  if (Math.abs(P.vx) < 5) P.f = dir;
  D.expr = 'happy'; D.exprT = 0.5;
  OLAY.emit('nefes', { asama: 'basla', o });
}
function drBreathParticles(dt, rate, mo, ang) {
  const n = Math.floor(rate * dt + Math.random());
  for (let i = 0; i < n; i++) {
    const a = ang + (Math.random() - 0.5) * 0.42, s = 330 + Math.random() * 260, k = Math.random() < 0.12 ? 2 : 0;
    const l = 0.9 + Math.random() * 0.7;
    D.nf.push({ k, x: mo.x + Math.cos(a) * 3, y: mo.y + Math.sin(a) * 3, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: l, max: l,
      size: k ? 3 + Math.random() * 2.5 : 7 + Math.random() * 10, col: DR_NEFES[(Math.random() * DR_NEFES.length) | 0] });
  }
}

// ── davranış ──
function stepDragon(dt) {
  dragonInit();
  D.t += dt; D.modeT += dt;
  const wx = Math.sin(D.t * 0.71) * 9 + Math.sin(D.t * 1.93) * 3, wy = Math.sin(D.t * 1.31) * 5 + Math.sin(D.t * 0.53) * 4;
  let tx = P.x - P.f * 40 + wx, ty = P.y - 112 + wy;
  let k = 28, damp = 8.5, direct = false, hopW = 0, flapW = 0, rollW = 0;
  D.tiltWant = null; D.grip = lerp(D.grip, D.mode === 'tasi' && D.grabbed ? 1 : 0, 1 - Math.exp(-dt * 14));
  D.guideCd -= dt; D.playCd -= dt; D.yayCd -= dt; D.lookAtT -= dt; D.faceHold -= dt;

  // ── kendiliğinden davranışlar (yalnız serbestken) ──
  if (P.idle < 1) D.nextOrbit = 4;
  if (P.idle < 0.5) D.yawned = false;
  const playing = drPlaying();
  if (D.danceAfter && drFree() && (DURUM === 'oyun' || DURUM === 'final')) drMode('dans');
  if (playing && drFree()) {
    if (D.wowO) {   // Büyük Pofuduk kıpırdadı: şaşkın bakış
      D.lookAt.x = D.wowO.x; D.lookAt.y = D.wowO.y - 90; D.lookAtT = 1.6; D.expr = 'wow'; D.exprT = 1.4; D.wowO = null; D.wowWait = 1.3;
    } else if (D.gosterO && (D.wowWait = (D.wowWait || 0) - dt) <= 0) {   // sıradaki çiçeği göster
      D.gosterO = null; let b = null;
      for (const o of NESNELER) if (o.buyukIcin && !o.done && (!b || Math.abs(o.x - P.x) < Math.abs(b.x - P.x))) b = o;
      if (b) drGuide(b);
    }
  }
  if (playing && drFree()) {
    // yol kaybı: uzun süre durmak ya da hedefin tersine yürümek
    const h = drHedef();
    if (h) {
      const dx = h.x - P.x, away = Math.abs(dx) > 280 && P.vx * Math.sign(dx) < -60;
      if (away && !drGoalToward(Math.sign(P.vx))) D.wrongT += dt; else D.wrongT = Math.max(0, D.wrongT - dt * 0.7);
      const far = Math.abs(dx) > 140 || Math.abs(drGoalY(h) + 40 - P.y) > 130;
      if (D.guideCd <= 0 && far && (P.idle > 10 || D.wrongT > 4)) drGuide();
    }
  }
  if (playing && drFree() && !D.bayrak.merak) {   // Büyük Pofuduk'u ilk görüş: merakla yanına uç
    const b = drBuyuk();
    if (b && !b.uyandi && Math.abs(b.x - P.x) < 560 && b.x < cam.x + VW + 40) { D.bayrak.merak = true; drMode('merak'); D.mo = b; }
  }
  if (playing && drFree() && D.playCd <= 0) {   // uyanmış Pofuduklarla oyun
    D.playCd = 1;
    for (const o of NESNELER) if ((o.tip === 'pofuduk' || o.tip === 'buyukPofuduk') && o.uyandi && Math.abs(o.x - P.x) < 320 && o.x > cam.x + 60 && o.x < cam.x + VW - 60) {
      if (Math.random() < 0.35) { drMode('oyna'); D.po = o; D.pp = 0; D.playCd = 14 + Math.random() * 8; }
      break;
    }
  }
  D.assistCd -= dt;
  if (playing) {   // takılma: hedefe yaklaşamadan uzun süre zıplayıp duruyor
    const h = drHedef();
    if (h !== D.bestH) { D.bestH = h; D.bestD = 1e9; D.stuckT = 0; D.jumps = 0; }
    if (h) {
      const d = Math.abs(h.x - P.x) + Math.max(0, P.y - h.y) * 0.5;
      if (d < D.bestD - 40) { D.bestD = d; D.stuckT = 0; D.jumps = 0; }
      else if (P.idle < 3) D.stuckT += dt;
      if (D.stuckT > 10 && D.jumps >= 3 && P.ground && D.assistCd <= 0 && (drFree() || D.mode === 'yol')) {
        const tg = drAssistTarget(P.x, P.y);
        D.stuckT = 0; D.jumps = 0;
        if (tg) { drMode('yardim'); D.yt = tg; D.assistCd = 35; P.kilit = Math.max(P.kilit || 0, 1.4); D.expr = 'happy'; D.exprT = 1; drEncourage(); }
      }
    }
  }
  if (D.mode === 'follow' && P.idle > D.nextOrbit) { D.mode = 'orbit'; D.modeT = 0; D.oa = Math.atan2((D.y - (P.y - 104)) / 0.3, D.x - P.x); }
  if (!D.yawned && P.idle > 6.5 && drFree() && DURUM === 'oyun') { D.yawned = true; D.yawnT = 0; }

  // ── modlar ──
  if (D.mode === 'push') {
    const dashT = D.dashT, holdT = 0.3;
    const ex = P.x - P.f * 3, ey = P.y + 23;
    if (D.modeT < dashT) {            // hızlı kavisli süzülüş (ışınlanma yok: konum sürekli)
      const u = smooth(D.modeT / dashT);
      const cx = lerp(D.sx0, ex, 0.4) - P.f * 34, cy = lerp(D.sy0, ey, 0.75);
      const nx = (1 - u) * (1 - u) * D.sx0 + 2 * u * (1 - u) * cx + u * u * ex;
      const ny = (1 - u) * (1 - u) * D.sy0 + 2 * u * (1 - u) * cy + u * u * ey;
      D.vx = (nx - D.x) / dt; D.vy = (ny - D.y) / dt; D.x = nx; D.y = ny; direct = true;
      D.ft = P.f;
    } else if (D.modeT < dashT + holdT) {   // ayaklarının altında: itme pozu
      if (!D.pushHit) {
        D.pushHit = true;
        ripples.push({ x: P.x, y: P.y + 6, r: 0, life: 0.7, small: true });
        burst(P.x, P.y + 2, 10, ['#c9a2ff', '#ffd6f2', '#ffffff'], 190, 0.6, 6);
      }
      const kk = 1 - Math.exp(-dt * 30);
      const nx = lerp(D.x, ex, kk), ny = lerp(D.y, ey, kk);
      D.vx = (nx - D.x) / dt; D.vy = (ny - D.y) / dt; D.x = nx; D.y = ny; direct = true;
      D.ft = P.f;
    } else { D.mode = 'follow'; D.modeT = 0; D.vx = -P.f * 420; D.vy = Math.min(D.vy, 0) - 60; D.lockF = 0.45; }   // arkasından yukarı dön
  } else if (D.mode === 'orbit') {     // Feza durunca başının üstünde oyuncu bir çember
    const a = D.oa + D.modeT * 2.3;
    tx = P.x + Math.cos(a) * 58; ty = P.y - 104 + Math.sin(a) * 18 + Math.sin(a * 2) * 6;
    k = 40; damp = 10;
    if (D.modeT > 2.73 * 2 || P.idle < 0.5) { D.mode = 'follow'; D.modeT = 0; D.nextOrbit = P.idle + 6; }
  } else if (D.mode === 'happy') {
    if (Math.abs(P.x - D.hx) > 520) { D.mode = 'follow'; D.modeT = 0; }
    else if (D.hphase === 0) {     // çiçeğe uç
      const a = Math.atan2(D.y - D.hy, D.x - D.hx);
      tx = D.hx + Math.cos(a) * D.hr; ty = D.hy + Math.sin(a) * D.hr * 0.85;
      k = 70; damp = 14;
      if ((D.x - P.x) * D.hside < 14 && D.modeT < 0.9) { tx = P.x + D.hside * 34; ty = Math.min(D.y, P.y - 120); }   // Feza'nın başının üstünden geç
      else if (Math.hypot(D.x - tx, D.y - ty) < 12 || D.modeT > 1.2) {
        D.hphase = 1; D.modeT = 0; D.la = a;
        D.ldir = (Math.cos(a) >= 0) ? -1 : 1;     // üstten geçerek dön
        if (Math.sin(a) < 0) D.ldir = -D.ldir;
      }
    } else if (D.hphase === 1) {   // çiçeğin etrafında mutlu bir tur
      const a = D.la + D.ldir * D.modeT * 6.283 / 1.15;
      tx = D.hx + Math.cos(a) * D.hr; ty = D.hy + Math.sin(a) * D.hr * 0.85;
      k = 150; damp = 20; flapW = 4.6;
      D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.09; drFx(D.x, D.y - 4, Math.random() < 0.5 ? 'heart' : 'star'); }
      if (D.modeT > 1.15) { D.hphase = 2; D.modeT = 0; for (let i = 0; i < 5; i++) drFx(D.x, D.y - 10, i % 2 ? 'star' : 'heart'); }
    } else {                         // sevinç zıplaması, sonra Feza'ya dön
      tx = D.hx; ty = D.hy - 10; k = 60; damp = 12; flapW = 4.6;
      hopW = Math.abs(Math.sin(D.modeT * 11)) * 7 * (1 - D.modeT / 0.7);
      if (D.modeT > 0.7) { D.mode = 'follow'; D.modeT = 0; D.exprT = Math.min(D.exprT, 0.8); }
    }
  } else if (D.mode === 'dalis') {     // Feza düştü: hemen peşinden suya dal
    tx = D.fallX; ty = ROWS * T + 10; k = 75; damp = 12; flapW = 7;
    D.expr = 'effort'; D.exprT = 0.3;
    if (!D.splashed && D.y > ROWS * T - 40) {
      D.splashed = true;
      burst(D.x, ROWS * T - 30, 16, ['#bfe6ff', '#ffffff', '#d9b8ff'], 140, 0.8, 6);
      ripples.push({ x: D.x, y: ROWS * T - 30, r: 0, life: 0.6, small: true });
    }
    if (D.modeT > 2.5) drMode('follow');
  } else if (D.mode === 'tasi') {      // Feza'yı pençeleriyle tutup güvenli yere uçarak taşı
    P.fade = DR_HOLD; P.vx = P.vy = 0;
    if (!D.grabbed) {
      tx = D.fallX; ty = ROWS * T + 10; k = 90; damp = 13; flapW = 7;
      if (D.y > ROWS * T - 8 || D.modeT > 0.7) {   // yakaladı: Feza'nın ayakları bu yoldan güvenli yere gider
        D.grabbed = true; D.modeT = 0;
        const ho = drHandOff();
        D.pA = { x: D.pence.x - ho.x, y: D.pence.y - ho.y }; D.pE = { x: D.safeX, y: D.safeY };
        const dist = Math.hypot(D.pE.x - D.pA.x, D.pE.y - D.pA.y);
        D.pC = { x: lerp(D.pA.x, D.pE.x, 0.55), y: Math.min(D.pA.y, D.pE.y) - 90 - Math.abs(D.pE.x - D.pA.x) * 0.12 };
        D.tDur = clamp(0.95 + dist / 620, 1.25, 2.4);
        D.tDir = Math.abs(D.pE.x - D.pA.x) > 20 ? Math.sign(D.pE.x - D.pA.x) : P.f;
        burst(D.x, ROWS * T - 30, 22, ['#bfe6ff', '#ffffff', '#d9b8ff'], 170, 0.9, 7);
        ripples.push({ x: D.x, y: ROWS * T - 30, r: 0, life: 0.8, small: true });
        drSfx('dbl');
      }
    }
    if (D.grabbed) {
      const u = clamp(D.modeT / D.tDur, 0, 1), e = smooth(u);
      D.cpx = (1 - e) * (1 - e) * D.pA.x + 2 * e * (1 - e) * D.pC.x + e * e * D.pE.x;
      D.cpy = (1 - e) * (1 - e) * D.pA.y + 2 * e * (1 - e) * D.pC.y + e * e * D.pE.y;
      const ho = drHandOff(), pw = drLocal(DR_PAW[0], DR_PAW[1]);   // arka ayak Feza'nın elinde
      const nx = D.cpx + ho.x - (pw.x - D.x), ny = D.cpy + ho.y - (pw.y - D.y);
      D.vx = (nx - D.x) / dt; D.vy = (ny - D.y) / dt; D.x = nx; D.y = ny; direct = true;
      D.ft = D.tDir; P.f = D.tDir; flapW = 8;
      D.expr = u < 0.5 ? 'effort' : 'happy'; D.exprT = 0.3;
      if (u < 0.45 && Math.random() < dt * 22) parts.push({ x: D.cpx + (Math.random() - 0.5) * 16, y: D.cpy - 10 - Math.random() * 30, vx: 0, vy: 60, life: 0.7, max: 0.7, col: '#bfe6ff', size: 4 });
      if (u >= 1) {   // yere bırak
        D.tasiyor = false; P.x = D.safeX; P.y = D.safeY; P.vx = P.vy = 0; P.fade = 0; P.rx = P.x; P.ry = P.y;
        if (D.yardim) { P.safeX = P.x; P.safeY = P.y; P.ground = true; D.yardim = false; }
        if (typeof FZ_CARRY !== 'undefined' && P.a_carryT !== undefined) P.a_carryT = FZ_CARRY * 0.62;   // feza.js: iniş kısmı
        P.kilit = Math.max(P.kilit || 0, 0.15);
        ripples.push({ x: P.x, y: P.y, r: 0, life: 0.6, small: true });
        for (let i = 0; i < 6; i++) drFx(D.x, D.y - 6, i % 2 ? 'heart' : 'star');
        drMode('sevin'); D.sx0 = P.x - P.f * 36; D.sy0 = P.y - 108; D.sevDur = 0.8;
        D.vy -= 120;
        D.expr = 'happy'; D.exprT = 1.4; D.lockF = 0.3;
        if (D.wasFall) drSayKurtar();
      }
    }
  } else if (D.mode === 'yardim') {   // Feza'nın yanına gel, elini tut, kaldır
    const ho = drHandOff(), pl = drLocal(DR_PAW[0], DR_PAW[1]);
    tx = P.x + ho.x - (pl.x - D.x); ty = P.y + ho.y - (pl.y - D.y);
    k = 70; damp = 13; flapW = 6;
    D.ft = Math.sign(D.yt.x - P.x) || P.f; D.faceHold = 0.15;
    P.kilit = Math.max(P.kilit || 0, 0.3);
    if ((Math.hypot(D.x - tx, D.y - ty) < 8 && D.modeT > 0.3) || D.modeT > 1.3) {
      if (P.ground) drCarryStart(D.yt.x, D.yt.y); else drMode('follow');
    }
  } else if (D.mode === 'sevin') {     // kısa sevinç zıplaması
    tx = D.sx0; ty = D.sy0; k = 45; damp = 11; flapW = 5;
    hopW = Math.abs(Math.sin(D.modeT * 10)) * 7 * (1 - D.modeT / D.sevDur);
    if (D.modeT > D.sevDur) drMode('follow');
  } else if (D.mode === 'nefes') {
    const dir = D.nfDir; D.ft = dir; D.faceHold = 0.15;
    D.lookAt.x = D.nfAx; D.lookAt.y = D.nfAy; D.lookAtT = 0.2;
    if (D.np === 0) {                  // gölün kıyısına, Feza'nın üstüne uç
      tx = D.nfX; ty = D.nfY; k = 55; damp = 12;
      if ((Math.hypot(D.x - tx, D.y - ty) < 14 && D.modeT > 0.35) || D.modeT > 1.2) { D.np = 1; D.modeT = 0; OLAY.emit('nefes', { asama: 'al' }); }
    } else if (D.np === 1) {           // derin nefes: geri çekilir, şişer, etraftaki ışık ağzına akar
      const u = clamp(D.modeT / 0.8, 0, 1), su = smooth(u);
      tx = D.nfX - dir * 14 * su; ty = D.nfY - 10 * su; k = 60; damp = 13; flapW = 2.6;
      D.puff = su; D.expr = 'puff'; D.exprT = 0.3; D.tiltWant = -0.2 * su; D.stretch = 0.55 * su;
      const mo = drMouthPos();
      if (Math.random() < dt * 55) {
        const a = (dir > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 2.6, r = 60 + Math.random() * 60;
        D.nf.push({ k: 1, x: mo.x + Math.cos(a) * r, y: mo.y + Math.sin(a) * r, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 5 + Math.random() * 5, col: DR_NEFES[(Math.random() * 6) | 0] });
      }
      if (D.modeT > 0.8) { D.np = 2; D.modeT = 0; }
    } else if (D.np === 2) {           // kısa tutuş: yanaklar dolu, titrer
      tx = D.nfX - dir * 14 + Math.sin(D.t * 70) * 0.9; ty = D.nfY - 10; k = 80; damp = 14; flapW = 2.6;
      D.puff = 1; D.expr = 'puff'; D.exprT = 0.3; D.tiltWant = -0.22; D.stretch = 0.55;
      if (D.modeT > 0.18) { D.np = 3; D.modeT = 0; OLAY.emit('nefes', { asama: 'ver' }); drSfx('bloom'); }
    } else if (D.np === 3) {           // uzun, parlayan ışık nefesi
      const BT = 1.4, u = D.modeT / BT;
      const env = Math.min(1, D.modeT / 0.08) * (u > 0.8 ? Math.max(0, 1 - (u - 0.8) / 0.2) : 1);
      D.blowM = env; D.puff = 1 - smooth(clamp(u * 1.05, 0, 1)); D.expr = 'blow'; D.exprT = 0.3;
      D.stretch = 0.55 * (1 - smooth(clamp(u * 3, 0, 1)));
      tx = D.nfX - dir * (14 + 12 * smooth(clamp(u * 4, 0, 1))); ty = D.nfY - 6; k = 60; damp = 13; flapW = 4;
      D.tiltWant = 0.14;
      const mo = drMouthPos();
      const base = Math.atan2(D.nfAy - mo.y, Math.abs(D.nfAx - mo.x)) * 0.55 + Math.sin(D.modeT * 4.2) * 0.09 - 0.05;
      D.nfA = dir > 0 ? base : Math.PI - base;
      drBreathParticles(dt, 170 * env, mo, D.nfA);
      if (!D.nfDone && D.modeT > 0.3) {
        D.nfDone = true; OLAY.emit('aydinlat', D.nfO.grup);
        D.nfQ.length = 0; for (const n of D.nfL) D.nfQ.push({ o: n, t: 0.05 + Math.abs(n.x - mo.x) / 700 });
      }
      if (D.modeT > BT) {
        D.np = 4; D.modeT = 0; D.blowM = 0; D.puff = 0; D.stretch = 0;
        for (let i = 0; i < 7; i++) drFx(D.x, D.y - 8, i % 2 ? 'heart' : 'star');
        if (!D.bayrak.nilufer) { D.bayrak.nilufer = true; drSay('p_nilufer'); }
        P.kilit = Math.min(P.kilit || 0, 0.05);
        OLAY.emit('nefes', { asama: 'bitti' });
      }
    } else {                           // memnun küçük sevinç
      tx = D.nfX; ty = D.nfY - 16; k = 55; damp = 12; flapW = 5;
      D.expr = 'happy'; D.exprT = 0.8;
      hopW = Math.abs(Math.sin(D.modeT * 10)) * 8 * (1 - D.modeT / 1.0);
      if (D.modeT > 1.0) { drMode('follow'); D.lookAtT = 0; }
    }
  } else if (D.mode === 'yol') {       // yol göster: ışıltılı noktalı iz, hedefte nabız, dönüp el salla
    const dirG = D.gDir;
    if (D.yp === 0) {
      tx = D.gx; ty = D.gy; k = 30; damp = 9; flapW = 5.5;
      D.lookAt.x = D.gx; D.lookAt.y = D.gy; D.lookAtT = 0.2;
      if (Math.hypot(D.x - D.gx, D.y - D.gy) < 26 || D.modeT > 1.7) {
        D.yp = 1; D.modeT = 0; D.ya = Math.atan2(D.y - D.gy, D.x - D.gx);
        const o = D.gO, px = D.yolUzak ? D.gx : o.x, py = D.yolUzak ? D.gy : drGoalY(o) + 22;
        drPulse(px, py, D.yolUzak ? 34 : (o.tip === 'buyukPofuduk' ? 90 : o.tip === 'agac' ? 110 : 44), 3);
      }
    } else if (D.yp === 1) {           // hedefin çevresinde parıltılı tur
      const a = D.ya - dirG * D.modeT * 6.283 / 0.85;
      tx = D.gx + Math.cos(a) * 32; ty = D.gy + Math.sin(a) * 26; k = 150; damp = 20; flapW = 5.5;
      D.expr = 'happy'; D.exprT = 0.3;
      D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.12; drFx(D.x, D.y - 4, 'star'); }
      if (D.modeT > 0.85) { D.yp = 2; D.modeT = 0; }
    } else {                           // Feza'ya dönüp bak, pençesiyle "gel!" de
      tx = D.gx - dirG * 6; ty = D.gy - 6 + Math.sin(D.modeT * 7) * 2.5; k = 45; damp = 11;
      D.ft = Math.sign(P.x - D.x) || -dirG; D.faceHold = 0.15;
      D.beckonW = 1; D.expr = 'happy'; D.exprT = 0.3;
      hopW = Math.abs(Math.sin(D.modeT * 6)) * 3;
      if (D.modeT > 1.3 || Math.abs(P.x - D.gx) < 120) { drMode('follow'); D.beckonW = 0; }
    }
    if (D.yp < 2) {   // noktalı ışık izi (birkaç saniye kalır)
      D.izT -= dt;
      if (D.izT <= 0) { D.izT = 0.04; D.iz.push({ x: D.x - D.fs * 6 + (Math.random() - 0.5) * 4, y: D.y + 4 + (Math.random() - 0.5) * 4, life: 4.2, max: 4.2, ph: Math.random() * 6.283, col: DR_IZ[D.iz.length % 4] }); }
    }
  } else if (D.mode === 'oyna') {      // uyanık Pofuduğun çevresinde oyuncu bir tur
    const o = D.po, big = o.tip === 'buyukPofuduk', r = big ? 105 : 44, cy = o.y - (big ? 95 : 30);
    if (D.pp === 0) {
      const a = Math.atan2(D.y - cy, D.x - o.x);
      tx = o.x + Math.cos(a) * r; ty = cy + Math.sin(a) * r * 0.7; k = 60; damp = 13;
      if (Math.hypot(D.x - tx, D.y - ty) < 14 || D.modeT > 1) { D.pp = 1; D.modeT = 0; D.oa = a; D.od = Math.cos(a) >= 0 ? -1 : 1; }
    } else {
      const a = D.oa + D.od * D.modeT * 6.283 / (big ? 1.6 : 1.1);
      tx = o.x + Math.cos(a) * r; ty = cy + Math.sin(a) * r * 0.7; k = 150; damp = 20; flapW = 5;
      D.expr = 'happy'; D.exprT = 0.4;
      D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.16; drFx(D.x, D.y - 4, Math.random() < 0.6 ? 'heart' : 'star'); }
      if (D.modeT > (big ? 1.6 : 1.1)) drMode('follow');
    }
    if (Math.abs(P.x - o.x) > 450) drMode('follow');
  } else if (D.mode === 'merak') {     // Büyük Pofuduk'a merakla bak
    const b = D.mo, side = Math.sign(P.x - b.x) || -1;
    const bw = b.cisim ? b.cisim.w / 2 : 80, bh = b.cisim ? b.cisim.h : 130;
    tx = b.x + side * (bw + 60); ty = b.y - bh - 40 + Math.sin(D.modeT * 2.2) * 4; k = 35; damp = 10;
    D.ft = -side; D.faceHold = 0.15;
    D.lookAt.x = b.x; D.lookAt.y = b.y - 70; D.lookAtT = 0.2;
    D.expr = D.modeT < 2.2 ? 'wow' : 'happy'; D.exprT = 0.3;
    rollW = Math.sin(D.modeT * 2.4) * 0.2;
    if (D.modeT > 3.0 || Math.abs(P.x - b.x) > 700) drMode('follow');
  } else if (D.mode === 'yay') {       // zıplatan Pofuduk: Feza'nın çevresinde sevinçle dön
    const a = D.ya0 + D.yayDir * D.modeT * (D.yayBig ? 7.5 : 8);
    const r = D.yayBig ? 90 : 80;
    tx = P.x + Math.cos(a) * r; ty = P.y - 58 + Math.sin(a) * r * 0.5; k = 170; damp = 22; flapW = 7;
    if (D.modeT > 0.35) { D.expr = 'happy'; D.exprT = 0.4; }
    if (Math.random() < dt * 30) parts.push({ x: D.x, y: D.y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, life: 0.7, max: 0.7, col: DR_IZ[(Math.random() * 4) | 0], size: 5 });
    if (D.modeT > D.yayDur) { drMode('follow'); for (let i = 0; i < 3; i++) drFx(D.x, D.y - 6, 'star'); }
  } else if (D.mode === 'dans') {      // final: Feza'nın çevresinde sekiz çizen sevinç dansı
    const a = D.modeT * 2.6;
    tx = P.x + Math.sin(a) * 74; ty = P.y - 112 + Math.sin(2 * a) * 22; k = 60; damp = 12; flapW = 5.5;
    hopW = Math.abs(Math.sin(D.modeT * 8)) * 5;
    D.expr = 'happy'; D.exprT = 0.5;
    D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.22; drFx(D.x, D.y - 6, Math.random() < 0.6 ? 'heart' : 'star'); }
    if (DURUM !== 'oyun' && DURUM !== 'final') { drMode('follow'); D.danceAfter = false; }
  } else D.mode = 'follow';
  D.hop = hopW > 0 ? hopW : Math.max(0, D.hop - dt * 20);
  if (D.mode !== 'nefes') { D.puff = Math.max(0, D.puff - dt * 4); D.blowM = Math.max(0, D.blowM - dt * 6); D.stretch = Math.max(0, D.stretch - dt * 3); }
  if (D.mode !== 'yol') D.beckonW = 0;
  D.beckon = lerp(D.beckon, D.beckonW, 1 - Math.exp(-dt * 10));
  D.headRoll = lerp(D.headRoll, rollW, 1 - Math.exp(-dt * 6));

  if (!direct) {
    D.vx += ((tx - D.x) * k - D.vx * damp) * dt; D.vy += ((ty - D.y) * k - D.vy * damp) * dt;
    const sp = Math.hypot(D.vx, D.vy); if (sp > 1400) { D.vx *= 1400 / sp; D.vy *= 1400 / sp; }
    D.x += D.vx * dt; D.y += D.vy * dt;
  }

  // esneme (Feza boş durunca): ağız ağır ağır açılır, gözler kapanır, kanatlar gerinir
  if (D.yawnT >= 0) {
    if (!drFree()) D.yawnT = -1;
    else {
      D.yawnT += dt; const t = D.yawnT;
      D.yawn = t < 0.55 ? smooth(t / 0.55) : t < 1.25 ? 1 : Math.max(0, 1 - smooth((t - 1.25) / 0.45));
      if (t > 1.7) D.yawnT = -1;
    }
  }
  if (D.yawnT < 0) D.yawn = Math.max(0, D.yawn - dt * 4);
  // konuşma: hece hece ağız
  D.talkT -= dt;
  const syl = Math.sin(D.t * 13) * 0.6 + Math.sin(D.t * 7.3 + 1.3) * 0.4;
  D.mouth = lerp(D.mouth, D.talkT > 0 ? clamp(0.42 + syl * 0.7, 0.08, 1) : 0, 1 - Math.exp(-dt * 22));

  // yön: gecikmeli eşik (titremesin), ölçek 0'dan geçerek dönsün
  D.lockF = Math.max(0, D.lockF - dt);
  if (D.mode !== 'push' && D.mode !== 'tasi' && D.faceHold <= 0 && D.lockF <= 0) {
    if (Math.abs(D.vx) > 110) { if (Math.sign(D.vx) !== D.ft) D.ft = Math.sign(D.vx); }
    else if (Math.abs(D.vx) < 50) { const rel = P.x - D.x; if (rel * D.ft < -26) D.ft = -D.ft; }
  }
  if (D.tt < 0 && D.ft !== D.face) D.tt = 0;
  if (D.tt >= 0) {
    D.tt += dt / 0.19;
    if (D.tt >= 0.5 && D.face !== D.ft) D.face = D.ft;
    if (D.tt >= 1) D.tt = -1;
  }
  const tu = D.tt;
  D.fw = tu < 0 ? 0 : tu < 0.2 ? smooth(tu / 0.2) : tu > 0.8 ? smooth((1 - tu) / 0.2) : 1;
  D.fs = D.face * (1 - D.fw);
  D.f = D.face;

  // eğim: küçük, yerel uzayda (burun yukarı = yükseliş); asla ters dönmez
  const speedX = Math.abs(D.vx);
  let want = clamp(D.vy / 1100, -0.32, 0.32) + clamp(speedX / 3000, 0, 0.12) * (D.vy < 0 ? -0.3 : 1);
  if (D.tiltWant !== null) want = D.tiltWant;
  if (D.mode === 'tasi') want = clamp(want, -0.1, 0.1);
  D.tilt = lerp(D.tilt, clamp(want, -0.35, 0.35), 1 - Math.exp(-dt * 8));

  // kanat çırpma: hızlı uçarken/yükselirken hızlı, alçalırken süzülme
  const dashing = D.mode === 'push' || Math.hypot(D.vx, D.vy) > 420;
  let rate = 3.1;
  if (flapW) rate = flapW; else if (dashing) rate = 7.5; else if (D.vy < -120) rate = 5.2;
  if (D.yawn > 0.1) rate = lerp(rate, 1.8, D.yawn);
  D.flapRate = lerp(D.flapRate, rate, 1 - Math.exp(-dt * 6));
  const glideW = (D.vy > 110 && !dashing && D.mode !== 'push' && D.mode !== 'tasi' && D.mode !== 'dalis') ? 1 : 0;
  D.glide = lerp(D.glide, glideW, 1 - Math.exp(-dt * 5));
  D.ph += dt * D.flapRate * 6.283 * (1 - D.glide * 0.75);
  D.bob = Math.sin(D.ph - 0.7) * 2.2 * (1 - D.glide) - D.hop;

  // göz/baş: Feza'ya ya da ilgi çeken şeye
  const sx = D.face;
  let lx = (P.x - D.x) * Math.sign(sx), ly = (P.y - 50 - D.y);
  if (D.mode === 'happy' && D.hphase < 2) { lx = (D.hx - D.x) * Math.sign(sx); ly = D.hy + 30 - D.y; }
  if (D.lookAtT > 0) { lx = (D.lookAt.x - D.x) * Math.sign(sx); ly = D.lookAt.y - D.y; }
  if (D.mode === 'push') { lx = 10; ly = -60; }
  const ll = Math.hypot(lx, ly) || 1;
  D.lookX = lerp(D.lookX, lx / ll, 1 - Math.exp(-dt * 10)); D.lookY = lerp(D.lookY, ly / ll, 1 - Math.exp(-dt * 10));
  D.headTilt = lerp(D.headTilt, clamp(D.lookY * 0.22, -0.18, 0.2) - D.tilt * 0.4 - D.yawn * 0.22, 1 - Math.exp(-dt * 6));
  D.pose = lerp(D.pose, D.mode === 'push' ? 1 : 0, 1 - Math.exp(-dt * (D.mode === 'push' ? 25 : 8)));
  D.stretch = Math.max(D.stretch, D.yawn * 0.8);

  D.exprT -= dt; if (D.exprT <= 0 && D.mode !== 'happy' && D.mode !== 'push') D.expr = 'normal';
  D.blinkT -= dt; if (D.blinkT < -0.14) D.blinkT = 1.6 + Math.random() * 3.4;

  // taşırken: Feza pençelerden sarkar (feza.js D.tasiyor ve D.pence'ye bakabilir)
  const pw = drLocal(DR_PAW[0], DR_PAW[1]); D.pence.x = pw.x; D.pence.y = pw.y;
  if (D.mode === 'tasi') {
    if (D.grabbed) { P.x = D.cpx; P.y = D.cpy; } else { P.x = D.fallX; P.y = ROWS * T + 260; }
    P.fade = DR_HOLD; P.vx = P.vy = 0; P.rx = P.x; P.ry = P.y;
    // feza.js'nin "Pırıl'ın patisine tutunmuş" pozu taşıma boyunca sürsün (iniş kısmı bırakınca oynar)
    if (typeof FZ_CARRY !== 'undefined' && P.a_carryT !== undefined) P.a_carryT = FZ_CARRY * (D.grabbed ? 0.3 : 0.05);
  }

  // kuyruk zinciri (gecikmeli takip)
  let prev = drLocal(-7, 6);
  if (Math.hypot(prev.x - D.tail[0].x, prev.y - D.tail[0].y) > 80) drResetTail();
  D.tail[0].x = prev.x; D.tail[0].y = prev.y;
  const sxx = D.fs, ct = Math.cos(D.tilt), st = Math.sin(D.tilt);
  for (let i = 1; i < DR_TAIL_N; i++) {
    const u = i / (DR_TAIL_N - 1);
    const ang = Math.PI - 0.75 + u * 1.7 + Math.sin(D.t * 3.2 - u * 3.2) * 0.32 * (0.4 + u) + D.glide * 0.3 + D.grip * 0.9;
    const dlx = Math.cos(ang), dly = Math.sin(ang);
    const dwx = sxx * (dlx * ct - dly * st), dwy = dlx * st + dly * ct;
    const p = D.tail[i];
    const kk = 1 - Math.exp(-dt * lerp(26, 7, u));
    p.x = lerp(p.x, prev.x + dwx * DR_TAIL_LEN, kk); p.y = lerp(p.y, prev.y + dwy * DR_TAIL_LEN, kk);
    const ddx = p.x - prev.x, ddy = p.y - prev.y, dd = Math.hypot(ddx, ddy) || 1;
    p.x = prev.x + ddx / dd * DR_TAIL_LEN; p.y = prev.y + ddy / dd * DR_TAIL_LEN;
    prev = p;
  }

  // ışık izi ve parıltılar
  const spd = Math.hypot(D.vx, D.vy);
  if (spd > 380 || D.mode === 'push') D.trail.push({ x: D.x, y: D.y + D.bob, life: 0.28 });
  for (let i = D.trail.length - 1; i >= 0; i--) { D.trail[i].life -= dt; if (D.trail[i].life <= 0) D.trail.splice(i, 1); }
  if (D.mode === 'push' && D.modeT < D.dashT && Math.random() < dt * 60) parts.push({ x: D.x + (Math.random() - 0.5) * 10, y: D.y + (Math.random() - 0.5) * 10, vx: -D.vx * 0.08, vy: -D.vy * 0.08, life: 0.6, max: 0.6, col: Math.random() < 0.5 ? '#e2c8ff' : '#ffffff', size: 6 });
  const tip = D.tail[DR_TAIL_N - 1];
  if (Math.random() < dt * 10) parts.push({ x: tip.x + (Math.random() - 0.5) * 5, y: tip.y + (Math.random() - 0.5) * 5, vx: -D.vx * 0.08 + (Math.random() - 0.5) * 16, vy: 8 + Math.random() * 16, life: 1.0, max: 1.0, col: Math.random() < 0.5 ? '#ffd0f5' : '#e0c8ff', size: 5 });
  for (let i = D.fx.length - 1; i >= 0; i--) {
    const f = D.fx[i]; f.life -= dt; if (f.life <= 0) { D.fx.splice(i, 1); continue; }
    f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= Math.exp(-dt * 2); f.vy = f.vy * Math.exp(-dt * 1.5) - 6 * dt; f.r += f.vr * dt;
  }
  // nefes parçacıkları
  if (D.nf.length) {
    const mo = drMouthPos(), dr = Math.exp(-dt * 1.15);
    for (let i = D.nf.length - 1; i >= 0; i--) {
      const p = D.nf[i]; p.life -= dt;
      if (p.k === 1) {   // içe çekilen ışık
        const kk = 1 - Math.exp(-dt * 9); p.x = lerp(p.x, mo.x, kk); p.y = lerp(p.y, mo.y, kk);
        if (p.life <= 0 || Math.hypot(p.x - mo.x, p.y - mo.y) < 3) D.nf.splice(i, 1);
        continue;
      }
      if (p.life <= 0) { D.nf.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= dr; p.vy = p.vy * dr + 70 * dt;
    }
  }
  for (let i = D.nfQ.length - 1; i >= 0; i--) {   // ışık nilüfere değince küçük parıltı
    const q = D.nfQ[i]; q.t -= dt;
    if (q.t <= 0) {
      burst(q.o.x, q.o.y - 6, 16, ['#fff6d6', '#bff4ff', '#ffffff', '#d9b8ff'], 110, 1.2, 8);
      ripples.push({ x: q.o.x, y: q.o.y - 2, r: 0, life: 0.9, small: true });
      D.nfQ.splice(i, 1);
    }
  }
  for (let i = D.iz.length - 1; i >= 0; i--) { D.iz[i].life -= dt; if (D.iz[i].life <= 0) D.iz.splice(i, 1); }
  for (let i = D.pulse.length - 1; i >= 0; i--) { const q = D.pulse[i]; q.t += dt; if (q.t > q.life) D.pulse.splice(i, 1); }
}
function drFx(x, y, type) {
  const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, s = 40 + Math.random() * 60;
  D.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.1, max: 1.1, type, r: (Math.random() - 0.5) * 0.6, vr: (Math.random() - 0.5) * 2,
    col: type === 'heart' ? (Math.random() < 0.5 ? '#ff9ad8' : '#ffc4ec') : (Math.random() < 0.5 ? '#fff2a8' : '#e8d4ff') });
}

// ── çizim ──
function drHeart(x, s) {
  x.beginPath(); x.moveTo(0, s * 0.35);
  x.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.45, -s * 1.05, 0, -s * 0.45);
  x.bezierCurveTo(s * 0.45, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35); x.fill();
}
function drStar(x, s) {
  x.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.42 : s, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  x.closePath(); x.fill();
}
function drTwinkle(x, px, py, s, a) {   // dört köşeli ince parıltı
  x.globalAlpha = a; x.beginPath();
  x.moveTo(px, py - s); x.quadraticCurveTo(px, py, px + s * 0.3, py); x.quadraticCurveTo(px, py, px, py + s);
  x.quadraticCurveTo(px, py, px - s * 0.3, py); x.quadraticCurveTo(px, py, px, py - s);
  x.moveTo(px - s, py); x.quadraticCurveTo(px, py, px, py + s * 0.3); x.quadraticCurveTo(px, py, px + s, py);
  x.quadraticCurveTo(px, py, px, py - s * 0.3); x.quadraticCurveTo(px, py, px - s, py);
  x.fill(); x.globalAlpha = 1;
}
function drawTail(x, tm) {
  const tl = D.tail, n = tl.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = tl[Math.max(0, i - 1)], b = tl[Math.min(n - 1, i + 1)];
    let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const r = lerp(5.6, 1.3, Math.pow(i / (n - 1), 0.85));
    L.push([tl[i].x + nx * r, tl[i].y + ny * r]); R.push([tl[i].x - nx * r, tl[i].y - ny * r]);
  }
  const pts = L.concat(R.reverse());
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; x.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
  x.closePath();
  const gr = x.createLinearGradient(tl[0].x, tl[0].y, tl[n - 1].x, tl[n - 1].y);
  gr.addColorStop(0, DR_COL.pur); gr.addColorStop(0.7, '#a77df7'); gr.addColorStop(1, '#e2b8ff');
  x.fillStyle = gr; x.fill();
  x.strokeStyle = DR_COL.line; x.lineWidth = 0.8; x.stroke();
  x.fillStyle = DR_COL.spine;
  for (let i = 1; i < n - 2; i += 2) {
    const a = tl[i - 1], b = tl[i + 1]; let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const r = lerp(5.6, 1.3, i / (n - 1));
    x.beginPath(); x.arc(tl[i].x + nx * r * 0.9, tl[i].y + ny * r * 0.9, 1.7 - i * 0.12, 0, 6.283); x.fill();
  }
  // uçtaki ışık püskülü (peluşta: keçe alev)
  const p = tl[n - 1], q = tl[n - 2], pl = D.plush;
  let dx = p.x - q.x, dy = p.y - q.y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const fl = pl > 0.5 ? 1 : 0.85 + 0.15 * Math.sin(tm * 13) + 0.08 * Math.sin(tm * 29);
  if (D.glowA > 0.01) {
    x.globalCompositeOperation = 'lighter';
    drGlow(x, '#ff9fe8', p.x + dx * 3, p.y + dy * 3, 30 * fl, 0.55 * D.glowA);
    drGlow(x, '#ffffff', p.x + dx * 3, p.y + dy * 3, 10 * fl, 0.8 * D.glowA);
    x.globalCompositeOperation = 'source-over';
  }
  x.save(); x.translate(p.x, p.y); x.rotate(Math.atan2(dy, dx));
  const flame = (len, w, col, off) => {
    x.fillStyle = col; x.beginPath(); x.moveTo(-1, 0);
    x.quadraticCurveTo(len * 0.35, -w, len, off); x.quadraticCurveTo(len * 0.35, w, -1, 0); x.fill();
  };
  const wv = pl > 0.5 ? 0.6 : Math.sin(tm * 9) * 1.4;
  if (pl > 0.5) {
    flame(9, 4.4, '#f59ad8', wv - 1.5); x.strokeStyle = 'rgba(150,60,140,0.6)'; x.lineWidth = 0.6; x.stroke();
    flame(8, 3.6, '#d9b6ff', -wv + 1.8); x.stroke();
    flame(6, 2.4, '#fff0fb', wv * 0.5);
  } else {
    flame(9 * fl, 4.2, 'rgba(255,170,235,0.75)', wv - 1.5);
    flame(8 * fl, 3.6, 'rgba(225,180,255,0.75)', -wv + 1.8);
    flame(6.5 * fl, 2.6, 'rgba(255,235,252,0.95)', wv * 0.5);
  }
  x.restore();
}
function drawWing(x, far, tm) {
  // kanat açısı: yukarı (+) ↔ aşağı (-); süzülürken açık ve geride
  const w = Math.sin(D.ph + (far ? 0.35 : 0));
  let ang = lerp(-0.95, 0.62, (w + 1) / 2);
  ang = lerp(ang, -0.28 + Math.sin(tm * 3) * 0.06, D.glide);
  ang = lerp(ang, 0.55, D.pose * 0.6);
  ang = lerp(ang, 0.78 + Math.sin(tm * 2.4) * 0.05, D.stretch);
  ang = lerp(ang, 0.25, D.fold);
  const len = (1 + 0.08 * Math.cos(D.ph) * (1 - D.glide)) * (1 - 0.45 * D.fold);
  x.save(); x.translate(far ? 1.5 : -2.5, far ? -6.5 : -4.5); x.rotate(ang); x.scale(len * (far ? 0.9 : 1.12), (far ? 0.98 : 1.12) * (1 - 0.15 * D.fold));
  const Wr = [-7, -13], T1 = [-21, -25], T2 = [-27, -13], T3 = [-21, -2], B = [-6, -1];
  const memb = () => {
    x.beginPath(); x.moveTo(0, 0); x.lineTo(Wr[0], Wr[1]); x.lineTo(T1[0], T1[1]);
    x.quadraticCurveTo(-19, -16, T2[0], T2[1]);
    x.quadraticCurveTo(-18, -8, T3[0], T3[1]);
    x.quadraticCurveTo(-11, -4, B[0], B[1]); x.closePath();
  };
  memb();
  const gr = x.createLinearGradient(0, 0, -24, -16);
  if (far) { gr.addColorStop(0, 'rgba(98,58,190,0.95)'); gr.addColorStop(1, 'rgba(150,105,230,0.8)'); }
  else if (D.plush > 0.5) { gr.addColorStop(0, '#9a68f6'); gr.addColorStop(1, '#d9bbff'); }
  else { gr.addColorStop(0, 'rgba(150,100,250,0.92)'); gr.addColorStop(0.6, 'rgba(196,160,255,0.78)'); gr.addColorStop(1, 'rgba(240,200,255,0.72)'); }
  x.fillStyle = gr; x.fill();
  if (!far && D.glowA > 0.01) {
    x.save(); x.globalCompositeOperation = 'lighter'; x.globalAlpha = D.glowA;
    x.strokeStyle = 'rgba(255,190,250,0.22)'; x.lineWidth = 3.2; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(T1[0], T1[1]); x.quadraticCurveTo(-19, -16, T2[0], T2[1]); x.quadraticCurveTo(-18, -8, T3[0], T3[1]); x.quadraticCurveTo(-11, -4, B[0], B[1]); x.stroke();
    x.strokeStyle = 'rgba(255,230,255,0.45)'; x.lineWidth = 1; x.stroke();
    x.restore();
  }
  x.strokeStyle = far ? '#4f2a9c' : '#6c3fcf'; x.lineCap = 'round'; x.lineWidth = 1.8;
  x.beginPath(); x.moveTo(0, 0); x.lineTo(Wr[0], Wr[1]); x.stroke();
  x.lineWidth = 1.1;
  x.beginPath(); x.moveTo(Wr[0], Wr[1]); x.lineTo(T1[0], T1[1]); x.moveTo(Wr[0], Wr[1]); x.lineTo(T2[0], T2[1]); x.moveTo(Wr[0], Wr[1]); x.lineTo(T3[0], T3[1]); x.stroke();
  x.fillStyle = far ? '#d9c2a0' : DR_COL.horn; x.beginPath(); x.arc(Wr[0], Wr[1], 1.2, 0, 6.283); x.fill();
  x.strokeStyle = far ? 'rgba(60,30,120,0.6)' : 'rgba(70,35,140,0.55)'; x.lineWidth = 0.7; x.lineJoin = 'round'; memb(); x.stroke();
  x.restore();
}

// yüz ifadesi: göz türü ve ağız türü
function drEyeKind(right) {
  if (right && D.eyeOvR) return D.eyeOvR;
  if (D.eyeOv) return D.eyeOv;
  if (D.yawn > 0.35) return 'closed';
  const e = D.expr;
  if (e === 'happy' || e === 'blow') return 'happy';
  if (e === 'effort' || e === 'puff') return 'chev';
  if (e === 'sleepy') return 'closed';
  return 'open';
}
function drMouthKind() {
  if (D.blowM > 0.02) { D.mk = 'O'; D.ma = D.blowM; }
  else if (D.yawn > 0.05) { D.mk = 'yawn'; D.ma = D.yawn; }
  else if (D.expr === 'puff') { D.mk = 'purse'; D.ma = 1; }
  else if (D.mouth > 0.06) { D.mk = 'talk'; D.ma = D.mouth; }
  else if (D.expr === 'happy') { D.mk = 'happy'; D.ma = 1; }
  else if (D.expr === 'grin') { D.mk = 'grin'; D.ma = 1; }
  else if (D.expr === 'effort') { D.mk = 'o'; D.ma = 0.8; }
  else if (D.expr === 'wow') { D.mk = 'o'; D.ma = 1.15; }
  else { D.mk = 'smile'; D.ma = 0; }
  return D.mk;
}
function drOpenEye(x, rx, ry, lookSx) {   // açık göz içi (ölçek/öteleme dışarıda)
  x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.clip();
  const ox = D.lookX * lookSx * rx * 0.28, oy = D.lookY * ry * 0.2 + ry * 0.08;
  const ig = x.createLinearGradient(0, oy - ry, 0, oy + ry);
  ig.addColorStop(0, '#22094a'); ig.addColorStop(0.5, '#5a26b8'); ig.addColorStop(0.85, '#a66cf0'); ig.addColorStop(1, '#ffcf8a');
  x.fillStyle = ig; x.beginPath(); x.ellipse(ox, oy, rx * 0.86, ry * 0.86, 0, 0, 6.283); x.fill();
  x.fillStyle = '#12051f'; x.beginPath(); x.ellipse(ox, oy - ry * 0.04, rx * 0.5, ry * 0.56, 0, 0, 6.283); x.fill();
  x.fillStyle = '#ffffff';
  x.beginPath(); x.ellipse(ox + rx * 0.22, oy - ry * 0.36, rx * 0.36, ry * 0.25, -0.3, 0, 6.283); x.fill();
  x.beginPath(); x.arc(ox - rx * 0.3, oy + ry * 0.4, rx * 0.16, 0, 6.283); x.fill();
  x.restore();
}
function drClosedEye(x, rx, ry, lash, lw) {   // uyku gözü: aşağı kavis + kirpikler
  x.strokeStyle = DR_COL.eye; x.lineWidth = lw; x.lineCap = 'round';
  x.beginPath(); x.moveTo(-rx, -ry * 0.05); x.quadraticCurveTo(0, ry * 0.55, rx, -ry * 0.05); x.stroke();
  if (lash) {
    x.lineWidth = lw * 0.75;
    x.beginPath(); x.moveTo(lash * rx * 0.95, 0); x.lineTo(lash * rx * 1.35, ry * 0.2);
    x.moveTo(lash * rx * 0.6, ry * 0.2); x.lineTo(lash * rx * 0.85, ry * 0.48); x.stroke();
  }
}
function drFrontEye(x, cx, cy, rx, ry, lash, blink, kind) {
  x.save(); x.translate(cx, cy);
  x.strokeStyle = DR_COL.eye; x.lineCap = 'round'; x.lineJoin = 'round';
  if (kind === 'happy') {
    x.lineWidth = 1.5; x.beginPath(); x.moveTo(-3.1, 1.2); x.quadraticCurveTo(0, -3.4, 3.1, 1.2); x.stroke();
  } else if (kind === 'chev') {
    const sd = -lash; x.lineWidth = 1.4; x.beginPath(); x.moveTo(-sd * 2.6, -2.4); x.lineTo(sd * 2, 0); x.lineTo(-sd * 2.6, 2.2); x.stroke();
  } else if (kind === 'closed' || blink * D.lid <= 0.4) {
    drClosedEye(x, rx, ry, kind === 'closed' ? lash : 0, 1.2);
  } else {
    const big = D.expr === 'wow' ? 1.12 : 1;
    x.scale(big, blink * D.lid * big);
    drOpenEye(x, rx, ry, D.face);
    x.strokeStyle = DR_COL.eye; x.lineWidth = 1.1;
    x.beginPath(); x.ellipse(0, 0, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.92); x.stroke();
    x.beginPath(); x.moveTo(lash * rx * 0.92, -ry * 0.38); x.lineTo(lash * rx * 1.3, -ry * 0.62); x.stroke();
    x.strokeStyle = 'rgba(58,26,128,0.35)'; x.lineWidth = 0.5; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, Math.PI); x.stroke();
  }
  x.restore();
}
function drMouthDraw(x, cx, cy, wdt, front) {   // ağız: cx,cy = ağız ortası; wdt = yarı genişlik
  const k = drMouthKind(), m = D.ma, dk = '#5b1d5f';
  x.strokeStyle = DR_COL.eye; x.lineWidth = 0.9; x.lineCap = 'round'; x.lineJoin = 'round';
  const L = cx - wdt, R = cx + wdt;
  if (k === 'talk' || k === 'happy' || k === 'grin') {
    const d = k === 'talk' ? 0.6 + m * 4.6 : 4.4;
    x.fillStyle = dk; x.beginPath(); x.moveTo(R, cy - 0.4);
    x.quadraticCurveTo(cx, cy + d, L, cy - 0.2); x.quadraticCurveTo(cx, cy + 0.8, R, cy - 0.4); x.fill();
    if (d > 1.6) {
      x.save(); x.beginPath(); x.moveTo(R, cy - 0.4); x.quadraticCurveTo(cx, cy + d, L, cy - 0.2); x.closePath(); x.clip();
      x.fillStyle = '#ff8fc8'; x.beginPath(); x.ellipse(cx - (front ? 0 : 0.4), cy + d * 0.62, wdt * 0.6, d * 0.32, 0, 0, 6.283); x.fill(); x.restore();
    }
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(cx + wdt * 0.25, cy + 0.15); x.lineTo(cx + wdt * 0.55, cy + 0.05); x.lineTo(cx + wdt * 0.42, cy + 1.05); x.closePath(); x.fill();
  } else if (k === 'O') {
    const ox = front ? cx : R - 0.4, rx = 1.3 + 1.2 * m, ry = 1.5 + 1.5 * m;
    x.fillStyle = dk; x.beginPath(); x.ellipse(ox, cy + 0.3, rx, ry, 0, 0, 6.283); x.fill();
    x.fillStyle = 'rgba(255,240,200,' + (0.85 * m) + ')'; x.beginPath(); x.ellipse(ox, cy + 0.3, rx * 0.55, ry * 0.55, 0, 0, 6.283); x.fill();
  } else if (k === 'yawn') {
    const ox = front ? cx : cx - 0.3, rx = 1.6 + 1.3 * m, ry = 0.6 + 3.1 * m;
    x.fillStyle = dk; x.beginPath(); x.ellipse(ox, cy + ry * 0.55, rx, ry, 0, 0, 6.283); x.fill();
    x.fillStyle = '#ff8fc8'; x.beginPath(); x.ellipse(ox, cy + ry * 1.05, rx * 0.65, ry * 0.4, 0, 0, 6.283); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(ox + rx * 0.2, cy - ry * 0.4); x.lineTo(ox + rx * 0.55, cy - ry * 0.35); x.lineTo(ox + rx * 0.4, cy + 0.4); x.closePath(); x.fill();
  } else if (k === 'purse') {
    const ox = front ? cx : R - 0.6;
    x.fillStyle = dk; x.beginPath(); x.ellipse(ox, cy, 0.9, 0.75, 0, 0, 6.283); x.fill();
  } else if (k === 'o') {
    x.fillStyle = dk; x.beginPath(); x.ellipse(front ? cx : cx + 0.4, cy + 0.6, 1.4 * m, 1.05 * m + 0.1, 0, 0, 6.283); x.fill();
  } else {
    if (front) {
      x.beginPath(); x.moveTo(L, cy - 0.2); x.quadraticCurveTo(cx - wdt * 0.5, cy + 1.2, cx, cy + 0.2); x.quadraticCurveTo(cx + wdt * 0.5, cy + 1.2, R, cy - 0.2); x.stroke();
      x.fillStyle = '#fff'; x.beginPath(); x.moveTo(cx + 1.0, cy + 0.55); x.lineTo(cx + 1.8, cy + 0.65); x.lineTo(cx + 1.35, cy + 1.5); x.closePath(); x.fill();
    } else {
      x.beginPath(); x.moveTo(R, cy - 0.5); x.quadraticCurveTo(cx, cy + 1.4, L, cy - 0.1); x.stroke();
      x.beginPath(); x.moveTo(L - 0.4, cy - 0.7); x.quadraticCurveTo(L - 0.2, cy, L + 0.3, cy + 0.2); x.stroke();
      x.fillStyle = '#fff'; x.beginPath(); x.moveTo(cx + 0.3, cy + 0.75); x.lineTo(cx + 1.1, cy + 0.5); x.lineTo(cx + 0.8, cy + 1.5); x.closePath(); x.fill();
    }
  }
}
function drFront(x, tm) {   // önden görünüş (dönüş anında ve ara sahnelerde)
  const C = DR_COL, pose = D.pose, lg = D.glide * 2, pl = D.plush;
  for (const sd of [1, -1]) { x.save(); x.scale(sd, 1); x.translate(-2.5, 0.5 + pl * 3); x.rotate(-0.12); drawWing(x, false, tm); x.restore(); }
  const arm = (sd) => {
    const shx = sd * 5, shy = -0.5;
    let px = sd * lerp(6.2, 8.5, pose), py = lerp(3, -25.5, pose);
    px = lerp(px, sd * 9.4, pl * (1 - pose)); py = lerp(py, 9.8, pl * (1 - pose));
    x.strokeStyle = C.pur; x.lineWidth = 3.2; x.lineCap = 'round';
    x.beginPath(); x.moveTo(shx, shy); x.lineTo(px, py); x.stroke();
    x.fillStyle = C.lav; x.beginPath(); x.arc(px, py, 2.1 + pose * 0.5, 0, 6.283); x.fill();
    x.strokeStyle = C.line; x.lineWidth = 0.6; x.stroke();
  };
  if (pose > 0.3) { arm(-1); arm(1); }
  for (const sd of [-1, 1]) {   // bacaklar (peluşta öne açık oturur)
    x.save(); x.translate(sd * lerp(5.2, 6.4, pl), lerp(9 - lg * 0.5, 10.4, pl)); x.rotate(sd * 0.5 * pl);
    x.fillStyle = C.pur; x.beginPath(); x.ellipse(0, 0, 4, 3.8, 0, 0, 6.283); x.fill();
    x.strokeStyle = C.line; x.lineWidth = 0.7; x.stroke();
    x.translate(sd * 0.4, lerp(3.4 - lg * 0.5, 3.2, pl));
    x.fillStyle = C.lav; x.beginPath(); x.ellipse(0, 0, 3.2, lerp(1.9, 2.6, pl), 0, 0, 6.283); x.fill(); x.stroke();
    x.fillStyle = C.pink; for (let i = -1; i <= 1; i++) { x.beginPath(); x.arc(i * 1.3, 0.5, 0.5, 0, 6.283); x.fill(); }
    x.restore();
  }
  const bg = x.createRadialGradient(0, -1, 1, 0, 3, 13);
  bg.addColorStop(0, C.purL); bg.addColorStop(0.6, C.pur); bg.addColorStop(1, C.purD);
  x.fillStyle = bg; x.beginPath(); x.ellipse(0, 3, 9.4, 9.6, 0, 0, 6.283); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  x.fillStyle = C.lav; x.beginPath(); x.ellipse(0, 4.8, 5.8, 7, 0, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(0, 4.8, 5.8, 7, 0, 0, 6.283); x.clip();
  x.strokeStyle = 'rgba(160,120,220,0.55)'; x.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) { const yy = 1 + i * 3.2; x.beginPath(); x.moveTo(-6, yy); x.quadraticCurveTo(0, yy + 1.6, 6, yy); x.stroke(); }
  x.restore();
  if (pl > 0.05) {   // peluş ayrıntıları: dikiş ve küçük etiket
    x.save(); x.globalAlpha = pl;
    x.setLineDash([1.1, 1.1]); x.strokeStyle = 'rgba(110,70,180,0.75)'; x.lineWidth = 0.5;
    x.beginPath(); x.moveTo(0, -2.4); x.lineTo(0, 11.6); x.stroke(); x.setLineDash([]);
    x.translate(9.2, 7.5); x.rotate(0.35);
    x.fillStyle = '#fffaf4'; x.fillRect(-1.5, 0, 3, 4.4); x.strokeStyle = 'rgba(120,100,90,0.6)'; x.lineWidth = 0.4; x.strokeRect(-1.5, 0, 3, 4.4);
    x.fillStyle = '#ff9ad0'; x.translate(0, 2.3); drHeart(x, 0.9);
    x.restore();
  }
  if (pose <= 0.3) { arm(-1); arm(1); }
  // kafa
  x.save(); x.translate(0, -9); x.rotate(D.headTilt * 0.3 * D.face + D.headRoll); x.translate(0, 9);
  const ef = (pl > 0.5 ? 0 : Math.sin(tm * 3.1) * 0.12) + (D.expr === 'happy' ? Math.sin(tm * 14) * 0.15 : 0) - 0.45 * pl;
  for (const sd of [-1, 1]) {   // kulak yüzgeçleri
    x.save(); x.scale(sd, 1); x.translate(-8.5, -13); x.rotate(ef - 0.15);
    x.fillStyle = C.pink; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-5, -7, -9.5, -6.5); x.quadraticCurveTo(-7.5, -4, -9.5, -2); x.quadraticCurveTo(-7, -0.5, -8, 2.5); x.quadraticCurveTo(-4, 2, 0, 3); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(170,70,170,0.7)'; x.lineWidth = 0.6; x.stroke();
    x.beginPath(); x.moveTo(0, 1); x.lineTo(-9, -6); x.moveTo(0, 1.5); x.lineTo(-8.8, -1.5); x.stroke();
    x.restore();
  }
  for (const sd of [-1, 1]) {   // boynuzlar
    x.save(); x.scale(sd, 1); x.translate(-4.6, -19.6); x.rotate(0.15); x.scale(1.2, 1.2);
    const hg = x.createLinearGradient(0, 0, -6, -7); hg.addColorStop(0, C.horn); hg.addColorStop(1, '#fffaf0');
    x.fillStyle = hg; x.beginPath(); x.moveTo(-2.4, 0.8); x.quadraticCurveTo(-3.4, -4.6, -6.6, -7.6); x.quadraticCurveTo(-6.2, -8.6, -5.4, -7.9); x.quadraticCurveTo(0.6, -5, 2.4, 0); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(120,80,50,0.8)'; x.lineWidth = 0.7; x.stroke();
    x.restore();
  }
  const hg = x.createRadialGradient(0, -17, 1, 0, -11, 15);
  hg.addColorStop(0, '#b996ff'); hg.addColorStop(0.6, C.pur); hg.addColorStop(1, C.purD);
  x.fillStyle = hg; x.beginPath(); x.ellipse(0, -11.4, 11.8, 10.2, 0, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(0, -11.4, 11.8, 10.2, 0, 0, 6.283); x.clip();
  const mg = x.createRadialGradient(0, -6, 0.5, 0, -6, 7);
  mg.addColorStop(0, 'rgba(214,190,255,0.85)'); mg.addColorStop(1, 'rgba(214,190,255,0)');
  x.fillStyle = mg; x.fillRect(-10, -14, 20, 14);
  x.restore();
  x.strokeStyle = C.line; x.lineWidth = 0.8; x.beginPath(); x.ellipse(0, -11.4, 11.8, 10.2, 0, 0, 6.283); x.stroke();
  x.strokeStyle = 'rgba(255,240,255,0.42)'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(0, -11, 10.4, 8.8, 0, -2.5, -0.64); x.stroke();
  if (D.puff > 0.02) {   // şişkin yanaklar
    const pr = D.puff;
    for (const sd of [-1, 1]) {
      const cx = sd * (7.6 + 1.6 * pr), rx = 2.8 + 2.4 * pr, ry = 2.4 + 1.9 * pr;
      x.fillStyle = '#9466f2'; x.beginPath(); x.ellipse(cx, -5.8, rx, ry, 0, 0, 6.283); x.fill();
      x.strokeStyle = C.line; x.lineWidth = 0.8; x.beginPath();
      if (sd > 0) x.ellipse(cx, -5.8, rx, ry, 0, -1.3, 1.9); else x.ellipse(cx, -5.8, rx, ry, 0, 1.25, 4.45); x.stroke();
    }
  }
  x.fillStyle = '#4a2390'; x.beginPath(); x.ellipse(-1.7, -7.6, 0.55, 0.45, 0, 0, 6.283); x.ellipse(1.7, -7.6, 0.55, 0.45, 0, 0, 6.283); x.fill();
  const blush = (D.expr === 'normal' && pl < 0.5 ? 0.42 : 0.7) + D.puff * 0.2;
  x.fillStyle = 'rgba(255,128,196,' + Math.min(0.9, blush) + ')';
  const bx = 7.6 + 1.6 * D.puff, bw = 2.4 + D.puff;
  x.beginPath(); x.ellipse(-bx, -6.4, bw, 1.4 + D.puff * 0.5, 0, 0, 6.283); x.ellipse(bx, -6.4, bw, 1.4 + D.puff * 0.5, 0, 0, 6.283); x.fill();
  const blink = D.blinkT < 0 ? Math.max(0.08, Math.abs(D.blinkT + 0.07) / 0.07) : 1;
  drFrontEye(x, -5.4, -12.2, 3.6, 4.8, -1, blink, drEyeKind(false));
  drFrontEye(x, 5.4, -12.2, 3.6, 4.8, 1, blink, drEyeKind(true));
  drMouthDraw(x, 0, -4.4, 2.7, true);
  x.restore();
}
const drCanv = [];
function drSide(x, tm) {   // yandan görünüş (sağa bakan yerel uzay)
  const C = DR_COL, pose = D.pose, grip = D.grip, bk = D.beckon;

  drawWing(x, true, tm);
  x.fillStyle = C.purD;
  x.beginPath(); x.ellipse(3.5, 9 - D.glide * 1.5, 3.6, 3.4, 0, 0, 6.283); x.fill();
  x.beginPath(); x.ellipse(6.5, 12 - D.glide * 2, 3, 1.7, 0, 0, 6.283); x.fill();
  // kollar: itmede yukarıda, taşırken aşağıda (Feza'nın ellerini tutar), "gel" derken el sallar
  const arm = (far) => {
    const shx = far ? 6 : 4, shy = far ? -1.5 : 0;
    let px = lerp(far ? 10.5 : 8.8, far ? 12.5 : 2, pose), py = lerp(far ? 2.2 : 3.8, far ? -24.5 : -26.5, pose);
    px = lerp(px, far ? 12.5 : 11.5, grip); py = lerp(py, far ? 5.5 : 6.5, grip);
    if (!far && bk > 0.01) { const w = Math.sin(tm * 9); px = lerp(px, 12 + w * 2.6, bk); py = lerp(py, -9 - w * 3.4, bk); }
    x.strokeStyle = far ? C.purD : C.pur; x.lineWidth = 3.2; x.lineCap = 'round';
    x.beginPath(); x.moveTo(shx, shy); x.lineTo(px, py); x.stroke();
    x.fillStyle = far ? C.lavD : C.lav; x.beginPath(); x.arc(px, py, 2.1 + pose * 0.5 + grip * 0.3, 0, 6.283); x.fill();
    x.strokeStyle = C.line; x.lineWidth = 0.6; x.stroke();
  };
  if (pose > 0.3) { arm(true); arm(false); } else arm(true);

  const bg = x.createRadialGradient(2, -2, 1, 0, 3, 13);
  bg.addColorStop(0, C.purL); bg.addColorStop(0.6, C.pur); bg.addColorStop(1, C.purD);
  x.fillStyle = bg; x.beginPath(); x.ellipse(-0.5, 3, 9.2, 9.8, -0.15, 0, 6.283); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  for (let i = 0; i < 3; i++) {
    const a = -2.35 + i * 0.42, ex = -0.5 + Math.cos(a) * 9.2, ey = 3 + Math.sin(a) * 9.8;
    x.save(); x.translate(ex, ey); x.rotate(a + Math.PI / 2);
    x.fillStyle = C.spine; x.beginPath(); x.ellipse(0, -1, 2.4 - i * 0.3, 2.6 - i * 0.3, 0, Math.PI, 0); x.fill();
    x.strokeStyle = 'rgba(150,70,170,0.6)'; x.lineWidth = 0.6; x.stroke();
    x.restore();
  }
  x.fillStyle = C.lav; x.beginPath(); x.ellipse(3.6, 4.6, 5.2, 7.2, -0.22, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(3.6, 4.6, 5.2, 7.2, -0.22, 0, 6.283); x.clip();
  x.strokeStyle = 'rgba(160,120,220,0.55)'; x.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) { const yy = 0 + i * 3.2; x.beginPath(); x.moveTo(-1, yy + 1.2); x.quadraticCurveTo(3.8, yy + 2.6, 9, yy - 0.2); x.stroke(); }
  x.restore();
  const lg = D.glide * 2;
  x.fillStyle = C.pur; x.beginPath(); x.ellipse(-3.2 - grip * 2.6, 8.6 - lg * 0.5 + grip * 2, 4.6, 4.2, -0.3 - grip * 0.5, 0, 6.283); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.7; x.stroke();
  const fx = lerp(-0.6, DR_PAW[0] + 0.6, grip), fy = lerp(12.4 - lg, DR_PAW[1] - 0.8, grip);
  x.fillStyle = C.lav; x.beginPath(); x.ellipse(fx, fy, 3.6, 2 + grip * 0.4, 0.1 + grip * 1.1, 0, 6.283); x.fill(); x.stroke();
  x.fillStyle = C.pink; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(fx + 2 - grip * 2.6 + i * 0.1 * (1 - grip) - grip * i * 0.9, fy - 1.1 + i * (1 - grip) + grip * 1.6, 0.55, 0, 6.283); x.fill(); }
  if (pose <= 0.3) arm(false);

  drawWing(x, false, tm);

  // ── kafa ──
  x.save(); x.translate(4.5, -9); x.rotate(D.headTilt + D.headRoll); x.translate(-4.5, 9);
  const ef = Math.sin(tm * 3.1) * 0.12 + (D.expr === 'happy' ? Math.sin(tm * 14) * 0.15 : 0) - D.yawn * 0.25;
  x.save(); x.translate(-3.5, -12.5); x.rotate(ef);
  x.fillStyle = C.pink; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-5, -7, -9.5, -6.5); x.quadraticCurveTo(-7.5, -4, -9.5, -2); x.quadraticCurveTo(-7, -0.5, -8, 2.5); x.quadraticCurveTo(-4, 2, 0, 3); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(170,70,170,0.7)'; x.lineWidth = 0.6; x.stroke();
  x.beginPath(); x.moveTo(0, 1); x.lineTo(-9, -6); x.moveTo(0, 1.5); x.lineTo(-8.8, -1.5); x.stroke();
  x.restore();
  const horn = (bx, by, s, col) => {
    x.save(); x.translate(bx, by); x.scale(s, s);
    const hg = x.createLinearGradient(0, 0, -6, -7); hg.addColorStop(0, col); hg.addColorStop(1, '#fffaf0');
    x.fillStyle = hg; x.beginPath(); x.moveTo(-2.4, 0.8); x.quadraticCurveTo(-3.4, -4.6, -6.6, -7.6); x.quadraticCurveTo(-6.2, -8.6, -5.4, -7.9); x.quadraticCurveTo(0.6, -5, 2.4, 0); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(120,80,50,0.8)'; x.lineWidth = 0.7; x.stroke();
    x.restore();
  };
  horn(7.6, -20, 1.05, C.hornD);
  horn(2, -19.6, 1.3, C.horn);
  const headPath = () => {
    x.beginPath(); x.moveTo(-5.5, -8);
    x.bezierCurveTo(-6, -16.5, -1, -21.8, 5, -21.8);
    x.bezierCurveTo(10.8, -21.8, 13.6, -18.4, 14.6, -14.8);
    x.bezierCurveTo(15.8, -13.4, 18.6, -12, 18.6, -8.6);
    x.bezierCurveTo(18.6, -5, 15.6, -2.9, 11.6, -2.8);
    x.bezierCurveTo(7, -2.6, 1, -1.4, -2, -3.4);
    x.bezierCurveTo(-4.4, -4.9, -5.3, -6.4, -5.5, -8); x.closePath();
  };
  const hg = x.createRadialGradient(6, -17, 1, 5, -11, 15);
  hg.addColorStop(0, '#b996ff'); hg.addColorStop(0.6, C.pur); hg.addColorStop(1, C.purD);
  headPath(); x.fillStyle = hg; x.fill();
  x.save(); headPath(); x.clip();
  const mg = x.createRadialGradient(15, -6.5, 0.5, 15, -6.5, 7.5);
  mg.addColorStop(0, 'rgba(214,190,255,0.85)'); mg.addColorStop(1, 'rgba(214,190,255,0)');
  x.fillStyle = mg; x.fillRect(5, -16, 16, 15);
  x.beginPath(); x.rect(-8, -30, 30, 14); x.clip();
  x.translate(0.6, 1.4); headPath(); x.strokeStyle = 'rgba(255,240,255,0.42)'; x.lineWidth = 1.2; x.stroke();
  x.restore();
  headPath(); x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  x.fillStyle = '#4a2390'; x.beginPath(); x.ellipse(17.1, -9.6, 0.62, 0.48, -0.3, 0, 6.283); x.fill();
  if (D.puff > 0.02) {   // şişkin yanak: kafa çizgisinin dışına taşar
    const pr = D.puff, cx = 11.8 + pr * 1.2, cy = -4.8 + pr * 0.9, rx = 3.2 + 4.2 * pr, ry = 2.4 + 3.6 * pr;
    x.fillStyle = '#9768f4'; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 6.283); x.fill();
    x.fillStyle = 'rgba(214,190,255,0.5)'; x.beginPath(); x.ellipse(cx + 0.8, cy - 0.6, rx * 0.6, ry * 0.5, 0, 0, 6.283); x.fill();
    x.strokeStyle = C.line; x.lineWidth = 0.8; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, -0.25, Math.PI + 0.35); x.stroke();
  }
  const blush = (D.expr === 'normal' ? 0.42 : 0.7) + D.puff * 0.2;
  x.fillStyle = `rgba(255,128,196,${Math.min(0.9, blush)})`; x.beginPath(); x.ellipse(6.6 + D.puff * 3.5, -5.6 + D.puff, 2.7 + D.puff, 1.5 + D.puff * 0.5, 0, 0, 6.283); x.fill();

  // gözler (ikisi de kafanın içinde; uzak göz burun köprüsünün arkasında, küçük)
  const ex1 = 6.3, ey1 = -12, ex2 = 12.9, ey2 = -12.6;
  x.save(); headPath(); x.clip();
  const blink = D.blinkT < 0 ? Math.max(0.08, Math.abs(D.blinkT + 0.07) / 0.07) : 1;
  const kind = drEyeKind(false);
  x.strokeStyle = C.eye; x.lineCap = 'round'; x.lineJoin = 'round';
  if (kind === 'happy') {
    x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(ex1 - 3.2, ey1 + 1.3); x.quadraticCurveTo(ex1, ey1 - 3.4, ex1 + 3.2, ey1 + 1.3); x.stroke();
    x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(ex2 - 1.6, ey2 + 1.1); x.quadraticCurveTo(ex2 + 0.1, ey2 - 2.4, ex2 + 1.5, ey2 + 1.1); x.stroke();
  } else if (kind === 'chev') {
    x.lineWidth = 1.4;
    x.beginPath(); x.moveTo(ex1 - 2.8, ey1 - 2.4); x.lineTo(ex1 + 2, ey1); x.lineTo(ex1 - 2.8, ey1 + 2.2); x.stroke();
    x.lineWidth = 1.1;
    x.beginPath(); x.moveTo(ex2 + 1.4, ey2 - 2); x.lineTo(ex2 - 1.2, ey2); x.lineTo(ex2 + 1.4, ey2 + 1.9); x.stroke();
  } else {
    const big = D.expr === 'wow' ? 1.12 : 1;
    const eye = (cx, cy, rx, ry, near) => {
      x.save(); x.translate(cx, cy);
      if (kind === 'closed' || blink * D.lid <= 0.4) { drClosedEye(x, rx, ry, kind === 'closed' && near ? -1 : 0, near ? 1.3 : 1); x.restore(); return; }
      x.scale(big, blink * D.lid * big);
      drOpenEye(x, rx, ry, 1);
      x.strokeStyle = C.eye; x.lineWidth = near ? 1.1 : 0.8;
      x.beginPath(); x.ellipse(0, 0, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.95); x.stroke();
      if (near) { x.beginPath(); x.moveTo(-rx * 0.92, -ry * 0.38); x.lineTo(-rx * 1.3, -ry * 0.62); x.stroke(); }
      x.strokeStyle = 'rgba(58,26,128,0.35)'; x.lineWidth = 0.5; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, Math.PI); x.stroke();
      x.restore();
    };
    eye(ex2, ey2, 1.9, 3.9, false);
    eye(ex1, ey1, 3.95, 5.1, true);
  }
  x.restore();
  drMouthDraw(x, 15.15, -5.05, 2.55, false);
  if (D.expr === 'effort' && D.mk === 'o') { x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.arc(13, -24, 1, 0, 6.283); x.arc(15.2, -25.6, 0.6, 0, 6.283); x.fill(); }
  x.restore();   // kafa
}

// gövde + kuyruk (oyunda ve ara sahnelerde ortak); front: true/false sabit poz, undefined: oyundaki dönüş karışımı
function drBody(x, tm, front) {
  if (D.glowA > 0.01) { x.globalCompositeOperation = 'lighter'; drGlow(x, '#a678ff', D.x, D.y + D.bob - 4, 44, 0.2 * D.glowA); x.globalCompositeOperation = 'source-over'; }
  drawTail(x, tm);
  const fw = front === undefined ? D.fw : front ? 1 : 0;
  const sw = 1 + 0.15 * D.puff, sh = 1 + 0.12 * D.puff;
  const drawAt = (ctx, ox, oy, fr) => {
    ctx.save(); ctx.translate(ox, oy + D.bob);
    if (fr) { ctx.rotate(D.tilt * 0.4 * D.face); ctx.scale(sw, sh); drFront(ctx, tm); }
    else { ctx.scale(D.face * (1 - 0.12 * fw), 1); ctx.rotate(D.tilt); ctx.scale(sw, sh); drSide(ctx, tm); }
    ctx.restore();
  };
  if (fw <= 0.001) drawAt(x, D.x, D.y, false);
  else if (fw >= 0.999) drawAt(x, D.x, D.y, true);
  else {   // kısa geçiş: iki poz ayrı tuvallerde çizilip karıştırılır
    const R = 56, px = Math.ceil(R * 2 * S);
    for (let k = 0; k < 2; k++) {
      let oc = drCanv[k]; if (!oc) oc = drCanv[k] = document.createElement('canvas');
      if (oc.width !== px) { oc.width = oc.height = px; }
      const c2 = oc.getContext('2d'); c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, px, px);
      c2.setTransform(S, 0, 0, S, R * S, R * S);
      drawAt(c2, 0, 0, k === 1);
      x.globalAlpha = k === 0 ? Math.min(1, 2 * (1 - fw)) : Math.min(1, 2.5 * fw);
      x.drawImage(oc, D.x - R, D.y - R, R * 2, R * 2);
    }
    x.globalAlpha = 1;
  }
}

function drawDragon(tm) {
  dragonInit();
  const x = g;
  // yol gösterme: kalıcı noktalı ışık izi ve hedefte yumuşak nabız
  if (D.iz.length || D.pulse.length) {
    x.globalCompositeOperation = 'lighter';
    for (const p of D.iz) {
      const a = Math.min(1, p.life / 1.2) * Math.min(1, (p.max - p.life) * 6), tw = 0.7 + 0.3 * Math.sin(tm * 6 + p.ph);
      drGlow(x, p.col, p.x, p.y + Math.sin(tm * 2 + p.ph) * 1.5, 14 * tw, 0.8 * a);
    }
    for (const q of D.pulse) {
      if (q.t < 0) continue;
      const u = q.t / q.life, a = Math.sin(u * Math.PI);
      drGlow(x, '#fff0c0', q.x, q.y, q.r * (0.8 + u * 0.9), 0.32 * a);
      x.strokeStyle = `rgba(255,236,190,${0.55 * a})`; x.lineWidth = 3 * (1 - u) + 1;
      x.beginPath(); x.arc(q.x, q.y, q.r * (0.35 + u * 0.9), 0, 6.283); x.stroke();
    }
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = '#fffbe8';
    for (const p of D.iz) { const a = Math.min(1, p.life / 1.2) * Math.min(1, (p.max - p.life) * 6); drTwinkle(x, p.x, p.y + Math.sin(tm * 2 + p.ph) * 1.5, 3.6 * (0.7 + 0.3 * Math.sin(tm * 6 + p.ph)), 0.85 * a); }
  }
  if (D.trail.length > 1) {
    x.save(); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
    for (let i = 1; i < D.trail.length; i++) {
      const a = D.trail[i - 1], b = D.trail[i], al = Math.min(a.life, b.life) / 0.28;
      x.strokeStyle = `rgba(200,160,255,${0.35 * al})`; x.lineWidth = 16 * al;
      x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
      x.strokeStyle = `rgba(255,235,255,${0.6 * al})`; x.lineWidth = 4 * al; x.stroke();
    }
    x.restore();
  }
  drBody(x, tm);

  // ışık nefesi: yumuşak koni + parçacıklar
  if (D.blowM > 0.01 || D.nf.length) {
    x.globalCompositeOperation = 'lighter';
    if (D.blowM > 0.01) {
      const mo = drMouthPos(), a = D.nfA, L = 300 * D.blowM, hw = 0.2;
      const gr = x.createLinearGradient(mo.x, mo.y, mo.x + Math.cos(a) * L, mo.y + Math.sin(a) * L);
      gr.addColorStop(0, `rgba(255,250,220,${0.42 * D.blowM})`); gr.addColorStop(0.4, `rgba(200,240,255,${0.16 * D.blowM})`); gr.addColorStop(1, 'rgba(200,220,255,0)');
      x.fillStyle = gr; x.beginPath(); x.moveTo(mo.x, mo.y);
      x.arc(mo.x, mo.y, L, a - hw, a + hw); x.closePath(); x.fill();
      drGlow(x, '#fff6d6', mo.x, mo.y, 16 + 6 * Math.sin(tm * 30), 0.8 * D.blowM);
    }
    for (const p of D.nf) {
      const u = 1 - p.life / p.max;
      if (p.k === 1) { drGlow(x, p.col, p.x, p.y, p.size, 0.7); continue; }
      const al = Math.min(1, (1 - u) * 1.6) * Math.min(1, u * 12);
      if (p.k === 2) continue;
      drGlow(x, p.col, p.x, p.y, p.size * (0.7 + u * 1.3), 0.55 * al);
    }
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = '#ffffff';
    for (const p of D.nf) if (p.k === 2) { const u = 1 - p.life / p.max; drTwinkle(x, p.x, p.y, p.size * (0.6 + 0.4 * Math.sin(tm * 20 + p.max * 9)), Math.min(1, (1 - u) * 2)); }
  }

  // kalpler ve yıldızlar
  for (const f of D.fx) {
    const a = f.life / f.max, s = (f.type === 'heart' ? 4.2 : 4.6) * (0.6 + 0.4 * Math.min(1, (f.max - f.life) * 6));
    x.globalCompositeOperation = 'lighter'; drGlow(x, f.col, f.x, f.y, 12, a * 0.5); x.globalCompositeOperation = 'source-over';
    x.save(); x.translate(f.x, f.y); x.rotate(f.r); x.globalAlpha = Math.min(1, a * 1.6); x.fillStyle = f.col;
    if (f.type === 'heart') drHeart(x, s); else drStar(x, s);
    x.restore();
  }
  x.globalAlpha = 1;
}

// ── ara sahne yardımcısı: pirilCizPoz(ctx, x, y, olcek, poz, tm, u) ──
// poz: 'pelus' (Feza'nın kolunda gevşek, uyuyan peluş) · 'uyaniyor' (u: 0→1 gözler açılır, gerinir, ışık başlar;
// u verilmezse 0.6) · 'ucus' (uçuyor) · 'goz_kirp' (peluş gibi, bir gözü kırpık). x,y = gövde ortası. Oyundaki duruma dokunmaz.
const DR_POZ_KEYS = ['x', 'y', 'bob', 'tilt', 'face', 'fs', 'fw', 'ph', 'glide', 'pose', 'expr', 'blinkT', 'lookX', 'lookY', 'headTilt',
  'headRoll', 'puff', 'blowM', 'mouth', 'yawn', 'stretch', 'fold', 'grip', 'plush', 'glowA', 'eyeOv', 'eyeOvR', 'lid', 'beckon', 'tail', 'hop', 'mk', 'ma'];
const drPozSave = {};
let drPozTail = null;
function drPozTailCurl(curl, wave, tm) {   // önden pozlar: kuyruk sağ yandan çıkıp kıvrılır
  let px = 4, py = 9, h = 0.3;
  for (let i = 0; i < DR_TAIL_N; i++) {
    drPozTail[i].x = px; drPozTail[i].y = py;
    h -= lerp(0.06, 0.2, curl) + wave * Math.sin(tm * 3 - i * 0.6) * 0.12;
    px += Math.cos(h) * DR_TAIL_LEN * 1.05; py += Math.sin(h) * DR_TAIL_LEN * 1.05;
  }
}
function pirilCizPoz(ctx, x, y, olcek, poz, tm, u) {
  dragonInit();
  for (const k of DR_POZ_KEYS) drPozSave[k] = D[k];
  if (!drPozTail) { drPozTail = []; for (let i = 0; i < DR_TAIL_N; i++) drPozTail.push({ x: 0, y: 0 }); }
  D.x = 0; D.y = 0; D.bob = 0; D.tilt = 0; D.fw = 0; D.face = D.fs = 1; D.hop = 0; D.glide = 0;
  D.puff = 0; D.blowM = 0; D.mouth = 0; D.yawn = 0; D.stretch = 0; D.fold = 0; D.grip = 0; D.pose = 0; D.plush = 0; D.glowA = 1;
  D.eyeOv = null; D.eyeOvR = null; D.headRoll = 0; D.headTilt = 0; D.lookX = 0; D.lookY = 0.25; D.expr = 'normal'; D.lid = 1; D.beckon = 0;
  D.blinkT = 1; D.tail = drPozTail;
  tm = tm || 0;
  let front = true, halo = 0;
  if (poz === 'ucus') {
    front = false; D.ph = tm * 3.4 * 6.283; D.bob = Math.sin(D.ph - 0.7) * 2.2; D.tilt = -0.05 + Math.sin(tm * 1.3) * 0.04;
    D.lookX = 1; D.lookY = 0.1; D.expr = 'happy'; halo = 1;
    let p = { x: -7, y: 6 + D.bob };
    for (let i = 0; i < DR_TAIL_N; i++) {
      drPozTail[i].x = p.x; drPozTail[i].y = p.y;
      const uu = (i + 1) / (DR_TAIL_N - 1), ang = Math.PI - 0.75 + uu * 1.7 + Math.sin(tm * 3.2 - uu * 3.2) * 0.32 * (0.4 + uu);
      p = { x: p.x + Math.cos(ang) * DR_TAIL_LEN, y: p.y + Math.sin(ang) * DR_TAIL_LEN };
    }
  } else if (poz === 'uyaniyor') {
    const v = u === undefined ? 0.6 : clamp(u, 0, 1);
    const eo = smooth(clamp((v - 0.1) / 0.35, 0, 1)), st = Math.sin(clamp((v - 0.35) / 0.55, 0, 1) * Math.PI);
    D.plush = 1 - smooth(clamp((v - 0.2) / 0.6, 0, 1)); D.glowA = smooth(clamp((v - 0.25) / 0.6, 0, 1)); halo = D.glowA;
    D.ph = 1.2 + st * 0.8; D.fold = 1 - smooth(clamp((v - 0.3) / 0.5, 0, 1)); D.stretch = st;
    D.pose = st * 0.9; D.headRoll = lerp(0.22, 0, smooth(v)); D.headTilt = -0.15 * st;
    if (eo < 0.05) D.eyeOv = 'closed';
    else { D.lid = Math.max(0.42, eo); const fl = Math.sin(tm * 9); if (eo < 0.9 && fl > 0.75) D.eyeOv = 'closed'; }
    D.expr = v > 0.85 ? 'happy' : 'normal'; if (st > 0.5) D.yawn = (st - 0.5) * 1.4;
    D.lookY = 0.1;
    drPozTailCurl(lerp(1, 0.55, smooth(v)), smooth(v), tm);
  } else if (poz === 'goz_kirp') {
    D.plush = 1; D.glowA = 0; D.ph = 1.2; D.fold = 1; D.headRoll = 0.16;
    D.eyeOv = 'open'; D.eyeOvR = 'happy'; D.expr = 'grin'; D.lookX = 0.15; D.lookY = 0.15;
    drPozTailCurl(1, 0, tm);
  } else {   // pelus: gevşek, uyuyan, ışıksız peluş
    D.plush = 1; D.glowA = 0; D.ph = 1.2; D.fold = 1; D.headRoll = 0.24 + Math.sin(tm * 0.9) * 0.02;
    D.eyeOv = 'closed'; D.expr = 'normal';
    drPozTailCurl(1, 0, tm);
  }
  ctx.save(); ctx.translate(x, y); ctx.scale(olcek, olcek);
  if (halo > 0.01) { const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter'; drGlow(ctx, '#b88aff', 0, 0, 90, 0.3 * halo); drGlow(ctx, '#ffe0ff', 0, 0, 30, 0.18 * halo); ctx.globalCompositeOperation = op; }
  drBody(ctx, tm, front);
  if (poz === 'goz_kirp') {   // kırpılan gözün yanında küçük parıltı
    const tw = 0.6 + 0.4 * Math.sin(tm * 5);
    ctx.fillStyle = '#fff6c8'; drTwinkle(ctx, 14, -22, 3.2 * tw, 0.9);
  }
  ctx.restore();
  for (const k of DR_POZ_KEYS) D[k] = drPozSave[k];
}

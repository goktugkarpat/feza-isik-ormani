/* piril.js – Pırıl (mor bebek ejderha, Ori'deki Sein gibi ışık veren rehber):
   davranış (stepDragon, dragonPush, dragonHappy, dragonCarry), ışık nefesi ('karanlik'), yol gösterme, tepkiler/sesler,
   çizim (drawDragon) ve ara sahne yardımcısı pirilCizPoz.
   Klasik script: üst düzey const/let/function'lar diğer dosyalarla ortak (ortak.js önce yüklenir). Özel adlar dr* ile başlar.
   Diğer modüller için dışa açık durum: D.tasiyor (Feza'yı taşıyor), D.pence {x,y} (pençelerin dünya konumu),
   D.mode, OLAY 'nefes' {asama:'basla'|'al'|'ver'|'bitti'}. */
/* [MINI ekledi] Yalnız bir 'takim' modu dalı (stepDragon içinde 'dans' dalından önce): takim.js Takımyıldızı çiz mini oyunu için. Başka değişiklik yok. */
'use strict';
const DR_TAIL_N = 7, DR_TAIL_LEN = 3.2;   // peluştaki gibi orta boy, incelerek yassı küreğe biten kuyruk
// renkler: Feza'nın gerçek peluşu (lila gövde, limon yeşili karın/kulak, koyu yeşil ibik, yeşil gözler)
const DR_COL = { pur: '#b28ae6', purL: '#d2b6f7', purD: '#8660c4', line: '#52338c', lime: '#bde43a', limeL: '#d9f27e', limeD: '#93bd28',
  crest: '#2f8a2c', crestL: '#55ad44', crestD: '#1f5c1c', eye: '#1c1228' };
const DR_NEFES = ['#fff6d6', '#d9f6ff', '#e8d6ff', '#ffffff', '#ffd6f2', '#bff4ff'];
const DR_IZ = ['#fff2a8', '#ffe0f6', '#e2ccff', '#ffffff'];
const DR_PAW = [-9, 17];  // taşırken Feza'nın elini tutan arka ayağın yerel konumu: gövde elin ÜSTÜNDE ve elin Feza'nın başından UZAK tarafında (yüzünü/saçını kapatmaz)
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
  D.stretch = 0; D.fold = 0; D.wingA = 1; D.grip = 0; D.plush = 0; D.glowA = 1; D.eyeOv = null; D.eyeOvR = null; D.lid = 1;
  D.beckon = 0; D.beckonW = 0; D.mk = 'smile'; D.ma = 0;
  D.lookAt = { x: 0, y: 0 }; D.lookAtT = 0; D.tiltWant = null; D.faceHold = 0; D.lockF = 0;
  // ışık nefesi, yol gösterme, tepkiler
  D.nf = []; D.nfQ = []; D.nfA = 0; D.iz = []; D.pulse = []; D.izT = 0;
  D.guideCd = BOLUM_NO === 2 ? 5 : 18; D.yolSayT = -99; D.wrongT = 0; D.playCd = 10; D.yayCd = 0; D.kurtarT = -99;
  D.bayrak = {}; D.nCicek = 0; D.since = 0; D.praiseK = 0; D.praiseT = -99; D.wowO = null; D.gosterO = null; D.danceAfter = false;
  D.tasiyor = false; D.pence = { x: D.x, y: D.y + 12 };
  D.falls = []; D.assistCd = 0; D.stuckT = 0; D.jumps = 0; D.bestD = 1e9; D.bestH = null; D.yardim = false;
  // ikincil hareket (yaylar): ibik, kulak, kuyruk küreği; ezilme/uzama; uzaklaşma (sırt görünüşü) ve derinlik
  D.sCr = { a: 0, v: 0 }; D.sEr = { a: 0, v: 0 }; D.sTl = { a: 0, v: 0 }; D.sSq = { a: 0, v: 0 };
  D.pvx = 0; D.pvy = 0; D.spd = 0; D.spin = 0; D.sq = 0; D.dz = 1; D.au = 0; D.awayW = 0; D.awayS = 1; D.bk = 0; D.tailRX = -7;
  // kişilik: boşta küçük oyunlar, ürkme, konuşma heceleri
  D.idleCd = 9; D.spo = null; D.sniff = 0; D.nom = 0; D.sitYawn = false; D.feYawn = false; D.gasp = 0;
  D.sylT = 0; D.sylT0 = 1; D.sylA = 0; D.sylN = 0; D.sylR = 0; D.mRound = 0; D.mWide = 0;
  D.tail = [];
  for (let i = 0; i < DR_TAIL_N; i++) D.tail.push({ x: D.x - D.f * (8 + i * DR_TAIL_LEN), y: D.y + 6 });
}

// yerel (ejderha) koordinatından dünyaya
function drLocal(lx, ly) {
  const sx = D.fs, ra = D.tilt + (D.spin || 0), c = Math.cos(ra), s = Math.sin(ra), z = D.dz || 1;
  return { x: D.x + sx * (lx * c - ly * s) * z, y: D.y + D.bob + (lx * s + ly * c) * z };
}
function drSpring(s, target, w, z, dt) {   // kritik altı sönümlü yay: hafif sekme (w: açısal frekans, z: sönüm oranı)
  const n = dt > 0.034 ? 2 : 1, h = dt / n;
  for (let i = 0; i < n; i++) { s.v += ((target - s.a) * w * w - s.v * 2 * z * w) * h; s.a += s.v * h; }
}
function drMouthPos() {   // ağzın dünya konumu (baş eğimi ve şişkinlik dahil)
  const ht = D.headTilt, c = Math.cos(ht), s = Math.sin(ht);
  const lx = 4.5 + 14.6 * c - 2.6 * s, ly = -9 + 14.6 * s + 2.6 * c;
  return drLocal(lx * (1 + 0.15 * D.puff), ly * (1 + 0.12 * D.puff));
}
function drResetTail() {
  const r = drLocal(D.tailRX, 6);
  for (let i = 0; i < D.tail.length; i++) { D.tail[i].x = r.x - D.ft * i * DR_TAIL_LEN; D.tail[i].y = r.y + i * 1.5; }
}
function drHandOff() {   // Feza'nın tutunduğu elin ayağa göre yeri (feza.js P.a_elX/elY verir; yoksa tahmin)
  // öğrenilen ofset Feza'nın baktığı yöne göre saklanır (fwd); dönerse el de doğru yana geçer
  if (!D.hOff) D.hOff = { x: P.f * 12, y: -74, fwd: 12 };
  if (P.a_elX !== undefined && P.rx !== undefined && P.fade > 0 && P.respawned) {
    const hx = (P.a_elX - P.rx) * (P.f || 1), hy = P.a_elY - P.ry;
    if (Math.abs(hx) < 40 && hy < -30 && hy > -110) { D.hOff.fwd = lerp(D.hOff.fwd, hx, 0.35); D.hOff.y = lerp(D.hOff.y, hy, 0.35); }
  }
  D.hOff.x = D.hOff.fwd * (P.f || 1);
  return D.hOff;
}
function drSparkle(x, y, n, spd) { burst(x, y, n, ['#d9b8ff', '#ffd6f2', '#ffffff'], spd, 0.8, 7); }
function drMode(m) { D.mode = m; D.modeT = 0; D.faceHold = 0; }   // yeni mod: zorla yüz yönü bırakılır (geri uçarken ay yürüyüşü olmasın)
function drSay(k, opt) { if (typeof SES !== 'undefined' && SES && SES.soyle) { try { SES.soyle(k, opt); } catch (e) {} } }
function drSfx(k, v) { if (typeof AU !== 'undefined' && AU && AU.sfx) { try { AU.sfx(k, v); } catch (e) {} } }
function drFree() { return D.mode === 'follow' || D.mode === 'orbit'; }
function drBusy() { return D.mode === 'firlat' || D.mode === 'push' || D.mode === 'tasi' || D.mode === 'dalis' || D.mode === 'nefes' || D.mode === 'yardim' || D.mode === 'sakli'; }
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
  if (D.mode === 'tasi' || D.mode === 'dalis' || D.mode === 'nefes' || D.mode === 'ugurla' || D.mode === 'hayvanH') return;
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
OLAY.on('konusma', v => {
  dragonInit(); if (v && v.kim === 'p') D.talkT = Math.max(D.talkT, v.sure || 2);
  if (v && v.anahtar === 'p_sakli') D.sakliIste = D.t;   // "yukarıda gizli bir yol var": girişi göstermeye uç (stepDragon uygun anı bekler)
});
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
// ── Bölüm 2: yıldız uğurlama, kaplumbağa heyecanı ──
OLAY.on('yildiz', o => {
  dragonInit(); if (!o || BOLUM_NO !== 2 || o.tip !== 'yildiz' || !isFinite(o.x) || !isFinite(o.y)) return;
  D.ugO = o; D.guideCd = Math.max(D.guideCd, 14); D.since = 0;
  if (D.mode === 'tasi' || D.mode === 'dalis' || D.mode === 'nefes' || D.mode === 'yardim' || D.mode === 'firlat' || o.zorla) return;   // fırlatış/yıldız dalgası: tek tek uğurlama yok
  D.flare = 1; D.pulse.length = 0; D.ugPX = o.x; D.ugPY = o.y; drMode('ugurla'); D.beckonW = 0; D.yawnT = -1; D.expr = 'wow'; D.exprT = 0.5;
});
OLAY.on('yildizYerlesti', o => {
  dragonInit(); if (BOLUM_NO !== 2) return;
  if (D.mode === 'ugurla' && D.ugO === o) { D.ugBitti = true; }
  else if (!drBusy() && !(o && o.zorla)) dragonHappy({ x: P.x, y: P.y - 90 });
});
OLAY.on('hayvanAsama', v => {
  dragonInit(); if (!v || !v.o || !isFinite(v.o.x) || BOLUM_NO !== 2 || !(drFree() || D.mode === 'yol' || D.mode === 'ilgi')) return;
  drMode('hayvanH'); D.ho = v.o; D.has = v.asama; D.expr = 'wow'; D.exprT = 0.8; drSparkle(D.x, D.y, 6, 80);
});
OLAY.on('hayvanFirlat', () => {   // Feza göğe fırlar: Pırıl yanında (üstünü örtmeden) yükselir, yıldız dalgasıyla sevinir
  dragonInit(); if (BOLUM_NO !== 2 || D.mode === 'tasi' || D.mode === 'dalis') return;
  drMode('firlat'); D.expr = 'wow'; D.exprT = 0.6; D.beckonW = 0; D.yawnT = -1; drSparkle(D.x, D.y, 10, 100);
});
OLAY.on('hayvanUyandi', () => {
  dragonInit(); if (BOLUM_NO !== 2) return;
  if (!drBusy()) { drMode('yay'); D.yayDur = 1.7; D.yayBig = true; D.yayDir = 1; D.ya0 = Math.atan2(D.y - (P.y - 40), D.x - P.x); D.expr = 'wow'; D.exprT = 0.4; drSparkle(D.x, D.y, 12, 110); }
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
  if (!(drFree() || D.mode === 'yol' || D.mode === 'oyna' || D.mode === 'merak' || D.mode === 'ilgi')) return;
  drMode('yay'); D.yayDur = big ? 1.7 : 1.0; D.yayBig = big; D.yayDir = Math.random() < 0.5 ? 1 : -1;
  D.ya0 = Math.atan2(D.y - (P.y - 40), D.x - P.x); D.expr = 'wow'; D.exprT = 0.35; D.yayCd = big ? 0 : 7;
  drSparkle(D.x, D.y, 8, 90);
});
OLAY.on('ziplama', () => { dragonInit(); D.jumps++; });
OLAY.on('agac', () => { dragonInit(); D.danceAfter = true; });
OLAY.on('durum', d => { dragonInit(); if (d === 'final') D.danceAfter = true; });
OLAY.on('kayboldu', () => { dragonInit(); if (drPlaying() && drFree() && D.guideCd <= 0) drGuide(); });
function drNilufer(grup) {   // nilüfer cümlesi her gölde bir kez (ses.js de göl başına bir kez, seyrek)
  const g = grup || 'gol', bk = 'nilufer:' + g;
  if (D.bayrak[bk]) return false;
  D.bayrak[bk] = true; drSay('p_nilufer', { yer: g }); return true;
}
OLAY.on('aydinlat', grup => {   // başka yerden gelirse de nilüfer cümlesi (göl başına bir kez)
  dragonInit();
  if (D.mode !== 'nefes' && !D.bayrak['nilufer:' + (grup || 'gol')]) setTimeout(() => drNilufer(grup), 1200);
});

// ── yol gösterme ──
function drGoalOpen(o) {
  return (o.tip === 'cicek' && !o.done) || (o.tip === 'buyukPofuduk' && !o.uyandi) ||
    (o.tip === 'agac' && !(typeof TREE !== 'undefined' && TREE && TREE.done)) || (o.tip === 'karanlik' && !o.lit) ||
    (o.tip === 'yildiz' && !o.done && !o.secmeli) || (o.tip === 'yildizHayvan' && !o.uyandi && o.hazir);
}
function drHedef() {
  let h = null;
  try { if (typeof HEDEF === 'function') h = HEDEF(); } catch (e) {}
  for (const o of NESNELER) if (o.tip === 'karanlik' && !o.lit && o.x > P.x - 200 && (!h || o.x < h.x)) h = o;
  if (BOLUM_NO === 2) {   // Yıldız Gölü: Feza'ya en yakın uyanmamış (zorunlu) yıldız; isteğe bağlı zor yıldızlar çağrılmaz
    let b = null, bd = 1e9;
    for (const o of NESNELER) if (o.tip === 'yildiz' && !o.done && !o.secmeli) { const d = Math.abs(o.x - P.x) + Math.abs(o.y - P.y) * 0.4 + (o.x < P.x - 200 ? 600 : 0); if (d < bd) { bd = d; b = o; } }
    if (b) return b;
    if (h && h.tip === 'yildiz' && h.secmeli) h = NESNELER.find(o => o.tip === 'yildizHayvan' && !o.uyandi) || null;
    return h;
  }
  // Büyük Pofuduk uyumuyorsa önce onun çiçekleri
  if (h && h.tip === 'buyukPofuduk') { let b = null; for (const o of NESNELER) if (o.buyukIcin && !o.done && (!b || Math.abs(o.x - P.x) < Math.abs(b.x - P.x))) b = o; if (b) h = b; }
  if (h && h.x < P.x - 450) {   // geride kalmış isteğe bağlı çiçek: öndekini seç
    let best = null; for (const o of NESNELER) if (drGoalOpen(o) && o.x > P.x - 150 && (!best || o.x < best.x)) best = o;
    if (best) h = best;
  }
  return h;
}
function drGoalToward(sg) { for (const o of NESNELER) if (drGoalOpen(o) && (o.x - P.x) * sg > 0 && Math.abs(o.x - P.x) < 700) return true; return false; }
function drGoalY(h) { return h.y - (h.tip === 'buyukPofuduk' ? 170 : h.tip === 'agac' ? 230 : h.tip === 'karanlik' ? 70 : h.tip === 'yildizHayvan' ? 190 : h.tip === 'yildiz' ? 46 : 40); }
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
  if (!h0 && D.t - D.yolSayT > 45 && D.assistCd <= 0) { D.yolSayT = D.t; drSay('p_yol', { oncelik: 0 }); }   // az önce elinden tuttuysa "bu tarafa gel" demesin
  return true;
}
// İlk uyuyan Pofuduk: söz bittikten az sonra Pırıl Pofuduğa süzülüp karnındaki soluk ışığı gösterir (el yok; ışıltılı iz + nabız)
OLAY.on('dokun:konusma', o => {
  if (!o || o.anahtar !== 'p_uyuyor' || !o.konu || typeof omZamanla !== 'function') return;
  omZamanla(1.2, () => {
    dragonInit();
    if (DURUM !== 'oyun' || o.konu.uyandi || D.bayrak.ilkPofGoster || !drFree()) return;
    D.bayrak.ilkPofGoster = true; drGuide(o.konu);
  });
});
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
    // çiçekse önce dokunma menzilinin içine (r 34) koy: yardım işi bitirsin, bir adım dışarıda takılı kalmasın
    const ici = h.tip === 'cicek' ? [-dir * 20, dir * 20, 0] : [];
    for (const off of [...ici, -dir * 44, -dir * 84, dir * 44, 0]) {
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
  if (D.sSq) { D.sSq.v -= 4.2; D.sTl.v += 5; D.sCr.v += 4; }
  P.fade = DR_HOLD; P.respawned = true; P.vx = P.vy = 0; P.kilit = Math.max(P.kilit || 0, 0.3);
  drMode('tasi'); D.tasiyor = true; D.grabbed = true; D.wasFall = false;
  D.pA = { x: P.x, y: P.y }; D.pE = { x: tx, y: ty };
  D.cpx = P.x; D.cpy = P.y;
  drPlanRoute(1.0, 560, 1.3, 2.8);
  D.tDir = Math.abs(D.pE.x - D.pA.x) > 20 ? Math.sign(D.pE.x - D.pA.x) : P.f;
  drSparkle(D.pence.x, D.pence.y, 12, 90);   // parıltı elle patinin buluştuğu yerde (yüzünde değil)
  drSfx('dbl');
}
// taşıma rotası: kübik eğri (önce yukarı, üstten geç, sonra in). Yol üstünde yüksek bir duvar/kütük/katı cisim varsa
// tepe noktası engeli aşana dek yükselir; böylece Feza (ve üstündeki Pırıl) hiçbir şeyin içinden geçmez.
const DR_RP = { x: 0, y: 0 };
function drRouteAt(e, top) {
  const a = D.pA, b = D.pE, c1x = lerp(a.x, b.x, 0.18), c2x = lerp(a.x, b.x, 0.82), m = 1 - e;
  DR_RP.x = m * m * m * a.x + 3 * m * m * e * c1x + 3 * m * e * e * c2x + e * e * e * b.x;
  DR_RP.y = m * m * m * a.y + 3 * m * m * e * Math.min(top, a.y) + 3 * m * e * e * Math.min(top, b.y) + e * e * e * b.y;
  return DR_RP;
}
function drRoute(e) { return drRouteAt(e, D.pTop); }
function drBlocked(px, py) {   // Feza'nın gövdesi (+ elinden tutan Pırıl) bu noktada katı bir şeye değer mi
  if (typeof cell !== 'function') return false;
  const c0 = Math.floor((px - 13) / T), c1 = Math.floor((px + 13) / T), r0 = Math.floor((py - 112) / T), r1 = Math.floor((py - 6) / T);
  for (let c = c0; c <= c1; c++) for (let r = Math.max(0, r0); r <= r1; r++) if (cell(c, r) === 1) return true;
  if (typeof CISIMLER !== 'undefined') for (const o of CISIMLER) {
    const k = o.cisim; if (!k || !k.aktif || k.tip === 'ustten') continue;
    if (Math.abs(o.x - px) < k.w / 2 + 13 && py - 6 > o.y - k.h && py - 112 < o.y) return true;
  }
  return false;
}
function drPlanRoute(t0, sp, tmin, tmax) {
  const a = D.pA, b = D.pE, dx = Math.abs(b.x - a.x);
  let top = Math.min(a.y, b.y) - 70 - dx * 0.09, ok = false;
  for (let k = 0; k < 14 && !ok; k++) {
    ok = true;
    for (let i = 3; i <= 37; i++) { const q = drRouteAt(i / 40, top); if (drBlocked(q.x, q.y)) { ok = false; break; } }
    if (!ok) top -= 34;
  }
  top = Math.max(top, 40);   // ekranın/dünyanın tepesinden çıkmasın
  D.pTop = top;
  let len = 0, px = a.x, py = a.y;
  for (let i = 1; i <= 20; i++) { const q = drRouteAt(i / 20, top); len += Math.hypot(q.x - px, q.y - py); px = q.x; py = q.y; }
  D.tDur = clamp(t0 + len / sp, tmin, tmax);
}
// takılınca yardım (düşmeden): "Gel, sana yardım edeyim!" (p_yardim). Kayıt yoksa sessiz yardım (övgü de yok).
function drEncourage() {
  const L = typeof SES !== 'undefined' && SES && SES.LINES;
  if (L && (L.p_yardim || L.p_yardim1) && D.t - (D.yardimT || -99) > 25) { D.yardimT = D.t; drSay('p_yardim'); }
}

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
    const l = 1.1 + Math.random() * 0.8;
    // her ışık zerresi bir nilüfere doğru süzülür: ışığın gidip nilüferlere "kondu"ğu görülür (havada bulut kalmaz)
    const tg = D.nfL && D.nfL.length && Math.random() < 0.75 ? D.nfL[(Math.random() * D.nfL.length) | 0] : null;
    D.nf.push({ k, x: mo.x + Math.cos(a) * 3, y: mo.y + Math.sin(a) * 3, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: l, max: l,
      tx: tg ? tg.x + (Math.random() - 0.5) * 22 : 0, ty: tg ? tg.y - 4 : 0, tg: !!tg, age: 0,
      size: k ? 3 + Math.random() * 2.5 : 7 + Math.random() * 10, col: DR_NEFES[(Math.random() * DR_NEFES.length) | 0] });
  }
}

// ── davranış ──
function stepDragon(dt) {
  dragonInit();
  if (!(dt > 1e-4) || !isFinite(dt)) return;   // dt=0 / NaN: hiçbir şeyi bozma
  if (!isFinite(D.x) || !isFinite(D.y)) { D.x = P.x - 40; D.y = P.y - 100; D.vx = D.vy = 0; drResetTail(); }
  D.t += dt; D.modeT += dt; if (D.flare > 0) D.flare = Math.max(0, D.flare - dt / 0.9);
  const wx = Math.sin(D.t * 0.71) * 9 + Math.sin(D.t * 1.93) * 3, wy = Math.sin(D.t * 1.31) * 5 + Math.sin(D.t * 0.53) * 4;
  let tx = P.x - P.f * 40 + wx, ty = P.y - 112 + wy;
  let k = 28, damp = 8.5, direct = false, hopW = 0, flapW = 0, rollW = 0;
  D.tiltWant = null; D.grip = lerp(D.grip, D.mode === 'tasi' && D.grabbed ? 1 : 0, 1 - Math.exp(-dt * 14));
  D.guideCd -= dt; D.playCd -= dt; D.yayCd -= dt; D.lookAtT -= dt; D.faceHold -= dt; D.idleCd -= dt;
  let awayW = 0, sqW = 0, spinW = null;

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
      if (D.guideCd <= 0 && far && (P.idle > (BOLUM_NO === 2 ? 8 : 10) || D.wrongT > 4)) drGuide();
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
  if (playing && drFree()) {   // karanlık gölü ilk görüş: "hıh!" diye ürker, sonra kararlı bakar (ışık nefesinden önce)
    for (const o of NESNELER) if (o.tip === 'karanlik' && !o.lit && !o.irk) {
      const dx = o.x - P.x;
      if (Math.abs(dx) < 330 && o.x > cam.x - 20 && o.x < cam.x + VW + 20) { o.irk = true; drMode('irkil'); D.go = o; D.goDir = Math.sign(dx) || P.f; D.sCr.v -= 9; D.sEr.v -= 12; D.sSq.v -= 2.4; D.sTl.v += 6; }
      break;
    }
  }
  // saklı yol: "yukarıda gizli bir yol var!" derken girişe uçar, çevresinde parıltılı tur atar, el eder, geri döner
  if (D.sakliIste != null) {
    const sg = typeof BOLUM !== 'undefined' && BOLUM.sakliGiris;
    const uygun = drFree() || D.mode === 'yol' || D.mode === 'ilgi' || D.mode === 'oyna';   // başka gösteri sırasında asla
    if (!sg || D.t - D.sakliIste > 3.5 || D.danceAfter) D.sakliIste = null;
    else if (playing && uygun && D.t - (D.sakliT || -99) > 40 && Math.abs(sg.x - P.x) < 520) {
      D.sakliIste = null; D.sakliT = D.t; D.sg = sg;
      drMode('sakli'); D.sp = 0; D.yawnT = -1; D.spo = null; D.guideCd = Math.max(D.guideCd, 12);
      D.expr = 'wow'; D.exprT = 0.5; drSparkle(D.x, D.y, 6, 80);
    }
  }
  // boşta kendi küçük oyunları (kısa, Feza'nın yüzünü kapatmadan): çiçek koklama, uçuşan sporu yakalayıp yeme, minik takla
  if (playing && drFree() && D.idleCd <= 0 && P.ground && Math.abs(P.vx) < 150 && D.talkT <= 0 && D.modeT > 1.2 && !D.spo) {
    D.idleCd = 8 + Math.random() * 7;
    let fl = null;
    for (const o of NESNELER) if (o.tip === 'cicek' && Math.abs(o.x - P.x) < 240 && Math.abs(o.x - P.x) > 36 && Math.abs(o.y - P.y) < 100 && o.x > cam.x + 60 && o.x < cam.x + VW - 60 && (!fl || Math.abs(o.x - P.x) < Math.abs(fl.x - P.x))) fl = o;
    if (fl && D.koklandi !== fl && Math.random() < 0.8) { drMode('ilgi'); D.ik = 'kokla'; D.ikO = fl; D.ip = 0; D.koklandi = fl; }
    else if (Math.random() < 0.6) {
      const away = Math.sign(D.x - P.x) || -P.f;
      const sx = clamp(D.x + away * 64, cam.x + 70, cam.x + VW - 70), sy = Math.max(cam.y + 70, Math.min(D.y - 26, P.y - 150));
      D.spo = { x: sx, y: sy, vx: away * 18, vy: -8, a: 0, ph: Math.random() * 6.283, life: 0, eaten: false }; D.spDart = false;
      drMode('ilgi'); D.ik = 'spor'; D.ip = 0;
    } else { drMode('ilgi'); D.ik = 'takla'; D.ip = 0; D.tx0 = D.x; D.ty0 = D.y; D.tkDir = D.face; }
  }
  if (D.mode === 'follow' && P.idle > D.nextOrbit) { D.mode = 'orbit'; D.modeT = 0; D.oa = Math.atan2((D.y - (P.y - 104)) / 0.3, D.x - P.x); }
  // esneme bulaşır: Feza esneyince ya da oturunca o da esner (her bekleyişte bir kez)
  const fzSit = P.a_sit || 0, fzYawn = P.a_act === 'yawn' && (P.a_actT || 0) > 0.75;
  if (!fzSit) D.sitYawn = false;
  if (!fzYawn && P.idle < 0.5) D.feYawn = false;
  if (DURUM === 'oyun' && D.yawnT < 0 && (drFree() || (D.mode === 'ilgi' && D.ik !== 'takla'))) {
    if (fzSit > 0.7 && !D.sitYawn) { D.sitYawn = true; D.yawnT = 0; if (D.mode === 'ilgi') drMode('follow'); }
    else if (fzYawn && !D.feYawn) { D.feYawn = true; D.yawnT = 0; if (D.mode === 'ilgi') drMode('follow'); }
    else if (!D.yawned && P.idle > 14 && !fzSit) { D.yawned = true; D.yawnT = 0; }
  }

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
      D.ft = P.f; sqW = 0.17 * Math.sin(Math.PI * Math.min(1, D.modeT / dashT * 1.1));
    } else if (D.modeT < dashT + holdT) {   // ayaklarının altında: itme pozu
      if (!D.pushHit) {
        D.pushHit = true; D.sSq.v -= 2.4; D.sCr.v += 4; D.sEr.v += 3;
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
        D.grabbed = true; D.modeT = 0; D.sSq.v -= 4.2; D.sTl.v += 5; D.sCr.v += 4;   // ağır kaldırış: önce ezilir
        if (D.wasFall) drSayKurtar();   // "Tuttum seni!" tam yakaladığı anda
        const ho = drHandOff();
        D.pA = { x: D.pence.x - ho.x, y: D.pence.y - ho.y }; D.pE = { x: D.safeX, y: D.safeY };
        drPlanRoute(0.95, 620, 1.25, 2.6);
        D.tDir = Math.abs(D.pE.x - D.pA.x) > 20 ? Math.sign(D.pE.x - D.pA.x) : P.f;
        burst(D.x, ROWS * T - 30, 22, ['#bfe6ff', '#ffffff', '#d9b8ff'], 170, 0.9, 7);
        ripples.push({ x: D.x, y: ROWS * T - 30, r: 0, life: 0.8, small: true });
        drSfx('dbl');
      }
    }
    if (D.grabbed) {
      const u = clamp(D.modeT / D.tDur, 0, 1), e = smooth(u);
      const rp = drRoute(e); D.cpx = rp.x; D.cpy = rp.y;
      const ho = drHandOff(), pw = drLocal(DR_PAW[0], DR_PAW[1]);   // arka ayak Feza'nın elinde
      const nx = D.cpx + ho.x - (pw.x - D.x), ny = D.cpy + ho.y - (pw.y - D.y);
      D.vx = (nx - D.x) / dt; D.vy = (ny - D.y) / dt; D.x = nx; D.y = ny; direct = true;
      D.ft = D.tDir; P.f = D.tDir; flapW = u < 0.18 ? 10 : 8;
      if (u < 0.22) sqW = -0.11 * Math.sin(Math.PI * u / 0.22);   // yük: gövde basılır, kanatlar hızlı çırpar
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
      }
    }
  } else if (D.mode === 'yardim') {   // Feza'nın yanına gel, elini tut, kaldır
    const ho = drHandOff(), pl = drLocal(DR_PAW[0], DR_PAW[1]);
    tx = P.x + ho.x - (pl.x - D.x); ty = P.y + ho.y - (pl.y - D.y);
    k = 70; damp = 13; flapW = 6;
    D.ft = Math.sign(D.yt.x - P.x) || P.f; D.faceHold = 0.15;
    P.f = D.ft;   // Feza gideceği yöne döner: tutulan el o yanda, Pırıl'ın gövdesi başından uzakta kalır
    if ((D.x - P.x) * D.ft < 10) ty = Math.min(ty, P.y - 128);   // öbür yandaysa başının üstünden yüksekten geçsin
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
        drNilufer(D.nfO && D.nfO.grup);
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
      // uzağa, hedefe doğru uçarken sırtı bize dönük (3/4 arkadan), biraz küçülerek "derine" gider
      if (Math.abs(D.gx - D.x) > 70 && D.modeT < 1.5 && Math.hypot(D.x - D.gx, D.y - D.gy) > 40) { awayW = 1; D.awayS = dirG; D.awayDeep = 1; }
      D.lookAt.x = D.gx; D.lookAt.y = D.gy; D.lookAtT = 0.2;
      if (Math.hypot(D.x - D.gx, D.y - D.gy) < 26 || D.modeT > 1.7 || (D.modeT > 0.7 && Math.hypot(D.vx, D.vy) < 30)) {
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
      if (D.izT <= 0 && !(Math.abs(D.x - P.x) < 34 && D.y > P.y - 96 && D.y < P.y - 20)) { D.izT = 0.04; D.iz.push({ x: D.x - D.fs * 6 + (Math.random() - 0.5) * 4, y: D.y + 4 + (Math.random() - 0.5) * 4, life: 4.2, max: 4.2, ph: Math.random() * 6.283, col: DR_IZ[D.iz.length % 4] }); }
    }
  } else if (D.mode === 'sakli') {     // saklı yolun girişi: uç → parıltılı çember → "gel!" → dön
    const sg = D.sg, cx = sg.x, cy = clamp(sg.y - 70, cam.y + 70, cam.y + VH - 80);   // yaprak kemerinin ortası
    const dirG = Math.sign(cx - P.x) || P.f;
    if (D.sp === 0) {                  // girişe uç (sırtı bize dönük, hafif derine)
      tx = cx - dirG * 30; ty = cy - 22; k = 34; damp = 9.5; flapW = 5.5;
      if (Math.abs(tx - D.x) > 70 && D.modeT < 1.5) { awayW = 1; D.awayS = dirG; D.awayDeep = 1; }
      D.lookAt.x = cx; D.lookAt.y = cy; D.lookAtT = 0.2;
      if (Math.hypot(D.x - tx, D.y - ty) < 24 || D.modeT > 1.8) {
        D.sp = 1; D.modeT = 0; D.sa = Math.atan2((D.y - cy) / 0.63, D.x - cx);
        drPulse(cx, sg.y - 6, 48, 3); burst(cx, sg.y - 8, 12, ['#fff2a8', '#ffe0f6', '#ffffff'], 110, 0.9, 6);
      }
    } else if (D.sp === 1) {           // girişin çevresinde bir buçuk parıltılı tur
      const TUR_S = 1.7, a = D.sa - dirG * D.modeT * 6.283 * 1.5 / TUR_S;
      tx = cx + Math.cos(a) * 60; ty = cy + Math.sin(a) * 38;   // en alt nokta dalın üstünde kalır k = 140; damp = 19; flapW = 5.5;
      D.expr = 'happy'; D.exprT = 0.3;
      D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.11; drFx(D.x, D.y - 4, 'star'); }
      if (D.modeT > TUR_S) { D.sp = 2; D.modeT = 0; drSfx('parilti', 0.6); }
    } else if (D.sp === 2) {           // girişin üstünde Feza'ya dönüp pençesiyle "gel!"
      tx = cx - dirG * 8; ty = cy - 6 + Math.sin(D.modeT * 7) * 2.5; k = 45; damp = 11;
      D.ft = Math.sign(P.x - D.x) || -dirG; D.faceHold = 0.15;
      D.beckonW = 1; D.expr = 'happy'; D.exprT = 0.3;
      hopW = Math.abs(Math.sin(D.modeT * 6)) * 3;
      if (D.modeT > 0.5 && Math.random() < dt * 2) drPulse(cx, sg.y - 6, 40, 1);
      const geldi = Math.abs(P.x - cx) < 70 && P.y < sg.y + 20;
      if (D.modeT > 1.8 || (geldi && D.modeT > 0.4)) { drMode('follow'); D.beckonW = 0; D.lockF = 0.3; }
    } else drMode('follow');
    if (D.mode === 'sakli') {
      if (D.sp < 2) {   // noktalı ışık izi (birkaç saniye kalır): girişe giden yol
        D.izT -= dt;
        if (D.izT <= 0 && !(Math.abs(D.x - P.x) < 34 && D.y > P.y - 96 && D.y < P.y - 20)) { D.izT = 0.04; D.iz.push({ x: D.x - D.fs * 6 + (Math.random() - 0.5) * 4, y: D.y + 4 + (Math.random() - 0.5) * 4, life: 4.2, max: 4.2, ph: Math.random() * 6.283, col: DR_IZ[D.iz.length % 4] }); }
      }
      if (Math.abs(P.x - cx) > 650 || D.modeT > 4 || DURUM !== 'oyun') { drMode('follow'); D.beckonW = 0; }   // Feza uzaklaştı: bırak
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
  } else if (D.mode === 'ugurla') {    // uyanan yıldızı göğe uğurla: başını kaldır, onunla birlikte yüksel, sevin
    const o = D.ugO, side = Math.sign(D.x - P.x) || 1, u = D.modeT;
    const fl = (o.durum === 'ucuyor' || o.durum === 'yerlesti') && isFinite(o.x2), sx = fl ? o.x2 : o.x, sy = fl ? o.y2 : o.y - (o.rise || 0);
    if (!D.ugBitti && u < 6) {   // yıldızın kıvrımlı uçuşunu izle: hemen arkasında (iz bırakarak), sonra gökte yerleşince sevin
      const vx = sx - (D.ugPX == null ? sx : D.ugPX), dirS = Math.abs(vx) > 0.4 ? Math.sign(vx) : (Math.sign(sx - D.x) || side);
      D.ugPX = lerp(D.ugPX == null ? sx : D.ugPX, sx, 1 - Math.exp(-dt * 6));
      const lead = fl ? 1 : 0.55;
      tx = clamp(sx - dirS * 42 * lead, cam.x + 70, cam.x + VW - 70); ty = clamp(sy + 38 * lead + 12 + Math.sin(u * 4) * 5, cam.y + 56, P.y - 100);
      k = fl ? 44 : 26; damp = fl ? 9 : 8; flapW = 7; D.lookAt.x = sx; D.lookAt.y = sy; D.lookAtT = 0.25; D.ft = dirS; D.faceHold = 0.1;
      D.expr = u < 0.5 ? 'wow' : 'happy'; D.exprT = 0.3; rollW = clamp(-dirS * (sy - D.y) / 300, -0.25, 0.25);
      D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.2; drFx(D.x, D.y - 4, 'star'); }
    } else {                          // yıldız yerleşti: sevinç sıçraması
      D.ugT = (D.ugT || 0) + dt;
      if (D.ugT < dt * 1.5) { drSparkle(D.x, D.y, 10, 110); drSfx('parilti', 0.5); }
      tx = D.x + (P.x + side * 50 - D.x) * Math.min(1, D.ugT * 0.9); ty = D.y + (P.y - 140 - D.y) * Math.min(1, D.ugT * 0.9); k = 34; damp = 9; flapW = 7;
      D.expr = 'happy'; D.exprT = 0.4; hopW = Math.abs(Math.sin(D.ugT * 9)) * 6 * Math.max(0, 1 - D.ugT / 0.8);
      D.lookAt.x = sx; D.lookAt.y = sy; D.lookAtT = 0.2;
      if (D.ugT > 1.5) { D.ugO = null; D.ugT = 0; D.ugBitti = false; drMode('follow'); for (let i = 0; i < 3; i++) drFx(D.x, D.y - 6, 'star'); if (Math.random() < 0.3) drPraise(); }
    }
    if (D.modeT > 7) { D.ugBitti = false; D.ugT = 0; drMode('follow'); }
  } else if (D.mode === 'firlat') {    // Feza'nın fırlatışı: yanında yüksel, yukarı bak, sevin
    const u = D.modeT, side = Math.sign(D.x - P.x) || 1;
    tx = P.x + side * 62 + Math.sin(u * 3) * 8; ty = P.y - 40 + Math.sin(u * 4.4) * 8; k = 48; damp = 9; flapW = 7;
    D.lookAt.x = P.x; D.lookAt.y = P.y - 400; D.lookAtT = 0.25; D.ft = -side; D.faceHold = 0.1;
    D.expr = u < 0.8 ? 'wow' : 'happy'; D.exprT = 0.3; rollW = Math.sin(u * 5) * 0.15; hopW = Math.abs(Math.sin(u * 8)) * 4;
    D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.18; drFx(D.x, D.y - 4, 'star'); }
    if (u > 4.2 || DURUM !== 'oyun') drMode('follow');
  } else if (D.mode === 'hayvanH') {   // Yıldız Kaplumbağası uyanırken: merak/heyecan
    const o = D.ho, u = D.modeT, side = Math.sign(P.x - o.x) || -1;
    tx = P.x + Math.sin(u * 3.5) * 14 + side * 10; ty = P.y - 150 + Math.sin(u * 5) * 6; k = 40; damp = 10; flapW = 7;
    D.lookAt.x = o.x; D.lookAt.y = o.y - 150; D.lookAtT = 0.25; D.ft = Math.sign(o.x - D.x) || 1; D.faceHold = 0.1;
    D.expr = u < 1.1 ? 'wow' : 'happy'; D.exprT = 0.3; rollW = Math.sin(u * 7) * 0.16; hopW = Math.abs(Math.sin(u * 8)) * 5;
    if (Math.random() < dt * 14) drFx(D.x, D.y - 6, 'star');
    if (u > 1.9 + 0.3 * (D.has || 1)) drMode('follow');
  } else if (D.mode === 'yay') {       // zıplatan Pofuduk: Feza'nın çevresinde sevinçle dön
    const a = D.ya0 + D.yayDir * D.modeT * (D.yayBig ? 7.5 : 8);
    const r = D.yayBig ? 90 : 80;
    tx = P.x + Math.cos(a) * r; ty = P.y - 58 + Math.sin(a) * r * 0.5; k = 170; damp = 22; flapW = 7;
    if (D.modeT > 0.35) { D.expr = 'happy'; D.exprT = 0.4; }
    if (Math.random() < dt * 30) parts.push({ x: D.x, y: D.y, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, life: 0.7, max: 0.7, col: DR_IZ[(Math.random() * 4) | 0], size: 5 });
    if (D.modeT > D.yayDur) { drMode('follow'); for (let i = 0; i < 3; i++) drFx(D.x, D.y - 6, 'star'); }
  } else if (D.mode === 'irkil') {    // karanlık göl: hıh! (geri sıçrar, gözler kocaman), sonra kararlı bir baş sallama
    const o = D.go, dir = D.goDir, u = D.modeT;
    D.ft = dir; D.faceHold = 0.15;
    D.lookAt.x = o.x + dir * 120; D.lookAt.y = o.y + 40; D.lookAtT = 0.2;
    tx = P.x - dir * 44; ty = P.y - 126 - (u < 0.5 ? 10 * Math.sin(u / 0.5 * Math.PI) : 0); k = u < 0.4 ? 90 : 40; damp = u < 0.4 ? 14 : 10;
    D.gasp = u < 0.8 ? Math.min(1, u / 0.07) : Math.max(0, 1 - (u - 0.8) / 0.25);
    if (u < 0.85) { D.expr = 'wow'; D.exprT = 0.2; } else { D.expr = 'happy'; D.exprT = 0.3; D.tiltWant = Math.sin((u - 0.85) * 14) * 0.12 * Math.max(0, 1 - (u - 0.85) / 0.6); }
    flapW = u < 0.6 ? 6.5 : 4;
    if (u > 1.55) { drMode('follow'); D.gasp = 0; }
  } else if (D.mode === 'ilgi') {
    const far = Math.abs(P.x - D.x) > 300 || Math.abs(P.vx) > 200 || !playing;
    if (D.ik === 'kokla') {           // parlayan çiçeği kokla: burun kıpır kıpır, ışık zerreleri burnuna akar, mutlu göz
      const o = D.ikO, side = Math.sign(o.x - P.x) || 1, fx = o.x + side * 20, fy = o.y - 40;
      if (D.ip === 0) {
        tx = fx; ty = fy; k = 45; damp = 11;
        if ((D.x - P.x) * side < 10 && Math.abs(D.x - P.x) < 40) ty = Math.min(ty, P.y - 128);   // başının üstünden geç
        if ((Math.hypot(D.x - fx, D.y - fy) < 10 && D.modeT > 0.3) || D.modeT > 1.6) { D.ip = 1; D.modeT = 0; }
      } else {
        D.ft = -side; D.faceHold = 0.15; tx = fx; ty = fy + 2; k = 60; damp = 13; flapW = 2.8;
        D.lookAt.x = o.x; D.lookAt.y = o.y - 26; D.lookAtT = 0.2;
        D.sniff = Math.max(0, Math.sin(D.modeT * 19)) * (D.modeT < 1.1 ? 1 : 0); D.tiltWant = 0.12 + D.sniff * 0.05;
        D.expr = D.modeT < 1.1 ? 'sniff' : 'happy'; D.exprT = 0.3;
        if (D.modeT < 1.1 && Math.random() < dt * 30) {
          const a = Math.random() * 6.283, r = 10 + Math.random() * 12;
          D.nf.push({ k: 1, x: o.x + Math.cos(a) * r, y: o.y - 28 + Math.sin(a) * r * 0.6, vx: 0, vy: 0, life: 0.45, max: 0.45, size: 3 + Math.random() * 3, col: Math.random() < 0.5 ? '#fff2b8' : '#bff4ff' });
        }
        if (D.modeT > 1.1 && !D.ikFx) { D.ikFx = true; drFx(D.x, D.y - 14, 'heart'); drFx(D.x, D.y - 10, 'star'); D.sSq.v += 2; }
        hopW = D.modeT > 1.1 ? Math.abs(Math.sin((D.modeT - 1.1) * 9)) * 4 * Math.max(0, 1 - (D.modeT - 1.1) / 0.6) : 0;
        if (D.modeT > 1.75) { drMode('follow'); D.ikFx = false; D.sniff = 0; }
      }
    } else if (D.ik === 'spor') {     // uçuşan ışık sporu: fark eder, kovalar, "ham!" diye yer → parıltı
      const sp = D.spo;
      if (!sp) drMode('follow');
      else if (D.ip === 0) {
        tx = D.x; ty = D.y; k = 20; damp = 10;
        D.lookAt.x = sp.x; D.lookAt.y = sp.y; D.lookAtT = 0.2; D.ft = Math.sign(sp.x - D.x) || D.ft; D.faceHold = 0.15;
        D.expr = 'wow'; D.exprT = 0.2;
        if (D.modeT > 0.55) { D.ip = 1; D.modeT = 0; D.sCr.v -= 5; }
      } else if (D.ip === 1) {
        tx = sp.x - Math.sign(sp.x - D.x) * 6; ty = sp.y + 6; k = 70; damp = 12; flapW = 6;
        D.lookAt.x = sp.x; D.lookAt.y = sp.y; D.lookAtT = 0.2;
        const dd = Math.hypot(sp.x - D.x, sp.y - D.y);
        if (Math.abs(sp.x - D.x) > 10) D.ft = Math.sign(sp.x - D.x); D.faceHold = 0.15;   // ağzı hep spora dönük
        D.expr = 'happy'; D.exprT = 0.2; D.nomO = clamp(1.4 - dd / 30, 0, 1);
        if (!D.spDart && dd < 30) {   // spor bir kez kıkırdayıp kaçar (kovalamaca), sonra yakalanır
          D.spDart = true; const s = Math.sign(sp.x - D.x) || D.face;
          sp.vx = s * 150; sp.vy = -70; D.nomO = 0;
        }
        if ((dd < 18 && D.spDart) || D.modeT > 2.2) {
          D.ip = 2; D.modeT = 0; sp.eaten = true; D.nom = 1; D.nomO = 0; D.sSq.v -= 3;
          const mo = drMouthPos(); burst(mo.x, mo.y, 10, ['#fff6c8', '#bff4ff', '#ffffff', '#e2ccff'], 70, 0.6, 5);
          drFx(mo.x, mo.y - 6, 'star'); drSfx('parilti', 0.5);
        }
      } else {
        tx = D.x; ty = D.y; k = 25; damp = 9;
        D.expr = 'happy'; D.exprT = 0.3; hopW = Math.abs(Math.sin(D.modeT * 10)) * 3.5 * Math.max(0, 1 - D.modeT / 0.8);
        if (D.modeT > 0.9) { drMode('follow'); D.spo = null; }
      }
    } else {                          // minik takla: ileri-yukarı bir çember (gövde yolu izler)
      const T0 = 0.85, u = clamp(D.modeT / T0, 0, 1), a = smooth(u) * 6.283, R = 20;
      tx = D.tx0 + D.tkDir * Math.sin(a) * R; ty = D.ty0 - (1 - Math.cos(a)) * R; k = 260; damp = 30; flapW = 7;
      D.ft = D.tkDir; D.faceHold = 0.1; spinW = -a; D.expr = 'happy'; D.exprT = 0.2;
      if (Math.random() < dt * 25) parts.push({ x: D.x, y: D.y + 4, vx: 0, vy: 0, life: 0.5, max: 0.5, col: DR_IZ[(Math.random() * 4) | 0], size: 4 });
      if (u >= 1) { drMode('follow'); drFx(D.x, D.y - 10, 'star'); }
    }
    if (far && D.mode === 'ilgi') { drMode('follow'); D.sniff = 0; D.ikFx = false; D.nomO = 0; }
  } else if (D.mode === 'sarki') {     // şarkı çiçekleri (sarki.js): çiçeklerin üstünde süzül, notaya göre hafifçe zıpla
    const so = D.srk, y = so && typeof skPirilYer === 'function' ? skPirilYer(so) : null;
    if (!y || DURUM !== 'oyun' || Math.abs(P.x - so.x) > 1000) drMode('follow');
    else {
      const kut = so.sk && so.sk.kut;
      if (kut) {   // büyük kutlama: çiçeklerin üstünde sekiz çizerek dans, ara ara havada takla
        const a = D.modeT * 2.0, u = (D.modeT % 2.6) / 2.6;
        tx = so.x + Math.sin(a) * 160; ty = y.y - 10 + Math.sin(2 * a) * 38; k = 55; damp = 11; flapW = 6;
        if (u < 0.35) spinW = smooth(u / 0.35) * 6.283 * (Math.sin(a) > 0 ? -1 : 1);
        hopW = Math.abs(Math.sin(D.modeT * 8)) * 5;
        D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.12; drFx(D.x, D.y - 4, Math.random() < 0.5 ? 'heart' : 'star'); }
        D.ft = Math.sign(so.x - D.x) || D.ft; D.faceHold = 0.15; D.expr = 'happy'; D.exprT = 0.3;
      } else {
      tx = y.x + Math.sin(D.t * 1.1) * 10; ty = y.y + Math.sin(D.t * 2.3) * 5; k = 38; damp = 10; flapW = 3.2;
      const sirada = so.sk && so.sk.durum === 'sira';
      D.ft = Math.sign((sirada ? P.x : so.x) - D.x) || D.ft; D.faceHold = 0.15;
      if (sirada) { tx = y.x - 40 + Math.sin(D.t * 1.1) * 6; ty = y.y + 14; D.tiltWant = 0.18 * Math.sin(D.t * 2.2); }   // "sıra sende": geri çekilir, Feza'ya bakıp başını sallar
      D.expr = 'happy'; D.exprT = 0.3;
      hopW = Math.max(0, D.srkVur || 0) * 24;
      if (sirada) { D.lookAt.x = P.x; D.lookAt.y = P.y - 60; } else { D.lookAt.x = so.x; D.lookAt.y = so.y - 40; } D.lookAtT = 0.2;
      }
    }
  } else if (D.mode === 'takim') {     // [MINI] takim.js: Takımyıldızı çiz – ay aynasının üstünde süzülür, gökyüzüne bakar (D.tkO, D.tkVur)
    const to = D.tkO, y = to && typeof tkPirilYer === 'function' ? tkPirilYer(to) : null;
    if (!y || DURUM !== 'oyun' || Math.abs(P.x - to.x) > 1000) drMode('follow');
    else {
      tx = y.x + Math.sin(D.t * 1.1) * 10; ty = y.y + Math.sin(D.t * 2.3) * 5; k = 38; damp = 10; flapW = 3.2;
      if (D.tkKut) { const a = D.modeT * 2.0; tx = to.x + Math.sin(a) * 120; ty = y.y - 30 + Math.sin(2 * a) * 30; k = 55; damp = 11; flapW = 6; hopW = Math.abs(Math.sin(D.modeT * 8)) * 5; }
      D.ft = Math.sign(to.x - D.x) || D.ft; D.faceHold = 0.15; D.expr = 'happy'; D.exprT = 0.3;
      D.tkVur = Math.max(0, (D.tkVur || 0) - dt); hopW = Math.max(hopW, D.tkVur * 24);
      D.lookAt.x = to.x; D.lookAt.y = to.y - 420; D.lookAtT = 0.2;
    }
  } else if (D.mode === 'dans') {      // final: Feza'nın çevresinde sekiz çizen sevinç dansı
    const a = D.modeT * 2.6;
    tx = P.x + Math.sin(a) * 74; ty = P.y - 112 + Math.sin(2 * a) * 22; k = 60; damp = 12; flapW = 5.5;
    hopW = Math.abs(Math.sin(D.modeT * 8)) * 5;
    D.expr = 'happy'; D.exprT = 0.5;
    D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.22; drFx(D.x, D.y - 6, Math.random() < 0.6 ? 'heart' : 'star'); }
    if (DURUM !== 'oyun' && DURUM !== 'final') { drMode('follow'); D.danceAfter = false; }
  } else D.mode = 'follow';
  if (D.mode !== 'ilgi') { D.sniff = 0; D.nomO = 0; }
  if (D.mode !== 'irkil') D.gasp = Math.max(0, D.gasp - dt * 4);
  D.hop = hopW > 0 ? hopW : Math.max(0, D.hop - dt * 20);
  if (D.mode !== 'nefes') { D.puff = Math.max(0, D.puff - dt * 4); D.blowM = Math.max(0, D.blowM - dt * 6); D.stretch = Math.max(0, D.stretch - dt * 3); }
  if (D.mode !== 'yol' && D.mode !== 'sakli') D.beckonW = 0;
  D.beckon = lerp(D.beckon, D.beckonW, 1 - Math.exp(-dt * 10));
  D.headRoll = lerp(D.headRoll, rollW, 1 - Math.exp(-dt * 6));

  if (!isFinite(tx) || !isFinite(ty)) { tx = P.x - P.f * 40; ty = P.y - 112; if (D.mode !== 'follow') drMode('follow'); }   // hedef bozuksa (eksik nesne/olay verisi) güvenli takip
  if (!direct) {
    D.vx += ((tx - D.x) * k - D.vx * damp) * dt; D.vy += ((ty - D.y) * k - D.vy * damp) * dt;
    const sp = Math.hypot(D.vx, D.vy); if (sp > 1400) { D.vx *= 1400 / sp; D.vy *= 1400 / sp; }
    D.x += D.vx * dt; D.y += D.vy * dt;
  }
  if (!isFinite(D.x) || !isFinite(D.y) || !isFinite(D.vx) || !isFinite(D.vy)) { D.x = P.x - 40; D.y = P.y - 100; D.vx = D.vy = 0; drResetTail(); }
  // ── ikincil hareket: ivmeden yaylara (ibik, kulak, kuyruk küreği gecikir ve seker) ──
  {
    const idt = 1 / Math.max(dt, 1e-3);
    const ax = clamp((D.vx - D.pvx) * idt, -9000, 9000), ay = clamp((D.vy - D.pvy) * idt, -9000, 9000);
    D.pvx = D.vx; D.pvy = D.vy;
    const alx = ax * D.face;
    drSpring(D.sCr, clamp(-alx / 15000 + ay / 32000, -0.28, 0.28), 15, 0.3, dt);
    drSpring(D.sEr, clamp(-alx / 9000 - ay / 15000, -0.45, 0.45), 19, 0.24, dt);
    drSpring(D.sTl, clamp(alx / 8000 + ay / 9000, -0.6, 0.6), 11, 0.28, dt);
    D.spd = Math.hypot(D.vx, D.vy);
    if (D.mode !== 'push' && D.spd > 520) sqW = Math.max(sqW, Math.min(0.1, (D.spd - 520) / 3500));
    drSpring(D.sSq, sqW, 17, 0.33, dt);
    D.sq = clamp(D.sSq.a, -0.22, 0.22);
    for (const s of [D.sCr, D.sEr, D.sTl]) { s.a = clamp(s.a, -0.6, 0.6); s.v = clamp(s.v, -30, 30); }
    // takla dönüşü (başka mod araya girerse en yakın tam tura yumuşakça döner)
    if (spinW !== null) D.spin = spinW;
    else if (D.spin) { const n = Math.round(D.spin / 6.283) * 6.283; D.spin = lerp(D.spin, n, 1 - Math.exp(-dt * 10)); if (Math.abs(D.spin - n) < 0.002) D.spin = 0; }
    // ay yürüyüşü olmasın: yüzü zorla bir yana dönükken öbür yana hızla gidiyorsa 3/4 arkadan görünür (gittiği yöne döner)
    const moon = Math.abs(D.vx) > 170 && Math.sign(D.vx) === -D.face && (D.faceHold > 0 || D.mode === 'yardim') && D.mode !== 'push' && D.mode !== 'tasi';
    D.mwT = moon ? (D.mwT || 0) + dt : 0;
    if (D.mwT > 0.1 && !awayW) { awayW = 1; D.awayS = Math.sign(D.vx); D.awayDeep = 0; }
    if (D.au < 0.5 && awayW) D.awayS = D.awayS || D.face;
    if (!awayW && D.au <= 0) D.awayDeep = 0;
    D.au = clamp(D.au + (awayW ? 1 : -1) * dt / 0.3, 0, 1);
    D.dz = lerp(D.dz, awayW && D.awayDeep ? 0.84 : 1, 1 - Math.exp(-dt * 3));
    D.tailRX = lerp(-7, -1.5, smooth(D.au));
  }
  // Feza'nın yüzünü asla kapatmasın: başının üstündeki bölgeye inerse yumuşakça yukarı itilir
  // (itme hamlesi, taşıma, dalış ve zıplama turu kendi yollarını bilir)
  if (P.fade <= 0 && D.mode !== 'push' && D.mode !== 'tasi' && D.mode !== 'yardim' && D.mode !== 'dalis' && D.mode !== 'yay') {
    const hx = Math.abs(D.x - P.x), minY = P.y - 104 + clamp((hx - 20) / 22, 0, 1) * 70;
    if (D.y > minY && D.y < P.y + 10) { D.y = lerp(D.y, minY, 1 - Math.exp(-dt * 14)); if (D.vy > 0) D.vy *= Math.exp(-dt * 10); }
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
  // konuşma: hece hece ağız (Türkçe ≈ 6 hece/sn; açık "a/e", yuvarlak "o/u", kapalı "m/b"; 2-4 heceden sonra kısa durak)
  D.talkT -= dt;
  let mWant = 0;
  if (D.talkT > 0) {
    D.sylT -= dt;
    if (D.sylT <= 0) {
      if (--D.sylN < 0) { D.sylN = 2 + ((Math.random() * 3) | 0); D.sylA = 0; D.sylT = 0.07 + Math.random() * 0.09; }
      else {
        const r = Math.random();
        D.sylR = r < 0.28 ? 1 : 0; D.sylW = r > 0.72 ? 1 : 0;
        D.sylA = r > 0.9 ? 0.25 : 0.5 + Math.random() * 0.5; D.sylT = 0.11 + Math.random() * 0.08;
      }
      D.sylT0 = D.sylT;
    }
    const u = 1 - D.sylT / D.sylT0;
    mWant = D.sylA * Math.sin(Math.PI * Math.min(1, u * 1.2)) ** 0.7;
  } else { D.sylN = 0; D.sylT = 0; }
  D.mouth = lerp(D.mouth, mWant, 1 - Math.exp(-dt * 34));
  D.mRound = lerp(D.mRound, D.talkT > 0 ? D.sylR : 0, 1 - Math.exp(-dt * 18));
  D.mWide = lerp(D.mWide, D.talkT > 0 ? (D.sylW || 0) : 0, 1 - Math.exp(-dt * 18));
  // "ham": yerken yanaklar dolu, çiğner
  D.nom = Math.max(0, D.nom - dt * 1.5);
  if (D.nom > 0) D.puff = Math.max(D.puff, 0.32 * D.nom * (0.75 + 0.25 * Math.sin(D.t * 22)));
  if (D.spo) {   // uçuşan ışık sporu
    const sp = D.spo; sp.life += dt;
    if (sp.eaten) D.spo = null;
    else {
      const chase = D.mode === 'ilgi' && D.ik === 'spor';
      sp.a = chase ? Math.min(1, sp.a + dt * 3) : sp.a - dt * 1.5;
      if (sp.a <= 0 && !chase) D.spo = null;
      else {
        const ev = chase && D.ip === 1 && D.modeT < 0.6 ? 1 : 0.25;   // önce kaçar gibi, sonra yavaşlar
        sp.vx += (Math.sin(sp.life * 2.3 + sp.ph) * 40 * ev) * dt; sp.vy += (Math.cos(sp.life * 3.1 + sp.ph) * 30 * ev - 4) * dt;
        sp.vx *= Math.exp(-dt * 2); sp.vy *= Math.exp(-dt * 2);
        sp.x += sp.vx * dt; sp.y += sp.vy * dt;
        sp.x = clamp(sp.x, cam.x + 50, cam.x + VW - 50); sp.y = clamp(sp.y, cam.y + 50, P.y - 140);
      }
    }
  }

  // yön: gecikmeli eşik (titremesin), ölçek 0'dan geçerek dönsün
  D.lockF = Math.max(0, D.lockF - dt);
  if (D.mode !== 'push' && D.mode !== 'tasi' && D.faceHold <= 0 && D.lockF <= 0) {
    if (Math.abs(D.vx) > 110) { if (Math.sign(D.vx) !== D.ft) D.ft = Math.sign(D.vx); }
    else if (Math.abs(D.vx) < 50) { const rel = P.x - D.x; if (rel * D.ft < -26) D.ft = -D.ft; }
  }
  // dönüş (saydam karışım yok → hayalet kare yok): yan → (ezilerek) 3/4 önden → tam önden → öbür 3/4 → yan
  if (D.tt < 0 && D.ft !== D.face) { D.tt = 0; D.face0 = D.face; D.tTo = D.ft; }
  if (D.tt >= 0) {
    // yarıda vazgeçerse aynı yoldan geri döner (yüz yönü sıçramaz)
    if (D.ft !== D.tTo) { D.tTo = D.ft; D.face0 = -D.ft; D.tt = 1 - D.tt; }
    D.tt += dt / (Math.abs(D.vx) > 220 ? 0.22 : 0.3);   // hızlıyken daha çevik döner
    if (D.tt >= 0.5 && D.face !== D.tTo) { D.face = D.tTo; D.sCr.v -= 6; D.sEr.v -= 6; D.sTl.v += 7; }   // dönüşte ibik/kulak geride kalır, sonra seker
    if (D.tt >= 1) D.tt = -1;
  }
  drTurnPose(D.tt, D.face0, D.face);
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
  let prev = drLocal(D.tailRX, 6);
  if (Math.hypot(prev.x - D.tail[0].x, prev.y - D.tail[0].y) > 80) drResetTail();
  D.tail[0].x = prev.x; D.tail[0].y = prev.y;
  const sxx = D.fs, ct = Math.cos(D.tilt), st = Math.sin(D.tilt);
  for (let i = 1; i < DR_TAIL_N; i++) {
    const u = i / (DR_TAIL_N - 1);
    const ang = Math.PI - 0.95 + u * 2.15 + Math.sin(D.t * 3.2 - u * 3.2) * 0.32 * (0.4 + u) + D.glide * 0.3 + D.grip * 1.5 + D.sTl.a * u * 0.9 + D.spin;
    const dlx = Math.cos(ang), dly = Math.sin(ang);
    const dwx = sxx * (dlx * ct - dly * st), dwy = dlx * st + dly * ct;
    const p = D.tail[i];
    const kk = 1 - Math.exp(-dt * lerp(26, 7, u));
    const TL = DR_TAIL_LEN * D.dz;
    p.x = lerp(p.x, prev.x + dwx * TL, kk); p.y = lerp(p.y, prev.y + dwy * TL, kk);
    const ddx = p.x - prev.x, ddy = p.y - prev.y, dd = Math.hypot(ddx, ddy) || 1;
    p.x = prev.x + ddx / dd * TL; p.y = prev.y + ddy / dd * TL;
    prev = p;
  }

  // ışık izi ve parıltılar
  const spd = Math.hypot(D.vx, D.vy);
  // hız izi: taşırken/elinden tutarken yok; Feza'nın başına ve saçına değen noktalar da eklenmez
  if (spd > 380 || D.mode === 'push') {
    if (D.mode !== 'tasi' && D.mode !== 'yardim' && !(D.x > P.x - 34 && D.x < P.x + 34 && D.y > P.y - 96 && D.y < P.y - 20)) {
      D.trail.push({ x: D.x, y: D.y + D.bob, life: 0.28, cut: !!D.trailCut }); D.trailCut = false;
    } else D.trailCut = true;
  } else D.trailCut = true;
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
      p.age += dt;
      if (p.tg && p.age > 0.22) {   // nilüfere doğru yumuşak çekim; varınca orada söner
        const w = Math.min(1, (p.age - 0.22) * 2.2), ax = (p.tx - p.x) * 9 - p.vx * 3.2, ay = (p.ty - p.y) * 9 - p.vy * 3.2;
        p.vx += ax * w * dt; p.vy += ay * w * dt;
        if (Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) < 10) p.life = Math.min(p.life, 0.18);
      }
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
const DR_TA = 0.14, DR_TB = 0.86, DR_YAW = 0.78;
function drTurnPose(tu, f0, f1) {   // tu<0: dönmüyor. D.fw (0 yan / 1 önden), D.yaw (önden bakışta baş yönü), D.tsq (yatay ezilme), D.fs
  if (tu < 0) { D.fw = 0; D.yaw = 0; D.tsq = 1; D.fs = D.face; return; }
  const su = smooth(tu);
  D.fs = tu < 0.5 ? f0 * Math.cos(Math.PI * su) : -f1 * Math.cos(Math.PI * su);
  if (tu < DR_TA) { D.fw = 0; D.yaw = 0; D.tsq = 1 - 0.22 * smooth(tu / DR_TA); }
  else if (tu >= DR_TB) { D.fw = 0; D.yaw = 0; D.tsq = 0.78 + 0.22 * smooth((tu - DR_TB) / (1 - DR_TB)); }
  else {
    D.fw = 1;
    D.yaw = tu < 0.5 ? f0 * DR_YAW * (1 - smooth((tu - DR_TA) / (0.5 - DR_TA))) : f1 * DR_YAW * smooth((tu - 0.5) / (DR_TB - 0.5));
    D.tsq = 0.9 + 0.1 * Math.sin(Math.PI * (tu - DR_TA) / (DR_TB - DR_TA));
  }
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
// ── çizim: gerçek Pırıl peluşuna göre (lila gövde, limon yeşili çizgili karın, koyu yeşil taraklı ibik ve dikenler,
//    yeşil yüzgeç kulaklar, kocaman yeşil gözler, iki minik diş, kısa kollar, tombul bacaklar, kürek uçlu kuyruk).
//    Peluşta kanat yok; rüyada ışıktan küçük kanatları var (D.wingA). ──
function drBlobs(x, arr, fill, line, lw) {   // birleşik yuvarlak dilimler: önce kalın çizgi, sonra dolgu → yalnız dış kenar kalır
  x.strokeStyle = line; x.lineWidth = lw; x.lineJoin = 'round';
  x.beginPath(); for (let i = 0; i < arr.length; i += 3) { x.moveTo(arr[i] + arr[i + 2], arr[i + 1]); x.arc(arr[i], arr[i + 1], arr[i + 2], 0, 6.283); } x.stroke();
  x.fillStyle = fill;
  x.beginPath(); for (let i = 0; i < arr.length; i += 3) { x.moveTo(arr[i] + arr[i + 2], arr[i + 1]); x.arc(arr[i], arr[i + 1], arr[i + 2], 0, 6.283); } x.fill();
}
const DR_CREST_S = [5, -24, 3.4, -0.4, -25.6, 4.2, -5.6, -22.6, 3.9, 0, -20.5, 3.5, -4, -19, 3.2, 4, -20.5, 3];   // yandan ibik: 3 tarak + taban
const DR_SPINE_S = [-6.6, -3.6, 2.3, -8.9, 0.6, 2.1, -9.8, 5, 1.8];                                                     // sırt dikenleri
const DR_TSP = [];   // kuyruk dikenleri (her karede yeniden doldurulur)
function drawTail(x, tm) {
  if (D.tail.some(q => !isFinite(q.x) || !isFinite(q.y))) drResetTail();
  const tl = D.tail, n = tl.length, C = DR_COL, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = tl[Math.max(0, i - 1)], b = tl[Math.min(n - 1, i + 1)];
    let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const r = lerp(6, 2.3, Math.pow(i / (n - 1), 0.75)) * (D.dz || 1);
    L.push([tl[i].x + nx * r, tl[i].y + ny * r]); R.push([tl[i].x - nx * r, tl[i].y - ny * r]);
  }
  // koyu yeşil taraklı dikenler (kuyruğun üst kenarı; yarısı kuyruğun arkasında kalır)
  DR_TSP.length = 0;
  for (let j = 0; j < 2 * (n - 2); j++) {   // kuyruğun üstünde sık, küçülen taraklar (uca yakın biter)
    const i = 0.5 + j * 0.5, i0 = Math.floor(i), fr = i - i0;
    const a = tl[Math.max(0, i0 - 1)], b = tl[Math.min(n - 1, i0 + 1)];
    let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const u = i / (n - 1), r = lerp(6, 2.3, Math.pow(u, 0.75)) * (D.dz || 1);
    const px = lerp(tl[i0].x, tl[Math.min(n - 1, i0 + 1)].x, fr), py = lerp(tl[i0].y, tl[Math.min(n - 1, i0 + 1)].y, fr);
    DR_TSP.push(px + nx * r * 0.82, py + ny * r * 0.82, lerp(2.1, 1.0, u));
  }
  drBlobs(x, DR_TSP, C.crest, C.crestD, 1.3);
  const pts = L.concat(R.reverse());
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; x.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
  x.closePath();
  const gr = x.createLinearGradient(tl[0].x, tl[0].y, tl[n - 1].x, tl[n - 1].y);
  gr.addColorStop(0, C.pur); gr.addColorStop(1, C.purL);
  x.fillStyle = gr; x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  // kürek biçimli yumuşak uç (rüyada ışık kaynağı)
  const p = tl[n - 1], q = tl[n - 2];
  let dx = p.x - q.x, dy = p.y - q.y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const z = D.dz || 1;
  x.save(); x.translate(p.x, p.y); x.rotate(Math.atan2(dy, dx) + (D.sTl ? D.sTl.a * 0.8 * (D.fs >= 0 ? 1 : -1) : 0)); if (z !== 1) x.scale(z, z);
  x.beginPath(); x.moveTo(-1, -1.4);   // yassı, ucu yuvarlak kürek (yaprak/maça gibi)
  x.bezierCurveTo(0.4, -4.2, 3.4, -4.7, 5.2, -3.2); x.bezierCurveTo(6.8, -1.9, 8.2, -0.6, 8.2, 0.2);
  x.bezierCurveTo(8.2, 1, 6.8, 2.3, 5.2, 3.4); x.bezierCurveTo(3.4, 4.8, 0.4, 4.3, -1, 1.4); x.closePath();
  const sg = x.createLinearGradient(0, -5, 0, 5); sg.addColorStop(0, C.purL); sg.addColorStop(1, C.pur);
  x.fillStyle = sg; x.fill(); x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  x.strokeStyle = 'rgba(90,60,150,0.35)'; x.lineWidth = 0.5; x.beginPath(); x.moveTo(0.6, 0); x.quadraticCurveTo(3.6, 0.3, 5.8, 0); x.stroke();
  x.restore();
  if (D.glowA > 0.01) {   // rüyada kuyruk ucu yumuşakça parlar (beyaz top gibi değil, lila ışık)
    const fl = 0.85 + 0.15 * Math.sin(tm * 9) + 0.06 * Math.sin(tm * 23);
    const gx = p.x + dx * 3.5, gy = p.y + dy * 3.5;
    x.globalCompositeOperation = 'lighter';
    drGlow(x, '#b892ff', gx, gy, 20 * fl, 0.32 * D.glowA);
    drGlow(x, '#f3e6ff', gx, gy, 6 * fl, 0.22 * D.glowA);
    x.globalCompositeOperation = 'source-over';
  }
}
function drawWing(x, far, tm) {   // ışıktan kanat: yarı saydam, lavanta-nane, yumuşak üç tüy
  const A = D.wingA * (far ? 0.55 : 1); if (A < 0.01) return;
  const w = Math.sin(D.ph + (far ? 0.35 : 0));
  let ang = lerp(-0.95, 0.62, (w + 1) / 2);
  ang = lerp(ang, -0.28 + Math.sin(tm * 3) * 0.06, D.glide);
  ang = lerp(ang, 0.55, D.pose * 0.6);
  ang = lerp(ang, 0.78 + Math.sin(tm * 2.4) * 0.05, D.stretch);
  const len = 1 + 0.08 * Math.cos(D.ph) * (1 - D.glide), sc = (0.45 + 0.55 * D.wingA) * (far ? 0.78 : 0.9);
  const vs = clamp(((D.spd || 0) - 80) / 600, 0, 1);   // uçuş hızı: tüyler geriye yatar, uzar, titreşir ve daha çok parlar
  x.save(); x.translate(far ? 1.5 : -2, far ? -6.5 : -5); x.rotate(ang); x.scale(len * sc, sc);
  const op = x.globalCompositeOperation; x.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 3; k++) {
    const fl = Math.sin(tm * (17 + k * 4.3) + k * 1.7 + (far ? 1 : 0)) * (0.025 + 0.07 * vs);
    const dir = -2.25 - k * (0.42 - 0.1 * vs) - 0.18 * vs + fl, Lk = (23 - k * 4.5) * (1 + 0.16 * vs), rk = (4.2 - k * 0.7) * (1 - 0.12 * vs);
    const sh = 0.86 + 0.14 * Math.sin(tm * 6.5 + k * 2.1 + (far ? 2 : 0)) + 0.25 * vs;   // ışıltı
    x.save(); x.rotate(dir);
    const gr = x.createLinearGradient(0, 0, Lk, 0);
    gr.addColorStop(0, `rgba(226,206,255,${0.6 * A * sh})`); gr.addColorStop(0.6, `rgba(196,176,255,${0.34 * A * sh})`); gr.addColorStop(1, `rgba(170,255,222,${(0.2 + 0.15 * vs) * A * sh})`);
    x.fillStyle = gr; x.beginPath(); x.ellipse(Lk / 2, 0, Lk / 2, rk, 0, 0, 6.283); x.fill();
    x.strokeStyle = `rgba(255,255,255,${(0.32 + 0.2 * vs) * A})`; x.lineWidth = 0.6; x.stroke();
    if (vs > 0.15 || k === 0) {   // tüy ucunda minik parıltı
      const tw = 0.5 + 0.5 * Math.sin(tm * 11 + k * 2.6 + (far ? 1.3 : 0));
      x.fillStyle = '#ffffff'; drTwinkle(x, Lk * 0.96, 0, 1.6 + 1.4 * vs, A * tw * (k === 0 ? 0.35 + 0.5 * vs : 0.6 * vs));
    }
    x.restore();
  }
  drGlow(x, '#efe2ff', 0, 0, 7, (0.5 + 0.2 * vs) * A);
  x.globalCompositeOperation = op;
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
  if (e === 'sniff') return 'closed';
  if (e === 'sleepy') return 'closed';
  return 'open';
}
function drMouthKind() {
  if (D.blowM > 0.02) { D.mk = 'O'; D.ma = D.blowM; }
  else if (D.yawn > 0.05) { D.mk = 'yawn'; D.ma = D.yawn; }
  else if (D.nomO > 0.05) { D.mk = 'O'; D.ma = D.nomO * 0.9; }
  else if (D.expr === 'puff') { D.mk = 'purse'; D.ma = 1; }
  else if (D.nom > 0.05 || D.expr === 'sniff') { D.mk = 'smile'; D.ma = 0; }
  else if (D.mouth > 0.06) { D.mk = 'talk'; D.ma = D.mouth; }
  else if (D.expr === 'happy') { D.mk = 'happy'; D.ma = 1; }
  else if (D.expr === 'grin') { D.mk = 'grin'; D.ma = 1; }
  else if (D.expr === 'effort') { D.mk = 'o'; D.ma = 0.8; }
  else if (D.expr === 'wow') { D.mk = 'o'; D.ma = 1.15 + 0.45 * D.gasp; }
  else { D.mk = 'smile'; D.ma = 0; }
  return D.mk;
}
function drOpenEye(x, rx, ry, lookSx) {   // kocaman yeşil göz: beyaz kenar, yeşil iris, siyah bebek, beyaz parıltı
  x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.clip();
  const ox = D.lookX * lookSx * rx * 0.2, oy = D.lookY * ry * 0.14 + ry * 0.06;
  const ig = x.createLinearGradient(0, oy - ry, 0, oy + ry);
  ig.addColorStop(0, '#2b7a26'); ig.addColorStop(0.45, '#4fae37'); ig.addColorStop(1, '#a8e46e');
  x.fillStyle = ig; x.beginPath(); x.ellipse(ox, oy, rx * 0.8, ry * 0.84, 0, 0, 6.283); x.fill();
  x.fillStyle = '#0d0a12'; x.beginPath(); x.ellipse(ox + lookSx * rx * 0.06, oy + ry * 0.04, rx * 0.4, ry * 0.5, 0, 0, 6.283); x.fill();
  x.fillStyle = '#ffffff';
  x.beginPath(); x.ellipse(ox - rx * 0.22, oy - ry * 0.3, rx * 0.26, ry * 0.22, 0, 0, 6.283); x.fill();
  x.beginPath(); x.arc(ox + rx * 0.3, oy + ry * 0.38, rx * 0.11, 0, 6.283); x.fill();
  x.restore();
}
function drClosedEye(x, rx, ry, lash, lw) {   // uyku gözü: aşağı kavis + kirpikler
  x.strokeStyle = DR_COL.eye; x.lineWidth = lw; x.lineCap = 'round';
  x.beginPath(); x.moveTo(-rx, -ry * 0.05); x.quadraticCurveTo(0, ry * 0.5, rx, -ry * 0.05); x.stroke();
  if (lash) {
    x.lineWidth = lw * 0.75;
    x.beginPath(); x.moveTo(lash * rx * 0.95, 0); x.lineTo(lash * rx * 1.35, ry * 0.2);
    x.moveTo(lash * rx * 0.6, ry * 0.2); x.lineTo(lash * rx * 0.85, ry * 0.48); x.stroke();
  }
}
function drEyeLids(x, rx, ry, lash, lw) {   // kalın koyu üst kirpik çizgisi + dış köşede minik kıvrım
  x.strokeStyle = DR_COL.eye; x.lineCap = 'round'; x.lineWidth = lw;
  x.beginPath(); x.ellipse(0, 0, rx, ry, 0, Math.PI * 1.05, Math.PI * 1.97); x.stroke();
  if (lash) { x.lineWidth = lw * 0.8; x.beginPath(); x.moveTo(lash * rx * 0.94, -ry * 0.34); x.quadraticCurveTo(lash * rx * 1.25, -ry * 0.48, lash * rx * 1.36, -ry * 0.72); x.stroke(); }
  x.strokeStyle = 'rgba(60,40,90,0.35)'; x.lineWidth = 0.5; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0.1, Math.PI - 0.1); x.stroke();
}
function drFrontEye(x, cx, cy, rx, ry, lash, blink, kind) {
  x.save(); x.translate(cx, cy);
  x.strokeStyle = DR_COL.eye; x.lineCap = 'round'; x.lineJoin = 'round';
  if (kind === 'happy') {
    x.lineWidth = 1.6; x.beginPath(); x.moveTo(-rx * 0.85, 1.2); x.quadraticCurveTo(0, -3.8, rx * 0.85, 1.2); x.stroke();
  } else if (kind === 'chev') {
    const sd = -lash; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-sd * 2.8, -2.6); x.lineTo(sd * 2.2, 0); x.lineTo(-sd * 2.8, 2.4); x.stroke();
  } else if (kind === 'closed' || blink * D.lid <= 0.4) {
    drClosedEye(x, rx * 0.9, ry, kind === 'closed' ? lash : 0, 1.3);
  } else {
    const big = D.expr === 'wow' ? 1.1 : 1;
    x.scale(big, blink * D.lid * big);
    drOpenEye(x, rx, ry, D.face);
    drEyeLids(x, rx, ry, lash, 1.3);
  }
  x.restore();
}
function drFangs(x, ax, ay, bx, by, s) {   // üst dudaktan aşağı bakan iki minik beyaz diş
  x.fillStyle = '#ffffff'; x.strokeStyle = 'rgba(70,50,90,0.6)'; x.lineWidth = 0.35;
  for (const [fx, fy] of [[ax, ay], [bx, by]]) { x.beginPath(); x.moveTo(fx - 0.6 * s, fy); x.lineTo(fx + 0.6 * s, fy); x.lineTo(fx, fy + 1.5 * s); x.closePath(); x.fill(); x.stroke(); }
}
function drMouthDraw(x, cx, cy, wdt, front) {   // ağız: cx,cy = ağız ortası (üst dudak hizası); wdt = yarı genişlik
  const k = drMouthKind(), m = D.ma, dk = '#4a1d4a';
  x.strokeStyle = DR_COL.eye; x.lineWidth = 0.9; x.lineCap = 'round'; x.lineJoin = 'round';
  const L = cx - wdt, R = cx + wdt;
  let fang = true;
  if (k === 'talk' && D.mRound > 0.35) {   // yuvarlak hece (o/u): küçük yuvarlak ağız
    const rr = D.mRound, ox = front ? cx : cx + wdt * 0.35, rx = (1 + 1.3 * m) * (front ? 1 : 0.8), ry = 0.7 + 2.2 * m;
    x.fillStyle = dk; x.beginPath(); x.ellipse(ox, cy + ry * 0.75, rx * (0.7 + 0.3 * (1 - rr) + 0.3), ry, 0, 0, 6.283); x.fill();
    if (ry > 1.4) { x.fillStyle = '#ff8fb8'; x.beginPath(); x.ellipse(ox, cy + ry * 1.2, rx * 0.55, ry * 0.35, 0, 0, 6.283); x.fill(); }
    x.lineWidth = 0.6; x.beginPath(); x.ellipse(ox, cy + ry * 0.75, rx + 0.3, ry + 0.2, 0, 0, 6.283); x.stroke();
  } else if (k === 'talk' || k === 'happy' || k === 'grin') {
    const d = k === 'talk' ? 0.8 + m * 4.4 * (1 - 0.25 * D.mWide) : 4.2;
    const Rw = k === 'talk' ? cx + wdt * (1 + 0.2 * D.mWide) : R, Lw = k === 'talk' ? cx - wdt * (1 + 0.2 * D.mWide) : L;
    x.fillStyle = dk; x.beginPath(); x.moveTo(Rw, cy - 0.3);
    x.quadraticCurveTo(cx, cy + d, Lw, cy - 0.1); x.quadraticCurveTo(cx, cy + 0.5, Rw, cy - 0.3); x.fill();
    if (d > 1.6) {
      x.save(); x.beginPath(); x.moveTo(Rw, cy - 0.3); x.quadraticCurveTo(cx, cy + d, Lw, cy - 0.1); x.closePath(); x.clip();
      x.fillStyle = '#ff8fb8'; x.beginPath(); x.ellipse(cx, cy + d * 0.66, wdt * 0.6, d * 0.32, 0, 0, 6.283); x.fill(); x.restore();
    }
  } else if (k === 'O') {
    const ox = front ? cx : R - 0.6, rx = 1.3 + 1.2 * m, ry = 1.4 + 1.5 * m;
    x.fillStyle = dk; x.beginPath(); x.ellipse(ox, cy + ry * 0.7, rx, ry, 0, 0, 6.283); x.fill();
    x.fillStyle = 'rgba(255,240,200,' + (0.85 * m) + ')'; x.beginPath(); x.ellipse(ox, cy + ry * 0.7, rx * 0.55, ry * 0.55, 0, 0, 6.283); x.fill();
    fang = false;
  } else if (k === 'yawn') {
    const ox = front ? cx : cx - 0.3, rx = 1.6 + 1.3 * m, ry = 0.6 + 3.1 * m;
    x.fillStyle = dk; x.beginPath(); x.ellipse(ox, cy + ry * 0.75, rx, ry, 0, 0, 6.283); x.fill();
    x.fillStyle = '#ff8fb8'; x.beginPath(); x.ellipse(ox, cy + ry * 1.25, rx * 0.65, ry * 0.4, 0, 0, 6.283); x.fill();
  } else if (k === 'purse') {
    const ox = front ? cx : R - 0.8;
    x.fillStyle = dk; x.beginPath(); x.ellipse(ox, cy + 0.4, 0.9, 0.75, 0, 0, 6.283); x.fill();
    fang = false;
  } else if (k === 'o') {
    x.fillStyle = dk; x.beginPath(); x.ellipse(front ? cx : cx + 0.6, cy + 1.1, 1.3 * m, 1.1 * m + 0.1, 0, 0, 6.283); x.fill();
  } else {   // kapalı: yumuşak dudak çizgisi
    x.beginPath();
    if (front) { x.moveTo(L, cy - 0.5); x.quadraticCurveTo(cx, cy + 0.9, R, cy - 0.5); }
    else { x.moveTo(R, cy - 0.5); x.quadraticCurveTo(cx, cy + 0.5, L, cy); x.quadraticCurveTo(L - 0.5, cy - 0.2, L - 0.6, cy - 0.9); }
    x.stroke();
  }
  if (fang) {
    if (front) drFangs(x, cx - wdt * 0.55, cy - 0.15, cx + wdt * 0.55, cy - 0.15, 1);
    else drFangs(x, cx + wdt * 0.55, cy - 0.35, cx - wdt * 0.3, cy - 0.1, 0.95);
  }
}
function drBelly(x, cx, cy, rx, ry, rot, seam) {   // limon yeşili çizgili karın paneli
  const C = DR_COL;
  x.save(); x.translate(cx, cy); x.rotate(rot);
  const gr = x.createLinearGradient(-rx, 0, rx, 0);
  gr.addColorStop(0, C.limeD); gr.addColorStop(0.45, C.lime); gr.addColorStop(1, C.limeL);
  x.fillStyle = gr; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.clip();
  x.strokeStyle = 'rgba(110,150,20,0.45)'; x.lineWidth = 0.45;
  x.beginPath(); for (let yy = -ry + 1.4; yy < ry; yy += 1.55) { x.moveTo(-rx, yy); x.quadraticCurveTo(0, yy + 0.7, rx, yy); } x.stroke();
  if (seam > 0.05) { x.globalAlpha = seam; x.setLineDash([1, 1]); x.strokeStyle = 'rgba(90,130,10,0.8)'; x.lineWidth = 0.45; x.beginPath(); x.moveTo(0, -ry); x.lineTo(0, ry); x.stroke(); x.setLineDash([]); x.globalAlpha = 1; }
  x.restore();
  x.strokeStyle = 'rgba(90,120,20,0.7)'; x.lineWidth = 0.6; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.stroke();
  x.restore();
}
function drEar(x, rot, s) {   // yeşil yüzgeç kulak (arkası taraklı); yerel: kök (0,0), uç yukarı-geri
  x.save(); x.rotate(rot); x.scale(s, s);
  x.beginPath(); x.moveTo(1.2, 1.4); x.quadraticCurveTo(1.8, -5, 0.6, -10.6);
  x.quadraticCurveTo(-1.6, -9.4, -3, -7.4); x.quadraticCurveTo(-4.8, -6.6, -5.2, -4.2);
  x.quadraticCurveTo(-6.6, -3, -6.4, -0.6); x.quadraticCurveTo(-3, 0.6, 1.2, 1.4); x.closePath();
  const gr = x.createLinearGradient(0, 0, -3, -9); gr.addColorStop(0, DR_COL.limeD); gr.addColorStop(1, DR_COL.limeL);
  x.fillStyle = gr; x.fill(); x.strokeStyle = 'rgba(80,110,20,0.8)'; x.lineWidth = 0.6; x.stroke();
  x.restore();
}
function drFront(x, tm, yaw) {   // önden görünüş (dönüşte yaw ile 3/4'e döner; ara sahnelerde tam önden)
  const C = DR_COL, pose = D.pose, lg = D.glide * 2, pl = D.plush;
  const yw = yaw || 0, ya = Math.abs(yw), ys = yw >= 0 ? 1 : -1, YA = yw * 0.95;   // YA: başın dönüş açısı (radyan)
  const sph = (a0, r) => r * Math.sin(a0 + YA);                                     // küre üstündeki noktanın yatay yeri
  const bsh = yw * 2.4;                                                             // gövde ayrıntılarının kayması
  for (const sd of [1, -1]) { x.save(); x.scale(sd, 1); x.translate(-3 - sd * yw * 2, 1); x.rotate(-0.12); drawWing(x, sd === ys && ya > 0.3, tm); x.restore(); }
  const arm = (sd) => {   // kısa tombul kollar
    const shx = sd * 7 + bsh * 0.6, shy = -0.8;
    let px = sd * lerp(10.4, 10, pose) + bsh, py = lerp(3.4, -14, pose);
    px = lerp(px, sd * 10.8, pl * (1 - pose)); py = lerp(py, 6.6, pl * (1 - pose));
    x.strokeStyle = C.line; x.lineWidth = 6.4; x.lineCap = 'round';
    x.beginPath(); x.moveTo(shx, shy); x.lineTo(px, py); x.stroke();
    x.strokeStyle = C.pur; x.lineWidth = 5.2; x.stroke();
    x.fillStyle = C.purL; x.beginPath(); x.arc(px, py, 1.8, 0, 6.283); x.fill();
  };
  if (pose > 0.3) { arm(-1); arm(1); }
  for (const sd of [-1, 1]) {   // tombul bacaklar, iri ayaklar (peluşta öne açık oturur)
    x.save(); x.translate(sd * lerp(5.8, 6.8, pl) + bsh * 0.5, lerp(10.8 - lg * 0.5, 11.4, pl)); x.rotate(sd * 0.45 * pl);
    x.fillStyle = C.pur; x.beginPath(); x.ellipse(0, 0, 4.8, 4.8, 0, 0, 6.283); x.fill();
    x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
    x.translate(sd * 0.4 + yw * 1.2, lerp(3.8 - lg * 0.5, 3.6, pl));
    x.fillStyle = C.purL; x.beginPath(); x.ellipse(0, 0, 4.9, lerp(2.8, 3.1, pl), 0, 0, 6.283); x.fill(); x.stroke();
    x.restore();
  }
  // gövde: armut biçimli (aşağısı geniş), önde çeneden kasığa limon yeşili çizgili karın
  const bodyP = () => {
    x.beginPath(); x.moveTo(0, -7.2);
    x.bezierCurveTo(5.6, -7.2, 8, -2.4, 9.4, 3.2); x.bezierCurveTo(11, 9.6, 8.4, 15, 0, 15);
    x.bezierCurveTo(-8.4, 15, -11, 9.6, -9.4, 3.2); x.bezierCurveTo(-8, -2.4, -5.6, -7.2, 0, -7.2); x.closePath();
  };
  const bg = x.createRadialGradient(-2, -1, 1, 0, 4, 14);
  bg.addColorStop(0, C.purL); bg.addColorStop(0.6, C.pur); bg.addColorStop(1, C.purD);
  bodyP(); x.fillStyle = bg; x.fill(); x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  x.save(); bodyP(); x.clip();
  drBelly(x, bsh, 3.4, 5.8 * (1 - 0.18 * ya), 10.8, 0, pl);
  x.restore();
  if (pl > 0.05) {   // peluş etiketi
    x.save(); x.globalAlpha = pl; x.translate(9.4, 9); x.rotate(0.35);
    x.fillStyle = '#fffaf4'; x.fillRect(-1.6, 0, 3.2, 4.6); x.strokeStyle = 'rgba(120,100,90,0.6)'; x.lineWidth = 0.4; x.strokeRect(-1.6, 0, 3.2, 4.6);
    x.fillStyle = '#ff9ad0'; x.translate(0, 2.3); drHeart(x, 0.9);
    x.restore();
  }
  if (pose <= 0.3) { arm(-1); arm(1); }
  // kafa: büyük, yuvarlak
  x.save(); x.translate(0, -9); x.rotate(D.headTilt * 0.3 * D.face + D.headRoll); x.translate(0, 9);
  // ibik: yandaki yelpazenin aynısı; önden ince dalgalı dil, dönerken genişleyip başın arkasına kayar
  x.save(); x.translate(-ys * 3.4 * ya, 0.6); x.translate(0, -23); x.scale(ys * lerp(0.34, 0.8, ya), lerp(0.96, 1, ya)); x.translate(-1.2, 23);
  drCrest(x, tm, 0.6); x.restore();
  const ef = (pl > 0.5 ? 0 : Math.sin(tm * 3.1) * 0.08) + (D.expr === 'happy' ? Math.sin(tm * 14) * 0.12 : 0) - 0.3 * pl - D.yawn * 0.2;
  const ear = (sd, top) => {   // sd=1: soldaki kulak. Dönüşte yakın kulak başın üstüne gelir, uzak kulak arkaya kaçar
    const near = ya > 0.01 && sd === ys;
    if (top !== (near && ya > 0.32)) return;
    x.save(); x.scale(sd, 1);
    x.translate(lerp(-11, near ? -5.5 : -8.5, ya), lerp(-8.4, -10.8, ya));
    drEar(x, lerp(-1.55, near ? -0.8 : -1.9, ya) - ef + (D.sEr ? D.sEr.a * 0.6 : 0), near ? lerp(0.85, 0.7, ya) : 0.85);
    x.restore();
  };
  ear(-1, false); ear(1, false);
  const hg = x.createRadialGradient(-3, -17, 1, 0, -11, 15);
  hg.addColorStop(0, C.purL); hg.addColorStop(0.6, C.pur); hg.addColorStop(1, C.purD);
  const mx = sph(0, 12.6) * 0.9, snx = mx + ys * 2.6 * ya;   // ağız/burun ortası; 3/4'te burun çıkıntısı
  const headP = () => { x.beginPath(); x.ellipse(0, -12, 12.6, 11.4, 0, 0, 6.283); if (ya > 0.05) { x.moveTo(snx + 5.4, -6.6); x.ellipse(snx, -6.6, 5.4, 4.2, 0, 0, 6.283); } };
  headP(); x.fillStyle = hg; x.fill('nonzero');
  x.save(); headP(); x.clip();
  // limon yeşili çene (karına bağlanır; ağızdan aşağı)
  x.fillStyle = C.lime; x.beginPath(); x.moveTo(mx - 4.6, -4.2); x.quadraticCurveTo(mx, -3, mx + 4.6, -4.2); x.lineTo(mx + 5.2, 2); x.lineTo(mx - 5.2, 2); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(110,150,20,0.45)'; x.lineWidth = 0.45; x.beginPath(); x.moveTo(mx - 4, -2.3); x.lineTo(mx + 4, -2.3); x.moveTo(mx - 4.6, -0.8); x.lineTo(mx + 4.6, -0.8); x.stroke();
  x.restore();
  // dış çizgi: kafa + (3/4'te) burun çıkıntısının dış kenarı
  x.strokeStyle = C.line; x.lineWidth = 0.85;
  x.beginPath(); x.ellipse(0, -12, 12.6, 11.4, 0, 0, 6.283); x.stroke();
  if (ya > 0.05) {
    x.save(); x.beginPath(); x.rect(-40, -40, 80, 80); x.ellipse(0, -12, 12.6, 11.4, 0, 0, 6.283); x.clip('evenodd');
    x.beginPath(); x.ellipse(snx, -6.6, 5.4, 4.2, 0, 0, 6.283); x.stroke(); x.restore();
    x.save(); x.beginPath(); x.ellipse(snx, -6.6, 5.4, 4.2, 0, 0, 6.283); x.clip();   // burnun altında kafa çizgisi görünmesin
    x.fillStyle = hg; x.beginPath(); x.ellipse(snx, -6.6, 5.6, 4.4, 0, 0, 6.283); x.fill();
    x.fillStyle = C.lime; x.beginPath(); x.moveTo(mx - 4.6, -4.2); x.quadraticCurveTo(mx, -3, mx + 4.6, -4.2); x.lineTo(mx + 5.2, 2); x.lineTo(mx - 5.2, 2); x.closePath(); x.fill();
    x.restore();
  }
  x.strokeStyle = 'rgba(255,245,255,0.4)'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(0, -12, 11.2, 10, 0, -2.5, -0.7); x.stroke();
  // küçük yuvarlak burun
  const sg = x.createRadialGradient(mx, -6.8, 0.5, mx, -6.2, 4.6);
  sg.addColorStop(0, 'rgba(232,212,255,0.95)'); sg.addColorStop(0.7, 'rgba(214,186,248,0.6)'); sg.addColorStop(1, 'rgba(214,186,248,0)');
  x.fillStyle = sg; x.beginPath(); x.ellipse(mx, -6.2, 4.8, 3.6, 0, 0, 6.283); x.fill();
  x.strokeStyle = 'rgba(78,47,138,0.3)'; x.lineWidth = 0.5; x.beginPath();
  if (!(ys > 0 && ya > 0.4)) { x.moveTo(mx - 3.4, -8.6); x.quadraticCurveTo(mx - 4.4, -6.2, mx - 3.8, -4.4); }
  if (!(ys < 0 && ya > 0.4)) { x.moveTo(mx + 3.4, -8.6); x.quadraticCurveTo(mx + 4.4, -6.2, mx + 3.8, -4.4); }
  x.stroke();
  if (D.puff > 0.02) {   // şişkin yanaklar
    const pr = D.puff;
    for (const sd of [-1, 1]) {
      const cx = sph(sd * 0.72, 8 + 1.8 * pr), rx = 2.8 + 2.6 * pr, ry = 2.4 + 2.1 * pr;
      x.fillStyle = C.pur; x.beginPath(); x.ellipse(cx, -6, rx, ry, 0, 0, 6.283); x.fill();
      x.strokeStyle = C.line; x.lineWidth = 0.8; x.beginPath();
      if (sd > 0) x.ellipse(cx, -6, rx, ry, 0, -1.3, 1.9); else x.ellipse(cx, -6, rx, ry, 0, 1.25, 4.45); x.stroke();
    }
  }
  const blush = (D.expr === 'normal' && pl < 0.5 ? 0.3 : 0.5) + D.puff * 0.2;
  x.fillStyle = 'rgba(255,120,190,' + Math.min(0.8, blush) + ')';
  x.beginPath();
  for (const sd of [-1, 1]) {
    const a0 = sd * 0.72 + YA; if (Math.cos(a0) < 0.15) continue;
    const bx = sph(sd * 0.72, 11.6 + 1.8 * D.puff), bw = (2.2 + D.puff) * Math.cos(a0) / 0.75;
    x.moveTo(bx + bw, -6.2); x.ellipse(bx, -6.2, bw, 1.3 + D.puff * 0.5, 0, 0, 6.283);
  }
  x.fill();
  const blink = D.blinkT < 0 ? Math.max(0.08, Math.abs(D.blinkT + 0.07) / 0.07) : 1;
  x.save(); x.beginPath(); x.ellipse(0, -12, 12.9, 11.7, 0, 0, 6.283); x.clip();
  for (const sd of [-1, 1]) {   // gözler küre üstünde: dönüşte uzak göz incelir, yakın göz biraz büyür
    const a0 = sd * 0.56 + YA, sc = clamp(Math.cos(a0) / Math.cos(0.56), 0.2, 1.15);
    x.save(); x.translate(sph(sd * 0.56, 12.2), 0); x.scale(sc, 1);
    drFrontEye(x, 0, -13.3, 5, 6.3, sd, blink, drEyeKind(sd > 0));
    x.restore();
  }
  x.restore();
  ear(-1, true); ear(1, true);
  drMouthDraw(x, mx, -3.6, 3 * (1 - 0.25 * ya), true);
  x.restore();
}
// büyük koyu yeşil yelpaze ibik: başın tepesinden arkasına uzanan üç yuvarlak taraklı dilim + ensede küçük dilim.
// Yandan görünüş yerel koordinatı (baş tepesi ≈ (6.6,-23.4), ense ≈ (-5,-9)). Önden: yatayda sıkıştırılınca ince dalgalı dil olur.
function drCrestPath(x) {
  x.beginPath(); x.moveTo(10.2, -21);
  x.quadraticCurveTo(12.4, -27.8, 8, -30.2); x.quadraticCurveTo(5, -31.4, 2.6, -29.4);        // ön dilim → sığ çentik
  x.quadraticCurveTo(0.2, -32.4, -4.6, -31); x.quadraticCurveTo(-8.2, -29.8, -9.2, -26.8);    // orta dilim
  x.quadraticCurveTo(-13.6, -26, -14.2, -21.6); x.quadraticCurveTo(-14.4, -18.4, -11.2, -17); // arka dilim
  x.quadraticCurveTo(-13.4, -13, -10.8, -10.2); x.quadraticCurveTo(-8.6, -7.6, -4.6, -7.4);   // ensede küçük dilim
  x.lineTo(-1, -13); x.lineTo(6, -19.5); x.closePath();
}
function drCrest(x, tm, w) {   // w: dalgalanma ağırlığı
  const C = DR_COL;
  const sway = (Math.sin(D.ph - 1.4) * 0.035 * (1 - D.glide) + Math.sin(tm * 1.9) * 0.02) * w * (1 - D.plush);
  x.save(); x.translate(-2, -17); x.rotate(sway - D.tilt * 0.08 + (D.sCr ? D.sCr.a * w : 0)); x.scale(0.9, 0.9); x.translate(2, 17);
  drCrestPath(x);
  const cg = x.createLinearGradient(-4, -34, 2, -16); cg.addColorStop(0, C.crestL); cg.addColorStop(0.42, C.crest); cg.addColorStop(1, C.crestD);
  x.fillStyle = cg; x.fill(); x.strokeStyle = C.crestD; x.lineWidth = 0.9; x.lineJoin = 'round'; x.stroke();
  // dilimler arası dikiş/kıvrım çizgileri ve yumuşak parlaklık (peluş kumaş)
  x.strokeStyle = 'rgba(16,60,16,0.55)'; x.lineWidth = 0.7; x.lineCap = 'round';
  x.beginPath(); x.moveTo(2.6, -29.4); x.quadraticCurveTo(3, -26.4, 3.6, -23.6);
  x.moveTo(-9.2, -26.8); x.quadraticCurveTo(-7, -23.6, -5.2, -21);
  x.moveTo(-11.2, -17); x.quadraticCurveTo(-8.8, -15.4, -6.8, -14.4); x.stroke();
  x.strokeStyle = 'rgba(160,230,120,0.45)'; x.lineWidth = 0.8;
  x.beginPath(); x.moveTo(10, -27.4); x.quadraticCurveTo(8.6, -29.6, 6.2, -29.8); x.moveTo(-1.2, -31.2); x.quadraticCurveTo(-3.8, -31.4, -5.8, -30.4);
  x.moveTo(-11.8, -24.4); x.quadraticCurveTo(-13.2, -23.2, -13.4, -21.4); x.stroke();
  x.restore();
}
function drSide(x, tm) {   // yandan görünüş (sağa bakan yerel uzay)
  const C = DR_COL, pose = D.pose, grip = D.grip, bk = D.beckon;

  drawWing(x, true, tm);
  // uzak bacak
  x.fillStyle = C.purD;
  x.beginPath(); x.ellipse(3, 9.6 - D.glide * 1.5, 4.4, 4.2, 0, 0, 6.283); x.fill();
  x.beginPath(); x.ellipse(6.4, 13.6 - D.glide * 2, 4.6, 2.6, 0, 0, 6.283); x.fill();
  // kısa tombul kollar: itmede yukarı, taşırken öne, "gel" derken el sallar
  const arm = (far) => {
    const shx = far ? 6.4 : 4.6, shy = far ? -1.6 : -0.6;
    let px = lerp(far ? 10.8 : 9.2, far ? 11.5 : 9.5, pose), py = lerp(far ? 2.6 : 3.8, far ? -13 : -14, pose);
    px = lerp(px, far ? 12.6 : 11.8, grip); py = lerp(py, far ? 5.2 : 6.2, grip);
    if (!far && bk > 0.01) { const w = Math.sin(tm * 9); px = lerp(px, 11.5 + w * 1.8, bk); py = lerp(py, -8 - w * 2.6, bk); }
    x.strokeStyle = C.line; x.lineWidth = 6.2; x.lineCap = 'round';
    x.beginPath(); x.moveTo(shx, shy); x.lineTo(px, py); x.stroke();
    x.strokeStyle = far ? C.purD : C.pur; x.lineWidth = 5; x.stroke();
    x.fillStyle = far ? C.pur : C.purL; x.beginPath(); x.arc(px, py, 1.7, 0, 6.283); x.fill();
  };
  if (pose > 0.3) { arm(true); arm(false); } else arm(true);
  // sırt dikenleri, gövde, karın
  drBlobs(x, DR_SPINE_S, C.crest, C.crestD, 1.3);
  const bg = x.createRadialGradient(0, -2, 1, -1, 4, 14);
  bg.addColorStop(0, C.purL); bg.addColorStop(0.6, C.pur); bg.addColorStop(1, C.purD);
  const bodyP = () => {   // armut gövde: boyun ince, karın/kalça tombul
    x.beginPath(); x.moveTo(-4.8, -6.4);
    x.bezierCurveTo(-8.6, -3, -11.4, 5, -10, 10.4); x.bezierCurveTo(-8.8, 14.6, -3.4, 15.4, 0.4, 15.2);
    x.bezierCurveTo(5.4, 15, 9.8, 12.2, 9.8, 6.6); x.bezierCurveTo(9.8, 1, 7.6, -4.4, 4.6, -6.6);
    x.bezierCurveTo(1.6, -8.6, -2.6, -8.4, -4.8, -6.4); x.closePath();
  };
  x.fillStyle = bg; bodyP(); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  x.save(); bodyP(); x.clip();
  drBelly(x, 7.2, 3.6, 5.6, 12.4, -0.14, D.plush);
  x.restore();
  // yakın bacak (taşırken arka ayakla Feza'nın elini tutar)
  const lg = D.glide * 2;
  x.fillStyle = C.pur; x.beginPath(); x.ellipse(-2.8 - grip * 2.8, 9 - lg * 0.5 + grip * 2.2, 5.4, 5.2, -0.3 - grip * 0.5, 0, 6.283); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  const fx = lerp(0.2, DR_PAW[0] + 0.6, grip), fy = lerp(13.4 - lg, DR_PAW[1] - 0.8, grip);
  x.fillStyle = C.purL; x.beginPath(); x.ellipse(fx + 0.6 * (1 - grip), fy + 0.4 * (1 - grip), 5.4, 3 + grip * 0.2, 0.05 + grip * 1.1, 0, 6.283); x.fill(); x.stroke();
  if (pose <= 0.3) arm(false);

  drawWing(x, false, tm);

  // ── kafa ──
  x.save(); x.translate(4.5, -9); x.rotate(D.headTilt + D.headRoll + (D.sniff || 0) * 0.06); x.translate(-4.5, 9);
  drCrest(x, tm, 1);
  const headPath = () => {
    x.beginPath(); x.moveTo(-5, -11);
    x.bezierCurveTo(-5.2, -18.8, 0, -23.4, 6.6, -23.4);
    x.bezierCurveTo(12.8, -23.4, 16.4, -19.2, 16.6, -14.8);
    x.bezierCurveTo(18.9, -14.4, 20.4, -11.8, 19.9, -9);
    x.bezierCurveTo(19.5, -6.4, 17.2, -5.6, 15, -5.7);
    x.bezierCurveTo(13.6, -2.6, 9.6, -0.6, 5.4, -0.8);
    x.bezierCurveTo(0, -1.2, -4.8, -5, -5, -11); x.closePath();
  };
  const hg = x.createRadialGradient(6, -18, 1, 5, -11, 16);
  hg.addColorStop(0, C.purL); hg.addColorStop(0.6, C.pur); hg.addColorStop(1, C.purD);
  headPath(); x.fillStyle = hg; x.fill();
  x.save(); headPath(); x.clip();
  // limon yeşili alt çene (karına bağlanır)
  x.fillStyle = C.lime; x.beginPath(); x.moveTo(20.4, -6.6); x.quadraticCurveTo(12.5, -5.4, 4.6, -2.6); x.lineTo(3, 4); x.lineTo(22, 4); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(110,150,20,0.45)'; x.lineWidth = 0.45; x.beginPath(); x.moveTo(9, -2.6); x.lineTo(13, -3.8); x.moveTo(7, -1.2); x.lineTo(12, -2.2); x.stroke();
  // burun ucu açık ton
  const mg = x.createRadialGradient(17.6, -10, 0.5, 17.6, -10, 5.5);
  mg.addColorStop(0, 'rgba(235,215,255,0.8)'); mg.addColorStop(1, 'rgba(235,215,255,0)');
  x.fillStyle = mg; x.fillRect(11, -16, 11, 11);
  x.beginPath(); x.rect(-8, -30, 30, 12); x.clip();
  x.translate(0.6, 1.4); headPath(); x.strokeStyle = 'rgba(255,245,255,0.42)'; x.lineWidth = 1.2; x.stroke();
  x.restore();
  headPath(); x.strokeStyle = C.line; x.lineWidth = 0.85; x.stroke();
  x.fillStyle = C.line; x.beginPath(); x.ellipse(18.6, -11, 0.55, 0.42, -0.3, 0, 6.283); x.fill();   // burun deliği
  if (D.puff > 0.02) {   // şişkin yanak: kafa çizgisinin dışına taşar
    const pr = D.puff, cx = 12.4 + pr * 1.2, cy = -6 + pr * 0.6, rx = 3 + 4 * pr, ry = 2.2 + 3.4 * pr;
    x.fillStyle = C.pur; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 6.283); x.fill();
    x.fillStyle = 'rgba(235,215,255,0.5)'; x.beginPath(); x.ellipse(cx + 0.8, cy - 0.6, rx * 0.6, ry * 0.5, 0, 0, 6.283); x.fill();
    x.strokeStyle = C.line; x.lineWidth = 0.8; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, -0.25, Math.PI + 0.35); x.stroke();
  }
  const blush = (D.expr === 'normal' ? 0.28 : 0.5) + D.puff * 0.2;
  x.fillStyle = `rgba(255,120,190,${Math.min(0.8, blush)})`; x.beginPath(); x.ellipse(11.4 + D.puff * 2.5, -7.6 + D.puff, 2.4 + D.puff, 1.3 + D.puff * 0.5, 0, 0, 6.283); x.fill();
  // kocaman yeşil göz
  const ex = 10.2, ey = -13.8, erx = 4.55, ery = 6.25;   // oyun boyutunda okunsun diye iri
  x.save(); headPath(); x.clip();
  const blink = D.blinkT < 0 ? Math.max(0.08, Math.abs(D.blinkT + 0.07) / 0.07) : 1;
  const kind = drEyeKind(false);
  x.strokeStyle = C.eye; x.lineCap = 'round'; x.lineJoin = 'round';
  x.save(); x.translate(ex, ey);
  if (kind === 'happy') {
    x.lineWidth = 1.6; x.beginPath(); x.moveTo(-3.6, 1.4); x.quadraticCurveTo(0, -3.8, 3.6, 1.4); x.stroke();
  } else if (kind === 'chev') {
    x.lineWidth = 1.5; x.beginPath(); x.moveTo(-3, -2.6); x.lineTo(2.2, 0); x.lineTo(-3, 2.4); x.stroke();
  } else if (kind === 'closed' || blink * D.lid <= 0.4) {
    drClosedEye(x, erx * 0.95, ery * 0.8, kind === 'closed' ? -1 : 0, 1.35);
  } else {
    const big = D.expr === 'wow' ? 1.1 + 0.1 * D.gasp : 1;
    x.scale(big, blink * D.lid * big);
    drOpenEye(x, erx, ery, 1);
    drEyeLids(x, erx, ery, -1, 1.35);
  }
  x.restore();
  x.restore();
  // yeşil yüzgeç kulak (gözün arkasında)
  const ef = Math.sin(tm * 3.1) * 0.1 + (D.expr === 'happy' ? Math.sin(tm * 14) * 0.12 : 0) - D.yawn * 0.25 - D.plush * 0.3;
  x.save(); x.translate(1.4, -11.6); drEar(x, -0.7 + ef + (D.sEr ? D.sEr.a : 0) - D.gasp * 0.35, 0.64); x.restore();
  if (D.gasp > 0.3) {   // ürkme: başın üstünde iki kısa "şaşkınlık" çizgisi
    x.strokeStyle = `rgba(255,255,255,${0.85 * clamp((D.gasp - 0.3) / 0.3, 0, 1)})`; x.lineWidth = 1; x.lineCap = 'round';
    x.beginPath(); x.moveTo(9, -27.5); x.lineTo(8, -31.5); x.moveTo(13.4, -26.4); x.lineTo(15.4, -29.8); x.moveTo(16.6, -23.6); x.lineTo(19.8, -25.4); x.stroke();
  }
  drMouthDraw(x, 16.6, -6, 2.8, false);
  if (D.expr === 'effort' && D.mk === 'o') { x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.arc(15, -24, 1, 0, 6.283); x.arc(17.2, -25.6, 0.6, 0, 6.283); x.fill(); }
  x.restore();   // kafa
}

// gövde + kuyruk (oyunda ve ara sahnelerde ortak); front: true/false sabit poz, undefined: oyundaki dönüş karışımı
function drBody(x, tm, front) {
  const game = front === undefined, z = game ? (D.dz || 1) : 1, au = game ? (D.au || 0) : 0, back = au >= 0.5;
  if (D.glowA > 0.01) { x.globalCompositeOperation = 'lighter'; drGlow(x, '#a678ff', D.x, D.y + D.bob - 4, 44 * z, 0.12 * D.glowA); x.globalCompositeOperation = 'source-over'; }
  if (!back) drawTail(x, tm);
  const fr = game ? D.fw > 0.5 : front;
  const sw = 1 + 0.15 * D.puff, sh = 1 + 0.12 * D.puff, sq = game ? (D.tsq || 1) : 1, ss = game ? (D.sq || 0) : 0;
  x.save(); x.translate(D.x, D.y + D.bob); if (z !== 1) x.scale(z, z);
  if (back) {   // uzaklaşırken: 3/4 arkadan (dönüş: yan → daralır → arka; geri dönüşte tersi)
    const v = smooth((au - 0.5) / 0.5), as = D.awayS || D.face;
    x.rotate(D.tilt * 0.3 * as); x.scale(sw * (0.78 + 0.22 * v) * (1 + ss * 0.5), sh * (1 - ss * 0.4));
    drBack(x, tm, as * lerp(0.95, 0.42, v));
  } else {
    const aq = 1 - 0.22 * smooth(au / 0.5);
    if (fr) { x.rotate(D.tilt * 0.4 * D.face); x.scale(sw * sq * aq * (1 + ss * 0.5), sh * (1 - ss * 0.4)); drFront(x, tm, game ? (D.yaw || 0) : 0); }
    else { x.scale(D.face * sq * aq, 1); x.rotate(D.tilt + (game ? D.spin || 0 : 0)); x.scale(sw * (1 + ss), sh * (1 - ss * 0.7)); drSide(x, tm); }
  }
  x.restore();
  if (back) drawTail(x, tm);
}
// arkadan görünüş (yerel: gövde ortası 0,0; yaw işareti burnun göründüğü yan). Sırt, sırt dikenleri, ensede ibik, iki ışık kanadı.
const DR_BSP = [];
function drBack(x, tm, yaw) {
  const C = DR_COL, ya = Math.abs(yaw), ys = yaw >= 0 ? 1 : -1, mid = -ys * 3.6 * ya, lg = D.glide * 2;
  const snk = ya > 0.2 ? smooth(clamp((ya - 0.2) / 0.5, 0, 1)) : 0;
  // ayak tabanları ve küçük kollar (gövdenin arkasında kalır, kenardan görünür)
  for (const sd of [-1, 1]) {
    x.fillStyle = C.purL; x.strokeStyle = C.line; x.lineWidth = 0.8;
    x.beginPath(); x.ellipse(sd * 6 + mid * 0.3, 14.2 - lg * 0.5, 4.4, 2.6, 0, 0, 6.283); x.fill(); x.stroke();
    x.fillStyle = C.pur; x.beginPath(); x.ellipse(sd * 9.8 + mid * 0.2, 2.2, 2.6, 3.2, sd * 0.4, 0, 6.283); x.fill(); x.stroke();
  }
  // gövde (sırt): armut, ortada koyu yeşil yumuşak dikenler
  const bodyP = () => {
    x.beginPath(); x.moveTo(0, -7.2);
    x.bezierCurveTo(5.6, -7.2, 8, -2.4, 9.4, 3.2); x.bezierCurveTo(11, 9.6, 8.4, 15, 0, 15);
    x.bezierCurveTo(-8.4, 15, -11, 9.6, -9.4, 3.2); x.bezierCurveTo(-8, -2.4, -5.6, -7.2, 0, -7.2); x.closePath();
  };
  const bg = x.createRadialGradient(mid * 0.5 - 2, -2, 1, 0, 4, 15);
  bg.addColorStop(0, C.purL); bg.addColorStop(0.55, C.pur); bg.addColorStop(1, C.purD);
  bodyP(); x.fillStyle = bg; x.fill(); x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  // sırt dikenleri: yukarı bakan yumuşak damlalar (peluştaki gibi), aşağı doğru küçülür
  x.fillStyle = C.crest; x.strokeStyle = C.crestD; x.lineWidth = 0.7;
  for (let i = 0; i < 4; i++) {
    const cy = -3.6 + i * 4.6, s = 1.45 - i * 0.2, cx = mid * (0.7 + 0.03 * i);
    x.beginPath(); x.moveTo(cx, cy - 3.2 * s); x.quadraticCurveTo(cx + 2 * s, cy - 0.4 * s, cx + 1.5 * s, cy + 1.1 * s);
    x.quadraticCurveTo(cx, cy + 2 * s, cx - 1.5 * s, cy + 1.1 * s); x.quadraticCurveTo(cx - 2 * s, cy - 0.4 * s, cx, cy - 3.2 * s); x.closePath(); x.fill(); x.stroke();
  }
  x.strokeStyle = 'rgba(255,245,255,0.3)'; x.lineWidth = 1; x.beginPath(); x.ellipse(mid * 0.4, 3, 7, 9, 0, -2.6, -1.2); x.stroke();
  // ışıktan kanatlar: arkadan ikisi de tam görünür (sırta bağlı)
  for (const sd of [1, -1]) { x.save(); x.scale(sd, 1); x.translate(-2.5 + sd * mid * 0.4, -1); x.rotate(-0.1); x.scale(1.15, 1.15); drawWing(x, sd === ys && ya > 0.6, tm); x.restore(); }
  // kafa
  x.save(); x.translate(0, -9); x.rotate(D.headRoll); x.translate(0, 9);
  const ef = Math.sin(tm * 3.1) * 0.08 + (D.expr === 'happy' ? Math.sin(tm * 14) * 0.12 : 0) - D.yawn * 0.2;
  for (const sd of [-1, 1]) {   // kulaklar başın iki yanında (burun yanındaki kulak öne kaçar: küçülür, yukarı kalkar)
    const nr = sd === -ys ? 0 : snk;
    x.save(); x.scale(sd, 1); x.translate(-10.6 + 2.6 * nr, -9.4 - 2.2 * nr); drEar(x, -1.5 - ef + D.sEr.a * 0.6 + 0.35 * nr, 0.85 - 0.15 * nr); x.restore();
  }
  if (snk > 0) {   // burun ve çene: başın yanından, ağız hizasında öne doğru görünür
    const sx = ys * (8.6 + 5 * snk), sy = -5.6;
    x.fillStyle = C.pur; x.strokeStyle = C.line; x.lineWidth = 0.85;
    x.beginPath(); x.ellipse(sx, sy, 3 + 2.6 * snk, 4, ys * 0.2, 0, 6.283); x.fill(); x.stroke();
    x.save(); x.beginPath(); x.ellipse(sx, sy, 3 + 2.6 * snk, 4, ys * 0.2, 0, 6.283); x.clip();
    x.fillStyle = C.lime; x.beginPath(); x.ellipse(sx + ys * 0.4, sy + 3.4, 5.5, 2.4, 0, 0, 6.283); x.fill(); x.restore();
    x.fillStyle = 'rgba(255,120,190,0.35)'; x.beginPath(); x.ellipse(sx - ys * 1.6, sy - 0.6, 1.6, 1, 0, 0, 6.283); x.fill();
  }
  const hg = x.createRadialGradient(mid * 0.4 - 3, -17, 1, 0, -11, 15);
  hg.addColorStop(0, C.purL); hg.addColorStop(0.6, C.pur); hg.addColorStop(1, C.purD);
  x.fillStyle = hg; x.beginPath(); x.ellipse(0, -12, 12.6, 11.4, 0, 0, 6.283); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.85; x.stroke();
  x.strokeStyle = 'rgba(255,245,255,0.38)'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(0, -12, 11.2, 10, 0, -2.5, -0.9); x.stroke();
  // ibik: başın ortasından enseye inen taraklı sırt (arkadan bakınca başın ÜSTÜNDE)
  x.save(); x.translate(mid, 0.4); x.translate(0, -23); x.scale(-ys * lerp(0.36, 0.62, ya), 1); x.translate(-1.2, 23);
  drCrest(x, tm, 0.7); x.restore();
  x.restore();
}

// Bölüm 2 gece ortamı: ay kenar ışığı (soğuk mavi, üstten) + su yansıması (suyun üstündeyken)
function drGece(x, tm) {
  const bx = D.x, by = D.y;
  x.globalCompositeOperation = 'lighter';
  drGlow(x, '#8fb4ff', bx - D.fs * 4, by - 14, 46, 0.13);      // ay ışığı halesi
  drGlow(x, '#d9c2ff', bx, by + 2, 30, 0.09 + 0.03 * Math.sin(tm * 2.1));
  if (D.flare > 0.02) {                                         // yıldız uyanınca renk patlaması + halka
    const u = 1 - D.flare;
    drGlow(x, '#fff2a8', bx, by, 44 + 40 * u, 0.42 * D.flare);   // yumuşak parlama (halka yok)
  }
  const gl = typeof BOLUM !== 'undefined' && BOLUM.gollar;
  if (gl) for (const q of gl) {
    if (!q || bx < q.x0 || bx > q.x1 || by > q.su || q.su - by > 300) continue;
    const h = q.su - by, a = Math.max(0, 1 - h / 300), sy = q.su + 3;
    x.save(); x.translate(bx, sy); x.scale(1, 0.22);
    drGlow(x, '#bcd4ff', 0, 0, 64 + 10 * Math.sin(tm * 2.4), 0.34 * a);
    drGlow(x, '#ffffff', 0, 0, 22, 0.28 * a);
    x.restore();
    // yumuşak yansıma: ters, dalgalı mor gövde lekesi + yeşil ibik + ışık çizgileri
    const ry = Math.min(60, 14 + h * 0.12), w = Math.sin(tm * 2.7) * 2;
    x.save(); x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 0.22 * a; x.fillStyle = '#b28ae6'; x.beginPath(); x.ellipse(bx + w, sy + 6 + h * 0.18, 14, ry * 0.5, 0, 0, 6.283); x.fill();
    x.fillStyle = '#2f8a2c'; x.globalAlpha = 0.16 * a; x.beginPath(); x.ellipse(bx - D.fs * 6 + w, sy + 4 + h * 0.1, 9, 6, 0, 0, 6.283); x.fill();
    x.globalAlpha = 1; x.restore();
    x.globalCompositeOperation = 'lighter'; x.strokeStyle = '#d4e4ff'; x.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const yy = sy + 3 + i * 5 + (tm * 8 + i * 3) % 3, ww = (20 - i * 3.5) * (0.8 + 0.2 * Math.sin(tm * 3 + i)); x.globalAlpha = 0.34 * a * (1 - i * 0.2); x.lineWidth = 1.6; x.beginPath(); x.moveTo(bx - ww + w, yy); x.lineTo(bx + ww + w, yy); x.stroke(); }
    x.globalAlpha = 1;
    break;
  }
  x.globalCompositeOperation = 'source-over';
}
function drawDragon(tm) {
  dragonInit();
  if (!isFinite(D.x) || !isFinite(D.y)) return;
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
      if (b.cut) continue;
      x.strokeStyle = `rgba(200,160,255,${0.35 * al})`; x.lineWidth = 16 * al;
      x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
      x.strokeStyle = `rgba(255,235,255,${0.6 * al})`; x.lineWidth = 4 * al; x.stroke();
    }
    x.restore();
  }
  if (D.spo && D.spo.a > 0.01) {   // uçuşan ışık sporu (Pırıl'ın kovaladığı)
    const sp = D.spo, tw = 0.75 + 0.25 * Math.sin(tm * 9 + sp.ph);
    x.globalCompositeOperation = 'lighter';
    drGlow(x, '#fff2a8', sp.x, sp.y, 26 * tw, 0.5 * sp.a); drGlow(x, '#bff4ff', sp.x, sp.y, 12, 0.7 * sp.a); drGlow(x, '#ffffff', sp.x, sp.y, 6, 1 * sp.a);
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = '#fffbe8'; x.globalAlpha = sp.a; x.beginPath(); x.arc(sp.x, sp.y, 2.2, 0, 6.283); x.fill();
    for (let i = 0; i < 6; i++) { const a = i * 1.047 + tm * 1.3; x.beginPath(); x.ellipse(sp.x + Math.cos(a) * 3.6, sp.y + Math.sin(a) * 3.6, 1.6, 0.6, a, 0, 6.283); x.fill(); }   // pamuk gibi tüycükler
    x.globalAlpha = 1;
    x.fillStyle = '#ffffff'; drTwinkle(x, sp.x, sp.y, 6.5 * tw, 0.9 * sp.a);
  }
  if (BOLUM_NO === 2) drGece(x, tm);
  drBody(x, tm);
  if (BOLUM_NO === 2) { x.globalCompositeOperation = 'lighter'; drGlow(x, '#5a6cff', D.x, D.y - 4, 26, 0.08); x.globalCompositeOperation = 'source-over'; }   // gövdeye ortam tonu (mor-mavi)

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
  'headRoll', 'yaw', 'tsq', 'wingA', 'puff', 'blowM', 'mouth', 'yawn', 'stretch', 'fold', 'grip', 'plush', 'glowA', 'eyeOv', 'eyeOvR', 'lid', 'beckon', 'tail', 'hop', 'mk', 'ma',
  'spin', 'sq', 'dz', 'au', 'gasp', 'nom', 'nomO', 'mRound', 'mWide', 'spd', 'sniff'];
const drPozSave = {};
let drPozTail = null;
function drPozTailCurl(curl, wave, tm) {   // önden pozlar: kuyruk sağ yandan çıkıp kıvrılır
  let px = 5, py = 10, h = 0.45;
  for (let i = 0; i < DR_TAIL_N; i++) {
    drPozTail[i].x = px; drPozTail[i].y = py;
    h -= lerp(0.04, 0.15, curl) + wave * Math.sin(tm * 3 - i * 0.6) * 0.12;
    px += Math.cos(h) * DR_TAIL_LEN * 0.78; py += Math.sin(h) * DR_TAIL_LEN * 0.78;
  }
}
// Peluş kumaş dokusu (yalnız yakın çekim pozlarında): yumuşak kadife parlaması, kenar tüy ışığı, dikiş izleri
function drPelusDoku(c, tm, pl) {
  c.save(); c.globalAlpha = pl;
  const op = c.globalCompositeOperation; c.globalCompositeOperation = 'lighter';
  drGlow(c, '#efe0ff', -5, -20, 11, 0.16); drGlow(c, '#e8ffd0', 2, 4, 14, 0.07);   // başın üstünde kadife parlaması, karında hafif ışık
  c.globalCompositeOperation = op;
  // dikiş izleri: alın/yüz hattı, karın kenarı, kol ve bacak ekleri (kısa tireli çizgiler)
  c.strokeStyle = 'rgba(255,248,255,0.55)'; c.lineWidth = 0.55; c.lineCap = 'round'; c.setLineDash([1.6, 1.5]);
  c.beginPath(); c.arc(0.5, -4.5, 11.4, -2.55, -0.62); c.stroke();                       // kafa dikişi (alın üstünden kulaktan kulağa)
  c.beginPath(); c.moveTo(-8.6, 13.8); c.quadraticCurveTo(0, 16.8, 8.6, 13.8); c.stroke();   // karın altı dikişi
  c.setLineDash([]);
  c.restore();
}
function pirilCizPoz(ctx, x, y, olcek, poz, tm, u) {
  dragonInit();
  for (const k of DR_POZ_KEYS) drPozSave[k] = D[k];
  if (!drPozTail) { drPozTail = []; for (let i = 0; i < DR_TAIL_N; i++) drPozTail.push({ x: 0, y: 0 }); }
  D.x = 0; D.y = 0; D.bob = 0; D.tilt = 0; D.fw = 0; D.yaw = 0; D.tsq = 1; D.face = D.fs = 1; D.hop = 0; D.glide = 0;
  D.puff = 0; D.blowM = 0; D.mouth = 0; D.yawn = 0; D.stretch = 0; D.fold = 0; D.wingA = 1; D.grip = 0; D.pose = 0; D.plush = 0; D.glowA = 1;
  D.eyeOv = null; D.eyeOvR = null; D.headRoll = 0; D.headTilt = 0; D.lookX = 0; D.lookY = 0.25; D.expr = 'normal'; D.lid = 1; D.beckon = 0;
  D.blinkT = 1; D.tail = drPozTail;
  D.spin = 0; D.sq = 0; D.dz = 1; D.au = 0; D.gasp = 0; D.nom = 0; D.nomO = 0; D.mRound = 0; D.mWide = 0; D.spd = 0; D.sniff = 0;
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
  } else if (poz === 'uyaniyor' || poz === 'sabah') {   // 'sabah': u 0→1 = canlı → peluş (parıltı söner, kanatlar solar, gözler kapanır)
    const v = u === undefined ? 0.6 : (poz === 'sabah' ? 1 - clamp(u, 0, 1) : clamp(u, 0, 1));
    const eo = smooth(clamp((v - 0.1) / 0.35, 0, 1)), st = Math.sin(clamp((v - 0.35) / 0.55, 0, 1) * Math.PI);
    D.plush = 1 - smooth(clamp((v - 0.2) / 0.6, 0, 1)); D.glowA = smooth(clamp((v - 0.25) / 0.6, 0, 1)); halo = D.glowA;
    D.ph = 1.2 + st * 0.8 + tm * 6 * smooth(clamp((v - 0.6) / 0.4, 0, 1)); D.wingA = smooth(clamp((v - 0.45) / 0.35, 0, 1)); D.stretch = st;
    D.pose = st * 0.9; D.headRoll = lerp(0.22, 0, smooth(v)); D.headTilt = -0.15 * st;
    if (eo < 0.05) D.eyeOv = 'closed';
    else { D.lid = Math.max(0.42, eo); const fl = Math.sin(tm * 9); if (eo < 0.9 && fl > 0.75) D.eyeOv = 'closed'; }
    D.expr = v > 0.85 ? 'happy' : 'normal'; if (st > 0.5) D.yawn = (st - 0.5) * 1.4;
    D.lookY = 0.1;
    drPozTailCurl(lerp(1, 0.55, smooth(v)), smooth(v), tm);
  } else if (poz === 'pelus_sik') {   // Feza'ya sarılı peluş: kolun altında hafif ezilmiş, yastık/kol sıkışması (opsiyonel u: sıkma 0..1, verilmezse 0.7)
    D.plush = 1; D.glowA = 0; D.wingA = 0; D.ph = 1.2; D.headRoll = 0.3 + Math.sin(tm * 0.9) * 0.02; D.eyeOv = 'closed'; D.expr = 'normal';
    drPozTailCurl(1, 0, tm);
  } else if (poz === 'goz_kirp') {
    D.plush = 1; D.glowA = 0; D.wingA = 0; D.ph = 1.2; D.headRoll = 0.16;
    D.eyeOv = 'open'; D.eyeOvR = 'happy'; D.expr = 'grin'; D.lookX = 0.15; D.lookY = 0.15;
    drPozTailCurl(1, 0, tm);
  } else {   // pelus: gevşek, uyuyan, ışıksız peluş
    D.plush = 1; D.glowA = 0; D.wingA = 0; D.ph = 1.2; D.headRoll = 0.24 + Math.sin(tm * 0.9) * 0.02;
    D.eyeOv = 'closed'; D.expr = 'normal';
    drPozTailCurl(1, 0, tm);
  }
  ctx.save(); ctx.translate(x, y); ctx.scale(olcek, olcek);
  if (halo > 0.01) { const op = ctx.globalCompositeOperation; ctx.globalCompositeOperation = 'lighter'; drGlow(ctx, '#b88aff', 0, 0, 90, 0.3 * halo); drGlow(ctx, '#ffe0ff', 0, 0, 30, 0.18 * halo); ctx.globalCompositeOperation = op; }
  const pl = D.plush, sik = poz === 'pelus_sik' ? (u === undefined ? 0.7 : clamp(u, 0, 1)) : 0, br = Math.sin(tm * 1.7) * 0.012 * pl;
  if (pl > 0.02) { ctx.save(); ctx.translate(0, 14); ctx.scale(1 + br + sik * 0.07, 1 - br - sik * 0.08); ctx.rotate(-sik * 0.05); ctx.translate(0, -14); }   // peluş: nefes alır, sarılınca ezilir
  drBody(ctx, tm, front);
  if (pl > 0.02) { drPelusDoku(ctx, tm, pl); ctx.restore(); }
  if ((poz === 'uyaniyor' || poz === 'sabah') && D.wingA > 0.02 && D.wingA < 0.98) {   // ışık kanatlar parıltıyla belirir
    ctx.fillStyle = '#fffbe8';
    for (let i = 0; i < 7; i++) {
      const a = i * 2.39 + tm * 1.7, r = 12 + (i % 3) * 6, tw = Math.sin(tm * 11 + i * 1.9);
      drTwinkle(ctx, Math.cos(a) * r * 1.3, -8 + Math.sin(a) * r * 0.8, 2.6 * (0.5 + 0.5 * tw), Math.sin(D.wingA * Math.PI) * 0.9);
    }
  }
  if (poz === 'goz_kirp') {   // kırpılan gözün yanında küçük parıltı
    const tw = 0.6 + 0.4 * Math.sin(tm * 5);
    ctx.fillStyle = '#fff6c8'; drTwinkle(ctx, 14, -22, 3.2 * tw, 0.9);
  }
  ctx.restore();
  for (const k of DR_POZ_KEYS) D[k] = drPozSave[k];
}

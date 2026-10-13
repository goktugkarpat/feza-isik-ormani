/* takim.js – Bölüm 2 mini oyunu: "Takımyıldızı çiz" (isteğe bağlı; hiçbir şey ona bağlı değil, SAYAC'a dokunmaz).
   bolum2.js'te üç yerde (kıyı · ada · kıyı) 'takim' nesnesi durur (nesne('takim', c, y, {sekil: 0|1|2})): yerde yumuşak bir "ay aynası"
   (su ışığı + hilal). Feza yaklaşınca kamera gökyüzüne açılır, gökte 4-7 sönük nokta (bir şeklin köşeleri) belirir. Pırıl bir ışık izi
   çizerek şekli gösterir; sonra Feza parmağını noktadan noktaya SÜRÜKLEYEREK sırayla birleştirir (sıradaki nokta nabız gibi parlar,
   okuma yok, el yok). Her doğru bağlantıda yükselen notalı çan, çizgi ışıkla belirir. Yanlış yerde bırakılırsa çizgi yumuşakça silinir
   (ceza yok, ilerleme korunur, sonsuz sabır). Şekil bitince altın renkte yanar, gökte küçük canlı versiyonu (yıldız balığı / kuğu / kaplumbağa)
   süzülür, gökyüzü biraz daha parlar, yakındaki yıldız balıkları sıçrar. Feza uzaklaşırsa etkinlik kapanır; hiçbir şey kilitlenmez.
   Girdi: pencere "capture" aşamasında yalnız noktaya dokunuş + sürükleme yakalanır (oyun.js yürüme girdisine ulaşmaz); zıplama düğmesi önce.
   Çizim: nesnenin 'cizOn' kancası içinde ekran uzayına geçilir (Feza/Pırıl'ın üstü, Foreground/ARAYUZ'un altı).
   Ses: AU.sfx('takimBelir'), ('takimNota', v = dokunuş sırası 0..7), ('takimBitti'), ('takimYanlis'); Pırıl: p_takim1, p_takim2, p_takim3.
   Önek: tk*. piril.js 'takim' modu (D.tkO). pofuduk.js'in çağırdığı skYasak() burada sarmalanır (Pofuduk takipçiler etkinlikte uzak durur). */
'use strict';
// Şekil noktaları: birim kutuda (x,y ∈ [-1,1], y aşağı), seq = bağlanma sırası (kapalı şekilde başa dönülür)
const TK_SEKIL = [
  { ad: 'denizYildizi', pts: [[0, -0.88], [0.9, 0.55], [0, 0.12], [-0.9, 0.55]], seq: [0, 1, 2, 3, 0] },
  { ad: 'kugu', pts: [[-0.88, -0.62], [-0.64, 0.0], [-0.26, 0.66], [0.46, 0.7], [0.96, -0.04], [0.16, -0.26]], seq: [0, 1, 2, 3, 4, 5, 2] },
  { ad: 'kaplumbaga', pts: [[-0.96, 0.05], [-0.5, -0.66], [0.0, -0.16], [0.5, -0.66], [0.97, 0.15], [0.45, 0.7], [-0.45, 0.7]], seq: [0, 1, 2, 3, 4, 5, 6, 0] },
];
const TK_ALTIN = ['#fffbe8', '#ffe08a', '#f2a93a'];   // çekirdek · orta · kenar
const TK_AQUA = '#7fe9ff', TK_LEYLAK = '#c9a2ff';
const tkSozVar = { bas: false, bit: false };   // hikâye cümleleri oturumda bir kez
let tkAkt = null;   // etkinlikte olan nesne (Pırıl'ı o yönetir)
let tkGok = 0;      // gökyüzü ek parlaklığı (bitirilen şekil başına biraz)
const tkPtr = { id: -1, o: null };
function tkSoz(k) { if (typeof SES !== 'undefined' && SES && SES.soyle) { try { SES.soyle(k, { oncelik: 2 }); } catch (e) {} } }
function tkSure(k) { return (window.VOICE_DUR && VOICE_DUR[k]) || (typeof SES !== 'undefined' && SES.sure ? SES.sure(k) : 3) || 3; }
function tkSfx(ad, v) { if (typeof AU !== 'undefined' && AU && typeof AU.sfx === 'function') { try { AU.sfx(ad, v); } catch (e) {} } }
const tkPx = (wx, wy) => ({ x: (wx - cam.x) * S / DPR, y: (wy - cam.y) * S / DPR });   // dünya → CSS pikseli

// ── yerleşim: şekil gökte (CSS px); ekran oranına göre ──
const tkYer = { iw: 0, ih: 0, hw: 0, hh: 0, cx: 0, cy: 0 };
function tkOlcu() {
  const iw = innerWidth, ih = innerHeight;
  if (tkYer.iw === iw && tkYer.ih === ih) return tkYer;
  tkYer.iw = iw; tkYer.ih = ih;
  tkYer.hw = Math.min(0.36 * iw, 0.34 * ih); tkYer.hh = Math.min(tkYer.hw * 0.62, 0.17 * ih);
  tkYer.cx = 0.5 * iw; tkYer.cy = Math.max(tkYer.hh + 0.07 * ih, 0.26 * ih);
  return tkYer;
}
function tkNoktalar(k) {   // [{x,y}] CSS px
  const y = tkOlcu();
  if (!k.nk || k.nkIw !== y.iw || k.nkIh !== y.ih) { k.nkIw = y.iw; k.nkIh = y.ih; k.nk = k.sek.pts.map(p => ({ x: y.cx + p[0] * y.hw, y: y.cy + p[1] * y.hh })); }
  return k.nk;
}
const tkR = () => Math.max(60, Math.min(innerWidth, innerHeight) * 0.07);   // dokunma yarıçapı (cömert)

TUR.kaydet('takim', {
  kur(o) {
    const sek = TK_SEKIL[clamp(o.sekil | 0, 0, TK_SEKIL.length - 1)];
    o.tk = { sek, ap: 0, durum: 'bekle', t: 0, n: 0, e: [], pa: sek.pts.map(() => 0), lit: sek.pts.map(() => 0), sil: [], pk: [], drag: null,
      gok: 0, bitti: false, ph: Math.random() * 6.283, bosT: 0, dmN: 0, dmA: 0, kut: 0, yurT: 0, dkT: 0, balik: 0, ilk: true, deg: 0 };
  },
  guncelle(o, dt) { tkGuncelle(o, dt); },
  ciz(o, tm) { tkAynaCiz(o, tm); },
  cizOn(o, tm) { tkGokCiz(o, tm); },
});

function tkDur(o, d) { o.tk.durum = d; o.tk.t = 0; }
function tkPirilUygun() { return D.mode === 'takim' || D.mode === 'follow' || D.mode === 'orbit' || D.mode === 'yol' || D.mode === 'ilgi' || D.mode === 'oyna' || D.mode === 'merak' || D.mode === 'sevin' || D.mode === 'yay' || D.mode === 'happy'; }
function tkPirilAl(o) {
  if (D.mode === 'takim') { D.tkO = o; return true; }
  if (!tkPirilUygun()) return false;
  D.tkO = o; drMode('takim'); D.tkVur = 0;
  return true;
}
function tkPirilBirak(o) { if (D.mode === 'takim' && D.tkO === o) drMode('follow'); if (D.tkO === o) D.tkO = null; }
function tkPirilYer(o) { return { x: o.x - 40, y: o.y - 150 }; }
function tkBirak(o) {   // etkinlik kapanır (Feza uzaklaştı ya da bitti): hiçbir şey kilitli kalmaz
  tkPirilBirak(o);
  if (tkAkt === o) tkAkt = null;
  if (typeof skAktif !== 'undefined' && skAktif === o) skAktif = null;
  if (tkPtr.o === o) { tkPtr.id = -1; tkPtr.o = null; }
}
function tkSifirla(o) { const k = o.tk; k.n = 0; k.e.length = 0; k.drag = null; k.sil.length = 0; k.dmN = 0; k.dmA = 0; k.bosT = 0; for (let i = 0; i < k.lit.length; i++) k.lit[i] = 0; }

function tkGuncelle(o, dt) {
  const k = o.tk, oyun = DURUM === 'oyun' && P.fade <= 0;
  const dx = Math.abs(P.x - o.x), yakin = dx < 700 && Math.abs(P.y - o.y) < 360;
  k.ap = clamp(k.ap + (yakin ? dt * 0.9 : -dt * 0.6), 0, 1);
  k.ph += dt; k.t += dt; if (k.bitti) k.bitT = (k.bitT || 0) + dt;
  const gokH = (k.durum !== 'bekle' || (k.bitti && yakin)) && yakin ? 1 : 0;
  k.gok = clamp(k.gok + (gokH ? dt * 1.2 : -dt * 0.9), 0, 1);
  for (let i = 0; i < k.pa.length; i++) k.pa[i] = clamp(k.pa[i] + (k.durum !== 'bekle' || k.bitti ? (k.t > i * 0.18 || k.durum !== 'belir' ? dt * 1.4 : 0) : -dt * 1.5), 0, 1);
  if (k.bitti) for (let i = 0; i < k.pa.length; i++) k.pa[i] = yakin ? Math.min(1, k.pa[i] + dt * 0.8) : Math.max(0, k.pa[i] - dt * 0.6);
  for (let i = 0; i < k.lit.length; i++) { const h = (k.bitti || k.durum === 'dogru') ? 1 : (i < tkLitSay(k) ? 1 : 0); k.lit[i] = clamp(k.lit[i] + (h ? dt * 3 : -dt * 1.2), 0, 1); }
  for (let i = k.e.length - 1; i >= 0; i--) if (k.e[i] < 1) k.e[i] = Math.min(1, k.e[i] + dt * 4.5);
  for (let i = k.sil.length - 1; i >= 0; i--) { k.sil[i].a -= dt * 1.6; if (k.sil[i].a <= 0) k.sil.splice(i, 1); }
  for (let i = k.pk.length - 1; i >= 0; i--) { const p = k.pk[i]; p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 40 * dt; if (p.l <= 0) k.pk.splice(i, 1); }
  // gökyüzü ek parlaklığı (görsel; SAYAC'a dokunmaz)
  if (o === TK_ILK_OBJ()) { let say = 0; for (const n of NESNELER) if (n.tip === 'takim' && n.tk && n.tk.bitti) say++; tkGok = lerp(tkGok, Math.min(0.5, say * 0.14), 1 - Math.exp(-dt * 0.8)); }
  tkTakipYasak(o, dt);
  if (!oyun) return;
  // Feza kutlama sırasında yürüyüp ayrılırsa kutlama hemen biter
  k.yurT = k.durum === 'dogru' && Math.abs(P.vx) > 100 ? k.yurT + dt : 0;
  if (k.durum === 'dogru' && k.yurT > 0.3) { k.bitti = true; tkDur(o, 'bitti'); tkBirak(o); return; }
  if (k.durum !== 'bekle' && k.durum !== 'bitti' && dx > 760) {   // Feza uzaklaştı: kapanır (kendiliğinden yeniden başlar), tur sıfırlanır
    tkDur(o, 'bekle'); tkSifirla(o); tkBirak(o); return;
  }
  if (k.durum === 'bitti') { if (tkAkt === o) tkBirak(o); return; }
  if (k.durum === 'bekle') {
    const durgun = Math.abs(P.vx) < 150 || dx < 120;
    if (k.ap > 0.8 && dx < 280 && P.ground && durgun && (!tkAkt || tkAkt === o) && !k.bitti) {
      tkAkt = o; if (typeof skAktif !== 'undefined') skAktif = o;
      tkSifirla(o); tkDur(o, 'belir'); k.t = -0.2;
      tkPirilAl(o); tkSfx('takimBelir');
      if (!tkSozVar.bas) {   // hikâye: ilk seferde kısa sesli giriş; gösteri söz bitince başlar
        tkSozVar.bas = true; tkSoz('p_takim1'); tkSoz('p_takim2');
        k.ozel = Math.max(0, tkSure('p_takim1') + tkSure('p_takim2') - 1.5 - 1.3);   // ışık izi ikinci cümle bitmeden ~1,5 sn önce uçuşa geçer (toplam bekleme ≈ 4,5 sn)
      } else k.ozel = 0;
    }
    return;
  }
  if (tkAkt !== o) { tkAkt = o; if (typeof skAktif !== 'undefined') skAktif = o; }
  if (D.mode !== 'takim') tkPirilAl(o);
  // kamera: Feza + gökyüzü birlikte görünsün
  if ((k.dkT -= dt) <= 0 && typeof omDikkat === 'function') {
    k.dkT = 0.4; omDikkat('takim', 1.0, () => { omDkEkle(o.x - 120, Math.min(P.y, o.y) - 400, o.x + 120, o.y + 8); }, 0.8, 0.72);
  }
  if (k.durum === 'belir') {
    if (k.t > 1.3 + (k.ozel || 0)) { tkDur(o, 'goster'); k.dmN = 0; }
  } else if (k.durum === 'goster') {
    tkGoster(o, dt);
  } else if (k.durum === 'sira') {
    k.dmA = Math.max(0, k.dmA - dt * 0.8);
    if (!k.drag) k.bosT += dt; else k.bosT = 0;
    // geç yardım: ~4 sn dokunmazsa el sıradaki noktaya dokunmayı gösterir (dokuna dokuna bağlamak da olur, sürüklemek de)
    if (!k.drag && k.bosT > 4 && k.n < k.sek.seq.length && typeof ARAYUZ !== 'undefined' && ARAYUZ && typeof ARAYUZ.elGoster === 'function') {
      const q = tkNoktalar(k)[k.sek.seq[k.n]]; ARAYUZ.elGoster(q.x, q.y);
    }
    if (k.bosT > 22 && k.n === 0) { tkDur(o, 'goster'); k.dmN = 0; k.bosT = 0; }   // sabırla yeniden göster
  } else if (k.durum === 'dogru') {
    tkDogru(o, dt);
  }
}
function TK_ILK_OBJ() { return TK_ILK_OBJ.o || (TK_ILK_OBJ.o = NESNELER.find(n => n.tip === 'takim') || null); }
function tkLitSay(k) { return k.durum === 'goster' ? k.dmN : k.n; }   // yanmış dokunuş sayısı (dokunuş i → seq[i] noktası yanar)
function tkSeqLit(k, i) { const L = tkLitSay(k); for (let q = 0; q < L; q++) if (k.sek.seq[q] === i) return true; return false; }

// ── Pırıl'ın gösterisi: ışık izi şekli çizer ──
const TK_GD = { ucus: 0.9, adim: 1.0, dur: 0.28 };
function tkGoster(o, dt) {
  const k = o.tk, sq = k.sek.seq, m = sq.length - 1;   // m kenar
  if (k.t < 0) return;
  const tt = k.t - TK_GD.ucus;
  k.dmA = 1;
  if (tt >= 0) {
    const yan = Math.min(sq.length, Math.floor(tt / TK_GD.adim) + 1);
    while (k.dmN < yan) { const i = k.dmN++; tkNota(i); tkKivilcim(k, tkNoktalar(k)[sq[i]], 7); D.tkVur = 0.28; }
  }
  if (tt > m * TK_GD.adim + 0.5) { tkDur(o, 'sira'); k.n = 0; k.bosT = 0; k.dmN = sq.length; k.dmA = 1; k.e.length = 0; }
}
function tkNota(i) { tkSfx('takimNota', i); }
function tkKivilcim(k, p, n) {
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = 30 + Math.random() * 70; k.pk.push({ x: p.x, y: p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, l: 0.7 + Math.random() * 0.5, m: 1.2, c: i % 3 ? '#fff2b8' : TK_AQUA, r: 3 + Math.random() * 3 }); }
}

// ── Feza'nın sürüklemesi ──
function tkBasla(o, x, y, id) {
  const k = o.tk;
  if (k.durum !== 'sira' && k.durum !== 'goster' || (k.durum === 'goster' && k.t < 0)) return false;
  const nk = tkNoktalar(k), sq = k.sek.seq, R = tkR();
  const sonrakiI = k.n < sq.length ? sq[k.n] : -1;
  const dN = sonrakiI >= 0 ? Math.hypot(x - nk[sonrakiI].x, y - nk[sonrakiI].y) : 1e9;
  // en yakın BAĞLI nokta (son bağlı dahil): çizgi oradan devam eder (ilk noktadan yeniden başlamak da olur)
  let jB = -1, dB = 1e9;
  for (let j = 0; j < k.n; j++) { const q = nk[sq[j]], d = Math.hypot(x - q.x, y - q.y); if (d <= dB) { dB = d; jB = j; } }
  if (Math.min(dN, dB) > R * 1.15) return false;   // noktadan uzak: yumuşakça yok sayılır (Feza yürür)
  if (k.durum === 'goster') { k.dmN = 0; k.e.length = 0; tkDur(o, 'sira'); k.n = 0; k.dmA = 0.5; jB = -1; dB = 1e9; }
  k.drag = { id, x, y, px: x, py: y }; k.bosT = 0;
  if (dN <= dB) tkBagla(o);
  else if (jB < k.n - 1) {   // eski bir noktadan devam: sonrasındaki çizgiler yumuşakça silinir
    for (let q = jB; q < k.n - 1; q++) { const A = nk[sq[q]], B = nk[sq[q + 1]]; k.sil.push({ x0: A.x, y0: A.y, x1: B.x, y1: B.y, a: 1 }); }
    k.n = jB + 1; k.e.length = Math.max(0, jB);
    tkKivilcim(k, nk[sq[jB]], 5);
  }
  return true;
}
function tkSegMes(ax, ay, bx, by, px, py) {   // p noktasının a-b doğru parçasına uzaklığı
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, u = l > 0 ? clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0;
  return Math.hypot(px - (ax + dx * u), py - (ay + dy * u));
}
function tkSur(o, x, y) {
  const k = o.tk; if (!k.drag) return;
  const d = k.drag, px = d.px, py = d.py; d.x = x; d.y = y; d.px = x; d.py = y;
  const nk = tkNoktalar(k), sq = k.sek.seq, R = tkR() * 1.2;   // yakalama cömert (hızlı geçişte parmağın yolu da sayılır)
  let guv = 0;
  while (k.drag && k.n < sq.length && guv++ < 4) {
    const q = nk[sq[k.n]];
    if (tkSegMes(px, py, x, y, q.x, q.y) <= R) tkBagla(o); else break;
  }
}
function tkBagla(o) {   // sıradaki noktayı bağla
  const k = o.tk, sq = k.sek.seq, nk = tkNoktalar(k), i = k.n;
  k.n++;
  if (i > 0) k.e[i - 1] = 0;
  tkNota(i); tkKivilcim(k, nk[sq[i]], 8); D.tkVur = 0.2;
  if (k.n >= sq.length) { k.drag = null; tkDur(o, 'dogru'); k.kut = 0; }
}
function tkParmakBirak(o) {
  const k = o.tk; if (!k.drag) return;
  const nk = tkNoktalar(k), sq = k.sek.seq, d = k.drag; k.drag = null;
  if (k.n === 0 || k.n >= sq.length) return;
  const a = nk[sq[k.n - 1]];
  k.sil.push({ x0: a.x, y0: a.y, x1: d.x, y1: d.y, a: 1 });   // çizgi yumuşakça silinir
  for (let i = 0; i < nk.length; i++) {   // başka bir noktada bırakıldıysa yumuşak "olmadı" sesi (ceza yok)
    if (i === sq[k.n - 1] || i === sq[k.n]) continue;
    if (Math.hypot(d.x - nk[i].x, d.y - nk[i].y) < tkR() * 0.8) { tkSfx('takimYanlis'); break; }
  }
}

function tkDogru(o, dt) {
  const k = o.tk, nk = tkNoktalar(k);
  if (!k.kut) {
    k.kut = 1;
    tkSfx('takimBitti');
    for (const p of nk) tkKivilcim(k, p, 10);
    if (!tkSozVar.bit) { tkSozVar.bit = true; tkSoz('p_takim3'); }
    D.tkVur = 0.3; D.tkKut = true;
    // ödül: yakındaki yıldız balıkları sıçrar (yalnız görsel)
    let s = 0; for (const n of NESNELER) if (n.tip === 'yildizBalik' && Math.abs(n.x - o.x) < 900 && n.ziplama < 0) { n.bekle = 0.4 + 0.45 * s++; if (s > 5) break; }
  }
  if (Math.random() < dt * 14) { const p = nk[(Math.random() * nk.length) | 0]; tkKivilcim(k, p, 2); }
  if (k.t > 4.0) { k.bitti = true; D.tkKut = false; tkDur(o, 'bitti'); D.expr = 'happy'; D.exprT = 1; tkBirak(o); }
}

// Iskalanan dokunuş şeklin üstünde mi (noktalara ~1,7R, çizgilere ~0,8R)? Feza aynadan uzaklaşmaya başladıysa hiç yutulmaz.
function tkIskaYakin(o, x, y) {
  const k = o && o.tk; if (!k || (k.durum !== 'sira' && k.durum !== 'goster')) return false;
  if (Math.abs(P.x - o.x) > 330) return false;
  const nk = tkNoktalar(k), sq = k.sek.seq, R = tkR();
  for (const p of nk) if (Math.hypot(x - p.x, y - p.y) < R * 1.7) return true;
  for (let j = 0; j < sq.length - 1; j++) { const A = nk[sq[j]], B = nk[sq[j + 1]]; if (tkSegMes(A.x, A.y, B.x, B.y, x, y) < R * 0.8) return true; }
  return false;
}
// ── girdi (capture): noktaya dokunuş + sürükleme yürüme girdisine ulaşmaz ──
addEventListener('pointerdown', e => {
  if (!tkAkt || DURUM !== 'oyun' || e.pointerType === 'mouse' && e.button !== 0) return;
  if (typeof dugmede === 'function' && dugmede(e.clientX, e.clientY)) return;   // zıplama düğmesi her zaman önce
  if (tkPtr.id !== -1) return;
  let ok = false;
  try { ok = tkBasla(tkAkt, e.clientX, e.clientY, e.pointerId); } catch (er) { console.warn('[takim]', er); }
  if (!ok) {   // noktaların hemen yakınına ıskalanan dokunuş yumuşakça yok sayılır (yanlışlıkla yürümesin); başka her yere basış yürütür
    // (eskiden göğün bütün üst yarısı yutuluyordu: oraya basıp yürümek isteyen çocuk kıpırdayamıyordu — bot ölçümü, LEVEL12)
    if (tkIskaYakin(tkAkt, e.clientX, e.clientY)) { e.preventDefault(); e.stopPropagation(); }
    return;
  }
  e.preventDefault(); e.stopPropagation();
  tkPtr.id = e.pointerId; tkPtr.o = tkAkt;
  try { e.target.setPointerCapture(e.pointerId); } catch (_) { /* yoksay */ }
}, true);
addEventListener('pointermove', e => {
  if (e.pointerId !== tkPtr.id || !tkPtr.o) return;
  e.stopPropagation();
  try { tkSur(tkPtr.o, e.clientX, e.clientY); } catch (er) { console.warn('[takim]', er); }
}, true);
function tkBitir(e) {
  if (e.pointerId !== tkPtr.id) return;
  const o = tkPtr.o; tkPtr.id = -1; tkPtr.o = null;
  if (o && o.tk) tkParmakBirak(o);
  e.stopPropagation();
}
addEventListener('pointerup', tkBitir, true); addEventListener('pointercancel', tkBitir, true);
addEventListener('blur', () => { if (tkPtr.o && tkPtr.o.tk) tkParmakBirak(tkPtr.o); tkPtr.id = -1; tkPtr.o = null; });

// ── Pofuduk takipçiler etkinlik boyunca uzak dursun (pofuduk.js skYasak()'ı çağırır; burada sarmalanır) ──
function tkYasak() {
  const o = tkAkt; if (!o || !o.tk || o.tk.durum === 'bekle' || o.tk.durum === 'bitti') return null;
  if (Math.abs(P.x - o.x) > 950) return null;
  const sol = o.x - 260, sag = o.x + 260;
  return P.x < o.x ? { x0: Math.min(sol, P.x + 20), x1: sag, sol: true } : { x0: sol, x1: Math.max(sag, P.x - 20), sol: false };
}
if (typeof skYasak === 'function' && !skYasak.tkSarili) {
  const tkEski = skYasak;
  skYasak = function () { return tkEski() || tkYasak(); };   // eslint-disable-line no-func-assign
  skYasak.tkSarili = true;
}
function tkTakipYasak(o, dt) {
  const z = tkAkt === o ? tkYasak() : null; if (!z) return;
  const hedef = z.sol ? z.x0 - 14 : z.x1 + 14;
  for (const n of NESNELER) {
    if (n.tip !== 'pofuduk' || !n.uyandi || !n.pf || n.pf.durum !== 'takip' || n.pf.sihir || n.pf.gerin) continue;
    if (n.x > z.x0 && n.x < z.x1 && Math.abs(n.y - o.y) < 90) {
      const nx2 = n.x + Math.sign(hedef - n.x) * Math.min(Math.abs(hedef - n.x), 340 * dt);
      if (typeof pfYerBul === 'function' && pfYerBul(nx2, n.pf.yt, 14) !== null) n.x = nx2;
    }
  }
}

// ═══════════ çizim ═══════════
function tkAynaCiz(o, tm) {   // yerde "ay aynası": su ışığı havuzu + hilal
  const k = o.tk;
  // gökyüzü parlaması: Feza'nın ARKASINDA (ekran uzayı, Feza'yı ışıkla yıkamasın)
  if ((tkGok > 0.01 || (k.durum === 'dogru' && k.t < 2)) && Math.abs(P.x - o.x) < 900) {
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.globalCompositeOperation = 'lighter';
    const iw = innerWidth, ih = innerHeight;
    if (tkGok > 0.01) { dglow('#8a9cff', iw * 0.5, ih * 0.08, iw * 0.8, tkGok * 0.45); dglow('#ffe9a8', iw * 0.5, ih * 0.14, iw * 0.36, tkGok * 0.2); }
    if (k.durum === 'dogru' && k.t < 2) dglow('#ffe9a8', iw * 0.5, tkYer.cy, iw * 0.5, 0.2 * Math.sin(Math.min(1, k.t / 2) * Math.PI));
    g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); g.globalCompositeOperation = 'source-over';
  }
  const ap = smooth(k.ap); if (ap < 0.02) return;
  const x = o.x, y = o.y, bit = k.bitti ? 1 : 0, aktif = k.durum !== 'bekle' && !k.bitti ? 1 : 0;
  const c0 = bit ? '#ffe08a' : TK_AQUA, c1 = bit ? '#fff2b8' : '#d6fbff';
  const nef = 0.5 + 0.5 * Math.sin(tm * 2.2 + k.ph);
  g.globalCompositeOperation = 'lighter';
  g.save(); g.translate(x, y - 1); g.scale(1, 0.2);
  dglow(c0, 0, 0, 150 * ap, (0.16 + 0.12 * nef + 0.1 * aktif + 0.06 * bit) * ap);
  dglow(c1, 0, 0, 74 * ap, (0.22 + 0.12 * nef) * ap);
  g.restore();
  // yayılan halkalar
  for (let q = 0; q < 3; q++) {
    const u = ((tm * 0.35 + q / 3 + k.ph * 0.1) % 1);
    g.strokeStyle = mixc(c0, c1, 0.4, (1 - u) * 0.4 * ap); g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, y - 1, 16 + u * 70, 3 + u * 14, 0, 0, 6.283); g.stroke();
  }
  // hilal (ay yansıması): suyun üstünde hafifçe sallanır
  const hy = y - 34 - Math.sin(tm * 1.3 + k.ph) * 4 - (bit ? 6 : 0), hr = 15 * (0.5 + 0.5 * ap);
  dglow(c0, x, hy, hr * 3.4, (0.35 + 0.2 * nef) * ap);
  g.globalCompositeOperation = 'source-over';
  g.save(); g.beginPath(); g.arc(x, hy, hr, 0, 6.283); g.clip();   // hilal: daire - kaydırılmış daire (silme yok, arka plan delinmez)
  g.fillStyle = mixc(c1, '#ffffff', 0.5, 0.95 * ap);
  g.beginPath(); g.rect(x - hr * 2, hy - hr * 2, hr * 4, hr * 4); g.arc(x + hr * 0.5, hy - hr * 0.2, hr * 0.85, 0, 6.283); g.fill('evenodd');
  g.restore();
  g.globalCompositeOperation = 'source-over';
  g.globalCompositeOperation = 'lighter';
  for (let q = 0; q < 5; q++) { const u = (tm * 0.3 + q * 0.2 + k.ph) % 1, a = q * 1.7 + k.ph; dglow('#ffffff', x + Math.cos(a) * 26 * (0.4 + u), y - 4 - u * 46, 5, ap * (1 - u) * 0.55); }
  g.globalCompositeOperation = 'source-over';
}

function tkCizCizgi(ax, ay, bx, by, u, col, w, al) {   // ışıklı çizgi: a'dan b'ye u oranında
  if (u <= 0.001 || al <= 0.01) return;
  const ex = ax + (bx - ax) * u, ey = ay + (by - ay) * u;
  g.lineCap = 'round';
  g.beginPath(); g.moveTo(ax, ay); g.lineTo(ex, ey);
  g.strokeStyle = mixc(col, col, 0, al * 0.16); g.lineWidth = w * 5; g.stroke();
  g.strokeStyle = mixc(col, '#ffffff', 0.3, al * 0.45); g.lineWidth = w * 2.2; g.stroke();
  g.strokeStyle = mixc('#ffffff', '#ffffff', 0, al * 0.95); g.lineWidth = w * 0.9; g.stroke();
}

function tkGokCiz(o, tm) {
  const k = o.tk; if (k.gok < 0.01 && tkGok < 0.01) return;
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const iw = innerWidth, ih = innerHeight, a = smooth(k.gok) * (k.bitti ? lerp(1, 0.3, smooth(clamp((k.bitT || 0) / 3, 0, 1))) : 1);   // bitince altın izler yavaşça söner, ince soluk bir iz kalır
  if (a < 0.01) { g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); return; }
  const nk = tkNoktalar(k), sq = k.sek.seq, R = tkR(), nef = 0.5 + 0.5 * Math.sin(tm * 3.6);
  const kut = k.durum === 'dogru' || k.bitti, sira = k.durum === 'sira';
  const sonraki = k.n < sq.length ? sq[k.n] : -1, onceki = k.n > 0 ? sq[k.n - 1] : -1;
  // 1) şeklin çizgileri
  g.globalCompositeOperation = 'lighter';
  if (k.durum === 'goster' || (sira && k.dmA > 0.01)) {   // Pırıl'ın ışık izi (aqua-beyaz)
    const tt = k.t - TK_GD.ucus, al = (k.durum === 'goster' ? 1 : k.dmA) * a;
    for (let j = 0; j < sq.length - 1; j++) {
      const A = nk[sq[j]], B = nk[sq[j + 1]];
      const u = k.durum === 'goster' ? clamp((tt - j * TK_GD.adim - TK_GD.dur) / (TK_GD.adim - TK_GD.dur), 0, 1) : 1;
      tkCizCizgi(A.x, A.y, B.x, B.y, smooth(u), TK_AQUA, 3, al * 0.85);
    }
  }
  if (sira || kut) {   // Feza'nın bağladığı çizgiler (altın)
    for (let j = 0; j < sq.length - 1; j++) {
      const bagli = kut || j < k.n - 1; if (!bagli) continue;
      const A = nk[sq[j]], B = nk[sq[j + 1]], u = kut ? 1 : (k.e[j] === undefined ? 1 : smooth(k.e[j]));
      const pulse = k.durum === 'dogru' ? 0.85 + 0.15 * Math.sin(tm * 7 - j) : 1;
      tkCizCizgi(A.x, A.y, B.x, B.y, u, '#ffd36a', 3.4, a * pulse);
    }
  }
  // sürüklenen çizgi + silinenler
  if (k.drag && onceki >= 0) { const A = nk[onceki]; tkCizCizgi(A.x, A.y, k.drag.x, k.drag.y, 1, '#ffe9a8', 3.2, a * 0.9); dglow('#fff2b8', k.drag.x, k.drag.y, 34, 0.5 * a); }
  for (const s of k.sil) tkCizCizgi(s.x0, s.y0, s.x1, s.y1, 1, '#ffe9a8', 3, a * s.a * 0.8);
  // öğretici ışık: boşta bekleyince bir ışık noktası önceki noktadan sıradakine süzülür (el yok, yazı yok)
  if (sira && !k.drag && k.bosT > 2.5 && sonraki >= 0) {
    const B = nk[sonraki], A = onceki >= 0 ? nk[onceki] : { x: B.x - 0 * R, y: B.y + R * 2.2 };
    const g0 = smooth(clamp((k.bosT - 2.5) / 1, 0, 1)), u = (tm * 0.55) % 1, uu = smooth(Math.min(1, u * 1.25));
    if (onceki >= 0) {
      tkCizCizgi(A.x, A.y, B.x, B.y, 1, TK_AQUA, 1.6, a * g0 * 0.22 * (0.7 + 0.3 * nef));
      for (let q = 0; q < 5; q++) { const w = clamp(uu - q * 0.05, 0, 1); dglow(q ? TK_AQUA : '#ffffff', lerp(A.x, B.x, w), lerp(A.y, B.y, w), 18 - q * 2.5, a * g0 * (1 - q / 5) * (u < 0.85 ? 0.85 : (1 - u) * 5)); }
    }
  }
  // 2) noktalar
  for (let i = 0; i < nk.length; i++) {
    const p = nk[i], pa = smooth(k.pa[i]) * a; if (pa < 0.01) continue;
    const lit = smooth(k.lit[i]), siradaki = sira && i === sonraki && !kut, dem = k.durum === 'goster';
    const nbz = siradaki ? nef : 0, r = 7 + 3 * lit;
    g.globalCompositeOperation = 'lighter';
    dglow(lit > 0.05 ? '#ffd36a' : '#9fb4ff', p.x, p.y, (30 + 34 * lit + 22 * nbz) * (0.6 + 0.4 * pa), (0.22 + 0.5 * lit + 0.3 * nbz) * pa);
    if (siradaki || (sira && !k.drag && i === onceki && k.bosT > 1)) {   // nabız halkası: sıradaki nokta (ve boştayken başlama noktası)
      const sad = siradaki ? 1 : 0.5;
      for (let q = 0; q < 2; q++) { const u = (tm * 0.9 + q * 0.5) % 1; g.strokeStyle = mixc(siradaki ? TK_AQUA : '#ffd36a', '#ffffff', 0.4, (1 - u) * 0.8 * pa * sad); g.lineWidth = 3.2; g.beginPath(); g.arc(p.x, p.y, 14 + u * R * 0.8, 0, 6.283); g.stroke(); }
      dglow(siradaki ? TK_AQUA : '#ffd36a', p.x, p.y, R * (0.85 + 0.25 * nbz), 0.35 * pa * sad);
    }
    g.globalCompositeOperation = 'source-over';
    tkYildizCiz(p.x, p.y, r * (siradaki ? 1 + 0.18 * nef : 1), lit, tm + i, pa, dem && tkSeqLit(k, i));
  }
  // 3) kıvılcımlar
  g.globalCompositeOperation = 'lighter';
  for (const p of k.pk) dglow(p.c, p.x, p.y, p.r * 4 * Math.min(1, p.l * 2), Math.min(1, p.l * 1.6) * 0.8 * a);
  // Pırıl'ın ışık izi başı (demo sırasında Pırıl'dan noktaya uçan ve çizgiyi sürükleyen kuyruklu yıldız)
  if (k.durum === 'goster' && k.t >= 0) {
    const tt = k.t - TK_GD.ucus; let hx, hy;
    if (tt < 0) { const pp = D.mode === 'takim' ? tkPx(D.x, D.y) : { x: o.x, y: o.y }, B = nk[sq[0]], u = smooth(clamp(k.t / TK_GD.ucus, 0, 1)); hx = lerp(pp.x, B.x, u); hy = lerp(pp.y, B.y, u) - Math.sin(u * Math.PI) * 40; }
    else { const j = Math.min(sq.length - 2, Math.floor(tt / TK_GD.adim)), u = smooth(clamp((tt - j * TK_GD.adim - TK_GD.dur) / (TK_GD.adim - TK_GD.dur), 0, 1)); const A = nk[sq[j]], B = nk[sq[j + 1]]; hx = lerp(A.x, B.x, u); hy = lerp(A.y, B.y, u); }
    dglow('#ffffff', hx, hy, 18, a * 0.95); dglow(TK_AQUA, hx, hy, 46, a * 0.55);
  }
  g.globalCompositeOperation = 'source-over';
  // 4) şeklin canlı versiyonu
  if ((k.durum === 'dogru' && k.t > 0.55) && k.t < 4.0) tkHayvanCiz(o, tm, clamp((k.t - 0.55) / 3.4, 0, 1), a);
  g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

function tkYildizCiz(x, y, r, lit, tm, a, vur) {   // nokta: sönükken beyazımsı-mavi küçük yıldız, yanınca altın
  g.save(); g.translate(x, y); g.rotate(Math.sin(tm * 0.8) * 0.12); g.globalAlpha = a;
  g.beginPath();
  for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.5 : r * 1.35; if (i) g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); else g.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); }
  g.closePath();
  g.fillStyle = lit > 0.05 ? mixc('#fffbe8', '#ffe08a', 1 - lit, 1) : 'rgba(214,224,255,0.9)'; g.fill();
  g.lineJoin = 'round'; g.lineWidth = 1.6; g.strokeStyle = lit > 0.05 ? 'rgba(242,169,58,0.9)' : 'rgba(150,170,240,0.8)'; g.stroke();
  g.restore(); g.globalAlpha = 1;
}

// ── gökte küçük canlı versiyon (altın): yıldız balığı yüzer · kuğu süzülür · kaplumbağa yüzer ──
function tkHayvanCiz(o, tm, u, a) {
  const k = o.tk, y = tkYer, ad = k.sek.ad, s = y.hw * 0.17;
  const fade = Math.min(1, u * 5) * Math.min(1, (1 - u) * 4) * a;
  const x = lerp(y.cx - y.hw * 0.5, y.cx + y.hw * 0.5, smooth(u)), yy = y.cy - y.hh * 0.05 + Math.sin(u * 9.4) * y.hh * 0.18;
  const yon = 1;
  g.save(); g.translate(x, yy); g.globalAlpha = fade;
  g.globalCompositeOperation = 'lighter'; dglow('#ffe9a8', 0, 0, s * 3.4, 0.45); g.globalCompositeOperation = 'source-over';
  g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  const gr = g.createLinearGradient(0, -1, 0, 1); gr.addColorStop(0, TK_ALTIN[0]); gr.addColorStop(0.55, TK_ALTIN[1]); gr.addColorStop(1, TK_ALTIN[2]);
  g.fillStyle = gr; g.strokeStyle = 'rgba(255,248,214,0.95)'; g.lineWidth = 0.09;
  const goz = (ex, ey, r) => { g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(ex, ey, r, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - r * 0.3, ey - r * 0.3, r * 0.35, 0, 6.283); g.fill(); g.fillStyle = gr; };
  if (ad === 'denizYildizi') {
    g.rotate(Math.sin(u * 12) * 0.25 + u * 1.2);
    g.beginPath(); for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 0.52 : 1.25 + 0.06 * Math.sin(u * 20 + i); if (i) g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); else g.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); } g.closePath(); g.fill(); g.stroke();
    g.rotate(-(Math.sin(u * 12) * 0.25 + u * 1.2)); goz(-0.2, -0.1, 0.1); goz(0.2, -0.1, 0.1);
    g.strokeStyle = '#7a4a1a'; g.lineWidth = 0.07; g.beginPath(); g.arc(0, 0.12, 0.2, 0.2, Math.PI - 0.2); g.stroke();
  } else if (ad === 'kugu') {
    g.beginPath(); g.ellipse(-0.1, 0.45, 1.05, 0.55, 0, 0, 6.283); g.fill(); g.stroke();   // gövde
    g.beginPath(); g.ellipse(-0.25, 0.4, 0.55, 0.28, -0.35, 0, 6.283); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fill(); g.fillStyle = gr;   // kanat
    g.lineWidth = 0.34; g.strokeStyle = TK_ALTIN[1]; g.beginPath(); g.moveTo(0.7, 0.3); g.bezierCurveTo(1.15, -0.2, 0.55, -0.7, 0.95, -1.1); g.stroke();   // boyun
    g.lineWidth = 0.14; g.strokeStyle = TK_ALTIN[0]; g.beginPath(); g.moveTo(0.7, 0.3); g.bezierCurveTo(1.15, -0.2, 0.55, -0.7, 0.95, -1.1); g.stroke();
    g.beginPath(); g.arc(1.0, -1.15, 0.2, 0, 6.283); g.fill();
    g.fillStyle = '#ffb35a'; g.beginPath(); g.moveTo(1.17, -1.18); g.lineTo(1.5, -1.1); g.lineTo(1.17, -1.05); g.closePath(); g.fill(); g.fillStyle = gr;
    goz(1.04, -1.2, 0.045);
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(190,240,255,0.5)'; g.lineWidth = 0.05; for (let q = 0; q < 2; q++) { g.beginPath(); g.ellipse(-0.1 - q * 0.3, 1.05, 1.2 + q * 0.3, 0.14, 0, 0, 6.283); g.stroke(); } g.globalCompositeOperation = 'source-over';
  } else {
    const yz = Math.sin(u * 16);   // yüzme: ayaklar
    g.fillStyle = TK_ALTIN[1];
    for (const [fx, fy, an] of [[0.55, 0.45, 0.6 + 0.4 * yz], [-0.55, 0.45, -0.6 - 0.4 * yz], [0.5, -0.4, -0.9 - 0.3 * yz], [-0.5, -0.4, 0.9 + 0.3 * yz]]) { g.save(); g.translate(fx, fy); g.rotate(an); g.beginPath(); g.ellipse(0, 0.25 * Math.sign(fy), 0.2, 0.42, 0, 0, 6.283); g.fill(); g.stroke(); g.restore(); }
    g.beginPath(); g.moveTo(-0.95, 0.1); g.lineTo(-1.35, 0.25); g.lineTo(-0.95, 0.25); g.closePath(); g.fill();
    g.beginPath(); g.arc(1.2, 0.0, 0.36, 0, 6.283); g.fill(); g.stroke(); goz(1.3, -0.08, 0.07);
    g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 1.0, 0.72, 0, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(190,120,30,0.75)'; g.lineWidth = 0.07;
    g.beginPath(); g.moveTo(-0.55, -0.1); g.lineTo(-0.25, -0.5); g.lineTo(0.25, -0.5); g.lineTo(0.55, -0.1); g.lineTo(0.25, 0.4); g.lineTo(-0.25, 0.4); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(-0.25, -0.5); g.lineTo(-0.25, 0.4); g.moveTo(0.25, -0.5); g.lineTo(0.25, 0.4); g.stroke();
  }
  g.restore(); g.globalAlpha = 1;
}

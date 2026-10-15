/* sarki.js – "Pofuduğa şarkı söyle": isteğe bağlı küçük müzik oyunu (hiçbir şey ona bağlı değil, finale sayılmaz).
   Bölümde iki yerde (bolum.js: 'sarki' nesnesi) üç ışıklı şarkı çiçeği belirir. Feza yaklaşınca Pırıl 2 notalık, sonra 3 notalık
   bir ezgiyi çiçekleri sırayla yakarak çalar; Feza aynı sırayla çiçeklere dokunur (dokunulan çiçek parlar + notasını çalar).
   Doğruysa yakındaki uyuyan Pofuduk uyanıp dans eder, çevrede ışık çiçekleri açar. Yanlışta ceza yok: çiçekler yumuşakça söner,
   Pırıl aynı ezgiyi yeniden gösterir (sonsuz sabır). Feza hiç yapmazsa hiçbir şey kilitlenmez.
   Yazı yok, yeni ses kaydı yok: yalnız ışık + muzik.js'teki çelesta sentezi (AU.sfx('sarki' | 'sarkiBitti' | 'sarkiOlmadi')).
   Girdi: pencere "capture" aşamasında çiçeğe dokunuş yakalanır (oyun.js'in yürüme/zıplama girdisine hiç ulaşmaz, Feza kıpırdamaz).
   Önek: sk*. Dokunma eli yalnız GEÇ yardım olarak (≈5,5 sn boşta ya da aynı turda 2 yanlış): sıradaki çiçeğe dokunur. "Sıra sende" görsel dille anlatılır (üç çiçek nefes alıp zıplar, Feza'dan çiçeklere ışık akar). piril.js 'sarki' modu (D.srk). */
'use strict';
const SK_RENK = [['#7fe9ff', '#d6fbff'], ['#c9a2ff', '#efe0ff'], ['#ff9fd3', '#ffe0f2']];   // aqua · leylak · pembe (açık / çekirdek)
const SK_DX = [-66, 0, 66];                                                                   // çiçeklerin orta çiçeğe uzaklığı
const SK_BOY = 60;                                                                            // taç merkezinin zeminden yüksekliği
let skIlkSay = 0;     // Feza'nın şimdiye dek doğru bastığı not sayısı 
let skAktif = null;
const skSozVar = { bas: false, bit: false };   // hikâye cümleleri oturumda bir kez
function skSoz(k) { if (typeof SES !== 'undefined' && SES && SES.soyle) { try { SES.soyle(k, { oncelik: 2 }); } catch (e) {} } }
function skSure(k) { return (window.VOICE_DUR && VOICE_DUR[k]) || (typeof SES !== 'undefined' && SES.sure ? SES.sure(k) : 3) || 3; }   // şu an etkinlikte olan 'sarki' nesnesi (Pırıl'ı o yönetir)

const skPx = (wx, wy) => ({ x: (wx - cam.x) * S / DPR, y: (wy - cam.y) * S / DPR });   // dünya → CSS pikseli (oyun.js readInput ile aynı)
const skCx = (o, i) => o.x + SK_DX[i];
const skCy = o => o.y - SK_BOY;
function skSfx(ad, v) { if (typeof AU !== 'undefined' && AU && typeof AU.sfx === 'function') { try { AU.sfx(ad, v); } catch (e) {} } }
function skNota(o, i, guc) {   // i. çiçeğin notası (ekran konumuna göre sağ/sol)
  const p = skPx(skCx(o, i), skCy(o));
  skSfx('sarki', { n: o.notalar[i], g: guc, x: clamp(p.x / Math.max(innerWidth, 1) * 1.4 - 0.7, -0.7, 0.7) });
}
function skParla(o, i, v) { const k = o.sk; k.parla[i] = Math.max(k.parla[i], v); k.vur[i] = Math.max(k.vur[i] || 0, 1.15); skPofNota(o, 0); }
// uyuyan Pofuduk şarkıyla senkron hafifçe titrer, karnındaki ışık her doğru notada biraz daha parlar (pofuduk.js pfKarinIsik n.sarkiIsik / n.sarkiVur)
function skPofNota(o, dogru) {
  const n = o.sk.pof; if (!n || !n.pf || n.uyandi) return;
  n.sarkiVur = 1; if (typeof pfZipla === 'function') pfZipla(n.pf, dogru ? 2.2 : 1.2);
  if (dogru) { let top = 0; for (const m of o.melodiler) top += m.length; n.sarkiHedef = Math.min(0.85, 0.12 + 0.73 * (o.sk.dogruSay || 0) / top); }
}
function skKivilcim(o, i, n) {   // çiçeğin çevresinde pastel ışık zerreleri
  const c = SK_RENK[i];
  burst(skCx(o, i), skCy(o), n, [c[0], c[1], '#ffffff'], 90, 1.1, 6);
}

TUR.kaydet('sarki', {
  kur(o) {
    o.sk = { ap: 0, durum: 'bekle', t: 0, tur: 0, mel: null, adim: 0, gi: 0, parla: [0, 0, 0], vur: [0, 0, 0], sonuc: 0, bosT: 0, yanlis: 0,
      kom: [], bitti: false, pof: null, cicekler: [], ilk: true, bir: 0, ph: Math.random() * 6.283, dans: 0, hopT: 0, say: 0 };
    // ödül çiçekleri: yer seçilir, açılması bitince başlar
    for (let i = 0; i < 15; i++) {
      const sag = i % 2 ? 1 : -1, dx = sag * (100 + ((i * 53) % 220)), c = Math.floor((o.x + dx) / T);
      o.sk.cicekler.push({ x: o.x + dx, y: yuzey(c), a: 0, r: 5 + (i % 3) * 1.6, col: SK_RENK[i % 3], ph: i * 1.7 });
    }
  },
  guncelle(o, dt) { skGuncelle(o, dt); },
  ciz(o, tm) { skCizArka(o, tm); },
  cizOn(o, tm) { skCizOn(o, tm); },
});

function skMelodi(o) { return o.melodiler[Math.min(o.sk.tur, o.melodiler.length - 1)]; }
function skDur(o, d) { o.sk.durum = d; o.sk.t = 0; }
function skPirilUygun() { return D.mode === 'sarki' || D.mode === 'follow' || D.mode === 'orbit' || D.mode === 'yol' || D.mode === 'ilgi' || D.mode === 'oyna' || D.mode === 'merak' || D.mode === 'sevin' || D.mode === 'yay' || D.mode === 'happy'; }
function skPirilAl(o) {   // Pırıl çiçeklerin üstüne gelip orada süzülür
  if (D.mode === 'sarki') { D.srk = o; return true; }
  if (!skPirilUygun()) return false;
  D.srk = o; drMode('sarki'); D.srkVur = 0;
  return true;
}
function skPirilBirak(o) { if (D.mode === 'sarki' && D.srk === o) drMode('follow'); if (D.srk === o) D.srk = null; if (skAktif === o) skAktif = null; }
function skPirilVur() { D.srkVur = 0.28; }

function skGuncelle(o, dt) {
  const k = o.sk, oyun = DURUM === 'oyun' && P.fade <= 0;
  const dx = Math.abs(P.x - o.x), yakin = dx < 640 && Math.abs(P.y - o.y) < 360;
  k.ap = clamp(k.ap + (yakin ? dt * 0.8 : -dt * 0.5), 0, 1);   // yaklaşınca çiçekler yerden yavaşça belirir
  for (let i = 0; i < 3; i++) { k.parla[i] = Math.max(0, k.parla[i] - dt * (k.durum === 'yanlis' ? 1.5 : 0.55)); k.vur[i] = Math.max(0, k.vur[i] - dt * 3.2); }
  k.t += dt; k.ph += dt;
  { const n = k.pof; if (n) { n.sarkiIsik = lerp(n.sarkiIsik || 0, n.sarkiHedef || 0, 1 - Math.exp(-dt * 3)); n.sarkiVur = Math.max(0, (n.sarkiVur || 0) - dt * 3); } }
  for (let i = k.kom.length - 1; i >= 0; i--) { k.kom[i].t += dt; if (k.kom[i].t > k.kom[i].s) k.kom.splice(i, 1); }
  // Feza kutlama sırasında yürüyüp ayrılırsa kutlama hemen biter (Pırıl ve Pofuduklar geride kalmasın)
  k.yurT = k.kut && Math.abs(P.vx) > 100 ? (k.yurT || 0) + dt : 0;
  if (k.kut && k.yurT > 0.3) {
    k.bitti = true; k.kut = false; k.durum = 'bitti'; k.t = 1; skPirilBirak(o);
  }
  if (k.kut) { skKutGuncelle(o, dt); for (const c of k.cicekler) c.a = Math.min(1, c.a + dt * 1.4 * (k.t > 0.3 + c.ph * 0.06 ? 1 : 0)); }
  skTakipYasak(o, dt);
  if (k.bitti) { skBittiGuncelle(o, dt); return; }
  if (!oyun) return;
  if (D.mode === 'sarki' && D.srk === o) { if (D.srkVur > 0) D.srkVur -= dt; }
  // Feza uzaklaştıysa etkinlik yarıda kalır (ilerleme korunur, tur sıfırlanmaz); hiçbir şey kilitlenmez
  if (k.durum !== 'bekle' && dx > 950) { k.durum = 'bekle'; k.t = 0; k.adim = 0; k.kom.length = 0; skPirilBirak(o); return; }
  if (k.durum === 'bekle') {
    const durgun = Math.abs(P.vx) < 120 || dx < 200;
    if (k.ap > 0.85 && dx < 460 && P.ground && durgun && (!skAktif || skAktif === o) && skPirilAl(o)) {
      skAktif = o; k.mel = skMelodi(o); k.adim = 0; k.gi = 0; k.komGi = -1; skDur(o, 'goster'); k.t = -(k.ilk ? 0.9 : 0.4); k.ilk = false;
      if (!k.pof) k.pof = skPofSec(o);   // uyandırılacak Pofuduk baştan belli: şarkıyla birlikte karnı parlar
      if (!skSozVar.bas) {   // hikâye: ilk başlangıçta kısa sesli giriş; ezgi söz bitince çalar
        skSozVar.bas = true; skSoz('p_sarki1'); skSoz('p_sarki2');
        k.t = -(skSure('p_sarki1') + skSure('p_sarki2') + 1.2);
      }
      for (let i = 0; i < 3; i++) skKivilcim(o, i, 5);
    }
    return;
  }
  if (k.pof && !k.pof.uyandi && typeof omDikkat === 'function' && (k.dkT = (k.dkT || 0) - dt) <= 0) {   // şarkı sürerken uyuyan Pofuduk de kadrajda (karnı parlayışı görünsün)
    k.dkT = 0.5; const n = k.pof; omDikkat('sarki', 1.2, () => { omDkEkle(n.x - 60, n.y - 100, n.x + 60, n.y + 8); omDkEkle(o.x - 130, o.y - 130, o.x + 130, o.y + 8); }, 0.8, 0.72);
  }
  if (D.mode !== 'sarki' && !skPirilAl(o)) { if (k.durum === 'goster') k.t -= dt; }   // Pırıl başka işteyse gösteri bekler
  if (k.durum === 'goster') {
    const mel = k.mel, T0 = 1.0, ARA = 0.9;
    // Pırıl ışığı çiçeğe gönderir (0.2 sn önce), çiçek yanar + notası çalar
    if (k.gi < mel.length) {
      const tn = T0 + k.gi * ARA;
      if (k.t >= tn - 0.22 && k.komGi !== k.gi) { k.komGi = k.gi; k.kom.push({ gi: k.gi, i: mel[k.gi], t: 0, s: 0.22, x0: D.x, y0: D.y }); skPirilVur(); }
      if (k.t >= tn) { const i = mel[k.gi]; skParla(o, i, 1); skNota(o, i, 1); skKivilcim(o, i, 7); k.gi++; }
    } else if (k.t > T0 + mel.length * ARA + 0.7) { skDur(o, 'sira'); k.adim = 0; k.bosT = 0; }
  } else if (k.durum === 'sira') {
    k.bosT += dt;
    // geç yardım (ilk anda değil): uzun süre dokunmazsa ya da aynı turda iki kez şaşırırsa el sıradaki çiçeğe dokunmayı gösterir
    if ((k.bosT > 5.5 || (k.yanlis >= 2 && k.t > 0.6)) && k.mel && k.adim < k.mel.length) skElGoster(o, k.mel[k.adim]);
    // ışık perdesi (kapi.js) şarkı bitene kadar yolu kapatır: çok uzun boşta kalınırsa Pırıl çiçekleri kendisi çalar (takılma olmasın)
    if (k.bosT > 9 && (k.tekrar || 0) >= 1 && k.mel && k.adim < k.mel.length) { k.oto = true; skBas(o, k.mel[k.adim]); k.oto = false; k.bosT = 5; return; }
    if (k.bosT > 16) { k.tekrar = (k.tekrar || 0) + 1; k.gi = 0; k.komGi = -1; k.adim = 0; k.mel = skMelodi(o); skDur(o, 'goster'); k.t = -0.2; }   // sabırla yeniden göster
  } else if (k.durum === 'yanlis') {
    if (k.t > 1.5) { k.gi = 0; k.komGi = -1; k.adim = 0; skDur(o, 'goster'); k.t = 0; }
  } else if (k.durum === 'dogru') {
    skDogruGuncelle(o, dt);
  }
}

function skElGoster(o, i) {   // arayuz.js dokunma eli (CSS px; her karede çağrılınca görünür)
  if (typeof ARAYUZ === 'undefined' || !ARAYUZ || typeof ARAYUZ.elGoster !== 'function') return;
  const p = skPx(skCx(o, i), skCy(o) + 4); ARAYUZ.elGoster(p.x, p.y);
}
// Feza'nın dokunuşu: i. çiçek
function skBas(o, i) {
  const k = o.sk;
  if (k.durum === 'sira') {
    const bek = k.mel[k.adim];
    k.bosT = 0; if (!k.oto) k.tekrar = 0;
    if (i === bek) {
      skParla(o, i, 1); skNota(o, i, 1.15); skKivilcim(o, i, 9); skIlkSay++; k.adim++; k.dogruSay = (k.dogruSay || 0) + 1; skPofNota(o, 1);
      if (typeof drFx === 'function') drFx(skCx(o, i), skCy(o) - 15, 'star');
      if (k.adim >= k.mel.length) { skDur(o, 'dogru'); k.sonuc = 0; k.say = 0; }
    } else {   // yanlış: ceza yok. Çiçek hafifçe yanıp söner, hepsi yumuşakça kısılır, Pırıl aynı ezgiyi yeniden çalar
      skParla(o, i, 0.55); skSfx('sarkiOlmadi', { n: o.notalar[i], x: 0 }); k.yanlis++;
      skDur(o, 'yanlis'); k.adim = 0;
    }
  } else if (k.durum !== 'goster' && k.durum !== 'yanlis' && k.durum !== 'dogru') {   // serbest çalma (bitince ya da Pırıl uzaktayken)
    skParla(o, i, 0.9); skNota(o, i, 1); skKivilcim(o, i, 5);
  }
}

// Doğru: tur 0 → küçük kutlama, 3 notalık tura geç; tur 1 → büyük kutlama (Pofuduk uyanır, ışık çiçekleri açar)
function skDogruGuncelle(o, dt) {
  const k = o.sk, son = k.tur >= o.melodiler.length - 1;
  if (!k.say) {
    k.say = 1;
    for (let i = 0; i < 3; i++) { skParla(o, i, 1); skKivilcim(o, i, 6); }
    if (son) { k.kut = true; skSfx('sarkiZafer', { n: o.notalar[1], x: 0 }); if (k.pof) k.pof.sarkiHedef = 1; if (!skSozVar.bit) { skSozVar.bit = true; skSoz('p_sarki3'); } } else skSfx('sarkiBitti', { n: o.notalar[1], k: 0, x: 0 });
    skPirilVur(); for (let i = 0; i < 6; i++) drFx(o.x + (i - 2.5) * 30, skCy(o) - 20, i % 2 ? 'heart' : 'star');
  }
  if (!son && k.t > 1.7) { k.tur++; k.mel = skMelodi(o); k.gi = 0; k.komGi = -1; k.adim = 0; k.yanlis = 0; skDur(o, 'goster'); k.t = -0.2; return; }
  if (son) {
    if (k.t > 0.7 && !k.pofUy) { k.pofUy = true; if (!k.pof || k.pof.uyandi) k.pof = k.pof && k.pof.uyandi ? k.pof : skPofSec(o); skPofUyandir(o); k.dans = 0; }
    if (k.t > 3.2) {   // büyük kutlama (~3 sn) bitti: çiçekler kalıcı açık, ödül çiçekleri açık
      k.bitti = true; k.kut = false; k.durum = 'bitti'; k.t = 0; skPirilBirak(o);
      D.expr = 'happy'; D.exprT = 1;
    }
  }
}
function skPofSec(o) {   // en yakın uyuyan (yol) Pofuduk, 800 birim içinde; yoksa en yakın uyanık Pofuduk (yalnız sevinç zıplaması)
  let uy = null, aw = null;
  for (const n of NESNELER) {
    if (n.tip !== 'pofuduk' || !n.pf) continue;
    const d = Math.abs(n.x - o.x);
    if (!n.uyandi && n.tur === 'yol' && d < 800 && (!uy || d < Math.abs(uy.x - o.x))) uy = n;
    else if (n.uyandi && d < 500 && (!aw || d < Math.abs(aw.x - o.x))) aw = n;
  }
  return uy || aw;
}
function skPofUyandir(o) {
  const n = o.sk.pof; if (!n) return;
  // kamera: Feza + çiçekler + dans eden Pofuduk birlikte görünsün (oyun.js dikkat çerçevesi, birkaç sn)
  if (typeof omDikkat === 'function') omDikkat('sarki', 4, () => { omDkEkle(n.x - 60, n.y - 100, n.x + 60, n.y + 8); omDkEkle(o.x - 130, o.y - 130, o.x + 130, o.y + 8); }, 0.8, 0.72);
  if (!n.uyandi && typeof pfUyandir === 'function') {
    pfUyandir(n, true);      // sessiz uyanış: kendi hapşırığı + dans; 'uyandi' olayı yok (Pırıl'ın övgü cümlesi bekler)
    SAYAC.pofuduk++;         // gerçekten uyandı: sayaç doğru kalsın (toplam değişmez)
    n.sarkiDans = true;
  } else if (n.pf) { n.sarkiDans = true; }
}
// uyanan Pofuduk'un neşeli dansı (pofuduk.js'in sahne-dışı 'dans' durumunu burada oynatırız)
function skPofDans(o, dt) {
  const n = o.sk.pof; if (!n || !n.sarkiDans) return;
  const p = n.pf; if (!p || p.durum !== 'dans') return;
  const k = o.sk; k.dans += dt;
  const guc = k.dans < 3.2 ? 1 : 0.45;
  p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.6; p.dik = lerp(p.dik, 1, 1 - Math.exp(-dt * 8)); p.ayak = 1;
  p.pati = lerp(p.pati, 0.7, 1 - Math.exp(-dt * 8)); p.patiS += dt * 12; p.bloom = 1;
  p.f = P.x < n.x ? -1 : 1; p.bakX = p.f * 0.5;
  p.rot = Math.sin(k.dans * 5.2) * 0.07 * guc;
  k.hopT -= dt;
  if (k.hopT <= 0 && p.jy === 0) {
    k.hopT = guc > 0.9 ? 0.62 : 1.9; p.jv = guc > 0.9 ? -300 : -230; pfZipla(p, 3.2 * guc + 1);
    if (guc > 0.9 && Math.random() < 0.7) drFx(n.x, n.y - 46, Math.random() < 0.6 ? 'heart' : 'star');
  }
  if (typeof pfHop === 'function') pfHop(n, p, dt);
}
// Büyük kutlama (~11 sn): ışık yağmuru, çiçeklerden halkalar, takipçi Pofuduklar yanlarda zıplayıp dans eder, ödül çiçekleri açar
function skKutGuncelle(o, dt) {
  const k = o.sk;
  skPofDans(o, dt);
  k.kutT = (k.kutT || 0) - dt;
  if (k.kutT <= 0) { k.kutT = 0.7; const i = (k.say++) % 3; skParla(o, i, 1); skKivilcim(o, i, 5); }
  const n = Math.floor(110 * dt + Math.random());   // pastel ışık yağmuru / konfeti
  for (let q = 0; q < n; q++) {
    const c = SK_RENK[(Math.random() * 3) | 0], x = o.x + (Math.random() - 0.5) * 760, y = o.y - 300 - Math.random() * 40;
    parca(x, y, (Math.random() - 0.5) * 50, 70 + Math.random() * 90, 2.6, Math.random() < 0.3 ? '#fff6c8' : c[Math.random() < 0.5 ? 0 : 1], 9 + Math.random() * 8);
  }
  if (k.t > 1.5 && Math.random() < dt * 3) drFx(o.x + (Math.random() - 0.5) * 300, skCy(o) - 40, Math.random() < 0.5 ? 'heart' : 'star');
  // takipçi Pofuduklar: oldukları yerde (yasak şeridin dışında) coşkuyla zıplar
  for (const n2 of NESNELER) {
    if (n2.tip !== 'pofuduk' || !n2.uyandi || !n2.pf || (n2 === k.pof && n2.pf && n2.pf.durum === 'dans') || Math.abs(n2.x - o.x) > 900) continue;
    const p = n2.pf; if (p.durum !== 'takip' || p.sihir) continue;
    p.goz = 'mutlu'; p.agiz = 'acik'; p.agizB = 0.65; p.pati = lerp(p.pati, 0.8, 1 - Math.exp(-dt * 8)); p.patiS += dt * 12; p.ayak = 1;
    p.rot = Math.sin(k.t * 6 + n2.x * 0.05) * 0.08;
    if (p.jy === 0 && p.jv === 0 && Math.sin(k.t * 7.5 + n2.x * 0.013) > 0.2) { p.jv = -300; if (typeof pfZipla === 'function') pfZipla(p, 3.5); }
  }
}
function skBittiGuncelle(o, dt) {
  const k = o.sk;
  skPofDans(o, dt);
  for (const c of k.cicekler) c.a = Math.min(1, c.a + dt * 1.4);
}

// ── girdi: çiçeğe dokunuş (capture) ──
function skIsabet(cx, cy) {   // dokunulan (nesne, çiçek) ya da null
  const olc = S / DPR;
  let en = null, enD = 1e9;
  for (const o of NESNELER) {
    if (o.tip !== 'sarki' || !o.sk || o.sk.ap < 0.6) continue;
    if (Math.abs(P.x - o.x) > 900) continue;
    for (let i = 0; i < 3; i++) {
      const p = skPx(skCx(o, i), skCy(o) + 6), dx = cx - p.x, dy = (cy - p.y) * 0.72, d = Math.hypot(dx, dy);
      if (d < Math.max(72, 66 * olc) && d < enD) { enD = d; en = { o, i }; }
    }
  }
  return en;
}
addEventListener('pointerdown', e => {
  if (DURUM !== 'oyun' || e.pointerType === 'mouse' && e.button !== 0) return;
  if (typeof dugmede === 'function' && dugmede(e.clientX, e.clientY)) return;   // zıplama düğmesi her zaman önce
  const h = skIsabet(e.clientX, e.clientY);
  if (!h) return;
  e.preventDefault(); e.stopPropagation();   // yürüme girdisi oluşmaz
  try { skBas(h.o, h.i); } catch (er) { console.warn('[sarki]', er); }
}, true);

// ── çizim ──
function skRenk(i, a, acik) { return mixc(SK_RENK[i][0], SK_RENK[i][1], acik, a); }
function skCicekCiz(o, i, tm) {
  const k = o.sk, ap = smooth(k.ap), x = skCx(o, i), y0 = o.y, par = k.parla[i], vur = k.vur[i];
  if (ap < 0.02) return;
  const sal = Math.sin(tm * 1.3 + i * 1.9 + k.ph * 0) * 0.04;
  const sira = k.durum === 'sira' ? smooth(clamp(k.t / 0.6, 0, 1)) : 0, nef = 0.5 + 0.5 * Math.sin(tm * 3.4);   // sıra Feza'da: üç çiçek de eşit, nefes alıp zıplar
  const boy = (SK_BOY - 6) * (0.25 + 0.75 * ap) + sira * Math.abs(Math.sin(tm * 3.4)) * 9, by = y0 - boy, ac = 0.45 + 0.55 * Math.min(1, par + (k.bitti ? 0.55 : 0)) + vur * 0.1;
  const r = (20 + 6 * ac + 5 * vur) * (0.4 + 0.6 * ap);
  const c0 = SK_RENK[i][0], c1 = SK_RENK[i][1];
  // zemine yayılan ışık havuzu
  g.globalCompositeOperation = 'lighter';
  dglow(c0, x, y0 - 4, 70 * ap, (0.10 + 0.22 * par + (k.bitti ? 0.08 : 0)) * ap);
  g.globalCompositeOperation = 'source-over';
  // sap + iki yaprak
  g.strokeStyle = '#7ad8b8'; g.lineWidth = 3.2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y0 + 1); g.quadraticCurveTo(x + sal * 120 + 4, y0 - boy * 0.5, x + sal * 60, by + 6); g.stroke();
  g.fillStyle = 'rgba(150,240,205,0.9)';
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * 9, y0 - boy * 0.32, 9, 3.6, s * -0.55, 0, 6.283); g.fill(); }
  const bx = x + sal * 60;
  // taç yaprakları (altı)
  const acik = 0.35 + 0.65 * Math.min(1, ac);
  g.save(); g.translate(bx, by); g.rotate(sal * 2 + (k.bitti ? Math.sin(tm * 0.8 + i) * 0.1 : 0));
  for (let q = 0; q < 6; q++) {
    const a = q / 6 * 6.283;
    g.save(); g.rotate(a); g.translate(0, -r * (0.42 + 0.24 * acik));
    g.fillStyle = skRenk(i, 0.55 + 0.4 * Math.min(1, ac), 0.15 + 0.5 * par);
    g.beginPath(); g.ellipse(0, 0, r * 0.34, r * (0.55 + 0.2 * acik), 0, 0, 6.283); g.fill();
    g.restore();
  }
  g.restore();
  // yanan çiçekte genişleyen halka dalgası (hangisi yandı kolay okunsun)
  g.globalCompositeOperation = 'lighter';
  if (vur > 0.02) {
    const q = 1 - vur;
    for (const w of [0, 0.25]) { const u = clamp(q * 1.25 - w, 0, 1); if (u > 0 && u < 1) { g.strokeStyle = skRenk(i, (1 - u) * 0.9, 0.6); g.lineWidth = 5 * (1 - u) + 1; g.beginPath(); g.arc(bx, by, r * (1.4 + u * 3.2), 0, 6.283); g.stroke(); } }
    dglow(c1, bx, by, r * 4, vur * 0.35);
  }
  // "bana bas": belirgin, nefes alan büyük halka + parıltı
  if (sira > 0) {
    g.strokeStyle = skRenk(i, sira * (0.28 + 0.2 * nef), 0.25); g.lineWidth = 4;
    g.beginPath(); g.arc(bx, by, r * (2.0 + 0.5 * nef), 0, 6.283); g.stroke();
    dglow(c0, bx, by, r * (4.5 + 1.5 * nef), sira * (0.35 + 0.3 * nef));
  }
  g.globalCompositeOperation = 'source-over';
  // çekirdek + parıltılar
  g.globalCompositeOperation = 'lighter';
  dglow(c0, bx, by, r * (3.4 + 3.4 * par + 1.2 * vur), 0.28 + 0.5 * par + (k.bitti ? 0.12 : 0));
  dglow(c1, bx, by, r * (1.1 + 0.6 * par), 0.5 + 0.5 * par);
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = skRenk(i, 1, 0.9); g.beginPath(); g.arc(bx, by, r * 0.26, 0, 6.283); g.fill();
  // yanan çiçekte dönen minik yıldız halkası
  if (par > 0.12) {
    g.globalCompositeOperation = 'lighter';
    const hr = r * (1.9 + (1 - par) * 1.2);
    for (let q = 0; q < 5; q++) { const a = tm * 1.5 + q * 1.2566; dglow('#ffffff', bx + Math.cos(a) * hr, by + Math.sin(a) * hr * 0.8, 6 + 4 * par, par * 0.55); }
    g.globalCompositeOperation = 'source-over';
  }
}
function skCizArka(o, tm) {
  const k = o.sk; if (k.ap < 0.02) return;
  // ödül çiçekleri (zeminde, çiçeklerin gerisinde)
  if (k.bitti || k.kut) for (const c of k.cicekler) {
    if (c.a < 0.02) continue;
    const a = smooth(c.a), sal = Math.sin(tm * 1.4 + c.ph) * 2, r = c.r * (0.4 + 0.6 * a), h = 20 * a;
    g.strokeStyle = 'rgba(130,230,190,0.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(c.x, c.y + 1); g.lineTo(c.x + sal, c.y - h); g.stroke();
    g.globalCompositeOperation = 'lighter';
    dglow(c.col[0], c.x + sal, c.y - h, r * 4, 0.3 * a * (0.8 + 0.2 * Math.sin(tm * 2 + c.ph)));
    g.globalCompositeOperation = 'source-over';
    for (let q = 0; q < 5; q++) { const an = q / 5 * 6.283 + c.ph; g.fillStyle = mixc(c.col[0], c.col[1], 0.3, 0.9 * a); g.beginPath(); g.arc(c.x + sal + Math.cos(an) * r * 0.8, c.y - h + Math.sin(an) * r * 0.8, r * 0.55, 0, 6.283); g.fill(); }
    g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(c.x + sal, c.y - h, r * 0.4, 0, 6.283); g.fill();
  }
  for (let i = 0; i < 3; i++) skCicekCiz(o, i, tm);
}
// kutlama: çiçeklerden yükselen ışıklı nota işaretleri (♪) + çiçeklerin üstünde açan ışık halkası
function skNotaIsareti(x, y, s, rot, c, a) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.globalAlpha = a;
  g.fillStyle = c; g.strokeStyle = c; g.lineWidth = 2.2; g.lineCap = 'round';
  g.beginPath(); g.ellipse(0, 0, 6, 4.6, -0.4, 0, 6.283); g.fill();
  g.beginPath(); g.moveTo(5, -1.5); g.lineTo(5, -22); g.quadraticCurveTo(12, -17, 13, -10); g.stroke();
  g.restore(); g.globalAlpha = 1;
}
function skNotalar(o, tm) {
  const k = o.sk, A = k.kut ? smooth(clamp(k.t / 0.4, 0, 1)) : (k.bitti && k.durum === 'bitti' ? clamp(1 - k.t / 1.6, 0, 1) : 0);
  if (A < 0.01) return;
  for (let q = 0; q < 12; q++) {
    const i = q % 3, u = (tm * 0.32 + q / 12) % 1, x = skCx(o, i) + Math.sin(u * 5 + q) * 26 + (q % 4 - 1.5) * 12, y = skCy(o) - 26 - u * 250;
    const al = A * Math.sin(u * Math.PI);
    g.globalCompositeOperation = 'lighter'; dglow(SK_RENK[i][0], x, y, 26, al * 0.45); g.globalCompositeOperation = 'source-over';
    skNotaIsareti(x, y, 1.25 + 0.3 * Math.sin(q), Math.sin(tm * 2 + q) * 0.25, SK_RENK[i][1], al * 0.95);
  }
  if (k.kut) {   // ilk anda üç çiçekten yukarı açılan büyük ışık halkası
    const u = clamp(k.t / 1.4, 0, 1);
    if (u < 1) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,246,200,' + (0.6 * (1 - u)) + ')'; g.lineWidth = 6 * (1 - u) + 1; g.beginPath(); g.ellipse(o.x, skCy(o), 80 + 360 * smooth(u), 30 + 140 * smooth(u), 0, 0, 6.283); g.stroke(); g.globalCompositeOperation = 'source-over'; }
  }
}
function skCizOn(o, tm) {
  const k = o.sk; if (k.ap < 0.3) return;
  skNotalar(o, tm);
  // Pırıl'dan çiçeğe uçan ışık (kuyruklu minik yıldız)
  for (const c of k.kom) {
    const u = smooth(clamp(c.t / c.s, 0, 1)), tx = skCx(o, c.i), ty = skCy(o), col = SK_RENK[c.i];
    g.globalCompositeOperation = 'lighter';
    for (let q = 0; q < 6; q++) {
      const w = clamp(u - q * 0.06, 0, 1), x = lerp(c.x0, tx, w), y = lerp(c.y0, ty, w) - Math.sin(w * Math.PI) * 26;
      dglow(q ? col[0] : '#ffffff', x, y, 15 - q * 1.6, (1 - q / 6) * 0.9);
    }
    g.globalCompositeOperation = 'source-over';
  }
  // sıra Feza'da: Feza'dan üç çiçeğe doğru akan ışık noktaları (hepsine eşit)
  if (k.durum === 'sira' && k.t > 0.4) {
    const a = smooth(clamp((k.t - 0.4) / 0.6, 0, 1)), fx = P.rx !== undefined ? P.rx : P.x, fy = (P.ry !== undefined ? P.ry : P.y) - 50;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) for (let q = 0; q < 3; q++) {
      const u = (tm * 0.7 + q / 3 + i * 0.11) % 1, x = lerp(fx, skCx(o, i), u), y = lerp(fy, skCy(o), u) - Math.sin(u * Math.PI) * 30;
      dglow(SK_RENK[i][1], x, y, 12, a * Math.sin(u * Math.PI) * 0.8);
    }
    g.globalCompositeOperation = 'source-over';
  }
  // ezgi uzunluğu: Pırıl'ın altında küçük ışık noktaları (Feza'nın ilerleyişi dolar) – yalnız Feza'nın sırasında/gösteride
  if (k.durum === 'sira' || k.durum === 'goster' || k.durum === 'yanlis' || k.durum === 'dogru') {
    const n = (k.mel || skMelodi(o)).length, dy = o.y - SK_BOY - 82;
    g.globalCompositeOperation = 'lighter';
    for (let q = 0; q < n; q++) {
      const x = o.x + (q - (n - 1) / 2) * 38, dolu = k.durum === 'dogru' || (k.durum === 'sira' && q < k.adim) || (k.durum === 'goster' && q < k.gi);
      dglow(dolu ? '#fff2b8' : '#b8a6ff', x, dy, dolu ? 40 : 28, dolu ? 0.95 : 0.4 + 0.1 * Math.sin(tm * 3 + q));
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = dolu ? '#fffbe6' : 'rgba(215,200,255,0.8)'; g.beginPath(); g.arc(x, dy, dolu ? 10 : 7.5, 0, 6.283); g.fill();
      g.globalCompositeOperation = 'lighter';
    }
    g.globalCompositeOperation = 'source-over';
  }
}

// Pırıl'ın 'sarki' modu için yardımcı: piril.js D.srk'yı (nesne) okur
function skPirilYer(o) { return { x: o.x - 6, y: o.y - SK_BOY - 142 }; }

// Etkinlik sürerken takipçi Pofuduklar (pofuduk.js pfYerUygun) bu x aralığına yer seçmez: Feza'nın arkasında beklerler,
// çiçeklerin önünü kapatmazlar. Etkinlik yoksa (ya da bitince) null → normal takip.
function skYasak() {
  for (const o of NESNELER) {
    if (o.tip !== 'sarki' || !o.sk || (o.sk.bitti && o.sk.t > 0.8) || (o.sk.durum === 'bekle' && o.sk.ap < 0.3)) continue;
    if (Math.abs(P.x - o.x) > 950) continue;
    // şerit: çiçekler ±66 + 250 pay; Feza şeride yakınsa onun önü de dahil → takipçiler hep Feza'nın geri tarafında, çiçeklerden ≥250 uzakta
    const sol = o.x - 316, sag = o.x + 316;
    return P.x < o.x ? { x0: Math.min(sol, P.x + 20), x1: sag, sol: true } : { x0: sol, x1: Math.max(sag, P.x - 20), sol: false };
  }
  return null;
}

// Yasak şeridin içinde kalmış takipçi Pofuduk yumuşakça (ışınlanmadan) Feza'nın arkasına doğru uzaklaşır
function skTakipYasak(o, dt) {
  const z = skYasak(); if (!z) return;
  const hedef = z.sol ? z.x0 - 14 : z.x1 + 14;   // geri taraftaki çıkış
  for (const n of NESNELER) {
    if (n.tip !== 'pofuduk' || !n.uyandi || !n.pf || n.pf.durum !== 'takip' || n.pf.sihir || n.pf.gerin) continue;
    if (n.x > z.x0 && n.x < z.x1 && Math.abs(n.y - o.y) < 90) {
      const nx = n.x + Math.sign(hedef - n.x) * Math.min(Math.abs(hedef - n.x), 340 * dt);   // hızlı ama kayarak (ışınlanma yok)
      if (typeof pfYerBul === 'function' && pfYerBul(nx, n.pf.yt, 14) !== null) n.x = nx;
    }
  }
}

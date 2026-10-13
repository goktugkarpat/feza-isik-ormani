/* oyun.js – giriş (dokunmatik + klavye), fizik, nesne çalışma zamanı (TUR), kamera, oyun akışı (DURUM) ve ana döngü.
   Sözleşme: src/SPEC.md. Klasik script: üst düzey adlar bütün dosyalarla ortak (özel adlar "om" önekli).
   Fizik sabit adımlı (120 Hz); çizim konumu iki adım arasında yumuşatılır. Kare boyunca (çizim dahil) P.x/P.y
   yumuşatılmış çizim konumunu gösterir, kare sonunda gerçek fizik konumuna geri döner. P.rx/P.ry = çizim konumu. */
'use strict';

// ════════════════════════════ hata kalkanı ════════════════════════════
// Başka bir modüldeki hata kareyi yarıda kesmesin: her aşama kendi try/catch'inde çalışır. Her aşamanın ilk hatası
// yığınıyla yazılır, sonra en çok 5 sn'de bir (sayaçla). Hatadan sonra tuval durumu (dönüşüm, saydamlık, karışım, kırpma)
// temizlenir ki karenin geri kalanı düzgün çizilsin. Hatasız karede maliyet yok denecek kadar az.
const omHataK = { say: 0, a: {} };
function omHataBildir(ad, e) {
  const k = omHataK.a[ad] || (omHataK.a[ad] = { n: 0, t: -1e9, son: 0 });
  k.n++; omHataK.say++; k.son = performance.now() / 1000;
  if (k.son - k.t > 5) { k.t = k.son; console.error('[oyun:' + ad + (k.n > 1 ? ' ×' + k.n : '') + ']', e); }
}
const OM_BOS_CIZGI = [];
function omTuvalDuzelt(dunya) {
  for (let i = 0; i < 16; i++) g.restore();   // modül save() edip atmadan hata verdiyse yığını boşalt (kırpma kalmasın); boş yığında etkisiz
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.shadowBlur = 0; g.lineDashOffset = 0; if (g.setLineDash) g.setLineDash(OM_BOS_CIZGI);
  try { if (g.filter && g.filter !== 'none') g.filter = 'none'; } catch (_) { /* yoksay */ }
  if (dunya) g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
}
function omHata(ad, e) { omHataBildir(ad, e); omTuvalDuzelt(false); }
function omTemizle() { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }   // hatasız yol: ucuz
// fn(a, b, c) güvenli çağrı; fn yoksa sessizce geçer (modül dosyası hiç yüklenemediyse de). Döner: başarılı mı
function omCagir(ad, fn, a, b, c, dunya) {
  if (typeof fn !== 'function') return false;
  try { fn(a, b, c); return true; } catch (e) { omHataBildir(ad, e); omTuvalDuzelt(dunya); return false; }
}
function omSfx(ad, v) { if (typeof AU !== 'undefined' && AU && typeof AU.sfx === 'function') { try { AU.sfx(ad, v); } catch (e) { omHataBildir('AU.sfx', e); } } }

// ════════════════════════════ giriş ════════════════════════════
// iPad: sol altta zıplama düğmesi (sol el); ekranın başka yerine basılı tutmak → Feza parmağın tarafına yürür.
// Parmak Feza'ya yakınsa yavaş yürür, uzaksa koşar; tam üstündeyse durur (titreme olmasın diye histerezis).
const GIRDI = { eksen: 0, ziplaBasili: false, dugme: { x: 0, y: 0, r: 0, basili: false }, hedefX: null, hedefY: null, hareket: false };
let omFirlatT = -1;   // 'hayvanFirlat' anı (oyun saati)
let omIsit = (typeof BOLUM_NO !== 'undefined' && BOLUM_NO === 2 && typeof dn2Isit === 'function');
let omGecis = null, omFinalPlan = false, omAcilis = null;   // Bölüm geçişi / Bölüm 2 final planı (başta tanımlı: kamera yüklenirken okur)
let axis = 0, jumpHeld = false, jumpPressed = false, started = false, startT = 0, moved = false;
const keys = {};
const OM_PARMAK = [];   // sabit parmak yuvaları (her karede yeni nesne/dizi yok)
for (let i = 0; i < 10; i++) OM_PARMAK.push({ id: -1, aktif: false, jump: false, x: 0, y: 0, sira: 0 });
let omSira = 0, omYon = 0;   // omYon: yürüme parmağının son yönü (histerezis)
const touches = { get size() { let n = 0; for (const t of OM_PARMAK) if (t.aktif) n++; return n; } };   // eski ad (uyumluluk)
// Güvenli alan payları (çentik / ana ekran çubuğu): CSS env() ile ölçülür
const omGuvenli = { sol: 0, alt: 0 };
function omGuvenliOlc() {
  try {
    let d = document.getElementById('omGuvenliProbe');
    if (!d) {
      d = document.createElement('div'); d.id = 'omGuvenliProbe';
      d.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
        'padding-left:env(safe-area-inset-left,0px);padding-bottom:env(safe-area-inset-bottom,0px)';
      document.body.appendChild(d);
    }
    const cs = getComputedStyle(d);
    omGuvenli.sol = parseFloat(cs.paddingLeft) || 0; omGuvenli.alt = parseFloat(cs.paddingBottom) || 0;
  } catch (_) { omGuvenli.sol = omGuvenli.alt = 0; }
}
function dugmeYeri() {   // CSS px; 5 yaş başparmağı: iPad Pro'da çap ≈ 80 px, merkez kenarlardan ≈ 76 px
  omGuvenliOlc();
  const r = clamp(Math.min(innerWidth, innerHeight) * 0.048, 32, 44);
  const pay = r + 36;
  GIRDI.dugme.r = r; GIRDI.dugme.x = omGuvenli.sol + pay; GIRDI.dugme.y = innerHeight - omGuvenli.alt - pay;
}
// cömert isabet alanı: düğmenin 1.5 katı + sol alt köşe
function dugmede(x, y) {
  const d = GIRDI.dugme;
  if (Math.hypot(x - d.x, y - d.y) < d.r * 1.5) return true;
  return x < d.x + d.r * 1.15 && y > d.y - d.r * 1.15;
}
function omYuva(id) { for (const t of OM_PARMAK) if (t.aktif && t.id === id) return t; return null; }
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (DURUM === 'baslik') {
    // ebeveyn: sol üst köşe 3 sn basılı = kayıtları sıfırla
    if (e.clientY < 110 && e.clientX < 110) {
      clearTimeout(omKoseT);
      omKoseT = setTimeout(() => { try { for (const k of ['fezaIsikTamam', 'fezaIsikBitti1', 'fezaIsikBolum', 'fezaIsikSon']) localStorage.removeItem(k); } catch (_) {} location.replace(location.pathname); }, 3000);
      return;
    }
    // seçim sahnesi dokunuşu kendi 'pointerdown' dinleyicisiyle yakalar (çift tetiklenmesin diye burada iletilmez)
    OLAY.emit('secimIlgi', { x: e.clientX, y: e.clientY });   // her dokunuş: çocuk ekranla ilgileniyor (ses.js p_secim sayacını sıfırlayabilir)
    return;
  }
  if (DURUM !== 'oyun') { OLAY.emit('dokunus', { x: e.clientX, y: e.clientY }); return; }
  try { cv.setPointerCapture(e.pointerId); } catch (_) { /* yoksay */ }
  let t = omYuva(e.pointerId);
  if (!t) { for (const s of OM_PARMAK) if (!s.aktif) { t = s; break; } }
  if (!t) return;
  t.id = e.pointerId; t.aktif = true; t.x = e.clientX; t.y = e.clientY; t.sira = ++omSira;
  t.jump = dugmede(e.clientX, e.clientY);
  if (t.jump) { jumpPressed = true; jumpHeld = true; }
  else omYon = 0;   // yeni yürüme parmağı: yönü baştan belirle
});
let omKoseT = 0;
function omBirak(e) { clearTimeout(omKoseT); const t = omYuva(e.pointerId); if (t) t.aktif = false; }
cv.addEventListener('pointermove', e => { const t = omYuva(e.pointerId); if (t) { t.x = e.clientX; t.y = e.clientY; } });
cv.addEventListener('pointerup', omBirak); cv.addEventListener('pointercancel', omBirak);
cv.addEventListener('lostpointercapture', omBirak);
cv.addEventListener('contextmenu', e => e.preventDefault());
function omHepsiniBirak() { for (const t of OM_PARMAK) t.aktif = false; for (const k in keys) keys[k] = false; omYon = 0; }
OLAY.on('durum', d => { if (d !== 'oyun') for (const t of OM_PARMAK) t.aktif = false; });
addEventListener('blur', omHepsiniBirak);
// Duraklatma: sekme/uygulama gizlenince parmaklar bırakılır, benzetim durur (frame'de raw=0); geri gelince ilk kare 1/60 sn
// sayılır → zaman sıçraması yok. pageshow: iPad'de geri-ileri önbelleğinden dönüş.
function omDuraklat() { omHepsiniBirak(); omSonT = -1; omAcc = 0; jumpPressed = false; omCozSifirla(); }
document.addEventListener('visibilitychange', omDuraklat);
addEventListener('pagehide', omDuraklat); addEventListener('pageshow', omDuraklat);
// Ses kilidi: iPad'de dokunuşla ses açma "pointerdown"da değil parmak kalkınca (touchend/pointerup) geçerli sayılır.
// İlk dokunuşta begin() AU.start()'ı çağırır; parmak kalkınca da bir kez daha çağrılır (AU.start tekrar çağrılınca bir şey yapmaz,
// muzik.js kendi touchend dinleyicisiyle bağlamı sürdürür).
function omSesAc() { if (started && typeof AU !== 'undefined' && AU && typeof AU.start === 'function') { try { AU.start(); } catch (e) { omHataBildir('AU.start', e); } } }
cv.addEventListener('pointerup', omSesAc); cv.addEventListener('touchend', omSesAc, { passive: true });
addEventListener('keydown', e => {
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  if (DURUM === 'baslik') { if (!omSecimAktif) begin(); return; }
  if (DURUM !== 'oyun') { if (!e.repeat) OLAY.emit('dokunus', {}); return; }
  if (!keys[e.code] && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW')) jumpPressed = true;
  keys[e.code] = true;
});
addEventListener('keyup', e => { keys[e.code] = false; });
function readInput() {
  let a = 0, yurur = null, jb = false;
  GIRDI.hedefX = null; GIRDI.hedefY = null;
  for (let i = 0; i < OM_PARMAK.length; i++) { const t = OM_PARMAK[i]; if (t.aktif) { if (t.jump) jb = true; else if (!yurur || t.sira > yurur.sira) yurur = t; } }
  if (yurur) {
    // parmak ile Feza'nın ekrandaki yeri arasındaki fark, dünya biriminde
    const olc = S / DPR, fx = ((P.rx !== undefined ? P.rx : P.x) - cam.x) * olc;
    const d = (yurur.x - fx) / olc, ad = Math.abs(d);
    GIRDI.hedefX = yurur.x; GIRDI.hedefY = yurur.y;
    // histerezis: durmuşken 26 birimden uzakta başla; yürürken 12 birime kadar yaklaşınca dur
    if (omYon === 0) { if (ad > 26) omYon = Math.sign(d); }
    else if (ad < 12 || Math.sign(d) !== omYon && ad > 26) omYon = ad < 12 ? 0 : Math.sign(d);
    else if (Math.sign(d) !== omYon) omYon = 0;
    if (omYon) a = omYon * clamp(0.32 + (ad - 12) / 150, 0.32, 1);   // yakın → yavaş yürüyüş, uzak → koşu
  } else omYon = 0;
  if (keys.ArrowLeft || keys.KeyA) a = -1;
  if (keys.ArrowRight || keys.KeyD) a = 1;
  if ((keys.ArrowLeft || keys.KeyA) && (keys.ArrowRight || keys.KeyD)) a = 0;
  axis = a; GIRDI.eksen = a;
  jumpHeld = jb || !!(keys.Space || keys.ArrowUp || keys.KeyW);
  GIRDI.dugme.basili = jb || jumpHeld; GIRDI.ziplaBasili = jumpHeld;
  if (a) { moved = true; GIRDI.hareket = true; }
}
function begin() {
  if (started) return; started = true; startT = now;
  if (typeof AU !== 'undefined' && AU && typeof AU.start === 'function') { try { AU.start(); } catch (e) { omHata('AU.start', e); } }
  try { localStorage.setItem('fezaIsikSon', String(BOLUM_NO)); } catch (e) {}   // başlıkta son oynanan bölüm parlak durur
  DURUM = 'giris'; OLAY.emit('durum', DURUM);
  if (BOLUM_NO === 2) {   // Bölüm 2: kısa uyku girişi (yeni sahne varsa; test bayrakları ?atla/?bolum= atlar, ?uyku zorlar) → ışıkla belirme
    const basla = () => { oyunaBasla(); omDevamGirisi(); };
    if (typeof SAHNE !== 'undefined' && SAHNE && typeof SAHNE.secim === 'function' && typeof SAHNE.giris === 'function' && !Q.has('atla') && (!Q.has('bolum') || Q.has('uyku'))) { omZamanla(0.4, () => { omPerde.hedef = 0; omPerde.hiz = 0.8; }); try { SAHNE.giris(basla, { bolum: 2, kisa: true }); } catch (e) { omHata('SAHNE.giris', e); basla(); } }   // yenileme sonrası ilk ~0,4 sn koyu, sonra uyku sahnesi görünür (sahne bitince omDevamGirisi perdeyi kapatıp açar)
    else basla();
    return;
  }
  if (Q.has('atla') || typeof SAHNE === 'undefined' || !SAHNE || typeof SAHNE.giris !== 'function') oyunaBasla();
  else { try { SAHNE.giris(oyunaBasla, { bolum: 1, kisa: false }); } catch (e) { omHata('SAHNE.giris', e); oyunaBasla(); } }
}
function oyunaBasla() { if (DURUM === 'oyun') return; DURUM = 'oyun'; OLAY.emit('durum', DURUM); stepCam(0, true); }

// ════════════════════════════ fizik ════════════════════════════
// Zemin ızgarası + nesnelerin cisim kutuları.
// o.cisim = { w, h, tip: 'kati'|'ustten'|'ziplat', guc, aktif, dx, dy }  (kutunun alt ortası: o.x, o.y)
const CISIMLER = [];
const OM_CISIMDE = new WeakSet();   // CISIMLER'e eklenmiş nesneler (her karede indexOf taraması yok)
let ustundeki = null;   // Feza'nın üstünde durduğu nesne
const OM = {   // ayar sabitleri
  STEP: 1 / 120, KOS: 250, ZIPLA: 730, CIFT: 650, YERCEKIM: 2200, DUSUS: 1.25, BIRAK: 2.1, MAXDUS: 950,
  IVME: 1700, FREN: 2300, DONUS: 3400, HAVA_IVME: 1300, HAVA_FREN: 800,
  COYOTE: 0.15, TAMPON: 0.2, MIN_BASILI: 0.11, TEPE: 0.6, KOSE: 13, KENAR: 12, PAY: 6,
};
let omStandY = 0;   // üstünde durulan cismin son üst y'si / x'i (taşıma için)
let omStandX = 0;
const omKutu = { x0: 0, x1: 0, y0: 0, y1: 0 };
function kutu(o) { const c = o.cisim; return { x0: o.x - c.w / 2, x1: o.x + c.w / 2, y0: o.y - c.h, y1: o.y }; }
function omK(o) { const c = o.cisim; omKutu.x0 = o.x - c.w / 2; omKutu.x1 = o.x + c.w / 2; omKutu.y0 = o.y - c.h; omKutu.y1 = o.y; return omKutu; }
// Feza'nın kutusu (x, ayak y) ızgarada katı kareye değiyor mu?
function omKatiVar(x, y) {
  const tx0 = Math.floor((x - PW) / T), tx1 = Math.floor((x + PW - 0.01) / T);
  const ty0 = Math.floor((y - PH) / T), ty1 = Math.floor((y - 0.01) / T);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (cell(tx, ty) === 1) return true;
  return false;
}
// parçacık renk listeleri (her patlamada yeni dizi olmasın)
const OM_R = { inis: ['#e8dcff', '#bff4ff'], su: ['#bfe6ff', '#ffffff', '#d9c8ff'], bosluk: ['#bfe6ff', '#ffffff'],
  kurtar: ['#c9a2ff', '#ffd6f2', '#ffffff'], zipla: ['#ffffff', '#e0d0ff'], tohum: ['#ffe9b8', '#ffffff'], cicek: ['#9ff0ff', '#ffe9b8', '#c9b2ff'] };
function inis(y, siddet) {
  P.air = 0;
  if (siddet > 300) {
    P.land = clamp(siddet / 900, 0.3, 1); omSfx('land', P.land); OLAY.emit('inis', { x: P.x, y, siddet });
    burst(P.x, y, siddet > 700 ? 12 : 7, OM_R.inis, 50 + siddet * 0.05, 0.7, 6);
  }
}
// Bir cismin üstüne iniş (ezme / zıplatma / üstünde durma). Döner: Feza hâlâ yerde mi
function omCismeIn(o, top, vy, was) {
  const c = o.cisim, h = TUR.al(o.tip);
  P.y = top;
  if (c.tip === 'ziplat') {   // tutarlı yükseklik: gelen hızdan bağımsız, düğme bırakılsa da kesilmez
    P.vy = -(c.guc || 1050); P.ground = false; P.dj = true; P.jumpT = 0; P.bounce = true; P.coyote = 0; P.air = 0;
    OLAY.emit('ziplatti', o); if (h && typeof h.ustune === 'function') { try { h.ustune(o, vy); } catch (e) { omHata(o.tip + '.ustune', e); } }
    return false;
  }
  if (!was) inis(top, vy);
  P.vy = 0; P.ground = true; ustundeki = o; omSonUst = o; omStandY = top; omStandX = o.x;
  if (!was && h && typeof h.ustune === 'function') {
    try { h.ustune(o, vy); } catch (e) { omHata(o.tip + '.ustune', e); }
    if (P.vy < 0) { P.ground = false; ustundeki = null; P.bounce = true; P.jumpT = 0; P.coyote = 0; P.dj = true; return false; }   // ezince sekti
  }
  return true;
}
// Yan çarpışmada kenara tutunma affı: ayaklar kenarın en çok ~12 birim altındaysa (yükselirken ya da düşerken) üstüne çık
function omKenaraCik(top) {
  if (P.y - top <= 0 || P.y - top > OM.KENAR) return false;
  if (omKatiVar(P.x, top)) return false;
  return true;
}
function moveX(dx) {
  if (!dx) { omItBedenler(0); return; }
  P.x += dx;
  const xMax = COLS * T - 2.5 * T;   // dünyanın sonunda görünmez duvar: Feza ekran kenarında yarım kalmasın
  if (P.x > xMax) { P.x = xMax; if (P.vx > 0) P.vx = 0; }
  const ty0 = Math.floor((P.y - PH) / T), ty1 = Math.floor((P.y - 0.01) / T);
  const tx = dx > 0 ? Math.floor((P.x + PW) / T) : Math.floor((P.x - PW) / T);
  for (let ty = ty0; ty <= ty1; ty++) if (cell(tx, ty) === 1) {
    // kenar affı: ayaklar duvarın üst kenarının birkaç birim altındaysa üstüne çık
    if (!P.ground && (ty > ty0 || cell(tx, ty - 1) !== 1) && omKenaraCik(ty * T)) {
      P.y = ty * T;
      if (P.vy >= -160) { const vy = P.vy; P.vy = 0; P.ground = true; inis(P.y, vy); }   // düşerken / tepede: kenara kon
      break;   // yükselirken: yalnız kenarın üstüne it, zıplama sürsün; yatay hız korunur
    }
    P.x = dx > 0 ? tx * T - PW - 0.01 : (tx + 1) * T + PW + 0.01;
    P.vx = 0; break;
  }
  omItBedenler(dx);
}
// katı cisimlerin yanları (ve cisim Feza'nın içine girdiyse dışarı it)
function omItBedenler(dx) {
  for (let i = 0; i < CISIMLER.length; i++) { const o = CISIMLER[i];
    const c = o.cisim; if (!c.aktif || c.tip === 'ustten') continue;
    const k = omK(o);
    if (P.x + PW <= k.x0 || P.x - PW >= k.x1 || P.y <= k.y0 + 0.5 || P.y - PH >= k.y1) continue;
    if (o === ustundeki || (P.y - k.y0 <= OM.KENAR + 3 && (P.vy >= -160 || c.tip !== 'kati'))) {   // üst kenara yakın: üstüne çık (kenar affı / ezme)
      const was = P.ground, vy = Math.max(P.vy, 0);
      omCismeIn(o, k.y0, vy, was && o === ustundeki);
      continue;
    }
    const sol = dx > 0 || (dx === 0 && P.x < o.x);
    const nx = sol ? k.x0 - PW - 0.01 : k.x1 + PW + 0.01;
    if (!omKatiVar(nx, P.y)) P.x = nx;
    P.vx = 0; OLAY.emit('carpti', o);
  }
}
function moveY(dy) {
  const prev = P.y; P.y += dy;
  const was = P.ground; P.ground = false; ustundeki = null;
  if (dy >= 0) {
    // iniş: ilk inişte ayaklara küçük pay (kenara basınca kaymasın), yerde yürürken pay yok (kenardan doğal düşsün)
    const ty = Math.floor(P.y / T), top = ty * T;
    const a0 = Math.floor((P.x - PW) / T), a1 = Math.floor((P.x + PW - 0.01) / T);
    let hit = false;
    for (let tx = a0; tx <= a1; tx++) { const c = cell(tx, ty); if (c === 1 || (c === 2 && prev <= top + 0.5)) { hit = true; break; } }
    if (!hit && !was && P.air > 0.12 && prev <= top + 0.5) {
      for (let s = -1; s <= 1 && !hit; s += 2) {
        const tx = Math.floor((P.x + s * (PW + OM.PAY)) / T);
        if ((s < 0 && tx >= a0) || (s > 0 && tx <= a1) || P.vx * s < -30) continue;   // kenardan uzaklaşıyorsa yakalama
        const c = cell(tx, ty);
        if ((c === 1 || c === 2) && cell(tx, ty - 1) !== 1) {
          const nxp = s > 0 ? tx * T - PW + 2 : (tx + 1) * T + PW - 2;   // kenarın üstüne hafifçe kaydır
          if (!omKatiVar(nxp, top)) { P.x = nxp; hit = true; }
        }
      }
    }
    if (hit) { if (!was) inis(top, P.vy); P.y = top; P.vy = 0; P.ground = true; }
    for (let i = 0; i < CISIMLER.length; i++) { const o = CISIMLER[i];
      const c = o.cisim; if (!c.aktif) continue;
      const k = omK(o);
      const p = (was || P.air <= 0.12 || (o.x < P.x ? P.vx > 30 : P.vx < -30)) ? 0 : OM.PAY;
      if (P.x + PW + p <= k.x0 || P.x - PW - p >= k.x1) continue;
      // cömert ezme/iniş: önceki ayak üst kenarın biraz altında bile olsa (hızlı düşüş / yükselen cisim) say
      const tol = 2 + Math.max(0, -(c.dy || 0)) + (P.vy > 0 ? Math.min(OM.KENAR, P.vy * OM.STEP * 2) : 0);
      if (prev <= k.y0 + tol && P.y >= k.y0) {
        if (P.x + PW <= k.x0) P.x = k.x0 - PW + 2; else if (P.x - PW >= k.x1) P.x = k.x1 + PW - 2;
        const vy = P.vy;
        if (!omCismeIn(o, k.y0, vy, was && o === omSonUst)) break;
      }
    }
  } else {
    const ty = Math.floor((P.y - PH) / T);
    const tx0 = Math.floor((P.x - PW) / T), tx1 = Math.floor((P.x + PW - 0.01) / T);
    let bl = false, br = false;
    for (let tx = tx0; tx <= tx1; tx++) if (cell(tx, ty) === 1) { if (tx === tx0) bl = true; if (tx === tx1) br = true; if (tx !== tx0 && tx !== tx1) bl = br = true; }
    if (bl || br) {
      // köşe düzeltme: kafa bir kenara az değdiyse yana kaydırıp zıplamaya devam et
      let ok = false;
      if (br && !bl) { const s = (P.x + PW) - tx1 * T + 0.02; if (s <= OM.KOSE && !omKatiVar(P.x - s, P.y)) { P.x -= s; ok = true; } }
      else if (bl && !br) { const s = (tx0 + 1) * T - (P.x - PW) + 0.02; if (s <= OM.KOSE && !omKatiVar(P.x + s, P.y)) { P.x += s; ok = true; } }
      if (!ok) { P.y = (ty + 1) * T + PH; P.vy = 0; P.jumpT = 9; }
    }
    // katı cisimlerin alt yüzü de kafayı durdurur
    for (let i = 0; i < CISIMLER.length; i++) { const o = CISIMLER[i];
      const c = o.cisim; if (!c.aktif || c.tip === 'ustten') continue;
      const k = omK(o);
      if (P.x + PW <= k.x0 || P.x - PW >= k.x1) continue;
      if (prev - PH >= k.y1 - 0.5 && P.y - PH < k.y1) {
        const sl = P.x + PW - k.x0, sr = k.x1 - (P.x - PW);
        if (sl <= OM.KOSE && !omKatiVar(k.x0 - PW - 0.02, P.y)) P.x = k.x0 - PW - 0.02;
        else if (sr <= OM.KOSE && !omKatiVar(k.x1 + PW + 0.02, P.y)) P.x = k.x1 + PW + 0.02;
        else { P.y = k.y1 + PH; P.vy = 0; P.jumpT = 9; }
      }
    }
  }
  if (ustundeki) omSonUst = ustundeki; else if (!P.ground) omSonUst = null;
}
let omSonUst = null;   // bir önceki adımda üstünde durulan cisim
let omSafeO = null, omSafeOff = 0;   // güvenli yer bir nilüfer/cisimse
function omGuvenliYer() {
  if (!P.ground || P.fade > 0) return;
  if (ustundeki) {
    const o = ustundeki, c = o.cisim;
    if (c.tip === 'ustten' && Math.abs(P.x - o.x) < c.w / 2 - 10 && !c.dx && !c.dy) { P.safeX = P.x; P.safeY = P.y; omSafeO = o; omSafeOff = P.x - o.x; }
    return;
  }
  const ty = Math.floor(P.y / T);
  if (cell(Math.floor(P.x / T), ty) && cell(Math.floor((P.x - 20) / T), ty) && cell(Math.floor((P.x + 20) / T), ty)) {
    // uyuyan bir Pofuduğun dibi güvenli yer sayılmasın (geri dönünce içine doğmasın)
    for (let i = 0; i < CISIMLER.length; i++) { const o = CISIMLER[i], c = o.cisim; if (c.aktif && c.tip !== 'ustten' && Math.abs(o.x - P.x) < c.w / 2 + 30) return; }
    P.safeX = P.x; P.safeY = P.y; omSafeO = null;
  }
}
// Ayakların altında 'mesafe' içinde basılacak zemin / cisim var mı (düşerken)
function omYereYakin(mesafe) {
  const y0 = P.y, y1 = P.y + mesafe;
  const tx0 = Math.floor((P.x - PW) / T), tx1 = Math.floor((P.x + PW - 0.01) / T);
  for (let ty = Math.floor(y0 / T); ty <= Math.floor(y1 / T); ty++) {
    if (ty * T < y0 - 0.5) continue;
    for (let tx = tx0; tx <= tx1; tx++) { const c = cell(tx, ty); if (c === 1 || c === 2) return true; }
  }
  for (let i = 0; i < CISIMLER.length; i++) { const o = CISIMLER[i];
    const c = o.cisim; if (!c.aktif) continue;
    const top = o.y - c.h;
    if (top >= y0 - 0.5 && top <= y1 && P.x + PW > o.x - c.w / 2 && P.x - PW < o.x + c.w / 2) return true;
  }
  return false;
}
// Bütün göller (bolum.js BOLUM.gollar; yoksa tek BOLUM.gol)
let omGolTek = null;   // BOLUM.gollar yoksa tek gölden yapılan dizi (her çağrıda yeni dizi olmasın)
const OM_BOS = [];
function omGollar() {
  if (BOLUM.gollar && BOLUM.gollar.length) return BOLUM.gollar;
  if (!BOLUM.gol) return OM_BOS;
  if (!omGolTek || omGolTek[0] !== BOLUM.gol) omGolTek = [BOLUM.gol];
  return omGolTek;
}
function omGolde(x, pay) { const L = omGollar(); for (let i = 0; i < L.length; i++) { const gl = L[i]; if (gl && x > gl.x0 - pay && x < gl.x1 + pay) return gl; } return null; }
function omDusus(suda) {
  P.fade = 1.2; P.respawned = false; P.vx *= 0.3;
  if (suda) {
    const gl = (suda && suda.su !== undefined) ? suda : (omGolde(P.x, 4) || BOLUM.gol);
    const sy = gl ? gl.su : ROWS * T - 60;
    omSfx('splash'); burst(P.x, sy - 4, 26, OM_R.su, 170, 0.9, 7);
    ripples.push({ x: P.x, y: sy, r: 0, life: 0.9, small: true }); ripples.push({ x: P.x, y: sy, r: -14, life: 1.1, small: true });
  } else { omSfx('splash'); burst(P.x, ROWS * T - 60, 24, OM_R.bosluk, 160, 0.9, 7); }
  OLAY.emit('dustu', P);
}
// Havada minik yardım: düşerken bir kenara (zemin, dal, nilüfer, cisim) az farkla yetişemeyecekse ve o yöne basıyorsa,
// yatay hızına hafifçe ekleyip kenara kondur. En çok ~24 birim (yarım kare) açık, en çok +150 birim/sn fark; gözle seçilmez.
const OM_YARDIM = { ACIK: 24, FARK: 150 };
// Bölüm 2 (suyun üstünde taştan taşa): daha affedici fizik; Bölüm 1'e dokunmaz
if (BOLUM_NO === 2) { Object.assign(OM, { COYOTE: 0.23, TAMPON: 0.2, HAVA_IVME: 2300, KENAR: 17 }); OM_YARDIM.ACIK = 80; OM_YARDIM.FARK = 190; }
let omYardimIstek = 0;   // omHavaYardim ara sonucu (her adımda yeni kapanış fonksiyonu yok)
function omYardimDene(kenar, top, s, lead) {   // kenar: platformun Feza'ya bakan x'i, top: üst y
  const acik = (kenar - lead) * s, dy = top - P.y;
  if (acik <= 0 || acik > OM_YARDIM.ACIK || dy < 0 || dy > 70) return;
  const gd = OM.YERCEKIM * OM.DUSUS, tt = (Math.sqrt(P.vy * P.vy + 2 * gd * dy) - P.vy) / gd + 0.01;   // üst kenara iniş süresi
  const vIst = Math.max(0, acik - OM.PAY + 4) / tt;                       // iniş zaten ~PAY birim kenar affı veriyor
  if (vIst - P.vx * s > OM_YARDIM.FARK || vIst > OM.KOS * 1.5) return;   // çok uzak: yardım yok (doğal düşüş)
  if (omKatiVar(kenar + s * (PW + 2), top)) return;                     // konacağı yerde duvar var
  if (vIst > omYardimIstek) omYardimIstek = vIst;
}
function omHavaYardim(s) {
  const lead = P.x + s * PW;
  omYardimIstek = 0;
  const c0 = Math.floor(lead / T), c1 = Math.floor((lead + s * OM_YARDIM.ACIK) / T);
  const r0 = Math.floor((P.y - 1) / T) + 1, r1 = Math.floor((P.y + 70) / T);
  for (let tx = c0; s > 0 ? tx <= c1 : tx >= c1; tx += s) for (let ty = Math.max(r0, 0); ty <= r1 && ty < ROWS; ty++) {
    const c = cell(tx, ty);
    if ((c === 1 || c === 2) && cell(tx, ty - 1) !== 1) { omYardimDene(s > 0 ? tx * T : (tx + 1) * T, ty * T, s, lead); break; }
  }
  for (let i = 0; i < CISIMLER.length; i++) {
    const o = CISIMLER[i], c = o.cisim; if (!c.aktif || c.tip === 'ziplat') continue;
    omYardimDene(s > 0 ? o.x - c.w / 2 : o.x + c.w / 2, o.y - c.h, s, lead);
  }
  const istek = omYardimIstek;
  if (istek > 0 && P.vx * s < istek) { omHavaYardim.n++; return s * Math.min(istek - P.vx * s, OM_YARDIM.FARK); }   // yalnız bu adımın ek kayması
  return 0;
}
omHavaYardim.n = 0;
function stepPlayer(dt) {
  if (P.fade > 0) {   // suya/boşluğa düştü: Pırıl geri taşır
    P.fade -= dt;
    if (P.fade > 0.6) { P.vy = Math.min(P.vy, 120); P.y += P.vy * dt * 0.25; P.x += P.vx * dt * 0.25; }   // suyun içinde yavaşça
    if (P.fade <= 0.6 && !P.respawned) {
      P.respawned = true;
      if (omSafeO && omSafeO.cisim && omSafeO.cisim.aktif) { P.x = omSafeO.x + omSafeOff; P.y = omSafeO.y - omSafeO.cisim.h; }
      else { P.x = P.safeX; P.y = P.safeY; }
      P.vx = P.vy = 0; P.ground = true; P.bounce = false; ustundeki = null; omSonUst = null; omIsinla();
      omCagir('dragonCarry', typeof dragonCarry === 'function' ? dragonCarry : null); burst(P.x, P.y - 30, 30, OM_R.kurtar, 140, 1.2, 9); omSfx('dbl'); OLAY.emit('kurtarildi', P);
    }
    return;
  }
  if (P.kilit > 0) { P.kilit -= dt; axis = 0; jumpPressed = false; }   // sahne anlarında kontrol kısa süre kapalı
  const agacBitti = typeof TREE !== 'undefined' && TREE && TREE.done;
  if (agacBitti) { axis = 0; jumpPressed = false; P.buf = 0; }   // ağaç yandı: finale kadar kontrol yok
  // yatay: yumuşak hızlanma, yumuşak ama kısa duruş, hızlı dönüş
  const target = axis * OM.KOS;
  let acc;
  if (P.ground) acc = target === 0 ? (agacBitti ? 900 : OM.FREN) : (P.vx * target < 0 ? OM.DONUS : (Math.abs(target) > Math.abs(P.vx) ? OM.IVME : OM.FREN));
  else acc = target === 0 ? OM.HAVA_FREN : (P.vx * target < 0 ? OM.DONUS * 0.6 : OM.HAVA_IVME);
  if (P.ground && target !== 0 && Math.abs(P.vx) < OM.KOS * 0.4 && P.vx * target >= 0) acc *= 1.4;   // ilk adım daha çevik
  if (P.vx < target) P.vx = Math.min(target, P.vx + acc * dt); else if (P.vx > target) P.vx = Math.max(target, P.vx - acc * dt);
  if (Math.abs(axis) > 0.1) P.f = Math.sign(axis);
  // zıplama: tampon + coyote + Pırıl'ın havada itişi
  if (jumpPressed) { P.buf = OM.TAMPON; jumpPressed = false; }
  if (P.ground) { P.coyote = OM.COYOTE; P.dj = true; } else P.coyote -= dt;
  if (P.buf > 0) {
    if (P.coyote > 0) {
      P.vy = -OM.ZIPLA; P.coyote = 0; P.buf = 0; P.ground = false; P.jumpT = 0; P.bounce = false; ustundeki = null; omSonUst = null;
      omSfx('jump'); burst(P.x, P.y, 6, OM_R.zipla, 60, 0.5, 5); OLAY.emit('ziplama', P);
    } else if (P.dj && P.vy > -OM.CIFT * 0.85 && !(P.vy > 0 && omYereYakin(P.vy * 0.1 + 4))) {   // yere çok yakınsa tampon: yerden zıplasın
      P.vy = -OM.CIFT; P.dj = false; P.buf = 0; P.jumpT = 0; P.flip = 1; P.bounce = false; omCagir('dragonPush', typeof dragonPush === 'function' ? dragonPush : null); OLAY.emit('ciftZiplama', P);
    }
  }
  P.buf -= dt;
  // yerçekimi: düşerken biraz ağır, bırakınca kısa zıplama (ama çok kısa basışta bile en az ~2.4 kare), tepede hafif süzülme
  const tutuyor = jumpHeld || P.jumpT < OM.MIN_BASILI || P.bounce;
  let grav = OM.YERCEKIM;
  if (P.vy > 0) { grav *= OM.DUSUS; P.bounce = false; }
  else if (!tutuyor) grav *= OM.BIRAK;
  if (Math.abs(P.vy) < 110 && !P.ground && (tutuyor || P.vy > 0)) grav *= OM.TEPE;
  P.vy = Math.min(P.vy + grav * dt, OM.MAXDUS);
  const ek = (!P.ground && P.vy > 40 && P.air > 0.08 && (Math.abs(axis) > 0.3 || (BOLUM_NO === 2 && jumpHeld))) ? omHavaYardim(Math.abs(axis) > 0.3 ? Math.sign(axis) : P.f) : 0;
  moveX((P.vx + ek) * dt); moveY(P.vy * dt);
  P.jumpT += dt; if (!P.ground) P.air += dt;
  omGuvenliYer();
  const gol = omGolde(P.x, 4);
  if (gol && P.y > gol.su + 22) omDusus(gol);
  else if (P.y > ROWS * T + 60) omDusus(false);
  // animasyon için ham değerler (feza.js kendi durum makinesini fezaUpdate'te kurar)
  const sp = Math.abs(P.vx);
  P.run += dt * (P.ground ? sp / 250 * 11.5 : 0);
  P.land = Math.max(0, P.land - dt * 4.5);
  P.lean = lerp(P.lean, P.ground ? clamp(P.vx / 250, -1, 1) * P.f : 0, 1 - Math.exp(-dt * 10));
  P.hairV += (-P.vy * 0.004 - P.hairY) * dt * 60; P.hairV *= Math.exp(-dt * 9); P.hairY += P.hairV * dt * 10;
  P.hairY = clamp(P.hairY, -4, 4);
  P.blinkT -= dt; if (P.blinkT < -0.12) P.blinkT = 2 + Math.random() * 3;
  P.idle = (sp < 5 && P.ground) ? P.idle + dt : 0;
  if (P.flip) { P.flip -= dt * 2.6; if (P.flip < 0) P.flip = 0; }
  if (P.ground && sp > 150 && Math.random() < dt * 9) parca(P.x - P.f * 6, P.y - 2, -P.f * 30, -25, 0.6, '#d8ccff', 5);
}
// Üstünde durulan cisim bu karede kaydı/büyüdüyse Feza'yı onunla taşı (cisimler kare başına bir kez güncellenir)
function omTasi() {
  const o = ustundeki;
  if (!o || !P.ground || P.fade > 0) return;
  const c = o.cisim;
  if (!c.aktif) { P.ground = false; ustundeki = null; omSonUst = null; return; }
  const top = o.y - c.h, ddx = o.x - omStandX, ddy = top - omStandY;
  omStandX = o.x; omStandY = top;
  if (!ddx && !ddy) return;
  if (Math.abs(ddx) > 60 || Math.abs(ddy) > 60) return;   // ışınlandı: taşıma
  let nx = omSimX + ddx;
  if (omKatiVar(nx, omSimY + ddy)) nx = omSimX;
  const mx = nx - omSimX;
  omSimX += mx; omSimY += ddy; omOncX += mx; omOncY += ddy; P.x += mx; P.y += ddy; omRX = P.x; omRY = P.y;
}

// ════════════════════ nesneler: kurulum, dokunma, güncelleme, çizim ════════════════════
const SAYAC = { cicek: 0, cicekTop: 0, tohum: 0, tohumTop: 0, pofuduk: 0, pofudukTop: 0, yildiz: 0, yildizTop: 0 };
function nesneleriKur() {
  for (const o of NESNELER) {
    const h = TUR.al(o.tip);
    if (h && typeof h.kur === 'function') { try { h.kur(o); } catch (e) { omHata(o.tip + '.kur', e); } }
    if (o.cisim) { CISIMLER.push(o); OM_CISIMDE.add(o); }
  }
  SAYAC.cicekTop = NESNELER.filter(o => o.tip === 'cicek').length;
  SAYAC.tohumTop = NESNELER.filter(o => o.tip === 'tohum').length;
  SAYAC.pofudukTop = NESNELER.filter(o => o.tip === 'pofuduk' || o.tip === 'buyukPofuduk').length;
  SAYAC.yildizTop = NESNELER.filter(o => o.tip === 'yildiz').length;   // Bölüm 2: uyandırılacak yıldızlar (kur() ile eklenenler yildiz.js'in işi; yildizTop sonradan da artırılabilir)
}
function nesneleriGuncelle(dt) {
  for (let i = 0; i < NESNELER.length; i++) {
    const o = NESNELER[i];
    const h = TUR.al(o.tip);
    if (h && typeof h.guncelle === 'function') { try { h.guncelle(o, dt); } catch (e) { omHata(o.tip + '.guncelle', e); } }
    if (o.cisim && !OM_CISIMDE.has(o)) { OM_CISIMDE.add(o); if (CISIMLER.indexOf(o) < 0) CISIMLER.push(o); }   // sonradan cisim kazanan nesne
    if (o.r && !o.dokundu && DURUM === 'oyun' && P.fade <= 0) {
      const dx = o.x - P.x, dy = (o.y - (o.ry || 0)) - (P.y - PH / 2);
      if (Math.abs(dx) < o.r && Math.abs(dy) < Math.max(o.r, 50)) {
        o.dokundu = true;
        if (h && typeof h.dokun === 'function') { try { h.dokun(o); } catch (e) { omHata(o.tip + '.dokun', e); } }
        OLAY.emit('dokun:' + o.tip, o);
      }
    }
  }
}
function nesneleriCiz(tm, katman) {   // katman: 'ciz' (Feza'nın arkası) | 'cizOn' (önü); dünya dönüşümü kurulu
  for (let i = 0; i < NESNELER.length; i++) {
    const o = NESNELER[i];
    const h = TUR.al(o.tip); if (!h || typeof h[katman] !== 'function') continue;
    if (o.x < cam.x - 500 || o.x > cam.x + VW + 500) continue;
    try { h[katman](o, tm); } catch (e) { omHata(o.tip + '.' + katman, e); g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); }
  }
}
// Varsayılan küçük davranışlar (modüller kendi TUR.kaydet'leriyle genişletir)
TUR.kaydet('konusma', { dokun(o) { if (o.anahtar && typeof SES !== 'undefined' && SES.soyle) SES.soyle(o.anahtar); } });
TUR.kaydet('cicek', { dokun(o) { if (o.done) return; o.done = true; bloom(o); } });
TUR.kaydet('tohum', { dokun(o) { o.done = true; SAYAC.tohum++; burst(o.x, o.y - 20, 20, OM_R.tohum, 140, 1.2, 7); omSfx('bloom'); OLAY.emit('tohum', o); } });
TUR.kaydet('agac', { dokun(o) {
  if (TREE.done) return;
  if (NESNELER.some(n => n.tip === 'buyukPofuduk' && !n.uyandi)) { o.dokundu = false; return; }
  TREE.done = true; lightTarget = 1; ripples.push({ x: o.x, y: o.y - 160, r: 0, life: 3 }); omCagir('dragonHappy', typeof dragonHappy === 'function' ? dragonHappy : null, o); omSfx('bloom', 1);
  // kontroller kapanır (parmak basılı kalsa da Feza tepeden yürüyüp gitmesin), basılı dokunuşlar bırakılır, Feza yumuşakça durur
  P.kilit = Math.max(P.kilit || 0, 4); omHepsiniBirak(); jumpPressed = false; P.buf = 0;
  OLAY.emit('agac', o);
  omBolumGecisi(o);   // Bölüm 1'in sonu: final yok; ışık göğe yükselir → kayıt → Bölüm 2
} });
function bloom(fl) {
  SAYAC.cicek++;
  lightTarget = Math.min(0.9, lightTarget + 0.85 / Math.max(1, SAYAC.cicekTop));
  ripples.push({ x: fl.x, y: fl.y - 14, r: 0, life: 2.2 });
  burst(fl.x, fl.y - 16, 26, OM_R.cicek, 170, 1.6, 7);
  omCagir('dragonHappy', typeof dragonHappy === 'function' ? dragonHappy : null, fl); omSfx('bloom'); OLAY.emit('cicek', fl);
}
OLAY.on('uyandi', () => { SAYAC.pofuduk++; });
OLAY.on('yildiz', o => { if (o && o.sayildi) return; if (o) o.sayildi = true; SAYAC.yildiz++; });   // yildiz.js uyandırınca bir kez yayınlar; sayaç burada
OLAY.on('hayvanFirlat', () => { omFirlatT = now; });
OLAY.on('hayvanUyandi', () => {   // Bölüm 2'nin sonu: yıldız hayvanı uyandı, gökyüzü doldu → sabah finali
  if (omFinalPlan || DURUM !== 'oyun') return; omFinalPlan = true;
  P.kilit = Math.max(P.kilit || 0, 4); omHepsiniBirak(); jumpPressed = false; P.buf = 0;
  omZamanla(3, finaleGec);
  setTimeout(() => { if (!document.hidden) finaleGec(); }, 4500);   // yedek: oyun saati geri kalırsa
});
// Sıradaki ana hedef (Pırıl yol gösterirken kullanır): açılmamış çiçek, yolu kapatan uyuyan Pofuduk, karanlık nokta,
// Büyük Pofuduk, ağaç. Çok geride (10 kareden fazla) kalan atlanmış hedefler, önde hedef varken sayılmaz.
function omHedefMi(o) {
  switch (o.tip) {
    case 'cicek': return !o.done;
    case 'buyukPofuduk': return !o.uyandi;
    case 'agac': return !(TREE && TREE.done);
    case 'yildiz': return !o.done && !o.secmeli;   // secmeli: isteğe bağlı/zor yıldız, Pırıl geri çağırmaz
    case 'yildizHayvan': return !o.uyandi && !NESNELER.some(n => n.tip === 'yildiz' && !n.done && !n.secmeli);   // hayvan: bütün yıldızlar uyanınca hedef
    case 'karanlik': return !o.dokundu;
    case 'pofuduk': return o.tur === 'yol' && !o.uyandi && o.y >= yuzey(Math.floor(o.x / T)) - 1;
  }
  return false;
}
function HEDEF() {
  if (omFinalPlan) return null;   // Bölüm 2: yıldız hayvanı uyandı, final yolda
  if (typeof TREE !== 'undefined' && TREE && TREE.done) return null;   // ağaç yandı: atlanmış çiçeğe geri çağırma yok
  let best = null, geri = null;
  const sinir = P.x - 10 * T;
  for (let i = 0; i < NESNELER.length; i++) { const o = NESNELER[i]; if (!omHedefMi(o)) continue;
    if (o.x >= sinir) { if (!best || o.x < best.x) best = o; }
    else if (!geri || o.x < geri.x) geri = o;
  }
  return best || geri;
}
function finaleGec() {
  if (DURUM !== 'oyun') return;
  omTamamYaz(BOLUM_NO);   // sabah finaline ulaşıldı: bu rüya tamamlandı (seçim ekranında altın yıldız)
  DURUM = 'final'; OLAY.emit('durum', DURUM);
  const bitir = () => { DURUM = 'son'; OLAY.emit('durum', DURUM); };
  if (typeof SAHNE !== 'undefined' && SAHNE && typeof SAHNE.final === 'function') { try { SAHNE.final(bitir, { bolum: BOLUM_NO }); } catch (e) { omHata('SAHNE.final', e); bitir(); } } else bitir();
}
// ── kayboldu: Feza ~8 sn hedefe yaklaşmazsa (ya da epey geri giderse ~5 sn) → Pırıl yol göstersin ──
const omKayip = { hedef: null, en: 0, t: 0 };
function omKayipKontrol(dt) {
  if (DURUM !== 'oyun' || P.fade > 0 || P.kilit > 0) return;
  const h = HEDEF();
  if (!h) return;
  const d = Math.abs(h.x - P.x) + Math.max(0, P.y - 40 - (h.y - (h.ry || 0))) * 0.5;
  if (h !== omKayip.hedef) { omKayip.hedef = h; omKayip.en = d; omKayip.t = 0; return; }
  if (d < omKayip.en - 30) { omKayip.en = d; omKayip.t = Math.min(omKayip.t, 0); }
  omKayip.t += dt;
  const lim = d > omKayip.en + 6 * T ? 5 : 8;
  if (omKayip.t > lim) { omKayip.t = -6; omKayip.en = d; OLAY.emit('kayboldu', h); }
}

// ════════════════════════════ kamera ════════════════════════════
// Yumuşak (kritik sönümlü) takip; bakış yönüne doğru ileri bakış; küçük ölü bölge; dikeyde son basılan zemine göre
// çerçeve (zıplarken kamera sallanmaz), yüksek zıplamalarda bant takibi; göl ve açıklıkta büyük anları çerçeveleme.
const cam = { x: 0, y: 0, zoom: 1 };
const omC = { x: 0, y: 0, vx: 0, vy: 0, bak: 0, odak: 0, tabanY: 0, sars: 0, sarsT: 0, sarsK: 1 };   // sarsK: sarsıntı genliği çarpanı
let omSdV = 0;
function omSD(cur, tgt, v, st, dt) {   // SmoothDamp; yeni hızı omSdV'ye yazar
  const om = 2 / st, x = om * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const ch = cur - tgt, tmp = (v + om * ch) * dt;
  omSdV = (v - om * tmp) * e;
  return tgt + (ch + tmp) * e;
}
function omBolgeAgirlik(x0, x1, x, pay) {   // bölgenin içinde 1, kenarlarında yumuşak geçiş
  return clamp(Math.min(x - x0 + pay, x1 + pay - x) / (pay * 2), 0, 1);
}
let omBuyuk = null;
// Bölgeye göre yakınlaştırma (BOLUM.kamera: {x0,x1,zoom,yOfs}); kenarlarda yumuşak geçiş
// Temel yakınlık: düz zeminde görünen dünya yüksekliği = VH / OM_TABAN_ZOOM. Bölge yakınlıkları (göl, açıklık...) bunun ÜSTÜNE
// çarpan olarak uygulanır. feza.js Feza'yı 1,4 kat büyüttüğü için (FZ_SC) 1'de Feza zaten ekranın ≈%14'ü (≈78 birim / 560);
// daha yakın (ör. VH/480) olunca ≈%16 olur ve ileriyi görme azalır. Tek ayar yeri burası.
const OM_TABAN_ZOOM = 1.12;   // iPad'de Feza ekranın ~%16'sı (5 yaşındaki için okunaklı)
const omZ = { z: OM_TABAN_ZOOM, v: 0, yo: 0, yv: 0 };
function omKameraIpucu(px) {
  let z = 1, yo = 0, wb = 0;
  const L = BOLUM.kamera;
  if (L) for (let i = 0; i < L.length; i++) { const k = L[i];
    const w = omBolgeAgirlik(k.x0, k.x1, px, 3 * T);
    if (w > wb) { wb = w; z = 1 + ((k.zoom || 1) - 1) * w; yo = (k.yOfs || 0) * w; }
  }
  // Açıklık: Işık Ağacı yakındayken (18 kare) taç ortası (ağacın ~300 birim üstü) ile Feza'nın bastığı zemin birlikte sığsın.
  // Gerekirse biraz daha uzaklaş (en çok 0,72'ye); zıplarken değişmesin diye son basılan zemine (tabanY) göre.
  omZ.agacW = 0;
  if (typeof TREE !== 'undefined' && TREE && !TREE.done) {
    const w = clamp(1 - (Math.abs(TREE.x - px) - 18 * T) / (6 * T), 0, 1);   // 18 kareye kadar tam, 24'te sıfır
    if (w > 0) {
      const gerek = (omC.tabanY - (TREE.y - OM_AGAC_TAC)) / 0.86;   // görünmesi gereken dünya yüksekliği
      const bu = omBuyuk && omBuyuk.tip === 'buyukPofuduk' && omBuyuk.uyandi;   // uyandıysa hedef artık ağaç: yuvadan da taç görünsün
      // yatayda da: Feza ağacın solundayken taç ortası (+100) ekranın sağ %80'ine sığsın (sola geri yürürken ağaç kaybolmasın)
      const gerekX = (TREE.x + 100 - px) / 0.8, zH = gerekX > 0 ? VH * (W / Math.max(H, 1)) / gerekX / OM_TABAN_ZOOM : 2;
      const zf = clamp(Math.min(VH / Math.max(gerek, 1) / OM_TABAN_ZOOM, zH), bu ? 0.6 : 0.72, 2);
      z = Math.min(z, lerp(z, zf, w)); omZ.agacW = w;
    }
  }
  omZ.hz = z * OM_TABAN_ZOOM; omZ.hy = yo;
}
const OM_AGAC_TAC = 300;
// Ölçek tek yerde: S ve VW kamera yakınlığından hesaplanır (resize de bunu çağırır)
function omOlcek() { S = H / VH * cam.zoom; VW = W / S; }

// ── Dikkat çerçevesi: önemli bir an olunca (Büyük Pofuduk'un aşamaları, ilk görünüşü, ağacın tacı, ışık nefesi, ilk Pofuduk)
// kamera birkaç saniye o şeyi Feza ile BİRLİKTE tam gösterecek biçimde yumuşakça uzaklaşır ve ona doğru bakar, sonra yavaşça
// normale döner. Kutu her karede yeniden hesaplanır (hareket eden şeyler). Finalde (ağaç yandı) kalıcıdır: yanan ağaç + Feza +
// kutlayan grup. Yakınlık yalnız uzaklaşabilir (en çok zMin'e kadar); finalde kutuya göre ayarlanır (en çok temel yakınlık).
const omDk = { fn: null, ad: '', bitis: 0, guc: 1, zMin: 0.66, w: 0, wv: 0, final: false, gorulen: {},
  x0: 0, x1: 0, y0: 0, y1: 0, fezaYok: false, cx: 0, cy: 0, zf: 1 };
function omDikkat(ad, sure, fn, guc, zMin) {
  if (omDk.final && ad !== 'final') return;
  if (omDk.fn && omDk.ad !== ad && now < omDk.bitis && (omDk.guc || 1) > (guc || 1)) return;   // daha güçlü bir an sürüyor
  omDk.fn = fn; omDk.ad = ad; omDk.bitis = now + sure; omDk.guc = guc || 1; omDk.zMin = zMin || 0.66;
}
function omDkEkle(x0, y0, x1, y1) {
  omDk.x0 = Math.min(omDk.x0, x0); omDk.x1 = Math.max(omDk.x1, x1); omDk.y0 = Math.min(omDk.y0, y0); omDk.y1 = Math.max(omDk.y1, y1);
}
let omBuyukO;   // undefined: henüz aranmadı (her karede find + kapanış olmasın)
function omBuyukBul() { if (omBuyukO === undefined) omBuyukO = NESNELER.find(n => n.tip === 'buyukPofuduk') || null; return omBuyukO; }
function omBuyukKutu(b) {   // Büyük Pofuduk'un gövdesi (≈200×200, uyurken de ayakta da) + üstündeki "z"ler için biraz pay
  if (!b) return;
  const p = b.pf, hy = p && isFinite(p.hy) ? p.hy : 0;
  omDkEkle(b.x - 120, b.y + hy - 230, b.x + 120, b.y + 12);
}
function omAgacKutu(tacPay) {   // ağacın gövdesi + tacının alt/orta kısmı (taç ≈540 birim yüksek, ≈800 geniş)
  if (typeof TREE === 'undefined' || !TREE) return;
  omDkEkle(TREE.x - 190, TREE.y - tacPay, TREE.x + 190, TREE.y + 20);
}
// Finalde: yanan ağaç + Feza + yakındaki kutlayanlar (küçük Pofuduklar, Pırıl, yanına konan Büyük Pofuduk)
function omFinalKutu() {
  if (typeof TREE === 'undefined' || !TREE) return;
  const fx = P.rx !== undefined ? P.rx : P.x, fy = P.ry !== undefined ? P.ry : P.y;
  const yakin = Math.abs(fx - TREE.x) < 520 && Math.abs(fy - TREE.y) < 160;
  omDk.fezaYok = !yakin;   // Feza ağaçtan uzaksa (olmamalı) ağaç önceliklidir
  if (!yakin) { omDk.x0 = omDk.x1 = TREE.x; omDk.y0 = omDk.y1 = TREE.y; }
  omAgacKutu(470);
  if (!yakin) return;
  for (let i = 0; i < NESNELER.length; i++) {
    const o = NESNELER[i];
    if (o.tip === 'pofuduk' && Math.abs(o.x - fx) < 380 && Math.abs(o.y - fy) < 140) omDkEkle(o.x - 36, o.y - 70, o.x + 36, o.y + 6);
    else if (o.tip === 'buyukPofuduk' && Math.abs(o.x - fx) < 420 && Math.abs(o.y - fy) < 60) omBuyukKutu(o);
  }
  if (typeof D !== 'undefined' && Math.abs(D.x - fx) < 360 && Math.abs(D.y - fy) < 300) omDkEkle(D.x - 34, D.y - 34, D.x + 34, D.y + 30);
}
// Kamera ipucuna dikkat çerçevesini uygula: hedef yakınlık (omZ.hz) ve dikey ofset; merkez stepCam'de
function omDikkatHesap(dt, snap, px, py) {
  const aktif = !!omDk.fn && (omDk.final || now < omDk.bitis);
  const hw = aktif ? clamp(omDk.guc, 0, 1) : 0;
  if (snap || !(dt > 0)) { omDk.w = hw; omDk.wv = 0; }
  else { omDk.w = omSD(omDk.w, hw, omDk.wv, aktif ? 0.5 : 0.85, dt); omDk.wv = omSdV; if (!aktif && omDk.w < 0.002) { omDk.w = 0; omDk.wv = 0; } }
  omDk.w = clamp(omDk.w, 0, 1);
  if (omDk.w <= 0 || !omDk.fn) { if (!aktif) omDk.fn = null; return; }
  // kutu: Feza (başı dahil) + andaki şeyler
  omDk.fezaYok = false;
  omDk.x0 = px - 50; omDk.x1 = px + 50; omDk.y0 = py - 100; omDk.y1 = py + 10;
  try { omDk.fn(); } catch (e) { omHataBildir('dikkat', e); omDk.fn = null; return; }
  if (omDk.ad === 'hayvan') {
    omDk.fezaYok = true;
    if (omFirlatT > 0 && now - omFirlatT > 0.9) {   // fırlatıldıktan sonra: kutu Feza + üstündeki gökyüzü (Feza küçük kalmasın, kenarda kesilmesin)
      omDk.x0 = px - 200; omDk.x1 = px + 200; omDk.y0 = py - 300; omDk.y1 = py + 40;   // Feza büyük görünsün (≥ ~65 px) omDk.fezaYok = false;
    }
  }   // hayvan sahnesi: Feza zorunlu kadraj değil; kutu (hayvan + gökyüzü) öncelikli
  const asp = W / Math.max(H, 1);
  const gen = omDk.x1 - omDk.x0 + 2 * 70, yuk = omDk.y1 - omDk.y0 + 50 + 45;   // kenar payları (altta biraz toprak)
  let zf = Math.min(VH / yuk, VH * asp / gen);
  if (omDk.final) zf = clamp(zf, 0.7, OM_TABAN_ZOOM);
  else if (omDk.ad === 'hayvan' && omFirlatT > 0 && now - omFirlatT > 0.9) zf = clamp(zf, 0.62, 1.0);   // fırlatma yayı: Feza'ya yaklaş (tabandan büyük de olabilir)
  else zf = clamp(Math.min(zf, omZ.hz), omDk.ad === 'hayvan' ? 0.6 : omDk.zMin, omZ.hz);   // hayvan sahnesinde (dikey ekran dahil) daha çok uzaklaşılabilir   // yalnız uzaklaş
  omDk.zf = zf;
  omDk.cx = (omDk.x0 + omDk.x1) / 2; omDk.cy = (omDk.y0 - 50 + omDk.y1 + 45) / 2;
  const w = smooth(omDk.w);
  omZ.hz = lerp(omZ.hz, zf, w); omZ.hy = lerp(omZ.hy, 0, w);
}
// olaylar → dikkat anları
OLAY.on('buyukAsama', e => {
  const b = e && e.o; if (!b) return;
  const sure = e.asama === 1 ? 3.2 : e.asama === 2 ? 3.6 : 2.6;
  omDk.gorulen.buyuk = true;
  omDikkat('buyuk' + e.asama, sure, () => omBuyukKutu(b), 1, 0.66);
  if (e.asama >= 3) omZamanla(2.4, () => {   // ayağa kalktı: şimdi de ağacın parlayan tacını göster
    if (DURUM !== 'oyun' || (typeof TREE !== 'undefined' && TREE && TREE.done)) return;
    omDikkat('agacGoster', 3.8, () => { omBuyukKutu(b); omAgacKutu(400); }, 1, 0.62);
  });
});
OLAY.on('konusma', e => {   // "Vay, ne kocaman bir Pofuduk!" söylenirken o da ekranda olsun
  if (!e || e.anahtar !== 'p_buyuk' || DURUM !== 'oyun') return;
  const b = omBuyukBul(); if (!b || b.pf && b.pf.asama > 0) return;
  omDk.gorulen.buyuk = true;
  omDikkat('buyuk0', Math.max(3, Math.min(5, (e.sure || 3) + 0.8)), () => omBuyukKutu(b), 1, 0.62);
});
OLAY.on('dokun:konusma', o => {   // tetik noktası (ses kapalıyken de): Büyük Pofuduk'u ilk kez göster
  if (o && o.anahtar === 'p_buyuk') omIlkGorus(-1);
});
OLAY.on('nefes', e => {   // Pırıl'ın ışık nefesi: Pırıl + ilk nilüferler (ve adacık) Feza ile birlikte, hafifçe
  if (!e || e.asama !== 'al' || DURUM !== 'oyun' || omDk.gorulen.nefes) return;
  omDk.gorulen.nefes = true;
  omDikkat('nefes', 5.2, () => {
    const fx = P.rx !== undefined ? P.rx : P.x;
    if (typeof D !== 'undefined') omDkEkle(D.x - 40, D.y - 40, D.x + 40, D.y + 30);
    for (const o of NESNELER) if (o.tip === 'nilufer' && o.x > fx - 100 && o.x < fx + 560) omDkEkle(o.x - 40, o.y - 30, o.x + 40, o.y + 20);
  }, 0.75, 0.8);
});
OLAY.on('uyandi', o => {   // ilk Pofuduk uyanınca: kısa ve hafif
  if (!o || o.tip !== 'pofuduk' || omDk.gorulen.ilkPof || DURUM !== 'oyun') return;
  omDk.gorulen.ilkPof = true;
  omDikkat('ilkPof', 2.2, () => omDkEkle(o.x - 50, o.y - 90, o.x + 50, o.y + 8), 0.6, 0.9);
});
// Bölüm 2 kameraları: yıldız uyanınca kısa süre göğe bakış (yerleşmeyi göster; kontrol kilitlenmez); yıldız hayvanı sahnesinde hayvan + Feza + gökyüzü
OLAY.on('yildiz', o => {
  if (DURUM !== 'oyun' || omDk.final) return;
  omDikkat('gok', 3.4, () => { omDkEkle(omDk.x0 - 120, omDk.y0 - 330, omDk.x1 + 120, omDk.y1); }, 0.55, 0.62);
});
function omHayvanSahne(e) {
  const o = e && (e.o || e); if (!o || DURUM !== 'oyun' || typeof o.x !== 'number') return;
  omDikkat('hayvan', 6, () => { omDkEkle(o.x - 330, o.y - 360, o.x + 330, o.y + 20); omDkEkle(omDk.x0, omDk.y0 - 200, omDk.x1, omDk.y1); }, 1, 0.5);
}
// (hayvan sahnesi kamerası yildiz.js'te ylDikkat ile; omHayvanSahne yedek, bağlanmadı)
OLAY.on('agac', () => { omDk.final = false; omDikkat('final', 1e9, omFinalKutu, 1, 0.7); omDk.final = true; });
// Büyük Pofuduk ilk kez görüş alanına girerken (henüz uyurken) bir kez. Merkezinden 34 kare önce başlar ("Vay, ne kocaman
// bir Pofuduk!" ≈20 karede tetiklenir): kamera kayıp uzaklaşırken söz başladığında o zaten ekranda olsun.
const OM_BUYUK_GORUS = 34;
function omIlkGorus(px) {
  if (omDk.gorulen.buyuk || DURUM !== 'oyun') return;
  const b = omBuyukBul(); if (!b) return;
  if (px < 0 || (px > b.x - OM_BUYUK_GORUS * T && px < b.x)) { omDk.gorulen.buyuk = true; omDikkat('buyukGorus', 4.2, () => omBuyukKutu(b), 1, 0.62); }
}
function stepCam(dt, snap) {
  const px = P.rx !== undefined ? P.rx : P.x;
  let py = P.ry !== undefined ? P.ry : P.y;
  // suya düştü / Pırıl onu yakalamak üzere: kamera aşağı dalmasın, son görünen yerde beklesin
  if (P.fade > 0 && py > ROWS * T - 20 && !snap && omC.sonPy !== undefined) py = omC.sonPy; else omC.sonPy = py;
  omKameraIpucu(px);
  omIlkGorus(px);
  omDikkatHesap(dt, snap, px, py);
  if (snap || !(dt > 0)) { omZ.z = omZ.hz; omZ.v = 0; omZ.yo = omZ.hy; omZ.yv = 0; }
  else {
    omZ.z = omSD(omZ.z, omZ.hz, omZ.v, omDk.w > 0.02 ? 0.6 : 0.9, dt); omZ.v = omSdV;   // dikkat anında biraz daha çabuk
    if (Math.abs(omZ.z - omZ.hz) < 0.0005 && Math.abs(omZ.v) < 0.001) { omZ.z = omZ.hz; omZ.v = 0; }   // dururken ölçek sabit kalsın (önbellekler)
    omZ.yo = omSD(omZ.yo, omZ.hy, omZ.yv, 0.9, dt); omZ.yv = omSdV;
  }
  // kamera merkezini koruyarak yakınlaştır (ekran ortası aynı dünya noktasında kalsın)
  if (cam.zoom !== omZ.z) {
    const eVW = VW, eVH = VH / cam.zoom;
    cam.zoom = omZ.z; omOlcek();
    const gVH = VH / cam.zoom;
    omC.x += (eVW - VW) / 2; omC.y += (eVH - gVH) / 2;
  }
  const VHg = VH / cam.zoom;   // görünen dünya yüksekliği
  // ileri bakış: yüz yönü + hız; yavaş dönsün ki yön değiştirince ekran savrulmasın
  const sp = clamp(P.vx / OM.KOS, -1, 1);
  const asp0 = W / Math.max(H, 1), pfy = clamp((1.2 - asp0) / 0.5, 0, 1);   // pfy: dikey (portre) ekran ağırlığı
  const bakHedef = P.f * (46 + VW * 0.17 * pfy) + sp * (64 + VW * 0.1 * pfy);   // portrede dar görüş: daha çok ileri bak (Feza kenara yapışmasın)
  omC.bak = snap ? bakHedef : lerp(omC.bak, bakHedef, 1 - Math.exp(-dt * (Math.abs(sp) > 0.3 ? 1.6 : 0.7)));
  let odak = px + omC.bak;
  // bölgeye göre çerçeve: gölde karşı kıyı / nilüferler, açıklıkta Büyük Pofuduk ve ağaç görünsün
  const GL = omGollar();
  for (let i = 0; i < GL.length; i++) {
    const gol = GL[i];
    const w = omBolgeAgirlik(gol.x0 - 3 * T, gol.x1, px, 4 * T) * 0.3;
    if (w > 0) { odak = lerp(odak, (gol.x0 + gol.x1) / 2, w); break; }
  }
  if (!omBuyuk) omBuyuk = NESNELER.find(n => n.tip === 'buyukPofuduk') || TREE || null;
  for (let i = 0; i < BOLUM.bolgeler.length; i++) { const b = BOLUM.bolgeler[i]; if (!(b.ad === 'aciklik' && omBuyuk && px > b.x0 - 4 * T)) continue;
    const hedefX = omBuyuk.uyandi && TREE ? (omBuyuk.x + TREE.x) / 2 : omBuyuk.x;
    const w = clamp((px - (b.x0 - 4 * T)) / (8 * T), 0, 1) * 0.32 * clamp(1 - (px - hedefX) / (8 * T), 0, 1);
    // çekiş Feza'yı sol kenara itmesin: en çok ekranın ~%28'ine kadar (geri dönüp kaçan çiçeği alacak yer kalsın)
    if (w > 0) odak = Math.min(lerp(odak, hedefX, w), Math.max(odak, px + VW * 0.22));
  }
  // küçük ölü bölge (dururken minik oynamalar kamerayı kıpırdatmasın)
  if (snap) omC.odak = odak;
  else if (odak > omC.odak + 14) omC.odak = odak - 14; else if (odak < omC.odak - 14) omC.odak = odak + 14;
  const maxX = Math.max(0, COLS * T - VW);
  let tx = clamp(omC.odak - VW / 2, 0, maxX);
  // açıklıkta ağacın tacı çerçevede kalsın (sola geri yürürken de): Feza sol kenara ekranın %20'sinden fazla yaklaşmadan kamerayı sağa it.
  // Ağaca 18 kareden yakınken tam, 24 karede sıfır; ağaç yanınca final çerçevesi devralır.
  if (typeof TREE !== 'undefined' && TREE && !TREE.done && DURUM === 'oyun') {
    const wT = clamp(1 - (Math.abs(TREE.x - px) - 18 * T) / (6 * T), 0, 1);
    const gerek = TREE.x + 100 - VW;   // tacın ortası + biraz pay ekranda
    if (wT > 0 && tx < gerek) tx = lerp(tx, Math.min(gerek, Math.max(tx, px - VW * 0.2)), wT);
  }
  // dikey: son basılan zemine göre (zıplarken kamera sabit kalır), bantların dışına çıkınca takip
  if ((P.ground && P.fade <= 0) || snap) omC.tabanY = py;
  else if (py > omC.tabanY) omC.tabanY = py;   // aşağı düşüyor
  // düz zeminde ayaklar ekranın ~%76'sında: üstte bol orman/gökyüzü, altta az toprak
  const ust = VHg * 0.32, alt = VHg * 0.87, yMax = ROWS * T - VHg + 8;
  let ty = omC.tabanY - VHg * lerp(0.76, 0.82, pfy) + omZ.yo, st = P.ground ? 0.42 : 0.5;
  if (py - ty < ust) { ty = py - ust; st = 0.2; }
  if (py - ty > alt) { ty = py - alt; st = 0.14; }
  if (omZ.agacW > 0 && TREE) ty = Math.min(ty, lerp(ty, Math.max(TREE.y - OM_AGAC_TAC - 40, omC.tabanY - VHg * 0.86), omZ.agacW));   // ağacın tacı görünsün
  // dikkat çerçevesi: kutunun ortasına bak; kutu sığmadıysa özne öncelikli, ama Feza ekranda kalır
  const dw = omDk.w > 0 ? smooth(omDk.w) : 0;
  if (dw > 0) {
    let dx = omDk.cx - VW / 2, dy = omDk.cy - VHg / 2;
    if (!omDk.fezaYok) { dx = clamp(dx, px - VW * 0.93, px - VW * 0.07); dy = clamp(dy, py - VHg * 0.9, py - 100 - VHg * 0.04); }
    tx = lerp(tx, clamp(dx, 0, maxX), dw); ty = lerp(ty, dy, dw); st = Math.max(st, lerp(st, 0.45, dw));
  }
  ty = clamp(ty, -40, yMax);
  if (snap) { omC.x = tx; omC.y = ty; omC.vx = omC.vy = 0; }
  else if (dt > 0) {
    omC.x = omSD(omC.x, tx, omC.vx, 0.3, dt); omC.vx = omSdV;
    omC.y = omSD(omC.y, ty, omC.vy, st, dt); omC.vy = omSdV;
    // Feza asla ekran kenarına çok yaklaşmasın (hızlı sekmelerde)
    if (!(dw > 0 && omDk.fezaYok)) {   // (finalde Feza ağaçtan uzaksa ağaç öncelikli)
      const kp = lerp(0.18, 0.06, dw), kx0 = px - VW * (1 - kp), kx1 = px - VW * kp;
      if (omC.x < kx0) omC.x = kx0; else if (omC.x > kx1) omC.x = kx1;
      const ky0 = py - VHg * 0.94, ky1 = py - VHg * 0.22;
      if (omC.y < ky0) omC.y = ky0; else if (omC.y > ky1) omC.y = ky1;
    }
  }
  omC.x = clamp(omC.x, 0, maxX); omC.y = clamp(omC.y, -40, yMax);
  // sarsıntı: Büyük Pofuduk sekmesinde (sarsK 1) ve sevinç zıplamasının inişinde ('sarsinti', daha hafif); minik ve yumuşak
  let sx = 0, sy = 0;
  if (omC.sars > 0) {
    omC.sars = Math.max(0, omC.sars - dt * 2.2); omC.sarsT += dt;
    const a = omC.sars * omC.sars * 7 * omC.sarsK;
    sx = a * 0.35 * (Math.sin(omC.sarsT * 53) + Math.sin(omC.sarsT * 31.7) * 0.6);
    sy = a * (Math.sin(omC.sarsT * 41) + Math.sin(omC.sarsT * 27.3) * 0.5);
  }
  cam.x = omC.x + sx; cam.y = omC.y + sy;
  if (omAcilis) { const u = now - omAcilis.t0 - 0.5; cam.y -= 100 * (1 - smooth(clamp(u / 3.6, 0, 1))); }   // Bölüm 2 açılışı: kamera suyun üstünden kıyıya iner
}
OLAY.on('ziplatti', o => { if (o && o.tip === 'buyukPofuduk') { omC.sars = 1; omC.sarsT = 0; omC.sarsK = 1; } });
// Büyük Pofuduk'un sevinç zıplaması yere inince (pofuduk.js): {guc 0..1}. guc 0,5 → en çok ≈6 birim, ≈0,45 sn, sönerek.
// Daha güçlü bir sarsıntı sürüyorsa ona dokunmaz.
OLAY.on('sarsinti', e => {
  const k = Math.min(0.55, clamp(e && isFinite(e.guc) ? e.guc : 0.5, 0, 1) * 1.1);
  if (omC.sars * omC.sars * omC.sarsK > k) return;
  omC.sars = 1; omC.sarsT = 0; omC.sarsK = k;
});

// Pırıl'ın ortam ışığı: onun ARKASINDA (drawDragon'dan önce) çizilir, yoksa onu pembeye boyar
function omPirilHale() {
  g.globalCompositeOperation = 'lighter';
  dglow('#b88aff', D.x, D.y, 150, 0.24);
  dglow('#ffe0ff', D.x, D.y, 40, 0.11);
  g.globalCompositeOperation = 'source-over';
}
function drawFx(tm, dt) {
  g.globalCompositeOperation = 'lighter';
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life -= dt;
    if (p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); if (p.havuz === true && partsHavuz.length < 400) partsHavuz.push(p); continue; }   // sırası önemsiz: kaydırmadan sil; nesne havuza
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-dt * 2); p.vy = p.vy * Math.exp(-dt * 2) - 10 * dt;
    if (p.x < cam.x - 60 || p.x > cam.x + VW + 60 || p.y < cam.y - 60 || p.y > cam.y + VH / cam.zoom + 60) continue;
    const a = p.life / p.max;
    dglow(p.col, p.x, p.y, p.size * (0.6 + a), a * 0.6);
  }
  // halkalar: sabit renk + globalAlpha (her halkada yeni renk dizesi yok; görüntü aynı)
  if (ripples.length) g.strokeStyle = 'rgb(255,226,240)';
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]; r.life -= dt; r.r += dt * (r.small ? 160 : 260);
    if (r.life <= 0 || (!r.small && r.r > 420)) { ripples.splice(i, 1); continue; }
    if (r.r <= 0) continue;
    g.globalAlpha = Math.min(0.5, r.life * 0.3) * (r.small ? 1 : 1 - r.r / 420); g.lineWidth = r.small ? 2 : 10 * (1 - r.r / 420) + 1;
    g.beginPath(); g.arc(r.x, r.y, r.r, 0, 6.283); g.stroke();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// ════════════════════════════ döngü ════════════════════════════
// ════════════════════ çözünürlük (tuval yoğunluğu) ════════════════════
// DPR = tuvalin CSS pikseli başına piksel sayısı (W = innerWidth × DPR; tuval CSS'te hep tam ekran). Cihaz ekranın yenileme
// hızını tutturamıyorsa yoğunluk basamak basamak düşer (2 → 1,75 → 1,5 → 1,25; daha aşağı değil), uzun süre bol pay varsa bir
// basamak geri çıkar. Değişiklik yalnız sakin anda olur (oyunda, Feza yerde, dikkat çerçevesi / sahne anı yok). Çıkıp kısa
// sürede geri düşülen basamak bir süre (her seferinde iki katı) denenmez, ikinci kezde hiç: gidip gelme olmaz.
// 12,9" iPad Pro gibi çok büyük ekranlar 1,75'ten başlar. ?dpr=x → sabit yoğunluk (test; uyarlama kapalı).
// W, H, DPR, S, VW tek yerden kurulur: omBoyutla → omOlcek; sonra OLAY 'boyut' (modüller önbelleklerini yeniler).
// Cihaz profili: dokunmatik (iPad, telefon) → yoğunluk en çok 1,5 (biraz yumuşak, serin ve pil dostu), en çok 60 kare/sn.
// Masaüstü (dokunmatik yok, fare) → monitörün gerçek çözünürlüğü (devicePixelRatio, en çok 3), ekran izin verirse 120 kare/sn.
// ?cihaz=pc | ?cihaz=tablet → profili zorla (test).
const OM_MASA = (() => {
  const z = Q.get('cihaz'); if (z === 'pc') return true; if (z === 'tablet') return false;
  let ince = false; try { ince = matchMedia('(pointer: fine)').matches && !matchMedia('(any-pointer: coarse)').matches; } catch (_) { /* yoksay */ }
  return ince && !(navigator.maxTouchPoints > 0);
})();
const OM_TABLET_TAVAN = 1.5, OM_MASA_TAVAN = 3;
const OM_COZ = {
  BASAMAK: [2, 1.75, 1.5, 1.25],
  BUYUK_EKRAN: 5.2e6,   // fiziksel piksel ≥ bu (12,9" iPad Pro 2732×2048 = 5,6 MP) → 1,75'ten başla
  PENCERE: 2,           // ölçüm penceresi (oyun saniyesi)
  ASAGI: 1.2,           // pencerenin ortalama kare aralığı > yenileme × 1,2 → zorlanan pencere
  ASAGI_N: 2,           // art arda bu kadar zorlanan pencere → bir basamak düş
  RAHAT_ARALIK: 1.04,   // rahat pencere: ortalama aralık ≤ yenileme × 1,04 ...
  RAHAT_JS: 0.35,       // ... ve karenin JS süresi ≤ yenileme × 0,35
  YUKARI_N: 8,          // art arda bu kadar rahat pencere (≈16 sn) → bir basamak çık
  BEKLE: 4,             // açılış, durum değişimi, sekmeye dönüş, yoğunluk değişiminden sonra bu kadar sn ölçme
  YASAK: 90,            // çıkıp 30 sn içinde geri düşülen basamak bu kadar sn denenmez (2. kezde hiç)
};
const omCoz = { taban: 1, liste: [1], i: 0, dpr: 1, zorla: 0, ilk: true, yenileme: 0, bekleT: 0, bekleyen: -1, neden: '',
  pT: 0, pN: 0, pAralik: 0, pJs: 0, kotuN: 0, rahatN: 0, yukariT: -1e9, yasak: {}, hata: {}, log: [],
  hz: new Float32Array(90), hzN: 0, hzMin: 1e9, sonMs: -1, uygula: false };
{ const z = parseFloat(Q.get('dpr')); if (z > 0) omCoz.zorla = clamp(z, 0.5, 3); }
function omCozLog(m) { const s = '[çözünürlük] ' + m; omCoz.log.push((now || 0).toFixed(1) + ' ' + s); if (omCoz.log.length > 60) omCoz.log.shift(); console.info(s); }
function omCozSifirla() { omCoz.pT = omCoz.pN = omCoz.pAralik = omCoz.pJs = 0; omCoz.kotuN = omCoz.rahatN = 0; omCoz.bekleT = now + OM_COZ.BEKLE; omCoz.sonMs = -1; }
// Basamak listesi ve başlangıç (resize'da da çağrılır; o anki basamak korunur)
function omCozSec() {
  omCoz.taban = Math.min(OM_MASA ? OM_MASA_TAVAN : OM_TABLET_TAVAN, window.devicePixelRatio || 1);
  if (omCoz.zorla) { omCoz.liste = [omCoz.zorla]; omCoz.i = 0; omCoz.dpr = omCoz.zorla; return; }
  const L = OM_COZ.BASAMAK.filter(v => v < omCoz.taban - 1e-6);   // taban her zaman ilk basamak (ör. 1, 1,5 ya da masaüstünde 2,25)
  L.unshift(omCoz.taban);
  const once = omCoz.liste[omCoz.i];
  omCoz.liste = L;
  if (omCoz.ilk) {
    omCoz.ilk = false;
    let px = innerWidth * innerHeight;
    try { if (screen && screen.width) px = Math.max(px, screen.width * screen.height); } catch (_) { /* yoksay */ }
    px *= omCoz.taban * omCoz.taban;
    omCoz.i = 0;
    if (!OM_MASA && px >= OM_COZ.BUYUK_EKRAN) { const k = L.indexOf(1.75); if (k > 0) omCoz.i = k; }
  } else {
    let k = 0; while (k < L.length - 1 && L[k] > once + 1e-6) k++;
    omCoz.i = k;
  }
  omCoz.dpr = L[omCoz.i];
}
function omBoyutla() {
  DPR = omCoz.dpr;
  W = Math.round(innerWidth * DPR); H = Math.round(innerHeight * DPR);
  cv.width = W; cv.height = H; omOlcek();
  if (typeof skyLight !== 'undefined') skyLight = -1;
  if (typeof grainPat !== 'undefined') grainPat = null;
  dugmeYeri();
  OLAY.emit('boyut', { W, H, DPR });
}
function resize() { omCozSec(); omBoyutla(); }
// Ekranın yenileme aralığı (ms): son 90 kare aralığının alt çeyreği; bilinen değerlere (144/120/90/60/30 Hz) oturtulur.
// Görülen en kısa değer tutulur (yavaş başlangıç kareleri yanıltmasın).
const OM_HZ = [1000 / 144, 1000 / 120, 1000 / 90, 1000 / 75, 1000 / 60, 1000 / 50, 1000 / 30];
function omCozHz(d) {
  const c = omCoz;
  c.hz[c.hzN++] = d;
  if (c.hzN < c.hz.length) return;
  c.hzN = 0;
  c.hz.sort();
  let p = c.hz[(c.hz.length / 4) | 0];
  for (let i = 0; i < OM_HZ.length; i++) if (Math.abs(p - OM_HZ[i]) < OM_HZ[i] * 0.1) { p = OM_HZ[i]; break; }
  if (p < 1000 / 120) p = 1000 / 120;   // 120 Hz'ten hızlı ekranda (ya da sınırsız rAF) hedef en çok 120 kare/sn
  if (p < c.hzMin) { c.hzMin = p; c.yenileme = p; }
}
// Her karede (omDongu): ms = rAF zamanı, js = frame() süresi (ms)
function omCozOlc(ms, js) {
  const c = omCoz;
  const d = c.sonMs < 0 ? -1 : ms - c.sonMs; c.sonMs = ms;
  if (!(d > 0) || d > 250 || document.hidden) return;
  omCozHz(d);
  if (c.zorla || c.liste.length < 2 || !c.yenileme) return;
  if (DURUM !== 'oyun' || now < c.bekleT) return;
  if (c.bekleyen >= 0) { if (omCozSakin()) c.uygula = true; return; }   // karar verildi: sakin anı bekle (ölçme yok); değişim sonraki karenin başında (tuval silinmesin)
  const y = OM_MASA ? c.yenileme : Math.max(c.yenileme, 1000 / 60);   // tablet: hedef 60 fps · masaüstü: ekranın hızı (en çok 120)
  c.pAralik += Math.min(d, y * 4); c.pJs += js; c.pN++; c.pT += d / 1000;
  if (c.pT < OM_COZ.PENCERE) return;
  const ort = c.pAralik / c.pN, ortJs = c.pJs / c.pN;
  c.pT = c.pN = c.pAralik = c.pJs = 0;
  const kotu = ort > y * OM_COZ.ASAGI, rahat = ort <= y * OM_COZ.RAHAT_ARALIK && ortJs <= y * OM_COZ.RAHAT_JS;
  c.kotuN = kotu ? c.kotuN + 1 : 0; c.rahatN = rahat ? c.rahatN + 1 : 0;
  const bilgi = 'ort ' + ort.toFixed(1) + ' ms, js ' + ortJs.toFixed(1) + ' ms, yenileme ' + y.toFixed(1) + ' ms';
  if (c.kotuN >= OM_COZ.ASAGI_N && c.i < c.liste.length - 1) { c.bekleyen = c.i + 1; c.neden = 'zorlanıyor (' + bilgi + ')'; }
  else if (c.rahatN >= OM_COZ.YUKARI_N && c.i > 0) {
    const k = c.i - 1, yasak = c.yasak[k] || 0;
    if (now >= yasak) { c.bekleyen = k; c.neden = 'bol pay (' + bilgi + ')'; } else c.rahatN = 0;
  }
}
// Sakin an: oyunda, Feza yerde ve kontrolde, kamera dikkat çerçevesinde değil, ağaç yanmamış
function omCozSakin() {
  return DURUM === 'oyun' && P.ground && !(P.fade > 0) && !(P.kilit > 0) && !omDk.fn && omDk.w === 0 &&
    !(typeof TREE !== 'undefined' && TREE && TREE.done);
}
function omCozUygula() {
  const c = omCoz, k = c.bekleyen, eski = c.dpr;
  c.bekleyen = -1;
  if (k < 0 || k >= c.liste.length || k === c.i) return;
  if (k > c.i && now - c.yukariT < 30) {   // az önce çıkılan basamak tutmadı: bir süre (sonra hiç) deneme
    const n = c.hata[c.i] = (c.hata[c.i] || 0) + 1;
    c.yasak[c.i] = n >= 2 ? Infinity : now + OM_COZ.YASAK;
  }
  if (k < c.i) c.yukariT = now;
  c.i = k; c.dpr = c.liste[k];
  omCozLog(eski + ' → ' + c.dpr + ': ' + c.neden);
  omBoyutla();
  omCozSifirla();
}
addEventListener('resize', resize); resize();
OLAY.on('durum', () => omCozSifirla());
nesneleriKur();
// sabit adım durumu: önceki adım (omOnc), fizik (omSim), çizim (omR) konumları
let omAcc = 0, omOncX = P.x, omOncY = P.y, omSimX = P.x, omSimY = P.y, omRX = P.x, omRY = P.y, omSonT = -1, omHiz = 1;
function omIsinla() { omOncX = P.x; omOncY = P.y; }
P.rx = P.x; P.ry = P.y; P.air = 0; P.bounce = false;
stepCam(0, true);
// Oyun saati: duvar saati değil, kare kare biriken (en çok 0,1 sn) süre → sekme gizlenip dönünce zaman sıçramaz;
// `now` ve çizimlere giden `t` bu saattir. Oyun içi gecikmeler de (omZamanla) bu saatle işler, duraklamada bekler.
let omOyunT = -1, omSahneHataT = 0;
const omZamanlar = [];
function omZamanla(sn, fn) { omZamanlar.push({ t: (omOyunT < 0 ? now : omOyunT) + sn, fn }); }
// Feza'nın çizimi (feza.js) hata verirse / yüklenemediyse: kaybolmasın, sade bir yedek siluet çizilir (dünya dönüşümünde)
function omYedekFeza() {
  if (P.fade > 0 && !P.respawned) return;
  const x = P.rx !== undefined ? P.rx : P.x, y = P.ry !== undefined ? P.ry : P.y, f = P.f || 1;
  g.fillStyle = '#5b6fd6'; g.beginPath(); g.ellipse(x, y - 22, 12, 20, 0, 0, 6.283); g.fill();          // pijama
  g.fillStyle = '#f3c9a8'; g.beginPath(); g.arc(x + f * 2, y - 50, 13, 0, 6.283); g.fill();           // yüz
  g.fillStyle = '#3a2618'; g.beginPath(); g.arc(x - f * 2, y - 55, 13, 3.3, 6.1); g.fill();            // saç
  g.fillStyle = '#20140c'; g.beginPath(); g.arc(x + f * 7, y - 50, 1.8, 0, 6.283); g.fill();          // göz
}

// ════════════════════ bölümler: çizim yönlendirme, geçiş (1→2), devam girişi ════════════════════
// Bölüm 2'de dunya.js yerine dunya2.js (dn2Background dn2World dn2Foreground dn2Motes dn2Petals dn2Vignette; aynı parametreler).
// dunya2.js ya da işlev yoksa güvenli geri dönüş: arka planda düz gece rengi, diğerleri boş.
const OM_DR1 = { Background: 'drawBackground', World: 'drawWorld', Foreground: 'drawForeground', Motes: 'drawMotes', Petals: 'drawPetals', Vignette: 'drawVignette' };
function omDn2Yedek(tm) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#0b1a33'; g.fillRect(0, 0, W, H); }
const omDrOnb = {};
function omDr(ad) {   // çağrı anında seçilir (dunya2.js sonradan tanımlanmış olabilir)
  if (BOLUM_NO !== 2) { const f = globalThis[OM_DR1[ad]]; return typeof f === 'function' ? f : null; }
  const f2 = globalThis['dn2' + ad];
  if (typeof f2 === 'function') return f2;
  return ad === 'Background' ? omDn2Yedek : null;
}
// geçiş / giriş perdesi (ekran kararması): a 0..1, koyu gece mavisi
const omPerde = { a: 0, hedef: 0, hiz: 0.5 };
function omPerdeCiz(dt) {
  if (omPerde.a !== omPerde.hedef) {
    const d = omPerde.hiz * dt; omPerde.a = omPerde.a < omPerde.hedef ? Math.min(omPerde.hedef, omPerde.a + d) : Math.max(omPerde.hedef, omPerde.a - d);
  }
  if (omPerde.a <= 0.002) return;
  const e = omPerde.a * omPerde.a * (3 - 2 * omPerde.a);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = e; g.fillStyle = '#050a18'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
}
// kayıt: 'fezaIsikTamam' (JSON dizi), 'fezaIsikSon'; eski anahtarlar göç: Bitti1 / Bolum=2 → [1] tamam
function omTamamOku() {
  try {
    let a = JSON.parse(localStorage.getItem('fezaIsikTamam') || '[]'); if (!Array.isArray(a)) a = [];
    if ((localStorage.getItem('fezaIsikBitti1') === '1' || localStorage.getItem('fezaIsikBolum') === '2') && a.indexOf(1) < 0) a.push(1);
    return a;
  } catch (e) { return []; }
}
function omTamamYaz(n) { try { const a = omTamamOku(); if (a.indexOf(n) < 0) { a.push(n); localStorage.setItem('fezaIsikTamam', JSON.stringify(a)); } } catch (e) {} }
// başlık = seçim sahnesi (SAHNE.secim): rüya baloncukları; seçilince Bölüm 1 hemen, Bölüm 2 oturum bayrağı + yenileme ile
let omSecimAktif = false;
function omSecimBaslat() {
  const tamam = omTamamOku(); let son = 0; try { son = +localStorage.getItem('fezaIsikSon') || 0; } catch (e) {}
  const sec = [{ id: 1, ikon: 'orman', tamam: tamam.indexOf(1) >= 0, son: son === 1 }, { id: 2, ikon: 'gol', tamam: tamam.indexOf(2) >= 0, son: son === 2 }];
  omSecimAktif = true;
  try { SAHNE.secim(sec, omSecildi); } catch (e) { omSecimAktif = false; omHataBildir('SAHNE.secim', e); }
}
function omSecildi(id) {
  if (!omSecimAktif) return; omSecimAktif = false;
  if (+id === 2) { try { sessionStorage.setItem('fezaIsikSec', '2'); } catch (e) {} try { location.replace(location.href.split('#')[0]); } catch (e) { location.reload(); } }
  else begin();
}
// Bölüm 1 sonu (Tur 3: "her gece başka bir rüya"): Işık Ağacı yandı → kısa kutlama (ışık küreleri göğe yükselir) → sabah finali.
// Bölüm geçişi/yeniden yükleme yok; sonuç kartından "odaya dön" ile seçim ekranına dönülür.
function omBolumGecisi(o) {
  if (omGecis || BOLUM_NO === 2) return;
  const x = o ? o.x : P.x, y = o ? o.y : P.y;
  omGecis = { t0: now, x, y, kapat: false, bitti: false, sure: 0 };
  OLAY.emit('bolumGecis', o || null);
  omZamanla(2.6, finaleGec);   // oyun saatiyle: sekme gizliyken beklesin
  setTimeout(() => { if (!document.hidden) finaleGec(); }, 3200);   // yedek: cihaz yavaşsa oyun saati geri kalır
}
function omYenidenYukle() {
  if (!omGecis || omGecis.bitti) return; omGecis.bitti = true;
  try { sessionStorage.setItem('fezaGecis', '1'); } catch (e) {}
  const q = new URLSearchParams(location.search); q.set('bolum', '2');
  if (Q.has('nogecis')) return;   // yalnız test: yeniden yüklemeden dur
  try { location.replace(location.pathname + '?' + q.toString()); } catch (e) { location.reload(); }
}
// ── geçiş görselleri ──
// Gece örtüsü (ekran): sahne gece mavisine döner, gökte yalnız sönük noktalar ("yıldız yok"); kayan yıldız göle düşer.
const OM_SONUK = Array.from({ length: 22 }, (_, i) => [((i * 0.6180339) % 1) * 0.92 + 0.04, ((i * 0.3819660 + 0.13 * (i % 3)) % 1) * 0.5 + 0.04, 1 + (i % 3) * 0.6, i * 1.7]);
function omGecisEkran() {
  const G = omGecis; if (!G) return;
  const u = now - G.t0;
  const v = smooth(clamp((u - 2.0) / 3.0, 0, 1)) * (1 - 0.1 * smooth(clamp((u - 8) / 3, 0, 1)));
  if (v <= 0.002) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, 'rgba(3,6,26,' + (0.94 * v) + ')'); gr.addColorStop(0.6, 'rgba(8,18,52,' + (0.84 * v) + ')'); gr.addColorStop(1, 'rgba(8,16,44,' + (0.78 * v) + ')');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // sönük yıldız noktaları
  g.fillStyle = '#9fb3e8';
  for (let i = 0; i < OM_SONUK.length; i++) {
    const q = OM_SONUK[i], tw = 0.55 + 0.45 * Math.sin(u * 0.9 + q[3]);
    g.globalAlpha = 0.6 * v * tw; g.beginPath(); g.arc(q[0] * W, q[1] * H, q[2] * 1.5 * Math.max(1, S * 0.9), 0, 6.283); g.fill();
  }
  g.globalAlpha = 1;
}
function omKayanYildiz() {   // ekran koordinatı: sol üstten göle (sağ alta) süzülen son yıldız
  const G = omGecis; if (!G || !G.kayan) return;
  const u = now - G.t0 - G.kayan, dur = 2.0;
  if (u < 0 || u > dur + 1.6) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const ax = W * 0.18, ay = H * 0.06, bx = W * 0.66, by = H * 0.60;
  const pos = q => { const e = q * q * 0.35 + q * 0.65; return [ax + (bx - ax) * e, ay + (by - ay) * e - Math.sin(e * Math.PI) * H * 0.06]; };
  g.globalCompositeOperation = 'lighter';
  const q = clamp(u / dur, 0, 1), a = u < dur ? Math.min(1, u * 3) : Math.max(0, 1 - (u - dur) / 0.5);
  if (a > 0) {
    for (let i = 24; i >= 0; i--) {
      const qq = Math.max(0, q - i * 0.012), p = pos(qq), f = 1 - i / 25;
      dglow(i % 2 ? '#bfe2ff' : '#ffe6a8', p[0], p[1], (8 + 34 * f) * Math.max(1, S * 0.8), a * f * 0.5);
    }
    const h = pos(q);
    dglow('#ffffff', h[0], h[1], 56 * Math.max(1, S * 0.8), a); dglow('#ffe3a0', h[0], h[1], 130 * Math.max(1, S * 0.8), a * 0.6);
  }
  if (u > dur) {   // göle düştü: yayılan ışık halkası
    const r = clamp((u - dur) / 1.6, 0, 1), c = Math.max(1, S * 0.8);
    dglow('#cfe8ff', bx, by, (40 + 260 * r) * c, (1 - r) * 0.55);
    dglow('#ffffff', bx, by, (24 + 60 * r) * c, (1 - r) * 0.7);
  }
  g.globalCompositeOperation = 'source-over';
}
// yükselen ışık (dünya dönüşümünde): ağacın tacından göğe süzülen sıcak ışık küreleri + sütun
const OM_GECIS_N = 22;
function omGecisCiz() {
  const G = omGecis; if (!G) return;
  const u = now - G.t0;
  if (u < 0.6) return;
  const ust = cam.y - 160;
  g.globalCompositeOperation = 'lighter';
  const sut = smooth(clamp((u - 1.0) / 1.6, 0, 1)) * (1 - smooth(clamp((u - 6.5) / 2, 0, 1)));
  const tx = G.x, ty = G.y - 230;
  for (let i = 0; i < 6; i++) { const yy = ty - i * 150 * (0.4 + sut * 0.8); dglow('#ffd98a', tx, yy, 170 - i * 14, sut * 0.22); }
  for (let i = 0; i < OM_GECIS_N; i++) {
    const de = 0.9 + i * 0.2, v = (u - de) / 4.8;
    if (v <= 0 || v >= 1) continue;
    const e = v * v * (3 - 2 * v) * 0.35 + v * 0.65;
    const sx = tx + Math.sin(i * 2.399) * (70 + 90 * v) + Math.sin(u * 1.3 + i) * 14;
    const sy = ty + (ust - ty - 120) * e;
    const a = Math.sin(v * Math.PI) ** 0.6, r = 24 + (i % 4) * 9;
    dglow(i % 3 === 0 ? '#ffe9a0' : i % 3 === 1 ? '#ffb070' : '#9fd8ff', sx, sy, r * 3, a * 0.8);
    dglow('#ffffff', sx, sy, r * 1.1, a);
  }
  g.globalCompositeOperation = 'source-over';
}
// Bölüm 2 açılışı: karanlıkta bekle (önbellekler hazırlansın) → ışık taneleri Feza ve Pırıl'da toplanır, parlama sönerken belirirler;
// kamera suyun üstünden yavaşça kıyıya iner; sonra Pırıl konuşur ve kontrol gelir.
const OM_ACL_N = 26;
function omAcilisCiz() {
  const A = omAcilis; if (!A) return;
  const u = now - A.t0 - 0.5;
  if (u > 4.2) { omAcilis = null; return; }
  if (u < -0.4) return;
  g.globalCompositeOperation = 'lighter';
  const fx = P.rx !== undefined ? P.rx : P.x, fy = (P.ry !== undefined ? P.ry : P.y) - 42;
  const hedefler = [[fx, fy, 1], [D.x, D.y, 0.8]];
  for (let k = 0; k < 2; k++) {
    const hx = hedefler[k][0], hy = hedefler[k][1], sc = hedefler[k][2];
    const bl = 1 - smooth(clamp((u - 0.9 - k * 0.25) / 2.3, 0, 1));   // belirme parıltısı sönerken karakter görünür
    dglow('#d8ecff', hx, hy, 150 * sc, bl * 0.95); dglow('#ffffff', hx, hy, 70 * sc, bl);
    for (let i = 0; i < OM_ACL_N; i++) {
      const t = clamp((u + 0.2 - i * 0.045 - k * 0.2) / 1.4, 0, 1); if (t <= 0 || t >= 1) continue;
      const an = i * 2.399 + k, r = (1 - smooth(t)) * (230 + (i % 5) * 28);
      dglow(i % 2 ? '#ffe9a8' : '#bfe6ff', hx + Math.cos(an) * r, hy + Math.sin(an) * r * 0.8 - (1 - t) * 40, 14 + (i % 3) * 4, Math.sin(t * Math.PI) * 0.85);
    }
  }
  const su = clamp(1 - u / 2.2, 0, 1);   // sudan yükselen ışık: ayakların altında
  if (su > 0) { dglow('#9fd8ff', fx, fy + 42, 130, su * 0.45); }
  g.globalCompositeOperation = 'source-over';
}
function omDevamGirisi() {
  omPerde.a = 1; omPerde.hedef = 1; omPerde.hiz = 0.4;
  omAcilis = { t0: now };
  P.kilit = Math.max(P.kilit || 0, 4.2);
  OLAY.emit('bolum2Basla');
  OLAY.emit('gecisAsama', { ad: 'acilis' });
  omZamanla(0.6, () => { omPerde.hedef = 0; omPerde.hiz = 0.42; });   // ilk 0,6 sn tam karanlık: tuvaller bu sırada hazırlanır
  omZamanla(2.4, () => { if (typeof SES !== 'undefined' && SES && SES.soyle) { try { SES.soyle('p_y_giris'); } catch (e) { omHataBildir('p_y_giris', e); } } });
}
function frame(ms) {
  const wt = ms / 1000;
  let raw = omSonT < 0 ? 1 / 60 : wt - omSonT; omSonT = wt;
  if (!(raw > 0) || document.hidden) raw = 0; raw = Math.min(raw, 0.1);   // sekmede beklerken büyük sıçrama olmasın
  const dt = raw * omHiz;
  if (omOyunT < 0) omOyunT = wt;
  omOyunT += dt; now = omOyunT;
  const t = omOyunT;
  for (let i = omZamanlar.length - 1; i >= 0; i--) if (omZamanlar[i].t <= t) { const z = omZamanlar[i]; omZamanlar.splice(i, 1); omCagir('zamanla', z.fn); }
  if (omIsit) { try { if (dn2Isit()) omIsit = false; } catch (e) { omIsit = false; omHataBildir('dn2Isit', e); } }   // Bölüm 2 önbelleklerini kareye yayarak (karanlık/uyku girişi altında) ısıt
  omCagir('readInput', readInput);
  if (DURUM !== 'oyun') { axis = 0; jumpPressed = false; }
  // fizik: 120 Hz sabit adım
  if (DURUM === 'oyun' || DURUM === 'baslik') {
    omAcc += dt;
    let n = 0;
    while (omAcc >= OM.STEP && n < 16) { omOncX = P.x; omOncY = P.y; try { stepPlayer(OM.STEP); } catch (e) { omHata('stepPlayer', e); } omAcc -= OM.STEP; n++; }
    if (n >= 16) omAcc = 0;
  } else { omAcc = 0; omOncX = P.x; omOncY = P.y; }
  // çizim konumu: iki fizik adımı arasında yumuşatma (ışınlanmada yumuşatma yok)
  omSimX = P.x; omSimY = P.y;
  const al = omAcc / OM.STEP;
  if (Math.abs(P.x - omOncX) > 80 || Math.abs(P.y - omOncY) > 80) { omOncX = P.x; omOncY = P.y; }
  omRX = omOncX + (P.x - omOncX) * al; omRY = omOncY + (P.y - omOncY) * al;
  P.x = P.rx = omRX; P.y = P.ry = omRY;
  omCagir('nesneleriGuncelle', nesneleriGuncelle, dt);
  omCagir('omTasi', omTasi); P.rx = P.x; P.ry = P.y;
  omCagir('kayip', omKayipKontrol, dt);
  omCagir('fezaUpdate', typeof fezaUpdate === 'function' ? fezaUpdate : null, dt);
  omCagir('stepDragon', typeof stepDragon === 'function' ? stepDragon : null, dt);
  omCagir('stepCam', stepCam, dt);
  light = lerp(light, lightTarget, 1 - Math.exp(-dt * 0.9));
  let sahneTam = false, sahneOk = true;
  const SH = typeof SAHNE !== 'undefined' && SAHNE ? SAHNE : null;
  if (SH && typeof SH.tamEkran === 'function') { try { sahneTam = !!SH.tamEkran(); } catch (e) { omHata('SAHNE.tamEkran', e); sahneOk = false; } }
  if (!sahneTam) {
    omCagir('drawBackground', omDr('Background'), t);
    omCagir('drawMotes1', omDr('Motes'), t, 0, 0.75);
    omCagir('drawWorld', omDr('World'), t);
    g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
    nesneleriCiz(t, 'ciz');
    omTemizle();
    if (!omCagir('drawFeza', typeof drawFeza === 'function' ? drawFeza : null, t)) { g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); omCagir('yedekFeza', omYedekFeza, 0, 0, 0, true); }
    g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    omCagir('pirilHale', omPirilHale, 0, 0, 0, true);
    omCagir('drawDragon', typeof drawDragon === 'function' ? drawDragon : null, t, 0, 0, true);
    g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    nesneleriCiz(t, 'cizOn');
    g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    omCagir('drawFx', drawFx, t, dt);
    omCagir('drawPetals', omDr('Petals'), t);
    omCagir('drawMotes2', omDr('Motes'), t, 0.75, 2);
    if (typeof drawFezaKontur === 'function') omCagir('fezaKontur', drawFezaKontur, t);   // parçacıkların üstünde Feza'nın ince kontur halkası (okunurluk)
    omCagir('drawForeground', omDr('Foreground'), t);
    omCagir('drawVignette', omDr('Vignette'));
  }
  omTemizle();
  if (SH && typeof SH.ciz === 'function') { try { SH.ciz(t, dt); } catch (e) { omHata('SAHNE.ciz', e); sahneOk = false; } omTemizle(); }
  if (typeof ARAYUZ !== 'undefined' && ARAYUZ && typeof ARAYUZ.ciz === 'function') { try { ARAYUZ.ciz(t, dt); } catch (e) { omHata('ARAYUZ.ciz', e); } omTemizle(); }
  omCagir('perde', omPerdeCiz, dt);
  if (omGecis && DURUM === 'oyun') { g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); omCagir('gecisIsigi', omGecisCiz, 0, 0, 0, true); omTemizle(); }   // kutlama: yükselen ışık küreleri
  if (omAcilis) { g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); omCagir('acilis', omAcilisCiz, 0, 0, 0, true); omTemizle(); }
  // sahne sürekli hata veriyorsa (≈2,5 sn) oyun orada takılı kalmasın: girişte oyuna, finalde son ekrana geç
  omSahneHataT = sahneOk ? 0 : omSahneHataT + raw;
  if (omSahneHataT > 2.5) {
    omSahneHataT = 0;
    if (DURUM === 'giris') oyunaBasla();
    else if (DURUM === 'final') { DURUM = 'son'; OLAY.emit('durum', DURUM); }
  }
  // gerçek fizik konumuna dön (kare içinde başka bir modül Feza'yı taşıdıysa onu koru)
  if (P.x === omRX) P.x = omSimX; else omOncX = P.x;
  if (P.y === omRY) P.y = omSimY; else omOncY = P.y;
}
// ── 60 fps kilidi (dokunmatik cihazlar; ProMotion 120 Hz iPad Pro): oyun tek ana döngüde en çok 60 kare/sn çizer ──
// Yenileme aralığı: son 60 rAF aralığının medyanı. ≥ ~71 Hz değilse (aralık ≥ 14 ms, yani 60 Hz ve altı) HİÇ kare düşürülmez.
// ≥ ~105 Hz (aralık ≤ 9,5 ms: 120/144 Hz) → her ikinci rAF (sayaç tabanlı, jitter yok). Arası (75-100 Hz) → birikimli zaman sınırlayıcı.
// Fizik/animasyon zamanı frame() içinde gerçek rAF zaman damgasından (atlanan kareler dahil) hesaplanır: oyun hızı her Hz'de aynıdır.
// Masaüstü profilinde (OM_MASA) kilit 120'dir: ≤ ~130 Hz ekranda her kare çizilir, 144 Hz+'ta zaman tabanlı en çok 120 kare/sn.
const omLim = { buf: new Float32Array(60), n: 0, son: -1, aralik: 1000 / 60, mod: 1, par: 0, acc: 0, kare: 0, atla: 0, olc: new Float32Array(600), olcN: 0,
  hedef: OM_MASA ? 1000 / 120 : 1000 / 60, masa: OM_MASA };
function omLimGuncelle(d) {
  const L = omLim; L.buf[L.n++ % 60] = d;
  if (L.n >= 40 && L.n % 20 === 0) {
    const k = Math.min(L.n, 60), a = Array.prototype.slice.call(L.buf, 0, k).sort((x, y) => x - y), med = a[k >> 1];
    L.aralik = med;
    const yeni = L.masa ? (med >= 7.6 ? 1 : 3) : (med <= 9.5 && med >= 7.6) ? 2 : med >= 14 ? 1 : 3;   // 2: 105-130 Hz (120) her ikinci kare; <7,6 ms (144 Hz+) ve 75-100 Hz: zaman tabanlı   // 2: her ikinci kare · 1: hepsi · 3: birikimli
    if (yeni !== L.mod) { L.mod = yeni; L.acc = 0; }
  }
}
function omDongu(ms) {
  requestAnimationFrame(omDongu);   // önce sıradaki kare: ne olursa olsun döngü durmaz
  const L = omLim, d = L.son < 0 ? 1000 / 60 : ms - L.son; L.son = ms;
  if (d > 0 && d < 250 && !document.hidden) omLimGuncelle(d);
  if (L.mod === 2) { L.par ^= 1; if (L.par) { L.atla++; return; } }
  else if (L.mod === 3) { L.acc += d; if (L.acc < L.hedef * 0.912) { L.atla++; return; } L.acc = Math.min(L.acc - L.hedef, L.hedef); }
  L.kare++;
  if (omCoz.uygula) { omCoz.uygula = false; try { omCozUygula(); } catch (e) { omHataBildir('cozunurluk', e); } }
  const js0 = performance.now();
  try { frame(ms); }
  catch (e) {   // (aşamalar zaten korumalı; bu son emniyet) P'yi gerçek konumuna döndür
    if (P.x === omRX) P.x = omSimX; if (P.y === omRY) P.y = omSimY;
    omHata('frame', e);
  }
  const js = performance.now() - js0; L.olc[L.olcN++ % 600] = js;
  try { omCozOlc(ms, js); } catch (e) { omHataBildir('cozunurluk', e); }
}
requestAnimationFrame(omDongu);
window.OYUN = { P, D, NESNELER, get FLOWERS() { return typeof FLOWERS !== 'undefined' ? FLOWERS : []; }, get TREE() { return typeof TREE !== 'undefined' ? TREE : null; }, get bolum() { return BOLUM_NO; }, bolumGecisi: () => omBolumGecisi(TREE), cam, SAYAC, GIRDI, CISIMLER, OM, get durum() { return DURUM; }, get light() { return light; }, set light(v) { light = lightTarget = v; },
  begin, keys, press: () => { jumpPressed = true; }, finaleGec, HEDEF,
  get hiz() { return omHiz; }, set hiz(v) { omHiz = v; },   // yalnız test: zamanı hızlandır
  get ustundeki() { return ustundeki; }, get simX() { return omSimX; }, get simY() { return omSimY; },
  lim: omLim, get kareSay() { return omLim.kare; }, get kareMs() { const n = Math.min(omLim.olcN, 600), a = Array.prototype.slice.call(omLim.olc, 0, n).sort((x, y) => x - y); return n ? { ort: a.reduce((p, q) => p + q, 0) / n, p99: a[Math.floor(n * 0.99)], max: a[n - 1], n } : null; },
  coz: omCoz, OM_COZ, glowSay, get dpr() { return DPR; } };   // coz: uyarlanır çözünürlük durumu (log, yenileme...)
// ?atla / ?bolum=N (test) ve Bölüm 1→2 geçişinden sonraki yeniden yükleme: başlık ekranı atlanır (ses, ilk dokunuşta açılır)
let omOtoBasla = Q.has('atla') || Q.has('bolum');
try { if (sessionStorage.getItem('fezaIsikSec') === '2') { sessionStorage.removeItem('fezaIsikSec'); omOtoBasla = true; omPerde.a = omPerde.hedef = 1; } } catch (e) {}   // başlıktan Bölüm 2 seçildi
try { if (sessionStorage.getItem('fezaGecis') === '1') { sessionStorage.removeItem('fezaGecis'); omOtoBasla = true; omPerde.a = omPerde.hedef = 1; } } catch (e) {}   // ilk kareden karanlık: yeniden yükleme görünmez
if (omOtoBasla) begin();
else if (typeof SAHNE !== 'undefined' && SAHNE && typeof SAHNE.secim === 'function') omSecimBaslat();   // başlık = yatak başı seçim sahnesi

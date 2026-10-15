/* sahne.js – açılış (yatak odası → Işık Ormanı rüyası) ve kapanış (sabah) sahneleri. Sözleşme: src/SPEC.md.
   Oda "oda birimi" ile çizilir: ekran yüksekliği = 100 birim, x = 0 ekranın ortası (genişlik ekran oranına göre değişir).
   Pahalı her şey (oda duvarları, orman fonu) ekran boyunda bir kez tuvale çizilir (önbellek); her karede yalnızca
   değişen parçalar (perde/sarmaşık, battaniye/yosun, lamba/ay, halı/mantar, karakterler, ışıklar) çizilir.
   Bütün özel adlar sh/SH ile başlar. */
'use strict';

// ── küçük yardımcılar ──
const shSeg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const shEase = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const shEase2 = t => shEase(shEase(t));
function shMix(a, b, t, al = 1) { return mixc(a, b, clamp(t, 0, 1), al); }
function shSure(k, yedek = 4) {   // seslendirme süresi (yoksa metin uzunluğundan tahmin)
  if (window.VOICE_DUR && VOICE_DUR[k]) return VOICE_DUR[k];
  if (typeof SES !== 'undefined' && SES.sure) { const d = SES.sure(k); if (d > 0.5) return d; }
  const m = typeof SES !== 'undefined' && SES.LINES && SES.LINES[k];
  return m ? clamp(m.length / 13.5 + 0.6, 2.5, 9) : yedek;
}
function shSoyle(k) { if (typeof SES !== 'undefined' && SES.soyle) SES.soyle(k, { oncelik: 3 }); }
function shSus() { if (typeof SES === 'undefined') return; try { if (SES.sus) SES.sus(); else if (SES.dur) SES.dur(); } catch (e) {} }
// sahne anları: ses/müzik geçişleri için OLAY 'sahneAn' {ad} (her an bir kez)
function shSfx(ad, v) { try { if (typeof AU !== 'undefined' && AU && AU.sfx) AU.sfx(ad, v || 0); } catch (e) {} }
function shBir(k, at, ad, v) { if (!sh.sesler['s_' + k] && sh.t >= at) { sh.sesler['s_' + k] = 1; shSfx(ad, v); shAn(k); } }   // zamanı gelince bir kez
function shAn(ad) { if (sh.anlar[ad]) return; sh.anlar[ad] = 1; try { OLAY.emit('sahneAn', { ad, mod: sh.mod }); } catch (e) {} }

// ── renk paletleri: gece / sabah ──
const SH_GECE = {
  wallTop: '#10173a', wallBot: '#1b2756', paper: '#9fb2ff', paperA: 0.09, base: '#0c1230', baseHi: '#2c3a78',
  floorTop: '#1c1a3e', floorBot: '#0a0a1d', seam: 'rgba(0,0,0,0.28)', seamHi: 'rgba(140,160,255,0.06)',
  frame: '#262c5c', frameHi: '#55639f', glassTop: '#081430', glassBot: '#1f3f73', sky: 'gece',
  stand: '#251f45', standHi: '#3a3268', standD: '#16122e', pic: '#2d2858', picBg: '#232a55', picA: 0.55,
  rod: '#3b3570', curtain: ['#2c2f6e', '#3d4290', '#23255a'], tie: '#6f6ab8',
  bed: '#3a2f63', bedHi: '#54488a', bedD: '#231c42', sheet: '#3f4f8c', sheetHi: '#5a6cb0', sheetD: '#2f3b70', pillow: '#5c6aa8', pillowHi: '#8090cc', pillowD: '#434e86', pillowEdge: '#363f73', pillowSeam: 'rgba(170,185,245,0.55)',
  blanket: '#2e4486', blanketHi: '#4562b0', blanketD: '#1c2c60', star: '#ffe6a8', starA: 0.55,
  rug: '#3a2c66', rugRing: '#5a4796', rugDot: '#8e78d6', amb: 'rgba(30,40,110,0.0)',
};
const SH_SABAH = {
  wallTop: '#fbe9d2', wallBot: '#f0cfae', paper: '#ffffff', paperA: 0.32, base: '#e2b893', baseHi: '#fff1de',
  floorTop: '#d7a57a', floorBot: '#a9744f', seam: 'rgba(120,66,34,0.22)', seamHi: 'rgba(255,240,215,0.25)',
  frame: '#fff7ec', frameHi: '#ffffff', glassTop: '#a9d8ff', glassBot: '#ffe8c8', sky: 'sabah',
  stand: '#e0ae84', standHi: '#f3c9a0', standD: '#b98563', pic: '#e7b07a', picBg: '#fffaf0', picA: 1,
  rod: '#c99a6c', curtain: ['#f7b9c6', '#ffdcae', '#e698ad'], tie: '#ffd27a',
  bed: '#e2a878', bedHi: '#f6c99a', bedD: '#b47c55', sheet: '#f5f2ff', sheetHi: '#ffffff', sheetD: '#ddd6f0', pillow: '#fbf8ff', pillowHi: '#ffffff', pillowD: '#ddd3ee', pillowEdge: '#cbbfe2', pillowSeam: 'rgba(165,140,210,0.5)',
  blanket: '#5b86d8', blanketHi: '#86aaf0', blanketD: '#3d64b4', star: '#ffe08a', starA: 0.95,
  rug: '#e98fae', rugRing: '#f7c0d2', rugDot: '#fff2b0', amb: 'rgba(255,200,140,0.0)',
};

// ── oda yerleşimi (oda birimi) ──
const SH_ZEMIN = 74;                       // duvar/zemin birleşimi
const SH_YER = 84.5;                       // orman fonunda toprağın üst kenarı
const SH_PEN = { x0: 14, x1: 40, ust: 12, alt: 50 };   // pencere
const SH_YATAK = { x0: -48, x1: 3, ust: 60 };
const SH_KOMODIN = { x0: -65, x1: -53, ust: 61 };
const SH_LAMBA = { x: -59, y: 56.2 };
const SH_HALI = { x: 27, y: 88.5, rx: 25, ry: 4.6 };
const SH_AY = { x: 36, y: 19 };            // lamba bu noktaya süzülüp ay olur
const SH_FEZA = { x: -33.5, y: 59.2 };     // yatarken gövde ortası (yatak yüzeyi)
const SH_PIRIL = { x: -32.5, y: 55.2 };    // kollarındaki peluş
// halı desenindeki noktalar (mantar olurlar): [x, y, boy, şapka]
const SH_MANTAR = [[-16, 0.4, 7.5, 3.2], [-8.5, -1.6, 4.6, 2.2], [-1, 1.2, 9.5, 3.8], [6.5, -1.2, 5.4, 2.5], [13.5, 0.8, 7, 3], [19.5, -0.6, 4, 1.9], [-21.5, -0.4, 3.6, 1.7]];
// perde katları: [üst x, alt x kayması, genişlik, sarmaşık boyu]
const SH_KAT = [[0, -1.2, 3.4, 44], [2.6, 0.4, 3.1, 31], [5.0, 1.6, 2.8, 52], [7.2, 2.2, 2.4, 38]];
const SH_YILDIZ = [[-26, 63], [-15, 61.6], [-6, 64.5], [-19, 68.5], [-2, 69.5], [-11, 66.6], [-29, 69]];   // battaniye yıldızları

// ── durum ──
const sh = {
  mod: null, t: 0, bitti: null, tam: false, plan: null, atla: -1, sesler: {}, sonGorunum: false,
  zoom: 1, fx: 0, fy: 0, tx: 0, ty: 0, k0: 1, wu: 133,
  oda: null, odaSabah: null, orman: null, bw: 0, bh: 0,
  parca: [], zz: [], anlar: {},
};

// ── ölçüler & dönüşümler ──
// Ana ekrana eklenen iPad'de durum çubuğu tuvalin üzerine gelebilir. Yalnız seçim ekranının
// başlık/balon katmanı aşağı iner; oda resmi ve oyun içi kamera esnetilmez, kesilmez.
const shSecGuvenli = { kirli: true, ust: 0, alt: 0, asagi: 0 };
function shSecGuvenliOlc() {
  shSecGuvenli.kirli = false;
  let ust = 0, alt = 0;
  if (typeof document !== 'undefined' && document.body) {
    const e = document.createElement('div');
    e.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)';
    document.body.appendChild(e);
    const css = getComputedStyle(e); ust = parseFloat(css.paddingTop) || 0; alt = parseFloat(css.paddingBottom) || 0;
    e.remove();
  }
  // Aynı ekran oranında masaüstü ve iPad aynı yerleşimi kullanır. Tasarımın 32 CSS piksellik
  // üst boşluğu hep korunur; cihaz daha büyük bir güvenli alan bildirirse onun altına geçilir.
  const pay = Math.max(32, ust + 8);
  shSecGuvenli.ust = ust; shSecGuvenli.alt = alt;
  shSecGuvenli.asagi = Math.min(pay * H / Math.max(1, innerHeight), H * 0.09);
}
function shOlc() {
  if (shSecGuvenli.kirli) shSecGuvenliOlc();
  sh.k0 = H / 100; sh.wu = 100 * W / H;
  // dar (dikey) ekranda oda sağa kayar: yatak tam görünsün (yatay ekranda kayma yok). Bölüm 3 sabahında daha az kayar:
  // pencere (gökkuşağı) de görünsün
  const oxp = clamp((110 - sh.wu) / 35, 0, 1) * ((sh.fBolum || 1) === 3 && (sh.mod === 'final' || sh.sonGorunum) ? 6 : 16) * sh.k0;
  if (sh.bw !== W || sh.bh !== H || Math.abs(oxp - (sh.oxp || 0)) > 0.5) {   // ölçü ya da kayma değişti: önbellekler yeniden
    for (const ad of SH_ONBELLEK) { const v = sh[ad]; sh[ad] = shBirak(v && v.c ? v.c : v); if (shYap[ad]) { shBirak(shYap[ad].c); shYap[ad] = null; } }
    sh.bw = W; sh.bh = H;
  }
  sh.oxp = oxp;
  if (sh.balon && sh.balonK !== W + 'x' + H) { sh.balon = {}; sh.balonK = W + 'x' + H; }
}
function shCX() { return W / 2 + (sh.oxp || 0); }
const shPX = x => W / 2 + (sh.oxp || 0) + x * sh.k0;           // oda birimi → piksel (zoom yok)
const shPY = y => y * sh.k0;
// kamera: odadaki (fx,fy) pikseli ekranda (tx,ty)'ye gelir, zoom kadar büyür; resim ekranı hep kaplar
function shKamera(fx, fy, z, tx, ty) {
  sh.zoom = z; sh.fx = fx; sh.fy = fy;
  sh.tx = clamp(tx, W - (W - fx) * z, fx * z); sh.ty = clamp(ty, H - (H - fy) * z, fy * z);
}
function shOdaT(ctx = g) {                       // oda koordinatı + zoom
  const z = sh.zoom, a = sh.k0 * z;
  ctx.setTransform(a, 0, 0, a, sh.tx + (W / 2 + (sh.oxp || 0) - sh.fx) * z, sh.ty - sh.fy * z);
}
function shResimT() { const z = sh.zoom; g.setTransform(z, 0, 0, z, sh.tx - sh.fx * z, sh.ty - sh.fy * z); }
function shEkranX(x) { return sh.tx + (shPX(x) - sh.fx) * sh.zoom; }
function shEkranY(y) { return sh.ty + (shPY(y) - sh.fy) * sh.zoom; }
function shTuval() { const c = document.createElement('canvas'); c.width = Math.max(2, W); c.height = Math.max(2, H); return c; }
// tuvalin belleğini hemen geri ver (Safari'de çöp toplamayı beklemeden); dönüş null → referansı da bırak
function shBirak(c) { try { if (c && c.width) { c.width = 0; c.height = 0; } } catch (e) {} return null; }

// ── büyük önbellekler parça parça hazırlanır (her adım kısa; kareler arasında, gerekmeden önce) ──
const SH_ONBELLEK = ['oda', 'orman', 'gol', 'bulut', 'deniz', 'denizOyun', 'onPlan', 'onPlanB', 'onPlanI', 'odaSabah', 'odaYakin'];
const SH_KUR = {
  oda: () => shOdaAdim(SH_GECE),
  orman: () => shOrmanAdim(),
  gol: () => shGolAdim(),
  deniz: () => shDenizFonAdim(),
  bulut: () => shBulutFonAdim(),
  onPlanI: () => { const A = { c: null, W, H, adim: [() => { A.c = shDenizOnPlan(); }] }; return A; },
  onPlanB: () => { const A = { c: null, W, H, adim: [() => { A.c = shOnPlanBulutCiz(); }] }; return A; },
  onPlan: () => { const A = { c: null, W, H, adim: [() => { A.c = shOnPlanCiz(); }] }; return A; },
  odaSabah: () => shOdaAdim(SH_SABAH),
  odaYakin: () => shYakinAdim(),
};
const shYap = {};
function shYapAdim(ad) {   // bir adım; bitince true
  let A = shYap[ad];
  if (A && (A.W !== W || A.H !== H)) { shBirak(A.c); A = shYap[ad] = null; }
  if (sh[ad]) return true;
  if (!A) { A = shYap[ad] = SH_KUR[ad](); A.i = 0; }
  A.adim[A.i++]();
  if (A.i >= A.adim.length) { sh[ad] = A.deger || A.c; shYap[ad] = null; return true; }
  return false;
}
function shHazir(ad) { if (!sh[ad]) { shOlc(); while (!shYapAdim(ad)); } return sh[ad]; }   // gerekirse kalanını hemen bitir
let shBoyaX = null;
function shBoya(c) {   // bir kez minicik çiz: tarayıcı tuvali şimdi boyasın (ilk kullanımda takılmasın)
  try { if (!c || !c.width) return; if (!shBoyaX) { const t = document.createElement('canvas'); t.width = t.height = 2; shBoyaX = t.getContext('2d'); } shBoyaX.drawImage(c, 0, 0, 2, 2); } catch (e) {}
}
const shIsQ = []; let shIsZ = 0;
function shOnceden(ad, kosul) { if (sh[ad] || shIsQ.some(q => q.ad === ad)) return; shIsQ.push({ ad, kosul }); if (!shIsZ) shIsZ = setTimeout(shIsCalis, 40); }
function shIsCalis() {
  shIsZ = 0;
  while (shIsQ.length) {
    const q = shIsQ[0];
    if (sh[q.ad] || !q.kosul()) { shIsQ.shift(); continue; }
    if (!(W > 2 && H > 2)) break;
    shOlc();
    let bitti = false;
    try { bitti = shYapAdim(q.ad); } catch (e) { shHata('hazirla:' + q.ad, e); if (shYap[q.ad]) { shBirak(shYap[q.ad].c); shYap[q.ad] = null; } shIsQ.shift(); break; }
    const v = bitti ? sh[q.ad] : shYap[q.ad]; shBoya(v && v.c ? v.c : v);
    if (bitti) shIsQ.shift();
    break;
  }
  if (shIsQ.length) shIsZ = setTimeout(shIsCalis, 40);
}
function shGeceBirak() {   // açılışın üç tam ekran önbelleği (≈67 MB, 2732×2048'de) oyun boyunca tutulmaz
  for (const ad of ['oda', 'orman', 'gol', 'bulut', 'deniz', 'denizOyun', 'onPlan', 'onPlanB', 'onPlanI']) { sh[ad] = shBirak(sh[ad]); if (shYap[ad]) { shBirak(shYap[ad].c); shYap[ad] = null; } }
}

// ── küçük şekiller ──
function shYildiz4(x, cx, cy, r, ince = 0.28) {   // dört köşeli parıltı
  x.beginPath();
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * ince : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  x.closePath();
}
function shYildiz5(x, cx, cy, r) {
  x.beginPath();
  for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.48 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  x.closePath();
}
function shRR(x, x0, y0, w, h, r) {
  x.beginPath(); x.moveTo(x0 + r, y0); x.arcTo(x0 + w, y0, x0 + w, y0 + h, r); x.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
  x.arcTo(x0, y0 + h, x0, y0, r); x.arcTo(x0, y0, x0 + w, y0, r); x.closePath();
}
// parıltı sprite'ı (dört köşeli yıldız + hale), bir kez
let shSpark = null;
function shSparkSprite() {
  if (shSpark) return shSpark;
  const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
  const gr = x.createRadialGradient(48, 48, 0, 48, 48, 48);
  gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.18, 'rgba(255,240,255,0.35)'); gr.addColorStop(1, 'rgba(255,240,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 96, 96);
  x.fillStyle = '#fff'; shYildiz4(x, 48, 48, 44, 0.09); x.fill();
  return shSpark = c;
}
function shParilti(px, py, r, a) {   // ekran pikseli
  if (a <= 0.01) return;
  g.globalAlpha = Math.min(1, a); g.drawImage(shSparkSprite(), px - r, py - r, r * 2, r * 2); g.globalAlpha = 1;
}

// ══════════════════ ODA (önbelleğe çizilir) ══════════════════
// yak: { sc, ox, oy, w, h } → odanın yalnız bir bölgesi, sc kat çözünürlükle (yakın çekimde bulanık görünmesin)
function shOdaAdim(p, yak) {   // oda önbelleği, parça parça çizilebilen adımlar (her biri kısa)
  const sc = yak ? yak.sc : 1, ox = yak ? yak.ox : 0, oy = yak ? yak.oy : 0;
  const c = yak ? document.createElement('canvas') : shTuval(), x = c.getContext('2d');
  if (yak) { c.width = Math.max(2, Math.ceil(yak.w)); c.height = Math.max(2, Math.ceil(yak.h)); }
  const k = sh.k0, L = -sh.wu / 2 - 19, R = sh.wu / 2 + 19;
  let gr; const A = { c, W, H, adim: [] };
  A.adim.push(() => {
  x.setTransform(k * sc, 0, 0, k * sc, (shCX() - ox) * sc, -oy * sc);
  // duvar
  gr = x.createLinearGradient(0, 0, 0, SH_ZEMIN);
  gr.addColorStop(0, p.wallTop); gr.addColorStop(1, p.wallBot);
  x.fillStyle = gr; x.fillRect(L, -1, R - L, SH_ZEMIN + 1);
  // duvar kâğıdı: küçük yıldızlar ve hilaller (seyrek, ofsetli ızgara)
  x.fillStyle = p.paper; x.globalAlpha = p.paperA;
  for (let row = 0, y = 6; y < SH_ZEMIN - 4; row++, y += 9) {
    for (let xx = L + (row % 2 ? 4.5 : 0); xx < R; xx += 9) {
      if ((Math.round(xx * 7 + y * 3) & 3) === 0) { x.beginPath(); x.arc(xx, y, 1.15, 0.75 * Math.PI, 1.95 * Math.PI, true); x.arc(xx + 0.5, y - 0.4, 0.95, 1.85 * Math.PI, 0.82 * Math.PI, false); x.fill(); }
      else { shYildiz5(x, xx, y, 0.85); x.fill(); }
    }
  }
  x.globalAlpha = 1;
  // boyalı duvar dokusu: büyük, çok silik fırça lekeleri (açık/koyu)
  { const rw = rng(31), gece = p.sky === 'gece';
    for (let i = 0; i < 46; i++) {
      const bx = L + rw() * (R - L), by = rw() * SH_ZEMIN, br = 6 + rw() * 14, acik = rw() < 0.5;
      const rg = x.createRadialGradient(bx, by, 0, bx, by, br);
      const c0 = gece ? (acik ? 'rgba(150,170,255,0.045)' : 'rgba(2,4,24,0.07)') : (acik ? 'rgba(255,255,240,0.14)' : 'rgba(210,140,90,0.07)');
      rg.addColorStop(0, c0); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    // duvarın alt yarısında hafif lambriyi andıran yumuşak şerit
    const lg = x.createLinearGradient(0, SH_ZEMIN - 14, 0, SH_ZEMIN); lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, gece ? 'rgba(2,4,24,0.28)' : 'rgba(150,90,50,0.14)');
    x.fillStyle = lg; x.fillRect(L, SH_ZEMIN - 14, R - L, 14);
  }
  // pencereden duvara düşen ışık (yumuşak)
  gr = x.createRadialGradient(27, 32, 2, 27, 32, 46);
  gr.addColorStop(0, p.sky === 'gece' ? 'rgba(140,175,255,0.16)' : 'rgba(255,240,205,0.45)'); gr.addColorStop(1, 'rgba(140,175,255,0)');
  x.fillStyle = gr; x.fillRect(L, -1, R - L, SH_ZEMIN + 1);
  });
  A.adim.push(() => {
  x.setTransform(k * sc, 0, 0, k * sc, (shCX() - ox) * sc, -oy * sc);
  // süpürgelik
  x.fillStyle = p.base; x.fillRect(L, SH_ZEMIN - 2.2, R - L, 2.4);
  x.fillStyle = p.baseHi; x.globalAlpha = 0.5; x.fillRect(L, SH_ZEMIN - 2.2, R - L, 0.3); x.globalAlpha = 1;
  // zemin (tahtalar)
  gr = x.createLinearGradient(0, SH_ZEMIN, 0, 100);
  gr.addColorStop(0, p.floorTop); gr.addColorStop(1, p.floorBot);
  x.fillStyle = gr; x.fillRect(L, SH_ZEMIN, R - L, 27);
  const r = rng(7);
  for (let i = 0, y = SH_ZEMIN; y < 101; i++) {
    const h = 3 + i * 1.2;
    x.fillStyle = p.seam; x.fillRect(L, y, R - L, 0.28);
    x.fillStyle = p.seamHi; x.fillRect(L, y + 0.3, R - L, 0.25);
    for (let xx = L + r() * 20; xx < R; xx += 16 + r() * 14) { x.fillStyle = p.seam; x.fillRect(xx, y, 0.25, h); }
    y += h;
  }
  // pencere ışığının zemindeki izi
  gr = x.createRadialGradient(8, 90, 1, 8, 90, 40);
  gr.addColorStop(0, p.sky === 'gece' ? 'rgba(130,170,255,0.10)' : 'rgba(255,225,170,0.4)'); gr.addColorStop(1, 'rgba(130,170,255,0)');
  x.fillStyle = gr; x.save(); x.translate(8, 90); x.scale(1.6, 0.35); x.translate(-8, -90); x.fillRect(-40, 50, 100, 80); x.restore();
  });
  A.adim.push(() => {
  x.setTransform(k * sc, 0, 0, k * sc, (shCX() - ox) * sc, -oy * sc);
  // pencere
  const P0 = SH_PEN, cxw = (P0.x0 + P0.x1) / 2, rw = (P0.x1 - P0.x0) / 2, ya = P0.ust + rw;
  const pencereYolu = (pad) => { x.beginPath(); x.moveTo(P0.x0 - pad, P0.alt + pad); x.lineTo(P0.x0 - pad, ya); x.arc(cxw, ya, rw + pad, Math.PI, 0); x.lineTo(P0.x1 + pad, P0.alt + pad); x.closePath(); };
  pencereYolu(1.6); x.fillStyle = p.frame; x.fill();
  pencereYolu(0);
  gr = x.createLinearGradient(0, P0.ust, 0, P0.alt);
  gr.addColorStop(0, p.glassTop); gr.addColorStop(1, p.glassBot); x.fillStyle = gr; x.fill();
  x.save(); pencereYolu(0); x.clip();
  if (p.sky === 'gece') {
    const rr = rng(3);
    x.fillStyle = '#ffffff';
    for (let i = 0; i < 26; i++) { x.globalAlpha = 0.3 + rr() * 0.6; x.beginPath(); x.arc(P0.x0 + rr() * 26, P0.ust + rr() * 34, 0.16 + rr() * 0.22, 0, 6.283); x.fill(); }
    x.globalAlpha = 1;
    // hilal (uzak, sakin)
    const mg = x.createRadialGradient(33, 21, 0, 33, 21, 9); mg.addColorStop(0, 'rgba(200,220,255,0.35)'); mg.addColorStop(1, 'rgba(200,220,255,0)');
    x.fillStyle = mg; x.fillRect(20, 10, 26, 24);
    x.save(); x.beginPath(); x.arc(33, 21, 2.6, 0, 6.283); x.fillStyle = '#eef3ff'; x.fill(); x.clip();
    const cg = x.createLinearGradient(0, P0.ust, 0, P0.alt); cg.addColorStop(0, p.glassTop); cg.addColorStop(1, p.glassBot);
    x.fillStyle = cg; x.beginPath(); x.arc(34.4, 19.9, 2.25, 0, 6.283); x.fill(); x.restore();
    // ufukta soluk ışık, uzak tepeler, ağaçlar arasında minik ışık noktaları
    { const hg = x.createLinearGradient(0, P0.alt - 18, 0, P0.alt); hg.addColorStop(0, 'rgba(90,120,220,0)'); hg.addColorStop(1, 'rgba(110,140,235,0.4)'); x.fillStyle = hg; x.fillRect(P0.x0, P0.alt - 18, 30, 18);
      x.fillStyle = '#162b60'; x.beginPath(); x.moveTo(P0.x0 - 1, P0.alt); for (let i = 0; i <= 12; i++) x.lineTo(P0.x0 - 1 + i * 2.4, P0.alt - 6 - 3.2 * Math.sin(i * 0.9 + 1) - 2 * Math.sin(i * 2.1)); x.lineTo(P0.x1 + 1, P0.alt); x.fill(); }
    // pencerenin dışında uzak ağaç siluetleri
    x.fillStyle = '#0a1532';
    for (let i = 0; i < 6; i++) { const tx = P0.x0 - 2 + i * 5.5; x.beginPath(); x.arc(tx, P0.alt - 2 + (i % 2) * 1.5, 4 + (i % 3), 0, 6.283); x.fill(); }
    x.fillRect(P0.x0 - 2, P0.alt - 2, 30, 4);
    x.fillStyle = '#d8ff9a'; for (const [fx, fy] of [[17, 46], [21, 44.5], [26, 47], [31, 45], [35, 46.5], [24, 43]]) { x.globalAlpha = 0.85; x.beginPath(); x.arc(fx, fy, 0.22, 0, 6.283); x.fill(); x.globalAlpha = 0.18; x.beginPath(); x.arc(fx, fy, 0.9, 0, 6.283); x.fill(); } x.globalAlpha = 1;
  } else {
    // sabah: yumuşak bulutlar, güneşin parıltısı
    const sg = x.createRadialGradient(36, 18, 0, 36, 18, 16); sg.addColorStop(0, 'rgba(255,250,225,1)'); sg.addColorStop(0.3, 'rgba(255,240,200,0.6)'); sg.addColorStop(1, 'rgba(255,240,200,0)');
    x.fillStyle = sg; x.fillRect(14, 2, 30, 34);
    { const hg = x.createLinearGradient(0, 20, 0, P0.alt); hg.addColorStop(0, 'rgba(255,190,140,0)'); hg.addColorStop(1, 'rgba(255,200,150,0.55)'); x.fillStyle = hg; x.fillRect(P0.x0, 20, 30, 32);
      x.fillStyle = 'rgba(255,170,190,0.45)'; x.beginPath(); x.ellipse(24, 24, 7, 0.9, 0, 0, 6.283); x.ellipse(33, 29, 6, 0.8, 0, 0, 6.283); x.fill();
      x.fillStyle = '#d6ecc4'; x.beginPath(); x.moveTo(P0.x0 - 1, P0.alt); for (let i = 0; i <= 12; i++) x.lineTo(P0.x0 - 1 + i * 2.4, P0.alt - 6 - 3 * Math.sin(i * 0.9 + 1) - 1.8 * Math.sin(i * 2.1)); x.lineTo(P0.x1 + 1, P0.alt); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,0.85)';
    for (const [bx, by, s] of [[20, 27, 1], [30, 36, 1.3], [17, 42, 0.8]]) { x.beginPath(); x.arc(bx, by, 2.2 * s, 0, 6.283); x.arc(bx + 2.6 * s, by - 1 * s, 2.8 * s, 0, 6.283); x.arc(bx + 5.4 * s, by, 2 * s, 0, 6.283); x.rect(bx, by, 5.4 * s, 2 * s); x.fill(); }
    x.fillStyle = '#b8dca0';
    for (let i = 0; i < 6; i++) { const tx = P0.x0 - 2 + i * 5.5; x.beginPath(); x.arc(tx, P0.alt - 1 + (i % 2) * 1.5, 4 + (i % 3), 0, 6.283); x.fill(); }
  }
  x.restore();
  // kayıtlar (pervaz)
  x.fillStyle = p.frame;
  x.fillRect(cxw - 0.6, P0.ust, 1.2, P0.alt - P0.ust); x.fillRect(P0.x0, 31, P0.x1 - P0.x0, 1.2);
  x.strokeStyle = p.frameHi; x.lineWidth = 0.3; x.globalAlpha = 0.6; pencereYolu(1.6); x.stroke(); x.globalAlpha = 1;
  // pencere önü (denizlik)
  x.fillStyle = p.frame; shRR(x, P0.x0 - 3, P0.alt, P0.x1 - P0.x0 + 6, 2.2, 0.6); x.fill();
  x.fillStyle = p.frameHi; x.globalAlpha = 0.5; x.fillRect(P0.x0 - 2.6, P0.alt + 0.1, P0.x1 - P0.x0 + 5.2, 0.35); x.globalAlpha = 1;
  // perde çubuğu
  x.fillStyle = p.rod; x.fillRect(8.5, 8.7, 37, 0.9);
  x.beginPath(); x.arc(8.3, 9.15, 1.1, 0, 6.283); x.arc(45.7, 9.15, 1.1, 0, 6.283); x.fill();
  });
  A.adim.push(() => {
  x.setTransform(k * sc, 0, 0, k * sc, (shCX() - ox) * sc, -oy * sc);
  // duvardaki çocuk resmi: mor ejderha + yıldız (Feza çizmiş)
  const fx0 = -17, fy0 = 21, fw = 14, fh = 11;
  x.fillStyle = p.pic; shRR(x, fx0 - 0.9, fy0 - 0.9, fw + 1.8, fh + 1.8, 0.6); x.fill();
  x.fillStyle = p.picBg; x.fillRect(fx0, fy0, fw, fh);
  x.save(); x.beginPath(); x.rect(fx0, fy0, fw, fh); x.clip();
  x.globalAlpha = p.picA;
  x.fillStyle = '#7bc96f'; x.beginPath(); x.ellipse(fx0 + 7, fy0 + fh + 1, 9, 3.4, 0, 0, 6.283); x.fill();
  // Pırıl (pastel boyayla): lila gövde, kıvrık kuyruk, koyu yeşil taraklı ibik, açık yeşil karın, kulak yüzgeci, yeşil göz
  x.lineCap = 'round'; x.lineJoin = 'round';
  x.strokeStyle = '#b79be8'; x.lineWidth = 1.1;
  x.beginPath(); x.moveTo(fx0 + 4.2, fy0 + 7.6); x.quadraticCurveTo(fx0 + 1.4, fy0 + 8.6, fx0 + 1.8, fy0 + 6.4); x.quadraticCurveTo(fx0 + 2.2, fy0 + 5.2, fx0 + 3.2, fy0 + 5.9); x.stroke();
  x.fillStyle = '#2f8a2c';   // sırt dikenleri + ibik (taraklı)
  for (const [qx, qy, qr] of [[4.6, 5.2, 0.75], [5.9, 4.5, 0.8], [7.4, 2.7, 0.8], [8.6, 2.1, 0.85], [9.8, 2.4, 0.75]]) { x.beginPath(); x.arc(fx0 + qx, fy0 + qy, qr, 0, 6.283); x.fill(); }
  x.fillStyle = '#b79be8'; x.beginPath(); x.ellipse(fx0 + 6.2, fy0 + 7.0, 2.9, 2.2, -0.15, 0, 6.283); x.fill();
  x.beginPath(); x.ellipse(fx0 + 9.0, fy0 + 4.6, 2.0, 1.75, 0.1, 0, 6.283); x.fill();
  x.fillStyle = '#bde43a'; x.beginPath(); x.ellipse(fx0 + 7.2, fy0 + 7.6, 1.3, 1.5, -0.3, 0, 6.283); x.fill();   // karın
  x.strokeStyle = '#93bd28'; x.lineWidth = 0.2; x.beginPath(); x.moveTo(fx0 + 6.4, fy0 + 7.2); x.lineTo(fx0 + 7.9, fy0 + 7.0); x.moveTo(fx0 + 6.4, fy0 + 8.0); x.lineTo(fx0 + 7.9, fy0 + 7.9); x.stroke();
  x.fillStyle = '#bde43a'; x.beginPath(); x.moveTo(fx0 + 8.0, fy0 + 3.6); x.lineTo(fx0 + 7.0, fy0 + 2.9); x.lineTo(fx0 + 7.6, fy0 + 4.4); x.fill();   // kulak yüzgeci
  x.fillStyle = '#4fae37'; x.beginPath(); x.arc(fx0 + 9.6, fy0 + 4.4, 0.6, 0, 6.283); x.fill();
  x.fillStyle = '#ffffff'; x.beginPath(); x.arc(fx0 + 9.8, fy0 + 4.2, 0.22, 0, 6.283); x.fill();
  x.beginPath(); x.moveTo(fx0 + 10.1, fy0 + 5.6); x.lineTo(fx0 + 10.3, fy0 + 6.2); x.lineTo(fx0 + 10.5, fy0 + 5.6); x.fill();   // minik diş
  x.fillStyle = '#b79be8'; x.beginPath(); x.ellipse(fx0 + 5.0, fy0 + 9.0, 0.8, 0.5, 0, 0, 6.283); x.ellipse(fx0 + 7.6, fy0 + 9.1, 0.8, 0.5, 0, 0, 6.283); x.fill();
  x.fillStyle = '#ffd34d'; shYildiz5(x, fx0 + 11.6, fy0 + 2.4, 1.5); x.fill();
  x.strokeStyle = '#ff8fb8'; x.lineWidth = 0.35; x.beginPath(); x.moveTo(fx0 + 1.4, fy0 + 2); x.quadraticCurveTo(fx0 + 2.6, fy0 + 0.8, fx0 + 3.4, fy0 + 2.2); x.stroke();
  x.globalAlpha = 1; x.restore();
  // duvar rafı: kitaplar, peluş ayıcık, ışık kavanozu
  { const gece = p.sky === 'gece', sx0 = -53, sx1 = -27, sy = 38;
    x.fillStyle = p.standD; x.beginPath(); x.moveTo(sx0 + 3, sy + 1); x.lineTo(sx0 + 3, sy + 4); x.lineTo(sx0 + 6, sy + 1); x.moveTo(sx1 - 3, sy + 1); x.lineTo(sx1 - 3, sy + 4); x.lineTo(sx1 - 6, sy + 1); x.fill();
    const kt = gece ? ['#4a5fa8', '#7a4f9a', '#3f8a8a', '#a8607a'] : ['#6aa6e8', '#f08ab0', '#7cc9a8', '#ffc86a'];
    const kh = [6.2, 5, 6.8, 4.6]; let kx = sx0 + 1.5;
    for (let i = 0; i < 4; i++) { const w = 1.5 + (i % 2) * 0.4; x.fillStyle = kt[i]; shRR(x, kx, sy - kh[i], w, kh[i], 0.25); x.fill(); x.fillStyle = 'rgba(255,255,255,0.28)'; x.fillRect(kx + 0.25, sy - kh[i] + 0.8, w - 0.5, 0.25); kx += w + 0.15; }
    x.save(); x.translate(kx + 0.5, sy - 5); x.rotate(0.28); x.fillStyle = kt[1]; shRR(x, 0, 0, 1.5, 5, 0.25); x.fill(); x.restore();
    const bx = sx0 + 17, by = sy;   // ayıcık
    x.fillStyle = gece ? '#9a7a6a' : '#d9a273'; x.beginPath(); x.ellipse(bx, by - 2.2, 2.3, 2.4, 0, 0, 6.283); x.fill(); x.beginPath(); x.arc(bx, by - 5.4, 1.9, 0, 6.283); x.fill();
    x.beginPath(); x.arc(bx - 1.4, by - 7, 0.7, 0, 6.283); x.arc(bx + 1.4, by - 7, 0.7, 0, 6.283); x.fill();
    x.fillStyle = gece ? '#c8a898' : '#f3d2b0'; x.beginPath(); x.ellipse(bx, by - 4.9, 0.9, 0.7, 0, 0, 6.283); x.ellipse(bx, by - 2.0, 1.3, 1.5, 0, 0, 6.283); x.fill();
    x.fillStyle = '#2b1a14'; x.beginPath(); x.arc(bx - 0.7, by - 5.7, 0.2, 0, 6.283); x.arc(bx + 0.7, by - 5.7, 0.2, 0, 6.283); x.arc(bx, by - 5.2, 0.28, 0, 6.283); x.fill();
    const jx = sx1 - 4.5;   // kavanoz
    x.fillStyle = gece ? 'rgba(180,200,255,0.2)' : 'rgba(255,255,255,0.35)'; shRR(x, jx - 1.6, by - 4.4, 3.2, 4.4, 0.8); x.fill();
    x.strokeStyle = gece ? 'rgba(190,210,255,0.55)' : 'rgba(255,255,255,0.8)'; x.lineWidth = 0.18; shRR(x, jx - 1.6, by - 4.4, 3.2, 4.4, 0.8); x.stroke();
    x.fillStyle = p.standHi; x.fillRect(jx - 1.3, by - 5, 2.6, 0.7);
    if (gece) { const jg = x.createRadialGradient(jx, by - 2.4, 0, jx, by - 2.4, 5); jg.addColorStop(0, 'rgba(220,255,160,0.55)'); jg.addColorStop(1, 'rgba(220,255,160,0)'); x.fillStyle = jg; x.fillRect(jx - 5, by - 7.4, 10, 10); x.fillStyle = '#e8ffb0'; for (const [dx, dy] of [[-0.6, -3.4], [0.5, -2.2], [-0.2, -1.2]]) { x.beginPath(); x.arc(jx + dx, by + dy, 0.2, 0, 6.283); x.fill(); } }
    x.fillStyle = p.stand; shRR(x, sx0, sy, sx1 - sx0, 1.3, 0.35); x.fill();
    x.fillStyle = p.standHi; x.globalAlpha = 0.6; x.fillRect(sx0 + 0.3, sy + 0.1, sx1 - sx0 - 0.6, 0.3); x.globalAlpha = 1;
  }
  // komodin
  const K = SH_KOMODIN;
  x.fillStyle = p.standD; x.fillRect(K.x0 + 0.8, K.ust + 2, 0.9, SH_ZEMIN + 4 - K.ust); x.fillRect(K.x1 - 1.7, K.ust + 2, 0.9, SH_ZEMIN + 4 - K.ust);
  x.fillStyle = p.stand; shRR(x, K.x0, K.ust, K.x1 - K.x0, 10, 0.8); x.fill();
  x.fillStyle = p.standHi; shRR(x, K.x0 - 0.6, K.ust - 0.6, K.x1 - K.x0 + 1.2, 1.6, 0.6); x.fill();
  x.fillStyle = p.standD; x.globalAlpha = 0.6; shRR(x, K.x0 + 1.2, K.ust + 3, K.x1 - K.x0 - 2.4, 5.2, 0.5); x.fill(); x.globalAlpha = 1;
  x.fillStyle = p.standHi; x.beginPath(); x.arc((K.x0 + K.x1) / 2, K.ust + 5.6, 0.55, 0, 6.283); x.fill();
  // komodinin üstünde küçük bir kitap
  x.fillStyle = p.sky === 'gece' ? '#3c4f8a' : '#7fb3e8'; shRR(x, K.x0 + 6.4, K.ust - 1.6, 4.4, 1.1, 0.25); x.fill();
  x.fillStyle = p.sky === 'gece' ? '#6b3f7a' : '#f59ab8'; shRR(x, K.x0 + 6.8, K.ust - 2.6, 3.8, 1.0, 0.25); x.fill();
  // köşelerde yumuşak gölge (vinyet)
  x.setTransform(sc, 0, 0, sc, -ox * sc, -oy * sc);
  gr = x.createRadialGradient(W / 2, H * 0.55, H * 0.35, W / 2, H * 0.55, Math.hypot(W, H) * 0.62);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, p.sky === 'gece' ? 'rgba(2,3,14,0.6)' : 'rgba(120,60,30,0.22)');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  });
  return A;
}
function shOdaCiz(p, yak) { const A = shOdaAdim(p, yak); for (const f of A.adim) f(); return A.c; }

// ══════════════════ ORMAN FONU (önbelleğe) – oyunun gece paletiyle ══════════════════
function shOrmanAdim() {
  const c = shTuval(), x = c.getContext('2d');
  const k = sh.k0, L = -sh.wu / 2 - 20, R = sh.wu / 2 + 20;
  let gr; const A = { c, W, H, adim: [] };
  A.adim.push(() => {
  x.setTransform(k, 0, 0, k, shCX(), 0);
  gr = x.createLinearGradient(0, 0, 0, 82);
  gr.addColorStop(0, '#060b1e'); gr.addColorStop(0.45, '#10204a'); gr.addColorStop(0.85, '#1d4470'); gr.addColorStop(1, '#1d4470');
  x.fillStyle = gr; x.fillRect(L, -1, R - L, 102);
  const r = rng(11);
  x.fillStyle = '#ffffff';
  for (let i = 0; i < 70; i++) { x.globalAlpha = 0.15 + r() * 0.5; x.beginPath(); x.arc(L + r() * (R - L), r() * 45, 0.12 + r() * 0.2, 0, 6.283); x.fill(); }
  x.globalAlpha = 1;
  // ay ışığının sise saçılması
  gr = x.createRadialGradient(SH_AY.x, SH_AY.y, 0, SH_AY.x, SH_AY.y, 70);
  gr.addColorStop(0, 'rgba(150,200,255,0.30)'); gr.addColorStop(0.4, 'rgba(110,160,230,0.12)'); gr.addColorStop(1, 'rgba(110,160,230,0)');
  x.fillStyle = gr; x.fillRect(L, -1, R - L, 102);
  // uzak tepe ve ağaç siluetleri (katmanlar)
  const katman = (col, y0, n, hMin, hMax, tw, cr, seed, al) => {
    const q = rng(seed); x.fillStyle = col; x.globalAlpha = al;
    for (let i = 0; i < n; i++) {
      const tx = L + (i + q() * 0.6) * (R - L) / n, top = y0 - hMin - q() * (hMax - hMin);
      x.fillRect(tx - tw / 2, top, tw, 100 - top);
      const rr = cr * (0.7 + q() * 0.6);
      x.beginPath(); x.ellipse(tx, top, rr, rr * (1.1 + q() * 0.5), 0, 0, 6.283); x.fill();
      if (q() < 0.6) { x.beginPath(); x.ellipse(tx + rr * 0.7, top + rr * 0.6, rr * 0.7, rr * 0.8, 0, 0, 6.283); x.fill(); }
    }
    x.globalAlpha = 1;
  };
  katman('#13284c', 80, 16, 18, 32, 1.1, 7, 21, 0.9);
  gr = x.createLinearGradient(0, 50, 0, 82); gr.addColorStop(0, 'rgba(42,90,138,0)'); gr.addColorStop(1, 'rgba(42,90,138,0.35)');
  x.fillStyle = gr; x.fillRect(L, 50, R - L, 32);
  katman('#0f2244', 82, 10, 24, 46, 2, 9, 33, 1);
  gr = x.createLinearGradient(0, 60, 0, 84); gr.addColorStop(0, 'rgba(42,90,138,0)'); gr.addColorStop(1, 'rgba(60,120,170,0.28)');
  x.fillStyle = gr; x.fillRect(L, 60, R - L, 24);
  });
  A.adim.push(() => {
  x.setTransform(k, 0, 0, k, shCX(), 0);
  // yakın gövdeler (kenarlarda) ve tepe yaprakları
  x.fillStyle = '#081530';
  for (const [tx, w] of [[L + 6, 7], [R - 9, 9], [L + 24, 3.2], [R - 30, 3.6]]) {
    x.beginPath(); x.moveTo(tx - w / 2, -2); x.bezierCurveTo(tx - w / 2 - 1, 40, tx - w / 2 + 1, 70, tx - w, 86); x.lineTo(tx + w, 86);
    x.bezierCurveTo(tx + w / 2 - 1, 70, tx + w / 2 + 1, 40, tx + w / 2, -2); x.fill();
  }
  x.fillStyle = '#060f26';
  for (let i = 0, xx = L; xx < R; i++) { const rr = 7 + ((i * 37) % 9); x.beginPath(); x.ellipse(xx, -3 + ((i * 13) % 5), rr * 1.3, rr, 0, 0, 6.283); x.fill(); xx += rr * 1.5; }
  // zemin: koyu toprak, camgöbeği kenar ışığı (oyundaki gibi)
  const zemin = (yy) => SH_YER + Math.sin(yy * 0.09) * 1.2 + Math.sin(yy * 0.23 + 1) * 0.6;
  x.beginPath(); x.moveTo(L, 102);
  for (let xx = L; xx <= R; xx += 1.5) x.lineTo(xx, zemin(xx));
  x.lineTo(R, 102); x.closePath();
  x.fillStyle = '#03060f'; x.fill();
  x.save(); x.clip();
  gr = x.createLinearGradient(0, SH_YER - 2, 0, 100); gr.addColorStop(0, 'rgba(40,90,140,0.25)'); gr.addColorStop(0.3, 'rgba(10,20,40,0)'); x.fillStyle = gr; x.fillRect(L, 76, R - L, 26);
  x.restore();
  x.lineCap = 'round';
  for (const [lw, al] of [[1.6, 0.12], [0.8, 0.25], [0.32, 0.9]]) {
    x.strokeStyle = `rgba(127,232,255,${al})`; x.lineWidth = lw; x.beginPath();
    for (let xx = L; xx <= R; xx += 1.5) x.lineTo(xx, zemin(xx) + 0.1); x.stroke();
  }
  // ot uçları
  const q = rng(5); x.strokeStyle = '#0a1830'; x.lineWidth = 0.35;
  for (let xx = L; xx < R; xx += 0.9 + q() * 1.4) { const h = 0.8 + q() * 1.8, y0 = zemin(xx); x.beginPath(); x.moveTo(xx, y0 + 0.4); x.quadraticCurveTo(xx + 0.3, y0 - h * 0.6, xx + (q() - 0.5) * 1.2, y0 - h); x.stroke(); }
  x.setTransform(1, 0, 0, 1, 0, 0);
  gr = x.createRadialGradient(W / 2, H * 0.5, H * 0.4, W / 2, H * 0.5, Math.hypot(W, H) * 0.62);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(1,3,12,0.55)');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  });
  return A;
}
function shOrmanCiz() { const A = shOrmanAdim(); for (const f of A.adim) f(); return A.c; }

// ══════════════════ KARAKTERLER ══════════════════
// x, y oda birimi; olc = oyundaki boya göre ölçek (1 = oyundaki boy)
// kucakPoz: Feza'nın kollarının arasına çizilecek Pırıl pozu (null = boş kucak). Dönüş: kucak noktası (oda birimi).
const shKucak = { x: SH_PIRIL.x, y: SH_PIRIL.y, px: SH_PIRIL.x, py: SH_PIRIL.y };   // px,py: peluşun çizildiği yer
// kucaktaki peluşun kucak noktasına göre yeri (oyun birimi) ve boyu: yüzü Feza'nın yanağına binmesin, kolların arasında dursun
const SH_KUC = { dx: 4, dy: -7, s: 0.86 };   // peluş boyu: Feza'nın başı kadar (1.18 yatak ölçeğinde); hiçbir durumda bundan büyümez 
const SH_KUC_OTUR = { dx: 4, dy: 11, s: 0.82 };   // otururken: kucağında, başı çenesinin altında kalır (yüzü örtülmesin)
const SH_KUC_KIRP = { dx: 27, dy: -14, s: 0.9 };   // sabah göz kırpma: Feza onu yanağının yanına kaldırır (bütün başı görünür)
const shKucOfs = { dx: 0, dy: 0, s: 1 };
// pozTm: pozun kendi zamanı (uyanis için); verilmezse tm.
function shFeza(x, y, olc, poz, tm, kucakPoz, kucakU, kucakTm, pozTm) {
  const pxu = sh.k0 * sh.zoom;
  if (typeof fezaCizPoz === 'function') {
    g.save(); const px = shEkranX(x), py = shEkranY(y);
    g.setTransform(1, 0, 0, 1, 0, 0);
    const pirilVar = kucakPoz && typeof pirilCizPoz === 'function';
    // yatış → oturuş ('uyanis' 0.5–1.1 sn) arasında peluşun yeri de yumuşakça değişir
    const ptm = pozTm == null ? tm : pozTm, otur = poz === 'uyanis' ? shEase(shSeg(ptm, 0.45, 1.15)) : poz === 'sarilma' ? 1 : 0;
    shKucOfs.dx = lerp(SH_KUC.dx, SH_KUC_OTUR.dx, otur); shKucOfs.dy = lerp(SH_KUC.dy, SH_KUC_OTUR.dy, otur); shKucOfs.s = lerp(SH_KUC.s, SH_KUC_OTUR.s, otur);
    const kk = sh.kirpK || 0;
    if (kk > 0) { shKucOfs.dx = lerp(shKucOfs.dx, SH_KUC_KIRP.dx, kk); shKucOfs.dy = lerp(shKucOfs.dy, SH_KUC_KIRP.dy, kk) - Math.sin(kk * Math.PI) * 3; shKucOfs.s = lerp(shKucOfs.s, SH_KUC_KIRP.s, kk); }
    shKucOfs.s = Math.min(shKucOfs.s, 0.92);   // üst sınır: peluş asla Feza'dan büyük görünmesin
    const ara = pirilVar ? (c, kx, ky, o) => {
      sh.prEk = { x: kx + shKucOfs.dx * o, y: ky + shKucOfs.dy * o, s: o * shKucOfs.s };   // Pırıl'ın ekrandaki yeri (göz kırpma parıltısı için)
      if (pirilVar) try { pirilCizPoz(c, sh.prEk.x, sh.prEk.y, sh.prEk.s, kucakPoz, kucakTm == null ? tm : kucakTm, kucakU); } catch (e) { shHata('pirilCizPoz', e); }
    } : null;
    try {
      const k = fezaCizPoz(g, px, py, olc * S * sh.zoom, poz, pozTm == null ? tm : pozTm, ara, sh.fzOpt || undefined);
      if (k) { shKucak.x = (k.x - shEkranX(0)) / pxu; shKucak.y = (k.y - shEkranY(0)) / pxu; const o = olc * S / sh.k0; shKucak.px = shKucak.x + shKucOfs.dx * o; shKucak.py = shKucak.y + shKucOfs.dy * o; }
    } catch (e) { shHata('fezaCizPoz', e); }
    g.restore(); return;
  }
  shFezaYedek(x, y, olc * 100 / VH, poz, pozTm == null ? tm : pozTm);
  if (kucakPoz) shPiril(SH_PIRIL.x, SH_PIRIL.y, olc * 0.92, kucakPoz, tm, 1, kucakU);
}
function shPiril(x, y, olc, poz, tm, f = 1, u) {
  if (typeof pirilCizPoz === 'function') {
    g.save(); const px = shEkranX(x), py = shEkranY(y);
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (f < 0) { g.translate(px, 0); g.scale(-1, 1); g.translate(-px, 0); }
    try { pirilCizPoz(g, px, py, olc * S * sh.zoom, poz, tm, u); } catch (e) { shHata('pirilCizPoz', e); }
    g.restore(); return;
  }
  shPirilYedek(x, y, olc * 100 / VH, poz, tm, f);
}
// feza.js bu pozu biliyor mu? (bilinmeyen poz 'ayakta' çizilir; o yüzden kaynak metninde poz adı aranır, bir kez)
const shPozlar = {};
function shPozVar(p) {
  if (shPozlar[p] === undefined) { try { shPozlar[p] = typeof fezaCizPoz === 'function' && String(fezaCizPoz).indexOf("'" + p + "'") >= 0; } catch (e) { shPozlar[p] = false; } }
  return shPozlar[p];
}
const shHatalar = {};
function shHata(ad, e) { if (!shHatalar[ad]) { shHatalar[ad] = 1; console.warn('[sahne] ' + ad, e); } }
// yer tutucular (gerçek pozlar gelene kadar): oda biriminde, s = oyun birimi başına oda birimi
function shFezaYedek(x, y, s, poz, tm) {
  shOdaT(); g.save(); g.translate(x, y); g.scale(s, s);
  if (poz === 'uyku') {
    g.fillStyle = '#e9e2d4'; g.beginPath(); g.ellipse(4, -10, 30, 10, 0, 0, 6.283); g.fill();          // pijama
    g.fillStyle = '#f8d5bc'; g.beginPath(); g.arc(-34, -16, 14, 0, 6.283); g.fill();                // baş
    g.fillStyle = '#4a2e1c'; g.beginPath(); g.arc(-36, -20, 14.5, Math.PI * 0.95, Math.PI * 2.15); g.fill();
    g.strokeStyle = '#26150b'; g.lineWidth = 1.6; g.beginPath(); g.arc(-29, -15, 3.2, 0.3, 2.8); g.stroke();
    g.fillStyle = 'rgba(240,140,140,0.5)'; g.beginPath(); g.arc(-27, -10, 3, 0, 6.283); g.fill();
    g.fillStyle = '#f8d5bc'; g.beginPath(); g.ellipse(-12, -16, 9, 4, -0.3, 0, 6.283); g.fill();     // kol
  } else {
    g.fillStyle = '#e9e2d4'; g.beginPath(); g.ellipse(0, -22, 13, 22, 0, 0, 6.283); g.fill();
    g.fillStyle = '#f8d5bc'; g.beginPath(); g.arc(0, -52, 14, 0, 6.283); g.fill();
    g.fillStyle = '#4a2e1c'; g.beginPath(); g.arc(-1, -56, 14.5, Math.PI * 0.95, Math.PI * 2.1); g.fill();
    const ov = Math.sin(tm * 6) * 2;
    g.fillStyle = '#f8d5bc'; g.beginPath(); g.ellipse(8 + ov, -50, 5, 4, 0, 0, 6.283); g.fill();
    g.strokeStyle = '#26150b'; g.lineWidth = 1.6; g.beginPath(); g.arc(-5, -52, 2.6, 3.4, 6); g.stroke();
    g.strokeStyle = '#b05a48'; g.beginPath(); g.arc(0, -46, 3.5, 0.3, 2.8); g.stroke();
  }
  g.restore();
}
function shPirilYedek(x, y, s, poz, tm, f) {
  shOdaT(); g.save(); g.translate(x, y); g.scale(s * f, s);
  if (poz === 'ucus') g.translate(0, Math.sin(tm * 3) * 2);
  g.fillStyle = '#8550ee'; g.beginPath(); g.ellipse(0, 0, 13, 10, 0, 0, 6.283); g.fill();
  g.beginPath(); g.arc(11, -9, 9, 0, 6.283); g.fill();
  g.fillStyle = '#ecdcff'; g.beginPath(); g.ellipse(2, 3, 7, 5, 0, 0, 6.283); g.fill();
  g.fillStyle = '#a77cff'; const fl = poz === 'ucus' ? Math.sin(tm * 12) * 0.5 : 0;
  g.beginPath(); g.moveTo(-2, -6); g.lineTo(-12, -20 - fl * 8); g.lineTo(-14, -6); g.closePath(); g.fill();
  g.fillStyle = '#fff1d6'; g.beginPath(); g.moveTo(9, -16); g.lineTo(8, -22); g.lineTo(12, -17); g.fill();
  const acik = poz === 'uyaniyor' || poz === 'ucus' || (poz === 'goz_kirp' && false);
  g.strokeStyle = '#2b1450'; g.lineWidth = 1.5;
  if (acik) { g.fillStyle = '#2b1450'; g.beginPath(); g.arc(14, -10, 2.4, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(14.8, -11, 0.8, 0, 6.283); g.fill(); }
  else { g.beginPath(); g.arc(14, -10, 2.2, 0.2, 2.9); g.stroke(); }
  g.restore();
}

// ══════════════════ DEĞİŞEN PARÇALAR ══════════════════
// perdeler → sarmaşıklar (c: 0 perde, 1 sarmaşık)
function shPerdeler(p, c, tm, acik) {
  shOdaT();
  const gece0 = p.sky === 'gece', bu = sh.tema === 'bulut' && c > 0, gl = sh.tema === 'gol' && c > 0;
  for (const yon of [-1, 1]) {
    const kenar = yon < 0 ? SH_PEN.x0 - 4.5 : SH_PEN.x1 + 4.5;
    for (let i = 0; i < SH_KAT.length; i++) {
      const [ux, ak, w0, boy] = SH_KAT[i];
      const yayil = lerp(1, 2.6, c) + (acik || 0) * 0.5;
      const tx = kenar - yon * ux * 0.55 * yayil + yon * c * (i - 1.5) * 1.2 + (acik ? -yon * 1.5 * acik : 0);
      const ust = bu ? lerp(9.6, 13 + (i % 2) * 2 - i * 1.2, shEase(c)) : lerp(9.6, -4 - (i % 2) * 3, shEase(c));
      const alt = bu ? lerp(58 + (i % 2) * 0.8, 27 + (i % 2) * 3 + i * 1.5, shEase(c)) : lerp(58 + (i % 2) * 0.8, ust + boy * 0.9, shEase(c));
      const w = bu ? lerp(w0, w0 * 1.5, shEase(c)) : lerp(w0, 0.75, shEase(c));
      const salin = Math.sin(tm * (0.7 + i * 0.13) + i * 1.7 + yon) * (0.35 + c * 1.6);
      const bx = tx + ak * yon * (1 - c) * 0.6 + salin, mx = (tx + bx) / 2 + salin * 0.4;
      // bağlama (tie-back) etkisi: gece kapalıya yakın, sabah biraz açık
      const bel = lerp(0, -yon * 1.4, (1 - c) * (acik || 0));
      const ort = (ust + alt) / 2;
      const col = shMix(p.curtain[i % 2], bu ? '#ffd3e3' : gl ? '#2a3a8a' : '#1e5b54', c), colD = shMix(p.curtain[2], bu ? '#f0a8c4' : gl ? '#141d52' : '#0e3330', c);
      g.beginPath();
      g.moveTo(tx - w / 2, ust);
      g.quadraticCurveTo(mx - w / 2 + bel, ort, bx - w / 2, alt);
      // etek: küçük dalgalı kıvrım
      g.quadraticCurveTo(bx, alt + 0.9 * (1 - c) + 0.3, bx + w / 2, alt);
      g.quadraticCurveTo(mx + w / 2 + bel, ort, tx + w / 2, ust);
      g.closePath();
      const gr = g.createLinearGradient(tx - w / 2, 0, tx + w / 2, 0);
      gr.addColorStop(0, colD); gr.addColorStop(0.28, col); gr.addColorStop(0.5, c > 0.5 ? col : shMix(p.curtain[i % 2], '#ffffff', 0.16 * (1 - c))); gr.addColorStop(0.72, col); gr.addColorStop(1, colD);
      g.globalAlpha = lerp(gece0 ? 0.84 : 0.8, 1, c) * (bu ? 1 - shSeg(c, 0.35, 0.8) : 1); g.fillStyle = gr; g.fill(); g.globalAlpha = 1;
      if (c < 0.6) {   // kıvrım gölgeleri, etek bandı, pencereye bakan kenarda ay/güneş ışığı geçişi
        const va = 1 - c / 0.6;
        g.save(); g.clip(); g.lineCap = 'round';
        for (const kk of [-0.24, 0.2]) {
          g.strokeStyle = colD; g.lineWidth = 0.2; g.globalAlpha = 0.4 * va; g.beginPath(); g.moveTo(tx + w * kk, ust); g.quadraticCurveTo(mx + w * kk + bel, ort, bx + w * kk, alt); g.stroke();
          g.strokeStyle = '#ffffff'; g.lineWidth = 0.14; g.globalAlpha = (gece0 ? 0.1 : 0.24) * va; g.beginPath(); g.moveTo(tx + w * (kk + 0.1), ust); g.quadraticCurveTo(mx + w * (kk + 0.1) + bel, ort, bx + w * (kk + 0.1), alt); g.stroke();
        }
        g.globalAlpha = 0.34 * va; g.fillStyle = colD; g.fillRect(bx - w, alt - 1.5, w * 2, 2);
        g.globalAlpha = 0.6 * va; g.fillStyle = p.tie; g.fillRect(bx - w, alt - 1.55, w * 2, 0.16);
        const lg = g.createLinearGradient(tx - w / 2, 0, tx + w / 2, 0), kp = yon < 0 ? 1 : 0;
        lg.addColorStop(kp, gece0 ? 'rgba(170,200,255,0.34)' : 'rgba(255,238,190,0.5)'); lg.addColorStop(1 - kp, 'rgba(255,255,255,0)');
        g.globalAlpha = va; g.fillStyle = lg; g.fillRect(tx - w, ust, w * 2 + 2, alt - ust + 2);
        g.restore(); g.globalAlpha = 1;
        // çubuğa takılı halkalar
        g.strokeStyle = p.rod; g.lineWidth = 0.28; g.globalAlpha = va; g.beginPath(); g.arc(tx - w * 0.22, ust - 0.1, 0.55, 0, 6.283); g.stroke(); g.beginPath(); g.arc(tx + w * 0.22, ust - 0.1, 0.55, 0, 6.283); g.stroke(); g.globalAlpha = 1;
      }
      if (bu && c > 0.12) {   // perde kumaşı kabarık pembe bulutlara dönüşür (üç katman: gölge, gövde, ışık)
        const lc = shEase(shSeg(c, 0.12, 0.9)), n = 5;
        for (let ps = 0; ps < 3; ps++) {
          g.fillStyle = ps === 0 ? '#e7a0c2' : ps === 1 ? '#ffd8e6' : '#fff4f2'; g.globalAlpha = ps === 2 ? 0.7 : 0.97; g.beginPath();
          for (let j = 0; j < n; j++) {
            const tt = j / (n - 1), yy0 = lerp(ust, alt, tt) - c * 2.5 * (1 - tt) + Math.sin(tm * 0.5 + j + i) * 0.3 * c;
            const xx0 = lerp(lerp(tx, mx + bel, tt), lerp(mx + bel, bx, tt), tt) + yon * (tt * 6 + i * 1.2) * shEase(c) + Math.sin(tm * 0.4 + j * 1.3 + i) * 0.6 * c;   // bulut aşağıda dışa doğru kabarır
            const rr = (2.2 + ((i + j) % 3) * 0.7) * lc * (1.3 - 0.5 * Math.abs(tt - 0.4)) * (ps === 2 ? 0.55 : 1);
            const xx = xx0 + (ps === 2 ? -rr * 0.3 : 0), yy = yy0 + (ps === 0 ? rr * 0.22 : ps === 2 ? -rr * 0.5 : -rr * 0.05);
            g.moveTo(xx + rr, yy); g.arc(xx, yy, rr, 0, 6.283);
          }
          g.fill();
        }
        g.globalAlpha = 1;
      }
      // sarmaşık yaprakları
      if (c > 0.25 && !bu) {
        const lc = shSeg(c, 0.25, 1), n = Math.floor((alt - ust) / 4.2);
        for (let j = 1; j <= n; j++) {
          const tt = j / (n + 0.6), yy = lerp(ust, alt, tt);
          const xx = lerp(lerp(tx, mx + bel, tt), lerp(mx + bel, bx, tt), tt);
          const sc = lc * shEase(clamp(lc * 1.6 - tt * 0.6, 0, 1)) * (0.8 + ((i + j) % 3) * 0.15);
          if (sc < 0.05) continue;
          const sag = (i + j) % 2 ? 1 : -1, a = sag * (0.7 + Math.sin(tm * 1.3 + j + i) * 0.12);
          g.save(); g.translate(xx, yy); g.rotate(a); g.scale(sc, sc);
          if (gl) { g.fillStyle = j % 3 ? '#ffe9a8' : '#cfe0ff'; g.globalAlpha = 0.6 + 0.4 * Math.sin(tm * 2.3 + i * 1.3 + j * 2.1); shYildiz4(g, 1.4 * sag, 0, 1.05, 0.3); g.fill(); g.globalAlpha = 1; }   // yıldız damlaları
          else {
          g.fillStyle = j % 3 ? '#2c7a6a' : '#3b9a7e';
          g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(1.6 * sag, -0.9, 3.2 * sag, 0); g.quadraticCurveTo(1.6 * sag, 0.9, 0, 0); g.fill();
          }
          g.restore();
        }
      }
    }
  }
  if (c < 0.4) {   // tutma bağı: kumaşı belinden toplar; duvarda altın kanca, altında püskül
    shOdaT(); const va = 1 - c / 0.4, ac = acik || 0;
    for (const yon of [-1, 1]) {
      const kenar = yon < 0 ? SH_PEN.x0 - 4.5 : SH_PEN.x1 + 4.5, cx = kenar - yon * (2 + 0.7 * ac), hw = 3.3 - ac * 0.7, yb = 33.6;
      g.globalAlpha = va;
      g.fillStyle = p.tie; shRR(g, cx - hw, yb, hw * 2, 1.15, 0.5); g.fill();
      g.fillStyle = '#ffffff'; g.globalAlpha = va * 0.45; g.fillRect(cx - hw + 0.4, yb + 0.15, hw * 2 - 0.8, 0.22); g.globalAlpha = va;
      g.strokeStyle = p.rod; g.lineWidth = 0.28; g.beginPath(); g.arc(cx + yon * (hw + 0.55), yb + 0.58, 0.6, 0, 6.283); g.stroke();
      const tx2 = cx - yon * (hw - 0.4);   // püskül
      g.strokeStyle = p.tie; g.lineWidth = 0.2; g.beginPath(); g.moveTo(tx2, yb + 1.1); g.lineTo(tx2, yb + 2.4); g.stroke();
      g.fillStyle = p.tie; g.beginPath(); g.arc(tx2, yb + 2.7, 0.45, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(tx2 - 0.45, yb + 2.9); g.lineTo(tx2 + 0.45, yb + 2.9); g.lineTo(tx2 + 0.3, yb + 4.2); g.lineTo(tx2 - 0.3, yb + 4.2); g.fill();
      g.globalAlpha = 1;
    }
  }
  // sarmaşık uçlarında ışıklı tomurcuklar
  if (c > 0.5 && !bu) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const a = shSeg(c, 0.5, 1);
    for (const yon of [-1, 1]) {
      const kenar = yon < 0 ? SH_PEN.x0 - 4.5 : SH_PEN.x1 + 4.5;
      for (let i = 0; i < SH_KAT.length; i++) {
        const [ux, , , boy] = SH_KAT[i], yayil = 2.6;
        const tx = kenar - yon * ux * 0.55 * yayil + yon * (i - 1.5) * 1.2 + Math.sin(tm * (0.7 + i * 0.13) + i * 1.7 + yon) * 1.9;
        const alt = -4 - (i % 2) * 3 + boy * 0.9;
        const px = shEkranX(tx), py = shEkranY(alt), r = sh.k0 * sh.zoom;
        dglow(gl ? '#ffe39a' : '#7fe8ff', px, py + r * 0.8, r * 3.5, a * (0.55 + 0.2 * Math.sin(tm * 2 + i)));
        dglow('#ffffff', px, py + r * 0.8, r * 0.9, a * 0.7);
      }
    }
    g.globalCompositeOperation = 'source-over';
  }
}

// ahşap tahta (oda biriminde): yuvarlak köşe, yanal ışık-gölge, boyalı damar, ince kenar; mod 1/2: başlık/ayak (damar dikey)
function shAhsap(x0, y0, w, h, r, p, mod) {
  const fa = g.globalAlpha;
  shRR(g, x0, y0, w, h, r);
  const gr = g.createLinearGradient(x0, 0, x0 + w, 0);
  gr.addColorStop(0, p.bedD); gr.addColorStop(0.12, p.bed); gr.addColorStop(0.35, p.bedHi); gr.addColorStop(0.6, p.bed); gr.addColorStop(1, p.bedD);
  g.fillStyle = gr; g.fill();
  g.save(); shRR(g, x0, y0, w, h, r); g.clip();
  g.lineCap = 'round'; g.strokeStyle = p.bedD; g.lineWidth = 0.13; g.globalAlpha = fa * 0.38;
  for (let i = 1; i < 6; i++) { const gx = x0 + w * i / 6 + (mod * 0.13); g.beginPath(); g.moveTo(gx, y0); for (let t = 0; t <= 1.001; t += 0.1) g.lineTo(gx + Math.sin(t * 5 + i * 2.3 + mod) * 0.22, y0 + h * t); g.stroke(); }
  g.strokeStyle = p.bedHi; g.globalAlpha = fa * 0.3;
  for (let i = 0; i < 3; i++) { const gx = x0 + w * (0.25 + i * 0.22); g.beginPath(); g.moveTo(gx, y0 + h * 0.05); g.quadraticCurveTo(gx + 0.25, y0 + h * 0.45, gx - 0.1, y0 + h * 0.95); g.stroke(); }
  g.globalAlpha = fa * 0.4; g.fillStyle = p.bedD; g.fillRect(x0, y0 + h - 0.8, w, 0.8);
  g.restore(); g.globalAlpha = fa;
  g.strokeStyle = p.bedD; g.lineWidth = 0.16; g.globalAlpha = fa * 0.7; shRR(g, x0, y0, w, h, r); g.stroke(); g.globalAlpha = fa;
}
// yatak → yosun tümseği (b: 0 yatak, 1 yosun); f: çerçevenin kayboluşu
function shYatakArka(p, b, f, tm) {
  shOdaT();
  const Y = SH_YATAK;
  // yosun tümseği (toprak) – yatağın yerini alır
  const fa = 1 - f;
  if (fa > 0.01) {
    g.globalAlpha = fa;
    const bat = f * 6;   // çerçeve toprağa gömülür
    // yatağın zemine düşen yumuşak gölgesi
    { const sg0 = g.createRadialGradient((Y.x0 + Y.x1) / 2, 79.6 + bat, 1, (Y.x0 + Y.x1) / 2, 79.6 + bat, 33);
      sg0.addColorStop(0, p.sky === 'gece' ? 'rgba(2,3,18,0.5)' : 'rgba(90,50,30,0.28)'); sg0.addColorStop(1, 'rgba(0,0,0,0)');
      g.save(); g.translate((Y.x0 + Y.x1) / 2, 79.6 + bat); g.scale(1, 0.1); g.translate(-(Y.x0 + Y.x1) / 2, -(79.6 + bat)); g.fillStyle = sg0; g.fillRect(Y.x0 - 36, 79.6 + bat - 36, 108, 72); g.restore(); }
    // ayaklar (arka ayaklar koyu, ön ayaklar ışıklı; aşağı doğru hafif incelen)
    for (const lx of [Y.x0 + 2.2, Y.x1 - 4.4]) {
      g.fillStyle = p.bedD; g.beginPath(); g.moveTo(lx, 70 + bat); g.lineTo(lx + 2.2, 70 + bat); g.lineTo(lx + 1.8, 79.4 + bat); g.quadraticCurveTo(lx + 1.1, 79.9 + bat, lx + 0.4, 79.4 + bat); g.closePath(); g.fill();
      g.fillStyle = p.bedHi; g.globalAlpha = fa * 0.35; g.fillRect(lx + 0.2, 71 + bat, 0.35, 8); g.globalAlpha = fa;
    }
    // başlık (yuvarlak tepeli) + ayak ucu: ahşap
    shAhsap(Y.x0 - 3, 43 + bat, 4.2, 37, 1.5, p, 1);
    shAhsap(Y.x1 - 0.5, 53 + bat, 3.6, 27, 1.3, p, 2);
    // başlık tepesinde topuz, tahta üzerinde oyma panel + yıldız
    g.fillStyle = p.bed; g.beginPath(); g.arc(Y.x0 - 0.9, 42.2 + bat, 1.7, 0, 6.283); g.fill();
    g.fillStyle = p.bedHi; g.globalAlpha = fa * 0.7; g.beginPath(); g.arc(Y.x0 - 1.35, 41.7 + bat, 0.55, 0, 6.283); g.fill(); g.globalAlpha = fa;
    g.strokeStyle = p.bedD; g.lineWidth = 0.18; g.globalAlpha = fa * 0.55; shRR(g, Y.x0 - 2.2, 45 + bat, 2.6, 13, 1.1); g.stroke(); shRR(g, Y.x0 - 2.2, 59 + bat, 2.6, 12, 0.6); g.stroke(); g.globalAlpha = fa;
    g.fillStyle = p.bedHi; shYildiz5(g, Y.x0 - 0.9, 51 + bat, 1.05); g.fill();
    g.fillStyle = p.bed; g.beginPath(); g.arc(Y.x1 + 1.3, 52.5 + bat, 1.4, 0, 6.283); g.fill();
    g.fillStyle = p.bedHi; g.globalAlpha = fa * 0.7; g.beginPath(); g.arc(Y.x1 + 0.85, 52 + bat, 0.45, 0, 6.283); g.fill(); g.globalAlpha = fa;
    // yatak gövdesi (çerçeve)
    { const fg = g.createLinearGradient(0, 66 + bat, 0, 72.5 + bat); fg.addColorStop(0, p.bedHi); fg.addColorStop(0.18, p.bed); fg.addColorStop(1, p.bedD);
      g.fillStyle = fg; shRR(g, Y.x0, 66 + bat, Y.x1 - Y.x0, 6.5, 1); g.fill();
      g.strokeStyle = p.bedD; g.lineWidth = 0.14; g.globalAlpha = fa * 0.3;
      for (let i = 0; i < 9; i++) { const gy = 67.4 + bat + i * 0.55; g.beginPath(); g.moveTo(Y.x0 + 1, gy); for (let xx = 0; xx <= 1.001; xx += 0.1) g.lineTo(Y.x0 + 1 + (Y.x1 - Y.x0 - 2) * xx, gy + Math.sin(xx * 7 + i * 1.9) * 0.18); g.stroke(); }
      g.globalAlpha = fa; }
    g.fillStyle = p.bedHi; g.globalAlpha = fa * 0.7; g.fillRect(Y.x0 + 1, 66.3 + bat, Y.x1 - Y.x0 - 2, 0.45); g.globalAlpha = fa;
    // çarşaf/şilte
    // çarşaf: üstten yumuşak ışık, alta doğru hafif gölge; önde ince kıvrık kenar (dikiş) ve iki yumuşak kırışık
    const sg = g.createLinearGradient(0, Y.ust, 0, Y.ust + 6.6);
    sg.addColorStop(0, p.sheetHi); sg.addColorStop(0.55, p.sheet); sg.addColorStop(1, p.sheetD);
    g.fillStyle = sg; shRR(g, Y.x0 + 0.5, Y.ust, Y.x1 - Y.x0 - 1, 6.6, 1.6); g.fill();
    g.strokeStyle = p.sheetD; g.lineWidth = 0.18; g.globalAlpha = fa * 0.8;
    g.setLineDash([0.55, 0.4]); g.beginPath(); g.moveTo(Y.x0 + 1.6, Y.ust + 5.4); g.lineTo(Y.x1 - 1.6, Y.ust + 5.4); g.stroke(); g.setLineDash([]);
    // şilte kenarı: yumuşak biyeli (piping) hat ve altına düşen gölge
    g.globalAlpha = fa * 0.55; g.strokeStyle = p.sheetD; g.lineWidth = 0.4; g.beginPath(); g.moveTo(Y.x0 + 1.2, Y.ust + 6.1); g.lineTo(Y.x1 - 1.2, Y.ust + 6.1); g.stroke();
    g.strokeStyle = p.sheetHi; g.lineWidth = 0.14; g.globalAlpha = fa * 0.8; g.beginPath(); g.moveTo(Y.x0 + 1.2, Y.ust + 5.85); g.lineTo(Y.x1 - 1.2, Y.ust + 5.85); g.stroke();
    { const og = g.createLinearGradient(0, Y.ust + 6.5, 0, Y.ust + 8.4); og.addColorStop(0, 'rgba(0,0,0,0.28)'); og.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = fa; g.fillStyle = og; g.fillRect(Y.x0 + 1, Y.ust + 6.5, Y.x1 - Y.x0 - 2, 1.9); }
    g.strokeStyle = p.sheetD; g.lineWidth = 0.18; g.globalAlpha = fa * 0.8;
    g.lineWidth = 0.22; g.lineCap = 'round'; g.globalAlpha = fa * 0.45;
    g.beginPath(); g.moveTo(Y.x0 + 15, Y.ust + 1.6); g.quadraticCurveTo(Y.x0 + 17.5, Y.ust + 3.1, Y.x0 + 16.4, Y.ust + 4.6);
    g.stroke();
    g.globalAlpha = 1;
  }
  // yastık → yumuşak yosun yastığı
  const yx = Y.x0 + 6.6, yy = Y.ust - 2.4;
  // yastık → yamaca kaynaşan yumuşak yosun tümseği
  const bb = shEase(b), yyy = yy + 1.6 * bb, bu = sh.tema === 'bulut';
  // yastık (gece / sabah): kabarık, köşeleri hafif sivri; üstten ışık alır, altı gölgeli; kenarında dikiş, üstünde
  // battaniyedeki gibi minik yıldızlar. Yosuna dönüşürken yumuşakça yosun tümseğine karışır.
  if (bb < 0.999) { g.globalAlpha = 1 - bb; shYastik(p, yx, yy); g.globalAlpha = 1; }
  if (bb > 0.001) {
  g.globalAlpha = bb;
  g.fillStyle = shMix(p.pillow, bu ? '#ffe4ee' : '#2c8069', b);
  g.beginPath(); g.ellipse(yx + 0.6 * bb, yyy, 7 + 1.2 * bb, 3.1 + 2.2 * bb, -0.05 - 0.12 * bb, 0, 6.283); g.fill();
  g.fillStyle = shMix(p.pillowHi, bu ? '#ffffff' : '#4fb592', b, 0.6 - 0.3 * b);
  g.beginPath(); g.ellipse(yx - 1, yyy - 1.3 - 0.8 * bb, 4.8, 1.3, -0.05, 0, 6.283); g.fill();
  g.globalAlpha = 1;
  }
  if (bb > 0.05 && !bu) {   // yosun saçakları
    g.strokeStyle = '#3d9c7e'; g.lineWidth = 0.38; g.lineCap = 'round'; g.globalAlpha = bb; g.beginPath();
    for (let i = 0; i < 9; i++) { const ax = yx - 6.5 + i * 1.5, ay = yyy - Math.sqrt(Math.max(0, 1 - Math.pow((ax - yx) / 8, 2))) * (3.1 + 2.2 * bb) + 0.4; g.moveTo(ax, ay); g.quadraticCurveTo(ax + 0.2, ay - 0.6, ax + ((i % 3) - 1) * 0.4, ay - 1.1 - (i % 2) * 0.4); }
    g.stroke(); g.globalAlpha = 1;
  }
}
// yastık (oda biriminde, shOdaT kurulu): merkez (cx, cy)
const SH_YASTIK_YILDIZ = [[-4.6, -0.9, 0.62], [-1.2, 0.9, 0.5], [2.4, -1.1, 0.58], [5.0, 0.7, 0.46], [-5.6, 1.4, 0.4], [0.9, -2.0, 0.38]];
function shYastikYol(w, h) {
  g.beginPath();
  g.moveTo(-w, -h * 0.82);
  g.bezierCurveTo(-w * 0.45, -h * 1.32, w * 0.45, -h * 1.32, w, -h * 0.82);     // üst: kabarık
  g.bezierCurveTo(w * 0.86, -h * 0.3, w * 0.86, h * 0.3, w, h * 0.82);          // sağ: köşeler hafif dışa
  g.bezierCurveTo(w * 0.45, h * 1.22, -w * 0.45, h * 1.22, -w, h * 0.82);       // alt
  g.bezierCurveTo(-w * 0.86, h * 0.3, -w * 0.86, -h * 0.3, -w, -h * 0.82);      // sol
  g.closePath();
}
function shYastik(p, cx, cy) {
  const w = 7.3, h = 3.2, a0 = g.globalAlpha;
  g.save(); g.translate(cx, cy); g.rotate(-0.05);
  // çarşafa düşen yumuşak gölge
  g.fillStyle = p.sky === 'gece' ? 'rgba(10,12,40,0.35)' : 'rgba(120,90,150,0.16)';
  g.beginPath(); g.ellipse(0.4, h * 0.95, w * 0.95, h * 0.32, 0, 0, 6.283); g.fill();
  shYastikYol(w, h);
  const gr = g.createLinearGradient(0, -h * 1.2, 0, h * 1.1);
  gr.addColorStop(0, p.pillowHi); gr.addColorStop(0.45, p.pillow); gr.addColorStop(1, p.pillowD);
  g.fillStyle = gr; g.fill();
  g.save(); g.clip();
  // sol üstten ışık, sağ altta kabarıklığın gölgesi
  const hg = g.createRadialGradient(-w * 0.35, -h * 0.55, 0, -w * 0.35, -h * 0.55, w * 0.75);
  hg.addColorStop(0, 'rgba(255,255,255,0.75)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = hg; g.fillRect(-w * 1.2, -h * 1.5, w * 2.4, h * 3);
  const dg = g.createRadialGradient(w * 0.75, h * 0.7, 0, w * 0.75, h * 0.7, w * 0.7);
  dg.addColorStop(0, p.sky === 'gece' ? 'rgba(20,24,70,0.35)' : 'rgba(150,120,190,0.22)'); dg.addColorStop(1, 'rgba(150,120,190,0)');
  g.fillStyle = dg; g.fillRect(-w * 1.2, -h * 1.5, w * 2.4, h * 3);
  // minik yıldızlar (battaniyedeki desen)
  g.fillStyle = p.star;
  for (const [sx, sy, sr] of SH_YASTIK_YILDIZ) { g.globalAlpha = a0 * (p.sky === 'gece' ? 0.5 : 0.9); shYildiz5(g, sx, sy, sr); g.fill(); }
  g.globalAlpha = a0;
  // basınç çukuru: ortada yumuşak gölge, çevresinde ışık kenarı
  { const cg = g.createRadialGradient(0, h * 0.1, 0, 0, h * 0.1, w * 0.62);
    cg.addColorStop(0, p.sky === 'gece' ? 'rgba(18,22,66,0.36)' : 'rgba(150,120,190,0.26)'); cg.addColorStop(0.6, p.sky === 'gece' ? 'rgba(18,22,66,0.12)' : 'rgba(150,120,190,0.08)'); cg.addColorStop(1, 'rgba(150,120,190,0)');
    g.save(); g.scale(1, 0.55); g.fillStyle = cg; g.fillRect(-w * 1.2, -h * 3, w * 2.4, h * 6); g.restore();
    g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 0.22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-w * 0.62, -h * 0.58); g.quadraticCurveTo(0, -h * 1.02, w * 0.62, -h * 0.58); g.stroke();
    g.strokeStyle = p.pillowD; g.lineWidth = 0.16; g.globalAlpha = a0 * 0.5; g.beginPath();
    g.moveTo(-w * 0.8, -h * 0.1); g.quadraticCurveTo(-w * 0.5, h * 0.05, -w * 0.28, h * 0.12); g.moveTo(w * 0.8, -h * 0.05); g.quadraticCurveTo(w * 0.5, h * 0.1, w * 0.28, h * 0.14);
    g.moveTo(-w * 0.25, h * 0.55); g.quadraticCurveTo(0, h * 0.7, w * 0.3, h * 0.55); g.stroke(); g.globalAlpha = a0; }
  // köşelerdeki kumaş kıvrımları
  g.strokeStyle = p.pillowD; g.lineWidth = 0.2; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-w * 0.93, -h * 0.72); g.quadraticCurveTo(-w * 0.78, -h * 0.5, -w * 0.62, -h * 0.55);
  g.moveTo(w * 0.93, -h * 0.72); g.quadraticCurveTo(w * 0.78, -h * 0.5, w * 0.62, -h * 0.55);
  g.moveTo(-w * 0.93, h * 0.72); g.quadraticCurveTo(-w * 0.8, h * 0.5, -w * 0.64, h * 0.56);
  g.moveTo(w * 0.93, h * 0.72); g.quadraticCurveTo(w * 0.8, h * 0.5, w * 0.64, h * 0.56);
  g.stroke();
  g.restore();
  // dikiş (içeride kesik çizgi) + kenar
  g.strokeStyle = p.pillowSeam; g.lineWidth = 0.1; g.setLineDash([0.32, 0.26]);
  g.save(); g.scale(0.86, 0.78); shYastikYol(w, h); g.restore(); g.stroke(); g.setLineDash([]);
  g.strokeStyle = p.pillowEdge; g.lineWidth = 0.2; shYastikYol(w, h); g.stroke();
  g.restore();
}
function shBattaniye(p, b, tm, nefes, otur = 0) {
  shOdaT();
  const Y = SH_YATAK, n = nefes || 0, bb = shEase(b), bu = sh.tema === 'bulut';
  const kalcaH = lerp(3.2 + n * 0.35, 0.9, otur), dizH = lerp(1.6, 2.2, otur);
  // yatarken battaniye Feza'nın göğsünden ayak ucuna kadar bütün gövdesini örter (bacaklar dışarıda kalmasın):
  // gövdenin üstünde yumuşak, yuvarlak bir tümsek (oda biriminde gövde ≈ x −37…−29, üst kenarı y ≈ 54.5)
  const yat = 1 - otur;
  const ust = (xx) => {   // battaniyenin üst kenarı (Feza'nın gövdesinin üstünden geçer)
    const t = (xx - -38) / 41;
    const kalca = Math.exp(-Math.pow((xx + 25.5) / 4.6, 2)) * kalcaH, diz = Math.exp(-Math.pow((xx + 17 + otur * 3) / 4, 2)) * dizH;
    const taban = 58.8 - kalca - diz + t * 0.6 - Math.max(0, -(xx + 33)) * 0.1;
    if (yat <= 0.001) return taban;
    const w = shEase(clamp((xx + 35.2) / 2.6, 0, 1)) * (1 - shEase(clamp((xx + 28.6) / 4.2, 0, 1)));
    const govde = 54.0 - n * 0.25 + Math.pow((xx + 31) / 5, 2) * 0.9;
    return lerp(taban, Math.min(taban, govde), w * yat);
  };
  const x0 = lerp(-37.6, -34.5, otur), x1 = Y.x1 + 0.6, altY = lerp(69.6, SH_YER + 2, bb);
  // yatak örtüsü (b=0) → yumuşak yosun tepeciği (b=1): kenar noktaları birlikte kayar
  const sagK = { x: lerp(x1 + 2.2, x1 + 8, bb), y: lerp(ust(x1) + 1, ust(x1) + 1.5, bb) };
  const sagA = { x: lerp(x1 + 2, x1 + 15, bb), y: altY };
  const solA = { x: lerp(x0 - 1, -64, bb), y: altY };
  const solK1 = { x: lerp(x0 - 2.4, -55, bb), y: lerp(altY - 1, 70, bb) }, solK2 = { x: lerp(x0 - 2.2, -50, bb), y: lerp(65.6, 60.4, bb) };
  const yol = new Path2D();
  yol.moveTo(x0, ust(x0));
  for (let xx = x0; xx <= x1; xx += 1) yol.lineTo(xx, ust(xx));
  yol.quadraticCurveTo(sagK.x, sagK.y, sagA.x, sagA.y);
  const dal = 0.5 * (1 - bb);
  for (let xx = sagA.x; xx >= solA.x; xx -= 2) yol.lineTo(xx, altY + Math.sin(xx * 0.9) * dal);
  yol.bezierCurveTo(solK1.x, solK1.y, solK2.x, solK2.y, x0 - 0.5 * bb, ust(x0) + 1.2 * bb);
  yol.closePath();
  const deniz = sh.tema === 'deniz', gol = sh.tema === 'gol';
  const topC = bu ? '#fff4f8' : deniz ? '#30b0b8' : gol ? '#287a6d' : '#2f8a72';
  const midC = bu ? '#ffd6e6' : deniz ? '#166a78' : gol ? '#1a5048' : '#1d5f52';
  const botC = bu ? '#e7a3c4' : deniz ? '#072430' : gol ? '#081f20' : '#06141c';
  const gr = g.createLinearGradient(0, 52, 0, altY);
  gr.addColorStop(0, shMix(p.blanketHi, topC, bb)); gr.addColorStop(0.3, shMix(p.blanket, midC, bb)); gr.addColorStop(1, shMix(p.blanketD, botC, bb));
  g.fillStyle = gr; g.fill(yol);
  // yosun dokusu: yumuşak açık/koyu lekeler (yalnız tepecikte)
  if (bb > 0.02) {
    g.save(); g.clip(yol);
    if (!shYosun) { const r = rng(91); shYosun = []; for (let i = 0; i < 46; i++) shYosun.push([-66 + r() * 86, 58 + r() * 30, 1.5 + r() * 4.5, 0.8 + r() * 1.8, r() < 0.55]); }
    for (const [mx, my, rx, ry, acik] of shYosun) {
      g.globalAlpha = bb * (bu ? (acik ? 0.35 : 0.18) : deniz ? (acik ? 0.32 : 0.22) : (acik ? 0.22 : 0.3));
      g.fillStyle = bu ? (acik ? '#ffffff' : '#e7a3c4') : deniz ? (acik ? '#5fe0e8' : '#0f4852') : gol ? (acik ? '#48cfb0' : '#0c3832') : (acik ? '#4fb592' : '#0b2e2c');
      g.beginPath(); g.ellipse(mx, my, rx, ry, 0, 0, 6.283); g.fill();
    }
    // yosunun üst kenarında masalsı yumuşak filizler & ay ışığı parıltısı
    if (bb > 0.15) {
      const spA = smooth(clamp((bb - 0.15) / 0.7, 0, 1));
      g.strokeStyle = bu ? 'rgba(255,240,250,0.55)' : deniz ? 'rgba(160,255,245,0.55)' : gol ? 'rgba(140,255,220,0.5)' : 'rgba(150,255,200,0.55)';
      g.lineWidth = 0.35;
      g.beginPath();
      for (let xx = x0 + 1; xx <= x1 - 1; xx += 2.2) {
        const uy = ust(xx), fz = Math.sin(xx * 2.3 + tm * 1.6) * 0.7;
        g.moveTo(xx, uy + 0.5); g.lineTo(xx + fz * 0.4, uy - 1.2 * spA + fz * 0.3);
      }
      g.stroke();
    }
    // tepeden süzülen ay ışığı (üst kenara yakın açık bant)
    const ug = g.createLinearGradient(0, 55, 0, 66); ug.addColorStop(0, bu ? 'rgba(255,236,210,0.5)' : deniz ? 'rgba(160,245,255,0.32)' : 'rgba(120,230,200,0.28)'); ug.addColorStop(1, bu ? 'rgba(255,236,210,0)' : 'rgba(120,230,200,0)');
    g.globalAlpha = bb; g.fillStyle = ug; g.fillRect(-70, 50, 100, 18);
    g.restore(); g.globalAlpha = 1;
  }
  // kat izi
  g.strokeStyle = shMix(p.blanketHi, bu ? '#ffffff' : deniz ? '#68f0f8' : '#46a88a', bb, 0.55); g.lineWidth = 0.45;
  g.beginPath(); for (let xx = x0 + 1; xx <= x1; xx += 1) g.lineTo(xx, ust(xx) + 0.9); g.stroke();
  // kumaş: üst kenar bandı (kıvrık, dalgalı kenarlı), yumuşak kıvrım gölgeleri, bulut ve ay deseni (yosuna dönüşürken silinir)
  if (bb < 0.98) {
    const va = 1 - bb, gece = p.sky === 'gece';
    g.save(); g.clip(yol);
    g.beginPath(); for (let xx = x0 - 1; xx <= x1 + 1; xx += 0.8) g.lineTo(xx, ust(xx) + 0.6);
    for (let xx = x1 + 1; xx >= x0 - 1; xx -= 0.8) g.lineTo(xx, ust(xx) + 2.9 + Math.sin(xx * 1.7) * 0.18);
    g.closePath(); g.fillStyle = p.blanketHi; g.globalAlpha = va * 0.42; g.fill();
    g.strokeStyle = p.blanketD; g.lineWidth = 0.22; g.globalAlpha = va * 0.55; g.beginPath(); for (let xx = x0 - 1; xx <= x1 + 1; xx += 0.8) g.lineTo(xx, ust(xx) + 2.9 + Math.sin(xx * 1.7) * 0.18); g.stroke();
    g.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      g.strokeStyle = p.blanketD; g.lineWidth = 0.34; g.globalAlpha = va * (0.34 - k * 0.06); g.beginPath();
      for (let xx = x0; xx <= x1; xx += 1.2) g.lineTo(xx, ust(xx) + 4.6 + k * 2.6 + Math.sin(xx * 0.33 + k * 2.1) * 0.55);
      g.stroke();
      g.strokeStyle = p.blanketHi; g.lineWidth = 0.22; g.globalAlpha = va * 0.3; g.beginPath();
      for (let xx = x0; xx <= x1; xx += 1.2) g.lineTo(xx, ust(xx) + 4.0 + k * 2.6 + Math.sin(xx * 0.33 + k * 2.1) * 0.55);
      g.stroke();
    }
    // bulutlar ve hilal
    g.fillStyle = gece ? '#b9c8ff' : '#ffffff'; g.globalAlpha = va * (gece ? 0.28 : 0.55);
    for (const [cx0, cy0, cs] of [[-23.5, 66.7, 1], [-6.5, 67.8, 0.85], [-30.5, 64.7, 0.6]]) { g.beginPath(); g.arc(cx0, cy0, 0.9 * cs, 0, 6.283); g.arc(cx0 + 1.1 * cs, cy0 - 0.5 * cs, 1.2 * cs, 0, 6.283); g.arc(cx0 + 2.3 * cs, cy0, 0.85 * cs, 0, 6.283); g.rect(cx0, cy0, 2.3 * cs, 0.85 * cs); g.fill(); }
    g.globalAlpha = va * p.starA; g.fillStyle = p.star; g.beginPath(); g.arc(-13, 66, 1.35, 0.55 * Math.PI, 1.55 * Math.PI, false); g.arc(-12.3, 66.4, 1.1, 1.5 * Math.PI, 0.5 * Math.PI, true); g.fill();
    g.restore(); g.globalAlpha = 1;
  }
  // yıldız deseni → ışıklı çiçekler (her yıldız sırayla küçülür, aynı yerde bir çiçek açar)
  const cicekler = [];
  for (let i = 0; i < SH_YILDIZ.length; i++) {
    const [sx, sy0] = SH_YILDIZ[i]; if (sx <= x0 + 1) continue;
    const sy = sy0 - 1.5 + (sx < -20 ? n * 0.2 : 0);
    const f = shEase(shSeg(b, 0.22 + i * 0.045, 0.52 + i * 0.045));
    if (f < 1) { g.fillStyle = p.star; g.globalAlpha = p.starA * (1 - f) + 0.4 * Math.sin(f * Math.PI); shYildiz5(g, sx, sy, 0.95 * (1 - f * 0.7) + Math.sin(f * Math.PI) * 0.6, 0); g.fill(); g.globalAlpha = 1; }
    if (f > 0) cicekler.push([sx, sy, f, i]);
  }
  if (bu) {   // bulutta yıldızlar altın ışıltılara dönüşür
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; const k = sh.k0 * sh.zoom;
    for (const [cx, cy, f, i] of cicekler) { const tw = 0.6 + 0.4 * Math.sin(tm * 2.2 + i * 1.9); dglow('#ffd9a0', shEkranX(cx), shEkranY(cy), k * 3.5 * f, f * 0.5 * tw); shParilti(shEkranX(cx), shEkranY(cy), k * (1.4 + 1.2 * tw) * f, f * tw); }
    g.globalCompositeOperation = 'source-over';
  } else for (const [cx, cy, f, i] of cicekler) shCicek(cx, cy, f, tm, i, 1);
  // yosun saçakları, eğrelti otları ve ışıklı uçlar
  if (b > 0.05 && bu) {   // bulut tepeciği: üst kenarda kabarık tümsekler, sıcak kenar ışığı, pembe-altın zerreler
    shOdaT();
    const ka = shSeg(b, 0.1, 0.6);
    for (let ps = 0; ps < 2; ps++) {   // yamaçlarda büyük kabarık bulutlar (düz kenarlar görünmesin)
      g.fillStyle = ps ? '#ffe2ee' : '#f0b2ce'; g.globalAlpha = ka; g.beginPath();
      for (let j = 0; j < 4; j++) {
        const u = (j + 0.5) / 4;
        for (const [ax, ay, bx2, by2, sg] of [[x0 - 1, ust(x0) + 3, solA.x + 3, altY - 2, -1], [x1 + 2, ust(x1) + 1.5, sagA.x - 3, altY - 2, 1]]) {
          const px = lerp(ax, bx2, u) + sg * 1.2, py = lerp(ay, by2, u), rr = (2.6 + u * 3.4 + (j % 2) * 0.8) * bb * (ps ? 0.9 : 1);
          g.moveTo(px + rr, py - (ps ? rr * 0.18 : 0)); g.arc(px, py - (ps ? rr * 0.18 : 0), rr, 0, 6.283);
        }
      }
      g.fill();
    }
    for (let ps = 0; ps < 2; ps++) {
      g.fillStyle = ps ? '#ffffff' : '#ffe6f0'; g.globalAlpha = ka * (ps ? 0.5 : 1); g.beginPath();
      for (let xx = x0 + 2.5, i = 0; xx < x1 + 4; xx += 4.4, i++) {
        if (otur > 0.2 && xx < -29.5) continue;
        const rr = (2.0 + ((i * 7) % 4) * 0.3) * bb * (ps ? 0.5 : 1), y0 = ust(Math.min(xx, x1)) + 0.9 - (ps ? rr * 0.5 : 0) + Math.sin(tm * 0.8 + i) * 0.12;
        g.moveTo(xx - (ps ? rr * 0.3 : 0) + rr, y0); g.arc(xx - (ps ? rr * 0.3 : 0), y0, rr, 0, 6.283);
      }
      g.fill();
    }
    g.globalAlpha = 1;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const r = sh.k0 * sh.zoom;
    for (let i = 0; i < 7; i++) {
      const xx = x0 + 3 + i * 5.7, y0 = ust(xx) - 1.6 * bb, tw = 0.5 + 0.5 * Math.sin(tm * 1.6 + i * 1.7);
      if (otur > 0.2 && xx < -29.5) continue;
      dglow(i % 3 ? '#ffe0ee' : '#fff3c8', shEkranX(xx), shEkranY(y0), r * (1.6 + tw * 0.8), bb * (0.12 + tw * 0.2));
    }
    for (const [sx, sy, ph] of SH_SPOR) {
      const tw = 0.5 + 0.5 * Math.sin(tm * 1.3 + ph);
      dglow(ph % 2 > 1 ? '#ffc6dc' : '#ffe9b8', shEkranX(sx), shEkranY(sy + Math.sin(tm * 0.8 + ph) * 0.3), r * (0.8 + tw * 0.5), bb * bb * (0.25 + tw * 0.4));
    }
    g.globalCompositeOperation = 'source-over';
  } else if (b > 0.05) {
    shOdaT();
    g.strokeStyle = '#2f8a72'; g.lineWidth = 0.42; g.lineCap = 'round'; g.globalAlpha = shSeg(b, 0.12, 0.4);
    g.beginPath();
    for (let xx = x0 + 0.5, i = 0; xx < x1; xx += 1.1, i++) {
      if (otur > 0.2 && xx < -29.5) continue;   // doğrulunca saçaklar gövdesinin önünden geçmesin
      const y0 = ust(xx) + 0.3, h = (0.8 + ((i * 7) % 5) * 0.35) * bb, sw = Math.sin(tm * 1.6 + i) * 0.25;
      g.moveTo(xx, y0); g.quadraticCurveTo(xx + sw, y0 - h * 0.6, xx + sw * 2 + ((i % 3) - 1) * 0.4, y0 - h);
    }
    g.stroke(); g.globalAlpha = 1;
    // eğreltiler: kıvrık doğar, yavaşça açılır
    for (let i = 0; i < SH_EGRELTI.length; i++) {
      const [ex, ey, boy, aci, ust2] = SH_EGRELTI[i];
      const ac = shEase(shSeg(b, 0.7 + i * 0.025, 1));
      if (ac <= 0.01) continue;
      const yy = ust2 ? ust(ex) + 0.6 : ey;
      shEgrelti(ex, yy, boy * (0.35 + 0.65 * ac), aci + Math.sin(tm * 0.9 + i * 1.3) * 0.04, ac, i);
    }
    // tepenin üst kenarında oyundaki gibi camgöbeği kenar ışığı
    shOdaT(); g.globalCompositeOperation = 'lighter'; g.lineJoin = 'round';
    for (const [lw, al] of [[1.4, 0.10], [0.6, 0.22], [0.22, 0.75]]) {
      g.strokeStyle = `rgba(127,232,255,${al * bb})`; g.lineWidth = lw; g.beginPath();
      for (let xx = x0 + 0.5; xx <= x1; xx += 1) g.lineTo(xx, ust(xx) - 0.05);
      g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const r = sh.k0 * sh.zoom;
    for (let i = 0; i < 14; i++) {
      const xx = x0 + 2 + i * 2.85, y0 = ust(xx) - 1.6 * bb, tw = 0.5 + 0.5 * Math.sin(tm * 2.1 + i * 1.7);
      if (otur > 0.2 && xx < -29.5) continue;
      dglow(i % 3 ? '#9ff0d0' : '#bff4ff', shEkranX(xx), shEkranY(y0), r * (1.1 + tw * 0.6), bb * (0.35 + tw * 0.4));
    }
    // tepeciğin yamaçlarında ışıklı sporlar
    for (const [sx, sy, ph] of SH_SPOR) {
      const tw = 0.5 + 0.5 * Math.sin(tm * 1.3 + ph);
      dglow(ph % 2 > 1 ? '#7fe8ff' : '#b9ffd8', shEkranX(sx), shEkranY(sy + Math.sin(tm * 0.8 + ph) * 0.3), r * (0.8 + tw * 0.5), bb * bb * (0.25 + tw * 0.45));
    }
    g.globalCompositeOperation = 'source-over';
  }
}
let shYosun = null;
// eğrelti kökleri: [x, y, boy, açı, üst kenarda mı]
const SH_EGRELTI = [[-57, 73, 7.5, -0.55, 0], [-62, 81, 6, -0.8, 0], [-50.5, 64, 6, -0.35, 0], [9.5, 67, 7, 0.5, 0], [14.5, 77, 6.2, 0.75, 0], [-6, 0, 5.2, 0.15, 1], [1.5, 0, 4.4, 0.4, 1], [-15, 0, 4, -0.2, 1]];
function shEgrelti(x, y, boy, aci, ac, i) {   // oda biriminde (shOdaT ayarlı)
  const n = 9, bukul = lerp(4.2, 0.9, ac) * (aci < 0 ? -1 : 1), parca = boy / n;
  let px = x, py = y, a = aci - Math.PI / 2;
  g.strokeStyle = '#2a7a63'; g.lineWidth = 0.32; g.lineCap = 'round';
  const pts = [];
  for (let j = 0; j <= n; j++) { pts.push([px, py, a]); a += bukul / n * (0.4 + j / n); px += Math.cos(a) * parca; py += Math.sin(a) * parca; }
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1]); g.stroke();
  for (let j = 1; j < n; j++) {
    const [qx, qy, qa] = pts[j], L = boy * 0.2 * (1 - j / (n + 1)) * ac;
    if (L < 0.08) continue;
    for (const s of [-1, 1]) {
      const la = qa + s * 1.1;
      g.fillStyle = (j + (s > 0 ? 1 : 0) + i) % 3 ? '#2f8a72' : '#48ab8a';
      g.beginPath(); g.ellipse(qx + Math.cos(la) * L * 0.5, qy + Math.sin(la) * L * 0.5, L * 0.55, L * 0.2, la, 0, 6.283); g.fill();
    }
  }
}
// ışıklı küçük çiçek (oda biriminde x,y; f 0..1 açılma). ek: parıltı gücü
function shCicek(x, y, f, tm, i, ek) {
  shOdaT();
  const r = 1.25 * shEase(f) * (1 + 0.15 * Math.sin(f * Math.PI)), don = (1 - f) * 1.8 + i;
  g.save(); g.translate(x, y); g.rotate(don);
  g.fillStyle = i % 2 ? '#d9c6ff' : '#bff4ff';
  for (let k = 0; k < 5; k++) { g.rotate(1.2566); g.beginPath(); g.ellipse(0, -r * 0.62, r * 0.36, r * 0.6, 0, 0, 6.283); g.fill(); }
  g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(0, 0, r * 0.3, 0, 6.283); g.fill();
  g.restore();
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const k = sh.k0 * sh.zoom, tw = 0.75 + 0.25 * Math.sin(tm * 1.9 + i * 2.3);
  dglow(i % 2 ? '#c9a8ff' : '#8ff0ff', shEkranX(x), shEkranY(y), k * 4.5 * f, f * 0.45 * tw * ek);
  dglow('#ffffff', shEkranX(x), shEkranY(y), k * 1.1 * f, f * 0.5 * ek);
  if (f < 1) shParilti(shEkranX(x), shEkranY(y), k * 3 * Math.sin(f * Math.PI), Math.sin(f * Math.PI) * 0.9);
  g.globalCompositeOperation = 'source-over';
}
const SH_SPOR = [[-50, 66, 0.3], [-44, 71, 2.1], [-30, 68, 1.2], [-19, 74, 3.3], [-8, 69, 0.8], [2, 73, 2.7], [9, 78, 1.9], [-56, 77, 3.9], [-36, 79, 1.5], [-12, 80, 0.2]];

// gece lambası → ay (l: 0 lamba, 1 ay)
function shLambaYer(l) {
  const ee = shEase2(l);
  return { x: lerp(SH_LAMBA.x, SH_AY.x, ee), y: lerp(SH_LAMBA.y, SH_AY.y, ee) - Math.sin(ee * Math.PI) * 18 };
}
function shLamba(p, l, tm, gece, yanik = 1) {
  const ee = shEase2(l);
  // yay şeklinde süzülüş
  const lx = lerp(SH_LAMBA.x, SH_AY.x, ee), ly = lerp(SH_LAMBA.y, SH_AY.y, ee) - Math.sin(ee * Math.PI) * 18;
  const bu = sh.tema === 'bulut' && gece, rr = lerp(2.3, 6.5, shEase(l));
  // gövde (ayak) – yıldız tozuna dönüşerek kaybolur
  if (l < 1) {
    shOdaT(); g.globalAlpha = 1 - shSeg(l, 0, 0.38);
    { const bx0 = SH_LAMBA.x, ku = SH_KOMODIN.ust, cg = g.createLinearGradient(bx0 - 2.8, 0, bx0 + 2.8, 0);
      cg.addColorStop(0, gece ? '#241e48' : '#c9976b'); cg.addColorStop(0.35, gece ? '#4c4388' : '#f5d6b0'); cg.addColorStop(1, gece ? '#241e48' : '#c9976b');
      g.fillStyle = cg; g.beginPath(); g.moveTo(bx0 - 2.8, ku); g.quadraticCurveTo(bx0 - 2.4, ku - 2.9, bx0, ku - 3); g.quadraticCurveTo(bx0 + 2.4, ku - 2.9, bx0 + 2.8, ku); g.closePath(); g.fill();
      g.fillRect(bx0 - 0.5, SH_LAMBA.y + 1, 1, ku - SH_LAMBA.y - 3.4);
      g.fillStyle = gece ? '#ffe6a8' : '#f2b968'; shYildiz5(g, bx0, ku - 1.3, 0.62); g.fill(); }
    g.globalAlpha = 1;
  }
  const px = shEkranX(lx), py = shEkranY(ly), k = sh.k0 * sh.zoom;
  // ışık: sıcak turuncu → serin, masalsı ay ışığı aurası
  const sicak = '#ffcf8a', ay = bu ? '#ffdcae' : '#cfe6ff';
  const nab = 1 + Math.sin(tm * 1.4) * 0.04;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (gece && yanik > 0) {
    g.globalCompositeOperation = 'lighter';
    const auraR = k * lerp(26, 82, l) * nab, auraA = yanik * lerp(0.42, bu ? 0.35 : 0.55, l);
    dglow(l < 0.45 ? sicak : ay, px, py, auraR, auraA);
    dglow(l < 0.45 ? '#ffe2b8' : bu ? '#fff4dc' : '#ffffff', px, py, k * rr * 2.8, yanik * lerp(0.65, 0.58, l));
    if (l > 0.1 && l < 0.9) {
      // yükselirken lambanın çevresinde narin ay ışığı hareleri
      const haloU = Math.sin(shSeg(l, 0.1, 0.9) * Math.PI);
      dglow('#f0e4ff', px, py, k * rr * 5.4, yanik * 0.32 * haloU);
    }
    if (bu && l > 0.3) dglow('#ffb0a0', px, py, k * rr * 9, yanik * 0.3 * shSeg(l, 0.3, 1));
    if (l < 0.6) {   // komodinin üstüne ve zemine yumuşak sıcak ışık havuzu
      const hv = yanik * (1 - shSeg(l, 0, 0.6)); shOdaT(); g.globalCompositeOperation = 'lighter';
      for (const [hx, hy, hr, hs, ha] of [[SH_LAMBA.x, SH_KOMODIN.ust - 0.2, 8, 0.14, 0.4], [SH_LAMBA.x + 9, SH_ZEMIN + 10, 22, 0.17, 0.26]]) {
        const pg = g.createRadialGradient(0, 0, 0, 0, 0, hr); pg.addColorStop(0, 'rgba(255,200,130,' + (ha * hv) + ')'); pg.addColorStop(1, 'rgba(255,190,120,0)');
        g.save(); g.translate(hx, hy); g.scale(1, hs * 2); g.fillStyle = pg; g.fillRect(-hr, -hr, hr * 2, hr * 2); g.restore();
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
    }
    g.globalCompositeOperation = 'source-over';
  }
  // küre / ay diski
  shOdaT();
  if (l > 0.5) {
    const a = shSeg(l, 0.5, 1);
    g.fillStyle = shMix('#ffe9c4', bu ? '#fff3d2' : '#f2f7ff', a);
    g.beginPath(); g.arc(lx, ly, rr, 0, 6.283); g.fill();
    g.fillStyle = bu ? `rgba(255,255,255,${0.5 * a})` : `rgba(180,200,235,${0.35 * a})`;   // yumuşak ay lekeleri (güneşte parlak benek)
    if (bu) { g.beginPath(); g.arc(lx - rr * 0.3, ly - rr * 0.3, rr * 0.4, 0, 6.283); g.fill(); } else
    g.beginPath(); g.arc(lx - rr * 0.3, ly - rr * 0.15, rr * 0.22, 0, 6.283); g.moveTo(lx + rr * 0.47, ly + rr * 0.3); g.arc(lx + rr * 0.32, ly + rr * 0.3, rr * 0.15, 0, 6.283); g.moveTo(lx + rr * 0.2, ly - rr * 0.45); g.arc(lx + rr * 0.1, ly - rr * 0.45, rr * 0.1, 0, 6.283); g.fill();
  } else {
    // lamba kubbesi (hilal biçimli gece lambası)
    const sh2 = shSeg(l, 0, 0.5);
    { const lg2 = g.createRadialGradient(lx - rr * 0.25, ly - rr * 0.3, rr * 0.1, lx, ly, rr);
      lg2.addColorStop(0, gece ? shMix('#fffbe8', '#ffffff', sh2) : '#fffdf4'); lg2.addColorStop(0.65, gece ? shMix('#ffe2ad', '#f2f7ff', sh2) : '#fff0d4'); lg2.addColorStop(1, gece ? shMix('#ffb870', '#cfdcf6', sh2) : '#ecc89c');
      g.fillStyle = lg2; g.beginPath(); g.arc(lx, ly, rr, 0, 6.283); g.fill();
      if (sh2 < 0.2) { g.fillStyle = gece ? '#4c4388' : '#d8a577'; g.beginPath(); g.moveTo(lx - rr * 0.5, ly + rr * 0.86); g.lineTo(lx + rr * 0.5, ly + rr * 0.86); g.lineTo(lx + rr * 0.42, ly + rr * 1.22); g.lineTo(lx - rr * 0.42, ly + rr * 1.22); g.fill(); }
      g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 0.2; g.beginPath(); g.arc(lx, ly, rr * 0.82, 3.6, 4.5); g.stroke(); }
    if (sh2 < 1) {
      g.fillStyle = gece ? `rgba(255,190,120,${0.55 * (1 - sh2)})` : 'rgba(225,190,150,0.6)';
      g.beginPath(); g.arc(lx + rr * 0.35, ly - rr * 0.2, rr * 0.75, 0, 6.283); g.fill();
    }
  }
}

// halı → ışıklı mantarlar (r: 0 halı, 1 mantar)
function shHali(p, r, tm) {
  const H0 = SH_HALI;
  if (r < 1) {
    shOdaT(); g.globalAlpha = 1 - shEase(r);
    const ga = g.globalAlpha, gece = p.sky === 'gece';
    // zemine gölge + halının kalınlığı (alt kenar), sonra üst yüz: ortası aydınlık, kenarı koyu
    g.fillStyle = gece ? 'rgba(2,3,16,0.45)' : 'rgba(100,60,40,0.3)'; g.beginPath(); g.ellipse(H0.x + 0.5, H0.y + 1.0, H0.rx + 0.9, H0.ry + 0.6, 0, 0, 6.283); g.fill();
    g.fillStyle = gece ? '#241a46' : '#c5708c'; g.beginPath(); g.ellipse(H0.x, H0.y + 0.55, H0.rx, H0.ry, 0, 0, 6.283); g.fill();
    g.fillStyle = p.rug; g.beginPath(); g.ellipse(H0.x, H0.y, H0.rx, H0.ry, 0, 0, 6.283); g.fill();
    g.save(); g.translate(H0.x, H0.y); g.scale(1, H0.ry / H0.rx); const R0 = H0.rx;
    { const rg = g.createRadialGradient(-R0 * 0.2, -R0 * 0.25, 0, 0, 0, R0); rg.addColorStop(0, 'rgba(255,255,255,' + (gece ? 0.1 : 0.2) + ')'); rg.addColorStop(0.7, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(0,0,0,0.2)'); g.fillStyle = rg; g.beginPath(); g.arc(0, 0, R0, 0, 6.283); g.fill(); }
    g.strokeStyle = p.rugRing; g.lineWidth = 2.6; g.globalAlpha = ga * 0.5; g.beginPath(); g.arc(0, 0, R0 - 2.6, 0, 6.283); g.stroke();
    g.lineWidth = 1.1; g.globalAlpha = ga; g.beginPath(); g.arc(0, 0, R0 - 0.9, 0, 6.283); g.stroke();
    g.setLineDash([1.2, 1.6]); g.strokeStyle = p.rugDot; g.lineWidth = 0.7; g.globalAlpha = ga * 0.85; g.beginPath(); g.arc(0, 0, R0 - 2.6, 0, 6.283); g.stroke(); g.setLineDash([]);
    g.fillStyle = p.rugRing; g.globalAlpha = ga * 0.6;   // yaprak/çiçek halkası
    for (let k = 0; k < 16; k++) { const aa = k * 0.3927; g.save(); g.rotate(aa); g.translate(R0 * 0.7, 0); g.beginPath(); g.ellipse(0, 0, 2.4, 1.05, 0, 0, 6.283); g.fill(); g.restore(); }
    g.globalAlpha = ga; g.beginPath(); g.arc(0, 0, R0 * 0.5, 0, 6.283); g.lineWidth = 0.8; g.strokeStyle = p.rugRing; g.stroke();
    g.fillStyle = p.rugRing; g.globalAlpha = ga * 0.8; shYildiz5(g, 0, 0, R0 * 0.3); g.fill();
    g.fillStyle = p.rugDot; g.globalAlpha = ga * 0.9; shYildiz5(g, 0, 0, R0 * 0.14); g.fill();
    g.restore(); g.globalAlpha = ga;
    // püsküller
    g.strokeStyle = p.rugRing; g.lineWidth = 0.22; g.lineCap = 'round'; g.beginPath();
    for (const s of [-1, 1]) for (let j = -4; j <= 4; j++) { const yy = H0.y + j * 0.78, x1 = H0.x + s * (H0.rx - 0.2) * Math.sqrt(Math.max(0, 1 - Math.pow(j * 0.78 / H0.ry, 2))); g.moveTo(x1, yy); g.quadraticCurveTo(x1 + s * 0.9, yy + 0.25, x1 + s * (1.5 + (j & 1) * 0.3), yy + 0.1); }
    g.stroke();
    g.globalAlpha = 1;
  }
  // desen noktaları → mantarlar
  for (let i = 0; i < SH_MANTAR.length; i++) {
    const [dx, dy, boy, sap] = SH_MANTAR[i];
    const bx = H0.x + dx, by = lerp(H0.y + dy, SH_YER + 1.2 + dy * 0.9 + (i % 3) * 0.6, shEase(shSeg(r, 0, 0.5)));
    const yr = shEase(shSeg(r, 0.05 * i, 0.55 + 0.06 * i));
    shOdaT();
    if (yr <= 0.01) {
      g.fillStyle = p.rugDot; g.beginPath(); g.arc(bx, by, 0.75, 0, 6.283); g.fill();
      continue;
    }
    if (sh.tema === 'gol') {   // Yıldız Gölü: her nokta suyun üstünde açan ışıklı bir nilüfer olur
      const w = sap * (0.8 + 0.6 * yr) * 1.25, sw = Math.sin(tm * 0.9 + i) * 0.15 * yr, cx = bx + sw;
      g.fillStyle = shMix(p.rugDot, '#2f8a6a', yr); g.beginPath(); g.ellipse(cx, by, w * 1.3, w * 0.42, 0, 0.18, Math.PI * 2 - 0.18); g.lineTo(cx, by); g.closePath(); g.fill();   // yaprak (çentikli)
      g.fillStyle = '#4fb592'; g.globalAlpha = 0.7 * yr; g.beginPath(); g.ellipse(cx - w * 0.2, by - w * 0.08, w * 0.8, w * 0.2, 0, Math.PI, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      const ac = shEase(shSeg(yr, 0.35, 1));
      if (ac > 0.01) {   // pembe çiçek açar
        g.fillStyle = i % 2 ? '#ffb6d9' : '#ffd0e8';
        for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + (k - 2) * 0.45 * ac; g.save(); g.translate(cx, by - w * 0.1); g.rotate(an + Math.PI / 2); g.beginPath(); g.ellipse(0, -w * 0.45 * ac, w * 0.16, w * 0.42 * ac, 0, 0, 6.283); g.fill(); g.restore(); }
        g.fillStyle = '#fff2b0'; g.beginPath(); g.arc(cx, by - w * 0.3 * ac, w * 0.12 * ac, 0, 6.283); g.fill();
      }
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
      const k = sh.k0 * sh.zoom, tw = 0.75 + 0.25 * Math.sin(tm * 1.7 + i * 2.1);
      dglow(i % 2 ? '#ff9ad0' : '#ffd6f0', shEkranX(cx), shEkranY(by - w * 0.3), k * w * 3.2, yr * 0.42 * tw);
      dglow('#9fd8ff', shEkranX(cx), shEkranY(by + w * 0.2), k * w * 2.6, yr * 0.22);   // suya düşen ışık
      g.globalCompositeOperation = 'source-over'; continue;
    }
    if (sh.tema === 'bulut') {   // her nokta bir gökkuşağı rengine bürünüp havalanır (yedi renk = yedi kuzucuk)
      const col = SH_GK[i % 7], oy = by - yr * (4 + (i % 3) * 2.5) - Math.sin(tm * 1.2 + i) * 0.6 * yr, rr = 0.75 + yr * 0.9;
      g.fillStyle = shMix(p.rugDot, col, yr); g.beginPath(); g.arc(bx, oy, rr, 0, 6.283); g.fill();
      g.fillStyle = '#ffffff'; g.globalAlpha = 0.7 * yr; g.beginPath(); g.arc(bx - rr * 0.3, oy - rr * 0.3, rr * 0.35, 0, 6.283); g.fill(); g.globalAlpha = 1;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
      const k = sh.k0 * sh.zoom; dglow(col, shEkranX(bx), shEkranY(oy), k * rr * 4.5, yr * 0.55); dglow('#ffffff', shEkranX(bx), shEkranY(oy), k * rr * 1.2, yr * 0.35);
      g.globalCompositeOperation = 'source-over'; continue;
    }
    const h = boy * yr * 1.15, sw = Math.sin(tm * 1.1 + i) * 0.2 * yr, w = sap * (0.5 + 0.5 * yr) * 1.15;
    g.fillStyle = '#cfe9ef'; g.globalAlpha = 0.95;
    g.beginPath(); g.moveTo(bx - 0.45, by); g.quadraticCurveTo(bx - 0.5 + sw, by - h * 0.5, bx - 0.35 + sw * 2, by - h); g.lineTo(bx + 0.35 + sw * 2, by - h); g.quadraticCurveTo(bx + 0.5 + sw, by - h * 0.5, bx + 0.45, by); g.fill();
    const cx = bx + sw * 2, cy = by - h;
    g.fillStyle = '#5fd0e8';
    g.beginPath(); g.ellipse(cx, cy, w, w * 0.62, 0, Math.PI, 0); g.quadraticCurveTo(cx, cy + w * 0.25, cx - w, cy); g.fill();
    g.fillStyle = '#c8fbff'; g.globalAlpha = 0.85;
    g.beginPath(); g.arc(cx - w * 0.35, cy - w * 0.32, w * 0.14, 0, 6.283); g.arc(cx + w * 0.25, cy - w * 0.4, w * 0.1, 0, 6.283); g.fill();
    g.globalAlpha = 1;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const tw = 0.75 + 0.25 * Math.sin(tm * 1.7 + i * 2.1), k = sh.k0 * sh.zoom;
    dglow('#5fd8ff', shEkranX(cx), shEkranY(cy - w * 0.1), k * w * 4.2, yr * 0.5 * tw);
    dglow('#e0fdff', shEkranX(cx), shEkranY(cy - w * 0.15), k * w * 1.3, yr * 0.45 * tw);
    g.globalCompositeOperation = 'source-over';
  }
}

// ay ışığı huzmesi (gece) / güneş huzmesi (sabah)
function shHuzme(gece, a, tm, renk) {
  if (a <= 0.01) return;
  const pm = renk === 'pembe';
  shOdaT();
  g.globalCompositeOperation = 'lighter';
  const P0 = SH_PEN, kay = gece ? 30 : 26;
  const gr = g.createLinearGradient(0, P0.ust, 0, 98);
  if (pm) { gr.addColorStop(0, `rgba(255,170,205,${0.22 * a})`); gr.addColorStop(1, 'rgba(255,190,170,0)'); }
  else if (gece) { gr.addColorStop(0, `rgba(140,175,255,${0.13 * a * (1 + 0.16 * Math.sin(tm * 0.43) + 0.07 * Math.sin(tm * 1.1 + 1))})`); gr.addColorStop(1, 'rgba(140,175,255,0)'); }
  else { gr.addColorStop(0, `rgba(255,226,170,${0.34 * a})`); gr.addColorStop(1, 'rgba(255,214,150,0)'); }
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(P0.x0 + 1, P0.ust + 5); g.lineTo(P0.x1 - 1, P0.ust + 5); g.lineTo(P0.x1 - kay - 4, 98); g.lineTo(P0.x0 - kay - 12, 98); g.closePath(); g.fill();
  g.globalCompositeOperation = 'source-over';
  // huzmedeki toz zerreleri
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const k = sh.k0 * sh.zoom;
  for (let i = 0; i < 16; i++) {
    const u = ((i * 0.618 + tm * 0.018 * (1 + (i % 3) * 0.3)) % 1), v = ((i * 0.37) % 1);
    const yy = lerp(P0.ust + 8, 92, v) + Math.sin(tm * 0.5 + i) * 2, xx = lerp(P0.x0, P0.x1, u) - (yy - P0.ust) * (kay / 86) - 4;
    dglow(pm ? '#ffd6e6' : gece ? '#cfe0ff' : '#fff2c8', shEkranX(xx), shEkranY(yy), k * 0.7, a * (0.25 + 0.2 * Math.sin(tm * 1.3 + i * 2)));
  }
  g.globalCompositeOperation = 'source-over';
}

// ══════════════════ AÇILIŞ ══════════════════
function shGirisPlan() {
  const d1 = shSure('a_giris1'), d2 = shSure('a_giris2'), d3 = shSure('a_giris3'), dU = shSure('p_uyan', 4);
  const P = { karar: 0.7, acil: 2.6, s1: 1.6 };
  P.yat0 = P.acil; P.walk = P.yat0 + 2.2; P.gir = 1; P.land = P.walk + 0.9 / 1; P.yat1 = P.walk + 4.4;   // Feza odaya girer, yatağa sıçrar, yerleşir
  P.uyku0 = P.yat1;                                // göz kapakları ağırlaşmaya başlar
  P.uyudu = Math.max(P.s1 + Math.max(d1 * 0.82, 5.6), P.uyku0 + 3.6);       // gözler kapandı
  P.ic = P.uyudu - 1.2;                            // derin, tatlı bir iç çekiş
  P.b2 = Math.max(P.s1 + d1 + 1.0, P.uyudu + 2.6); // Pırıl uyanmaya başlar
  P.s2 = P.b2 + 0.7;
  P.b3 = P.s2 + Math.max(d2 + 0.9, 5.6);           // erime
  P.s3 = P.b3 + 0.4;
  P.erime = Math.max(d3 + 2.0, 7.6);              // anlatıcı susunca uzun bir sessizlik kalmasın (≈2 sn)
  P.b4 = P.b3 + P.erime;                           // orman tamam
  P.uyan = P.b4 + 0.35;                            // Pırıl: "Feza, uyan!" (kulağına süzülürken)
  P.kalk = P.uyan + 1.1;                           // Feza doğrulur, gözlerini ovuşturur
  P.isik = Math.max(P.kalk + 2.7, P.uyan + dU - 0.9);   // parlama yükselir
  P.dunya = P.isik + 1.4;                          // tamEkran → false (oyun dünyası ışığın içinde)
  P.son = P.dunya + 2.3;
  // feza.js 'uykuya_dalis' pozu: gözler ~3.05 sn'de kapanır; o süreyi uyku0→uyudu aralığına yayarız (yavaş, ağır kırpmalar)
  P.dalK = 3.05 / Math.max(1, P.uyudu - P.uyku0);
  if (shPozVar('uykuya_dalis')) P.ic = P.uyku0 + 2.15 / P.dalK - 0.9;   // battaniyenin iç çekişi pozunkiyle aynı anda
  // yarı uyanış: Feza gözlerini aralar, parlayan Pırıl'ı görür, hayranlıkla bakar; Pırıl havalanınca gözleri yine kapanır
  P.bk0 = P.b3 - 3.4;              // kapaklar aralanmaya başlar
  P.bk1 = P.bk0 + 1.25;            // 'bakis' (bir göz kırpmasının içinde başlar)
  P.bk2 = P.bk1 + 3.46;            // 'bakis' biter (yine bir kırpmanın içinde)
  P.bk3 = P.bk2 + 1.3;             // gözler yeniden kapandı
  return P;
}
function shKisaPlan() {
  const uk = sh.uykuK || 'p_y_uyku', var1 = typeof SES !== 'undefined' && SES.LINES && SES.LINES[uk], d = var1 ? shSure(uk, 2) : 0;
  const P = { karar: 0.3, acil: 1.3, s1: 1.8 };
  P.yat0 = P.acil; P.walk = P.yat0 + 0.9; P.gir = 4.4 / 2.7; P.land = P.walk + 0.9 / P.gir; P.yat1 = P.walk + 2.7;
  P.uyku0 = P.yat1;
  P.dalK = 1.3; P.uyudu = P.uyku0 + 3.05 / P.dalK; P.ic = P.uyudu - 1.1;
  P.b2 = Math.max(P.uyudu + 0.5, P.s1 + d + 0.6); P.s2 = P.b2; P.b3 = P.b2 + 1.5; P.s3 = P.b3;
  P.erime = 2.4; P.b4 = P.b3 + P.erime; P.son = P.b4 + 2.3;
  const yok = 1e9; P.uyan = P.kalk = P.isik = P.dunya = P.bk0 = P.bk1 = P.bk2 = P.bk3 = yok;
  return P;
}
// açılışta yatan Feza'nın pozu ve poz zamanı: [poz, pozTm] ya da null (yeni pozlar yoksa eski yüz ayarı kullanılır)
function shYatisPoz(t, P, tm) {
  if (!shPozVar('uykuya_dalis')) return null;
  if (sh.atla >= 0) return ['uykuya_dalis', 3.2 + tm];
  if (t < P.uyudu) { const d = t - P.uyku0; return ['uykuya_dalis', d < 0 ? d : d * P.dalK]; }
  const bakis = shPozVar('bakis');
  if (!bakis || t < P.bk0 || t >= P.bk3) return ['uykuya_dalis', 3.05 + (t - (t >= P.bk3 && bakis ? P.bk3 : P.uyudu))];
  if (t < P.bk1) return ['uykuya_dalis', 3.05 - 0.45 * shEase(shSeg(t, P.bk0, P.bk0 + 0.9))];   // ağır kapaklar yarı aralanır
  if (t < P.bk2) return ['bakis', 2.7 + (t - P.bk1)];
  return ['uykuya_dalis', 2.6 + 0.45 * shEase(shSeg(t, P.bk2, P.bk3))];                        // gülümseyerek yine dalar
}
// canlı oyundaki Feza'nın ekran yeri (gövde ortası) – açılışın son karesi buraya oturur
function shCanliFeza() {
  if (typeof cam === 'undefined' || typeof P === 'undefined') return { x: W * 0.3, y: H * 0.7 };
  return { x: (P.x - cam.x) * S, y: (P.y - 32 - cam.y) * S };
}
function shCanliAyak() {
  if (typeof cam === 'undefined' || typeof P === 'undefined') return { x: W * 0.3, y: H * 0.76 };
  return { x: (P.x - cam.x) * S, y: (P.y - cam.y) * S };
}
// ekran pikseli → oda birimi (shEkranX/Y'nin tersi)
const shOdaX = sx => ((sx - sh.tx) / sh.zoom - W / 2 - (sh.oxp || 0) + sh.fx) / sh.k0;
const shOdaY = sy => ((sy - sh.ty) / sh.zoom + sh.fy) / sh.k0;
function shGirisGuncelle(dt) {
  const t = sh.t, P = sh.plan;
  const ses = (k, at) => { if (!sh.sesler[k] && t >= at) { sh.sesler[k] = 1; shSoyle(shFk(k)); } };
  if (sh.kisa) { if (!sh.sesler.uyku && t >= P.s1) { sh.sesler.uyku = 1; shSoyle(sh.uykuK || 'p_y_uyku'); } }
  else if (sh.atla < 0) { ses('a_giris1', P.s1); ses('a_giris2', P.s2); ses('a_giris3', P.s3); }
  if (!sh.kisa) ses('p_uyan', P.uyan);
  if (sh.atla < 0) {   // yatak odası sesleri (akşam)
    shBir('yatagaGir', P.yat1 - 2.5 / P.gir, 'yatagaGir'); shBir('yastik', P.yat1 - 2.2 / P.gir, 'yastik');
    shBir('lambaKis', P.uyudu - 0.5, 'lambaKis'); shBir('uykuNefes', P.uyudu + 0.3, 'uykuNefes');
    if (t > P.uyudu + 4.5 && t < P.b3 - 1 && Math.floor((t - P.uyudu) / 4.5) !== sh.nefesN) { sh.nefesN = Math.floor((t - P.uyudu) / 4.5); shSfx('uykuNefes', 0); }
  }
  // sahne anları (müzik geçişleri için)
  if (t >= P.karar) shAn('oda');
  if (sh.atla < 0) { if (t >= P.ic) shAn('ic_cek'); if (t >= P.uyudu) shAn('uyudu'); if (t >= P.b2 + 0.3) shAn('piril_uyandi'); if (t >= P.bk1 && shPozVar('bakis')) shAn('feza_bakti'); }
  if (t >= P.b3) shAn('eriyor');
  if (t >= P.b4) { shAn('orman'); if (!sh.izlendi) { sh.izlendi = 1; try { localStorage.setItem(shGirisAnahtar(sh.gBolum || 1), '1'); } catch (e) {} } }
  if (t >= P.uyan) shAn('feza_uyan');
  if (t >= P.isik) shAn('isik');
  if (t >= P.dunya) shAn('oyun');
  sh.tam = t >= P.karar && t < (sh.kisa ? P.son + 5 : P.dunya);
  // oyun kamerasını ışık tam doluyken yerine oturt (oyuna geçişte kamera kıpırdamasın)
  if (t >= P.dunya && !sh.camOturdu) { sh.camOturdu = 1; try { if (typeof stepCam === 'function') stepCam(0, true); } catch (e) {} }
  // kamera: önce yatağa çok yavaş yaklaşır, Pırıl uyanırken ona yakınlaşır, oda eriyince geniş açıya döner,
  // en sonda uyanan Feza'ya yaklaşıp onu oyundaki yerine taşır (ışık patlaması aynı noktadan doğar)
  const yakin = shEase(shSeg(t, P.b2 - 0.6, P.b2 + 3.2)), acil = shEase(shSeg(t, P.b3 + 0.5, P.b3 + P.erime * 0.6));
  // uzun girişte: gözler ağırlaşırken kamera Feza'nın yüzüne yavaşça yaklaşır (iç çekiş, kapanan gözler okunsun)
  const yuz = sh.kisa || sh.atla >= 0 ? 0 : shEase(shSeg(t, P.uyku0 - 0.8, P.uyudu + 0.6));
  let fx = shPX(lerp(lerp(lerp(-26, SH_FEZA.x - 3, yuz), shKucak.px, yakin), -12, acil)), fy = shPY(lerp(lerp(lerp(56, SH_FEZA.y - 4, yuz), shKucak.py + 1, yakin), 50, acil));
  let z = lerp(lerp(1 + 0.08 * shEase(shSeg(t, P.karar, P.b2)) + 0.42 * yuz, 1.45, yakin), 1, acil);
  let tx = lerp(lerp(fx, W * 0.45, yuz * 0.7), W * 0.42, yakin * (1 - acil)), ty = lerp(lerp(fy, H * 0.55, yuz * 0.7), H * 0.56, yakin * (1 - acil));
  const od = sh.kisa ? 0 : shEase(shSeg(t, P.b4 - 0.5, P.isik + 0.4));
  sh.nefesFaz = (sh.nefesFaz || 0) + dt * lerp(1.7, 1.15, shEase(shSeg(t, P.uyku0, P.uyudu + 1.5)));   // uykuya daldıkça nefes yavaşlar (hız değişse de faz kopmaz)
  sh.fzOlc = 1.18; sh.prOlc = 1; sh.prOyun = 0;
  if (od > 0) {
    // devir: Feza'nın oturduğu nokta, oyundaki Feza'nın ayaklarına göre öyle yerleşir ki başı oyundaki başıyla aynı yerde olsun;
    // boyu da (o anki kamera ölçeği S ile) oyundaki boyuna iner → ışık çözülünce Feza ne büyür ne kayar.
    const A = shCanliAyak(), ofx = shPX(SH_FEZA.x), ofy = shPY(SH_FEZA.y), hx = A.x - 5 * S, hy = A.y - 20 * S;
    // fon resmi ekranı hep kaplasın: hedef noktaya ulaşmak için gereken en küçük yakınlık
    const zSon = clamp(Math.max(1.12, hx / ofx, (W - hx) / (W - ofx), hy / ofy, (H - hy) / (H - ofy)) * 1.01, 1.12, 1.7);
    fx = lerp(fx, ofx, od); fy = lerp(fy, ofy, od); z = lerp(z, zSon, od);
    tx = lerp(tx, hx, od); ty = lerp(ty, hy, od);
    sh.fzOlc = lerp(1.18, 1 / z, od); sh.prOlc = lerp(1, 1 / z, od);
    sh.prOyun = shEase(shSeg(t, P.isik - 1.4, P.isik + 0.4));
  }
  shKamera(fx, fy, z, tx, ty);
  // Zzz (uykuya dalınca başlar)
  const gozAcik = shPozVar('bakis') && sh.atla < 0 && t > P.bk0 - 2.2 && t < P.bk3 + 0.5;   // yarı uyanıkken Zzz çıkmaz
  if (t > P.uyudu + 0.6 && t < P.b3 + 2 && !gozAcik && (sh.zz.length === 0 || t - sh.zz[sh.zz.length - 1].t0 > 1.6)) sh.zz.push({ t0: t });
  if (t >= P.son && sh.bitti) { const f = sh.bitti; sh.bitti = null; sh.mod = null; sh.tam = false; shGeceBirak(); f(); }
}
// akşam: Feza odaya yürür, yatağa sıçrar, yerleşir; sonra uzanma pozuna yumuşak geçer (geçici: ayakta + sevinç pozlarıyla)
function shGirisEnt(t, P) {
  if (!P.yat1 || sh.atla >= 0 || t >= P.yat1) return null;
  const u = 1.18 * 1.4 * S / sh.k0, gx = 8, gy = 11, sx = SH_FEZA.x + gx * u, sy = SH_FEZA.y + gy * u;   // 'yatagaGir' pozunun ayakta başlangıç noktası (oda birimi)
  const E = { gx, gy, poz: 'ayakta', x: sx, y: sy, tm: 0 };
  // Feza yatakta başlar (ayakla yatağa uçar gibi görünen yürüyüş kaldırıldı): oturmuş, Pırıl kolunda; sonra yavaşça uzanır.
  const tmSon = 4.4, tmOtur = 1.9, tmSure = (tmSon - tmOtur) / P.gir;
  E.poz = 'yatagaGir'; E.standA = 1;
  E.tm = t < P.yat1 - tmSure ? tmOtur + 0.08 * (0.5 + 0.5 * Math.sin(t * 1.3)) : tmSon - (P.yat1 - t) * P.gir;
  E.bump = 0;   // sıçrama yok
  return E;
}
function shNefes(t, P, tm) {
  const taban = shEase(Math.sin(sh.nefesFaz || tm * 1.5) * 0.5 + 0.5);   // yavaş nefes: iç çekiş ve verişte hafif duraklar
  if (!P || sh.atla >= 0) return taban;
  const u = shSeg(t, P.ic, P.ic + 2.6);
  const s = u <= 0 || u >= 1 ? 0 : (u < 0.35 ? shEase(u / 0.35) : 1 - shEase((u - 0.35) / 0.65));
  return taban * (1 - s) + 2.2 * s;
}
// ── sihirli zerreler (oda biriminde): eşyalar dönüşürken onlardan akan ışık ──
function shZerreEkle(x, y, vx, vy, col, omur, r) {
  if (sh.parca.length > 280) return;
  sh.parca.push({ x, y, vx, vy, col, omur, max: omur, r, ph: Math.random() * 6.28 });
}
function shZerreAkit(dt, tm) {
  const k = sh.k0 * sh.zoom;
  if (!sh.parca.length) return;
  const Dq = sh.parca.length > 12 ? shDusuk() : null;   // çok zerre varken haleler ¼ tamponda toplanır
  if (Dq) Dq.x.globalCompositeOperation = 'lighter';
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  for (let i = sh.parca.length - 1; i >= 0; i--) {
    const q = sh.parca[i]; q.omur -= dt;
    if (q.omur <= 0) { sh.parca[i] = sh.parca[sh.parca.length - 1]; sh.parca.pop(); continue; }
    q.x += (q.vx + Math.sin(tm * 2.3 + q.ph) * 0.8) * dt; q.y += q.vy * dt; q.vx *= Math.exp(-dt * 0.8);
    const u = q.omur / q.max, a = Math.sin(u * Math.PI) * 0.85, px = shEkranX(q.x), py = shEkranY(q.y);
    if (Dq) shParlakX(Dq.x, q.col, px, py, k * q.r * (1.2 + u * 0.8), a * 0.38); else dglow(q.col, px, py, k * q.r * (1.2 + u * 0.8), a * 0.38);
    if (q.r > 0.8 && (i & 3) === 0) shParilti(px, py, k * q.r * 1.3, a * 0.8);
  }
  if (Dq) { Dq.x.globalCompositeOperation = 'source-over'; shDusukBas(Dq, 'lighter', 1); }
  g.globalCompositeOperation = 'source-over';
}
function shPirilPozVar(p) { const k = 'P_' + p; if (shPozlar[k] === undefined) { try { shPozlar[k] = typeof pirilCizPoz === 'function' && String(pirilCizPoz).indexOf("'" + p + "'") >= 0; } catch (e) { shPozlar[k] = false; } } return shPozlar[k]; }
function shPirilYer(t, P, tm) {
  const kuc = { x: shKucak.px, y: shKucak.py };
  const hav = { x: -22 + Math.sin(tm * 0.7) * 3, y: 36 + Math.sin(tm * 1.3) * 1.6 };
  const kulak = { x: -38.5, y: 48.6 + Math.sin(tm * 2.2) * 0.6 };
  const yan = { x: -24.5 + Math.sin(tm * 0.9) * 0.6, y: 41 + Math.sin(tm * 2.2) * 0.8 };   // Feza doğrulunca karşısında
  const uyan = shSeg(t, P.b2 + 0.3, P.b3 + 0.2);
  if (sh.atla >= 0 && t < P.b4 + 0.01) return { x: kuc.x, y: kuc.y, kucak: true, poz: 'uyaniyor', u: Math.max(uyan, 0.6), f: 1, pat: 0 };
  if (t < P.b2 + 0.3) return { x: kuc.x, y: kuc.y, kucak: true, poz: shPirilPozVar('pelus_sik') ? 'pelus_sik' : 'pelus', u: 0.5 + 0.3 * Math.sin(tm * 1.5), f: 1, pat: 0 };   // sarılırken peluş hafifçe sıkılır (nefesle)
  if (t < P.b3 + 0.4) return { x: kuc.x, y: kuc.y, kucak: true, poz: 'uyaniyor', u: uyan, f: 1, pat: shSeg(t, P.b3 + 0.1, P.b3 + 0.4) };
  if (!sh.kalkis) sh.kalkis = { x: kuc.x, y: kuc.y };
  const k0 = sh.kalkis, pat = 1 - shSeg(t, P.b3 + 0.4, P.b3 + 0.9);
  const kalk = shEase(shSeg(t, P.b3 + 0.4, P.b3 + 2.4));
  if (t < P.b4) {
    const x = lerp(k0.x, hav.x, kalk), y = lerp(k0.y, hav.y, kalk) - Math.sin(kalk * Math.PI) * 4;
    return { x, y, kucak: false, poz: 'ucus', f: 1, pat };
  }
  if (sh.kisa) return { x: hav.x, y: hav.y, kucak: false, poz: 'ucus', f: 1, pat: 0 };
  const in2 = shEase(shSeg(t, P.b4, P.b4 + 1.1)), ks = shEase(shSeg(t, P.kalk - 0.4, P.kalk + 1.0));
  const x1 = lerp(hav.x, kulak.x, in2), y1 = lerp(hav.y, kulak.y, in2) - Math.sin(in2 * Math.PI) * 3;
  let x = lerp(x1, yan.x, ks), y = lerp(y1, yan.y, ks) - Math.sin(ks * Math.PI) * 2.5;
  // devirde oyundaki Pırıl'ın yerine süzülür (ışık çözülünce aynı yerde belirir)
  if (sh.prOyun > 0 && typeof D !== 'undefined' && typeof cam !== 'undefined' && isFinite(D.x) && isFinite(D.y)) {
    const gx = shOdaX((D.x - cam.x) * S), gy = shOdaY((D.y - cam.y) * S);
    if (isFinite(gx) && isFinite(gy) && Math.abs(gx - x) < 80 && Math.abs(gy - y) < 60) { x = lerp(x, gx, sh.prOyun); y = lerp(y, gy, sh.prOyun); }
  }
  return { x, y, kucak: false, poz: 'ucus', f: in2 > 0.35 ? -1 : 1, pat: 0 };
}
// ay ışığı huzmeleri (ormanda, yavaşça nefes alır) – oda biriminde
function shOrmanHuzme(a, tm) {
  if (a <= 0.01) return;
  shOdaT(); g.globalCompositeOperation = 'lighter';
  const bu = sh.tema === 'bulut';
  for (let i = 0; i < 5; i++) {
    const ax = SH_AY.x - 4 + i * 2, aci = 1.95 + i * 0.13 + Math.sin(tm * 0.17 + i * 1.7) * 0.03, L = 110, w = 2.2 + (i % 3) * 1.6;
    const ex = ax + Math.cos(aci) * L, ey = SH_AY.y + Math.sin(aci) * L, nx = -Math.sin(aci) * w, ny = Math.cos(aci) * w;
    const al = a * (0.05 + 0.035 * Math.sin(tm * 0.5 + i * 2.1)) * (bu ? 1.5 : 1);
    const gr = g.createLinearGradient(ax, SH_AY.y, ex, ey);
    if (bu) { gr.addColorStop(0, `rgba(255,236,200,${al})`); gr.addColorStop(0.6, `rgba(255,210,200,${al * 0.5})`); gr.addColorStop(1, 'rgba(255,200,200,0)'); }
    else { gr.addColorStop(0, `rgba(170,215,255,${al})`); gr.addColorStop(0.6, `rgba(150,200,255,${al * 0.5})`); gr.addColorStop(1, 'rgba(150,200,255,0)'); }
    g.fillStyle = gr; g.beginPath(); g.moveTo(ax, SH_AY.y); g.lineTo(ex + nx * 3, ey + ny * 3); g.lineTo(ex - nx * 3, ey - ny * 3); g.closePath(); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
}
// ön plan: köşelerde koyu yaprak siluetleri (kameradan daha hızlı kayar → derinlik)
function shOnPlanCiz() {
  const c = shTuval(), x = c.getContext('2d'), k = H / 100;
  x.setTransform(k, 0, 0, k, W / 2, 0);
  const R = sh.wu / 2;
  const yaprak = (bx, by, L, aci, gen) => {
    x.save(); x.translate(bx, by); x.rotate(aci);
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(L * 0.5, -gen, L, 0); x.quadraticCurveTo(L * 0.5, gen, 0, 0); x.fill();
    x.restore();
  };
  const r = rng(17);
  for (const [cx, yon] of [[-R, 1], [R, -1]]) {
    x.fillStyle = '#02050d';
    x.beginPath(); x.ellipse(cx, 104, 26, 13, 0, 0, 6.283); x.fill();
    for (let i = 0; i < 14; i++) {
      const aci = -Math.PI / 2 + yon * (0.25 + r() * 1.15), L = 9 + r() * 13;
      yaprak(cx + yon * (r() * 14), 98 + r() * 4, L, aci, 1.6 + r() * 2.2);
    }
    // yaprak uçlarında ince camgöbeği kenar (oyundaki ışıkla uyumlu)
    x.strokeStyle = 'rgba(127,232,255,0.18)'; x.lineWidth = 0.25;
    x.beginPath(); x.ellipse(cx, 104, 26, 13, 0, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
  }
  return c;
}
function shOnPlan(a) {
  if (a <= 0.01) return;
  const ad = sh.tema === 'volkan' ? 'onPlanV' : sh.tema === 'deniz' ? 'onPlanI' : sh.tema === 'bulut' ? 'onPlanB' : 'onPlan', OP = shHazir(ad);
  const z = sh.zoom, zf = 1 + (z - 1) * 1.35, ox = (sh.tx - sh.fx * z) * 1.35, oy = (sh.ty - sh.fy * z) * 1.35;
  g.setTransform(zf, 0, 0, zf, ox + (W - W * zf) * 0.5 * 0, oy);
  g.globalAlpha = a; g.drawImage(OP, 0, 0); g.globalAlpha = 1;
  g.setTransform(1, 0, 0, 1, 0, 0);
}
function shGirisCiz(tm, dt) {
  const t = sh.t, P = sh.plan;
  if (!sh.tam) {
    if (t < P.karar) {   // başlık → gece: zerreler süzülmeye devam eder, ekran yumuşakça kararır
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(4,5,14,${sh.dan ? 1 : shEase(t / P.karar)})`; g.fillRect(0, 0, W, H);
      shZerreler(tm, 0.6 * shEase(t / P.karar), true);
      return;
    }
    shGirisAcilis(tm, t, P); return;
  }
  shHazir('oda'); const fon = shHazir(sh.fon || 'orman');
  const p = SH_GECE;
  const m = shSeg(t, P.b3, P.b4);                         // erime ilerlemesi
  const halka = shEase(shSeg(m, 0.04, 0.72));
  const perde = shSeg(m, 0.1, 0.6), lamba = shSeg(m, 0.12, 0.72), batt = shSeg(m, 0.22, 0.72), cerceve = shSeg(m, 0.2, 0.58), hali = shSeg(m, 0.38, 0.95);
  // Pırıl'ın yeri: kollarında → yükselir → süzülür → Feza'nın kulağına iner
  const pr = shPirilYer(t, P, tm);
  // 1) orman fonu, 2) erimeyen oda (dalgalı ışık halkasının dışı)
  shResimT();
  if (halka > 0) { g.drawImage(fon, 0, 0); if (sh.tema === 'deniz') { shDenizDalga(tm, halka); shResimT(); } if (sh.tema === 'bulut') { shBulutKayan(tm, halka); shResimT(); } }
  if (halka < 1) {
    if (halka <= 0) g.drawImage(sh.oda, 0, 0);
    else {
      const cxp = shPX(pr.x), cyp = shPY(pr.y), Rm = Math.hypot(W, H) * 1.15, Rr = halka * Rm;
      const kenar = (i, n) => { const a = i / n * 6.283; return [a, Rr * (1 + 0.07 * Math.sin(a * 5 + tm * 1.3) + 0.04 * Math.sin(a * 9 - tm * 2.1))]; };
      g.save(); g.beginPath(); g.rect(-W, -H, W * 3, H * 3);
      for (let i = 0; i <= 120; i++) { const [a, rr] = kenar(i, 120), xx = cxp + Math.cos(a) * rr, yy = cyp + Math.sin(a) * rr; if (i === 0) g.moveTo(xx, yy); else g.lineTo(xx, yy); }
      g.closePath();
      if (sh.odaDesenC !== sh.oda) { sh.odaDesenC = sh.oda; sh.odaDesen = null; try { sh.odaDesen = g.createPattern(sh.oda, 'no-repeat'); } catch (e) {} }
      if (sh.odaDesen) { g.fillStyle = sh.odaDesen; g.fill('evenodd'); } else { g.clip('evenodd'); g.drawImage(sh.oda, 0, 0); }
      g.restore();
      // halkanın ışıklı kenarı
      const bu3 = sh.tema === 'bulut';
      { const Dq = shDusuk(), x = Dq.x, z = sh.zoom, q = Dq.q;
        x.setTransform(z * q, 0, 0, z * q, (sh.tx - sh.fx * z) * q, (sh.ty - sh.fy * z) * q);
        x.lineJoin = 'round'; x.lineWidth = sh.k0 * 2.4; x.strokeStyle = bu3 ? `rgba(255,190,220,${0.22 * (1 - halka)})` : `rgba(190,160,255,${0.16 * (1 - halka)})`;
        x.beginPath();
        for (let i = 0; i <= 120; i++) { const [a, rr] = kenar(i, 120); if (i === 0) x.moveTo(cxp + Math.cos(a) * rr, cyp + Math.sin(a) * rr); else x.lineTo(cxp + Math.cos(a) * rr, cyp + Math.sin(a) * rr); }
        x.stroke(); x.lineWidth = Math.max(sh.k0 * 0.45, 1.6 / (z * q)); x.strokeStyle = bu3 ? `rgba(255,240,225,${0.6 * (1 - halka)})` : `rgba(240,225,255,${0.5 * (1 - halka)})`; x.stroke();
        shDusukBas(Dq, 'lighter', 1); shResimT(); }
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 26; i++) {
        const [a, rr] = kenar(i + tm * 0.6, 26), tw = 0.5 + 0.5 * Math.sin(tm * 3 + i * 2.3);
        shParilti(cxp + Math.cos(a) * rr, cyp + Math.sin(a) * rr, sh.k0 * (1.2 + tw * 1.6), (1 - halka) * (0.4 + tw * 0.5));
      }
      g.globalCompositeOperation = 'source-over';
    }
  }
  // 3) ay ışığı huzmesi (oda eridikçe söner); ormanda aydan inen yumuşak ışık huzmeleri
  shHuzme(true, 1 - halka, tm);
  shOrmanHuzme(halka, tm);
  // gece lambası Feza uyuyunca kısılır; oda biraz kararır (Pırıl'ın ışığı öne çıksın)
  const kis = sh.atla >= 0 ? 1 : shEase(shSeg(t, P.uyudu - 0.5, P.uyudu + 2.6));
  if (kis > 0 && halka < 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(5,6,22,${0.26 * kis * (1 - halka)})`; g.fillRect(0, 0, W, H); }
  if (halka < 1) { const wa = 0.08 * (1 - kis) * (1 - halka); if (wa > 0.003) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,190,110,${wa})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; } }   // lamba yanıkken oda sıcak aydınlık
  // 4) değişen parçalar (Bölüm 3: önce pencerede şafak söker, odaya pembe ışık düşer)
  const B3 = sh.tema === 'bulut';
  if (B3) shPencerePembe(shEase(shSeg(t, P.b2 - 0.8, P.b3 + 0.3)) * (1 - halka), tm);
  const lyan = lerp(1.15, 0.5, kis) + 0.55 * shEase(lamba);
  if (B3) shLamba(p, lamba, tm, true, lyan);   // güneş bulut perdelerin ARKASINDA doğar
  shPerdeler(p, perde, tm, 0);
  if (!B3) shLamba(p, lamba, tm, true, lyan);
  shHali(p, hali, tm);
  shYatakArka(p, batt, cerceve, tm);
  // dönüşen eşyalardan akan ışık zerreleri
  if (m > 0 && m < 1 && dt > 0) {
    const r = Math.random;
    if (lamba > 0.03 && lamba < 0.97) { const L = shLambaYer(lamba); if (r() < dt * 26) shZerreEkle(L.x + (r() - 0.5) * 2, L.y + (r() - 0.5) * 2, (r() - 0.5) * 3, (r() - 0.3) * 3, lamba < 0.5 || B3 ? '#ffd9a0' : '#cfe6ff', 1.0 + r() * 0.6, 0.5 + r() * 0.5); }
    if (perde > 0.08 && perde < 0.92 && r() < dt * 40) { const yon = r() < 0.5 ? -1 : 1; shZerreEkle((yon < 0 ? SH_PEN.x0 - 4.5 : SH_PEN.x1 + 4.5) - yon * r() * 7, lerp(6, 52, r()), (r() - 0.5) * 1.5, 1.5 + r() * 2.5, B3 ? (r() < 0.5 ? '#ffd0e4' : '#fff0d0') : sh.tema === 'gol' ? (r() < 0.5 ? '#ffe9a8' : '#cfe0ff') : r() < 0.5 ? '#9ff0d0' : '#7fe8ff', 1.6 + r(), 0.6 + r() * 0.5); }
    if (cerceve > 0.05 && cerceve < 0.95 && r() < dt * 30) shZerreEkle(lerp(SH_YATAK.x0 - 2, SH_YATAK.x1 + 2, r()), lerp(62, 74, r()), (r() - 0.5) * 1.5, -2 - r() * 3, r() < 0.5 ? '#c9b2ff' : '#ffe0ff', 1.4 + r(), 0.5 + r() * 0.5);
    if (hali > 0.02 && hali < 0.75 && r() < dt * 36) { const qi = Math.floor(r() * SH_MANTAR.length), q = SH_MANTAR[qi]; shZerreEkle(SH_HALI.x + q[0] + (r() - 0.5), SH_HALI.y + q[1], (r() - 0.5) * 2.5, -3 - r() * 4, B3 ? SH_GK[qi % 7] : sh.tema === 'gol' ? (r() < 0.6 ? '#ffb6d9' : '#fff0f8') : r() < 0.6 ? '#5fd8ff' : '#e0fdff', 1.2 + r() * 0.8, 0.5 + r() * 0.6); }
    if (batt > 0.15 && batt < 0.9 && r() < dt * 22) shZerreEkle(lerp(-60, 15, r()), lerp(60, 84, r()), (r() - 0.5) * 2, -1.5 - r() * 2.5, B3 ? (r() < 0.5 ? '#ffe0ee' : '#fff0c8') : r() < 0.5 ? '#b9ffd8' : '#d9c6ff', 1.6 + r(), 0.5 + r() * 0.5);
  }
  // Feza: önce gözleri açık; yavaşça uykuya dalar (iç çeker), Pırıl kollarında. Ormanda uyanıp doğrulur.
  const nefes = shNefes(t, P, tm);
  let pirilParla = shEase(shSeg(t, P.b2 + 1.2, P.b3 + 0.5));
  if (sh.kisa) pirilParla = Math.max(pirilParla, 0.45 * shEase(shSeg(t, P.acil, P.acil + 1.2)) * (0.8 + 0.2 * Math.sin(tm * 2.2)));   // Pırıl baştan hafifçe nabız atar
  if (pr.kucak) shPirilIsik(shKucak.px, shKucak.py, tm, pirilParla);
  const kalkT = t - P.kalk, ent = shGirisEnt(t, P);
  if (kalkT > 0) {
    const suPoz = sh.tema === 'deniz' && kalkT > 4.4;
    shFeza(SH_FEZA.x, SH_FEZA.y - (suPoz ? shEase(shSeg(kalkT, 4.4, 5.7)) * 2 : 0), sh.fzOlc, suPoz ? 'yuzme' : 'uyanis', tm, null, undefined, undefined, suPoz ? tm : kalkT);
  } else {
    const ic = sh.atla >= 0 ? 0 : shSeg(t, P.ic + 0.75, P.ic + 2.4), ac = Math.sin(ic * Math.PI);
    const yp = shYatisPoz(t, P, tm);
    // feza.js 'uykuya_dalis'/'bakis' bilmiyorsa yedek: düz 'uyku'
    if (ent) shPiril(SH_PIRIL.x, SH_PIRIL.y + 0.5, sh.fzOlc * 0.92, 'pelus', tm, 1);   // peluş Pırıl yastıkta bekler
    if (ent && ent.poz === 'ayakta') { if (ent.standA > 0.01) { g.globalAlpha = ent.standA; shFeza(ent.x, ent.y, sh.fzOlc, 'ayakta', tm); g.globalAlpha = 1; } }
    else if (ent) { shFeza(SH_FEZA.x, SH_FEZA.y, sh.fzOlc, 'yatagaGir', ent.tm); }
    else if (!ent) shFeza(SH_FEZA.x, SH_FEZA.y, sh.fzOlc, yp ? yp[0] : 'uyku', tm, pr.kucak ? pr.poz : null, pr.u, undefined, yp ? yp[1] : tm);
    if (ac > 0.05) {   // iç çekişin minik, ışıklı nefesi
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
      const k = sh.k0 * sh.zoom;
      for (let i = 0; i < 3; i++) { const q = clamp(ic * 1.3 - i * 0.15, 0, 1); dglow('#e6dcff', shEkranX(-39.5 + q * 5 + i), shEkranY(56.5 - q * 4 - i * 0.6), k * (0.8 + q * 1.4), Math.sin(q * Math.PI) * 0.22); }
      g.globalCompositeOperation = 'source-over';
    }
  }
  shBattaniye(p, batt, tm, nefes + (ent ? ent.bump * 1.8 : 0), kalkT > 0 ? shEase(shSeg(kalkT, 0, 1.1)) : 0);
  if (!pr.kucak) { shPirilIsik(pr.x, pr.y, tm, pirilParla * (0.55 + 0.45 * sh.prOlc)); shPiril(pr.x, pr.y, sh.prOlc, pr.poz, tm, pr.f); }
  if (pr.pat > 0) {   // kucaktan havalanırken ışık pırıltısı (poz değişimini yumuşatır)
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const k = sh.k0 * sh.zoom; dglow('#f4e6ff', shEkranX(pr.x), shEkranY(pr.y), k * 9 * pr.pat, pr.pat * 0.9);
    g.globalCompositeOperation = 'source-over';
  }
  shZerreAkit(dt, tm);
  shOnPlan(shEase(shSeg(m, 0.45, 1)));
  // Zzz
  shZzz(t, tm, P);
  // süzülen ışık zerreleri (erirken çoğalır)
  if (B3) { shZerreler(tm, (0.25 + 0.75 * halka) * (1 - halka), true); shZerreler(tm, (0.25 + 0.75 * halka) * halka, 'bulut'); }
  else shZerreler(tm, 0.25 + 0.75 * halka, true);
  // ışık patlaması: Pırıl, Feza'yı uyandırırken
  if (t > P.isik - 0.01) shParlama(t, P, tm);
  // açılışta karanlıktan beliriş
  const kar = 1 - shEase(shSeg(t, P.karar, P.acil));
  if (kar > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(4,5,14,${kar})`; g.fillRect(0, 0, W, H); shZerreler(tm, 0.6 * kar, true); }
  if (sh.kisa) {   // kısa giriş: rüya ışıl ışıl dolar, sonra yumuşakça kararır (bölüm karanlıktan açılır)
    const u = shEase(shSeg(t, P.b4 + 1.0, P.son));
    if (u > 0) {
      g.setTransform(1, 0, 0, 1, 0, 0);
      // Bölüm 3: perde önce koyu gül rengi, sonra gece laciverti (bitişte tam rgb 4,5,14)
      g.fillStyle = B3 ? shMix('#5a2a5e', '#04050e', shEase(shSeg(u, 0.35, 1)), u) : `rgba(4,5,14,${u})`; g.fillRect(0, 0, W, H);
    }
  }
}
function shPirilIsik(x, y, tm, parla) {
  if (sh.tema === 'deniz') parla *= 0.38;
  if (parla <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const px = shEkranX(x), py = shEkranY(y - 1), k = sh.k0 * sh.zoom, nb = 1 + Math.sin(tm * 2.4) * 0.08;
  dglow('#b88aff', px, py, k * 22 * parla * nb, 0.5 * parla);
  dglow('#ffe0ff', px, py, k * 6 * parla, 0.3 * parla);
  for (let i = 0; i < 6; i++) {   // etrafında dönen küçük parıltılar
    const a = tm * 0.9 + i * 1.047, rr = k * (6 + 2.2 * Math.sin(tm * 1.7 + i)) * parla;
    shParilti(px + Math.cos(a) * rr, py + Math.sin(a) * rr * 0.6, k * (0.7 + 0.5 * Math.sin(tm * 4 + i)), parla * 0.8);
  }
  g.globalCompositeOperation = 'source-over';
}
function shZzz(t, tm, P) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  const k = sh.k0 * sh.zoom;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = sh.zz.length - 1; i >= 0; i--) {
    const z = sh.zz[i], u = (t - z.t0) / 3.6;
    if (u >= 1) { sh.zz.splice(i, 1); continue; }
    const x = SH_FEZA.x - 8 + u * 8 + Math.sin(u * 6) * 1.4, y = SH_FEZA.y - 9 - u * 15;
    let a = Math.sin(u * Math.PI) * 0.85 * (1 - shSeg(t, P.b3, P.b3 + 1.5));
    if (P.bk0 && shPozVar('bakis') && sh.atla < 0) a *= 1 - shSeg(t, P.bk0 - 0.8, P.bk0 + 0.2);
    if (a <= 0) continue;
    g.globalAlpha = a; g.fillStyle = '#d9ccff';
    g.font = `700 ${Math.round(k * (2.6 + u * 2.4))}px ui-rounded, "Trebuchet MS", system-ui, sans-serif`;
    g.fillText('z', shEkranX(x), shEkranY(y));
  }
  g.globalAlpha = 1;
}
const shZer = [];
function shZerreler(tm, a, gece) {   // gece: true (camgöbeği/lila), false (altın), 'bulut' (pembe/altın)
  if (!shZer.length) { const r = rng(42); for (let i = 0; i < 34; i++) shZer.push({ x: r(), y: r(), s: 0.5 + r(), h: r() * 6.28, v: 0.004 + r() * 0.01 }); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  for (const z of shZer) {
    const yy = ((z.y - tm * z.v) % 1 + 1) % 1, xx = z.x + Math.sin(tm * 0.4 + z.h) * 0.02;
    const tw = 0.5 + 0.5 * Math.sin(tm * 1.5 + z.h * 3);
    dglow(gece === 'bulut' ? (z.s > 1.1 ? '#ffc6de' : '#ffe9b8') : gece ? (z.s > 1.1 ? '#c9b2ff' : '#9ff0ff') : '#fff0c0', xx * W, yy * H, H * 0.008 * z.s * (1 + tw), a * (0.25 + 0.45 * tw));
  }
  g.globalCompositeOperation = 'source-over';
}
// mor-beyaz ışık: tepe noktasında dünya görünür olur
function shParlama(t, P, tm) {
  const yuksel = shEase(shSeg(t, P.isik, P.dunya));
  g.setTransform(1, 0, 0, 1, 0, 0);
  const L = shCanliFeza(), cx = L.x, cy = L.y;   // açılıştaki çözülmeyle aynı merkez
  shIsikPerde(cx, cy, Math.hypot(W, H) * (0.3 + 0.75 * yuksel), yuksel, yuksel, yuksel * yuksel);
}
// açılışın sonundaki ışık perdesi: iki taraf (sahne ve oyun) aynı renk ve biçimi kullanır; tepe noktasında tamamen opak
function shIsikPerde(cx, cy, R, aIc, aOrta, aDis) {
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R);
  gr.addColorStop(0, `rgba(255,248,255,${aIc})`); gr.addColorStop(0.3, `rgba(230,212,255,${Math.max(aOrta, aIc * 0.8)})`);
  gr.addColorStop(0.65, `rgba(205,178,255,${aOrta})`); gr.addColorStop(1, `rgba(186,156,255,${aDis})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
// tamEkran bitti: gerçek dünya alttan, ışık kenarlardan içe doğru çözülür; Feza ışığın içinden belirir
function shGirisAcilis(tm, t, P) {
  const u = shSeg(t, P.dunya, P.son);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const L = shCanliFeza(), fx = L.x, fy = L.y;
  // ışık kenarlardan içe doğru çözülür, Feza'nın etrafı en son açılır
  shIsikPerde(fx, fy, Math.hypot(W, H) * lerp(1.05, 0.7, shEase(u)), 1 - shEase(shSeg(u, 0.2, 1)), 1 - shEase(shSeg(u, 0.05, 0.75)), 1 - shEase(shSeg(u, 0, 0.55)));
  // ekranda süzülerek sönen ışık zerreleri + Feza'nın etrafında dönen parıltılar
  shZerreler(tm, (1 - u) * 0.9, true);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    const a = tm * 1.6 + i * 0.449, rr = H * (0.05 + 0.1 * u) * (0.7 + 0.3 * Math.sin(i * 2.1));
    shParilti(fx + Math.cos(a) * rr, fy + Math.sin(a) * rr * 0.75, H * 0.012 * (1 + Math.sin(tm * 5 + i) * 0.4), (1 - u) * 0.9);
  }
  g.globalCompositeOperation = 'source-over';
}

// ══════════════════ KAPANIŞ ══════════════════
// Bölüm 2'de final anlatımı için 'a_y_final1..3' cümleleri varsa (ses.js) onlar söylenir; yoksa Bölüm 1 metni
// Bölüm 3'te 'a_b_final1..3' (yoksa Bölüm 1 metni: yıldız cümleleri bulut rüyasına uymaz)
function shFk(k) {
  try {
    const b = sh.fBolum || (typeof BOLUM_NO !== 'undefined' ? BOLUM_NO : 1);
    if (b >= 2 && typeof SES !== 'undefined' && SES.LINES) { const k2 = (b === 5 ? 'a_v_' : b === 4 ? 'a_i_' : b === 3 ? 'a_b_' : 'a_y_') + k.slice(2); if (SES.LINES[k2] || (window.VOICE_DUR && VOICE_DUR[k2])) return k2; }
  } catch (e) {}
  return k;
}
function shFinalPlan() {
  const d1 = shSure(shFk('a_final1')), d2 = shSure(shFk('a_final2')), d3 = shSure(shFk('a_final3'));
  const P = { s1: 0.6 };
  P.isik = P.s1 + Math.max(d1 + 0.8, 4.6);   // altın ışık dolmaya başlar
  P.dolu = P.isik + 2.6;                     // ekran tamamen ışık → oda
  P.oda = P.dolu + 5.0;                      // ışık bir süre çiçek açar (müziğin doruğu), sonra sabah odası belirir
  if ((sh.fBolum || 1) === 4 || (sh.fBolum || 1) === 5) { P.isik = .35; P.dolu = P.isik + 1.8; P.oda = P.dolu + .35; }   // inci kutlaması dünyada tamamlandı; sabaha durmadan geç
  P.s2 = P.oda + 1.6;
  P.yak = P.s2 + Math.max(d2 * 0.45, 2.6);   // Feza peluş Pırıl'ı yanağına kaldırır, kamera iki yüze yaklaşır
  // Bölüm 3: anlatıcı "Pencereden bakmış ki..." derken pencerede gökkuşağı çizilir, kamera pencereye döner;
  // "göz kırpmış"ta yüzlere yaklaşılır
  P.gk = P.oda + 0.9;
  if ((sh.fBolum || 1) === 3) { P.gk = P.s2 + Math.min(3.0, d2 * 0.31); P.yak = Math.max(P.s2 + d2 * 0.78, P.gk + 4.4); }
  P.kirp = Math.max(P.yak + 1.5, P.s2 + d2 - 0.8);   // göz kırpma: anlatıcı "göz kırpmış" derken
  P.kirpBit = P.kirp + 1.7;
  P.s3 = P.kirpBit + 0.2;
  P.son = P.s3 + Math.max(d3 + 1.2, 4.0);
  return P;
}
function shFinalGuncelle(dt) {
  const t = sh.t, P = sh.plan;
  const ses = (k, at) => { if (!sh.sesler[k] && t >= at) { sh.sesler[k] = 1; shSoyle(k); } };
  if ((sh.fBolum || 1) !== 4 && (sh.fBolum || 1) !== 5) ses(shFk('a_final1'), P.s1);   // deniz ve yanardağ son sözü dünyadaki kutlama içinde söylendi
  ses(shFk('a_final2'), P.s2); ses(shFk('a_final3'), P.s3);
  shAn('kutlama');
  shBir('kus0', P.isik + 0.6, 'sabahKus', 0); shBir('kus1', P.isik + 2.2, 'sabahKus', 1); shBir('kus2', P.dolu + 1.2, 'sabahKus', 2);   // ışık dolarken kuşlar
  shBir('gerinme', P.oda + 1.3, 'gerinme'); shBir('esneme', P.oda + 2.6, 'fezaEsne'); shBir('kus3', P.oda + 2.0, 'sabahKus', 1);
  shBir('gozKirpSfx', P.kirp + 0.15, 'gozKirp');
  if (t >= P.isik) shAn('isik'); if (t >= P.dolu) shAn('beyaz'); if (t >= P.oda) shAn('sabah');
  if (t >= P.oda + 0.9) shAn('feza_uyandi'); if (t >= P.kirp) shAn('goz_kirp'); if (t >= P.s3) shAn('son_soz');
  if (!sh.cin && t >= P.kirp) { sh.cin = 1; if (typeof AU !== 'undefined' && AU.sfx) try { AU.sfx('bloom', 0); } catch (e) {} }
  // ekran ışıkla tamamen dolunca dünya artık çizilmez (tamEkran), kopya tuvali de bırakılır
  sh.tam = t >= P.dolu || (t >= P.isik && shEase(shSeg(shEase(shSeg(t, P.isik, P.dolu)), 0.55, 1)) >= 0.999);
  if (sh.tam && shKopya) shKopya = shBirak(shKopya);
  if (t >= P.dolu + 0.6 && !sh.yakinHazir) { sh.yakinHazir = 1; try { shSabahYakin(true); } catch (e) { shHata('odaYakin', e); } }
  // sabah: önce bütün oda (yatakta uyuyan Feza), Feza doğrulunca ona yaklaşılır; Pırıl'ı yanağına kaldırınca
  // iki yüz ekranı doldurur (göz kırpma büyük ve açık okunsun)
  sh.kirpK = shEase(shSeg(t, P.yak - 0.2, P.yak + 1.2));
  let yu = shEase(shSeg(t, P.oda + 1.2, P.oda + 4.2));
  const yk = shEase(shSeg(t, P.yak - 0.4, P.yak + 1.6));
  // Bölüm 3: Feza uyanırken kamera önce pencereye (gökkuşağına) döner, sonra yüzlere yaklaşır
  const pb = (sh.fBolum || 1) === 3 ? shEase(shSeg(t, P.gk - 1.0, P.gk + 0.7)) * (1 - shEase(shSeg(t, P.yak - 1.4, P.yak - 0.1))) : 0;
  if (pb > 0) yu *= 1 - pb;
  const yatay = W > H * 1.1, px0 = yatay ? -3 : 30, py0 = yatay ? 42 : 36, pz = yatay ? 1.42 : 1.3;
  const fx = shPX(lerp(lerp(shKucak.x, shKucak.x + 3.8, yk), px0, pb)), fy = shPY(lerp(lerp(lerp(shKucak.y, shKucak.y - 2, yu), shKucak.y - 2.9, yk), py0, pb));
  const z = lerp(1.14 + 0.86 * yu, pz, pb) + 1.42 * yk + 0.06 * shSeg(t, P.kirp, P.son);   // göz kırpma yakın çekimi ≈ 3.4×
  shKamera(fx, fy, z, lerp(lerp(lerp(W * 0.4, W * 0.5, yu), W * 0.5, yk), W * 0.5, pb), lerp(lerp(lerp(fy, H * 0.55, yu), H * 0.5, yk), H * 0.5, pb));
  if (t >= P.son && sh.bitti) { shAn('son'); const f = sh.bitti; sh.bitti = null; sh.sonGorunum = true; f(); }
}
// sabah odasının yakın çekim kopyası: yatak ve pencere çevresi, 2 kat çözünürlük (bir kez, ekran ışıkla doluyken hazırlanır)
// bölge yalnız yakın çekimlerde (zoom >= 1.7: uyanış, göz kırpma, bitiş ekranı) görünen kısım, 1.8 kat çözünürlük
// (eskiden 80×62 birim 2 kat: 3279×2540 = 33 MB; şimdi 76×63 birim 1.8 kat: 2802×2323 = 26 MB, 3.4× yakın çekimde fark seçilmez)
function shYakinAdim() {
  const k = sh.k0, sc = 1.8, yw = Math.max(40, sh.wu * 0.3);
  const ox = shPX(-26 - yw), oy = shPY(25), w = (Math.min(yw * 2 - 4, sh.wu + 2) * k) * sc, h = (63 * k) * sc;   // dik ekranda ekran genişliğinden geniş olmasın
  const A = shOdaAdim(SH_SABAH, { sc, ox, oy, w, h });
  A.deger = { c: A.c, sc, ox, oy, w: A.c.width, h: A.c.height, W, H };
  return A;
}
function shSabahYakin(hazirla) {
  if (sh.odaYakin && sh.odaYakin.W === W && sh.odaYakin.H === H) return sh.odaYakin;
  return hazirla ? shHazir('odaYakin') : null;
}
// sabah odası sahnesi (bitiş ekranının arkasında da kullanılır)
function shSabahCiz(tm, t, P, sonKirp) {
  const p = SH_SABAH;
  // yakın çekimde (zoom ≥ 1.7) yatağın çevresinin 2 kat çözünürlüklü kopyası (duvar kâğıdı, pencere keskin kalsın)
  const Y = sh.zoom >= 1.7 && shSabahYakin(!sh.mod), z = sh.zoom;
  if (Y && (0 - sh.tx) / z + sh.fx >= Y.ox && (W - sh.tx) / z + sh.fx <= Y.ox + Y.w / Y.sc && (0 - sh.ty) / z + sh.fy >= Y.oy && (H - sh.ty) / z + sh.fy <= Y.oy + Y.h / Y.sc) {
    g.setTransform(z / Y.sc, 0, 0, z / Y.sc, sh.tx + (Y.ox - sh.fx) * z, sh.ty + (Y.oy - sh.fy) * z);
    g.imageSmoothingQuality = 'high'; g.drawImage(Y.c, 0, 0); sh.sabahY = 1;
  } else { const B = shHazir('odaSabah'); shResimT(); g.drawImage(B, 0, 0); sh.sabahY = 0; }
  shHuzme(false, 1, tm);
  const fb = sh.fBolum || 1, b2 = fb === 2, b3 = fb === 3;
  if (fb === 4) shDenizSabah(tm);
  if (fb === 4) shSabahPencere(tm, true);
  else if (fb === 5) sh5Sabah(tm, P ? shEase(shSeg(t, P.oda + .6, P.oda + 3.5)) : 1);
  else if (b3) { shSabahGokkusagi(tm, P ? shSeg(t, P.gk, P.gk + 2.6) : 1); shSabahPencere(tm, true); }
  else if (b2) shSabahPencere(tm);
  else shSabahAgac(tm, P ? shEase(shSeg(t, P.oda + 0.6, P.oda + 3.5)) : 1);
  shPerdeler(p, 0, tm * 0.6, 1);
  shLamba(p, 0, tm, false, 0);
  shHali(p, 0, tm);
  shYatakArka(p, 0, 0, tm);
  // Feza önce uyuyor, sonra doğrulup gözlerini ovuşturur, gerinir, gülümser; peluş Pırıl kucağında
  const uT = P ? t - (P.oda + 0.9) : 99;
  const kirp = P ? (t >= P.kirp && t < P.kirpBit) : !!sonKirp;
  const otur = uT <= 0 ? 0 : shEase(shSeg(uT, 0, 1.1));
  // Pırıl yanağına kaldırılınca Feza ona sarılır ('sarilma': elleri kirpK eğrisiyle birlikte Pırıl'la yükselir)
  const sar = (!P || t >= P.yak - 0.2) && shPozVar('sarilma');
  shFeza(SH_FEZA.x, SH_FEZA.y, 1.18, uT <= 0 ? 'uyku' : sar ? 'sarilma' : 'uyanis', uT <= 0 ? tm : sar ? (P ? t - (P.yak - 0.2) : 9) : uT, kirp ? 'goz_kirp' : (P && t < P.oda + 2.2 && shPirilPozVar('sabah') ? 'sabah' : 'pelus'), P && t < P.oda + 2.2 ? shEase(shSeg(t, P.oda - 0.6, P.oda + 2.2)) : undefined, tm);   // Pırıl: canlıdan peluşa ~2,8 sn
  shBattaniye(p, 0, tm, uT <= 0 ? Math.sin(tm * 1.5) * 0.5 + 0.5 : 0, otur);
  if (P && t >= P.kirp) {   // göz kırpınca masalsı, sıcak altın yıldız ve kalp ışıltısı
    const u = shSeg(t, P.kirp + 0.05, P.kirp + 1.6);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const q = sh.prEk || { x: shEkranX(shKucak.px), y: shEkranY(shKucak.py), s: sh.k0 * sh.zoom * 0.2 };
    const px = q.x + 17 * q.s, py = q.y - 25 * q.s, r = q.s * 9;
    const sinU = Math.sin(u * Math.PI);
    dglow('#ffdd98', px, py, r * 2.2 * sinU, sinU * 0.55);
    dglow('#ffffff', px, py, r * 0.9 * sinU, sinU * 0.85);
    shParilti(px, py, r * 1.3 * sinU, sinU);
    if (u > 0.2 && u < 0.8) {
      const u2 = (u - 0.2) / 0.6;
      shParilti(px + Math.cos(u2 * 3.14) * r * 0.6, py - Math.sin(u2 * 3.14) * r * 0.6, r * 0.5 * Math.sin(u2 * Math.PI), Math.sin(u2 * Math.PI) * 0.7);
    }
    g.globalCompositeOperation = 'source-over';
  }
  // gün doğumu rengi: odaya süzülen altın sabah güneşi huzmeleri ve sıcacık uyanış
  { const u = P ? shEase(shSeg(t, P.oda, P.oda + 4.5)) : 1, sn = P ? 1 - 0.4 * shEase(shSeg(t, P.yak, P.yak + 3)) : 0.6;
    const wa = 0.11 * u * sn * (1 + 0.14 * Math.sin(tm * 0.6)), ca = 0.045 * (1 - u);
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (ca > 0.003) { g.fillStyle = `rgba(185,200,255,${ca})`; g.fillRect(0, 0, W, H); }
    if (wa > 0.003) { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,200,125,${wa})`; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; } }
  shSabahTozu(tm, b3 ? 3 : b2 ? 2 : 1);
  shZerreler(tm, 0.75, false);
}
// Bölüm 3 sabahı: pencereden GERÇEK bir gökkuşağı (soldan sağa yavaşça çizilir, sonra yumuşakça ışıldar) + duvarda
// gökkuşağı ışığı lekesi (yakın çekimlerde de görünür). a: 0..1 beliriş
function shSabahGokkusagi(tm, a) {
  if (a <= 0.004) return;
  const sw = shEase(a), cx = 27.5, cy = 49, R0 = 17.5, bw = 1.05, a0 = Math.PI * 1.0, a1 = a0 + Math.PI * sw;
  shOdaT(); g.save(); shPencereYol(g, 0); g.clip();
  g.lineCap = 'butt';
  g.globalCompositeOperation = 'lighter';   // yayın altında yumuşak beyaz ışık
  g.strokeStyle = 'rgba(255,250,235,0.18)'; g.lineWidth = bw * 11; g.beginPath(); g.arc(cx, cy, R0 - bw * 3, a0, a1); g.stroke();
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 7; i++) {
    g.strokeStyle = SH_GK[i];
    g.globalAlpha = 0.22; g.lineWidth = bw * 1.9; g.beginPath(); g.arc(cx, cy, R0 - i * bw, a0, a1); g.stroke();   // yumuşak kenar
    g.globalAlpha = 0.6; g.lineWidth = bw * 0.95; g.beginPath(); g.arc(cx, cy, R0 - i * bw, a0, a1); g.stroke();
  }
  g.globalAlpha = 1;
  // yay boyunca yavaşça kayan parlaklık
  const ph = (tm * 0.12) % 1.4 - 0.2, ap = a0 + Math.PI * clamp(ph, 0, 1);
  if (ph > 0 && ph < 1 && sw > 0.99) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = bw * 7; g.beginPath(); g.arc(cx, cy, R0 - bw * 3, Math.max(a0, ap - 0.12), Math.min(a1, ap + 0.12)); g.stroke(); g.globalCompositeOperation = 'source-over'; }
  g.restore();
  // pencere kayıtları yayın önünde kalsın
  g.fillStyle = SH_SABAH.frame; const cxw = (SH_PEN.x0 + SH_PEN.x1) / 2;
  g.fillRect(cxw - 0.6, SH_PEN.ust, 1.2, SH_PEN.alt - SH_PEN.ust); g.fillRect(SH_PEN.x0, 31, SH_PEN.x1 - SH_PEN.x0, 1.2);
  // çizilirken yayın ucunda ışıltı; sonra yay üstünde ara sıra ışıltılar
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const k = sh.k0 * sh.zoom;
  if (sw < 0.999) { const ex = cx + Math.cos(a1) * (R0 - bw * 3), ey = cy + Math.sin(a1) * (R0 - bw * 3); if (ex > SH_PEN.x0 && ex < SH_PEN.x1 && ey < SH_PEN.alt) { dglow('#fff4d8', shEkranX(ex), shEkranY(ey), k * 5, 0.6); shParilti(shEkranX(ex), shEkranY(ey), k * 3, 0.9); } }
  for (let i = 0; i < 4; i++) {
    const an = a0 + Math.PI * ((i * 0.27 + 0.12) % 1), tw = Math.pow(0.5 + 0.5 * Math.sin(tm * 1.7 + i * 2.3), 3), ex = cx + Math.cos(an) * (R0 - bw * (i % 7)), ey = cy + Math.sin(an) * (R0 - bw * (i % 7));
    if (an < a1 && ex > SH_PEN.x0 + 1 && ex < SH_PEN.x1 - 1 && ey < SH_PEN.alt - 1) shParilti(shEkranX(ex), shEkranY(ey), k * (0.8 + 1.4 * tw), a * tw * 0.9);
  }
  g.globalCompositeOperation = 'source-over';
  // duvarda gökkuşağı ışığı (cam kenarından kırılan sabah ışığı): yatağın üstünde yumuşak, hafifçe kıpırdayan yay
  const pa = shEase(shSeg(a, 0.35, 1)) * (0.85 + 0.15 * Math.sin(tm * 0.9));
  if (pa > 0.01) {
    shOdaT(); const px = -12 + Math.sin(tm * 0.21) * 0.6, py = 47, pr = 7.5;
    g.lineCap = 'round';
    for (let i = 0; i < 7; i++) { g.strokeStyle = SH_GK[i]; g.globalAlpha = 0.16 * pa; g.lineWidth = 0.75; g.beginPath(); g.arc(px, py, pr - i * 0.62, Math.PI * 1.2, Math.PI * 1.75); g.stroke(); }
    g.globalAlpha = 1;
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; dglow('#fff0d8', shEkranX(px), shEkranY(py - pr + 2), k * 6, 0.12 * pa); g.globalCompositeOperation = 'source-over';
  }
}
// Bölüm 1 sabahı: pencereden uzak tepede Işık Ağacı yumuşakça parlar (rüyanın izi), etrafında minik ışık tanecikleri
function sh5Sabah(tm, a) {
  if (a <= .01) return;
  shOdaT(); g.save(); shPencereYol(g, 0); g.clip(); g.globalAlpha=a;
  g.fillStyle='#a79ab3';g.beginPath();g.moveTo(14,47);g.bezierCurveTo(24,44,26,38,29,34);g.quadraticCurveTo(31,34.8,33,34);g.bezierCurveTo(35,39,39,44,46,47);g.closePath();g.fill();
  g.fillStyle='#7e839f';g.beginPath();g.moveTo(31,35);g.lineTo(29,43);g.lineTo(24,47);g.lineTo(39,47);g.lineTo(33,34);g.closePath();g.fill();
  g.strokeStyle='#f8d3ad';g.lineWidth=.25;g.beginPath();g.moveTo(29.1,34.1);g.quadraticCurveTo(31,35.2,32.9,34.1);g.moveTo(30.2,35);g.bezierCurveTo(29.8,39,31.5,40,28.7,45);g.stroke();
  // Uzak sıcak dağ ve pencereden geçen üç küçük altın kâğıt kuş: rüyadan sabaha kalan iz.
  for(let i=0;i<3;i++){
    const u=(tm*.028+i*.29)%1,bx=15+u*26,by=25+i*3+Math.sin(tm*.7+i)*.5,fl=Math.sin(tm*3.1+i)*.55;
    g.fillStyle=i%2?'#eabf9b':'#f4d99d';g.beginPath();g.moveTo(bx-1.2,by-.3);g.lineTo(bx-.3,by+.1);g.lineTo(bx+.7,by-.2);g.lineTo(bx+1.6,by-.1);g.lineTo(bx+.6,by+.5);g.lineTo(bx-.5,by+.4);g.fill();
    g.fillStyle='#fff0ce';g.beginPath();g.moveTo(bx,by+.2);g.lineTo(bx-1.5,by-1.2-fl);g.lineTo(bx-.4,by+.4);g.lineTo(bx+.7,by-1.6-fl);g.lineTo(bx+.6,by+.2);g.fill();
  }
  g.restore(); g.globalAlpha=1;
}
function shSabahAgac(tm, a) {
  if (a <= 0.01) return;
  const ax = 33.5, ay = 44.6, nb = 0.5 + 0.5 * Math.sin(tm * 1.1);
  shOdaT(); g.save(); shPencereYol(g, 0); g.clip();
  g.globalAlpha = a; g.fillStyle = '#8fbf86';
  g.beginPath(); g.moveTo(ax - 0.25, ay + 2); g.lineTo(ax - 0.12, ay); g.lineTo(ax + 0.12, ay); g.lineTo(ax + 0.25, ay + 2); g.fill();
  g.fillStyle = '#a8d896'; g.beginPath(); g.arc(ax, ay - 0.8, 1.5, 0, 6.283); g.arc(ax - 1.1, ay - 0.2, 1.0, 0, 6.283); g.arc(ax + 1.1, ay - 0.3, 1.05, 0, 6.283); g.fill();
  g.restore(); g.globalAlpha = 1;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const k = sh.k0 * sh.zoom, px = shEkranX(ax), py = shEkranY(ay - 0.7);
  dglow('#fff0a8', px, py, k * (3.6 + 0.6 * nb), a * (0.45 + 0.15 * nb)); dglow('#ffffff', px, py, k * 1.2, a * 0.35);
  for (let i = 0; i < 5; i++) { const u = (tm * 0.12 + i / 5) % 1, x = ax + Math.sin(i * 2.3 + tm * 0.7) * 1.6, y = ay - 1 - u * 5; if (y > SH_PEN.ust + 14) shParilti(shEkranX(x), shEkranY(y), k * 0.5, a * Math.sin(u * Math.PI) * 0.8); }
  g.globalCompositeOperation = 'source-over';
}
// Bölüm 2 sabahı: pencerede sönmekte olan birkaç yıldız, lambanın yıldız ışıkları, odada rüyadan kalan yıldız tozu
function shSabahPencere(tm, yildizYok) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const k = sh.k0 * sh.zoom;
  const Y = [[18, 17, 1.2], [23, 25, 1], [28, 16, 1.3], [34, 24, 1.1], [37, 17, 0.9], [20, 33, 0.8], [31, 32, 0.9]];
  for (let i = 0; i < (yildizYok ? 0 : Y.length); i++) {
    const q = Y[i], tw = 0.5 + 0.5 * Math.sin(tm * 1.6 + i * 2.1), px = shEkranX(q[0]), py = shEkranY(q[1]), r = k * 1.15 * q[2] * (0.7 + 0.5 * tw);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.75 + 0.25 * tw; g.fillStyle = '#ffc23a'; g.strokeStyle = '#fff2b0'; g.lineWidth = Math.max(1, r * 0.12); g.lineJoin = 'round'; shYildiz5(g, px, py, r * 1.3); g.fill(); g.stroke(); g.globalAlpha = 1; g.globalCompositeOperation = 'lighter'; dglow('#ffe9a0', px, py, r * 2.4, 0.2 * tw);
  }
  // pencereden geçen kuş siluetleri (kanat çırpar)
  g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(70,60,90,0.75)'; g.lineWidth = Math.max(1.2, k * 0.22); g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const u = ((tm * (0.03 + i * 0.006) + i * 0.33) % 1), bx = 15 + u * 24, by = 20 + i * 5 + Math.sin(tm * 0.7 + i) * 1.3, fl = Math.sin(tm * (6 + i) + i * 2) * 0.9, s2 = 1.4 - i * 0.2;
    const px = shEkranX(bx), py = shEkranY(by), w = k * s2 * 1.4;
    g.beginPath(); g.moveTo(px - w, py - w * 0.2 * (1 - fl)); g.quadraticCurveTo(px - w * 0.4, py - w * 0.6 * (0.4 + fl), px, py); g.quadraticCurveTo(px + w * 0.4, py - w * 0.6 * (0.4 + fl), px + w, py - w * 0.2 * (1 - fl)); g.stroke();
  }
}
// rüyadan odaya kalan toz: Bölüm 1 ışıklı yaprakçıklar, Bölüm 2 yıldız tozu (+ lambada yıldızlar), Bölüm 3 gökkuşağı ışıltıları
function shSabahTozu(tm, fb) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const k = sh.k0 * sh.zoom, lx = shEkranX(SH_LAMBA.x), ly = shEkranY(SH_LAMBA.y - 3);
  if (fb !== 2) {
    for (let i = 0; i < 16; i++) {
      const u = (tm * (0.016 + (i % 5) * 0.004) + i * 0.137) % 1, x = -52 + ((i * 37) % 80) + Math.sin(tm * 0.5 + i) * 1.8, y = fb === 1 ? 18 + u * 64 : 82 - u * 66;   // yaprakçıklar süzülerek iner, ışıltılar yükselir
      const e = Math.sin(u * Math.PI), tw = 0.5 + 0.5 * Math.sin(tm * 2.2 + i * 1.7), px = shEkranX(x), py = shEkranY(y);
      if (fb === 1) {
        g.globalCompositeOperation = 'source-over'; g.globalAlpha = e * (0.45 + 0.35 * tw); g.fillStyle = i % 3 ? '#7fd8e8' : '#f59ac8';
        g.save(); g.translate(px, py); g.rotate(tm * 0.8 + i); g.beginPath(); g.ellipse(0, 0, k * 0.75, k * 0.32, 0, 0, 6.283); g.fill(); g.restore();
        g.globalCompositeOperation = 'lighter'; dglow(i % 3 ? '#9ff0ff' : '#ffb0e0', px, py, k * 1.6, e * 0.18 * tw);
      } else {
        g.globalCompositeOperation = 'source-over'; g.globalAlpha = e * (0.4 + 0.4 * tw); g.fillStyle = SH_GK[i % 7]; shYildiz4(g, px, py, k * (0.45 + (i % 4) * 0.18) * (0.6 + 0.5 * tw), 0.25); g.fill();
      }
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    return;
  }
  for (let i = 0; i < 3; i++) { const tw = 0.5 + 0.5 * Math.sin(tm * 1.8 + i * 2.2), a = -0.5 + i * 0.9; g.globalAlpha = 0.35 + 0.4 * tw; g.fillStyle = '#ffe8a0'; shYildiz4(g, lx + Math.sin(a) * k * 5, ly - Math.cos(a) * k * 5.5, k * 1.1 * (0.6 + 0.5 * tw), 0.25); g.fill(); }
  for (let i = 0; i < 18; i++) {
    const u = (tm * (0.018 + (i % 5) * 0.004) + i * 0.137) % 1, x = -52 + ((i * 37) % 80) + Math.sin(tm * 0.5 + i) * 1.6, y = 82 - u * 66;
    const e = Math.sin(u * Math.PI), tw = 0.5 + 0.5 * Math.sin(tm * 2.4 + i * 1.7);
    g.globalAlpha = e * (0.35 + 0.45 * tw); g.fillStyle = i % 3 ? '#ffe9a8' : '#e6d2ff'; shYildiz4(g, shEkranX(x), shEkranY(y), k * (0.5 + (i % 4) * 0.22) * (0.6 + 0.5 * tw), 0.25); g.fill();
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
// kutlama çekimi: Pofuduklar Feza ile Pırıl'ın çevresinde dans ederken kamera grubu ortalayıp yavaşça yaklaşır (çizilmiş kare
// kopyalanıp büyütülerek geri çizilir); ışık yükselirken odak ağacın parlayan gövdesine kayar.
let shKopya = null;
const shGrup = { x0: 0, x1: 0, y0: 0, y1: 0 };
function shFinalOdak() {   // grubun ekran pikseli cinsinden merkezi ve ona yakışan yakınlık
  if (typeof cam === 'undefined' || typeof OYUN === 'undefined') return { x: W / 2, y: H * 0.55, z: 1.15 };
  const F = OYUN.P, G = shGrup;
  if ((sh.fBolum || 1) === 4 && typeof INCI !== 'undefined') { const b = INCI.kameraKutu(); if (b) return { x: ((b.x0 + b.x1) / 2 - cam.x) * S, y: ((b.y0 + b.y1) / 2 - cam.y) * S, z: 1.025 }; }
  G.x0 = F.x - 30; G.x1 = F.x + 30; G.y0 = F.y - 90; G.y1 = F.y;
  const ekle = (x, y, r) => { if (!isFinite(x) || !isFinite(y)) return; G.x0 = Math.min(G.x0, x - r); G.x1 = Math.max(G.x1, x + r); G.y0 = Math.min(G.y0, y - r); G.y1 = Math.max(G.y1, y + r * 0.3); };
  for (const o of NESNELER) {
    if ((o.tip === 'pofuduk' || o.tip === 'kuzu') && Math.abs(o.x - F.x) < 420 && Math.abs(o.y - F.y) < 260) ekle(o.x, o.y - 24, 34);
    // Büyük Pofuduk grubun yanına (yere) gelince bütünüyle kadraja girsin (kenarda yarım kıvrık tutam görünmesin)
    else if (o.tip === 'buyukPofuduk' && Math.abs(o.x - F.x) < 480 && Math.abs(o.y - F.y) < 90) { ekle(o.x, o.y - 100, 104); G.y0 = Math.min(G.y0, o.y - 240); }
  }
  if (typeof D !== 'undefined' && Math.abs(D.x - F.x) < 360 && Math.abs(D.y - F.y) < 300) ekle(D.x, D.y, 34);
  const wpx = (G.x1 - G.x0 + 80) * S, hpx = (G.y1 - G.y0 + 120) * S;
  return { x: ((G.x0 + G.x1) / 2 - cam.x) * S, y: ((G.y0 + G.y1) / 2 - cam.y) * S, z: clamp(Math.min(W * 0.78 / wpx, H * 0.62 / hpx), 1.06, 1.26) };
}
function shFinalKamera(t, P, dt) {
  // cihaz zorlanıyorsa (kareler uzun) bu süsü yumuşakça bırak: ekran kopyası tam ekran iki çizim demek
  sh.kareOrt = lerp(sh.kareOrt || 1 / 60, dt || 1 / 60, 0.05);
  if (sh.kareOrt > 1 / 42) sh.kamYavas = Math.min(1, (sh.kamYavas || 0) + (dt || 0) * 0.5);
  const yav = 1 - (sh.kamYavas || 0);
  // hedef: dans eden grup → (ışık yükselirken) ağacın parlayan gövdesi
  const o = shFinalOdak();
  let tx = o.x, ty = o.y, tz = o.z;
  if (typeof TREE !== 'undefined' && TREE && typeof cam !== 'undefined') {
    const w = shEase(shSeg(t, P.isik - 0.6, P.dolu));
    tx = lerp(tx, (TREE.x - cam.x) * S, w * 0.6); ty = lerp(ty, (TREE.y - 170 - cam.y) * S, w * 0.5); tz += 0.05 * w;
  }
  const f = sh.fo || (sh.fo = { x: tx, y: ty, z: 1, tz }), k = 1 - Math.exp(-(dt || 0) * 0.8);
  f.x = lerp(f.x, tx, k); f.y = lerp(f.y, ty, k); f.tz = lerp(f.tz, tz, k * 0.7);   // grup büyüyünce (yeni gelen Pofuduk) yakınlık da yavaşça değişir
  // yaklaşma: ilk 3 sn'de yumuşakça gruba, sonra çok yavaş sürüklenme
  const yak = shEase(shSeg(t, 0.25, 3.2));
  f.z = 1 + (f.tz - 1) * yak * yav + 0.025 * shSeg(t, 3.2, P.dolu) * yav;
  const z = f.z;
  if (z <= 1.0005) return { z: 1, cx: 0, cy: 0, sx: 0, sy: 0 };
  // grup ekranın ortasına (biraz aşağıya: üstte ağacın taç ışığı görünsün) yavaşça gelir; resim ekranı hep kaplar
  const cx = clamp(f.x, 0, W), cy = clamp(f.y, 0, H), ort = yak * 0.85;
  const sx = clamp(lerp(cx, W * 0.5 + W * 0.02 * shSeg(t, 0, P.dolu), ort), W - z * (W - cx), z * cx);
  const sy = clamp(lerp(cy, H * 0.6, ort), H - z * (H - cy), z * cy);
  // yalnız ekranda görünecek kısım (1/z²'si) kopyalanır ve geri büyütülür (1.06–1.3×: çift doğrusal yeterli, 'high' gereksiz pahalı)
  const ax = cx - sx / z, ay = cy - sy / z;
  const x0 = Math.max(0, Math.floor(ax) - 1), y0 = Math.max(0, Math.floor(ay) - 1);
  const kw = Math.min(W, Math.ceil(ax + W / z) + 1) - x0, kh = Math.min(H, Math.ceil(ay + H / z) + 1) - y0;
  if (kw < 2 || kh < 2) return { z: 1, cx: 0, cy: 0, sx: 0, sy: 0 };
  if (!shKopya || shKopya.width !== W || shKopya.height !== H) { shKopya = shBirak(shKopya) || shTuval(); }
  const kx = shKopya.getContext('2d');
  kx.setTransform(1, 0, 0, 1, 0, 0); kx.clearRect(0, 0, kw, kh); kx.drawImage(g.canvas, x0, y0, kw, kh, 0, 0, kw, kh);   // 'copy' bütün tuvali silerdi
  g.setTransform(z, 0, 0, z, sx - z * cx, sy - z * cy);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'low';
  g.drawImage(shKopya, 0, 0, kw, kh, x0, y0, kw, kh);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return { z, cx, cy, sx, sy };
}
// ¼ çözünürlüklü ekran tamponu: büyük, yumuşak ışıklar (tam ekran parıltılar, huzmeler, ışık dolgusu) burada küçük çizilir
// ve ekrana tek seferde büyütülerek basılır (3–5 tam ekran geçiş yerine 1)
let shDus = null;
function shDusuk() {
  const q = 0.25, w = Math.max(2, Math.ceil(W * q)), h = Math.max(2, Math.ceil(H * q));
  if (!shDus || shDus.c.width !== w || shDus.c.height !== h) {
    if (shDus) shBirak(shDus.c);
    const c = document.createElement('canvas'); c.width = w; c.height = h; shDus = { c, x: c.getContext('2d'), q };
  }
  const x = shDus.x;
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, w, h);
  x.setTransform(q, 0, 0, q, 0, 0);
  return shDus;
}
function shDusukBas(Dq, op, a) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = op; g.globalAlpha = a;
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'low';
  g.drawImage(Dq.c, 0, 0, Dq.c.width / Dq.q, Dq.c.height / Dq.q);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function shParlakX(x, col, px, py, r, a) { if (a <= 0.004 || r <= 0) return; x.globalAlpha = Math.min(1, a); x.drawImage(glow(col), px - r, py - r, r * 2, r * 2); x.globalAlpha = 1; }
function shFinalCiz(tm, dt) {
  const t = sh.t, P = sh.plan;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if ((sh.fBolum || 1) === 4 && !sh.tam) {
    // Büyük ışık patlaması yerine incinin renginden sakin sabah kremine çözülme.
    const u = shEase(shSeg(t, P.isik, P.dolu));
    if (u > 0) { g.globalAlpha = u; g.fillStyle = '#f5f1df'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    return;
  }
  if (!sh.tam) {
    // ekran tamamen ışıkla dolduysa: dünyayı büyütüp ışıkları çizmeye gerek yok (en ağır an)
    const tamDolu = t >= P.isik && shEase(shSeg(shEase(shSeg(t, P.isik, P.dolu)), 0.55, 1)) >= 0.999;
    const K = tamDolu ? sh.sonK || { z: 1, cx: 0, cy: 0, sx: 0, sy: 0 } : (sh.sonK = shFinalKamera(t, P, dt));
    const ek = (x, y) => K.z === 1 ? [x, y] : [K.sx + (x - K.cx) * K.z, K.sy + (y - K.cy) * K.z];
    // kutlama: aydınlık ormanın üstünde yükselen altın zerreler + ağaçtan yayılan ışık
    const a = shEase(shSeg(t, 0, 1.5));
    if (!tamDolu) shAltinZerre(tm, a);
    if (t >= P.isik) {
      const u = shEase(shSeg(t, P.isik, P.dolu));
      let tx = W / 2, ty = H * 0.4;
      if (typeof TREE !== 'undefined' && TREE && typeof cam !== 'undefined') { [tx, ty] = ek((TREE.x - cam.x) * S, (TREE.y - 200 - cam.y) * S); tx = clamp(tx, W * 0.15, W * 0.85); ty = clamp(ty, H * 0.15, H * 0.7); }
      else if (typeof BOLUM !== 'undefined' && BOLUM && BOLUM.gokkusagi && typeof cam !== 'undefined' && isFinite(BOLUM.gokkusagi.x)) { [tx, ty] = ek((BOLUM.gokkusagi.x - cam.x) * S, (BOLUM.gokkusagi.y - 160 - cam.y) * S); tx = clamp(tx, W * 0.15, W * 0.85); ty = clamp(ty, H * 0.15, H * 0.7); }
      // önce eklemeli ışık (parlar, bulanıklaştırmaz), sonra krem-altın beyazlık ekranı doldurur
      const D2 = Math.hypot(W, H);
      if (!tamDolu) {
      // üç büyük parıltı + huzmeler ¼ tamponda toplanır, ekrana tek 'lighter' geçişle basılır
      const Dq = shDusuk(), x = Dq.x, gk3 = (sh.fBolum || 1) === 3, ak = gk3 ? 0.3 : 1;   // Bölüm 3: pembe dünyada beyaza doymasın
      x.globalCompositeOperation = 'lighter';
      shParlakX(x, '#ffd890', tx, ty, D2 * (0.3 + 1.1 * u), Math.min(1, u * 2) * ak);
      shParlakX(x, '#ffe2a0', tx, ty, D2 * (0.2 + 0.7 * u), Math.min(1, u * 2) * ak);
      shParlakX(x, '#fff6dc', tx, ty, D2 * (0.08 + 0.5 * u), Math.min(1, u * 1.8) * (gk3 ? 0.5 : 1));
      // ağaçtan yükselen ışık huzmeleri (yavaşça döner): tek degrade, her huzme döndürülmüş birim üçgen
      const ha = 0.22 * Math.min(1, u * 2.5);
      if (ha > 0.003 && !gk3) {
        if (!sh.huzmeGr) { sh.huzmeGr = x.createLinearGradient(0, 0, 1, 0); sh.huzmeGr.addColorStop(0, 'rgba(255,236,190,1)'); sh.huzmeGr.addColorStop(1, 'rgba(255,236,190,0)'); }
        x.fillStyle = sh.huzmeGr; x.globalAlpha = ha;
        const gk = (sh.fBolum || 1) === 3;   // Bölüm 3: yedi huzme gökkuşağının yedi rengi
        if (gk && !sh.huzmeGk) sh.huzmeGk = SH_GK.map(c => { const q = x.createLinearGradient(0, 0, 1, 0); q.addColorStop(0, mixc(c, '#ffffff', 0.35)); q.addColorStop(1, mixc(c, '#ffffff', 0.35, 0)); return q; });
        for (let i = 0; i < 7; i++) {
          if (gk) { x.fillStyle = sh.huzmeGk[i]; x.globalAlpha = ha * 1.3; }
          const aci = -Math.PI / 2 + (i - 3) * 0.33 + Math.sin(tm * 0.3 + i) * 0.05, L = D2 * (0.25 + 0.6 * u), w = 0.05 + 0.02 * Math.sin(tm + i);
          const c = Math.cos(aci) * L, sn = Math.sin(aci) * L;   // birim üçgen (0,0)-(cos w, ±sin w) → döndür + ölçekle
          x.setTransform(c * Dq.q, sn * Dq.q, -sn * Dq.q, c * Dq.q, tx * Dq.q, ty * Dq.q);
          x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(w), -Math.sin(w)); x.lineTo(Math.cos(w), Math.sin(w)); x.closePath(); x.fill();
        }
        x.globalAlpha = 1;
      }
      x.globalCompositeOperation = 'source-over';
      shDusukBas(Dq, 'lighter', 1);
      if (gk3 && ha > 0.003) {   // yedi doygun renk huzme: normal karışım (beyaza doymaz, renkler okunur), yavaşça döner
        if (!sh.huzmeGk3) sh.huzmeGk3 = SH_GK.map(c => { const q = g.createLinearGradient(0, 0, 1, 0); q.addColorStop(0, mixc(c, '#ffffff', 0.15, 0.85)); q.addColorStop(0.55, mixc(c, '#ffffff', 0.1, 0.45)); q.addColorStop(1, mixc(c, '#ffffff', 0, 0)); return q; });
        const L = D2 * (0.3 + 0.7 * u), al = Math.min(1, u * 2.2) * (1 - shEase(shSeg(u, 0.6, 1)) * 0.5);
        for (let i = 0; i < 14; i++) {   // çepeçevre iki tur yedi renk (merkez ekran kenarında olsa da görünür)
          const aci = i / 14 * 6.283 + tm * 0.12 + Math.sin(tm * 0.3 + i) * 0.03, w = 0.1 + 0.02 * Math.sin(tm + i);
          const c = Math.cos(aci) * L * 1.4, sn = Math.sin(aci) * L * 1.4;
          g.setTransform(c, sn, -sn, c, tx, ty); g.globalAlpha = al * 0.5; g.fillStyle = sh.huzmeGk3[i % 7];
          g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(w), -Math.sin(w)); g.lineTo(Math.cos(w), Math.sin(w)); g.closePath(); g.fill();
        }
        g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
      }
      }
      const v = shEase(shSeg(u, 0.55, 1));
      if (v > 0) {
        const gr = g.createRadialGradient(tx, ty, 0, tx, ty, D2 * (0.2 + 1.2 * v));
        if ((sh.fBolum || 1) === 3) { gr.addColorStop(0, `rgba(255,248,236,${v})`); gr.addColorStop(0.6, `rgba(255,236,222,${v})`); gr.addColorStop(1, `rgba(255,224,190,${v * v})`); }
        else { gr.addColorStop(0, `rgba(255,252,238,${v})`); gr.addColorStop(0.6, `rgba(255,240,205,${v})`); gr.addColorStop(1, `rgba(255,228,175,${v * v})`); }
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
      }
    }
    return;
  }
  // altın ışıktan sabaha
  const s = 1 - shEase(shSeg(t, P.oda, P.oda + 2.4));
  if (s < 0.999) shSabahCiz(tm, t, P);
  if (s > 0) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    // ışık nefes alır: merkez yavaşça süzülür, kenarlar sıcak altın
    const nb = Math.sin((t - P.dolu) * 0.9), cx = W * (0.55 + 0.04 * Math.sin((t - P.dolu) * 0.35)), cy = H * (0.38 + 0.03 * nb);
    // yumuşak degrade ¼ tamponda çizilir, tek geçişte büyütülür (saydamlık s → globalAlpha; renkler aynı)
    const Dq = shDusuk(), x = Dq.x;
    const gr = x.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * (0.75 + 0.05 * nb));
    gr.addColorStop(0, 'rgb(255,253,240)'); gr.addColorStop(0.55, 'rgb(255,242,214)'); gr.addColorStop(1, 'rgb(255,222,165)');
    x.fillStyle = gr; x.fillRect(0, 0, W, H);
    shDusukBas(Dq, 'source-over', s);
    shIsikCicek(t - P.dolu, tm, s * shEase(shSeg(t, P.dolu, P.dolu + 1.2)));
  }
}
// beyaz ışığın içinde: yavaşça yükselen, parıldayan altın yıldızcıklar ve yumuşak ışık topları (müziğin doruğunda)
const shIsikZ = [];
let shTop = null;
function shTopSprite() {
  if (shTop) return shTop;
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,206,150,1)'); gr.addColorStop(1, 'rgba(255,214,160,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  return shTop = c;
}
function shIsikCicek(u, tm, a) {
  if (a <= 0.01) return;
  if (!shIsikZ.length) { const r = rng(64); for (let i = 0; i < 40; i++) shIsikZ.push({ x: r(), y: r(), s: 0.5 + r(), v: 0.025 + r() * 0.035, h: r() * 6.28, top: i < 9 }); }
  g.setTransform(1, 0, 0, 1, 0, 0);
  const D2 = Math.min(W, H);
  for (const z of shIsikZ) {
    const yy = ((z.y - u * z.v) % 1 + 1) % 1, xx = z.x + Math.sin(u * 0.5 + z.h) * 0.03;
    const kenar = Math.min(1, yy * 5, (1 - yy) * 5), tw = 0.5 + 0.5 * Math.sin(tm * 2.1 + z.h * 3);
    if (z.top) {   // yumuşak, şeftali renkli ışık topu (önbellekteki sprite)
      const r = D2 * 0.06 * z.s, al = 0.4 * a * kenar;
      if (al > 0.003) { g.globalAlpha = Math.min(1, al); g.drawImage(shTopSprite(), xx * W - r, yy * H - r, r * 2, r * 2); g.globalAlpha = 1; }
    } else {   // dört köşeli altın parıltı
      const r = D2 * 0.022 * z.s * (0.55 + 0.6 * tw);
      g.globalAlpha = a * kenar * (0.45 + 0.45 * tw); g.fillStyle = z.s > 1.1 ? '#ffb84a' : '#ffcf6e';
      shYildiz4(g, xx * W, yy * H, r, 0.22); g.fill();
    }
  }
  g.globalAlpha = 1;
}
function shAltinZerre(tm, a) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  if (!shZer.length) shZerreler(0, 0, true);
  for (let i = 0; i < shZer.length; i++) {
    const z = shZer[i], yy = ((z.y - tm * z.v * 3) % 1 + 1) % 1, xx = z.x + Math.sin(tm * 0.6 + z.h) * 0.03;
    const tw = 0.5 + 0.5 * Math.sin(tm * 2 + z.h * 3);
    dglow(i % 3 ? '#ffe6a0' : '#ffd0f0', xx * W, yy * H, H * 0.012 * z.s * (1 + tw * 0.5), a * (0.3 + 0.4 * tw));
  }
  g.globalCompositeOperation = 'source-over';
}

// ── dokunuş: açılışta 2 sn'den sonra atla ──
// atla düğmesi: sağ üstte yuvarlak "▶▶" (yazı yok; Feza simgeden anlar). Yalnız daha önce izlendiyse görünür
function shGirisAnahtar(b) { return b > 1 ? 'fezaIsikGiris' + b : 'fezaIsikGiris'; }   // Bölüm 1 eski anahtarı korur
function shDahaOnce(b) {   // bu rüya daha önce oynandı mı: girişi izlendi ya da bölüm tamamlandı
  try {
    if (Q.has('atlanir') || localStorage.getItem(shGirisAnahtar(b)) === '1') return true;
    return typeof omTamamOku === 'function' && omTamamOku().indexOf(b) >= 0;
  } catch (e) { return false; }
}
function shAtlaYer() { const r = Math.max(30, Math.min(W, H) * 0.055); return { x: W - r * 1.7, y: r * 1.7, r }; }
function shAtlaCiz(tm) {
  const P = sh.plan; if (!P || !sh.atlanabilir || sh.atla >= 0 || sh.t < 2 || sh.t >= P.b4) return;
  const y = shAtlaYer(), a = shEase(shSeg(sh.t, 2, 3)), nb = 1 + Math.sin(tm * 3) * 0.05;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.translate(y.x, y.y); g.scale(nb, nb);
  g.fillStyle = 'rgba(20,24,60,0.55)'; g.beginPath(); g.arc(0, 0, y.r, 0, 7); g.fill();
  g.lineWidth = y.r * 0.09; g.strokeStyle = 'rgba(255,236,170,0.95)'; g.stroke();
  g.fillStyle = 'rgba(255,236,170,0.98)';
  for (const dx of [-0.34, 0.1]) { g.beginPath(); g.moveTo((dx - 0.1) * y.r, -0.4 * y.r); g.lineTo((dx + 0.4) * y.r, 0); g.lineTo((dx - 0.1) * y.r, 0.4 * y.r); g.closePath(); g.fill(); }
  g.restore();
}
OLAY.on('dokunus', v => {
  if (sh.mod !== 'giris' || sh.atla >= 0) return;
  const P = sh.plan;
  // ilk izleyişte masal kesilmez; daha önce izlendiyse yalnız atla düğmesine (ya da klavyeye) basınca atlanır
  if (!sh.atlanabilir || sh.t < 2 || sh.t >= P.b4) return;
  if (v && v.x != null) { const y = shAtlaYer(), d = DPR || 1; if (Math.hypot(v.x * d - y.x, v.y * d - y.y) > y.r * 1.5) return; }   // v: CSS px, shAtlaYer: tuval px
  sh.atla = sh.t; shSus();
  // planı kısalt: hemen Pırıl uyandırır, ışık yükselir, dünya görünür
  P.b3 = Math.min(P.b3, sh.t); P.b4 = sh.t; P.erime = 0.001;
  if (sh.kisa) { P.son = sh.t + 1.8; }   // kısa giriş: rüya belirir, hemen yumuşakça kararıp bölüm açılır (parlama yok)
  else { P.uyan = sh.t + 0.25; P.kalk = sh.t + 0.3; P.isik = sh.t; P.dunya = sh.t + 0.6; P.son = P.dunya + 1.6; }
  shAn('atlandi');
});
OLAY.on('boyut', () => { sh.bw = -1; shSecGuvenli.kirli = true; if (sh.sec && !sh.sec.secili) sh.sec.pos.length = 0; });
// başlık ekranındayken oda ve orman fonunu önceden hazırla ve bir kez boyat (dokununca takılma olmasın)
setTimeout(function shIsit() {
  if (DURUM !== 'baslik' || sh.mod) return;
  if (!(W > 2 && H > 2)) { setTimeout(shIsit, 400); return; }   // tuval henüz boyutlanmadı: biraz sonra yine dene
  shGeceHazirla();
}, 1200);
function shGeceHazirla() { const k = () => DURUM === 'baslik' || sh.mod === 'giris' || sh.mod === 'secim'; shOnceden('oda', k); if (sh.mod !== 'secim') { shOnceden(sh.fon || 'orman', k); shOnceden(sh.tema === 'volkan' ? 'onPlanV' : sh.tema === 'deniz' ? 'onPlanI' : sh.tema === 'bulut' ? 'onPlanB' : 'onPlan', k); } }

// ══════════════════ YILDIZ GÖLÜ FONU (kısa uyku girişinde oda buraya erir) ══════════════════
function shGolAdim() {
  const c = shTuval(), x = c.getContext('2d');
  const k = sh.k0, L = -sh.wu / 2 - 16, R = sh.wu / 2 + 16, SU = 66;
  const A = { c, W, H, adim: [] };
  A.adim.push(() => {
    x.setTransform(k, 0, 0, k, shCX(), 0);
    let gr = x.createLinearGradient(0, 0, 0, SU);
    gr.addColorStop(0, '#050a28'); gr.addColorStop(0.6, '#1b2a70'); gr.addColorStop(1, '#4a58b8');
    x.fillStyle = gr; x.fillRect(L, -1, R - L, SU + 1);
    const r = rng(23); x.fillStyle = '#fff6d0';
    for (let i = 0; i < 90; i++) { x.globalAlpha = 0.25 + r() * 0.7; shYildiz5(x, L + r() * (R - L), r() * (SU - 6), 0.2 + r() * 0.5); x.fill(); }
    x.globalAlpha = 1;
    gr = x.createRadialGradient(SH_AY.x, SH_AY.y, 0, SH_AY.x, SH_AY.y, 40); gr.addColorStop(0, 'rgba(230,236,255,0.45)'); gr.addColorStop(1, 'rgba(160,180,255,0)');
    x.fillStyle = gr; x.fillRect(L, -1, R - L, SU + 1);
    x.fillStyle = '#fff6d6'; x.beginPath(); x.arc(SH_AY.x, SH_AY.y, 4.2, 0, 6.283); x.fill();
    x.fillStyle = '#e4e9ff'; x.beginPath(); x.arc(SH_AY.x + 0.6, SH_AY.y - 0.3, 3.9, 0, 6.283); x.fill();
    // uzak tepeler
    x.fillStyle = 'rgba(16,24,78,0.9)'; x.beginPath(); x.moveTo(L, SU);
    for (let xx = L; xx <= R; xx += 2) x.lineTo(xx, SU - 7 - 6 * Math.sin(xx * 0.07) - 4 * Math.sin(xx * 0.19 + 1));
    x.lineTo(R, SU); x.closePath(); x.fill();
  });
  A.adim.push(() => {
    x.setTransform(k, 0, 0, k, shCX(), 0);
    let gr = x.createLinearGradient(0, SU, 0, 100); gr.addColorStop(0, '#3a4aa8'); gr.addColorStop(0.3, '#1a2670'); gr.addColorStop(1, '#070d34');
    x.fillStyle = gr; x.fillRect(L, SU, R - L, 40);
    // yansımalar: yıldız sütunları ve ay
    const r = rng(29);
    for (let i = 0; i < 60; i++) {
      const px = L + r() * (R - L), py = SU + 1.5 + r() * 28, w = 0.3 + r() * 1.4;
      x.fillStyle = `rgba(255,240,190,${0.1 + r() * 0.4})`; x.beginPath(); x.ellipse(px, py, w, 0.16, 0, 0, 6.283); x.fill();
    }
    gr = x.createLinearGradient(0, SU, 0, SU + 30); gr.addColorStop(0, 'rgba(235,238,255,0.5)'); gr.addColorStop(1, 'rgba(235,238,255,0)');
    x.fillStyle = gr; x.beginPath(); x.moveTo(SH_AY.x - 3, SU); x.lineTo(SH_AY.x + 3, SU); x.lineTo(SH_AY.x + 6, SU + 30); x.lineTo(SH_AY.x - 6, SU + 30); x.fill();
    x.strokeStyle = 'rgba(190,205,255,0.22)'; x.lineWidth = 0.2;
    for (let i = 0; i < 40; i++) { const py = SU + 2 + r() * 30, px = L + r() * (R - L); x.beginPath(); x.moveTo(px, py); x.lineTo(px + 2 + r() * 6, py); x.stroke(); }
    x.setTransform(1, 0, 0, 1, 0, 0);
    gr = x.createRadialGradient(W / 2, H * 0.5, H * 0.4, W / 2, H * 0.5, Math.hypot(W, H) * 0.62);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(1,3,12,0.5)'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
  });
  return A;
}

// ══════════════════ BULUT ÜLKESİ FONU (Bölüm 3 kısa uyku girişinde oda gün doğumu bulutlarına erir) ══════════════════
const SH_GK = ['#ff6b6b', '#ffa64d', '#ffe066', '#7ed67e', '#6ab8ff', '#7b7bf0', '#c08af0'];   // gökkuşağı (kırmızı → mor)
// yan yana kabarık bulut sırası (oda biriminde): önce gölge rengi, sonra biraz yukarı kaymış açık gövde (altta yumuşak gölge bandı kalır)
function shBulutKume(x, L, R, y0, n, rMin, rMax, col, sd, alt, colAcik) {
  const q = rng(sd), P = [];
  for (let i = 0; i <= n * 2; i++) { const px = L + (i + q() * 0.8) / (n * 2) * (R - L), pr = (rMin + q() * (rMax - rMin)) * (i % 2 ? 0.7 : 1); P.push([px, y0 - pr * (0.2 + q() * 0.35), pr]); }
  const ciz = (cc, dy, k) => { x.fillStyle = cc; x.beginPath(); for (const [px, py, pr] of P) { x.moveTo(px + pr * k, py + dy * pr); x.arc(px, py + dy * pr, pr * k, 0, 6.283); } x.rect(L - 2, y0 + (dy > 0 ? 0 : 0), R - L + 4, (alt || 102) - y0); x.fill(); };
  ciz(col, 0, 1);
  if (colAcik) ciz(colAcik, -0.2, 0.9);
}
function shBulutFonAdim() {
  const c = shTuval(), x = c.getContext('2d');
  const k = sh.k0, L = -sh.wu / 2 - 20, R = sh.wu / 2 + 20;
  const A = { c, W, H, adim: [] };
  A.adim.push(() => {
    x.setTransform(k, 0, 0, k, shCX(), 0);
    let gr = x.createLinearGradient(0, 0, 0, 86);
    gr.addColorStop(0, '#5d58b8'); gr.addColorStop(0.3, '#a679c4'); gr.addColorStop(0.55, '#ee94b6'); gr.addColorStop(0.78, '#ffb89a'); gr.addColorStop(1, '#ffdca4');
    x.fillStyle = gr; x.fillRect(L, -1, R - L, 103);
    const r = rng(19); x.fillStyle = '#ffffff';   // sönmekte olan son yıldızlar
    for (let i = 0; i < 40; i++) { const yy = r() * 34; x.globalAlpha = (0.15 + r() * 0.55) * (1 - yy / 40); x.beginPath(); x.arc(L + r() * (R - L), yy, 0.12 + r() * 0.2, 0, 6.283); x.fill(); }
    x.globalAlpha = 1;
    // güneşin (lamba buraya süzülür) sıcak ışığı göğe yayılır
    gr = x.createRadialGradient(SH_AY.x, SH_AY.y, 0, SH_AY.x, SH_AY.y, 90);
    gr.addColorStop(0, 'rgba(255,244,214,0.75)'); gr.addColorStop(0.18, 'rgba(255,214,180,0.4)'); gr.addColorStop(0.5, 'rgba(255,180,190,0.14)'); gr.addColorStop(1, 'rgba(255,180,190,0)');
    x.fillStyle = gr; x.fillRect(L, -1, R - L, 103);
    // uzak bulut dağları (lila → pembe), üst kenarlarında güneşten altın ışık
    x.globalAlpha = 0.8; shBulutKume(x, L, R, 60, 10, 4, 9, '#b98ac8', 31, 102, '#d9a6d6'); x.globalAlpha = 1;
    shBulutKume(x, L, R, 68, 9, 5, 10, '#de96bd', 37, 102, '#f5bcd4');
    // uzakta yüzen küçük bulut adaları
    for (const [ax, ay, as] of [[-40, 44, 1], [52, 50, 0.8], [8, 38, 0.6]]) {
      x.fillStyle = '#f3b6d2'; x.beginPath(); x.ellipse(ax, ay, 7 * as, 2.2 * as, 0, 0, 6.283); x.arc(ax - 2.5 * as, ay - 1.4 * as, 2.6 * as, 0, 6.283); x.arc(ax + 2 * as, ay - 1.8 * as, 3.2 * as, 0, 6.283); x.fill();
      x.fillStyle = 'rgba(255,240,220,0.7)'; x.beginPath(); x.arc(ax + 2 * as, ay - 2.4 * as, 2.4 * as, Math.PI * 1.1, Math.PI * 1.9); x.arc(ax - 2.5 * as, ay - 1.9 * as, 1.9 * as, Math.PI * 1.1, Math.PI * 1.9); x.fill();
    }
  });
  A.adim.push(() => {
    x.setTransform(k, 0, 0, k, shCX(), 0);
    // yakın bulut denizi (Feza'nın bulut tepeciği bunun içinde yükselir)
    shBulutKume(x, L, R, 77, 8, 6, 11, '#eaa8c8', 43, 102, '#fbd0e0');
    shBulutKume(x, L, R, SH_YER, 7, 7, 12, '#f3bcd4', 47, 102, '#ffe4ee');
    let gr = x.createLinearGradient(0, SH_YER - 12, 0, 100); gr.addColorStop(0, 'rgba(255,255,255,0.35)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(214,130,180,0.3)');
    x.fillStyle = gr; x.fillRect(L, SH_YER - 12, R - L, 112 - SH_YER);
    x.setTransform(1, 0, 0, 1, 0, 0);
    gr = x.createRadialGradient(W / 2, H * 0.5, H * 0.4, W / 2, H * 0.5, Math.hypot(W, H) * 0.62);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(90,40,100,0.35)'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
  });
  return A;
}
// ön plan (bulut): köşelerde kameradan hızlı kayan, yumuşak gölgeli büyük bulutlar
function shOnPlanBulutCiz() {
  const c = shTuval(), x = c.getContext('2d'), k = H / 100;
  x.setTransform(k, 0, 0, k, W / 2, 0);
  const Rr = sh.wu / 2;
  for (const [cx, yon, sd] of [[-Rr, 1, 3], [Rr, -1, 5]]) {
    const q = rng(sd);
    const yol = () => { x.beginPath(); for (let i = 0; i < 7; i++) { const px = cx + yon * (q() * 26 - 4), py = 100 + q() * 6 - i * 0.6, pr = 7 + q() * 8; x.moveTo(px + pr, py); x.arc(px, py, pr, 0, 6.283); } };
    yol(); x.fillStyle = '#e8a6c8'; x.fill();
    const q2 = rng(sd); const yol2 = () => { x.beginPath(); for (let i = 0; i < 7; i++) { const px = cx + yon * (q2() * 26 - 4), py = 100 + q2() * 6 - i * 0.6 - 1.2, pr = (7 + q2() * 8) * 0.9; x.moveTo(px + pr, py); x.arc(px, py, pr, 0, 6.283); } };
    yol2(); const gr = x.createLinearGradient(0, 84, 0, 104); gr.addColorStop(0, '#fff3f8'); gr.addColorStop(1, '#f6c4da'); x.fillStyle = gr; x.fill();
  }
  return c;
}
// fonun önünde yavaşça kayan bulutlar (ekran pikseli; oda biriminden)
function shBulutKayan(tm, a) {
  if (a <= 0.01) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const k = sh.k0 * sh.zoom, L = -sh.wu / 2 - 30, Rr = sh.wu / 2 + 30;
  for (let i = 0; i < 6; i++) {
    const w = [26, 18, 32, 14, 22, 16][i], y = [22, 33, 46, 15, 55, 40][i], v = [0.9, 1.4, 0.6, 1.8, 0.8, 1.2][i];
    const x = L + (((tm * v + i * 37) % (Rr - L)) + (Rr - L)) % (Rr - L);
    g.globalAlpha = a * [0.75, 0.6, 0.55, 0.7, 0.5, 0.65][i];
    g.drawImage(shBulutSprite(i % 3 === 1 ? 'altin' : i % 2 ? 'beyaz' : 'koyu'), shEkranX(x - w / 2), shEkranY(y - w / 4), w * k, w * k / 2);
  }
  g.globalAlpha = 1;
}
function shPencereYol(x, pad) { const P0 = SH_PEN, cxw = (P0.x0 + P0.x1) / 2, rw = (P0.x1 - P0.x0) / 2, ya = P0.ust + rw; x.beginPath(); x.moveTo(P0.x0 - pad, P0.alt + pad); x.lineTo(P0.x0 - pad, ya); x.arc(cxw, ya, rw + pad, Math.PI, 0); x.lineTo(P0.x1 + pad, P0.alt + pad); x.closePath(); }
// Bölüm 3 kısa girişi: pencerede şafak söker (pembe-altın), odaya pembe ışık düşer
function shPencerePembe(a, tm) {
  if (a <= 0.01) return;
  shOdaT(); g.save(); shPencereYol(g, 0); g.clip();
  const gr = g.createLinearGradient(0, SH_PEN.ust, 0, SH_PEN.alt);
  gr.addColorStop(0, 'rgba(160,120,220,0.5)'); gr.addColorStop(0.55, 'rgba(255,150,190,0.85)'); gr.addColorStop(1, 'rgba(255,214,160,1)');
  g.globalAlpha = a * 0.85; g.fillStyle = gr; g.fillRect(SH_PEN.x0 - 1, SH_PEN.ust - 1, SH_PEN.x1 - SH_PEN.x0 + 2, SH_PEN.alt - SH_PEN.ust + 2);
  g.globalAlpha = a; g.fillStyle = '#fbc0d6'; g.beginPath(); for (let i = 0; i <= 6; i++) { const px = SH_PEN.x0 + i * 4.4, pr = 2.4 + (i % 3) * 0.9; g.moveTo(px + pr, SH_PEN.alt - 4); g.arc(px, SH_PEN.alt - 4 - pr * 0.3, pr, 0, 6.283); } g.rect(SH_PEN.x0 - 1, SH_PEN.alt - 4, 30, 6); g.fill();
  g.restore(); g.globalAlpha = 1;
  // pencere çerçevesi yeniden (önbellekteki kayıtların üstüne şafak çizildi)
  g.fillStyle = SH_GECE.frame; g.globalAlpha = a; const cxw = (SH_PEN.x0 + SH_PEN.x1) / 2;
  g.fillRect(cxw - 0.6, SH_PEN.ust, 1.2, SH_PEN.alt - SH_PEN.ust); g.fillRect(SH_PEN.x0, 31, SH_PEN.x1 - SH_PEN.x0, 1.2); g.globalAlpha = 1;
  shHuzme(true, a, tm, 'pembe');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const k = sh.k0 * sh.zoom; dglow('#ff9fc4', shEkranX(27), shEkranY(33), k * 38, a * 0.32); dglow('#ffd9a8', shEkranX(27), shEkranY(42), k * 14, a * 0.3);
  g.globalCompositeOperation = 'source-over';
}

// ══════════════════ SEÇİM EKRANI (başlık ekranı = yatak başı; rüya baloncukları) ══════════════════
// Her baloncuk: önbellekte DURAĞAN iç resim (shBalonIc) + her karede çizilen CANLI katman (shIkonCanli: ışık küreleri,
// yıldız ışıltısı, kayan bulutlar, kuzucuk) + önbellekte cam kabuk (shBalonCam). Baloncuklar Pırıl'dan doğar, nefes alır,
// süzülür; dokununca jöle gibi esner, sonra büyüyüp ekranı doldurarak rüyaya akar.
const SH_BALON_RENK = { orman: '#ffe6a8', gol: '#a8b8ff', bulut: '#ffc8e0', deniz: '#9fe6ff', dag: '#ffd9a0', volkan: '#ffba87' };
const SH_SEC_SURE = 1.6;   // dokunuştan onSec'e (sn)
const shEaseOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const shEaseBack = t => { t = clamp(t, 0, 1); const c = 1.5; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
// yumuşak bulut sprite'ı (bir kez): kabarık üst, düz alt, üstten ışık alan pembe-beyaz
const shBulutSpr = {};
function shBulutSprite(tur) {
  if (shBulutSpr[tur]) return shBulutSpr[tur];
  const w = 256, h = 128, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  const renk = tur === 'koyu' ? ['#f6c3d6', '#e49ab8', '#fbe1ea'] : tur === 'altin' ? ['#fff1d6', '#ffc89a', '#ffffff'] : ['#ffffff', '#f6c6da', '#ffffff'];
  const yol = () => { x.beginPath(); for (const [px, py, r] of [[0.2, 0.68, 0.17], [0.36, 0.5, 0.25], [0.56, 0.42, 0.3], [0.76, 0.56, 0.22], [0.88, 0.7, 0.13]]) { x.moveTo(px * w + r * h * 1.6, py * h); x.arc(px * w, py * h, r * h * 1.6 * 0.5 * 1.25, 0, 6.283); } x.rect(0.12 * w, 0.62 * h, 0.8 * w, 0.24 * h); };
  yol(); const gr = x.createLinearGradient(0, h * 0.1, 0, h * 0.9); gr.addColorStop(0, renk[0]); gr.addColorStop(0.55, renk[0]); gr.addColorStop(1, renk[1]); x.fillStyle = gr; x.fill();
  x.save(); yol(); x.clip(); const hg = x.createRadialGradient(w * 0.45, h * 0.18, 0, w * 0.45, h * 0.18, h * 0.6); hg.addColorStop(0, 'rgba(255,255,255,0.9)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = hg; x.fillRect(0, 0, w, h); x.restore();
  return shBulutSpr[tur] = c;
}
// kuzucuk (yerel birim: r = boy): yünlü beyaz gövde, gülen yüz; yalnız gövdenin üstü (ayaklar bulutta)
function shKuzu(x, cx, cy, r, yon, goz) {
  x.save(); x.translate(cx, cy); x.scale(yon, 1);
  const govde = (k, cc) => { x.fillStyle = cc; x.beginPath(); for (const [px, py, pr] of [[-0.55, -0.05, 0.4], [-0.15, -0.25, 0.45], [0.3, -0.15, 0.42], [0.0, 0.05, 0.45], [-0.45, 0.2, 0.32], [0.05, 0.25, 0.45], [0.5, 0.12, 0.38]]) { x.moveTo(px * r + (pr + k) * r, py * r); x.arc(px * r, py * r, (pr + k) * r, 0, 6.283); } x.fill(); };
  govde(0.07, 'rgba(150,100,160,0.45)');   // yumuşak dış hat (açık zeminde seçilsin)
  x.fillStyle = 'rgba(150,100,160,0.45)'; x.beginPath(); x.ellipse(0.72 * r, -0.12 * r, 0.39 * r, 0.34 * r, 0.2, 0, 6.283); x.fill();
  govde(0, '#eedbe8');
  x.fillStyle = '#ffffff'; x.beginPath(); for (const [px, py, pr] of [[-0.55, -0.1, 0.33], [-0.15, -0.3, 0.38], [0.3, -0.2, 0.35], [0.0, -0.02, 0.36]]) { x.moveTo(px * r + pr * r, py * r); x.arc(px * r, py * r, pr * r, 0, 6.283); } x.fill();
  x.fillStyle = '#f9dbe7'; x.beginPath(); x.ellipse(0.72 * r, -0.12 * r, 0.32 * r, 0.27 * r, 0.2, 0, 6.283); x.fill();   // yüz
  x.fillStyle = '#e9b9cc'; x.beginPath(); x.ellipse(0.55 * r, -0.36 * r, 0.16 * r, 0.08 * r, -0.6, 0, 6.283); x.fill();   // kulak
  x.fillStyle = '#ffffff'; x.beginPath(); x.arc(0.62 * r, -0.38 * r, 0.16 * r, 0, 6.283); x.fill();   // perçem
  x.strokeStyle = '#6a4a6a'; x.lineWidth = Math.max(0.8, r * 0.055); x.lineCap = 'round';
  x.beginPath(); if (goz) x.arc(0.8 * r, -0.16 * r, 0.06 * r, Math.PI * 1.1, Math.PI * 1.9); else x.arc(0.8 * r, -0.2 * r, 0.06 * r, 0.1, Math.PI - 0.1); x.stroke();
  x.fillStyle = 'rgba(255,140,170,0.55)'; x.beginPath(); x.arc(0.86 * r, -0.03 * r, 0.07 * r, 0, 6.283); x.fill();
  x.restore();
}
function shIkonCiz(x, ad, d) {   // DURAĞAN iç resim, d×d kare; çağıran daireyle keser (canlı parçalar shIkonCanli'de)
  let gr;
  if (ad === 'volkan') { sh5Fon(x, d, d); return; }
  if (ad === 'deniz') { shDenizResim(x, d); return; }
  if (ad === 'orman') {   // gece ormanı: katmanlı siluetler, ay ışığı hüzmesi, ışıklı ağaç, parlayan çiçek
    gr = x.createLinearGradient(0, 0, 0, d); gr.addColorStop(0, '#0e2a66'); gr.addColorStop(0.4, '#2a74a8'); gr.addColorStop(0.75, '#5cc4b8'); gr.addColorStop(1, '#a8f0c8');
    x.fillStyle = gr; x.fillRect(0, 0, d, d);
    let r = rng(5); x.fillStyle = '#fff';
    for (let i = 0; i < 14; i++) { x.globalAlpha = 0.3 + r() * 0.6; x.beginPath(); x.arc(r() * d, r() * d * 0.35, d * (0.004 + r() * 0.005), 0, 6.283); x.fill(); }
    x.globalAlpha = 1;
    const katman = (col, taban, n, h0, h1, sd) => {
      const q = rng(sd); x.fillStyle = col;
      for (let i = 0; i < n; i++) { const px = (i + 0.2 + q() * 0.6) / n * d * 1.1 - d * 0.05, h = h0 + q() * (h1 - h0), w = d * (0.05 + q() * 0.03);
        x.beginPath(); x.moveTo(px - w, taban * d); x.lineTo(px, (taban - h) * d); x.lineTo(px + w, taban * d); x.fill();
        x.beginPath(); x.moveTo(px - w * 1.3, (taban - h * 0.35) * d); x.lineTo(px, (taban - h * 0.95) * d); x.lineTo(px + w * 1.3, (taban - h * 0.35) * d); x.fill(); }
    };
    katman('rgba(30,110,140,0.6)', 0.8, 9, 0.35, 0.55, 3);
    x.globalCompositeOperation = 'lighter';
    for (const [a0, w] of [[0.52, 0.14], [0.6, 0.1], [0.68, 0.16]]) { const g2 = x.createLinearGradient(d * 0.62, 0, d * a0, d * 0.85); g2.addColorStop(0, 'rgba(200,235,255,0.5)'); g2.addColorStop(1, 'rgba(200,235,255,0)');
      x.fillStyle = g2; x.beginPath(); x.moveTo(d * 0.58, 0); x.lineTo(d * 0.68, 0); x.lineTo(d * (a0 + w + 0.08), d * 0.85); x.lineTo(d * (a0 - w), d * 0.85); x.fill(); }
    x.globalCompositeOperation = 'source-over';
    katman('rgba(10,62,92,0.85)', 0.84, 7, 0.4, 0.7, 8);
    x.fillStyle = '#07303f';   // büyük ışık ağacı
    x.beginPath(); x.moveTo(d * 0.5, d * 0.86); x.quadraticCurveTo(d * 0.54, d * 0.62, d * 0.5, d * 0.44); x.lineTo(d * 0.62, d * 0.44); x.quadraticCurveTo(d * 0.62, d * 0.62, d * 0.68, d * 0.86); x.fill();
    for (const [px, py, pr] of [[0.56, 0.3, 0.2], [0.42, 0.37, 0.14], [0.71, 0.36, 0.15], [0.56, 0.18, 0.13], [0.47, 0.25, 0.12], [0.66, 0.24, 0.11]]) { x.beginPath(); x.arc(px * d, py * d, pr * d, 0, 6.283); x.fill(); }
    x.globalCompositeOperation = 'lighter';
    let rg = x.createRadialGradient(d * 0.56, d * 0.3, 0, d * 0.56, d * 0.3, d * 0.34); rg.addColorStop(0, 'rgba(255,235,160,0.45)'); rg.addColorStop(1, 'rgba(255,235,160,0)');
    x.fillStyle = rg; x.fillRect(0, 0, d, d);
    r = rng(9);
    for (let i = 0; i < 16; i++) { const a2 = r() * 6.283, rr = r() * d * 0.17; x.fillStyle = 'rgba(255,238,170,0.8)'; x.beginPath(); x.arc(d * 0.56 + Math.cos(a2) * rr * 1.2, d * 0.3 + Math.sin(a2) * rr, d * (0.005 + r() * 0.005), 0, 6.283); x.fill(); }
    x.globalCompositeOperation = 'source-over';
    x.fillStyle = '#04241f'; x.beginPath(); x.moveTo(0, d * 0.87); for (let i = 0; i <= 12; i++) x.lineTo(i / 12 * d, d * (0.855 + 0.012 * Math.sin(i * 1.7))); x.lineTo(d, d); x.lineTo(0, d); x.fill();
    x.strokeStyle = 'rgba(127,255,230,0.6)'; x.lineWidth = d * 0.006; x.beginPath(); for (let i = 0; i <= 24; i++) x.lineTo(i / 24 * d, d * (0.858 + 0.012 * Math.sin(i * 0.85))); x.stroke();
    const fx = d * 0.24, fy = d * 0.76;   // parlayan çiçek
    x.strokeStyle = '#2fb08a'; x.lineWidth = d * 0.022; x.lineCap = 'round'; x.beginPath(); x.moveTo(fx, d * 0.9); x.quadraticCurveTo(fx - d * 0.04, fy + d * 0.08, fx, fy); x.stroke();
    x.fillStyle = '#ffa6d6'; for (let i = 0; i < 6; i++) { x.save(); x.translate(fx, fy); x.rotate(i * 1.047); x.beginPath(); x.ellipse(0, -d * 0.055, d * 0.032, d * 0.06, 0, 0, 6.283); x.fill(); x.restore(); }
    x.fillStyle = '#fff0a0'; x.beginPath(); x.arc(fx, fy, d * 0.03, 0, 6.283); x.fill();
    // ışıklı mantarlar (sağ önde)
    for (const [mx, my, ms] of [[0.8, 0.86, 1], [0.87, 0.875, 0.7]]) {
      x.fillStyle = '#cfe9ef'; x.fillRect(d * (mx - 0.006 * ms), d * (my - 0.05 * ms), d * 0.012 * ms, d * 0.05 * ms);
      x.fillStyle = '#5fd0e8'; x.beginPath(); x.ellipse(d * mx, d * (my - 0.05 * ms), d * 0.03 * ms, d * 0.022 * ms, 0, Math.PI, 0); x.fill();
    }
  } else if (ad === 'gol') {   // yıldız gölü: gece göğü, katmanlı dağlar, ay, yıldızlar, yansıma (yıldızların ışıltısı ve uyuyan yıldız canlı)
    gr = x.createLinearGradient(0, 0, 0, d * 0.64); gr.addColorStop(0, '#070c3a'); gr.addColorStop(0.6, '#2c3490'); gr.addColorStop(1, '#6a6ad0');
    x.fillStyle = gr; x.fillRect(0, 0, d, d * 0.64);
    gr = x.createLinearGradient(0, d * 0.64, 0, d); gr.addColorStop(0, '#4a52b8'); gr.addColorStop(0.25, '#1e2a78'); gr.addColorStop(1, '#080f3c'); x.fillStyle = gr; x.fillRect(0, d * 0.64, d, d * 0.36);
    x.globalCompositeOperation = 'lighter'; let rg = x.createRadialGradient(d * 0.74, d * 0.2, 0, d * 0.74, d * 0.2, d * 0.4); rg.addColorStop(0, 'rgba(230,236,255,0.5)'); rg.addColorStop(1, 'rgba(230,236,255,0)'); x.fillStyle = rg; x.fillRect(0, 0, d, d); x.globalCompositeOperation = 'source-over';
    const rr = rng(77); x.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) { x.globalAlpha = 0.25 + rr() * 0.5; x.beginPath(); x.arc(rr() * d, rr() * d * 0.5, d * (0.002 + rr() * 0.004), 0, 6.283); x.fill(); } x.globalAlpha = 1;
    const dag = (col, taban, amp, f1, f2, ph) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, d * 0.64); for (let i = 0; i <= 40; i++) { const u = i / 40; x.lineTo(u * d, d * (taban - amp * (0.5 + 0.5 * Math.sin(u * f1 + ph)) - amp * 0.4 * Math.sin(u * f2 + ph * 2))); } x.lineTo(d, d * 0.64); x.fill(); };
    dag('rgba(60,66,160,0.8)', 0.55, 0.12, 7, 17, 1); dag('rgba(26,32,100,0.95)', 0.6, 0.1, 5, 13, 3.5);
    x.fillStyle = '#fff6d6'; x.beginPath(); x.arc(d * 0.74, d * 0.2, d * 0.075, 0, 6.283); x.fill();
    x.fillStyle = '#2f3aa0'; x.beginPath(); x.arc(d * 0.77, d * 0.185, d * 0.07, 0, 6.283); x.fill();
    for (const [px, py, pr] of SH_GOL_YILDIZ) {
      x.globalCompositeOperation = 'lighter'; rg = x.createRadialGradient(px * d, py * d, 0, px * d, py * d, pr * d * 3); rg.addColorStop(0, 'rgba(255,240,170,0.45)'); rg.addColorStop(1, 'rgba(255,240,170,0)'); x.fillStyle = rg; x.fillRect(px * d - pr * d * 3, py * d - pr * d * 3, pr * d * 6, pr * d * 6); x.globalCompositeOperation = 'source-over';
      x.fillStyle = '#fff4c0'; shYildiz4(x, px * d, py * d, pr * d * 1.3, 0.3); x.fill();
      x.fillStyle = 'rgba(255,242,184,0.4)'; x.beginPath(); x.ellipse(px * d, d * 0.64 + (d * 0.64 - py * d) * 0.5, pr * d * 0.7, pr * d * 0.26, 0, 0, 6.283); x.fill();
    }
    x.fillStyle = 'rgba(235,238,255,0.3)'; x.beginPath(); x.moveTo(d * 0.7, d * 0.64); x.lineTo(d * 0.8, d * 0.64); x.lineTo(d * 0.86, d * 0.95); x.lineTo(d * 0.64, d * 0.95); x.fill();
    // kıyıda sazlar
    x.strokeStyle = '#0a1240'; x.lineWidth = d * 0.008; x.lineCap = 'round';
    for (let i = 0; i < 9; i++) { const bx = d * (0.02 + i * 0.022), h = d * (0.08 + (i % 3) * 0.03); x.beginPath(); x.moveTo(bx, d); x.quadraticCurveTo(bx + d * 0.01, d - h * 0.6, bx + d * 0.02 * Math.sin(i), d - h); x.stroke(); }
  } else if (ad === 'bulut') {   // bulut ülkesi: gün doğumu; pembe bulut denizi, ufukta güneş, yumuşak gökkuşağı (kayan bulutlar, kuzucuk canlı)
    gr = x.createLinearGradient(0, 0, 0, d); gr.addColorStop(0, '#7f74d6'); gr.addColorStop(0.3, '#d98fc6'); gr.addColorStop(0.55, '#ffb6a6'); gr.addColorStop(0.72, '#ffd9a6'); gr.addColorStop(1, '#ffe9c4');
    x.fillStyle = gr; x.fillRect(0, 0, d, d);
    const rr = rng(41); x.fillStyle = '#ffffff';
    for (let i = 0; i < 12; i++) { x.globalAlpha = 0.25 + rr() * 0.45 * (1 - i / 14); x.beginPath(); x.arc(rr() * d, rr() * d * 0.28, d * (0.003 + rr() * 0.004), 0, 6.283); x.fill(); } x.globalAlpha = 1;
    // güneş ışığı (ufukta)
    x.globalCompositeOperation = 'lighter';
    let rg = x.createRadialGradient(d * 0.5, d * 0.72, 0, d * 0.5, d * 0.72, d * 0.5); rg.addColorStop(0, 'rgba(255,240,200,0.6)'); rg.addColorStop(0.25, 'rgba(255,214,170,0.3)'); rg.addColorStop(1, 'rgba(255,200,170,0)');
    x.fillStyle = rg; x.fillRect(0, 0, d, d); x.globalCompositeOperation = 'source-over';
    // yumuşak gökkuşağı (yedi renk, dış kenarı silik)
    const GK = ['#ff6b6b', '#ffa64d', '#ffe066', '#7ed67e', '#6ab8ff', '#7b7bf0', '#c08af0'];
    x.lineCap = 'butt';
    for (let i = 0; i < 7; i++) { x.strokeStyle = GK[i]; x.globalAlpha = 0.5; x.lineWidth = d * 0.026; x.beginPath(); x.arc(d * 0.5, d * 0.78, d * (0.47 - i * 0.025), Math.PI * 1.04, Math.PI * 1.96); x.stroke(); }
    x.globalAlpha = 0.22; x.strokeStyle = '#ffffff'; x.lineWidth = d * 0.05; x.beginPath(); x.arc(d * 0.5, d * 0.78, d * 0.3, Math.PI * 1.04, Math.PI * 1.96); x.stroke(); x.globalAlpha = 1;
    // güneş diski
    x.fillStyle = '#fff1cf'; x.beginPath(); x.arc(d * 0.5, d * 0.71, d * 0.075, 0, 6.283); x.fill();
    // uzak bulut kıyısı
    const kume = (y0, n, rMin, rMax, col, sd) => { const q = rng(sd); x.fillStyle = col; x.beginPath(); for (let i = 0; i <= n; i++) { const px = i / n * d * 1.1 - d * 0.05, pr = d * (rMin + q() * (rMax - rMin)); x.moveTo(px + pr, y0 * d); x.arc(px, y0 * d, pr, 0, 6.283); } x.rect(-2, y0 * d, d + 4, d); x.fill(); };
    kume(0.72, 9, 0.05, 0.09, '#f7b9cf', 3);
    x.globalAlpha = 0.6; kume(0.715, 9, 0.03, 0.05, '#ffe0ea', 3); x.globalAlpha = 1;
    kume(0.8, 7, 0.07, 0.11, '#fbd0de', 7);
    // yakın bulut denizi: kabarık, üstten ışık
    kume(0.88, 6, 0.09, 0.14, '#f8cfe0', 11);
    rg = x.createLinearGradient(0, d * 0.76, 0, d); rg.addColorStop(0, 'rgba(255,255,255,0.3)'); rg.addColorStop(1, 'rgba(220,140,190,0.25)');
    x.fillStyle = rg; x.fillRect(0, d * 0.76, d, d * 0.24);
  } else {   // genel rüya: yumuşak gökyüzü, bulutlar, ay, yıldızlar (deniz / dag ve bilinmeyenler)
    const ton = { deniz: ['#0a2a5a', '#2a8ac0', '#bff0ff'], dag: ['#2a1f58', '#c46a8a', '#ffd9a0'] }[ad] || ['#1a2a68', '#6a5ac8', '#ffd0f0'];
    gr = x.createLinearGradient(0, 0, 0, d); gr.addColorStop(0, ton[0]); gr.addColorStop(0.65, ton[1]); gr.addColorStop(1, ton[2]);
    x.fillStyle = gr; x.fillRect(0, 0, d, d);
    x.fillStyle = 'rgba(255,255,255,0.8)';
    for (const [px, py, pr] of [[0.3, 0.55, 0.12], [0.42, 0.52, 0.16], [0.56, 0.56, 0.12], [0.7, 0.7, 0.1], [0.2, 0.75, 0.09]]) { x.beginPath(); x.arc(px * d, py * d, pr * d, 0, 6.283); x.fill(); }
    x.fillStyle = '#fff6d0'; x.beginPath(); x.arc(d * 0.72, d * 0.25, d * 0.08, 0, 6.283); x.fill();
    for (const [px, py] of [[0.2, 0.2], [0.4, 0.12], [0.5, 0.3], [0.85, 0.5]]) { x.fillStyle = '#fff2b8'; shYildiz5(x, px * d, py * d, d * 0.035); x.fill(); }
  }
}
const SH_GOL_YILDIZ = [[0.2, 0.17, 0.05], [0.42, 0.09, 0.034], [0.34, 0.33, 0.04], [0.56, 0.26, 0.055], [0.1, 0.4, 0.03], [0.9, 0.42, 0.034], [0.5, 0.44, 0.028], [0.64, 0.07, 0.025], [0.26, 0.5, 0.025]];
// canlı katman: (ox, oy) iç resmin sol üstü, q kenar (ekran pikseli); g üzerinde, çağıran daireyle keser. a: saydamlık. hov: üzerine gelindiğinde minyatür nefes alma
function shIkonCanli(ad, ox, oy, q, tm, a, i0, hov) {
  hov = hov || 0;
  if (ad === 'volkan') { sh5Canli(ox,oy,q,tm,a,hov); return; }
  const hovAmp = 1 + 0.35 * hov;
  const U = (u, v) => [ox + u * q, oy + v * q];
  if (ad === 'deniz') {
    // denizin dalgalanması: su altı ışık dalgaları, sedef kabarcıklar, salınan yosunlar ve ışıldayan planktonlar
    g.save();
    // 1) Sualtı ışık dalgaları (caustics)
    g.globalCompositeOperation = 'lighter';
    for (let j = 0; j < 5; j++) {
      const cy = oy + q * (0.32 + j * 0.13 + Math.sin(tm * 1.1 + j * 1.5) * 0.02 * hovAmp);
      g.strokeStyle = j % 2 ? 'rgba(94, 246, 228, 0.28)' : 'rgba(167, 243, 208, 0.22)';
      g.lineWidth = Math.max(1.5, q * (0.012 + (j % 3) * 0.005));
      g.beginPath();
      for (let s = 0; s <= 20; s++) {
        const u = s / 20, cx = ox + u * q;
        const wave = Math.sin(tm * (1.6 + j * 0.3) + u * 7 + j) * q * 0.022 * hovAmp;
        if (s === 0) g.moveTo(cx, cy + wave); else g.lineTo(cx, cy + wave);
      }
      g.stroke();
    }
    // 2) Yükselen sedef kabarcıklar
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = a * 0.75;
    for (let i = 0; i < 9; i++) {
      const spd = 0.038 + (i % 3) * 0.018;
      const prog = (tm * spd + i * 0.111) % 1;
      const bx = ox + q * (0.12 + ((i * 0.147) % 0.76) + Math.sin(tm * 1.4 + i * 2) * 0.035 * hovAmp);
      const by = oy + q * (0.92 - prog * 0.85);
      const br = q * (0.01 + (i % 4) * 0.004) * (0.7 + 0.3 * Math.sin(prog * Math.PI));
      g.strokeStyle = i % 2 ? '#bbf7d0' : '#cffafe';
      g.lineWidth = Math.max(1, q * 0.004);
      g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.45)';
      g.beginPath(); g.arc(bx - br * 0.3, by - br * 0.3, br * 0.3, 0, Math.PI * 2); g.fill();
    }
    // 3) Tabanda salınan yosunlar / mercanlar
    g.lineCap = 'round';
    for (let k = 0; k < 6; k++) {
      const kx = ox + q * (0.18 + k * 0.13);
      const ky = oy + q * 0.94;
      const kh = q * (0.16 + (k % 3) * 0.06);
      const kSway = Math.sin(tm * 1.3 + k * 1.1) * q * 0.035 * hovAmp;
      g.strokeStyle = k % 2 ? 'rgba(45, 212, 191, 0.65)' : 'rgba(20, 184, 166, 0.7)';
      g.lineWidth = Math.max(1.8, q * 0.01);
      g.beginPath();
      g.moveTo(kx, ky);
      g.quadraticCurveTo(kx + kSway * 0.5, ky - kh * 0.5, kx + kSway, ky - kh);
      g.stroke();
    }
    // 4) Işıldayan plankton parıltıları
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 7; k++) {
      const tw = 0.5 + 0.5 * Math.sin(tm * (2.4 + (k % 3) * 0.8) + k * 1.9);
      const [px, py] = U(0.15 + (k * 0.13) % 0.7, 0.25 + (k * 0.11) % 0.6 + Math.sin(tm * 0.8 + k) * 0.02);
      shParilti(px, py, q * 0.028 * (0.6 + tw * 0.8), a * tw * 0.85);
    }
    g.restore();
    return;
  }
  g.globalCompositeOperation = 'lighter';
  if (ad === 'orman') {
    const nb = 0.5 + 0.5 * Math.sin(tm * 1.3 + i0);
    let [px, py] = U(0.56, 0.3); dglow('#ffe9a0', px, py, q * (0.3 + 0.05 * nb * hovAmp), a * (0.22 + 0.18 * nb * hovAmp));   // ağaç tacı nefes alır
    [px, py] = U(0.24, 0.76); dglow('#ff9ad6', px, py, q * (0.14 + 0.04 * nb * hovAmp), a * (0.35 + 0.28 * nb * hovAmp));     // çiçek
    // orman yapraklarının kımıldaması (rustling leaves & swaying branches)
    g.save();
    g.globalCompositeOperation = 'source-over';
    for (let lf = 0; lf < 8; lf++) {
      const lu = 0.2 + (lf * 0.11) % 0.6 + Math.sin(tm * 1.2 + lf * 1.7) * 0.02 * hovAmp;
      const lv = 0.2 + (lf * 0.09) % 0.45 + Math.sin(tm * 1.5 + lf * 2.1) * 0.018 * hovAmp;
      const rot = Math.sin(tm * 2.1 + lf * 1.4) * 0.35 * hovAmp;
      const [lx, ly] = U(lu, lv);
      g.save(); g.translate(lx, ly); g.rotate(rot);
      g.fillStyle = lf % 2 ? 'rgba(110, 231, 183, 0.75)' : 'rgba(52, 211, 153, 0.75)';
      g.beginPath(); g.ellipse(0, 0, q * 0.018, q * 0.009, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    g.restore();
    for (let k = 0; k < 11; k++) {   // süzülen ışık küreleri: yavaş, kıvrımlı yollar
      const s = k * 1.37 + i0, u = 0.12 + 0.76 * (0.5 + 0.5 * Math.sin(tm * (0.13 + (k % 4) * 0.03) + s)), v = 0.44 + 0.36 * (0.5 + 0.5 * Math.sin(tm * (0.19 + (k % 3) * 0.04) + s * 2.1));
      const tw = 0.5 + 0.5 * Math.sin(tm * (2.2 + (k % 3) * 0.7) + s * 3);
      [px, py] = U(u, v); dglow(k % 3 ? '#d8ffb0' : '#b0fff0', px, py, q * 0.035 * (0.7 + tw * 0.6), a * (0.25 + 0.6 * tw));
      if (tw > 0.55) dglow('#ffffff', px, py, q * 0.008, a * (tw - 0.5) * 1.6);
    }
    for (let k = 0; k < 5; k++) {   // taçtan süzülen ışık tozu
      const u = (tm * 0.07 + k / 5) % 1, sx = 0.48 + 0.16 * Math.sin(k * 2.3) + 0.03 * Math.sin(tm * 0.9 + k);
      [px, py] = U(sx, 0.32 + u * 0.5); dglow('#fff0b0', px, py, q * 0.02, a * Math.sin(u * Math.PI) * 0.8);
    }
  } else if (ad === 'gol') {
    for (let k = 0; k < SH_GOL_YILDIZ.length; k++) {   // yıldızlar ışıldar, yansımaları titrer
      const [u, v, r] = SH_GOL_YILDIZ[k], tw = 0.5 + 0.5 * Math.sin(tm * (1.4 + (k % 3) * 0.5) + k * 2.2 + i0);
      let [px, py] = U(u, v); shParilti(px, py, q * r * (1.2 + 1.3 * tw), a * tw * 0.75);
      [px, py] = U(u + 0.012 * Math.sin(tm * 1.7 + k), 0.64 + (0.64 - v) * 0.5); dglow('#fff0c0', px, py, q * r * 0.9, a * (0.15 + 0.2 * tw));
    }
    // göl suyunun parıldaması: yüzeyde parıldayan dalgacıklar
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let gw = 0; gw < 5; gw++) {
      const gwy = oy + q * (0.65 + gw * 0.06 + Math.sin(tm * 1.4 + gw) * 0.01 * hovAmp);
      g.strokeStyle = 'rgba(219, 234, 254, 0.45)';
      g.lineWidth = Math.max(1.2, q * 0.005);
      g.beginPath();
      for (let s = 0; s <= 16; s++) {
        const u = s / 16, gwx = ox + u * q;
        const wave = Math.sin(tm * 2.2 + u * 12 + gw * 1.7) * q * 0.008 * hovAmp;
        if (s === 0) g.moveTo(gwx, gwy + wave); else g.lineTo(gwx, gwy + wave);
      }
      g.stroke();
    }
    g.restore();
    for (let k = 0; k < 7; k++) {   // suda kayan ışıltılar
      const u = ((tm * 0.025 * (1 + (k % 3) * 0.4) + k * 0.31) % 1.2) - 0.1, v = 0.68 + (k * 0.043) % 0.26, al = Math.sin(clamp(u, 0, 1) * Math.PI) * (0.5 + 0.5 * Math.sin(tm * 1.9 + k));
      const [px, py] = U(u, v); g.globalAlpha = a * al * 0.5; g.fillStyle = '#dfe6ff'; g.fillRect(px - q * 0.04, py, q * 0.08, Math.max(1, q * 0.005)); g.globalAlpha = 1;
    }
    const kz = (tm * 0.11 + i0 * 0.3) % 1;   // ara sıra kayan yıldız
    if (kz < 0.14) { const u = kz / 0.14, [sx, sy] = U(0.15 + u * 0.45, 0.05 + u * 0.16), L = q * 0.12; g.globalAlpha = a * Math.sin(u * Math.PI); g.strokeStyle = '#fff6dc'; g.lineWidth = Math.max(1, q * 0.006); g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - L * 0.94, sy - L * 0.34); g.stroke(); g.globalAlpha = 1; dglow('#fff6dc', sx, sy, q * 0.03, a * Math.sin(u * Math.PI)); }
    // gölde uyuyan küçük yıldız (hafifçe iner-çıkar, nefes alır)
    const bob = Math.sin(tm * 1.3 + i0) * 0.008 * hovAmp, [sx, sy] = U(0.4, 0.8 + bob), nb = 0.5 + 0.5 * Math.sin(tm * 1.1);
    dglow('#ffe6a0', sx, sy, q * (0.15 + 0.04 * nb * hovAmp), a * (0.5 + 0.25 * nb));
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = a;
    g.fillStyle = '#ffe49a'; shYildiz5(g, sx, sy, q * 0.065); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.5)'; shYildiz5(g, sx - q * 0.008, sy - q * 0.01, q * 0.03); g.fill();
    g.strokeStyle = '#7a5a20'; g.lineWidth = Math.max(1, q * 0.007); g.lineCap = 'round';
    g.beginPath(); g.arc(sx - q * 0.016, sy + q * 0.004, q * 0.01, 0.2, 2.9); g.stroke(); g.beginPath(); g.arc(sx + q * 0.016, sy + q * 0.004, q * 0.01, 0.2, 2.9); g.stroke();
    g.globalAlpha = 1;
  } else if (ad === 'bulut') {
    // güneş ışınları yavaşça döner
    const [gx, gy] = U(0.5, 0.71);
    g.save(); g.translate(gx, gy); g.rotate(tm * 0.05); g.fillStyle = '#fff2d0';
    for (let k = 0; k < 9; k++) { g.rotate(0.698); g.globalAlpha = a * (0.045 + 0.03 * Math.sin(tm * 0.8 + k * 1.3)); g.beginPath(); g.moveTo(0, 0); g.lineTo(q * 0.7, -q * 0.045); g.lineTo(q * 0.7, q * 0.045); g.closePath(); g.fill(); }
    g.restore(); g.globalAlpha = 1;
    dglow('#fff0c8', gx, gy, q * (0.17 + 0.02 * Math.sin(tm * 1.1) * hovAmp), a * 0.3);
    g.globalCompositeOperation = 'source-over';
    // kayan bulutlar (üç katman, farklı hız - bulutların süzülmesi)
    for (let k = 0; k < 4; k++) {
      const w = q * [0.34, 0.24, 0.2, 0.28][k], v = [0.22, 0.36, 0.5, 0.12][k], hz = [0.012, 0.02, 0.028, 0.008][k] * hovAmp;
      const u = ((tm * hz + k * 0.37 + i0 * 0.1) % 1.5) - 0.3, [px, py] = U(u, v + 0.01 * Math.sin(tm * 0.6 + k) * hovAmp);
      g.globalAlpha = a * [0.85, 0.75, 0.95, 0.6][k]; g.drawImage(shBulutSprite(k === 2 ? 'beyaz' : k === 3 ? 'altin' : 'koyu'), px - w / 2, py - w / 4, w, w / 2);
    }
    g.globalAlpha = 1;
    // kuzucuk ön bulutta hafifçe zıplar
    g.globalAlpha = a;
    for (const [u, v, r, yon, ph] of [[0.63, 0.8, 0.11, -1, 0], [0.34, 0.835, 0.08, 1, 1.9]]) {
      const zp = Math.abs(Math.sin(tm * (1.5 + ph * 0.2) + i0 + ph)) * q * 0.022 * hovAmp, [kx, ky] = U(u, v);
      shKuzu(g, kx, ky - zp, q * r, yon, ((tm + ph) % 3.2) < 0.15);
    }
    // önde bir sıra kabarık bulut (kuzucukların ayaklarını örter)
    g.drawImage(shBulutSprite('koyu'), ox + q * 0.42, oy + q * 0.83, q * 0.5, q * 0.25); g.drawImage(shBulutSprite('koyu'), ox + q * 0.1, oy + q * 0.855, q * 0.46, q * 0.23); g.drawImage(shBulutSprite('beyaz'), ox - q * 0.12, oy + q * 0.88, q * 0.4, q * 0.2); g.drawImage(shBulutSprite('beyaz'), ox + q * 0.72, oy + q * 0.88, q * 0.4, q * 0.2);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++) {   // gökkuşağının üstünde ışıltılar
      const an = Math.PI * (1.12 + k * 0.18), tw = 0.5 + 0.5 * Math.sin(tm * 2 + k * 1.9 + i0), [px, py] = U(0.5 + Math.cos(an) * 0.4, 0.78 + Math.sin(an) * 0.4);
      shParilti(px, py, q * 0.035 * (0.5 + tw), a * tw * 0.8);
    }
  } else {
    for (let k = 0; k < 4; k++) { const tw = 0.5 + 0.5 * Math.sin(tm * 2 + k * 1.7), [px, py] = U([0.2, 0.4, 0.5, 0.85][k], [0.2, 0.12, 0.3, 0.5][k]); shParilti(px, py, q * 0.06 * (0.5 + tw), a * tw); }
  }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
}
function shBalonIc(ad, q) {   // iç resim (q×q, kesilmemiş), önbellekte
  sh.balon = sh.balon || {};
  const key = 'ic_' + ad + '_' + q;
  if (sh.balon[key]) return sh.balon[key];
  const c = document.createElement('canvas'); c.width = c.height = q; shIkonCiz(c.getContext('2d'), ad, q);
  return sh.balon[key] = c;
}
function shBalonCam(d, col) {   // sedef sabun köpüğü gibi cam kabuk: sedefli kenar ışığı, yanardöner halka, parlak sedef yansımaları
  sh.balon = sh.balon || {};
  const key = 'cam_' + d + col;
  if (sh.balon[key]) return sh.balon[key];
  const c = document.createElement('canvas'); c.width = c.height = d; const x = c.getContext('2d'), m = d / 2, R = d * 0.44;
  let gr = x.createRadialGradient(m, m, R * 0.55, m, m, R);   // içe doğru soluk sedef parıltısı
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.72, 'rgba(240,230,255,0.12)'); gr.addColorStop(0.92, 'rgba(255,248,255,0.32)'); gr.addColorStop(1, 'rgba(255,255,255,0.55)');
  x.fillStyle = gr; x.beginPath(); x.arc(m, m, R, 0, 6.283); x.fill();
  gr = x.createLinearGradient(0, m - R, 0, m + R); gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(0.45, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(170,215,255,0.14)');
  x.fillStyle = gr; x.beginPath(); x.arc(m, m, R, 0, 6.283); x.fill();
  // sedef yanardöner kenar: pembe, altın, zümrüt nane, camgöbeği, lila yaylar
  x.lineCap = 'round';
  const yaylar = [
    [3.2, 4.4, 'rgba(255,185,225,0.58)'],
    [4.5, 5.5, 'rgba(255,238,170,0.52)'],
    [5.6, 6.2, 'rgba(180,255,220,0.48)'],
    [0.1, 1.2, 'rgba(160,235,255,0.52)'],
    [1.4, 2.5, 'rgba(215,185,255,0.48)'],
    [2.6, 3.1, 'rgba(255,210,190,0.45)']
  ];
  for (const [a0, a1, cc] of yaylar) { x.strokeStyle = cc; x.lineWidth = d * 0.022; x.beginPath(); x.arc(m, m, R - d * 0.012, a0, a1); x.stroke(); }
  // parlak sedef kordon çizgisi
  x.strokeStyle = 'rgba(255,255,255,0.95)'; x.lineWidth = Math.max(1.8, d * 0.013); x.beginPath(); x.arc(m, m, R, 0, 6.283); x.stroke();
  x.strokeStyle = mixc(col, '#ffffff', 0.25, 0.45); x.lineWidth = Math.max(1.8, d * 0.028); x.beginPath(); x.arc(m, m, R + d * 0.018, 0, 6.283); x.stroke();
  x.strokeStyle = mixc(col, '#ffffff', 0.45, 0.18); x.lineWidth = d * 0.055; x.beginPath(); x.arc(m, m, R + d * 0.048, 0, 6.283); x.stroke();
  // sol üstte parlak sedef pencere yansıması, sağ altta çift ışık yayı
  x.fillStyle = 'rgba(255,255,255,0.85)';
  x.save(); x.translate(m - R * 0.47, m - R * 0.5); x.rotate(-0.75); x.beginPath(); x.ellipse(0, 0, R * 0.24, R * 0.09, 0, 0, 6.283); x.fill(); x.restore();
  x.beginPath(); x.arc(m - R * 0.16, m - R * 0.76, R * 0.045, 0, 6.283); x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = d * 0.014; x.beginPath(); x.arc(m, m, R * 0.86, 0.2, 1.25); x.stroke();
  return sh.balon[key] = c;
}
// düzen: [{x,y,d}] ekran pikseli; 1-5 balon. Tek sırada hafif yay (ortadakiler yukarıda), dikey ekranda daha geniş alan
function shSecimYer(n) {
  const yatay = W > H * 1.1, mn = Math.min(W, H), asagi = shSecGuvenli.asagi;
  if (n === 5) {
    const fs=Math.min(H*.1,W*.088),top=H*(yatay?.025:.035)+fs*1.62;
    if(yatay){const d=Math.min(W*.16,H*.28), y=top+d*.62+asagi;return [0,1,2,3,4].map(i=>({x:W*(.115+i*.1925),y:y+Math.abs(i-2)*d*.055,d}));}
    const d=Math.min(W*.27,H*.145), y=top+d*.62+asagi;return [0,1,2,3,4].map(i=>({x:W*(i<3?.19+i*.31:.34+(i-3)*.32),y:y+(i<3?0:d*1.14),d}));
  }
  if (n === 4) {
    const fs = Math.min(H * 0.1, W * 0.088), top = H * (yatay ? 0.025 : 0.035) + fs * 1.62;
    // İlk ve son rüya biraz yukarıda: soldaki balon Feza'nın yüzünü kapatmaz, ortadakiler yerinde kalır.
    if (yatay) { const d = Math.min(W * 0.185, H * 0.31), y = top + d * 0.57 + asagi, kenar = Math.min(32 * H / Math.max(1, innerHeight), d * 0.2); return [0, 1, 2, 3].map(i => ({ x: W * (0.17 + i * 0.22), y: y - (i === 0 || i === 3 ? kenar : 0), d })); }
    const d = Math.min(W * 0.26, H * 0.155, (H * 0.49 - top) / 2.4), y0 = top + d * 0.61, dy = d * 1.24, kenar = Math.min(20 * H / Math.max(1, innerHeight), d * 0.2);
    return [0, 1, 2, 3].map(i => ({ x: W * (i % 2 ? 0.7 : 0.3), y: y0 + Math.floor(i / 2) * dy + asagi - (i === 0 || i === 3 ? kenar : 0), d }));
  }
  const A = yatay ? { x0: W * 0.06, y0: H * 0.172, w: W * 0.88, h: H * 0.34 } : { x0: W * 0.025, y0: H * 0.175, w: W * 0.95, h: H * 0.3 };
  const maxD = mn * (n <= 2 ? 0.4 : yatay ? 0.33 : 0.36);
  let en = null;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols), cw = A.w / cols, ch = A.h / rows, d = Math.min(cw, ch) * (n > 3 ? 0.97 : 0.93);
    if (!en || d > en.d + 0.5) en = { cols, rows, d, cw, ch };
  }
  // tek sırada: balonlar başlığın (alt başlık dahil) altında, Feza'nın yüzünün üstünde kalan banda sığar; ortadaki en üstte
  // (üst kenar + nabız/süzülme payı alt başlığa değmez), yandakiler hafif aşağıda (yay)
  const fs = Math.min(H * 0.1, W * 0.088), tb = H * (yatay ? 0.025 : 0.035) + fs * 1.62, bot = H * (yatay ? 0.535 : 0.445);
  let d = Math.min(en.d, maxD);
  if (en.rows === 1) d = Math.min(d, (bot - tb) / 1.24);
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / en.cols), inRow = r === en.rows - 1 ? n - r * en.cols : en.cols, ci = i - r * en.cols;
    const rowW = inRow * en.cw, x0 = A.x0 + (A.w - rowW) / 2;
    const k = inRow > 1 ? (ci - (inRow - 1) / 2) / ((inRow - 1) / 2) : 0, yay = en.rows === 1 ? d * 0.1 * (1 - k * k) : 0;
    const y = en.rows === 1 ? tb + d * 0.6 + d * 0.1 - yay : Math.max(A.y0 + (r + 0.5) * en.ch, tb + d * 0.6 + r * en.ch);
    out.push({ x: x0 + (ci + 0.5) * en.cw, y: y + asagi, d });
  }
  return out;
}
let shBaslikC = null;
function shBaslikSprite() {   // "Feza ve Pırıl" + altyazı: arayuz.js başlığının stili (Georgia, mor-krem degrade, ışıma)
  if (shBaslikC && shBaslikC.W === W && shBaslikC.H === H) return shBaslikC;
  const fs = Math.round(Math.min(H * 0.1, W * 0.088)), fs2 = Math.round(fs * 0.38), h = Math.round(fs * 2.3), pad = fs * 0.55, FS = 'Georgia, "Times New Roman", serif';
  // Ana başlığın üzerinde biraz daha nefes: yazıları birbirine yaklaştır, balonları aşağı itme.
  // Kısa ekranlarda bu boşluklar da yazı boyuyla küçülür; font ve oranlar aynı kalır.
  const anaPay = Math.min(12 * H / Math.max(1, innerHeight), fs * 0.2), altPay = Math.min(4 * H / Math.max(1, innerHeight), fs * 0.07);
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = h; return c; };
  const metin = mk(), glow = mk();
  const yaz = (x, renk) => {
    x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.font = `400 ${fs}px ${FS}`;
    if (renk) { const gr = x.createLinearGradient(0, pad * 0.4 + anaPay, 0, pad + fs * 0.2 + anaPay); gr.addColorStop(0, '#fbf6ff'); gr.addColorStop(0.5, '#e6d6ff'); gr.addColorStop(1, '#bfa0f4'); x.fillStyle = gr; }
    x.fillText('Feza ve Pırıl', W / 2, pad + fs * 0.2 + anaPay);
    x.font = `italic 400 ${fs2}px ${FS}`;
    if (renk) { const gr = x.createLinearGradient(0, pad + fs * 0.5 - altPay, 0, pad + fs * 1.05 - altPay); gr.addColorStop(0, '#fff6dc'); gr.addColorStop(1, '#bff4ff'); x.fillStyle = gr; }
    x.fillText('Her gece başka bir rüya', W / 2, pad + fs * 0.88 - altPay);
  };
  const gx = glow.getContext('2d');
  for (const [blur, col] of [[fs * 0.5, 'rgba(160,120,255,0.9)'], [fs * 0.2, 'rgba(220,200,255,0.9)']]) {
    gx.save(); gx.shadowColor = col; gx.shadowBlur = blur; gx.shadowOffsetX = W * 2; gx.translate(-W * 2, 0); gx.fillStyle = '#000'; yaz(gx, false); gx.restore();
  }
  const mx = metin.getContext('2d'); mx.save(); mx.shadowColor = 'rgba(40,20,90,0.6)'; mx.shadowBlur = fs * 0.06; mx.shadowOffsetY = fs * 0.03; yaz(mx, true); mx.restore();
  return shBaslikC = { metin, glow, h, W, H };
}
// rüyaya dalışta ekranı dolduracak keskin iç resim boyu; balonlar yerine oturunca boşta, birer birer hazırlanır (dokunuşta takılma olmasın)
function shHiQ() { return Math.min(1400, Math.round(Math.max(W, H) * 0.6 / 8) * 8); }
function shBalonBirak() { if (sh.balon) for (const k in sh.balon) shBirak(sh.balon[k]); sh.balon = {}; }
function shSecimBaslat(opts, onSec) {
  shOlc();
  sh.mod = 'secim'; sh.t = 0; sh.sonGorunum = false; sh.tam = true; sh.kisa = false; sh.dan = false; sh.anlar = {}; sh.sesler = {}; sh.parca.length = 0; sh.zz.length = 0; sh.tema = null;
  sh.sec = { opts: (opts || []).slice(0, 5), onSec, secili: null, ts: 0, gec: 0, dok: 0, nab: -9, nabX: 0, nabY: 0, pos: [], hi: null };
  sh.plan = null; sh.bitti = null;
  sh.odaSabah = shBirak(sh.odaSabah); sh.odaYakin = shBirak(sh.odaYakin); if (shDus) { shBirak(shDus.c); shDus = null; }
  if (shKopya) shKopya = shBirak(shKopya);
  shGeceHazirla();
  const S2 = sh.sec;
  S2.opts.forEach((o, i) => setTimeout(() => { if (sh.mod === 'secim' && sh.sec === S2 && !S2.secili) { try { shBoya(shBalonIc(o.ikon, shHiQ())); } catch (e) {} } }, 3400 + i * 900));
}
function shSecimDokun(cx, cy) {   // CSS pikseli
  shOlc();
  const S2 = sh.sec; if (sh.mod !== 'secim' || !S2 || S2.secili || sh.t < 0.6) return false;
  const px = cx / innerWidth * W, py = cy / innerHeight * H;
  let yer = S2.pos; if (!yer || yer.length !== S2.opts.length) { yer = shSecimYer(S2.opts.length).map((b, i) => { const f = shSecimOfs(i, sh.t, b.d); return { x: b.x + f.x, y: b.y + f.y, d: b.d, hazir: 1 }; }); }
  let en = -1, ed = 1e9;
  for (let i = 0; i < yer.length; i++) {
    const b = yer[i]; if (!b || b.hazir < 0.6) continue;
    const dd = Math.hypot(px - b.x, py - b.y);
    if (dd < b.d * 0.56 && dd < ed) { en = i; ed = dd; }
  }
  if (en < 0) { S2.nab = sh.t; S2.nabX = px; S2.nabY = py; return false; }
  S2.secili = S2.opts[en]; S2.si = en; S2.ts = sh.t;
  // rüyaya dalarken ekranı dolduracak büyük, keskin iç resim (bir kez; vektör çizim, birkaç ms)
  try { S2.hi = shBalonIc(S2.secili.ikon, shHiQ()); } catch (e) { S2.hi = null; }
  try { OLAY.emit('secim', { id: S2.secili.id, i: en }); } catch (e) {}
  try { if (typeof AU !== 'undefined' && AU.sfx) AU.sfx('secim', en); } catch (e) {}
  shAn('ruyayaGec');
  try { OLAY.emit('ruyayaGec', { id: S2.secili.id }); } catch (e) {}
  try { if (typeof AU !== 'undefined' && AU.sfx) AU.sfx('ruyayaGec'); } catch (e) {}
  return true;
}
const shOfsR = { x: 0, y: 0 };   // yeniden kullanılır: karede ayırma yok
function shSecimOfs(i, tm, d) { shOfsR.x = Math.sin(tm * (0.5 + i * 0.045) + i * 1.9) * d * 0.028 + Math.sin(tm * 0.23 + i) * d * 0.012; shOfsR.y = Math.sin(tm * (0.72 + i * 0.05) + i * 2.7) * d * 0.04 + Math.sin(tm * 0.31 + i * 4.1) * d * 0.012; return shOfsR; }
function shAltinRozet(cx, cy, r, tm, a) {   // altın yıldız rozeti
  if (a <= 0.01 || r <= 0.5) return;
  g.save(); g.translate(cx, cy);
  g.globalCompositeOperation = 'lighter'; dglow('#ffd870', 0, 0, r * 2.6, a * (0.45 + 0.1 * Math.sin(tm * 2))); g.globalCompositeOperation = 'source-over';
  g.globalAlpha = a; g.fillStyle = 'rgba(40,30,90,0.6)'; g.beginPath(); g.arc(0, 0, r * 1.25, 0, 6.283); g.fill();
  g.strokeStyle = '#fff1b8'; g.lineWidth = Math.max(1.5, r * 0.12); g.stroke();
  g.rotate(Math.sin(tm * 1.2) * 0.1); shYildiz5(g, 0, 0, r * 0.95); g.fillStyle = '#ffcf4a'; g.fill(); g.strokeStyle = '#fff4c8'; g.lineWidth = r * 0.1; g.lineJoin = 'round'; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.55)'; shYildiz5(g, -r * 0.12, -r * 0.14, r * 0.38); g.fill();
  g.restore(); g.globalAlpha = 1;
}
// pencerede ışıldayan yıldızlar, ara sıra kayan yıldız (oda biriminde; perdelerden önce çizilir)
function shPencereCanli(tm, a) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const k = sh.k0 * sh.zoom;
  for (const [x, y, ph] of [[17.5, 15.5, 0], [23, 13.2, 1.7], [26.5, 24.5, 3.1], [19.5, 29, 4.4], [37.5, 30.5, 2.2], [29.5, 34.5, 5.3], [36.8, 13.5, 0.9]]) {
    const tw = Math.pow(0.5 + 0.5 * Math.sin(tm * (0.9 + ph * 0.13) + ph * 2.3), 3);
    shParilti(shEkranX(x), shEkranY(y), k * (0.5 + 1.3 * tw), a * (0.25 + 0.7 * tw));
  }
  const kz = (tm / 9.5) % 1;
  if (kz < 0.09) {
    const u = kz / 0.09, x = lerp(16.5, 30, u), y = lerp(13.5, 24, u), L = k * 4.5, px = shEkranX(x), py = shEkranY(y);
    g.globalAlpha = a * Math.sin(u * Math.PI) * 0.9; g.strokeStyle = '#eef3ff'; g.lineWidth = Math.max(1, k * 0.18); g.lineCap = 'round';
    g.beginPath(); g.moveTo(px, py); g.lineTo(px - L * 0.79, py - L * 0.61); g.stroke(); g.globalAlpha = 1;
    dglow('#eef3ff', px, py, k * 1.4, a * Math.sin(u * Math.PI) * 0.8);
  }
  g.globalCompositeOperation = 'source-over';
}
// seçim odasının canlı ışık oyunu: ay huzmesinde süzülen toz, lambanın sıcak zerreleri, pencere önünde ışık küreleri (ayırma yok, her kare ucuz)
function shSecimIsik(tm) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const k = sh.k0;
  for (let i = 0; i < 14; i++) {   // ay huzmesi: pencereden yatağa doğru yavaş süzülen toz
    const u = (i * 0.618 + tm * (0.012 + (i % 4) * 0.004)) % 1, v = (i * 0.377) % 1;
    const x = lerp(lerp(18, 36, v), lerp(-14, 6, v), u) + Math.sin(tm * 0.35 + i * 1.7) * 1.6, y = lerp(16, 76, u) + Math.cos(tm * 0.3 + i) * 1.2;
    const tw = 0.5 + 0.5 * Math.sin(tm * 1.1 + i * 2.1), al = Math.sin(u * Math.PI) * (0.25 + 0.4 * tw);
    dglow('#d9e6ff', shPX(x), shPY(y), k * (0.5 + 0.5 * tw), al * 0.6);
  }
  for (let i = 0; i < 7; i++) {   // lamba: sıcak, yukarı süzülen minik zerreler
    const u = (i * 0.29 + tm * 0.045) % 1, x = SH_LAMBA.x + Math.sin(tm * 0.8 + i * 2.3) * (1 + u * 3), y = SH_LAMBA.y - 1 - u * 13;
    dglow('#ffd9a0', shPX(x), shPY(y), k * (0.45 + 0.5 * (1 - u)), Math.sin(u * Math.PI) * 0.5);
  }
  for (let i = 0; i < 6; i++) {   // pencerenin dışında süzülen ışık küreleri (böcek değil: yumuşak, soluk renkli; yavaş sekiz çizerler, nabız gibi yanıp söner)
    const x = 22 + (i % 3) * 6.5 + Math.sin(tm * 0.31 + i * 2.2) * 2.4, y = 40 + (i % 2) * 4 + Math.sin(tm * 0.47 + i * 1.3) * 1.8;
    const pu = Math.pow(0.5 + 0.5 * Math.sin(tm * 0.9 + i * 1.9), 2);
    dglow(i % 2 ? '#e6dcff' : '#d4ecff', shPX(x), shPY(y), k * (0.9 + 0.9 * pu), 0.2 + 0.5 * pu);
  }
  g.globalCompositeOperation = 'source-over';
}
function shSecimOda(tm, dt, sec) {   // gece odası: lamba, uyuyan Feza, parlayan Pırıl
  const p = SH_GECE;
  shKamera(W / 2, H / 2, 1, W / 2, H / 2);
  shResimT(); g.drawImage(sh.oda, 0, 0);
  shHuzme(true, 1, tm);
  shPencereCanli(tm, 1);
  shSecimIsik(tm);
  shPerdeler(p, 0, tm, 0);
  shLamba(p, 0, tm, true, 0.85 + 0.06 * Math.sin(tm * 0.9) + 0.025 * Math.sin(tm * 2.3 + 1));
  shHali(p, 0, tm);
  shYatakArka(p, 0, 0, tm);
  sh.fzOlc = 1.18; sh.prOlc = 1; sh.kirpK = 0;
  const S2 = sh.sec, nu = S2 ? clamp((sh.t - S2.nab) / 1.1, 0, 1) : 1;
  const fl = S2 && S2.secili ? Math.sin(shSeg(sec, 0, 0.6) * Math.PI) : nu < 1 ? Math.sin(nu * Math.PI) * 0.45 : 0;   // dokununca (boş dokunuşta da hafifçe) Pırıl parlar
  shPirilIsik(shKucak.px, shKucak.py, tm, 1 + 0.4 * fl);
  const cy = (tm + 4) % 12.5, sok = cy > 7 && cy < 9.2 ? Math.sin((cy - 7) / 2.2 * Math.PI) : 0;   // ≈12 sn'de bir: iç çekip Pırıl'a sokulur
  shFeza(SH_FEZA.x + 0.25 * sok, SH_FEZA.y + 0.12 * sok, 1.18, shPozVar('uykuya_dalis') ? 'uykuya_dalis' : 'uyku', tm, shPirilPozVar('pelus_sik') ? 'pelus_sik' : 'pelus', shPirilPozVar('pelus_sik') ? 0.45 + 0.25 * Math.sin(tm * 1.5) + 0.3 * sok : undefined, undefined, shPozVar('uykuya_dalis') ? 3.3 + tm * 0.2 : tm);
  shBattaniye(p, 0, tm, Math.sin(tm * 1.5) * 0.5 + 0.5 + 1.4 * sok, 0);
  // Pırıl'ın etrafında ışık nefesi (rüya çağıran parıltı)
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  const nb = 0.5 + 0.5 * Math.sin(tm * 1.1), px = shEkranX(shKucak.px), py = shEkranY(shKucak.py - 1);
  dglow('#c9a8ff', px, py, sh.k0 * (26 + 5 * nb + 10 * fl), 0.28 + 0.1 * nb + 0.25 * fl);
  g.globalCompositeOperation = 'source-over';
  shZerreAkit(dt, tm);
}
// Pırıl'dan baloncuklara süzülen rüya tozu (ince ışık izleri)
function shRuyaIzi(px, py, b, col, tm, i, a) {
  if (a <= 0.01) return;
  const ex = b.x, ey = b.y + b.d * 0.42, mx = lerp(px, ex, 0.35) - (ex - px) * 0.1, my = Math.min(py, ey) - b.d * 0.35;
  for (let k = 0; k < 9; k++) {
    const u = (tm * 0.08 + k / 9 + i * 0.137) % 1, v = 1 - u;
    const x = v * v * px + 2 * v * u * mx + u * u * ex + Math.sin(tm * 1.3 + k * 2 + i) * b.d * 0.02, y = v * v * py + 2 * v * u * my + u * u * ey;
    const tw = 0.6 + 0.4 * Math.sin(tm * 3 + k * 1.7 + i), al = a * Math.sin(u * Math.PI) * tw;
    dglow(col, x, y, b.d * 0.06 * (0.6 + 0.6 * Math.sin(u * Math.PI)), al * 0.7);
    dglow('#ffffff', x, y, b.d * (k % 2 ? 0.01 : 0.016), al * 0.95);
  }
}
function shSecimCiz(tm, dt) {
  const S2 = sh.sec; if (!S2) return;
  sh.t += dt; const t = sh.t;
  const sec = S2.secili ? clamp((t - S2.ts) / SH_SEC_SURE, 0, 1) : 0;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (S2.kapli) { g.fillStyle = '#04050e'; g.fillRect(0, 0, W, H); }   // seçilen rüya ekranı kapladı: oda çizilmez
  else if (!sh.oda) {   // oda hazırlanana dek yumuşak gece rengi
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, SH_GECE.wallTop); gr.addColorStop(1, SH_GECE.floorBot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    shGeceHazirla();
  } else shSecimOda(tm, dt, sec);
  // üstte yumuşak karartma (başlık ve baloncuklar okunsun)
  if (!sh.ustGr || sh.ustGrH !== H) { sh.ustGr = g.createLinearGradient(0, 0, 0, H * 0.7); sh.ustGr.addColorStop(0, 'rgba(5,7,24,0.55)'); sh.ustGr.addColorStop(1, 'rgba(5,7,24,0)'); sh.ustGrH = H; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = sh.ustGr; g.fillRect(0, 0, W, H * 0.7);
  shZerreler(tm, 0.45, true);
  const gir = shEase(shSeg(t, 0, 1.5)), yz = 1 - shEase(shSeg(sec, 0, 0.3));
  // başlık
  const B = shBaslikSprite(), by = H * (W > H * 1.1 ? 0.025 : 0.035) + shSecGuvenli.asagi - H * 0.02 * shEase(shSeg(sec, 0, 0.4)), nf = 0.72 + 0.22 * Math.sin(tm * 1.3);
  g.globalAlpha = Math.min(1, gir * yz * nf); g.drawImage(B.glow, 0, by);
  g.globalAlpha = gir * yz; g.drawImage(B.metin, 0, by); g.globalAlpha = 1;
  // baloncuklar
  const opts = S2.opts, yer = shSecimYer(opts.length), ilk = !opts.some(o => o.tamam);
  const prx = sh.oda ? shEkranX(shKucak.px) : W * 0.3, pry = sh.oda ? shEkranY(shKucak.py - 2) : H * 0.55;
  const scx = S2.secili ? S2.pos[S2.si].x0 : 0, scy = S2.secili ? S2.pos[S2.si].y0 : 0;
  const sira = []; for (let i = 0; i < opts.length; i++) if (i !== S2.si) sira.push(i); if (S2.secili) sira.push(S2.si);
  // önce rüya izleri (baloncukların arkasında)
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < opts.length; i++) {
    const p0 = S2.pos[i]; if (!p0) continue;
    const sel = S2.si === i && S2.secili, ia = (sel ? 1 + 1.5 * Math.sin(shSeg(sec, 0, 0.5) * Math.PI) : 1 - shSeg(sec, 0, 0.3)) * shSeg(t, 1.6 + i * 0.25, 3) * (1 - shSeg(sec, 0.3, 0.55));
    shRuyaIzi(prx, pry, p0, SH_BALON_RENK[opts[i].ikon] || '#e6d6ff', tm, i, ia * 0.8);
  }
  g.globalCompositeOperation = 'source-over';
  for (const i of sira) {
    const o = opts[i], b = yer[i], f = shSecimOfs(i, tm, b.d), sel = S2.secili === o;
    // Pırıl'dan doğuş: küçük bir ışık topu olarak çıkar, yay çizerek yerine süzülür, hafifçe şişip oturur
    const em = shSeg(t, 0.35 + i * 0.24, 1.85 + i * 0.24), eo = shEaseOut(em), eb = shEaseBack(em);
    let cx = lerp(prx, b.x + f.x, eo) + Math.sin(em * Math.PI) * b.d * 0.18 * (i - (opts.length - 1) / 2);
    let cy = lerp(pry, b.y + f.y, eo) - Math.sin(em * Math.PI) * b.d * 0.12;
    const distM = Math.hypot(shMoverX * DPR - cx, shMoverY * DPR - cy);
    const isHover = !S2.secili && distM < b.d * 0.55;
    const hovPulse = isHover ? Math.sin(tm * 3.8) * 0.045 : 0;
    const nefes = (1 + 0.022 * Math.sin(tm * 1.25 + i * 1.7)) * (1 + hovPulse);
    const nu = clamp((t - S2.nab) / 0.9, 0, 1), nd = Math.hypot(S2.nabX - cx, S2.nabY - cy), nb2 = nu < 1 ? Math.sin(nu * Math.PI) * (1 - nu * 0.3) * clamp(1.4 - nd / (Math.max(W, H) * 0.6), 0.35, 1) : 0;   // boş dokunuş: yakındaki balonlar nabız atar
    let d = b.d * (0.12 + 0.88 * eb) * nefes * (1 + 0.05 * nb2), sx = 1, sy = 1;
    let al = Math.min(1, em * 3), cam = 1, ica = 1;
    if (S2.secili && !sel) {   // diğerleri: yana açılıp küçülerek söner
      const u = shEase(shSeg(sec, 0, 0.45)), dx = cx - scx, dy = cy - scy, L = Math.hypot(dx, dy) || 1;
      cx += dx / L * b.d * 0.5 * u; cy += dy / L * b.d * 0.3 * u; d *= 1 - 0.35 * u; al *= 1 - u;
    }
    if (sel) {   // dokunulduğunda tatlıca büyüme ve yaylanma (scale bounce + jöle elastikiyeti)
      const ju = t - S2.ts;
      const bounce = Math.sin(ju * 14) * Math.exp(-ju * 4.2) * 0.22;
      const sq = Math.sin(ju * 18) * Math.exp(-ju * 5.5) * 0.12 * shSeg(ju, 0.05, 0.25);
      sx = 1 + sq + bounce; sy = 1 - sq * 0.9 - bounce * 0.8;
      const mv = shEase(shSeg(sec, 0.12, 0.6)), gr = Math.pow(shSeg(sec, 0.2, 0.72), 2.1);
      cx = lerp(cx, W / 2, mv); cy = lerp(cy, H / 2, mv);
      const kap = Math.hypot(W, H) * 1.18;   // iç daire (0,44·d) köşeleri de örtsün
      const pop = 1 + 0.18 * smooth(clamp(ju / 0.15, 0, 1)) * (1 - smooth(clamp((ju - 0.15) / 0.35, 0, 1)));
      d = lerp(d * pop, kap, gr);
      cam = 1 - shEase(shSeg(sec, 0.25, 0.62)); ica = 1;
      if (gr >= 1 && Math.abs(sq) < 0.003) S2.kapli = true;
    }
    S2.pos[i] = { x: cx, y: cy, d, x0: S2.pos[i] ? S2.pos[i].x0 : cx, y0: S2.pos[i] ? S2.pos[i].y0 : cy, hazir: em };
    if (!S2.secili) { S2.pos[i].x0 = cx; S2.pos[i].y0 = cy; }
    if (al <= 0.01 || d < 2) continue;
    const col = SH_BALON_RENK[o.ikon] || '#e6d6ff', yeni = !o.tamam, son = !!o.son;
    // arka ışık
    g.globalCompositeOperation = 'lighter';
    dglow(col, cx, cy, d * (son ? 0.95 : 0.8), al * cam * ((son ? 0.46 + 0.16 * Math.sin(tm * 1.6) : yeni ? 0.26 + 0.1 * Math.sin(tm * 1.9 + i) : 0.18) + 0.3 * nb2 + (em < 1 ? 0.5 * (1 - em) : 0) + (sel ? 0.55 * Math.sin(shSeg(sec, 0, 0.45) * Math.PI) + 0.3 * shSeg(sec, 0, 0.2) : 0)));
    g.globalCompositeOperation = 'source-over';
    // iç dünya (daire içinde; balon süzülürken iç resim hafifçe geride kalır → küre derinliği)
    const R = d * 0.44, q = R * 2.16, pr = 0.5 + (sel ? 0 : 1) * 0.5;
    g.save(); g.translate(cx, cy); g.scale(sx, sy);
    g.beginPath(); g.arc(0, 0, R, 0, 6.283); g.clip();
    const ox = -q / 2 - f.x * 0.35 * pr, oy = -q / 2 - f.y * 0.35 * pr;
    const ic = sel && S2.hi && d > b.d * 1.25 ? S2.hi : shBalonIc(o.ikon, Math.max(64, Math.round(b.d * 0.95 / 8) * 8));
    g.globalAlpha = al * ica; g.drawImage(ic, ox, oy, q, q); g.globalAlpha = 1;
    // canlı katman: balonun dönüşümü içinde (0,0 = balon merkezi)
    shIkonCanli(o.ikon, ox, oy, q, tm, al * ica, i, isHover ? 1 : 0);
    if (em < 1) { g.globalCompositeOperation = 'lighter'; g.fillStyle = col; g.globalAlpha = (1 - em) * 0.8; g.fillRect(-R, -R, R * 2, R * 2); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }   // doğarken ışık topu
    g.restore();
    // cam kabuk
    if (cam > 0.01) {
      const cs = shBalonCam(Math.max(64, Math.round(b.d / 8) * 8), col);
      g.save(); g.translate(cx, cy); g.scale(sx, sy); g.globalAlpha = al * cam; g.drawImage(cs, -d / 2, -d / 2, d, d); g.restore(); g.globalAlpha = 1;
    }
    // parıltılı sedef çerçeve yansıması (zamana göre dönen yanardöner sedef ışıltısı)
    if (cam > 0.05 && (!sel || sec < 0.3)) {
      g.save(); g.translate(cx, cy); g.scale(sx, sy); g.globalCompositeOperation = 'lighter';
      const sdA = tm * 0.4 + i * 1.57, Rsd = d * 0.44;
      for (let k = 0; k < 3; k++) {
        const sa = sdA + k * 2.094, sw = 0.5 + 0.5 * Math.sin(tm * 2.2 + k * 2.1 + i);
        shParilti(Math.cos(sa) * Rsd, Math.sin(sa) * Rsd, d * (0.024 + 0.02 * sw), al * cam * (0.35 + 0.45 * sw));
      }
      g.restore(); g.globalCompositeOperation = 'source-over';
    }
    if (!sel || sec < 0.3) {   // cam üstünde yavaşça kayan parlak ışık (her balonun kendi evresi)
      g.globalCompositeOperation = 'lighter';
      const ga = -0.9 + Math.sin(tm * 0.4 + i * 2.1) * 0.35, gp = 0.5 + 0.5 * Math.sin(tm * 0.9 + i * 1.3);
      shParilti(cx + Math.cos(ga) * d * 0.36, cy + Math.sin(ga) * d * 0.36, d * (0.035 + 0.02 * gp), al * (0.35 + 0.4 * gp));
      g.globalCompositeOperation = 'source-over';
    }
    if (son && !sel) {   // son oynanan: sıcak, yavaşça dönen kesik ışık halkası
      g.save(); g.translate(cx, cy); g.rotate(tm * 0.25); g.globalCompositeOperation = 'lighter';
      g.strokeStyle = `rgba(255,236,190,${al * (0.35 + 0.2 * Math.sin(tm * 1.6))})`; g.lineWidth = Math.max(2, d * 0.014); g.setLineDash([d * 0.06, d * 0.035]); g.lineCap = 'round';
      g.beginPath(); g.arc(0, 0, d * 0.53, 0, 6.283); g.stroke(); g.setLineDash([]); g.restore(); g.globalCompositeOperation = 'source-over';
    }
    if (yeni && !sel) {   // oynanmamış: etrafında minik parıltılar
      g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 4; k++) { const a = tm * 0.5 + k * 1.57 + i, tw = 0.5 + 0.5 * Math.sin(tm * 2.2 + k * 1.9 + i); shParilti(cx + Math.cos(a) * d * 0.52, cy + Math.sin(a) * d * 0.52, d * 0.045 * (0.5 + tw), al * tw * 0.8); }
      g.globalCompositeOperation = 'source-over';
    }
    if (o.tamam && !sel) {   // altın yıldız rozeti: balon oturunca küçük bir zıplamayla belirir
      const rz0 = 1.9 + i * 0.24 + 0.25, rz = shSeg(t, rz0, rz0 + 0.55), rzb = shEaseBack(rz);
      if (rz > 0.3 && !sh.anlar['rozet' + i]) { sh.anlar['rozet' + i] = 1; try { if (typeof AU !== 'undefined' && AU.sfx) AU.sfx('yildizRozet'); } catch (e) {} }
      const rx = cx + d * 0.34 * sx, ry = cy - d * 0.34 * sy;
      shAltinRozet(rx, ry, d * 0.085 * rzb, tm, al * Math.min(1, rz * 2));
      if (rz > 0 && rz < 1) { g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 6; k++) { const a = k * 1.047, rr = d * (0.05 + 0.12 * rz); shParilti(rx + Math.cos(a) * rr, ry + Math.sin(a) * rr, d * 0.03, al * (1 - rz)); } g.globalCompositeOperation = 'source-over'; }
      g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { const tw = 0.5 + 0.5 * Math.sin(tm * 2.6 + k * 2.1 + i); shParilti(rx + Math.cos(k * 2.1 + tm * 0.7) * d * 0.1, ry + Math.sin(k * 2.1 + tm * 0.7) * d * 0.1, d * 0.03 * tw, al * rz * tw); } g.globalCompositeOperation = 'source-over';
    }
    if (ilk && i === 0 && !S2.secili) {   // ilk kez: dokunma ipucu (nabız halkaları, el çizimi yok)
      const ia = shEase(shSeg(t, 2.6, 3.6));
      for (let k = 0; k < 2; k++) {
        const u = ((tm * 0.55 + k * 0.5) % 1), rr = d * (0.3 + 0.28 * u);
        g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,248,225,${ia * (1 - u) * 0.8})`; g.lineWidth = Math.max(2, d * 0.02 * (1 - u)); g.beginPath(); g.arc(cx, cy, rr, 0, 6.283); g.stroke();
      }
      const bs = 0.5 + 0.5 * Math.sin(tm * 3.45);
      dglow('#fff6d8', cx, cy, d * 0.16 * (0.8 + 0.4 * bs), ia * (0.35 + 0.3 * bs)); g.globalCompositeOperation = 'source-over';
    }
    if (sel) {   // dokunuş: kenardan yayılan ışık halkası + dışa saçılan parıltılar
      const u = shSeg(sec, 0, 0.42), e = shEaseOut(u), R0 = b.d * 0.46;
      if (u < 1) {
        g.globalCompositeOperation = 'lighter';
        g.strokeStyle = `rgba(255,250,235,${(1 - u) * 0.85})`; g.lineWidth = Math.max(2, b.d * 0.03 * (1 - u)); g.beginPath(); g.arc(cx, cy, R0 * (1 + 0.7 * e), 0, 6.283); g.stroke();
        for (let k = 0; k < 14; k++) { const a = k * 0.449 + i, rr = R0 * (1.02 + 0.9 * e * (0.7 + 0.3 * Math.sin(k * 2.7))); shParilti(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, b.d * 0.05 * (1 - u * 0.6), (1 - u)); }
        g.globalCompositeOperation = 'source-over';
      }
    }
  }
  // seçilen rüya ekranı kapladı: masalsı sarmal yıldızlar ve rüya tozu
  if (S2.secili) {
    const o = S2.secili, col = SH_BALON_RENK[o.ikon] || '#e6d6ff';
    const isik = Math.sin(shSeg(sec, 0.45, 0.95) * Math.PI) * (o.ikon === 'bulut' ? 0.16 : 0.35);
    if (isik > 0.003) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = isik; g.fillStyle = col; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    if (sec > 0.35) {
      g.globalCompositeOperation = 'lighter';
      const u = shSeg(sec, 0.35, 1), rot = tm * 0.9 + u * 4.5;
      for (let k = 0; k < 22; k++) {
        const a = k * (Math.PI * 2 / 22) + rot, rr = Math.hypot(W, H) * (0.05 + 0.65 * u) * (0.35 + (k % 4) * 0.2);
        const starSize = H * 0.018 * (1 + (k % 3) * 0.4), starAlpha = Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(k + tm * 3));
        shParilti(W / 2 + Math.cos(a) * rr, H * 0.5 + Math.sin(a) * rr * 0.72, starSize, starAlpha);
      }
      g.globalCompositeOperation = 'source-over';
    }
    const dk = shEase(shSeg(sec, 0.66, 1));
    if (dk > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(4,5,14,${dk})`; g.fillRect(0, 0, W, H); }
    if (sec >= 1 && !S2.gec) { S2.gec = 1; sh.secBitti = o; const f = S2.onSec; if (f) { try { f(o.id); } catch (e) { shHata('onSec', e); } } }
  } else if (gir < 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(4,5,14,${1 - gir})`; g.fillRect(0, 0, W, H); }
}
let shMoverX = -999, shMoverY = -999;
if (typeof document !== 'undefined') {
  const shCv = (typeof g !== 'undefined' && g && g.canvas) || document.getElementById('c');
  if (shCv) {
    shCv.addEventListener('pointerdown', e => { if (sh.mod === 'secim') shSecimDokun(e.clientX, e.clientY); });
    shCv.addEventListener('pointermove', e => { shMoverX = e.clientX; shMoverY = e.clientY; }, { passive: true });
  }
}

const SAHNE = {
  giris(bitince, opt) {
    opt = opt || {};
    const bolum = opt.bolum || 1, kisa = opt.kisa === true || (bolum >= 2 && opt.kisa !== false);
    shBalonBirak();
    sh.dan = sh.mod === 'secim' || kisa; sh.kisa = kisa; sh.fon = bolum === 5 ? 'volkan' : bolum === 4 ? 'deniz' : bolum === 1 ? 'orman' : bolum === 3 ? 'bulut' : 'gol'; sh.secBitti = null;
    sh.tema = bolum === 5 ? 'volkan' : bolum === 4 ? 'deniz' : bolum === 3 ? 'bulut' : bolum === 2 ? 'gol' : null; sh.uykuK = bolum === 5 ? 'p_v_uyku' : bolum === 4 ? 'p_i_uyku' : bolum === 3 ? 'p_b_uyku' : 'p_y_uyku';
    shOlc(); sh.mod = 'giris'; sh.t = 0; sh.nefesFaz = 0;  sh.kirpK = 0; sh.kalkis = null; sh.bitti = bitince; sh.atla = -1; sh.sesler = {}; sh.nefesN = -1; sh.zz.length = 0; sh.tam = false;
    sh.anlar = {}; sh.parca.length = 0; sh.camOturdu = 0; sh.izlendi = 0;
    sh.gBolum = bolum; sh.atlanabilir = shDahaOnce(bolum);   // atla düğmesi: bu rüya daha önce oynandıysa (her bölümde)
    sh.plan = kisa ? shKisaPlan() : shGirisPlan(); shKamera(W / 2, H / 2, 1, W / 2, H / 2);
    // pahalı önbellekler başlık ekranında parça parça hazırlandı; bitmediyse kalanı kareler arasında sürer (gerekirse çizimde biter)
    shGeceHazirla();
  },
  final(bitince, opt) {
    sh.fBolum = (opt && opt.bolum) || (typeof BOLUM_NO !== 'undefined' ? BOLUM_NO : 1); sh.kisa = false; sh.dan = false; sh.tema = null; shBalonBirak();
    shOlc(); sh.mod = 'final'; sh.t = 0; sh.kirpK = 0; sh.bitti = bitince; sh.sesler = {}; sh.tam = false; sh.cin = 0; sh.anlar = {}; sh.parca.length = 0; sh.kareOrt = 1 / 60; sh.kamYavas = 0; sh.sonK = null; sh.fo = null; sh.yakinHazir = 0;
    sh.plan = shFinalPlan(); shKamera(W / 2, H / 2, 1, W / 2, H / 2);
    shGeceBirak();   // gece önbellekleri (açılış sonunda zaten bırakıldı)
    // sabah odası ve yakın çekim kopyası kutlama sürerken parça parça hazırlanır (ışık dolunca gerekir)
    const k = () => sh.mod === 'final' || DURUM === 'son';
    setTimeout(() => { shOnceden('odaSabah', k); shOnceden('odaYakin', k); }, 1200);
  },
  secim(opts, onSec) { shSecimBaslat(opts, onSec); },
  secimDokun(x, y) { return shSecimDokun(x, y); },
  tamEkran() { return sh.tam || (sh.sonGorunum && DURUM === 'son'); },
  // bir ara sahne oynuyor mu (açılışın ışık çözülmesi dahil)? arayuz ipuçları bunu sorar
  aktif() { return !!sh.mod; },
  ciz(tm, dt) {
    if (!sh.mod && !sh.sonGorunum) return;
    shOlc();
    // çizimde bir hata olsa bile sahne ilerler ve sonunda oyuna geçer (Feza asla takılı kalmaz)
    const dene = fn => { try { fn(); } catch (e) { shHata('ciz:' + sh.mod, e); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } };
    if (sh.mod === 'giris') {
      sh.t += dt; shGirisGuncelle(dt);
      if (sh.mod === 'giris') { dene(() => shGirisCiz(tm, dt)); dene(() => shAtlaCiz(tm)); }
    } else if (sh.mod === 'secim') {
      dene(() => shSecimCiz(tm, dt));
    } else if (sh.mod === 'final') {
      sh.t += dt; shFinalGuncelle(dt);
      dene(() => shFinalCiz(tm, dt));
      if (sh.sonGorunum) { sh.mod = null; }
    } else if (sh.sonGorunum && DURUM === 'son') {
      // bitiş ekranının arkasında: Feza ile Pırıl görünür kalır (yatay ekranda solda, kart sağda; dikte üstte, kart altta);
      // Pırıl ara sıra yine göz kırpar
      const k = 1 - Math.exp(-dt * 1.2), yatay = W > H * 1.15;
      sh.kirpK = 1;
      const fx = shPX(shKucak.x + 3.8), fy = shPY(shKucak.y - 2.9);
      shKamera(lerp(sh.fx, fx, k), lerp(sh.fy, fy, k), lerp(sh.zoom, yatay ? 2.85 : 2.3, k), lerp(sh.tx, yatay ? W * 0.22 : W * 0.5, k), lerp(sh.ty, yatay ? H * 0.5 : H * 0.24, k));
      sh.sonT = (sh.sonT || 0) + dt;
      dene(() => shSabahCiz(tm, 99, null, (sh.sonT % 4.5) > 2.8));
      // kamera yerine oturdu ve yakın çekim kopyası ekranı kaplıyor: tam ekran sabah odası artık gerekmez (≈22 MB)
      if (sh.sabahY && sh.sonT > 3 && sh.odaSabah) sh.odaSabah = shBirak(sh.odaSabah);
      if (shDus) { shBirak(shDus.c); shDus = null; }
    }
  },
  // test kancası
  get _durum() { return { mod: sh.mod, t: sh.t, tam: sh.tam, plan: sh.plan }; },
};

// Uyuyan Yanardağ: seçim baloncuğu ve odadan rüyaya geçiş aynı resimli manzarayı paylaşır.
function sh5Fon(x,w,h) {
  const sky=x.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#2c3154');sky.addColorStop(.43,'#73517a');sky.addColorStop(.76,'#bd758e');sky.addColorStop(1,'#d59784');x.fillStyle=sky;x.fillRect(0,0,w,h);
  const haze=x.createRadialGradient(w*.61,h*.4,0,w*.61,h*.4,w*.48);haze.addColorStop(0,'#ffb87d38');haze.addColorStop(1,'#f08e7100');x.fillStyle=haze;x.fillRect(0,0,w,h);
  x.fillStyle='#fff5d7';x.beginPath();x.arc(w*.23,h*.19,Math.min(w,h)*.055,0,Math.PI*2);x.fill();
  for(let i=0;i<34;i++){const px=(Math.sin(i*72.18)*.5+.5)*w,py=(Math.cos(i*31.43)*.5+.5)*h*.47;x.globalAlpha=.25+(i%4)*.14;x.beginPath();x.arc(px,py,Math.max(.7,w*.0018)*(1+i%2),0,Math.PI*2);x.fill();}x.globalAlpha=1;
  for(let layer=0;layer<3;layer++){x.fillStyle=['#665779','#5a4b72','#4c4268'][layer];x.beginPath();x.moveTo(0,h);for(let i=0;i<=16;i++)x.lineTo(i*w/16,h*(.58+layer*.08)+Math.sin(i*.8+layer*2)*h*.047);x.lineTo(w,h);x.closePath();x.fill();}
  // Large folded basalt shoulders keep the crater gentle rather than jagged.
  const mountain=x.createLinearGradient(w*.35,h*.4,w*.8,h*.92);mountain.addColorStop(0,'#5a4066');mountain.addColorStop(.42,'#382c56');mountain.addColorStop(1,'#2b304f');x.fillStyle=mountain;x.beginPath();x.moveTo(w*.2,h*.88);x.bezierCurveTo(w*.4,h*.69,w*.45,h*.54,w*.53,h*.42);x.quadraticCurveTo(w*.59,h*.45,w*.65,h*.41);x.bezierCurveTo(w*.72,h*.59,w*.82,h*.75,w*1.05,h*.9);x.closePath();x.fill();
  const facets=[[[.2,.88],[.53,.42],[.48,.78]],[[.53,.42],[.6,.5],[.48,.78]],[[.65,.41],[.6,.5],[.85,.88]],[[.53,.42],[.46,.66],[.34,.78]],[[.65,.41],[.72,.6],[.68,.7]]];
  facets.forEach((p,i)=>{x.fillStyle=['#95689a2d','#c28ba22d','#1b1e3c65','#d39d9c1c','#b2618628'][i];x.beginPath();p.forEach((q,k)=>k?x.lineTo(q[0]*w,q[1]*h):x.moveTo(q[0]*w,q[1]*h));x.closePath();x.fill();});
  x.fillStyle='#4a294e';x.beginPath();x.ellipse(w*.589,h*.421,w*.06,h*.012,-.02,0,Math.PI*2);x.fill();x.fillStyle='#ff965f';x.beginPath();x.ellipse(w*.589,h*.423,w*.053,h*.007,-.02,0,Math.PI*2);x.fill();
  x.strokeStyle='#ffd790';x.lineWidth=w*.0045;x.lineCap='round';x.beginPath();x.moveTo(w*.531,h*.421);x.quadraticCurveTo(w*.59,h*.45,w*.648,h*.414);x.stroke();
  for(const side of[-1,1]){x.strokeStyle='#ed865f';x.lineWidth=w*.009;x.beginPath();x.moveTo(w*(.59+side*.035),h*.433);x.bezierCurveTo(w*(.59+side*.07),h*.56,w*(.58+side*.1),h*.65,w*(.59+side*.25),h*.87);x.stroke();x.strokeStyle='#ffd48e';x.lineWidth=Math.max(.8,w*.0018);x.stroke();}
  const river=x.createLinearGradient(0,h*.45,0,h);river.addColorStop(0,'#ffd084');river.addColorStop(.38,'#ff9c62');river.addColorStop(1,'#d85d68');x.fillStyle=river;x.beginPath();x.moveTo(w*.584,h*.44);x.bezierCurveTo(w*.55,h*.58,w*.74,h*.64,w*.57,h*.75);x.bezierCurveTo(w*.48,h*.82,w*.36,h*.89,w*.21,h);x.lineTo(w*.67,h);x.bezierCurveTo(w*.83,h*.86,w*.85,h*.75,w*.69,h*.68);x.bezierCurveTo(w*.6,h*.61,w*.65,h*.5,w*.611,h*.442);x.closePath();x.fill();
  x.strokeStyle='#ffe9b6a0';x.lineWidth=Math.max(1.5,w*.005);x.beginPath();x.moveTo(w*.6,h*.46);x.bezierCurveTo(w*.56,h*.6,w*.77,h*.65,w*.61,h*.77);x.bezierCurveTo(w*.52,h*.84,w*.47,h*.93,w*.48,h);x.stroke();
  for(let i=0;i<8;i++){const xx=w*(.05+i*.13),yy=h*(.88+Math.sin(i*2)*.045);x.fillStyle=i%2?'#353453':'#464063';x.beginPath();x.moveTo(xx-w*.075,h);x.lineTo(xx-w*.05,yy);x.lineTo(xx+w*.018,yy-h*.018);x.lineTo(xx+w*.08,h);x.fill();x.strokeStyle='#cbb3ba40';x.lineWidth=Math.max(1,w*.002);x.beginPath();x.moveTo(xx-w*.05,yy);x.lineTo(xx+w*.018,yy-h*.018);x.stroke();}
  for(const [px,py,sc,kind]of[[.13,.97,.084,0],[.87,.97,.096,1],[.96,1.03,.06,0]]){
    const r=Math.min(w,h)*sc;x.save();x.translate(w*px,h*py);x.strokeStyle='#4c8b86';x.lineWidth=Math.max(1,r*.065);x.beginPath();x.moveTo(0,r*.3);x.bezierCurveTo(-r*.34,-r*.2,r*.25,-r*.8,0,-r*1.3);x.stroke();
    for(const side of[-1,1]){x.fillStyle=side<0?'#4e8b88':'#697d99';x.beginPath();x.moveTo(0,-r*.2);x.quadraticCurveTo(side*r*.8,-r*.7,side*r*.65,-r*1.05);x.quadraticCurveTo(side*r*.12,-r*.85,0,-r*.2);x.fill();}
    x.translate(0,-r*1.3);for(let layer=0;layer<2;layer++)for(let j=0;j<7;j++){const len=r*(layer?.58:.94),wide=len*.34;x.save();x.rotate(j*Math.PI*2/7+layer*.4);const petal=x.createLinearGradient(-wide,-len,wide,0);petal.addColorStop(0,kind?'#e997d8':'#ff969e');petal.addColorStop(.5,kind?'#a345bd':'#d83e69');petal.addColorStop(1,kind?'#572a79':'#74254f');x.fillStyle=petal;x.beginPath();x.moveTo(0,len*.1);x.bezierCurveTo(-wide,-len*.2,-wide,-len*.7,0,-len);x.bezierCurveTo(wide,-len*.7,wide,-len*.2,0,len*.1);x.fill();x.strokeStyle='#f7c3c783';x.lineWidth=Math.max(.5,r*.012);x.beginPath();x.moveTo(0,0);x.lineTo(0,-len*.94);x.stroke();x.restore();}
    x.fillStyle='#f5c37c';x.beginPath();x.arc(0,0,r*.13,0,Math.PI*2);x.fill();x.restore();
  }
}
function sh5Canli(ox,oy,q,tm,a,hov) {
  g.save();g.globalAlpha=a*.7;g.strokeStyle='#fff0c6';g.lineWidth=Math.max(1,q*.007);
  for(let i=0;i<7;i++){const u=((tm*.12+i*.147)%1),xx=ox+q*(.59+Math.sin(i*4+u*3)*(.025+u*.07)),yy=oy+q*(.43-u*.3);g.globalAlpha=a*Math.sin(u*Math.PI)*.6;g.fillStyle=i%2?'#ffcca3':'#fff0ce';g.beginPath();g.ellipse(xx,yy,q*(.005+u*.003),q*(.01+u*.006),-.4,0,Math.PI*2);g.fill();}
  g.restore();
}
SH_ONBELLEK.push('volkan','onPlanV');
SH_KUR.volkan=()=>{const A={c:shTuval(),W,H,adim:[]};A.adim.push(()=>sh5Fon(A.c.getContext('2d'),W,H));return A;};
SH_KUR.onPlanV=()=>{const A={c:shTuval(),W,H,adim:[]};A.adim.push(()=>{const x=A.c.getContext('2d');x.fillStyle='#302b4caa';for(let i=0;i<7;i++){const px=i*W/6;x.beginPath();x.moveTo(px-W*.08,H);x.quadraticCurveTo(px-W*.04,H*.83,px,H*(.87+(i%3)*.03));x.lineTo(px+W*.08,H);x.fill();}});return A;};

// İnci Denizi rüya baloncuğu ve uyku geçişi aynı sualtı sanatını paylaşır; durağan doku önbellekte kalır.
function shDenizResim(x, d) {
  const gr = x.createLinearGradient(0, 0, 0, d); gr.addColorStop(0, '#135f97'); gr.addColorStop(0.35, '#154e8a'); gr.addColorStop(0.72, '#102f60'); gr.addColorStop(1, '#081d3b');
  x.fillStyle = gr; x.fillRect(0, 0, d, d);
  for (let i = 0; i < 5; i++) { x.fillStyle = 'rgba(102,236,231,0.15)'; x.beginPath(); x.moveTo(d * (0.1 + i * 0.18), 0); x.lineTo(d * (0.16 + i * 0.18), 0); x.lineTo(d * (0.46 + i * 0.18), d); x.lineTo(d * (0.26 + i * 0.18), d); x.fill(); }
  x.fillStyle = '#185578'; x.beginPath(); x.moveTo(0, d); x.lineTo(0, d * 0.65); x.bezierCurveTo(d * 0.3, d * 0.58, d * 0.64, d * 0.82, d, d * 0.61); x.lineTo(d, d); x.fill();
  const sand = x.createLinearGradient(0, d * 0.77, 0, d); sand.addColorStop(0, '#c8b687'); sand.addColorStop(1, '#557b89');
  x.fillStyle = sand; x.beginPath(); x.moveTo(0, d); x.lineTo(0, d * 0.82); x.bezierCurveTo(d * 0.35, d * 0.74, d * 0.62, d * 0.93, d, d * 0.79); x.lineTo(d, d); x.fill();
  x.lineCap = 'round';
  for (let j = 0; j < 6; j++) { const px = d * (j < 3 ? 0.12 + j * 0.07 : 0.77 + (j - 3) * 0.07), py = d * 0.87, h = d * (0.18 + j % 3 * 0.035); x.strokeStyle = j % 2 ? '#e882b7' : '#63cdb9'; x.lineWidth = d * 0.014;
    x.beginPath(); x.moveTo(px, py); x.bezierCurveTo(px - d * 0.02, py - h * 0.4, px + d * 0.018, py - h * 0.8, px, py - h); x.stroke();
    for (let k = 0; k < 3; k++) { const yy = py - h * (0.3 + k * 0.2), s = k % 2 ? -1 : 1; x.beginPath(); x.moveTo(px, yy); x.quadraticCurveTo(px + s * d * 0.055, yy - d * 0.01, px + s * d * 0.047, yy - d * 0.045); x.stroke(); }
  }
  const halo = x.createRadialGradient(d * 0.51, d * 0.77, 0, d * 0.51, d * 0.77, d * 0.28); halo.addColorStop(0, 'rgba(255,216,117,0.25)'); halo.addColorStop(0.35, 'rgba(184,204,183,0.09)'); halo.addColorStop(1, 'rgba(99,161,190,0)'); x.fillStyle = halo; x.fillRect(0, d * 0.45, d, d * 0.55);
  shDenizKabuk(x, d * 0.51, d * 0.835, d * 0.165);
  shDenizAti(x, d * 0.265, d * 0.565, d * 0.105);
  x.strokeStyle = '#ead6c9'; x.lineWidth = d * 0.008;
  for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(d * 0.51, d * 0.87); x.lineTo(d * (0.36 + i * 0.05), d * (0.81 - Math.sin(i / 6 * Math.PI) * 0.035)); x.stroke(); }
  const pearl = x.createRadialGradient(d * 0.49, d * 0.74, 0, d * 0.51, d * 0.77, d * 0.064); pearl.addColorStop(0, '#fff8df'); pearl.addColorStop(0.48, '#daeecf'); pearl.addColorStop(1, '#a2c9c6'); x.fillStyle = pearl; x.beginPath(); x.arc(d * 0.51, d * 0.77, d * 0.061, 0, Math.PI * 2); x.fill();
  x.strokeStyle = 'rgba(247,253,231,0.8)'; x.lineWidth = d * 0.003; x.beginPath(); x.arc(d * 0.51, d * 0.77, d * 0.057, 3.5, 5.1); x.stroke();
  const sr = rng(43); x.fillStyle = 'rgba(230,241,211,0.22)'; for (let i = 0; i < 90; i++) { const xx = sr() * d, yy = d * (0.86 + sr() * 0.14); x.beginPath(); x.ellipse(xx, yy, d * (0.002 + sr() * 0.002), d * 0.0013, sr(), 0, Math.PI * 2); x.fill(); }
  for (let i = 0; i < 5; i++) { const px = d * (0.17 + i * 0.14), py = d * (0.37 + Math.sin(i * 1.8) * 0.08); x.fillStyle = i % 2 ? '#dbb2cb' : '#bddfcb'; x.beginPath(); x.ellipse(px, py, d * 0.026, d * 0.014, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.moveTo(px - d * 0.02, py); x.lineTo(px - d * 0.044, py - d * 0.018); x.lineTo(px - d * 0.044, py + d * 0.018); x.fill(); x.fillStyle = '#41657a'; x.beginPath(); x.arc(px + d * 0.015, py - d * 0.003, d * 0.0025, 0, Math.PI * 2); x.fill(); x.strokeStyle = 'rgba(244,246,218,0.7)'; x.lineWidth = d * 0.002; x.beginPath(); x.ellipse(px, py, d * 0.02, d * 0.008, 0, 3.6, 5.2); x.stroke(); }
}
function shDenizFonAdim() {
  const c = shTuval(), x = c.getContext('2d');
  return { c, W, H, adim: [() => { x.save(); x.scale(W / Math.max(W, H), H / Math.max(W, H)); shDenizResim(x, Math.max(W, H)); x.restore(); }] };
}
function shDenizDalga(tm, a) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 0.09 * a; g.strokeStyle = '#c8f7e3'; g.lineWidth = Math.max(2, H * 0.004);
  for (let k = 0; k < 5; k++) { g.beginPath(); for (let i = 0; i <= 16; i++) { const px = W * i / 16, py = H * (0.17 + k * 0.145) + Math.sin(i * 0.6 + tm * 0.7 + k) * H * 0.016; if (!i) g.moveTo(px, py); else g.lineTo(px, py); } g.stroke(); } g.restore();
}
function shDenizSabah(tm) {
  shResimT(); g.save(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.065; g.fillStyle = '#75d6cd'; g.fillRect(0, 0, W, H); g.restore();
  shDenizDalga(tm * 0.35, 0.38);
  // Rüyadan kalan sakin su yansımaları, yalnız bu sabahın pencere ışığında.
  shOdaT(); g.save(); shPencereYol(g, 0); g.clip(); g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const yy = 31 + i * 4.3, swing = Math.sin(tm * .42 + i) * .45; g.strokeStyle = i % 2 ? 'rgba(255,241,202,.15)' : 'rgba(161,228,221,.19)'; g.lineWidth = .18; g.beginPath(); g.moveTo(14, yy); g.bezierCurveTo(20, yy - 1.3 + swing, 32, yy + 1.8 - swing, 40, yy - .2); g.stroke(); }
  g.restore();
}

function shDenizOnPlan() {
  const c = shTuval(), x = c.getContext('2d'); x.lineCap = 'round';
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
    const px = side < 0 ? W * (0.015 + i * 0.014) : W * (0.985 - i * 0.014), py = H * 1.03, h = H * (0.08 + (i % 3) * 0.035);
    x.strokeStyle = i % 2 ? '#244c60' : '#2b626c'; x.lineWidth = Math.max(2, H * 0.006);
    x.beginPath(); x.moveTo(px, py); x.bezierCurveTo(px + side * 8, py - h * 0.4, px - side * 13, py - h * 0.75, px, py - h); x.stroke();
    for (let k = 0; k < 3; k++) { const yy = py - h * (0.25 + k * 0.21); x.beginPath(); x.moveTo(px, yy); x.quadraticCurveTo(px - side * W * 0.028, yy - h * 0.04, px - side * W * 0.024, yy - h * 0.24); x.stroke(); }
  }
  return c;
}

function shDenizKabuk(x, cx, cy, r) {
  x.save(); x.translate(cx, cy); x.scale(r, r);
  const cup = x.createLinearGradient(0, -0.4, 0, 0.28); cup.addColorStop(0, '#ecd4c8'); cup.addColorStop(0.42, '#c2a8b8'); cup.addColorStop(1, '#71839d');
  x.fillStyle = cup; x.beginPath(); x.moveTo(-1, -0.04); x.bezierCurveTo(-0.95, -0.3, -0.6, -0.42, 0, -0.37); x.bezierCurveTo(0.6, -0.42, 0.95, -0.3, 1, -0.04); x.bezierCurveTo(0.6, 0.37, -0.6, 0.37, -1, -0.04); x.fill();
  x.strokeStyle = 'rgba(246,218,207,0.86)'; x.lineWidth = 0.035; x.beginPath(); x.moveTo(-0.96, -0.03); x.bezierCurveTo(-0.52, 0.22, 0.52, 0.22, 0.96, -0.03); x.stroke();
  x.strokeStyle = 'rgba(136,125,158,0.52)'; x.lineWidth = 0.018;
  for (let i = 0; i < 9; i++) { const u = (i - 4) / 4; x.beginPath(); x.moveTo(u * 0.12, 0.25); x.quadraticCurveTo(u * 0.65, 0.13, u * 0.95, -0.075 - (1 - Math.abs(u)) * 0.25); x.stroke(); }
  x.fillStyle = 'rgba(67,94,114,0.13)'; x.beginPath(); x.ellipse(0, -0.07, 0.39, 0.065, 0, 0, Math.PI * 2); x.fill(); x.restore();
}
function shDenizAti(x, cx, cy, r) {
  x.save(); x.translate(cx, cy); x.scale(r, r); x.lineCap = 'round';
  const body = x.createLinearGradient(-0.15, -0.7, 0.4, 0.6); body.addColorStop(0, '#f2d5bd'); body.addColorStop(0.5, '#d9a8ad'); body.addColorStop(1, '#ae90b4');
  x.strokeStyle = '#b4cdbd'; x.lineWidth = 0.12; x.beginPath(); x.moveTo(-0.14, -0.25); x.bezierCurveTo(-0.4, -0.18, -0.47, 0.13, -0.24, 0.25); x.stroke();
  x.fillStyle = body; x.beginPath(); x.moveTo(0.02, -0.45); x.bezierCurveTo(-0.25, -0.2, -0.29, 0.04, -0.13, 0.28); x.bezierCurveTo(0.11, 0.57, -0.04, 0.91, -0.28, 0.75); x.bezierCurveTo(-0.45, 0.64, -0.34, 0.45, -0.2, 0.51); x.bezierCurveTo(-0.28, 0.54, -0.3, 0.64, -0.21, 0.66); x.bezierCurveTo(0.06, 0.7, 0.03, 0.48, -0.02, 0.38); x.bezierCurveTo(-0.24, 0.1, -0.11, -0.22, 0.1, -0.37); x.closePath(); x.fill();
  x.fillStyle = body; x.beginPath(); x.ellipse(0.05, -0.52, 0.29, 0.24, -0.1, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(0.31, -0.42, 0.22, 0.105, 0.12, 0, Math.PI * 2); x.fill();
  x.strokeStyle = 'rgba(243,220,193,0.64)'; x.lineWidth = 0.036; x.beginPath(); x.moveTo(-0.1, -0.26); x.quadraticCurveTo(-0.19, 0.06, -0.04, 0.25); x.stroke();
  x.fillStyle = '#42637a'; x.beginPath(); x.arc(0.19, -0.55, 0.047, 0, Math.PI * 2); x.fill(); x.fillStyle = '#f7f6db'; x.beginPath(); x.arc(0.202, -0.565, 0.016, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#7da7a0'; x.lineWidth = 0.038; x.beginPath(); x.moveTo(-0.14, -0.76); x.lineTo(-0.16, -0.83); x.lineTo(-0.08, -0.8); x.lineTo(-0.01, -0.9); x.lineTo(0.025, -0.77); x.stroke(); x.restore();
}

// Son beş saniye: oda açıkça sualtı rüyasına dönüşür, iki arkadaş görünür şekilde yüzmeye başlar.
function shDenizGirisCiz(tm, t, P0) {
  const fon = shDenizOyunResmi(tm), u = shEase(shSeg(t, P0.b3, P0.b4)), sc = Math.min(W / 750, H / 420);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  if (u < 1) { sh.denizBase = true; try { shGirisCiz(tm, 0); } finally { sh.denizBase = false; } g.setTransform(1, 0, 0, 1, 0, 0); }
  g.globalAlpha = u; g.drawImage(fon, 0, 0); g.globalAlpha = 1; shDenizDalga(tm, 0.5 * u);
  // Büyük su damlaları yukarı yükselir; parlak çizgi değil, saydam kabuk ve ufak yansıma.
  g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = 'rgba(137,239,228,0.45)'; g.lineWidth = Math.max(1, sc * 0.6);
  for (let i = 0; i < 9; i++) { const bx = W * (0.08 + i * 0.108) + Math.sin(tm * 0.4 + i) * W * 0.012, by = H * (0.85 - ((tm * 0.07 + i * 0.103) % 0.76)), r = sc * (4 + i % 3 * 2); g.globalAlpha = u * 0.7; g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.stroke(); }
  const enter = shEase(shSeg(u, 0.25, 0.9));
  // son ~2 sn: kamera/karakterler oyunun başlangıç çerçevesine (Feza ve Pırıl'ın oyundaki ekran yeri ve boyu) yumuşakça oturur
  const kk = shEase(shSeg(t, P0.son - 2.0, P0.son - 0.15)), LF = shCanliFeza(), LD = (typeof D !== 'undefined' && typeof cam !== 'undefined') ? { x: (D.x - cam.x) * S, y: (D.y - cam.y) * S } : null;
  const fx0 = W * (0.24 + 0.17 * enter), fy0 = H * (0.6 - 0.08 * enter) + Math.sin(tm * 1.5) * sc * 2;
  const fx = lerp(fx0, LF.x, kk), fy = lerp(fy0, LF.y + 30 * S, kk), fsc = lerp(sc * 1.7, S * 1.4, kk);
  g.globalAlpha = enter;
  if (typeof fezaCizPoz === 'function') fezaCizPoz(g, fx, fy, fsc, 'yuzme', tm, null, { vy: -18, isik: 0 });
  if (typeof pirilCizPoz === 'function') pirilCizPoz(g, lerp(fx0 - sc * 20, LD ? LD.x : fx0 - sc * 20, kk), lerp(fy0 - sc * 90, LD ? LD.y : fy0 - sc * 90, kk), lerp(sc * 1.8, S * 1.0, kk), 'ucus', tm);
  g.globalAlpha = 1;
  if (enter > 0.65 && typeof dnzAtCiz === 'function' && typeof DNZ !== 'undefined' && DNZ.ati[0]) {
    const o = DNZ.ati[0], px = W * 0.72, py = H * 0.51 + Math.sin(tm * 1.1) * sc * 5;
    g.globalCompositeOperation = 'lighter'; dglow('#ffc987', px, py - 18 * sc, sc * 38, 0.14 * enter); g.globalCompositeOperation = 'source-over';
    dnzAtCiz(g, px, py, sc * 0.46, tm, o.dnz.renk, true, 0, null);
  }
  // sahne sonunda kararma YOK: son kare oyunun ilk karesine yumuşak çapraz geçişle bağlanır (oyun.js omGecisKare)
  g.restore();
}

function shDenizOyunResmi(tm) {
  if (sh.denizOyun) return sh.denizOyun;
  if (BOLUM_NO !== 4 || typeof dn4Background !== 'function' || typeof dn4World !== 'function') return shHazir('deniz');
  // Tek karelik gerçek bölüm resmi: aynı kaplamalar/mercanlar, fotoğraf gibi önbellekte; açılışta ikinci dünya çizim yükü olmaz.
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = '#082145'; g.fillRect(0, 0, W, H);
  dn4Background(tm); dn4World(tm); if (typeof dn4Foreground === 'function') dn4Foreground(tm);
  const c = shTuval(); c.getContext('2d').drawImage(g.canvas, 0, 0); g.restore();
  return sh.denizOyun = c;
}

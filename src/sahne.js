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

// ── renk paletleri: gece / sabah ──
const SH_GECE = {
  wallTop: '#10173a', wallBot: '#1b2756', paper: '#9fb2ff', paperA: 0.09, base: '#0c1230', baseHi: '#2c3a78',
  floorTop: '#1c1a3e', floorBot: '#0a0a1d', seam: 'rgba(0,0,0,0.28)', seamHi: 'rgba(140,160,255,0.06)',
  frame: '#262c5c', frameHi: '#55639f', glassTop: '#081430', glassBot: '#1f3f73', sky: 'gece',
  stand: '#251f45', standHi: '#3a3268', standD: '#16122e', pic: '#2d2858', picBg: '#232a55', picA: 0.55,
  rod: '#3b3570', curtain: ['#2c2f6e', '#3d4290', '#23255a'], tie: '#6f6ab8',
  bed: '#3a2f63', bedHi: '#54488a', bedD: '#231c42', sheet: '#3f4f8c', sheetHi: '#5a6cb0', pillow: '#5c6aa8', pillowHi: '#8090cc',
  blanket: '#2e4486', blanketHi: '#4562b0', blanketD: '#1c2c60', star: '#ffe6a8', starA: 0.55,
  rug: '#3a2c66', rugRing: '#5a4796', rugDot: '#8e78d6', amb: 'rgba(30,40,110,0.0)',
};
const SH_SABAH = {
  wallTop: '#fbe9d2', wallBot: '#f0cfae', paper: '#ffffff', paperA: 0.32, base: '#e2b893', baseHi: '#fff1de',
  floorTop: '#d7a57a', floorBot: '#a9744f', seam: 'rgba(120,66,34,0.22)', seamHi: 'rgba(255,240,215,0.25)',
  frame: '#fff7ec', frameHi: '#ffffff', glassTop: '#a9d8ff', glassBot: '#ffe8c8', sky: 'sabah',
  stand: '#e0ae84', standHi: '#f3c9a0', standD: '#b98563', pic: '#e7b07a', picBg: '#fffaf0', picA: 1,
  rod: '#c99a6c', curtain: ['#8fb0ea', '#b4cbf5', '#7393d6'], tie: '#ffd27a',
  bed: '#e2a878', bedHi: '#f6c99a', bedD: '#b47c55', sheet: '#f5f2ff', sheetHi: '#ffffff', pillow: '#ffffff', pillowHi: '#ffffff',
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
  zoom: 1, fx: 0, fy: 0, k0: 1, wu: 133,
  oda: null, odaSabah: null, orman: null, bw: 0, bh: 0,
  parca: [], zz: [],
};

// ── ölçüler & dönüşümler ──
function shOlc() {
  if (sh.bw !== W || sh.bh !== H) { sh.oda = sh.odaSabah = sh.orman = null; sh.bw = W; sh.bh = H; }
  sh.k0 = H / 100; sh.wu = 100 * W / H;
}
const shPX = x => W / 2 + x * sh.k0;           // oda birimi → piksel (zoom yok)
const shPY = y => y * sh.k0;
function shOdaT(ctx = g) {                       // oda koordinatı + zoom
  const z = sh.zoom, a = sh.k0 * z;
  ctx.setTransform(a, 0, 0, a, sh.fx + (W / 2 - sh.fx) * z, sh.fy * (1 - z));
}
function shResimT() { const z = sh.zoom; g.setTransform(z, 0, 0, z, sh.fx * (1 - z), sh.fy * (1 - z)); }
function shEkranX(x) { return sh.fx + (shPX(x) - sh.fx) * sh.zoom; }
function shEkranY(y) { return sh.fy + (shPY(y) - sh.fy) * sh.zoom; }
function shTuval() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }

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
function shOdaCiz(p) {
  const c = shTuval(), x = c.getContext('2d');
  const k = sh.k0, L = -sh.wu / 2 - 1, R = sh.wu / 2 + 1;
  x.setTransform(k, 0, 0, k, W / 2, 0);
  // duvar
  let gr = x.createLinearGradient(0, 0, 0, SH_ZEMIN);
  gr.addColorStop(0, p.wallTop); gr.addColorStop(1, p.wallBot);
  x.fillStyle = gr; x.fillRect(L, -1, R - L, SH_ZEMIN + 1);
  // duvar kâğıdı: küçük yıldızlar ve hilaller (seyrek, ofsetli ızgara)
  x.fillStyle = p.paper; x.globalAlpha = p.paperA;
  for (let row = 0, y = 6; y < SH_ZEMIN - 4; row++, y += 9) {
    for (let xx = L + (row % 2 ? 4.5 : 0); xx < R; xx += 9) {
      if ((Math.round(xx * 7 + y * 3) & 3) === 0) { x.beginPath(); x.arc(xx, y, 1.15, 0, 6.283); x.moveTo(xx + 1.5, y - 0.35); x.arc(xx + 0.55, y - 0.35, 0.95, 0, 6.283); x.fill('evenodd'); }
      else { shYildiz5(x, xx, y, 0.85); x.fill(); }
    }
  }
  x.globalAlpha = 1;
  // pencereden duvara düşen ışık (yumuşak)
  gr = x.createRadialGradient(27, 32, 2, 27, 32, 46);
  gr.addColorStop(0, p.sky === 'gece' ? 'rgba(140,175,255,0.16)' : 'rgba(255,240,205,0.45)'); gr.addColorStop(1, 'rgba(140,175,255,0)');
  x.fillStyle = gr; x.fillRect(L, -1, R - L, SH_ZEMIN + 1);
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
    x.fillStyle = '#eef3ff'; x.beginPath(); x.arc(33, 21, 2.6, 0, 6.283); x.moveTo(36.6, 20.1); x.arc(34.3, 20.1, 2.3, 0, 6.283); x.fill('evenodd');
    // pencerenin dışında uzak ağaç siluetleri
    x.fillStyle = '#0a1532';
    for (let i = 0; i < 6; i++) { const tx = P0.x0 - 2 + i * 5.5; x.beginPath(); x.arc(tx, P0.alt - 2 + (i % 2) * 1.5, 4 + (i % 3), 0, 6.283); x.fill(); }
    x.fillRect(P0.x0 - 2, P0.alt - 2, 30, 4);
  } else {
    // sabah: yumuşak bulutlar, güneşin parıltısı
    const sg = x.createRadialGradient(36, 18, 0, 36, 18, 16); sg.addColorStop(0, 'rgba(255,250,225,1)'); sg.addColorStop(0.3, 'rgba(255,240,200,0.6)'); sg.addColorStop(1, 'rgba(255,240,200,0)');
    x.fillStyle = sg; x.fillRect(14, 2, 30, 34);
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
  // duvardaki çocuk resmi: mor ejderha + yıldız (Feza çizmiş)
  const fx0 = -17, fy0 = 21, fw = 14, fh = 11;
  x.fillStyle = p.pic; shRR(x, fx0 - 0.9, fy0 - 0.9, fw + 1.8, fh + 1.8, 0.6); x.fill();
  x.fillStyle = p.picBg; x.fillRect(fx0, fy0, fw, fh);
  x.save(); x.beginPath(); x.rect(fx0, fy0, fw, fh); x.clip();
  x.globalAlpha = p.picA;
  x.fillStyle = '#7bc96f'; x.beginPath(); x.ellipse(fx0 + 7, fy0 + fh + 1, 9, 3.4, 0, 0, 6.283); x.fill();
  x.fillStyle = '#9a6cf0'; x.beginPath(); x.ellipse(fx0 + 6.4, fy0 + 6.8, 3, 2.2, -0.2, 0, 6.283); x.fill();
  x.beginPath(); x.arc(fx0 + 9.2, fy0 + 5, 1.6, 0, 6.283); x.fill();
  x.beginPath(); x.moveTo(fx0 + 5.5, fy0 + 5.4); x.lineTo(fx0 + 4.2, fy0 + 2.4); x.lineTo(fx0 + 7.4, fy0 + 4.8); x.fill();
  x.fillStyle = '#ffffff'; x.beginPath(); x.arc(fx0 + 9.7, fy0 + 4.8, 0.45, 0, 6.283); x.fill();
  x.fillStyle = '#ffd34d'; shYildiz5(x, fx0 + 11.6, fy0 + 2.4, 1.5); x.fill();
  x.strokeStyle = '#ff8fb8'; x.lineWidth = 0.35; x.beginPath(); x.moveTo(fx0 + 1.4, fy0 + 2); x.quadraticCurveTo(fx0 + 2.6, fy0 + 0.8, fx0 + 3.4, fy0 + 2.2); x.stroke();
  x.globalAlpha = 1; x.restore();
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
  x.setTransform(1, 0, 0, 1, 0, 0);
  gr = x.createRadialGradient(W / 2, H * 0.55, H * 0.35, W / 2, H * 0.55, Math.hypot(W, H) * 0.62);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, p.sky === 'gece' ? 'rgba(2,3,14,0.6)' : 'rgba(120,60,30,0.22)');
  x.fillStyle = gr; x.fillRect(0, 0, W, H);
  return c;
}

// ══════════════════ ORMAN FONU (önbelleğe) – oyunun gece paletiyle ══════════════════
function shOrmanCiz() {
  const c = shTuval(), x = c.getContext('2d');
  const k = sh.k0, L = -sh.wu / 2 - 2, R = sh.wu / 2 + 2;
  x.setTransform(k, 0, 0, k, W / 2, 0);
  let gr = x.createLinearGradient(0, 0, 0, 82);
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
  return c;
}

// ══════════════════ KARAKTERLER ══════════════════
// x, y oda birimi; olc = oyundaki boya göre ölçek (1 = oyundaki boy)
// kucakPoz: Feza'nın kollarının arasına çizilecek Pırıl pozu (null = boş kucak). Dönüş: kucak noktası (oda birimi).
const shKucak = { x: SH_PIRIL.x, y: SH_PIRIL.y };
function shFeza(x, y, olc, poz, tm, kucakPoz, kucakU, kucakTm) {
  const pxu = sh.k0 * sh.zoom;
  if (typeof fezaCizPoz === 'function') {
    g.save(); const px = shEkranX(x), py = shEkranY(y);
    g.setTransform(1, 0, 0, 1, 0, 0);
    const ara = kucakPoz && typeof pirilCizPoz === 'function' ? (c, kx, ky, o) => {
      try { pirilCizPoz(c, kx, ky, o * 0.92, kucakPoz, kucakTm == null ? tm : kucakTm, kucakU); } catch (e) { shHata('pirilCizPoz', e); }
    } : null;
    try {
      const k = fezaCizPoz(g, px, py, olc * S * sh.zoom, poz, tm, ara);
      if (k) { shKucak.x = (k.x - shEkranX(0)) / pxu; shKucak.y = (k.y - shEkranY(0)) / pxu; }
    } catch (e) { shHata('fezaCizPoz', e); }
    g.restore(); return;
  }
  shFezaYedek(x, y, olc * 100 / VH, poz, tm);
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
  for (const yon of [-1, 1]) {
    const kenar = yon < 0 ? SH_PEN.x0 - 4.5 : SH_PEN.x1 + 4.5;
    for (let i = 0; i < SH_KAT.length; i++) {
      const [ux, ak, w0, boy] = SH_KAT[i];
      const yayil = lerp(1, 2.6, c) + (acik || 0) * 0.5;
      const tx = kenar - yon * ux * 0.55 * yayil + yon * c * (i - 1.5) * 1.2 + (acik ? -yon * 1.5 * acik : 0);
      const ust = lerp(9.6, -4 - (i % 2) * 3, shEase(c));
      const alt = lerp(58 + (i % 2) * 0.8, ust + boy * 0.9, shEase(c));
      const w = lerp(w0, 0.75, shEase(c));
      const salin = Math.sin(tm * (0.7 + i * 0.13) + i * 1.7 + yon) * (0.35 + c * 1.6);
      const bx = tx + ak * yon * (1 - c) * 0.6 + salin, mx = (tx + bx) / 2 + salin * 0.4;
      // bağlama (tie-back) etkisi: gece kapalıya yakın, sabah biraz açık
      const bel = lerp(0, -yon * 1.4, (1 - c) * (acik || 0));
      const ort = (ust + alt) / 2;
      const col = shMix(p.curtain[i % 2], '#1e5b54', c), colD = shMix(p.curtain[2], '#0e3330', c);
      g.beginPath();
      g.moveTo(tx - w / 2, ust);
      g.quadraticCurveTo(mx - w / 2 + bel, ort, bx - w / 2, alt);
      // etek: küçük dalgalı kıvrım
      g.quadraticCurveTo(bx, alt + 0.9 * (1 - c) + 0.3, bx + w / 2, alt);
      g.quadraticCurveTo(mx + w / 2 + bel, ort, tx + w / 2, ust);
      g.closePath();
      const gr = g.createLinearGradient(tx - w / 2, 0, tx + w / 2, 0);
      gr.addColorStop(0, colD); gr.addColorStop(0.45, col); gr.addColorStop(1, colD);
      g.fillStyle = gr; g.fill();
      // sarmaşık yaprakları
      if (c > 0.25) {
        const lc = shSeg(c, 0.25, 1), n = Math.floor((alt - ust) / 4.2);
        for (let j = 1; j <= n; j++) {
          const tt = j / (n + 0.6), yy = lerp(ust, alt, tt);
          const xx = lerp(lerp(tx, mx + bel, tt), lerp(mx + bel, bx, tt), tt);
          const sc = lc * shEase(clamp(lc * 1.6 - tt * 0.6, 0, 1)) * (0.8 + ((i + j) % 3) * 0.15);
          if (sc < 0.05) continue;
          const sag = (i + j) % 2 ? 1 : -1, a = sag * (0.7 + Math.sin(tm * 1.3 + j + i) * 0.12);
          g.save(); g.translate(xx, yy); g.rotate(a); g.scale(sc, sc);
          g.fillStyle = j % 3 ? '#2c7a6a' : '#3b9a7e';
          g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(1.6 * sag, -0.9, 3.2 * sag, 0); g.quadraticCurveTo(1.6 * sag, 0.9, 0, 0); g.fill();
          g.restore();
        }
      }
    }
  }
  // sarmaşık uçlarında ışıklı tomurcuklar
  if (c > 0.5) {
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const a = shSeg(c, 0.5, 1);
    for (const yon of [-1, 1]) {
      const kenar = yon < 0 ? SH_PEN.x0 - 4.5 : SH_PEN.x1 + 4.5;
      for (let i = 0; i < SH_KAT.length; i++) {
        const [ux, , , boy] = SH_KAT[i], yayil = 2.6;
        const tx = kenar - yon * ux * 0.55 * yayil + yon * (i - 1.5) * 1.2 + Math.sin(tm * (0.7 + i * 0.13) + i * 1.7 + yon) * 1.9;
        const alt = -4 - (i % 2) * 3 + boy * 0.9;
        const px = shEkranX(tx), py = shEkranY(alt), r = sh.k0 * sh.zoom;
        dglow('#7fe8ff', px, py + r * 0.8, r * 3.5, a * (0.55 + 0.2 * Math.sin(tm * 2 + i)));
        dglow('#ffffff', px, py + r * 0.8, r * 0.9, a * 0.7);
      }
    }
    g.globalCompositeOperation = 'source-over';
  }
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
    // başlık (yuvarlak tepeli) + ayak ucu
    g.fillStyle = p.bedD; shRR(g, Y.x0 - 3, 43 + bat, 4.2, 37, 1.4); g.fill();
    g.fillStyle = p.bed; shRR(g, Y.x0 - 2.6, 43 + bat, 3.2, 36, 1.4); g.fill();
    g.fillStyle = p.bedHi; g.fillRect(Y.x0 - 2.2, 44.5 + bat, 0.5, 33);
    g.beginPath(); g.arc(Y.x0 - 0.9, 42.2 + bat, 1.6, 0, 6.283); g.fillStyle = p.bed; g.fill();
    // başlıkta küçük yıldız oyması
    g.fillStyle = p.bedHi; shYildiz5(g, Y.x0 - 0.9, 49 + bat, 0.9); g.fill();
    g.fillStyle = p.bedD; shRR(g, Y.x1 - 0.5, 53 + bat, 3.6, 27, 1.2); g.fill();
    g.fillStyle = p.bed; shRR(g, Y.x1 - 0.2, 53 + bat, 2.8, 26, 1.2); g.fill();
    g.beginPath(); g.arc(Y.x1 + 1.2, 52.4 + bat, 1.3, 0, 6.283); g.fill();
    // ayaklar
    g.fillStyle = p.bedD; g.fillRect(Y.x0 + 2, 70 + bat, 2, 9); g.fillRect(Y.x1 - 5, 70 + bat, 2, 9);
    // yatak gövdesi (çerçeve)
    g.fillStyle = p.bed; shRR(g, Y.x0, 66 + bat, Y.x1 - Y.x0, 6.5, 1); g.fill();
    g.fillStyle = p.bedHi; g.globalAlpha = fa * 0.7; g.fillRect(Y.x0 + 1, 66.3 + bat, Y.x1 - Y.x0 - 2, 0.45); g.globalAlpha = fa;
    // çarşaf/şilte
    g.fillStyle = p.sheet; shRR(g, Y.x0 + 0.5, Y.ust, Y.x1 - Y.x0 - 1, 6.6, 1.6); g.fill();
    g.globalAlpha = 1;
  }
  // yastık → yumuşak yosun yastığı
  const yx = Y.x0 + 6.6, yy = Y.ust - 2.4;
  g.fillStyle = shMix(p.pillow, '#245e56', b);
  g.beginPath(); g.ellipse(yx, yy, 7, 3.1, -0.05, 0, 6.283); g.fill();
  g.fillStyle = shMix(p.pillowHi, '#3d8a78', b, 0.6);
  g.beginPath(); g.ellipse(yx - 1, yy - 1.1, 4.8, 1.3, -0.05, 0, 6.283); g.fill();
}
function shBattaniye(p, b, tm, nefes, otur = 0) {
  shOdaT();
  const Y = SH_YATAK, n = nefes || 0, bb = shEase(b);
  const kalcaH = lerp(3.2 + n * 0.35, 0.9, otur), dizH = lerp(1.6, 2.2, otur);
  const ust = (xx) => {   // battaniyenin üst kenarı (Feza'nın gövdesinin üstünden geçer)
    const t = (xx - -38) / 41;
    const kalca = Math.exp(-Math.pow((xx + 25.5) / 4.6, 2)) * kalcaH, diz = Math.exp(-Math.pow((xx + 17 + otur * 3) / 4, 2)) * dizH;
    return 58.8 - kalca - diz + t * 0.6 - Math.max(0, -(xx + 33)) * 0.1;
  };
  const x0 = lerp(-38, -34.5, otur), x1 = Y.x1 + 0.6, altY = lerp(69.6, SH_YER + 2, bb);
  // yatak örtüsü (b=0) → yumuşak yosun tepeciği (b=1): kenar noktaları birlikte kayar
  const sagK = { x: lerp(x1 + 2.2, x1 + 8, bb), y: lerp(ust(x1) + 1, ust(x1) + 1.5, bb) };
  const sagA = { x: lerp(x1 + 2, x1 + 15, bb), y: altY };
  const solA = { x: lerp(x0 - 1, -64, bb), y: altY };
  const solK1 = { x: lerp(x0 - 2.4, -55, bb), y: lerp(altY - 1, 70, bb) }, solK2 = { x: lerp(x0 - 2.2, -50, bb), y: lerp(65.6, 60.4, bb) };
  g.beginPath();
  g.moveTo(x0, ust(x0));
  for (let xx = x0; xx <= x1; xx += 1) g.lineTo(xx, ust(xx));
  g.quadraticCurveTo(sagK.x, sagK.y, sagA.x, sagA.y);
  const dal = 0.5 * (1 - bb);
  for (let xx = sagA.x; xx >= solA.x; xx -= 2) g.lineTo(xx, altY + Math.sin(xx * 0.9) * dal);
  g.bezierCurveTo(solK1.x, solK1.y, solK2.x, solK2.y, x0 - 0.5 * bb, ust(x0) + 1.2 * bb);
  g.closePath();
  const gr = g.createLinearGradient(0, 52, 0, altY);
  gr.addColorStop(0, shMix(p.blanketHi, '#2f8a72', bb)); gr.addColorStop(0.3, shMix(p.blanket, '#1d5f52', bb)); gr.addColorStop(1, shMix(p.blanketD, '#06141c', bb));
  g.fillStyle = gr; g.fill();
  // kat izi
  g.strokeStyle = shMix(p.blanketHi, '#46a88a', bb, 0.55); g.lineWidth = 0.45;
  g.beginPath(); for (let xx = x0 + 1; xx <= x1; xx += 1) g.lineTo(xx, ust(xx) + 0.9); g.stroke();
  // yıldız deseni (kaybolur)
  if (b < 0.98) {
    g.fillStyle = p.star; g.globalAlpha = p.starA * (1 - bb);
    for (const [sx, sy] of SH_YILDIZ) if (sx > x0 + 1) { shYildiz5(g, sx, sy - 1.5 + (sx < -20 ? n * 0.2 : 0), 0.95); g.fill(); }
    g.globalAlpha = 1;
  }
  // yosun saçakları ve ışıklı uçlar
  if (b > 0.05) {
    g.strokeStyle = '#2f8a72'; g.lineWidth = 0.42; g.lineCap = 'round';
    g.beginPath();
    for (let xx = x0 + 0.5, i = 0; xx < x1; xx += 1.1, i++) {
      const y0 = ust(xx) + 0.3, h = (0.8 + ((i * 7) % 5) * 0.35) * bb, sw = Math.sin(tm * 1.6 + i) * 0.25;
      g.moveTo(xx, y0); g.quadraticCurveTo(xx + sw, y0 - h * 0.6, xx + sw * 2 + ((i % 3) - 1) * 0.4, y0 - h);
    }
    g.stroke();
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const r = sh.k0 * sh.zoom;
    for (let i = 0; i < 14; i++) {
      const xx = x0 + 2 + i * 2.85, y0 = ust(xx) - 1.6 * bb, tw = 0.5 + 0.5 * Math.sin(tm * 2.1 + i * 1.7);
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
const SH_SPOR = [[-50, 66, 0.3], [-44, 71, 2.1], [-30, 68, 1.2], [-19, 74, 3.3], [-8, 69, 0.8], [2, 73, 2.7], [9, 78, 1.9], [-56, 77, 3.9], [-36, 79, 1.5], [-12, 80, 0.2]];

// gece lambası → ay (l: 0 lamba, 1 ay)
function shLamba(p, l, tm, gece, yanik = 1) {
  const ee = shEase2(l);
  // yay şeklinde süzülüş
  const lx = lerp(SH_LAMBA.x, SH_AY.x, ee), ly = lerp(SH_LAMBA.y, SH_AY.y, ee) - Math.sin(ee * Math.PI) * 16;
  const rr = lerp(2.3, 6.5, shEase(l));
  // gövde (ayak) – kaybolur
  if (l < 1) {
    shOdaT(); g.globalAlpha = 1 - shSeg(l, 0, 0.35);
    g.fillStyle = gece ? '#3a3268' : '#e7c39b';
    g.beginPath(); g.moveTo(SH_LAMBA.x - 2.2, SH_KOMODIN.ust); g.quadraticCurveTo(SH_LAMBA.x, SH_KOMODIN.ust - 2.6, SH_LAMBA.x + 2.2, SH_KOMODIN.ust); g.fill();
    g.fillRect(SH_LAMBA.x - 0.45, SH_LAMBA.y + 1, 0.9, SH_KOMODIN.ust - SH_LAMBA.y - 1.6);
    g.globalAlpha = 1;
  }
  const px = shEkranX(lx), py = shEkranY(ly), k = sh.k0 * sh.zoom;
  // ışık: sıcak turuncu → serin ay ışığı
  const sicak = '#ffcf8a', ay = '#cfe6ff';
  const nab = 1 + Math.sin(tm * 1.4) * 0.04;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (gece && yanik > 0) {
    g.globalCompositeOperation = 'lighter';
    dglow(l < 0.5 ? sicak : ay, px, py, k * lerp(26, 75, l) * nab, yanik * lerp(0.42, 0.5, l));
    dglow(l < 0.5 ? '#ffe2b8' : '#ffffff', px, py, k * rr * 2.6, yanik * lerp(0.6, 0.55, l));
    g.globalCompositeOperation = 'source-over';
  }
  // küre / ay diski
  shOdaT();
  if (l > 0.5) {
    const a = shSeg(l, 0.5, 1);
    g.fillStyle = shMix('#ffe9c4', '#f2f7ff', a);
    g.beginPath(); g.arc(lx, ly, rr, 0, 6.283); g.fill();
    g.fillStyle = `rgba(180,200,235,${0.35 * a})`;   // yumuşak ay lekeleri
    g.beginPath(); g.arc(lx - rr * 0.3, ly - rr * 0.15, rr * 0.22, 0, 6.283); g.moveTo(lx + rr * 0.47, ly + rr * 0.3); g.arc(lx + rr * 0.32, ly + rr * 0.3, rr * 0.15, 0, 6.283); g.moveTo(lx + rr * 0.2, ly - rr * 0.45); g.arc(lx + rr * 0.1, ly - rr * 0.45, rr * 0.1, 0, 6.283); g.fill();
  } else {
    // lamba kubbesi (hilal biçimli gece lambası)
    const sh2 = shSeg(l, 0, 0.5);
    g.fillStyle = gece ? shMix('#ffe2ad', '#f2f7ff', sh2) : '#fff3dc';
    g.beginPath(); g.arc(lx, ly, rr, 0, 6.283); g.fill();
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
    g.fillStyle = p.rug; g.beginPath(); g.ellipse(H0.x, H0.y, H0.rx, H0.ry, 0, 0, 6.283); g.fill();
    g.strokeStyle = p.rugRing; g.lineWidth = 0.6;
    g.beginPath(); g.ellipse(H0.x, H0.y, H0.rx - 2, H0.ry - 0.9, 0, 0, 6.283); g.stroke();
    g.beginPath(); g.ellipse(H0.x, H0.y, H0.rx * 0.5, H0.ry * 0.48, 0, 0, 6.283); g.stroke();
    // püsküller
    g.strokeStyle = p.rugRing; g.lineWidth = 0.25; g.beginPath();
    for (const s of [-1, 1]) for (let j = -3; j <= 3; j++) { const yy = H0.y + j * 0.9; g.moveTo(H0.x + s * (H0.rx - 0.2) * Math.sqrt(1 - Math.pow(j * 0.9 / H0.ry, 2)), yy); g.lineTo(H0.x + s * (H0.rx + 1.2), yy); }
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
function shHuzme(gece, a, tm) {
  if (a <= 0.01) return;
  shOdaT();
  g.globalCompositeOperation = 'lighter';
  const P0 = SH_PEN, kay = gece ? 30 : 26;
  const gr = g.createLinearGradient(0, P0.ust, 0, 98);
  if (gece) { gr.addColorStop(0, `rgba(140,175,255,${0.13 * a})`); gr.addColorStop(1, 'rgba(140,175,255,0)'); }
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
    dglow(gece ? '#cfe0ff' : '#fff2c8', shEkranX(xx), shEkranY(yy), k * 0.7, a * (0.25 + 0.2 * Math.sin(tm * 1.3 + i * 2)));
  }
  g.globalCompositeOperation = 'source-over';
}

// ══════════════════ AÇILIŞ ══════════════════
function shGirisPlan() {
  const d1 = shSure('a_giris1'), d2 = shSure('a_giris2'), d3 = shSure('a_giris3');
  const P = { karar: 0.7, acil: 2.6, s1: 1.6 };
  P.b2 = P.s1 + Math.max(d1 + 1.0, 5.8);
  P.s2 = P.b2 + 0.7;
  P.b3 = P.s2 + Math.max(d2 + 0.9, 5.6);
  P.s3 = P.b3 + 0.4;
  P.erime = Math.max(d3 + 2.0, 9);
  P.b4 = P.b3 + P.erime;
  P.uyan = P.b4 + 0.9;      // Pırıl: "Feza, uyan!"
  P.isik = P.b4 + 1.3;      // parlama yükselir
  P.dunya = P.isik + 1.3;   // tamEkran → false
  P.son = P.dunya + 2.2;
  return P;
}
function shGirisGuncelle(dt) {
  const t = sh.t, P = sh.plan;
  const ses = (k, at) => { if (!sh.sesler[k] && t >= at) { sh.sesler[k] = 1; shSoyle(k); } };
  if (sh.atla < 0) { ses('a_giris1', P.s1); ses('a_giris2', P.s2); ses('a_giris3', P.s3); }
  ses('p_uyan', P.uyan);
  sh.tam = t >= P.karar && t < P.dunya;
  // kamera: yatağa doğru çok yavaş yaklaşma, erirken geri açılma
  sh.fx = shPX(-26); sh.fy = shPY(56);
  const yak = 1 + 0.1 * shEase(shSeg(t, P.karar, P.b3 + 1));
  sh.zoom = lerp(yak, 1, shEase(shSeg(t, P.b3 + 1, P.b3 + P.erime * 0.7)));
  // Zzz
  if (t > P.karar + 1 && t < P.b3 + 2 && (sh.zz.length === 0 || t - sh.zz[sh.zz.length - 1].t0 > 1.5)) sh.zz.push({ t0: t });
  if (t >= P.son && sh.bitti) { const f = sh.bitti; sh.bitti = null; sh.mod = null; sh.tam = false; f(); }
}
function shGirisCiz(tm, dt) {
  const t = sh.t, P = sh.plan;
  if (!sh.tam) {
    if (t < P.karar) {   // başlık → karanlık
      g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(4,5,14,${shEase(t / P.karar)})`; g.fillRect(0, 0, W, H);
      return;
    }
    shGirisAcilis(tm, t, P); return;
  }
  if (!sh.oda) sh.oda = shOdaCiz(SH_GECE);
  if (!sh.orman) sh.orman = shOrmanCiz();
  const p = SH_GECE;
  const m = shSeg(t, P.b3, P.b4);                         // erime ilerlemesi
  const halka = shEase(shSeg(m, 0.04, 0.72));
  const perde = shSeg(m, 0.1, 0.6), lamba = shSeg(m, 0.12, 0.72), batt = shSeg(m, 0.22, 0.72), cerceve = shSeg(m, 0.2, 0.58), hali = shSeg(m, 0.38, 0.95);
  // Pırıl'ın yeri: kollarında → yükselir → süzülür → Feza'nın kulağına iner
  const pr = shPirilYer(t, P, tm);
  // 1) orman fonu, 2) erimeyen oda (dalgalı ışık halkasının dışı)
  shResimT();
  if (halka > 0) g.drawImage(sh.orman, 0, 0);
  if (halka < 1) {
    if (halka <= 0) g.drawImage(sh.oda, 0, 0);
    else {
      const cxp = shPX(pr.x), cyp = shPY(pr.y), Rm = Math.hypot(W, H) * 1.15, Rr = halka * Rm;
      g.save(); g.beginPath(); g.rect(-W, -H, W * 3, H * 3);
      for (let i = 0; i <= 120; i++) {
        const a = i / 120 * 6.283, rr = Rr * (1 + 0.07 * Math.sin(a * 5 + tm * 1.3) + 0.04 * Math.sin(a * 9 - tm * 2.1));
        const xx = cxp + Math.cos(a) * rr, yy = cyp + Math.sin(a) * rr;
        if (i === 0) g.moveTo(xx, yy); else g.lineTo(xx, yy);
      }
      g.closePath(); g.clip('evenodd'); g.drawImage(sh.oda, 0, 0); g.restore();
      // halkanın ışıklı kenarı
      g.globalCompositeOperation = 'lighter';
      g.lineJoin = 'round'; g.lineWidth = sh.k0 * 2.4; g.strokeStyle = `rgba(190,160,255,${0.16 * (1 - halka)})`;
      g.beginPath();
      for (let i = 0; i <= 120; i++) {
        const a = i / 120 * 6.283, rr = Rr * (1 + 0.07 * Math.sin(a * 5 + tm * 1.3) + 0.04 * Math.sin(a * 9 - tm * 2.1));
        if (i === 0) g.moveTo(cxp + Math.cos(a) * rr, cyp + Math.sin(a) * rr); else g.lineTo(cxp + Math.cos(a) * rr, cyp + Math.sin(a) * rr);
      }
      g.stroke(); g.lineWidth = sh.k0 * 0.45; g.strokeStyle = `rgba(240,225,255,${0.5 * (1 - halka)})`; g.stroke();
      for (let i = 0; i < 26; i++) {
        const a = i / 26 * 6.283 + tm * 0.15, rr = Rr * (1 + 0.07 * Math.sin(a * 5 + tm * 1.3) + 0.04 * Math.sin(a * 9 - tm * 2.1));
        const tw = 0.5 + 0.5 * Math.sin(tm * 3 + i * 2.3);
        shParilti(cxp + Math.cos(a) * rr, cyp + Math.sin(a) * rr, sh.k0 * (1.2 + tw * 1.6), (1 - halka) * (0.4 + tw * 0.5));
      }
      g.globalCompositeOperation = 'source-over';
    }
  }
  // 3) ay ışığı huzmesi (oda eridikçe söner)
  shHuzme(true, 1 - halka, tm);
  // 4) değişen parçalar
  shPerdeler(p, perde, tm, 0);
  shLamba(p, lamba, tm, true, 1);
  shHali(p, hali, tm);
  shYatakArka(p, batt, cerceve, tm);
  // Feza (uyuyor) – Pırıl kollarının arasında; gözleri açılınca parlamaya başlar
  const nefes = Math.sin(tm * 1.5) * 0.5 + 0.5;
  const pirilParla = shEase(shSeg(t, P.b2 + 1.2, P.b3 + 0.5));
  if (pr.kucak) shPirilIsik(shKucak.x, shKucak.y, tm, pirilParla);
  shFeza(SH_FEZA.x, SH_FEZA.y, 1.18, 'uyku', tm, pr.kucak ? pr.poz : null, pr.u);
  shBattaniye(p, batt, tm, nefes);
  if (!pr.kucak) { shPirilIsik(pr.x, pr.y, tm, pirilParla); shPiril(pr.x, pr.y, 1.0, pr.poz, tm, pr.f); }
  if (pr.pat > 0) {   // kucaktan havalanırken ışık pırıltısı (poz değişimini yumuşatır)
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const k = sh.k0 * sh.zoom; dglow('#f4e6ff', shEkranX(pr.x), shEkranY(pr.y), k * 9 * pr.pat, pr.pat * 0.9);
    g.globalCompositeOperation = 'source-over';
  }
  // Zzz
  shZzz(t, tm, P);
  // ateş böcekleri gibi süzülen ışık zerreleri (erirken çoğalır)
  shZerreler(tm, 0.25 + 0.75 * halka, true);
  // ışık patlaması: Pırıl, Feza'yı uyandırırken
  if (t > P.isik - 0.01) shParlama(t, P, tm);
  // açılışta karanlıktan beliriş
  const kar = 1 - shEase(shSeg(t, P.karar, P.acil));
  if (kar > 0) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(4,5,14,${kar})`; g.fillRect(0, 0, W, H); }
}
function shPirilYer(t, P, tm) {
  const kuc = { x: shKucak.x, y: shKucak.y };
  const hav = { x: -22 + Math.sin(tm * 0.7) * 3, y: 36 + Math.sin(tm * 1.3) * 1.6 };
  const kulak = { x: -39, y: 49 + Math.sin(tm * 2.2) * 0.6 };
  const uyan = shSeg(t, P.b2 + 0.3, P.b3 + 0.2);
  if (sh.atla >= 0 && t < P.b4 + 0.01) return { x: kuc.x, y: kuc.y, kucak: true, poz: 'uyaniyor', u: Math.max(uyan, 0.6), f: 1, pat: 0 };
  if (t < P.b2 + 0.3) return { x: kuc.x, y: kuc.y, kucak: true, poz: 'pelus', f: 1, pat: 0 };
  if (t < P.b3 + 0.4) return { x: kuc.x, y: kuc.y, kucak: true, poz: 'uyaniyor', u: uyan, f: 1, pat: shSeg(t, P.b3 + 0.1, P.b3 + 0.4) };
  if (!sh.kalkis) sh.kalkis = { x: kuc.x, y: kuc.y };
  const k0 = sh.kalkis, pat = 1 - shSeg(t, P.b3 + 0.4, P.b3 + 0.9);
  const kalk = shEase(shSeg(t, P.b3 + 0.4, P.b3 + 2.4));
  if (t < P.b4) {
    const x = lerp(k0.x, hav.x, kalk), y = lerp(k0.y, hav.y, kalk) - Math.sin(kalk * Math.PI) * 4;
    return { x, y, kucak: false, poz: 'ucus', f: 1, pat };
  }
  const in2 = shEase(shSeg(t, P.b4, P.b4 + 1.1));
  return { x: lerp(hav.x, kulak.x, in2), y: lerp(hav.y, kulak.y, in2) - Math.sin(in2 * Math.PI) * 3, kucak: false, poz: 'ucus', f: in2 > 0.35 ? -1 : 1, pat: 0 };
}
function shPirilIsik(x, y, tm, parla) {
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
    const a = Math.sin(u * Math.PI) * 0.85 * (1 - shSeg(t, P.b3, P.b3 + 1.5));
    if (a <= 0) continue;
    g.globalAlpha = a; g.fillStyle = '#d9ccff';
    g.font = `700 ${Math.round(k * (2.6 + u * 2.4))}px ui-rounded, "Trebuchet MS", system-ui, sans-serif`;
    g.fillText('z', shEkranX(x), shEkranY(y));
  }
  g.globalAlpha = 1;
}
const shZer = [];
function shZerreler(tm, a, gece) {
  if (!shZer.length) { const r = rng(42); for (let i = 0; i < 34; i++) shZer.push({ x: r(), y: r(), s: 0.5 + r(), h: r() * 6.28, v: 0.004 + r() * 0.01 }); }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
  for (const z of shZer) {
    const yy = ((z.y - tm * z.v) % 1 + 1) % 1, xx = z.x + Math.sin(tm * 0.4 + z.h) * 0.02;
    const tw = 0.5 + 0.5 * Math.sin(tm * 1.5 + z.h * 3);
    dglow(gece ? (z.s > 1.1 ? '#c9b2ff' : '#9ff0ff') : '#fff0c0', xx * W, yy * H, H * 0.008 * z.s * (1 + tw), a * (0.25 + 0.45 * tw));
  }
  g.globalCompositeOperation = 'source-over';
}
// mor-beyaz ışık: tepe noktasında dünya görünür olur
function shParlama(t, P, tm) {
  const yuksel = shEase(shSeg(t, P.isik, P.dunya));
  g.setTransform(1, 0, 0, 1, 0, 0);
  const cx = shEkranX(SH_FEZA.x - 2), cy = shEkranY(SH_FEZA.y - 4);
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * (0.15 + 0.9 * yuksel));
  gr.addColorStop(0, `rgba(255,248,255,${0.98 * yuksel})`); gr.addColorStop(0.35, `rgba(226,205,255,${0.95 * yuksel})`); gr.addColorStop(1, `rgba(190,160,255,${0.92 * yuksel * yuksel})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
// tamEkran bitti: gerçek dünya alttan, ışık kenarlardan içe doğru çözülür; Feza ışığın içinden belirir
function shGirisAcilis(tm, t, P) {
  const u = shSeg(t, P.dunya, P.son);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const fx = (typeof cam !== 'undefined' ? (OYUN.P.x - cam.x) * S : W / 2), fy = (typeof cam !== 'undefined' ? (OYUN.P.y - 40 - cam.y) * S : H / 2);
  const ic = 1 - shEase(shSeg(u, 0.15, 1)), dis = 1 - shEase(shSeg(u, 0, 0.6));
  const R = Math.hypot(W, H);
  const gr = g.createRadialGradient(fx, fy, 0, fx, fy, R * 0.9);
  gr.addColorStop(0, `rgba(255,248,255,${0.95 * ic})`); gr.addColorStop(0.18, `rgba(228,208,255,${0.9 * ic * ic})`);
  gr.addColorStop(0.5, `rgba(200,170,255,${0.85 * dis})`); gr.addColorStop(1, `rgba(180,150,255,${0.85 * dis * dis})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  // Feza'nın etrafında dönen ışık zerreleri
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    const a = tm * 1.6 + i * 0.449, rr = H * (0.05 + 0.1 * u) * (0.7 + 0.3 * Math.sin(i * 2.1));
    shParilti(fx + Math.cos(a) * rr, fy + Math.sin(a) * rr * 0.75, H * 0.012 * (1 + Math.sin(tm * 5 + i) * 0.4), (1 - u) * 0.9);
  }
  g.globalCompositeOperation = 'source-over';
}

// ══════════════════ KAPANIŞ ══════════════════
function shFinalPlan() {
  const d1 = shSure('a_final1'), d2 = shSure('a_final2'), d3 = shSure('a_final3');
  const P = { s1: 0.6 };
  P.isik = P.s1 + Math.max(d1 + 0.8, 4.6);   // altın ışık dolmaya başlar
  P.dolu = P.isik + 2.6;                     // ekran tamamen ışık → oda
  P.oda = P.dolu + 0.5;                      // sabah odası belirmeye başlar
  P.s2 = P.oda + 1.6;
  P.yak = P.s2 + Math.max(d2 + 0.6, 4.2);    // peluş Pırıl'a yaklaş
  P.kirp = P.yak + 1.5;                      // göz kırpma
  P.s3 = P.kirp + 1.0;
  P.son = P.s3 + Math.max(d3 + 1.2, 4.0);
  return P;
}
function shFinalGuncelle(dt) {
  const t = sh.t, P = sh.plan;
  const ses = (k, at) => { if (!sh.sesler[k] && t >= at) { sh.sesler[k] = 1; shSoyle(k); } };
  ses('a_final1', P.s1); ses('a_final2', P.s2); ses('a_final3', P.s3);
  if (!sh.cin && t >= P.kirp) { sh.cin = 1; if (typeof AU !== 'undefined' && AU.sfx) try { AU.sfx('bloom', 0); } catch (e) {} }
  sh.tam = t >= P.dolu;
  sh.fx = shPX(shKucak.x); sh.fy = shPY(shKucak.y - 2);
  sh.zoom = 1.04 + 0.26 * shEase(shSeg(t, P.yak, P.kirp + 0.2)) + 0.012 * shSeg(t, P.oda, P.son);
  if (t >= P.son && sh.bitti) { const f = sh.bitti; sh.bitti = null; sh.sonGorunum = true; f(); }
}
// sabah odası sahnesi (bitiş ekranının arkasında da kullanılır)
function shSabahCiz(tm, t, P) {
  if (!sh.odaSabah) sh.odaSabah = shOdaCiz(SH_SABAH);
  const p = SH_SABAH;
  shResimT(); g.drawImage(sh.odaSabah, 0, 0);
  shHuzme(false, 1, tm);
  shPerdeler(p, 0, tm * 0.6, 1);
  shLamba(p, 0, tm, false, 0);
  shHali(p, 0, tm);
  shYatakArka(p, 0, 0, tm);
  // Feza önce uyuyor, sonra doğrulup gözlerini ovuşturur, gerinir, gülümser; peluş Pırıl kucağında
  const uT = P ? t - (P.oda + 0.9) : 99;
  const kirp = P ? (t >= P.kirp && t < P.kirp + 0.9) : false;
  const otur = uT <= 0 ? 0 : shEase(shSeg(uT, 0, 1.1));
  shFeza(SH_FEZA.x, SH_FEZA.y, 1.18, uT <= 0 ? 'uyku' : 'uyanis', uT <= 0 ? tm : uT, kirp ? 'goz_kirp' : 'pelus', undefined, tm);
  shBattaniye(p, 0, tm, uT <= 0 ? Math.sin(tm * 1.5) * 0.5 + 0.5 : 0, otur);
  if (P && t >= P.kirp) {   // göz kırpınca küçük, sıcak parıltı
    const u = shSeg(t, P.kirp, P.kirp + 1.3);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter';
    const k = sh.k0 * sh.zoom, px = shEkranX(shKucak.x + 2.2), py = shEkranY(shKucak.y - 4);
    dglow('#ffe6b0', px, py, k * 5 * Math.sin(u * Math.PI), Math.sin(u * Math.PI) * 0.6);
    shParilti(px, py, k * 2.4 * Math.sin(u * Math.PI), Math.sin(u * Math.PI));
    g.globalCompositeOperation = 'source-over';
  }
  shZerreler(tm, 0.6, false);
}
function shFinalCiz(tm, dt) {
  const t = sh.t, P = sh.plan;
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!sh.tam) {
    // kutlama: aydınlık ormanın üstünde yükselen altın zerreler + ağaçtan yayılan ışık
    const a = shEase(shSeg(t, 0, 1.5));
    shAltinZerre(tm, a);
    if (t >= P.isik) {
      const u = shEase(shSeg(t, P.isik, P.dolu));
      const tx = typeof TREE !== 'undefined' && TREE ? (TREE.x - cam.x) * S : W / 2, ty = typeof TREE !== 'undefined' && TREE ? (TREE.y - 200 - cam.y) * S : H / 2;
      const R = Math.hypot(W, H) * (0.1 + 1.1 * u);
      const gr = g.createRadialGradient(tx, ty, 0, tx, ty, R);
      gr.addColorStop(0, `rgba(255,253,240,${Math.min(1, u * 1.6)})`); gr.addColorStop(0.5, `rgba(255,236,190,${Math.min(1, u * 1.3)})`); gr.addColorStop(1, `rgba(255,222,160,${u * u})`);
      g.fillStyle = gr; g.fillRect(0, 0, W, H);
    }
    return;
  }
  shSabahCiz(tm, t, P);
  // altın ışıktan sabaha
  const s = 1 - shEase(shSeg(t, P.oda, P.oda + 2.4));
  if (s > 0) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    const cx = W * 0.55, cy = H * 0.35, gr = g.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * 0.8);
    gr.addColorStop(0, `rgba(255,253,240,${s})`); gr.addColorStop(1, `rgba(255,226,170,${s})`);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
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
OLAY.on('dokunus', () => {
  if (sh.mod !== 'giris' || sh.atla >= 0) return;
  const P = sh.plan;
  if (sh.t < 2 || sh.t >= P.b4) return;
  sh.atla = sh.t; shSus();
  // planı kısalt: hemen Pırıl uyandırır, ışık yükselir, dünya görünür
  P.b3 = Math.min(P.b3, sh.t); P.b4 = sh.t; P.erime = 0.001;
  P.uyan = sh.t + 0.25; P.isik = sh.t; P.dunya = sh.t + 0.6; P.son = P.dunya + 1.6;
});
OLAY.on('boyut', () => { sh.bw = -1; });

const SAHNE = {
  giris(bitince) {
    shOlc(); sh.mod = 'giris'; sh.t = 0; sh.kalkis = null; sh.bitti = bitince; sh.atla = -1; sh.sesler = {}; sh.zz.length = 0; sh.tam = false;
    sh.plan = shGirisPlan(); sh.zoom = 1;
    // pahalı önbellekleri hemen hazırla (ilk karede takılma olmasın)
    sh.oda = shOdaCiz(SH_GECE); sh.orman = shOrmanCiz();
  },
  final(bitince) {
    shOlc(); sh.mod = 'final'; sh.t = 0; sh.bitti = bitince; sh.sesler = {}; sh.tam = false; sh.cin = 0;
    sh.plan = shFinalPlan(); sh.zoom = 1;
    sh.oda = sh.orman = null;   // gece önbelleklerini bırak (bellek)
    setTimeout(() => { if (!sh.odaSabah) { shOlc(); sh.odaSabah = shOdaCiz(SH_SABAH); } }, 400);
  },
  tamEkran() { return sh.tam || (sh.sonGorunum && DURUM === 'son'); },
  ciz(tm, dt) {
    if (!sh.mod && !sh.sonGorunum) return;
    shOlc();
    if (sh.mod === 'giris') {
      sh.t += dt; shGirisGuncelle(dt);
      if (sh.mod === 'giris' || sh.t < sh.plan.son + 0.1) shGirisCiz(tm, dt);
    } else if (sh.mod === 'final') {
      sh.t += dt; shFinalGuncelle(dt);
      shFinalCiz(tm, dt);
      if (sh.sonGorunum) { sh.mod = null; }
    } else if (sh.sonGorunum && DURUM === 'son') {
      // bitiş ekranının arkasında: sakin sabah odası (yavaşça geri açılır)
      sh.zoom = lerp(sh.zoom, 1.06, 1 - Math.exp(-dt * 0.6));
      shSabahCiz(tm, 99, null);
    }
  },
  // test kancası
  get _durum() { return { mod: sh.mod, t: sh.t, tam: sh.tam, plan: sh.plan }; },
};

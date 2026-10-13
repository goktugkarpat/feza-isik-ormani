/* yildiz.js – Bölüm 2 "Yıldız Gölü": nesne türleri yildiz, yildizTasi, yildizAda, yildizBas, yildizHayvan (Yıldız Kaplumbağası).
   Sözleşme: src/BOLUM2.md. Önek: yl*. Yükleme anında yalnız tür kaydı yapar (Bölüm 1'de de yüklenir, zararsız).
   • yildiz: suya düşmüş sönük yıldız. Feza dokununca uyanır (parlar, kıvılcım) → gökyüzüne kıvrımlı yükselir → gökte yerini alır.
     OLAY 'yildiz' (dokununca) ve 'yildizYerlesti' (gökte yerleşince). o.done=true dokununca. o.gokX/o.gokY = gökteki yeri (0..1 ekran oranı).
   • YILDIZLAR (genel dizi): her yıldız için { x, y (0..1 ekran oranı), renk (#rrggbb), boyut (yarıçap, dünya birimi), uyandi (gökte yerleşti mi),
     t (yerleşme anı, `now`), ucuyor (şu an yükseliyor), o (nesne) }. dunya2.js uyandi=true olanları gökyüzünde (takımyıldızı: bir KAPLUMBAĞA) çizer;
     `uyandi` yerleşme anında true olur (o ana dek yıldızı bu dosya çizer, böylece ikiye katlanmaz).
   • yildizTasi: suyun üstünde basılan taş (tek yönlü platform). Önceki taşa basılınca belirir; basılınca parlar.
   • yildizAda: yüzen ada (tek yönlü platform, süs). yildizBas: kaplumbağanın başı (katı cisim, çizimi hayvan yapar).
   • yildizHayvan: dev Yıldız Kaplumbağası. Sırtındaki 3 nokta (buyukIcin:true yıldızlar dokunulunca ışık küresi gelip yakar) yandıkça
     3 aşamada uyanır; sonunda sırtı zıplatıcı olur, Feza'yı Yıldız Tepesi'ne (göğe) fırlatır; kalan bütün yıldızlar bir dalga halinde göğe yükselir;
     animasyon bitince OLAY 'hayvanUyandi' (+ o.uyandi=true).
   Olaylar: 'yildiz'(o) 'yildizYerlesti'(o) 'hayvanAsama'({o, asama:1..3}) 'hayvanHazir'(o) 'hayvanFirlat'(o) 'hayvanUyandi'(o). */
'use strict';

// ───────────────────────── ortak: palet, takımyıldızı, sprite'lar ─────────────────────────
// Gökteki takımyıldızı: bir KAPLUMBAĞA (hayvanın arkadaşı). [gokX, gokY, renk, boyut]. Nesneler soldan sağa sırayla bu yerleri alır:
// önce kuyruk ve arka ayak, sonra kabuğun kenarı, en sonda (hayvanın üç büyük yıldızı) kabuğun ortası.
const YL_YER = [
  [0.300, 0.300, 0, 11], [0.345, 0.385, 1, 10], [0.375, 0.300, 2, 11], [0.405, 0.220, 3, 12], [0.470, 0.165, 4, 12],
  [0.550, 0.165, 0, 12], [0.620, 0.220, 1, 12], [0.650, 0.300, 2, 11], [0.625, 0.385, 3, 10], [0.700, 0.265, 4, 11],
  [0.765, 0.215, 0, 14], [0.450, 0.265, 1, 15], [0.515, 0.225, 0, 17], [0.585, 0.275, 3, 15],
];
const YL_RENK = [   // [çekirdek, orta, kenar, ışık]
  ['#fffbe8', '#ffe08a', '#f2a93a', '#ffe9a8'], ['#f2ffff', '#9eeeff', '#4aa9d8', '#a8f0ff'], ['#fdf6ff', '#d6b8ff', '#8a66d8', '#d8c0ff'],
  ['#fff6fb', '#ffb8de', '#d868a8', '#ffc8e6'], ['#f4fff8', '#b4ffd8', '#4fc99a', '#b8ffe0'],
];
const YILDIZLAR = [];
const YL_R = 30, YL_K = 4;   // yıldız yarıçapı (dünya birimi) / sprite çözünürlüğü (piksel per birim)
const ylSp = {};
function ylYol(p, R, ic) { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * ic : R, x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) p.lineTo(x, y); else p.moveTo(x, y); } p.closePath(); }
function ylCan(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }
function ylYildizSprite(kind, ri) {   // kind: 'dim' | 'lit'
  const key = kind + (kind === 'lit' ? ri : ''); if (ylSp[key]) return ylSp[key];
  const R = YL_R, k = YL_K, pad = 8, c = ylCan((R + pad) * 2 * k, (R + pad) * 2 * k), x = c.getContext('2d');
  x.translate(c.width / 2, c.height / 2); x.scale(k, k);
  const col = kind === 'lit' ? YL_RENK[ri] : ['#a9b4e6', '#5b679f', '#2a3262'];
  const ic = 0.47, P1 = new Path2D(); ylYol(P1, R, ic);
  const gr = x.createRadialGradient(0, -2, 1, 0, 0, R);
  gr.addColorStop(0, col[0]); gr.addColorStop(0.5, col[1]); gr.addColorStop(1, col[2]);
  x.fillStyle = gr; x.strokeStyle = col[2]; x.lineJoin = 'round'; x.lineWidth = 5; x.stroke(P1); x.fillStyle = gr; x.fill(P1);
  x.strokeStyle = kind === 'lit' ? col[1] : '#7380bd'; x.lineWidth = 3; x.stroke(P1);
  // yüzler (faset): her kolun bir yarısı açık, bir yarısı koyu
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 5, ia = a - Math.PI / 5, ib = a + Math.PI / 5;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * R, Math.sin(a) * R); x.lineTo(Math.cos(ia) * R * ic, Math.sin(ia) * R * ic); x.closePath();
    x.fillStyle = kind === 'lit' ? 'rgba(255,255,255,0.28)' : 'rgba(160,176,235,0.16)'; x.fill();
    x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * R, Math.sin(a) * R); x.lineTo(Math.cos(ib) * R * ic, Math.sin(ib) * R * ic); x.closePath();
    x.fillStyle = kind === 'lit' ? 'rgba(120,60,160,0.18)' : 'rgba(10,14,40,0.30)'; x.fill();
  }
  // yumuşak iç parıltı
  const hl = x.createRadialGradient(-5, -8, 0, -5, -8, 15); hl.addColorStop(0, kind === 'lit' ? 'rgba(255,255,255,0.75)' : 'rgba(190,200,255,0.22)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = hl; x.beginPath(); x.arc(-5, -8, 15, 0, 6.283); x.fill();
  return ylSp[key] = c;
}
// dim=0 sönük .. lit=1 parlak; sc: yarıçap çarpanı (1 → R=30)
function ylYildizCiz(x, y, sc, rot, lit, ri, a) {
  const dim = ylYildizSprite('dim', 0), w = dim.width / YL_K * sc;
  g.save(); g.translate(x, y); if (rot) g.rotate(rot);
  if (lit < 0.995) { g.globalAlpha = a * (1 - lit * 0.92); g.drawImage(dim, -w / 2, -w / 2, w, w); }
  if (lit > 0.005) { g.globalAlpha = a * lit; g.drawImage(ylYildizSprite('lit', ri), -w / 2, -w / 2, w, w); }
  g.restore(); g.globalAlpha = 1;
}
// sevimli yüz: yuz=0 uyuyor (kapalı gözler, minik ağız) … 1 uyanık (parlak gözler, gülümseme); sc = yıldız ölçeği
function ylYuz(x, y, sc, rot, yuz, a, wink, kar) {   // kar: 0 gülen · 1 göz kırpan · 2 uykulu esneyen · 3 şaşkın · 4 kıkırdayan
  g.save(); g.translate(x, y); if (rot) g.rotate(rot); g.scale(sc, sc); g.globalAlpha = a;
  const op = clamp(yuz * 1.6 - 0.3, 0, 1), awake = yuz > 0.45, k = awake ? (kar || 0) : 0, col = yuz > 0.5 ? '#4a2c6e' : '#c8d2ff';
  g.lineCap = 'round';
  for (const ex of [-7, 7]) {
    if (op < 0.4) { g.strokeStyle = col; g.lineWidth = 1.7; g.beginPath(); g.arc(ex, -1.5, 3.2, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke(); continue; }
    if (k === 1 && ex > 0 && wink !== false) { g.strokeStyle = '#2d1b52'; g.lineWidth = 1.8; g.beginPath(); g.arc(ex, 1, 3, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); continue; }
    if (k === 4) { g.strokeStyle = '#2d1b52'; g.lineWidth = 1.9; g.beginPath(); g.arc(ex, 2, 3.2, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); continue; }
    if (k === 2) { g.strokeStyle = '#2d1b52'; g.lineWidth = 1.9; g.beginPath(); g.arc(ex, -1, 3.2, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke(); continue; }
    const rx = k === 3 ? 3.4 : 2.5, ry = (k === 3 ? 4.4 : 3.2) * op;
    g.fillStyle = '#2d1b52'; g.beginPath(); g.ellipse(ex, 0, rx, ry, 0, 0, 6.283); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(ex - 0.8, -1.2, k === 3 ? 1.3 : 1, 0, 6.283); g.fill();
  }
  if (awake) {
    g.strokeStyle = '#4a2c6e'; g.fillStyle = '#4a2c6e'; g.lineWidth = 1.6;
    if (k === 2) { g.beginPath(); g.ellipse(0, 5.5, 2.4, 3.2 + 0.8 * Math.sin(now * 2), 0, 0, 6.283); g.fill(); }
    else if (k === 3) { g.beginPath(); g.ellipse(0, 5.5, 2.1, 2.6, 0, 0, 6.283); g.fill(); }
    else if (k === 4) { g.beginPath(); g.arc(0, 3.5, 5.2, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke(); }
    else { g.beginPath(); g.arc(0, 4, 4.2, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
    g.fillStyle = 'rgba(255,120,170,' + (0.45 * yuz) + ')'; g.beginPath(); g.arc(-11, 4.5, 2.8, 0, 6.283); g.fill(); g.beginPath(); g.arc(11, 4.5, 2.8, 0, 6.283); g.fill();
  } else { g.fillStyle = col; g.globalAlpha = a * 0.8; g.beginPath(); g.ellipse(0, 5.2, 1.6, 1.2 + 0.5 * (0.5 + 0.5 * Math.sin(now * 2)), 0, 0, 6.283); g.fill(); }
  g.restore(); g.globalAlpha = 1;
}
function ylGlint(x, y, s, a, rot) {   // dört uçlu ışıltı (additive)
  if (a <= 0.01) return;
  g.save(); g.translate(x, y); g.rotate(rot || 0); g.globalAlpha = a; g.fillStyle = '#ffffff';
  g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * 0.07, -s * 0.07, s, 0); g.quadraticCurveTo(s * 0.07, s * 0.07, 0, s); g.quadraticCurveTo(-s * 0.07, s * 0.07, -s, 0); g.quadraticCurveTo(-s * 0.07, -s * 0.07, 0, -s); g.fill();
  g.restore(); g.globalAlpha = 1;
}
function ylSfx(ad, v) { if (typeof AU !== 'undefined' && AU && typeof AU.sfx === 'function') { try { AU.sfx(ad, v); } catch (e) {} } }
function ylMutlu(o) { if (typeof dragonHappy === 'function') { try { dragonHappy(o); } catch (e) {} } }
const ylGok = (fx, fy) => ({ x: cam.x + fx * VW, y: cam.y + fy * (H / S) });   // ekran oranı → dünya
const ylSu = () => (typeof BOLUM !== 'undefined' && BOLUM.gol && BOLUM.gol.su) || 730;
const ylEase = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
function ylSuHalka(x, y, small) { ripples.push({ x, y, r: 0, life: small ? 0.9 : 1.4, small: !!small }); }
// su yüzeyinde ışık yansıması + halkalar (yassı elips)
function ylSuYansima(x, y, rx, a, col, tm, ph) {
  if (a <= 0.003) return;
  g.save(); g.translate(x, y); g.scale(1, 0.2); g.globalCompositeOperation = 'lighter';
  dglow(col, 0, 0, rx, a);
  const u = (tm * 0.45 + ph) % 1; g.globalAlpha = a * 1.6 * (1 - u); g.strokeStyle = col; g.lineWidth = 2.2 / 0.2 * 0.5;
  g.beginPath(); g.arc(0, 0, rx * (0.35 + 0.6 * u), 0, 6.283); g.stroke();
  g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// ───────────────────────── yildiz ─────────────────────────
let ylHayvan = null;
function ylSlotKur(o) {
  let rank = 0, n = 0;
  for (const m of NESNELER) if (m.tip === 'yildiz') { n++; if (m.x < o.x || (m.x === o.x && m.id < o.id)) rank++; }
  const s = YL_YER[rank % YL_YER.length], tur = Math.floor(rank / YL_YER.length);
  o.kar = rank % 5; o.gokX = s[0] + tur * 0.03; o.gokY = 0.215 + (s[1] - 0.165) * 0.9 - tur * 0.05; o.ri = s[2]; o.boyut = s[3];
  const e = { x: o.gokX, y: o.gokY, renk: YL_RENK[o.ri][3], boyut: o.boyut, uyandi: false, t: 0, ucuyor: false, o };
  o.yl = e; YILDIZLAR.push(e);
}
function ylUyandir(o, zorla) {
  if (o.done && !zorla) return;
  o.done = true; o.dokundu = true; o.durum = 'uyaniyor'; o.t = 0; o.zorla = !!zorla;
  o.sx = o.x; o.sy = o.y;
  burst(o.x, o.y, 22, [YL_RENK[o.ri][3], '#ffffff', YL_RENK[o.ri][1]], 190, 1.3, 8);
  ylSuHalka(o.x, ylSu() - 2); ylSuHalka(o.x, ylSu() - 2, true);
  o.yl.ucuyor = true;
  ylSfx('yildizUyan', o.ri);
  OLAY.emit('yildiz', o);
  if (!zorla) { ylMutlu(o); if (o.buyukIcin && ylHayvan) ylHayvanOrb(ylHayvan, o); }
}
TUR.kaydet('yildiz', {
  kur(o) {
    o.durum = 'sonuk'; o.t = 0; o.lit = 0; o.ph = (o.x * 0.013) % 6.28; o.done = false;
    o.iz = new Float32Array(40); o.izN = 0; o.izT = 0; o.rot = 0; o.rise = 0; o.sc = 1; o.son = 0;
    ylSlotKur(o);
  },
  dokun(o) { ylUyandir(o, false); },
  guncelle(o, dt) {
    o.son += dt;
    if (o.durum === 'sonuk') { o.lit = Math.max(0, o.lit - dt); return; }
    o.t += dt;
    if (o.durum === 'uyaniyor') {
      const u = o.t / 1.0;
      o.lit = ylEase(o.t / 0.6); o.rise = 34 * ylEase(u); o.sc = 0.92 + 0.5 * Math.sin(Math.min(1, u) * 1.9) ; o.rot = Math.sin(o.t * 9) * 0.12 * (1 - u);
      if (Math.random() < dt * 40) burst(o.x + (Math.random() - 0.5) * 40, o.y - o.rise + (Math.random() - 0.5) * 30, 1, [YL_RENK[o.ri][3], '#ffffff'], 60, 0.9, 6);
      if (o.t >= 1.0) {
        o.durum = 'ucuyor'; o.t = 0;
        // başlangıç: zorla uyandırılan uzak yıldız ekranın içinden/altından yükselir
        o.px = o.x; o.py = o.y - o.rise;
        if (o.zorla) { o.px = cam.x + VW * (0.08 + 0.84 * (o.fan === undefined ? 0.5 : o.fan)); o.py = cam.y + H / S + 30; o.lit = 1; }
        o.izN = 0; ylSfx('yildizYuksel', o.ri);
      }
    } else if (o.durum === 'ucuyor') {
      const TT = 2.5 + (o.kar % 3) * 0.35 + (o.ri % 2) * 0.2, u = Math.min(1, o.t / TT), e = ylEase(u), tg = ylGok(o.gokX, o.gokY);
      const dir = (o.x % 80 < 40) ? 1 : -1;
      const bow = Math.sin(e * Math.PI) * (90 + o.kar * 28) * dir, wav = Math.sin(e * (4 + o.ri * 1.4) + o.ph) * (22 + o.ri * 8) * (1 - e);
      o.x2 = lerp(o.px, tg.x, e) + bow + wav; o.y2 = lerp(o.py, tg.y, e) - Math.sin(e * Math.PI) * 40;
      o.sc = lerp(1.35, o.boyut / YL_R * 1.0, e); o.rot += dt * (4 - 3 * e); o.lit = 1;
      o.izT -= dt;
      if (o.izT <= 0) { o.izT = 0.035; for (let i = o.izN > 18 ? 17 : o.izN - 1; i >= 0; i--) { o.iz[(i + 1) * 2] = o.iz[i * 2]; o.iz[(i + 1) * 2 + 1] = o.iz[i * 2 + 1]; } o.iz[0] = o.x2; o.iz[1] = o.y2; o.izN = Math.min(19, o.izN + 1); }
      if (Math.random() < dt * 55) parca(o.x2 + (Math.random() - 0.5) * 18, o.y2 + (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 50, 20 + Math.random() * 40, 1.1, Math.random() < 0.5 ? YL_RENK[o.ri][3] : '#ffffff', 5 + Math.random() * 5);
      if (u >= 1) {
        o.durum = 'yerlesti'; o.t = 0; o.yl.uyandi = true; o.yl.ucuyor = false; o.yl.t = now;
        burst(o.x2, o.y2, 18, [YL_RENK[o.ri][3], '#ffffff'], 140, 1.0, 7);
        ylSfx('yildizYerles', o.ri);
        OLAY.emit('yildizYerlesti', o);
      }
    }
  },
  ciz(o, tm) {   // Feza'nın arkası: su birikintisi / su halkaları, sönük yıldız, bıraktığı ışık izi
    const su = o.birikinti ? o.y + 34 : ylSu();
    if (o.birikinti) {   // tümsekte küçük gece su birikintisi (gökyüzünü yansıtır)
      g.save(); g.translate(o.x, su - 2);
      g.fillStyle = 'rgba(10,22,60,0.85)'; g.beginPath(); g.ellipse(0, 0, 54, 8, 0, 0, 6.283); g.fill();
      const gr = g.createLinearGradient(-50, 0, 50, 0); gr.addColorStop(0, 'rgba(120,170,255,0)'); gr.addColorStop(0.5, 'rgba(160,200,255,0.45)'); gr.addColorStop(1, 'rgba(120,170,255,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, -1, 50, 5, 0, 0, 6.283); g.fill();
      g.strokeStyle = 'rgba(190,220,255,0.5)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, 54, 8, 0, 0, 6.283); g.stroke();
      g.restore();
    }
    if (o.durum === 'sonuk') {
      const by = o.y + Math.sin(tm * 1.1 + o.ph) * 4, yakin = DURUM === 'oyun' && Math.abs(P.x - o.x) < 700, nb = 0.5 + 0.5 * Math.sin(tm * 2.1 + o.ph), sw = Math.sin(tm * 0.8 + o.ph) * 0.12, SC = 1.4;
      g.globalCompositeOperation = 'lighter';
      ylSuYansima(o.x, su, 70, 0.2 + 0.06 * nb, '#8fa8ff', tm, o.ph / 6.28);
      dglow(YL_RENK[o.ri][3], o.x, by, 62, 0.1 + 0.05 * nb);
      for (let k = 0; k < 2; k++) { const u = ((tm * 0.55 + o.ph / 6.28 + k * 0.5) % 1); g.globalAlpha = (yakin ? 0.55 : 0.3) * (1 - u); g.strokeStyle = k ? '#ffb45a' : '#ffe08a'; g.lineWidth = 2.4; g.beginPath(); g.arc(o.x, by, 30 + 52 * u, 0, 6.283); g.stroke(); }
      g.globalAlpha = 1;
      dglow('#ffd27a', o.x, by, 90 + 14 * nb, (yakin ? 0.2 : 0.1) + 0.1 * nb);
      g.globalCompositeOperation = 'source-over';
      ylYildizCiz(o.x, by, SC, sw, 0, o.ri, 1); ylYuz(o.x, by + 2, SC, sw, yakin ? 0.12 : 0, 1);
      g.fillStyle = '#d8e0ff'; g.textAlign = 'center';
      for (let k = 0; k < 2; k++) { const u = ((tm * 0.35 + k * 0.5 + o.ph) % 1); g.globalAlpha = Math.sin(u * Math.PI) * 0.8; g.font = 'bold ' + Math.round(13 + 9 * u) + 'px sans-serif'; g.fillText('z', o.x + 34 + u * 22, by - 30 - u * 40); }
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'lighter'; ylGlint(o.x + 18, by - 26 + 6 * Math.sin(tm * 2), 13 + 4 * nb, 0.45 + 0.3 * nb, tm * 0.5); g.globalCompositeOperation = 'source-over';
    } else {
      // gittikten sonra suda kalan hafif ışık havuzu
      const k = o.durum === 'yerlesti' ? 0.55 : ylEase(Math.min(1, o.t / 0.6));
      g.globalCompositeOperation = 'lighter';
      ylSuYansima(o.x, su, 62, 0.13 * k + 0.04 * Math.sin(tm * 1.5 + o.ph), YL_RENK[o.ri][3], tm, o.ph / 6.28);
      g.globalCompositeOperation = 'source-over';
    }
  },
  cizOn(o, tm) {   // uyanma ve yükselme Feza'nın önünde
    if (o.durum === 'uyaniyor') {
      const u = Math.min(1, o.t / 1.0), y = o.y - o.rise, pu = Math.sin(u * Math.PI);
      g.globalCompositeOperation = 'lighter';
      dglow(YL_RENK[o.ri][3], o.x, y, 90 + 90 * pu, 0.5 * o.lit); dglow('#ffffff', o.x, y, 40 + 30 * pu, 0.55 * o.lit);
      const rr = 40 + 120 * u; g.globalAlpha = 0.5 * (1 - u); g.strokeStyle = YL_RENK[o.ri][3]; g.lineWidth = 3; g.beginPath(); g.arc(o.x, y, rr, 0, 6.283); g.stroke(); g.globalAlpha = 1;
      for (let i = 0; i < 6; i++) { const a = i * 1.047 + o.t * 2.4; ylGlint(o.x + Math.cos(a) * rr * 0.7, y + Math.sin(a) * rr * 0.7, 9 + 5 * pu, 0.8 * (1 - u * 0.6), a); }
      g.globalCompositeOperation = 'source-over';
      ylYildizCiz(o.x, y, o.sc, o.rot, o.lit, o.ri, 1); ylYuz(o.x, y + 1, o.sc, o.rot, ylEase(o.t / 0.5), 1, true, o.kar);
    } else if (o.durum === 'ucuyor') {
      const x = o.x2, y = o.y2;
      if (x === undefined) return;
      g.globalCompositeOperation = 'lighter';
      for (let i = 1; i < o.izN; i++) { const f = 1 - i / o.izN; dglow(YL_RENK[o.ri][3], o.iz[i * 2], o.iz[i * 2 + 1], 12 + 26 * f * o.sc, 0.5 * f * f); }
      dglow(YL_RENK[o.ri][3], x, y, 80 * o.sc + 20, 0.5); dglow('#ffffff', x, y, 36 * o.sc + 10, 0.5);
      g.globalCompositeOperation = 'source-over';
      ylYildizCiz(x, y, o.sc, o.rot, 1, o.ri, 1); if (o.sc > 0.55) ylYuz(x, y + 1, o.sc, o.rot, 1, clamp((o.sc - 0.55) * 4, 0, 1), Math.sin(o.t * 5 + o.ph) > 0.4, o.kar);
      g.globalCompositeOperation = 'lighter';
      ylGlint(x, y, 20 * o.sc + 5, 0.4 + 0.3 * Math.sin(tm * 14), tm * 1.5);
      g.globalCompositeOperation = 'source-over';
    } else if (o.durum === 'yerlesti' && o.t < 1.6) {   // yerleşme anındaki parlama (gök yıldızı artık dunya2.js'te)
      const u = o.t / 1.6, tg = ylGok(o.gokX, o.gokY);
      g.globalCompositeOperation = 'lighter';
      dglow('#ffffff', tg.x, tg.y, 30 + 80 * u, 0.6 * (1 - u)); ylGlint(tg.x, tg.y, 40 * (1 - u) + 6, 0.8 * (1 - u), u * 2);
      g.lineWidth = 2.5; g.strokeStyle = YL_RENK[o.ri][3];
      for (let k = 0; k < 3; k++) { const v = clamp(u * 1.3 - k * 0.22, 0, 1); if (v > 0 && v < 1) { g.globalAlpha = 0.6 * (1 - v); g.beginPath(); g.arc(tg.x, tg.y, 14 + 80 * ylEase(v), 0, 6.283); g.stroke(); } }
      g.globalAlpha = 1;
      let pr = null; for (const e of YILDIZLAR) if (e.uyandi && e.o !== o && e.t <= o.yl.t && (!pr || e.t > pr.t)) pr = e;
      if (pr) { const pp = ylGok(pr.x, pr.y), f = ylEase(Math.min(1, u * 2.2)); g.globalAlpha = 0.7 * (1 - u); g.strokeStyle = '#fff2c8'; g.lineWidth = 2; g.beginPath(); g.moveTo(tg.x, tg.y); g.lineTo(lerp(tg.x, pp.x, f), lerp(tg.y, pp.y, f)); g.stroke(); g.globalAlpha = 1; }
      dglow('#ffffff', tg.x, tg.y, 300 * ylEase(u), 0.08 * (1 - u));
      g.globalCompositeOperation = 'source-over';
    }
  },
});

// Yürüyerek küçük basamak çıkma (≤16 birim): üstten geçilen cisimler (taş, ada) Feza'yı ancak üstünden düşerken yakalar; kıyıdan (720)
// 716'daki ilk taşa ZIPLAMADAN yürüyen çocuk taşın altından geçip suya düşüyordu (bot ölçümü, LEVEL12). Yerde yürürken ayaklar taşın
// üst yüzünün biraz altındaysa ve gövde taşın üstüne girdiyse Feza yumuşakça taşın üstüne alınır (görünmez küçük adım).
const YL_BASAMAK = 17;
function ylBasamak(o) {
  const c = o.cisim; if (!c || !c.aktif || !P.ground || P.fade > 0 || DURUM !== 'oyun') return;
  if (typeof ustundeki !== 'undefined' && ustundeki === o) return;
  const top = o.y - c.h, d = P.y - top; if (d <= 0.5 || d > YL_BASAMAK) return;
  const hw = c.w / 2, on = 3;   // ön kenar taşa değince (≤3); arka ayak hâlâ eski zeminde (boşluk ≤ 2·PW), Feza havada kalmadan alınır
  if (P.x < o.x ? (P.vx < 5 || P.x + PW + on <= o.x - hw) : (P.vx > -5 || P.x - PW - on >= o.x + hw)) return;
  P.y = top; P.vy = 0;
}
// ───────────────────────── yildizTasi (suyun üstünde basılan taş) ─────────────────────────
let ylZ = null;   // zincir adı → taşlar (soldan sağa)
function ylZincirKur() {
  ylZ = {};
  for (const o of NESNELER) if (o.tip === 'yildizTasi') (ylZ[o.zincir || 'x'] = ylZ[o.zincir || 'x'] || []).push(o);
  for (const k in ylZ) ylZ[k].sort((a, b) => a.x - b.x);
  // küçük yükselti farkları (≤8) düzleştirilir: bitişik taşlarda yürürken 'basamak çıkamama' olmasın; büyük farklar (zıplama gerektiren) korunur
  for (const k in ylZ) { const z = ylZ[k]; for (let i = 1; i < z.length; i++) if (Math.abs(z[i].y - z[i - 1].y) <= 8) z[i].y = z[i - 1].y; }
}
const YL_TAS_W = 144;
let ylTasYildiz = null;
function ylTasVaryant(v) {   // 1: nilüfer yaprağı, 2: kristal kaya (aynı tuval/çapa: üst yüz merkezi (W2/2, 14))
  const key = 'tas' + v; if (ylSp[key]) return ylSp[key];
  const k = 3, W2 = YL_TAS_W + 16, H2 = 46, c = ylCan(W2 * k, H2 * k), x = c.getContext('2d');
  x.scale(k, k); x.translate(W2 / 2, 14);
  const hw = YL_TAS_W / 2, rs = rng(31 + v);
  if (v === 1) {
    x.fillStyle = '#145f66'; x.beginPath(); x.ellipse(0, 6, hw, 11, 0, 0, 6.283); x.fill();   // kalınlık
    const g1 = x.createRadialGradient(-12, -3, 3, 0, 0, hw); g1.addColorStop(0, '#6df0c0'); g1.addColorStop(0.6, '#2fb59a'); g1.addColorStop(1, '#1a7f86');
    x.fillStyle = g1; x.beginPath(); x.ellipse(0, 0, hw, 10.5, 0, 0, 6.283); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.moveTo(0, 0); x.lineTo(hw + 4, -3); x.lineTo(hw + 4, 5); x.closePath(); x.fill(); x.globalCompositeOperation = 'source-over';   // yaprak çentiği
    x.strokeStyle = 'rgba(200,255,235,0.45)'; x.lineWidth = 1; for (let i = 0; i < 10; i++) { const a = 0.4 + i * 0.58; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * (hw - 4), Math.sin(a) * 9.5); x.stroke(); }
    x.strokeStyle = 'rgba(210,255,240,0.8)'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(0, 0, hw - 0.7, 9.8, 0, 0.5, 6.0); x.stroke();
    for (const [fx, c1] of [[-hw + 22, '#ffb8e0'], [-hw + 32, '#fff0fa']]) { x.fillStyle = c1; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.5; x.beginPath(); x.ellipse(fx + Math.cos(a) * 5, -4 + Math.sin(a) * 5, 2.4, 5, a + Math.PI / 2, 0, 6.283); x.fill(); } }
  } else {
    const sg = x.createLinearGradient(0, 0, 0, 28); sg.addColorStop(0, '#2c6fb0'); sg.addColorStop(1, '#14346e');
    x.fillStyle = sg; x.beginPath(); x.moveTo(-hw, 0); x.lineTo(-hw + 12, 24); x.lineTo(-18, 28); x.lineTo(20, 26); x.lineTo(hw - 10, 22); x.lineTo(hw, 0); x.closePath(); x.fill();
    const tg = x.createLinearGradient(-hw, -9, hw, 9); tg.addColorStop(0, '#c4fbff'); tg.addColorStop(0.5, '#7fdcf5'); tg.addColorStop(1, '#4aa0d8');
    x.fillStyle = tg; x.beginPath(); x.ellipse(0, 0, hw, 10, 0, 0, 6.283); x.fill();
    x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 1.2; for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(a) * hw * 0.92, Math.sin(a) * 9); x.stroke(); }
    x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(0, 0, hw - 0.7, 9.3, 0, Math.PI * 1.02, Math.PI * 1.98); x.stroke();
    x.fillStyle = 'rgba(120,240,255,0.5)'; for (let i = 0; i < 3; i++) { const px = -30 + i * 30; x.beginPath(); x.moveTo(px - 4, 22); x.lineTo(px, 34 + rs() * 4); x.lineTo(px + 4, 23); x.closePath(); x.fill(); }
  }
  x.save(); x.scale(1, 0.23); const P1 = new Path2D(); ylYol(P1, 15, 0.5); x.fillStyle = v === 1 ? 'rgba(10,80,80,0.5)' : 'rgba(20,70,140,0.5)'; x.fill(P1); x.restore();
  return ylSp[key] = c;
}
function ylTasSprite(v) {
  if (v === 1 || v === 2) return ylTasVaryant(v);
  const key = 'tas' + v; if (ylSp[key]) return ylSp[key];
  const k = 3, W2 = YL_TAS_W + 16, H2 = 46, c = ylCan(W2 * k, H2 * k), x = c.getContext('2d');
  x.scale(k, k); x.translate(W2 / 2, 14);
  const hw = YL_TAS_W / 2, rs = rng(7 + v * 13);
  // yan yüz (kalınlık)
  const sg = x.createLinearGradient(0, 0, 0, 22); sg.addColorStop(0, '#4a45b0'); sg.addColorStop(0.6, '#2b2878'); sg.addColorStop(1, '#171652');
  x.fillStyle = sg; x.beginPath(); x.moveTo(-hw, 0); x.bezierCurveTo(-hw, 22, -hw * 0.6, 26, 0, 26); x.bezierCurveTo(hw * 0.6, 26, hw, 22, hw, 0); x.closePath(); x.fill();
  // üst yüz
  const tg = x.createLinearGradient(-hw, -9, hw, 9); tg.addColorStop(0, '#9a94ff'); tg.addColorStop(0.5, '#7a72ee'); tg.addColorStop(1, '#5a52c8');
  x.fillStyle = tg; x.beginPath(); x.ellipse(0, 0, hw, 10, 0, 0, 6.283); x.fill();
  x.strokeStyle = 'rgba(214,208,255,0.85)'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(0, 0, hw - 0.7, 9.3, 0, Math.PI * 1.02, Math.PI * 1.98); x.stroke();   // ön-üst kenar ışığı değil, arka kenar
  x.strokeStyle = 'rgba(30,26,100,0.5)'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(0, 0, hw - 0.7, 9.3, 0, 0.05, Math.PI - 0.05); x.stroke();
  // çatlak/doku çizgileri
  x.strokeStyle = 'rgba(30,26,110,0.35)'; x.lineWidth = 0.9;
  for (let i = 0; i < 5; i++) { const a = rs() * 6.28, r0 = 12 + rs() * 18; x.beginPath(); x.moveTo(Math.cos(a) * r0, Math.sin(a) * r0 * 0.2); x.lineTo(Math.cos(a + 0.4) * (r0 + 10), Math.sin(a + 0.4) * (r0 + 10) * 0.2); x.stroke(); }
  // kazınmış yıldız (üst yüzde yassı)
  x.save(); x.scale(1, 0.23); const P1 = new Path2D(); ylYol(P1, 15, 0.5);
  x.fillStyle = 'rgba(30,26,110,0.55)'; x.fill(P1); x.restore();
  // alt kenar parıltı çizgileri
  x.fillStyle = 'rgba(150,210,255,0.35)'; x.beginPath(); x.ellipse(0, 22, hw * 0.55, 2.2, 0, 0, 6.283); x.fill();
  return ylSp[key] = c;
}
function ylTasKur(o) {
  if (!ylZ) ylZincirKur();
  o.cisim = { w: 148, h: 2, tip: 'ustten', aktif: !!o.hep, dx: 0, dy: 0 };
  o.aktif = !!o.hep; o.acik = o.hep ? 1 : 0; o.ghost = 0; o.parla = 0; o.bas = false; o.ph = (o.x * 0.011) % 6.28; o.t0 = 0; o.v = (((o.sira || 0) + Math.floor(o.x / 168)) % 3 + 3) % 3; if (o.zincir === 'bulmaca') o.v = 0; o.sz = 0;
}
function ylTasAc(o) {
  if (o.aktif) return;
  o.aktif = true; o.cisim.aktif = true; o.t0 = now;
  ylSuHalka(o.x, o.y + 18, true); burst(o.x, o.y - 6, 10, ['#bff4ff', '#ffffff', '#d8c8ff'], 90, 0.9, 6);
  ylSfx('yildizTasBelir', o.sira || 0);
}
TUR.kaydet('yildizTasi', {
  kur(o) { ylTasKur(o); },
  guncelle(o, dt) {
    const z = ylZ[o.zincir || 'x'], i = o.sira || 0, onc = i > 0 ? z[i - 1] : null;
    if (!o.aktif && DURUM === 'oyun') {
      const dx = Math.abs(P.x - o.x);
      let ac = onc ? onc.bas : (dx < 460 && P.ground);
      if (!ac && dx < 150 && P.y < o.y + 90) ac = true;   // yedek: yakına gelen bir Feza (adadan, minderden...) ayakta kalabilsin
      if (ac) ylTasAc(o);
    }
    ylBasamak(o);
    const gh = (!o.aktif && Math.abs(P.x - o.x) < 760) ? 1 : 0;   // Feza zincire yaklaşınca bütün zincir silik görünür
    o.ghost = lerp(o.ghost, gh, 1 - Math.exp(-dt * 3));
    if (o.aktif) o.acik = Math.min(1, o.acik + dt / 0.5);
    const st = typeof ustundeki !== 'undefined' && ustundeki === o;
    if (st && !o.on) {
      if (!o.bas) { o.bas = true; burst(o.x, o.y - 8, 14, ['#ffe9a8', '#ffffff', '#bff4ff'], 130, 1.0, 7); ylSfx('yildizTas', i); }
      o.parla = 1; ylSuHalka(o.x, o.y + 18, true);
    }
    o.on = st; o.sz = lerp(o.sz, st ? 3 : 0, 1 - Math.exp(-dt * 10));
    o.parla = Math.max(0, o.parla - dt * 0.7);
  },
  ciz(o, tm) {
    const a = o.acik, gh = o.ghost;
    const su = ylSu();
    if (a > 0.01) {
      const e = ylEase(a), pop = 1 + Math.sin(Math.min(1, a) * Math.PI) * 0.12, bob = Math.sin(tm * 1.2 + o.ph) * 1.2;
      const L = o.bas ? 0.4 + 0.6 * o.parla : 0.18, y = o.y - 2 + (1 - e) * 22 + o.sz + bob, sc = (0.55 + 0.45 * e) * pop;
      g.globalCompositeOperation = 'lighter';
      ylSuYansima(o.x, su, 62, 0.2 * e, o.bas ? '#ffe9a8' : '#9ec8ff', tm, o.ph / 6.28);
      dglow(o.bas ? '#ffe9a8' : '#a8c8ff', o.x, y + 6, 74 * sc, (0.14 + 0.5 * L) * e);
      g.globalCompositeOperation = 'source-over';
      const sp = ylTasSprite(o.v), w = sp.width / 3 * sc, h = sp.height / 3 * sc;
      g.globalAlpha = Math.min(1, a * 2.5); g.drawImage(sp, o.x - w / 2, y - 14 * sc, w, h); g.globalAlpha = 1;
      // üstteki yıldız: basılınca altın parıltı
      g.save(); g.translate(o.x, y); g.scale(1, 0.23);
      if (o.bas) { if (!ylTasYildiz) { ylTasYildiz = new Path2D(); ylYol(ylTasYildiz, 16, 0.5); } g.globalAlpha = Math.min(1, 0.6 + 0.4 * o.parla); g.fillStyle = '#ffe9a8'; g.fill(ylTasYildiz); g.strokeStyle = '#fffbe8'; g.lineWidth = 1.6; g.stroke(ylTasYildiz); g.globalAlpha = 1; }
      g.globalCompositeOperation = 'lighter';
      dglow(o.bas ? '#ffe9a8' : '#9ec8ff', 0, 0, 34, 0.2 + 0.7 * L); if (L > 0.3) dglow('#ffffff', 0, 0, 16, 0.5 * (L - 0.3));
      g.restore(); g.globalCompositeOperation = 'lighter';
      if (o.parla > 0.02) { const u = 1 - o.parla; g.globalAlpha = 0.5 * o.parla; g.strokeStyle = '#ffe9a8'; g.lineWidth = 2.2; g.beginPath(); g.ellipse(o.x, y + 4, 40 + 120 * u, 6 + 16 * u, 0, 0, 6.283); g.stroke(); g.globalAlpha = 1; }
      if (o.parla > 0.05) ylGlint(o.x + Math.sin(tm * 3) * 10, y - 10, 9 + 6 * o.parla, 0.55 * o.parla, tm * 2);
      g.globalCompositeOperation = 'source-over';
    }
    if (gh > 0.01) {   // sıradaki taşın yumuşak silüeti (nereye basılacağını gösterir)
      const sp = ylTasSprite(o.v), w = sp.width / 3, h = sp.height / 3, pu = 0.5 + 0.5 * Math.sin(tm * 2.4 + o.ph);
      g.globalAlpha = gh * (0.2 + 0.12 * pu); g.drawImage(sp, o.x - w / 2, o.y - 2 + 8 - 14, w, h); g.globalAlpha = 1;
      g.globalCompositeOperation = 'lighter'; dglow('#bff4ff', o.x, o.y + 4, 56, gh * (0.12 + 0.12 * pu)); ylSuYansima(o.x, su, 50, gh * 0.12, '#bff4ff', tm, o.ph / 6.28);
      g.globalCompositeOperation = 'source-over';
    }
  },
});

// ───────────────────────── yildizAda (yüzen ada) ─────────────────────────
function ylAdaAgac(w, seed) { return (seed % 2 ? 1 : -1) * w * (0.3 + (seed % 4) * 0.02); }
function ylAdaSprite(w, seed) {
  const key = 'ada' + w + '_' + seed; if (ylSp[key]) return ylSp[key];
  const k = 2.5, W2 = w + 60, H2 = 234, c = ylCan(W2 * k, H2 * k), x = c.getContext('2d'), rs = rng(seed);
  x.scale(k, k); x.translate(W2 / 2, 120);
  const hw = w / 2;
  // alt kaya (sivri, kristalli)
  const rg = x.createLinearGradient(0, 0, 0, 100); rg.addColorStop(0, '#5a52b8'); rg.addColorStop(0.5, '#322d86'); rg.addColorStop(1, '#171552');
  x.fillStyle = rg; x.beginPath(); x.moveTo(-hw, 2);
  x.bezierCurveTo(-hw * 0.95, 26, -hw * 0.6, 40, -hw * 0.45, 56); x.bezierCurveTo(-hw * 0.3, 74, -hw * 0.15, 80, -6, 98);
  x.lineTo(2, 104); x.bezierCurveTo(hw * 0.2, 80, hw * 0.45, 70, hw * 0.55, 52); x.bezierCurveTo(hw * 0.8, 38, hw * 0.98, 24, hw, 2); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(160,150,255,0.35)'; x.lineWidth = 1.4; x.stroke();
  // kaya dokusu çizgileri
  x.strokeStyle = 'rgba(20,16,80,0.4)'; x.lineWidth = 1.1;
  for (let i = 0; i < 9; i++) { const px = (rs() - 0.5) * hw * 1.4, py = 10 + rs() * 40; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rs() - 0.5) * 24, py + 14 + rs() * 22); x.stroke(); }
  // üst: çimenli yüzey
  const PALA = [['#6fe6c8', '#38b5a8', '#23708c'], ['#f6c4f0', '#c88ad8', '#7a5aa8'], ['#ffe39a', '#e0a860', '#9a6a4a']][seed % 3];
  const tg = x.createLinearGradient(0, -14, 0, 14); tg.addColorStop(0, PALA[0]); tg.addColorStop(0.55, PALA[1]); tg.addColorStop(1, PALA[2]);
  x.fillStyle = tg; x.beginPath(); x.moveTo(-hw - 4, 4); x.bezierCurveTo(-hw * 0.7, -12, hw * 0.7, -12, hw + 4, 4); x.bezierCurveTo(hw * 0.8, 20, -hw * 0.8, 20, -hw - 4, 4); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(210,255,240,0.65)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(-hw - 3, 3); x.bezierCurveTo(-hw * 0.7, -11.5, hw * 0.7, -11.5, hw + 3, 3); x.stroke();
  // ot tutamları
  for (let i = 0; i < 26; i++) {
    const t = rs(), px = (t - 0.5) * (w - 10), py = -5.8 * Math.sin(t * Math.PI) * 1.6 + 1.5 - 3;
    x.strokeStyle = rs() < 0.5 ? PALA[0] : PALA[1]; x.lineWidth = 1.3; x.lineCap = 'round';
    for (let j = 0; j < 3; j++) { x.beginPath(); x.moveTo(px + j * 2, py); x.quadraticCurveTo(px + j * 2 + (j - 1) * 2.5, py - 6, px + j * 3.2 - 2, py - 8 - rs() * 5); x.stroke(); }
  }
  // minik yıldız ağacı (ada başına bir tane): ince gövde, yuvarlak lavanta taç, altın yıldız meyveleri
  { const tx = ylAdaAgac(w, seed), th = 62 + (seed % 3) * 8;
    x.strokeStyle = '#3a2f86'; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(tx, -4); x.bezierCurveTo(tx - 6, -th * 0.4, tx + 6, -th * 0.7, tx + 2, -th); x.stroke();
    x.strokeStyle = '#6a5cd0'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(tx + 1, -4); x.bezierCurveTo(tx - 4, -th * 0.4, tx + 7, -th * 0.7, tx + 3, -th); x.stroke();
    for (const [dx, dy, r, c0, c1] of [[-16, -th + 4, 20, '#a08cff', '#6454c8'], [16, -th + 2, 22, '#b49cff', '#7060d4'], [0, -th - 14, 24, '#c4acff', '#8068dc'], [-2, -th + 12, 18, '#9a86f8', '#5c4cc0']]) {
      const cg = x.createRadialGradient(tx + dx - 5, dy - 6, 2, tx + dx, dy, r); cg.addColorStop(0, c0); cg.addColorStop(1, c1); x.fillStyle = cg; x.beginPath(); x.arc(tx + dx, dy, r, 0, 6.283); x.fill(); }
    x.fillStyle = 'rgba(255,255,255,0.22)'; x.beginPath(); x.ellipse(tx - 6, -th - 22, 14, 7, -0.4, 0, 6.283); x.fill(); }
  // pürüz: küçük kayalar
  for (let i = 0; i < 4; i++) { const px = (rs() - 0.5) * (w - 60), py = -2.5; x.fillStyle = '#8a82f0'; x.beginPath(); x.ellipse(px, py, 5 + rs() * 4, 3.4, 0, 0, 6.283); x.fill(); x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.ellipse(px - 1.5, py - 1.3, 2, 1, 0, 0, 6.283); x.fill(); }
  return ylSp[key] = c;
}
TUR.kaydet('yildizAda', {
  kur(o) {
    const w = o.w || 260;
    o.cisim = { w: w - 2, h: 2, tip: 'ustten', aktif: true, dx: 0, dy: 0 };
    o.ph = (o.x * 0.007) % 6.28; o.seed = 11 + Math.floor(o.x / 13) % 40; o.sz = 0; o.on = false; o.parla = 0;
    const rs = rng(o.seed * 3 + 1); o.kris = []; o.cic = [];
    for (let i = 0; i < 5; i++) o.kris.push({ x: (rs() - 0.5) * (w * 0.62), y: 20 + rs() * 22, l: 14 + rs() * 22, c: ['#7ff0ff', '#ffb8e6', '#bfa8ff', '#9fffd8'][i % 4], ph: rs() * 6.28 });
    for (let i = 0; i < 7; i++) o.cic.push({ x: (rs() - 0.5) * (w - 50), c: ['#ffe9a8', '#bff4ff', '#ffc8e6'][i % 3], ph: rs() * 6.28 });
  },
  guncelle(o, dt) {
    ylBasamak(o);
    const st = typeof ustundeki !== 'undefined' && ustundeki === o;
    if (st && !o.on) { o.parla = 1; ylSuHalka(o.x, ylSu() - 2, true); burst(o.x + (P.x - o.x), o.y - 4, 8, ['#bff4ff', '#ffffff'], 70, 0.8, 5); }
    o.on = st; o.sz = lerp(o.sz, st ? 2.5 : 0, 1 - Math.exp(-dt * 8)); o.parla = Math.max(0, o.parla - dt * 0.8);
  },
  ciz(o, tm) {
    const w = o.w || 260, bob = Math.sin(tm * 0.8 + o.ph) * 1.5 + o.sz, y = o.y - 2, su = ylSu();
    g.globalCompositeOperation = 'lighter';
    ylSuYansima(o.x, su, w * 0.55, 0.22, '#7ff0e0', tm, o.ph / 6.28);
    ylSuYansima(o.x, su, w * 0.4, 0.12, '#b8a8ff', tm * 0.7, o.ph / 6.28 + 0.4);
    dglow('#7ff0e0', o.x, y + 30, w * 0.5, 0.1 + 0.06 * Math.sin(tm + o.ph)); g.globalCompositeOperation = 'source-over';
    // sarkan kristaller (ada çizilmeden önce, kayanın arkasında)
    g.globalCompositeOperation = 'lighter';
    for (const k of o.kris) { const sw = Math.sin(tm * 1.1 + k.ph); dglow(k.c, o.x + k.x, y + k.y + k.l * 0.6 + bob, 34, 0.25 + 0.15 * sw); }
    g.globalCompositeOperation = 'source-over';
    const sp = ylAdaSprite(w, o.seed), sw = sp.width / 2.5, sh = sp.height / 2.5;
    g.drawImage(sp, o.x - sw / 2, y - 120 + bob * 0.4, sw, sh);
    for (const k of o.kris) {   // sivri parlak kristaller (kayanın önünde)
      const sw2 = Math.sin(tm * 1.1 + k.ph), kx = o.x + k.x, ky = y + k.y + bob;
      g.fillStyle = k.c; g.globalAlpha = 0.85; g.beginPath(); g.moveTo(kx - 3.4, ky); g.lineTo(kx, ky + k.l); g.lineTo(kx + 3.4, ky); g.closePath(); g.fill();
      g.globalAlpha = 0.5; g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(kx - 1, ky); g.lineTo(kx, ky + k.l * 0.8); g.lineTo(kx + 1.2, ky); g.closePath(); g.fill(); g.globalAlpha = 1;
    }
    g.globalCompositeOperation = 'lighter';
    { const tx = o.x + ylAdaAgac(w, o.seed), th = 62 + (o.seed % 3) * 8;
      for (let i = 0; i < 5; i++) { const fa = i * 1.9 + o.ph, fx = tx + Math.cos(fa) * 24, fy = y - th - 6 + Math.sin(fa * 1.3) * 16, pu = 0.55 + 0.45 * Math.sin(tm * 1.7 + i * 1.3); dglow('#ffe9a8', fx, fy, 15, 0.55 * pu); dglow('#ffffff', fx, fy, 5, 0.7 * pu); }
      dglow('#b8a0ff', tx, y - th, 70, 0.1 + 0.05 * Math.sin(tm + o.ph)); }
    for (const c of o.cic) { const pu = 0.55 + 0.45 * Math.sin(tm * 1.6 + c.ph); dglow(c.c, o.x + c.x, y - 6, 15, 0.35 * pu); dglow('#ffffff', o.x + c.x, y - 6, 5, 0.5 * pu); }
    if (o.parla > 0.02) dglow('#bff4ff', o.x, y - 6, w * 0.55, 0.18 * o.parla);
    g.globalCompositeOperation = 'source-over';
  },
});

// ───────────────────────── yildizBas (kaplumbağanın başı: yalnız katı cisim) ─────────────────────────
TUR.kaydet('yildizBas', {
  kur(o) { o.cisim = { w: 118, h: 70, tip: 'kati', aktif: true, dx: 0, dy: 0 }; },
});

// ───────────────────────── yildizHayvan: Yıldız Kaplumbağası ─────────────────────────
const YL_KB = { a: 168, b: 188, k: 2 };   // kabuk yarı genişliği, yüksekliği, sprite çözünürlüğü
// sırttaki noktalar (kabuk koordinatı, taban = 0,0): 3 büyük (buyukIcin yıldızları yakar) + küçükler
const YL_NOK = [[-82, -116], [0, -150], [88, -112]];
const YL_KUCUK = [[-124, -80], [-44, -94], [42, -88], [122, -76], [-34, -56], [44, -52], [-4, -118], [-110, -52], [112, -48]];
const YL_CIZGI = [[0, 1], [1, 2]];   // büyük noktalar arası çizgi (ışık yoluyla yanar)
// kabuk kenarındaki ışıklı kristaller ve yosun tutamları: [x, y, boy, renk]
const YL_KRIS = [[-112, -26, 14, '#8ff0ff'], [-20, -22, 11, '#bfa8ff'], [74, -24, 13, '#ffb8e6']];
const YL_YOSUN = [-128, -52, 40, 120];
function ylKabukYol(p, a, b, ox, oy) {
  p.moveTo(ox + a, oy);
  for (let i = 0; i <= 40; i++) { const th = Math.PI * i / 40, s = Math.pow(Math.sin(th), 0.72); p.lineTo(ox + Math.cos(th) * a, oy - s * b); }
  p.closePath();
}
function ylSegen(x, cx, cy, r, ri) {   // altıgen plaka: derinlik (ışık sol-üst, gölge sağ-alt)
  x.beginPath(); for (let i = 0; i < 6; i++) { const an = Math.PI / 6 + i * Math.PI / 3, px = cx + Math.cos(an) * r, py = cy + Math.sin(an) * r; if (i) x.lineTo(px, py); else x.moveTo(px, py); } x.closePath();
}
function ylHayvanSprite() {   // kabuk (durağan): boyalı gradyan, derinlikli plakalar, mini takımyıldızlar, yosun, yuvalar
  if (ylSp.hayvan) return ylSp.hayvan;
  const k = YL_KB.k, c = ylCan(470 * k, 250 * k), x = c.getContext('2d');
  x.scale(k, k); x.translate(215, 225);   // orijin: gövde merkezi, taban y=0
  const a = YL_KB.a, b = YL_KB.b, rs = rng(5);
  const KP = new Path2D(); ylKabukYol(KP, a, b, 0, -22);
  // gövde: lacivert → mor → turkuaz kenar
  const kg = x.createLinearGradient(-a * 0.6, -b, a * 0.4, 0); kg.addColorStop(0, '#7a68ec'); kg.addColorStop(0.4, '#43388f'); kg.addColorStop(0.8, '#2a2a7a'); kg.addColorStop(1, '#1c4a8a');
  x.fillStyle = kg; x.fill(KP);
  x.save(); x.clip(KP);
  // plakalar
  const hs = 40;
  for (let r = -1; r < 6; r++) for (let q = -6; q < 7; q++) {
    const cx = q * hs * 1.73 + (r % 2 ? hs * 0.865 : 0), cy = -22 - 16 - r * hs * 1.5;
    ylSegen(x, cx, cy, hs * 0.93);
    const pg = x.createRadialGradient(cx - 10, cy - 12, 3, cx, cy, hs); pg.addColorStop(0, 'rgba(190,176,255,0.42)'); pg.addColorStop(0.6, 'rgba(110,98,220,0.16)'); pg.addColorStop(1, 'rgba(10,12,70,0.34)');
    x.fillStyle = pg; x.fill();
    x.lineWidth = 2.6; x.strokeStyle = 'rgba(12,10,60,0.55)'; x.save(); x.translate(1.2, 1.4); ylSegen(x, cx, cy, hs * 0.93); x.stroke(); x.restore();   // alt-sağ gölge çizgisi
    x.lineWidth = 1.6; x.strokeStyle = 'rgba(205,198,255,0.55)'; ylSegen(x, cx, cy, hs * 0.93); x.stroke();                                           // üst-sol parlak kenar
    if (rs() < 0.25) {   // plakada soluk mini takımyıldızı
      const pts = []; for (let i = 0; i < 4; i++) pts.push([cx + (rs() - 0.5) * hs * 0.9, cy + (rs() - 0.5) * hs * 0.8]);
      x.strokeStyle = 'rgba(220,226,255,0.22)'; x.lineWidth = 0.9; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke();
      x.fillStyle = 'rgba(240,244,255,0.5)'; for (const p of pts) { x.beginPath(); x.arc(p[0], p[1], 1.5, 0, 6.283); x.fill(); }
    }
  }
  // üst ışık + alt turkuaz yansıma
  const hl = x.createRadialGradient(-50, -b + 14, 4, -50, -b + 14, 170); hl.addColorStop(0, 'rgba(225,215,255,0.55)'); hl.addColorStop(1, 'rgba(225,215,255,0)');
  x.fillStyle = hl; x.fillRect(-a - 10, -b - 30, a * 2 + 20, b + 30);
  const lw = x.createLinearGradient(0, -60, 0, -22); lw.addColorStop(0, 'rgba(70,220,230,0)'); lw.addColorStop(1, 'rgba(70,220,230,0.35)'); x.fillStyle = lw; x.fillRect(-a - 10, -60, a * 2 + 20, 40);
  for (let i = 0; i < 90; i++) { const px = (rs() - 0.5) * a * 1.8, py = -22 - rs() * b * 0.95; x.fillStyle = 'rgba(255,255,255,' + (0.12 + rs() * 0.4) + ')'; x.beginPath(); x.arc(px, py, 0.6 + rs() * 1.1, 0, 6.283); x.fill(); }
  x.restore();
  // kenar bandı (altın): yumuşak yuvarlak uçlu, altı yuvarlak dilimli; altında ince koyu kenar
  const bg = x.createLinearGradient(0, -34, 0, -2); bg.addColorStop(0, '#ffefb8'); bg.addColorStop(0.5, '#e8b868'); bg.addColorStop(1, '#a8743a');
  { const bl = -a - 2, br2 = a + 2, bt = -23, bb = -9, r = 10;
    x.beginPath(); x.moveTo(bl + r, bt); x.lineTo(br2 - r, bt); x.quadraticCurveTo(br2, bt, br2, bt + r); x.lineTo(br2, bb);
    const n = 14, w = (br2 - bl) / n; for (let i = 0; i < n; i++) { const x1 = br2 - i * w, x2 = br2 - (i + 1) * w; x.quadraticCurveTo((x1 + x2) / 2 + 0, bb + 11, x2, bb); }
    x.lineTo(bl, bt + r); x.quadraticCurveTo(bl, bt, bl + r, bt); x.closePath();
    x.fillStyle = bg; x.fill(); x.strokeStyle = 'rgba(60,30,10,0.55)'; x.lineWidth = 2; x.stroke(); }
  x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(-a + 12, -22, a * 2 - 24, 1.8);
  for (let i = -7; i <= 7; i++) { x.fillStyle = 'rgba(120,70,20,0.35)'; x.beginPath(); x.arc(i * 21, -15, 2.2, 0, 6.283); x.fill(); }
  x.strokeStyle = 'rgba(215,205,255,0.85)'; x.lineWidth = 2.6; x.stroke(KP);
  // yosun tutamları kabuk kenarında
  for (const mx of YL_YOSUN) {
    const my = -22 - Math.pow(1 - Math.pow(Math.abs(mx) / a, 2), 0.5) * 0;
    for (let j = 0; j < 4; j++) { x.strokeStyle = j % 2 ? '#7ff0c8' : '#4fd6a8'; x.lineWidth = 2.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(mx + j * 3 - 4, my - 1); x.quadraticCurveTo(mx + j * 3 - 4 + (j - 1.5) * 3, my - 9, mx + j * 4 - 6, my - 12 - rs() * 7); x.stroke(); }
  }
  // yuvalar: koyu çukur + altın halka + sönük yıldız
  const D = ylYildizSprite('dim', 0), dw = D.width / YL_K;
  for (const [nx2, ny] of YL_NOK) {
    const sg = x.createRadialGradient(nx2, ny, 4, nx2, ny, 27); sg.addColorStop(0, 'rgba(6,4,40,0.85)'); sg.addColorStop(1, 'rgba(6,4,40,0.35)');
    x.fillStyle = sg; x.beginPath(); x.arc(nx2, ny, 27, 0, 6.283); x.fill();
    x.strokeStyle = '#f0c870'; x.lineWidth = 2.6; x.stroke(); x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 1; x.beginPath(); x.arc(nx2, ny, 24.5, 0, 6.283); x.stroke();
    for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; x.fillStyle = '#ffe3a0'; x.beginPath(); x.arc(nx2 + Math.cos(an) * 27, ny + Math.sin(an) * 27, 1.6, 0, 6.283); x.fill(); }
    x.drawImage(D, nx2 - dw * 0.64 / 2, ny - dw * 0.64 / 2, dw * 0.64, dw * 0.64);
  }
  for (const [nx2, ny] of YL_KUCUK) { x.fillStyle = 'rgba(210,218,255,0.4)'; x.beginPath(); x.arc(nx2, ny, 2.8, 0, 6.283); x.fill(); }
  return ylSp.hayvan = c;
}
function ylNokDunya(o, i) { const p = YL_NOK[i]; return { x: o.x + p[0], y: o.y + p[1] + (o.vdrop || 0) }; }

TUR.kaydet('yildizHayvan', {
  kur(o) {
    ylHayvan = o;
    o.uyandi = false; o.hazir = false; o.asama = 0; o.yan = [0, 0, 0]; o.yanT = [0, 0, 0]; o.orb = []; o.t = 0; o.aT = 99; o.firlat = false; o.fT = 0; o.bitti = false;
    o.cisim = { w: 318, h: 190, tip: 'kati', aktif: true, dx: 0, dy: 0 };
    o.hSq = 1; o.hHeadY = 0; o.hRot = 0; o.nef = 0; o.nefT = 0; o.goz = 'uyku'; o.agiz = 'o'; o.agizB = 0; o.kirp = 0; o.kirpT = 2 + Math.random() * 2; o.sal = 0; o.kik = 0;
    o.bas = NESNELER.find(n => n.tip === 'yildizBas') || null; o.hazT = 0; o.rg = 0; o.zz = []; o.zzT = 0; o.bak = 0; o.salla = 0; o.bitirT = 0;
    // yeni canlandırma durumu
    o.lidL = 1; o.lidR = 1; o.mutluA = 0; o.mOpen = 0; o.mSmile = 0; o.hapT = 2;
    o.drop = 0;        // fiziksel çömelme (cisim yüksekliği = 190 - drop)
    o.vdrop = 0;       // görsel çömelme (drop + yay + ağırlık)
    o.sq = 0; o.sqV = 0; o.agirlik = 0; o.boyUz = 0; o.pati = 0; o.burunK = 0; o.kuyrukS = 0; o.halka = []; o.halkaT = 0; o.baloncuk = 0; o.baloncukT = 2; o.bakY = 0; o.sev = 0;
  },
  ustune(o, vy) {
    if (!o.hazir) {   // uyurken sırtına çıkılırsa kabuğu onu yumuşakça geri sektirir
      P.vy = -700; P.vx = -170; P.ground = false; o.kik = 0.7; o.nef = 1; o.sqV = 140;
      burst(P.x, o.y - o.cisim.h, 8, ['#d8c8ff', '#ffffff'], 100, 0.8, 6);
      if (typeof pfSuzdur === 'function') pfSuzdur(o.x - 250, o.y);
      return;
    }
    o.sqV = Math.max(o.sqV, 160);   // ağırlık: kabuk hafif ezilir
    if (!o.firlat) ylFirlat(o);
  },
  guncelle(o, dt) { ylHayvanGuncelle(o, dt); },
  ciz(o, tm) { ylHayvanCiz(o, tm, false); },
  cizOn(o, tm) { ylHayvanCiz(o, tm, true); },
});
function ylHayvanOrb(o, y) {   // buyukIcin yıldızı dokunulunca ışık küresi kaplumbağanın sırtındaki noktaya uçar
  o.orb.push({ nok: y.nok || 0, t: 0, x0: y.x, y0: y.y, ri: y.ri });
}
function ylDikkat(o, sure, hepsi) {
  if (typeof omDikkat !== 'function') return;
  try { omDikkat('hayvan', sure, () => { omDkEkle(o.x - 330, o.y - 270, o.x + 240, o.y + 8); if (hepsi) omDkEkle(o.x - 360, o.y - 760, o.x + 520, o.y + 8); omDkEkle(P.x - 80, P.y - 120, P.x + 80, P.y + 4); }, hepsi ? 1 : 0.8, hepsi ? 0.5 : 0.7); } catch (e) {}
}
function ylFirlat(o) {
  o.firlat = true; o.fT = 0; o.kik = 1.5; o.salla = 1;
  o.sqV = 520; o.sqT = 0.16;   // önce toslama için çömel, sonra gerin (squash → stretch)
  const yuk = (typeof yuzey === 'function') ? yuzey(Math.floor((o.x + 420) / T)) : o.y - 360;   // Yıldız Tepesi'nin üstü
  P.vx = 0;
  if (typeof pfSuzdur === 'function') pfSuzdur(o.x + 480, yuk);
  burst(P.x, P.y - 30, 30, ['#ffe9a8', '#ffffff', '#bff4ff', '#ffc8e6', '#d8c0ff'], 260, 1.6, 9);
  ylSfx('hayvanFirlat', 1); ylMutlu(o); OLAY.emit('hayvanFirlat', o);
  ylDikkat(o, 7, true);
  // kalan bütün yıldızlar bir dalga halinde uyanır ve göğe yükselir
  const kalan = NESNELER.filter(n => n.tip === 'yildiz' && !n.done);
  kalan.forEach((n, i) => { n.bekle = 0.4 + i * 0.3; n.fan = kalan.length > 1 ? i / (kalan.length - 1) : 0.5; });
  o.kalan = kalan;
}
function ylHayvanGuncelle(o, dt) {
  o.t += dt; o.aT += dt; o.nefT += dt;
  // Üç büyük yıldız yandıysa geride atlanmış (uyanmamış) yıldızlar artık isteğe bağlı: Pırıl çocuğu bölümün başına geri çağırmasın,
  // hedef doğrudan kaplumbağa olsun (fırlatışta kalan bütün yıldızlar zaten göğe yükselir). Bot ölçümü: dağınık çocuk göl II'deki
  // ada yıldızını atlayınca Pırıl onu ~200 kare geriye götürüyordu (LEVEL12).
  if (!o.atlandi && DURUM === 'oyun') {
    let hepsi = true, var_ = false;
    for (const n of NESNELER) if (n.tip === 'yildiz' && n.buyukIcin) { var_ = true; if (!n.done) { hepsi = false; break; } }
    if (var_ && hepsi) { o.atlandi = true; for (const n of NESNELER) if (n.tip === 'yildiz' && !n.done) n.secmeli = true; }
  }
  for (let i = o.orb.length - 1; i >= 0; i--) {
    const b = o.orb[i]; b.t += dt;
    if (b.t >= 1.15) {
      o.orb.splice(i, 1);
      if (!o.yan[b.nok]) {
        o.yan[b.nok] = 1; o.yanT[b.nok] = o.t; o.asama++; o.aT = 0;
        const p = ylNokDunya(o, b.nok);
        burst(p.x, p.y, 20, ['#ffe9a8', '#ffffff', '#bff4ff', '#d8c0ff'], 170, 1.3, 8); o.kik = 0.8; o.sqV = 200;
        o.halka.push({ x: p.x, y: p.y, t: 0 });
        ylSfx('hayvanNokta', b.nok); ylSfx('hayvanAsama', o.asama); if (o.asama === 1) ylSfx('hayvanBurun', 1); if (o.asama === 2) ylSfx('hayvanEsne', 1); OLAY.emit('hayvanAsama', { o, asama: o.asama });
        ylDikkat(o, 3.2, false);
      }
    }
  }
  // hazır ve bekliyor: kaplumbağa (sırtı + "bana zıpla" ışığı) Feza ile birlikte kadrajda kalsın (tek başına yürüyen kamera sırtı kesiyordu)
  if (o.hazir && !o.firlat && DURUM === 'oyun' && Math.abs(P.x - o.x) < 1200 && typeof omDikkat === 'function' && (o.bkT = (o.bkT || 0) - dt) <= 0) {
    o.bkT = 0.5;
    try { omDikkat('hayvanBekle', 1.0, () => { omDkEkle(o.x - 300, o.y - o.cisim.h - 170, o.x + 250, o.y + 8); }, 0.75, 0.62); } catch (e) {}
  }
  // nefes: uykuda yavaş ve derin, uyanıkken hızlı
  const per = o.hazir ? 3.0 : 4.6; o.nef = 0.5 + 0.5 * Math.sin(o.nefT * 6.283 / per - 1.5);
  o.kirpT -= dt; if (o.kirpT < 0) { o.kirp = 1; if (o.kirpT < -0.14) { o.kirpT = 2.5 + Math.random() * 3; o.kirp = 0; } } else o.kirp = 0;
  o.kik = Math.max(0, o.kik - dt); o.salla = Math.max(0, (o.salla || 0) - dt * 0.4);
  const df = P.x - o.x; o.bak = lerp(o.bak, clamp(df / 300, -1, 1), 1 - Math.exp(-dt * 3));
  const a = o.asama, t = o.aT;
  let hH = 0, hR = 0, bU = 0, pt = 0, bK = 0;
  if (o.hazir || o.firlat) {
    const ust = o.firlat;   // fırlatıştan sonra gökyüzüne bakar
    o.goz = o.kik > 0 || ust ? 'mutlu' : 'acik'; o.agiz = 'gulus'; o.agizB = o.kik > 0 ? 0.85 : 0.55;
    hH = -26 + Math.sin(o.t * 2.2) * 3 - (ust ? 10 : 0); hR = ust ? -0.1 + 0.03 * Math.sin(o.t * 2.6) : 0.04 * Math.sin(o.t * 1.7); bU = 14; pt = 0.3;
  } else if (a === 0) {
    o.goz = 'uyku'; o.agiz = 'o'; o.agizB = 0.1 + o.nef * 0.3; hH = o.nef * 3; hR = -0.03 + 0.012 * Math.sin(o.t * 0.7);
  } else if (a === 1) {   // bir göz uykulu uykulu aralanır, burun kıpırdar, Feza'ya bakar
    o.goz = 'yarim'; o.agiz = 'o'; o.agizB = 0.2; hH = -5 + o.nef * 2; hR = -0.02; bK = 1; bU = 4;
  } else if (a === 2) {   // kocaman bir esneme: boyun uzar, patiler gerinir
    const ac = t < 0.6 ? ylEase(t / 0.6) : t < 2.2 ? 1 : 1 - ylEase((t - 2.2) / 0.6);
    o.goz = ac > 0.3 ? 'uyku' : 'yarim'; o.agiz = ac > 0.05 ? 'esne' : 'o'; o.agizB = 0.1 + ac * 0.9; hH = -12 * ac; hR = 0.05 * ac; bU = 22 * ac; pt = ac; bK = 0.4;
  } else {   // 3: gözler kocaman açılır, kafa kalkar, sevinç
    o.goz = t > 0.3 ? 'acik' : 'yarim'; o.agiz = t > 0.9 && t < 2.0 ? 'esne' : 'gulus'; o.agizB = o.agiz === 'esne' ? 1 : 0.55; hH = -24; hR = 0.03; bU = 16; pt = 0.5;
    if (!o.hazir && t > 2.4) {
      o.hazir = true; o.hazT = 0; o.cisim.tip = 'ziplat';
      OLAY.emit('hayvanHazir', o); ylSfx('hayvanUyan', 1); ylSfx('hayvanAsama', 4); ylSfx('hayvanComel', 1);
      for (let i = 0; i < 26; i++) { const sx = (i / 25 - 0.5) * 340; parca(o.x + sx, o.y - 6, sx * 0.9, -30 - Math.random() * 60, 1.4, i % 2 ? '#ffe9a8' : '#cfc4ff', 8 + Math.random() * 8); }
      ripples.push({ x: o.x, y: o.y - 4, r: 0, life: 1.6 });
      burst(o.x, o.y - 160, 34, ['#ffe9a8', '#ffffff', '#bff4ff', '#ffc8e6', '#d8c0ff'], 300, 1.6, 10);
      o.sqV = -240; ylDikkat(o, 4.5, false);
    }
  }
  o.hHeadY = lerp(o.hHeadY, hH, 1 - Math.exp(-dt * 3)); o.hRot = lerp(o.hRot, hR, 1 - Math.exp(-dt * 3));
  { // göz ve ağız yumuşak geçişleri
    const sag = a === 1 && !o.hazir && !o.firlat, sol = P.x < o.x;
    const tL = sag ? (sol ? 0.55 : 1) : (o.goz === 'uyku' ? 1 : o.goz === 'yarim' ? 0.55 : 0), tR = sag ? (sol ? 1 : 0.55) : tL;
    const kl = 1 - Math.exp(-dt * (o.goz === 'uyku' ? 4 : 7));
    o.lidL = lerp(o.lidL, tL, kl); o.lidR = lerp(o.lidR, tR, kl);
    o.mutluA = lerp(o.mutluA, o.goz === 'mutlu' ? 1 : 0, 1 - Math.exp(-dt * 9));
    o.mOpen = lerp(o.mOpen, (o.agiz === 'esne' || o.agiz === 'acik') ? o.agizB : 0, 1 - Math.exp(-dt * 5));
    o.mSmile = lerp(o.mSmile, o.agiz === 'gulus' ? 1 : 0, 1 - Math.exp(-dt * 4));
  }
  o.boyUz = lerp(o.boyUz, bU, 1 - Math.exp(-dt * 3)); o.pati = lerp(o.pati, pt, 1 - Math.exp(-dt * 3)); o.burunK = lerp(o.burunK, bK, 1 - Math.exp(-dt * 6));
  // gerçek çömelme: kabuk yere yumuşakça iner (yamulmaz), bacaklar kısalır; cisim yüksekliği buna bağlı
  if (o.hazir) {
    o.hazT += dt;
    const k = ylEase(o.hazT / 1.4); o.drop = lerp(0, 62, k);
    const h = 190 - o.drop, eski = o.cisim.h; o.cisim.h = h; o.cisim.dy = -(h - eski);
    o.cisim.guc = ylHayvanGuc(o);
  } else o.cisim.dy = 0;
  o.hSq = (190 - o.drop) / 190;
  // Feza sırtındaysa ağırlık (hafif ezilme) ve yürürken ışık halkaları
  const uzerinde = typeof ustundeki !== 'undefined' && ustundeki === o;
  o.agirlik = lerp(o.agirlik, uzerinde ? 7 : 0, 1 - Math.exp(-dt * 8));
  if (uzerinde && Math.abs(P.vx) > 40) { o.halkaT -= dt; if (o.halkaT <= 0) { o.halkaT = 0.28; o.halka.push({ x: P.x, y: o.y - o.cisim.h, t: 0, yuz: true }); } }
  for (let i = o.halka.length - 1; i >= 0; i--) { o.halka[i].t += dt; if (o.halka[i].t > 1.1) o.halka.splice(i, 1); }
  // yay: toslama (squash → stretch) ve küçük tepkiler; sqT: toslama gecikmesi
  if (o.sqT > 0) { o.sqT -= dt; if (o.sqT <= 0) { o.sqV = -900; } }
  o.sqV += (-170 * o.sq - 15 * o.sqV) * dt; o.sq += o.sqV * dt; o.sq = clamp(o.sq, -34, 46);
  o.vdrop = o.drop + o.agirlik + o.sq;
  o.kuyrukS = Math.sin(o.t * (o.hazir ? 4 : 1.2)) * (o.hazir ? 0.35 : 0.1);
  // burun baloncuğu (uykuda)
  o.baloncukT -= dt; if (o.asama === 0 && !o.hazir && o.baloncukT <= 0) { o.baloncukT = 3.8 + Math.random(); if (Math.abs(P.x - o.x) < 1100) ylSfx('hayvanBurun', 0.7); }
  if (o.asama === 0 && !o.hazir) { o.baloncuk = o.nef; } else o.baloncuk = Math.max(0, o.baloncuk - dt * 4);
  if (o.firlat) {
    o.fT += dt;
    if (o.fT < 3.2 && Math.random() < dt * 40) parca(P.x + (Math.random() - 0.5) * 20, P.y - 20 + Math.random() * 30, (Math.random() - 0.5) * 60, 30, 1.2, ['#ffe9a8', '#ffffff', '#bff4ff', '#ffc8e6'][Math.floor(Math.random() * 4)], 6 + Math.random() * 6);
    if (o.kalan) for (const n of o.kalan) { if (n.bekle !== undefined && n.bekle > 0) { n.bekle -= dt; if (n.bekle <= 0 && !n.done) ylUyandir(n, true); } }
    const hepsi = !NESNELER.some(n => n.tip === 'yildiz' && (!n.done || n.durum !== 'yerlesti'));
    if (!o.bitti && o.fT > 3.4 && (hepsi || o.fT > 12)) {
      o.bitti = true; o.uyandi = true; ylSfx('hayvanUyandi', 1);
      OLAY.emit('hayvanUyandi', o);
    }
  }
  if ((o.hazir || o.firlat) && (o.hapT -= dt) <= 0) { o.hapT = 1.8 + Math.random() * 2; const q = YL_KUCUK[Math.floor(Math.random() * YL_KUCUK.length)]; o.halka.push({ x: o.x + q[0], y: o.y + q[1] + o.vdrop, t: 0.4 }); parca(o.x + q[0], o.y + q[1] + o.vdrop, 0, -20, 1.0, '#fff2c8', 6); }
  // rüya yıldızları (uykuda)
  o.zzT -= dt;
  if (o.zzT <= 0 && !o.hazir) { o.zzT = 1.2 + Math.random(); o.zz.push({ x: -215 + (Math.random() - 0.5) * 30, y: -100, t: 0, ph: Math.random() * 6.28 }); }
  for (let i = o.zz.length - 1; i >= 0; i--) { const z = o.zz[i]; z.t += dt; if (z.t > 3.4) o.zz.splice(i, 1); }
}
function ylHayvanGuc(o) {
  const hedef = (typeof yuzey === 'function') ? yuzey(Math.floor((o.x + 420) / T)) : o.y - 360;
  const top = o.y - o.cisim.h, gerek = top - hedef + 150;
  return Math.max(1300, Math.min(1750, Math.sqrt(2 * 2200 * Math.max(0, gerek))));
}
// ── göz: iri, parlak irisli, kirpikli; durum: uyku | yarim | acik | mutlu ──
function ylGoz(x, y, durum, kirp, bak, s, lid, dis) {
  if (durum === 'uyku' || kirp > 0.5) {   // ∪ kapalı göz + kirpikler
    g.strokeStyle = '#2a2470'; g.lineWidth = 3.4 * s; g.lineCap = 'round'; g.beginPath(); g.arc(x, y - 4 * s, 12 * s, 0.22 * Math.PI, 0.78 * Math.PI); g.stroke();
    g.lineWidth = 2 * s; for (let i = 0; i < 3; i++) { const an = (0.18 - i * 0.07) * Math.PI * (dis < 0 ? -1 : 1) + (dis < 0 ? Math.PI : 0); g.beginPath(); g.moveTo(x + dis * (10 + i * 2) * s, y + (4 + i * 3) * s); g.lineTo(x + dis * (17 + i * 2) * s, y + (6 + i * 4.5) * s); g.stroke(); }
    return;
  }
  if (durum === 'mutlu') {   // ∩ gülen göz
    g.strokeStyle = '#2a2470'; g.lineWidth = 4 * s; g.lineCap = 'round'; g.beginPath(); g.arc(x, y + 8 * s, 12 * s, 1.2 * Math.PI, 1.8 * Math.PI); g.stroke(); return;
  }
  const R = 15 * s, ox = bak * 3 * s;
  g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y, R * 1.05, R * 1.12, 0, 0, 6.283); g.fill();
  g.fillStyle = '#1b3f9a'; g.beginPath(); g.ellipse(x + ox, y + 1.5 * s, R * 0.86, R * 0.96, 0, 0, 6.283); g.fill();
  g.fillStyle = '#38b8d8'; g.beginPath(); g.ellipse(x + ox, y + 5 * s, R * 0.7, R * 0.66, 0, 0, 6.283); g.fill();
  g.fillStyle = '#10153e'; g.beginPath(); g.ellipse(x + ox, y + 1 * s, R * 0.46, R * 0.54, 0, 0, 6.283); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x + ox - 4.5 * s, y - 5 * s, 4.6 * s, 0, 6.283); g.fill(); g.beginPath(); g.arc(x + ox + 4 * s, y + 5 * s, 2.3 * s, 0, 6.283); g.fill();
  g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(x + ox + 7 * s, y - 1 * s, 1.4 * s, 0, 6.283); g.fill();
  g.strokeStyle = '#2a2470'; g.lineWidth = 2.6 * s; g.lineCap = 'round'; g.beginPath(); g.ellipse(x, y, R * 1.05, R * 1.12, 0, 1.05 * Math.PI, 1.95 * Math.PI); g.stroke();   // üst kenar çizgisi
  g.lineWidth = 2 * s; for (let i = 0; i < 3; i++) { const an = (1.15 + i * 0.12) * Math.PI; g.beginPath(); g.moveTo(x + Math.cos(an) * R * 1.05 * (dis < 0 ? -1 : 1), y + Math.sin(an) * R * 1.12); g.lineTo(x + Math.cos(an) * R * 1.4 * (dis < 0 ? -1 : 1), y + Math.sin(an) * R * 1.5); g.stroke(); }
  if (lid > 0.04) {   // kapak (yumuşak açılıp kapanır)
    g.fillStyle = '#9aa7f7'; const ly = y - R * 1.12 + lid * R * 1.12 * 1.9;
    g.save(); g.beginPath(); g.ellipse(x, y, R * 1.12, R * 1.2, 0, 0, 6.283); g.clip(); g.beginPath(); g.rect(x - R * 1.3, y - R * 1.5, R * 2.6, ly - (y - R * 1.5)); g.fill(); g.restore();
    g.strokeStyle = '#2a2470'; g.lineWidth = 2.8 * s; g.beginPath(); g.moveTo(x - R * 1.05, ly); g.quadraticCurveTo(x, ly + 5 * s, x + R * 1.05, ly); g.stroke();
  }
}
function ylPati(x, y, w, h, dis, nefes) {   // kısa kalın bacak + ayak: yumuşak kırışık, 3 tırnak
  const gr = g.createLinearGradient(x - w / 2, y - h, x + w / 2, y); gr.addColorStop(0, '#b4bffc'); gr.addColorStop(0.55, '#8f9cf2'); gr.addColorStop(1, '#6670d2');
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - w / 2, y); g.bezierCurveTo(x - w / 2 - 6, y - h * 0.7, x - w * 0.38, y - h, x, y - h); g.bezierCurveTo(x + w * 0.38, y - h, x + w / 2 + 6, y - h * 0.7, x + w / 2, y); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(40,40,140,0.4)'; g.lineWidth = 1.8; g.stroke();
  g.strokeStyle = 'rgba(40,40,140,0.25)'; g.lineWidth = 1.6; for (let i = 0; i < 2; i++) { g.beginPath(); g.arc(x + dis * 4, y - h * (0.35 + i * 0.25), w * 0.36, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }   // diz/ayak bileği kırışıkları
  g.fillStyle = 'rgba(255,255,255,0.26)'; g.beginPath(); g.ellipse(x - w * 0.16, y - h * 0.68, w * 0.2, h * 0.13, -0.4, 0, 6.283); g.fill();
  for (let i = -1; i <= 1; i++) { g.fillStyle = '#fff0c0'; g.beginPath(); g.ellipse(x + i * w * 0.28 + dis * 3, y - 2.5, w * 0.11, 4.2, 0, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(120,80,30,0.5)'; g.lineWidth = 1.1; g.stroke(); }
}
function ylHayvanBoyun(o, hx, hy) {   // boyun: kabuğun altından çıkan kıvrımlı, kırışık kalın tüp (gölgeli alt, açık üst)
  const bx = o.x - 120, by = o.y - 56 + o.vdrop * 0.5;
  const c1x = bx - 40, c1y = by + 10, c2x = hx + 70, c2y = hy + 40, ex = hx + 30, ey = hy + 8;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const path = () => { g.beginPath(); g.moveTo(bx, by); g.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey); };
  g.strokeStyle = '#4c58b8'; g.lineWidth = 82; path(); g.stroke();                 // gölge katmanı
  g.strokeStyle = '#7280e0'; g.lineWidth = 74; g.save(); g.translate(0, -3); path(); g.stroke(); g.restore();
  g.strokeStyle = '#9fabf6'; g.lineWidth = 50; g.save(); g.translate(0, -9); path(); g.stroke(); g.restore();   // orta ton
  g.strokeStyle = 'rgba(226,232,255,0.5)'; g.lineWidth = 12; g.save(); g.translate(-2, -22); path(); g.stroke(); g.restore();   // üst parlak şerit
  g.strokeStyle = 'rgba(30,30,120,0.34)'; g.lineWidth = 3;   // kırışıklar (halka halka)
  for (let i = 0; i < 5; i++) { const u = 0.22 + i * 0.14, mt = 1 - u; const px = mt * mt * mt * bx + 3 * mt * mt * u * c1x + 3 * mt * u * u * c2x + u * u * u * ex, py = mt * mt * mt * by + 3 * mt * mt * u * c1y + 3 * mt * u * u * c2y + u * u * u * ey; g.beginPath(); g.arc(px + 4, py + 2 + o.nef * 1.5 * (i % 2 ? 1 : -1), 34 + o.nef * 1.5, 0.7 * Math.PI, 1.3 * Math.PI, true); g.stroke(); }
}
function ylHayvanBas(o, tm, hx, hy) {
  const rot = o.hRot;
  g.save(); g.translate(hx, hy); g.rotate(rot);
  // alt çene (daha koyu ikinci ton), sonra baş
  const jg = g.createLinearGradient(0, 14, 0, 58); jg.addColorStop(0, '#8794ec'); jg.addColorStop(1, '#5e6ad0');
  g.fillStyle = jg; g.beginPath(); g.ellipse(-24, 36 + 8 * o.mOpen, 50, 22 + 6 * o.mOpen, 0.05, 0, 6.283); g.fill();
  g.strokeStyle = 'rgba(40,40,140,0.35)'; g.lineWidth = 2; g.stroke();
  const hg = g.createRadialGradient(-14, -30, 6, 0, 0, 82); hg.addColorStop(0, '#dfe4ff'); hg.addColorStop(0.45, '#aab6fb'); hg.addColorStop(1, '#7380e0');
  g.fillStyle = hg; g.beginPath(); g.ellipse(6, -4, 62, 50, 0, 0, 6.283); g.fill();
  g.beginPath(); g.ellipse(-46, 10, 34, 26, 0.1, 0, 6.283); g.fill();
  g.strokeStyle = 'rgba(50,50,150,0.34)'; g.lineWidth = 2; g.beginPath(); g.ellipse(6, -4, 62, 50, 0, 0.3 * Math.PI, 1.8 * Math.PI); g.stroke();
  // üst yüz: parlak ikinci ton + soluk pul desenleri
  g.fillStyle = 'rgba(236,240,255,0.5)'; g.beginPath(); g.ellipse(2, -34, 42, 15, -0.12, 0, 6.283); g.fill();
  g.strokeStyle = 'rgba(70,80,190,0.22)'; g.lineWidth = 1.5; for (const [dx, dy] of [[-18, -36], [4, -42], [26, -34]]) { g.beginPath(); for (let i = 0; i < 6; i++) { const an = Math.PI / 6 + i * Math.PI / 3, px = dx + Math.cos(an) * 10, py = dy + Math.sin(an) * 9; if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.closePath(); g.stroke(); }
  g.fillStyle = 'rgba(60,200,220,0.2)'; for (const [dx, dy, r] of [[30, -26, 6], [42, -8, 4.5], [36, 14, 5], [20, -40, 3.5], [48, 30, 3.4], [-4, -46, 3]]) { g.beginPath(); g.arc(dx, dy, r, 0, 6.283); g.fill(); }   // turkuaz ben benekleri
  g.save(); g.translate(6, -44); const sp = ylYildizSprite('lit', 0), sw = sp.width / YL_K * 0.4; g.globalAlpha = 0.3 + 0.7 * Math.min(1, o.asama / 3 + (o.hazir ? 1 : 0)); g.drawImage(sp, -sw / 2, -sw / 2, sw, sw); g.restore(); g.globalAlpha = 1;
  const ya = 0.55 + (o.goz === 'mutlu' ? 0.3 : 0);
  g.fillStyle = 'rgba(255,140,185,' + ya * 0.66 + ')'; g.beginPath(); g.ellipse(-50, 20, 13, 8, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(40, 16, 13, 8.5, 0, 0, 6.283); g.fill();
  const bk = o.bak, uykuSag = o.asama === 1 && !o.hazir;
  { const dL = o.mutluA > 0.5 ? 'mutlu' : (o.lidL > 0.93 ? 'uyku' : 'acik'), dR = o.mutluA > 0.5 ? 'mutlu' : (o.lidR > 0.93 ? 'uyku' : 'acik');
    ylGoz(-32, -14, dL, o.kirp, bk, 1.2, o.lidL, -1); ylGoz(26, -14, dR, o.kirp, bk, 1.2, o.lidR, 1); }
  g.strokeStyle = 'rgba(40,36,120,0.5)'; g.lineWidth = 2.6; g.lineCap = 'round';
  const kal = o.goz === 'mutlu' ? -3 : (o.asama === 2 && !o.hazir ? 2 : 0);
  g.beginPath(); g.arc(-32, -4 + kal, 19, 1.25 * Math.PI, 1.72 * Math.PI); g.stroke(); g.beginPath(); g.arc(26, -4 + kal, 19, 1.28 * Math.PI, 1.75 * Math.PI); g.stroke();
  const nk = 1 + o.burunK * 0.7 * Math.sin(tm * 18);   // burun kıpırdar
  g.fillStyle = 'rgba(40,40,120,0.6)'; g.beginPath(); g.ellipse(-66, 8, 2.4 * nk, 3.4 * nk, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(-55, 5, 2.4 * nk, 3.4 * nk, 0, 0, 6.283); g.fill();
  if (o.baloncuk > 0.02) {   // burun baloncuğu: nefesle şişer
    const r = 3 + 11 * o.baloncuk; g.fillStyle = 'rgba(220,235,255,0.35)'; g.beginPath(); g.arc(-72 - r * 0.6, 9, r, 0, 6.283); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1.4; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.arc(-72 - r * 0.6 - r * 0.35, 9 - r * 0.35, r * 0.2, 0, 6.283); g.fill();
  }
  const mx = -34, my = 34, mo = o.mOpen, ms = o.mSmile;
  if (mo < 0.25) { g.globalAlpha = 1 - mo * 4; g.strokeStyle = 'rgba(42,36,112,0.7)'; g.lineWidth = 2.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(-68, 26 - ms * 2); g.quadraticCurveTo(-34, 38 + ms * 7, 6, 24 - ms * 2); g.stroke(); g.beginPath(); g.moveTo(-68, 26 - ms * 2); g.lineTo(-71, 22 - ms * 3); g.moveTo(6, 24 - ms * 2); g.lineTo(9, 20 - ms * 3); g.stroke(); g.globalAlpha = 1; }
  if (mo > 0.04) { g.globalAlpha = clamp(mo * 4, 0, 1); g.fillStyle = '#4a1f5c'; g.beginPath(); g.ellipse(mx, my + 2, 13 + 7 * mo, 3 + 18 * mo, 0, 0, 6.283); g.fill();
    g.fillStyle = '#ff8fb8'; g.beginPath(); g.ellipse(mx, my + 2 + 9 * mo, (13 + 7 * mo) * 0.7, (3 + 18 * mo) * 0.4, 0, 0, 6.283); g.fill(); g.globalAlpha = 1; }
  g.restore();
}
function ylHayvanCiz(o, tm, on) {
  if (on) { ylHayvanIsik(o, tm); return; }
  const bx = o.x, by = o.y, vd = o.vdrop;
  // zemin gölgesi (çömeldikçe genişler)
  const gen = 270 + vd * 0.9; g.fillStyle = 'rgba(8,6,36,0.42)'; g.beginPath(); g.ellipse(bx - 20, by + 1, gen, 15 + vd * 0.05, 0, 0, 6.283); g.fill();
  g.globalCompositeOperation = 'lighter'; { const a2 = 0.12 + 0.05 * Math.sin(tm * 1.3); g.save(); g.translate(bx - 10, by + 14); g.scale(1, 0.14); dglow('#6fd8e8', 0, 0, 300, a2); g.restore(); }
  g.globalCompositeOperation = 'source-over';
  { const sp0 = ylHayvanSprite(); g.save(); g.beginPath(); g.rect(bx - 400, by + 1, 800, 80); g.clip(); g.globalAlpha = 0.1; g.translate(bx, by + 3); g.scale(1, -0.32); g.drawImage(sp0, -215, -225 + vd * 0.3, sp0.width / YL_KB.k, sp0.height / YL_KB.k); g.restore(); g.globalAlpha = 1; }
  g.globalCompositeOperation = 'lighter';
  dglow('#7a6cff', bx, by - 100 + vd * 0.5, 280, 0.08 + 0.1 * (o.asama / 3) + (o.hazir ? 0.12 : 0));
  g.globalCompositeOperation = 'source-over';
  const br = 1 + 0.03 * o.nef * (o.hazir ? 0.6 : 1), bob = -o.nef * 2.5;
  // baş konumu (nefesle yükselir, çömelirken biraz iner, boyun uzar)
  const hx = bx - 238 - o.boyUz, hy = by - 52 + o.hHeadY * 0.45 + Math.min(vd * 0.32, 20) + bob;
  // kuyruk (sallanır, ucunda küçük yıldız)
  { g.save(); g.translate(bx + 160, by - 30 + vd * 0.5); g.rotate(-0.25 + o.kuyrukS); g.fillStyle = '#8f9bea'; g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(40, -2, 62, -22); g.quadraticCurveTo(38, 12, 0, 14); g.closePath(); g.fill(); g.strokeStyle = 'rgba(40,40,120,0.4)'; g.lineWidth = 1.5; g.stroke();
    g.restore(); const sx = bx + 160 + Math.cos(-0.25 + o.kuyrukS) * 60 - Math.sin(-0.25 + o.kuyrukS) * -22, sy = by - 30 + vd * 0.5 + Math.sin(-0.25 + o.kuyrukS) * 60 + Math.cos(-0.25 + o.kuyrukS) * -22;
    g.globalCompositeOperation = 'lighter'; dglow('#ffe9a8', sx, sy, 24, 0.5); g.globalCompositeOperation = 'source-over'; ylYildizCiz(sx, sy, 0.3, o.t, 1, 0, 0.95); }
  // arka ayak (kabuğun altından, kısa kalın)
  ylPati(bx + 118, by, 70, Math.max(16, 44 - vd * 0.5), 1);
  ylHayvanBoyun(o, hx, hy);
  // kabuk: çömelme = aşağı iner (yere gömülen kısım kırpılır), nefesle hafif kabarır; yamulmaz
  g.save(); g.beginPath(); g.rect(bx - 400, by - 700, 800, 700 + 1); g.clip();
  const sp = ylHayvanSprite(), k = YL_KB.k, sx2 = 1 + vd * 0.0006 + 0.004 * o.nef;
  g.translate(bx, by + vd + bob * 0.4); g.scale(sx2, br * (1 - Math.min(vd, 80) * 0.0008));
  g.drawImage(sp, -215, -225, sp.width / k, sp.height / k);
  g.restore();
  // ön patiler (başın altında, esneyince öne uzanır)
  ylPati(bx - 168 - o.pati * 28, by, 74, 44, -1);
  ylPati(bx - 118 - o.pati * 16, by, 64, 36, -1);
  ylHayvanBas(o, tm, hx, hy);
  // rüya yıldızları
  g.globalCompositeOperation = 'lighter';
  for (const z of o.zz) { const u = z.t / 3.4, al = Math.sin(u * Math.PI) * 0.6; ylGlint(o.x + z.x + Math.sin(z.t * 1.4 + z.ph) * 10 + u * -20, o.y + z.y - u * 90, 9 + 3 * Math.sin(z.t * 4), al, z.t); }
  g.globalCompositeOperation = 'source-over';
  if (o.asama === 0 && !o.hazir) {   // "z z"
    g.fillStyle = '#d8e0ff'; g.textAlign = 'center';
    for (let i = 0; i < 2; i++) { const u = ((tm * 0.3 + i * 0.5) % 1); g.globalAlpha = Math.sin(u * Math.PI) * 0.85; g.font = 'bold ' + Math.round(18 + 16 * u) + 'px sans-serif'; g.fillText('z', hx - 20 + u * 40, hy - 70 - u * 60); }
    g.globalAlpha = 1;
  }
}
function ylHayvanIsik(o, tm) {
  const bx = o.x, by = o.y, vd = o.vdrop;
  g.globalCompositeOperation = 'lighter';
  // kabuk kenarındaki ışıklı kristaller
  for (let i = 0; i < YL_KRIS.length; i++) { const c = YL_KRIS[i], pu = 0.5 + 0.5 * Math.sin(tm * 1.6 + i * 1.7); dglow(c[3], bx + c[0], by + c[1] + vd - 6, c[2] * 1.3, 0.12 + 0.08 * pu + (o.hazir ? 0.06 : 0)); }
  for (let i = 0; i < YL_KUCUK.length; i++) {
    const p = YL_KUCUK[i], pu = 0.5 + 0.5 * Math.sin(tm * 1.8 + i * 1.3);
    const al = (0.1 + 0.9 * clamp(o.asama / 3 * 1.4 - i * 0.05, 0, 1)) * (0.5 + 0.5 * pu);
    dglow('#d8e0ff', bx + p[0], by + p[1] + vd, 9, al * 0.7);
  }
  g.lineCap = 'round';
  for (const [a, b] of YL_CIZGI) {
    if (!(o.yan[a] && o.yan[b])) continue;
    const pa = YL_NOK[a], pb = YL_NOK[b], u = clamp((o.t - Math.max(o.yanT[a], o.yanT[b])) / 0.8, 0, 1);
    g.strokeStyle = 'rgba(255,233,168,' + (0.5 * u + 0.1 * Math.sin(tm * 2)) + ')'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(bx + pa[0], by + pa[1] + vd); g.lineTo(bx + lerp(pa[0], pb[0], u), by + lerp(pa[1], pb[1], u) + vd); g.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const p = YL_NOK[i], px = bx + p[0], py = by + p[1] + vd;
    if (o.yan[i]) {
      const u = clamp((o.t - o.yanT[i]) / 0.9, 0, 1), pu = 0.7 + 0.3 * Math.sin(tm * 2.6 + i), pop = 1 + 0.35 * Math.sin(u * Math.PI);
      dglow('#ffe9a8', px, py, 80 * pop, 0.6 * pu); dglow('#ffffff', px, py, 30, 0.75);
      g.globalCompositeOperation = 'source-over'; ylYildizCiz(px, py, 0.7 * pop, tm * 0.4 + i, 1, i === 1 ? 0 : (i ? 3 : 1), 1); g.globalCompositeOperation = 'lighter';
      ylGlint(px, py, 28 * pop, 0.6 * pu, tm * 0.8 + i);
    } else {
      const pu = 0.5 + 0.5 * Math.sin(tm * 2.2 + i * 2); dglow('#9fb0ff', px, py, 40, 0.16 + 0.1 * pu); dglow('#ffe3a0', px, py, 52, 0.08 + 0.08 * pu);
      for (let k = 0; k < 1; k++) { const u = (tm * 0.5 + i * 0.33) % 1; g.globalAlpha = 0.5 * (1 - u); g.strokeStyle = '#ffe3a0'; g.lineWidth = 3; g.beginPath(); g.arc(px, py, 22 + 40 * u, 0, 6.283); g.stroke(); }
      g.globalAlpha = 1;
    }
  }
  if (o.asama >= 1) { const w = (o.hazir ? 1 : o.asama / 3) * (0.55 + 0.25 * Math.sin(tm * 1.7)); dglow(o.hazir ? '#ffe3a0' : '#b8b0ff', bx, by - 100 + vd * 0.5, 210, 0.14 * w); }
  for (const b of o.orb) {   // ışık küreleri: yıldızdan sırttaki noktaya
    const u = clamp(b.t / 1.15, 0, 1), e = ylEase(u), p = YL_NOK[b.nok];
    const tx = bx + p[0], ty = by + p[1] + vd, hx = lerp(b.x0, tx, e), hy = lerp(b.y0, ty, e) - Math.sin(e * Math.PI) * 120;
    dglow(YL_RENK[b.ri][3], hx, hy, 48, 0.65); dglow('#ffffff', hx, hy, 18, 0.9);
    if (Math.random() < 0.8) parca(hx, hy, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, 0.8, '#ffe9a8', 5);
  }
  g.globalCompositeOperation = 'source-over';
  g.globalCompositeOperation = 'lighter';
  for (const h of o.halka) {   // sırtta genişleyen ışık halkaları (yürürken / yıldız yanınca)
    const u = h.t / (h.yuz ? 1.1 : 0.9); g.globalAlpha = 0.45 * (1 - u); g.strokeStyle = h.yuz ? '#fff2c8' : '#ffe9a8'; g.lineWidth = 2.6;
    g.beginPath(); if (h.yuz) g.ellipse(h.x, h.y + 2, 20 + 70 * u, 4 + 10 * u, 0, 0, 6.283); else g.arc(h.x, h.y, 18 + 55 * u, 0, 6.283); g.stroke();
  }
  g.globalAlpha = 1;
  if (o.hazir && !o.firlat && DURUM === 'oyun') {   // "bana zıpla" ışık damlası
    const b = Math.abs(Math.sin(tm * 3.2)), cy = o.y - o.cisim.h - 56 - 22 * b;
    dglow('#fff2b8', bx - 10, cy, 34, 0.6); dglow('#ffffff', bx - 10, cy, 11, 0.9); dglow('#fff2b8', bx - 10, cy + 20, 14, 0.4 * (1 - b)); dglow('#fff2b8', bx - 10, cy + 34, 9, 0.25 * (1 - b));
    dglow('#ffe9a8', bx - 10, cy, 70, 0.35); g.globalCompositeOperation = 'source-over'; ylYildizCiz(bx - 10, cy, 0.62 + 0.08 * b, Math.sin(tm * 2) * 0.2, 1, 0, 1); ylYuz(bx - 10, cy + 1, 0.62 + 0.08 * b, Math.sin(tm * 2) * 0.2, 1, 1, true, Math.sin(tm * 1.3) > 0.8 ? 1 : 0); g.globalCompositeOperation = 'lighter';   // sırtta zıplayan minik gülen yıldız: "bana zıpla"
    // zıplama yolu: Feza'dan sırta akan ışık noktaları (yazısız "buraya zıpla"); Feza sırttaysa ya da çok uzaktaysa yok
    const fx = P.rx !== undefined ? P.rx : P.x, fy = (P.ry !== undefined ? P.ry : P.y) - 40, dx = bx - 10 - fx;
    const ust = typeof ustundeki !== 'undefined' && ustundeki === o;
    o.yolA = clamp((o.yolA || 0) + (!ust && P.ground && dx > 60 && dx < 900 ? 0.03 : -0.06), 0, 1);
    if (o.yolA > 0.01) {
      const ty = o.y - o.cisim.h - 30, tepe = Math.min(fy, ty) - 90 - Math.min(80, dx * 0.15);
      for (let i = 0; i < 9; i++) {
        const u = ((tm * 0.45) + i / 9) % 1, mt = 1 - u;
        const x = lerp(fx, bx - 10, u), y = mt * mt * fy + 2 * mt * u * tepe + u * u * ty;
        const al = o.yolA * Math.sin(u * Math.PI) * 0.75;
        dglow('#fff2b8', x, y, 16, al * 0.6); dglow('#ffffff', x, y, 5, al);
      }
    }
  }
  g.globalCompositeOperation = 'source-over';
}

// ───────────────────────── süs: yildizBalik (suda sıçrayan minik yıldız balığı) ve isikBalon (süzülen ışık balonu) ─────────────────────────
// Yalnız güzellik/sürpriz: dokunulmaz, sayaçlara girmez. Korkutucu değil: yumuşak, parlak, sevimli.
TUR.kaydet('yildizBalik', {
  kur(o) { o.t = Math.random() * 3; o.bekle = 2 + Math.random() * 3; o.ziplama = -1; o.ri = Math.floor(Math.random() * 5); o.yon = Math.random() < 0.5 ? 1 : -1; o.ph = Math.random() * 6.28; },
  guncelle(o, dt) {
    o.t += dt;
    if (o.ziplama < 0) {
      o.bekle -= dt;
      if (o.bekle <= 0 && Math.abs(P.x - o.x) < 900) { o.ziplama = 0; o.yon = -o.yon; ylSuHalka(o.x, ylSu() - 2, true); ylSfx('balikSic', o.ri); burst(o.x, ylSu() - 6, 6, ['#bff4ff', '#ffffff'], 80, 0.7, 5); }
      else if (o.bekle <= 0) o.bekle = 1;
    } else {
      o.ziplama += dt;
      if (o.ziplama > 1.5) { o.ziplama = -1; o.bekle = 3 + Math.random() * 5; ylSuHalka(o.x + o.yon * 90, ylSu() - 2, true); burst(o.x + o.yon * 90, ylSu() - 6, 6, ['#bff4ff', '#ffffff'], 80, 0.7, 5); }
    }
  },
  cizOn(o, tm) {
    if (o.ziplama < 0) return;
    const u = o.ziplama / 1.5, x = o.x + o.yon * 90 * u, y = ylSu() - Math.sin(u * Math.PI) * 130;
    g.globalCompositeOperation = 'lighter';
    dglow(YL_RENK[o.ri][3], x, y, 40, 0.5); ylSuYansima(x, ylSu(), 36, 0.2 * (1 - Math.abs(u - 0.5)), YL_RENK[o.ri][3], tm, o.ph);
    for (let i = 1; i < 6; i++) { const uu = u - i * 0.03, xx = o.x + o.yon * 90 * uu, yy = ylSu() - Math.sin(uu * Math.PI) * 130; if (uu > 0) dglow(YL_RENK[o.ri][3], xx, yy, 14 - i * 1.5, 0.35 * (1 - i / 6)); }
    g.globalCompositeOperation = 'source-over';
    ylYildizCiz(x, y, 0.42, (u - 0.5) * 5 * o.yon, 1, o.ri, 1); ylYuz(x, y + 0.5, 0.42, (u - 0.5) * 5 * o.yon, 1, 1);
  },
});
TUR.kaydet('isikBalon', {
  kur(o) { o.ph = Math.random() * 6.28; o.ri = Math.floor(Math.random() * 5); o.h = o.h || 150; },
  cizOn(o, tm) {
    const bx = o.x + Math.sin(tm * 0.5 + o.ph) * 14, by = o.y - o.h + Math.sin(tm * 0.8 + o.ph) * 10;
    const c = YL_RENK[o.ri], yak = clamp((Math.abs(P.x - bx) - 40) / 160, 0.3, 1);   // Feza yakınında solar
    g.globalAlpha = yak;
    g.strokeStyle = 'rgba(220,230,255,0.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(bx, by + 18); g.quadraticCurveTo(bx - 6 + Math.sin(tm + o.ph) * 5, (by + o.y) / 2, o.x, o.y); g.stroke();
    g.globalCompositeOperation = 'lighter';
    dglow(c[3], bx, by, 54, 0.45 + 0.1 * Math.sin(tm * 2 + o.ph)); dglow(c[0], bx, by, 22, 0.55);
    g.globalCompositeOperation = 'source-over';
    const gr = g.createRadialGradient(bx - 5, by - 6, 2, bx, by, 19); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.5, c[1]); gr.addColorStop(1, c[2]);
    g.globalAlpha = 0.55; g.fillStyle = gr; g.beginPath(); g.ellipse(bx, by, 17, 19, 0, 0, 6.283); g.fill(); g.globalAlpha = 1;
    ylYildizCiz(bx, by, 0.5, tm * 0.4 + o.ph, 1, o.ri, 0.95);
    g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.3; g.beginPath(); g.ellipse(bx, by, 17, 19, 0, 0, 6.283); g.stroke();
    g.fillStyle = c[2]; g.beginPath(); g.moveTo(bx - 3, by + 19); g.lineTo(bx + 3, by + 19); g.lineTo(bx, by + 24); g.fill();
    g.globalCompositeOperation = 'lighter'; ylGlint(bx - 5, by - 7, 6, 0.6, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  },
});

// ───────────────────────── yildizBulmaca: üç yıldız taşına (zincir 'bulmaca') bastıkça ışık gösterisi ─────────────────────────
TUR.kaydet('yildizBulmaca', {
  kur(o) { o.bitti = false; o.say = 0; o.t = 0; },
  guncelle(o, dt) {
    if (!ylZ) ylZincirKur();
    const z = ylZ[o.zincir] || [];
    let n = 0; for (const s of z) if (s.bas) n++;
    if (n !== o.say) { o.say = n; if (n > 0 && n < z.length) ylSfx('yildizTas', 4 + n); }
    if (!o.bitti && z.length && n === z.length) {
      o.bitti = true; o.t = 0; ylSfx('bloom', 1); ylMutlu(o);
      for (const s of z) burst(s.x, s.y - 10, 24, ['#ffe9a8', '#ffffff', '#bff4ff', '#ffc8e6', '#d8c0ff'], 220, 1.6, 9);
    }
    if (o.bitti) {   // yıldız tozu yağmuru yukarı yükselir
      o.t += dt;
      if (o.t < 3.5 && Math.random() < dt * 30) { const s = z[Math.floor(Math.random() * z.length)]; parca(s.x + (Math.random() - 0.5) * 100, s.y - 10, (Math.random() - 0.5) * 40, -120 - Math.random() * 140, 1.8, ['#ffe9a8', '#ffffff', '#bff4ff', '#ffc8e6'][Math.floor(Math.random() * 4)], 6 + Math.random() * 6); }
    }
  },
});

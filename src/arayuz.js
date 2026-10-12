/* arayuz.js – başlık ekranı, zıplama düğmesi, dokunma ipuçları (el simgesi), altyazı (?altyazi ile), bitiş ekranı.
   Sözleşme: src/SPEC.md. Feza okuma bilmiyor: hiçbir şey yazıya dayanmaz (yazı yalnızca süs / ebeveyn için).
   Ekran koordinatı: canvas pikseli (CSS px × DPR). Pahalı çizimler (logo, el, simgeler, düğme) önbellekte.
   Bütün özel adlar ui/UI ile başlar. */
'use strict';
const ARAYUZ = (() => {
  const ALTYAZI_ACIK = Q.has('altyazi');
  const FONT_SERIF = 'Georgia, "Times New Roman", serif';
  const FONT_UI = 'ui-rounded, "SF Pro Rounded", "Trebuchet MS", system-ui, sans-serif';
  const uiSeg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const uiEase = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  const uiBack = t => { t = clamp(t, 0, 1); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const sfx = (k, v) => { if (typeof AU !== 'undefined' && AU.sfx) try { AU.sfx(k, v); } catch (e) {} };
  function tuval(w, h) { const c = document.createElement('canvas'); c.width = Math.max(2, Math.ceil(w)); c.height = Math.max(2, Math.ceil(h)); return c; }
  function rr(x, x0, y0, w, h, r) {
    x.beginPath(); x.moveTo(x0 + r, y0); x.arcTo(x0 + w, y0, x0 + w, y0 + h, r); x.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
    x.arcTo(x0, y0 + h, x0, y0, r); x.arcTo(x0, y0, x0 + w, y0, r); x.closePath();
  }
  function yildiz4(x, cx, cy, r, ince = 0.22) {
    x.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, q = i % 2 ? r * ince : r; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
    x.closePath();
  }
  function yildiz5(x, cx, cy, r, ic = 0.5) {
    x.beginPath();
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, q = i % 2 ? r * ic : r; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
    x.closePath();
  }
  // ── önbellekler (boyut değişince sıfırlanır) ──
  let C = {}, cW = 0, cH = 0;
  function kontrol() { if (cW !== W || cH !== H) { C = {}; cW = W; cH = H; } }

  // parıltı sprite'ı
  let parlak = null;
  function parlakSprite() {
    if (parlak) return parlak;
    const c = tuval(96, 96), x = c.getContext('2d');
    const gr = x.createRadialGradient(48, 48, 0, 48, 48, 48);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.2, 'rgba(255,240,255,0.3)'); gr.addColorStop(1, 'rgba(255,240,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 96, 96); x.fillStyle = '#fff'; yildiz4(x, 48, 48, 44, 0.08); x.fill();
    return parlak = c;
  }
  function parilti(px, py, r, a) { if (a <= 0.01 || r <= 0.5) return; g.globalAlpha = Math.min(1, a); g.drawImage(parlakSprite(), px - r, py - r, r * 2, r * 2); g.globalAlpha = 1; }

  // ══════════ EL SİMGESİ (parmak ucu 0,0; el +y yönünde) ══════════
  let elC = null;
  const EL_B = 220, EL_TIP_X = 64, EL_TIP_Y = 26;   // sprite boyu ve parmak ucunun sprite içindeki yeri
  function elSprite() {
    if (elC) return elC;
    const c = tuval(EL_B * 0.8, EL_B), x = c.getContext('2d');
    x.translate(EL_TIP_X, EL_TIP_Y);
    // ☝ işaret eden el: parçalar ayrı ayrı çizgili çizilir ki parmaklar okunsun
    const avuc = () => { x.beginPath(); rr(x, -13, 50, 60, 76, 24); };
    const isaret = () => { x.beginPath(); rr(x, -11, 0, 22, 84, 11); };
    const kivrik = [[9, 52, 36, 21], [9, 71, 35, 20], [9, 89, 31, 19]];
    const bas = () => { x.beginPath(); x.ellipse(-2, 104, 22, 11, -0.42, 0, 6.283); };
    const kol = () => { x.beginPath(); rr(x, -6, 122, 50, 30, 9); };
    const hepsi = () => { avuc(); x.fill(); isaret(); x.fill(); for (const k of kivrik) { x.beginPath(); rr(x, k[0], k[1], k[2], k[3], k[3] / 2); x.fill(); } bas(); x.fill(); kol(); x.fill(); };
    // yumuşak mor parıltı (bir kez, önbellekte)
    x.save(); x.shadowColor = 'rgba(190,150,255,1)'; x.shadowBlur = 26; x.fillStyle = '#fffaf6'; hepsi(); x.restore();
    x.lineJoin = 'round'; x.strokeStyle = '#7c5cd0'; x.lineWidth = 4.5;
    const parca = (yol, renk) => { yol(); x.fillStyle = renk; x.fill(); x.stroke(); };
    parca(kol, '#c9b4ff');
    parca(avuc, '#fff8f2');
    for (let i = kivrik.length - 1; i >= 0; i--) { const k = kivrik[i]; parca(() => { x.beginPath(); rr(x, k[0], k[1], k[2], k[3], k[3] / 2); }, '#fff3ea'); }
    parca(isaret, '#fffaf6');
    parca(bas, '#fff5ee');
    // tırnak, boğum çizgisi, kolluk şeridi
    x.fillStyle = 'rgba(255,205,225,0.95)'; rr(x, -6.5, 4, 13, 14, 6.5); x.fill();
    x.strokeStyle = 'rgba(124,92,208,0.45)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(-6, 40); x.quadraticCurveTo(0, 43, 6, 40); x.stroke();
    x.fillStyle = 'rgba(255,255,255,0.55)'; rr(x, -4, 24, 4, 26, 2); x.fill();
    x.fillStyle = 'rgba(255,240,180,0.9)'; yildiz4(x, 19, 137, 6, 0.3); x.fill();
    return elC = c;
  }
  // el: (px,py) dokunma noktası; boy piksel; aci radyan (0 = el aşağıdan gelir); bas 0..1 (1 = ekrana değiyor)
  function el(px, py, boy, aci, bas, a) {
    if (a <= 0.01) return;
    const s = boy / EL_B, kalk = (1 - bas) * boy * 0.16;
    g.save(); g.translate(px, py); g.rotate(aci); g.translate(0, kalk);
    g.scale(s * (1 + bas * 0.03), s * (1 - bas * 0.05));
    g.globalAlpha = a; g.drawImage(elSprite(), -EL_TIP_X, -EL_TIP_Y);
    g.restore(); g.globalAlpha = 1;
  }
  function halka(px, py, r, a, lw, col = '255,240,255') {
    if (a <= 0.01) return;
    g.strokeStyle = `rgba(${col},${a})`; g.lineWidth = lw; g.beginPath(); g.arc(px, py, r, 0, 6.283); g.stroke();
  }
  // dokunma animasyonu: periyot içinde in-bas-kalk; dalga halkası
  function dokunmaEli(px, py, boy, aci, tm, per, a, cift) {
    let u = (tm % per) / per, bas = 0;
    const vur = (u0) => { const d = u - u0; return d > 0 && d < 0.22 ? Math.sin(d / 0.22 * Math.PI) : 0; };
    bas = cift ? Math.max(vur(0.25), vur(0.52)) : vur(0.3);
    g.globalCompositeOperation = 'lighter';
    for (const u0 of cift ? [0.25, 0.52] : [0.3]) {
      const d = u - u0 - 0.08;
      if (d > 0 && d < 0.45) { const q = d / 0.45; halka(px, py, boy * (0.12 + q * 0.32), a * (1 - q) * 0.8, boy * 0.03 * (1 - q) + 1); dglow('#d8c0ff', px, py, boy * 0.35, a * (1 - q) * 0.45); }
    }
    g.globalCompositeOperation = 'source-over';
    el(px, py, boy, aci, bas, a);
    return bas;
  }

  // ══════════ BAŞLIK ══════════
  function logo() {
    if (C.logo) return C.logo;
    const fs = Math.round(Math.min(H * 0.125, W * 0.1)), fs2 = Math.round(fs * 0.42);
    const w = W, h = Math.round(fs * 2.6), pad = fs * 0.6;
    const metin = tuval(w, h), glow = tuval(w, h);
    const yaz = (x, renk) => {
      x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      x.font = `400 ${fs}px ${FONT_SERIF}`;
      if (renk) { const gr = x.createLinearGradient(0, pad * 0.4, 0, pad + fs * 0.2); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.55, '#f1e6ff'); gr.addColorStop(1, '#d6c0ff'); x.fillStyle = gr; }
      x.fillText('Feza ve Pırıl', w / 2, pad + fs * 0.2);
      x.font = `italic 400 ${fs2}px ${FONT_SERIF}`;
      if (renk) { const gr = x.createLinearGradient(0, pad + fs * 0.5, 0, pad + fs * 1.05); gr.addColorStop(0, '#fff6dc'); gr.addColorStop(1, '#bff4ff'); x.fillStyle = gr; }
      x.fillText('Işık Ormanı', w / 2, pad + fs * 0.95);
      return x.measureText('Işık Ormanı').width;
    };
    // parıltı katmanı: yazıyı tuvalin dışına çizip yalnız gölgesini içeri düşür (saf ışıma)
    const gx = glow.getContext('2d');
    for (const [blur, col] of [[fs * 0.55, 'rgba(160,120,255,0.9)'], [fs * 0.22, 'rgba(220,200,255,0.9)']]) {
      gx.save(); gx.shadowColor = col; gx.shadowBlur = blur; gx.shadowOffsetX = w * 2; gx.translate(-w * 2, 0); gx.fillStyle = '#000'; yaz(gx, false); gx.restore();
    }
    const mx = metin.getContext('2d');
    mx.save(); mx.shadowColor = 'rgba(40,20,90,0.6)'; mx.shadowBlur = fs * 0.06; mx.shadowOffsetY = fs * 0.03;
    const w2 = yaz(mx, true); mx.restore();
    // alt başlığın iki yanında ince süs çizgileri + yıldız
    const yy = pad + fs * 0.95 - fs2 * 0.32;
    for (const s of [-1, 1]) {
      const x0 = w / 2 + s * (w2 / 2 + fs2 * 0.5), x1 = x0 + s * fs * 1.1;
      const gr = mx.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, 'rgba(255,240,210,0.8)'); gr.addColorStop(1, 'rgba(255,240,210,0)');
      mx.strokeStyle = gr; mx.lineWidth = Math.max(1, fs * 0.018); mx.beginPath(); mx.moveTo(x0, yy); mx.lineTo(x1, yy); mx.stroke();
      mx.fillStyle = '#fff2cf'; yildiz4(mx, x0 - s * fs2 * 0.05, yy, fs2 * 0.2, 0.25); mx.fill();
    }
    // harflerin üstünde parıldayan noktalar (yazının içinden rastgele seçilir)
    const yer = []; const d = mx.getImageData(0, 0, w, h).data, r = rng(9);
    for (let i = 0; i < 600 && yer.length < 9; i++) {
      const px = Math.floor(w / 2 - fs * 3.2 + r() * fs * 6.4), py = Math.floor(pad - fs * 0.6 + r() * fs * 0.8);
      if (px > 0 && py > 0 && px < w && py < h && d[(py * w + px) * 4 + 3] > 200) yer.push([px, py, r() * 6.28]);
    }
    return C.logo = { metin, glow, h, fs, yer };
  }
  const motes = [];
  function baslikCiz(tm, a, dt) {
    const L = logo(), y0 = H * 0.13;
    // üstte okunurluk için yumuşak karartma
    const gr = g.createLinearGradient(0, 0, 0, H * 0.62);
    gr.addColorStop(0, `rgba(5,7,22,${0.55 * a})`); gr.addColorStop(1, 'rgba(5,7,22,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H * 0.62);
    // süzülen ışık zerreleri
    if (!motes.length) { const r = rng(77); for (let i = 0; i < 26; i++) motes.push({ x: r(), y: r(), s: 0.6 + r() * 1.2, v: 0.008 + r() * 0.018, h: r() * 6.28, c: ['#c9b2ff', '#9ff0ff', '#ffe6a8'][i % 3] }); }
    g.globalCompositeOperation = 'lighter';
    for (const m of motes) {
      const yy = ((m.y - tm * m.v) % 1 + 1) % 1, xx = m.x + Math.sin(tm * 0.35 + m.h) * 0.025, tw = 0.5 + 0.5 * Math.sin(tm * 1.4 + m.h * 2);
      dglow(m.c, xx * W, yy * H, H * 0.012 * m.s * (1 + tw * 0.4), a * (0.18 + 0.35 * tw) * Math.min(1, yy * 4));
    }
    // logo: nefes alan ışıma + keskin yazı
    const nefes = 0.72 + 0.22 * Math.sin(tm * 1.3);
    g.globalAlpha = a * nefes; g.drawImage(L.glow, 0, y0);
    g.globalCompositeOperation = 'source-over';
    // hafif süzülme
    const dy = Math.sin(tm * 0.8) * H * 0.004;
    g.globalAlpha = a; g.drawImage(L.metin, 0, y0 + dy); g.globalAlpha = 1;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < L.yer.length; i++) {
      const [px, py, ph] = L.yer[i], u = ((tm * 0.33 + ph / 6.28) % 1);
      const v = u < 0.18 ? Math.sin(u / 0.18 * Math.PI) : 0;
      parilti(px, y0 + dy + py, L.fs * 0.32 * v, a * v);
    }
    g.globalCompositeOperation = 'source-over';
    // "dokun" eli: aşağıda ortada, nazikçe dokunuyor
    const hx = W / 2, hy = H * 0.79, boy = Math.min(H * 0.2, W * 0.16);
    const pa = a * uiEase(uiSeg(tm - uiBaslikT0, 0.8, 2));
    if (pa > 0) {
      g.globalCompositeOperation = 'lighter'; dglow('#b896ff', hx, hy, boy * 0.9, pa * (0.25 + 0.1 * Math.sin(tm * 2.2))); g.globalCompositeOperation = 'source-over';
      dokunmaEli(hx, hy, boy, -0.12, tm, 1.6, pa, false);
    }
  }
  let uiBaslikT0 = 0, uiBaslikA = 1, uiBaslikBasladi = false;

  // ══════════ ZIPLAMA DÜĞMESİ ══════════
  function dugmeSprite(R) {
    const key = 'dugme' + Math.round(R);
    if (C[key]) return C[key];
    const pad = R * 0.7, s = Math.ceil((R + pad) * 2), c = tuval(s, s), x = c.getContext('2d'), m = s / 2;
    // dış ışıma (bir kez)
    x.save(); x.shadowColor = 'rgba(185,140,255,0.9)'; x.shadowBlur = R * 0.45;
    x.strokeStyle = 'rgba(235,220,255,0.75)'; x.lineWidth = R * 0.07; x.beginPath(); x.arc(m, m, R * 0.96, 0, 6.283); x.stroke(); x.restore();
    // cam gövde
    const gr = x.createRadialGradient(m - R * 0.25, m - R * 0.35, R * 0.1, m, m, R);
    gr.addColorStop(0, 'rgba(225,205,255,0.42)'); gr.addColorStop(0.7, 'rgba(140,100,230,0.26)'); gr.addColorStop(1, 'rgba(110,80,210,0.34)');
    x.fillStyle = gr; x.beginPath(); x.arc(m, m, R * 0.93, 0, 6.283); x.fill();
    x.strokeStyle = 'rgba(255,248,255,0.85)'; x.lineWidth = R * 0.045; x.beginPath(); x.arc(m, m, R * 0.95, 0, 6.283); x.stroke();
    // üstte cam parlaması
    x.fillStyle = 'rgba(255,255,255,0.16)'; x.beginPath(); x.ellipse(m - R * 0.1, m - R * 0.52, R * 0.55, R * 0.22, -0.15, 0, 6.283); x.fill();
    // simge: yukarı ok (yuvarlak uçlu) + küçük kanat + parıltı
    x.save(); x.translate(m, m + R * 0.08);
    x.shadowColor = 'rgba(200,160,255,1)'; x.shadowBlur = R * 0.18;
    x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#ffffff'; x.lineWidth = R * 0.16;
    x.beginPath(); x.moveTo(-R * 0.36, R * 0.06); x.lineTo(0, -R * 0.32); x.lineTo(R * 0.36, R * 0.06); x.stroke();
    x.beginPath(); x.moveTo(0, -R * 0.26); x.lineTo(0, R * 0.36); x.stroke();
    x.restore();
    x.fillStyle = '#fff6d6'; yildiz4(x, m + R * 0.46, m - R * 0.42, R * 0.17, 0.25); x.fill();
    x.fillStyle = 'rgba(255,246,214,0.8)'; yildiz4(x, m + R * 0.62, m - R * 0.14, R * 0.08, 0.3); x.fill();
    return C[key] = { c, m };
  }
  let basV = 0, basHiz = 0, dugmeA = 0, zipT = 0;
  function dugmeCiz(tm, dt, a) {
    const d = GIRDI.dugme, R = d.r * DPR, cx = d.x * DPR, cy = d.y * DPR;
    if (R <= 1) return;
    // yaylı basılma (bas → ezil, bırak → hafif zıpla)
    const hedef = d.basili ? 1 : 0;
    basHiz += ((hedef - basV) * 420 - basHiz * 22) * dt; basV += basHiz * dt;
    const b = clamp(basV, -0.3, 1.2);
    const sp = dugmeSprite(R);
    const ip = uiIpucu.zipla;   // ipucu sırasında düğme nabız gibi parlar
    const nabiz = ip > 0 ? (0.5 + 0.5 * Math.sin(tm * 5)) * ip : 0;
    g.globalCompositeOperation = 'lighter';
    dglow('#b48cff', cx, cy, R * (1.7 + b * 0.5 + nabiz * 0.5), a * (0.12 + b * 0.35 + nabiz * 0.3));
    if (zipT > 0) halka(cx, cy, R * (1 + (1 - zipT) * 0.7), a * zipT * 0.6, R * 0.06 * zipT + 1);
    g.globalCompositeOperation = 'source-over';
    g.save(); g.translate(cx, cy); g.scale(1 + b * 0.06, 1 - b * 0.1);
    g.globalAlpha = a * (0.78 + b * 0.22); g.drawImage(sp.c, -sp.m, -sp.m); g.restore(); g.globalAlpha = 1;
    if (b > 0.05) { g.globalCompositeOperation = 'lighter'; dglow('#e8dcff', cx, cy, R * 0.9, a * b * 0.35); g.globalCompositeOperation = 'source-over'; }
  }

  // ══════════ İPUÇLARI (el) ══════════
  const uiIpucu = { yuru: 0, zipla: 0, cift: 0 };
  const ip = { basla: -1, yurudu: false, zipladi: false, ziplaGoster: false, ciftGoster: 0, takil: 0, sonZip: 0 };
  OLAY.on('ziplama', () => { ip.zipladi = true; ip.ziplaGoster = false; ip.sonZip = now; zipT = 1; });
  OLAY.on('ciftZiplama', () => { ip.ciftGoster = 0; zipT = 1; });
  OLAY.on('konusma', v => {
    if (!v) return;
    if (v.anahtar === 'p_zipla' && !ip.zipladi) ip.ziplaGoster = true;
    if (v.anahtar === 'p_zipla' && ip.zipladi && now - ip.sonZip > 6) ip.ziplaGoster = true;
    if (v.anahtar === 'p_ciftzipla') ip.ciftGoster = now + 14;
  });
  OLAY.on('carpti', () => { if (!ip.zipladi || now - ip.sonZip > 10) ip.takil += 0.6; });
  function ipucuGuncelle(dt) {
    if (DURUM !== 'oyun') { uiIpucu.yuru = Math.max(0, uiIpucu.yuru - dt * 4); uiIpucu.zipla = Math.max(0, uiIpucu.zipla - dt * 3); uiIpucu.cift = Math.max(0, uiIpucu.cift - dt * 3); return; }
    if (ip.basla < 0) ip.basla = now;
    const t = now - ip.basla, girdi = !!GIRDI.eksen || GIRDI.dugme.basili || GIRDI.hedefX != null;
    if (GIRDI.eksen || Math.abs(P.vx) > 30) ip.yurudu = true;
    ip.bosta = girdi || Math.abs(P.vx) > 5 || !P.ground ? 0 : (ip.bosta || 0) + dt;
    // takıldı mı? (ileri basıyor ama ilerleyemiyor) → zıplama ipucu
    if (GIRDI.eksen && Math.abs(P.vx) < 20 && P.ground) ip.takil += dt; else ip.takil = Math.max(0, ip.takil - dt * 0.5);
    if (ip.takil > 1.6 && (!ip.zipladi || now - ip.sonZip > 10)) { ip.ziplaGoster = true; ip.takil = 0; }
    if (!ip.zipladi && ip.yurudu && t > 5 && !ip.ilkZip) { ip.ilkZip = true; ip.ziplaGoster = true; }   // oyun başında, yürüdükten sonra bir kez
    if (ip.ziplaGoster && !ip.ziplaT0) ip.ziplaT0 = now;
    if (ip.ziplaGoster && now - ip.ziplaT0 > 9) { ip.ziplaGoster = false; }   // kendiliğinden söner; takılırsa yine gelir
    if (!ip.ziplaGoster) ip.ziplaT0 = 0;
    // yürüme eli: yalnız en başta (ilk yürüyüşe kadar) ya da çok uzun süre hiç dokunmazsa
    const yuruH = (!ip.yurudu && t > 1.2) || ip.bosta > 25 ? 1 : 0;
    const zipH = ip.ziplaGoster && !yuruH ? 1 : 0;
    const ciftH = ip.ciftGoster > now && !zipH ? 1 : 0;
    const yak = (k, h, hiz) => { uiIpucu[k] = clamp(uiIpucu[k] + (h ? dt * 1.4 : -dt * hiz), 0, 1); };
    yak('yuru', yuruH, girdi ? 6 : 3); yak('zipla', zipH, 3); yak('cift', ciftH, 3);
  }
  function ipucuCiz(tm) {
    const boy = Math.min(H * 0.16, W * 0.13);
    if (uiIpucu.zipla > 0 || uiIpucu.cift > 0) {
      const d = GIRDI.dugme, cx = d.x * DPR, cy = d.y * DPR, a = Math.max(uiIpucu.zipla, uiIpucu.cift);
      dokunmaEli(cx + d.r * DPR * 0.15, cy + d.r * DPR * 0.1, boy, -0.5, tm, uiIpucu.cift > uiIpucu.zipla ? 1.5 : 1.3, a * 0.95, uiIpucu.cift > uiIpucu.zipla);
    }
    if (uiIpucu.yuru > 0) {
      // ekranın sağında: parmak basılı tutar, oklar sağa doğru akar
      const a = uiIpucu.yuru * 0.8, hx = W - Math.min(W, H) * 0.2, hy = H - Math.min(W, H) * 0.24;   // sağ alt köşe: yolu ve Feza'yı örtmez
      const u = (tm % 2.4) / 2.4, bas = uiEase(uiSeg(u, 0.05, 0.2)) * (1 - uiEase(uiSeg(u, 0.85, 1)));
      g.globalCompositeOperation = 'lighter';
      dglow('#c8b0ff', hx, hy, boy * (0.45 + bas * 0.25), a * bas * 0.55);
      halka(hx, hy, boy * (0.16 + 0.05 * Math.sin(tm * 6)), a * bas * 0.7, boy * 0.025 + 1);
      for (let i = 0; i < 3; i++) {   // akan oklar (yürüyeceği yöne)
        const q = ((tm * 0.9 + i / 3) % 1), ox = hx - boy * 0.95 + boy * (0.35 + q * 0.45), al = a * bas * Math.sin(q * Math.PI) * 0.9;
        oku(ox, hy, boy * 0.09, 1, al);
      }
      g.globalCompositeOperation = 'source-over';
      el(hx, hy, boy, -0.15, bas, a * 0.95);
    }
  }
  function oku(x, y, s, yon, a) {
    if (a <= 0.01) return;
    g.strokeStyle = `rgba(245,235,255,${a})`; g.lineWidth = s * 0.5; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(x - yon * s * 0.6, y - s); g.lineTo(x + yon * s * 0.4, y); g.lineTo(x - yon * s * 0.6, y + s); g.stroke();
  }

  // ══════════ PARMAK IŞIĞI (yürürken basılı tutulan yer) ══════════
  let parA = 0, parX = 0, parY = 0;
  function parmakCiz(tm, dt) {
    const hx = GIRDI.hedefX;
    if (hx != null) {
      let ty = null;
      if (GIRDI.hedefY != null) ty = GIRDI.hedefY;
      else try { if (typeof OM_PARMAK !== 'undefined') { let s = -1; for (const t of OM_PARMAK) if (t.aktif && !t.jump && t.sira > s) { s = t.sira; ty = t.y; } } } catch (e) {}
      const tx = hx * DPR, tyy = (ty != null ? ty : innerHeight * 0.7) * DPR;
      if (parA < 0.05) { parX = tx; parY = tyy; }
      parX = lerp(parX, tx, 1 - Math.exp(-dt * 30)); parY = lerp(parY, tyy, 1 - Math.exp(-dt * 30));
    }
    parA = clamp(parA + (hx != null ? dt * 6 : -dt * 4), 0, 1);
    if (parA <= 0.01) return;
    const r = Math.min(W, H) * 0.06, yon = Math.sign(GIRDI.eksen || 0);
    g.globalCompositeOperation = 'lighter';
    dglow('#c4a8ff', parX, parY, r * 2.1, parA * 0.42);
    dglow('#ffffff', parX, parY, r * 0.7, parA * 0.18);
    halka(parX, parY, r * (0.66 + 0.05 * Math.sin(tm * 6)), parA * 0.32, r * 0.04 + 1);
    if (yon) for (let i = 0; i < 2; i++) { const q = ((tm * 1.4 + i * 0.5) % 1); oku(parX + yon * r * (0.95 + q * 0.6), parY, r * 0.16, yon, parA * Math.sin(q * Math.PI) * 0.7); }
    g.globalCompositeOperation = 'source-over';
  }

  // ══════════ SİMGELER: çiçek, Pofuduk, tohum (açık / sönük) ══════════
  const SIM_B = 160;
  function simge(tur, acik) {
    const key = tur + (acik ? 1 : 0);
    if (C['s_' + key]) return C['s_' + key];
    const c = tuval(SIM_B, SIM_B), x = c.getContext('2d'), m = SIM_B / 2;
    x.translate(m, m);
    const sonuk = !acik;
    if (acik) {   // yumuşak hale
      const gr = x.createRadialGradient(0, 0, 0, 0, 0, m);
      const hc = tur === 'cicek' ? '255,214,240' : tur === 'pofuduk' ? '255,190,230' : '255,230,160';
      gr.addColorStop(0, `rgba(${hc},0.55)`); gr.addColorStop(0.5, `rgba(${hc},0.16)`); gr.addColorStop(1, `rgba(${hc},0)`);
      x.fillStyle = gr; x.fillRect(-m, -m, SIM_B, SIM_B);
    }
    x.lineJoin = 'round'; x.lineCap = 'round';
    if (tur === 'cicek') {
      for (let i = 0; i < 5; i++) {
        x.save(); x.rotate(i * 1.2566);
        const gr = x.createLinearGradient(0, -6, 0, -46);
        gr.addColorStop(0, sonuk ? 'rgba(150,140,190,0.5)' : '#ff9fd0'); gr.addColorStop(1, sonuk ? 'rgba(175,165,210,0.42)' : '#ffe6f3');
        x.fillStyle = gr; x.beginPath(); x.moveTo(0, -4); x.bezierCurveTo(-20, -18, -16, -44, 0, -46); x.bezierCurveTo(16, -44, 20, -18, 0, -4); x.fill();
        if (!sonuk) { x.strokeStyle = 'rgba(240,140,190,0.45)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -10); x.lineTo(0, -32); x.stroke(); }
        x.restore();
      }
      x.fillStyle = sonuk ? 'rgba(170,160,200,0.6)' : '#ffd860'; x.beginPath(); x.arc(0, 0, 11, 0, 6.283); x.fill();
      if (!sonuk) { x.fillStyle = '#fff5c8'; x.beginPath(); x.arc(-3, -3, 4, 0, 6.283); x.fill(); }
    } else if (tur === 'pofuduk') {
      // tüylü top: kenarı tırtıklı daire
      x.beginPath();
      for (let i = 0; i <= 28; i++) { const a = i / 28 * 6.283, q = 42 + (i % 2 ? 4 : -1); x.lineTo(Math.cos(a) * q, Math.sin(a) * q * 0.9 + 4); }
      x.closePath();
      const gr = x.createRadialGradient(-10, -10, 4, 0, 4, 48);
      gr.addColorStop(0, sonuk ? 'rgba(170,165,200,0.6)' : '#ffe0f2'); gr.addColorStop(1, sonuk ? 'rgba(120,118,160,0.55)' : '#ff9fd2');
      x.fillStyle = gr; x.fill();
      x.strokeStyle = sonuk ? 'rgba(60,50,90,0.6)' : '#5a2a4a'; x.lineWidth = 4;
      if (sonuk) { x.beginPath(); x.moveTo(-18, 0); x.lineTo(-7, 0); x.moveTo(7, 0); x.lineTo(18, 0); x.stroke(); }
      else {   // mutlu kapalı gözler + gülümseme + yanak
        x.beginPath(); x.arc(-13, 2, 6, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
        x.beginPath(); x.arc(13, 2, 6, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
        x.beginPath(); x.arc(0, 10, 7, 0.25, Math.PI - 0.25); x.stroke();
        x.fillStyle = 'rgba(255,120,170,0.55)'; x.beginPath(); x.arc(-25, 12, 6, 0, 6.283); x.arc(25, 12, 6, 0, 6.283); x.fill();
      }
      // kulak tutamları
      x.fillStyle = sonuk ? 'rgba(150,145,185,0.6)' : '#ffc0e2';
      x.beginPath(); x.ellipse(-20, -36, 7, 11, -0.5, 0, 6.283); x.ellipse(20, -36, 7, 11, 0.5, 0, 6.283); x.fill();
    } else {   // tohum: altın damla + parıltı
      x.beginPath(); x.moveTo(0, -42); x.bezierCurveTo(26, -14, 30, 20, 0, 36); x.bezierCurveTo(-30, 20, -26, -14, 0, -42); x.closePath();
      const gr = x.createLinearGradient(-20, -30, 20, 30);
      gr.addColorStop(0, sonuk ? 'rgba(190,180,210,0.55)' : '#fff3b8'); gr.addColorStop(1, sonuk ? 'rgba(130,125,165,0.5)' : '#f0a93c');
      x.fillStyle = gr; x.fill();
      x.strokeStyle = sonuk ? 'rgba(220,215,240,0.35)' : 'rgba(255,255,255,0.7)'; x.lineWidth = 4; x.beginPath(); x.moveTo(-8, -18); x.quadraticCurveTo(-14, 0, -8, 18); x.stroke();
      if (!sonuk) { x.fillStyle = '#ffffff'; yildiz4(x, 14, -20, 10, 0.25); x.fill(); }
    }
    return C['s_' + key] = c;
  }
  function simgeCiz(tur, acik, cx, cy, boy, a, sc = 1) {
    if (a <= 0.01) return;
    g.globalAlpha = a; const s = boy * sc; g.drawImage(simge(tur, acik), cx - s / 2, cy - s / 2, s, s); g.globalAlpha = 1;
  }

  // ══════════ OYUN İÇİ: çiçek/tohum açılınca kısa süre görünen küçük simge sırası ══════════
  let bildirim = null;   // { tur, t0, yeni }
  OLAY.on('cicek', () => { bildirim = { tur: 'cicek', t0: now }; });
  OLAY.on('tohum', () => { bildirim = { tur: 'tohum', t0: now }; });
  function bildirimCiz(tm) {
    if (!bildirim || DURUM !== 'oyun') return;
    const u = now - bildirim.t0, sure = 2.8;
    if (u > sure) { bildirim = null; return; }
    const a = uiEase(uiSeg(u, 0.15, 0.5)) * (1 - uiEase(uiSeg(u, sure - 0.8, sure)));
    const top = bildirim.tur === 'cicek' ? SAYAC.cicekTop : SAYAC.tohumTop, var_ = bildirim.tur === 'cicek' ? SAYAC.cicek : SAYAC.tohum;
    if (!top) return;
    // küçük, zarif: üst ortada ince bir sıra; açılanlar minik parlayan çiçek, açılmayanlar minik sönük nokta
    const boy = Math.min(H * 0.042, W * 0.034), ara = boy * 0.9, x0 = W / 2 - (top - 1) * ara / 2, y = H * 0.045 + boy * 0.5 - (1 - a) * boy * 0.4;
    g.globalCompositeOperation = 'lighter';
    dglow('#6a58c0', W / 2, y, Math.max(top * ara * 0.65, boy * 2), a * 0.18);
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < top; i++) {
      const acik = i < var_, yeni = i === var_ - 1, cx = x0 + i * ara;
      if (acik && (!yeni || u > 0.45)) {
        const sc = yeni ? Math.max(0.3, uiBack(uiSeg(u, 0.45, 0.9))) : 1;
        simgeCiz(bildirim.tur, true, cx, y, boy, a, sc);
        if (yeni && u < 1.5) { g.globalCompositeOperation = 'lighter'; parilti(cx, y, boy * 0.9 * Math.sin(uiSeg(u, 0.45, 1.5) * Math.PI), a); g.globalCompositeOperation = 'source-over'; }
      } else {
        g.fillStyle = `rgba(210,200,255,${0.35 * a})`; g.beginPath(); g.arc(cx, y, boy * 0.11, 0, 6.283); g.fill();
      }
    }
  }

  // ══════════ ALTYAZI (yalnız ?altyazi ile; ebeveyn için, küçük) ══════════
  let alt = null;   // { c, t0, sure }
  function altyazi(metin, sure = 3, kim) {
    if (!ALTYAZI_ACIK || !metin) return;
    if (!kim) kim = DURUM === 'oyun' ? 'p' : 'a';
    const fs = Math.round(clamp(H * 0.026, 13, 30)), x = g;
    x.font = `500 ${fs}px ${FONT_UI}`;
    const maxW = W * 0.62, sozler = metin.split(' '), satir = [];
    let s = '';
    for (const w of sozler) { const d = s ? s + ' ' + w : w; if (x.measureText(d).width > maxW && s) { satir.push(s); s = w; } else s = d; }
    if (s) satir.push(s);
    const lw = Math.max(...satir.map(q => x.measureText(q).width)), ik = fs * 1.5, pad = fs * 0.8;
    const cw = lw + ik + pad * 2.2, ch = satir.length * fs * 1.3 + pad * 1.1;
    const c = tuval(cw + 8, ch + 8), y = c.getContext('2d');
    y.translate(4, 4);
    y.fillStyle = 'rgba(14,10,34,0.62)'; rr(y, 0, 0, cw, ch, Math.min(ch / 2, fs * 1.1)); y.fill();
    y.strokeStyle = kim === 'p' ? 'rgba(200,160,255,0.45)' : 'rgba(170,220,255,0.35)'; y.lineWidth = 1.5; y.stroke();
    // konuşan simgesi: Pırıl (mor ejderha başı) / anlatıcı (hilal)
    const ix = pad + ik * 0.4, iy = ch / 2;
    if (kim === 'p') {
      y.fillStyle = '#a77cff'; y.beginPath(); y.arc(ix, iy, fs * 0.42, 0, 6.283); y.fill();
      y.fillStyle = '#fff1d6'; y.beginPath(); y.moveTo(ix - fs * 0.25, iy - fs * 0.3); y.lineTo(ix - fs * 0.32, iy - fs * 0.62); y.lineTo(ix - fs * 0.06, iy - fs * 0.38); y.fill();
      y.beginPath(); y.moveTo(ix + fs * 0.1, iy - fs * 0.38); y.lineTo(ix + fs * 0.22, iy - fs * 0.66); y.lineTo(ix + fs * 0.32, iy - fs * 0.28); y.fill();
      y.fillStyle = '#2b1450'; y.beginPath(); y.arc(ix + fs * 0.14, iy - fs * 0.04, fs * 0.08, 0, 6.283); y.fill();
    } else {
      y.fillStyle = '#e8f1ff'; y.beginPath(); y.arc(ix, iy, fs * 0.4, 0, 6.283); y.arc(ix + fs * 0.18, iy - fs * 0.12, fs * 0.34, 0, 6.283, true); y.fill('evenodd');
    }
    y.font = `500 ${fs}px ${FONT_UI}`; y.textBaseline = 'middle'; y.fillStyle = '#f7f1ff'; y.textAlign = 'left';
    satir.forEach((q, i) => y.fillText(q, pad + ik, ch / 2 + (i - (satir.length - 1) / 2) * fs * 1.3));
    alt = { c, t0: now, sure: Math.max(1.5, sure) + 0.3 };
  }
  function altyaziCiz() {
    if (!alt) return;
    const u = now - alt.t0;
    if (u > alt.sure + 0.5) { alt = null; return; }
    const a = uiEase(uiSeg(u, 0, 0.3)) * (1 - uiEase(uiSeg(u, alt.sure, alt.sure + 0.5)));
    g.globalAlpha = a; g.drawImage(alt.c, Math.round(W / 2 - alt.c.width / 2), Math.round(H * 0.035 + (1 - a) * -H * 0.01)); g.globalAlpha = 1;
  }

  // ══════════ BİTİŞ EKRANI ══════════
  let son = null;
  function sonKur() {
    const satir = [['cicek', SAYAC.cicek, SAYAC.cicekTop], ['pofuduk', SAYAC.pofuduk, SAYAC.pofudukTop]];
    if (SAYAC.tohumTop) satir.push(['tohum', SAYAC.tohum, SAYAC.tohumTop]);
    // sıra: önce açık olanlar tek tek parlar (sesli), sonra sönükler sessizce belirir
    const olay = []; let t = 0.9;
    satir.forEach(([tur, v, top], si) => { for (let i = 0; i < top; i++) if (i < v) { olay.push({ si, i, t, ses: true }); t += Math.max(0.16, 0.32 - v * 0.012); } t += 0.2; });
    satir.forEach(([tur, v, top], si) => { for (let i = v; i < top; i++) olay.push({ si, i, t: 1.0 + si * 0.15, ses: false }); });
    son = { t0: now, satir, olay, dugmeT: t + 0.5, calindi: new Set() };
  }
  function baslikKucuk() {
    if (C.sonBaslik) return C.sonBaslik;
    const fs = Math.round(Math.min(H * 0.06, W * 0.055)), w = Math.ceil(fs * 9), h = Math.ceil(fs * 2);
    const c = tuval(w, h), x = c.getContext('2d');
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `400 ${fs}px ${FONT_SERIF}`;
    x.save(); x.shadowColor = 'rgba(255,190,90,0.9)'; x.shadowBlur = fs * 0.35; x.fillStyle = '#8a4fb0'; x.fillText('Orman ışıl ışıl!', w / 2, h / 2); x.restore();
    const gr = x.createLinearGradient(0, h * 0.25, 0, h * 0.75); gr.addColorStop(0, '#9b5cc4'); gr.addColorStop(1, '#6a3a94');
    x.fillStyle = gr; x.fillText('Orman ışıl ışıl!', w / 2, h / 2);
    return C.sonBaslik = c;
  }
  function tekrarSprite(R) {
    const key = 'tekrar' + Math.round(R);
    if (C[key]) return C[key];
    const pad = R * 0.6, s = Math.ceil((R + pad) * 2), c = tuval(s, s), x = c.getContext('2d'), m = s / 2;
    x.save(); x.shadowColor = 'rgba(255,190,110,0.9)'; x.shadowBlur = R * 0.5;
    const gr = x.createRadialGradient(m - R * 0.3, m - R * 0.3, R * 0.1, m, m, R);
    gr.addColorStop(0, '#ffe9a8'); gr.addColorStop(0.6, '#ffc35c'); gr.addColorStop(1, '#f39a3c');
    x.fillStyle = gr; x.beginPath(); x.arc(m, m, R, 0, 6.283); x.fill(); x.restore();
    x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = R * 0.06; x.beginPath(); x.arc(m, m, R * 0.97, 0, 6.283); x.stroke();
    x.fillStyle = 'rgba(255,255,255,0.28)'; x.beginPath(); x.ellipse(m - R * 0.12, m - R * 0.55, R * 0.55, R * 0.2, -0.2, 0, 6.283); x.fill();
    // dairesel ok
    x.save(); x.translate(m, m + R * 0.02);
    x.strokeStyle = '#ffffff'; x.lineWidth = R * 0.17; x.lineCap = 'round';
    x.shadowColor = 'rgba(190,90,20,0.55)'; x.shadowBlur = R * 0.08; x.shadowOffsetY = R * 0.03;
    const r0 = R * 0.46, a0 = -Math.PI * 0.35, a1 = Math.PI * 1.25;
    x.beginPath(); x.arc(0, 0, r0, a0, a1); x.stroke();
    const ux = Math.cos(a0) * r0, uy = Math.sin(a0) * r0, tx = -Math.sin(a0), ty = Math.cos(a0);   // uç ve teğet (geri yön)
    x.fillStyle = '#ffffff'; x.beginPath();
    const L = R * 0.34, nx = Math.cos(a0), ny = Math.sin(a0);
    x.moveTo(ux - tx * L * 0.9, uy - ty * L * 0.9);
    x.lineTo(ux + nx * L * 0.62 + tx * L * 0.25, uy + ny * L * 0.62 + ty * L * 0.25);
    x.lineTo(ux - nx * L * 0.62 + tx * L * 0.25, uy - ny * L * 0.62 + ty * L * 0.25);
    x.closePath(); x.fill();
    x.restore();
    return C[key] = { c, m };
  }
  let tekrarYer = null;
  // kart: sıcak krem, yuvarlak köşe, yumuşak gölge (bir kez çizilir)
  function sonKart(w, h) {
    const key = 'kart' + Math.round(w) + 'x' + Math.round(h);
    if (C[key]) return C[key];
    const pad = h * 0.12, c = tuval(w + pad * 2, h + pad * 2), x = c.getContext('2d'), r = Math.min(h * 0.12, w * 0.06);
    x.save(); x.shadowColor = 'rgba(90,40,30,0.35)'; x.shadowBlur = pad * 0.7; x.shadowOffsetY = pad * 0.15;
    x.fillStyle = 'rgba(255,248,238,0.92)'; rr(x, pad, pad, w, h, r); x.fill(); x.restore();
    const gr = x.createLinearGradient(0, pad, 0, pad + h); gr.addColorStop(0, 'rgba(255,253,248,0.95)'); gr.addColorStop(1, 'rgba(255,236,222,0.95)');
    x.fillStyle = gr; rr(x, pad, pad, w, h, r); x.fill();
    x.strokeStyle = 'rgba(255,214,150,0.9)'; x.lineWidth = Math.max(2, h * 0.008); rr(x, pad + h * 0.02, pad + h * 0.02, w - h * 0.04, h - h * 0.04, r * 0.85); x.stroke();
    // köşelerde minik yıldız süsleri
    x.fillStyle = 'rgba(255,200,110,0.8)';
    for (const [qx, qy] of [[0.05, 0.08], [0.95, 0.08], [0.05, 0.92], [0.95, 0.92]]) { yildiz4(x, pad + w * qx, pad + h * qy, h * 0.025, 0.3); x.fill(); }
    return C[key] = { c, pad };
  }
  function sonCiz(tm, dt) {
    if (!son) sonKur();
    const u = now - son.t0;
    const a = uiEase(uiSeg(u, 0, 1.0));
    // odanın üstüne çok hafif sıcak örtü
    g.fillStyle = `rgba(70,35,45,${0.22 * a})`; g.fillRect(0, 0, W, H);
    // yerleşim
    const n = son.satir.length, enCok = Math.max(...son.satir.map(s => s[2]), 1);
    const kw = Math.min(W * 0.9, H * 1.3), boy = Math.min(H * 0.11, kw * 0.9 / Math.max(5, enCok) / 1.08), ara = boy * 1.08;
    const bh = H * 0.1, dy = boy * 1.22, R = Math.min(H * 0.08, W * 0.075);
    const kh = bh + n * dy + boy * 1.1 + R * 0.9, kx = W / 2 - kw / 2, ky = Math.max(H * 0.04, (H - kh - R * 1.3) / 2);
    const kart = sonKart(kw, kh), kgir = uiBack(uiSeg(u, 0.1, 0.8));
    g.save(); g.globalAlpha = a; g.translate(W / 2, ky + kh / 2); g.scale(0.92 + 0.08 * kgir, 0.92 + 0.08 * kgir);
    g.drawImage(kart.c, -kw / 2 - kart.pad, -kh / 2 - kart.pad); g.restore(); g.globalAlpha = 1;
    // süs başlık (ebeveyn için; ekran onsuz da anlaşılır)
    const bk = baslikKucuk(), ba = uiEase(uiSeg(u, 0.4, 1.3)), bs = Math.min(1, bh * 0.95 / bk.height * 1.6);
    g.globalAlpha = ba; g.drawImage(bk, W / 2 - bk.width * bs / 2, ky + bh * 0.62 - bk.height * bs / 2, bk.width * bs, bk.height * bs); g.globalAlpha = 1;
    // simge satırları
    const y0 = ky + bh + dy * 0.5;
    son.satir.forEach(([tur, v, top], si) => {
      const y = y0 + si * dy, x0 = W / 2 - (top - 1) * ara / 2;
      for (let i = 0; i < top; i++) {
        const ev = son.olay.find(e => e.si === si && e.i === i); if (!ev) continue;
        const q = u - ev.t; if (q < 0) continue;
        const cx = x0 + i * ara, acik = i < v;
        if (acik) {
          if (ev.ses && !son.calindi.has(ev)) { son.calindi.add(ev); sfx('bloom', 0); }
          const sc = uiBack(uiSeg(q, 0, 0.45)), zip = Math.sin(tm * 2.2 + i * 0.7 + si) * boy * 0.03;
          g.globalCompositeOperation = 'lighter';
          if (q < 1.1) parilti(cx + boy * 0.3, y - boy * 0.3, boy * 0.6 * Math.sin(uiSeg(q, 0, 1.1) * Math.PI), 1);
          g.globalCompositeOperation = 'source-over';
          simgeCiz(tur, true, cx, y + zip, boy * 1.15, Math.min(1, q * 3), Math.max(0.01, sc));
        } else {
          simgeCiz(tur, false, cx, y, boy * 0.82, uiEase(uiSeg(q, 0, 0.8)) * 0.9);
        }
      }
    });
    // üç yıldız: hep olumlu
    const yt = son.dugmeT - 0.3, ys = y0 + n * dy - dy * 0.12;
    for (let i = 0; i < 3; i++) {
      const q = u - yt - i * 0.18; if (q < 0) continue;
      const sc = uiBack(uiSeg(q, 0, 0.5)), cx = W / 2 + (i - 1) * boy * 1.05, cy = ys - (i === 1 ? boy * 0.1 : 0), r = boy * (i === 1 ? 0.5 : 0.4) * sc;
      if (q < 0.05 && !son.calindi.has('y' + i)) { son.calindi.add('y' + i); if (i === 1) sfx('bloom', 1); }
      g.save(); g.translate(cx, cy); g.rotate(Math.sin(tm * 1.5 + i) * 0.08);
      const gg = g.createLinearGradient(0, -r, 0, r); gg.addColorStop(0, '#fff2b0'); gg.addColorStop(1, '#ffb52e');
      g.fillStyle = gg; yildiz5(g, 0, 0, r, 0.5); g.fill();
      g.strokeStyle = '#f08a1c'; g.lineWidth = Math.max(1, r * 0.09); g.lineJoin = 'round'; g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(-r * 0.18, -r * 0.3, r * 0.14, r * 0.08, -0.6, 0, 6.283); g.fill();
      g.restore();
      if (q < 0.9) { g.globalCompositeOperation = 'lighter'; parilti(cx, cy, r * 2.2 * Math.sin(uiSeg(q, 0, 0.9) * Math.PI), 0.9); g.globalCompositeOperation = 'source-over'; }
    }
    // tekrar oyna düğmesi (dairesel ok), kartın alt kenarına oturur
    const q = u - son.dugmeT;
    if (q > 0) {
      const cx = W / 2, cy = ky + kh + R * 0.15;
      const sc = uiBack(uiSeg(q, 0, 0.55)) * (1 + 0.04 * Math.sin(tm * 3));
      tekrarYer = { x: cx / DPR, y: cy / DPR, r: R * 1.4 / DPR };
      g.globalCompositeOperation = 'lighter';
      dglow('#ffcf80', cx, cy, R * (2.2 + 0.3 * Math.sin(tm * 3)), 0.35 * Math.min(1, q * 2));
      const hq = (tm % 2) / 2; halka(cx, cy, R * (1.05 + hq * 0.6), (1 - hq) * 0.5 * Math.min(1, q), R * 0.05 + 1, '255,230,180');
      g.globalCompositeOperation = 'source-over';
      const sp = tekrarSprite(R);
      g.save(); g.translate(cx, cy); g.scale(sc, sc); g.rotate(Math.sin(tm * 1.2) * 0.05); g.drawImage(sp.c, -sp.m, -sp.m); g.restore();
      // ilk birkaç saniye: dokunma eli düğmeyi gösterir
      if (q > 2.5 && q < 12) dokunmaEli(cx + R * 0.2, cy + R * 0.15, R * 2.2, -0.45, tm, 1.6, uiEase(uiSeg(q, 2.5, 3.2)) * (1 - uiSeg(q, 10.5, 12)), false);
    }
  }
  OLAY.on('dokunus', v => {
    if (DURUM !== 'son' || !son || !tekrarYer) return;
    if (!v || v.x == null || Math.hypot(v.x - tekrarYer.x, v.y - tekrarYer.y) < tekrarYer.r) {
      try { location.reload(); } catch (e) {}
    }
  });

  // ══════════ ANA ÇİZİM ══════════
  let durumOnce = DURUM; const uiHata = {};
  function ciz(tm, dt) {
    kontrol();
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    if (DURUM !== durumOnce) { durumOnce = DURUM; }
    // başlık (oyun başlayınca yumuşakça söner)
    if (DURUM === 'baslik') { if (!uiBaslikBasladi) { uiBaslikBasladi = true; uiBaslikT0 = tm; } uiBaslikA = Math.min(1, uiBaslikA + dt * 2); }
    else uiBaslikA = Math.max(0, uiBaslikA - dt * 1.6);
    // her parça ayrı korunur: birinde hata olursa diğerleri (özellikle zıplama düğmesi) yine çizilir
    const dene = (ad, fn) => { try { fn(); } catch (e) { if (!uiHata[ad]) { uiHata[ad] = 1; console.warn('[arayuz] ' + ad, e); } g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } };
    if (uiBaslikA > 0.005) dene('baslik', () => baslikCiz(tm, uiEase(uiBaslikA), dt));
    // oyun içi
    dene('ipucu', () => ipucuGuncelle(dt));
    zipT = Math.max(0, zipT - dt * 2.5);
    dugmeA = clamp(dugmeA + (DURUM === 'oyun' ? dt * 1.5 : -dt * 3), 0, 1);
    if (dugmeA > 0.005) { dene('parmak', () => parmakCiz(tm, dt)); dene('dugme', () => dugmeCiz(tm, dt, dugmeA)); }
    dene('ipucuCiz', () => ipucuCiz(tm));
    dene('bildirim', () => bildirimCiz(tm));
    if (DURUM === 'son') dene('son', () => sonCiz(tm, dt));
    dene('altyazi', altyaziCiz);
  }
  return { ciz, altyazi };
})();

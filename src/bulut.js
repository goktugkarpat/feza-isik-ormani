/* bulut.js – Bölüm 3 "Bulut Ülkesi" nesne türleri (LEVEL3, önek bu). Sözleşme: src/BOLUM3.md. Yükleme anında yalnız tür kaydı yapar
   (her bölümde yüklenir, Bölüm 1/2'yi etkilemez).
   • bulutZip   : basınca esneyip zıplatan kabarık pembe bulut (cisim 'ziplat'; squash & stretch yayı, pırıltılar). y = ÜST yüzey.
                  {w, guc, h, gom (çukura gömülü: zeminle aynı hizada)} · AU.sfx('bulutZip', güç 0..1) · OLAY 'bulutZip' (o).
   • bulutYuzen : yavaşça giden bulut platform (cisim 'ustten'; cisim.dx/dy ile Feza'yı taşır). y = ÜST yüzey (başlangıç).
                  {w, ax (sağa gidiş), ay (yukarı gidiş), sure (gidiş-dönüş sn), faz}. Uçlarda kısa bekler (5 yaş: kenardan kenara).
   • esinti     : dikey yumuşak hava akımı. İçine giren Feza nazikçe yukarı taşınır (yerçekimi karşılanır, P.vy ≈ -300'e yumuşakça çekilir,
                  sütunun üst %30'unda güç söner → Feza tepede süzülür). {w, h}; y = sütunun DİBİ. AU.sfx('esinti') girişte.
   • gokkusagi  : final tepesi. Bütün kuzucuklar renkliyken Feza tepeye gelince: OLAY 'gokkusagiBasla' (o; o.yayX/o.yayY = 7 kuzucuğun
                  gökteki yay konumları, renkI sırasıyla) → gökkuşağı bant bant belirir (AU 'gokkusagiParca' v=renkI, sonra 'gokkusagiTamam')
                  → Feza yayın tepesine sıçrar ve kayarak iner (P.kilit, P.poz='kayma', P.kaymaAci; AU 'kayma') → OLAY 'gokkusagiTamam' (o).
   • bulutKopru : yedek köprü — YALNIZ ucus.js'in 'ucusKapisi' türü yoksa Büyük Boşluk'ta beliren bulut basamakları (ustten).
   • süsler     : ucurtma (ipli uçurtma), kusSuru (uzakta süzülen kuş sürüsü), tuy (havada salınan tüy). Böcek yok. */
'use strict';

// ───────────────────────── ortak ─────────────────────────
const BU_GK = ['#ff7b8a', '#ffad66', '#ffe070', '#8edc8a', '#78c4ff', '#8a8cf0', '#c596f2'];   // gökkuşağı: kırmızı→mor (pastel-canlı)
const BU_GK_ACIK = ['#ffd0d6', '#ffe0c2', '#fff4c4', '#d6f6d2', '#d0ecff', '#d8d8ff', '#efdcff'];
const BU_PAL = {   // [üst ışık, orta, alt gölge, en alt (lila)]
  zip: ['#fff6fa', '#ffd0e2', '#f4a3c6', '#c98ac4'],
  yuzen: ['#fffaf2', '#ffe6c8', '#f6bf98', '#d6a0b0'],
  kopru: ['#fcf8ff', '#ece0ff', '#c9b4f0', '#a491d8'],
  ruzgar: ['#fbfffd', '#dff6f2', '#b9e0e6', '#a2b8de'],
};
const buSp = {};
const BU_PI2 = Math.PI * 2;
function buCan(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function buSfx(ad, v) { if (typeof SESSIZ !== 'undefined' && SESSIZ) return; if (typeof AU !== 'undefined' && AU && typeof AU.sfx === 'function') { try { AU.sfx(ad, v); } catch (e) {} } }
function buUst(o) { return typeof ustundeki !== 'undefined' && ustundeki === o; }
function buEkranda(x, pay) { return typeof cam === 'undefined' || (x > cam.x - pay && x < cam.x + VW + pay); }
function buKY(p, x, y, w, h, r) {   // yuvarlak köşeli dikdörtgen (Path2D/ctx)
  p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.arcTo(x + w, y, x + w, y + r, r); p.lineTo(x + w, y + h - r); p.arcTo(x + w, y + h, x + w - r, y + h, r);
  p.lineTo(x + r, y + h); p.arcTo(x, y + h, x, y + h - r, r); p.lineTo(x, y + r); p.arcTo(x, y, x + r, y, r); p.closePath();
}
// Kabarık bulut sprite'ı: gövde (üst yüzey y=0 hizasında, h kalın) + üstte küçük, altta iri ponponlar. Önbellekli.
// Dönüş: { c (tuval), k (piksel/birim), ox, oy (gövdenin sol-üst köşesinin tuvaldeki yeri, birim) }
function buBulut(w, h, pal, seed) {
  const key = 'b' + w + '_' + h + '_' + pal + '_' + seed; if (buSp[key]) return buSp[key];
  const k = 2, pad = 30, W2 = w + pad * 2, H2 = h + pad * 2 + 10, c = buCan(W2 * k, H2 * k), x = c.getContext('2d'), rs = rng(seed * 7919 + 13);
  const Pa = BU_PAL[pal] || BU_PAL.zip;
  x.scale(k, k); x.translate(pad, pad);
  const sh = new Path2D(), ust = [], alt = [];
  buKY(sh, 0, 0, w, h, Math.min(h / 2, 16));
  const nt = Math.max(3, Math.round(w / 30));
  for (let i = 0; i < nt; i++) { const r = 8 + rs() * 7 + (i > 0 && i < nt - 1 ? 3 : 0), px = w * (i + 0.5) / nt + (rs() - 0.5) * 8, py = 7 - r * 0.42; ust.push([px, py, r]); sh.moveTo(px + r, py); sh.arc(px, py, r, 0, BU_PI2); }
  const nb = Math.max(2, Math.round(w / 34));
  for (let i = 0; i < nb; i++) { const r = h * 0.42 + 4 + rs() * 7, px = w * (i + 0.5) / nb + (rs() - 0.5) * 10, py = h - r * 0.25; alt.push([px, py, r]); sh.moveTo(px + r, py); sh.arc(px, py, r, 0, BU_PI2); }
  for (const s of [-1, 1]) { const r = h * 0.5 + 3, px = s < 0 ? 2 : w - 2, py = h * 0.5; sh.moveTo(px + r, py); sh.arc(px, py, r, 0, BU_PI2); }
  const gr = x.createLinearGradient(0, -16, 0, h + 18);
  gr.addColorStop(0, Pa[0]); gr.addColorStop(0.35, Pa[1]); gr.addColorStop(0.78, Pa[2]); gr.addColorStop(1, Pa[3]);
  x.fillStyle = gr; x.fill(sh);
  x.globalCompositeOperation = 'source-atop';
  for (const [px, py, r] of ust) {   // ponponların üstünde yumuşak ışık (gün doğumu soldan-üstten)
    const hg = x.createRadialGradient(px - r * 0.35, py - r * 0.45, 0, px - r * 0.2, py - r * 0.2, r * 1.15);
    hg.addColorStop(0, 'rgba(255,255,255,0.85)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = hg; x.fillRect(px - r * 2, py - r * 2, r * 4, r * 4);
  }
  for (const [px, py, r] of alt) {   // alt ponponların gölgesi (lila)
    const hg = x.createRadialGradient(px + r * 0.2, py + r * 0.5, 0, px, py + r * 0.3, r * 1.1);
    hg.addColorStop(0, 'rgba(150,110,190,0.28)'); hg.addColorStop(1, 'rgba(150,110,190,0)'); x.fillStyle = hg; x.fillRect(px - r * 2, py - r * 2, r * 4, r * 4);
  }
  const rim = x.createLinearGradient(-w * 0.1, 0, w * 1.1, 0);   // gün doğumu kenar ışığı (sağdan sıcak)
  rim.addColorStop(0, 'rgba(255,255,255,0)'); rim.addColorStop(0.75, 'rgba(255,236,210,0)'); rim.addColorStop(1, 'rgba(255,214,170,0.45)');
  x.fillStyle = rim; x.fillRect(-pad, -pad, W2, H2);
  x.globalCompositeOperation = 'source-over';
  x.strokeStyle = 'rgba(255,255,255,0.55)'; x.lineWidth = 1.2;   // üst kenar ince parlak çizgi
  for (const [px, py, r] of ust) { x.beginPath(); x.arc(px, py, r - 0.6, Math.PI * 1.08, Math.PI * 1.72); x.stroke(); }
  return buSp[key] = { c, k, ox: pad, oy: pad };
}
function buBulutCiz(sp, x, ust, w, sx, sy, a) {   // sp: buBulut; x merkez, ust: gövde üstü; sx/sy ölçek (altta sabit)
  const cw = sp.c.width / sp.k, ch = sp.c.height / sp.k;
  if (a !== undefined && a < 1) g.globalAlpha = a;
  if (sx === 1 && sy === 1) g.drawImage(sp.c, x - w / 2 - sp.ox, ust - sp.oy, cw, ch);
  else {
    const by = ust + 18;   // ölçek merkezi gövdenin altı
    g.save(); g.translate(x, by); g.scale(sx, sy); g.drawImage(sp.c, -w / 2 - sp.ox, ust - sp.oy - by, cw, ch); g.restore();
  }
  if (a !== undefined && a < 1) g.globalAlpha = 1;
}
function buPirilti(x, y, r, a, rot) {   // dört kollu minik pırıltı ('lighter' içinde çağrılır)
  if (a <= 0.01) return;
  dglow('#fff6e8', x, y, r * 2.4, a * 0.6);
  g.globalAlpha = a; g.fillStyle = '#ffffff';
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.12, -r * 0.12, r, 0); g.quadraticCurveTo(r * 0.12, r * 0.12, 0, r);
  g.quadraticCurveTo(-r * 0.12, r * 0.12, -r, 0); g.quadraticCurveTo(-r * 0.12, -r * 0.12, 0, -r); g.fill();
  g.restore(); g.globalAlpha = 1;
}
const BU_R_ZIP = ['#ffd6e8', '#ffffff', '#ffe9b8', '#e8d4ff'];
const BU_R_GK = BU_GK.concat(['#ffffff']);

// ───────────────────────── bulutZip: zıplatan bulut ─────────────────────────
TUR.kaydet('bulutZip', {
  kur(o) {
    o.w = o.w || 110; const h = o.h || 18;   // ≤ 18: zeminde yürürken engel olmaz, üstüne çıkınca kendiliğinden zıplatır (kenar affı)
    o.ust = o.y; o.y = o.ust + h;
    o.cisim = { w: o.gom ? o.w : o.w - 8, h, tip: 'ziplat', guc: o.guc || 960, aktif: true, dx: 0, dy: 0 };
    o.e = 0; o.ev = 0; o.wob = 0; o.wobT = 0; o.ph = (o.x * 0.013) % 6.28; o.seed = 3 + Math.floor(o.x / 17) % 40; o.parla = 0; o.pT = Math.random() * 2;
    o.pr = []; for (let i = 0; i < 5; i++) o.pr.push({ x: 0, y: 0, t: -1 - i * 0.5, h: 0 });
    o.buhar = []; o.halkalar = [];
    o.puffRings = []; o.ruzgar = []; o.hamurPuf = [];
    o.ayakDep = 0; o.ayakDepV = 0; o.ayakX = o.x;
  },
  ustune(o, vy) {
    const v = clamp((vy || 400) / 900, 0.3, 1);
    o.ev = Math.min(o.ev, 0) - (8.2 + 5.8 * v); o.parla = 1; o.wob = 1; o.wobT = 0;
    buSfx('bulutZip', v); OLAY.emit('bulutZip', o);
    const cx = o.x + (P.x - o.x) * 0.45;
    burst(cx, o.ust - 2, 14, BU_R_ZIP, 130, 0.85, 7);
    // Pofuduk hamur buharı: basılınca iki yana doğru tatlı pamuk bulutçuğu kabarır
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        o.buhar.push({
          x: cx + s * (10 + i * 12), y: o.ust - 2 + (Math.random() - 0.5) * 4,
          vx: s * (55 + Math.random() * 75 + i * 20), vy: -20 - Math.random() * 40,
          r: 10 + Math.random() * 8, t: 0, max: 0.7 + Math.random() * 0.35,
          col: i % 2 ? '#fff3f8' : '#ffffff'
        });
      }
    }
    // Pamuk şekeri gibi kabararak dağılan minik puf bulutçuğu halkaları (puffRings)
    for (let ri = 0; ri < 2; ri++) {
      const nPuffs = 9 + ri * 3, puffs = [];
      for (let pi = 0; pi < nPuffs; pi++) {
        const an = (pi / nPuffs) * BU_PI2 + (Math.random() - 0.5) * 0.25;
        puffs.push({
          an,
          r0: 8 + Math.random() * 6,
          col: pi % 2 === 0 ? '#ffffff' : (pi % 4 === 1 ? '#ffe8f4' : '#ffd4ea'),
          wob: Math.random() * BU_PI2,
          vy: -14 - Math.random() * 22
        });
      }
      o.puffRings.push({
        cx, cy: o.ust + 4,
        r: 12 + ri * 8,
        maxR: (o.w * (0.54 + ri * 0.18)) * (0.8 + 0.35 * v),
        t: -ri * 0.05,
        max: 0.65 + ri * 0.16,
        rot: Math.random() * BU_PI2,
        rotV: (ri % 2 === 0 ? 1 : -1) * (0.7 + Math.random() * 0.6),
        puffs
      });
    }
    o.halkalar.push({ r: 10, maxR: o.w * 0.62, t: 0, max: 0.55 });
    // Feza havaya fırlatıldığında arkasından göğe savrulan tatlı rüzgâr çizgileri
    const nRuz = 9 + Math.round(v * 6);
    for (let i = 0; i < nRuz; i++) {
      const rx = cx + (Math.random() - 0.5) * (o.w * 0.44);
      o.ruzgar.push({
        x: rx, y: o.ust - 4,
        vx: (Math.random() - 0.5) * 30 + (rx - cx) * 0.6,
        vy: -580 - Math.random() * 420 - v * 300,
        l: 40 + Math.random() * 56,
        w: 2.0 + Math.random() * 1.5,
        t: 0, max: 0.5 + Math.random() * 0.32,
        col: ['#ffffff', '#fff4fa', '#ffdcf2', '#e4f7ff'][i % 4],
        curv: (Math.random() - 0.5) * 16
      });
    }
  },
  guncelle(o, dt) {
    // hamur yay fiziği (squash & stretch): hacim korumalı yarı-örtük Euler yaylanması
    let kalan = Math.min(dt, 0.1);
    while (kalan > 1e-4) { const d = Math.min(kalan, 1 / 120); o.ev += (-240 * o.e - 7.5 * o.ev) * d; o.e += o.ev * d; kalan -= d; }
    o.e = clamp(o.e, -0.56, 0.5); o.parla = Math.max(0, o.parla - dt * 1.5);
    o.wobT += dt; o.wob = Math.max(0, o.wob - dt * 2.5);
    // Bulut üzerinde yürürken ayak basılan yerde yumuşak hamur çökmesi ve geri yaylanması
    const ustte = (P.ground && Math.abs(P.x - o.x) < o.w * 0.52 && Math.abs(P.y - o.ust) < 18);
    if (ustte) {
      o.ayakX = lerp(o.ayakX || o.x, P.x, 1 - Math.exp(-dt * 15));
      const yuruyor = Math.abs(P.vx || 0) > 18;
      const hedefDep = 5.5 + (yuruyor ? 3.2 : 0);
      o.ayakDepV = (o.ayakDepV || 0) + (-220 * ((o.ayakDep || 0) - hedefDep) - 13 * (o.ayakDepV || 0)) * dt;
      o.ayakDep = (o.ayakDep || 0) + o.ayakDepV * dt;
      if (yuruyor && Math.random() < dt * 14 && o.hamurPuf.length < 16) {
        o.hamurPuf.push({
          x: P.x + (Math.random() - 0.5) * 8, y: o.ust + o.ayakDep - 2,
          vx: -P.f * (16 + Math.random() * 24), vy: -14 - Math.random() * 18,
          r: 4.2 + Math.random() * 3.4, t: 0, max: 0.44 + Math.random() * 0.22,
          col: Math.random() < 0.5 ? '#ffffff' : '#ffdced'
        });
      }
    } else {
      // geri yaylanma (elastic overshoot rebound)
      o.ayakDepV = (o.ayakDepV || 0) + (-250 * (o.ayakDep || 0) - 10 * (o.ayakDepV || 0)) * dt;
      o.ayakDep = (o.ayakDep || 0) + o.ayakDepV * dt;
    }
    for (let i = o.hamurPuf.length - 1; i >= 0; i--) {
      const hp = o.hamurPuf[i]; hp.t += dt;
      if (hp.t >= hp.max) { o.hamurPuf.splice(i, 1); continue; }
      hp.x += hp.vx * dt; hp.y += hp.vy * dt; hp.r += dt * 5;
      hp.vx *= Math.exp(-dt * 3); hp.vy = hp.vy * Math.exp(-dt * 2) - 8 * dt;
    }
    if (!buEkranda(o.x, 300)) return;
    for (const p of o.pr) {   // yukarı süzülen minik göksel pırıltılar ("buradan yukarı!")
      p.t += dt;
      if (p.t > 1.4) { p.t = -Math.random() * 0.8; p.x = (Math.random() - 0.5) * o.w * 0.75; p.h = 42 + Math.random() * 45; }
    }
    // bulut buharı parçacıkları
    for (let i = o.buhar.length - 1; i >= 0; i--) {
      const b = o.buhar[i]; b.t += dt;
      if (b.t >= b.max) { o.buhar.splice(i, 1); continue; }
      b.vx *= Math.exp(-dt * 3.8); b.vy = b.vy * Math.exp(-dt * 2.8) - 18 * dt;   // hafif yukarı süzülüş
      b.x += b.vx * dt; b.y += b.vy * dt; b.r += dt * 12;
    }
    // pamuk şekeri puf halkaları (puffRings)
    for (let i = o.puffRings.length - 1; i >= 0; i--) {
      const pr = o.puffRings[i]; pr.t += dt;
      if (pr.t < 0) continue;
      if (pr.t >= pr.max) { o.puffRings.splice(i, 1); continue; }
      pr.r += (pr.maxR - pr.r) * (1 - Math.exp(-dt * 8));
      pr.rot += pr.rotV * dt;
    }
    // rüzgar çizgileri güncellemesi
    for (let i = o.ruzgar.length - 1; i >= 0; i--) {
      const rz = o.ruzgar[i]; rz.t += dt;
      if (rz.t >= rz.max) { o.ruzgar.splice(i, 1); continue; }
      rz.x += rz.vx * dt; rz.y += rz.vy * dt;
      rz.vy *= Math.exp(-dt * 2.2);
    }
    for (let i = o.halkalar.length - 1; i >= 0; i--) {
      const h = o.halkalar[i]; h.t += dt;
      if (h.t >= h.max) { o.halkalar.splice(i, 1); continue; }
      h.r += (h.maxR - h.r) * (1 - Math.exp(-dt * 9));
    }
  },
  ciz(o, tm) {
    const w = o.w, nefes = Math.sin(tm * 2.2 + o.ph) * 0.02, e = o.e;
    const jiggle = Math.sin(o.wobT * 18) * o.wob * 0.055;
    // Hacim koruyan esneme: basılınca yana doğru tatlı hamur gibi genişler (squash), fırlatırken uzar (stretch)
    const sy = clamp(1 + e * 0.85 + nefes + jiggle, 0.44, 1.52);
    const sx = clamp((1 / Math.sqrt(Math.max(0.28, sy))) - nefes * 0.25 - jiggle * 0.4, 0.65, 1.48);
    g.globalCompositeOperation = 'lighter';
    dglow('#ffb8d8', o.x, o.ust + 14, w * 0.88, 0.22 + 0.28 * o.parla);
    g.globalCompositeOperation = 'source-over';
    const sp = buBulut(w, o.cisim.h, 'zip', o.seed);
    buBulutCiz(sp, o.x, o.ust, w, sx, sy);
    const yu = o.ust + 18 - 18 * sy;
    // Bulut üzerinde yürürken ayak basılan yerdeki yumuşak hamur çökmesi ve yaylanma oluğu
    if (Math.abs(o.ayakDep || 0) > 0.35) {
      const fx = o.ayakX || o.x, dep = (o.ayakDep || 0) * sy, dentW = 28 * sx;
      g.save();
      g.strokeStyle = 'rgba(215, 115, 160, ' + clamp(Math.abs(dep) * 0.08, 0, 0.42).toFixed(3) + ')';
      g.lineWidth = 2.4 * sx; g.lineCap = 'round';
      g.beginPath(); g.moveTo(fx - dentW, yu + 1);
      g.quadraticCurveTo(fx, yu + 1 + dep, fx + dentW, yu + 1);
      g.stroke();
      g.strokeStyle = 'rgba(255, 255, 255, ' + clamp(Math.abs(dep) * 0.12, 0, 0.65).toFixed(3) + ')';
      g.lineWidth = 1.3 * sx;
      g.beginPath(); g.moveTo(fx - dentW * 0.78, yu - 0.5);
      g.quadraticCurveTo(fx, yu - 0.5 + dep * 0.62, fx + dentW * 0.78, yu - 0.5);
      g.stroke();
      g.restore();
    }
    // yanaklarda pembe yay izi: esneyip sıkışan tatlı yanak gamzeleri
    g.strokeStyle = 'rgba(232,120,170,0.48)'; g.lineWidth = 2.2; g.lineCap = 'round';
    for (const s of [-1, 1]) {
      const cx = o.x + s * w * 0.22 * sx;
      g.beginPath(); g.moveTo(cx - 7 * sx, yu + 12);
      g.quadraticCurveTo(cx, yu + 8 - e * 8, cx + 7 * sx, yu + 12); g.stroke();
    }
    // bulut buharı: pofuduk beyaz-pembe buhar yumakları
    if (o.buhar.length) {
      for (const b of o.buhar) {
        const u = b.t / b.max, al = (1 - u) * Math.min(1, b.t * 8) * 0.65;
        if (al < 0.01) continue;
        g.globalAlpha = al; g.fillStyle = b.col;
        g.beginPath();
        g.arc(b.x - b.r * 0.28, b.y, b.r * 0.65, 0, BU_PI2);
        g.arc(b.x + b.r * 0.28, b.y, b.r * 0.65, 0, BU_PI2);
        g.arc(b.x, b.y - b.r * 0.22, b.r * 0.8, 0, BU_PI2);
        g.fill();
      }
      g.globalAlpha = 1;
    }
    // pamuk şekeri puf halkaları (puffRings)
    if (o.puffRings.length) {
      for (const pr of o.puffRings) {
        if (pr.t <= 0) continue;
        const u = pr.t / pr.max, al = (1 - u) * Math.min(1, pr.t * 8) * 0.8;
        if (al < 0.01) continue;
        const rx = pr.r * sx, ry = pr.r * 0.28 * sy;
        for (const pf of pr.puffs) {
          const an = pf.an + pr.rot;
          const px = pr.cx + Math.cos(an) * rx;
          const py = pr.cy + Math.sin(an) * ry + pf.vy * u;
          const rNow = (pf.r0 + u * 13) * (0.8 + 0.2 * Math.sin(u * 5 + pf.wob));
          g.globalAlpha = al * 0.88; g.fillStyle = pf.col;
          g.beginPath();
          g.arc(px, py, rNow * 0.7, 0, BU_PI2);
          g.arc(px - rNow * 0.35, py + rNow * 0.1, rNow * 0.55, 0, BU_PI2);
          g.arc(px + rNow * 0.35, py + rNow * 0.1, rNow * 0.55, 0, BU_PI2);
          g.fill();
        }
      }
      g.globalAlpha = 1;
    }
    // ayak basma puf tozları
    if (o.hamurPuf.length) {
      for (const hp of o.hamurPuf) {
        const u = hp.t / hp.max, al = (1 - u) * Math.min(1, hp.t * 9) * 0.7;
        if (al < 0.01) continue;
        g.globalAlpha = al; g.fillStyle = hp.col;
        g.beginPath(); g.arc(hp.x, hp.y, hp.r, 0, BU_PI2); g.arc(hp.x + hp.r * 0.3, hp.y - hp.r * 0.2, hp.r * 0.7, 0, BU_PI2); g.fill();
      }
      g.globalAlpha = 1;
    }
    // esneme halkaları ve göksel ışıltılar
    g.globalCompositeOperation = 'lighter';
    for (const h of o.halkalar) {
      const u = h.t / h.max, al = (1 - u) * 0.6;
      if (al < 0.01) continue;
      g.globalAlpha = al; g.strokeStyle = '#ffd6ea'; g.lineWidth = 2.8 * (1 - u) + 0.6;
      g.beginPath(); g.ellipse(o.x, o.ust + 14, h.r * sx, h.r * 0.25 * sy, 0, 0, BU_PI2); g.stroke();
    }
    // Feza havaya fırlatıldığında rüzgâr çizgileri
    if (o.ruzgar && o.ruzgar.length) {
      g.save(); g.lineCap = 'round';
      for (const rz of o.ruzgar) {
        const u = rz.t / rz.max, al = (1 - u) * Math.min(1, rz.t * 12) * 0.78;
        if (al < 0.01) continue;
        g.globalAlpha = al; g.strokeStyle = rz.col; g.lineWidth = rz.w * (1 - u * 0.45);
        g.beginPath(); g.moveTo(rz.x, rz.y);
        const midY = rz.y + rz.l * 0.5, endY = rz.y + rz.l;
        g.quadraticCurveTo(rz.x + rz.curv, midY, rz.x, endY);
        g.stroke();
      }
      g.restore();
    }
    g.globalAlpha = 1;
    for (const p of o.pr) if (p.t > 0) {
      const u = p.t / 1.4;
      buPirilti(o.x + p.x + Math.sin(u * 6 + p.h) * 4, yu - 4 - u * p.h, 2.6 + 2 * Math.sin(u * Math.PI), Math.sin(u * Math.PI) * 0.8, u * 2);
    }
    if (o.parla > 0.02) {
      const u = 1 - o.parla; g.globalAlpha = 0.65 * o.parla; g.strokeStyle = '#ffd6ea'; g.lineWidth = 2.4;
      g.beginPath(); g.ellipse(o.x, yu + 6, w * (0.4 + 0.5 * u), 6 + 10 * u, 0, 0, BU_PI2); g.stroke(); g.globalAlpha = 1;
    }
    g.globalCompositeOperation = 'source-over';
  },
});

// ───────────────────────── bulutYuzen: yavaş giden bulut platform ─────────────────────────
TUR.kaydet('bulutYuzen', {
  kur(o) {
    o.w = o.w || 150; const h = 4;
    o.x0 = o.x; o.y0 = o.y; o.ax = o.ax || 0; o.ay = o.ay || 0; o.sure = o.sure || 5; o.t = (o.faz || 0) * o.sure;
    o.y = o.y0 + h; o.cisim = { w: o.w - 12, h, tip: 'ustten', aktif: true, dx: 0, dy: 0 };
    o.seed = 5 + Math.floor(o.x / 23) % 40; o.sz = 0; o.szE = 0; o.szV = 0; o.on = false; o.yon = 0; o.ph = (o.x * 0.011) % 6.28;
    o.ayakDep = 0; o.ayakDepV = 0; o.ayakX = o.x; o.hamurPuf = [];
  },
  guncelle(o, dt) {
    o.t += dt;
    const p = (o.t / o.sure) % 1, tri = p < 0.5 ? p * 2 : 2 - p * 2;
    const u = o.gorunum === 'tuy' ? 0.5 - 0.5 * Math.cos(p * BU_PI2) : smooth(clamp((tri - 0.14) / 0.72, 0, 1));   // tüy: durmadan yumuşak salınım
    const nx_ = o.x0 + o.ax * u, ny = o.y0 - o.ay * u + 4;
    o.cisim.dx = nx_ - o.x; o.cisim.dy = ny - o.y; o.x = nx_; o.y = ny;
    o.yon = lerp(o.yon, dt > 0 ? clamp((o.cisim.dx + o.cisim.dy) / Math.max(dt, 1e-3) / 60, -1, 1) : 0, 1 - Math.exp(-dt * 6));
    const st = buUst(o);
    if (st && !o.on) {
      burst(P.x, o.y - 6, 8, ['#fff1dc', '#ffffff', '#ffd8ea'], 70, 0.75, 5);
      o.szV = 3.6;
    }
    o.on = st;
    // yumuşak hamur yaylanması (Feza üstüne basınca tatlıca esner ve geri yaylanır)
    o.szV += (-190 * o.szE - 9 * o.szV) * dt; o.szE += o.szV * dt;
    o.sz = clamp((st ? 3.5 : 0) + o.szE, -2.5, 7);
    // Yürürken ayak basılan yerin yerel hamur çöküşü
    if (st) {
      o.ayakX = lerp(o.ayakX || o.x, P.x, 1 - Math.exp(-dt * 14));
      const yuruyor = Math.abs(P.vx || 0) > 18;
      const hedefDep = 4.2 + (yuruyor ? 2.5 : 0);
      o.ayakDepV += (-210 * (o.ayakDep - hedefDep) - 13 * o.ayakDepV) * dt;
      o.ayakDep += o.ayakDepV * dt;
      if (yuruyor && Math.random() < dt * 12 && o.hamurPuf.length < 12) {
        o.hamurPuf.push({
          x: P.x + (Math.random() - 0.5) * 6, y: o.y - 4 + o.ayakDep,
          vx: -P.f * (14 + Math.random() * 20), vy: -12 - Math.random() * 14,
          r: 3.8 + Math.random() * 2.8, t: 0, max: 0.4 + Math.random() * 0.2,
          col: Math.random() < 0.5 ? '#ffffff' : '#ffe9d6'
        });
      }
    } else {
      o.ayakDepV += (-230 * o.ayakDep - 11 * o.ayakDepV) * dt;
      o.ayakDep += o.ayakDepV * dt;
    }
    for (let i = o.hamurPuf.length - 1; i >= 0; i--) {
      const hp = o.hamurPuf[i]; hp.t += dt;
      if (hp.t >= hp.max) { o.hamurPuf.splice(i, 1); continue; }
      hp.x += hp.vx * dt; hp.y += hp.vy * dt; hp.r += dt * 4;
      hp.vx *= Math.exp(-dt * 3); hp.vy = hp.vy * Math.exp(-dt * 2) - 8 * dt;
    }
  },
  ciz(o, tm) {
    const w = o.w, ust = o.y - 4 + o.sz * 0.6;
    if (o.gorunum === 'tuy') { buDevTuy(o, ust + Math.sin(tm * 1.8 + (o.faz || 0) * 6.28) * 3 + o.sz * 1.5, tm); return; }   // görsel salınım + basınca esneme
    g.globalCompositeOperation = 'lighter';
    dglow('#ffd2a0', o.x, ust + 16, w * 0.72, 0.22);
    g.globalCompositeOperation = 'source-over';
    // hareket izi: arkada üç ince bulut tülü
    const yon = o.yon;
    if (Math.abs(yon) > 0.05) {
      g.strokeStyle = 'rgba(255,240,226,' + (0.5 * Math.abs(yon)).toFixed(3) + ')'; g.lineWidth = 2.2; g.lineCap = 'round';
      for (let i = 0; i < 3; i++) { const yy = ust + 6 + i * 7, x0 = o.x - Math.sign(yon) * (w * 0.5 + 4 + i * 6), l = 22 + i * 8; g.beginPath(); g.moveTo(x0, yy); g.quadraticCurveTo(x0 - Math.sign(yon) * l * 0.5, yy - 3 + Math.sin(tm * 3 + i) * 2, x0 - Math.sign(yon) * l, yy + 1); g.stroke(); }
    }
    if (typeof dn3Bulut === 'function') dn3Bulut(o.x, ust, w, 20, { seed: o.seed });   // zeminin ince bulutlarıyla aynı görünüm (basılır olduğu belli)
    else buBulutCiz(buBulut(w, 22, 'yuzen', o.seed), o.x, ust, w, 1, 1);
    // Yürürken ayak basılan yerin yerel hamur çökme çukuru
    if (Math.abs(o.ayakDep || 0) > 0.3) {
      const fx = o.ayakX || o.x, dep = o.ayakDep, dentW = 22;
      g.save();
      g.strokeStyle = 'rgba(220, 160, 140, ' + clamp(Math.abs(dep) * 0.08, 0, 0.4).toFixed(3) + ')';
      g.lineWidth = 2.2; g.lineCap = 'round';
      g.beginPath(); g.moveTo(fx - dentW, ust + 1);
      g.quadraticCurveTo(fx, ust + 1 + dep, fx + dentW, ust + 1);
      g.stroke();
      g.strokeStyle = 'rgba(255, 255, 255, ' + clamp(Math.abs(dep) * 0.12, 0, 0.6).toFixed(3) + ')';
      g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(fx - dentW * 0.75, ust - 0.4);
      g.quadraticCurveTo(fx, ust - 0.4 + dep * 0.6, fx + dentW * 0.75, ust - 0.4);
      g.stroke();
      g.restore();
    }
    // ayak basma puf tozları
    if (o.hamurPuf && o.hamurPuf.length) {
      for (const hp of o.hamurPuf) {
        const u = hp.t / hp.max, al = (1 - u) * Math.min(1, hp.t * 9) * 0.65;
        if (al < 0.01) continue;
        g.globalAlpha = al; g.fillStyle = hp.col;
        g.beginPath(); g.arc(hp.x, hp.y, hp.r, 0, BU_PI2); g.arc(hp.x + hp.r * 0.3, hp.y - hp.r * 0.2, hp.r * 0.65, 0, BU_PI2); g.fill();
      }
      g.globalAlpha = 1;
    }
  },
});

// Tüy Köprüsü'nün dev tüyü (bulutYuzen gorunum:'tuy'): üstü düz yürüme yüzeyi; sap üstte, yumuşak yelpaze altta, rüzgârda uç kıpırtısı
const BU_TUY_P = [['#fff4f8', '#ffc9de', '#e79ac0'], ['#f8f2ff', '#dccbff', '#a990e0'], ['#fff8ec', '#ffdcb4', '#e6a87c']];
function buDevTuy(o, ust, tm) {
  const w = o.w, c = BU_TUY_P[(o.renk || 0) % 3], x0 = o.x - w / 2, x1 = o.x + w / 2, sal = Math.sin(tm * 2.1 + o.ph), egim = sal * 0.03;
  g.globalCompositeOperation = 'lighter'; dglow(c[1], o.x, ust + 10, w * 0.6, 0.18); g.globalCompositeOperation = 'source-over';
  g.save(); g.translate(o.x, ust); g.rotate(egim); g.translate(-o.x, -ust);
  // alt yelpaze (yumuşak, dalgalı kenar)
  const gr = g.createLinearGradient(0, ust - 4, 0, ust + 26); gr.addColorStop(0, c[0]); gr.addColorStop(0.6, c[1]); gr.addColorStop(1, c[2]);
  g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - 6, ust + 1);
  const n = 7;
  for (let i = 0; i <= n; i++) { const u = i / n, xx = x0 + u * w, d = 10 + 12 * Math.sin(u * Math.PI) + Math.sin(tm * 3 + i * 1.3 + o.ph) * 1.5; g.quadraticCurveTo(xx - w / n * 0.5, ust + d + 5, xx, ust + d); }
  g.quadraticCurveTo(x1 + 10, ust + 6, x1 + 14 + sal * 3, ust - 2);
  g.lineTo(x0 - 6, ust - 3); g.closePath(); g.fill();
  // üst yelpaze (ince, yürüme yüzeyinin hemen üstünde)
  g.fillStyle = c[0]; g.beginPath(); g.moveTo(x0, ust); g.quadraticCurveTo(o.x, ust - 9, x1 + 12, ust - 3); g.lineTo(x1 + 12, ust); g.closePath(); g.fill();
  // yelpaze çizgileri
  g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.1;
  for (let i = 1; i < 9; i++) { const xx = x0 + i * w / 9; g.beginPath(); g.moveTo(xx, ust); g.quadraticCurveTo(xx - 6, ust + 9, xx - 14, ust + 6 + 12 * Math.sin(i / 9 * Math.PI)); g.stroke(); }
  // sap
  g.strokeStyle = c[2]; g.lineWidth = 2.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x0 - 18, ust + 6); g.quadraticCurveTo(x0, ust - 1, o.x, ust - 1); g.lineTo(x1 + 14 + sal * 3, ust - 2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, ust - 2); g.lineTo(x1, ust - 2.5); g.stroke();
  g.restore();
}

// ───────────────────────── bulutKus: uykucu bulut kuşu (Feza sırtına basınca uyanır, karşıya uçar, Feza inince geri döner) ─────────────────────────
// {w, ax (karşıya mesafe), ay (yay yüksekliği), sure (tek yön sn)}; y = sırtın (yürüme yüzeyi) başlangıç y'si. Durum: uyku → git → karsi → don → uyku.
// OLAY 'bulutKus' (o) uyanıp kalkarken.
TUR.kaydet('bulutKus', {
  kur(o) {
    o.w = o.w || 170; o.x0 = o.x; o.y0 = o.y; o.ax = o.ax || 400; o.ay = o.ay || 60; o.sure = o.sure || 5.5;
    o.y = o.y0 + 4; o.cisim = { w: o.w - 16, h: 4, tip: 'ustten', aktif: true, dx: 0, dy: 0 };
    o.durum = 'uyku'; o.t = 0; o.u = 0; o.bekle = 0; o.bos = 0; o.uyanik = 0; o.kanat = 0; o.sz = 0; o.on = false; o.seed = 17; o.yonK = 1;
  },
  guncelle(o, dt) {
    const st = buUst(o);
    if (o.durum === 'uyku') {
      if (st) { o.bekle += dt; if (o.bekle > 0.45) { o.durum = 'git'; o.t = 0; buSfx('bulutZip', 0.4); OLAY.emit('bulutKus', o); burst(o.x + o.w * 0.4, o.y - 30, 10, BU_R_ZIP, 90, 0.8, 5); } }
      else o.bekle = 0;
    } else if (o.durum === 'git' || o.durum === 'don') {
      o.t += dt; const v = clamp(o.t / o.sure, 0, 1), e = v * v * (3 - 2 * v);
      o.u = o.durum === 'git' ? e : 1 - e;
      if (v >= 1) { if (o.durum === 'git') { o.durum = 'karsi'; o.bos = 0; } else { o.durum = 'uyku'; o.bekle = 0; } }
    } else if (o.durum === 'karsi') {
      const geride = P.x < o.x0 + o.w * 0.5 && Math.abs(P.x - o.x0) < 500;   // Feza başlangıç kıyısında bekliyor: hemen dön
      if (st) o.bos = 0; else { o.bos += dt; if (o.bos > (geride ? 0.4 : 2.5)) { o.durum = 'don'; o.t = 0; } }
    }
    o.davet = o.durum === 'uyku' && !st && Math.abs(P.x - (o.x0 - o.w * 0.5)) < 320 && P.x < o.x0 + o.w * 0.5;
    const nx_ = o.x0 + o.ax * o.u, ny = o.y0 - o.ay * Math.sin(Math.PI * o.u) + 4;
    o.cisim.dx = nx_ - o.x; o.cisim.dy = ny - o.y; o.x = nx_; o.y = ny;
    const ucuyor = o.durum === 'git' || o.durum === 'don';
    o.uyanik = lerp(o.uyanik, o.durum === 'uyku' && !st && !o.davet ? 0 : 1, 1 - Math.exp(-dt * 4));
    o.kanat += dt * (ucuyor ? 5.5 : 1.2);
    o.gel = lerp(o.gel || 0, o.davet ? 1 : 0, 1 - Math.exp(-dt * 5));
    if (o.durum === 'don') o.yonK = -1; else if (o.durum !== 'karsi') o.yonK = 1;
    if (st && !o.on) burst(P.x, o.y - 6, 6, ['#ffffff', '#ffe6f0'], 60, 0.7, 5);
    o.on = st; o.sz = lerp(o.sz, st ? 3 : 0, 1 - Math.exp(-dt * 9));
    if (ucuyor && buEkranda(o.x, 100) && Math.random() < dt * 12) parca(o.x - o.yonK * o.w * 0.5, o.y + 10, -o.yonK * 40, 10, 0.8, '#ffffff', 6 + Math.random() * 4);
  },
  ciz(o, tm) {
    const w = o.w, ust = o.y - 4 + o.sz * 0.5, f = o.yonK, ua = o.uyanik, nefes = Math.sin(tm * (ua > 0.5 ? 3 : 1.4)) * (ua > 0.5 ? 1 : 2);
    const kan = Math.sin(o.kanat) * (ua > 0.5 ? 1 : 0.15) * (1 - (o.gel || 0));
    const gelK = (o.gel || 0) * (0.55 + 0.45 * Math.sin(tm * 6));   // "gel" el sallaması: ön kanat Feza'ya doğru kalkıp iner
    g.globalCompositeOperation = 'lighter'; dglow('#ffe2ee', o.x, ust + 18, w * 0.7, 0.2); g.globalCompositeOperation = 'source-over';
    g.save(); g.translate(o.x, ust); g.scale(f, 1);
    buKusKanat(-w * 0.05, 8, w * 0.32, -0.5 - kan * 0.6, 0.85);   // arka kanat
    g.fillStyle = '#f4e8ff';                                      // kuyruk tutamı
    g.beginPath(); g.ellipse(-w * 0.52, 2, 18, 9, -0.4 + Math.sin(tm * 2) * 0.1, 0, BU_PI2); g.fill();
    g.beginPath(); g.ellipse(-w * 0.55, 10, 15, 7, 0.2, 0, BU_PI2); g.fill();
    g.restore();
    buBulutCiz(buBulut(w, 26, 'kopru', o.seed), o.x, ust, w, 1, 1 + nefes * 0.012);   // gövde: kabarık bulut (sırtı yürüme yüzeyi)
    g.save(); g.translate(o.x, ust); g.scale(f, 1);
    const bx = w * 0.46, by = -10 + nefes * 0.5;                 // baş (önde, biraz yukarıda)
    const hg = g.createRadialGradient(bx - 6, by - 8, 2, bx, by, 26); hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.7, '#f3e6ff'); hg.addColorStop(1, '#d9c4f2');
    g.fillStyle = hg; g.beginPath(); g.arc(bx, by, 24, 0, BU_PI2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(bx - 4, by - 22, 7, 0, BU_PI2); g.arc(bx + 5, by - 24, 6, 0, BU_PI2); g.fill();   // tepe tüyü
    g.fillStyle = '#ffb870'; g.beginPath(); g.moveTo(bx + 20, by - 1); g.quadraticCurveTo(bx + 34, by + 2, bx + 21, by + 7); g.closePath(); g.fill();   // gaga
    g.fillStyle = 'rgba(255,150,190,0.45)'; g.beginPath(); g.ellipse(bx + 6, by + 8, 6, 3.5, 0, 0, BU_PI2); g.fill();   // yanak
    g.strokeStyle = '#6a4a7a'; g.fillStyle = '#4a3458'; g.lineWidth = 2; g.lineCap = 'round';
    if (ua < 0.5) { g.beginPath(); g.arc(bx + 8, by - 3, 4.5, 0.2, Math.PI - 0.2); g.stroke(); }   // uyurken kapalı göz
    else { const kirp = (tm % 3.2) < 0.12 ? 0.2 : 1; g.beginPath(); g.ellipse(bx + 8, by - 3, 3.6, 4.4 * kirp, 0, 0, BU_PI2); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(bx + 9.2, by - 4.6, 1.3, 0, BU_PI2); g.fill(); }
    buKusKanat(w * 0.08, 12, w * 0.3, -0.35 - kan * 0.8 - gelK * 1.3, 1);     // ön kanat (davette arkaya, Feza'ya doğru sallanır)
    g.restore();
    if ((o.gel || 0) > 0.05) {   // davet: sırtında yumuşak parıltı ("buraya bas")
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) { const u = (tm * 0.8 + i / 3) % 1; buPirilti(o.x - f * w * 0.15 + (i - 1) * 34, ust - 8 - u * 26, 3 + 2 * Math.sin(u * Math.PI), Math.sin(u * Math.PI) * 0.8 * o.gel, tm + i); }
      g.globalCompositeOperation = 'source-over';
    }
    if (ua < 0.5) {   // uykuda: süzülen minik kabarcıklar (yazı yok)
      for (let i = 0; i < 3; i++) { const u = ((tm * 0.45 + i / 3) % 1), zx = o.x + f * (w * 0.5 + 10 + u * 26), zy = ust - 34 - u * 50; g.globalAlpha = Math.max(0, Math.sin(u * Math.PI) * 0.7 * (1 - ua * 2)); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(zx, zy, 3 + u * 5, 0, BU_PI2); g.fill(); g.strokeStyle = '#e2cff5'; g.lineWidth = 1; g.stroke(); }
      g.globalAlpha = 1;
    }
  },
});
function buKusKanat(x, y, L, aci, a) {   // bulut ponponlarından kanat (orijin = kanat kökü), aci < 0 yukarı
  g.save(); g.translate(x, y); g.rotate(aci); g.globalAlpha = a;
  for (let i = 0; i < 4; i++) { const u = i / 3, r = 13 - i * 2; g.fillStyle = i % 2 ? '#f6eeff' : '#ffffff'; g.beginPath(); g.arc(-u * L * 0.9, -u * 6, r, 0, BU_PI2); g.fill(); }
  g.strokeStyle = 'rgba(190,160,220,0.5)'; g.lineWidth = 1.2; g.beginPath(); g.arc(-L * 0.9, -6, 7, 0.5, 3.6); g.stroke();
  g.globalAlpha = 1; g.restore();
}

// ───────────────────────── esinti: yukarı taşıyan yumuşak hava akımı ─────────────────────────
function buEsintiSprite(w, h) {
  const key = 'es' + w + '_' + h; if (buSp[key]) return buSp[key];
  const k = 1, c = buCan(w * 2 * k, h * k), x = c.getContext('2d');
  const gy = x.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, 'rgba(196,244,236,0)'); gy.addColorStop(0.3, 'rgba(196,244,236,0.5)'); gy.addColorStop(0.85, 'rgba(214,250,244,0.75)'); gy.addColorStop(1, 'rgba(214,250,244,0.15)');
  x.fillStyle = gy; x.fillRect(0, 0, c.width, h);
  x.globalCompositeOperation = 'destination-in';   // yanlara doğru yumuşak sönüm
  const gx = x.createLinearGradient(0, 0, c.width, 0);
  gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(0.3, 'rgba(0,0,0,0.7)'); gx.addColorStop(0.5, 'rgba(0,0,0,1)'); gx.addColorStop(0.7, 'rgba(0,0,0,0.7)'); gx.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = gx; x.fillRect(0, 0, c.width, h);
  return buSp[key] = c;
}
const BU_TUY_R = ['#ffffff', '#ffe6f0', '#fff3d6', '#e8f6ff'];
TUR.kaydet('esinti', {
  kur(o) {
    o.w = o.w || 90; o.h = o.h || 240; o.ic = false; o.sesT = -9; o.guc = 0; o.ph = (o.x * 0.017) % 6.28;
    const rs = rng(Math.floor(o.x) + 77);
    o.tz = []; for (let i = 0; i < 11; i++) o.tz.push({ x: rs() - 0.5, y: rs(), v: 40 + rs() * 50, r: 0.6 + rs() * 0.6, ph: rs() * 6.28, tip: i % 3, c: BU_TUY_R[i % 4] });
    o.cz = []; for (let i = 0; i < 6; i++) o.cz.push({ x: rs() - 0.5, y: rs(), v: 90 + rs() * 60, l: 30 + rs() * 40, ph: rs() * 6.28 });
  },
  guncelle(o, dt) {
    if (buEkranda(o.x, 200)) {
      const hh = o.h + 40;
      for (const p of o.tz) { p.y += dt * p.v * (1 + o.guc * 0.6) / hh; if (p.y > 1) { p.y -= 1; p.x = Math.random() - 0.5; } }
      for (const p of o.cz) { p.y += dt * p.v * (1 + o.guc) / hh; if (p.y > 1) { p.y -= 1; p.x = Math.random() - 0.5; } }
    }
    o.guc = Math.max(0, o.guc - dt * 1.5);
    if (DURUM !== 'oyun' || P.fade > 0 || P.ucus || (P.kilit > 0 && !o.ic)) { o.ic = false; return; }
    const top = o.y - o.h;
    const ic = Math.abs(P.x - o.x) < o.w / 2 + 4 && P.y > top - 40 && P.y < o.y + 24;
    if (ic) {
      const u = (o.y - P.y) / o.h, s = clamp((1.02 - u) / 0.3, 0, 1);
      if (s > 0) {
        const G = (typeof OM !== 'undefined' && OM.YERCEKIM) || 2200;
        let ge = G * (P.vy > 0 ? ((typeof OM !== 'undefined' && OM.DUSUS) || 1.25) : 1);
        if (Math.abs(P.vy) < 110) ge *= (typeof OM !== 'undefined' && OM.TEPE) || 0.6;
        P.vy -= ge * dt * s;                                           // yerçekimini karşıla
        P.vy += (-300 - P.vy) * (1 - Math.exp(-dt * 3.4)) * s;          // yumuşakça yukarı (en çok ≈300)
        if (P.vy < -330) P.vy = lerp(P.vy, -330, 1 - Math.exp(-dt * 6));   // zıplayarak girdiyse de sert fırlatma yok
        P.bounce = true; P.dj = true;
        if (P.ground && s > 0.5) { P.vy = Math.min(P.vy, -200); P.ground = false; }
        o.guc = Math.min(1, o.guc + dt * 4);
      }
      if (!o.ic && now - o.sesT > 1.2) { o.sesT = now; buSfx('esinti', 1); OLAY.emit('esinti', o); burst(P.x, P.y - 10, 8, BU_TUY_R, 80, 0.9, 5); }
    }
    o.ic = ic;
  },
  ciz(o, tm) {
    const w = o.w, h = o.h + 40, top = o.y - h, br = 0.75 + 0.25 * Math.sin(tm * 1.6 + o.ph) + o.guc * 0.4;
    g.globalAlpha = clamp(0.32 * br, 0, 0.6); g.drawImage(buEsintiSprite(w, h), o.x - w, top, w * 2, h); g.globalAlpha = 1;   // nane tonu: pembe gökte ayrı görünsün
    g.globalCompositeOperation = 'lighter'; dglow('#c8fff0', o.x, o.y - 6, w * 0.7, 0.16 * br); g.globalCompositeOperation = 'source-over';
    // yükselen rüzgâr çizgileri (yumuşak S kıvrımları)
    g.lineCap = 'round';
    for (const p of o.cz) {
      const yy = o.y - p.y * h, a = Math.sin(p.y * Math.PI) * (0.5 + o.guc * 0.3), xx = o.x + p.x * w * 0.8 + Math.sin(tm * 2 + p.ph) * 6;
      if (a < 0.03) continue;
      g.strokeStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(xx, yy); g.bezierCurveTo(xx + 8, yy - p.l * 0.33, xx - 8, yy - p.l * 0.66, xx, yy - p.l); g.stroke();
    }
    // tüyler, taç yaprakları ve pırıltılar süzülür
    for (const p of o.tz) {
      const yy = o.y - p.y * h, a = Math.sin(p.y * Math.PI), xx = o.x + p.x * w * 0.9 + Math.sin(tm * 1.7 + p.ph + p.y * 5) * 10;
      if (a < 0.04) continue;
      if (p.tip === 2) { g.globalCompositeOperation = 'lighter'; buPirilti(xx, yy, 3 * p.r + 1, a * 0.8, tm + p.ph); g.globalCompositeOperation = 'source-over'; continue; }
      g.save(); g.translate(xx, yy); g.rotate(Math.sin(tm * 2.3 + p.ph) * 0.9); g.globalAlpha = a * 0.9;
      if (p.tip === 0) buTuyCiz(9 * p.r + 4, p.c); else { g.fillStyle = '#ffc6dc'; g.beginPath(); g.ellipse(0, 0, 4.5 * p.r + 1.5, 2.4 * p.r + 1, 0.4, 0, BU_PI2); g.fill(); }
      g.restore(); g.globalAlpha = 1;
    }
    // dipte rüzgâr bulutu: kıvrılan küçük bir bulut ağzı
    const sp = buBulut(Math.round(w * 0.9), 14, 'ruzgar', 31);
    buBulutCiz(sp, o.x, o.y - 8, Math.round(w * 0.9), 1 + Math.sin(tm * 3 + o.ph) * 0.03, 1 + Math.sin(tm * 3 + o.ph + 1) * 0.05, 0.95);
    g.strokeStyle = 'rgba(160,190,220,0.5)'; g.lineWidth = 1.6;
    for (let i = 0; i < 2; i++) { const a0 = tm * 2.4 + i * Math.PI + o.ph; g.beginPath(); g.arc(o.x + (i ? 14 : -14), o.y - 2, 6, a0, a0 + 3.6); g.stroke(); }
  },
});
function buTuyCiz(L, col) {   // tüy: ince sap + yumuşak yelpaze (orijinde, yatay)
  g.fillStyle = col; g.beginPath(); g.moveTo(-L * 0.5, 0);
  g.quadraticCurveTo(-L * 0.1, -L * 0.34, L * 0.5, -L * 0.04); g.quadraticCurveTo(-L * 0.05, L * 0.3, -L * 0.5, 0); g.fill();
  g.strokeStyle = 'rgba(200,170,200,0.7)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-L * 0.62, 0.6); g.quadraticCurveTo(0, -L * 0.02, L * 0.5, -L * 0.04); g.stroke();
}

// ───────────────────────── gokkusagi: final tepesi ─────────────────────────
// Yay: merkez (cx, cy), dış yarıçap R (Feza dış kenarda kayar), 7 bant (kırmızı dışta → mor içte). Kuzucuklar yayın üstünde,
// yarıçap R+115'te, açı 125°→35° arasında renkI sırasıyla (soldan sağa) durur: o.yayX[i], o.yayY[i].
const BU_GK_EVRE = { bekle: 0, kuzu: 1, bant: 2, tam: 3, sicra: 4, kay: 5, son: 6 };
const BU_T = { kuzu: 2.4, bantAra: 0.42, bantSure: 0.9, sicra: 0.75, sonBekle: 1.3 };
function buKuzular() { const L = []; for (let i = 0; i < NESNELER.length; i++) if (NESNELER[i].tip === 'kuzu') L.push(NESNELER[i]); return L; }
function buKuzuTurVar() { const h = TUR.al('kuzu'); return !!(h && (typeof h.dokun === 'function' || typeof h.guncelle === 'function')); }
function buHepsiRenkli(o) {
  if (!o.kz) o.kz = buKuzular();
  if (!o.kz.length || !buKuzuTurVar()) return true;   // kuzu.js henüz yoksa final kilitlenmesin
  if (typeof SAYAC !== 'undefined' && SAYAC.kuzuTop > 0) return SAYAC.kuzu >= SAYAC.kuzuTop;
  for (const k of o.kz) if (!k.done) return false;
  return true;
}
function buYuzeyY(x) { const c = Math.floor(x / T); return (c < 0 || c >= COLS) ? ROWS * T : topOf(c) * T; }
function buYay(o, r, aci) { return { x: o.cx + Math.cos(aci) * r, y: o.cy - Math.sin(aci) * r }; }
TUR.kaydet('gokkusagi', {
  kur(o) {
    o.cx = o.cx || o.x; o.R = o.R || 600; o.cy = o.cy || (o.y - 86 + o.R); o.bant = o.bant || 15;
    o.tepeX0 = o.tepeX0 || o.x - 260; o.tepeX1 = o.tepeX1 || o.x + 260;
    o.evre = BU_GK_EVRE.bekle; o.t = 0; o.done = false; o.uyandi = false; o.basladi = false; o.bu = [0, 0, 0, 0, 0, 0, 0]; o.parla = 0; o.ghost = 0; o.bekleT = 0;
    o.yayX = []; o.yayY = []; o.yay = []; o.konumlar = o.yay;   // konumlar: kuzu.js'in okuduğu ad ({x,y}×7, renkI sırasıyla)
    // kuzucuklar yayın tepesine yakın, dar bir yayda (112°→68°, yarıçap R+90): final kamerasında büyük ve hep kadrajda kalsınlar
    for (let i = 0; i < 7; i++) { const a = (112 - i * (44 / 6)) * Math.PI / 180, p = buYay(o, o.R + 90, a); o.yayX.push(p.x); o.yayY.push(p.y); o.yay.push(p); }
    // gökkuşağını zeminin üstüyle sınırlayan kırpma yolu (dünya sabit: bir kez)
    const c0 = Math.max(0, Math.floor((o.cx - o.R - 60) / T)), c1 = Math.min(COLS - 1, Math.floor((o.cx + o.R + 60) / T));
    const p = new Path2D(); p.moveTo(c0 * T, -3000); p.lineTo((c1 + 1) * T, -3000);
    for (let c = c1; c >= c0; c--) { const y = topOf(c) * T + 2; p.lineTo((c + 1) * T, y); p.lineTo(c * T, y); }
    p.closePath(); o.kirp = p;
    o.ayak = [];   // yayın orta çizgisinin zeminden çıktığı / zemine değdiği iki nokta (ışık bulutları)
    for (const yon of [1, -1]) for (let i = 0; i <= 180; i++) { const a = yon > 0 ? Math.PI - i * Math.PI / 180 : i * Math.PI / 180, q = buYay(o, o.R - o.bant * 3.5, a); if (q.y < buYuzeyY(q.x) - 2) { o.ayak.push(q); break; } }
    o.grad = null; o.yildizlar = []; o.kayIz = [];
    o.rainbowSparks = []; o.tunelRings = []; o.tunelT = 0;
    for (let i = 0; i < 26; i++) o.yildizlar.push({ a: Math.PI * (0.08 + 0.84 * Math.random()), r: o.R - Math.random() * o.bant * 7, ph: Math.random() * 6.28 });
  },
  guncelle(o, dt) {
    o.parla = Math.max(0, o.parla - dt * 0.6);
    if (o.evre === BU_GK_EVRE.bekle) {
      const say = typeof SAYAC !== 'undefined' && SAYAC.kuzuTop > 0 ? SAYAC.kuzu / SAYAC.kuzuTop : 0;
      o.ghost = lerp(o.ghost, say, 1 - Math.exp(-dt * 2));
      if (DURUM !== 'oyun' || P.fade > 0 || P.ucus) return;
      const tepede = P.x > o.tepeX0 && P.x < o.tepeX1 && P.y <= o.y + 6;
      // geride kalmış (Büyük Boşluk'un öbür yanında) kuzucuk varsa: Feza tepedeyken onlar da uçup gelsin (5 yaş: geri dönülemez)
      if (P.x > o.tepeX0 - 30 * T && !buHepsiRenkli(o)) {
        o.bekleT += dt;
        if (o.bekleT > (tepede ? 1.5 : 6)) { o.bekleT = 0; buKuzuTopla(o); }
      } else o.bekleT = 0;
      if (tepede && P.ground && buHepsiRenkli(o)) buGkBasla(o);
      return;
    }
    if (o.evre >= BU_GK_EVRE.son && o.done) return;
    o.t += dt;
    if (o.evre < BU_GK_EVRE.son) { P.kilit = Math.max(P.kilit || 0, 0.6); }
    const t = o.t;
    // bantlar
    if (o.evre >= BU_GK_EVRE.kuzu) {
      for (let i = 0; i < 7; i++) {
        const t0 = BU_T.kuzu + i * BU_T.bantAra, u = clamp((t - t0) / BU_T.bantSure, 0, 1);
        if (u > 0 && o.bu[i] === 0) { buSfx('gokkusagiParca', i); OLAY.emit('gokkusagiParca', { o, renkI: i }); }
        o.bu[i] = u;
        if (u > 0 && u < 1 && Math.random() < dt * 20) { const a = Math.PI * (1 - u), r = o.R - o.bant * (i + 0.5), p = buYay(o, r, a); parca(p.x, p.y, (Math.random() - 0.5) * 60, -30 - Math.random() * 50, 1.1, BU_GK_ACIK[i], 5 + Math.random() * 4); }
      }
    }
    const tTam = BU_T.kuzu + 6 * BU_T.bantAra + BU_T.bantSure;
    if (o.evre < BU_GK_EVRE.tam && t >= tTam) {
      o.evre = BU_GK_EVRE.tam; o.parla = 1; buSfx('gokkusagiTamam', 1); OLAY.emit('gokkusagiParlak', o);
      for (let i = 0; i < 20; i++) { const a = Math.PI * Math.random(), p = buYay(o, o.R - o.bant * 3.5 + (Math.random() - 0.5) * 100, a); parca(p.x, p.y, (Math.random() - 0.5) * 80, -40 - Math.random() * 60, 1.6, BU_R_GK[i % 8], 6 + Math.random() * 6); }
    }
    const tSicra = tTam + 0.6;
    if (o.evre === BU_GK_EVRE.tam && t >= tSicra) {   // Feza yayın tepesine sıçrar
      o.evre = BU_GK_EVRE.sicra; o.s0x = P.x; o.s0y = P.y; o.ts = t; P.f = 1;
      OLAY.emit('ziplama', P);
    }
    if (o.evre === BU_GK_EVRE.sicra) {
      const u = clamp((t - o.ts) / BU_T.sicra, 0, 1), hx = o.cx, hy = o.cy - o.R;
      const x = lerp(o.s0x, hx, smooth(u)), tep = Math.min(o.s0y, hy) - 70;
      const y = (1 - u) * (1 - u) * o.s0y + 2 * u * (1 - u) * tep + u * u * hy;   // ikinci derece Bezier yayı
      P.x = x; P.y = y; P.vx = 0; P.vy = u < 0.5 ? -400 : 300; P.ground = false; P.poz = u > 0.75 ? 'kayma' : null; P.kaymaAci = 0;
      
      if (u >= 1) { o.evre = BU_GK_EVRE.kay; o.tk = t; o.fi = 0; o.v = 70; P.poz = 'kayma'; buSfx('kayma', 1); OLAY.emit('kayma', o); }
    }
    if (o.evre === BU_GK_EVRE.kay) {
      o.v = Math.min(o.v + 155 * dt, 440); o.fi += o.v * dt / o.R;
      const p = buYay(o, o.R, Math.PI / 2 - o.fi);
      P.x = p.x; P.y = p.y; P.vx = o.v * Math.cos(o.fi); P.vy = 0; P.ground = false; P.f = 1; P.poz = 'kayma'; P.kaymaAci = o.fi;
      // Gökkuşağı kaydırağı izi: arkada kalan prizmatik neşe parçacıkları ve ışık izi noktaları
      if (!o.kayIz) o.kayIz = [];
      o.kayIz.push({ x: P.x, y: P.y, fi: o.fi, t: now });
      while (o.kayIz.length > 60) o.kayIz.shift();

      // Gökkuşağı kaydırağı: ayakların altından fışkıran 7 renkli gökkuşağı kıvılcımları (rainbowSparks)
      const nSp = Math.round(3 + (o.v / 90));
      for (let s = 0; s < nSp; s++) {
        const colI = Math.floor(Math.random() * 7);
        const spAci = o.fi + Math.PI / 2 + (Math.random() - 0.5) * 1.35;
        const spHiz = 90 + Math.random() * 210 + o.v * 0.5;
        o.rainbowSparks.push({
          x: P.x - Math.cos(o.fi) * 8 + (Math.random() - 0.5) * 12,
          y: P.y - Math.sin(o.fi) * 8 + (Math.random() - 0.5) * 8,
          vx: -Math.cos(spAci) * spHiz + (Math.random() - 0.5) * 40,
          vy: -Math.sin(spAci) * spHiz - 25 - Math.random() * 50,
          r: 3.2 + Math.random() * 3.6,
          t: 0,
          max: 0.42 + Math.random() * 0.38,
          col: BU_GK[colI],
          colAcik: BU_GK_ACIK[colI],
          rot: Math.random() * BU_PI2,
          rotV: (Math.random() - 0.5) * 14
        });
      }

      // Hızlandıkça arkada kalan parlak renkli hız tüneli (tunelRings)
      const hizOran = clamp((o.v - 110) / 280, 0, 1);
      o.tunelT = (o.tunelT || 0) + dt;
      if (hizOran > 0.04 && o.tunelT > 0.035) {
        o.tunelT = 0;
        o.tunelRings.push({
          x: P.x, y: P.y, fi: o.fi,
          v: o.v, hizOran,
          t: 0, max: 0.55 + 0.35 * hizOran,
          w: o.bant * (1.1 + 0.9 * hizOran)
        });
        while (o.tunelRings.length > 28) o.tunelRings.shift();
      }

      if (Math.random() < dt * 42) {
        const c = BU_GK[Math.floor(Math.random() * 7)];
        const nx_ = -Math.cos(o.fi) * 14 + (Math.random() - 0.5) * 8, ny_ = -Math.sin(o.fi) * 14 + (Math.random() - 0.5) * 8;
        parca(P.x + nx_, P.y + ny_, -Math.cos(o.fi) * (80 + Math.random() * 90), -Math.sin(o.fi) * 60 - 25, 1.2, c, 5 + Math.random() * 5);
      }
      if (Math.random() < dt * 26) {
        parca(P.x - 12, P.y - 4, -40 - Math.random() * 70, -20 - Math.random() * 30, 0.85, '#ffffff', 4 + Math.random() * 4);
      }
      if (p.y >= buYuzeyY(p.x) - 1 || o.fi > 1.4) {   // yere indi: zafer ışıltıları ve neşe patlaması
        P.y = buYuzeyY(p.x); P.vy = 0; P.vx = Math.min(o.v, 260); P.ground = true; P.poz = null; P.kaymaAci = 0;
        burst(P.x, P.y - 4, 22, BU_R_GK, 180, 1.2, 9);
        for (let i = 0; i < 7; i++) {
          parca(P.x, P.y - 6, (Math.random() - 0.5) * 220, -70 - Math.random() * 90, 1.5, BU_GK[i], 8 + Math.random() * 4);
        }
        OLAY.emit('inis', { x: P.x, y: P.y, siddet: 500 });
        o.evre = BU_GK_EVRE.son; o.tSon = t;
      }
    }

    // Kıvılcımları ve hız tüneli halkalarını güncelle
    for (let i = o.rainbowSparks.length - 1; i >= 0; i--) {
      const sp = o.rainbowSparks[i]; sp.t += dt;
      if (sp.t >= sp.max) { o.rainbowSparks.splice(i, 1); continue; }
      sp.x += sp.vx * dt; sp.y += sp.vy * dt;
      sp.rot += sp.rotV * dt;
      sp.vx *= Math.exp(-dt * 2.8);
      sp.vy = sp.vy * Math.exp(-dt * 2.2) + 90 * dt;
    }
    for (let i = o.tunelRings.length - 1; i >= 0; i--) {
      const tr = o.tunelRings[i]; tr.t += dt;
      if (tr.t >= tr.max) { o.tunelRings.splice(i, 1); }
    }

    if (o.evre === BU_GK_EVRE.son && !o.done && t - o.tSon >= BU_T.sonBekle) {
      o.done = true; o.uyandi = true; P.kilit = Math.max(P.kilit || 0, 4);
      OLAY.emit('gokkusagiTamam', o);
    }
  },
  ciz(o, tm) {
    const gor = o.evre === BU_GK_EVRE.bekle ? o.ghost : 1;
    if (gor < 0.01 && o.evre === BU_GK_EVRE.bekle) { buGkHayal(o, tm, 0); return; }
    if (!o.grad) {   // her bant için dikey sönüm (ayaklar bulutlara karışır) — dünya sabit, bir kez
      o.grad = [];
      const RB = (typeof DN3_RB !== 'undefined' && DN3_RB && DN3_RB.length >= 7) ? DN3_RB : BU_GK;   // dunya3.js'in gök gökkuşağıyla aynı renkler
      const xL = o.ayak[0] ? o.ayak[0].x : o.cx - o.R * 0.5, xR = o.ayak[1] ? o.ayak[1].x : o.cx + o.R * 0.8, X0 = o.cx - o.R - 10, X1 = o.cx + o.R + 10, q = x => clamp((x - X0) / (X1 - X0), 0, 1);
      for (let i = 0; i < 7; i++) { const gr = g.createLinearGradient(X0, 0, X1, 0); const A = hex(RB[i]), cs = 'rgba(' + A[0] + ',' + A[1] + ',' + A[2] + ',';
        gr.addColorStop(0, cs + '0)'); gr.addColorStop(q(xL - 30), cs + '0)'); gr.addColorStop(q(xL + 110), RB[i]); gr.addColorStop(q(xR - 150), RB[i]); gr.addColorStop(q(xR + 6), cs + '0)'); gr.addColorStop(1, cs + '0)'); o.grad.push(gr); }
    }
    g.save();
    const bekle = o.evre === BU_GK_EVRE.bekle;
    if (bekle) buGkHayal(o, tm, 1);
    // dış hâle (yumuşak beyaz-altın)
    const tumu = bekle ? 0 : o.bu[6];
    if (!bekle && o.bu[0] > 0) {
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.05 + 0.06 * o.parla; g.strokeStyle = '#fff2dc'; g.lineWidth = o.bant * 7 + 50;
      const aL = buAyakAci(o, 0), aR = buAyakAci(o, 1);
      g.beginPath(); g.arc(o.cx, o.cy, o.R - o.bant * 3.5, aL, aL + (aR - aL) * o.bu[0]); g.stroke();
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    g.lineCap = 'butt';
    for (let i = 0; i < 7; i++) {
      const u = bekle ? (i < Math.round(o.ghost * 7) ? 1 : 0) : o.bu[i];
      if (u <= 0) continue;
      const r = o.R - o.bant * (i + 0.5), a1 = Math.PI * (1 + u);
      g.globalAlpha = bekle ? 0.16 + 0.05 * Math.sin(tm * 2 + i) : 0.92;
      g.strokeStyle = o.grad[i]; g.lineWidth = o.bant + 0.8;
      g.beginPath(); g.arc(o.cx, o.cy, r, Math.PI, a1); g.stroke();
      if (!bekle && u < 1) { const p = buYay(o, r, Math.PI - Math.PI * u); g.globalAlpha = 1; g.globalCompositeOperation = 'lighter'; dglow(BU_GK_ACIK[i], p.x, p.y, 34, 0.45); dglow('#ffffff', p.x, p.y, 12, 0.4); g.globalCompositeOperation = 'source-over'; }
    }
    g.globalAlpha = 1;

    // Hızlandıkça arkada kalan parlak renkli hız tüneli (hizTuneli)
    if (o.tunelRings && o.tunelRings.length > 1) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      const nTr = o.tunelRings.length;
      for (let k = 0; k < nTr; k++) {
        const tr = o.tunelRings[k];
        const u = tr.t / tr.max;
        const al = (1 - u) * tr.hizOran * 0.75;
        if (al < 0.01) continue;
        const col = BU_GK[k % 7], colAcik = BU_GK_ACIK[k % 7];
        // Tünel halkası: kaydırak yüzeyine dik eliptik ışık çemberi
        g.save();
        g.translate(tr.x, tr.y);
        g.rotate(tr.fi);
        const rRing = (20 + u * 45) * (1 + tr.hizOran * 0.8);
        g.strokeStyle = col;
        g.lineWidth = (3.5 * (1 - u) + 1.2) * tr.hizOran;
        g.globalAlpha = al * 0.85;
        g.beginPath();
        g.ellipse(0, 0, rRing * 0.35, rRing, 0, 0, BU_PI2);
        g.stroke();
        // Merkez beyaz ışıma
        g.strokeStyle = '#ffffff';
        g.lineWidth = 1.6 * (1 - u);
        g.globalAlpha = al * 0.6;
        g.beginPath();
        g.ellipse(0, 0, rRing * 0.28, rRing * 0.85, 0, 0, BU_PI2);
        g.stroke();
        g.restore();
      }
      // Hız tüneli hiper-ışık kaburgaları (warp streaks)
      g.lineCap = 'round';
      for (let st = 0; st < 5; st++) {
        const col = BU_GK[(st * 2) % 7];
        const ofs = (st - 2) * 16;
        g.strokeStyle = col;
        g.lineWidth = 2.2;
        g.beginPath();
        for (let k = 0; k < nTr; k++) {
          const tr = o.tunelRings[k], u = k / (nTr - 1);
          const px = tr.x - Math.sin(tr.fi) * ofs;
          const py = tr.y + Math.cos(tr.fi) * ofs;
          g.globalAlpha = u * 0.55 * tr.hizOran;
          if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.stroke();
      }
      g.restore();
    }

    // Feza kayarken arkasında kalan prizmatik 7 renkli ışık şeritleri
    if (o.kayIz && o.kayIz.length > 1) {
      g.save();
      g.lineCap = 'round'; g.lineJoin = 'round';
      const nIz = o.kayIz.length;
      for (let st = 0; st < 7; st++) {
        const col = BU_GK[st], ofs = (st - 3) * (o.bant * 0.28);
        g.globalCompositeOperation = 'lighter';
        g.strokeStyle = col;
        g.lineWidth = o.bant * 0.42;
        g.beginPath();
        for (let k = 0; k < nIz; k++) {
          const pt = o.kayIz[k], u = k / (nIz - 1);
          const dx = pt.x - o.cx, dy = pt.y - o.cy, dist = Math.hypot(dx, dy) || 1;
          const rx = pt.x + (dx / dist) * ofs, ry = pt.y + (dy / dist) * ofs;
          g.globalAlpha = u * u * 0.7;
          if (k === 0) g.moveTo(rx, ry); else g.lineTo(rx, ry);
        }
        g.stroke();
      }
      g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < nIz; k += 4) {
        const pt = o.kayIz[k], u = k / (nIz - 1), tw = 0.5 + 0.5 * Math.sin(tm * 6 + k);
        buPirilti(pt.x + (Math.sin(k * 2) * 5), pt.y + (Math.cos(k * 3) * 5), 3 + 3 * tw, u * tw * 0.85, tm + k);
      }
      g.restore();
    }

    // Ayakların altından fışkıran 7 renkli gökkuşağı kıvılcımları (rainbowSparks)
    if (o.rainbowSparks && o.rainbowSparks.length) {
      g.save();
      g.globalCompositeOperation = 'lighter';
      for (const sp of o.rainbowSparks) {
        const u = sp.t / sp.max;
        const al = (1 - u) * Math.min(1, sp.t * 12);
        if (al < 0.01) continue;
        // Parlayan dış renk halesi
        dglow(sp.col, sp.x, sp.y, sp.r * 3.5, al * 0.6);
        // 4 kollu prizmatik yıldız kıvılcımı
        g.globalAlpha = al;
        g.fillStyle = sp.colAcik || '#ffffff';
        g.save();
        g.translate(sp.x, sp.y);
        g.rotate(sp.rot);
        const rNow = sp.r * (1 - u * 0.3);
        g.beginPath();
        g.moveTo(0, -rNow);
        g.quadraticCurveTo(rNow * 0.15, -rNow * 0.15, rNow, 0);
        g.quadraticCurveTo(rNow * 0.15, rNow * 0.15, 0, rNow);
        g.quadraticCurveTo(-rNow * 0.15, rNow * 0.15, -rNow, 0);
        g.quadraticCurveTo(-rNow * 0.15, -rNow * 0.15, 0, -rNow);
        g.fill();
        g.restore();
      }
      g.restore();
      g.globalAlpha = 1;
    }

    if (!bekle && tumu > 0) {
      // parlak üst kenar (kaydırak yüzeyi) + ışıltılar
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = 'rgba(255,255,255,' + (0.18 * tumu + 0.15 * o.parla).toFixed(3) + ')'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(o.cx, o.cy, o.R - 1, buAyakAci(o, 0) + 0.12, buAyakAci(o, 1) - 0.08); g.stroke();
      for (const s of o.yildizlar) { const pu = 0.5 + 0.5 * Math.sin(tm * 2.6 + s.ph); if (pu < 0.55) continue; const p = buYay(o, s.r, s.a); buPirilti(p.x, p.y, 3 + 3 * pu, (pu - 0.5) * 0.8 * tumu, tm * 0.5 + s.ph); }
      g.globalCompositeOperation = 'source-over';
    }
    g.restore();
    TUR.al('gokkusagi').ayakCiz(o, tm);
  },
  ayakCiz(o, tm) {   // (ciz'in sonunda çağrılır: Feza'nın ARKASINDA kalsın)
    // yayın zeminden çıktığı ve zemine değdiği yerlerde yumuşak ışık bulutları (ayaklar bulutlara karışır)
    if (o.evre === BU_GK_EVRE.bekle) return;
    const tumu = o.bu[6], ilk = o.bu[0];
    if (ilk <= 0) return;
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < o.ayak.length; i++) {
      const q = o.ayak[i], a = (i === 0 ? Math.min(1, ilk * 4) : tumu) * (0.85 + 0.15 * Math.sin(tm * 1.7 + i * 2));
      if (a <= 0.01) continue;
      dglow('#ffe8f2', q.x, q.y - 4, 100, 0.2 * a); dglow('#ffffff', q.x, q.y, 44, 0.26 * a);
    }
    g.globalCompositeOperation = 'source-over';
  },
});
function buAyakAci(o, i) {   // yayın zeminden çıktığı (0) / zemine değdiği (1) noktanın canvas açısı (π..2π)
  const q = o.ayak && o.ayak[i]; if (!q) return i ? BU_PI2 : Math.PI;
  let a = Math.atan2(q.y - o.cy, q.x - o.cx); if (a < 0) a += BU_PI2; return a;
}
function buGkHayal(o, tm, kirpli) {   // başlamadan önce: yayın yerinde süzülen minik pırıltılar (hedef ipucu)
  if (!kirpli) g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.12 + 0.76 * ((i / 9 + tm * 0.03) % 1)), p = buYay(o, o.R - o.bant * 3.5, a), pu = 0.5 + 0.5 * Math.sin(tm * 2.2 + i * 1.7);
    buPirilti(p.x, p.y, 2.5 + 2 * pu, 0.25 + 0.35 * pu, tm * 0.4 + i);
  }
  g.globalCompositeOperation = 'source-over';
  if (!kirpli) g.restore();
}
function buGkBasla(o) {
  o.evre = BU_GK_EVRE.kuzu; o.t = 0; o.basladi = true;
  P.kilit = Math.max(P.kilit || 0, 1); P.vx = 0;
  if (typeof jumpPressed !== 'undefined') { try { jumpPressed = false; } catch (e) {} }
  try { OLAY.emit('gokkusagiBasla', o); } catch (e) {}
  if (typeof omDikkat === 'function') {
    try { omDikkat('gokkusagi', 60, () => buGkKutu(o), 1, 0.6); } catch (e) {}
  }
}
function buGkKutu(o) {   // final kamerası: önce yayın tepesi + kuzucuklar (dar), kayışta Feza + önündeki iniş yeri
  const ust = o.cy - o.R - 105, zemin = buYuzeyY(o.cx) + 4;
  if (o.evre < BU_GK_EVRE.kay) { omDkEkle(o.cx - 330, ust, o.cx + 330, zemin); return; }
  const son = o.ayak && o.ayak[1] ? o.ayak[1].x : o.cx + 480;
  omDkEkle(Math.min(P.x - 160, o.cx - 300), Math.min(P.y - 170, ust + 20), Math.max(P.x + 200, son + 40), buYuzeyY(son) + 4);   // kuzucuk yayı da kadrajda (dar ekranda Feza öncelikli)
}
function buKuzuTopla(o) {   // geride kalmış kuzucukları (Büyük Boşluk'un öbür yanı) uzaktan renklendir: kuzu.js dokun() ile
  const h = TUR.al('kuzu'); if (!h || typeof h.dokun !== 'function') return;
  const sinir = (typeof BOLUM !== 'undefined' && BOLUM.ucus) ? BOLUM.ucus.x1 : o.tepeX0 - 30 * T;
  for (const k of o.kz || buKuzular()) {
    if (k.done || k.x > sinir) continue;
    k.uzaktan = true; k.dokundu = true;
    try { h.dokun(k); } catch (e) {}
    OLAY.emit('dokun:kuzu', k);
    return;   // birer birer (her biri ayrı sevinç)
  }
}

// ───────────────────────── bulutKopru: yedek köprü (ucus.js yoksa) ─────────────────────────
TUR.kaydet('bulutKopru', {
  kur(o) {
    const u = TUR.al('ucusKapisi'); o.yedek = !(u && (typeof u.guncelle === 'function' || typeof u.dokun === 'function'));
    o.w = o.w || 120; o.ust = o.y; o.y = o.ust + 4; o.a = 0; o.seed = 9 + (o.sira || 0) % 30;
    if (o.yedek) o.cisim = { w: o.w - 10, h: 4, tip: 'ustten', aktif: true, dx: 0, dy: 0 };
  },
  guncelle(o, dt) { if (o.yedek) o.a = Math.min(1, o.a + dt * (Math.abs(P.x - o.x) < 700 ? 2 : 0)); },
  ciz(o, tm) {
    if (!o.yedek || o.a < 0.01) return;
    if (typeof dn3Bulut === 'function') dn3Bulut(o.x, o.y - 4, o.w, 20, { seed: o.seed, alpha: o.a });
    else buBulutCiz(buBulut(o.w, 20, 'kopru', o.seed), o.x, o.y - 4, o.w, 1, 1, o.a);
  },
});

// ───────────────────────── süsler ─────────────────────────
const BU_UC = [['#ff9ab8', '#ffd2e0', '#f06a96'], ['#ffc46a', '#ffe8b8', '#f09a3a'], ['#8ad0ff', '#d4eeff', '#4aa0e0'], ['#b89cff', '#e6dcff', '#8a6ae0']];
TUR.kaydet('ucurtma', {
  kur(o) { o.ip = o.ip || 220; o.ph = (o.x * 0.019) % 6.28; o.renk = (o.renk || 0) % BU_UC.length; },
  ciz(o, tm) {
    const c = BU_UC[o.renk], sw = Math.sin(tm * 0.7 + o.ph), kx = o.x + o.ip * 0.42 + sw * 16, ky = o.y - o.ip * 0.86 + Math.sin(tm * 1.1 + o.ph) * 10, rot = sw * 0.18 + 0.15;
    // ip (sarkık): ince, gök tonunda, yarı saydam; alt ≈100 birimi yumuşakça söner (yere değmez, Feza'nın önünden geçiyor gibi okunmasın)
    const ay = o.y - 34;   // bağ yeri: yolun arkasındaki küçük bulut tümseğinin tepesi (yürüme şeridinin üstünde, arkada)
    if (!o.ipGr || o.ipY !== ay) { o.ipY = ay; o.ipGr = g.createLinearGradient(0, ay, 0, ay - 110); o.ipGr.addColorStop(0, 'rgba(176,128,186,0)'); o.ipGr.addColorStop(1, 'rgba(176,128,186,0.42)'); }
    g.strokeStyle = o.ipGr; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(o.x, ay); g.quadraticCurveTo((o.x + kx) / 2 + 20, (ay + ky) / 2 + 30, kx, ky + 14); g.stroke();
    // bağ yeri: arkadaki küçük, soluk bulut tümseği
    g.globalAlpha = 0.55; g.fillStyle = '#f6e6f4';
    g.beginPath(); g.arc(o.x - 9, ay + 6, 9, 0, BU_PI2); g.arc(o.x + 4, ay + 2, 11, 0, BU_PI2); g.arc(o.x + 15, ay + 8, 7, 0, BU_PI2); g.fill(); g.globalAlpha = 1;
    // kuyruk: dalgalanan fiyonklar
    g.strokeStyle = c[2]; g.lineWidth = 1.4; g.beginPath();
    let px = kx, py = ky + 22;
    g.moveTo(px, py);
    for (let i = 1; i <= 6; i++) { const nx_ = kx - i * 13, ny = ky + 22 + i * 9 + Math.sin(tm * 3.2 - i * 0.9 + o.ph) * 7; g.lineTo(nx_, ny); px = nx_; py = ny; }
    g.stroke();
    for (let i = 1; i <= 6; i += 2) {
      const bx = kx - i * 13, by = ky + 22 + i * 9 + Math.sin(tm * 3.2 - i * 0.9 + o.ph) * 7;
      g.fillStyle = BU_GK[(o.renk * 2 + i) % 7]; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - 6, by - 4); g.lineTo(bx - 6, by + 4); g.closePath(); g.moveTo(bx, by); g.lineTo(bx + 6, by - 4); g.lineTo(bx + 6, by + 4); g.closePath(); g.fill();
    }
    // uçurtma gövdesi (baklava)
    g.save(); g.translate(kx, ky); g.rotate(rot);
    g.fillStyle = c[0]; g.beginPath(); g.moveTo(0, -24); g.lineTo(17, -2); g.lineTo(0, 22); g.lineTo(-17, -2); g.closePath(); g.fill();
    g.fillStyle = c[1]; g.beginPath(); g.moveTo(0, -24); g.lineTo(17, -2); g.lineTo(0, -2); g.closePath(); g.fill(); g.beginPath(); g.moveTo(0, 22); g.lineTo(-17, -2); g.lineTo(0, -2); g.closePath(); g.fill();
    g.strokeStyle = c[2]; g.lineWidth = 1.3; g.beginPath(); g.moveTo(0, -24); g.lineTo(0, 22); g.moveTo(-17, -2); g.lineTo(17, -2); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -24); g.lineTo(17, -2); g.stroke();
    g.restore();
  },
});
TUR.kaydet('kusSuru', {
  kur(o) { o.n = o.n || 6; o.ph = (o.x * 0.007) % 6.28; o.alan = 1400; o.hiz = 22 + (o.x % 7); },
  ciz(o, tm) {
    if (!buEkranda(o.x, 900)) return;
    const ofs = ((tm * o.hiz + o.ph * 200) % o.alan) - o.alan / 2, bx = o.x + ofs, by = o.y + Math.sin(tm * 0.4 + o.ph) * 14;
    const kenar = clamp((o.alan / 2 - Math.abs(ofs)) / 200, 0, 1);   // alanın uçlarında solar (pop yok)
    if (kenar <= 0.01) return;
    g.strokeStyle = 'rgba(150,108,150,' + (0.55 * kenar).toFixed(3) + ')'; g.lineWidth = 1.6; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    for (let i = 0; i < o.n; i++) {
      const sira = Math.ceil(i / 2), yan = i % 2 ? 1 : -1, x = bx - sira * 22, y = by + yan * sira * 12 + Math.sin(tm * 1.3 + i) * 3;
      const k = Math.sin(tm * 6 + i * 1.7 + o.ph), s = 7 - sira * 0.6;
      g.moveTo(x - s, y - k * 3); g.quadraticCurveTo(x - s * 0.45, y - 3 - k * 2, x, y); g.quadraticCurveTo(x + s * 0.45, y - 3 - k * 2, x + s, y - k * 3);
    }
    g.stroke();
  },
});
TUR.kaydet('tuy', {
  kur(o) { o.ph = (o.x * 0.023) % 6.28; o.c = BU_TUY_R[Math.floor(o.x / 7) % 4]; },
  ciz(o, tm) {
    if (!buEkranda(o.x, 200)) return;
    const u = tm * 0.35 + o.ph, x = o.x + Math.sin(u) * 50, y = o.y + Math.sin(u * 2) * 14 + Math.cos(u * 0.5) * 20, rot = Math.cos(u * 2) * 0.7;
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = 0.9; buTuyCiz(16, o.c); g.restore(); g.globalAlpha = 1;
  },
});

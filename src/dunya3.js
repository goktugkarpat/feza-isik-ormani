/* dunya3.js – Bölüm 3 'Bulut Ülkesi' dünya çizimi (WORLD3, önek dn3). Sözleşme: src/BOLUM3.md. Yalnız tanım yapar.
   Gün doğumu gökyüzü (pembe → şeftali → altın; bölüm ilerledikçe güneş yükselir), ışık hüzmeleri, çok katmanlı paralaks bulut denizi,
   uzak yüzen adalar (minik ağaçlar, şelale ipliği), kuş siluetleri, sis bantları, SAYAC.kuzu/kuzuTop oranıyla beliren gökkuşağı,
   yumuşak bulut zemin (ızgara 1) + ince bulut şeritleri (ızgara 2), uçuşan ışık tozları, ön planda bulanık bulut tutamları.
   Dışarıya açılan: dn3Background dn3World dn3Foreground dn3Motes dn3Petals dn3Vignette dn3Isit, dn3Bulut(x, yUst, w, h, o) (LEVEL3 için
   aynı görünümde bulut gövdesi), DN3_RB (gökkuşağı renkleri, kırmızı→mor).
   Performans: gökyüzü / uzak katmanlar / adalar / hüzmeler / gökkuşağı ekran dışı tuvallere bir kez boyanır (boyut değişince yeniden);
   zemin 512 birimlik parçalar halinde önbelleklenir; karede yeni gradyan, ctx.filter, shadowBlur yok. Yükleme anında yalnız tanım + OLAY dinleyicisi. */
'use strict';

const DN3 = { ok: false, LH: 0, GTOP: 0, GREF: 0, GBOT: 0, prev: -1, dt: 0.016, tm: 0, hy: 0, dyS: 0, p: -1, f: 0, fly: 0, tepe: 0,
  finT: undefined, tamT: undefined, frames: 0, comps: [], plats: [], deco: [], gc: null, rbT: [], rbDone: 0, sx: 0, sy: 0, sr: 0 };
const DN3_DEPTH = 240, DN3_TW = 512;
const DN3_RB = ['#ff6f7d', '#ffa456', '#ffdf5e', '#7ad98c', '#5cb4ff', '#6c7cf2', '#b68cf4'];   // kırmızı, turuncu, sarı, yeşil, mavi, lacivert, mor
const dn3Hx = (h, a) => { const A = hex(h); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };
const dn3Mix = (a, b, t) => { const A = hex(a), B = hex(b); let s = '#'; for (let i = 0; i < 3; i++) s += Math.round(lerp(A[i], B[i], t)).toString(16).padStart(2, '0'); return s; };
const dn3Cv = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; };
const dn3Ok = () => W > 0 && H > 0 && S > 0 && isFinite(S) && isFinite(W) && isFinite(H) && typeof cam !== 'undefined' && isFinite(cam.x) && isFinite(cam.y) && isFinite(VW);
const dn3Eg = (col, x, y, rx, ry, a) => { if (a <= 0.003) return; g.globalAlpha = a > 1 ? 1 : a; g.drawImage(glow(col), x - rx, y - ry, rx * 2, ry * 2); g.globalAlpha = 1; };
const dn3Ease = t => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3);

// ── Feza odağı: çevresindeki süs/parıltı soluklaşır (karakter öne çıksın) ──
const DN3F = { x: -9999, y: -9999, on: false };
function dn3FocusUpdate() { const ok = typeof P !== 'undefined' && isFinite(P.x) && isFinite(P.y) && (DURUM === 'oyun' || DURUM === 'giris'); DN3F.on = ok; if (ok) { DN3F.x = (P.x - cam.x) * S; DN3F.y = (P.y - 40 - cam.y) * S; } }
function dn3Foc(px, py) { if (!DN3F.on) return 1; const dx = (px - DN3F.x) / (240 * S), dy = (py - DN3F.y) / (140 * S), d = Math.sqrt(dx * dx + dy * dy); return 0.2 + 0.8 * smooth(clamp((d - 0.55) / 0.95, 0, 1)); }

// ── olaylar (yalnız veri yazar; Bölüm 1/2'de zararsız) ──
OLAY.on('kuzu', d => { const i = d && d.renkI != null ? d.renkI | 0 : -1; const n = i >= 0 && i < 7 ? i : DN3.rbT.findIndex(v => v === undefined); const k = n < 0 ? (DN3.rbT.length < 7 ? DN3.rbT.length : -1) : n; if (k >= 0 && k < 7 && DN3.rbT[k] === undefined) DN3.rbT[k] = isFinite(now) ? now : 0; });
OLAY.on('gokkusagiBasla', () => { if (DN3.finT === undefined) DN3.finT = now; });
OLAY.on('gokkusagiTamam', () => { if (DN3.tamT === undefined) DN3.tamT = now; if (DN3.finT === undefined) DN3.finT = now; });
OLAY.on('boyut', () => { DN3.boyut = true; });

// ═══════════ başlangıç: bölüm verisi (tembel) ═══════════
function dn3Init() {
  if (DN3.ok) return true;
  if (typeof grid === 'undefined' || typeof ROWS === 'undefined' || typeof COLS === 'undefined' || !grid || !grid.length) return false;
  DN3.ok = true; DN3.LH = ROWS * T;
  const tops = []; for (let c = 0; c < COLS; c++) { const t = topOf(c); if (t < ROWS) tops.push(t * T); }
  tops.sort((a, b) => a - b);
  DN3.GREF = tops.length ? tops[tops.length >> 1] : DN3.LH - 4 * T; DN3.GTOP = tops.length ? tops[0] : DN3.LH - 4 * T;
  dn3BuildGCol();
  dn3BuildComps();
  dn3BuildPlats();
  dn3BuildDeco();
  DN3.gc = new Map();
  return true;
}
function dn3Bolum() { return typeof BOLUM !== 'undefined' && BOLUM ? BOLUM : null; }
function dn3Bolgeler() { const B = dn3Bolum(); return B && Array.isArray(B.bolgeler) ? B.bolgeler : []; }
function dn3RegName(x) { const L = dn3Bolgeler(); for (let i = 0; i < L.length; i++) { const b = L[i]; if (b && x >= b.x0 && x < b.x1) return b.ad; } return ''; }

// ═══════════ bölge karakteri: renk tonu, rüzgâr, uçuş, tepe ═══════════
const DN3_REGC = { pembeBulut: ['#ff9ccf', 0.45], kuzuCayir: ['#a6ecc0', 0.4], ruzgar: ['#a8d4ff', 0.45], sekil: ['#d4b4ff', 0.45], bosluk: ['#b8c4ff', 0.35], ucus: ['#ffd49a', 0.5], tepe: ['#ffe08a', 0.65] };
function dn3Region() {
  const R = DN3.reg || (DN3.reg = { r: 255, g: 190, b: 200, a: 0, hex: '#ffbec8', wind: 0, ucus: 0, tepe: 0 });
  const cx = cam.x + VW / 2, L = dn3Bolgeler();
  let sr = 0, sg = 0, sb = 0, sw = 0, sa = 0, wind = 0, uc = 0, tp = 0, sk = 0, pb = 0, kc = 0;
  for (let i = 0; i < L.length; i++) { const b = L[i]; if (!b) continue; const c = DN3_REGC[b.ad]; if (!c) continue; const w = clamp(Math.min(cx - b.x0 + 6 * T, b.x1 + 6 * T - cx) / (12 * T), 0, 1); if (w <= 0) continue;
    const A = hex(c[0]); sr += A[0] * w; sg += A[1] * w; sb += A[2] * w; sw += w; sa += c[1] * w; if (b.ad === 'ruzgar') wind = Math.max(wind, w); if (b.ad === 'ucus' || b.ad === 'bosluk') uc = Math.max(uc, w); if (b.ad === 'tepe') tp = Math.max(tp, w); if (b.ad === 'sekil') sk = Math.max(sk, w); if (b.ad === 'pembeBulut') pb = Math.max(pb, w); if (b.ad === 'kuzuCayir') kc = Math.max(kc, w); }
  if (sw > 0) { R.r = sr / sw; R.g = sg / sw; R.b = sb / sw; R.a = sa / Math.max(1, sw); } else R.a = 0;
  const B = dn3Bolum();
  if (B && B.ucus && isFinite(B.ucus.x0) && isFinite(B.ucus.x1)) uc = Math.max(uc, clamp(Math.min(cx - B.ucus.x0 + 4 * T, B.ucus.x1 + 4 * T - cx) / (8 * T), 0, 1));
  if (B && B.gokkusagi && isFinite(B.gokkusagi.x)) tp = Math.max(tp, clamp(1 - Math.abs(cx - B.gokkusagi.x) / (22 * T), 0, 1));
  R.wind = wind; R.ucus = uc; R.tepe = tp; R.sekil = sk; R.pembe = pb; R.cayir = kc;
  DN3.drift = (DN3.drift || 0) + DN3.dt * (1 + 3.5 * wind + 1.5 * DN3.fly);   // rüzgârda bulutlar daha hızlı kayar (birikimli: sıçrama yok)
  R.hex = '#' + ((1 << 24) | (Math.round(R.r) << 16) | (Math.round(R.g) << 8) | Math.round(R.b)).toString(16).slice(1);
  return R;
}

// ═══════════ her kare: zaman, ilerleme (güneşin yükselişi), gökkuşağı, uçuş ═══════════
function dn3Update(tm) {
  const nw = isFinite(now) ? now : 0;
  DN3.dt = DN3.prev < 0 || !isFinite(DN3.prev) ? 0.016 : clamp(nw - DN3.prev, 0, 0.1); DN3.prev = nw; DN3.tm = tm;
  const B = dn3Bolum(), cx = cam.x + VW / 2;
  let end = COLS * T; if (B && B.gokkusagi && isFinite(B.gokkusagi.x)) end = B.gokkusagi.x;
  let pt = clamp(cx / Math.max(1, end), 0, 1); if (DN3.finT !== undefined || DURUM === 'final' || DURUM === 'son') pt = 1;
  if (DN3.p < 0 || !isFinite(DN3.p)) DN3.p = pt; else DN3.p += (pt - DN3.p) * (1 - Math.exp(-DN3.dt * 0.35));
  // gökkuşağı bantları: SAYAC.kuzu / kuzuTop oranı (7 bant); olay gelmediyse zamanı şimdi say
  let nb = 0;
  if (typeof SAYAC !== 'undefined' && SAYAC) { const top = Math.max(1, SAYAC.kuzuTop || 0), k = SAYAC.kuzu || 0; nb = Math.floor(clamp(k / top, 0, 1) * 7 + 1e-6); if (!SAYAC.kuzuTop && !k) nb = 0; }
  if (DN3.finT !== undefined || DURUM === 'final' || DURUM === 'son') nb = 7;
  for (let i = 0, st = 0; i < nb; i++) if (DN3.rbT[i] === undefined) { DN3.rbT[i] = nw + st; st += 0.5; }
  let f = 0; for (let i = 0; i < 7; i++) if (DN3.rbT[i] !== undefined && nw >= DN3.rbT[i]) f++;
  DN3.f = f / 7;
  const flyT = (typeof P !== 'undefined' && P.ucus) ? 1 : 0;
  DN3.fly += (flyT - DN3.fly) * (1 - Math.exp(-DN3.dt * 1.4));
}

// ═══════════ gökyüzü: iki önbellekli tuval (şafak / sabah), ilerlemeye göre karışım ═══════════
const DN3_SKYC = {
  at: [0, 0.26, 0.5, 0.7, 0.87, 1],
  A: ['#6a6ec4', '#9784d2', '#d596cb', '#ffa6ae', '#ffc199', '#ffdcac'],
  B: ['#7f9fe4', '#a9ace6', '#e2b2da', '#ffb8b4', '#ffc898', '#ffdca8'],
  seaA: ['#ffd9b8', '#f7bccb', '#dcaad8', '#b79cd8'],
  seaB: ['#ffdcc0', '#fbc4c8', '#e6b2dc', '#c4abe2'],
};
const DN3_SK = { A: null, B: null, C: null, w: 0, h: 0, yh: 0, k: 0.5, cp: -1, bOk: false };
let dn3NoiseP = null;
function dn3Dither(x, w, h, amt) {
  if (!dn3NoiseP) { const c = dn3Cv(96, 96), t = c.getContext('2d'), im = t.createImageData(96, 96), R = rng(77); for (let i = 0; i < 96 * 96; i++) { const v = R() < 0.5 ? 0 : 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = Math.round(R() * 255); } t.putImageData(im, 0, 0); dn3NoiseP = x.createPattern(c, 'repeat'); }
  x.save(); x.globalAlpha = amt; x.fillStyle = dn3NoiseP; x.fillRect(0, 0, w, h); x.restore();
}
function dn3PaintSky(c, kk, w, h, yh) {
  const x = c.getContext('2d'), R = rng(303 + kk * 11), K = DN3_SKYC, col = i => dn3Mix(K.A[i], K.B[i], kk), sea = i => dn3Mix(K.seaA[i], K.seaB[i], kk);
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  const gr = x.createLinearGradient(0, 0, 0, yh); for (let i = 0; i < 6; i++) gr.addColorStop(K.at[i], col(i));
  x.fillStyle = gr; x.fillRect(0, 0, w, yh + 1);
  const gs = x.createLinearGradient(0, yh, 0, h); gs.addColorStop(0, sea(0)); gs.addColorStop(0.3, sea(1)); gs.addColorStop(0.7, sea(2)); gs.addColorStop(1, sea(3));
  x.fillStyle = gs; x.fillRect(0, yh, w, h - yh);
  const sx = w * 0.72;
  // ufukta gün doğumu parıltısı (güneş tarafı sıcak, karşı taraf pembe-lila)
  const ell = (cx, cy, rx, ry, stops) => { x.save(); x.translate(cx, cy); x.scale(1, ry / rx); const rg = x.createRadialGradient(0, 0, 0, 0, 0, rx); for (const s of stops) rg.addColorStop(s[0], s[1]); x.fillStyle = rg; x.fillRect(-rx, -rx, rx * 2, rx * 2); x.restore(); };
  ell(sx, yh, w * 0.75, yh * 0.62, [[0, dn3Hx('#fff4d6', 0.75 - 0.15 * kk)], [0.25, dn3Hx('#ffd6a4', 0.42)], [0.6, dn3Hx('#ffb0a8', 0.16)], [1, 'rgba(255,176,168,0)']]);
  ell(w * 0.2, yh, w * 0.6, yh * 0.35, [[0, dn3Hx('#ffb4c8', 0.32)], [1, 'rgba(255,180,200,0)']]);
  // tepede şafak öncesinden kalan birkaç soluk yıldız (yalnız şafakta)
  if (kk < 0.5) for (let i = 0; i < 26; i++) { const px = R() * w, py = Math.pow(R(), 1.6) * yh * 0.26, s = (0.6 + R() * 1.2) * (w / 1000 + 0.4); x.fillStyle = dn3Hx('#ffffff', 0.15 + R() * 0.3); x.fillRect(px, py, s, s); }
  // ince yüksek bulut çizgileri (cirrus): altları güneşle altın, üstte lila
  for (let i = 0; i < 46; i++) {
    const py = (0.1 + Math.pow(R(), 0.8) * 0.78) * yh, px = R() * w, ww = w * (0.06 + R() * 0.22), hh = (2 + R() * 6) * (w / 1000 + 0.3), low = py / yh;
    const c0 = low > 0.6 ? '#fff0c8' : low > 0.35 ? '#ffd0d8' : '#e8c8f0', a = (0.06 + R() * 0.12) * (0.6 + low * 0.6);
    x.save(); x.translate(px, py); x.rotate((R() - 0.5) * 0.08); x.scale(1, hh / ww);
    const rg = x.createRadialGradient(0, 0, 0, 0, 0, ww); rg.addColorStop(0, dn3Hx(c0, a)); rg.addColorStop(0.6, dn3Hx(c0, a * 0.4)); rg.addColorStop(1, dn3Hx(c0, 0));
    x.fillStyle = rg; x.fillRect(-ww, -ww, ww * 2, ww * 2); x.restore();
  }
  dn3Dither(x, w, h, 0.014);
}
function dn3SkyBuild() {
  const k = 0.5, w = Math.max(64, Math.round(W * k)), h = Math.round(1.3 * H * k);
  if (DN3_SK.w === w && DN3_SK.h === h && DN3_SK.A) return;
  const S_ = DN3_SK; S_.w = w; S_.h = h; S_.k = w / W; S_.yh = Math.round(0.82 * H * S_.k);
  S_.A = dn3Cv(w, h); S_.B = dn3Cv(w, h); S_.C = dn3Cv(w, h); S_.cp = -1; S_.bOk = false;
  dn3PaintSky(S_.A, 0, w, h, S_.yh);
}
function dn3SkyStep() { const S_ = DN3_SK; if (S_.A && !S_.bOk) { dn3PaintSky(S_.B, 1, S_.w, S_.h, S_.yh); S_.bOk = true; S_.cp = -1; } }
function dn3SkyComp(p) {
  const S_ = DN3_SK, q = Math.round(p * 160) / 160; if (S_.cp === q) return S_.C; S_.cp = q;
  const x = S_.C.getContext('2d'); x.globalCompositeOperation = 'copy'; x.globalAlpha = 1; x.drawImage(S_.A, 0, 0);
  x.globalCompositeOperation = 'source-over'; if (S_.bOk && q > 0) { x.globalAlpha = q; x.drawImage(S_.B, 0, 0); } x.globalAlpha = 1;
  return S_.C;
}

// ═══════════ güneş ve ışık hüzmeleri (sprite) ═══════════
let dn3SunC = null, dn3RayC = [null, null];
function dn3SunSpr() {
  if (dn3SunC) return dn3SunC; const c = dn3SunC = dn3Cv(256, 256), x = c.getContext('2d'), rg = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.42, 'rgba(255,253,240,1)'); rg.addColorStop(0.6, 'rgba(255,244,206,0.95)'); rg.addColorStop(0.68, 'rgba(255,232,186,0.45)');
  rg.addColorStop(0.8, 'rgba(255,214,170,0.12)'); rg.addColorStop(1, 'rgba(255,200,160,0)'); x.fillStyle = rg; x.fillRect(0, 0, 256, 256); return c;
}
function dn3RaySpr(i) {
  if (dn3RayC[i]) return dn3RayC[i]; const N = 256, h = N / 2, c = dn3RayC[i] = dn3Cv(N, N), x = c.getContext('2d'), R = rng(91 + i * 37);
  x.globalCompositeOperation = 'lighter'; x.translate(h, h);
  const n = i ? 11 : 14;
  for (let k = 0; k < n; k++) {
    const an = (k + R() * 0.7) / n * 6.283, wd = 0.035 + R() * 0.09, L = h * (0.75 + R() * 0.25);
    const rg = x.createRadialGradient(0, 0, 0, 0, 0, L); const a = 0.22 + R() * 0.3; rg.addColorStop(0, `rgba(255,246,220,${a})`); rg.addColorStop(0.35, `rgba(255,236,200,${a * 0.55})`); rg.addColorStop(1, 'rgba(255,230,190,0)');
    x.fillStyle = rg; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, L, an - wd / 2, an + wd / 2); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, L, an - wd * 0.9, an + wd * 0.9); x.closePath(); x.globalAlpha = 0.4; x.fill(); x.globalAlpha = 1;
  }
  return c;
}
function dn3SunPos() {
  const p = smooth(clamp(DN3.p, 0, 1)), m = Math.min(W, H);
  DN3.sx = W * 0.72 - clamp(cam.x * 0.002, 0, 60) * S; DN3.sr = m * (0.058 - 0.008 * p);
  DN3.sy = DN3.hy - (0.012 + 0.2 * p) * H + DN3.sr * 0.15;
}
function dn3Sun(tm) {
  const x = DN3.sx, y = DN3.sy, r = DN3.sr, br = 0.92 + 0.08 * Math.sin(tm * 0.45), m = Math.max(W, H);
  const flyGlow = 1 + 0.35 * DN3.fly;
  g.globalCompositeOperation = 'lighter';
  dn3Eg('#ffc89a', x, y, m * 0.75 * flyGlow, m * 0.42 * flyGlow, (0.22 + 0.08 * DN3.fly) * br);
  dn3Eg('#ffe2b0', x, y, r * 7 * flyGlow, r * 6 * flyGlow, (0.4 + 0.12 * DN3.fly) * br);
  dn3Eg('#fff2d0', x, y, r * 3 * flyGlow, r * 3 * flyGlow, 0.5 * br);
  g.globalCompositeOperation = 'source-over';
  const s = dn3SunSpr(), rr = r * 1.6; g.drawImage(s, x - rr, y - rr, rr * 2, rr * 2);
}
function dn3Rays(tm, a) {
  if (a < 0.01) return; const x = DN3.sx, y = DN3.sy, m = Math.max(W, H) * 1.5, br = 0.75 + 0.25 * Math.sin(tm * 0.37) * Math.sin(tm * 0.23 + 1);
  g.globalCompositeOperation = 'lighter';
  const nR = a > 0.25 ? 2 : 1;   // GPU: sakin bölgelerde tek hüzme katmanı
  for (let i = 0; i < nR; i++) { const sp = dn3RaySpr(i); g.save(); g.translate(x, y); g.rotate(i ? -tm * 0.0065 + 0.4 : tm * 0.009); g.globalAlpha = a * (i ? 0.75 : 1) * (i ? 1.25 - br * 0.5 : br); g.drawImage(sp, -m, -m, m * 2, m * 2); g.restore(); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// ═══════════ gökkuşağı: önbellekli yay (bant bant; yeni bant soldan sağa çizilerek belirir) ═══════════
const DN3_RBC = { R: 0, k: 0.25, pad: 0, ghost: null, band: [], comp: new Map() };
function dn3RbGeo() {   // ekranda gökkuşağı merkezi ve yarıçapı
  const R = Math.round(Math.min(W * 0.46, H * 0.5)); return R;
}
function dn3RbPaint(mask, single) {   // mask: bit i = bant i görünür; single: tek bant (süpürme için) ya da -1; 'g' hayalet
  const R = DN3_RBC.R, k = DN3_RBC.k, bw = R * 0.034, pad = DN3_RBC.pad, w = Math.ceil((R + pad) * 2 * k), h = Math.ceil((R + pad) * k) + 2;
  const c = dn3Cv(w, h), x = c.getContext('2d'), cx = w / 2, cy = (R + pad) * k, r0 = (R - 9 * bw) * k, r1 = (R + 1.4 * bw) * k;
  const rg = x.createRadialGradient(cx, cy, r0, cx, cy, r1), u = rr => clamp((rr * k - r0) / (r1 - r0), 0, 1);
  if (single === 'g') { rg.addColorStop(u(R - 7.6 * bw), 'rgba(255,255,255,0)'); rg.addColorStop(u(R - 5 * bw), 'rgba(255,250,240,0.55)'); rg.addColorStop(u(R - 2 * bw), 'rgba(255,250,240,0.6)'); rg.addColorStop(u(R + 0.6 * bw), 'rgba(255,255,255,0)'); }
  else {
    rg.addColorStop(0, 'rgba(255,255,255,0)');
    if (single < 0 && mask === 127) { rg.addColorStop(u(R - 8.6 * bw), 'rgba(255,250,236,0)'); rg.addColorStop(u(R - 7.6 * bw), 'rgba(255,250,236,0.22)'); }   // tamamlanınca içi hafif aydınlık
    for (let i = 6; i >= 0; i--) {
      const on = single >= 0 ? i === single : (mask >> i) & 1, A = hex(DN3_RB[i]), rc = R - (i + 0.5) * bw;
      rg.addColorStop(u(rc), `rgba(${A[0]},${A[1]},${A[2]},${on ? 1 : 0})`);
    }
    rg.addColorStop(u(R + 0.9 * bw), 'rgba(255,111,125,0)'); rg.addColorStop(1, 'rgba(255,111,125,0)');
  }
  x.fillStyle = rg; x.fillRect(0, 0, w, h);
  return c;
}
function dn3RbBuild() {
  const R = dn3RbGeo(); if (DN3_RBC.R === R && DN3_RBC.ghost) return;
  DN3_RBC.R = R; DN3_RBC.pad = R * 0.1; DN3_RBC.comp.clear(); DN3_RBC.band = [];
  DN3_RBC.ghost = dn3RbPaint(0, 'g');
}
function dn3RbBand(i) { let c = DN3_RBC.band[i]; if (!c) c = DN3_RBC.band[i] = dn3RbPaint(0, i); return c; }
function dn3RbComp(mask) { let c = DN3_RBC.comp.get(mask); if (!c) { if (DN3_RBC.comp.size > 10) DN3_RBC.comp.clear(); c = dn3RbPaint(mask, -1); DN3_RBC.comp.set(mask, c); } return c; }
const DN3_SWEEP = 2.2;
function dn3Rainbow(tm) {
  dn3RbBuild(); const R = DN3_RBC.R, pad = DN3_RBC.pad, cx = W * 0.44, cy = Math.min(DN3.hy + 0.035 * H, H * 0.62 + R * 0.05), dw = (R + pad) * 2, dh = (R + pad) + 2 / DN3_RBC.k;
  DN3.rcx = cx; DN3.rcy = cy;
  const fin = DN3.finT !== undefined ? smooth(clamp((now - DN3.finT) / 2.5, 0, 1)) : 0;
  let mask = 0, nOn = 0, swp = 0;
  for (let i = 0; i < 7; i++) { const t0 = DN3.rbT[i]; if (t0 === undefined || now < t0) continue; nOn++; if (now - t0 >= DN3_SWEEP) mask |= 1 << i; else swp |= 1 << i; }
  const ga = (1 - nOn / 7) * 0.13 + 0.03 * Math.sin(tm * 0.8);   // kayıp gökkuşağının çok soluk izi
  if (ga > 0.01) { g.globalAlpha = ga; g.drawImage(DN3_RBC.ghost, cx - R - pad, cy - R - pad, dw, dh); g.globalAlpha = 1; }
  const base = 0.6 + 0.15 * DN3.reg.tepe + 0.1 * fin, br = 0.92 + 0.08 * Math.sin(tm * 0.6);
  if (mask) {
    const c = dn3RbComp(mask); g.globalAlpha = base * br; g.drawImage(c, cx - R - pad, cy - R - pad, dw, dh);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = (0.12 + 0.08 * fin) * br; g.drawImage(c, cx - R - pad, cy - R - pad, dw, dh); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  }
  for (let i = 0; i < 7; i++) { if (!((swp >> i) & 1)) continue;   // yeni bant: soldan sağa çizilir, ucunda parlayan ışık
    const e = (now - DN3.rbT[i]) / DN3_SWEEP, q = dn3Ease(clamp(e / 0.8, 0, 1)), an = Math.PI + Math.PI * q, rc = R - (i + 0.5) * R * 0.034;
    g.save(); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R + pad, Math.PI - 0.02, an); g.closePath(); g.clip();
    g.globalAlpha = base * (0.85 + 0.6 * (1 - e)); g.drawImage(dn3RbBand(i), cx - R - pad, cy - R - pad, dw, dh);
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * (1 - e); g.drawImage(dn3RbBand(i), cx - R - pad, cy - R - pad, dw, dh); g.restore();
    g.globalAlpha = 1; g.globalCompositeOperation = 'lighter';
    if (q < 1) { const tx = cx + Math.cos(an) * rc, ty = cy + Math.sin(an) * rc; dn3Eg(DN3_RB[i], tx, ty, 70 * S, 70 * S, 0.6); dn3Eg('#ffffff', tx, ty, 22 * S, 22 * S, 0.9); }
    else dn3Eg(DN3_RB[i], cx + Math.cos(an) * rc, cy + Math.sin(an) * rc, 50 * S, 50 * S, 0.5 * (1 - clamp((e - 0.8) / 0.2, 0, 1)));
    g.globalCompositeOperation = 'source-over';
  }
  if (mask || swp) {   // yay boyunca kayan ışıltılar
    g.globalCompositeOperation = 'lighter';
    const n = 3 + Math.round(5 * fin);
    for (let j = 0; j < n; j++) { const u = (tm * (0.05 + 0.012 * j) + j * 0.37) % 1, bi = (j * 3) % 7; if (!((mask >> bi) & 1)) continue; const an = Math.PI + Math.PI * u, rc = R - (bi + 0.5) * R * 0.034, a = Math.sin(u * Math.PI);
      dn3Eg('#ffffff', cx + Math.cos(an) * rc, cy + Math.sin(an) * rc, 9 * S, 9 * S, 0.55 * a); dn3Eg(DN3_RB[bi], cx + Math.cos(an) * rc, cy + Math.sin(an) * rc, 30 * S, 30 * S, 0.25 * a); }
    g.globalCompositeOperation = 'source-over';
  }
}

// ═══════════ bulut kabarcığı (tüm katmanlarda aynı dil) ═══════════
function dn3Puff(x, cx, cy, r, hi, body, edge, a) {   // mat, yumuşak kabarcık (parlak top değil): ışık sağ-üstten geniş yayılır
  const gr = x.createRadialGradient(cx + r * 0.22, cy - r * 0.34, 0, cx, cy, r * 1.02);
  gr.addColorStop(0, hi); gr.addColorStop(0.55, body); gr.addColorStop(1, edge);
  x.globalAlpha = a; x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill(); x.globalAlpha = 1;
}
function dn3PuffFlat(x, cx, cy, r, hi, body) {   // uzak katmanlar: düz gövde, yalnız sağ-üstte geniş, yumuşak ışık (Gris sadeliği)
  x.fillStyle = body; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill();
  const gr = x.createRadialGradient(cx + r * 0.3, cy - r * 0.42, 0, cx + r * 0.3, cy - r * 0.42, r * 1.05); gr.addColorStop(0, hi); gr.addColorStop(0.55, dn3Hx(hi, 0.35)); gr.addColorStop(1, dn3Hx(hi, 0));
  x.save(); x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.clip(); x.fillStyle = gr; x.fillRect(cx - r, cy - r, r * 2, r * 2); x.restore();
}
function dn3Rim(x, cx, cy, r, col, a) {   // kenar ışığı: kabarcıktan ÖNCE sağ-üste kaymış disk; üstüne çizilen kabarcık yalnız ince bir hilal bırakır
  x.globalAlpha = a; x.fillStyle = col; x.beginPath(); x.arc(cx + r * 0.05 + 0.6, cy - r * 0.075 - 0.8, r, 0, 6.283); x.fill(); x.globalAlpha = 1;
}
const dn3Prof = (u, s) => 0.5 + 0.2 * Math.sin(6.2832 * u * 2 + s) + 0.15 * Math.sin(6.2832 * u * 3 + s * 1.7) + 0.09 * Math.sin(6.2832 * u * 7 + s * 2.3) + 0.05 * Math.sin(6.2832 * u * 13 + s * 0.7);

// ═══════════ paralaks katmanları: uzak bulut kuleleri, bulut denizi sıraları ═══════════
const DN3_LAY = [
  { kind: 'tower', bl: 0.38, f: 0.018, dr: 1.2, P: 3200, up: 330, dn: 60, yo: 6, lo: 0.12, rMin: 26, rMax: 52, hi: '#f6eaff', body: '#c4b4ea', edge: '#ab9ede', bot: '#c8b8ea', rim: '#ffe4cc', rimA: 0.35, seed: 11, hz: '#ffe2d0' },
  { kind: 'bank', bl: 0.42, f: 0.05, dr: 2.5, P: 2900, up: 120, dn: 70, yo: 14, lo: 0.25, rMin: 29, rMax: 61, hi: '#ffeef6', body: '#c4a2dc', edge: '#a88cd0', bot: '#c0a4dc', rim: '#ffd4b4', rimA: 0.45, seed: 23, hz: '#ffd8dc' },
  { kind: 'bank', bl: 0.5, f: 0.11, dr: 4, P: 2600, up: 120, dn: 90, yo: 44, lo: 0.25, rMin: 32, rMax: 67, hi: '#fff0ec', body: '#de9cc6', edge: '#b888c6', bot: '#d4a0cc', rim: '#ffd6a0', rimA: 0.55, seed: 37, hz: '#ffd6d8' },
  { kind: 'bank', bl: 0.55, f: 0.22, dr: 6, P: 2400, up: 130, dn: 120, yo: 96, lo: 0.3, rMin: 35, rMax: 72, hi: '#fff4e8', body: '#f0a8be', edge: '#cc8cbc', bot: '#e0a4c6', rim: '#ffe09c', rimA: 0.6, seed: 41, hz: '#ffdcd8' },
  { kind: 'bank', bl: 0.6, f: 0.4, dr: 9, P: 2200, up: 140, dn: 170, yo: 168, lo: 0.3, rMin: 38, rMax: 81, hi: '#fff8ee', body: '#f9bcc2', edge: '#d898c0', bot: '#e6b0ca', rim: '#fff0b0', rimA: 0.65, seed: 53, hz: '#f4c8dc' },
];
const dn3LayQ = L => clamp(H / VH * 0.55, 0.45, Math.min(1.3, 4200 / L.P));
function dn3PaintLayer(L) {
  L.q = dn3LayQ(L); const q = L.q * (L.bl || 0.5);   // düşük çözünürlükte boyanır: büyütülünce doğal yumuşaklık
  const w = Math.round(L.P * q), h = Math.round((L.up + L.dn) * q), c = L.cv && L.cv.width === w && L.cv.height === h ? L.cv : (L.cv = dn3Cv(w, h)), x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); x.setTransform(q, 0, 0, q, 0, 0); x.lineCap = 'round'; x.lineJoin = 'round';
  const R = rng(L.seed), foot = L.up, Pp = L.P, bottom = L.up + L.dn + 4;
  const hb = u => L.up * (L.lo + (1 - L.lo) * clamp(dn3Prof(((u % 1) + 1) % 1, L.seed), 0, 1));
  // kümülüs öbekleri: her öbek = kubbe + üstte daha küçük katlar; tek bir hacim ışığıyla gölgelenir (top top kabarcık değil)
  const cl = [], rows = L.kind === 'tower' ? [{ k: 1, b: 0, t: 3, wm: 1.5 }, { k: 0.3, b: 0.1, t: 1, wm: 0.9 }] : L.f < 0.08 ? [{ k: 1, b: 0, t: 2, wm: 1 }, { k: 0.45, b: 0.18, t: 1, wm: 0.9 }] : [{ k: 1, b: 0, t: 2, wm: 1 }, { k: 0.5, b: 0.22, t: 1, wm: 0.85 }];
  rows.forEach((row, ri) => { let px = -R() * 60;
    while (px < Pp) { const u = px / Pp, cw = L.rMax * (2.6 + R() * 2.6) * row.wm, chh = Math.max(L.up * 0.12, hb(u) * row.k * (0.7 + R() * 0.45)), base = foot + L.up * row.b + 4;
      cl.push({ cx: px, cw, chh, base, ri, tiers: row.t > 1 ? 1 + Math.floor(R() * row.t * 0.99) + (R() < 0.5 ? 1 : 0) : 1, sd: Math.floor(R() * 1e6) });
      px += cw * (0.45 + R() * 0.3); } });
  cl.sort((a, b) => a.ri - b.ri || b.chh - a.chh);
  const offs = [-Pp, 0, Pp], top0 = dn3Mix(L.body, L.hi, 0.3), base0 = dn3Mix(L.body, L.edge, 0.55);
  for (const C of cl) for (const o of offs) {
    const cx = C.cx + o; if (cx + C.cw < -40 || cx - C.cw > Pp + 40) continue;
    const RR = rng(C.sd), uni = new Path2D(), lobes = []; let topY = C.base;
    for (let t = 0; t < Math.min(3, C.tiers); t++) {   // katlar: alt kubbe geniş, üsttekiler daralır
      const tw = C.cw * (1 - t * 0.32), th = C.chh * (t ? 0.5 : 0.62), tb = C.base - C.chh * (t ? 0.42 + t * 0.2 : 0), tx = cx + (RR() - 0.5) * C.cw * 0.18 * t, n = t ? 3 + Math.floor(RR() * 2) : 5 + Math.floor(RR() * 3);
      for (let j = 0; j < n; j++) { const v = n > 1 ? j / (n - 1) : 0.5, sv = Math.sin(Math.PI * (0.08 + v * 0.84)), r = tw * (0.13 + 0.11 * sv) * (0.8 + RR() * 0.45), lx = tx + (v - 0.5) * tw * 0.86, ly = tb - th * (0.15 + 0.85 * Math.pow(sv, 0.9)) * (0.85 + RR() * 0.3) + r;
        uni.moveTo(lx + r, ly); uni.arc(lx, ly, r, 0, 6.283); lobes.push([lx, ly, r]); topY = Math.min(topY, ly - r); }
    }
    for (let j = 0; j < 4; j++) { const bx = cx + (j / 3 - 0.5) * C.cw * 0.8, br = C.cw * (0.13 + RR() * 0.04); uni.moveTo(bx + br, C.base); uni.arc(bx, C.base, br, 0, 6.283); }   // yuvarlak taban lobları (köşe yok)
    uni.rect(cx - C.cw * 0.4, C.base, C.cw * 0.8, bottom - C.base);
    // kenar ışığı: sağ-üste kaymış siluet
    x.save(); x.translate(1.6, -2.2); x.globalAlpha = L.rimA * (C.ri ? 0.3 : 0.6); x.fillStyle = L.rim; x.fill(uni); x.restore(); x.globalAlpha = 1;
    const gb = x.createLinearGradient(0, topY, 0, C.base + 10); gb.addColorStop(0, top0); gb.addColorStop(0.55, L.body); gb.addColorStop(1, base0); x.fillStyle = gb; x.fill(uni);
    x.save(); x.clip(uni);
    const lx0 = cx + C.cw * 0.2, ly0 = topY + (C.base - topY) * 0.15, lr = C.cw * 0.72, lg = x.createRadialGradient(lx0, ly0, 0, lx0, ly0, lr);
    lg.addColorStop(0, dn3Hx(L.hi, 0.7)); lg.addColorStop(0.45, dn3Hx(L.hi, 0.25)); lg.addColorStop(1, dn3Hx(L.hi, 0)); x.fillStyle = lg; x.fillRect(lx0 - lr, ly0 - lr, lr * 2, lr * 2);
    const sx0 = cx - C.cw * 0.42, sy0 = C.base, sr = C.cw * 0.62, sg = x.createRadialGradient(sx0, sy0, 0, sx0, sy0, sr);
    sg.addColorStop(0, dn3Hx(L.edge, 0.55)); sg.addColorStop(1, dn3Hx(L.edge, 0)); x.fillStyle = sg; x.fillRect(sx0 - sr, sy0 - sr, sr * 2, sr * 2);
    x.strokeStyle = L.edge; for (const lb of lobes) { if (lb[1] + lb[2] > C.base - C.chh * 0.1) continue; x.globalAlpha = 0.1; x.lineWidth = lb[2] * 0.08; x.beginPath(); x.arc(lb[0] - lb[2] * 0.04, lb[1] + lb[2] * 0.02, lb[2] * 0.96, 0.35, 2.75); x.stroke(); }
    x.globalAlpha = 1; x.restore();
  }
  // alt kısım: sis rengine karışan yumuşak geçiş (sis bandı katmana pişirilir; karede ayrıca çizilmez)
  const gf = x.createLinearGradient(0, foot - L.up * 0.1, 0, bottom); gf.addColorStop(0, dn3Hx(L.hz || L.bot, 0)); gf.addColorStop(0.45, dn3Hx(L.hz || L.bot, 0.55)); gf.addColorStop(1, dn3Hx(L.bot, 0.95));
  x.fillStyle = gf; x.fillRect(-10, foot - L.up * 0.1, Pp + 20, bottom - foot + L.up * 0.1 + 6);
}
function dn3LayFoot(L) { return DN3.hy + L.yo * S + DN3.dyS * L.f * 0.9; }
function dn3DrawLayer(L, alpha, tm) {
  if (!L.cv) return;
  const Pw = L.P * S, ox = ((-(cam.x * L.f + (DN3.drift || 0) * L.dr) * S) % Pw + Pw) % Pw, foot = dn3LayFoot(L), top = foot - L.up * S, dh = (L.up + L.dn) * S;
  if (top > H) return;
  g.globalAlpha = alpha;
  for (let x0 = ox - Pw; x0 < W; x0 += Pw) g.drawImage(L.cv, x0, top, Pw + 1, dh);
  g.globalAlpha = 1;
  const b = top + dh - 1; if (b < H && L === DN3_LAY[DN3_LAY.length - 1]) { g.fillStyle = L.bot; g.fillRect(0, b, W, H - b); }   // yalnız en yakın katman (üst üste dolgu yok)
}
const dn3Haze = (y, hgt, a, col) => dn3Eg(col, W * 0.5, y, W * 0.8, hgt, a);

// ═══════════ uzak yüzen adalar (minik ağaçlar, şelale ipliği) ═══════════
const DN3_ISL = [
  { u: 0.04, y: -150, s: 0.42, f: 0.03, v: 0, far: 1 }, { u: 0.21, y: -95, s: 0.26, f: 0.022, v: 1, far: 1 }, { u: 0.38, y: -215, s: 0.5, f: 0.04, v: 2, far: 1 },
  { u: 0.55, y: -120, s: 0.3, f: 0.026, v: 3, far: 1 }, { u: 0.7, y: -250, s: 0.62, f: 0.055, v: 1, far: 0 }, { u: 0.86, y: -170, s: 0.4, f: 0.035, v: 0, far: 1 },
  { u: 0.96, y: -300, s: 0.78, f: 0.075, v: 2, far: 0 },
];
const DN3_ISL_SPAN = 5200, dn3IslC = {};
function dn3IslSpr(v, far) {
  const key = v + '_' + far; if (dn3IslC[key]) return dn3IslC[key];
  const q = 1.6, w = 260, h = 330, ox = 130, oy = 120, c = dn3Cv(w * q, h * q), x = c.getContext('2d'), R = rng(v * 17 + 3);
  x.setTransform(q, 0, 0, q, ox * q, oy * q); x.lineCap = 'round'; x.lineJoin = 'round';
  const hw = 70 + v * 6, tip = 95 + R() * 40;
  // şelale (kayanın arkasından, kenardan dökülür)
  let wf = null;
  if (v !== 1) { const wx = hw * 0.62, L = 150 + R() * 40; wf = [wx, 4, L];
    const gr = x.createLinearGradient(0, 0, 0, L); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.5, 'rgba(240,248,255,0.55)'); gr.addColorStop(1, 'rgba(240,248,255,0)');
    x.fillStyle = gr; x.beginPath(); x.moveTo(wx - 3, 2); x.quadraticCurveTo(wx + 4, L * 0.4, wx - 1, L); x.lineTo(wx + 9, L); x.quadraticCurveTo(wx + 10, L * 0.4, wx + 4, 2); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(255,255,255,0.7)'; x.lineWidth = 1; x.beginPath(); x.moveTo(wx, 4); x.quadraticCurveTo(wx + 5, L * 0.4, wx + 2, L * 0.8); x.stroke(); }
  // kaya (alt koni)
  const rock = new Path2D(); rock.moveTo(-hw, 0);
  for (let i = 0; i <= 10; i++) { const u = i / 10, xx = lerp(-hw, 0, u) + (R() - 0.5) * 6, yy = Math.pow(u, 1.5) * tip * 0.9 + Math.sin(u * 9) * 3; rock.lineTo(xx * (1 - u * 0.25), yy); }
  rock.lineTo(6, tip);
  for (let i = 10; i >= 0; i--) { const u = i / 10, xx = lerp(hw, 0, u) + (R() - 0.5) * 6, yy = Math.pow(u, 1.5) * tip * 0.86 + Math.cos(u * 8) * 3; rock.lineTo(xx * (1 - u * 0.25) + 4, yy); }
  rock.closePath();
  const rg = x.createLinearGradient(0, 0, 0, tip); rg.addColorStop(0, '#c9b2de'); rg.addColorStop(0.5, '#a593cc'); rg.addColorStop(1, '#8a7ebc'); x.fillStyle = rg; x.fill(rock);
  x.save(); x.clip(rock);   // sağ yanda güneş ışığı, katman çizgileri
  const hl = x.createLinearGradient(-hw, 0, hw, 0); hl.addColorStop(0, 'rgba(120,100,180,0.35)'); hl.addColorStop(0.55, 'rgba(255,220,200,0)'); hl.addColorStop(1, 'rgba(255,214,180,0.55)'); x.fillStyle = hl; x.fillRect(-hw - 10, 0, hw * 2 + 30, tip + 10);
  x.strokeStyle = 'rgba(255,236,230,0.25)'; x.lineWidth = 1.4; for (let k = 1; k < 5; k++) { x.beginPath(); x.moveTo(-hw, k * 16); x.quadraticCurveTo(0, k * 16 + 6, hw, k * 16 - 2); x.stroke(); }
  x.restore();
  x.strokeStyle = 'rgba(140,200,160,0.7)'; x.lineWidth = 1.2; for (let k = 0; k < 6; k++) { const px = (R() - 0.5) * hw * 1.4, L = 10 + R() * 22; x.beginPath(); x.moveTo(px, 6); x.quadraticCurveTo(px + 3, L * 0.6, px - 1, L); x.stroke(); }
  // çimen başlık
  x.fillStyle = '#93cfa8'; x.beginPath(); x.ellipse(0, 4, hw + 4, 15, 0, 0, 6.283); x.fill();
  x.fillStyle = '#b6e6bd'; x.beginPath(); x.ellipse(0, 0, hw + 2, 12, 0, 0, 6.283); x.fill();
  x.fillStyle = 'rgba(232,255,214,0.8)'; x.beginPath(); x.ellipse(hw * 0.2, -4, hw * 0.75, 5, 0, 0, 6.283); x.fill();
  // minik ağaçlar
  const nt = v === 3 ? 1 : 2 + (v % 2); const tc = ['#ffc4d8', '#ffd9a6', '#bfeac0', '#f9b8de'];
  for (let t = 0; t < nt; t++) {
    const tx = (t / Math.max(1, nt - 1) - 0.5) * hw * 0.9 + (R() - 0.5) * 14, th = 18 + R() * 16, cr = 13 + R() * 9, col = tc[(v + t) % 4];
    x.strokeStyle = '#9b7fae'; x.lineWidth = 3; x.beginPath(); x.moveTo(tx, 0); x.quadraticCurveTo(tx + 2, -th * 0.5, tx, -th); x.stroke();
    const cg = x.createRadialGradient(tx + cr * 0.35, -th - cr * 0.5, 1, tx, -th, cr * 1.15); cg.addColorStop(0, dn3Mix(col, '#ffffff', 0.6)); cg.addColorStop(0.6, col); cg.addColorStop(1, dn3Mix(col, '#9a80c8', 0.4));
    x.fillStyle = cg; x.beginPath(); x.arc(tx, -th, cr, 0, 6.283); x.arc(tx - cr * 0.7, -th + cr * 0.35, cr * 0.65, 0, 6.283); x.arc(tx + cr * 0.72, -th + cr * 0.3, cr * 0.6, 0, 6.283); x.fill();
  }
  // kıyıyı saran küçük bulutlar
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const r = 10 + R() * 8; dn3Puff(x, sd * (hw - 4 + k * 9), 8 + k * 6, r, '#ffffff', '#fbe6ee', '#e2c8ea', 1); }
  if (far) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(206,184,234,0.42)'; x.fillRect(0, 0, c.width, c.height); x.globalCompositeOperation = 'source-over'; }
  return dn3IslC[key] = { c, ox, oy, w, h, wf };
}
function dn3Islands(tm, nearPass) {
  const span = DN3_ISL_SPAN;
  for (let i = 0; i < DN3_ISL.length; i++) {
    const I = DN3_ISL[i]; if (!!I.far === !!nearPass) continue;
    const wx = (((I.u * span - cam.x * I.f - tm * 1.5) % span) + span) % span - 400; if (wx > VW + 300) continue;
    const sp = dn3IslSpr(I.v, I.far), s = I.s * S, sx = wx * S, sy = DN3.hy + I.y * S + DN3.dyS * I.f * 0.9 + Math.sin(tm * 0.35 + i * 1.7) * 5 * S;
    if (sy - sp.oy * s > H || sy + (sp.h - sp.oy) * s < 0) continue;
    g.globalAlpha = I.far ? 0.92 : 1; g.drawImage(sp.c, sx - sp.ox * s, sy - sp.oy * s, sp.w * s, sp.h * s); g.globalAlpha = 1;
    if (sp.wf) {   // şelalenin altında sis + düşen ışıltılar
      g.globalCompositeOperation = 'lighter'; const fx = sx + (sp.wf[0] + 3) * s, fy = sy + sp.wf[1] * s, L = sp.wf[2] * s;
      dn3Eg('#ffffff', fx, fy + L * 0.85, 22 * s, 14 * s, 0.25);
      for (let k = 0; k < 3; k++) { const u = (tm * 0.45 + k / 3 + i * 0.13) % 1; dn3Eg('#ffffff', fx + Math.sin(u * 7 + k) * 2 * s, fy + u * L * 0.8, 5 * s, 7 * s, 0.5 * Math.sin(u * Math.PI)); }
      g.globalCompositeOperation = 'source-over';
    }
  }
}

// ═══════════ hayal bulutları: gökte tavşan, balina, ayıcık biçimli bulutlar (Bulut Şekilleri bölgesinde belirginleşir) ═══════════
const DN3_SHP = [
  [['e', 0, 0, 92, 58, 0], ['c', 82, -48, 44], ['e', 66, -128, 15, 46, -0.22], ['e', 102, -122, 15, 44, 0.28], ['c', -92, -12, 22], ['c', -44, 46, 26], ['c', 44, 48, 24], ['c', -30, -44, 40], ['c', 20, -50, 38]],   // tavşan
  [['e', 0, 0, 150, 58, 0], ['c', 90, -24, 52], ['c', 20, -40, 50], ['c', -60, -30, 44], ['e', -168, -36, 44, 16, -0.6], ['e', -170, 6, 44, 15, 0.5], ['c', 116, -96, 11], ['c', 100, -116, 14], ['c', 128, -118, 12], ['c', 112, -138, 10]],   // balina
  [['c', 0, 24, 80], ['c', 0, -70, 56], ['c', -44, -116, 23], ['c', 44, -116, 23], ['c', -78, 0, 30], ['c', 78, 0, 30], ['c', -40, 92, 30], ['c', 40, 92, 30]],   // ayıcık
  [['c', -50, 0, 48], ['c', 0, -20, 56], ['c', 50, 0, 48], ['c', -20, 30, 46], ['c', 30, 30, 44], ['c', 0, -60, 40], ['e', 98, -30, 34, 26, 0.2], ['e', 74, -52, 12, 22, -0.9], ['e', -40, 78, 10, 26, 0], ['e', 30, 80, 10, 26, 0]],   // kuzucuk
];
const dn3ShpC = [];
function dn3ShapeSpr(i) {
  if (dn3ShpC[i]) return dn3ShpC[i]; const q = 0.55, w = 460, h = 340, c = dn3Cv(w * q, h * q), x = c.getContext('2d'); x.setTransform(q, 0, 0, q, w * q / 2, h * q * 0.58);
  const P2 = new Path2D(); for (const sh of DN3_SHP[i]) { if (sh[0] === 'c') { P2.moveTo(sh[1] + sh[3], sh[2]); P2.arc(sh[1], sh[2], sh[3], 0, 6.283); } else { P2.moveTo(sh[1] + sh[3], sh[2]); P2.ellipse(sh[1], sh[2], sh[3], sh[4], sh[5], 0, 6.283); } }
  x.save(); x.translate(3, -4); x.fillStyle = 'rgba(255,224,170,0.7)'; x.fill(P2); x.restore();
  const gr = x.createLinearGradient(0, -170, 0, 130); gr.addColorStop(0, '#fffaf6'); gr.addColorStop(0.6, '#fbe4f0'); gr.addColorStop(1, '#e6cdec'); x.fillStyle = gr; x.fill(P2);
  x.save(); x.clip(P2); const lg = x.createRadialGradient(80, -110, 0, 80, -110, 260); lg.addColorStop(0, 'rgba(255,255,255,0.8)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = lg; x.fillRect(-230, -200, 460, 340); x.restore();
  return dn3ShpC[i] = { c, w, h, oy: h * 0.58 };
}
const DN3_SHI = [   // hayal bulutu örnekleri: [şekil, parallax yeri, ölçek, yükseklik (H oranı), bölge anahtarı]
  [0, 300, 0.5, 0.36, 'sekil'], [1, 1200, 0.56, 0.44, 'sekil'], [2, 2100, 0.5, 0.33, 'sekil'],
  [3, 400, 0.3, 0.3, 'cayir'], [3, 560, 0.24, 0.27, 'cayir'], [3, 1500, 0.28, 0.34, 'cayir'], [3, 2300, 0.26, 0.29, 'cayir'],
];
function dn3Shapes(tm) {
  const R = DN3.reg, span = 2700;
  for (let i = 0; i < DN3_SHI.length; i++) {
    const I = DN3_SHI[i], wgt = R[I[4]] || 0, a = (I[4] === 'sekil' ? 0.1 + 0.5 * wgt : 0.06 + 0.6 * wgt); if (a < 0.02) continue;
    const wx = (((I[1] - cam.x * 0.035 - (DN3.drift || 0) * 3) % span) + span) % span - 500; if (wx > VW + 300) continue;
    const sp = dn3ShapeSpr(I[0]), s = I[2] * S, sx = wx * S, sy = DN3.hy - I[3] * H + Math.sin(tm * (I[4] === 'cayir' ? 0.9 : 0.3) + i * 2) * (I[4] === 'cayir' ? 4 : 6) * S + DN3.dyS * 0.04;
    g.globalAlpha = a * (0.85 + 0.15 * Math.sin(tm * 0.5 + i)); g.drawImage(sp.c, sx - sp.w * s / 2, sy - sp.oy * s, sp.w * s, sp.h * s);
  }
  g.globalAlpha = 1;
}

// ═══════════ kuş siluetleri (uzakta, yavaş kanat çırpan küçük sürüler) ═══════════
const DN3_KUS = [{ y: 0.42, sp: 0.012, x0: 0.1, n: 4, s: 1, ph: 0 }, { y: 0.6, sp: 0.008, x0: 0.62, n: 3, s: 0.75, ph: 2 }, { y: 0.3, sp: 0.01, x0: 0.35, n: 2, s: 0.6, ph: 4 }];
function dn3Birds(tm) {
  g.strokeStyle = '#7d6aa6'; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let f = 0; f < DN3_KUS.length; f++) {
    const K = DN3_KUS[f], span = W * 1.6, bx = ((K.x0 * span + tm * K.sp * W - cam.x * 0.01 * S) % span + span) % span - W * 0.3, by = DN3.hy * K.y + Math.sin(tm * 0.3 + K.ph) * 10 * S;
    g.globalAlpha = 0.42 * (1 - DN3.fly * 0.5); g.lineWidth = Math.max(1, 1.5 * S * K.s); g.beginPath();
    for (let b = 0; b < K.n; b++) {
      const ox = bx - b * 26 * S * K.s, oy = by + (b % 2 ? 1 : -1) * Math.ceil(b / 2) * 9 * S * K.s + Math.sin(tm * 0.9 + b * 2.1) * 3 * S, w = 8 * S * K.s, fl = Math.sin(tm * 5.2 + b * 1.3 + K.ph);
      if (ox < -40 || ox > W + 40) continue;
      g.moveTo(ox - w, oy - fl * w * 0.5); g.quadraticCurveTo(ox - w * 0.45, oy - w * 0.35 - fl * w * 0.2, ox, oy); g.quadraticCurveTo(ox + w * 0.45, oy - w * 0.35 - fl * w * 0.2, ox + w, oy - fl * w * 0.5);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
}

let dn3CanyonC = null;
function dn3CanyonBake() {
  if (dn3CanyonC) return dn3CanyonC;
  const P = 2400, Ht = 300, Hb = 320;
  const cTop = dn3Cv(P, Ht), xt = cTop.getContext('2d');
  const cBot = dn3Cv(P, Hb), xb = cBot.getContext('2d');
  const Rt = rng(101), Rb = rng(202);
  const gap = u => smooth(clamp((Math.abs(u - 0.51) - 0.065) / 0.09, 0, 1));
  xt.lineCap = 'round'; xt.lineJoin = 'round';
  for (let px = 0; px < P; px += 35) {
    const u = px / P, gp = gap(u);
    if (gp <= 0.02) continue;
    const depth = (140 + Rt() * 110) * gp, r = (32 + Rt() * 45) * gp;
    for (let t = 0; t < 3; t++) {
      const ly = depth * (0.25 + t * 0.32), lr = r * (1 - t * 0.18);
      xt.save(); xt.translate(2, -2); xt.globalAlpha = 0.5; xt.fillStyle = '#ffda78';
      xt.beginPath(); xt.arc(px, ly, lr + 2.5, 0, 6.283); xt.fill(); xt.restore();
      const gr = xt.createRadialGradient(px + lr * 0.25, ly - lr * 0.3, 0, px, ly, lr);
      gr.addColorStop(0, '#fff4d4'); gr.addColorStop(0.5, '#ea9eb5'); gr.addColorStop(1, '#7a5a92');
      xt.fillStyle = gr; xt.beginPath(); xt.arc(px, ly, lr, 0, 6.283); xt.fill();
    }
    xt.fillStyle = '#7a5a92'; xt.fillRect(px - 20, 0, 42, depth * 0.4);
  }
  xb.lineCap = 'round'; xb.lineJoin = 'round';
  for (let px = 0; px < P; px += 35) {
    const u = px / P, gp = gap(u);
    if (gp <= 0.02) continue;
    const height = (160 + Rb() * 120) * gp, r = (35 + Rb() * 48) * gp, baseY = Hb;
    for (let t = 0; t < 3; t++) {
      const ly = baseY - height * (0.25 + t * 0.32), lr = r * (1 - t * 0.16);
      xb.save(); xb.translate(2, -2); xb.globalAlpha = 0.55; xb.fillStyle = '#ffd670';
      xb.beginPath(); xb.arc(px, ly, lr + 2.5, 0, 6.283); xb.fill(); xb.restore();
      const gr = xb.createRadialGradient(px + lr * 0.25, ly - lr * 0.3, 0, px, ly, lr);
      gr.addColorStop(0, '#fff6db'); gr.addColorStop(0.52, '#f0a4bd'); gr.addColorStop(1, '#825e98');
      xb.fillStyle = gr; xb.beginPath(); xb.arc(px, ly, lr, 0, 6.283); xb.fill();
    }
    xb.fillStyle = '#825e98'; xb.fillRect(px - 20, baseY - height * 0.4, 42, height * 0.5 + 4);
  }
  return dn3CanyonC = { top: cTop, bot: cBot, P, Ht, Hb };
}
function dn3DrawCanyon(tm) {
  const C = dn3CanyonBake();
  const fl = Math.max(DN3.fly, DN3.reg ? DN3.reg.ucus * 0.7 : 0);
  if (fl <= 0.01) return;
  const f = 0.55, Pw = C.P * S, ox = ((-(cam.x * f + (DN3.drift || 0) * 8) * S) % Pw + Pw) % Pw;
  const dhT = C.Ht * S, dhB = C.Hb * S;
  const topY = Math.min(0, (-cam.y * f * 0.25) * S);
  const botY = Math.max(H - dhB, H - dhB - (cam.y * f * 0.25) * S);
  g.globalAlpha = fl * 0.92;
  for (let x0 = ox - Pw; x0 < W; x0 += Pw) {
    g.drawImage(C.top, x0, topY, Pw + 1, dhT);
    g.drawImage(C.bot, x0, botY, Pw + 1, dhB);
  }
  g.globalAlpha = 1;
}

// ═══════════ dn3Background ═══════════
function dn3Hy() {
  const g0 = (DN3.GREF - cam.y) * S, ref = 0.7 * H; DN3.dyS = isFinite(g0) ? clamp(g0 - ref, -0.6 * H, 1.6 * H) : 0;
  return DN3.hy = clamp(0.56 * H + 0.25 * DN3.dyS, 0.3 * H, 0.86 * H);
}
function dn3LayStale(L) { return !L.cv || Math.abs(L.q - dn3LayQ(L)) > 0.001; }
function dn3Background(tm) {
  if (!dn3Ok()) return; if (!isFinite(tm)) tm = 0;
  if (!dn3Init()) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#f3b8a8'; g.fillRect(0, 0, W, H); return; }
  dn3Update(tm); dn3Region(); dn3FocusUpdate(); dn3SkyBuild();
  { let done = 0; for (const L of DN3_LAY) if (dn3LayStale(L)) { if (done++ < 1 || !L.cv && DN3.frames > 6) dn3PaintLayer(L); } if (!done) dn3SkyStep(); DN3.frames++; }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  const hy = dn3Hy(), S_ = DN3_SK, sky = dn3SkyComp(smooth(clamp(DN3.p, 0, 1)));
  const st = hy - S_.yh / S_.k, sh = sky.height / S_.k;
  if (st > 0) { g.fillStyle = DN3_SKYC.A[0]; g.fillRect(0, 0, W, st + 1); }
  g.drawImage(sky, 0, st, W, sh);
  if (st + sh < H) { g.fillStyle = DN3_SKYC.seaA[3]; g.fillRect(0, st + sh - 1, W, H - st - sh + 1); }
  dn3SunPos(); dn3Sun(tm);
  dn3Rainbow(tm);
  const reg = DN3.reg, fin = DN3.finT !== undefined ? smooth(clamp((now - DN3.finT) / 3, 0, 1)) : 0;
  dn3DrawLayer(DN3_LAY[0], 0.6 + 0.3 * reg.ucus, tm);
  dn3Haze(hy - 30 * S, 80 * S, 0.3, '#ffe2d0');
  dn3Shapes(tm);
  dn3Islands(tm, false);
  dn3DrawLayer(DN3_LAY[1], 1, tm);
  dn3Rays(tm, (0.17 + 0.22 * DN3.fly + 0.12 * reg.ucus + 0.1 * fin) * (1 - 0.35 * reg.tepe));
  dn3Birds(tm);
  dn3Islands(tm, true);
  dn3DrawLayer(DN3_LAY[2], 1, tm);
  g.globalCompositeOperation = 'lighter'; dn3Eg('#ffd8a8', DN3.sx, hy + 20 * S, W * (0.6 + 0.25 * DN3.fly), (120 + 40 * DN3.fly) * S, (0.22 + 0.12 * DN3.fly) + 0.1 * Math.sin(tm * 0.45)); g.globalCompositeOperation = 'source-over';   // güneşin bulut denizine vuran ışığı
  dn3DrawLayer(DN3_LAY[3], 1, tm);
  if (DN3.fly > 0.005 || (reg && reg.ucus > 0.02)) dn3DrawCanyon(tm);   // uçuş koridoru boyunca görkemli kanyon duvarları
  dn3DrawLayer(DN3_LAY[4], 1, tm);
  if (reg.a > 0.01 && reg.tepe < 0.99) { g.globalCompositeOperation = 'lighter'; dn3Eg(reg.hex, W * 0.5, hy + 60 * S, W * 0.8, 160 * S, 0.1 * reg.a * (1 - reg.tepe)); g.globalCompositeOperation = 'source-over'; }
  if (reg.tepe > 0.01) { dn3Eg('#ff9a86', W * 0.5, hy + 40 * S, W * 0.85, 240 * S, 0.2 * reg.tepe); dn3Eg('#ffb070', DN3.sx, hy, W * 0.5, 120 * S, 0.14 * reg.tepe); }   // Tepe: doygun mercan-altın ton (normal karışım; beyazlatmaz)
  if (fin > 0) { g.globalCompositeOperation = 'lighter'; dn3Eg('#fff0c8', W * 0.5, hy, W, H * 0.5, 0.08 * fin * (0.85 + 0.15 * Math.sin(tm * 1.3))); g.globalCompositeOperation = 'source-over'; }
}

// ═══════════ zemin: yumuşak bulut kütleleri (ızgara 1) ═══════════
const DN3_GC = [[0, '#fffbf4'], [16, '#fff1ee'], [44, '#ffe2ea'], [86, '#f8d0e4'], [140, '#e6c4ec'], [190, '#d2baee'], [240, '#c2b0ea']];
function dn3GA(d) { return d < 56 ? 1 : 1 - smooth(clamp((d - 56) / (DN3_DEPTH - 56), 0, 1)); }
const DN3_GCW = [[0, '#fff4e4'], [16, '#ffe6d8'], [44, '#ffd2cc'], [86, '#f9bccb'], [140, '#ebb2d6'], [190, '#d8aadc'], [240, '#c8a4e0']];   // Gökkuşağı Tepesi: sıcak altın-pembe
let dn3GPal = DN3_GC;
const DN3_TP = ['#ffffff', '#fff7f2', '#fde4ec', '#ffe0a0'], DN3_TPW = ['#fff8ec', '#ffeadc', '#fcd2d2', '#ffc878'];   // üst lob: açık, gövde, kenar, kenar ışığı
function dn3GColRGB(d) { const G = dn3GPal; let i = 0; while (i < G.length - 2 && d > G[i + 1][0]) i++; const a = G[i], b = G[i + 1], t = clamp((d - a[0]) / (b[0] - a[0]), 0, 1), A = hex(a[1]), B = hex(b[1]); return [lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t)]; }
function dn3BuildGCol() { DN3.gcol = []; DN3.gcolO = []; DN3.gcolW = []; for (let d = 0; d <= DN3_DEPTH; d += 5) { dn3GPal = DN3_GC; let c = dn3GColRGB(d); DN3.gcol.push(`rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${dn3GA(d).toFixed(3)})`); DN3.gcolO.push(`rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`); dn3GPal = DN3_GCW; c = dn3GColRGB(d); DN3.gcolW.push(`rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`); } dn3GPal = DN3_GC; }
const dn3GHex = d => { const c = dn3GColRGB(d); return '#' + ((1 << 24) | ((c[0] | 0) << 16) | ((c[1] | 0) << 8) | (c[2] | 0)).toString(16).slice(1); };
function dn3BuildComps() {
  const runs = [];
  for (let c = 0; c < COLS; c++) { const L = []; let r = 0; while (r < ROWS) { if (grid[r][c] !== 1) { r++; continue; } const a = r; while (r < ROWS && grid[r][c] === 1) r++; L.push({ t: a, b: r, u: false }); } runs.push(L); }
  const comps = [];
  for (let c = 0; c < COLS; c++) for (const run of runs[c]) {
    if (run.u) continue; run.u = true; const cols = [[run.t, run.b]]; let cur = run, cc = c;
    while (cc + 1 < COLS) { let best = null, bo = 0; for (const r2 of runs[cc + 1]) { const ov = Math.min(r2.b, cur.b) - Math.max(r2.t, cur.t); if (!r2.u && ov > 0 && (!best || ov > bo)) { best = r2; bo = ov; } } if (!best) break; best.u = true; cols.push([best.t, best.b]); cur = best; cc++; }   // en çok örtüşen (mağarada tavan değil zemin devam etsin)
    comps.push(dn3MakeComp(c, cols, comps.length));
  }
  DN3.comps = comps;
  let gb = -1e9, gt = 1e9; for (const C of comps) { gb = Math.max(gb, C.maxB); gt = Math.min(gt, C.minT); }
  DN3.GBOT = comps.length ? gb : DN3.LH; DN3.GTOP2 = comps.length ? gt : DN3.LH - 4 * T;
}
function dn3MakeComp(c0, cols, id) {
  const n = cols.length, x0 = c0 * T, x1 = (c0 + n) * T, R = rng(id * 977 + 13);
  const tops = cols.map(q => q[0] * T), bE = cols.map(q => Math.min(q[1] >= ROWS ? 1e6 : q[1] * T, q[0] * T + DN3_DEPTH)), real = cols.map(q => q[1] < ROWS && q[1] * T < q[0] * T + DN3_DEPTH);
  const ci = x => clamp(Math.floor(x / T) - c0, 0, n - 1);
  const N = Math.round((x1 - x0) / 4) + 1, xs = new Float32Array(N), st = new Float32Array(N), sb = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const x = Math.min(x1, x0 + i * 4); xs[i] = x; let s = 0, b = 0, w = 0;
    for (let k = -3; k <= 3; k++) { const wk = 4 - Math.abs(k), xx = clamp(x + k * 4, x0 + 0.5, x1 - 0.5), j = ci(xx); s += wk * tops[j]; b += wk * bE[j]; w += wk; }
    st[i] = s / w; sb[i] = Math.max(st[i] + 24, b / w);
  }
  const sf = new Float32Array(N); for (let i = 0; i < N; i++) { let a = 0, w = 0; for (let k = -12; k <= 12; k++) { const j = clamp(i + k, 0, N - 1), wk = 13 - Math.abs(k); a += st[j] * wk; w += wk; } sf[i] = a / w; }   // maske için çok yumuşak yüzey
  const path = new Path2D(); path.moveTo(xs[0], st[0]); for (let i = 1; i < N; i++) path.lineTo(xs[i], st[i]); for (let i = N - 1; i >= 0; i--) path.lineTo(xs[i], sb[i]); path.closePath();
  const sAt = x => st[clamp(Math.round((x - x0) / 4), 0, N - 1)], bAt = x => sb[clamp(Math.round((x - x0) / 4), 0, N - 1)];
  const top = [], back = [], hl = [], cr = [];
  for (let x = x0 + 4 + R() * 6; x < x1 - 4; x += 13 + R() * 11) { const r = 10 + R() * 11, cy = sAt(x) + r * 0.64; top.push({ x, y: cy, r, rim: R() < 0.85 }); if (R() < 0.45) cr.push({ x: x + (R() - 0.5) * 6, y: cy + r * 0.3, r: r * 1.05 }); }
  // dar bulut sütunları (≤2 sütun genişliğinde, iki yanı en az 1 kare alçak ya da bileşen ucu): iki ayrı yüz yığını yerine ortada tek, iri kabarcık kulesi
  const skipF = new Set(); let skipL = false, skipR = false;
  for (let a = 0; a < n;) { let b = a; while (b + 1 < n && tops[b + 1] === tops[a]) b++;
    const w = b - a + 1, lh = a === 0 || tops[a - 1] > tops[a] + T * 0.5, rh = b === n - 1 || tops[b + 1] > tops[a] + T * 0.5;
    if (w <= 2 && lh && rh && !(a === 0 && b === n - 1)) {
      const cx = x0 + (a + b + 1) * T / 2, loT = Math.max(a > 0 ? tops[a - 1] : tops[a] + 160, b < n - 1 ? tops[b + 1] : tops[a] + 160), hw = w * T / 2;
      let sg = R() < 0.5 ? 1 : -1; for (let y = tops[a] + 10; y < loT + 6; y += 24 + R() * 12) { const r = hw * (1 + R() * 0.4) + 8, u = (y - tops[a]) / Math.max(1, loT - tops[a]); sg = -sg; top.push({ x: cx + sg * hw * (0.1 + R() * 0.15), y: y + r * 0.3, r: r * (1 - u * 0.15), rim: u < 0.4 && sg > 0, d: (y - tops[a]) * 0.7 + 4 }); if (R() < 0.5) { const r2 = r * 0.55; top.push({ x: cx - sg * (hw + r2 * 0.3), y: y + r * 0.5, r: r2, rim: false, d: (y - tops[a]) * 0.7 + 14 }); } }
      if (a > 0) skipF.add(a - 1); else skipL = true; if (b < n - 1) skipF.add(b); else skipR = true; }
    a = b + 1; }
  for (let j = 0; j + 1 < n; j++) {   // iç basamaklar: dikey yüzü kabarcıklarla ört (düz kutu duvarı olmasın)
    const ta = tops[j], tb = tops[j + 1]; if (Math.abs(ta - tb) < T * 0.5 || skipF.has(j)) continue;
    const bx = (c0 + j + 1) * T, dir = ta < tb ? 1 : -1, hiT = Math.min(ta, tb), loT = Math.max(ta, tb);
    for (let y = hiT + 14; y < loT + 4; y += 19 + R() * 10) { const r = 15 + R() * 11; top.push({ x: bx + dir * (r * 0.25 + (R() - 0.5) * 12) - dir * 6, y: y + (R() - 0.5) * 6, r, rim: dir > 0 && R() < 0.35, d: y - hiT + 16 }); }
  }
  for (const sd of [-1, 1]) { const ex = sd < 0 ? x0 : x1, s0 = sAt(ex + (sd < 0 ? 2 : -2)), b0 = bAt(ex + (sd < 0 ? 2 : -2)); if (sd < 0 ? skipL : skipR) continue;
    top.push({ x: ex - sd * 5, y: s0 + 9, r: 13 + R() * 3, rim: true });
    for (let d = 14; d < Math.min(150, b0 - s0 - 4); d += 16 + R() * 8) { const r = Math.max(9, 22 + R() * 9 - d * 0.09); back.push({ x: ex + sd * r * 0.4, y: s0 + d + 4, r, d }); } }
  for (let x = x0 + 6; x < x1 - 6; x += 15 + R() * 9) { const i = clamp(Math.round((x - x0) / 4), 0, N - 1), j = ci(x); if (!real[j]) continue; const r = 10 + R() * 8; back.push({ x, y: sb[i] - r * 0.4, r, d: sb[i] - st[i], bot: true }); }
  for (let x = x0 + 10; x < x1 - 10; x += 22 + R() * 14) { const r = 14 + R() * 20; hl.push({ x: x + R() * 8, y: sAt(x) + 18 + R() * 50, r, a: 0.16 + R() * 0.14 }); }
  top.sort((a, b) => a.y - b.y);
  let minT = 1e9, maxB = -1e9; for (let i = 0; i < N; i++) { minT = Math.min(minT, st[i]); maxB = Math.max(maxB, sb[i]); }
  return { id, warm: dn3RegName((x0 + x1) / 2) === 'tepe', x0, x1, N, xs, st, sb, sf, path, top, back, hl, cr, minT, maxB: maxB + 16, sAt };
}
function dn3PaintTile(x, X0, X1) {
  const m0 = X0 - 70, m1 = X1 + 70;
  for (const C of DN3.comps) {
    if (C.x1 + 70 < X0 || C.x0 - 70 > X1) continue;
    dn3GPal = C.warm ? DN3_GCW : DN3_GC; const GCO = C.warm ? DN3.gcolW : DN3.gcolO, TP = C.warm ? DN3_TPW : DN3_TP;
    const i0 = Math.max(0, Math.floor((m0 - C.x0) / 4)), i1 = Math.min(C.N - 1, Math.ceil((m1 - C.x0) / 4));
    // 1) alt kabarcıklar (yüzen blokların altı; gövdenin arkasında)
    for (const p of C.back) { if (!p.bot || p.x < m0 || p.x > m1) continue; const d = clamp(p.d, 0, DN3_DEPTH); dn3Puff(x, p.x, p.y, p.r, dn3GHex(Math.max(0, d - 10)), dn3GHex(Math.min(DN3_DEPTH, d + 20)), dn3GHex(Math.min(DN3_DEPTH, d + 50)), 1); }
    // 2) gövde: yüzeyi izleyen kaydırılmış opak çizgilerle derinlik rengi
    x.save(); x.clip(C.path); x.lineJoin = 'round'; x.lineCap = 'butt';
    for (let k = GCO.length - 1; k >= 0; k--) { const d = k * 5, u = smooth(clamp(d / 70, 0, 1)); x.strokeStyle = GCO[k]; x.lineWidth = 7; x.beginPath(); for (let i = i0; i <= i1; i++) x.lineTo(C.xs[i], C.st[i] + (C.sf[i] - C.st[i]) * u + d); x.stroke(); }   // derinde basamak izleri yumuşasın
    for (const h of C.hl) { if (h.x < m0 || h.x > m1) continue; const rg = x.createRadialGradient(h.x + h.r * 0.2, h.y - h.r * 0.3, 0, h.x, h.y, h.r); rg.addColorStop(0, `rgba(255,255,255,${h.a})`); rg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.fillRect(h.x - h.r, h.y - h.r, h.r * 2, h.r * 2); }
    x.restore();
    // 3) uçlarda dışa taşan yan kabarcıklar (düz duvar olmasın)
    for (const p of C.back) { if (p.bot || p.x < m0 || p.x > m1) continue; const d = clamp(p.d, 0, DN3_DEPTH); dn3Puff(x, p.x, p.y, p.r, dn3GHex(Math.max(0, d - 20)), dn3GHex(Math.min(DN3_DEPTH, d + 10)), dn3GHex(Math.min(DN3_DEPTH, d + 60)), 1); }
    // 5) üst kabarcıklar: önce altın kenar diskleri, sonra mat pamuk loblar
    for (const p of C.top) { if (p.x < m0 || p.x > m1 || !p.rim) continue; dn3Rim(x, p.x, p.y, p.r, TP[3], 0.9); }
    for (const p of C.top) { if (p.x < m0 || p.x > m1) continue; if (p.d) dn3Puff(x, p.x, p.y, p.r, dn3GHex(Math.max(0, p.d * 0.5 - 10)), dn3GHex(Math.min(DN3_DEPTH, p.d * 0.6 + 8)), dn3GHex(Math.min(DN3_DEPTH, p.d * 0.7 + 30)), 1); else dn3Puff(x, p.x, p.y, p.r, TP[0], TP[1], TP[2], 1); }
    // 6) üst kenarda yumuşak sıcak ışıma
    x.globalCompositeOperation = 'lighter'; x.lineJoin = 'round'; x.lineCap = 'round';
    for (const [lw, a] of [[24, 0.04], [10, 0.06]]) { x.strokeStyle = `rgba(255,214,160,${a})`; x.lineWidth = lw; x.beginPath(); let pen = false; for (let i = i0; i <= i1; i++) { const fl = Math.abs(C.st[Math.min(C.N - 1, i + 1)] - C.st[Math.max(0, i - 1)]) < 3; if (fl) { pen ? x.lineTo(C.xs[i], C.st[i] - 8) : x.moveTo(C.xs[i], C.st[i] - 8); pen = true; } else pen = false; } x.stroke(); }   // yalnız düz yüzeylerde (basamak yüzünde dikey ışık şeridi olmasın)
    x.globalCompositeOperation = 'source-over';
  }
  dn3GPal = DN3_GC;
  dn3FadeMask(x, X0, X1);
}
// alta doğru şeffaflaşma: düşük çözünürlüklü alfa maskesi (1 piksel = 4 birim), her sütunun kendi yüzeyine göre; destination-out ile uygulanır (bant/dikiş yok)
let dn3MaskC = null;
function dn3FadeMask(x, X0, X1) {
  const G = dn3GGeo(), U = 4, xa = X0 - 60, cw = Math.ceil((X1 - X0 + 120) / U), ch = Math.ceil(G.TH / U) + 1;
  if (!dn3MaskC) dn3MaskC = dn3Cv(2, 2); if (dn3MaskC.width !== cw || dn3MaskC.height !== ch) { dn3MaskC.width = cw; dn3MaskC.height = ch; }
  const mx = dn3MaskC.getContext('2d'), im = mx.createImageData(cw, ch), D = im.data; let any = false;
  for (const C of DN3.comps) {
    if (C.x1 + 60 < xa || C.x0 - 60 > X1 + 60) continue;
    for (let i = 0; i < cw; i++) {
      const wx = xa + (i + 0.5) * U; if (wx < C.x0 - 52 || wx > C.x1 + 52) continue;
      const k = clamp(Math.round((wx - C.x0) / 4), 0, C.N - 1), s0 = C.sf[k], b0 = (wx < C.x0 || wx > C.x1) ? Math.min(s0 + DN3_DEPTH + 40, C.sb[k] + 40) : C.sb[k] + 26;   // uçların dışı: yalnız kendi gövdesinin derinliğine kadar (alttaki başka bulutu silmesin)
      if (b0 < s0 + 60) continue;
      const j0 = Math.max(0, Math.floor((s0 + 56 - G.y0) / U)), j1 = Math.min(ch - 1, Math.ceil((b0 - G.y0) / U));
      for (let j = j0; j <= j1; j++) { const d = G.y0 + (j + 0.5) * U - s0, a = 1 - dn3GA(d), o = (j * cw + i) * 4 + 3, v = Math.round(a * 255); if (v > D[o]) { D[o] = v; any = true; } }
    }
  }
  if (!any) return;
  mx.putImageData(im, 0, 0);
  x.save(); x.globalCompositeOperation = 'destination-out'; x.imageSmoothingEnabled = true; x.drawImage(dn3MaskC, xa, G.y0, cw * U, ch * U); x.restore();
}
const dn3GGeo = () => ({ y0: DN3.GTOP2 - 50, TH: DN3.GBOT + 20 - (DN3.GTOP2 - 50), sc: clamp(H / VH * 0.62, 0.55, 1.5) });
function dn3GMake(k, G) {
  let c = DN3.gc.get(k); if (c && c.sc === G.sc) return c;
  const cvs = c ? c.cv : dn3Cv(0, 0), PAD = 2, TW = DN3_TW; cvs.width = Math.round(TW * G.sc) + PAD * 2; cvs.height = Math.max(4, Math.round(G.TH * G.sc) + PAD * 2);
  const x = cvs.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cvs.width, cvs.height); x.setTransform(G.sc, 0, 0, G.sc, -k * TW * G.sc + PAD, -G.y0 * G.sc + PAD);
  dn3PaintTile(x, k * TW, (k + 1) * TW); c = { cv: cvs, sc: G.sc, pad: PAD }; DN3.gc.set(k, c); return c;
}
function dn3DrawGround() {
  if (!DN3.comps.length) return;
  const TW = DN3_TW, G = dn3GGeo(), sc = G.sc;
  const k0 = Math.floor(cam.x / TW), k1 = Math.floor((cam.x + VW) / TW), dir = cam.x >= (DN3.px == null ? cam.x : DN3.px) ? 1 : -1; DN3.px = cam.x;
  const sy0 = Math.round((G.y0 - cam.y) * S), sy1 = Math.round((G.y0 + G.TH - cam.y) * S);
  if (sy0 < H && sy1 > 0) for (let k = k0; k <= k1; k++) { if (k < -1 || k * TW > COLS * T) continue; const c = dn3GMake(k, G);
    const sx0 = Math.round((k * TW - cam.x) * S), sx1 = Math.round(((k + 1) * TW - cam.x) * S);
    g.drawImage(c.cv, c.pad, c.pad, c.cv.width - c.pad * 2, c.cv.height - c.pad * 2, sx0, sy0, sx1 - sx0 + 1, sy1 - sy0); }
  const ahead = dir > 0 ? k1 + 1 : k0 - 1;
  if (ahead >= 0 && ahead * TW < COLS * T && (!DN3.gc.get(ahead) || DN3.gc.get(ahead).sc !== sc)) dn3GMake(ahead, G);
  for (const key of DN3.gc.keys()) if (key < k0 - 3 || key > k1 + 3) { const c = DN3.gc.get(key); c.cv.width = c.cv.height = 0; DN3.gc.delete(key); }
}

// ═══════════ ince bulut şeridi (ızgara 2) ve LEVEL3 için bulut gövdesi ═══════════
function dn3SlabPaint(x, w, th, R, a) {   // (0,0) = sol uçta yürüme yüzeyi; gövde aşağı doğru th kalınlıkta. Tek siluet + hacim ışığı (inci dizisi değil)
  const top = new Path2D(), bot = new Path2D(), lobes = [];
  let px = -th * 0.15; while (px < w + th * 0.15) { const e = Math.min(px, w - px), big = R() < 0.3 ? 1.5 : 1, r = Math.max(th * 0.35, Math.min(th * 0.95, (th * 0.42 + R() * th * 0.3) * big * clamp(0.55 + e / (th * 2), 0.55, 1))); const cy = r * 0.66 + (e < th ? (th - e) * 0.18 : 0); top.moveTo(px + r, cy); top.arc(px, cy, r, 0, 6.283); lobes.push([px, cy, r]); px += r * (0.75 + R() * 0.45); }
  top.moveTo(th * 0.35, th * 0.5); top.rect(th * 0.2, th * 0.4, w - th * 0.4, th * 0.55);
  for (let qx = th * 0.4; qx < w - th * 0.3; qx += th * (0.5 + R() * 0.4)) { const r = th * (0.28 + R() * 0.18); bot.moveTo(qx + r, th * 0.86); bot.arc(qx, th * 0.86, r, 0, 6.283); }
  x.globalAlpha = a;
  x.fillStyle = '#d9c2ee'; x.fill(bot);   // alt lila kabarcıklar
  x.save(); x.translate(1.2, -1.6); x.fillStyle = '#ffdc96'; x.globalAlpha = 0.85 * a; x.fill(top); x.restore(); x.globalAlpha = a;
  const gr = x.createLinearGradient(0, -th * 0.3, 0, th * 1.1); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.4, '#fff0f2'); gr.addColorStop(0.75, '#f6d8ea'); gr.addColorStop(1, '#e2c8ee'); x.fillStyle = gr; x.fill(top);
  x.save(); x.clip(top);
  const lg = x.createRadialGradient(w * 0.7, -th * 0.2, 0, w * 0.7, -th * 0.2, Math.max(w * 0.6, th * 2)); lg.addColorStop(0, 'rgba(255,248,232,0.7)'); lg.addColorStop(1, 'rgba(255,248,232,0)'); x.fillStyle = lg; x.fillRect(-th, -th, w + th * 2, th * 3);
  x.strokeStyle = '#e6c6e2'; x.globalAlpha = 0.14 * a; for (const l of lobes) { x.lineWidth = l[2] * 0.12; x.beginPath(); x.arc(l[0], l[1], l[2] * 0.95, 0.4, 2.7); x.stroke(); }
  x.restore(); x.globalAlpha = 1;
}
const dn3SlabC = new Map();
function dn3SlabSpr(w, th, seed) {
  const key = Math.round(w / 4) + '_' + Math.round(th) + '_' + (seed | 0); let s = dn3SlabC.get(key); if (s) return s;
  if (dn3SlabC.size > 60) { for (const v of dn3SlabC.values()) v.c.width = v.c.height = 0; dn3SlabC.clear(); }
  const q = 2, pad = th * 0.8 + 6, c = dn3Cv((w + pad * 2) * q, (th * 1.8 + 16) * q), x = c.getContext('2d'); x.setTransform(q, 0, 0, q, pad * q, 10 * q); x.lineCap = 'round';
  dn3SlabPaint(x, w, th, rng(seed * 31 + Math.round(w)), 1);
  s = { c, ox: pad, oy: 10, w: w + pad * 2, h: th * 1.8 + 16 }; dn3SlabC.set(key, s); return s;
}
// LEVEL3 için: dünya dönüşümünde (x = orta, yUst = yürüme yüzeyi) w genişliğinde, h kalınlığında bulut. o: {alpha, sx (yatay ölçek), sy (dikey ölçek, basılınca esneme), seed}
function dn3Bulut(x, yUst, w, h, o) {
  if (!(w > 4) || !(h > 2)) return; const sp = dn3SlabSpr(w, h || 20, o && o.seed || 0), sx = o && o.sx || 1, sy = o && o.sy || 1, al = o && o.alpha != null ? o.alpha : 1;
  const ctx = (o && o.ctx) || g;
  ctx.save(); ctx.translate(x, yUst); ctx.scale(sx, sy); ctx.globalAlpha *= al; ctx.drawImage(sp.c, -w / 2 - sp.ox, -sp.oy, sp.w, sp.h); ctx.restore();
}
function dn3BuildPlats() {
  DN3.plats = [];
  for (let r = 0; r < ROWS; r++) { let c = 0; while (c < COLS) { if (grid[r][c] !== 2) { c++; continue; } const a = c; while (c < COLS && grid[r][c] === 2) c++; DN3.plats.push({ x0: a * T, x1: c * T, y: r * T, id: DN3.plats.length }); } }
}
function dn3DrawPlats(tm) {
  for (const p of DN3.plats) {
    if (p.x1 < cam.x - 60 || p.x0 > cam.x + VW + 60 || p.y < cam.y - 60 || p.y > cam.y + H / S + 60) continue;
    const w = p.x1 - p.x0, sp = dn3SlabSpr(w, 20, p.id + 1);
    g.globalCompositeOperation = 'lighter'; dn3Eg('#ffd8b8', (p.x0 + p.x1) / 2, p.y + 18, w * 0.6, 22, 0.12 + 0.04 * Math.sin(tm * 1.1 + p.id)); g.globalCompositeOperation = 'source-over';
    g.drawImage(sp.c, p.x0 - sp.ox, p.y - sp.oy, sp.w, sp.h);
  }
}

// ═══════════ zemin süsleri: bulut papatyaları, karahindiba, bulut otu, ışık yıldızları, gökkuşağı kristalleri ═══════════
const DN3_REGP = {
  pembeBulut: { f: 0.1, t: 0.12, w: 0.3, s: 0.05, r: 0, fc: ['#ffc0d8', '#ffffff', '#ffd8b0'] },
  kuzuCayir: { f: 0.34, t: 0.14, w: 0.3, s: 0.04, r: 0, fc: ['#ffffff', '#ffc8dc', '#fff0a8', '#d8c8ff'] },
  ruzgar: { f: 0.06, t: 0.28, w: 0.4, s: 0.03, r: 0, fc: ['#ffffff', '#c8e4ff'] },
  sekil: { f: 0.12, t: 0.1, w: 0.3, s: 0.06, r: 0, fc: ['#e0ccff', '#ffffff'] },
  bosluk: { f: 0.06, t: 0.1, w: 0.25, s: 0.04, r: 0, fc: ['#ffffff'] },
  ucus: { f: 0.06, t: 0.1, w: 0.25, s: 0.06, r: 0, fc: ['#ffe0a8'] },
  tepe: { f: 0.2, t: 0.06, w: 0.2, s: 0.08, r: 0.12, fc: ['#ffe8a0', '#ffffff', '#ffc8dc'] },
  '': { f: 0.12, t: 0.12, w: 0.3, s: 0.05, r: 0, fc: ['#ffffff', '#ffc8dc', '#ffe0b0'] },
};
const dn3DS = {};
function dn3DecoSpr(kind, v, col) {
  const key = kind + v + col; if (dn3DS[key]) return dn3DS[key];
  const q = 2.4, w = 70, h = 100, c = dn3DS[key] = dn3Cv(w * q, h * q), x = c.getContext('2d'), R = rng(v * 13 + 5 + col.charCodeAt(2)); x.setTransform(q, 0, 0, q, w * q / 2, h * q - 4); x.lineCap = 'round'; x.lineJoin = 'round';
  if (kind === 'f') {   // bulut papatyası
    const n = 1 + (v % 2);
    for (let j = 0; j < n; j++) { const H2 = 18 + R() * 18, lean = (R() - 0.5) * 10 + (j ? 8 : 0), bx = j * 7 - (n - 1) * 3;
      x.strokeStyle = '#8fcfa6'; x.lineWidth = 1.8; x.beginPath(); x.moveTo(bx, 2); x.quadraticCurveTo(bx + lean * 0.3, -H2 * 0.5, bx + lean, -H2); x.stroke();
      x.fillStyle = '#a6dcb4'; x.beginPath(); x.ellipse(bx + lean * 0.2 + 4, -H2 * 0.35, 5, 2, -0.5, 0, 6.283); x.fill();
      x.save(); x.translate(bx + lean, -H2); const np = 7, pr = 4.6 + R() * 1.5;
      for (let i = 0; i < np; i++) { x.save(); x.rotate(i / np * 6.283); x.fillStyle = col; x.beginPath(); x.ellipse(0, -pr, pr * 0.42, pr * 0.85, 0, 0, 6.283); x.fill(); x.fillStyle = 'rgba(255,255,255,0.55)'; x.beginPath(); x.ellipse(0, -pr * 1.1, pr * 0.16, pr * 0.45, 0, 0, 6.283); x.fill(); x.restore(); }
      x.fillStyle = '#ffcf5e'; x.beginPath(); x.arc(0, 0, pr * 0.45, 0, 6.283); x.fill(); x.fillStyle = 'rgba(255,255,255,0.6)'; x.beginPath(); x.arc(-pr * 0.12, -pr * 0.15, pr * 0.18, 0, 6.283); x.fill(); x.restore(); }
  } else if (kind === 't') {   // karahindiba (bulut tohumu)
    const H2 = 26 + R() * 18, lean = (R() - 0.5) * 8;
    x.strokeStyle = '#a8d4b4'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(0, 2); x.quadraticCurveTo(lean * 0.4, -H2 * 0.5, lean, -H2); x.stroke();
    x.translate(lean, -H2); const rr = 8 + R() * 3;
    const rg = x.createRadialGradient(0, 0, 0, 0, 0, rr * 1.3); rg.addColorStop(0, 'rgba(255,255,255,0.9)'); rg.addColorStop(0.6, 'rgba(255,250,250,0.5)'); rg.addColorStop(1, 'rgba(255,250,250,0)'); x.fillStyle = rg; x.beginPath(); x.arc(0, 0, rr * 1.3, 0, 6.283); x.fill();
    x.strokeStyle = 'rgba(255,255,255,0.85)'; x.lineWidth = 0.6; for (let i = 0; i < 22; i++) { const an = i / 22 * 6.283; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); x.stroke(); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(Math.cos(an) * rr, Math.sin(an) * rr, 0.9, 0, 6.283); x.fill(); }
    x.fillStyle = '#e8d8b8'; x.beginPath(); x.arc(0, 0, 1.6, 0, 6.283); x.fill();
  } else if (kind === 'w') {   // bulut otu: kıvrık beyaz tutamlar
    const n = 3 + v % 3;
    for (let i = 0; i < n; i++) { const an = (i - (n - 1) / 2) * 0.32 + (R() - 0.5) * 0.2, L = 12 + R() * 14, ex = Math.sin(an) * L, ey = -Math.cos(an) * L, cu = an > 0 ? 1 : -1;
      x.strokeStyle = 'rgba(214,190,236,0.7)'; x.lineWidth = 3.2; x.beginPath(); x.moveTo(i - n / 2, 3); x.bezierCurveTo(ex * 0.3, ey * 0.6 + 1, ex + cu * 5, ey + 1, ex + cu * 2, ey + 5); x.stroke();
      x.strokeStyle = '#ffffff'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(i - n / 2, 2); x.bezierCurveTo(ex * 0.3, ey * 0.6, ex + cu * 5, ey, ex + cu * 2, ey + 4); x.stroke(); }
  } else if (kind === 'r') {   // gökkuşağı kristali
    x.globalCompositeOperation = 'lighter'; x.drawImage(glow('#fff0c0'), -26, -40, 52, 52); x.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 4; i++) { const col2 = DN3_RB[(v * 2 + i * 2) % 7], hh = 10 + R() * 14, an = (i - 1.5) * 0.3; x.save(); x.translate((i - 1.5) * 4, 2); x.rotate(an); x.fillStyle = dn3Hx(col2, 0.85); x.beginPath(); x.moveTo(-3, 0); x.lineTo(-1.5, -hh); x.lineTo(0, -hh - 3); x.lineTo(1.6, -hh); x.lineTo(3, 0); x.closePath(); x.fill(); x.fillStyle = 'rgba(255,255,255,0.65)'; x.beginPath(); x.moveTo(-1, -1); x.lineTo(-0.6, -hh + 1); x.lineTo(0.5, -1); x.fill(); x.restore(); }
  } else {   // ışık yıldızı (yere konmuş küçük parıltı)
    x.globalCompositeOperation = 'lighter'; x.drawImage(glow(col), -14, -24, 28, 28);
    const st = (L2, wd) => { x.beginPath(); x.moveTo(0, -10 - L2); x.quadraticCurveTo(wd, -10 - wd, L2, -10); x.quadraticCurveTo(wd, -10 + wd, 0, -10 + L2); x.quadraticCurveTo(-wd, -10 + wd, -L2, -10); x.quadraticCurveTo(-wd, -10 - wd, 0, -10 - L2); x.fill(); };
    x.fillStyle = dn3Hx(col, 0.9); st(7, 1.4); x.fillStyle = '#ffffff'; st(3.5, 0.8); x.globalCompositeOperation = 'source-over';
  }
  return c;
}
function dn3BuildDeco() {
  const R = rng(321); DN3.deco = [];
  for (const C of DN3.comps) {
    for (let x = C.x0 + 14; x < C.x1 - 14; x += 9 + R() * 12) {
      // yüzeyin üstü boş olmalı (bir hücre yukarısı)
      const c = Math.floor(x / T), tr = Math.round(C.sAt(x) / T); if (tr - 1 >= 0 && grid[tr - 1] && grid[tr - 1][c]) continue; if (Math.abs(C.sAt(x + 10) - C.sAt(x - 10)) > 6) continue;   // basamak yüzüne süs konmaz
      const RP = DN3_REGP[dn3RegName(x)] || DN3_REGP[''], y = C.sAt(x) + 3, pick = a => a[Math.floor(R() * a.length)], u = R();
      let k = null, s = 0.8 + R() * 0.45;
      if (u < RP.r) k = 'r'; else if (u < RP.r + RP.f) k = 'f'; else if (u < RP.r + RP.f + RP.t) k = 't'; else if (u < RP.r + RP.f + RP.t + RP.s) k = 's'; else if (u < RP.r + RP.f + RP.t + RP.s + RP.w) k = 'w';
      if (!k) continue;
      DN3.deco.push({ k, v: Math.floor(R() * 3), x, y: k === 's' ? y - 2 : y, ph: R() * 6.283, s, c: k === 's' ? pick(['#ffe8a0', '#ffd0e8', '#ffffff']) : pick(RP.fc) });
    }
  }
  DN3.deco.sort((a, b) => a.x - b.x);
}
function dn3DrawDeco(tm) {
  const D = DN3.deco, vx0 = cam.x - 50, vx1 = cam.x + VW + 50, wind = DN3.reg.wind;
  let lo = 0, hi = D.length; while (lo < hi) { const m = (lo + hi) >> 1; if (D[m].x < vx0) lo = m + 1; else hi = m; }
  for (let i = lo; i < D.length && D[i].x < vx1; i++) {
    const d = D[i], sp = dn3DecoSpr(d.k, d.v, d.c), sw = d.k === 'r' || d.k === 's' ? 0 : Math.sin(tm * (1.1 + wind) + d.ph + d.x * 0.01) * (0.07 + 0.08 * wind) + wind * 0.12;
    const fc = dn3Foc((d.x - cam.x) * S, (d.y - 20 - cam.y) * S);
    g.save(); g.translate(d.x, d.y); g.rotate(sw); g.scale(d.s, d.s); g.globalAlpha = 0.45 + 0.55 * fc; g.drawImage(sp, -35, -96, 70, 100); g.restore(); g.globalAlpha = 1;
    if (d.k === 's' || d.k === 'r') { const pul = 0.55 + 0.45 * Math.sin(tm * 1.6 + d.ph); g.globalCompositeOperation = 'lighter'; dn3Eg(d.k === 'r' ? '#fff0c0' : d.c, d.x, d.y - 10 * d.s, 18 * d.s * (0.7 + pul * 0.4), 18 * d.s * (0.7 + pul * 0.4), 0.3 * pul * fc); g.globalCompositeOperation = 'source-over'; }
  }
}

// ═══════════ zemin ile önündeki nesnelerin buluşması (LEVEL3 gökkuşağı rampası için) ═══════════
// dn3ZeminKirp(x0, x1): bulut zeminin GÖRÜNEN (yumuşatılmış, kabarık) yüzeyinin üstünü kapsayan Path2D (dünya koordinatı; boşluklarda aşağı iner).
// dn3ZeminOn(x0, x1): aynı aralıkta zeminin üst kabarcık bandını (yüzeyin ~34 birim üstü / ~30 altı) önbellekli zemin parçalarından ÖNE yeniden çizer
// (dünya dönüşümü kurulu olmalı). Kullanım (bulut.js gokkusagi): ciz'de clip(dn3ZeminKirp(...)) ile yay çiz, cizOn'da dn3ZeminOn(...) → yayın ayakları kabarık bulutun içine girer.
const dn3ZK = new Map();
function dn3ZeminKirp(x0, x1) {
  if (!dn3Init()) return null; const key = Math.round(x0) + '_' + Math.round(x1); let p = dn3ZK.get(key); if (p) return p.k;
  const k = new Path2D(), b = new Path2D(), deep = DN3.LH + 400; k.moveTo(x0, -3000); k.lineTo(x1, -3000);
  const pts = []; for (let x = x1; x >= x0; x -= 4) { let y = deep; for (const C of DN3.comps) { if (x < C.x0 - 2 || x > C.x1 + 2) continue; const i = clamp(Math.round((x - C.x0) / 4), 0, C.N - 1); y = Math.min(y, C.st[i] + 14); } pts.push([x, y]); }
  for (const q of pts) k.lineTo(q[0], q[1]); k.closePath();
  for (const C of DN3.comps) { if (C.x1 < x0 || C.x0 > x1) continue; const a = Math.max(0, Math.floor((x0 - C.x0) / 4)), e = Math.min(C.N - 1, Math.ceil((x1 - C.x0) / 4)); if (e <= a) continue;
    const mn = i => { let v = 1e9; for (let j = Math.max(0, i - 10); j <= Math.min(C.N - 1, i + 10); j++) v = Math.min(v, C.st[j]); return v; }, mx = i => { let v = -1e9; for (let j = Math.max(0, i - 10); j <= Math.min(C.N - 1, i + 10); j++) v = Math.max(v, C.st[j]); return v; };   // basamakta bant yüzü de kapsasın
    b.moveTo(C.xs[a] - 30, mn(a) - 34); for (let i = a; i <= e; i++) b.lineTo(C.xs[i], mn(i) - 34); b.lineTo(C.xs[e] + 30, mn(e) - 34); b.lineTo(C.xs[e] + 30, mx(e) + 30); for (let i = e; i >= a; i--) b.lineTo(C.xs[i], mx(i) + 30); b.lineTo(C.xs[a] - 30, mx(a) + 30); b.closePath(); }
  dn3ZK.set(key, { k, b }); return k;
}
function dn3ZeminOn(x0, x1) {
  if (!dn3Ok() || !dn3Init() || !DN3.gc) return; dn3ZeminKirp(x0, x1); const Z = dn3ZK.get(Math.round(x0) + '_' + Math.round(x1)); if (!Z) return;
  const G = dn3GGeo(), TW = DN3_TW, a = Math.max(Math.floor(Math.max(x0, cam.x) / TW), 0), e = Math.floor(Math.min(x1, cam.x + VW) / TW);
  g.save(); g.clip(Z.b); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  for (let k = a; k <= e; k++) { const c = dn3GMake(k, G); g.drawImage(c.cv, c.pad, c.pad, c.cv.width - c.pad * 2, c.cv.height - c.pad * 2, k * TW, G.y0, TW, G.TH); }
  g.restore();
}

// ═══════════ Gökkuşağı Tepesi: özel ışık (dünya dönüşümünde) ═══════════
function dn3Tepe(tm) {
  const B = dn3Bolum(); if (!B || !B.gokkusagi || !isFinite(B.gokkusagi.x)) return;
  const gx = B.gokkusagi.x, gy = isFinite(B.gokkusagi.y) ? B.gokkusagi.y : DN3.GREF; if (gx < cam.x - 700 || gx > cam.x + VW + 700) return;
  const fin = DN3.finT !== undefined ? smooth(clamp((now - DN3.finT) / 2, 0, 1)) : 0, a = ((0.35 + 0.65 * DN3.f) * (0.85 + 0.15 * Math.sin(tm * 0.9)) + fin * 0.3) * 0.55;
  // doygun sıcak altın-pembe (beyaz yıkama yok): önce normal karışımla renk, sonra çok hafif ışık
  dn3Eg('#ff9a7a', gx, gy - 200, 260 + 60 * fin, 380, 0.16 * a);
  dn3Eg('#ffb060', gx, gy + 6, 300, 50, 0.22 * a);
  g.globalCompositeOperation = 'lighter';
  dn3Eg('#ffb070', gx, gy - 240, 110 + 40 * fin, 380, 0.12 * a);   // gökten inen ışık sütunu (sıcak)
  for (let k = 0; k < 9; k++) { const u = (tm * (0.12 + k * 0.013) + k / 9) % 1, xx = gx + Math.sin(k * 2.3 + tm * 0.4) * (60 + k * 9), yy = gy - u * 320;
    dn3Eg(k % 3 === 0 ? DN3_RB[k % 7] : '#ffc890', xx, yy, 7 + (k % 3) * 3, 7 + (k % 3) * 3, 0.5 * Math.sin(u * Math.PI) * a); }
  g.globalCompositeOperation = 'source-over';
}

let dn3ShadeC = null;
function dn3ShadeSpr() { if (dn3ShadeC) return dn3ShadeC; const c = dn3ShadeC = dn3Cv(128, 154), x = c.getContext('2d'); x.translate(64, 77); x.scale(1, 1.2); const rg = x.createRadialGradient(0, 0, 0, 0, 0, 64); rg.addColorStop(0, 'rgba(96,58,128,0.55)'); rg.addColorStop(0.45, 'rgba(110,70,140,0.32)'); rg.addColorStop(1, 'rgba(140,96,170,0)'); x.fillStyle = rg; x.fillRect(-64, -64, 128, 128); return c; }
// ═══════════ dn3World: zemin → şeritler → süsler (karakterlerin arkası) ═══════════
function dn3World(tm) {
  if (!dn3Ok() || !dn3Init()) return; if (!isFinite(tm)) tm = 0;
  if (!DN3.reg) dn3Region();
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  dn3DrawGround();
  g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S); g.lineCap = 'round'; g.lineJoin = 'round';
  dn3DrawPlats(tm); dn3DrawDeco(tm); dn3Tepe(tm);
  if (DN3F.on && !(typeof P !== 'undefined' && P.ucus)) {   // Feza'nın arkasında yumuşak mor-gül gölge alanı: açık bulutların üstünde karakter seçilsin (önbellekli sprite)
    g.setTransform(1, 0, 0, 1, 0, 0); const sp = dn3ShadeSpr(); g.globalAlpha = 0.85; g.drawImage(sp, DN3F.x - 105 * S, DN3F.y - 125 * S, 210 * S, 250 * S); g.globalAlpha = 1;
    g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
  }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// ═══════════ ışık tozları (sıcak altın-pembe), rüzgâr/uçuş çizgileri ═══════════
const DN3_MOT = (() => { const R = rng(19), a = []; for (let i = 0; i < 80; i++) a.push({ x: R() * 4000, y: R() * 700, z: 0.3 + R() * 1.3, ph: R() * 6.28, sp: 0.4 + R(), c: R(), cl: -1 });
  for (let k = 0; k < 10; k++) { const cx = R() * 4000, cy = R() * 600, z = 0.5 + R() * 1.1, c = R(); for (let j = 0; j < 6; j++) a.push({ x: cx, y: cy, ox: (R() - 0.5) * 60, oy: (R() - 0.5) * 40, orb: 6 + R() * 16, z, ph: R() * 6.28, sp: 0.25 + R() * 0.2, c, cl: k }); }
  for (let i = 0; i < 8; i++) a.push({ x: R() * 4000, y: R() * 600, z: 1.5 + R() * 0.4, ph: R() * 6.28, sp: 0.3 + R() * 0.4, c: R(), cl: -1, bk: true }); return a; })();
const DN3_MC = ['#fff2c4', '#ffd2e2', '#ffffff', '#ffe0a4', '#f0d8ff'];
const DN3_WL = (() => { const R = rng(5), a = []; for (let i = 0; i < 16; i++) a.push({ y: R(), z: 0.7 + R() * 1.1, ph: R() * 50, L: 60 + R() * 140, sp: 0.6 + R() * 0.8 }); return a; })();
function dn3Motes(tm, zMin, zMax) {
  if (!dn3Ok()) return; if (!isFinite(tm)) tm = 0; if (!DN3.reg) return;
  g.setTransform(S, 0, 0, S, 0, 0); g.globalCompositeOperation = 'lighter';
  const wrap = VW * 1.4, hv = H / S + 140, vh = H / S, wind = DN3.reg.wind, fly = DN3.fly;
  for (let i = 0; i < DN3_MOT.length; i++) {
    const m = DN3_MOT[i]; if (m.z < zMin || m.z >= zMax) continue; if (!m.bk && m.cl < 0 && i % 3 === 0) continue;
    const bx = m.x + (m.cl >= 0 ? Math.sin(tm * 0.22 * m.sp + m.cl) * 120 + Math.cos(tm * m.sp + m.ph) * m.orb + m.ox : Math.sin(tm * 0.3 * m.sp + m.ph) * 30) + tm * (wind * 60 + 4) * m.z;
    const x = ((bx - cam.x * m.z) % wrap + wrap) % wrap - VW * 0.2; if (x < -50 || x > VW + 50) continue;
    const by = m.y + (m.cl >= 0 ? Math.sin(tm * 0.34 * m.sp + m.cl * 2) * 50 + Math.sin(tm * m.sp * 0.8 + m.ph) * m.orb * 0.6 + m.oy : 0) - tm * (m.cl >= 0 ? 4 : 8) * m.sp;
    const y = ((by - cam.y * m.z) % hv + hv) % hv - 60; if (y < -50 || y > vh + 50) continue;
    const tw = 0.5 + 0.5 * Math.sin(tm * 2 * m.sp + m.ph), col = DN3_MC[Math.floor(m.c * DN3_MC.length) % DN3_MC.length];
    const fc = dn3Foc(x * S, y * S), fq = zMin >= 0.75 ? fc * fc : fc;
    if (m.bk) { const r = 16 + m.z * 12; dn3Eg(col, x, y, r, r, (0.05 + tw * 0.04) * fc); continue; }
    const r = (2 + m.z * 3.4) * (0.6 + tw * 0.6); dn3Eg(col, x, y, r, r, (0.2 + tw * 0.35) * fq);
  }
  // rüzgâr yolu: hafif kıvrılan hava sarmalları (Ghibli tarzı rüzgâr kıvrımı)
  if (wind > 0.05 && zMin >= 0.75) {
    g.strokeStyle = '#ffffff'; g.lineCap = 'round'; g.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const span = VW + 500, x0 = ((tm * (55 + i * 12) + i * 337 - cam.x * 0.6) % span + span) % span - 250, y0 = ((i * 0.27 + 0.12) % 1) * vh * 0.7 + Math.sin(tm * 0.6 + i) * 14 - cam.y * 0.1 % 1;
      const a = wind * 0.32 * Math.sin(clamp((x0 + 250) / span, 0, 1) * Math.PI) * dn3Foc(x0 * S, y0 * S); if (a < 0.02) continue;
      g.globalAlpha = a; g.beginPath(); g.moveTo(x0 - 140, y0 + 10);
      g.bezierCurveTo(x0 - 90, y0 + 14, x0 - 40, y0 + 6, x0, y0);   // gelen kuyruk
      for (let k = 0; k <= 24; k++) { const th = k / 24 * 5.2, r = 22 * (1 - k / 30); g.lineTo(x0 + Math.sin(th) * r, y0 - r + Math.cos(th) * r); }
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  // rüzgâr yolu ve uçuşta: ince, hızlı akan hava çizgileri
  const wa = Math.max(wind * 0.8, fly); if (wa > 0.02) {
    g.strokeStyle = '#ffffff'; g.lineCap = 'round';
    for (let i = 0; i < DN3_WL.length; i++) { const L = DN3_WL[i]; if (L.z < zMin || L.z >= zMax) continue;
      const span = VW + 400, sp = (90 + fly * 260) * L.sp * L.z, x = span - (((tm * sp + L.ph * 97 + cam.x * L.z * 0.5) % span) + span) % span - 200, y = ((L.y * vh * 1.1 - cam.y * L.z * 0.2) % vh + vh) % vh;
      const ln = L.L * (0.6 + fly * 0.8), a = wa * 0.16 * Math.sin(clamp((x + 200) / span, 0, 1) * Math.PI) * dn3Foc(x * S, y * S);
      if (a < 0.01) continue; g.globalAlpha = a; g.lineWidth = 1.2 + L.z;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + ln * 0.5, y - 4 - wind * 6 * Math.sin(tm + i), x + ln, y + 2); g.stroke(); }
    g.globalAlpha = 1;
  }
  g.globalCompositeOperation = 'source-over';
}

// ═══════════ dn3Petals: karakterlerin önünde süzülen karahindiba tohumları + final ışıltıları ═══════════
let dn3SeedC = null;
function dn3SeedSpr() {
  if (dn3SeedC) return dn3SeedC; const c = dn3SeedC = dn3Cv(48, 64), x = c.getContext('2d'); x.translate(24, 22); x.lineCap = 'round';
  x.strokeStyle = 'rgba(255,255,255,0.9)'; x.lineWidth = 0.9; for (let i = 0; i < 11; i++) { const an = -Math.PI + i / 10 * Math.PI; x.beginPath(); x.moveTo(0, 6); x.lineTo(Math.cos(an) * 14, Math.sin(an) * 12 + 2); x.stroke(); }
  const rg = x.createRadialGradient(0, -2, 0, 0, -2, 16); rg.addColorStop(0, 'rgba(255,255,255,0.55)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.beginPath(); x.arc(0, -2, 16, 0, 6.283); x.fill();
  x.strokeStyle = 'rgba(232,214,190,0.95)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, 6); x.lineTo(0, 26); x.stroke(); x.fillStyle = '#d8c0a0'; x.beginPath(); x.ellipse(0, 28, 1.6, 3, 0, 0, 6.283); x.fill();
  return c;
}
const DN3_SEED = (() => { const R = rng(888), a = []; for (let i = 0; i < 9; i++) a.push({ x: R() * 3000, y: R() * 600, z: 0.9 + R() * 0.6, ph: R() * 6.28, s: 0.6 + R() * 0.5 }); return a; })();
function dn3Petals(tm) {
  if (!dn3Ok() || !DN3.reg) return; if (!isFinite(tm)) tm = 0;
  g.setTransform(S, 0, 0, S, 0, 0); g.globalCompositeOperation = 'source-over';
  const sp = dn3SeedSpr(), wrap = VW * 1.5, hv = H / S + 160, wind = DN3.reg.wind;
  for (let i = 0; i < DN3_SEED.length; i++) {
    const d = DN3_SEED[i], bx = d.x + tm * (14 + wind * 70) * d.z + Math.sin(tm * 0.5 + d.ph) * 30, x = ((bx - cam.x * d.z) % wrap + wrap) % wrap - VW * 0.25; if (x < -40 || x > VW + 40) continue;
    const by = d.y - tm * 9 * d.z + Math.sin(tm * 0.7 + d.ph * 2) * 18, y = ((by - cam.y * d.z) % hv + hv) % hv - 80; if (y < -40 || y > H / S + 40) continue;
    const fc = dn3Foc(x * S, y * S); g.globalAlpha = 0.75 * fc * fc; if (g.globalAlpha < 0.03) continue;
    g.save(); g.translate(x, y); g.rotate(Math.sin(tm * 0.8 + d.ph) * 0.35 + wind * 0.5); g.scale(d.s * 0.5, d.s * 0.5); g.drawImage(sp, -24, -22, 48, 64); g.restore();
  }
  g.globalAlpha = 1;
  if (DN3.finT !== undefined) {   // gökkuşağı finali: renkli ışıltı yağmuru
    const e = now - DN3.finT, a = smooth(clamp(e / 1.5, 0, 1)) * (DN3.tamT !== undefined ? clamp(1 - (now - DN3.tamT) / 5, 0.35, 1) : 1); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) { const u = (tm * (0.08 + (i % 5) * 0.012) + i * 0.137) % 1, x = ((i * 0.381 + Math.sin(tm * 0.2 + i) * 0.03) % 1) * VW, y = -20 + u * (H / S + 40);
      dn3Eg(DN3_RB[i % 7], x, y, 9, 9, 0.5 * a * Math.sin(u * Math.PI) * dn3Foc(x * S, y * S)); dn3Eg('#ffffff', x, y, 3, 3, 0.7 * a * Math.sin(u * Math.PI)); }
    g.globalCompositeOperation = 'source-over';
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
}

// ═══════════ ön plan: yakından geçen bulanık bulut tutamları ═══════════
const DN3_FG = { sc: 0, puff: [] };
function dn3FgBake() {
  const sc = clamp(H / VH, 0.8, 2.4); if (DN3_FG.sc === sc) return; DN3_FG.sc = sc;
  DN3_FG.puff = [0, 1, 2].map(i => {   // düşük çözünürlükte boyanıp büyütülür (doğal bulanıklık)
    const q = 0.22 * sc, w = 520, h = 300, c = dn3Cv(w * q, h * q), x = c.getContext('2d'), R = rng(i * 41 + 9); x.setTransform(q, 0, 0, q, 0, 0);
    const n = 9 + i * 2, ps = [];
    for (let k = 0; k < n; k++) { const u = k / (n - 1), r = 50 + R() * 50 * Math.sin(u * Math.PI + 0.3); ps.push({ x: 70 + u * 380 + (R() - 0.5) * 30, y: 190 - Math.sin(u * Math.PI) * 70 + (R() - 0.5) * 30 + r * 0.2, r }); }
    ps.sort((a, b) => a.y - b.y);
    for (const p of ps) dn3Puff(x, p.x, p.y, p.r, '#ffffff', '#ffe8f0', '#f0cce4', 1);
    x.globalCompositeOperation = 'destination-out'; const gf = x.createLinearGradient(0, 160, 0, 300); gf.addColorStop(0, 'rgba(0,0,0,0)'); gf.addColorStop(1, 'rgba(0,0,0,0.9)'); x.fillStyle = gf; x.fillRect(0, 150, w, 150);
    return { c, w, h };
  });
}
function dn3Foreground(tm) {
  if (!dn3Ok() || !DN3.reg) return; if (!isFinite(tm)) tm = 0;
  dn3FgBake(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over';
  const B = dn3Bolum(), gk = B && B.gokkusagi && isFinite(B.gokkusagi.x) ? B.gokkusagi : null;   // Gökkuşağı Tepesi: yayın üstüne ön plan çizilmez (LEVEL3 anlaşması)
  const tk = gk ? clamp((Math.abs(cam.x + VW / 2 - gk.x) - (gk.R || 600) - VW * 0.6) / 400, 0, 1) : 1;
  const fly = DN3.fly, open = (1 - 0.7 * DN3.reg.ucus * (1 - fly)) * tk; if (open < 0.02 && fly < 0.05) return;
  // üst kenar: aşağı sarkan yumuşak bulut tutamları (ters çevrilmiş)
  for (let n = 0; n < 3; n++) {
    const sp = DN3_FG.puff[n], span = 2300, wx = ((n * 760 + 120 - cam.x * 1.22 - tm * 6) % span + span) % span - 520; if (wx > VW + 40) continue;
    const s = 0.85 + (n % 2) * 0.2, cxs = (wx + 260 * s) * S, a = 0.5 * open * (1 - 0.6 * fly) * (0.35 + 0.65 * dn3Foc(cxs, 60 * S));
    if (a < 0.02) continue; g.globalAlpha = a; g.save(); g.translate(wx * S, (-44 - n * 8) * S); g.scale(s, -s * 0.8); g.drawImage(sp.c, 0, -300 * S, 520 * S, 300 * S); g.restore();
  }
  // alt kenar: kontrol bölgeleri (sol alt düğme) boş; orta-sağ
  for (let n = 0; n < 3; n++) {
    const sp = DN3_FG.puff[(n + 1) % 3], span = 2000, wx = ((n * 690 + 400 - cam.x * 1.5 - tm * 9) % span + span) % span - 520; if (wx > VW + 40) continue;
    const s = 0.75 + (n % 2) * 0.2, cxs = (wx + 260 * s) * S, rx = cxs / W;
    let a = 0.6 * smooth(clamp((rx - 0.26) / 0.12, 0, 1)) * smooth(clamp((1.02 - rx) / 0.12, 0, 1)) * (0.25 + 0.75 * dn3Foc(cxs, H - 60 * S)) * open;
    if (a < 0.02) continue; g.globalAlpha = a; g.drawImage(sp.c, wx * S, H - 150 * s * S + 20 * S, 520 * s * S, 300 * s * S);
  }
  // uçuşta: yanından hızla geçen büyük sis bulutları (hız hissi), Feza'nın üstüne gelmez
  if (fly > 0.05) for (let n = 0; n < 3; n++) {
    const sp = DN3_FG.puff[n % 3], span = 2600, wx = ((n * 900 - cam.x * (2.0 + n * 0.3) - tm * (38 + n * 12)) % span + span) % span - 700; if (wx > VW + 60) continue;
    const s = 1.45 + (n % 2) * 0.3, cxs = (wx + 260 * s) * S, yy = n === 1 ? H - 110 * S : (n === 2 ? H * 0.45 : -70 * S);
    const a = (n === 2 ? 0.22 : 0.48) * fly * dn3Foc(cxs, yy + 100 * S) * dn3Foc(cxs, yy);
    if (a < 0.02) continue; g.globalAlpha = a; g.drawImage(sp.c, wx * S, yy - (n ? 0 : 140 * S), 520 * s * S, 300 * s * S * (n ? 1 : 0.8));
  }
  g.globalAlpha = 1;
}

// ═══════════ vinyet: kenarlarda yumuşak lila, altta sıcak sis (¼ çözünürlük önbellek) ═══════════
const dn3VigC = dn3Cv(2, 2); let dn3VigK = '';
function dn3Vignette() {
  if (!(W > 0 && H > 0)) return;
  const w = Math.max(2, Math.round(W / 4)), h = Math.max(2, Math.round(H / 4)), k = w + 'x' + h;
  if (dn3VigK !== k) {
    dn3VigK = k; dn3VigC.width = w; dn3VigC.height = h; const x = dn3VigC.getContext('2d');
    const tg = x.createLinearGradient(0, 0, 0, h); tg.addColorStop(0, 'rgba(96,80,170,0.16)'); tg.addColorStop(0.22, 'rgba(96,80,170,0)'); tg.addColorStop(0.8, 'rgba(150,100,170,0)'); tg.addColorStop(1, 'rgba(150,100,170,0.2)'); x.fillStyle = tg; x.fillRect(0, 0, w, h);
    const r = Math.hypot(w, h) / 2, vg = x.createRadialGradient(w / 2, h * 0.55, r * 0.45, w / 2, h * 0.55, r * 1.12);
    for (let i = 0; i <= 8; i++) { const u = i / 8; vg.addColorStop(u, `rgba(110,80,160,${(0.3 * u * u * (3 - 2 * u)).toFixed(4)})`); }
    x.fillStyle = vg; x.fillRect(0, 0, w, h);
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.drawImage(dn3VigC, 0, 0, W, H);
}

// ═══════════ dn3Isit: ağır önbellekleri kareye yayarak hazırla (bitince true) ═══════════
function dn3Isit() {
  if (!dn3Ok() || !dn3Init()) return false; if (DN3.prepDone) return true;
  const st = DN3.prep || (DN3.prep = { i: 0, sub: 0 });
  switch (st.i) {
    case 0: dn3SkyBuild(); st.i++; break;
    case 1: dn3SkyStep(); st.i++; break;
    case 2: { const L = DN3_LAY[st.sub]; if (L) { if (dn3LayStale(L)) dn3PaintLayer(L); st.sub++; } if (st.sub >= DN3_LAY.length) { st.i++; st.sub = 0; } break; }
    case 3: { const I = DN3_ISL[st.sub]; if (I) { dn3IslSpr(I.v, I.far); st.sub++; } if (st.sub >= DN3_ISL.length) { st.i++; st.sub = 0; } break; }
    case 4: dn3SunSpr(); dn3ShadeSpr(); dn3RaySpr(0); dn3RaySpr(1); dn3SeedSpr(); st.i++; break;
    case 5: dn3FgBake(); st.i++; break;
    case 6: dn3RbBuild(); if (st.sub < 7) { dn3RbBand(st.sub); st.sub++; } else { dn3RbComp(127); st.i++; st.sub = 0; } break;
    case 7: { const G = dn3GGeo(); if (!st.keys) { const a = Math.floor(cam.x / DN3_TW); st.keys = [a, a + 1, a + 2, a - 1].filter(k => k >= 0 && k * DN3_TW < COLS * T); }
      const k = st.keys[st.sub]; if (k !== undefined) { dn3GMake(k, G); st.sub++; } if (st.sub >= st.keys.length) { st.i++; st.sub = 0; } break; }
    case 8: { for (let n = 0; n < 6 && st.sub < DN3.plats.length; n++, st.sub++) { const p = DN3.plats[st.sub]; dn3SlabSpr(p.x1 - p.x0, 20, p.id + 1); } if (st.sub >= DN3.plats.length) { st.i++; st.sub = 0; } break; }
    case 9: { if (!st.sp) { const set = new Map(); for (const d of DN3.deco) set.set(d.k + d.v + d.c, d); st.sp = [...set.values()]; }
      for (let n = 0; n < 12 && st.sub < st.sp.length; n++, st.sub++) { const d = st.sp[st.sub]; dn3DecoSpr(d.k, d.v, d.c); } if (st.sub >= st.sp.length) { st.i++; st.sub = 0; } break; }
    case 10: for (const c of ['#ffc89a', '#ffe2b0', '#fff2d0', '#ffe2d0', '#ffd8dc', '#ffd6d8', '#ffdcd8', '#f4c8dc', '#ffd8a8', '#ffffff', '#fff0c8', '#ffe6a8', '#fff4d0', '#ffd890', '#ffd8b8', '#fff0c0'].concat(DN3_MC, DN3_RB)) glow(c); st.i++; break;
    case 11: { const sc = st.sc || (st.sc = dn3Cv(4, 4)), x = sc.getContext('2d', { willReadFrequently: true }), touch = c => { if (c && c.width > 0) x.drawImage(c, 0, 0, 2, 2); };
      if (st.sub === 0) { touch(DN3_SK.A); touch(DN3_SK.B); touch(DN3_SK.C); } else if (st.sub <= DN3_LAY.length) touch(DN3_LAY[st.sub - 1].cv);
      else { for (const k in dn3IslC) touch(dn3IslC[k].c); for (const c of DN3.gc.values()) touch(c.cv); for (const k in dn3DS) touch(dn3DS[k]); for (const p of DN3_FG.puff) touch(p.c); touch(DN3_RBC.ghost); for (const c of DN3_RBC.band) touch(c); touch(dn3SunC); touch(dn3RayC[0]); touch(dn3RayC[1]); st.i++; }
      x.getImageData(0, 0, 1, 1); st.sub++; break; }
    default: st.i++;
  }
  if (st.i >= 12) { DN3.prepDone = true; return true; }
  return false;
}

/* oyun.js – giriş (dokunmatik + klavye), fizik, nesne çalışma zamanı (TUR), kamera, oyun akışı (DURUM) ve ana döngü.
   Sözleşme: src/SPEC.md. Klasik script: üst düzey adlar bütün dosyalarla ortak. */
'use strict';
// ── giriş ──
// iPad: sol altta zıplama düğmesi (sol el); ekranın başka yerine basılı tutmak → Feza o yöne yürür (sağ el).
const GIRDI = { eksen: 0, ziplaBasili: false, dugme: { x: 0, y: 0, r: 0, basili: false }, hedefX: null, hareket: false };
let axis = 0, jumpHeld = false, jumpPressed = false, started = false, startT = 0, moved = false;
const keys = {};
const touches = new Map();
function dugmeYeri() {   // CSS px; orta boy (≈ başparmak), kenardan biraz içeride
  const r = clamp(Math.min(innerWidth, innerHeight) * 0.07, 34, 52);
  GIRDI.dugme.r = r; GIRDI.dugme.x = r + Math.max(26, innerWidth * 0.035); GIRDI.dugme.y = innerHeight - r - Math.max(26, innerHeight * 0.05);
}
const dugmede = (x, y) => Math.hypot(x - GIRDI.dugme.x, y - GIRDI.dugme.y) < GIRDI.dugme.r * 1.45;
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (DURUM === 'baslik') { begin(); return; }
  if (DURUM !== 'oyun') { OLAY.emit('dokunus', { x: e.clientX, y: e.clientY }); return; }
  const j = dugmede(e.clientX, e.clientY);
  touches.set(e.pointerId, { jump: j, x: e.clientX, y: e.clientY });
  if (j) { jumpPressed = true; jumpHeld = true; }
});
const up = e => { touches.delete(e.pointerId); jumpHeld = [...touches.values()].some(v => v.jump); };
cv.addEventListener('pointermove', e => { const t = touches.get(e.pointerId); if (t) { t.x = e.clientX; t.y = e.clientY; } });
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
addEventListener('keydown', e => {
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  if (DURUM === 'baslik') { begin(); return; }
  if (DURUM !== 'oyun') { if (!e.repeat) OLAY.emit('dokunus', {}); return; }
  if (!keys[e.code] && ['Space', 'ArrowUp', 'KeyW'].includes(e.code)) jumpPressed = true;
  keys[e.code] = true;
});
addEventListener('keyup', e => { keys[e.code] = false; });
function readInput() {
  let a = 0; GIRDI.hedefX = null;
  for (const t of touches.values()) if (!t.jump) {
    const fx = (P.x - cam.x) * S / DPR;   // Feza'nın ekran x'i (CSS px)
    const d = t.x - fx; GIRDI.hedefX = t.x;
    a = Math.abs(d) < 18 ? 0 : clamp(d / 70, -1, 1);
    if (a && Math.abs(a) < 0.45) a = Math.sign(a) * 0.45;
  }
  if (keys.ArrowLeft || keys.KeyA) a = -1;
  if (keys.ArrowRight || keys.KeyD) a = 1;
  axis = a; GIRDI.eksen = a;
  jumpHeld = !!(keys.Space || keys.ArrowUp || keys.KeyW) || [...touches.values()].some(v => v.jump);
  GIRDI.dugme.basili = jumpHeld; GIRDI.ziplaBasili = jumpHeld;
  if (a) { moved = true; GIRDI.hareket = true; }
}
function begin() {
  if (started) return; started = true; startT = now; AU.start();
  DURUM = 'giris'; OLAY.emit('durum', DURUM);
  if (Q.has('atla') || typeof SAHNE === 'undefined' || !SAHNE.giris) oyunaBasla();
  else SAHNE.giris(oyunaBasla);
}
function oyunaBasla() { if (DURUM === 'oyun') return; DURUM = 'oyun'; OLAY.emit('durum', DURUM); stepCam(0, true); }

// ── fizik: zemin ızgarası + nesnelerin cisim kutuları ──
// o.cisim = { w, h, tip: 'kati'|'ustten'|'ziplat', guc, aktif, dx, dy }  (kutunun alt ortası: o.x, o.y; dx/dy = bu karedeki kayma)
const CISIMLER = [];
let ustundeki = null;   // Feza'nın üstünde durduğu nesne
function kutu(o) { const c = o.cisim; return { x0: o.x - c.w / 2, x1: o.x + c.w / 2, y0: o.y - c.h, y1: o.y }; }
function moveX(dx) {
  P.x += dx;
  const ty0 = Math.floor((P.y - PH) / T), ty1 = Math.floor((P.y - 1) / T);
  if (dx > 0) { const tx = Math.floor((P.x + PW) / T); for (let ty = ty0; ty <= ty1; ty++) if (cell(tx, ty) === 1) { P.x = tx * T - PW - 0.01; P.vx = 0; break; } }
  else if (dx < 0) { const tx = Math.floor((P.x - PW) / T); for (let ty = ty0; ty <= ty1; ty++) if (cell(tx, ty) === 1) { P.x = (tx + 1) * T + PW + 0.01; P.vx = 0; break; } }
  for (const o of CISIMLER) {   // katı cisimlerin yanları
    const c = o.cisim; if (!c.aktif || c.tip === 'ustten') continue;
    const k = kutu(o);
    if (P.y - 2 <= k.y0 || P.y - PH >= k.y1) continue;
    if (P.x + PW > k.x0 && P.x - PW < k.x1) {
      if (dx > 0 || (dx === 0 && P.x < o.x)) P.x = k.x0 - PW - 0.01; else P.x = k.x1 + PW + 0.01;
      P.vx = 0; OLAY.emit('carpti', o);
    }
  }
}
function inis(y, siddet) {
  if (siddet > 300) { P.land = clamp(siddet / 900, 0.3, 1); AU.sfx('land', P.land); OLAY.emit('inis', { x: P.x, y, siddet }); burst(P.x, y, 8, ['#e8dcff', '#bff4ff'], 70, 0.7, 6); }
}
function moveY(dy) {
  const prev = P.y; P.y += dy;
  const was = P.ground; P.ground = false; ustundeki = null;
  const tx0 = Math.floor((P.x - PW) / T), tx1 = Math.floor((P.x + PW - 0.01) / T);
  if (dy >= 0) {
    const ty = Math.floor(P.y / T);
    for (let tx = tx0; tx <= tx1; tx++) {
      const c = cell(tx, ty);
      if (c === 1 || (c === 2 && prev <= ty * T + 0.5)) { if (!was) inis(ty * T, P.vy); P.y = ty * T; P.vy = 0; P.ground = true; break; }
    }
    for (const o of CISIMLER) {
      const c = o.cisim; if (!c.aktif) continue;
      const k = kutu(o);
      if (P.x + PW <= k.x0 || P.x - PW >= k.x1) continue;
      if (prev <= k.y0 + 2 + Math.max(0, -(c.dy || 0)) && P.y >= k.y0) {
        const vy = P.vy, h = TUR.al(o.tip);
        P.y = k.y0;
        if (c.tip === 'ziplat') { P.vy = -(c.guc || 1050); P.ground = false; P.dj = true; P.jumpT = 0; OLAY.emit('ziplatti', o); if (h && h.ustune) h.ustune(o, vy); continue; }
        if (!was) inis(k.y0, vy);
        P.vy = 0; P.ground = true; ustundeki = o;
        if (!was && h && h.ustune) h.ustune(o, vy);
      }
    }
  } else {
    const ty = Math.floor((P.y - PH) / T);
    for (let tx = tx0; tx <= tx1; tx++) if (cell(tx, ty) === 1) { P.y = (ty + 1) * T + PH; P.vy = 0; break; }
  }
}
function stepPlayer(dt) {
  if (P.fade > 0) {   // suya/boşluğa düştü: Pırıl geri taşır
    P.fade -= dt;
    if (P.fade <= 0.6 && !P.respawned) { P.respawned = true; P.x = P.safeX; P.y = P.safeY; P.vx = P.vy = 0; dragonCarry(); burst(P.x, P.y - 30, 30, ['#c9a2ff', '#ffd6f2', '#ffffff'], 140, 1.2, 9); AU.sfx('dbl'); OLAY.emit('kurtarildi', P); }
    return;
  }
  if (P.kilit > 0) { P.kilit -= dt; axis = 0; jumpPressed = false; }   // sahne anlarında kontrol kısa süre kapalı
  const target = axis * 250, acc = P.ground ? 2400 : 1500;
  if (P.vx < target) P.vx = Math.min(target, P.vx + acc * dt); else if (P.vx > target) P.vx = Math.max(target, P.vx - acc * dt);
  if (Math.abs(axis) > 0.1) P.f = Math.sign(axis);
  if (jumpPressed) { P.buf = 0.14; jumpPressed = false; }
  if (P.ground) { P.coyote = 0.1; P.dj = true; } else P.coyote -= dt;
  if (P.buf > 0) {
    if (P.coyote > 0) { P.vy = -730; P.coyote = 0; P.buf = 0; P.ground = false; P.jumpT = 0; AU.sfx('jump'); burst(P.x, P.y, 6, ['#ffffff', '#e0d0ff'], 60, 0.5, 5); OLAY.emit('ziplama', P); }
    else if (P.dj) { P.vy = -650; P.dj = false; P.buf = 0; P.jumpT = 0; P.flip = 1; dragonPush(); OLAY.emit('ciftZiplama', P); }
  }
  P.buf -= dt;
  let grav = 2200;
  if (P.vy > 0) grav *= 1.25; else if (!jumpHeld) grav *= 2.1;
  P.vy = Math.min(P.vy + grav * dt, 950);
  if (ustundeki && ustundeki.cisim.aktif) { P.x += ustundeki.cisim.dx || 0; P.y += Math.min(0, ustundeki.cisim.dy || 0); }
  moveX(P.vx * dt); moveY(P.vy * dt);
  P.jumpT += dt;
  if (P.ground && !ustundeki) {
    const ty = Math.floor(P.y / T);
    if (cell(Math.floor(P.x / T), ty) && cell(Math.floor((P.x - 18) / T), ty) && cell(Math.floor((P.x + 18) / T), ty)) { P.safeX = P.x; P.safeY = P.y; }
  }
  if (P.y > ROWS * T + 60) { P.fade = 1.2; P.respawned = false; AU.sfx('splash'); burst(P.x, ROWS * T - 60, 24, ['#bfe6ff', '#ffffff'], 160, 0.9, 7); OLAY.emit('dustu', P); }
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
  if (P.ground && sp > 150 && Math.random() < dt * 9) parts.push({ x: P.x - P.f * 6, y: P.y - 2, vx: -P.f * 30, vy: -25, life: 0.6, max: 0.6, col: '#d8ccff', size: 5 });
}

// ── nesneler: kurulum, dokunma, güncelleme, çizim ──
const SAYAC = { cicek: 0, cicekTop: 0, tohum: 0, tohumTop: 0, pofuduk: 0, pofudukTop: 0 };
function nesneleriKur() {
  for (const o of NESNELER) {
    const h = TUR.al(o.tip); if (h && h.kur) h.kur(o);
    if (o.cisim) CISIMLER.push(o);
  }
  SAYAC.cicekTop = NESNELER.filter(o => o.tip === 'cicek').length;
  SAYAC.tohumTop = NESNELER.filter(o => o.tip === 'tohum').length;
  SAYAC.pofudukTop = NESNELER.filter(o => o.tip === 'pofuduk' || o.tip === 'buyukPofuduk').length;
}
function nesneleriGuncelle(dt) {
  for (const o of NESNELER) {
    const h = TUR.al(o.tip);
    if (h && h.guncelle) h.guncelle(o, dt);
    if (o.r && !o.dokundu && DURUM === 'oyun' && P.fade <= 0) {
      const dx = o.x - P.x, dy = (o.y - (o.ry || 0)) - (P.y - PH / 2);
      if (Math.abs(dx) < o.r && Math.abs(dy) < Math.max(o.r, 50)) {
        o.dokundu = true;
        if (h && h.dokun) h.dokun(o);
        OLAY.emit('dokun:' + o.tip, o);
      }
    }
  }
}
function nesneleriCiz(tm, katman) {   // katman: 'ciz' (Feza'nın arkası) | 'cizOn' (önü); dünya dönüşümü kurulu
  for (const o of NESNELER) {
    const h = TUR.al(o.tip); if (!h || !h[katman]) continue;
    if (o.x < cam.x - 500 || o.x > cam.x + VW + 500) continue;
    h[katman](o, tm);
  }
}
// Varsayılan küçük davranışlar (modüller kendi TUR.kaydet'leriyle genişletir)
TUR.kaydet('konusma', { dokun(o) { if (typeof SES !== 'undefined') SES.soyle(o.anahtar); } });
TUR.kaydet('cicek', { dokun(o) { if (o.done) return; o.done = true; bloom(o); } });
TUR.kaydet('tohum', { dokun(o) { o.done = true; SAYAC.tohum++; burst(o.x, o.y - 20, 20, ['#ffe9b8', '#ffffff'], 140, 1.2, 7); AU.sfx('bloom'); OLAY.emit('tohum', o); } });
TUR.kaydet('agac', { dokun(o) {
  if (TREE.done) return;
  if (NESNELER.some(n => n.tip === 'buyukPofuduk' && !n.uyandi)) { o.dokundu = false; return; }
  TREE.done = true; lightTarget = 1; ripples.push({ x: o.x, y: o.y - 160, r: 0, life: 3 }); dragonHappy(o); AU.sfx('bloom', 1); OLAY.emit('agac', o);
  setTimeout(finaleGec, 2600);
} });
function bloom(fl) {
  SAYAC.cicek++;
  lightTarget = Math.min(0.9, lightTarget + 0.85 / Math.max(1, SAYAC.cicekTop));
  ripples.push({ x: fl.x, y: fl.y - 14, r: 0, life: 2.2 });
  burst(fl.x, fl.y - 16, 26, ['#9ff0ff', '#ffe9b8', '#c9b2ff'], 170, 1.6, 7);
  dragonHappy(fl); AU.sfx('bloom'); OLAY.emit('cicek', fl);
}
OLAY.on('uyandi', () => { SAYAC.pofuduk++; });
// Sıradaki ana hedef (Pırıl yol gösterirken kullanır)
function HEDEF() {
  let best = null;
  for (const o of NESNELER) if ((o.tip === 'cicek' && !o.done) || (o.tip === 'buyukPofuduk' && !o.uyandi) || (o.tip === 'agac' && !TREE.done)) if (!best || o.x < best.x) best = o;
  return best;
}
function finaleGec() {
  if (DURUM !== 'oyun') return;
  DURUM = 'final'; OLAY.emit('durum', DURUM);
  const bitir = () => { DURUM = 'son'; OLAY.emit('durum', DURUM); };
  if (typeof SAHNE !== 'undefined' && SAHNE.final) SAHNE.final(bitir); else bitir();
}

// ── kamera ──
const cam = { x: 0, y: 0 };
function stepCam(dt, snap) {
  const look = clamp(P.vx / 250, -1, 1) * 90 + P.f * 30;
  const tx = clamp(P.x + look - VW / 2, 0, Math.max(0, COLS * T - VW));
  const ty = clamp(P.y - VH * 0.64, -40, ROWS * T - VH + 30);
  const k = snap ? 1 : 1 - Math.exp(-dt * 3.2);
  cam.x = lerp(cam.x, tx, k); cam.y = lerp(cam.y, ty, snap ? 1 : 1 - Math.exp(-dt * (P.ground ? 3 : 1.6)));
}

function drawFx(tm, dt) {
  g.globalCompositeOperation = 'lighter';
  dglow('#b88aff', D.x, D.y, 150, 0.32);
  dglow('#ffe0ff', D.x, D.y, 40, 0.15);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life -= dt;
    if (p.life <= 0) { parts.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-dt * 2); p.vy = p.vy * Math.exp(-dt * 2) - 10 * dt;
    const a = p.life / p.max;
    dglow(p.col, p.x, p.y, p.size * (0.6 + a), a * 0.6);
  }
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i]; r.life -= dt; r.r += dt * (r.small ? 160 : 260);
    if (r.life <= 0 || (!r.small && r.r > 420)) { ripples.splice(i, 1); continue; }
    g.strokeStyle = `rgba(255,226,240,${Math.min(0.5, r.life * 0.3) * (r.small ? 1 : 1 - r.r / 420)})`; g.lineWidth = r.small ? 2 : 10 * (1 - r.r / 420) + 1;
    g.beginPath(); g.arc(r.x, r.y, r.r, 0, 6.283); g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
}

// ── döngü ──
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = Math.round(innerWidth * DPR); H = Math.round(innerHeight * DPR);
  cv.width = W; cv.height = H; S = H / VH; VW = W / S;
  skyLight = -1; grainPat = null; dugmeYeri();
  OLAY.emit('boyut', { W, H });
}
addEventListener('resize', resize); resize();
nesneleriKur();
let last = performance.now() / 1000;
stepCam(0, true);
function frame(ms) {
  const t = ms / 1000; const dt = Math.min(1 / 30, Math.max(0, t - last)); last = t; now = t;
  readInput();
  if (DURUM !== 'oyun') { axis = 0; jumpPressed = false; }
  if (DURUM === 'oyun' || DURUM === 'baslik') {
    const n = dt > 1 / 70 ? 2 : 1;
    for (let i = 0; i < n; i++) stepPlayer(dt / n);
  }
  nesneleriGuncelle(dt);
  fezaUpdate(dt); stepDragon(dt); stepCam(dt);
  light = lerp(light, lightTarget, 1 - Math.exp(-dt * 0.9));
  const sahneTam = typeof SAHNE !== 'undefined' && SAHNE.tamEkran && SAHNE.tamEkran();
  if (!sahneTam) {
    drawBackground(t);
    drawMotes(t, 0, 0.75);
    drawWorld(t);
    g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
    nesneleriCiz(t, 'ciz');
    g.setTransform(1, 0, 0, 1, 0, 0);
    drawFeza(t);
    g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
    drawDragon(t);
    nesneleriCiz(t, 'cizOn');
    drawFx(t, dt);
    drawPetals(t);
    drawMotes(t, 0.75, 2);
    drawForeground(t);
    drawVignette();
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (typeof SAHNE !== 'undefined' && SAHNE.ciz) SAHNE.ciz(t, dt);
  if (typeof ARAYUZ !== 'undefined' && ARAYUZ.ciz) ARAYUZ.ciz(t, dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.OYUN = { P, D, NESNELER, FLOWERS, TREE, cam, SAYAC, GIRDI, get durum() { return DURUM; }, get light() { return light; }, set light(v) { light = lightTarget = v; }, begin, keys, press: () => { jumpPressed = true; }, finaleGec, HEDEF };
if (Q.has('atla')) begin();

/* oyun.js – giriş, fizik, kamera, parçacıklar, başlık ve ana döngü
   Klasik script: üst düzey const/let/function'lar diğer dosyalarla ortak (ortak.js önce yüklenir). */
'use strict';
// ── giriş ──
let axis = 0, jumpHeld = false, jumpPressed = false, started = false, startT = 0, moved = false;
const keys = {};
const touches = new Map();
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); begin();
  const left = e.clientX < innerWidth * 0.5;
  touches.set(e.pointerId, { left, x0: e.clientX, x: e.clientX });
  if (!left) { jumpPressed = true; jumpHeld = true; }
});
const up = e => { const t = touches.get(e.pointerId); touches.delete(e.pointerId); if (t && !t.left) jumpHeld = [...touches.values()].some(v => !v.left); };
cv.addEventListener('pointermove', e => { const t = touches.get(e.pointerId); if (!t) return; t.x = e.clientX; const d = t.x - t.x0; if (Math.abs(d) > 70) t.x0 = t.x - Math.sign(d) * 70; });
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
addEventListener('keydown', e => {
  if (!keys[e.code] && ['Space', 'ArrowUp', 'KeyW'].includes(e.code)) { jumpPressed = true; begin(); }
  keys[e.code] = true; if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
  if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) begin();
});
addEventListener('keyup', e => { keys[e.code] = false; });
function readInput() {
  let a = 0;
  for (const t of touches.values()) if (t.left) { const d = (t.x - t.x0) / 45; a = Math.abs(d) < 0.15 ? 0 : clamp(d, -1, 1); }
  if (keys.ArrowLeft || keys.KeyA) a = -1;
  if (keys.ArrowRight || keys.KeyD) a = 1;
  axis = a;
  jumpHeld = jumpHeld || !!(keys.Space || keys.ArrowUp || keys.KeyW);
  if (!(keys.Space || keys.ArrowUp || keys.KeyW) && ![...touches.values()].some(v => !v.left)) jumpHeld = false;
  if (a) moved = true;
}
function begin() { if (started) return; started = true; startT = now; AU.start(); }

// ── fizik ──
function moveX(dx) {
  P.x += dx;
  const ty0 = Math.floor((P.y - PH) / T), ty1 = Math.floor((P.y - 1) / T);
  if (dx > 0) { const tx = Math.floor((P.x + PW) / T); for (let ty = ty0; ty <= ty1; ty++) if (cell(tx, ty) === 1) { P.x = tx * T - PW - 0.01; P.vx = 0; break; } }
  else if (dx < 0) { const tx = Math.floor((P.x - PW) / T); for (let ty = ty0; ty <= ty1; ty++) if (cell(tx, ty) === 1) { P.x = (tx + 1) * T + PW + 0.01; P.vx = 0; break; } }
}
function moveY(dy) {
  const prev = P.y; P.y += dy;
  const was = P.ground; P.ground = false;
  const tx0 = Math.floor((P.x - PW) / T), tx1 = Math.floor((P.x + PW - 0.01) / T);
  if (dy >= 0) {
    const ty = Math.floor(P.y / T);
    for (let tx = tx0; tx <= tx1; tx++) {
      const c = cell(tx, ty);
      if (c === 1 || (c === 2 && prev <= ty * T + 0.5)) {
        if (!was && P.vy > 300) { P.land = clamp(P.vy / 900, 0.3, 1); AU.sfx('land', P.land); burst(P.x, ty * T, 8, ['#e8dcff', C('rim').slice(0, 7) === 'rgba(' ? '#ffe0b0' : '#ffe0b0'], 70, 0.7, 6); }
        P.y = ty * T; P.vy = 0; P.ground = true; break;
      }
    }
  } else {
    const ty = Math.floor((P.y - PH) / T);
    for (let tx = tx0; tx <= tx1; tx++) if (cell(tx, ty) === 1) { P.y = (ty + 1) * T + PH; P.vy = 0; break; }
  }
}
function stepPlayer(dt) {
  if (P.fade > 0) {   // suya düştü: Pırıl geri taşır
    P.fade -= dt;
    if (P.fade <= 0.6 && !P.respawned) { P.respawned = true; P.x = P.safeX; P.y = P.safeY; P.vx = P.vy = 0; dragonCarry(); burst(P.x, P.y - 30, 30, ['#c9a2ff', '#ffd6f2', '#ffffff'], 140, 1.2, 9); AU.sfx('dbl'); }
    return;
  }
  const target = axis * 250, acc = P.ground ? 2400 : 1500;
  if (P.vx < target) P.vx = Math.min(target, P.vx + acc * dt); else if (P.vx > target) P.vx = Math.max(target, P.vx - acc * dt);
  if (Math.abs(axis) > 0.1) P.f = Math.sign(axis);
  if (jumpPressed) { P.buf = 0.14; jumpPressed = false; }
  if (P.ground) { P.coyote = 0.1; P.dj = true; } else P.coyote -= dt;
  if (P.buf > 0) {
    if (P.coyote > 0) { P.vy = -730; P.coyote = 0; P.buf = 0; P.ground = false; P.jumpT = 0; AU.sfx('jump'); burst(P.x, P.y, 6, ['#ffffff', '#e0d0ff'], 60, 0.5, 5); }
    else if (P.dj) { P.vy = -650; P.dj = false; P.buf = 0; P.jumpT = 0; P.flip = 1; dragonPush(); }
  }
  P.buf -= dt;
  let grav = 2200;
  if (P.vy > 0) grav *= 1.25; else if (!jumpHeld) grav *= 2.1;
  P.vy = Math.min(P.vy + grav * dt, 950);
  moveX(P.vx * dt); moveY(P.vy * dt);
  P.jumpT += dt;
  if (P.ground) {
    const c = Math.floor(P.x / T);
    if (cell(c, Math.floor(P.y / T)) && cell(Math.floor((P.x - 18) / T), Math.floor(P.y / T)) && cell(Math.floor((P.x + 18) / T), Math.floor(P.y / T))) { P.safeX = P.x; P.safeY = P.y; }
  }
  if (P.y > ROWS * T + 60) { P.fade = 1.2; P.respawned = false; AU.sfx('splash'); burst(P.x, ROWS * T - 20, 24, ['#bfe6ff', '#ffffff'], 160, 0.9, 7); }
  // animasyon durumları
  const sp = Math.abs(P.vx);
  P.run += dt * (P.ground ? sp / 250 * 11.5 : 0);
  P.land = Math.max(0, P.land - dt * 4.5);
  P.lean = lerp(P.lean, P.ground ? clamp(P.vx / 250, -1, 1) * P.f : 0, 1 - Math.exp(-dt * 10));
  P.hairV += (-P.vy * 0.004 - P.hairY) * dt * 60; P.hairV *= Math.exp(-dt * 9); P.hairY += P.hairV * dt * 10;
  P.hairY = clamp(P.hairY, -4, 4);
  P.blinkT -= dt; if (P.blinkT < -0.12) P.blinkT = 2 + Math.random() * 3;
  P.idle = (sp < 5 && P.ground) ? P.idle + dt : 0;
  if (P.flip) { P.flip -= dt * 2.6; if (P.flip < 0) P.flip = 0; }
  // adım tozu ve çimen
  if (P.ground && sp > 150 && Math.random() < dt * 9) parts.push({ x: P.x - P.f * 6, y: P.y - 2, vx: -P.f * 30, vy: -25, life: 0.6, max: 0.6, col: '#d8ccff', size: 5 });
  // çiçekler
  for (const fl of FLOWERS) if (!fl.done && Math.abs(fl.x - P.x) < 34 && Math.abs(fl.y - (P.y - 20)) < 50) bloom(fl);
  if (!TREE.done && P.x > TREE.x - 120) { TREE.done = true; lightTarget = 1; ripples.push({ x: TREE.x, y: TREE.y - 160, r: 0, life: 3 }); dragonHappy(TREE); AU.sfx('bloom', 1); }
}
function bloom(fl) {
  fl.done = true; lightTarget = Math.min(1, lightTarget + 0.8 / FLOWERS.length);
  ripples.push({ x: fl.x, y: fl.y - 14, r: 0, life: 2.2 });
  burst(fl.x, fl.y - 16, 26, ['#9ff0ff', '#ffe9b8', '#c9b2ff'], 170, 1.6, 7);
  dragonHappy(fl); AU.sfx('bloom');
}
// ── kamera ──
const cam = { x: 0, y: 40 };
function stepCam(dt, snap) {
  const tx = clamp(P.x + P.f * 70 - VW / 2, 0, COLS * T - VW), ty = clamp(P.y - 360, -60, 50);
  const k = snap ? 1 : 1 - Math.exp(-dt * 4);
  cam.x = lerp(cam.x, tx, k); cam.y = lerp(cam.y, ty, snap ? 1 : 1 - Math.exp(-dt * 2.5));
}

function drawFx(tm, dt) {
  g.globalCompositeOperation = 'lighter';
  // Pırıl'ın ışığı
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
    if (r.life <= 0) { ripples.splice(i, 1); continue; }
    if (!r.small && r.r > 420) { ripples.splice(i, 1); continue; }
    g.strokeStyle = `rgba(255,226,240,${Math.min(0.5, r.life * 0.3) * (r.small ? 1 : 1 - r.r / 420)})`; g.lineWidth = r.small ? 2 : 10 * (1 - r.r / 420) + 1;
    g.beginPath(); g.arc(r.x, r.y, r.r, 0, 6.283); g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
}
function drawTitle(tm) {
  const a = started ? clamp(1 - (now - startT) / 1.6, 0, 1) : 1;
  if (a <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = a;
  g.fillStyle = 'rgba(8,8,24,0.35)'; g.fillRect(0, 0, W, H);
  g.textAlign = 'center';
  g.shadowColor = 'rgba(190,140,255,0.9)'; g.shadowBlur = 30 * DPR;
  g.fillStyle = '#f6efff'; g.font = `300 ${Math.round(H * 0.085)}px Georgia, 'Times New Roman', serif`;
  g.fillText('Feza ve Pırıl', W / 2, H * 0.38);
  g.font = `italic 300 ${Math.round(H * 0.04)}px Georgia, serif`; g.fillStyle = '#e8d8ff';
  g.fillText('Işık Ormanı', W / 2, H * 0.46);
  g.shadowBlur = 0;
  g.globalAlpha = a * (0.55 + 0.45 * Math.sin(tm * 2.5));
  g.font = `500 ${Math.round(H * 0.03)}px system-ui, sans-serif`; g.fillStyle = '#fff';
  g.fillText('Başlamak için dokun', W / 2, H * 0.66);
  g.globalAlpha = 1;
}

// ── döngü ──
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = Math.round(innerWidth * DPR); H = Math.round(innerHeight * DPR);
  cv.width = W; cv.height = H; S = H / VH; VW = W / S;
  skyLight = -1; grainPat = null;
}
addEventListener('resize', resize); resize();
let now = 0, last = performance.now() / 1000;
stepCam(0, true);
function frame(ms) {
  const t = ms / 1000; let dt = Math.min(1 / 30, t - last); last = t; now = t;
  readInput();
  if (!started) { axis = 0; jumpPressed = false; }
  const n = dt > 1 / 70 ? 2 : 1;
  for (let i = 0; i < n; i++) stepPlayer(dt / n);
  fezaUpdate(dt); stepDragon(dt); stepCam(dt);
  light = lerp(light, lightTarget, 1 - Math.exp(-dt * 0.9));
  if (moved) { const h = document.getElementById('ipucu'); if (h && h.style.opacity !== '0') h.style.opacity = '0'; }
  drawBackground(t);
  drawMotes(t, 0, 0.75);
  drawWorld(t);
  g.setTransform(1, 0, 0, 1, 0, 0);
  drawFeza(t);
  g.setTransform(S, 0, 0, S, -cam.x * S, -cam.y * S);
  drawDragon(t);
  drawFx(t, dt);
  drawPetals(t);
  drawMotes(t, 0.75, 2);
  drawForeground(t);
  drawVignette();
  drawTitle(t);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.OYUN = { P, D, FLOWERS, TREE, cam, get light() { return light; }, set light(v) { light = lightTarget = v; }, begin, keys, press: () => { jumpPressed = true; } };

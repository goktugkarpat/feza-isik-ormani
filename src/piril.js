/* piril.js – Pırıl (mor bebek ejderha, Ori'deki Sein gibi ışık veren rehber):
   davranış (stepDragon, dragonPush, dragonHappy, dragonCarry) ve çizim (drawDragon).
   Klasik script: üst düzey const/let/function'lar diğer dosyalarla ortak (ortak.js önce yüklenir). */
'use strict';
const DR_TAIL_N = 9, DR_TAIL_LEN = 4.2;
const DR_COL = { pur: '#8550ee', purL: '#a77cff', purD: '#5c32bd', line: '#3a1a80', lav: '#ecdcff', lavD: '#cdb4f7',
  pink: '#ffb3e8', spine: '#f6a8ee', horn: '#fff1d6', hornD: '#e9cfa6', eye: '#2b1450', iris: '#7b46d8' };

function dragonInit() {
  if (D.init) return;
  D.init = true;
  D.face = D.f || 1;         // çizilen yan yön (±1)
  D.fs = D.face;             // yatay yerleşim çarpanı (dönüşte 0'a yaklaşır; çizimi inceltmez)
  D.tt = -1; D.fw = 0;       // dönüş ilerlemesi ve önden görünüş ağırlığı
  D.ft = D.f || 1;           // hedef yön
  D.tilt = 0; D.ph = 0; D.flapRate = 3.2; D.glide = 0; D.bob = 0;
  D.expr = 'normal'; D.exprT = 0; D.hop = 0;
  D.lookX = 1; D.lookY = 0.3; D.headTilt = 0;
  D.trail = []; D.fx = []; D.fxT = 0;
  D.nextOrbit = 4; D.pushHit = false; D.pose = 0;  // pose: 0 normal, 1 itme (kollar yukarı)
  D.tail = [];
  for (let i = 0; i < DR_TAIL_N; i++) D.tail.push({ x: D.x - D.f * (8 + i * DR_TAIL_LEN), y: D.y + 6 });
}

// yerel (ejderha) koordinatından dünyaya
function drLocal(lx, ly) {
  const sx = D.fs, c = Math.cos(D.tilt), s = Math.sin(D.tilt);
  return { x: D.x + sx * (lx * c - ly * s), y: D.y + D.bob + lx * s + ly * c };
}
function drResetTail() {
  const r = drLocal(-7, 6);
  for (let i = 0; i < D.tail.length; i++) { D.tail[i].x = r.x - D.ft * i * DR_TAIL_LEN; D.tail[i].y = r.y + i * 1.5; }
}
function drSparkle(x, y, n, spd) {
  burst(x, y, n, ['#d9b8ff', '#ffd6f2', '#ffffff'], spd, 0.8, 7);
}

// ── olaylar (oyun.js çağırır) ──
function dragonPush() {     // havada ikinci zıplama: Pırıl hızla süzülüp Feza'nın ayaklarının altından iter
  dragonInit();
  D.mode = 'push'; D.modeT = 0; D.sx0 = D.x; D.sy0 = D.y; D.pushHit = false;
  D.dashT = clamp(Math.hypot(D.x - P.x, D.y - P.y - 23) / 700, 0.1, 0.2);
  D.expr = 'effort'; D.exprT = 0.6;
  drSparkle(D.x, D.y, 6, 60);
  AU.sfx('dbl');
}
function dragonHappy(target) {   // çiçek açıldı / ağaç yandı (target: {x, y})
  dragonInit();
  const tree = (typeof TREE !== 'undefined' && target === TREE);
  D.mode = 'happy'; D.modeT = 0; D.hphase = 0;
  // Feza'nın yüzünü kapatmasın: çiçeğin Feza'dan uzak tarafında dön
  const side = Math.abs(target.x - P.x) > 6 ? Math.sign(target.x - P.x) : P.f;
  D.hside = side; D.hx = target.x + (tree ? 0 : side * 46); D.hy = target.y - (tree ? 230 : 38); D.hr = tree ? 64 : 26;
  D.expr = 'happy'; D.exprT = 3;
}
function dragonCarry() {   // Feza sudan çıkarılıp güvenli yere kondu: Pırıl ışıltıyla yanında belirir, onu taşımış gibi
  dragonInit();
  drSparkle(D.x, D.y, 10, 90);
  D.x = P.x - P.f * 38; D.y = P.y - 50; D.vx = 0; D.vy = -40;
  D.ft = P.f; D.face = D.fs = P.f; D.tt = -1; D.fw = 0; D.trail.length = 0; drResetTail();
  burst(D.x, D.y, 24, ['#c9a2ff', '#ffd6f2', '#ffffff'], 120, 1.0, 8);
  ripples.push({ x: D.x, y: D.y, r: 0, life: 0.6, small: true });
  D.mode = 'carry'; D.modeT = 0; D.expr = 'happy'; D.exprT = 1.2;
}

// ── davranış ──
function stepDragon(dt) {
  dragonInit();
  D.t += dt; D.modeT += dt;
  const wx = Math.sin(D.t * 0.71) * 9 + Math.sin(D.t * 1.93) * 3, wy = Math.sin(D.t * 1.31) * 5 + Math.sin(D.t * 0.53) * 4;
  let tx = P.x - P.f * 40 + wx, ty = P.y - 112 + wy;
  let k = 28, damp = 8.5, direct = false;

  if (P.idle < 1) D.nextOrbit = 4;
  if (D.mode === 'follow' && P.idle > D.nextOrbit) { D.mode = 'orbit'; D.modeT = 0; D.oa = Math.atan2((D.y - (P.y - 104)) / 0.3, D.x - P.x); }

  if (D.mode === 'push') {
    const dashT = D.dashT, holdT = 0.3;
    const ex = P.x - P.f * 3, ey = P.y + 23;
    if (D.modeT < dashT) {            // hızlı kavisli süzülüş (ışınlanma yok: konum sürekli)
      const u = smooth(D.modeT / dashT);
      const cx = lerp(D.sx0, ex, 0.4) - P.f * 34, cy = lerp(D.sy0, ey, 0.75);
      const nx = (1 - u) * (1 - u) * D.sx0 + 2 * u * (1 - u) * cx + u * u * ex;
      const ny = (1 - u) * (1 - u) * D.sy0 + 2 * u * (1 - u) * cy + u * u * ey;
      D.vx = (nx - D.x) / dt; D.vy = (ny - D.y) / dt; D.x = nx; D.y = ny; direct = true;
      D.ft = P.f;
    } else if (D.modeT < dashT + holdT) {   // ayaklarının altında: itme pozu
      if (!D.pushHit) {
        D.pushHit = true;
        ripples.push({ x: P.x, y: P.y + 6, r: 0, life: 0.7, small: true });
        burst(P.x, P.y + 2, 10, ['#c9a2ff', '#ffd6f2', '#ffffff'], 190, 0.6, 6);
      }
      const kk = 1 - Math.exp(-dt * 30);
      const nx = lerp(D.x, ex, kk), ny = lerp(D.y, ey, kk);
      D.vx = (nx - D.x) / dt; D.vy = (ny - D.y) / dt; D.x = nx; D.y = ny; direct = true;
      D.ft = P.f;
    } else { D.mode = 'follow'; D.modeT = 0; D.vx = -P.f * 420; D.vy = Math.min(D.vy, 0) - 60; D.lockF = 0.45; }   // arkasından yukarı dön (yüzünü kapatmadan)
  } else if (D.mode === 'orbit') {     // Feza durunca başının üstünde oyuncu bir çember
    const a = D.oa + D.modeT * 2.3;
    tx = P.x + Math.cos(a) * 58; ty = P.y - 104 + Math.sin(a) * 18 + Math.sin(a * 2) * 6;
    k = 40; damp = 10;
    if (D.modeT > 2.73 * 2 || P.idle < 0.5) { D.mode = 'follow'; D.modeT = 0; D.nextOrbit = P.idle + 6; }
  } else if (D.mode === 'happy') {
    if (Math.abs(P.x - D.hx) > 520) { D.mode = 'follow'; D.modeT = 0; }
    else if (D.hphase === 0) {     // çiçeğe uç
      const a = Math.atan2(D.y - D.hy, D.x - D.hx);
      tx = D.hx + Math.cos(a) * D.hr; ty = D.hy + Math.sin(a) * D.hr * 0.85;
      k = 70; damp = 14;
      if ((D.x - P.x) * D.hside < 14 && D.modeT < 0.9) { tx = P.x + D.hside * 34; ty = Math.min(D.y, P.y - 120); }   // Feza'nın başının üstünden geç
      else if (Math.hypot(D.x - tx, D.y - ty) < 12 || D.modeT > 1.2) {
        D.hphase = 1; D.modeT = 0; D.la = a;
        D.ldir = (Math.cos(a) >= 0) ? -1 : 1;     // üstten geçerek dön
        if (Math.sin(a) < 0) D.ldir = -D.ldir;
      }
    } else if (D.hphase === 1) {   // çiçeğin etrafında mutlu bir tur (yol çember; gövde dönmez)
      const a = D.la + D.ldir * D.modeT * 6.283 / 1.15;
      tx = D.hx + Math.cos(a) * D.hr; ty = D.hy + Math.sin(a) * D.hr * 0.85;
      k = 150; damp = 20;
      D.fxT -= dt; if (D.fxT < 0) { D.fxT = 0.09; drFx(D.x, D.y - 4, Math.random() < 0.5 ? 'heart' : 'star'); }
      if (D.modeT > 1.15) { D.hphase = 2; D.modeT = 0; for (let i = 0; i < 5; i++) drFx(D.x, D.y - 10, i % 2 ? 'star' : 'heart'); }
    } else {                         // sevinç zıplaması, sonra Feza'ya dön
      tx = D.hx; ty = D.hy - 10; k = 60; damp = 12;
      D.hop = Math.abs(Math.sin(D.modeT * 11)) * 7 * (1 - D.modeT / 0.7);
      if (D.modeT > 0.7) { D.mode = 'follow'; D.modeT = 0; D.hop = 0; D.exprT = Math.min(D.exprT, 0.8); }
    }
  } else if (D.mode === 'carry') {    // Feza'nın yanında, onu tutar gibi
    tx = P.x - P.f * 36; ty = P.y - 52 - D.modeT * 24; k = 60; damp = 14;
    D.ft = P.f;
    if (D.modeT > 0.9) { D.mode = 'follow'; D.modeT = 0; }
  } else D.mode = 'follow';
  if (D.mode !== 'happy') D.hop = Math.max(0, D.hop - dt * 20);

  if (!direct) {
    D.vx += ((tx - D.x) * k - D.vx * damp) * dt; D.vy += ((ty - D.y) * k - D.vy * damp) * dt;
    const sp = Math.hypot(D.vx, D.vy); if (sp > 1400) { D.vx *= 1400 / sp; D.vy *= 1400 / sp; }
    D.x += D.vx * dt; D.y += D.vy * dt;
  }

  // yön: gecikmeli eşik (titremesin), ölçek 0'dan geçerek dönsün
  D.lockF = Math.max(0, (D.lockF || 0) - dt);
  if (D.mode !== 'push' && D.mode !== 'carry' && D.lockF <= 0) {
    if (Math.abs(D.vx) > 110) { if (Math.sign(D.vx) !== D.ft) D.ft = Math.sign(D.vx); }
    else if (Math.abs(D.vx) < 50) { const rel = P.x - D.x; if (rel * D.ft < -26) D.ft = -D.ft; }
  }
  // dönüş: ~0.19 sn; ortada önden görünüş, yan görünüş tam o sırada çevrilir
  if (D.tt < 0 && D.ft !== D.face) D.tt = 0;
  if (D.tt >= 0) {
    D.tt += dt / 0.19;
    if (D.tt >= 0.5 && D.face !== D.ft) D.face = D.ft;
    if (D.tt >= 1) D.tt = -1;
  }
  const tu = D.tt;
  D.fw = tu < 0 ? 0 : tu < 0.2 ? smooth(tu / 0.2) : tu > 0.8 ? smooth((1 - tu) / 0.2) : 1;
  D.fs = D.face * (1 - D.fw);
  D.f = D.face;

  // eğim: küçük, yerel uzayda (burun yukarı = yükseliş); asla ters dönmez
  const speedX = Math.abs(D.vx);
  const want = clamp(D.vy / 1100, -0.32, 0.32) + clamp(speedX / 3000, 0, 0.12) * (D.vy < 0 ? -0.3 : 1);
  D.tilt = lerp(D.tilt, clamp(want, -0.35, 0.35), 1 - Math.exp(-dt * 8));

  // kanat çırpma: hızlı uçarken/yükselirken hızlı, alçalırken süzülme
  const dashing = D.mode === 'push' || Math.hypot(D.vx, D.vy) > 420;
  let rate = 3.1;
  if (dashing) rate = 7.5; else if (D.vy < -120) rate = 5.2; else if (D.mode === 'happy') rate = 4.6;
  D.flapRate = lerp(D.flapRate, rate, 1 - Math.exp(-dt * 6));
  const glideW = (D.vy > 110 && !dashing && D.mode !== 'push') ? 1 : 0;
  D.glide = lerp(D.glide, glideW, 1 - Math.exp(-dt * 5));
  D.ph += dt * D.flapRate * 6.283 * (1 - D.glide * 0.75);
  D.bob = Math.sin(D.ph - 0.7) * 2.2 * (1 - D.glide) - D.hop;

  // göz/baş Feza'ya baksın
  const sx = D.face;
  let lx = (P.x - D.x) * Math.sign(sx), ly = (P.y - 50 - D.y);
  if (D.mode === 'happy' && D.hphase < 2) { lx = (D.hx - D.x) * Math.sign(sx); ly = D.hy + 30 - D.y; }
  if (D.mode === 'push') { lx = 10; ly = -60; }
  const ll = Math.hypot(lx, ly) || 1;
  D.lookX = lerp(D.lookX, lx / ll, 1 - Math.exp(-dt * 10)); D.lookY = lerp(D.lookY, ly / ll, 1 - Math.exp(-dt * 10));
  D.headTilt = lerp(D.headTilt, clamp(D.lookY * 0.22, -0.18, 0.2) - D.tilt * 0.4, 1 - Math.exp(-dt * 6));
  D.pose = lerp(D.pose, D.mode === 'push' ? 1 : 0, 1 - Math.exp(-dt * (D.mode === 'push' ? 25 : 8)));

  D.exprT -= dt; if (D.exprT <= 0 && D.mode !== 'happy' && D.mode !== 'push') D.expr = 'normal';
  D.blinkT -= dt; if (D.blinkT < -0.14) D.blinkT = 1.6 + Math.random() * 3.4;

  // kuyruk zinciri (gecikmeli takip)
  let prev = drLocal(-7, 6);
  if (Math.hypot(prev.x - D.tail[0].x, prev.y - D.tail[0].y) > 80) drResetTail();
  D.tail[0].x = prev.x; D.tail[0].y = prev.y;
  const sxx = D.fs, ct = Math.cos(D.tilt), st = Math.sin(D.tilt);
  for (let i = 1; i < DR_TAIL_N; i++) {
    const u = i / (DR_TAIL_N - 1);
    const ang = Math.PI - 0.75 + u * 1.7 + Math.sin(D.t * 3.2 - u * 3.2) * 0.32 * (0.4 + u) + D.glide * 0.3;
    const dlx = Math.cos(ang), dly = Math.sin(ang);
    const dwx = sxx * (dlx * ct - dly * st), dwy = dlx * st + dly * ct;
    const p = D.tail[i];
    const kk = 1 - Math.exp(-dt * lerp(26, 7, u));
    p.x = lerp(p.x, prev.x + dwx * DR_TAIL_LEN, kk); p.y = lerp(p.y, prev.y + dwy * DR_TAIL_LEN, kk);
    const ddx = p.x - prev.x, ddy = p.y - prev.y, dd = Math.hypot(ddx, ddy) || 1;
    p.x = prev.x + ddx / dd * DR_TAIL_LEN; p.y = prev.y + ddy / dd * DR_TAIL_LEN;
    prev = p;
  }

  // ışık izi ve parıltılar
  const spd = Math.hypot(D.vx, D.vy);
  if (spd > 380 || D.mode === 'push') D.trail.push({ x: D.x, y: D.y + D.bob, life: 0.28 });
  for (let i = D.trail.length - 1; i >= 0; i--) { D.trail[i].life -= dt; if (D.trail[i].life <= 0) D.trail.splice(i, 1); }
  if (D.mode === 'push' && D.modeT < D.dashT && Math.random() < dt * 60) parts.push({ x: D.x + (Math.random() - 0.5) * 10, y: D.y + (Math.random() - 0.5) * 10, vx: -D.vx * 0.08, vy: -D.vy * 0.08, life: 0.6, max: 0.6, col: Math.random() < 0.5 ? '#e2c8ff' : '#ffffff', size: 6 });
  const tip = D.tail[DR_TAIL_N - 1];
  if (Math.random() < dt * 10) parts.push({ x: tip.x + (Math.random() - 0.5) * 5, y: tip.y + (Math.random() - 0.5) * 5, vx: -D.vx * 0.08 + (Math.random() - 0.5) * 16, vy: 8 + Math.random() * 16, life: 1.0, max: 1.0, col: Math.random() < 0.5 ? '#ffd0f5' : '#e0c8ff', size: 5 });
  for (let i = D.fx.length - 1; i >= 0; i--) {
    const f = D.fx[i]; f.life -= dt; if (f.life <= 0) { D.fx.splice(i, 1); continue; }
    f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= Math.exp(-dt * 2); f.vy = f.vy * Math.exp(-dt * 1.5) - 6 * dt; f.r += f.vr * dt;
  }
}
function drFx(x, y, type) {
  const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, s = 40 + Math.random() * 60;
  D.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1.1, max: 1.1, type, r: (Math.random() - 0.5) * 0.6, vr: (Math.random() - 0.5) * 2,
    col: type === 'heart' ? (Math.random() < 0.5 ? '#ff9ad8' : '#ffc4ec') : (Math.random() < 0.5 ? '#fff2a8' : '#e8d4ff') });
}

// ── çizim ──
function drHeart(x, s) {
  x.beginPath(); x.moveTo(0, s * 0.35);
  x.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.45, -s * 1.05, 0, -s * 0.45);
  x.bezierCurveTo(s * 0.45, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35); x.fill();
}
function drStar(x, s) {
  x.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? s * 0.42 : s, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  x.closePath(); x.fill();
}
function drawTail(x, tm) {
  const tl = D.tail, n = tl.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = tl[Math.max(0, i - 1)], b = tl[Math.min(n - 1, i + 1)];
    let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const r = lerp(5.6, 1.3, Math.pow(i / (n - 1), 0.85));
    L.push([tl[i].x + nx * r, tl[i].y + ny * r]); R.push([tl[i].x - nx * r, tl[i].y - ny * r]);
  }
  const pts = L.concat(R.reverse());
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; x.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
  x.closePath();
  const gr = x.createLinearGradient(tl[0].x, tl[0].y, tl[n - 1].x, tl[n - 1].y);
  gr.addColorStop(0, DR_COL.pur); gr.addColorStop(0.7, '#a77df7'); gr.addColorStop(1, '#e2b8ff');
  x.fillStyle = gr; x.fill();
  x.strokeStyle = DR_COL.line; x.lineWidth = 0.8; x.stroke();
  // sırt dikencikleri kuyrukta
  x.fillStyle = DR_COL.spine;
  for (let i = 1; i < n - 2; i += 2) {
    const a = tl[i - 1], b = tl[i + 1]; let nx = -(b.y - a.y), ny = b.x - a.x; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (ny > 0) { nx = -nx; ny = -ny; }   // üst tarafa
    const r = lerp(5.6, 1.3, i / (n - 1));
    x.beginPath(); x.arc(tl[i].x + nx * r * 0.9, tl[i].y + ny * r * 0.9, 1.7 - i * 0.12, 0, 6.283); x.fill();
  }
  // uçtaki ışık püskülü (Ori'deki gibi küçük ışık kaynağı)
  const p = tl[n - 1], q = tl[n - 2];
  let dx = p.x - q.x, dy = p.y - q.y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  g.globalCompositeOperation = 'lighter';
  const fl = 0.85 + 0.15 * Math.sin(tm * 13) + 0.08 * Math.sin(tm * 29);
  dglow('#ff9fe8', p.x + dx * 3, p.y + dy * 3, 30 * fl, 0.55);
  dglow('#ffffff', p.x + dx * 3, p.y + dy * 3, 10 * fl, 0.8);
  g.globalCompositeOperation = 'source-over';
  x.save(); x.translate(p.x, p.y); x.rotate(Math.atan2(dy, dx));
  const flame = (len, w, col, off) => {
    x.fillStyle = col; x.beginPath(); x.moveTo(-1, 0);
    x.quadraticCurveTo(len * 0.35, -w, len, off); x.quadraticCurveTo(len * 0.35, w, -1, 0); x.fill();
  };
  const wv = Math.sin(tm * 9) * 1.4;
  flame(9 * fl, 4.2, 'rgba(255,170,235,0.75)', wv - 1.5);
  flame(8 * fl, 3.6, 'rgba(225,180,255,0.75)', -wv + 1.8);
  flame(6.5 * fl, 2.6, 'rgba(255,235,252,0.95)', wv * 0.5);
  x.restore();
}
function drawWing(x, far, tm) {
  // kanat açısı: yukarı (+) ↔ aşağı (-); süzülürken açık ve geride
  const w = Math.sin(D.ph + (far ? 0.35 : 0));
  let ang = lerp(-0.95, 0.62, (w + 1) / 2);
  ang = lerp(ang, -0.28 + Math.sin(tm * 3) * 0.06, D.glide);
  ang = lerp(ang, 0.55, D.pose * 0.6);
  const len = 1 + 0.08 * Math.cos(D.ph) * (1 - D.glide);
  x.save(); x.translate(far ? 1.5 : -2.5, far ? -6.5 : -4.5); x.rotate(ang); x.scale(len * (far ? 0.9 : 1.12), far ? 0.98 : 1.12);
  const Wr = [-7, -13], T1 = [-21, -25], T2 = [-27, -13], T3 = [-21, -2], B = [-6, -1];
  const memb = () => {
    x.beginPath(); x.moveTo(0, 0); x.lineTo(Wr[0], Wr[1]); x.lineTo(T1[0], T1[1]);
    x.quadraticCurveTo(-19, -16, T2[0], T2[1]);
    x.quadraticCurveTo(-18, -8, T3[0], T3[1]);
    x.quadraticCurveTo(-11, -4, B[0], B[1]); x.closePath();
  };
  memb();
  const gr = x.createLinearGradient(0, 0, -24, -16);
  if (far) { gr.addColorStop(0, 'rgba(98,58,190,0.95)'); gr.addColorStop(1, 'rgba(150,105,230,0.8)'); }
  else { gr.addColorStop(0, 'rgba(150,100,250,0.92)'); gr.addColorStop(0.6, 'rgba(196,160,255,0.78)'); gr.addColorStop(1, 'rgba(240,200,255,0.72)'); }
  x.fillStyle = gr; x.fill();
  // parlayan kenar
  if (!far) {
    x.save(); x.globalCompositeOperation = 'lighter';
    x.strokeStyle = 'rgba(255,190,250,0.22)'; x.lineWidth = 3.2; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(T1[0], T1[1]); x.quadraticCurveTo(-19, -16, T2[0], T2[1]); x.quadraticCurveTo(-18, -8, T3[0], T3[1]); x.quadraticCurveTo(-11, -4, B[0], B[1]); x.stroke();
    x.strokeStyle = 'rgba(255,230,255,0.45)'; x.lineWidth = 1; x.stroke();
    x.restore();
  }
  // parmak kemikleri
  x.strokeStyle = far ? '#4f2a9c' : '#6c3fcf'; x.lineCap = 'round'; x.lineWidth = 1.8;
  x.beginPath(); x.moveTo(0, 0); x.lineTo(Wr[0], Wr[1]); x.stroke();
  x.lineWidth = 1.1;
  x.beginPath(); x.moveTo(Wr[0], Wr[1]); x.lineTo(T1[0], T1[1]); x.moveTo(Wr[0], Wr[1]); x.lineTo(T2[0], T2[1]); x.moveTo(Wr[0], Wr[1]); x.lineTo(T3[0], T3[1]); x.stroke();
  x.fillStyle = far ? '#d9c2a0' : DR_COL.horn; x.beginPath(); x.arc(Wr[0], Wr[1], 1.2, 0, 6.283); x.fill();
  x.strokeStyle = far ? 'rgba(60,30,120,0.6)' : 'rgba(70,35,140,0.55)'; x.lineWidth = 0.7; x.lineJoin = 'round'; memb(); x.stroke();
  x.restore();
}
function drFrontEye(x, cx, cy, rx, ry, lash, blink) {
  x.save(); x.translate(cx, cy);
  if (blink <= 0.4) {
    x.strokeStyle = DR_COL.eye; x.lineWidth = 1.2; x.lineCap = 'round';
    x.beginPath(); x.moveTo(-rx, 0); x.quadraticCurveTo(0, ry * 0.5, rx, 0); x.stroke(); x.restore(); return;
  }
  x.scale(1, blink);
  x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.clip();
  const ox = D.lookX * D.face * rx * 0.28, oy = D.lookY * ry * 0.2 + ry * 0.08;
  const ig = x.createLinearGradient(0, oy - ry, 0, oy + ry);
  ig.addColorStop(0, '#22094a'); ig.addColorStop(0.5, '#5a26b8'); ig.addColorStop(0.85, '#a66cf0'); ig.addColorStop(1, '#ffcf8a');
  x.fillStyle = ig; x.beginPath(); x.ellipse(ox, oy, rx * 0.86, ry * 0.86, 0, 0, 6.283); x.fill();
  x.fillStyle = '#12051f'; x.beginPath(); x.ellipse(ox, oy - ry * 0.04, rx * 0.5, ry * 0.56, 0, 0, 6.283); x.fill();
  x.fillStyle = '#ffffff';
  x.beginPath(); x.ellipse(ox + rx * 0.22, oy - ry * 0.36, rx * 0.36, ry * 0.25, -0.3, 0, 6.283); x.fill();
  x.beginPath(); x.arc(ox - rx * 0.3, oy + ry * 0.4, rx * 0.16, 0, 6.283); x.fill();
  x.restore();
  x.strokeStyle = DR_COL.eye; x.lineWidth = 1.1; x.lineCap = 'round';
  x.beginPath(); x.ellipse(0, 0, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.92); x.stroke();
  x.beginPath(); x.moveTo(lash * rx * 0.92, -ry * 0.38); x.lineTo(lash * rx * 1.3, -ry * 0.62); x.stroke();
  x.strokeStyle = 'rgba(58,26,128,0.35)'; x.lineWidth = 0.5; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, Math.PI); x.stroke();
  x.restore();
}
function drFront(x, tm) {   // önden görünüş (dönüş anında)
  const C = DR_COL, pose = D.pose, lg = D.glide * 2;
  // kanatlar iki yana simetrik
  for (const sd of [1, -1]) { x.save(); x.scale(sd, 1); x.translate(-2.5, 0.5); x.rotate(-0.12); drawWing(x, false, tm); x.restore(); }
  // kollar yukarıdaysa başın arkasında
  const arm = (sd) => {
    const shx = sd * 5, shy = -0.5;
    const px = sd * lerp(6.2, 8.5, pose), py = lerp(3, -25.5, pose);
    x.strokeStyle = C.pur; x.lineWidth = 3.2; x.lineCap = 'round';
    x.beginPath(); x.moveTo(shx, shy); x.lineTo(px, py); x.stroke();
    x.fillStyle = C.lav; x.beginPath(); x.arc(px, py, 2.1 + pose * 0.5, 0, 6.283); x.fill();
    x.strokeStyle = C.line; x.lineWidth = 0.6; x.stroke();
  };
  if (pose > 0.3) { arm(-1); arm(1); }
  // bacaklar
  for (const sd of [-1, 1]) {
    x.fillStyle = C.pur; x.beginPath(); x.ellipse(sd * 5.2, 9 - lg * 0.5, 4, 3.8, 0, 0, 6.283); x.fill();
    x.strokeStyle = C.line; x.lineWidth = 0.7; x.stroke();
    x.fillStyle = C.lav; x.beginPath(); x.ellipse(sd * 5.6, 12.4 - lg, 3.2, 1.9, 0, 0, 6.283); x.fill(); x.stroke();
    x.fillStyle = C.pink; for (let i = -1; i <= 1; i++) { x.beginPath(); x.arc(sd * 5.6 + i * 1.3, 12.9 - lg, 0.5, 0, 6.283); x.fill(); }
  }
  // gövde ve karın
  const bg = x.createRadialGradient(0, -1, 1, 0, 3, 13);
  bg.addColorStop(0, C.purL); bg.addColorStop(0.6, C.pur); bg.addColorStop(1, C.purD);
  x.fillStyle = bg; x.beginPath(); x.ellipse(0, 3, 9.4, 9.6, 0, 0, 6.283); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  x.fillStyle = C.lav; x.beginPath(); x.ellipse(0, 4.8, 5.8, 7, 0, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(0, 4.8, 5.8, 7, 0, 0, 6.283); x.clip();
  x.strokeStyle = 'rgba(160,120,220,0.55)'; x.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) { const yy = 1 + i * 3.2; x.beginPath(); x.moveTo(-6, yy); x.quadraticCurveTo(0, yy + 1.6, 6, yy); x.stroke(); }
  x.restore();
  if (pose <= 0.3) { arm(-1); arm(1); }
  // kafa
  x.save(); x.translate(0, -9); x.rotate(D.headTilt * 0.3 * D.face); x.translate(0, 9);
  const ef = Math.sin(tm * 3.1) * 0.12 + (D.expr === 'happy' ? Math.sin(tm * 14) * 0.15 : 0);
  for (const sd of [-1, 1]) {   // kulak yüzgeçleri
    x.save(); x.scale(sd, 1); x.translate(-8.5, -13); x.rotate(ef - 0.15);
    x.fillStyle = C.pink; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-5, -7, -9.5, -6.5); x.quadraticCurveTo(-7.5, -4, -9.5, -2); x.quadraticCurveTo(-7, -0.5, -8, 2.5); x.quadraticCurveTo(-4, 2, 0, 3); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(170,70,170,0.7)'; x.lineWidth = 0.6; x.stroke();
    x.beginPath(); x.moveTo(0, 1); x.lineTo(-9, -6); x.moveTo(0, 1.5); x.lineTo(-8.8, -1.5); x.stroke();
    x.restore();
  }
  for (const sd of [-1, 1]) {   // boynuzlar
    x.save(); x.scale(sd, 1); x.translate(-4.6, -19.6); x.rotate(0.15); x.scale(1.2, 1.2);
    const hg = x.createLinearGradient(0, 0, -6, -7); hg.addColorStop(0, C.horn); hg.addColorStop(1, '#fffaf0');
    x.fillStyle = hg; x.beginPath(); x.moveTo(-2.4, 0.8); x.quadraticCurveTo(-3.4, -4.6, -6.6, -7.6); x.quadraticCurveTo(-6.2, -8.6, -5.4, -7.9); x.quadraticCurveTo(0.6, -5, 2.4, 0); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(120,80,50,0.8)'; x.lineWidth = 0.7; x.stroke();
    x.restore();
  }
  const hg = x.createRadialGradient(0, -17, 1, 0, -11, 15);
  hg.addColorStop(0, '#b996ff'); hg.addColorStop(0.6, C.pur); hg.addColorStop(1, C.purD);
  x.fillStyle = hg; x.beginPath(); x.ellipse(0, -11.4, 11.8, 10.2, 0, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(0, -11.4, 11.8, 10.2, 0, 0, 6.283); x.clip();
  const mg = x.createRadialGradient(0, -6, 0.5, 0, -6, 7);
  mg.addColorStop(0, 'rgba(214,190,255,0.85)'); mg.addColorStop(1, 'rgba(214,190,255,0)');
  x.fillStyle = mg; x.fillRect(-10, -14, 20, 14);
  x.restore();
  x.strokeStyle = C.line; x.lineWidth = 0.8; x.beginPath(); x.ellipse(0, -11.4, 11.8, 10.2, 0, 0, 6.283); x.stroke();
  x.strokeStyle = 'rgba(255,240,255,0.42)'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(0, -11, 10.4, 8.8, 0, -2.5, -0.64); x.stroke();
  x.fillStyle = '#4a2390'; x.beginPath(); x.ellipse(-1.7, -7.6, 0.55, 0.45, 0, 0, 6.283); x.ellipse(1.7, -7.6, 0.55, 0.45, 0, 0, 6.283); x.fill();
  const blush = D.expr === 'normal' ? 0.42 : 0.7;
  x.fillStyle = 'rgba(255,128,196,' + blush + ')';
  x.beginPath(); x.ellipse(-7.6, -6.4, 2.4, 1.4, 0, 0, 6.283); x.ellipse(7.6, -6.4, 2.4, 1.4, 0, 0, 6.283); x.fill();
  const blink = D.blinkT < 0 ? Math.max(0.08, Math.abs(D.blinkT + 0.07) / 0.07) : 1;
  x.strokeStyle = C.eye; x.lineCap = 'round'; x.lineJoin = 'round';
  if (D.expr === 'happy') {
    x.lineWidth = 1.5;
    for (const sd of [-1, 1]) { x.beginPath(); x.moveTo(sd * 5.4 - 3.1, -11); x.quadraticCurveTo(sd * 5.4, -15.6, sd * 5.4 + 3.1, -11); x.stroke(); }
  } else if (D.expr === 'effort') {
    x.lineWidth = 1.4;
    for (const sd of [-1, 1]) { const cx = sd * 5.4; x.beginPath(); x.moveTo(cx - sd * 2.6, -14.6); x.lineTo(cx + sd * 2, -12.2); x.lineTo(cx - sd * 2.6, -10); x.stroke(); }
  } else {
    drFrontEye(x, -5.4, -12.2, 3.6, 4.8, -1, blink);
    drFrontEye(x, 5.4, -12.2, 3.6, 4.8, 1, blink);
  }
  x.strokeStyle = C.eye; x.lineWidth = 0.9;
  if (D.expr === 'happy') {
    x.fillStyle = '#5b1d5f'; x.beginPath(); x.moveTo(-2.8, -4.6); x.quadraticCurveTo(0, -0.6, 2.8, -4.6); x.quadraticCurveTo(0, -3.8, -2.8, -4.6); x.fill();
    x.fillStyle = '#ff8fc8'; x.beginPath(); x.ellipse(0, -2.5, 1.5, 0.8, 0, 0, 6.283); x.fill();
  } else if (D.expr === 'effort') {
    x.fillStyle = '#5b1d5f'; x.beginPath(); x.ellipse(0, -4, 1.4, 1.05, 0, 0, 6.283); x.fill();
  } else {
    x.beginPath(); x.moveTo(-2.7, -4.6); x.quadraticCurveTo(-1.35, -3.2, 0, -4.2); x.quadraticCurveTo(1.35, -3.2, 2.7, -4.6); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(1.0, -3.85); x.lineTo(1.8, -3.75); x.lineTo(1.35, -2.9); x.closePath(); x.fill();
  }
  x.restore();
}
const drCanv = [];
function drSide(x, tm) {   // yandan görünüş (sağa bakan yerel uzay)
  const C = DR_COL, pose = D.pose;

  drawWing(x, true, tm);
  // uzak arka bacak ve kol
  x.fillStyle = C.purD;
  x.beginPath(); x.ellipse(3.5, 9 - D.glide * 1.5, 3.6, 3.4, 0, 0, 6.283); x.fill();
  x.beginPath(); x.ellipse(6.5, 12 - D.glide * 2, 3, 1.7, 0, 0, 6.283); x.fill();
  // kollar (itmede yukarıda, başın arkasında)
  const arm = (far) => {
    const shx = far ? 6 : 4, shy = far ? -1.5 : 0;
    const px = lerp(far ? 10.5 : 8.8, far ? 12.5 : 2, pose), py = lerp(far ? 2.2 : 3.8, far ? -24.5 : -26.5, pose);
    x.strokeStyle = far ? C.purD : C.pur; x.lineWidth = 3.2; x.lineCap = 'round';
    x.beginPath(); x.moveTo(shx, shy); x.lineTo(px, py); x.stroke();
    x.fillStyle = far ? C.lavD : C.lav; x.beginPath(); x.arc(px, py, 2.1 + pose * 0.5, 0, 6.283); x.fill();
    x.strokeStyle = C.line; x.lineWidth = 0.6; x.stroke();
  };
  if (pose > 0.3) { arm(true); arm(false); } else arm(true);

  // gövde
  const bg = x.createRadialGradient(2, -2, 1, 0, 3, 13);
  bg.addColorStop(0, C.purL); bg.addColorStop(0.6, C.pur); bg.addColorStop(1, C.purD);
  x.fillStyle = bg; x.beginPath(); x.ellipse(-0.5, 3, 9.2, 9.8, -0.15, 0, 6.283); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  // sırt dikenleri (yuvarlak)
  for (let i = 0; i < 3; i++) {
    const a = -2.35 + i * 0.42, ex = -0.5 + Math.cos(a) * 9.2, ey = 3 + Math.sin(a) * 9.8;
    x.save(); x.translate(ex, ey); x.rotate(a + Math.PI / 2);
    x.fillStyle = C.spine; x.beginPath(); x.ellipse(0, -1, 2.4 - i * 0.3, 2.6 - i * 0.3, 0, Math.PI, 0); x.fill();
    x.strokeStyle = 'rgba(150,70,170,0.6)'; x.lineWidth = 0.6; x.stroke();
    x.restore();
  }
  // karın ve plaka çizgileri
  x.fillStyle = C.lav; x.beginPath(); x.ellipse(3.6, 4.6, 5.2, 7.2, -0.22, 0, 6.283); x.fill();
  x.save(); x.beginPath(); x.ellipse(3.6, 4.6, 5.2, 7.2, -0.22, 0, 6.283); x.clip();
  x.strokeStyle = 'rgba(160,120,220,0.55)'; x.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) { const yy = 0 + i * 3.2; x.beginPath(); x.moveTo(-1, yy + 1.2); x.quadraticCurveTo(3.8, yy + 2.6, 9, yy - 0.2); x.stroke(); }
  x.restore();
  // yakın arka bacak
  const lg = D.glide * 2;
  x.fillStyle = C.pur; x.beginPath(); x.ellipse(-3.2, 8.6 - lg * 0.5, 4.6, 4.2, -0.3, 0, 6.283); x.fill();
  x.strokeStyle = C.line; x.lineWidth = 0.7; x.stroke();
  x.fillStyle = C.lav; x.beginPath(); x.ellipse(-0.6, 12.4 - lg, 3.6, 2, 0.1, 0, 6.283); x.fill(); x.stroke();
  x.fillStyle = C.pink; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(1.4 + i * 0.1, 11.3 - lg + i * 1.0, 0.55, 0, 6.283); x.fill(); }
  if (pose <= 0.3) arm(false);

  drawWing(x, false, tm);

  // ── kafa ──
  x.save(); x.translate(4.5, -9); x.rotate(D.headTilt); x.translate(-4.5, 9);
  // kulak yüzgeci
  const ef = Math.sin(tm * 3.1) * 0.12 + (D.expr === 'happy' ? Math.sin(tm * 14) * 0.15 : 0);
  x.save(); x.translate(-3.5, -12.5); x.rotate(ef);
  x.fillStyle = C.pink; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(-5, -7, -9.5, -6.5); x.quadraticCurveTo(-7.5, -4, -9.5, -2); x.quadraticCurveTo(-7, -0.5, -8, 2.5); x.quadraticCurveTo(-4, 2, 0, 3); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(170,70,170,0.7)'; x.lineWidth = 0.6; x.stroke();
  x.beginPath(); x.moveTo(0, 1); x.lineTo(-9, -6); x.moveTo(0, 1.5); x.lineTo(-8.8, -1.5); x.stroke();
  x.restore();
  // boynuzlar
  const horn = (bx, by, s, col) => {
    x.save(); x.translate(bx, by); x.scale(s, s);
    const hg = x.createLinearGradient(0, 0, -6, -7); hg.addColorStop(0, col); hg.addColorStop(1, '#fffaf0');
    x.fillStyle = hg; x.beginPath(); x.moveTo(-2.4, 0.8); x.quadraticCurveTo(-3.4, -4.6, -6.6, -7.6); x.quadraticCurveTo(-6.2, -8.6, -5.4, -7.9); x.quadraticCurveTo(0.6, -5, 2.4, 0); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(120,80,50,0.8)'; x.lineWidth = 0.7; x.stroke();
    x.restore();
  };
  horn(7.6, -20, 1.05, C.hornD);
  horn(2, -19.6, 1.3, C.horn);
  // kafa + kısa yumuşak burun: tek parça yuvarlak şekil
  const headPath = () => {
    x.beginPath(); x.moveTo(-5.5, -8);
    x.bezierCurveTo(-6, -16.5, -1, -21.8, 5, -21.8);
    x.bezierCurveTo(10.8, -21.8, 13.6, -18.4, 14.6, -14.8);
    x.bezierCurveTo(15.8, -13.4, 18.6, -12, 18.6, -8.6);
    x.bezierCurveTo(18.6, -5, 15.6, -2.9, 11.6, -2.8);
    x.bezierCurveTo(7, -2.6, 1, -1.4, -2, -3.4);
    x.bezierCurveTo(-4.4, -4.9, -5.3, -6.4, -5.5, -8); x.closePath();
  };
  const hg = x.createRadialGradient(6, -17, 1, 5, -11, 15);
  hg.addColorStop(0, '#b996ff'); hg.addColorStop(0.6, C.pur); hg.addColorStop(1, C.purD);
  headPath(); x.fillStyle = hg; x.fill();
  x.save(); headPath(); x.clip();
  // burun ve çene: aynı şeklin içinde yumuşak açık ton (ayrı topak yok)
  const mg = x.createRadialGradient(15, -6.5, 0.5, 15, -6.5, 7.5);
  mg.addColorStop(0, 'rgba(214,190,255,0.85)'); mg.addColorStop(1, 'rgba(214,190,255,0)');
  x.fillStyle = mg; x.fillRect(5, -16, 16, 15);
  // üst kenar ışığı
  x.beginPath(); x.rect(-8, -30, 30, 14); x.clip();
  x.translate(0.6, 1.4); headPath(); x.strokeStyle = 'rgba(255,240,255,0.42)'; x.lineWidth = 1.2; x.stroke();
  x.restore();
  headPath(); x.strokeStyle = C.line; x.lineWidth = 0.8; x.stroke();
  // burun deliği (tek nokta)
  x.fillStyle = '#4a2390'; x.beginPath(); x.ellipse(17.1, -9.6, 0.62, 0.48, -0.3, 0, 6.283); x.fill();
  // yanak pembeliği (gözün altında)
  const blush = D.expr === 'normal' ? 0.42 : 0.7;
  x.fillStyle = `rgba(255,128,196,${blush})`; x.beginPath(); x.ellipse(6.6, -5.6, 2.7, 1.5, 0, 0, 6.283); x.fill();

  // gözler (ikisi de kafanın içinde; uzak göz burun köprüsünün arkasında, küçük)
  const ex1 = 6.3, ey1 = -12, ex2 = 12.9, ey2 = -12.6;
  x.save(); headPath(); x.clip();   // gözler asla kafa çizgisinin dışına taşmasın
  const blink = D.blinkT < 0 ? Math.max(0.08, Math.abs(D.blinkT + 0.07) / 0.07) : 1;
  x.strokeStyle = C.eye; x.lineCap = 'round'; x.lineJoin = 'round';
  if (D.expr === 'happy') {
    x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(ex1 - 3.2, ey1 + 1.3); x.quadraticCurveTo(ex1, ey1 - 3.4, ex1 + 3.2, ey1 + 1.3); x.stroke();
    x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(ex2 - 1.6, ey2 + 1.1); x.quadraticCurveTo(ex2 + 0.1, ey2 - 2.4, ex2 + 1.5, ey2 + 1.1); x.stroke();
  } else if (D.expr === 'effort') {
    x.lineWidth = 1.4;
    x.beginPath(); x.moveTo(ex1 - 2.8, ey1 - 2.4); x.lineTo(ex1 + 2, ey1); x.lineTo(ex1 - 2.8, ey1 + 2.2); x.stroke();
    x.lineWidth = 1.1;
    x.beginPath(); x.moveTo(ex2 + 1.4, ey2 - 2); x.lineTo(ex2 - 1.2, ey2); x.lineTo(ex2 + 1.4, ey2 + 1.9); x.stroke();
  } else {
    const eye = (cx, cy, rx, ry, near) => {
      x.save(); x.translate(cx, cy);
      if (blink <= 0.4) {   // kapalı göz: yumuşak kavis
        x.strokeStyle = C.eye; x.lineWidth = near ? 1.3 : 1; x.beginPath(); x.moveTo(-rx, 0); x.quadraticCurveTo(0, ry * 0.5, rx, 0); x.stroke();
        x.restore(); return;
      }
      x.scale(1, blink);
      x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.fill();
      x.save(); x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, 6.283); x.clip();
      const ox = D.lookX * rx * 0.28, oy = D.lookY * ry * 0.2 + ry * 0.08;
      const ig = x.createLinearGradient(0, oy - ry, 0, oy + ry);
      ig.addColorStop(0, '#22094a'); ig.addColorStop(0.5, '#5a26b8'); ig.addColorStop(0.85, '#a66cf0'); ig.addColorStop(1, '#ffcf8a');
      x.fillStyle = ig; x.beginPath(); x.ellipse(ox, oy, rx * 0.86, ry * 0.86, 0, 0, 6.283); x.fill();
      x.fillStyle = '#12051f'; x.beginPath(); x.ellipse(ox, oy - ry * 0.04, rx * 0.5, ry * 0.56, 0, 0, 6.283); x.fill();
      x.fillStyle = '#ffffff';
      x.beginPath(); x.ellipse(ox + rx * 0.22, oy - ry * 0.36, rx * 0.36, ry * 0.25, -0.3, 0, 6.283); x.fill();
      x.beginPath(); x.arc(ox - rx * 0.3, oy + ry * 0.4, rx * 0.16, 0, 6.283); x.fill();
      x.restore();
      // yumuşak üst göz kapağı çizgisi
      x.strokeStyle = C.eye; x.lineWidth = near ? 1.1 : 0.8;
      x.beginPath(); x.ellipse(0, 0, rx, ry, 0, Math.PI * 1.08, Math.PI * 1.95); x.stroke();
      if (near) { x.beginPath(); x.moveTo(-rx * 0.92, -ry * 0.38); x.lineTo(-rx * 1.3, -ry * 0.62); x.stroke(); }
      x.strokeStyle = 'rgba(58,26,128,0.35)'; x.lineWidth = 0.5; x.beginPath(); x.ellipse(0, 0, rx, ry, 0, 0, Math.PI); x.stroke();
      x.restore();
    };
    eye(ex2, ey2, 1.9, 3.9, false);
    eye(ex1, ey1, 3.95, 5.1, true);
  }
  x.restore();
  // ağız: burnun köşesinde tek yumuşak gülümseme
  x.strokeStyle = C.eye; x.lineWidth = 0.9; x.lineCap = 'round';
  if (D.expr === 'happy') {
    x.fillStyle = '#5b1d5f'; x.beginPath(); x.moveTo(17.6, -5.6); x.quadraticCurveTo(15.4, -0.9, 12.4, -5); x.quadraticCurveTo(15, -4.1, 17.6, -5.6); x.fill();
    x.fillStyle = '#ff8fc8'; x.beginPath(); x.ellipse(14.8, -2.6, 1.6, 0.9, 0, 0, 6.283); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(15.9, -4.6); x.lineTo(16.8, -4.9); x.lineTo(16.5, -3.8); x.closePath(); x.fill();
  } else if (D.expr === 'effort') {
    x.fillStyle = '#5b1d5f'; x.beginPath(); x.ellipse(15.6, -4.3, 1.5, 1.1, 0, 0, 6.283); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.arc(13, -24, 1, 0, 6.283); x.arc(15.2, -25.6, 0.6, 0, 6.283); x.fill();
  } else {
    x.beginPath(); x.moveTo(17.7, -5.5); x.quadraticCurveTo(15.2, -3.6, 12.6, -5.1); x.stroke();
    x.beginPath(); x.moveTo(12.2, -5.7); x.quadraticCurveTo(12.4, -5.0, 12.9, -4.8); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(15.5, -4.25); x.lineTo(16.3, -4.5); x.lineTo(16.0, -3.5); x.closePath(); x.fill();
  }
  x.restore();   // kafa
}

function drawDragon(tm) {
  dragonInit();
  const x = g;
  // ışık izi (hızlı süzülüş)
  if (D.trail.length > 1) {
    x.save(); x.globalCompositeOperation = 'lighter'; x.lineCap = 'round';
    for (let i = 1; i < D.trail.length; i++) {
      const a = D.trail[i - 1], b = D.trail[i], al = Math.min(a.life, b.life) / 0.28;
      x.strokeStyle = `rgba(200,160,255,${0.35 * al})`; x.lineWidth = 16 * al;
      x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
      x.strokeStyle = `rgba(255,235,255,${0.6 * al})`; x.lineWidth = 4 * al; x.stroke();
    }
    x.restore();
  }
  // gövdenin arkasında yumuşak ışık
  x.globalCompositeOperation = 'lighter';
  dglow('#a678ff', D.x, D.y + D.bob - 4, 44, 0.2);
  x.globalCompositeOperation = 'source-over';
  drawTail(x, tm);

  // poz: yandan görünüş; dönüşte kısa bir önden görünüşe geçer (karton gibi incelmez)
  const fw = D.fw;
  const drawAt = (ctx, ox, oy, front) => {
    ctx.save(); ctx.translate(ox, oy + D.bob);
    if (front) { ctx.rotate(D.tilt * 0.4 * D.face); drFront(ctx, tm); }
    else { ctx.scale(D.face * (1 - 0.12 * fw), 1); ctx.rotate(D.tilt); drSide(ctx, tm); }
    ctx.restore();
  };
  if (fw <= 0.001) drawAt(x, D.x, D.y, false);
  else if (fw >= 0.999) drawAt(x, D.x, D.y, true);
  else {   // kısa geçiş: iki poz ayrı tuvallerde çizilip karıştırılır
    const R = 56, px = Math.ceil(R * 2 * S);
    for (let k = 0; k < 2; k++) {
      let oc = drCanv[k]; if (!oc) oc = drCanv[k] = document.createElement('canvas');
      if (oc.width !== px) { oc.width = oc.height = px; }
      const c2 = oc.getContext('2d'); c2.setTransform(1, 0, 0, 1, 0, 0); c2.clearRect(0, 0, px, px);
      c2.setTransform(S, 0, 0, S, R * S, R * S);
      drawAt(c2, 0, 0, k === 1);
      x.globalAlpha = k === 0 ? Math.min(1, 2 * (1 - fw)) : Math.min(1, 2.5 * fw);   // önden poz hep üstte: yarı saydam gövde olmaz
      x.drawImage(oc, D.x - R, D.y - R, R * 2, R * 2);
    }
    x.globalAlpha = 1;
  }

  // kalpler ve yıldızlar
  for (const f of D.fx) {
    const a = f.life / f.max, s = (f.type === 'heart' ? 4.2 : 4.6) * (0.6 + 0.4 * Math.min(1, (f.max - f.life) * 6));
    x.globalCompositeOperation = 'lighter'; dglow(f.col, f.x, f.y, 12, a * 0.5); x.globalCompositeOperation = 'source-over';
    x.save(); x.translate(f.x, f.y); x.rotate(f.r); x.globalAlpha = Math.min(1, a * 1.6); x.fillStyle = f.col;
    if (f.type === 'heart') drHeart(x, s); else drStar(x, s);
    x.restore();
  }
  x.globalAlpha = 1;
}

// ── Işık nefesi (yer tutucu): Feza karanlık bir yere yaklaşınca Pırıl ışık üfler → o gruptaki nesneler belirir ──
TUR.kaydet('karanlik', { dokun(o) { burst(o.x + 80, o.y - 60, 40, ['#d9b8ff', '#bff4ff', '#ffffff'], 200, 1.4, 9); setTimeout(() => OLAY.emit('aydinlat', o.grup), 700); } });

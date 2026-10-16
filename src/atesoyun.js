/* Anka'nın vadisi: isteğe bağlı, gerçekten taşınabilen ve açılan dünya oyuncakları.
   Ana patika daima güvenli; hiçbir oyuncak sayı toplama veya okuma istemez. */
'use strict';
const AO5 = { leaf: null, point: { x: 0, y: 0 } };
function ao5Playing(dt) { return dt > 0 && Number.isFinite(dt) && DURUM === 'oyun'; }
function ao5Part(parent, index, x, top, w, active) {
  const o = { tip: 'korOyuncakYaprak', id: parent.id + '_yaprak' + index,
    x, y: top + 12, top, index, parent, alpha: active ? 1 : 0,
    cisim: { w, h: 12, tip: 'ustten', aktif: active, dx: 0, dy: 0 } };
  NESNELER.push(o); return o;
}
function ao5FlowerOpen(o, source) {
  if (o.opening) return false;
  o.opening = true; o.openAge = 0; o.activationSource = source;
  burst(o.x, o.y - 90, 22, ['#fff0d0', '#54b9ad', '#f1b36d'], 95, 1.8, 4);
  OLAY.emit('buharZip', o); return true;
}
function ao5Feather(x, y, scale, tm, alpha) {
  g.save(); g.translate(x, y); g.rotate(-.5 + Math.sin(tm * 1.1) * .08); g.scale(scale, scale); g.globalAlpha = alpha;
  g.fillStyle = '#ed9a58'; g.strokeStyle = '#ffe1a3'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(0, 37); g.bezierCurveTo(-32, 8, -31, -35, 0, -73); g.bezierCurveTo(30, -37, 29, 3, 0, 37); g.fill(); g.stroke();
  g.fillStyle = '#bf4979'; g.beginPath(); g.moveTo(0, 35); g.lineTo(0, -67); g.bezierCurveTo(22, -26, 18, 8, 0, 35); g.fill();
  g.strokeStyle = '#fff1c7'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, 49); g.quadraticCurveTo(-4, 0, 0, -61); g.stroke();
  g.lineWidth = .8; for (let i = 0; i < 6; i++) { const yy = -49 + i * 13; g.beginPath(); g.moveTo(0, yy + 12); g.lineTo(-15 - Math.sin(i / 5 * Math.PI) * 7, yy - 1); g.moveTo(0, yy + 12); g.lineTo(15 + Math.sin(i / 5 * Math.PI) * 5, yy - 1); g.stroke(); }
  g.restore();
}
TUR.kaydet('ankaTuyIzi', {
  kur(o) { o.age = 0; o.lift = 0; o.done = false; },
  dokun(o) {
    if (o.done || P.ucus) return; o.done = true; o.lift = 0;
    burst(o.x, o.y - 80, 14, ['#ffe1a3', '#e9a77b', '#cf679b'], 75, 1.5, 3.5);
    OLAY.emit('volkanKristal', { source: 'ankaIzi', index: 0, notes: [0, 4, 7] });
    if (typeof dragonHappy === 'function') dragonHappy(o);
  },
  guncelle(o, dt) { if (!ao5Playing(dt)) return; o.age += dt; if (o.done) o.lift = Math.min(1, o.lift + dt * .3); },
  ciz(o, tm) {
    if (o.lift >= 1) return; const u = smooth(o.lift);
    ao5Feather(o.x + u * 90, o.y - 82 - u * 145 + Math.sin(tm * 1.2) * 4, .65 - u * .25, tm, 1 - u);
    if (!o.done) { g.save(); g.globalAlpha = .25; g.strokeStyle = '#ffdeb3'; g.lineWidth = 1; g.beginPath(); g.ellipse(o.x, o.y - 6, 43, 8, 0, 0, Math.PI * 2); g.stroke(); g.restore(); }
  }
});
TUR.kaydet('korOyuncakYaprak', {
  ciz(o, tm) {
    if (o.alpha < .005) return; const top = o.y - o.cisim.h;
    g.save(); g.globalAlpha = o.alpha;
    if (o.parent.tip === 'korTerazi') {
      g.drawImage(vk5StepArt(o.index % 3), o.x - 84, top - 17, 168, 56);
      g.strokeStyle = '#f0c887'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(o.x - 57, top + 1); g.quadraticCurveTo(o.x, top - 7, o.x + 57, top + 1); g.stroke();
    } else {
      g.translate(o.x, top + 4); g.rotate(Math.sin(tm * .8 + o.index) * .012);
      g.fillStyle = '#367d83'; g.strokeStyle = '#e5e5ba'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(-62, 2); g.bezierCurveTo(-49, -22, 35, -27, 65, 0); g.quadraticCurveTo(24, 32, -25, 22); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#81c7b6'; g.beginPath(); g.moveTo(-58, 0); g.quadraticCurveTo(-1, -20, 61, 0); g.lineTo(-8, 6); g.closePath(); g.fill();
      g.strokeStyle = '#fff0c5'; g.lineWidth = .9; g.beginPath(); g.moveTo(-52, 0); g.quadraticCurveTo(0, -5, 55, 0); g.stroke();
      g.strokeStyle = '#66a9a9'; for (let i = 0; i < 4; i++) { const xx = -35 + i * 24; g.beginPath(); g.moveTo(xx, 0); g.lineTo(xx + 13, 14); g.stroke(); }
    }
    g.restore();
  }
});
TUR.kaydet('korTerazi', {
  kur(o) {
    o.tilt = 0; o.age = 0; o.baseY = o.y; o.parts = [];
    for (let i = 0; i < 4; i++) o.parts.push(ao5Part(o, i, o.x + (i - 1.5) * 140, o.y, 148, true));
  },
  guncelle(o, dt) {
    if (!ao5Playing(dt)) return; o.age += dt; let standing = false;
    if (!P.ucus && P.ground) for (const q of o.parts) if (Math.abs(P.x - q.x) < 82 && Math.abs(P.y - (q.y - 12)) < 28) { standing = true; break; }
    const target = standing ? clamp((P.x - o.x) / 220, -1, 1) * .26 : 0;
    o.tilt += (target - o.tilt) * (1 - Math.exp(-dt * 3.4));
    for (const q of o.parts) { const before = q.y; q.y = o.baseY + (q.x - o.x) * o.tilt + 12; q.cisim.dy = q.y - before; }
  },
  ciz(o, tm) {
    g.save(); g.strokeStyle = '#3b334f'; g.lineWidth = 15; g.lineCap = 'round';
    g.beginPath(); g.moveTo(o.x - 242, o.baseY - 242 * o.tilt + 22); g.lineTo(o.x + 242, o.baseY + 242 * o.tilt + 22); g.stroke();
    g.strokeStyle = '#a17782'; g.lineWidth = 7; g.stroke(); g.strokeStyle = '#e6bd91'; g.lineWidth = 1.3; g.stroke();
    g.fillStyle = '#3e3d59'; g.strokeStyle = '#7fa9a6'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(o.x - 54, o.baseY + 120); g.lineTo(o.x - 13, o.baseY + 25); g.quadraticCurveTo(o.x, o.baseY + 9, o.x + 13, o.baseY + 25); g.lineTo(o.x + 54, o.baseY + 120); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#e6b97c'; g.beginPath(); g.arc(o.x, o.baseY + 22, 9, 0, Math.PI * 2); g.fill();
    // Le poids de Feza anime réellement les quatre appuis, sans verrouiller le chemin inférieur.
    for (let i = 0; i < 3; i++) { const x = o.x - 36 + i * 36, y = o.baseY + 91 + Math.sin(tm + i) * 2; g.fillStyle = i % 2 ? '#c75a94' : '#edb27d'; g.beginPath(); g.ellipse(x, y, 3, 5, -.2, 0, Math.PI * 2); g.fill(); }
    g.restore();
  }
});
TUR.kaydet('korYelpaze', {
  kur(o) {
    o.age = 0; o.opening = false; o.openAge = 0; o.helpAge = 0; o.parts = [];
    for (let i = 0; i < 4; i++) o.parts.push(ao5Part(o, i, o.x + (i + 1) * 160, o.y - (i + 1) * 80, 124, false));
  },
  dokun(o) { if (!P.ucus && P.fade <= 0) ao5FlowerOpen(o, 'touch'); else o.dokundu = false; },
  guncelle(o, dt) {
    if (!ao5Playing(dt)) return; o.age += dt;
    if (!o.opening && !P.ucus && Math.abs(P.x - o.x) < 200) { o.helpAge += dt; if (o.helpAge > 12) ao5FlowerOpen(o, 'help'); }
    if (!o.opening) return; o.openAge += dt;
    for (const q of o.parts) {
      const u = smooth(clamp((o.openAge - q.index * .38) / 1.4, 0, 1)), target = o.y - (q.index + 1) * 80;
      const before = q.y; q.y = lerp(o.y + 16, target, u) + 12; q.alpha = u; q.cisim.aktif = u >= .995; q.cisim.dy = q.y - before;
    }
  },
  ciz(o, tm) {
    const u = smooth(clamp(o.openAge / 2.4, 0, 1));
    g.save(); g.drawImage(vk5Stone(1), o.x - 103, o.y - 38, 206, 90);
    g.strokeStyle = '#397d86'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(o.x, o.y); g.quadraticCurveTo(o.x - 15, o.y - 60, o.x, o.y - 105); g.stroke();
    for (let i = 0; i < 7; i++) { g.save(); g.translate(o.x, o.y - 102); g.rotate((i - 3) * (.055 + u * .27)); g.scale(.4 + u * .08, .5 + u * .13); g.drawImage(vk5PearlPetal(i % 3), -65, -255, 130, 270); g.restore(); }
    g.drawImage(vk5HeartArt(), o.x - 12, o.y - 142, 24, 34);
    if (!o.opening) vk5Pollen(o.x, o.y - 130, tm, .2, .4);
    if (u > .01) {
      g.strokeStyle = '#599f9e'; g.lineWidth = 2; g.globalAlpha = u * .65;
      for (const q of o.parts) { g.beginPath(); g.moveTo(o.x, o.y - 38); g.quadraticCurveTo(q.x - 80, o.y - 80, q.x, q.y + 5); g.stroke(); }
      g.globalAlpha = 1;
      // Les petits poissons de lumière révèlent une alcôve, sans collecte imposée.
      for (let i = 0; i < 4; i++) { const xx = o.x + 130 + i * 103 + Math.sin(tm * .6 + i) * 20, yy = o.y - 36 + Math.sin(tm + i * 2) * 13; g.save(); g.translate(xx, yy); g.globalAlpha = u * .8; g.fillStyle = i % 2 ? '#f1bf80' : '#ce87bf'; g.beginPath(); g.ellipse(0, 0, 15, 7, -.1, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(-13, 0); g.lineTo(-24, -9); g.lineTo(-23, 8); g.closePath(); g.fill(); g.fillStyle = '#493653'; g.beginPath(); g.arc(8, -1, 1.5, 0, Math.PI * 2); g.fill(); g.restore(); }
    }
    g.restore();
  }
});
// Les fleurs ont une tête visible et distincte; seul ce jouet intercepte ce tap.
addEventListener('pointerdown', e => {
  if (e.target !== cv || DURUM !== 'oyun' || P.ucus || P.fade > 0 || P.kilit > .05 || e.button != null && e.button !== 0) return;
  if (typeof dugmede === 'function' && dugmede(e.clientX, e.clientY)) return;
  const r = cv.getBoundingClientRect(), x = cam.x + (e.clientX - r.left) * DPR / S, y = cam.y + (e.clientY - r.top) * DPR / S;
  for (const o of NESNELER) if (o.tip === 'korYelpaze' && !o.opening && Math.abs(P.x - o.x) < 650 && ((x - o.x) / 95) ** 2 + ((y - o.y + 145) / 125) ** 2 < 1) {
    e.preventDefault(); e.stopPropagation(); if (typeof omHepsiniBirak === 'function') omHepsiniBirak(); ao5FlowerOpen(o, 'tap'); return;
  }
}, true);

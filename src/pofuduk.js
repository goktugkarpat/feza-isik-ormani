/* pofuduk.js – Pofuduklar (uykucu, tüylü orman dostları) ve Büyük Pofuduk: davranış + çizim.
   Sözleşme: src/SPEC.md › "Pofuduklar". Şimdilik basit yer tutucu; ajan zenginleştirir. */
'use strict';
// tur: 'yol' (yolu kapatır; üstüne zıplayınca uyanır, kenara çekilip Feza'nın peşine takılır)
//      'minder' (uyanınca zıplatma minderi olur) · 'basamak' (uyanınca üstüne çıkılan basamak olur)
TUR.kaydet('pofuduk', {
  kur(o) { o.uyandi = false; o.t = Math.random() * 6; o.cisim = { w: 54, h: 40, tip: o.tur === 'basamak' ? 'ustten' : 'kati', aktif: true, dx: 0, dy: 0 }; },
  ustune(o) {
    if (o.uyandi) return;
    o.uyandi = true; P.vy = -620; P.ground = false;
    burst(o.x, o.y - 30, 30, ['#ffd6f2', '#bff4ff', '#fff3b0'], 160, 1.2, 8);
    if (o.tur === 'minder') { o.cisim.tip = 'ziplat'; o.cisim.guc = 1080; o.cisim.h = 28; }
    else if (o.tur === 'basamak') { o.cisim.h = 70; }
    else o.cisim.aktif = false;
    AU.sfx('bloom'); OLAY.emit('uyandi', o);
  },
  guncelle(o, dt) { o.t += dt; if (o.uyandi && o.tur === 'yol') { const tx = P.x - P.f * 70; o.x += (tx - o.x) * Math.min(1, dt * 1.5); } },
  ciz(o, tm) {
    const s = 1 + Math.sin(o.t * (o.uyandi ? 6 : 1.6)) * 0.05;
    g.fillStyle = o.uyandi ? '#ffb8e0' : '#7a7f96';
    g.beginPath(); g.ellipse(o.x, o.y - 20 * s, 28, 20 * s, 0, 0, 6.283); g.fill();
    g.fillStyle = '#2a2040'; g.fillRect(o.x - 10, o.y - 24, 6, o.uyandi ? 5 : 1.5); g.fillRect(o.x + 4, o.y - 24, 6, o.uyandi ? 5 : 1.5);
  },
});
TUR.kaydet('buyukPofuduk', {
  kur(o) { o.uyandi = false; o.t = 0; o.uyanma = 0; o.cisim = { w: 150, h: 130, tip: 'kati', aktif: true, dx: 0, dy: 0 }; },
  guncelle(o, dt) {
    o.t += dt;
    const top = NESNELER.filter(n => n.buyukIcin).length, acik = NESNELER.filter(n => n.buyukIcin && n.done).length;
    o.uyanma = top ? acik / top : 1;
    if (!o.uyandi && o.uyanma >= 1) { o.uyandi = true; o.cisim.tip = 'ziplat'; o.cisim.guc = 1500; o.cisim.h = 110; OLAY.emit('uyandi', o); burst(o.x, o.y - 100, 50, ['#ffd6f2', '#bff4ff', '#fff3b0'], 220, 1.6, 10); }
  },
  ciz(o, tm) {
    const s = 1 + Math.sin(o.t * 1.2) * 0.04;
    g.fillStyle = o.uyandi ? '#ffb8e0' : o.uyanma > 0.5 ? '#a08cb4' : '#6f7590';
    g.beginPath(); g.ellipse(o.x, o.y - 65 * s, 80, 65 * s, 0, 0, 6.283); g.fill();
  },
});

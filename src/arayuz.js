/* arayuz.js – başlık ekranı, zıplama düğmesi, altyazı, bitiş ekranı. Sözleşme: src/SPEC.md › "Arayüz".
   Ekran koordinatı: canvas pikseli (CSS px × DPR). Şimdilik basit yer tutucu. */
'use strict';
const ARAYUZ = (() => {
  let alt = null;   // { metin, bitis }
  function altyazi(metin, sure = 3) { alt = { metin, bitis: now + sure }; }
  function ciz(tm, dt) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (DURUM === 'baslik') {
      g.fillStyle = 'rgba(8,8,24,0.35)'; g.fillRect(0, 0, W, H);
      g.textAlign = 'center'; g.fillStyle = '#f6efff'; g.font = `300 ${Math.round(H * 0.085)}px Georgia, serif`;
      g.fillText('Feza ve Pırıl', W / 2, H * 0.38);
      g.font = `italic 300 ${Math.round(H * 0.04)}px Georgia, serif`; g.fillText('Işık Ormanı', W / 2, H * 0.46);
      g.globalAlpha = 0.55 + 0.45 * Math.sin(tm * 2.5); g.font = `500 ${Math.round(H * 0.03)}px system-ui, sans-serif`;
      g.fillText('Başlamak için dokun', W / 2, H * 0.66); g.globalAlpha = 1;
    }
    if (DURUM === 'oyun') {
      const d = GIRDI.dugme;
      g.globalAlpha = d.basili ? 0.75 : 0.45; g.fillStyle = '#d9c2ff';
      g.beginPath(); g.arc(d.x * DPR, d.y * DPR, d.r * DPR, 0, 6.283); g.fill(); g.globalAlpha = 1;
    }
    if (alt && now < alt.bitis) {
      g.textAlign = 'center'; g.font = `500 ${Math.round(H * 0.032)}px system-ui, sans-serif`;
      const w = g.measureText(alt.metin).width + H * 0.04;
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(W / 2 - w / 2, H * 0.06, w, H * 0.055);
      g.fillStyle = '#fff'; g.fillText(alt.metin, W / 2, H * 0.1);
    }
    if (DURUM === 'son') {
      g.fillStyle = 'rgba(8,8,24,0.55)'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.textAlign = 'center';
      g.font = `300 ${Math.round(H * 0.06)}px Georgia, serif`; g.fillText('Orman ışıl ışıl!', W / 2, H * 0.4);
      g.font = `500 ${Math.round(H * 0.03)}px system-ui, sans-serif`;
      g.fillText(`Çiçek ${SAYAC.cicek}/${SAYAC.cicekTop} · Pofuduk ${SAYAC.pofuduk}/${SAYAC.pofudukTop} · Tohum ${SAYAC.tohum}/${SAYAC.tohumTop}`, W / 2, H * 0.52);
    }
  }
  return { ciz, altyazi };
})();

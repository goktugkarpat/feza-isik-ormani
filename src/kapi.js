/* kapi.js – mini oyun kapısı ("rüya perdesi", önek kp). Şarkı çiçekleri (sarki.js), takımyıldızı çiz (takim.js) ve bulut şekilleri (sekil.js)
   yürüyüp geçilebildiği için fark edilmiyordu: mini oyunun hemen ilerisine yumuşak, ışıklı bir perde gerilir ve oyun bitene kadar Feza'yı
   o noktada tutar (sert değil: ışık dalgalanır, hafif bir çan çalar). Mini oyun bitince perde ışık zerrelerine dağılır, yol açılır.
   Çocuk takılmasın diye mini oyunların kendi "geç yardım"ları (Pırıl'ın ipucu/dokunuşu) devreye girer; perde yalnız ileri yönü tutar,
   geri yürümek her zaman serbesttir. Yazı yok, yeni ses kaydı yok.
   Yerleşim (bolum*.js): nesne('miniKapi', c, yuzey(c), { bagId: <mini oyun nesnesinin id'si>, stil: 'sarki'|'takim'|'sekil' }).
   Bağlı nesnenin bittiği: sarki .sk.bitti · takim .tk.bitti · sekil .skl.bitti. Sözleşme: src/SPEC.md. */
'use strict';
const KP_RENK = { sarki: ['#7fe9ff', '#c9a2ff', '#ff9fd3'], takim: ['#ffe08a', '#7fe9ff', '#c9a2ff'], sekil: ['#ffb3d9', '#c9a2ff', '#ffe5a0'] };
const KP_YUK = 250;     // perdenin yüksekliği (zeminden yukarı)
const KP_TUT = 220;     // perdenin ötesinde, bu kadar uzaklığa kadar "geçmiş" sayılmaz (yeniden doğan/taşınan Feza takılmasın)
function kpBitti(b) { return !!b && !!((b.sk && b.sk.bitti) || (b.tk && b.tk.bitti) || (b.skl && b.skl.bitti)); }
TUR.kaydet('miniKapi', {
  kur(o) { o.a = 1; o.acik = false; o.acT = 0; o.vur = 0; o.ph = Math.random() * 6.283; o.bag = null; o.stil = KP_RENK[o.stil] ? o.stil : 'sarki'; },
  guncelle(o, dt) {
    if (!o.bag) o.bag = NESNELER.find(n => n.id === o.bagId) || null;
    o.ph += dt; o.vur = Math.max(0, o.vur - dt * 1.4);
    if (!o.acik && kpBitti(o.bag)) {
      o.acik = true; o.acT = 0;
      burst(o.x, o.y - KP_YUK * 0.5, 30, KP_RENK[o.stil], 210, 1.5, 9);
      if (typeof AU !== 'undefined' && AU && AU.sfx) { try { AU.sfx('cicek', 1); } catch (e) {} }
    }
    if (o.acik) { o.acT += dt; o.a = Math.max(0, 1 - o.acT / 1.6); return; }
    if (DURUM !== 'oyun' || P.fade > 0 || P.ucus) return;
    if (P.x > o.x - 14 && P.x < o.x + KP_TUT) {   // ileri yönde perdeden geçilmez (geri yürümek serbest)
      P.x = o.x - 14; if (P.vx > 0) P.vx = 0;
      if (o.vur < 0.25) { o.vur = 1; if (typeof AU !== 'undefined' && AU && AU.sfx) { try { AU.sfx('cicek', 0.5); } catch (e) {} } }
    }
  },
  ciz(o, tm) {
    if (o.a < 0.01 || o.x < cam.x - 120 || o.x > cam.x + VW + 120) return;
    const R = KP_RENK[o.stil], yb = o.y + 4, yt = o.y - KP_YUK, al = o.a * (0.78 + 0.14 * Math.sin(tm * 1.4 + o.ph)) + o.vur * 0.25 * o.a;
    // alttan yukarı sönen üç renkli ışık şeridi demeti (hafifçe salınır)
    g.save(); g.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const col = R[i % 3], gr = g.createLinearGradient(0, yb, 0, yt);
      gr.addColorStop(0, col + 'ee'); gr.addColorStop(0.6, col + '99'); gr.addColorStop(1, col + '00');
      g.strokeStyle = gr; g.lineWidth = 13 + (i % 2) * 5; g.globalAlpha = Math.min(1, al);
      const bx = o.x + (i - 2.5) * 11;
      g.beginPath();
      for (let s = 0; s <= 10; s++) { const u = s / 10, y = yb - u * (yb - yt), x = bx + Math.sin(tm * 1.1 + i * 1.3 + u * 5) * (4 + 9 * u) * (1 + o.vur * 0.6); if (s) g.lineTo(x, y); else g.moveTo(x, y); }
      g.stroke();
    }
    g.restore();
    dglow(R[0], o.x, yb - 6, 110, Math.min(1, al * 0.8)); dglow(R[1], o.x, yb - KP_YUK * 0.45, 90, al * 0.3);
    for (let k = 0; k < 14; k++) {   // yükselen ışık zerreleri
      const u = ((tm * 0.09 + k * 0.113 + o.ph) % 1), x = o.x + Math.sin(tm * 0.8 + k * 2.4) * 28, y = yb - u * KP_YUK;
      dglow(R[k % 3], x, y, 12, Math.min(1, al * Math.sin(u * Math.PI) * 1.1));
    }
  },
});

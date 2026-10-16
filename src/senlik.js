/* senlik.js — Şenlik Kalesi'nin dünya nesneleri (Bölüm 6). Korkutucu hiçbir şey, silah, kaybetme yok.
   fener      : sönük asılı fener (direğe asılı). Feza yanından geçince ya da fenere dokununca yanar; altın-pembe ışık
                ve kıvılcımlar. o.yandi = true, V6.fener++, OLAY 'fener' {o, n}. Sokaktaki fener dizilerine yayılan ışık
                dalgasını dunya6.js bu olaydan çizer (iki kez çizilmesin diye burada dizi yok).
   sovalye    : sevimli tahta oyuncak şövalye heykeli (elinde yalnız küçük bir bayrak). Yaklaşınca/dokununca bayrağını
                ve şapkasını sallar. OLAY 'sovalyeSelam' {o}. Uzaklaşıp dönünce yeniden selam verir.
   kaleKopru  : kale köprüsü. V6.mini olunca ışıkla iner, cisim açılır, V6.kopru = true, OLAY 'kopruIndi' {o}.
                İnmeden önce kalkık köprü yolu kapatır (halka yolculuğu bitmeden oraya zaten gelinmez; halka türü yoksa
                Feza yaklaşınca kendiliğinden iner, takılma yok).
   senlikAvlu : kale avlusu. Feza varınca V6.final = true, OLAY 'senlikFinal' {o, duration, box}; ~22 sn kutlama:
                ışık bayrakları, şenlik direği, havai fişekler, halka dansı yapan midilliler, misafir dostlar
                (Anka, denizatları, pofuduklar — mevcut çiziciler varsa). Sonunda OLAY 'senlikTamam'.
   Çizimler önbellek tuvallerinden (snSpr); her karede gradient/filtre üretilmez, parçacıklar sabit sayılı ve analitiktir. */
'use strict';
const SN = { spr: new Map() };
const SN_PI2 = Math.PI * 2;
const SN_ISIK = ['#ffd27a', '#ffb3d1', '#d9b8ff', '#bff0d8', '#ffe9a6'];   // şenlik ışıkları: altın, pembe, leylak, nane, krem
const SN_FENER_RENK = [['#ffcf86', '#ff9fbf'], ['#ffd99a', '#f6a6d8'], ['#ffe2a6', '#c9a8ff']];   // [iç ışık, kağıt]
// Sesler: muzik.js olayları (fener, sovalyeSelam, kopruIndi, senlikFinal, midilliUyandi, ziplatti) dinleyip kendisi çalar.
function snV6() { return typeof V6 !== 'undefined' ? V6 : null; }
function snIsik(col, x, y, r, a) { if (a <= .003) return; g.globalAlpha = a; g.drawImage(glow(col), x - r, y - r, r * 2, r * 2); g.globalAlpha = 1; }
// Önbellek tuvali: yerel (x0, y0, w, h) kutusu, 3 piksel/birim
function snTuval(ad, x0, y0, w, h, fn) {
  let c = SN.spr.get(ad); if (c) return c;
  c = document.createElement('canvas'); const K = 3; c.width = Math.ceil(w * K); c.height = Math.ceil(h * K);
  const q = c.getContext('2d'); q.scale(K, K); q.translate(-x0, -y0); q.lineCap = 'round'; q.lineJoin = 'round';
  fn(q); c.x0 = x0; c.y0 = y0; c.w = w; c.h = h; SN.spr.set(ad, c); return c;
}
function snKoy(c, x, y) { g.drawImage(c, x + c.x0, y + c.y0, c.w, c.h); }

// ═══════════════════════════════ FENER ═══════════════════════════════
// Direk: tahta direk + küçük kıvrık kol + çatı şapkası. Fener kolun ucundan ipte asılı. o.y zemin, fener merkezi o.y - o.h.
function snDirek(h) {
  return snTuval('direk' + h, -16, -h - 52, 64, h + 56, q => {
    q.fillStyle = '#5a4470'; q.beginPath(); q.ellipse(0, 0, 13, 4, 0, 0, SN_PI2); q.fill();   // taban gölgesi
    q.strokeStyle = '#3f2f55'; q.lineWidth = 9; q.beginPath(); q.moveTo(0, 0); q.lineTo(0, -h - 36); q.stroke();
    q.strokeStyle = '#8b6a8f'; q.lineWidth = 6; q.stroke();
    q.strokeStyle = 'rgba(255,225,240,.35)'; q.lineWidth = 1.4; q.beginPath(); q.moveTo(-1.5, -4); q.lineTo(-1.5, -h - 34); q.stroke();
    // kol: direğin tepesinden sağa kıvrılır, ucunda fener ipi
    q.strokeStyle = '#3f2f55'; q.lineWidth = 5; q.beginPath(); q.moveTo(0, -h - 30); q.quadraticCurveTo(20, -h - 44, 40, -h - 34); q.stroke();
    q.strokeStyle = '#8b6a8f'; q.lineWidth = 3; q.stroke();
    q.strokeStyle = '#8b6a8f'; q.lineWidth = 2; q.beginPath(); q.arc(8, -h - 24, 7, Math.PI * .9, Math.PI * 2.2); q.stroke();   // süs kıvrımı
    // tepe şapkası (yuvarlak masal çatısı) + minik top
    q.fillStyle = '#6d4f86'; q.beginPath(); q.moveTo(-9, -h - 36); q.quadraticCurveTo(0, -h - 52, 9, -h - 36); q.closePath(); q.fill();
    q.fillStyle = '#ffd9a8'; q.beginPath(); q.arc(0, -h - 49, 2.6, 0, SN_PI2); q.fill();
    // taban halkası
    q.fillStyle = '#6d4f86'; q.fillRect(-6.5, -10, 13, 6);
  });
}
// Fener gövdesi (yuvarlak kâğıt fener). yanik: 0 sönük gri-mor / 1 yanan altın-pembe. Merkez (0,0), ip kancası (0,-22)
function snFenerSpr(v, yanik) {
  return snTuval('fener' + v + (yanik ? 'y' : 's'), -22, -26, 44, 54, q => {
    const R = SN_FENER_RENK[v], kag = yanik ? R[1] : '#8e86a6', ic = yanik ? R[0] : '#a49dba', cz = yanik ? '#b0607c' : '#5e5476';
    q.fillStyle = yanik ? '#e0a64e' : '#5b5270';
    q.fillRect(-8, -21, 16, 5); q.fillRect(-7, 16, 14, 4.5);   // altın kapaklar
    q.beginPath(); q.ellipse(0, -.5, 17, 16.5, 0, 0, SN_PI2); q.fillStyle = kag; q.fill(); q.strokeStyle = cz; q.lineWidth = 1.3; q.stroke();
    const gr = q.createRadialGradient(-2, 0, 1, 0, 0, 17); gr.addColorStop(0, yanik ? '#fff6d8' : '#b9b2cc'); gr.addColorStop(.55, ic); gr.addColorStop(1, 'rgba(0,0,0,0)');
    q.fillStyle = gr; q.beginPath(); q.ellipse(0, -.5, 16, 15.5, 0, 0, SN_PI2); q.fill();
    q.strokeStyle = yanik ? 'rgba(176,96,124,.55)' : 'rgba(94,84,118,.5)'; q.lineWidth = 1;   // kâğıt kaburgaları
    for (const k of [-.62, -.28, .28, .62]) { q.beginPath(); q.ellipse(0, -.5, 17 * Math.abs(k), 16.2, 0, k < 0 ? Math.PI / 2 : -Math.PI / 2, k < 0 ? Math.PI * 1.5 : Math.PI / 2); q.stroke(); }
    q.fillStyle = 'rgba(255,255,255,' + (yanik ? .45 : .18) + ')'; q.beginPath(); q.ellipse(-7, -7, 3.5, 6, -.3, 0, SN_PI2); q.fill();
    // püskül
    q.strokeStyle = yanik ? '#ff9fbf' : '#7d7593'; q.lineWidth = 1.6; q.beginPath(); q.moveTo(0, 20); q.lineTo(0, 27); q.moveTo(-2, 21); q.lineTo(-3, 27); q.moveTo(2, 21); q.lineTo(3, 27); q.stroke();
  });
}
function snFenerYak(o, kaynak) {
  if (o.yandi) return false;
  o.yandi = true; o.yanT = 0; o.kaynak = kaynak || 'yakin'; o.it = 1;
  const v = snV6(); if (v) v.fener = (v.fener || 0) + 1;
  const fx = o.x + 40, fy = o.y - o.h;
  burst(fx, fy, 16, ['#ffe2a0', '#ffb3d1', '#fff6e0'], 110, 1.1, 6);
  ripples.push({ x: fx, y: fy, r: 0, life: 1.4, small: true });
  // ses: muzik.js 'fener' olayından çan çalar (pan: ekrandaki konum -1..1)
  OLAY.emit('fener', { o, n: v ? v.fener : 1, x: fx, y: fy, pan: clamp((fx - cam.x - VW / 2) / (VW / 2), -1, 1) });
  return true;
}
TUR.kaydet('fener', {
  kur(o) {
    o.yandi = false; o.yanT = -1; o.h = o.h || 132; o.v = (o.sira != null ? o.sira : Math.floor(o.x / T)) % 3; o.t = (o.x * .007) % 6; o.it = 0; o.sal = 0;
    o.r = o.r || 80; o.ry = o.ry || 20;
  },
  dokun(o) { snFenerYak(o, 'yakin'); },
  guncelle(o, dt) {
    if (!(dt > 0) || !Number.isFinite(dt)) return;
    o.t += dt; if (o.yandi) o.yanT += dt;
    o.it = Math.max(0, o.it - dt * .9);
    // yanından geçerken fener hafifçe sallanır (rüzgâr gibi)
    const yakin = Math.abs(P.x - (o.x + 40)) < 60 && Math.abs(P.y - o.y) < 150;
    if (yakin && Math.abs(P.vx) > 60) o.it = Math.max(o.it, .45);
  },
  ciz(o, tm) {
    const fx = o.x + 40, fy = o.y - o.h, ac = o.yandi ? smooth(clamp(o.yanT / .8, 0, 1)) : 0;
    const sal = Math.sin(tm * 1.1 + o.x * .01) * .035 + Math.sin(tm * 4.2) * .16 * o.it;
    snKoy(snDirek(o.h), o.x, o.y);
    // ip + fener (kolun ucundan asılı, yavaşça sallanır)
    g.save(); g.translate(fx, o.y - o.h - 34); g.rotate(sal);
    g.strokeStyle = '#3a2c54'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 13); g.stroke();
    g.translate(0, 34);
    if (ac > 0) { g.globalCompositeOperation = 'lighter'; const p = .85 + .15 * Math.sin(tm * 2 + o.x); snIsik('#ffc76e', 0, 0, 95, ac * .42 * p); snIsik('#ff9fc8', 0, 0, 150, ac * .16 * p); g.globalCompositeOperation = 'source-over'; }
    if (ac < 1) snKoy(snFenerSpr(o.v, false), 0, 0);
    if (ac > 0) { g.globalAlpha = ac; snKoy(snFenerSpr(o.v, true), 0, 0); g.globalAlpha = 1; }
    if (!o.yandi) {   // sönük fenerde uyuyan küçük kor: Feza yaklaşınca yavaşça nefes alır (davet)
      const yak = clamp(1 - Math.abs(P.x - fx) / 320, 0, 1), n = .5 + .5 * Math.sin(tm * 2.2 + o.x);
      g.globalCompositeOperation = 'lighter'; snIsik('#ffd59a', 0, 2, 12 + yak * 8, .12 + yak * .25 * n); g.globalCompositeOperation = 'source-over';
    }
    g.restore();
    // yanma anı: fenerden yükselen küçük ışık kıvılcımları (sabit sayılı)
    if (o.yandi && o.yanT < 2.4) {
      g.globalCompositeOperation = 'lighter'; const yl = o.yanT / 2.4;
      for (let k = 0; k < 8; k++) { const a = k * .785 + o.x, u = clamp(yl * 1.4 - k * .04, 0, 1), rr = 18 + u * 46; snIsik(SN_ISIK[k % 5], fx + Math.cos(a) * rr, o.y - o.h + Math.sin(a) * rr * .7 - u * 24, 7, (1 - u) * .7); }
      g.globalCompositeOperation = 'source-over';
    }
  },
});

// ═══════════════════════════════ ŞÖVALYE ═══════════════════════════════
// Tahta oyuncak şövalye: kaide + yuvarlak gövde (boyalı tahta) + tüylü miğfer-şapka + bayraklı kol. Silah yok.
function snSovParca(ad) {
  if (ad === 'kaide') return snTuval('sv_kaide', -30, -26, 60, 28, q => {
    q.fillStyle = '#4c3a63'; q.beginPath(); q.ellipse(0, 0, 28, 5, 0, 0, SN_PI2); q.fill();
    q.fillStyle = '#9a7aa6'; q.strokeStyle = '#4a3760'; q.lineWidth = 1.5; q.beginPath(); q.roundRect ? q.roundRect(-24, -22, 48, 21, 5) : q.rect(-24, -22, 48, 21); q.fill(); q.stroke();
    q.fillStyle = '#b897c0'; q.fillRect(-26, -25, 52, 6); q.strokeRect(-26, -25, 52, 6);
    q.fillStyle = '#ffd9a8'; for (let i = -1; i <= 1; i++) { q.beginPath(); q.arc(i * 14, -11, 2.4, 0, SN_PI2); q.fill(); }
  });
  if (ad === 'govde') return snTuval('sv_govde', -18, -50, 36, 52, q => {
    // bacaklar (tahta silindirler) + ayakkabı
    q.strokeStyle = '#4a3760'; q.lineWidth = 1.4;
    for (const s of [-1, 1]) { q.fillStyle = '#d8b48c'; q.beginPath(); q.rect(s * 6 - 4, -16, 8, 14); q.fill(); q.stroke(); q.fillStyle = '#7b5a8e'; q.beginPath(); q.ellipse(s * 6 + s * 1.5, -2, 6, 3.4, 0, 0, SN_PI2); q.fill(); q.stroke(); }
    // gövde: mavi-leylak tunik, ortasında yıldız
    q.fillStyle = '#8fa8f0'; q.beginPath(); q.moveTo(-14, -14); q.quadraticCurveTo(-17, -42, 0, -46); q.quadraticCurveTo(17, -42, 14, -14); q.quadraticCurveTo(0, -10, -14, -14); q.closePath(); q.fill(); q.stroke();
    q.fillStyle = '#c9b8ff'; q.fillRect(-14, -22, 28, 5); q.strokeRect(-14, -22, 28, 5);
    q.fillStyle = '#ffe08e'; q.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 2.6 : 6; q.lineTo(Math.cos(a) * r, -33 + Math.sin(a) * r); } q.closePath(); q.fill();
    q.fillStyle = 'rgba(255,255,255,.3)'; q.beginPath(); q.ellipse(-7, -36, 3, 7, .2, 0, SN_PI2); q.fill();
  });
  if (ad === 'bas') return snTuval('sv_bas', -18, -34, 36, 36, q => {
    // yuvarlak tahta yüz + pembe yanaklar + gülümseme (gözler canlı çizilir)
    q.fillStyle = '#f2d2b0'; q.strokeStyle = '#4a3760'; q.lineWidth = 1.4; q.beginPath(); q.arc(0, -12, 12, 0, SN_PI2); q.fill(); q.stroke();
    q.fillStyle = 'rgba(255,140,170,.45)'; q.beginPath(); q.ellipse(-7, -8, 3, 2, 0, 0, SN_PI2); q.ellipse(7, -8, 3, 2, 0, 0, SN_PI2); q.fill();
    q.strokeStyle = '#5a3d58'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(-3.5, -6); q.quadraticCurveTo(0, -3.4, 3.5, -6); q.stroke();
  });
  if (ad === 'sapka') return snTuval('sv_sapka', -18, -40, 36, 32, q => {
    // yuvarlak miğfer-şapka (oyuncak; siperliği yukarı kalkık) + pembe tüy — kök (0,-18) başın tepesi
    q.fillStyle = '#c9cbe6'; q.strokeStyle = '#4a3760'; q.lineWidth = 1.4;
    q.beginPath(); q.moveTo(-13, -14); q.quadraticCurveTo(-13, -31, 0, -31); q.quadraticCurveTo(13, -31, 13, -14); q.closePath(); q.fill(); q.stroke();
    q.fillStyle = '#ffe08e'; q.fillRect(-14, -16, 28, 4); q.strokeRect(-14, -16, 28, 4);
    q.fillStyle = '#ff9fc8'; q.beginPath(); q.moveTo(0, -30); q.bezierCurveTo(-4, -40, 8, -42, 12, -36); q.bezierCurveTo(6, -36, 4, -33, 0, -30); q.fill(); q.stroke();
    q.fillStyle = 'rgba(255,255,255,.4)'; q.beginPath(); q.ellipse(-6, -24, 2.5, 5, .3, 0, SN_PI2); q.fill();
  });
  return snTuval('sv_kol', -6, -46, 40, 72, q => {
    // omuzdan (0,0) aşağı inen kol + yumruk + yukarı uzanan bayrak sapı; bayrak (üçgen flama) canlı dalgalanır
    q.strokeStyle = '#4a3760'; q.lineWidth = 1.3; q.fillStyle = '#8fa8f0';
    q.beginPath(); q.ellipse(4, 6, 4.5, 8, -.5, 0, SN_PI2); q.fill(); q.stroke();
    q.fillStyle = '#f2d2b0'; q.beginPath(); q.arc(8, 13, 3.6, 0, SN_PI2); q.fill(); q.stroke();
    q.strokeStyle = '#8a6440'; q.lineWidth = 2.4; q.beginPath(); q.moveTo(8, 20); q.lineTo(8, -42); q.stroke();
    q.fillStyle = '#ffe08e'; q.beginPath(); q.arc(8, -43, 2.4, 0, SN_PI2); q.fill();
  });
}
function snSovSelam(o) {
  if (o.selam > .5) return;
  o.selam = 2.6; o.zip = 1;
  burst(o.x, o.y - 70, 8, ['#ffe08e', '#ff9fc8', '#c9b8ff'], 70, .8, 4);
  OLAY.emit('sovalyeSelam', { o });
}
TUR.kaydet('sovalye', {
  kur(o) { o.selam = 0; o.zip = 0; o.yon = o.yon || 1; o.r = o.r || 75; o.t = (o.x * .011) % 5; },
  dokun(o) { snSovSelam(o); },
  guncelle(o, dt) {
    if (!(dt > 0) || !Number.isFinite(dt)) return;
    o.t += dt; o.selam = Math.max(0, o.selam - dt); o.zip = Math.max(0, o.zip - dt * 1.6);
    if (o.dokundu && Math.abs(P.x - o.x) > 230) o.dokundu = false;   // uzaklaşınca yeniden selam verebilir
  },
  ciz(o, tm) {
    const s = o.olcek || 1.15, sel = o.selam > 0 ? Math.sin(Math.min(1, (2.6 - o.selam) / .3) * Math.PI / 2) * Math.min(1, o.selam / .4) : 0;
    const hop = Math.abs(Math.sin(o.zip * Math.PI * 2)) * o.zip * 7, sway = Math.sin(tm * .9 + o.t) * .02 + Math.sin(o.zip * 14) * .06 * o.zip;
    g.save(); g.translate(o.x, o.y); g.scale(s * o.yon, s);
    snKoy(snSovParca('kaide'), 0, 0);
    g.translate(0, -24 - hop); g.rotate(sway);
    snKoy(snSovParca('govde'), 0, 0);
    // diğer kol (gövdede, hafif)
    g.fillStyle = '#8fa8f0'; g.strokeStyle = '#4a3760'; g.lineWidth = 1.3; g.beginPath(); g.ellipse(-12, -30, 4, 8, .4, 0, SN_PI2); g.fill(); g.stroke();
    // baş + şapka (selamda şapka başın üstünden kalkıp iner)
    g.save(); g.translate(0, -44); g.rotate(Math.sin(tm * .8 + o.t) * .04 + sel * .12);
    snKoy(snSovParca('bas'), 0, 0);
    // gözler: dururken sakin nokta; selamda mutlu kapalı kavis
    g.fillStyle = '#3b2b4f'; g.strokeStyle = '#3b2b4f'; g.lineWidth = 1.4;
    if (sel > .3) { for (const ex of [-4.5, 4.5]) { g.beginPath(); g.moveTo(ex - 2.4, -12); g.quadraticCurveTo(ex, -14.6, ex + 2.4, -12); g.stroke(); } }
    else for (const ex of [-4.5, 4.5]) { g.beginPath(); g.ellipse(ex, -12.5, 1.7, 2.2, 0, 0, SN_PI2); g.fill(); }
    const sk = sel * (8 + Math.sin(tm * 9) * 3);
    g.save(); g.translate(0, -6 - sk); g.rotate(-sel * .25); snKoy(snSovParca('sapka'), 0, 0); g.restore();
    g.restore();
    // bayraklı kol: dururken yanında hafif sallanır, selamda yukarı kalkar ve dalgalanır
    const kolA = lerp(.25 + Math.sin(tm * 1.2 + o.t) * .05, -.15 + Math.sin(tm * 9) * .4, sel);
    g.save(); g.translate(11, -38); g.rotate(kolA); snKoy(snSovParca('kol'), 0, 0);
    // flama: üç noktalı yumuşak dalga
    const w = Math.sin(tm * 5 + o.t) * (2 + sel * 4);
    g.fillStyle = '#ff9fc8'; g.strokeStyle = '#4a3760'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(8, -41); g.quadraticCurveTo(18, -40 + w, 28, -35 + w * .6); g.quadraticCurveTo(18, -31 - w * .4, 8, -29); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#ffe08e'; g.beginPath(); g.arc(15, -35 + w * .3, 2, 0, SN_PI2); g.fill();
    g.restore();
    g.restore();
    if (sel > .05) { g.globalCompositeOperation = 'lighter'; snIsik('#ffe2a0', o.x + 30 * o.yon * s, o.y - 110 * s, 22, sel * .3); g.globalCompositeOperation = 'source-over'; }
  },
});

// ═══════════════════════════════ KALE KÖPRÜSÜ ═══════════════════════════════
// Köprü kalenin tarafındaki (sağ) ucundan menteşelidir. Kalkıkken dik durur ve yolu kapatır; V6.mini olunca 2,6 sn'de
// ışıkla iner. Güverte o.yuz hizasında tek yönlü (üstten) cisimdir. Köprünün sağında küçük bir kapı kemeri çizilir
// (o.kapiYok ile kapatılabilir). Güvertedeki 6 lamba, toplanan fener sayısıyla yanar ("fener ışığı köprüyü yakar").
const SN_KOPRU_SURE = 2.6;
function snKopruGuverte(w) {
  return snTuval('kopru' + w, -w - 4, -4, w + 8, 22, q => {
    q.fillStyle = '#6d4f6e'; q.strokeStyle = '#3e2c4f'; q.lineWidth = 1.6;
    q.beginPath(); q.rect(-w, 0, w, 14); q.fill(); q.stroke();
    for (let x = -w + 4; x < -4; x += 18) { q.fillStyle = (x / 18 | 0) % 2 ? '#b58a8f' : '#c79a96'; q.fillRect(x, 1, 16, 9); q.strokeStyle = 'rgba(62,44,79,.55)'; q.lineWidth = 1; q.strokeRect(x, 1, 16, 9); }
    q.fillStyle = 'rgba(255,230,210,.35)'; q.fillRect(-w + 2, 1, w - 4, 2);
    q.fillStyle = '#4e3a62'; q.fillRect(-w, 10, w, 4);
    for (let i = 0; i < 6; i++) { const x = -w * (i + .5) / 6; q.fillStyle = '#e0b26a'; q.beginPath(); q.arc(x, 12, 2.6, 0, SN_PI2); q.fill(); }
  });
}
function snKapiKemer() {
  return snTuval('kemer', -40, -190, 120, 194, q => {
    // iki yuvarlak kule-sütun + taş kemer + tepede iki küçük flama direği
    for (const x of [-26, 66]) {
      q.fillStyle = '#9c8cb8'; q.strokeStyle = '#4a3a63'; q.lineWidth = 1.8; q.beginPath(); q.rect(x - 12, -150, 24, 150); q.fill(); q.stroke();
      q.fillStyle = 'rgba(255,255,255,.18)'; q.fillRect(x - 9, -148, 5, 146);
      q.strokeStyle = 'rgba(74,58,99,.35)'; q.lineWidth = 1; for (let y = -140; y < 0; y += 16) { q.beginPath(); q.moveTo(x - 12, y); q.lineTo(x + 12, y); q.stroke(); }
      q.fillStyle = '#c38bb4'; q.strokeStyle = '#4a3a63'; q.lineWidth = 1.6; q.beginPath(); q.moveTo(x - 16, -150); q.quadraticCurveTo(x, -186, x + 16, -150); q.closePath(); q.fill(); q.stroke();
      q.fillStyle = '#ffe08e'; q.beginPath(); q.arc(x, -177, 2.8, 0, SN_PI2); q.fill();
    }
    q.strokeStyle = '#4a3a63'; q.lineWidth = 12; q.beginPath(); q.moveTo(-14, -112); q.quadraticCurveTo(20, -150, 54, -112); q.stroke();
    q.strokeStyle = '#a998c4'; q.lineWidth = 8; q.stroke();
    q.fillStyle = '#ffd9a8'; q.beginPath(); q.arc(20, -133, 4.5, 0, SN_PI2); q.fill();
  });
}
function snMiniVar() {   // halka yolculuğu türü/nesnesi yoksa (zayıf ağ) köprü beklemesin
  return !!(TUR.al('halkaMini') && NESNELER.some(n => n.tip === 'halkaMini'));
}
TUR.kaydet('kaleKopru', {
  kur(o) {
    o.w = o.w || 240; o.kal = 14; o.yuz = o.y; o.y = o.yuz + o.kal; o.ac = 0; o.t = -1; o.inis = false; o.done = false;
    o.x0 = o.x - o.w / 2; o.x1 = o.x + o.w / 2;
    o.cisim = { w: o.w, h: o.kal, tip: 'ustten', aktif: false, dx: 0, dy: 0 };
  },
  guncelle(o, dt) {
    if (!(dt > 0) || !Number.isFinite(dt)) return;
    const v = snV6();
    if (!o.inis && ((v && v.mini) || (!snMiniVar() && Math.abs(P.x - o.x) < 500))) { o.inis = true; o.t = 0; }
    if (o.inis && !o.done) {
      o.t += dt; o.ac = smooth(clamp(o.t / SN_KOPRU_SURE, 0, 1));
      if (o.t >= SN_KOPRU_SURE) {
        o.done = true; o.ac = 1; o.cisim.aktif = true; if (v) v.kopru = true;
        burst(o.x, o.yuz - 6, 26, ['#ffe2a0', '#ffb3d1', '#d9b8ff', '#ffffff'], 140, 1.3, 6);
        ripples.push({ x: o.x, y: o.yuz, r: 0, life: 1.6 });
        OLAY.emit('kopruIndi', { o });
      }
    }
    // kalkık köprü yolu kapatır (yalnız hendeğin önünde, yerde ya da üstünde yürürken)
    if (!o.cisim.aktif && DURUM === 'oyun' && !P.ucus && P.x > o.x0 - 30 && P.x < o.x1 && P.y <= o.yuz + 4) { P.x = o.x0 - 30; if (P.vx > 0) P.vx = 0; }
  },
  ciz(o, tm) {
    const piv = o.x1, a = (1 - o.ac) * Math.PI / 2, v = snV6(), w = o.w;
    if (!o.kapiYok) snKoy(snKapiKemer(), piv, o.yuz);
    // zincirler: kemerin tepesinden güvertenin ucuna (minik halkalar)
    const ex = piv - Math.cos(a) * w, ey = o.yuz - Math.sin(a) * w;
    g.save(); g.strokeStyle = '#5a4a72'; g.lineWidth = 1.6;
    for (const [cx, cy] of [[piv - 20, o.yuz - 120]]) {
      const n = 14; for (let k = 0; k <= n; k++) { const u = k / n, sg = Math.sin(u * Math.PI) * 18 * o.ac; g.beginPath(); g.ellipse(lerp(cx, ex, u), lerp(cy, ey, u) + sg, 2.6, 1.8, Math.atan2(ey - cy, ex - cx), 0, SN_PI2); g.stroke(); }
    }
    g.restore();
    // güverte (menteşe sağ uçta)
    g.save(); g.translate(piv, o.yuz); g.rotate(a); snKoy(snKopruGuverte(w), 0, 0);
    // fener ışığı: toplanan fener kadar lamba yanar; köprü indiğinde hepsi
    const yanan = o.done ? 6 : Math.min(6, Math.round(((v && v.fener) || 0) / 2));
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < yanan; i++) { const x = -w * (i + .5) / 6; snIsik(SN_ISIK[i % 5], x, 12, 14, .5 + .15 * Math.sin(tm * 2 + i)); }
    if (o.inis && !o.done) { const u = o.t / SN_KOPRU_SURE; for (let i = 0; i < 7; i++) snIsik('#fff1c4', -w * ((u * 1.6 + i / 7) % 1), 2, 22, .35 * Math.sin(u * Math.PI)); }
    g.globalCompositeOperation = 'source-over'; g.restore();
    // inerken ve indikten sonra kısa süre güverte boyunca ışık tozu
    if (o.inis && o.t < SN_KOPRU_SURE + 1.5) {
      g.globalCompositeOperation = 'lighter'; const u = o.t / (SN_KOPRU_SURE + 1.5);
      for (let k = 0; k < 10; k++) { const f = (u * 2 + k * .1) % 1, d = f * w; snIsik(SN_ISIK[k % 5], piv - Math.cos(a) * d, o.yuz - Math.sin(a) * d - 8 - Math.sin(f * 9 + k) * 6, 8, (1 - u) * .6); }
      g.globalCompositeOperation = 'source-over';
    }
  },
});

// ═══════════════════════════════ ŞENLİK AVLUSU (FİNAL) ═══════════════════════════════
const SN_FINAL_SURE = 22;
const SN_FIS_N = 16;               // kutlamadaki havai fişek sayısı (sabit takvim)
const SN_FIS_RENK = [['#ffd27a', '#fff3c4'], ['#ff9fcf', '#ffe0ef'], ['#c7a6ff', '#efe4ff'], ['#9fe6d0', '#e6fff6'], ['#ffb08a', '#ffe9d8']];
function snAvluKur(o) {
  const r = rng(6061);
  // havai fişek takvimi: zaman, x, patlama yüksekliği, renk
  o.fis = []; for (let i = 0; i < SN_FIS_N; i++) o.fis.push({ t: 1.6 + i * 1.12 + r() * .5, x: (r() - .5) * 760, h: 250 + r() * 130, c: i % 5, n: 22 + (i % 3) * 4, k: r() * 6 });
  // dans eden midilliler (avluda uyuyorlar; final başlayınca uyanıp şenlik direğinin çevresinde dans ederler)
  o.dans = []; for (let i = 0; i < 5; i++) o.dans.push({ faz: i / 5 * SN_PI2, renk: i % 5 });
  // direkten avlu kenarlarına gerilen ışık bayrakları: [uç x, uç y]
  o.bay = [[-390, -170], [-220, -150], [220, -150], [390, -170]];
}
// avlu misafirleri: Anka (ANKA.ciz), denizatları (dnzAtCiz), pofuduklar (pofuduk.js çizicisi, sahte nesneyle). Yüklü değilse atlanır.
function snPofMisafir(o) {
  if (o.pofMis !== undefined) return o.pofMis;
  o.pofMis = null;
  const h = TUR.al('pofuduk'); if (!h || typeof h.kur !== 'function' || typeof pfKucukCiz !== 'function') return null;
  try {
    const l = []; for (let i = 0; i < 3; i++) { const f = { tip: 'pofuduk', x: o.x, y: o.y, tur: 'misafir', renk: i + 1, id: 'snPof' + i }; h.kur(f); f.uyandi = true; f.pf.durum = 'takip'; f.pf.bloom = 1; f.pf.pati = 1; f.pf.goz = 'acik'; f.pf.agiz = 'gulus'; f.pf.agizB = .6; f.cisim = null; l.push(f); }
    o.pofMis = l;
  } catch (e) { o.pofMis = null; }
  return o.pofMis;
}
function snBasla(o) {
  if (o.basla) return;
  const v = snV6(); o.basla = true; o.age = 0; o.tamam = false;
  if (v) v.final = true;
  P.kilit = Math.max(P.kilit || 0, SN_FINAL_SURE + 1); P.vx = 0; P.buf = 0;
  if (typeof omHepsiniBirak === 'function') omHepsiniBirak();
  lightTarget = 1;
  burst(o.x, o.y - 260, 40, ['#ffd27a', '#ffb3d1', '#d9b8ff', '#bff0d8'], 160, 2.2, 6);
  // Kadraj: kamera dünyanın tepesinin (≈ -40) üstüne çıkamaz; kutu daha dar ve alçak tutulur ki yakınlaşınca gökyüzü (fişek, Anka, bayraklar)
  // ekranı doldursun ve zeminin altındaki tuğla duvar ekranın en çok ~1/4'ü kalsın (4:3 iPad'de de).
  OLAY.emit('senlikFinal', { o, duration: SN_FINAL_SURE, box: { x0: Math.min(o.x - 360, P.x - 80), x1: o.x + 360, y0: o.y - 480, y1: o.y + 40 } });
}
TUR.kaydet('senlikAvlu', {
  kur(o) { o.basla = false; o.age = 0; o.r = o.r || 170; o.ry = o.ry || 30; o.isinT = 0; snAvluKur(o); },
  dokun(o) {
    const v = snV6();
    if (v && !v.mini && snMiniVar()) { o.dokundu = false; return; }   // (yolculuk bitmeden buraya gelinemez; yine de bekle)
    snBasla(o);
  },
  guncelle(o, dt) {
    if (!(dt > 0) || !Number.isFinite(dt)) return;
    // yaklaşırken çizicileri kareye yayarak ısıt (ilk kutlama karesinde takılma olmasın)
    if (!o.isindi && Math.abs(P.x - o.x) < 2600) {
      if (typeof ANKA !== 'undefined' && ANKA.isit && !ANKA.hazir) ANKA.isit();
      else if (typeof midilliIsit === 'function' && !midilliIsit()) {}
      else o.isindi = true;
    }
    if (!o.basla) return;
    o.age += dt;
    if (o.age > 4 && !o.dalga1) { o.dalga1 = true; ripples.push({ x: o.x, y: o.y - 120, r: 0, life: 2.4 }); }
    if (o.age >= SN_FINAL_SURE && !o.tamam) { o.tamam = true; o.done = true; OLAY.emit('senlikTamam', { o }); }
  },
  ciz(o, tm) {
    const a = o.basla ? o.age : 0, isik = o.basla ? smooth(clamp(a / 2.5, 0, 1)) : 0;
    // 1) gökte havai fişekler (her şeyin arkasında)
    if (o.basla) snFisekler(o, a);
    // 2) ışık bayrakları: direğin tepesinden avlu kenarlarına
    const tx = o.x, ty = o.y - 230;
    g.save(); g.lineWidth = 1.4;
    for (let b = 0; b < o.bay.length; b++) {
      const ex = o.x + o.bay[b][0], ey = o.y + o.bay[b][1], mx = (tx + ex) / 2, my = (ty + ey) / 2 + 40;
      g.strokeStyle = 'rgba(70,52,96,.8)'; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
      // uçtaki küçük direk
      g.strokeStyle = '#4a3a63'; g.lineWidth = 5; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex, o.y); g.stroke(); g.strokeStyle = '#a58cb8'; g.lineWidth = 3; g.stroke(); g.lineWidth = 1.4;
      const N = 9;
      for (let k = 1; k < N; k++) {
        const u = k / N, m = 1 - u, bx = m * m * tx + 2 * m * u * mx + u * u * ex, by = m * m * ty + 2 * m * u * my + u * u * ey;
        const yan = clamp((a - .4 - u * 1.4 - b * .15) / .4, 0, 1) * (o.basla ? 1 : 0), ci = (k + b) % 5, sw = Math.sin(tm * 2 + k + b) * 2.2 * (.3 + yan);
        g.fillStyle = yan > .5 ? SN_ISIK[ci] : '#857d9c'; g.strokeStyle = 'rgba(70,52,96,.7)';
        g.beginPath(); g.moveTo(bx - 6, by); g.lineTo(bx + 6, by); g.lineTo(bx + sw * .5, by + 13); g.closePath(); g.fill(); g.stroke();
        if (yan > 0) { g.globalCompositeOperation = 'lighter'; snIsik(SN_ISIK[ci], bx, by + 5, 14, yan * .35); g.globalCompositeOperation = 'source-over'; }
      }
    }
    g.restore();
    // 3) şenlik direği (sarmal kurdeleli) + tepesinde yıldız
    g.save(); g.strokeStyle = '#4a3a63'; g.lineWidth = 9; g.beginPath(); g.moveTo(tx, o.y); g.lineTo(tx, ty); g.stroke();
    g.strokeStyle = '#efe2f6'; g.lineWidth = 6; g.stroke();
    g.lineWidth = 3; for (let k = 0; k < 8; k++) { g.strokeStyle = k % 2 ? '#ff9fc8' : '#c7a6ff'; const y0 = ty + 6 + k * 28; g.beginPath(); g.moveTo(tx - 3, y0); g.lineTo(tx + 3, y0 + 12); g.stroke(); }
    g.restore();
    snKoy(snYildizTac(), tx, ty - 6);
    g.globalCompositeOperation = 'lighter'; snIsik('#ffe9a6', tx, ty - 10, 40 + isik * 50, .2 + isik * .4 + .08 * Math.sin(tm * 3)); g.globalCompositeOperation = 'source-over';
    // 4) direğin arkasındaki dansçılar
    snDansCiz(o, tm, a, false);
    // 5) yerdeki misafirler (pofuduklar)
    if (o.basla && a > 5.5) snMisafirYer(o, tm, a);
  },
  cizOn(o, tm) {
    const a = o.basla ? o.age : 0;
    snDansCiz(o, tm, a, true);
    if (o.basla) snMisafirHava(o, tm, a);
  },
});
function snYildizTac() {
  return snTuval('tac', -16, -16, 32, 32, q => {
    q.fillStyle = '#ffe08e'; q.strokeStyle = '#b07a3a'; q.lineWidth = 1.2; q.beginPath();
    for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5.5 : 13; q.lineTo(Math.cos(an) * r, Math.sin(an) * r); } q.closePath(); q.fill(); q.stroke();
    q.fillStyle = 'rgba(255,255,255,.55)'; q.beginPath(); q.arc(-3, -3, 3, 0, SN_PI2); q.fill();
  });
}
// Havai fişek: kısa yükseliş izi + yuvarlak ışık çiçeği (kıvılcımlar yerçekimiyle hafifçe süzülür, sönerek)
const SN_FIS_YUK = .75, SN_FIS_OMUR = 1.9;
function snFisekler(o, a) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const ys = typeof mdYildizSpr === 'function' ? mdYildizSpr() : null;
  for (let i = 0; i < o.fis.length; i++) {
    const f = o.fis[i], u = a - f.t; if (u < 0 || u > SN_FIS_YUK + SN_FIS_OMUR) continue;
    const bx = o.x + f.x, by = o.y - f.h, col = SN_FIS_RENK[f.c];
    if (u < SN_FIS_YUK) {   // yükseliş
      const k = smooth(u / SN_FIS_YUK), x = bx + Math.sin(k * 3 + f.k) * 6, y = o.y - 40 - (f.h - 40) * k;
      for (let j = 0; j < 5; j++) snIsik(col[1], x, y + j * 9, 6 - j, .5 * (1 - j / 5));
      continue;
    }
    const v = (u - SN_FIS_YUK) / SN_FIS_OMUR, R = 105 * (1 - Math.pow(1 - v, 2.4)), sol = Math.pow(1 - v, 1.4), dus = v * v * 60;
    if (v < .25) snIsik(col[1], bx, by, 70 * (1 - v * 2), (1 - v * 4) * .6);
    for (let j = 0; j < f.n; j++) {
      const an = j / f.n * SN_PI2 + f.k, x = bx + Math.cos(an) * R, y = by + Math.sin(an) * R * .92 + dus, tw = .75 + .25 * Math.sin(a * 20 + j);
      snIsik(col[0], x, y, 15, sol * .85 * tw);
      if (ys) { g.globalAlpha = sol * tw; g.drawImage(ys, x - 5, y - 5, 10, 10); g.globalAlpha = 1; }
      if (v < .6) snIsik(col[1], bx + Math.cos(an) * R * .55, by + Math.sin(an) * R * .5 + dus * .6, 4, sol * .5);
    }
  }
  g.restore();
}
// Midilliler: final öncesi direğin dibinde uyurlar; kutlamada uyanıp elips bir halka dansıyla direğin çevresinde döner,
// sırayla zıplarlar. Elipsin önündekiler (sin > 0) Feza'nın önünde, arkadakiler direğin arkasında çizilir.
const SN_DANS_OPT = { uyku: 1, yon: 1, parilti: 0, kos: 0, zipla: 0, renk: 0 };
function snDansCiz(o, tm, a, on) {
  if (typeof midilliCiz !== 'function') return;
  const uyan = o.basla ? smooth(clamp((a - 1) / 1.6, 0, 1)) : 0, don = o.basla ? smooth(clamp((a - 2.6) / 2, 0, 1)) : 0;
  for (let i = 0; i < o.dans.length; i++) {
    const d = o.dans[i], ph = d.faz + (o.basla ? Math.max(0, a - 2.6) * .42 * don : 0);
    const sx = Math.cos(ph), sy = Math.sin(ph), onde = sy > 0;
    if (onde !== on) continue;
    // uykuda direk dibinde yan yana; dansta 230 x 46'lık elips
    const ux = o.x + (i - 2) * 92, uy = o.y, dx = o.x + sx * 250, dy = o.y + sy * 22;
    const x = lerp(ux, dx, don), y = lerp(uy, dy, don), olc = .78 * (1 + sy * .08 * don);
    const hopU = (a * .9 + i * .2) % 1, hop = don * (hopU < .35 ? Math.sin(hopU / .35 * Math.PI) * 34 : 0);
    const opt = SN_DANS_OPT; opt.uyku = 1 - uyan; opt.parilti = uyan; opt.renk = d.renk;
    opt.yon = don > .2 ? (-sy >= 0 ? 1 : -1) * 1 : (i % 2 ? -1 : 1);   // saat yönünün tersine dönerken hareket yönüne bakar
    opt.kos = don * (hop > 1 ? 0 : .6); opt.zipla = hop > 1 ? clamp(hop / 20, 0, 1) : 0;
    g.save(); g.globalAlpha = .2; g.fillStyle = '#2e2346'; g.beginPath(); g.ellipse(x, y, 30 * olc, 4.5, 0, 0, SN_PI2); g.fill(); g.restore();
    midilliCiz(g, x, y - hop, olc, tm + i * 1.7, opt);
  }
}
// yerde: üç misafir pofuduk direğin iki yanında zıplar (pofuduk.js'in kendi çizicisiyle)
function snMisafirYer(o, tm, a) {
  const l = snPofMisafir(o); if (!l) return;
  const g0 = smooth(clamp((a - 5.5) / 1.5, 0, 1));
  for (let i = 0; i < l.length; i++) {
    const f = l[i], p = f.pf, u = (a * 1.25 + i * .33) % 1, hop = u < .45 ? Math.sin(u / .45 * Math.PI) * 26 : 0;
    f.x = o.x + [-150, 150, -300][i] + Math.sin(a * .7 + i) * 12; f.y = o.y;
    p.jy = -hop; p.wy = 0; p.gy = 0; p.t = a + i; p.bloom = 1; p.goz = hop > 4 ? 'sik' : 'acik'; p.agiz = 'gulus'; p.agizB = .6;
    p.f = i % 2 ? -1 : 1; p.don = p.f; p.sq = hop > 1 ? -.06 : .08 * Math.sin(u * SN_PI2); p.olc = .9;
    g.save(); g.globalAlpha = g0; try { pfKucukCiz(f, tm); } catch (e) { o.pofMis = null; } g.restore();
  }
}
// havada: Anka avlunun üstünde geniş bir halka çizerek süzülür; iki denizatı ışık baloncukları içinde yüzer
const SN_ANKA_OPT = { pose: 'glide', face: 1, joy: 1, alpha: 1 };
function snMisafirHava(o, tm, a) {
  if (typeof ANKA !== 'undefined' && ANKA && typeof ANKA.ciz === 'function' && a > 3.5) {
    const k = a - 3.5, gir = smooth(clamp(k / 3, 0, 1)), ph = k * .38, x = o.x + Math.cos(ph) * 300 * gir + (1 - gir) * 700, y = o.y - 360 + Math.sin(ph * 2) * 40 - (1 - gir) * 120;
    const opt = SN_ANKA_OPT; opt.face = -Math.sin(ph) >= 0 ? 1 : -1; opt.alpha = Math.min(1, k / .8);
    try { ANKA.ciz(g, x, y, .34, tm, opt); } catch (e) {}
  }
  if (typeof dnzAtCiz === 'function' && typeof dnzPal !== 'undefined' && a > 7) {
    for (let i = 0; i < 2; i++) {
      const k = a - 7 - i * .8; if (k <= 0) continue;
      const gir = smooth(clamp(k / 2.2, 0, 1)), sd = i ? 1 : -1, x = o.x + sd * (190 + Math.sin(k * .6 + i) * 30), y = o.y - 150 - i * 40 + Math.sin(k * 1.3 + i) * 14 + (1 - gir) * 120;
      g.save(); g.globalAlpha = gir;
      // ışık baloncuğu
      g.globalCompositeOperation = 'lighter'; snIsik('#bdf3ff', x, y + 6, 46, .22); g.globalCompositeOperation = 'source-over';
      g.strokeStyle = 'rgba(220,250,255,.65)'; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y + 6, 34, 0, SN_PI2); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(x - 14, y - 12, 5, 8, .6, 0, SN_PI2); g.fill();
      try { g.save(); g.translate(x, y); g.scale(-sd, 1); dnzAtCiz(g, 0, -6, .3, tm, dnzPal[i * 2 % dnzPal.length], true, i * .8, null); g.restore(); } catch (e) {}
      g.restore();
    }
  }
  // Bulut Ülkesi'nin kuzucukları: iki küçük bulutun üstünde süzülerek gelir, sallanır, ara sıra göz kırpar (sahne.js shKuzu / shBulutSprite; saf çiziciler)
  if (typeof shKuzu === 'function' && typeof shBulutSprite === 'function' && a > 9) {
    for (let i = 0; i < 2; i++) {
      const k = a - 9 - i * 1.2; if (k <= 0) continue;
      const gir = smooth(clamp(k / 2.5, 0, 1)), sd = i ? 1 : -1;
      const x = o.x + sd * (300 + (1 - gir) * 260) + Math.sin(k * .5 + i) * 16, y = o.y - 255 - i * 30 + Math.sin(k * 1.1 + i * 2) * 10;
      g.save(); g.globalAlpha = gir;
      g.drawImage(shBulutSprite('beyaz'), x - 52, y - 8, 104, 52);
      try { shKuzu(g, x, y + 2, 30, -sd, ((tm + i * 1.3) % 3.4) < 0.15); } catch (e) {}
      g.restore();
    }
  }
}

// ═══════════════════════════════ dokunma (fener, şövalye) ═══════════════════════════════
// Yalnız görünen fenerin/şövalyenin üstüne gelen dokunuş bu nesnenindir; başka her dokunuş normal yürüme kontrolüne gider.
addEventListener('pointerdown', e => {
  if (typeof BOLUM_NO === 'undefined' || BOLUM_NO !== 6 || DURUM !== 'oyun' || e.target !== cv || P.ucus || P.fade > 0 || P.kilit > .05) return;
  const v = snV6(); if (v && v.final) return;
  if (e.button != null && e.button !== 0) return;
  if (typeof dugmede === 'function' && dugmede(e.clientX, e.clientY)) return;
  const r = cv.getBoundingClientRect(), wx = cam.x + (e.clientX - r.left) * DPR / S, wy = cam.y + (e.clientY - r.top) * DPR / S;
  let en = null, best = 1;
  for (const o of NESNELER) {
    if (Math.abs(o.x - P.x) > 900) continue;
    let d = 2;
    if (o.tip === 'fener' && !o.yandi) d = ((wx - o.x - 40) / 48) ** 2 + ((wy - (o.y - o.h)) / 52) ** 2;
    else if (o.tip === 'sovalye') d = ((wx - o.x) / 46) ** 2 + ((wy - (o.y - 60)) / 70) ** 2;
    if (d < best) { best = d; en = o; }
  }
  if (!en) return;
  e.preventDefault(); e.stopPropagation(); if (typeof omHepsiniBirak === 'function') omHepsiniBirak(); P.buf = 0;
  if (en.tip === 'fener') snFenerYak(en, 'dokunus'); else snSovSelam(en);
}, true);

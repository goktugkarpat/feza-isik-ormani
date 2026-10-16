/* senlik.js — Şenlik Kalesi'nin dünya nesneleri (Bölüm 6). Korkutucu hiçbir şey, silah, kaybetme yok.
   fener      : sönük asılı fener (direğe asılı). Feza yanından geçince ya da fenere dokununca yanar; altın-pembe ışık
                ve kıvılcımlar. o.yandi = true, V6.fener++, OLAY 'fener' {o, n}. Sokaktaki fener dizilerine yayılan ışık
                dalgasını dunya6.js bu olaydan çizer (iki kez çizilmesin diye burada dizi yok).
   sovalye    : sevimli tahta oyuncak şövalye heykeli (elinde yalnız küçük bir bayrak). Yaklaşınca/dokununca bayrağını
                ve şapkasını sallar. OLAY 'sovalyeSelam' {o}. Uzaklaşıp dönünce yeniden selam verir.
   kaleKopru  : kale köprüsü. V6.mini olunca ışıkla iner, cisim açılır, V6.kopru = true, OLAY 'kopruIndi' {o}.
                İnmeden önce kalkık köprü yolu kapatır (halka yolculuğu bitmeden oraya zaten gelinmez; halka türü yoksa
                Feza yaklaşınca kendiliğinden iner, takılma yok).
   senlikAvlu : kale avlusu. Feza varınca V6.final = true, OLAY 'senlikFinal' {o, duration, box}; ~34 sn sahneli kutlama
                (takvim avlu bölümünün başında): havai fişek gösterisi, kurdeleli halka dansı yapan midilliler, sırayla gelen
                misafir dostlar (Anka, denizatları, kuzucuklar, pofuduklar), dilek fenerleri, konfeti, doruk anında gökkuşağı
                köprüsü + ışık tacı. Ses olayları: fisekKalk, fisek, senlikMisafir, senlikDoruk, dilekFeneri. Sonunda 'senlikTamam'.
                senlikNabiz() (0..1) müziğin vuruşunda atar; başka dosyalar (ör. kale pencereleri) kullanabilir.
   Çizimler önbellek tuvallerinden (snSpr); her karede gradient/filtre üretilmez, parçacıklar sabit sayılı ve analitiktir. */
'use strict';
const SN = { spr: new Map(), avlu: null };
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
    // Yanma anı (o.yanT): 0-0,3 sn bir kıvılcım aşağıdan fenere süzülür → fenerin içinde alev doğar (yaylanarak büyür),
    // kâğıt fener sarsılıp sallanır, altın-pembe ışık halkası açılır, kıvılcımlar yükselir. Yanan fener: titrek alev ve ışık,
    // çevresinde süzülen üç ışık böceği.
    const fx = o.x + 40, fy = o.y - o.h, yt = o.yandi ? o.yanT : -1;
    const ac = o.yandi ? smooth(clamp((yt - .22) / .7, 0, 1)) : 0;
    const titre = .82 + .1 * Math.sin(tm * 9.3 + o.x) + .08 * Math.sin(tm * 15.7 + o.x * 2);
    const sal = Math.sin(tm * 1.1 + o.x * .01) * .035 + Math.sin(tm * 4.2) * .16 * o.it;
    snKoy(snDirek(o.h), o.x, o.y);
    // ip + fener (kolun ucundan asılı, yavaşça sallanır)
    g.save(); g.translate(fx, o.y - o.h - 34); g.rotate(sal);
    g.strokeStyle = '#3a2c54'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 13); g.stroke();
    g.translate(0, 34);
    if (ac > 0) { g.globalCompositeOperation = 'lighter'; snIsik('#ffc76e', 0, 0, 95, ac * .42 * titre); snIsik('#ff9fc8', 0, 0, 150, ac * .16 * titre); g.globalCompositeOperation = 'source-over'; }
    if (ac < 1) snKoy(snFenerSpr(o.v, false), 0, 0);
    if (ac > 0) { g.globalAlpha = ac; snKoy(snFenerSpr(o.v, true), 0, 0); g.globalAlpha = 1; }
    if (o.yandi && yt > .2) {   // içteki alev: doğarken yaylanarak büyür, sonra titrer
      const d = yt - .2, buy = d < .6 ? 1 + Math.sin(d / .6 * Math.PI) * .45 - (1 - smooth(clamp(d / .25, 0, 1))) : 1;
      const sx = buy * (1 + .06 * Math.sin(tm * 11 + o.x)), sy = buy * (titre + .12);
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = .9;
      g.drawImage(snAlevSpr(), -8 * sx, 6 - 22 * sy, 16 * sx, 22 * sy);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    if (!o.yandi) {   // sönük fenerde uyuyan küçük kor: Feza yaklaşınca yavaşça nefes alır (davet)
      const yak = clamp(1 - Math.abs(P.x - fx) / 320, 0, 1), n = .5 + .5 * Math.sin(tm * 2.2 + o.x);
      g.globalCompositeOperation = 'lighter'; snIsik('#ffd59a', 0, 2, 12 + yak * 8, .12 + yak * .25 * n); g.globalCompositeOperation = 'source-over';
    }
    g.restore();
    if (!o.yandi) return;
    g.globalCompositeOperation = 'lighter';
    const ys = typeof mdYildizSpr === 'function' ? mdYildizSpr() : null;
    if (yt < .3 && ys) {   // aşağıdan süzülen kıvılcım
      const u = smooth(yt / .3), kx = fx + Math.sin(u * 5) * 8, ky = fy + 70 - u * 70;
      snIsik('#ffe2a0', kx, ky, 18, .8); g.drawImage(ys, kx - 7, ky - 7, 14, 14);
      for (let j = 1; j < 4; j++) snIsik('#ffd27a', fx + Math.sin((u - j * .06) * 5) * 8, ky + j * 9, 7 - j, .5 - j * .1);
    }
    if (yt > .22 && yt < 1.6) {   // altın-pembe ışık halkası (genişleyerek söner)
      const u = (yt - .22) / 1.38, e = 1 - Math.pow(1 - u, 2.5);
      g.globalAlpha = (1 - u) * .7; g.strokeStyle = u < .5 ? '#ffd27a' : '#ffb3d1'; g.lineWidth = 4 * (1 - u) + 1;
      g.beginPath(); g.ellipse(fx, fy, 22 + e * 90, 20 + e * 70, 0, 0, SN_PI2); g.stroke();
      g.globalAlpha = (1 - u) * .45; g.strokeStyle = '#fff1c4'; g.lineWidth = 2; g.beginPath(); g.ellipse(fx, fy, 14 + e * 55, 13 + e * 42, 0, 0, SN_PI2); g.stroke();
      g.globalAlpha = 1;
      if (u < .25) snIsik('#fff1c4', fx, fy, 70, (1 - u * 4) * .55);
    }
    // yanma anı: fenerden yükselen ışık kıvılcımları (sabit sayılı)
    if (yt > .22 && yt < 2.6) {
      const yl = (yt - .22) / 2.4;
      for (let k = 0; k < 10; k++) { const a = k * .628 + o.x, u = clamp(yl * 1.4 - k * .04, 0, 1), rr = 18 + u * 46;
        const kx = fx + Math.cos(a) * rr, ky = fy + Math.sin(a) * rr * .7 - u * 34;
        snIsik(SN_ISIK[k % 5], kx, ky, 7, (1 - u) * .7);
        if (ys && k % 2) { g.globalAlpha = (1 - u) * .9; g.drawImage(ys, kx - 4, ky - 4, 8, 8); g.globalAlpha = 1; } }
    }
    // ışık böcekleri: yanan fenerin çevresinde yavaşça süzülen üç küçük ışık (yanınca belirir)
    const bk = smooth(clamp((yt - .8) / 1.2, 0, 1));
    if (bk > 0) for (let k = 0; k < 3; k++) {
      const ph = tm * (.55 + k * .13) + k * 2.1 + o.x, bx = fx + Math.cos(ph) * (34 + k * 9) + Math.sin(ph * 2.3) * 6, by = fy + 6 + Math.sin(ph * 1.4) * (22 + k * 5);
      const n = .55 + .45 * Math.sin(tm * 3.1 + k * 1.7 + o.x);
      snIsik(k === 1 ? '#ffb3d1' : '#fff0b0', bx, by, 9, bk * .55 * n); snIsik('#ffffff', bx, by, 2.6, bk * .8 * n);
    }
    g.globalCompositeOperation = 'source-over';
  },
});
function snAlevSpr() {   // fener içindeki küçük alev (damla; altın çekirdek, pembe kenar) — bir kez
  return snTuval('alev', -8, -16, 16, 22, q => {
    const gr = q.createRadialGradient(0, 2, 0, 0, -2, 10); gr.addColorStop(0, 'rgba(255,252,230,1)'); gr.addColorStop(.4, 'rgba(255,214,120,.9)'); gr.addColorStop(1, 'rgba(255,140,180,0)');
    q.fillStyle = gr; q.beginPath(); q.moveTo(0, -15); q.bezierCurveTo(5, -6, 8, 0, 6, 3); q.quadraticCurveTo(0, 8, -6, 3); q.bezierCurveTo(-8, 0, -5, -6, 0, -15); q.fill();
  });
}

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
    // Selam (2,6 sn): önce eğilip şapkasını çıkarır (şapka öne doğru kalkar), sonra iki yana sekerek küçük bir dans eder;
    // bayrağı havada dalgalanır ve flamadan konfeti saçılır. Dururken hafif sallanır, ara sıra göz kırpar.
    const s = o.olcek || 1.15, T = o.selam > 0 ? 2.6 - o.selam : -1;
    const sel = o.selam > 0 ? Math.sin(Math.min(1, T / .3) * Math.PI / 2) * Math.min(1, o.selam / .4) : 0;
    const egil = T >= 0 ? mdBumpSn(T, 0, .75) : 0, dans = T > .6 && T < 2.35 ? 1 : 0, adim = dans ? (T - .6) / .44 : 0, ai = Math.floor(adim);
    const hop = dans ? Math.abs(Math.sin(adim * Math.PI)) * 8 : Math.abs(Math.sin(o.zip * Math.PI * 2)) * o.zip * 7;
    const sway = Math.sin(tm * .9 + o.t) * .02 + egil * .3 + (dans ? Math.sin(adim * Math.PI) * .13 * (ai % 2 ? -1 : 1) : 0);
    const kayX = dans ? Math.sin(adim * Math.PI * .5) * 5 : 0;
    g.save(); g.translate(o.x, o.y); g.scale(s * o.yon, s);
    snKoy(snSovParca('kaide'), 0, 0);
    g.translate(kayX, -24 - hop); g.rotate(sway);
    snKoy(snSovParca('govde'), 0, 0);
    // diğer kol: dansta beline koyar gibi yukarı-dışa kalkar
    g.fillStyle = '#8fa8f0'; g.strokeStyle = '#4a3760'; g.lineWidth = 1.3; g.beginPath(); g.ellipse(-12 - dans * 2, -30 - dans * 3, 4, 8, .4 + dans * .5 * Math.sin(adim * Math.PI), 0, SN_PI2); g.fill(); g.stroke();
    // baş + şapka (selamda şapka başın üstünden kalkar, öne doğru çıkarılır ve sallanır)
    g.save(); g.translate(0, -44); g.rotate(Math.sin(tm * .8 + o.t) * .04 + sel * .12 + (dans ? Math.sin(adim * Math.PI * 2) * .08 : 0));
    snKoy(snSovParca('bas'), 0, 0);
    // gözler: dururken sakin nokta (ara sıra kırpar); selamda mutlu kapalı kavis
    g.fillStyle = '#3b2b4f'; g.strokeStyle = '#3b2b4f'; g.lineWidth = 1.4;
    const kirp = Math.pow(Math.max(0, Math.sin(tm * .8 + o.t * 3)), 50) > .5;
    if (sel > .3 || kirp) { for (const ex of [-4.5, 4.5]) { g.beginPath(); g.moveTo(ex - 2.4, -12); g.quadraticCurveTo(ex, sel > .3 ? -14.6 : -10.8, ex + 2.4, -12); g.stroke(); } }
    else for (const ex of [-4.5, 4.5]) { g.beginPath(); g.ellipse(ex, -12.5, 1.7, 2.2, 0, 0, SN_PI2); g.fill(); }
    const sk = sel * (8 + Math.sin(tm * 9) * 3) + egil * 6, sx = egil * 9;
    g.save(); g.translate(sx, -6 - sk); g.rotate(-sel * .25 + egil * .5); snKoy(snSovParca('sapka'), 0, 0); g.restore();
    g.restore();
    // bayraklı kol: dururken yanında hafif sallanır, selamda yukarı kalkar ve dalgalanır (dansta daire çizer)
    const kolA = lerp(.25 + Math.sin(tm * 1.2 + o.t) * .05, -.15 + Math.sin(tm * 9) * .4 * (1 - dans * .4) + (dans ? Math.sin(adim * Math.PI) * .25 : 0), sel);
    g.save(); g.translate(11, -38); g.rotate(kolA); snKoy(snSovParca('kol'), 0, 0);
    // flama: üç noktalı yumuşak dalga
    const w = Math.sin(tm * 5 + o.t) * (2 + sel * 4);
    g.fillStyle = '#ff9fc8'; g.strokeStyle = '#4a3760'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(8, -41); g.quadraticCurveTo(18, -40 + w, 28, -35 + w * .6); g.quadraticCurveTo(18, -31 - w * .4, 8, -29); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#ffe08e'; g.beginPath(); g.arc(15, -35 + w * .3, 2, 0, SN_PI2); g.fill();
    g.restore();
    g.restore();
    if (sel > .05) { g.globalCompositeOperation = 'lighter'; snIsik('#ffe2a0', o.x + 30 * o.yon * s, o.y - 110 * s, 22, sel * .3); g.globalCompositeOperation = 'source-over'; }
    if (T >= 0) snSovKonfeti(o, s, T);
  },
});
function mdBumpSn(u, a, b) { return u <= a || u >= b ? 0 : Math.sin((u - a) / (b - a) * Math.PI); }
// Flamadan saçılan konfeti: 16 parça, analitik (durum yok). Her parça kendi anında flamanın ucundan fırlar, döne döne düşer.
const SN_KONF = ['#ff9fc8', '#ffe08e', '#c9b8ff', '#9fe6d0', '#ffb08a'];
function snSovKonfeti(o, s, T) {
  const tx = o.x + o.yon * s * 34, ty = o.y - s * 112;
  for (let k = 0; k < 16; k++) {
    const t0 = .35 + k * .11, u = T - t0; if (u < 0 || u > 1.6) continue;
    const an = -Math.PI / 2 + ((k * 7) % 11 - 5) * .16, v = 120 + (k % 4) * 25;
    const x = tx + Math.cos(an) * v * u * o.yon + Math.sin(u * 6 + k) * 8, y = ty + Math.sin(an) * v * u + 160 * u * u;
    const dn = Math.abs(Math.cos(u * 9 + k)), a = u > 1.1 ? (1.6 - u) / .5 : 1;
    g.globalAlpha = a; g.fillStyle = SN_KONF[k % 5]; g.fillRect(x - 3 * dn, y - 2, 6 * dn + .6, 4);
  }
  g.globalAlpha = 1;
}

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
    if (o.done && o.t < SN_KOPRU_SURE + 5) o.t += dt;   // iniş sonrası parlamalar için saymaya devam
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
    // İniş (o.t): zincirlerde aşağı akan ışık boncukları, güverte tahtalarında menteşeden uca sırayla yanan ışık;
    // köprü yere değince parlama, genişleyen ışık halkası ve güverte boyunca koşan parlak bir ışık çizgisi.
    const piv = o.x1, a = (1 - o.ac) * Math.PI / 2, v = snV6(), w = o.w, u = o.inis ? clamp(o.t / SN_KOPRU_SURE, 0, 1) : 0, sonra = o.done ? o.t - SN_KOPRU_SURE : -1;
    if (!o.kapiYok) snKoy(snKapiKemer(), piv, o.yuz);
    // zincirler: kemerin tepesinden güvertenin ucuna (minik halkalar)
    const ex = piv - Math.cos(a) * w, ey = o.yuz - Math.sin(a) * w, cx = piv - 20, cy = o.yuz - 120, n = 14;
    g.save(); g.strokeStyle = '#5a4a72'; g.lineWidth = 1.6;
    for (let k = 0; k <= n; k++) { const f = k / n, sg = Math.sin(f * Math.PI) * 18 * o.ac; g.beginPath(); g.ellipse(lerp(cx, ex, f), lerp(cy, ey, f) + sg, 2.6, 1.8, Math.atan2(ey - cy, ex - cx), 0, SN_PI2); g.stroke(); }
    g.restore();
    const akis = o.inis && sonra < 2.2 ? (sonra < 0 ? 1 : 1 - sonra / 2.2) : 0;
    if (akis > 0) {   // zincirden akan ışık boncukları
      g.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 5; k++) { const f = ((o.t * .9) + k / 5) % 1, sg = Math.sin(f * Math.PI) * 18 * o.ac, bx = lerp(cx, ex, f), by = lerp(cy, ey, f) + sg;
        snIsik(SN_ISIK[k % 5], bx, by, 13, akis * .7); snIsik('#ffffff', bx, by, 3.5, akis * .9); }
      g.globalCompositeOperation = 'source-over';
    }
    // güverte (menteşe sağ uçta)
    g.save(); g.translate(piv, o.yuz); g.rotate(a); snKoy(snKopruGuverte(w), 0, 0);
    g.globalCompositeOperation = 'lighter';
    // tahtalar: inerken menteşeden uca sırayla yanar; indikten sonra sıcak ışıkla kalır
    if (o.inis) {
      const N = Math.max(1, Math.floor((w - 8) / 18));
      for (let i = 0; i < N; i++) {
        const yan = o.done ? 1 : clamp(u * N * 1.15 - i, 0, 1); if (yan <= 0) continue;
        const x = -4 - (i + .5) * 18, taze = o.done ? 0 : clamp(1 - (u * N * 1.15 - i) / 3, 0, 1);
        snIsik(SN_ISIK[i % 5], x, 5, 13 + taze * 8, (.16 + .4 * taze) * yan + .04 * Math.sin(tm * 2.4 + i));
      }
    }
    // fener ışığı: toplanan fener kadar lamba yanar; köprü indiğinde hepsi
    const yanan = o.done ? 6 : Math.min(6, Math.round(((v && v.fener) || 0) / 2));
    for (let i = 0; i < yanan; i++) { const x = -w * (i + .5) / 6; snIsik(SN_ISIK[i % 5], x, 12, 14, .5 + .15 * Math.sin(tm * 2 + i)); }
    if (o.inis && !o.done) for (let i = 0; i < 7; i++) snIsik('#fff1c4', -w * ((u * 1.6 + i / 7) % 1), 2, 22, .35 * Math.sin(u * Math.PI));
    if (sonra >= 0 && sonra < .9) { const f = smooth(sonra / .9), x = -w * f; snIsik('#ffffff', x, 4, 26, (1 - f) * .9); snIsik('#ffe2a0', x, 4, 60, (1 - f) * .5); }   // ışık çizgisi uca koşar
    g.globalCompositeOperation = 'source-over'; g.restore();
    // yere değiş: parlama + genişleyen ışık halkası
    if (sonra >= 0 && sonra < 1.4) {
      const f = sonra / 1.4, e = 1 - Math.pow(1 - f, 2.4), mx = piv - w / 2;
      g.globalCompositeOperation = 'lighter';
      snIsik('#fff1c4', mx, o.yuz - 10, 160 + e * 80, (1 - f) * .55);
      g.globalAlpha = (1 - f) * .7; g.strokeStyle = '#ffd27a'; g.lineWidth = 4 * (1 - f) + 1; g.beginPath(); g.ellipse(mx, o.yuz - 4, w * .5 + e * 140, 16 + e * 40, 0, 0, SN_PI2); g.stroke();
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    // inerken ve indikten sonra kısa süre güverte boyunca ışık tozu
    if (o.inis && o.t < SN_KOPRU_SURE + 1.5) {
      g.globalCompositeOperation = 'lighter'; const k0 = o.t / (SN_KOPRU_SURE + 1.5);
      for (let k = 0; k < 10; k++) { const f = (k0 * 2 + k * .1) % 1, d = f * w; snIsik(SN_ISIK[k % 5], piv - Math.cos(a) * d, o.yuz - Math.sin(a) * d - 8 - Math.sin(f * 9 + k) * 6, 8, (1 - k0) * .6); }
      g.globalCompositeOperation = 'source-over';
    }
  },
});

// ═══════════════════════════════ ŞENLİK AVLUSU (FİNAL) ═══════════════════════════════
// ~34 sn sahneli kutlama (a = o.age, vuruş 0,6 sn = müziğin 12/8 ölçüsünde bir "hop"; ölçü 2,4 sn):
//   0-2,5   ışık bayrakları sırayla yanar, direk yıldızı parlar, uyuyan midilliler uyanır (gerinme, yeleye ışık)
//   1,6-4   sırayla yükselen üç roket → ilk büyük kasımpatı; midilliler direğin çevresinde kurdeleli halka dansına girer
//   4       Anka ışık iziyle süzülerek gelir · 7 denizatları baloncuklardan takla atarak çıkar · 9,5 kuzucuklar bulutlarla,
//           altlarında minik gökkuşağıyla gelir · 11,5 pofuduklar çiçek patlamasıyla yerden fırlar (her biri kendi anıyla)
//   4-24    havai fişek gösterisi: kasımpatı, halka, renk değiştiren çiftler, palmiye, kalp, yıldız, altın yağmur, roket yelpazesi;
//           konfeti ve ışık yaprakları yağar; 12. sn'den sonra dilek fenerleri gökyüzüne bırakılır
//   25      DORUK: gökte ışıktan gökkuşağı köprüsü kurulur, direğin üstünde büyük ışık tacı belirir, midilliler şahlanır (OLAY 'senlikDoruk')
//   27-31   büyük final yağmuru (art arda fişekler + bayrak iplerinden altın şelale)
//   31-34   sakin parıltı, dilek fenerleri yükselir → OLAY 'senlikTamam' (sabah)
// Ses için olaylar (muzik.js dinler): 'fisek' {tip, tur, x, y, pan, buyuk} — kalkışta tip 'roket', patlamada SN_FIS_SES adı
//   (topKasimpati, topHalka, topCift, topPalmiye, pirilKucuk, kalp, yildiz, altinYagmur); ayrıca 'fisekKalk' {x, pan},
//   'senlikMisafir' {ad: 'anka'|'denizati'|'kuzu'|'pofuduk'}, 'senlikDoruk' {o}, 'dilekFeneri' {n}.
// Hepsi sabit takvim + analitik çizim: parçacık durumu yok, karede yeni nesne/gradient yok.
const SN_FINAL_SURE = 34, SN_VUR = .6, SN_OLCU = 2.4, SN_DORUK = 25;
const SN_FIS_RENK = [['#ffd27a', '#fff3c4'], ['#ff9fcf', '#ffe0ef'], ['#c7a6ff', '#efe4ff'], ['#9fe6d0', '#e6fff6'], ['#ffb08a', '#ffe9d8'], ['#8fd6ff', '#e2f6ff']];
const SN_GOKKUSAGI = ['#ff9fb6', '#ffc58f', '#ffe9a0', '#b9f0b4', '#9fd8ff', '#b8a4ff', '#e3a6ff'];
// fişek türü: [kıvılcım sayısı, yarıçap, ömür, düşüş]
const SN_FIS_TUR = { kasimpati: [40, 128, 2.1, 70], halka: [30, 118, 1.9, 50], kalp: [34, 120, 2.2, 45], yildiz: [35, 122, 2.1, 50],
  palmiye: [40, 140, 2.4, 120], altin: [34, 96, 3.3, 170], kucuk: [16, 58, 1.25, 50], cift: [26, 92, 2.0, 60] };
const SN_FIS_YUK = .8;
// 'fisek' olayındaki tip adı muzik.js'in ses türünü seçer: roket (kalkış), top (püf+akor), kalp/yildiz/piril (çan serpintisi), altinYagmur
const SN_FIS_SES = { kasimpati: 'topKasimpati', halka: 'topHalka', cift: 'topCift', palmiye: 'topPalmiye', kucuk: 'pirilKucuk', kalp: 'kalp', yildiz: 'yildiz', altin: 'altinYagmur' };
function snFis(o, t, x, h, tip, c1, c2, lx) {   // x: -1..1 (kadraj genişliğine göre), h: avlu zemininden yükseklik
  const r = o.rng, T = SN_FIS_TUR[tip];
  o.fis.push({ t, x, h, tip, c1, c2: c2 == null ? c1 : c2, n: T[0], R: T[1] * (1.2 + r() * .22), om: T[2], g: T[3], k: r() * 6, lx: lx == null ? x * .8 + (r() - .5) * .2 : lx, ek: false, ep: false, tilt: (r() - .5) * .9 });
}
function snAvluKur(o) {
  const r = o.rng = rng(6061); o.fis = [];
  const R = () => (r() * 6) | 0;
  // 0: açılış — sırayla yükselen üç roket, sonra ilk büyük kasımpatı
  snFis(o, 1.6, -.6, 270, 'kucuk', 0); snFis(o, 1.95, 0, 300, 'kucuk', 1); snFis(o, 2.3, .6, 270, 'kucuk', 2);
  snFis(o, 3.0, 0, 360, 'kasimpati', 0, 1);
  // 1: kasımpatılar, halka, renk değiştiren çift, palmiye, roket dizisi
  snFis(o, 4.4, -.55, 330, 'kasimpati', 1, 2); snFis(o, 5.2, .55, 345, 'kasimpati', 3, 0);
  snFis(o, 6.0, 0, 380, 'halka', 2, 5);
  snFis(o, 6.9, -.6, 320, 'cift', 1, 5); snFis(o, 6.9, .6, 320, 'cift', 5, 1);
  snFis(o, 7.9, 0, 350, 'palmiye', 0);
  snFis(o, 8.7, -.35, 360, 'kasimpati', 4, 2);
  for (let i = 0; i < 5; i++) snFis(o, 9.3 + i * .2, -.7 + i * .35, 260 + (i % 2) * 40, 'kucuk', i % 6);
  // 2: kalpler ve yıldızlar
  snFis(o, 10.6, 0, 360, 'kalp', 1); snFis(o, 11.6, -.55, 330, 'yildiz', 0); snFis(o, 12.4, .55, 340, 'kalp', 1);
  snFis(o, 13.2, 0, 380, 'halka', 3, 2);
  snFis(o, 14.0, -.6, 320, 'cift', 0, 2); snFis(o, 14.0, .6, 320, 'cift', 2, 0);
  snFis(o, 14.8, 0, 365, 'yildiz', 0);
  snFis(o, 15.6, -.45, 335, 'kasimpati', 5, 1); snFis(o, 15.9, .45, 355, 'kasimpati', 2, 3);
  snFis(o, 16.8, 0, 380, 'altin', 0);
  // 3: roket yelpazesi, kalp+yıldız, ikiz halka, palmiye, altın yağmur
  for (let i = 0; i < 7; i++) snFis(o, 18.0 + i * .22, -.75 + i * .25, 280 + Math.sin(i / 6 * Math.PI) * 90, 'kucuk', i % 6, null, 0);
  snFis(o, 20.2, -.5, 340, 'kalp', 1); snFis(o, 20.2, .5, 340, 'yildiz', 0);
  snFis(o, 21.2, -.35, 360, 'halka', 5, 2); snFis(o, 21.5, .35, 370, 'halka', 2, 5);
  snFis(o, 22.1, 0, 345, 'palmiye', 4);
  snFis(o, 22.9, -.6, 320, 'cift', 3, 1); snFis(o, 22.9, .6, 320, 'cift', 1, 3);
  snFis(o, 23.7, -.3, 380, 'altin', 0); snFis(o, 23.9, .3, 370, 'altin', 4);
  // DORUK: üçlü büyük kasımpatı
  snFis(o, SN_DORUK - SN_FIS_YUK, -.6, 340, 'kasimpati', 0, 1); snFis(o, SN_DORUK - SN_FIS_YUK, 0, 390, 'kasimpati', 2, 3); snFis(o, SN_DORUK - SN_FIS_YUK, .6, 340, 'kasimpati', 1, 0);
  snFis(o, 25.9, 0, 410, 'kalp', 1);
  // final yağmuru
  const tur = ['kasimpati', 'halka', 'yildiz', 'kucuk', 'kalp', 'kasimpati', 'cift', 'palmiye'];
  for (let i = 0; i < 16; i++) { const tp = tur[i % tur.length]; snFis(o, 26.8 + i * .24, ((i * 5) % 9) / 4 - 1, 280 + r() * 120, tp, R(), R()); }
  snFis(o, 29.4, -.55, 380, 'altin', 0); snFis(o, 29.5, 0, 400, 'altin', 4); snFis(o, 29.6, .55, 380, 'altin', 0);
  snFis(o, 31.2, 0, 380, 'kalp', 1);
  // dans eden midilliler (avluda uyuyorlar; final başlayınca uyanıp şenlik direğinin çevresinde dans ederler)
  o.dans = []; for (let i = 0; i < 5; i++) o.dans.push({ faz: i / 5 * SN_PI2, renk: i % 5, opt: { uyku: 1, yon: 1, parilti: 0, kos: 0, zipla: 0, renk: i % 5, dalga: 0, ger: 0, saha: 0, kulak: 0 } });
  // direkten avlu kenarlarına gerilen ışık bayrakları: [uç x, uç y]
  o.bay = [[-390, -170], [-220, -150], [220, -150], [390, -170]];
  // dilek fenerleri: bırakılış zamanı, x (-1..1), hız, renk
  o.dilek = []; for (let i = 0; i < 18; i++) o.dilek.push({ t: 12 + i * 1.05 + r() * .5, x: (r() * 2 - 1) * .9, v: 34 + r() * 22, k: r() * 6, c: i % 3, ek: false });
  o.box = { x0: o.x - 360, x1: o.x + 360, y0: o.y - 480, y1: o.y + 40 }; o.gen = 360; o.rK = 1;
  o.olay = { dansa: false, anka: false, denizati: false, kuzu: false, pofuduk: false, doruk: false, pirDans: false };
}
// Kadraj: yatay ekranda geniş (720), dikey ekranda dar kutu — dikeyde yakınlaşınca gökyüzü ve dans ekranı doldursun.
// Dans halkası, misafirler ve fişekler bu genişliğe göre (o.gen, o.rK) yerleşir.
function snKadraj(o) {
  const asp = typeof W !== 'undefined' && typeof H !== 'undefined' && H > 0 ? W / H : 1.33;
  // görünen dünya genişliğine göre (oyun.js kadrajı yalnız uzaklaşır; dikeyde de sahne geniş kalabilir)
  const gen = clamp(Math.min(asp >= 1.2 ? 360 : asp >= .95 ? 320 : 280, (typeof VW !== 'undefined' && VW > 0 ? VW / 2 - 50 : 360)), 200, 360);
  o.gen = gen; o.rK = gen / 360;
  const b = o.box; b.x0 = Math.min(o.x - gen, P.x - 80); b.x1 = Math.max(o.x + gen, P.x + 80); b.y0 = o.y - 480; b.y1 = o.y + (asp >= .95 ? 40 : 20);
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
  snKadraj(o);
  // Kadraj: kamera dünyanın tepesinin (≈ -40) üstüne çıkamaz; kutu (o.box, her karede snKadraj günceller) alçak tutulur ki
  // yakınlaşınca gökyüzü (fişek, Anka, bayraklar) ekranı doldursun. oyun.js kutuyu her karede e.box'tan okur.
  OLAY.emit('senlikFinal', { o, duration: SN_FINAL_SURE, box: o.box });
}
// Müziğin vuruşuna bağlı nabız (0..1, vuruş başında 1): dunya6.js de kale pencerelerini bununla yakıp söndürebilir.
function senlikNabiz() {
  const o = SN.avlu; if (!o || !o.basla) return 0;
  const u = (o.age % SN_VUR) / SN_VUR; return Math.pow(1 - u, 3);
}
function snPan(x) { return clamp((x - cam.x - VW / 2) / (VW / 2), -1, 1); }
TUR.kaydet('senlikAvlu', {
  kur(o) { o.basla = false; o.age = 0; o.r = o.r || 170; o.ry = o.ry || 30; o.isinT = 0; snAvluKur(o); SN.avlu = o; },
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
      else { o.isindi = true; snFenerDilekSpr(); snTacSpr(); snIsinSpr(); }
    }
    if (!o.basla) return;
    const a0 = o.age; o.age += dt; const a = o.age, ev = o.olay;
    snKadraj(o);
    if (a > 4 && !o.dalga1) { o.dalga1 = true; ripples.push({ x: o.x, y: o.y - 120, r: 0, life: 2.4 }); }
    // fişek olayları (ses): kalkış ve patlama anı
    for (let i = 0; i < o.fis.length; i++) {
      const f = o.fis[i];
      if (!f.ek && a >= f.t) { f.ek = true; const x = o.x + f.lx * o.gen; OLAY.emit('fisekKalk', { x, pan: snPan(x) }); OLAY.emit('fisek', { tip: 'roket', tur: f.tip, x, y: o.y - 30, pan: snPan(x) }); }
      if (!f.ep && a >= f.t + SN_FIS_YUK) { f.ep = true; const x = o.x + f.x * o.gen, y = o.y - f.h; OLAY.emit('fisek', { tip: SN_FIS_SES[f.tip] || 'top', tur: f.tip, x, y, pan: snPan(x), buyuk: f.n >= 34 }); }
    }
    for (let i = 0; i < o.dilek.length; i++) { const d = o.dilek[i]; if (!d.ek && a >= d.t) { d.ek = true; OLAY.emit('dilekFeneri', { n: i + 1 }); } }
    if (!ev.anka && a >= 4) { ev.anka = true; OLAY.emit('senlikMisafir', { ad: 'anka' }); }
    if (!ev.denizati && a >= 7) { ev.denizati = true; OLAY.emit('senlikMisafir', { ad: 'denizati' }); }
    if (!ev.kuzu && a >= 9.5) { ev.kuzu = true; OLAY.emit('senlikMisafir', { ad: 'kuzu' }); }
    if (!ev.pofuduk && a >= 11.5) { ev.pofuduk = true; OLAY.emit('senlikMisafir', { ad: 'pofuduk' }); burst(o.x - 150 * o.rK, o.y - 20, 14, ['#ffb3d1', '#ffe08e', '#bff0d8'], 140, 1, 6); burst(o.x + 150 * o.rK, o.y - 20, 14, ['#ffb3d1', '#ffe08e', '#bff0d8'], 140, 1, 6); }
    if (!ev.doruk && a >= SN_DORUK) { ev.doruk = true; lightTarget = 1; OLAY.emit('senlikDoruk', { o }); ripples.push({ x: o.x, y: o.y - 300, r: 0, life: 2.6 }); burst(o.x, o.y - 330, 40, ['#ffe9a6', '#ffb3d1', '#d9b8ff', '#ffffff'], 220, 2, 7); }
    // Pırıl Feza'nın çevresinde sevinç dansına başlar (piril.js 'dans' modu); Feza müziğin vuruşunda sevinçle zıplar
    if (!ev.pirDans && a > 2.4 && typeof D !== 'undefined' && D) { ev.pirDans = true; D.danceAfter = true; }
    if (a > 4.2 && a < SN_FINAL_SURE - 1 && typeof P !== 'undefined') {
      const per = a >= SN_DORUK && a < 31 ? SN_VUR : SN_VUR * 2, k0 = Math.floor((a0 - 4.2) / per), k1 = Math.floor((a - 4.2) / per);
      const buyuk = a >= SN_DORUK && a < 31, fzDans = typeof fzSenlik6 === 'function';   // feza.js dans ediyorsa zıplama yalnız dorukta
      if (k1 > k0 && P.ground && !P.ucus && (buyuk || !fzDans)) {
        P.vy = buyuk ? -560 : (k1 % 4 === 3 ? -520 : -400); P.ground = false;
        if (!fzDans && k1 % 4 === 1 && Number.isFinite(P.f)) P.f = -P.f;   // ara sıra öbür yana döner (dans)
        if (buyuk || k1 % 4 === 3) burst(P.x, P.y - 4, 6, ['#ffe08e', '#ffb3d1', '#ffffff'], 90, .7, 5);
      }
    }
    if (a >= SN_FINAL_SURE && !o.tamam) { o.tamam = true; o.done = true; OLAY.emit('senlikTamam', { o }); }
  },
  ciz(o, tm) {
    const a = o.basla ? o.age : 0, isik = o.basla ? smooth(clamp(a / 2.5, 0, 1)) : 0, nb = o.basla ? senlikNabiz() : 0;
    // 1) gökyüzü: gökkuşağı köprüsü, ışık tacı, havai fişekler, dilek fenerleri (her şeyin arkasında)
    if (o.basla) { snGokkusagi(o, tm, a); snFisekler(o, a); snDilekler(o, tm, a); }
    // 2) ışık bayrakları: direğin tepesinden avlu kenarlarına (finalde vuruşla nabız atar)
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
        if (yan > 0) { g.globalCompositeOperation = 'lighter'; snIsik(SN_ISIK[ci], bx, by + 5, 14 + nb * 5, yan * (.28 + .22 * ((k + Math.floor(a / SN_VUR)) % 2 ? nb : 0))); g.globalCompositeOperation = 'source-over'; }
        // final yağmurunda iplerden dökülen altın şelale
        if (a > 29.2 && a < 33.5 && k % 2) {
          const sel = smooth(clamp((a - 29.2) / .6, 0, 1)) * (1 - smooth(clamp((a - 32.3) / 1.2, 0, 1)));
          g.globalCompositeOperation = 'lighter';
          for (let j = 0; j < 3; j++) { const f = (a * 1.1 + j / 3 + k * .13 + b * .29) % 1; snIsik(j ? '#ffd27a' : '#fff3c4', bx + Math.sin(f * 5 + k) * 3, by + 10 + f * 130, 7 - j, sel * (1 - f) * .8); }
          g.globalCompositeOperation = 'source-over';
        }
      }
    }
    g.restore();
    // 3) şenlik direği (sarmal kurdeleler finalde yukarı doğru akar) + tepesinde yıldız
    g.save(); g.strokeStyle = '#4a3a63'; g.lineWidth = 9; g.beginPath(); g.moveTo(tx, o.y); g.lineTo(tx, ty); g.stroke();
    g.strokeStyle = '#efe2f6'; g.lineWidth = 6; g.stroke();
    const kay = o.basla ? (a * 24) % 28 : 0;
    g.lineWidth = 3; for (let k = 0; k < 8; k++) { g.strokeStyle = k % 2 ? '#ff9fc8' : '#c7a6ff'; const y0 = ty + 6 + k * 28 - kay; if (y0 < ty + 2) continue; g.beginPath(); g.moveTo(tx - 3, y0); g.lineTo(tx + 3, y0 + 12); g.stroke(); }
    g.restore();
    const ts = 1 + nb * .12 * isik;
    g.save(); g.translate(tx, ty - 6); g.scale(ts, ts); snKoy(snYildizTac(), 0, 0); g.restore();
    g.globalCompositeOperation = 'lighter'; snIsik('#ffe9a6', tx, ty - 10, 40 + isik * 50 + nb * 14, .2 + isik * .4 + .08 * Math.sin(tm * 3)); g.globalCompositeOperation = 'source-over';
    if (o.basla) snTac(o, tm, a);
    // 4) direğin arkasındaki dansçılar
    snDansCiz(o, tm, a, false);
    // 5) yerdeki misafirler (pofuduklar)
    if (o.basla && a > 11.5) snMisafirYer(o, tm, a);
  },
  cizOn(o, tm) {
    const a = o.basla ? o.age : 0;
    snDansCiz(o, tm, a, true);
    if (o.basla) { snMisafirHava(o, tm, a); snKonfeti(o, tm, a); }
  },
});
function snYildizTac() {
  return snTuval('tac', -16, -16, 32, 32, q => {
    q.fillStyle = '#ffe08e'; q.strokeStyle = '#b07a3a'; q.lineWidth = 1.2; q.beginPath();
    for (let i = 0; i < 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5.5 : 13; q.lineTo(Math.cos(an) * r, Math.sin(an) * r); } q.closePath(); q.fill(); q.stroke();
    q.fillStyle = 'rgba(255,255,255,.55)'; q.beginPath(); q.arc(-3, -3, 3, 0, SN_PI2); q.fill();
  });
}

// ── Havai fişekler ── kıvılcım konumu analitik: yön (türün şekli) × açılım yarıçapı R(v) + yerçekimi düşüşü. Her fişeğin
// izleri tek yolda (tek stroke) çizilir; her kıvılcım bir ışık lekesi (+ yarısında yıldız pırıltısı).
const SN_YON = { x: 0, y: 0 };
function snFisYon(f, j) {   // j. kıvılcımın birim yönü (şekil) → SN_YON
  const n = f.n, an = j / n * SN_PI2 + f.k;
  switch (f.tip) {
    case 'halka': { const cx = Math.cos(an), cy = Math.sin(an) * .34, ct = Math.cos(f.tilt), st = Math.sin(f.tilt); SN_YON.x = cx * ct - cy * st; SN_YON.y = cx * st + cy * ct; return; }
    case 'kalp': { const th = j / n * SN_PI2, s3 = Math.sin(th); SN_YON.x = 16 * s3 * s3 * s3 / 17; SN_YON.y = -(13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th)) / 17 - .1; return; }
    case 'yildiz': {   // beş köşeli yıldızın çevresi boyunca
      const u = j / n * 10, i0 = Math.floor(u), fr = u - i0, a0 = -Math.PI / 2 + i0 * Math.PI / 5, a1 = a0 + Math.PI / 5, r0 = i0 % 2 ? .42 : 1, r1 = i0 % 2 ? 1 : .42;
      SN_YON.x = lerp(Math.cos(a0) * r0, Math.cos(a1) * r1, fr); SN_YON.y = lerp(Math.sin(a0) * r0, Math.sin(a1) * r1, fr); return;
    }
    case 'palmiye': { const kol = j % 8, d = .35 + Math.floor(j / 8) / 5 * .7, a2 = kol / 8 * SN_PI2 + f.k; SN_YON.x = Math.cos(a2) * d; SN_YON.y = Math.sin(a2) * d * .9; return; }
    default: { const d = .86 + ((j * 7) % 5) * .035; SN_YON.x = Math.cos(an) * d; SN_YON.y = Math.sin(an) * d * .94; }
  }
}
function snFisekler(o, a) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const ys = typeof mdYildizSpr === 'function' ? mdYildizSpr() : null, gen = o.gen;
  for (let i = 0; i < o.fis.length; i++) {
    const f = o.fis[i], u = a - f.t; if (u < 0 || u > SN_FIS_YUK + f.om) continue;
    const bx = o.x + f.x * gen, by = o.y - f.h, c1 = SN_FIS_RENK[f.c1], c2 = SN_FIS_RENK[f.c2];
    if (u < SN_FIS_YUK) {   // yükseliş: kıvrılarak çıkan roket, arkasında sönen ışık izi
      const sx = o.x + f.lx * gen, sy = o.y - 30;
      for (let j = 5; j >= 0; j--) {
        const k = 1 - Math.pow(1 - clamp((u - j * .035) / SN_FIS_YUK, 0, 1), 2), x = lerp(sx, bx, k) + Math.sin(k * 7 + f.k) * 5 * (1 - k), y = lerp(sy, by, k);
        snIsik(j ? c1[0] : c1[1], x, y, j ? 7 - j : 9, j ? .55 * (1 - j / 6) : .9);
      }
      continue;
    }
    const v = (u - SN_FIS_YUK) / f.om, e = 1 - Math.pow(1 - v, 2.6), R = f.R * e * (o.rK * .35 + .65), sol = Math.pow(1 - v, 1.3), dus = v * v * f.g;
    const degis = f.tip === 'cift' ? smooth(clamp((v - .3) / .2, 0, 1)) : 0;
    if (v < .22) snIsik(c1[1], bx, by, 90 * (1 - v * 2), (1 - v / .22) * .42);   // patlama parlaması
    // izler: tek yol
    const iz = f.tip === 'altin' || f.tip === 'palmiye' ? .16 : .07, e2 = 1 - Math.pow(1 - Math.max(0, v - iz), 2.6), R2 = f.R * e2 * (o.rK * .35 + .65), d2 = Math.max(0, v - iz) ** 2 * f.g;
    g.globalAlpha = sol * (f.tip === 'altin' ? .7 : .45); g.strokeStyle = degis > .5 ? c2[0] : c1[0]; g.lineWidth = f.tip === 'palmiye' ? 3 : 1.8;
    g.beginPath();
    for (let j = 0; j < f.n; j++) { snFisYon(f, j); g.moveTo(bx + SN_YON.x * R2, by + SN_YON.y * R2 + d2); g.lineTo(bx + SN_YON.x * R, by + SN_YON.y * R + dus); }
    g.stroke(); g.globalAlpha = 1;
    const parla = v > .55 ? 1 : 0;   // sonlara doğru pırıl pırıl göz kırpar
    for (let j = 0; j < f.n; j++) {
      snFisYon(f, j);
      const x = bx + SN_YON.x * R, y = by + SN_YON.y * R + dus, tw = parla ? .45 + .55 * Math.abs(Math.sin(a * 17 + j * 2.3)) : 1;
      const col = degis > 0 ? (degis < 1 ? (j % 2 ? c1[0] : c2[0]) : c2[0]) : c1[0];
      snIsik(col, x, y, f.tip === 'kucuk' ? 11 : 17, sol * .9 * tw);
      if (ys && j % 2 === 0) { g.globalAlpha = sol * tw; const rr = f.tip === 'kucuk' ? 3.5 : 5; g.drawImage(ys, x - rr, y - rr, rr * 2, rr * 2); g.globalAlpha = 1; }
      if (f.tip === 'kasimpati' && v < .6 && j % 2) snIsik(c2[1], bx + SN_YON.x * R * .55, by + SN_YON.y * R * .5 + dus * .6, 5, sol * .55);
    }
  }
  g.restore();
}

// ── Dilek fenerleri: avludan bırakılan küçük kâğıt fenerler; sallanarak yavaşça gökyüzüne yükselir ──
function snFenerDilekSpr() {
  return snTuval('dilek', -9, -12, 18, 24, q => {
    const gr = q.createLinearGradient(0, -10, 0, 10); gr.addColorStop(0, '#ffe2b0'); gr.addColorStop(1, '#ff9f8a');
    q.fillStyle = gr; q.strokeStyle = 'rgba(150,80,90,.6)'; q.lineWidth = .8;
    q.beginPath(); q.moveTo(-6, -10); q.lineTo(6, -10); q.quadraticCurveTo(8.5, 2, 5, 9); q.lineTo(-5, 9); q.quadraticCurveTo(-8.5, 2, -6, -10); q.closePath(); q.fill(); q.stroke();
    q.fillStyle = 'rgba(255,255,240,.65)'; q.beginPath(); q.ellipse(0, 5, 3.4, 3, 0, 0, SN_PI2); q.fill();
    q.strokeStyle = 'rgba(150,80,90,.35)'; q.beginPath(); q.moveTo(0, -10); q.lineTo(0, 9); q.stroke();
  });
}
const SN_DILEK_RENK = ['#ffc76e', '#ffb3d1', '#ffd9a0'];
function snDilekler(o, tm, a) {
  const spr = snFenerDilekSpr();
  for (let i = 0; i < o.dilek.length; i++) {
    const d = o.dilek[i], u = a - d.t; if (u < 0) continue;
    const y = o.y - 40 - u * d.v - u * u * 1.2, x = o.x + d.x * o.gen + Math.sin(u * .8 + d.k) * 18; if (y < cam.y - 80) continue;
    const gir = smooth(clamp(u / .8, 0, 1)), tit = .85 + .15 * Math.sin(tm * 7 + d.k);
    g.globalCompositeOperation = 'lighter';
    if (u < .7) snIsik('#fff1c4', x, o.y - 40, 40, (1 - u / .7) * .5);   // bırakılış ışığı
    snIsik(SN_DILEK_RENK[d.c], x, y, 34, .35 * gir * tit);
    g.globalCompositeOperation = 'source-over';
    g.save(); g.translate(x, y); g.rotate(Math.sin(u * 1.3 + d.k) * .12); g.globalAlpha = gir; g.drawImage(spr, -9, -12, 18, 24); g.restore();
  }
}

// ── Gökkuşağı köprüsü (doruk): gökyüzünde soldan sağa kurulan ışık kemer; ön ucunda parlak yıldız ──
function snGokkusagi(o, tm, a) {
  if (a < SN_DORUK - .2) return;
  const u = a - SN_DORUK, ilerle = smooth(clamp(u / 2.2, 0, 1)), sn = a > 32 ? 1 - smooth(clamp((a - 32) / 2, 0, 1)) : 1;
  if (ilerle <= 0 || sn <= 0) return;
  const cx = o.x, cy = o.y + 20, rx = o.gen * 1.12 + 40, ry = 410;
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < SN_GOKKUSAGI.length; i++) {
    g.globalAlpha = (.26 + .05 * Math.sin(tm * 2 + i)) * sn; g.strokeStyle = SN_GOKKUSAGI[i]; g.lineWidth = 10;
    g.beginPath(); g.ellipse(cx, cy, rx - i * 10, ry - i * 10, 0, Math.PI, Math.PI + Math.PI * ilerle); g.stroke();
  }
  g.globalAlpha = 1;
  const an = Math.PI + Math.PI * ilerle, hx = cx + Math.cos(an) * (rx - 30), hy = cy + Math.sin(an) * (ry - 30);
  if (ilerle < 1) { snIsik('#ffffff', hx, hy, 50, .7 * sn); snIsik('#ffe9a6', hx, hy, 110, .35 * sn); }
  for (let k = 0; k < 12; k++) {   // kemer boyunca pırıltılar
    const f = (k + .5) / 12; if (f > ilerle) break;
    const b = Math.PI + Math.PI * f, n = .5 + .5 * Math.sin(tm * 4 + k * 1.9);
    snIsik(SN_GOKKUSAGI[k % 7], cx + Math.cos(b) * (rx - 30 + Math.sin(tm + k) * 20), cy + Math.sin(b) * (ry - 30), 10, .6 * n * sn);
  }
  g.restore();
}
// ── Işık tacı (doruk): direğin üstünde büyüyerek beliren, dönen ışınlı altın taç ──
function snTacSpr() {
  return snTuval('isikTac', -60, -50, 120, 70, q => {
    const gr = q.createLinearGradient(0, -40, 0, 14); gr.addColorStop(0, '#fff6c8'); gr.addColorStop(.5, '#ffd27a'); gr.addColorStop(1, '#f2a65e');
    q.fillStyle = gr; q.strokeStyle = '#b97a3a'; q.lineWidth = 2;
    q.beginPath(); q.moveTo(-46, 12); q.lineTo(-52, -26); q.lineTo(-28, -6); q.lineTo(-14, -38); q.lineTo(0, -10); q.lineTo(14, -38); q.lineTo(28, -6); q.lineTo(52, -26); q.lineTo(46, 12); q.quadraticCurveTo(0, 20, -46, 12); q.closePath(); q.fill(); q.stroke();
    q.fillStyle = '#ffeec0'; q.fillRect(-44, 2, 88, 6);
    const tas = [['#ff9fcf', -26], ['#9fd8ff', 0], ['#b9f0b4', 26]];
    for (const [c, x] of tas) { q.fillStyle = c; q.beginPath(); q.arc(x, 5, 4.5, 0, SN_PI2); q.fill(); q.fillStyle = 'rgba(255,255,255,.7)'; q.beginPath(); q.arc(x - 1.4, 3.6, 1.4, 0, SN_PI2); q.fill(); }
    for (const [x, y] of [[-52, -26], [-14, -38], [14, -38], [52, -26]]) { q.fillStyle = '#fff6d8'; q.beginPath(); q.arc(x, y, 4, 0, SN_PI2); q.fill(); }
    q.fillStyle = 'rgba(255,255,255,.4)'; q.beginPath(); q.moveTo(-40, 0); q.lineTo(-44, -18); q.lineTo(-32, -6); q.closePath(); q.fill();
  });
}
function snIsinSpr() {   // tacın arkasında dönen yumuşak ışınlar (bir kez; çizimde yalnız döndürülür)
  return snTuval('isin', -150, -150, 300, 300, q => {
    for (let i = 0; i < 12; i++) {
      const an = i / 12 * SN_PI2, gr = q.createLinearGradient(0, 0, Math.cos(an) * 150, Math.sin(an) * 150);
      gr.addColorStop(0, 'rgba(255,240,190,.55)'); gr.addColorStop(1, 'rgba(255,200,230,0)');
      q.fillStyle = gr; q.beginPath(); q.moveTo(0, 0); q.lineTo(Math.cos(an - .09) * 150, Math.sin(an - .09) * 150); q.lineTo(Math.cos(an + .09) * 150, Math.sin(an + .09) * 150); q.closePath(); q.fill();
    }
  });
}
function snTac(o, tm, a) {
  if (a < SN_DORUK + .3) return;
  const u = a - SN_DORUK - .3, gir = clamp(u / .9, 0, 1), olc = gir < 1 ? smooth(gir) * (1 + Math.sin(gir * Math.PI) * .25) : 1, sn = a > 32.5 ? 1 - smooth(clamp((a - 32.5) / 1.5, 0, 1)) : 1;
  if (olc <= 0 || sn <= 0) return;
  const nb = senlikNabiz(), x = o.x, y = o.y - 330 - smooth(gir) * 20 + Math.sin(tm * 1.4) * 5, k = olc * (1 + nb * .05);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.globalAlpha = .3 * sn; g.translate(x, y); g.rotate(tm * .25); g.scale(k, k); g.drawImage(snIsinSpr(), -150, -150, 300, 300);
  g.restore();
  g.globalCompositeOperation = 'lighter'; snIsik('#ffe9a6', x, y, 110 * k, .3 * sn); snIsik('#ffb3d1', x, y, 190 * k, .14 * sn); g.globalCompositeOperation = 'source-over';
  g.save(); g.globalAlpha = sn; g.translate(x, y); g.scale(k, k); snKoy(snTacSpr(), 0, 0); g.restore();
  g.globalCompositeOperation = 'lighter';
  const ys = mdYildizSpr();
  for (let i = 0; i < 6; i++) { const an = tm * .9 + i / 6 * SN_PI2, r = 8 * (.5 + .5 * Math.sin(tm * 5 + i)); g.globalAlpha = sn * .9; g.drawImage(ys, x + Math.cos(an) * 75 * k - r, y + Math.sin(an) * 30 * k - 6 - r, r * 2, r * 2); }
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}

// ── Konfeti + ışık yaprakları: ekranı kaplayan, döne döne süzülen yağmur (analitik; kamera çerçevesine sarılır) ──
const SN_KONF_N = 64, SN_YAP_N = 22;
function snKonfeti(o, tm, a) {
  const yog = smooth(clamp((a - 3) / 2.5, 0, 1)) * (a > 31 ? 1 - smooth(clamp((a - 31) / 3, 0, 1)) * .7 : 1) * (a > SN_DORUK && a < 31 ? 1 : .75);
  if (yog <= 0) return;
  const vw = VW, vh = VW * H / Math.max(1, W), x0 = cam.x, y0 = cam.y - 30, hh = vh + 60;
  for (let k = 0; k < SN_KONF_N; k++) {
    if (k / SN_KONF_N > yog) continue;
    const hz = 70 + (k * 37) % 50, y = y0 + ((a * hz + k * 97.3) % hh), x = x0 + (((k * .618 * vw + Math.sin(a * .9 + k) * 40 + a * 12) % vw) + vw) % vw;
    const dn = Math.cos(a * (4 + k % 5) + k), w = 7 * Math.abs(dn) + .8, h = 4.2;
    g.fillStyle = dn > 0 ? SN_KONF[k % 5] : mixc(SN_KONF[k % 5], '#ffffff', .35); g.fillRect(x - w / 2, y - h / 2, w, h);
  }
  g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < SN_YAP_N; k++) {
    const y = y0 + ((a * (32 + k % 7 * 4) + k * 151.7) % hh), x = x0 + (((k * .382 * vw + Math.sin(a * .6 + k * 2) * 60) % vw) + vw) % vw;
    snIsik(SN_ISIK[k % 5], x, y, 11, .5 * yog * (.6 + .4 * Math.sin(tm * 3 + k)));
  }
  g.globalCompositeOperation = 'source-over';
}

// ── Midilliler: final öncesi direğin dibinde uyurlar; kutlamada uyanıp (gerinip yelelerine ışık yayılarak) kurdeleli halka dansına girer.
// Dans cümlesi 4 ölçü (9,6 sn): 2 ölçü halka boyunca koşu (vuruşta sekerek), 1 ölçü sırayla zıplayıp havada dönme,
// 1 ölçü hep birlikte şahlanma; her cümlede yön değişir. Doruk anında hep birlikte şahlanıp zıplarlar.
// Elipsin önündekiler (sin > 0) Feza'nın önünde, arkadakiler direğin arkasında çizilir. Her midilli direğin tepesinden bir kurdele tutar.
const SN_DANS_T0 = 4.2, SN_DANS_CUMLE = SN_OLCU * 4, SN_DANS_W = .62;
function snDansAci(a) {   // dönüş açısı (analitik: koşu ölçülerinde sabit hız, diğerlerinde durur; cümle başına yön değişir)
  if (a <= SN_DANS_T0) return 0;
  const u = a - SN_DANS_T0, n = Math.floor(u / SN_DANS_CUMLE), r = u - n * SN_DANS_CUMLE, kos = SN_OLCU * 2;
  let th = 0; for (let i = 0; i < n; i++) th += (i % 2 ? -1 : 1) * kos * SN_DANS_W;
  return th + (n % 2 ? -1 : 1) * Math.min(r, kos) * SN_DANS_W;
}
function snDansCiz(o, tm, a, on) {
  if (typeof midilliCiz !== 'function') return;
  const uyan = o.basla ? smooth(clamp((a - 1) / 1.2, 0, 1)) : 0, don = o.basla ? smooth(clamp((a - 2.6) / 1.6, 0, 1)) : 0;
  const u = a - SN_DANS_T0, cn = u > 0 ? Math.floor(u / SN_DANS_CUMLE) : -1, r = u > 0 ? u - cn * SN_DANS_CUMLE : 0, yonC = cn % 2 ? -1 : 1;
  const kosuyor = u <= 0 ? (a > 2.6 ? 1 : 0) : r < SN_OLCU * 2 ? 1 : 0, th = snDansAci(a) + (u <= 0 ? Math.max(0, a - 2.6) * .3 : 0);
  const R = 250 * o.rK, Ry = 24, tx = o.x, ty = o.y - 230, doruk = a >= SN_DORUK && a < 31;
  for (let i = 0; i < o.dans.length; i++) {
    const d = o.dans[i], ph = d.faz + th * don;
    const sx = Math.cos(ph), sy = Math.sin(ph);
    // uykuda direk dibinde yan yana; dansta elips
    const ux = o.x + (i - 2) * 92 * o.rK, uy = o.y, dx = o.x + sx * R, dy = o.y + sy * Ry;
    const x = lerp(ux, dx, don), y = lerp(uy, dy, don), olc = .78 * (1 + sy * .08 * don);
    // Feza'nın hizasından geçen midilli onun arkasına çizilir (dans eden Feza hep görünsün)
    const onde = sy > 0 && Math.abs(x - P.x) > 95;
    if (onde !== on) continue;
    const opt = d.opt; let hop = 0, z = 0, saha = 0, kos = 0, yon;
    // hareket yönü (saat yönünün tersine/tersine) ve merkeze bakış
    const hareketYon = clamp(-sy * yonC * 3, -1, 1);
    if (don < .05) yon = i % 2 ? -1 : 1;
    else if (u <= 0) { yon = hareketYon; kos = .6 * don; }
    else if (doruk) {   // doruk: hep birlikte şahlan + zıpla, vuruşta
      const b = ((a - SN_DORUK) % (SN_VUR * 2)) / (SN_VUR * 2); saha = b < .5 ? Math.sin(b / .5 * Math.PI) : 0; hop = b >= .5 ? Math.sin((b - .5) / .5 * Math.PI) * 30 : 0; z = hop > 1 ? .8 : 0; yon = x < o.x ? 1 : -1;
    } else if (kosuyor) {   // halka boyunca koşu; her vuruşta küçük sekme
      const b = (r % SN_VUR) / SN_VUR; kos = .75; hop = Math.sin(b * Math.PI) * 9; yon = hareketYon;
    } else if (r < SN_OLCU * 3) {   // sırayla zıpla ve havada dön
      const b = r - SN_OLCU * 2, s0 = i * .32, f = clamp((b - s0) / .7, 0, 1);
      hop = Math.sin(f * Math.PI) * 46; z = hop > 2 ? clamp(hop / 25, 0, 1) : 0;
      const yon0 = clamp(-sy * yonC * 3, -1, 1) >= 0 ? 1 : -1; yon = f > 0 && f < 1 ? yon0 * Math.cos(f * SN_PI2) : yon0;
    } else {   // hep birlikte şahlanma (merkeze, direğe bakarak)
      const b = (r - SN_OLCU * 3) / SN_OLCU; saha = Math.sin(clamp(b / .8, 0, 1) * Math.PI); yon = x < o.x ? 1 : -1;
    }
    if (a > 31) { yon = x < o.x ? 1 : -1; kos = 0; hop = Math.abs(Math.sin((a - 31) * 2.6 + i)) * 8 * (1 - clamp((a - 31) / 3, 0, 1)); }
    if (Math.abs(yon) < .12) yon = yon < 0 ? -.12 : .12;
    opt.uyku = 1 - uyan; opt.parilti = uyan; opt.renk = d.renk; opt.yon = yon; opt.kos = kos; opt.zipla = Math.max(z, hop > 1 && kos === 0 ? clamp(hop / 20, 0, 1) : 0);
    opt.dalga = clamp((a - 1) / .9, 0, 1); opt.ger = o.basla ? mdBumpSn(a, 1.8, 2.6) : 0; opt.saha = saha; opt.kulak = o.basla && a < 1.6 ? mdBumpSn(a, .9, 1.6) : 0;
    // kurdele: direğin tepesinden midillinin ağzına (dansta görünür)
    if (don > .05) {
      const hx = x + yon * 40 * olc, hy = y - hop - 70 * olc, mx = (tx + hx) / 2 + Math.sin(tm * 3 + i) * 10, my = (ty + hy) / 2 + 30 + Math.sin(tm * 2.3 + i * 2) * 8;
      g.globalAlpha = don; g.strokeStyle = MD_RENK[d.renk].y1; g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(tx, ty + 4); g.quadraticCurveTo(mx, my, hx, hy); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.1; g.stroke(); g.globalAlpha = 1;
    }
    g.save(); g.globalAlpha = .2; g.fillStyle = '#2e2346'; g.beginPath(); g.ellipse(x, y, 30 * olc * (1 - Math.min(.5, hop / 90)), 4.5, 0, 0, SN_PI2); g.fill(); g.restore();
    midilliCiz(g, x, y - hop, olc, tm + i * 1.7, opt);
    if (saha > .85 || (hop > 40)) { g.globalCompositeOperation = 'lighter'; snIsik(MD_RENK[d.renk].i, x, y - hop - 40, 40, .25); g.globalCompositeOperation = 'source-over'; }
  }
}
// yerde: üç misafir pofuduk direğin iki yanında yerden çiçek patlamasıyla fırlar, sonra vuruşta zıplar (pofuduk.js'in kendi çizicisiyle)
function snMisafirYer(o, tm, a) {
  const l = snPofMisafir(o); if (!l) return;
  const k0 = a - 11.5, ys = mdYildizSpr();
  for (let i = 0; i < l.length; i++) {
    const k = k0 - i * .35; if (k <= 0) continue;
    const f = l[i], p = f.pf, gx = o.x + [-150, 150, -300][i] * o.rK + Math.sin(a * .7 + i) * 12;
    // giriş: yerden fırlayış (yaylı büyüme) + çiçek halkası
    const gir = clamp(k / .6, 0, 1), buy = gir < 1 ? smooth(gir) * (1 + Math.sin(gir * Math.PI) * .3) : 1;
    if (k < 1.2) {
      const e = k / 1.2; g.globalCompositeOperation = 'lighter';
      for (let j = 0; j < 8; j++) { const an = j / 8 * SN_PI2, rr = 14 + e * 60; snIsik(SN_ISIK[(j + i) % 5], gx + Math.cos(an) * rr, o.y - 20 + Math.sin(an) * rr * .5 - e * 10, 9, (1 - e) * .8); }
      g.globalAlpha = 1 - e; g.drawImage(ys, gx - 20, o.y - 50, 40, 40); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    const b = ((a - 11.5) % (SN_VUR * 2)) / (SN_VUR * 2), hop = gir >= 1 ? (b < .45 ? Math.sin(b / .45 * Math.PI) * (a > SN_DORUK && a < 31 ? 40 : 26) : 0) : Math.sin(gir * Math.PI) * 40;
    f.x = gx; f.y = o.y;
    p.jy = -hop; p.wy = 0; p.gy = 0; p.t = a + i; p.bloom = 1; p.goz = hop > 4 ? 'sik' : 'acik'; p.agiz = 'gulus'; p.agizB = .6;
    p.f = i % 2 ? -1 : 1; p.don = p.f; p.sq = hop > 1 ? -.06 : .08 * Math.sin(b * SN_PI2); p.olc = .9 * buy;
    g.save(); try { pfKucukCiz(f, tm); } catch (e) { o.pofMis = null; } g.restore();
  }
}
// havada: Anka ışık iziyle süzülerek gelir ve avlunun üstünde geniş halka çizer; iki denizatı baloncuklardan takla atarak çıkar;
// kuzucuklar bulutlarla (altlarında minik gökkuşağı) süzülür.
const SN_ANKA_OPT = { pose: 'glide', face: 1, joy: 1, alpha: 1 };
const SN_AP = { x: 0, y: 0 };
function snAnkaYer(o, k) {   // Anka'nın k anındaki yeri → SN_AP (iz için geçmiş anlar da hesaplanır)
  const gir = smooth(clamp(k / 3, 0, 1)), ph = k * .38, R = 300 * o.rK;
  SN_AP.x = o.x + Math.cos(ph) * R * gir + (1 - gir) * (o.gen + 420); SN_AP.y = o.y - 360 + Math.sin(ph * 2) * 40 - (1 - gir) * 140;
}
function snMisafirHava(o, tm, a) {
  if (typeof ANKA !== 'undefined' && ANKA && typeof ANKA.ciz === 'function' && a > 4) {
    const k = a - 4;
    g.globalCompositeOperation = 'lighter';   // ışık izi (geçmiş konumlar)
    for (let j = 8; j >= 1; j--) { const kk = k - j * .07; if (kk < 0) continue; snAnkaYer(o, kk); snIsik(j % 2 ? '#ffb08a' : '#ffd27a', SN_AP.x, SN_AP.y + 6, 16 - j, (1 - j / 9) * .55); }
    g.globalCompositeOperation = 'source-over';
    snAnkaYer(o, k);
    const opt = SN_ANKA_OPT, ph = k * .38; opt.face = -Math.sin(ph) >= 0 ? 1 : -1; opt.alpha = Math.min(1, k / .8);
    if (k < 3) opt.face = -1;
    try { ANKA.ciz(g, SN_AP.x, SN_AP.y, .34, tm, opt); } catch (e) {}
  }
  if (typeof dnzAtCiz === 'function' && typeof dnzPal !== 'undefined' && a > 6.6) {
    for (let i = 0; i < 2; i++) {
      const k = a - 7 - i * .8, sd = i ? 1 : -1, x = o.x + sd * (190 * o.rK + Math.sin(Math.max(0, k) * .6 + i) * 30);
      if (k < 0) {   // gelişten hemen önce yerden yükselen kabarcıklar
        if (k > -.6) for (let j = 0; j < 4; j++) { const f = clamp((k + .6) / .6 - j * .15, 0, 1); g.globalAlpha = (1 - f) * .8; g.strokeStyle = 'rgba(220,250,255,.9)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x + (j - 1.5) * 8, o.y - 10 - f * 120, 3 + j, 0, SN_PI2); g.stroke(); }
        g.globalAlpha = 1; continue;
      }
      const gir = smooth(clamp(k / 2.2, 0, 1)), y = o.y - 150 - i * 40 + Math.sin(k * 1.3 + i) * 14 + (1 - gir) * 120;
      const takla = k < 1.4 ? smooth(k / 1.4) * SN_PI2 : 0;
      g.save(); g.globalAlpha = gir;
      // ışık baloncuğu + çevresinde yükselen minik kabarcıklar
      g.globalCompositeOperation = 'lighter'; snIsik('#bdf3ff', x, y + 6, 46, .22); g.globalCompositeOperation = 'source-over';
      g.strokeStyle = 'rgba(220,250,255,.65)'; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y + 6, 34, 0, SN_PI2); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(x - 14, y - 12, 5, 8, .6, 0, SN_PI2); g.fill();
      g.strokeStyle = 'rgba(220,250,255,.6)'; g.lineWidth = 1;
      for (let j = 0; j < 3; j++) { const f = (k * .5 + j / 3) % 1; g.globalAlpha = gir * (1 - f); g.beginPath(); g.arc(x + Math.sin(f * 6 + j) * 30, y - 20 - f * 50, 2 + j, 0, SN_PI2); g.stroke(); }
      g.globalAlpha = gir;
      try { g.save(); g.translate(x, y); if (takla) g.rotate(takla * -sd); g.scale(-sd, 1); dnzAtCiz(g, 0, -6, .3, tm, dnzPal[i * 2 % dnzPal.length], true, i * .8, null); g.restore(); } catch (e) {}
      g.restore();
    }
  }
  // Bulut Ülkesi'nin kuzucukları: iki küçük bulutun üstünde süzülerek gelir, altlarında minik gökkuşağı; vuruşta bulutta hoplar
  if (typeof shKuzu === 'function' && typeof shBulutSprite === 'function' && a > 9.5) {
    for (let i = 0; i < 2; i++) {
      const k = a - 9.5 - i * 1.2; if (k <= 0) continue;
      const gir = smooth(clamp(k / 2.5, 0, 1)), sd = i ? 1 : -1, b = (a % (SN_VUR * 2)) / (SN_VUR * 2), hop = gir >= 1 && b < .4 ? Math.sin(b / .4 * Math.PI) * 6 : 0;
      const x = o.x + sd * (300 * o.rK + (1 - gir) * 260) + Math.sin(k * .5 + i) * 16, y = o.y - 255 - i * 30 + Math.sin(k * 1.1 + i * 2) * 10;
      // gelişte bulutun altında beliren minik gökkuşağı
      const gk = k < 4 ? Math.sin(clamp(k / 4, 0, 1) * Math.PI) : 0;
      if (gk > .02) { g.save(); g.globalCompositeOperation = 'lighter'; g.lineWidth = 4; for (let j = 0; j < 5; j++) { g.globalAlpha = gk * .45; g.strokeStyle = SN_GOKKUSAGI[j + 1]; g.beginPath(); g.arc(x - sd * 40, y + 40, 46 - j * 4.5, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); } g.restore(); }
      g.save(); g.globalAlpha = gir;
      g.drawImage(shBulutSprite('beyaz'), x - 52, y - 8, 104, 52);
      try { shKuzu(g, x, y + 2 - hop, 30, -sd, ((tm + i * 1.3) % 3.4) < 0.15); } catch (e) {}
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

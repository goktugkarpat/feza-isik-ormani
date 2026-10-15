/* bolum4.js – İnci Denizi. Üç sakin etkinlik: denizatları, ahtapot, vatoz yolculuğu.
   Aynı bölüm sözleşmesi; açık yüzme koridorunda katı engel yok. */
'use strict';
const ROWS = 30, COLS = 540;
const grid = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
const ground = (a,b,h) => { for(let c=a;c<=b;c++) for(let r=ROWS-h;r<ROWS;r++) grid[r][c]=1; };
const plat = (a,b,r) => { for(let c=a;c<=b;c++) grid[r][c]=2; };
const topOf = c => { c=Math.floor(c); if(c<0||c>=COLS)return ROWS; for(let r=0;r<ROWS;r++)if(grid[r][c]===1)return r;return ROWS; };
const cell = (c,r) => c<0||c>=COLS ? 1 : r<0||r>=ROWS ? 0 : grid[r][c];
const yuzey = c => topOf(c)*T;
const nx = c => c*T+T/2;
function nesne(tip,c,y,o={}) { const n=Object.assign({tip,x:nx(c),y,id:tip+NESNELER.length},o);NESNELER.push(n);return n; }
for(const [a,b,h] of [[0,44,5],[45,83,4],[84,122,5],[123,165,4],[166,203,5],[204,239,4],[240,289,5],[290,337,4],[338,361,5],[362,445,4],[446,475,5],[476,539,6]])ground(a,b,h);
const BOLUM = {
 ad:'İnci Denizi',baslangic:{x:nx(6),y:650},
 bolgeler:[{ad:'sedef',x0:0,x1:55*T},{ad:'cayir',x0:55*T,x1:240*T},{ad:'ahtapot',x0:240*T,x1:290*T},{ad:'mercan',x0:290*T,x1:355*T},{ad:'vatoz',x0:355*T,x1:445*T},{ad:'inci',x0:445*T,x1:COLS*T}],
 gol:null,gollar:[],deniz:{yUst:160,yAlt:900,ahtapotX:nx(278),vatozX:nx(355)},
 vatoz:{x0:nx(355),x1:nx(445),yUst:260,yAlt:760},
 kamera:[{x0:0,x1:50*T,zoom:.88},{x0:240*T,x1:290*T,zoom:.85},{x0:355*T,x1:445*T,zoom:.86},{x0:475*T,x1:COLS*T,zoom:.85}],
};
P.x=P.safeX=BOLUM.baslangic.x;P.y=P.safeY=BOLUM.baslangic.y;D.x=P.x-65;D.y=P.y-80;
for(const [c,y] of [[22,615],[70,510],[121,690],[173,545],[223,650]])nesne('denizati',c,y,{sira:NESNELER.filter(n=>n.tip==='denizati').length});
nesne('ahtapot',265,700,{gateX:nx(278)});
nesne('vatozKapisi',355,620,{x1:BOLUM.vatoz.x1,yUst:260,yAlt:760});
nesne('buyukInci',500,700,{r:90});
for(const [c,y] of [[26,590],[83,450],[125,650],[173,420],[234,570],[316,510],[463,550],[486,430]])nesne('tohum',c,y,{r:46});
// Hızlı iten ışıklı su akıntıları (Current Streams) – Etkinlik aralarındaki açık koridorlar
TUR.kaydet('suAkinti', {
  kur(o) {
    o.w = o.w || 780;
    o.h = o.h || 160;
    o.vx = o.vx || 270;
    o.ic = false;
    o.sesT = -9;
    o.ph = (o.x * 0.02) % 6.28;
    const rs = rng(Math.floor(o.x) + 47);
    o.tz = [];
    const isGold = !!o.gold || o.x > 14000;
    for (let i = 0; i < 14; i++) {
      o.tz.push({
        u: rs(),
        yOff: (rs() - 0.5) * 0.72,
        sp: 0.5 + rs() * 0.65,
        r: 1.2 + rs() * 2.2,
        ph: rs() * 6.28,
        col: isGold ? (i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#ffe294' : '#f5e8d0') : (i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? '#7ef3e6' : '#d2fdf7')
      });
    }
  },
  guncelle(o, dt) {
    if (o.tz) {
      const spd = o.ic ? 1.5 : 0.8;
      for (let i = 0; i < o.tz.length; i++) {
        const p = o.tz[i];
        p.u = (p.u + dt * p.sp * spd) % 1;
      }
    }
    if (o.ic && now - o.sesT > 1.2) {
      o.sesT = now;
      if (typeof omSfx === 'function') omSfx('jump');
      const isGold = !!o.gold || o.x > 14000;
      burst(P.x, P.y - 20, 6, isGold ? ['#ffe89c', '#fff6d6', '#ffffff'] : ['#7ef3e6', '#c4faf3', '#ffffff'], 45, 0.7, 3.5);
    }
  },
  ciz(o, tm) {
    const w = o.w, h = o.h;
    const x0 = o.x - w * 0.5, x1 = o.x + w * 0.5;
    if (x1 < cam.x - 120 || x0 > cam.x + VW + 120) return;
    const isGold = !!o.gold || o.x > 14000;
    g.save();
    g.globalCompositeOperation = 'lighter';
    const br = 0.85 + 0.15 * Math.sin(tm * 2.2 + o.ph) + (o.ic ? 0.35 : 0);
    // 1) Akıntı koridoru zemin hâlesi
    const haloCol = isGold ? (o.ic ? '#ffe294' : '#e6be60') : (o.ic ? '#7ef3e6' : '#3ec8be');
    dglow(haloCol, o.x, o.y, Math.min(w * 0.32, 280), (o.ic ? 0.14 : 0.07) * br);
    // 2) Akıntı gövdesi (yumuşak su tüneli gradyanı)
    const grad = g.createLinearGradient(0, o.y - h * 0.5, 0, o.y + h * 0.5);
    if (isGold) {
      grad.addColorStop(0, 'rgba(255, 220, 140, 0)');
      grad.addColorStop(0.2, `rgba(255, 230, 160, ${(0.11 * br).toFixed(3)})`);
      grad.addColorStop(0.5, `rgba(255, 248, 220, ${(0.22 * br).toFixed(3)})`);
      grad.addColorStop(0.8, `rgba(255, 230, 160, ${(0.11 * br).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(255, 220, 140, 0)');
    } else {
      grad.addColorStop(0, 'rgba(64, 210, 200, 0)');
      grad.addColorStop(0.2, `rgba(78, 228, 216, ${(0.11 * br).toFixed(3)})`);
      grad.addColorStop(0.5, `rgba(164, 250, 242, ${(0.22 * br).toFixed(3)})`);
      grad.addColorStop(0.8, `rgba(78, 228, 216, ${(0.11 * br).toFixed(3)})`);
      grad.addColorStop(1, 'rgba(64, 210, 200, 0)');
    }
    g.fillStyle = grad;
    g.beginPath();
    if (typeof g.roundRect === 'function') g.roundRect(x0, o.y - h * 0.5, w, h, 28);
    else g.rect(x0, o.y - h * 0.5, w, h);
    g.fill();
    // 3) Akıntı çizgileri (dalgalanan su iplikçikleri)
    const lines = [-0.34, -0.12, 0.08, 0.3];
    g.lineWidth = 1.8;
    for (let j = 0; j < lines.length; j++) {
      const ly = o.y + lines[j] * h;
      const lph = tm * 3.6 + j * 1.5 + o.ph;
      const lineCol = isGold
        ? (j === 2 ? `rgba(255, 250, 220, ${(0.55 * br).toFixed(3)})` : `rgba(255, 225, 150, ${(0.35 * br).toFixed(3)})`)
        : (j === 2 ? `rgba(230, 255, 252, ${(0.52 * br).toFixed(3)})` : `rgba(120, 240, 230, ${(0.32 * br).toFixed(3)})`);
      g.strokeStyle = lineCol;
      g.beginPath();
      const step = 40;
      for (let px = x0; px <= x1; px += step) {
        const u = (px - x0) / w;
        const fade = Math.sin(u * Math.PI);
        const wave = Math.sin(px * 0.015 - lph) * 8.5 * fade;
        if (px === x0) g.moveTo(px, ly + wave);
        else g.lineTo(px, ly + wave);
      }
      g.stroke();
    }
    // 4) Hızlı akan su okları (chevrons)
    const chDist = 170;
    const nCh = Math.max(2, Math.floor(w / chDist));
    g.lineWidth = 2.4;
    g.lineCap = 'round';
    for (let k = 0; k < nCh; k++) {
      const cu = ((tm * 0.62 + k / nCh) % 1);
      const cx = x0 + cu * w;
      const fade = Math.sin(cu * Math.PI);
      if (fade > 0.04) {
        g.strokeStyle = isGold ? `rgba(255, 245, 210, ${(0.44 * fade * br).toFixed(3)})` : `rgba(200, 255, 248, ${(0.42 * fade * br).toFixed(3)})`;
        g.beginPath();
        g.moveTo(cx - 15, o.y - 17);
        g.lineTo(cx, o.y);
        g.lineTo(cx - 15, o.y + 17);
        g.stroke();
      }
    }
    // 5) Süzülen ışık kabarcıkları
    if (o.tz) {
      for (let i = 0; i < o.tz.length; i++) {
        const p = o.tz[i];
        const px = x0 + p.u * w;
        const fade = Math.sin(p.u * Math.PI);
        const py = o.y + p.yOff * h + Math.sin(tm * 3 + p.ph) * 6;
        const r = p.r * (0.8 + 0.35 * Math.sin(tm * 3.5 + p.ph));
        g.fillStyle = p.col;
        g.globalAlpha = 0.65 * fade * br;
        g.beginPath();
        g.arc(px, py, r, 0, 6.283);
        g.fill();
        if (p.r > 2) dglow(p.col, px, py, r * 2.8, 0.22 * fade);
      }
    }
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.restore();
  }
});

// 3 adet manzaralı ve isteğe bağlı girilebilir akıntı koridoru (çocuk isterse üstünden yüzüp keşfedebilir)
nesne('suAkinti', 150, 620, { w: 780, h: 160, vx: 260 }); // 1. Akıntı: Denizatlarından ahtapot resifine geçiş
nesne('suAkinti', 315, 560, { w: 780, h: 160, vx: 270 }); // 2. Akıntı: Mercan kanyonundan vatoz kapısına geçiş
nesne('suAkinti', 475, 580, { w: 820, h: 170, vx: 280, gold: true }); // 3. Akıntı: İnci tapınağına doğru süzülen altın-sedef akıntı

// Büyülü deniz süslemeleri: ışıldayan anemonlar, sedef kabuklar, yüzen narin minik deniz anaları ve parıltılı balıklar
for (const c of [
  14, 28, 48, 64, 76, 92, 108, 118, 134, 155, 168, 188, 205, 218, 232,
  245, 252, 258, 274, 282, 288, 295, 308, 322, 336, 350, 365, 385, 405, 425, 440,
  452, 465, 478, 490, 496, 505, 515, 528
]) nesne('denizSus', c, yuzey(c) - 10, { tur: 'isikliAnemon', sira: c % 5 });

for (const c of [
  10, 18, 33, 46, 58, 68, 86, 102, 128, 145, 162, 178, 195, 212, 226, 238,
  242, 249, 276, 285, 292, 302, 318, 332, 346, 372, 392, 415, 435,
  455, 468, 477, 488, 502, 512, 524, 535
]) nesne('denizSus', c, yuzey(c) - 12, { tur: 'sedefKabuk', sira: c % 3 });

for (const [c, y] of [
  [12, 480], [28, 410], [45, 360],
  [65, 370], [88, 330], [112, 440], [135, 350], [158, 410], [182, 330], [208, 430], [230, 360],
  [248, 390], [272, 330], [286, 420],
  [300, 370], [320, 330], [342, 410],
  [368, 320], [390, 360], [415, 310], [438, 370],
  [456, 380], [480, 320], [494, 290], [508, 310], [526, 360]
]) nesne('denizSus', c, y, { tur: 'isikliJelly', sira: c % 5 });

for (const [c, y] of [
  [20, 520], [40, 690], [78, 460], [105, 530], [125, 440], [148, 500],
  [175, 470], [202, 530], [236, 480], [260, 520], [284, 460],
  [307, 580], [335, 470], [375, 510], [410, 470], [442, 520],
  [463, 480], [492, 440], [518, 470]
]) nesne('denizSus', c, y, { tur: 'balik', sira: c % 5 });
const FLOWERS=[];
const TREE=null;

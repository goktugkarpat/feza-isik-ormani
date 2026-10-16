/* dunya6.js — Şenlik Kalesi: alacakaranlıkta mor-lacivert gök, yıldızlar ve ışık tozu, bulutların arasında hafifçe parlayan
   rüya kalesi, katmanlı masal kasabası (yuvarlak çatılar, altın pencereler), taş kaldırım, tezgâhlar, fıçılar, fener dizileri.
   Fenerler yandıkça (V6.fener) kasaba renklenir, pencereler altın ışıkla dolar; finalde gök sabaha döner.
   Mimari dunya5.js ile aynı: büyük resimler yalnız önbellek tuvallerinde bir kez boyanır (gök, kasaba şeritleri, kale, zemin
   parçaları); karede yeni gradyan/filtre/gölge yok, ışıklar önceden ısıtılan glow() sprite'larıyla çizilir.
   oyun.js kancaları (omDr 'dn6' öneki): dn6Background dn6Motes dn6World dn6Petals dn6Foreground dn6Vignette, ısıtma dn6Isit. */
'use strict';
const DN6={sky:null,dawn:null,vig:null,strips:[],castle:null,clouds:[],bushes:[],bulbs:new Map(),chunks:new Map(),prep:0,
 finT:null,kopruT:null,lit:[],houses:[],wins:[],garlands:[],warm:false,renk:0,sabah:0};
const DN6_PAL=['#b78ad0','#e49ab8','#8fb3e0','#e8b98a','#93cdb5','#d9a0e0','#f2c58f'];   // masal evlerinin pastel renkleri
const DN6_FLAG=['#ff8fb8','#ffd36e','#8fe0d0','#b79cff','#ff9e7a','#9fd3ff'];               // bayrak ve fener kâğıdı renkleri
const DN6_GLOWS=['#ffd27a','#ffb98a','#ffe6a8','#ff9fc8','#c9a8ff','#9fe8ff','#fff2cc','#ffc890','#b8f0d8','#ffdca0'];
const DN6_GAP0=267*T,DN6_GAP1=390*T;    // bulut denizi (midilli yolculuğu) — zemin yok
const dn6Cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const dn6Mix=(a,b,t)=>{const A=hex(a),B=hex(b);return '#'+[0,1,2].map(i=>Math.round(lerp(A[i],B[i],t)).toString(16).padStart(2,'0')).join('');};
function dn6Ready(){return W>0&&H>0&&S>0&&typeof cam!=='undefined'&&Number.isFinite(cam.x)&&Number.isFinite(cam.y);}
function dn6Glow(col,x,y,rx,ry,a){if(a<=.003)return;g.globalAlpha=a>1?1:a;g.drawImage(glow(col),x-rx,y-ry,rx*2,ry*2);g.globalAlpha=1;}
function dn6Surface(x){const c=Math.max(0,Math.min(COLS-1,Math.floor(x/T)));return topOf(c)*T;}

// ── Işık durumu: yanan fenerlerin ışık dalgası kasabaya yayılır ve kalır; final hepsini doldurur, gök sabaha döner. ──
OLAY.on('fener',e=>{
 let x=e&&e.o&&Number.isFinite(e.o.x)?e.o.x:e&&Number.isFinite(e.x)?e.x:NaN;
 if(!Number.isFinite(x)){   // olay konum taşımıyorsa: Feza'ya en yakın fener
  let best=null,bd=1e9;for(const o of NESNELER)if(o.tip==='fener'){const d=Math.abs(o.x-P.x);if(d<bd){bd=d;best=o;}}x=best?best.x:P.x;}
 if(DN6.lit.length<40)DN6.lit.push({x,t:now});
});
OLAY.on('senlikFinal',()=>{if(DN6.finT===null)DN6.finT=now;});
OLAY.on('kopruIndi',()=>{if(DN6.kopruT===null)DN6.kopruT=now;});
function dn6Durum(){
 // renk: kasabanın renklenmesi (0 gri-mor uyku → 1 şenlik); sabah: göğün sabaha dönüşü (yalnız final)
 const top=typeof V6!=='undefined'&&V6.fenerTop?V6.fenerTop:12,f=typeof V6!=='undefined'?clamp((V6.fener||0)/top,0,1):0;
 const fin=DN6.finT===null?0:smooth(clamp((now-DN6.finT)/5,0,1));
 const hedef=Math.max(smooth(f)*.8,fin);DN6.renk+=(hedef-DN6.renk)*.04;if(Math.abs(hedef-DN6.renk)<.002)DN6.renk=hedef;
 DN6.sabah=DN6.finT===null?f*.12:Math.max(f*.12,smooth(clamp((now-DN6.finT-3)/16,0,1)));
}
function dn6Isik(x){
 // yerel ışık 0..1: her yanan fenerden saniyede 520 birim yayılan, 1300 birimde duran yumuşak dalga
 let a=DN6.renk*.3;
 for(let i=0;i<DN6.lit.length;i++){const L=DN6.lit[i],age=now-L.t;if(age<0)continue;const reach=Math.min(age*520,1300),v=clamp((reach-Math.abs(x-L.x))/260,0,1);if(v>a)a=v;}
 if(DN6.finT!==null)a=Math.max(a,smooth(clamp((now-DN6.finT)/3,0,1)));
 return a;
}

// ── Gök: alacakaranlık (mor-lacivert) ve sabah, iki önbellek tuvali arasında geçiş ──
function dn6Sky(){
 if(DN6.sky)return;const R=rng(6061);
 let cv=DN6.sky=dn6Cv(768,600),c=cv.getContext('2d'),gr=c.createLinearGradient(0,0,0,600);
 gr.addColorStop(0,'#16163d');gr.addColorStop(.3,'#2d2766');gr.addColorStop(.55,'#55418a');gr.addColorStop(.78,'#9a5f9e');gr.addColorStop(1,'#d88a9e');c.fillStyle=gr;c.fillRect(0,0,768,600);
 const h=c.createRadialGradient(560,470,10,560,470,420);h.addColorStop(0,'rgba(255,196,170,.22)');h.addColorStop(.4,'rgba(214,140,190,.1)');h.addColorStop(1,'rgba(214,140,190,0)');c.fillStyle=h;c.fillRect(0,0,768,600);
 // ince suluboya bulut fırçaları ve kâğıt dokusu
 for(let j=0;j<26;j++){const y=150+R()*300,x=R()*768,w=90+R()*240,hh=3+R()*9;c.fillStyle=j%3?'rgba(255,214,236,.05)':'rgba(70,60,130,.07)';c.beginPath();c.ellipse(x,y,w,hh,-.02,0,6.283);c.fill();}
 for(let j=0;j<9000;j++){c.fillStyle=j%2?'rgba(255,236,250,.02)':'rgba(20,18,60,.02)';c.fillRect(R()*768,R()*600,.8+R(),.6+R());}
 // sabit yıldızlar (göğün üst yarısı); ışıldayanlar karede ayrıca çizilir
 for(let j=0;j<120;j++){const x=R()*768,y=R()*R()*330,s=.35+R()*.8;c.fillStyle='rgba(255,246,226,'+(.2+R()*.5)+')';c.beginPath();c.arc(x,y,s,0,6.283);c.fill();}
 // hilal ay: yumuşak hâle, kesik daire
 const mx=150,my=92;const mh=c.createRadialGradient(mx,my,4,mx,my,70);mh.addColorStop(0,'rgba(255,240,210,.35)');mh.addColorStop(1,'rgba(255,240,210,0)');c.fillStyle=mh;c.fillRect(mx-70,my-70,140,140);
 c.fillStyle='#fff1d2';c.beginPath();c.arc(mx,my,17,0,6.283);c.fill();c.fillStyle='#2b2663';c.beginPath();c.arc(mx+8,my-5,15,0,6.283);c.fill();
 // sabah göğü: şeftali, pembe, altın; aynı fırça dokusu
 cv=DN6.dawn=dn6Cv(768,600);c=cv.getContext('2d');gr=c.createLinearGradient(0,0,0,600);
 gr.addColorStop(0,'#6f7fd0');gr.addColorStop(.35,'#b79ad8');gr.addColorStop(.62,'#f3a9c0');gr.addColorStop(.82,'#ffcfa0');gr.addColorStop(1,'#fff0c4');c.fillStyle=gr;c.fillRect(0,0,768,600);
 const s=c.createRadialGradient(540,520,10,540,520,380);s.addColorStop(0,'rgba(255,248,214,.75)');s.addColorStop(.3,'rgba(255,224,170,.3)');s.addColorStop(1,'rgba(255,224,170,0)');c.fillStyle=s;c.fillRect(0,0,768,600);
 for(let j=0;j<22;j++){const y=170+R()*300,x=R()*768,w=90+R()*220,hh=4+R()*9;c.fillStyle=j%2?'rgba(255,255,255,.16)':'rgba(255,214,230,.14)';c.beginPath();c.ellipse(x,y,w,hh,-.02,0,6.283);c.fill();}
 for(let j=0;j<6000;j++){c.fillStyle=j%2?'rgba(255,255,255,.03)':'rgba(120,90,140,.02)';c.fillRect(R()*768,R()*600,.8,.7);}
 DN6.vig=dn6Cv(200,160);const v=DN6.vig.getContext('2d'),vg=v.createRadialGradient(100,72,46,100,72,124);vg.addColorStop(0,'rgba(22,18,60,0)');vg.addColorStop(.62,'rgba(22,18,60,.02)');vg.addColorStop(1,'rgba(22,18,60,.34)');v.fillStyle=vg;v.fillRect(0,0,200,160);
}
const dn6SR=rng(7717),DN6_STARS=Array.from({length:34},()=>({x:dn6SR(),y:dn6SR()*dn6SR()*.5,r:.6+dn6SR()*1.2,ph:dn6SR()*6.283,sp:.6+dn6SR()*1.4}));

// ── Masal evi çizimi (önbellek tuvallerinde): duvar, yarım kereste, yuvarlak çatı, kemerli pencereler, saksılar ──
function dn6Roof(c,x,y,w,h,col,kind){
 const gr=c.createLinearGradient(x,y-h,x+w*.3,y);gr.addColorStop(0,dn6Mix(col,'#ffffff',.25));gr.addColorStop(.6,col);gr.addColorStop(1,dn6Mix(col,'#251c46',.45));c.fillStyle=gr;c.beginPath();
 if(kind===0){c.moveTo(x-6,y);c.bezierCurveTo(x-2,y-h*.7,x+w*.2,y-h,x+w*.5,y-h);c.bezierCurveTo(x+w*.8,y-h,x+w+2,y-h*.7,x+w+6,y);}            // kubbe
 else if(kind===1){c.moveTo(x-8,y);c.quadraticCurveTo(x+w*.15,y-h*.35,x+w*.42,y-h*.9);c.quadraticCurveTo(x+w*.5,y-h*1.12,x+w*.58,y-h*.9);c.quadraticCurveTo(x+w*.85,y-h*.35,x+w+8,y);}   // yumuşak külah
 else{c.moveTo(x-6,y);c.bezierCurveTo(x-6,y-h*.55,x+w*.1,y-h*.75,x+w*.5,y-h*.8);c.bezierCurveTo(x+w*.9,y-h*.75,x+w+6,y-h*.55,x+w+6,y);}       // yastık çatı
 c.closePath();c.fill();
 // kiremit sıraları: kıvrımlı ince çizgiler
 c.save();c.clip();c.strokeStyle='rgba(40,24,70,.22)';c.lineWidth=1;for(let yy=y-h;yy<y;yy+=7){c.beginPath();for(let xx=x-8;xx<x+w+8;xx+=10){c.moveTo(xx,yy);c.quadraticCurveTo(xx+5,yy+5,xx+10,yy);}c.stroke();}c.restore();
 c.strokeStyle='rgba(255,230,240,.35)';c.lineWidth=1.2;c.beginPath();c.moveTo(x-4,y-1);c.lineTo(x+w+4,y-1);c.stroke();
 if(kind===1){c.fillStyle='#ffd98a';c.beginPath();c.arc(x+w*.5,y-h*1.08,3,0,6.283);c.fill();}
}
function dn6Window(c,x,y,w,h,lit){
 // kemerli pencere: dim = mor cam, lit = altın cam (önbellekte iki ayrı sürüm)
 c.fillStyle='#f0e2cc';c.beginPath();c.moveTo(x-w/2-2,y+h/2+2);c.lineTo(x-w/2-2,y-h/2+w/2);c.arc(x,y-h/2+w/2,w/2+2,Math.PI,0);c.lineTo(x+w/2+2,y+h/2+2);c.closePath();c.fill();
 c.fillStyle=lit?'#ffd986':'#3e3570';c.beginPath();c.moveTo(x-w/2,y+h/2);c.lineTo(x-w/2,y-h/2+w/2);c.arc(x,y-h/2+w/2,w/2,Math.PI,0);c.lineTo(x+w/2,y+h/2);c.closePath();c.fill();
 if(lit){c.fillStyle='rgba(255,250,220,.75)';c.fillRect(x-w/2+2,y-h/2+w/2,w*.3,h*.5);}
 else{c.fillStyle='rgba(255,210,150,.16)';c.fillRect(x-w/2,y+h*.1,w,h*.4);}
 c.strokeStyle='#cdb8a6';c.lineWidth=1.3;c.beginPath();c.moveTo(x,y-h/2+2);c.lineTo(x,y+h/2);c.moveTo(x-w/2,y+h*.08);c.lineTo(x+w/2,y+h*.08);c.stroke();
 c.fillStyle='#8a5a6e';c.fillRect(x-w/2-3,y+h/2+2,w+6,5);   // saksı kutusu
 const F=['#ff8fb8','#ffd36e','#b79cff','#8fe0d0'];for(let j=0;j<4;j++){c.fillStyle=F[(j+Math.round(x))%4];c.beginPath();c.arc(x-w/2+j*(w/3),y+h/2+1,2.4,0,6.283);c.fill();}
}
function dn6HouseShape(c,R,x,base,w,h,col,lit,dusk){
 // tek ev (kasaba şeritleri için): duvar + çatı + pencereler + baca. dusk: renk soldurma (uyuyan kasaba)
 const wall=dn6Mix(col,'#3a2f63',dusk),dark=dn6Mix(wall,'#1c1638',.4),rh=h*(.38+R()*.25),kind=Math.floor(R()*3);
 const gr=c.createLinearGradient(x,base-h,x+w,base);gr.addColorStop(0,dn6Mix(wall,'#ffffff',.12));gr.addColorStop(.7,wall);gr.addColorStop(1,dark);c.fillStyle=gr;
 c.beginPath();c.moveTo(x,base);c.lineTo(x,base-h+4);c.quadraticCurveTo(x,base-h,x+4,base-h);c.lineTo(x+w-4,base-h);c.quadraticCurveTo(x+w,base-h,x+w,base-h+4);c.lineTo(x+w,base);c.closePath();c.fill();
 // yarım kereste kirişleri
 c.strokeStyle=dn6Mix('#6b4a6a','#2a2048',dusk*.6);c.lineWidth=2.4;c.beginPath();for(let yy=base-h+h*.35;yy<base-10;yy+=h*.33){c.moveTo(x,yy);c.lineTo(x+w,yy);}c.moveTo(x+2,base-h);c.lineTo(x+2,base);c.moveTo(x+w-2,base-h);c.lineTo(x+w-2,base);c.stroke();
 if(R()<.6){c.lineWidth=1.6;c.beginPath();c.moveTo(x+4,base-h+h*.35);c.lineTo(x+w*.3,base-h+4);c.moveTo(x+w-4,base-h+h*.35);c.lineTo(x+w*.7,base-h+4);c.stroke();}
 if(R()<.7){const bx=x+w*(.2+R()*.6);c.fillStyle=dn6Mix('#9a6a7a','#30264f',dusk*.7);c.fillRect(bx-5,base-h-rh*.8,10,rh*.6);c.fillStyle=dn6Mix('#c79aa0','#30264f',dusk*.7);c.fillRect(bx-7,base-h-rh*.85,14,4);}
 dn6Roof(c,x,base-h+2,w,rh,dn6Mix(DN6_PAL[(Math.floor(R()*7)+3)%7],'#3a2f63',dusk),kind);
 const cols=Math.max(1,Math.floor(w/34)),rows=Math.max(1,Math.floor((h-30)/44));
 for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const wx=x+(k+.5)*w/cols,wy=base-h+30+r*44;if(wy>base-26)continue;dn6Window(c,wx,wy,12,18,lit&&R()<.9);}
 // kapı
 c.fillStyle=dn6Mix('#7a4e5e','#2a2048',dusk*.6);const dx=x+w*(.3+R()*.4);c.beginPath();c.moveTo(dx-9,base);c.lineTo(dx-9,base-20);c.arc(dx,base-20,9,Math.PI,0);c.lineTo(dx+9,base);c.closePath();c.fill();
}
// Kasaba şeritleri: 3 derinlik × (uyuyan / renkli) — yan yana döşenebilir, kenarı kesen ev yok
const DN6_STRIP_W=1536,DN6_STRIP_H=460,DN6_PAR_F=[.16,.34,.56],DN6_PAR_Y=[.12,.2,.3],DN6_PAR_BASE=[540,600,660];
function dn6Strip(layer,lit){
 const key=layer*2+(lit?1:0);if(DN6.strips[key])return DN6.strips[key];
 const cv=dn6Cv(DN6_STRIP_W,DN6_STRIP_H),c=cv.getContext('2d'),R=rng(4401+layer*97),base=DN6_STRIP_H-10,sc=[.62,.8,1][layer];
 const dusk=lit?[.55,.42,.3][layer]:[.82,.75,.66][layer];
 // uzak katman: kale tepesine tırmanan sokak sırtı (yumuşak tepe)
 c.fillStyle=dn6Mix(lit?'#6c5a9c':'#3b3266','#241d4c',.25*layer);c.beginPath();c.moveTo(0,DN6_STRIP_H);for(let x=0;x<=DN6_STRIP_W;x+=32)c.lineTo(x,base-24*sc-Math.sin(x/DN6_STRIP_W*6.283*2+layer)*10*sc);c.lineTo(DN6_STRIP_W,DN6_STRIP_H);c.fill();
 let x=12+R()*20;
 while(x<DN6_STRIP_W-90*sc){
  const w=(56+R()*60)*sc,h=(70+R()*150)*sc+layer*12;if(x+w>DN6_STRIP_W-12)break;
  const RR=rng(Math.floor(x*13)+layer*1000);   // aynı ev iki sürümde aynı biçimde çizilsin
  dn6HouseShape(c,RR,x,base-Math.sin(x/DN6_STRIP_W*6.283*2+layer)*10*sc,w,h,DN6_PAL[Math.floor(R()*7)],lit,dusk);
  // ara sıra kule: ince, yüksek, kubbe çatılı
  if(R()<.18){const tw=22*sc,th=h+60*sc,tx=x+w+2;const RT=rng(Math.floor(tx*7)+layer);dn6HouseShape(c,RT,tx,base,tw,th,DN6_PAL[(layer+3)%7],lit,dusk);x+=tw+4;}
  x+=w+(4+R()*18)*sc;
 }
 // uzaktaki pencere ışıklarının hâlesi (yalnız renkli sürümde; önbellekte bir kez)
 if(lit){c.globalCompositeOperation='lighter';for(let j=0;j<40;j++){const xx=R()*DN6_STRIP_W,yy=base-40-R()*160*sc,rg=c.createRadialGradient(xx,yy,1,xx,yy,40);rg.addColorStop(0,'rgba(255,200,120,.16)');rg.addColorStop(1,'rgba(255,200,120,0)');c.fillStyle=rg;c.fillRect(xx-40,yy-40,80,80);}c.globalCompositeOperation='source-over';}
 DN6.strips[key]=cv;return cv;
}

// ── Uzaktaki rüya kalesi: bulutların üstünde, ışık bayraklı; kuleler ve altın pencereler ──
const DN6_CAS_W=900,DN6_CAS_H=820;
const DN6_SPIRES=[[450,92],[300,236],[600,226],[190,350],[712,340],[392,210],[520,196]];   // bayrak direklerinin uçları (kale tuvali koordinatı)
function dn6CastleArt(){
 if(DN6.castle)return DN6.castle;const cv=dn6Cv(DN6_CAS_W,DN6_CAS_H),c=cv.getContext('2d'),R=rng(9090);
 const stone='#7a6aae',sd='#4b3f80',hi='#b6a6e0';
 const tower=(x,top,w,bot,roof,rk)=>{
  const gr=c.createLinearGradient(x-w/2,0,x+w/2,0);gr.addColorStop(0,dn6Mix(stone,hi,.45));gr.addColorStop(.45,stone);gr.addColorStop(1,sd);c.fillStyle=gr;c.fillRect(x-w/2,top,w,bot-top);
  c.strokeStyle='rgba(40,30,80,.25)';c.lineWidth=1;for(let y=top+14;y<bot;y+=14){c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x+w/2,y);c.stroke();}
  // tepe bandı ve kubbe/külah çatı
  c.fillStyle=dn6Mix(stone,hi,.3);c.fillRect(x-w/2-4,top-6,w+8,8);
  dn6Roof(c,x-w/2-2,top-4,w+4,roof,rk===0?'#d27ab0':rk===1?'#8a78e0':'#5fb7c8',rk);
  for(let y=top+26;y<bot-30;y+=40){const lit=R()<.85;c.fillStyle=lit?'#ffd986':'#3e3570';c.beginPath();c.moveTo(x-4,y+12);c.lineTo(x-4,y);c.arc(x,y,4,Math.PI,0);c.lineTo(x+4,y+12);c.closePath();c.fill();}
 };
 // bulut tabanının arkasındaki kaya tepe
 c.fillStyle='#3f3572';c.beginPath();c.moveTo(80,820);c.bezierCurveTo(140,600,260,560,450,555);c.bezierCurveTo(640,560,770,600,830,820);c.closePath();c.fill();
 // sur duvarı
 let gr=c.createLinearGradient(0,470,0,640);gr.addColorStop(0,dn6Mix(stone,hi,.2));gr.addColorStop(1,sd);c.fillStyle=gr;c.fillRect(150,470,600,180);
 for(let x=150;x<750;x+=24){c.fillStyle=dn6Mix(stone,hi,.25);c.fillRect(x,458,14,14);}
 for(let y=490;y<650;y+=16){c.strokeStyle='rgba(40,30,80,.22)';c.beginPath();c.moveTo(150,y);c.lineTo(750,y);c.stroke();}
 // ana kapı kemeri ve içindeki altın ışık
 c.fillStyle='#2a2252';c.beginPath();c.moveTo(410,650);c.lineTo(410,575);c.arc(450,575,40,Math.PI,0);c.lineTo(490,650);c.closePath();c.fill();
 gr=c.createLinearGradient(0,540,0,650);gr.addColorStop(0,'rgba(255,214,140,.65)');gr.addColorStop(1,'rgba(255,170,150,.2)');c.fillStyle=gr;c.beginPath();c.moveTo(418,650);c.lineTo(418,578);c.arc(450,578,32,Math.PI,0);c.lineTo(482,650);c.closePath();c.fill();
 // kuleler: arkadan öne
 tower(190,350,54,560,90,1);tower(712,340,54,560,90,1);
 tower(300,236,70,520,110,0);tower(600,226,70,520,110,0);
 tower(392,210,44,480,96,1);tower(520,196,44,480,96,1);
 tower(450,92,96,480,150,0);
 // ana kulenin büyük gül penceresi
 c.fillStyle='#f0e2cc';c.beginPath();c.arc(450,300,22,0,6.283);c.fill();c.fillStyle='#ffd986';c.beginPath();c.arc(450,300,18,0,6.283);c.fill();
 c.strokeStyle='#c99a6a';c.lineWidth=1.4;for(let j=0;j<8;j++){const a=j*.785;c.beginPath();c.moveTo(450,300);c.lineTo(450+Math.cos(a)*18,300+Math.sin(a)*18);c.stroke();}
 // kalenin çevresindeki yumuşak ışık (önbellekte)
 c.globalCompositeOperation='lighter';const h=c.createRadialGradient(450,330,20,450,330,400);h.addColorStop(0,'rgba(255,214,170,.14)');h.addColorStop(1,'rgba(255,214,170,0)');c.fillStyle=h;c.fillRect(0,0,DN6_CAS_W,DN6_CAS_H);c.globalCompositeOperation='source-over';
 // taban bulutları
 for(let j=0;j<22;j++){const x=60+j*37+R()*20,y=640+R()*90,r=40+R()*60,cg=c.createRadialGradient(x,y-r*.3,4,x,y,r);cg.addColorStop(0,'#f6dcef');cg.addColorStop(.6,'#c8a8de');cg.addColorStop(1,'rgba(160,130,200,0)');c.fillStyle=cg;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();}
 DN6.castle=cv;return cv;
}
function dn6CloudArt(v){
 if(DN6.clouds[v])return DN6.clouds[v];const cv=dn6Cv(520,230),c=cv.getContext('2d'),R=rng(301+v*53);
 for(let j=0;j<14;j++){const x=60+R()*400,y=120+R()*60-Math.sin((x-60)/400*Math.PI)*60,r=40+R()*55,cg=c.createRadialGradient(x-r*.2,y-r*.45,3,x,y,r);
  cg.addColorStop(0,'rgba(255,236,248,.95)');cg.addColorStop(.45,'rgba(214,180,232,.85)');cg.addColorStop(.85,'rgba(150,120,200,.35)');cg.addColorStop(1,'rgba(150,120,200,0)');c.fillStyle=cg;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();}
 DN6.clouds[v]=cv;return cv;
}
// küçük kâğıt fener (fener dizileri): renk × (sönük / yanık) önbellekte
function dn6Bulb(ci,lit){
 const k=ci*2+(lit?1:0);let cv=DN6.bulbs.get(k);if(cv)return cv;cv=dn6Cv(28,40);const c=cv.getContext('2d'),col=DN6_FLAG[ci],body=lit?col:dn6Mix(col,'#3a3266',.62);
 c.fillStyle='#4a3a5a';c.fillRect(11,1,6,4);c.fillRect(11,34,6,3);
 const gr=c.createLinearGradient(4,0,24,0);gr.addColorStop(0,dn6Mix(body,'#ffffff',lit?.5:.15));gr.addColorStop(.5,body);gr.addColorStop(1,dn6Mix(body,'#201a40',.35));c.fillStyle=gr;
 c.beginPath();c.ellipse(14,19,10,14,0,0,6.283);c.fill();c.strokeStyle=lit?'rgba(255,255,230,.6)':'rgba(30,24,60,.35)';c.lineWidth=.8;for(let j=-1;j<=1;j++){c.beginPath();c.ellipse(14,19,Math.abs(j)*6+1,14,0,0,6.283);c.stroke();}
 if(lit){c.fillStyle='rgba(255,250,220,.85)';c.beginPath();c.ellipse(14,20,4,7,0,0,6.283);c.fill();}
 DN6.bulbs.set(k,cv);return cv;
}
function dn6BushArt(v){
 if(DN6.bushes[v])return DN6.bushes[v];const cv=dn6Cv(560,300),c=cv.getContext('2d'),R=rng(811+v*31);c.scale(2,2);
 for(let j=0;j<16;j++){const x=40+R()*200,y=100+R()*40,r=22+R()*30;c.fillStyle=j%2?'#2c2652':'#342c5e';c.beginPath();c.arc(x,y,r,0,6.283);c.fill();}
 for(let j=0;j<30;j++){const x=30+R()*220,y=70+R()*70;c.fillStyle=DN6_FLAG[j%6];c.globalAlpha=.75;for(let k=0;k<5;k++){c.beginPath();c.arc(x+Math.cos(k*1.256)*3,y+Math.sin(k*1.256)*3,2.6,0,6.283);c.fill();}c.globalAlpha=1;c.fillStyle='#fff2cc';c.beginPath();c.arc(x,y,1.4,0,6.283);c.fill();}
 DN6.bushes[v]=cv;return cv;
}

// ── Haritadan türetilen yapılar: yüksek tek yönlü platformların altında evler / sur, alçak olanların altında tezgâh ──
function dn6Yapilar(){
 if(DN6.houses.length)return;
 for(let r=0;r<ROWS;r++){let c=0;while(c<COLS){if(grid[r][c]!==2){c++;continue;}let e=c;while(e+1<COLS&&grid[r][e+1]===2)e++;
  let sur=0;for(let k=c;k<=e;k++)sur=Math.max(sur,topOf(k));const yuk=sur-r,x0=c*T,x1=(e+1)*T,top=r*T,R=rng(c*31+r*7);
  const tip=yuk<=2?'kopru':yuk<=4?'tezgah':x0>=200*T?'sur':'ev';
  const h={tip,x0,x1,top,bot:sur*T,col:DN6_PAL[(c+r)%7],seed:c*31+r*7,win:[]};
  if(tip==='ev'){const n=Math.max(1,Math.floor((x1-x0)/58));for(let fl=0;fl<Math.floor((h.bot-top-40)/72);fl++)for(let k=0;k<n;k++)h.win.push({x:x0+(k+.5)*(x1-x0)/n,y:top+46+fl*72});}
  else if(tip==='sur'){for(let k=0;k<Math.floor((x1-x0)/120);k++)h.win.push({x:x0+60+k*120,y:top+70});}
  DN6.houses.push(h);for(const w of h.win)DN6.wins.push(w);c=e+1;}}
 {const gy=topOf(480)*T;for(let xx=459*T+250;xx<COLS*T-60;xx+=240)DN6.wins.push({x:xx,y:gy-130});for(let y=gy-380;y<gy-40;y+=60)DN6.wins.push({x:COLS*T-70,y});}
 DN6.houses.sort((a,b)=>a.x0-b.x0);DN6.wins.sort((a,b)=>a.x-b.x);
 // sokak fener dizileri: kasaba boyunca direkten direğe (nesne olan sütunlardan biraz kaçarak)
 for(let c=8;c<262;c+=11){const a=c,b=c+9;if(topOf(a)>=ROWS||topOf(b)>=ROWS)continue;if(DN6.houses.some(h=>(h.tip==='ev'||h.tip==='sur')&&h.x1>a*T-20&&h.x0<(b+1)*T+20))continue;DN6.garlands.push({x0:a*T+20,x1:b*T+20,y0:topOf(a)*T-205,y1:topOf(b)*T-205,n:7,ci:(c/11|0)%6});}
 for(let c=410;c<470;c+=12)DN6.garlands.push({x0:c*T+20,x1:(c+9)*T+20,y0:topOf(c)*T-205,y1:topOf(c+9)*T-205,n:7,ci:(c/12|0)%6});
}
function dn6PaintEv(c,h){
 const R=rng(h.seed),w=h.x1-h.x0,x=h.x0,top=h.top,bot=h.bot+30,col=dn6Mix(h.col,'#40356e',.4),dark=dn6Mix(col,'#1c1638',.45);
 const gr=c.createLinearGradient(x,top,x+w,bot);gr.addColorStop(0,dn6Mix(col,'#ffffff',.14));gr.addColorStop(.55,col);gr.addColorStop(1,dark);c.fillStyle=gr;c.fillRect(x+4,top+8,w-8,bot-top);
 // kat kirişleri ve köşe dikmeleri
 c.strokeStyle='#5d4466';c.lineWidth=4;c.beginPath();for(let y=top+90;y<bot-20;y+=72){c.moveTo(x+4,y);c.lineTo(x+w-4,y);}c.moveTo(x+7,top+8);c.lineTo(x+7,bot);c.moveTo(x+w-7,top+8);c.lineTo(x+w-7,bot);c.stroke();
 c.lineWidth=2.4;c.beginPath();for(let y=top+90;y<bot-60;y+=72)for(let xx=x+20;xx<x+w-40;xx+=90){c.moveTo(xx,y);c.lineTo(xx+26,y-30);c.moveTo(xx+52,y);c.lineTo(xx+26,y-30);}c.stroke();
 for(const wn of h.win)dn6Window(c,wn.x,wn.y,16,24,false);
 // teras: Feza'nın yürüdüğü taş korkuluk bandı (üst kenar tam platform hizasında) ve arkada küçük babalar
 c.fillStyle='#c9b6d6';c.fillRect(x,top,w,12);c.fillStyle='#8e7aa8';c.fillRect(x,top+12,w,5);c.fillStyle='rgba(255,236,214,.6)';c.fillRect(x,top,w,1.6);
 for(let xx=x+10;xx<x+w-6;xx+=14){c.fillStyle='#a996c0';c.fillRect(xx,top-18,5,18);c.fillStyle='#c9b6d6';c.beginPath();c.arc(xx+2.5,top-19,3.5,0,6.283);c.fill();}
 c.fillStyle='#b8a4cc';c.fillRect(x,top-22,w,4);
 // uçlarda yuvarlak çatılı küçük kule tepeleri (terasın arkasında, yürüyüşü kapatmaz)
 for(const ex of [x+2,x+w-30]){c.fillStyle=dn6Mix(col,'#ffffff',.08);c.fillRect(ex,top-48,28,48);dn6Roof(c,ex-2,top-46,32,34,DN6_PAL[(h.seed+3)%7],R()<.5?0:1);dn6Window(c,ex+14,top-24,8,12,false);}
 // kapı (yere iniyorsa)
 if(h.bot-top>150){const dx=x+w*.5;c.fillStyle='#6a4458';c.beginPath();c.moveTo(dx-16,h.bot);c.lineTo(dx-16,h.bot-38);c.arc(dx,h.bot-38,16,Math.PI,0);c.lineTo(dx+16,h.bot);c.closePath();c.fill();c.fillStyle='#ffd986';c.beginPath();c.arc(dx+9,h.bot-20,2,0,6.283);c.fill();}
}
function dn6PaintSur(c,h){
 const x=h.x0,w=h.x1-h.x0,top=h.top,bot=h.bot+30,R=rng(h.seed);
 const gr=c.createLinearGradient(0,top,0,bot);gr.addColorStop(0,'#8f80bc');gr.addColorStop(.4,'#6a5c9a');gr.addColorStop(1,'#3a3068');c.fillStyle=gr;c.fillRect(x,top,w,bot-top);
 c.strokeStyle='rgba(36,28,70,.3)';c.lineWidth=1;for(let y=top+16,i=0;y<bot;y+=18,i++){c.beginPath();c.moveTo(x,y);c.lineTo(x+w,y);c.stroke();c.beginPath();for(let xx=x+(i%2?14:30);xx<x+w;xx+=34){c.moveTo(xx,y-18);c.lineTo(xx,y);}c.stroke();}
 // mazgallar: yürüme hizasının arkasında
 for(let xx=x+4;xx<x+w-14;xx+=30){c.fillStyle='#9a8bc6';c.fillRect(xx,top-20,16,20);c.fillStyle='rgba(255,236,214,.45)';c.fillRect(xx,top-20,16,2);}
 c.fillStyle='#b2a3d8';c.fillRect(x,top,w,8);c.fillStyle='rgba(255,236,214,.6)';c.fillRect(x,top,w,1.5);
 // asılı şenlik sancakları ve dar mazgal pencereleri
 for(let k=0;k<Math.floor(w/120);k++){const bx=x+30+k*120+R()*20,col=DN6_FLAG[(k+h.seed)%6];c.fillStyle=dn6Mix(col,'#3a3266',.35);c.beginPath();c.moveTo(bx,top+12);c.lineTo(bx+26,top+12);c.lineTo(bx+26,top+62);c.lineTo(bx+13,top+52);c.lineTo(bx,top+62);c.closePath();c.fill();c.fillStyle='rgba(255,240,200,.6)';c.beginPath();c.arc(bx+13,top+32,5,0,6.283);c.fill();}
 for(const wn of h.win)dn6Window(c,wn.x,wn.y,9,16,false);
}
function dn6PaintTezgah(c,h){
 const x=h.x0,w=h.x1-h.x0,top=h.top,bot=h.bot,R=rng(h.seed),cA=DN6_FLAG[h.seed%6],cB='#f6ead8';
 // direkler
 c.fillStyle='#6a4a5c';c.fillRect(x+6,top,6,bot-top);c.fillRect(x+w-12,top,6,bot-top);
 // tezgâh tablası ve üstündeki mallar: meyve, kavanoz, kurdele makaraları
 c.fillStyle='#8a5e5e';c.fillRect(x+2,bot-44,w-4,10);c.fillStyle='#6e4a52';c.fillRect(x+8,bot-34,w-16,34);
 c.fillStyle='rgba(255,220,200,.25)';c.fillRect(x+8,bot-34,w-16,3);
 for(let xx=x+16;xx<x+w-16;xx+=11){const k=R();c.fillStyle=k<.33?'#ff9e7a':k<.66?'#ffd36e':'#b79cff';c.beginPath();c.arc(xx,bot-48,4.5,0,6.283);c.fill();if(R()<.3){c.fillStyle='rgba(220,240,255,.6)';c.fillRect(xx-3,bot-62,7,10);}}
 // çizgili tente: üst kenar = platform (Feza bunun üstünde durur), alt kenar fistolu
 for(let xx=x,i=0;xx<x+w;xx+=16,i++){c.fillStyle=i%2?cB:cA;c.fillRect(xx,top,Math.min(16,x+w-xx),22);c.beginPath();c.arc(xx+8,top+22,8,0,Math.PI);c.fill();}
 c.fillStyle='rgba(40,24,70,.18)';c.fillRect(x,top+16,w,6);c.fillStyle='rgba(255,250,235,.6)';c.fillRect(x,top,w,2);
}
function dn6PaintKopru(c,h){
 // kanal köprücüğü: tahta kalaslar, korkuluk; altında ışıl suyun önbellek kısmı
 const x=h.x0,w=h.x1-h.x0,top=h.top;
 const wg=c.createLinearGradient(0,top+10,0,h.bot+10);wg.addColorStop(0,'#5a6ab8');wg.addColorStop(1,'#2e2f70');c.fillStyle=wg;c.fillRect(x,top+30,w,h.bot-top-20);
 c.strokeStyle='rgba(255,230,190,.35)';c.lineWidth=1;for(let j=0;j<4;j++){c.beginPath();c.moveTo(x+6,top+44+j*9);c.lineTo(x+w-6,top+44+j*9);c.stroke();}
 c.fillStyle='#8a6050';c.fillRect(x-4,top,w+8,9);for(let xx=x-4;xx<x+w+4;xx+=12){c.fillStyle='rgba(40,20,30,.3)';c.fillRect(xx,top,1.2,9);}
 c.fillStyle='#a87a62';c.fillRect(x-4,top,w+8,2);
 // kemer altı
 c.strokeStyle='#6a4a44';c.lineWidth=5;c.beginPath();c.moveTo(x,top+10);c.quadraticCurveTo(x+w/2,top+38,x+w,top+10);c.stroke();
 c.fillStyle='#7a5446';c.fillRect(x-2,top-24,4,24);c.fillRect(x+w-2,top-24,4,24);c.fillRect(x+w/2-2,top-24,4,24);c.fillRect(x-2,top-26,w+4,3);
}

// ── Zemin parçaları (768 genişlik, önbellekte; LRU 12): taş istinat duvarı, kaldırım, ev cepheleri, dekor ──
const DN6_CW=768,DN6_CACHE=12;
function dn6Barrel(c,x,y,s){c.fillStyle='#7a4e4a';c.beginPath();c.ellipse(x,y-14*s,11*s,14*s,0,0,6.283);c.fill();c.fillStyle='#5a3a3e';c.fillRect(x-11*s,y-22*s,22*s,2.5*s);c.fillRect(x-11*s,y-8*s,22*s,2.5*s);c.fillStyle='rgba(255,220,190,.25)';c.fillRect(x-7*s,y-26*s,3*s,22*s);}
function dn6Crate(c,x,y,s){c.fillStyle='#8a6a58';c.fillRect(x-12*s,y-22*s,24*s,22*s);c.strokeStyle='#5e4440';c.lineWidth=2*s;c.strokeRect(x-12*s,y-22*s,24*s,22*s);c.beginPath();c.moveTo(x-12*s,y-22*s);c.lineTo(x+12*s,y);c.stroke();}
function dn6Pot(c,x,y,s,col){c.fillStyle='#b4746a';c.beginPath();c.moveTo(x-9*s,y-16*s);c.lineTo(x+9*s,y-16*s);c.lineTo(x+6*s,y);c.lineTo(x-6*s,y);c.closePath();c.fill();c.fillStyle='#3e5a54';c.beginPath();c.arc(x,y-20*s,9*s,0,6.283);c.fill();c.fillStyle=col;for(let k=0;k<5;k++){c.beginPath();c.arc(x+Math.cos(k*1.3)*6*s,y-22*s+Math.sin(k*1.3)*4*s,2.4*s,0,6.283);c.fill();}}
function dn6Pole(c,x,y){c.fillStyle='#5e4458';c.fillRect(x-2.5,y-210,5,210);c.fillStyle='#8a6a7a';c.fillRect(x-6,y-214,12,5);c.fillStyle='#ffd986';c.beginPath();c.arc(x,y-218,3,0,6.283);c.fill();}
function dn6Chunk(i){
 if(DN6.chunks.has(i)){const a=DN6.chunks.get(i);DN6.chunks.delete(i);DN6.chunks.set(i,a);return a;}
 dn6Yapilar();
 const cv=dn6Cv(DN6_CW+4,1200),c=cv.getContext('2d'),x0=i*DN6_CW,R=rng(i*733+61);c.translate(2-x0,0);
 const L=x0-2,Rr=x0+DN6_CW+2;
 // 1) yapılar (zeminin arkasında): ev, sur, tezgâh, köprücük
 for(const h of DN6.houses){if(h.x1<L-60||h.x0>Rr+60)continue;if(h.tip==='ev')dn6PaintEv(c,h);else if(h.tip==='sur')dn6PaintSur(c,h);else if(h.tip==='tezgah')dn6PaintTezgah(c,h);}
 // avlu: kalenin iç duvarı, kemer kapı ve iki yuvarlak kule (dünya derinliğinde, final nesnesinin arkasında)
 if(Rr>456*T&&L<COLS*T)dn6PaintAvlu(c);
 // 2) zemin gövdesi
 const p=new Path2D();let open=false,prev=1200;
 for(let x=Math.floor(L);x<=Rr;x+=2){const y=dn6Surface(x);if(y>=1200){if(open){p.lineTo(x,prev);p.lineTo(x,1200);p.closePath();open=false;}prev=1200;continue;}
  if(!open){p.moveTo(x,1200);p.lineTo(x,y);open=true;prev=y;}else if(y!==prev){p.lineTo(x,prev);p.lineTo(x,y);prev=y;}}
 if(open){p.lineTo(Rr,prev);p.lineTo(Rr,1200);p.closePath();}
 const gr=c.createLinearGradient(0,440,0,1200);gr.addColorStop(0,'#7d6fa6');gr.addColorStop(.35,'#584a86');gr.addColorStop(1,'#241d4a');c.fillStyle=gr;c.fill(p);
 c.save();c.clip(p);
 // kesme taş istinat duvarı: sıra sıra yumuşak bloklar, ara sıra açık/koyu taş
 for(let row=0;row<44;row++){const y=400+row*20;for(let xx=Math.floor(L/38)*38-(row%2)*19;xx<Rr;xx+=38){const Q=rng((xx*7+row*131)|0),v=Q();c.fillStyle=v<.2?'rgba(190,170,220,.16)':v<.4?'rgba(20,14,50,.16)':'rgba(140,120,190,.06)';c.fillRect(xx+1.5,y+1.5,35,17);c.fillStyle='rgba(255,236,230,.1)';c.fillRect(xx+1.5,y+1.5,35,1.3);}}
 c.strokeStyle='rgba(28,20,60,.35)';c.lineWidth=1.4;for(let row=0;row<44;row++){const y=400+row*20;c.beginPath();c.moveTo(L,y);c.lineTo(Rr,y);for(let xx=Math.floor(L/38)*38-(row%2)*19;xx<Rr;xx+=38){c.moveTo(xx,y);c.lineTo(xx,y+20);}c.stroke();}
 const dk=c.createLinearGradient(0,0,0,1200);dk.addColorStop(0,'rgba(20,14,50,0)');dk.addColorStop(.6,'rgba(20,14,50,.18)');dk.addColorStop(1,'rgba(14,10,40,.55)');c.fillStyle=dk;c.fillRect(L,0,Rr-L,1200);
 c.restore();
 // 3) kaldırım: yüzeyde iki sıra yuvarlak taş; kenar ışığı; yosun ve minik çiçekler
 for(let q=Math.floor(L/T);q<=Math.ceil(Rr/T);q++){const sy=topOf(q)*T;if(q<0||q>=COLS||sy>=1200)continue;const sx=q*T,Q=rng(q*57+3);
  c.fillStyle='#3a3064';c.fillRect(sx,sy,T,16);
  for(let r2=0;r2<2;r2++)for(let k=0;k<4;k++){const cx=sx+5+k*10+(r2?5:0)+Q()*2,cy=sy+4+r2*7;c.fillStyle=Q()<.3?'#c3b3d8':Q()<.6?'#a898c6':'#b6a6d0';c.beginPath();c.ellipse(cx,cy,4.6,3,0,0,6.283);c.fill();}
  c.fillStyle='rgba(255,232,214,.55)';c.fillRect(sx,sy,T,1.4);
  // kenar: yan komşu boşsa (basamak ya da uçurum) yuvarlatılmış taş başlık
  if(q+1<COLS&&topOf(q+1)>topOf(q)){c.fillStyle='#b6a6d0';c.beginPath();c.arc(sx+T-2,sy+6,6,0,6.283);c.fill();}
  if(q>0&&topOf(q-1)>topOf(q)){c.fillStyle='#b6a6d0';c.beginPath();c.arc(sx+2,sy+6,6,0,6.283);c.fill();}
  if(Q()<.45){const px=sx+Q()*T;c.strokeStyle='#5f8a78';c.lineWidth=1;for(let k=0;k<3;k++){c.beginPath();c.moveTo(px+k*2,sy);c.quadraticCurveTo(px+k*2-2,sy-5,px+k*3-1,sy-8-Q()*4);c.stroke();}if(Q()<.5){c.fillStyle=DN6_FLAG[q%6];c.beginPath();c.arc(px+3,sy-10,2,0,6.283);c.fill();}}
 }
 // 4) uçurum kenarları: kasaba sonu (266) ve kale tepesi başı (390): kaya, kök, sarkan ışık sarmaşıkları
 for(const [ex,yon] of [[267*T,1],[390*T,-1]]){if(ex<L-80||ex>Rr+80)continue;const sy=dn6Surface(ex-yon*20),Q=rng(ex);
  c.fillStyle='#3a3068';c.beginPath();c.moveTo(ex,sy);for(let y=sy;y<1200;y+=30)c.lineTo(ex+yon*(Q()*14-4),y);c.lineTo(ex-yon*30,1200);c.lineTo(ex-yon*30,sy);c.closePath();c.fill();
  for(let k=0;k<5;k++){const vx=ex-yon*(6+k*7),len=60+Q()*120;c.strokeStyle='#4f7a6c';c.lineWidth=1.4;c.beginPath();c.moveTo(vx,sy+4);c.bezierCurveTo(vx+yon*8,sy+len*.3,vx-yon*6,sy+len*.7,vx+yon*4,sy+len);c.stroke();for(let m=1;m<5;m++){c.fillStyle=DN6_FLAG[(k+m)%6];c.beginPath();c.arc(vx+yon*Math.sin(m)*4,sy+len*m/5,1.8,0,6.283);c.fill();}}}
 // 4b) avlu istinat duvarı: kaldırımdan sarkan çiçekli sarmaşıklar ve minik ışık boncukları (final kadrajında düz duvar boş kalmasın)
 if(Rr>459*T){const Q=rng(i*391+17);for(let vx=Math.max(L,459*T)+Q()*30;vx<Rr;vx+=26+Q()*34){const sy=dn6Surface(vx)+14;if(sy>=1200)continue;const len=50+Q()*130,sw=(Q()-.5)*16;
  c.strokeStyle=Q()<.5?'#5f8a78':'#4f7a6c';c.lineWidth=1.6;c.beginPath();c.moveTo(vx,sy);c.bezierCurveTo(vx+sw,sy+len*.35,vx-sw,sy+len*.7,vx+sw*.5,sy+len);c.stroke();
  for(let m=1;m<=5;m++){const u=m/5.5,lx=vx+Math.sin(u*3.1)*sw*.5,ly=sy+len*u;c.fillStyle='#6f9c86';c.beginPath();c.ellipse(lx+3,ly,4,2.2,.5,0,6.283);c.fill();
   if(Q()<.45){c.fillStyle=DN6_FLAG[(m+Math.floor(vx/26))%6];c.beginPath();c.arc(lx-2,ly+2,2.6,0,6.283);c.fill();c.fillStyle='rgba(255,246,220,.85)';c.beginPath();c.arc(lx-2,ly+2,1,0,6.283);c.fill();}}}}
 // 5) hendek suyu (köprünün altı): iki kare derin, ışıklı su
 if(Rr>402*T&&L<408*T){const y0=dn6Surface(nx(402))-46,wg=c.createLinearGradient(0,y0,0,y0+46);wg.addColorStop(0,'#6a7ad0');wg.addColorStop(1,'#2a2c6c');c.fillStyle=wg;c.fillRect(402*T,y0,6*T,46);c.fillStyle='rgba(255,236,200,.5)';c.fillRect(402*T,y0,6*T,1.5);
  for(const xx of [401*T,408*T]){c.fillStyle='#8f80bc';c.fillRect(xx-14,dn6Surface(xx+(xx<405*T?-20:20))-120,28,120);c.fillStyle='#b2a3d8';c.fillRect(xx-18,dn6Surface(xx+(xx<405*T?-20:20))-128,36,10);c.fillStyle='#ffd986';c.beginPath();c.arc(xx,dn6Surface(xx+(xx<405*T?-20:20))-140,5,0,6.283);c.fill();}}
 // 6) köprücük ve sokak dekoru (fıçı, kasa, saksı); nesne sütunlarından kaçar
 for(const h of DN6.houses){if(h.tip==='kopru'&&h.x1>L&&h.x0<Rr)dn6PaintKopru(c,h);}
 const dolu=q=>NESNELER.some(o=>Math.abs(o.x-nx(q))<1.6*T&&o.tip!=='tohum'&&o.tip!=='konusma');
 for(let q=Math.floor(L/T);q<=Math.ceil(Rr/T);q++){if(q<1||q>=COLS-1)continue;const Q=rng(q*977+5);if(Q()>.22)continue;const sy=topOf(q)*T;if(sy>=1200||topOf(q-1)!==topOf(q)||topOf(q+1)!==topOf(q)||dolu(q))continue;
  const x=q*T+20,k=Q();if(k<.35){dn6Barrel(c,x,sy,1);if(Q()<.5)dn6Barrel(c,x+18,sy,.85);}else if(k<.6)dn6Crate(c,x,sy,1);else dn6Pot(c,x,sy,1,DN6_FLAG[q%6]);}
 for(const G of DN6.garlands){for(const [gx,gy] of [[G.x0,G.y0],[G.x1,G.y1]])if(gx>L-10&&gx<Rr+10)dn6Pole(c,gx,gy+205);}
 DN6.chunks.set(i,cv);while(DN6.chunks.size>DN6_CACHE)DN6.chunks.delete(DN6.chunks.keys().next().value);return cv;
}
function dn6PaintAvlu(c){
 // Kalenin iç avlusu: arka duvar (sancaklı), giriş kemer kapısı (sütun 459), iki yuvarlak kule; hepsi Feza'nın arkasında
 const gy=topOf(480)*T,x0=459*T,x1=COLS*T;
 let gr=c.createLinearGradient(0,gy-200,0,gy);gr.addColorStop(0,'#8a7cc0');gr.addColorStop(1,'#4a3e80');c.fillStyle=gr;c.fillRect(x0+60,gy-180,x1-x0-60,180);
 c.strokeStyle='rgba(36,28,70,.25)';c.lineWidth=1;for(let y=gy-164,i=0;y<gy;y+=18,i++){c.beginPath();c.moveTo(x0+60,y);c.lineTo(x1,y);c.stroke();}
 for(let xx=x0+64;xx<x1;xx+=34){c.fillStyle='#9a8bc6';c.fillRect(xx,gy-202,18,22);}
 for(let k=0;k<7;k++){const bx=x0+130+k*240,col=DN6_FLAG[k%6];if(bx>x1-60)break;c.fillStyle=col;c.beginPath();c.moveTo(bx,gy-172);c.lineTo(bx+44,gy-172);c.lineTo(bx+44,gy-90);c.lineTo(bx+22,gy-106);c.lineTo(bx,gy-90);c.closePath();c.fill();c.fillStyle='rgba(255,250,230,.8)';c.beginPath();for(let m=0;m<5;m++){const a=-1.571+m*2.513,r2=m%2?5:11;c.lineTo(bx+22+Math.cos(a)*11,gy-140+Math.sin(a)*11);c.lineTo(bx+22+Math.cos(a+1.256)*5,gy-140+Math.sin(a+1.256)*5);}c.closePath();c.fill();}
 // pencereler
 for(let xx=x0+250;xx<x1-60;xx+=240)dn6Window(c,xx,gy-130,16,26,false);
 // giriş kapısı: iki kalın kule ayağı ve kemer (Feza altından geçer)
 for(const tx of [x0-10,x0+70]){gr=c.createLinearGradient(tx-36,0,tx+36,0);gr.addColorStop(0,'#a698d2');gr.addColorStop(.5,'#7a6aae');gr.addColorStop(1,'#4b3f80');c.fillStyle=gr;c.fillRect(tx-36,gy-330,72,330);dn6Roof(c,tx-40,gy-326,80,90,'#d27ab0',1);c.fillStyle='#ffd986';c.beginPath();c.moveTo(tx-5,gy-240);c.lineTo(tx-5,gy-256);c.arc(tx,gy-256,5,Math.PI,0);c.lineTo(tx+5,gy-240);c.closePath();c.fill();}
 c.strokeStyle='#8f80bc';c.lineWidth=20;c.beginPath();c.moveTo(x0-10,gy-150);c.quadraticCurveTo(x0+30,gy-230,x0+70,gy-150);c.stroke();c.strokeStyle='rgba(255,236,214,.45)';c.lineWidth=2;c.stroke();
 // arka köşe kulesi
 const tx=x1-70;gr=c.createLinearGradient(tx-50,0,tx+50,0);gr.addColorStop(0,'#a698d2');gr.addColorStop(.5,'#7a6aae');gr.addColorStop(1,'#4b3f80');c.fillStyle=gr;c.fillRect(tx-50,gy-420,100,420);dn6Roof(c,tx-54,gy-416,108,120,'#8a78e0',0);for(let y=gy-380;y<gy-40;y+=60)dn6Window(c,tx,y,12,20,false);
}
function dn6Terrain(){
 g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);const a=Math.max(0,Math.floor(cam.x/DN6_CW)),b=Math.min(Math.ceil(COLS*T/DN6_CW),Math.floor((cam.x+VW)/DN6_CW));
 for(let i=a;i<=b;i++)g.drawImage(dn6Chunk(i),i*DN6_CW-2,0);const next=b+1;if(next*DN6_CW<COLS*T&&!DN6.chunks.has(next))dn6Chunk(next);
}

// ── Arka plan: gök, yıldızlar, ay, uzak kale, bulut denizi, üç kat kasaba ──
function dn6Approach(){return smooth(clamp((cam.x+VW*.5-20*T)/(470*T),0,1));}
// Uçurumdan sonra (yolculuk boşluğu) kasaba şeritleri hızla söner: bulut yolunun altında yalnız yumuşak bulut denizi kalsın.
function dn6Kasaba(){const x=cam.x+VW*.5;return 1-smooth(clamp((x-252*T)/(18*T),0,1));}
function dn6Backdrop(tm){
 const vw=W/S,vh=H/S,ap=dn6Approach(),R6=DN6.renk,town=dn6Kasaba();
 g.setTransform(S,0,0,S,0,0);
 // ışıldayan yıldızlar (sabahla söner)
 g.globalCompositeOperation='lighter';const st=(1-DN6.sabah)*.9;
 for(let i=0;i<DN6_STARS.length;i++){const s=DN6_STARS[i],a=st*(.35+.35*Math.sin(tm*s.sp+s.ph));dn6Glow('#fff2cc',s.x*vw,s.y*vh,s.r*5,s.r*5,a*.5);}
 g.globalCompositeOperation='source-over';
 // uzak rüya kalesi: yolculuk ilerledikçe büyür ve ekranın ortasına yaklaşır
 const cw=lerp(330,640,ap),ch=cw*DN6_CAS_H/DN6_CAS_W,cx=vw*lerp(.8,.6,ap)-cam.x*.004+ap*0,cy=lerp(540,610,ap)-cam.y*.1;
 g.globalAlpha=.94;g.drawImage(dn6CastleArt(),cx-cw*.5,cy-ch,cw,ch);g.globalAlpha=1;
 const k=cw/DN6_CAS_W,ox=cx-cw*.5,oy=cy-ch;
 g.globalCompositeOperation='lighter';
 dn6Glow('#ffd8b0',cx,oy+330*k,260*k*(1+R6*.4),300*k*(1+R6*.3),.12+R6*.2+.03*Math.sin(tm*.8));
 dn6Glow('#ffd27a',cx,oy+300*k,40*k,40*k,.35+R6*.4);
 // ışık bayrakları: kule uçlarında dalgalanan küçük üçgenler
 g.globalCompositeOperation='source-over';
 for(let j=0;j<DN6_SPIRES.length;j++){const sp=DN6_SPIRES[j],px=ox+sp[0]*k,py=oy+(sp[1]-(j===0?156:j<3?116:j<5?96:102))*k,L=(26+(j===0?14:0))*k,wv=Math.sin(tm*2.2+j)*4*k;
  g.strokeStyle='#e8d8c8';g.lineWidth=1.2;g.beginPath();g.moveTo(px,py+14*k);g.lineTo(px,py-12*k);g.stroke();
  g.fillStyle=DN6_FLAG[j%6];g.beginPath();g.moveTo(px,py-12*k);g.quadraticCurveTo(px+L*.5,py-14*k+wv,px+L,py-8*k+wv);g.quadraticCurveTo(px+L*.5,py-4*k+wv*.5,px,py-2*k);g.closePath();g.fill();
  g.globalCompositeOperation='lighter';dn6Glow(DN6_FLAG[j%6],px+L*.5,py-8*k,L*.9,L*.6,.25+R6*.25);g.globalCompositeOperation='source-over';}
 // kale çevresinde bulut denizi (iki derinlik, yavaş akar)
 for(let layer=0;layer<2;layer++){const f=.08+layer*.12,y=cy-30*k+layer*36-cam.y*.04*layer,sw=520*(.9+layer*.4);g.globalAlpha=(.55+layer*.25)*(.6+.4*(1-town*.5));
  for(let q=-1;q<vw/sw*2+2;q++){const xx=((q*sw*.6-cam.x*f-tm*(3+layer*2))%(vw+sw*1.2)+vw+sw*1.2)%(vw+sw*1.2)-sw*.6;g.drawImage(dn6CloudArt(((q+layer)%3+3)%3),xx,y-sw*.3,sw,sw*230/520);}}
 g.globalAlpha=1;
 // kasaba şeritleri: uyuyan (gri-mor) ve renkli sürüm arasında geçiş; uçurumda bulutlara açılır
 for(let layer=0;layer<3;layer++){
  const f=DN6_PAR_F[layer],base=DN6_PAR_BASE[layer]-cam.y*DN6_PAR_Y[layer],a=town*(layer===2?.92:.95);if(a<.01)continue;
  const off=((cam.x*f)%DN6_STRIP_W+DN6_STRIP_W)%DN6_STRIP_W;g.setTransform(S,0,0,S,0,0);
  for(let x=-off;x<vw;x+=DN6_STRIP_W){g.globalAlpha=a;g.drawImage(dn6Strip(layer,false),x,base-DN6_STRIP_H);if(R6>.01){g.globalAlpha=a*R6;g.drawImage(dn6Strip(layer,true),x,base-DN6_STRIP_H);}}
  g.globalAlpha=1;
  // katmanlar arası alacakaranlık sisi (derinlik), sabahta pembe-altın
  g.globalAlpha=.16*a;g.fillStyle=DN6.sabah>.5?'#f0b8c0':'#6a5098';g.fillRect(0,base-30,vw,vh);g.globalAlpha=1;
 }
}
// sokak arası fener dizileri: dünya koordinatında sarkan kâğıt fenerler; yerel ışıkla yanar, rüzgârla salınır
function dn6Garlands(tm){
 const L=cam.x-200,Rr=cam.x+VW+200;
 for(let gi=0;gi<DN6.garlands.length;gi++){const G=DN6.garlands[gi];if(G.x1<L||G.x0>Rr)continue;
  const lit=dn6Isik((G.x0+G.x1)*.5),sag=34+Math.sin(tm*.9+gi)*4;
  g.strokeStyle='rgba(40,30,60,.75)';g.lineWidth=1.2;g.beginPath();g.moveTo(G.x0,G.y0);g.quadraticCurveTo((G.x0+G.x1)*.5,(G.y0+G.y1)*.5+sag*2,G.x1,G.y1);g.stroke();
  for(let j=1;j<=G.n;j++){const u=j/(G.n+1),x=lerp(G.x0,G.x1,u),y=lerp(G.y0,G.y1,u)+4*sag*u*(1-u)*2*.5*2,sw=Math.sin(tm*1.6+gi+j*.7)*.08,ci=(G.ci+j)%6;
   const yy=y+2;g.save();g.translate(x,yy);g.rotate(sw);g.drawImage(dn6Bulb(ci,false),-9,0,18,26);if(lit>.02){g.globalAlpha=lit;g.drawImage(dn6Bulb(ci,true),-9,0,18,26);}g.restore();g.globalAlpha=1;
   if(lit>.02){g.globalCompositeOperation='lighter';dn6Glow(DN6_FLAG[ci],x,yy+13,30,30,lit*.32);dn6Glow('#fff2cc',x,yy+13,8,10,lit*.5);g.globalCompositeOperation='source-over';}}
 }
}
function dn6Windows(tm){
 // ev/sur pencereleri: uyurken soluk, ışık dalgası gelince altın; hafif titreşim
 const L=cam.x-60,Rr=cam.x+VW+60;g.globalCompositeOperation='lighter';
 for(let i=0;i<DN6.wins.length;i++){const w=DN6.wins[i];if(w.x<L)continue;if(w.x>Rr)break;const a=dn6Isik(w.x),fl=.92+.08*Math.sin(tm*3+i*1.7);
  dn6Glow('#ffd27a',w.x,w.y,10,13,(.08+a*.75)*fl);dn6Glow('#ffb070',w.x,w.y+4,36,30,(.02+a*.16)*fl);}
 g.globalCompositeOperation='source-over';
}
function dn6CloudSea(tm){
 // midilli yolculuğunun altındaki bulut denizi (dünya koordinatı, iki sıra, yavaş akar)
 const L=Math.max(cam.x-400,DN6_GAP0-300),Rr=Math.min(cam.x+VW+400,DN6_GAP1+300);if(L>Rr)return;
 g.globalAlpha=.9;g.fillStyle='#a58cc8';g.fillRect(Math.max(L,DN6_GAP0-40),880,Math.min(Rr,DN6_GAP1+40)-Math.max(L,DN6_GAP0-40),500);g.globalAlpha=1;
 for(let row=0;row<2;row++){const y=770+row*80,sw=520*(1.1+row*.3),step=sw*.55;g.globalAlpha=.85-row*.1;
  for(let q=Math.floor((L-sw)/step);q<=Math.ceil(Rr/step);q++){const x=q*step+Math.sin(tm*.15+q*1.3)*20+row*90;if(x+sw<DN6_GAP0-250||x>DN6_GAP1+250)continue;g.drawImage(dn6CloudArt((q+row*2+30)%3),x,y-sw*.25,sw,sw*230/520);}}
 g.globalAlpha=1;
 // bulutların arasında ışık tozları
 g.globalCompositeOperation='lighter';for(let q=Math.floor(L/180);q<=Math.ceil(Rr/180);q++){const u=(tm*.1+q*.618)%1,x=q*180+Math.sin(q*2.1)*50,y=800-u*120;dn6Glow(DN6_GLOWS[q%10],x,y,8,8,Math.sin(u*Math.PI)*.35);}g.globalCompositeOperation='source-over';
}
function dn6Moat(tm){
 if(cam.x+VW<401*T||cam.x>409*T)return;const y0=dn6Surface(nx(402))-46,k=DN6.kopruT===null?0:smooth(clamp((now-DN6.kopruT)/2,0,1));
 g.globalCompositeOperation='lighter';
 for(let j=0;j<6;j++){const x=402*T+20+j*40+Math.sin(tm*1.3+j)*6;dn6Glow(j%2?'#9fe8ff':'#ffd27a',x,y0+10+Math.sin(tm*2+j)*3,22,6,.18+k*.35);}
 dn6Glow('#ffe6a8',405*T,y0+20,150,40,k*.25);g.globalCompositeOperation='source-over';
}
function dn6Background(tm){
 if(!dn6Ready())return;dn6Sky();dn6Durum();
 g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(DN6.sky,0,0,W,H);
 if(DN6.sabah>.004){g.globalAlpha=DN6.sabah;g.drawImage(DN6.dawn,0,0,W,H);g.globalAlpha=1;}
 dn6Backdrop(tm);
}
function dn6World(tm){
 if(!dn6Ready())return;g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);dn6CloudSea(tm);dn6Terrain();g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);dn6Windows(tm);dn6Garlands(tm);dn6Moat(tm);
 // fener ışık dalgası: yeni yanan fenerden yayılan ince altın halka
 g.globalCompositeOperation='lighter';
 for(const Lt of DN6.lit){const age=now-Lt.t;if(age<0||age>2.6||Lt.x<cam.x-1400||Lt.x>cam.x+VW+1400)continue;const u=age/2.6,y=dn6Surface(Lt.x)-60;dn6Glow('#ffd8a0',Lt.x,y,60+u*900,30+u*160,(1-u)*.14);}
 g.globalCompositeOperation='source-over';g.globalAlpha=1;
}
// ── Işık tozu (önde ve arkada): altın, pembe, lila, nane; kasaba renklendikçe parlar ──
const dn6R=rng(5151),DN6_DUST=Array.from({length:64},(_,i)=>({x:dn6R()*6000,y:dn6R()*1300,z:.25+dn6R()*1.1,ph:dn6R()*6.283,r:.7+dn6R()*1.6,col:DN6_GLOWS[i%10],sp:.4+dn6R()}));
function dn6Motes(tm,zMin,zMax){
 if(!dn6Ready())return;const vw=W/S,vh=H/S,px=(Number.isFinite(P.rx)?P.rx:P.x)-cam.x,py=(Number.isFinite(P.ry)?P.ry:P.y)-cam.y-32,br=.55+DN6.renk*.45;
 g.setTransform(S,0,0,S,0,0);g.globalCompositeOperation='lighter';
 for(let i=0;i<DN6_DUST.length;i++){const p=DN6_DUST[i];if(p.z<zMin||p.z>=zMax)continue;
  const x=((p.x-cam.x*p.z+Math.sin(tm*.25+p.ph)*22)%(vw+100)+vw+100)%(vw+100)-50,y=((p.y-cam.y*p.z-tm*p.sp*8+Math.sin(tm*.2+p.ph)*12)%(vh+100)+vh+100)%(vh+100)-50;
  let a=(.25+.16*Math.sin(tm*1.4+p.ph))*(p.z>.8?.85:.6)*br;
  if(p.z>=.75){const dx=(x-px)/57,dy=(y-py)/76,d=dx*dx+dy*dy;if(d<1)a*=.13+.87*smooth(d);}
  dn6Glow(p.col,x,y,p.r*5,p.r*5,a*.6);g.fillStyle=p.col;g.globalAlpha=a;g.beginPath();g.ellipse(x,y,p.r*.6,p.r*.6,0,0,6.283);g.fill();}
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
function dn6Petals(tm){
 if(!dn6Ready())return;g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);g.globalCompositeOperation='lighter';
 // Feza'nın adımlarından küçük yıldız tozu
 if(!P.ucus&&P.ground&&Math.abs(P.vx||0)>35){for(let j=0;j<6;j++){const a=(tm*1.5+j/6)%1,x=P.x-P.f*(a*60+8),y=P.y-2-a*18+Math.sin(j*1.6+tm*2)*3;dn6Glow(j%2?'#ffd8a0':'#e8c8ff',x,y,6,4,(1-a)*.25);}}
 // finalde avluya yağan ışık yaprakları
 if(DN6.finT!==null){const age=now-DN6.finT,f=Math.min(1,Math.max(0,age/4)),ax=BOLUM.avlu?BOLUM.avlu.x:cam.x+VW/2,ay=BOLUM.avlu?BOLUM.avlu.y:cam.y+300;
  for(let j=0;j<30;j++){const u=(tm*.08+j*.0333)%1,x=ax+Math.sin(j*2.3)*VW*.5+Math.sin(tm*.7+j)*30,y=ay-520+u*560;dn6Glow(DN6_FLAG[j%6],x,y,10,7,f*Math.sin(u*Math.PI)*.45);}}
 g.globalCompositeOperation='source-over';g.globalAlpha=1;
}
function dn6Foreground(tm){
 if(!dn6Ready())return;const vw=W/S,vh=H/S;
 // üstte salınan şenlik flamaları (iki ip, paralaks 1,1): uyurken soluk, kasaba renklendikçe canlı
 const f=1.1,R6=DN6.renk,town=dn6Kasaba();if(town>.05){
 g.setTransform(S,0,0,S,0,0);
 for(let s=0;s<2;s++){const span=640+s*180,off=((cam.x*f*(1+s*.15)+s*300)%span+span)%span,y0=-8+s*20-Math.min(0,cam.y)*0;
  for(let q=-1;q<vw/span+1;q++){const x0=q*span-off,x1=x0+span;g.strokeStyle='rgba(40,30,60,.55)';g.lineWidth=1.3;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2,y0+70,x1,y0);g.stroke();
   for(let j=1;j<16;j++){const u=j/16,x=lerp(x0,x1,u),y=y0+140*u*(1-u)*1,sw=Math.sin(tm*1.8+j+q*3)*3,ci=((j+q*5+s)%6+6)%6,col=R6>.5?DN6_FLAG[ci]:dn6FlagDim(ci,R6);
    g.globalAlpha=town*(.8+.2*R6);g.fillStyle=col;g.beginPath();g.moveTo(x-9,y);g.lineTo(x+9,y);g.lineTo(x+sw,y+22);g.closePath();g.fill();}}}
 g.globalAlpha=1;}
 // altta yakın çiçekli çalılar (paralaks 1,08), Feza'nın üstüne gelince saydamlaşır
 const fb=1.08,left=cam.x*fb-160,right=cam.x*fb+vw+160,px=(Number.isFinite(P.rx)?P.rx:P.x);g.setTransform(S,0,0,S,-cam.x*S*fb,0);
 for(let q=Math.floor(left/620);q<=Math.ceil(right/620);q++){const R=rng(q*71+883),x=q*620+R()*160,wx=x/fb;if(wx>DN6_GAP0-100&&wx<DN6_GAP1+100)continue;const near=Math.abs(wx-px)<160,k=.5+R()*.25;
  g.save();g.translate(x,vh+38);g.rotate(Math.sin(tm*.35+q)*.02);g.globalAlpha=near?.18:.62;g.drawImage(dn6BushArt(Math.abs(q)%2),-140*k*1.6,-150*k*1.6,280*k*1.6,150*k*1.6);g.restore();}
 g.globalAlpha=1;
}
const DN6_FLAG_DIM=[];
function dn6FlagDim(ci,r){const q=Math.round(r*4);const k=ci*5+q;if(!DN6_FLAG_DIM[k])DN6_FLAG_DIM[k]=dn6Mix(DN6_FLAG[ci],'#3a3266',.62*(1-q/4));return DN6_FLAG_DIM[k];}
function dn6Vignette(){if(!dn6Ready())return;dn6Sky();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(DN6.vig,0,0,W,H);}
// ── Isıtma: önbellekleri kareye yayarak hazırla (oyun.js omIsit her karede true dönene kadar çağırır) ──
function dn6Isit(){
 if(!dn6Ready())return false;dn6Sky();dn6Yapilar();const p=DN6.prep;
 if(p<6){dn6Strip(p>>1,p&1);DN6.prep++;return false;}
 if(p===6){dn6CastleArt();DN6.prep++;return false;}
 if(p<10){dn6CloudArt(p-7);DN6.prep++;return false;}
 if(p<14){dn6Chunk(p-10);DN6.prep++;return false;}
 if(p<16){dn6BushArt(p-14);DN6.prep++;return false;}
 if(p<28){dn6Bulb((p-16)>>1,(p-16)&1);DN6.prep++;return false;}
 if(p<28+DN6_GLOWS.length){glow(DN6_GLOWS[p-28]);DN6.prep++;return false;}
 if(p<28+DN6_GLOWS.length+DN6_FLAG.length){glow(DN6_FLAG[p-28-DN6_GLOWS.length]);DN6.prep++;return false;}
 DN6.warm=true;return true;
}

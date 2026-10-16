/* anka.js — Yanardağın dostu: kat kat kâğıt tüyler, altın yüz ve uzun kor kuyruğu.
   Çizim yalnız önbellek parçalarını oynatır; oyun durumu, fizik veya ses değiştirmez. */
'use strict';
const ANKA={
 art:[],warm:0,hazir:false,
 izSag:Object.freeze([{x:22,y:-35},{x:86,y:-93},{x:160,y:-112},{x:223,y:-76},{x:248,y:-15}]),
 isit(){if(this.warm<8){an5Art(this.warm++);return false;}this.hazir=true;return true;},
 ciz(ctx,x,y,size,tm,opt){an5Draw(ctx,x,y,size,tm,opt);}
};
const AN5_PI=Math.PI*2;
function an5Canvas(w,h){const c=document.createElement('canvas');c.width=w*2;c.height=h*2;const q=c.getContext('2d');q.scale(2,2);q.lineCap='round';q.lineJoin='round';return {c,q};}
function an5Path(q,p){q.beginPath();for(let j=0;j<p.length;j++)j?q.lineTo(p[j][0],p[j][1]):q.moveTo(p[j][0],p[j][1]);q.closePath();}
function an5Feather(q,x,y,tx,ty,w,pale,variant){
 const dx=tx-x,dy=ty-y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,gr=q.createLinearGradient(x,y,tx,ty);
 gr.addColorStop(0,pale?'#c6d9d0':'#79254f');gr.addColorStop(.29,pale?'#e2e8d8':variant?'#bb3563':'#cc3859');gr.addColorStop(.61,pale?'#f1e9ce':variant?'#f0715a':'#ed6645');gr.addColorStop(.85,pale?'#fff0ce':'#f8b75b');gr.addColorStop(1,pale?'#fff8e2':'#ffdf8a');q.fillStyle=gr;q.strokeStyle=pale?'#639a99':'#7b3657';q.lineWidth=.85;
 q.beginPath();q.moveTo(x,y);q.bezierCurveTo(x+dx*.25+nx*w,y+dy*.25+ny*w,tx+nx*w*.55-dx*.14,ty+ny*w*.55-dy*.14,tx,ty);q.bezierCurveTo(tx-nx*w*.45-dx*.15,ty-ny*w*.45-dy*.15,x+dx*.38-nx*w*.72,y+dy*.38-ny*w*.72,x,y);q.fill();q.stroke();
 q.fillStyle=pale?'rgba(255,250,225,.43)':'rgba(255,221,150,.17)';q.beginPath();q.moveTo(x,y);q.bezierCurveTo(x+dx*.25+nx*w,y+dy*.25+ny*w,tx+nx*w*.55-dx*.14,ty+ny*w*.55-dy*.14,tx,ty);q.lineTo(x,y);q.fill();
 q.strokeStyle=pale?'#fff4d7':'#ffd190';q.lineWidth=.7;q.beginPath();q.moveTo(x,y);q.quadraticCurveTo(x+dx*.55+nx*w*.08,y+dy*.55+ny*w*.08,tx-dx*.045,ty-dy*.045);q.stroke();
 q.strokeStyle=pale?'rgba(71,136,137,.25)':'rgba(111,43,78,.3)';q.lineWidth=.5;for(let j=2;j<7;j++){const u=j/8,bw=Math.sin(u*Math.PI)*w*.62,px=x+dx*u,py=y+dy*u;q.beginPath();q.moveTo(px+nx*bw-dx*.035,py+ny*bw-dy*.035);q.lineTo(px,py);q.lineTo(px-nx*bw*.65+dx*.035,py-ny*bw*.65+dy*.035);q.stroke();}
}
function an5Wing(pale,far){
 const a=an5Canvas(280,210),q=a.q;q.translate(16,95);
 const gr=q.createLinearGradient(0,-30,210,15);gr.addColorStop(0,pale?'#bbd5cb':far?'#74295f':'#a72c58');gr.addColorStop(.45,pale?'#e4ead5':far?'#b74384':'#e75d54');gr.addColorStop(1,pale?'#fff0cf':'#f6c06c');q.fillStyle=gr;q.strokeStyle=pale?'#609594':'#79304e';q.lineWidth=1.2;
 q.beginPath();q.moveTo(0,0);q.bezierCurveTo(15,-18,32,-45,49,-53);q.quadraticCurveTo(59,-64,67,-58);q.bezierCurveTo(89,-73,116,-82,138,-77);q.quadraticCurveTo(156,-75,166,-64);q.bezierCurveTo(190,-56,203,-39,208,-24);q.quadraticCurveTo(220,-7,226,20);q.bezierCurveTo(208,10,181,-13,155,-28);q.quadraticCurveTo(112,-29,87,-23);q.quadraticCurveTo(41,-9,0,20);q.closePath();q.fill();q.stroke();
 const tips=[[226,20],[214,44],[192,62],[166,76],[141,78],[115,70],[89,57],[65,41]];
 for(let i=0;i<tips.length;i++){const t=tips[i],rootX=173-i*18.8,rootY=-34-Math.sin(i/7*Math.PI)*10+i*2.8;an5Feather(q,rootX,rootY,t[0],t[1],17.8-i*.3,pale,(i+far)%2);}
 // The shoulder coverts are separate overlapping paper folds, not one flat wing.
 for(let row=1;row>=0;row--)for(let j=0;j<6;j++){
  const x=25+j*25+row*9,y=-28-Math.sin(j/6*Math.PI)*32+row*14,tx=x+15+row*3,ty=y+34+row*7;
  an5Feather(q,x,y,tx,ty,10.5+row*1.1,pale,(j+row+far)%2);
 }
 q.strokeStyle=pale?'#fff2d8':'#ffe0a0';q.lineWidth=1.15;q.beginPath();q.moveTo(1,-2);q.bezierCurveTo(24,-33,44,-53,64,-58);q.bezierCurveTo(90,-76,115,-80,138,-77);q.bezierCurveTo(168,-72,189,-55,201,-41);q.stroke();
 return a.c;
}
function an5Art(i){
 if(ANKA.art[i])return ANKA.art[i];let a,q;
 if(i===0||i===1||i===2){ANKA.art[i]=an5Wing(i===2,i===1?1:0);return ANKA.art[i];}
 if(i===3){
  a=an5Canvas(150,210);q=a.q;q.translate(75,132);
  const gr=q.createLinearGradient(-35,-84,34,44);gr.addColorStop(0,'#b13a5d');gr.addColorStop(.3,'#e36951');gr.addColorStop(.7,'#f5a65a');gr.addColorStop(1,'#9f3453');q.fillStyle=gr;q.strokeStyle='#712d4c';q.lineWidth=1.4;q.beginPath();q.moveTo(0,-101);q.bezierCurveTo(-25,-96,-34,-48,-33,-16);q.bezierCurveTo(-36,16,-15,40,0,46);q.bezierCurveTo(21,39,37,12,33,-16);q.bezierCurveTo(32,-50,22,-94,0,-101);q.fill();q.stroke();
  q.fillStyle='#f7ca81';q.beginPath();q.moveTo(0,-85);q.bezierCurveTo(-20,-67,-21,-17,-19,5);q.bezierCurveTo(-16,25,-6,32,0,34);q.bezierCurveTo(10,26,22,9,20,-8);q.bezierCurveTo(19,-40,14,-74,0,-85);q.fill();
  for(let row=0;row<6;row++)for(let s=-1;s<=1;s++){const xx=s*(9+row*.5),yy=-65+row*15;q.strokeStyle=row%2?'#e7a364':'#d67d58';q.lineWidth=.8;q.beginPath();q.moveTo(xx-6,yy);q.quadraticCurveTo(xx,yy+9,xx+6,yy);q.stroke();}
  q.strokeStyle='rgba(255,233,181,.68)';q.lineWidth=1;q.beginPath();q.moveTo(-9,-87);q.bezierCurveTo(-28,-56,-27,-13,-16,10);q.stroke();
 }else if(i===4){
  a=an5Canvas(120,150);q=a.q;q.translate(60,107);
  // Five curved crown plumes establish the unmistakable phoenix silhouette.
  for(let j=0;j<5;j++){const xx=(j-2)*7,tx=(j-2)*15,ty=-69+Math.abs(j-2)*7;an5Feather(q,xx,-19,tx,ty,5.7,false,j%2);}
  q.fillStyle='#b94258';q.strokeStyle='#78304f';q.lineWidth=1.2;q.beginPath();q.moveTo(0,-35);q.bezierCurveTo(-29,-33,-30,-6,-22,11);q.bezierCurveTo(-16,29,-5,35,0,37);q.bezierCurveTo(7,33,23,25,25,9);q.bezierCurveTo(31,-11,22,-32,0,-35);q.fill();q.stroke();
  const fa=q.createLinearGradient(-18,-23,17,28);fa.addColorStop(0,'#fff5d7');fa.addColorStop(.6,'#ffe0a0');fa.addColorStop(1,'#edb276');q.fillStyle=fa;q.beginPath();q.moveTo(0,-25);q.bezierCurveTo(-18,-25,-21,-7,-15,7);q.quadraticCurveTo(-7,23,0,25);q.quadraticCurveTo(10,20,17,5);q.bezierCurveTo(23,-9,17,-25,0,-25);q.fill();
  q.fillStyle='#e28b47';q.strokeStyle='#a25345';q.lineWidth=.65;an5Path(q,[[0,1],[7,6],[0,18],[-6,6]]);q.fill();q.stroke();q.fillStyle='#ffe2a1';an5Path(q,[[0,2],[0,13],[-4,6]]);q.fill();
  q.fillStyle='rgba(229,134,133,.55)';q.beginPath();q.ellipse(-16,5,5,2.7,.1,0,AN5_PI);q.ellipse(17,5,5,2.7,-.1,0,AN5_PI);q.fill();
  q.strokeStyle='rgba(255,241,199,.72)';q.lineWidth=.8;q.beginPath();q.moveTo(-20,-16);q.quadraticCurveTo(-26,-1,-18,13);q.stroke();
 }else if(i===5||i===6){
  a=an5Canvas(62,260);q=a.q;q.translate(31,13);an5Feather(q,0,0,i===5?13:-10,232,i===5?19:15,false,i%2);
  // A flame-shaped gold eye is a feather marking, never a flashing light.
  q.fillStyle='#ffdf8a';q.beginPath();q.moveTo(10,175);q.bezierCurveTo(-4,189,-5,208,10,221);q.bezierCurveTo(25,207,26,190,10,175);q.fill();q.fillStyle='#f39158';q.beginPath();q.moveTo(10,186);q.quadraticCurveTo(-1,205,10,214);q.quadraticCurveTo(21,204,10,186);q.fill();q.strokeStyle='#ffe9af';q.lineWidth=.7;q.beginPath();q.moveTo(10,181);q.quadraticCurveTo(-4,203,10,219);q.stroke();
 }else{
  a=an5Canvas(260,260);q=a.q;const h=q.createRadialGradient(130,130,8,130,130,125);h.addColorStop(0,'rgba(255,201,112,.28)');h.addColorStop(.45,'rgba(239,123,84,.11)');h.addColorStop(1,'rgba(228,91,104,0)');q.fillStyle=h;q.fillRect(0,0,260,260);
 }
 ANKA.art[i]=a.c;return a.c;
}
function an5DrawWing(q,side,tm,open,material,still,far){
 const flap=still?0:Math.sin(tm*2.05+(far?.22:0))*.065,fold=(1-open)*1.04;
 q.save();q.translate(side*22,-35);q.scale(side,1);q.rotate(fold+flap*(.35+open*.65));q.scale(.26+open*.74,.9+open*.1);
 if(material<.999){q.globalAlpha*=.37+(1-material)*.16;q.drawImage(an5Art(2),-16,-95,280,210);q.globalAlpha/= .37+(1-material)*.16;}
 if(material>.001){q.save();if(material<.999){q.beginPath();q.rect(-18,-98,280*material,212);q.clip();}q.drawImage(an5Art(far?1:0),-16,-95,280,210);q.restore();}q.restore();
}
function an5Draw(q,x,y,size,tm,opt){
 if(!q||!Number.isFinite(x)||!Number.isFinite(y)||!(size>0)||!Number.isFinite(tm))return;opt=opt||{};const alpha=Number.isFinite(opt.alpha)?clamp(opt.alpha,0,1):1;if(alpha<.002)return;
 const pose=opt.pose||'glide',still=pose==='trace'||!!opt.sabit,asleep=Number.isFinite(opt.uyku)?clamp(opt.uyku,0,1):pose==='sleep'?1:0,joy=clamp(opt.joy||0,0,1),open=Number.isFinite(opt.kanatAc)?clamp(opt.kanatAc,0,1):pose==='perch'||pose==='sleep'?.13:pose==='lift'?.94:.88,right=Number.isFinite(opt.kanatSag)?clamp(opt.kanatSag,0,1):1,face=opt.face<0?-1:1;
 q.save();q.translate(x,y);q.scale(size*face,size);q.globalAlpha*=alpha;
 q.save();q.globalAlpha*=.6+joy*.2;q.drawImage(an5Art(7),-150,-175,300,300);q.restore();
 // Long pennants are articulated independently, with no particle simulation.
 for(let i=0;i<7;i++){const sd=i-3,sway=still?0:Math.sin(tm*1.35-i*.43)*.042,short=1-Math.abs(sd)*.095,trail=pose==='glide'?.92:pose==='lift'?.46:0;q.save();q.translate(sd*4,26);q.rotate(trail-sd*.105+sway);q.scale(.65+short*.25,(.65+short*.32)*(asleep?.77:1));q.drawImage(an5Art(i%2?6:5),-31,-13,62,260);q.restore();}
 an5DrawWing(q,-1,tm,open,1,still,true);an5DrawWing(q,1,tm,open,right,still,false);
 // Copper feet tuck into the plumage during flight, and gently grasp a perch.
 q.strokeStyle='#c88756';q.lineWidth=3;for(let s=-1;s<=1;s+=2){const fx=s*17,fy=48+(1-open)*8;q.beginPath();q.moveTo(s*15,30);q.quadraticCurveTo(s*18,40,fx,fy);q.lineTo(fx+s*8,fy+3);q.moveTo(fx,fy);q.lineTo(fx-s*6,fy+5);q.stroke();q.strokeStyle='#ffe0a0';q.lineWidth=.85;q.beginPath();q.moveTo(s*15,33);q.lineTo(fx,fy);q.stroke();q.strokeStyle='#c88756';q.lineWidth=3;}
 q.drawImage(an5Art(3),-75,-132,150,210);
 const headTilt=-.075+(still?0:Math.sin(tm*.72)*.025+joy*.045),hy=-108+asleep*12;
 q.save();q.translate(3,hy);q.rotate(headTilt);q.drawImage(an5Art(4),-60,-107,120,150);
 const blink=asleep>.6?1:Math.pow(Math.max(0,Math.cos(tm*.69+.5)),36),eyeH=(1-blink)*(1-asleep)*4.6;q.fillStyle='#503b51';
 for(let s=-1;s<=1;s+=2){const ex=s*10.5;if(eyeH>.9){q.beginPath();q.ellipse(ex,-5,3.35,eyeH,0,0,AN5_PI);q.fill();q.fillStyle='#fff5db';q.beginPath();q.arc(ex-s*.8,-6.7,1.15,0,AN5_PI);q.fill();q.fillStyle='#503b51';}else{q.strokeStyle='#674856';q.lineWidth=1.45;q.beginPath();q.moveTo(ex-4,-4);q.quadraticCurveTo(ex,-1,ex+4,-4);q.stroke();}}
 q.restore();q.restore();
}

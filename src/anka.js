/* anka.js — Yanardağın dostu: kat kat kâğıt tüyler, altın yüz ve uzun kor kuyruğu.
   Çizim yalnız önbellek parçalarını oynatır; oyun durumu, fizik veya ses değiştirmez. */
'use strict';
const ANKA={
 art:[],warm:0,hazir:false,
 izSag:Object.freeze([{x:22,y:-35},{x:82,y:-76},{x:143,y:-99},{x:204,y:-102},{x:259,y:-79}]),
 isit(){if(this.warm<12){an5Art(this.warm++);return false;}this.hazir=true;return true;},
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
function an5Wing(pale,far,outer){
 const a=an5Canvas(310,260),q=a.q;q.translate(20,145);
 // A bent shoulder and a long, separate hand give the wing its living shape.
 // Primary tips are unequal and swept back; air remains between their ends.
 if(outer){
  const tips=[[232,-112],[251,-82],[259,-43],[249,-1],[229,38],[201,67],[168,79]];
  for(let i=tips.length-1;i>=0;i--){const p=tips[i];an5Feather(q,110+i*3.2,-62+i*4.8,p[0],p[1],14.5+i*.85,pale,(i+far)%2);}
  for(let j=4;j>=0;j--){const x=107+j*14,y=-65+j*3.2;an5Feather(q,x,y,x+48+j*2,y+13+j*6,11,pale,(j+far)%2);}
  q.strokeStyle=pale?'#fff2d8':'#ffe0a0';q.lineWidth=1.05;q.beginPath();q.moveTo(112,-63);q.bezierCurveTo(147,-71,185,-76,222,-66);q.stroke();
 }else{
  const gr=q.createLinearGradient(0,-22,150,10);gr.addColorStop(0,pale?'#b4cfc6':far?'#752d64':'#a33460');gr.addColorStop(.49,pale?'#e4ead5':far?'#ab4b83':'#e47361');gr.addColorStop(1,pale?'#fff0cf':'#f6c06c');q.fillStyle=gr;q.strokeStyle=pale?'#609594':'#79304e';q.lineWidth=1.1;
  q.beginPath();q.moveTo(-1,6);q.bezierCurveTo(22,-7,36,-35,58,-44);q.bezierCurveTo(82,-57,99,-65,124,-65);q.quadraticCurveTo(149,-64,157,-45);q.quadraticCurveTo(140,-24,112,-7);q.bezierCurveTo(86,7,43,31,8,30);q.closePath();q.fill();q.stroke();
  for(let j=6;j>=0;j--){const x=26+j*15,y=-12-j*6.1,tx=45+j*17.3,ty=48+Math.sin(j*.4)*23;an5Feather(q,x,y,tx,ty,12.3+j*.55,pale,(j+far)%2);}
  // Two overlapping diagonal rows are shoulder coverts, with their own bends.
  for(let row=1;row>=0;row--)for(let j=0;j<6;j++){
   const x=14+j*20+row*6,y=-7-j*8.2+row*13;an5Feather(q,x,y,x+29+row*5,y+20+row*7,9+row*1.6,pale,(j+row+far)%2);
  }
  q.strokeStyle=pale?'#fff2d8':'#ffe0a0';q.lineWidth=1.1;q.beginPath();q.moveTo(2,-1);q.bezierCurveTo(25,-9,37,-34,60,-41);q.bezierCurveTo(80,-53,102,-63,123,-64);q.stroke();
 }
 return a.c;
}
function an5Art(i){
 if(ANKA.art[i])return ANKA.art[i];let a,q;
 if(i===0||i===1||i===2||i>=8&&i<=10){const v=i>=8?i-8:i;ANKA.art[i]=an5Wing(v===2,v===1?1:0,i>=8);return ANKA.art[i];}
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
 }else if(i===7){
  a=an5Canvas(260,260);q=a.q;const h=q.createRadialGradient(130,130,8,130,130,125);h.addColorStop(0,'rgba(255,201,112,.28)');h.addColorStop(.45,'rgba(239,123,84,.11)');h.addColorStop(1,'rgba(228,91,104,0)');q.fillStyle=h;q.fillRect(0,0,260,260);
 }else{
  a=an5Canvas(26,26);q=a.q;const h=q.createRadialGradient(13,13,0,13,13,12);h.addColorStop(0,'rgba(255,244,195,.9)');h.addColorStop(.23,'rgba(255,208,129,.57)');h.addColorStop(1,'rgba(255,187,104,0)');q.fillStyle=h;q.fillRect(0,0,26,26);
 }
 ANKA.art[i]=a.c;return a.c;
}
function an5WingLayer(q,outer,material,far){
 const offset=outer?8:0;
 if(material<.999){q.save();q.globalAlpha*=.45+(1-material)*.12;q.drawImage(an5Art(offset+2),-20,-145,310,260);q.restore();}
 if(material>.001){q.save();if(material<.999){q.beginPath();q.rect(-22,-147,312*material,264);q.clip();}q.drawImage(an5Art(offset+(far?1:0)),-20,-145,310,260);q.restore();}
}
function an5DrawWing(q,side,tm,open,material,still,far){
 const phase=tm*2.05+(far?.2:0),flap=still?0:Math.sin(phase)*(.025+open*.11),fold=(1-open),wrist=still?0:Math.sin(phase-.72)*open*.09;
 q.save();q.translate(side*22,-35);q.scale(side,1);q.rotate(fold*.92+flap);q.scale(.34+open*.66,.9+open*.1);
 q.save();q.translate(116,-60);q.rotate(fold*.55+wrist);q.scale(.8+open*.2,1);q.translate(-116,60);an5WingLayer(q,true,material,far);q.restore();
 an5WingLayer(q,false,material,far);q.restore();
}
function an5FeatherDust(q,x,y,size,face,tm,open,joy){
 // Twelve analytic specks are the feather's own warm pigment, never a fire
 // emitter. Their short lives and soft edges leave face and play targets clear.
 const player=typeof P!=='undefined'&&Number.isFinite(P.x)&&Number.isFinite(P.y),alpha=q.globalAlpha;
 q.save();
 for(let i=0;i<12;i++){
  const u=(tm*(.16+i%3*.014)+i*.381966)%1,sd=i%2?1:-1,wing=i<8,px=wing?sd*(145+u*94)*(.45+open*.55):sd*(8+u*37),py=wing?-16+u*85-open*37:117+u*112;
  let a=Math.sin(u*Math.PI)*(.13+joy*.12);
  if(player){const dx=(x+px*size*face-P.x)/63,dy=(y+py*size-(P.y-31))/78;if(dx*dx+dy*dy<1)a*=.15;}
  const r=3.2+(i%3)*.65;q.globalAlpha=alpha*a;q.drawImage(an5Art(11),px-r,py-r,r*2,r*2);
 }
 q.restore();
}
function an5Draw(q,x,y,size,tm,opt){
 if(!q||!Number.isFinite(x)||!Number.isFinite(y)||!(size>0)||!Number.isFinite(tm))return;opt=opt||{};const alpha=Number.isFinite(opt.alpha)?clamp(opt.alpha,0,1):1;if(alpha<.002)return;
 const pose=opt.pose||'glide',still=pose==='trace'||!!opt.sabit,asleep=Number.isFinite(opt.uyku)?clamp(opt.uyku,0,1):pose==='sleep'?1:0,joy=clamp(opt.joy||0,0,1),open=Number.isFinite(opt.kanatAc)?clamp(opt.kanatAc,0,1):pose==='perch'||pose==='sleep'?.13:pose==='lift'?.94:.88,right=Number.isFinite(opt.kanatSag)?clamp(opt.kanatSag,0,1):1,face=opt.face<0?-1:1;
 q.save();q.translate(x,y);q.scale(size*face,size);q.globalAlpha*=alpha;
 q.save();q.globalAlpha*=.6+joy*.2;q.drawImage(an5Art(7),-150,-175,300,300);q.restore();
 // Long pennants are articulated independently, with no particle simulation.
 for(let i=0;i<7;i++){const sd=i-3,sway=still?0:Math.sin(tm*1.35-i*.46)*.067+Math.sin(tm*.61+i*.7)*.014,short=1-Math.abs(sd)*.095,trail=pose==='glide'?.92:pose==='lift'?.46:0;q.save();q.translate(sd*4,26);q.rotate(trail-sd*.112+sway);q.scale(.65+short*.25,(.65+short*.32)*(asleep?.77:1)*(1+(still?0:Math.sin(tm*1.35-i*.46)*.013)));q.drawImage(an5Art(i%2?6:5),-31,-13,62,260);q.restore();}
 an5DrawWing(q,-1,tm,open,1,still,true);an5DrawWing(q,1,tm,open,right,still,false);
 if(!still&&asleep<.2)an5FeatherDust(q,x,y,size,face,tm,open,joy);
 // Copper feet tuck into the plumage during flight, and gently grasp a perch.
 q.strokeStyle='#c88756';q.lineWidth=3;for(let s=-1;s<=1;s+=2){const fx=s*17,fy=48+(1-open)*8;q.beginPath();q.moveTo(s*15,30);q.quadraticCurveTo(s*18,40,fx,fy);q.lineTo(fx+s*8,fy+3);q.moveTo(fx,fy);q.lineTo(fx-s*6,fy+5);q.stroke();q.strokeStyle='#ffe0a0';q.lineWidth=.85;q.beginPath();q.moveTo(s*15,33);q.lineTo(fx,fy);q.stroke();q.strokeStyle='#c88756';q.lineWidth=3;}
 q.drawImage(an5Art(3),-75,-132,150,210);
 const headTilt=-.075+(still?0:Math.sin(tm*.72)*.025+joy*.045),hy=-108+asleep*12;
 q.save();q.translate(3,hy);q.rotate(headTilt);q.drawImage(an5Art(4),-60,-107,120,150);
 const blink=asleep>.6?1:Math.pow(Math.max(0,Math.cos(tm*.69+.5)),36),eyeH=(1-blink)*(1-asleep)*4.6;q.fillStyle='#503b51';
 for(let s=-1;s<=1;s+=2){const ex=s*10.5;if(eyeH>.9){q.beginPath();q.ellipse(ex,-5,3.35,eyeH,0,0,AN5_PI);q.fill();q.fillStyle='#fff5db';q.beginPath();q.arc(ex-s*.8,-6.7,1.15,0,AN5_PI);q.fill();q.fillStyle='#503b51';}else{q.strokeStyle='#674856';q.lineWidth=1.45;q.beginPath();q.moveTo(ex-4,-4);q.quadraticCurveTo(ex,-1,ex+4,-4);q.stroke();}}
 q.restore();q.restore();
}

/* dunya5.js — Uyuyan Yanardağ: katmanlı kâğıt peyzaj, mürekkep mavisi bazalt,
   altın mercan lav ve sıcak ışık bahçeleri. Büyük resimler yalnız önbellekte boyanır. */
'use strict';
const DN5={sky:null,heartSky:null,vig:null,atlas:[],blooms:[],mount:[],falls:[],walls:[],molten:[],rocks:[],relics:[],chunks:new Map(),prep:0,finT:null,finX:0,last:-1,life:[],warm:false,mx0:0,my0:0,mk:1,ankaT:null,riverBloom:[]};
const DN5_COL=['#cf2458','#d58057','#4d9d91','#7546ad','#ac267d','#338f9a','#8739ac','#cc4969'];
// Kristal/tekne modülleri daha sonra yüklenir; ilk dokunuşta yeni ışık tuvali açılmaz.
const DN5_TOUCH_GLOWS=['#ffd8a8','#ffc065','#f56d98','#b67be3','#58d2c6','#ffdc79','#ffbf58','#fa6684','#b87be4','#53d6c8','#ffdb72','#ffb58c','#ffc994','#ffe0af','#ffb48e'];
const DN5_FALL_COLS=[30,75,127,153,211,286,449,474,531,580],DN5_BLOOM_COLS=[.5,24,44,82,119,148,197,239,283,439,473,513,544,589];
const DN5_LANDMARKS=[88,215,457,547];
const DN5_PAR_F=[.06,.13,.24],DN5_PAR_STEP=[710,540,420],DN5_PAR_BASE=[660,730,780],DN5_PAR_ALPHA=[.48,.5,.65];
const DN5_RIVERS=[
 [337,109,322,166,292,173,294,232,292,282,229,319,185,408],
 [350,111,343,172,363,199,350,254,336,309,317,345,305,449],
 [370,111,391,164,389,219,421,258,465,311,453,351,510,437],
 [388,115,410,181,445,223,456,274,475,322,547,345,579,422]
];
const DN5_RP={x:0,y:0,dx:0,dy:0};
const DN5_WALL_Q=[42,-10,29,155,66,212,54,318,38,427,88,503,83,610];
const dn5EruptR=rng(87297),DN5_BOMBS=Array.from({length:18},(_,i)=>({phase:dn5EruptR()*6.283,offset:i/18*5.8+dn5EruptR()*.12,period:5.5+dn5EruptR()*.8,duration:2.8+dn5EruptR()*.8,launch:(dn5EruptR()-.5)*35,reach:(i%2?1:-1)*(22+dn5EruptR()*93),height:38+dn5EruptR()*42,land:35+dn5EruptR()*100,size:1.8+dn5EruptR()*2.1,kind:i%2}));
const dn5Cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const dn5Mix=(a,b,t)=>{const A=hex(a),B=hex(b);return '#'+A.map((v,i)=>Math.round(lerp(v,B[i],t)).toString(16).padStart(2,'0')).join('');};
function dn5Ready(){return W>0&&H>0&&S>0&&typeof cam!=='undefined'&&Number.isFinite(cam.x)&&Number.isFinite(cam.y);}
function dn5Glow(col,x,y,rx,ry,a){if(a<=.003)return;g.globalAlpha=a;g.drawImage(glow(col),x-rx,y-ry,rx*2,ry*2);g.globalAlpha=1;}
function dn5Biome(x){return x<120*T?0:x<235*T?1:x<300*T?2:x<425*T?3:4;}
function dn5Surface(x){const c=Math.max(0,Math.min(COLS-1,Math.floor(x/T)));return topOf(c)*T;}
function dn5RiverPoint(q,u,out){
 const b=u<.5?0:6,t=u<.5?u*2:(u-.5)*2,v=1-t;
 out.x=v*v*v*q[b]+3*v*v*t*q[b+2]+3*v*t*t*q[b+4]+t*t*t*q[b+6];out.y=v*v*v*q[b+1]+3*v*v*t*q[b+3]+3*v*t*t*q[b+5]+t*t*t*q[b+7];
 out.dx=3*v*v*(q[b+2]-q[b])+6*v*t*(q[b+4]-q[b+2])+3*t*t*(q[b+6]-q[b+4]);out.dy=3*v*v*(q[b+3]-q[b+1])+6*v*t*(q[b+5]-q[b+3])+3*t*t*(q[b+7]-q[b+5]);return out;
}
function dn5PaintChannel(c,q,index,gradient){
 // This variable-width, branching channel is painted once. Uneven mineral
 // banks and cooled islands make molten rock read differently from ribbon.
 const xs=[],ys=[],ws=[],nsx=[],nsy=[];for(let j=0;j<=34;j++){const u=j/34,p=dn5RiverPoint(q,u,DN5_RP),d=Math.hypot(p.dx,p.dy)||1;xs.push(p.x);ys.push(p.y);ws.push((index===1?10.2:7.7)*(.63+Math.sin(u*Math.PI)*.48)*(1+.21*Math.sin(u*27+index*2)));nsx.push(-p.dy/d);nsy.push(p.dx/d);}
 const shape=pad=>{c.beginPath();for(let j=0;j<xs.length;j++){const x=xs[j]+nsx[j]*(ws[j]+pad),y=ys[j]+nsy[j]*(ws[j]+pad);j?c.lineTo(x,y):c.moveTo(x,y);}for(let j=xs.length-1;j>=0;j--)c.lineTo(xs[j]-nsx[j]*(ws[j]+pad),ys[j]-nsy[j]*(ws[j]+pad));c.closePath();};
 shape(4);c.fillStyle='rgba(38,25,52,.72)';c.fill();shape(1.7);c.fillStyle='#b84c60';c.fill();shape(0);c.fillStyle=gradient;c.fill();
 c.lineCap='round';c.strokeStyle='rgba(255,222,146,.78)';c.lineWidth=1.2;c.beginPath();for(let j=0;j<xs.length;j++){const off=Math.sin(j*.63+index)*ws[j]*.25;j?c.lineTo(xs[j]+off,ys[j]):c.moveTo(xs[j]+off,ys[j]);}c.stroke();
 for(let j=6;j<xs.length-1;j+=4){const w=ws[j],x=xs[j],y=ys[j],n=nsx[j],m=nsy[j],side=j%8?1:-1;c.fillStyle=j%3?'#713d5c':'#91445d';c.beginPath();c.moveTo(x+n*w*side,y+m*w*side);c.lineTo(x+n*w*.1,y+m*w*.1+2);c.lineTo(x-n*w*.25,y-m*w*.25+6);c.lineTo(x+n*w*side,y+m*w*side+10);c.closePath();c.fill();}
}
function dn5MoltenArt(kind){
 if(DN5.molten[kind])return DN5.molten[kind];const cv=dn5Cv(64,96),c=cv.getContext('2d'),R=rng(9833+kind*91),gr=c.createLinearGradient(12,16,49,79);
 gr.addColorStop(0,'#ffe0a0');gr.addColorStop(.25,'#ffb64e');gr.addColorStop(.57,'#ef6837');gr.addColorStop(1,'#8d2b4b');c.fillStyle=gr;c.beginPath();c.moveTo(31,5);c.bezierCurveTo(26,23,9,39,14,60);c.bezierCurveTo(9,77,25,91,36,86);c.bezierCurveTo(53,83,56,62,48,45);c.bezierCurveTo(46,27,37,18,31,5);c.fill();
 c.fillStyle=kind?'#65344f':'#a74448';c.beginPath();c.moveTo(15,51);c.lineTo(27,57);c.lineTo(35,46);c.lineTo(47,41);c.lineTo(51,62);c.lineTo(43,78);c.lineTo(31,85);c.lineTo(16,72);c.lineTo(22,63);c.closePath();c.fill();
 c.fillStyle='#ffd183';c.beginPath();c.moveTo(28,22);c.bezierCurveTo(20,42,23,50,29,53);c.bezierCurveTo(34,47,32,34,28,22);c.fill();c.strokeStyle='#ffae50';c.lineWidth=1.1;c.beginPath();c.moveTo(17,54);c.lineTo(27,61);c.lineTo(30,75);c.moveTo(27,61);c.lineTo(38,57);c.lineTo(46,64);c.stroke();
 for(let j=0;j<15;j++){const x=22+R()*20,y=54+R()*22;c.fillStyle=j%3?'rgba(239,133,78,.27)':'rgba(37,26,54,.3)';c.fillRect(x,y,1+R()*2,1+R()*2);}DN5.molten[kind]=cv;return cv;
}
function dn5VolcanoActivity(tm,inside){
 const opacity=1-inside;if(opacity<.01)return;const k=DN5.mk,cx=DN5.mx0+355*k,cy=DN5.my0+109*k,vh=H/S,css=DPR/S,breath=.82+.18*Math.sin(tm*.69),loft=css*1.45;
 g.setTransform(S,0,0,S,0,0);g.lineCap='round';
 // A small living molten lake is continuously fed by three quiet fountains.
 // There is no explosion, shake, light flash, collision or connection to Feza.
 g.globalAlpha=opacity;g.fillStyle='#f77939';g.beginPath();g.ellipse(cx,cy,32*k,3.8*k*(.95+.1*breath),0,0,6.283);g.fill();g.fillStyle='#ffb24e';g.beginPath();g.ellipse(cx-3*k,cy-.8*k,23*k*breath,2.1*k,0,0,6.283);g.fill();
 for(let j=0;j<3;j++){
  const sx=cx+(j-1)*11*k,lean=((j-1)*4+Math.sin(tm*.47+j*1.9)*2.7)*k,hh=(j===1?47:j===0?30:37)*loft*(.9+.11*Math.sin(tm*.53+j*1.7)+.04*Math.cos(tm*.31+j)),ww=(j===1?6.5:4.7)*Math.min(k,1.8);
  // Unequal, tapered molten upwellings; no rounded return arch or pipe outline.
  // The separate ballistic droplets provide the outward eruption and descent.
  g.globalAlpha=opacity*.96;g.fillStyle=j===1?'#f57938':'#e9653e';g.beginPath();g.moveTo(sx-ww,cy+k);g.lineTo(sx-ww*.65,cy-hh*.24);g.lineTo(sx+lean*.45-ww*.28,cy-hh*.44);g.lineTo(sx+lean*.45-ww*.7,cy-hh*.53);g.lineTo(sx+lean*.8,cy-hh*.71);g.lineTo(sx+lean,cy-hh);g.lineTo(sx+lean+ww*.2,cy-hh*.64);g.lineTo(sx+lean*.7+ww*.55,cy-hh*.4);g.lineTo(sx+ww*.82,cy-hh*.17);g.lineTo(sx+ww,cy+k);g.closePath();g.fill();
  g.fillStyle='#ffbd59';g.beginPath();g.moveTo(sx-ww*.16,cy);g.lineTo(sx+lean*.42-ww*.12,cy-hh*.39);g.lineTo(sx+lean,cy-hh*.92);g.lineTo(sx+lean*.72+ww*.19,cy-hh*.42);g.lineTo(sx+ww*.4,cy);g.closePath();g.fill();
 }
 for(let j=0;j<3;j++){const u=(tm*.18+j/3)%1;g.globalAlpha=opacity*(1-u)*.6;g.strokeStyle='#ffd16f';g.lineWidth=.8*k;g.beginPath();g.ellipse(cx,cy,10*k+u*24*k,1.2*k+u*2.6*k,0,0,6.283);g.stroke();}
 // Eighteen fixed descriptors, evaluated analytically. No spawn list or objects
 // are allocated per frame; droplets land visually on the distant lava slopes.
 for(let j=0;j<DN5_BOMBS.length;j++){
  const b=DN5_BOMBS[j],age=(tm+b.offset)%b.period;if(age>b.duration)continue;const u=age/b.duration,bank=25+b.land*.55,reach=clamp(b.launch+b.reach,-bank,bank)-b.launch,sway=Math.sin(u*Math.PI)*Math.sin(tm*.31+b.phase)*4,px=cx+(b.launch+reach*u+sway)*k,py=cy-4*b.height*loft*u*(1-u)+b.land*k*u*u;
  if(px<-30||px>W/S+30||py<-35||py>vh+35)continue;const fade=Math.min(1,u/.07,(1-u)/.13)*opacity,dx=reach*k,dy=-4*b.height*loft*(1-2*u)+2*b.land*k*u,sz=b.size*Math.min(k,1.75),tail=.035;
  g.globalAlpha=fade*.56;g.strokeStyle='#ef8245';g.lineWidth=sz*.65;g.beginPath();g.moveTo(px-dx*tail,py-dy*tail);g.lineTo(px,py);g.stroke();
  g.save();g.globalAlpha=fade;g.translate(px,py);g.rotate(Math.atan2(dy,dx)+Math.PI*.5+Math.sin(tm*.8+b.phase)*.14);g.drawImage(dn5MoltenArt(b.kind),-sz,-sz*1.5,sz*2,sz*3);g.restore();
 }
 // Hot highlights travel along the uneven channels at different velocities.
 g.globalAlpha=opacity*.49;g.strokeStyle='#ffc56c';g.lineWidth=1.25*k;g.beginPath();
 for(let j=0;j<DN5_RIVERS.length;j++)for(let n=0;n<5;n++){
  const u=(tm*(.022+j*.003)+n/5+j*.17)%1,p=dn5RiverPoint(DN5_RIVERS[j],u,DN5_RP),x=DN5.mx0+p.x*k,y=DN5.my0+p.y*k;
  if(y<0||y>vh+15)continue;dn5RiverPoint(DN5_RIVERS[j],Math.max(0,u-.016),DN5_RP);g.moveTo(DN5.mx0+DN5_RP.x*k,DN5.my0+DN5_RP.y*k);g.lineTo(x,y);
 }g.stroke();g.globalAlpha=1;
}
function dn5FallActivity(x,base,k,tm,index){
 // Close tributaries remain alive after the giant summit passes out of view.
 // Only three short, distant splash arcs and six travelling hot marks per fall.
 g.lineCap='round';g.strokeStyle='#ffc165';g.lineWidth=1.4*k;g.globalAlpha=.68;g.beginPath();
 for(let j=0;j<6;j++){const u=(tm*.16+j/6+index*.17)%1,yy=170+u*303,xx=109+Math.sin(u*7)*5+u*9;g.moveTo(x+(xx-110)*k,base+(yy-500)*k);g.lineTo(x+(xx-109)*k,base+(yy-491)*k);}g.stroke();
 for(let j=0;j<3;j++){
  const u=(tm*.28+j/3+index*.21)%1,sd=j%2?1:-1,px=x+sd*u*(18+j*3)*k,py=base-330*k-4*(16+j*4)*k*u*(1-u)+u*u*34*k,sz=1.6*k,fade=Math.sin(u*Math.PI)*.86;
  g.save();g.globalAlpha=fade;g.translate(px,py);g.rotate(sd*.55+u*1.2);g.drawImage(dn5MoltenArt(j%2),-sz,-sz*1.5,sz*2,sz*3);g.restore();
 }g.globalAlpha=1;
}
function dn5WallActivity(tm,inside,vw,y,drift){
 g.lineCap='round';g.lineWidth=1.5;g.strokeStyle='#f7a15b';g.globalAlpha=inside*.62;g.beginPath();
 for(let side=0;side<2;side++)for(let j=0;j<3;j++)for(let n=0;n<3;n++){
  const u=(tm*(.022+j*.003)+n/3+j*.17+side*.11)%1,p=dn5RiverPoint(DN5_WALL_Q,u,DN5_RP),lx=p.x+j*48+side*13,ly=p.y,px=side?vw+190+drift-lx*1.2:-190+drift+lx*1.2,py=y+ly*1.2;
  dn5RiverPoint(DN5_WALL_Q,Math.max(0,u-.012),DN5_RP);const lastX=DN5_RP.x+j*48+side*13,lastY=DN5_RP.y;g.moveTo(side?vw+190+drift-lastX*1.2:-190+drift+lastX*1.2,y+lastY*1.2);g.lineTo(px,py);
 }g.stroke();g.globalAlpha=1;
}
// The journey has an actual geographical progression: distant foothills, the
// expanding mountainside, then the sheltered blue walls inside the caldera.
function dn5Approach(){return smooth(clamp((cam.x+VW*.5-35*T)/(355*T),0,1));}
function dn5Inside(){return smooth(clamp((cam.x+VW*.5-345*T)/(135*T),0,1));}
OLAY.on('korUyandi',o=>{if(o)DN5.life.push({x:o.x,y:o.y,t:now,v:o.sira||0});});
OLAY.on('volkanFinalBasla',o=>{if(DN5.finT===null){DN5.finT=now;DN5.finX=o&&Number.isFinite(o.x)?o.x:BOLUM.kor.x;}});
OLAY.on('volkanMiniTamam',o=>{if(o&&o.phoenix&&DN5.ankaT===null)DN5.ankaT=now;});
OLAY.on('lavSalCicek',o=>{if(o&&DN5.riverBloom.length<3)DN5.riverBloom.push({x:o.x,y:o.y,t:now});});
function dn5Sky(){
 if(DN5.sky)return;
 const cv=DN5.sky=dn5Cv(768,600),c=cv.getContext('2d'),R=rng(9513);
 const bg=c.createLinearGradient(0,0,0,600);bg.addColorStop(0,'#282c53');bg.addColorStop(.28,'#614377');bg.addColorStop(.53,'#a45886');bg.addColorStop(.73,'#d97b80');bg.addColorStop(1,'#edac84');c.fillStyle=bg;c.fillRect(0,0,768,600);
 const halo=c.createRadialGradient(530,310,4,530,310,400);halo.addColorStop(0,'rgba(255,208,156,.22)');halo.addColorStop(.35,'rgba(240,142,113,.11)');halo.addColorStop(1,'rgba(240,142,113,0)');c.fillStyle=halo;c.fillRect(0,0,768,600);
 // Delicate handmade paper grain and long watercolour brush clouds.
 for(let j=0;j<30;j++){const y=70+R()*310,x=R()*768,w=80+R()*260,h=3+R()*11;c.fillStyle=j%3?'rgba(255,226,210,.055)':'rgba(88,79,126,.06)';c.beginPath();c.ellipse(x,y,w,h,-.025,0,6.283);c.fill();}
 for(let j=0;j<15000;j++){const x=R()*768,y=R()*600;c.fillStyle=j%2?'rgba(255,238,213,.022)':'rgba(38,44,80,.018)';c.fillRect(x,y,.8+R(),.5+R());}
 for(let j=0;j<34;j++){const x=R()*768,y=R()*180,s=.5+R()*.9;c.fillStyle='rgba(255,244,217,'+(.15+R()*.3)+')';c.beginPath();c.arc(x,y,s,0,6.283);c.fill();}
 // The crater interior has the same dusk, with deeper cool values instead of a
 // milky wash. It is a second cached paper painting blended during the ascent.
 DN5.heartSky=dn5Cv(768,600);const hc=DN5.heartSky.getContext('2d'),hg=hc.createLinearGradient(0,0,0,600);
 hg.addColorStop(0,'#242e50');hg.addColorStop(.35,'#484771');hg.addColorStop(.7,'#9a5f86');hg.addColorStop(1,'#cc878b');hc.fillStyle=hg;hc.fillRect(0,0,768,600);
 for(let j=0;j<64;j++){const x=R()*768,y=R()*370;hc.fillStyle=j%4?'rgba(242,218,191,.19)':'rgba(183,220,215,.29)';hc.beginPath();hc.ellipse(x,y,.5+R()*.6,.7+R()*.8,0,0,6.283);hc.fill();}
 for(let j=0;j<8000;j++){const x=R()*768,y=R()*600;hc.fillStyle=j%2?'rgba(255,230,206,.025)':'rgba(22,34,61,.025)';hc.fillRect(x,y,.8,.7);}
 DN5.vig=dn5Cv(200,160);const v=DN5.vig.getContext('2d'),gr=v.createRadialGradient(105,70,48,105,70,125);gr.addColorStop(0,'rgba(25,29,62,0)');gr.addColorStop(.6,'rgba(25,29,62,.01)');gr.addColorStop(1,'rgba(25,29,62,.32)');v.fillStyle=gr;v.fillRect(0,0,200,160);
}
function dn5Leaf(c,x,y,len,w,ang,col,fold){
 c.save();c.translate(x,y);c.rotate(ang);const gr=c.createLinearGradient(-w,-len*.7,w,0);
 gr.addColorStop(0,dn5Mix(col,'#e9c99f',.21));gr.addColorStop(.37,col);gr.addColorStop(.57,dn5Mix(col,'#30304e',.21));gr.addColorStop(1,dn5Mix(col,'#212a47',.58));c.fillStyle=gr;c.beginPath();c.moveTo(0,1);c.bezierCurveTo(-w,-len*.15,-w*.9,-len*.72,0,-len);c.bezierCurveTo(w*.85,-len*.78,w,-len*.2,0,1);c.fill();
 c.fillStyle='rgba(28,25,52,.16)';c.beginPath();c.moveTo(0,1);c.quadraticCurveTo(w*.19,-len*.42,0,-len);c.bezierCurveTo(w*.85,-len*.78,w,-len*.2,0,1);c.fill();
 c.strokeStyle='rgba(246,205,157,.43)';c.lineWidth=.85;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-w*.1,-len*.55,0,-len+1);c.stroke();
 if(fold){c.strokeStyle='rgba(236,201,167,.21)';c.lineWidth=.55;for(let j=1;j<6;j++){const yy=-len*j/6,wide=Math.sin(j/6*Math.PI)*w*.75;c.beginPath();c.moveTo(0,yy);c.quadraticCurveTo(-wide*.6,yy-len*.055,-wide,yy-len*.12);c.moveTo(0,yy);c.quadraticCurveTo(wide*.6,yy-len*.055,wide,yy-len*.12);c.stroke();}}c.restore();
}
function dn5Flora(v){
 if(DN5.atlas[v])return DN5.atlas[v];const cv=dn5Cv(560,640),c=cv.getContext('2d'),R=rng(5201+v*93);c.scale(2,2);const col=DN5_COL[v%8],dark=dn5Mix(col,'#283650',.48);c.lineCap='round';
 if(v%5===0){
  // Fan of folded copper leaves; the creases catch the evening light.
  for(let j=0;j<9;j++){const a=(j-4)*.21,len=80+R()*100;c.strokeStyle=dark;c.lineWidth=2;c.beginPath();c.moveTo(140,298);c.quadraticCurveTo(140+Math.sin(a)*35,215,140+Math.sin(a)*len,298-Math.cos(a)*len);c.stroke();dn5Leaf(c,140+Math.sin(a)*len,298-Math.cos(a)*len,len*.62,13+R()*8,a,col,true);}
 }else if(v%5===1){
  // A curling fern, articulated by the caller rather than a static flower stamp.
  for(let j=0;j<5;j++){const a=(j-2)*.28,ln=125+R()*83;c.save();c.translate(140,298);c.rotate(a);c.strokeStyle=dark;c.lineWidth=2.1;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-5,-ln*.4,18,-ln*.7,0,-ln);c.stroke();for(let k=1;k<8;k++){const yy=-ln*k/8,xx=Math.sin(k/8*Math.PI)*8,sz=24*(1-k/10);dn5Leaf(c,xx,yy,sz,sz*.33,-.88,col,false);dn5Leaf(c,xx,yy,sz,sz*.33,.88,col,false);}c.restore();}
 }else if(v%5===2){
  // Lantern reeds: soft golden seedpods, pointed leaves and fine dark seams.
  for(let j=0;j<7;j++){const x=85+j*18+(R()-.5)*14,h=80+R()*155;c.strokeStyle=dark;c.lineWidth=1.8;c.beginPath();c.moveTo(140,300);c.bezierCurveTo(x,270,x-10,300-h*.7,x,300-h);c.stroke();dn5Leaf(c,x-3,300-h*.5,38,8,-.68,col,true);dn5Leaf(c,x+2,300-h*.7,29,7,.65,col,true);c.save();c.translate(x,300-h);c.rotate((R()-.5)*.55);const gr=c.createLinearGradient(-11,-15,10,12);gr.addColorStop(0,'#fff1bd');gr.addColorStop(.5,col);gr.addColorStop(1,dark);c.fillStyle=gr;c.beginPath();c.moveTo(0,-18);c.quadraticCurveTo(20,-9,10,10);c.quadraticCurveTo(0,24,-10,10);c.quadraticCurveTo(-20,-9,0,-18);c.fill();c.strokeStyle='rgba(255,240,197,.5)';c.lineWidth=.7;c.beginPath();c.moveTo(0,-17);c.lineTo(0,17);c.stroke();c.restore();}
 }else if(v%5===3){
  // A loose botanical composition, with air between curled stems and folded leaves.
  // The silhouette must not read as one enormous triangular pineapple beside Feza.
  for(let j=0;j<7;j++){const a=(j-3)*.34;dn5Leaf(c,140,298,53+R()*66,14+R()*10,a,col,true);}
  for(let j=0;j<3;j++){
   const xx=115+j*29,yy=147+j%2*31,sd=j%2?1:-1;
   c.strokeStyle=dark;c.lineWidth=2;c.beginPath();c.moveTo(140,298);c.bezierCurveTo(xx+sd*35,253,xx-sd*29,yy+31,xx,yy);c.stroke();
   dn5Leaf(c,xx-sd*7,yy+55,32,10,sd*.86,DN5_COL[(v+2)%8],true);
   for(let z=0;z<5;z++){c.save();c.translate(xx,yy);c.rotate((z-2)*.42);dn5Leaf(c,0,0,23+z%2*5,9,0,col,true);c.restore();}
   c.fillStyle='#cb8e69';c.beginPath();c.ellipse(xx,yy-4,3.3,4.1,0,0,6.283);c.fill();
  }
 }else{
  // Spiral mineral lilies: explicitly sculpted blossoms, never insect silhouettes.
  for(let j=0;j<5;j++){const x=86+j*27,h=70+R()*118;c.strokeStyle=dark;c.lineWidth=2;c.beginPath();c.moveTo(140,300);c.bezierCurveTo(x+22,235,x-16,300-h+25,x,300-h);c.stroke();dn5Leaf(c,x,300-h+45,35,9,j%2?.75:-.75,col,true);for(let k=0;k<6;k++){c.save();c.translate(x,300-h);c.rotate(k*6.283/6);dn5Leaf(c,0,0,18,7,0,col,false);c.restore();}c.fillStyle='#d2a778';c.beginPath();c.arc(x,300-h,3.3,0,6.283);c.fill();}
 }
 // Mineral dust is baked into the plant; animation only moves its whole paper layer.
 c.globalAlpha=.18;for(let j=0;j<26;j++){c.fillStyle='#d5aa95';c.fillRect(62+R()*158,145+R()*150,.5+R(),.5+R());}c.globalAlpha=1;DN5.atlas[v]=cv;return cv;
}
function dn5LilyHead(c,x,y,scale,angle,v){
 c.save();c.translate(x,y);c.rotate(angle);c.scale(scale,scale);
 const bright=v?'#c35bd6':'#f45d80',pigment=v?'#8b2baa':'#c92559',shadow=v?'#3b1b61':'#591738',gr=c.createLinearGradient(-30,-58,28,13);
 gr.addColorStop(0,bright);gr.addColorStop(.4,pigment);gr.addColorStop(1,shadow);
 // A side-facing trumpet, with long unequal folded petals. There is no
 // circular golden eye: that visual language belongs to the touchable roses.
 c.fillStyle=shadow;c.beginPath();c.moveTo(-2,16);c.bezierCurveTo(-18,-2,-26,-20,-28,-51);c.bezierCurveTo(-11,-40,0,-27,3,-5);c.bezierCurveTo(8,-27,22,-47,37,-54);c.bezierCurveTo(35,-18,25,1,6,17);c.closePath();c.fill();
 c.fillStyle=gr;c.beginPath();c.moveTo(-1,17);c.bezierCurveTo(-9,-4,-38,-10,-46,-40);c.bezierCurveTo(-22,-39,-8,-25,4,-13);c.bezierCurveTo(8,-34,19,-51,31,-63);c.bezierCurveTo(33,-33,24,-12,12,6);c.bezierCurveTo(29,-4,44,-7,53,-26);c.bezierCurveTo(53,-2,34,15,8,23);c.closePath();c.fill();
 c.fillStyle=v?'#612180':'#982044';c.beginPath();c.moveTo(0,17);c.bezierCurveTo(-16,-1,-35,-13,-46,-40);c.bezierCurveTo(-29,-23,-12,-21,4,-13);c.bezierCurveTo(1,-1,1,9,8,23);c.closePath();c.fill();
 c.fillStyle=v?'#aa48c0':'#e83c69';c.beginPath();c.moveTo(2,8);c.bezierCurveTo(17,3,40,-6,53,-26);c.bezierCurveTo(42,1,26,16,8,23);c.closePath();c.fill();
 c.strokeStyle=v?'rgba(227,141,229,.7)':'rgba(255,153,160,.72)';c.lineWidth=1.1;c.beginPath();c.moveTo(-43,-38);c.bezierCurveTo(-28,-23,-12,-17,-1,14);c.moveTo(29,-58);c.bezierCurveTo(24,-35,11,-14,5,12);c.moveTo(8,21);c.bezierCurveTo(26,13,42,-6,51,-22);c.stroke();
 c.strokeStyle=v?'rgba(49,22,80,.45)':'rgba(84,20,51,.45)';c.lineWidth=.65;c.beginPath();c.moveTo(-24,-25);c.quadraticCurveTo(-13,-19,-8,-4);c.moveTo(24,-35);c.lineTo(13,-16);c.moveTo(33,2);c.lineTo(18,11);c.stroke();
 c.fillStyle=v?'#51446c':'#365c5c';c.beginPath();c.moveTo(-4,20);c.lineTo(-11,8);c.quadraticCurveTo(0,13,9,24);c.lineTo(15,12);c.lineTo(11,29);c.lineTo(1,27);c.closePath();c.fill();c.restore();
}
function dn5Bloom(v){
 if(DN5.blooms[v])return DN5.blooms[v];const cv=dn5Cv(620,640),c=cv.getContext('2d');c.scale(2,2);c.lineCap='round';
 const heads=v?[[116,171,.8,-.62],[164,125,1,.18],[211,205,.65,.66]]:[[112,183,.83,-.7],[162,125,1,-.15],[212,180,.7,.66]];
 for(let j=0;j<heads.length;j++){
  const h=heads[j];c.strokeStyle='#252d46';c.lineWidth=5.6;c.beginPath();c.moveTo(155,315);c.bezierCurveTo(144+(j-1)*13,268,h[0]+(j-1)*11,h[1]+53,h[0],h[1]+19*h[2]);c.stroke();c.strokeStyle=v?'#52627d':'#36776a';c.lineWidth=3.5;c.stroke();c.strokeStyle=v?'rgba(168,126,158,.55)':'rgba(157,151,119,.5)';c.lineWidth=.65;c.stroke();
 }
 dn5Leaf(c,148,275,76,17,-.77,v?'#555b7c':'#367a70',true);dn5Leaf(c,159,250,68,16,.88,v?'#64527f':'#3d8876',true);dn5Leaf(c,152,302,54,12,-.3,v?'#494c70':'#2c6260',true);dn5Leaf(c,172,224,41,10,.73,v?'#5c4a80':'#388073',true);
 for(let j=0;j<heads.length;j++){const h=heads[j];dn5LilyHead(c,h[0],h[1],h[2],h[3],v);}
 DN5.blooms[v]=cv;return cv;
}
function dn5Mountain(v){
 if(DN5.mount[v])return DN5.mount[v];const cv=dn5Cv(1400,900),c=cv.getContext('2d'),R=rng(927+v*371);c.scale(2,2);const base=['#36314f','#494061','#33445e','#2a425b'][v%4];
 const p=new Path2D();p.moveTo(-15,450);p.lineTo(55,375);p.lineTo(120,354);p.lineTo(195,258);p.lineTo(263,211);p.lineTo(316,105);p.lineTo(336,98);p.quadraticCurveTo(350,110,367,101);p.lineTo(391,108);p.lineTo(452,242);p.lineTo(509,287);p.lineTo(558,350);p.lineTo(642,378);p.lineTo(715,450);p.closePath();
 const gr=c.createLinearGradient(0,100,0,450);gr.addColorStop(0,dn5Mix(base,'#c58fa9',.13));gr.addColorStop(.55,base);gr.addColorStop(1,dn5Mix(base,'#a78ba4',.13));c.fillStyle=gr;c.fill(p);c.save();c.clip(p);
 const facets=[[[336,98],[275,273],[145,410]],[[339,107],[327,304],[245,451]],[[360,109],[414,286],[507,431]],[[391,108],[476,295],[573,420]],[[326,135],[226,294],[119,353]],[[368,142],[352,369],[405,450]],[[215,285],[175,408],[59,434]],[[486,278],[521,402],[643,444]]];
 for(let j=0;j<facets.length;j++){const facet=facets[j],fg=c.createLinearGradient(facet[0][0]-30,facet[0][1],facet[1][0]+45,facet[2][1]);fg.addColorStop(0,j%2?'rgba(183,125,159,.2)':'rgba(14,27,51,.24)');fg.addColorStop(.6,j%2?'rgba(154,123,156,.08)':'rgba(25,29,56,.15)');fg.addColorStop(1,j%2?'rgba(214,157,160,.16)':'rgba(15,24,47,.26)');c.fillStyle=fg;c.beginPath();for(let k=0;k<facet.length;k++){const z=facet[k];if(k)c.lineTo(z[0],z[1]);else c.moveTo(z[0],z[1]);}c.closePath();c.fill();}
 // Weathered ribs follow the slope. Their shaded side and narrow warm lip
 // give the mountain volume without sharpening the whole skyline.
 for(let j=0;j<14;j++){
  const side=j%2?1:-1,u=.08+j/19,sx=350+side*(9+u*28),sy=111+u*72,ex=350+side*(71+u*220),ey=229+u*230,w=5+u*9;
  c.fillStyle='rgba(18,25,47,.2)';c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(sx+side*22,sy+76,ex-side*24,ey-57,ex,ey);c.lineTo(ex+side*w,ey+6);c.bezierCurveTo(ex-side*12,ey-60,sx+side*34,sy+69,sx,sy);c.fill();
  c.strokeStyle=side<0?'rgba(223,164,166,.21)':'rgba(167,136,170,.14)';c.lineWidth=.9;c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(sx+side*22,sy+76,ex-side*24,ey-57,ex,ey);c.stroke();
 }
 c.lineCap='round';
 // Fine contour shelves and split paper ridges are painted into the mountain;
 // the main silhouette stays quiet while the eye finds detail on a second look.
 for(let j=0;j<19;j++){
  const side=j%2?1:-1,u=.12+j/24,xx=350+side*(32+u*170),yy=118+u*280;
  c.strokeStyle=j%3?'rgba(227,194,203,.14)':'rgba(35,45,80,.12)';c.lineWidth=.6+R()*.6;
  c.beginPath();c.moveTo(350+side*(13+u*55),yy-35);c.bezierCurveTo(xx-side*45,yy-25,xx-side*24,yy+8,xx+side*(21+R()*40),yy+20);c.stroke();
 }
 for(let j=0;j<180;j++){const xx=85+R()*560,y=168+R()*275;c.strokeStyle=j%4?'rgba(221,176,180,'+(.035+R()*.065)+')':'rgba(22,24,49,.21)';c.lineWidth=.4+R()*.6;c.beginPath();c.moveTo(xx,y);c.lineTo(xx+4+R()*14,y+1+R()*4);c.stroke();}
 // Broad molten rivers visibly shape the mountain, rather than a few decorative threads.
 // The dark banks, coral body and thin golden centre are all baked into one atlas.
 const riverGradient=c.createLinearGradient(0,110,0,450);riverGradient.addColorStop(0,'#ffd07c');riverGradient.addColorStop(.18,'#ffae68');riverGradient.addColorStop(.56,'#eb795f');riverGradient.addColorStop(1,'#c45f76');
 for(let j=0;j<DN5_RIVERS.length;j++)dn5PaintChannel(c,DN5_RIVERS[j],j,riverGradient);
 dn5PaintChannel(c,[294,232,286,266,266,278,271,310,278,344,244,370,242,397],4,riverGradient);
 dn5PaintChannel(c,[420,258,421,292,408,320,426,346,438,370,411,403,425,435],5,riverGradient);
 // A branching tributary and cooled plates keep each river recognisably geological.
 c.restore();c.fillStyle='#4a294e';c.beginPath();c.ellipse(355,108,38,6,0,0,6.283);c.fill();c.fillStyle='#ff965f';c.beginPath();c.ellipse(355,109,33,3.7,0,0,6.283);c.fill();c.strokeStyle='rgba(255,217,142,.96)';c.lineWidth=2;c.beginPath();c.ellipse(355,108,39,6.5,0,Math.PI*.02,Math.PI*.99);c.stroke();c.strokeStyle='rgba(255,217,174,.55)';c.lineWidth=.8;c.beginPath();c.moveTo(317,105);c.lineTo(336,98);c.quadraticCurveTo(350,110,367,101);c.lineTo(390,108);c.stroke();
 DN5.mount[v]=cv;return cv;
}
function dn5Rock(c,x,y,w,h,col,seed){
 const R=rng(seed),n=8,pts=[];for(let j=0;j<n;j++){const a=j/n*6.283,r=.88+R()*.14;pts.push([x+Math.cos(a)*w*.5*r,y+Math.sin(a)*h*.5*r]);}
 const gr=c.createLinearGradient(x-w*.4,y-h*.45,x+w*.5,y+h*.45);gr.addColorStop(0,dn5Mix(col,'#ad9baf',.27));gr.addColorStop(.45,col);gr.addColorStop(1,dn5Mix(col,'#17243f',.6));c.fillStyle=gr;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();c.save();c.clip();
 // Large planes share one upper-left mineral light. Small seams live inside
 // those planes, rather than making an unrelated noisy triangle mosaic.
 const cx=x-w*.08,cy=y-h*.1;
 for(let j=0;j<n;j++){const p=pts[j],p1=pts[(j+1)%n],fg=c.createLinearGradient(cx,cy,(p[0]+p1[0])*.5,(p[1]+p1[1])*.5);fg.addColorStop(0,dn5Mix(col,'#4b3a67',.14));fg.addColorStop(1,j>=4&&j<=6?dn5Mix(col,'#bd9ba8',.26):dn5Mix(col,'#14213a',.38));c.fillStyle=fg;c.beginPath();c.moveTo(cx,cy);c.lineTo(p[0],p[1]);c.lineTo(p1[0],p1[1]);c.closePath();c.fill();}
 for(let j=0;j<8;j++){const xx=x-w*.38+j*w*.1,yy=y-h*.25+R()*h*.25,sk=(R()-.5)*w*.15;c.strokeStyle=j%3?'rgba(28,24,48,.31)':'rgba(204,151,145,.28)';c.lineWidth=.7;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+sk*.4,yy+h*.13);c.lineTo(xx+sk,yy+h*.24);c.lineTo(xx+sk*.8,yy+h*.4);c.stroke();}
 for(let j=0;j<45;j++){c.fillStyle=j%3?'rgba(201,175,170,.06)':'rgba(20,24,43,.12)';c.fillRect(x+(R()-.5)*w,y+(R()-.5)*h,.4+R()*1.5,.3+R()*.9);}c.restore();
 c.strokeStyle='rgba(220,170,147,.36)';c.lineWidth=1.1;c.beginPath();c.moveTo(pts[4][0],pts[4][1]);c.lineTo(pts[5][0],pts[5][1]);c.lineTo(pts[6][0],pts[6][1]);c.stroke();
}
function dn5RockArt(v){
 const id=v%6;if(DN5.rocks[id])return DN5.rocks[id];const cv=dn5Cv(640,360),c=cv.getContext('2d');c.scale(2,2);
 dn5Rock(c,160,91,318,169,id<3?'#3c4862':'#443c60',id*119+4821);DN5.rocks[id]=cv;return cv;
}
function dn5Fall(v){
 if(DN5.falls[v])return DN5.falls[v];const cv=dn5Cv(440,1000),c=cv.getContext('2d'),R=rng(1040+v*341);c.scale(2,2);
 // Natural basalt shelves frame a wide, slow molten waterfall. This is a terrain
 // feature behind the path; Feza never needs to cross exposed lava on foot.
 const stone=['#3c4c70','#3a4f6b','#4b496c'][v%3];
 for(let j=0;j<8;j++){const xx=35+j*21,h=210+R()*130;dn5Rock(c,xx,180+h*.5,34,h,stone,j*71+v*213);}
 dn5Rock(c,109,188,177,66,dn5Mix(stone,'#b2a6ac',.12),v*173+41);
 const ch=new Path2D();ch.moveTo(89,166);ch.bezierCurveTo(102,198,85,217,97,244);ch.bezierCurveTo(113,284,100,332,112,376);ch.bezierCurveTo(118,415,91,446,84,480);ch.lineTo(143,480);ch.bezierCurveTo(137,429,142,413,131,373);ch.bezierCurveTo(116,325,139,282,119,242);ch.bezierCurveTo(108,218,127,192,115,166);ch.closePath();
 const lava=c.createLinearGradient(0,160,0,500);lava.addColorStop(0,'#ffd28a');lava.addColorStop(.15,'#ffad6e');lava.addColorStop(.65,'#e57760');lava.addColorStop(1,'#bd596c');c.fillStyle=lava;c.fill(ch);
 c.strokeStyle='rgba(255,228,172,.78)';c.lineWidth=2;c.beginPath();c.moveTo(101,171);c.bezierCurveTo(113,219,96,218,106,256);c.bezierCurveTo(121,310,107,325,121,382);c.bezierCurveTo(132,424,110,454,112,477);c.stroke();
 c.strokeStyle='rgba(255,221,171,.38)';c.lineWidth=.8;for(let j=0;j<3;j++){c.beginPath();c.moveTo(94+j*7,178);c.bezierCurveTo(109+j*4,234,99+j*5,266,110+j*5,320);c.stroke();}
 // Warm light belongs to the stone shoulders, not a white screen-sized bloom.
 c.globalCompositeOperation='lighter';const a=c.createRadialGradient(110,305,20,110,305,130);a.addColorStop(0,'rgba(247,169,123,.15)');a.addColorStop(1,'rgba(247,169,123,0)');c.fillStyle=a;c.fillRect(0,160,220,340);c.globalCompositeOperation='source-over';
 for(let j=0;j<21;j++){const xx=70+R()*85,yy=205+R()*240;c.strokeStyle='rgba(255,231,186,.28)';c.lineWidth=.7;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+3,yy+9);c.stroke();}
 DN5.falls[v]=cv;return cv;
}
function dn5CraterWall(v){
 if(DN5.walls[v])return DN5.walls[v];const cv=dn5Cv(640,1200),c=cv.getContext('2d'),R=rng(15391+v*711);c.scale(2,2);
 const p=new Path2D();p.moveTo(-15,-20);p.lineTo(183,-20);p.lineTo(159,57);p.lineTo(199,112);p.lineTo(170,174);p.lineTo(218,233);p.lineTo(205,308);p.lineTo(247,361);p.lineTo(228,414);p.lineTo(283,491);p.lineTo(315,610);p.lineTo(-15,610);p.closePath();
 const bg=c.createLinearGradient(0,0,300,450);bg.addColorStop(0,'#253d5b');bg.addColorStop(.45,v?'#3c4c68':'#344b65');bg.addColorStop(1,'#5b5875');c.fillStyle=bg;c.fill(p);c.save();c.clip(p);
 // Basalt organ pipes are irregular, folded and split by warm mineral channels.
 for(let j=0;j<13;j++){
  const x=j*25-7,lean=(R()-.5)*42;const gr=c.createLinearGradient(x,0,x+30,0);gr.addColorStop(0,'rgba(177,175,184,.15)');gr.addColorStop(.36,'rgba(150,155,178,.04)');gr.addColorStop(1,'rgba(13,29,52,.23)');c.fillStyle=gr;c.beginPath();c.moveTo(x-9,-30);c.lineTo(x+23,-30);c.lineTo(x+lean+26,620);c.lineTo(x+lean,620);c.closePath();c.fill();
  c.strokeStyle='rgba(179,187,190,.18)';c.lineWidth=.7;c.beginPath();c.moveTo(x,-10);c.lineTo(x+lean*.4,210);c.lineTo(x+lean,601);c.stroke();
 }
 const lg=c.createLinearGradient(0,0,0,600);lg.addColorStop(0,'#ffd38b');lg.addColorStop(.4,'#ee9069');lg.addColorStop(1,'#bd617a');
 for(let j=0;j<3;j++){
  const x=42+j*48+(v?13:0);c.strokeStyle='rgba(255,179,135,.08)';c.lineWidth=25;c.beginPath();c.moveTo(x,-10);c.bezierCurveTo(x-13,155,x+24,212,x+12,318);c.bezierCurveTo(x-4,427,x+46,503,x+41,610);c.stroke();c.strokeStyle=lg;c.lineWidth=3.5+j%2*2;c.stroke();c.strokeStyle='rgba(255,234,186,.52)';c.lineWidth=.8;c.stroke();
 }
 for(let j=0;j<120;j++){const x=R()*300,y=R()*600;c.strokeStyle=j%3?'rgba(192,185,188,.1)':'rgba(244,198,165,.16)';c.lineWidth=.6;c.beginPath();c.moveTo(x,y);c.lineTo(x+6+R()*11,y-2-R()*7);c.stroke();}
 c.restore();c.strokeStyle='rgba(172,173,185,.25)';c.lineWidth=1.3;c.beginPath();c.moveTo(183,-15);c.lineTo(159,57);c.lineTo(199,112);c.lineTo(170,174);c.lineTo(218,233);c.lineTo(205,308);c.lineTo(247,361);c.lineTo(228,414);c.lineTo(283,491);c.lineTo(315,610);c.stroke();DN5.walls[v]=cv;return cv;
}
const DN5_CW=768,DN5_CACHE=12;
function dn5Chunk(i){
 if(DN5.chunks.has(i)){const a=DN5.chunks.get(i);DN5.chunks.delete(i);DN5.chunks.set(i,a);return a;}
 const cv=dn5Cv(DN5_CW+4,1200),c=cv.getContext('2d'),x0=i*DN5_CW,R=rng(i*811+532),bm=dn5Biome(x0+384),base=['#39405c','#344b60','#344c63','#303f5a','#4a4662'][bm];
 c.translate(2,0);const p=new Path2D();p.moveTo(-2,1200);let prev=1200;
 for(let x=-2;x<=DN5_CW+2;x+=2){const y=dn5Surface(x+x0);if(y!==prev){p.lineTo(x,prev);p.lineTo(x,y);prev=y;}}
 p.lineTo(DN5_CW+2,prev);p.lineTo(DN5_CW+2,1200);p.closePath();const gr=c.createLinearGradient(0,520,0,1200);gr.addColorStop(0,dn5Mix(base,'#bda5a8',.18));gr.addColorStop(.45,base);gr.addColorStop(1,'#172c49');c.fillStyle=gr;c.fill(p);c.save();c.clip(p);
 // Tall irregular basalt prisms, softly modelled and threaded with fine warm seams.
 for(let q=Math.floor((x0-60)/57);q<Math.ceil((x0+DN5_CW+80)/57);q++){
  const Q=rng(q*199+912),xx=q*57-x0,w=43+Q()*20,top=dn5Surface(q*57+20),end=top+145+Q()*310,sk=(Q()-.5)*18;
  const b=c.createLinearGradient(xx,0,xx+w,0);b.addColorStop(0,dn5Mix(base,'#c093a3',.2+Q()*.09));b.addColorStop(.24,dn5Mix(base,'#a19ab1',.12));b.addColorStop(.65,base);b.addColorStop(1,dn5Mix(base,'#15223e',.47));c.fillStyle=b;c.beginPath();c.moveTo(xx,top-3);c.lineTo(xx+w,top-3);c.lineTo(xx+w+sk,end);c.lineTo(xx+w*.58,end+20);c.lineTo(xx+sk,end+7);c.closePath();c.fill();
  c.fillStyle='rgba(16,22,42,.23)';c.beginPath();c.moveTo(xx+w*.68,top+2);c.lineTo(xx+w,top-3);c.lineTo(xx+w+sk,end);c.lineTo(xx+w*.58,end+20);c.lineTo(xx+w*.71+sk*.5,end*.54+top*.46);c.closePath();c.fill();
  c.strokeStyle='rgba(211,164,159,.28)';c.lineWidth=.85;c.beginPath();c.moveTo(xx+3,top+8);c.lineTo(xx+sk*.35+3,top+(end-top)*.42);c.lineTo(xx+sk+3,end-5);c.stroke();
  c.strokeStyle='rgba(16,24,45,.4)';c.lineWidth=1.1;c.beginPath();c.moveTo(xx+w,top+12);c.lineTo(xx+w+sk,end);c.lineTo(xx+w*.58,end+20);c.stroke();
  for(let j=0;j<3;j++){const yy=top+39+j*(end-top)*.25+Q()*17,ix=xx+w*(.17+Q()*.28);c.strokeStyle='rgba(18,23,42,.3)';c.lineWidth=.8;c.beginPath();c.moveTo(xx+4,yy);c.lineTo(ix,yy-4);c.lineTo(ix+7,yy+3);c.lineTo(xx+w-3,yy-1);c.stroke();c.strokeStyle='rgba(186,144,154,.19)';c.lineWidth=.5;c.beginPath();c.moveTo(xx+5,yy+1.6);c.lineTo(ix,yy-2.5);c.lineTo(ix+7,yy+4.5);c.stroke();}
  if(q%4===0){c.strokeStyle='rgba(237,143,99,.42)';c.lineWidth=.85;c.beginPath();c.moveTo(xx+w*.8,top+34);c.lineTo(xx+w*.72,top+80);c.lineTo(xx+w*.95,top+95);c.lineTo(xx+w*.85,end-18);c.stroke();}
 }
 for(let j=0;j<150;j++){const x=R()*DN5_CW,y=dn5Surface(x+x0)+18+R()*290;c.fillStyle=j%4?'rgba(219,205,195,.055)':'rgba(255,198,153,.12)';c.beginPath();c.ellipse(x,y,.5+R()*2,.4+R()*.9,-.2,0,6.283);c.fill();}
 c.restore();
 // Glowing hollows below the walking shelf reveal the mountain's warm interior.
 // They are geological windows in solid scenery, never fake holes in the route.
 c.save();c.clip(p);
 for(let q=Math.floor((x0-200)/940);q<=Math.ceil((x0+DN5_CW+200)/940);q++){
  const Q=rng(q*83+193),wx=q*940+210+Q()*230,xx=wx-x0,sy=dn5Surface(wx);if(sy>=1200)continue;
  const yy=sy+104,w=75+Q()*65,h=54+Q()*42;
  c.save();c.beginPath();c.moveTo(xx-w,yy+h);c.bezierCurveTo(xx-w,yy-h,xx-w*.4,yy-h*1.3,xx,yy-h);c.bezierCurveTo(xx+w*.6,yy-h*1.6,xx+w,yy-h*.2,xx+w,yy+h);c.closePath();
  const rg=c.createLinearGradient(0,yy-h,0,yy+h);rg.addColorStop(0,'#492d55');rg.addColorStop(.48,'#8e456a');rg.addColorStop(.8,'#ca656c');rg.addColorStop(1,'#f19c6f');c.fillStyle=rg;c.fill();c.clip();
  c.fillStyle='rgba(33,39,65,.48)';for(let j=0;j<4;j++){const px=xx-w+j*w*.55;c.beginPath();c.moveTo(px,yy-h*1.2);c.lineTo(px+19,yy-h*1.2);c.lineTo(px+13,yy-h*.15-Q()*35);c.lineTo(px+4,yy-h*.1);c.closePath();c.fill();}
  c.strokeStyle='rgba(255,218,166,.58)';c.lineWidth=1.4;c.beginPath();c.moveTo(xx-w,yy+h*.7);c.bezierCurveTo(xx-w*.4,yy+h*.45,xx+w*.4,yy+h*.8,xx+w,yy+h*.6);c.stroke();c.restore();
  c.strokeStyle='rgba(226,172,145,.28)';c.lineWidth=1;c.beginPath();c.moveTo(xx-w,yy+h);c.bezierCurveTo(xx-w,yy-h,xx-w*.4,yy-h*1.3,xx,yy-h);c.bezierCurveTo(xx+w*.6,yy-h*1.6,xx+w,yy-h*.2,xx+w,yy+h);c.stroke();
 }
 c.restore();
 // The lip is precisely on the collision surface, a warm paper layer above cold stone.
 for(let q=Math.floor(x0/T)-1;q<=Math.floor((x0+DN5_CW)/T);q++){const sx=q*T-x0,sy=dn5Surface(q*T+20);if(sy>=1200)continue;const Q=rng(q*51+119);c.fillStyle='#b89f98';c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+T,sy);c.lineTo(sx+T,sy+3);c.lineTo(sx+T*.76,sy+3+Q()*4);c.lineTo(sx+T*.35,sy+4+Q()*4);c.lineTo(sx,sy+3);c.closePath();c.fill();c.fillStyle=bm===2?'#a5bdbb':'#d5b79b';c.fillRect(sx,sy+.5,T,1.7);c.strokeStyle='rgba(255,224,184,.53)';c.lineWidth=.7;c.beginPath();c.moveTo(sx,sy+.6);c.lineTo(sx+T,sy+.6);c.stroke();
  for(let j=0;j<3;j++){const px=sx+Q()*T,h=6+Q()*15;c.strokeStyle=j%2?'#c8ae99':'#e5c49d';c.lineWidth=.7;c.beginPath();c.moveTo(px,sy+1);c.quadraticCurveTo(px-3,sy-h*.6,px+(Q()-.5)*13,sy-h);c.stroke();}
 }
 DN5.chunks.set(i,cv);while(DN5.chunks.size>DN5_CACHE)DN5.chunks.delete(DN5.chunks.keys().next().value);return cv;
}
function dn5Terrain(){
 g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);const a=Math.max(0,Math.floor(cam.x/DN5_CW)),b=Math.min(Math.ceil(COLS*T/DN5_CW),Math.floor((cam.x+VW)/DN5_CW));for(let i=a;i<=b;i++)g.drawImage(dn5Chunk(i),i*DN5_CW-2,0);const next=b+1;if(next*DN5_CW<COLS*T&&!DN5.chunks.has(next))dn5Chunk(next);
 // One-way ledges are mineral shelves with rounded crystalline underside.
 g.lineCap='round';for(let c=Math.max(0,Math.floor(cam.x/T)-2);c<Math.min(COLS,Math.ceil((cam.x+VW)/T)+2);c++)for(let r=0;r<ROWS;r++)if(grid[r][c]===2){const x=c*T,y=r*T;g.fillStyle='#738d9e';g.beginPath();g.moveTo(x,y);g.lineTo(x+40,y);g.lineTo(x+35,y+10);g.lineTo(x+9,y+17);g.lineTo(x+1,y+8);g.closePath();g.fill();g.strokeStyle='#c5d7cb';g.lineWidth=2;g.beginPath();g.moveTo(x+1,y+1);g.lineTo(x+39,y+1);g.stroke();g.strokeStyle='rgba(255,214,164,.45)';g.lineWidth=1;g.beginPath();g.moveTo(x+10,y+4);g.lineTo(x+18,y+12);g.lineTo(x+30,y+6);g.stroke();}
}
function dn5Backdrop(tm){
 const vw=W/S,vh=H/S,approach=dn5Approach(),inside=dn5Inside();g.setTransform(S,0,0,S,0,0);const mountainBase=555-cam.y*.2+approach*215,mw=880+approach*720,mh=mw*900/1400,mx=vw*lerp(.69,.54,approach)-cam.x*.0025;
 // Keep the molten rim recognisable in a wide screen during the approach and
 // crystal garden. Once the raft enters the mountain, release the framing over
 // 75 columns so the existing transition into the caldera remains continuous.
 const routeX=typeof P!=='undefined'&&Number.isFinite(P.x)?P.x:cam.x+VW*.5,rimRelease=smooth(clamp((routeX-300*T)/(75*T),0,1)),rimInset=125*DPR/S;
 const rimTop=mountainBase-mh*(1-101.5/450),y0=mountainBase+Math.max(0,rimInset-rimTop)*(1-rimRelease);
 // The caldera grows from an entire mountain into cliffs around the player.
 // Cross-fading the two geographical scales avoids a pasted-on fixed backdrop.
 g.globalAlpha=.91*(1-inside*.94);g.drawImage(dn5Mountain(0),mx-mw*.5,y0-mh,mw,mh);g.globalAlpha=1;
 const hotX=mx+mw*.007,hotY=y0-mh*.758;DN5.peakX=hotX;DN5.peakY=hotY;DN5.mx0=mx-mw*.5;DN5.my0=y0-mh;DN5.mk=mw/700;
 g.globalCompositeOperation='lighter';dn5Glow('#ffd3aa',hotX,hotY,100+approach*80,46+approach*22,(.11+.02*Math.sin(tm*.6))*(1-inside));g.globalCompositeOperation='source-over';
 dn5VolcanoActivity(tm,inside);
 for(let layer=0;layer<3;layer++){const f=DN5_PAR_F[layer],step=DN5_PAR_STEP[layer],base=DN5_PAR_BASE[layer]-cam.y*(.2+layer*.1),left=cam.x*f-380,right=cam.x*f+vw+380;g.setTransform(S,0,0,S,-cam.x*S*f,0);g.globalAlpha=DN5_PAR_ALPHA[layer]*(1-inside*.66);for(let q=Math.floor(left/step);q<=Math.ceil(right/step);q++){const R=rng(q*217+layer*391+109),xx=q*step,hh=150+R()*140,ww=step*1.4;g.save();g.translate(xx,base);g.scale(ww/700,hh/450);g.drawImage(dn5Mountain(layer+1),0,-450,700,450);g.restore();}g.globalAlpha=1;}
 if(inside>.002){
  g.setTransform(S,0,0,S,0,0);const wallH=720,wallW=384,y=-60-cam.y*.065,drift=Math.sin(cam.x*.00016)*15;
  g.globalAlpha=inside*.82;g.drawImage(dn5CraterWall(0),-190+drift,y,wallW,wallH);
  g.save();g.translate(vw+190+drift,0);g.scale(-1,1);g.drawImage(dn5CraterWall(1),0,y,wallW,wallH);g.restore();g.globalAlpha=1;
  dn5WallActivity(tm,inside,vw,y,drift);
  g.globalCompositeOperation='lighter';dn5Glow('#eab195',vw*.17,vh*.7,120,220,inside*.055);dn5Glow('#eab195',vw*.86,vh*.65,120,220,inside*.06);g.globalCompositeOperation='source-over';
 }
 // Soft drifting bands have a tangible paper silhouette, not opaque smoky bubbles.
 g.setTransform(S,0,0,S,0,0);g.globalAlpha=.014*(1-inside*.65);g.fillStyle='#d398a4';for(let j=0;j<4;j++){const y=360+j*37-cam.y*.1,xx=((tm*(3+j)+j*237-cam.x*.03)%(vw+650)+vw+650)%(vw+650)-325;g.beginPath();g.moveTo(xx-250,y);g.bezierCurveTo(xx-100,y-16,xx+130,y-17,xx+290,y);g.bezierCurveTo(xx+110,y+5,xx-100,y+9,xx-250,y);g.fill();}g.globalAlpha=1;
}
function dn5Arch(c,x,y,w,h,col){
 c.strokeStyle=col;c.lineWidth=w*.11;c.lineCap='round';c.beginPath();c.moveTo(x-w*.5,y);c.bezierCurveTo(x-w*.58,y-h*.8,x-w*.22,y-h,x,y-h);c.bezierCurveTo(x+w*.25,y-h,x+w*.58,y-h*.76,x+w*.5,y);c.stroke();c.strokeStyle='rgba(221,190,184,.22)';c.lineWidth=1.2;c.beginPath();c.moveTo(x-w*.55,y);c.bezierCurveTo(x-w*.64,y-h*.76,x-w*.25,y-h*1.05,x,y-h*1.05);c.bezierCurveTo(x+w*.28,y-h*1.04,x+w*.62,y-h*.76,x+w*.55,y);c.stroke();
}
function dn5RelicArt(v){
 if(DN5.relics[v])return DN5.relics[v];const cv=dn5Cv(960,760),c=cv.getContext('2d');c.scale(2,2);const R=rng(91871+v*77);
 // A few authored silhouettes replace a corridor of interchangeable shrubs.
 // Their dark bronze feather inlays are scenery, unlike the round pearl toys.
 for(let j=0;j<5;j++){
  const x=95+j*74,y=355,w=42+R()*17,h=145+Math.sin(j*.8+v)*75+v*17,lean=(j-2)*12;
  const gr=c.createLinearGradient(x-w,y-h,x+w,y);gr.addColorStop(0,'#81718a');gr.addColorStop(.18,v?'#4b4165':'#534060');gr.addColorStop(.7,'#303850');gr.addColorStop(1,'#3c3b59');c.fillStyle=gr;
  c.beginPath();c.moveTo(x-w,y);c.lineTo(x-w*.83+lean,y-h*.68);c.quadraticCurveTo(x-w*.5+lean,y-h*.94,x+lean,y-h);c.quadraticCurveTo(x+w*.45+lean,y-h*.92,x+w*.55+lean,y-h*.65);c.lineTo(x+w,y);c.closePath();c.fill();
  c.fillStyle='rgba(25,28,48,.32)';c.beginPath();c.moveTo(x+lean,y-h);c.lineTo(x+w*.55+lean,y-h*.65);c.lineTo(x+w,y);c.lineTo(x+w*.2,y);c.closePath();c.fill();
  c.strokeStyle='rgba(216,158,151,.38)';c.lineWidth=1.05;c.beginPath();c.moveTo(x-w*.8+lean,y-h*.65);c.quadraticCurveTo(x-w*.45+lean,y-h*.94,x+lean,y-h+1);c.stroke();
  // Mineral veins describe a long feather, sunk into the basalt face.
  c.save();c.translate(x+lean*.5,y-h*.47);c.rotate((j-2)*.1);c.strokeStyle='#b1837f';c.lineWidth=1.1;c.beginPath();c.moveTo(0,42);c.bezierCurveTo(-27,17,-25,-35,0,-58);c.bezierCurveTo(25,-33,28,13,0,42);c.stroke();c.strokeStyle='#d4a382';c.lineWidth=.7;c.beginPath();c.moveTo(0,39);c.quadraticCurveTo(-2,-14,0,-54);c.stroke();for(let z=0;z<5;z++){const yy=-33+z*13,ww=Math.sin((z+1)/6*Math.PI)*16;c.beginPath();c.moveTo(-ww,yy-7);c.lineTo(0,yy+5);c.lineTo(ww,yy-7);c.stroke();}c.restore();
  for(let k=0;k<3;k++){const yy=y-h*.18-k*h*.23;c.strokeStyle='rgba(205,152,145,.14)';c.lineWidth=.7;c.beginPath();c.moveTo(x-w*.6,yy);c.lineTo(x-3,yy-5);c.lineTo(x+w*.4,yy+3);c.stroke();}
 }
 if(v===1){c.strokeStyle='#a14c70';c.lineWidth=5;c.beginPath();c.moveTo(47,330);c.bezierCurveTo(87,112,380,80,436,330);c.stroke();c.strokeStyle='#d58a89';c.lineWidth=1.2;c.stroke();for(let j=0;j<7;j++){const x=99+j*47,y=209-Math.sin(j/6*Math.PI)*66;c.save();c.translate(x,y);c.rotate((j-3)*.17+Math.PI);c.drawImage(dn5Flora(j%2?4:1),-23,-55,46,60);c.restore();}}
 for(let j=0;j<38;j++){const x=43+R()*390,y=320+R()*40;c.fillStyle=j%2?'#8c667f':'#c17988';c.beginPath();c.ellipse(x,y,1+R()*3,.7+R()*1.2,0,0,6.283);c.fill();}
 DN5.relics[v]=cv;return cv;
}
function dn5Midground(tm){
 const landmarks=DN5_LANDMARKS,f0=.56;
 g.setTransform(S,0,0,S,-cam.x*S*f0,-cam.y*S*.64);
 for(let j=0;j<landmarks.length;j++){const x=nx(landmarks[j])*f0;if(x<cam.x*f0-500||x>cam.x*f0+W/S+500)continue;g.globalAlpha=.57;g.drawImage(dn5RelicArt(j%2),x-340,755-538,680,538);}
 g.globalAlpha=1;
 const f=.52,left=cam.x*f-350,right=cam.x*f+W/S+350;g.setTransform(S,0,0,S,-cam.x*S*f,-cam.y*S*.64);
 for(let q=Math.floor(left/660);q<=Math.ceil(right/660);q++){const R=rng(q*591+875),x=q*660+R()*180,bm=dn5Biome(x/f),base=785+R()*70,k=.75+R()*.3;g.globalAlpha=.56;
  if(bm===1||bm===2){dn5Arch(g,x,base,370*k,410*k,bm===2?'#465f7f':'#59617c');for(let j=0;j<4;j++){const yy=base-370*k+Math.sin(j*.8)*28;g.save();g.translate(x+(j-1.5)*56*k,yy);g.rotate(Math.PI+Math.sin(tm*.21+q+j)*.02);g.drawImage(dn5Flora((j+q+40)%10),-110*k,-225*k,220*k,251*k);g.restore();}}
  else if(bm===4){g.drawImage(dn5RockArt(3+Math.abs(q)%3),x-260*k,base-153*k,520*k,270*k);g.globalAlpha=.34;g.drawImage(dn5Flora((Math.abs(q)+8)%10),x-90*k,base-180*k,180*k,206*k);}
  else{g.drawImage(dn5RockArt(Math.abs(q)%3),x-215*k,base-90*k,430*k,180*k);g.drawImage(dn5Flora((Math.abs(q)+bm*2)%10),x-150*k,base-300*k,300*k,343*k);}
  g.globalAlpha=bm===4?.15:.3;g.drawImage(dn5Flora((Math.abs(q)*3+2)%10),x-250*k,base-260*k,260*k,297*k);
  g.globalCompositeOperation='lighter';dn5Glow(bm===2?'#94d9dc':'#ffc8a1',x,base-120*k,260*k,125*k,.12);g.globalCompositeOperation='source-over';
 }g.globalAlpha=1;
 // The lava system remains visible during ordinary exploration, not only the ride.
 // These falls sit in a separate depth plane and leave the hero's silhouette open.
 const cols=DN5_FALL_COLS;
 for(let j=0;j<cols.length;j++){
  const x=nx(cols[j])*.72;if(x<cam.x*.72-180||x>cam.x*.72+W/S+180)continue;
  const k=.75+(j%3)*.11,base=875;g.setTransform(S,0,0,S,-cam.x*S*.72,-cam.y*S*.73);g.globalAlpha=.71;
  g.drawImage(dn5Fall(j%3),x-110*k,base-500*k,220*k,500*k);g.globalAlpha=1;
  dn5FallActivity(x,base,k,tm,j);
  g.globalCompositeOperation='lighter';dn5Glow('#ffbf91',x,base-130*k,80*k,140*k,.09+.015*Math.sin(tm*.65+j));g.globalCompositeOperation='source-over';
 }
}
function dn5Lava(tm){
 const left=Math.max(cam.x-100,295*T),right=Math.min(cam.x+VW+100,430*T);if(left>right)return;
 g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);g.fillStyle='#b64d65';g.fillRect(left,795,right-left,405);
 g.fillStyle='#e87958';g.beginPath();g.moveTo(left,806);for(let x=left;x<=right+24;x+=24)g.lineTo(x,796+Math.sin(x*.009+tm*.65)*5+Math.sin(x*.018-tm*.3)*2);g.lineTo(right+24,1130);g.lineTo(left,1130);g.closePath();g.fill();
 // Mineral islands of cooled lavender crust glide past long golden seams.
 for(let q=Math.floor((left-180)/180);q<=Math.ceil((right+180)/180);q++){const R=rng(q*51+619),x=q*180+Math.sin(tm*.1+q)*12,y=835+R()*210,w=100+R()*105,h=18+R()*30;g.fillStyle=q%3?'rgba(137,98,119,.2)':'rgba(98,91,122,.26)';g.beginPath();g.moveTo(x-w*.5,y);g.lineTo(x-w*.28,y-h*.5);g.lineTo(x+w*.32,y-h*.38);g.lineTo(x+w*.5,y);g.lineTo(x+w*.2,y+h*.42);g.lineTo(x-w*.35,y+h*.3);g.closePath();g.fill();g.strokeStyle='rgba(255,222,167,.65)';g.lineWidth=1.2;g.beginPath();g.moveTo(x-w*.5,y+4);g.quadraticCurveTo(x,y+h*.9,x+w*.5,y+4);g.stroke();}
 g.globalCompositeOperation='lighter';for(let q=Math.floor(left/270);q<=Math.ceil(right/270);q++){const x=q*270;dn5Glow('#ffc28e',x,827,250,130,.21+.02*Math.sin(tm*.7+q));dn5Glow('#ffe0a4',x,801,160,18,.26);}
 g.globalCompositeOperation='source-over';g.strokeStyle='rgba(255,239,191,.58)';g.lineWidth=1;for(let j=0;j<7;j++){const yy=823+j*25;g.beginPath();for(let x=left;x<=right+15;x+=15){const y=yy+Math.sin(x*.011+tm*(j%2?.25:-.3)+j)*4;if(x===left)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();}
 // Thin reflections stretch vertically below the real falls. They shear with
 // the current, retaining red molten depth between the pale hot seams.
 for(let q=Math.floor(left/310);q<=Math.ceil(right/310);q++)for(let j=0;j<5;j++){const xx=q*310+Math.sin(tm*.8+j*.75+q)*15,yy=817+j*14,w=(1-j/6)*(30+Math.sin(q*1.7)*9);g.strokeStyle=j%2?'rgba(255,214,133,.23)':'rgba(248,151,94,.3)';g.lineWidth=2.8-j*.35;g.beginPath();g.moveTo(xx-w,yy);g.quadraticCurveTo(xx,yy+2.5,xx+w,yy);g.stroke();}
 for(const a of DN5.riverBloom){const age=now-a.t;if(age<0||age>7)continue;const u=age/7;g.globalCompositeOperation='lighter';dn5Glow('#ffcf88',a.x,808,90+age*65,20+age*8,(1-u)*.11);g.globalCompositeOperation='source-over';}g.globalAlpha=1;
}
function dn5Plants(tm){
 const left=cam.x-180,right=cam.x+VW+180;g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);
 for(let q=Math.floor(left/176);q<=Math.ceil(right/176);q++){const R=rng(q*251+718),x=q*176+R()*90,y=dn5Surface(x),bm=dn5Biome(x);if(y>=1200)continue;const v=(Math.abs(q)*3+bm*2)%10,k=.22+R()*.3,dist=Math.abs(x-P.x),near=dist<90&&Math.abs(y-P.y)<150,lean=Math.sin(tm*.65+q)*.025+Math.sin(tm*.29+q*1.7)*.009+(near?(x>P.x?.075:-.075):0);g.save();g.translate(x,y+3);g.rotate(lean);g.globalAlpha=.93;g.drawImage(dn5Flora(v),-140*k,-300*k,280*k,320*k);g.restore();
  // Decorative plants carry pigment and mineral edges, never a touch-target
  // halo. The interactive gardens own the clear golden invitation to play.
 }
 // Nearby waking gardens send a broad, restrained warm colour through their plants.
 for(const a of DN5.life){const age=now-a.t;if(age<0||age>14||a.x<left-600||a.x>right+600)continue;const r=age*160;g.globalCompositeOperation='lighter';dn5Glow(DN5_COL[a.v],a.x,a.y-40,80+r,25+r*.28,Math.sin(age/14*Math.PI)*.1);g.globalCompositeOperation='source-over';}
 g.globalAlpha=1;
}
function dn5Background(tm){
 if(!dn5Ready())return;dn5Sky();const inside=dn5Inside();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(DN5.sky,0,0,W,H);if(inside>.002){g.globalAlpha=inside;g.drawImage(DN5.heartSky,0,0,W,H);g.globalAlpha=1;}dn5Backdrop(tm);dn5Midground(tm);dn5Lava(tm);
 // Pearl-coloured breath above the distant caldera, lifted as translucent ribbons.
 const yy=DN5.peakY,xx=DN5.peakX;g.setTransform(S,0,0,S,0,0);g.lineCap='round';g.lineWidth=4;g.strokeStyle='rgba(239,190,169,.045)';g.globalAlpha=1-inside;for(let j=0;j<3;j++){g.beginPath();g.moveTo(xx+(j-1)*10,yy);g.bezierCurveTo(xx-35+Math.sin(tm*.3+j)*10,yy-55,xx+40,yy-85,xx+28+Math.sin(tm*.22+j)*18,yy-160-j*20);g.stroke();}
 g.globalAlpha=1;
}
function dn5World(tm){if(!dn5Ready())return;dn5Terrain();dn5Plants(tm);g.globalCompositeOperation='source-over';g.globalAlpha=1;}
const dn5R=rng(5337),DN5_DUST=Array.from({length:70},(_,i)=>({x:dn5R()*6500,y:dn5R()*1300,z:.25+dn5R()*1.1,ph:dn5R()*6.283,r:.7+dn5R()*1.7,col:DN5_COL[i%8],sp:.5+dn5R()}));
function dn5Motes(tm,zMin,zMax){
 if(!dn5Ready())return;const vw=W/S,vh=H/S;g.setTransform(S,0,0,S,0,0);g.globalCompositeOperation='lighter';
 for(let i=0;i<DN5_DUST.length;i++){const p=DN5_DUST[i];if(p.z<zMin||p.z>=zMax)continue;const x=((p.x-cam.x*p.z+Math.sin(tm*.25+p.ph)*22)%(vw+100)+vw+100)%(vw+100)-50,y=((p.y-cam.y*p.z-tm*p.sp*7+Math.sin(tm*.2+p.ph)*12)%(vh+100)+vh+100)%(vh+100)-50,a=(.25+.16*Math.sin(tm*1.4+p.ph))*(p.z>.8?.9:.6);dn5Glow(p.col,x,y,p.r*5,p.r*5,a*.65);g.fillStyle=p.col;g.globalAlpha=a;g.beginPath();g.ellipse(x,y,p.r*.55,p.r,Math.sin(tm+p.ph)*.3,0,6.283);g.fill();}
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
function dn5Petals(tm){
 if(!dn5Ready())return;g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);g.globalCompositeOperation='lighter';
 // Feza's footsteps stir a low trail of tiny golden seeds, never a screen-filling cloud.
 if(!P.ucus&&P.ground&&Math.abs(P.vx||0)>35){for(let j=0;j<6;j++){const a=(tm*1.5+j/6)%1,x=P.x-P.f*(a*60+8),y=P.y-2-a*18+Math.sin(j*1.6+tm*2)*3;dn5Glow('#ffd49b',x,y,6,4,(1-a)*.25);}}
 if(DN5.finT!==null){const age=now-DN5.finT,f=Math.max(0,Math.min(1,age/7));for(let j=0;j<28;j++){const a=j*.91+tm*.2,r=80+j*7,x=DN5.finX+Math.cos(a)*r,y=BOLUM.kor.y-140-Math.sin(a)*r*.4-(age*19+j*17)%400;dn5Glow(DN5_COL[j%8],x,y,14,9,f*.48);}}
 g.globalCompositeOperation='source-over';g.globalAlpha=1;
}
// Scenery yields to an actual play target as well as the child. Screen-world
// coordinates share the current S scale; no extra canvases or per-frame lists.
function dn5PlayClearance(x,y,rx,ry){
 let a=1;
 if(typeof VK5!=='undefined'&&typeof vk5GardenPosition==='function')for(const o of NESNELER){
  if(o.tip==='korCicegi'&&!o.started&&typeof vk5FinalReady==='function'&&vk5FinalReady()){
   const dx=(x-(o.x-cam.x))/(rx+130),dy=(y-(o.y-215-cam.y))/(ry+165),d=dx*dx+dy*dy;
   if(d<1)a=Math.min(a,.12+.88*smooth(d));
  }
  if(o.tip!=='korBahce'||o.done||o.x<cam.x-1200||o.x>cam.x+VW+1200)continue;
  for(let i=0;i<o.nodes.length;i++){
   const n=o.nodes[i];if(n.done)continue;
   const p=vk5GardenPosition(o,i,now,VK5.point),dx=(x-(p.x-cam.x))/(rx+66),dy=(y-(p.y-cam.y))/(ry+76),d=dx*dx+dy*dy;
   if(d<1)a=Math.min(a,.12+.88*smooth(d));
  }
 }
 if(typeof KR5!=='undefined'&&KR5.aktif){
  const o=KR5.aktif,dx=Math.abs(x-(o.x-cam.x)),dy=Math.abs(y-(o.y-215-cam.y));
  const k=(1-smooth(clamp((dx-325)/(rx+80),0,1)))*(1-smooth(clamp((dy-220)/(ry+65),0,1)));
  a=Math.min(a,1-k*.91);
 }
 return a;
}
function dn5Foreground(tm){
 if(!dn5Ready())return;const f=1.08,vh=H/S,left=cam.x*f-160,right=cam.x*f+W/S+160;g.setTransform(S,0,0,S,-cam.x*S*f,0);
 for(let q=Math.floor(left/590);q<=Math.ceil(right/590);q++){const R=rng(q*71+881),x=q*590+R()*130,y=vh+65,k=.42+R()*.2,worldx=x/f,near=Math.abs(worldx-P.x)<140;g.save();g.translate(x,y);g.rotate(Math.sin(tm*.35+q)*.025);g.globalAlpha=near?.12:dn5Biome(worldx)===3?.14:.34;g.drawImage(dn5Flora((Math.abs(q)*3+5)%10),-140*k,-300*k,280*k,320*k);g.restore();}g.globalAlpha=1;
 // Large red and violet origami blossoms frame the path. Their own pigment is
 // saturated; only a blossom overlapping Feza yields to his readable silhouette.
 const bf=1.035,cols=DN5_BLOOM_COLS,px=(Number.isFinite(P.rx)?P.rx:P.x)-cam.x,py=(Number.isFinite(P.ry)?P.ry:P.y)-cam.y;g.setTransform(S,0,0,S,-cam.x*S*bf,0);
 for(let j=0;j<cols.length;j++){
  const wx=nx(cols[j]),x=wx*bf;if(x<cam.x*bf-165||x>cam.x*bf+W/S+165)continue;const k=.79+(j%3)*.09,dx=Math.abs(x-cam.x*bf-px),dy=Math.abs(vh+65-175*k-(py-34));
  const overlap=(1-smooth(clamp((dx-48*k-20)/(70*k),0,1)))*(1-smooth(clamp((dy-46*k-27)/(40*k),0,1))),alpha=(.98-overlap*.8)*dn5PlayClearance(x-cam.x*bf,vh+65-170*k,125*k,155*k);
  g.save();g.translate(x,vh+65);g.rotate(Math.sin(tm*.37+j)*.016+Math.sin(tm*.17+j*1.7)*.005);g.scale(1+Math.sin(tm*.49+j)*.006,1);g.globalAlpha=alpha;g.drawImage(dn5Bloom(j%2),-155*k,-310*k,310*k,320*k);g.restore();
 }g.globalAlpha=1;
}
function dn5Vignette(){if(!dn5Ready())return;dn5Sky();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(DN5.vig,0,0,W,H);}
function dn5Isit(){
 if(!dn5Ready())return false;dn5Sky();if(DN5.prep<10){dn5Flora(DN5.prep++);return false;}if(DN5.prep<14){dn5Mountain(DN5.prep++-10);return false;}if(DN5.prep<18){dn5Chunk(DN5.prep++-14);return false;}if(DN5.prep<26){glow(DN5_COL[DN5.prep++-18]);return false;}if(DN5.prep<31&&typeof vk5Warm==='function'){if(!vk5Warm())return false;DN5.prep=31;return false;}if(DN5.prep<34){dn5Fall(DN5.prep++-31);return false;}if(DN5.prep<36){dn5CraterWall(DN5.prep++-34);return false;}if(DN5.prep<38){dn5Bloom(DN5.prep++-36);return false;}if(DN5.prep<40){dn5MoltenArt(DN5.prep++-38);return false;}if(DN5.prep<46){dn5RockArt(DN5.prep++-40);return false;}if(DN5.prep<61){glow(DN5_TOUCH_GLOWS[DN5.prep++-46]);return false;}if(DN5.prep<63){dn5RelicArt(DN5.prep++-61);return false;}if(typeof ANKA!=='undefined'&&!ANKA.hazir&&!ANKA.isit())return false;DN5.warm=true;return true;
}

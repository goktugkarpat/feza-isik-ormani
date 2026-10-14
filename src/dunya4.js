/* dunya4.js – İnci Denizi: sedefli kum, katmanlı mercan bahçeleri, suyun içinden süzülen gün ışığı.
   Dünya; 1024 birimlik zemin parçaları, mercan bahçesi atlasları ve eklemli bitkilerle çizilir.
   Kare içinde yeni gradyan, gölge filtresi veya büyük geçici tuval oluşturulmaz. */
'use strict';
const DN4={warm:null,vig:null,key:'',atlas:[],chunks:new Map(),prep:0,finT:null,finX:0};
OLAY.on('inciDalga',e=>{if(DN4.finT===null){DN4.finT=typeof now==='number'?now:0;DN4.finX=e&&e.o?e.o.x:COLS*T-1600;}});
const dn4Cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const dn4Rand=rng(704);
const DN4_DUST=Array.from({length:36},()=>({x:dn4Rand()*5000,y:dn4Rand()*1100,z:.25+dn4Rand()*1.4,ph:dn4Rand()*6.28,r:.7+dn4Rand()*1.5}));
function dn4Ready(){return W>0&&H>0&&S>0&&Number.isFinite(cam.x)&&Number.isFinite(cam.y);}
function dn4SeaColor(x){return x<240*T?'#44c9cb':x<355*T?'#4babbc':x<445*T?'#42b2c7':'#62ced0';}
function dn4BakeSky(){
 const k=W+'x'+H;if(DN4.key===k)return;DN4.key=k;
 let c;
 DN4.warm=dn4Cv(480,600);c=DN4.warm.getContext('2d');const warm=c.createRadialGradient(330,245,15,300,250,370);warm.addColorStop(0,'rgba(255,172,94,.16)');warm.addColorStop(.4,'rgba(242,102,188,.085)');warm.addColorStop(1,'rgba(179,140,192,0)');c.fillStyle=warm;c.fillRect(0,0,480,600);
 DN4.vig=dn4Cv(160,120);c=DN4.vig.getContext('2d');const v=c.createRadialGradient(80,56,35,80,56,105);v.addColorStop(0,'rgba(8,37,65,0)');v.addColorStop(.6,'rgba(8,37,65,.02)');v.addColorStop(1,'rgba(8,37,65,.38)');c.fillStyle=v;c.fillRect(0,0,160,120);
}
function dn4Mix(a,b,t){const A=[parseInt(a.slice(1,3),16),parseInt(a.slice(3,5),16),parseInt(a.slice(5,7),16)],B=[parseInt(b.slice(1,3),16),parseInt(b.slice(3,5),16),parseInt(b.slice(5,7),16)];return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function dn4Volume(c,x,y,rx,ry,col,lit){const v=c.createRadialGradient(x-rx*.3,y-ry*.45,1,x,y,rx*1.1);v.addColorStop(0,lit||dn4Mix(col,'#fff5da',.58));v.addColorStop(.38,col);v.addColorStop(1,dn4Mix(col,'#102b43',.74));c.fillStyle=v;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill();}
function dn4CoralSprite(index){
 if(DN4.atlas[index])return DN4.atlas[index];const cv=dn4Cv(480,560),c=cv.getContext('2d'),R=rng(719+index);c.scale(2,2);c.lineCap='round';c.lineJoin='round';
 const cols=['#e97992','#ac7fdb','#39cfb5','#e5aa56','#54b8e6','#ee83b5','#9671dd','#29ccb3','#e8af54','#e979ad'],col=cols[index%10],light=dn4Mix(col,'#fff3d4',.36),dark=dn4Mix(col,'#142a40',.58),kind=index%6;
 const fit=kind===0||kind===5?.82:.9;c.translate(120,270);c.scale(fit,fit);c.translate(-120,-270);
 if(kind===0){
  function branch(x,y,ang,len,depth,w){const ex=x+Math.sin(ang)*len,ey=y-Math.cos(ang)*len,mx=x+Math.sin(ang-.15)*len*.42,my=y-len*.47;const p=new Path2D();p.moveTo(x,y);p.quadraticCurveTo(mx,my,ex,ey);c.strokeStyle=dark;c.lineWidth=w+1;c.stroke(p);const skin=c.createLinearGradient(x-w*.55,y,x+w*.55,y);skin.addColorStop(0,dark);skin.addColorStop(.18,col);skin.addColorStop(.4,light);skin.addColorStop(.65,col);skin.addColorStop(1,dn4Mix(col,'#28385b',.35));c.strokeStyle=skin;c.lineWidth=w;c.stroke(p);c.save();c.translate(-w*.17,-1);c.strokeStyle=light;c.globalAlpha=.27;c.lineWidth=Math.max(.9,w*.13);c.stroke(p);c.restore();
   for(let j=1;j<5;j++){const u=j/5,px=(1-u)*(1-u)*x+2*(1-u)*u*mx+u*u*ex,py=(1-u)*(1-u)*y+2*(1-u)*u*my+u*u*ey;dn4Volume(c,px-w*.23,py,w*.16+1,w*.14+1,col,light);}
   if(depth>0){branch(ex,ey,ang-.3-R()*.4,len*(.58+R()*.12),depth-1,w*.66);if(depth%2||R()>.3)branch(ex,ey,ang+.3+R()*.45,len*(.58+R()*.12),depth-1,w*.66);}else {dn4Volume(c,ex,ey,2.3,3.3,col,light);c.globalCompositeOperation='lighter';c.globalAlpha=.7;c.drawImage(dn4Aura(DN4_JEWELS[index%10]),ex-10,ey-10,20,20);c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  }
  for(let j=0;j<3;j++)branch(117+(j-1)*18,271,(j-1)*.28,74+R()*16,3,17);
 }else if(kind===1){
  const p=new Path2D();p.moveTo(118,265);for(let j=0;j<=70;j++){const a=Math.PI+.04+j/70*Math.PI*.94,rx=98+Math.sin(j*2.9)*4,ry=112+Math.sin(j*.91)*8;p.lineTo(120+Math.cos(a)*rx,169+Math.sin(a)*ry);}p.lineTo(124,265);p.closePath();const f=c.createRadialGradient(120,110,5,120,170,140);f.addColorStop(0,dn4Mix(col,'#ffe9d5',.32));f.addColorStop(.6,col);f.addColorStop(1,dark);c.fillStyle=f;c.fill(p);c.strokeStyle=light;c.lineWidth=1.2;c.stroke(p);c.globalCompositeOperation='lighter';c.strokeStyle=DN4_JEWELS[index%10];c.lineWidth=1.4;c.globalAlpha=.65;c.stroke(p);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.save();c.clip(p);
  for(let j=0;j<36;j++){const a=Math.PI+.08+j/35*Math.PI*.88,ex=120+Math.cos(a)*105,ey=169+Math.sin(a)*122;c.strokeStyle=j%2?'rgba(255,237,215,.43)':'rgba(73,43,80,.38)';c.lineWidth=j%3?.8:1.7;c.beginPath();c.moveTo(120,261);c.bezierCurveTo(120+(ex-120)*.16,205,ex+(ex-120)*.12,ey+30,ex,ey);c.stroke();}
  for(let j=0;j<120;j++){const x=25+R()*190,y=58+R()*180;c.strokeStyle='rgba(247,224,226,.2)';c.lineWidth=.6;c.beginPath();c.ellipse(x,y,3+R()*4,2+R()*3,0,0,6.28);c.stroke();}c.restore();
 }else if(kind===2){
  for(const j of [0,5,1,4,2,3]){const x=40+j*31+R()*10,y=126+R()*50,h=84+R()*42,w=11+R()*6;c.save();c.translate(x,259);c.rotate((j-2.5)*.055);const tube=c.createLinearGradient(-w,0,w,0);tube.addColorStop(0,dark);tube.addColorStop(.25,light);tube.addColorStop(.5,col);tube.addColorStop(1,dark);c.fillStyle=tube;c.beginPath();c.moveTo(-w*.65,8);c.bezierCurveTo(-w*1.3,-h*.3,-w*.83,-h*.8,-w,-h);c.lineTo(w,-h);c.bezierCurveTo(w*.85,-h*.75,w*1.4,-h*.3,w*.65,8);c.closePath();c.fill();
   for(let k=0;k<9;k++){const yy=-h+14+k*h/10;c.strokeStyle='rgba(235,248,211,.18)';c.lineWidth=.9;c.beginPath();c.ellipse(0,yy,w*.9,3.1,0,.2,Math.PI-.2);c.stroke();}for(let k=0;k<30;k++){c.fillStyle=k%2?'rgba(233,243,209,.16)':'rgba(18,51,57,.2)';c.beginPath();c.arc((R()-.5)*w*1.6,-R()*h,1.1+R(),0,6.28);c.fill();}
   c.fillStyle=light;c.beginPath();c.ellipse(0,-h,w,5.4,0,0,6.28);c.fill();c.fillStyle='#234a54';c.beginPath();c.ellipse(.8,-h+1,w*.64,3.1,0,0,6.28);c.fill();c.strokeStyle='rgba(255,245,221,.65)';c.lineWidth=.9;c.beginPath();c.ellipse(0,-h,w,5.4,0,Math.PI,6.28);c.stroke();c.globalCompositeOperation='lighter';c.globalAlpha=.6;c.drawImage(dn4Aura(DN4_JEWELS[index%10]),-w*1.7,-h-w*.9,w*3.4,w*1.8);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.restore();}
 }else if(kind===3){
  for(const [x,y,rx,ry] of [[64,232,39,36],[172,225,42,41],[118,199,70,68]]){dn4Volume(c,x,y,rx,ry,col,light);c.save();c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.28);c.clip();for(let j=-9;j<=9;j++){const yy=y+j*7;c.strokeStyle=dn4Mix(col,'#153842',.48);c.lineWidth=2.4;c.beginPath();for(let k=0;k<25;k++){const xx=x-rx+k*rx/12,py=yy+Math.sin(k*.78+j*.9)*3.5;if(!k)c.moveTo(xx,py);else c.lineTo(xx,py);}c.stroke();c.strokeStyle='rgba(255,235,197,.4)';c.lineWidth=1;c.stroke();}c.restore();}
 }else if(kind===4){
  for(let j=0;j<5;j++){const y=250-j*31,rx=95-j*10,ry=22+R()*6,x=120+Math.sin(j*1.5)*15;const p=new Path2D();for(let k=0;k<=90;k++){const a=k/90*6.283,w=1+Math.sin(k*1.31)*.035+Math.sin(k*.4)*.025;const px=x+Math.cos(a)*rx*w,py=y+Math.sin(a)*ry*w;if(!k)p.moveTo(px,py);else p.lineTo(px,py);}p.closePath();const gr=c.createLinearGradient(x,y-ry,x,y+ry);gr.addColorStop(0,light);gr.addColorStop(.45,col);gr.addColorStop(1,dark);c.fillStyle=gr;c.fill(p);c.strokeStyle=dn4Mix(col,'#d5e6ef',.55);c.lineWidth=1.4;c.stroke(p);c.globalCompositeOperation='lighter';c.strokeStyle=DN4_JEWELS[index%10];c.lineWidth=1.4;c.globalAlpha=.65;c.stroke(p);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.save();c.clip(p);for(let k=0;k<35;k++){c.fillStyle='rgba(249,231,211,.2)';c.beginPath();c.arc(x+(R()-.5)*rx*1.8,y+(R()-.5)*ry*1.2,.8+R(),0,6.28);c.fill();}c.restore();}
 }else{
  dn4Volume(c,120,257,69,15,dark,col);for(let j=0;j<28;j++){const a=-1.3+j/27*2.6,L=65+R()*80,ex=120+Math.sin(a)*L,ey=247-Math.cos(a)*L,gr=c.createLinearGradient(120,250,ex,ey);gr.addColorStop(0,dark);gr.addColorStop(.6,col);gr.addColorStop(1,light);c.strokeStyle=gr;c.lineWidth=3+R()*4;c.beginPath();c.moveTo(120+(R()-.5)*45,252);c.bezierCurveTo(120+Math.sin(a)*L*.45+10,225-L*.25,ex-9,ey+21,ex,ey);c.stroke();dn4Volume(c,ex,ey,2.2,3.2,col,light);c.globalCompositeOperation='lighter';c.globalAlpha=.6;c.drawImage(dn4Aura(DN4_JEWELS[index%10]),ex-8,ey-8,16,16);c.globalAlpha=1;c.globalCompositeOperation='source-over';}dn4Volume(c,120,238,21,9,col,light);
 }
 DN4.atlas[index]=cv;return cv;
}
function dn4Pebble(c,x,y,r,R){c.fillStyle=R()>.5?'rgba(146,180,168,.26)':'rgba(240,227,198,.45)';c.beginPath();c.ellipse(x,y,r,r*.42,R()*.5,0,6.28);c.fill();}
function dn4Shell(c,x,y,r,col){c.save();c.translate(x,y);c.fillStyle=col;c.strokeStyle='rgba(255,237,211,.52)';c.lineWidth=1.5;c.beginPath();c.moveTo(0,6);c.bezierCurveTo(-r,r*.1,-r,-r*.8,0,-r);c.bezierCurveTo(r,-r*.8,r,r*.1,0,6);c.fill();for(let j=-2;j<=2;j++){c.beginPath();c.moveTo(0,5);c.quadraticCurveTo(j*r*.25,-r*.35,j*r*.25,-r*.77);c.stroke();}c.restore();}
function dn4Biome(x){return x<55*T?0:x<240*T?1:x<290*T?2:x<355*T?3:x<445*T?4:5;}
function dn4Surface(x){let sum=0,w=0;for(let j=-3;j<=3;j++){const a=4-Math.abs(j);sum+=yuzey(Math.max(0,Math.min(COLS-1,Math.floor(x/T)+j)))*a;w+=a;}return sum/w+Math.sin(x*.017)*3.2+Math.sin(x*.037)*1.5;}
function dn4Rock(c,x,y,w,h,kind,col,seed){
 const R=rng(seed),p=new Path2D();p.moveTo(x-w*.55,y);const pts=[];for(let j=0;j<=18;j++){const a=Math.PI+j/18*Math.PI,rr=.91+R()*.13;pts.push([x+Math.cos(a)*w*.5*rr,y+Math.sin(a)*h*rr]);}p.lineTo(pts[0][0],pts[0][1]);for(let j=0;j<pts.length;j++){const a=pts[j],b=pts[(j+1)%pts.length];p.quadraticCurveTo(a[0],a[1],(a[0]+b[0])*.5,(a[1]+b[1])*.5);}p.quadraticCurveTo(x,y+Math.min(12,h*.12),x-w*.5,y);p.closePath();
 if(kind===2){p.moveTo(x-w*.22,y+52);p.lineTo(x+w*.22,y+52);p.bezierCurveTo(x+w*.27,y-h*.3,x+w*.18,y-h*.65,x,y-h*.65);p.bezierCurveTo(x-w*.2,y-h*.66,x-w*.28,y-h*.3,x-w*.22,y+52);p.closePath();}
 const gr=c.createLinearGradient(x-w*.4,y-h,x+w*.4,y+40);gr.addColorStop(0,dn4Mix(col,'#87cfe1',.27));gr.addColorStop(.35,col);gr.addColorStop(1,dn4Mix(col,'#11263d',.68));c.fillStyle=gr;c.fill(p,'evenodd');c.save();c.clip(p,'evenodd');
 for(let j=0;j<9;j++){const yy=y-h+(j+.3+R()*.4)*h/9,dx=(R()-.5)*w*.3,ww=w*(.26+R()*.24);c.strokeStyle=j%3?'rgba(11,37,51,.16)':'rgba(164,207,190,.13)';c.lineWidth=j%3?1.1:.8;c.beginPath();c.moveTo(x+dx-ww,yy);c.bezierCurveTo(x+dx-ww*.3,yy-18+R()*30,x+dx+ww*.3,yy+20-R()*32,x+dx+ww,yy+8-R()*16);c.stroke();}
 for(let j=0;j<260;j++){const px=x+(R()-.5)*w*1.1,py=y-R()*h;const rr=.6+R()*2.5;c.fillStyle=j%3?'rgba(210,232,201,.09)':'rgba(11,37,55,.18)';c.beginPath();c.ellipse(px,py,rr*1.8,rr,.1,0,6.28);c.fill();}c.restore();
 c.strokeStyle='rgba(180,224,204,.25)';c.lineWidth=1.8;c.beginPath();for(let j=0;j<pts.length;j++){const a=pts[j],b=pts[Math.min(pts.length-1,j+1)];if(!j)c.moveTo(a[0],a[1]);c.quadraticCurveTo(a[0],a[1],(a[0]+b[0])*.5,(a[1]+b[1])*.5);}c.stroke();
}
function dn4Chunk(index,mode){
 const far=mode===true,mid=mode==='mid',key=index+':'+mode;if(DN4.chunks.has(key)){const cached=DN4.chunks.get(key);DN4.chunks.delete(key);DN4.chunks.set(key,cached);return cached;}
 const cv=dn4Cv(1120,1200),c=cv.getContext('2d'),R=rng(index*191+(far?448:mid?883:128)),x0=index*1024,biome=dn4Biome(x0/(far?.2:mid?.54:1));
 const stone=['#294c79','#205668','#364b89','#635190','#234876','#3e6495'][biome];c.translate(48,0);
 if(far||mid){
  c.globalAlpha=far?.4:.68;const bottom=far?750:920;
  // Bölgesel resif siluetleri üç ayrı derinlikte; oyuncunun yolu her zaman açık.
  const factor=far?.2:.54;
  // Landmarks derive from WORLD cells; the same object is painted on both sides of a tile boundary.
  for(let q=Math.floor((x0-650)/768);q<=Math.ceil((x0+1700)/768);q++){const Q=rng(q*171+883),wx=q*768+250+Q()*250,bm=dn4Biome(Math.max(0,wx/factor)),sx=wx-x0,base=bottom+100+Q()*120,arch=[0,2,3,4,5].includes(bm)&&q%3!==1,ww=arch?530+Q()*170:380+Q()*240,hh=bm===1?210+Q()*110:390+Q()*280,co=['#294c79','#205668','#364b89','#635190','#234876','#3e6495'][bm];c.globalAlpha=far?.4:.68;dn4Rock(c,sx,base,ww,hh,arch?2:0,co,q*61+12);}
  for(let q=Math.floor((x0-380)/210);q<=Math.ceil((x0+1480)/210);q++){const Q=rng(q*291+417),wx=q*210+Q()*90,bm=dn4Biome(Math.max(0,wx/factor)),x=wx-x0,base=720+Q()*170,sz=far?.65+Q()*.7:.8+Q()*.8,kind=(bm*2+Math.abs(q))%10;c.globalAlpha=far?.18:.4;c.drawImage(dn4CoralSprite(kind),x-120*sz,base-280*sz,240*sz,280*sz);}
  // Kıvrılan laminaryalar bu sabit resimden ayrı, eklemlerinden hareket eder.

 }else{
  const sandcols=[['#edcf9b','#9ba995','#335867'],['#d5c99d','#7faaa0','#325b6b'],['#dac7bb','#96a5ad','#364d67'],['#d4b8a7','#a090a2','#474e68'],['#d8d0ac','#8baab2','#3c5970'],['#f0d9b2','#a5b7ad','#3f6572']][biome];
  const surface=Array.from({length:141},(_,i)=>dn4Surface(i*8+x0));const p=new Path2D();p.moveTo(0,1200);for(let x=0;x<=1120;x+=8)p.lineTo(x,surface[x>>3]);p.lineTo(1120,1200);p.closePath();const gr=c.createLinearGradient(0,930,0,1200);gr.addColorStop(0,'#d2bb8b');gr.addColorStop(.32,'#486d9a');gr.addColorStop(1,'#1a315f');c.fillStyle=gr;c.fill(p);c.save();c.clip(p);
  for(let j=0;j<4700;j++){const x=R()*1120,base=surface[Math.min(140,x>>3)],y=base+R()*230,r=.3+R()*.85;c.fillStyle=j%4?'rgba(240,221,176,.18)':'rgba(34,63,69,.23)';c.fillRect(x,y,r,r*.7);}
  for(let j=0;j<35;j++){const x=R()*1120,y=dn4Surface(x+x0)+10+R()*120,rx=40+R()*80;c.strokeStyle='rgba(245,233,194,.2)';c.lineWidth=.85;c.beginPath();c.moveTo(x-rx,y);c.bezierCurveTo(x-rx*.4,y+8,x+rx*.6,y+10,x+rx,y-3);c.stroke();c.strokeStyle='rgba(30,67,76,.14)';c.beginPath();c.moveTo(x-rx,y+2);c.bezierCurveTo(x-rx*.4,y+10,x+rx*.6,y+12,x+rx,y-1);c.stroke();}
  const light=c.createRadialGradient(400,920,20,470,965,500);light.addColorStop(0,'rgba(255,211,139,.21)');light.addColorStop(1,'rgba(255,230,173,0)');c.fillStyle=light;c.fillRect(0,880,1120,320);c.restore();
  c.strokeStyle='rgba(255,221,153,.6)';c.lineWidth=1.6;c.beginPath();for(let x=0;x<=1120;x+=8){const y=dn4Surface(x+x0);if(!x)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();
  // Volumetric foreground stones and scattered pearls root each garden in the sand.
  for(let q=Math.floor((x0-110)/170);q<=Math.ceil((x0+1230)/170);q++){const Q=rng(q*791+414),wx=q*170+Q()*90,x=wx-x0,base=dn4Surface(wx),w=35+Q()*100,h=15+Q()*55;dn4Rock(c,x,base+7,w,h,0,dn4Mix(['#294c79','#205668','#364b89','#635190','#234876','#3e6495'][dn4Biome(wx)],'#c5c9b0',.2),q*937+21);}
  for(let q=Math.floor((x0-350)/150);q<=Math.ceil((x0+1450)/150);q++){const Q=rng(q*437+96),wx=q*150+Q()*70,x=wx-x0,bm=dn4Biome(wx),base=dn4Surface(wx);if(Math.abs(wx-nx(265))<280||Math.abs(wx-nx(500))<310)continue;const sz=.4+Q()*.63,kind=(bm*3+Math.abs(q))%10;if(q%3===1&&[0,5,6].includes(kind))continue;c.drawImage(dn4CoralSprite(kind),x-120*sz,base-270*sz,240*sz,280*sz);}
  for(let j=0;j<8;j++){const x=R()*1120,base=dn4Surface(x+x0);dn4Shell(c,x,base+2,6+R()*10,j%2?'#c9b4bb':'#e5d1a9');}
  if(biome===2||biome===5){for(let j=0;j<13;j++){const x=R()*1120,base=dn4Surface(x+x0);dn4Volume(c,x,base+1,2+R()*3,2+R()*2,'#d7d5cb','#fff1d5');}}
 }
 DN4.chunks.set(key,cv);if(DN4.chunks.size>24)DN4.chunks.delete(DN4.chunks.keys().next().value);return cv;
}
function dn4DrawChunks(mode){
 const far=mode===true,mid=mode==='mid',factor=far?.2:mid?.54:1,xx=cam.x*factor,vw=W/S,i0=Math.max(0,Math.floor(xx/1024)-1),i1=Math.min(Math.ceil(COLS*T/1024),Math.floor((xx+vw)/1024)+1),yy=(far?-40:mid?20:0)-cam.y*(far?.22:mid?.6:1);
 g.setTransform(1,0,0,1,0,0);g.globalAlpha=far?.7:mid?.72:1;
 for(let i=i0;i<=i1;i++){const x=Math.round((i*1024-xx)*S),end=Math.round(((i+1)*1024-xx)*S);g.drawImage(dn4Chunk(i,mode),48,0,1024,1200,x,Math.round(yy*S),end-x,Math.round(1200*S));}g.globalAlpha=1;
}
function dn4Preload(){
 if(DN4.pending)return;for(const mode of [false,'mid',true]){const factor=mode===true?.2:mode==='mid'?.54:1,index=Math.floor((cam.x*factor+W/S)/1024)+2,key=index+':'+mode;if(index*1024>COLS*T||DN4.chunks.has(key))continue;DN4.pending=key;
 const build=d=>{if(d&&!d.didTimeout&&d.timeRemaining()<5){requestIdleCallback(build,{timeout:1200});return;}try{dn4Chunk(index,mode);}finally{DN4.pending=null;}};
 if(typeof requestIdleCallback==='function')requestIdleCallback(build,{timeout:1200});else setTimeout(()=>build(null),45);break;}
}
function dn4Background(tm){
 if(!dn4Ready())return;dn4BakeSky();g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.globalAlpha=1;dn4DrawRegionalSky();g.globalAlpha=.35+.5*Math.max(0,Math.min(1,(cam.x-220*T)/(40*T)));g.drawImage(DN4.warm,0,0,W,H);g.globalAlpha=1;if(DN4.finT!==null){const f=Math.max(0,Math.min(1,((typeof now==='number'?now:tm)-DN4.finT)/8));g.globalCompositeOperation='source-over';g.globalAlpha=f*.4;g.drawImage(DN4_SKIES[0],0,0,W,H);g.globalCompositeOperation='lighter';g.globalAlpha=f*.5;g.drawImage(DN4.warm,0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';}
 dn4DrawChunks(true);dn4BackForest(tm,'far');dn4DrawChunks('mid');dn4BackForest(tm,'mid');dn4ReefGardens(tm);dn4Canopy(tm);dn4Preload();
 dn4LightRays(tm);
 dn4SeaLife(tm,'far');
 g.globalAlpha=1;
}
function dn4World(tm){
 if(!dn4Ready())return;dn4DrawChunks(false);g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);dn4SeabedLight(tm);dn4LivingGardens(tm);dn4CoralBlossoms(tm);dn4Currents(tm);dn4SeaLife(tm,'near');g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);g.lineCap='round';
 dn4OrganicFlora(tm);dn4MovingCorals(tm);dn4Neighbours(tm);dn4SeaAngels(tm);dn4PearlProcession(tm);
 // Sedef tavan kemerleri yolun dışında, geçidi kapatan taşlar yok.
 for(const col of [42,122,207,301,381,425,476]){const x=nx(col);if(x<cam.x-450||x>cam.x+W/S+450)continue;g.strokeStyle='rgba(69,123,145,.45)';g.lineWidth=40;g.beginPath();g.moveTo(x-180,150);g.bezierCurveTo(x-130,30,x+130,30,x+180,150);g.stroke();g.strokeStyle='rgba(150,212,208,.26)';g.lineWidth=6;g.stroke();}
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
function dn4Motes(tm,zMin,zMax){
 if(!dn4Ready())return;g.setTransform(S,0,0,S,0,0);const vw=W/S,vh=H/S;g.globalCompositeOperation='lighter';
 for(let i=0;i<DN4_DUST.length;i++){const p=DN4_DUST[i];if(p.z<zMin||p.z>=zMax)continue;const x=((p.x-cam.x*p.z+Math.sin(tm*.24+p.ph)*22)%(vw+120)+vw+120)%(vw+120)-60,y=((p.y-tm*(3+p.z*2)-cam.y*p.z)%(vh+140)+vh+140)%(vh+140)-70,col=i%4===0?'#ffd08c':i%3===0?'#a688ff':'#93f1df',pulse=.5+.5*Math.sin(tm*.8+p.ph);dn4Glow(col,x,y,p.r*4.4,p.r*4.4,.18+pulse*.24);g.globalAlpha=.3+pulse*.35;g.fillStyle=col;g.beginPath();g.ellipse(x,y,p.r*.5,p.r*.5,0,0,6.28);g.fill();if(i%6===0){g.globalAlpha=.12+pulse*.12;g.strokeStyle='#91e4ee';g.lineWidth=.65;g.beginPath();g.arc(x,y,p.r*2.3,0,6.28);g.stroke();}if(i%7===0&&pulse>.65){g.globalAlpha=(pulse-.65)*1.5;g.strokeStyle='#fff1d2';g.lineWidth=.7;g.beginPath();g.moveTo(x-3,y);g.lineTo(x+3,y);g.moveTo(x,y-3);g.lineTo(x,y+3);g.stroke();}}
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
function dn4Petals(tm){/* Deniz ortamında yaprak yağmuru yok; baloncuklar dn4Motes'ta çizilir. */}
function dn4Foreground(tm){
 if(!dn4Ready())return;const f=1.08,left=cam.x*f-120,right=cam.x*f+W/S+120;g.setTransform(S,0,0,S,-cam.x*S*f,0);
 for(let q=Math.floor(left/790);q<=Math.ceil(right/790);q++){const R=rng(q*591+788),x=q*790+R()*150,h=105+R()*85,k=h/560,bm=dn4Biome(x/f),close=typeof P!=='undefined'&&Math.abs(x/f-P.x)<95&&P.y>cam.y+H/S-160;g.globalAlpha=close?.075:.24;g.save();g.translate(x,H/S+35);for(let j=0;j<2;j++){g.rotate(Math.sin(tm*.48+q+j*.55)*(.035+j*.017));g.drawImage(dn4KelpSegment(bm%4,j),-120*k,-288*k,240*k,300*k);g.translate(0,-280*k);}g.restore();}g.globalAlpha=1;
}
function dn4Vignette(){if(!dn4Ready())return;dn4BakeSky();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.drawImage(DN4.vig,0,0,W,H);}
function dn4Isit(){
 if(!dn4Ready())return false;dn4BakeSky();if(DN4.prep===0)dn4RegionalSkies();if(DN4.prep<10){dn4CoralSprite(DN4.prep++);return false;}
 if(DN4.prep<19){const i=DN4.prep++-10,mode=[false,'mid',true][i%3],factor=mode===true?.2:mode==='mid'?.54:1;dn4Chunk(Math.floor(cam.x*factor/1024)+Math.floor(i/3),mode);return false;}if(DN4.prep<36){dn4Aura(DN4_JEWELS.concat(['#ffd08c','#a688ff','#93f1df','#ffe39f','#5fd6d4','#ffbd73','#ffe59a'])[DN4.prep++-19]);return false;}if(DN4.prep<39){dn4Beam(['#ffd178','#6cdde9','#ad8aff'][DN4.prep++-36]);return false;}if(DN4.prep===39){dn4Caustic();DN4.prep++;return false;}if(DN4.prep<47){dn4Petal(DN4_JEWELS.slice(0,5).concat(['#ffbd73','#ffe59a','#ffe39f'])[DN4.prep++-40]);return false;}if(DN4.prep<71){const i=DN4.prep++-47;dn4FaunaPart(i%6,['body','tail','wing','jelly'][Math.floor(i/6)]);return false;}if(DN4.prep<83){const i=DN4.prep++-71;dn4SmallLeaf(['#3baf9b','#378ea1','#43a8b7','#529fb4','#788cae','#4da68d'][i%6],i<6?0:1);return false;}if(DN4.prep<85){dn4FaunaPart(4,['shell','claw'][DN4.prep++-83]);return false;}if(DN4.prep<93){const i=DN4.prep++-85;dn4KelpSegment(i%4,i<4?0:1);return false;}if(DN4.prep<99){dn4ReefIsland(DN4.prep++-93);return false;}if(DN4.prep<105){dn4CeilingSprite(DN4.prep++-99);return false;}if(DN4.prep<111){dn4FaunaPart(DN4.prep++-105,'front');return false;}return true;
}

// ── Bulunan dostlara tepki veren canlı mercan bahçeleri ──
const DN4_GLOW=new Map(),DN4_BLOOM=[];
const DN4_JEWELS=['#ff9474','#a994ff','#68ead5','#ffd47b','#73c7ff','#ff91d2','#c497ff','#51dace','#e9ad64','#eb81a3'];
function dn4Aura(col){if(DN4_GLOW.has(col))return DN4_GLOW.get(col);const cv=dn4Cv(160,160),c=cv.getContext('2d'),a=parseInt(col.slice(1,3),16),b=parseInt(col.slice(3,5),16),d=parseInt(col.slice(5,7),16),v=c.createRadialGradient(80,80,0,80,80,78);v.addColorStop(0,`rgba(${a},${b},${d},.86)`);v.addColorStop(.09,`rgba(${a},${b},${d},.6)`);v.addColorStop(.3,`rgba(${a},${b},${d},.25)`);v.addColorStop(.66,`rgba(${a},${b},${d},.055)`);v.addColorStop(1,`rgba(${a},${b},${d},0)`);c.fillStyle=v;c.fillRect(0,0,160,160);DN4_GLOW.set(col,cv);return cv;}
function dn4Glow(col,x,y,rx,ry,a){if(a<.004)return;g.globalAlpha=a;g.drawImage(dn4Aura(col),x-rx,y-ry,rx*2,ry*2);g.globalAlpha=1;}
function dn4Bloom(e,type){if(!e||!e.o)return;const o=e.o;if(DN4_BLOOM.some(q=>q.id===o.id))return;DN4_BLOOM.push({id:o.id,x:o.x,y:o.y,t:typeof now==='number'?now:0,type,col:type==='oct'?'#ffbd73':type==='pearl'?'#ffe59a':DN4_JEWELS[(o.sira||0)%5]});}
OLAY.on('denizati',e=>dn4Bloom(e,'horse'));OLAY.on('ahtapotTamam',e=>dn4Bloom(e,'oct'));OLAY.on('inciUyan',e=>dn4Bloom(e,'pearl'));
function dn4GardenPower(x,tm){let f=DN4.finT===null?0:Math.max(0,Math.min(1,((typeof now==='number'?now:tm)-DN4.finT)/5));for(const a of DN4_BLOOM){const age=Math.max(0,(typeof now==='number'?now:tm)-a.t),reach=Math.min(850,age*240),dx=Math.abs(x-a.x),p=Math.max(0,1-dx/Math.max(1,reach));f=Math.max(f,p*Math.min(1,age/.7));}return f;}
function dn4LivingGardens(tm){
 const x0=cam.x-250,x1=cam.x+W/S+250;g.globalCompositeOperation='lighter';
 // Color pools reflect the coral garden; newly awakened friends send a gentle light wave through the surrounding reef.
 for(let q=Math.floor(x0/340);q<=Math.ceil(x1/340);q++){const R=rng(q*719+91),x=q*340+R()*100,bm=dn4Biome(x),y=dn4Surface(x)-145-R()*80,col=DN4_JEWELS[(bm*2+Math.abs(q))%10],alive=dn4GardenPower(x,tm),pulse=.85+.15*Math.sin(tm*.8+q*1.4);dn4Glow(col,x,y,180,120,(.4+alive*.45)*pulse);}
 for(const a of DN4_BLOOM){if(a.x<x0-700||a.x>x1+700)continue;const age=Math.max(0,(typeof now==='number'?now:tm)-a.t),u=Math.min(1,age/1.5),w=Math.sin(Math.min(1,age/4)*Math.PI);dn4Glow(a.col,a.x,a.y-20,120+u*260,100+u*190,(.23+.25*w)*u);}
 // A few tiny attached polyps breathe with the reef, not a screenful of new particles.
 for(let q=Math.floor(x0/150);q<=Math.ceil(x1/150);q++){const R=rng(q*437+96),x=q*150+R()*70,bm=dn4Biome(x),s=.4+R()*.63,kind=(bm*3+Math.abs(q))%10,y=dn4Surface(x),alive=dn4GardenPower(x,tm);for(let j=0;j<3;j++){const a=(j-1)*.47,xx=x+Math.sin(a)*45*s,yy=y-(95+j*25)*s,col=DN4_JEWELS[kind],pulse=.6+.4*Math.sin(tm*1.1+q+j);dn4Glow(col,xx,yy,9+alive*6,9+alive*6,(.26+alive*.44)*pulse);}}
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
const DN4_ROUTE=[];
function dn4FlowInit(){if(DN4_ROUTE.length)return;DN4_ROUTE.push({x:260,y:650});for(const o of NESNELER){if(['denizati','ahtapot','vatozKapisi','buyukInci'].includes(o.tip))DN4_ROUTE.push({x:o.x,y:o.y-15});}DN4_ROUTE.sort((a,b)=>a.x-b.x);}
function dn4FlowY(x){for(let i=1;i<DN4_ROUTE.length;i++){const a=DN4_ROUTE[i-1],b=DN4_ROUTE[i];if(x<=b.x){const t=Math.max(0,Math.min(1,(x-a.x)/Math.max(1,b.x-a.x)));return a.y+(b.y-a.y)*(t*t*(3-2*t));}}return DN4_ROUTE.length?DN4_ROUTE[DN4_ROUTE.length-1].y:650;}
function dn4Currents(tm){
 dn4FlowInit();const h=typeof DENIZ!=='undefined'&&DENIZ.hedef?DENIZ.hedef():null;if(!h)return;const left=cam.x-70,right=Math.min(h.x+20,cam.x+W/S+70);if(right<left)return;g.globalCompositeOperation='lighter';
 // Continuous translucent flow curves offer a destination without a new instruction or button.
 g.strokeStyle='#69dacc';g.lineWidth=1;g.globalAlpha=.095;g.beginPath();let begun=false;for(let x=Math.floor(left/25)*25;x<=right;x+=25){const y=dn4FlowY(x)+Math.sin(x*.006+tm*.22)*15;if(!begun){g.moveTo(x,y);begun=true;}else g.lineTo(x,y);}g.stroke();
 for(let q=Math.floor(left/140);q<=Math.ceil(right/140);q++){const x=q*140+((tm*14)%140),y=dn4FlowY(x)+Math.sin(x*.006+tm*.22)*15,near=Math.abs(x-h.x)<320,col=near?'#ffe39f':'#5fd6d4';dn4Glow(col,x,y,near?14:8,near?9:5,near?.32:.14);}g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
const DN4_BEAMS=new Map();let DN4_CAUSTIC=null;
function dn4Beam(col){if(DN4_BEAMS.has(col))return DN4_BEAMS.get(col);dn4Aura(col);const cv=dn4Cv(160,900),c=cv.getContext('2d'),r=parseInt(col.slice(1,3),16),b=parseInt(col.slice(3,5),16),d=parseInt(col.slice(5,7),16),e=c.createLinearGradient(0,0,160,0);e.addColorStop(0,`rgba(${r},${b},${d},0)`);e.addColorStop(.3,`rgba(${r},${b},${d},.38)`);e.addColorStop(.48,`rgba(${r},${b},${d},.75)`);e.addColorStop(.56,`rgba(${r},${b},${d},.65)`);e.addColorStop(1,`rgba(${r},${b},${d},0)`);c.fillStyle=e;c.fillRect(0,0,160,900);c.globalCompositeOperation='destination-in';const fade=c.createLinearGradient(0,0,0,900);fade.addColorStop(0,'rgba(255,255,255,.8)');fade.addColorStop(.25,'rgba(255,255,255,.7)');fade.addColorStop(.65,'rgba(255,255,255,.35)');fade.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=fade;c.fillRect(0,0,160,900);DN4_BEAMS.set(col,cv);return cv;}
function dn4Caustic(){if(DN4_CAUSTIC)return DN4_CAUSTIC;const cv=dn4Cv(1024,360),c=cv.getContext('2d');c.scale(2,2);const R=rng(913);for(let y=-20;y<210;y+=28)for(let x=-50;x<560;x+=68){const xx=x+Math.sin(y*.04)*18,yy=y+(R()-.5)*12,rx=24+R()*24,ry=12+R()*9;c.strokeStyle='rgba(84,226,209,.22)';c.lineWidth=1.3;c.beginPath();c.ellipse(xx,yy,rx,ry,(R()-.5)*.3,.3,Math.PI*1.8);c.stroke();c.strokeStyle='rgba(244,231,171,.34)';c.lineWidth=.5;c.beginPath();c.ellipse(xx+1,yy-1,rx,ry,0,.7,Math.PI*1.45);c.stroke();}c.globalCompositeOperation='destination-in';const fade=c.createLinearGradient(0,0,512,0);fade.addColorStop(0,'rgba(255,255,255,0)');fade.addColorStop(.1,'rgba(255,255,255,1)');fade.addColorStop(.9,'rgba(255,255,255,1)');fade.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=fade;c.fillRect(0,0,512,180);DN4_CAUSTIC=cv;return cv;}
function dn4LightRays(tm){
 g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S);g.globalCompositeOperation='lighter';const x0=cam.x-500,x1=cam.x+W/S+500;
 for(let q=Math.floor(x0/550);q<=Math.ceil(x1/550);q++){const R=rng(q*719+271),x=q*550+R()*170,col=q%3===0?'#ffd178':q%3===1?'#6cdde9':'#ad8aff';g.save();g.translate(x,125);g.rotate(-.24+Math.sin(tm*.16+q)*.012);g.globalAlpha=.3+.06*Math.sin(tm*.23+q);g.drawImage(dn4Beam(col),-55,0,110,1020);g.restore();dn4Glow(col,x+100,390,190,220,.11);}
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
function dn4SeabedLight(tm){
 const cv=dn4Caustic(),i0=Math.floor((cam.x-60)/512),i1=Math.ceil((cam.x+W/S+60)/512);g.globalCompositeOperation='lighter';g.globalAlpha=.35+.055*Math.sin(tm*.7);
 for(let i=i0;i<=i1;i++){const x=i*512,by=dn4Surface(x+256);g.drawImage(cv,x+Math.sin(tm*.22)*6,by-6,514,180);}g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
const DN4_PETALS=new Map();
function dn4Petal(col){if(DN4_PETALS.has(col))return DN4_PETALS.get(col);const cv=dn4Cv(96,160),c=cv.getContext('2d');c.scale(1.5,1.5);const v=c.createLinearGradient(0,95,0,0);v.addColorStop(0,dn4Mix(col,'#102551',.7));v.addColorStop(.35,col);v.addColorStop(.8,dn4Mix(col,'#fff4ce',.45));v.addColorStop(1,'#fff3d6');c.fillStyle=v;c.beginPath();c.moveTo(32,103);c.bezierCurveTo(6,71,7,34,29,8);c.bezierCurveTo(43,-3,53,23,52,45);c.bezierCurveTo(52,72,41,90,32,103);c.fill();c.strokeStyle='rgba(255,238,210,.55)';c.lineWidth=.8;c.beginPath();c.moveTo(32,99);c.quadraticCurveTo(28,58,34,14);c.stroke();c.globalCompositeOperation='lighter';c.globalAlpha=.7;c.drawImage(dn4Aura(col),17,-3,36,36);DN4_PETALS.set(col,cv);return cv;}
function dn4CoralBlossoms(tm){
 for(const o of NESNELER){if(!['denizati','ahtapot','buyukInci'].includes(o.tip)||o.x<cam.x-400||o.x>cam.x+W/S+400)continue;
  const awake=dn4GardenPower(o.x,tm),col=o.tip==='ahtapot'?'#ffbd73':o.tip==='buyukInci'?'#ffe59a':DN4_JEWELS[(o.sira||0)%5];
  for(let k=0;k<2;k++){const x=o.x+(k?150:-150),base=Math.min(dn4Surface(x)-30,o.y+140)+(k?12:0),u=.22+.78*awake,s=.4+u*.42,wave=Math.sin(tm*.7+k+o.x*.01)*.045;
   // Thin curved stems connect the luminous buds to the reef; petals unfold only after helping the nearby friend.
   g.strokeStyle=dn4Mix(col,'#152d59',.64);g.lineWidth=2.2;g.beginPath();g.moveTo(x,dn4Surface(x));g.bezierCurveTo(x-20,dn4Surface(x)-60,x+20,base+45,x,base);g.stroke();
   g.globalCompositeOperation='lighter';dn4Glow(col,x,base-30*s,72+u*40,68+u*45,.33+u*.28);g.globalCompositeOperation='source-over';
   g.save();g.translate(x,base);g.rotate(wave);for(let j=0;j<5;j++){g.save();g.rotate((j-2)*(.07+.44*u));const sz=s*(.55+.45*u);g.drawImage(dn4Petal(col),-32*sz,-104*sz,64*sz,106*sz);g.restore();}g.restore();
   g.globalCompositeOperation='lighter';dn4Glow('#ffe39f',x,base-8,9+u*8,8+u*6,.65);g.globalCompositeOperation='source-over';
  }
 }g.globalAlpha=1;
}
const DN4_SKIES=[];
function dn4RegionalSkies(){if(DN4_SKIES.length)return;const palettes=[['#1a6c82','#153b66','#0b1f47'],['#126377','#112f59','#0c1b42'],['#274577','#232451','#101336'],['#3c447f','#24204e','#111137'],['#164e7a','#132a60','#0a173e'],['#375b75','#26304e','#15163a']];
 for(let k=0;k<palettes.length;k++){const cv=dn4Cv(480,600),c=cv.getContext('2d'),a=c.createLinearGradient(0,0,0,600);a.addColorStop(0,palettes[k][0]);a.addColorStop(.5,palettes[k][1]);a.addColorStop(1,palettes[k][2]);c.fillStyle=a;c.fillRect(0,0,480,600);const rays=c.createRadialGradient(330,70,0,330,70,350);rays.addColorStop(0,k===5?'rgba(255,213,142,.13)':k===3?'rgba(210,112,237,.12)':'rgba(74,219,223,.1)');rays.addColorStop(1,'rgba(100,160,210,0)');c.fillStyle=rays;c.fillRect(0,0,480,600);DN4_SKIES.push(cv);}
}
function dn4DrawRegionalSky(){dn4RegionalSkies();const x=cam.x+W/S*.5,edges=[55*T,240*T,290*T,355*T,445*T],b=dn4Biome(x);g.drawImage(DN4_SKIES[b],0,0,W,H);for(let i=0;i<edges.length;i++){const d=x-edges[i];if(Math.abs(d)>380)continue;const u=Math.max(0,Math.min(1,(d+380)/760));g.globalAlpha=1;g.drawImage(DN4_SKIES[i],0,0,W,H);g.globalAlpha=u*u*(3-2*u);g.drawImage(DN4_SKIES[i+1],0,0,W,H);g.globalAlpha=1;break;}}
// ── Organic flora rigs. No step animation: all bending is evaluated at the current render time. ──
const DN4_LEAVES=new Map();
function dn4SmallLeaf(col,kind){const key=col+':'+kind;if(DN4_LEAVES.has(key))return DN4_LEAVES.get(key);const cv=dn4Cv(54,96),c=cv.getContext('2d');c.scale(1.5,1.5);const v=c.createLinearGradient(0,60,0,4);v.addColorStop(0,dn4Mix(col,'#112549',.6));v.addColorStop(.48,col);v.addColorStop(1,dn4Mix(col,'#bce7d0',.48));c.fillStyle=v;c.beginPath();c.moveTo(18,62);if(kind===1){c.bezierCurveTo(2,50,1,26,14,6);c.bezierCurveTo(26,-2,34,20,31,39);c.quadraticCurveTo(31,57,18,62);}else{c.bezierCurveTo(5,45,5,16,20,5);c.bezierCurveTo(33,16,30,45,18,62);}c.fill();c.strokeStyle='rgba(160,227,211,.35)';c.lineWidth=.65;c.beginPath();c.moveTo(18,60);c.quadraticCurveTo(21,35,18,12);c.stroke();DN4_LEAVES.set(key,cv);return cv;}
const DN4_RIGS=Array.from({length:108},(_,i)=>{const R=rng(2009+i*91),x=i*204+R()*140;return{x,h:70+R()*210,ph:R()*6.283,type:i%5===0?0:i%3===0?2:1,lean:(R()-.5)*65,color:['#3baf9b','#378ea1','#43a8b7','#529fb4','#788cae','#4da68d'][i%6],leafN:3+(i%3),pts:new Float32Array(28),width:4+R()*6};});
function dn4Blade(p,j,tm,base){const n=12,a=(j-(p.leafN-1)*.5)*10,L=p.h*(.67+j*.085),lean=p.lean+(j-(p.leafN-1)*.5)*18,ph=p.ph+j*.63,pt=p.pts;
 for(let k=0;k<=n;k++){const u=k/n,sw=Math.sin(u*5.1+tm*.48+ph)*u*u*18+Math.sin(tm*.38+ph)*u*9;pt[k*2]=p.x+a+lean*u+sw;pt[k*2+1]=base-L*u;}
 g.beginPath();for(let side=0;side<2;side++){for(let k=0;k<=n;k++){const q=side?n-k:k,u=q/n,w=(p.width*(.22+Math.sin(u*Math.PI)*.68)+.4)*(side?1:-1),xx=pt[q*2]+w,yy=pt[q*2+1];if(!side&&!k)g.moveTo(xx,yy);else if(side&&!k){const tipx=pt[n*2],tipy=pt[n*2+1];g.quadraticCurveTo(tipx-1,tipy,tipx,tipy-.8);g.quadraticCurveTo(tipx+1,tipy,xx,yy);}else{const prev=side?n-(k-1):k-1,pu=prev/n,pw=(p.width*(.22+Math.sin(pu*Math.PI)*.68)+.4)*(side?1:-1);g.quadraticCurveTo(pt[prev*2]+pw,pt[prev*2+1],(pt[prev*2]+pw+xx)*.5,(pt[prev*2+1]+yy)*.5);}}}g.closePath();g.fillStyle=p.color;g.fill();g.strokeStyle='rgba(7,37,65,.22)';g.lineWidth=.6;g.stroke();g.strokeStyle='rgba(155,226,198,.28)';g.lineWidth=.65;g.beginPath();g.moveTo(pt[0],pt[1]);for(let k=1;k<=n;k++)g.quadraticCurveTo(pt[(k-1)*2],pt[(k-1)*2+1],(pt[(k-1)*2]+pt[k*2])*.5,(pt[(k-1)*2+1]+pt[k*2+1])*.5);g.stroke();
}
function dn4Feather(p,j,tm,base){const lean=p.lean+(j-1)*25,L=p.h*(.78+j*.09),wave=Math.sin(tm*.42+p.ph+j*.4)*17,rootX=p.x+(j-1)*12;g.strokeStyle=dn4Mix(p.color,'#204267',.18);g.lineWidth=2;g.beginPath();g.moveTo(rootX,base);g.bezierCurveTo(rootX-10,base-L*.32,rootX+lean+wave+12,base-L*.73,rootX+lean+wave,base-L);g.stroke();const spr=dn4SmallLeaf(p.color,p.type===2?1:0);for(let k=1;k<=6;k++){const u=k/7,v=1-u,x=v*v*v*rootX+3*v*v*u*(rootX-10)+3*v*u*u*(rootX+lean+wave+12)+u*u*u*(rootX+lean+wave),y=v*v*v*base+3*v*v*u*(base-L*.32)+3*v*u*u*(base-L*.73)+u*u*u*(base-L),sz=(.25+Math.sin(u*Math.PI)*.14)*(p.type===2?1.1:1);for(const sd of [-1,1]){g.save();g.translate(x,y);g.rotate(sd*(.65+Math.sin(tm*.36+p.ph+u)*.07));g.drawImage(spr,-18*sz,-62*sz,36*sz,64*sz);g.restore();}}
}
function dn4OrganicFlora(tm){const left=cam.x-150,right=cam.x+W/S+150;g.lineCap='round';for(const p of DN4_RIGS){if(p.x<left||p.x>right)continue;const near=typeof P!=='undefined'?Math.abs(p.x-P.x):9999;g.globalAlpha=near<70?.62:1;const base=dn4Surface(p.x)+2;if(p.type===0)for(let j=0;j<p.leafN;j++)dn4Blade(p,j,tm,base);else for(let j=0;j<2;j++)dn4Feather(p,j,tm,base);}g.globalAlpha=1;}
function dn4MovingCorals(tm){const x0=cam.x-250,x1=cam.x+W/S+250;for(let q=Math.floor(x0/150);q<=Math.ceil(x1/150);q++){const R=rng(q*437+96),x=q*150+R()*70,bm=dn4Biome(x),s=.4+R()*.63,kind=(bm*3+Math.abs(q))%10;if(q%3!==1||!([0,5,6].includes(kind))||Math.abs(x-nx(265))<280||Math.abs(x-nx(500))<310)continue;g.save();g.translate(x,dn4Surface(x));g.rotate(Math.sin(tm*.5+q*.7)*.025);g.drawImage(dn4CoralSprite(kind),-120*s,-270*s,240*s,280*s);g.restore();}}
// ── Sea neighbours: detailed cached bodies with separately animated fins, wings and tails. ──
const DN4_FAUNA_CACHE=new Map();
const DN4_FAUNA_COL=['#ecc079','#52c7c3','#b591d8','#83c9e5','#ee9d97','#80cfbb'];
function dn4FaunaPart(v,part){const key=v+':'+part;if(DN4_FAUNA_CACHE.has(key))return DN4_FAUNA_CACHE.get(key);const cv=dn4Cv(180,126),c=cv.getContext('2d');c.scale(1.8,1.8);const col=DN4_FAUNA_COL[v%6],dark=dn4Mix(col,'#163251',.55),lit=dn4Mix(col,'#fff2d1',.65);c.lineCap='round';c.lineJoin='round';
 if(part==='front'){dn4Volume(c,50,35,14,20,col,lit);for(const sd of [-1,1]){c.fillStyle=col;c.beginPath();c.moveTo(50+sd*11,36);c.quadraticCurveTo(50+sd*28,28,50+sd*23,42);c.quadraticCurveTo(50+sd*17,44,50+sd*11,36);c.fill();c.fillStyle='#fff4dd';c.beginPath();c.ellipse(50+sd*6.5,28,4.4,5.6,0,0,6.28);c.fill();c.fillStyle='#233850';c.beginPath();c.ellipse(50+sd*6,29,2.8,3.8,0,0,6.28);c.fill();c.fillStyle='#fffdfa';c.beginPath();c.arc(50+sd*6,26.5,1.1,0,6.28);c.fill();}c.strokeStyle=dark;c.lineWidth=1;c.beginPath();c.arc(50,40,3.6,.2,Math.PI-.2);c.stroke();}
 else if(part==='tail'){const gr=c.createLinearGradient(18,13,48,47);gr.addColorStop(0,lit);gr.addColorStop(.4,col);gr.addColorStop(1,dark);c.fillStyle=gr;c.beginPath();c.moveTo(54,35);c.bezierCurveTo(36,29,22,8,10,13);c.quadraticCurveTo(21,34,10,56);c.bezierCurveTo(28,63,41,42,54,35);c.fill();c.strokeStyle=lit;c.lineWidth=.9;for(let j=0;j<4;j++){c.beginPath();c.moveTo(51,35);c.quadraticCurveTo(33,35,14,18+j*11);c.stroke();}}
 else if(part==='wing'){const gr=c.createLinearGradient(35,49,27,4);gr.addColorStop(0,dark);gr.addColorStop(.4,col);gr.addColorStop(1,lit);c.fillStyle=gr;c.beginPath();c.moveTo(58,51);c.bezierCurveTo(21,52,9,26,21,11);c.bezierCurveTo(39,-1,64,18,58,51);c.fill();c.strokeStyle='rgba(248,246,216,.48)';c.lineWidth=.8;for(let j=0;j<5;j++){c.beginPath();c.moveTo(56,47);c.quadraticCurveTo(28+j*4,35,23+j*6,13+j*2);c.stroke();}}
 else if(part==='jelly'){const gr=c.createRadialGradient(38,19,0,49,33,37);gr.addColorStop(0,'#f8f4e5');gr.addColorStop(.38,dn4Mix(col,'#edebff',.5));gr.addColorStop(.72,col);gr.addColorStop(1,dark);c.fillStyle=gr;c.beginPath();c.moveTo(17,45);c.bezierCurveTo(17,5,76,0,82,44);for(let j=0;j<8;j++)c.quadraticCurveTo(78-j*8,54,74-j*8,45);c.closePath();c.fill();c.strokeStyle='rgba(246,238,228,.65)';c.lineWidth=1;c.beginPath();c.moveTo(20,38);c.bezierCurveTo(28,3,67,6,75,30);c.stroke();for(const xx of [38,62]){c.fillStyle='#fff8eb';c.beginPath();c.ellipse(xx,31,5.2,6,0,0,6.28);c.fill();c.fillStyle='#253b56';c.beginPath();c.ellipse(xx+.5,32,2.8,3.8,0,0,6.28);c.fill();}c.strokeStyle='#695679';c.lineWidth=1.2;c.beginPath();c.arc(50,39,4,.2,Math.PI-.2);c.stroke();}
 else if(part==='shell'){const gr=c.createRadialGradient(37,23,1,51,38,33);gr.addColorStop(0,lit);gr.addColorStop(.48,col);gr.addColorStop(1,dark);c.fillStyle=gr;c.beginPath();c.ellipse(49,37,29,25,-.1,0,6.28);c.fill();c.strokeStyle=dn4Mix(col,'#875967',.42);c.lineWidth=2;c.beginPath();for(let j=0;j<70;j++){const a=j/70*Math.PI*4.8,r=23*(1-j/85),x=49+Math.cos(a)*r,y=36+Math.sin(a)*r*.78;if(!j)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();c.strokeStyle='rgba(255,241,210,.45)';c.lineWidth=.9;c.beginPath();c.ellipse(49,35,26,21,-.1,Math.PI*.9,Math.PI*1.75);c.stroke();}
 else if(part==='claw'){dn4Volume(c,50,35,19,12,col,lit);c.fillStyle=col;c.beginPath();c.moveTo(52,32);c.quadraticCurveTo(56,12,74,22);c.quadraticCurveTo(68,33,54,38);c.fill();c.strokeStyle=lit;c.lineWidth=1;c.beginPath();c.moveTo(50,30);c.quadraticCurveTo(59,18,69,23);c.stroke();}
 else{const ry=v===1?22:v===2?18:15,rx=v===1?28:32;const gr=c.createRadialGradient(42,24,2,51,37,38);gr.addColorStop(0,lit);gr.addColorStop(.37,col);gr.addColorStop(1,dark);c.fillStyle=gr;c.beginPath();c.moveTo(19,35);c.bezierCurveTo(20,35-ry,58,35-ry-8,76,31);c.quadraticCurveTo(91,34,78,43);c.bezierCurveTo(62,35+ry+7,29,35+ry,19,35);c.fill();c.save();c.clip();if(v===1||v===4){for(let j=0;j<3;j++){c.strokeStyle='rgba(38,80,95,.26)';c.lineWidth=3;c.beginPath();c.moveTo(32+j*11,15);c.bezierCurveTo(28+j*11,27,38+j*11,35,32+j*11,56);c.stroke();}}for(let j=0;j<18;j++){const r=rng(v*94+j*61);c.fillStyle='rgba(255,244,208,.24)';c.beginPath();c.ellipse(25+r()*36,25+r()*18,.6+r(),.6+r(),0,0,6.28);c.fill();}c.restore();c.fillStyle=dn4Mix(col,'#fff7d8',.25);c.beginPath();c.moveTo(32,24);c.quadraticCurveTo(39,6,57,20);c.lineTo(50,25);c.fill();c.strokeStyle=dark;c.lineWidth=.8;c.beginPath();c.moveTo(58,27);c.quadraticCurveTo(52,34,57,42);c.stroke();c.fillStyle='#fff5e5';c.beginPath();c.ellipse(71,30,7,7.5,0,0,6.28);c.fill();c.fillStyle='#213850';c.beginPath();c.ellipse(73,31,4.2,5,0,0,6.28);c.fill();c.fillStyle='#ffffff';c.beginPath();c.arc(73.5,28.5,1.7,0,6.28);c.fill();c.strokeStyle=dn4Mix(col,'#62576b',.55);c.lineWidth=1;c.beginPath();c.arc(79,39,3.5,.15,Math.PI*.6);c.stroke();}
 DN4_FAUNA_CACHE.set(key,cv);return cv;
}
function dn4Fish(v,x,y,size,tm,ph,vx,vy,alpha,wing){const yaw=Math.tanh((vx||.001)/8),front=Math.max(0,1-Math.abs(yaw)/.4),turn=(Math.abs(yaw)<.025?(yaw<0?-.025:.025):yaw),tilt=Math.atan2(vy||0,Math.abs(vx||1)+15)*Math.sign(turn)*.35;g.save();g.globalAlpha=alpha*(1-front*.82);g.translate(x,y);g.rotate(tilt);g.scale(size*turn,size);if(wing){g.save();g.translate(2,1);g.rotate(-.35+Math.sin(tm*3+ph)*.17);g.drawImage(dn4FaunaPart(v,'wing'),-52,-49,100,70);g.restore();g.save();g.translate(1,5);g.scale(1,-.67);g.rotate(-.2+Math.sin(tm*3+ph+.4)*.2);g.drawImage(dn4FaunaPart(v,'wing'),-52,-48,100,70);g.restore();}g.save();g.translate(-27,0);g.rotate(Math.sin(tm*4+ph)*.14);g.drawImage(dn4FaunaPart(v,'tail'),-53,-35,100,70);g.restore();g.drawImage(dn4FaunaPart(v,'body'),-50,-35,100,70);g.restore();if(front>.002){g.save();g.globalAlpha=alpha*front;g.translate(x,y);g.rotate(tilt);g.scale(size,size);g.drawImage(dn4FaunaPart(v,'front'),-50,-35,100,70);g.restore();}}
function dn4Jelly(v,x,y,size,tm,ph,alpha){g.save();g.globalAlpha=alpha;g.translate(x,y);const pulse=1+Math.sin(tm*1.6+ph)*.045;g.scale(size*pulse,size*(2-pulse));g.strokeStyle=dn4Mix(DN4_FAUNA_COL[v%6],'#e7d8ff',.48);g.lineWidth=1.8;for(let j=0;j<5;j++){const xx=(j-2)*8,wave=Math.sin(tm*1.1+ph+j*.7)*6;g.beginPath();g.moveTo(xx,9);g.bezierCurveTo(xx+wave,22,xx-wave,34,xx+wave*.6,43+j%2*7);g.stroke();}g.drawImage(dn4FaunaPart(v,'jelly'),-50,-35,100,70);g.restore();}
function dn4SeaLife(tm,layer){const far=layer==='far',factor=far?.32:1,left=cam.x*factor-420,right=cam.x*factor+W/S+420;g.setTransform(S,0,0,S,-cam.x*S*factor,-cam.y*S*(far?.45:1));
 const active=DN4_BLOOM.length?DN4_BLOOM[DN4_BLOOM.length-1]:null,age=active?Math.max(0,(typeof now==='number'?now:tm)-active.t):999;
 for(let q=Math.floor(left/620);q<=Math.ceil(right/620);q++){const R=rng(q*257+609),cx=q*620+R()*160,cy=(far?300:440)+R()*(far?350:270),ph=R()*6.28,w=.25+R()*.15,rx=95+R()*70,ry=22+R()*38,a=tm*w+ph,x=cx+Math.sin(a)*rx,y=cy+Math.cos(a*.8)*ry,vx=Math.cos(a)*rx*w,vy=-Math.sin(a*.8)*ry*w*.8,bm=dn4Biome(cx/factor),col=(Math.abs(q)+bm)%6,n=far?3:3+Math.abs(q)%2,size=far?.13:.28+R()*.065;
  if(x<left-150||x>right+150)continue;let cheer=0;if(!far&&active&&age<8&&Math.abs(cx-active.x)<600)cheer=Math.sin(Math.min(1,age/8)*Math.PI)*.7;
  for(let j=0;j<n;j++){const f=j-(n-1)*.5,ox=f*24,oy=Math.sin(j*1.8+ph)*14;let xx=x+ox,yy=y+oy,fvx=vx,fvy=vy;if(cheer>0){const aa=tm*.8+j*6.28/n,tx=active.x+Math.cos(aa)*140,ty=active.y-45+Math.sin(aa)*70;const cd=Math.cos(age/8*Math.PI)*.7*Math.PI/8;fvx=vx*(1-cheer)-Math.sin(aa)*112*cheer+(tx-xx)*cd;fvy=vy*(1-cheer)+Math.cos(aa)*56*cheer+(ty-yy)*cd;xx+=(tx-xx)*cheer;yy+=(ty-yy)*cheer;}if(!far&&typeof P!=='undefined'){const dx=Math.abs(xx-P.x),dy=yy-(P.y-20);if(dx<75&&Math.abs(dy)<65)yy+=(dy<0?-1:1)*(1-dx/75)*(65-Math.abs(dy))*.7;}const vy0=cam.y*(far?.45:1);if(xx<cam.x*factor-70||xx>cam.x*factor+W/S+70||yy<vy0-65||yy>vy0+H/S+65)continue;dn4Fish(col,xx,yy,size*(.82+j*.055),tm,ph+j,fvx,fvy,far?.38:.76+cheer*.16,!far&&q%4===1);}
 }
 if(!far){for(let q=Math.floor(left/1350);q<=Math.ceil(right/1350);q++){const R=rng(q*461+831),x=q*1350+330+Math.sin(tm*.22+q)*80,y=470+R()*190+Math.sin(tm*.38+q)*35;if(x<cam.x-50||x>cam.x+W/S+50)continue;dn4Jelly((Math.abs(q)*2+3)%6,x,y,.23,tm,q*.8,.58);}}
 g.globalAlpha=1;g.globalCompositeOperation='source-over';
}
function dn4Crab(x,tm,ph,perch){const walk=Math.sin(tm*.28+ph),xx=x+walk*32,base=perch===undefined?dn4Surface(xx):perch,s=.34,bob=Math.sin(tm*5+ph)*.7;g.save();g.translate(xx,base-8+bob);g.scale(s,s);g.lineCap='round';g.strokeStyle='#d59189';g.lineWidth=3.8;for(let j=0;j<3;j++)for(const sd of [-1,1]){const a=(j-1)*7,kick=Math.sin(tm*5+ph+j*1.8+sd)*3;g.beginPath();g.moveTo(sd*13,8+a*.3);g.lineTo(sd*(25+j*3),11+a+kick);g.lineTo(sd*(31+j*3),23);g.stroke();}g.drawImage(dn4FaunaPart(4,'shell'),-50,-36,100,70);for(const sd of [-1,1]){g.save();g.translate(sd*35,3+Math.sin(tm*1.6+ph+sd)*2);g.scale(sd*.6,.6);g.rotate(-.2+Math.sin(tm*1.6+ph+sd)*.12);g.drawImage(dn4FaunaPart(4,'claw'),-47,-35,100,70);g.restore();}for(const sd of [-1,1]){g.strokeStyle='#d99a8e';g.lineWidth=3;g.beginPath();g.moveTo(sd*11,-9);g.lineTo(sd*15,-25);g.stroke();g.fillStyle='#fff5df';g.beginPath();g.ellipse(sd*15,-26,5.5,6,0,0,6.28);g.fill();g.fillStyle='#344461';g.beginPath();g.ellipse(sd*15+Math.sin(tm*.7+ph)*1.2,-25,2.9,3.5,0,0,6.28);g.fill();}g.restore();}
function dn4Neighbours(tm){for(const col of [38,147,308,470]){const x=nx(col);if(x<cam.x-90||x>cam.x+W/S+90)continue;dn4Crab(x,tm,col*.21);}}
function dn4SeaAngel(x,y,tm,ph){const size=.18,wing=.45+Math.sin(tm*1.9+ph)*.24;g.save();g.translate(x+Math.sin(tm*.3+ph)*27,y+Math.sin(tm*.41+ph)*20);g.scale(size,size);for(const sd of [-1,1]){g.save();g.scale(sd,1);g.rotate(wing);g.globalAlpha=.72;g.drawImage(dn4FaunaPart(2,'wing'),-72,-57,100,70);g.restore();}g.globalAlpha=.85;g.save();g.rotate(-Math.PI*.5);g.drawImage(dn4FaunaPart(2,'body'),-50,-35,100,70);g.restore();g.restore();g.globalAlpha=1;}
function dn4SeaAngels(tm){const left=cam.x-140,right=cam.x+W/S+140;for(let q=Math.floor(left/1700);q<=Math.ceil(right/1700);q++){const x=q*1700+840,y=470+Math.sin(q*1.7)*90;if(x<left||x>right)continue;dn4SeaAngel(x,y,tm,q*.6);}}
const DN4_KELP_CACHE=new Map();
function dn4KelpSegment(v,j){const key=v+':'+j;if(DN4_KELP_CACHE.has(key))return DN4_KELP_CACHE.get(key);const cv=dn4Cv(360,450),c=cv.getContext('2d');c.scale(1.5,1.5);const R=rng(v*71+j*319+114),col=['#3e9c97','#4d8b9e','#708aad','#3da08e'][v%4],stem=c.createLinearGradient(0,288,0,8);stem.addColorStop(0,dn4Mix(col,'#142c50',.5));stem.addColorStop(.5,col);stem.addColorStop(1,dn4Mix(col,'#a7d9cf',.3));c.lineCap='round';c.strokeStyle=stem;c.lineWidth=4;c.beginPath();c.moveTo(120,288);c.bezierCurveTo(98,211,145,91,120,8);c.stroke();
 for(let k=1;k<8;k++){const t=k/8,u=1-t,xx=u*u*u*120+3*u*u*t*98+3*u*t*t*145+t*t*t*120,yy=u*u*u*288+3*u*u*t*211+3*u*t*t*91+t*t*t*8;for(const sd of [-1,1]){const lean=sd*(.6+R()*.3),len=30+R()*35,w=(v%2?10:15)+R()*5;c.save();c.translate(xx,yy);c.rotate(lean);const gr=c.createLinearGradient(0,0,0,-len);gr.addColorStop(0,dn4Mix(col,'#143449',.35));gr.addColorStop(.6,col);gr.addColorStop(1,dn4Mix(col,'#badfc6',.42));c.fillStyle=gr;c.beginPath();c.moveTo(0,3);c.bezierCurveTo(-w,-len*.3,-w,-len*.7,0,-len);c.bezierCurveTo(w,-len*.9,w,-len*.4,0,3);c.fill();c.strokeStyle='rgba(189,226,192,.25)';c.lineWidth=.7;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(w*.1,-len*.5,0,-len+6);c.stroke();c.restore();}}
 DN4_KELP_CACHE.set(key,cv);return cv;
}
function dn4BackForest(tm,layer){const far=layer==='far',factor=far?.23:.54,yFactor=far?.28:.6,left=cam.x*factor-170,right=cam.x*factor+W/S+170;g.setTransform(S,0,0,S,-cam.x*S*factor,-cam.y*S*yFactor);g.globalAlpha=far?.2:.35;
 for(let q=Math.floor(left/370);q<=Math.ceil(right/370);q++){const R=rng(q*431+188),x=q*370+R()*160,bm=dn4Biome(x/factor);if(bm!==1&&bm!==4&&q%3!==0)continue;const h=far?340+R()*170:360+R()*270,n=q%3===1?2:3,k=h/(n*280),ph=R()*6.28;g.save();g.translate(x,835);for(let j=0;j<n;j++){g.rotate(Math.sin(tm*.33+ph+j*.55)*(.022+j*.008));g.drawImage(dn4KelpSegment(Math.abs(q)%4,j%2),-120*k,-288*k,240*k,300*k);g.translate(0,-280*k);}g.restore();}g.globalAlpha=1;
}

// Large gardens are painted once; their glowing canopy and living polyps sway as separate pieces.
const DN4_ISLANDS=[];
function dn4ReefIsland(v){if(DN4_ISLANDS[v])return DN4_ISLANDS[v];const cv=dn4Cv(900,900),c=cv.getContext('2d');c.scale(1.5,1.5);const R=rng(v*127+682),shape=v%4,bcol=['#264f83','#236a80','#47437c','#384b84','#245b82','#574475'][v];
 // Reef roots are rounded, perforated and etched; they float in depth rather than forming a wall.
 dn4Rock(c,300,543,410,120,shape===1?2:0,bcol,v*321+751);
 for(let j=0;j<7;j++){const x=135+j*48+Math.sin(j*1.7)*15,y=490+Math.cos(j*1.3)*22;dn4Rock(c,x,y,58+R()*45,24+R()*27,0,dn4Mix(bcol,'#4bb7be',.23),j*512+v*913);}
 if(shape===0){
  // Flamingo-pink antler grove, backed by lavender fan corals.
  for(const [x,y,k,z] of [[170,440,1,.9],[410,454,4,.95],[282,398,5,1.18],[238,478,0,1.4],[372,498,5,.85]])c.drawImage(dn4CoralSprite(k),x-120*z,y-270*z,240*z,280*z);
 }else if(shape===1){
  // Turquoise tube cathedral, with golden plate terraces and peach ruffles.
  for(const [x,y,k,z] of [[165,437,8,1.3],[428,485,3,1.1],[260,471,2,1.92],[359,443,7,1.3],[170,517,4,.8]])c.drawImage(dn4CoralSprite(k),x-120*z,y-270*z,240*z,280*z);
 }else if(shape===2){
  // Violet garden cave: rounded brain coral and two wide iridescent fans.
  for(const [x,y,k,z] of [[170,472,6,1.1],[411,466,1,1.35],[290,505,3,1.32],[312,385,9,1],[444,514,0,.75]])c.drawImage(dn4CoralSprite(k),x-120*z,y-270*z,240*z,280*z);
 }else{
  // A sheltered amber terrace leaves an open central pool between two curling coral towers.
  for(const [x,y,k,z] of [[145,448,4,1.32],[428,438,8,1.25],[325,508,3,.76],[195,509,9,.74],[405,507,0,.55]])c.drawImage(dn4CoralSprite(k),x-120*z,y-270*z,240*z,280*z);
 }
 // Attached miniature tubes and pearl-shell details make each island a place rather than a generic bush.
 for(let j=0;j<22;j++){const x=130+R()*340,y=475+R()*54,col=DN4_JEWELS[(j+v*2)%10];dn4Volume(c,x,y,2+R()*4,2+R()*4,col,dn4Mix(col,'#fff0c7',.36));}
 for(let j=0;j<5;j++)dn4Shell(c,160+j*67,535+Math.sin(j)*9,7+R()*6,j%2?'#d9b6bf':'#efd5ad');
 c.globalCompositeOperation='destination-in';const fade=c.createLinearGradient(0,505,0,585);fade.addColorStop(0,'rgba(255,255,255,1)');fade.addColorStop(.4,'rgba(255,255,255,.85)');fade.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=fade;c.fillRect(0,0,600,600);DN4_ISLANDS[v]=cv;return cv;
}
function dn4ReefGardens(tm){const f=.68,left=cam.x*f-380,right=cam.x*f+W/S+380;g.setTransform(S,0,0,S,-cam.x*S*f,-cam.y*S*.72);
 for(let q=Math.floor(left/810);q<=Math.ceil(right/810);q++){const R=rng(q*591+719),x=q*810+R()*170,worldx=x/f,bm=dn4Biome(worldx),v=(bm+Math.abs(q))%6,base=695+R()*85,k=.78+R()*.25;if(x+300*k<left||x-300*k>right)continue;g.save();g.translate(x,base);g.rotate(Math.sin(tm*.18+q)*.005);g.globalAlpha=.9;g.drawImage(dn4ReefIsland(v),-300*k,-543*k,600*k,600*k);g.restore();
  // Three glowing soft crowns connect to the colony, never a loose spotlight cloud.
  g.globalCompositeOperation='lighter';const col=DN4_JEWELS[(bm*2+Math.abs(q))%10],life=dn4GardenPower(worldx,tm);dn4Glow(col,x,base-275*k,220*k,200*k,.2+life*.14);for(let j=0;j<3;j++){const px=x+(j-1)*85*k,py=base-(210+Math.sin(j+q)*75)*k;dn4Glow(DN4_JEWELS[(v+j*3)%10],px,py,20*k,24*k,.3+.12*Math.sin(tm*.75+q+j));}g.globalCompositeOperation='source-over';if(q%3===0)dn4Crab(x+85*k,tm,q*.63,base-100*k);
 }g.globalAlpha=1;
}

const DN4_CEILINGS=[];
function dn4CeilingSprite(v){if(DN4_CEILINGS[v])return DN4_CEILINGS[v];const cv=dn4Cv(900,540),c=cv.getContext('2d');c.scale(1.5,1.5);c.translate(300,110);c.scale(.94,.94);c.translate(-300,-110);const R=rng(v*239+682),col=['#204f73','#205969','#354579','#48416f','#234b75','#445775'][v];dn4Rock(c,300,103,490,170,0,col,v*382+128);for(let j=0;j<6;j++){const x=74+j*83+(R()-.5)*25,k=(j*3+v*2)%10,z=.38+R()*.42;c.save();c.translate(x,104+Math.sin(j)*16);c.rotate(Math.PI+(R()-.5)*.2);c.drawImage(dn4CoralSprite(k),-120*z,-270*z,240*z,280*z);c.restore();}for(let j=0;j<25;j++)dn4Volume(c,50+R()*500,92+R()*27,1.7+R()*2,2+R()*3,DN4_JEWELS[(j+v)%10]);DN4_CEILINGS[v]=cv;return cv;}
function dn4Canopy(tm){const f=.46,left=cam.x*f-340,right=cam.x*f+W/S+340;g.setTransform(S,0,0,S,-cam.x*S*f,-cam.y*S*.2);for(let q=Math.floor(left/720);q<=Math.ceil(right/720);q++){const R=rng(q*851+326),x=q*720+R()*130,bm=dn4Biome(x/f),k=.55+R()*.12,y=15+Math.sin(q*.9)*20;g.globalAlpha=.58;g.save();g.translate(x,y);g.rotate(Math.sin(tm*.14+q)*.006);g.drawImage(dn4CeilingSprite((bm+Math.abs(q))%6),-300*k,-100*k,600*k,360*k);g.restore();g.globalCompositeOperation='lighter';dn4Glow(DN4_JEWELS[(bm*2+Math.abs(q))%10],x,y+80*k,210*k,105*k,.16);g.globalCompositeOperation='source-over';}g.globalAlpha=1;}

// At the pearl's musical wave, nearby sea friends make one gentle coloured procession.
function dn4PearlProcession(tm){if(DN4.finT===null)return;const age=Math.max(0,(typeof now==='number'?now:tm)-DN4.finT);if(age>9)return;const fade=Math.sin(Math.min(1,age/9)*Math.PI),x=DN4.finX,y=typeof DENIZ!=='undefined'&&DENIZ.inci?DENIZ.inci.y:700;if(x<cam.x-800||x>cam.x+W/S+800)return;
 for(let j=0;j<12;j++){const row=Math.floor(j/4),side=j%2?1:-1,a=age*.25+j*.56,xx=x+side*(160+row*82)+Math.sin(a)*38,yy=y-65-row*65+Math.cos(a)*24,vx=Math.cos(a)*9.5,vy=-Math.sin(a)*6;dn4Fish((j+1)%6,xx,yy,.34,tm,j*.7,side*22+vx,vy,fade*.72,j%4===2);}
 g.globalCompositeOperation='lighter';const radius=age*140;dn4Glow('#ffbd73',x,y,160+radius*.55,110+radius*.35,fade*.11);g.globalCompositeOperation='source-over';g.globalAlpha=1;
}

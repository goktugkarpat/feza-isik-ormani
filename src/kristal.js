/* Kor Çiçekleri: Feza, Pırıl'ın sırtında altı uyuyan çiçeği uyandırır.
   Çiçeği seç → Pırıl yaklaşır ve ışık üfler → çiçek açılır, kâğıt kuşu uçar.
   Hızlı dokunuşlar kaybolmaz: altı çiçeklik sabit sıra. Nota, sayaç, el simgesi ve kaybetme yok.
   Uçuş bahçenin üstünde küçük bir turdur; başladığı güvenli kıyıya yumuşakça döner. */
'use strict';
const KR5 = {o:null,ptr:-1,note:-1,bud:-1,px:0,py:0,hold:0,
  get aktif(){return this.o&&this.o.kr5&&this.o.kr5.active&&!this.o.done?this.o:null;}};
const KR5_COUNT=6, KR5_TAKEOFF=1.6, KR5_CELEBRATE=2.6, KR5_LAND=1.6, KR5_HELP_FIRST=8, KR5_HELP_EVERY=7;
const KR5_APPROACH=.80, KR5_BREATH=.42, KR5_BREATH_OPEN=.18, KR5_UNFOLD=.58;
const KR5_X=[-235,-35,190,-220,-10,230],KR5_Y=[-305,-370,-315,-110,-170,-100];
const KR5_COLORS=['#f03d6b','#a83bd0','#ff7459','#c638a0','#8946d6','#ed476f'];
const KR5_LIGHT=['#ff9b9c','#d38af0','#ffb582','#ef83cb','#be8cf2','#ff99ae'];
const KR5_SHADE=['#932746','#602e88','#ad3b51','#762359','#4d2e7f','#942d62'];
const kr5PetalArts=[],kr5BudArts=[],kr5RootArts=[],kr5BirdBodyArts=[],kr5BirdWingArts=[];
let kr5GardenCache=null;
function kr5Poly(q,p,color){q.fillStyle=color;q.beginPath();for(let i=0;i<p.length;i++){if(i)q.lineTo(p[i][0],p[i][1]);else q.moveTo(p[i][0],p[i][1]);}q.closePath();q.fill();}
function kr5Soz(key){if(typeof SES!=='undefined'&&SES.soyle)SES.soyle(key);}
function kr5ResetInput(){KR5.ptr=KR5.note=KR5.bud=-1;KR5.hold=0;if(typeof omHepsiniBirak==='function')omHepsiniBirak();}
function kr5PetalArt(i){
  if(kr5PetalArts[i])return kr5PetalArts[i];
  const c=document.createElement('canvas');c.width=144;c.height=204;const q=c.getContext('2d');q.scale(2,2);q.translate(36,95);
  q.fillStyle=KR5_COLORS[i];q.beginPath();q.moveTo(0,4);q.bezierCurveTo(-18,-3,-32,-31,-24,-54);q.quadraticCurveTo(-17,-74,1,-88);q.quadraticCurveTo(26,-68,28,-43);q.bezierCurveTo(31,-21,15,-2,0,4);q.fill();
  kr5Poly(q,[[0,4],[-24,-54],[1,-88],[-5,-35]],KR5_SHADE[i]);
  kr5Poly(q,[[0,4],[1,-88],[15,-61],[7,-29]],KR5_LIGHT[i]);
  q.strokeStyle='rgba(255,207,160,.62)';q.lineWidth=.7;q.beginPath();q.moveTo(0,2);q.quadraticCurveTo(8,-40,1,-84);q.moveTo(-3,-30);q.lineTo(-16,-43);q.moveTo(5,-47);q.lineTo(16,-57);q.stroke();
  const r=rng(58219+i*73);q.save();q.beginPath();q.moveTo(0,4);q.bezierCurveTo(-18,-3,-32,-31,-24,-54);q.quadraticCurveTo(-17,-74,1,-88);q.quadraticCurveTo(26,-68,28,-43);q.bezierCurveTo(31,-21,15,-2,0,4);q.clip();
  for(let j=0;j<180;j++){q.fillStyle=j%2?'rgba(255,232,208,.05)':'rgba(36,15,55,.06)';q.fillRect(-29+r()*58,-88+r()*90,.25+r()*.6,.2+r()*.35);}q.restore();
  return kr5PetalArts[i]=c;
}
function kr5BudArt(i){
  if(kr5BudArts[i])return kr5BudArts[i];
  const c=document.createElement('canvas');c.width=176;c.height=232;const q=c.getContext('2d');q.scale(2,2);q.translate(44,79);
  q.fillStyle=KR5_SHADE[i];q.beginPath();q.moveTo(0,27);q.bezierCurveTo(-33,21,-36,-6,-24,-29);q.quadraticCurveTo(-11,-48,0,-56);q.quadraticCurveTo(30,-32,33,-8);q.bezierCurveTo(37,11,21,25,0,27);q.fill();
  q.fillStyle=KR5_COLORS[i];q.beginPath();q.moveTo(-1,24);q.quadraticCurveTo(-18,-6,-7,-39);q.lineTo(0,-56);q.quadraticCurveTo(10,-28,14,-3);q.quadraticCurveTo(14,15,-1,24);q.fill();
  q.fillStyle=KR5_LIGHT[i];q.beginPath();q.moveTo(-2,19);q.quadraticCurveTo(0,-18,0,-51);q.quadraticCurveTo(16,-19,17,-3);q.quadraticCurveTo(14,14,-2,19);q.fill();
  q.fillStyle=KR5_COLORS[i];q.beginPath();q.moveTo(1,25);q.quadraticCurveTo(17,-5,24,-30);q.quadraticCurveTo(39,-2,28,14);q.quadraticCurveTo(18,25,1,25);q.fill();
  q.strokeStyle='rgba(255,211,169,.72)';q.lineWidth=.8;q.beginPath();q.moveTo(-1,22);q.quadraticCurveTo(4,-14,0,-52);q.moveTo(2,24);q.quadraticCurveTo(17,6,24,-26);q.stroke();
  // Folded sepals and calm sleeping eyelids distinguish the closed state.
  kr5Poly(q,[[-2,29],[-31,13],[-32,2],[-9,13]],'#3d6469');kr5Poly(q,[[0,29],[30,14],[32,2],[11,14]],'#608b84');
  q.strokeStyle=KR5_SHADE[i];q.lineWidth=1.7;q.lineCap='round';q.beginPath();q.arc(-11,0,5,.15,Math.PI-.15);q.moveTo(15,0);q.arc(10,0,5,.15,Math.PI-.15);q.stroke();
  return kr5BudArts[i]=c;
}
function kr5GardenArt(){
  if(kr5GardenCache)return kr5GardenCache;
  const c=document.createElement('canvas');c.width=1320;c.height=380;const q=c.getContext('2d');q.scale(2,2);q.translate(330,46);
  q.fillStyle='#55405b';q.beginPath();q.moveTo(-330,11);q.bezierCurveTo(-218,-24,-153,28,-53,3);q.bezierCurveTo(64,-28,174,-9,330,8);q.lineTo(330,49);q.bezierCurveTo(186,28,87,62,-15,48);q.bezierCurveTo(-133,28,-250,72,-330,43);q.fill();
  q.fillStyle='#c03b58';q.beginPath();q.moveTo(-330,18);q.bezierCurveTo(-213,-3,-158,38,-48,15);q.bezierCurveTo(83,-12,206,12,330,14);q.lineTo(330,39);q.bezierCurveTo(198,31,109,57,-8,37);q.bezierCurveTo(-142,19,-256,57,-330,34);q.fill();
  q.fillStyle='#f77449';q.beginPath();q.moveTo(-330,21);q.bezierCurveTo(-219,7,-147,41,-39,20);q.bezierCurveTo(79,-3,208,19,330,20);q.lineTo(330,30);q.bezierCurveTo(203,30,104,42,-1,28);q.bezierCurveTo(-135,15,-251,47,-330,28);q.fill();
  q.strokeStyle='#ffc469';q.lineWidth=1.7;q.beginPath();q.moveTo(-326,25);q.bezierCurveTo(-215,14,-162,39,-64,25);q.bezierCurveTo(72,5,151,30,325,25);q.stroke();
  for(let i=0;i<7;i++){const x=-294+i*94,y=12+Math.sin(i*1.9)*15;kr5Poly(q,[[x-29,y+2],[x-18,y-13],[x+12,y-15],[x+31,y],[x+13,y+14],[x-21,y+10]],i%2?'#5c4765':'#69516c');kr5Poly(q,[[x-29,y+2],[x-18,y-13],[x+12,y-15],[x+1,y+1]],'#997789');q.strokeStyle='rgba(251,152,104,.7)';q.lineWidth=.8;q.beginPath();q.moveTo(x-22,y+8);q.lineTo(x+12,y+12);q.stroke();}
  const r=rng(552384);for(let i=0;i<240;i++){q.fillStyle=i%3?'rgba(255,221,184,.04)':'rgba(39,22,56,.06)';q.fillRect(-329+r()*658,-10+r()*65,.3+r()*.9,.3+r()*.5);}
  return kr5GardenCache=c;
}
function kr5RootArt(lit){
  if(kr5RootArts[lit])return kr5RootArts[lit];
  const c=document.createElement('canvas');c.width=1320;c.height=1000;const q=c.getContext('2d');q.scale(2,2);q.translate(330,450);q.lineCap='round';
  for(let i=0;i<KR5_COUNT;i++){
    const bx=KR5_X[i]*.36,tx=KR5_X[i],ty=KR5_Y[i]+36,curve=(i%2?1:-1)*40;
    q.fillStyle=lit?'#815777':'#54415e';q.beginPath();q.moveTo(bx-8,13);q.bezierCurveTo(bx+curve,-110,tx-curve,ty+75,tx-3,ty);q.lineTo(tx+4,ty);q.bezierCurveTo(tx-curve+12,ty+75,bx+curve+13,-100,bx+8,13);q.fill();
    q.strokeStyle=lit?'rgba(255,172,129,.7)':'rgba(192,137,157,.43)';q.lineWidth=1.3;q.beginPath();q.moveTo(bx,8);q.bezierCurveTo(bx+curve,-110,tx-curve,ty+75,tx,ty);q.stroke();
    for(let j=0;j<4;j++){
      const u=.24+j*.16,x=lerp(bx,tx,u)+Math.sin(i+j*.8)*15,y=lerp(8,ty,u),side=(i+j)%2?1:-1,sz=17+(j%2)*8;
      kr5Poly(q,[[x,y],[x+side*sz,y-23],[x+side*(sz+14),y-25],[x+side*(sz+8),y-3],[x+side*7,y+4]],lit?(j%2?'#7eae8b':'#6e9993'):(j%2?'#4a7274':'#526f7d'));
      kr5Poly(q,[[x,y],[x+side*(sz+14),y-25],[x+side*(sz+8),y-3],[x+side*7,y+4]],lit?'#4d7d76':'#405764');
      q.strokeStyle=lit?'rgba(244,204,154,.5)':'rgba(160,164,156,.3)';q.lineWidth=.6;q.beginPath();q.moveTo(x,y);q.lineTo(x+side*(sz+10),y-21);q.stroke();
    }
  }
  if(lit)for(let i=0;i<9;i++){const x=-278+i*67,y=-21-Math.sin(i*2.4)*12;q.save();q.translate(x,y);for(let j=0;j<5;j++){q.rotate(Math.PI*2/5);q.drawImage(kr5PetalArt(i%6),-6,-17,12,19);}q.fillStyle='#ffd07a';q.beginPath();q.arc(0,0,2.9,0,Math.PI*2);q.fill();q.restore();}
  return kr5RootArts[lit]=c;
}
function kr5FlowerPosition(o,i,tm,out){
  const f=o.kr5.flowers[i],p=out||{};p.x=o.x+f.x+Math.sin((tm==null?now:tm)*.85+i)*2.5;p.y=o.y+f.y+Math.sin((tm==null?now:tm)*1.2+i*1.7)*2;return p;
}
function kr5Seat(k,tm){
  const h=typeof drBinekHal==='function'?drBinekHal(tm,0):null,a=h?h.aci:0,b=h?h.bob:0,s=k.scale,c=Math.cos(a),sn=Math.sin(a),p=k.seat;
  p.x=(-c-(-9+b)*sn)*s;p.y=(-sn+(-9+b)*c)*s;p.elX=(12*c-(-12+b)*sn)*s;p.elY=(12*sn+(-12+b)*c)*s;p.aci=a;return p;
}
function kr5Activate(o){
  const k=o.kr5;if(o.done||k.active||P.ucus||DURUM!=='oyun')return false;
  if(P.fade>0||!P.ground||P.kilit>.05||D.mode==='tasi'){o.dokundu=false;return false;}
  k.entry.x=P.x;k.entry.y=P.y;k.entry.safeX=P.safeX;k.entry.safeY=P.safeY;k.entry.f=P.f;k.entry.dragonX=D.x;k.entry.dragonY=D.y;
  k.active=true;k.phase='takeoff';k.age=k.phaseAge=k.idle=0;k.helpAt=KR5_HELP_FIRST;k.helpSaid=false;k.scale=1;k.mx=D.x;k.my=D.y;k.rot=0;k.px=P.x;k.py=P.y;
  k.fromX=k.mx;k.fromY=k.my;k.targetX=o.x-245;k.targetY=o.y-42;k.travelT=0;k.travelDuration=KR5_TAKEOFF;k.facing=1;k.arcHeight=25;k.action='idle';k.actionAge=0;k.current=-1;k.breath=0;
  KR5.o=o;kr5ResetInput();P.ucus=o;P.vx=P.vy=0;P.buf=0;P.kilit=0;P.fade=0;P.ground=false;
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanCicekUcusu',1.5,k.kameraFn,1,.42);
  OLAY.emit('volkanMiniBasla',{o,cicek:true,total:KR5_COUNT});OLAY.emit('volkanMiniAsama',{o,cicek:true,stage:1,opened:k.opened,total:KR5_COUNT});return true;
}
function kr5OpenFlower(o,index,help){
  const k=o.kr5;if(!k.active||o.done||k.phase!=='play'&&k.phase!=='takeoff'||DURUM!=='oyun'||!Number.isInteger(index)||index<0||index>=KR5_COUNT)return false;
  const f=k.flowers[index];if(f.done||f.queued||k.queueCount>=KR5_COUNT)return false;
  f.queued=true;f.help=!!help;f.pulse=1;f.touch=1;k.queue[k.queueCount++]=index;k.selected++;k.idle=0;k.helpAt=KR5_HELP_EVERY;
  if(help)k.helpHits++;else{k.userHits++;k.helpAt=KR5_HELP_FIRST;}
  OLAY.emit('volkanCicekSec',{o,index,help:!!help});
  if(k.phase==='play'&&k.action==='idle')kr5StartNext(o);
  return true;
}
function kr5StartNext(o){
  const k=o.kr5;if(k.queueRead>=k.queueCount||k.current>=0)return false;
  k.current=k.queue[k.queueRead++];k.action='approach';k.actionAge=0;k.breath=0;
  const f=k.flowers[k.current];k.fromX=k.mx;k.fromY=k.my;k.targetX=o.x+f.x-106;k.targetY=o.y+f.y+76;k.travelT=0;k.travelDuration=KR5_APPROACH;k.arcHeight=35;
  return true;
}
function kr5Awaken(o,index){
  const k=o.kr5,f=k.flowers[index];if(!f||f.done||!f.queued)return;
  f.done=true;f.queued=false;f.bloomT=0;f.birdAge=0;f.pulse=.8;k.opened++;k.last=index;k.joy=1;
  OLAY.emit('volkanCicekAc',{o,index,opened:k.opened,total:KR5_COUNT,help:f.help});
  if(k.opened===2||k.opened===4)OLAY.emit('volkanMiniAsama',{o,cicek:true,stage:Math.ceil(k.opened/2)+1,opened:k.opened,total:KR5_COUNT});
}
function kr5Restore(o,complete){
  const k=o.kr5,e=k.entry;if(!k.active)return;const owns=P.ucus===o;
  if(owns){P.ucus=null;P.x=e.x;P.y=e.y;P.rx=P.x;P.ry=P.y;P.vx=P.vy=0;P.ground=true;P.f=e.f;P.safeX=e.safeX;P.safeY=e.safeY;P.buf=0;P.dj=true;P.fade=0;P.kilit=0;P.air=0;P.bounce=false;
    D.x=e.x-72;D.y=e.y-95;D.vx=D.vy=D.pvx=D.pvy=0;}
  k.active=false;k.phase=complete?'done':'wait';k.phaseAge=0;kr5ResetInput();
  k.breath=0;k.action='idle';k.current=-1;
  if(!complete){k.queueCount=k.queueRead=0;k.selected=k.opened;for(const f of k.flowers){f.queued=false;f.touch=0;}}
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanCicekUcusu',.1,k.kameraFn,1,.42);
  if(complete&&!o.done){o.done=true;if(typeof V5!=='undefined')V5.mini=true;lightTarget=Math.max(lightTarget,.55);OLAY.emit('volkanMiniTamam',{o,cicek:true,opened:k.opened,total:KR5_COUNT});kr5Soz('p_v_kristal_son');}
  else o.dokundu=false;
}
function kr5FlyPosition(o,dt){
  const k=o.kr5;k.travelT=Math.min(k.travelDuration,k.travelT+dt);const u=smooth(clamp(k.travelT/k.travelDuration,0,1));
  const oldY=k.my;k.mx=lerp(k.fromX,k.targetX,u);k.my=lerp(k.fromY,k.targetY,u)-Math.sin(u*Math.PI)*(k.arcHeight||25);
  if(u>=1){k.mx+=Math.sin(k.age*.85)*4;k.my+=Math.sin(k.age*2.4)*3;}
  k.rot=lerp(k.rot,clamp((k.my-oldY)/Math.max(.001,dt)*.00045,-.13,.13),1-Math.exp(-dt*6));
}
function kr5SetMountedPlayer(o){
  const k=o.kr5,p=kr5Seat(k,k.age),c=Math.cos(k.rot),s=Math.sin(k.rot);
  P.x=k.mx+p.x*c-p.y*s;P.y=k.my+p.x*s+p.y*c;P.vx=P.vy=0;P.ground=false;P.f=1;P.buf=0;k.px=P.x;k.py=P.y;
}
function kr5FlightStep(o,dt){
  const k=o.kr5;if(!(dt>0)||!Number.isFinite(dt)||DURUM!=='oyun'||!k.active||P.ucus!==o)return;
  k.age+=dt;k.phaseAge+=dt;k.joy=Math.max(0,k.joy-dt*.65);P.vx=P.vy=0;P.ground=false;P.buf=0;P.f=1;
  if(k.phase==='takeoff'){
    const u=smooth(clamp(k.phaseAge/KR5_TAKEOFF,0,1));k.scale=lerp(1,2.05,u);kr5FlyPosition(o,dt);const p=kr5Seat(k,k.age);
    P.x=lerp(k.entry.x,k.mx+p.x,u);P.y=lerp(k.entry.y,k.my+p.y,u)-Math.sin(u*Math.PI)*36;k.px=P.x;k.py=P.y;
    if(k.phaseAge>=KR5_TAKEOFF){k.phase='play';k.phaseAge=0;k.fromX=k.mx;k.fromY=k.my;k.targetX=k.mx;k.targetY=k.my;k.travelT=k.travelDuration=.95;if(k.opened===KR5_COUNT)kr5GardenFinal(o);else kr5StartNext(o);}
  }else if(k.phase==='play'||k.phase==='celebrate'){
    kr5FlyPosition(o,dt);kr5SetMountedPlayer(o);
    if(k.phase==='play'){
      k.actionAge+=dt;
      if(k.action==='approach'&&k.actionAge>=KR5_APPROACH){k.action='breath';k.actionAge=0;k.fromX=k.mx;k.fromY=k.my;k.targetX=k.mx;k.targetY=k.my;k.travelT=k.travelDuration=KR5_BREATH;k.arcHeight=0;OLAY.emit('volkanCicekNefes',{o,index:k.current,help:k.flowers[k.current].help});}
      else if(k.action==='breath'){
        k.breath=Math.sin(clamp(k.actionAge/KR5_BREATH,0,1)*Math.PI);
        if(k.actionAge>=KR5_BREATH_OPEN)kr5Awaken(o,k.current);
        if(k.actionAge>=KR5_BREATH){k.action='bloom';k.actionAge=0;k.breath=0;}
      }else if(k.action==='bloom'&&k.actionAge>=KR5_UNFOLD){k.action='idle';k.actionAge=0;k.current=-1;if(k.opened===KR5_COUNT)kr5GardenFinal(o);else kr5StartNext(o);}
      else if(k.action==='idle')kr5StartNext(o);
      if(k.action==='idle'&&k.queueRead>=k.queueCount)k.idle+=dt;
      // Pırıl demonstrates one complete swoop only after the child has been quietly waiting.
      if(k.action==='idle'&&k.idle>=k.helpAt){let next=-1,best=1e12;for(let i=0;i<KR5_COUNT;i++){const f=k.flowers[i];if(f.done||f.queued)continue;const dx=o.x+f.x-k.mx,dy=o.y+f.y-k.my,d=dx*dx+dy*dy;if(d<best){best=d;next=i;}}
        if(next>=0){kr5OpenFlower(o,next,true);if(!k.helpSaid){k.helpSaid=true;kr5Soz('p_v_mini_yardim');}}}
    }else if(k.phaseAge>=KR5_CELEBRATE){k.phase='land';k.phaseAge=0;k.landX=P.x;k.landY=P.y;k.fromX=k.mx;k.fromY=k.my;k.targetX=k.entry.x-72;k.targetY=k.entry.y-95;k.travelT=0;k.travelDuration=KR5_LAND;k.arcHeight=32;}
  }else if(k.phase==='land'){
    const u=smooth(clamp(k.phaseAge/KR5_LAND,0,1));kr5FlyPosition(o,dt);k.scale=lerp(2.05,1,u);k.rot*=Math.exp(-dt*4);
    P.x=lerp(k.landX,k.entry.x,u);P.y=lerp(k.landY,k.entry.y,u)-Math.sin(u*Math.PI)*43;k.px=P.x;k.py=P.y;
    if(k.phaseAge>=KR5_LAND){kr5Restore(o,true);return;}
  }
  D.x=k.mx;D.y=k.my;
}
function kr5GardenFinal(o){
  const k=o.kr5;k.phase='celebrate';k.phaseAge=0;k.finalAge=0;k.action='idle';k.current=-1;k.breath=0;k.joy=1;
  k.fromX=k.mx;k.fromY=k.my;k.targetX=o.x+115;k.targetY=o.y-160;k.travelT=0;k.travelDuration=KR5_CELEBRATE;k.arcHeight=82;
  kr5ResetInput();OLAY.emit('volkanMiniBahce',{o,opened:k.opened,total:KR5_COUNT});
}
function kr5Update(o,dt){
  if(!(dt>0)||!Number.isFinite(dt))return;const k=o.kr5;
  if(DURUM!=='oyun')return;
  for(let i=0;i<KR5_COUNT;i++){const f=k.flowers[i];f.pulse=Math.max(0,f.pulse-dt*1.3);f.touch=Math.max(0,f.touch-dt*1.5);if(f.done){f.bloomT=Math.min(1,f.bloomT+dt/.82);f.birdAge=Math.min(40,f.birdAge+dt);}}
  if(k.finalAge>=0)k.finalAge=Math.min(20,k.finalAge+dt);
  if(!k.active&&!o.done&&!P.ucus&&Math.abs(P.x-o.x)<225&&Math.abs(P.y-o.y)<150)kr5Activate(o);
  if(k.active&&typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanCicekUcusu',1.5,k.kameraFn,1,.42);
}
function kr5DrawStem(o,f,i,tm){
  if(!f.done)return;const bx=f.x*.36,tx=f.x,ty=f.y+36,curve=(i%2?1:-1)*40,uMax=smooth(clamp(f.bloomT,0,1));
  g.save();g.globalAlpha=.62;g.lineCap='round';g.lineWidth=1.8;g.strokeStyle=KR5_LIGHT[i];g.beginPath();
  for(let j=0;j<=18;j++){const u=j/18*uMax,v=1-u,x=o.x+v*v*v*bx+3*v*v*u*(bx+curve)+3*v*u*u*(tx-curve)+u*u*u*tx,y=o.y+v*v*v*8+3*v*v*u*(-110)+3*v*u*u*(ty+75)+u*u*u*ty;if(j)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();g.restore();
}
function kr5DrawFlower(o,f,i,tm){
  const k=o.kr5,open=smooth(clamp(f.bloomT,0,1)),focus=!f.done,breathe=focus?.04*Math.sin(tm*2.6+i):.009*Math.sin(tm*1.3+i),growth=k.finalAge>=0?1+.1*smooth(clamp(k.finalAge/1.6,0,1)):1;
  const x=o.x+f.x+Math.sin(tm*.85+i)*2.5,y=o.y+f.y+Math.sin(tm*1.2+i*1.7)*2;
  g.save();g.translate(x,y);g.rotate(Math.sin(tm*.85+i)*.025);g.scale((1+breathe-f.touch*.045+f.pulse*.055)*growth,(1-breathe*.45+f.touch*.08+f.pulse*.025)*growth);
  if(open<1){g.globalAlpha=1-smooth(clamp((open-.1)/.7,0,1));g.drawImage(kr5BudArt(i),-52.8,-94.8,105.6,139.2);g.globalAlpha=1;
    if(!f.done){g.globalAlpha=f.queued?.75:.38+Math.sin(tm*2.1+i)*.16;g.strokeStyle=f.queued?'#ffd392':KR5_LIGHT[i];g.lineWidth=1.5;g.beginPath();g.moveTo(0,33);g.bezierCurveTo(-39,27,-45,-5,-29,-35);g.quadraticCurveTo(-13,-58,0,-67);g.quadraticCurveTo(35,-40,39,-10);g.stroke();g.globalAlpha=1;}
  }
  if(open>0){
    const unfold=smooth(clamp(open/.92,0,1));
    for(let layer=0;layer<2;layer++)for(let j=0;j<(layer?5:7);j++){
      const n=layer?5:7,a=j*Math.PI*2/n+(layer?.32:0),spread=lerp(.12,1,unfold),scale=layer?.56:.79;
      g.save();g.rotate(a);g.translate(0,-open*(layer?3:8));g.scale(spread*scale,scale*(.4+unfold*.6));g.drawImage(kr5PetalArt(i),-36,-95,72,102);g.restore();
    }
    g.fillStyle='#ad7044';g.beginPath();g.ellipse(0,2,16*open,13*open,0,0,Math.PI*2);g.fill();
    g.fillStyle='#ffd47a';g.beginPath();g.ellipse(0,-1,12*open,10*open,0,0,Math.PI*2);g.fill();
    g.fillStyle='#9a5b4b';for(let j=0;j<7;j++){const a=j*2.399;g.beginPath();g.arc(Math.cos(a)*6*open,Math.sin(a)*5*open-1,1.2*open,0,Math.PI*2);g.fill();}
    if(open>.7){g.fillStyle='#68415b';g.beginPath();g.arc(-4,0,1.15,0,Math.PI*2);g.arc(4,0,1.15,0,Math.PI*2);g.fill();g.strokeStyle='#9e5f55';g.lineWidth=.9;g.beginPath();g.arc(0,2,3,.2,Math.PI-.2);g.stroke();}
  }
  g.restore();
  if(!f.done){
    // Small warm spores approach the sleeping bud itself: the object, not an external icon, invites a touch.
    for(let j=0;j<3;j++){const u=(tm*.3+i*.13+j/3)%1,v=1-u,a=j*2.399+i*.6,xx=x+Math.cos(a)*(18+v*54),yy=y-16+Math.sin(a)*(14+v*62);kr5Spark(xx,yy,2.1+Math.sin(u*Math.PI)*1.1,tm+j,KR5_LIGHT[i],Math.sin(u*Math.PI)*(f.queued?.7:.46));}
  }
  if(f.touch>.01){const u=1-f.touch;for(let j=0;j<8;j++){const a=j*2.399,r=24+u*57;kr5Spark(x+Math.cos(a)*r,y-12+Math.sin(a)*r*.8,3.8*f.touch,tm+j,KR5_LIGHT[i],f.touch*.85);}}
  if(f.pulse>.01){const u=1-f.pulse;g.save();g.globalAlpha=f.pulse*.55;g.strokeStyle=KR5_LIGHT[i];g.lineWidth=1.4;g.beginPath();g.ellipse(x,y,42+u*48,48+u*43,0,0,Math.PI*2);g.stroke();g.restore();
    for(let j=0;j<7;j++){const a=j*2.399+u*.6,r=29+u*63;kr5Spark(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,3.4*f.pulse,tm+j,KR5_LIGHT[i],f.pulse*.8);}}
}
function kr5NextClosed(o){const k=o.kr5;for(let i=0;i<KR5_COUNT;i++)if(!k.flowers[i].done&&!k.flowers[i].queued)return i;return -1;}
function kr5Spark(x,y,r,tm,col,alpha){
  if(r<=0||alpha<=0)return;g.save();g.translate(x,y);g.rotate(tm*.3);g.globalAlpha=alpha;g.fillStyle=col;g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r*.2,-r*.2,r,0);g.quadraticCurveTo(r*.2,r*.2,0,r);g.quadraticCurveTo(-r*.2,r*.2,-r,0);g.quadraticCurveTo(-r*.2,-r*.2,0,-r);g.fill();g.restore();
}
function kr5BirdArt(i,wing){
  const bank=wing?kr5BirdWingArts:kr5BirdBodyArts;if(bank[i])return bank[i];
  const c=document.createElement('canvas');c.width=160;c.height=128;const q=c.getContext('2d');q.scale(2,2);q.translate(40,38);
  if(wing){kr5Poly(q,[[-6,4],[-25,-21],[-8,-32],[17,-9],[8,5]],KR5_COLORS[i]);kr5Poly(q,[[-6,4],[-8,-32],[17,-9],[8,5]],KR5_LIGHT[i]);q.strokeStyle='#f6c49f';q.lineWidth=.7;q.beginPath();q.moveTo(-6,4);q.lineTo(-8,-30);q.lineTo(15,-9);q.stroke();}
  else{kr5Poly(q,[[-29,8],[-17,-3],[1,0],[13,-10],[25,-8],[30,-1],[17,2],[8,13],[-11,14]],KR5_COLORS[i]);kr5Poly(q,[[-29,8],[-17,-3],[-9,7],[-11,14]],KR5_SHADE[i]);kr5Poly(q,[[-17,-3],[1,0],[8,13],[-9,7]],KR5_LIGHT[i]);kr5Poly(q,[[1,0],[13,-10],[25,-8],[17,2],[8,13]],'#f7d2a4');kr5Poly(q,[[25,-8],[36,-4],[30,-1]],'#ffd277');q.fillStyle='#573952';q.beginPath();q.arc(21,-5,1.3,0,Math.PI*2);q.fill();q.strokeStyle='rgba(255,228,192,.6)';q.lineWidth=.7;q.beginPath();q.moveTo(-27,8);q.lineTo(-8,7);q.lineTo(7,11);q.stroke();}
  return bank[i]=c;
}
function kr5DrawBirds(o,tm){
  const k=o.kr5;
  for(let i=0;i<KR5_COUNT;i++){
    const f=k.flowers[i];if(f.birdAge<.38)continue;
    const age=f.birdAge-.38,u=smooth(clamp(age/5.8,0,1)),v=1-u,sx=o.x+f.x,sy=o.y+f.y-9;
    const peak=typeof DN5!=='undefined'&&Number.isFinite(DN5.peakX)&&Number.isFinite(DN5.peakY),tx=peak?cam.x+DN5.peakX:o.x+85,ty=(peak?cam.y+DN5.peakY:o.y-500)-(k.finalAge>=0?k.finalAge*24:0);
    const bendX=(sx+tx)*.5+Math.sin(i*2)*74,bendY=Math.min(sy,ty)-65,x=v*v*sx+2*v*u*bendX+u*u*tx+Math.sin(age*1.3+i)*u*15,y=v*v*sy+2*v*u*bendY+u*u*ty+Math.sin(age*1.7+i)*u*9;
    const appear=smooth(clamp(age/.5,0,1)),scale=(.57-u*.31)*appear,alpha=k.finalAge>4?1-smooth(clamp((k.finalAge-4)/3,0,1)):1,flap=Math.sin(tm*7.3+i*.7);
    if(alpha<.01||scale<.01)continue;
    g.save();g.translate(x,y);g.scale(scale*(tx>=sx?1:-1),scale);g.globalAlpha=alpha;
    g.save();g.translate(-3,-2);g.rotate(-.26+flap*.45);g.scale(.9,.68+Math.abs(flap)*.32);g.drawImage(kr5BirdArt(i,true),-40,-38,80,64);g.restore();
    g.drawImage(kr5BirdArt(i,false),-40,-38,80,64);
    g.save();g.translate(-4,1);g.rotate(.14-flap*.5);g.scale(1,.75+Math.abs(flap)*.3);g.drawImage(kr5BirdArt(i,true),-40,-38,80,64);g.restore();g.restore();
  }
}
function kr5DrawBreath(o,tm){
  const k=o.kr5;if(k.breath<=.01||k.current<0)return;const f=k.flowers[k.current],c=Math.cos(k.rot),s=Math.sin(k.rot),mx=k.mx+(30*c+12*s)*k.scale,my=k.my+(30*s-12*c)*k.scale;
  const tx=o.x+f.x,ty=o.y+f.y-10,cx=(mx+tx)*.5+12,cy=(my+ty)*.5-15,alpha=k.breath;
  g.save();g.lineCap='round';g.globalAlpha=alpha*.2;g.strokeStyle='#f09b8a';g.lineWidth=13;g.beginPath();g.moveTo(mx,my);g.quadraticCurveTo(cx,cy,tx,ty);g.stroke();
  g.globalAlpha=alpha*.66;g.strokeStyle='#ffc56e';g.lineWidth=4;g.stroke();g.globalAlpha=alpha*.72;g.strokeStyle='#ffe4ad';g.lineWidth=1.1;g.stroke();g.restore();
  for(let j=0;j<8;j++){const u=(k.actionAge*3.4+j/8)%1,v=1-u,x=v*v*mx+2*v*u*cx+u*u*tx,y=v*v*my+2*v*u*cy+u*u*ty+Math.sin(u*9+j)*3;kr5Spark(x,y,2.6,tm+j,j%2?'#ffd087':KR5_LIGHT[k.current],Math.sin(u*Math.PI)*alpha*.9);}
}
function kr5DrawFlight(o,tm){
  const k=o.kr5;if(!k.active||P.ucus!==o)return;const mounted=k.phase==='play'||k.phase==='celebrate',seat=kr5Seat(k,k.age),c=Math.cos(k.rot),sn=Math.sin(k.rot);
  const x=mounted?P.x-(seat.x*c-seat.y*sn):k.mx,y=mounted?P.y-(seat.x*sn+seat.y*c):k.my;
  g.save();g.translate(x,y);g.rotate(k.rot);
  if(typeof pirilCizPoz==='function'){const mouth=D.mouth;D.mouth=Math.max(mouth||0,k.breath*.9);try{pirilCizPoz(g,0,0,k.scale,'binek',k.age,0);}finally{D.mouth=mouth;}}
  if(mounted&&typeof fezaCizPoz==='function'){
    const opt=k.poseOpt;opt.el.x=seat.elX-seat.x;opt.el.y=seat.elY-seat.y;opt.aci=seat.aci;opt.sevinc=k.joy*.65;opt.vy=0;
    fezaCizPoz(g,seat.x,seat.y,1.05,'binis',tm,null,opt);
  }
  g.restore();
  if(!mounted&&typeof fezaCizPoz==='function'){const riding=k.phase==='takeoff'&&k.phaseAge>KR5_TAKEOFF*.76;k.poseOpt.aci=k.rot;k.poseOpt.sevinc=.65;fezaCizPoz(g,P.x,P.y,1.05,riding?'binis':k.phase==='land'?'ayakta_yan':'sevinc',tm,null,k.poseOpt);}
  kr5DrawBreath(o,tm);
  if(k.phase==='play'||k.phase==='celebrate')for(let j=0;j<6;j++){const u=(k.age*.5+j/6)%1;kr5Spark(x-52-u*78,y+12+Math.sin(u*5+j)*12,2.5,tm+j,KR5_LIGHT[j],Math.sin(u*Math.PI)*.5);}
}
function kr5ContinueCue(o,tm){
  if(!o.done||DURUM!=='oyun'||P.ucus||Math.abs(P.x-o.x)>560)return;
  const x=Math.min(P.x+145,cam.x+VW-60),y=o.y-76;g.save();g.globalAlpha=.6+Math.sin(tm*3)*.14;g.strokeStyle='#ffcf84';g.lineWidth=2.6;g.lineCap='round';
  for(let i=0;i<2;i++){g.beginPath();g.moveTo(x+i*15-7,y-8);g.lineTo(x+i*15+2,y);g.lineTo(x+i*15-7,y+8);g.stroke();}g.restore();
}
function kr5World(e){const r=cv.getBoundingClientRect();return{x:cam.x+(e.clientX-r.left)*DPR/S,y:cam.y+(e.clientY-r.top)*DPR/S};}
function kr5Hit(o,p){let best=-1,dist=1e12;for(let i=0;i<KR5_COUNT;i++){const f=o.kr5.flowers[i],x=o.x+f.x+Math.sin(now*.85+i)*2.5,y=o.y+f.y+Math.sin(now*1.2+i*1.7)*2,dx=(p.x-x)/78,dy=(p.y-y)/85,d=dx*dx+dy*dy;if(d<=1&&d<dist){best=i;dist=d;}}return best;}
function kr5Claim(e){e.preventDefault();e.stopPropagation();}
function kr5OwnSurface(e){return !e.target||e.target===cv||e.pointerId===KR5.ptr;}
addEventListener('pointerdown',e=>{
  const o=KR5.aktif;if(!o||DURUM!=='oyun'||!kr5OwnSurface(e)||e.pointerType==='mouse'&&e.button!==0)return;
  kr5Claim(e);const p=kr5World(e),i=kr5Hit(o,p);KR5.ptr=e.pointerId;KR5.note=i;KR5.px=p.x;KR5.py=p.y;
  if(i>=0)kr5OpenFlower(o,i,false);try{cv.setPointerCapture(e.pointerId);}catch(_){}
},true);
addEventListener('pointermove',e=>{const o=KR5.aktif;if(!o||!kr5OwnSurface(e))return;kr5Claim(e);if(e.pointerId!==KR5.ptr)return;const p=kr5World(e),i=kr5Hit(o,p);KR5.px=p.x;KR5.py=p.y;KR5.note=i;if(i>=0)kr5OpenFlower(o,i,false);},true);
function kr5Release(e){if(!kr5OwnSurface(e)||!KR5.aktif&&e.pointerId!==KR5.ptr)return;if(e.pointerId===KR5.ptr){KR5.ptr=KR5.note=-1;KR5.hold=0;}kr5Claim(e);}
addEventListener('pointerup',kr5Release,true);addEventListener('pointercancel',kr5Release,true);
addEventListener('blur',kr5ResetInput);
addEventListener('keydown',e=>{const o=KR5.aktif;if(!o||DURUM!=='oyun'||e.target&&/^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(e.target.tagName))return;if(!/^(Space|KeyE|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|KeyW|KeyA|KeyS|KeyD)$/.test(e.code))return;kr5Claim(e);if(e.repeat||!(e.code==='Space'||e.code==='KeyE'))return;const i=kr5NextClosed(o);if(i>=0)kr5OpenFlower(o,i,false);},true);
OLAY.on('durum',d=>{if(d==='oyun')return;if(KR5.aktif&&d!=='mola'&&d!=='duraklat')kr5Restore(KR5.o,false);kr5ResetInput();});
TUR.kaydet('volkanMini',{
  kur(o){o.r=145;o.ry=95;o.done=false;const k=o.kr5={active:false,phase:'wait',phaseAge:0,age:0,opened:0,selected:0,queue:new Int8Array(KR5_COUNT),queueCount:0,queueRead:0,current:-1,action:'idle',actionAge:0,breath:0,finalAge:-1,arcHeight:25,userHits:0,helpHits:0,last:-1,idle:0,helpAt:KR5_HELP_FIRST,helpSaid:false,joy:0,scale:1,mx:o.x-70,my:o.y-95,rot:0,travelT:0,travelDuration:.95,fromX:0,fromY:0,targetX:0,targetY:0,entry:{x:0,y:0,safeX:0,safeY:0,f:1,dragonX:0,dragonY:0},seat:{x:0,y:0,elX:0,elY:0,aci:0},poseOpt:{el:{x:0,y:0},aci:0,vy:0,sevinc:0,ruzgar:.4,isik:0},flowers:[],kameraFn:null};
    k.kameraFn=typeof omDkEkle==='function'?()=>omDkEkle(o.x-345,o.y-480,o.x+345,o.y+45):null;
    for(let i=0;i<KR5_COUNT;i++){k.flowers.push({x:KR5_X[i],y:KR5_Y[i],done:false,queued:false,help:false,bloomT:0,birdAge:-1,pulse:0,touch:0});kr5PetalArt(i);kr5BudArt(i);kr5BirdArt(i,false);kr5BirdArt(i,true);}
    o.adim=dt=>kr5FlightStep(o,dt);kr5GardenArt();kr5RootArt(0);kr5RootArt(1);KR5.o=o;
  },
  dokun:kr5Activate,guncelle:kr5Update,
  ciz(o,tm){if(o.x<cam.x-420||o.x>cam.x+VW+420)return;const k=o.kr5;g.drawImage(kr5GardenArt(),o.x-330,o.y-46,660,190);g.drawImage(kr5RootArt(0),o.x-330,o.y-450,660,500);if(k.opened>0){g.save();g.globalAlpha=k.finalAge>=0?smooth(clamp(k.finalAge/1.3,0,1)):.14*k.opened/KR5_COUNT;g.drawImage(kr5RootArt(1),o.x-330,o.y-450,660,500);g.restore();}for(let i=0;i<KR5_COUNT;i++)kr5DrawStem(o,k.flowers[i],i,tm);for(let i=0;i<KR5_COUNT;i++)kr5DrawFlower(o,k.flowers[i],i,tm);},
  cizOn(o,tm){kr5DrawFlight(o,tm);kr5DrawBirds(o,tm);kr5ContinueCue(o,tm);}
});

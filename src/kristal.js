/* Kor Çiçekleri: Feza, Pırıl'ın sırtında altı uyuyan çiçeği uyandırır.
   Bir çiçeğe tek dokunuş = o çiçek hemen açılır. Sıra, nota, sayaç, el simgesi ve kaybetme yok.
   Uçuş bahçenin üstünde küçük bir turdur; başladığı güvenli kıyıya yumuşakça döner. */
'use strict';
const KR5 = {o:null,ptr:-1,note:-1,bud:-1,px:0,py:0,hold:0,
  get aktif(){return this.o&&this.o.kr5&&this.o.kr5.active&&!this.o.done?this.o:null;}};
const KR5_COUNT=6, KR5_TAKEOFF=1.6, KR5_CELEBRATE=2.2, KR5_LAND=1.6, KR5_HELP_FIRST=8, KR5_HELP_EVERY=7;
const KR5_COLORS=['#f03d6b','#a83bd0','#ff7459','#c638a0','#8946d6','#ed476f'];
const KR5_LIGHT=['#ff9b9c','#d38af0','#ffb582','#ef83cb','#be8cf2','#ff99ae'];
const KR5_SHADE=['#932746','#602e88','#ad3b51','#762359','#4d2e7f','#942d62'];
const kr5PetalArts=[],kr5BudArts=[];
let kr5GardenCache=null,kr5ShelfCache=null;
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
  q.fillStyle='#62344f';q.beginPath();q.moveTo(-311,7);q.bezierCurveTo(-218,-24,-111,-24,-15,-13);q.bezierCurveTo(86,-25,233,-18,307,6);q.quadraticCurveTo(322,28,281,48);q.bezierCurveTo(115,85,-139,77,-278,51);q.quadraticCurveTo(-333,29,-311,7);q.fill();
  q.fillStyle='#db4856';q.beginPath();q.moveTo(-293,9);q.bezierCurveTo(-160,-15,-101,6,-1,-4);q.bezierCurveTo(107,-18,231,-10,291,9);q.quadraticCurveTo(282,32,243,35);q.bezierCurveTo(91,56,-117,52,-261,33);q.quadraticCurveTo(-302,27,-293,9);q.fill();
  q.fillStyle='#fa854d';q.beginPath();q.moveTo(-281,12);q.bezierCurveTo(-183,0,-115,18,-21,8);q.bezierCurveTo(93,-3,204,1,273,13);q.bezierCurveTo(206,24,110,16,24,25);q.bezierCurveTo(-85,35,-204,21,-281,12);q.fill();
  q.strokeStyle='#ffc772';q.lineWidth=2;q.beginPath();q.moveTo(-272,15);q.bezierCurveTo(-147,26,-80,4,24,13);q.bezierCurveTo(144,25,219,13,265,17);q.stroke();
  kr5Poly(q,[[-315,8],[-279,-8],[-243,-4],[-220,14],[-252,30],[-291,29]],'#554263');
  kr5Poly(q,[[-315,8],[-279,-8],[-243,-4],[-266,9]],'#92758a');
  kr5Poly(q,[[238,4],[275,-11],[310,0],[321,21],[281,37],[251,28]],'#574062');
  kr5Poly(q,[[238,4],[275,-11],[310,0],[277,10]],'#a07b8a');
  q.strokeStyle='rgba(255,179,119,.67)';q.lineWidth=1;q.beginPath();q.moveTo(-292,29);q.lineTo(-254,30);q.lineTo(-224,16);q.moveTo(254,29);q.lineTo(281,36);q.lineTo(316,22);q.stroke();
  const r=rng(552384);for(let i=0;i<180;i++){q.fillStyle=i%3?'rgba(255,221,184,.05)':'rgba(39,22,56,.08)';q.fillRect(-310+r()*630,-10+r()*65,.3+r()*.9,.3+r()*.5);}
  return kr5GardenCache=c;
}
function kr5ShelfArt(){
  if(kr5ShelfCache)return kr5ShelfCache;
  const c=document.createElement('canvas');c.width=288;c.height=244;const q=c.getContext('2d');q.scale(2,2);q.translate(72,83);
  for(let side=-1;side<=1;side+=2){const yy=-29+(side>0?-20:0),tip=side*35;kr5Poly(q,[[0,yy],[tip,yy-26],[tip+side*9,yy-16],[side*13,yy+1]],side>0?'#679b8e':'#407479');q.strokeStyle='#a3b69b';q.lineWidth=.7;q.beginPath();q.moveTo(0,yy);q.lineTo(tip,yy-20);q.stroke();}
  kr5Poly(q,[[-62,0],[-42,-13],[31,-16],[62,-1],[40,22],[-34,25]],'#493854');
  kr5Poly(q,[[-62,0],[-42,-13],[31,-16],[62,-1],[7,8],[-28,6]],'#887087');
  kr5Poly(q,[[-28,6],[7,8],[40,22],[-34,25]],'#665066');
  q.strokeStyle='#d57883';q.lineWidth=1;q.beginPath();q.moveTo(-54,4);q.lineTo(-33,22);q.lineTo(37,20);q.stroke();
  q.strokeStyle='rgba(228,185,171,.24)';q.lineWidth=.65;q.beginPath();q.moveTo(-40,-10);q.lineTo(-25,1);q.lineTo(-28,6);q.moveTo(17,-12);q.lineTo(7,8);q.lineTo(17,21);q.stroke();
  const r=rng(553156);for(let i=0;i<190;i++){const x=-54+r()*108,y=-10+r()*31;q.fillStyle=i%3?'rgba(255,224,193,.04)':'rgba(32,17,49,.06)';q.fillRect(x,y,.25+r()*.6,.25+r()*.4);}
  return kr5ShelfCache=c;
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
  k.fromX=k.mx;k.fromY=k.my;k.targetX=o.x-245;k.targetY=o.y-42;k.travelT=0;k.travelDuration=KR5_TAKEOFF;k.facing=1;
  KR5.o=o;kr5ResetInput();P.ucus=o;P.vx=P.vy=0;P.buf=0;P.kilit=0;P.fade=0;P.ground=false;
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanCicekUcusu',1.5,k.kameraFn,1,.42);
  OLAY.emit('volkanMiniBasla',{o,cicek:true,total:KR5_COUNT});OLAY.emit('volkanMiniAsama',{o,cicek:true,stage:1,opened:k.opened,total:KR5_COUNT});return true;
}
function kr5OpenFlower(o,index,help){
  const k=o.kr5;if(!k.active||o.done||k.phase!=='play'||DURUM!=='oyun'||!Number.isInteger(index)||index<0||index>=KR5_COUNT)return false;
  const f=k.flowers[index];if(f.done)return false;
  f.done=true;f.bloomT=0;f.pulse=1;k.opened++;k.last=index;k.idle=0;k.helpAt=KR5_HELP_EVERY;k.joy=1;
  if(help)k.helpHits++;else{k.userHits++;k.helpAt=KR5_HELP_FIRST;}
  k.fromX=k.mx;k.fromY=k.my;k.targetX=o.x+f.x-78;k.targetY=o.y+f.y+112;k.travelT=0;k.travelDuration=.95;
  OLAY.emit('volkanCicekAc',{o,index,opened:k.opened,total:KR5_COUNT,help:!!help});
  if(k.opened===2||k.opened===4)OLAY.emit('volkanMiniAsama',{o,cicek:true,stage:Math.ceil(k.opened/2)+1,opened:k.opened,total:KR5_COUNT});
  if(k.opened===KR5_COUNT){k.phase='celebrate';k.phaseAge=0;kr5ResetInput();}
  return true;
}
function kr5Restore(o,complete){
  const k=o.kr5,e=k.entry;if(!k.active)return;const owns=P.ucus===o;
  if(owns){P.ucus=null;P.x=e.x;P.y=e.y;P.rx=P.x;P.ry=P.y;P.vx=P.vy=0;P.ground=true;P.f=e.f;P.safeX=e.safeX;P.safeY=e.safeY;P.buf=0;P.dj=true;P.fade=0;P.kilit=0;P.air=0;P.bounce=false;
    D.x=e.x-72;D.y=e.y-95;D.vx=D.vy=D.pvx=D.pvy=0;}
  k.active=false;k.phase=complete?'done':'wait';k.phaseAge=0;kr5ResetInput();
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanCicekUcusu',.1,k.kameraFn,1,.42);
  if(complete&&!o.done){o.done=true;if(typeof V5!=='undefined')V5.mini=true;lightTarget=Math.max(lightTarget,.55);OLAY.emit('volkanMiniTamam',{o,cicek:true,opened:k.opened,total:KR5_COUNT});kr5Soz('p_v_kristal_son');}
  else o.dokundu=false;
}
function kr5FlyPosition(o,dt){
  const k=o.kr5;k.travelT=Math.min(k.travelDuration,k.travelT+dt);const u=smooth(clamp(k.travelT/k.travelDuration,0,1));
  const oldY=k.my;k.mx=lerp(k.fromX,k.targetX,u);k.my=lerp(k.fromY,k.targetY,u)-Math.sin(u*Math.PI)*25;
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
    if(k.phaseAge>=KR5_TAKEOFF){k.phase='play';k.phaseAge=0;k.fromX=k.mx;k.fromY=k.my;k.targetX=k.mx;k.targetY=k.my;k.travelT=k.travelDuration=.95;if(k.opened===KR5_COUNT){k.phase='celebrate';k.phaseAge=0;}}
  }else if(k.phase==='play'||k.phase==='celebrate'){
    kr5FlyPosition(o,dt);kr5SetMountedPlayer(o);
    if(k.phase==='play'){
      k.idle+=dt;
      // Only after a long pause does Pırıl open ONE flower. Held fingers never fill the garden.
      if(k.idle>=k.helpAt){let next=-1,best=1e12;for(let i=0;i<KR5_COUNT;i++){const f=k.flowers[i];if(f.done)continue;const dx=o.x+f.x-k.mx,dy=o.y+f.y-k.my,d=dx*dx+dy*dy;if(d<best){best=d;next=i;}}
        if(next>=0){kr5OpenFlower(o,next,true);if(!k.helpSaid){k.helpSaid=true;kr5Soz('p_v_mini_yardim');}}}
    }else if(k.phaseAge>=KR5_CELEBRATE){k.phase='land';k.phaseAge=0;k.landX=P.x;k.landY=P.y;k.fromX=k.mx;k.fromY=k.my;k.targetX=k.entry.x-72;k.targetY=k.entry.y-95;k.travelT=0;k.travelDuration=KR5_LAND;}
  }else if(k.phase==='land'){
    const u=smooth(clamp(k.phaseAge/KR5_LAND,0,1));kr5FlyPosition(o,dt);k.scale=lerp(2.05,1,u);k.rot*=Math.exp(-dt*4);
    P.x=lerp(k.landX,k.entry.x,u);P.y=lerp(k.landY,k.entry.y,u)-Math.sin(u*Math.PI)*43;k.px=P.x;k.py=P.y;
    if(k.phaseAge>=KR5_LAND){kr5Restore(o,true);return;}
  }
  D.x=k.mx;D.y=k.my;
}
function kr5Update(o,dt){
  if(!(dt>0)||!Number.isFinite(dt))return;const k=o.kr5;
  for(let i=0;i<KR5_COUNT;i++){const f=k.flowers[i];f.pulse=Math.max(0,f.pulse-dt*1.3);if(f.done)f.bloomT=Math.min(1,f.bloomT+dt/.82);}
  if(DURUM!=='oyun')return;
  if(!k.active&&!o.done&&!P.ucus&&Math.abs(P.x-o.x)<225&&Math.abs(P.y-o.y)<150)kr5Activate(o);
  if(k.active&&typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanCicekUcusu',1.5,k.kameraFn,1,.42);
}
function kr5DrawStem(o,f,i,tm){
  const x=o.x+f.x,y=o.y+f.y+99,sway=Math.sin(tm*.85+i)*2.5;
  g.strokeStyle='#69536f';g.lineWidth=5;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x-18,y-37,x+13+sway,y-60,x+sway,y-99);g.stroke();
  g.strokeStyle=f.done?'#b48a91':'#9c738b';g.lineWidth=1.25;g.stroke();
  g.drawImage(kr5ShelfArt(),x-72,y-83,144,122);
  if(f.y< -250){g.strokeStyle='rgba(223,146,139,.12)';g.lineWidth=1.4;for(let j=0;j<2;j++){g.beginPath();g.moveTo(x-20+j*29,y+29);g.bezierCurveTo(x-31+j*35,y+51,x-8+j*19,y+75,x-13+j*23,y+100);g.stroke();}}
}
function kr5DrawFlower(o,f,i,tm){
  const k=o.kr5,open=smooth(clamp(f.bloomT,0,1)),focus=!f.done&&(k.active?i===kr5NextClosed(o):true),breathe=focus?.025*Math.sin(tm*2.6+i):.009*Math.sin(tm*1.3+i);
  const x=o.x+f.x+Math.sin(tm*.85+i)*2.5,y=o.y+f.y+Math.sin(tm*1.2+i*1.7)*2;
  g.save();g.translate(x,y);g.rotate(Math.sin(tm*.85+i)*.025);g.scale(1+breathe+f.pulse*.055,1-breathe*.45+f.pulse*.025);
  if(open<1){g.globalAlpha=1-smooth(clamp((open-.1)/.7,0,1));g.drawImage(kr5BudArt(i),-52.8,-94.8,105.6,139.2);g.globalAlpha=1;}
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
  if(f.pulse>.01){const u=1-f.pulse;g.save();g.globalAlpha=f.pulse*.55;g.strokeStyle=KR5_LIGHT[i];g.lineWidth=1.4;g.beginPath();g.ellipse(x,y,42+u*48,48+u*43,0,0,Math.PI*2);g.stroke();g.restore();
    for(let j=0;j<7;j++){const a=j*2.399+u*.6,r=29+u*63;kr5Spark(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,3.4*f.pulse,tm+j,KR5_LIGHT[i],f.pulse*.8);}}
}
function kr5NextClosed(o){const k=o.kr5;for(let i=0;i<KR5_COUNT;i++)if(!k.flowers[i].done)return i;return -1;}
function kr5Spark(x,y,r,tm,col,alpha){
  if(r<=0||alpha<=0)return;g.save();g.translate(x,y);g.rotate(tm*.3);g.globalAlpha=alpha;g.fillStyle=col;g.beginPath();g.moveTo(0,-r);g.quadraticCurveTo(r*.2,-r*.2,r,0);g.quadraticCurveTo(r*.2,r*.2,0,r);g.quadraticCurveTo(-r*.2,r*.2,-r,0);g.quadraticCurveTo(-r*.2,-r*.2,0,-r);g.fill();g.restore();
}
function kr5DrawFlight(o,tm){
  const k=o.kr5;if(!k.active||P.ucus!==o)return;const mounted=k.phase==='play'||k.phase==='celebrate',seat=kr5Seat(k,k.age),c=Math.cos(k.rot),sn=Math.sin(k.rot);
  const x=mounted?P.x-(seat.x*c-seat.y*sn):k.mx,y=mounted?P.y-(seat.x*sn+seat.y*c):k.my;
  g.save();g.translate(x,y);g.rotate(k.rot);
  if(typeof pirilCizPoz==='function')pirilCizPoz(g,0,0,k.scale,'binek',k.age,0);
  if(mounted&&typeof fezaCizPoz==='function'){
    const opt=k.poseOpt;opt.el.x=seat.elX-seat.x;opt.el.y=seat.elY-seat.y;opt.aci=seat.aci;opt.sevinc=k.joy*.65;opt.vy=0;
    fezaCizPoz(g,seat.x,seat.y,1.05,'binis',tm,null,opt);
  }
  g.restore();
  if(!mounted&&typeof fezaCizPoz==='function'){const riding=k.phase==='takeoff'&&k.phaseAge>KR5_TAKEOFF*.76;k.poseOpt.aci=k.rot;k.poseOpt.sevinc=.65;fezaCizPoz(g,P.x,P.y,1.05,riding?'binis':k.phase==='land'?'ayakta_yan':'sevinc',tm,null,k.poseOpt);}
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
  kur(o){o.r=145;o.ry=95;o.done=false;const k=o.kr5={active:false,phase:'wait',phaseAge:0,age:0,opened:0,userHits:0,helpHits:0,last:-1,idle:0,helpAt:KR5_HELP_FIRST,helpSaid:false,joy:0,scale:1,mx:o.x-70,my:o.y-95,rot:0,travelT:0,travelDuration:.95,fromX:0,fromY:0,targetX:0,targetY:0,entry:{x:0,y:0,safeX:0,safeY:0,f:1,dragonX:0,dragonY:0},seat:{x:0,y:0,elX:0,elY:0,aci:0},poseOpt:{el:{x:0,y:0},aci:0,vy:0,sevinc:0,ruzgar:.4,isik:0},flowers:[],kameraFn:null};
    k.kameraFn=typeof omDkEkle==='function'?()=>omDkEkle(o.x-345,o.y-480,o.x+345,o.y+45):null;
    for(let i=0;i<KR5_COUNT;i++){k.flowers.push({x:(i%3-1)*205,y:i<3?-340:-165,done:false,bloomT:0,pulse:0});kr5PetalArt(i);kr5BudArt(i);}
    o.adim=dt=>kr5FlightStep(o,dt);kr5GardenArt();kr5ShelfArt();KR5.o=o;
  },
  dokun:kr5Activate,guncelle:kr5Update,
  ciz(o,tm){if(o.x<cam.x-420||o.x>cam.x+VW+420)return;g.drawImage(kr5GardenArt(),o.x-330,o.y-46,660,190);for(let i=0;i<KR5_COUNT;i++)kr5DrawStem(o,o.kr5.flowers[i],i,tm);for(let i=0;i<KR5_COUNT;i++)kr5DrawFlower(o,o.kr5.flowers[i],i,tm);},
  cizOn(o,tm){kr5DrawFlight(o,tm);kr5ContinueCue(o,tm);}
});

/* Güneşkuşu yavrularını besle. Tek büyük meyveyi sürükle ve aç kuşa bırak;
   meyveye, ardından kuşa dokunmak da çalışır. Her yavru iki gerçek lokma yer.
   Metin, eşleştirme, sıra zorunluluğu, kaybetme veya görünmez dolum yok. */
'use strict';
const KR5={o:null,ptr:-1,note:-1,bud:-1,px:0,py:0,hold:0,get aktif(){return this.o&&this.o.kr5&&this.o.kr5.active&&!this.o.done?this.o:null;}};
const KR5_COUNT=3,KR5_FEEDS=6,KR5_ARRIVE=1.1,KR5_DELIVER=.32,KR5_FINAL=5.2,KR5_LAND=.65;
const KR5_X=[-208,0,208],KR5_Y=[-195,-265,-185];
const KR5_BODY=['#d9658d','#9a71cf','#e68b75'],KR5_SHADOW=['#8e436c','#654a98','#a65166'],KR5_WING=['#eea0aa','#c5a5ea','#f3b39a'];
const kr5Bodies=[],kr5Wings=[],kr5Nests=[];let kr5FruitArtCache=null,kr5BasketArtCache=null,kr5MotherBody=null,kr5MotherWing=null;
function kr5Poly(q,p,col){q.fillStyle=col;q.beginPath();for(let i=0;i<p.length;i++){if(i)q.lineTo(p[i][0],p[i][1]);else q.moveTo(p[i][0],p[i][1]);}q.closePath();q.fill();}
function kr5Soz(key){if(typeof SES!=='undefined'&&SES.soyle)SES.soyle(key);}
function kr5ResetInput(){KR5.ptr=KR5.note=KR5.bud=-1;KR5.hold=0;if(typeof omHepsiniBirak==='function')omHepsiniBirak();}
function kr5BodyArt(i){
  if(kr5Bodies[i])return kr5Bodies[i];const c=document.createElement('canvas');c.width=280;c.height=360;const q=c.getContext('2d');q.scale(2,2);q.translate(70,112);q.lineJoin='round';q.lineCap='round';
  // A plump folded body and heart-shaped ivory face read as a creature, not a button.
  q.strokeStyle='#48384f';q.lineWidth=2.3;q.fillStyle=KR5_BODY[i];q.beginPath();q.moveTo(-26,-37);q.bezierCurveTo(-46,-18,-43,21,-26,36);q.quadraticCurveTo(0,51,27,36);q.bezierCurveTo(44,16,40,-21,25,-37);q.closePath();q.fill();q.stroke();
  kr5Poly(q,[[-37,-7],[-25,-35],[-5,2],[-18,35],[-32,26]],KR5_SHADOW[i]);kr5Poly(q,[[-5,2],[25,-35],[36,-4],[18,34],[-18,35]],KR5_WING[i]);
  q.fillStyle=KR5_BODY[i];q.beginPath();q.moveTo(-39,-48);q.bezierCurveTo(-47,-77,-22,-101,0,-100);q.bezierCurveTo(27,-101,48,-75,39,-47);q.bezierCurveTo(31,-24,-29,-24,-39,-48);q.fill();q.stroke();
  q.fillStyle='#fff0d2';q.beginPath();q.moveTo(0,-76);q.bezierCurveTo(-13,-99,-38,-82,-33,-60);q.bezierCurveTo(-31,-43,-12,-35,0,-32);q.bezierCurveTo(16,-37,33,-45,34,-61);q.bezierCurveTo(38,-83,13,-97,0,-76);q.fill();
  q.fillStyle='#f5bcac';q.globalAlpha=.64;q.beginPath();q.ellipse(-26,-52,9,5,-.2,0,Math.PI*2);q.ellipse(26,-52,9,5,.2,0,Math.PI*2);q.fill();q.globalAlpha=1;
  kr5Poly(q,[[-15,-95],[-17,-119],[-3,-109],[3,-126],[14,-109],[21,-111],[15,-94]],KR5_BODY[i]);kr5Poly(q,[[-3,-109],[3,-126],[7,-104]],'#ffd59b');
  q.strokeStyle='rgba(255,218,175,.65)';q.lineWidth=.8;q.beginPath();q.moveTo(-33,-5);q.lineTo(-19,29);q.moveTo(23,-24);q.lineTo(18,31);q.moveTo(-13,-98);q.lineTo(-15,-114);q.stroke();
  const r=rng(71345+i*71);q.save();q.beginPath();q.ellipse(0,3,36,37,0,0,Math.PI*2);q.clip();for(let j=0;j<200;j++){q.fillStyle=j%2?'rgba(255,241,211,.05)':'rgba(43,23,63,.05)';q.fillRect(-37+r()*74,-34+r()*73,.25+r()*.7,.25+r()*.4);}q.restore();return kr5Bodies[i]=c;
}
function kr5WingArt(i){
  if(kr5Wings[i])return kr5Wings[i];const c=document.createElement('canvas');c.width=168;c.height=144;const q=c.getContext('2d');q.scale(2,2);q.translate(18,17);
  q.strokeStyle='#49384e';q.lineWidth=1.6;q.fillStyle=KR5_BODY[i];q.beginPath();q.moveTo(0,0);q.quadraticCurveTo(28,-17,60,-8);q.lineTo(47,11);q.lineTo(49,22);q.lineTo(29,27);q.quadraticCurveTo(12,25,0,0);q.fill();q.stroke();
  kr5Poly(q,[[0,0],[60,-8],[37,9],[29,27]],KR5_WING[i]);kr5Poly(q,[[0,0],[37,9],[16,20]],KR5_SHADOW[i]);q.strokeStyle='#f4cfb8';q.lineWidth=.75;q.beginPath();q.moveTo(3,1);q.lineTo(37,9);q.lineTo(46,20);q.stroke();return kr5Wings[i]=c;
}
function kr5NestArt(i){
  if(kr5Nests[i])return kr5Nests[i];const c=document.createElement('canvas');c.width=356;c.height=202;const q=c.getContext('2d');q.scale(2,2);q.translate(89,38);
  kr5Poly(q,[[-78,14],[-54,-3],[-19,1],[17,-8],[64,-2],[81,15],[59,39],[18,49],[-31,44],[-65,33]],'#493e58');kr5Poly(q,[[-78,14],[-54,-3],[-19,1],[17,-8],[64,-2],[81,15],[24,22],[-25,19]],'#947a8a');
  q.fillStyle='#3f6d73';q.beginPath();q.ellipse(0,7,68,23,0,0,Math.PI*2);q.fill();q.fillStyle='#223f51';q.beginPath();q.ellipse(0,3,57,15,0,0,Math.PI*2);q.fill();
  for(let j=0;j<9;j++){const x=-59+j*15,yy=11+Math.sin(j/8*Math.PI)*10;kr5Poly(q,[[x-10,yy-7],[x+12,yy-13],[x+20,yy+6],[x+1,yy+12]],j%2?'#81b8ae':'#c8d5bc');kr5Poly(q,[[x-10,yy-7],[x+20,yy+6],[x+1,yy+12]],j%2?'#538c89':'#9bbca8');}
  q.strokeStyle='#efd9ad';q.lineWidth=1.4;q.beginPath();q.ellipse(0,8,65,21,0,0,Math.PI);q.stroke();q.strokeStyle='rgba(255,181,129,.65)';q.lineWidth=.9;q.beginPath();q.moveTo(-63,33);q.lineTo(-30,43);q.lineTo(18,48);q.lineTo(58,39);q.stroke();return kr5Nests[i]=c;
}
function kr5FruitArt(){
  if(kr5FruitArtCache)return kr5FruitArtCache;const c=document.createElement('canvas');c.width=200;c.height=216;const q=c.getContext('2d');q.scale(2,2);q.translate(50,61);
  q.strokeStyle='#815342';q.lineWidth=1.8;q.fillStyle='#f5b842';q.beginPath();q.moveTo(0,-30);q.bezierCurveTo(-34,-42,-44,-12,-34,14);q.bezierCurveTo(-24,40,21,42,34,13);q.bezierCurveTo(45,-12,32,-42,0,-30);q.fill();q.stroke();
  kr5Poly(q,[[-34,-10],[-22,-30],[0,-30],[-4,0],[-22,25]],'#ffd978');kr5Poly(q,[[-4,0],[0,-30],[25,-27],[34,13],[16,32]],'#f9c752');kr5Poly(q,[[-22,25],[-4,0],[16,32],[2,37]],'#dfa23c');
  q.strokeStyle='rgba(255,242,179,.82)';q.lineWidth=1.5;q.beginPath();q.moveTo(-25,-12);q.quadraticCurveTo(-23,-23,-13,-25);q.stroke();q.strokeStyle='#715743';q.lineWidth=3;q.beginPath();q.moveTo(0,-30);q.quadraticCurveTo(2,-42,9,-47);q.stroke();
  kr5Poly(q,[[4,-38],[20,-53],[34,-48],[24,-35],[8,-33]],'#519b83');kr5Poly(q,[[4,-38],[34,-48],[24,-35],[8,-33]],'#7bb89a');return kr5FruitArtCache=c;
}
function kr5BasketArt(){
  if(kr5BasketArtCache)return kr5BasketArtCache;const c=document.createElement('canvas');c.width=340;c.height=250;const q=c.getContext('2d');q.scale(2,2);q.translate(85,78);
  q.strokeStyle='#294e5b';q.lineWidth=10;q.beginPath();q.ellipse(0,-15,54,46,0,Math.PI,Math.PI*2);q.stroke();q.strokeStyle='#d5e2c9';q.lineWidth=4;q.stroke();
  q.fillStyle='#315867';q.beginPath();q.ellipse(0,-2,66,21,0,0,Math.PI*2);q.fill();q.fillStyle='#162f42';q.beginPath();q.ellipse(0,-4,55,14,0,0,Math.PI*2);q.fill();
  q.strokeStyle='#294957';q.lineWidth=1.8;q.fillStyle='#6aaca6';q.beginPath();q.moveTo(-65,-1);q.quadraticCurveTo(-60,35,-38,42);q.quadraticCurveTo(1,55,42,41);q.quadraticCurveTo(61,25,65,-1);q.quadraticCurveTo(1,26,-65,-1);q.fill();q.stroke();
  kr5Poly(q,[[-63,2],[-40,11],[-22,44],[-38,42],[-55,31]],'#9dcabd');kr5Poly(q,[[6,17],[25,14],[42,41],[20,47]],'#a8d1c1');kr5Poly(q,[[-25,14],[-4,18],[14,48],[-7,49]],'#397784');
  q.strokeStyle='#f1dfb3';q.lineWidth=3;q.beginPath();q.moveTo(-64,-1);q.quadraticCurveTo(0,29,64,-1);q.stroke();q.lineWidth=1;q.beginPath();q.moveTo(-53,26);q.quadraticCurveTo(0,45,54,25);q.stroke();return kr5BasketArtCache=c;
}
function kr5BirdPosition(o,i,tm,out){const b=o.kr5.birds[i],p=out||{};p.x=o.x+b.x;p.y=o.y+b.y+Math.sin((tm==null?now:tm)*1.5+i)*1.4;return p;}
function kr5FruitPosition(o,out){const p=out||{},f=o.kr5.fruit;p.x=f.x;p.y=f.y;return p;}
function kr5CanGrab(o){const k=o.kr5;return k.active&&k.phase==='feed'&&k.totalFed<6&&(k.fruit.state==='ready'||k.fruit.state==='selected'||k.fruit.state==='demo'||k.fruit.state==='return');}
function kr5Mouth(o,i,out){const b=o.kr5.birds[i],p=out;p.x=o.x+b.x;p.y=o.y+b.y-48;return p;}
function kr5StartReturn(o){const f=o.kr5.fruit;f.state='return';f.t=0;f.fromX=f.x;f.fromY=f.y;f.target=-1;KR5.ptr=-1;}
function kr5Activate(o){
  const k=o.kr5;if(o.done||k.active||P.ucus||DURUM!=='oyun')return false;if(P.fade>0||!P.ground||P.kilit>.05||D.mode==='tasi'){o.dokundu=false;return false;}
  const e=k.entry;e.x=P.x;e.y=P.y;e.safeX=P.safeX;e.safeY=P.safeY;e.f=P.f;
  k.active=true;k.phase='arrive';k.phaseAge=k.age=k.idle=0;k.helpAt=8;k.demoDone=false;k.helpSaid=false;KR5.o=o;kr5ResetInput();P.ucus=o;P.vx=P.vy=P.buf=P.kilit=P.fade=0;
  const f=k.fruit;f.state='ready';f.x=f.homeX;f.y=f.homeY;f.target=-1;f.t=0;
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanCicekUcusu',1.5,k.kameraFn,1,.42);
  OLAY.emit('volkanMiniBasla',{o,yavru:true,total:KR5_FEEDS});return true;
}
function kr5Restore(o,complete){
  const k=o.kr5,e=k.entry;if(!k.active)return;if(P.ucus===o){P.ucus=null;P.x=P.rx=e.x;P.y=P.ry=e.y;P.safeX=e.safeX;P.safeY=e.safeY;P.f=e.f;P.vx=P.vy=P.buf=P.fade=P.kilit=P.air=0;P.ground=true;P.dj=true;P.bounce=false;D.x=e.x-72;D.y=e.y-95;D.vx=D.vy=D.pvx=D.pvy=0;}
  k.active=false;k.phase=complete?'done':'wait';k.phaseAge=0;kr5ResetInput();k.fruit.state='ready';k.fruit.x=k.fruit.homeX;k.fruit.y=k.fruit.homeY;k.fruit.target=-1;
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanCicekUcusu',.1,k.kameraFn,1,.42);
  if(complete&&!o.done){o.done=true;if(typeof V5!=='undefined')V5.mini=true;lightTarget=Math.max(lightTarget,.55);OLAY.emit('volkanMiniTamam',{o,yavru:true,fed:k.totalFed,totalFed:k.totalFed,total:KR5_FEEDS});kr5Soz('p_v_kristal_son');}else o.dokundu=false;
}
function kr5OfferFruit(o,index,help){
  const k=o.kr5,f=k.fruit;if(!k.active||k.phase!=='feed'||DURUM!=='oyun'||!Number.isInteger(index)||index<0||index>=3||k.birds[index].fed>=2||!['drag','selected','ready','demo'].includes(f.state))return false;
  if(!help&&f.state!=='drag'&&f.state!=='selected')return false;
  f.state='feeding';f.t=0;f.fromX=f.x;f.fromY=f.y;f.target=index;f.help=!!help;f.delivered=false;k.idle=0;KR5.ptr=-1;return true;
}
function kr5Feed(o,index,help){
  const k=o.kr5,b=k.birds[index];if(b.fed>=2||k.totalFed>=KR5_FEEDS)return;b.fed++;b.chew=.9;b.swell=1;b.full=b.fed===2;b.practice=b.full?1.7:0;k.totalFed++;k.userFeeds+=help?0:1;k.helpFeeds+=help?1:0;k.idle=0;k.helpAt=help?7:8;
  for(let i=0;i<k.crumbs.length;i++){const c=k.crumbs[i];c.on=true;c.age=0;c.x=o.x+b.x;c.y=o.y+b.y-44;c.vx=Math.sin(i*2.399)*35;c.vy=-18-Math.abs(Math.cos(i*1.7))*25;c.col=i%2?'#ffe0a1':'#e9ad58';}
  OLAY.emit('volkanYavruBesle',{o,index,fed:k.totalFed,totalFed:k.totalFed,total:KR5_FEEDS,babyFed:b.fed,help:!!help});
  if(b.full){k.fullBirds++;OLAY.emit('volkanMiniAsama',{o,yavru:true,stage:k.fullBirds,fed:k.totalFed,total:KR5_FEEDS});}
  if(k.totalFed===KR5_FEEDS)k.allFedAge=0;
}
function kr5Hungry(o){for(let i=0;i<3;i++)if(o.kr5.birds[i].fed<2)return i;return-1;}
function kr5FlightStep(o,dt){
  const k=o.kr5;if(!(dt>0)||!Number.isFinite(dt)||DURUM!=='oyun'||!k.active||P.ucus!==o)return;k.age+=dt;k.phaseAge+=dt;P.x=k.entry.x;P.y=k.entry.y;P.vx=P.vy=P.buf=0;P.ground=true;
  if(k.phase==='arrive'&&k.phaseAge>=KR5_ARRIVE){k.phase=k.totalFed===6?'finale':'feed';k.phaseAge=0;}
  const f=k.fruit;f.t+=dt;
  if(k.phase==='feed'){
    if(f.state==='feeding'){
      const b=k.birds[f.target],u=smooth(clamp(f.t/KR5_DELIVER,0,1));f.x=lerp(f.fromX,o.x+b.x,u);f.y=lerp(f.fromY,o.y+b.y-48,u)-Math.sin(u*Math.PI)*28;
      if(u>=1&&!f.delivered){f.delivered=true;kr5Feed(o,f.target,f.help);f.state='cooldown';f.t=0;}
    }else if(f.state==='cooldown'){
      if(f.t>=.63){f.state='ready';f.t=0;f.target=-1;f.x=f.homeX;f.y=f.homeY;}
    }else if(f.state==='return'){
      const u=smooth(clamp(f.t/.42,0,1));f.x=lerp(f.fromX,f.homeX,u);f.y=lerp(f.fromY,f.homeY,u)-Math.sin(u*Math.PI)*17;if(u>=1){f.state='ready';f.t=0;}
    }else if(f.state==='demo'){
      const u=Math.sin(clamp(f.t/1.8,0,1)*Math.PI),b=k.birds[f.target];f.x=lerp(f.homeX,o.x+b.x,u*.77);f.y=lerp(f.homeY,o.y+b.y-19,u*.77)-Math.sin(u*Math.PI)*20;
      if(f.t>=1.8){f.state='ready';f.t=0;f.x=f.homeX;f.y=f.homeY;f.target=-1;}
    }else if(f.state==='ready'){
      f.x=f.homeX;f.y=f.homeY+Math.sin(k.age*1.9)*2-(f.pulse>0?Math.sin((1-f.pulse)*Math.PI)*9:0);
    }
    if(f.state==='ready'||f.state==='selected'||f.state==='demo')k.idle+=dt;
    if(k.idle>=4&&!k.demoDone&&k.totalFed===0&&f.state==='ready'){k.demoDone=true;f.state='demo';f.t=0;f.target=0;}
    if(k.idle>=k.helpAt&&f.state==='ready'&&KR5.ptr<0){const i=kr5Hungry(o);if(i>=0){kr5OfferFruit(o,i,true);if(!k.helpSaid){k.helpSaid=true;kr5Soz('p_v_mini_yardim');}}}
    if(f.state==='selected'&&k.idle>=8&&!k.helpSaid){k.helpSaid=true;f.pulse=1;kr5Soz('p_v_mini_yardim');}
    if(f.state==='selected'&&k.idle>=16&&KR5.ptr<0)kr5StartReturn(o);
    if(k.allFedAge>=0){k.allFedAge+=dt;if(k.allFedAge>=.95){k.phase='finale';k.phaseAge=0;kr5ResetInput();}}
  }else if(k.phase==='finale'){
    for(let i=0;i<3;i++)if(!k.birds[i].flew&&k.phaseAge>=.8+i*.28){k.birds[i].flew=true;OLAY.emit('volkanYavruUctu',{o,index:i});}
    if(k.phaseAge>=KR5_FINAL){k.phase='land';k.phaseAge=0;}
  }else if(k.phase==='land'&&k.phaseAge>=KR5_LAND){kr5Restore(o,true);return;}
  D.x=k.entry.x-72;D.y=k.entry.y-95;
}
function kr5Update(o,dt){
  if(!(dt>0)||!Number.isFinite(dt)||DURUM!=='oyun')return;const k=o.kr5;
  k.fruit.pulse=Math.max(0,k.fruit.pulse-dt*1.6);
  for(const b of k.birds){b.chew=Math.max(0,b.chew-dt);b.swell=Math.max(0,b.swell-dt*1.4);b.practice=Math.max(0,b.practice-dt);b.peek=Math.max(0,b.peek-dt);}
  for(const c of k.crumbs){if(!c.on)continue;c.age+=dt;if(c.age>1.05)c.on=false;}
  if(!k.active&&!o.done&&!P.ucus&&Math.abs(P.x-o.x)<225&&Math.abs(P.y-o.y)<150)kr5Activate(o);
  if(k.active&&typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanCicekUcusu',1.5,k.kameraFn,1,.42);
}
function kr5DrawYoungModel(i,x,y,scale,tm,fed,chew,flight,lookX,lookY,alpha,invite=0){
  const full=fed>=2,wing=flight?Math.sin(tm*7+i):full?Math.sin(tm*5+i)*.45:.12*Math.sin(tm*1.5+i),bounce=chew>0?Math.sin((.9-chew)*20)*chew*3:0;
  g.save();g.translate(x,y+bounce);g.scale(scale*(1+chew*.025),scale*(1-chew*.04));g.globalAlpha=alpha;
  // Dark outlined feet and a folded tail keep the silhouette grounded in the nest.
  g.strokeStyle='#634a4b';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-12,32);g.lineTo(-15,47);g.lineTo(-24,48);g.moveTo(12,32);g.lineTo(16,47);g.lineTo(25,47);g.stroke();
  if(full){g.save();g.translate(-4,29);g.rotate(.08+Math.sin(tm*1.6+i)*.06);g.fillStyle=KR5_WING[i];g.strokeStyle='#4a3850';g.lineWidth=1.2;g.beginPath();g.moveTo(-16,0);g.lineTo(-28,41);g.lineTo(-6,30);g.lineTo(9,43);g.lineTo(18,-1);g.fill();g.stroke();g.restore();}
  g.save();g.translate(-27,-2);g.scale(-1,1);g.rotate(-.22-wing*.7);g.drawImage(kr5WingArt(i),-18,-17,84,72);g.restore();
  g.drawImage(kr5BodyArt(i),-70,-112,140,180);
  g.fillStyle=fed?'#f9d999':'#e9c7a0';g.strokeStyle='#b68171';g.lineWidth=.8;g.beginPath();g.ellipse(0,11,17+fed*3,19+fed*3,0,0,Math.PI*2);g.fill();g.stroke();g.strokeStyle='rgba(255,240,197,.6)';g.beginPath();g.moveTo(-10,4);g.quadraticCurveTo(0,0,11,5);g.stroke();
  g.save();g.translate(29,-1);g.rotate(.22+wing*.7);g.drawImage(kr5WingArt(i),-18,-17,84,72);g.restore();
  const blink=(tm+i*.63)%4.7<.12,happy=chew>.22||full&&!flight,eyeH=happy?2.7:blink?1.1:10.5,dx=clamp(lookX,-1,1)*3,dy=clamp(lookY,-1,1)*2;
  for(let side=-1;side<=1;side+=2){g.fillStyle='#fffaf0';g.strokeStyle='#4c3b55';g.lineWidth=1.5;g.beginPath();g.ellipse(side*17,-65,10.8,eyeH,side*.05,0,Math.PI*2);g.fill();g.stroke();if(!happy&&!blink){g.fillStyle='#463350';g.beginPath();g.ellipse(side*17+dx,-64+dy,5.2,7.5,0,0,Math.PI*2);g.fill();g.fillStyle='#fff8df';g.beginPath();g.arc(side*17+dx-1.8,-67+dy,2,0,Math.PI*2);g.fill();}}
  const hungry=fed<2,gap=chew>0?3+Math.abs(Math.sin((.9-chew)*21))*9:hungry?7+Math.sin(tm*2.7+i)*3+invite*8:1.5;
  g.fillStyle='#763b45';g.beginPath();g.ellipse(0,-47,11,gap+3,0,0,Math.PI*2);g.fill();g.fillStyle='#f3c14e';g.strokeStyle='#a06a3e';g.lineWidth=1;g.beginPath();g.moveTo(-15,-48-gap*.3);g.quadraticCurveTo(0,-61-gap*.4,15,-48-gap*.3);g.lineTo(0,-42-gap*.35);g.closePath();g.fill();g.stroke();g.fillStyle='#e9a340';g.beginPath();g.moveTo(-12,-45+gap*.35);g.lineTo(0,-37+gap*.55);g.lineTo(12,-45+gap*.35);g.closePath();g.fill();g.stroke();
  g.restore();
}
function kr5DrawTravelBird(index,x,y,scale,tm,alpha=1){kr5DrawYoungModel(Math.abs(index)%3,x,y,scale,tm,2,0,1,.5,-.1,alpha);}
function kr5MotherArt(wing){
  const old=wing?kr5MotherWing:kr5MotherBody;if(old)return old;const c=document.createElement('canvas');c.width=800;c.height=440;const q=c.getContext('2d');q.scale(2,2);q.translate(200,120);q.lineJoin='round';
  if(wing){kr5Poly(q,[[-24,12],[-140,-68],[-87,-97],[-12,-65],[69,-9],[27,21]],'#b279bd');kr5Poly(q,[[-24,12],[-87,-97],[-12,-65],[69,-9]],'#efd0b0');kr5Poly(q,[[-24,12],[-140,-68],[-87,-97]],'#df9db2');q.strokeStyle='#f9dab4';q.lineWidth=1.1;q.beginPath();q.moveTo(-24,11);q.lineTo(-87,-95);q.lineTo(66,-9);q.stroke();}
  else{kr5Poly(q,[[-171,22],[-92,-10],[-14,-6],[63,-36],[102,-48],[129,-33],[145,-17],[119,-10],[76,11],[17,28],[-82,34]],'#ebbd97');kr5Poly(q,[[-171,22],[-92,-10],[-69,20],[-82,34]],'#b784ad');kr5Poly(q,[[-92,-10],[-14,-6],[17,28],[-69,20]],'#e7a3b3');kr5Poly(q,[[-14,-6],[63,-36],[76,11],[17,28]],'#b98bbf');kr5Poly(q,[[63,-36],[102,-48],[129,-33],[119,-10],[76,11]],'#ffdfaa');kr5Poly(q,[[129,-33],[154,-23],[145,-17]],'#d39167');q.fillStyle='#5c405a';q.beginPath();q.arc(118,-31,3.5,0,Math.PI*2);q.fill();q.strokeStyle='#ac708d';q.lineWidth=1.5;q.beginPath();q.moveTo(99,-16);q.quadraticCurveTo(112,-8,124,-15);q.stroke();q.strokeStyle='rgba(255,233,191,.7)';q.lineWidth=1;q.beginPath();q.moveTo(-165,22);q.lineTo(-69,20);q.lineTo(15,27);q.moveTo(15,27);q.lineTo(62,-33);q.stroke();}
  if(wing)kr5MotherWing=c;else kr5MotherBody=c;return c;
}
function kr5DrawFinal(o,tm){
  const k=o.kr5;if(k.phase!=='finale'&&k.phase!=='land'&&!o.done)return;const t=k.phase==='finale'?k.phaseAge:KR5_FINAL+(k.phase==='land'?k.phaseAge:KR5_LAND),peak=typeof DN5!=='undefined'&&Number.isFinite(DN5.peakX)&&Number.isFinite(DN5.peakY),tx=peak?cam.x+DN5.peakX:o.x+50,ty=peak?cam.y+DN5.peakY:o.y-430;
  const enter=smooth(clamp(t/1.3,0,1)),go=smooth(clamp((t-1.2)/3.8,0,1)),mx=lerp(o.x+520,o.x+90,enter)*(1-go)+tx*go,my=lerp(o.y-395,o.y-345,enter)*(1-go)+(ty-25)*go-Math.sin(go*Math.PI)*40,sz=1.03-go*.77,alpha=1-smooth(clamp((t-4.6)/.6,0,1)),fl=Math.sin(tm*3.7);
  if(alpha>.01){g.save();g.translate(mx,my);g.scale(sz,sz);g.globalAlpha=alpha;g.save();g.rotate(-.15+fl*.15);g.drawImage(kr5MotherArt(true),-200,-120,400,220);g.restore();g.drawImage(kr5MotherArt(false),-200,-120,400,220);g.save();g.rotate(.15-fl*.18);g.scale(1,.8);g.drawImage(kr5MotherArt(true),-200,-120,400,220);g.restore();g.restore();}
  for(let i=0;i<3;i++){const b=k.birds[i],u=smooth(clamp((t-.8-i*.28)/3.9,0,1));if(!u)continue;const v=1-u,sx=o.x+b.x,sy=o.y+b.y,x=v*v*sx+2*v*u*(sx+(tx-sx)*.35)+u*u*(tx+(i-1)*27),y=v*v*sy+2*v*u*(Math.min(sy,ty)-100)+u*u*(ty+18+Math.sin(i*2)*17);kr5DrawTravelBird(i,x,y,(1.15-u*.83),tm+i,1-smooth(clamp((t-5.1)/.65,0,1)));}
}
function kr5DrawFruit(o,tm){
  const k=o.kr5,f=k.fruit;if(k.totalFed>=6||k.phase==='finale'||k.phase==='land'||o.done)return;let scale=1,alpha=1;
  if(f.state==='cooldown'){alpha=1-clamp(f.t/.13,0,1);scale=1-clamp(f.t/.13,0,1)*.8;}else if(f.state==='drag')scale=1.1;else if(f.state==='ready'||f.state==='selected')scale=1+.035*Math.sin(tm*2.6);
  if(alpha<=.01)return;g.save();g.translate(f.x,f.y);g.rotate(f.state==='drag'?Math.sin(tm*4)*.055:Math.sin(tm*1.5)*.025);g.scale(scale,scale);g.globalAlpha=alpha;g.drawImage(kr5FruitArt(),-50,-61,100,108);g.restore();
}
function kr5Draw(o,tm){
  const k=o.kr5;if(o.x<cam.x-470||o.x>cam.x+VW+470)return;
  for(let i=0;i<3;i++){const b=k.birds[i],x=o.x+b.x,y=o.y+b.y;g.save();g.translate(x,y+48);g.rotate(Math.sin(i*2)*.035);g.drawImage(kr5NestArt(i),-89,-38,178,101);g.restore();
    if(k.phase==='finale'&&k.phaseAge>.8+i*.28||k.phase==='land'||o.done)continue;
    const lookX=(k.fruit.x-x)/170,lookY=(k.fruit.y-y+60)/170,scale=(1+b.fed*.055)*(1+b.swell*.015),practice=b.practice>0?Math.sin(b.practice*9)*.3:0;
    kr5DrawYoungModel(i,x,y-b.peek*3,scale*(1+b.peek*.025),tm,b.fed,b.chew,practice,lookX,lookY,1,b.peek);
  }
  g.drawImage(kr5BasketArt(),o.x-55,o.y-77,170,125);
}
function kr5DrawFront(o,tm){
  const k=o.kr5;if(k.active&&P.ucus===o){
    if(typeof fezaCizPoz==='function')fezaCizPoz(g,P.x,P.y,1.08,k.phase==='finale'?'sevinc':'ayakta_yan',tm,null,k.poseOpt);
    if(typeof pirilCizPoz==='function'){const f=k.fruit,escort=f.help&&f.state==='feeding',px=escort?f.x-48:k.entry.x-65,py=escort?f.y-15:k.entry.y-106+Math.sin(tm*1.7)*5;pirilCizPoz(g,px,py,1.05,k.phase==='land'?'goz_kirp':'ucus',tm);}
  }
  kr5DrawFruit(o,tm);
  for(const c of k.crumbs){if(!c.on)continue;const t=c.age;g.save();g.translate(c.x+c.vx*t,c.y+c.vy*t+44*t*t);g.rotate(t*4);g.globalAlpha=1-t/1.05;g.fillStyle=c.col;g.beginPath();g.moveTo(-2.3,-1.5);g.lineTo(3,0);g.lineTo(-1,2.7);g.closePath();g.fill();g.restore();}
  kr5DrawFinal(o,tm);
}
function kr5World(e){const r=cv.getBoundingClientRect();return{x:cam.x+(e.clientX-r.left)*DPR/S,y:cam.y+(e.clientY-r.top)*DPR/S};}
function kr5HitBird(o,p){let best=-1,dist=1e9;for(let i=0;i<3;i++){const b=o.kr5.birds[i];if(b.fed>=2)continue;const dx=(p.x-o.x-b.x)/86,dy=(p.y-o.y-b.y+30)/115,d=dx*dx+dy*dy;if(d<=1&&d<dist){dist=d;best=i;}}return best;}
function kr5HitFruit(o,p){const f=o.kr5.fruit;return Math.hypot((p.x-f.x)/54,(p.y-f.y)/61)<=1;}
function kr5Claim(e){e.preventDefault();e.stopPropagation();}
function kr5OwnSurface(e){return!e.target||e.target===cv||e.pointerId===KR5.ptr;}
addEventListener('pointerdown',e=>{
  const o=KR5.aktif;if(!o||!kr5OwnSurface(e)||DURUM!=='oyun'||e.pointerType==='mouse'&&e.button!==0)return;kr5Claim(e);const k=o.kr5,f=k.fruit;if(k.phase!=='feed')return;const p=kr5World(e);
  if(f.state==='selected'){const i=kr5HitBird(o,p);if(i>=0){kr5OfferFruit(o,i,false);return;}}
  if((f.state==='ready'||f.state==='selected'||f.state==='demo'||f.state==='return')&&kr5HitFruit(o,p)){
    f.state='drag';f.grabX=f.x-p.x;f.grabY=f.y-p.y;f.startX=e.clientX;f.startY=e.clientY;f.moved=false;f.help=false;f.t=0;k.idle=0;KR5.ptr=e.pointerId;OLAY.emit('volkanYemTut',{o});try{cv.setPointerCapture(e.pointerId);}catch(_){}return;
  }
  if(f.state==='selected')kr5StartReturn(o);
  const i=kr5HitBird(o,p);if(i>=0){k.birds[i].peek=.6;f.pulse=1;}
},true);
addEventListener('pointermove',e=>{
  const o=KR5.aktif;if(!o||!kr5OwnSurface(e))return;kr5Claim(e);const f=o.kr5.fruit;if(e.pointerId!==KR5.ptr||f.state!=='drag')return;const p=kr5World(e);f.x=p.x+f.grabX;f.y=p.y+f.grabY;f.moved=f.moved||Math.hypot(e.clientX-f.startX,e.clientY-f.startY)>13;o.kr5.idle=0;
},true);
function kr5Release(e){
  const o=KR5.aktif;if(!o||!kr5OwnSurface(e))return;kr5Claim(e);if(e.pointerId!==KR5.ptr)return;const f=o.kr5.fruit;KR5.ptr=-1;if(f.state!=='drag')return;
  if(e.type==='pointercancel'){kr5StartReturn(o);return;}const p=kr5World(e),i=kr5HitBird(o,p);
  if(i>=0){kr5OfferFruit(o,i,false);return;}
  if(!f.moved){f.state='selected';f.x=f.homeX;f.y=f.homeY-9;f.t=0;}else kr5StartReturn(o);
}
addEventListener('pointerup',kr5Release,true);addEventListener('pointercancel',kr5Release,true);
function kr5CancelInput(){if(KR5.aktif&&KR5.o.kr5.fruit.state==='drag')kr5StartReturn(KR5.o);kr5ResetInput();}
addEventListener('blur',kr5CancelInput);addEventListener('pagehide',kr5CancelInput);
document.addEventListener('visibilitychange',()=>{if(document.hidden)kr5CancelInput();});
cv.addEventListener('lostpointercapture',e=>{if(e.pointerId===KR5.ptr)kr5CancelInput();});
addEventListener('keydown',e=>{
  const o=KR5.aktif;if(!o||DURUM!=='oyun'||e.target&&/^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(e.target.tagName))return;if(!/^(Space|KeyE|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|KeyW|KeyA|KeyS|KeyD)$/.test(e.code))return;kr5Claim(e);if(e.repeat||o.kr5.phase!=='feed')return;const k=o.kr5,f=k.fruit;
  if(e.code==='ArrowLeft')k.keyboardBird=(k.keyboardBird+2)%3;else if(e.code==='ArrowRight')k.keyboardBird=(k.keyboardBird+1)%3;
  else if(e.code==='Space'||e.code==='KeyE'){if(f.state==='ready'){f.state='selected';f.y=f.homeY-9;k.idle=0;OLAY.emit('volkanYemTut',{o});}else if(f.state==='selected'){let i=k.keyboardBird;if(k.birds[i].fed>=2)i=kr5Hungry(o);if(i>=0)kr5OfferFruit(o,i,false);}}
},true);
OLAY.on('durum',d=>{if(d==='oyun')return;if(KR5.aktif){if(d!=='mola'&&d!=='duraklat')kr5Restore(KR5.o,false);else if(KR5.o.kr5.fruit.state==='drag')kr5StartReturn(KR5.o);}kr5ResetInput();});
TUR.kaydet('volkanMini',{
  kur(o){o.r=145;o.ry=95;o.done=false;const k=o.kr5={active:false,phase:'wait',phaseAge:0,age:0,totalFed:0,userFeeds:0,helpFeeds:0,fullBirds:0,allFedAge:-1,idle:0,helpAt:8,helpSaid:false,demoDone:false,keyboardBird:0,entry:{x:0,y:0,safeX:0,safeY:0,f:1},poseOpt:{isik:0,ruzgar:.12},birds:[],crumbs:[],fruit:{state:'ready',x:o.x+30,y:o.y-91,homeX:o.x+30,homeY:o.y-91,fromX:0,fromY:0,grabX:0,grabY:0,startX:0,startY:0,moved:false,target:-1,help:false,delivered:false,pulse:0,t:0},kameraFn:null};
    k.kameraFn=typeof omDkEkle==='function'?()=>omDkEkle(o.x-345,o.y-445,o.x+345,o.y+55):null;
    for(let i=0;i<3;i++){k.birds.push({x:KR5_X[i],y:KR5_Y[i],fed:0,full:false,chew:0,swell:0,practice:0,peek:0,flew:false});kr5BodyArt(i);kr5WingArt(i);kr5NestArt(i);}for(let i=0;i<12;i++)k.crumbs.push({on:false,age:0,x:0,y:0,vx:0,vy:0,col:'#ffe0a1'});
    kr5FruitArt();kr5BasketArt();kr5MotherArt(false);kr5MotherArt(true);o.adim=dt=>kr5FlightStep(o,dt);KR5.o=o;
  },dokun:kr5Activate,guncelle:kr5Update,ciz:kr5Draw,cizOn:kr5DrawFront
});

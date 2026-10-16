/* Anka'nın uyanışı — sıcak yumurtayı gerçek dokunuşlarla canlandır,
   sonra tek büyük kâğıt kanadın inci izini çiz. Okuma, el/ok ipucu,
   besleme tekrarı, yanlış cevap veya kaybetme yok. Phoenix sanatı ANKA'dadır. */
'use strict';
const KR5 = {o:null,ptr:-1,px:0,py:0,get aktif(){return this.o&&this.o.kr5&&this.o.kr5.active&&!this.o.done?this.o:null;}};
const KR5_ARRIVE=.9, KR5_HATCH=2.8, KR5_AWAKEN=6.2, KR5_LAND=.8;
const KR5_TRACE_FALLBACK=[[22,-35],[86,-93],[160,-112],[223,-76],[248,-15]];
let kr5EggArt=null,kr5NestArt=null,kr5FeatherArt=null;
function kr5Poly(q,p,col){q.fillStyle=col;q.beginPath();for(let i=0;i<p.length;i++)i?q.lineTo(p[i][0],p[i][1]):q.moveTo(p[i][0],p[i][1]);q.closePath();q.fill();}
function kr5Soz(key){if(typeof SES!=='undefined'&&SES.soyle)SES.soyle(key);}
function kr5ResetInput(){const id=KR5.ptr;KR5.ptr=-1;if(id>=0&&typeof cv.releasePointerCapture==='function')try{cv.releasePointerCapture(id);}catch(_){}if(typeof omHepsiniBirak==='function')omHepsiniBirak();}
function kr5MakeArt(){
  if(kr5EggArt)return;
  const c=kr5EggArt=document.createElement('canvas');c.width=420;c.height=540;const q=c.getContext('2d');q.scale(2,2);q.translate(105,140);q.lineJoin='round';
  const gr=q.createLinearGradient(-65,-105,70,100);gr.addColorStop(0,'#fff9df');gr.addColorStop(.28,'#fff1c6');gr.addColorStop(.61,'#e6c78e');gr.addColorStop(.82,'#b48168');gr.addColorStop(1,'#694a65');
  q.fillStyle=gr;q.strokeStyle='#473e58';q.lineWidth=2.3;q.beginPath();q.moveTo(0,-113);q.bezierCurveTo(-42,-113,-83,-37,-83,24);q.bezierCurveTo(-83,85,-45,111,0,111);q.bezierCurveTo(49,111,83,81,83,24);q.bezierCurveTo(83,-37,42,-113,0,-113);q.fill();q.stroke();
  q.save();q.beginPath();q.moveTo(0,-111);q.bezierCurveTo(-42,-111,-81,-37,-81,24);q.bezierCurveTo(-81,84,-45,109,0,109);q.bezierCurveTo(48,109,81,80,81,24);q.bezierCurveTo(81,-37,41,-111,0,-111);q.clip();
  kr5Poly(q,[[-69,-48],[-23,-94],[-12,-11],[-73,37]],'#fff3d0');kr5Poly(q,[[-12,-11],[-23,-94],[39,-76],[57,-17]],'#f3dda8');kr5Poly(q,[[57,-17],[75,37],[34,95],[-12,45]],'#c39e81');kr5Poly(q,[[-73,37],[-12,-11],[-12,45],[-49,88]],'#e5cb9b');
  q.strokeStyle='rgba(114,77,81,.26)';q.lineWidth=.9;q.beginPath();q.moveTo(-69,-48);q.lineTo(-12,-11);q.lineTo(57,-17);q.moveTo(-12,-11);q.lineTo(-12,45);q.lineTo(34,95);q.stroke();
  const rr=rng(73915);for(let i=0;i<650;i++){q.fillStyle=i%2?'rgba(255,255,236,.075)':'rgba(72,43,69,.04)';q.fillRect(-84+rr()*168,-114+rr()*228,.3+rr()*.9,.3+rr()*.6);}
  q.restore();
  // A physical feather inlay, never a text/button symbol.
  q.save();q.rotate(.14);q.fillStyle='#c5894e';q.strokeStyle='#f9e8b6';q.lineWidth=1.2;q.beginPath();q.moveTo(0,-61);q.bezierCurveTo(-34,-35,-34,12,0,47);q.bezierCurveTo(34,12,34,-35,0,-61);q.fill();q.stroke();q.strokeStyle='#fff0bf';q.lineWidth=2;q.beginPath();q.moveTo(0,-56);q.quadraticCurveTo(-5,-3,0,54);q.stroke();for(let j=0;j<5;j++){const y=-34+j*14;q.lineWidth=.8;q.beginPath();q.moveTo(0,y+8);q.lineTo(-18-Math.sin(j)*4,y-5);q.moveTo(0,y+8);q.lineTo(18+Math.sin(j)*4,y-5);q.stroke();}q.restore();
  const n=kr5NestArt=document.createElement('canvas');n.width=640;n.height=260;const h=n.getContext('2d');h.scale(2,2);h.translate(160,58);h.lineJoin='round';
  kr5Poly(h,[[-141,12],[-105,-15],[-34,-10],[26,-20],[104,-8],[145,18],[108,51],[32,65],[-60,58],[-119,39]],'#3f3b59');kr5Poly(h,[[-141,12],[-105,-15],[-34,-10],[26,-20],[104,-8],[145,18],[42,29],[-56,25]],'#766375');
  h.fillStyle='#254d58';h.beginPath();h.ellipse(0,8,123,35,0,0,Math.PI*2);h.fill();h.fillStyle='#1c344b';h.beginPath();h.ellipse(0,3,104,24,0,0,Math.PI*2);h.fill();
  for(let j=0;j<13;j++){const x=-119+j*19,y=13+Math.sin(j/12*Math.PI)*17;kr5Poly(h,[[x-16,y-9],[x+10,y-16],[x+24,y+7],[x+2,y+17]],j%2?'#6b9f9f':'#c8ceb3');kr5Poly(h,[[x-16,y-9],[x+24,y+7],[x+2,y+17]],j%2?'#38727c':'#8aa8a1');}
  h.strokeStyle='#efd6a6';h.lineWidth=2;h.beginPath();h.ellipse(0,11,121,33,0,0,Math.PI);h.stroke();
  const f=kr5FeatherArt=document.createElement('canvas');f.width=120;f.height=280;const z=f.getContext('2d');z.scale(2,2);z.translate(30,76);z.rotate(.12);kr5Poly(z,[[0,-63],[-22,-29],[-20,11],[0,43],[22,5],[18,-35]],'#ed986e');kr5Poly(z,[[0,-63],[0,43],[22,5],[18,-35]],'#f8d177');kr5Poly(z,[[-22,-29],[-20,11],[0,43],[0,-8]],'#ba4b83');z.strokeStyle='#fff0c3';z.lineWidth=1.5;z.beginPath();z.moveTo(0,-58);z.quadraticCurveTo(-3,-2,0,52);z.stroke();

}
function kr5EggPosition(o,out){const p=out||{};p.x=o.x+20;p.y=o.y-155;p.rx=83;p.ry=112;return p;}
function kr5PhoenixPosition(o,out){const p=out||{};p.x=o.x+20;p.y=o.y-245;return p;}
function kr5TracePosition(o,index,out){const p=out||{},a=typeof ANKA!=='undefined'&&ANKA.izSag?ANKA.izSag:KR5_TRACE_FALLBACK,v=a[clamp(index|0,0,4)];p.x=o.x+20+(v.x==null?v[0]:v.x);p.y=o.y-245+(v.y==null?v[1]:v.y);return p;}
function kr5SetPhase(o,phase){const k=o.kr5;k.phase=phase;k.phaseAge=0;k.idle=0;kr5ResetInput();if(phase==='trace'&&!k.saidWing){k.saidWing=true;kr5Soz('p_v_anka_kanat');}if(phase==='awakening'&&!k.awoken){k.awoken=true;OLAY.emit('ankaUyanis',{o,phoenix:true});}}
function kr5Activate(o){
  const k=o.kr5;if(o.done||k.active||P.ucus||DURUM!=='oyun')return false;if(P.fade>0||!P.ground||P.kilit>.05||D.mode==='tasi'){o.dokundu=false;return false;}
  const e=k.entry;e.x=P.x;e.y=P.y;e.safeX=P.safeX;e.safeY=P.safeY;e.f=P.f;k.active=true;k.phase='arrive';k.phaseAge=k.age=k.idle=0;k.helpAge=0;k.helpOn=false;k.lastTapAge=-99;KR5.o=o;kr5ResetInput();P.ucus=o;P.vx=P.vy=P.buf=P.kilit=P.fade=0;
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanAnka',1.5,k.kameraFn,1,.42);
  if(!k.saidIntro){k.saidIntro=true;kr5Soz('p_v_mini');}OLAY.emit('volkanMiniBasla',{o,phoenix:true});return true;
}
function kr5Restore(o,complete){
  const k=o.kr5,e=k.entry;if(!k.active)return;if(P.ucus===o){P.ucus=null;P.x=P.rx=e.x;P.y=P.ry=e.y;P.safeX=e.safeX;P.safeY=e.safeY;P.f=e.f;P.vx=P.vy=P.buf=P.fade=P.kilit=P.air=0;P.ground=true;P.dj=true;P.bounce=false;D.x=e.x-72;D.y=e.y-95;D.vx=D.vy=D.pvx=D.pvy=0;}
  k.active=false;k.phase=complete?'done':'wait';k.phaseAge=0;k.helpOn=false;kr5ResetInput();if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanAnka',.1,k.kameraFn,1,.42);
  if(complete&&!o.done){o.done=true;if(typeof V5!=='undefined')V5.mini=true;lightTarget=Math.max(lightTarget,.55);OLAY.emit('volkanMiniTamam',{o,phoenix:true,awoken:true});kr5Soz('p_v_kristal_son');}else o.dokundu=false;
}
function kr5EggAdd(o,amount,help){const k=o.kr5;if(!k.active||k.phase!=='egg'||!Number.isFinite(amount)||amount<=0)return false;const before=k.eggWarm;k.eggWarm=clamp(before+amount,0,1);if(help)k.eggHelp+=k.eggWarm-before;else k.eggUser+=k.eggWarm-before;k.eggPulse=1;k.idle=0;k.helpOn=false;OLAY.emit('ankaYumurta',{o,progress:k.eggWarm,help:!!help});if(k.eggWarm>=1)kr5SetPhase(o,'hatch');return true;}
function kr5NextTrace(k){return k.traceN===0?-1:k.traceDir===1?k.traceN:4-k.traceN;}
function kr5TraceAdd(o,index,help){
  const k=o.kr5;if(!k.active||k.phase!=='trace'||k.traceN>=5||!Number.isInteger(index)||index<0||index>4)return false;
  if(k.traceN===0){if(index!==0&&index!==4)return false;k.traceDir=index===0?1:-1;}else if(index!==kr5NextTrace(k))return false;
  k.traceLit[index]=1;k.traceN++;if(help)k.traceHelp++;else k.traceUser++;k.tracePulse=1;k.idle=0;k.helpOn=false;OLAY.emit('ankaTuy',{o,index,progress:k.traceN/5,help:!!help});
  if(k.traceN===5)kr5SetPhase(o,'awakening');return true;
}
function kr5TraceRadius(){return Math.max(34,33*DPR/Math.max(S,.001));}
function kr5SegDist(ax,ay,bx,by,px,py){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,u=l>0?clamp(((px-ax)*dx+(py-ay)*dy)/l,0,1):0;return Math.hypot(px-ax-dx*u,py-ay-dy*u);}
function kr5TraceHit(o,p){const k=o.kr5,r=kr5TraceRadius();if(k.traceN===0){for(const i of[0,4]){const q=kr5TracePosition(o,i,k.tmp);if(Math.hypot(q.x-p.x,q.y-p.y)<=r)return i;}return-1;}const i=kr5NextTrace(k),q=kr5TracePosition(o,i,k.tmp);return Math.hypot(q.x-p.x,q.y-p.y)<=r?i:-1;}
function kr5TraceMove(o,px,py,x,y){const k=o.kr5;if(Math.hypot(x-px,y-py)<2)return;for(let guard=0;guard<5&&k.phase==='trace'&&k.traceN>0;guard++){const i=kr5NextTrace(k),q=kr5TracePosition(o,i,k.tmp);if(kr5SegDist(px,py,x,y,q.x,q.y)>kr5TraceRadius())break;kr5TraceAdd(o,i,false);}}
function kr5EggHit(o,p){const dx=(p.x-o.x-20)/94,dy=(p.y-o.y+155)/125;return dx*dx+dy*dy<=1;}
function kr5HelpStep(o,dt){
  const k=o.kr5;if(k.phase!=='egg'&&k.phase!=='trace'){k.helpOn=false;return;}if(KR5.ptr>=0)return;k.idle+=dt;
  if(!k.helpOn&&k.idle>=12){k.helpOn=true;k.helpAge=0;if(k.phase==='egg'&&!k.saidHelp){k.saidHelp=true;kr5Soz('p_v_mini_yardim');}}
  if(!k.helpOn)return;k.helpAge+=dt;
  if(k.phase==='egg'){
    const p=kr5EggPosition(o,k.tmp);k.helpX=p.x+Math.cos(k.helpAge*5)*42;k.helpY=p.y+Math.sin(k.helpAge*5)*53;
    // Pırıl visibly rubs the shell before any assisted warmth is credited.
    if(k.helpAge>=.55){const age=k.helpAge;kr5EggAdd(o,dt*.21,true);if(k.phase==='egg'){k.helpOn=true;k.helpAge=age;}}
  }else{
    const from=k.traceN===0?(k.traceDir===-1?4:0):k.traceDir===1?k.traceN-1:5-k.traceN,to=k.traceN===0?from:kr5NextTrace(k),a=kr5TracePosition(o,from,k.tmp),ax=a.x,ay=a.y,b=kr5TracePosition(o,to,k.tmp),u=smooth(clamp(k.helpAge/1.45,0,1));k.helpX=lerp(ax,b.x,u);k.helpY=lerp(ay,b.y,u);
    if(k.helpAge>=1.45){const i=to;kr5TraceAdd(o,i,true);if(k.phase==='trace'){k.idle=8;k.helpOn=false;k.helpAge=0;}}
  }
}
function kr5FlightStep(o,dt){
  const k=o.kr5;if(!(dt>0)||!Number.isFinite(dt)||DURUM!=='oyun'||!k.active||P.ucus!==o)return;k.age+=dt;k.phaseAge+=dt;P.x=k.entry.x;P.y=k.entry.y;P.vx=P.vy=P.buf=0;P.ground=true;
  if(k.phase==='arrive'&&k.phaseAge>=KR5_ARRIVE)kr5SetPhase(o,k.eggWarm<1?'egg':k.traceN<5?'trace':'awakening');
  else if(k.phase==='hatch'&&k.phaseAge>=KR5_HATCH)kr5SetPhase(o,'trace');
  else if(k.phase==='awakening'&&k.phaseAge>=KR5_AWAKEN)kr5SetPhase(o,'land');
  else if(k.phase==='land'&&k.phaseAge>=KR5_LAND){kr5Restore(o,true);return;}
  kr5HelpStep(o,dt);D.x=k.helpOn?k.helpX-40:k.entry.x-62;D.y=k.helpOn?k.helpY-12:k.entry.y-104;
}
function kr5Update(o,dt){
  if(!(dt>0)||!Number.isFinite(dt)||DURUM!=='oyun')return;const k=o.kr5;k.eggPulse=Math.max(0,k.eggPulse-dt*2);k.tracePulse=Math.max(0,k.tracePulse-dt*2.3);
  if(!k.active&&!o.done&&!P.ucus&&Math.abs(P.x-o.x)<225&&Math.abs(P.y-o.y)<150)kr5Activate(o);
  if(k.active&&typeof omDikkat==='function'&&k.kameraFn)omDikkat('volkanAnka',1.5,k.kameraFn,1,.42);
}
function kr5DrawEgg(o,tm){
  const k=o.kr5,px=o.x+20,py=o.y-155,w=k.eggWarm,hatching=k.phase==='hatch',t=hatching?k.phaseAge:0,u=hatching?smooth(clamp(t/2.1,0,1)):0;
  if(k.phase==='trace'||k.phase==='awakening'||k.phase==='land'||o.done)return;
  const breath=1+Math.sin(tm*1.9)*(.008+w*.006),rub=k.eggPulse*Math.sin(tm*23)*2;g.save();g.translate(px+rub,py);g.scale(breath,breath);g.globalAlpha=1-u;g.drawImage(kr5EggArt,-105,-140,210,270);g.restore();
  if(w>.01&&!hatching){dglow('#ffcc82',px,py+15,125,.12+w*.32);dglow('#fff5cc',px,py-18,55,w*.21);}
  // The crack grows with actual warmth, rather than an unrelated progress bar.
  if(w>.15){g.save();g.translate(px,py);g.globalAlpha=(1-u)*clamp((w-.15)/.15,0,1);g.lineJoin='round';g.lineCap='round';g.strokeStyle='#674451';g.lineWidth=3.5;g.beginPath();g.moveTo(-8,-81);const crack=[[-1,-61],[-13,-40],[6,-23],[-3,-2],[13,19],[2,43],[17,66],[6,91]],n=Math.max(1,Math.ceil(w*crack.length));for(let i=0;i<n;i++)g.lineTo(crack[i][0],crack[i][1]);g.stroke();g.strokeStyle='#fff1ab';g.lineWidth=1.6;g.stroke();g.restore();}
  if(hatching){for(let i=0;i<7;i++){const a=-Math.PI+i*Math.PI/3.5,x=px+Math.cos(a)*(22+u*92),y=py+85+Math.sin(a)*u*35+u*22;g.save();g.translate(x,y);g.rotate((i-3)*u*.35);g.globalAlpha=1-smooth(clamp((t-1.6)/1.2,0,1));kr5Poly(g,[[-17,-12],[8,-17],[20,4],[-4,17]],i%2?'#ecd5a3':'#faf0cf');g.restore();}}
}
function kr5DrawPhoenix(o,tm){
  const k=o.kr5;if(typeof ANKA==='undefined'||!ANKA.ciz)return;if(k.phase!=='hatch'&&k.phase!=='trace'&&k.phase!=='awakening'&&k.phase!=='land'&&!o.done)return;
  const p=kr5PhoenixPosition(o,k.tmp),h=k.phase==='hatch'?smooth(clamp((k.phaseAge-.35)/2.1,0,1)):1,aw=k.phase==='awakening'?k.phaseAge:0,leaving=o.done,alpha=leaving?Math.max(0,1-k.depart/3):1;
  const pose=k.phase==='trace'?'trace':leaving?'glide':aw>2.7?'perch':k.phase==='hatch'?'sleep':'lift',lift=aw>0?Math.sin(clamp(aw/KR5_AWAKEN,0,1)*Math.PI)*18:0;
  ANKA.ciz(g,p.x+(leaving?smooth(clamp(k.depart/3,0,1))*420:0),p.y+95*(1-h)-lift-(leaving?smooth(clamp(k.depart/3,0,1))*135:0),1,tm,{pose,kanatAc:k.phase==='trace'?1:k.phase==='hatch'?smooth(clamp((k.phaseAge-.9)/1.85,0,1)):k.phase==='awakening'?1-.55*smooth(clamp((aw-2.7)/2.6,0,1)):leaving?lerp(.45,.9,smooth(clamp(k.depart/1.2,0,1))):.45,sabit:k.phase==='trace'||k.phase==='hatch',kanatSag:k.traceN/5,uyku:1-h,joy:k.awoken?1:.2,alpha:h*alpha,face:1});
}
function kr5DrawTrace(o,tm){
  const k=o.kr5;if(k.phase!=='trace')return;g.save();g.lineCap='round';g.lineJoin='round';
  // A luminous physical vein lies exactly on Anka's dull wing.
  g.strokeStyle='rgba(77,58,76,.72)';g.lineWidth=8;g.beginPath();for(let i=0;i<5;i++){const p=kr5TracePosition(o,i,k.tmp);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);}g.stroke();g.strokeStyle='#efe5c7';g.lineWidth=3;g.stroke();
  if(k.traceN>1){g.strokeStyle='#fff1ac';g.lineWidth=6;g.beginPath();for(let j=0;j<k.traceN;j++){const i=k.traceDir===1?j:4-j,p=kr5TracePosition(o,i,k.tmp);j?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);}g.stroke();}
  const next=kr5NextTrace(k);for(let i=0;i<5;i++){const p=kr5TracePosition(o,i,k.tmp),lit=k.traceLit[i],invite=k.traceN===0?(i===0||i===4):i===next,r=lit?9:invite?14+Math.sin(tm*2.8)*1.5:10;
    if(invite)dglow('#fff0b8',p.x,p.y,39,.37+Math.sin(tm*2.8)*.08);g.globalAlpha=1;g.fillStyle=lit?'#ffd382':invite?'#fff5d6':'#b8a8a8';g.strokeStyle=lit?'#fff4c4':'#57445c';g.lineWidth=2.2;g.beginPath();g.arc(p.x,p.y,r,0,Math.PI*2);g.fill();g.stroke();g.fillStyle='#fffdf0';g.beginPath();g.arc(p.x-3,p.y-4,r*.28,0,Math.PI*2);g.fill();}
  g.restore();
}
function kr5DrawGift(o,tm){const k=o.kr5;if(k.phase!=='awakening'&&k.phase!=='land')return;const t=k.phase==='land'?KR5_AWAKEN:k.phaseAge;if(t<2.4)return;const u=smooth(clamp((t-2.4)/2.3,0,1)),x=lerp(o.x+67,k.entry.x+20,u),y=lerp(o.y-251,k.entry.y-52,u)-Math.sin(u*Math.PI)*45;g.save();g.translate(x,y);g.rotate(lerp(-.4,.3,u)+Math.sin(tm*2)*.04);g.scale(.55,.55);g.drawImage(kr5FeatherArt,-30,-76,60,140);g.restore();if(u>.9)dglow('#fff1b7',x,y,30,.25);}
function kr5Draw(o,tm){
  const k=o.kr5;if(o.x<cam.x-480||o.x>cam.x+VW+480)return;kr5MakeArt();
  g.drawImage(kr5NestArt,o.x-140,o.y-80,320,130);kr5DrawEgg(o,tm);kr5DrawPhoenix(o,tm);
}
function kr5DrawFront(o,tm){const k=o.kr5;if(k.active&&P.ucus===o){
  if(typeof fezaCizPoz==='function')fezaCizPoz(g,P.x,P.y,1.08,k.awoken?'sevinc':'ayakta_yan',tm,null,k.poseOpt);
  if(typeof pirilCizPoz==='function')pirilCizPoz(g,D.x,D.y,1.05,k.awoken?'goz_kirp':'ucus',tm);
  if(k.helpOn){const x=k.helpX,y=k.helpY;for(let i=0;i<4;i++){const a=k.helpAge*6+i*1.7;g.fillStyle=i%2?'#ffdfa1':'#c7fff0';g.globalAlpha=.5;g.beginPath();g.arc(x+Math.cos(a)*8,y+Math.sin(a)*8,2,0,Math.PI*2);g.fill();}g.globalAlpha=1;}
  }kr5DrawTrace(o,tm);kr5DrawGift(o,tm);
}
function kr5World(e){const r=cv.getBoundingClientRect();return{x:cam.x+(e.clientX-r.left)*DPR/S,y:cam.y+(e.clientY-r.top)*DPR/S};}
function kr5Claim(e){if(e.preventDefault)e.preventDefault();if(e.stopPropagation)e.stopPropagation();}
function kr5OwnSurface(e){return !e.target||e.target===cv||e.pointerId===KR5.ptr;}
addEventListener('pointerdown',e=>{
  const o=KR5.aktif;if(!o||!kr5OwnSurface(e)||DURUM!=='oyun'||e.pointerType==='mouse'&&e.button!==0)return;kr5Claim(e);const k=o.kr5,p=kr5World(e);if(k.phase!=='egg'&&k.phase!=='trace'||KR5.ptr>=0)return;
  if(k.phase==='egg'&&kr5EggHit(o,p)){KR5.ptr=e.pointerId;KR5.px=p.x;KR5.py=p.y;k.idle=0;k.helpOn=false;if(k.age-k.lastTapAge>.13){k.lastTapAge=k.age;kr5EggAdd(o,.085,false);}if(KR5.ptr===e.pointerId)try{cv.setPointerCapture(e.pointerId);}catch(_){}return;}
  if(k.phase==='trace'){const i=kr5TraceHit(o,p);if(i<0)return;KR5.ptr=e.pointerId;KR5.px=p.x;KR5.py=p.y;k.idle=0;k.helpOn=false;kr5TraceAdd(o,i,false);if(KR5.ptr===e.pointerId)try{cv.setPointerCapture(e.pointerId);}catch(_){}}
},true);
addEventListener('pointermove',e=>{
  const o=KR5.aktif;if(!o||!kr5OwnSurface(e)||DURUM!=='oyun')return;kr5Claim(e);if(e.pointerId!==KR5.ptr)return;const k=o.kr5,p=kr5World(e),px=KR5.px,py=KR5.py;KR5.px=p.x;KR5.py=p.y;k.idle=0;k.helpOn=false;
  if(k.phase==='egg'&&kr5EggHit(o,p)&&kr5EggHit(o,{x:px,y:py}))kr5EggAdd(o,Math.min(80,Math.hypot(p.x-px,p.y-py))/1050,false);
  else if(k.phase==='trace')kr5TraceMove(o,px,py,p.x,p.y);
},true);
function kr5Release(e){const o=KR5.aktif;if(!o||!kr5OwnSurface(e))return;kr5Claim(e);if(e.pointerId===KR5.ptr)kr5ResetInput();}
addEventListener('pointerup',kr5Release,true);addEventListener('pointercancel',kr5Release,true);
function kr5CancelInput(){kr5ResetInput();}
addEventListener('blur',kr5CancelInput);addEventListener('pagehide',kr5CancelInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)kr5CancelInput();});cv.addEventListener('lostpointercapture',e=>{if(e.pointerId===KR5.ptr)kr5CancelInput();});
addEventListener('keydown',e=>{
  const o=KR5.aktif;if(!o||DURUM!=='oyun'||e.target&&/^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(e.target.tagName)||! /^(Space|KeyE|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|KeyW|KeyA|KeyS|KeyD)$/.test(e.code))return;kr5Claim(e);if(e.repeat)return;const k=o.kr5;
  if(e.code==='Space'||e.code==='KeyE'){if(k.phase==='egg')kr5EggAdd(o,.085,false);else if(k.phase==='trace')kr5TraceAdd(o,k.traceN===0?0:kr5NextTrace(k),false);}
},true);
OLAY.on('durum',d=>{if(d==='oyun')return;if(KR5.aktif&&d!=='mola'&&d!=='duraklat')kr5Restore(KR5.o,false);kr5ResetInput();});
TUR.kaydet('volkanMini',{
  kur(o){o.r=145;o.ry=95;o.done=false;const k=o.kr5={active:false,phase:'wait',phaseAge:0,age:0,eggWarm:0,eggUser:0,eggHelp:0,eggPulse:0,traceN:0,traceDir:1,traceLit:new Uint8Array(5),traceUser:0,traceHelp:0,tracePulse:0,awoken:false,idle:0,helpOn:false,helpAge:0,helpX:0,helpY:0,lastTapAge:-99,saidIntro:false,saidWing:false,saidHelp:false,depart:0,entry:{x:0,y:0,safeX:0,safeY:0,f:1},poseOpt:{isik:0,ruzgar:.12},tmp:{x:0,y:0},kameraFn:null};
    k.kameraFn=typeof omDkEkle==='function'?()=>omDkEkle(o.x-330,o.y-455,o.x+350,o.y+65):null;kr5MakeArt();o.adim=dt=>kr5FlightStep(o,dt);KR5.o=o;
  },dokun:kr5Activate,guncelle(o,dt){kr5Update(o,dt);if(o.done&&dt>0&&Number.isFinite(dt))o.kr5.depart+=dt;},ciz:kr5Draw,cizOn:kr5DrawFront
});

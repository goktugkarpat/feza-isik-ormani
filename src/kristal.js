/* Kristal korosu: uyandır, ışık ezgisini çiz, kâğıt kuşları uçur.
   Doğru sıra, metin, zaman baskısı veya kaybetme yok. Her dokunuş müziğe katılır.
   Üç hareket farklı bir bahçe kurar; Pırıl uzun sessizlikte nazikçe eşlik eder. */
'use strict';
const KR5 = { o: null, ptr: -1, note: -1, px: 0, py: 0, hold: 0, get aktif() { return this.o && this.o.kr5 && this.o.kr5.active && !this.o.done && Math.abs(P.x-this.o.x)<540 && Math.abs(P.y-this.o.y)<320 ? this.o : null; } };
const KR5_COLORS = ['#ffc065','#f56d98','#b67be3','#58d2c6','#ffdc79'];
const KR5_FLOWERS = ['#df386d','#b6389e','#8745bf','#ed586c','#ba52c5'];
const KR5_GOALS = [12,15,18], KR5_TIMES = [15,18,18];
let kr5StoneArt = null;
const kr5GemArts=[];
function kr5Poly(q,p,color){q.fillStyle=color;q.beginPath();for(let i=0;i<p.length;i++){if(i)q.lineTo(p[i][0],p[i][1]);else q.moveTo(p[i][0],p[i][1]);}q.closePath();q.fill();}
function kr5Soz(key){if(typeof SES!=='undefined'&&SES.soyle)SES.soyle(key);}
function kr5GemArt(i){
  if(typeof ls5GemArt==='function')return ls5GemArt(i);
  if(kr5GemArts[i])return kr5GemArts[i];
  const c=document.createElement('canvas');c.width=100;c.height=220;const q=c.getContext('2d');q.translate(50,200);
  kr5Poly(q,[[-27,-15],[-25,-128],[0,-185],[28,-125],[25,-10],[0,0]],KR5_COLORS[i]);
  kr5Poly(q,[[0,-185],[28,-125],[25,-10],[0,0]],'#6d7894');
  q.strokeStyle='#fff7dd';q.lineWidth=1.5;q.beginPath();q.moveTo(-24,-128);q.lineTo(0,-182);q.lineTo(0,-20);q.stroke();return kr5GemArts[i]=c;
}
function kr5GardenArt(){
  if(kr5StoneArt)return kr5StoneArt;
  const c=document.createElement('canvas');c.width=1240;c.height=360;const q=c.getContext('2d');q.scale(2,2);q.translate(310,72);
  const r=rng(51039);
  kr5Poly(q,[[-289,2],[-255,-17],[-174,-22],[-86,-15],[0,-26],[100,-16],[194,-22],[267,-13],[292,5],[260,29],[181,37],[77,33],[-13,42],[-121,32],[-222,35],[-275,21]],'#4e3c65');
  kr5Poly(q,[[-289,2],[-255,-17],[-174,-22],[-86,-15],[0,-26],[100,-16],[194,-22],[267,-13],[292,5],[137,13],[-22,8],[-161,15]],'#92718c');
  kr5Poly(q,[[-289,2],[-161,15],[-121,32],[-222,35],[-275,21]],'#72647e');
  kr5Poly(q,[[-161,15],[-22,8],[-13,42],[-121,32]],'#5e536f');
  kr5Poly(q,[[-22,8],[137,13],[77,33],[-13,42]],'#77617a');
  kr5Poly(q,[[137,13],[292,5],[260,29],[181,37],[77,33]],'#625671');
  q.strokeStyle='rgba(250,208,165,.7)';q.lineWidth=1.1;
  q.beginPath();q.moveTo(-277,0);q.bezierCurveTo(-122,-16,114,-15,277,1);q.moveTo(-161,15);q.lineTo(-121,32);q.moveTo(-22,8);q.lineTo(-13,40);q.moveTo(137,13);q.lineTo(181,35);q.stroke();
  q.strokeStyle='rgba(242,199,157,.45)';q.lineWidth=1.1;
  for(let i=0;i<2;i++){q.beginPath();q.ellipse(0,0,260-i*15,18-i*3,0,Math.PI,Math.PI*2);q.stroke();}
  for(let i=0;i<50;i++){const xx=(r()-.5)*570,yy=30+r()*33;q.fillStyle=i%3?'#9d8a8f':'#dbc2a8';q.beginPath();q.ellipse(xx,yy,r()*2+.4,r()+.4,0,0,Math.PI*2);q.fill();}
  // Frozen crystal flower roots. Living stems are layered over these as the child plays.
  for(let side=-1;side<=1;side+=2){q.strokeStyle='#827c97';q.lineWidth=2;q.beginPath();q.moveTo(side*5,0);q.bezierCurveTo(side*44,-52,side*106,-8,side*154,-60);q.stroke();}
  return kr5StoneArt=c;
}
function kr5Star(x,y,r,tm,color,a){if(typeof ls5Star==='function'){ls5Star(x,y,r,tm,color,a);return;}g.save();g.translate(x,y);g.rotate(tm);g.globalAlpha=a;g.fillStyle=color;g.beginPath();g.moveTo(0,-r);g.lineTo(r*.25,-r*.25);g.lineTo(r,0);g.lineTo(r*.25,r*.25);g.lineTo(0,r);g.lineTo(-r*.25,r*.25);g.lineTo(-r,0);g.lineTo(-r*.25,-r*.25);g.fill();g.restore();}
function kr5NotePosition(o,i){const k=o.kr5;return {x:o.x+k.gems[i].x,y:o.y+k.gems[i].y};}
function kr5Activate(o){
  const k=o.kr5;if(o.done||k.active)return;k.active=true;k.age=0;k.stageAge=0;k.idle=0;KR5.o=o;
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('kristalKoro',1.5,k.kameraFn,1,.48);
  OLAY.emit('volkanMiniBasla',{o});OLAY.emit('volkanMiniAsama',{o,stage:1});
}
function kr5AddWave(o,index,help,strength){
  const k=o.kr5;if(!k.active||o.done||k.finish>0||DURUM!=='oyun')return;
  const gem=k.gems[index];if(!gem||gem.cool>.02)return;
  gem.cool=.16;gem.pulse=1;gem.charge=Math.min(1,gem.charge+.22);gem.hit++;
  k.notes+=strength;k.allNotes++;k.pulse=1;k.last=index;
  if(!help){k.idle=0;k.userHits++;}else k.helpHits++;
  const slot=k.waves[k.waveI++%k.waves.length];slot.on=true;slot.t=0;slot.i=index;slot.stage=k.stage;slot.r=0;slot.help=help;
  if(k.stage===2){const bird=k.birds[index];bird.fly=1;bird.flash=1;}
  OLAY.emit('volkanKristal',{o,index,stage:k.stage,help:!!help,strength:clamp(strength,0,1)});
}
function kr5NextStage(o){
  const k=o.kr5;k.stage++;k.stageAge=0;k.notes=0;k.pulse=1;k.transition=1;
  if(k.stage>=3){k.finish=.001;KR5.ptr=-1;KR5.note=-1;return;}
  OLAY.emit('volkanMiniAsama',{o,stage:k.stage+1});
  if(typeof dragonHappy==='function')dragonHappy(o);
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('kristalKoro',1.5,k.kameraFn,1,.48);
}
function kr5Complete(o){
  const k=o.kr5;if(o.done)return;o.done=true;k.active=false;k.finish=5;KR5.ptr=-1;KR5.note=-1;
  if(typeof V5!=='undefined')V5.mini=true;
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('kristalKoro',.1,k.kameraFn,1,.48);
  lightTarget=Math.max(lightTarget,.55);
  OLAY.emit('volkanMiniTamam',{o});kr5Soz('p_v_kristal_son');
}
function kr5Update(o,dt){
  if(!(dt>0)||!Number.isFinite(dt))return;const k=o.kr5;
  for(const gem of k.gems){gem.cool=Math.max(0,gem.cool-dt);gem.pulse=Math.max(0,gem.pulse-dt*1.55);}
  for(const w of k.waves){if(!w.on)continue;w.t+=dt;if(w.t>1.65)w.on=false;}
  for(const b of k.birds){b.fly=Math.max(0,b.fly-dt*.16);b.flash=Math.max(0,b.flash-dt);}
  k.pulse=Math.max(0,k.pulse-dt);k.transition=Math.max(0,k.transition-dt*.45);
  if(DURUM!=='oyun'||P.ucus)return;
  const dist=Math.abs(P.x-o.x),near=dist<540&&Math.abs(P.y-o.y)<320;
  if(!k.active&&!o.done&&dist<250&&Math.abs(P.y-o.y)<180)kr5Activate(o);
  if(!k.active||!near||o.done)return;
  if(typeof omDikkat==='function'&&k.kameraFn)omDikkat('kristalKoro',1.5,k.kameraFn,1,.48);
  k.age+=dt;k.stageAge+=dt;k.idle+=dt;k.helpClock+=dt;
  if(k.finish>0){k.finish+=dt;if(k.finish>=4.2)kr5Complete(o);return;}
  // Touch-and-hold also plays: small fingers need not repeatedly lift at exactly the right moment.
  if(KR5.ptr>=0&&KR5.o===o){KR5.hold+=dt;if(KR5.hold>.42){KR5.hold=0;const i=KR5.note>=0?KR5.note:k.last;kr5AddWave(o,i,false,.72);}}
  const needed=KR5_GOALS[k.stage],minTime=KR5_TIMES[k.stage];
  if(k.stageAge>=minTime&&k.notes>=needed){kr5NextStage(o);return;}
  // First Pırıl demonstrates one soft note, then accompanies. A silent child can always continue.
  if(k.idle>8&&k.helpClock>1.15){
    k.helpClock=0;
    let i=(k.last+1)%5;if(k.stage===0){let low=1e9;for(let j=0;j<5;j++)if(k.gems[j].hit<low){low=k.gems[j].hit;i=j;}}
    kr5AddWave(o,i,true,1);
    if(!k.helpSaid&&k.age>12){k.helpSaid=true;kr5Soz('p_v_mini_yardim');}
  }
  if(k.stageAge>minTime+26&&k.idle>4&&k.notes<needed)k.notes=Math.min(needed,k.notes+dt*.65);
}
function kr5Flower(o,tm){
  const k=o.kr5,full=o.done?1:k.finish>0?smooth(clamp(k.finish/3.1,0,1)):clamp((Math.min(k.stage,2)+Math.min(1,k.notes/(KR5_GOALS[k.stage]||18)))/3,0,1);
  const cx=o.x,cy=o.y-255,open=.18+full*.82,glowA=.15+full*.17+k.pulse*.08;
  // Basalt gövde ve bakır dallar çiçeği yere bağlar; bir menü simgesi gibi havada asılı kalmaz.
  const stemTop=cy+14;
  kr5Poly(g,[[cx-30,o.y-7],[cx-14,o.y-84],[cx-22,o.y-150],[cx-7,stemTop],[cx+7,stemTop],[cx+13,o.y-146],[cx+7,o.y-88],[cx+30,o.y-7]],'#68476f');
  kr5Poly(g,[[cx-7,stemTop],[cx+7,stemTop],[cx+13,o.y-146],[cx+7,o.y-88],[cx+30,o.y-7],[cx+4,o.y-21]],'#b86e91');
  g.strokeStyle=mixc('#aa8ca4','#ffdfa9',full,.68);g.lineWidth=1.6;g.beginPath();g.moveTo(cx,o.y-11);g.bezierCurveTo(cx+15,o.y-99,cx-17,o.y-177,cx,stemTop);g.stroke();
  for(let side=-1;side<=1;side+=2)for(let j=0;j<3;j++){
    const sy=o.y-64-j*53,sz=17+full*9,tx=cx+side*(29+j%2*8),ty=sy-18;
    kr5Poly(g,[[cx,sy],[tx,ty-sz*.35],[tx+side*sz,ty],[tx,ty+sz*.7]],j%2?'#c15c9b':'#9562b3');
    g.strokeStyle='rgba(255,222,180,.5)';g.lineWidth=.8;g.beginPath();g.moveTo(cx,sy);g.lineTo(tx+side*sz*.9,ty);g.stroke();
  }
  dglow('#ffd8a8',cx,cy,120+full*40,glowA);
  g.save();g.translate(cx,cy);
  // The flower is faceted, but the motion is soft: glass petals unfold like folded paper.
  for(let layer=0;layer<2;layer++)for(let i=0;i<5;i++){
    const a=-Math.PI/2+i*Math.PI*2/5+layer*Math.PI/5+Math.sin(tm*.55)*.025;
    g.save();g.rotate(a);g.scale(open*(layer?.72:1),open*(layer?.72:1));
    kr5Poly(g,[[0,7],[-29,-36],[-8,-96],[12,-112],[32,-48],[17,-7]],KR5_FLOWERS[(i+layer)%5]);
    kr5Poly(g,[[0,7],[-8,-96],[12,-112],[8,-32]],layer?'#ffb181':'#e990c6');
    g.strokeStyle='rgba(255,248,217,.64)';g.lineWidth=1;g.beginPath();g.moveTo(0,6);g.lineTo(10,-106);g.stroke();g.restore();
  }
  g.fillStyle='#f9dfaa';g.beginPath();g.arc(0,0,12+full*5,0,Math.PI*2);g.fill();
  g.fillStyle='#fff5d7';g.beginPath();g.ellipse(-3,-4,6,4,-.5,0,Math.PI*2);g.fill();
  g.restore();
  // Root paths illuminate one by one; the child's music changes the whole garden.
  for(let i=0;i<5;i++){
    const gem=k.gems[i],p=kr5NotePosition(o,i),lit=o.done?1:clamp(gem.charge*.55+full*.45,0,1);
    g.strokeStyle=mixc('#6c6683',KR5_COLORS[i],lit,.38+lit*.36);g.lineWidth=1.2+lit*.5;g.beginPath();g.moveTo(p.x,p.y+6);g.bezierCurveTo(p.x,p.y-52,cx+(p.x-cx)*.4,cy+88,cx,cy+10);g.stroke();
  }
  // Not a progress bar: three small mineral buds become three living blossoms.
  for(let i=0;i<3;i++){
    const on=o.done||k.stage>i||k.stage===i&&k.notes>KR5_GOALS[i]*.78;
    const x=o.x+(i-1)*43,y=o.y-5;
    for(let j=0;j<5;j++){const a=j*Math.PI*2/5;g.fillStyle=on?KR5_FLOWERS[(j+i)%5]:'#77618a';g.beginPath();g.ellipse(x+Math.cos(a)*8,y+Math.sin(a)*4,7,3.5,a*.5,0,Math.PI*2);g.fill();}
    g.fillStyle=on?'#ffefbd':'#a79aa3';g.beginPath();g.arc(x,y,3,0,Math.PI*2);g.fill();
  }
}
function kr5EdgeFlowers(o,tm){
  if(typeof ls5BloomArt!=='function')return;
  const k=o.kr5,grow=o.done?1:clamp((Math.min(k.stage,2)+k.notes/(KR5_GOALS[k.stage]||18))/3,0,1);
  for(let side=-1;side<=1;side+=2)for(let i=0;i<4;i++){
    const x=o.x+side*(224+i*19),sc=(.58+i%2*.14)*(.78+grow*.22);
    g.save();g.translate(x,o.y+7+(i%2)*4);g.rotate(Math.sin(tm*.85+i+side)*.045);g.drawImage(ls5BloomArt((i+(side>0?1:0))%3),-24*sc,-58*sc,48*sc,66*sc);g.restore();
  }
}
function kr5DrawGem(o,i,tm){
  const k=o.kr5,p=kr5NotePosition(o,i),a=k.gems[i],scale=(.96+a.pulse*.055)*a.s,center=p.y-63*a.s;
  dglow(KR5_COLORS[i],p.x,center,73,.1+a.charge*.13+a.pulse*.16);
  kr5Poly(g,[[p.x-29,p.y+4],[p.x-20,p.y-10],[p.x+17,p.y-12],[p.x+29,p.y+3],[p.x+18,p.y+14],[p.x-19,p.y+14]],'#81778c');
  kr5Poly(g,[[p.x-29,p.y+4],[p.x-20,p.y-10],[p.x+17,p.y-12],[p.x+9,p.y+4]],'#b29aa3');
  g.save();g.translate(p.x,p.y);g.rotate(Math.sin(tm*.85+i)*.018*(1+a.pulse));
  g.globalAlpha=.98;g.drawImage(kr5GemArt(i),-36*scale,-150*scale,72*scale,156*scale);g.globalAlpha=1;
  // Thin suspended copper ring catches the gesture and makes the touch area visible.
  const ring=33+a.pulse*14;
  g.strokeStyle=mixc('#a7b7c7',KR5_COLORS[i],.55,.3+a.pulse*.5);g.lineWidth=1.2;g.beginPath();g.ellipse(0,-63*a.s,ring,ring*1.27,0,0,Math.PI*2);g.stroke();
  g.restore();
  for(let j=0;j<3;j++){const t=(tm*.18+i*.17+j/3)%1;kr5Star(p.x+Math.sin(j*2.4+i)*29,p.y-24-t*132*a.s,3.8,tm*.3+i,KR5_COLORS[i],Math.sin(t*Math.PI)*(.2+a.charge*.5));}
}
function kr5DrawWave(o,w,tm){
  const k=o.kr5,p=kr5NotePosition(o,w.i),center=p.y-63*k.gems[w.i].s,u=clamp(w.t/1.3,0,1),e=smooth(u),xx=lerp(p.x,o.x,e),yy=lerp(center,o.y-255,e)-Math.sin(u*Math.PI)*90;
  if(w.t<.65){g.save();g.globalAlpha=(1-w.t/.65)*.58;g.strokeStyle=KR5_COLORS[w.i];g.lineWidth=2;g.beginPath();g.ellipse(p.x,center,25+w.t*82,30+w.t*85,0,0,Math.PI*2);g.stroke();g.restore();}
  if(u<1){dglow(KR5_COLORS[w.i],xx,yy,19,.34);kr5Star(xx,yy,6.5,tm*1.4,KR5_COLORS[w.i],1-u*.35);}
}
function kr5DrawMelody(o,tm){
  const k=o.kr5;if(k.stage<1&&!o.done)return;
  const a=o.done?1:Math.min(1,k.stageAge/2+.12),cx=o.x,cy=o.y-185;
  g.save();g.globalAlpha=a*.55;
  for(let j=0;j<3;j++){
    g.strokeStyle=KR5_COLORS[(j+2)%5];g.lineWidth=1.4;g.beginPath();
    for(let i=0;i<=50;i++){const u=i/50,x=cx-240+u*480,y=cy-Math.sin(u*Math.PI*2+tm*.75+j*.24)*23-j*10;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  }
  g.restore();
  for(let i=0;i<8;i++){const u=(tm*.045+i/8)%1,x=cx-240+u*480,y=cy-Math.sin(u*Math.PI*2+tm*.75)*23;kr5Star(x,y,4.5,tm*.35+i,KR5_COLORS[i%5],a*.8);}
}
function kr5BirdPosition(o,i,tm){
  const k=o.kr5,b=k.birds[i],fly=smooth(clamp(b.fly,0,1));
  return {x:o.x+(i-2)*88+Math.sin(tm*.7+i)*16+Math.sin(fly*Math.PI)*45,y:o.y-340+Math.sin(tm*.9+i*1.4)*24-Math.sin(fly*Math.PI)*85};
}
function kr5DrawBirds(o,tm){
  const k=o.kr5;if(k.stage<2&&!o.done)return;
  const appear=o.done?1:smooth(clamp(k.stageAge/2,0,1));
  for(let i=0;i<5;i++){
    const p=kr5BirdPosition(o,i,tm),b=k.birds[i];
    if(typeof ls5Bird==='function')ls5Bird(p.x,p.y,.95+b.flash*.15,tm+i,KR5_COLORS[i],appear*.98);
    else kr5Star(p.x,p.y,13,tm*.4+i,KR5_COLORS[i],appear);
    if(b.flash>0)dglow(KR5_COLORS[i],p.x,p.y,45,b.flash*.34);
    if(!o.done){g.save();g.globalAlpha=.16+Math.sin(tm*2+i)*.05;g.strokeStyle=KR5_COLORS[i];g.lineWidth=1;g.beginPath();g.arc(p.x,p.y,28,0,Math.PI*2);g.stroke();g.restore();}
  }
}
function kr5Hint(o,tm){
  const k=o.kr5;if(!k.active||o.done||k.idle<3.6||KR5.ptr>=0||k.finish>0)return;
  const i=Math.floor(tm/3.5)%5,p=k.stage===2?kr5BirdPosition(o,i,tm):kr5NotePosition(o,i),y=k.stage===2?p.y:p.y-63*k.gems[i].s,u=(tm%1.7)/1.7;
  g.save();g.globalAlpha=.55*(1-u);g.strokeStyle='#fff1c8';g.lineWidth=2.3;g.beginPath();g.arc(p.x,y,25+u*21,0,Math.PI*2);g.stroke();g.restore();
  // A small illustrated hand, rather than instructions a five-year-old cannot read.
  if(k.idle>5){g.save();g.translate(p.x+15,y+29+Math.sin(tm*3)*4);g.rotate(-.22);g.fillStyle='#fff0dc';g.strokeStyle='#9b8aa6';g.lineWidth=1.4;g.beginPath();g.moveTo(-7,17);g.lineTo(-7,-12);g.quadraticCurveTo(-7,-18,-2,-17);g.quadraticCurveTo(2,-17,2,-11);g.lineTo(2,1);g.quadraticCurveTo(17,-4,18,7);g.lineTo(15,24);g.quadraticCurveTo(4,31,-7,17);g.fill();g.stroke();g.restore();}
}
function kr5World(e){const r=cv.getBoundingClientRect();return{x:cam.x+(e.clientX-r.left)*DPR/S,y:cam.y+(e.clientY-r.top)*DPR/S};}
function kr5Hit(o,p){
  const k=o.kr5;let best=-1,dist=1e9;
  if(k.stage===2)for(let i=0;i<5;i++){const b=kr5BirdPosition(o,i,now),d=Math.hypot(p.x-b.x,p.y-b.y);if(d<54&&d<dist){dist=d;best=i;}}
  for(let i=0;i<5;i++){const a=kr5NotePosition(o,i),d=Math.hypot((p.x-a.x)*.92,(p.y-a.y+63*k.gems[i].s)*.6);if(d<57&&d<dist){dist=d;best=i;}}
  if(best<0&&k.stage===1&&Math.abs(p.x-o.x)<250&&p.y<o.y-110&&p.y>o.y-250)best=clamp(Math.floor((p.x-o.x+250)/100),0,4);
  return best;
}
function kr5Claim(e){e.preventDefault();e.stopPropagation();}
addEventListener('pointerdown',e=>{
  const o=KR5.aktif;if(!o||DURUM!=='oyun'||e.pointerType==='mouse'&&e.button!==0||KR5.ptr>=0)return;
  if(typeof dugmede==='function'&&dugmede(e.clientX,e.clientY))return;
  const p=kr5World(e);let i=kr5Hit(o,p);
  // Kristaller arasındaki boşluğa dokunmak yürüme başlatmaz; bahçenin tamamı bir enstrümandır.
  if(i<0&&Math.abs(p.x-o.x)<310&&p.y>o.y-410&&p.y<o.y+55)i=clamp(Math.round((p.x-o.x)/95)+2,0,4);
  if(i<0)return;
  kr5Claim(e);KR5.ptr=e.pointerId;KR5.note=i;KR5.px=p.x;KR5.py=p.y;KR5.hold=0;
  kr5AddWave(o,i,false,1);try{cv.setPointerCapture(e.pointerId);}catch(_){}
},true);
addEventListener('pointermove',e=>{
  if(e.pointerId!==KR5.ptr||!KR5.aktif)return;kr5Claim(e);const o=KR5.o,p=kr5World(e),i=kr5Hit(o,p);
  if(i>=0&&(i!==KR5.note||Math.hypot(p.x-KR5.px,p.y-KR5.py)>34)){KR5.note=i;KR5.px=p.x;KR5.py=p.y;KR5.hold=0;kr5AddWave(o,i,false,.9);}
},true);
function kr5Release(e){if(e.pointerId!==KR5.ptr)return;KR5.ptr=-1;KR5.note=-1;KR5.hold=0;kr5Claim(e);}
addEventListener('pointerup',kr5Release,true);addEventListener('pointercancel',kr5Release,true);
addEventListener('blur',()=>{KR5.ptr=-1;KR5.note=-1;KR5.hold=0;});
addEventListener('keydown',e=>{
  const o=KR5.aktif;if(!o||DURUM!=='oyun'||!(e.code==='Space'||e.code==='KeyE'))return;
  const k=o.kr5;if(k.finish>0)return;e.preventDefault();e.stopPropagation();if(e.repeat)return;kr5AddWave(o,(k.last+1)%5,false,1);
},true);
OLAY.on('durum',d=>{if(d!=='oyun'){KR5.ptr=-1;KR5.note=-1;KR5.hold=0;}});
TUR.kaydet('volkanMini',{
  kur(o){o.r=145;o.ry=95;o.done=false;o.kr5={active:false,age:0,stage:0,stageAge:0,notes:0,allNotes:0,userHits:0,helpHits:0,finish:0,idle:0,helpClock:0,helpSaid:false,pulse:0,transition:0,last:4,waveI:0,waves:[],gems:[],birds:[]};
    o.kr5.kameraFn=typeof omDkEkle==='function'?()=>omDkEkle(o.x-310,o.y-420,o.x+310,o.y+45):null;
    for(let i=0;i<18;i++)o.kr5.waves.push({on:false,t:0,i:0,stage:0,r:0,help:false});
    for(let i=0;i<5;i++){o.kr5.gems.push({x:(i-2)*95,y:-12,s:.82+Math.sin(i/4*Math.PI)*.3,pulse:0,charge:0,hit:0,cool:0});o.kr5.birds.push({fly:0,flash:0});kr5GemArt(i);}
    kr5GardenArt();KR5.o=o;},
  dokun(o){kr5Activate(o);},guncelle:kr5Update,
  ciz(o,tm){const k=o.kr5;g.drawImage(kr5GardenArt(),o.x-310,o.y-72,620,180);kr5EdgeFlowers(o,tm);kr5Flower(o,tm);kr5DrawMelody(o,tm);
    for(let i=0;i<5;i++)kr5DrawGem(o,i,tm);kr5DrawBirds(o,tm);
    if(o.done)for(let i=0;i<7;i++){const u=(tm*.12+i/7)%1;kr5Star(o.x-235+i*76+Math.sin(tm*.8+i)*12,o.y-50-u*230,4,tm*.3+i,KR5_COLORS[i%5],Math.sin(u*Math.PI)*.6);}},
  cizOn(o,tm){for(const w of o.kr5.waves)if(w.on)kr5DrawWave(o,w,tm);kr5Hint(o,tm);}
});

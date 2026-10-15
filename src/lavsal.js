/* Uyuyan Yanardağ: katlanan bazalt nilüferle sıcak ışık ırmağı.
   Gerçek uçuş kancası kullanılır: normal düşme fiziği kapalı, giriş/iniş kuru kıyıda.
   Çocuk yükseklik seçer; hiçbir ışık kaçırılabilir bir görev ya da başarısızlık değildir. */
'use strict';
const LS5_SURE = 64;
const LS5_RENK = ['#ffbf58', '#fa6684', '#b87be4', '#53d6c8', '#ffdb72'];
const LAVSAL = { o: null, aktif() { return !!this.o && P.ucus === this.o; }, baslat(o) { o = o || this.o; if (o) ls5Basla(o); return o; } };
let ls5SalArt = null;
let ls5RockArt = null;
const ls5KristalArt = [];
const ls5BloomArts = [];
const ls5CrustArts = [];
function ls5Soz(key) { if (typeof SES !== 'undefined' && SES.soyle) SES.soyle(key); }
function ls5Poly(q, points, color) { q.fillStyle = color; q.beginPath(); for (let i = 0; i < points.length; i++) { if (i) q.lineTo(points[i][0], points[i][1]); else q.moveTo(points[i][0], points[i][1]); } q.closePath(); q.fill(); }
function ls5RaftArt() {
  if (ls5SalArt) return ls5SalArt;
  const c = document.createElement('canvas'); c.width = 720; c.height = 300;
  const q = c.getContext('2d'); q.scale(2, 2); q.translate(180, 62);
  // Hem origami kâğıdı hem de bazalt: belirgin katlar, ince bakır damarlar.
  ls5Poly(q, [[-135,0],[-76,-15],[0,-6],[77,-17],[137,-3],[95,24],[42,44],[-34,46],[-102,25]], '#34314c');
  ls5Poly(q, [[-135,0],[-76,-15],[-34,9],[-102,25]], '#685779');
  ls5Poly(q, [[-76,-15],[0,-6],[-34,9]], '#a47e8a');
  ls5Poly(q, [[-34,9],[0,-6],[77,-17],[66,13]], '#83658e');
  ls5Poly(q, [[77,-17],[137,-3],[95,24],[66,13]], '#c38691');
  ls5Poly(q, [[-102,25],[-34,9],[-34,46]], '#4e3c62');
  ls5Poly(q, [[-34,9],[66,13],[42,44],[-34,46]], '#3d304e');
  ls5Poly(q, [[66,13],[137,-3],[95,24],[42,44]], '#715071');
  ls5Poly(q, [[-127,-1],[-167,-43],[-95,-18],[-75,-9]], '#9d8392');
  ls5Poly(q, [[-167,-43],[-105,-32],[-75,-9],[-95,-18]], '#c4a2ac');
  ls5Poly(q, [[87,-13],[156,-55],[139,-3],[104,13]], '#a18f9e');
  ls5Poly(q, [[156,-55],[116,-20],[104,13],[139,-3]], '#d8b0a4');
  q.strokeStyle = '#f5bc9a'; q.lineWidth = 1.1; q.beginPath(); q.moveTo(-132,0); q.lineTo(-34,9); q.lineTo(66,13); q.lineTo(136,-3); q.moveTo(-34,9); q.lineTo(-34,44); q.moveTo(66,13); q.lineTo(43,43); q.stroke();
  q.strokeStyle = 'rgba(255,224,181,.6)'; q.lineWidth = .65;
  for (let i = 0; i < 16; i++) { const x = -112 + i * 14; q.beginPath(); q.moveTo(x, 4 + Math.sin(i * 1.7) * 3); q.lineTo(x + 7, 12); q.stroke(); }
  // Çok ince kâğıt lifi/mineral tanesi yalnız hazırlıkta çizilir; düz yüzeyler plastik görünmez.
  q.save();q.beginPath();q.moveTo(-134,1);q.lineTo(-75,-14);q.lineTo(78,-16);q.lineTo(136,-2);q.lineTo(94,24);q.lineTo(42,43);q.lineTo(-34,45);q.lineTo(-102,24);q.closePath();q.clip();
  const grain=rng(51945);for(let i=0;i<1000;i++){const xx=-140+grain()*280,yy=-18+grain()*66;q.fillStyle=i%3?'rgba(249,224,201,.055)':'rgba(36,35,62,.09)';q.fillRect(xx,yy,.3+grain()*.8,.2+grain()*.5);}
  q.restore();
  q.strokeStyle='rgba(255,220,186,.44)';q.lineWidth=.75;q.beginPath();q.moveTo(-106,-3);q.bezierCurveTo(-56,-10,39,-9,101,-5);q.moveTo(-112,6);q.bezierCurveTo(-53,0,46,4,112,0);q.stroke();
  // Petit jardin central et perle lumineuse: invitation sans panneau écrit.
  for (let i = 0; i < 5; i++) { const a = Math.PI + i * Math.PI / 4; ls5Poly(q, [[-11,-4],[Math.cos(a)*28,-9+Math.sin(a)*19],[8,-7]], i % 2 ? '#e4c6b3' : '#af9cb0'); }
  q.fillStyle = '#ffe7ac'; q.beginPath(); q.ellipse(-2,-9,7,4,0,0,Math.PI*2); q.fill();
  return ls5SalArt = c;
}
function ls5RockTexture(){
  if(ls5RockArt)return ls5RockArt;
  const c=document.createElement('canvas');c.width=768;c.height=512;const q=c.getContext('2d'),r=rng(512684);
  for(let i=0;i<1900;i++){const x=r()*768,y=r()*512;q.fillStyle=i%3?'rgba(244,213,201,.038)':'rgba(37,36,61,.07)';q.fillRect(x,y,.5+r()*2,.3+r()*.8);}
  // Les fines strates sont volontairement irrégulières et de faible contraste.
  for(let i=0;i<32;i++){
    const y=12+i*15.5+r()*8;q.strokeStyle=i%3?'rgba(235,195,185,.085)':'rgba(46,39,64,.15)';q.lineWidth=.55+r()*.7;q.beginPath();q.moveTo(-20,y);
    for(let j=1;j<=9;j++)q.lineTo(j*94-20,y+Math.sin(j*1.1+i*.67)*7+r()*3);q.stroke();
  }
  for(let i=0;i<18;i++){
    const x=r()*768,y=r()*512;q.strokeStyle='rgba(44,37,63,.11)';q.lineWidth=.7;q.beginPath();q.moveTo(x,y);q.lineTo(x-8+r()*24,y+25+r()*40);q.lineTo(x-14+r()*33,y+60+r()*40);q.stroke();
  }
  return ls5RockArt=c;
}
function ls5GemArt(index) {
  if (ls5KristalArt[index]) return ls5KristalArt[index];
  const c = document.createElement('canvas'); c.width = 100; c.height = 220; const q = c.getContext('2d');
  q.translate(50, 198); const colors = [['#ffbd63','#a9566f','#ffe7ae'],['#f56f9a','#873966','#ffc3be'],['#b47de2','#61418c','#dfb9f6'],['#5ed4c7','#347c95','#b6f3d9'],['#ffd173','#a27548','#fff0b5']][index % 5];
  ls5Poly(q, [[-27,-22],[-23,-125],[0,-185],[27,-133],[30,-24],[0,0]], colors[0]);
  ls5Poly(q, [[-23,-125],[0,-185],[0,-29],[-27,-22]], colors[2]);
  ls5Poly(q, [[0,-185],[27,-133],[30,-24],[0,0],[0,-29]], colors[1]);
  ls5Poly(q, [[0,-185],[7,-131],[0,-29],[-9,-128]], colors[0]);
  q.save();q.beginPath();q.moveTo(-27,-22);q.lineTo(-23,-125);q.lineTo(0,-185);q.lineTo(27,-133);q.lineTo(30,-24);q.lineTo(0,0);q.closePath();q.clip();
  const grain=rng(51421+index*119);for(let i=0;i<145;i++){q.fillStyle=i%3?'rgba(255,234,198,.06)':'rgba(42,26,69,.08)';q.fillRect(-29+grain()*60,-187+grain()*190,.3+grain()*.9,.3+grain()*.4);}q.restore();
  q.strokeStyle='rgba(110,42,94,.25)';q.lineWidth=.65;q.beginPath();q.moveTo(-18,-114);q.lineTo(-13,-84);q.lineTo(-18,-57);q.moveTo(14,-102);q.lineTo(19,-69);q.lineTo(16,-38);q.stroke();
  q.strokeStyle='rgba(255,143,100,.7)';q.lineWidth=1.4;q.beginPath();q.moveTo(-24,-22);q.lineTo(0,-1);q.lineTo(28,-23);q.stroke();
  q.strokeStyle = 'rgba(255,249,225,.8)'; q.lineWidth = 1.3; q.beginPath(); q.moveTo(-22,-123); q.lineTo(0,-181); q.lineTo(26,-132); q.moveTo(0,-181); q.lineTo(0,-29); q.lineTo(-25,-22); q.stroke();
  return ls5KristalArt[index] = c;
}
function ls5BloomArt(index){
  const id=index%3;if(ls5BloomArts[id])return ls5BloomArts[id];
  const c=document.createElement('canvas');c.width=96;c.height=132;const q=c.getContext('2d');q.scale(2,2);q.translate(24,58);
  const petal=['#df386d','#a342c6','#c83c98'][id],light=['#ff8d93','#d88bea','#f27fb9'][id],shade=['#9f285e','#683384','#8e286c'][id];
  q.strokeStyle='#575b73';q.lineWidth=2;q.beginPath();q.moveTo(0,0);q.quadraticCurveTo(4,-20,-1,-35);q.stroke();
  ls5Poly(q,[[1,-10],[-12,-22],[-16,-22],[-10,-9]],'#5e8b91');ls5Poly(q,[[2,-18],[15,-30],[18,-27],[10,-15]],'#699397');
  q.translate(-1,-38);
  for(let i=0;i<5;i++){q.save();q.rotate(i*Math.PI*2/5);ls5Poly(q,[[0,3],[-9,-8],[-6,-17],[2,-21],[11,-10]],petal);ls5Poly(q,[[0,3],[2,-21],[11,-10]],light);q.strokeStyle=shade;q.lineWidth=.45;q.beginPath();q.moveTo(0,2);q.lineTo(1,-17);q.stroke();q.restore();}
  q.fillStyle='#ffd16f';q.beginPath();q.arc(0,0,4,0,Math.PI*2);q.fill();
  return ls5BloomArts[id]=c;
}
function ls5CrustArt(index){
  const id=index%3;if(ls5CrustArts[id])return ls5CrustArts[id];
  const c=document.createElement('canvas');c.width=256;c.height=108;const q=c.getContext('2d');q.scale(2,2);q.translate(64,27);
  const shift=id*3;
  ls5Poly(q,[[-54,-1],[-33,-12-shift],[-11,-8],[6,-16],[34,-11+shift],[57,0],[33,13],[-7,17],[-39,11]],'#b83f52');
  ls5Poly(q,[[-51,-2],[-33,-10-shift],[-11,-6],[6,-14],[34,-9+shift],[53,0],[31,10],[-7,14],[-38,8]],'#4e3a57');
  ls5Poly(q,[[-47,-2],[-33,-10-shift],[-11,-6],[-8,2],[-31,5]],'#685064');
  ls5Poly(q,[[-11,-6],[6,-14],[34,-9+shift],[16,1],[-8,2]],'#755267');
  ls5Poly(q,[[-8,2],[16,1],[31,10],[-7,14]],'#49364f');
  q.strokeStyle='#ff8c4d';q.lineWidth=1;q.beginPath();q.moveTo(-48,0);q.lineTo(-31,-6);q.moveTo(-10,-6);q.lineTo(-7,3);q.lineTo(4,7);q.lineTo(2,12);q.moveTo(17,0);q.lineTo(29,8);q.stroke();
  q.strokeStyle='#ffd080';q.lineWidth=.5;q.beginPath();q.moveTo(-7,3);q.lineTo(4,7);q.moveTo(31,10);q.lineTo(47,3);q.stroke();
  return ls5CrustArts[id]=c;
}
function ls5ShoreFlowers(o,tm){
  for(let shore=0;shore<2;shore++)for(let i=0;i<8;i++){
    const x=(shore?o.K.x1+38:o.kx-204)+i*31+(i%3)*4;
    if(x<cam.x-45||x>cam.x+VW+45)continue;
    const sc=.6+(i%3)*.15;g.save();g.translate(x,o.ky+7+(i%2)*2);g.rotate(Math.sin(tm*.9+i*1.7+shore)*.045);
    g.drawImage(ls5BloomArt((i+shore)%3),-24*sc,-58*sc,48*sc,66*sc);g.restore();
  }
}
function ls5Star(x, y, r, tm, color, alpha) {
  g.save(); g.translate(x,y); g.rotate(tm); g.globalAlpha = alpha; g.fillStyle = color;
  g.beginPath(); g.moveTo(0,-r); g.quadraticCurveTo(r*.14,-r*.14,r,0); g.quadraticCurveTo(r*.14,r*.14,0,r); g.quadraticCurveTo(-r*.14,r*.14,-r,0); g.quadraticCurveTo(-r*.14,-r*.14,0,-r); g.fill(); g.restore();
}
function ls5Bird(x, y, size, tm, color, alpha) {
  const flap = Math.sin(tm * 3.6), lift = 9 + flap * 17;
  g.save(); g.translate(x,y); g.scale(size,size); g.globalAlpha = alpha;
  ls5Poly(g, [[-23,5],[-7,-5],[6,0],[23,-6],[11,6],[-6,9]], color);
  ls5Poly(g, [[-5,1],[-33,-lift],[-14,5],[4,7]], '#f8e1bf');
  ls5Poly(g, [[-3,1],[9,-lift*1.35],[17,-5],[4,7]], '#dcb3bc');
  ls5Poly(g, [[23,-6],[31,-4],[21,-1]], '#ffe3ae');
  g.strokeStyle='rgba(255,247,223,.75)';g.lineWidth=.8;g.beginPath();g.moveTo(-31,-lift);g.lineTo(-4,4);g.lineTo(9,-lift*1.35);g.stroke();g.restore();
}
function ls5BaseY(u) { return 578 - Math.sin(u * Math.PI * 2.8) * 55 - Math.sin(clamp((u-.14)/.2,0,1)*Math.PI)*95; }
function ls5Content(o) {
  const k=o.K,L=k.x1-k.x0; o.seeds=[]; o.arches=[]; o.steam=[];
  for(let i=0;i<44;i++){const u=.05+i/44*.89; o.seeds.push({x:k.x0+u*L,y:ls5BaseY(u)-48+Math.sin(i*.62)*57,al:false,t:0,index:i%5});}
  for(let i=0;i<5;i++){const u=.14+i*.155;o.arches.push({x:k.x0+L*u,y:ls5BaseY(u)+55,passed:false,pulse:0,index:i});}
  for(let i=0;i<7;i++){const u=.08+i*.13;o.steam.push({x:k.x0+L*u,y:744,phase:i*1.7,wide:36+(i%3)*12});}
}
function ls5Basla(o) {
  if (o.done || o.faz !== 'bekle' || P.ucus || DURUM !== 'oyun') return;
  if (typeof V5 !== 'undefined' && !V5.mini) { o.dokundu=false; return; }
  o.faz='binis';o.t=0;o.total=0;o.routeU=0;o.px0=P.x;o.py0=P.y;o.mx=o.kx+30;o.my=o.ky+3;o.prevY=o.my;o.child=0;o.idle=0;o.joy=0;o.collected=0;o.noteT=-2;
  P.ucus=o;P.vx=P.vy=0;P.kilit=0;P.fade=0;P.buf=0;LAVSAL.o=o;
  if(typeof omHepsiniBirak==='function')omHepsiniBirak();
  OLAY.emit('lavSalBasla',{o,duration:LS5_SURE});
}
function ls5Landing(o) {
  P.x=o.K.x1+140;P.y=o.ky;P.vx=P.vy=0;P.ground=true;P.safeX=P.x;P.safeY=P.y;P.ucus=null;P.dj=true;P.buf=0;P.fade=0;
  D.x=P.x-74;D.y=P.y-91;D.vx=D.vy=0;
  o.x=o.K.x1+65;o.mx=o.x;o.my=o.ky+9;o.done=true;o.faz='bitti';o.t=0;
  if(typeof V5!=='undefined')V5.sal=true;
  OLAY.emit('lavSalBitti',{o});ls5Soz('p_v_sal_son');
}
function ls5Adim(o,dt,input) {
  if(!(dt>0)||!Number.isFinite(dt)||DURUM!=='oyun'||P.ucus!==o)return;
  o.t+=dt;o.total+=dt;o.joy=Math.max(0,o.joy-dt);o.jump=Math.max(0,o.jump-dt);o.pulse=Math.max(0,o.pulse-dt*1.5);
  P.vx=P.vy=0;P.ground=false;P.f=1;
  if(o.faz==='binis'){
    const u=smooth(clamp(o.t/2,0,1));o.mx=lerp(o.kx+30,o.K.x0+70,u);o.my=o.ky+3-Math.sin(u*Math.PI)*8;
    P.x=lerp(o.px0,o.mx-5,u);P.y=lerp(o.py0,o.my-7,u)-Math.sin(u*Math.PI)*48;
    if(u>=1){o.faz='yol';o.t=0;o.prevY=o.my;}
  }else if(o.faz==='yol'){
    const u=clamp(o.t/60,0,1),L=o.K.x1-o.K.x0;o.routeU=u;
    // Spline-like easement only at banks: a long, continuous river rather than a cutscene jump.
    const path=u<.08?.5*u*u/.08:u>.92?.92-.5*(1-u)*(1-u)/.08:u-.04;
    const norm=path/.92;o.mx=o.K.x0+70+norm*(L-70);
    const manual=input&&(input.eksenY||input.basili&&Number.isFinite(input.hedefY));
    o.idle=manual?0:o.idle+dt;
    let target=ls5BaseY(u)+Math.sin(o.total*2.2)*9;
    if(manual){o.child=lerp(o.child,1,1-Math.exp(-dt*4));if(input.eksenY)target=o.my+input.eksenY*140;else target=input.hedefY+25;}
    else o.child=lerp(o.child,0,1-Math.exp(-dt*1.2));
    // Parmağın etkisi nehrin geniş yatağı içinde kalır: çocuk akışta süzülür, sal havada uçmaz.
    target=clamp(target,Math.max(425,ls5BaseY(u)-45),Math.min(646,ls5BaseY(u)+65));
    o.my+=(target-o.my)*(1-Math.exp(-dt*(manual?3.2:1.7)));
    const dy=(o.my-o.prevY)/Math.max(.001,dt);o.rot=lerp(o.rot,clamp(dy/740,-.13,.13)+Math.sin(o.total*2)*.017,1-Math.exp(-dt*4));o.prevY=o.my;
    P.x=o.mx-5;P.y=o.my-7;
    for(const seed of o.seeds){if(seed.al){seed.t+=dt;continue;}const near=Math.hypot(seed.x-o.mx,seed.y-(o.my-40));if(near<85||seed.x<o.mx-88){seed.al=true;seed.t=0;o.collected++;o.joy=.85;o.pulse=1;if(now-o.noteT>.24){o.noteT=now;OLAY.emit('volkanKristal',{index:seed.index,stage:1,help:false,strength:.32});}}}
    for(const arch of o.arches){arch.pulse=Math.max(0,arch.pulse-dt*.6);if(!arch.passed&&o.mx>arch.x-12){arch.passed=true;arch.pulse=1;o.joy=1.7;OLAY.emit('lavSalAn',{phase:'arch',index:arch.index});}}
    const phase=u<.16?0:u<.37?1:u<.67?2:u<.91?3:4;
    if(phase!==o.phase){o.phase=phase;OLAY.emit('lavSalAn',{phase:['lift','lift','surf','arch','landing'][phase]});}
    if(u>=1){o.faz='inis';o.t=0;o.ix=P.x;o.iy=P.y;}
  }else if(o.faz==='inis'){
    const u=smooth(clamp(o.t/2,0,1));o.mx=lerp(o.K.x1,o.K.x1+55,u);o.my=lerp(o.prevY,o.ky+9,u);o.rot*=Math.exp(-dt*3);
    P.x=lerp(o.ix,o.K.x1+140,u);P.y=lerp(o.iy,o.ky,u)-Math.sin(u*Math.PI)*42;
    if(u>=1){ls5Landing(o);return;}
  }
  o.x=P.x;D.x=P.x-87;D.y=P.y-69;
}
function ls5Arch(o,a,tm,front){
  const min=cam.x-250,max=cam.x+VW+250;if(a.x<min||a.x>max)return;
  const rx=143,ry=256;
  for(let i=0;i<11;i++){
    const theta=Math.PI+i*Math.PI/10,xx=a.x+Math.cos(theta)*rx,yy=a.y+Math.sin(theta)*ry;
    if(front?i<8:i>=8)continue;
    g.save();g.translate(xx,yy);g.rotate(theta+Math.PI/2);g.globalAlpha=.86;
    g.drawImage(ls5GemArt((a.index+i)%5),-17,-85,34,90);g.restore();
  }
  if(!front){
    g.strokeStyle=a.passed?'rgba(255,231,177,.66)':'rgba(161,205,218,.26)';g.lineWidth=1.6;g.beginPath();g.ellipse(a.x,a.y,rx,ry,0,Math.PI,Math.PI*2);g.stroke();
    if(a.pulse>0){g.save();g.globalAlpha=a.pulse*.6;g.strokeStyle='#ffedc3';g.lineWidth=3;g.beginPath();g.ellipse(a.x,a.y-80,180+(1-a.pulse)*120,195+(1-a.pulse)*110,0,0,Math.PI*2);g.stroke();g.restore();}
    for(let i=0;i<4;i++)ls5Star(a.x-85+i*56,a.y-235-Math.sin(tm+i)*9,5.5,tm*.3+i,LS5_RENK[(i+a.index)%5],.65);
  }
}
function ls5DrawSteam(o,tm){
  for(const s of o.steam){if(s.x<cam.x-200||s.x>cam.x+VW+200)continue;
    const lift=Math.sin(tm*.68+s.phase)*.15+.85;
    for(let i=0;i<3;i++){
      const phase=(tm*.16+i/3+s.phase)%1,yy=s.y-phase*330*lift,xx=s.x+Math.sin(phase*5+s.phase)*30;
      g.save();g.globalAlpha=Math.sin(phase*Math.PI)*.16;g.fillStyle=i%2?'#ffd5bb':'#e1c6e2';
      g.beginPath();g.moveTo(xx-s.wide*.4,yy+44);g.bezierCurveTo(xx-s.wide*1.6,yy-35,xx+s.wide*.3,yy-80,xx+s.wide*.75,yy-54);g.bezierCurveTo(xx+s.wide*1.4,yy-12,xx+s.wide*.2,yy+18,xx+s.wide*.8,yy+48);g.closePath();g.fill();g.restore();
    }
    g.strokeStyle='rgba(255,218,168,.22)';g.lineWidth=2;g.beginPath();g.ellipse(s.x,s.y,s.wide*1.3,7,0,0,Math.PI*2);g.stroke();
  }
}
function ls5StreamY(o,x,tm){
  const u=clamp((x-o.K.x0)/(o.K.x1-o.K.x0),0,1),dx=(x-o.mx)/420;
  const bend=(o.my-ls5BaseY(o.routeU||0))*Math.exp(-dx*dx);
  return ls5BaseY(u)+bend+27+Math.sin(tm*.9+x*.003)*4+Math.sin(x*.018+tm*.45)*1.7;
}
function ls5DrawGorge(o,tm){
  const x0=Math.max(o.K.x0-140,cam.x-120),x1=Math.min(o.K.x1+180,cam.x+VW+120),n=28;
  if(x1<=x0)return;
  // Nehir, vadiye uzanan gerçek bir bazalt terasta akar. Üst kanal ile alttaki lav yatağı bir bütündür.
  g.fillStyle='#4c3d60';g.beginPath();
  for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),y=ls5StreamY(o,x,tm)+7;if(i)g.lineTo(x,y);else g.moveTo(x,y);}
  g.lineTo(x1,836);g.lineTo(x0,836);g.closePath();g.fill();
  const from=Math.floor(x0/230),to=Math.ceil(x1/230);
  for(let i=from;i<=to;i++){
    const x=i*230,top=ls5StreamY(o,x+85,tm)+49,lean=Math.sin(i*2.74)*35,step=110+Math.sin(i*1.43)*33;
    ls5Poly(g,[[x-12,top],[x+step,top+13],[x+151+lean,797],[x+39+lean,835]],i%2?'#5b4567':'#554263');
    ls5Poly(g,[[x+step,top+13],[x+237,top-9],[x+244,834],[x+151+lean,797]],i%2?'#6b4b6c':'#614564');
    // Des fractures plus petites traversent les grandes faces sans répétition en losanges.
    g.strokeStyle='rgba(245,186,161,.18)';g.lineWidth=.85;g.beginPath();g.moveTo(x+step,top+16);g.lineTo(x+step+lean*.4,top+94);g.lineTo(x+147+lean,775);g.moveTo(x+24,top+83);g.lineTo(x+79,top+99);g.lineTo(x+107,top+160);g.stroke();
  }
  g.save();g.beginPath();for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),y=ls5StreamY(o,x,tm)+9;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.lineTo(x1,836);g.lineTo(x0,836);g.closePath();g.clip();
  for(let i=Math.floor(x0/768);i<=Math.floor(x1/768);i++)g.drawImage(ls5RockTexture(),i*768,324,768,512);g.restore();
  // Dört farklı lav çağlayanı, üstteki nehirden derindeki ana yatağa gerçekten bağlanır.
  for(let i=0;i<4;i++){
    const x=o.K.x0+(15+i*30.8)*T;
    if(x<cam.x-160||x>cam.x+VW+160)continue;
    const top=ls5StreamY(o,x,tm)+29,bottom=804,h=bottom-top,w=29+i%2*13;
    for(let band=0;band<3;band++){
      const width=w*(band===0?1.2:band===1?.65:.15),shift=Math.sin(tm*.72+i)*2;
      g.fillStyle=['#ca4368','#f27c4e','#ffd779'][band];g.beginPath();g.moveTo(x-width*.68,top);
      g.bezierCurveTo(x+width*.4+shift,top+h*.25,x-width*.3,top+h*.74,x-width*1.35,bottom);
      g.lineTo(x+width*1.4,bottom);g.bezierCurveTo(x+width*.1,top+h*.73,x+width*.5+shift,top+h*.22,x+width*.7,top);g.closePath();g.fill();
    }
    g.strokeStyle='rgba(255,240,190,.7)';g.lineWidth=1.1;
    for(let j=0;j<5;j++){const u=(tm*.3+j/5+i*.17)%1,yy=top+u*h,xx=x+Math.sin(u*8+i)*w*.15;g.beginPath();g.moveTo(xx-w*.24,yy);g.lineTo(xx+w*.23,yy+10+u*11);g.stroke();}
    dglow('#ffb58c',x,top+24,75,.13);dglow('#ffc994',x,bottom,94,.18);
    // Dökülen eriyiğin kısa yayları: analitik, sabit sayıda; parçacık listesi büyümez.
    for(let j=0;j<4;j++){
      const u=(tm*.48+j/4+i*.13)%1,side=j%2?1:-1,reach=27+j*5;
      g.save();g.globalAlpha=Math.sin(u*Math.PI)*.74;g.strokeStyle=j%2?'#ffb35e':'#f37957';g.lineWidth=1.45;g.beginPath();
      for(let n=0;n<=7;n++){const t=Math.max(0,u-.25)+Math.min(u,.25)*n/7,xx=x+side*t*reach*1.6,yy=bottom-6-Math.sin(t*Math.PI)*(22+j*3);if(n)g.lineTo(xx,yy);else g.moveTo(xx,yy);}g.stroke();
      const hx=x+side*u*reach*1.6,hy=bottom-6-Math.sin(u*Math.PI)*(22+j*3);g.fillStyle='#ffd084';g.beginPath();g.ellipse(hx,hy,2.4,1.4,side*.4,0,Math.PI*2);g.fill();g.restore();
    }
    for(let j=0;j<2;j++){const u=(tm*.24+j*.5)%1;g.save();g.globalAlpha=(1-u)*.35;g.strokeStyle='#ffba6a';g.lineWidth=1.1;g.beginPath();g.ellipse(x,bottom-1,22+u*47,3+u*5,0,0,Math.PI);g.stroke();g.restore();}
  }
}
function ls5DrawStream(o,tm){
  const x0=Math.max(o.K.x0-100,cam.x-100),x1=Math.min(o.K.x1+110,cam.x+VW+100),n=34;
  if(x1<=x0)return;
  // Sıcak nehir buharla kıvrılan bir kurdeleye dönüşür; sal asla boşlukta asılı görünmez.
  for(let layer=0;layer<3;layer++){
    const top=layer===0?2:layer===1?5:19,thick=layer===0?80:layer===1?62:14;
    g.fillStyle=['rgba(166,48,86,.94)','rgba(239,100,66,.96)','rgba(255,189,77,.98)'][layer];g.beginPath();
    for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),flow=layer===2?Math.sin(x*.017-tm*1.1)*6:0,y=ls5StreamY(o,x,tm)+top+Math.sin(x*.011+layer)*3.8+flow;if(i)g.lineTo(x,y);else g.moveTo(x,y);}
    for(let i=n;i>=0;i--){const x=lerp(x0,x1,i/n),flow=layer===2?Math.sin(x*.017-tm*1.1)*6:0;g.lineTo(x,ls5StreamY(o,x,tm)+top+thick+Math.sin(x*.007-tm*.7)*6+Math.sin(x*.017+layer)*thick*.11+flow);}g.closePath();g.fill();
  }
  g.strokeStyle='rgba(255,220,139,.84)';g.lineWidth=1.6;g.beginPath();
  for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),y=ls5StreamY(o,x,tm)+5;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  // Long, quiet gold threads carry the eye downstream; finite count regardless of level width.
  const a=Math.floor(x0/145),b=Math.ceil(x1/145);
  for(let i=a;i<=b;i++){
    const x=i*145+(tm*64)%145,y=ls5StreamY(o,x,tm)+21+Math.sin(i*2.4+tm*.4)*8;
    g.strokeStyle='rgba(255,241,199,.46)';g.lineWidth=1.2;g.beginPath();g.moveTo(x-29,y);g.quadraticCurveTo(x-3,y-4,x+37,y+3);g.stroke();
    if(i%3===0){g.fillStyle='rgba(111,91,121,.42)';g.beginPath();g.moveTo(x-5,y+29);g.lineTo(x+20,y+21);g.lineTo(x+39,y+34);g.lineTo(x+13,y+43);g.fill();}
  }
  // Several narrow molten lanes wind around cooling crust, instead of a single flat yellow stripe.
  const first=Math.floor((x0-tm*38)/135),last=Math.ceil((x1-tm*38)/135);
  for(let i=first;i<=last;i++){
    const x=i*135+tm*38,lane=(i%3+3)%3;
    g.strokeStyle=lane===1?'rgba(255,218,126,.72)':'rgba(185,53,67,.5)';g.lineWidth=lane===1?1.5:2.2;g.beginPath();
    for(let k=0;k<=10;k++){const u=k/10,xx=x+u*104,yy=ls5StreamY(o,xx,tm)+14+lane*21+Math.sin(u*Math.PI*2+i)*5+Math.sin(tm*.55+i)*3;if(k)g.lineTo(xx,yy);else g.moveTo(xx,yy);}g.stroke();
  }
  const c0=Math.floor((x0-tm*22)/238),c1=Math.ceil((x1-tm*22)/238);
  for(let i=c0;i<=c1;i++){
    const x=i*238+tm*22,index=(i%3+3)%3,front=i%2===0,y=ls5StreamY(o,x,tm)+(front?59:10),scale=.63+index*.12;
    g.save();g.translate(x,y);g.rotate(Math.sin(i*2.1)*.09+Math.sin(tm*.4+i)*.018);g.drawImage(ls5CrustArt(index),-64*scale,-27*scale,128*scale,54*scale);g.restore();
  }
  // Basalt rims retain hot red lips; only their thin warm reflection is luminous.
  for(let bank=0;bank<2;bank++){
    g.strokeStyle=bank?'#7b314b':'#763347';g.lineWidth=bank?4.8:3.2;g.beginPath();
    for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),y=ls5StreamY(o,x,tm)+(bank?83+Math.sin(x*.007-tm*.7)*6+Math.sin(x*.017)*8.8:2+Math.sin(x*.011)*3.8);if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
    g.strokeStyle=bank?'rgba(255,122,73,.74)':'rgba(255,205,117,.72)';g.lineWidth=1;g.stroke();
  }
}
function ls5Sunbird(o,tm){
  if(o.faz!=='yol'||o.t<23||o.t>50)return;
  const age=o.t-23,arrive=smooth(clamp(age/5,0,1)),leave=smooth(clamp((age-20)/7,0,1));
  const x=o.mx+lerp(VW*.65,215,arrive)-leave*260,y=o.my-165-Math.sin(age*.45)*22-leave*170;
  const sc=(1.48+arrive*.35)*(1-leave*.48),wing=20+Math.sin(tm*1.7)*24;
  dglow('#ffe0af',x,y,115,.12*(1-leave));
  g.save();g.translate(x,y);g.scale(sc,sc);g.globalAlpha=Math.min(1,age/2)*(1-leave);
  ls5Poly(g,[[-64,9],[-18,-8],[30,-2],[60,-15],[49,4],[11,17],[-44,19]],'#f4c19f');
  ls5Poly(g,[[-18,0],[-83,-wing],[-49,-wing-25],[17,9]],'#f7dfbb');
  ls5Poly(g,[[-49,-wing-25],[-31,-wing-7],[17,9],[-18,0]],'#d2acc1');
  ls5Poly(g,[[-12,2],[31,-wing-34],[60,-wing-15],[15,13]],'#e5bec5');
  ls5Poly(g,[[31,-wing-34],[32,-wing-9],[15,13],[60,-wing-15]],'#fff0cd');
  ls5Poly(g,[[-57,10],[-102,3],[-81,21],[-46,19]],'#d0a4bb');
  ls5Poly(g,[[48,-3],[57,-27],[69,-30],[78,-24],[76,-11],[61,0]],'#f6d6b5');
  ls5Poly(g,[[76,-21],[91,-16],[76,-13]],'#e3a883');
  g.fillStyle='#67566e';g.beginPath();g.arc(71,-23,1.3,0,Math.PI*2);g.fill();
  g.strokeStyle='rgba(255,248,221,.8)';g.lineWidth=.9;g.beginPath();g.moveTo(-48,-wing-23);g.lineTo(1,8);g.lineTo(32,-wing-30);g.moveTo(-62,10);g.lineTo(15,13);g.lineTo(54,-4);g.stroke();g.restore();
  for(let i=0;i<4;i++){const u=(tm*.18+i/4)%1;ls5Star(x-90-u*90,y+20+Math.sin(i*2+tm)*18,4,tm*.4+i,LS5_RENK[i],Math.sin(u*Math.PI)*.65*(1-leave));}
}
function ls5DrawWake(o,tm){
  const amp=o.faz==='yol'?1:.3;
  for(let j=0;j<3;j++){
    g.strokeStyle=['rgba(255,226,173,.46)','rgba(255,174,143,.29)','rgba(195,167,218,.22)'][j];g.lineWidth=3.2-j*.6;g.beginPath();
    for(let i=0;i<26;i++){const t=i/25,xx=o.mx-70-t*350,yy=o.my+24+j*9+Math.sin(t*11-tm*2.8+j)*8*amp;if(i)g.lineTo(xx,yy);else g.moveTo(xx,yy);}g.stroke();
  }
  // Des poissons de papier jouent sous la coque et deviennent oiseaux dans la vapeur.
  const birds=o.faz==='yol'&&o.t>13?Math.min(6,1+Math.floor((o.t-13)/6)):0;
  for(let i=0;i<birds;i++){
    const settle=clamp((o.t-13-i*6)/2,0,1),bx=o.mx-120-i*37+Math.sin(tm*1.1+i)*18,by=o.my-92-Math.sin(tm*.8+i*.7)*29-i%2*35;
    ls5Bird(bx,by,.68+Math.sin(i*2)*.1,tm+i,LS5_RENK[i%5],settle*.95);
  }
}
function ls5DrawBoat(o,tm){
  const active=P.ucus===o, x=active?o.mx:o.done?o.mx:o.kx+30,y=active?o.my:o.ky+3+Math.sin(tm*1.35)*5;
  dglow('#ffb48e',x,y+38,130,.23);
  g.save();g.translate(x,y);g.rotate(active?o.rot:Math.sin(tm*1.2)*.012);
  g.drawImage(ls5RaftArt(),-180,-62,360,150);
  const flap=(active&&o.faz==='yol'?1:.4)*(1+.06*Math.sin(tm*1.8));
  // Deux feuilles pliées attrapent les souffles; transparence chaude, jamais une voile opaque sur Feza.
  for(let side=-1;side<=1;side+=2){g.save();g.scale(side,1);ls5Poly(g,[[67,1],[91,-40*flap],[128,-64*flap],[116,-9]],'#9a8eaa');ls5Poly(g,[[91,-40*flap],[128,-64*flap],[103,-11]],'#d3bbca');g.strokeStyle='#f4d5bc';g.lineWidth=.8;g.beginPath();g.moveTo(68,0);g.lineTo(126,-62*flap);g.stroke();g.restore();}
  g.restore();
  if(!active&&!o.done){for(let i=0;i<3;i++){const u=(tm*.32+i/3)%1;ls5Star(x-24+Math.sin(i*2)*26,y-55-u*70,5.5,tm*.4+i,'#ffe5b8',Math.sin(u*Math.PI)*.8);}}
}
TUR.kaydet('volkanSal',{
  kur(o){o.r=112;o.ry=40;o.kx=o.x;o.ky=o.y;o.mx=o.x+30;o.my=o.y+3;o.faz='bekle';o.t=0;o.total=0;o.rot=0;o.joy=0;o.pulse=0;o.phase=-1;o.done=false;o.prevY=o.my;o.jump=0;
    const k=BOLUM.sal||{};o.K={x0:Number.isFinite(k.x0)?k.x0:o.x,x1:Number.isFinite(k.x1)?k.x1:o.x+5000,yUst:200,yAlt:760};
    o.opt={aci:0,ruzgar:.3};
    o.adim=(dt,input)=>ls5Adim(o,dt,input);ls5Content(o);ls5RaftArt();ls5RockTexture();for(let i=0;i<5;i++)ls5GemArt(i);for(let i=0;i<3;i++){ls5BloomArt(i);ls5CrustArt(i);}LAVSAL.o=o;},
  dokun:ls5Basla,
  guncelle(o,dt){if(DURUM==='oyun'&&!P.ucus&&o.faz==='bekle'&&!o.done&&Math.abs(P.x-o.kx)<100&&Math.abs(P.y-o.ky)<95)ls5Basla(o);if(P.ucus===o)o.x=P.x;},
  ciz(o,tm){ls5ShoreFlowers(o,tm);if(o.faz==='bekle'||o.done){ls5DrawBoat(o,tm);return;}
    ls5DrawSteam(o,tm);ls5DrawGorge(o,tm);ls5DrawStream(o,tm);for(const a of o.arches)ls5Arch(o,a,tm,false);ls5Sunbird(o,tm);
    for(const s of o.seeds){if(s.x<cam.x-80||s.x>cam.x+VW+80||s.al&&s.t>.7)continue;const u=s.al?clamp(s.t/.7,0,1):0;const yy=s.y+Math.sin(tm*1.7+s.index)*6-u*36;
      dglow(LS5_RENK[s.index],s.x,yy,24+u*15,(1-u)*.25);ls5Star(s.x,yy,7*(1+u*.5),tm*.4+s.index,LS5_RENK[s.index],1-u);}
    ls5DrawWake(o,tm);ls5DrawBoat(o,tm);
  },
  cizOn(o,tm){if(P.ucus!==o)return;
    const joy=o.joy>0, opt=o.opt;opt.aci=o.rot;opt.ruzgar=.25+Math.abs(o.rot);opt.vy=(o.my-o.prevY)*60;opt.sevinc=joy?.7:0;opt.isik=0;
    if(typeof fezaCizPoz==='function'){
      g.save();g.translate(P.x,P.y);g.rotate(o.faz==='yol'?o.rot:0);
      fezaCizPoz(g,0,0,1.08,o.faz==='binis'&&o.t<1.6?'sevinc':joy&&o.faz==='yol'?'sevinc':'ayakta_yan',tm,null,opt);g.restore();
    }
    if(typeof pirilCizPoz==='function')pirilCizPoz(g,P.x-85+Math.sin(tm*2.1)*8,P.y-78+Math.sin(tm*2)*9,1.02,joy?'goz_kirp':'ucus',tm);
    for(const a of o.arches)ls5Arch(o,a,tm,true);
  }
});

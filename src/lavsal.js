/* Uyuyan Yanardağ: katlanan bazalt nilüferle sıcak ışık ırmağı.
   Gerçek uçuş kancası kullanılır: normal düşme fiziği kapalı, giriş/iniş kuru kıyıda.
   Çocuk yükseklik seçer; hiçbir ışık kaçırılabilir bir görev ya da başarısızlık değildir. */
'use strict';
const LS5_BINIS = 1.2, LS5_YOL = 32.4, LS5_INIS = 1.4;
const LS5_SURE = LS5_BINIS + LS5_YOL + LS5_INIS;
const LS5_AKIS_TEMPO = 60 / LS5_YOL;
const LS5_RENK = ['#ffbf58', '#fa6684', '#b87be4', '#53d6c8', '#ffdb72'];
const LAVSAL = { o: null, aktif() { return !!this.o && P.ucus === this.o; }, baslat(o) { o = o || this.o; if (o) ls5Basla(o); return o; } };
let ls5SalArt = null;
let ls5SalRimArt = null;
let ls5RockArt = null;
const ls5KristalArt = [];
const ls5BloomArts = [];
const ls5CrustArts = [];
function ls5Soz(key) { if (typeof SES !== 'undefined' && SES.soyle) SES.soyle(key); }
function ls5Poly(q, points, color) { q.fillStyle = color; q.beginPath(); for (let i = 0; i < points.length; i++) { if (i) q.lineTo(points[i][0], points[i][1]); else q.moveTo(points[i][0], points[i][1]); } q.closePath(); q.fill(); }
function ls5RaftArt() {
  if (ls5SalArt) return ls5SalArt;
  const c = document.createElement('canvas'); c.width = 800; c.height = 320;
  const q = c.getContext('2d'); q.scale(2, 2); q.translate(200, 78);
  // Tek parça omurga, kıvrılan baş/kıç, içi görünen güverte: bir araya gelmiş sivri taşlar değil bir tekne.
  q.fillStyle='#372b4c';q.beginPath();q.moveTo(-153,-10);q.bezierCurveTo(-135,26,-108,46,-54,51);q.bezierCurveTo(29,64,116,37,161,-22);q.lineTo(180,-48);q.quadraticCurveTo(132,-22,105,-19);q.lineTo(-106,-19);q.quadraticCurveTo(-143,-25,-167,-42);q.lineTo(-153,-10);q.fill();
  ls5Poly(q,[[-151,-9],[-106,-19],[-83,14],[-111,30],[-136,12]],'#72537c');
  ls5Poly(q,[[-106,-19],[-35,-18],[-24,22],[-83,14]],'#9a6d8d');
  ls5Poly(q,[[-35,-18],[53,-20],[45,24],[-24,22]],'#825778');
  ls5Poly(q,[[53,-20],[105,-19],[161,-22],[116,17],[45,24]],'#b5798c');
  ls5Poly(q,[[-111,30],[-83,14],[-24,22],[-54,50]],'#523958');
  ls5Poly(q,[[-24,22],[45,24],[32,47],[-54,50]],'#432e50');
  ls5Poly(q,[[45,24],[116,17],[88,35],[32,47]],'#704666');
  // Rear gunwale and a recessed inner basin, with a quiet warm rim instead of pale sails.
  q.fillStyle='#c18b98';q.beginPath();q.moveTo(-142,-12);q.quadraticCurveTo(-51,-40,109,-22);q.lineTo(150,-26);q.quadraticCurveTo(105,8,-19,8);q.quadraticCurveTo(-111,7,-142,-12);q.fill();
  q.fillStyle='#4d3b61';q.beginPath();q.moveTo(-129,-10);q.quadraticCurveTo(-49,-31,103,-18);q.lineTo(132,-20);q.quadraticCurveTo(77,0,-18,0);q.quadraticCurveTo(-96,0,-129,-10);q.fill();
  ls5Poly(q,[[-116,-10],[-46,-21],[-13,-4],[-88,-2]],'#75617b');
  ls5Poly(q,[[-46,-21],[39,-21],[65,-5],[-13,-4]],'#9c7d8d');
  ls5Poly(q,[[39,-21],[118,-19],[88,-7],[65,-5]],'#7c5f7b');
  // Two transverse benches, internal ribs, stepped prow and folded stern ornament.
  ls5Poly(q,[[-103,-13],[-61,-20],[-40,-12],[-85,-5]],'#c39b9c');
  ls5Poly(q,[[-85,-5],[-40,-12],[-40,-8],[-84,-1]],'#76536d');
  ls5Poly(q,[[47,-19],[77,-20],[96,-14],[65,-9]],'#bd9194');
  ls5Poly(q,[[65,-9],[96,-14],[94,-10],[66,-5]],'#77516c');
  q.strokeStyle='rgba(255,204,148,.7)';q.lineWidth=1.1;q.beginPath();q.moveTo(-141,-12);q.quadraticCurveTo(-49,-38,109,-22);q.lineTo(149,-26);q.moveTo(-128,-8);q.quadraticCurveTo(-38,-24,117,-17);q.stroke();
  ls5Poly(q,[[134,-22],[180,-48],[166,-10],[147,5]],'#a17087');
  ls5Poly(q,[[134,-22],[180,-48],[158,-24]],'#e3ae9d');
  ls5Poly(q,[[-146,-12],[-167,-42],[-142,-29],[-121,-17]],'#c296a1');
  ls5Poly(q,[[-167,-42],[-151,-34],[-142,-29],[-146,-12]],'#8d698b');
  q.strokeStyle='rgba(245,163,119,.66)';q.lineWidth=.8;q.beginPath();q.moveTo(-135,11);q.lineTo(-84,14);q.lineTo(-24,22);q.lineTo(45,24);q.lineTo(116,17);q.moveTo(-84,14);q.lineTo(-54,48);q.moveTo(45,24);q.lineTo(33,45);q.stroke();
  // Hammered grain and layered mineral inclusions are cached with the model.
  q.save();q.beginPath();q.moveTo(-150,-9);q.lineTo(-108,-18);q.lineTo(154,-22);q.lineTo(114,24);q.lineTo(31,49);q.lineTo(-54,51);q.lineTo(-109,30);q.closePath();q.clip();
  const grain=rng(51945);for(let i=0;i<1200;i++){q.fillStyle=i%3?'rgba(255,219,183,.07)':'rgba(32,21,49,.09)';q.fillRect(-152+grain()*310,-20+grain()*75,.3+grain()*.8,.2+grain()*.5);}q.restore();
  for(let i=0;i<12;i++){const xx=-117+i*21;q.fillStyle=i%3?'#d3a384':'#a97891';q.beginPath();q.ellipse(xx,10+Math.sin(i*.62)*4,1.2,.65,-.2,0,Math.PI*2);q.fill();}
  // The phoenix is engraved into the hull. Copper inlay follows the real curve
  // of the boat rather than floating decorations in front of the child.
  q.save();q.translate(12,30);q.strokeStyle='#edbc82';q.lineWidth=1.05;
  q.beginPath();q.moveTo(0,4);q.bezierCurveTo(-14,-9,-29,-11,-46,-7);q.bezierCurveTo(-28,-5,-14,1,-8,8);q.moveTo(0,4);q.bezierCurveTo(14,-9,29,-11,46,-7);q.bezierCurveTo(28,-5,14,1,8,8);q.moveTo(0,-4);q.quadraticCurveTo(-6,6,0,14);q.quadraticCurveTo(6,6,0,-4);q.moveTo(0,13);q.quadraticCurveTo(-6,22,-14,21);q.moveTo(2,13);q.quadraticCurveTo(10,23,19,19);q.stroke();
  q.fillStyle='#ffe0a0';q.beginPath();q.ellipse(0,-5,2.5,3.5,0,0,Math.PI*2);q.fill();q.restore();
  q.strokeStyle='rgba(246,199,149,.72)';q.lineWidth=.75;q.beginPath();q.moveTo(-129,17);q.bezierCurveTo(-79,49,40,61,123,13);q.stroke();
  for(let i=0;i<9;i++){const x=-112+i*26,y=25+Math.sin(i/8*Math.PI)*20;q.fillStyle='#d89b76';q.beginPath();q.ellipse(x,y,1.6,1.05,0,0,Math.PI*2);q.fill();q.strokeStyle='#5a3d59';q.lineWidth=.5;q.beginPath();q.moveTo(x-1.2,y);q.lineTo(x+1.2,y);q.stroke();}
  // The stepped prow carries a tiny ruby-and-gold folded feather.
  q.fillStyle='#c13f68';q.beginPath();q.moveTo(146,-25);q.bezierCurveTo(153,-38,166,-47,176,-46);q.quadraticCurveTo(171,-31,146,-25);q.fill();q.strokeStyle='#ffd297';q.lineWidth=.8;q.beginPath();q.moveTo(148,-26);q.lineTo(173,-44);q.stroke();
  return ls5SalArt = c;
}
function ls5RaftRimArt(){
  if(ls5SalRimArt)return ls5SalRimArt;
  const c=document.createElement('canvas');c.width=800;c.height=320;const q=c.getContext('2d');q.scale(2,2);q.translate(200,78);
  q.fillStyle='#ab778b';q.beginPath();q.moveTo(-142,-10);q.quadraticCurveTo(-67,18,33,11);q.quadraticCurveTo(106,8,150,-25);q.lineTo(144,-16);q.quadraticCurveTo(101,18,32,20);q.quadraticCurveTo(-72,25,-137,-3);q.fill();
  q.strokeStyle='#f3bb94';q.lineWidth=1.1;q.beginPath();q.moveTo(-141,-10);q.quadraticCurveTo(-66,18,33,11);q.quadraticCurveTo(106,8,150,-25);q.stroke();
  q.strokeStyle='rgba(85,47,78,.8)';q.lineWidth=.65;for(let i=0;i<7;i++){const x=-109+i*35;q.beginPath();q.moveTo(x,6+Math.sin((i+1)*.6)*6);q.lineTo(x+2,13+Math.sin((i+1)*.6)*6);q.stroke();}
  return ls5SalRimArt=c;
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
    const x=(shore?o.K.x1+166:o.kx-204)+i*31+(i%3)*4;
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
  const flap = Math.sin(tm * 3.6), lift = 9 + flap * 15;
  g.save(); g.translate(x,y); g.scale(size,size); g.globalAlpha = alpha;
  ls5Poly(g, [[-23,5],[-7,-5],[6,0],[23,-6],[11,6],[-6,9]], color);
  ls5Poly(g, [[-5,1],[-18,-lift*.55],[-33,-lift],[-27,-lift+9],[-14,5],[4,7]], '#f0c797');
  ls5Poly(g, [[-3,1],[3,-lift*.7],[9,-lift*1.35],[17,-lift*.65],[17,-5],[4,7]], '#d58db2');
  ls5Poly(g, [[-5,1],[-33,-lift],[-14,5]], '#ffe0aa');
  ls5Poly(g, [[-3,1],[9,-lift*1.35],[8,-5]], '#f6b8cb');
  ls5Poly(g, [[23,-6],[31,-4],[21,-1]], '#ffe3ae');
  g.strokeStyle='rgba(255,247,223,.75)';g.lineWidth=.8;g.beginPath();g.moveTo(-31,-lift);g.lineTo(-4,4);g.lineTo(9,-lift*1.35);g.stroke();g.restore();
}
function ls5BaseY(u) {
  const channel=578-Math.sin(u*Math.PI*2.8)*55-Math.sin(clamp((u-.14)/.2,0,1)*Math.PI)*95;
  const entry=lerp(680,channel,smooth(clamp(u/.075,0,1)));
  return lerp(entry,680,smooth(clamp((u-.925)/.075,0,1)));
}
function ls5Content(o) {
  const k=o.K,L=k.x1-k.x0; o.seeds=[]; o.arches=[]; o.steam=[];o.flowers=[];
  for(let i=0;i<28;i++){const u=.075+i/28*.82; o.seeds.push({x:k.x0+u*L,y:ls5BaseY(u)-40+Math.sin(i*.76)*92,al:false,t:0,index:i%5});}
  for(let i=0;i<3;i++){const u=.24+i*.26,offset=i===0?-110:i===1?105:-35;o.flowers.push({x:k.x0+70+(L-70)*(u-.04)/.92,y:ls5BaseY(u)+offset,index:i,opened:false,age:0,u,offset});}
  for(let i=0;i<5;i++){const u=.14+i*.155;o.arches.push({x:k.x0+L*u,y:ls5BaseY(u)+55,passed:false,pulse:0,index:i});}
  for(let i=0;i<7;i++){const u=.08+i*.13;o.steam.push({x:k.x0+L*u,y:744,phase:i*1.7,wide:36+(i%3)*12});}
}
function ls5Basla(o) {
  if (o.done || o.faz !== 'bekle' || P.ucus || DURUM !== 'oyun') return;
  if(P.fade>0||D.mode==='tasi'){o.dokundu=false;return;}
  if (typeof V5 !== 'undefined' && !V5.mini) { o.dokundu=false; return; }
  o.faz='binis';o.t=0;o.total=0;o.routeU=0;o.px0=P.x;o.py0=P.y;o.mx=o.kx+30;o.my=o.ky+3;o.prevY=o.my;o.previousX=o.mx;o.verticalSpeed=0;o.travelSpeed=0;o.child=0;o.idle=0;o.joy=0;o.collected=0;o.noteT=-2;o.flowerCount=0;o.goal=null;
  P.ucus=o;P.vx=P.vy=0;P.kilit=0;P.fade=0;P.buf=0;LAVSAL.o=o;
  if(typeof omHepsiniBirak==='function')omHepsiniBirak();
  ls5Soz('p_v_sal');
  OLAY.emit('lavSalBasla',{o,duration:LS5_SURE,rideDuration:LS5_YOL,boardDuration:LS5_BINIS,landDuration:LS5_INIS});
}
function ls5Landing(o) {
  P.x=o.K.x1+140;P.y=o.ky;P.vx=P.vy=0;P.ground=true;P.safeX=P.x;P.safeY=P.y;P.ucus=null;P.dj=true;P.buf=0;P.fade=0;
  D.x=P.x-74;D.y=P.y-91;D.vx=D.vy=0;
  o.x=o.K.x1+55;o.mx=o.x;o.my=o.ky+9;o.done=true;o.faz='bitti';o.t=0;o.dockT=0;
  if(typeof V5!=='undefined')V5.sal=true;
  OLAY.emit('lavSalBitti',{o,duration:o.total,progress:1});ls5Soz('p_v_sal_son');
}
function ls5Adim(o,dt,input) {
  if(!(dt>0)||!Number.isFinite(dt)||DURUM!=='oyun'||P.ucus!==o)return;
  o.t+=dt;o.total+=dt;o.joy=Math.max(0,o.joy-dt);o.jump=Math.max(0,o.jump-dt);o.pulse=Math.max(0,o.pulse-dt*1.5);
  P.vx=P.vy=0;P.ground=false;P.f=1;
  if(o.faz==='binis'){
    const u=smooth(clamp(o.t/LS5_BINIS,0,1));o.mx=lerp(o.kx+30,o.K.x0+70,u);o.my=o.ky+3-Math.sin(u*Math.PI)*4;
    P.x=lerp(o.px0,o.mx-5,u);P.y=lerp(o.py0,o.my-7,u)-Math.sin(u*Math.PI)*48;
    if(u>=1){o.faz='yol';o.t=Math.max(0,o.t-LS5_BINIS);o.prevY=o.my;o.previousX=o.mx;}
  }else if(o.faz==='yol'){
    const u=clamp(o.t/LS5_YOL,0,1),L=o.K.x1-o.K.x0;o.routeU=u;
    // Spline-like easement only at banks: a long, continuous river rather than a cutscene jump.
    const path=u<.08?.5*u*u/.08:u>.92?.92-.5*(1-u)*(1-u)/.08:u-.04;
    const norm=path/.92;o.mx=o.K.x0+70+norm*(L-70);
    const manual=input&&(input.eksenY||input.basili&&Number.isFinite(input.hedefY));
    o.idle=manual?0:o.idle+dt;
    let target=ls5BaseY(u)+Math.sin(o.total*2.8)*3.6+Math.sin(o.total*1.15)*1.7;
    if(o.goal&&(o.goal.opened||o.mx>o.goal.x+120))o.goal=null;
    if(o.goal)target=o.goal.y;
    if(manual){o.goal=null;o.child=lerp(o.child,1,1-Math.exp(-dt*7));if(input.eksenY)target=o.my+input.eksenY*210;else target=input.hedefY+25;}
    else o.child=lerp(o.child,0,1-Math.exp(-dt*1.2));
    // Parmağın etkisi nehrin geniş yatağı içinde kalır: çocuk akışta süzülür, sal havada uçmaz.
    const shore=Math.max(1-smooth(clamp(u/.075,0,1)),smooth(clamp((u-.925)/.075,0,1)));
    target=clamp(target,Math.max(350,ls5BaseY(u)-145),Math.min(720,ls5BaseY(u)+145));
    o.my+=(target-o.my)*(1-Math.exp(-dt*(manual?6.8:3.8)));
    const dy=(o.my-o.prevY)/Math.max(.001,dt),slope=(ls5BaseY(clamp(u+.004,0,1))-ls5BaseY(clamp(u-.004,0,1)))/(L*.008);
    o.rot=lerp(o.rot,clamp(dy/1500+Math.atan(slope)*.55,-.13,.13)+Math.sin(o.total*2.6)*.012,1-Math.exp(-dt*6));o.verticalSpeed=dy;o.travelSpeed=(o.mx-o.previousX)/Math.max(.001,dt);o.prevY=o.my;o.previousX=o.mx;
    P.x=o.mx-5;P.y=o.my-7;
    for(const seed of o.seeds){if(seed.al){seed.t+=dt;continue;}const near=Math.hypot(seed.x-o.mx,seed.y-(o.my-40));if(near<78){seed.al=true;seed.t=0;o.collected++;o.joy=Math.max(o.joy,.28);o.pulse=1;if(now-o.noteT>.2){o.noteT=now;OLAY.emit('volkanKristal',{index:seed.index,stage:1,help:false,strength:.32,source:'sal'});}}}
    for(const flower of o.flowers){if(flower.opened){flower.age+=dt;continue;}const dx=(o.mx-flower.x)/115,dy=(o.my-flower.y)/75;if(dx*dx+dy*dy<1){flower.opened=true;flower.age=0;o.flowerCount++;o.joy=1.4;o.pulse=1;o.goal=null;burst(flower.x,flower.y,28,['#fff0ce','#85d5c4','#ffcf7d','#e3749b'],110,2.4,4);OLAY.emit('lavSalCicek',{o,index:flower.index,x:flower.x,y:flower.y,progress:u,source:'near',duration:LS5_SURE});OLAY.emit('volkanKristal',{index:flower.index,stage:1,help:false,strength:.55,source:'sal-cicek'});}}
    for(const arch of o.arches){arch.pulse=Math.max(0,arch.pulse-dt*.85);if(!arch.passed&&o.mx>arch.x-12){arch.passed=true;arch.pulse=1;o.joy=.9;OLAY.emit('lavSalAn',{phase:'arch',index:arch.index,progress:u,duration:LS5_SURE});}}
    const phase=u<.16?0:u<.37?1:u<.67?2:u<.91?3:4;
    if(phase!==o.phase){o.phase=phase;OLAY.emit('lavSalAn',{phase:['lift','lift','surf','arch','landing'][phase],progress:u,duration:LS5_SURE});}
    if(u>=1){o.faz='inis';o.t=Math.max(0,o.t-LS5_YOL);o.ix=P.x;o.iy=P.y;}
  }else if(o.faz==='inis'){
    const u=smooth(clamp(o.t/LS5_INIS,0,1));o.mx=lerp(o.K.x1,o.K.x1+55,u);o.my=lerp(o.prevY,o.ky+9,u);o.rot*=Math.exp(-dt*5);
    P.x=lerp(o.ix,o.K.x1+140,u);P.y=lerp(o.iy,o.ky,u)-Math.sin(u*Math.PI)*42;
    if(u>=1){ls5Landing(o);return;}
  }
  o.x=P.x;D.x=P.x-87;D.y=P.y-69;
}
function ls5Arch(o,a,tm,front){
  const min=cam.x-250,max=cam.x+VW+250;if(a.x<min||a.x>max)return;
  const rx=143,ry=256;
  if(!front){
    g.strokeStyle='#715475';g.lineWidth=7.5;g.beginPath();g.ellipse(a.x,a.y,rx,ry,0,Math.PI,Math.PI*2);g.stroke();
    g.strokeStyle=a.passed?'#efba81':'#bc8c9b';g.lineWidth=1.45;g.stroke();
    for(let side=-1;side<=1;side+=2){const bx=a.x+side*rx;ls5Poly(g,[[bx-18,a.y+3],[bx-13,a.y-19],[bx+10,a.y-24],[bx+20,a.y+1],[bx+12,a.y+12],[bx-12,a.y+13]],'#73536e');ls5Poly(g,[[bx-18,a.y+3],[bx-13,a.y-19],[bx+10,a.y-24],[bx+2,a.y+1]],'#c08b94');}
  }
  for(let i=0;i<11;i++){
    const theta=Math.PI+i*Math.PI/10,xx=a.x+Math.cos(theta)*rx,yy=a.y+Math.sin(theta)*ry;
    if(front?i<8:i>=8)continue;
    g.save();g.translate(xx,yy);g.rotate(theta+Math.PI/2);g.globalAlpha=.86;
    g.drawImage(ls5GemArt((a.index+i)%5),-17,-85,34,90);
    g.strokeStyle='#d6a579';g.lineWidth=1.1;g.beginPath();g.ellipse(0,-12,12,3.5,0,0,Math.PI*2);g.stroke();g.restore();
  }
  if(!front){
    g.strokeStyle=a.passed?'rgba(255,231,177,.66)':'rgba(161,205,218,.26)';g.lineWidth=1.6;g.beginPath();g.ellipse(a.x,a.y,rx,ry,0,Math.PI,Math.PI*2);g.stroke();
    if(a.pulse>0){g.save();g.globalAlpha=a.pulse*.6;g.strokeStyle='#ffedc3';g.lineWidth=3;g.beginPath();g.ellipse(a.x,a.y-80,180+(1-a.pulse)*120,195+(1-a.pulse)*110,0,0,Math.PI*2);g.stroke();g.restore();}
    for(let i=0;i<4;i++)ls5Star(a.x-85+i*56,a.y-235-Math.sin(tm+i)*9,5.5,tm*.3+i,LS5_RENK[(i+a.index)%5],.65);
  }
}
function ls5DrawPassage(o,a,tm){
  if(a.x<cam.x-180||a.x>cam.x+VW+180)return;
  const opening=a.opened?smooth(clamp(a.age/1.45,0,1)):0,selected=o.goal===a,breath=1+Math.sin(tm*1.8+a.index)*.025;
  g.save();g.translate(a.x,a.y);g.scale(breath,breath);
  // Pearl material and teal folded leaves distinguish the actual play target
  // from every red mineral flower along the canyon.
  g.fillStyle='#285a67';g.strokeStyle='#8ccbbb';g.lineWidth=1.25;
  for(let s=-1;s<=1;s+=2){g.beginPath();g.moveTo(s*8,31);g.bezierCurveTo(s*27,6,s*52,7,s*68,24);g.quadraticCurveTo(s*40,47,s*8,31);g.fill();g.stroke();}
  if(opening<.999&&typeof vk5BudArt==='function'){g.save();g.globalAlpha=1-opening;g.drawImage(vk5BudArt(a.index,false),-66,-68,132,143);g.restore();}
  if(opening>.001&&typeof vk5BudArt==='function'){g.save();g.globalAlpha=opening;const sc=.65+opening*.65;g.scale(sc,sc);g.drawImage(vk5BudArt(a.index,true),-82.5,-85,165,178.8);g.restore();}
  if(!a.opened){g.strokeStyle=selected?'rgba(255,232,181,.9)':'rgba(126,207,191,.55)';g.lineWidth=selected?2:1;g.beginPath();g.ellipse(0,0,76,80,Math.sin(tm*.4)*.03,Math.PI*.15,Math.PI*1.84);g.stroke();
    for(let i=0;i<5;i++){const u=(tm*.21+i/5)%1,ang=i*1.256+tm*.1;ls5Star(Math.cos(ang)*(76+u*9),Math.sin(ang)*(78+u*9),2.5+selected,tm*.3,'#ffdfa4',Math.sin(u*Math.PI)*.66);}}
  if(a.opened&&a.age<2){g.save();g.globalAlpha=(1-a.age/2)*.5;g.strokeStyle='#e7eccd';g.lineWidth=1.4;g.beginPath();g.ellipse(0,0,75+a.age*65,77+a.age*55,0,0,Math.PI*2);g.stroke();g.restore();}
  g.restore();
}
addEventListener('pointerdown',e=>{
  const o=LAVSAL.o;if(!o||P.ucus!==o||o.faz!=='yol'||DURUM!=='oyun'||e.target!==cv||e.button!=null&&e.button!==0)return;
  const r=cv.getBoundingClientRect(),wx=cam.x+(e.clientX-r.left)*DPR/S,wy=cam.y+(e.clientY-r.top)*DPR/S;
  for(const a of o.flowers){if(a.opened||a.x<o.mx-100||a.x>cam.x+VW+100)continue;const dx=(wx-a.x)/96,dy=(wy-a.y)/103;if(dx*dx+dy*dy<1){o.goal=a;o.idle=0;o.joy=.35;if(typeof dragonHappy==='function')dragonHappy({x:a.x,y:a.y});e.preventDefault();e.stopPropagation();return;}}
},true);
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
  const flowing=ls5BaseY(u)+bend+27+Math.sin(tm*.9+x*.003)*4+Math.sin(x*.018+tm*.45)*1.7;
  return lerp(flowing,o.ky+26,smooth(clamp((x-o.K.x1)/240,0,1)));
}
function ls5GorgeBase(x){return 812+Math.sin(x*.0067)*20+Math.sin(x*.0193+2)*12;}
function ls5GorgeTop(o,x,tm){return lerp(ls5StreamY(o,x,tm)+7,ls5GorgeBase(x),smooth(clamp((x-o.K.x1-235)/145,0,1)));}
function ls5DrawGorge(o,tm){
  const x0=Math.max(o.K.x0-140,cam.x-120),x1=Math.min(o.K.x1+380,cam.x+VW+120),n=28;
  if(x1<=x0)return;
  // Nehir, vadiye uzanan gerçek bir bazalt terasta akar. Üst kanal ile alttaki lav yatağı bir bütündür.
  g.fillStyle='#4c3d60';g.beginPath();
  for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),y=ls5GorgeTop(o,x,tm);if(i)g.lineTo(x,y);else g.moveTo(x,y);}
  for(let i=n;i>=0;i--){const x=lerp(x0,x1,i/n);g.lineTo(x,ls5GorgeBase(x));}g.closePath();g.fill();g.save();g.clip();
  const from=Math.floor(x0/230),to=Math.ceil(x1/230);
  for(let i=from;i<=to;i++){
    const x=i*230,top=ls5StreamY(o,x+85,tm)+49,lean=Math.sin(i*2.74)*35,step=110+Math.sin(i*1.43)*33;
    ls5Poly(g,[[x-12,top],[x+step,top+13],[x+151+lean,797],[x+39+lean,835]],i%2?'#5b4567':'#554263');
    ls5Poly(g,[[x+step,top+13],[x+237,top-9],[x+244,834],[x+151+lean,797]],i%2?'#6b4b6c':'#614564');
    // Des fractures plus petites traversent les grandes faces sans répétition en losanges.
    g.strokeStyle='rgba(245,186,161,.18)';g.lineWidth=.85;g.beginPath();g.moveTo(x+step,top+16);g.lineTo(x+step+lean*.4,top+94);g.lineTo(x+147+lean,775);g.moveTo(x+24,top+83);g.lineTo(x+79,top+99);g.lineTo(x+107,top+160);g.stroke();
  }
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
  const flowTime=tm*LS5_AKIS_TEMPO;
  const x0=Math.max(o.K.x0-100,cam.x-100),x1=Math.min(o.K.x1+300,cam.x+VW+100),n=34,cap=x1>=o.K.x1+299;
  if(x1<=x0)return;
  // Sıcak nehir buharla kıvrılan bir kurdeleye dönüşür; sal asla boşlukta asılı görünmez.
  for(let layer=0;layer<3;layer++){
    const top=layer===0?2:layer===1?5:19,thick=layer===0?80:layer===1?62:14;
    g.fillStyle=['rgba(166,48,86,.94)','rgba(239,100,66,.96)','rgba(255,189,77,.98)'][layer];g.beginPath();
    for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),flow=layer===2?Math.sin(x*.017-flowTime*1.1)*6:0,y=ls5StreamY(o,x,tm)+top+Math.sin(x*.011+layer)*3.8+flow;if(i)g.lineTo(x,y);else g.moveTo(x,y);}
    if(cap){const flow=layer===2?Math.sin(x1*.017-flowTime*1.1)*6:0;g.quadraticCurveTo(x1+18,ls5StreamY(o,x1,tm)+top+thick*.5,x1,ls5StreamY(o,x1,tm)+top+thick+Math.sin(x1*.007-tm*.7)*6+Math.sin(x1*.017+layer)*thick*.11+flow);}
    for(let i=cap?n-1:n;i>=0;i--){const x=lerp(x0,x1,i/n),flow=layer===2?Math.sin(x*.017-flowTime*1.1)*6:0;g.lineTo(x,ls5StreamY(o,x,tm)+top+thick+Math.sin(x*.007-tm*.7)*6+Math.sin(x*.017+layer)*thick*.11+flow);}g.closePath();g.fill();
  }
  g.strokeStyle='rgba(255,220,139,.84)';g.lineWidth=1.6;g.beginPath();
  for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),y=ls5StreamY(o,x,tm)+5;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
  // Long, quiet gold threads carry the eye downstream; finite count regardless of level width.
  const a=Math.floor(x0/145),b=Math.ceil(x1/145);
  for(let i=a;i<=b;i++){
    const x=i*145+(flowTime*64)%145,y=ls5StreamY(o,x,tm)+21+Math.sin(i*2.4+flowTime*.4)*8;
    g.strokeStyle='rgba(255,241,199,.46)';g.lineWidth=1.2;g.beginPath();g.moveTo(x-29,y);g.quadraticCurveTo(x-3,y-4,x+37,y+3);g.stroke();
    if(i%3===0){g.fillStyle='rgba(111,91,121,.42)';g.beginPath();g.moveTo(x-5,y+29);g.lineTo(x+20,y+21);g.lineTo(x+39,y+34);g.lineTo(x+13,y+43);g.fill();}
  }
  // Several narrow molten lanes wind around cooling crust, instead of a single flat yellow stripe.
  const first=Math.floor((x0-flowTime*38)/135),last=Math.ceil((x1-flowTime*38)/135);
  for(let i=first;i<=last;i++){
    const x=i*135+flowTime*38,lane=(i%3+3)%3;
    g.strokeStyle=lane===1?'rgba(255,218,126,.72)':'rgba(185,53,67,.5)';g.lineWidth=lane===1?1.5:2.2;g.beginPath();
    for(let k=0;k<=10;k++){const u=k/10,xx=x+u*104,yy=ls5StreamY(o,xx,tm)+14+lane*21+Math.sin(u*Math.PI*2+i)*5+Math.sin(flowTime*.55+i)*3;if(k)g.lineTo(xx,yy);else g.moveTo(xx,yy);}g.stroke();
  }
  const c0=Math.floor((x0-flowTime*22)/238),c1=Math.ceil((x1-flowTime*22)/238);
  for(let i=c0;i<=c1;i++){
    const x=i*238+flowTime*22,index=(i%3+3)%3,front=i%2===0,y=ls5StreamY(o,x,tm)+(front?59:10),scale=.63+index*.12;
    g.save();g.translate(x,y);g.rotate(Math.sin(i*2.1)*.09+Math.sin(tm*.4+i)*.018);g.drawImage(ls5CrustArt(index),-64*scale,-27*scale,128*scale,54*scale);g.restore();
  }
  // Basalt rims retain hot red lips; only their thin warm reflection is luminous.
  for(let bank=0;bank<2;bank++){
    g.strokeStyle=bank?'#7b314b':'#763347';g.lineWidth=bank?4.8:3.2;g.beginPath();
    for(let i=0;i<=n;i++){const x=lerp(x0,x1,i/n),y=ls5StreamY(o,x,tm)+(bank?83+Math.sin(x*.007-tm*.7)*6+Math.sin(x*.017)*8.8:2+Math.sin(x*.011)*3.8);if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
    g.strokeStyle=bank?'rgba(255,122,73,.74)':'rgba(255,205,117,.72)';g.lineWidth=1;g.stroke();
  }
}
function ls5DrawDock(o,tm){
  const x=o.K.x1,y=o.ky;if(x+410<cam.x-100||x+80>cam.x+VW+100)return;
  // Yumuşak kıyı ağzı, gerçek y680 inişini aynı yerde bırakır; kare kesilmiş kanal/uçurum görünmez.
  ls5Poly(g,[[x+91,y+3],[x+108,y-9],[x+169,y-15],[x+226,y-10],[x+292,y-15],[x+354,y-7],[x+410,y+12],[x+377,y+32],[x+295,y+40],[x+217,y+30],[x+157,y+46],[x+113,y+29]],'#64465f');
  ls5Poly(g,[[x+91,y+3],[x+108,y-9],[x+169,y-15],[x+226,y-10],[x+292,y-15],[x+354,y-7],[x+410,y+12],[x+302,y+13],[x+197,y+8],[x+126,y+15]],'#9a7181');
  ls5Poly(g,[[x+126,y+15],[x+197,y+8],[x+217,y+30],[x+157,y+46],[x+113,y+29]],'#79536c');
  ls5Poly(g,[[x+197,y+8],[x+302,y+13],[x+295,y+40],[x+217,y+30]],'#523a55');
  g.strokeStyle='rgba(255,176,113,.72)';g.lineWidth=1.2;g.beginPath();g.moveTo(x+100,y+2);g.lineTo(x+130,y-1);g.lineTo(x+195,y-4);g.lineTo(x+280,y-4);g.lineTo(x+350,y);g.lineTo(x+395,y+11);g.stroke();
  g.strokeStyle='rgba(68,39,67,.7)';g.lineWidth=.85;g.beginPath();g.moveTo(x+170,y-10);g.lineTo(x+164,y+7);g.lineTo(x+157,y+42);g.moveTo(x+228,y-7);g.lineTo(x+220,y+29);g.moveTo(x+298,y-11);g.lineTo(x+294,y+35);g.stroke();
  for(let i=0;i<4;i++){const xx=x+145+i*54;g.strokeStyle='rgba(242,176,134,.4)';g.lineWidth=.75;g.beginPath();g.moveTo(xx,y+2);g.lineTo(xx+17,y+3);g.stroke();}
  // Low copper mooring loop, below the child's face and outside the landing point.
  g.strokeStyle='#c48d7c';g.lineWidth=2;g.beginPath();g.ellipse(x+110,y-4,5,9,-.3,Math.PI,Math.PI*2);g.stroke();
}
function ls5Sunbird(o,tm){
  if(typeof ANKA==='undefined'||typeof V5!=='undefined'&&!V5.mini)return;
  const active=P.ucus===o,u=o.routeU||0,leave=o.done?smooth(clamp((o.dockT-1)/4,0,1)):smooth(clamp((u-.94)/.06,0,1))*.2;
  if(leave>=1)return;const x=(active?o.mx:o.done?o.mx:o.kx+30)+210+leave*130,y=(active?o.my:o.ky)-180-Math.sin(tm*.8)*13-leave*140;
  const opt=o.phoenixOpt;opt.pose=o.joy>.7?'lift':active?'glide':'perch';opt.kanatAc=active?.84+Math.sin(tm*2.1)*.1:.3;opt.joy=clamp(o.joy||0,0,1);opt.alpha=1-leave;
  ANKA.ciz(g,x,y,active?.58:.46,tm,opt);
  for(let i=0;i<4;i++){const a=(tm*.2+i/4)%1;ls5Star(x-100-a*70,y+38+Math.sin(i*2+tm)*15,2.7,tm*.4+i,i%2?'#ffdc93':'#e66e9f',Math.sin(a*Math.PI)*.55*(1-leave));}
}
function ls5DrawWake(o,tm){
  const amp=o.faz==='yol'?1:.3;
  for(let j=0;j<3;j++){
    g.strokeStyle=['rgba(255,226,173,.46)','rgba(255,174,143,.29)','rgba(195,167,218,.22)'][j];g.lineWidth=3.2-j*.6;g.beginPath();
    for(let i=0;i<26;i++){const t=i/25,xx=o.mx-70-t*350,yy=o.my+24+j*9+Math.sin(t*11-tm*4.4+j)*8*amp;if(i)g.lineTo(xx,yy);else g.moveTo(xx,yy);}g.stroke();
  }
  // Reflected copper leaves shear in the wake; the awakened Anka is the one
  // living companion, rather than unrelated birds replacing the mini's friend.
  for(let i=0;i<5;i++){const u=(tm*.65+i/5)%1,x=o.mx-95-u*180,y=o.my+26+Math.sin(i*1.4+tm)*5;g.save();g.globalAlpha=(1-u)*.28;g.fillStyle=i%2?'#ffc87e':'#e37c9f';g.beginPath();g.ellipse(x,y,10-u*4,1.8,-.12,0,Math.PI*2);g.fill();g.restore();}
}
function ls5DrawBoat(o,tm){
  const active=P.ucus===o, x=active?o.mx:o.done?o.mx:o.kx+30,y=active?o.my:o.done?o.my+Math.sin((o.dockT||0)*1.1)*2:o.ky+3+Math.sin(tm*1.35)*5;
  dglow('#ffb48e',x,y+38,130,.23);
  g.save();g.translate(x,y);g.rotate(active||o.done?o.rot:Math.sin(tm*1.2)*.012);
  g.drawImage(ls5RaftArt(),-200,-78,400,160);
  if(!active)g.drawImage(ls5RaftRimArt(),-200,-78,400,160);
  g.restore();
  if(!active&&!o.done){for(let i=0;i<3;i++){const u=(tm*.32+i/3)%1;ls5Star(x-24+Math.sin(i*2)*26,y-55-u*70,5.5,tm*.4+i,'#ffe5b8',Math.sin(u*Math.PI)*.8);}}
}
TUR.kaydet('volkanSal',{
  kur(o){o.r=112;o.ry=40;o.kx=o.x;o.ky=o.y;o.mx=o.x+30;o.my=o.y+3;o.faz='bekle';o.t=0;o.total=0;o.rot=0;o.joy=0;o.pulse=0;o.phase=-1;o.done=false;o.prevY=o.my;o.jump=0;
    const k=BOLUM.sal||{};o.K={x0:Number.isFinite(k.x0)?k.x0:o.x,x1:Number.isFinite(k.x1)?k.x1:o.x+5000,yUst:200,yAlt:760};
    o.opt={aci:0,ruzgar:.3};o.phoenixOpt={pose:'glide',kanatAc:.9,kanatSag:1,joy:0,alpha:1};
    o.adim=(dt,input)=>ls5Adim(o,dt,input);ls5Content(o);ls5RaftArt();ls5RaftRimArt();ls5RockTexture();for(let i=0;i<5;i++)ls5GemArt(i);for(let i=0;i<3;i++){ls5BloomArt(i);ls5CrustArt(i);}LAVSAL.o=o;},
  dokun:ls5Basla,
  guncelle(o,dt){if(DURUM==='oyun'&&!P.ucus&&o.faz==='bekle'&&!o.done&&Math.abs(P.x-o.kx)<100&&Math.abs(P.y-o.ky)<95)ls5Basla(o);if(P.ucus===o)o.x=P.x;if(o.done&&dt>0&&Number.isFinite(dt)){o.dockT+=dt;o.rot*=Math.exp(-dt*2);}},
  ciz(o,tm){if(o.faz==='bekle'||o.done){if(o.done){ls5DrawSteam(o,tm);ls5DrawGorge(o,tm);ls5DrawStream(o,tm);}ls5DrawDock(o,tm);ls5ShoreFlowers(o,tm);ls5DrawBoat(o,tm);ls5Sunbird(o,tm);return;}
    ls5DrawSteam(o,tm);ls5DrawGorge(o,tm);ls5DrawStream(o,tm);ls5DrawDock(o,tm);ls5ShoreFlowers(o,tm);for(const a of o.arches)ls5Arch(o,a,tm,false);ls5Sunbird(o,tm);
    for(const s of o.seeds){if(s.x<cam.x-80||s.x>cam.x+VW+80||s.al&&s.t>.7)continue;const u=s.al?clamp(s.t/.7,0,1):0;const yy=s.y+Math.sin(tm*1.7+s.index)*6-u*36;
      dglow(LS5_RENK[s.index],s.x,yy,24+u*15,(1-u)*.25);ls5Star(s.x,yy,7*(1+u*.5),tm*.4+s.index,LS5_RENK[s.index],1-u);}
    for(const flower of o.flowers)ls5DrawPassage(o,flower,tm);
    ls5DrawWake(o,tm);ls5DrawBoat(o,tm);
  },
  cizOn(o,tm){if(P.ucus!==o)return;
    const joy=o.joy>.55, opt=o.opt;opt.aci=o.rot;opt.ruzgar=.35+Math.abs(o.rot);opt.vy=o.verticalSpeed||0;opt.sevinc=joy?.7:0;opt.isik=0;
    if(typeof fezaCizPoz==='function'){
      g.save();g.translate(P.x,P.y);g.rotate(o.faz==='yol'?o.rot:0);
      fezaCizPoz(g,0,0,1.08,o.faz==='binis'&&o.t<LS5_BINIS*.72?'sevinc':joy&&o.faz==='yol'?'sevinc':'ayakta_yan',tm,null,opt);g.restore();
    }
    if(typeof pirilCizPoz==='function')pirilCizPoz(g,P.x-85+Math.sin(tm*2.1)*8,P.y-78+Math.sin(tm*2)*9,1.02,joy?'goz_kirp':'ucus',tm);
    g.save();g.translate(o.mx,o.my);g.rotate(o.rot);g.drawImage(ls5RaftRimArt(),-200,-78,400,160);g.restore();
    for(const a of o.arches)ls5Arch(o,a,tm,true);
  }
});

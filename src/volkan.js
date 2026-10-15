/* volkan.js — Yanardağın yaşayan bahçeleri, sıcak buhar oyuncakları ve Kor Çiçeği.
   Korku, hasar, zaman sınırı yok. Her tamamlanma olayı yalnız bir kez üretilir. */
'use strict';
const VK5={sprites:[],petals:[],birds:[],warm:0,final:null};
const VK5_COL=['#e95770','#a85acb','#cf428e'];
const vk5Ease=v=>smooth(clamp(v,0,1));
function vk5Say(k){if(typeof SES!=='undefined'&&SES.soyle)SES.soyle(k);}
function vk5Sfx(k,v){if(typeof AU!=='undefined'&&AU.sfx)AU.sfx(k,v);}
function vk5Glow(col,x,y,rx,ry,a){if(a<=.003)return;g.globalAlpha=a;g.drawImage(glow(col),x-rx,y-ry,rx*2,ry*2);g.globalAlpha=1;}
function vk5Cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function vk5BirdArt(part){
 if(VK5.birds[part])return VK5.birds[part];const cv=vk5Cv(180,120),c=cv.getContext('2d');c.scale(2,2);c.translate(45,34);
 const poly=(p,col)=>{c.fillStyle=col;c.beginPath();for(let j=0;j<p.length;j++)j?c.lineTo(p[j][0],p[j][1]):c.moveTo(p[j][0],p[j][1]);c.closePath();c.fill();};
 if(part===0){
  poly([[-31,9],[-10,-4],[6,-2],[18,-11],[27,-9],[25,-1],[10,10],[-7,14]],'#e8bc80');
  poly([[-31,9],[-10,-4],[6,-2],[-7,14]],'#f9dfaa');
  poly([[-31,9],[-41,2],[-34,18],[-17,12]],'#d3a276');
  poly([[25,-7],[36,-4],[25,-1]],'#ffedb5');
  c.strokeStyle='rgba(255,246,212,.74)';c.lineWidth=.8;c.beginPath();c.moveTo(-29,9);c.lineTo(-7,8);c.lineTo(9,2);c.lineTo(20,-7);c.stroke();
  c.fillStyle='#79616b';c.beginPath();c.arc(24,-6,.85,0,6.283);c.fill();
 }else{
  poly([[-8,10],[-36,-25],[-10,-13],[13,8]],part===1?'#fff0bd':'#d6ad82');
  poly([[-36,-25],[-14,-23],[-10,-13],[13,8]],part===1?'#eac592':'#f8dfac');
  c.strokeStyle='rgba(255,250,222,.75)';c.lineWidth=.7;c.beginPath();c.moveTo(-35,-24);c.lineTo(-8,8);c.lineTo(11,8);c.stroke();
 }
 VK5.birds[part]=cv;return cv;
}
function vk5FinalBird(x,y,size,tm,ph,side,alpha){
 if(alpha<.003)return;g.save();g.translate(x,y);g.scale(side*size,size);g.rotate(-.2+Math.sin(tm*.7+ph)*.06);g.globalAlpha=alpha;
 const flap=Math.sin(tm*4.1+ph);
 g.save();g.translate(-2,1);g.rotate(-.48+flap*.29);g.scale(.83,.76);g.drawImage(vk5BirdArt(2),-45,-34,90,60);g.restore();
 g.drawImage(vk5BirdArt(0),-45,-34,90,60);
 g.save();g.translate(-5,1);g.rotate(.18+flap*.38);g.drawImage(vk5BirdArt(1),-45,-34,90,60);g.restore();g.restore();
}
function vk5Petal(v){
 if(VK5.petals[v])return VK5.petals[v];const cv=vk5Cv(260,540),c=cv.getContext('2d');c.scale(2,2);const colors=[['#ffb497','#dc466b','#752f62'],['#ed91c0','#a650be','#4e2e7e'],['#ed729f','#b43686','#562766']],co=colors[v%3],gr=c.createLinearGradient(-15,25,105,225);gr.addColorStop(0,co[0]);gr.addColorStop(.42,co[1]);gr.addColorStop(1,co[2]);c.fillStyle=gr;c.beginPath();c.moveTo(65,255);c.bezierCurveTo(24,207,-1,91,65,9);c.bezierCurveTo(135,89,110,211,65,255);c.fill();
 c.save();c.beginPath();c.moveTo(65,255);c.bezierCurveTo(24,207,-1,91,65,9);c.bezierCurveTo(135,89,110,211,65,255);c.clip();c.fillStyle='rgba(255,245,211,.19)';c.beginPath();c.moveTo(65,9);c.lineTo(65,255);c.bezierCurveTo(45,207,34,92,65,9);c.fill();c.strokeStyle='rgba(255,246,215,.34)';c.lineWidth=.75;for(let j=0;j<8;j++){const y=58+j*22;c.beginPath();c.moveTo(65,y+18);c.quadraticCurveTo(40,y+3,26+j*.8,y-23);c.moveTo(65,y+18);c.quadraticCurveTo(91,y+3,102-j*.8,y-23);c.stroke();}c.restore();c.strokeStyle='rgba(255,245,219,.62)';c.lineWidth=.9;c.beginPath();c.moveTo(65,250);c.quadraticCurveTo(60,118,65,12);c.stroke();c.strokeStyle='rgba(255,231,194,.48)';c.beginPath();c.moveTo(65,9);c.bezierCurveTo(12,80,26,180,52,226);c.stroke();VK5.petals[v]=cv;return cv;
}
function vk5Stone(v){
 if(VK5.sprites[v])return VK5.sprites[v];const cv=vk5Cv(560,320),c=cv.getContext('2d');c.scale(2,2);const R=rng(937+v*53),color=['#596079','#596d7d','#74617e'][v%3];
 // Sculpted basalt garden basin, warm mineral inlay and a small ring of pebbles.
 c.fillStyle='rgba(25,33,57,.18)';c.beginPath();c.ellipse(140,126,125,20,0,0,6.283);c.fill();
 const gr=c.createLinearGradient(0,74,0,137);gr.addColorStop(0,'#b7b0ae');gr.addColorStop(.15,color);gr.addColorStop(.65,'#3e4965');gr.addColorStop(1,'#273a56');c.fillStyle=gr;c.beginPath();c.moveTo(19,96);c.lineTo(42,81);c.lineTo(235,81);c.lineTo(263,99);c.lineTo(244,126);c.lineTo(195,139);c.lineTo(71,136);c.lineTo(30,119);c.closePath();c.fill();
 c.fillStyle='#777b8b';c.beginPath();c.ellipse(140,94,112,19,0,0,6.283);c.fill();c.fillStyle='#4b536b';c.beginPath();c.ellipse(140,93,98,12,0,0,6.283);c.fill();c.strokeStyle='rgba(255,218,170,.54)';c.lineWidth=1.2;c.beginPath();c.ellipse(140,93,103,14,0,0,6.283);c.stroke();
 for(let j=0;j<15;j++){const a=j*6.283/15,x=140+Math.cos(a)*100,y=94+Math.sin(a)*14;c.strokeStyle='rgba(233,201,176,.4)';c.lineWidth=.9;c.beginPath();c.moveTo(x,y+2);c.lineTo(x+(R()-.5)*8,y+10+R()*12);c.stroke();}
 for(let j=0;j<12;j++){c.fillStyle=j%3?'#aa9a9d':'#ddba9b';c.beginPath();c.ellipse(29+R()*222,123+R()*14,2+R()*5,1.5+R()*2,0,0,6.283);c.fill();}VK5.sprites[v]=cv;return cv;
}
function vk5Warm(){if(VK5.warm<3){vk5Petal(VK5.warm++);return false;}if(VK5.warm<6){vk5Stone(VK5.warm++-3);return false;}if(VK5.warm<9){vk5BirdArt(VK5.warm++-6);return false;}return true;}
function vk5Leaf(x,y,ang,len,w,col,alpha){
 g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=alpha;g.fillStyle=col;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-w,-len*.4,0,-len);g.quadraticCurveTo(w,-len*.45,0,0);g.fill();g.strokeStyle='rgba(255,238,194,.36)';g.lineWidth=.8;g.beginPath();g.moveTo(0,0);g.lineTo(0,-len*.9);g.stroke();g.restore();
}
function vk5Node(n,tm,col,variant){
 const pulse=1+Math.sin(tm*1.1+n.note)*.04,k=n.done?vk5Ease((now-n.t)/1.4):0,x=n.x,y=n.y;
 g.fillStyle='#4a526a';g.beginPath();g.ellipse(x,y-1,28,7,0,0,6.283);g.fill();g.strokeStyle='#b6a3a2';g.lineWidth=1;g.beginPath();g.ellipse(x,y-2,24,5,0,0,6.283);g.stroke();
 const bh=46+variant*7;g.strokeStyle=n.done?'#c9c6b4':'#8a8c9c';g.lineWidth=2.1;g.beginPath();g.moveTo(x,y-4);g.bezierCurveTo(x-12,y-15,x+10,y-bh*.8,x,y-bh);g.stroke();
 for(let j=0;j<4;j++){const a=(j-1.5)*(.24+k*.35),ln=(26+Math.sin(j*2)*4)*(1+k*.45);vk5Leaf(x,y-bh,a,ln,9,n.done?col:'#85899f',.88);}
 for(let j=0;j<2;j++)vk5Leaf(x,y-17-j*13,(j%2?1:-1)*.9,19+3*k,6,n.done?'#9ebfaf':'#657b87',.8);
 g.globalCompositeOperation='lighter';vk5Glow(col,x,y-bh-9,40+18*k,35+12*k,(.1+.3*k)*pulse);vk5Glow('#fff0bf',x,y-bh-13,5+3*k,5+3*k,.25+.5*k);g.globalCompositeOperation='source-over';
 // Waiting bud's little rising note is the interaction cue; words are unnecessary.
 if(!n.done){const a=(tm*.36+n.note*.31)%1;g.globalCompositeOperation='lighter';vk5Glow(col,x+Math.sin(a*3.14)*9,y-bh-14-a*29,5,7,Math.sin(a*Math.PI)*.4);g.globalCompositeOperation='source-over';}
}
function vk5GardenPower(o){let a=0;for(const n of o.nodes)if(n.done)a++;return a/o.nodes.length;}
function vk5GardenEnd(o){
 if(o.done)return;o.done=true;o.end=now;o.open=0;if(typeof V5!=='undefined')V5.bahce=Math.min(BOLUM.korTop,V5.bahce+1);lightTarget=Math.max(lightTarget,.42+(typeof V5!=='undefined'?V5.bahce:1)*.13);burst(o.x,o.y-90,34,[VK5_COL[o.sira],'#ffe4b3','#ffffff'],105,2.1,5);o.index=o.sira;OLAY.emit('korUyandi',o);if(typeof dragonHappy==='function')dragonHappy(o);
}
TUR.kaydet('korBahce',{
 kur(o){o.sira=o.sira||0;o.done=false;o.open=0;o.age=0;o.active=false;o.helper=0;o.nodes=o.nodes||[{x:o.x-120,y:o.y,note:0},{x:o.x,y:o.y,note:1},{x:o.x+120,y:o.y,note:2}];for(const n of o.nodes){n.done=false;n.t=-100;n.sicak=0;}},
 guncelle(o,dt){
  if(!(dt>0)||DURUM!=='oyun')return;if(o.done){o.open=Math.min(1,o.open+dt*.23);return;}
  const near=P.x>o.nodes[0].x-220&&P.x<o.nodes[o.nodes.length-1].x+300;if(!near)return;o.active=true;o.age+=dt;
  for(const n of o.nodes){if(n.done)continue;const dx=Math.abs(P.x-n.x),dy=Math.abs(P.y-n.y);if((dx<84&&dy<210)||(P.x>n.x+110&&P.x<n.x+750)){n.done=true;n.t=now;burst(n.x,n.y-52,12,[VK5_COL[o.sira],'#ffe3b1','#ffffff'],65,1.1,3.2);vk5Sfx('cicek',.45);OLAY.emit('volkanKristal',{index:n.note,notes:[0,4,7],source:'bahce'});}}
  // Pırıl gently reaches a missed bud when a child waits at the exit; no backtracking.
  if(o.age>17){o.helper+=dt;if(o.helper>2.5){const n=o.nodes.find(n=>!n.done);if(n){n.done=true;n.t=now;burst(n.x,n.y-50,13,[VK5_COL[o.sira],'#fff0c3'],70,1.1,3);}o.helper=0;}}
  if(o.nodes.every(n=>n.done))vk5GardenEnd(o);
 },
 ciz(o,tm){
  const col=VK5_COL[o.sira],power=vk5GardenPower(o),op=vk5Ease(o.open);g.save();g.lineCap='round';g.strokeStyle=power>.1?'rgba(236,202,162,.48)':'rgba(156,152,170,.3)';g.lineWidth=1.1;g.beginPath();for(let j=0;j<o.nodes.length;j++){const n=o.nodes[j];if(j)g.lineTo(n.x,n.y+1);else g.moveTo(n.x,n.y+1);}g.stroke();
  g.drawImage(vk5Stone(o.sira),o.x-140,o.y-94,280,160);
  // Each garden grows into a distinct paper silhouette: fan, fountain, lotus.
  if(o.sira===0){for(let j=0;j<9;j++){const a=(j-4)*(.12+op*.13)+Math.sin(tm*.4+j)*.015;vk5Leaf(o.x,o.y-9,a,52+power*34+(j%2)*19,15+op*4,power>.2?(j%2?col:'#d5ad9f'):'#8c8199',.9);}for(let j=0;j<3;j++)vk5Leaf(o.x,o.y-16,(j-1)*.25,85+op*45,19,col,.5+power*.4);}
  else if(o.sira===1){for(let j=0;j<7;j++){const a=(j-3)*(.2+op*.14),len=70+power*60+Math.sin(j)*17;g.save();g.translate(o.x,o.y-12);g.rotate(a);g.strokeStyle='#8facac';g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-20,-len*.5,18,-len*.8,0,-len);g.stroke();vk5Leaf(0,-len,Math.sin(tm*.6+j)*.08,30+op*20,14,col,.85);g.restore();}g.globalCompositeOperation='lighter';vk5Glow(col,o.x,o.y-65,120,80,.1+power*.14);g.globalCompositeOperation='source-over';}
  else{for(let layer=0;layer<2;layer++)for(let j=0;j<7;j++){const a=(j-3)*(.15+op*.18),ln=65+layer*25+power*25;g.save();g.translate(o.x,o.y-12-layer*12);g.rotate(a);g.scale(.36+layer*.08,.38+power*.16);g.drawImage(vk5Petal((j+layer)%3),-65,-255,130,270);g.restore();}}
  for(const n of o.nodes)vk5Node(n,tm,col,o.sira);g.restore();
  if(o.done){const age=now-o.end;if(age<5){const a=1-age/5;g.globalCompositeOperation='lighter';vk5Glow(col,o.x,o.y-55,90+age*85,45+age*35,a*.24);g.globalCompositeOperation='source-over';}}
 }
});
TUR.kaydet('buharBaca',{
 kur(o){o.age=0;o.cool=0;o.pressure=0;o.w=o.w||100;o.h=o.h||240;o.ph=o.x*.017;o.armed=true;},
 guncelle(o,dt){
  if(!(dt>0))return;o.age+=dt;o.cool=Math.max(0,o.cool-dt);o.pressure=Math.max(0,o.pressure-dt*.9);
  // One invitation per visit: standing still must not trap a child in an endless
  // automatic jumping loop. Walking away and back makes the toy available again.
  if(Math.abs(P.x-o.x)>o.w*.75)o.armed=true;
  if(DURUM==='oyun'&&!P.ucus&&P.fade<=0&&o.armed&&o.cool<=0&&P.ground&&Math.abs(P.x-o.x)<o.w*.43&&Math.abs(P.y-o.y)<24){P.vy=-Math.sqrt(2*2200*Math.min(180,o.h*.7));P.ground=false;P.dj=true;P.bounce=true;P.jumpT=0;P.air=0;P.coyote=0;o.armed=false;o.cool=2.8;o.pressure=1;burst(o.x,o.y-8,9,['#e6dfd5','#bfe4d6','#ffdcaf'],50,.7,3);OLAY.emit('buharZip',o);}
 },
 ciz(o,tm){
  const pulse=.7+.3*Math.sin(tm*1.2+o.ph),p=o.pressure,w=o.w;g.fillStyle='#45536b';g.beginPath();g.moveTo(o.x-w*.47,o.y+7);g.lineTo(o.x-w*.34,o.y-15);g.lineTo(o.x-w*.12,o.y-25);g.lineTo(o.x+w*.25,o.y-21);g.lineTo(o.x+w*.47,o.y+7);g.closePath();g.fill();g.fillStyle='#7d8797';g.beginPath();g.ellipse(o.x,o.y-10,w*.33,9,0,0,6.283);g.fill();g.fillStyle='#3c4c66';g.beginPath();g.ellipse(o.x,o.y-12,w*.24,4,0,0,6.283);g.fill();g.strokeStyle='rgba(255,224,187,.55)';g.lineWidth=1.1;g.beginPath();g.ellipse(o.x,o.y-12,w*.27,5,0,0,6.283);g.stroke();
  g.globalCompositeOperation='lighter';vk5Glow('#b2ddcf',o.x,o.y-12,w*.65,22,.15+p*.16);g.globalCompositeOperation='source-over';g.lineCap='round';
  for(let j=0;j<5;j++){g.strokeStyle=j%2?'#d9e1d8':'#ebdad1';g.lineWidth=2+j%2;g.globalAlpha=(.07+.04*pulse+p*.1)*(1-j*.08);g.beginPath();const bx=o.x+(j-2)*9,hh=o.h*(.38+p*.4);g.moveTo(bx,o.y-15);g.bezierCurveTo(bx-17+Math.sin(tm*.8+j)*7,o.y-hh*.35,bx+19,o.y-hh*.7,bx+Math.sin(tm*.7+j)*21,o.y-hh);g.stroke();}
  g.globalAlpha=1;for(let j=0;j<4;j++){const u=(tm*.35+j*.24+o.ph)%1;g.globalCompositeOperation='lighter';vk5Glow('#d8ead7',o.x+Math.sin(u*7+j)*12,o.y-20-u*o.h*.7,2.2,5.5,Math.sin(u*Math.PI)*(.2+p*.2));g.globalCompositeOperation='source-over';}
 }
});
TUR.kaydet('korBasamak',{
 kur(o){o.top=o.y;o.h=o.h||18;o.y+=o.h;o.cisim={w:o.w||110,h:o.h,tip:'ziplat',guc:o.guc||800,aktif:true};o.bounce=0;o.last=-10;},
 guncelle(o,dt){o.bounce=Math.max(0,o.bounce-dt*2);},
 ustune(o){o.bounce=1;if(now-o.last>1){o.last=now;burst(o.x,o.top-8,12,['#ffd395','#c6e5d8','#ffffff'],75,1,3);OLAY.emit('buharZip',o);}},
 ciz(o,tm){
  const w=o.cisim.w,b=Math.sin(o.bounce*Math.PI)*4;g.save();g.translate(o.x,o.top+b);g.fillStyle='#59657c';g.beginPath();g.moveTo(-w*.5,1);g.quadraticCurveTo(-w*.45,-17,-w*.1,-15);g.quadraticCurveTo(w*.31,-21,w*.5,1);g.lineTo(w*.36,20);g.lineTo(-w*.27,23);g.closePath();g.fill();g.strokeStyle='#b5b6b3';g.lineWidth=1;g.beginPath();g.moveTo(-w*.47,-1);g.quadraticCurveTo(0,-22,w*.47,-1);g.stroke();g.strokeStyle='#efc799';g.lineWidth=1.4;g.beginPath();g.moveTo(-w*.23,0);g.lineTo(-w*.06,-6);g.lineTo(w*.1,1);g.lineTo(w*.32,-4);g.stroke();g.globalCompositeOperation='lighter';vk5Glow('#ffcc91',0,-1,w*.6,22,.14+o.bounce*.3);g.globalCompositeOperation='source-over';g.restore();
 }
});
TUR.kaydet('volkanPerde',{
 kur(o){o.bag=null;o.open=false;o.fade=1;o.t=0;},
 guncelle(o,dt){
  o.t+=dt;if(!o.bag)o.bag=NESNELER.find(n=>n.id===o.bagId)||null;
  if(!o.open&&o.bag&&(o.bag.done||(o.stil==='kristal'&&typeof V5!=='undefined'&&V5.mini))){o.open=true;burst(o.x,o.y-80,22,['#fbd6a8','#a4d8ce','#e5b6dc'],100,1.5,4);}
  if(o.open){o.fade=Math.max(0,o.fade-dt*.65);return;}
  if(DURUM==='oyun'&&!P.ucus&&P.fade<=0&&P.x>o.x-20&&P.x<o.x+220){P.x=o.x-20;P.vx=Math.min(0,P.vx);}
 },
 ciz(o,tm){
  if(o.fade<=.002)return;g.save();g.lineCap='round';g.globalAlpha=o.fade*.55;g.strokeStyle='#b3bcb2';g.lineWidth=1.5;for(const side of[-1,1]){g.beginPath();g.moveTo(o.x+side*24,o.y);g.bezierCurveTo(o.x+side*42,o.y-70,o.x+side*24,o.y-120,o.x+side*8,o.y-187);g.stroke();for(let j=0;j<4;j++){const y=o.y-26-j*40,x=o.x+side*(29-j*4)+Math.sin(tm*.7+j)*2;vk5Leaf(x,y,side*(.5+Math.sin(tm*.7+j)*.05),21,7,j%2?'#c4afbf':'#b8c9bc',o.fade*.6);}}g.restore();g.globalCompositeOperation='lighter';vk5Glow('#d4d5be',o.x,o.y-110,25,110,o.fade*.1);for(let j=0;j<7;j++){const u=(tm*.15+j/7)%1;vk5Glow(j%2?'#ffd6a2':'#a9e0d2',o.x+Math.sin(u*6.28)*13,o.y-u*190,4,5,Math.sin(u*Math.PI)*o.fade*.4);}g.globalCompositeOperation='source-over';
 }
});
TUR.kaydet('volkanSus',{
 ciz(o,tm){if(typeof dn5Flora!=='function')return;const z=(o.z||1)*(o.v%2?.84:.68);g.save();g.translate(o.x,o.y+2);g.rotate(Math.sin(tm*.25+o.v)*.015);g.globalAlpha=.96;if(o.v%2&&typeof dn5Bloom==='function')g.drawImage(dn5Bloom(o.v===1?0:1),-155*z,-310*z,310*z,320*z);else g.drawImage(dn5Flora((o.v*2+4)%10),-140*z,-300*z,280*z,320*z);g.restore();}
});
function vk5FinalReady(){return typeof V5!=='undefined'&&V5.bahce>=BOLUM.korTop&&V5.mini&&V5.sal;}
function vk5Begin(o){
 if(o.started||!vk5FinalReady())return;o.started=true;o.age=0;VK5.final=o;P.kilit=Math.max(P.kilit||0,27);P.vx=0;P.buf=0;P.f=1;
 if(typeof omHepsiniBirak==='function')omHepsiniBirak();if(typeof V5!=='undefined')V5.final=true;
 OLAY.emit('volkanFinalBasla',{o,duration:26,box:{x0:o.x-390,x1:o.x+390,y0:o.y-500,y1:o.y+85}});lightTarget=1;
}
TUR.kaydet('korCicegi',{
 kur(o){o.started=false;o.done=false;o.age=0;o.glow=0;},
 dokun(o){if(vk5FinalReady())vk5Begin(o);else o.dokundu=false;},
 guncelle(o,dt){
  if(!(dt>0)||!o.started||o.done)return;o.age+=dt;
  if(o.age>6&&!o.wave){o.wave=true;burst(o.x,o.y-205,42,['#ffd7a0','#ffb6b3','#c5dcd0','#d0b8ee'],110,3.2,4);ripples.push({x:o.x,y:o.y-150,r:0,life:3});}
  if(o.age>14&&!o.crown){o.crown=true;burst(o.x,o.y-270,36,['#fff0c2','#ffd6a0','#efbad3'],100,3,4);}
  if(o.age>=26){o.done=true;if(typeof V5!=='undefined')V5.final=true;OLAY.emit('volkanTamam',o);}
 },
 ciz(o,tm){
  const a=o.started?o.age:0,opening=vk5Ease((a-1)/8),heart=vk5Ease((a-4)/5),lift=vk5Ease((a-10)/7),cx=o.x,cy=o.y-155-opening*40;g.save();
  // Broad mineral dais anchors the flower in this landscape.
  g.drawImage(vk5Stone(2),cx-220,o.y-58,440,126);g.strokeStyle='#829d9d';g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(cx,o.y-3);g.bezierCurveTo(cx-25,o.y-70,cx+23,cy+40,cx,cy);g.stroke();g.strokeStyle='rgba(211,215,178,.66)';g.lineWidth=1.5;g.beginPath();g.moveTo(cx-2,o.y-2);g.bezierCurveTo(cx-27,o.y-80,cx+19,cy+45,cx-3,cy);g.stroke();
  for(let j=0;j<6;j++){const side=j%2?1:-1,yy=o.y-24-Math.floor(j/2)*31;vk5Leaf(cx,yy,side*(.8+opening*.3),65+opening*25,17,j%3?'#98b6ac':'#aab9ad',.95);}
  // Three interlaced rings open slowly; each petal retains its folded paper seam.
  for(let layer=0;layer<3;layer++){const count=layer===0?9:7;for(let j=0;j<count;j++){const ang=(j-(count-1)*.5)*(layer===0?.07+opening*.24:.06+opening*.21),osc=Math.sin(tm*.45+j*.8+layer)*.012*opening,k=(layer===0?.78:layer===1?.62:.47)*(1+.08*Math.sin(tm*.3+layer)*opening);g.save();g.translate(cx,cy+layer*12);g.rotate(ang+osc);g.scale(k*(.72+opening*.28),k);g.globalAlpha=layer===0?.89:.97;g.drawImage(vk5Petal((layer+j%2)%3),-65,-255,130,270);g.restore();}}
  g.globalCompositeOperation='lighter';vk5Glow('#ffbe91',cx,cy-65,180+opening*110,180+opening*20,.1+heart*.18);vk5Glow('#ffe7b5',cx,cy-48,50+heart*30,60+heart*25,.17+heart*.4);vk5Glow('#fff3d0',cx,cy-48,9+heart*9,9+heart*9,.45+heart*.5);g.globalCompositeOperation='source-over';
  if(opening>.02){g.strokeStyle='rgba(251,231,187,.55)';g.lineWidth=1;for(let j=0;j<9;j++){const ang=(j-4)*.29,ln=40+heart*32;g.beginPath();g.moveTo(cx,cy-8);g.quadraticCurveTo(cx+Math.sin(ang)*ln,cy-35,cx+Math.sin(ang)*ln,cy-15-Math.cos(ang)*ln);g.stroke();g.fillStyle='#fff0c3';g.beginPath();g.ellipse(cx+Math.sin(ang)*ln,cy-15-Math.cos(ang)*ln,2.3,3.4,ang,0,6.283);g.fill();}}
  g.restore();
  if(o.started){g.globalCompositeOperation='lighter';for(let j=0;j<36;j++){const u=((a*.065+j/36)%1),rad=38+u*(130+lift*150),ang=j*2.399+tm*.15,x=cx+Math.cos(ang)*rad,y=cy-40-u*(160+lift*330)+Math.sin(ang)*40,fade=Math.sin(u*Math.PI)*heart;vk5Glow(DN5_COL[j%8],x,y,11+u*4,10,fade*.5);g.fillStyle='#fff1ca';g.globalAlpha=fade*.7;g.beginPath();g.ellipse(x,y,1.4,3,-ang,0,6.283);g.fill();}g.globalAlpha=1;g.globalCompositeOperation='source-over';
   // The narrator's golden birds are real folded silhouettes, with articulated
   // wings, distinct from the tiny light seeds already rising around the flower.
   if(a>=14)for(let j=0;j<9;j++){
    const u=(a-14-j*.34)/11.5;if(u<=0||u>=1)continue;const side=j%2?1:-1,up=vk5Ease(u),x=cx+side*(14+up*(105+j*15))+Math.sin(u*5.2+j)*up*24,y=cy-48-up*(290+j%3*40)-Math.sin(u*Math.PI)*22,alpha=Math.min(1,u/.1,(1-u)/.16);
    vk5FinalBird(x,y,.43+(j%3)*.045,tm,j*.91,side,alpha*.96);
   }
  }
 }
});

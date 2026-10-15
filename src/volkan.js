/* volkan.js — Yanardağın yaşayan bahçeleri, sıcak buhar oyuncakları ve Kor Çiçeği.
   Korku, hasar, zaman sınırı yok. Her tamamlanma olayı yalnız bir kez üretilir. */
'use strict';
const VK5={sprites:[],podiums:[],petals:[],birds:[],buds:[],vents:[],steps:[],leaves:new Map(),heart:null,seed:null,warm:0,final:null,point:{x:0,y:0},hitPoint:{x:0,y:0}};
const VK5_COL=['#e83d68','#9a3fc1','#c92e8a'];
const VK5_GLOW_COL=['#f3ad65','#ecb06d','#efa65e','#eaa266','#ffc87b','#e83d68','#9a3fc1','#c92e8a'];
const VK5_LEAF_COL=['#e83d68','#9a3fc1','#c92e8a','#b72f63','#7c3ea6','#a33491','#577e88','#5a8392','#447a88','#7857a4','#7e49a3','#993454','#536c86','#406e7b','#5e8392','#829d9d','#9ebfaf','#657b87','#d5ad9f','#8c8199','#8facac','#c4afbf','#b8c9bc','#98b6ac','#aab9ad'];
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
 if(VK5.petals[v])return VK5.petals[v];const cv=vk5Cv(260,540),c=cv.getContext('2d');c.scale(2,2);const colors=[['#ff8290','#d82962','#5e214e'],['#d76bd0','#8c2bab','#3c1e63'],['#ec4f9b','#aa247a','#481d59']],co=colors[v%3],gr=c.createLinearGradient(-15,25,105,225);gr.addColorStop(0,co[0]);gr.addColorStop(.42,co[1]);gr.addColorStop(1,co[2]);c.fillStyle=gr;c.beginPath();c.moveTo(65,255);c.bezierCurveTo(24,207,-1,91,65,9);c.bezierCurveTo(135,89,110,211,65,255);c.fill();c.strokeStyle='#3a244d';c.lineWidth=1.6;c.stroke();
 c.save();c.beginPath();c.moveTo(65,255);c.bezierCurveTo(24,207,-1,91,65,9);c.bezierCurveTo(135,89,110,211,65,255);c.clip();c.fillStyle='rgba(255,206,192,.09)';c.beginPath();c.moveTo(65,9);c.lineTo(65,255);c.bezierCurveTo(45,207,34,92,65,9);c.fill();c.strokeStyle='rgba(255,195,202,.23)';c.lineWidth=.75;for(let j=0;j<8;j++){const y=58+j*22;c.beginPath();c.moveTo(65,y+18);c.quadraticCurveTo(40,y+3,26+j*.8,y-23);c.moveTo(65,y+18);c.quadraticCurveTo(91,y+3,102-j*.8,y-23);c.stroke();}c.restore();c.strokeStyle='rgba(255,204,202,.52)';c.lineWidth=.9;c.beginPath();c.moveTo(65,250);c.quadraticCurveTo(60,118,65,12);c.stroke();c.strokeStyle='rgba(255,184,172,.43)';c.beginPath();c.moveTo(65,9);c.bezierCurveTo(12,80,26,180,52,226);c.stroke();VK5.petals[v]=cv;return cv;
}
function vk5Stone(v){
 if(VK5.sprites[v])return VK5.sprites[v];const cv=vk5Cv(560,320),c=cv.getContext('2d');c.scale(2,2);const R=rng(937+v*53),color=['#3c3b60','#364660','#4e315d'][v%3];
 // Sculpted basalt garden basin, warm mineral inlay and a small ring of pebbles.
 c.fillStyle='rgba(25,33,57,.18)';c.beginPath();c.ellipse(140,126,125,20,0,0,6.283);c.fill();
 const gr=c.createLinearGradient(0,74,0,137);gr.addColorStop(0,'#8f7c8f');gr.addColorStop(.15,color);gr.addColorStop(.65,'#2f3453');gr.addColorStop(1,'#222e49');c.fillStyle=gr;c.beginPath();c.moveTo(19,96);c.lineTo(42,81);c.lineTo(235,81);c.lineTo(263,99);c.lineTo(244,126);c.lineTo(195,139);c.lineTo(71,136);c.lineTo(30,119);c.closePath();c.fill();
 c.fillStyle='#777b8b';c.beginPath();c.ellipse(140,94,112,19,0,0,6.283);c.fill();c.fillStyle='#4b536b';c.beginPath();c.ellipse(140,93,98,12,0,0,6.283);c.fill();c.strokeStyle='rgba(255,218,170,.54)';c.lineWidth=1.2;c.beginPath();c.ellipse(140,93,103,14,0,0,6.283);c.stroke();
 for(let j=0;j<15;j++){const a=j*6.283/15,x=140+Math.cos(a)*100,y=94+Math.sin(a)*14;c.strokeStyle='rgba(233,201,176,.4)';c.lineWidth=.9;c.beginPath();c.moveTo(x,y+2);c.lineTo(x+(R()-.5)*8,y+10+R()*12);c.stroke();}
 for(let j=0;j<12;j++){c.fillStyle=j%3?'#aa9a9d':'#ddba9b';c.beginPath();c.ellipse(29+R()*222,123+R()*14,2+R()*5,1.5+R()*2,0,0,6.283);c.fill();}VK5.sprites[v]=cv;return cv;
}
function vk5HeartArt(){
 if(VK5.heart)return VK5.heart;const cv=vk5Cv(120,160),c=cv.getContext('2d');c.scale(2,2);const gr=c.createLinearGradient(11,10,47,70);gr.addColorStop(0,'#ffe092');gr.addColorStop(.35,'#f7b450');gr.addColorStop(1,'#aa5c48');c.fillStyle=gr;c.strokeStyle='#733956';c.lineWidth=2.5;c.beginPath();c.moveTo(30,5);c.bezierCurveTo(13,22,5,45,16,61);c.quadraticCurveTo(30,79,45,59);c.bezierCurveTo(54,41,46,22,30,5);c.fill();c.stroke();c.fillStyle='#ffd783';c.beginPath();c.moveTo(30,10);c.lineTo(22,43);c.lineTo(30,66);c.lineTo(38,42);c.closePath();c.fill();c.strokeStyle='#ffecb5';c.lineWidth=1.2;c.beginPath();c.moveTo(28,14);c.quadraticCurveTo(19,38,25,54);c.stroke();c.strokeStyle='#c47d45';c.lineWidth=.8;for(let j=0;j<4;j++){c.beginPath();c.moveTo(30,27+j*8);c.lineTo(38-j,35+j*6);c.stroke();}VK5.heart=cv;return cv;
}
function vk5PodiumArt(v){
 if(VK5.podiums[v])return VK5.podiums[v];const cv=vk5Cv(220,150),c=cv.getContext('2d');c.scale(2,2);const co=v===1?'#593852':'#4c3b58',gr=c.createLinearGradient(25,27,80,65);gr.addColorStop(0,'#947189');gr.addColorStop(.3,co);gr.addColorStop(1,'#2d2c45');c.fillStyle='rgba(30,25,48,.2)';c.beginPath();c.ellipse(55,62,47,8,0,0,6.283);c.fill();c.fillStyle=gr;c.beginPath();c.moveTo(8,34);c.lineTo(25,23);c.lineTo(65,20);c.lineTo(101,31);c.lineTo(96,51);c.lineTo(70,63);c.lineTo(29,59);c.lineTo(12,47);c.closePath();c.fill();c.fillStyle='#735267';c.beginPath();c.ellipse(55,32,43,12,0,0,6.283);c.fill();c.fillStyle='#3f3049';c.beginPath();c.ellipse(55,31,34,7,0,0,6.283);c.fill();c.strokeStyle='#de9c79';c.lineWidth=1.3;c.beginPath();c.ellipse(55,32,40,10,0,0,6.283);c.stroke();c.strokeStyle='#b76b70';c.lineWidth=.8;for(let j=0;j<7;j++){const x=23+j*10;c.beginPath();c.moveTo(x,43+Math.sin(j)*3);c.lineTo(x+3,49);c.lineTo(x-1,55);c.stroke();}c.fillStyle='#e7b27b';for(let j=0;j<5;j++){const x=30+j*13,y=35+Math.sin(j*.9)*3;c.beginPath();c.moveTo(x,y-2);c.lineTo(x+1.8,y);c.lineTo(x,y+2);c.lineTo(x-1.8,y);c.closePath();c.fill();}VK5.podiums[v]=cv;return cv;
}
function vk5BudArt(v,opened){
 const key=v*2+(opened?1:0);if(VK5.buds[key])return VK5.buds[key];const cv=vk5Cv(200,220),c=cv.getContext('2d');c.scale(2,2);c.translate(50,52);const co=v===0?['#fa6b87','#d63161','#68274e']:v===1?['#c56be0','#8e30b8','#412455']:['#f25aa5','#c12986','#582451'];
 c.fillStyle=co[2];c.beginPath();c.ellipse(0,7,32,32,0,0,6.283);c.fill();
 for(let layer=0;layer<2;layer++)for(let j=0;j<(opened?8:6);j++){
  const count=opened?8:6,len=(layer?28:42)*(opened?1:1-v*.04),ww=layer?15:21;c.save();c.rotate(j*6.283/count+layer*.38+v*.12);const gr=c.createLinearGradient(-ww,-len,ww,6);gr.addColorStop(0,co[0]);gr.addColorStop(.42,co[1]);gr.addColorStop(1,co[2]);c.fillStyle=gr;c.strokeStyle=v===1?'#663570':'#79314f';c.lineWidth=1.25;c.beginPath();c.moveTo(0,11);c.bezierCurveTo(-ww,-len*.12,-ww*.96,-len*.68,0,-len);c.bezierCurveTo(ww*.94,-len*.72,ww,-len*.12,0,11);c.fill();c.stroke();c.fillStyle='rgba(76,27,62,.14)';c.beginPath();c.moveTo(0,-len);c.lineTo(0,11);c.quadraticCurveTo(ww*.8,-len*.2,0,-len);c.fill();c.strokeStyle='rgba(255,193,201,.4)';c.lineWidth=.65;c.beginPath();c.moveTo(0,4);c.lineTo(0,-len+3);c.stroke();c.restore();
 }
 c.fillStyle='#99485c';c.beginPath();c.arc(0,0,14,0,6.283);c.fill();const seed=c.createLinearGradient(-9,-11,9,12);seed.addColorStop(0,'#ffe3a0');seed.addColorStop(.47,'#f8c76c');seed.addColorStop(1,'#dc974e');c.fillStyle=seed;c.beginPath();c.arc(0,0,11.7,0,6.283);c.fill();c.fillStyle='#ffe8ab';c.beginPath();c.moveTo(-7,-7);c.lineTo(1,-10);c.lineTo(5,-3);c.lineTo(-3,2);c.closePath();c.fill();c.strokeStyle='#ba7955';c.lineWidth=.65;for(let j=0;j<5;j++){const a=j*6.283/5+.25;c.beginPath();c.moveTo(Math.cos(a)*6,Math.sin(a)*6);c.lineTo(Math.cos(a)*8.7,Math.sin(a)*8.7);c.stroke();}
 if(!opened){c.strokeStyle='rgba(255,190,120,.78)';c.lineWidth=1.1;for(let j=0;j<6;j++){c.save();c.rotate(j*6.283/6+v*.12);c.beginPath();c.moveTo(-13,-25);c.quadraticCurveTo(-8,-37,0,-40);c.stroke();c.restore();}}
 else{c.strokeStyle='#e8b47f';c.lineWidth=.85;for(let j=0;j<8;j++){const a=j*6.283/8;c.beginPath();c.moveTo(Math.cos(a)*11,Math.sin(a)*11);c.quadraticCurveTo(Math.cos(a)*21,Math.sin(a)*19,Math.cos(a)*26,Math.sin(a)*23);c.stroke();c.fillStyle='#e8b47f';c.beginPath();c.ellipse(Math.cos(a)*26,Math.sin(a)*23,1.3,2.1,a,0,6.283);c.fill();}}
 VK5.buds[key]=cv;return cv;
}
function vk5LeafArt(col){
 if(VK5.leaves.has(col))return VK5.leaves.get(col);const cv=vk5Cv(120,240),c=cv.getContext('2d');c.scale(2,2);const gr=c.createLinearGradient(11,25,51,109);gr.addColorStop(0,mixc(col,'#ffc7b8',.24));gr.addColorStop(.48,col);gr.addColorStop(.49,mixc(col,'#23324a',.24));gr.addColorStop(1,mixc(col,'#182d42',.58));c.fillStyle=gr;c.beginPath();c.moveTo(30,113);c.bezierCurveTo(4,86,5,39,30,7);c.bezierCurveTo(56,38,56,82,30,113);c.fill();c.strokeStyle='rgba(32,33,58,.65)';c.lineWidth=1;c.stroke();c.strokeStyle='rgba(248,197,182,.45)';c.lineWidth=1;c.beginPath();c.moveTo(30,110);c.quadraticCurveTo(26,52,30,10);c.stroke();c.lineWidth=.65;for(let j=0;j<6;j++){const yy=30+j*12,wide=Math.sin((yy-7)/106*Math.PI)*17;c.beginPath();c.moveTo(29,yy+12);c.lineTo(30-wide,yy);c.moveTo(29,yy+12);c.lineTo(30+wide,yy);c.stroke();}VK5.leaves.set(col,cv);return cv;
}
function vk5SeedArt(){
 if(VK5.seed)return VK5.seed;const cv=vk5Cv(96,128),c=cv.getContext('2d');c.scale(2,2);const gr=c.createLinearGradient(13,11,33,49);gr.addColorStop(0,'#ffde8d');gr.addColorStop(.4,'#efac4e');gr.addColorStop(1,'#b36749');c.fillStyle=gr;c.strokeStyle='#9b4f5f';c.lineWidth=1.3;c.beginPath();c.moveTo(24,10);c.bezierCurveTo(35,21,38,36,31,45);c.quadraticCurveTo(23,55,16,45);c.bezierCurveTo(9,36,13,21,24,10);c.fill();c.stroke();c.fillStyle='#ffd67d';c.beginPath();c.moveTo(24,13);c.lineTo(19,32);c.lineTo(24,47);c.lineTo(29,32);c.closePath();c.fill();c.strokeStyle='#ffe9a6';c.lineWidth=.9;c.beginPath();c.moveTo(22,17);c.quadraticCurveTo(16,28,18,36);c.stroke();
 // A folded ruby husk distinguishes the collectible from an action flower.
 c.fillStyle='#9b3b6d';c.strokeStyle='#683456';c.lineWidth=.85;c.beginPath();c.moveTo(23,51);c.quadraticCurveTo(9,47,8,33);c.quadraticCurveTo(19,37,23,51);c.fill();c.stroke();c.fillStyle='#c15483';c.beginPath();c.moveTo(24,51);c.quadraticCurveTo(39,44,40,29);c.quadraticCurveTo(28,35,24,51);c.fill();c.stroke();c.strokeStyle='#e498a1';c.lineWidth=.6;c.beginPath();c.moveTo(12,38);c.lineTo(22,49);c.moveTo(37,34);c.lineTo(26,48);c.stroke();VK5.seed=cv;return cv;
}
function vk5SeedAt(x,y,size,rot,alpha){
 g.save();g.translate(x,y);g.rotate(rot);g.globalAlpha=alpha;g.drawImage(vk5SeedArt(),-14*size,-21*size,28*size,37.3*size);g.restore();
}
function vk5VentArt(v){
 if(VK5.vents[v])return VK5.vents[v];const cv=vk5Cv(360,220),c=cv.getContext('2d');c.scale(2,2);const co=v===0?'#4b4264':v===1?'#3c4c67':'#57395f';c.fillStyle='rgba(24,28,47,.24)';c.beginPath();c.ellipse(90,95,77,10,0,0,6.283);c.fill();
 const gr=c.createLinearGradient(34,26,142,100);gr.addColorStop(0,'#8d7e91');gr.addColorStop(.32,co);gr.addColorStop(.72,'#30324f');gr.addColorStop(1,'#222b44');c.fillStyle=gr;c.strokeStyle='#252b43';c.lineWidth=2;c.beginPath();c.moveTo(13,83);c.lineTo(28,49);c.lineTo(53,48);c.lineTo(63,29);c.lineTo(107,23);c.lineTo(128,43);c.lineTo(151,43);c.lineTo(169,84);c.lineTo(145,100);c.lineTo(39,101);c.closePath();c.fill();c.stroke();
 c.fillStyle='rgba(161,141,157,.17)';c.beginPath();c.moveTo(63,29);c.lineTo(59,67);c.lineTo(27,90);c.lineTo(28,49);c.lineTo(53,48);c.closePath();c.fill();c.fillStyle='rgba(25,26,47,.3)';c.beginPath();c.moveTo(128,43);c.lineTo(117,75);c.lineTo(145,100);c.lineTo(169,84);c.lineTo(151,43);c.closePath();c.fill();
 c.fillStyle='#78677f';c.beginPath();c.ellipse(90,54,47,15,-.03,0,6.283);c.fill();c.strokeStyle='#c6a182';c.lineWidth=1.6;c.stroke();c.fillStyle='#29263e';c.beginPath();c.ellipse(90,53,35,9,-.03,0,6.283);c.fill();c.fillStyle='#b86764';c.beginPath();c.ellipse(90,54,27,5.5,-.03,0,6.283);c.fill();c.fillStyle='#efb66e';c.beginPath();c.ellipse(88,54,15,2.7,-.03,0,6.283);c.fill();
 c.strokeStyle='#b58d88';c.lineWidth=1;for(let j=0;j<7;j++){const xx=39+j*17;c.beginPath();c.moveTo(xx,68+Math.sin(j)*5);c.lineTo(xx+4,80);c.lineTo(xx-3,88);c.stroke();}c.strokeStyle='#e1b18a';c.lineWidth=.65;c.beginPath();c.moveTo(28,49);c.lineTo(53,48);c.lineTo(63,29);c.lineTo(107,23);c.stroke();
 for(let j=0;j<3;j++){c.save();c.translate(65+j*25,81+j%2*4);c.rotate((j-1)*.22);c.drawImage(vk5HeartArt(),-4,-7,8,11);c.restore();}VK5.vents[v]=cv;return cv;
}
function vk5StepArt(v){
 if(VK5.steps[v])return VK5.steps[v];const cv=vk5Cv(440,160),c=cv.getContext('2d');c.scale(2,2);const co=v===0?'#464464':v===1?'#454e69':'#573c65';
 c.fillStyle='rgba(27,28,49,.22)';c.beginPath();c.ellipse(110,63,101,11,0,0,6.283);c.fill();const gr=c.createLinearGradient(40,16,159,70);gr.addColorStop(0,'#8e8196');gr.addColorStop(.3,co);gr.addColorStop(1,'#272d47');c.fillStyle=gr;c.strokeStyle='#262a43';c.lineWidth=2;c.beginPath();c.moveTo(8,30);c.lineTo(35,14);c.lineTo(91,8);c.lineTo(157,12);c.lineTo(209,29);c.lineTo(188,56);c.lineTo(146,69);c.lineTo(62,65);c.lineTo(26,54);c.closePath();c.fill();c.stroke();
 c.fillStyle='rgba(184,155,168,.22)';c.beginPath();c.moveTo(8,30);c.lineTo(35,14);c.lineTo(91,8);c.lineTo(106,30);c.closePath();c.fill();c.fillStyle='#30314c';c.beginPath();c.moveTo(106,30);c.lineTo(146,69);c.lineTo(62,65);c.lineTo(26,54);c.closePath();c.fill();c.strokeStyle='#c7a385';c.lineWidth=1.2;c.beginPath();c.moveTo(12,30);c.lineTo(106,32);c.lineTo(205,29);c.stroke();
 c.strokeStyle='#8e627f';c.lineWidth=1.2;c.beginPath();c.ellipse(110,26,62,10,0,0,6.283);c.stroke();c.strokeStyle='#f0b875';c.lineWidth=1.1;for(let j=0;j<3;j++){const xx=87+j*23;c.beginPath();c.moveTo(xx-7,29);c.lineTo(xx,19);c.lineTo(xx+7,29);c.stroke();}c.drawImage(vk5HeartArt(),102,16,16,21);
 c.strokeStyle='rgba(213,175,163,.38)';c.lineWidth=.7;for(let j=0;j<9;j++){const xx=38+j*18;c.beginPath();c.moveTo(xx,39+Math.sin(j)*3);c.lineTo(xx+4,47);c.lineTo(xx-2,53);c.stroke();}VK5.steps[v]=cv;return cv;
}
function vk5Warm(){
 if(VK5.warm<3){vk5Petal(VK5.warm++);return false;}if(VK5.warm<6){const v=VK5.warm++-3;vk5Stone(v);vk5PodiumArt(v);return false;}if(VK5.warm<9){vk5BirdArt(VK5.warm++-6);return false;}if(VK5.warm<15){const i=VK5.warm++-9;vk5BudArt(Math.floor(i/2),!!(i%2));return false;}
 if(VK5.warm<15+VK5_LEAF_COL.length){vk5LeafArt(VK5_LEAF_COL[VK5.warm++-15]);return false;}const next=15+VK5_LEAF_COL.length;if(VK5.warm===next){vk5HeartArt();vk5SeedArt();VK5.warm++;return false;}if(VK5.warm<next+4){vk5VentArt(VK5.warm++-next-1);return false;}if(VK5.warm<next+7){vk5StepArt(VK5.warm++-next-4);return false;}if(VK5.warm<next+11){const i=(VK5.warm++-next-7)*2;glow(VK5_GLOW_COL[i]);glow(VK5_GLOW_COL[i+1]);return false;}return true;
}
function vk5Leaf(x,y,ang,len,w,col,alpha){
 g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=alpha;g.drawImage(vk5LeafArt(col),-w*1.3,-len,w*2.6,len*1.06);g.restore();
}
function vk5GardenPosition(o,index,tm,out){
 const n=o.nodes[index];if(!n)return null;const p=out||{},k=n.done?vk5Ease(Math.max(0,now-n.t)/1.35):0,near=clamp(1-Math.abs(P.x-n.x)/350,0,1);p.x=n.x+Math.sin(tm*.85+n.note)*2+clamp((P.x-n.x)/230,-1,1)*near*7;p.y=n.y-82-o.sira*7-k*6+Math.sin(tm*1.25+n.note)*1.8;return p;
}
function vk5Pollen(x,y,tm,phase,strength){
 if(strength<=.01)return;g.save();g.fillStyle='#edb872';for(let j=0;j<5;j++){const u=(tm*.22+j/5+phase)%1,a=j*2.399+tm*.27,xx=x+Math.cos(a)*(29+u*26),yy=y+14-u*75;g.globalAlpha=Math.sin(u*Math.PI)*strength;g.save();g.translate(xx,yy);g.rotate(a);g.beginPath();g.moveTo(0,-2.1);g.quadraticCurveTo(2.5,-1,1.4,2.1);g.lineTo(-1.1,.9);g.closePath();g.fill();g.restore();}g.restore();
}
function vk5TapFlight(n,hx,hy,tm){
 if(!n.waking)return;const u=vk5Ease(clamp(n.wakeAge/n.wakeDuration,0,1)),sx=n.wakeFromX,sy=n.wakeFromY,mx=(sx+hx)*.5,my=Math.min(sy,hy)-38;g.save();g.lineCap='round';g.strokeStyle='rgba(239,169,112,.3)';g.lineWidth=1.1;g.beginPath();for(let j=0;j<=10;j++){const t=u*j/10,m=1-t,x=m*m*sx+2*m*t*mx+t*t*hx,y=m*m*sy+2*m*t*my+t*t*hy;j?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();for(let j=0;j<5;j++){const t=Math.max(0,u-j*.035),m=1-t,x=m*m*sx+2*m*t*mx+t*t*hx,y=m*m*sy+2*m*t*my+t*t*hy;g.globalAlpha=(1-j/6)*.85;g.fillStyle=j%2?'#eaaa72':'#ed7a86';g.save();g.translate(x,y);g.rotate(tm*.8+j);g.beginPath();g.moveTo(0,-3.5);g.lineTo(2.3,0);g.lineTo(0,3.5);g.lineTo(-1.7,0);g.closePath();g.fill();g.restore();}g.restore();
}
function vk5Node(o,n,index,tm,col,variant,focused){
 const age=n.done?Math.max(0,now-n.t):99,k=n.done?vk5Ease(age/1.35):0,x=n.x,y=n.y,near=clamp(1-Math.abs(P.x-x)/350,0,1),p=vk5GardenPosition(o,index,tm,VK5.point),hx=p.x,hy=p.y,invite=!n.done&&focused?(.5+.5*Math.sin(tm*2.25+n.note*.35))*(.35+near*.65):0;
 g.drawImage(vk5PodiumArt(variant),x-55,y-32,110,75);
 g.lineCap='round';g.strokeStyle='#493047';g.lineWidth=5;g.beginPath();g.moveTo(x,y-4);g.bezierCurveTo(x-12,y-18,hx+9,hy+19,hx,hy);g.stroke();g.strokeStyle=variant===1?'#7857a4':'#577e88';g.lineWidth=2.6;g.stroke();
 for(let j=0;j<3;j++)vk5Leaf(x+(j%2?2:-2),y-12-j*17,(j%2?1:-1)*(.85+k*.12+invite*.09),29+k*8,9,j%2?'#577e88':variant===1?'#7c3ea6':'#b72f63',1);
 const rebound=n.done?Math.sin(Math.min(age,1.2)*14)*Math.exp(-age*3.8)*.13:invite*.035+(n.sicak||0)*.045,scale=(1-k*.06)*(1+rebound);
 g.save();g.translate(hx,hy);g.rotate(Math.sin(tm*.7+n.note)*.028+clamp((P.x-x)/220,-1,1)*near*.045-k*.26);g.scale(scale,scale*(1-k*.18));
 if(!n.done)for(let j=0;j<3;j++){g.save();g.translate(0,9);g.rotate((j-1)*(1.15+invite*.16));g.drawImage(vk5Petal(variant),-14,-52-invite*6,28,58+invite*6);g.restore();}
 g.globalAlpha=1-k;g.drawImage(vk5BudArt(variant,false),-50,-52,100,110);if(k>.001){g.globalAlpha=k;g.drawImage(vk5BudArt(variant,true),-55,-57.2,110,121);}g.restore();
 if(!n.done&&focused){vk5Pollen(hx,hy,tm,n.note*.17,.28+invite*.24);g.globalCompositeOperation='lighter';vk5Glow('#f3ad65',hx,hy,27,29,.045+invite*.055);g.globalCompositeOperation='source-over';}
 vk5TapFlight(n,hx,hy,tm);
 if(n.done&&age<1.4){g.globalCompositeOperation='lighter';vk5Glow('#f3ad65',hx,hy,20,20,Math.sin(age/1.4*Math.PI)*.14);g.globalCompositeOperation='source-over';}
}
function vk5GardenPower(o){let a=0;for(const n of o.nodes)if(n.done)a++;return a/o.nodes.length;}
function vk5GardenEnd(o){
 if(o.done)return;o.done=true;o.end=now;o.open=0;if(typeof V5!=='undefined')V5.bahce=Math.min(BOLUM.korTop,V5.bahce+1);lightTarget=Math.max(lightTarget,.42+(typeof V5!=='undefined'?V5.bahce:1)*.13);burst(o.x,o.y-90,34,[VK5_COL[o.sira],'#ffe4b3','#ffffff'],105,2.1,5);o.index=o.sira;OLAY.emit('korUyandi',o);if(typeof dragonHappy==='function')dragonHappy(o);
}
function vk5WakeNode(o,n,source){
 if(o.done||n.done)return false;n.done=true;n.t=now;n.waking=false;n.wakeAge=0;n.sicak=1;n.activationSource=source;burst(n.x,n.y-82,12,[VK5_COL[o.sira],'#ffe3b1','#ffffff'],65,1.1,3.2);vk5Sfx('cicek',source==='help'?.28:.45);OLAY.emit('volkanKristal',{index:n.note,notes:[0,4,7],source:'bahce',interaction:source});if(o.nodes.every(n=>n.done))vk5GardenEnd(o);return true;
}
function vk5TapNode(o,n){
 if(o.done||n.done)return false;n.sicak=1;if(n.waking)return true;n.waking=true;n.wakeAge=0;n.wakeFromX=D.x+(n.x>D.x?13:-13);n.wakeFromY=D.y-10;n.wakeDuration=clamp(Math.hypot(n.x-D.x,n.y-82-D.y)/700,.4,.95);OLAY.emit('volkanBahceDokun',{o,node:n,index:n.note});return true;
}
// This module is loaded for dream five only. Merge drawing hooks while retaining
// the shared seed pickup/update/save contract and the other dreams' artwork.
TUR.kaydet('tohum',{
 ciz(o,tm){
  if(o.done||o.x<cam.x-80||o.x>cam.x+VW+80)return;const ph=o.ph||0,x=o.x,y=o.y-24+Math.sin(tm*1.4+ph)*2.3;
  g.save();g.globalCompositeOperation='lighter';vk5Glow('#ffc87b',x,y,24,27,.12+Math.sin(tm*1.6+ph)*.025);g.restore();vk5SeedAt(x,y,1.05,Math.sin(tm*.9+ph)*.08,1);
  g.save();g.strokeStyle='#e7ae71';g.lineWidth=.7;g.globalAlpha=.5;for(let j=0;j<2;j++){const a=tm*.65+ph+j*Math.PI,xx=x+Math.cos(a)*15,yy=y+Math.sin(a)*6;g.beginPath();g.moveTo(xx,yy-1.5);g.lineTo(xx+1.1,yy);g.lineTo(xx,yy+1.5);g.lineTo(xx-1.1,yy);g.closePath();g.stroke();}g.restore();
 },
 cizOn(o,tm){
  if(!(o.al>=0&&o.al<1))return;const a=o.al;let x,y,size,alpha=1;
  if(a<.28){const k=vk5Ease(a/.28);x=o.fx;y=o.fy-k*34;size=1.05+k*.2;}
  else{const k=vk5Ease((a-.28)/.72),sx=o.fx,sy=o.fy-34,ex=D.x,ey=D.y,mx=(sx+ex)*.5,my=Math.min(sy,ey)-90,m=1-k;x=m*m*sx+2*m*k*mx+k*k*ex;y=m*m*sy+2*m*k*my+k*k*ey;size=1.25-k*.85;alpha=1-Math.max(0,(k-.85)/.15);
   for(let j=1;j<=5;j++){const u=Math.max(0,k-j*.037),n=1-u,xx=n*n*sx+2*n*u*mx+u*u*ex,yy=n*n*sy+2*n*u*my+u*u*ey;vk5SeedAt(xx,yy,.12+(5-j)*.023,-.2+j*.12,(1-j/6)*.33*alpha);}
  }
  g.save();g.globalCompositeOperation='lighter';vk5Glow('#ffc87b',x,y,18*size,19*size,.14*alpha);g.restore();vk5SeedAt(x,y,size,Math.sin(tm*2+a*7)*.18,alpha);
 }
});
TUR.kaydet('korBahce',{
 kur(o){o.sira=o.sira||0;o.done=false;o.open=0;o.age=0;o.active=false;o.helper=0;o.nodes=o.nodes||[{x:o.x-120,y:o.y,note:0},{x:o.x,y:o.y,note:1},{x:o.x+120,y:o.y,note:2}];for(const n of o.nodes){n.done=false;n.t=-100;n.sicak=0;n.waking=false;n.wakeAge=0;n.wakeDuration=.4;n.wakeFromX=n.x;n.wakeFromY=n.y-82;}},
 guncelle(o,dt){
  if(!(dt>0)||!Number.isFinite(dt)||DURUM!=='oyun')return;for(const n of o.nodes){n.sicak=Math.max(0,n.sicak-dt*2.2);if(n.waking&&!n.done){n.wakeAge+=dt;if(n.wakeAge>=n.wakeDuration)vk5WakeNode(o,n,'touch');}}if(o.done){o.open=Math.min(1,o.open+dt*.23);return;}
  const near=P.x>o.nodes[0].x-220&&P.x<o.nodes[o.nodes.length-1].x+300;if(!near)return;o.active=true;o.age+=dt;
  for(const n of o.nodes){if(n.done)continue;const dx=Math.abs(P.x-n.x),dy=Math.abs(P.y-n.y);if((dx<84&&dy<210)||(P.x>n.x+110&&P.x<n.x+750))vk5WakeNode(o,n,'approach');}
  // Pırıl gently reaches a missed bud when a child waits at the exit; no backtracking.
  if(o.age>17){o.helper+=dt;if(o.helper>2.5){const n=o.nodes.find(n=>!n.done);if(n)vk5WakeNode(o,n,'help');o.helper=0;}}
  if(o.nodes.every(n=>n.done))vk5GardenEnd(o);
 },
 ciz(o,tm){
  const col=VK5_COL[o.sira],power=vk5GardenPower(o),op=vk5Ease(o.open);g.save();g.lineCap='round';g.strokeStyle=power>.1?'rgba(236,202,162,.48)':'rgba(156,152,170,.3)';g.lineWidth=1.1;g.beginPath();for(let j=0;j<o.nodes.length;j++){const n=o.nodes[j];if(j)g.lineTo(n.x,n.y+1);else g.moveTo(n.x,n.y+1);}g.stroke();
  g.drawImage(vk5Stone(o.sira),o.x-140,o.y-94,280,160);
  // Each garden grows into a distinct paper silhouette: fan, fountain, lotus.
  if(o.sira===0){for(let j=0;j<9;j++){const a=(j-4)*(.12+op*.13)+Math.sin(tm*.4+j)*.015;vk5Leaf(o.x,o.y-9,a,52+power*34+(j%2)*19,15+op*4,j%2?col:'#b72f63',1);}for(let j=0;j<3;j++)vk5Leaf(o.x,o.y-16,(j-1)*.25,85+op*45,19,col,1);}
  else if(o.sira===1){for(let j=0;j<7;j++){const a=(j-3)*(.2+op*.14)+Math.sin(tm*.45+j)*.018,len=70+power*60+Math.sin(j)*17;g.save();g.translate(o.x,o.y-12);g.rotate(a);g.strokeStyle='#362c50';g.lineWidth=4;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-20,-len*.5,18,-len*.8,0,-len);g.stroke();g.strokeStyle='#7857a4';g.lineWidth=2;g.stroke();vk5Leaf(0,-len,Math.sin(tm*.6+j)*.08,30+op*20,14,j%2?col:'#7c3ea6',1);g.drawImage(vk5HeartArt(),-4,-len-8,8,11);g.restore();}}
  else{for(let layer=0;layer<2;layer++)for(let j=0;j<7;j++){const a=(j-3)*(.15+op*.18),ln=65+layer*25+power*25;g.save();g.translate(o.x,o.y-12-layer*12);g.rotate(a);g.scale(.36+layer*.08,.38+power*.16);g.drawImage(vk5Petal((j+layer)%3),-65,-255,130,270);g.restore();}}
  let focus=-1,best=1e12;for(let j=0;j<o.nodes.length;j++){const n=o.nodes[j];if(n.done)continue;const distance=Math.abs(P.x-n.x)+(n.x<P.x-130?220:0);if(distance<best&&n.x>cam.x-65&&n.x<cam.x+VW+65){best=distance;focus=j;}}
  for(let j=0;j<o.nodes.length;j++)vk5Node(o,o.nodes[j],j,tm,col,o.sira,j===focus);g.restore();
  if(o.done){const age=now-o.end;if(age<2.2){g.globalCompositeOperation='lighter';vk5Glow(col,o.x,o.y-55,80+age*25,40+age*12,Math.sin(age/2.2*Math.PI)*.08);g.globalCompositeOperation='source-over';}}
 }
});
// A real flower tap is optional: ordinary walking and gentle late help remain
// valid. Only the visible flower face owns this event; every other canvas touch
// continues through the normal walking controls and DOM controls are untouched.
addEventListener('pointerdown',e=>{
 if(DURUM!=='oyun'||e.target!==cv||P.ucus||P.fade>0||P.kilit>.05||typeof KR5!=='undefined'&&KR5.aktif||typeof V5!=='undefined'&&V5.final||e.button!=null&&e.button!==0)return;
 if(typeof dugmede==='function'&&dugmede(e.clientX,e.clientY))return;
 const r=cv.getBoundingClientRect(),wx=cam.x+(e.clientX-r.left)*DPR/S,wy=cam.y+(e.clientY-r.top)*DPR/S;let garden=null,node=null,best=1;
 for(const o of NESNELER){if(o.tip!=='korBahce'||o.done)continue;for(let j=0;j<o.nodes.length;j++){const n=o.nodes[j];if(n.done||Math.abs(P.x-n.x)>800||Math.abs(P.y-n.y)>350)continue;const p=vk5GardenPosition(o,j,now,VK5.hitPoint);if(p.x<cam.x-40||p.x>cam.x+VW+40||p.y<cam.y-60||p.y>cam.y+H/S+60)continue;const d=((wx-p.x)/62)**2+((wy-p.y)/67)**2;if(d<best){best=d;garden=o;node=n;}}}
 if(node){e.preventDefault();e.stopPropagation();if(typeof omHepsiniBirak==='function')omHepsiniBirak();P.buf=0;vk5TapNode(garden,node);return;}
 if(vk5FinalReady())for(const o of NESNELER){if(o.tip!=='korCicegi'||o.started||Math.abs(P.x-o.x)>600||o.x<cam.x-100||o.x>cam.x+VW+100)continue;const d=((wx-o.x)/125)**2+((wy-o.y+255)/175)**2;if(d<1){e.preventDefault();e.stopPropagation();if(typeof dragonHappy==='function')dragonHappy(o);vk5Begin(o);return;}}
},true);
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
  const pulse=.5+.5*Math.sin(tm*1.2+o.ph),p=o.pressure,s=o.w/150,v=Math.abs(Math.floor(o.x/T))%3,mouth=o.y-36*s;
  // The layered stone stays rooted while its copper mouth takes a soft breath.
  g.save();g.translate(o.x,o.y);g.scale(1+p*.025,1-p*.035);g.drawImage(vk5VentArt(v),-90*s,-90*s,180*s,110*s);g.restore();
  g.save();g.lineCap='round';g.strokeStyle='#f4c486';g.lineWidth=1.1;g.globalAlpha=.46+p*.35;g.beginPath();g.ellipse(o.x,mouth,o.w*.19,2.2+p*1.6,0,0,6.283);g.stroke();
  // Fine separated wisps describe lift without covering the flower silhouettes.
  for(let j=0;j<5;j++){const bx=o.x+(j-2)*7*s,hh=o.h*(.31+p*.36)*(1-Math.abs(j-2)*.08);g.strokeStyle=j%2?'#c8d2c9':'#e4c9bf';g.lineWidth=1.2+j%2*.6;g.globalAlpha=(.09+.025*pulse+p*.14)*(1-Math.abs(j-2)*.13);g.beginPath();g.moveTo(bx,mouth);g.bezierCurveTo(bx-12+Math.sin(tm*.8+j)*6,mouth-hh*.35,bx+15,mouth-hh*.7,bx+Math.sin(tm*.7+j)*16,mouth-hh);g.stroke();}
  g.globalAlpha=.65+p*.25;g.strokeStyle='#e8b774';g.lineWidth=1;for(let j=0;j<2;j++){const u=(tm*.35+j*.5+o.ph)%1,yy=mouth-12-u*36;g.globalAlpha=Math.sin(u*Math.PI)*(.35+p*.45);g.beginPath();g.moveTo(o.x-4,yy+3);g.lineTo(o.x,yy);g.lineTo(o.x+4,yy+3);g.stroke();}g.restore();
  if(p>.02){g.globalCompositeOperation='lighter';vk5Glow('#ecb06d',o.x,mouth,19,9,p*.16);g.globalCompositeOperation='source-over';}
 }
});
TUR.kaydet('korBasamak',{
 kur(o){o.top=o.y;o.h=o.h||18;o.y+=o.h;o.cisim={w:o.w||110,h:o.h,tip:'ziplat',guc:o.guc||800,aktif:true};o.bounce=0;o.last=-10;},
 guncelle(o,dt){o.bounce=Math.max(0,o.bounce-dt*2);},
 ustune(o){o.bounce=1;if(now-o.last>1){o.last=now;burst(o.x,o.top-8,12,['#ffd395','#c6e5d8','#ffffff'],75,1,3);OLAY.emit('buharZip',o);}},
 ciz(o,tm){
  const w=o.cisim.w,s=w/200,b=Math.sin(o.bounce*Math.PI),v=Math.abs(Math.floor(o.x/T))%3;g.save();g.translate(o.x,o.top);g.scale(1+b*.025,1-b*.09);g.drawImage(vk5StepArt(v),-110*s,-28*s,220*s,80*s);
  for(let j=0;j<2;j++){const side=j?1:-1;vk5Leaf(side*w*.32,12*s,side*(1.2+b*.13),19*s,5.8*s,j?'#7c3ea6':'#b72f63',1);}g.restore();
  if(o.bounce>.02){g.globalCompositeOperation='lighter';vk5Glow('#efa65e',o.x,o.top-4,20,8,b*.2);g.globalCompositeOperation='source-over';}
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
  if(o.fade<=.002)return;const unfold=vk5Ease(1-o.fade),crystal=o.stil==='kristal';g.save();g.lineCap='round';
  // A pair of folded mineral vines opens like a little garden gate; the vivid
  // round flowers beside it remain the actual invitations.
  for(let i=0;i<2;i++){const side=i?1:-1;g.save();g.translate(o.x+side*24,o.y);g.rotate(side*(unfold*.62+Math.sin(tm*.55+i)*.012));g.globalAlpha=o.fade;g.strokeStyle='#302b47';g.lineWidth=6;g.beginPath();g.moveTo(0,1);g.bezierCurveTo(side*18,-65,side*5,-126,-side*16,-187);g.stroke();g.strokeStyle=crystal?'#7953a2':i?'#993454':'#7c3ea6';g.lineWidth=3;g.stroke();g.strokeStyle='#d09f9a';g.lineWidth=.7;g.beginPath();g.moveTo(-side*1,-4);g.bezierCurveTo(side*14,-67,side*2,-124,-side*18,-180);g.stroke();
   for(let j=0;j<4;j++){const yy=-24-j*40,xx=side*(5-j*4)+Math.sin(tm*.7+j)*1.2;vk5Leaf(xx,yy,side*(.68+Math.sin(tm*.7+j)*.045),26-j*.8,8.2,j%2?'#b72f63':'#7c3ea6',o.fade);}
   g.drawImage(vk5HeartArt(),-side*16-5,-194,10,14);g.restore();
  }
  const count=o.bag&&o.bag.nodes?o.bag.nodes.length:3;for(let j=0;j<3;j++){const lit=o.open||(o.bag&&o.bag.nodes&&o.bag.nodes[Math.min(j,count-1)]&&o.bag.nodes[Math.min(j,count-1)].done),xx=o.x+(j-1)*10,yy=o.y-128-Math.sin((j+1)*Math.PI/4)*10;g.globalAlpha=o.fade;g.fillStyle=lit?'#e8b66f':'#56334f';g.strokeStyle=lit?'#f8d494':'#a66e84';g.lineWidth=.8;g.beginPath();g.moveTo(xx,yy-4);g.lineTo(xx+3,yy);g.lineTo(xx,yy+4);g.lineTo(xx-3,yy);g.closePath();g.fill();g.stroke();}g.restore();
 }
});
TUR.kaydet('volkanSus',{
 ciz(o,tm){if(typeof dn5Flora!=='function')return;const z=(o.z||1)*(o.v%2?.84:.68);g.save();g.translate(o.x,o.y+2);g.rotate(Math.sin(tm*.25+o.v)*.015);g.globalAlpha=.96;if(o.v%2&&typeof dn5Bloom==='function')g.drawImage(dn5Bloom(o.v===1?0:1),-155*z,-310*z,310*z,320*z);else g.drawImage(dn5Flora((o.v*2+4)%10),-140*z,-300*z,280*z,320*z);g.restore();}
});
function vk5FinalReady(){return typeof V5!=='undefined'&&V5.bahce>=BOLUM.korTop&&V5.mini&&V5.sal;}
function vk5Begin(o){
 if(o.started||!vk5FinalReady())return;o.started=true;o.age=0;VK5.final=o;P.kilit=Math.max(P.kilit||0,27);P.vx=0;P.buf=0;P.f=1;
 if(typeof omHepsiniBirak==='function')omHepsiniBirak();if(typeof V5!=='undefined')V5.final=true;
 OLAY.emit('volkanFinalBasla',{o,duration:26,box:{x0:Math.min(o.x-390,P.x-100,D.x-70),x1:Math.max(o.x+390,P.x+100,D.x+70),y0:Math.min(o.y-500,D.y-80),y1:Math.max(o.y+85,P.y+30)}});lightTarget=1;
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
  const a=o.started?o.age:0,opening=vk5Ease((a-1)/8),heart=vk5Ease((a-4)/5),lift=vk5Ease((a-10)/7),ready=!o.started&&vk5FinalReady(),invite=ready?(.5+.5*Math.sin(tm*1.9))*.035:0,cx=o.x,cy=o.y-155-opening*40;g.save();
  // Broad mineral dais anchors the flower in this landscape.
  g.drawImage(vk5Stone(2),cx-220,o.y-58,440,126);g.strokeStyle='#2d2d48';g.lineWidth=11;g.lineCap='round';g.beginPath();g.moveTo(cx,o.y-3);g.bezierCurveTo(cx-25,o.y-70,cx+23,cy+40,cx,cy);g.stroke();g.strokeStyle='#447a88';g.lineWidth=6.5;g.stroke();g.strokeStyle='rgba(217,166,172,.62)';g.lineWidth=1.2;g.beginPath();g.moveTo(cx-2,o.y-2);g.bezierCurveTo(cx-27,o.y-80,cx+19,cy+45,cx-3,cy);g.stroke();
  for(let j=0;j<6;j++){const side=j%2?1:-1,yy=o.y-24-Math.floor(j/2)*31;vk5Leaf(cx,yy,side*(.8+opening*.3)+Math.sin(tm*.45+j)*.015,65+opening*25,17,j%3?'#406e7b':'#5e8392',1);}
  // Three interlaced rings open slowly; each petal retains its folded paper seam.
  for(let layer=0;layer<3;layer++){const count=layer===0?9:7;for(let j=0;j<count;j++){const ang=(j-(count-1)*.5)*(layer===0?.07+opening*.24+invite:.06+opening*.21+invite*.5),osc=Math.sin(tm*.45+j*.8+layer)*.012*opening,k=(layer===0?.78:layer===1?.62:.47)*(1+.04*Math.sin(tm*.3+layer)*opening);g.save();g.translate(cx,cy+layer*12);g.rotate(ang+osc);g.scale(k*(.72+opening*.28),k);g.globalAlpha=1;g.drawImage(vk5Petal((layer+j%2)%3),-65,-255,130,270);g.restore();}}
  // Small molten seed, real gold facets: keep the ruby/violet pigment intact.
  const seed=1+Math.sin(tm*1.1)*.025;g.drawImage(vk5HeartArt(),cx-23*seed,cy-80*seed,46*seed,62*seed);g.globalCompositeOperation='lighter';vk5Glow('#eaa266',cx,cy-49,92+opening*25,80,.035+heart*.035);vk5Glow('#ffc87b',cx,cy-48,26+heart*8,30+heart*8,.1+heart*.1);g.globalCompositeOperation='source-over';
  if(ready)vk5Pollen(cx,cy-60,tm,.3,.55);
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

/* bolum5.js — Uyuyan Yanardağ. Güvenli bazalt patikalar, üç yaşayan bahçe,
   sıcak buhar oyunları, kristal müziği ve uzun lav yolculuğu. Klasik bölüm sözleşmesi. */
'use strict';
const ROWS = 30, COLS = 600;
const grid = Array.from({length:ROWS},()=>new Uint8Array(COLS));
const ground=(a,b,h)=>{for(let c=a;c<=b;c++)for(let r=ROWS-h;r<ROWS;r++)grid[r][c]=1;};
const plat=(a,b,r)=>{for(let c=a;c<=b;c++)grid[r][c]=2;};
const topOf=c=>{c=Math.floor(c);if(c<0||c>=COLS)return ROWS;for(let r=0;r<ROWS;r++)if(grid[r][c]===1)return r;return ROWS;};
const cell=(c,r)=>c<0||c>=COLS?1:r<0||r>=ROWS?0:grid[r][c];
const yuzey=c=>topOf(c)*T;
const nx=c=>c*T+T/2;
function nesne(tip,c,y,o={}){const n=Object.assign({tip,x:nx(c),y,id:tip+NESNELER.length},o);NESNELER.push(n);return n;}
// Ana patikada her çıkış en fazla iki kare. Gizli üst yollar isteğe bağlıdır.
for(const [a,b,h] of [
 [0,17,12],[18,23,13],[24,30,14],[31,38,13],[39,78,12],[79,84,13],[85,94,14],
 [95,105,13],[106,119,12],[120,136,13],[137,144,14],[145,157,13],[158,194,13],
 [195,201,14],[202,209,15],[210,217,14],[218,234,13],[235,245,14],[246,280,13],
 [281,288,14],[289,302,13],[424,441,13],[442,448,14],[449,456,15],[457,463,14],
 [464,474,13],[475,508,14],[509,516,15],[517,523,16],[524,531,15],[532,538,16],
 [539,579,17],[580,599,16]])ground(a,b,h);
// Merdiven bahçeleri, çifte zıplama gerektirmeden ulaşılabilen isteğe bağlı gezinti.
for(const[a,b,r]of[[89,93,13],[97,101,11],[105,109,9],[125,129,14],[135,140,11],
 [203,208,12],[213,218,10],[226,232,13],[283,287,13],[452,456,11],[462,466,9],
 [493,497,12],[503,507,10],[528,532,9]])plat(a,b,r);
const BOLUM={
 ad:'Uyuyan Yanardağ',baslangic:{x:nx(6),y:yuzey(6)},
 bolgeler:[{ad:'koz',x0:0,x1:120*T},{ad:'buhar',x0:120*T,x1:235*T},
 {ad:'kristal',x0:235*T,x1:300*T},{ad:'lav',x0:300*T,x1:425*T},
 {ad:'kalp',x0:425*T,x1:COLS*T}],gol:null,gollar:[],
 sal:{x0:nx(300),x1:nx(425),yUst:200,yAlt:760},
 kor:{x:nx(565),y:yuzey(565)},korTop:3,
 kamera:[{x0:0,x1:28*T,zoom:.95},{x0:43*T,x1:78*T,zoom:.88,yOfs:-20},
 {x0:87*T,x1:112*T,zoom:.82,yOfs:-110},{x0:125*T,x1:145*T,zoom:.86,yOfs:-60},
 {x0:156*T,x1:195*T,zoom:.88,yOfs:-20},{x0:201*T,x1:220*T,zoom:.83,yOfs:-80},
 {x0:245*T,x1:280*T,zoom:.86,yOfs:-25},{x0:295*T,x1:431*T,zoom:.86},
 {x0:475*T,x1:510*T,zoom:.86,yOfs:-35},{x0:535*T,x1:COLS*T,zoom:.8,yOfs:-80}]
};
P.x=P.safeX=BOLUM.baslangic.x;P.y=P.safeY=BOLUM.baslangic.y;D.x=P.x-60;D.y=P.y-85;
const bl5Soz=(c,k,gec)=>nesne('konusma',c,yuzey(c),{anahtar:k,r:90,gec:nx(gec||c+12)});
const bl5Bahce=(c,sira,cs)=>nesne('korBahce',c,yuzey(c),{sira,r:150,nodes:cs.map((v,i)=>({x:nx(v),y:yuzey(v),note:i,sicak:0,done:false}))});
const bl5B1=bl5Bahce(60,0,[47,59,71]);
nesne('volkanPerde',77,yuzey(77),{bagId:bl5B1.id,stil:'bahce'});
const bl5B2=bl5Bahce(174,1,[161,174,187]);
nesne('volkanPerde',193,yuzey(193),{bagId:bl5B2.id,stil:'bahce'});
const bl5B3=bl5Bahce(488,2,[477,488,500]);
nesne('volkanPerde',507,yuzey(507),{bagId:bl5B3.id,stil:'bahce'});
// Buhar bacaları yalnız yukarı taşıyan sıcak, güvenli hava: su/hasar modu yok.
for(const[c,h,w]of[[29,210,106],[88,285,120],[101,250,110],[126,230,120],
 [137,310,125],[161,190,100],[174,230,100],[187,200,100],[204,275,115],
 [216,260,110],[285,230,105],[451,230,110],[463,290,118],[494,220,110],[530,210,105]])
 nesne('buharBaca',c,yuzey(c),{h,w,r:55});
// Beş ayrı taş oyuncağı: üstünden geçince yaylanır ve sıcak tınılar bırakır.
for(const[c,w,guc]of[[36,110,780],[112,120,830],[229,120,810],[441,115,800],[520,110,830]])
 nesne('korBasamak',c,yuzey(c),{w,h:18,guc});
const bl5Mini=nesne('volkanMini',260,680,{r:150});
nesne('volkanPerde',270,680,{bagId:bl5Mini.id,stil:'kristal'});
nesne('volkanSal',300,680,{r:120,x1:BOLUM.sal.x1,yUst:200,yAlt:760});
nesne('korCicegi',565,yuzey(565),{r:145});
// İsteğe bağlı ışık tohumları: ana görev değil, bütün üst yolların küçük sürprizleri.
for(const[c,y]of[[22,590],[51,630],[91,475],[99,395],[107,315],[128,515],[138,395],
 [172,550],[206,435],[215,355],[231,475],[284,475],[447,590],[454,395],[464,315],
 [490,555],[505,355],[531,315],[548,430]])nesne('tohum',c,y,{r:48});
bl5Soz(123,'p_v_buhar',140);bl5Soz(244,'p_v_mini',260);bl5Soz(289,'p_v_sal',301);bl5Soz(538,'p_v_kalp',556);
// Elle yerleştirilmiş sahne imzaları: dümdüz turuncu koridor yerine beş farklı peyzaj.
for(const[c,v,z]of[[15,0,1.1],[40,1,1],[79,2,.9],[117,0,.9],[148,3,1.1],
 [199,2,1.15],[233,3,.9],[276,1,1.1],[433,2,1],[470,0,1.2],[515,3,1.15],[550,1,1.2],[590,0,1]])
 nesne('volkanSus',c,yuzey(c),{v,z});
const FLOWERS=[];
const TREE=null;

/* bolum6.js — Şenlik Kalesi (altıncı ve son rüya). Alacakaranlıkta uyuyan bir masal kasabası: taş kaldırımlı sokaklar,
   tenteli tezgâhlar, damların üstünden geçen isteğe bağlı yollar, sönük fenerler, uyuyan büyülü midilliler, oyuncak şövalyeler.
   Kasabanın ucundaki uçurumdan Feza ışıklı bir midilliyle bulut denizini aşar (halka kapma), kale köprüsüne iner ve avluda
   şenliği uyandırır. Ana patikada her basamak en çok iki kare; damlara yalnız midilli sıçratır (normal çift zıplama yetmez).
   Sözleşme: src/BOLUM6.md. Çizimler dunya6.js (dn6*), nesneler senlik.js / midilli.js / halka.js. */
'use strict';
const ROWS = 30, COLS = 520;
const grid = Array.from({length:ROWS},()=>new Uint8Array(COLS));
const ground=(a,b,h)=>{for(let c=a;c<=b;c++)for(let r=ROWS-h;r<ROWS;r++)grid[r][c]=1;};
const plat=(a,b,r)=>{for(let c=a;c<=b;c++)grid[r][c]=2;};
const topOf=c=>{c=Math.floor(c);if(c<0||c>=COLS)return ROWS;for(let r=0;r<ROWS;r++)if(grid[r][c]===1)return r;return ROWS;};
const cell=(c,r)=>c<0||c>=COLS?1:r<0||r>=ROWS?0:grid[r][c];
const yuzey=c=>topOf(c)*T;
const nx=c=>c*T+T/2;
function nesne(tip,c,y,o={}){const n=Object.assign({tip,x:nx(c),y,id:tip+NESNELER.length},o);NESNELER.push(n);return n;}

// ── Zemin: [ilk sütun, son sütun, yükseklik (alttan kare)]. Komşu iki parça arasında en çok iki kare fark. ──
// Kasaba yavaşça yükselir (12 → 17) ve sütun 266'da bulut denizine bakan uçurumla biter. 267..389 boşluk:
// yalnız midilli yolculuğu (halkaMini) geçer. Karşıda kale tepesi (15 → 19) ve avlu.
for(const [a,b,h] of [
 [0,22,12],[23,28,13],[29,38,14],[39,46,13],[47,64,12],      // giriş sokağı
 [65,70,12],[71,76,10],[77,84,12],                           // küçük kanal (iki kare çukur; üstünde tahta köprücük)
 [85,92,13],[93,126,13],[127,134,14],                        // çarşı
 [135,198,14],                                               // meydan (geniş, düz)
 [199,206,15],[207,236,16],[237,266,17],                     // uçuruma çıkan yokuş
 [390,401,15],[402,407,13],[408,420,15],                     // iniş düzlüğü, hendek (iki kare; üstünde kale köprüsü)
 [421,430,16],[431,446,17],[447,458,18],[459,519,19]])       // kale yokuşu ve avlu
 ground(a,b,h);

// ── Tek yönlü platformlar ──
// Alçak tenteler (zeminden 3 kare): normal zıplamayla oyuncak basamaklar. Kanal köprücüğü zemin hizasında.
for(const [a,b,r] of [[71,76,18],[52,56,15],[59,62,14],[112,116,14],[146,150,13],[155,159,12],[176,180,13],[227,231,11]]) plat(a,b,r);
// Yüksek dam yolları (zeminden 6 kare): yalnız uyanan midillinin sıçrattığı isteğe bağlı üst yollar.
for(const [a,b,r] of [
 [41,48,11],[51,57,11],[60,64,12],                           // 1. midilli (sütun 40) → giriş damları
 [96,103,11],[106,113,11],[116,123,11],                      // 2. midilli (sütun 95) → çarşı damları (fener + tohum)
 [167,174,10],[177,184,10],[187,192,11],                     // 3. midilli (sütun 165) → meydan balkonları
 [211,218,8],[221,228,8],[231,240,8],[243,250,9],            // 4. midilli (sütun 209) → sur yolu, uçuruma bakan teras
 [442,449,7],[452,459,7],[462,468,7]]) plat(a,b,r);           // 5. midilli (sütun 439) → kale suru, avluya iner

const BOLUM={
 ad:'Şenlik Kalesi',baslangic:{x:nx(6),y:yuzey(6)},
 bolgeler:[{ad:'giris',x0:0,x1:65*T},{ad:'carsi',x0:65*T,x1:135*T},{ad:'meydan',x0:135*T,x1:199*T},
  {ad:'yokus',x0:199*T,x1:267*T},{ad:'yolculuk',x0:267*T,x1:390*T},{ad:'kale',x0:390*T,x1:459*T},{ad:'avlu',x0:459*T,x1:COLS*T}],
 gol:null,gollar:[],
 // Midilli yolculuğu koridoru (halka.js): uçurumdan kalkış, bulut denizi, kale iniş düzlüğü. oyun.js uçuş kamerası BOLUM.ucus'u okur.
 halka:{x0:nx(262),x1:nx(394),yUst:200,yAlt:700,inisX:nx(396),inisY:yuzey(396)},
 kopru:{x0:402*T,x1:408*T,y:yuzey(401)},
 avlu:{x:nx(497),y:yuzey(497)},
 fenerTop:12,halkaTop:12,
 kamera:[{x0:0,x1:30*T,zoom:.95,yOfs:-20},{x0:38*T,x1:66*T,zoom:.86,yOfs:-90},
  {x0:66*T,x1:90*T,zoom:.92,yOfs:-30},{x0:93*T,x1:126*T,zoom:.86,yOfs:-90},
  {x0:135*T,x1:198*T,zoom:.86,yOfs:-80},{x0:205*T,x1:252*T,zoom:.82,yOfs:-120},
  {x0:252*T,x1:268*T,zoom:.8,yOfs:-60},{x0:388*T,x1:425*T,zoom:.86,yOfs:-50},
  {x0:430*T,x1:470*T,zoom:.82,yOfs:-130},{x0:470*T,x1:COLS*T,zoom:.78,yOfs:-130}]
};
BOLUM.ucus=BOLUM.halka;
P.x=P.safeX=BOLUM.baslangic.x;P.y=P.safeY=BOLUM.baslangic.y;D.x=P.x-60;D.y=P.y-85;

const bl6Soz=(c,k,gec)=>nesne('konusma',c,yuzey(c),{anahtar:k,r:90,gec:nx(gec||c+12)});

// ── Fenerler (12): on biri ana yolda (yanından geçmek yeter), biri çarşı damında. Yüzde: kasaba 10, kale yokuşu 2. ──
for(const [c,y] of [[12],[33],[55],[80],[104],[118,11*T],[150],[182],[222],[247],[426],[454]])
 nesne('fener',c,y===undefined?yuzey(c):y,{r:80,sira:NESNELER.filter(n=>n.tip==='fener').length});

// ── Midilliler (5): uyuyan büyülü midilliler. Üstüne zıplayınca uyanır ve damlara sıçratır (guc ≈ 7 kare). ──
for(const [c,yon,renk] of [[40,1,0],[95,1,1],[165,1,2],[209,1,3],[439,1,4]])
 nesne('midilli',c,yuzey(c),{r:70,yon,renk,guc:1150,w:70,h:34});

// ── Oyuncak şövalye heykelleri (4): dokununca şapka/bayrak sallar. ──
for(const [c,yon] of [[26,1],[140,1],[196,-1],[466,1]]) nesne('sovalye',c,yuzey(c),{r:75,yon});

// ── Mini oyun: uçurumda ışıklı midilliye biniş → halka kapma yolculuğu → kale iniş düzlüğü. ──
const bl6Mini=nesne('halkaMini',258,yuzey(258),{r:120,x1:BOLUM.halka.x1,yUst:BOLUM.halka.yUst,yAlt:BOLUM.halka.yAlt,inisX:BOLUM.halka.inisX,inisY:BOLUM.halka.inisY});
nesne('miniKapi',263,yuzey(263),{bagId:bl6Mini.id,stil:'takim'});

// ── Kale köprüsü (hendeğin üstünde, sütun 402..407) ve final avlusu. ──
nesne('kaleKopru',404.5,yuzey(401),{x0:BOLUM.kopru.x0,x1:BOLUM.kopru.x1,w:BOLUM.kopru.x1-BOLUM.kopru.x0+T,r:140});
nesne('senlikAvlu',497,yuzey(497),{r:170});

// ── Konuşma: ilk uyuyan midilli görünmeden biraz önce Pırıl fısıldar. ──
bl6Soz(30,'p_f_midilli',44);

// ── İsteğe bağlı ışık tohumları: dam yollarının ve balkonların küçük sürprizleri. ──
for(const [c,y] of [[45,11*T],[62,12*T],[100,11*T],[121,11*T],[148,13*T],[171,10*T],[190,11*T],[216,8*T],[236,8*T],[248,9*T],[446,7*T],[465,7*T]])
 nesne('tohum',c,y,{r:46});

// ── Dekor imzaları (yalnız görüntü; dunya6.js çizer, çarpışma/oynanış yok). Her bölgenin kendine özgü bir köşesi olsun. ──
// fiskiye: meydanın ışıklı havuzu (sütun). kedi: [sütun, dam satırı, renk] terasın korkuluğunda uyuyan kediler (fener ışığı
// gelince uyanır). baykus: [sütun, sur satırı] sur mazgalında uyuklayan baykuşlar. bayrak: rüzgârda dalgalanan uzun flamalı direkler.
// kapicik: istinat duvarındaki minik peri kapıları (yanında küçük fener; ışık gelince pencereleri yanar).
const DEKOR6={
 fiskiye:[162],
 kedi:[[54,11,0],[109,11,1],[180,10,2],[99,11,2]],
 baykus:[[233,8],[456,7]],
 bayrak:[18,88,137,201,432],
 kapicik:[9,43,61,97,124,171,191,214,244,415,450]
};

const FLOWERS=[];
const TREE=null;

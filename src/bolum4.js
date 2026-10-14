/* bolum4.js – İnci Denizi. Üç sakin etkinlik: denizatları, ahtapot, vatoz yolculuğu.
   Aynı bölüm sözleşmesi; açık yüzme koridorunda katı engel yok. */
'use strict';
const ROWS = 30, COLS = 540;
const grid = Array.from({ length: ROWS }, () => new Uint8Array(COLS));
const ground = (a,b,h) => { for(let c=a;c<=b;c++) for(let r=ROWS-h;r<ROWS;r++) grid[r][c]=1; };
const plat = (a,b,r) => { for(let c=a;c<=b;c++) grid[r][c]=2; };
const topOf = c => { c=Math.floor(c); if(c<0||c>=COLS)return ROWS; for(let r=0;r<ROWS;r++)if(grid[r][c]===1)return r;return ROWS; };
const cell = (c,r) => c<0||c>=COLS ? 1 : r<0||r>=ROWS ? 0 : grid[r][c];
const yuzey = c => topOf(c)*T;
const nx = c => c*T+T/2;
function nesne(tip,c,y,o={}) { const n=Object.assign({tip,x:nx(c),y,id:tip+NESNELER.length},o);NESNELER.push(n);return n; }
for(const [a,b,h] of [[0,44,5],[45,83,4],[84,122,5],[123,165,4],[166,203,5],[204,239,4],[240,289,5],[290,337,4],[338,361,5],[362,445,4],[446,475,5],[476,539,6]])ground(a,b,h);
const BOLUM = {
 ad:'İnci Denizi',baslangic:{x:nx(6),y:650},
 bolgeler:[{ad:'sedef',x0:0,x1:55*T},{ad:'cayir',x0:55*T,x1:240*T},{ad:'ahtapot',x0:240*T,x1:290*T},{ad:'mercan',x0:290*T,x1:355*T},{ad:'vatoz',x0:355*T,x1:445*T},{ad:'inci',x0:445*T,x1:COLS*T}],
 gol:null,gollar:[],deniz:{yUst:160,yAlt:900,ahtapotX:nx(278),vatozX:nx(355)},
 vatoz:{x0:nx(355),x1:nx(445),yUst:260,yAlt:760},
 kamera:[{x0:0,x1:50*T,zoom:.88},{x0:240*T,x1:290*T,zoom:.85},{x0:355*T,x1:445*T,zoom:.86},{x0:475*T,x1:COLS*T,zoom:.85}],
};
P.x=P.safeX=BOLUM.baslangic.x;P.y=P.safeY=BOLUM.baslangic.y;D.x=P.x-65;D.y=P.y-80;
for(const [c,y] of [[22,615],[70,510],[121,690],[173,545],[223,650]])nesne('denizati',c,y,{sira:NESNELER.filter(n=>n.tip==='denizati').length});
nesne('ahtapot',265,700,{gateX:nx(278)});
nesne('vatozKapisi',355,620,{x1:BOLUM.vatoz.x1,yUst:260,yAlt:760});
nesne('buyukInci',500,700,{r:90});
for(const [c,y] of [[26,590],[83,450],[125,650],[173,420],[234,570],[316,510],[463,550],[486,430]])nesne('tohum',c,y,{r:46});
// A few local friends add life without creating another activity or a follower crowd.
for(const [c,y] of [[40,690],[125,440],[307,580],[463,480]])nesne('denizSus',c,y,{tur:'balik',sira:c%5});
for(const c of [33,318,477])nesne('denizSus',c,yuzey(c)-14,{tur:'midye',sira:c%3});
const FLOWERS=[];
const TREE=null;

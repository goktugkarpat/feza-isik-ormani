/* İnci Denizi: kabuğun uyanışı, dostların gelişi ve birlikte kutlama. */
'use strict';
const INCI = (() => {
  const eski = Object.assign({}, TUR.al('buyukInci'));
  let aktif = null, lid = null, bowl = null;
  const kamera = {x0:0,y0:0,x1:0,y1:0}, fezaNokta = {x:0,y:0}, pirilNokta = {x:0,y:0};
  const ease = v => smooth(clamp(v, 0, 1));
  function art() {
    if (lid) return;
    lid = document.createElement('canvas'); lid.width = 720; lid.height = 360;
    const q = lid.getContext('2d'); q.scale(2, 2); q.translate(180, 145);
    const shell = () => { q.beginPath(); q.moveTo(-143, 0); for (let i = 0; i <= 96; i++) { const a = Math.PI + i / 96 * Math.PI, f = 1 + Math.cos(i / 96 * Math.PI * 20) * .028; q.lineTo(Math.cos(a) * 145 * f, Math.sin(a) * 122 * f); } q.quadraticCurveTo(80, 23, 0, 25); q.quadraticCurveTo(-95, 22, -143, 0); q.closePath(); };
    shell(); const gr = q.createRadialGradient(-43,-83,3,0,-22,163); gr.addColorStop(0,'#fffbe3'); gr.addColorStop(.28,'#ffe3da'); gr.addColorStop(.6,'#e6a8c3'); gr.addColorStop(.83,'#ae8ebc'); gr.addColorStop(1,'#7c86ae'); q.fillStyle=gr; q.fill(); q.save(); q.clip();
    for(let i=0;i<25;i++){const a=Math.PI+(i+.5)/25*Math.PI, x=Math.cos(a)*143,y=Math.sin(a)*120; q.lineWidth=5;q.strokeStyle='rgba(130,83,136,.16)';q.beginPath();q.moveTo(0,21);q.quadraticCurveTo(x*.44,y*.42,x,y);q.stroke();q.lineWidth=1.8;q.strokeStyle='rgba(255,249,219,.8)';q.beginPath();q.moveTo(2,20);q.quadraticCurveTo(x*.44+2,y*.42,x+2,y);q.stroke();}
    const random=rng(914);for(let i=0;i<260;i++)dnzOval(q,-145+random()*290,-125+random()*145,.4+random()*.8,.3,'rgba(255,250,226,.25)');// Sedefin büyüme katmanları: ana kaburga çizgilerini yormayan ince yatay damarlar.
    for(let j=1;j<11;j++){const u=j/11;q.beginPath();for(let i=0;i<=60;i++){const a=Math.PI+i/60*Math.PI,rr=145*u*(1+Math.cos(a*20)*.012),xx=Math.cos(a)*rr,yy=Math.sin(a)*122*u+18*(1-u);if(i)q.lineTo(xx,yy);else q.moveTo(xx,yy);}q.strokeStyle=j%2?'rgba(255,249,218,.17)':'rgba(129,96,148,.1)';q.lineWidth=.7;q.stroke();}
    q.restore();shell();q.strokeStyle='#fff0d9';q.lineWidth=2;q.stroke();
    bowl=document.createElement('canvas');bowl.width=720;bowl.height=260;const b=bowl.getContext('2d');b.scale(2,2);b.translate(180,55);const bg=b.createRadialGradient(-28,-7,3,0,5,138);bg.addColorStop(0,'#a587ba');bg.addColorStop(.55,'#d6b3d3');bg.addColorStop(.86,'#ffe2da');bg.addColorStop(1,'#f8efd0');b.fillStyle=bg;b.beginPath();b.ellipse(0,5,140,48,0,0,Math.PI*2);b.fill();b.save();b.clip();
    // İç çanak: eğri büyüme damarları ve sıcak-soğuk sedef yansımaları atlas içine işlenir.
    const deep=b.createRadialGradient(8,14,4,0,10,139);deep.addColorStop(0,'rgba(138,107,160,.16)');deep.addColorStop(.55,'rgba(153,126,170,.06)');deep.addColorStop(.79,'rgba(255,251,227,.09)');deep.addColorStop(1,'rgba(91,84,132,.27)');b.fillStyle=deep;b.fillRect(-145,-45,290,100);
    for(let j=1;j<=13;j++){const rx=j*10.5,ry=rx*.317;b.beginPath();for(let i=0;i<=100;i++){const a=i/100*Math.PI*2,rr=1+Math.sin(a*7+j*.8)*.026+Math.sin(a*11-j*.63)*.008,xx=Math.cos(a)*rx*rr,yy=8+Math.sin(a)*ry*rr;if(i)b.lineTo(xx,yy);else b.moveTo(xx,yy);}b.closePath();b.strokeStyle=j%2?'rgba(255,245,225,.13)':'rgba(139,101,157,.055)';b.lineWidth=j%2?.72:.55;b.stroke();}
    for(let j=0;j<17;j++){const a=j/17*Math.PI*2,tx=Math.cos(a)*137,ty=5+Math.sin(a)*46;b.strokeStyle='rgba(255,246,221,.045)';b.lineWidth=.5;b.beginPath();b.moveTo(tx*.18,5+(ty-5)*.18);b.bezierCurveTo(tx*.4-3,5+(ty-5)*.4,tx*.75+2,5+(ty-5)*.75,tx,ty);b.stroke();}
    const rr=rng(943);for(let i=0;i<430;i++){const xx=-145+rr()*290,yy=-45+rr()*100;dnzOval(b,xx,yy,.3+rr()*.5,.17,'rgba(255,247,229,.13)');}
    const wet=b.createRadialGradient(-45,-10,2,-32,0,65);wet.addColorStop(0,'rgba(255,252,225,.32)');wet.addColorStop(.5,'rgba(224,246,231,.12)');wet.addColorStop(1,'rgba(240,243,220,0)');b.fillStyle=wet;b.fillRect(-145,-45,290,100);b.restore();
    b.strokeStyle='rgba(123,99,152,.32)';b.lineWidth=3.5;b.beginPath();b.ellipse(0,5,138,46,0,Math.PI+.05,Math.PI*2-.05);b.stroke();b.strokeStyle='rgba(255,247,216,.9)';b.lineWidth=2;b.beginPath();b.ellipse(0,5,140,48,0,0,Math.PI*2);b.stroke();b.strokeStyle='rgba(240,252,229,.75)';b.lineWidth=1.4;b.beginPath();b.ellipse(0,7,135,42,0,.12,Math.PI-.12);b.stroke();
  }
  function start(o) {
    if(BOLUM_NO!==4)return eski.dokun(o);
    if(o.done||o.dnz.faz!=='bekle')return;
    if(DNZ.ati.some(a=>!a.done)||DNZ.oct&&!DNZ.oct.done||DNZ.ride&&!DNZ.ride.done){o.dokundu=false;return;}
    const k=o.dnz;k.faz='uyan';k.t=0;k.px=P.x;k.py=P.y;k.events=0;k.width=portrait()?1:1.35;k.friends=DNZ.ati.map((a,i)=>({renk:a.renk||a.dnz.renk,source:a,index:i,x:o.x-600-i*95,y:o.y-250-i*23,pose:{face:1,sev:0,bulT:0}}));
    aktif=o;P.kilit=Math.max(P.kilit||0,23);OLAY.emit('inciUyan',{o});OLAY.emit('inciSahne',{o,stage:'kabuk',duration:22,box:kutu()});
  }
  function phase(){return aktif?aktif.dnz.t:0;}
  function joy(){const t=phase();return aktif?ease((t-5)/3)*(1-ease((t-20)/2)):0;}
  function portrait(){return W/H<1;}
  function kutu(){if(!aktif)return null;const o=aktif,t=phase(),w=lerp(portrait()?285:420,portrait()?260:340,ease((t-13)/4));kamera.x0=o.x-w;kamera.y0=o.y-425;kamera.x1=o.x+w;kamera.y1=o.y+95;return kamera;}
  function fezaTarget(){if(!aktif)return null;const t=phase();fezaNokta.x=aktif.x-lerp(portrait()?150:235,portrait()?115:155,ease((t-13)/4))+Math.sin(t*1.65)*joy()*12;fezaNokta.y=aktif.y-75-Math.sin(t*2.15)*joy()*11;return fezaNokta;}
  function pirilTarget(){if(!aktif)return null;const t=phase();pirilNokta.x=aktif.x-(portrait()?205:290)+Math.sin(t*2.15)*joy()*24;pirilNokta.y=aktif.y-240-Math.abs(Math.sin(t*2.15))*joy()*28;return pirilNokta;}
  function lidDraw(u,tm){g.save();g.translate(0,-28);g.scale(1,lerp(-.55,1,u)+Math.sin(tm*1.25)*.008);g.drawImage(lid,-180,-145,360,180);g.restore();}
  function friendDraw(o,tm,front){const k=o.dnz;if(k.faz==='bekle'||!k.friends)return;for(const a of k.friends){if((a.y>=o.y-247)!==front)continue;const enter=ease((k.t-3.5-a.index*.4)/1.8);if(enter<=0)continue;g.save();g.globalAlpha=enter;dnzAtCiz(g,a.x,a.y,.71,tm,a.renk,true,a.index*.8,a.pose);g.restore();}}
  TUR.kaydet('buyukInci',{
    kur(o){if(BOLUM_NO!==4)return eski.kur(o);o.r=155;o.ry=80;o.dnz={faz:'bekle',t:0,ay:0,events:0};dnzClamSprite(true);dnzPearlSprite();DNZ.pearl=o;art();aktif=null;},dokun:start,
    guncelle(o,dt){if(BOLUM_NO!==4)return eski.guncelle(o,dt);if(!Number.isFinite(dt)||dt<0)return;const k=o.dnz;k.ay+=dt;if(k.faz==='bekle'){if(DURUM==='oyun'&&Math.hypot(P.x-o.x,P.y-30-(o.y-80))<175)start(o);return;}if(DURUM!=='oyun'||k.faz==='bitti')return;k.t+=dt;const t=k.t;
      const target=fezaTarget(),move=1-Math.exp(-dt*2.6),px=P.x,py=P.y;P.x=lerp(P.x,target.x,move);P.y=lerp(P.y,target.y,move);P.vx=dt>0?(P.x-px)/dt:0;P.vy=dt>0?(P.y-py)/dt:0;P.idle=0;P.f=1;
      k.width=lerp(k.width,portrait()?1:1.2,1-Math.exp(-dt*4));const widths=k.width;
      const orbit=ease((t-8)/1.3)*(1-ease((t-13)/1.5)), procession=ease((t-14)/1.2)*(1-ease((t-17.2)/1.5));
      for(const a of k.friends){
        const i=a.index,u=ease((t-3.5-i*.4)/3.6),angle=-Math.PI/2+i*Math.PI*2/5+(t-8)*1.25;
        let ex=o.x+[-145,-55,50,140,215][i]*widths,ey=o.y+[-280,-340,-350,-305,-225][i];
        ex=lerp(ex,o.x+Math.cos(angle)*180*widths,orbit);ey=lerp(ey,o.y-247+Math.sin(angle)*90,orbit);
        ex=lerp(ex,o.x+220-i*75-(t-14)*32,procession);ey=lerp(ey,o.y-302+Math.sin((t-14)*1.5-i*.6)*28+i*13,procession);
        const prevX=a.x;a.x=lerp(o.x-600-i*95,ex,u)+Math.sin(t*2.15+i*.68)*joy()*11;a.y=lerp(o.y-250-i*23,ey,u)-Math.abs(Math.sin(t*2.15+i*.68))*joy()*15;
        const facing=orbit>.1||procession>.1?(a.x-prevX<0?-1:1):i>1?-1:1;a.pose.face=lerp(a.pose.face,facing,1-Math.exp(-dt*8));a.pose.sev=joy()*.9;a.pose.bulT=t+i*.28;a.pose.takla=orbit>.1?Math.sin((t-8)*3.2+i)*.35:0;
      }
      if(t>=.7&&!(k.events&1)){k.events|=1;OLAY.emit('inciKabuk',{o});if(typeof SES!=='undefined')SES.soyle('p_i_inci_uyan',{oncelik:4});}
      if(t>=7&&!(k.events&2)){k.events|=2;OLAY.emit('inciDostlar',{o});if(typeof SES!=='undefined')SES.soyle('p_i_dostlar',{oncelik:4});}
      if(t>=14&&!(k.events&4)){k.events|=4;OLAY.emit('inciDalga',{o,renk:'#a8f1de',sure:8});if(typeof SES!=='undefined')SES.soyle('p_i_deniz_uyandi',{oncelik:4});}
      if(t>=19&&!(k.events&8)){k.events|=8;OLAY.emit('inciDoruk',{o});}
      if(t>=22&&!o.done){o.done=true;k.faz='bitti';P.kilit=Math.max(P.kilit||0,3);OLAY.emit('inciTamam',{o});}
    },
    ciz(o,tm){if(BOLUM_NO!==4)return eski.ciz(o,tm);friendDraw(o,tm,false);const k=o.dnz,t=k.t||0,u=k.faz==='bekle'?0:ease(t/4.6),rise=ease((t-3.8)/3.8),j=joy();g.save();g.translate(o.x,o.y);
      if(typeof dnzPearlTapinakCiz==='function')dnzPearlTapinakCiz(g,tm);
      dnzOval(g,0,45,160,23,'rgba(39,112,131,.2)');
      if(u>=.355)lidDraw(u,tm);g.drawImage(bowl,-180,-55,360,130);
      const py=-29-rise*157+Math.sin(tm*1.7)*4+Math.sin(t*2.15)*j*8,ps=1+Math.sin(t*2.15)*j*.035;dglow('#c5ffe6',0,py,90+rise*26,.08+rise*.1);g.save();g.globalAlpha=k.faz==='bekle'?0:ease((t-1.3)/1.3);g.translate(0,py);g.scale(ps,ps);g.rotate(Math.sin(t*2.15)*j*.05);g.drawImage(dnzPearlSprite(),-62,-62,124,124);const blink=k.faz==='bekle'?1:Math.max(1-ease((t-.7)/1.2),Math.max(0,Math.sin(t*2.15+1))*j*.12),look=-.45+Math.sin(t*.55)*.16;dnzGoz(g,-15,7,5.5,blink,false,look,.15);dnzGoz(g,15,7,5.5,blink,false,look,.15);g.strokeStyle='#7796a6';g.lineWidth=2;g.beginPath();g.arc(0,20,6,.12,3.02);g.stroke();g.restore();if(u<.355)lidDraw(u,tm);g.drawImage(dnzClamSprite(true),-180,-160,360,240);
      if(k.faz!=='bekle'){for(let i=0;i<18;i++){const age=(t*.22+i*.618)%1,x=Math.sin(i*2.399+t*.25)*(110+rise*125),y=20-age*350;g.globalAlpha=Math.sin(age*Math.PI)*.5*ease(t/4);dnzOval(g,x,y,1.8+i%3*.65,1.8+i%3*.65,i%3?'#ddfff0':'#ffe4b3');}g.globalAlpha=1;}g.restore();
    },
    cizOn(o,tm){if(BOLUM_NO!==4)return eski.cizOn(o,tm);const k=o.dnz;if(k.faz==='bekle')return;friendDraw(o,tm,true);
      if(k.t>18.4&&k.t<22){g.save();for(let i=0;i<28;i++){const age=k.t-18.4-i*.036;if(age<0||age>2.9)continue;const u=age/2.9;g.globalAlpha=Math.sin(u*Math.PI)*.56;g.strokeStyle=i%2?'#dbfff0':'#ffe8c5';g.lineWidth=1.1;const xx=o.x+Math.sin(i*2.399+u*2)*(65+u*150),yy=o.y-25-u*310,r=2.5+i%4;g.beginPath();g.arc(xx,yy,r,0,Math.PI*2);g.stroke();dnzOval(g,xx-r*.25,yy-r*.28,r*.23,r*.13,'rgba(255,255,239,.7)',-.4);}g.restore();}
      if(k.t>5&&k.t<21.8){const u=ease((k.t-5)/3)*(1-ease((k.t-20)/2)), cols=['#f8d7ed','#bdf3e2','#ffe6aa'];g.save();g.lineCap='round';for(let i=0;i<3;i++){const t=k.t*.65+i*2.09;g.globalAlpha=u*.28;g.strokeStyle=cols[i];g.lineWidth=2.2;g.beginPath();for(let n=0;n<28;n++){const a=t+n*.065,x=o.x+Math.cos(a)*(90+n*3.2),y=o.y-178+Math.sin(a)*26-n*1.6;if(n)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();}g.restore();}
      if(k.t>14&&k.t<21.8){const u=(k.t-14)/7.8;g.save();g.globalAlpha=Math.sin(u*Math.PI)*.12;g.strokeStyle='#baffdf';g.lineWidth=2.5;const r=85+u*680;g.beginPath();g.ellipse(o.x,o.y-160,r,r*.53,0,0,Math.PI*2);g.stroke();g.restore();}
    }
  });
  return {get active(){return !!aktif&&BOLUM_NO===4&&aktif.dnz.faz!=='bekle'&&DURUM==='oyun';},get t(){return phase();},get joy(){return joy();},hedefFeza:fezaTarget,hedefPiril:pirilTarget,kameraKutu:kutu};
})();

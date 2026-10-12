/* ses.js – seslendirme (anlatıcı + Pırıl) ve altyazı. Cümleler aşağıdaki SESLER bloğunda (geçerli JSON);
   değişince `python gen_voice.py` → sesler.js (window.VOICE_MP3 / VOICE_DUR). Anahtar öneki: a_ anlatıcı, p_ Pırıl.
   Sözleşme: src/SPEC.md › "Voice line keys".
   SES.soyle(anahtar, {oncelik}) → sıraya koyar (cümleler asla üst üste binmez), altyazıyı gösterir
   (ARAYUZ.altyazi(metin, saniye, kim)) ve OLAY 'konusma' {anahtar, kim:'a'|'p', sure} yayar.
   Ses AU'nun WebAudio bağlamından çalar (müzik konuşma boyunca kısılır); sesler.js yüklü değilse ya da ?sessiz
   ise yalnız altyazı + olay (süre tahmini) çalışır.
   'p_aferin' (numarasız) → p_aferin1..6 içinden son çalınanları tekrarlamadan biri; övgüler en az 20 sn arayla. */
'use strict';
const SES = (() => {
  const LINES = /*SESLER*/{
    "a_giris1": "Bir varmış, bir yokmuş. Feza adında küçük bir çocuk varmış. Her gece, en sevdiği oyuncağı Pırıl'a sarılıp uyurmuş.",
    "a_giris2": "Pırıl, mor renkli, minicik bir ejderhaymış. Bir gece Feza uykuya dalınca, Pırıl'ın gözleri yavaşça parlamaya başlamış.",
    "a_giris3": "Ve oda, sessizce, sihirli bir ormana dönüşmüş. Işık Ormanı'na!",
    "p_uyan": "Feza, uyan! Ormanımızın ışığı sönmüş, bize yardım lazım!",
    "p_merhaba": "Bak Feza, orada parlayan bir çiçek var! Hadi ona gidelim!",
    "p_zipla": "Düğmeye bas, hop diye zıpla!",
    "p_cicek_ilk": "Yaşasın, çiçek açtı! Orman biraz aydınlandı!",
    "p_uyuyor": "Bak, bir Pofuduk uyuyor! Üstüne zıplayıp onu uyandıralım mı?",
    "p_uyandi": "Çok yaşa, Pofuduk! Günaydın!",
    "p_karanlik": "Burası çok karanlık. Bekle, ben ışık üfleyeceğim!",
    "p_nilufer": "Bak, nilüferler parlıyor! Üstlerine basarak geçelim!",
    "p_minder": "Bu Pofuduk yumuşacık bir minder gibi! Üstüne zıpla, yükseklere uç!",
    "p_ciftzipla": "Havadayken bir daha bas, ben seni iterim!",
    "p_sakli": "Bak, yukarıda gizli bir yol var! Parlayan tohumları bulalım mı?",
    "p_tohum": "Gizli bir ışık tohumu! Ne kadar güzel parlıyor!",
    "p_buyuk": "Vay, ne kocaman bir Pofuduk! Çiçekleri açarsak belki uyanır.",
    "p_buyuk_goz": "Bak bak, bir gözünü açtı!",
    "p_buyuk_esne": "Esniyor! Bir çiçek daha kaldı!",
    "p_buyuk_kalk": "Uyandı! Hadi, üstüne zıpla!",
    "p_agac": "İşte Işık Ağacı! Hadi Feza, ona dokun!",
    "p_yol": "Bu taraftan Feza, beni takip et!",
    "p_kurtar": "Tuttum seni! Hadi, bir daha deneyelim.",
    "p_aferin1": "Aferin sana!",
    "p_aferin2": "Süpersin, Feza!",
    "p_aferin3": "Harika zıpladın!",
    "p_aferin4": "Bravo!",
    "p_aferin5": "Çok güzel oldu!",
    "p_aferin6": "Sen gerçek bir kahramansın!",
    "a_final1": "Feza ile Pırıl, Işık Ağacı'nı yeniden yakmışlar. Bütün orman ışıl ışıl olmuş, Pofuduklar sevinçle dans etmiş.",
    "a_final2": "Sabah olunca, Feza yatağında gözlerini açmış. Pırıl da ona tatlı tatlı göz kırpmış.",
    "a_final3": "Ve her gece, yeni bir macera onları bekliyordu..."
  }/*SESLER-SON*/;

  // ── öncelik: 3 anlatıcı/sahne · 2 olay ve yönlendirme · 1 ipucu · 0 övgü (meşgulse atılır) ──
  const sesOncelik = k => k.startsWith('a_') || k === 'p_uyan' ? 3 : /^p_aferin/.test(k) ? 0 : k === 'p_yol' ? 1 : 2;
  const sesKim = k => k.startsWith('a_') ? 'a' : 'p';
  const sesBuf = {};          // anahtar → AudioBuffer (bir kez çözülür)
  const sesCoz = {};          // anahtar → çözülme sözü
  let sesSira = [], sesCalan = null, sesKaynak = null, sesBitisZ = null, sesSonOvgu = -1e9, sesOvguGecmis = [];
  const sesSaat = () => performance.now() / 1000;

  function sesSure(k) {
    const d = window.VOICE_DUR && VOICE_DUR[k];
    return d || Math.max(1.4, LINES[k].length / 14 + 0.4);   // kayıt yoksa okuma hızına göre tahmin
  }
  function sesBase64(b64) {
    const s = atob(b64), n = s.length, u = new Uint8Array(n);
    for (let i = 0; i < n; i++) u[i] = s.charCodeAt(i);
    return u.buffer;
  }
  function sesCozumle(k) {     // base64 mp3 → AudioBuffer (Safari'nin eski geri-çağrılı biçimiyle de çalışır)
    if (sesBuf[k]) return Promise.resolve(sesBuf[k]);
    if (sesCoz[k]) return sesCoz[k];
    const ac = typeof AU !== 'undefined' && AU.baglam && AU.baglam();
    if (!ac || !window.VOICE_MP3 || !VOICE_MP3[k]) return Promise.resolve(null);
    return sesCoz[k] = new Promise(res => {
      try {
        const p = ac.decodeAudioData(sesBase64(VOICE_MP3[k]), b => { sesBuf[k] = b; res(b); }, () => res(null));
        if (p && p.then) p.then(b => { sesBuf[k] = b; res(b); }, () => res(null));
      } catch (e) { res(null); }
    });
  }
  // Sık kullanılan cümleleri boşta önceden çöz (ilk konuşmada gecikme olmasın)
  function sesOnceden() {
    if (!window.VOICE_MP3) return;
    const ks = Object.keys(LINES).filter(k => VOICE_MP3[k]);
    let i = 0;
    const adim = () => { if (i >= ks.length) return; sesCozumle(ks[i++]).then(() => setTimeout(adim, 30)); };
    adim();
  }

  function soyle(k, ops) {
    if (k === 'p_aferin') k = sesOvguSec();
    if (!k || !LINES[k]) return;
    const oncelik = ops && ops.oncelik != null ? ops.oncelik : sesOncelik(k);
    const t = sesSaat();
    if (/^p_aferin/.test(k)) {    // övgü: seyrek ve çeşitli; meşgulse hiç söyleme
      if (t - sesSonOvgu < 20 || sesCalan || sesSira.length) return;
      sesSonOvgu = t; sesOvguGecmis.push(k); if (sesOvguGecmis.length > 3) sesOvguGecmis.shift();
    }
    if ((sesCalan && sesCalan.k === k) || sesSira.some(s => s.k === k)) return;   // aynı cümle zaten sırada
    if (oncelik <= 0 && (sesCalan || sesSira.length)) return;
    // daha düşük öncelikli bekleyenleri at (sıra kısa kalsın, eski ipuçları geç gelmesin)
    sesSira = sesSira.filter(s => s.oncelik >= oncelik || s.oncelik >= 3);
    sesSira.push({ k, oncelik, t });
    sesSira.sort((a, b) => b.oncelik - a.oncelik || a.t - b.t);
    if (sesSira.length > 4) sesSira.length = 4;
    // anlatıcı/sahne cümlesi gelirse ve bir ipucu çalıyorsa: ipucu yumuşakça kesilsin
    if (sesCalan && oncelik >= 3 && sesCalan.oncelik < 2) sesKes();
    sesCozumle(k);
    if (!sesCalan) sesSonraki();
  }
  function sesOvguSec() {
    const ks = Object.keys(LINES).filter(x => /^p_aferin\d/.test(x) && !sesOvguGecmis.includes(x));
    return ks.length ? ks[Math.floor(Math.random() * ks.length)] : null;
  }
  function sesKes() {
    if (sesKaynak) { try { sesKaynak.g.gain.setTargetAtTime(0, sesKaynak.ac.currentTime, 0.05); sesKaynak.s.stop(sesKaynak.ac.currentTime + 0.3); } catch (e) {} }
    sesBitti();
  }
  function sesBitti() {
    if (sesBitisZ) { clearTimeout(sesBitisZ); sesBitisZ = null; }
    sesCalan = null; sesKaynak = null;
    if (typeof AU !== 'undefined' && AU.kis) AU.kis(false);
    if (sesSira.length) setTimeout(() => { if (!sesCalan) sesSonraki(); }, 250); // cümleler arası nefes
  }
  function sesSonraki() {
    const t = sesSaat();
    // çok bekleyen ipuçlarını at (anlatıcı hariç)
    while (sesSira.length && sesSira[0].oncelik < 3 && t - sesSira[0].t > 7) sesSira.shift();
    const s = sesSira.shift(); if (!s) return;
    sesCalan = s;
    sesCozumle(s.k).then(buf => {
      if (sesCalan !== s) return;
      const sure = buf ? buf.duration : sesSure(s.k);
      const kim = sesKim(s.k);
      if (typeof ARAYUZ !== 'undefined' && ARAYUZ.altyazi) ARAYUZ.altyazi(LINES[s.k], sure + 0.6, kim);
      OLAY.emit('konusma', { anahtar: s.k, kim, sure });
      let ac = null;
      if (buf && !SESSIZ && typeof AU !== 'undefined' && AU.baglam) ac = AU.baglam();
      if (ac) {
        try {
          const src = ac.createBufferSource(), gg = ac.createGain();
          src.buffer = buf; gg.gain.value = kim === 'a' ? 1.0 : 0.95;
          src.connect(gg); gg.connect(AU.sesCikis());
          AU.kis(true, kim);
          const t0 = ac.currentTime + 0.12;   // müzik önce kısılsın
          src.start(t0);
          sesKaynak = { s: src, g: gg, ac };
          src.onended = () => { if (sesCalan === s) sesBitti(); };
        } catch (e) { ac = null; }
      }
      // yedek zamanlayıcı (onended gelmezse / sessiz modda)
      sesBitisZ = setTimeout(() => { if (sesCalan === s) sesBitti(); }, (sure + (ac ? 0.6 : 0.35)) * 1000);
    });
  }
  let sesHazir = false;
  OLAY.on('durum', d => {
    if (d === 'final' || d === 'giris') sesSira = sesSira.filter(s => s.oncelik >= 3);   // eski ipuçları atılsın
    if (!sesHazir && !SESSIZ) { sesHazir = true; setTimeout(sesOnceden, 400); }        // ses bağlamı artık var
  });
  return { LINES, soyle, konusuyor: () => !!sesCalan, sure: k => LINES[k] ? sesSure(k) : 0 };
})();

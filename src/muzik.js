/* muzik.js – müzik ve sesler (hepsi Web Audio ile üretilir): AU
   Sözleşme: src/SPEC.md. Klasik script; tek üst düzey ad: AU.

   Müzik: müzik kutusu ezgisi + sıcak pad (ana ruh), üstüne yumuşak piyano/çelesta, arp arpejleri, yaylı pad,
   çok hafif "aa" korosu (formant süzgeçli), alçak nabızlar. Bölgeye göre (P.x + BOLUM.bolgeler) karakter değişir ve
   katmanlar yavaşça geçiş yapar; ışık (light) arttıkça katmanlar çoğalır. Büyük Pofuduk uyurken uykulu tuba motifi +
   horlama (OLAY 'horlama' {faz:'al'|'ver', sure} ile pofuduk.js çizimi eşleyebilir). Giriş sahnesi: müzik kutusu ninnisi.
   Ağaç yanınca büyük bir kabarış, ardından sabah ninnisi.
   Hikâye anları (sahne.js OLAY 'sahneAn' {ad, mod}): uyudu · piril_uyandi (ninninin üstüne "rüya" katmanı açılır) ·
   eriyor (arp glissandoları + yükselen parıltı) · orman (sıcak çözülme) · isik (giriş: ışık yükselir / final: altın
   kabarış → final müziği doruğa atlar) · sabah (kuşlar; final müziği çözülüp ninniye bağlanır) · goz_kirp (çelesta).
   Büyük Pofuduk kıpırdadıkça (buyukAsama) açıklıkta umutlu bir çelesta cevabı belirir; uyanınca açıklık müziği
   "şenlik"e döner (akor her ölçüde, neşeli tuba "ım-pa"). Feza'nın peşindeki uyanık Pofuduklar (geçit) için
   zıplayan bir "bup" motifi: kaç Pofuduk varsa o kadar dolu, Feza durunca kısılır; finalde dans ederler.
   Adımlar feza.js'in 'adim' {x,y,hiz,inis} olayıyla, yüzeye göre: yosun / dal (ızgara 2) / nilüfer (sulu) / Pofuduk.
   Besteler (PARCA / TEMA / FINAL_MEL): iki motif her şeyi taşır – Feza'nın sallanan "üç–iki–bir"i ve Pırıl'ın altılı
   sıçrayışı (A–F#'–E'–D'). Başlık/giriş: "Feza ve Pırıl" ana teması (3/4 müzik kutusu, ilk dokunuşta yumuşakça başlar);
   Pırıl uyanınca onun teması (çelesta). Her bölgenin A/B temaları motiflerden; döngüler A → B → A çelesta → B seyrek.
   Pırıl ışık üflerken, Feza'yı kurtarırken ve sabah göz kırparken motifi o anki akora oturtulup alıntılanır.
   Büyük Pofuduk uyanınca şenlik polkası (ım-pa tuba); finalde dans, sonra doruk: Pırıl'ın teması tüm orkestrayla,
   sabah olunca tema kaldığı yerden müzik kutusunda sürer.
   Zamanlama: 2.4 sn'lik ölçüler önceden planlanır (look-ahead), ses sayısı sınırlı, her nota zarflı (çıt yok),
   son katta limiter. ?sessiz → hiç ses yok.

   API: AU.start() · AU.sfx(ad, v) · AU.muzik('orman'|'ninni'|'final') (sahne zorlaması, isteğe bağlı)
        AU.baglam() / AU.sesCikis() / AU.kis(acik, kim) (ses.js konuşma için) · AU.akor() (o anki akorun notaları)
   Olaylar kendiliğinden dinlenir (zıplama, iniş, çiçek, tohum, uyandi, aydinlat, dustu, kurtarildi, agac, buyukAsama...);
   Finalde: 'fener' (her fenere pentatonik tırmanan bir çan) · 'yildizIz' (fırlatılış ışıltısı) · 'sarsinti' (Büyük
   Pofuduk'un neşeli inişi: yumuşak "bumf" + ışıltı; aynı anda gelen AU.sfx('puf') çalmaz).
   eski AU.sfx('jump'|'dbl'|'bloom'|'land'|'splash') çağrıları aynı anda olay geldiyse iki kez çalmaz. */
'use strict';
const AU = (() => {
  // ───────────────────────── temel ─────────────────────────
  let ac = null, test = null, sessizDeneme = false;
  let cikis, limit, master, muzikG, kisG, sfxG, sesG, sahneG, sahneHam, rev, revMuzik, revSfx, revSfxCok, dly, dlyGiris;
  let gurBuf = null, ruzgarG = null, ruzgarBP = null;
  const B = {};                 // müzik katmanı otobüsleri
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  const cl = (v, a, b) => v < a ? a : v > b ? b : v;
  const rnd = Math.random;
  const sec = a => a[Math.floor(rnd() * a.length)];
  const BAR = 2.4;              // ölçü (sn): 4/4'te 8 sekizlik × 0.3 sn; ninnide 3/4, 6 × 0.4 sn
  const zaman = () => test ? test.t : ac.currentTime;
  const isik = () => (typeof light === 'number' ? cl(light, 0, 1) : 0);

  // ───────────────────────── akorlar (MIDI) ─────────────────────────
  // bas: bas notası · pad: ses dizilişi · mel: ezginin kullanabileceği perde sınıfları (çatışmasız)
  const A = (bas, pad, mel) => ({ bas, pad, mel, ton: pad.map(n => n % 12) });
  const AK = {
    D9: A(38, [50, 54, 57, 61, 64], [2, 4, 6, 9, 11, 1]),
    Bm9: A(47, [47, 50, 54, 57, 61], [11, 1, 2, 4, 6, 9]),
    G7: A(43, [43, 50, 54, 59, 62], [7, 9, 11, 2, 4, 6]),
    Asus: A(45, [45, 50, 52, 57, 59], [9, 11, 2, 4, 6]),
    Em9: A(40, [52, 55, 59, 62, 66], [4, 6, 7, 11, 2]),
    A6: A(45, [49, 52, 54, 57, 61], [9, 11, 1, 4, 6]),
    G9s: A(43, [50, 54, 57, 59, 61], [7, 9, 11, 1, 2, 6]),
    Fsm7: A(42, [49, 52, 54, 57, 61], [6, 9, 11, 1, 4]),
    Bm11: A(47, [50, 52, 54, 57, 59], [11, 2, 4, 6, 9]),
    C7s: A(48, [52, 55, 59, 62, 66], [4, 7, 11, 2, 6]),
    Fs7sus: A(42, [47, 52, 54, 59, 61], [6, 11, 1, 4]),
    D: A(38, [50, 54, 57, 62, 66], [2, 6, 9, 4, 11]),
    ACs: A(49, [52, 57, 61, 64, 69], [9, 1, 4, 11, 6]),
    Bm: A(47, [50, 54, 59, 62, 66], [11, 2, 6, 1, 4]),
    DFs: A(42, [50, 57, 62, 66, 69], [2, 6, 9, 4]),
    A: A(45, [49, 52, 57, 61, 64], [9, 1, 4, 11, 6]),
    GD: A(38, [50, 55, 59, 62, 67], [7, 11, 2, 9, 4]),
    G: A(43, [50, 55, 59, 62, 67], [7, 11, 2, 9, 4]),
    Em: A(40, [52, 55, 59, 64, 67], [4, 7, 11, 2, 6]),
  };
  // cb: akor başına ölçü sayısı
  const PROG = {
    patika: { cb: 4, ak: ['D9', 'Bm9', 'G7', 'Asus'] },
    pofuduk: { cb: 2, ak: ['D9', 'G7', 'Em9', 'A6'] },
    gol: { cb: 4, ak: ['G9s', 'D9', 'Fsm7', 'Bm11'] },
    dallar: { cb: 2, ak: ['Bm9', 'G7', 'D9', 'A'] },
    sakli: { cb: 4, ak: ['Em9', 'C7s', 'Bm11', 'Fs7sus'] },
    aciklik: { cb: 4, ak: ['G7', 'D9', 'Em9', 'Asus'] },
    // Büyük Pofuduk uyandıktan sonra açıklık: aynı tonda, akor her ölçüde değişen, zıplayan bir şenlik
    senlik: { cb: 1, ak: ['D', 'G', 'Em9', 'A6', 'D', 'Bm9', 'G9s', 'Asus'] },
    // final: 0–7 şenlik dansı (ım-pa) · 8–15 doruk: Pırıl'ın teması, tüm orkestra · 16–17 çözülme → ninni
    final: { cb: 1, ak: ['D', 'G', 'Em9', 'A6', 'D', 'Bm9', 'G9s', 'Asus', 'D', 'Bm9', 'G7', 'A', 'D', 'Bm9', 'G7', 'A', 'D', 'D'], bitis: 'ninni' },
    ninni: { cb: 1, ak: null },   // akorlar çalınan parçanın ölçülerinden gelir (PARCA.ana / PARCA.piril)
  };

  // ───────────────────────── bestelenmiş temalar ─────────────────────────
  // Yazım: "A5:2 F#6:3 E6:1 | ..." – nota:uzunluk (adım), r = sus, | = ölçü. 4/4 ölçüde 8 sekizlik (0.3 sn),
  // 3/4 ölçüde 6 adım (0.4 sn); ikisi de 2.4 sn. Bütün tema iki motiften doğar:
  //   Feza motifi: üç–iki–bir, sallanan (F#–E–D)     Pırıl motifi: beşliden altılı sıçrama ve iniş (A–F#'–E'–D')
  const notaNo = s => { const m = /^([A-G])(#|b)?(\d)$/.exec(s); return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
  function yaz(metin) {   // → ölçüler: [[adım, nota, uzunluk], ...]
    return metin.split('|').map(o => { let a = 0; const r = []; for (const p of o.trim().split(/\s+/)) { const [n, u] = p.split(':'); if (n !== 'r') r.push([a, notaNo(n), +u]); a += +u; } return r; });
  }
  function parca(akorlar, metin) { const m = yaz(metin); return akorlar.split(' ').map((ak, i) => ({ ak, m: m[i] || [] })); }
  const PARCA = {
    // "Feza ve Pırıl" ana teması (3/4, müzik kutusu): Feza'nın sallanan motifi, Pırıl'ın sıçrayan cevabı
    ana: parca('D GD D A Bm G A D D GD D A Bm Em A D',
      'F#5:3 E5:1 D5:2 | G5:2 B5:2 A5:2 | F#5:3 E5:1 D5:2 | C#5:2 E5:4 | A5:2 F#6:3 E6:1 | B5:3 A5:1 G5:2 | A5:2 B5:2 C#6:2 | D6:6 |' +
      'F#5:3 E5:1 D5:2 | G5:2 B5:2 E6:2 | D6:2 A5:2 F#5:2 | E5:4 C#5:2 | A5:2 F#6:3 E6:1 | D6:3 B5:1 G5:2 | A5:2 C#6:2 E6:2 | D6:6'),
    // Pırıl'ın teması (3/4, çelesta): şefkatli, umutlu – altılı sıçrama, inen ezgi, ikinci yarıda yükselen doruk
    piril: parca('D Bm G A D Bm G A D',
      'A5:2 F#6:3 E6:1 | D6:3 C#6:1 B5:2 | G5:2 E6:3 D6:1 | E6:2 D6:1 C#6:3 | A5:2 F#6:3 E6:1 | D6:3 C#6:1 B5:2 | B5:2 D6:2 G6:2 | F#6:2 E6:1 C#6:3 | D6:6'),
  };
  // Pırıl motifinin baş kısmı (alıntılar: ışık nefesi, kurtarma, göz kırpma)
  const PIRIL_BAS = [[0, 81, 2], [2, 90, 3], [5, 88, 1], [6, 86, 3]];
  // Bölge temaları (4/4): A ve B; döngüler A → B → A (çelesta) → B (seyrek, nefes alan) diye değişir
  const TEMA = {
    patika: {   // D9 ×4 · Bm9 ×4 · G7 ×4 · Asus ×4 – ana temanın yürüyen hâli
      A: yaz('F#6:3 E6:1 D6:4 | r:2 A5:2 B5:2 C#6:2 | D6:3 E6:1 F#6:2 A6:2 | E6:6 r:2 | A5:2 F#6:3 E6:1 D6:2 | C#6:4 B5:4 | r:2 F#5:2 B5:2 D6:2 | C#6:6 r:2 |' +
        'B5:3 A5:1 G5:4 | r:2 D6:2 E6:2 F#6:2 | G6:3 F#6:1 E6:2 D6:2 | B5:6 r:2 | A5:2 E6:3 D6:1 B5:2 | A5:4 r:4 | B5:2 D6:2 E6:2 F#6:2 | E6:6 r:2'),
      B: yaz('A5:2 F#6:3 E6:1 D6:2 | E6:2 F#6:2 A5:4 | B5:2 C#6:2 D6:2 E6:2 | F#6:6 r:2 | F#6:3 E6:1 D6:4 | r:2 B5:2 C#6:2 D6:2 | E6:3 D6:1 C#6:2 B5:2 | B5:6 r:2 |' +
        'D6:2 B6:3 A6:1 G6:2 | F#6:4 D6:4 | E6:3 D6:1 B5:2 G5:2 | A5:6 r:2 | E6:3 D6:1 B5:2 A5:2 | B5:4 r:4 | A5:2 B5:2 D6:2 E6:2 | D6:6 r:2'),
    },
    pofuduk: {  // D9 D9 G7 G7 Em9 Em9 A6 A6 – zıplayan, kesik
      A: yaz('D6:1 r:1 F#6:1 r:1 A6:2 F#6:2 | E6:1 F#6:1 E6:1 D6:1 B5:2 A5:2 | B5:1 r:1 D6:1 r:1 G6:2 F#6:2 | E6:1 F#6:1 E6:1 D6:1 B5:4 |' +
        'G5:1 r:1 B5:1 r:1 E6:2 D6:2 | B5:1 D6:1 B5:1 G5:1 F#5:4 | A5:1 r:1 C#6:1 r:1 E6:2 F#6:2 | E6:2 C#6:2 B5:2 r:2'),
      B: yaz('A5:2 F#6:2 E6:1 D6:1 E6:2 | F#6:4 r:2 A5:2 | B5:2 G6:2 F#6:1 E6:1 D6:2 | E6:4 r:2 D6:1 E6:1 |' +
        'F#6:2 E6:2 D6:2 B5:2 | G5:2 B5:2 E6:4 | C#6:2 E6:2 A6:2 F#6:2 | E6:1 F#6:1 E6:1 C#6:1 B5:2 r:2'),
    },
    gol: {      // G9s ×4 · D9 ×4 · F#m7 ×4 · Bm11 ×4 – geniş, boşluklu, yansıyan
      A: yaz('A5:4 F#6:4 | r:2 D6:4 C#6:2 | B5:8 | r:8 | F#6:4 E6:2 D6:2 | A5:6 r:2 | r:4 B5:2 C#6:2 | D6:8 |' +
        'C#6:4 A6:4 | r:2 F#6:4 E6:2 | C#6:8 | r:8 | B5:4 F#6:4 | E6:4 D6:4 | r:2 A5:2 B5:2 D6:2 | F#6:8'),
      B: yaz('D6:2 B5:2 A5:4 | G5:2 A5:2 B5:4 | r:2 C#6:2 D6:4 | r:8 | A5:2 F#6:3 E6:1 D6:2 | C#6:4 r:4 | B5:2 C#6:2 D6:2 E6:2 | F#6:8 |' +
        'E6:2 C#6:2 A5:4 | B5:4 C#6:4 | r:2 F#6:4 E6:2 | C#6:8 | D6:4 B5:4 | A5:2 B5:2 D6:4 | E6:2 F#6:2 A6:4 | F#6:8'),
    },
    dallar: {   // Bm9 Bm9 G7 G7 D9 D9 A A – tırmanan, canlı
      A: yaz('B5:1 C#6:1 D6:2 F#6:2 D6:2 | E6:1 D6:1 C#6:2 B5:4 | B5:1 D6:1 E6:2 G6:2 E6:2 | F#6:1 E6:1 D6:2 B5:4 |' +
        'A5:2 F#6:3 E6:1 D6:2 | C#6:2 D6:2 E6:2 F#6:2 | A6:3 F#6:1 E6:2 C#6:2 | B5:2 C#6:2 E6:4'),
      B: yaz('F#6:3 E6:1 D6:2 B5:2 | C#6:2 D6:2 E6:4 | D6:3 B5:1 G5:2 B5:2 | D6:2 E6:2 F#6:4 |' +
        'A6:3 F#6:1 E6:2 D6:2 | E6:2 F#6:2 A6:4 | B6:2 A6:2 F#6:2 E6:2 | C#6:6 r:2'),
    },
    sakli: {    // Em9 ×4 · C ×4 · Bm11 ×4 · F#sus ×4 – gizemli, alçak, yavaş
      A: yaz('B5:4 G5:4 | F#5:2 G5:2 B5:4 | E6:6 r:2 | r:8 | D6:4 B5:4 | G5:2 F#5:2 E5:4 | r:2 B5:2 D6:4 | E6:8 |' +
        'D6:4 F#5:4 | A5:2 B5:2 D6:4 | E6:6 r:2 | r:8 | F#5:4 B5:4 | C#6:4 E6:4 | F#6:6 r:2 | r:8'),
      B: yaz('B5:2 G6:3 F#6:1 E6:2 | D6:4 B5:4 | r:2 G5:2 B5:2 D6:2 | E6:8 | E6:2 B5:2 G5:4 | F#5:4 G5:4 | B5:8 | r:8 |' +
        'F#5:2 D6:3 B5:1 A5:2 | B5:8 | r:2 D6:2 E6:2 F#6:2 | E6:8 | C#6:4 B5:4 | F#5:8 | r:4 E6:4 | r:8'),
    },
    aciklik: {  // G7 ×4 · D9 ×4 · Em9 ×4 · Asus ×4 – bekleyiş, ağacın önü
      A: yaz('B5:3 A5:1 G5:4 | r:2 D6:2 B5:4 | A5:4 B5:2 D6:2 | E6:8 | F#6:3 E6:1 D6:4 | r:2 A5:2 B5:2 C#6:2 | D6:6 r:2 | r:8 |' +
        'G5:2 B5:2 E6:4 | D6:3 B5:1 G5:4 | F#5:4 G5:4 | B5:8 | A5:2 E6:3 D6:1 B5:2 | A5:8 | r:2 B5:2 D6:2 E6:2 | E6:6 r:2'),
      B: yaz('D6:2 B6:3 A6:1 G6:2 | F#6:4 D6:4 | E6:2 D6:2 B5:4 | r:8 | A5:2 F#6:3 E6:1 D6:2 | C#6:4 B5:2 A5:2 | B5:4 C#6:4 | D6:6 r:2 |' +
        'B5:2 G6:3 F#6:1 E6:2 | D6:4 B5:4 | G5:2 B5:2 D6:2 E6:2 | F#6:8 | E6:3 D6:1 B5:2 A5:2 | B5:8 | A5:2 B5:2 D6:2 E6:2 | E6:8'),
    },
    senlik: {   // D G Em9 A6 D Bm9 G9s Asus – Büyük Pofuduk uyandı: akılda kalan, oynak bir polka (tuba ım-pa)
      A: yaz('F#6:1 E6:1 D6:1 r:1 A5:1 r:1 D6:2 | B5:1 A5:1 G5:1 r:1 D6:1 r:1 B5:2 | E6:1 F#6:1 G6:1 r:1 E6:1 r:1 B5:2 | C#6:1 B5:1 A5:1 r:1 E6:2 r:2 |' +
        'F#6:1 E6:1 D6:1 r:1 A5:1 r:1 D6:2 | D6:1 C#6:1 B5:1 r:1 F#6:1 r:1 D6:2 | B5:1 C#6:1 D6:1 F#6:1 A6:2 G6:2 | A6:1 r:1 E6:1 r:1 A5:2 r:2'),
      B: yaz('A5:1 r:1 F#6:2 E6:1 D6:1 E6:2 | D6:1 r:1 B5:2 D6:2 G6:2 | F#6:1 E6:1 D6:1 B5:1 E6:2 B5:2 | C#6:2 E6:2 A6:2 r:2 |' +
        'A5:1 r:1 F#6:2 E6:1 D6:1 E6:2 | F#6:1 r:1 D6:2 F#6:2 B6:2 | A6:1 G6:1 F#6:1 D6:1 B5:2 C#6:2 | B5:1 D6:1 E6:2 D6:2 r:2'),
    },
  };
  // final: 0–7 şenliğin B kısmı (dans), 8–15 Pırıl'ın teması (4/4, geniş), 16 çözülme
  const FINAL_MEL = TEMA.senlik.B.concat(yaz(
    'A5:2 F#6:5 E6:1 | D6:5 C#6:1 B5:2 | G5:2 E6:5 D6:1 | E6:3 D6:1 C#6:4 | A5:2 F#6:5 E6:1 | D6:5 C#6:1 B5:2 | B5:2 D6:2 G6:4 | F#6:3 E6:1 C#6:4 | D6:8 | r:8'));
  // diyatonik kaydırma: bir motifi o anki akora en iyi oturan basamağa taşır (alıntılar hep uyumlu)
  const SKALA = []; for (let m = 36; m <= 110; m++) if ([1, 2, 4, 6, 7, 9, 11].includes(m % 12)) SKALA.push(m);
  function diyatonik(n, s) { let i = SKALA.indexOf(n); if (i < 0) { i = 0; while (i < SKALA.length - 1 && SKALA[i] < n) i++; } return SKALA[cl(i + s, 0, SKALA.length - 1)]; }
  function uyarla(notalar, ak) {
    let enIyi = 0, enP = -1;
    for (const s of [0, -2, 2, -1, 1, 3, -3]) {
      let p = 0; for (const [, n, u] of notalar) if (ak.mel.includes(diyatonik(n, s) % 12)) p += u >= 2 ? 2 : 1;
      if (p > enP) { enP = p; enIyi = s; }
    }
    return notalar.map(([a, n, u]) => [a, diyatonik(n, enIyi), u]);
  }
  // katman karışımları (bölge/mod) – ışıkla ayrıca ölçeklenir
  const KARISIM = {
    patika: { zil: 1, pad: 1, tus: 0.55, arp: 0.5, tel: 0.45, koro: 0.15, bas: 0.7, tuba: 0, hop: 1, rev: 0.75, dly: 0.5 },
    pofuduk: { zil: 1, pad: 0.8, tus: 0.9, arp: 0.65, tel: 0.35, koro: 0.1, bas: 1, tuba: 0.4, hop: 1, rev: 0.6, dly: 0.35 },
    gol: { zil: 0.9, pad: 1.1, tus: 0.65, arp: 0.9, tel: 0.7, koro: 0.9, bas: 0.45, tuba: 0, hop: 0.45, rev: 1.3, dly: 0.8 },
    dallar: { zil: 1, pad: 0.9, tus: 0.7, arp: 1, tel: 1, koro: 0.45, bas: 1, tuba: 0, hop: 0.9, rev: 0.8, dly: 0.45 },
    sakli: { zil: 0.85, pad: 1, tus: 0.85, arp: 0.55, tel: 0.6, koro: 1, bas: 0.55, tuba: 0, hop: 0.5, rev: 1.15, dly: 0.9 },
    aciklik: { zil: 0.9, pad: 1, tus: 0.6, arp: 0.6, tel: 0.7, koro: 0.5, bas: 0.6, tuba: 1, hop: 0.6, rev: 0.9, dly: 0.5 },
    senlik: { zil: 1.1, pad: 0.85, tus: 1, arp: 0.9, tel: 0.85, koro: 0.55, bas: 1, tuba: 0.8, hop: 1.1, rev: 0.7, dly: 0.45 },
    final: { zil: 1.1, pad: 1.15, tus: 0.9, arp: 1.1, tel: 1.35, koro: 1.25, bas: 1.1, tuba: 0.8, hop: 0.75, rev: 1.1, dly: 0.55 },
    baslik: { zil: 1, pad: 0.45, tus: 0.2, arp: 0.2, tel: 0.15, koro: 0, bas: 0.3, tuba: 0, hop: 0, rev: 0.8, dly: 0.5 },
    ninni: { zil: 1.1, pad: 0.55, tus: 0.25, arp: 0.35, tel: 0.3, koro: 0, bas: 0.35, tuba: 0, hop: 0, rev: 0.75, dly: 0.45 },
    // rüya: giriş sahnesinde Pırıl uyanıp oda eridikçe ninninin üstüne koro, yaylı ve arp açılır
    ruya: { zil: 1, pad: 1.2, tus: 0.45, arp: 1, tel: 0.95, koro: 0.7, bas: 0.5, tuba: 0, hop: 0, rev: 1.3, dly: 0.75 },
  };
  // katmanların temel düzeyleri (otobüs kazancı = temel × karışım × ışık etkisi)
  const TEMEL = { zil: 1, pad: 0.75, tus: 1.2, arp: 1, tel: 0.026, koro: 0.09, bas: 0.9, tuba: 1, hop: 1 };
  function isikEtkisi(k, l, m) {
    if (m !== 'orman') return 1;
    switch (k) {
      case 'zil': return 0.85 + 0.15 * l;
      case 'tus': return 0.35 + 0.65 * l;
      case 'arp': return cl(0.15 + 1.1 * l, 0, 1);
      case 'tel': return 0.25 + 0.75 * l;
      case 'koro': return 0.25 + 0.75 * l * l;
      case 'bas': return 0.55 + 0.45 * l;
      default: return 1;
    }
  }

  // ───────────────────────── ses sınırlama + yardımcı düğümler ─────────────────────────
  const SINIR = 80;             // aynı anda en çok geçici osilatör (eşlik notaları; ezgi ve sahne geçişleri öncelikli)
  // bitiş zamanları sabit boyutlu bir halkada (dizi kopyalama / çöp yok); dolarsa en eski kayıt üstüne yazılır
  const YUK_N = 256, yuk = new Float64Array(YUK_N), yukB = new Float64Array(YUK_N);   // bitiş / başlangıç
  let yukI = 0, yukTepe = 0, yukDus = 0;
  // n osilatör yer var mı? (zorunlu: yine de çal). kayit: t1'de biten kaç tanesi kaydedilsin (kalanı ek() ile,
  // kendi – daha erken – bitişleriyle). Final doruğunda ezgi notaları 'oncelikli' (sınır 96, atılmaz).
  let oncelikli = false;
  function yerVar(n, t0, t1, zorunlu, kayit) {
    let c = 0; for (let i = 0; i < YUK_N; i++) if (yuk[i] > t0 && yukB[i] <= t0 + 0.05) c++;   // t0 anında çalan
    if (!zorunlu && !oncelikli && c + n > (mod === 'final' ? 96 : SINIR)) { yukDus++; return false; }
    const k = kayit == null ? n : kayit;
    for (let i = 0; i < k; i++) { yuk[yukI] = t1; yukB[yukI] = t0; yukI = (yukI + 1) & (YUK_N - 1); }
    yukT0 = t0;
    if (c + n > yukTepe) yukTepe = c + n;
    return true;
  }
  let yukT0 = 0;
  function ek(t1) { yuk[yukI] = t1; yukB[yukI] = yukT0; yukI = (yukI + 1) & (YUK_N - 1); }
  const panlar = new WeakMap();
  function panla(hedef, p) {     // otobüs başına 9 sabit pan konumu (nota başına panner yok)
    if (!ac.createStereoPanner || !p) return hedef;
    const q = Math.round(cl(p, -1, 1) * 4);
    if (!q) return hedef;
    let m = panlar.get(hedef); if (!m) { m = {}; panlar.set(hedef, m); }
    if (!m[q]) { const pn = ac.createStereoPanner(); pn.pan.value = q / 4; pn.connect(hedef); m[q] = pn; }
    return m[q];
  }
  function osc(tip, f, t0, t1, hedef, det) {
    const o = ac.createOscillator(); o.type = tip; o.frequency.value = f; if (det) o.detune.value = det;
    o.connect(hedef); o.start(t0); o.stop(t1); return o;
  }
  function kazanc(v, hedef) { const g = ac.createGain(); g.gain.value = v; if (hedef) g.connect(hedef); return g; }
  function zarf(t0, atk, tepe, dec, hedef) {   // hızlı vuruş + üstel sönüm (sonunda ~-80 dB, çıt yok)
    const g = ac.createGain();
    g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(tepe, t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + atk + dec);
    if (hedef) g.connect(hedef); return g;
  }
  function suzgec(tip, f, Q, hedef) { const b = ac.createBiquadFilter(); b.type = tip; b.frequency.value = f; b.Q.value = Q; if (hedef) b.connect(hedef); return b; }
  function hedefle(param, v, t, tau) { param.setTargetAtTime(v, t, tau); }

  // ───────────────────────── çalgılar ─────────────────────────
  // müzik kutusu / çan: temel + çabuk sönen üst kısmi sesler
  function zil(f, t, vol, dec, pan, hedef, gecikme) {
    if (test && test.log && oncelikli) test.log.push(['z', +t.toFixed(2), Math.round(69 + 12 * Math.log2(f / 440)), progAd]);
    const h2var = f * 4.2 < 14000 && vol > 0.012;
    if (!yerVar(h2var ? 3 : 2, t, t + dec, false, 1)) return;
    ek(t + dec * 0.36); if (h2var) ek(t + dec * 0.14);
    hedef = hedef || B.zil;
    const out = zarf(t, 0.004, vol, dec, panla(hedef, pan));
    if (gecikme !== false) out.connect(dlyGiris);
    osc('sine', f, t, t + dec + 0.05, out);
    const h1 = zarf(t, 0.003, 0.2, dec * 0.32, out); osc('sine', f * 2, t, t + dec * 0.36 + 0.05, h1);
    if (h2var) { const h2 = zarf(t, 0.002, 0.07, dec * 0.12, out); osc('sine', f * 4.2, t, t + dec * 0.14 + 0.05, h2); }
  }
  // yumuşak piyano / çelesta: üçgen + oktav, kararan süzgeç
  function tus(n, t, vol, dec, pan, parlak, hedef) {
    if (test && test.log && oncelikli) test.log.push(['c', +t.toFixed(2), n, progAd]);
    if (!yerVar(2, t, t + dec, false, 1)) return;
    ek(t + dec * 0.5);
    const f = NOTE(n);
    const out = zarf(t, 0.005, vol, dec, panla(hedef || B.tus, pan));
    const lp = suzgec('lowpass', Math.min(9000, f * (parlak ? 9 : 5)), 0.5, out);
    lp.frequency.setTargetAtTime(Math.min(4000, f * 1.6), t + 0.02, dec * 0.25);
    osc('triangle', f, t, t + dec + 0.08, lp);
    osc('sine', f * (parlak ? 4 : 2), t, t + dec * 0.5, kazanc(parlak ? 0.12 : 0.28, lp));
  }
  // arp telinin çekilmesi
  function arp(n, t, vol, pan, dec, hedef) {
    const f = NOTE(n); dec = dec || cl(2.6 - (n - 50) * 0.04, 0.7, 2.4);
    if (!yerVar(2, t, t + dec, false, 1)) return;
    ek(t + dec * 0.4);
    const out = zarf(t, 0.002, vol, dec, panla(hedef || B.arp, pan));
    osc('triangle', f, t, t + dec + 0.05, out);
    osc('sine', f * 2, t, t + dec * 0.4, zarf(t, 0.002, 0.35, dec * 0.3, out));
  }
  // sıcak pad (her akorda yeni, uzun çapraz geçiş)
  let padSon = null;
  function padBirak(t) {   // bölge değişince eski akorun padi ortada asılı kalmasın
    if (!padSon) return;
    try { padSon.gain.cancelScheduledValues(t); padSon.gain.setTargetAtTime(0, t, 0.9); } catch (e) {}
    padSon = null;
  }
  function pad(ak, t0, dur) {
    const atk = Math.min(3, dur * 0.45), rel = Math.min(3.5, Math.max(1.2, dur * 0.6));
    if (!yerVar(ak.pad.length * 2 + 2, t0, t0 + dur + rel, true)) return;
    const lp = suzgec('lowpass', 520 + isik() * 1500, 0.4);
    const vg = ac.createGain();
    vg.gain.value = 0; vg.gain.setValueAtTime(0, t0); vg.gain.linearRampToValueAtTime(0.05, t0 + atk);
    vg.gain.setValueAtTime(0.05, t0 + dur); vg.gain.linearRampToValueAtTime(0, t0 + dur + rel);
    lp.connect(vg); vg.connect(B.pad); padSon = vg;
    const son = t0 + dur + rel + 0.1;
    ak.pad.forEach((n, i) => {
      osc('sine', NOTE(n), t0, son, kazanc(0.55, lp), i % 2 ? 4 : -4);
      osc('sawtooth', NOTE(n), t0, son, kazanc(0.16, lp), i % 2 ? -7 : 7);
    });
    // alt bas (yumuşak)
    const bg = ac.createGain(); bg.gain.value = 0; bg.gain.setValueAtTime(0, t0); bg.gain.linearRampToValueAtTime(0.05, t0 + atk * 0.7);
    bg.gain.setValueAtTime(0.05, t0 + dur); bg.gain.linearRampToValueAtTime(0, t0 + dur + rel * 0.8); bg.connect(B.pad);
    osc('sine', NOTE(ak.bas), t0, son, bg);
    osc('sine', NOTE(ak.bas + 12), t0, son, kazanc(0.25, bg));
  }
  // bas notaları: uzun / nabız / pizzicato
  function bas(n, t, vol, tip, dur) {
    const f = NOTE(n);
    if (tip === 'uzun') {
      if (!yerVar(2, t, t + dur + 1)) return;
      const g = ac.createGain(); g.gain.value = 0; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.35);
      g.gain.setTargetAtTime(vol * 0.6, t + 0.4, dur * 0.4); g.gain.setTargetAtTime(0, t + dur, 0.25); g.connect(B.bas);
      osc('sine', f, t, t + dur + 1.4, g); osc('sine', f * 2, t, t + dur + 1.4, kazanc(0.3, g));
    } else if (tip === 'nabiz') {
      if (!yerVar(2, t, t + 0.9)) return;
      const g = zarf(t, 0.02, vol, 0.75, B.bas);
      osc('sine', f, t, t + 0.85, g); osc('sine', f * 2, t, t + 0.5, kazanc(0.35, g));
    } else {   // pizz
      if (!yerVar(2, t, t + 0.6)) return;
      const g = zarf(t, 0.004, vol, 0.45, B.bas);
      const lp = suzgec('lowpass', f * 6, 0.7, g); lp.frequency.setTargetAtTime(f * 2, t, 0.06);
      osc('triangle', f, t, t + 0.55, lp); osc('sine', f * 2, t, t + 0.3, kazanc(0.4, lp));
    }
  }
  // tuba/fagot: uykulu, komik (testere dişi + kapanan süzgeç, sonda perde düşer)
  function tuba(n, t, dur, vol, dusus, hedef) {
    if (!yerVar(2, t, t + dur + 0.3, true)) return;
    const f = NOTE(n);
    const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.06);
    g.gain.setTargetAtTime(vol * 0.7, t + 0.08, dur * 0.5); g.gain.setTargetAtTime(0.0001, t + dur, 0.06); g.connect(hedef || B.tuba);
    const lp = suzgec('lowpass', f * 3.2, 1.2, g);
    lp.frequency.setValueAtTime(f * 1.5, t); lp.frequency.exponentialRampToValueAtTime(f * 4.5, t + 0.07); lp.frequency.setTargetAtTime(f * 2.5, t + 0.1, dur * 0.4);
    const o1 = osc('sawtooth', f, t, t + dur + 0.4, lp), o2 = osc('square', f * 0.5, t, t + dur + 0.4, kazanc(0.25, lp));
    if (dusus) for (const o of [o1, o2]) { o.detune.setValueAtTime(0, t + dur * 0.55); o.detune.linearRampToValueAtTime(dusus, t + dur + 0.1); }
  }
  // zıplayan "bup" (Pofuduk geçidi): perdesi aşağıdan sıçrayan yumuşak sinüs + minik tahta tıkırtısı (marimba gibi)
  function hop(n, t, vol, pan, hedef) {
    if (!yerVar(2, t, t + 0.42)) return;
    const f = NOTE(n);
    const g = zarf(t, 0.006, vol, 0.34, panla(hedef || B.hop, pan));
    const o = osc('sine', f, t, t + 0.42, g);
    o.frequency.setValueAtTime(f * 0.7, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
    osc('triangle', f * 3, t, t + 0.08, zarf(t, 0.002, 0.1, 0.06, g));
  }
  // kabarış: yavaşça açılan, sonra sönen sıcak akor (sahne geçişleri). Tek zarf + tek süzgeç, nota başına iki sinüs.
  function kabar(notalar, t, atk, kal, rel, vol, hedef, parlak) {
    if (!yerVar(notalar.length * 2, t, t + atk + kal + rel, true)) return;
    const son = t + atk + kal + rel + 0.1;
    const g = ac.createGain();
    g.gain.value = 0; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + atk);
    g.gain.setValueAtTime(vol, t + atk + kal); g.gain.linearRampToValueAtTime(0, t + atk + kal + rel);
    g.connect(hedef || sahneG);
    const lp = suzgec('lowpass', parlak ? 600 : 400, 0.5, g);
    lp.frequency.setValueAtTime(parlak ? 600 : 400, t); lp.frequency.linearRampToValueAtTime(parlak ? 4200 : 2200, t + atk);
    lp.frequency.setTargetAtTime(900, t + atk + kal, rel * 0.5);
    notalar.forEach((n, i) => {
      const k = n < 52 ? 0.9 : 0.5;
      osc('sine', NOTE(n), t, son, kazanc(k, lp), i % 2 ? 5 : -5);
      osc('triangle', NOTE(n), t, son, kazanc(k * 0.35, lp), i % 2 ? -6 : 6);
    });
  }

  // ───────────────────────── kalıcı sesler: yaylılar + koro ─────────────────────────
  const tel = [], koro = [];
  function kaliciKur() {
    const lfo = ac.createOscillator(); lfo.frequency.value = 4.6; lfo.start();
    const lfoTel = kazanc(5, null), lfoKoro = kazanc(9, null); lfo.connect(lfoTel); lfo.connect(lfoKoro);
    const telLP = suzgec('lowpass', 1500, 0.5, B.tel);
    B.telLP = telLP;
    const telHP = suzgec('highpass', 160, 0.5, telLP);
    [62, 66, 69, 73].forEach((n, i) => {
      const v = { n, o: [] };
      for (const det of [-7, 8]) {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = NOTE(n); o.detune.value = det;
        lfoTel.connect(o.detune); o.connect(panla(telHP, (i - 1.5) * 0.25 + det / 40)); o.start(); v.o.push(o);
      }
      tel.push(v);
    });
    // "aa" korosu: testere dişi → üç formant (F1 ~800, F2 ~1150, F3 ~2800)
    const kIn = ac.createGain(); kIn.gain.value = 1;
    for (const [f, q, gv] of [[780, 7, 1], [1160, 9, 0.5], [2800, 12, 0.22]]) { const bp = suzgec('bandpass', f, q, null); kIn.connect(bp); bp.connect(kazanc(gv, B.koro)); }
    [62, 66, 69].forEach((n, i) => {
      const v = { n, o: [] };
      for (const det of [-11, 10]) {
        const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = NOTE(n); o.detune.value = det;
        lfoKoro.connect(o.detune); o.connect(panla(kIn, (i - 1) * 0.5)); o.start(); v.o.push(o);
      }
      koro.push(v);
    });
  }
  function sesYurut(sesler, ak, lo, hi, t, tau) {   // akora en yakın notalarla yumuşak geçiş (ses yürütme)
    const aday = []; for (let m = lo; m <= hi; m++) if (ak.ton.includes(m % 12)) aday.push(m);
    const alinan = new Set();
    for (const v of sesler) {
      let en = null, ed = 1e9;
      for (const m of aday) { if (alinan.has(m)) continue; const d = Math.abs(m - v.n); if (d < ed) { ed = d; en = m; } }
      if (en == null) continue; alinan.add(en); v.n = en;
      for (const o of v.o) hedefle(o.frequency, NOTE(en), t, tau);
    }
  }

  // ───────────────────────── durum okuma (oyundan) ─────────────────────────
  let mod = 'ninni', zorlaMod = null, bolge = 'patika', bolgeAday = 'patika', bolgeAdayT = 0;
  let buyukPof = null;
  function bolgeBul() {
    if (typeof BOLUM === 'undefined' || typeof P === 'undefined' || !BOLUM.bolgeler) return bolge;
    let s = null;
    for (const b of BOLUM.bolgeler) if (P.x >= b.x0 && P.x < b.x1 && (!b.ust || P.y < b.ust)) s = b.ad;
    return s && PROG[s] ? s : bolge;
  }
  function oku() {   // test bunu değiştirebilir
    const d = typeof DURUM !== 'undefined' ? DURUM : 'oyun';
    if (!buyukPof && typeof NESNELER !== 'undefined') buyukPof = NESNELER.find(n => n.tip === 'buyukPofuduk') || null;
    const bp = buyukPof;
    // Feza'nın peşindeki uyanık Pofuduk sayısı (geçit töreni) – nesne listesi üstünden, ayırma yapmadan
    let takip = 0;
    if (typeof NESNELER !== 'undefined') for (let i = 0; i < NESNELER.length; i++) { const o = NESNELER[i]; if (o.tip === 'pofuduk' && o.pf && o.pf.durum === 'takip') takip++; }
    return {
      durum: d, bolge: bolgeBul(), light: isik(),
      uyku: bp && !bp.uyandi && d === 'oyun' && typeof P !== 'undefined' ? cl(1.15 - Math.abs(P.x - bp.x) / 950, 0, 1) : 0,
      uykuYakin: bp && typeof P !== 'undefined' ? cl(1.15 - Math.abs(P.x - bp.x) / 950, 0, 1) : 0,
      uyandi: !!(bp && bp.uyandi),
      takip, hareket: typeof P !== 'undefined' && Math.abs(P.vx || 0) > 40 ? 1 : 0,
    };
  }
  // sahne/hikâye durumu (olaylardan): rüya katmanı, Büyük Pofuduk aşaması, finalde atlama isteği, geçidin hareketi
  let ruya = 0, asama = 0, finalIstek = null, gecitHareket = 0, sabahKus = false;
  // orman modunda çalınacak bölüm: Büyük Pofuduk uyanınca açıklık şenliğe döner
  const ormanAd = d => bolge === 'aciklik' && d && d.uyandi ? 'senlik' : bolge;
  let okuFn = oku;

  // ───────────────────────── ölçü planlayıcı ─────────────────────────
  let progAd = 'ninni', pi = 0, bic = 0, cubukNo = 0, sonrakiCubuk = 0, akor = AK.D, oncekiAk = null;
  const akorlar = [];           // [{t, ak}]
  function akorAt(t) { for (let i = akorlar.length - 1; i >= 0; i--) if (akorlar[i].t <= t + 0.02) return akorlar[i].ak; return akor; }
  let d0 = null;                // son okunan oyun durumu

  // ninni: hangi parçanın kaçıncı ölçüsü çalıyor (ana tema döner; Pırıl uyanınca onun teması araya girer)
  let ninniSira = { ad: 'ana', i: 0 }, pirilBekle = false, dongu = 0;
  const ninniIleri = s => s.i + 1 < PARCA[s.ad].length ? { ad: s.ad, i: s.i + 1 } : { ad: 'ana', i: 0 };
  function ninniBas(s) { ninniSira = s || { ad: 'ana', i: 0 }; }
  function cubukPlanla(t) {
    const d = d0;
    const istenen = mod === 'orman' ? ormanAd(d) : mod === 'baslik' ? 'ninni' : mod;
    if (istenen !== progAd && (mod !== 'orman' || bic % 2 === 0 || istenen === 'senlik' || progAd === 'ninni' || progAd === 'final')) {
      if (!(progAd === 'final' && mod === 'final')) {
        if (istenen === 'ninni' && progAd !== 'ninni') ninniBas();
        progAd = istenen; pi = 0; bic = 0; dongu = 0; padBirak(t); oncekiAk = null;
      }
    }
    // final sahnesi: altın ışık dolunca doruğa (8. ölçü: Pırıl'ın teması). Sabah olunca tema, kaldığı yerden
    // yatak odasında müzik kutusuyla (3/4) sürer; ardından ana tema.
    if (progAd === 'final' && bic === 0 && finalIstek) {
      if (finalIstek === 'zirve' && pi < 8) pi = 8;
      else if (finalIstek === 'sabah') {
        ninniBas(pi >= 17 ? null : { ad: 'piril', i: pi > 8 ? Math.min(pi - 8, PARCA.piril.length - 1) : 0 });
        mod = 'ninni'; progAd = 'ninni'; pi = 0; bic = 0; dongu = 0; padBirak(t); oncekiAk = null;
      }
      finalIstek = null;
    }
    // Pırıl uyandı (giriş): ana temanın yarım cümle sonunda onun teması başlar
    if (progAd === 'ninni' && pirilBekle && ninniSira.ad === 'ana' && ninniSira.i % 2 === 0) { ninniSira = { ad: 'piril', i: 0 }; pirilBekle = false; }
    const pr = PROG[progAd];
    if (bic === 0) {
      const ninni = progAd === 'ninni', akAd = ninni ? PARCA[ninniSira.ad][ninniSira.i].ak : pr.ak[pi];
      const ak = AK[akAd];
      akorlar.push({ t, ak }); if (akorlar.length > 6) akorlar.shift();
      if (ak !== oncekiAk) {
        let n = 1;
        if (ninni) { let s = ninniIleri(ninniSira); while (n < 4 && PARCA[s.ad][s.i].ak === akAd) { n++; s = ninniIleri(s); } }
        else while (n < pr.ak.length && pr.ak[(pi + n) % pr.ak.length] === pr.ak[pi]) n++;
        pad(ak, t, n * pr.cb * BAR);
        sesYurut(tel, ak, 57, 78, t, progAd === 'ninni' ? 0.1 : 0.045);
        sesYurut(koro, ak, 59, 72, t, 0.08);
      }
      akor = ak; oncekiAk = ak;
    }
    const l = d.light;
    if (progAd === 'ninni') ninniCubuk(t);
    else if (progAd === 'final') finalCubuk(t, pi);
    else ormanCubuk(t, akor, progAd, bic, pr.cb, l, d);
    if (mod === 'orman' && d.uyku > 0.02 && progAd === 'aciklik') uykuCubuk(t, d.uyku);
    if (mod === 'orman' && d.takip > 0 && PROG[progAd].ak) gecitCubuk(t, akor, d.takip, progAd);
    // ilerle
    bic++;
    if (progAd === 'ninni') { ninniSira = ninniIleri(ninniSira); bic = 0; pi++; }
    else if (bic >= pr.cb) { bic = 0; pi++; if (pi >= pr.ak.length) { pi = 0; dongu++; if (pr.bitis && mod === progAd) { mod = pr.bitis; } } }
    cubukNo++;
  }

  // ── orman: bestelenmiş bölge temaları (TEMA) + bölgeye göre eşlik ostinatoları ──
  // Döngü: 0 A müzik kutusu · 1 B müzik kutusu (+ alt oktav çelesta) · 2 A çelesta (üstte çan ışıltısı) · 3 B seyrek (nefes)
  // Işık azken ve Büyük Pofuduk uyurken süs notaları seyrelir; motifin vurgulu notaları (ölçü başı / uzun) hep çalar.
  let ezgiSusT0 = -1, ezgiSusT1 = -1;   // Pırıl'ın motifi alıntılanırken bölge ezgisi bir an susar (iki ezgi çakışmasın)
  function ezgiSus(t0, t1) { ezgiSusT0 = t0; ezgiSusT1 = t1; }
  function akorTonu(ak, n) { for (let d = 0; d < 6; d++) { if (ak.ton.includes((n - d + 120) % 12)) return n - d; if (ak.ton.includes((n + d) % 12)) return n + d; } return n; }
  function ormanCubuk(t, ak, b, bic, cb, l, d) {
    const S8 = 0.3, hum = () => (rnd() - 0.5) * 0.008;
    const uykuSus = d.uyku > 0.3 ? 0.55 : 1;
    const tema = TEMA[b];
    if (tema) {
      const v = dongu % 4, A = v === 0 || v === 2, bars = A ? tema.A : tema.B;
      const mel = bars[(pi * cb + bic) % bars.length] || [];
      const celesta = v === 2, seyrek = v === 3;
      const vol0 = b === 'gol' || b === 'sakli' ? 0.044 : 0.05;
      const dec0 = b === 'gol' ? 3.2 : b === 'pofuduk' ? 1.6 : b === 'senlik' ? 1.4 : b === 'sakli' ? 2.8 : 2.4;
      oncelikli = true;   // ezgi hiç atılmaz; eşlik atılabilir
      for (const [s, n, u] of mel) {
        const vurgu = s === 0 || u >= 3, ts = t + s * S8 + hum();
        if (ts > ezgiSusT0 - 0.15 && ts < ezgiSusT1) continue;
        if (!vurgu && ((seyrek && s % 4) || (l < 0.1 && rnd() < 0.3) || (uykuSus < 1 && rnd() < 0.45))) continue;
        const pan = cl((n - 84) * 0.05, -0.45, 0.45), vv = vol0 * (vurgu ? 1.1 : 0.88) * (seyrek ? 0.85 : 1);
        const dec = Math.min(dec0, 0.9 + u * 0.45) + (b === 'gol' ? 0.6 : 0);
        if (celesta) {
          tus(n, ts, vv * 0.85, dec + 0.4, pan, true, B.zil);
          if (vurgu && l > 0.25) zil(NOTE(n + 12), ts + 0.012, vv * 0.32, 1.4, -pan, null, false);
        } else {
          zil(NOTE(n), ts, vv, dec, pan);
          if (v === 1 && u >= 4 && l > 0.4) tus(n - 12, ts + 0.01, 0.018, 2, -pan, false);
          if (vurgu && l > 0.55 && u >= 3 && !seyrek) zil(NOTE(n + 12), ts + 0.2, 0.016, 1.6, -pan, null, true);
        }
        if ((b === 'gol' || b === 'sakli') && vurgu && l > 0.2 && !celesta) tus(n, ts, 0.016, 2.2, pan, true);
        if (b === 'senlik' && vurgu) tus(n - 12, ts, 0.016, 0.9, -pan, true);   // şenlikte ezgiye alt oktavdan çelesta eşliği
      }
      oncelikli = false;
    }
    // arp
    const tonlar = (taban, adet) => { const r = []; for (let m = taban; r.length < adet && m < taban + 40; m++) if (ak.ton.includes(m % 12)) r.push(m); return r; };
    const av = 0.045;
    if (b === 'patika') { if (bic === 0 || (bic === 2 && l > 0.4)) tonlar(ak.bas + 24, 5).forEach((n, i) => arp(n, t + i * 0.11, av * 0.8, -0.3 + i * 0.15)); }
    else if (b === 'pofuduk') { const tn = tonlar(ak.bas + 24, 4); [1, 3, 5, 7].forEach((s, i) => { if (rnd() < 0.85) arp(tn[(i + cubukNo) % tn.length], t + s * S8, av * 0.7, i % 2 ? 0.3 : -0.3, 0.6); }); }
    else if (b === 'gol') {
      if (bic === 0) tonlar(ak.bas + 19, 9).forEach((n, i) => arp(n, t + i * 0.075, av * (0.55 + i * 0.04), -0.6 + i * 0.15, 2.6));
      else if (rnd() < 0.7) arp(sec(tonlar(ak.bas + 36, 4)), t + sec([2, 4, 5]) * S8, av * 0.6, (rnd() - 0.5), 2.4);
    } else if (b === 'dallar') { const tn = tonlar(ak.bas + 12, 5), yol = [0, 1, 2, 3, 4, 3, 2, 1]; yol.forEach((k, s) => arp(tn[k], t + s * S8 + hum(), av * (s % 2 ? 0.55 : 0.75), (k - 2) * 0.2, 1.2)); }
    else if (b === 'sakli') { const tn = tonlar(ak.bas + 24, 4); [0, 2, 1, 3].forEach((k, i) => arp(tn[k], t + i * 0.6, av * 0.55, (i - 1.5) * 0.3, 2)); }
    else if (b === 'aciklik') {
      const tn = tonlar(ak.bas + 24, 4); [0, 1, 2, 3].forEach((k, i) => { if (rnd() < (0.8 + 0.1 * asama) * uykuSus) arp(tn[k], t + i * 0.6, av * 0.6, (i - 1.5) * 0.25, 1.8); });
      // Büyük Pofuduk kıpırdadıkça (aşama 1–2) umutlu, yukarı tırmanan küçük bir çelesta cevabı belirir
      if (asama >= 1 && (asama >= 2 || bic % 2 === 1)) { const um = tonlar(ak.bas + 36 + (asama >= 2 ? 2 : 0), 4); um.forEach((n, i) => tus(n, t + (4 + i) * S8, 0.016 + 0.003 * i, 1.6, -0.3 + i * 0.2, true)); }
    }
    else if (b === 'senlik') {   // sıçrayan kırık akor: aşağı-yukarı, her sekizlikte
      const tn = tonlar(ak.bas + 24, 5), yol = [0, 2, 1, 3, 2, 4, 3, 1];
      yol.forEach((k, s) => { if (s % 2 || rnd() < 0.7) arp(tn[k], t + s * S8 + hum(), av * (s % 2 ? 0.5 : 0.62), (k - 2) * 0.22, 0.9); });
      if (bic === 0 && cubukNo % 4 === 0) { const kf = tonlar(86, 6); for (let i = 0; i < 6; i++) zil(NOTE(kf[i]), t + 1.2 + i * 0.06, 0.014, 1.2, (i % 2 ? 0.5 : -0.5), null, false); }   // konfeti ışıltısı
    }
    // tuşlu (piyano/çelesta)
    const ust = ak.pad.slice(1).map(n => n + 12);
    if (b === 'pofuduk' || b === 'senlik') { [2, 6].forEach(s => ust.slice(b === 'senlik' ? 2 : 1).forEach((n, i) => tus(n, t + s * S8 + i * 0.012, b === 'senlik' ? 0.019 : 0.022, 0.35, (i - 1) * 0.3))); }
    else if (b === 'dallar') { [0, 3].forEach(s => ust.forEach((n, i) => tus(n, t + s * S8 + i * 0.02, 0.02, 1.3, (i - 1.5) * 0.25))); }
    else if (b === 'gol') { if (rnd() < 0.6) tus(sec(ust) + 12, t + sec([3, 7]) * S8, 0.02, 2.4, rnd() - 0.5, true); }
    else if (b === 'sakli') { const n = sec(ust) + 12; tus(n, t + 1.2, 0.022, 2, 0.3, true); tus(akorTonu(ak, n - 3), t + 1.8, 0.018, 2, -0.3, true); }
    else if (bic === 0) ust.forEach((n, i) => tus(n, t + i * 0.06, 0.024, 2.6, (i - 1.5) * 0.3));
    // bas / nabız
    const bv = 0.11;
    if (b === 'senlik') {   // uyanan Büyük Pofuduk'un tubası artık neşeli: "ım-pa, ım-pa"
      const kok = ak.bas < 43 ? ak.bas + 12 : ak.bas;
      tuba(kok, t, 0.22, 0.075, 0); tuba(kok + 7, t + 4 * S8, 0.2, 0.06, 0);
      if (pi % 4 === 3) { tuba(kok + 4, t + 6 * S8, 0.12, 0.05, 0); tuba(kok + 5, t + 7 * S8, 0.12, 0.05, 0); }
      bas(ak.bas + 12, t + 2 * S8, bv * 0.45, 'pizz'); bas(ak.bas + 12, t + 6 * S8, bv * 0.45, 'pizz');
    }
    else if (b === 'pofuduk') { bas(ak.bas + 12, t, bv, 'pizz'); bas(ak.bas + 19, t + 4 * S8, bv * 0.8, 'pizz'); if (rnd() < 0.5) bas(ak.bas + 12, t + 6 * S8, bv * 0.5, 'pizz'); }
    else if (b === 'dallar') { const nv = bv * (0.45 + 0.55 * l); [0, 2, 4, 6].forEach(s => bas(ak.bas + 12, t + s * S8, nv * (s ? 0.6 : 1), 'nabiz')); if (bic === 0) bas(ak.bas, t, bv * 0.6, 'uzun', cb * BAR); }
    else if (b === 'sakli') { bas(ak.bas + 12, t, bv * 0.6, 'nabiz'); bas(ak.bas + 12, t + 0.45, bv * 0.35, 'nabiz'); }
    else if (bic === 0) bas(ak.bas + (b === 'gol' ? 0 : 12), t, bv * (b === 'gol' ? 0.6 : 0.7), 'uzun', cb * BAR);
  }

  // ── final: 0–7 Pofuduklar dans ediyor (şenlik polkası, ım-pa tuba) → 8–15 doruk: Pırıl'ın teması → 16–17 çözülme ──
  function finalCubuk(t, i) {
    const S8 = 0.3, ak = akor, zirve = i >= 8, buyuk = zirve ? 1 : 0.8 + i * 0.025;
    const tn = []; for (let m = ak.bas + 12; tn.length < 8; m++) if (ak.ton.includes(m % 12)) tn.push(m);
    oncelikli = true;   // ezgi notaları finalde asla atılmasın
    for (const [s, n, u] of FINAL_MEL[i] || []) {
      const ts = t + s * S8, pan = cl((n - 84) * 0.05, -0.4, 0.4);
      if (!zirve) {   // dans: müzik kutusu + alt oktavdan çelesta
        zil(NOTE(n), ts, 0.056 * buyuk, 1.6, pan);
        if (s === 0 || u >= 2) tus(n - 12, ts, 0.017, 0.9, -pan, true);
      } else {        // Pırıl'ın teması: çelesta önde, müzik kutusu ve bir oktav üstte çan
        tus(n, ts, 0.05, 1.6 + u * 0.45, 0.1, true, B.zil);
        zil(NOTE(n), ts + 0.004, 0.04, 1.8 + u * 0.3, -0.1);
        zil(NOTE(n + 12), ts + 0.012, 0.016, 1.6 + u * 0.2, 0.35, null, false);
        if (u >= 4) zil(NOTE(n - 12), ts + 0.01, 0.022, 2.6, -0.35, null, false);
      }
    }
    oncelikli = false;
    if (!zirve) {
      const kok = ak.bas < 43 ? ak.bas + 12 : ak.bas;
      tuba(kok, t, 0.22, 0.075 * buyuk, 0); tuba(kok + 7, t + 4 * S8, 0.2, 0.06 * buyuk, 0);
      if (i % 4 === 3) { tuba(kok + 4, t + 6 * S8, 0.12, 0.05, 0); tuba(kok + 5, t + 7 * S8, 0.12, 0.05, 0); }
      bas(ak.bas + 12, t + 2 * S8, 0.05, 'pizz'); bas(ak.bas + 12, t + 6 * S8, 0.05, 'pizz');
      [2, 6].forEach(s => ak.pad.slice(2).forEach((n, k) => tus(n + 12, t + s * S8 + k * 0.012, 0.018, 0.35, (k - 1) * 0.3)));
      const yol = [0, 2, 1, 3, 2, 4, 3, 1]; yol.forEach((k, s) => { if (s % 2) arp(tn[k + 2], t + s * S8, 0.03, (k - 2) * 0.22, 0.9); });
      // Pofuduklar dans ediyor: ara vuruşlarda zıplayan "bup"lar
      if (i >= 1) { let k = 0; for (let m = ak.bas + 24; k < 4; m++) if (ak.ton.includes(m % 12)) gecitTon[k++] = m; [1, 3, 5, 7].forEach((s, j) => hop(gecitTon[(j + i) % 4] + 12, t + s * S8, 0.04, j % 2 ? 0.35 : -0.35)); }
      if (i === 0) bas(ak.bas, t, 0.1, 'uzun', 2.4);
    } else if (i < 16) {
      const yol = i % 2 ? [7, 5, 3, 1, 0, 2, 4, 6] : [0, 2, 4, 6, 7, 5, 3, 1];
      yol.forEach((k, s) => arp(tn[k], t + s * S8, 0.034, (k - 3.5) * 0.15, 1.6));
      ak.pad.slice(1).forEach((n, k) => tus(n + 12, t + k * 0.03, 0.02, 2.2, (k - 1.5) * 0.3));
      bas(ak.bas, t, 0.1, 'uzun', 2.4); [2, 4, 6].forEach(s => bas(ak.bas + 12, t + s * S8, 0.045, 'nabiz'));
      if (i === 8) for (let k = 0; k < 12; k++) zil(NOTE(akorTonu(ak, 86 + k * 1.2 | 0)), t + 0.6 + k * 0.11, 0.018, 2.5, (k % 2 ? 0.5 : -0.5), null);
    } else {
      if (i === 16) { bas(ak.bas, t, 0.1, 'uzun', 4.8); [0, 1, 2, 3, 4].forEach(k => arp(tn[k + 2], t + 0.4 + k * 0.16, 0.026, -0.4 + k * 0.2, 2.2)); }
    }
  }

  // ── ninni (3/4): müzik kutusu – başlık, yatak odası ve sabah. Ana tema müzik kutusunda; Pırıl'ın teması çelestada ──
  function ninniCubuk(t) {
    const S6 = 0.4, ak = akor, sira = ninniSira, bar = PARCA[sira.ad][sira.i], piril = sira.ad === 'piril', baslik = mod === 'baslik';
    oncelikli = true;
    for (const [s, n, u] of bar.m) {
      const ts = t + s * S6 + (rnd() - 0.5) * 0.01;
      if (piril) { tus(n, ts, 0.048, 1.5 + u * 0.4, 0.15, true, B.zil); zil(NOTE(n + 12), ts + 0.006, 0.014, 1.1 + u * 0.2, -0.25, null, false); }
      else zil(NOTE(n), ts, 0.058, 1.4 + u * 0.35, 0.12, null);
    }
    oncelikli = false;
    // müzik kutusu eşliği: 1. vuruşta bas, 2–3'te akor
    const kok = ak.bas + 24 > 66 ? ak.bas + 12 : ak.bas + 24;
    zil(NOTE(kok), t, 0.03, 2.2, -0.25, null, false);
    const ic = ak.pad.slice(2, 4).map(n => n + 12);
    [2, 4].forEach(s => ic.forEach((n, k) => zil(NOTE(n), t + s * S6 + k * 0.008, 0.016, 1.3, k ? 0.3 : -0.1, null, false)));
    if (baslik) return;
    if (sira.i % 4 === 3) { const tn = []; for (let m = ak.bas + 24; tn.length < 5; m++) if (ak.ton.includes(m % 12)) tn.push(m); tn.forEach((n, k) => arp(n, t + 1.6 + k * 0.1, 0.025, -0.4 + k * 0.2, 1.8)); }
    if (sabahKus && rnd() < 0.45) { const tk = t + 0.4 + rnd() * 1.6, p = rnd() < 0.5 ? -0.55 : 0.55; kus(tk, p); if (rnd() < 0.5) kus(tk + 0.42, p); }   // sabah: uzakta kuşlar
    if (sira.i % 4 !== 3 && ruya > 0.3) {   // rüya: yukarı süzülen ince bir arp + ara ara tepede bir çan
      const tn = []; for (let m = ak.bas + 36; tn.length < 4; m++) if (ak.ton.includes(m % 12)) tn.push(m);
      tn.forEach((n, k) => arp(n, t + 1.65 + k * 0.13, 0.016 * ruya, 0.5 - k * 0.3, 1.6));
      if (sira.i % 2) zil(NOTE(tn[3] + 12), t + 2.0, 0.011 * ruya, 2, -0.5, null);
    }
  }

  // ── Büyük Pofuduk uykusu: horlama + uykulu tuba, ölçüye eşli (2 ölçülük döngü) ──
  let horlamaDis = -1;   // pofuduk.js kendisi AU.sfx('horlama') çağırırsa kendi döngümüz susar
  function uykuCubuk(t, yakin) {
    const cift = cubukNo % 2 === 0;
    if (horlamaDis < zaman()) {
      if (cift) { horAl(t, 1.6, yakin); olayIleri(t, 'horlama', { faz: 'al', sure: 1.6 }); }
      else { horVer(t + 0.1, 1.5, yakin); olayIleri(t + 0.1, 'horlama', { faz: 'ver', sure: 1.5 }); }
    }
    const tv = 0.12 * (0.5 + 0.5 * yakin);
    if (cift) tuba(akor.bas + 12 + 7 > 57 ? akor.bas + 7 : akor.bas + 19, t + 6 * 0.3, 0.5, tv * 0.8, -60);
    else { tuba(akor.bas + 16 > 57 ? akor.bas + 4 : akor.bas + 16, t + 1.2, 0.45, tv, 0); tuba(akor.bas + 12 > 55 ? akor.bas : akor.bas + 12, t + 1.8, 0.7, tv, -110); }
  }
  // ── Pofuduk geçidi: Feza'nın peşindeki uyanık Pofuduklar için zıplayan, oyunbaz bir motif ──
  // Kaç Pofuduk varsa o kadar dolu (1: üç "bup", 2+: cevap veren üst ses, 3+: alttan "bom"). Feza durunca
  // otobüs kısılır (karisimGuncelle), yürüyünce açılır; ritim bölgenin ruhuna göre seyrekleşir.
  const HOP_RIT = [[1, 0, 1, 0, 1, 0, 0, 0], [1, 0, 0, 1, 0, 0, 1, 0], [1, 0, 1, 1, 0, 0, 1, 0], [1, 0, 0, 0, 1, 0, 1, 1]];
  const HOP_YOL = [0, 2, 1, 3, 2, 4, 3, 1];
  let hopRit = HOP_RIT[0];
  function gecitCubuk(t, ak, n, b) {
    if (cubukNo % 2 === 0) hopRit = HOP_RIT[(n >= 2 ? 1 : 0) + Math.floor(rnd() * (n >= 3 ? 3 : 2))] || HOP_RIT[0];
    const seyrek = b === 'gol' || b === 'sakli' ? 0.5 : 1;
    let tn0 = ak.bas + 24; while (tn0 > 62) tn0 -= 12;
    let k = 0; const tn = gecitTon; for (let m = tn0; k < 5 && m < tn0 + 30; m++) if (ak.ton.includes(m % 12)) tn[k++] = m;
    for (let s = 0; s < 8; s++) {
      if (!hopRit[s] || rnd() > seyrek) continue;
      const nn = tn[HOP_YOL[(s + cubukNo) % 8] % k];
      hop(nn + 12, t + s * 0.3, 0.05, s % 2 ? 0.25 : -0.25);
      if (n >= 2 && s === 6) hop(nn + 24, t + s * 0.3 + 0.15, 0.025, 0.45);   // ikinci Pofuduk cevap verir
    }
    if (n >= 3 && b !== 'gol') hop(tn[0], t, 0.05, 0);                          // üçüncüsü alttan "bom"
  }
  const gecitTon = [0, 0, 0, 0, 0];
  function olayIleri(t, ad, veri) {
    if (test || typeof OLAY === 'undefined') return;
    const ms = Math.max(0, (t - ac.currentTime) * 1000);
    setTimeout(() => OLAY.emit(ad, veri), ms);
  }

  // ───────────────────────── ses efektleri ─────────────────────────
  function gur(t, dur, tip, f0, f1, Q, vol, atk, pan, rv, hedef) {
    if (!yerVar(1, t, t + dur, true)) return null;
    const s = ac.createBufferSource(); s.buffer = gurBuf;
    const f = suzgec(tip, f0, Q, null); if (f1 && f1 !== f0) { f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur); }
    const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(panla(hedef || sfxG, pan || 0));
    if (rv) g.connect(rv > 1 ? revSfxCok : revSfx);
    s.loop = true; s.start(t, rnd() * (gurBuf.duration - 0.1)); s.stop(t + dur + 0.05);
    return f;
  }
  function ton(t, tip, f0, f1, dur, vol, atk, pan, rv, hedef) {
    if (!yerVar(1, t, t + dur, true)) return null;
    const o = ac.createOscillator(); o.type = tip; o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.8);
    const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(panla(hedef || sfxG, pan || 0)); if (rv) g.connect(rv > 1 ? revSfxCok : revSfx);
    o.start(t); o.stop(t + dur + 0.05); return o;
  }
  // minik "ağız" sesi: testere dişi → iki formant (sevimli hapşu / esneme)
  function agiz(t, f0, f1, dur, vol, F, F2, atk) {
    if (!yerVar(1, t, t + dur, true)) return;
    const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (atk || 0.04)); g.gain.setTargetAtTime(0.0001, t + dur * 0.7, dur * 0.12); g.connect(sfxG); g.connect(revSfx);
    for (const [fa, q, gv] of [[F[0], 6, 1], [F[1], 8, 0.5]]) {
      const bp = suzgec('bandpass', fa, q, null); if (F2) bp.frequency.linearRampToValueAtTime(F2[fa === F[0] ? 0 : 1], t + dur);
      o.connect(bp); bp.connect(kazanc(gv * 3, g));
    }
    o.start(t); o.stop(t + dur + 0.6);
  }
  // o anki akordan, verilen aralıkta notalar (efektler hep uyumlu)
  function akorNotalari(t, lo, hi, melodik) {
    const ak = akorAt(t), pcs = melodik ? ak.mel : ak.ton, r = [];
    for (let m = lo; m <= hi; m++) if (pcs.includes(m % 12)) r.push(m);
    return r.length ? r : [74, 78, 81, 86];
  }

  // Pırıl'ın motifi (A–F#'–E'–D'), o anki akora oturtulmuş: çelesta + bir oktav üstte ince çan. Bölge ezgisi bu sırada susar.
  function pirilAlinti(t, adim, vol, hedef, kac, pan0) {
    const m = uyarla(PIRIL_BAS.slice(0, kac || 4), akorAt(t)), son = t + (m[m.length - 1][0] + 3) * adim;
    ezgiSus(t, son + 0.3);
    oncelikli = true;
    try {
      m.forEach(([a, n, u], i) => {
        const ts = t + a * adim, p = (pan0 || 0) + (i - 1.5) * 0.12;
        tus(n, ts, vol, 1.3 + u * 0.4, p, true, hedef);
        zil(NOTE(n + 12), ts + 0.006, vol * 0.38, 1.1 + u * 0.25, -p, hedef, false);
      });
    } finally { oncelikli = false; }
    return son;
  }
  const PENT = [2, 4, 6, 9, 11];   // D pentatonik (fener ezgisi)
  let fenerSon = 0, fenerT = -1e9, fenerI = -1, sarsintiT = -1e9;
  let adimSol = false, cicekSay = 0, adimYuzey = 'yosun', adimOlayT = -1e9;
  // Feza'nın bastığı yüzey: olay verisi ('yuzey') → üstünde durduğu nesne (nilüfer / Pofuduk) → ızgara (2 = dal)
  function yuzeyBul(e) {
    if (e && e.yuzey) return e.yuzey;
    try {
      const u = typeof ustundeki !== 'undefined' ? ustundeki : null;
      if (u && u.tip) { if (u.tip === 'nilufer') return 'su'; if (u.tip === 'pofuduk' || u.tip === 'buyukPofuduk') return 'pof'; }
      if (typeof grid !== 'undefined' && typeof T !== 'undefined' && typeof P !== 'undefined') {
        const x = e && e.x != null ? e.x : P.x, y = e && e.y != null ? e.y : P.y;
        const row = grid[Math.floor((y + 3) / T)], c = row ? row[Math.floor(x / T)] : 0;
        if (c === 2) return 'dal';
      }
    } catch (er) {}
    return 'yosun';
  }
  const SFX = {
    adim(t, v) {   // yüzeye göre: yosun (yumuşak), dal (tok tahta), nilüfer (sulu "pıt"), Pofuduk (pofuk)
      adimSol = !adimSol; const p = adimSol ? -0.12 : 0.12, y = adimYuzey;
      if (y === 'dal') {
        ton(t, 'sine', (adimSol ? 230 : 205) * (0.97 + rnd() * 0.06), 150, 0.07, 0.05 * v, 0.003, p);
        gur(t, 0.045, 'bandpass', 1500 + rnd() * 400, 900, 2.5, 0.022 * v, 0.003, p);
        ton(t, 'triangle', 640 + rnd() * 60, 520, 0.035, 0.008 * v, 0.002, p);
      } else if (y === 'su') {
        gur(t, 0.13, 'bandpass', 1100 + rnd() * 300, 520, 2.2, 0.04 * v, 0.006, p);
        gur(t, 0.09, 'lowpass', 600, 250, 0.8, 0.03 * v, 0.006, p);
        const f = 520 + rnd() * 200; ton(t + 0.03, 'sine', f, f * 1.9, 0.07, 0.016 * v, 0.004, p, 1);   // minik kabarcık
      } else if (y === 'pof') {
        gur(t, 0.12, 'lowpass', 520, 220, 1.2, 0.05 * v, 0.012, p);
        ton(t, 'sine', 160, 110, 0.12, 0.04 * v, 0.01, p);
      } else {
        gur(t, 0.085, 'lowpass', 700 + rnd() * 300, 380, 0.8, 0.05 * v, 0.006, p);
        gur(t + 0.004, 0.05, 'bandpass', 2600 + rnd() * 900, 0, 1.4, 0.006 * v, 0.004, p);
        ton(t, 'sine', adimSol ? 125 : 112, 70, 0.07, 0.035 * v, 0.004, p);
      }
    },
    zipla(t) {
      gur(t, 0.24, 'bandpass', 550, 2100, 1.3, 0.06, 0.06, 0, 1);
      const n = akorNotalari(t, 84, 91, true); zil(NOTE(n[Math.floor(n.length / 2)]), t + 0.01, 0.036, 0.8, 0, sfxG, false);
    },
    cift(t) {
      gur(t, 0.42, 'bandpass', 800, 4200, 1.1, 0.06, 0.08, 0, 1);
      const n = akorNotalari(t, 81, 98); n.slice(0, 5).forEach((m, i) => zil(NOTE(m), t + i * 0.05, 0.034 - i * 0.003, 1.3, (i - 2) * 0.25, sfxG));
      for (let i = 0; i < 5; i++) ton(t + 0.05 + rnd() * 0.3, 'sine', 4000 + rnd() * 3000, 0, 0.12, 0.006, 0.003, rnd() - 0.5, 2);
    },
    inis(t, v) {
      if (adimYuzey === 'su' && v >= 0.15) { gur(t, 0.3, 'bandpass', 1400, 450, 1.8, 0.07 * v, 0.008, 0, 1); for (let i = 0; i < 3; i++) { const f = 450 + rnd() * 500; ton(t + 0.04 + i * 0.05, 'sine', f, f * 1.8, 0.07, 0.014, 0.004, rnd() - 0.5, 1); } }
      else if (adimYuzey === 'dal' && v >= 0.15) { ton(t, 'sine', 190, 120, 0.12, 0.07 * v, 0.003, 0); gur(t, 0.06, 'bandpass', 1300, 800, 2, 0.03 * v, 0.003, 0); }
      if (v < 0.2) return;
      gur(t, 0.18, 'lowpass', 420, 140, 0.9, 0.09 * v, 0.006, 0);
      ton(t, 'sine', 96, 46, 0.2, 0.12 * v, 0.005, 0);
      gur(t + 0.01, 0.12, 'bandpass', 1300, 900, 1.2, 0.012 * v, 0.01, 0);
    },
    boing(t, v) {
      const k = v > 1 ? 0.62 : 1, d = v > 1 ? 0.75 : 0.5;
      const o = ton(t, 'sine', 150 * k, 0, d, 0.1, 0.008, 0, 1), o2 = ton(t, 'triangle', 150 * k, 0, d * 0.8, 0.04, 0.008, 0);
      for (const x of [o, o2]) if (x) {
        x.frequency.setValueAtTime(150 * k, t); x.frequency.exponentialRampToValueAtTime(470 * k, t + 0.09);
        x.frequency.setTargetAtTime(380 * k, t + 0.09, 0.12);
        const lfo = ac.createOscillator(); lfo.frequency.value = 13; const lg = ac.createGain();
        lg.gain.setValueAtTime(60 * k, t + 0.05); lg.gain.exponentialRampToValueAtTime(1, t + d);
        lfo.connect(lg); lg.connect(x.frequency); lfo.start(t); lfo.stop(t + d + 0.05);
      }
      gur(t, 0.14, 'lowpass', 800, 300, 1.5, 0.06, 0.008, 0);
    },
    puf(t) {
      gur(t, 0.4, 'lowpass', 650, 180, 0.8, 0.13, 0.012, 0, 1);
      ton(t, 'sine', 120, 58, 0.22, 0.09, 0.006, 0);
      const n = akorNotalari(t, 86, 95); zil(NOTE(n[0]), t + 0.06, 0.02, 0.9, 0.3, sfxG);
    },
    hapsuAl(t) {   // "ha… ha…" (hapşırmadan önce nefes çeker)
      gur(t, 0.4, 'bandpass', 900, 1700, 2.5, 0.03, 0.32, 0);
      agiz(t + 0.03, 560, 780, 0.36, 0.026, [800, 1250], null, 0.3);
    },
    hapsu(t) {     // "(hap)ŞU!" – minik, sevimli; pofuduk.js hapşırdığı karede çağırır
      agiz(t, 700, 760, 0.07, 0.03, [800, 1250], null, 0.01);
      const t2 = t + 0.06;
      gur(t2, 0.3, 'highpass', 3200, 2600, 0.7, 0.11, 0.006, 0, 1);
      agiz(t2, 820, 430, 0.26, 0.05, [380, 820], null, 0.01);
      const n = akorNotalari(t, 88, 100); zil(NOTE(n[0]), t2 + 0.05, 0.016, 0.8, 0.3, sfxG, false);
    },
    parilti(t) {   // küçük ışıltı (sahne/arayüz)
      const n = akorNotalari(t, 86, 100); [0, 2, 4].forEach((k, i) => zil(NOTE(n[Math.min(n.length - 1, k)]), t + i * 0.07, 0.03, 1.4, (i - 1) * 0.4, sfxG));
      gur(t, 0.6, 'highpass', 6000, 9000, 0.7, 0.008, 0.1, 0, 2);
    },
    nefesAl(t) {   // Pırıl nefes çeker: hafif, yükselen hava sesi
      gur(t, 0.55, 'bandpass', 350, 1100, 1.8, 0.03, 0.45, 0, 1);
    },
    uyanma(t) {
      const n = akorNotalari(t, 79, 96); [0, 1, 2, 3].forEach(i => zil(NOTE(n[Math.min(n.length - 1, i * 2)]), t + i * 0.12, 0.035, 1.8, (i - 1.5) * 0.3, sfxG));
    },
    tohum(t) {
      const n = akorNotalari(t, 86, 100);
      zil(NOTE(n[0]), t, 0.07, 2.8, -0.2, sfxG); zil(NOTE(n[Math.min(n.length - 1, 3)]), t + 0.13, 0.065, 3, 0.2, sfxG);
      for (let i = 0; i < 9; i++) zil(NOTE(sec(n) + 12), t + 0.2 + i * 0.045 + rnd() * 0.02, 0.009, 0.5, rnd() - 0.5, sfxG, false);
      gur(t, 0.9, 'highpass', 5000, 8000, 0.7, 0.012, 0.2, 0, 2);
    },
    nefes(t) {     // ışık nefesi: büyülü, yükselen "fuuuş" + ışıltı
      gur(t, 1.3, 'bandpass', 380, 3000, 1.6, 0.08, 0.25, 0, 2);
      gur(t + 0.1, 1.3, 'highpass', 3000, 7000, 0.7, 0.014, 0.6, 0.2, 2);
      const son = pirilAlinti(t + 0.18, 0.14, 0.05, sfxG);   // Pırıl'ın motifi ışıkla birlikte üflenir
      const n = akorNotalari(son, 90, 100); n.slice(0, 4).forEach((m, i) => zil(NOTE(m), son - 0.1 + i * 0.07, 0.012, 1.6, (i % 2 ? 0.5 : -0.5), sfxG, false));
    },
    nilufer(t) {
      const n = akorNotalari(t, 62, 79, true);
      for (let i = 0; i < 5; i++) {
        const m = n[Math.min(n.length - 1, i * 2)], f = NOTE(m), ti = t + i * 0.24, p = -0.6 + i * 0.3;
        const o = ton(ti, 'sine', f * 0.75, 0, 0.7, 0.06, 0.01, p, 2); if (o) { o.frequency.setValueAtTime(f * 0.75, ti); o.frequency.exponentialRampToValueAtTime(f, ti + 0.06); }
        zil(f * 2, ti + 0.02, 0.018, 1.6, p, sfxG);
        gur(ti, 0.35, 'bandpass', 2800, 1800, 3, 0.008, 0.05, p, 1);
      }
    },
    su(t) {
      gur(t, 0.55, 'lowpass', 2600, 450, 0.7, 0.09, 0.012, 0, 1);
      gur(t, 0.25, 'bandpass', 1300, 800, 1.2, 0.04, 0.01, 0);
      for (let i = 0; i < 5; i++) { const ti = t + 0.06 + rnd() * 0.35, f = 900 + rnd() * 900; ton(ti, 'sine', f, f * 1.6, 0.06, 0.02, 0.003, rnd() - 0.5, 1); }
    },
    kurtar(t) {
      gur(t, 0.8, 'bandpass', 380, 3200, 1.4, 0.06, 0.45, 0, 2);
      pirilAlinti(t + 0.3, 0.11, 0.042, sfxG);   // "tuttum seni": Pırıl'ın motifi, çabuk ve sıcak
    },
    cicek(t, v) {
      cicekSay++;
      const ust = 86 + Math.min(10, cicekSay);
      const n = akorNotalari(t, 74, ust);
      const sec5 = n.slice(Math.max(0, n.length - 7));
      sec5.forEach((m, i) => zil(NOTE(m), t + i * 0.085, 0.045 + i * 0.002, 2.8, -0.45 + i * 0.15, sfxG));
      sec5.slice(-3).forEach((m, i) => arp(m - 12, t + 0.05 + i * 0.09, 0.03, 0.2));
      gur(t, 0.7, 'lowpass', 300, 1400, 0.9, 0.035, 0.25, 0, 1);
      zil(NOTE(sec5[sec5.length - 1] + 12), t + sec5.length * 0.085 + 0.1, 0.02, 3, 0.4, sfxG);
    },
    horlama(t, v) { horAl(t, 1.5, v || 1); horVer(t + 1.7, 1.4, v || 1); },
    horPuf(t, v) { horVer(t, 1.3, v); gur(t, 0.18, 'lowpass', 600, 250, 1.5, 0.07 * v, 0.01, 0); ton(t, 'sine', 140, 90, 0.16, 0.05 * v, 0.008, 0); },
    goz(t) {
      const n = akorNotalari(t, 86, 98); zil(NOTE(n[0]), t, 0.05, 1.2, 0.2, sfxG); zil(NOTE(n[2] || n[0]), t + 0.16, 0.05, 1.5, 0.3, sfxG);
      gur(t + 0.35, 0.16, 'lowpass', 500, 300, 2, 0.06, 0.01, 0); ton(t + 0.35, 'sawtooth', 85, 70, 0.14, 0.03, 0.01, 0);
    },
    esneme(t) {   // kocaman, komik bir esneme: "haaa-ooo"
      agiz(t, 230, 150, 1.7, 0.07, [760, 1180], [430, 780], 0.25);
      gur(t, 1.6, 'bandpass', 900, 500, 1.5, 0.02, 0.4, 0);
      tuba(57, t + 0.1, 1.2, 0.07, -300, sfxG);
    },
    kalk(t) {
      [38, 45, 50, 54, 57].forEach((n, i) => tuba(n + 12, t + i * 0.14, 0.13, 0.08, 0, sfxG));
      SFX.uyanma(t + 0.75);
    },
    buyukUyandi(t) {
      [50, 54, 57, 62].forEach((n, i) => tuba(n, t + i * 0.16, 0.14, 0.09, 0, sfxG));
      tuba(57, t + 0.75, 0.5, 0.09, 0, sfxG);
      const n = akorNotalari(t, 79, 98); n.forEach((m, i) => zil(NOTE(m), t + 0.3 + i * 0.07, 0.03, 2.2, (i % 2 ? 0.4 : -0.4), sfxG));
    },
    mmf(t) { agiz(t, 190, 160, 0.2, 0.03, [350, 700], null, 0.02); gur(t, 0.12, 'lowpass', 500, 250, 1, 0.03, 0.01, 0); },
    // finalde Pofuduklar Işık Ağacı'na fener asar (pofuduk.js 'fener' {i, x}): her fenere bir çelesta + çan. Notalar
    // D pentatoniğinde bir basamak yukarı tırmanır, ama yalnız o anki akora uyan basamaklara basar → 10 fener
    // birlikte küçük, yükselen bir ezgi çalar. Sonuncusu akoru yukarı doğru açan minik bir kapanış ekler.
    fener(t, v) {
      const ak = akorAt(t), i = v && v.i != null ? v.i : fenerI + 1, uyar = m => PENT.includes(m % 12) && (ak.mel.includes(m % 12) || ak.ton.includes(m % 12));
      if (i <= 0 || t - fenerT > 6 || !fenerSon) fenerSon = 72;
      let n = fenerSon + 1; while (n <= 100 && !uyar(n)) n++;
      if (n > 100) { n = 86; while (n <= 100 && !uyar(n)) n++; }   // tavana vardıysa bir oktav aşağıdan sürsün
      fenerSon = n; fenerT = t; fenerI = i;
      let p = i % 2 ? 0.3 : -0.3;
      try { if (v && v.x != null && typeof cam !== 'undefined' && typeof VW !== 'undefined') p = cl(((v.x - cam.x) / VW) * 1.4 - 0.7, -0.7, 0.7); } catch (er) {}
      const son = i >= 9;
      oncelikli = true;
      try {
        tus(n, t, 0.1, 1.8, p, true, sfxG);
        zil(NOTE(n + 12), t + 0.006, 0.038, 1.5, -p, sfxG);
        zil(NOTE(n + 24), t + 0.07 + rnd() * 0.03, 0.009, 0.6, p * 0.5, sfxG, false);   // minik ışıltı
        if (son) { const k = akorNotalari(t, n + 1, n + 14, true); k.slice(0, 3).forEach((m, j) => zil(NOTE(m), t + 0.22 + j * 0.11, 0.024 - j * 0.003, 2.2, (j - 1) * 0.4, sfxG)); }
      } finally { oncelikli = false; }
      gur(t, 0.5, 'highpass', 5000, 8000, 0.7, 0.006, 0.08, p, 2);   // fener yanarken yumuşak "fış"
    },
    // Büyük Pofuduk Feza'yı ağaca fırlatır (yıldız izi): yükselen büyülü "fuuuş" + akordan yukarı tırmanan ışıltı
    yildizIz(t) {
      gur(t, 1.25, 'bandpass', 450, 5200, 1.3, 0.055, 0.55, 0, 2);
      gur(t + 0.2, 1.1, 'highpass', 4500, 9500, 0.7, 0.011, 0.55, 0, 2);
      const n = akorNotalari(t, 79, 103);
      for (let i = 0; i < 9; i++) {
        const m = n[Math.min(n.length - 1, Math.round(i * (n.length - 1) / 8))];
        zil(NOTE(m), t + 0.06 + i * 0.075, 0.016 + i * 0.002, 1.1 + i * 0.12, -0.6 + i * 0.15, sfxG, i < 6 ? false : undefined);
      }
      for (let i = 0; i < 6; i++) ton(t + 0.25 + rnd() * 0.7, 'sine', 4200 + rnd() * 2800, 0, 0.1, 0.005, 0.003, rnd() - 0.5, 2);
    },
    // Büyük Pofuduk'un neşeli zıplayışının inişi ('sarsinti'): yumuşak, sıcak, tombul bir "bumf" (korkutucu değil:
    // derin değil, süzgeçli, yavaş vuruşlu) + iki minik hoplama "bup" + aşağı dökülen ışıltı kuyruğu
    bumf(t, v) {
      const g = cl((v || 0.5) * 1.6, 0.6, 1);
      ton(t, 'sine', 130, 58, 0.45, 0.15 * g, 0.02, 0);
      ton(t, 'triangle', 250, 120, 0.2, 0.022 * g, 0.015, 0);
      gur(t, 0.5, 'lowpass', 560, 150, 0.9, 0.12 * g, 0.018, 0, 1);
      gur(t + 0.01, 0.28, 'bandpass', 1000, 480, 1, 0.018 * g, 0.025, 0);
      const b = akorNotalari(t, 62, 74);
      hop(b[0], t + 0.17, 0.05 * g, -0.2, sfxG); hop(b[Math.min(b.length - 1, 2)], t + 0.33, 0.042 * g, 0.2, sfxG);
      const n = akorNotalari(t, 86, 101);
      for (let i = 0; i < 6; i++) zil(NOTE(n[Math.max(0, n.length - 1 - i)]), t + 0.14 + i * 0.075 + rnd() * 0.015, 0.014 - i * 0.0015, 1.1, i % 2 ? 0.5 : -0.5, sfxG, false);
      gur(t + 0.08, 0.9, 'highpass', 6000, 9000, 0.7, 0.007, 0.25, 0, 2);
    },
    agac(t) {   // ardından final D majörde başlar: parıltı da D majör
      const n = []; for (let m = 74; m <= 101; m++) if (AK.D.ton.includes(m % 12)) n.push(m);
      for (let i = 0; i < 22; i++) zil(NOTE(n[i % n.length] + (i >= n.length ? 12 : 0)), t + 0.05 + i * 0.12 + rnd() * 0.02, 0.032, 3.2, (i % 2 ? 0.55 : -0.55) * rnd(), sfxG);
      for (let i = 0; i < 14; i++) arp(akorNotalari(t, 50, 86)[i % 10] || 62, t + i * 0.05, 0.035, -0.7 + i * 0.1, 2.2);
      gur(t, 3.2, 'bandpass', 200, 6000, 0.9, 0.06, 2.2, 0, 2);
      if (yerVar(2, t, t + 5, true)) { const g = zarf(t, 0.06, 0.16, 4.5, sfxG); osc('sine', NOTE(38), t, t + 4.7, g); osc('sine', NOTE(50), t, t + 4.7, kazanc(0.4, g)); }
    },
  };
  function horAl(t, dur, v) {   // horlama: alçak, tırtıklı "hrrr" (korkutucu değil: yumuşak süzgeç, kısık)
    if (!yerVar(4, t, t + dur, true)) return;
    const g = ac.createGain(); g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14 * v, t + dur * 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const am = ac.createGain(); am.gain.value = 0.55; am.connect(g); g.connect(sfxG); g.connect(revSfx);
    const lfo = ac.createOscillator(); lfo.frequency.value = 17; const lg = kazanc(0.45, am.gain); lfo.connect(lg); lfo.start(t); lfo.stop(t + dur + 0.05);
    const lp = suzgec('lowpass', 520, 1.2, am); lp.frequency.setValueAtTime(420, t); lp.frequency.linearRampToValueAtTime(900, t + dur);
    const o = osc('sawtooth', 92, t, t + dur + 0.05, lp); o.frequency.linearRampToValueAtTime(108, t + dur);   // korkutucu olmasın: tok değil, tatlı bir "hırr"
    const s = ac.createBufferSource(); s.buffer = gurBuf; s.loop = true; const nb = suzgec('bandpass', 700, 1.2, am); s.connect(kazanc(0.5, nb)); s.start(t, rnd()); s.stop(t + dur + 0.05);
  }
  function horVer(t, dur, v) {   // nefes verirken minik ıslık: "fiyuuu"
    const o = ton(t, 'sine', 950, 0, dur, 0.035 * v, 0.15, 0.1, 1);
    if (o) { o.frequency.setValueAtTime(950, t); o.frequency.linearRampToValueAtTime(1350, t + dur * 0.35); o.frequency.linearRampToValueAtTime(900, t + dur); }
    gur(t, dur, 'lowpass', 900, 500, 0.7, 0.025 * v, 0.2, 0);
  }
  // ───────────────────────── sahne geçişleri (sahne.js: OLAY 'sahneAn' {ad}) ─────────────────────────
  // Hepsi müzik otobüsüne (sahneG) gider: anlatıcı konuşurken müzikle birlikte kısılır. Notalar D majörden
  // (ninni/final tonu) seçilir; hiçbir şey ani başlamaz/bitmez.
  const RE = []; for (let m = 50; m <= 100; m++) if ([2, 4, 6, 9, 11].includes(m % 12)) RE.push(m);   // D pentatonik
  let kirpT = -1e9;
  const SAHNE_SES = {
    uyudu(t) {        // Feza uykuya dalar: aşağı süzülen üç yumuşak çelesta notası + derin, sıcak bir nefes
      [86, 81, 78].forEach((n, i) => tus(n, t + i * 0.5, 0.026 - i * 0.004, 2.8, 0.25 - i * 0.2, true, sahneG));
      kabar([38, 50, 57], t + 0.2, 1.6, 0.8, 2.6, 0.03);
      gur(t, 2.4, 'lowpass', 900, 380, 0.7, 0.012, 1.1, 0, 1, sahneHam);
      ruya = 0;
    },
    piril_uyandi(t) { // Pırıl'ın gözleri açılır: iki tatlı ışıltı (beşli yukarı) + incecik parıltı; rüya katmanı belirir
      zil(NOTE(86), t, 0.04, 2.2, -0.2, sahneG); zil(NOTE(93), t + 0.22, 0.04, 2.6, 0.25, sahneG);
      for (let i = 0; i < 7; i++) zil(NOTE(RE[RE.length - 1 - (i * 2) % 9]), t + 0.5 + i * 0.09 + rnd() * 0.03, 0.009, 1, rnd() - 0.5, sahneG, false);
      gur(t + 0.1, 2.2, 'highpass', 5000, 8500, 0.7, 0.01, 0.8, 0, 2, sahneHam);
      ruya = Math.max(ruya, 0.35);
      pirilBekle = true;   // ninni yarım cümle sonunda Pırıl'ın temasına geçer
    },
    eriyor(t) {       // oda erir (~9 sn): yükselen büyülü parıltı, arp glissandoları, açılan rüya akoru
      // 1) iki arp glissandosu: alttan tepeye (2.2 sn), sonra daha yukarıdan ikinci, daha kısa bir dalga
      const g1 = RE.filter(n => n >= 57 && n <= 93);
      g1.forEach((n, i) => arp(n, t + 0.3 + Math.pow(i / g1.length, 0.85) * 2.2, 0.03 + 0.012 * (i / g1.length), -0.7 + 1.4 * i / g1.length, 1.7, sahneG));
      const g2 = RE.filter(n => n >= 69 && n <= 100);
      g2.forEach((n, i) => arp(n, t + 4.6 + i * 0.075, 0.022, 0.7 - 1.4 * i / g2.length, 1.4, sahneG));
      // 2) yükselen ışıltı: yoğunlaşan ve tizleşen çan serpintisi
      for (let i = 0; i < 20; i++) {
        const x = i / 20, ti = t + 0.8 + 6.6 * Math.pow(x, 0.8) + rnd() * 0.08;
        const lo = Math.floor(8 + x * 12), n = RE[Math.min(RE.length - 1, lo + Math.floor(rnd() * 6))];
        zil(NOTE(n), ti, 0.009 + 0.011 * x, 1.3, rnd() * 1.4 - 0.7, sahneG, false);
      }
      // 3) gürültüden yükselen "fıııış" (çok kısık) ve rüya akoru (D add9, A üstünde asılı)
      gur(t, 8, 'bandpass', 900, 7000, 0.9, 0.018, 6, 0, 2, sahneHam);
      kabar([45, 57, 62, 64, 69, 71, 76], t + 0.2, 4.5, 2.2, 3.2, 0.028, sahneG, true);
      ruya = 1;
    },
    orman(t) {        // orman belirir: sıcak bir çözülme – derin re, açık akor, aşağı inen yumuşak arp
      kabar([38, 50, 57, 62, 66, 69], t, 0.5, 2.4, 3.6, 0.04, sahneG, true);
      [93, 90, 86, 81, 78, 74, 69].forEach((n, i) => arp(n, t + 0.15 + i * 0.14, 0.03 - i * 0.002, 0.6 - i * 0.2, 2.2, sahneG));
      zil(NOTE(86), t + 1.2, 0.04, 3, 0, sahneG);
    },
    ic_cek(t) {       // uykuya dalmadan önce derin, tatlı bir iç çekiş (çok kısık, yumuşak hava)
      gur(t, 1.5, 'bandpass', 700, 380, 1.2, 0.012, 0.6, 0, 1, sahneHam);
    },
    isik(t, sm) {     // giriş: dünya parlar (yükselen ışık) · final: altın ışık ekranı doldurur (sıcak, büyük akor)
      if (sm === 'final' || mod === 'final' || (!sm && typeof DURUM !== 'undefined' && DURUM === 'final' && !test)) {
        kabar([38, 45, 50, 54, 57, 62, 66, 69, 74], t, 1.8, 2.4, 4, 0.04, sahneG, true);
        RE.filter(n => n >= 62 && n <= 98).forEach((n, i) => zil(NOTE(n), t + 0.4 + i * 0.1, 0.022, 2.6, (i % 2 ? 0.5 : -0.5), sahneG));
        gur(t, 3.4, 'bandpass', 300, 5000, 0.8, 0.03, 2.6, 0, 2, sahneHam);
        finalIstek = 'zirve';
      } else {
        [74, 78, 81, 86, 90].forEach((n, i) => zil(NOTE(n), t + i * 0.13, 0.03, 2.4, -0.5 + i * 0.25, sahneG));
        kabar([62, 66, 69, 74], t, 0.4, 1.2, 2.6, 0.025, sahneG, true);
        gur(t, 1.8, 'highpass', 4000, 8000, 0.7, 0.012, 0.5, 0, 2, sahneHam);
      }
    },
    sabah(t) {        // sabah: uzakta kuşlar cıvıldar, güneşli yükselen çanlar; final müziği ninniye bağlanır
      [74, 78, 81, 86].forEach((n, i) => zil(NOTE(n), t + 0.2 + i * 0.32, 0.03, 2.6, -0.3 + i * 0.2, sahneG));
      kus(t + 1.0, 0.5); kus(t + 1.9, -0.45); kus(t + 2.35, -0.45); kus(t + 3.6, 0.5);
      if (mod === 'final') finalIstek = 'sabah';
      sabahKus = true;
    },
    goz_kirp(t) {     // göz kırpma: minik çelesta "tiling" (yukarı bir altılı) + ışıltı
      kirpT = performance.now();
      const son = pirilAlinti(t, 0.13, 0.04, sahneG, 3, 0.1);   // Pırıl'ın motifinin başı: göz kırpan bir "ben buradayım"
      zil(NOTE(akorNotalari(son, 96, 103)[0]), son, 0.014, 1.4, 0.4, sahneG, false);
      gur(t + 0.1, 0.7, 'highpass', 6000, 9000, 0.7, 0.008, 0.15, 0.3, 2, sahneHam);
    },
  };
  function kus(t, pan) {   // tatlı, kısa bir kuş cıvıltısı: iki hızlı perde kayması (yumuşak, uzaktan)
    const f = 2700 + rnd() * 600;
    ton(t, 'sine', f, f * 1.35, 0.07, 0.007, 0.01, pan, 2, sahneG);
    ton(t + 0.09, 'sine', f * 1.2, f * 0.95, 0.09, 0.006, 0.01, pan, 2, sahneG);
  }
  let atlandiT = -1e9;
  function sahneAn(ad, sm) {
    if (ad === 'atlandi') { atlandiT = performance.now(); ruya = 0; return; }   // giriş atlandı: erime/orman aynı karede gelir
    if (!ac || !SAHNE_SES[ad]) return;
    if (ac.state !== 'running' && !test) return;
    if ((ad === 'eriyor' || ad === 'orman') && performance.now() - atlandiT < 2000) return;   // yalnız ışık yükselişi kalsın
    const k = 'sahne_' + ad;
    if (sonCal[k] && zaman() - sonCal[k] < 1) return;
    sonCal[k] = zaman();
    oncelikli = true;   // bir kerelik geçişler: glissandonun ortasından nota düşmesin
    try { SAHNE_SES[ad](zaman() + 0.02, sm); } finally { oncelikli = false; }
  }
  // ad eşlemesi (eski ve yeni adlar)
  const AD = { jump: 'zipla', zipla: 'zipla', dbl: 'cift', cift: 'cift', ciftzipla: 'cift', land: 'inis', inis: 'inis', bloom: 'cicek', cicek: 'cicek',
    splash: 'su', su: 'su', boing: 'boing', ziplat: 'boing', puf: 'puf', hapsu: 'hapsu', hapsuAl: 'hapsuAl', uyanma: 'uyanma', zilcik: 'uyanma', tohum: 'tohum', nefes: 'nefes',
    nilufer: 'nilufer', kurtar: 'kurtar', horlama: 'horlama', parilti: 'parilti', nefesAl: 'nefesAl', agac: 'agac', adim: 'adim', goz: 'goz', esneme: 'esneme', kalk: 'kalk', mmf: 'mmf', buyukUyandi: 'buyukUyandi',
    fener: 'fener', yildizIz: 'yildizIz', bumf: 'bumf', sarsinti: 'bumf' };
  const ESKI = { jump: 1, dbl: 1, bloom: 1, land: 1, splash: 1 };   // olaylar da tetikler → çift çalmasın
  const sonCal = {};
  let sonOlay = -1;
  function cal(ad, v, gecik) {
    if (!ac || !SFX[ad]) return;
    if (ac.state !== 'running' && !test) return;
    const t = zaman() + 0.012 + (gecik || 0);
    const enAz = ad === 'adim' ? 0.1 : ad === 'horlama' ? 1 : ad === 'fener' ? 0.03 : 0.09;
    if (sonCal[ad] && t - sonCal[ad] < enAz) return;
    sonCal[ad] = t;
    SFX[ad](t, v == null ? 1 : v);
  }
  function olaySes(ad, v, gecik) { sonOlay = performance.now(); cal(ad, v, gecik); }
  // pofuduk.js horlamayı kendi çizimine eşli çağırır ("HORR-PUF" anında): biz "puf"u hemen çalarız, bir sonraki
  // nefesin "hrrr"ını da ölçülen periyoda göre önceden başlatırız (puf'a tam yetişsin).
  let horSon = 0, horPer = 0, horZ = null;
  function disHorlama(v) {
    const t = zaman(), yakin = d0 ? Math.max(0.35, d0.uykuYakin) : 1;
    horlamaDis = t + 8;
    const ara = t - horSon; horSon = t;
    if (ara > 1.5 && ara < 9) horPer = horPer ? horPer * 0.5 + ara * 0.5 : ara;
    if (sonCal.horPuf && t - sonCal.horPuf < 0.8) return;
    sonCal.horPuf = t; if (ac.state === 'running' || test) SFX.horPuf(t + 0.01, (v || 1) * yakin);
    if (horZ) clearTimeout(horZ);
    if (horPer && !test) {
      const sure = horPer * 0.5;
      horZ = setTimeout(() => {
        horZ = null;
        if (!ac || ac.state !== 'running' || (buyukPof && buyukPof.uyandi) || typeof DURUM === 'undefined' || DURUM !== 'oyun') return;
        horAl(zaman() + 0.02, sure, (v || 1) * yakin);
      }, Math.max(0, (horPer - sure - 0.02) * 1000));
    }
  }
  let hapsuDis = -1, hapsuZ = null;
  function sfx(k, v) {
    if (k === 'bloom' && v === 0) {   // sahne.js göz kırpınca: 'goz_kirp' olayı geldiyse onun çelestası yeter
      if (performance.now() - kirpT < 600) return;
      setTimeout(() => { if (performance.now() - kirpT > 700) cal('parilti', 1); }, 60);
      return;
    }
    const ad = AD[k]; if (!ad || !ac) return;
    if (ad === 'puf' && performance.now() - sarsintiT < 250) return;   // 'sarsinti' inişi: onun "bumf"u yeter
    if (ad === 'horlama') { disHorlama(v); return; }
    if (ad === 'hapsu') { hapsuDis = performance.now(); if (hapsuZ) { clearTimeout(hapsuZ); hapsuZ = null; } }
    if (ESKI[k]) {   // eski çağrı: hemen ardından aynı olay gelirse olay sesi yeter
      const t0 = performance.now();
      setTimeout(() => { if (sonOlay < t0 - 5) cal(ad, k === 'bloom' && v ? 1 : v); }, 30);
      return;
    }
    cal(ad, v);
  }

  // ───────────────────────── olaylar ─────────────────────────
  function olaylariBagla() {
    if (typeof OLAY === 'undefined') return;
    OLAY.on('ziplama', () => olaySes('zipla'));
    OLAY.on('ciftZiplama', () => olaySes('cift'));
    OLAY.on('inis', e => { adimMesafe = 0; adimYuzey = yuzeyBul(e); olaySes('inis', cl(((e && e.siddet) || 500) / 900, 0.15, 1)); });
    // feza.js ayak yere bastığı karede 'adim' {x,y,hiz} yayar → o varken mesafeye göre adım sayımı susar
    OLAY.on('adim', e => {
      adimOlayT = performance.now(); adimYuzey = yuzeyBul(e);
      const h = e && e.hiz != null ? Math.abs(e.hiz) : 250;
      if (h < 15) return;
      cal('adim', cl(0.4 + h / 450, 0.45, 1) * (e && e.inis ? 0.6 : 1));   // inis: parmak ucuyla yumuşak konuş
    });
    OLAY.on('sahneAn', e => { const ad = e && (e.ad || e); if (typeof ad === 'string') sahneAn(ad, e && e.mod); });
    OLAY.on('ziplatti', o => olaySes('boing', o && o.tip === 'buyukPofuduk' ? 2 : 1));
    OLAY.on('uyandi', o => {
      if (o && o.tip === 'buyukPofuduk') { olaySes('buyukUyandi'); return; }
      // pofuduk.js hapşırığı kendi karesinde çağırır; biz önce "puf", sonra "ha…" nefesi, en sonda uyanma zili.
      // Dışarıdan hapşu gelmezse 1.1 sn sonra kendimiz hapşırırız.
      olaySes('puf'); olaySes('hapsuAl', 1, 0.5); olaySes('uyanma', 1, 1.35);
      const t0 = performance.now();
      if (hapsuZ) clearTimeout(hapsuZ);
      hapsuZ = setTimeout(() => { hapsuZ = null; if (hapsuDis < t0) cal('hapsu', 1); }, 1100);
    });
    OLAY.on('carpti', o => { if (o && (o.tip === 'pofuduk' || o.tip === 'buyukPofuduk') && !o.uyandi) olaySes('mmf'); });
    OLAY.on('tohum', () => olaySes('tohum'));
    // Pırıl'ın ışık nefesi: piril.js 'nefes' {asama:'al'|'ver'} yayar; gelmezse karanlığa dokununca yedek ses
    let nefesGeldi = -1e9;
    OLAY.on('nefes', e => { const a = e && e.asama; if (a === 'al') { nefesGeldi = performance.now(); olaySes('nefesAl'); } else if (a === 'ver') { nefesGeldi = performance.now(); olaySes('nefes'); } else if (a === 'basla') nefesGeldi = performance.now(); });
    OLAY.on('dokun:karanlik', () => { const t0 = performance.now(); setTimeout(() => { if (nefesGeldi < t0) cal('nefes'); }, 1500); });
    OLAY.on('aydinlat', () => olaySes('nilufer'));
    OLAY.on('dustu', () => olaySes('su'));
    OLAY.on('kurtarildi', () => olaySes('kurtar'));
    OLAY.on('cicek', () => olaySes('cicek'));
    OLAY.on('buyukAsama', e => { const a = e && e.asama; if (a) asama = Math.max(asama, a); olaySes(a === 1 ? 'goz' : a === 2 ? 'esneme' : 'kalk'); });
    OLAY.on('agac', () => { olaySes('agac'); finaleGir(); });
    OLAY.on('fener', e => olaySes('fener', { i: e && e.i, x: e && e.x }));
    OLAY.on('yildizIz', () => olaySes('yildizIz'));
    OLAY.on('sarsinti', e => { sarsintiT = performance.now(); olaySes('bumf', e && e.guc != null ? e.guc : 0.5); });
    OLAY.on('durum', d => durumDegisti(d));
  }
  function finaleGir() { ruya = 0; if (mod !== 'final') { mod = 'final'; progAd = 'final'; pi = 0; bic = 0; } }
  function durumDegisti(d) {
    if (d === 'oyun' || d === 'baslik' || d === 'giris') { ruya = 0; sabahKus = false; pirilBekle = false; }
    if (zorlaMod) return;
    if (d === 'giris') mod = 'ninni';
    else if (d === 'baslik') mod = 'baslik';
    else if (d === 'oyun') mod = 'orman';
    else if (d === 'final') finaleGir();
    else if (d === 'son' && mod !== 'final') mod = 'ninni';
  }

  // ───────────────────────── karışım güncelleme ─────────────────────────
  let kisik = false, kisKim = 'p';
  function karisimGuncelle(t, d) {
    const ob = mod === 'orman' ? ormanAd(d) : mod;
    const k = KARISIM[ob] || KARISIM.patika;
    const r = mod === 'ninni' ? ruya : 0, kr = KARISIM.ruya, kk = (ad) => k[ad] * (1 - r) + kr[ad] * r;
    const l = d.light;
    // geçit: Feza yürürken tam, durunca (biraz gecikmeyle) kısık; Pofuduk sayısıyla 1–2 arası dolulaşır
    if (d.hareket) gecitHareket = t; const yuru = t - gecitHareket < 1.2 ? 1 : 0.3;
    for (const ad in TEMEL) {
      let v = TEMEL[ad] * kk(ad) * isikEtkisi(ad, l, mod);
      if (ad === 'tuba' && mod === 'orman') v = ob === 'aciklik' ? 1 : k.tuba;
      if (ad === 'hop' && mod !== 'final') v *= cl((d.takip || 0) / 2, 0, 1) * yuru;
      if (solo && solo !== ad) v = 0;
      hedefle(B[ad].gain, v, t, ad === 'hop' ? 0.5 : 1.4);
    }
    hedefle(revMuzik.gain, 0.5 * kk('rev'), t, 2);
    hedefle(dly.fbG.gain, 0.3 + 0.12 * kk('dly'), t, 2);
    hedefle(dly.out.gain, 0.6 * kk('dly'), t, 2);
    hedefle(B.telLP.frequency, 750 + 1100 * l + (mod === 'final' ? 700 : 0), t, 2);
    hedefle(ruzgarG.gain, mod === 'orman' ? 0.018 * (1 - 0.5 * l) * (bolge === 'gol' ? 1.4 : 1) : mod === 'ninni' ? 0.004 : 0.008, t, 2);
  }
  function kis(acik, kim) {
    if (!ac) return;
    kisik = !!acik; kisKim = kim || 'p';
    const t = ac.currentTime;
    kisG.gain.cancelScheduledValues(t); kisG.gain.setValueAtTime(kisG.gain.value, t);
    kisG.gain.setTargetAtTime(acik ? (kim === 'a' ? 0.42 : 0.5) : 1, t, acik ? 0.08 : 0.45);
  }

  // ───────────────────────── zamanlayıcı ─────────────────────────
  const ILERI = 0.7;
  function tick() {
    const t = zaman();
    const d = okuFn();
    d0 = d;
    // bölge (1.2 sn kararlılık ister: zıplarken gidip gelmesin)
    if (d.bolge !== bolgeAday) { bolgeAday = d.bolge; bolgeAdayT = t; }
    else if (bolgeAday !== bolge && t - bolgeAdayT > 1.2) bolge = bolgeAday;
    if (d.durum === 'oyun' && mod === 'ninni' && !zorlaMod) mod = 'orman';
    if (sonrakiCubuk < t) sonrakiCubuk = t + 0.05;   // sekme uyurken geride kalınca atla
    while (sonrakiCubuk < t + ILERI) { cubukPlanla(sonrakiCubuk); sonrakiCubuk += BAR; }
    if (!test && (++tickN % 4 === 0)) karisimGuncelle(t, d);
    if (test && (++tickN % 4 === 0)) karisimGuncelle(t, d);
  }
  let tickN = 0;

  // adımlar: Feza'nın yürüdüğü yola göre (yosun üstünde yumuşak, sağ–sol)
  let adimMesafe = 0, sonKare = 0;
  function adimDongu(ms) {
    requestAnimationFrame(adimDongu);
    const dt = Math.min(0.05, (ms - sonKare) / 1000 || 0); sonKare = ms;
    if (!ac || typeof P === 'undefined' || typeof DURUM === 'undefined' || DURUM !== 'oyun') return;
    if (adimOlayT > -1e8) return;   // feza.js adımları kendisi gönderiyor: onlar yeter
    const hiz = Math.abs(P.vx || 0);
    if (P.ground && hiz > 40) {
      adimMesafe += hiz * dt;
      if (adimMesafe > 54) { adimMesafe = 0; adimYuzey = yuzeyBul(null); cal('adim', cl(0.45 + hiz / 450, 0.5, 1)); }
    } else if (!P.ground) adimMesafe = 40;   // inişten sonra ilk adım çabuk gelsin
  }

  // ───────────────────────── kurulum ─────────────────────────
  function yankiDarbe(sn) {     // koyulaşan kuyruklu stereo yankı (iki kanal farklı → geniş)
    const sr = ac.sampleRate, len = Math.floor(sr * sn), b = ac.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c); let y = 0;
      for (let i = 0; i < len; i++) {
        const x = i / len, a = 0.65 - 0.55 * x;
        y += a * ((rnd() * 2 - 1) - y);
        d[i] = y * Math.pow(1 - x, 2.4) * (i < sr * 0.012 ? i / (sr * 0.012) : 1);
      }
    }
    return b;
  }
  function kur(ctx) {
    ac = ctx;
    cikis = ac.createGain(); cikis.gain.value = 0;
    limit = ac.createDynamicsCompressor();
    limit.threshold.value = -4; limit.knee.value = 2; limit.ratio.value = 20; limit.attack.value = 0.002; limit.release.value = 0.18;
    master = ac.createGain(); master.gain.value = 0.9;
    master.connect(limit); limit.connect(cikis); cikis.connect(ac.destination);
    // müzik: katmanlar → yapıştırıcı kompresör → kısma (konuşma) → master
    muzikG = ac.createGain(); muzikG.gain.value = 0.8;
    const yap = ac.createDynamicsCompressor(); yap.threshold.value = -20; yap.ratio.value = 2.5; yap.attack.value = 0.02; yap.release.value = 0.3; yap.knee.value = 8;
    kisG = ac.createGain(); kisG.gain.value = 1;
    const rafa = suzgec('lowshelf', 160, 0, null); rafa.gain.value = -4;   // iPad hoparlöründe boğuk olmasın
    muzikG.connect(rafa); rafa.connect(yap); yap.connect(kisG); kisG.connect(master);
    // sahne gürültüleri (parıltı "fışş"ları) yapıştırıcı kompresörü atlar: Chrome'da süzgeçli gürültünün başı orada tek örneklik çıt yapıyordu
    sahneHam = ac.createGain(); sahneHam.gain.value = 0.8; sahneHam.connect(kisG);
    sfxG = ac.createGain(); sfxG.gain.value = 0.85; sfxG.connect(master);
    sesG = ac.createGain(); sesG.gain.value = 1; sesG.connect(master);
    sahneG = ac.createGain(); sahneG.gain.value = 1; sahneG.connect(muzikG);   // sahne geçişleri: müzikle birlikte kısılır
    // yankı
    rev = ac.createConvolver(); rev.buffer = yankiDarbe(3.6);   // 5 sn iPad için pahalı; gecikme kuyruğu uzatır
    const revCik = ac.createGain(); revCik.gain.value = 0.9; rev.connect(revCik); revCik.connect(kisG);
    revMuzik = ac.createGain(); revMuzik.gain.value = 0.4; muzikG.connect(revMuzik); revMuzik.connect(rev);
    revSfx = kazanc(0.18, rev); revSfxCok = kazanc(0.5, rev);
    // gecikme (noktalı sekizlik = 0.45 sn)
    dlyGiris = ac.createGain(); dlyGiris.gain.value = 0.5;
    dly = ac.createDelay(1); dly.delayTime.value = 0.45;
    dly.fbG = kazanc(0.36, null); dly.out = kazanc(0.4, null);
    const dlf = suzgec('lowpass', 2600, 0.5, null), dhp = suzgec('highpass', 300, 0.5, null);
    dlyGiris.connect(dly); dly.connect(dlf); dlf.connect(dhp); dhp.connect(dly.fbG); dly.fbG.connect(dly);
    dhp.connect(dly.out); dly.out.connect(muzikG);
    // katman otobüsleri
    for (const ad in TEMEL) { B[ad] = ac.createGain(); B[ad].gain.value = 0; B[ad].connect(muzikG); }
    B.zil.gain.value = 1; B.pad.gain.value = 0.75;
    const arpLP = suzgec('lowpass', 3800, 0.4, muzikG); B.arp.disconnect(); B.arp.connect(arpLP);
    // gürültü (bir kez)
    gurBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const nd = gurBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = rnd() * 2 - 1;
    // rüzgâr
    const ns = ac.createBufferSource(); ns.buffer = gurBuf; ns.loop = true;
    ruzgarBP = suzgec('bandpass', 500, 0.7, null); ruzgarG = kazanc(0.0, null);
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.07; const lg = kazanc(300, ruzgarBP.frequency); lfo.connect(lg); lfo.start();
    ns.connect(ruzgarBP); ruzgarBP.connect(ruzgarG); ruzgarG.connect(muzikG); ns.start();
    kaliciKur();
    const t = zaman();
    cikis.gain.value = 0; cikis.gain.setValueAtTime(0, t); if (!sessizDeneme) cikis.gain.linearRampToValueAtTime(1, t + 2.5);
    sonrakiCubuk = t + 0.25;
    olaylariBagla();
  }

  function start() {
    // ?sessiz&sesdene: motor çalışır ama çıkış tamamen kapalı (sessiz deneme)
    const dene = typeof Q !== 'undefined' && Q.has && Q.has('sesdene');
    if (ac || (typeof SESSIZ !== 'undefined' && SESSIZ && !dene)) return;
    sessizDeneme = !!(typeof SESSIZ !== 'undefined' && SESSIZ);
    // iPad: sessiz anahtarı açıkken de çalsın (iOS 17+: medya oturumu 'playback')
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    let ctx;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' }); } catch (e) { return; }
    kur(ctx);
    if (typeof DURUM !== 'undefined') durumDegisti(DURUM);
    setInterval(tick, 80); tick();
    requestAnimationFrame(adimDongu);
    // iPad: dokunuşla sesin kilidini aç (ör. ?atla ile dokunmadan başladıysa)
    const ac2 = ac;
    const ac3 = () => {
      if (ac2.state !== 'running') { ac2.resume && ac2.resume().catch(() => {}); try { const b = ac2.createBuffer(1, 1, 22050), s = ac2.createBufferSource(); s.buffer = b; s.connect(ac2.destination); s.start(0); } catch (e) {} }
    };
    for (const ev of ['pointerdown', 'touchend', 'keydown']) addEventListener(ev, ac3, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) ac2.suspend && ac2.suspend(); else ac2.resume && ac2.resume().catch(() => {}); });
    ac3();
  }

  // çevrimdışı deneme (OfflineAudioContext): AU._dene(ctx, sure, senaryo(t) → {durum, bolge, light, uyku}, olaylar)
  let sonTestMod = null, solo = null;
  function dene(ctx, sure, senaryo, olaylar, ayar) {
    test = { t: 0, log: ayar && ayar.log ? [] : null }; solo = ayar && ayar.solo || null;
    kur(ctx);
    okuFn = () => senaryo(test.t);
    olaylar = (olaylar || []).slice().sort((a, b) => a[0] - b[0]);
    let oi = 0;
    for (let t = 0; t < sure; t += 0.05) {
      test.t = t;
      const d = okuFn();
      if (d.mod && d.mod !== sonTestMod) { sonTestMod = d.mod; if (d.mod === 'final') finaleGir(); else mod = d.mod; }
      if (d.uyandi && buyukPof === null) buyukPof = { uyandi: true };
      while (oi < olaylar.length && olaylar[oi][0] <= t) {
        const [, ad, v] = olaylar[oi++];
        if (ad[0] === '@') { if (typeof OLAY !== 'undefined') OLAY.emit(ad.slice(1), v); continue; }   // '@olay': oyun olayı
        if (ad === 'agac') finaleGir(); if (SFX[ad]) { sonCal[ad] = -1; cal(ad, v); }
      }
      tick();
    }
    return ctx.startRendering();
  }

  return {
    start, sfx,
    muzik(m) { zorlaMod = m || null; if (m) { if (m === 'final') finaleGir(); else mod = m; } },
    baglam: () => (ac && !test ? ac : null),
    sesCikis: () => sesG,
    kis,
    akor: () => (ac ? akorAt(zaman()).pad.slice() : [50, 54, 57, 61, 64]),
    get bolge() { return bolge; }, get mod() { return mod; },
    get _tepe() { return { tepe: yukTepe, dusen: yukDus }; }, _yuzey: e => yuzeyBul(e || null),   // deneme: aynı anda en çok geçici ses (ölçüm)
    _dene: dene, _tema: () => ({ PARCA, TEMA, FINAL_MEL, PROG, AK }), _log: () => test && test.log,
  };
})();

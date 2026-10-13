# Bölüm 3 — "Bulut Ülkesi" sözleşmesi (gece çalışması, 13→14 Ekim; lead yazdı)

Kalite referansı: Bölüm 1 ve 2 (src/dunya.js, dunya2.js, pofuduk.js, yildiz.js, takim.js). 5 yaş: korkutucu hiçbir şey yok, kaybetmek yok,
Feza okuma bilmiyor (hiçbir şey yazıya dayanmaz; Pırıl'ın sesi + el/ışık ipuçları). Ori havası (≈%75) + biraz Gris. iPad'de 60 fps.
Bütün genel kurallar: src/SPEC.md + src/BOLUM2.md (aynı mimari; Bölüm 2 nasıl eklendiyse Bölüm 3 de öyle eklenir).

## Hikâye
Üçüncü gece rüyası GÜN DOĞUMUNDA geçer (Bölüm 1 gece, Bölüm 2 yıldızlı gece). Bulut Ülkesi: pembe, şeftali, altın, lila bulutlar.
Gökkuşağı kaybolmuş: gökkuşağını taşıyan 7 **Bulut Kuzucuğu** renklerini kaybetmiş, gri ve üzgün, dağılmışlar. Pırıl: "Gökkuşağı kaybolmuş!
Bulut Kuzucukları renklerini kaybetmiş. Hadi onları bulalım!" Feza her kuzucuğa dokununca (sarılma anı) kuzucuk gökkuşağı rengine
bürünür (sırayla kırmızı, turuncu, sarı, yeşil, mavi, lacivert, mor — kaçıncı bulunduysa o renk), sevinçle zıplar ve Feza'nın peşine takılır.
Gökyüzünde gökkuşağı parça parça belirir (SAYAC.kuzu/kuzuTop oranı).

Bölümler (≈5-7 dk, ≈ 380-460 sütun):
1. **Pembe Bulutlar** — Feza bir bulutun üstünde uyanır; zıplatan bulutlar (basınca esneyip "boing"), öğrenme.
2. **Kuzucuk Çayırı** — ilk kuzucuklar; bulut zeminli düzlükler, basamak bulutlar.
3. **Rüzgâr Yolu** — esintiler (yukarı taşıyan yumuşak hava akımı; uçuşan tüyler, uçurtmalar), yüzen bulutlar.
4. **Bulut Şekilleri** — mini oyun "Bulutlarda ne var?" (2 yer, isteğe bağlı ama yol üstünde, Pırıl davet eder).
5. **Büyük Boşluk → Pırıl'ın sırtında uçuş** — Pırıl rüyada büyür, "Bin sırtıma!" der; ≈30-40 sn uçuş (bölümün en büyük anı).
6. **Gökkuşağı Tepesi** — 7 kuzucuk sıraya dizilip gökyüzünde gökkuşağı olur; Feza ve Pırıl gökkuşağından kayarak iner → sabah finali
   (Feza yatağında uyanır; pencereden gerçek bir gökkuşağı görünür; Pırıl göz kırpar).
Düşmek: bulutların altı boşluk; düşen Feza'yı Pırıl geri taşır (mevcut kurtarma, ceza yok). Bölüm 3'te göl yok (`BOLUM.gollar = []`).

## Dosyalar ve sahipler (her ajan YALNIZ kendi dosyalarını düzenler; özel önekler)
| dosya | sahip | önek | işi |
|---|---|---|---|
| `bolum3.js`, `bulut.js` | LEVEL3 | `bl3*`, `bu*` | yerleşim (ızgara + nesneler) ve türler: `bulutZip` (zıplatan bulut), `bulutYuzen` (yavaş giden bulut platform), `esinti` (yukarı taşıyan hava akımı), `gokkusagi` (final yapısı), süs türleri (tüy, uçurtma, kuş sürüsü — böcek YOK). `konusma` tetikleyicileri `b_...`. `bulutSekil`, `kuzu`, `ucusKapisi` nesnelerini yerleştirir (türleri başkasının). |
| `kuzu.js` | POF | `kz*` | `kuzu` türü: gri üzgün kuzucuk (davranış + çizim + renklenme + takip sürüsü + sevinç), `OLAY 'kuzu' {o, renkI}` |
| `ucus.js` | UCUS | `uc*` | `ucusKapisi` türü + uçuş modu (Pırıl büyür, Feza sırtında, ≈30-40 sn, parmakla yukarı/aşağı, ışıltı toplama, iniş) |
| `sekil.js` | MINI3 | `sk*` | `bulutSekil` mini oyun türü |
| `dunya3.js` | WORLD3 | `dn3*` | Bölüm 3 arka/ön plan: gün doğumu gökyüzü, güneş, bulut denizi katmanları, uzak yüzen adalar, ışık hüzmeleri, zemin (ızgara 1 = yumuşak bulut zemin, 2 = üstten geçilen ince bulut), gökkuşağı yayının gökte belirmesi; `dn3Isit()` |
| `muzik.js`, `ses.js`, `gen_voice.py`, `sesler.js` | SES | `au*`, `ses*` | Bölüm 3 müziği (gün doğumu: arp, flüt, yumuşak yaylılar; aynı aileden), efektler, Pırıl/anlatıcı cümleleri |
| `sahne.js` | SAHNE | `sh*` | seçim ekranı (3 rüya baloncuğu + cila), Bölüm 3 kısa uyku girişi, Bölüm 3 sabah finali (pencerede gökkuşağı) |
| `feza.js` | FEZA | `fz*` | Feza animasyon cilası (her bölüm) + `fezaCizPoz` yeni pozlar: `'binis'` (Pırıl'ın sırtında oturan, rüzgârda saç), `'kayma'` (gökkuşağından kayarken), kuzucuğa sarılma tepkisi (`OLAY 'kuzu'`) |
| `piril.js` | PIRIL | `dr*` | Pırıl cilası + Bölüm 3 rehberliği + `pirilCizPoz` yeni poz `'binek'` (büyük uçan Pırıl, sırtı Feza'ya koltuk) |
| `pofuduk.js` | POF | `pf*` | Bölüm 1-2 Pofuduk cilası (ikinci iş) |
| `oyun.js`, `ortak.js`, `arayuz.js`, `index.html`, `sw.js` | CORE | `om*`, `ui*` | Bölüm 3 tesisatı (aşağıda) + genel oyun hissi |
| `bolum.js`, `bolum2.js`, `yildiz.js`, `takim.js`, `sarki.js` | LEVEL12 | mevcut | Bölüm 1-2 oynanış/akış cilası, mini oyunlar, kaplumbağa |
| `dunya.js`, `dunya2.js` | WORLD12 | `dn*`, `dn2*` | Bölüm 1-2 dünya sanatı cilası |

## CORE sözleşmesi (KESİN; herkes buna göre yazar)
- `BOLUM_NO` 1|2|3 (index.html, lead yaptı): `?bolum=3` ya da `sessionStorage 'fezaIsikSec'='3'` + yenileme. Yalnız `bolum3.js` yüklenir.
  Yeni dosyalar `dunya3.js bulut.js kuzu.js sekil.js ucus.js` HER bölümde yüklenir (takim.js'ten sonra, muzik.js'ten önce): yükleme anında
  yalnız tanım + `TUR.kaydet` yapar; Bölüm 1/2'yi ASLA etkilemez. `bolum3.js` bu dosyalardan ÖNCE yüklenir: yalnız `nesne(...)` ile veri üretir.
- `bolum3.js` Bölüm 2 ile aynı adları sağlar (`ROWS COLS grid ground plat topOf cell yuzey nx nesne BOLUM FLOWERS TREE`); `BOLUM.gollar=[]`, `TREE=null`.
  Ek: `BOLUM.gokkusagi = {x, y}` (final tepesi), `BOLUM.ucus = {x0, x1, yUst, yAlt}` (uçuş koridoru, dünya koordinatı).
- Çizim yönlendirme (`oyun.js omDr`): BOLUM_NO==3 iken `dn3Background dn3World dn3Foreground dn3Motes dn3Petals dn3Vignette` (dn2 ile aynı imzalar);
  yoksa güvenli yedek (arka plan düz şafak rengi `#f3b8a8`). `dn3Isit()` Bölüm 3 sayfasında her karede (true dönene kadar) çağrılır.
- Sayaçlar: `SAYAC.kuzu` / `SAYAC.kuzuTop` (CORE, `OLAY 'kuzu'` ile artar; kuzuTop = `tip==='kuzu'` sayısı). `tohum` aynen (isteğe bağlı).
- `HEDEF()` Bölüm 3: renklenmemiş en yakın `kuzu` (`!o.done`); hepsi tamamsa `ucusKapisi` (uçuş bitmemişse), sonra `gokkusagi`.
- Final: `gokkusagi` türü animasyonun SONUNDA `OLAY.emit('gokkusagiTamam', o)` yayınlar → CORE ≈2 sn sonra `finaleGec()` (Bölüm 2'deki `hayvanUyandi` gibi).
  `gokkusagi` yalnız `SAYAC.kuzu >= SAYAC.kuzuTop` iken ve Feza tepeye geldiğinde başlar (kuzucuklar Feza'yı takip ettiği için hepsi oradadır).
- **Uçuş kancası:** `P.ucus` (null | nesne). UCUS ajanı uçuşu başlatınca `P.ucus = o` koyar; CORE `stepPlayer` içinde `P.ucus` doluysa normal fiziği
  ATLAR ve her adımda `o.adim(dt, girdi)` çağırır (`girdi = {eksenY: -1..1, eksenX, basili, hedefY (dünya y ya da null)}`: parmak basılıysa
  parmağın dünya y'si; klavyede ↑/↓ eksenY). Uçuş sırasında zıplama düğmesi gizlenir (arayuz). `o.adim` P.x/P.y'yi kendisi yazar.
  `drawFeza` ve `drawDragon` `P.ucus` doluyken ÇİZMEZ (FEZA/PIRIL ajanları erken dönüş ekler); uçuşu `ucus.js` kendi `ciz/cizOn`'unda
  `pirilCizPoz(...,'binek')` + `fezaCizPoz(...,'binis')` ile çizer. Uçuş bitince UCUS `P.ucus = null`, Feza'yı zemine bırakır, `OLAY 'ucusBitti'`.
  Kamera: uçuşta CORE kamerayı `BOLUM.ucus` koridoruna göre Feza'yı ekranın sol üçte birinde tutacak biçimde izler (ileri bakış).
- Seçim ekranı: 3 seçenek `{id:3, ikon:'bulut'}`; id 3 → `sessionStorage 'fezaIsikSec'='3'` + yenileme → `SAHNE.giris(bitti, {bolum:3, kisa:true})`.
- Arayüz sayacı: Bölüm 3'te çiçek/yıldız yerine kuzucuk simgesi; sonuç kartı kuzucuk + tohum. Bitiş: `omTamamYaz(3)`.
- Fizik: Bölüm 2'nin affedici ayarları Bölüm 3'te de (coyote/tampon/kenar yardımı).
- Test bayrakları: `?sessiz&atla&bolum=3`, `?sessiz&bolum=3&uyku` (kısa giriş). `window.OYUN` kancaları aynı.

## Türlerin olayları / sesleri (SES ajanı bunları dinler; AU.sfx adı yoksa sessiz geçilir)
- bulut.js: `AU.sfx('bulutZip', v=0..1 güç)`, `'esinti'` (girince), `'gokkusagiParca'(v=renkI)`, `'gokkusagiTamam'`, `'kayma'`; OLAY: `bulutZip`, `gokkusagiBasla`, `gokkusagiTamam`.
- kuzu.js: `AU.sfx('kuzuRenk', renkI)` (sarılma → renk; 7 notalık yükselen dizi), `'kuzuMee'` (minik sevimli ses, ara sıra), OLAY `kuzu` {o, renkI}.
- ucus.js: `AU.sfx('ucusBasla')`, `'pirilBuyu'`, `'isiltiTopla'(v=sıra)`, `'ucusIn'`; OLAY `ucusBasla`, `ucusBitti`, `isilti`.
- sekil.js: `AU.sfx('sekilOv', v=0..1 ilerleme)`, `'sekilCanlan'(v=hayvan)`, `'sekilBitti'`; OLAY `sekil` {o, hayvan}.
- Ses anahtarları (SES ekler; tetikleyiciler `b_...` öneksiz de olur, `p_b_...` kaydedilir): `p_b_uyku` (kısa uyku girişi: "Bu gece bulutlara gidiyoruz!"),
  `p_b_giris` ("Gökkuşağı kaybolmuş! ... Hadi onları bulalım!"), `p_b_zip` (zıplatan bulut), `p_b_kuzu` (ilk kuzucuğu görünce), `p_b_kuzu_ilk` (ilk renklenince),
  `p_b_esinti`, `p_b_sekil1..3` (mini oyun daveti/izle/bitti: "Bu bulutun içinde biri saklanıyor... Hadi bulalım!", "Bu sensin!"),
  `p_b_ucus` ("Bin sırtıma!"), `p_b_ucus2` (uçuş ortası sevinç), `p_b_tepe` (gökkuşağı tepesi), `p_b_bitti` ("Gökkuşağı geri geldi!"),
  `a_b_final1..3` (Bölüm 3 sabah finali anlatıcısı; 3. cümle "Ve her gece, yeni bir macera onları bekliyordu..." olabilir).

## Ortak kurallar
- GitHub'a ASLA gönderme. Git'e commit ATMA (lead yapar).
- Güvenli çalışma: düzenlemeden önce dosyayı oku; büyük değişikliği scratch kopyada (kendi dizinin) yapıp test et, canlı dosyaya yazmadan önce canlı dosyanın
  değişmediğini kontrol et. Sözdizimi hatası tüm oyunu bozar: her yazımdan sonra `node --check dosya.js`.
- Test: kendi portunla `python -m http.server` (proje kökünden) + Playwright gerçek Chrome (`channel="chrome"`, headless), URL'de HER ZAMAN `?sessiz`. `pkill` KULLANMA.
  Konsol hatası = 0 olmalı. Bölüm 1 (`?sessiz&atla`) ve Bölüm 2 (`?sessiz&atla&bolum=2`) bozulmamalı.
- Eşzamanlı çalışılıyor: başka ajanın dosyası yarım olabilir; ihtiyacın olan işlev yoksa `typeof x==='function'` ile koru ve kendi işini ayrı doğrula.
- Performans: iPad 60 fps. Büyük gradyan/tuvalleri önbelleğe al, kare başına `ctx.filter`/`shadowBlur` yok, az bellek ayırma.
- Sonunda kısa rapor: ne yaptın, hangi API'yi kullandın/sağladın, başka sahiplerden isteklerin. Bu dosyaya kendi bölümünü EKLE (başlık: `## <SAHİP> notları`).

## PIRIL notları
- **`P.ucus` doluyken** `drawDragon` hiçbir şey çizmez (erken dönüş); `stepDragon` Pırıl'ı her karede Feza'nın konumunda tutar (mod 'follow', iz/parçacık/yol
  gösterme yok; konuşma heceleri işlemeye devam eder → 'binek' pozunun ağzı `p_b_ucus2` vb. sırasında oynar). `P.ucus` boşalınca ilk adımda Pırıl Feza'nın
  arkasında-üstünde (P.x − P.f·34, P.y − 96) parıltıyla belirir ve ≈0,8 sn'de biraz büyükten normal boyuna yumuşakça küçülür (ucus.js'in 'kucul' fazından sonra sıçrama yok).
- **Poz `'binek'`**: `pirilCizPoz(ctx, x, y, olcek, 'binek', tm, u)` — büyük uçan Pırıl, yandan, SAĞA bakar (sola uçuş: ctx'i `scale(-1,1)`).
  `x,y` = gövde ortası. `tm` = saniye; kanat sıklığı **1,15 Hz** (= ucus.js `UC_KANAT_HZ`; `tm = o.kanat / UC_KANAT_HZ` verince faz birebir oturur).
  `u` = eğim −1 (tırmanış) … +1 (dalış), verilmezse 0: gövdeyi ±0,2 rad döndürür (+ hafif baş/kuyruk tepkisi, tırmanışta tüyler daha çok geriye yatar).
  **ctx'i zaten `o.rot` ile döndürüyorsanız `u` VERMEYİN** (çift dönme olur).
  Gündüz için kanatlar `source-over` (parlak gökte beyaza boğulmaz), hale sıcak gün doğumu + lila. Yüz: ileri bakar, ağzı açık sevinç; ≈6,4 sn'lik döngüde
  bir "kıkır" (gözler kavis), bir de dönüp Feza'ya bakış; göz kırpma. Kuyruk uzun ve dalgalı, ucu yukarı kıvrık.
- **Ölçüler (ölçek 1, Pırıl merkezine göre; ×olcek)**: **koltuk (Feza'nın popo altı) dx = −1, dy = −9** · **el/boyun dx = +12, dy = −12** ·
  kuyruk ucu ≈ (−40, +1) · karın altı dy ≈ +10, ayak tabanı dy ≈ +13 (yere konarken merkez = zemin − 13·olcek; şu anki `25*UC_OLC` göbeği ≈26 birim havada bırakır) ·
  gövde x −19…+18, baş ucu x ≈ +37, ibik tepesi dy ≈ −40.
  Pozun kendi içinde küçük bir inip kalkması var (±1,1, ucus.js bob'uyla aynı fazda). Feza'nın tam oturması için en doğrusu her karede
  `pirilBinekKoltuk(tm, u, olcek)` → `{x, y, elX, elY, aci}` (ölçekli ofset; bob ve eğim dahil). Feza: `fezaCizPoz(g, cx + k.x, cy + k.y, 1, 'binis', tm, null, {el: {x: k.elX - k.x, y: k.elY - k.y}, aci: k.aci})`.
- **UCUS'a istek:** `UC_KOLTUK = {x: -3, y: -17}` yerine `{x: -1, y: -9}` (ya da `pirilBinekKoltuk`) — şu an Feza sırtın ≈18 birim üstünde havada duruyor;
  `UC_KUYRUK` ≈ `{x: -40, y: 1}`. Büyüme sırasında `s > 1.6`'da 'ucus' → 'binek' geçişi var; `o.flash` parlaması o ana denk gelirse geçiş görünmez.

## FEZA notları
- **`P.ucus` doluyken** `drawFeza` ve `drawFezaKontur` hiçbir şey çizmez (erken dönüş; hâle/kontur/gölge dahil). `fezaUpdate` çalışmaya devam eder (yumuşak dönüş için);
  `OLAY 'ucusBitti'` gelince Feza yere inişte kısa bir "ta-da!" yapar.
- **Poz `'binis'`** (Pırıl'ın sırtında): `fezaCizPoz(ctx, x, y, olcek, 'binis', tm, null, opt)` — yandan, SAĞA bakar (sola: eksi `olcek` ya da ctx'i aynala).
  `x,y` = **oturma noktası** (popo altı; Pırıl'ın koltuğu = `pirilBinekKoltuk`'un `x,y`'si). `olcek` 1 = oyundaki boy (ayakta ≈62 birim; otururken başın tepesi koltuğun ≈50 birim üstünde).
  `tm` = saniye (rüzgârda saç/giysi, ayak sallama, ~5 sn'de bir kolunu sevinçle kaldırıp "yihuu"; kendiliğinden döngü).
  `opt` (hepsi isteğe bağlı): `el: {x, y}` = ellerin tutunacağı nokta, oturma noktasına göre ctx biriminde (döndürmeden önceki çerçeve;
  ör. `{x: k.elX - k.x, y: k.elY - k.y}`; verilmezse ≈ `{x: 17*olcek, y: -10*olcek}`); Feza gerekirse öne eğilip uzanır. `aci` = gövdenin eğimi (radyan, `ctx.rotate` gibi;
  Pırıl'ın `aci`'si) — oturma noktası etrafında döner, ctx'i ayrıca döndürmeyin. `vy` = dikey hız (+ aşağı; dalışta saç kalkar, ağız "vay"); `ruzgar` 0..1 (vars. 1);
  `sevinc` 0..1 verilirse kol kaldırma onunla sürülür (ör. ışıltı toplayınca 1'e çıkarın), verilmezse otomatik; `isik`: Bölüm 3'te varsayılan gün doğumu tonu (sıcak pembe-altın kenar ışığı), 0 = kapalı.
  Dönüş: `{x, y}` = önde tutunan elin ctx konumu.
- **Poz `'kayma'`** (gökkuşağından kayarken): `fezaCizPoz(ctx, x, y, olcek, 'kayma', tm, null, opt)` — yandan oturur, bacaklar önde uzanmış, kollar havada "yihuu", saç geriye uçuşur.
  `x,y` = oturma noktası (kayılan yüzeyin üstü). `opt.aci` = yüzeyin ekrandaki eğimi (radyan, `ctx.rotate` gibi; sağa doğru aşağı kayarken +). `opt.hiz` 0..1 (rüzgâr şiddeti, vars. 1).
- **Oyun içi kayma:** `P.poz = 'kayma'` iken `drawFeza` bu pozu çizer (normal ışıklandırma + kontur ile). `P.x,P.y` = oturma noktası (gökkuşağı yüzeyi), yön `P.f`.
  Eğim `P.kaymaAci` (sayı ise) ya da yoksa `P.x/P.y`'nin kare kare değişiminden kendiliğinden bulunur. `P.poz` boşalınca normal animasyona döner.
- **`OLAY 'kuzu' {o}`**: Feza kuzucuğa döner, kısa sarılır (kollar sarar, gözler mutlulukla kapanır, yanağını yaslar ≈0,8 sn), sonra önden kollar havada sekerek sevinir (≈1,2 sn).
- **Bölüm 3 ışığı:** `FZ_AMB3` gün doğumu: üstte sıcak pembe-altın kenar ışığı, alttan bulutların pembe-lila yansıması, tende hafif şeftali sıcaklık (gece mavisi yok).

## CORE notları (oyun.js / arayuz.js / ortak.js — gerçek API, Tur 1)
- **Çizim yönlendirme:** BOLUM_NO==3 → `dn3Background(tm) dn3Motes(tm,zMin,zMax) dn3World(tm) dn3Petals(tm) dn3Foreground(tm) dn3Vignette(tm)` çağrı anında
  çözülür (dn2 ile aynı imzalar ve aynı kare sırası). `dn3Background` yoksa düz `#f3b8a8`, diğerleri yoksa atlanır. `dn3Isit()` Bölüm 3 sayfasında
  her karede (frame başında) `true` dönene kadar çağrılır; hata verirse ya da işlev yoksa bir daha çağrılmaz.
- **Sayaç:** `SAYAC.kuzu`, `SAYAC.kuzuTop` (= yükleme sonrası `tip==='kuzu'` sayısı). `OLAY.emit('kuzu', {o, renkI})` → `SAYAC.kuzu++` (aynı `o` için
  bir kez; CORE `o.sayildi=true` koyar). `o.done=true`'yu kuzu.js koyar.
- **HEDEF() / omHedefMi (Bölüm 3):** `kuzu`: `!o.done` (uçuş kapısının ÖTESİNDEKİ kuzucuk, uçuş bitmeden hedef değil) → `ucusKapisi`: uçuş bitmemişse ve
  kapıdan önce renklenmemiş kuzucuk kalmadıysa → `gokkusagi`: uçuş bittiyse, bütün kuzucuklar `done` ve `!o.done && !o.bitti && !o.basladi`.
  "Uçuş bitti" = `OLAY 'ucusBitti'` geldi YA DA kapı nesnesinde `o.bitti`/`o.done` true. `P.ucus` doluyken ve final planlanınca `HEDEF()` null.
  (Pırıl'ın Bölüm 3 rehberliği HEDEF()'i kullanabilir.)
- **Final:** `OLAY.emit('gokkusagiTamam', o)` → kontroller kilitlenir, 2 sn (oyun saati) sonra `finaleGec()` → `omTamamYaz(3)` + `SAHNE.final(bitir, {bolum:3})`.
- **Uçuş kancası:** `P.ucus` (ortak.js'te başlangıç `null`). Doluyken `stepPlayer` YALNIZ `P.ucus.adim(dt, girdi)` çağırır (120 Hz sabit adım; dt = 1/120):
  yerçekimi, çarpışma, zıplama, güvenli yer, düşme/göl/boşluk denetimi YOK; `P.fade` 0'lanır; konumu adim yazar (P.x/P.y; P.vx/P.vy isteğe bağlı).
  `girdi` = `OYUN.ucusGirdi` (tek nesne, her karede yenilenir): `{eksenY: -1 yukarı/0/+1 aşağı (klavye ↑/W/Space, ↓/S), eksenX (-1..1, ←/→ ya da parmak),
  basili (parmak ekranda mı), hedefY, hedefX (parmağın DÜNYA koordinatı; parmak yoksa null)}`. Uçuşta her parmak (zıplama düğmesinin yeri dahil) uçuş parmağıdır.
  `P.kilit > 0` iken girdi sıfırdır (kalkış/iniş anları için UCUS kullanabilir). adim art arda ≈2 sn hata verirse CORE uçuşu bırakır (`P.ucus=null`).
  `P.ucus` null olunca ilk adımda CORE Feza'nın altındaki zemini (3 kare içinde) güvenli yer yapar; sonra normal fizik.
  Uçuşta: zıplama düğmesi, yürüme okları ve el ipuçları gizli (arayuz.js); oyun.js'in Pırıl hâlesi (`omPirilHale`) çizilmez. drawFeza/drawDragon
  erken dönüşü FEZA/PIRIL'de.
- **Uçuş kamerası:** `P.ucus` dolunca ≈0,6 sn'de yumuşakça devreye girer (çıkışta ≈0,7 sn'de normale döner; `OYUN.ucusKamera` 0..1 ağırlık).
  Feza ekranın yatayda ≈%29'unda (hız gecikmesi telafili), dikeyde Feza'yı izler ama `BOLUM.ucus.yUst-150 .. yAlt+130` dışına taşmaz; yakınlık
  `VH/(yAlt-yUst+240)` en az 0,8, en çok 0,95 (Bölüm 3 koridoru 120..700 → ≈0,83).
- **Akış:** seçim ekranı 3 baloncuk (`{id:1,'orman'} {id:2,'gol'} {id:3,'bulut'}`); 2/3 → `sessionStorage 'fezaIsikSec'` + yenileme → koyu perdeyle açılır →
  `SAHNE.giris(basla, {bolum:3, kisa:true})` (`?sessiz&bolum=3&uyku` ile de) → bitince karanlık açılış (ışık taneleri şafak tonlarında) +
  `OLAY 'bolum3Basla'` + `OLAY 'gecisAsama' {ad:'acilis', bolum:3}` + ≈2,4 sn'de `SES.soyle('p_b_giris')` (Bölüm 2'de `bolum2Basla` / `p_y_giris` aynen).
- **Fizik:** Bölüm 3'te Bölüm 2'nin affedici ayarları (COYOTE 0,23, KENAR 17, hava ivmesi 2300, geniş kenar yardımı, zıplama basılıyken hava yardımı).
- **Arayüz:** Bölüm 3 sayacı ve sonuç kartı kuzucuk simgesi (bulut gövde, sevimli yüz); her renklenen kuzucuk gökkuşağı sırasındaki rengiyle
  (0 kırmızı … 6 mor), renklenmemişler gri/üzgün. Kart başlığı (ebeveyn için) "Gökkuşağı geldi!". Kart: kuzucuk + tohum (+ varsa diğerleri).
- **Test kancaları (window.OYUN):** `ucusGirdi`, `ucusKamera`, `omDikkat(ad, sn, fn, guc, zMin)`, `omDkEkle(x0,y0,x1,y1)` (Bölüm 2'deki dikkat kamerası;
  ör. gökkuşağı belirirken göğü göstermek için bulut.js kullanabilir; global `omDikkat`/`omDkEkle` de çağrılabilir), `SAYAC`, `HEDEF`, `finaleGec`.
- (CORE, Tur 2) Bölüm 3'te bulutların altına düşünce su sıçraması yerine yumuşak beyaz-pembe bulut tozu ve `AU.sfx('bulutDus')` (SES: yoksa sessiz geçer;
  istenirse yumuşak "puf" sesi eklenebilir). Bölüm 1 fiziği de biraz affedicileşti (COYOTE 0,18, KENAR 14, hava ivmesi 1600, kenar yardımı 36 birim).

## SES notları
- **Müzik (muzik.js, `BOLUM_NO===3`):** G Lidyen (Bölüm 1'in D majörüyle aynı notalar; gün doğumu, havada asılı). 'bulut' akorları `BG BA BE BD BG BA BB BS` (×2 ölçü, 38 sn);
  Bulut Teması 16 ölçü: Pırıl'ın altılı sıçrayışı D–B–A–G açar, Feza'nın üç–iki–biri cevaplar; A (müzik kutusu → kuzucuk bulununca flüt) / B (flüt) / A (çelesta + flüt karşı ezgisi) / C (seyrek çanlar).
  Yeni çalgı `flut` (yumuşak üflemeli/okarina: sinüs + süzgeçli üçgen, nefesli atak, geç vibrato). Katmanlar `SAYAC.kuzu/kuzuTop` oranıyla açılır (yoksa `OLAY 'kuzu'` sayısı/7):
  0 kuzucuk: pad + yavaş harp + müzik kutusu, uzak kuşlar · 1+: flüt · >.25 yaylılar, inen ikinci harp dalgası · >.4 çelesta akorları, alt bas · >.55 nabız, "oo" korosu, flüt karşı sesi · >.7 harp sekizlikleri · >.85 ışıltı ritmi.
  **Uçuş** (`OLAY 'ucusBasla'` → `'ucusBitti'`, ya da `P.ucus` doluyken): 'ucus' parçası (akor her ölçüde, koşan/süzülen flüt ezgisi, on altılık harp akışı, nabız, rüzgâr ışıltısı); bitince 'bulut'a döner.
  **Gökkuşağı** (`OLAY 'gokkusagiBasla'`): doruk – ezgi iki oktavda, her akorda yedi renkli çan şelalesi, geniş akor. `DURUM 'final'` → ortak D majör final (Bölüm 3'te Pırıl'ın temasına flüt de katılır), sabahta ninni.
  Seçim ekranında `ruyayaGec` anında ninninin yeri `sessionStorage 'fezaNinni'`ye yazılır; yeni bölüm sayfasında ninni kaldığı cümleden sürer (20 sn içinde).
- **Efektler (`AU.sfx` adı = aynı adlı `OLAY`; aynı anda ikisi gelirse bir kez çalar):** `bulutZip`(v güç 0..1; art arda zıplayışta perde basamaklanır) · `esinti` · `gokkusagiParca`(v=renkI) ·
  `gokkusagiBasla` · `gokkusagiTamam` · `kayma` (~2,4 sn inen harp glissandosu) · `kuzuRenk`(v=renkI 0..6: G A B C# D E F#, yedincide G'ye çözülür; `OLAY 'kuzu' {renkI}` de çalar) · `kuzuMee` (kısık, en az 0,6 sn arayla) ·
  `ucusBasla` · `pirilBuyu` · `isiltiTopla`(v=sıra; `OLAY 'isilti'` {i|sira} de; sıra yoksa kendi sayar, 4 sn arada sıfırlanır; G majör pentatonik yükselen) · `ucusIn` (`ucusBitti` gelip iniş sesi çalmadıysa o çalar) ·
  `sekilOv`(v=0..1; her 1/8'de yükselen nota; en sık 0,12 sn) · `sekilCanlan`(v=hayvan, sayı ya da ad; `OLAY 'sekil' {hayvan}` de) · `sekilBitti`.
- **Seslendirme (ses.js → sesler.js, 81 cümle, 2,5 MB):** `p_b_uyku` 1,7 sn · `p_b_giris` 5,7 · `p_b_zip` 3,5 · `p_b_kuzu` 5,1 · `p_b_kuzu_ilk` 4,6 · `p_b_esinti` 3,4 · `p_b_sekil1/2/3` 3,4/1,7/3,5 · `p_b_ucus` 2,8 · `p_b_ucus2` 3,5 ·
  `p_b_tepe` 5,3 · `p_b_bitti` 2,9 · `a_b_final1/2/3` 9,3/9,8/3,7. Tetikleyiciler öneksiz olur (`b_zip` → `p_b_zip`). Bölüm 3'te `a_final*`/`a_y_final*` → `a_b_final*`, `p_y_uyku` → `p_b_uyku`, `p_y_giris` → `p_b_giris` kendiliğinden.
  Otomatik: ilk `OLAY 'kuzu'` → `p_b_kuzu_ilk`; sonraki kuzucuklarda ara sıra (~⅓) övgü `p_aferin`; `ucusBasla` → `p_b_ucus` (söylenmediyse) ve 11 sn sonra hâlâ uçuyorsa `p_b_ucus2`;
  `OLAY 'sekil'` → 1,2 sn sonra `p_b_sekil3` (sekil.js söylediyse tekrar yok); `gokkusagiBasla` → `p_b_bitti` (öncelik 3). `p_b_uyku`, `p_b_giris`, `p_b_bitti`, `a_b_final*` sahne cümlesi (öncelik 3).
  Geçerlilik: `p_b_kuzu` ilk kuzucuk renklenince, `p_b_tepe` gökkuşağı başlayınca, `p_b_zip`/`p_b_esinti` Feza tetikleyiciyi 12 kare geçince, `p_b_ucus2` uçuş bitince söylenmez.
- **Dostça sözler (her bölüm):** `p_dost1..3` + bölüme özel `p_dost_orman` / `p_dost_yildiz` / `p_dost_bulut`. Yalnız oyunun ilk 60 sn'sinden sonra, ≥50 sn hiç konuşma yokken, Feza yürürken (uçuş/kilit yok),
  oturumda en çok 3 kez, en az 90 sn arayla; öncelik 1 (talimatlar öne geçer).

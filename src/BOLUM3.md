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
  gösterme yok; konuşma heceleri işlemeye devam eder → 'binek' pozunun ağzı `p_b_ucus2` vb. sırasında oynar). `P.ucus` boşalınca Pırıl ucus.js'in bıraktığı
  `D.x/D.y`'den (küçülme sonu) Feza'ya dönük devam eder; bırakılmamışsa (uçuş yarıda kesildi) Feza'nın arkasında parıltıyla belirip ≈0,8 sn'de büyükten normale küçülür.
- **Poz `'binek'`**: `pirilCizPoz(ctx, x, y, olcek, 'binek', tm, u)` — büyük uçan Pırıl, yandan, SAĞA bakar (sola uçuş: ctx'i `scale(-1,1)`).
  `x,y` = gövde ortası. `tm` = saniye; kanat sıklığı **1,15 Hz** (= ucus.js `UC_KANAT_HZ`; `tm = o.kanat / UC_KANAT_HZ` verince faz birebir oturur).
  `u` = eğim −1 (tırmanış) … +1 (dalış), verilmezse 0: gövdeyi ±0,2 rad döndürür (+ hafif baş/kuyruk tepkisi, tırmanışta tüyler daha çok geriye yatar).
  **ctx'i zaten `o.rot` ile döndürüyorsanız `u` VERMEYİN** (çift dönme olur).
  Gündüz için kanatlar `source-over` (parlak gökte beyaza boğulmaz), hale sıcak gün doğumu + lila. Yüz: ileri bakar, ağzı açık sevinç; ≈6,4 sn'lik döngüde
  bir "kıkır" (gözler kavis), bir de dönüp Feza'ya bakış; göz kırpma. Kuyruk uzun ve dalgalı, ucu yukarı kıvrık.
- **Ölçüler (ölçek 1, Pırıl merkezine göre; ×olcek)**: **koltuk (Feza'nın popo altı) dx = −1, dy = −9** · **el/boyun dx = +12, dy = −12** ·
  kuyruk ucu ≈ (−40, +1) · karın altı dy ≈ +10, ayak tabanı dy ≈ +13 (yere konarken merkez = zemin − 13·olcek) ·
  gövde x −19…+18, baş ucu x ≈ +37, ibik tepesi dy ≈ −40.
  Pozun kendi içinde küçük bir inip kalkması var (±1,1, ucus.js bob'uyla aynı fazda). Feza'nın tam oturması için en doğrusu her karede
  `pirilBinekKoltuk(tm, u, olcek)` → `{x, y, elX, elY, aci}` (ölçekli ofset; bob ve eğim dahil). Feza: `fezaCizPoz(g, cx + k.x, cy + k.y, 1, 'binis', tm, null, {el: {x: k.elX - k.x, y: k.elY - k.y}, aci: k.aci})`.
- UCUS `UC_KOLTUK {-1,-9}`, `UC_KUYRUK {-40,1}` ve `pirilBinekKoltuk`'u kullanıyor (uçuş baştan sona denendi: kapı → büyüme → biniş → uçuş → iniş → küçülme → takip; hata 0).
  `OLAY 'isilti'` gelince 'binek' Pırıl kısa bir sevinç yapar (gözler kavis, baş kalkar, ağız kocaman; ≈0,9 sn).
- **Bölüm 3 rehberlik:** `drHedef` Bölüm 3'te doğrudan `HEDEF()` (kuzucuk → uçuş kapısı → gökkuşağı); yol gösterme yükseklikleri kuzu 48, kapı 96, gökkuşağı 80;
  ilk yol gösterme ≈9 sn, sonra Feza ≈8 sn durursa/ters giderse. Gündüz için iz gökkuşağı renkli benekler, nabız pembe halka (beyaz ışık bulutu yok).
- **Kuzucuklar:** ilk gri kuzucuğu görünce Pırıl yanına uçar, başı yana eğik şefkatle bakar, pençesiyle "sarıl" der gibi işaret eder (`merak` modu).
  `OLAY 'kuzu' {o, renkI}` → kuzucuğun çevresinde sevinç turu, kalpler/yıldızlar o kuzucuğun gökkuşağı renginde (cümleleri ses.js söyler).
  Renklenmiş kuzucuklar yakındayken ara sıra (≈15-20 sn'de bir) çevrelerinde oyuncu bir tur atar (`oyna`).
- **`bulutSekil` (MINI3):** piril.js'te `DR_SEKIL = true` ve `'sekil'` modu var (sekil.js bunu kendisi seçer: `D.sklO`, `D.sklKut`, `sklPirilYer`).
  Pırıl bulutun yanında süzülüp buluta bakar (ilk anda merak, bulutta göz kırpınca şaşkın bakış); takılınca (topT>12) pençesiyle ovar ve yıldızlar saçar;
  canlanınca bulut-hayvanın çevresinde sekiz çizerek dans eder, ara ara takla atar.
- **Düşme/kurtarma Bölüm 3:** aynı sistem (bulutların altına dalar, yakalar, güvenli yere uçarak taşır); su sıçraması yerine pembe-beyaz bulut serpintisi, damla yok.
- **Ortam tonu:** Bölüm 3'te Pırıl'ın arkasında sıcak şeftali hale, başında güneş ışığı, altında pembe bulut yansıması; ışık kanatlar gündüz modunda (source-over),
  kalp/yıldızlar doygun renkli, uçuşan spor yerine pamuk gibi bulut tüyü.

- **Tur 2 (cila):** 'binek' çizimi önbellekli: gövde katmanı ve kafanın hareketsiz katmanı tuval ölçeğine göre bir kez çizilip `drawImage` ile basılıyor,
  gündüz ışık tüyleri hazır sprite (başsız Chrome'da ≈1,7 → ≈1,0 ms). Yeni etkileşim: çift zıplama / zıplatan bulut sonrası inişte ara sıra (≥22 sn arayla)
  Pırıl Feza'nın yanında yarım dönüşle önüne döner ve alkışlar (`alkis` modu, el çırptıkça minik yıldız), sonra aynı yoldan yana döner. Ara sıra çift göz kırpma.
- **Tur 3:** Feza'ya yakınken Pırıl'ın gövdesine bağlı `lighter` ışıklar (hâle, ay/gün doğumu ışığı, kuyruk ucu, kanat kökü; gece kanat tüyleri de) uzaklığa göre
  %35'e kadar kısılır ve küçülür (`DR_YK`; Feza'yı soldurmaz). Ara sahne pozlarının hâlesi küçültüldü (90→66, 0,3→0,22). Yeni `otur` modu: Feza oturunca Pırıl
  sırtının olduğu yana konar, kanatlarını toplar, ona dönük oturur, arada sevgiyle ona eğilir, onunla birlikte esneyebilir; Feza kalkınca havalanır.

## FEZA notları
- **`P.ucus` doluyken** `drawFeza` ve `drawFezaKontur` hiçbir şey çizmez (erken dönüş; hâle/kontur/gölge dahil). `fezaUpdate` çalışmaya devam eder;
  `OLAY 'ucusBitti'` gelince Feza yere inince kısa bir "ta-da!" yapar.
- **Poz `'binis'`** (Pırıl'ın sırtında): `fezaCizPoz(ctx, x, y, olcek, 'binis', tm, null, opt)` — yandan, SAĞA bakar (sola: eksi `olcek` ya da ctx'i aynala).
  `x,y` = **oturma noktası** (popo altı = `pirilBinekKoltuk`'un `x,y`'si). `olcek` 1 = oyundaki boy (ayakta ≈62 birim; otururken başın tepesi koltuğun ≈50 birim üstünde).
  Yakın bacak Pırıl'ın böğrüne sarkar (keyifle sallanır), uzak bacak çizilmez (Pırıl'ın öbür yanında). `tm` = saniye (rüzgârda saç/gömlek çırpınır).
  `opt` (hepsi isteğe bağlı): `el: {x, y}` = ellerin tutunacağı nokta, oturma noktasına göre ctx biriminde (döndürmeden önceki çerçeve;
  ör. `{x: k.elX - k.x, y: k.elY - k.y}`; verilmezse `{x: 17*olcek, y: -10*olcek}`). Feza en çok ≈0,4 rad öne eğilir, yetmezse kolları çizgi film gibi en çok %26 uzar.
  `aci` = gövde eğimi (radyan, `ctx.rotate` gibi; oturma noktası etrafında döner). `vy` = dikey hız (+ aşağı; dalışta saç kalkar, ağız "vay");
  `ruzgar` 0..1 (vars. 1); `sevinc` 0..1 verilirse yakın kol onunla kalkar ("yihuu", gözler ^ ^), verilmezse ~5,6 sn'de bir kendiliğinden;
  `isik`: Bölüm 3'te varsayılan 2 = gün doğumu tonu (şeftali dolgu + pembe-altın / pembe / lila kenar ışıkları; küçük ara tuval), 0 = kapalı.
  Dönüş: `{x, y}` = tutunma noktasının ctx konumu.
- **Poz `'kayma'`** (gökkuşağından kayarken): `fezaCizPoz(ctx, x, y, olcek, 'kayma', tm, null, opt)` — yandan oturur, bacaklar önde, gövde geride,
  yakın kol önde-yukarıda el açık, uzak kol yukarıda; ağız kocaman açık gülüyor (ara sıra gözler ^ ^), saç geriye uçuşur.
  `x,y` = oturma noktası (kayılan yüzey). `opt.aci` = yüzeyin ekrandaki eğimi (radyan; sağa doğru aşağı kayarken +, sola aşağı kayarken −). `opt.hiz` 0..1 rüzgâr.
- **Oyun içi kayma:** `P.poz === 'kayma'` iken `drawFeza` bu pozu çizer (oyun ışıklandırması + kontur ile). `P.x,P.y` = oturma noktası; yön konum değişiminden
  (yoksa `P.f`); eğim `P.kaymaAci` (sayıysa) ya da konum değişiminden, yumuşatılmış. `P.poz` boşalınca Feza yere inince "ta-da!" yapar. (bulut.js bunu kullanıyor; denendi.)
- **`OLAY 'kuzu' {o}`**: Feza kuzucuğa döner, ≈0,85 sn sarılır (öne eğilir, kollarıyla sarar, yanağını yaslar, gözler ^ ^, iki kez sıkar), sonra önden kollar havada sekerek sevinir.
- **Esinti** (bulut.js `esinti`, `o.ic`/`o.guc` okunur): içindeyken Feza süzülür — kollar kanat gibi açık yavaşça çırpar, bacaklar gevşek, saç ve gömlek eteği aşağıdan gelen rüzgârla kalkar.
- **Bölüm 3 ışığı:** `FZ_AMB3` gün doğumu: sağ üstten pembe-altın kenar ışığı, arkadan pembe gök kenarı, alttan lila bulut yansıması, tende hafif şeftali; ışık hep "gündüz"
  (`light`'tan bağımsız); dış kontur krem yerine yumuşak erik tonu (açık gökte seçilsin). Bulut zemine inişte küçük bir yaylanma ("boing").
- Genel (her bölüm): dönüşte önden görünüşün başı/sonu 3/4 yüz (yüz çizgileri bakılan yana kayar, uzak göz daralır, kulak değişir) — karton gibi düz çevrilme yok.
  Kol yüzün önünden geçince ince ten kenarı (ten üstünde ten okunsun).
- Tur 2: bölüme göre bekleme hareketi (el sallama/oturma dışındaki her bekleme seçiminde ≈%40): Bölüm 1 'toz' (süzülen ışık tozunu gözle izler, sekip yakalar, avucuna bakar, açınca sevinir),
  Bölüm 2 'yansima' (ellerini dizine koyup suda yıldız yansımasına bakar, el sallar), Bölüm 3 'pat' (bulutu okşar). Koşudan durunca kısa denge kaybı (kollar çırpar, öne sallanır,
  hızlı duruşta minik toz); kalkışın ilk ≈55 ms'si dizler bükük basık "itme" (gecikme yok, çömelme hissi).
- **Bölüm 2'deki soluk görünüm nedeni: feza.js'in kendisiydi** (dunya2/oyun.js katmanları tek tek kapatılarak ölçüldü, hiçbiri değiştirmiyordu): Bölüm 2 tonunda Feza'nın
  üstüne %34 şeftali + %7 krem düz dolgu basılıyordu; saç/göz kontrastını eritiyordu. %15 / %3'e indirildi, dış krem kontur 0,42→0,32, hâle 0,2→0,14. Başka sahibe iş yok.
- Not: istenen referans fotoğraf (`Game Development/images/16.webp`) diskte yok (klasör bulunamadı); benzerlik için fotoğraf gelirse yeniden bakılabilir.
- PIRIL'e not: Bölüm 3'te Pırıl Feza'ya çok yakınken beyaz/pembe ışıltısı Feza'yı soldurabiliyor (girişte, ilk saniyelerde belirgin); Feza'nın üstüne 'lighter' ışık az olsun.
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
  Ek: `bulutDus` (buluttan düşüş; Bölüm 3'te `OLAY 'dustu'` ve eski `splash` da bunu çalar, su sesi yok) · `bolum3Basla` (açılış: ışık tozu + flütte Pırıl'ın sıçrayışı) ·
  `kemer` / `OLAY 'ucusKemer'` (uçuşta gökkuşağı kemeri) · `isiltiTamam` · `pirilBuyu` v=0 → küçülme (inen ışıltı). `sekilCanlan` v: 0 tavşan 1 balina 2 fil 3 kuş 4 ayıcık 5 Feza – her birinin kendi flüt motifi.
  Olay-efekt zamanı farklıysa olay yalnız yedek: `OLAY 'kuzu'` (sarılma başı) → 0,9 sn içinde `kuzuRenk` gelmezse çalar; `OLAY 'gokkusagiTamam'` (kaymadan sonra) parlama sesi 25 sn içinde çaldıysa susar.
  Bölüm 3'te adımlar bulut zeminde pamuk gibi "pof".
  `kuslar` (ucus.js: uçuşta kuş sürüsü cıvıltısı). Karışım (her bölüm): müzik yolunda 50 Hz altı kesim + 170 Hz'de −7 dB raf, yankı dönüşünde 190 Hz altı kesim (iPad hoparlöründe çamur/limiter sıkışması azalır).
- **Seslendirme (ses.js → sesler.js, 82 cümle, 2,5 MB):** `p_b_uyku` 1,7 sn · `p_b_giris` 5,7 · `p_b_zip` 3,5 · `p_b_kuzu` 5,1 · `p_b_kuzu_ilk` 4,6 · `p_b_esinti` 3,4 · `p_b_sekil1/2/3/4` 3,4/1,7/3,5/1,7 (sekil4 "Bak, bu sensin Feza!"; Feza şeklinde sekil3 söylenmez) · `p_b_ucus` 2,8 · `p_b_ucus2` 3,5 ·
  `p_b_tepe` 5,3 · `p_b_bitti` 2,9 · `a_b_final1/2/3` 9,3/9,8/3,7. Tetikleyiciler öneksiz olur (`b_zip` → `p_b_zip`). Bölüm 3'te `a_final*`/`a_y_final*` → `a_b_final*`, `p_y_uyku` → `p_b_uyku`, `p_y_giris` → `p_b_giris` kendiliğinden.
  Otomatik: ilk `OLAY 'kuzu'` → `p_b_kuzu_ilk`; sonraki kuzucuklarda ara sıra (~⅓) övgü `p_aferin`; `ucusBasla` → `p_b_ucus` (söylenmediyse) ve 11 sn sonra hâlâ uçuyorsa `p_b_ucus2`;
  `OLAY 'sekil'` → 1,2 sn sonra `p_b_sekil3` (sekil.js söylediyse tekrar yok); `gokkusagiBasla` → `p_b_bitti` (öncelik 3). `p_b_uyku`, `p_b_giris`, `p_b_bitti`, `a_b_final*` sahne cümlesi (öncelik 3).
  Geçerlilik: `p_b_kuzu` ilk kuzucuk renklenince, `p_b_tepe` gökkuşağı başlayınca, `p_b_zip`/`p_b_esinti` Feza tetikleyiciyi 12 kare geçince, `p_b_ucus2` uçuş bitince söylenmez.
- **Dostça sözler (her bölüm):** `p_dost1..3` + bölüme özel `p_dost_orman` / `p_dost_yildiz` / `p_dost_bulut`. Yalnız oyunun ilk 60 sn'sinden sonra, ≥50 sn hiç konuşma yokken, Feza yürürken (uçuş/kilit yok),
  oturumda en çok 3 kez, en az 90 sn arayla; öncelik 1 (talimatlar öne geçer).

## LEVEL3 notları (bolum3.js + bulut.js) — GÜNCEL (Tur 2: bölüm zenginleştirildi, COLS 458 → 524)
- **Yerleşim** (`COLS=524`, `ROWS=30`, ana yüzey y=720; h=5→680 … h=9→520). Eski taslak sütunu `c` → yeni `bl3K(c)` (57+ → +36, 140+ → +50, 219+ → +66).
  1 Pembe Bulutlar 0–56 (çukurlarda yüzey hizasında zıplatan bulutlar 21–23, 27–28, 31–32: üstünden yürüyünce "boing") ·
  1b **Gökyüzü Merdiveni** 57–92 (yolda alçak zıplatan bulut → ince bulut basamakları y=560/440/320 → tepede tohum yayı; isteğe bağlı, alttan düz yol) ·
  2 Kuzucuk Çayırı 93–175 (133–142 platoda **bulut mağarası**: tavan satır 12–13, içinde 2. kuzucuk; 143–144 çukurunda **asansör bulutu** tavana/üst yola çıkar; 153–159 yüzen bulut) ·
  2b **Uykucu Bulut Kuşu** 176–189 (boşluk DEĞİL: 3 kare derin yumuşak bulut çukuru, zemin y=840; kuş Feza'yı sırtında taşır; kuşu beklemeden atlayan çukura iner, sağ uçtaki zıplatan bulut (188) karşı kıyıya atar — düşüş/sıkışma yok) · 3 Rüzgâr Yolu 190–268 (esintiler 201 ve 245 duvarlarının önünde, yüzen bulut 221–226, bulut adası 245–254, rüzgâr kuyusu 265–268) ·
  3b **Tüy Köprüsü** 269–284 (273–284 boşluğunda salınan 3 dev tüy) · 4 Bulut Şekilleri 285–317 · Büyük Boşluk kıyısı 318–330 (kapı sütun 326) · uçuş 331–453 (zemin yok) ·
  6 Gökkuşağı Tepesi 454–523 (tepe üstü 487–499, y=520).
  Ana yolda basamaklar ≤ 1 kare; yüksek duvarların önünde duvara dayalı esinti; boşluklar ≤ 2 kare (yüzen bulut/kuş/tüy yerleri hariç).
  DİKKAT: mağara sütunlarında (135–142) `topOf/yuzey` TAVANI (y=480) verir; içerideki zemin y=640.
- **`BOLUM.bolgeler`**: `pembeBulut` 0–93·T, `kuzuCayir` 93–190, `ruzgar` 190–285, `sekil` 285–318, `bosluk` 318–331, `ucus` 331–454, `tepe` 454–COLS.
- **`BOLUM.ucus`** = `{x0: nx(326)=13060, x1: 455·T=18200, yUst: 120, yAlt: 700}` (iniş: sütun ≈457; 7. kuzucuk 462'de).
- **`BOLUM.gokkusagi`** = `{x, y, cx, cy, R}`: x = cx = nx(494.5)=19800, y=520; yay merkezi (19800, 1034), dış yarıçap R=600 (yayın tepesi y=434).
- **Nesneler** (y = ÜST yüzey: bulutZip/bulutYuzen/bulutKus/bulutKopru; esinti: y = sütunun dibi): 7 `kuzu` (sütun 111, 139 (mağarada, y=640), 167, 207 (yüksek düzlük),
  250 (bulut adası), 303.5, 462); 2 `bulutSekil` (291 `{sira:0}`, 314 `{sira:1}`); `ucusKapisi` 326; `gokkusagi`; 14 `tohum` (isteğe bağlı; yüksek pembe bulut 2, boing zinciri 2, merdiven tepesi 3, mağara tavanı 2, kuş yolu 1, esinti 1, kuyu 1, tüy köprüsü 1, tepe 1);
  `konusma`: `b_zip` (15), `b_kuzu` (99, konu = 1. kuzucuk), `b_esinti` (191), `b_tepe` (467).
  Süsler: `ucurtma` ×7, `kusSuru` ×7, `tuy` ×13.
- **Türler (bulut.js)**: `bulutZip {w, h=18, guc, gom}` · `bulutYuzen {w, ax, ay, sure, faz, gorunum:'tuy', renk}` (uçlarda %14 bekler; `gorunum:'tuy'` = dev tüy, durmadan sinüs salınımı) ·
  `bulutKus {w, ax, ay, sure}` (uyku; Feza ≈320 birim yakınındayken uyanır, ön kanadıyla "gel" sallar, sırtında pırıltılar → Feza sırtında 0,45 sn → `OLAY 'bulutKus'`, kalkar, yay çizerek karşıya uçar → Feza inince 2,5 sn sonra (Feza başlangıç kıyısına dönmüşse 0,4 sn sonra) boş döner; `o.durum` uyku/git/karsi/don) ·
  `esinti {w, h, kuyu}` · `gokkusagi` · `bulutKopru` (YALNIZ `ucusKapisi` türü yoksa) · `ucurtma {ip, renk}` · `kusSuru {n}` · `tuy`.
  Renkler `BU_GK` (gökkuşağı bantları `DN3_RB` varsa onu kullanır). bulutYuzen/bulutKopru `dn3Bulut` ile çizilir; bulutZip kendi pembe esnek sprite'ı.
- **Gökkuşağı akışı**: başlama: Feza tepe üstünde (yerde) + bütün kuzucuklar renkli (kuzu türü yoksa hemen). t=0 `OLAY 'gokkusagiBasla'` (veri = nesne; `o.konumlar` = 7 {x,y}
  = `o.yayX/o.yayY`, yarıçap R+90, 112°→68° (dar: final kadrajına sığar), renkI sırasıyla) + `omDikkat('gokkusagi')` (kutu: önce yay tepesi ±330, kayışta Feza + iniş yeri; zMin 0.6); t=2,4+i·0,42 bant i (`AU 'gokkusagiParca'` v=i, `OLAY 'gokkusagiParca' {o, renkI}`);
  ≈5,8 sn `AU 'gokkusagiTamam'` + `OLAY 'gokkusagiParlak'`; +0,6 sn Feza yayın tepesine sıçrar → `AU 'kayma'`/`OLAY 'kayma'` → ≈2,3 sn kayış (`P.poz='kayma'`, `P.kaymaAci`)
  → iniş → 1,3 sn sonra `o.done=o.uyandi=true` + `OLAY 'gokkusagiTamam'`. `o.basladi` başlarken true. Işımalar WORLD3 isteğiyle ≈%50 kısık.
  Yedek: Feza tepedeyken Büyük Boşluk'un öbür yanında renklenmemiş kuzucuk kalırsa `TUR.al('kuzu').dokun(k)` uzaktan çağrılır (`k.uzaktan=true`).
- **Olaylar**: `bulutZip`, `bulutKus`, `esinti`, `gokkusagiBasla`, `gokkusagiParca`, `gokkusagiParlak`, `kayma`, `gokkusagiTamam`.

## UCUS notları (ucus.js)
- **Tür `ucusKapisi`**: `o.r` 70. Beklerken yerde lila ışık halkası, dönen renkli yıldızlar, ışıktan kanat silüeti çizer (kapı görünür ve çağırır).
  Feza dokununca (kuzucuklar bitmese de) sahne: Pırıl yanına süzülür (0,8 sn) → ışıkla 2,2× büyür (`AU.sfx('pirilBuyu')`, `SES.soyle('p_b_ucus')`,
  `omDikkat('ucusBuyu')`) → Feza sırtına zıplar → `AU.sfx('ucusBasla')` + `OLAY 'ucusBasla'` (o) → uçuş (V = koridor/34 sn, en az 170; Bölüm 3'te ≈30 sn)
  → koridor sonunda Hermite eğrisiyle tepeye iniş (`AU.sfx('ucusIn')`) → Feza öne atlar → Pırıl ışıkla küçülür → `P.ucus=null`, `o.done=true`, `OLAY 'ucusBitti'`.
  `P.ucus` kapının bastığı anda dolar (sahne boyunca Feza'yı/Pırıl'ı ucus.js çizer). Toplam ≈36-38 sn.
- `P.ucus` doluyken `o.x` her karede kameranın ortasına taşınır (oyun.js çizim ayıklaması nesneyi atlamasın); bitince kapının yerine döner (`o.kx/o.ky`).
- İniş yeri: `BOLUM.ucus.x1`'den sonraki ilk düz zemin (4 sütun) + 2 sütun; yoksa `BOLUM.gokkusagi`. Feza oraya +40 birim ileride bırakılır.
- Kontrol: `girdi.hedefY` (parmak) → Feza'nın gövdesi parmağın yüksekliğine süzülür; `eksenY` klavye; girdi yoksa ≈2 sn'de devreye giren yumuşak otomatik
  pilot yaklaşan ışıltıya/kemere yönelir (hiç dokunmayan çocuk da çoğunu toplar). `eksenX` kullanılmıyor (parmak yalnız yüksekliği seçer). Bant: `yUst+110 .. yAlt-40` (P.y).
- Yol içeriği (koridor oranıyla yerleşir): 12 ışıltı dizisi (yay, dalga, çapraz, KALP, son dizi gökkuşağı renkli; toplam 83), 4 pembe/şeftali/lila bulut
  kemeri (içinden geçilir: arka yarı `ciz`, ön yarı `cizOn`), 3 yumuşak uykulu-yüzlü bulut (yalnız hafifçe iter), koridorun %29-60'ında 7 kuşçuk.
- Olaylar: `isilti` {o, sira, x, y, tamam, toplanan, toplam} · `ucusKemer` {o, k} · `ucusBasla` · `ucusBitti`. Sesler: `isiltiTopla`(v = dizideki sıra 0..15),
  `isiltiTamam` (dizi bitti), `kemer` (kemerden geçiş), `kuslar` (sürü katılınca), `bulutZip` 0.25 (yumuşak bulut), `pirilBuyu` (büyüme ve küçülme).
- **Kuzucuklar için API:** `UC.takip(i)` → uçuş sırasında i. kuzucuğun (0'dan) durması gereken dünya noktası `{x,y}` (ışık izinin üstünde, Pırıl'ın kuyruğunun
  arkasında, aralıklı) ya da uçuş yoksa `null`. `UC.aktif()`. Test: `UC.baslat()` uçuşu hemen başlatır, `UC.o` kapı nesnesi.
- **Kuzucuklar:** ucus.js her karede `P.ucus.kuyruk = {x, y, yon: -1}` (kuyruk ucu, dünya) yazar; kuzu.js `kzUcus` bunu kullanıyor (test: 6 kuzucuk kuyrukta uçtu).
  POF'a öneri: uçuşta aralık 42 → ≈30 (kamera Feza'yı ekranın sol %29'unda tutuyor; 6 kuzucuk 280 birimle ekranın soluna taşıyor).
- **Parmak ipucu (yazısız):** uçuşun ilk ≈12 sn'sinde hiç dokunulmadıysa ekranın sağında yukarı-aşağı kayan dokunuş ışığı + oklar; ilk dokunuşta söner.
- **SES:** `kemer`, `isiltiTamam`, `kuslar` muzik.js'te var (teşekkürler). Uçuş ortasındaki "vay" anında ilk hayvan gelince `SES.soyle('p_b_selam')` çağrılıyor —
  **SES'e istek:** bu cümleyi ekleyin (öneri: "Bak Feza! Bulut arkadaşlarımız bize el sallıyor!"); yoksa sessiz geçer. Her hayvan girişinde `AU.sfx('sekilCanlan', hayvanNo)`.
- **PIRIL/FEZA:** `pirilBinekKoltuk(tm,0,olcek)` + `fezaCizPoz(...'binis'..., {el, vy, sevinc, aci})` kullanılıyor; ctx `o.rot` ile döndürüldüğü için `u` verilmiyor.
  `sevinc` dizi tamamlanınca / kemerden geçince / hayvan selamında 1,3 sn'lik nabız olarak veriliyor (diğer zaman `undefined` → otomatik). İniş merkezi = zemin − 13·2,2.
- **Tur 2 (iterasyon):** "Vay" anı: koridorun %57,5'inde "Bulutlarda ne var?"da canlanan hayvanlar (OLAY 'sekil'; yoksa balina/tavşan/kuş) gökyüzünde
  sağdan süzülüp ≈11 sn yanlarında uçar, selam verir (sekil.js'in `sklPoz/sklBulutCiz/sklYuzCiz` çizimiyle, aynı görünüm), sonra geride kalır.
  Kemerden geçince kısa "vınnn" hızlanması (+%40, ≈1 sn) + kemer jöle gibi esner + rüzgâr çizgileri parlar/uzar. Rüzgâr çizgileri 3 paralaks katmanı.
  Işık izi artık 7 renkli GÖKKUŞAĞI KURDELESİ (kuzucuklar onun üstünde uçuyor) + izde göz kırpan yıldızlar. Ölçüm (masaüstü Chrome): ucus.js çizimi ≈0,8-1 ms/kare
  (çoğu pirilCizPoz+fezaCizPoz). Tümleşik test: 6 kuzucuk kuyrukta → iniş → 7. kuzucuk → `gokkusagiBasla` → `gokkusagiTamam` → `final`, hata 0.

## MINI3 notları (sekil.js — "Bulutlarda ne var?")
- Tür `bulutSekil` (`nesne('bulutSekil', c, zeminY, {sira:0|1})`). Bulut merkezi `o.x + 27`, zeminden 198 birim yukarıda (`SKL_YUK`), yarıçap `SKL_R`=108. Önek `skl*` (`sk*` sarki.js'te dolu).
  Durum `o.skl.durum`: `bekle → ov (ovma) → canlan → ara → yeni → ov … → bitti`. Feza bulutun ±210 birimine yerde gelince başlar (`P.kilit` 1,3 sn, `p_b_sekil1` oturumda bir kez).
- Sıra (oturumda bir kez karışır): her yerde bir "gösterili" hayvan (balina: tepesinden gökkuşağı / fil: hortumdan yağmur → yerde kalıcı çiçekler) + tavşan/kuş/ayıcık'tan biri; `sira:1`'in sonunda sürpriz bulut-Feza.
- Girdi: pencere capture `pointerdown/move` yalnız bulutun ekran elipsinde yakalanır (dışı yürütür; zıplama düğmesi önce). Dokunuş +0,115 (≈9 dokunuş), ovma ≈ bulutu 4-5 kez boydan boya. Klavye: Space/↑/W ovar (Feza zıplamaz). Canlı hayvana dokunmak kıkır ışıltı.
  12 sn'de bitmezse Pırıl yardım eder (≈20 sn'de tamam). Feza 520 birim uzaklaşırsa o anki bulut kendiliğinden hayvana dönüşüp uçar, etkinlik biter (`terk`). Bir kez oynanır.
- Ses/olay: `AU.sfx('sekilOv', p)`, `('sekilCanlan', SKL_HAYVAN.indexOf(ad))` (`['tavsan','balina','fil','kus','ayicik','feza']`), `('sekilBitti')`; `OLAY 'sekil' {o, hayvan: ad, i}` (her canlanmada). Cümleler: `p_b_sekil1` (davet), `p_b_sekil2` (ilk bulut yarı şekillenince), `p_b_sekil3` ses.js `'sekil'` olayıyla, `p_b_sekil4` (sürpriz "Bak, bu sensin Feza!" — SES ekleyince çalar; yoksa sessiz).
- Pırıl: piril.js `DR_SEKIL` varsa `'sekil'` modu (`D.sklO`, `D.sklKut` artık kullanılmıyor: canlanınca Pırıl hayvanın önüne geçmesin diye `sklPirilYer` onu sol yanda hoplatır, sekil.js `drFx` ile kalp saçtırır; `sklPirilYer(o)` → `{x,y,bakX,bakY}`); yoksa takim.js'in `'takim'` modu vekil noktayla. Kamera: `omDikkat('sekil', 1, …, 0.8, 0.8)`. Etkinlikte `skAktif = o` (arayüz yürüme eli gizlenir).
- Çizim: bulut = 26 dairenin birleşimi, 5 katman (koyu kontur, alt gölge, güneş kenar ışığı, dikey gradyanlı gövde, tepe parlaklıkları) + arkada sıcak hale; morf her daire kendi gecikmesiyle (şekilsiz bulut hedef hayvanın sıkıştırılmış hâli → kesişmesiz). Kare başı ≈0,13 ms, önbellek gerekmez. El ipucu arayuz el stilinin kopyası (önbellekli sprite), ovma hareketi.
- Her canlanma bir "an": mutlu ^ ^ gözler + açık gülüş (`mutlu`), tavşan inişte pof, kuş nota söyler, ayıcık kalp, sürpriz Feza kalp/yıldız + bulut saç + pijama yıldızları, balina gökkuşağı, fil yağmur→çiçek; canlanırken ışık halkaları + titreşim. Canlı hayvana dokununca kıkırdar (kalpler).
- Test: `?sessiz&atla&bolum=3`, konsoldan `NESNELER.find(o=>o.tip==='bulutSekil').skl`, `sklEkran(o)` (CSS px merkez/yarıçap).


## SAHNE notları (src/sahne.js)
- API değişmedi: `SAHNE.secim(secenekler, onSec)`, `SAHNE.secimDokun(x,y)`, `SAHNE.giris(bitince, {bolum, kisa})`, `SAHNE.final(bitince, {bolum})`, `SAHNE.tamEkran()`.
- Seçim ekranı: `ikon:'bulut'` artık gün doğumu bulut ülkesi minyatürü (pembe bulutlar, gökkuşağı, iki kuzucuk). Baloncuklar Pırıl'dan doğar (ilk ~2,5 sn), nefes alır; iç dünyalar canlı (ateşböcekleri, yıldız ışıltısı/kayan yıldız, kayan bulutlar, zıplayan kuzucuklar). Dokununca jöle tepkisi + ışık halkası, seçilen balon ortaya gelip ekranı kaplar, ~1,6 sn sonra ekran rgb(4,5,14) iken `onSec(id)`. Olaylar/sesler aynı (`secim` {id,i}, `ruyayaGec`, `yildizRozet`).
- Bölüm 3 kısa giriş: `SAHNE.giris(bitti, {bolum:3, kisa:true})` → `SES.soyle('p_b_uyku')` (≈1,8. sn; anahtar yoksa sessiz geçer), pencerede şafak, perdeler pembe bulutlara, lamba güneşe, battaniye bulut tepeciğine, halı noktaları 7 gökkuşağı ışığına döner; oda bulut ülkesi fonuna erir; sonda koyu gül → lacivert perde, `bitince` ekran tam koyuyken (≈14 sn). CORE bağlarken Bölüm 2'deki gibi `begin()` içinde `BOLUM_NO === 3` dalını eklesin.
- Bölüm 3 sabah finali: anlatıcı `a_b_final1..3` (yoksa `a_final*`). Feza uyanır; anlatıcı "Pencereden bakmış ki..." derken (a_b_final2 başlangıcından ≈3 sn sonra) pencerede gökkuşağı soldan sağa çizilir, kamera pencereye döner, "göz kırpmış"ta yüzlere yaklaşır (dikeyde oda bu sahnede daha az kayar ki pencere görünsün), sonra göz kırpma yakın çekimi; duvarda gökkuşağı ışığı lekesi (bitiş kartının arkasında da görünür). Kutlamada odak kuzucukları da kapsar; ışık merkezi `BOLUM.gokkusagi` (varsa), yedi ışık huzmesi gökkuşağı renklerinde. Her sabahta odada rüyadan kalan toz: Bölüm 1 ışıklı yaprakçıklar, 2 yıldız tozu, 3 gökkuşağı ışıltıları.
- Bölüm 2 kısa girişi de kendi temasıyla erir: perdeler yıldız damlalı ışık tellerine (altın uçlar), halı noktaları suda açan ışıklı nilüferlere (sh.tema 'gol'); Bölüm 1 aynen.
- Performans: seçimde iç resimler önbellekte (balon başına ≈ d² piksel), dalış için keskin iç resim (≤1400 px) balonlar oturunca boşta hazırlanır; giriş/final başında hepsi bırakılır. Seçim karesi ≈ eski sürümle aynı maliyet.
- (CORE, Tur 2 — tümleşik bot testi, 23:10) `?sessiz&atla&bolum=3` botla uçtan uca oynandı: 7/7 kuzucuk, kapı, uçuş, gökkuşağı, `gokkusagiTamam` → final → sonuç kartı; konsol hatası 0, 0 düşüş.
  **LEVEL3'e (bolum3.js / bulut.js):** gökkuşağından kayış dünyanın sonunda bitiyor (sütun ≈446, COLS 458): kamera `maxX`'e dayandığı ve 'gokkusagi' dikkat kutusu
  `cx + R*0,86`'da bittiği için finalde Feza ekranın SAĞ KENARINDA (%92) ve çok küçük (yakınlık 0,53) kalıyor. Öneri: COLS'u ≈15-20 sütun uzat (tepeden sonra düz bulut)
  ve/veya kutuya iniş noktasını da kat (`o.cx + o.R + 80`); zMin 0,48 yerine ≈0,6. Tepe zemininin köşeleri kare görünüyor (ızgara 1 düz blok; WORLD3'ün yumuşatması tepeye değmiyor olabilir).
  **SAHNE'ye:** Bölüm 3 kısa uyku girişinde ≈10. sn'de oda→bulut erimesi çok hızlı aydınlanıyor (ekran parlaklığı 150 ms'de 85→126); biraz daha yavaş olursa flaş hissi kalmaz.
  CORE düzeltti: kısa giriş biter bitmez açılış ışığı karanlıkta tek karede parlıyordu (parlaklık 13→29); artık ≈0,8 sn'de yumuşakça beliriyor (Bölüm 2 de).

## WORLD3 notları (dunya3.js)
- **Sağlanan:** `dn3Background dn3World dn3Foreground dn3Motes(tm,zMin,zMax) dn3Petals dn3Vignette` (dn2 imzaları) + `dn3Isit()` (12 adımda gökyüzü, katmanlar, adalar,
  güneş/hüzme, ön plan, gökkuşağı, ilk zemin parçaları, şerit ve süs sprite'ları; bitince hep `true`). Yükleme anında yalnız tanım + `OLAY` dinleyicileri (Bölüm 1/2'de zararsız).
- **Gökyüzü:** iki önbellekli tuval (şafak / sabah) `BOLUM.gokkusagi.x`'e göre ilerleme oranıyla karışır; güneş ufuktan yavaşça yükselir; iki dönen hüzme sprite'ı "nefes alır".
  Katmanlar: uzak kümülüs kuleleri → yüzen adalar (ağaçlı, şelaleli; yavaşça salınır) → 4 bulut denizi sırası (uzak lila → yakın pembe-şeftali, sağ-üst altın kenar ışığı),
  aralarında sis bantları, kuş sürüleri, bulutlar kendiliğinden yavaşça kayar. Kamera yükseldikçe ufuk aşağı iner (uçuşta geniş gökyüzü).
- **Gökkuşağı (gökte):** `SAYAC.kuzu/kuzuTop` → 7 bant (kırmızı dışta → mor içte, `DN3_RB`). `OLAY 'kuzu' {renkI}` gelince o bant soldan sağa 2,2 sn'de çizilerek
  belirir (ucunda ışık); kayıp gökkuşağının soluk izi baştan görünür. `gokkusagiBasla` → yay parlar, renkli ışıltı yağmuru (`dn3Petals`), tepeye ışık sütunu.
- **Zemin:** ızgara 1 = bağlı bulut kütleleri (bileşen bileşen): yüzeyi izleyen derinlik rengi (krem → pembe → lila), üstte altın kenarlı pamuk loblar, uçlarda ve
  basamak yüzlerinde dışa taşan kabarcıklar, ~60 birimden sonra alta doğru şeffaflaşır (alfa maskesi). Yüzen bloğun altı kabarık. Izgara 2 = ince bulut şeridi.
  Süsler bölgeye göre (`pembeBulut kuzuCayir ruzgar sekil bosluk ucus tepe`; bilinmeyen ad varsayılan): bulut papatyası, karahindiba, bulut otu, ışık yıldızı, tepede gökkuşağı kristali.
  `ruzgar` bölgesinde süsler rüzgârla eğilir, hava çizgileri akar; uçuşta (`P.ucus`) hız çizgileri + yanından geçen sis bulutları.
- **LEVEL3 için API:** `dn3Bulut(x, yUst, w, h, {alpha, sx, sy, seed, ctx})` — dünya dönüşümünde, zeminle AYNI görünümde bulut gövdesi (x orta, yUst yürüme yüzeyi;
  sy ile basılınca esneme). Önbellekli sprite (anahtar w/4, h). İstenirse `bulutZip/bulutYuzen/bulutKopru` bununla çizilebilir.
- **İstek (LEVEL3, bulut.js `gokkusagi`):** final anında tepe çevresi çok beyaza doyuyor (karakterler okunmuyor); gökkuşağı türünün 'lighter' ışımaları ~%50 azaltılabilir.
  dunya3'ün kendi tepe ışığı zaten kısık.
- Performans: karede yeni gradyan yok (yalnız önbellek doldururken), `filter/shadowBlur` yok; zemin 512 birimlik parçalar (karede en çok bir yeni parça), katmanlar ¼–⅓ çözünürlükte (doğal yumuşaklık).
  Masaüstü Chrome'da dn3 işlevlerinin toplamı ≈0,4 ms/kare (CPU).
- (CORE, 23:25) PIRIL isteği yapıldı: Bölüm 3'te `omPirilHale` küçük (70 birim) ve sıcak pembe-şeftali, çok hafif (0,08); beyaz pus yok. Bölüm 1-2 aynen.
  Bölüm 3 sayacının arkasına hafif koyu yumuşak yastık + kuzucuk simgelerine dış kontur (aydınlık gökte okunurluk).
- **Test (LEVEL3, Tur 2, 524 sütun)**: iyi bot 0 düşme, ≈125 sn oyun saatinde final (eski 458 sütunda 113 sn); özensiz bot (sabırsız, rastgele zıplama) 0–2 düşme (yalnız yüzen bulut boşluğu), final; ikisi de 7/7 kuzucuk. ucus.js+kuzu.js engelliyken yedek köprüyle final (Tur 1). Bölüm 1/2 konsol hatası 0.
- **Test (LEVEL3, Tur 4)**: iyi bot ve özensiz bot 0 düşme, 7/7 kuzucuk, final; kuş yokken çukura yürüyen/atlayan Feza ≈5 sn'de karşı kıyıda (0 düşme). Final kadrajı yatay 1194×834 / dikey 834×1194'te doğrulandı (Tur 3).
- **Tur 5 (QA turu 1 düzeltmeleri, LEVEL3):**
  - **Gökkuşağı ↔ zemin anlaşması:** `gokkusagi` artık zemine göre KIRPILMAZ (eskiden ızgara karolarıyla kırpılıyordu → keskin dikdörtgen basamaklar). Yay, `ciz` katmanında (zeminden SONRA, Feza'dan ÖNCE)
    tam çizilir; iki ucu yatay alfa geçişiyle söner (sol: yayın tepe düzlüğünden çıktığı nokta `o.ayak[0]` ≈ x 19480; sağ: iniş noktası `o.ayak[1]` ≈ x 20284, y 680) ve uçlarda yumuşak ışık bulutu var.
    Yay bantları tepe düzlüğünün (y=520) üstüne biner: yani gökkuşağı tepenin ÖNÜNDE duran bir kaydıraktır. WORLD3: tepe bölgesinde (sütun 474–507) zemin ön yüzünü/üst kenarını
    yayın ÜSTÜNE çizen bir ön plan katmanı olmasın (yoksa yay yine kesilir); zeminin kendi yumuşak bulut kenarı yayın altında kalabilir.
  - **Kolaylık:** Bölüm 3'te uçuş boşluğu dışında DÜŞÜLECEK YER KALMADI: küçük boşluklar (45–46, 119–120) 2 kare derin sığ çukur (zıplayıp çıkılır);
    yüzen bulut boşlukları yumuşak çukur (153–159 dibi y=840, 221–226 dibi y=760) + sağ uçta çıkış zıplatanı (158.5, 225.5); kuş geçidi çukuru (176–189, çıkış 188).
    Rüzgâr Yolu esintileri genişledi (w 150, duvara dayalı).
  - Büyük Boşluk'un iniş tarafında (sütun 454) 6 kare bulut sütunu: uçuştan sonra geri yürüyen Feza boşluğa düşmez. QA dağınık botu (yatay+dikey, 3 koşu): toplam 1 düşüş → düzeltmeden sonra 0, takılma 0; benim iki botum 0 düşüş.
  - **`b_giris` tetikleyicisi kaldırıldı** (p_b_giris'i CORE açılışta söylüyor; çift olmasın). Tohum: 14.
- **WORLD3 tur 2:** Bulut denizi artık kümülüs öbekleriyle çiziliyor (kubbe + üst katlar, öbek başına tek hacim ışığı + gölge; yuvarlak taban lobları, köşe yok);
  ince bulut şeridi tek siluet. Basamak yüzleri düzensiz kabarcıklarla örtülü; basamak yüzünde ışık şeridi ve süs yok; derin renk ve şeffaflaşma çok yumuşak yüzeyi (±48 birim) izler.
  Bölge karakteri: Pembe Bulutlar pembe ton · Kuzucuk Çayırı yoğun papatya + gökte küçük kuzucuk biçimli bulutlar · Rüzgâr Yolu bulutlar daha hızlı kayar
  (birikimli kayma, sıçrama yok), süsler eğilir, hava çizgileri + kıvrılan rüzgâr sarmalları · Bulut Şekilleri gökte tavşan/balina/ayıcık biçimli hayal bulutları ·
  Büyük Boşluk/uçuş: ufuk aşağı, uzak kuleler belirgin, hız çizgileri, yandan geçen sis · Tepe altın ışık, gökkuşağı kristalleri.
  GPU: katman arası 4 tam genişlik sis bandı katmanlara pişirildi; katman altı dolgusu yalnız en yakın katmanda; sakin bölgelerde tek hüzme katmanı.

## POF notları (kuzu.js + pofuduk.js)
- **`kuzu` türü** (kuzu.js, önek `kz`): `nesne('kuzu', c, y)` (y: zemin; yakın zemine kendisi oturur), `o.r`=70, `o.ry`=24. Durumlar `o.kz.durum`:
  `uzgun` (gri, solgun-mahzun: yavaş nefes, ara ara iç çekme + gri bulutçuk, gökyüzüne bakma, minik titreme; Feza ≈330 birim yakındayken umutla ona döner,
  hafif ışıltı + başının üstünde süzülen minik pırıltı) → `dokun` → `sarilma` (Feza'nın yanına sokulur, ≈0,32 sn'de ışıltılı "pof" + `AU.sfx('kuzuRenk', renkI)`,
  renk dalgası temas noktasından yüne yayılır ≈0,95 sn) → `sevinc` (3 zıplama, ortadaki havada takla, "mee") → `takip` → (`P.ucus`) `ucus` → (`gokkusagiBasla`) `yay`.
  `OLAY 'kuzu' {o, renkI}` ve `o.done=true` DOKUNUR DOKUNMAZ (Feza'nın sarılması bununla eşzamanlı). `renkI` = bulunma sırası (0 kırmızı … 6 mor).
  Renkler: `DN3_RB` (yoksa `BU_GK`) ana renk alınır, açık/koyu tonlar ondan türetilir (gökteki yayla aynı).
- **Sürü:** Feza'nın yürüdüğü zemin izinde (boşluklar atlanır), bulunma sırasıyla (kırmızı en yakında), aralık 56, Feza'ya ≥54. Yürüyerek hoplar; yükseklik farkı,
  boşluk, yolda Feza ya da duran bir arkadaş varsa yumuşak yayla süzülerek (üstünden) geçer; uzak kalan hızlanır (ışınlanma yok). Öndekine binmez (sıraya girer).
  Yer bulunamazsa Feza'nın yakınında havada küçük bulut gibi bekler (asla takılmaz). `kurtarildi` / uçuş sonu → iz sıfırlanır, Feza'nın çevresine süzülürler.
  Feza dururken: bulut otlar (baş eğik, çiğneme, kırıntı), kulak çırpar, zıplar, Pırıl'a bakar, kameraya döner, komşusuna tos vurur; `AU.sfx('kuzuMee')` en sık ≈5 sn'de bir, ekrandayken.
  Yeni bir kuzu renklenince sürüdekiler sırayla sevinçle hoplar.
- **Uçuş:** `P.ucus.kuyruk = {x, y, yon}` varsa onun arkasına 30 aralıkla (lead isteği), yoksa Feza'nın uçuş izinde; uçuşta %72 boy, sık kuyruk (ayırma yok).
- **Gökkuşağı:** `OLAY 'gokkusagiBasla'` verisinde `konumlar` ({x,y}×7, renkI sırasıyla) varsa oraya; yoksa `{x,y,r,w}` ya da `BOLUM.gokkusagi` üstünde varsayılan yay.
  Kırmızıdan mora 0,24 sn arayla kalkar, yerine varınca `OLAY 'kuzuYayda' {o, renkI, x, y}` + pırıltı; sonra rengiyle parlar, "gökkuşağı dalgası" dansı (her ikinci dalgada takla).
  Geç renklenen (LEVEL3 `buKuzuTopla`) kuzu sevinçten sonra doğrudan yerine uçar.
- Test kancası: `window.kzTest` (`suru, iz, slot, saril(o), yay(d)`). Çizim: yün/baş/kuyruk sprite'ları önbellekli; kare başına birkaç drawImage + küçük vektör. Konsol hatası 0.
- **Pofuduk (Bölüm 1 final fenerleri):** fener sütunları dans sırasıyla soldan sağa paylaştırılır (yollar kesişmez), komşu fenerler farklı yükseklikte; kalkış sırası
  0,1,4,5,… sonra 2,3,6,7,…; yolu kapalıysa (yakında havada biri / aynı sütuna giden biri) en çok 1,2 sn bekler; havadakiler arası yumuşak 2B açılma (52).
  Ölçüm (9 Pofuduk, 1024×768 / 1180×820 / 1366×1024): havadaki iki Pofuduk arası en az 4 → 43–45 birim (gövde ≈40), bütün fenerler ≈6,3 sn'de asılı.
- (CORE, 23:50) Akış/his cilası: (1) sonuç kartında "odaya dön" → ≈0,45 sn kararma, sonra yenileme (sabah odasından karanlık seçime sert kesme yok; ölçüm: parlaklık 195→13 yumuşak, seçim 0'dan açılıyor).
  (2) Düşerken kamera aşağıya ileri bakar (Feza ekranın dibine yapışmaz; 3 bölümde de). (3) Sonuç kartında tohum 14'ten fazlaysa yalnız toplananlar gösterilir
  (Bölüm 3'te 28 tohum var — LEVEL3: bilerek mi? kart yine düzgün). (4) Bölüm 3 dikey iPad (768×1024) uçuş ve kart kontrol edildi.

## WORLD12 notları (dunya.js + dunya2.js; Bölüm 1-2 dünya cilası)
- Yalnız kendi dosyalarım; dışa açık API değişmedi (draw*/dn2* imzaları, dn2Isit aynı). Önce/sonra ölçüm: aynı makinede, sabit konumlarda dünya çizimi kare başına ms (ortanca) eşit/biraz daha iyi.
- Bölüm 2: toprak kesiti yeniden (renk lekeleri, çizgisiz katmanlar, ışık cepleri, gömülü yıldız taşları, kenar ışığı yalnız üst yüzeyde), göl kıyıları dik parlak duvar yerine suya gömülen eğim;
  üç gölün her biri ayrı karakter (I mavi su çimeni, II pembe nilüfer bahçesi + yüzen taç yaprakları, III altın yosun + ışık kabarcıkları), su altı bitkileri, ay ışığı hüzmeleri,
  ön planda 5 tür sarkık süs (yıldız çıngırağı, söğüt saçağı), kuzey ışığı alt kenarı merdivensiz (ve yarı maliyet).
- Bölüm 1: gölcük söğütleri çiçekli (pembe salkım + suya süzülen taç yaprakları), açıklıktaki ağaç tepesinin kesitinde ağacın ışıyan kökleri, derin ışık kovukları, yüksek uçurum yüzlerinde raf mantarları.
- Bölüm 2 ufkunda bölgeye özgü uzak simgeler (yavaş paralaks + suda yansıma): başta uzaktaki Işık Ağacı, Pofuduk kıyılarında dev ışıklı mantarlar, çayırda ışık çiçeği tarlası, kaplumbağa kıyısında yıldız oymalı taş kemer.
- "Kareli kâğıt" ızgarası giderildi (Chrome'da düşük çözünürlüklü gök tuvallerindeki gradyan titreşimi büyütülünce 3-4 px'lik ızgara oluyordu): gök tuvalleri GPU'da bir kez yumuşatılıyor (okuma yok); B1 kâğıt dokusu düşük frekanslı.
- (Lead isteği) `dn2Isit()` adımları: gök adımı ≈5 ms (önceki 52 ms'lik getImageData kaldırıldı); son "dokunma" adımı tuval tuval, adım başına ≈4 ms bütçe. Headless'ta tek bir büyük tuvalin ilk yüklemesi hâlâ uzun sürebilir (bölünemez, eskiden de vardı).
- Tur 2: açılış büyüsü (B1 ilk ~70 sütun: kubbeden süzülen ışık huzmeleri, huzmelerde dönen toz, yere düşen ışık havuzu, yerden yükselen ışık tohumları; B2 ilk ~70 sütun: göle düşen kayan yıldızlar daha sık + çimenden yükselen yıldız tozu),
  renklenme ödülü (B1 çiçek açınca / B2 yıldız uyanınca ≈3 sn: yerde iki yana koşan ışık, genişleyen halka, yükselen kıvılcımlar; B2'de uyanan yıldızın ≈500 birim çevresindeki bitkiler kalıcı olarak daha parlak),
  ikinci taş kemer kaldırıldı (kaplumbağanın arkasında kalabalık yapıyordu). Açılış bölgesi kare maliyeti ≈+0,1 ms ama bölümün en ucuz yeri; en pahalı kareler değişmedi.

- **WORLD3 tur 3:** Gökkuşağı Tepesi bulutları sıcak altın-pembe paletle (`DN3_GCW`) boyanıyor; tepe ışığı ve bölge tonu normal karışımla mercan-altın (beyaz 'lighter' yıkama yok),
  sabah gökyüzünün ufku daha doygun şeftali. Mağara (133–144): bileşen zinciri en çok örtüşen koşuyu izler (zemin sürer, tavan ayrı yüzen bulut: altı lila kabarık);
  bir bulutun uç dışındaki şeffaflık maskesi yalnız kendi derinliğine kadar (alttaki zemini silmez; mağara altındaki açık paneller giderildi). Yan kabarcık sütunları 150 birimde biter.
  Kontrol edildi: Gökyüzü Merdiveni, mağara, Bulut Kuşu boşluğu, Tüy Köprüsü, tepe.

## LEVEL12 notları (bolum.js, bolum2.js, yildiz.js, takim.js, sarki.js — Bölüm 1-2 oynanış cilası)
- Ölçüm: Playwright botları (düzgün + "dağınık çocuk": tereddüt, geri yürüme, geç/unutulan zıplama, dalgınlık), yatay 1024×768 ve dikey 768×1024.
  Son durum (≈20 koşu): Bölüm 1 ve 2 baştan sona, 0 sıkışma; düzeltmelerden sonra düşme 0, konsol hatası 0. Oyun süresi bot için ≈2-3,5 dk (çocukta ≈5-7 dk).
- **Bölüm 2 hızlı testte x≈260'ta kalma:** hata değil — `omDevamGirisi` açılışta `P.kilit = 4.2` (kamera sudan kıyıya iner, ışık toplanır). Testte ≥4,5 sn bekleyin.
  CORE'a öneri (isteğe bağlı): çocuk açılışta ekrana basıyorsa kilit ~2,5 sn'de bitebilir.
- **Düzeltildi (yildiz.js):** üstten geçilen taş/adalar Feza'yı yalnız yukarıdan düşerken yakalıyordu: kıyıdan (720) 716'daki ilk taşa ZIPLAMADAN yürüyen çocuk
  taşın altından geçip suya düşüyordu (her göl girişinde, ada geçişlerinde). `ylBasamak`: yerde yürürken ön ayak taşa değince ≤17 birimlik basamağa görünmez küçük adım (yavaş yürüyüşte de). Ada çarpışma genişliği w-14 → w-2
  (taş-ada boşluğu 15 → 9). Artık üç göl de SAĞA zıplamadan yürünerek geçilebiliyor (geri dönüşte yalnız göl I'in 24'lük iniş zinciri zıplama ister).
  CORE'a not: aynı "küçük basamak" fiziği `oyun.js moveY`'de genel olsaydı (ustten cisimler için ≤16 birim) bu yamaya gerek kalmazdı.
- **Düzeltildi (yildiz.js):** dağınık çocuk göl II'deki ada yıldızını atlayınca üç büyük yıldızdan sonra `HEDEF()` atlanan yıldıza dönüyordu: Pırıl çocuğu ~200 kare geri götürüyordu.
  Üç büyük yıldız yanınca uyanmamış yıldızlar `secmeli=true` olur → hedef doğrudan kaplumbağa (fırlatışta kalanlar zaten göğe çıkar).
- **Düzeltildi (takim.js):** takımyıldızı etkinliği sürerken ekranın üst yarısına her dokunuş yutuluyordu (yürümek için yukarı basan çocuk kıpırdayamıyordu; bot 5 dk takıldı).
  Artık yalnız noktaların (~1,7R) ve şekil çizgilerinin (~0,8R) yakınındaki ıskalar yutulur, Feza aynadan 330'dan uzaksa hiç.
- **Geç yardım eli:** takim (≈4 sn boşta) ve sarki (≈5,5 sn boşta ya da aynı turda 2 yanlış) `ARAYUZ.elGoster` ile SIRADAKİ noktaya/çiçeğe dokunan el gösterir (dokuna dokuna bağlamak da olur).
- Test notu: `python -m http.server` yük altında "ERR_CONNECTION_REFUSED" verip dosya yüklemeyebiliyor (yüklenmeyen yildiz.js → ilk yıldız uyanmaz, sahte "sıkışma").
  Bot testlerinde `request_queue_size` büyük ThreadingHTTPServer + 127.0.0.1 kullanın.
- SAHNE tur 2: Bölüm 3 kutlamasında beyaz ışık birikimi azaltıldı, 14 doygun gökkuşağı huzmesi normal karışımla çepeçevre döner. Bölüm 1 tam girişte gözler ağırlaşırken Feza'nın yüzüne yavaş yakın çekim (sonra Pırıl'a geçer). Bölüm 1 sabahında pencerede uzak tepede parlayan küçük Işık Ağacı. Seçim ekranında ≈12 sn'de bir Feza iç çekip Pırıl'a sokulur.
- (CORE, 00:20) **Uyku girişi takılmaları (lead/SAHNE bulgusu) ölçüldü:**
  · ≈9,7 sn'deki ≈50 ms kare: JS değil. CPU profili o karede ana iş parçacığını en çok ≈5 ms meşgul gösteriyor; Chrome izinde aynı anda 32-52 ms'lik GPU rasterleme
    (`RasterDecoderImpl::DoEndRasterCHROMIUM`) var → oda→bulut erimesinin ağır üst üste çizimi (büyük saydam/gradyan katmanlar, 'lighter'). `dn2Isit`/`dn3Isit` değil (ısıtma ≈0,5-0,9 sn'de bitiyor).
    Başsız Chrome yazılım GPU'su (SwiftShader) bunu abartır; iPad'de daha hafif olabilir. **SAHNE'ye öneri:** erime katmanlarını küçük ara tuvale çizip ölçekle, tam ekran 'lighter'/radyal gradyan sayısını azalt, kare başına yeni gradyan yaratma.
  · Asıl büyük takılmalar sayfa açılışındaydı (Bölüm 2: 0,08 sn'de 281 ms, 0,35 sn'de 111 ms; Bölüm 3: 114 ms). CORE: uyku girişi perdesi artık sabit 0,4 sn'de değil,
    kareler akıcılaşınca açılıyor (en az 0,4 sn, art arda 4 akıcı kare, en geç 2,2 sn) → bu takılmalar tam karanlıkta kalıyor (ölçüldü). `?bolum=N&uyku` test yolu da karanlıktan başlıyor.
  · **WORLD'e (dunya2.js):** `dn2Isit` bir adımı ≈29 ms (Bölüm 2, ≈0,9 sn); Bölüm 2'de 1,34 sn'de perde açılırken 88 ms'lik bir kare daha var. Adımları ≤8 ms'ye bölmek iyi olur.
- (CORE) Zıplama: en kısa dokunuşta da zıplama ≈2,6 kare (`OM.MIN_BASILI` 0,11 → 0,16; 102 birim, tam basış 120). Botla üç bölüm sona kadar oynandı (Bölüm 3: 7/7 kuzu, 2 düşüş — bot).
- (CORE, 00:50) Zıplama düğmesi kontrol 0,5 sn'den uzun kilitliyken (`P.kilit`: gökkuşağından kayış, ağaç, mini oyun daveti, Pırıl'ın yardım taşıması) yumuşakça gizlenir; kısa kilitlerde (≤0,5 sn) titremez.
  Son gerileme: Bölüm 1 (15 çiçek), 2 (14 yıldız), 3 (7 kuzu) botla sona ulaşıyor, konsol hatası 0. Bölüm 3 bot düşüşleri yalnız sütun 186'da (uykucu bulut kuşu geçidi —
  zıplayan bot kuşu beklemiyor; LEVEL3: çocuk da koşarak boşluğa atlayabilir, Pırıl kurtarıyor, istenirse kuşun sırtına ipucu). Bölüm 2 kısa girişinde ≈1,35 sn'de (perde %30 iken, ekran zaten çok koyu) 90-100 ms'lik bir kare kalıyor — JS değil, sahne/dünya ilk çizimi (SAHNE/WORLD).
- (POF, Tur 2) **Tam bot** (LEVEL3 `bot.js`, iyi ×1 + özensiz ×3, COLS 524): 7/7 kuzucuk, final; takılan kuzucuk 0 (2,5 sn kımıldamadan yerinden >40 uzak), yerdeki iki kuzucuk arası en az 41–44, konsol hatası 0.
  Feza bulut kuşunda / hareket eden bulutta (`ustundeki` bulutKus ya da dx/dy'li cisim) giderken sürü arkasından havada küçük bulutlar gibi süzülerek eşlik eder (Feza'ya ≈180 içinde), inince zemine süzülür.
  Aynı anda renklenenler: sarılma yeri dokunma anında sabitlenir, doluysa 48 ötesi; sarılan/sevinen kuzucuklar yürüyenler için engel (üstünden süzülür, sırada bekler). Yay iniş yeri doluysa üstünde biraz bekler.
  Yay yeniden kurma en sık 0,4 sn'de bir (sürekli kurulup havada donma hatası giderildi). Geç renklenen kuzucuk (gökkuşağı başladıktan sonra) doğrudan yerine uçar: doğrulandı.
- (POF, Tur 2) Pofuduk geçit töreni: arkadaki öndekine binmez (sıraya girer; 0,7 sn sıkışırsa üstünden süzülür). Yürürken en yakın 25 → 32–35.

## QA turu 1 (23:50, MINI3)
Yöntem: Playwright, gerçek Chrome headless, `?sessiz`. İki bot vardı:
- "düzgün" bot: HEDEF()'e doğru yürür; boşluk, duvar ya da yukarıda hedef varsa zıplar; düşerken çift zıplar.
- "dağınık" bot (5 yaş gibi): rastgele yön seçer, durur, zıplar ve ekrana rastgele dokunur.

Ekranlar: yatay 1194×834 ve dikey 834×1194. Her ~20 sn'de ekran görüntüsü alındı; `SES.soyle`/`OLAY` kaydı ve `OYUN.kareMs` ölçüldü.
- Ekran görüntüleri: `QA/<koşu>/`. Burada QA = `C:\Users\gktgk\AppData\Local\Temp\claude\C--Users-gktgk-Dropbox-Game-Development\d0282e08-f18e-4d64-9193-13a89766a60d\scratchpad\mini3\qa`.
- Betikler: `QA/bot.py` (botlar), `QA/giris.py` (seçim ekranı + kısa girişler), `QA/srv.py` (sağlam test sunucusu, port 8737).

Sonuç: Bölüm 1, 2 ve 3 hem yatay hem dikeyde baştan sona bitti.
- Düzgün bot süreleri (oyun zamanı): B1 ≈94 sn, B2 ≈96 sn, B3 ≈105-122 sn.
- Dağınık bot B3'ü dikeyde 264 sn'de bitirip finale ulaştı.
- Konsol hatası, sağlam sunucuyla 0.
- Seçim ekranı (`?sessiz`) ve `&bolum=2|3&uyku` kısa girişleri hatasız.

Bulgular (önem sırasıyla):

1. **[LEVEL3/WORLD3] Gökkuşağı Tepesi'ndeki kayma rampası zemin karolarıyla kesiliyor.** Keskin köşeli, dikdörtgen beyaz basamaklar gökkuşağının üstüne biniyor; yumuşak bulut zeminine hiç benzemiyor. Final anının en görünür yeri.
   - Görüntü: `QA/b3_duz_dikey/006_oyun_122s_x20490.png`, `QA/b3_duz_yatay/005_oyun_102s_x17844.png`.
   - Tekrar: `?sessiz&atla&bolum=3`, tepeye gelince.

2. **[SES] Pırıl cümleleri bir olayla yarıda kesiliyor.** Her koşuda aynı:
   - `p_b_kuzu` (5,1 sn), ~2,5-3 sn sonra `p_b_kuzu_ilk` ile kesiliyor (B3 koşularının 3'ünde de).
   - `p_y_hayvan_uyan` (4,1 sn), 1,4 sn'de `p_y_bitti` ile kesiliyor.
   - `p_buyuk` (7,8 sn), son 0,6 sn'de `p_buyuk_kalk` ile kesiliyor.
   - `p_uyuyor` (9,1 sn), dağınık botta 1,8 sn'de `p_uyandi` ile kesiliyor.
   - Öneri: `p_b_kuzu_ilk` ilk kuzucukta `p_b_kuzu` bitene kadar kuyrukta beklesin (ya da `p_b_kuzu` kısaltılsın). Final dizisindeki cümleler birbirini beklesin.
   - Kayıt: `QA/b3_duz_*/log.json` içindeki 'konusma' olayları.

3. **[LEVEL3] Rüzgâr Yolu dağınık çocuk için zor.** Bölge: x≈6700-8300 (bulut adasındaki kuzucuk `kuzu@8300,560`, esinti, sütun 171-176 arası yüzen bulut boşluğu).
   - Dağınık bot burada ≈140 sn kaldı ve 7 kez düştü; `p_kurtar` her seferinde aynı 3,5 sn'lik cümleyle 7 kez çaldı.
   - Görüntü: `QA/b3_daginik_yatay/006…012*.png`.
   - Öneri: boşluklar daraltılsın ya da esinti genişletilsin. [SES] `p_kurtar` daha seyrek ve çeşitli olsun.

4. **[CORE] Bir modül yüklenemezse oyun kilitleniyor.**
   - Ne oldu: yük altındaki test sunucusu birkaç script'i veremedi (`ERR_CONNECTION_REFUSED`), böylece `kuzu` ve `ucusKapisi` türleri hiç tanımlanmadı. `HEDEF()` türü olmayan nesneyi (renklenmeyen kuzucuk, açılmayan kapı) göstermeye devam etti ve oyun sonsuza dek bekledi.
   - Görüntü: `QA/b3_duz_dikey_takil1/TAKIL_*.png` (Feza kapıda, Pırıl oturuyor, 500 sn).
   - iPad'de service worker önbelleğiyle olası değil, ama ilk açılışta zayıf ağda olabilir.
   - Öneri: `HEDEF` ve sayaçlar, `TUR.al(o.tip)` olmayan nesneyi yok saysın. Kapı türü yoksa doğrudan bir sonraki hedefe geçilsin.
   - Diğer ajanlara not: `python -m http.server` aynı anda birkaç tarayıcı açılınca bağlantıyı reddediyor. `ThreadingHTTPServer` + `request_queue_size=256` kullanın (`QA/srv.py`). Gece görülen geçici "Unexpected end of input" / "Invalid or unexpected token" hataları büyük olasılıkla bu sunucudan ya da yarım yazılmış dosyalardan; oyun hatası değil.

5. **[LEVEL3/SES] Bölüm 3 açılışında `p_b_giris`, ekran daha karanlıkken başlıyor.**
   - Kısa girişte durum 'oyun' olur olmaz (açılıştaki ışık toplanırken) çalıyor. Bölüm 2'de `p_y_giris` 2,4 sn sonra, ekran açılınca çalıyor.
   - Sebep: başlangıçtaki `b_giris` konuşma tetikleyicisi.
   - Ayrıca `?atla` ile `p_b_giris` hiç söylenmiyor: `soyle` çağrılıyor ama 'konusma' olayı gelmiyor.
   - Kayıt: `QA/s_uyku3_yatay/log.json`.

6. **[FEZA/WORLD3] Bölüm 3'te Feza zor seçiliyor.** Açık renk pijaması pembe-beyaz bulut zeminde kayboluyor; dikey ekranda Feza ≈45 px.
   - Görüntü: `QA/b3_duz_dikey/003_oyun_61s_x12078.png`, `QA/b3_duz_yatay/001_oyun_22s_x4627.png`.
   - Öneri: Bölüm 3'te Feza'ya hafif koyu kontur/gölge eklensin ya da çevresindeki zemin hafifçe koyulaşsın (Bölüm 2'deki gibi).

7. **[CORE/LEVEL3] Bölüm 3'te üstteki tohum çubuğu çok uzun.** `tohumTop` gece içinde 13'ten 28'e çıktı; çubuk ekranın üstünün büyük kısmını kaplıyor.
   - Görüntü: `QA/b3_daginik_yatay/006_oyun_122s_x7250.png`.

8. **[UCUS/CORE] Dikey ekranda uçuşta ve inişte Pırıl+Feza ile kuzucuk treni sol kenara çok yakın** (kuyruk ve kuzucuklar kesiliyor).
   - Görüntü: `QA/b3_duz_dikey/005_oyun_101s_x18223.png`.

9. **[SAHNE] Seçim ekranı yatayda orta baloncuk alt başlığa biniyor** ("başka"nın ş çengeli örtülüyor).
   - Görüntü: `QA/s_secim_yatay/002_04.7s_baslik.png`.

10. [Bilgi] Performans (headless masaüstünde ölçüldü, iPad'i temsil etmez): `OYUN.kareMs` ortalama 1,2-1,8 ms, p99 2-5 ms. Yalnız yükleme anında tek bir kare 16-85 ms sürüyor. Bölüm içinde ani yavaşlama görülmedi.

11. [MINI3, düzeltildi] Feza bulut mini oyununu bırakıp gidince de `OLAY 'sekil'` yayınlanıyordu; ses.js de "Buldun! Bulut canlandı" diyordu. Artık bu durumda olay yayınlanmıyor.
    - Ayrıca: Bölüm 3'te 2. bulut yeri (x 12580) uçuş kapısına (x 13060) yalnız 480 birim uzakta; sekil.js'in uzaklaşma eşiği 520. Yani bulut etkinliği kapının yanına kadar sürüyor. Sorun görülmedi.

### WORLD3 ↔ LEVEL3 anlaşması: gökkuşağı rampası ile bulut zemin (QA turu 1, madde 1)
- Sorun: `gokkusagi` yayı ızgara hücresi basamaklarıyla (`topOf` dikdörtgenleri) kırpılınca ya da kırpılmayınca zeminle sert dikdörtgen kesişimler oluşuyordu.
- **dunya3.js sağlar** (dünya koordinatı, önbellekli, kare başına ucuz):
  - `dn3ZeminKirp(x0, x1)` → Path2D: bulutun GÖRÜNEN yüzeyinin (yumuşatılmış, +14 birim) üstündeki bölge; boşluklarda aşağı iner.
  - `dn3ZeminOn(x0, x1)` → zeminin üst kabarcık bandını (yüzeyin 34 üstü – 30 altı, basamak yüzleri dahil) önbellekli zemin parçalarından ÖNE yeniden çizer (dünya dönüşümü kurulu olmalı).
- **Güncel (LEVEL3 Tur 5):** LEVEL3 yayı kırpmasız, zeminden sonra çiziyor; bu iki API İSTEĞE BAĞLI kaldı (kullanılmıyor). WORLD3 tarafı: tepede (yayın ±R + ekran payı) ön plan bulut tutamları çizilmez, zemin ön plan katmanı yok.
- **(eski öneri) LEVEL3 (bulut.js `gokkusagi`) kullanabilir** (`typeof` korumalı; yoksa eski davranış):
  ```js
  // ciz(o, tm) içinde, yayı çizmeden önce (o.kirp yerine):
  const X0 = o.cx - o.R - 60, X1 = o.cx + o.R + 60;
  g.save(); if (typeof dn3ZeminKirp === 'function') { const k = dn3ZeminKirp(X0, X1); if (k) g.clip(k); } else g.clip(o.kirp);
  ... yay ... g.restore();
  // AYNI ciz'in sonunda (restore'dan sonra; Feza'dan ÖNCE çizilir, Feza'yı örtmez):
  if (typeof dn3ZeminOn === 'function') dn3ZeminOn(X0, X1);
  ```
  Sonuç: yayın ayakları kabarık bulutların İÇİNE girer (WORLD3 test sarmalayıcısıyla doğrulandı: yatay 1194×834 ve dikey 834×1194). `cizOn`'da ÇAĞIRMAYIN (Feza'nın önüne çizer).
- **Feza seçilebilirliği (QA madde 2, arka plan tarafı):** dn3World sonunda Feza'nın arkasına yumuşak mor-gül gölge alanı (önbellekli sprite, karede tek drawImage; uçuşta kapalı).

- **SES – QA turu 1 düzeltmeleri:** (2) Cümleler artık sözcük ortasında kesilmiyor: çalanın ≤3 sn'si kaldıysa biter, yeni cümle bekler (ömrü bekleme kadar uzar);
  daha uzunsa çalan cümle kayıttaki bir sonraki gerçek cümle sonu boşluğunda (≥0,25 sn sessizlik) susar. Olay tepkisi (acil 1), acil cümle (kurtarma vb.) ve sahne cümlesi aynı kuralla girer;
  konusu bitmemiş talimat sonra bir kez yeniden söylenir. (3) `p_kurtar` en az 30 sn arayla ve 5 çeşitten (`p_kurtar`, `p_kurtar1..4`) son ikisini tekrarlamadan; piril.js `p_kurtar` demeye devam edebilir.
  Yeni `p_b_selam` (uçuşta bulut hayvanları; `p_b_ucus2` ile 4–8 sn içinde çakışmaz). sesler.js 87 cümle, 2,6 MB.
- **WORLD3 (QA turu 1 sonrası):** tepede (gökkuşağı yayının ±R + ekran payı) ön plan bulut tutamları sönük/çizilmez → yay hiçbir dünya katmanıyla kesilmiyor (LEVEL3'ün kırpmasız çizimiyle doğrulandı).
  Feza'nın arkasında mor-gül gölge alanı (karede tek sprite). Dar bulut sütunları (≤2 sütun, ör. 454'teki 6 kare sütun) ortada tek, iri, zikzak kabarcık kulesi olarak çiziliyor.
  Yeni sığ çukurlar (45–46, 119–120, 153–159, 221–226, kuş geçidi) ekran görüntüsüyle kontrol edildi: yumuşak, kabarık çanaklar.
- SAHNE tur 3 (performans + düzen): erimede oda artık kesme maskesi yerine desen dolgusuyla çiziliyor; halka kenarı ve ışık zerrelerinin haleleri ¼ çözünürlüklü tamponda toplanıp tek geçişte basılıyor (görünüm aynı). Ölçüm (DPR 2, rAF aralıkları, 9,3–10,8 sn, 5 deneme): ort. 12,9 → 10,8 ms, 25 ms üstü kare 7 → 0, en uzun 60 → 25 ms. Seçim ekranında baloncuklar artık başlık+alt başlığın altında ve Feza'nın yüzünün üstündeki banda hesaplanarak yerleşiyor (1024×768, 1180×820, 1194×834, 1366×1024 ve dikeyleri denendi).
- **LEVEL12 tur 2 (anların kalitesi):** kaplumbağa hazırken (`hayvanBekle` dikkati, güç 0.75) kaplumbağanın tamamı + Feza kadrajda kalır (önceden sırt ekran dışındaydı);
  "bana zıpla" işareti sırtta zıplayan, göz kırpan minik gülen yıldız + Feza'dan sırta akan ışık noktaları yayı. Takımyıldızı tamamlanınca: dönen ışık hüzmeleri, yayılan altın halkalar,
  şekil boyunca koşan ışık, noktalardan göğe kayan minik yıldızlar (`tkSolen`). Şarkı kutlamasında çiçeklerden yükselen ışıklı nota işaretleri (♪) + büyük ışık halkası (`skNotalar`).
- **CORE'a öneri (kamera):** fırlatmadan 0,9 sn sonra `omDikkatHesap` 'hayvan' kutusunu yalnız Feza + göğe çeviriyor; Feza Yıldız Tepesi'ne indiğinde kaplumbağa (sol-alt) ve yıldız dalgası
  kadrajdan çıkıyor. İnişten sonra (Feza yerdeyken) kutuya kaplumbağanın başını da eklemek anın kahramanını gösterir.
- **POF'a öneri (pofuduk.js, Büyük Pofuduk):** uyanış aşamaları çok sevimli. Ayağa kalkıp beklerken (Feza üstüne zıplamalı) ~3 sn boyunca "üstüme zıpla" işareti yok; ekranda yürüme eli çıkıyor.
  Başının üstünde zıplayan bir ışık damlası/yıldız (kaplumbağadaki gibi) ve Pırıl'ın onun üstünde süzülmesi önerilir. Zıplatma ve ağaca varış akıcı; finalde Büyük Pofuduk Feza/Pırıl ile üst üste biniyor (kalabalık).
- **LEVEL12 tur 3 (Bölüm 1 anları; kare dizileriyle incelendi):** yerleşimde değişiklik gerekmedi (bolum.js/sarki.js aynı); regresyon: Bölüm 1-2 düzgün + dağınık bot 4/4 final, 0 düşme, 0 sıkışma, konsol 0.
  - **WORLD12 (dunya.js) önerisi — ilk çiçek:** çocuğun ilk büyük ödülü ama çiçek ekranda ~20 px'lik bir ışık noktası; halka + Pırıl sevinci var, çiçeğin kendisi küçük kalıyor.
    İlk açılışta (SAYAC.cicek===1) taç yapraklar 1-1,5 sn'de görünür biçimde açılsın, kısa bir ışık sütunu yükselsin, çiçek ~1,5× büyük dursun.
  - **WORLD12 — saklı yol tohumları:** dallardaki tohumlar küçük altın noktalar; koyu gövdelerin arasında 5 yaşında fark etmesi zor. Biraz daha büyük + yanıp sönen ışıltı (ylGlint benzeri) önerilir. Yaprak kemeri girişi çok güzel ve okunuyor.
  - **CORE (oyun.js) — karanlık göl:** Pırıl'ın ışık nefesi ve nilüferlerin belirişi çok güzel; ama nilüferler belirdikten sonra kamera Feza'nın yanında sabit, nilüfer yolu sağda ekran dışına uzanıyor, adacık/karşı kıyı görünmüyor.
    'aydinlat' sonrası ~2 sn kısa bir dikkat (nilüferler + adacık) yolu gösterir. Işık Ağacı'nın yanışı ve final kalabalığı (Pofuduklar, Büyük Pofuduk) görkemli; değişiklik önerim yok (yalnız Büyük Pofuduk Feza'nın önüne biniyor: POF notu yukarıda).
  - **PIRIL (piril.js):** nefes anında Feza kıyıda Pırıl'dan uzak duruyor; nefes bittikten sonra Pırıl'ın bir kez nilüfere doğru "hadi" uçuşu (kısa yol gösterme) ilk zıplamayı kolaylaştırır.

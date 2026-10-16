# Bölüm 5 — Uyuyan Yanardağ

Genel modül, fizik ve erişilebilirlik sözleşmesi `SPEC.md` içindedir. Bu belge beşinci rüyanın eklerini anlatır.
Önceki dört rüyanın bölüm içeriği ve müzikleri korunur; ortak yataktan doğrudan giriş akışı beş rüyada da güncellenmiştir.
Canvas 2D, klasik scriptler ve `file://` desteği korunur.
Feza okuyamaz: ilerlemek yazıya, nota bilgisine veya doğru sırayı ezberlemeye dayanmaz. Korku, hasar ve başarısızlık yoktur.

## Hikâye ve görsel dil

Kor Çiçeği uyumuş, dağın ışık bahçeleri solmuştur. Feza ve Pırıl bahçeleri canlandırır, üç aç Güneşkuşu yavrusunu doyurur,
lav nehrini kuşlarla birlikte geçer ve çiçeği uyandırır. Her yavru iki gerçek lokmayla doyar; anne kuş ve yavrular birlikte uçar.
Kraterde yumuşak lav fıskiyeleri ve yamaçlara geri düşen kor damlaları vardır;
hasar, korkutucu patlama, sarsıntı veya ani ışık flaşı yoktur. Dağ çiçekler, ışıklar ve origami kuşlarla canlanır.
Koyu mor bazalt, kızıl/mercan ve altın lav, yakut/magenta/mor dekor çiçekleri ve renkli kristaller; kâğıt katları, suluboya ve ince doku birlikte kullanılır.
Dokunulabilen bahçe tomurcukları ve bekleyen final çiçeği inci/fildişi yaprakları, teal sapları ve yuvarlak yüzleriyle bu kızıl dekordan ayrılır.
Gerçek oyun hedefinin önüne gelen büyük ön plan çiçekleri `dn5PlayClearance()` ile saydamlaşır; açılmış tomurcuk üzerindeki koruma kalkar.
Etkin mini oyunun meyve/kuş alanı ve hazır final çiçeği de aynı örtüşme korumasından yararlanır. Bu işlem oyun durumunu değiştirmez.
Lav nehrinde gerçek bir kanyon, lav şelaleleri ve taş sal vardır. Beslenen aynı üç yavru sal yolculuğunda yeniden görünür;
yönlendirme nehrin yatağı içinde kalır.

## Dosyalar ve yükleme

| Dosya | Sorumluluk ve özel önek |
|---|---|
| `bolum5.js` | Izgara, yerleşim, `BOLUM`; `bl5*`. Genel harita adları diğer bölümlerle aynıdır, yalnız seçilen bölümün haritası yüklenir. |
| `dunya5.js` | Arka plan, bazalt, lav, bitkiler ve önbellekler; `dn5*`, `DN5`. |
| `volkan.js` | Bahçeler, bacalar, taş oyuncaklar, kapılar, Kor Çiçeği; `vk5*`, `VK5`. |
| `kristal.js` | Üç Güneşkuşu yavrusunu meyveyle besleme, anneyle uçuş ve güvenli kontrol dönüşü; dosya adı uyumluluk için korunur, `kr5*`, `KR5`. |
| `lavsal.js` | Sal yolculuğu, kemerler ve origami kuşlar; `ls5*`, `LAVSAL`. |
| `muzik.js`, `ses.js`, `sesler.js` | Beşinci rüyaya özel beste, olay sesleri ve kayıtlı Türkçe konuşmalar. |
| `oyun.js`, `sahne.js`, `arayuz.js`, `piril.js` | Bölüm seçimi, ortak fizik/kamera, rehberlik, giriş, sabah finali ve sonuç kartı. |

`index.html`, `BOLUM_NO=5` için önce `bolum5.js` haritasını; ardından `dunya5`, `volkan`, `kristal`, `lavsal` modüllerini yükler.
Bu dört yeni davranış/sanat modülü yalnız B5 sayfasında yüklenir. Müzik ve konuşma motorları daha sonra, `oyun.js` en son yüklenir.
Yeni çalışma zamanı dosyaları `sw.js` içindeki `SRC` listesinde de bulunmalıdır. Önemli değişiklikte oyunun `feza-piril-` önbellek sürümü artırılır.
Diğer oyunların önbellekleri veya gerçek kayıtları temizlenmez. `file://` açılışında service worker kaydı atlanır.

## Harita ve nesneler

Harita `600 × 30` kare; `T=40` ile genişlik 24.000 dünya birimidir. `FLOWERS=[]`, `TREE=null`, `BOLUM.gollar=[]`;
yüzme modu açılmaz. Ana patika, affedici zıplama ve Pırıl'ın mevcut kurtarma sistemiyle kullanılır.

| Bölge | Sütunlar | İçerik |
|---|---|---|
| `koz` | 0–120 | İlk bahçe, bazalt patikalar ve sıcak taş oyuncakları. |
| `buhar` | 120–235 | İkinci bahçe, buhar bacaları ve isteğe bağlı üst yollar. |
| `cicek` | 235–300 | Üç Güneşkuşu yavrusunu besleme ve sal kıyısı. |
| `lav` | 300–425 | Sal ile lav nehri yolculuğu. |
| `kalp` | 425–600 | Üçüncü bahçe, yüksek patika ve Kor Çiçeği. |

- `korBahce`: üç tomurcuğun canlanmasıyla tamamlanır; bahçeler 60, 174 ve 488. sütunlardadır.
  Ekranda görünen tomurcuğun başına dokunmak onu seçer; Pırıl'ın kısa ışık nefesinden sonra açılır. Dokunma hedefi Feza'ya yatayda en çok 800,
  düşeyde 350 dünya birimi uzaklıkta olmalıdır. Diğer ekran dokunuşları yürümeyi sürdürür; tomurcuğa yaklaşarak veya yanından yürüyerek açma da korunur.
  Bahçe yakınında geçen 17 saniyeden sonra gecikmeli yardım devreye girer: ilk yardım yaklaşık 19,5 saniyede, sonraki yardımlar 2,5 saniye arayla gelir.
  Böylece geride kalan bir tomurcuk için geri dönmek gerekmez.
- `buharBaca`: basıldığında güvenli bir yukarı itiş verir; aynı bacada beklemek sonsuz zıplama döngüsü oluşturmaz.
- `korBasamak`: esneyip zıplatan taş platform.
- `volkanPerde`: `bagId` ile bahçeye veya mini oyuna bağlı fiziksel geçit; bağlı etkinlik bitince açılır.
- `volkanMini`: 260. sütundaki kuş besleme oyunu; `KR5.aktif` etkinlik ve kontrol dönüşü bitene kadar etkin nesneyi, aksi halde `null` döndürür.
- `volkanSal`: 300. sütundaki yolculuk girişi; mini oyun tamamlanmadan başlamaz.
- `korCicegi`: 565. sütundaki final; üç bahçe, mini oyun ve sal tamamlanınca başlayabilir.
- `tohum`: isteğe bağlı keşif ödülü; ana görevin veya finalin şartı değildir. `volkanSus` yalnız manzara parçasıdır.

## Akış, kontroller ve kamera

Başlangıç durumu `V5={bahce:0,mini:false,sal:false,final:false}`. İlk iki bahçe → yavruları besleme → sal → üçüncü bahçe → Kor Çiçeği sırası izlenir.
`V5.bahce` tamamlanan bahçe sayısıdır; `mini` ve `sal` ilgili etkinlik tamamlanınca açılır.
`V5.final` kutlamanın **başladığını** da belirtir; kutlamanın bitişi final nesnesinin `done` alanı ve `volkanTamam` olayıdır.

Beş rüyada da yatak animasyonu bittiğinde doğrudan normal kontrol açılır. Bölüm 1'de giriş yaklaşık 13,4 saniye,
diğer bölümlerde 7,85 saniyedir (`son=uyudu+0.6`). Odanın rüyaya dönüşmesi, Feza'nın ikinci kez uyanması ve sonradan gelen ışık/perde/kontrol kilidi yoktur.
Bu yol rüya seçimi, yeniden oynama ve `?bolum=N` bağlantılarında aynıdır; yalnız `?atla` yatağı da atlar.
İlk rüyada yatak anlatımı, diğerlerinde doğru rüyanın kısa uyku sözü bir kez söylenir. Bölüme ait başlangıç rehberliği korunur.
Ormanın mevcut çizim önbellekleri tam ekran yatağın altında en çok 96 adımla hazırlanır; diğer bölümlerin mevcut önısıtması da yatak sırasında çalışır.

Besleme oyununda üç büyük yavru, kendi yuvaları ve sepette tek büyük altın meyve görünür.
Meyveyi sürükleyip aç yavrunun üzerine bırakmak veya önce meyveye, sonra yavruya dokunmak bir lokma verir.
Sıranın veya renk eşleştirmenin önemi yoktur. Her yavru iki lokma yer; yeme hareketi, kırıntılar, gövde/kanat tepkisi ve doyunca değişen yüzü sonucu gösterir.
Meyve olmadan yavruya dokunmak yalnız onun isteme tepkisini ve meyvenin kısa hareketini gösterir; ilerleme sağlamaz.
Tok yavru yeniden beslenmez. Meyveyi yalnız seçmek, basılı tutmak veya aynı hedefe seri dokunmak fazladan lokma üretmez.
Yanlış yere bırakılan meyve 0,42 saniyelik yayla sepete geri gelir; ceza veya ilerleme kaybı yoktur.

Yaklaşma/kadraj yerleşimi 1,1 saniyedir (`KR5_ARRIVE`). Gerçek teslim yayı 0,32 saniye (`KR5_DELIVER`), lokma sonrası yeni meyvenin hazır olma aralığı 0,63 saniyedir.
Sayaç meyve ağza ulaştığında artar. Son lokmadan yaklaşık 0,95 saniye sonra anne ve yavruların 5,2 saniyelik uçuş kutlaması (`KR5_FINAL`),
ardından 0,65 saniyelik güvenli kontrol dönüşü (`KR5_LAND`) başlar. Kamera gerçek krateri hedefler; buradaki süreler oyun zamanlayıcılarıdır.
Üç yavrunun toplam altı lokması `totalFed`, her yavrunun iki lokması `birds[i].fed` ile tutulur; görünmez bir dolum veya seçilmiş hedef kuyruğu yoktur.

İlk lokma henüz verilmemişse 4 saniyelik boş bekleyişten sonra meyve bir yavruya doğru gidip geri dönen 1,8 saniyelik sessiz gösterim yapar;
bu gösterim lokma sayısını artırmaz ve çocuk meyveyi hareket sırasında da alabilir.
İlk gerçek yardım 8 saniyelik boş bekleyişten sonra Pırıl'ın bir meyveyi görünür biçimde teslim etmesidir.
Yardımla verilen lokmadan sonraki yardım eşiği 7 saniyedir; oyuncu lokmasından sonra 8 saniyedir. Teslim, soğuma veya dönüş animasyonları bu boş bekleyişe sayılmaz.
Meyve seçili bırakılırsa 8 saniyede kısa sesli hatırlatma gelir, 16 saniyede meyve geri döner; sürekli basılı tutmak kendiliğinden besleme sayılmaz.
Klavye yedeğinde sol/sağ hedef yavruyu değiştirir, Boşluk/E önce meyveyi seçer, sonra aç yavruya verir.

`P.ucus=o` normal fiziği devralır; mini oyunun kendi dikkat kutusu yuvaları ve sepeti çerçeveler, sal koridoru kamerasına girmez.
Genel yürüme/zıplama ve uzak hedef rehberliği etkinlik boyunca kapalıdır. Bitişte aynı giriş ve güvenli konum geri yüklenir; `V5.mini` ancak güvenli dönüşte açılır.
`pointercancel`, kaybedilen parmak yakalama, `blur`, `pagehide` ve gizlenen belge sürüklemeyi bırakıp meyveyi geri gönderir; yenen lokmalar korunur.
Gizli sayfada zaman ilerlemez; mola/duraklatmada ilerleme saklanır. DOM düğmeleri ve eve dönüş mini oyuna ait dokunuş sayılmaz.
Yanardağ bölümünde çiçek üzerinde veya genel arayüz katmanında öğretici el işareti çizilmez; diğer dört rüyanın ipuçları korunur.

Salda `P.ucus=o` kancası normal fiziği devralır; `o.adim(dt,girdi)` Feza'nın yerini günceller.
Sal kendisi ileri gider; parmağın dünya yüksekliği veya ↑/↓/W/S nehir içinde yön verir. Zıplama düğmesi bu sırada gizlenir.
Yolculuk kendi Feza/Pırıl çizimini kullanır; normal karakter çizimleri `P.ucus` doluyken erken döner, kopya karakter çizilmez.
Kamera koridoru ve yakınlaştırma `BOLUM.sal` üzerinden hesaplanır. İnişte `P.ucus` temizlenir, güvenli konum ve hızlar güncellenir;
sal yeniden tetiklenmeyecek biçimde tamamlanır. Işıkların kaçırılması veya yön vermemek ceza oluşturmaz.
Besleme oyunundaki aynı üç yavru `kr5DrawTravelBird()` ile yolculuğun ilerleyen kısmında teknenin çevresinde görünür;
anne Güneşkuşu da kanyonda eşlik eder. Toplam sal süresi 35 saniyedir.

Kor Çiçeği kutlamasında karakter/kamera sahneyi birlikte gösterir. `a_v_final1`, kutlama başladıktan beş saniye sonra dünyada söylenir;
sabah sahnesinde tekrar edilmez. Kutlama bitişinden yaklaşık iki saniye sonra `finaleGec()` çağrılır.
`a_v_final2/3` sabah odası, Pırıl'ın göz kırpması ve kapanışla eşlenir.

## Olay sözleşmesi

| Olay | Veri ve anlamı |
|---|---|
| `bolum5Basla` | Dünya açılışı; kısa müzik karşılaması. |
| `korUyandi` | Bahçe nesnesi; `index`/`sira` 0–2. `SAYAC.kor` ve çevrenin ışığı güncellenir. |
| `buharZip` | Gerçek itişi yapan baca/basamak nesnesi; yumuşak buhar sesi. |
| `volkanMiniBasla` | `{o,yavru:true,total:6}`; besleme oyunu başlar, normal dünya müziği devam eder. |
| `volkanYemTut` | `{o}`; meyve sürükleme veya klavye ile seçilir, kısa kâğıt dokunuşu duyulur. |
| `volkanYavruBesle` | `{o,index,fed,totalFed,total:6,babyFed,help}`; meyve gerçekten ağza ulaşır. `index` 0–2, `babyFed` 1–2, toplam 1–6'dır. |
| `volkanMiniAsama` | `{o,yavru:true,stage:1..3,fed,total:6}`; bir yavru ikinci lokmasını yiyip doyar. |
| `volkanYavruUctu` | `{o,index}`; kutlamada ilgili yavrunun uçuşu bir kez başlar. |
| `volkanMiniTamam` | `{o,yavru:true,fed:6,totalFed:6,total:6}`; güvenli kontrol dönüşü tamamlanır, geçit açılır. |
| `volkanKristal` | Bahçe ve saldaki küçük taş sesleri için korunur; besleme oyunu bu olayı üretmez. |
| `lavSalBasla` | `{o,duration:35}`; sal müziği başlar. |
| `lavSalAn` | `{phase:'lift'|'surf'|'arch'|'landing',index?}`; seyrek sahne/ses cevabı. |
| `lavSalBitti` | `{o}`; güvenli iniş, normal fizik ve ana müzik geri gelir. |
| `volkanFinalBasla` | `{o,duration:26,box}`; çiçek kutlaması, kamera kutusu ve final müziği. |
| `volkanTamam` | Final nesnesi; sabah geçişini planlar. |

## Müzik ve konuşma

“Dağın Nefesi” yeni bir F Lidyen bestesidir: sıcak 6/8 salınım, yumuşak taş/handpan tınısı, arp, flüt, yaylılar ve seyrek koro.
Feza'nın inen üç notası ve Pırıl'ın altılı sıçrayışı bu rüyada yeniden işlenir. Ana ezgi 32 ölçü/76,8 saniye;
sal düzenlemesi 14 ölçü/33,6 saniyelik ayrı bir forma sahiptir; aynı 6/8 tempoda giriş, yükseliş, kuşlar ve iniş cümleleri duyulur. Salın gerçek başlangıç/bitiş olayları müziği yönetir;
bu uzunluklar çocuğa dayatılan bir oynanış sayacı değildir. Besleme oyununda da aynı dünya müziği sürer; oyuncunun müzik çalması gerekmez.
Patlama, sert vurmalı katmanı veya sürekli konuşma yoktur. Konuşma sırasında mevcut müzik kısma sistemi çalışır.
Beş rüyanın ortak ses açılışında, tarayıcının kilitlediği mevcut `AudioContext` gerçek pointer/klavye girdisiyle yeniden sürdürülür;
mini oyunun dokunuşu sahiplenmesi bu yakalama aşamasındaki ses açmayı engellemez. Konuşma, bağlam çalışmadan veya MP3 çözülmeden
söylenmiş sayılmaz; hâlâ geçerli cümle sırada bekler. `?sessiz` davranışı ve yer/konu/sahne geçerlilik kontrolleri korunur.

Yeni Pırıl anahtarları: `p_v_uyku`, `p_v_giris`, `p_v_buhar`, `p_v_mini`, `p_v_mini_yardim`, `p_v_kristal_son`,
`p_v_sal`, `p_v_sal_son`, `p_v_kalp`, `p_v_bahce`; seyrek dost sözü `p_dost_volkan`.
Anlatıcı anahtarları `a_v_final1..3`. Toplam 14 yeni tr-TR-EmelNeural kayıt `sesler.js` içine gömülüdür;
ilk ekleme sırasında önceki 106 ses kaydının MP3 içeriği aynı korunmuştur. Metin kaynağı `ses.js`; yenileme aracı `gen_voice.py`.
Besleme için `p_v_mini`, `p_v_mini_yardim` ve `p_v_kristal_son` mevcut anahtarları yeni meyve/kuş yönergeleriyle yeniden kaydedilmiştir.
Yem alma, gerçek lokma ve yavrunun uçuşu ayrı, seyrek olay sesleri üretir; lokma olmadan beslenme sesi veya tamamlanma övgüsü çalmaz.

## Süreler, performans ve doğrulama

- Rahat ilk oynanış için **6–9 dakika tasarım hedefi** vardır; bu, ölçülmüş tam oynanış süresi veya hız garantisi değildir.
- Üç yavrunun her biri iki gerçek lokmayla doyar. Sürükle/bırak ve meyve → yavru iki dokunuş yolları aynı teslim animasyonunu kullanır.
  Yalnız seçmek veya basılı beklemek lokma sayısını artırmaz. Sessiz gösterim ve Pırıl'ın gecikmeli yardımı çocuğun takılmasını önler.
  Gerçek süre dokunuşlara, animasyonlara ve duraklamalara bağlıdır; 1,1 saniye giriş, 0,32 saniye teslim, 0,63 saniye lokma aralığı,
  son lokmadan yaklaşık 0,95 saniye sonra 5,2 saniye uçuş kutlaması ve 0,65 saniye güvenli dönüş vardır.
  Salın kod süresi 1,2 saniye biniş + 32,4 saniye nehir + 1,4 saniye iniş, toplam 35 saniyedir.
  Yol, 44 ışık ve 5 kemer korunur; sahne anları normalize `routeU` ilerlemesine bağlıdır.
  Çiçek kutlaması 26 saniyedir. Bunlar oyun zamanlayıcılarıdır, CPU/GPU ölçümü değildir.
- Hedef iPad M1'de akıcı 60 FPS, masaüstünde mevcut profilin en çok 120 FPS sınırıdır. Donanım üzerinde ayrıca doğrulanmalıdır.
  CPU'da fizik/rota sözleşmesi testi veya sesin çevrimdışı işlenmesi, iPad'de çizim performansı kanıtı sayılmaz.
- Büyük gökyüzü, dağ, bitki, taş, sal ve kristal resimleri önbelleğe alınır; kare başına ağır blur/filter kullanılmaz.
  Dünya zemini 768 birimlik parçalarla çizilir; LRU en çok 12 arazi tuvali tutar. `dn5Isit()` atlas hazırlığını karelere yayar.
  Altı bazalt atlası yaklaşık 5,27 MiB tutar. Mini/salın 15 renk dizesi de açılışta sırayla önısıtılır;
  renk nicemlemesiyle 14 küçük ışık sprite'ı oluşur ve ilk etkileşimde tekrar üretilmez.
  Mini oyunda üç yavru, tek meyve ve 12 kırıntıdan oluşan sabit durum dizileri kullanılır; gövde, kanat, yuva, sepet, meyve ve anne resimleri önbelleğe alınır.
  Ses motorunun mevcut geçici ses sınırı korunur.
- Besleme oyununda ana dünya bestesi devam eder; eski kristal/nota mini oyununun müzik programı kullanılmaz.
  Önceki çevrimdışı ses kontrollerinde ana tema, sal ve final çıktıları sonlu kaldı, clipping görülmedi.
  Eski kristal/nota ve altı çiçek seçme-kuyruk testleri tarihsel kanıttır; mevcut besleme oyununun doğrulaması sayılmaz.
  Önceki dört rüyanın kısa ses karşılaştırmaları eski nota sıralarını korudu;
  bu kontroller bütün bölümlerin oynanış testi yerine geçmez.
- Test açılışları: yatağı atlayarak `?sessiz&atla&bolum=5`, yatak girişiyle `?sessiz&bolum=5`, isteğe bağlı altyazı için `&altyazi`.
  Görsel/fizik testleri sessiz yapılır; gerçek konuşma ve ses kilidi için ayrıca sesli, kullanıcı dokunuşlu kontrol gerekir.
- Güncel besleme mini oyununun 22 CPU sözleşme testi ve dünya/bahçe bütünleşmesinin 37 CPU testi geçti.
  Sürükleme, iki dokunuş, tok yavru, yanlış bırakma, gerçek teslim, yardım, mola/gizlenme/parmak kaybı, güvenli dönüş ve sınırlı önbellek üretimi denetlendi.
  30/60/120 Hz tam CPU rotalarında üç bahçe, altı lokma/üç tok yavru, bir mini/sal/final tamamlanması ve sıfır düşme/hata görüldü.
  Bu testler Canvas/ses/depolama ve tarayıcı zamanlamasını taklit eder; görsel kalite, gerçek dokunmatik veya FPS kanıtı değildir.
  Gerçek tarayıcıda son sürümün yerel fare/dokunma, sesli açılış ve görsel turu ayrıca tamamlanmalıdır; bu belgedeki CPU sonuçları o turun yerine geçmez.
- Tam rota, üç bahçede görünür tomurcuğa dokunma ve normal yürüme, minide meyveyi sürükleme/iki dokunuşla verme,
  yanlış yere ve tok yavruya bırakma, anne/yavru uçuşu, yardımlı ilerleme, saldaki aynı kuşlar, salın yönlendirmesi/inişi, çiçek/sabah ve sonuç kartı;
  yatay/dikey düzen, `file://` açılışı ve ilk çevrimiçi kurulumdan sonra çevrimdışı açılış birlikte doğrulanmalıdır.
  Beş rüyanın yataktan doğrudan kontrol açılması; seçim, bağlantı ve tekrar girişte ikinci ışık/uyanış veya bekleme olmaması ayrıca kontrol edilir.

## Kayıt ve geri dönüş

Seçimde beşinci balon `{id:5,ikon:'volkan'}` kullanır. `?bolum=5` doğrudan açılışı, oturumdaki `fezaIsikSec='5'` ise
seçimden yeniden yükleme akışını sağlar. `fezaIsikSon` son oynanan rüyayı vurgular.
`finaleGec()` mevcut `fezaIsikTamam` dizisine 5'i bir kez ekler; önceki tamamlanan rüyalar silinmez, B5 balonunda yıldız görünür.
Kayıt tamamlanmış rüyaları saklar; bahçe/mini/sal içindeki anlık konumu kaydeden yeni bir checkpoint sistemi eklenmemiştir.
Sağ üstteki eve basılı tutma ve sonuç kartından odaya dönüş, bölüm sorgusunu/oturum bayrağını temizleyip seçim odasını açar.

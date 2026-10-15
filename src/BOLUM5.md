# Bölüm 5 — Uyuyan Yanardağ

Genel modül, fizik ve erişilebilirlik sözleşmesi `SPEC.md` içindedir. Bu belge beşinci rüyanın eklerini anlatır;
önceki dört rüyanın kurallarını değiştirmez. Canvas 2D, klasik scriptler ve `file://` desteği korunur.
Feza okuyamaz: ilerlemek yazıya, nota bilgisine veya doğru sırayı ezberlemeye dayanmaz. Korku, hasar ve başarısızlık yoktur.

## Hikâye ve görsel dil

Kor Çiçeği uyumuş, dağın ışık bahçeleri solmuştur. Feza ve Pırıl bahçeleri canlandırır, kristallerle dağın şarkısını bulur,
lav nehrini geçer ve çiçeği uyandırır. Dağ korkutucu biçimde patlamaz; çiçekler, ışıklar ve origami kuşlarla canlanır.
Koyu mor bazalt, kızıl/mercan ve altın lav, yakut/magenta/mor çiçekler ve renkli kristaller; kâğıt katları, suluboya ve ince doku birlikte kullanılır.
Lav nehrinde gerçek bir kanyon, lav şelaleleri ve taş sal vardır. Yönlendirme nehrin yatağı içinde kalır.

## Dosyalar ve yükleme

| Dosya | Sorumluluk ve özel önek |
|---|---|
| `bolum5.js` | Izgara, yerleşim, `BOLUM`; `bl5*`. Genel harita adları diğer bölümlerle aynıdır, yalnız seçilen bölümün haritası yüklenir. |
| `dunya5.js` | Arka plan, bazalt, lav, bitkiler ve önbellekler; `dn5*`, `DN5`. |
| `volkan.js` | Bahçeler, bacalar, taş oyuncaklar, kapılar, Kor Çiçeği; `vk5*`, `VK5`. |
| `kristal.js` | Üç aşamalı kristal mini oyunu; `kr5*`, `KR5`. |
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
| `kristal` | 235–300 | Beş kristalden oluşan koro ve sal kıyısı. |
| `lav` | 300–425 | Sal ile lav nehri yolculuğu. |
| `kalp` | 425–600 | Üçüncü bahçe, yüksek patika ve Kor Çiçeği. |

- `korBahce`: üç tomurcuğun canlanmasıyla tamamlanır; bahçeler 60, 174 ve 488. sütunlardadır.
  Yakından geçiş ve gecikmeli yardım yanlışlıkla geride bırakılan tomurcukların ilerlemeyi durdurmasını önler.
- `buharBaca`: basıldığında güvenli bir yukarı itiş verir; aynı bacada beklemek sonsuz zıplama döngüsü oluşturmaz.
- `korBasamak`: esneyip zıplatan taş platform.
- `volkanPerde`: `bagId` ile bahçeye veya mini oyuna bağlı fiziksel geçit; bağlı etkinlik bitince açılır.
- `volkanMini`: 260. sütundaki kristal korosu; `KR5.aktif` etkin ve yakındaki nesneyi, aksi halde `null` döndürür.
- `volkanSal`: 300. sütundaki yolculuk girişi; mini oyun tamamlanmadan başlamaz.
- `korCicegi`: 565. sütundaki final; üç bahçe, mini oyun ve sal tamamlanınca başlayabilir.
- `tohum`: isteğe bağlı keşif ödülü; ana görevin veya finalin şartı değildir. `volkanSus` yalnız manzara parçasıdır.

## Akış, kontroller ve kamera

Başlangıç durumu `V5={bahce:0,mini:false,sal:false,final:false}`. İlk iki bahçe → kristal korosu → sal → üçüncü bahçe → Kor Çiçeği sırası izlenir.
`V5.bahce` tamamlanan bahçe sayısıdır; `mini` ve `sal` ilgili etkinlik tamamlanınca açılır.
`V5.final` kutlamanın **başladığını** da belirtir; kutlamanın bitişi final nesnesinin `done` alanı ve `volkanTamam` olayıdır.

Kristal korosunda beş kristale dokunulur, parmak üzerlerinde gezdirilir veya basılı tutulur. Üç aşamada çevre ve müzik değişir;
yanlış nota yoktur. Boşluk/E klavye yedeğidir. Genel yürüme/zıplama ve Pırıl'ın uzak hedefe çağırması etkin mini oyunda durur;
kamera kristal bahçesini çerçevede tutar. Çocuk beklerse Pırıl seyrek bir sesli ipucu verir ve notalarla eşlik ederek ilerlemeyi sağlar.

Salda `P.ucus=o` kancası normal fiziği devralır; `o.adim(dt,girdi)` Feza'nın yerini günceller.
Sal kendisi ileri gider; parmağın dünya yüksekliği veya ↑/↓/W/S nehir içinde yön verir. Zıplama düğmesi bu sırada gizlenir.
Yolculuk kendi Feza/Pırıl çizimini kullanır; normal karakter çizimleri `P.ucus` doluyken erken döner, kopya karakter çizilmez.
Kamera koridoru ve yakınlaştırma `BOLUM.sal` üzerinden hesaplanır. İnişte `P.ucus` temizlenir, güvenli konum ve hızlar güncellenir;
sal yeniden tetiklenmeyecek biçimde tamamlanır. Işıkların kaçırılması veya yön vermemek ceza oluşturmaz.

Kor Çiçeği kutlamasında karakter/kamera sahneyi birlikte gösterir. `a_v_final1`, kutlama başladıktan beş saniye sonra dünyada söylenir;
sabah sahnesinde tekrar edilmez. Kutlama bitişinden yaklaşık iki saniye sonra `finaleGec()` çağrılır.
`a_v_final2/3` sabah odası, Pırıl'ın göz kırpması ve kapanışla eşlenir.

## Olay sözleşmesi

| Olay | Veri ve anlamı |
|---|---|
| `bolum5Basla` | Dünya açılışı; kısa müzik karşılaması. |
| `korUyandi` | Bahçe nesnesi; `index`/`sira` 0–2. `SAYAC.kor` ve çevrenin ışığı güncellenir. |
| `buharZip` | Gerçek itişi yapan baca/basamak nesnesi; yumuşak buhar sesi. |
| `volkanMiniBasla` | `{o}`; yalnız bu olay mini oyunun sakin müzik düzenlemesini başlatır. |
| `volkanKristal` | `{index,stage,help,strength}`; mini notası. Bahçeler `{index,source:'bahce'}`, sal ise `stage:1` ile aynı ses cevabını kullanır; bu iki kaynak mini oyun modunu açmaz. |
| `volkanMiniAsama` | `{o,stage:1..3}`; aşama geçişi. Nota olayındaki `stage` ise 0–2'dir. |
| `volkanMiniTamam` | `{o}`; geçit açılır, ana tema geri gelir. |
| `lavSalBasla` | `{o,duration:64}`; sal müziği başlar. |
| `lavSalAn` | `{phase:'lift'|'surf'|'arch'|'landing',index?}`; seyrek sahne/ses cevabı. |
| `lavSalBitti` | `{o}`; güvenli iniş, normal fizik ve ana müzik geri gelir. |
| `volkanFinalBasla` | `{o,duration:26,box}`; çiçek kutlaması, kamera kutusu ve final müziği. |
| `volkanTamam` | Final nesnesi; sabah geçişini planlar. |

## Müzik ve konuşma

“Dağın Nefesi” yeni bir F Lidyen bestesidir: sıcak 6/8 salınım, yumuşak taş/handpan tınısı, arp, flüt, yaylılar ve seyrek koro.
Feza'nın inen üç notası ve Pırıl'ın altılı sıçrayışı bu rüyada yeniden işlenir. Ana ezgi 32 ölçü/76,8 saniye;
sal düzenlemesi 28 ölçü/67,2 saniyelik ayrı bir forma sahiptir. Salın gerçek başlangıç/bitiş olayları müziği yönetir;
bu uzunluklar çocuğa dayatılan bir oynanış sayacı değildir. Kristaller F majör pentatonikte cevap verir, eşlik çocuğun notalarına alan bırakır.
Patlama, sert vurmalı katmanı veya sürekli konuşma yoktur. Konuşma sırasında mevcut müzik kısma sistemi çalışır.

Yeni Pırıl anahtarları: `p_v_uyku`, `p_v_giris`, `p_v_buhar`, `p_v_mini`, `p_v_mini_yardim`, `p_v_kristal_son`,
`p_v_sal`, `p_v_sal_son`, `p_v_kalp`, `p_v_bahce`; seyrek dost sözü `p_dost_volkan`.
Anlatıcı anahtarları `a_v_final1..3`. Toplam 14 yeni tr-TR-EmelNeural kayıt `sesler.js` içine gömülüdür;
ilk ekleme sırasında önceki 106 ses kaydının MP3 içeriği aynı korunmuştur. Metin kaynağı `ses.js`; yenileme aracı `gen_voice.py`.

## Süreler, performans ve doğrulama

- Rahat ilk oynanış için **6–9 dakika tasarım hedefi** vardır; bu, ölçülmüş tam oynanış süresi veya hız garantisi değildir.
- Kristal aşamalarının kodda en erken süreleri 15/18/18 saniyedir; 4,2 saniyelik kapanış da vardır.
  Nota sayısı, yardım ve çocuğun duraklamaları gerçek süreyi değiştirebilir. Salın kod süresi 2 saniye biniş + 60 saniye nehir + 2 saniye iniştir.
  Çiçek kutlaması 26 saniyedir. Bunlar oyun zamanlayıcılarıdır, CPU/GPU ölçümü değildir.
- Hedef iPad M1'de akıcı 60 FPS, masaüstünde mevcut profilin en çok 120 FPS sınırıdır. Donanım üzerinde ayrıca doğrulanmalıdır.
  CPU'da fizik/rota sözleşmesi testi veya sesin çevrimdışı işlenmesi, iPad'de çizim performansı kanıtı sayılmaz.
- Büyük gökyüzü, dağ, bitki, taş, sal ve kristal resimleri önbelleğe alınır; kare başına ağır blur/filter kullanılmaz.
  Dünya zemini 768 birimlik parçalarla çizilir; LRU en çok 12 arazi tuvali tutar. `dn5Isit()` atlas hazırlığını karelere yayar.
  Mini oyunda ses dalgaları 18 öğeli havuzu yeniden kullanır; ses motorunun mevcut geçici ses sınırı korunur.
- İlk çevrimdışı ses kontrollerinde ana tema, sal, kristal ve final çıktıları sonlu kaldı, clipping görülmedi.
  Hızlı kristal dokunuşları ve müzik modu geçişleri ayrı denendi. Önceki dört rüyanın kısa ses karşılaştırmaları eski nota sıralarını korudu;
  bu kontroller bütün bölümlerin oynanış testi yerine geçmez.
- Test açılışları: `?sessiz&atla&bolum=5`, uyku girişi için `?sessiz&bolum=5&uyku`, isteğe bağlı altyazı için `&altyazi`.
  Görsel/fizik testleri sessiz yapılır; gerçek konuşma ve ses kilidi için ayrıca sesli, kullanıcı dokunuşlu kontrol gerekir.
- Tam rota, kristallerde dokunma/sürükleme/basılı tutma, yardımlı ilerleme, salın yönlendirmesi/inişi, çiçek/sabah ve sonuç kartı;
  yatay/dikey düzen, `file://` açılışı ve ilk çevrimiçi kurulumdan sonra çevrimdışı açılış birlikte doğrulanmalıdır.
  Önceki 1–4. rüyanın açılışları da kontrol edilir.

## Kayıt ve geri dönüş

Seçimde beşinci balon `{id:5,ikon:'volkan'}` kullanır. `?bolum=5` doğrudan açılışı, oturumdaki `fezaIsikSec='5'` ise
seçimden yeniden yükleme akışını sağlar. `fezaIsikSon` son oynanan rüyayı vurgular.
`finaleGec()` mevcut `fezaIsikTamam` dizisine 5'i bir kez ekler; önceki tamamlanan rüyalar silinmez, B5 balonunda yıldız görünür.
Kayıt tamamlanmış rüyaları saklar; bahçe/mini/sal içindeki anlık konumu kaydeden yeni bir checkpoint sistemi eklenmemiştir.
Sağ üstteki eve basılı tutma ve sonuç kartından odaya dönüş, bölüm sorgusunu/oturum bayrağını temizleyip seçim odasını açar.

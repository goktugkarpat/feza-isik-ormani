# Uyuyan Yanardağ — Anka'nın uyanışı

Beşinci rüya sıcak akşam ışığında, bazalt patikalarda geçer. İlk dört rüyanın çizim dili ve ortak kontrolleri korunur.
Feza okuma bilmez; yazı, nota sırası, öğretici el/ok, yanlış cevap, zarar ve kaybetme yoktur.
Lav nehri ve tekne korunur. Anka teknenin yerine geçmez; uyanıştan sonra yolculuğa eşlik eder.

## Dosyalar ve yükleme

`index.html` yalnız `BOLUM_NO === 5` için `anka`, `dunya5`, `volkan`, `atesoyun`, `kristal`, `lavsal` modüllerini yükler.
Harita `bolum5.js`, ortak motor `oyun.js` dosyasındadır. Klasik scriptler ve yerel gömülü MP3'ler `file://` ile çalışır.
`sw.js` sürümü `feza-piril-v76-anka-kanatlari`; 41 oyun/simge önbellek girdisi vardır. Yeni kurulum sürümlü reload
isteklerini kullanır; yalnız Feza/Pırıl'ın eski önbellekleri temizlenir, aynı sitedeki diğer oyunlar korunur.

## Rota ve bahçeler

Üç ışık bahçesi, Anka etkinliği, 35 saniyelik lav yolculuğu ve Kor Çiçeği finali ana rotayı oluşturur.
`V5.bahce`, `V5.mini`, `V5.sal`, `V5.final` mevcut geçitlerle bağlanır. İsteğe bağlı üst yollar ana patikayı kilitlemez.

- Bütün bahçelerde görünen inci beyazı/turkuaz tomurcuğa dokunmak geçerlidir.
- İlk ve üçüncü bahçede tomurcuğa fiziksel yaklaşmak da ışığı uyandırır; arkadan veya uzaktan geçmek puan vermez.
- İkinci bahçenin gerçek buhar bacasına basmak sıcak nefesi yakındaki tomurcuğa taşır. Doğrudan tomurcuğa dokunma da geçerlidir.
- Bahçede bekleyen çocuk için gecikmiş yardım, Pırıl'dan tomurcuğa görünen ışık uçuşuyla gelir. Görünmez tamamlama yoktur.
- Buhar bacalarının yüksekliği gerçek itişi değiştirir. Baca üzerinde beklemek sonsuz otomatik zıplama döngüsü oluşturmaz.

## Anka etkinliği

`KR5.aktif` etkin nesneyi, `KR5.o.kr5` durumunu taşır. Evreler `arrive → egg → hatch → trace → awakening → land → done`.
Eski yavru besleme ve nota/kristal sıralama oyunları kaldırılmıştır.

1. Feza yaklaşınca 0,9 saniyelik kadraj yerleşimi başlar; giriş ve güvenli konum kaydedilir.
2. Büyük yumurtayı okşamak veya ayrı dokunuşlar kabuğu gerçekten ısıtır. Kabuğun çatlağı bu ilerlemeyle büyür;
   yalnız basılı beklemek veya uzak dokunuşlar puan vermez. Klavye yedeği Boşluk/E'dir.
3. 2,8 saniyelik çatlama sonunda aynı Anka açılır. Sönük kanadındaki beş geniş inci izi iki uçtan birinden başlanarak çizilir.
   Kesintisiz sürükleme veya sırayla tek dokunuş geçerlidir. Ters yönden çizmek ve yarım bırakıp devam etmek desteklenir.
4. Beş tüyden sonra 6,2 saniyelik kanat açışı/tüy armağanı ve 0,8 saniyelik güvenli dönüş gelir.

`kr5EggPosition`, `kr5PhoenixPosition`, `kr5TracePosition` gerçek dünya hedeflerini verir. İz noktaları `ANKA.izSag` üzerinden
kanadın tüyleriyle aynı konumda kalır. Etkinlik kadrajı dikey/yatay ekrana uyarlanır; ekran yönü ilerlemeyi sıfırlamaz.
Pırıl 12 saniyelik boş bekleyişten sonra görünür biçimde yardımcı olur. Yardım, normal oyuncu girdisini engellemez.
`pointerup`, `pointercancel`, kayıp pointer capture, blur, gizlenme, sayfadan ayrılma ve evre değişimi parmağın sahipliğini bırakır.
Son yumurta/kanat dokunuşu, tamamlanan evrede yeniden capture alamaz. Ev düğmesi etkinlik dokunuşu sayılmaz.

`P.ucus=o` yalnız etkinliğin fiziğini devralır. Güvenli dönüşte giriş fotoğrafındaki konum ve alanlar aynen geri verilir;
normal yerde yürüyüş sonraki fizik adımlarında güvenli noktayı her zamanki gibi yeniler. `V5.mini` dönüş bitince açılır.

## Dünya oyuncakları

`atesoyun.js` ana yola ek, isteğe bağlı üç karşılaşma içerir:

- Erken büyük Anka tüyüne yaklaşınca tüy yükselir, ince bir iz bırakır.
- Bazalt terazinin dört gerçek platformu, Feza'nın destek aldığı noktaya göre eğilir. Dört destek dönen kirişle aynı x/y
  hareketini yapar; `cisim.dx/dy` yolcuyu taşır. Yakındaki alt zeminde durmak teraziye ağırlık sayılmaz.
- Yelpaze çiçeği açılıp dört gerçek yaprak basamağı çıkarır. Görünmezken collider kapalıdır, yaprak belirince açılır.
  Açılmayı beklemeden alt patikadan devam edilebilir. Üç yaprak aralığı normal zıplamayla geçilebilir.

Başlangıçta üretilen sekiz child platform gerçek `NESNELER` ve `CISIMLER` listelerine girer. Duraklatılmış/geçersiz dt onları oynatmaz.

## Lav nehri

Biniş 1,2 saniye, nehir 32,4 saniye, iniş 1,4 saniye; toplam 35 saniyedir. Tekne ileri kendisi gider.
Parmağı yukarı/aşağıda tutmak veya ↑/↓/W/S yön vermek yüksekliği değiştirir. Yakındaki büyük çiçeğe dokunmak tekneyi ona yönlendirir.
28 küçük ışık yalnız gerçek yakınlıkta toplanır; üç büyük çiçek de tekne yakınından geçince açılır. Kaçanlar toplanmış sayılmaz,
ama hiçbir hedef kaçınca kaybetme veya mecburi geri dönüş olmaz. Beş ışıklı kemer yolculuğu çerçeveler.

Anka, etkinlikte uyandırılan aynı karakterdir. Tekne, dalga izi, lav akışı ve ince kor tozu korunur; Feza/Pırıl iki kez çizilmez.
Kıyıda normal fizik geri gelir; konum, hızlar ve güvenli nokta güncellenir. Yolculuk tekrar başlamaz.

## Final, sanat ve ses

Üç bahçe, Anka ve tekne tamamlanınca Kor Çiçeği açılır. 26 saniyelik kutlamada Anka yükselir; ardından sabah/yatak ve sonuç ekranı gelir.
Mevcut `fezaIsikTamam` dizisine yalnız bölüm 5 eklenir; önceki rüyaların kayıtları silinmez. Sonuçtan ve basılı tutulan ev düğmesinden
rüya seçimine dönülür; kısa ev dokunuşu çıkış yapmaz.

`anka.js` ortak, önbellekli çizicidir: katmanlı tüyler, bükülen kanat bileği, ayrı kuyruk katmanları ve yumuşak uçuş/katlanma.
Dünya, mini oyun, tekne ve final aynı API'yi kullanır. Çizim sırasında ağır blur/filter üretilmez; ışık renkleri önceden ısıtılır,
tozlar sabit sayılı analitik hareket veya sınırlı havuzlarla çizilir. Ön tozlar Feza'nın ve mini hedeflerin önünü açar.

Anka için mevcut Türkçe Emel kayıtları kullanılır. Mini giriş/kanat/bitiş ve tekne giriş/bitiş konuşmaları gerçek başlangıçta bir kez istenir.
V74'ün ses kilidi, sırada bekleme ve eski talimatı iptal etme düzeltmeleri korunur. 121 MP3'ün 110 etkilenmeyen metin/süre/kaydında
V74'e göre değişiklik yoktur. `?sessiz` testte ses çıkışını kapatır; normal kullanımda ilk gerçek dokunuş ses bağlamını açar.

## Doğrulama ve sınırlar

16 Ekim 2026 devam turunda gerçek tarayıcıda başlangıçtan sabah/sonuca kadar doğal rotada tuş/fare girdileriyle tamamlandı:
üç bahçe, beş oyuncu tüyü, üç gerçek yakınlık çiçeği, bir mini/tekne/final bitişi; motor ve uncaught hata sıfır.
İlerleme bayrakları, oyuncu konumu veya zaman hızı bu tam turda değiştirilmedi. Otomatik hızlı testin yaklaşık 188 saniyesi
çocuğun oynama süresi ölçümü değildir; rahat ilk tur için 6–9 dakika tasarım hedefi korunur.

Ayrı yerleştirilmiş etkinlik testleri: gerçek fareyle okşama ve ters sürekli iz; emüle tablet dokunuşları, dikey hedef sınırları,
üç tüyden sonra yataya çevirme, kısa ev dokunuşu, güvenli dönüş. CPU/gerçek motor sözleşmeleri ayrıca pointer yaşam döngüsünü,
15/30/60/120 Hz mini akışını, terazi yolcu taşınmasını, görünmez yapraklardan geçişi ve üst yol zıplamalarını doğrular.
Gerçek çevrimdışı kurulumda 41/41 dosya hash eşitliği, diğer oyun önbelleğinin korunması ve beş rüyanın internetsiz açılışı geçti.
13 gerçek OfflineAudioContext karışımı ve 121 MP3 çözümü sonlu/clipping'sizdi. Fiziksel iPad/Safari performansı ve canlı hoparlör
üzerinde telaffuz dinlemesi bu Mac testlerinin kapsamı değildir. QA araçları oyun klasörüne eklenmez.

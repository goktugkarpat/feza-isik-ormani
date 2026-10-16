# Anka / volkan bölümü — bilgisayar değişimi için devam notu

16 Ekim 2026. Bu paket **devam eden çalışma**, yayınlanmaya hazır veya tümü oynanarak doğrulanmış bir sürüm değildir. Son doğrulanmış ana yayın `c15f972` (v74). Kullanıcı bilgisayarı bir dakika içinde kapatacağını bildirdiği için geliştirme durduruldu ve bu ara kayıt oluşturuldu. GitHub main üzerine yayınlamayın; önce aşağıdaki kontrolleri tamamlayın.

## Kullanıcının güncel istekleri

- Volkan atmosferi ve özellikle oynanış orman/gökkuşağı kadar iyi olmalı; ciddi değişiklik istiyor.
- Eski üç yavruyu altı kez besleme mini oyunu kaldırılmalı, Anka/phoenix mutlaka olmalı.
- **Lavlar ve tekne yolculuğu kesinlikle kalacak ve geliştirilecek. Anka teknenin yerini almayacak.**
- İnce ateş/kor/toz parçacıkları önemli: lav çatlakları, Anka tüyleri ve teknenin izi. Karakterleri/etkileşim hedeflerini örtmeyen, sınırlı yoğunluk.
- Beş yaş için okuma, el/ok işareti veya başarısızlık istemiyor. Sık gerçek screenshot ve doğrudan sohbet içi bar/gerçekçi kalan süre istiyor.

## Uygulanan ara kod

- Yeni `src/anka.js`: ortak, önbellekli Phoenix renderer. `ANKA.ciz(ctx,x,y,scale,tm,opt)`, `ANKA.isit()`, sağ kanat beş iz noktası `ANKA.izSag`. Mini ve dünya aynı karakteri kullanıyor. İlk sanat folyosu gösterildi; kanatların sert yarım daire görünümünün daha organik ve katmanlı yapılması istendi. Son kaliteyi tekrar gör.
- `src/kristal.js`: yumurtayı gerçek sürtme/tap ile ısıt → çatlama → kanattaki beş geniş inci izini çiz/tap → 6.2sn Anka uyanışı → güvenli giriş konumuna dönüş. Eski besleme yok. `KR5.aktif`, `P.ucus`, `V5.mini` korunuyor. Fazlar arrive/egg/hatch/trace/awakening/land/done. Helpers `kr5EggPosition`, `kr5PhoenixPosition`, `kr5TracePosition`. Yardım görünür ve gecikmeli. CPU18 vaka + gerçek motor3 mini senaryosu geçti, native tarayıcı kontrolü HENÜZ YAPILMADI.
- `src/lavsal.js`: tekne korunarak Anka eşliği, gerçek yakınlıkla toplanan ışıklar ve üç yükseklikli çiçek geçidi geliştirildi/geliştiriliyor. Yön vermenin sonucu olmalı; kaçan ışıkları otomatik puanlama eski kusurdu. Son dosya durumunu ve 35sn giriş/yol/iniş sözleşmesini tekrar kontrol et.
- `src/dunya5.js`: volkan, Anka atmosferi ve ince kor tozu üzerinde artistik çalışma. Son görüntü ve parçacık maliyeti doğrulanmalı.
- Yeni `src/atesoyun.js`: erken büyük Anka tüyü; ağırlıkla eğilen dört gerçek hareketli platformlu bazalt terazi (c209); açılıp dört gerçek yaprak basamağı çıkaran büyük yelpaze çiçeği (c434). Ana alt yol daima güvenli. `kur` sırasında eklenen child cisimler gerçek nesne listesine girer. Bunların fizik/üstünde taşınma ve görünürlük QA'sı devam ediyordu; SONUÇLARINI KONTROL ET.
- `src/bolum5.js`: yeni üst yollar/tohumlar ve oyuncaklar, kamera ipuçları. Mini ve tekne ses tetikleyicileri haritadan kaldırıldı; modüller gerçek başlangıç anında bir kez konuşmalı.
- `src/volkan.js`: bahçede arkadan geçmiş olmak puan vermiyor. B1/B3 fiziksel yaklaşma ve gerçek görünür ışık uçuşu; B2 bacaya basma `buharZip` ile çiçeği açar; doğrudan çiçek tap hâlâ geçerli. Yardım 14sn sonra görünür uçuşla gelir. Buhar h'leri gerçek farklı yükseklikler verir. Finalde aynı Anka yükselir; bu görüntü HENÜZ KONTROL EDİLMEDİ.
- `src/ses.js`, `sesler.js`, `src/muzik.js`: 10 B5 kaydı değişti + yeni `p_v_anka_kanat`; diğer110 kayıt birebir korundu. Yeni egg/trace guardları, Anka motif/efektleri. v74 ortak açılış/ses kuyruğu düzeltmeleri korunmalı. 28 yeni guard+17 unlock+26 startup+11 coldscore geçti. Gerçek OfflineAudio13 vaka fixture hazır, tarayıcıda HENÜZ çalıştırılmadı.
- index yalnız B5 için anka/dunya5/volkan/atesoyun/kristal/lavsal yükler. SW v75-ankanin-uyanisi ve iki yeni modül eklendi. Sürümlü reload cache fix korunuyor; 41 dosyalık gerçek yeni kurulum HENÜZ doğrulanmadı.

## Devam / test

1. Önce mevcut HEAD/diff ve Dropbox'tan diğer bilgisayar değişikliklerini kontrol et. Eski motor/deney yamalarını tekrar uygulama. Ana `c15f972` v74 ses düzeltmelerini geri alma.
2. Sözdizimi ve yeni modül yüklenmesini kontrol et. İlk dört bölümün oyun kaynakları, kayıtlar ve sesleri korunmalı.
3. Yeni mini oyunu yatay/dikey gerçek mouse/touch ile oyna; yumurta sürtme ve tap, ters yön iz, yarım izden devam, blur/hidden iptali, gecikmiş yardım, tam güvenli konum dönüşü.
4. Yeni platformlarda gerçek fizik: üstünde durma/taşınma; yelpaze açılmadan görünmez collider olmaması; yüksek yolun ulaşılabilirliği. Bahçe2 buhar olayları ve final kapılarının takılmaması.
5. Tekneyi gerçekten yukarı/aşağı sür; ışık/çiçek geçitlerinde kontrolün etkisini ve hiçbir mecburi geri dönüş/fail olmamasını gör. Lav/kor tozu okunaklılığı ve cache/per-frame allocation kontrolü.
6. Gerçek bölüm rotasını baştan sona tamamla; engine hataları/uncaught0, sabah/kayıt doğru. Yeni anlatı sırası ve decoded MP3/SFX kontrolü, ilk4 ses karşılaştırması.
7. Önbellek temiz bir yerel kökende 41/41 gerçek byte hash kontrolü; eski test HTML'leri canonical index cache anahtarını kirletebildiğinden QA sayfasını üretim cache testiyle karıştırma.
8. Ebeveyne gerçek screenshots göster; doğrulanmış sonucu commit et, Dropbox ve GitHub main'e mevcut kullanıcı yetkisiyle aktar, Pages dosyalarını hash ile doğrula. Bu WIP'i tamamlandı diye sunma.

## QA ve araçlar

Kaynak bilgisayardaki QA: `C:\Users\gktgk\Documents\ChatGPT\Game Development\piril-volkan-qa-20261015`. Taşınabilir QA arşivi Dropbox Game Development yanında `feza-piril-anka-devam-qa-20261016.zip` olarak hazırlanıyor. Script/reportlar `phoenix-*`, kök generator `make-phoenix-game-fixture.cjs`. Tarayıcı yalnız CUA ile; CDP/Playwright CLI kullanma. QA HTML'leri git'e girmemeli; generator ile gerektiğinde üret, bitince QA'ya taşı.

Son yerel test URL'si `http://localhost:9862/__qa-phoenix-game.html?bolum=5&sessiz&atla&stage=mini`; sunucu bilgisayar kapanınca çalışmayacak. Bu URL'de gerçek native mini testi henüz başlayamadı: araç/plugin yenilenmesi test sunucusunu ve geçici sekmeyi kapattı. Diğer bilgisayarda yeniden kendi yalıtılmış test sunucunu kur.

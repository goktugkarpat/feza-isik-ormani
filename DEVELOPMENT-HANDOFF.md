# Anka / yanardağ devam çalışması — tamamlandı

16 Ekim 2026. Diğer bilgisayarda bırakılan `307ed4d` ara kaydı bu devam turunda tamamlandı.
Eski yavru besleme veya kristal sıralama deneyleri geri getirilmedi. Lav nehri ve tekne korunur; Anka yolculuğa eşlik eder.

## Son düzeltmeler

- Anka'nın kanatları katmanlandı; bilek, uzun tüyler, kuyruk ve kanat katlama hareketleri ayrıldı.
- Beş dokunma/çizme izi gerçek tüylerin üzerine oturtuldu; dikey/yatay kadraj doğrulandı.
- Mini oyun, evre değişimi ve son dokunuş dahil bütün bırakma/iptal durumlarında gerçek pointer capture'ı bırakır.
- Bazalt terazinin dört desteği dönen kirişin iki eksendeki hareketini izler; gerçek yolcu taşınır, alt zemindeki çocuk teraziye ağırlık sayılmaz.
- İnce kor/toz efektleri karakter ve hedefleri örtmez; renk önbellekleri ısıtılır.
- Eski besleme akışını anlatan `src/BOLUM5.md` mevcut Anka akışıyla değiştirildi.
- Çevrimdışı önbellek sürümü `feza-piril-v76-anka-kanatlari`.

## Gerçek doğrulamalar

- Başlangıçtan sabah/sonuç ekranına gerçek tuş ve fare girdileriyle tam rota: üç bahçe, beş oyuncu tüyü,
  üç fiziksel yakınlıkla açılan lav çiçeği, bir mini/tekne/final tamamlanması; motor/uncaught hata sıfır.
  Tam rotada konum, ilerleme bayrakları ve oyun hızı değiştirilmedi. Otomatik hızlı tur yaklaşık 188 saniye;
  bu sayı çocuğun oynama süresi değildir.
- Ayrı mini testinde gerçek fareyle okşama + ters sürekli iz + güvenli dönüş geçti.
- Emüle tablette gerçek dokunuşlarla dikey hedef sınırları, yarım izden yataya çevirme, kısa ev dokunuşunun ayrılması ve dönüş geçti.
- İlk dört rüyanın 110 konuşması/metni/süresi V74 ile birebir. 121 MP3 ve 13 gerçek OfflineAudioContext karışımı sonlu/clipping'siz.
- Temiz gerçek SW kurulumunda 41/41 byte/hash eşleşmesi; diğer oyun önbelleği korundu. Beş rüya internet kapalıyken açıldı.
- Eski/yeni dört sahnenin her birinde emüle tablet 2049×1536 çizim çözünürlüğünde yaklaşık 60 FPS;
  p99 rAF 16,8 ms ve 25 ms üstü aralık sıfır. Çözünürlük/yoğunluk ayarları değiştirilmedi.
  CPU çizim maliyeti sahneye göre değişti; tekne ortalaması yaklaşık 1,11 → 1,67 ms. Bu fiziksel iPad/M1 ölçümü değildir.
- Mini yaşam döngüsü, farklı Hz'ler, gerçek motor platform taşıması ve yaprak aralığı zıplamaları ayrı sözleşme testlerinden geçti.

## Sınırlar ve yayın durumu

Testler bu Mac'te sessiz Chrome ile yapıldı; fiziksel iPad/Safari, canlı hoparlör ve bağımsız telaffuz dinlemesi yapılmadı.
Test HTML/script/reportları oyun klasörünün dışında tutuldu. Mevcut kayıtlar ve ilk dört bölümün oynanış kaynakları korunur.
Bu devam turu yerel/Dropbox teslimidir. GitHub yayını bu turda yapılmadı; ebeveyn gönder dediğinde tamamlanan main gönderilebilir.

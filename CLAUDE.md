# Feza ve Pırıl: Işıklı Rüyalar – çalışma notları

- 5 yaşındaki Feza için Ori tarzı (biraz Gris) 2D platform oyunu; yalnız Türkçe. Feza okuma bilmiyor: hiçbir şey yazıya dayanmaz
  (Pırıl'ın sesi + el/ışık ipuçları; altyazı yalnız `?altyazi` ile). Korkutucu hiçbir şey, böcek yok, kaybetme yok.
- Pırıl, Feza'nın gerçek uyku arkadaşı peluş ejderha (fotoğraflara göre: leylak gövde, fıstık yeşili çizgili karın, koyu yeşil 3 dilimli
  ibik, açık yeşil yüzgeç kulaklar, yeşil gözler, iki minik diş; peluşken kanatsız, rüyada ışıktan kanatlar).
- Canvas 2D, klasik scriptler (ES module yok, kütüphane yok), file:// ile de çalışır. Modül sözleşmesi ve kimin hangi dosyadan
  sorumlu olduğu: `src/SPEC.md`. Yükleme sırası `index.html`'de.
- Kontrol: sol altta zıplama düğmesi; ekranın başka yerine basılı tutunca Feza o yöne yürür. Klavye yedek.
- Seslendirme: `src/ses.js` içindeki `/*SESLER*/{...}/*SESLER-SON*/` bloğu; değişince `python gen_voice.py` → `sesler.js`
  (tr-TR-EmelNeural; `a_` anlatıcı, `p_` Pırıl). `.ses_onbellek/` git'e girmez.
- Test: her zaman `?sessiz`; `?atla` başlık ve açılışı atlar; `?atlanir` açılışı dokunuşla atlanabilir yapar.
- iPad uygulaması: `manifest.webmanifest`, `sw.js` (dosya eklenirse `SRC`/`CORE`'a ekle, önemli değişiklikte `CACHE` sürümünü artır;
  önek `feza-piril-` (eski `feza-isik-ormani-` önbellekleri de temizlenir), eski önbellek silerken yalnız bu önek), `icons/`.
- GitHub'a SADECE ebeveyn "yükle / GitHub'a gönder" dediğinde gönder (depo: goktugkarpat/feza-piril, `main`).
  `yayinla.command` ilk seferde depoyu oluşturup GitHub Pages'ı açar.
- Bölümler ("her gece başka bir rüya"): Bölüm 1 `bolum.js`, Bölüm 2 (Yıldız Gölü) `bolum2.js`, Bölüm 3 (Bulut Ülkesi) `bolum3.js` (+ `dunya3 bulut kuzu sekil ucus`); `index.html` `?bolum=N` > `sessionStorage 'fezaIsikSec'` > 1 ile birini yükler (`BOLUM_NO`); başlık sayfası hep Bölüm 1'dir ve seçim sahnesini (`SAHNE.secim`) gösterir; her bölüm sabah finaliyle biter, sonuç kartı "odaya dön" ile seçime döner. Kayıt: `fezaIsikTamam`, `fezaIsikSon`. Ayrıntı: `src/BOLUM2.md`, `src/BOLUM3.md` (Bölüm 3 sözleşmesi + ajan notları). Test: `?bolum=N`, `?atla`.
- Mini oyun kapısı (`src/kapi.js`, nesne `miniKapi`): şarkı (B1), takımyıldızı (B2) ve bulut şekilleri (B3) bitene kadar hemen ilerisine ışık perdesi gerilir (`bolum*.js`'te `bagId` ile bağlanır); çocuk dokunmazsa Pırıl kendisi tamamlar (sarki/takim/sekil geç yardım), yani asla takılmaz.
- Ebeveyn kısayolu: seçim ekranında sol üst köşe 3 sn = kayıtları sıfırla.
- Cihaz profili (`OM_MASA`, `?cihaz=pc|tablet`): dokunmatikte yoğunluk en çok 1,5 ve 60 fps kilidi; masaüstünde monitörün gerçek çözünürlüğü ve en çok 120 fps.
- 60 fps kilidi (ProMotion): `oyun.js` `omDongu` yenileme aralığını ölçer; 120 Hz'de her ikinci rAF'ta, 75-100 Hz ve 144 Hz+'ta zaman tabanlı çizer, 60 Hz ve altında hiç kare düşürmez. Fizik/animasyon gerçek zaman damgasıyla ilerler (hız her Hz'de aynı). Test kancaları: `OYUN.lim`, `OYUN.kareSay`, `OYUN.kareMs`.
- Bölüm 6 (Şenlik Kalesi, son rüya): `bolum6.js`, `dunya6.js`, `midilli.js` (ortak `midilliCiz`), `senlik.js` (fener, midilli, şövalye, kale köprüsü, avlu finali), `halka.js` (halka kapma mini oyunu); durum `V6`, ses harfi `f`. Sözleşme ve dosya ayrıntısı: `src/BOLUM6.md`. Seçim ekranı 6 balonu destekler (`shSecimYer`).

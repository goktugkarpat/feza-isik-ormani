# Feza ve Pırıl: Işık Ormanı – çalışma notları

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
  önek `feza-isik-ormani-`, eski önbellek silerken yalnız bu önek), `icons/`.
- GitHub'a SADECE ebeveyn "yükle / GitHub'a gönder" dediğinde gönder (depo: goktugkarpat/feza-isik-ormani, `main`).
  `yayinla.command` ilk seferde depoyu oluşturup GitHub Pages'ı açar.

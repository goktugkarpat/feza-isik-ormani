# Bölüm 6: Şenlik Kalesi — sözleşme (ajanlar arası)

Altıncı ve son rüya. Fantastik, büyülü bir masal kasabası (orta çağ sonrası havası): alacakaranlıkta mor-lacivert gök,
yuvarlak çatılı masal evleri, pencerelerden altın ışık, havada ışık tozları, sokaklar arasında asılı ama SÖNÜK fener dizileri,
uzakta bulutların arasında hafifçe parlayan, ışık bayraklı bir rüya kalesi. Şenlik ışıkları sönmüş, kasaba uyuyor ve renksiz;
Feza şenliği uyandırır. Korkutucu hiçbir şey yok: kavga, gerçek silah, düşman, kaybetme yok. Şövalyeler yalnızca sevimli tahta
oyuncak heykeller (dokununca selam verir). Atlar sevimli, büyülü midilliler (uyanınca yele/kuyruk ışıl ışıl, toynaktan yıldız tozu).
Kalite ölçüsü: ilk beş rüya (aynı çizim dili, aynı yumuşaklık, aynı 60 fps bütçesi). Feza okuma bilmez: yazı yok, öğretici el yok.

## Kimlik
- `BOLUM_NO === 6`, tema/fon adı `'senlik'`, ses harfi `f` (`p_f_*` Pırıl, `a_f_*` anlatıcı), balon ikonu `'senlik'`.
- Genel durum (index.html'de V5 gibi tanımlanır): `var V6 = { fener: 0, fenerTop: 12, midilli: 0, mini: false, kopru: false, final: false };`
- `index.html` yalnız `BOLUM_NO === 6` için şu sırayla yükler: `dunya6`, `midilli`, `senlik`, `halka` (+ `bolum6.js` harita, document.write ile).
  `sw.js` SRC listesine `bolum6, dunya6, midilli, senlik, halka` eklenir.

## Dosya sahipliği (yalnız kendi dosyana yaz; başkasının dosyasında değişiklik gerekiyorsa koordinatöre yaz)
| Ajan | Dosyalar |
|---|---|
| HARITA | `src/bolum6.js` (harita/nesne yerleşimi/kamera), `src/dunya6.js` (gök, uzak kale, kasaba evleri, zemin dokusu, dekor, sabah ışığı) |
| SENLIK | `src/midilli.js` (ortak midilli çizici + dünya midillisi), `src/senlik.js` (fener, şövalye heykeli, kale köprüsü, final avlu nesnesi) |
| HALKA | `src/halka.js` (halka kapma mini oyunu) |
| CORE | `index.html`, `sw.js`, `src/oyun.js`, `src/arayuz.js`, `src/piril.js`, `src/ses.js` (+ `gen_voice.py` çalıştırıp `sesler.js`) |
| SAHNE | `src/sahne.js` (seçim balonu ikonu 'senlik', uyku → rüyaya geçiş, final/sabah, finaldeki misafir dostlar) |
| MUZIK | `src/muzik.js` (şenlik müziği) |

Bölüm 5 tam bir örnektir: `grep -n "BOLUM_NO === 5\|V5\|volkan\|KR5" src/*.js index.html` ile her entegrasyon noktasını gör ve 6 için aynısını kur.

## Akış (harita, x sütun; T kare)
1. Başlangıç: kasaba girişi. Sokaklar `0..~250`: damlar, tenteli tezgâhlar, fıçılar, köprücükler. Yol sade, en çok iki kare basamak.
2. **Fenerler** (`tip:'fener'`, 12 adet, `V6.fenerTop`): Feza yanından geçince/dokununca yanar (B5 bahçe tomurcuğu gibi gerçek yakınlık
   ya da dokunuş). Yanınca altın-pembe ışık, fener dizisine yayılan ışık dalgası, küçük çan tınısı. `V6.fener++`, `OLAY.emit('fener', {n})`.
3. **Midilliler** (`tip:'midilli'`, 5 adet): uyuyan büyülü midilli; Feza üstüne zıplayınca uyanır (pofuduk gibi) ve Feza'yı yükseğe
   sıçratır (üst yollara). `V6.midilli++`, `OLAY.emit('midilliUyandi', {n})`. Uyanık midilli yerinde neşeli kıpırdar.
4. **Şövalye heykelleri** (`tip:'sovalye'`, 3-4 adet, isteğe bağlı oyuncak): dokununca/yaklaşınca tahta kılıcını değil, şapkasını/bayrağını sallar.
5. **Mini oyun – halka kapma** (`tip:'halkaMini'`, ~x 260): Feza ışıklı bir midilliye biner (otomatik ilerleyen yolculuk, B5 lav teknesi
   / B3 uçuşu gibi `P.ucus` ile fiziği devralır). Fener süslü büyülü bir yolda süzülürler; havada parıldayan halkalar belirir; Feza ekrana
   dokununca midilli zıplar (yükselir) ve halkayı kapar. Kaçırılan halka sonra tekrar gelir; 8 halka toplanınca biter. Kaybetme yok;
   ~40 sn dokunulmazsa Pırıl yardım eder (halkaları kendisi toplar), asla takılmaz. Bitince `V6.mini = true`, `OLAY.emit('halkaBitti')`.
   Önünde `miniKapi` ışık perdesi (`kapi.js`, `bagId`) olabilir; yolculuk bitince Feza kale köprüsünün önüne iner.
6. **Kale köprüsü** (`tip:'kaleKopru'`): `V6.mini` olunca ışıkla iner (`V6.kopru = true`, `OLAY.emit('kopruIndi')`); bulmaca yok.
   Feza'nın ilerlerken topladığı fener ışığı köprüyü yakar (görsel).
7. **Final** (`tip:'senlikAvlu'`, kale avlusu, harita sonu): Feza avluya varınca `V6.final = true`, `OLAY.emit('senlikFinal')`:
   havai fişekler, dans eden midilliler, ışık bayrakları, önceki rüyaların dostları misafir gelir (pofuduklar, yıldız kaplumbağası,
   kuzucuklar, denizatları, Anka) ~20-25 sn kutlama; sonra CORE/SAHNE sabah finali + sonuç kartı (diğer bölümler gibi).
   Fener/midilli eksik olsa da final açılır (kaybetme yok); sonuç kartı toplananları gösterir.

## Ortak API'ler
- `midilli.js`: `function midilliCiz(c, x, y, s, t, o)` — c: 2D ctx, (x,y) toynak tabanı ortası, s ölçek (1 ≈ Feza boyu kadar sırt),
  t zaman, o: `{ uyku: 0..1, yon: 1|-1, parilti: 0..1, kos: 0..1 (koşu/süzülme fazı), zipla: 0..1, renk: 0..4 }` (beş tatlı pastel renk).
  Önbellekli ve hızlı olmalı (her karede gradient/filtre üretme; B5 `anka.js` örneği). HALKA ve SAHNE bunu kullanır (henüz yoksa basit yer tutucu çiz).
- Olaylar: `fener`, `midilliUyandi`, `sovalyeSelam`, `halkaBasla`, `halka` ({n}), `halkaBitti`, `kopruIndi`, `senlikFinal`.
- Ses anahtarları (CORE yazar ve kaydeder): `p_f_uyku`, `p_f_giris`, `p_f_fener` (ilk fener), `p_f_fener2` (yarısı), `p_f_midilli`
  (ilk uyuyan midilli görülünce), `p_f_midilli_uyan`, `p_f_halka_giris`, `p_f_halka` (yarısı), `p_f_halka_bitti`, `p_f_kopru`, `p_f_final`,
  `a_f_final1..3` (anlatıcı sabah), `p_dost_senlik`. Diğer modüller yalnız `SES.soyle(k)` çağırır ya da olay yayar.
- Konuşma tonu: sıcak, kısa, 5 yaşa uygun; "Aa" gibi ünlemler yok; övgü ara sıra.

## Kurallar
- Klasik script, ES module yok, file:// çalışır. Her dosya üst kısa açıklama + diğer dosyalarla aynı yoğunlukta Türkçe yorum.
- Test: her zaman `?sessiz` (`?bolum=6&atla&sessiz`). Kendi sunucunu kendine özgü bir portta aç, iş bitince YALNIZ kendi açtığın süreçleri kapat
  (`pkill` ile başkalarınınkini öldürme). Test araçlarını oyun klasörüne koyma (scratchpad kullan).
- GitHub'a gönderme, commit atma (koordinatör yapar).
- İlerleme: `/private/tmp/claude-501/-Users-goktugkarpat-Library-CloudStorage-Dropbox-Game-Development/6a76d4aa-ea53-43f5-b361-140c6c3f5633/scratchpad/ilerleme/<AJAN>.txt`
  dosyasına ~5 dakikada bir tek satır yaz: `yüzde | kalan dakika tahmini | şu an ne yapıyorsun`.

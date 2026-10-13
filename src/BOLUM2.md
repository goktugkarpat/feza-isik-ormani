# SES anahtarları (Bölüm 2; SES ajanı ekledi — `SES.soyle('anahtar')` ya da `nesne('konusma', {anahtar})` ile)
Kayıtlı Pırıl cümleleri (sesler.js): `p_gecis` (Bölüm 1 sonu, ~4 sn; ayrıca `a_y_final1..3` Bölüm 2 final anlatıcısı) · `p_y_giris` (Bölüm 2 başı) · `p_y_gol` (yıldız taşları) · `p_y_yildiz` ("Yıldız uyanıyor! Bak, göğe çıkıyor.") ·
`p_y_yildiz2` ("Gökyüzü yıldızla doluyor") · `p_y_pofuduk` · `p_y_hayvan` (kaplumbağayı görünce) · `p_y_hayvan_uyan` ("Günaydın, Yıldız Kaplumbağası!") · `p_y_bitti` ("Bütün yıldızlar yerinde!") · `p_y_sarki` (yıldız şarkısı; Bölüm 2'de `p_sarki1` istenince bu çalar).
- Tetikleyici anahtarları `p_` ÖNEKSİZ de olur: `blSoz(.., 'y_gol')` → `p_y_gol` (ses.js `y_` → `p_y_` eşler; konu/gec/KOSUL kuralları tetikleyici nesnesinden okunur).
- Otomatik (tetikleyici gerekmez): `yildiz` olayında ilk yıldız için `p_y_yildiz` ('y_yildiz' tetikleyicisi yıldız uyanmadan çalışırsa söz, ilk yıldız uyanınca söylenmek üzere bekletilir) ·
  5. `yildizYerlesti`'de `p_y_yildiz2` · `hayvanHazir`'da `p_y_hayvan_uyan` · `hayvanUyandi`'da `p_y_bitti` (öncelik 3; ardından final anlatıcısı). `p_gecis` / `p_y_giris` CORE çağırır. Hepsi oturumda bir kez.
- Sahne cümleleri (`p_gecis`, `p_y_giris`, `p_y_bitti`, `p_uyan`) öncelik 3: DURUM 'oyun' olmasa da çalar. Bölüm 2'de `agacYandi()` hep false.
- Efekt adları (`AU.sfx`): `yildizUyan yildizYuksel yildizYerles yildizTas yildizTasBelir hayvanFirlat hayvanAsama hayvanUyan hayvanUyandi` (+ `sarki*`) ve aynı olaylar `OLAY` ile de dinlenir (aynı anda gelen çift çağrı bir kez çalar).
  `yildizYerles` perdesi yerleşme SIRASINA göre yükselir (muzik.js kendi sayar); `yildizTas`'a `sira` (0..) verilirse taşlar yukarı çıkan notalar çalar. Müzik `SAYAC.yildiz / SAYAC.yildizTop` oranını izler; `hayvanUyandi` doruğa geçirir.

# Bölüm 2 — "Yıldız Gölü" sözleşmesi (5 yaşındaki Feza için; Bölüm 1 ile aynı kalite, şıklık, atmosfer)

Hikâye: Bölüm 1'de Işık Ağacı yanınca orman aydınlandı ama gökyüzünde YILDIZ yok: yıldızlar sönüp Yıldız Gölü'ne düşmüş.
Pırıl: "Gökyüzünde yıldız yok! Yıldızlar göle düşmüş. Hadi gidelim!" Feza gölde sönük yıldızları bulup dokunarak uyandırır;
her uyanan yıldız parlayıp GÖĞE yükselir ve yerini alır (gökyüzü adım adım yıldızla dolar — bu bölümün ana görsel ödülü).
Pofuduklar buraya da gelir (ışığı karınlarında taşırlar, ışık sönünce uyurlar; aynı hikâye). Şarkı mini oyunu (sarki.js) burada
"yıldız şarkısı" olarak da var (nesne 'sarki'). Bölümün sonunda büyük bir YILDIZ HAYVANI (varsayılan: Yıldız Kaplumbağası; sırtında
sönük takımyıldızı; uyandıkça sırtı yanar, Feza'yı göğe zıplatır) uyanır → gökyüzü tamamen dolar → mevcut SABAH FİNALİ
(Feza yatağında uyanır) BURADA oynar (Bölüm 1'in sonunda artık final yok, geçiş var).

Dosyalar ve sahipleri (her ajan YALNIZ kendi dosyalarını düzenler; paylaşılan ad çakışmasını önlemek için özel önekler):
| dosya | sahip | önek | işi |
| `bolum2.js` + `yildiz.js` | LEVEL | `bl2*`, `yl*` | zemin ızgarası + nesne yerleşimi (Bölüm 2), nesne türleri `yildiz`, `yildizHayvan` (davranış + çizim), gökyüzüne çıkan yıldız nesneleri, `nesne('sarki',...)` yerleşimi (sarki.js'in mevcut türünü kullan), konuşma tetikleyicileri (`nesne('konusma', ...)` anahtarları `y_...`) |
| `dunya2.js` | WORLD | `dn2*` | Bölüm 2 arka plan/ön plan/ışık çizimi: gece gökyüzü (samanyolu, ay, aurora), uzak dağ/ağaç siluetleri, geniş göl + yansımalar, su ışıltısı, süzülen ışık kümeleri, sönük yıldız taşları suyun altı, GÖĞE ÇIKAN YILDIZLARIN gökyüzünde yerleşmesi (`SAYAC.yildiz / SAYAC.yildizTop` oranıyla dolan gökyüzü) |
| `muzik.js`, `ses.js`, `gen_voice.py`, `sesler.js` | SES | `au*`,`ses*` | Bölüm 2 müziği (Bölüm 1'den farklı ama aynı ailede: ninni/çelesta/kristal; yıldızlı, sakin, geniş, su damlaları, hafif yükselen arpejler; yıldız yükseldikçe müzik zenginleşir), yıldız efektleri (uyanma, yükselme, yerleşme, kaplumbağa uyanışı), Bölüm 2 Pırıl cümleleri |
| `feza.js` | FEZA | `fz*` | Feza animasyonu iyileştirme (koşu, zıplama, iniş, bekleme, yüz/saç/kıyafet detayı, ikincil hareketler) |
| `oyun.js, ortak.js, bolum.js, sahne.js, arayuz.js, index.html, sw.js, manifest` | CORE | — | bölüm geçişi + devam kaydı + final taşıma (aşağıda) |

## Çekirdek (CORE) sözleşmesi
- `BOLUM_NO` (1|2): `index.html`'de oyunun kodları yüklenmeden önce belirlenir: `?bolum=2` ya da cihazda kayıtlı ilerleme (`localStorage 'fezaIsikBolum'='2'`). Bölüm 2'de başlık/açılış sahnesi atlanır (kısa "devam" girişi: ekran yumuşakça açılır, Pırıl'ın cümlesi).
- Bölüm 1'de Işık Ağacı yanınca final YOK: kısa kutlama + ışık göğe yükselir + Pırıl cümlesi + yumuşak geçiş (ekran kararır) → kayıt `'fezaIsikBolum'='2'` → `?bolum=2` ile yeniden yükle. Sabah finali Bölüm 2'nin sonunda (`finaleGec()` mevcut akışı).
- Bölüm 2'de `bolum2.js` kendi `ROWS/COLS/grid/ground/plat/yuzey/nx/nesne/BOLUM/FLOWERS` karşılıklarını Bölüm 1'dekiyle AYNI adlarla ve aynı biçimde sağlar (CORE, Bölüm 1 `bolum.js` yalnız BOLUM_NO==1 iken çalışsın ya da paylaşılan adları bölüm seçsin; ikisi aynı sayfada çakışmasın — tasarımı CORE seçer ve SPEC'e yazar). `dunya.js` çizim fonksiyonları (`drawBackground drawMotes drawWorld drawPetals drawForeground drawVignette`) BOLUM_NO==2 iken `dunya2.js`'in `dn2Background dn2World dn2Foreground dn2Motes dn2Petals dn2Vignette` karşılıklarına yönlendirilir (CORE yönlendirme satırlarını dunya.js'in başına ekler; dunya.js'in başka kodlarına dokunma). Sayaçlar: `SAYAC.yildiz` (uyanan), `SAYAC.yildizTop`, olaylar: `OLAY 'yildiz'` {o}, `OLAY 'yildizYerlesti'`, `OLAY 'hayvanUyandi'`.
- Arayüz sayaçları Bölüm 2'de çiçek yerine yıldız, Pofuduk, tohum yerine kaplumbağa/şarkı değil — CORE `arayuz.js`'te yıldız simgesini ekler (Bölüm 1 sayaç stiliyle).
- Test bayrakları: `?sessiz`, `?atla`, `?bolum=2` (doğrudan Bölüm 2, açılışsız).

## Ortak kurallar
- Bölüm 1'in mevcut kalitesi/şıklığı/atmosferi referanstır (src/dunya.js, pofuduk.js'e bak). Korkutucu hiçbir şey yok, kaybetme yok, 5 yaş.
- Sayılar: ~12-15 yıldız (uyandırılacak), ~8 Pofuduk, 1-2 şarkı yeri, 1 yıldız hayvanı. Bölüm 5-10 dk.
- Performans: iPad'de 60 fps; büyük tuvalleri önbelleğe al, her karede ağır gradyan yaratma.
- GitHub'a ASLA gönderme. Test: scratchpad'e kopya + http.server + headless Chrome, URL'ye `?sessiz` ekle, kendi portun, `pkill` KULLANMA.
- Dosya sahipliği dışına çıkma; ihtiyaç varsa olay (`OLAY`) kullan ya da son raporunda CORE'dan iste. Eşzamanlı çalışılıyor: başka bir ajanın dosyası yarım olabilir, `?bolum=2` henüz çalışmıyorsa kendi test sayfanda kendi işlevlerini ayrı doğrula (stub).

## CORE kararı: bölüm seçimi (KESİN; LEVEL ve WORLD buna göre yazar)
- `index.html` en başta `var BOLUM_NO = 1|2` belirler (öncelik: `?bolum=N` > `localStorage 'fezaIsikBolum'` > 1) ve yalnız ŞUNLARDAN BİRİNİ yükler (`ortak.js`'ten hemen sonra, `document.write` ile aynı sırada):
  Bölüm 1 → `src/bolum.js`, Bölüm 2 → `src/bolum2.js`. İkisi aynı sayfada ASLA birlikte yüklenmez, bu yüzden `bolum2.js` AYNI üst-düzey adları serbestçe tanımlar.
- `dunya2.js` ve `yildiz.js` HER İKİ bölümde de yüklenir (ikisi de yalnız tanım yapmalı; yükleme anında `P/D/NESNELER` dışında bir şeye dokunmasın, Bölüm 1'i etkilemesin). `yildiz.js` tür kayıtlarını (`TUR.kaydet`) yükleme anında yapar; `bolum2.js` yüklendiğinde `yildiz.js` HENÜZ yüklenmemiştir (bolum2.js, yildiz.js'ten önce): `bolum2.js` yalnız `nesne(...)` ile VERİ üretir, yildiz.js'in fonksiyonlarını çağırmaz.
- `bolum2.js`'nin sağlaması gereken adlar (Bölüm 1 `bolum.js` ile birebir aynı biçim; `T, P, D, NESNELER` `ortak.js`'ten gelir):
  `const ROWS, COLS`; `grid` (ROWS adet `Uint8Array(COLS)`; 0 boş, 1 zemin, 2 üstten geçilen dal); `ground(a,b,h)`, `plat(a,b,row)`, `topOf(c)`, `cell(tx,ty)`, `yuzey(c)`, `nx(c)`, `nesne(tip,c,y,o)` (aynı imza: `id` otomatik, `x = nx(c)`);
  `BOLUM = { ad, baslangic:{x,y}, bolgeler:[{ad,x0,x1,ust?}], gol:{x0,x1,su,ada}, gollar:[...], kamera:[{x0,x1,zoom,yOfs}], ... }` (alan adları Bölüm 1'dekiyle aynı; gerçekten kullanılmayan alan boş/`null` olabilir ama `bolgeler`, `baslangic`, `gollar` (dizi, boş olabilir) VAR olmalı). Bölüm 2 yeni bölge adları: `'goletKiyi'`, `'yildizGol'`, `'ada'`, `'hayvan'` vb. serbest; `dunya2.js` bunları `BOLUM.bolgeler`'den okur (bilmediği adı güvenle geçer).
  `FLOWERS` (= `cicek` nesneleri; Bölüm 2'de boş dizi olabilir), `TREE` (Bölüm 2'de `null` olabilir: `TREE` kullanan kodlar null-güvenli olmalı; CORE `oyun.js` null-güvenli yapar). Ek: `BOLUM.yildizHayvan = {x,y}` (hayvanın merkezi; kamera/geçiş için, opsiyonel).
  `P.x = P.safeX = BOLUM.baslangic.x; P.y = P.safeY = BOLUM.baslangic.y; D.x = P.x - 40; D.y = P.y - 100;` bolum2.js'in sonunda yapılır (Bölüm 1 gibi).
  Su: Bölüm 1'de `BL_SU` (y=730) göl yüzeyi. Bölüm 2 su seviyesini `BOLUM.gol.su` / `BOLUM.gollar[i].su` verir; `oyun.js` düşme kontrolü `BOLUM.gollar`'ı dolaşır (Bölüm 1 gibi), WORLD da aynı alanı okur.
- `nesne('yildiz', c, y, {r, ...})`: uyandırılacak sönük yıldız (LEVEL'in `yildiz.js` türü). Uyanınca: `SAYAC.yildiz++` CORE'un işi DEĞİL, `yildiz.js` yalnız `OLAY.emit('yildiz', o)` yayınlar (CORE `oyun.js` bu olayı dinleyip sayacı artırır, `o.done=true` yine `yildiz.js` koyar). Gökyüzüne yerleşme bittiğinde `yildiz.js` `OLAY.emit('yildizYerlesti', o)` yayınlar.
- `yildizTop`: CORE, `NESNELER`'deki `tip==='yildiz'` sayısını yükleme sonrası sayar (`SAYAC.yildizTop`).
- `yildizHayvan` türü (LEVEL): son yıldız(lar) uyanıp gökyüzü dolunca ya da hayvan uyanınca `OLAY.emit('hayvanUyandi', o)` yayınlar. CORE bu olaydan ~3 sn sonra `finaleGec()` çağırır (LEVEL ayrıca bir şey yapmasın; hayvanın "Feza'yı göğe zıplatma" animasyonu bittikten sonra olay yayınlansın, yani olay = animasyonun SONU).
- `HEDEF()` (CORE): Bölüm 2'de önce uyanmamış en yakın `yildiz`, hepsi uyandıysa `yildizHayvan`; LEVEL nesnelerde `o.done=true` (yıldız) ve `o.uyandi=true` (hayvan) koymalıdır.
- `nesne('konusma', c, y, {anahtar:'y_...', r, gec, konu})` Bölüm 1'deki gibi; anahtarlar SES ajanının `ses.js`'ine eklediği Bölüm 2 cümleleri.
- `dunya2.js` (WORLD) fonksiyon imzaları `dunya.js`'inkilerle aynı: `dn2Background(tm)`, `dn2World(tm)`, `dn2Foreground(tm)`, `dn2Motes(tm, zMin, zMax)`, `dn2Petals(tm)`, `dn2Vignette(tm)` (bire bir `drawBackground(tm)` vb. ile aynı parametreler; dunya.js başındaki yönlendirme parametreleri olduğu gibi iletir). Gökyüzü doluluk oranı: `SAYAC.yildiz / Math.max(1, SAYAC.yildizTop)`.
- Yönlendirme: `BOLUM_NO===2` iken `dunya.js` `draw*` fonksiyonları `typeof dn2X==='function'` ise onları çağırır, yoksa güvenli boş geri dönüş (Bölüm 2 arka planı `#0b1a33` düz dolgu).
- Geçiş olayları (CORE): Bölüm 1 sonunda `OLAY 'bolumGecis'`; Bölüm 2'de açılışta `OLAY 'bolum2Basla'`. Pırıl cümleleri: `p_gecis` (Bölüm 1 sonu, ~4 sn; ayrıca `a_y_final1..3` Bölüm 2 final anlatıcısı), `p_y_giris` (Bölüm 2 girişi): SES ajanı ses.js'e ekler.
- Final anlatımı (CORE yaptı): Bölüm 2'de `sahne.js` finalde `a_final1/2/3` yerine ses.js'te `a_y_final1/2/3` anahtarları VARSA onları söyler (yoksa Bölüm 1 metni; ama a_final1 "Işık Ağacı'nı yeniden parlatmışlar" der, Bölüm 2 için uygunsuz). SES ajanı: `a_y_final1` (yıldızlar/Yıldız Kaplumbağası/Pofuduklar sevinçle dans etmiş), `a_y_final2` (sabah, Feza yatağında gözlerini açmış, Pırıl göz kırpmış), `a_y_final3` ("Ve her gece, yeni bir macera onları bekliyordu...") ekleyip kaydetmeli.
- Geçiş süresi (CORE): Bölüm 1 ağaç → ~2 sn kutlama, `p_gecis` (şu an 6,6 sn) → kararma → yeniden yükleme (toplam ≈ 12 sn). `p_gecis` 4 sn'nin altına inerse geçiş de kısalır (süre `SES.sure('p_gecis')` ile ayarlanır).
- Test: `?bolum=1` Bölüm 1'i zorlar (kayıt olsa bile); `?nogecis` yalnız test: Bölüm 1 geçişinde yeniden yüklemeyi durdurur; `OYUN.bolum`, `OYUN.bolumGecisi()` test kancaları. Başlık ekranı: kayıtlı ilerleme varsa Bölüm 2 ile açılır (aynı başlık, dokununca Bölüm 2 "devam" girişi: ekran açılır + `p_y_giris`); geçiş sonrası yeniden yüklemede başlık atlanır (`sessionStorage 'fezaGecis'`).

## LEVEL notları (bolum2.js + yildiz.js) — LEVEL ajanı yazdı
- Konuşma anahtarları (SES ajanı `p_` önekiyle ekler: `p_y_gol`, `p_y_yildiz`, `p_y_pofuduk`, `p_y_hayvan`): `y_yildiz` (patikada ilk sönük yıldızdan ~7 kare önce), `y_gol` (kıyıda, göle girmeden), `y_pofuduk` (Pofuduk kıyısı girişi, uyuyan Pofuduk'tan önce), `y_hayvan` (kaplumbağa kıyısı, kaplumbağa ekranda). Şarkı cümleleri `p_sarki1..3` mevcut.
- Nesne türleri: `yildiz` (sönük yıldız; `o.birikinti` → tümsekte su birikintisi; `o.buyukIcin`/`o.nok` → kaplumbağanın sırtındaki 3 noktayı yakar), `yildizTasi` (suyun üstünde basılan taş; önceki taşa basılınca belirir, sıradaki silik görünür; `zincir`/`sira`), `yildizAda` (yüzen ada, tek yönlü), `yildizBas` (kaplumbağanın başı, katı), `yildizHayvan` (dev Yıldız Kaplumbağası). Ayrıca `pofuduk` (yol/minder/basamak) ve `sarki` (2 yer) Bölüm 1'deki türlerdir.
- `YILDIZLAR` (genel dizi, yildiz.js): `{x,y (0..1 ekran oranı), renk (#rrggbb), boyut (yarıçap, dünya birimi), uyandi (gökte yerleşti), t (yerleşme anı = now), ucuyor, o}`; gökyüzü takımyıldızı bir KAPLUMBAĞA (14 yıldız). `uyandi` yerleşme anında true olur: o ana dek uçan yıldızı yildiz.js çizer, ardından dunya2.js gökte çizer (kalıcı). Yerleşme `OLAY 'yildizYerlesti'`.
- Hayvan olayları: `hayvanAsama` {o, asama 1..3} (her büyük yıldız sırta varınca), `hayvanHazir` (kabuğu zıplatıcı oldu), `hayvanFirlat` (Feza göğe fırlatıldı; AYNI ANDA kalan bütün uyanmamış yıldızlar dalga halinde göğe yükselir), `hayvanUyandi` (animasyonun SONU: o.uyandi=true; CORE finale'yi buradan ~3 sn sonra başlatır). `YILDIZLAR` hepsi `uyandi` olduktan sonra yayınlanır (en geç 12 sn).
- Ses efektleri (AU.sfx adları; yoksa sessiz geçilir): `yildizUyan`(v=renk 0..4) `yildizYuksel` `yildizYerles` `yildizTasBelir`(v=sıra) `yildizTas`(v=sıra: zincirde yükselen nota) `hayvanAsama`(v=1..3) `hayvanUyan` `hayvanFirlat` `hayvanUyandi`.
- Bölge adları (BOLUM.bolgeler): `patika`, `goletKiyi`, `yildizGol` (iki göl), `pofuduk`, `hayvan`. Göl yüzeyi y=730 (`BOLUM.gollar`); taşlar/adalar y≈640–720 arası.
- `HEDEF()` için: `yildiz.done` (dokununca), `yildizHayvan.uyandi` (fırlatma bitince); yıldızların `o.x,o.y` merkezi. Hayvan hazır olunca (`o.hazir`) hâlâ `uyandi=false` (Pırıl sırtına çıkmayı göstermeye devam edebilir).
- Çizim yönlendirmesi dunya.js'te DEĞİL, `oyun.js` içinde (`omDr`): BOLUM_NO==2 iken kare başına `dn2Background/World/Foreground/Motes/Petals/Vignette` çağrı anında çözülür. WORLD `dunya2.js`'e `drawBackground = ...` gibi atama EKLEMEMELİ (const/function yeniden atama gerekmez); dunya.js'e dokunulmadı.
- İsteğe bağlı (zor) yıldızlar: `o.secmeli=true` (3 tane: minderle çıkılan yüksek taş/dal üstünde). CORE'dan istek: `omHedefMi`/`HEDEF` ve hayvan hedef koşulunda (`NESNELER.some(n=>n.tip==='yildiz'&&!n.done)`) `secmeli` yıldızları SAYMASIN (yoksa Pırıl en sonda çocuğu geriye, zor yıldızlara çağırır; hayvan hedef olmaz). Hayvan fırlatınca kalan bütün yıldızlar zaten göğe yükselir.
- (LEVEL güncelleme) Bölüm ~535 sütun: göl III (396–426) + Yıldız Çayırı (tohumlar, Pofuduk) eklendi; kaplumbağa sütun ~502'de (BOLUM.yildizHayvan). Taşlar 132 geniş / 168 aralık (geç zıplayan bot 1 düşme). Hayvan kabuğu uyanınca 108 birime çöker (zemin 3 kare zıplamayla çıkılır).
- Kamera API (CORE, oyun.js; LEVEL için): `omDikkat(ad, sureSn, fn, guc, zMin)` + `omDkEkle(x0, y0, x1, y1)` (dünya koordinatı kutu). `fn` her karede çağrılır, kutuya Feza zaten dahildir; kutuyu `omDkEkle` ile büyüt (ör. gökyüzüne doğru `y0` küçült). `guc` (0..1): daha yüksek güçlü bir dikkat sürerken düşük güçlü olan reddedilir (benim 'gok' dikkatim 0.55, hayvan sahnesi 1 olmalı: çakışma yok). `zMin`: en fazla ne kadar uzaklaşılsın (varsayılan 0.66; dalganın göğe yayılmasını göstermek için `ylFirlat`'ta 0.5 ver; küçük sayı = daha geniş görüş). Aynı `ad` yeniden çağrılırsa süre/kutu güncellenir. Kamera Feza'yı ekranda tutar (kutu sığmazsa özne öncelikli).

## Tur 2 (14:30 sonrası) — iş bölümü
- MINI (`src/takim.js` + bolum2.js'te yalnız `sarki` nesnelerini kaldırıp `nesne('takim', ...)` yerleştirme): "Takımyıldızı çiz" mini oyunu (sürükleyerek noktaları birleştir). Bölüm 2'de şarkı etkinliği YOK (Bölüm 1'de kalır).
- LEVEL (`src/yildiz.js`; bolum2.js'e DOKUNMA): Yıldız Kaplumbağası modeli + animasyonu baştan.
- FEZA (`feza.js`) + WORLD (`dunya2.js`): Feza'nın seçilebilirliği (hare, dış çizgi, çevresinde sadeleştirme).
- CORE (`oyun.js`, `sahne.js`, `arayuz.js`): Bölüm 1→2 geçiş animasyonu/görüntüleri; takim mini oyunu için gerekli girdi yakalama (pointer capture) varsa.
- SES (`muzik.js`, `ses.js`, `gen_voice.py`, `sesler.js`): takim mini oyunu sesleri + Pırıl cümleleri; kaplumbağa sesleri yeni animasyona uyum.
- Geçiş sinematiği (CORE, oyun.js): `OLAY 'bolumGecis'` (u=0, ağaç yandı) → `'gecisAsama' {ad}`: 'dalga' (u≈1) · 'yukselis' (u≈2,4: ışık küreleri göğe, gece örtüsü ve sönük noktalar) · 'kayan' (u≈8,4: kayan yıldız göle, ~2 sn, göle düşüş u≈10,4) · 'kararma' (u≈10,8: ekran kararır) → yeniden yükleme (u≈13,4). Bölüm 2 açılışı: 'bolum2Basla' + 'gecisAsama' {ad:'acilis'}: 0,6 sn tam karanlık, ışık taneleri Feza ve Pırıl'da toplanır, kamera suyun üstünden kıyıya iner, 'p_y_giris' ≈2,4 sn. `p_gecis` 4 sn'den uzunsa kayan yıldız gecikir. Test: `?nogecis`, `OYUN.bolumGecisi()`.

## MINI notları (takim.js + bolum2.js)
- Takımyıldızı çiz: `nesne('takim', c, y, {sekil:0|1|2})` (3 yer: sütun 191.5, ada C x=9700, sütun 298.5). Ses: AU.sfx 'takimBelir' · 'takimNota'(v=0..7) · 'takimBitti' · 'takimYanlis'; Pırıl p_takim1/2/3. piril.js'te yalnız 'takim' modu dalı. SAYAC'a dokunmaz; Bölüm 2'de şarkı nesnesi yok.
- Su üstü atlayışları kolaylaştırıldı (bolum2.js): taş zincirleri `blZ(zincir, L, R, ys)` ile iki sabit kenar arasına eşit boşlukla (≈12-24 birim) dizilir; adalar geniş (300-340); yükselti farkı ≤ 1 kare. QA (sweep tr=-30..60, geç/erken botlar, 14/14 yıldız, final): 0 düşme.
- LEVEL'e istek (yildiz.js): (a) taş çarpışma genişliği 132 sabit; 150-160'a çıkarılabilir (YL_TAS_W/sprite ile birlikte). (b) `ylTasGuncelle` yedek açılma yarıçapı `dx < 112` → ~150 (sıradaki taş Feza öncekinin kenarına gelince kesin belirsin).

## Tur 3 — "Her gece başka bir rüya" biçimi (2 bölümle başlar; sonra 5'e genişler)
Ebeveyn kararı: bölümler ayrı ayrı oynanır; her bölüm bir GECE/RÜYA: Feza yatar, Pırıl parlar, rüya (bölüm) oynanır, bölüm bitince SABAH yatağında uyanır. Bir sonraki gece başka rüya.
- **Seçim ekranı = başlık ekranı:** gece yatak odası (mevcut oda sahnesi: sahne.js), Feza yatakta, Pırıl yanında parlıyor, üstte/yanda ışıklı "rüya baloncukları" (şimdi 2: Işık Ormanı, Yıldız Gölü; liste yapısı 5'e kadar genişleyebilmeli, düzen otomatik). Pırıl sesle "Bu gece nereye gidelim?" (p_secim). Kilit YOK, hepsi açık. Tamamlanan rüyanın baloncuğunda küçük altın yıldız; oynanmamış baloncuk hafif parlar; son oynanan vurgulu. Yazı yok.
- **Rüya seçilince:** kısa uyku girişi (Bölüm 1: mevcut giriş sahnesi, daha önce izlendiyse atla düğmesi; Bölüm 2: ~10-15 sn kısa yatış: Feza gözlerini kapatır, Pırıl parlar, oda erir, göl kıyısına) → bölüm.
- **Bölüm bitince:** SABAH finali (Bölüm 1: ağaç yanışı kısa kutlama → mevcut sabah finali; Bölüm 2: mevcut a_y_final sabah finali) → sonuç kartı (yıldız/Pofuduk) → "tekrar/odaya dön" simgesi: seçim ekranına (başlık sayfası) dönüş. Bölüm 1→2 sinematik geçişi KALDIRILIR (reload'suz; kısa ışık-küre yükselişi bölüm sonu kutlamasında kalabilir).
- **Kayıt:** localStorage 'fezaIsikTamam' = JSON dizi (tamamlanan bölüm numaraları, ör. [1,2]; sabah finaline ulaşınca eklenir), 'fezaIsikSon' son oynanan. Eski anahtarlar ('fezaIsikBitti1', 'fezaIsikBolum'=2) → göç: tamam sayılır. Seçim bölüm sayfası: Bölüm 1 sayfası (başlık her zaman Bölüm 1 kodu); Bölüm 2 seçilince sessionStorage bayrağıyla yenileme (mevcut mekanizma, ekran koyu, görünmez).
- **İş bölümü:** SAHNE ajanı (sahne.js): seçim sahnesi `SAHNE.secim(...)`, kısa uyku girişi (giris sahnesi 'kisa' kipi), bölüm sabah bitişleri; CORE (oyun.js, arayuz.js, index.html, sw.js): akış, kayıt, başlık düğmelerinin kaldırılması, bölüm sonu akışı; SES: p_secim, kısa uyku girişi cümlesi (Bölüm 2: 'p_y_uyku'), seçim ekranı müziği (ninni).

### SES — Tur 3 (seçim ekranı / uyku girişi)
- `AU.sfx` adları (ve aynı adlı `OLAY`lar dinlenir): `'secim'` (baloncuğa dokunuş; v=baloncuk sırası 0..4 ya da `OLAY.emit('secim',{i})`), `'ruyayaGec'` (seçilen baloncuk rüyaya akarken, ~1.1 sn yükselen ışıltı), `'yildizRozet'` (tamamlanan baloncukta altın yıldız belirirken). `bolumGecis`/`bolum2Basla` sesleri kalır ama çağrılmaz.
- Cümleler: `p_secim` "Bu gece nereye gidelim?" — ses.js kendisi söyler: DURUM 'baslik' olunca 1,4 sn sonra 1 kez; sonra yalnızca ~25 sn hiç `OLAY 'secim'`/`AU.sfx('secim')` gelmezse 1 kez daha (dokunuşlarda `OLAY.emit('secim')` yayınlayın ki sayaç sıfırlansın). `p_y_uyku` "Bu gece yıldızlara gidiyoruz!" — Bölüm 2 kısa uyku girişinde `SES.soyle('p_y_uyku')` (sahne cümlesi: DURUM 'giris'te de çalar). İkisi de öncelik 3. `p_gecis` kayıtlı kalır.
- Müzik: DURUM 'baslik' ve 'giris' → ninni (aynı ana tema, kesintisiz); Bölüm 2 'oyun' → ninni yumuşakça 'yildiz' müziğine geçer. Bölüm 1 sabah finali (a_final1-3, final müziği → ninni) Bölüm 1 sayfasında aynen.

## SAHNE-CORE arayüzü (SAHNE ajanı yazdı, src/sahne.js)
- `SAHNE.secim(secenekler, onSec)`: DURUM 'baslik' iken çağır. `secenekler = [{id, tamam:bool, son:bool, ikon:'orman'|'gol'|'bulut'|'deniz'|'dag'}]` (en çok 5; yerleşim otomatik, yatay/dikey). Sahne kendi başlığını ("Feza ve Pırıl" + "Her gece başka bir rüya"), baloncukları, rozetleri çizer; `SAHNE.tamEkran()` seçim boyunca true (dünya çizilmez). Dokunuşu sahne KENDİ yakalar (canvas'a kendi `pointerdown` dinleyicisi); CORE'un baslik dalında `begin()`/`ARAYUZ.baslikDugme` çağrısını kaldırması yeter (ebeveyn köşe basılı tutma kalabilir). Boş dokunuş bir şey yapmaz. Dışarıdan da tetiklenebilir: `SAHNE.secimDokun(clientX, clientY)` (bool döner).
- Dokununca: `OLAY 'secim' {id}`, `AU.sfx('secim', sıra)`, `OLAY 'ruyayaGec' {id}` + `AU.sfx('ruyayaGec')`; 1 sn'lik akış (balon büyür, ışık dolar, ekran lacivert kararır) sonra `onSec(id)`. Rozet belirirken `AU.sfx('yildizRozet')`. `OLAY 'sahneAn' {ad:'ruyayaGec'}` da yayınlanır.
- `onSec` çağrıldığında ekran tam lacivert-siyah (rgb 4,5,14). Hemen ardından `SAHNE.giris(...)` çağrılırsa (sahne kipi 'secim' iken) giriş tam karanlıktan başlar (süreklilik). Bölüm 2'de sayfa yeniden yükleniyorsa ekran koyu başlatılmalı.
- `SAHNE.giris(bitince, {bolum:N, kisa:bool})`: `kisa` verilmezse bolum>=2 ise kısa. Kısa: ~13 sn (karanlıktan açılır, Feza gözlerini kapatır, `SES.soyle('p_y_uyku')` ≈1,8. sn'de, Pırıl uyanıp parlar, oda gece göl fonuna erir, sonda ekran lacivert kararır, `bitince` ekran tamamen koyuyken çağrılır). Kısa girişte atla düğmesi yok; `fezaIsikGiris` yazılmaz. Bölüm 1 (kisa:false): eski tam giriş + atla düğmesi.
- `SAHNE.final(bitince, {bolum:N})`: N>=2 ise anlatıcı `a_y_final1..3` (varsa); sahne yapısı aynı. Bitişte `sonGorunum` eskisi gibi; seçim ekranına dönüş için tekrar `SAHNE.secim(...)` çağır (sabah kopyaları serbest bırakılır).
- Not: dar (dikey) ekranda oda 12 birim sağa kaydırıldı (yatak tam görünsün); yalnız sahne.js içinde, dışarıya etkisi yok.

## dn2Isit() (WORLD, dunya2.js)
`dn2Isit()`: gökyüzü, uzak katmanlar, ön plan, ilk zemin parçaları ve süs sprite'larını kare başına tek küçük adımla hazırlar; bitince `true` döner (idempotent; tuval hazır değilse `false`). CORE seçim ekranında / kısa devam girişinde her karede çağırabilir (`typeof dn2Isit==='function'` ile koru).
- MINI (cila): takim ilk seferde ışık izi, p_takim2 bitmeden ~1,5 sn önce uçuşa geçer (toplam bekleme ≈ 4,5 sn); cümleler kısaltılırsa daha da erken başlar (SES'ten istek yok). Çizgi, bağlı herhangi bir noktadan devam eder. İlk yıldız sütun 11.5'e alındı (dikey iPad'de de ilk ekranda).

### SES — Yatak odası (akşam/sabah) ve tam anahtar listesi (SES ajanı, son tur)
- **AU.sfx adları ve aynı adlı OLAY'lar** (çok hafif katmanlar): akşam `yatagaGir` (kumaş/yorgan hışırtısı) · `yastik` (yumuşak "pof") · `lambaKis` (gece lambası, iki alçalan çan) · `uykuNefes` (yavaş ritmik uyku pad'i); sabah `sabahKus` (v=sıra 0,1,2…: her seferinde farklı 2–3 ıslık; ışık doldukça artan sırayla çağırın) · `gerinme` (yükselen üç nota) · `fezaEsne` (hafif nefes; `esneme` Büyük Pofuduk'un, onu kullanmayın) · `gozKirp` (tek çelesta notası).
- **`OLAY 'sahneAn'` adları** (shAn) zaten sese bağlı: `uyudu piril_uyandi eriyor orman ic_cek isik sabah goz_kirp` (eski) + yeni: `feza_uyan` (esneme+gerinme) · `feza_uyandi` (sıcak majör çiçeği) · `feza_bakti` (tek çan) · `oda` (ışık dolarken sıcak akor) · `ruyayaGec`. `kutlama beyaz son_soz` için ayrı ses yok (final müziği çalıyor).
- **Pırıl/anlatıcı anahtarları (kullanımda):** Bölüm 1: `p_uyan p_merhaba p_zipla p_cicek_ilk p_uyuyor p_uyandi p_karanlik(2) p_nilufer(2) p_minder p_ciftzipla p_sakli p_tohum p_buyuk(_goz/_esne/_kalk) p_agac p_sarki1-3 p_yol p_kurtar p_yardim1-2 p_aferin1-9 a_giris1-3 a_final1-3`. Bölüm 2: `p_y_giris p_y_gol p_y_yildiz p_y_yildiz2 p_y_pofuduk p_y_hayvan p_y_hayvan_uyan p_y_bitti p_y_uyku p_takim1-3 a_y_final1-3 p_secim` (+ `p_aferin`). `p_takim1` "Yıldızları birleştirelim!" (1.7 sn), `p_takim2` "Beni izle." (1.0 sn).
- **Kullanılmayan (silinmedi):** `p_gecis`, `p_y_sarki` (Bölüm 2'de şarkı yok; `p_sarki1`→`p_y_sarki` eşlemesi kalır), `AU.sfx('bolumGecis')`, `'bolum2Basla'`, Bölüm 2'de `sarki*` efektleri.
- **Boyut:** sesler.js ≈1.8 MB (59 satır, 232 sn; mono 24 kHz 48 kbps mp3, base64). İstenirse (yeniden üretilmedi): bit hızı 48→32 kbps ≈ −%33 (~0.6 MB), ya da kullanılmayan `p_gecis`/`p_y_sarki` (~9 sn) çıkarılır. Pırıl satırlarında 32 kbps tizleri biraz matlaştırır; dinleyerek karar verilmeli.

## feza.js notu (FEZA ajanı)
- `fezaCizPoz` API aynı. Yeni davranış (parametre yok, tm'e bağlı): `uykuya_dalis` ~2,75–3,9 sn arası dudaklarda kısa "mırıltı"; `uyanis` tm>4,6 sn'den sonra göz bebeklerinde sabah parlaması (`fzQ.a_shine`).
- Oyun içi `drawFeza`: hâle + kontur + Bölüm 2 şeftali ton; `drawFezaKontur()` oyun.js'ten çağrılır. fezaCizPoz bu ton/kontur katmanlarını kullanmaz. Bölüm 2 koyu saç yalnız oyun içi drawFeza'da; fezaCizPoz her iki bölümde orijinal saç tonunu kullanır (tutarlı). Işığa göre ten tonu için `isik` parametresi henüz eklenmedi.
- CORE → SES: seçim ekranında her dokunuşta (baloncuğa değmese de) `OLAY 'secimIlgi' {x,y}` yayınlanır (ses.js `p_secim` hatırlatma zamanlayıcısını bu olayla sıfırlayabilir). CORE → WORLD: Bölüm 2 sayfasında `dn2Isit()` her karede (bitene kadar) `oyun.js` `frame()` içinde çağrılır; seçim ekranı Bölüm 1 sayfasında olduğundan Bölüm 2 önbellekleri yalnız yeniden yüklenen Bölüm 2 sayfasında (karanlık perde/kısa uyku altında) ısıtılır.

## PIRIL notları — peluş pozları (`pirilCizPoz(ctx, x, y, olcek, poz, tm, u)`; adlar/parametreler geriye uyumlu)
- Mevcut: `'pelus'` (uyuyan peluş), `'uyaniyor'` (u 0→1: gözler açılır, ışık/kanat belirir), `'goz_kirp'`, `'ucus'`. Hepsi artık peluşken (D.plush>0) KUMAŞ DOKUSU çizer: kafada alın dikişi, karın altı dikişi, kadife parlaması; peluş nefes alır (çok hafif ölçek).
- YENİ `'sabah'` (u 0→1): canlı/ışıklı Pırıl → peluş (parıltı söner, kanatlar solar, gözler kapanır; `'uyaniyor'`un tersi). Sabah finalinde Feza uyanırken Pırıl'ı bununla peluşa döndürüp `'pelus'`/`'goz_kirp'` ile bitirin.
- YENİ `'pelus_sik'` (u = sıkma 0..1, verilmezse 0.7): Feza'nın kolunda hafif ezilmiş peluş (yatay genişler, dikey kısalır, hafif eğilir). Akşam sarılırken `'pelus'` yerine kullanılabilir.
- Hepsinde `u` opsiyonel; bilinmeyen `poz` adı `'pelus'` gibi çizilir.

# YATAK notları (YATAK ajanı; SAHNE ajanı okuyacak)
- **Yeni poz `'yatagaGir'`**: `fezaCizPoz(ctx, x, y, olcek, 'yatagaGir', tm, ara, opt)`; x,y = 'uyku' ile AYNI yatak noktası. Süre `FZ_GIR_SURE` = 4.4 sn
  (feza.js'te; `tm >= 4.4` iken görüntü `'uykuya_dalis'` tm=0 ile birebir aynı, sıçrama yok → 4.4 sn'de pozu 'uykuya_dalis' tm=0'a geçir).
  Aşamalar: 0–0.9 ayakta (gülümseyen, 'ayakta' ile aynı duruş; 0.3–0.9 küçük esneme) · 0.9–1.9 yatağın kenarına oturur (bacaklar bükülür, eller yatağa) ·
  1.9–3.4 yana uzanır (baş yastığa, eller Pırıl'ı saracak uyku konumuna) · 3.4–4.4 yerleşir, kapaklar ağırlaşır.
- Ayakta başlangıç konumu: yatak noktasına göre (oyun birimi ×olcek×1.4 piksel) dikeyde `opt.gy` (vars. 11) AŞAĞIDA (zemin), yatayda `opt.gx` (vars. 8) sağda
  — yani ayaklar yatak yüzeyinin ~15 birim altında (zemin); sahne yatak çerçevesini/battaniyeyi Feza'dan SONRA çizerse alt kısım örtülür. Sahne zemin yüksekliğine göre `opt = {gx, gy}` verebilir.
- `ara` (Pırıl peluşu) bu pozda ÇAĞRILMAZ (peluş yatakta/odada ayrı çizilsin); `ara` verilirse yok sayılır.
- fezaCizPoz'a 8. parametre `opt` eklendi (isteğe bağlı); eski çağrılar aynen çalışır.
- **Yatış pozlarında yeni çizimler (API değişmedi):** yastığa yayılan saç tutamları + basık yanak (`fzYastikArka`, yalnız lie>0), uykuya dalarken gözbebeği ışık yansıması sönümü
  (`a_dim`), 'uyanis'e: 0–0.55 sn kıpırdanma (kaş, baş), 3.85–4.2 sn göz yarı aralanıp kapanıp tekrar açılma.
- **Işık tonu:** `fezaCizPoz(..., opt)` içinde `opt.isik` (-1 gece, +1 sabah, 0 kapalı; verilmezse uyku/uykuya_dalis/bakis/yatagaGir = gece, uyanis/sarilma = sabah) ve
  gece için `opt.lamp = {x, y}` (ekran/ctx pikseli; gece lambası kenar ışığının merkezi; yoksa sağ üst). Küçük önbellekli ara tuval kullanır (yalnız Feza bölgesi, tuval sınırına kırpılır).
  SAHNE: lamba konumunu `opt.lamp` ile verirsen sıcak kenar ışığı lambaya göre düşer. Yorgan (`shBattaniye`) Feza'dan sonra çizildiği için omuz/kol örtüsü sahnede; nefes fazı
  Feza'da sin(tm*1.5) (≈4.2 sn) — battaniye de aynı fazı kullanıyor, senkron kalsın.
- Feza yüksek çözünürlükte vektör olarak doğrudan sahne tuvaline çizilir (pikselleşme yok).
- 'uyanis' ilk 1.15 sn: 0.4–1.15 sn yorgan itme (eller yukarı-geri, omuz kalkar), 0–1 sn ayak ucu kıpırtısı (bacak açısı salınır). SAHNE yorgan katmanını bu pencerede (tm 0.4–1.15) hafif yukarı/geri hareket ettirirse el-yorgan uyumu tamam olur.
- SAHNE'ye uyarı: akşam girişinde (`?sessiz&bolum=2&uyku` ve `?sessiz&bolum=2`) her karede `shPerdeler` (sahne.js:552) "addColorStop 'rgba(NaN,49,98,1)'" hatası veriyor ve oda (yatak, Feza) hiç çizilmiyor; boş oda görünüyor. Feza kodundan değil, perde renk karışımından (p.curtain / mixc) geliyor.

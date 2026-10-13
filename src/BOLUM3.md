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
| `oyun.js`, `ortak.js`, `arayuz.js`, `index.html`, `sw.js`, `bolum.js`, `bolum2.js` | CORE | `om*`, `ui*` | Bölüm 3 tesisatı (aşağıda) |

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

# Feza ve Pırıl: Işık Ormanı ✨🐉

5 yaşındaki Feza için yapılmış, Ori havasında (biraz da Gris) iki boyutlu, büyülü bir platform macerası.
Bir gece Feza uyku arkadaşı Pırıl'a sarılıp uyur; Pırıl'ın gözleri açılır, oda yavaş yavaş Işık Ormanı'na dönüşür.
Ormanın ışığı sönmüş, tüylü dostlar Pofuduklar uykuya dalmıştır. Feza ile Pırıl ışık çiçeklerini açar, Pofudukları uyandırır,
Büyük Pofuduk'u neşelendirir ve Işık Ağacı'nı yeniden parlatır. Sabah Feza yatağında uyanır; Pırıl ona göz kırpar.
Korkutucu hiçbir şey yoktur, kaybetmek yoktur. Feza okuma bilmediği için her şey Pırıl'ın sesiyle ve ışıklı ipuçlarıyla anlatılır.

**Her gece başka bir rüya:** oyun açılınca Feza yatağında uyurken Pırıl'ın yanında rüya baloncukları belirir; Feza birine dokunur:
1. **Işık Ormanı** (gece) — ışık çiçekleri, Pofuduklar, ışık şarkısı, Işık Ağacı.
2. **Yıldız Gölü** (yıldızlı gece) — göle düşen yıldızlar göğe döner, takımyıldızı çizilir, Yıldız Kaplumbağası uyanır.
3. **Bulut Ülkesi** (gün doğumu) — renklerini kaybetmiş 7 Bulut Kuzucuğuna sarılıp gökkuşağını geri getirmek,
   zıplatan bulutlar, rüzgâr akımları, Bulut Kuşu, "Bulutlarda ne var?" (bulutu ovunca hayvan çıkar),
   Pırıl'ın sırtında uçuş ve gökkuşağından kayarak iniş.
Her rüya sabah Feza'nın yatağında uyanmasıyla biter; tamamlanan rüyanın baloncuğunda altın yıldız çıkar.

## Hikâye notu: Pofuduklar

Pofuduklar ormanın ışığını karınlarında taşıyan tüylü orman dostlarıdır. Orman karanlığa gömülünce onların karnındaki ışık da sönmüş ve uykuya dalmışlar.
Üstlerine zıplamak onları gıdıklayıp ışıklarını uyandırır: hapşırırlar, karınları parlar, çevrelerindeki mantarlar ve bitkiler renklenir, Feza'nın peşine takılıp ışığı birlikte taşırlar.
Bazıları çok derin uyur; onlar yalnızca "ışık şarkısı"yla (şarkı çiçeklerinin ninnisi) uyanır. Büyük Pofuduk hepsinin büyüğü ve Işık Ağacı'nın bekçisidir; o uyanınca ağaç yanar.

## Nasıl açılır

- **Bilgisayarda:** `index.html` dosyasına çift tıkla.
- **İnternette:** (GitHub'a gönderilince) https://goktugkarpat.github.io/feza-isik-ormani/
- **iPad'de:** Safari ile oyun adresini açıp Paylaş › **Ana Ekrana Ekle** de. İlk açılıştan sonra internet olmadan da oynanır.
- **GitHub'a göndermek:** `yayinla.command` dosyasına çift tıkla (ilk seferde depoyu ve sayfayı kendisi açar).

## Nasıl oynanır

- **Yürümek:** ekranın herhangi bir yerine parmağını koyup tut; Feza o tarafa yürür. Parmak yakınsa yavaş, uzaksa koşar.
- **Zıplamak:** sol alttaki yuvarlak düğmeye bas. Havadayken bir daha basınca Pırıl Feza'yı yukarı iter.
- **Işık çiçekleri:** Feza dokununca açılır, orman renklenir. Pırıl karanlık göllere ışık üfler, nilüfer yaprakları çıkar.
- **Pofuduklar:** uyuyan Pofuduğun üstüne zıplayınca hapşırıp uyanır ve Feza'nın peşine takılır; bazıları zıplatma minderi ya da basamak olur.
- **Takılırsa:** Pırıl yolu gösterir; suya düşerse ya da bir yerde zorlanırsa Pırıl onu taşır.
- **Saklı yol:** dalların üstünde parlayan yaprak kemerinin ardında 3 ışık tohumu saklıdır.
- Klavye (ebeveyn için): **oklar / A–D** yürür, **Boşluk / W / ↑** zıplar.

Sessiz açmak için adrese `?sessiz` ekle; açılışı atlamak için `?atla`, altyazı için `?altyazi`.

## Her gece başka bir rüya (Bölüm 1 ve 2)

Oyun iki ayrı rüyadan oluşur: **Işık Ormanı** ve **Yıldız Gölü**. Açılışta Feza'nın yatağı görünür (seçim sahnesi); Feza hangi rüyaya gitmek istediğini seçer.
Her rüya sabah finaliyle biter (Feza yatağında uyanır) ve sonuç kartındaki yatak simgesi seçim ekranına geri götürür. Bitirilen rüyalar cihazda saklanır, kilit yoktur.
Yıldız Gölü'nde gökyüzündeki yıldızlar göle düşmüştür: Feza sönük yıldızları uyandırır, Pofuduklar yardım eder, en sonda Yıldız Kaplumbağası uyanır.

- **Test:** adrese `?bolum=1` ya da `?bolum=2` ekle (seçim ekranını ve kısa uykuyu atlar; `?uyku` kısa uykuyu zorlar); `?atla` seçim ekranını da atlar; `?nogecis` eski test bayrağı.
- **Ebeveyn:** seçim ekranında sol üst köşeye 3 sn basılı tut = kayıtları sıfırla.
- Kayıt anahtarları: `fezaIsikTamam` (bitirilen bölümler), `fezaIsikSon`. Teknik ayrıntı: `src/BOLUM2.md`.

## Performans

iPad Pro (120 Hz ProMotion) dahil her ekranda oyun en çok 60 kare/sn çizer; oyun hızı her yenileme hızında aynıdır. Büyük ekranlarda çözünürlük otomatik uyarlanır.

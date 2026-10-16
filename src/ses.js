/* ses.js – seslendirme (anlatıcı + Pırıl) ve altyazı. Cümleler aşağıdaki SESLER bloğunda (geçerli JSON);
   değişince `python gen_voice.py` → sesler.js (window.VOICE_MP3 / VOICE_DUR). Anahtar öneki: a_ anlatıcı, p_ Pırıl.
   Sözleşme: src/SPEC.md › "Voice line keys".
   SES.soyle(anahtar, {oncelik}) → sıraya koyar (cümleler asla üst üste binmez), altyazıyı gösterir
   (ARAYUZ.altyazi(metin, saniye, kim)) ve OLAY 'konusma' {anahtar, kim:'a'|'p', sure} yayar (yalnız gerçekten çalınca).
   Takma adlar: 'p_aferin' → p_aferin1..9 (son çalınanlar tekrarlanmaz) · 'p_yardim' → p_yardim1 / p_yardim2 sırayla.
   İkinci göl: p_karanlik / p_nilufer ikinci gölcük için istenince (tetikleyicinin konusu ya da ops.yer 'gol2', yoksa
   Feza BOLUM.gollar[1]'in yakınında) p_karanlik2 / p_nilufer2 çalınır; geçerlilik/ömür kuralları asıl anahtarınkiyle aynı.
   Ses AU'nun WebAudio bağlamından çalar (müzik konuşma boyunca kısılır); sesler.js yüklü değilse ya da ?sessiz
   ise yalnız altyazı + olay (kayıt süresiyle) çalışır.
   Bölüm 2/3 tetikleyicileri öneksiz olur ('y_gol' → p_y_gol, 'b_zip' → p_b_zip); Bölüm 3'te a_finalN / a_y_finalN → a_b_finalN.
   Uzun sessizlikte (≥50 sn) Pırıl ara sıra küçük dostça bir söz söyler (p_dost*; oturumda en çok 3). Ayrıntı: src/BOLUM3.md › SES notları.
   SES.sus() → susar, sırayı boşaltır. SES.konusuyor() · SES.sure(anahtar) · SES.kayit (deneme günlüğü) · SES.sira().

   Sıra kuralları (Feza okuyamaz: ses tek talimat kanalı; ama BAYAT talimat kafa karıştırır):
   · Her cümlenin bir ömrü ve bir GEÇERLİLİK koşulu var; çalma anında koşul tutmuyorsa cümle atılır
     (göl aydınlandıysa "burası karanlık" söylenmez, Feza 8+ kare ilerlediyse "zıpla" söylenmez...).
   · Konuşma tetikleyicisinden gelen cümle o nesneyi taşır (s.o): Feza o.gec'i geçtiyse ya da o.konu uyandı/açıldı/aydınlandıysa
     sıradan atılır. Tekrarlanan anahtarlar (iki göl: p_karanlik, p_nilufer {yer: grup}; iki uyuyan Pofuduk: p_uyuyor) tetikleyici
     başına bir kez söylenir, aynı anahtar en az 20 sn arayla (seyrek).
   · Aynı konudaki yeni cümle eskisini siler (Büyük Pofuduk aşamaları: yalnız sonuncusu).
   · Oyun cümleleri arasında nefes payı 2,5–4 sn (uzun cümleden sonra daha uzun); olay tepkileri 1 sn sonra ve
     öne geçer; acil cümleler (kurtarma, yardım, "üstüne zıpla", "ağaca dokun") 0,35 sn sonra, gerekirse çalan
     cümleyi yumuşakça keserek (kesilen talimat hâlâ geçerliyse bir kez yeniden sıraya girer).
   · Övgü: olaydan sonra 1,5 sn içinde ses boşalırsa söylenir, yoksa atılır; en az 12 sn arayla, çeşitli.
   · DURUM 'oyun' değilse ya da ağaç yandıysa oyun cümlesi başlamaz (çalan da kesilir; "ağaca dokun" bitebilir). */
'use strict';
const SES = (() => {
  const LINES = /*SESLER*/{
    "a_giris1": "Bir varmış, bir yokmuş. Feza adında, küçük bir çocuk varmış. Her gece, en sevdiği oyuncağı Pırıl'a sarılıp uyurmuş.",
    "a_giris2": "Pırıl, mor renkli, minicik bir ejderhaymış. Bir gece Feza uykuya dalınca, Pırıl'ın gözleri yavaşça parlamaya başlamış.",
    "a_giris3": "Ve oda, yavaş yavaş, sihirli bir ormana dönüşmüş. Işık Ormanı'na!",
    "p_uyan": "Feza, uyan! Ormanımızın ışığı sönmüş, Pofuduklar da uykuya dalmış! Bize yardım lazım!",
    "p_merhaba": "Hadi, şu parlayan çiçeğe gidelim! Parmağını ekranın o tarafına koy ve tut!",
    "p_zipla": "Zıplamak için, köşedeki yuvarlak düğmeye bas! Hop!",
    "p_cicek_ilk": "Yaşasın, çiçek açtı! Orman biraz aydınlandı. Hadi, öbür çiçekleri de bulalım!",
    "p_uyuyor": "Bak, bir Pofuduk uyuyor! Pofuduklar ışığı karınlarında taşırlar. Işığı sönünce uyuyup kalmışlar. Üstüne zıpla, ışığını uyandır!",
    "p_uyandi": "Çok yaşa, Pofuduk! Işığı geri geldi! Orman da aydınlanıyor. Günaydın!",
    "p_karanlik": "Burası çok karanlık. Bekle, ben ışık üfleyeceğim!",
    "p_nilufer": "Bak, suyun üstünde nilüfer yaprakları çıktı! Zıplaya zıplaya, üstlerinden geç!",
    "p_karanlik2": "Bir gölcük daha! Hadi, ben yine ışık üfleyeyim!",
    "p_nilufer2": "Yine yapraklar çıktı! Hop hop, üstlerinden geç!",
    "p_minder": "Bu Pofuduk yumuşacık bir minder! Üstüne zıpla, seni yukarı fırlatsın!",
    "p_ciftzipla": "Zıpla, havadayken düğmeye bir daha bas! Ben seni yukarı iterim!",
    "p_sakli": "Bak, yukarıda gizli bir yol var! Oradaki parlak tohumları toplayalım mı?",
    "p_tohum": "Gizli bir ışık tohumu buldun! Ne güzel parlıyor!",
    "p_buyuk": "Vay, Büyük Pofuduk! Işık Ağacı'nı o koruyor. Onu uyandırınca ağaç yanacak! Hadi, buradaki üç çiçeğe dokun!",
    "p_buyuk_goz": "Bak bak, bir gözünü açtı! Başka bir çiçek daha bul!",
    "p_buyuk_esne": "Esniyor! Son çiçeğe de dokun, uyansın!",
    "p_buyuk_kalk": "Uyandı! Hadi, üstüne zıpla, seni ağaca fırlatsın!",
    "p_agac": "İşte Işık Ağacı! Hadi Feza, koş, ağaca dokun!",
    "p_sarki1": "Bu Pofuduk çok derin uyuyor. Ona ışık şarkısı söyleyelim!",
    "p_sarki2": "Beni dinle, sonra sen çal.",
    "p_sarki3": "Şarkını duydu! Işığı geri geldi.",
    "p_yol": "Feza, bu tarafa gel! Beni takip et!",
    "p_kurtar": "Tuttum seni! Bir daha deneyelim, sen yaparsın!",
    "p_kurtar1": "Hop, buradayım!",
    "p_kurtar2": "Tuttum seni! Hadi, bir daha!",
    "p_kurtar3": "Sorun yok, ben yanındayım!",
    "p_kurtar4": "Yakaladım! Sen çok cesursun.",
    "p_yardim1": "Gel, sana yardım edeyim!",
    "p_yardim2": "Bekle, seni ben taşıyayım!",
    "p_aferin1": "Aferin sana!",
    "p_aferin2": "Süpersin, Feza!",
    "p_aferin3": "Çok güzel gidiyorsun!",
    "p_aferin4": "Çok şahane!",
    "p_aferin5": "İşte böyle!",
    "p_aferin6": "Sen gerçek bir kahramansın!",
    "p_aferin7": "Harikasın!",
    "p_aferin8": "Yaşasın, başardın!",
    "p_aferin9": "Ne kadar da cesursun!",
    "a_final1": "Feza ile Pırıl, Işık Ağacı'nı yeniden parlatmışlar. Bütün orman ışıl ışıl olmuş, Pofuduklar sevinçle dans etmiş.",
    "a_final2": "Sabah olunca, Feza yatağında gözlerini açmış. Pırıl da ona, tatlı tatlı göz kırpmış.",
    "a_final3": "Ve her gece, yeni bir macera onları bekliyordu...",
    "p_gecis": "Işık Ağacı yandı! Yıldızlar göle düşmüş. Hadi gidelim!",
    "a_y_final1": "Bütün yıldızlar yerine dönmüş. Orman da gökyüzü de ışıl ışıl olmuş, Pofuduklar sevinçle dans etmiş.",
    "a_y_final2": "Feza bütün gece yıldız toplamış. Sabah yatağında uyanmış, Pırıl da ona göz kırpmış.",
    "a_y_final3": "Ve gökyüzündeki yıldızlar, her gece onları bekleyecekmiş...",
    "p_y_giris": "Burası Yıldız Gölü. Sönük yıldızları bulup uyandıralım.",
    "p_y_gol": "Bak, yıldız taşları! Üstlerine bas, yolu açılıyor.",
    "p_y_yildiz": "Yıldız uyanıyor! Bak, göğe çıkıyor.",
    "p_y_yildiz2": "Gökyüzü yıldızla doluyor. Çok güzel!",
    "p_y_pofuduk": "Bu Pofuduklar da uyuyor. Üstlerine zıpla, ışıklarını uyandır!",
    "p_y_hayvan": "Vay, Yıldız Kaplumbağası! Sırtındaki yıldızları yakarsak uyanacak. Hadi, hepsine dokun!",
    "p_y_hayvan_uyan": "Günaydın, Yıldız Kaplumbağası! Hadi, hep birlikte göğe!",
    "p_y_bitti": "Bütün yıldızlar yerinde! Orman da gökyüzü de ışık içinde.",
    "p_secim": "Bu gece nereye gidelim?",
    "p_y_uyku": "Bu gece yıldızlara gidiyoruz!",
    "p_takim1": "Yıldızları birleştirelim!",
    "p_takim2": "Beni izle.",
    "p_takim3": "Çok güzel! Gökyüzüne yeni bir resim çizdin.",
    "p_y_sarki": "Bu Pofuduk yıldız şarkısı istiyor. Beni dinle, sonra sen çal!",
    "p_b_uyku": "Bu gece bulutlara gidiyoruz!",
    "p_b_giris": "Gökkuşağı kaybolmuş! Bulut Kuzucukları renklerini kaybetmiş. Hadi, onları bulalım!",
    "p_b_zip": "Bu bulut zıp zıp! Üstüne zıpla, seni yukarı atsın!",
    "p_b_kuzu": "Bak, bir Bulut Kuzucuğu! Rengi gitmiş, çok üzgün. Hadi, ona sarıl!",
    "p_b_kuzu_ilk": "Yaşasın, rengi geri geldi! Bak, gökyüzünde gökkuşağı görünüyor!",
    "p_b_esinti": "Rüzgâr esiyor! İçine gir, seni yukarı taşısın!",
    "p_b_sekil1": "Bu bulutun içinde biri saklanıyor. Hadi, bulalım!",
    "p_b_sekil2": "Bak bak, bir şey çıkıyor!",
    "p_b_sekil3": "Buldun! Bulut canlandı, bak nasıl seviniyor!",
    "p_b_sekil4": "Bak, bu sensin Feza!",
    "p_b_ucus": "Hadi Feza, bin sırtıma! Uçuyoruz!",
    "p_b_ucus2": "Yaşasın, uçuyoruz! Parlayan ışıltıları topla!",
    "p_b_selam": "Bak Feza! Bulut arkadaşlarımız bize el sallıyor!",
    "p_b_tepe": "İşte Gökkuşağı Tepesi! Kuzucuklar da seninle geldi. Hadi, en tepeye çık!",
    "p_b_bitti": "Gökkuşağı geri geldi! Ne kadar da güzel!",
    "a_b_final1": "Yedi Bulut Kuzucuğu gökyüzünde yan yana dizilmiş ve kocaman bir gökkuşağı olmuş. Feza ile Pırıl, gökkuşağından kayarak inmişler.",
    "a_b_final2": "Sabah olunca, Feza yatağında gözlerini açmış. Pencereden bakmış ki, gökyüzünde kocaman bir gökkuşağı! Pırıl da ona göz kırpmış.",
    "a_b_final3": "Ve her gece, yeni bir macera onları bekliyordu...",
    "p_dost1": "Seninle oynamak çok güzel!",
    "p_dost2": "Ben hep yanındayım, Feza.",
    "p_dost3": "Hadi, maceraya devam!",
    "p_dost_orman": "Duydun mu? Orman bize şarkı söylüyor.",
    "p_dost_yildiz": "Yıldızlar bize göz kırpıyor!",
    "p_dost_bulut": "Bulutlar pamuk gibi yumuşacık!",
    "p_i_uyku": "Bu gece İnci Denizi’ne gidiyoruz!",
    "p_i_giris": "Burası İnci Denizi! Minik dostlarımıza yardım edip Büyük İnci’yi uyandıralım.",
    "p_i_yuz": "Parmağını gitmek istediğin yerde tut. Yukarıya da aşağıya da yüzebilirsin! Yuvarlak düğmeyle biraz hızlanırız.",
    "p_i_denizati": "Denizatlarına dokun. Onlarla birlikte mercan bahçelerini ışıklandıralım!",
    "p_i_denizati_ilk": "Bak, ışığı uyandı! Kuyruğuyla bize teşekkür ediyor.",
    "p_i_ahtapot": "Bu sevimli ahtapot kabuklarına dolanmış. Ona yardım edelim!",
    "p_i_ahtapot_yardim": "Kolundaki kabuğu, aynı şekilli kum yuvasına sürükle. Ben yanındayım!",
    "p_i_ahtapot_bitti": "Kolları açıldı! Bak, bize yolu açıyor. Teşekkür ederiz, minik dostum!",
    "p_i_vatoz": "Kurdele Vatoz ile ışıklı kemerlerden geçelim. Parmağını yukarıda ya da aşağıda tutarak onu yönlendirebilirsin!",
    "p_i_vatoz_bitti": "Ne güzel yüzdük! İşte Büyük İnci’nin yuvası.",
    "p_i_inci": "Büyük İnci burada uyuyor. Hadi, yaklaşıp ona dokunalım!",
    "p_i_inci_uyan": "İnci uyanıyor! Bak, kabuğu açılıyor.",
    "p_i_dostlar": "Denizatı dostlarımız da geldi! Birlikte dans edelim.",
    "p_i_deniz_uyandi": "İnci Denizi ışıl ışıl oldu. Ne güzel bir rüya!",
    "p_i_bitti": "İnci uyandı! Bütün deniz ışıl ışıl. Dostlarımız da çok mutlu!",
    "p_dost_deniz": "Denizin içinde seninle yüzmek çok güzel!",
    "a_i_final1": "Feza ile Pırıl, İnci Denizi’nin minik dostlarına yardım etmişler. Büyük İnci uyanınca mercanlar yumuşacık renklerle parlamış.",
    "a_i_final2": "Sabah Feza yatağında gözlerini açmış. Güneş, odasına deniz gibi ışıklar çizmiş. Pırıl da ona tatlı tatlı göz kırpmış.",
    "a_i_final3": "Ve her gece, yeni bir rüya onları bekliyormuş...",
    "p_v_uyku": "Bu gece, Uyuyan Yanardağ'a gidiyoruz!",
    "p_v_giris": "Bak Feza, dağ usulca nefes alıyor! Kor Çiçeği uyumuş. Işık bahçelerini canlandırıp onu uyandıralım.",
    "p_v_buhar": "Bu yumuşacık buhar bizi yukarı taşıyor! Taşlara zıpla, sıcak rüzgârda süzül!",
    "p_v_mini": "Yavru kuşlar acıkmış! Meyveyi kuşlara sürükle, onları doyuralım.",
    "p_v_mini_yardim": "Meyveyi aç yavru kuşa sürükle.",
    "p_v_kristal_son": "Yaşasın, kuşlar doydu! Şimdi kayığımıza gidelim.",
    "p_v_sal": "Işık nehrinde yolculuğa çıkıyoruz! Parmağınla yukarıya, aşağıya yol göster; salımız sıcak buharda süzülsün. Ben yanındayım!",
    "p_v_sal_son": "Ne güzel süzüldük! Işık kuşlarımız da bizimle geldi. Hadi, Kor Çiçeği'ni bulalım!",
    "p_v_kalp": "İşte dağın kalbi: Kor Çiçeği! Bahçelerimiz uyandı. Şimdi yaklaş, çiçeğe dokunalım.",
    "p_v_bahce": "Bak, taşların arasından ışık çiçekleri açılıyor! Dağ yeniden renkleniyor.",
    "p_dost_volkan": "Bu dağın şarkısı ne kadar güzel! Seninle keşfetmeyi çok seviyorum.",
    "a_v_final1": "Feza ile Pırıl, uyuyan dağın şarkısını bulmuşlar. Kor Çiçeği açılınca, gökyüzüne altın ışık kuşları yükselmiş. Bütün bahçeler yeniden canlanmış.",
    "a_v_final2": "Sabah Feza, sıcacık yatağında gözlerini açmış. Gün ışığı, yorganına altın desenler çizmiş. Pırıl da ona tatlı tatlı göz kırpmış.",
    "a_v_final3": "Ve o güzel dağın şarkısı, Feza'nın rüyalarında hep yaşayacakmış."
}/*SESLER-SON*/;

  const sesSaat = () => performance.now() / 1000;
  const ovguMu = k => /^p_aferin/.test(k);
  const SES_SAHNE = { p_uyan: 1, p_gecis: 1, p_y_giris: 1, p_y_bitti: 1, p_secim: 1, p_y_uyku: 1, p_b_uyku: 1, p_b_giris: 1, p_b_bitti: 1, p_i_uyku: 1, p_i_giris: 1, p_i_yuz: 1, p_i_bitti: 1, p_i_inci_uyan: 1, p_i_dostlar: 1, p_i_deniz_uyandi: 1 };   // sahne cümleleri: öncelik 3, ağaç yandı/oyun bitti diye atılmaz
  const anlatici = k => k.startsWith('a_') || k === 'p_v_uyku' || k === 'p_v_giris' || !!SES_SAHNE[k];
  const sesKim = k => k.startsWith('a_') ? 'a' : 'p';
  // ── cümle bilgisi: oncelik (3 sahne · 2 oyun · 1 yönlendirme · 0 övgü), acil (2 araya girer · 1 olay tepkisi), ömür (sn), konu ──
  const KONU_SIRA = { p_buyuk: 1, p_buyuk_goz: 2, p_buyuk_esne: 3, p_buyuk_kalk: 4, p_agac: 5, p_karanlik: 1, p_nilufer: 2, p_karanlik2: 1, p_nilufer2: 2 };
  const sesTaban = k => (k === 'p_karanlik2' || k === 'p_nilufer2') ? k.slice(0, -1) : k;   // ikinci göl cümlesi → asıl anahtar (kurallar için)
  function sesBilgi(k) {
    k = sesTaban(k);
    if (anlatici(k)) return { oncelik: 3, acil: 0, omur: 1e9, konu: null };
    if (ovguMu(k)) return { oncelik: 0, acil: 0, omur: 1.5, konu: null };
    if (k === 'p_yol') return { oncelik: 1, acil: 0, omur: 3, konu: null };
    if (k === 'p_v_mini_yardim') return { oncelik: 2, acil: 1, omur: 8, konu: null };
    if (k === 'p_v_kristal_son' || k === 'p_v_sal_son' || k === 'p_v_bahce') return { oncelik: 2, acil: 1, omur: 8, konu: null };
    if (/^p_kurtar/.test(k) || /^p_yardim/.test(k)) return { oncelik: 2, acil: 2, omur: 3, konu: 'kurtar' };
    if (k === 'p_buyuk_kalk' || k === 'p_agac') return { oncelik: 2, acil: 2, omur: 12, konu: 'buyuk' };
    if (k === 'p_buyuk_goz' || k === 'p_buyuk_esne') return { oncelik: 2, acil: 1, omur: 8, konu: 'buyuk' };
    if (k === 'p_buyuk') return { oncelik: 2, acil: 0, omur: 20, konu: 'buyuk' };
    if (k === 'p_nilufer') return { oncelik: 2, acil: 1, omur: 12, konu: 'gol' };
    if (k === 'p_karanlik') return { oncelik: 2, acil: 1, omur: 15, konu: 'gol' };
    if (k === 'p_sarki1' || k === 'p_sarki2' || k === 'p_sarki3') return { oncelik: 2, acil: 1, omur: 12, konu: null };   // şarkı etkinliği (sarki.js; oturumda yalnız ilk başlangıçta / ilk başarıda)
    if (k === 'p_takim1' || k === 'p_takim2') return { oncelik: 2, acil: 1, omur: 12, konu: null };
    if (k === 'p_takim3') return { oncelik: 2, acil: 1, omur: 8, konu: null };
    if (k === 'p_y_hayvan_uyan' || k === 'p_y_yildiz') return { oncelik: 2, acil: 1, omur: 8, konu: null };   // Bölüm 2 olay tepkileri
    if (k === 'p_y_yildiz2') return { oncelik: 2, acil: 1, omur: 6, konu: null };
    if (k === 'p_y_sarki') return { oncelik: 2, acil: 1, omur: 12, konu: null };
    if (k === 'p_cicek_ilk' || k === 'p_uyandi' || k === 'p_tohum') return { oncelik: 2, acil: 1, omur: 5, konu: null };
    // Bölüm 3
    if (k === 'p_b_kuzu_ilk') return { oncelik: 2, acil: 1, omur: 6, konu: null };
    if (k === 'p_b_ucus') return { oncelik: 2, acil: 1, omur: 8, konu: null };
    if (k === 'p_b_ucus2') return { oncelik: 2, acil: 0, omur: 8, konu: null };
    if (k === 'p_b_selam') return { oncelik: 2, acil: 1, omur: 5, konu: null };   // uçuşta bulut hayvanları geçerken (anlık: geç kalırsa atılır)
    if (/^p_b_sekil/.test(k)) return { oncelik: 2, acil: 1, omur: k === 'p_b_sekil1' ? 12 : 8, konu: null };
    if (/^p_dost/.test(k)) return { oncelik: 1, acil: 0, omur: 3, konu: null };   // uzun sessizlikte küçük dostça söz
    return { oncelik: 2, acil: 0, omur: 20, konu: null };   // konuşma tetikleyicilerinin talimatları
  }

  // ── oyun durumuna bakan yardımcılar ──
  const gP = () => (typeof P !== 'undefined' ? P : null);
  const gN = () => (typeof NESNELER !== 'undefined' ? NESNELER : []);
  const sesOnb = {};
  function sesTetik(k) {          // bolum.js'teki konuşma tetikleyicisi
    if (!(k in sesOnb)) sesOnb[k] = gN().find(n => n.tip === 'konusma' && n.anahtar === k) || null;
    return sesOnb[k];
  }
  function sesSonraki(k, tip) {   // tetikleyiciden sonraki ilk <tip> nesnesi (cümlenin anlattığı şey)
    const ad = k + '>' + tip;
    if (!(ad in sesOnb)) { const o = sesTetik(k); sesOnb[ad] = o ? gN().filter(n => n.tip === tip && n.x >= o.x - 2).sort((a, b) => a.x - b.x)[0] || null : null; }
    return sesOnb[ad];
  }
  // tetikleyen konuşma nesnesi: oyun.js SES.soyle(anahtar)'ı dokun anında çağırır (o.dokundu artık true) → Feza'ya en yakın dokunulmuş olan
  function sesTetikBul(k) {
    const p = gP(); let best = null, bd = 1e9, yedek = null, yd = 1e9;
    for (const n of gN()) {
      if (n.tip !== 'konusma' || n.anahtar !== k) continue;
      const d = p ? Math.abs(n.x - p.x) : n.x;
      if (n.dokundu) { if (d < bd) { bd = d; best = n; } } else if (d < yd) { yd = d; yedek = n; }
    }
    return best || yedek;
  }
  const sesIleride = (k, kare, s) => { const o = (s && s.o) || sesTetik(k), p = gP(); return !!(o && p && p.x > o.x + kare * T); };
  // cümlenin konusu bitti mi (uyandı / açıldı / göl aydınlandı)? karanlık nokta Pırıl üflerken değil, ışık gölü bulunca "bitmiş" sayılır
  const sesKonuBitti = n => !!(n && (n.tip === 'karanlik' ? sesAydinG[n.grup] : (n.done || n.uyandi || n.lit)));
  function sesGolAraligi(grup) {   // grubun nilüferlerinin x aralığı (yoksa BOLUM.gol)
    const ad = 'gol>' + grup;
    if (!(ad in sesOnb)) {
      let a = 1e9, b = -1e9;
      for (const n of gN()) if (n.tip === 'nilufer' && n.grup === grup) { a = Math.min(a, n.x); b = Math.max(b, n.x); }
      const gl = typeof BOLUM !== 'undefined' && BOLUM.gol;
      sesOnb[ad] = a < b ? { x0: a, x1: b } : (gl ? { x0: gl.x0, x1: gl.x1 } : null);
    }
    return sesOnb[ad];
  }
  const sesBitmis = (k, tip) => { const o = sesSonraki(k, tip); return !!(o && (o.done || o.uyandi || o.lit)); };
  let sesAsama = 0, sesBuyukZip = false, sesBuyukO, sesZipT = -1e9;
  const sesAydinG = {};   // aydınlanan göl grupları
  const sesBuyuk = () => { if (sesBuyukO === undefined) sesBuyukO = gN().find(n => n.tip === 'buyukPofuduk') || null; return sesBuyukO; };
  const sesBuyukAsama = () => { const b = sesBuyuk(); return Math.max(sesAsama, b && b.uyandi ? 3 : 0, (b && b.pf && b.pf.asama) || 0); };
  let sesZipladi = false; OLAY.on('ziplama', () => { sesZipladi = true; });
  const agacYandi = () => (typeof BOLUM_NO !== 'undefined' && BOLUM_NO === 2) ? false : !!(typeof TREE !== 'undefined' && TREE && TREE.done);
  const SES_MINI_ALAN = { p_sarki1: 'sk', p_sarki2: 'sk', p_takim1: 'tk', p_takim2: 'tk', p_b_sekil1: 'skl', p_b_sekil2: 'skl' };
  function sesMiniNesne(k) {
    const alan = SES_MINI_ALAN[k];
    const aktif = alan === 'sk' ? (typeof skAktif !== 'undefined' && skAktif) : alan === 'tk' ? (typeof tkAkt !== 'undefined' && tkAkt) : (typeof SKL !== 'undefined' && SKL.akt);
    if (aktif && aktif[alan]) return aktif;
    const p = gP(); let en = null, uzak = Infinity;
    for (const o of gN()) if (o[alan]) { const d = p ? Math.abs(o.x - p.x) : 0; if (d < uzak) { en = o; uzak = d; } }
    return en;
  }
  function sesMiniSuruyor(s) {
    const o = s.mini, k = o && o[SES_MINI_ALAN[s.k]];
    return !!(k && !o.done && !k.bitti && k.durum !== 'bitti');
  }
  // her talimatın "hâlâ yerinde mi?" koşulu (çalma anında bakılır)
  const KOSUL = {
    p_sarki1: sesMiniSuruyor, p_sarki2: sesMiniSuruyor,
    p_takim1: sesMiniSuruyor, p_takim2: sesMiniSuruyor,
    p_v_mini: () => (typeof V5 === 'undefined' || !V5.mini) && (typeof KR5 === 'undefined' || !KR5.o || KR5.o.kr5.totalFed < 6),
    p_v_mini_yardim: () => typeof KR5 !== 'undefined' && !!KR5.aktif && KR5.o.kr5.phase === 'feed' && KR5.o.kr5.totalFed < 6,
    p_v_sal: () => typeof V5 === 'undefined' || !V5.sal,
    p_v_kalp: () => typeof V5 === 'undefined' || !V5.final,
    p_i_denizati: () => typeof DNZ === 'undefined' || DNZ.ati.some(o => !o.done),
    p_i_ahtapot: () => typeof DNZ === 'undefined' || !DNZ.oct || !DNZ.oct.done,
    p_i_vatoz: () => typeof DNZ === 'undefined' || !DNZ.ride || (!DNZ.ride.done && DNZ.ride.faz !== 'inis'),
    p_i_inci: () => typeof DNZ === 'undefined' || !DNZ.pearl || (!DNZ.pearl.done && DNZ.pearl.dnz.faz === 'bekle'),
    p_i_ahtapot_yardim: s => typeof DNZ === 'undefined' || !DNZ.oct || !DNZ.oct.done,   // s: sıradaki cümle (s.o = tetikleyen konuşma nesnesi, s.yer = göl grubu vb.)
    p_merhaba: s => !sesBitmis('p_merhaba', 'cicek') && !sesIleride('p_merhaba', 10, s),
    p_zipla: s => !sesZipladi || !sesIleride('p_zipla', 8, s),   // hiç zıplamadıysa talimat geçerli kalır (5 yaşında: öğrenmesi şart)
    p_uyuyor: s => { const o = (s.o && s.o.konu) || sesSonraki('p_uyuyor', 'pofuduk'), p = gP(); return !(o && (o.uyandi || (p && p.x > o.x + 3 * T))); },
    p_karanlik: s => { const o = s.o && s.o.konu; return !(o ? sesAydinG[o.grup] : sesAydinG.gol) && !sesIleride('p_karanlik', 12, s); },   // Pırıl üflerken de söylenebilir; ışık gelince değil
    p_nilufer: s => { const p = gP(), gl = sesGolAraligi(s.yer || 'gol'); return !p || !gl || (p.x > gl.x0 - 16 * T && p.x < gl.x1 + T); },
    p_minder: s => !sesBitmis('p_minder', 'cicek') && !sesIleride('p_minder', 14, s),
    p_ciftzipla: s => !sesBitmis('p_ciftzipla', 'cicek') && !sesIleride('p_ciftzipla', 13, s),
    p_sakli: s => !gN().some(n => n.tip === 'tohum' && n.done) && !sesIleride('p_sakli', 9, s),
    p_y_pofuduk: s => { const o = (s.o && s.o.konu) || sesSonraki('y_pofuduk', 'pofuduk'), p = gP(); return !(o && (o.uyandi || (p && p.x > o.x + 3 * T))); },
    p_y_hayvan: () => { const h = gN().find(n => n.tip === 'yildizHayvan'); return !(h && (h.hazir || h.bitti || h.firlat)); },
    p_buyuk: () => sesBuyukAsama() < 1,
    p_buyuk_goz: () => sesBuyukAsama() < 2,
    p_buyuk_esne: () => sesBuyukAsama() < 3,
    p_buyuk_kalk: () => { const p = gP(), b = sesBuyuk(); return !sesBuyukZip && !(p && b && p.x > b.x + 2 * T && p.y < b.y - 4 * T); },
    p_agac: () => { const p = gP(); return !!(p && p.ground) && sesSaat() - sesZipT > 2; },   // uçarken değil: tepede durup ağaca dokunmadıysa
    // Bölüm 3: talimatlar yeri geçince / konusu bitince söylenmez
    p_b_zip: s => !sesIleride('b_zip', 12, s),
    p_b_esinti: s => !sesIleride('b_esinti', 12, s),
    p_b_kuzu: () => !(typeof SAYAC !== 'undefined' && SAYAC && SAYAC.kuzu > 0) && !sesKuzuN,
    p_b_tepe: () => !sesGokBasladi,
    p_b_ucus: () => !sesUcusBitti,
    p_b_ucus2: () => sesUcusta() && !(sesSonCal.p_b_selam != null && sesSaat() - sesSonCal.p_b_selam < 8),   // selam az önce söylendiyse uçuş cümlesi atlanır
    p_b_selam: () => sesUcusta() && !(sesSonCal.p_b_ucus2 != null && sesSaat() - sesSonCal.p_b_ucus2 < 4),
    p_b_sekil1: s => sesMiniSuruyor(s) && !sesIleride('b_sekil1', 10, s),
    p_b_sekil2: sesMiniSuruyor,
    p_dost1: () => sesDostUygun(), p_dost2: () => sesDostUygun(), p_dost3: () => sesDostUygun(),
    p_dost_orman: () => sesDostUygun(), p_dost_yildiz: () => sesDostUygun(), p_dost_bulut: () => sesDostUygun(),
  };
  // sert: çalan cümle sürebilir mi? · gecerli: sıradaki cümle şimdi başlayabilir mi? ('' = evet, yoksa neden)
  function sesSert(s) {
    if (anlatici(s.k)) return true;
    const d = typeof DURUM !== 'undefined' ? DURUM : 'oyun';
    if (d === 'final' && s.bas && (s.k === 'p_agac' || ovguMu(s.k))) return true;   // ağaçtaki son cümle bitebilir
    if (d !== 'oyun') return false;
    if (agacYandi()) return s.k === 'p_agac' || ovguMu(s.k);
    return true;
  }
  function sesGecerli(s) {
    if (sesSaat() > s.son) return 'süre doldu';
    if (sesEskidi[sesTaban(s.k)]) return 'olay eskitti';
    const durum = typeof DURUM !== 'undefined' ? DURUM : 'oyun';
    if (s.k === 'p_secim' && durum !== 'baslik') return 'seçim bitti';
    if (/^(a_giris\d|p_[ybiv]_uyku)$/.test(s.k) && durum !== 'giris') return 'uyku sahnesi bitti';
    if (anlatici(s.k)) return '';
    if (!sesSert(s)) return 'oyun bitti';
    if (agacYandi() && !ovguMu(s.k)) return 'ağaç yandı';
    const o = s.o, p = gP();
    if (o && p && typeof o.gec === 'number' && p.x > o.gec) return 'yeri geçti (gec)';
    if (o && o.konu && sesKonuBitti(o.konu)) return 'konusu bitti';
    const f = KOSUL[sesTaban(s.k)];
    if (f) { try { if (!f(s)) return 'yeri geçti'; } catch (e) {} }
    return '';
  }

  // ── çözme / çalma ──
  const sesBuf = {}, sesCoz = {};
  let sesSira = [], sesCalan = null, sesKaynak = null, sesBitisZ = null;
  const sesSoylendi = {}, sesSonCal = {}, SES_AYNI_ARA = 20, tekrarli = k => k === 'p_secim' || ovguMu(k) || k === 'p_yol' || /^p_kurtar/.test(k) || /^p_yardim/.test(k);
  let sesSonBitis = -1e9, sesSonSure = 0, sesSonOvgu = -1e9, sesOvguGecmis = [], sesYardimN = 0;
  const kayit = [];
  const sesNot = (ne, k, neden) => { kayit.push([+sesSaat().toFixed(2), ne, k, neden || '']); if (kayit.length > 400) kayit.shift(); };

  function sesSure(k) {
    const d = window.VOICE_DUR && VOICE_DUR[k];
    return d || Math.max(1.4, LINES[k].length / (k.startsWith('a_') ? 11.5 : 14) + 0.4);   // kayıt yoksa okuma hızına göre tahmin
  }
  function sesBase64(b64) {
    const s = atob(b64), n = s.length, u = new Uint8Array(n);
    for (let i = 0; i < n; i++) u[i] = s.charCodeAt(i);
    return u.buffer;
  }
  function sesCozumle(k) {     // base64 mp3 → AudioBuffer (Safari'nin eski geri-çağrılı biçimiyle de çalışır)
    if (sesBuf[k]) return Promise.resolve(sesBuf[k]);
    if (sesCoz[k]) return sesCoz[k];
    const ac = typeof AU !== 'undefined' && AU.baglam && AU.baglam();
    if (!ac || !window.VOICE_MP3 || !VOICE_MP3[k]) return Promise.resolve(null);
    return sesCoz[k] = new Promise(res => {
      try {
        const p = ac.decodeAudioData(sesBase64(VOICE_MP3[k]), b => { sesBuf[k] = b; res(b); }, () => res(null));
        if (p && p.then) p.then(b => { sesBuf[k] = b; res(b); }, () => res(null));
      } catch (e) { res(null); }
    }).then(b => { if (!b) delete sesCoz[k]; return b; });
  }
  const sesSesli = k => !SESSIZ && !!(window.VOICE_MP3 && VOICE_MP3[k]);
  function sesBeklemeSuresi(s, bekle) {
    const t = sesSaat();
    if (s.sesBekT != null) s.son += Math.max(0, t - s.sesBekT);
    s.sesBekT = bekle ? t : null;
  }
  function sesGeriBeklet(s, neden) {
    if (sesCalan !== s) return;
    sesCalan = null;
    if (!sesGecerli(s)) {
      s.sesBekT = sesSaat(); s.sesDeneT = sesSaat() + (neden === 'çözme' ? .5 : 0);
      sesSira.unshift(s); sesNot('ses bekle', s.k, neden);
    } else sesNot('at', s.k, sesGecerli(s));
  }
  function sesSiraHazirla(s) {
    if (s.cozBek) return;
    s.cozBek = true;
    sesCozumle(s.k).then(buf => {
      s.cozBek = false;
      if (!sesSira.includes(s)) return;   // sahne değişti veya istek iptal edildi
      if (!buf) {
        s.cozHata = (s.cozHata || 0) + 1;
        s.sesDeneT = sesSaat() + Math.min(8, .5 * Math.pow(2, Math.min(4, s.cozHata - 1)));
        sesNot('ses bekle', s.k, 'çözme');
      } else s.sesDeneT = 0;
      sesTik();
    });
  }
  function sesOnceden() {     // cümleleri boşta önceden çöz (ilk konuşmada gecikme olmasın)
    if (!window.VOICE_MP3) return;
    const ks = Object.keys(LINES).filter(k => VOICE_MP3[k]);
    let i = 0;
    const adim = () => { if (i >= ks.length) return; sesCozumle(ks[i++]).then(() => setTimeout(adim, 30)); };
    adim();
  }

  function sesOvguSec(k) {     // son çalınan üç övgüyü tekrarlama
    if (k !== 'p_aferin' && !sesOvguGecmis.includes(k)) return k;
    const ks = Object.keys(LINES).filter(x => /^p_aferin\d/.test(x) && !sesOvguGecmis.includes(x));
    return ks.length ? ks[Math.floor(Math.random() * ks.length)] : null;
  }
  // sıralama: sahne > acil > öncelik > eskisi
  const sesSirala = (a, b) => (b.oncelik >= 3) - (a.oncelik >= 3) || b.acil - a.acil || b.oncelik - a.oncelik || a.t - b.t;
  // önceki cümle bittikten sonra ne kadar nefes payı
  function sesAra(s) {
    if (s.oncelik >= 3) return 0.25;
    if (s.acil >= 2) return 0.35;
    if (s.oncelik <= 0) return 0.5;
    if (s.acil >= 1 || sesSonOvgu === sesSonBitis) return 1.0;   // kısa övgüden sonra uzun bekleme gerekmez
    return clamp(1.0 + 0.45 * sesSonSure, 2.5, 4.0);
  }
  function sesIkinciGol(o, ops) {   // istek ikinci gölcük için mi?
    const gr = (o && o.konu && o.konu.grup) || (ops && ops.yer != null ? String(ops.yer) : '');
    if (gr) return gr === 'gol2';
    const g2 = typeof BOLUM !== 'undefined' && Array.isArray(BOLUM.gollar) && BOLUM.gollar[1], p = gP();
    return !!(g2 && p && p.x > g2.x0 - 16 * T && p.x < g2.x1 + 2 * T);
  }
  // olay cümlesi → artık eskimiş talimatlar (oturumda bir kez söylenen talimatlar; tekrarlayanlar – p_uyuyor gibi – KOSUL ile denetlenir)
  const SES_ESKITIR = { p_buyuk_kalk: ['p_buyuk', 'p_buyuk_goz', 'p_buyuk_esne'], p_y_hayvan_uyan: ['p_y_hayvan'], p_y_bitti: ['p_y_hayvan'],
    p_b_kuzu_ilk: ['p_b_kuzu'], p_cicek_ilk: ['p_merhaba'], p_b_bitti: ['p_b_tepe'] }, sesEskidi = {};
  const SES_KURTAR = ['p_kurtar', 'p_kurtar1', 'p_kurtar2', 'p_kurtar3', 'p_kurtar4'], sesKurtarGec = [];
  const sesB2 = () => typeof BOLUM_NO !== 'undefined' && BOLUM_NO === 2;
  const sesB3 = () => typeof BOLUM_NO !== 'undefined' && BOLUM_NO === 3;
  let sesYildizBekle = false, sesYildizGec = false;
  function soyle(k, ops) {
    if (typeof BOLUM_NO !== 'undefined' && BOLUM_NO === 4 && k === 'p_i_ahtapot') {
      setTimeout(() => { if (typeof DNZ !== 'undefined' && DNZ.oct && !DNZ.oct.done && DURUM === 'oyun') soyle('p_i_ahtapot_yardim', { oncelik: 3 }); }, 4500);
    }
    const ko = k;   // çağıranın verdiği ad (konuşma tetikleyicisi anahtarı)
    if (/^[ybiv]_/.test(k) && LINES['p_' + k]) k = 'p_' + k;                   // Bölüm tetikleyicileri: 'y_gol' → 'p_y_gol', 'v_mini' → 'p_v_mini'
    if (typeof BOLUM_NO !== 'undefined' && BOLUM_NO === 5) {
      if (/^a_(y_|b_|i_)?final\d$/.test(k)) k = 'a_v_final' + k.slice(-1);
      else if (k === 'p_y_uyku') k = 'p_v_uyku';
      else if (k === 'p_y_giris' || k === 'p_uyan') k = 'p_v_giris';
    }
    if (typeof BOLUM_NO !== 'undefined' && BOLUM_NO === 4) {
      if (/^a_(y_|b_)?final\d$/.test(k)) k = 'a_i_final' + k.slice(-1);
      else if (k === 'p_y_uyku') k = 'p_i_uyku';
      else if (k === 'p_y_giris' || k === 'p_uyan') k = 'p_i_giris';
      else if (k === 'p_y_bitti') k = 'p_i_bitti';
    }
    if (sesB3()) {   // Bölüm 3: sahne/CORE Bölüm 2 adlarını çağırırsa da Bölüm 3 cümlesi söylenir
      if (/^a_(y_)?final\d$/.test(k) && LINES['a_b_final' + k.slice(-1)]) k = 'a_b_final' + k.slice(-1);
      else if (k === 'p_y_uyku') k = 'p_b_uyku';
      else if (k === 'p_y_giris') k = 'p_b_giris';
      else if (k === 'p_y_bitti') k = 'p_b_bitti';
    }
    if (/^a_final\d$/.test(k) && sesB2() && LINES['a_y_' + k.slice(2)]) k = 'a_y_' + k.slice(2);   // Bölüm 2 final anlatıcısı
    if (k === 'p_sarki1' && sesB2()) k = 'p_y_sarki';                       // Bölüm 2: yıldız şarkısı cümlesi
    if (k === 'p_y_yildiz' && !sesYildizGec && !(typeof SAYAC !== 'undefined' && SAYAC.yildiz > 0)) { sesYildizBekle = true; return; }   // "yıldız uyanıyor": ilk yıldız gerçekten uyanınca (tetikleyici önceden de çağırabilir)
    if (k === 'p_aferin' || ovguMu(k)) k = sesOvguSec(k);
    if (k === 'p_yardim') k = 'p_yardim' + (1 + (sesYardimN++ % 2));
    if (/^p_kurtar\d?$/.test(k)) {   // kurtarma: en az 30 sn arayla, 5 çeşitten son ikisini tekrarlamadan (dağınık oynayan çocukta aynı cümle dönmesin)
      const son = Math.max(...SES_KURTAR.map(x => sesSonCal[x] != null ? sesSonCal[x] : -1e9));
      if (sesSaat() - son < 30) { sesNot('at', k, 'kurtar sık'); return; }
      const ad = SES_KURTAR.filter(x => LINES[x] && !sesKurtarGec.includes(x));
      k = sesKurtarGec.length ? ad[Math.floor(Math.random() * ad.length)] : 'p_kurtar';
      sesKurtarGec.push(k); if (sesKurtarGec.length > 2) sesKurtarGec.shift();
    }
    if (!k || !LINES[k]) return;
    const t = sesSaat(), b = sesBilgi(k);
    let oncelik = b.oncelik, omur = b.omur;
    if (ops && ops.oncelik != null) {
      if (ops.oncelik >= 3) { oncelik = 3; omur = 1e9; }
      else if (ops.oncelik <= 0 && !ovguMu(k)) { oncelik = Math.min(oncelik, 1); omur = Math.min(omur, 3); }
    }
    if (ovguMu(k) && t - sesSonOvgu < 12) { sesNot('at', k, 'övgü sık'); return; }
    const o = (ops && ops.o) || (anlatici(k) || ovguMu(k) ? null : sesTetikBul(ko) || (ko !== k ? sesTetikBul(k) : null));
    if ((k === 'p_karanlik' || k === 'p_nilufer') && sesIkinciGol(o, ops)) k = k + '2';   // ikinci gölcükte yeni cümle
    if ((sesCalan && sesCalan.k === k) || sesSira.some(s => s.k === k)) return;   // aynı cümle zaten sırada
    // talimatlar/tepkiler bir kez — ama tetikleyici nesne başına (iki göl, iki uyuyan Pofuduk), oyun başına değil
    const yer = o ? 'o' + (o.id != null ? o.id : Math.round(o.x)) : (ops && ops.yer != null ? String(ops.yer) : '');
    const tek = yer ? k + '@' + yer : k;
    if (!tekrarli(k)) {
      if (sesSoylendi[tek] || (!yer && sesSoylendi[k])) return;
      if (sesSonCal[k] != null && t - sesSonCal[k] < SES_AYNI_ARA) { sesNot('at', k, 'aynısı az önce'); return; }   // seyrek kalsın
    }
    const s = { k, oncelik, acil: oncelik >= 3 ? 0 : b.acil, konu: b.konu, t, son: t + omur, kez: 0, bas: 0, sure: sesSure(k), o, yer, tek };
    if (SES_MINI_ALAN[k]) s.mini = sesMiniNesne(k);   // başka bir etkinlik eski talimatı yeniden geçerli kılmasın
    // aynı konudaki eski cümleler geçersiz (yalnız en yeni aşama söylenir)
    if (s.konu) {
      const ks = KONU_SIRA[k] || 9;
      sesSira = sesSira.filter(q => { const eski = q.konu === s.konu && (KONU_SIRA[q.k] || 0) <= ks; if (eski) sesNot('at', q.k, 'yenisi geldi: ' + k); return !eski; });
    }
    for (const e of (SES_ESKITIR[k] || [])) sesEskidi[e] = 1;   // bu olay cümlesi gelince eski talimat bir daha söylenmez
    sesSira.push(s);
    sesNot('sira', k);
    sesCozumle(k);
    // acil cümle: çalan oyun cümlesini gerekirse yumuşakça kes
    const c = sesCalan;
    if (c && s.acil >= 2 && c.oncelik < 3 && c.acil < 2) {
      const kalan = c.bas ? c.bas + c.sure - t : c.sure;
      const eskidi = (c.konu && c.konu === s.konu) || !!sesGecerli(Object.assign({}, c, { son: 1e9 }));
      if (kalan > SES_BEKLE && !eskidi && c.oncelik === 2 && c.acil === 0 && !c.kez && !sesKritikMi(c)) {   // kesilecek talimat sonra bir kez daha söylenir
        sesSira.push(Object.assign({}, c, { t, son: t + 12, kez: 1, bas: 0, kesZ: 0 })); sesNot('sira', c.k, 'kesilecek, yeniden');
      }
      sesYumusakKes(eskidi ? 'eskidi: ' + k : 'araya girdi: ' + k, s);
    } else if (c && s.acil >= 1 && c.oncelik < 3 && c.acil < 1) {
      // olay tepkisi (taze haber) geldi: çalan talimat cümle sonunda susar. Konusu bittiyse (ör. "üstüne zıpla" derken Pofuduk uyandı) bir daha
      // söylenmez; bitmediyse ve uzunsa sonra bir kez yeniden sıraya girer.
      const kalan = c.bas ? c.bas + c.sure - t : c.sure, bitti = !!(c.o && c.o.konu && sesKonuBitti(c.o.konu)) || !!sesGecerli(Object.assign({}, c, { son: 1e9 }));
      if (kalan > SES_BEKLE && !bitti && c.oncelik === 2 && !c.kez && !ovguMu(c.k) && !sesKritikMi(c)) { sesSira.push(Object.assign({}, c, { t, son: t + 12, kez: 1, bas: 0, kesZ: 0 })); sesNot('sira', c.k, 'kesilecek, yeniden'); }
      sesYumusakKes((bitti ? 'eskidi: ' : 'olay: ') + k, s);
    } else if (c && oncelik >= 3 && c.oncelik < 3) sesYumusakKes('sahne', s);   // anlatıcı/sahne cümlesi gelirse oyun cümlesi cümle sonunda susar
    sesTik();
  }
  // Kesme kuralı (QA): hiçbir cümle sözcük ortasında kesilmez. Çalanın ≤3 sn'si kaldıysa biter, yeni cümle sırada bekler (ömrü bekleme kadar uzar:
  // taze haber geç kalmaz). Daha uzunsa çalan cümle bir sonraki CÜMLE SONUNDA (kayıttaki gerçek nefes boşluğu) yumuşakça susar.
  const SES_BEKLE = 3.0, sesSinir = {};
  function sesCumleSinirlari(c) {   // cümle sonları: kayıttaki ≥0,25 sn'lik sessizliklerin ortası (sn, cümle başından)
    const k = c.k; if (sesSinir[k]) return sesSinir[k];
    const buf = sesBuf[k], r = [];
    if (buf) {
      const d = buf.getChannelData(0), sr = buf.sampleRate, w = Math.max(1, Math.round(sr * 0.02)); let pk = 0;
      for (let i = 0; i < d.length; i += 4) { const a = Math.abs(d[i]); if (a > pk) pk = a; }
      const esik = pk * 0.03; let bas = -1;
      for (let i = 0; i + w <= d.length; i += w) {
        let m = 0; for (let q = i; q < i + w; q += 2) { const a = Math.abs(d[q]); if (a > m) m = a; }
        if (m < esik) { if (bas < 0) bas = i; }
        else { if (bas >= 0 && (i - bas) / sr >= 0.25 && bas > sr * 0.3) r.push((bas + i) / 2 / sr); bas = -1; }
      }
    } else {   // kayıt yoksa (sessiz mod): noktalama oranından tahmin
      const L = LINES[k] || '';
      for (let i = 0; i < L.length - 2; i++) if (/[.!?]/.test(L[i]) && L[i + 1] === ' ') r.push((i + 1) / L.length * c.sure + 0.15);
    }
    if (buf) sesSinir[k] = r;   // tahmin önbelleğe alınmaz: kayıt çözülünce gerçeği ölçülür
    return r;
  }
  // Kritik talimatlar (QA turu 2): olay cümlesi gelse de sonuna kadar söylenir, gelen cümle bekler. "Üç çiçeğe dokun" Büyük Pofuduk'un ilk
  // aşamalarında hâlâ geçerli (yalnız uyanınca biter); kontrol öğreten cümleler hâlâ geçerliyse tamamlanır.
  const SES_KRITIK = {
    p_buyuk: () => sesBuyukAsama() < 3 && !sesSirada('p_buyuk_kalk') && !sesSirada('p_agac'),   // Büyük Pofuduk kalktıysa talimat eskidi
    p_merhaba: c => sesHalaGecerli(c), p_zipla: c => sesHalaGecerli(c), p_ciftzipla: c => sesHalaGecerli(c),
    p_minder: c => sesHalaGecerli(c) && !sesBitmis('p_minder', 'pofuduk'),                          // minder Pofuduk'a zıpladıysa bitti
    p_y_hayvan: c => sesHalaGecerli(c) && !sesSirada('p_y_hayvan_uyan') && !sesSirada('p_y_bitti'),  // "hepsine dokun" – kaplumbağa uyandıysa bitti
    p_i_yuz: c => sesHalaGecerli(c), p_i_ahtapot_yardim: c => sesHalaGecerli(c),
    p_takim1: () => true, p_takim2: () => true,
  };
  const sesSirada = k => sesSira.some(q => q.k === k);
  const sesHalaGecerli = c => !sesGecerli(Object.assign({}, c, { son: 1e9 }));
  function sesKritikMi(c) { if (!c || !SES_KRITIK[c.k]) return false; try { return !!SES_KRITIK[c.k](c); } catch (e) { return false; } }
  function sesYumusakKes(neden, s, zorla) {
    const c = sesCalan; if (!c) return;
    const t = sesSaat(), kalan = c.bas ? c.bas + c.sure - t : c.sure;
    let ne = kalan;   // yeni cümle en geç ne zaman başlayabilir
    const kritik = !zorla && sesKritikMi(c);
    if (kalan > SES_BEKLE && !kritik) {
      const simdi = c.bas ? t - c.bas : 0, b = sesCumleSinirlari(c).find(x => x > simdi + 0.05 && x < c.sure - 0.6);
      if (b != null) {
        ne = (c.bas || t) + b - t;
        if (!c.kesZ) c.kesZ = setTimeout(() => { if (sesCalan === c) sesKes(neden + ' (cümle sonunda)'); }, Math.max(0, ne * 1000));
      } else if (zorla) { sesKes(neden); return; }   // oyun bitti ve cümle sonu yok: yumuşakça sus
    }
    if (s) s.son = Math.max(s.son, t + ne + 2.5);
    sesNot('bekle', s ? s.k : '', c.k + ' ' + ne.toFixed(1) + ' sn');
  }
  function sesKes(neden) {
    if (sesCalan) sesNot('kes', sesCalan.k, neden);
    if (sesKaynak) {
      try {
        const now = sesKaynak.ac.currentTime;
        if (sesKaynak.ac.state !== 'running') {
          // Askıdaki saat ilerlemez: geleceğe stop koymak dönüşte eski sözü sızdırır.
          sesKaynak.s.stop(now);
          if (sesKaynak.s.disconnect) sesKaynak.s.disconnect();
          if (sesKaynak.g.disconnect) sesKaynak.g.disconnect();
        } else {
          sesKaynak.g.gain.cancelScheduledValues(now);
          sesKaynak.g.gain.setValueAtTime(Math.max(0.0001, sesKaynak.g.gain.value), now);
          sesKaynak.g.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
          sesKaynak.s.stop(now + 0.05);
        }
      } catch (e) {}
    }
    sesBitti();
  }
  function sesBitti() {
    if (sesBitisZ) { clearTimeout(sesBitisZ); sesBitisZ = null; }
    if (sesCalan) { sesSonBitis = sesSaat(); if (ovguMu(sesCalan.k)) sesSonOvgu = sesSonBitis; sesSonSure = sesCalan.bas ? clamp(sesSonBitis - sesCalan.bas, 0, sesCalan.sure) : 0; }
    sesCalan = null; sesKaynak = null;
    if (typeof AU !== 'undefined' && AU.kis) AU.kis(false);
    sesTik();
  }
  // her 0,1 sn: çalanı denetle; sıradakini, nefes payı dolunca başlat
  function sesTik() {
    if (sesCalan) { if (!sesSert(sesCalan) && !sesCalan.bitti) { sesCalan.bitti = 1; sesYumusakKes('oyun bitti', null, true); } return; }
    if (!sesSira.length) return;
    const baglam = typeof AU !== 'undefined' && AU.baglam && AU.baglam();
    const hazir = baglam && baglam.state === 'running';
    // Kilitli ses cümleyi sessizlikte tüketmesin. Yer/konu/sahne koşulları yine denetlenir.
    for (const s of sesSira) if (sesSesli(s.k)) sesBeklemeSuresi(s, !hazir);
    sesSira = sesSira.filter(s => { const n = sesGecerli(s); if (n) sesNot('at', s.k, n); return !n; });
    if (!sesSira.length) return;
    sesSira.sort(sesSirala);
    let i = -1;
    for (let j = 0; j < sesSira.length; j++) {
      const aday = sesSira[j];
      if (aday.sesDeneT && sesSaat() < aday.sesDeneT) continue;
      if (sesSesli(aday.k)) {
        if (!baglam) continue;
        if (!sesBuf[aday.k]) { sesSiraHazirla(aday); continue; }
        if (!hazir) continue;
      }
      if (sesSaat() < sesSonBitis + sesAra(aday)) continue;
      i = j; break;
    }
    if (i < 0) return;
    const s = sesSira.splice(i, 1)[0];
    sesBaslat(s);
  }
  function sesBaslat(s) {
    sesCalan = s;
    sesCozumle(s.k).then(buf => {
      if (sesCalan !== s) return;
      const gecersiz = sesGecerli(s);
      if (gecersiz) { sesNot('at', s.k, gecersiz); sesCalan = null; sesTik(); return; }
      let ac = null;
      if (sesSesli(s.k)) {
        ac = typeof AU !== 'undefined' && AU.baglam && AU.baglam();
        if (!buf || !ac || ac.state !== 'running') { sesGeriBeklet(s, !buf ? 'çözme' : 'kilitli'); return; }
      }
      const sure = buf ? buf.duration : sesSure(s.k);
      const kim = sesKim(s.k);
      let sesSonu = 0;
      if (ac) {
        try {
          const src = ac.createBufferSource(), gg = ac.createGain();
          src.buffer = buf;
          const hedefG = kim === 'a' ? 1.0 : 0.95, tStart = ac.currentTime + 0.12;
          gg.gain.value = 0.0001;
          gg.gain.setValueAtTime(0.0001, tStart);
          gg.gain.exponentialRampToValueAtTime(hedefG, tStart + 0.04);
          src.connect(gg); gg.connect(AU.sesCikis());
          AU.kis(true, kim);
          src.start(tStart);   // müzik önce kısılsın
          sesKaynak = { s: src, g: gg, ac };
          sesSonu = tStart + sure + .3;
          src.onended = () => { if (sesCalan === s) sesBitti(); };
        } catch (e) { if (typeof AU !== 'undefined' && AU.kis) AU.kis(false); sesGeriBeklet(s, 'başlatma'); return; }
      }
      s.sure = sure; s.bas = sesSaat() + 0.12;
      sesSoylendi[s.k] = 1; if (s.tek) sesSoylendi[s.tek] = 1; sesSonCal[s.k] = sesSaat();
      if (ovguMu(s.k)) { sesSonOvgu = sesSaat(); sesOvguGecmis.push(s.k); if (sesOvguGecmis.length > 3) sesOvguGecmis.shift(); }
      sesNot('cal', s.k, (s.bas - s.t).toFixed(1) + ' sn bekledi');
      if (typeof ARAYUZ !== 'undefined' && ARAYUZ.altyazi) ARAYUZ.altyazi(LINES[s.k], sure + 0.6, kim);
      OLAY.emit('konusma', { anahtar: s.k, kim, sure });
      // yedek zamanlayıcı (onended gelmezse / sessiz modda)
      const bitis = () => {
        if (sesCalan !== s) return;
        if (ac && (ac.state !== 'running' || ac.currentTime < sesSonu)) { sesBitisZ = setTimeout(bitis, 250); return; }
        sesBitti();
      };
      sesBitisZ = setTimeout(bitis, (sure + (ac ? 0.6 : 0.12)) * 1000);
    });
  }
  setInterval(sesTik, 100);
  OLAY.on('sesHazir', () => { for (const s of sesSira) s.sesDeneT = 0; sesTik(); });

  // oyun olaylarından durum
  OLAY.on('aydinlat', g => { sesAydinG[g || 'gol'] = true; });
  OLAY.on('buyukAsama', v => { if (v && v.asama) sesAsama = Math.max(sesAsama, v.asama); });
  OLAY.on('uyandi', o => { if (o && o.tip === 'buyukPofuduk') sesAsama = 3; });
  // Büyük Pofuduk Feza'yı tepeye fırlatınca yıldız izi onu çoğu zaman ağaca kendisi götürür: uçarken "ağaca dokun" deme.
  // ~2 sn sonra hâlâ tepede durup ağaca dokunmadıysa söyle.
  OLAY.on('ziplatti', o => {
    if (!(o && o.tip === 'buyukPofuduk' && o.uyandi)) return;
    sesBuyukZip = true; sesZipT = sesSaat();
    setTimeout(() => { const p = gP(); if (!agacYandi() && p && p.ground && (typeof DURUM === 'undefined' || DURUM === 'oyun')) soyle('p_agac'); }, 2200);
  });
  // Bölüm 2 olayları (yildiz.js): ilk yıldız uyanınca / birkaç yıldız yerleşince / hayvan uyanınca / gökyüzü dolunca Pırıl konuşur
  let sesYerlesen = 0;
  OLAY.on('yildiz', o => { if (sesYildizBekle && !(o && (o.hayvan || /hayvan/i.test(o.tip || '')))) { sesYildizBekle = false; sesYildizGec = true; soyle('p_y_yildiz'); } });
  OLAY.on('yildizYerlesti', () => { if (++sesYerlesen === 5) soyle('p_y_yildiz2'); });
  OLAY.on('hayvanHazir', () => soyle('p_y_hayvan_uyan'));
  OLAY.on('hayvanUyandi', () => soyle('p_y_bitti', { oncelik: 3 }));
  // Bölüm 3 olayları (kuzu.js, ucus.js, bulut.js, sekil.js): ilk kuzucuk renklenince / uçuşta / gökkuşağı başlayınca Pırıl konuşur.
  // Övgü ara sıra: ilk kuzucukta değil (onun kendi cümlesi var), sonrakilerde ~üçte bir (ses.js övgü aralığı ayrıca ≥12 sn).
  let sesKuzuN = 0, sesKuzuOvgu = 0, sesGokBasladi = false, sesUcusBitti = false, sesUcusOlay = false;
  const sesUcusta = () => sesUcusOlay || !!(gP() && gP().ucus);
  OLAY.on('kuzu', () => {
    sesKuzuN++;
    if (sesKuzuN === 1) { soyle('p_b_kuzu_ilk'); return; }
    if (sesKuzuN >= 7) return;   // son kuzucukta gökkuşağı/tepe cümleleri gelecek
    const sans = sesKuzuN - sesKuzuOvgu >= 3 ? 0.7 : 0.3;   // uzun süre övgü olmadıysa biraz daha olası
    if (Math.random() < sans) setTimeout(() => { if (!sesCalan && !sesSira.length) { sesKuzuOvgu = sesKuzuN; soyle('p_aferin'); } }, 900);
  });
  OLAY.on('ucusBasla', () => {
    sesUcusOlay = true; soyle('p_b_ucus');
    setTimeout(() => { if (sesUcusta()) soyle('p_b_ucus2'); }, 11000);   // uçuşun ortasında bir sevinç cümlesi
  });
  OLAY.on('ucusBitti', () => { sesUcusOlay = false; sesUcusBitti = true; });
  OLAY.on('gokkusagiBasla', () => { sesGokBasladi = true; soyle('p_b_bitti', { oncelik: 3 }); });
  OLAY.on('sekil', e => { if (!(e && e.hayvan === 'feza')) setTimeout(() => soyle('p_b_sekil3'), 1200); });   // Feza şeklinde sekil.js 'p_b_sekil4' der; söylendiyse tekrar edilmez
  // Uzun sessizlikte küçük dostça sözler (en çok 3 kez, en az 90 sn arayla; Feza oynarken, uçuş/sahne dışında, kimse konuşmuyorken)
  let sesDostN = 0, sesDostT = -1e9, sesHareketT = sesSaat(), sesOyunT = -1e9;
  OLAY.on('durum', d => { if (d === 'oyun' && sesOyunT < 0) sesOyunT = sesSaat(); });
  function sesDostUygun() {
    const p = gP(), d = typeof DURUM !== 'undefined' ? DURUM : '';
    return d === 'oyun' && !!p && !p.ucus && !(p.kilit > 0) && sesSaat() - sesSonBitis > 40 && sesSaat() - sesHareketT < 4;
  }
  setInterval(() => {
    const p = gP();
    if (p && Math.abs(p.vx || 0) > 40) sesHareketT = sesSaat();
    if (sesDostN >= 3 || sesCalan || sesSira.length || sesOyunT < 0) return;
    const t = sesSaat();
    if (t - sesOyunT < 60 || t - sesDostT < 90 || t - sesSonBitis < 50 || !sesDostUygun()) return;
    const bolum = typeof BOLUM_NO !== 'undefined' ? BOLUM_NO : 1;
    const ozel = bolum === 5 ? 'p_dost_volkan' : bolum === 4 ? 'p_dost_deniz' : bolum === 3 ? 'p_dost_bulut' : bolum === 2 ? 'p_dost_yildiz' : 'p_dost_orman';
    const aday = [ozel, 'p_dost1', 'p_dost2', 'p_dost3'].filter(k => LINES[k] && !sesSoylendi[k]);
    if (!aday.length) return;
    const k = sesDostN === 0 ? aday[0] : aday[Math.floor(Math.random() * aday.length)];
    sesDostN++; sesDostT = t; soyle(k);
  }, 2000);
  // seçim ekranı (DURUM 'baslik'): "Bu gece nereye gidelim?" ilk açılışta 1 kez; sonra yalnız ~25 sn hiç dokunulmazsa 1 kez daha
  let sesSecimN = 0, sesSecimT = 0;
  OLAY.on('denizati', () => { if (typeof BOLUM_NO !== 'undefined' && BOLUM_NO === 4) soyle('p_i_denizati_ilk', { oncelik: 2 }); });
  OLAY.on('secim', () => { sesSecimT = sesSaat(); });
  OLAY.on('secimIlgi', () => { sesSecimT = sesSaat(); });   // boş dokunuş: yalnız sayaç sıfırlanır (ses çalmaz)
  const sesSecimBasla = d => {
    if (d !== 'baslik' || sesSecimN) return;
    sesSecimN = 1; sesSecimT = sesSaat();
    setTimeout(() => { if (typeof DURUM !== 'undefined' && DURUM === 'baslik') { soyle('p_secim'); sesSecimT = sesSaat(); } }, 1400);
    const bekle = () => {
      if (typeof DURUM === 'undefined' || DURUM !== 'baslik') return;
      if (sesSaat() - sesSecimT >= 25 && !sesCalan && sesSecimN < 2) { sesSecimN = 2; soyle('p_secim'); return; }
      setTimeout(bekle, 2000);
    };
    setTimeout(bekle, 3000);
  };
  OLAY.on('durum', sesSecimBasla);
  setTimeout(() => sesSecimBasla(typeof DURUM !== 'undefined' ? DURUM : ''), 1500);   // 'durum' olayı kaçmışsa
  let sesHazir = false;
  OLAY.on('durum', d => {
    if (d === 'final' || d === 'son') sesSira = sesSira.filter(s => s.oncelik >= 3);   // oyun bitti: kalan ipuçları gereksiz
    if (!sesHazir && !SESSIZ) { sesHazir = true; setTimeout(sesOnceden, 400); }        // ses bağlamı artık var
    sesTik();
  });
  function sus() {   // sahne atlanınca vb.: susar ve sırayı boşaltır
    sesSira = [];
    if (sesCalan) sesKes('sus');
    else if (typeof AU !== 'undefined' && AU.kis) AU.kis(false);
  }
  return { LINES, soyle, sus, konusuyor: () => !!sesCalan, sure: k => LINES[k] ? sesSure(k) : 0, kayit, sira: () => sesSira.map(s => s.k), _sinir: k => LINES[k] ? sesCumleSinirlari({ k, sure: sesSure(k) }).map(x => +x.toFixed(2)) : null };
})();

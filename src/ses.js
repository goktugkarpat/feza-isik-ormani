/* ses.js – seslendirme (anlatıcı + Pırıl) ve altyazı. Cümleler aşağıdaki SESLER bloğunda (geçerli JSON);
   değişince `python gen_voice.py` → sesler.js (window.VOICE_MP3 / VOICE_DUR). Anahtar öneki: a_ anlatıcı, p_ Pırıl.
   Sözleşme: src/SPEC.md › "Ses". */
'use strict';
const SES = (() => {
  const LINES = /*SESLER*/{
    "p_merhaba": "Hadi Feza, şu parlayan çiçeğe gidelim!",
    "p_zipla": "Zıplamak için düğmeye bas!",
    "p_uyuyor": "Şşş, bir Pofuduk uyuyor! Üstüne zıplayıp uyandıralım mı?",
    "p_ciftzipla": "Havadayken bir daha bas, ben seni iterim!",
    "p_buyuk": "Vay, ne kocaman bir Pofuduk! Çiçekleri açarsak uyanır."
  }/*SESLER-SON*/;
  function soyle(k) {
    const metin = LINES[k]; if (!metin) return;
    if (typeof ARAYUZ !== 'undefined') ARAYUZ.altyazi(metin, (window.VOICE_DUR && VOICE_DUR[k]) || 3);
    if (SESSIZ || !window.VOICE_MP3 || !VOICE_MP3[k]) return;
    try { const a = new Audio('data:audio/mpeg;base64,' + VOICE_MP3[k]); a.play().catch(() => {}); } catch (e) {}
  }
  return { LINES, soyle };
})();

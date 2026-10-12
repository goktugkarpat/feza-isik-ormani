/* sahne.js – açılış (yatak odası → orman rüyası) ve kapanış (sabah) sahneleri. Sözleşme: src/SPEC.md › "Sahneler".
   Şimdilik yer tutucu: sahneler hemen biter. */
'use strict';
const SAHNE = {
  giris(bitince) { bitince(); },
  final(bitince) { bitince(); },
  tamEkran() { return false; },   // true → oyun dünyası çizilmez, sahne tüm ekranı çizer
  ciz(tm, dt) {},
};

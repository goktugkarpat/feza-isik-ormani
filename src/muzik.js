/* muzik.js – müzik ve sesler (Web Audio ile üretilir, AU)
   Klasik script: üst düzey const/let/function'lar diğer dosyalarla ortak (ortak.js önce yüklenir). */
'use strict';
// ── müzik ve sesler (Web Audio ile üretilir) ──
const AU = (() => {
  let ac = null, master, rev, dly, music, wet;
  const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
  // akorlar (MIDI): Dmaj9 – Bm9 – Gmaj7 – Asus
  const CH = [[50, 54, 57, 61, 64], [47, 50, 54, 57, 61], [43, 50, 54, 59, 62], [45, 50, 52, 57, 59]];
  const SCALE = [74, 76, 78, 81, 83, 86, 88, 90, 93];
  let ci = 0, nextChord = 0, nextNote = 0, melIdx = 3, beat = 0;
  function impulse(sec) {
    const len = ac.sampleRate * sec, b = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    return b;
  }
  function start() {
    if (SESSIZ || ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.gain.value = 0; master.gain.linearRampToValueAtTime(0.85, ac.currentTime + 3);
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ac.destination);
    rev = ac.createConvolver(); rev.buffer = impulse(5.5);
    wet = ac.createGain(); wet.gain.value = 0.75; rev.connect(wet); wet.connect(master);
    dly = ac.createDelay(1); dly.delayTime.value = 0.45; const fb = ac.createGain(); fb.gain.value = 0.38;
    const dlf = ac.createBiquadFilter(); dlf.type = 'lowpass'; dlf.frequency.value = 2600;
    dly.connect(dlf); dlf.connect(fb); fb.connect(dly); dlf.connect(rev); dlf.connect(master);
    music = ac.createGain(); music.gain.value = 0.9; music.connect(master); music.connect(rev);
    // rüzgâr
    const nb = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate), nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ns = ac.createBufferSource(); ns.buffer = nb; ns.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.7;
    const ng = ac.createGain(); ng.gain.value = 0.02;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.07; const lg = ac.createGain(); lg.gain.value = 300; lfo.connect(lg); lg.connect(bp.frequency); lfo.start();
    ns.connect(bp); bp.connect(ng); ng.connect(master); ng.connect(rev); ns.start();
    nextChord = nextNote = ac.currentTime + 0.3;
    setInterval(tick, 100);
    if (ac.state === 'suspended') ac.resume();
  }
  function pad(notes, t0, dur) {
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600 + light * 1400; lp.Q.value = 0.4;
    const vg = ac.createGain(); vg.gain.setValueAtTime(0, t0); vg.gain.linearRampToValueAtTime(0.045, t0 + 3); vg.gain.setValueAtTime(0.045, t0 + dur - 1); vg.gain.linearRampToValueAtTime(0, t0 + dur + 3.5);
    lp.connect(vg); vg.connect(music);
    for (const n of notes) for (const [type, det, lvl] of [['triangle', -7, 0.5], ['sawtooth', 6, 0.18], ['sine', 0, 0.6]]) {
      const o = ac.createOscillator(); o.type = type; o.frequency.value = NOTE(n); o.detune.value = det;
      const og = ac.createGain(); og.gain.value = lvl; o.connect(og); og.connect(lp); o.start(t0); o.stop(t0 + dur + 4);
    }
    const b = ac.createOscillator(); b.type = 'sine'; b.frequency.value = NOTE(notes[0] - 12);
    const bg = ac.createGain(); bg.gain.setValueAtTime(0, t0); bg.gain.linearRampToValueAtTime(0.09, t0 + 2); bg.gain.linearRampToValueAtTime(0, t0 + dur + 2);
    b.connect(bg); bg.connect(music); b.start(t0); b.stop(t0 + dur + 3);
  }
  function bell(freq, t0, vol = 0.07, decay = 2.2, pan = 0, toDelay = true) {
    const out = ac.createGain(); out.gain.setValueAtTime(0.0001, t0); out.gain.exponentialRampToValueAtTime(vol, t0 + 0.006); out.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
    const p = ac.createStereoPanner ? ac.createStereoPanner() : null;
    for (const [m, l] of [[1, 1], [2.0, 0.18], [3.01, 0.08], [4.2, 0.05]]) {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = freq * m;
      const og = ac.createGain(); og.gain.value = l; o.connect(og); og.connect(out); o.start(t0); o.stop(t0 + decay + 0.1);
    }
    if (p) { p.pan.value = pan; out.connect(p); p.connect(music); if (toDelay) p.connect(dly); }
    else { out.connect(music); if (toDelay) out.connect(dly); }
  }
  function tick() {
    const t = ac.currentTime;
    while (nextChord < t + 0.5) { pad(CH[ci % CH.length], nextChord, 9.6); ci++; nextChord += 9.6; }
    while (nextNote < t + 0.3) {
      const chord = CH[(ci - 1 + CH.length) % CH.length];
      const p = 0.42 + light * 0.3 + (beat % 4 === 0 ? 0.2 : 0);
      if (Math.random() < p) {
        melIdx = clamp(melIdx + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)], 0, SCALE.length - 1);
        let n = SCALE[melIdx];
        if (beat % 4 === 0) { const ct = chord.map(c => c + 24).filter(c => c >= 72 && c <= 93); if (ct.length) n = ct[Math.floor(Math.random() * ct.length)]; }
        bell(NOTE(n), nextNote, 0.05 + Math.random() * 0.025, 2.4, (Math.random() - 0.5) * 0.7);
        if (light > 0.45 && Math.random() < light * 0.4) bell(NOTE(n + 12), nextNote + 0.2, 0.025, 1.6, (Math.random() - 0.5) * 0.9);
      }
      beat++; nextNote += 0.6;
    }
  }
  function sfx(k, v = 1) {
    if (!ac) return;
    const t = ac.currentTime;
    if (k === 'jump') { bell(NOTE(86), t, 0.045, 0.7, 0, false); whoosh(t, 700, 2200, 0.25, 0.06); }
    else if (k === 'dbl') { [86, 90, 93, 98].forEach((n, i) => bell(NOTE(n), t + i * 0.055, 0.05, 1.4, (i - 1.5) * 0.3)); whoosh(t, 900, 4000, 0.4, 0.07); }
    else if (k === 'bloom') { const base = v ? [62, 69, 74, 78, 81, 86, 90] : [74, 78, 81, 86, 90]; base.forEach((n, i) => bell(NOTE(n), t + i * 0.09, 0.06, 3.2, (i / base.length - 0.5))); }
    else if (k === 'land') { const o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.15); og.gain.setValueAtTime(0.12 * v, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.25); }
    else if (k === 'splash') { whoosh(t, 1800, 400, 0.6, 0.1); }
  }
  function whoosh(t, f0, f1, d, vol) {
    const len = Math.floor(ac.sampleRate * d), b = ac.createBuffer(1, len, ac.sampleRate), dd = b.getChannelData(0);
    for (let i = 0; i < len; i++) dd[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(); s.buffer = b;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + d);
    const gg = ac.createGain(); gg.gain.setValueAtTime(0.0001, t); gg.gain.exponentialRampToValueAtTime(vol, t + d * 0.3); gg.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(gg); gg.connect(master); gg.connect(rev); s.start(t);
  }
  return { start, sfx };
})();


# Feza ve Pırıl: Işık Ormanı — modül sözleşmesi

Audience: Feza, 5 years old, on an iPad (also desktop Chrome). Turkish only. Nothing scary, no insects, no fail state.
Plain Canvas 2D, classic `<script>` files (no ES modules, no libraries), must work from `file://`. `?sessiz` = no sound
(always use it when testing). `?atla` = skip title + intro, start playing immediately.

## Files and owners (each agent edits ONLY its own files)
| file | owns | main globals |
|---|---|---|
| `ortak.js` | lead | helpers (`clamp lerp smooth rng hex mixc`), `T=40`, `VH=560`, `W H DPR S VW`, `PAL/C()`, `light/lightTarget`, `glow/dglow`, `P` (Feza physics), `D` (Pırıl state), `parts/ripples/burst`, `OLAY`, `TUR`, `NESNELER`, `DURUM`, `now` |
| `bolum.js` | level designer | `ROWS COLS grid ground() plat() topOf() cell() yuzey() nx() nesne()`, `BOLUM` (start, regions, lake), the object list, `FLOWERS` (= cicek objects), `TREE` (= agac object) |
| `oyun.js` | mechanics | input (`GIRDI`), physics (`moveX/moveY/stepPlayer`, `CISIMLER`), object runtime, `SAYAC`, `HEDEF()`, `finaleGec()`, camera `cam/stepCam`, `drawFx`, main loop, `window.OYUN` test hooks |
| `dunya.js` | world artist | `drawBackground drawMotes drawWorld drawPetals drawForeground drawVignette`, world object types: `cicek tohum nilufer agac` visuals |
| `feza.js` | Feza animator | `fezaUpdate(dt)`, `drawFeza(tm)` |
| `piril.js` | Pırıl animator | `stepDragon dragonPush dragonHappy dragonCarry drawDragon`, light breath (`karanlik` type), guidance |
| `pofuduk.js` | creature artist | types `pofuduk`, `buyukPofuduk` |
| `sahne.js` | cutscenes | `SAHNE` |
| `arayuz.js` | UI | `ARAYUZ` |
| `muzik.js`, `ses.js`, `gen_voice.py`, `sesler.js` | audio | `AU` (music + sfx), `SES` (voice + subtitles) |
| `index.html`, `sw.js`, `manifest.webmanifest`, `icons/` | lead | |

Top-level `const/let/function` names are shared across all files: prefix your private globals (`dn*` dunya, `fz*` feza,
`dr*` piril, `pf*` pofuduk, `sh*` sahne, `ui*` arayuz, `au*`/`ses*` audio, `bl*` bolum). Never rename the public names above.
If you need something from a file you don't own, use events (`OLAY`) or ask the lead in your final report.

## Frame order (oyun.js `frame`)
readInput → stepPlayer (only in DURUM 'oyun') → `TUR.guncelle` for every object → `fezaUpdate` → `stepDragon` → `stepCam` →
(unless `SAHNE.tamEkran()`) `drawBackground` → `drawMotes(0,.75)` → `drawWorld` → objects `ciz` → `drawFeza` → `drawDragon` →
objects `cizOn` → `drawFx` → `drawPetals` → `drawMotes(.75,2)` → `drawForeground` → `drawVignette` → `SAHNE.ciz` → `ARAYUZ.ciz`.
World transform for world drawing: `g.setTransform(S,0,0,S,-cam.x*S,-cam.y*S)`. Screen drawing: identity, canvas pixels.

## Coordinates and physics
World units; a tile is `T=40`; row 0 is the top; y grows downward. `P.x,P.y` = Feza's feet (box `PW=11` half width, `PH=60` tall).
Run speed 250/s; jump −730 (≈ 118 units ≈ 3 tiles high); mid-air second jump −650 (Pırıl pushes; total ≈ 5.5 tiles);
gravity 2200 (×1.25 falling, ×2.1 rising when the button is released). Falling below the level → Pırıl carries him back to
the last safe spot (no penalty). Grid cells: 0 empty, 1 solid ground, 2 one-way platform (land from above).

## Objects (`NESNELER`, built by bolum.js with `nesne(tip, column, y, props)`)
Every object: `{tip, x, y (bottom-centre, world), id, ...}`. Behaviour comes from `TUR.kaydet(tip, handler)`:
- `kur(o)` once at start; may set `o.cisim = {w, h, tip:'kati'|'ustten'|'ziplat', guc, aktif, dx, dy}` → a physics box whose
  bottom-centre is `o.x,o.y`. `kati` solid, `ustten` one-way top, `ziplat` bounces Feza up with `guc`. Set `dx/dy` to the
  box's movement this frame if it moves (Feza standing on it is carried).
- `guncelle(o, dt)` every frame; `ciz(o, tm)` behind Feza; `cizOn(o, tm)` in front (world transform set).
- `ustune(o, vy)` Feza landed on top (stomp / bounce). `dokun(o)` Feza came within `o.r` of the object (fires once; set
  `o.dokundu=false` to re-arm). `TUR.kaydet` merges, so several files may add methods to the same type.

Types: `cicek` (main light flower; touching opens it → `OLAY 'cicek'`, light rises, `o.done`), `tohum` (hidden seed, optional),
`pofuduk` (`o.tur`: 'yol' blocks the path until stomped, then follows Feza; 'minder' becomes a bounce pad; 'basamak' becomes a
step), `buyukPofuduk` (blocks the tree; wakes as the flowers with `buyukIcin:true` open; then bounces Feza to the tree),
`karanlik` (dark spot: Pırıl flies there and breathes light → `OLAY.emit('aydinlat', o.grup)`), `nilufer` (lily pad in group
`o.grup`; appears on 'aydinlat'; one-way platform), `agac` (the Great Light Tree; touching it after the big Pofuduk is awake →
'agac' event → finale), `konusma` (invisible trigger: `SES.soyle(o.anahtar)` once).

## Events (`OLAY.on(name, fn)`, `OLAY.emit(name, data)`)
`durum` (new DURUM) · `ziplama` · `ciftZiplama` · `inis` {x,y,siddet} · `ziplatti` (o) · `carpti` (o) · `dustu` · `kurtarildi` ·
`cicek` (o) · `tohum` (o) · `uyandi` (o) · `karanlik` via `dokun:karanlik` · `aydinlat` (grup) · `agac` (o) · `dokun:<tip>` (o) ·
`dokunus` (screen tap during cutscenes) · `boyut` (resize).

## Game flow (`DURUM`)
`baslik` (title; any tap → `begin()`) → `giris` (`SAHNE.giris(done)`) → `oyun` → tree lit → `finaleGec()` → `final`
(`SAHNE.final(done)`) → `son` (end screen by ARAYUZ, counts in `SAYAC`). `SAHNE.tamEkran()` true = the cutscene draws the whole
screen. `P.kilit = seconds` freezes the controls briefly (cutscene moments).

## Input
iPad: a medium jump button bottom-left (`GIRDI.dugme` {x,y,r} in CSS px, `basili`), pressed with the left hand; touching and
holding anywhere else makes Feza walk toward that side of the screen (`GIRDI.hedefX`). Keyboard backup: arrows/A-D, Space/W/↑.

## Story (one level, 5–7 min)
Opening: night, Feza in bed hugging his sleep buddy Pırıl (a purple baby dragon plush). He falls asleep; Pırıl's eyes open, she
glows; the room melts into the Light Forest (blanket→moss, night-light→moon, curtains→vines, rug pattern→glowing mushrooms).
Pırıl: "Feza, uyan! Ormanımızın ışığı sönmüş, bize yardım lazım!" Sections: 1 Uyanış Patikası (learn) → 2 İlk Pofuduk (stomp to
wake) → 3 Karanlık Göl (Pırıl's light breath reveals lily pads; reflections in the water) → 4 Yüksek Dallar (bounce Pofuduk,
double jump) → 5 Saklı Yol (optional, 3 seeds) → 6 Açıklık: Büyük Pofuduk snoring before the tree; 3 flowers wake him; he
bounces Feza up → tree lights → finale: colour wave, Pofuduks dance, light fills the screen → morning, Feza wakes in bed with
Pırıl, who winks. Narrator: "Ve her gece, yeni bir macera onları bekliyordu..." Narrator + Pırıl voices: edge-tts
`tr-TR-EmelNeural` (Pırıl: same voice, higher pitch/faster). Praise only occasionally and varied.

## Quality bar
Ori-like (≈75%) with a little Gris; silky 60 fps on iPad (2048×1536 canvas): no per-frame `ctx.filter`/`shadowBlur`, cache
offscreen canvases, keep allocations low. Smooth animation everywhere; no pops. Readable characters. Kid-friendly.

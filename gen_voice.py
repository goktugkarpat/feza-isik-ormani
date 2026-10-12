#!/usr/bin/env python3
"""Feza ve Pırıl: Işık Ormanı – records every voice line (SES.LINES in src/ses.js) and writes sesler.js.

Needs:  python3 -m pip install edge-tts   (internet while recording)   and ffmpeg
Run:    python3 gen_voice.py            only new/changed lines are recorded; the rest come from .ses_onbellek/
        python3 gen_voice.py --hepsi    record everything again

Voice: tr-TR-EmelNeural (natural Turkish female). Key prefix chooses the delivery:
  a_  narrator – slower, slightly lower, tender bedtime-story tone
  p_  Pırıl    – same voice, a little higher (+25 Hz) and a bit faster: a sweet little dragon, not a chipmunk.
               (edge-tts shifts the formants together with the pitch: measured +15 % at +25 Hz, +26 % at +38 Hz.)
Output: sesler.js  →  window.VOICE_MP3 = {key: base64 mp3}  and  window.VOICE_DUR = {key: seconds}.
"""
import asyncio
import base64
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time

import edge_tts
import edge_tts.communicate as _etc

# Oct 2026: the old Read Aloud host started answering 403 in some regions (edge-tts issue #490 / PR #491).
# The same key works on Edge's new host; on a 403 we switch hosts (and back, if the new one ever fails).
_KEY = "6A5AA1D4EAFF4E9FB37E23D68491D6F4"
_HOSTS = [_etc.WSS_URL, f"wss://api.msedgeservices.com/tts/cognitiveservices/websocket/v1?Ocp-Apim-Subscription-Key={_KEY}"]
_host = {"i": 1}


def _use_host(i):
    _host["i"] = i % len(_HOSTS)
    _etc.WSS_URL = _HOSTS[_host["i"]]
    if _host["i"] == 1:
        _etc.WSS_HEADERS["Ocp-Apim-Subscription-Key"] = _KEY
    else:
        _etc.WSS_HEADERS.pop("Ocp-Apim-Subscription-Key", None)


_use_host(1)

VOICE = "tr-TR-EmelNeural"
STYLE = {            # prefix → (rate, pitch, volume)
    "a_": ("-18%", "-3Hz", "+0%"),
    "p_": ("+6%", "+25Hz", "+0%"),   # +25 Hz: F0 ≈ 250 Hz, formants +15 % (a young girl); +38 Hz moved formants +26 % (chipmunk-ish)
}
DEFAULT = ("-5%", "+2Hz", "+0%")
# Pırıl's "how to play" lines are said a touch slower than her happy chatter: Feza learns the controls from them.
TEACH = {"p_merhaba", "p_zipla", "p_ciftzipla", "p_minder", "p_buyuk", "p_uyuyor", "p_sakli"}
TEACH_RATE = "-2%"

# How words should *sound* (subtitles keep the normal spelling). Regex → spoken form.
# Avoid short capitalised words the engine may read as abbreviations ("Aa" was read as "Anadolu Ajansı").
PRONOUNCE = [
    (r"\.\.\.", "."),          # trailing dots: let the engine end the sentence calmly
]

ROOT = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(ROOT, ".ses_onbellek")
OUT = os.path.join(ROOT, "sesler.js")
SRC = os.path.join(ROOT, "src", "ses.js")


def remove_temp(path):
    try:
        os.remove(path)
    except (FileNotFoundError, PermissionError):
        pass  # a synced (Dropbox) folder may briefly hold a finished temporary file


FFMPEG = "/opt/homebrew/bin/ffmpeg" if os.path.exists("/opt/homebrew/bin/ffmpeg") else shutil.which("ffmpeg")
FFPROBE = "/opt/homebrew/bin/ffprobe" if os.path.exists("/opt/homebrew/bin/ffprobe") else shutil.which("ffprobe")
# 1) shorten long pauses between sentences to ~0.4 s, 2) keep ~40 ms before the first sound and
# 3) ~120 ms after the last one (reverse trick trims the tail), 4) tiny fades against clicks, 5) gentle loudness match.
TRIM = ("silenceremove=stop_periods=-1:stop_threshold=-40dB:stop_duration=0.1:stop_silence=0.34,"
        "silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.04:detection=peak,"
        "areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.12:detection=peak,"
        "afade=t=in:d=0.03,areverse,afade=t=in:d=0.006,"
        "loudnorm=I=-18:TP=-2:LRA=11")


def style(key):
    for pre, st in STYLE.items():
        if key.startswith(pre):
            return (TEACH_RATE,) + st[1:] if key in TEACH else st
    return DEFAULT


def spoken(text):
    for pat, rep in PRONOUNCE:
        text = re.sub(pat, rep, text)
    return text


def load_lines():
    m = re.search(r"/\*SESLER\*/(.*?)/\*SESLER-SON\*/", open(SRC, encoding="utf-8").read(), re.S)
    if not m:
        sys.exit("LINES block (/*SESLER*/ ... /*SESLER-SON*/) not found in src/ses.js")
    return json.loads(m.group(1))


def cache_path(key, text):
    rate, pitch, vol = style(key)
    h = hashlib.md5(f"{VOICE}|{rate}|{pitch}|{vol}|{TRIM}|{spoken(text)}".encode("utf-8")).hexdigest()
    return os.path.join(CACHE, h + ".mp3")


def duration(path):
    try:
        r = subprocess.run([FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                           capture_output=True, text=True, timeout=20)
        return float(r.stdout.strip())
    except Exception:
        return 0.0


def trim(raw, final):
    """Cut leading/trailing silence and re-encode as small mono mp3. Falls back to the raw file without ffmpeg."""
    if not FFMPEG:
        shutil.move(raw, final)
        return
    tmp = final + ".tmp.mp3"
    r = subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", raw, "-af", TRIM,
                        "-ac", "1", "-ar", "24000", "-c:a", "libmp3lame", "-b:a", "48k", tmp])
    if r.returncode == 0 and os.path.exists(tmp) and os.path.getsize(tmp) > 800:
        os.replace(tmp, final)
        remove_temp(raw)
    else:
        if os.path.exists(tmp):
            remove_temp(tmp)
        shutil.move(raw, final)


async def record(key, text, sem):
    final = cache_path(key, text)
    raw = final + ".raw.mp3"
    rate, pitch, vol = style(key)
    async with sem:
        for attempt in range(6):
            try:
                await edge_tts.Communicate(spoken(text), VOICE, rate=rate, pitch=pitch, volume=vol).save(raw)
                if os.path.getsize(raw) < 1000:
                    raise RuntimeError("empty audio")
                trim(raw, final)
                return True
            except Exception as e:  # network hiccup / rate limit: back off and retry
                if os.path.exists(raw):
                    remove_temp(raw)
                if "403" in str(e) and attempt % 2 == 0:
                    _use_host(_host["i"] + 1)
                if attempt == 5:
                    print(f"  FAILED {key}: {e}")
                    return False
                await asyncio.sleep(1.5 * (attempt + 1))


async def main():
    os.makedirs(CACHE, exist_ok=True)
    lines = load_lines()
    if "--hepsi" in sys.argv:
        for k, t in lines.items():
            if os.path.exists(cache_path(k, t)):
                os.remove(cache_path(k, t))
    todo = [(k, t) for k, t in lines.items() if not os.path.exists(cache_path(k, t))]
    print(f"{len(lines)} lines, {len(todo)} to record ({VOICE})")
    sem = asyncio.Semaphore(4)
    await asyncio.gather(*(record(k, t, sem) for k, t in todo))

    mp3, dur, missing = {}, {}, []
    for k, t in lines.items():
        p = cache_path(k, t)
        d = duration(p) if os.path.exists(p) else 0.0
        if d < 0.25:
            missing.append(k)
            continue
        mp3[k] = base64.b64encode(open(p, "rb").read()).decode("ascii")
        dur[k] = round(d, 3)
        letters = len(re.sub(r"[^\wçğıöşüÇĞİÖŞÜ]", "", t))
        lps = letters / max(0.2, d - 0.16)   # minus the kept head/tail padding
        lo, hi = (7.5, 15.5) if k.startswith("a_") else (8.5, 18.5)
        flag = "   <-- check (unusual speed: maybe read as an abbreviation?)" if lps < lo or lps > hi else ""
        print(f"  {k:14s} {d:5.2f} s  {lps:4.1f} letters/s{flag}")

    if missing:
        print("MISSING (existing voice bank preserved):", ", ".join(missing))
        sys.exit(1)
    temp_out = OUT + ".tmp"
    with open(temp_out, "w", encoding="utf-8", newline="\n") as f:   # LF also on Windows (the Mac commits it)
        f.write("// Feza ve Pırıl: Işık Ormanı – voice lines (tr-TR-EmelNeural; a_ narrator, p_ Pırıl), trimmed mono mp3 as base64.\n"
                "// Bu dosya gen_voice.py ile üretildi; elle değiştirmeyin. Cümleler: src/ses.js › LINES.\n")
        f.write("window.VOICE_MP3 = {\n")
        f.write(",\n".join(f" {json.dumps(k)}: \"{v}\"" for k, v in mp3.items()))
        f.write("\n};\n")
        f.write("window.VOICE_DUR = " + json.dumps(dur, ensure_ascii=False) + ";\n")
    for attempt in range(10):   # Windows/Dropbox may briefly lock the old file
        try:
            os.replace(temp_out, OUT)
            break
        except PermissionError:
            if attempt == 9:
                raise
            time.sleep(0.5)
    keep = {os.path.basename(cache_path(k, t)) for k, t in lines.items()}
    for f in os.listdir(CACHE):  # drop recordings of lines that no longer exist and temp leftovers
        if f.endswith(".mp3") and f not in keep:
            remove_temp(os.path.join(CACHE, f))

    size = os.path.getsize(OUT) / 1024
    print(f"wrote sesler.js: {len(mp3)} lines, {sum(dur.values()):.1f} s audio, {size:.0f} KB")


asyncio.run(main())

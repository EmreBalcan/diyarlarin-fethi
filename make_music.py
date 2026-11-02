"""Generate two original, phase-aligned 16-second battle beds for the game."""
import math
import struct
import wave
from pathlib import Path

RATE = 22050
DURATION = 16
OUT = Path(__file__).parent / 'public' / 'audio'
OUT.mkdir(parents=True, exist_ok=True)


def tone(freq, seconds, shape='horn'):
    phase = 2 * math.pi * freq * seconds
    if shape == 'strings':
        return math.sin(phase) * .64 + math.sin(phase * 2) * .19 + math.sin(phase * 3) * .07
    return math.sin(phase) * .7 + math.sin(phase * 2) * .2 + math.sin(phase * 3) * .08


def render(name, roots, city=False):
    values = []
    for i in range(RATE * DURATION):
        t = i / RATE
        bar = int(t / 4)
        beat = t % 1
        root = roots[bar]
        # Each four-second chord resolves back to the opening chord at the seam.
        pad = sum(tone(root * ratio, t, 'strings') for ratio in (1, 1.5, 2)) * .095
        melody = tone(root * (2 if city else 1.5), t) * (.065 if (int(t * 2) % 8) in (0, 1, 4, 5) else .012)
        drum = math.sin(2 * math.pi * (62 if city else 48) * beat) * math.exp(-beat * (18 if city else 13)) * (.18 if city else .12)
        pulse = math.sin(2 * math.pi * root / 2 * t) * (.035 if city else .028)
        edge = min(1, t / .12, (DURATION - t) / .12)
        values.append(max(-1, min(1, (pad + melody + drum + pulse) * edge)))
    with wave.open(str(OUT / name), 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(struct.pack('<' + 'h' * len(values), *(round(v * 32767) for v in values)))


render('army-theme.wav', [110, 98, 87.31, 110])
render('city-theme.wav', [82.41, 77.78, 73.42, 82.41], True)

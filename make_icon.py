from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).parent / 'android/app/src/main/res'
SIZE = 512

def art():
    image = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    d = ImageDraw.Draw(image)
    d.rounded_rectangle((18, 18, 494, 494), radius=100, fill='#172820', outline='#d5b672', width=17)
    d.ellipse((63, 63, 449, 449), fill='#3b5b59', outline='#9f814d', width=9)
    # Three realms, shown as large readable terrain shapes at launcher size.
    d.pieslice((74, 74, 438, 438), 175, 290, fill='#63814a')
    d.pieslice((74, 74, 438, 438), 290, 45, fill='#b58a50')
    d.pieslice((74, 74, 438, 438), 45, 175, fill='#d8e0dc')
    d.line([(110, 355), (245, 245), (400, 325)], fill='#efe0ac', width=14, joint='curve')
    d.line([(170, 130), (245, 245), (375, 118)], fill='#efe0ac', width=11, joint='curve')
    # Central fortress with an unmistakable gold standard.
    d.polygon([(188, 280), (188, 196), (218, 196), (218, 173), (245, 173), (245, 196), (269, 196), (269, 163), (298, 163), (298, 198), (325, 198), (325, 282)], fill='#263a39', outline='#f1d28b')
    d.rectangle((206, 223, 305, 338), fill='#d5ba82', outline='#2b3029', width=8)
    d.polygon([(191, 226), (255, 174), (320, 226)], fill='#e9cf92', outline='#2b3029')
    d.rectangle((248, 124, 262, 188), fill='#f1d28b')
    d.polygon([(262, 127), (328, 143), (262, 158)], fill='#a72f2c')
    d.rounded_rectangle((240, 271, 274, 338), radius=16, fill='#354f75')
    d.ellipse((72, 72, 440, 440), outline='#d9bd7f', width=9)
    return image

base=art()
sizes={'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}
for density, size in sizes.items():
    folder=ROOT / f'mipmap-{density}'
    for name in ('ic_launcher.png','ic_launcher_round.png'):
        base.resize((size,size),Image.Resampling.LANCZOS).save(folder/name)
    base.resize((round(size*2.25),round(size*2.25)),Image.Resampling.LANCZOS).save(folder/'ic_launcher_foreground.png')

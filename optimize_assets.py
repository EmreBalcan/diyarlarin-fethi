from pathlib import Path
from PIL import Image

HERE = Path(__file__).parent
GENERATED = Path(r'C:\Users\EMRE\.codex\generated_images\01a12b97-d6c2-7203-9b50-88c3354d858b')
NEW = {
    'city-snow-2': 'exec-b3c4092b-8b2c-4abb-bd48-d76b62f2b86e.png',
    'city-snow-3': 'exec-a1114793-63b8-4f66-92c1-4e3dc562b005.png',
    'city-forest-2': 'exec-58f8cbe5-0efc-47d2-ad3e-fc64703c9837.png',
    'city-forest-3': 'exec-d02e90c4-c6f5-4d59-9af5-06c0145d326e.png',
    'city-forest-4': 'exec-8c98195d-004d-4d58-97fc-dc02e99bf09c.png',
    'city-desert-2': 'exec-55ef9449-395a-4031-aaf2-b8a58a3a5b57.png',
    'city-desert-3': 'exec-a9e45e24-1c8c-4493-af52-823852954cd5.png',
    'city-desert-4': 'exec-5b731c73-7df6-480f-99c0-337b4abd23f8.png',
    'city-desert-5': 'exec-398bdd44-63d9-4167-b612-fceab7b65c5a.png',
    'mountain-dry': 'exec-b2a8bd41-2484-4fe2-8034-36c762f855b9.png',
    'river-ford': 'exec-5bceabd3-690a-482b-b531-71c125af6718.png',
}

for name, filename in NEW.items():
    source = GENERATED / filename
    with Image.open(source) as image:
        image.save(HERE / f'{name}.webp', 'WEBP', quality=84, method=6)

for source in HERE.glob('*.png'):
    if source.name in {'blue-sprites.png', 'red-sprites.png', 'red-front-sprites.png'}:
        continue
    with Image.open(source) as image:
        quality = 88 if image.mode == 'RGBA' else 84
        image.save(source.with_suffix('.webp'), 'WEBP', quality=quality, method=6)

# Görsel üretim notları

Yerel görsel üretim aracı kullanıldı. Kullanıcının paylaştığı orman savaşı ve köy saldırısı görselleri, perspektif ve atmosfer referansıydı.

- `battlefield.png`: 45 derece yüksek açıdan, puslu orman içindeki doğal savaş açıklığı; kayalar, patikalar, ağaçlar; asker, ızgara ve arayüz yok.
- `blue-sprites.png`: saydam zemin üzerinde mavi okçu, kılıçlı kalkanlı piyade, atlı süvari.
- `red-sprites.png`: saydam zemin üzerinde kırmızı okçu, mızraklı piyade, atlı süvari.
- `red-front-sprites.png`: düşmanların oyuncuya dönük görünmesi için kırmızı okçu, piyade ve süvarinin önden görünümü.
- `world-map.png`: orman, dağ, nehir ve yerleşim bölgelerini birleştiren yüksek açılı sefer haritası zemini; işaretler kodla eklenir.
- `city-battlefield.png`: sur, kule ve yapıları bulunan köy kuşatması zemini; asker, ızgara ve arayüz yok.
- `mountain-battlefield.png`: kayalık dağ geçidi savaş zemini.
- `river-battlefield.png`: sığ nehir geçişi savaş zemini.
- `player-city.png`: mavi sancaklı oyuncu şehri, kışla, demirhane ve ambar görünümü.
- `forest-2.png`, `forest-3.png`: çam ormanı yolu ve sonbahar açıklığı.
- `river-2.png`, `river-3.png`: çakıllı nehir geçişi ve köprülü vadi.
- `desert-1.png`–`desert-3.png`: kum düzlükleri, kanyon ve vaha.
- `snow-1.png`–`snow-4.png`: karlı orman, donmuş göl, dağ geçidi ve tundra.
- `world-map-winter.png`: kuzeyi karlı hale getirilmiş sefer haritası.
- `city-snow.png`, `city-desert.png`, `city-forest.png`: kuzey kalesi, kumlu şehir ve orman köyü kuşatma sahneleri. Yerel görsel üretim aracıyla, her biri ayrı prompt ile üretildi.

Kod, sprite sayfalarından kırpılmış mavi ve önden görünen kırmızı birlik görsellerini kullanır. Oyun arayüzü HTML/CSS, harita işaretleri, ızgara, hareket ve savaş sistemi Canvas üzerinde çizilir.

## Ses kaynakları

- `bow.wav`, `arrow-whoosh.wav`: [OpenGameArt Battle Sound Effects](https://opengameart.org/content/battle-sound-effects), CC0.
- `sword-clash-*.ogg`: [OpenGameArt Sword Clash](https://opengameart.org/node/122900), CC0.
- `horse-neigh.mp3`, `horse-gallop.mp3`, `forest-ambience.mp3`, `river-ambience.mp3`, `wind-ambience.mp3`: [SFXMint](https://sfxmint.com/), CC0 ses kayıtları.
- `tower-stone.ogg`: [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds), CC0.
- `river-stream.ogg`, `river-waterfall.ogg`: [OpenGameArt Stream Sounds](https://opengameart.org/content/stream-sounds) kaydından `stream1.ogg` ve `waterfall1.ogg`, kurt, CC-BY 3.0. Doğada kaydedilmiş akarsu ve şelale sesleri. Kullanıcının paylaştığı YouTube videosu ses referansı olarak değerlendirildi; video sesinin kullanım hakkı doğrulanamadığından dosyası kopyalanmadı.
- `sand-steps.mp3`: [OpenGameArt Water Splash and Sand Footsteps](https://opengameart.org/content/water-splash-and-sand-footsteps), CC0.
- `city-*.ogg`: [OpenGameArt 100 CC0 SFX #2](https://opengameart.org/content/100-cc0-sfx-2), CC0. Kışla, demirhane, ambar, hasat, piyade ve menü için ayrı kayıtlar.

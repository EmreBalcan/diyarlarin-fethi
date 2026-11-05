# Diyarların Fethi

Türkçe, gerçek zamanlı taktik savaşlar ile şehir ve kaynak yönetimini birleştiren mobil strateji oyunu. Ordunu kur, birliklerini savaş alanında konumlandır, şehirleri ele geçir ve değişen dünyada hâkimiyetini koru.

## Oyundan görüntüler

| Dünya haritası | Şehir ve karargâh |
|---|---|
| ![Dünya haritası](docs/screenshots/01-dunya-haritasi.png) | ![Şehir](docs/screenshots/02-sehir.png) |

| Şehir yönetimi | Kaynak toplama |
|---|---|
| ![Şehir yönetimi](docs/screenshots/03-sehir-yonetimi.png) | ![Kaynak toplama](docs/screenshots/04-kaynak-toplama.png) |

| Birlikleri konumlandırma | Gerçek zamanlı savaş |
|---|---|
| ![Savaş hazırlığı](docs/screenshots/05-birlik-savasi-hazirlik.png) | ![Aktif çatışma](docs/screenshots/06-birlik-savasi.png) |

### Ayrıntılı savaş raporu

![Savaş raporu](docs/screenshots/07-savas-raporu.png)

## Öne çıkanlar

- Okçu, piyade ve süvarileri bölme, konumlandırma ve savaş sırasında yönetme
- Seviyeye göre taktik değiştiren rakip komutanlar ve şehir kuşatmaları
- 50 hedefli, orman–çöl–kar bölgelerinden oluşan dinamik sefer haritası
- Şehir, teçhizat, zırh, hasat ve kaynak seferleri yönetimi
- Çevrimdışı çalışan Capacitor Android uygulaması, yerel kayıt ve hasat bildirimleri
- Araziye göre hareketli çevre efektleri, savaş sesleri ve özgün müzik geçişleri

## Geliştirme

Gereksinimler: Node.js 20+; Android derlemesi için Android SDK ve JDK 21.

```powershell
npm install
npm run dev
npm test
npm run build
npm run apk
```

APK çıktısı: `android/app/build/outputs/apk/debug/app-debug.apk`

Ses ve görsel kaynaklarına ilişkin açıklamalar [ASSETS.md](ASSETS.md) ve [public/credits.txt](public/credits.txt) dosyalarında yer alır.

## Oyna ve indir

[🎮 Canlı oyna](https://emrebalcan.github.io/diyarlarin-fethi/) · [📱 Android APK indir](https://github.com/EmreBalcan/diyarlarin-fethi/releases/latest/download/DiyarlarinFethi.apk)

Telefonunuzun kamerasıyla QR kodu okutarak APK’yı doğrudan indirebilirsiniz.

<img src="docs/qr-apk.png" alt="APK indirme QR kodu" width="180">

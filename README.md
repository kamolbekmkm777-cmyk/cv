# Kamolbek Muzaffarov — CV Portfolio

Vanilla HTML / CSS / JS. Build yo'q, dependency yo'q. Butun sayt **208 KB**.

```
index.html        struktura
style.css         23 KB — barcha stillar
app.js            data model + render + admin panel
hand-control.js   qo'l bilan boshqarish (MediaPipe, lazy-loaded)
data.js           deploy qilingan ma'lumot (admin paneldan yaratiladi)
assets/           rasm
```

## Ishga tushirish

```bash
python3 -m http.server 8899
# → http://localhost:8899
```

Fayl sifatida ochsang ham ishlaydi (`index.html` ni brauzerga tashla) — faqat
kamera (qo'l boshqaruvi) uchun `http://localhost` kerak.

## Admin panel

1. Sahifa pastidagi **MKM777** ni bos
2. Klaviaturada kodni yoz: `mkm777` (Maxfiylik tabidan o'zgartiriladi)
3. Panel ochiladi. Har bir o'zgarish **avtomatik saqlanadi**.

Tablar: Profil · Statistika · Skills · Tajriba · Portfolio · **Sevimlilar** ·
**Ijtimoiy tarmoq** · Kontakt · **Musiqa** · Maxfiylik · Reset

> O'zgarishlar `localStorage` da — faqat shu brauzerda. Hammaga ko'rsatish uchun:
> **Reset → 🚀 Saytga chop etish** → yuklangan `data.js` ni loyihaga qo'y → deploy.
> Batafsil: [DEPLOY.md](DEPLOY.md)

## Qo'l bilan boshqarish

Pastki o'ng burchakdagi qo'l tugmasi → kameraga ruxsat ber.

| Ishora | Natija |
|---|---|
| Ko'rsatkich barmoq | kursor barmoq uchiga ergashadi |
| Bosh barmoq + ko'rsatkich, **1 soniya** ushla | click (halqa to'lib boradi) |
| **Musht** (barcha barmoqlar yopiq) | scroll — qo'lni yuqori/pastga suring |

Kamera tasviri hech qachon ekranga chiqmaydi — faqat kursor. MediaPipe (~2 MB)
**faqat tugmani bosganingda** yuklanadi; oddiy ziyoratchi uchun 0 KB.

## Deploy

[DEPLOY.md](DEPLOY.md) — 3 ta buyruq.

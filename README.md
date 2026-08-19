# Kamolbek Muzaffarov — CV Portfolio

Vanilla HTML / CSS / JS. Build yo'q, `node_modules` yo'q — Three.js va Lenis
CDN'dan ES-modul sifatida yuklanadi (Supabase SDK va MediaPipe bilan bir xil uslub).

```
index.html        bosh sahifa: Bosh → Ishlarim → Lab → Kontakt
work.html         case-study sahifa (/work?p=slug)
gallery.html      fotogalereya (/gallery)
admin.html        boshqaruv paneli (/admin) — Supabase Auth bilan
style.css         bitta qora tema: #0A0A0B fon · #F2F0EC matn · #F0A23C amber
core.js           ma'lumot modeli + i18n + bulut sinxroni (hamma sahifa ishlatadi)
app.js            bosh sahifa render
admin.js          panel logikasi (faqat /admin yuklaydi)
particles.js      WebGL partikl maydon (Three.js, 30k nuqta, shader noise)
fx.js             Lenis silliq scroll
cloud.js          Supabase (ixtiyoriy — bo'lmasa localStorage)
hand-control.js   qo'l bilan boshqarish (MediaPipe, tugma bosilgandagina yuklanadi)
config.js         Supabase kalitlari (SUPABASE.md)
data.js           bulutsiz zaxira nusxa (admin → Reset → data.js)
supabase.sql      baza sxemasi (RLS bilan)
assets/           rasm(jpg+avif), logo, favicon
```

## Dizayn

Bitta tema. Fon — jonli WebGL partikl maydon: 30 000 nuqta shader ichidagi
simplex noise bilan oqadi, kursorga yaqin kelgani `1/d²` kuch bilan qochadi.
Qo'l boshqaruvi yoqilsa (Lab bo'limi yoki pastki o'ngdagi ✋), partikllar
sichqoncha o'rniga **qo'l kaftidan** qochadi.

Shriftlar: **Unbounded** (sarlavhalar) + **Manrope** (matn) + Amiri (arabcha shior).
Rasmlar AVIF (JPG zaxira bilan) — galereya 10MB → 2.9MB.

## Uch til

UZ / EN / RU. Kontent `{ uz, en, ru }` obyektlarida, statik matnlar `STRINGS`da.
Egasi chop etgan til — yangi tashrifchi uchun standart.

## Admin — /admin

Bosh sahifada admin kodi **umuman yo'q** (alohida `admin.html` + `admin.js`).
Kirish — faqat **Supabase Auth** (email + parol, server tekshiradi; kodda
hech qanday parol/xesh saqlanmaydi). Kirgandan keyin har tahrir avtomatik
~1.5 soniyada bulutga chop etiladi. Yozish huquqini RLS himoya qiladi:
anon foydalanuvchi faqat o'qiy oladi.

## Case-study sahifalar

Har loyiha `/work?p=slug` da, qat'iy tartibda: **Muammo → Nima qurdim →
Qarorlar (3 ta «nega X emas, Y») → Raqamlar → Stack → Havolalar**.
Raqamlar bo'sh bo'lsa, bo'lim ko'rinmaydi — faqat haqiqiy raqam yozing.

## Ishga tushirish

```bash
python3 -m http.server 8899
# → http://localhost:8899
```

## Deploy

[DEPLOY.md](DEPLOY.md). Yangi rasm qo'shsangiz, AVIF variantini ham yarating:

```bash
avifenc -q 58 -s 7 rasm.jpg rasm.avif
```

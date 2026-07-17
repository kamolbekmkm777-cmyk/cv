# Kamolbek Muzaffarov — CV Portfolio

Vanilla HTML / CSS / JS. Build yo'q, dependency yo'q.

```
index.html        struktura
style.css         barcha stillar
app.js            data model + render + admin panel + video→rang
cloud.js          Supabase (ixtiyoriy — bo'lmasa localStorage)
hand-control.js   qo'l bilan boshqarish (MediaPipe, lazy-loaded)
config.js         Supabase kalitlari (SUPABASE.md ga qarang)
data.js           deploy qilingan ma'lumot (admin paneldan yaratiladi)
gallery.html      alohida fotogalereya sahifasi (yangi oynada)
assets/logo.svg   MK logotipi (rangga moslashadi) + favicon fayllari
assets/gallery/   fotogalereya (27 rasm + thumbnail)
supabase.sql      baza sxemasi — Supabase SQL Editor'ga qo'ying
```

## Ikkita tema

| Tema | Qanday ishlaydi |
|---|---|
| **Liquid Glass** | Qorong'i shisha. Urg'u rangi **fon videosidan olinadi** — yashil o'rmon → yashil, ko'k osmon → ko'k, rangsiz video → nozik oq. |
| **Uch rang** | Faqat 3 ta bo'yoq: `#B86B00` amber · `#0F2D52` navy · `#FAF7F2` paper. Bu temada fon videosi ko'rsatilmaydi — aks holda 4-rang qo'shilardi. |

## Uch til

Sayt UZ / EN / RU tillarda. Standart — **oʻzbekcha**. Til almashtirgich ⚙ sozlamalarda.
Tarjimalar `data` ichida `{ uz, en, ru }` obyektlari sifatida saqlanadi; statik matnlar
(menyu, tugmalar) `app.js` dagi `STRINGS` jadvalida. Admin panelda har bir matnli maydon
**3 tilda** kiritiladi — boʻsh til qizil chiziq bilan belgilanadi.

## Fotogalereya — alohida oyna

Galereya asosiy sahifada koʻrinmaydi. Bosh sahifadagi **rasm ustiga bosilsa**, u yangi
oynada (`gallery.html`) ochiladi. `gallery.html` bir xil maʼlumot manbaidan oʻqiydi
(bulut → localStorage → data.js → standart 27 rasm) va til/temaga moslashadi.

## Standart fon

Bosh sahifa **osmon (bulut) videosi** bilan ochiladi. Liquid Glass temasida sayt ranglari
shu videoning rangiga moslashadi. Uch rang temasida video koʻrsatilmaydi.

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

Tablar: Profil · Statistika · Skills · Tajriba · Portfolio · **Fotogalereya** ·
Sevimlilar · Ijtimoiy tarmoq · Kontakt · **Musiqalar** · **Videolar** · **Bulut ☁** ·
Maxfiylik · Reset

Fotogalereya, Musiqalar va Videolar — uchalasi ham to'liq tahrirlanadi:
qo'shish (fayl yuklash yoki URL), nomini/izohini o'zgartirish, o'chirish.

**Hammaga ko'rsatish** uchun ikki yo'l bor:

| Yo'l | Qanday |
|---|---|
| **Bulut** (tavsiya) | **Bulut ☁ → Bulutga saqlash**. Telefondan ham tahrirlaysiz. Sozlash: [SUPABASE.md](SUPABASE.md) |
| Bulutsiz | **Reset → 🚀 Saytga chop etish** → `data.js` ni loyihaga qo'y → deploy |

> Bulutsiz rejimda o'zgarishlar `localStorage` da — faqat shu brauzerda, va
> yuklangan fayllar base64 bo'lgani uchun ~2MB limit bor.

## Qo'l bilan boshqarish

Pastki o'ng burchakdagi qo'l tugmasi → kameraga ruxsat ber.

| Ishora | Natija |
|---|---|
| Ko'rsatkich barmoq | kursor barmoq uchiga ergashadi |
| Bosh barmoqqa **tez tekkizib qo'y** | click |
| Tekkizib **ushlab tur** | sichqoncha bosilgan holda qoladi (drag / uzoq bosish) |
| Tekkizib turib qo'lni **tepa/pastga** | scroll |

Sezgirlik: ⚙ (o'ng yuqori) → **Qo'l bilan boshqaruv** — kursor tezligi,
silliqlash, barmoq tekkizish sezgirligi va scroll tezligi. Sozlamalar saqlanadi.

Kamera tasviri hech qachon ekranga chiqmaydi — faqat kursor. MediaPipe (~2 MB)
**faqat tugmani bosganingda** yuklanadi; oddiy ziyoratchi uchun 0 KB.

## Deploy

[DEPLOY.md](DEPLOY.md) — 3 ta buyruq.

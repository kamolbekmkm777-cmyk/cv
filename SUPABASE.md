# Supabase'ni ulash — qadamma-qadam

Bulutsiz ham sayt to'liq ishlaydi, lekin o'zgarishlaringiz **faqat siz tahrirlagan brauzerda** qoladi.
Supabase ulansa: telefondan rasm qo'shasiz → hamma ko'radi.

Hammasi bepul tarifda yetadi.

---

## 1. Loyiha yarating

1. <https://supabase.com> → **Start your project** → GitHub bilan kiring.
2. **New project**:
   - **Name**: `kamolbek-cv`
   - **Database Password**: kuchli parol o'ylang va **saqlab qo'ying** (keyin kerak bo'lmasa ham).
   - **Region**: `Central EU (Frankfurt)` — O'zbekistonga eng yaqini.
3. ~2 daqiqa kutasiz.

## 2. Jadval va storage'ni yarating

1. Chap menyu → **SQL Editor** → **New query**.
2. Loyihadagi [`supabase.sql`](supabase.sql) faylini **to'liq** nusxalab qo'ying.
3. **Run** (yoki ⌘↵).
4. `Success. No rows returned` chiqsa — tayyor.

Bu skript quyidagilarni yaratadi:

| Nima | Nima uchun |
|---|---|
| `site_data` jadvali | Sayt matni, linklar, galereya ro'yxati (bitta JSON qatori) |
| `media` bucket | Rasm, musiqa, video fayllari |
| RLS qoidalari | **Hamma o'qiydi, faqat siz yozasiz** |

## 3. Admin foydalanuvchi yarating

Bu — saytga yozish huquqiga ega yagona hisob.

1. Chap menyu → **Authentication** → **Users** → **Add user** → **Create new user**.
2. **Email**: o'zingizniki (masalan `kamolbekmkm777@icloud.com`).
3. **Password**: kuchli parol.
4. **Auto Confirm User**: ✅ **belgilang** (aks holda email tasdiqlashni kutasiz).
5. **Create user**.

> Ro'yxatdan o'tishni yopib qo'ying, boshqalar hisob ochmasin:
> **Authentication → Sign In / Providers → Email → "Allow new users to sign up"** ni **o'chiring**.

## 4. Kalitlarni `config.js` ga yozing

1. **Project Settings** (⚙) → **API**.
2. Ikkita qiymatni ko'chiring:
   - **Project URL** → `supabaseUrl`
   - **Project API keys** → `anon` `public` → `supabaseAnonKey`
3. Loyihadagi `config.js` faylini oching va to'ldiring:

```js
window.SITE_CONFIG = {
  supabaseUrl: 'https://abcdefgh.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi...',
  bucket: 'media'
};
```

> **`service_role` kalitini HECH QACHON yozmang.** U barcha himoyani chetlab o'tadi.
> `anon` kaliti ochiq bo'lishi normal — u har qanday Supabase saytida ko'rinadi.
> Sizni RLS qoidalari himoya qiladi: anon faqat **o'qiy oladi**.

## 5. Deploy qiling

```bash
git add -A && git commit -m "Supabase ulandi" && git push
```

Vercel o'zi qayta deploy qiladi.

## 6. Ishlayotganini tekshiring

1. Saytni oching → pastdagi **MKM777** ni bosing → kodni yozing (`mkm777`).
2. **Bulut ☁** bo'limi → yashil chiziq: *"Bulut sozlangan, lekin kirmagansiz"*.
   - Kulrang chiqsa → `config.js` to'ldirilmagan yoki deploy bo'lmagan.
3. Email/parolni yozing → **Kirish** → chiziq yashil bo'ladi.
4. **Fotogalereya** → rasm qo'shing.
5. **Bulut ☁** → **☁ Bulutga saqlash**.
6. Boshqa brauzerda (yoki telefonda) saytni oching — rasm turibdi. ✅

---

## Kundalik ishlash tartibi

| Qadam | Nima bo'ladi |
|---|---|
| Admin panelda tahrirlaysiz | Faqat shu brauzerda saqlanadi |
| **Bulut ☁ → Bulutga saqlash** | **Hamma ko'radi** |

Yuklangan fayllar (rasm/musiqa/video) darhol Storage'ga tushadi, lekin
**ro'yxatning o'zi** faqat "Bulutga saqlash" bosilganda chop etiladi.

## Muammolar

| Xato | Sababi |
|---|---|
| `Avval Bulut bo'limidan kiring` | Kirmagansiz yoki sessiya tugagan — qayta kiring |
| `Invalid login credentials` | Email/parol xato, yoki 3-qadamda **Auto Confirm** belgilanmagan |
| `new row violates row-level security` | `supabase.sql` ishga tushirilmagan yoki kirmagansiz |
| `Bucket not found` | `supabase.sql` ishga tushmagan — 2-qadamni qayting |
| Bulut chizig'i kulrang | `config.js` da hali `YOUR_PROJECT` turibdi, yoki deploy bo'lmagan |

## Narx

Bepul tarif: 500MB baza + **1GB storage** + 5GB trafik/oy.
Galereyangiz (27 rasm ≈ 12MB) va bir nechta musiqa bemalol sig'adi.
Fon videolarini esa archive.org'dan link bilan ishlatgan ma'qul — storage'ni yemaydi.

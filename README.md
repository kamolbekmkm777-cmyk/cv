# Premium CV Portfolio

Liquid glass dizaynli premium CV portfolio sayti. Vanilla HTML / CSS / JS — frameworksiz. Barcha ma'lumotlar va sozlamalar saytdan o'zgartiriladi va `localStorage` da saqlanadi.

## ✨ Xususiyatlar

- 🎨 **4 ta tema:** Liquid Glass · Classic CV · Modern CV · Dark Premium
- 🎬 **Cinematic intro** — katta harf zoom + dissolve
- 🌊 **Scroll-scale hero** — katta ism scroll bilan kichrayadi
- 🪟 **Liquid glass hover** — kursorga ergashadigan reflection
- ✨ **Mouse follow glow** + magnetic buttons
- 📊 **Skills progress bars** (animatsiya bilan)
- 📅 **Experience timeline**
- 🎯 **Portfolio 3D reveal**
- 📩 **Contact form** (mailto fallback)
- 📄 **PDF yuklab olish** — admin paneldagi joriy ma'lumotlar bilan
- 🔐 **Yashirin admin panel** — stealth kod orqali
- 🅰️ **Per-element font/size** — har bir text alohida sozlanadi
- 🎚 **Per-element typography** — ko'p Google Fonts ichidan tanlash
- 💾 **Eksport / Import** (JSON)

## 🚀 Foydalanish

1. `index.html` ni brauzerda oching (yoki `python -m http.server` orqali server)
2. Sayt to'g'ri ishlaydi — hech qanday build kerak emas
3. ⚙ tugma — tema almashtirish va PDF yuklab olish

## 🔐 Admin panelga kirish

Admin paneliga kirish **yashirin**:

1. Sahifa pastida (footer ostida) **`MKM777`** matnini bosing
2. Sekin matn **electric green** rangda yonib pulse qiladi — *listening mode* faolligi
3. Klaviaturada parolni **yozing** (alohida input maydoni yo'q)
4. Parol mos kelsa, admin panel ochiladi
5. Agar:
   - Boshqa joyni bossangiz → bekor bo'ladi
   - Skroll qilsangiz → bekor bo'ladi
   - 8 soniya hech narsa yozmasangiz → bekor bo'ladi
   - Noto'g'ri parol kiritsangiz → bekor bo'ladi

Default kirish kodi: `mkm777` (admin → Maxfiylik tabidan o'zgartiriladi)

## 🛠 Admin paneldan o'zgartiriladigan narsalar

| Tab | Imkoniyat |
|---|---|
| **Profil** | ism, kasb, slogan, joylashuv, bio, avatar (URL/yuklash) |
| **Statistika** | raqamlar (yillar, loyihalar, mijozlar, uptime) |
| **Skills** | qo'shish/o'chirish/tahrir, daraja slider |
| **Tajriba** | timeline elementlarini boshqarish |
| **Portfolio** | loyiha qo'shish, rasm yuklash, tags |
| **Kontaktlar** | email, telefon, barcha social media |
| **Textlar** | barcha UI matnlar (tugmalar, sarlavhalar, label'lar) |
| **Typography** | body/display/serif fontlar + per-element font va size |
| **Maxfiylik** | kirish kodini o'zgartirish |
| **Reset** | JSON eksport/import/standartga qaytarish |

## 📁 Fayl tuzilishi

```
.
├── index.html      # asosiy struktura
├── style.css       # 4 ta tema, animatsiyalar, effektlar
├── script.js       # logic, admin, render, scroll-scale
└── README.md
```

## 🌐 GitHub'ga yuklash

```bash
cd /path/to/cvs
git init
git add .
git commit -m "Initial commit: premium CV portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

GitHub Pages bilan deploy qilish: repository Settings → Pages → Branch: `main` → `/root` → Save.

## 📜 Litsenziya

MIT

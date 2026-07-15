# Deploy — kamolbek.com

Sayt tayyor. Deploy uchun **faqat 3 ta buyruq** kerak (~4 daqiqa).

Men bularni o'zim bajara olmadim: Vercel va GitHub **OAuth login** talab qiladi —
brauzerda ochilib, sen tasdiqlashing kerak. Bu sening akkauntlaring, men ularga
sening o'rningga kira olmayman (parol/akkaunt kirishi men uchun taqiqlangan).
Quyidagi buyruqlarni terminalga qo'yib chiqsang — bo'ldi.

---

## 1. Vercel'ga deploy (~2 daq)

```bash
cd /Users/mkm777/Desktop/cvs

# Login — brauzer ochiladi, GitHub bilan kir
vercel login

# Deploy (savollarga: Set up and deploy? Y / scope: o'zingni tanla /
#          Link to existing? N / project name: kamolbek / directory: ./ )
vercel --prod
```

Tugagach `https://kamolbek-xxx.vercel.app` linkini beradi. Sayt tayyor.

---

## 2. Domain'ni ulash (~2 daq)

### Vercel tomonda
```bash
vercel domains add kamolbek.com
vercel domains add www.kamolbek.com
```
Vercel senga qaysi DNS yozuv kerakligini aytadi.

### Namecheap tomonda
[namecheap.com](https://ap.www.namecheap.com/domains/list/) → `kamolbek.com` → **Manage** →
**Advanced DNS** → mavjud yozuvlarni o'chirib, quyidagini qo'sh:

| Type | Host | Value | TTL |
|---|---|---|---|
| A | @ | `76.76.21.21` | Automatic |
| CNAME | www | `cname.vercel-dns.com` | Automatic |

DNS 5–30 daqiqada tarqaladi. SSL Vercel tomonidan avtomatik va bepul.

> **Cloudflare kerakmi?** Yo'q. Vercel allaqachon bepul SSL + global CDN beradi.
> Cloudflare qo'shsang, faqat ortiqcha qatlam bo'ladi. Agar baribir xohlasang:
> Namecheap'da nameserver'larni Cloudflare'nikiga almashtir, so'ng Cloudflare'da
> yuqoridagi A/CNAME yozuvlarini **DNS only** (kulrang bulut) qilib qo'y.

---

## 3. GitHub'ga yuklash (ixtiyoriy, ~1 daq)

```bash
# gh CLI o'rnat
brew install gh
gh auth login          # brauzerda tasdiqla

gh repo create kamolbek-cv --public --source=. --remote=origin --push
```

Keyin Vercel Dashboard → Project → Settings → Git → repo'ni ulasang,
har `git push` avtomatik deploy bo'ladi.

---

## Admin panel — muhim

Admin paneldagi o'zgarishlar **faqat sening brauzeringda** saqlanadi
(`localStorage`). Ziyoratchilar ularni ko'rmaydi.

Hammaga ko'rsatish uchun:

1. Saytni och → pastdagi **MKM777** ni bos → klaviaturada `mkm777` yoz
2. Admin ochiladi → o'zgartir
3. **Reset** tab → **🚀 Saytga chop etish (data.js)** → fayl yuklanadi
4. Uni loyihadagi eski `data.js` o'rniga qo'y
5. `vercel --prod` (yoki `git push`)

Shundan keyin har bir ziyoratchi yangi ma'lumotni ko'radi.

---

## Nima o'zgardi (tezlik)

| | Avval | Hozir |
|---|---|---|
| CSS | 136 KB | **23 KB** |
| `backdrop-filter` (blur) | 112 ta | **5 ta** |
| `!important` | 271 ta | **0 ta** |
| Fon video | 20 MB stream | **yo'q** |
| Canvas zarrachalar | bor | **yo'q** |
| Sahifa yuklanishi | sekin | **38 ms / 39 KB** |
| Butun deploy hajmi | ~14 MB | **208 KB** |
| MediaPipe (qo'l) | doim yuklanardi | **faqat bosganda** |

Scroll'da qotib qolish sababi: 112 ta `backdrop-filter` har kadrda qayta blur
hisoblardi + 20 MB video kompozitorni bo'g'ardi. Ikkalasi ham olib tashlandi.

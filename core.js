/* ==========================================================================
   core.js — shared data model, i18n plumbing and cloud sync glue.

   Loaded by every page (index, gallery, work, admin). Holds the single
   source of truth: DEFAULTS → data.js (deploy copy) → localStorage → cloud.
   Page-specific rendering lives in app.js / admin.js / inline page scripts.
   ========================================================================== */
(() => {
'use strict';

/* ---------------------------------------------------------------- DEFAULTS */
const DEFAULTS = {
  profile: {
    name: "Kamolbek Muzaffarov",
    profession: { uz: "Full-Stack dasturchi va sunʼiy intellekt muhandisi", en: "Full-Stack Developer & AI Engineer", ru: "Full-Stack разработчик и AI-инженер" },
    slogan: { uz: "Men miqyoslashadigan aqlli mahsulotlar yarataman — zamonaviy biznes uchun Telegram botlar, sunʼiy intellekt va bulutli infratuzilma.", en: "I build intelligent products that scale — bots, AI, and clean cloud infrastructure for modern businesses.", ru: "Я создаю умные продукты, которые масштабируются — боты, AI и чистая облачная инфраструктура для современного бизнеса." },
    location: { uz: "Toshkent, Oʻzbekiston", en: "Tashkent, Uzbekistan", ru: "Ташкент, Узбекистан" },
    /* Bosh sahifada ism ostida chiqadigan QISQA tanishtiruv — atayin 2 gap.
       Uzun tarjimai hol endi yo'q: qolganini ishlar (case-study) aytadi. */
    bio: { uz: "Men Kamolbek — sunʼiy intellekt, avtomatlashtirish va dizayn kesishmasida ishlaydigan muhandisman. Lidlarni tunda ham qoʻlga oladigan botlar, xona rasmini oʻqiydigan AI yordamchilar va xaosni tartibga soladigan panellar quraman.",
           en: "I'm Kamolbek — an engineer working at the intersection of AI, automation and design. I build bots that capture leads while you sleep, AI assistants that read a photo of a room, and dashboards that turn chaos into order.",
           ru: "Я Камолбек — инженер на стыке AI, автоматизации и дизайна. Делаю ботов, которые ловят лиды даже ночью, AI-ассистентов, читающих фото комнаты, и панели, наводящие порядок в хаосе." },
    avatar: "assets/kamolbek-900.jpg",
    /* Arabcha shior — hadis: "Amallar niyatlarga bog'liq". */
    motto: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ"
  },
  ui: { hero_badge: { uz: "Yangi loyihalar uchun ochiq · 2026", en: "Open to new projects · 2026", ru: "Открыт к новым проектам · 2026" } },
  /* Bitta oddiy qator — progress-bar va foizlar yo'q. Admin xohlagancha
     tahrirlaydi; « · » bilan ajratiladi. */
  skills: "Python · TypeScript · React / Next.js · FastAPI · Aiogram · PostgreSQL · Supabase · Three.js · ESP32",
  experience: [
    { period: { uz: "2024 — Hozir", en: "2024 — Present", ru: "2024 — наст. время" }, title: { uz: "Asoschi va Bosh Dasturchi", en: "Founder & Lead Developer", ru: "Основатель и ведущий разработчик" }, company: "Independent / Freelance",
      description: { uz: "Telegram botlari, sunʼiy intellekt integratsiyalari va bulutli avtomatlashtirish loyihalari ustida ishlayman. Mijozlar uchun boshidan oxirigacha yechimlar ishlab chiqaman.", en: "I build Telegram bots, AI integrations, and cloud automation. I deliver end-to-end solutions for clients.", ru: "Работаю над Telegram-ботами, AI-интеграциями и облачной автоматизацией. Разрабатываю решения под ключ." } },
    { period: { uz: "2022 — 2024", en: "2022 — 2024", ru: "2022 — 2024" }, title: { uz: "Full-Stack Dasturchi", en: "Full-Stack Developer", ru: "Full-Stack разработчик" }, company: "Tech Studio Tashkent",
      description: { uz: "B2B SaaS mahsulotlari uchun interfeys va server qismlarini ishlab chiqdim. React/Next.js asosida 10+ boshqaruv paneli yaratdim.", en: "Built frontend and backend for B2B SaaS products. Shipped 10+ dashboards in React/Next.js.", ru: "Разрабатывал фронтенд и бэкенд для B2B SaaS-продуктов. Создал более 10 дашбордов на React/Next.js." } },
    { period: { uz: "2020 — 2022", en: "2020 — 2022", ru: "2020 — 2022" }, title: { uz: "Junior Dasturchi", en: "Junior Developer", ru: "Младший разработчик" }, company: "StartupHub",
      description: { uz: "Veb-ilovalar, bir sahifali saytlar va dastlabki bot loyihalarida qatnashdim. Python, Django va REST API bilan ishladim.", en: "Contributed to web apps, landing pages, and early bot projects. Worked with Python, Django, and REST APIs.", ru: "Участвовал в разработке веб-приложений, лендингов и первых ботов. Работал с Python, Django и REST API." } }
  ],
  education: [
    { id:'school',
      name:{ uz:"19-umumiy o‘rta ta’lim maktabi — G‘ijduvon tumani, Buxoro viloyati",
             en:"Secondary School No. 19 — G‘ijduvon district, Bukhara region",
             ru:"Школа №19 — Гиждуванский район, Бухарская область" },
      period:{ uz:"", en:"", ru:"" }, description:{ uz:"", en:"", ru:"" }, docs: [] },
    { id:'lyceum', name:{ uz:"Litsey", en:"Lyceum", ru:"Лицей" },
      period:{ uz:"", en:"", ru:"" }, description:{ uz:"", en:"", ru:"" }, docs: [] },
    { id:'university', name:{ uz:"Universitet", en:"University", ru:"Университет" },
      period:{ uz:"", en:"", ru:"" }, description:{ uz:"", en:"", ru:"" }, docs: [] }
  ],
  /* Har bir loyiha endi alohida case-study sahifa (work?p=slug).
     problem  — Muammo (2 gap) · built — Nima qurdim (3–4 gap)
     decisions — 3 ta muhandislik qarori («nega X emas, Y»)
     numbers   — faqat HAQIQIY raqamlar; bo'sh bo'lsa bo'lim ko'rinmaydi. */
  portfolio: [
    { slug: "chozma-shift-ai-bot",
      title: { uz: "Chozma Shift AI Bot", en: "Chozma Shift AI Bot", ru: "Chozma Shift AI Bot" },
      description: { uz: "Chozma shift biznesi uchun Telegram bot: xona rasmini AI bilan tahlil qiladi, narx hisoblaydi, lidni CRM ga uzatadi.", en: "A Telegram bot for a stretch-ceiling business: analyzes room photos with AI, calculates pricing, pushes leads to CRM.", ru: "Telegram-бот для бизнеса натяжных потолков: анализирует фото комнаты с AI, считает цену, передаёт лиды в CRM." },
      problem: { uz: "Chozma shift ustalari kechqurun kelgan so‘rovlarga ulgurmay, lidlarning yarmini yo‘qotardi. Narxni aytish uchun avval borib o‘lchash kerak edi — bu esa bir necha kun.", en: "The stretch-ceiling crew was losing half its leads to unanswered evening enquiries. Quoting a price required an on-site visit first — days of delay.", ru: "Мастера натяжных потолков теряли половину лидов из-за вечерних заявок без ответа. Для цены требовался выезд на замер — дни ожидания." },
      built: { uz: "Telegram bot qurdim: mijoz xona rasmini yuboradi, Gemini Vision maydonni va murakkablikni baholaydi, bot darhol taxminiy narx aytadi. Issiq lidlar telefon raqami bilan egasining shaxsiy CRM paneliga tushadi. Hammasi bitta arzon serverda ishlaydi.", en: "I built a Telegram bot: the customer sends a room photo, Gemini Vision estimates area and complexity, and the bot quotes a price instantly. Hot leads land in the owner's CRM with a phone number. Everything runs on one cheap server.", ru: "Я построил Telegram-бота: клиент отправляет фото комнаты, Gemini Vision оценивает площадь и сложность, бот сразу называет цену. Горячие лиды падают в CRM владельца с номером телефона. Всё крутится на одном дешёвом сервере." },
      decisions: [], numbers: [],
      image: "", link: "", repo: "", tags: ["Aiogram 3", "Gemini Vision", "SQLite", "Oracle Cloud"], cat: "bot" },
    { slug: "lead-funnel-pro",
      title: { uz: "Lead Funnel Pro", en: "Lead Funnel Pro", ru: "Lead Funnel Pro" },
      description: { uz: "Telegram, Instagram DM va veb-formani birlashtirgan lid saralash tizimi — issiq lidlar avtomatik sotuvga boradi.", en: "A lead qualification engine uniting Telegram, Instagram DMs and a web form — hot leads route straight to sales.", ru: "Система квалификации лидов: Telegram, Instagram DM и веб-форма — горячие лиды сразу уходят в продажи." },
      problem: { uz: "Lidlar uch kanaldan kelardi va uchtasida ham boshqa-boshqa yozilardi. Sotuv bo‘limi qaysi biri “issiq”ligini bilmay, vaqtini sovuq lidlarga sarflardi.", en: "Leads arrived through three channels and lived in three different places. Sales couldn't tell hot from cold and wasted time on the wrong ones.", ru: "Лиды приходили из трёх каналов и жили в трёх разных местах. Продажи не отличали горячих от холодных и тратили время не на тех." },
      built: { uz: "Uchala kanalni bitta FastAPI backend ostiga yig‘dim: har lid savollar zanjiridan o‘tadi, ball to‘playdi va Redis navbati orqali saralanadi. Belgilangan baldan o‘tgan lid darhol sotuvchining Telegramiga tushadi; qolganlari avtomatik isitish zanjiriga o‘tadi.", en: "I unified all three channels behind one FastAPI backend: each lead walks a scripted question chain, accumulates a score, and is ranked through a Redis queue. Leads above the threshold ping a salesperson's Telegram instantly; the rest enter an automated nurture chain.", ru: "Я объединил все три канала за одним FastAPI-бэкендом: каждый лид проходит цепочку вопросов, набирает балл и ранжируется через очередь Redis. Лиды выше порога мгновенно падают в Telegram продавцу; остальные уходят в автоматический прогрев." },
      decisions: [], numbers: [],
      image: "", link: "", repo: "", tags: ["FastAPI", "PostgreSQL", "Redis", "Next.js"], cat: "bot" },
    { slug: "vision-designer",
      title: { uz: "Vision Designer", en: "Vision Designer", ru: "Vision Designer" },
      description: { uz: "AI bilan interyer dizayni: xona rasmini yuklaysiz, materiallarni tanlaysiz — fotorealistik maket qaytadi.", en: "AI interior design: upload a room photo, pick materials — get a photorealistic mockup back.", ru: "AI-дизайн интерьера: загружаете фото комнаты, выбираете материалы — получаете фотореалистичный макет." },
      problem: { uz: "Mijoz ta’mirdan oldin natijani ko‘ra olmaydi — dizayner maketi haftalab kutiladi va qimmat turadi. Ko‘pchilik shu bosqichda buyurtmadan voz kechadi.", en: "Customers can't see the result before a renovation — a designer's mockup takes weeks and costs real money. Many walk away at exactly that step.", ru: "Клиент не видит результат до ремонта — макет дизайнера ждут неделями и он стоит денег. Многие отваливаются именно на этом шаге." },
      built: { uz: "Veb-ilova qurdim: foydalanuvchi xona rasmini yuklaydi, material va uslubni tanlaydi, Stable Diffusion asosidagi zanjir bir necha soniyada fotorealistik variantlar qaytaradi. Natija WebSocket orqali jonli oqib keladi — kutish his qilinmaydi.", en: "I built a web app: the user uploads a room photo, picks materials and a style, and a Stable Diffusion pipeline returns photorealistic variants in seconds. Results stream in live over WebSockets, so the wait never feels like waiting.", ru: "Я сделал веб-приложение: пользователь загружает фото комнаты, выбирает материалы и стиль, а пайплайн на Stable Diffusion за секунды возвращает фотореалистичные варианты. Результаты приходят живым потоком по WebSocket." },
      decisions: [], numbers: [],
      image: "", link: "", repo: "", tags: ["Python", "Stable Diffusion", "React", "WebSockets"], cat: "app" },
    { slug: "pulse-analytics",
      title: { uz: "Pulse Analytics", en: "Pulse Analytics", ru: "Pulse Analytics" },
      description: { uz: "Kichik biznes uchun real vaqtli panel — Telegram bot egasining savollariga oddiy tilda javob beradi.", en: "A real-time dashboard for small businesses — a Telegram bot answers the owner's questions in plain language.", ru: "Дашборд в реальном времени для малого бизнеса — Telegram-бот отвечает владельцу простым языком." },
      problem: { uz: "Biznes egasi kunlik sonlarni ko‘rish uchun kompyuterga o‘tirib, uchta jadvalni ochishi kerak edi. Amalda esa hech kim ochmasdi — qarorlar taxmin bilan qilinardi.", en: "To see the day's numbers the owner had to sit at a computer and open three spreadsheets. In practice nobody did — decisions ran on gut feeling.", ru: "Чтобы увидеть цифры за день, владельцу нужно было сесть за компьютер и открыть три таблицы. На практике никто не открывал — решения принимались наугад." },
      built: { uz: "Sotuv oqimini ClickHouse omboriga uladim va ustiga ikkita interfeys qurdim: real vaqtli D3 panel hamda “bugun qancha sotdik?” deb so‘rasa bo‘ladigan Telegram bot. Bot savolni SQL ga o‘giradi va javobni oddiy tilda qaytaradi.", en: "I wired the sales stream into a ClickHouse warehouse and built two interfaces on top: a real-time D3 dashboard, and a Telegram bot you can just ask “how much did we sell today?”. The bot translates the question to SQL and answers in plain words.", ru: "Я завёл поток продаж в ClickHouse и построил сверху два интерфейса: live-дашборд на D3 и Telegram-бота, которому можно просто написать «сколько мы продали сегодня?». Бот переводит вопрос в SQL и отвечает простым языком." },
      decisions: [], numbers: [],
      image: "", link: "", repo: "", tags: ["Aiogram", "OpenAI", "ClickHouse", "D3.js"], cat: "site" }
  ],
  favorites: [
    { icon: "🎧", title: { uz: "Mening pleylistim", en: "My playlist", ru: "Мой плейлист" }, url: "" },
    { icon: "📺", title: { uz: "YouTube kanalim", en: "My YouTube channel", ru: "Мой YouTube-канал" }, url: "" },
    { icon: "📚", title: { uz: "O'qiyotgan kitoblarim", en: "What I'm reading", ru: "Книги, которые я читаю" }, url: "" }
  ],
  social: {
    telegram:  "https://t.me/kamolbekmuzaffarov",
    channel:   "https://t.me/ITECN0",
    instagram: "",
    youtube:   "",
    x:         "",
    tiktok:    "",
    linkedin:  "",
    github:    "https://github.com/kamolbekmkm777"
  },
  contacts: {
    email:   "kamolbekmkm777@icloud.com",
    phone:   "+998 77 293 77 97",
    website: "https://kamolbek.com"
  },
  /* url = to'g'ridan-to'g'ri audio fayl (saytda chalinadi);
     link = tashqi sahifa (YouTube / Spotify) — yangi oynada ochiladi. */
  tracks: [
    { id:'song1',  name:'SoundHelix 1',  icon:'🎵', link:'', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id:'song2',  name:'SoundHelix 2',  icon:'🎶', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id:'song9',  name:'SoundHelix 9',  icon:'🎼', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    { id:'song15', name:'SoundHelix 15', icon:'🎧', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' }
  ],
  gallery: Array.from({ length: 27 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return { id:'p'+n, src:`assets/gallery/photo-${n}.jpg`, thumb:`assets/gallery/thumb/photo-${n}.jpg`, caption:{ uz:'', en:'', ru:'' } };
  }),
  /* autoplay YO'Q: sayt ochilganda o'zi chalinmaydi — faqat tugma bilan. */
  music: { src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
           volume: 40, presetId: "song1" },
  lang: "uz",
  branding: { logo: '', favicon: '' }
};

/* Brand icons (simple-icons paths, 24×24 viewBox) + the traced @ITECN0 robot */
const ICONS = {
  channel: 'M12 0.1L11.6 0.2L10.9 0.6L10.3 0.9L9.7 1.5L9.1 2.2L8.7 3L8.3 3.8L8.3 4.5L8.4 5.3L8.8 6L9.2 6.8L10 7.5L10.7 8.2L11.4 8.3L12.1 8.4L12.5 8.5L12.9 8.5L13.8 8.6L14.8 8.7L15.5 8.4L16.3 8.1L16.8 7.6L17.4 7.1L17.7 7.1L18 7.1L18.4 6.4L18.7 5.8L18.7 5.2L18.8 4.6L18.5 4.3L18.3 3.9L17.9 3.1L17.7 2.3L17 1.6L16.4 0.9L15.5 0.5L14.6 0.1L13.5 0L12.4 0L12 0.1ZM12.9 1.6L13.4 1.8L14 2.2L14.6 2.5L15 3.1L15.5 3.7L15.5 4.4L15.6 5.1L15.4 5.6L15.1 6.1L14.6 6.4L14.2 6.8L13.5 7L12.8 7.3L11.8 7.3L10.9 7.3L10.2 6.9L9.4 6.6L9.1 6.1L8.8 5.6L8.7 5L8.6 4.3L8.7 3.7L8.8 3.1L9.2 2.5L9.5 2L10.1 1.7L10.6 1.4L11.5 1.4L12.3 1.4L12.9 1.6ZM9.7 3L9.4 3.1L9.3 3.5L9.2 3.9L9.4 4.3L9.6 4.7L9.9 4.7L10.2 4.7L10.4 4.5L10.6 4.3L10.6 3.8L10.6 3.3L10.4 3.1L10.2 2.9L10.1 2.9L10 2.9L9.7 3ZM12.5 3.6L12.2 3.8L12.1 4.2L12 4.6L12.3 5L12.7 5.3L12.8 5.3L13 5.3L13.3 5L13.6 4.7L13.6 4.3L13.6 3.9L13.4 3.6L13.1 3.4L12.9 3.4L12.7 3.4L12.5 3.6ZM6.7 1.6L6.7 1.7L6.6 2L6.5 2.3L6.7 2L7 1.7L7 1.5L7 1.4L6.8 1.4L6.7 1.4L6.7 1.6ZM5.5 1.9L5.6 2.1L5.2 2L4.9 1.9L4.7 2L4.5 2.1L4.7 2.3L5 2.4L4.7 2.4L4.5 2.4L4.3 2.7L4.1 3.1L4.3 3.3L4.6 3.6L4.6 3.9L4.6 4.3L4.6 4.8L4.7 5.4L5.2 6.4L5.8 7.5L6.4 7.5L7 7.5L7.4 7.2L7.8 6.9L7.8 6.5L7.8 6L7.6 5.5L7.5 5.1L6.9 4.2L6.3 3.2L6.2 3.2L6 3.2L6 3.4L6 3.7L5.5 3.8L5 4L4.9 4L4.8 4L5.2 3.7L5.5 3.5L5.6 3L5.7 2.5L5.9 2.3L6 2.2L5.8 2L5.7 1.8L5.5 1.8L5.4 1.8L5.5 1.9ZM6.2 2.7L6.2 3.1L6.4 3.1L6.5 3.1L6.5 2.7L6.5 2.4L6.4 2.4L6.2 2.4L6.2 2.7ZM8.6 8L8.7 8.3L8.3 8.7L7.9 9.1L7.7 9L7.5 8.9L7.5 9L7.5 9.1L7.8 9.7L8.1 10.2L8.6 10.4L9 10.6L9.5 10L10 9.4L10.1 9.1L10.2 8.8L10 8.6L9.8 8.3L9.4 8L9 7.8L8.7 7.8L8.5 7.8L8.6 8ZM10.5 9.3L10.1 9.5L9.9 10.4L9.8 11.2L9.7 11.9L9.6 12.5L9.5 14.4L9.5 16.2L9.3 16.4L9.1 16.6L9 17.3L8.9 18.1L9.1 18.5L9.3 18.8L9 18.8L8.8 18.8L8.6 19.1L8.5 19.4L8.2 20.5L7.9 21.6L7.9 22.5L7.9 23.3L7.7 23.3L7.4 23.4L7.1 23.6L6.8 23.8L6.8 23.9L6.8 24L9.2 24L11.7 24L11.8 23.4L11.9 22.9L11.9 22.1L11.9 21.3L11.7 20.8L11.5 20.2L11.4 20L11.3 19.9L11.2 20.2L11.1 20.6L10.8 20.6L10.5 20.6L10.1 20.3L9.8 20.1L9.8 19.8L9.8 19.5L9.6 19.4L9.4 19.3L9.4 19.1L9.4 18.9L9.6 19.1L9.8 19.2L10.4 19.3L10.9 19.4L11.2 19.1L11.5 18.8L11.7 18.1L11.9 17.3L12.3 17.3L12.7 17.3L12.7 17.2L12.7 17L12.5 16.9L12.3 16.8L12.6 16.4L12.9 16L13.5 15.7L14.2 15.4L14.5 15.4L14.8 15.4L14.8 15.6L14.8 15.9L15 15.8L15.1 15.7L15 14.7L14.9 13.7L15.1 13.1L15.2 12.5L15.1 12.6L14.9 12.6L14.6 12.5L14.3 12.3L14.3 12L14.4 11.7L14.3 11.6L14.1 11.5L14.1 11.1L14.1 10.7L14.3 10.6L14.4 10.5L14.5 10.8L14.6 11L14.8 11L15 11L14.8 10.8L14.5 10.7L14.7 10.4L14.9 10.1L15 10.1L15.2 10L15.2 10.9L15.2 11.8L15.5 12.1L15.8 12.4L16.3 12.2L16.7 12L16.9 12.4L17.1 12.8L17.3 12.8L17.5 12.8L17.5 13L17.5 13.2L17.3 13.4L17.2 13.6L16.9 13.6L16.7 13.6L16.8 13.4L16.9 13.2L16.8 13.3L16.6 13.5L16.6 14.2L16.6 14.9L16.9 15.6L17.2 16.3L17.5 16.5L17.7 16.7L17.7 17L17.7 17.3L17.9 17.3L18.2 17.3L18.3 17.2L18.4 17L18.2 16.8L18 16.6L18.3 16.5L18.5 16.4L18.7 16.4L18.8 16.4L18.8 16.5L18.8 16.7L18.7 16.6L18.5 16.5L18.6 17L18.6 17.4L18.7 17.7L18.7 18L18.9 17.9L19.1 17.8L19.4 18.1L19.6 18.3L19.8 18L19.9 17.8L19.8 17.3L19.6 16.8L19.6 16L19.5 15.2L19.2 14.5L18.9 13.8L18.3 13.3L17.6 12.8L17.3 12.3L17 11.8L17.3 11.8L17.5 11.8L17.5 11.2L17.5 10.6L17.1 10.2L16.6 9.7L16.2 9.7L15.7 9.7L15.3 9.4L14.8 9.1L13.8 9.3L12.8 9.6L12 9.5L11.1 9.4L11.1 9.2L11 9.1L10.9 9.1L10.8 9.1L10.5 9.3ZM11.2 17.2L11.4 17.2L11.3 17.3L11.2 17.5L10.5 17.4L9.9 17.3L9.7 17.2L9.4 17L9.5 16.7L9.6 16.4L9.7 16.2L9.8 16L10.4 16.6L11.1 17.2L11.2 17.2ZM16.2 12.5L16.2 12.7L16.4 12.9L16.6 13.2L16.6 13.1L16.7 13L16.5 12.7L16.3 12.4L16.2 12.5ZM13.9 16L13.8 16.1L14.1 16.5L14.3 16.8L14.5 16.6L14.6 16.4L14.5 16.1L14.4 15.9L14.2 15.9L14 15.9L13.9 16ZM14.1 17.1L13.2 17.6L13.1 17.8L13 17.9L13.4 18.8L13.8 19.6L13.9 19.6L14.1 19.6L14 21.4L14 23.3L14.1 23.6L14.3 24L14.7 24L15 24L15.3 23.7L15.7 23.5L16.4 23.5L17.2 23.5L17.5 23.7L17.8 24L18.2 24L18.5 24L18.5 23.8L18.5 23.6L18.2 22.6L17.8 21.6L17.4 20.9L17 20.2L16.6 20.2L16.2 20.1L16.2 19.9L16.2 19.7L15.9 19.5L15.6 19.3L15.6 19.1L15.6 19L15.8 19.1L16 19.1L16.1 18.8L16.2 18.4L16 17.7L15.8 17L15.6 16.8L15.4 16.5L15.2 16.5L15 16.5L14.1 17.1ZM17.4 17.7L17.4 18L17.2 17.9L17.1 17.8L17.2 18.1L17.3 18.3L17.4 18.1L17.6 17.8L17.5 17.6L17.4 17.4L17.4 17.7ZM15.8 23.8L15.5 24L16.4 24L17.3 24L16.9 23.8L16.5 23.7L16.3 23.7L16.2 23.7L15.8 23.8Z',
  telegram:  'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  instagram: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.741 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.741 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
  youtube:   'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  x:         'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  tiktok:    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  linkedin:  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  github:    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
};
const SOCIAL_META = {
  telegram:{label:'Telegram',ph:'https://t.me/username'}, instagram:{label:'Instagram',ph:'https://instagram.com/username'},
  youtube:{label:'YouTube',ph:'https://youtube.com/@channel'}, x:{label:'X (Twitter)',ph:'https://x.com/username'},
  tiktok:{label:'TikTok',ph:'https://tiktok.com/@username'}, linkedin:{label:'LinkedIn',ph:'https://linkedin.com/in/username'},
  github:{label:'GitHub',ph:'https://github.com/username'},
  channel:{label:'Telegram kanal',ph:'https://t.me/KANAL'}
};

/* ---------------------------------------------------------------- I18N */
const LANGS = ['uz','en','ru'];
const ML_FIELDS = {
  profile:    ['profession','slogan','location','bio'],
  ui:         ['hero_badge'],
  experience: ['period','title','description'],
  portfolio:  ['title','description','problem','built'],
  favorites:  ['title'],
  education:  ['name','period','description'],
  gallery:    ['caption']
};

let lang = (() => {
  try { const s = localStorage.getItem('cvLang'); if (LANGS.includes(s)) return s; } catch {}
  return '';
})();
const hasPersonalLang = () => {
  try { return LANGS.includes(localStorage.getItem('cvLang')); } catch { return false; }
};

/* Read a possibly-multilingual value in the active language, falling back to
   Uzbek, then any non-empty language, then ''. */
function L(v){
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object') return v[CV.lang] || v.uz || v.en || v.ru || '';
  return '';
}

function normalizeML(d){
  for (const [root, fields] of Object.entries(ML_FIELDS)){
    const node = d[root];
    if (!node) continue;
    const rows = Array.isArray(node) ? node : [node];
    for (const row of rows){
      if (!row || typeof row !== 'object') continue;
      for (const f of fields){
        let v = row[f];
        if (v == null) v = '';
        if (typeof v === 'string' || typeof v === 'number'){
          row[f] = { uz: String(v), en: '', ru: '' };
        } else if (typeof v === 'object'){
          row[f] = { uz: v.uz || '', en: v.en || '', ru: v.ru || '' };
        }
      }
      /* decisions[] — {uz,en,ru} matnlar ro'yxati; numbers[] — {v, l:{...}} */
      if (root === 'portfolio'){
        row.decisions = (row.decisions || []).map(x =>
          (typeof x === 'string') ? { uz:x, en:'', ru:'' } : { uz:x?.uz||'', en:x?.en||'', ru:x?.ru||'' });
        row.numbers = (row.numbers || []).map(x => ({
          v: String(x?.v ?? ''), l: (typeof x?.l === 'object') ? { uz:x.l.uz||'', en:x.l.en||'', ru:x.l.ru||'' } : { uz:String(x?.l||''), en:'', ru:'' }
        }));
      }
    }
  }
  return d;
}

/* ------------------------------------------------------------------ STATE */
const clone = o => JSON.parse(JSON.stringify(o));
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

function merge(base, over){
  const out = clone(base);
  if (!isObj(over)) return out;
  for (const k of Object.keys(over)){
    const v = over[k];
    if (Array.isArray(v)) out[k] = clone(v);
    else if (isObj(v) && isObj(out[k])) out[k] = merge(out[k], v);
    else if (v !== undefined) out[k] = v;
  }
  return out;
}

const slugify = s => String(s||'').toLowerCase()
  .replace(/[ʼ'’`‘]/g, '')
  .replace(/oʻ|o‘/g, 'o').replace(/gʻ|g‘/g, 'g')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'ish';

/* Old data (published documents, this browser's copies) arrives in the
   previous shape. Upgrade it in place so every page can assume the new one:
     • skills: [{name,level,category}]  →  "Name · Name · …"
     • theme / videos / bgVideo / sandColors / stats  →  gone
     • music.autoplay  →  gone (autoplay o'chirildi)
     • portfolio items grow slug/problem/built/decisions/numbers/repo   */
function migrate(d){
  if (Array.isArray(d.skills))
    d.skills = d.skills.map(s => (s && typeof s === 'object') ? s.name : s).filter(Boolean).join(' · ');
  if (typeof d.skills !== 'string') d.skills = DEFAULTS.skills;
  delete d.stats; delete d.videos; delete d.bgVideo; delete d.sandColors; delete d.theme;
  if (d.music) delete d.music.autoplay;
  const seen = new Set();
  (d.portfolio || []).forEach((p, i) => {
    if (!p || typeof p !== 'object') return;
    if (!p.slug){
      const base = slugify(p.title?.uz || p.title?.en || p.title || ('ish-' + (i+1)));
      let s = base, n = 2;
      while (seen.has(s)) s = base + '-' + n++;
      p.slug = s;
    }
    seen.add(p.slug);
    p.problem   ||= { uz:'', en:'', ru:'' };
    p.built     ||= { uz:'', en:'', ru:'' };
    p.decisions ||= [];
    p.numbers   ||= [];
    p.repo      ||= '';
  });
  return d;
}

let data = (() => {
  let d = clone(DEFAULTS);
  if (typeof window !== 'undefined' && window.DEPLOYED_DATA) d = merge(d, window.DEPLOYED_DATA);
  try {
    const saved = localStorage.getItem('cvData');
    if (saved) d = merge(d, JSON.parse(saved));
  } catch(e){ console.warn('loadData', e); }
  return normalizeML(migrate(d));
})();

if (!lang) lang = LANGS.includes(data.lang) ? data.lang : 'uz';

let saveTimer = null, cloudTimer = null;
const saveListeners = new Set();

function save(){
  let ok = true;
  try { localStorage.setItem('cvData', JSON.stringify(data)); localStorage.setItem('cvSavedAt', String(Date.now())); }
  catch(e){ console.warn('saveData', e); toast('Saqlab bo\'lmadi — xotira to\'lgan bo\'lishi mumkin'); ok = false; }
  saveListeners.forEach(f => { try { f(); } catch {} });
  cloudPushSoon();
  return ok;
}
function saveSoon(){ clearTimeout(saveTimer); saveTimer = setTimeout(save, 250); }

/* Debounced auto-publish — only a signed-in admin can actually write (RLS). */
function cloudPushSoon(){
  const C = window.Cloud;
  if (!C?.enabled || !C.status().signedIn) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(async () => {
    cloudTimer = null;
    try { await C.save(data); saveListeners.forEach(f => { try { f('cloud'); } catch {} }); }
    catch(e){ console.warn('auto-publish', e); toast('Bulutga saqlanmadi — qayta urinilmoqda', 2500); }
  }, 1400);
}
addEventListener('pagehide', () => {
  if (cloudTimer){
    clearTimeout(cloudTimer); cloudTimer = null;
    window.Cloud?.saveBeacon?.(data);
  }
});

/* Pull the published document (if any), merged over defaults + migrated.
   Returns the fresh data object, or null when the cloud has nothing new. */
async function loadCloud(){
  const C = window.Cloud;
  if (!C?.enabled) return null;
  await C.init();
  const remote = await C.load();
  if (!remote || !Object.keys(remote).length) return null;
  const localEdits = (() => { try { return !!localStorage.getItem('cvData'); } catch { return false; } })();
  const localAt  = (() => { try { return Number(localStorage.getItem('cvSavedAt') || 0); } catch { return 0; } })();
  const remoteAt = Date.parse(C.lastUpdatedAt || '') || 0;
  // The admin's own device keeps its newer local edits; everyone else takes
  // the published copy.
  if (localEdits && C.status().signedIn && localAt >= remoteAt - 3000) return null;
  data = normalizeML(migrate(merge(DEFAULTS, remote)));
  if (!hasPersonalLang() && LANGS.includes(data.lang)) lang = data.lang;
  return data;
}

const get = (path, obj) => path.split('.').reduce((o,k)=>o?.[k], obj ?? data);
function set(path, val){
  const ks = path.split('.'); let o = data;
  for (let i=0;i<ks.length-1;i++) o = o[ks[i]] ??= {};
  o[ks[ks.length-1]] = val;
}

/* ------------------------------------------------------------------ UTIL */
const $  = (s,r=document) => r.querySelector(s);
const $$ = (s,r=document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uid = () => Math.random().toString(36).slice(2, 9);
const tidyUrl = u => { u=String(u||'').trim(); if(!u) return ''; return /^(https?:|mailto:|tel:|\/|\.|#)/i.test(u) ? u : 'https://'+u; };

function toast(msg, ms=2200){
  const el = $('#toast'); if(!el) return;
  el.textContent = msg; el.classList.add('on');
  clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('on'), ms);
}

/* Brend (admin yuklagan logo/favicon) — har sahifada bir xil qo'llanadi. */
function applyBranding(){
  const b = data.branding || {};
  const bimg = $('#brandImg');
  if (bimg){
    if (!bimg.dataset.def) bimg.dataset.def = bimg.getAttribute('src');
    const target = tidyUrl(b.logo) || bimg.dataset.def;
    if (bimg.getAttribute('src') !== target) bimg.src = target;
  }
  if (tidyUrl(b.favicon)){
    $$('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(l => {
      if (l.href !== tidyUrl(b.favicon)) l.href = tidyUrl(b.favicon);
    });
  }
}

window.CV = {
  DEFAULTS, LANGS, ML_FIELDS, ICONS, SOCIAL_META,
  get data(){ return data; }, set data(d){ data = d; },
  get lang(){ return lang; }, set lang(v){ if (LANGS.includes(v)) lang = v; },
  hasPersonalLang, L, normalizeML, migrate, merge, clone, slugify,
  save, saveSoon, onSave(fn){ saveListeners.add(fn); },
  loadCloud, get:get, set:set,
  $, $$, esc, uid, tidyUrl, toast, applyBranding
};
})();

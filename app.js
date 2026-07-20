/* ==========================================================================
   Kamolbek Muzaffarov — CV Portfolio · app logic
   Data → localStorage (+ optional data.js for the deployed/global copy).
   Admin binds via [data-model="dot.path"] and autosaves.
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
    bio: { uz: "Men Kamolbek — sunʼiy intellekt, avtomatlashtirish va dizayn kesishmasiga qiziqqan oʻz-oʻzini oʻrgatgan muhandisman. Soʻnggi yillarda men siz uxlab yotganingizda lidlarni qoʻlga oladigan Telegram botlarni, xona rasmlarini oʻqib dizayn taklif qiladigan sunʼiy intellekt yordamchilarini va xaosni aniqlikka aylantiradigan boshqaruv panellarini ishlab chiqdim.", en: "I'm Kamolbek — a self-taught engineer fascinated by the intersection of AI, automation, and design. Over the past few years, I've built Telegram bots that capture leads while you sleep, AI assistants that read a photo of a room and suggest design ideas, and admin dashboards that turn chaos into clarity.", ru: "Я Камолбек — инженер-самоучка, увлечённый всем, что рождается на стыке AI, автоматизации и дизайна. За последние годы я создавал Telegram-ботов, которые ловят лиды, пока вы спите, AI-ассистентов, которые анализируют фото комнаты и подсказывают дизайн-решения, и админ-панели, которые превращают хаос в порядок." },
    avatar: "assets/kamolbek-900.jpg",
    /* Arabcha shior — hadis: "Amallar niyatlarga bog'liq". Bosh sahifada
       katta ko'rinadi; barcha tillarda bir xil (arabcha matn). */
    motto: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ"
  },
  ui: { hero_badge: { uz: "Yangi loyihalar uchun ochiq · 2026", en: "Open to new projects · 2026", ru: "Открыт к новым проектам · 2026" } },
  stats: { years: "5+", projects: "30+", clients: "25+", uptime: "99.9%" },
  skills: [
    { category: "Languages", name: "Python", level: 95 },
    { category: "Languages", name: "JavaScript / TypeScript", level: 88 },
    { category: "Languages", name: "SQL", level: 85 },
    { category: "Languages", name: "Bash", level: 75 },
    { category: "Frontend", name: "React / Next.js", level: 90 },
    { category: "Frontend", name: "HTML / CSS", level: 95 },
    { category: "Frontend", name: "Flutter", level: 70 },
    { category: "Frontend", name: "TailwindCSS", level: 92 },
    { category: "Backend & AI", name: "FastAPI / Aiogram", level: 95 },
    { category: "Backend & AI", name: "OpenAI / Gemini", level: 90 },
    { category: "Backend & AI", name: "PostgreSQL / Redis", level: 85 },
    { category: "Backend & AI", name: "Vector DBs (RAG)", level: 80 },
    { category: "DevOps", name: "Linux / systemd", level: 88 },
    { category: "DevOps", name: "Docker", level: 82 },
    { category: "DevOps", name: "Oracle Cloud / AWS", level: 78 },
    { category: "DevOps", name: "CI/CD", level: 75 }
  ],
  experience: [
    { period: { uz: "2024 — Hozir", en: "2024 — Present", ru: "2024 — наст. время" }, title: { uz: "Asoschi va Bosh Dasturchi", en: "Founder & Lead Developer", ru: "Основатель и ведущий разработчик" }, company: "Independent / Freelance",
      description: { uz: "Telegram botlari, sunʼiy intellekt integratsiyalari va bulutli avtomatlashtirish loyihalari ustida ishlayman. Mijozlar uchun boshidan oxirigacha yechimlar ishlab chiqaman — boshlangʻich serverdan to toʻlov qiladigan mijozgacha.", en: "I build Telegram bots, AI integrations, and cloud automation. I deliver end-to-end solutions for clients — from the backend server to the paying customer.", ru: "Работаю над Telegram-ботами, AI-интеграциями и проектами облачной автоматизации. Разрабатываю для клиентов решения под ключ — от настройки сервера до первого платящего клиента." } },
    { period: { uz: "2022 — 2024", en: "2022 — 2024", ru: "2022 — 2024" }, title: { uz: "Full-Stack Dasturchi", en: "Full-Stack Developer", ru: "Full-Stack разработчик" }, company: "Tech Studio Tashkent",
      description: { uz: "B2B SaaS mahsulotlari uchun interfeys va server qismlarini ishlab chiqdim. React/Next.js asosida 10+ boshqaruv paneli yaratdim, FastAPI va PostgreSQL bilan ishladim.", en: "Built frontend and backend for B2B SaaS products. Shipped 10+ dashboards in React/Next.js, backed by FastAPI and PostgreSQL.", ru: "Разрабатывал фронтенд и бэкенд для B2B SaaS-продуктов. Создал более 10 дашбордов на React/Next.js, работал с бэкендом на FastAPI и базой PostgreSQL." } },
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
  portfolio: [
    { title: { uz: "Chozma Shift AI Bot", en: "Chozma Shift AI Bot", ru: "Chozma Shift AI Bot" }, description: { uz: "Chozma shift biznesi uchun Telegram bot. Gemini Vision orqali xona rasmlarini tahlil qiladi, narxni hisoblaydi va lidlarni CRM tizimiga uzatadi.", en: "A Telegram bot for a stretch-ceiling business. It analyzes photos of a room with Gemini Vision, calculates pricing, and pushes leads straight into the admin CRM.", ru: "Telegram-бот для бизнеса по натяжным потолкам. С помощью Gemini Vision анализирует фото комнаты, рассчитывает стоимость и передаёт лиды в CRM администратора." },
      image: "", link: "", tags: ["Aiogram 3", "Gemini Vision", "SQLite", "Oracle Cloud"], cat: "bot" },
    { title: { uz: "Lead Funnel Pro", en: "Lead Funnel Pro", ru: "Lead Funnel Pro" }, description: { uz: "Telegram, Instagram shaxsiy xabarlari va veb-formani birlashtirgan koʻp bosqichli lidlarni saralash tizimi. Issiq lidlarni avtomatik sotuv boʻlimiga yoʻnaltiradi.", en: "A multi-stage lead qualification engine that brings together Telegram, Instagram DMs, and a web form. It automatically routes hot leads straight to sales.", ru: "Многоступенчатый механизм квалификации лидов, объединяющий Telegram, Instagram DM и веб-форму. Горячие лиды автоматически направляются в отдел продаж." },
      image: "", link: "", tags: ["FastAPI", "PostgreSQL", "Redis", "Next.js"], cat: "bot" },
    { title: { uz: "Vision Designer", en: "Vision Designer", ru: "Vision Designer" }, description: { uz: "Sunʼiy intellekt bilan interyer dizaynining dastlabki koʻrinishi. Foydalanuvchi xona rasmini yuklaydi, materiallarni tanlaydi — tizim fotorealistik maketlarni qaytaradi.", en: "An AI-powered interior design preview. The user uploads a photo of a room and picks materials — the system returns photorealistic mockups.", ru: "Превью дизайна интерьера на базе AI. Пользователь загружает фото комнаты и выбирает материалы — система возвращает фотореалистичные макеты." },
      image: "", link: "", tags: ["Python", "Stable Diffusion", "React", "WebSockets"], cat: "app" },
    { title: { uz: "Pulse Analytics", en: "Pulse Analytics", ru: "Pulse Analytics" }, description: { uz: "Kichik biznes uchun real vaqtli boshqaruv paneli. Telegram bot egasining savollariga oddiy tilda javob beradi — oqimli maʼlumotlar ombori asosida.", en: "A real-time dashboard for small businesses. A Telegram bot answers the owner's questions in plain language — powered by a streaming data warehouse.", ru: "Дашборд в реальном времени для малого бизнеса. Telegram-бот простым языком отвечает на вопросы владельца — на основе потокового хранилища данных." },
      image: "", link: "", tags: ["Aiogram", "OpenAI", "ClickHouse", "D3.js"], cat: "site" }
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
  /* Videos / tracks / gallery are plain editable lists — the admin can add,
     rename and delete freely. They used to be frozen consts in this file. */
  videos: [
    /* `accent` is PRE-COMPUTED, and it has to be. archive.org 302-redirects to
       a CDN node that sends no Access-Control-Allow-Origin, so a <video
       crossOrigin="anonymous"> pointed at these fails to load ENTIRELY, and
       without crossOrigin the canvas is tainted and getImageData throws. Either
       way the browser can't read these pixels. So each value below was produced
       by running pickAccent() over a real frame of that exact video, offline.
       Uploaded videos (Supabase sends CORS `*`) are sampled live instead. */
    { id:'forest',    name:"Bulutlar (yuqoridan)",      thumb:'https://archive.org/services/img/pixabay-9584',
      url:'https://archive.org/download/pixabay-9584/video-9584_source.mp4',
      accent:'#46a1d8', accent2:'#7e90dd' },
    { id:'green',     name:"O'rmon ichi",               thumb:'https://archive.org/services/img/pixabay-19400',
      url:'https://archive.org/download/pixabay-19400/video-19400_large.mp4',
      accent:'#d98a3e', accent2:'#dbc07a' },
    { id:'path',      name:"Sehrli o'rmon yo'li",       thumb:'https://archive.org/services/img/pixabay-19731',
      url:'https://archive.org/download/pixabay-19731/video-19731_large.mp4',
      accent:'#b6ff3d', accent2:'#98f881' },
    { id:'mountains', name:"Tog' panoramasi",           thumb:'https://archive.org/services/img/pixabay-21896',
      url:'https://archive.org/download/pixabay-21896/video-21896_source.mp4',
      accent:'#1fabff', accent2:'#6480f7' },
    { id:'clouds',    name:'Bulutlar va osmon',         thumb:'https://archive.org/services/img/pixabay-21285',
      url:'https://archive.org/download/pixabay-21285/video-21285_source.mp4',
      accent:'#e8ecf2', accent2:'#b9c2cf' },
    { id:'fog',       name:'Quyosh tumani',             thumb:'https://archive.org/services/img/pixabay-19409',
      url:'https://archive.org/download/pixabay-19409/video-19409_large.mp4',
      accent:'#e8ecf2', accent2:'#b9c2cf' }
  ],
  /* url = to'g'ridan-to'g'ri audio fayl (saytda chalinadi);
     link = tashqi sahifa (YouTube / Spotify / Yandex Music) — yangi oynada ochiladi. */
  tracks: [
    { id:'song1',  name:'SoundHelix 1',  icon:'🎵', link:'', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id:'song2',  name:'SoundHelix 2',  icon:'🎶', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id:'song9',  name:'SoundHelix 9',  icon:'🎼', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    { id:'song15', name:'SoundHelix 15', icon:'🎧', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' }
  ],
  gallery: [
    { id:"p01", src:"assets/gallery/photo-01.jpg", thumb:"assets/gallery/thumb/photo-01.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p02", src:"assets/gallery/photo-02.jpg", thumb:"assets/gallery/thumb/photo-02.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p03", src:"assets/gallery/photo-03.jpg", thumb:"assets/gallery/thumb/photo-03.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p04", src:"assets/gallery/photo-04.jpg", thumb:"assets/gallery/thumb/photo-04.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p05", src:"assets/gallery/photo-05.jpg", thumb:"assets/gallery/thumb/photo-05.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p06", src:"assets/gallery/photo-06.jpg", thumb:"assets/gallery/thumb/photo-06.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p07", src:"assets/gallery/photo-07.jpg", thumb:"assets/gallery/thumb/photo-07.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p08", src:"assets/gallery/photo-08.jpg", thumb:"assets/gallery/thumb/photo-08.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p09", src:"assets/gallery/photo-09.jpg", thumb:"assets/gallery/thumb/photo-09.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p10", src:"assets/gallery/photo-10.jpg", thumb:"assets/gallery/thumb/photo-10.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p11", src:"assets/gallery/photo-11.jpg", thumb:"assets/gallery/thumb/photo-11.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p12", src:"assets/gallery/photo-12.jpg", thumb:"assets/gallery/thumb/photo-12.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p13", src:"assets/gallery/photo-13.jpg", thumb:"assets/gallery/thumb/photo-13.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p14", src:"assets/gallery/photo-14.jpg", thumb:"assets/gallery/thumb/photo-14.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p15", src:"assets/gallery/photo-15.jpg", thumb:"assets/gallery/thumb/photo-15.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p16", src:"assets/gallery/photo-16.jpg", thumb:"assets/gallery/thumb/photo-16.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p17", src:"assets/gallery/photo-17.jpg", thumb:"assets/gallery/thumb/photo-17.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p18", src:"assets/gallery/photo-18.jpg", thumb:"assets/gallery/thumb/photo-18.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p19", src:"assets/gallery/photo-19.jpg", thumb:"assets/gallery/thumb/photo-19.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p20", src:"assets/gallery/photo-20.jpg", thumb:"assets/gallery/thumb/photo-20.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p21", src:"assets/gallery/photo-21.jpg", thumb:"assets/gallery/thumb/photo-21.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p22", src:"assets/gallery/photo-22.jpg", thumb:"assets/gallery/thumb/photo-22.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p23", src:"assets/gallery/photo-23.jpg", thumb:"assets/gallery/thumb/photo-23.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p24", src:"assets/gallery/photo-24.jpg", thumb:"assets/gallery/thumb/photo-24.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p25", src:"assets/gallery/photo-25.jpg", thumb:"assets/gallery/thumb/photo-25.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p26", src:"assets/gallery/photo-26.jpg", thumb:"assets/gallery/thumb/photo-26.jpg", caption:{ uz:"", en:"", ru:"" } },
    { id:"p27", src:"assets/gallery/photo-27.jpg", thumb:"assets/gallery/thumb/photo-27.jpg", caption:{ uz:"", en:"", ru:"" } }
  ],
  music: { src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
           volume: 40, autoplay: true, presetId: "song1" },
  bgVideo: { enabled: true, presetId: "clouds", src: "", opacity: 70, tint: 55 },
  lang: "uz",
  /* «Uch rang» temasining uchta bo'yog'i. Bo'sh = standart (paper/navy/amber).
     Butun tema shu uch rangdan hisoblanadi — boshqa hech narsa kerak emas. */
  sandColors: { bg:'', fg:'', accent:'' },
  theme: "liquid"
};
const THEMES = ['liquid','sand'];

/* Brand icons (simple-icons paths, 24×24 viewBox) */
const ICONS = {
  get channel(){ return this.telegram; },
  telegram:  'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  instagram: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.741 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.741 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z',
  youtube:   'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  x:         'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  tiktok:    'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  linkedin:  'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  github:    'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
};
const SOCIAL_META = {
  telegram:{label:'Telegram',ph:'https://t.me/username'},
  channel:{label:'Telegram kanal',ph:'https://t.me/KANAL'}, instagram:{label:'Instagram',ph:'https://instagram.com/username'},
  youtube:{label:'YouTube',ph:'https://youtube.com/@channel'}, x:{label:'X (Twitter)',ph:'https://x.com/username'},
  tiktok:{label:'TikTok',ph:'https://tiktok.com/@username'}, linkedin:{label:'LinkedIn',ph:'https://linkedin.com/in/username'},
  github:{label:'GitHub',ph:'https://github.com/username'}
};

/* ======================================================== INTERNATIONALISATION
   The site speaks Uzbek, English and Russian. Two kinds of text:

     1. CONTENT (bio, descriptions…) lives in `data` as { uz, en, ru } objects.
        ML_FIELDS says which fields those are; L() reads the active language.
     2. STATIC UI chrome (nav, headings, buttons) lives in STRINGS, applied to
        any [data-i18n] element. The admin panel is deliberately Uzbek-only —
        it's the owner's private tool, not a visitor surface.

   Default language is always Uzbek; the visitor's choice is remembered per
   browser (separate from the shared content, which is the same for everyone). */
const LANGS = ['uz','en','ru'];

const ML_FIELDS = {
  profile:    ['profession','slogan','location','bio'],
  ui:         ['hero_badge'],
  experience: ['period','title','description'],
  portfolio:  ['title','description'],
  favorites:  ['title'],
  education:  ['name','period','description'],
  gallery:    ['caption']
};

let lang = (() => {
  // Faqat tashrifchining SHAXSIY tanlovi. Bo'lmasa — data tayyor bo'lgach
  // egasi chop etgan standart til (data.lang) qo'llanadi.
  try { const s = localStorage.getItem('cvLang'); if (LANGS.includes(s)) return s; } catch {}
  return '';
})();
const hasPersonalLang = () => {
  try { return LANGS.includes(localStorage.getItem('cvLang')); } catch { return false; }
};

/* Read a possibly-multilingual value in the active language, falling back to
   Uzbek, then any non-empty language, then ''. Plain strings pass through, so
   old data and single-language fields keep working. */
function L(v){
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (typeof v === 'object'){
    return v[lang] || v.uz || v.en || v.ru || '';
  }
  return '';
}

const STRINGS = {
  nav_home:      { uz:'Bosh',      en:'Home',       ru:'Главная' },
  nav_about:     { uz:'Haqimda',   en:'About',      ru:'Обо мне' },
  nav_skills:    { uz:'Koʻnikmalar', en:'Skills',   ru:'Навыки' },
  nav_exp:       { uz:'Tajriba',   en:'Experience', ru:'Опыт' },
  nav_portfolio: { uz:'Ishlarim',  en:'Portfolio',  ru:'Портфолио' },
  nav_fav:       { uz:'Sevimli',   en:'Favorites',  ru:'Избранное' },
  nav_contact:   { uz:'Kontakt',   en:'Contact',    ru:'Контакты' },

  settings_title:{ uz:'Til va koʻrinish', en:'Language & theme', ru:'Язык и тема' },
  lang_label:    { uz:'Til',       en:'Language',   ru:'Язык' },
  theme_liquid:  { uz:'Suyuq shisha', en:'Liquid Glass', ru:'Жидкое стекло' },
  theme_sand:    { uz:'Uch rang',  en:'Three colors', ru:'Три цвета' },
  download_cv:   { uz:'CV yuklab olish (PDF) ↓', en:'Download CV (PDF) ↓', ru:'Скачать CV (PDF) ↓' },

  hand_title:    { uz:'Qoʻl bilan boshqaruv', en:'Hand control', ru:'Управление рукой' },
  hand_reset:    { uz:'standart', en:'reset', ru:'сброс' },
  hand_hint:     { uz:'Koʻrsatkich barmogʻingiz — sichqoncha. Bosh barmoqqa tez tekkizsangiz — bosish. Tekkizib turib qoʻlni tepa/pastga suring — sahifa aylanadi.',
                   en:'Your index finger is the cursor. A quick tap to the thumb is a click. Hold them together and move up/down to scroll.',
                   ru:'Указательный палец — курсор. Быстрое касание большого пальца — клик. Держите вместе и двигайте вверх/вниз — прокрутка.' },
  hand_speed:    { uz:'Kursor sezgirligi', en:'Cursor sensitivity', ru:'Чувствительность курсора' },
  hand_smooth:   { uz:'Silliqlash (titrashga qarshi)', en:'Smoothing (anti-jitter)', ru:'Сглаживание (против дрожания)' },
  hand_pinch:    { uz:'Barmoq tekkizish sezgirligi', en:'Pinch sensitivity', ru:'Чувствительность щипка' },
  hand_scroll:   { uz:'Aylantirish tezligi', en:'Scroll speed', ru:'Скорость прокрутки' },

  hero_contact:  { uz:'Bogʻlanish', en:'Get in touch', ru:'Связаться' },
  hero_cv:       { uz:'CV yuklab olish', en:'Download CV', ru:'Скачать CV' },
  hero_available:{ uz:'Ishga tayyor', en:'Available', ru:'Доступен' },

  sec_about:     { uz:'Haqimda', en:'About', ru:'Обо мне' },
  sec_skills:    { uz:'Koʻnikmalar', en:'Skills', ru:'Навыки' },
  sec_exp:       { uz:'Ish tajribasi', en:'Experience', ru:'Опыт работы' },
  sec_portfolio: { uz:'Ishlarim', en:'Portfolio', ru:'Портфолио' },
  sec_fav:       { uz:'Sevimlilarim', en:'My favorites', ru:'Избранное' },
  sec_fav_sub:   { uz:'Men yoqtirgan pleylistlar, kanallar va resurslar',
                   en:'Playlists, channels and resources I love',
                   ru:'Плейлисты, каналы и ресурсы, которые я люблю' },
  sec_contact:   { uz:'Bogʻlanish', en:'Contact', ru:'Контакты' },

  stat_years:    { uz:'Yillik tajriba', en:'Years of experience', ru:'Лет опыта' },
  stat_projects: { uz:'Loyihalar', en:'Projects', ru:'Проекты' },
  stat_clients:  { uz:'Mijozlar', en:'Clients', ru:'Клиенты' },
  stat_uptime:   { uz:'Ishonchlilik', en:'Uptime', ru:'Аптайм' },

  contact_h:     { uz:'Loyihangiz haqida gaplashaylikmi?', en:'Let’s talk about your project', ru:'Обсудим ваш проект?' },
  contact_sub:   { uz:'Xabar yozing — 24 soat ichida javob beraman.',
                   en:'Drop a message — I reply within 24 hours.',
                   ru:'Напишите — отвечаю в течение 24 часов.' },
  form_name:     { uz:'Ismingiz', en:'Your name', ru:'Ваше имя' },
  form_email:    { uz:'Elektron pochta', en:'Email', ru:'Эл. почта' },
  form_subject:  { uz:'Mavzu', en:'Subject', ru:'Тема' },
  form_message:  { uz:'Xabar', en:'Message', ru:'Сообщение' },
  form_ph_name:  { uz:'Toʻliq ismingiz', en:'Your full name', ru:'Ваше полное имя' },
  form_ph_subject:{ uz:'Loyiha haqida qisqacha', en:'Briefly about the project', ru:'Кратко о проекте' },
  form_ph_msg:   { uz:'Loyihangiz haqida batafsil...', en:'Tell me about your project...', ru:'Расскажите о вашем проекте...' },
  form_send:     { uz:'Xabar yuborish', en:'Send message', ru:'Отправить' },

  photos_link:   { uz:'Rasmlarim', en:'My photos', ru:'Мои фото' },

  nav_edu:       { uz:'Taʼlim', en:'Education', ru:'Образование' },
  sec_edu:       { uz:'Taʼlim', en:'Education', ru:'Образование' },
  edu_docs:      { uz:'Hujjatlar va rasmlar', en:'Documents & photos', ru:'Документы и фото' },
  edu_nodocs:    { uz:'Hujjatlar tez orada qoʻshiladi', en:'Documents coming soon', ru:'Документы скоро появятся' },
  edu_open:      { uz:'Batafsil →', en:'Details →', ru:'Подробнее →' },
  close:         { uz:'Yopish', en:'Close', ru:'Закрыть' },

  sec_playlist:  { uz:'Musiqalarim', en:'My music', ru:'Моя музыка' },
  playlist_sub:  { uz:'Men yoqtirgan qoʻshiqlar — shu yerda tinglang yoki havolada oching',
                   en:'Songs I love — listen right here or open the link',
                   ru:'Песни, которые я люблю — слушайте здесь или откройте по ссылке' },

  cat_all:   { uz:'Barchasi', en:'All', ru:'Все' },
  cat_bot:   { uz:'Botlar', en:'Bots', ru:'Боты' },
  cat_site:  { uz:'Saytlar', en:'Websites', ru:'Сайты' },
  cat_app:   { uz:'Ilovalar', en:'Apps', ru:'Приложения' },
  cat_esp32: { uz:'ESP32', en:'ESP32', ru:'ESP32' },
  cat_award: { uz:'Mukofotlar', en:'Awards', ru:'Награды' },
  cat_other: { uz:'Boshqa', en:'Other', ru:'Другое' },

};

/* Skill-category display names. The data keeps the original keys; only the
   heading shown to the visitor is translated. Unknown categories (the owner
   can invent new ones in the admin) pass through untouched. */
const CAT_I18N = {
  'Languages':    { uz:'Dasturlash tillari', en:'Languages', ru:'Языки программирования' },
  'Frontend':     { uz:'Veb-interfeys', en:'Frontend', ru:'Веб-интерфейс' },
  'Backend & AI': { uz:'Server va sunʼiy intellekt', en:'Backend & AI', ru:'Сервер и ИИ' },
  'DevOps':       { uz:'DevOps', en:'DevOps', ru:'DevOps' }
};

/* Portfolio categories, in display order. Chips render only for categories
   that actually contain projects (plus "all"). */
const PORTFOLIO_CATS = ['bot','site','app','esp32','award','other'];

const T = key => (STRINGS[key] ? (STRINGS[key][lang] || STRINGS[key].uz) : key);

/* Walk every ML field and coerce it to a { uz, en, ru } object. This upgrades
   old single-language data (string → {uz:string}) and repairs partial objects,
   so render and admin can always assume the trilingual shape. */
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

let data = (() => {
  // 1) start from defaults, 2) layer the deployed data.js, 3) layer this browser's edits
  let d = clone(DEFAULTS);
  if (typeof window !== 'undefined' && window.DEPLOYED_DATA) d = merge(d, window.DEPLOYED_DATA);
  try {
    const saved = localStorage.getItem('cvData');
    if (saved) d = merge(d, JSON.parse(saved));
  } catch(e){ console.warn('loadData', e); }
  return normalizeML(d);
})();

/* Til: shaxsiy tanlov yo'q bo'lsa — egasi chop etgan standart (data.lang). */
if (!lang) lang = LANGS.includes(data.lang) ? data.lang : 'uz';

let saveTimer = null, cloudTimer = null;
function save(){
  let ok = true;
  try { localStorage.setItem('cvData', JSON.stringify(data)); localStorage.setItem('cvSavedAt', String(Date.now())); flashSaved(); }
  catch(e){ console.warn('saveData', e); toast('Saqlab bo\'lmadi — xotira to\'lgan bo\'lishi mumkin'); ok = false; }
  // When the admin is signed into the cloud, every change is republished (a
  // little after the last edit) so it reaches every visitor — no manual step.
  cloudPushSoon();
  return ok;
}
function saveSoon(){ clearTimeout(saveTimer); saveTimer = setTimeout(save, 250); }

/* Debounced auto-publish. Only fires for a signed-in admin; for everyone else
   Cloud.save() would be rejected by RLS anyway, so we don't even try. */
function cloudPushSoon(){
  const C = window.Cloud;
  if (!C?.enabled || !C.status().signedIn) return;
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(async () => {
    cloudTimer = null;
    try { await C.save(data); admin.renderSync?.(); flashSaved(); }
    catch(e){ console.warn('auto-publish', e); toast('Bulutga saqlanmadi — qayta urinilmoqda', 2500); }
  }, 1400);
}

/* Tahrirdan 1.4s o'tmasdan tab yopilsa, kutayotgan nashr yo'qolardi.
   pagehide'da keepalive so'rov bilan darhol jo'natamiz. */
addEventListener('pagehide', () => {
  if (cloudTimer){
    clearTimeout(cloudTimer); cloudTimer = null;
    window.Cloud?.saveBeacon?.(data);
  }
});

const get = (path, obj=data) => path.split('.').reduce((o,k)=>o?.[k], obj);
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
function flashSaved(){
  const el = $('#adminSaved'); if(!el) return;
  el.classList.add('on'); clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('on'), 1200);
}

/* ---------------------------------------------------------------- RENDER */
function renderBindings(){
  // Every data-bind value is run through L(): plain strings pass through, and
  // multilingual { uz,en,ru } fields resolve to the active language.
  $$('[data-bind]').forEach(el => {
    const v = L(get(el.dataset.bind));
    if (v !== undefined && v !== null && v !== '') el.textContent = v;
  });
  // SEO uchun: ism + brend (MKM777) + kasb — «Kamolbek» va «MKM777»
  // so'zlari doim sarlavhada bo'lsin.
  document.title = `${data.profile.name} (MKM777) — ${L(data.profile.profession)}`;
  const photo = $('.hero__photo');
  if (photo){
    const sz = Number(data.profile.photoSize) || 260;
    photo.style.width = `min(${sz}px, 62vw)`;
  }
  const img = $('#avatarImg');
  if (img){
    const src = data.profile.avatar || DEFAULTS.profile.avatar;
    if (img.getAttribute('src') !== src) img.src = src;
    img.alt = data.profile.name;
  }
}

function renderStats(){
  const map = [['years','stat_years'],['projects','stat_projects'],['clients','stat_clients'],['uptime','stat_uptime']];
  $('#statsWrap').innerHTML = map.map(([k,skey]) =>
    `<div class="stat"><b>${esc(data.stats[k])}</b><span>${esc(T(skey))}</span></div>`).join('');
}

function renderSkills(){
  const groups = {};
  data.skills.forEach(s => (groups[s.category || 'Other'] ||= []).push(s));
  $('#skillsWrap').innerHTML = Object.entries(groups).map(([cat, arr]) => `
    <div class="sgroup" data-rv>
      <h3>${esc(CAT_I18N[cat]?.[lang] || cat)}</h3>
      ${arr.map(s => `
        <div class="skill">
          <div class="skill__t"><b>${esc(s.name)}</b><span>${Number(s.level)||0}%</span></div>
          <div class="skill__bar"><div class="skill__fill" data-w="${Number(s.level)||0}"></div></div>
        </div>`).join('')}
    </div>`).join('');
}

function renderTimeline(){
  const w = $('#timelineWrap');
  const empty = { uz:'Hali tajriba qoʻshilmagan.', en:'No experience added yet.', ru:'Опыт пока не добавлен.' };
  if (!data.experience.length){ w.innerHTML = `<p class="muted">${esc(empty[lang]||empty.uz)}</p>`; return; }
  w.innerHTML = data.experience.map(e => `
    <div class="titem" data-rv>
      <div class="titem__p">${esc(L(e.period))}</div>
      <h3 class="titem__t">${esc(L(e.title))}</h3>
      <div class="titem__c">${esc(e.company)}</div>
      <p class="titem__d">${esc(L(e.description))}</p>
    </div>`).join('');
}

/* ------------------------------------------------------------ EDUCATION
   The site shows only name + years; clicking a row opens a modal with the
   full description and the proof documents/photos. */
function renderEducation(){
  const w = $('#educationWrap'), sec = $('#education');
  if (!w || !sec) return;
  const list = (data.education || []).filter(e => L(e.name));
  const navLink = $('.nav__links a[data-section="education"]')?.parentElement;
  const mobLink = $('#mobileMenu a[href="#education"]');
  sec.hidden = !list.length;
  if (navLink) navLink.hidden = !list.length;
  if (mobLink) mobLink.hidden = !list.length;
  if (!list.length){ w.innerHTML=''; return; }
  w.innerHTML = list.map((e, i) => `
    <button class="edu" data-edu="${i}">
      <span class="edu__b">
        <b>${esc(L(e.name))}</b>
        ${L(e.period) ? `<span class="edu__p">${esc(L(e.period))}</span>` : ''}
      </span>
      <span class="edu__go">${esc(T('edu_open'))}</span>
    </button>`).join('');
}

let eduDocs = [], eduDocIdx = 0;
function openEduModal(i){
  const e = (data.education||[])[i]; if (!e) return;
  const m = $('#eduModal'); if (!m) return;
  $('#eduMTitle').textContent = L(e.name);
  $('#eduMPeriod').textContent = L(e.period) || '';
  $('#eduMDesc').textContent = L(e.description) || '';
  const docs = (e.docs||[]).filter(d => d && d.src);
  eduDocs = docs;
  $('#eduMDocsH').textContent = T('edu_docs');
  $('#eduMDocs').innerHTML = docs.length
    ? docs.map((d,j) => `<img src="${esc(d.thumb || d.src)}" alt="doc ${j+1}" loading="lazy" data-doc="${j}">`).join('')
    : `<p class="muted" style="font-size:13px">${esc(T('edu_nodocs'))}</p>`;
  m.classList.add('open'); m.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeEduModal(){
  const m = $('#eduModal'); if (!m) return;
  m.classList.remove('open'); m.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
function showDoc(n){
  if (!eduDocs.length) return;
  eduDocIdx = (n + eduDocs.length) % eduDocs.length;
  $('#dlbImg').src = eduDocs[eduDocIdx].src;
}
function initEducation(){
  $('#educationWrap')?.addEventListener('click', e => {
    const b = e.target.closest('[data-edu]'); if (b) openEduModal(+b.dataset.edu);
  });
  $('#eduMClose').onclick = closeEduModal;
  $('#eduModal')?.addEventListener('click', e => { if (e.target.id === 'eduModal') closeEduModal(); });
  // Doc lightbox on top of the modal
  const dlb = $('#docLightbox');
  const closeDlb = () => { dlb.classList.remove('open'); $('#dlbImg').removeAttribute('src'); };
  $('#eduMDocs')?.addEventListener('click', e => {
    const im = e.target.closest('[data-doc]'); if (!im) return;
    showDoc(+im.dataset.doc); dlb.classList.add('open');
  });
  $('#dlbClose').onclick = closeDlb;
  $('#dlbPrev').onclick = ev => { ev.stopPropagation(); showDoc(eduDocIdx-1); };
  $('#dlbNext').onclick = ev => { ev.stopPropagation(); showDoc(eduDocIdx+1); };
  dlb?.addEventListener('click', e => { if (e.target === dlb || e.target.id === 'dlbImg') closeDlb(); });
  addEventListener('keydown', e => {
    if (dlb?.classList.contains('open')){
      if (e.key === 'Escape') closeDlb();
      if (e.key === 'ArrowLeft') showDoc(eduDocIdx-1);
      if (e.key === 'ArrowRight') showDoc(eduDocIdx+1);
      return;
    }
    if (e.key === 'Escape' && $('#eduModal')?.classList.contains('open')) closeEduModal();
  });
}

let portfolioFilter = 'all';
function renderPortfolio(){
  const chips = $('#portfolioCats');
  if (chips){
    const present = PORTFOLIO_CATS.filter(c => (data.portfolio||[]).some(p => (p.cat||'other') === c));
    chips.innerHTML = present.length > 1
      ? ['all', ...present].map(c =>
          `<button class="chip ${portfolioFilter===c?'active':''}" data-cat="${c}">${esc(T('cat_'+c))}</button>`).join('')
      : '';
    if (portfolioFilter !== 'all' && !present.includes(portfolioFilter)) portfolioFilter = 'all';
  }
  const w = $('#portfolioWrap');
  const empty = { uz:'Hali loyiha qoʻshilmagan.', en:'No projects added yet.', ru:'Проекты пока не добавлены.' };
  if (!data.portfolio.length){ w.innerHTML = `<p class="muted">${esc(empty[lang]||empty.uz)}</p>`; return; }
  const view = { uz:"Koʻrish ↗", en:'View ↗', ru:'Открыть ↗' };
  const grads = ['linear-gradient(135deg,#ccff33,#5fbf3f)','linear-gradient(135deg,#8a6bff,#4a3fbf)','linear-gradient(135deg,#ff6bcb,#bf3f8a)'];
  const shown = data.portfolio.filter(p => portfolioFilter === 'all' || (p.cat||'other') === portfolioFilter);
  w.innerHTML = shown.map((p,i) => {
    const link = tidyUrl(p.link);
    const title = L(p.title);
    return `
    <article class="pitem" data-rv>
      <div class="pitem__top" style="background:${grads[i%3]}">
        ${p.image ? `<img src="${esc(p.image)}" alt="${esc(title)}" loading="lazy" decoding="async">`
                  : `<span style="color:rgba(0,0,0,.55)">${esc((title||'P').charAt(0).toUpperCase())}</span>`}
      </div>
      <div class="pitem__b">
        <h3>${esc(title)}</h3>
        <p>${esc(L(p.description))}</p>
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
        ${link ? `<a class="plink" href="${esc(link)}" target="_blank" rel="noopener">${esc(view[lang]||view.uz)}</a>` : ''}
      </div>
    </article>`;
  }).join('');
}

function renderFavorites(){
  const list = (data.favorites||[]).filter(f => L(f.title) && tidyUrl(f.url));
  const w = $('#favoritesWrap');
  const sec = $('#favorites');
  // The playlist lives inside this section too, so the section must survive
  // when there are tracks even if every favourite link is empty. Hide the
  // section (and its nav links) only when BOTH are empty.
  const hasTracks = (data.tracks||[]).some(t => t.name && (tidyUrl(t.url) || tidyUrl(t.link)));
  const navLink = $('.nav__links a[data-section="favorites"]')?.parentElement;
  const mobLink = $('#mobileMenu a[href="#favorites"]');
  const show = !!(list.length || hasTracks);
  sec.hidden = !show;
  if (navLink) navLink.hidden = !show;
  if (mobLink) mobLink.hidden = !show;
  if (!list.length){ w.innerHTML = ''; return; }
  w.innerHTML = list.map(f => `
    <a class="link" href="${esc(tidyUrl(f.url))}" target="_blank" rel="noopener" data-rv>
      <span class="link__ico">${esc(f.icon || '🔗')}</span>
      <span class="link__b"><b>${esc(L(f.title))}</b><span>${esc(String(f.url).replace(/^https?:\/\//,''))}</span></span>
      <span class="link__go">↗</span>
    </a>`).join('');
}

/* ------------------------------------------------------------- PLAYLIST
   Public list of the owner's favourite tracks. A track can be:
     url  → a direct audio file, playable right on the site
     link → an external page (YouTube / Spotify / Yandex Music), opens in a tab */
function renderPlaylist(){
  const w = $('#playlistWrap'), blk = $('#playlistBlock');
  if (!w || !blk) return;
  const list = (data.tracks||[]).filter(t => t.name && (tidyUrl(t.url) || tidyUrl(t.link)));
  blk.hidden = !list.length;
  if (!list.length){ w.innerHTML=''; return; }
  const cur = $('#bgAudio');
  w.innerHTML = list.map((t, i) => {
    const playable = !!tidyUrl(t.url);
    const playing = playable && cur && !cur.paused && cur.src === tidyUrl(t.url);
    return `
    <div class="trk ${playing?'trk--on':''}">
      ${playable ? `<button class="trk__play" data-play="${i}" aria-label="Play">
          ${playing
            ? '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
            : '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>'}
        </button>` : `<span class="trk__ico">${esc(t.icon||'🎵')}</span>`}
      <span class="trk__n">${esc(t.name)}</span>
      ${tidyUrl(t.link) ? `<a class="trk__ext" href="${esc(tidyUrl(t.link))}" target="_blank" rel="noopener" title="Havolada ochish">↗</a>` : ''}
    </div>`;
  }).join('');
}

function initPlaylist(){
  const audio = $('#bgAudio');
  $('#playlistWrap')?.addEventListener('click', async e => {
    const b = e.target.closest('[data-play]'); if (!b) return;
    const list = (data.tracks||[]).filter(t => t.name && (tidyUrl(t.url) || tidyUrl(t.link)));
    const t = list[+b.dataset.play]; if (!t) return;
    const src = tidyUrl(t.url); if (!src) return;
    if (audio.src === src && !audio.paused){ audio.pause(); }
    else {
      // Preview playback deliberately does NOT overwrite data.music.src — the
      // background-music choice in the admin stays whatever the owner set.
      audio.src = src;
      try { await audio.play(); } catch { toast('Chalib boʻlmadi'); }
    }
    renderPlaylist();
  });
  audio?.addEventListener('play',  () => renderPlaylist());
  audio?.addEventListener('pause', () => renderPlaylist());
}

function renderSocial(){
  const w = $('#socialWrap');
  w.innerHTML = Object.keys(SOCIAL_META).map(k => {
    const url = tidyUrl(data.social?.[k]);
    if (!url) return '';
    return `<a class="soc" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${SOCIAL_META[k].label}" title="${SOCIAL_META[k].label}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[k]}"/></svg></a>`;
  }).join('');
}

function renderContact(){
  const c = data.contacts;
  const phoneLabel = { uz:'Telefon', en:'Phone', ru:'Телефон' }[lang] || 'Telefon';
  const siteLabel  = { uz:'Veb-sayt', en:'Website', ru:'Веб-сайт' }[lang] || 'Veb-sayt';
  const mailLabel  = { uz:'Elektron pochta', en:'Email', ru:'Эл. почта' }[lang] || 'Elektron pochta';
  const items = [
    c.email && { l:mailLabel, v:c.email, h:'mailto:'+c.email,
      i:'<path d="M2 5.5h20v13H2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3 6 9 6 9-6" fill="none" stroke="currentColor" stroke-width="2"/>' },
    c.phone && { l:phoneLabel, v:c.phone, h:'tel:'+String(c.phone).replace(/[^\d+]/g,''),
      i:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" fill="none" stroke="currentColor" stroke-width="2"/>' },
    tidyUrl(data.social?.telegram) && { l:'Telegram', v:String(data.social.telegram).replace(/^https?:\/\//,''), h:tidyUrl(data.social.telegram),
      i:`<path d="${ICONS.telegram}" fill="currentColor"/>` },
    tidyUrl(data.social?.channel) && { l:'Telegram kanal', v:'@' + String(data.social.channel).replace(/^https?:\/\/(t\.me\/)?/,'').replace(/^@/,''), h:tidyUrl(data.social.channel),
      i:`<path d="${ICONS.telegram}" fill="currentColor"/>` },
    c.website && { l:siteLabel, v:String(c.website).replace(/^https?:\/\//,''), h:tidyUrl(c.website),
      i:'<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" fill="none" stroke="currentColor" stroke-width="2"/>' }
  ].filter(Boolean);

  $('#channelsWrap').innerHTML = items.map(it => `
    <a class="chan" href="${esc(it.h)}" target="_blank" rel="noopener">
      <span class="chan__i"><svg viewBox="0 0 24 24">${it.i}</svg></span>
      <span class="chan__b"><b>${it.l}</b><span>${esc(it.v)}</span></span>
    </a>`).join('');

  const fp = $('#footerPhone');
  if (fp){
    if (c.phone){ fp.textContent = c.phone; fp.href = 'tel:'+String(c.phone).replace(/[^\d+]/g,''); fp.style.display=''; }
    else fp.style.display = 'none';
  }
}

/* ================================================== THEME + VIDEO COLOUR ==
   Two themes, and they work on opposite principles:

     liquid → dark glass whose accent is SAMPLED FROM THE BACKGROUND VIDEO.
              The lime green is only the fallback for "no video playing".
     sand   → a closed three-ink palette (amber/navy/paper) defined in CSS.
   ========================================================================== */
const LIQUID_FALLBACK = { accent:'#ccff33', accent2:'#9de84a' };

function applyTheme(t){
  if (!THEMES.includes(t)) t = 'liquid';
  data.theme = t;
  document.body.dataset.theme = t;
  $$('.theme').forEach(b => b.classList.toggle('active', b.dataset.themeSet === t));
  // Each theme rebuilds its palette from scratch on entry, so switching back
  // and forth can never leak one theme's inks into the other.
  if (t === 'sand') applySandColors();
  else resolveAccent();
  const meta = $('meta[name="theme-color"]');
  if (meta && t !== 'sand') meta.content = '#08080a';
}

/* ---------------------------------------------------------- colour utils */
const hex = (r,g,b) => '#' + [r,g,b].map(v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');

function rgb2hsl(r,g,b){
  r/=255; g/=255; b/=255;
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b), d = mx-mn;
  let h = 0;
  if (d){
    if (mx===r) h = ((g-b)/d) % 6;
    else if (mx===g) h = (b-r)/d + 2;
    else h = (r-g)/d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  const l = (mx+mn)/2;
  const s = d ? d / (1 - Math.abs(2*l - 1)) : 0;
  return [h, s, l];
}
function hsl2rgb(h,s,l){
  const c = (1 - Math.abs(2*l - 1)) * s;
  const x = c * (1 - Math.abs(((h/60) % 2) - 1));
  const m = l - c/2;
  const [r,g,b] = h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
  return [(r+m)*255, (g+m)*255, (b+m)*255];
}

/* Sample one frame and pick the ink that best represents it.
   Straight averaging turns any real footage into mud grey, so instead we
   histogram the hues weighted by saturation — the eye reads a video by its
   most *colourful* region, not its arithmetic mean. */
function pickAccent(canvas){
  const ctx = canvas.getContext('2d', { willReadFrequently:true });
  let px;
  try { px = ctx.getImageData(0, 0, canvas.width, canvas.height).data; }
  catch { return null; }             // tainted canvas (video served without CORS)

  const bins = new Array(24).fill(0);      // 15° per bin
  const satOf = new Array(24).fill(0);
  let lum = 0, n = 0;

  for (let i = 0; i < px.length; i += 4){
    const [h, s, l] = rgb2hsl(px[i], px[i+1], px[i+2]);
    lum += l; n++;
    if (l < 0.08 || l > 0.94) continue;    // near-black / blown-out: no hue info
    const w = s * s;                        // saturated pixels dominate
    const b = Math.min(23, Math.floor(h / 15));
    bins[b] += w; satOf[b] += s * w;
  }
  if (!n) return null;

  let best = 0;
  for (let i = 1; i < 24; i++) if (bins[i] > bins[best]) best = i;
  const avgLum = lum / n;

  // Nothing colourful at all (grey/night footage) → a light neutral that
  // still reads as an accent on the dark glass. The test is per-pixel, not a
  // raw total: a flat grey frame still piles a little weight into some bin,
  // and an absolute threshold would promote that noise to a confident hue.
  if (bins[best] / n < 0.01) return { accent:'#e8ecf2', accent2:'#b9c2cf', from:'neutral' };

  const hue = best * 15 + 7.5;
  const sat = Math.min(1, Math.max(0.55, satOf[best] / bins[best] * 1.35));

  // Fixed lightness, not the video's: the accent has to stay legible against
  // the dark glass and behind white text. A dark video must not yield a dark
  // accent — that's exactly what makes UI vanish.
  const l1 = avgLum < 0.4 ? 0.62 : 0.56;
  return {
    accent:  hex(...hsl2rgb(hue, sat, l1)),
    accent2: hex(...hsl2rgb((hue + 26) % 360, Math.min(1, sat * 0.9), l1 + 0.12)),
    from: 'video'
  };
}

const accentCache = Object.create(null);   // src → accent (resolved once per video)
const currentVideoEntry = () => {
  const cfg = data.bgVideo || {};
  if (tidyUrl(cfg.src)) return { url: tidyUrl(cfg.src) };       // custom URL, no stored ink
  return (data.videos || []).find(v => v.id === cfg.presetId) || null;
};
const currentVideoSrc = () => {
  const cfg = data.bgVideo || {};
  return tidyUrl(cfg.src) || currentVideoEntry()?.url || '';
};

/* Every CSS variable a video palette may touch. Cleared before each apply so
   switching videos can never leak one video's inks into the next. */
const PALETTE_VARS = [
  '--accent','--accent-dim','--accent-edge','--accent2','--accent-live',
  '--blob1','--blob2','--role-grad','--violet','--pink','--on-accent',
  '--bg','--bg2','--fg','--muted','--dim','--line','--line2','--surface','--surface2',
  '--glass-bg','--glass-line','--glass-shadow','--paper'
];

/* The palette keys an admin can hand-edit per video, with the fallbacks the
   colour input shows while a key is still on "auto". */
const VIDEO_COLOR_KEYS = [
  { k:'accent',   label:"Asosiy rang",        auto: () => accentCache[currentVideoSrc()]?.accent  || currentVideoEntry()?.accent  || LIQUID_FALLBACK.accent },
  { k:'accent2',  label:"Gradient rangi",     auto: () => accentCache[currentVideoSrc()]?.accent2 || currentVideoEntry()?.accent2 || LIQUID_FALLBACK.accent2 },
  { k:'violet',   label:"Qoʻshimcha rang 1",  auto: () => '#8a6bff' },
  { k:'pink',     label:"Qoʻshimcha rang 2",  auto: () => '#ff6bcb' },
  { k:'bg',       label:"Fon rangi",          auto: () => '#08080a' },
  { k:'fg',       label:"Matn rangi",         auto: () => '#f2f2f0' },
  { k:'onAccent', label:"Rang ustidagi matn", auto: () => onAccentFor(accentCache[currentVideoSrc()]?.accent || currentVideoEntry()?.accent || LIQUID_FALLBACK.accent) }
];

const HEX_OK = v => /^#[0-9a-fA-F]{6}$/.test(String(v||''));
const hex2rgb = h => { const n = parseInt(h.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255]; };
const rgbaOf = (h,a) => { const [R,G,B] = hex2rgb(h); return `rgba(${R},${G},${B},${a})`; };

/* Black or white — whichever actually reads on top of this colour. */
function onAccentFor(h){
  const [R,G,B] = hex2rgb(HEX_OK(h) ? h : '#ccff33');
  const lum = (0.2126*R + 0.7152*G + 0.0722*B) / 255;
  return lum > 0.55 ? '#000000' : '#ffffff';
}

/* The hand-picked palette of the video currently on the background — or null
   when the video is off / a bare custom URL is playing / nothing is set. */
function activeCustomColors(){
  if (!data.bgVideo?.enabled) return null;
  const c = currentVideoEntry()?.colors;
  if (!c) return null;
  const out = {};
  for (const { k } of VIDEO_COLOR_KEYS) if (HEX_OK(c[k])) out[k] = c[k];
  return Object.keys(out).length ? out : null;
}

function clearAccent(){
  // Liquid inks live inline on <html> (beating :root), sand inks inline on
  // <body> (beating the [data-theme="sand"] body-level rules) — clear both.
  for (const el of [document.documentElement, document.body])
    PALETTE_VARS.forEach(k => el.style.removeProperty(k));
}

/* --------------------------------------------------- SAND (uch rang) ----
   The whole three-ink theme derives from bg / fg / accent, exactly like the
   [data-theme="sand"] CSS block — same alphas, same pairings — so a custom
   trio looks as coherent as the shipped one. All three empty → the
   stylesheet's own palette rules untouched. */
const SAND_DEFAULTS = { bg:'#FAF7F2', fg:'#0F2D52', accent:'#B86B00' };
const SAND_COLOR_KEYS = [
  { k:'bg',     label:"Orqa fon rangi" },
  { k:'fg',     label:"Matn rangi" },
  { k:'accent', label:"Menyu va tugmalar rangi" }
];

function applySandColors(){
  clearAccent();
  if (data.theme !== 'sand') return;
  const c = data.sandColors || {};
  const anyCustom = SAND_COLOR_KEYS.some(({k}) => HEX_OK(c[k]));
  const meta = $('meta[name="theme-color"]');
  if (!anyCustom){ if (meta) meta.content = SAND_DEFAULTS.bg; return; }

  const bg = HEX_OK(c.bg) ? c.bg : SAND_DEFAULTS.bg;
  const fg = HEX_OK(c.fg) ? c.fg : SAND_DEFAULTS.fg;
  const ac = HEX_OK(c.accent) ? c.accent : SAND_DEFAULTS.accent;
  // The sand palette is declared on [data-theme="sand"] — i.e. on <body> —
  // so an inline override must sit on <body> too; an inherited <html> value
  // loses to any body-level stylesheet rule and would silently do nothing.
  const r = document.body.style;

  r.setProperty('--paper', bg);
  r.setProperty('--bg', bg); r.setProperty('--bg2', bg);
  r.setProperty('--fg', fg);
  r.setProperty('--muted', rgbaOf(fg,.66)); r.setProperty('--dim', rgbaOf(fg,.45));
  r.setProperty('--line', rgbaOf(fg,.14));  r.setProperty('--line2', rgbaOf(fg,.24));
  r.setProperty('--surface', rgbaOf(fg,.04)); r.setProperty('--surface2', rgbaOf(fg,.08));
  r.setProperty('--accent', ac);
  r.setProperty('--accent-dim', rgbaOf(ac,.12)); r.setProperty('--accent-edge', rgbaOf(ac,.3));
  r.setProperty('--accent2', fg);
  r.setProperty('--on-accent', bg);            // uch rang qoidasi: rang ustida — fon rangi
  r.setProperty('--violet', fg); r.setProperty('--pink', ac);
  r.setProperty('--role-grad', `linear-gradient(92deg, ${ac}, ${fg})`);
  r.setProperty('--glass-bg', `linear-gradient(135deg, ${rgbaOf(bg,.94)}, ${rgbaOf(bg,.74)})`);
  r.setProperty('--glass-line', rgbaOf(fg,.14));
  r.setProperty('--glass-shadow', `0 8px 26px ${rgbaOf(fg,.10)}, inset 0 1px 0 ${rgbaOf(bg,.9)}`);
  r.setProperty('--blob1', `radial-gradient(circle, ${rgbaOf(ac,.22)}, transparent 68%)`);
  r.setProperty('--blob2', `radial-gradient(circle, ${rgbaOf(fg,.18)}, transparent 68%)`);
  if (meta) meta.content = bg;
}

function applyAccent(a){
  if (data.theme !== 'liquid') return;
  const cust = activeCustomColors() || {};
  clearAccent();               // wipe BOTH html + body inline inks (sand leftovers too)
  const r = document.documentElement.style;

  const accent  = cust.accent  || a?.accent  || LIQUID_FALLBACK.accent;
  const accent2 = cust.accent2 || a?.accent2 || (cust.accent ? cust.accent : LIQUID_FALLBACK.accent2);

  r.setProperty('--accent', accent);
  r.setProperty('--accent2', accent2);
  r.setProperty('--accent-live', accent);            // theme swatch preview
  r.setProperty('--accent-dim',  rgbaOf(accent, .16));
  r.setProperty('--accent-edge', rgbaOf(accent, .25));
  r.setProperty('--blob2', `radial-gradient(circle, ${rgbaOf(accent, .30)}, transparent 68%)`);
  r.setProperty('--role-grad', `linear-gradient(92deg, ${accent}, ${accent2} 55%, var(--violet))`);
  // Text sitting ON the accent flips black/white by contrast unless hand-set.
  r.setProperty('--on-accent', cust.onAccent || onAccentFor(accent));

  if (cust.violet){
    r.setProperty('--violet', cust.violet);
    r.setProperty('--blob1', `radial-gradient(circle, ${rgbaOf(cust.violet, .55)}, transparent 68%)`);
  }
  if (cust.pink) r.setProperty('--pink', cust.pink);
  if (cust.bg){
    r.setProperty('--bg', cust.bg);
    // bg2 = the same ink nudged toward the text colour, like the stylesheet's pair
    const [R,G,B] = hex2rgb(cust.bg);
    const lift = v => Math.max(0, Math.min(255, v + (v > 127 ? -10 : 10)));
    r.setProperty('--bg2', hex(lift(R), lift(G), lift(B)));
    const meta = $('meta[name="theme-color"]'); if (meta) meta.content = cust.bg;
  }
  if (cust.fg){
    // One text ink drives the whole neutral ramp, exactly like the sand theme.
    r.setProperty('--fg', cust.fg);
    r.setProperty('--muted', rgbaOf(cust.fg, .64));
    r.setProperty('--dim',   rgbaOf(cust.fg, .44));
    r.setProperty('--line',  rgbaOf(cust.fg, .10));
    r.setProperty('--line2', rgbaOf(cust.fg, .16));
    r.setProperty('--surface',  rgbaOf(cust.fg, .04));
    r.setProperty('--surface2', rgbaOf(cust.fg, .07));
  }
}

/* Resolve the accent for whatever video is on. Once per src, cached — the
   user asked for "once", and re-reading pixels every frame would cost a
   GPU→CPU readback 60×/second for nothing.

   The visible <video> deliberately has NO crossOrigin: setting it would stop
   the archive.org presets from playing at all. So pixels are read from a
   throwaway probe element instead, and a probe that fails costs us nothing
   but the fallback ink. */
function resolveAccent(){
  const entry = currentVideoEntry();
  const src = currentVideoSrc();
  if (!src) return applyAccent(null);

  if (accentCache[src]) return applyAccent(accentCache[src]);

  // 1) Ink shipped with the entry (the built-in presets).
  if (entry?.accent){
    accentCache[src] = { accent: entry.accent, accent2: entry.accent2 || entry.accent, from:'preset' };
    return applyAccent(accentCache[src]);
  }

  // 2) Sample it live. Works for anything CORS-enabled — notably every video
  //    the admin uploads to Supabase Storage.
  applyAccent(null);                                  // show the fallback meanwhile
  probeAccent(src);
}

function probeAccent(src){
  const p = document.createElement('video');
  p.crossOrigin = 'anonymous';                        // must precede .src
  p.muted = true; p.playsInline = true; p.preload = 'auto';
  const done = () => { try { p.removeAttribute('src'); p.load(); } catch {} };

  p.addEventListener('loadeddata', () => {
    try {
      const c = document.createElement('canvas');
      c.width = 48; c.height = 27;
      c.getContext('2d', { willReadFrequently:true }).drawImage(p, 0, 0, c.width, c.height);
      const a = pickAccent(c);
      if (a){ accentCache[src] = a; if (currentVideoSrc() === src) applyAccent(a); }
    } catch(e){ /* tainted after all — fallback ink stays */ }
    done();
  }, { once:true });

  // No CORS on that host → the probe dies here. The visible video is a
  // separate element and is unaffected.
  p.addEventListener('error', done, { once:true });
  setTimeout(done, 15000);                            // never leave it downloading
  p.src = src;
  p.load();
}

/* The <video> has preload="none" and no src until it's switched on, so a
   visitor who never enables it downloads exactly 0 bytes of video. */
function applyBgVideo(){
  const v = $('#bgVideo'), bg = $('.bg');
  if (!v || !bg) return;
  const cfg = data.bgVideo || {};
  bg.style.setProperty('--bgv-op',   (Number(cfg.opacity ?? 70))/100);
  bg.style.setProperty('--bgv-tint', (Number(cfg.tint ?? 55))/100);

  const src = currentVideoSrc();

  if (!cfg.enabled || !src){
    v.classList.remove('on'); bg.classList.remove('video-on');
    v.pause(); v.removeAttribute('src'); v.load();
    applyAccent(null);                               // back to the lime fallback
    return;
  }
  bg.classList.add('video-on');
  resolveAccent();
  if (v.getAttribute('src') !== src){
    // Deliberately NO crossOrigin here — archive.org's CDN sends no CORS
    // header, and requesting CORS would make these videos fail to load at
    // all. Colour comes from resolveAccent()/probeAccent() instead.
    v.src = src;
    // play() must wait for loadeddata — calling it right after load() aborts
    // the promise and the video silently never starts.
    v.addEventListener('loadeddata', () => {
      v.classList.add('on');
      v.play().catch(()=>{});
    }, { once:true });
    v.addEventListener('error', () => {
      v.classList.remove('on'); bg.classList.remove('video-on');
      toast('Videoni yuklab bo\'lmadi');
    }, { once:true });
    v.load();
  } else {
    v.classList.add('on');
    v.play().catch(()=>{});
  }
}

/* ------------------------------------------------------------- GALLERY */
const galleryList = () => (data.gallery || []).filter(g => g && g.src);

function renderGallery(){
  const w = $('#galleryWrap'), sec = $('#gallery');
  if (!w || !sec) return;
  const list = galleryList();
  const navLink = $('.nav__links a[data-section="gallery"]')?.parentElement;
  const mobLink = $('#mobileMenu a[href="#gallery"]');
  // An empty gallery hides the section AND its nav links, exactly like
  // favorites does — the nav must never point at an empty anchor.
  sec.hidden = !list.length;
  if (navLink) navLink.hidden = !list.length;
  if (mobLink) mobLink.hidden = !list.length;
  if (!list.length){ w.innerHTML = ''; return; }

  w.innerHTML = list.map((g, i) => {
    const cap = L(g.caption);
    return `
    <figure class="gphoto" data-rv data-lb="${i}">
      <img src="${esc(g.thumb || g.src)}" alt="${esc(cap || 'Foto ' + (i+1))}" loading="lazy" decoding="async">
      ${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}
    </figure>`;
  }).join('');
}

function initLightbox(){
  const box = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCap');
  if (!box) return;
  let i = 0;

  const show = n => {
    const list = galleryList();
    if (!list.length) return;
    i = (n + list.length) % list.length;             // wrap both ways
    img.src = list[i].src;
    img.alt = L(list[i].caption) || `Foto ${i+1}`;
    cap.textContent = L(list[i].caption) || '';
  };
  const open = n => {
    show(n);
    box.classList.add('open'); box.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    box.classList.remove('open'); box.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    img.removeAttribute('src');                      // stop holding a full-size decode
  };

  $('#galleryWrap')?.addEventListener('click', e => {
    const f = e.target.closest('[data-lb]'); if (f) open(+f.dataset.lb);
  });
  $('#lbClose').onclick = close;
  $('#lbPrev').onclick = e => { e.stopPropagation(); show(i-1); };
  $('#lbNext').onclick = e => { e.stopPropagation(); show(i+1); };
  box.addEventListener('click', e => { if (e.target === box || e.target === img) close(); });
  addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft')  show(i-1);
    if (e.key === 'ArrowRight') show(i+1);
  });
}

function renderAll(){
  renderBindings(); renderStats(); renderSkills(); renderTimeline();
  renderPortfolio(); renderEducation(); renderFavorites(); renderPlaylist(); renderSocial(); renderContact();
  observeReveal();
}

/* --------------------------------------------------------- SCROLL REVEAL */
let io = null;
function reveal(el){
  el.classList.add('in');
  $$('.skill__fill', el).forEach(f => { f.style.width = f.dataset.w + '%'; });
}
function showEverything(){ $$('[data-rv]').forEach(reveal); }

function observeReveal(){
  // If the browser can't observe, or the user prefers less motion, just show
  // everything. Content must never be stuck invisible.
  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches){
    showEverything(); return;
  }

  io ||= new IntersectionObserver(entries => {
    for (const e of entries){
      if (!e.isIntersecting) continue;
      reveal(e.target);
      io.unobserve(e.target);            // one-shot: no ongoing cost
    }
  }, {
    threshold: 0,                        // fire on ANY sliver of overlap
    rootMargin: '300px 0px 300px 0px'    // …and 300px *before* it scrolls in,
  });                                    //   so it's already opaque on arrival

  $$('.section, [data-rv]').forEach(el => {
    if (!el.hasAttribute('data-rv')) el.setAttribute('data-rv','');
    if (!el.classList.contains('in')) io.observe(el);
  });

  // Safety net: if anything is still hidden shortly after load (observer
  // starved, tab restored from bfcache, fast fling), force it visible.
  clearTimeout(observeReveal._t);
  observeReveal._t = setTimeout(() => {
    $$('[data-rv]:not(.in)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight + 300 && r.bottom > -300) reveal(el);
    });
  }, 1200);
}
// Restoring from bfcache can skip observer callbacks entirely.
addEventListener('pageshow', e => { if (e.persisted) showEverything(); });

/* ------------------------------------------------------------ ACTIVE NAV */
function initNav(){
  const links = $$('.nav__links a[data-section]');
  const secs  = links.map(a => $('#'+a.dataset.section)).filter(Boolean);
  let raf = null;
  const update = () => {
    raf = null;
    const y = innerHeight * 0.34;
    let cur = secs[0]?.id;
    for (const s of secs){
      // A hidden section reports top:0, which would always win. Skip those.
      if (s.hidden || !s.offsetParent) continue;
      if (s.getBoundingClientRect().top <= y) cur = s.id;
    }
    links.forEach(a => a.classList.toggle('active', a.dataset.section === cur));
  };
  // Tag the body while scrolling so CSS can drop blur mid-scroll.
  let stop = null;
  addEventListener('scroll', () => {
    raf ||= requestAnimationFrame(update);
    if (!document.body.classList.contains('scrolling')) document.body.classList.add('scrolling');
    clearTimeout(stop);
    stop = setTimeout(() => document.body.classList.remove('scrolling'), 140);
  }, { passive:true });
  update();

  // Mobile menu
  const m = $('#mobileMenu');
  const close = () => { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  $('#navBurger').onclick = () => { m.classList.add('open'); m.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
  $('#mobileMenuClose').onclick = close;
  $('#mobileMenuBg').onclick = close;
  $$('a', m).forEach(a => a.addEventListener('click', close));
  addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) close(); });
}

/* ---------------------------------------------------------------- MUSIC */
function initMusic(){
  const audio = $('#bgAudio'), btn = $('#musicBtn');
  let playing = false;

  const apply = () => {
    const src = tidyUrl(data.music.src);
    if (src && audio.src !== src) audio.src = src;
    if (!src) audio.removeAttribute('src');
    audio.volume = (Number(data.music.volume) || 40) / 100;
  };
  apply();

  audio.addEventListener('play',  () => { playing = true;  btn.classList.add('on'); });
  audio.addEventListener('pause', () => { playing = false; btn.classList.remove('on'); });
  audio.addEventListener('error', () => {
    if (!audio.getAttribute('src')) return;
    btn.classList.remove('on'); toast('Musiqani o\'qib bo\'lmadi — boshqa URL tanlang');
  });

  btn.onclick = async () => {
    if (!tidyUrl(data.music.src)) { toast('Admin paneldan musiqa tanlang'); return; }
    if (playing) { audio.pause(); return; }
    try { await audio.play(); } catch(e){ toast('Musiqa chalinmadi'); }
  };

  if (data.music.autoplay && tidyUrl(data.music.src)){
    const once = () => { audio.play().catch(()=>{}); ['click','keydown','touchstart'].forEach(t=>removeEventListener(t,once)); };
    audio.play().catch(() => ['click','keydown','touchstart'].forEach(t=>addEventListener(t,once,{once:true,passive:true})));
  }
  window.__applyMusic = apply;
}

/* -------------------------------------------------------------- CV / PDF */
function downloadCV(){
  const c = data.contacts, w = open('', '_blank');
  if (!w) { toast('Popup bloklandi — ruxsat bering'); return; }
  const rows = (t, body) => `<h2>${t}</h2>${body}`;
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(data.profile.name)} — CV</title><style>
    @page{size:A4;margin:14mm}*{margin:0;padding:0;box-sizing:border-box}
    body{font:13px/1.55 -apple-system,Inter,sans-serif;color:#111;padding:16px}
    .h{border-bottom:3px solid #111;padding-bottom:14px;margin-bottom:18px}
    .n{font-size:30px;font-weight:800;letter-spacing:-.02em}.p{font-size:15px;color:#555;margin-top:3px}
    .c{font-size:11px;color:#666;margin-top:9px;display:flex;gap:14px;flex-wrap:wrap}
    h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#888;
       margin:18px 0 9px;padding-bottom:5px;border-bottom:1px solid #ddd}
    .g{display:grid;grid-template-columns:1fr 1fr;gap:4px 20px;font-size:12px}
    .sk{display:flex;justify-content:space-between}.sk span{color:#888}
    .e{margin-bottom:12px}.ep{font-size:10.5px;color:#888;text-transform:uppercase;letter-spacing:.08em}
    .et{font-size:13.5px;font-weight:700}.ec{font-size:11.5px;color:#666;font-style:italic}
    .ed{font-size:11.5px;color:#333}
    .pi{margin-bottom:8px;padding:8px 10px;border-left:3px solid #111;background:#f7f7f4}
    .pt{font-weight:700;font-size:12.5px}.pd{font-size:11px;color:#555}
    .st{display:flex;gap:18px;margin-top:10px;font-size:11px}.st b{font-size:17px;display:block}
  </style></head><body>
    <div class="h"><div class="n">${esc(data.profile.name)}</div><div class="p">${esc(L(data.profile.profession))}</div>
    <div class="c">${[c.email&&'✉ '+c.email, c.phone&&'☎ '+c.phone, L(data.profile.location)&&'📍 '+L(data.profile.location),
        data.social.telegram&&'✈ '+String(data.social.telegram).replace(/^https?:\/\//,''),
        data.social.github&&'⌥ '+String(data.social.github).replace(/^https?:\/\//,'')]
        .filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>
    ${rows(T('sec_about'), `<p>${esc(L(data.profile.bio))}</p><div class="st">
      <div><b>${esc(data.stats.years)}</b>${esc(T('stat_years'))}</div><div><b>${esc(data.stats.projects)}</b>${esc(T('stat_projects'))}</div>
      <div><b>${esc(data.stats.clients)}</b>${esc(T('stat_clients'))}</div><div><b>${esc(data.stats.uptime)}</b>${esc(T('stat_uptime'))}</div></div>`)}
    ${rows(T('sec_skills'), `<div class="g">${data.skills.map(s=>`<div class="sk"><b>${esc(s.name)}</b><span>${s.level}%</span></div>`).join('')}</div>`)}
    ${rows(T('sec_exp'), data.experience.map(e=>`<div class="e"><div class="ep">${esc(L(e.period))}</div>
      <div class="et">${esc(L(e.title))}</div><div class="ec">${esc(e.company)}</div><div class="ed">${esc(L(e.description))}</div></div>`).join(''))}
    ${rows(T('sec_portfolio'), data.portfolio.map(p=>`<div class="pi"><div class="pt">${esc(L(p.title))}</div>
      <div class="pd">${esc(L(p.description))}</div><div class="pd">${(p.tags||[]).join(' · ')}</div></div>`).join(''))}
    <script>onload=()=>setTimeout(print,250)<\/script></body></html>`);
  w.document.close();
}

/* -------------------------------------------------------- CONTACT FORM */
function initForm(){
  $('#contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `Ism: ${f.get('name')}\nEmail: ${f.get('email')}\n\n${f.get('message')}`;
    const url = `mailto:${data.contacts.email}?subject=${encodeURIComponent(f.get('subject')||'Portfolio kontakt')}&body=${encodeURIComponent(body)}`;
    $('#formStatus').textContent = 'Email mijozingiz ochilmoqda…';
    location.href = url;
    setTimeout(() => { e.target.reset(); $('#formStatus').textContent = 'Tayyor! Email orqali yuboring.'; }, 700);
  });
}

/* Trilingual input group for a { uz, en, ru } content field. Shows all three
   at once — the owner asked that new entries be filled in every language, so
   they must all be visible. Empty languages get a red "missing" cue. */
function mlInput(path, cur, opt){
  opt = opt || {};
  cur = (cur && typeof cur === 'object') ? cur : {};
  const one = lg => {
    const val = cur[lg] || '';
    const miss = val.trim() ? '' : ' mlf__in--miss';
    return opt.textarea
      ? `<textarea rows="2" class="mlf__in${miss}" data-ml="${path}" data-lang="${lg}" placeholder="${esc(opt.ph||'')}">${esc(val)}</textarea>`
      : `<input type="text" class="mlf__in${miss}" data-ml="${path}" data-lang="${lg}" value="${esc(val)}" placeholder="${esc(opt.ph||'')}">`;
  };
  return `<div class="field full mlf">
    <label>${esc(opt.label||'')} <span class="mlf__req">3 tilda</span></label>
    <div class="mlf__row"><span class="mlf__lg">UZ</span>${one('uz')}</div>
    <div class="mlf__row"><span class="mlf__lg">EN</span>${one('en')}</div>
    <div class="mlf__row"><span class="mlf__lg">RU</span>${one('ru')}</div>
  </div>`;
}

/* ------------------------------------------------- AVATAR CROP (Telegram) ---
   A circular crop editor exactly like Telegram's profile-photo picker: the
   image sits under a round mask; drag to reposition, slider (or wheel/pinch)
   to zoom. Export renders the visible square to a 900×900 JPEG. */
const cropState = { img:null, natW:0, natH:0, base:1, zoom:1, ox:0, oy:0, size:300, cb:null, drag:null };

function cropClamp(){
  const c = cropState, k = c.base * c.zoom;
  const w = c.natW * k, h = c.natH * k;
  c.ox = Math.min(0, Math.max(c.size - w, c.ox));
  c.oy = Math.min(0, Math.max(c.size - h, c.oy));
}
function cropPaint(){
  const c = cropState, im = $('#cropImg'); if (!im || !c.img) return;
  const k = c.base * c.zoom;
  im.style.width  = (c.natW * k) + 'px';
  im.style.height = (c.natH * k) + 'px';
  im.style.transform = `translate(${c.ox}px, ${c.oy}px)`;
}
function cropSetZoom(z, cx, cy){
  const c = cropState;
  const old = c.base * c.zoom;
  c.zoom = Math.min(4, Math.max(1, z));
  const now = c.base * c.zoom;
  // zoom toward the given stage point (default: centre) — Telegram feel
  const px = cx ?? c.size/2, py = cy ?? c.size/2;
  c.ox = px - (px - c.ox) * (now / old);
  c.oy = py - (py - c.oy) * (now / old);
  cropClamp(); cropPaint();
  const r = $('#cropZoom'); if (r && Math.abs(+r.value - c.zoom*100) > 1) r.value = Math.round(c.zoom*100);
}
function openCrop(src, cb){
  const m = $('#cropModal'); if (!m) return;
  const c = cropState;
  c.cb = cb; c.zoom = 1; c.drag = null;
  c.size = $('#cropStage').clientWidth || 300;
  const img = new Image();
  img.crossOrigin = 'anonymous';                 // supabase/local — exportable
  img.onload = () => {
    c.img = img; c.natW = img.naturalWidth; c.natH = img.naturalHeight;
    c.base = c.size / Math.min(c.natW, c.natH); // cover the stage
    c.ox = (c.size - c.natW * c.base) / 2;      // centred
    c.oy = (c.size - c.natH * c.base) / 2;
    $('#cropImg').src = src;
    $('#cropZoom').value = 100;
    cropPaint();
    m.classList.add('open'); m.setAttribute('aria-hidden','false');
  };
  img.onerror = () => toast('Rasmni ochib bo\'lmadi');
  img.src = src;
}
function closeCrop(){
  const m = $('#cropModal'); if (!m) return;
  m.classList.remove('open'); m.setAttribute('aria-hidden','true');
  const im = $('#cropImg'); if (im) im.removeAttribute('src');
  cropState.img = null; cropState.cb = null;
}
function cropExport(){
  const c = cropState; if (!c.img) return;
  const OUT = 900, k2 = OUT / c.size, k = c.base * c.zoom;
  const cv = document.createElement('canvas'); cv.width = cv.height = OUT;
  const x = cv.getContext('2d');
  x.fillStyle = '#111'; x.fillRect(0,0,OUT,OUT);
  try {
    x.drawImage(c.img, c.ox*k2, c.oy*k2, c.natW*k*k2, c.natH*k*k2);
    cv.toBlob(b => {
      if (!b) { toast('Saqlab bo\'lmadi'); return; }
      const cb = c.cb; closeCrop(); cb?.(b);
    }, 'image/jpeg', 0.88);
  } catch(e){
    // CORS-tainted source (an external URL) — can't read pixels back
    toast('Bu rasmni tahrirlab bo\'lmaydi — faylni qaytadan yuklang');
  }
}
function initCrop(){
  const stage = $('#cropStage'); if (!stage) return;
  stage.addEventListener('pointerdown', e => {
    e.preventDefault();
    cropState.drag = { x: e.clientX, y: e.clientY, ox: cropState.ox, oy: cropState.oy };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    const d = cropState.drag; if (!d) return;
    cropState.ox = d.ox + (e.clientX - d.x);
    cropState.oy = d.oy + (e.clientY - d.y);
    cropClamp(); cropPaint();
  });
  const end = () => { cropState.drag = null; };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    cropSetZoom(cropState.zoom * (e.deltaY < 0 ? 1.08 : 0.93), e.clientX - r.x, e.clientY - r.y);
  }, { passive:false });
  $('#cropZoom').addEventListener('input', e => cropSetZoom(Number(e.target.value)/100));
  $('#cropSave').onclick = cropExport;
  $('#cropCancel').onclick = closeCrop;
  $('#cropModal').addEventListener('click', e => { if (e.target.id === 'cropModal') closeCrop(); });
}

/* ============================================================== ADMIN ==== */
const admin = {
  open(){
    $('#adminPanel').classList.add('open');
    $('#adminPanel').setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    this.fill();
    // Cloud configured but signed out → land straight on the sign-in with
    // the email prefilled, so publishing is one password away. Signed in
    // (the usual case — the session persists) → normal landing.
    const st = window.Cloud?.status?.();
    if (st?.enabled && !st.signedIn){
      $('.admin__tab[data-tab="cloud"]')?.click();
      const e = $('#sbEmail');
      if (e){
        try { if (!e.value) e.value = localStorage.getItem('sb-last-email') || ''; } catch {}
        setTimeout(() => e.focus({ preventScroll:true }), 80);
      }
      toast('Bulutga kiring — o\'zgarishlar hammaga ko\'rinishi uchun', 3200);
    } else {
      toast('Admin panel ochildi');
    }
  },
  close(){
    $('#adminPanel').classList.remove('open');
    $('#adminPanel').setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    save();
  },
  /* Populate every [data-model] input from `data` */
  fill(){
    $$('[data-model]').forEach(el => {
      const v = get(el.dataset.model);
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = (v && typeof v === 'object') ? '' : (v ?? '');
    });
    // Trilingual fields: each input owns its language via data-lang.
    $$('[data-ml]').forEach(el => {
      const o = get(el.dataset.ml);
      el.value = (o && typeof o === 'object') ? (o[el.dataset.lang] || '') : '';
    });
    const asz = $('#avatarSizeR');
    if (asz){ asz.value = Number(data.profile.photoSize) || 260; $('#avatarSizeL').textContent = asz.value; }
    const vol = $('#musicVol');
    if (vol){ vol.value = data.music.volume ?? 40; $('#volLabel').textContent = vol.value; }
    const op = $('#bgOp'), tn = $('#bgTintR');
    if (op){ op.value = data.bgVideo.opacity ?? 70; $('#bgOpLabel').textContent = op.value; }
    if (tn){ tn.value = data.bgVideo.tint ?? 55;    $('#bgTintLabel').textContent = tn.value; }
    this.renderSkills(); this.renderExperience(); this.renderPortfolio();
    this.renderEducation(); this.renderFavorites(); this.renderSocial(); this.renderMusic(); this.renderVideos();
    this.renderGallery(); this.renderSandTheme(); this.renderSync();
  },

  /* Videos + tracks share one row shape: thumb · name · url · use/delete.
     Each video row also carries a fold-out palette editor: every site colour
     used while THAT video plays, hand-tunable, empty = auto. */
  renderVideos(){
    const w = $('#adminVideos'); if (!w) return;
    const active = data.bgVideo.presetId;
    const openPals = new Set([...w.querySelectorAll('details[open]')].map(d => d.dataset.vpal));
    w.innerHTML = (data.videos||[]).map((v,i) => {
      const cols = v.colors || {};
      const isActive = active === v.id;
      const setCount = VIDEO_COLOR_KEYS.filter(({k}) => HEX_OK(cols[k])).length;
      const pal = VIDEO_COLOR_KEYS.map(({k, label, auto}) => {
        const isSet = HEX_OK(cols[k]);
        // For the active video "auto" shows the truly resolved ink; for others
        // fall back to the same defaults the resolver would use.
        const val = isSet ? cols[k]
          : (isActive ? auto()
             : (k==='accent' ? (v.accent || LIQUID_FALLBACK.accent)
              : k==='accent2' ? (v.accent2 || LIQUID_FALLBACK.accent2)
              : auto()));
        return `
          <label class="vpal__cell ${isSet?'vpal__cell--set':''}">
            <input type="color" data-vcolor="${i}.${k}" value="${esc(val)}">
            <span class="vpal__l">${label}</span>
            <button type="button" class="vpal__auto" data-vclear="${i}.${k}" title="Avtomatik rangga qaytarish"
              ${isSet?'':'disabled'}>${isSet?'avto ↺':'avto'}</button>
          </label>`;
      }).join('');
      return `
      <div class="mediarow ${isActive?'active':''}">
        <span class="mediarow__thumb" style="${v.thumb?`background-image:url('${esc(v.thumb)}')`:''}">${v.thumb?'':'🎬'}</span>
        <div class="mediarow__f">
          <input type="text" data-arr="videos.${i}.name" value="${esc(v.name)}" placeholder="Video nomi">
          <input type="text" data-arr="videos.${i}.url" value="${esc(v.url)}" placeholder="https://...mp4">
          <details class="vpal" data-vpal="${esc(v.id)}" ${openPals.has(v.id)?'open':''}>
            <summary>🎨 Sayt ranglari ${setCount?`<b>(${setCount} ta qoʻlda)</b>`:'(avto)'}</summary>
            <p class="hint vpal__hint">Shu video fonda turganda sayt qaysi ranglarda koʻrinishini belgilaydi.
              ${isActive?'Oʻzgarishlar darhol saytda koʻrinadi.':'Koʻrish uchun avval videoni «Qoʻyish» qiling.'}
              «avto ↺» — rang yana videodan avtomatik olinadi.</p>
            <div class="vpal__grid">${pal}</div>
          </details>
        </div>
        <div class="mediarow__acts">
          <button class="mediarow__btn ${isActive?'mediarow__btn--use':''}" data-usevideo="${esc(v.id)}"
            ${isActive?'disabled':''}>${isActive?'✓ Fonda':'Qo\'yish'}</button>
          <button class="mediarow__btn mediarow__btn--red" data-del="videos" data-i="${i}">O'chirish</button>
        </div>
      </div>`;
    }).join('') || `<p class="hint">Hali video yo'q — pastdan qo'shing.</p>`;
  },

  renderGallery(){
    const w = $('#adminGallery'); if (!w) return;
    const cap = g => (g.caption && typeof g.caption === 'object') ? g.caption : {};
    w.innerHTML = (data.gallery||[]).map((g,i) => `
      <div class="gcell" style="background-image:url('${esc(g.thumb || g.src)}')">
        <button class="gcell__x" data-del="gallery" data-i="${i}" title="O'chirish">×</button>
        <div class="gcell__caps">
          <input class="gcell__cap" type="text" data-ml="gallery.${i}.caption" data-lang="uz" value="${esc(cap(g).uz||'')}" placeholder="izoh UZ">
          <input class="gcell__cap" type="text" data-ml="gallery.${i}.caption" data-lang="en" value="${esc(cap(g).en||'')}" placeholder="caption EN">
          <input class="gcell__cap" type="text" data-ml="gallery.${i}.caption" data-lang="ru" value="${esc(cap(g).ru||'')}" placeholder="подпись RU">
        </div>
      </div>`).join('') || `<p class="hint">Hali rasm yo'q — tepadan qo'shing.</p>`;
  },

  renderSandTheme(){
    const w = $('#sandPal'); if (!w) return;
    const c = data.sandColors || {};
    w.innerHTML = SAND_COLOR_KEYS.map(({k, label}) => {
      const isSet = HEX_OK(c[k]);
      return `
      <label class="vpal__cell ${isSet?'vpal__cell--set':''}">
        <input type="color" data-scolor="${k}" value="${esc(isSet ? c[k] : SAND_DEFAULTS[k])}">
        <span class="vpal__l">${label}</span>
        <button type="button" class="vpal__auto" data-sclear="${k}" title="Standart rangga qaytarish"
          ${isSet?'':'disabled'}>${isSet?'standart ↺':'standart'}</button>
      </label>`;
    }).join('');
    const b = $('#sandPreview');
    if (b) b.textContent = data.theme === 'sand' ? '✓ Tema yoniq — o\'zgarishlar jonli' : 'Temani yoqib ko\'rish';
  },

  /* One status strip, mirrored into every pane that can touch the cloud. */
  renderSync(){
    const st = window.Cloud?.status?.() || { enabled:false };
    const cls = !st.enabled ? '' : st.signedIn ? ' syncbar--live' : ' syncbar--err';
    const txt = !st.enabled
      ? `Bulut ulanmagan — o'zgarishlar faqat shu brauzerda saqlanadi. <b>config.js</b> ni to'ldiring.`
      : st.signedIn
        ? `Bulutga ulangan: <b>${esc(st.email)}</b> — saqlagach hamma ko'radi.`
        : `Bulut sozlangan, lekin kirmagansiz. <b>Bulut ☁</b> bo'limidan kiring.`;
    const html = `<div class="syncbar${cls}"><i class="syncbar__dot"></i><span class="syncbar__t">${txt}</span></div>`;
    ['#syncGallery','#syncMusic','#syncVideos','#syncCloud'].forEach(id => {
      const el = $(id); if (el) el.innerHTML = html;
    });
    const au = $('#cloudAuth'); if (au) au.style.display = st.enabled ? '' : 'none';
  },

  renderSkills(){
    $('#adminSkills').innerHTML = data.skills.map((s,i) => `
      <div class="item">
        <div class="item__h"><b>Skill ${i+1}</b><button class="item__x" data-del="skills" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          <div class="field"><label>Nom</label><input type="text" data-arr="skills.${i}.name" value="${esc(s.name)}"></div>
          <div class="field"><label>Kategoriya</label><input type="text" data-arr="skills.${i}.category" value="${esc(s.category)}"></div>
          <div class="field full"><label>Daraja: <b class="lvl">${s.level}</b>%</label>
            <input type="range" min="0" max="100" data-arr="skills.${i}.level" value="${s.level}"></div>
        </div>
      </div>`).join('');
  },
  renderExperience(){
    $('#adminExperience').innerHTML = data.experience.map((e,i) => `
      <div class="item">
        <div class="item__h"><b>Tajriba ${i+1}</b><button class="item__x" data-del="experience" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          <div class="field full"><label>Kompaniya</label><input type="text" data-arr="experience.${i}.company" value="${esc(e.company)}"></div>
          ${mlInput(`experience.${i}.period`, e.period, {label:'Davr'})}
          ${mlInput(`experience.${i}.title`, e.title, {label:'Lavozim'})}
          ${mlInput(`experience.${i}.description`, e.description, {label:'Tavsif', textarea:true})}
        </div>
      </div>`).join('');
  },
  renderEducation(){
    const w = $('#adminEducation'); if (!w) return;
    w.innerHTML = (data.education||[]).map((e,i) => `
      <div class="item">
        <div class="item__h"><b>Taʼlim ${i+1}</b><button class="item__x" data-del="education" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          ${mlInput(`education.${i}.name`, e.name, {label:'Nomi (maktab/litsey/universitet)'})}
          ${mlInput(`education.${i}.period`, e.period, {label:"Yillari (masalan: 2013 — 2022)"})}
          ${mlInput(`education.${i}.description`, e.description, {label:"Batafsil ma'lumot", textarea:true})}
          <div class="field full">
            <label>Hujjatlar va rasmlar (diplom, attestat, sertifikat...)</label>
            <div class="edudocs">
              ${(e.docs||[]).map((d,j) => `
                <span class="edudoc" style="background-image:url('${esc(d.thumb || d.src)}')">
                  <button class="gcell__x" data-deldoc="${i}.${j}" title="O'chirish">×</button>
                </span>`).join('')}
            </div>
            <label class="btn btn--ghost" style="cursor:pointer;margin-top:8px;display:inline-flex">📄 Hujjat/rasm qo'shish
              <input type="file" accept="image/*" data-edudoc="${i}" multiple hidden>
            </label>
          </div>
        </div>
      </div>`).join('');
  },
  renderPortfolio(){
    $('#adminPortfolio').innerHTML = data.portfolio.map((p,i) => `
      <div class="item">
        <div class="item__h"><b>Loyiha ${i+1}</b><button class="item__x" data-del="portfolio" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          <div class="field"><label>Kategoriya</label>
            <select data-arr="portfolio.${i}.cat">
              ${PORTFOLIO_CATS.map(c=>`<option value="${c}" ${(p.cat||'other')===c?'selected':''}>${esc(T('cat_'+c))}</option>`).join('')}
            </select></div>
          <div class="field"><label>Link</label><input type="text" data-arr="portfolio.${i}.link" value="${esc(p.link)}" placeholder="https://..."></div>
          ${mlInput(`portfolio.${i}.title`, p.title, {label:'Nom'})}
          ${mlInput(`portfolio.${i}.description`, p.description, {label:'Tavsif', textarea:true})}
          <div class="field"><label>Tags (vergul bilan)</label><input type="text" data-tags="${i}" value="${esc((p.tags||[]).join(', '))}"></div>
          <div class="field full"><label>Rasm URL</label><input type="text" data-arr="portfolio.${i}.image" value="${esc(p.image)}" placeholder="https://... yoki yuklang">
            <input type="file" accept="image/*" data-img="${i}"></div>
        </div>
      </div>`).join('');
  },
  renderFavorites(){
    $('#adminFavorites').innerHTML = (data.favorites||[]).map((f,i) => `
      <div class="item">
        <div class="item__h"><b>Link ${i+1}</b><button class="item__x" data-del="favorites" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          <div class="field"><label>Icon (emoji)</label><input type="text" data-arr="favorites.${i}.icon" value="${esc(f.icon)}" placeholder="🎧" maxlength="4"></div>
          <div class="field full"><label>URL</label><input type="text" data-arr="favorites.${i}.url" value="${esc(f.url)}" placeholder="https://youtube.com/playlist?list=..."></div>
          ${mlInput(`favorites.${i}.title`, f.title, {label:'Nom'})}
        </div>
      </div>`).join('');
  },
  renderSocial(){
    $('#adminSocial').innerHTML = Object.keys(SOCIAL_META).map(k => `
      <div class="srow">
        <span class="srow__i"><svg viewBox="0 0 24 24"><path d="${ICONS[k]}"/></svg></span>
        <div class="srow__f">
          <label>${SOCIAL_META[k].label}</label>
          <input type="text" data-model="social.${k}" value="${esc(data.social?.[k] || '')}" placeholder="${SOCIAL_META[k].ph}">
        </div>
      </div>`).join('');
  },
  renderMusic(){
    const w = $('#adminTracks'); if (!w) return;
    const cur = tidyUrl(data.music.src);
    w.innerHTML = (data.tracks||[]).map((t,i) => {
      const on = cur && tidyUrl(t.url) === cur;
      return `
      <div class="mediarow ${on?'active':''}">
        <span class="mediarow__thumb">${esc(t.icon || '🎵')}</span>
        <div class="mediarow__f">
          <input type="text" data-arr="tracks.${i}.name" value="${esc(t.name)}" placeholder="Qo'shiq nomi">
          <input type="text" data-arr="tracks.${i}.url" value="${esc(t.url)}" placeholder="Audio fayl: https://...mp3 (saytda chalinadi)">
          <input type="text" data-arr="tracks.${i}.link" value="${esc(t.link||'')}" placeholder="Havola: YouTube / Spotify / Yandex Music (ixtiyoriy)">
        </div>
        <div class="mediarow__acts">
          <button class="mediarow__btn ${on?'mediarow__btn--use':''}" data-usetrack="${i}" ${on?'disabled':''}>${on?'✓ Chalinmoqda':'Qo\'yish'}</button>
          <button class="mediarow__btn mediarow__btn--red" data-del="tracks" data-i="${i}">O'chirish</button>
        </div>
      </div>`;
    }).join('') || `<p class="hint">Hali musiqa yo'q — pastdan qo'shing.</p>`;
  }
};

function initAdmin(){
  $('#adminClose').onclick = () => admin.close();
  $('#adminBg').onclick    = () => admin.close();
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#adminPanel').classList.contains('open')) admin.close();
  });

  // Tabs
  $('#adminNav').addEventListener('click', e => {
    const t = e.target.closest('.admin__tab'); if (!t) return;
    $$('.admin__tab').forEach(x => x.classList.toggle('active', x === t));
    $$('.pane').forEach(p => p.classList.toggle('active', p.dataset.pane === t.dataset.tab));
  });

  const main = $('.admin__main');

  /* One delegated input handler drives every field — simple + reliable. */
  main.addEventListener('input', e => {
    const el = e.target;

    /* Sand-theme ink. Live when the sand theme is on. */
    if (el.dataset.scolor){
      (data.sandColors ||= {})[el.dataset.scolor] = el.value;
      const cell = el.closest('.vpal__cell');
      if (cell){
        cell.classList.add('vpal__cell--set');
        const btn = cell.querySelector('[data-sclear]');
        if (btn){ btn.disabled = false; btn.textContent = 'standart ↺'; }
      }
      applySandColors();
      saveSoon(); return;
    }

    /* Per-video palette colour. Live-applies when that video is on the
       background; no re-render here (re-rendering mid-drag would tear the
       colour picker out of the admin's hand). */
    if (el.dataset.vcolor){
      const [i, key] = el.dataset.vcolor.split('.');
      const v = data.videos?.[+i]; if (!v) return;
      (v.colors ||= {})[key] = el.value;
      const cell = el.closest('.vpal__cell');
      if (cell){
        cell.classList.add('vpal__cell--set');
        const btn = cell.querySelector('[data-vclear]');
        if (btn){ btn.disabled = false; btn.textContent = 'avto ↺'; }
      }
      if (data.bgVideo.enabled && data.bgVideo.presetId === v.id && !tidyUrl(data.bgVideo.src)) resolveAccent();
      saveSoon(); return;
    }

    if (el.dataset.model){
      set(el.dataset.model, el.type === 'checkbox' ? el.checked : el.value);
      if (el.dataset.model.startsWith('music.'))   window.__applyMusic?.();
      if (el.dataset.model.startsWith('bgVideo.')) applyBgVideo();
      saveSoon(); renderAll(); return;
    }
    if (el.id === 'avatarSizeR'){
      data.profile.photoSize = Number(el.value);
      $('#avatarSizeL').textContent = el.value;
      renderBindings(); saveSoon(); return;
    }
    if (el.id === 'bgOp'){
      data.bgVideo.opacity = Number(el.value); $('#bgOpLabel').textContent = el.value;
      applyBgVideo(); saveSoon(); return;
    }
    if (el.id === 'bgTintR'){
      data.bgVideo.tint = Number(el.value); $('#bgTintLabel').textContent = el.value;
      applyBgVideo(); saveSoon(); return;
    }
    if (el.dataset.arr){
      const [root, i, key] = el.dataset.arr.split('.');
      let v = el.value;
      if (key === 'level'){ v = Number(v); el.closest('.field')?.querySelector('.lvl')?.replaceChildren(String(v)); }
      data[root][+i][key] = v;
      saveSoon(); renderAll(); return;
    }
    // Trilingual field: write into the object's language subkey in place, so
    // the other two languages are preserved.
    if (el.dataset.ml){
      const o = get(el.dataset.ml);
      if (o && typeof o === 'object' && !Array.isArray(o)) o[el.dataset.lang] = el.value;
      else set(el.dataset.ml, { uz:'', en:'', ru:'', [el.dataset.lang]: el.value });
      el.classList.toggle('mlf__in--miss', !el.value.trim());
      saveSoon(); renderAll(); return;
    }
    if (el.dataset.tags !== undefined){
      data.portfolio[+el.dataset.tags].tags = el.value.split(',').map(s=>s.trim()).filter(Boolean);
      saveSoon(); renderAll(); return;
    }
    if (el.id === 'musicVol'){
      data.music.volume = Number(el.value);
      $('#volLabel').textContent = el.value;
      $('#bgAudio').volume = data.music.volume/100;
      saveSoon(); return;
    }
  });

  /* Delete + add + "use this one" clicks */
  main.addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (del){
      const k = del.dataset.del, i = +del.dataset.i;
      const gone = data[k][i];
      if (k === 'gallery' && !confirm('Bu rasm o\'chirilsinmi?')) return;
      data[k].splice(i, 1);
      // Free the storage object too, if it was one we uploaded.
      const url = gone?.src || gone?.url || '';
      if (url) window.Cloud?.remove?.(url);
      if (gone?.thumb && gone.thumb !== url) window.Cloud?.remove?.(gone.thumb);
      // The playing track / background video may have just been deleted.
      if (k === 'tracks' && tidyUrl(gone?.url) === tidyUrl(data.music.src)){
        data.music.src = ''; data.music.presetId = '';
        $('#bgAudio')?.pause(); window.__applyMusic?.();
      }
      if (k === 'videos' && gone?.id === data.bgVideo.presetId){
        data.bgVideo.presetId = data.videos[0]?.id || '';
        if (!data.videos.length) data.bgVideo.enabled = false;
        applyBgVideo();
      }
      save(); admin.fill(); renderAll(); toast('O\'chirildi'); return;
    }

    if (e.target.id === 'avatarEdit'){
      const cur = data.profile.avatar || DEFAULTS.profile.avatar;
      openCrop(cur, async blob => {
        try {
          toast('Yuklanmoqda…', 60000);
          const put2 = window.__adminPut;
          const file = new File([blob], 'avatar.jpg', { type:'image/jpeg' });
          const src = put2 ? await put2(file, 'avatar', 4) : null;
          if (!src){ toast('Yuklanmadi'); return; }
          data.profile.avatar = src;
          const f = $('[data-model="profile.avatar"]'); if (f) f.value = src;
          save(); renderBindings(); toast('Rasm yangilandi');
        } catch(err){ toast(err?.message || 'Saqlab bo\'lmadi'); }
      });
      return;
    }
    const sc = e.target.closest('[data-sclear]');
    if (sc){
      if (data.sandColors) delete data.sandColors[sc.dataset.sclear];
      save(); admin.renderSandTheme(); applySandColors();
      toast('Standart rangga qaytdi');
      return;
    }
    if (e.target.id === 'sandPreview'){
      if (data.theme !== 'sand'){ applyTheme('sand'); save(); admin.renderSandTheme(); toast('Uch rang temasi yoqildi'); }
      return;
    }
    const vc = e.target.closest('[data-vclear]');
    if (vc){
      const [i, key] = vc.dataset.vclear.split('.');
      const v = data.videos?.[+i]; if (!v?.colors) return;
      delete v.colors[key];
      save(); admin.renderVideos();
      if (data.bgVideo.enabled && data.bgVideo.presetId === v.id && !tidyUrl(data.bgVideo.src)) resolveAccent();
      toast('Rang avtomatikka qaytdi');
      return;
    }
    const dd = e.target.closest('[data-deldoc]');
    if (dd){
      const [ei, dj] = dd.dataset.deldoc.split('.').map(Number);
      const doc = data.education?.[ei]?.docs?.[dj];
      if (!doc) return;
      if (!confirm('Bu hujjat o\'chirilsinmi?')) return;
      data.education[ei].docs.splice(dj, 1);
      if (doc.src) window.Cloud?.remove?.(doc.src);
      save(); admin.renderEducation(); renderEducation(); toast('O\'chirildi');
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add){
      const k = add.dataset.add;
      // Trilingual content fields start as empty { uz,en,ru } objects so the
      // admin can fill all three straight away.
      const ml = uz => ({ uz, en:'', ru:'' });
      const blank = {
        skills:     { category:'New', name:'Yangi skill', level:50 },
        experience: { period:ml('2026 — Hozir'), title:ml('Lavozim'), company:'Kompaniya', description:ml('Tavsif...') },
        portfolio:  { title:ml('Yangi loyiha'), description:ml('Tavsif'), image:'', link:'', tags:[] },
        favorites:  { icon:'🔗', title:ml('Yangi link'), url:'' },
        education:  { id:'e'+uid(), name:ml("Yangi ta'lim"), period:ml(''), description:ml(''), docs:[] },
        videos:     { id:'v'+uid(), name:'Yangi video', url:'', thumb:'', colors:{} },
        tracks:     { id:'t'+uid(), name:'Yangi musiqa', url:'', link:'', icon:'🎵' }
      }[k];
      (k === 'skills' ? data[k].push(clone(blank)) : data[k].unshift(clone(blank)));
      save(); admin.fill(); renderAll(); return;
    }

    const uv = e.target.closest('[data-usevideo]');
    if (uv){
      const v = data.videos.find(x => x.id === uv.dataset.usevideo); if (!v) return;
      if (!tidyUrl(v.url)) { toast('Avval video URL ni kiriting'); return; }
      data.bgVideo.presetId = v.id;
      data.bgVideo.src = '';                 // the list entry wins over a stale custom URL
      data.bgVideo.enabled = true;
      const chk = $('[data-model="bgVideo.enabled"]'); if (chk) chk.checked = true;
      save(); admin.renderVideos(); applyBgVideo(); toast('▶ ' + v.name);
      return;
    }

    const ut = e.target.closest('[data-usetrack]');
    if (ut){
      const t = data.tracks[+ut.dataset.usetrack]; if (!t) return;
      if (!tidyUrl(t.url)) { toast('Avval musiqa URL ni kiriting'); return; }
      data.music.presetId = t.id; data.music.src = t.url;
      save(); admin.renderMusic(); window.__applyMusic?.();
      $('#bgAudio').play().then(()=>toast('▶ '+t.name)).catch(()=>toast(t.name+' tanlandi'));
      return;
    }
  });

  /* ------------------------------------------------------------ uploads
     With the cloud configured, a file goes to Supabase Storage and we keep a
     URL. Without it, we fall back to a base64 data-URL in localStorage —
     which works, but a handful of photos will exhaust the ~5MB quota, so the
     limits below are deliberately tight in that mode. */
  const put = window.__adminPut = async (file, folder, limitMB) => {
    const cloud = window.Cloud?.enabled && window.Cloud.status().signedIn;
    const cap = cloud ? limitMB : Math.min(limitMB, 2);
    if (file.size > cap*1024*1024){
      toast(cloud ? `Fayl ${cap}MB dan kichik bo'lsin`
                  : `Bulutsiz rejimda ${cap}MB gacha — bulutni ulasangiz ${limitMB}MB`);
      return null;
    }
    if (cloud) return window.Cloud.upload(file, folder);
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = ev => res(ev.target.result);
      r.onerror = () => rej(new Error('O\'qib bo\'lmadi'));
      r.readAsDataURL(file);
    });
  };

  main.addEventListener('change', async e => {
    const el = e.target;
    // <select data-arr> fires change, not input — route it to the same writer.
    if (el.tagName === 'SELECT' && el.dataset.arr){
      const [root, i, key] = el.dataset.arr.split('.');
      data[root][+i][key] = el.value;
      saveSoon(); renderAll(); return;
    }
    const files = Array.from(el.files || []);
    if (!files.length) return;
    const busy = msg => toast(msg, 60000);

    try {
      if (el.id === 'avatarFile'){
        // Telegram flow: pick file → circular crop/zoom → then upload.
        const obj = URL.createObjectURL(files[0]);
        el.value = '';
        openCrop(obj, async blob => {
          URL.revokeObjectURL(obj);
          try {
            busy('Yuklanmoqda…');
            const file = new File([blob], 'avatar.jpg', { type:'image/jpeg' });
            const src = await put(file, 'avatar', 4); if (!src) { toast('Yuklanmadi'); return; }
            data.profile.avatar = src;
            const f = $('[data-model="profile.avatar"]'); if (f) f.value = src;
            save(); renderBindings(); toast('Rasm yangilandi');
          } catch(err){ toast(err?.message || 'Yuklab bo\'lmadi'); }
        });
        return;
      }
      else if (el.dataset.img !== undefined){
        busy('Yuklanmoqda…');
        const src = await put(files[0], 'portfolio', 4); if (!src) return;
        data.portfolio[+el.dataset.img].image = src;
        save(); admin.renderPortfolio(); renderPortfolio(); toast('Rasm yuklandi');
      }
      else if (el.id === 'galleryFiles'){
        let n = 0;
        for (const [k, f] of files.entries()){
          busy(`Yuklanmoqda… ${k+1}/${files.length}`);
          const src = await put(f, 'gallery', 10);
          if (!src) continue;
          data.gallery.push({ id:'g'+uid(), src, thumb:'', caption:{ uz:'', en:'', ru:'' } });
          n++;
        }
        save(); admin.renderGallery(); renderGallery();
        toast(n ? `${n} ta rasm qo'shildi` : 'Hech narsa qo\'shilmadi');
      }
      else if (el.id === 'musicFile'){
        let n = 0;
        for (const [k, f] of files.entries()){
          busy(`Yuklanmoqda… ${k+1}/${files.length}`);
          const url = await put(f, 'audio', 12);
          if (!url) continue;
          data.tracks.unshift({ id:'t'+uid(), name: f.name.replace(/\.[^.]*$/,''), url, icon:'🎵' });
          n++;
        }
        save(); admin.renderMusic(); toast(n ? `${n} ta musiqa qo'shildi` : 'Qo\'shilmadi');
      }
      else if (el.dataset.edudoc !== undefined){
        const ei = +el.dataset.edudoc; let n = 0;
        for (const [k, f] of files.entries()){
          busy(`Yuklanmoqda… ${k+1}/${files.length}`);
          const src = await put(f, 'edu', 8);
          if (!src) continue;
          (data.education[ei].docs ||= []).push({ src });
          n++;
        }
        save(); admin.renderEducation(); renderEducation();
        toast(n ? `${n} ta hujjat qo'shildi` : 'Qo\'shilmadi');
      }
      else if (el.id === 'videoFiles'){
        let n = 0;
        for (const [k, f] of files.entries()){
          busy(`Yuklanmoqda… ${k+1}/${files.length}`);
          const url = await put(f, 'video', 30);
          if (!url) continue;
          data.videos.unshift({ id:'v'+uid(), name: f.name.replace(/\.[^.]*$/,''), url, thumb:'' });
          n++;
        }
        save(); admin.renderVideos(); toast(n ? `${n} ta video qo'shildi` : 'Qo\'shilmadi');
      }
      else return;
    } catch(err){
      console.warn('upload', err);
      toast(err?.message || 'Yuklab bo\'lmadi');
    } finally {
      el.value = '';                 // so re-picking the same file fires change
    }
  });

  /* Gallery: add by URL */
  $('#galleryAddUrl').onclick = () => {
    const u = tidyUrl(prompt('Rasm URL manzili:') || '');
    if (!u) return;
    data.gallery.push({ id:'g'+uid(), src:u, thumb:'', caption:{ uz:'', en:'', ru:'' } });
    save(); admin.renderGallery(); renderGallery(); toast('Qo\'shildi');
  };

  /* ---------------------------------------------------------- cloud pane */
  const cloudBusy = (btn, on) => { if (btn) btn.disabled = on; };
  /* Supabase xatolarini odam tiliga o'girish — inglizcha xom matn o'rniga. */
  const authErrUz = m => {
    m = String(m || '');
    if (/missing email|phone/i.test(m))          return 'Email kiritilmadi — tepadagi maydonni to\'ldiring';
    if (/invalid login credentials/i.test(m))    return 'Email yoki parol noto\'g\'ri';
    if (/email not confirmed/i.test(m))          return 'Email tasdiqlanmagan — Supabase\'da userni «Auto Confirm» bilan qayta yarating';
    if (/rate limit/i.test(m))                   return 'Juda ko\'p urinish — birozdan so\'ng qayta urining';
    return m || 'Kirib bo\'lmadi';
  };

  $('#sbLogin').onclick = async () => {
    const b = $('#sbLogin');
    try {
      const email = $('#sbEmail').value.trim();
      const pass  = $('#sbPass').value;
      if (!email){ toast('Email kiriting'); $('#sbEmail').focus(); return; }
      if (!pass){ toast('Parolni kiriting'); $('#sbPass').focus(); return; }
      cloudBusy(b, true);
      await window.Cloud.signIn(email, pass);
      try { localStorage.setItem('sb-last-email', email); } catch {}
      $('#sbPass').value = '';
      admin.renderSync(); toast('☁ Bulutga kirdingiz — endi har o\'zgarish hammaga chop etiladi', 3000);
    } catch(err){ toast(authErrUz(err?.message)); }
    finally { cloudBusy(b, false); }
  };
  $('#sbLogout').onclick = async () => {
    await window.Cloud?.signOut?.(); admin.renderSync(); toast('Chiqdingiz');
  };
  $('#sbPush').onclick = async () => {
    const b = $('#sbPush');
    try {
      cloudBusy(b, true); toast('Saqlanmoqda…', 30000);
      await window.Cloud.save(data);
      toast('☁ Bulutga saqlandi — hamma ko\'radi');
    } catch(err){ toast(err?.message || 'Saqlab bo\'lmadi'); }
    finally { cloudBusy(b, false); }
  };
  $('#sbPull').onclick = async () => {
    const b = $('#sbPull');
    try {
      cloudBusy(b, true);
      const remote = await window.Cloud.load();
      if (!remote){ toast('Bulutda hali ma\'lumot yo\'q'); return; }
      if (!confirm('Bulutdagi nusxa shu brauzerdagi o\'zgarishlar ustiga yoziladi. Davom etilsinmi?')) return;
      data = normalizeML(merge(DEFAULTS, remote));
      save(); admin.fill(); applyTheme(data.theme); renderAll(); applyBgVideo(); window.__applyMusic?.();
      toast('Bulutdan yuklandi');
    } catch(err){ toast(err?.message || 'Yuklab bo\'lmadi'); }
    finally { cloudBusy(b, false); }
  };

  /* Export / import / publish / reset */
  const dl = (blob, name) => {
    const u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u);
  };
  $('#exportData').onclick = () => {
    dl(new Blob([JSON.stringify(data,null,2)], {type:'application/json'}), 'cv-data.json');
    toast('Eksport qilindi');
  };
  $('#publishData').onclick = () => {
    const js = `/* Auto-generated from the admin panel.\n   Put this file next to index.html and deploy — every visitor sees these values. */\nwindow.DEPLOYED_DATA = ${JSON.stringify(data,null,2)};\n`;
    dl(new Blob([js], {type:'application/javascript'}), 'data.js');
    toast('data.js yuklandi — loyihaga qo\'ying va deploy qiling');
  };
  $('#importData').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try { data = normalizeML(merge(DEFAULTS, JSON.parse(ev.target.result))); save(); admin.fill(); renderAll(); toast('Import qilindi'); }
      catch { toast('JSON noto\'g\'ri'); }
    };
    r.readAsText(f);
  };
  $('#resetData').onclick = () => {
    if (!confirm('Barcha o\'zgarishlar o\'chadi. Davom etilsinmi?')) return;
    data = clone(DEFAULTS); save(); admin.fill(); renderAll(); toast('Standart holatga qaytarildi');
  };
}

/* ------------------------------------------------------- STEALTH ENTRY */
/* Admin access. Two honest layers:

   LAYER 1 (this function): a password gate on the panel UI. Only the SHA-256
   hash lives in the code — the password itself appears nowhere, so reading
   the source doesn't reveal it. Brute force is slowed by a 5-try / 5-minute
   lockout. This keeps casual snoopers out.

   LAYER 2 (the real wall): the panel only edits THIS browser's localStorage.
   Publishing to every visitor requires Cloud.save(), which Supabase rejects
   without the admin's email+password session (RLS). So even someone who
   bypasses layer 1 — which is always possible in an open-source frontend —
   can vandalise nothing but their own browser. */
const ADMIN_HASH = '6599000f1217f89dd44441ba82e1d9ba7bac006181810c9872cae82246a91b10';
const PWD_LOCK_KEY = 'admLock';

async function sha256hex(str){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}

function pwdLockState(){
  try {
    const l = JSON.parse(localStorage.getItem(PWD_LOCK_KEY) || '{}');
    if (l.until && Date.now() < l.until) return l;
    if (l.until && Date.now() >= l.until) { localStorage.removeItem(PWD_LOCK_KEY); return { fails: 0 }; }
    return { fails: l.fails || 0 };
  } catch { return { fails: 0 }; }
}

function initStealth(){
  const t = $('#mkmTrigger'); if (!t) return;

  /* Fully invisible entry, as requested: clicking MKM777 shows NOTHING on the
     page — no dialog, no indicator, no error. The visitor types the password
     blind and presses Enter. A wrong guess fails silently; the 5-try/5-minute
     lockout still counts underneath.

     The characters land in a hidden <input> rather than a keydown buffer so
     phones get a keyboard too (focusing an input is the only way to summon
     one). The input is 1px, transparent, caret hidden, behind the page —
     nothing of it can be seen. */
  const form = document.createElement('form');
  form.setAttribute('aria-hidden', 'true');
  Object.assign(form.style, {
    position:'fixed', bottom:'0', left:'0', width:'1px', height:'1px',
    overflow:'hidden', opacity:'0', zIndex:'-1', pointerEvents:'none'
  });
  const inp = document.createElement('input');
  inp.type = 'password';
  inp.autocomplete = 'off';
  inp.tabIndex = -1;
  Object.assign(inp.style, {
    width:'1px', height:'1px', border:'0', padding:'0', background:'transparent',
    color:'transparent', caretColor:'transparent', outline:'none'
  });
  form.appendChild(inp);
  document.body.appendChild(form);

  let armed = false, timer = null;
  const disarm = () => { armed = false; inp.value = ''; clearTimeout(timer); t.classList.remove('listening'); try{ inp.blur(); }catch{} };
  const touchTimer = () => { clearTimeout(timer); timer = setTimeout(disarm, 45000); };

  const attempt = async () => {
    const val = inp.value; inp.value = '';
    if (!val) { disarm(); return; }
    const lock = pwdLockState();
    if (lock.until || !crypto?.subtle){ disarm(); return; }      // silent
    const hex = await sha256hex(val);
    if (hex === ADMIN_HASH){
      try { localStorage.removeItem(PWD_LOCK_KEY); } catch {}
      disarm();
      admin.open();
    } else {
      const fails = (lock.fails || 0) + 1;
      const next = fails >= 5 ? { fails, until: Date.now() + 5*60*1000 } : { fails };
      try { localStorage.setItem(PWD_LOCK_KEY, JSON.stringify(next)); } catch {}
      disarm();                                                   // silent — no hint at all
    }
  };

  t.addEventListener('click', e => {
    e.stopPropagation();
    armed = true; inp.value = '';
    // Glow softly in the site's current accent while listening — the owner
    // sees it's armed; a stray visitor just sees a word pulse for a moment.
    t.classList.add('listening');
    // focus() must run inside the click gesture or mobile keyboards refuse
    inp.focus({ preventScroll: true });
    touchTimer();
  });
  // Enter arrives differently per platform: e.key 'Enter', legacy 'Return',
  // keyCode 13, or (on phones) only as a form submit from the "Go" key.
  const isEnter = e => e.key === 'Enter' || e.key === 'Return' || e.keyCode === 13 || e.code === 'Enter' || e.code === 'NumpadEnter';
  form.addEventListener('submit', e => { e.preventDefault(); if (armed) attempt(); });
  inp.addEventListener('keydown', e => {
    if (!armed) return;
    touchTimer();
    if (isEnter(e)){ e.preventDefault(); attempt(); }
    else if (e.key === 'Escape') disarm();
  });
  /* The main path needs no Enter at all: after every keystroke the current
     value is hashed, and the instant it matches the panel opens. This works
     on every keyboard and IME (some never deliver a usable Enter event) and
     is even stealthier — the password simply "happens". Only the SUCCESS
     case fires here; failures are counted solely on an explicit Enter, so
     partial prefixes while typing are never punished. */
  let checking = false;
  const tryAuto = async () => {
    if (!armed || checking) return;
    const val = inp.value;
    if (val.length < 8) return;                       // no point hashing tiny prefixes
    const lock = pwdLockState();
    if (lock.until || !crypto?.subtle) return;
    checking = true;
    try {
      const hex = await sha256hex(val);
      if (armed && hex === ADMIN_HASH && inp.value === val){
        try { localStorage.removeItem(PWD_LOCK_KEY); } catch {}
        disarm();
        admin.open();
      }
    } finally { checking = false; }
  };
  inp.addEventListener('input', () => { if (armed){ touchTimer(); tryAuto(); } });
  // Clicking anywhere else steals focus → silently stand down.
  inp.addEventListener('blur', () => { if (armed) disarm(); });
}

/* ---------------------------------------------------------------- LANGUAGE */
/* Push STRINGS into every [data-i18n] element, in every place it can appear:
     data-i18n         → textContent
     data-i18n-ph      → placeholder
     data-i18n-aria    → aria-label
   Then re-render the content (which reads L()) and re-tag <html lang>. */
function applyStrings(){
  $$('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = T(el.dataset.i18nPh); });
  $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', T(el.dataset.i18nAria)); });
  document.documentElement.lang = lang;
}

function setLang(next){
  if (!LANGS.includes(next)) next = 'uz';
  lang = next;
  data.lang = next;
  try { localStorage.setItem('cvLang', next); } catch {}
  $$('.lang__b').forEach(b => b.classList.toggle('active', b.dataset.lang === next));
  applyStrings();
  renderAll();          // content re-resolves through L()
}

/* ------------------------------------------------------------ SETTINGS */
function initSettings(){
  const panel = $('#settingsPanel'), btn = $('#settingsBtn');
  btn.onclick = e => { e.stopPropagation(); panel.classList.toggle('open'); };
  $('#settingsClose').onclick = () => panel.classList.remove('open');
  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove('open');
  });
  $$('.theme').forEach(b => b.onclick = () => {
    applyTheme(b.dataset.themeSet);
    save();
    toast('Tema: ' + b.querySelector('b').textContent);
  });
  $$('.lang__b').forEach(b => b.onclick = () => { setLang(b.dataset.lang); save(); });
  $('#downloadCv2').onclick = downloadCV;
  initHandSettings();
}

/* ------------------------------------------------- HAND SENSITIVITY UI
   The sliders live here, but the values live in hand-control.js — this only
   reads/writes them, so the tuning survives the camera being off. */
function initHandSettings(){
  const H = () => window.__hand;
  const rows = [
    { el:'#hsSpeed',  lab:'#hsSpeedL',  key:'speed',  toUi:v => Math.round(v*10),  fromUi:v => v/10,   fmt:v => v.toFixed(1) },
    { el:'#hsSmooth', lab:'#hsSmoothL', key:'smooth', toUi:v => Math.round(v*100), fromUi:v => v/100,  fmt:v => Math.round(v*100) },
    { el:'#hsPinch',  lab:'#hsPinchL',  key:'pinch',  toUi:v => Math.round(v*100), fromUi:v => v/100,  fmt:v => Math.round(v*100) },
    { el:'#hsScroll', lab:'#hsScrollL', key:'scroll', toUi:v => Math.round(v*10),  fromUi:v => v/10,   fmt:v => v.toFixed(1) }
  ];
  const paint = () => {
    const S = H()?.settings; if (!S) return;
    rows.forEach(r => {
      const el = $(r.el); if (!el) return;
      el.value = r.toUi(S[r.key]);
      $(r.lab).textContent = r.fmt(S[r.key]);
    });
  };
  rows.forEach(r => {
    const el = $(r.el); if (!el) return;
    el.addEventListener('input', () => {
      const v = r.fromUi(Number(el.value));
      H()?.set(r.key, v);
      $(r.lab).textContent = r.fmt(v);
    });
  });
  $('#handReset').onclick = () => { H()?.reset(); paint(); toast('Standart sozlamalar'); };
  // hand-control.js is deferred, so it may not have registered yet.
  if (H()) paint(); else addEventListener('load', paint, { once:true });
}

/* ------------------------------------------------------- CLOUD BOOTSTRAP
   Visitors get the published copy; the admin's own browser keeps whatever it
   was last editing. Runs after first paint so a slow/broken Supabase can
   never delay the page — worst case the site shows local data forever. */
async function initCloud(){
  const C = window.Cloud;
  if (!C?.enabled) { admin.renderSync?.(); return; }
  C.onChange(() => admin.renderSync?.());
  try {
    await C.init();
    const remote = await C.load();
    if (!remote) return;
    // Local edits win over the cloud only while the admin is signed in on
    // this device AND nothing newer has been published elsewhere. Otherwise
    // the admin's second device (phone/laptop) froze on its stale copy.
    const localEdits = (() => { try { return !!localStorage.getItem('cvData'); } catch { return false; } })();
    const localAt  = (() => { try { return Number(localStorage.getItem('cvSavedAt') || 0); } catch { return 0; } })();
    const remoteAt = Date.parse(C.lastUpdatedAt || '') || 0;
    if (localEdits && C.status().signedIn && localAt >= remoteAt - 3000) return;
    data = normalizeML(merge(DEFAULTS, remote));
    // Egasi chop etgan standart til — shaxsiy tanlovi yo'q tashrifchiga
    // qo'llanadi (cvLang yozilmaydi: egasi keyin standartni o'zgartirsa,
    // bu tashrifchiga ham yetib boradi).
    if (!hasPersonalLang() && LANGS.includes(data.lang) && data.lang !== lang){
      lang = data.lang;
      $$('.lang__b').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      applyStrings();
    }
    applyTheme(data.theme); renderAll(); applyBgVideo(); window.__applyMusic?.();
    admin.renderSync?.();
  } catch(e){ console.warn('cloud:', e); admin.renderSync?.(); }
}

/* ---------------------------------------------------------------- INIT */
function init(){
  $('#year').textContent = new Date().getFullYear();
  // Language before content, so the very first paint is already localised and
  // the active pill is lit.
  $$('.lang__b').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  applyStrings();
  applyTheme(data.theme);
  renderAll();
  applyBgVideo();
  initNav(); initMusic(); initForm(); initAdmin(); initStealth(); initSettings();
  initEducation(); initPlaylist(); initCrop();
  $('#portfolioCats')?.addEventListener('click', e => {
    const c = e.target.closest('[data-cat]'); if (!c) return;
    portfolioFilter = c.dataset.cat;
    renderPortfolio(); observeReveal(); showEverything();
  });
  $('#downloadCv').onclick = downloadCV;

  // Expose a tiny surface for hand-control.js + tests
  window.__cv = { get data(){ return data; }, save, renderAll, admin, DEFAULTS, toast,
                  applyTheme, applyBgVideo, THEMES, renderGallery, setLang, L, T,
                  pickAccent, applyAccent, resolveAccent, rgb2hsl, hsl2rgb };

  // Never block first paint on the network.
  // ODDIY setTimeout, requestIdleCallback EMAS: fon videosi kompozitorni
  // doim band qilib turgani uchun ba'zi brauzerlar idle-callback'ni umuman
  // otmaydi — initCloud hech qachon ishlamay, tashrifchilar bulutdagi
  // nashrni ko'rmay qolardi (jonli saytda aynan shu kuzatildi).
  setTimeout(initCloud, 30);
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
else init();
})();

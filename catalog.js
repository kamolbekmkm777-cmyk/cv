/* ==========================================================================
   catalog.js — the shipped catalogue: certificates and projects.
   Shared by the main page (app.js DEFAULTS) and the works page (works.js),
   so both always show the same list. Bump CV_CATALOG.version (and
   DEFAULTS.catalogVersion follows) whenever the list changes: a published
   cloud copy older than this is then replaced once by the code's list.
   ========================================================================== */
window.CV_CATALOG = {
  version: 3,
  certificates: [
    { file:"cert-01", kind:"pro",     title:"Google Cybersecurity", issuer:"Google", courses:8,
      date:"2025-05-12", verify:"https://coursera.org/verify/professional-cert/OECIKJRRZ6Z2" },
    { file:"cert-07", kind:"course",  title:"Foundations of Cybersecurity", issuer:"Google",
      date:"2025-04-11", verify:"https://coursera.org/verify/ZAY7GZ4H15R2" },
    { file:"cert-04", kind:"course",  title:"Play It Safe: Manage Security Risks", issuer:"Google",
      date:"2025-04-11", verify:"https://coursera.org/verify/27HOJBSIWPK2" },
    { file:"cert-06", kind:"course",  title:"Connect and Protect: Networks and Network Security", issuer:"Google",
      date:"2025-05-02", verify:"https://coursera.org/verify/BOA4QVHSIIWY" },
    { file:"cert-09", kind:"course",  title:"Tools of the Trade: Linux and SQL", issuer:"Google",
      date:"2025-05-02", verify:"https://coursera.org/verify/4KXMOYUDJPQ3" },
    { file:"cert-05", kind:"course",  title:"Assets, Threats, and Vulnerabilities", issuer:"Google",
      date:"2025-05-11", verify:"https://coursera.org/verify/B86GW4NSPD7V" },
    { file:"cert-02", kind:"course",  title:"Sound the Alarm: Detection and Response", issuer:"Google",
      date:"2025-05-12", verify:"https://coursera.org/verify/4U5MXPSB6SZW" },
    { file:"cert-08", kind:"course",  title:"Automate Cybersecurity Tasks with Python", issuer:"Google",
      date:"2025-05-12", verify:"https://coursera.org/verify/EB89934JS22G" },
    { file:"cert-03", kind:"course",  title:"Put It to Work: Prepare for Cybersecurity Jobs", issuer:"Google",
      date:"2025-05-12", verify:"https://coursera.org/verify/6RRCEQTJ5M3G" },
    { file:"cert-10", kind:"course",  title:"VR and 360 Video Production", issuer:"Google AR & VR",
      date:"2025-04-14", verify:"https://coursera.org/verify/CP7IPLYI55S4" },
    { file:"cert-13", kind:"course",  title:"Designing User Interfaces and Experiences (UI/UX)", issuer:"IBM",
      date:"2025-04-04", verify:"https://coursera.org/verify/RE3JEJ8DBHBG" },
    { file:"cert-15", kind:"course",  title:"Introduction to Mobile App Development", issuer:"IBM",
      date:"2025-01-31", verify:"https://coursera.org/verify/FMXEZOL1P1RF" },
    { file:"cert-12", kind:"course",  title:"Get Started with iOS App Development", issuer:"SkillUp",
      date:"2025-04-05", verify:"https://coursera.org/verify/B5LF5VQXG0Z9" },
    { file:"cert-14", kind:"course",  title:"Get Started with Android App Development", issuer:"SkillUp",
      date:"2025-04-04", verify:"https://coursera.org/verify/U43F3FPR1SJ2" },
    { file:"cert-11", kind:"project", title:"Design a Professional Business Card with QR Code using Canva", issuer:"Coursera",
      date:"2025-01-31", verify:"https://coursera.org/verify/AGNZ4AJYFZ9L" },
    { file:"cert-16", kind:"project", title:"Building a Business Presence With Facebook Marketing", issuer:"Coursera",
      date:"2025-01-31", verify:"https://coursera.org/verify/JSIIEHH4JWM9" }
  ],
  portfolio: [
    { title: { uz:"Aurora Academy — o‘quv markazi LMS", en:"Aurora Academy — learning platform", ru:"Aurora Academy — образовательная платформа" },
      description: { uz:"IELTS, ingliz tili, dasturlash va dizayn bo‘yicha o‘quv markazi platformasi: o‘quvchi, o‘qituvchi va administrator uchun alohida kabinetlar.", en:"A platform for a training centre teaching IELTS, English, programming and design, with separate dashboards for students, teachers and admins.", ru:"Платформа учебного центра (IELTS, английский, программирование, дизайн) с отдельными кабинетами для учеников, преподавателей и администраторов." },
      icon:"sparkles", glyph:"", tint:["#8b6cff","#1fb6e0"], iconImage:"assets/projects/aurora-academy.svg", image:"", apk:"", shots:[],
      link:"https://lm-system-psi.vercel.app", repo:"https://github.com/KamolbekMuzaffarov/LMSystem",
      tags:["Next.js 15","React 19","TypeScript","Supabase","Tailwind CSS"], cat:"site" },

    { title: { uz:"Natyajnoy Potolok — biznes sayti", en:"Natyajnoy Potolok — business site", ru:"Натяжные потолки — сайт бизнеса" },
      description: { uz:"Buxoro va Navoiy uchun chozma shift biznesining sayti: ishlar galereyasi, xona o‘lchamiga qarab narx hisoblagich va Telegramga tushadigan buyurtma.", en:"A stretch-ceiling business site for Bukhara and Navoiy: a gallery of work, a price calculator based on room size, and orders that land in Telegram.", ru:"Сайт бизнеса натяжных потолков для Бухары и Навои: галерея работ, расчёт цены по размерам комнаты и заказы, попадающие в Telegram." },
      icon:"gem", glyph:"", tint:["#e9c46a","#8a5a12"], iconImage:"assets/projects/natyajnoy.svg", image:"", apk:"", shots:[],
      link:"https://premium-potolok.vercel.app", repo:"",
      tags:["HTML","CSS","JavaScript","Vercel"], cat:"site" },

    { title: { uz:"Sino-Uz Pharma Bridge", en:"Sino-Uz Pharma Bridge", ru:"Sino-Uz Pharma Bridge" },
      description: { uz:"Xitoy farmatsevtika ishlab chiqaruvchilarini Markaziy Osiyo bozoriga bog‘lovchi ko‘p tilli B2B platforma sayti.", en:"A multilingual B2B platform site connecting Chinese pharmaceutical manufacturers to the Central Asian market.", ru:"Многоязычный сайт B2B-платформы, связывающей китайских фармпроизводителей с рынком Центральной Азии." },
      icon:"pharma", glyph:"", tint:["#f45b69","#2459d6"], iconImage:"assets/projects/sino-uz-pharma.svg", image:"", apk:"", shots:[],
      link:"https://sino-uz-pharma.vercel.app", repo:"",
      tags:["HTML","CSS","JavaScript","Vercel"], cat:"site" },

    { title: { uz:"Keyboard AI — telefon kompyuter pulti", en:"Keyboard AI — phone as a PC remote", ru:"Keyboard AI — телефон как пульт для ПК" },
      description: { uz:"Telefonni Bluetooth HID qurilmasi sifatida ko‘rsatadi — kompyuter uni oddiy simsiz klaviatura va sichqoncha deb biladi, drayver kerak emas.", en:"Presents the phone as a Bluetooth HID device — the computer sees an ordinary wireless keyboard and mouse, with no driver needed.", ru:"Представляет телефон как Bluetooth HID-устройство — компьютер видит обычную беспроводную клавиатуру и мышь, драйверы не нужны." },
      icon:"keyboard", glyph:"assets/projects/glass/keyboard-ai.png", tint:["#4f8cff","#8b5cf6"], iconImage:"assets/projects/keyboard-ai.png", image:"",
      apk:"https://github.com/kamolbekmkm777-cmyk/cv/releases/download/apps-v1/keyboard-ai.apk",
      shots:["assets/shots/keyboard-ai-1.png","assets/shots/keyboard-ai-2.png"],
      link:"", repo:"",
      tags:["Kotlin","Android","Bluetooth HID","Gradle"], cat:"app" },

    { title: { uz:"Tug‘ilgan kunlar eslatmasi", en:"Birthday reminder", ru:"Напоминание о днях рождения" },
      description: { uz:"Tug‘ilgan kunlarni saqlaydi va sana yaqinlashganda eslatadi. Ro‘yxatni Telegram orqali ulashsa, do‘st uni dublikatsiz import qiladi.", en:"Stores birthdays and reminds you as the date nears. Share the list over Telegram and a friend imports it without duplicates.", ru:"Хранит дни рождения и напоминает к дате. Список можно отправить в Telegram — друг импортирует его без дубликатов." },
      icon:"cake", glyph:"assets/projects/glass/tugilgan-kunlar.png", tint:["#34d399","#065f46"], iconImage:"assets/projects/tugilgan-kunlar.png", image:"",
      apk:"https://github.com/kamolbekmkm777-cmyk/cv/releases/download/apps-v1/tugilgan-kunlar.apk", shots:[],
      link:"", repo:"",
      tags:["Flutter","Dart","Android","Local notifications"], cat:"app" },

    { title: { uz:"JARVIS — Mac uchun ovozli yordamchi", en:"JARVIS — a voice assistant for the Mac", ru:"JARVIS — голосовой ассистент для Mac" },
      description: { uz:"“Jarvis” so‘zida uyg‘onadi, o‘zbekcha gapiradi. Whisper va Ollama Mac’ning o‘zida ishlaydi — audio kompyuterdan chiqmaydi.", en:"Wakes on the word “Jarvis” and speaks Uzbek. Whisper and Ollama run on the Mac itself — the audio never leaves the machine.", ru:"Просыпается на слово «Jarvis», говорит по-узбекски. Whisper и Ollama работают на самом Mac — аудио не покидает компьютер." },
      icon:"mic", glyph:"", tint:["#22d3ee","#1e3a8a"], iconImage:"assets/projects/jarvis.svg", image:"", apk:"", shots:[],
      link:"", repo:"",
      tags:["Python","Whisper","Ollama","Edge TTS","macOS"], cat:"app" },

    { title: { uz:"Anonim savollar boti", en:"Anonymous questions bot", ru:"Бот анонимных вопросов" },
      description: { uz:"Har foydalanuvchiga shaxsiy havola beradi; havola orqali kelgan xabar egasiga anonim yetadi, egasi javob berishi yoki bloklashi mumkin.", en:"Gives each user a personal link; messages sent through it reach the owner anonymously, who can reply or block the sender.", ru:"Выдаёт каждому пользователю личную ссылку; сообщения через неё приходят владельцу анонимно, он может ответить или заблокировать." },
      icon:"bot", glyph:"", tint:["#38bdf8","#1d4ed8"], iconImage:"assets/projects/anonim-bot.svg", image:"", apk:"", shots:[],
      link:"", repo:"",
      tags:["Python","python-telegram-bot","Telegram Bot API"], cat:"bot" },

    { title: { uz:"Tasbih ilovasi", en:"Tasbih app", ru:"Приложение тасбих" },
      description: { uz:"Kundalik zikrlarni qulay va oson sanash uchun yaratilgan zamonaviy raqamli tasbih. Sodda dizayn, istalgan joyda ishlatiladi.", en:"A modern digital tasbih for counting daily dhikr simply and comfortably. A plain design that works anywhere.", ru:"Современный цифровой тасбих для удобного счёта ежедневных зикров. Простой дизайн, работает где угодно." },
      icon:"beads", glyph:"assets/projects/glass/tasbih.png", tint:["#ff7a3d","#b8340b"], iconImage:"", image:"https://play-lh.googleusercontent.com/cRVXCgWimaQTQmXXUDbE-3JmWXe5YgfxVZGR16zp6Hb6lrPNkZv2BqZ1pmMgj6lRKd4EBi5AwbyRcL7JHPwPWi4=w480-h960-rw", apk:"", shots:[],
      link:"https://play.google.com/store/apps/details?id=com.mkm777.tasbih", repo:"",
      tags:["Flutter","Play Console"], cat:"app" },

    { title: { uz:"Kinofond", en:"Kinofond", ru:"Кинофонд" },
      description: { uz:"O‘zbek kino xazinasi uchun onlayn platforma: filmlar, seriallar va boshqa videokontentni qulay interfeysda tomosha qilish.", en:"An online platform for the Uzbek film archive: watching films, series and other video content through a comfortable interface.", ru:"Онлайн-платформа для узбекского кинофонда: просмотр фильмов, сериалов и другого видеоконтента в удобном интерфейсе." },
      icon:"film", glyph:"assets/projects/glass/kinofond.png", tint:["#2bb3c0","#0b4a5a"], iconImage:"assets/projects/kinofond.svg", image:"", apk:"", shots:[],
      link:"https://kinofond.uz/", repo:"https://github.com/kamolbekmkm777-cmyk/kinofond",
      tags:["HTML","JavaScript","PostgreSQL","Docker"], cat:"site" },

    { title: { uz:"ProxMedia — media sayti", en:"ProxMedia — media site", ru:"ProxMedia — медиа-сайт" },
      description: { uz:"Media va kontent xizmatlarini bir sahifaga yig‘adigan taqdimot sayti — mijozga ko‘rsatish uchun yagona manzil.", en:"A presentation site gathering media and content services onto one page — a single address to show a client.", ru:"Презентационный сайт, собирающий медиа- и контент-услуги на одну страницу — единый адрес, чтобы показать клиенту." },
      icon:"media", glyph:"assets/projects/glass/proxmedia.png", tint:["#3b8cf5","#a12fc8"], iconImage:"assets/projects/proxmedia.svg", image:"", apk:"", shots:[],
      link:"https://kamolbekmuzaffarov.github.io/ProXmedia/", repo:"https://github.com/KamolbekMuzaffarov/ProXmedia",
      tags:["JavaScript","HTML","CSS","GitHub Pages"], cat:"site" },

    { title: { uz:"SV — Django veb ilova", en:"SV — Django web app", ru:"SV — веб-приложение на Django" },
      description: { uz:"Django asosidagi server ilovasi: admin paneli, ma’lumotlar bazasi va media fayllar bilan. O‘z domeni uchun sozlangan.", en:"A server application built on Django, with an admin panel, a database and media files. Configured for its own domain.", ru:"Серверное приложение на Django: админ-панель, база данных и медиафайлы. Настроено под собственный домен." },
      icon:"server", glyph:"", tint:["#44b78b","#0c4b33"], iconImage:"assets/projects/sv-django.svg", image:"", apk:"", shots:[],
      link:"", repo:"https://github.com/KamolbekMuzaffarov/SV",
      tags:["Python","Django","SQLite"], cat:"site" }
  ]
};

/* Line glyphs for project icons (24×24, stroke only). */
window.CV_ICONS = {
  lms:      '<path d="M12 4 2 9l10 5 10-5-10-5Z"/><path d="M5 11.5V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-5.5"/><path d="M22 9v6"/>',
  ceiling:  '<path d="M3 9.5 12 3l9 6.5"/><path d="M5 9.5V20h14V9.5"/><path d="M7.5 13h9"/>',
  pharma:   '<path d="M14.5 3.5a5 5 0 0 1 7 7l-11 11a5 5 0 0 1-7-7Z"/><path d="M8 8l8 8"/>',
  mic:      '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/><path d="M8.5 22h7"/>',
  chip:     '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 7V3M14 7V3M10 21v-4M14 21v-4M7 10H3M7 14H3M21 10h-4M21 14h-4"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  circuit:  '<path d="M3 12h5M16 12h5"/><rect x="8" y="8" width="8" height="8" rx="1.5"/><path d="M12 3v5M12 16v5"/>',
  resistor: '<path d="M2 12h4l2-5 3 10 3-10 2 5h6"/>',
  math:     '<path d="M6 4h12l-8 8 8 8H6"/>',
  quiz:     '<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3 6 1.6 1.6L7.5 4.5M3 12l1.6 1.6L7.5 10.5M3 18l1.6 1.6L7.5 16.5"/>',
  media:    '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 6 3.5-6 3.5Z"/>',
  film:     '<rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="M7.5 4v16M16.5 4v16M2 9.5h5.5M2 14.5h5.5M16.5 9.5H22M16.5 14.5H22"/>',
  cake:     '<path d="M4 21h16"/><path d="M5 21v-6.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V21"/><path d="M12 12.5V9"/><path d="M12 6.6c.9-.6 1.2-1.4.9-2.3-.2-.6-.6-1-.9-1.3-.3.3-.7.7-.9 1.3-.3.9 0 1.7.9 2.3Z"/><path d="M5 17c1.6 0 1.6-1.4 3.2-1.4S9.8 17 11.4 17s1.6-1.4 3.2-1.4S16.2 17 17.8 17"/>',
  beads:    '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="4.5" r="1.6"/><circle cx="19.5" cy="12" r="1.6"/><circle cx="12" cy="19.5" r="1.6"/><circle cx="4.5" cy="12" r="1.6"/>',
  chart:    '<path d="M3 20h18"/><path d="M6 20v-6M11 20V7M16 20v-9M21 20V4"/>',
  bot:      '<rect x="3.5" y="8" width="17" height="12" rx="3.5"/><path d="M12 8V4.5M9.5 4.5h5"/><path d="M8.5 13h.01M15.5 13h.01"/><path d="M9.5 16.5h5"/>',
  server:   '<rect x="3" y="4" width="18" height="6.5" rx="2"/><rect x="3" y="13.5" width="18" height="6.5" rx="2"/><path d="M7 7.25h.01M7 16.75h.01"/>',
  flow:     '<circle cx="4.5" cy="12" r="2"/><circle cx="12" cy="5.5" r="2"/><circle cx="12" cy="18.5" r="2"/><circle cx="19.5" cy="12" r="2"/><path d="M6.2 11 10.3 6.6M6.2 13l4.1 4.4M13.7 6.6 17.8 11M13.7 17.4 17.8 13"/>',
  globe:    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z"/>',
  award:    '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-2.5 5 2.5-1.5-7"/>',
  sparkles: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0l1.58 6.13A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0Z"/><path d="M20 3v4M22 5h-4"/>',
  gem:      '<path d="M6 3h12l4 6-10 12L2 9Z"/><path d="M2 9h20M11 3 8 9l4 12 4-12-3-6"/>'
};

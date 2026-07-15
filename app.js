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
    profession: "Full-Stack Developer & AI Engineer",
    slogan: "I build intelligent products that scale — bots, AI, and clean cloud infrastructure for modern businesses.",
    location: "Tashkent, Uzbekistan",
    bio: "Men Kamolbek — AI, avtomatlashtirish va dizayn kesishmasiga qiziqqan o'z-o'zini o'rgatgan muhandisman. So'nggi yillarda men siz uxlab yotganingizda lidlarni qo'lga oladigan Telegram botlarni, xona rasmlarini o'qib dizayn taklif qiladigan AI yordamchilarni va xaosni aniqlikka aylantiradigan admin paneli loyihalarini ishlab chiqdim.",
    avatar: "assets/kamolbek-900.jpg"
  },
  ui: { hero_badge: "Yangi loyihalar uchun ochiq · 2026" },
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
    { period: "2024 — Hozir", title: "Founder & Lead Developer", company: "Independent / Freelance",
      description: "Telegram botlari, AI integratsiyalari va cloud avtomatlashtirish loyihalari ustida ishlayman. Mijozlar uchun end-to-end yechimlar ishlab chiqaman — boshlang'ich serverdan to to'lov qiladigan mijozgacha." },
    { period: "2022 — 2024", title: "Full-Stack Developer", company: "Tech Studio Tashkent",
      description: "B2B SaaS mahsulotlari uchun frontend va backend ishlab chiqdim. React/Next.js asosida 10+ ta dashboard, FastAPI backend va PostgreSQL bilan ishladim." },
    { period: "2020 — 2022", title: "Junior Developer", company: "StartupHub",
      description: "Web ilovalar, lending sahifalar va dastlabki bot loyihalarda qatnashdim. Python, Django va REST API bilan ishladim." }
  ],
  portfolio: [
    { title: "Chozma Shift AI Bot", description: "Stretch-ceiling biznesi uchun Telegram bot. Gemini Vision orqali xona rasmlarini tahlil qiladi, narxni hisoblaydi va lidlarni admin CRM ga uzatadi.",
      image: "", link: "", tags: ["Aiogram 3", "Gemini Vision", "SQLite", "Oracle Cloud"] },
    { title: "Lead Funnel Pro", description: "Telegram, Instagram DM va veb-formani birlashtirgan ko'p bosqichli lidlarni tasniflash mexanizmi. Issiq lidlarni avtomatik sotuvga yo'naltiradi.",
      image: "", link: "", tags: ["FastAPI", "PostgreSQL", "Redis", "Next.js"] },
    { title: "Vision Designer", description: "AI bilan interyer dizayn previewi. Foydalanuvchi xona rasmini yuklaydi, materiallar tanlaydi — tizim fotorealistik mockuplar qaytaradi.",
      image: "", link: "", tags: ["Python", "Stable Diffusion", "React", "WebSockets"] },
    { title: "Pulse Analytics", description: "Kichik biznes uchun real-vaqt dashboard. Telegram bot egasining savollarini oddiy tilda javob beradi — streaming data warehouse bilan.",
      image: "", link: "", tags: ["Aiogram", "OpenAI", "ClickHouse", "D3.js"] }
  ],
  favorites: [
    { icon: "🎧", title: "Mening pleylistim", url: "" },
    { icon: "📺", title: "YouTube kanalim", url: "" },
    { icon: "📚", title: "O'qiyotgan kitoblarim", url: "" }
  ],
  social: {
    telegram:  "https://t.me/kamolbekmuzaffarov",
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
  music: { src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
           volume: 40, autoplay: true, presetId: "song1" },
  bgVideo: { enabled: false, presetId: "forest", src: "", opacity: 70, tint: 55 },
  theme: "liquid",
  publicCode: "mkm777"
};

const THEMES = ['liquid','classic','modern','dark'];

/* Aerial nature loops — archive.org serves these with CORS and they're
   hotlink-friendly (Mixkit/Pexels/Pixabay all 403 direct embeds). */
const VIDEO_PRESETS = [
  { id:'forest',    name:"Bulutlar va yashil o'rmon", thumb:'https://archive.org/services/img/pixabay-9584',
    url:'https://archive.org/download/pixabay-9584/video-9584_source.mp4' },
  { id:'green',     name:"Yashil o'rmon manzarasi",   thumb:'https://archive.org/services/img/pixabay-19400',
    url:'https://archive.org/download/pixabay-19400/video-19400_large.mp4' },
  { id:'path',      name:"Sehrli o'rmon yo'li",       thumb:'https://archive.org/services/img/pixabay-19731',
    url:'https://archive.org/download/pixabay-19731/video-19731_large.mp4' },
  { id:'mountains', name:"Tog' panoramasi",           thumb:'https://archive.org/services/img/pixabay-21896',
    url:'https://archive.org/download/pixabay-21896/video-21896_source.mp4' },
  { id:'clouds',    name:'Bulutlar va osmon',         thumb:'https://archive.org/services/img/pixabay-21285',
    url:'https://archive.org/download/pixabay-21285/video-21285_source.mp4' },
  { id:'fog',       name:'Quyosh tumani',             thumb:'https://archive.org/services/img/pixabay-19409',
    url:'https://archive.org/download/pixabay-19409/video-19409_large.mp4' }
];

const MUSIC_PRESETS = [
  { id: 'song1', name: 'SoundHelix 1', icon: '🎵', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'song2', name: 'SoundHelix 2', icon: '🎶', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'song9', name: 'SoundHelix 9', icon: '🎼', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  { id: 'song15', name: 'SoundHelix 15', icon: '🎧', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' }
];

/* Brand icons (simple-icons paths, 24×24 viewBox) */
const ICONS = {
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
  github:{label:'GitHub',ph:'https://github.com/username'}
};

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
  return d;
})();

let saveTimer = null;
function save(){
  try { localStorage.setItem('cvData', JSON.stringify(data)); flashSaved(); return true; }
  catch(e){ console.warn('saveData', e); toast('Saqlab bo\'lmadi — xotira to\'lgan bo\'lishi mumkin'); return false; }
}
function saveSoon(){ clearTimeout(saveTimer); saveTimer = setTimeout(save, 250); }

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
  $$('[data-bind]').forEach(el => {
    const v = get(el.dataset.bind);
    if (v !== undefined && v !== null && v !== '') el.textContent = v;
  });
  document.title = `${data.profile.name} — ${data.profile.profession}`;
  const img = $('#avatarImg');
  if (img){
    const src = data.profile.avatar || DEFAULTS.profile.avatar;
    if (img.getAttribute('src') !== src) img.src = src;
    img.alt = data.profile.name;
  }
}

function renderStats(){
  const map = [['years','Yillik tajriba'],['projects','Loyihalar'],['clients','Mijozlar'],['uptime','Ishonchlilik']];
  $('#statsWrap').innerHTML = map.map(([k,label]) =>
    `<div class="stat"><b>${esc(data.stats[k])}</b><span>${label}</span></div>`).join('');
}

function renderSkills(){
  const groups = {};
  data.skills.forEach(s => (groups[s.category || 'Other'] ||= []).push(s));
  $('#skillsWrap').innerHTML = Object.entries(groups).map(([cat, arr]) => `
    <div class="sgroup" data-rv>
      <h3>${esc(cat)}</h3>
      ${arr.map(s => `
        <div class="skill">
          <div class="skill__t"><b>${esc(s.name)}</b><span>${Number(s.level)||0}%</span></div>
          <div class="skill__bar"><div class="skill__fill" data-w="${Number(s.level)||0}"></div></div>
        </div>`).join('')}
    </div>`).join('');
}

function renderTimeline(){
  const w = $('#timelineWrap');
  if (!data.experience.length){ w.innerHTML = `<p class="muted">Hali tajriba qo'shilmagan.</p>`; return; }
  w.innerHTML = data.experience.map(e => `
    <div class="titem" data-rv>
      <div class="titem__p">${esc(e.period)}</div>
      <h3 class="titem__t">${esc(e.title)}</h3>
      <div class="titem__c">${esc(e.company)}</div>
      <p class="titem__d">${esc(e.description)}</p>
    </div>`).join('');
}

function renderPortfolio(){
  const w = $('#portfolioWrap');
  if (!data.portfolio.length){ w.innerHTML = `<p class="muted">Hali loyiha qo'shilmagan.</p>`; return; }
  const grads = ['linear-gradient(135deg,#ccff33,#5fbf3f)','linear-gradient(135deg,#8a6bff,#4a3fbf)','linear-gradient(135deg,#ff6bcb,#bf3f8a)'];
  w.innerHTML = data.portfolio.map((p,i) => {
    const link = tidyUrl(p.link);
    return `
    <article class="pitem" data-rv>
      <div class="pitem__top" style="background:${grads[i%3]}">
        ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy" decoding="async">`
                  : `<span style="color:rgba(0,0,0,.55)">${esc((p.title||'P').charAt(0).toUpperCase())}</span>`}
      </div>
      <div class="pitem__b">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
        ${link ? `<a class="plink" href="${esc(link)}" target="_blank" rel="noopener">Ko'rish ↗</a>` : ''}
      </div>
    </article>`;
  }).join('');
}

function renderFavorites(){
  const list = (data.favorites||[]).filter(f => f.title && tidyUrl(f.url));
  const w = $('#favoritesWrap');
  const sec = $('#favorites');
  // Hide the section AND its nav link when there is nothing to show, so the
  // nav never points at an empty anchor.
  const navLink = $('.nav__links a[data-section="favorites"]')?.parentElement;
  const mobLink = $('#mobileMenu a[href="#favorites"]');
  if (!list.length){
    sec.hidden = true;
    if (navLink) navLink.hidden = true;
    if (mobLink) mobLink.hidden = true;
    return;
  }
  sec.hidden = false;
  if (navLink) navLink.hidden = false;
  if (mobLink) mobLink.hidden = false;
  w.innerHTML = list.map(f => `
    <a class="link" href="${esc(tidyUrl(f.url))}" target="_blank" rel="noopener" data-rv>
      <span class="link__ico">${esc(f.icon || '🔗')}</span>
      <span class="link__b"><b>${esc(f.title)}</b><span>${esc(String(f.url).replace(/^https?:\/\//,''))}</span></span>
      <span class="link__go">↗</span>
    </a>`).join('');
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
  const items = [
    c.email && { l:'Email',   v:c.email, h:'mailto:'+c.email,
      i:'<path d="M2 5.5h20v13H2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3 6 9 6 9-6" fill="none" stroke="currentColor" stroke-width="2"/>' },
    c.phone && { l:'Telefon', v:c.phone, h:'tel:'+String(c.phone).replace(/[^\d+]/g,''),
      i:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" fill="none" stroke="currentColor" stroke-width="2"/>' },
    tidyUrl(data.social?.telegram) && { l:'Telegram', v:String(data.social.telegram).replace(/^https?:\/\//,''), h:tidyUrl(data.social.telegram),
      i:`<path d="${ICONS.telegram}" fill="currentColor"/>` },
    c.website && { l:'Website', v:String(c.website).replace(/^https?:\/\//,''), h:tidyUrl(c.website),
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

/* ------------------------------------------------------- THEME + VIDEO */
function applyTheme(t){
  if (!THEMES.includes(t)) t = 'liquid';
  data.theme = t;
  document.body.dataset.theme = t;
  $$('.theme').forEach(b => b.classList.toggle('active', b.dataset.themeSet === t));
}

/* The <video> has preload="none" and no src until it's switched on, so a
   visitor who never enables it downloads exactly 0 bytes of video. */
function applyBgVideo(){
  const v = $('#bgVideo'), bg = $('.bg');
  if (!v || !bg) return;
  const cfg = data.bgVideo || {};
  bg.style.setProperty('--bgv-op',   (Number(cfg.opacity ?? 70))/100);
  bg.style.setProperty('--bgv-tint', (Number(cfg.tint ?? 55))/100);

  const preset = VIDEO_PRESETS.find(p => p.id === cfg.presetId);
  const src = tidyUrl(cfg.src) || preset?.url || '';

  if (!cfg.enabled || !src){
    v.classList.remove('on'); bg.classList.remove('video-on');
    v.pause(); v.removeAttribute('src'); v.load();
    return;
  }
  bg.classList.add('video-on');
  if (v.getAttribute('src') !== src){
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

function renderAll(){
  renderBindings(); renderStats(); renderSkills(); renderTimeline();
  renderPortfolio(); renderFavorites(); renderSocial(); renderContact();
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
    <div class="h"><div class="n">${esc(data.profile.name)}</div><div class="p">${esc(data.profile.profession)}</div>
    <div class="c">${[c.email&&'✉ '+c.email, c.phone&&'☎ '+c.phone, data.profile.location&&'📍 '+data.profile.location,
        data.social.telegram&&'✈ '+String(data.social.telegram).replace(/^https?:\/\//,''),
        data.social.github&&'⌥ '+String(data.social.github).replace(/^https?:\/\//,'')]
        .filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>
    ${rows('Haqimda', `<p>${esc(data.profile.bio)}</p><div class="st">
      <div><b>${esc(data.stats.years)}</b>Yillar</div><div><b>${esc(data.stats.projects)}</b>Loyihalar</div>
      <div><b>${esc(data.stats.clients)}</b>Mijozlar</div><div><b>${esc(data.stats.uptime)}</b>Uptime</div></div>`)}
    ${rows('Skills', `<div class="g">${data.skills.map(s=>`<div class="sk"><b>${esc(s.name)}</b><span>${s.level}%</span></div>`).join('')}</div>`)}
    ${rows('Ish tajribasi', data.experience.map(e=>`<div class="e"><div class="ep">${esc(e.period)}</div>
      <div class="et">${esc(e.title)}</div><div class="ec">${esc(e.company)}</div><div class="ed">${esc(e.description)}</div></div>`).join(''))}
    ${rows('Portfolio', data.portfolio.map(p=>`<div class="pi"><div class="pt">${esc(p.title)}</div>
      <div class="pd">${esc(p.description)}</div><div class="pd">${(p.tags||[]).join(' · ')}</div></div>`).join(''))}
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

/* ============================================================== ADMIN ==== */
const admin = {
  open(){
    $('#adminPanel').classList.add('open');
    $('#adminPanel').setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    this.fill();
    toast('Admin panel ochildi');
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
      else el.value = v ?? '';
    });
    const vol = $('#musicVol');
    if (vol){ vol.value = data.music.volume ?? 40; $('#volLabel').textContent = vol.value; }
    const op = $('#bgOp'), tn = $('#bgTintR');
    if (op){ op.value = data.bgVideo.opacity ?? 70; $('#bgOpLabel').textContent = op.value; }
    if (tn){ tn.value = data.bgVideo.tint ?? 55;    $('#bgTintLabel').textContent = tn.value; }
    this.renderSkills(); this.renderExperience(); this.renderPortfolio();
    this.renderFavorites(); this.renderSocial(); this.renderMusic(); this.renderVideos();
  },

  renderVideos(){
    const w = $('#bgVideoPresets'); if (!w) return;
    w.innerHTML = VIDEO_PRESETS.map(p => `
      <div class="vpreset ${data.bgVideo.presetId===p.id?'active':''}"
           data-vpreset="${p.id}" style="background-image:url('${esc(p.thumb)}')">
        <b>${esc(p.name)}</b>
      </div>`).join('');
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
          <div class="field"><label>Davr</label><input type="text" data-arr="experience.${i}.period" value="${esc(e.period)}"></div>
          <div class="field"><label>Lavozim</label><input type="text" data-arr="experience.${i}.title" value="${esc(e.title)}"></div>
          <div class="field full"><label>Kompaniya</label><input type="text" data-arr="experience.${i}.company" value="${esc(e.company)}"></div>
          <div class="field full"><label>Tavsif</label><textarea rows="3" data-arr="experience.${i}.description">${esc(e.description)}</textarea></div>
        </div>
      </div>`).join('');
  },
  renderPortfolio(){
    $('#adminPortfolio').innerHTML = data.portfolio.map((p,i) => `
      <div class="item">
        <div class="item__h"><b>Loyiha ${i+1}</b><button class="item__x" data-del="portfolio" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          <div class="field"><label>Nom</label><input type="text" data-arr="portfolio.${i}.title" value="${esc(p.title)}"></div>
          <div class="field"><label>Link</label><input type="text" data-arr="portfolio.${i}.link" value="${esc(p.link)}" placeholder="https://..."></div>
          <div class="field full"><label>Tavsif</label><textarea rows="2" data-arr="portfolio.${i}.description">${esc(p.description)}</textarea></div>
          <div class="field full"><label>Tags (vergul bilan)</label><input type="text" data-tags="${i}" value="${esc((p.tags||[]).join(', '))}"></div>
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
          <div class="field"><label>Nom</label><input type="text" data-arr="favorites.${i}.title" value="${esc(f.title)}" placeholder="Mening pleylistim"></div>
          <div class="field full"><label>URL</label><input type="text" data-arr="favorites.${i}.url" value="${esc(f.url)}" placeholder="https://youtube.com/playlist?list=..."></div>
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
    $('#musicPresets').innerHTML = MUSIC_PRESETS.map(p => `
      <div class="mpreset ${data.music.presetId===p.id?'active':''}" data-preset="${p.id}">
        <span class="mpreset__i">${p.icon}</span>
        <span><span class="mpreset__n">${esc(p.name)}</span><span class="mpreset__s">Preset</span></span>
      </div>`).join('');
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

    if (el.dataset.model){
      set(el.dataset.model, el.type === 'checkbox' ? el.checked : el.value);
      if (el.dataset.model.startsWith('music.'))   window.__applyMusic?.();
      if (el.dataset.model.startsWith('bgVideo.')) applyBgVideo();
      saveSoon(); renderAll(); return;
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

  /* Delete + add + preset clicks */
  main.addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (del){
      data[del.dataset.del].splice(+del.dataset.i, 1);
      save(); admin.fill(); renderAll(); toast('O\'chirildi'); return;
    }
    const add = e.target.closest('[data-add]');
    if (add){
      const k = add.dataset.add;
      const blank = {
        skills:     { category:'New', name:'Yangi skill', level:50 },
        experience: { period:'2026 — Hozir', title:'Lavozim', company:'Kompaniya', description:'Tavsif...' },
        portfolio:  { title:'Yangi loyiha', description:'Tavsif', image:'', link:'', tags:[] },
        favorites:  { icon:'🔗', title:'Yangi link', url:'' }
      }[k];
      (k === 'skills' ? data[k].push(clone(blank)) : data[k].unshift(clone(blank)));
      save(); admin.fill(); renderAll(); return;
    }
    const vp = e.target.closest('[data-vpreset]');
    if (vp){
      const p = VIDEO_PRESETS.find(x => x.id === vp.dataset.vpreset); if (!p) return;
      data.bgVideo.presetId = p.id;
      data.bgVideo.src = '';                 // preset wins over a custom URL
      data.bgVideo.enabled = true;
      const chk = $('[data-model="bgVideo.enabled"]'); if (chk) chk.checked = true;
      const url = $('[data-model="bgVideo.src"]');     if (url) url.value = '';
      save(); admin.renderVideos(); applyBgVideo(); toast('▶ ' + p.name);
      return;
    }
    const pre = e.target.closest('[data-preset]');
    if (pre){
      const p = MUSIC_PRESETS.find(x => x.id === pre.dataset.preset); if (!p) return;
      data.music.presetId = p.id; data.music.src = p.url;
      save(); admin.renderMusic();
      const inp = $('[data-model="music.src"]'); if (inp) inp.value = p.url;
      window.__applyMusic?.();
      $('#bgAudio').play().then(()=>toast('▶ '+p.name)).catch(()=>toast(p.name+' tanlandi'));
      return;
    }
  });

  /* File uploads */
  main.addEventListener('change', e => {
    const el = e.target;
    const readAs = (file, cb, limitMB) => {
      if (file.size > limitMB*1024*1024){ toast(`Fayl ${limitMB}MB dan kichik bo'lsin`); return; }
      const r = new FileReader(); r.onload = ev => cb(ev.target.result); r.readAsDataURL(file);
    };
    if (el.id === 'avatarFile' && el.files[0]){
      readAs(el.files[0], src => {
        data.profile.avatar = src;
        const f = $('[data-model="profile.avatar"]'); if (f) f.value = '(yuklandi)';
        save(); renderBindings(); toast('Rasm yuklandi');
      }, 3);
    }
    if (el.dataset.img !== undefined && el.files[0]){
      readAs(el.files[0], src => {
        data.portfolio[+el.dataset.img].image = src;
        save(); renderPortfolio(); toast('Rasm yuklandi');
      }, 2);
    }
    if (el.id === 'musicFile' && el.files[0]){
      readAs(el.files[0], src => {
        data.music.src = src; data.music.presetId = '';
        const f = $('[data-model="music.src"]'); if (f) f.value = '(yuklandi)';
        save(); admin.renderMusic(); window.__applyMusic?.(); toast('Musiqa yuklandi');
      }, 5);
    }
  });

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
      try { data = merge(DEFAULTS, JSON.parse(ev.target.result)); save(); admin.fill(); renderAll(); toast('Import qilindi'); }
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
function initStealth(){
  const t = $('#mkmTrigger'); if (!t) return;
  let on = false, buf = '', timer = null;
  const stop = () => { on = false; buf = ''; t.classList.remove('listening'); clearTimeout(timer); };

  t.addEventListener('click', e => {
    e.stopPropagation();
    on = true; buf = ''; t.classList.add('listening');
    clearTimeout(timer); timer = setTimeout(stop, 8000);
  });
  addEventListener('keydown', e => {
    if (!on) return;
    if (e.key === 'Escape') return stop();
    if (e.key.length !== 1) return;
    buf += e.key.toLowerCase();
    const code = String(data.publicCode || 'mkm777').toLowerCase();
    if (buf === code) { stop(); admin.open(); return; }
    if (!code.startsWith(buf)) stop();
  });
  addEventListener('scroll', () => { if (on) stop(); }, { passive:true });
  document.addEventListener('click', e => { if (on && !e.target.closest('#mkmTrigger')) stop(); });
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
  $('#downloadCv2').onclick = downloadCV;
}

/* ---------------------------------------------------------------- INIT */
function init(){
  $('#year').textContent = new Date().getFullYear();
  applyTheme(data.theme);
  renderAll();
  applyBgVideo();
  initNav(); initMusic(); initForm(); initAdmin(); initStealth(); initSettings();
  $('#downloadCv').onclick = downloadCV;

  // Expose a tiny surface for hand-control.js + tests
  window.__cv = { get data(){ return data; }, save, renderAll, admin, DEFAULTS, toast,
                  applyTheme, applyBgVideo, THEMES, VIDEO_PRESETS, MUSIC_PRESETS };
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
else init();
})();

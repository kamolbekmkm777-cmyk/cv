/* ==========================================================================
   Kamolbek Muzaffarov — CV Portfolio · public page logic
   Data model lives in core.js (window.CV). This file only renders the
   public site. The admin panel is a separate page: /admin (admin.html).
   ========================================================================== */
(() => {
'use strict';

const CV = window.CV;
const { $, $$, esc, tidyUrl, L, toast, ICONS, SOCIAL_META } = CV;
const LANGS = CV.LANGS;

/* ---------------------------------------------------------------- STRINGS
   Static UI chrome in three languages. Content itself lives in CV.data as
   { uz, en, ru } objects and resolves through L(). */
const STRINGS = {
  nav_home:      { uz:'Bosh',      en:'Home',       ru:'Главная' },
  nav_portfolio: { uz:'Ishlarim',  en:'Work',       ru:'Работы' },
  nav_lab:       { uz:'Lab',       en:'Lab',        ru:'Лаборатория' },
  nav_contact:   { uz:'Kontakt',   en:'Contact',    ru:'Контакты' },

  settings_title:{ uz:'Til va sozlamalar', en:'Language & settings', ru:'Язык и настройки' },
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

  sec_portfolio: { uz:'Ishlarim', en:'Selected work', ru:'Работы' },
  sec_portfolio_sub:{ uz:'Har bir ish — alohida sahifa: muammo, yechim va qarorlar bilan',
                      en:'Each project is its own page: the problem, the build, the decisions',
                      ru:'Каждый проект — отдельная страница: проблема, решение и ключевые решения' },
  sec_lab:       { uz:'Lab', en:'Lab', ru:'Лаборатория' },
  sec_lab_sub:   { uz:'Tajribalar maydoni — sinab koʻring',
                   en:'The playground — go on, try it',
                   ru:'Полигон для экспериментов — попробуйте' },
  lab_hand_h:    { uz:'Qoʻl bilan boshqarish', en:'Hand control', ru:'Управление рукой' },
  lab_hand_p:    { uz:'Kamerani yoqing-da, sichqonchani unuting: kursor barmogʻingizga ergashadi, fon zarralari esa qoʻlingizdan qochadi. Hech narsa yozib olinmaydi — tasvir brauzerdan chiqmaydi.',
                   en:'Turn on the camera and forget the mouse: the cursor follows your finger, and the background particles flee from your hand. Nothing is recorded — the video never leaves your browser.',
                   ru:'Включите камеру и забудьте про мышь: курсор следует за пальцем, а частицы фона разбегаются от руки. Ничего не записывается — видео не покидает браузер.' },
  lab_hand_btn:  { uz:'✋ Qoʻl bilan boshqarishni yoqish', en:'✋ Enable hand control', ru:'✋ Включить управление рукой' },
  sec_playlist:  { uz:'Musiqalarim', en:'My music', ru:'Моя музыка' },
  playlist_sub:  { uz:'Men yoqtirgan qoʻshiqlar — shu yerda tinglang yoki havolada oching',
                   en:'Songs I love — listen right here or open the link',
                   ru:'Песни, которые я люблю — слушайте здесь или откройте по ссылке' },
  sec_fav:       { uz:'Sevimlilarim', en:'Favorites', ru:'Избранное' },

  sec_contact:   { uz:'Bogʻlanish', en:'Contact', ru:'Контакты' },
  sec_edu:       { uz:'Taʼlim', en:'Education', ru:'Образование' },
  edu_docs:      { uz:'Hujjatlar va rasmlar', en:'Documents & photos', ru:'Документы и фото' },
  edu_nodocs:    { uz:'Hujjatlar tez orada qoʻshiladi', en:'Documents coming soon', ru:'Документы скоро появятся' },
  close:         { uz:'Yopish', en:'Close', ru:'Закрыть' },

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

  footer_gallery:{ uz:'Fotogalereya', en:'Photo gallery', ru:'Фотогалерея' },

  cat_all:   { uz:'Barchasi', en:'All', ru:'Все' },
  cat_bot:   { uz:'Botlar', en:'Bots', ru:'Боты' },
  cat_site:  { uz:'Saytlar', en:'Websites', ru:'Сайты' },
  cat_app:   { uz:'Ilovalar', en:'Apps', ru:'Приложения' },
  cat_esp32: { uz:'ESP32', en:'ESP32', ru:'ESP32' },
  cat_award: { uz:'Mukofotlar', en:'Awards', ru:'Награды' },
  cat_other: { uz:'Boshqa', en:'Other', ru:'Другое' }
};

const PORTFOLIO_CATS = ['bot','site','app','esp32','award','other'];
const T = key => (STRINGS[key] ? (STRINGS[key][CV.lang] || STRINGS[key].uz) : key);
const data = () => CV.data;

/* ---------------------------------------------------------------- RENDER */
function renderBindings(){
  $$('[data-bind]').forEach(el => {
    const v = L(CV.get(el.dataset.bind));
    if (v !== undefined && v !== null && v !== '') el.textContent = v;
  });
  document.title = `${data().profile.name} (MKM777) — ${L(data().profile.profession)}`;
  CV.applyBranding();
  const photo = $('.hero__photo');
  if (photo){
    const sz = Number(data().profile.photoSize) || 250;
    photo.style.width = `min(${sz}px, 58vw)`;
  }
  const img = $('#avatarImg');
  if (img){
    const src = data().profile.avatar || CV.DEFAULTS.profile.avatar;
    if (img.getAttribute('src') !== src) img.src = src;
    img.alt = data().profile.name;
    // Lokal jpg rasm uchun AVIF varianti mavjud (deploy paytida yaratilgan);
    // tashqi (Supabase) URL bo'lsa <source> o'chadi va oddiy <img> ishlaydi.
    const av = $('#avatarAvif');
    if (av){
      if (/^assets\/.+\.jpe?g$/i.test(src)) av.srcset = src.replace(/\.jpe?g$/i, '.avif');
      else av.removeAttribute('srcset');
    }
  }
  // Bitta oddiy qator: progress-bar yo'q, foiz yo'q.
  const sk = $('#skillsLine');
  if (sk) sk.textContent = String(data().skills || '');
}

/* ------------------------------------------------------------ EDUCATION
   One compact row above the contact card. Click → modal with docs. */
function renderEducation(){
  const w = $('#eduRow'), blk = $('#eduBlock');
  if (!w || !blk) return;
  const list = (data().education || []).filter(e => L(e.name));
  blk.hidden = !list.length;
  if (!list.length){ w.innerHTML=''; return; }
  w.innerHTML = list.map((e, i) => `
    <button class="edupill" data-edu="${i}">
      <b>${esc(L(e.name))}</b>
      ${L(e.period) ? `<span>${esc(L(e.period))}</span>` : ''}
    </button>`).join('');
}

let eduDocs = [], eduDocIdx = 0;
function openEduModal(i){
  const e = (data().education||[])[i]; if (!e) return;
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
  window.__lenis?.stop();          // modal ochiqda Lenis fonni aylantirmasin
}
function closeEduModal(){
  const m = $('#eduModal'); if (!m) return;
  m.classList.remove('open'); m.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  window.__lenis?.start();
}
function showDoc(n){
  if (!eduDocs.length) return;
  eduDocIdx = (n + eduDocs.length) % eduDocs.length;
  $('#dlbImg').src = eduDocs[eduDocIdx].src;
}
function initEducation(){
  $('#eduRow')?.addEventListener('click', e => {
    const b = e.target.closest('[data-edu]'); if (b) openEduModal(+b.dataset.edu);
  });
  $('#eduMClose').onclick = closeEduModal;
  $('#eduModal')?.addEventListener('click', e => { if (e.target.id === 'eduModal') closeEduModal(); });
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

/* ------------------------------------------------------------ PORTFOLIO
   Cards link to the per-project case-study page: /work?p=<slug>. */
let portfolioFilter = 'all';
function renderPortfolio(){
  const chips = $('#portfolioCats');
  if (chips){
    const present = PORTFOLIO_CATS.filter(c => (data().portfolio||[]).some(p => (p.cat||'other') === c));
    chips.innerHTML = present.length > 1
      ? ['all', ...present].map(c =>
          `<button class="chip ${portfolioFilter===c?'active':''}" data-cat="${c}">${esc(T('cat_'+c))}</button>`).join('')
      : '';
    if (portfolioFilter !== 'all' && !present.includes(portfolioFilter)) portfolioFilter = 'all';
  }
  const w = $('#portfolioWrap');
  const empty = { uz:'Hali loyiha qoʻshilmagan.', en:'No projects added yet.', ru:'Проекты пока не добавлены.' };
  if (!data().portfolio.length){ w.innerHTML = `<p class="muted">${esc(empty[CV.lang]||empty.uz)}</p>`; return; }
  const more = { uz:'Batafsil o‘qish', en:'Read the case', ru:'Читать кейс' };
  const shown = data().portfolio.filter(p => portfolioFilter === 'all' || (p.cat||'other') === portfolioFilter);
  w.innerHTML = shown.map(p => {
    const title = L(p.title);
    return `
    <a class="pitem" data-rv href="work?p=${encodeURIComponent(p.slug)}">
      <div class="pitem__top">
        <span>${esc((title||'P').charAt(0).toUpperCase())}</span>
        ${p.image ? `<img src="${esc(p.image)}" alt="${esc(title)}" loading="lazy" decoding="async" onerror="this.remove()">` : ''}
      </div>
      <div class="pitem__b">
        <h3>${esc(title)}</h3>
        <p>${esc(L(p.description))}</p>
        <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
        <span class="plink">${esc(more[CV.lang]||more.uz)} →</span>
      </div>
    </a>`;
  }).join('');
}

/* ------------------------------------------------------------------- LAB */
function renderFavorites(){
  const list = (data().favorites||[]).filter(f => L(f.title) && tidyUrl(f.url));
  const w = $('#favoritesWrap'), blk = $('#favBlock');
  if (!w || !blk) return;
  blk.hidden = !list.length;
  if (!list.length){ w.innerHTML = ''; return; }
  w.innerHTML = list.map(f => `
    <a class="link" href="${esc(tidyUrl(f.url))}" target="_blank" rel="noopener" data-rv>
      <span class="link__ico">${esc(f.icon || '🔗')}</span>
      <span class="link__b"><b>${esc(L(f.title))}</b><span>${esc(String(f.url).replace(/^https?:\/\//,''))}</span></span>
      <span class="link__go">↗</span>
    </a>`).join('');
}

function renderPlaylist(){
  const w = $('#playlistWrap'), blk = $('#playlistBlock');
  if (!w || !blk) return;
  const list = (data().tracks||[]).filter(t => t.name && (tidyUrl(t.url) || tidyUrl(t.link)));
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
    const list = (data().tracks||[]).filter(t => t.name && (tidyUrl(t.url) || tidyUrl(t.link)));
    const t = list[+b.dataset.play]; if (!t) return;
    const src = tidyUrl(t.url); if (!src) return;
    if (audio.src === src && !audio.paused){ audio.pause(); }
    else {
      audio.src = src;
      try { await audio.play(); } catch { toast('Chalib boʻlmadi'); }
    }
    renderPlaylist();
  });
  audio?.addEventListener('play',  () => renderPlaylist());
  audio?.addEventListener('pause', () => renderPlaylist());
}

/* ---------------------------------------------------------------- SOCIAL */
function renderSocial(){
  const w = $('#socialWrap');
  w.innerHTML = Object.keys(SOCIAL_META).map(k => {
    const url = tidyUrl(data().social?.[k]);
    if (!url) return '';
    return `<a class="soc${k==='channel'?' soc--robot':''}" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${SOCIAL_META[k].label}" title="${SOCIAL_META[k].label}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[k]}"/></svg></a>`;
  }).join('');
}

function renderContact(){
  const c = data().contacts;
  const phoneLabel = { uz:'Telefon', en:'Phone', ru:'Телефон' }[CV.lang] || 'Telefon';
  const siteLabel  = { uz:'Veb-sayt', en:'Website', ru:'Веб-сайт' }[CV.lang] || 'Veb-sayt';
  const mailLabel  = { uz:'Elektron pochta', en:'Email', ru:'Эл. почта' }[CV.lang] || 'Elektron pochta';
  const items = [
    c.email && { l:mailLabel, v:c.email, h:'mailto:'+c.email,
      i:'<path d="M2 5.5h20v13H2z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3 6 9 6 9-6" fill="none" stroke="currentColor" stroke-width="2"/>' },
    c.phone && { l:phoneLabel, v:c.phone, h:'tel:'+String(c.phone).replace(/[^\d+]/g,''),
      i:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" fill="none" stroke="currentColor" stroke-width="2"/>' },
    tidyUrl(data().social?.telegram) && { l:'Telegram', v:String(data().social.telegram).replace(/^https?:\/\//,''), h:tidyUrl(data().social.telegram),
      i:`<path d="${ICONS.telegram}" fill="currentColor"/>` },
    tidyUrl(data().social?.channel) && { l:'Telegram kanal', v:'@' + String(data().social.channel).replace(/^https?:\/\/(t\.me\/)?/,'').replace(/^@/,''), h:tidyUrl(data().social.channel),
      robot:true, i:`<path d="${ICONS.channel}" fill="currentColor"/>` },
    c.website && { l:siteLabel, v:String(c.website).replace(/^https?:\/\//,''), h:tidyUrl(c.website),
      i:'<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" fill="none" stroke="currentColor" stroke-width="2"/>' }
  ].filter(Boolean);

  $('#channelsWrap').innerHTML = items.map(it => `
    <a class="chan" href="${esc(it.h)}" target="_blank" rel="noopener">
      <span class="chan__i${it.robot?' chan__i--robot':''}"><svg viewBox="0 0 24 24">${it.i}</svg></span>
      <span class="chan__b"><b>${it.l}</b><span>${esc(it.v)}</span></span>
    </a>`).join('');

  const fp = $('#footerPhone');
  if (fp){
    if (c.phone){ fp.textContent = c.phone; fp.href = 'tel:'+String(c.phone).replace(/[^\d+]/g,''); fp.style.display=''; }
    else fp.style.display = 'none';
  }
}

function renderAll(){
  renderBindings(); renderPortfolio(); renderEducation();
  renderFavorites(); renderPlaylist(); renderSocial(); renderContact();
  observeReveal();
}

/* --------------------------------------------------------- SCROLL REVEAL */
let io = null;
function reveal(el){ el.classList.add('in'); }
function showEverything(){ $$('[data-rv]').forEach(reveal); }

function observeReveal(){
  if (!('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches){
    showEverything(); return;
  }
  io ||= new IntersectionObserver(entries => {
    for (const e of entries){
      if (!e.isIntersecting) continue;
      reveal(e.target);
      io.unobserve(e.target);
    }
  }, { threshold: 0, rootMargin: '300px 0px 300px 0px' });

  $$('.section, [data-rv]').forEach(el => {
    if (!el.hasAttribute('data-rv')) el.setAttribute('data-rv','');
    if (!el.classList.contains('in')) io.observe(el);
  });

  clearTimeout(observeReveal._t);
  observeReveal._t = setTimeout(() => {
    $$('[data-rv]:not(.in)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight + 300 && r.bottom > -300) reveal(el);
    });
  }, 1200);
}
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
      if (s.hidden || !s.offsetParent) continue;
      if (s.getBoundingClientRect().top <= y) cur = s.id;
    }
    links.forEach(a => a.classList.toggle('active', a.dataset.section === cur));
  };
  let stop = null;
  addEventListener('scroll', () => {
    raf ||= requestAnimationFrame(update);
    if (!document.body.classList.contains('scrolling')) document.body.classList.add('scrolling');
    clearTimeout(stop);
    stop = setTimeout(() => document.body.classList.remove('scrolling'), 140);
  }, { passive:true });
  update();

  const m = $('#mobileMenu');
  const close = () => { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
  $('#navBurger').onclick = () => { m.classList.add('open'); m.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
  $('#mobileMenuClose').onclick = close;
  $('#mobileMenuBg').onclick = close;
  $$('a', m).forEach(a => a.addEventListener('click', close));
  addEventListener('keydown', e => { if (e.key === 'Escape' && m.classList.contains('open')) close(); });
}

/* ---------------------------------------------------------------- MUSIC
   Autoplay YO'Q — musiqa faqat tugma bosilganda chalinadi. Pleyer qoladi. */
function initMusic(){
  const audio = $('#bgAudio'), btn = $('#musicBtn');
  let playing = false;

  const apply = () => {
    const src = tidyUrl(data().music.src);
    const wasPlaying = !audio.paused;
    if (src && audio.src !== src){
      audio.src = src;
      if (wasPlaying) audio.play().catch(()=>{});
    }
    if (!src) audio.removeAttribute('src');
    audio.volume = (Number(data().music.volume) || 40) / 100;
  };
  apply();

  audio.addEventListener('play',  () => { playing = true;  btn.classList.add('on'); });
  audio.addEventListener('pause', () => { playing = false; btn.classList.remove('on'); });
  audio.addEventListener('error', () => {
    if (!audio.getAttribute('src')) return;
    btn.classList.remove('on'); toast('Musiqani o\'qib bo\'lmadi');
  });

  btn.onclick = async () => {
    if (!tidyUrl(data().music.src)) { toast('Musiqa tanlanmagan'); return; }
    if (playing) { audio.pause(); return; }
    try { await audio.play(); } catch(e){ toast('Musiqa chalinmadi'); }
  };
  window.__applyMusic = apply;
}

/* -------------------------------------------------------------- CV / PDF */
function downloadCV(){
  const d = data(), c = d.contacts, w = open('', '_blank');
  if (!w) { toast('Popup bloklandi — ruxsat bering'); return; }
  const rows = (t, body) => `<h2>${t}</h2>${body}`;
  const secAbout = { uz:'Haqimda', en:'About', ru:'Обо мне' };
  const secSkills = { uz:'Koʻnikmalar', en:'Skills', ru:'Навыки' };
  const secExp = { uz:'Ish tajribasi', en:'Experience', ru:'Опыт работы' };
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(d.profile.name)} — CV</title><style>
    @page{size:A4;margin:14mm}*{margin:0;padding:0;box-sizing:border-box}
    body{font:13px/1.55 -apple-system,Inter,sans-serif;color:#111;padding:16px}
    .h{border-bottom:3px solid #111;padding-bottom:14px;margin-bottom:18px}
    .n{font-size:30px;font-weight:800;letter-spacing:-.02em}.p{font-size:15px;color:#555;margin-top:3px}
    .c{font-size:11px;color:#666;margin-top:9px;display:flex;gap:14px;flex-wrap:wrap}
    h2{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#888;
       margin:18px 0 9px;padding-bottom:5px;border-bottom:1px solid #ddd}
    .sk{font-size:12.5px;color:#333}
    .e{margin-bottom:12px}.ep{font-size:10.5px;color:#888;text-transform:uppercase;letter-spacing:.08em}
    .et{font-size:13.5px;font-weight:700}.ec{font-size:11.5px;color:#666;font-style:italic}
    .ed{font-size:11.5px;color:#333}
    .pi{margin-bottom:8px;padding:8px 10px;border-left:3px solid #111;background:#f7f7f4}
    .pt{font-weight:700;font-size:12.5px}.pd{font-size:11px;color:#555}
  </style></head><body>
    <div class="h"><div class="n">${esc(d.profile.name)}</div><div class="p">${esc(L(d.profile.profession))}</div>
    <div class="c">${[c.email&&'✉ '+c.email, c.phone&&'☎ '+c.phone, L(d.profile.location)&&'📍 '+L(d.profile.location),
        d.social.telegram&&'✈ '+String(d.social.telegram).replace(/^https?:\/\//,''),
        d.social.github&&'⌥ '+String(d.social.github).replace(/^https?:\/\//,'')]
        .filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div>
    ${rows(secAbout[CV.lang]||secAbout.uz, `<p>${esc(L(d.profile.bio))}</p>`)}
    ${rows(secSkills[CV.lang]||secSkills.uz, `<p class="sk">${esc(String(d.skills||''))}</p>`)}
    ${rows(secExp[CV.lang]||secExp.uz, d.experience.map(e=>`<div class="e"><div class="ep">${esc(L(e.period))}</div>
      <div class="et">${esc(L(e.title))}</div><div class="ec">${esc(e.company)}</div><div class="ed">${esc(L(e.description))}</div></div>`).join(''))}
    ${rows('Portfolio', d.portfolio.map(p=>`<div class="pi"><div class="pt">${esc(L(p.title))}</div>
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
    const url = `mailto:${data().contacts.email}?subject=${encodeURIComponent(f.get('subject')||'Portfolio kontakt')}&body=${encodeURIComponent(body)}`;
    $('#formStatus').textContent = 'Email mijozingiz ochilmoqda…';
    location.href = url;
    setTimeout(() => { e.target.reset(); $('#formStatus').textContent = 'Tayyor! Email orqali yuboring.'; }, 700);
  });
}

/* ---------------------------------------------------------------- LANGUAGE */
function applyStrings(){
  $$('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = T(el.dataset.i18nPh); });
  $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', T(el.dataset.i18nAria)); });
  document.documentElement.lang = CV.lang;
}

function setLang(next){
  if (!LANGS.includes(next)) next = 'uz';
  CV.lang = next;
  try { localStorage.setItem('cvLang', next); } catch {}
  $$('.lang__b').forEach(b => b.classList.toggle('active', b.dataset.lang === next));
  applyStrings();
  renderAll();
}

/* ------------------------------------------------------------ SETTINGS */
function initSettings(){
  const panel = $('#settingsPanel'), btn = $('#settingsBtn');
  btn.onclick = e => { e.stopPropagation(); panel.classList.toggle('open'); };
  $('#settingsClose').onclick = () => panel.classList.remove('open');
  document.addEventListener('click', e => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove('open');
  });
  $$('.lang__b').forEach(b => b.onclick = () => { setLang(b.dataset.lang); });
  $('#downloadCv2').onclick = downloadCV;
  initHandSettings();
}

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
  if (H()) paint(); else addEventListener('load', paint, { once:true });
}

/* ------------------------------------------------------- CLOUD BOOTSTRAP */
async function initCloud(){
  try {
    const fresh = await CV.loadCloud();
    if (!fresh) return;
    if (!CV.hasPersonalLang()){
      $$('.lang__b').forEach(b => b.classList.toggle('active', b.dataset.lang === CV.lang));
      applyStrings();
    }
    renderAll(); window.__applyMusic?.();
  } catch(e){ console.warn('cloud:', e); }
}

/* ---------------------------------------------------------- EASTER EGG */
function consoleEgg(){
  try {
    console.log('%cMKM777',
      'font-size:40px;font-weight:800;font-family:Unbounded,sans-serif;color:#F0A23C;text-shadow:0 2px 18px rgba(240,162,60,.45)');
    console.log('%cSalom, dasturchi! 👋  Qiziq bo‘lsa: %ckamolbek.com/lab',
      'font-size:13px;color:#a5a19a', 'font-size:13px;color:#F0A23C;font-weight:700');
    console.log('%cQo‘l bilan boshqarishni sinab ko‘rdingizmi? Pastki o‘ngdagi ✋ tugma.',
      'font-size:12px;color:#6d6a64');
  } catch {}
}

/* ---------------------------------------------------------------- INIT */
function init(){
  $('#year').textContent = new Date().getFullYear();
  $$('.lang__b').forEach(b => b.classList.toggle('active', b.dataset.lang === CV.lang));
  applyStrings();
  renderAll();
  initNav(); initMusic(); initForm(); initSettings();
  initEducation(); initPlaylist();
  $('#portfolioCats')?.addEventListener('click', e => {
    const c = e.target.closest('[data-cat]'); if (!c) return;
    portfolioFilter = c.dataset.cat;
    renderPortfolio(); observeReveal(); showEverything();
  });
  $('#downloadCv').onclick = downloadCV;
  // Lab'dagi katta tugma — pastki o'ngdagi FAB bilan bitta ish qiladi.
  $('#labHandBtn')?.addEventListener('click', () => $('#handFab')?.click());
  consoleEgg();

  window.__cv = { get data(){ return CV.data; }, save: CV.save, renderAll, toast, setLang, L, T };

  // ODDIY setTimeout, requestIdleCallback EMAS: band kompozitorda ba'zi
  // brauzerlar idle-callback'ni umuman otmaydi (jonli saytda kuzatilgan).
  setTimeout(initCloud, 30);
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
else init();
})();

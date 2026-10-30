/* ==========================================================================
   works.js — the works page: every project and every certificate, opened
   from the two folders on the main page. Same cards, same liquid glass.

   Data, in order:
     1. sessionStorage 'cvWorks' — exactly what the main page was showing
     2. the shipped catalogue (catalog.js), refreshed by the published cloud
        copy when that copy is at least as new as the catalogue
   ========================================================================== */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
const tidyUrl = u => { u = String(u || '').trim(); if (!u) return ''; return /^(https?:|mailto:|tel:|\/|\.|#)/i.test(u) ? u : 'https://' + u; };
const HEX_OK = v => /^#[0-9a-fA-F]{6}$/.test(String(v || ''));
const LANGS = ['uz', 'en', 'ru'];
const lang = (() => { try { const s = localStorage.getItem('cvLang'); if (LANGS.includes(s)) return s; } catch {} return 'uz'; })();
const L = v => v == null ? '' : (typeof v === 'object' ? (v[lang] || v.uz || v.en || v.ru || '') : String(v));

const STR = {
  projects:  { uz:'Loyihalar', en:'Projects', ru:'Проекты' },
  certs:     { uz:'Sertifikatlar', en:'Certificates', ru:'Сертификаты' },
  n_projects:{ uz:'{n} ta loyiha', en:'{n} projects', ru:'Проектов: {n}' },
  n_certs:   { uz:'{n} ta sertifikat · har birida rasmiy tekshirish havolasi', en:'{n} certificates · each with an official verification link', ru:'Сертификатов: {n} · у каждого официальная ссылка для проверки' },
  back:      { uz:'Orqaga', en:'Back', ru:'Назад' },
  view:      { uz:'Koʻrish ↗', en:'View ↗', ru:'Открыть ↗' },
  code:      { uz:'Kod ↗', en:'Code ↗', ru:'Код ↗' },
  apk:       { uz:'APK yuklab olish ↓', en:'Download APK ↓', ru:'Скачать APK ↓' },
  shots:     { uz:'Skrinshotlar', en:'Screenshots', ru:'Скриншоты' },
  verify:    { uz:'Tekshirish ↗', en:'Verify ↗', ru:'Проверить ↗' },
  pro:       { uz:'Kasbiy sertifikat', en:'Professional Certificate', ru:'Профессиональный сертификат' },
  course:    { uz:'Kurs', en:'Course', ru:'Курс' },
  project:   { uz:'Loyiha', en:'Project', ru:'Проект' },
  courses:   { uz:'ta kurs', en:'courses', ru:'курсов' },
  cat_all:   { uz:'Barchasi', en:'All', ru:'Все' },
  cat_bot:   { uz:'Botlar', en:'Bots', ru:'Боты' },
  cat_site:  { uz:'Saytlar', en:'Websites', ru:'Сайты' },
  cat_app:   { uz:'Ilovalar', en:'Apps', ru:'Приложения' },
  cat_esp32: { uz:'ESP32', en:'ESP32', ru:'ESP32' },
  cat_award: { uz:'Mukofotlar', en:'Awards', ru:'Награды' },
  cat_other: { uz:'Boshqa', en:'Other', ru:'Другое' }
};
const T = k => (STR[k] ? (STR[k][lang] || STR[k].uz) : k);

/* Certificates are grouped by who issued them. A certificate may name its
   group outright (group:"Anthropic"); otherwise "Google AR & VR" etc. fold
   into their parent brand. New issuers (Claude, OpenAI…) simply appear as a
   new section. Known brands keep this order; any others follow. */
const GROUP_ORDER = ['Google', 'Anthropic', 'OpenAI', 'IBM', 'Coursera', 'SkillUp'];
const GROUP_LABEL = { Anthropic:'Anthropic · Claude', OpenAI:'OpenAI' };
const groupOf = c => {
  if (c.group) return String(c.group);
  const i = String(c.issuer || '').trim();
  for (const g of GROUP_ORDER) if (i.toLowerCase().startsWith(g.toLowerCase())) return g;
  if (/claude/i.test(i)) return 'Anthropic';
  return i || 'Other';
};
const CATS = ['bot', 'site', 'app', 'esp32', 'award', 'other'];
const CAT_ICON = { bot:'bot', site:'globe', app:'chip', esp32:'chip', award:'award', other:'globe' };
const ICONS = window.CV_ICONS || {};
const CAT = window.CV_CATALOG || { portfolio: [], certificates: [], version: 0 };

/* ------------------------------------------------------------------ data */
let data = { portfolio: CAT.portfolio, certificates: CAT.certificates, bgVideo: null, videos: [] };
let fromSession = false;
try {
  const s = JSON.parse(sessionStorage.getItem('cvWorks') || 'null');
  if (s && Array.isArray(s.portfolio) && Date.now() - (s.at || 0) < 864e5){ data = s; fromSession = true; }
} catch {}

async function fromCloud(){
  const C = window.Cloud;
  if (fromSession || !C?.enabled) return;
  try {
    await C.init();
    const r = await C.load();
    if (!r || typeof r !== 'object') return;
    if (Number(r.catalogVersion || 0) >= Number(CAT.version) && Array.isArray(r.portfolio)){
      data.portfolio = r.portfolio;
      if (Array.isArray(r.certificates)) data.certificates = r.certificates;
    }
    if (r.bgVideo){ data.bgVideo = r.bgVideo; data.videos = r.videos || []; applyBgVideo(); }
    render();
  } catch (e){ console.warn('cloud', e); }
}

/* -------------------------------------------------------------- render */
const pick = k => (Object.prototype.hasOwnProperty.call(ICONS, k) ? ICONS[k] : '');
function glassTile(p){
  const title = L(p.title);
  const glyphImg = String(p.glyph || '').trim();
  const pic = String(p.iconImage || p.image || '').trim();
  const glyph = pick(p.icon) || pick(CAT_ICON[p.cat] || 'globe') || pick('globe');
  const svg = g => `<svg class="gtile__glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${g}</svg>`;
  let inner;
  if (glyphImg) inner = `<img class="gtile__img" src="${esc(glyphImg)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`;
  else if (Array.isArray(p.tint) && p.tint.length && glyph) inner = svg(glyph);
  else if (pic) inner = `<img class="gtile__pic" src="${esc(pic)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`;
  else if (glyph) inner = svg(glyph);
  else inner = `<span class="gtile__letter">${esc((title || 'P').charAt(0).toUpperCase())}</span>`;
  return `<span class="gtile" aria-hidden="true">${inner}</span>`;
}

let tab = new URLSearchParams(location.search).get('tab') === 'certs' ? 'certs' : 'projects';
let filter = 'all', certFilter = 'all';

function renderProjects(){
  const list = data.portfolio || [];
  const present = CATS.filter(c => list.some(p => (p.cat || 'other') === c));
  if (filter !== 'all' && !present.includes(filter)) filter = 'all';
  $('#portfolioCats').innerHTML = present.length > 1
    ? ['all', ...present].map(c => `<button class="chip ${filter === c ? 'active' : ''}" data-cat="${c}">${esc(T('cat_' + c))}</button>`).join('')
    : '';
  const shown = list.filter(p => filter === 'all' || (p.cat || 'other') === filter);
  $('#portfolioWrap').innerHTML = shown.map(p => {
    const pi = list.indexOf(p);
    const title = L(p.title), link = tidyUrl(p.link), repo = tidyUrl(p.repo), apk = String(p.apk || '').trim();
    const shots = (p.shots || []).map(s => String(s || '').trim()).filter(Boolean);
    return `
    <article class="pitem" id="p-${pi}" data-pi="${pi}">
      <div class="pitem__top">${glassTile(p)}</div>
      <div class="pitem__b">
        <h3>${esc(title)}</h3>
        <p>${esc(L(p.description))}</p>
        <div class="tags">${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        ${shots.length ? `<div class="pshots" aria-label="${esc(T('shots'))}">
          ${shots.map((s, si) => `<img src="${esc(s)}" alt="${esc(title)} ${si + 1}" loading="lazy" decoding="async" data-shot="${pi}.${si}" onerror="this.remove()">`).join('')}
        </div>` : ''}
        <div class="plinks">
          ${link ? `<a class="plink" href="${esc(link)}" target="_blank" rel="noopener">${esc(T('view'))}</a>` : ''}
          ${apk ? `<a class="plink plink--apk" href="${esc(apk)}" target="_blank" rel="noopener">${esc(T('apk'))}</a>` : ''}
          ${repo ? `<a class="plink plink--ghost" href="${esc(repo)}" target="_blank" rel="noopener">${esc(T('code'))}</a>` : ''}
        </div>
      </div>
    </article>`;
  }).join('');
}

const certList = () => (data.certificates || []).filter(c => c && c.file);
function fmtDate(s){
  const months = {
    uz:['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr'],
    en:['January','February','March','April','May','June','July','August','September','October','November','December'],
    ru:['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
  };
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return String(s || '');
  const mo = (months[lang] || months.uz)[+m[2] - 1] || '';
  if (lang === 'en') return `${mo} ${+m[3]}, ${m[1]}`;
  if (lang === 'ru') return `${+m[3]} ${mo} ${m[1]}`;
  return `${+m[3]}-${mo} ${m[1]}`;
}
function certCard(c, i){
  const kindT = { pro:'pro', course:'course', project:'project' };
  const courses = Number(c.courses) > 0 ? ` · ${c.courses} ${esc(T('courses'))}` : '';
  const v = tidyUrl(c.verify);
  return `
    <article class="cert ${c.kind === 'pro' ? 'cert--pro' : ''}">
      <button class="cert__shot" data-cert="${i}" aria-label="${esc(c.title)}">
        <img src="assets/certs/thumb/${esc(c.file)}.jpg" alt="${esc(c.title)}" loading="lazy" decoding="async" onerror="this.remove()">
      </button>
      <div class="cert__b">
        <span class="cert__badge">${esc(T(kindT[c.kind] || 'course'))}${courses}</span>
        <h3>${esc(c.title)}</h3>
        <p class="cert__meta">${esc(c.issuer || '')}${c.date ? ' · ' + esc(fmtDate(c.date)) : ''}</p>
        ${v ? `<a class="cert__v" href="${esc(v)}" target="_blank" rel="noopener">${esc(T('verify'))}</a>` : ''}
      </div>
    </article>`;
}
function certGroups(){
  const list = certList(), map = new Map();
  list.forEach((c, i) => { const g = groupOf(c); if (!map.has(g)) map.set(g, []); map.get(g).push([c, i]); });
  const rank = g => { const k = GROUP_ORDER.indexOf(g); return k < 0 ? 99 : k; };
  return [...map.entries()].sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]));
}
function renderCerts(){
  const groups = certGroups();
  if (certFilter !== 'all' && !groups.some(([g]) => g === certFilter)) certFilter = 'all';
  $('#certCats').innerHTML = groups.length > 1
    ? [['all', certList().length], ...groups.map(([g, l]) => [g, l.length])].map(([g, n]) =>
        `<button class="chip ${certFilter === g ? 'active' : ''}" data-group="${esc(g)}">${esc(g === 'all' ? T('cat_all') : (GROUP_LABEL[g] || g))} <b class="chip__n">${n}</b></button>`).join('')
    : '';
  const shown = certFilter === 'all' ? groups : groups.filter(([g]) => g === certFilter);
  $('#certsWrap').innerHTML = shown.map(([g, l]) => `
    <section class="cgroup">
      <h2 class="cgroup__h">${esc(GROUP_LABEL[g] || g)} <span>${l.length}</span></h2>
      <div class="certs">${l.map(([c, i]) => certCard(c, i)).join('')}</div>
    </section>`).join('');
}

function render(){
  document.documentElement.lang = lang;
  $$('.wtab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
    b.setAttribute('aria-selected', String(b.dataset.tab === tab));
    $('span', b).textContent = T(b.dataset.tab);
    $('b', b).textContent = b.dataset.tab === 'certs' ? certList().length : (data.portfolio || []).length;
  });
  $('#wTitle').textContent = T(tab);
  $('#wSub').textContent = T(tab === 'certs' ? 'n_certs' : 'n_projects').replace('{n}', tab === 'certs' ? certList().length : (data.portfolio || []).length);
  $('#pBack')?.setAttribute('aria-label', T('back'));
  $$('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== tab; });
  document.title = `${T(tab)} — ${data.name || 'Kamolbek Muzaffarov'} (MKM777)`;
  if (tab === 'projects') renderProjects(); else renderCerts();
}

function setTab(next){
  if (next === tab) return;
  tab = next;
  const u = new URL(location.href);
  u.searchParams.set('tab', tab); u.searchParams.delete('p');
  history.replaceState(null, '', u);
  render();
  scrollTo({ top: 0, behavior: 'smooth' });
}

/* ------------------------------------------------------------ lightbox */
let docs = [], di = 0;
function showDoc(n){
  if (!docs.length) return;
  di = (n + docs.length) % docs.length;
  $('#dlbImg').src = docs[di];
}
function openDocs(list, n){
  docs = list; showDoc(n);
  $('#docLightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDocs(){
  $('#docLightbox').classList.remove('open');
  document.body.style.overflow = '';
}

/* --------------------------------------------------------- background */
const LOCAL_VIDEO = { forest: 'assets/bg/forest.mp4' };
function applyBgVideo(){
  if (document.body.dataset.theme === 'sculpt') return;
  const v = $('#bgVideo'), bg = $('.bg');
  const cfg = data.bgVideo || { enabled: true, presetId: 'forest', opacity: 70, tint: 0 };
  bg.style.setProperty('--bgv-op', (Number(cfg.opacity ?? 70)) / 100);
  bg.style.setProperty('--bgv-tint', (Number(cfg.tint ?? 55)) / 100);
  const custom = tidyUrl(cfg.src);
  const src = custom || LOCAL_VIDEO[cfg.presetId] || (data.videos || []).find(x => x.id === cfg.presetId)?.url || '';
  if (!cfg.enabled || !src || v.getAttribute('src') === src) return;
  bg.classList.add('video-on');
  v.src = src;
  v.addEventListener('loadeddata', () => v.play().catch(() => {}), { once: true });
  v.addEventListener('playing', () => v.classList.add('on'), { once: true });
  v.load();
}

/* ---------------------------------------------------------------- init */
function init(){
  render();
  $$('.wtab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $('#portfolioCats').addEventListener('click', e => {
    const c = e.target.closest('[data-cat]'); if (!c) return;
    filter = c.dataset.cat; renderProjects();
  });
  $('#portfolioWrap').addEventListener('click', e => {
    const im = e.target.closest('[data-shot]'); if (!im) return;
    const [pi, si] = im.dataset.shot.split('.').map(Number);
    const shots = (data.portfolio?.[pi]?.shots || []).map(s => String(s || '').trim()).filter(Boolean);
    if (shots.length) openDocs(shots, si);
  });
  $('#certCats').addEventListener('click', e => {
    const c = e.target.closest('[data-group]'); if (!c) return;
    certFilter = c.dataset.group; renderCerts();
  });
  $('#certsWrap').addEventListener('click', e => {
    const b = e.target.closest('[data-cert]'); if (!b) return;
    openDocs(certList().map(c => `assets/certs/${c.file}.jpg`), +b.dataset.cert);
  });
  $('#dlbClose').onclick = closeDocs;
  $('#dlbPrev').onclick = e => { e.stopPropagation(); showDoc(di - 1); };
  $('#dlbNext').onclick = e => { e.stopPropagation(); showDoc(di + 1); };
  $('#docLightbox').addEventListener('click', e => { if (e.target.id === 'docLightbox') closeDocs(); });
  addEventListener('keydown', e => {
    if (!$('#docLightbox').classList.contains('open')) return;
    if (e.key === 'Escape') closeDocs();
    if (e.key === 'ArrowLeft') showDoc(di - 1);
    if (e.key === 'ArrowRight') showDoc(di + 1);
  });

  // came from a project file in the folder: bring that card into view
  const p = new URLSearchParams(location.search).get('p');
  if (p != null && tab === 'projects'){
    requestAnimationFrame(() => {
      const card = $('#p-' + Number(p));
      if (!card) return;
      card.scrollIntoView({ block: 'center' });
      card.classList.add('flash');
    });
  }
  applyBgVideo();
  setTimeout(fromCloud, 30);
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init); else init();
})();

/* ==========================================================================
   pages.js — shared chrome for the sub-pages (gallery, works):
     • the back button is a glass drop (the app bar's water shader) and goes
       back in history when we came from this site, so the scroll is kept;
     • every [data-glass] heading is drawn as liquid glass over the video.
   Theme «Haykal» keeps everything plain, like the main page.
   ========================================================================== */
(() => {
'use strict';
const $ = s => document.querySelector(s);

function smartBack(a){
  a.addEventListener('click', e => {
    try {
      if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1){
        e.preventDefault(); history.back();
      }
    } catch {}
  });
}

function offlinePoster(){
  if (location.protocol !== 'file:') return Promise.resolve('assets/bg/forest.jpg');
  // file://: local images can't be read by WebGL; the data: copy can
  return new Promise(res => {
    const s = document.createElement('script');
    s.src = 'assets/offline-data.js';
    s.onload = () => res(window.__OFFLINE?.poster || 'assets/bg/forest.jpg');
    s.onerror = () => res('assets/bg/forest.jpg');
    document.head.appendChild(s);
  });
}

function init(){
  const sculpt = document.body.dataset.theme === 'sculpt';
  const back = $('#pBack');
  if (back){
    smartBack(back);
    window.LiquidNav?.bead?.(back, { tone: sculpt ? 'light' : 'dark' });
  }
  if (sculpt || !window.GlassText) return;
  const go = () => offlinePoster().then(poster => {
    const opts = { media: $('.bg__media'), video: $('#bgVideo'), poster };
    document.querySelectorAll('[data-glass]').forEach(el => window.GlassText.mount(el, opts));
  });
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once:true });
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init); else init();
})();

/* ==========================================================================
   fx.js — smooth scrolling (Lenis), loaded as a CDN ES module.
   If the CDN is unreachable the module fails silently and the page keeps
   native scrolling. Reduced-motion users keep native scrolling too.
   ========================================================================== */
import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.mjs';

if (!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const lenis = new Lenis({ lerp: 0.09 });
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  /* Anchor clicks glide instead of jumping (CSS smooth-scroll is off —
     it would fight Lenis for the scroll position every frame). */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    if (!hash || hash.length < 2) return;
    const el = document.querySelector(hash);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { offset: -84 });
    history.pushState(null, '', hash);
  });

  window.__lenis = lenis;
}

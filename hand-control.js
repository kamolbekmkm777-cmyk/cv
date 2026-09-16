/* ==========================================================================
   Hand control — MediaPipe Hands → virtual cursor
   --------------------------------------------------------------------------
   GESTURES:

     • Index finger pointing            → cursor follows the fingertip
     • Quick tap (index touches thumb
       and releases fast)               → CLICK
     • Keep them touching               → mouse button stays HELD DOWN
     • Hold them touching and raise or
       lower your hand                  → SCROLL

   WHY CLICK AND SCROLL USED TO FAIL — both were one-line bugs:

   1. CLICK: the cursor tracked the index fingertip, but the moment you
      pinched it switched to the thumb/index MIDPOINT. That midpoint sits
      30–80px away on screen, so the cursor teleported at the exact instant
      of the press. Release then measured "moved 60px" → over tapMaxPx → the
      tap was rejected as a click, and often crossed swipeMinPx first and
      turned into an accidental scroll. Fix: never switch anchors. Track the
      index tip always, and freeze a position offset at pinch-down so even
      the fingertip's own shift while curling can't move the cursor.

   2. SCROLL: scrollBy({behavior:'auto'}) inherits `html{scroll-behavior:
      smooth}` from style.css. Every frame started a NEW smooth animation
      that cancelled the previous one, so ~24 competing animations per second
      cancelled each other out and the page barely moved. Fix: 'instant'.

   Performance:
     • MediaPipe (~2 MB wasm) is LAZY-LOADED — nothing downloads until the
       hand button is clicked. Zero cost for normal visitors.
     • Lite model + 320×240 frames + 24 Hz in-flight-guarded pump.
     • One Euro filter: responsive when moving fast, steady when hovering.
   The camera feed is never rendered — only the virtual cursor.
   ========================================================================== */
(() => {
'use strict';

const fab      = document.getElementById('handFab');
const cursor   = document.getElementById('handCursor');
const statusEl = document.getElementById('handStatus');
if (!fab || !cursor) return;

const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands';
const LS_KEY = 'handSettings';

/* ------------------------------------------------------------- SETTINGS
   The four knobs the settings panel exposes. Everything else in CFG is
   derived from these, so tuning is one number per concept, not eleven. */
const DEFAULTS = {
  speed:  1.0,   // cursor gain: how far the hand moves the pointer
  smooth: 0.5,   // 0 = raw + jittery, 1 = heavily damped
  pinch:  0.5,   // how easily fingers count as "touching"
  scroll: 3.2    // scroll distance per pixel of hand travel
};

const settings = (() => {
  const s = { ...DEFAULTS };
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    for (const k of Object.keys(DEFAULTS)){
      if (typeof saved[k] === 'number' && isFinite(saved[k])) s[k] = saved[k];
    }
  } catch {}
  return s;
})();

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Derived tuning. Recomputed whenever a slider moves. */
const CFG = {
  pinchOn: 0.44, pinchOff: 0.57,
  tapMaxMs: 400,    // released faster than this → it was a TAP (click)
  tapMaxPx: 48,     // …and it barely moved
  swipeMinPx: 34,   // held + moved this far vertically → scroll
  scrollGain: 3.2,
  scrollClamp: 110,
  gain: 1.25,
  fps: 24
};

function derive(){
  // Pinch: more sensitivity → a looser distance still counts as a touch.
  CFG.pinchOn  = 0.28 + clamp(settings.pinch, 0, 1) * 0.34;
  CFG.pinchOff = CFG.pinchOn + 0.13;                 // hysteresis: can't flicker
  CFG.scrollGain = clamp(settings.scroll, 0.5, 9);
  CFG.gain = 1.25 * clamp(settings.speed, 0.5, 2.5);
  // Smoothing → One Euro's minimum cutoff. Low cutoff = heavy damping.
  const cutoff = 3.0 - clamp(settings.smooth, 0, 1) * 2.6;
  fx.minCutoff = fy.minCutoff = cutoff;
  // A faster cursor covers more pixels for the same hand wobble, so the
  // "did it stay still?" gates have to scale with it or clicks get rejected.
  CFG.tapMaxPx   = 48 * clamp(settings.speed, 0.5, 2.5);
  CFG.swipeMinPx = 34 * clamp(settings.speed, 0.5, 2.5);
}

function persist(){
  try { localStorage.setItem(LS_KEY, JSON.stringify(settings)); } catch {}
}

const S = {
  on:false, loading:false, hands:null, video:null, stream:null,
  x: innerWidth/2, y: innerHeight/2, tx: innerWidth/2, ty: innerHeight/2,
  hasHand:false, pinch:false,
  downAt:0, downX:0, downY:0,   // where/when the pinch started
  holding:false,                // mouse button currently held
  swiping:false, lastY:0, movedMax:0,
  offX:0, offY:0,               // frozen offset so pinching never jumps the cursor
  target:null,                  // element the press started on
  inFlight:false, lastSend:0, raf:null
};

/* ------------------------------------------------------- One Euro filter */
class OneEuro {
  constructor(minCutoff = 1.4, beta = 0.04, dCutoff = 1.0){
    Object.assign(this, { minCutoff, beta, dCutoff, xPrev:null, dxPrev:0, tPrev:0 });
  }
  _a(cutoff, dt){ const tau = 1/(2*Math.PI*cutoff); return 1/(1 + tau/dt); }
  filter(x, t){
    if (this.xPrev === null){ this.xPrev = x; this.tPrev = t; return x; }
    const dt = Math.max(1e-3, (t - this.tPrev)/1000); this.tPrev = t;
    const dx = (x - this.xPrev)/dt;
    const aD = this._a(this.dCutoff, dt);
    this.dxPrev = aD*dx + (1-aD)*this.dxPrev;
    const a = this._a(this.minCutoff + this.beta*Math.abs(this.dxPrev), dt);
    return (this.xPrev = a*x + (1-a)*this.xPrev);
  }
  reset(){ this.xPrev = null; this.dxPrev = 0; }
}
const fx = new OneEuro(), fy = new OneEuro();
derive();

/* ------------------------------------------------------------------- UI */
const say = (t, keep) => {
  if (!statusEl) return;
  if (!t) return statusEl.classList.remove('on');
  statusEl.textContent = t; statusEl.classList.add('on');
  clearTimeout(statusEl._t);
  if (!keep) statusEl._t = setTimeout(() => statusEl.classList.remove('on'), 1800);
};
const setCursor = c => { cursor.classList.remove('pinch','click','scroll'); if (c) cursor.classList.add(c); };

/* --------------------------------------------------------- Lazy loading */
const loadScript = src => new Promise((res, rej) => {
  if (document.querySelector(`script[src="${src}"]`)) return res();
  const s = document.createElement('script');
  s.src = src; s.crossOrigin = 'anonymous';
  s.onload = res; s.onerror = () => rej(new Error('CDN yuklanmadi'));
  document.head.appendChild(s);
});

let ready = null;
function ensureHands(){
  return ready ||= (async () => {
    await loadScript(`${CDN}/hands.js`);
    if (typeof window.Hands !== 'function') throw new Error('MediaPipe topilmadi');
    const h = new window.Hands({ locateFile: f => `${CDN}/${f}` });
    h.setOptions({ maxNumHands:1, modelComplexity:0,
      minDetectionConfidence:0.5, minTrackingConfidence:0.5, selfieMode:true });
    h.onResults(onResults);
    try { const c = document.createElement('canvas'); c.width = c.height = 32; await h.send({ image:c }); } catch {}
    return h;
  })();
}

async function startCam(){
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Brauzer kamerani qo\'llamaydi');
  const v = document.createElement('video');
  v.playsInline = true; v.muted = true; v.autoplay = true;
  Object.assign(v.style,{position:'fixed',top:'-9999px',left:'-9999px',width:'320px',opacity:'0',pointerEvents:'none'});
  document.body.appendChild(v);
  S.stream = await navigator.mediaDevices.getUserMedia({ audio:false,
    video:{ width:{ideal:320,max:640}, height:{ideal:240,max:480}, facingMode:'user', frameRate:{ideal:24,max:30} }});
  v.srcObject = S.stream; await v.play(); S.video = v;
}
function stopCam(){
  S.stream?.getTracks().forEach(t => t.stop()); S.stream = null;
  if (S.video){ try{S.video.pause();}catch{} S.video.srcObject=null; S.video.remove(); S.video=null; }
}

/* -------------------------------------------------------- Gesture math */
const d2 = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);
const d3 = (a,b) => Math.hypot(a.x-b.x, a.y-b.y, ((a.z??0)-(b.z??0))*0.4);

function detect(lm){
  const size = Math.max(0.001, d2(lm[0], lm[9]));   // wrist → middle knuckle
  const pinchN = d3(lm[4], lm[8]) / size;           // thumb tip ↔ index tip
  const pinch = S.pinch ? pinchN < CFG.pinchOff : pinchN < CFG.pinchOn;
  return { pinch, pinchN };
}

function onResults(r){
  const lm = r.multiHandLandmarks?.[0];
  if (!lm){
    S.hasHand = false;
    if (S.pinch) releasePinch(true);   // hand vanished → release cleanly
    S.pinch = false;
    cursor.classList.remove('on');
    fx.reset(); fy.reset();
    return;
  }
  const firstSight = !S.hasHand;
  S.hasHand = true;
  const g = detect(lm);

  /* ALWAYS the index fingertip. Switching to the thumb/index midpoint while
     pinched is what used to teleport the cursor and eat every click. */
  const a = lm[8];

  const map = v => clamp((v - 0.5) * CFG.gain + 0.5, 0, 1);
  const now = performance.now();
  S.tx = fx.filter(map(a.x)*innerWidth,  now) + S.offX;
  S.ty = fy.filter(map(a.y)*innerHeight, now) + S.offY;

  // A hand appearing mid-frame must not drag the cursor across the screen.
  if (firstSight){ S.x = S.tx; S.y = S.ty; }

  if (g.pinch && !S.pinch) pressPinch();
  if (!g.pinch && S.pinch) releasePinch(false);
  S.pinch = g.pinch;
}

/* ---------------------------------------------------------- Mouse events */
/* Both pointer* and mouse* events, because modern UI code listens to either
   and a synthetic click on the wrong family silently does nothing. */
const PTR = { pointerId:1, pointerType:'mouse', isPrimary:true, width:1, height:1, pressure:0.5 };

const fire = (type, x, y, el) => {
  const t = el || document.elementFromPoint(x, y) || document.body;
  const buttons = (type === 'mouseup' || type === 'click' || type === 'pointerup') ? 0 : 1;
  const base = { view:window, bubbles:true, cancelable:true, clientX:x, clientY:y, button:0, buttons };
  const ptrType = { mousedown:'pointerdown', mouseup:'pointerup', mousemove:'pointermove' }[type];
  if (ptrType && window.PointerEvent){
    t.dispatchEvent(new PointerEvent(ptrType, { ...base, ...PTR, pressure: buttons ? 0.5 : 0 }));
  }
  t.dispatchEvent(new MouseEvent(type, base));
  return t;
};

/* Fingers touched → press the button down immediately. Whether this turns
   out to be a click, a long-press or a scroll is decided on release. */
function pressPinch(){
  /* Freeze the cursor where it already is. Curling the index toward the
     thumb moves the fingertip by real centimetres; without this the press
     point and the release point differ and the tap never registers. */
  S.offX += S.x - S.tx;
  S.offY += S.y - S.ty;
  S.tx = S.x; S.ty = S.y;

  S.downAt = performance.now();
  S.downX = S.x; S.downY = S.y;
  S.lastY = S.y; S.movedMax = 0;
  S.holding = true; S.swiping = false;
  S.target = fire('mousedown', S.x, S.y);
  setCursor('pinch');
}

function releasePinch(lost){
  // Do NOT zero the offset here: that would snap the cursor back to the raw
  // fingertip in one frame, right under the user's eyes. step() decays it to
  // zero over ~half a second once the fingers are apart.
  if (!S.holding){ setCursor(null); return; }
  const dur   = performance.now() - S.downAt;
  const moved = Math.hypot(S.x - S.downX, S.y - S.downY);

  fire('mouseup', S.x, S.y, S.target);

  // Quick tap that didn't wander → a click.
  if (!lost && !S.swiping && dur <= CFG.tapMaxMs && moved <= CFG.tapMaxPx){
    const el = document.elementFromPoint(S.x, S.y) || S.target;
    fire('click', S.x, S.y, el);
    if (el && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(el.tagName)) { try{ el.focus(); }catch{} }
    say('✓ Click');
    setCursor('click');
    setTimeout(() => setCursor(null), 180);
  } else {
    setCursor(null);
  }
  S.holding = false; S.swiping = false; S.target = null;
}

/* ---------------------------------------------------- Scrolling a region
   The page isn't the only scroller — the admin sheet and the mobile menu
   scroll internally. Walk up from the cursor and drive whatever is actually
   scrollable there, or fall back to the window. */
function scrollerAt(x, y){
  let el = document.elementFromPoint(x, y);
  while (el && el !== document.body && el !== document.documentElement){
    const st = getComputedStyle(el);
    const can = /(auto|scroll|overlay)/.test(st.overflowY);
    if (can && el.scrollHeight > el.clientHeight + 2) return el;
    el = el.parentElement;
  }
  return null;
}

function doScroll(dy){
  const d = clamp(dy * CFG.scrollGain, -CFG.scrollClamp, CFG.scrollClamp);
  const el = S.scroller;
  // 'instant', NOT 'auto' — 'auto' inherits html{scroll-behavior:smooth} and
  // each frame's animation cancels the last, so the page never moves.
  if (el) el.scrollBy({ top: -d, behavior:'instant' });
  else scrollBy({ top: -d, behavior:'instant' });   // hand up ⇒ content up
}

/* ------------------------------------------------------------ RAF loops */
/* One frame of cursor/gesture work. Split out from the RAF loop so tests
   can drive it deterministically instead of relying on a fake stub. */
function step(){
  if (S.hasHand){
    // Bleed the pinch freeze-offset away while the fingers are apart, so the
    // cursor eases back to true absolute pointing instead of snapping.
    if (!S.holding && (S.offX || S.offY)){
      S.offX *= 0.90; S.offY *= 0.90;
      if (Math.abs(S.offX) < 0.5) S.offX = 0;
      if (Math.abs(S.offY) < 0.5) S.offY = 0;
    }
    // The offset must never park the cursor outside the window.
    S.x = clamp(S.tx, 0, innerWidth  - 1);
    S.y = clamp(S.ty, 0, innerHeight - 1);
    cursor.style.transform = `translate3d(${S.x}px, ${S.y}px, 0)`;
    cursor.classList.add('on');

    if (S.holding){
      const moved = Math.hypot(S.x - S.downX, S.y - S.downY);
      S.movedMax = Math.max(S.movedMax, moved);

      // Held + moving vertically → scroll.
      if (!S.swiping && Math.abs(S.y - S.downY) > CFG.swipeMinPx){
        S.swiping = true;
        S.scroller = scrollerAt(S.downX, S.downY);
        setCursor('scroll'); say('Scroll', true);
      }
      if (S.swiping){
        const dy = S.y - S.lastY;
        if (Math.abs(dy) > 0.4){ doScroll(dy); S.lastY = S.y; }
      } else {
        // Held still → keep dragging (sliders, drags) under the cursor.
        fire('mousemove', S.x, S.y, S.target);
      }
    } else {
      fire('mousemove', S.x, S.y);
    }
  } else cursor.classList.remove('on');
}

function tick(){
  if (!S.on) return;
  step();
  S.raf = requestAnimationFrame(tick);
}

async function pump(ts){
  if (!S.on) return;
  if (S.video?.readyState >= 2 && !S.inFlight && (ts||0) - S.lastSend >= 1000/CFG.fps){
    S.lastSend = ts || performance.now();
    S.inFlight = true;
    try { await S.hands.send({ image:S.video }); } catch {}
    S.inFlight = false;
  }
  if (S.on) requestAnimationFrame(pump);
}

/* --------------------------------------------------------- Activation */
async function start(){
  if (S.on || S.loading) return;
  S.loading = true; fab.classList.add('loading'); say('Yuklanmoqda…', true);
  try {
    const [h] = await Promise.all([ ensureHands(), startCam() ]);
    S.hands = h; S.on = true; S.loading = false;
    fab.classList.remove('loading'); fab.classList.add('on','live');
    say('Tez tekkiz = click · ushlab tur = bosib turish · ushlab ko\'tar = scroll', true);
    setTimeout(() => say(''), 5000);
    S.offX = S.offY = 0;
    fx.reset(); fy.reset();
    requestAnimationFrame(tick); requestAnimationFrame(pump);
  } catch(e){
    console.warn('hand-control:', e);
    S.loading = false; S.on = false;
    fab.classList.remove('loading','on','live'); fab.classList.add('err');
    say(e?.name === 'NotAllowedError' ? 'Kameraga ruxsat berilmadi'
      : e?.name === 'NotFoundError'  ? 'Kamera topilmadi'
      : (e?.message || 'Xatolik'), true);
    stopCam();
  }
}
function stop(){
  if (S.holding) releasePinch(true);
  S.on = false; cancelAnimationFrame(S.raf);
  cursor.classList.remove('on'); setCursor(null);
  S.pinch = S.swiping = S.holding = false;
  S.offX = S.offY = 0;
  try { S.hands?.reset(); } catch {}
  stopCam();
  fab.classList.remove('on','live','err');
  say('Qo\'l boshqaruvi o\'chirildi');
}

fab.addEventListener('click', () => (S.on || S.loading) ? stop() : start());
document.addEventListener('visibilitychange', () => { if (document.hidden && S.on) stop(); });

window.__hand = { S, CFG, settings, start, stop, detect, OneEuro,
  set(key, val){
    if (!(key in DEFAULTS) || typeof val !== 'number' || !isFinite(val)) return;
    settings[key] = val; derive(); persist();
  },
  reset(){ Object.assign(settings, DEFAULTS); derive(); persist(); },
  _feed: lm => onResults({ multiHandLandmarks:[lm] }),
  _none: () => onResults({ multiHandLandmarks:[] }),
  _tick: step            // the real per-frame logic, not a stand-in
};
})();

/* ==========================================================================
   Hand control — MediaPipe Hands → virtual cursor
   --------------------------------------------------------------------------
   GESTURES (Vision-Pro style — as originally specified):

     • Index finger pointing            → cursor follows the fingertip
     • Quick tap (index touches thumb
       and releases fast)               → CLICK
     • Keep them touching               → mouse button stays HELD DOWN
                                          (long press / drag)
     • Hold them touching and raise or
       lower your hand                  → SWIPE / SCROLL

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

const CFG = {
  pinchOn:  0.42,   // thumb–index distance / hand-size → pinching
  pinchOff: 0.55,   // hysteresis so it can't flicker
  tapMaxMs: 350,    // released faster than this → it was a TAP (click)
  tapMaxPx: 45,     // …and it barely moved
  swipeMinPx: 26,   // held + moved this far vertically → swipe/scroll
  scrollGain: 3.2,
  scrollClamp: 90,
  fps: 24
};

const S = {
  on:false, loading:false, hands:null, video:null, stream:null,
  x: innerWidth/2, y: innerHeight/2, tx: innerWidth/2, ty: innerHeight/2,
  hasHand:false, pinch:false,
  downAt:0, downX:0, downY:0,   // where/when the pinch started
  holding:false,                // mouse button currently held
  swiping:false, lastY:0, movedMax:0,
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
    cursor.classList.remove('on');
    fx.reset(); fy.reset();
    return;
  }
  S.hasHand = true;
  const g = detect(lm);

  // While pinched, track the midpoint of thumb+index — that's where your
  // attention is. Otherwise track the index fingertip.
  const a = g.pinch
    ? { x:(lm[4].x+lm[8].x)/2, y:(lm[4].y+lm[8].y)/2 }
    : lm[8];

  const map = v => Math.min(1, Math.max(0, (v - 0.1)/0.8));
  const now = performance.now();
  S.tx = fx.filter(map(a.x)*innerWidth,  now);
  S.ty = fy.filter(map(a.y)*innerHeight, now);

  if (g.pinch && !S.pinch) pressPinch();
  if (!g.pinch && S.pinch) releasePinch(false);
  S.pinch = g.pinch;
}

/* ---------------------------------------------------------- Mouse events */
const mouse = (type, x, y, el) => {
  const t = el || document.elementFromPoint(x, y) || document.body;
  t.dispatchEvent(new MouseEvent(type, {
    view:window, bubbles:true, cancelable:true, clientX:x, clientY:y,
    button:0, buttons: (type === 'mouseup' || type === 'click') ? 0 : 1
  }));
  return t;
};

/* Fingers touched → press the button down immediately. Whether this turns
   out to be a click, a long-press or a swipe is decided on release. */
function pressPinch(){
  S.downAt = performance.now();
  S.downX = S.x; S.downY = S.y;
  S.lastY = S.y; S.movedMax = 0;
  S.holding = true; S.swiping = false;
  S.target = mouse('mousedown', S.x, S.y);
  setCursor('pinch');
}

function releasePinch(lost){
  if (!S.holding){ setCursor(null); return; }
  const dur   = performance.now() - S.downAt;
  const moved = Math.hypot(S.x - S.downX, S.y - S.downY);

  mouse('mouseup', S.x, S.y, S.target);

  // Quick tap that didn't wander → a click.
  if (!lost && !S.swiping && dur <= CFG.tapMaxMs && moved <= CFG.tapMaxPx){
    const el = document.elementFromPoint(S.x, S.y) || S.target;
    mouse('click', S.x, S.y, el);
    if (el && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(el.tagName)) { try{ el.focus(); }catch{} }
    say('✓ Click');
    setCursor('click');
    setTimeout(() => setCursor(null), 180);
  } else {
    setCursor(null);
  }
  S.holding = false; S.swiping = false; S.target = null;
}

/* ------------------------------------------------------------ RAF loops */
/* One frame of cursor/gesture work. Split out from the RAF loop so tests
   can drive it deterministically instead of relying on a fake stub. */
function step(){
  if (S.hasHand){
    S.x = S.tx; S.y = S.ty;
    cursor.style.transform = `translate3d(${S.x}px, ${S.y}px, 0)`;
    cursor.classList.add('on');

    if (S.holding){
      const moved = Math.hypot(S.x - S.downX, S.y - S.downY);
      S.movedMax = Math.max(S.movedMax, moved);

      // Held + moving vertically → swipe/scroll the page.
      if (!S.swiping && Math.abs(S.y - S.downY) > CFG.swipeMinPx){
        S.swiping = true; setCursor('scroll'); say('Swipe', true);
      }
      if (S.swiping){
        const dy = S.y - S.lastY;
        if (Math.abs(dy) > 0.4){
          const d = Math.max(-CFG.scrollClamp, Math.min(CFG.scrollClamp, dy * CFG.scrollGain));
          scrollBy({ top: -d, behavior:'auto' });   // hand up ⇒ content up
          S.lastY = S.y;
        }
      } else {
        // Held still → keep dragging (sliders, drags) under the cursor.
        mouse('mousemove', S.x, S.y, S.target);
      }
    } else {
      mouse('mousemove', S.x, S.y);
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
    say('Tez tekkiz = click · ushlab tur = bosib turish · ushlab ko\'tar = swipe', true);
    setTimeout(() => say(''), 5000);
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
  try { S.hands?.reset(); } catch {}
  stopCam();
  fab.classList.remove('on','live','err');
  say('Qo\'l boshqaruvi o\'chirildi');
}

fab.addEventListener('click', () => (S.on || S.loading) ? stop() : start());
document.addEventListener('visibilitychange', () => { if (document.hidden && S.on) stop(); });

window.__hand = { S, CFG, start, stop, detect, OneEuro,
  _feed: lm => onResults({ multiHandLandmarks:[lm] }),
  _none: () => onResults({ multiHandLandmarks:[] }),
  _tick: step            // the real per-frame logic, not a stand-in
};
})();

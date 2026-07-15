/* ==========================================================================
   Hand control — MediaPipe Hands → virtual cursor, click, scroll
   --------------------------------------------------------------------------
   Gestures:
     • Index finger pointing      → cursor follows fingertip
     • Thumb + index touch, 1 s   → click (progress ring shows the countdown)
     • Fist (all fingers closed)  → scroll; move hand up/down

   Performance notes:
     • MediaPipe (~2 MB wasm) is LAZY-LOADED — nothing downloads until the
       user actually clicks the hand button. Zero cost for normal visitors.
     • "Lite" model + 320×240 frames + 24 Hz in-flight-guarded pump.
     • Cursor is smoothed with a One Euro filter: responsive when the hand
       moves fast, rock-steady when it hovers. This is what makes it usable.
   The camera feed is never rendered — only the virtual cursor.
   ========================================================================== */
(() => {
'use strict';

const fab    = document.getElementById('handFab');
const cursor = document.getElementById('handCursor');
const statusEl = document.getElementById('handStatus');
const fill   = cursor?.querySelector('.hcursor__fill');
if (!fab || !cursor) return;

const CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands';
const RING_LEN = 2 * Math.PI * 21;   // matches r=21 in the CSS

const CFG = {
  pinchOn:  0.42,   // thumb–index distance / hand-size: below → pinching
  pinchOff: 0.55,   // hysteresis so it doesn't flicker
  holdMs:   1000,   // pinch must be held this long to click
  moveCancelPx: 70, // moving further than this cancels the click
  scrollGain: 3.4,
  scrollClamp: 90,
  fps: 24
};

const S = {
  on:false, loading:false, hands:null, video:null, stream:null,
  x: innerWidth/2, y: innerHeight/2,
  tx: innerWidth/2, ty: innerHeight/2,
  hasHand:false, fist:false, pinch:false,
  pinchStart:0, pinchX:0, pinchY:0, clicked:false,
  scrolling:false, lastScrollY:0,
  inFlight:false, lastSend:0, raf:null
};

/* ---------------------------------------------------------- One Euro filter
   Classic Casiez et al. filter. Low speed → heavy smoothing (no jitter);
   high speed → light smoothing (no lag). Far better than a fixed lerp. */
class OneEuro {
  constructor(minCutoff = 1.2, beta = 0.035, dCutoff = 1.0){
    this.minCutoff = minCutoff; this.beta = beta; this.dCutoff = dCutoff;
    this.xPrev = null; this.dxPrev = 0; this.tPrev = null;
  }
  _alpha(cutoff, dt){ const tau = 1/(2*Math.PI*cutoff); return 1/(1 + tau/dt); }
  filter(x, t){
    if (this.xPrev === null){ this.xPrev = x; this.tPrev = t; return x; }
    const dt = Math.max(1e-3, (t - this.tPrev)/1000);
    this.tPrev = t;
    const dx = (x - this.xPrev)/dt;
    const aD = this._alpha(this.dCutoff, dt);
    const dxHat = aD*dx + (1-aD)*this.dxPrev;
    this.dxPrev = dxHat;
    const cutoff = this.minCutoff + this.beta*Math.abs(dxHat);
    const a = this._alpha(cutoff, dt);
    const xHat = a*x + (1-a)*this.xPrev;
    this.xPrev = xHat;
    return xHat;
  }
  reset(){ this.xPrev = null; this.dxPrev = 0; this.tPrev = null; }
}
const fx = new OneEuro(), fy = new OneEuro();

/* ------------------------------------------------------------------- UI */
const say = (t, keep) => {
  if (!statusEl) return;
  if (!t) return statusEl.classList.remove('on');
  statusEl.textContent = t; statusEl.classList.add('on');
  clearTimeout(statusEl._t);
  if (!keep) statusEl._t = setTimeout(() => statusEl.classList.remove('on'), 2400);
};
const cursorState = c => {
  cursor.classList.remove('pinch','click','scroll');
  if (c) cursor.classList.add(c);
};
const progress = p => {
  if (fill) fill.style.strokeDashoffset = String(RING_LEN * (1 - p));
};

/* ------------------------------------------------------- Script loading */
const loadScript = src => new Promise((res, rej) => {
  if (document.querySelector(`script[src="${src}"]`)) return res();
  const s = document.createElement('script');
  s.src = src; s.crossOrigin = 'anonymous';
  s.onload = res; s.onerror = () => rej(new Error('CDN yuklanmadi'));
  document.head.appendChild(s);
});

let handsReady = null;
function ensureHands(){
  if (handsReady) return handsReady;
  handsReady = (async () => {
    await loadScript(`${CDN}/hands.js`);
    if (typeof window.Hands !== 'function') throw new Error('MediaPipe topilmadi');
    const h = new window.Hands({ locateFile: f => `${CDN}/${f}` });
    h.setOptions({
      maxNumHands: 1,
      modelComplexity: 0,          // lite model — ~3× faster
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      selfieMode: true
    });
    h.onResults(onResults);
    // Warm the wasm up with one tiny frame so the first real frame isn't slow
    try {
      const c = document.createElement('canvas'); c.width = c.height = 32;
      await h.send({ image: c });
    } catch(e){ /* non-fatal */ }
    return h;
  })();
  return handsReady;
}

/* ------------------------------------------------------------- Camera */
async function startCam(){
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Brauzer kamerani qo\'llamaydi');
  const v = document.createElement('video');
  v.playsInline = true; v.muted = true; v.autoplay = true;
  Object.assign(v.style, { position:'fixed', top:'-9999px', left:'-9999px', width:'320px', opacity:'0', pointerEvents:'none' });
  document.body.appendChild(v);
  S.stream = await navigator.mediaDevices.getUserMedia({
    audio:false,
    video:{ width:{ideal:320,max:640}, height:{ideal:240,max:480}, facingMode:'user', frameRate:{ideal:24,max:30} }
  });
  v.srcObject = S.stream; await v.play();
  S.video = v;
}
function stopCam(){
  S.stream?.getTracks().forEach(t => t.stop()); S.stream = null;
  if (S.video){ try{S.video.pause();}catch{} S.video.srcObject=null; S.video.remove(); S.video=null; }
}

/* ---------------------------------------------------------- Gesture math */
const d2 = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);
const d3 = (a,b) => Math.hypot(a.x-b.x, a.y-b.y, ((a.z??0)-(b.z??0))*0.4);

/* Curled = the PIP→TIP bone reverses direction vs the MCP→PIP bone.
   Orientation-independent, unlike "tip is below knuckle" heuristics. */
function curled(lm, tip, pip, mcp){
  const v1x = lm[pip].x - lm[mcp].x, v1y = lm[pip].y - lm[mcp].y;
  const v2x = lm[tip].x - lm[pip].x, v2y = lm[tip].y - lm[pip].y;
  const m1 = Math.hypot(v1x,v1y) || 1e-6, m2 = Math.hypot(v2x,v2y) || 1e-6;
  return ((v1x*v2x + v1y*v2y)/(m1*m2)) < 0.25;
}

function detect(lm){
  const size = Math.max(0.001, d2(lm[0], lm[9]));      // wrist → middle MCP
  const pinchN = d3(lm[4], lm[8]) / size;
  const iC = curled(lm, 8, 6, 5), mC = curled(lm, 12, 10, 9);
  const rC = curled(lm, 16, 14, 13), pC = curled(lm, 20, 18, 17);
  const fist = iC && mC && rC && pC;
  const pinch = S.pinch ? pinchN < CFG.pinchOff : pinchN < CFG.pinchOn;
  return { fist, pinch, pinchN };
}

function onResults(r){
  const lm = r.multiHandLandmarks?.[0];
  if (!lm){
    S.hasHand = false;
    if (S.scrolling) endScroll();
    if (S.pinch){ S.pinch = false; progress(0); cursorState(null); }
    cursor.classList.remove('on');
    fx.reset(); fy.reset();
    return;
  }
  S.hasHand = true;
  const g = detect(lm);

  // Anchor: palm centre while fisted (stops the cursor lurching when you
  // close your hand), fingertip otherwise.
  const a = g.fist ? lm[9] : lm[8];
  // 0.1–0.9 of the frame maps to the whole screen, so corners are reachable.
  const map = v => Math.min(1, Math.max(0, (v - 0.1)/0.8));
  const now = performance.now();
  S.tx = fx.filter(map(a.x) * innerWidth,  now);
  S.ty = fy.filter(map(a.y) * innerHeight, now);

  if (g.fist && !S.scrolling) startScroll();
  if (!g.fist && S.scrolling) endScroll();
  S.fist = g.fist;

  if (!g.fist){
    if (g.pinch && !S.pinch) startPinch();
    if (!g.pinch && S.pinch) endPinch();
    S.pinch = g.pinch;
  }
}

/* -------------------------------------------------------------- Actions */
function startScroll(){
  S.scrolling = true; S.lastScrollY = S.y;
  cursorState('scroll'); say('Musht · yuqori/pastga suring', true);
}
function endScroll(){ S.scrolling = false; cursorState(null); say(''); }

function startPinch(){
  S.pinchStart = performance.now();
  S.pinchX = S.x; S.pinchY = S.y; S.clicked = false;
  cursorState('pinch'); progress(0.02);
}
function endPinch(){ progress(0); cursorState(null); }

function fireClick(){
  S.clicked = true; progress(1); cursorState('click');
  const el = document.elementFromPoint(S.x, S.y) || document.body;
  const opt = { view:window, bubbles:true, cancelable:true, clientX:S.x, clientY:S.y, button:0 };
  el.dispatchEvent(new MouseEvent('mousedown', opt));
  el.dispatchEvent(new MouseEvent('mouseup', opt));
  el.dispatchEvent(new MouseEvent('click', opt));
  if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(el.tagName)) { try{ el.focus(); }catch{} }
  say('✓ Click');
  setTimeout(() => { cursorState(null); progress(0); }, 220);
}

/* ------------------------------------------------------------ RAF loops */
function tick(){
  if (!S.on) return;
  if (S.hasHand){
    S.x = S.tx; S.y = S.ty;                       // already filtered
    cursor.style.transform = `translate3d(${S.x}px, ${S.y}px, 0)`;
    cursor.classList.add('on');

    if (S.scrolling){
      const dy = S.y - S.lastScrollY;
      if (Math.abs(dy) > 0.4){
        const d = Math.max(-CFG.scrollClamp, Math.min(CFG.scrollClamp, dy * CFG.scrollGain));
        scrollBy({ top: d, behavior: 'auto' });
        S.lastScrollY = S.y;
      }
    } else {
      const el = document.elementFromPoint(S.x, S.y);
      el?.dispatchEvent(new MouseEvent('mousemove',
        { view:window, bubbles:true, clientX:S.x, clientY:S.y }));

      if (S.pinch && !S.clicked){
        const moved = Math.hypot(S.x - S.pinchX, S.y - S.pinchY);
        if (moved > CFG.moveCancelPx){ S.pinch = false; progress(0); cursorState(null); }
        else {
          const p = Math.min(1, (performance.now() - S.pinchStart)/CFG.holdMs);
          progress(p);
          if (p >= 1) fireClick();
        }
      }
    }
  } else cursor.classList.remove('on');
  S.raf = requestAnimationFrame(tick);
}

async function pump(ts){
  if (!S.on) return;
  const gap = 1000/CFG.fps;
  if (S.video?.readyState >= 2 && !S.inFlight && (ts||0) - S.lastSend >= gap){
    S.lastSend = ts || performance.now();
    S.inFlight = true;
    try { await S.hands.send({ image: S.video }); }
    catch(e){ /* transient */ }
    S.inFlight = false;
  }
  if (S.on) requestAnimationFrame(pump);
}

/* --------------------------------------------------------- Activation */
async function start(){
  if (S.on || S.loading) return;
  S.loading = true;
  fab.classList.add('loading');
  say('Yuklanmoqda…', true);
  try {
    const [h] = await Promise.all([ ensureHands(), startCam() ]);
    S.hands = h;
    S.on = true; S.loading = false;
    fab.classList.remove('loading');
    fab.classList.add('on','live');
    say('Ko\'rsatkich = kursor · musht = scroll · pinch 1s = click', true);
    setTimeout(() => say(''), 4500);
    fx.reset(); fy.reset();
    requestAnimationFrame(tick);
    requestAnimationFrame(pump);
  } catch(e){
    console.warn('hand-control:', e);
    S.loading = false; S.on = false;
    fab.classList.remove('loading','on','live');
    fab.classList.add('err');
    say(e?.name === 'NotAllowedError' ? 'Kameraga ruxsat berilmadi'
      : e?.name === 'NotFoundError'  ? 'Kamera topilmadi'
      : (e?.message || 'Xatolik'), true);
    stopCam();
  }
}

function stop(){
  S.on = false;
  cancelAnimationFrame(S.raf);
  cursor.classList.remove('on'); cursorState(null); progress(0);
  S.pinch = S.fist = S.scrolling = false;
  try { S.hands?.reset(); } catch {}
  stopCam();
  fab.classList.remove('on','live','err');
  say('Qo\'l boshqaruvi o\'chirildi');
}

fab.addEventListener('click', () => S.on || S.loading ? stop() : start());
document.addEventListener('visibilitychange', () => { if (document.hidden && S.on) stop(); });

/* Test surface */
window.__hand = { S, CFG, start, stop, detect, OneEuro,
  _feed: lm => onResults({ multiHandLandmarks:[lm] }),
  _none: () => onResults({ multiHandLandmarks:[] }),
  _tick: () => { const was = S.on; S.on = true; S.raf = 0;
                 if (S.hasHand){ S.x = S.tx; S.y = S.ty; } S.on = was; }
};
})();

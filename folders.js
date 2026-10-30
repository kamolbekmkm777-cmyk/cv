/* ==========================================================================
   folders.js — liquid-glass folder (vanilla port of "Glass Folder Cards").
   The artwork is generated, not fetched: a domain-warped noise field shaded
   as a liquid surface, painted once per recipe into a canvas over a few
   frames, shared between every folder that uses it.
   ========================================================================== */
(() => {
'use strict';

const ART_PRESETS = {
  // a long exposure: blush, oxblood and steel pulled across the frame
  aurora: {
    style: "streak",
    colors: ["#f4efe9", "#e9c2b8", "#c2433f", "#2a1e2a", "#22395e", "#6f97c2", "#e5edf4"],
    scale: 0.7,
    warp: 1.4,
    angle: -0.62,
    gloss: 0.18,
    veins: 0,
  },
  // red ink folding through teal-black water
  ember: {
    style: "marble",
    colors: ["#07090c", "#16252c", "#3d5f68", "#1a1416", "#a3201a", "#ef4a2b", "#ff8a5c"],
    scale: 0.62,
    warp: 3.2,
    angle: -0.5,
    gloss: 0.55,
    veins: 0.6,
  },
  // plum and rust, swirled
  dusk: {
    style: "marble",
    colors: ["#120c18", "#3e2850", "#8f6c9c", "#2b1a24", "#b3502f", "#eab08a", "#fbe7d2"],
    scale: 0.75,
    warp: 3.6,
    angle: 0.8,
    gloss: 0.5,
    veins: 0.5,
  },
  // cold, pale, nearly white
  glacier: {
    style: "streak",
    colors: ["#f7f8fa", "#d9e2ea", "#9fb4c7", "#e8edf2", "#bccbd8", "#ffffff"],
    scale: 0.7,
    warp: 1.6,
    angle: 0.35,
    gloss: 0.25,
    veins: 0,
  },
  // moss and brass
  verdant: {
    style: "marble",
    colors: ["#070b08", "#173024", "#4f7a5a", "#141812", "#a7843a", "#e9cf87", "#fbf3d6"],
    scale: 0.7,
    warp: 3.4,
    angle: 2.1,
    gloss: 0.5,
    veins: 0.5,
  },
}

/** `#rgb` or `#rrggbb` to a triple. Anything unreadable comes back mid-grey. */
function hexToRgb(hex) {
  let h = hex.trim().replace(/^#/, "")
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
  const n = /^[0-9a-f]{6}$/i.test(h) ? parseInt(h, 16) : 0x808080
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** A small, fast, seedable PRNG (mulberry32). */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A stable small integer for a string, so a file's art follows its name. */
function hashString(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Seeded gradient noise, summed into fractal octaves with a rotation between each. */
function makeFbm(seed) {
  const r = rng(seed)
  const perm = new Uint8Array(512)
  const grad = new Float32Array(512)
  const p = []
  for (let i = 0; i < 256; i++) p.push(i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    const t = p[i]
    p[i] = p[j]
    p[j] = t
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  for (let i = 0; i < 256; i++) {
    const a = r() * Math.PI * 2
    grad[i * 2] = Math.cos(a)
    grad[i * 2 + 1] = Math.sin(a)
  }
  const noise = (x, y) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const X = xi & 255
    const Y = yi & 255
    const h00 = perm[X + perm[Y]] * 2
    const h10 = perm[X + 1 + perm[Y]] * 2
    const h01 = perm[X + perm[Y + 1]] * 2
    const h11 = perm[X + 1 + perm[Y + 1]] * 2
    const d00 = grad[h00] * xf + grad[h00 + 1] * yf
    const d10 = grad[h10] * (xf - 1) + grad[h10 + 1] * yf
    const d01 = grad[h01] * xf + grad[h01 + 1] * (yf - 1)
    const d11 = grad[h11] * (xf - 1) + grad[h11 + 1] * (yf - 1)
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10)
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10)
    return d00 + u * (d10 - d00) + v * (d01 - d00 + u * (d11 - d01 - d10 + d00))
  }
  return (x, y, octaves) => {
    let sum = 0
    let amp = 0.5
    for (let i = 0; i < octaves; i++) {
      sum += amp * noise(x, y)
      const nx = 1.6 * x + 1.2 * y + 7.1
      y = -1.2 * x + 1.6 * y + 3.3
      x = nx
      amp *= 0.5
    }
    return sum
  }
}

/**
 * The artwork, as a job that can be spread over several frames.
 *
 * A field is domain-warped twice (each fold feeding the next), then
 * normalised by its own percentiles so every seed spans the whole palette.
 * The field is then treated as the height of a liquid surface: its slope
 * gives a normal, the normal gives diffuse light and a tight specular, and
 * fine striations run along the contours like combed ink. `streak` squeezes
 * the coordinates along one axis first, which turns the same folds into a
 * long-exposure smear.
 */
function createArtJob(width, height, recipe, seed) {
  const w = Math.max(1, Math.round(width))
  const h = Math.max(1, Math.round(height))
  const colors = recipe.colors.length >= 2 ? recipe.colors : ["#111111", "#eeeeee"]
  const stops = colors.map((c, i) => ({ t: i / (colors.length - 1), c: hexToRgb(c) }))
  const scale = recipe.scale ?? 0.7
  const warp = recipe.warp ?? 3
  const gloss = recipe.gloss ?? 0.4
  const veins = recipe.veins ?? 0
  const streak = recipe.style === "streak"
  const fbm = makeFbm(seed * 977 + 13)
  const r = rng(seed + 1)
  const ox = r() * 50
  const oy = r() * 50
  const angle = (recipe.angle ?? 0) + (r() - 0.5) * 0.5
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  const m = Math.min(w, h)
  // The field is sampled on a half-resolution grid (with a one-cell apron) and
  // brought up with Catmull-Rom, which keeps the slope continuous for the
  // lighting: a quarter of the noise for no visible loss.
  const gw = Math.ceil(w / 2) + 3
  const gh = Math.ceil(h / 2) + 3
  const G = new Float32Array(gw * gh)
  const GQ = new Float32Array(gw * gh)
  const F = new Float32Array(w * h)
  const Q = new Float32Array(w * h)
  const pixels = new Uint8ClampedArray(w * h * 4)
  let row = 0

  const field = (gy) => {
    for (let gx = 0; gx < gw; gx++) {
      const u = ((gx - 1) * 2 - w / 2) / m
      const v = ((gy - 1) * 2 - h / 2) / m
      let px = (u * ca - v * sa) * scale
      let py = (u * sa + v * ca) * scale
      if (streak) {
        px *= 0.14
        py *= 2.2
      }
      px += ox
      py += oy
      const qx = fbm(px, py, 3)
      const qy = fbm(px + 5.2, py + 1.3, 3)
      const rx = fbm(px + warp * qx + 1.7, py + warp * qy + 9.2, 3)
      const ry = fbm(px + warp * qx + 8.3, py + warp * qy + 2.8, 3)
      G[gy * gw + gx] = fbm(px + warp * rx, py + warp * ry, 4)
      GQ[gy * gw + gx] = Math.sqrt(qx * qx + qy * qy)
    }
  }

  const upsample = () => {
    // pixel x sits on grid column x/2 + 1: either exactly on a sample, or halfway
    const cr = (a, b, c, d) => (-a + 9 * b + 9 * c - d) / 16
    const T = new Float32Array(w * gh)
    for (let gy = 0; gy < gh; gy++) {
      const r = gy * gw
      for (let x = 0; x < w; x++) {
        const c = (x >> 1) + 1
        T[gy * w + x] = x & 1 ? cr(G[r + c - 1], G[r + c], G[r + c + 1], G[r + c + 2]) : G[r + c]
      }
    }
    for (let y = 0; y < h; y++) {
      const c = (y >> 1) + 1
      for (let x = 0; x < w; x++) {
        F[y * w + x] =
          y & 1 ? cr(T[(c - 1) * w + x], T[c * w + x], T[(c + 1) * w + x], T[(c + 2) * w + x]) : T[c * w + x]
        const gx = (x >> 1) + 1
        const q0 = GQ[c * gw + gx]
        const qx = x & 1 ? (q0 + GQ[c * gw + gx + 1]) / 2 : q0
        const q1 = y & 1 ? (x & 1 ? (GQ[(c + 1) * gw + gx] + GQ[(c + 1) * gw + gx + 1]) / 2 : GQ[(c + 1) * gw + gx]) : qx
        Q[y * w + x] = (qx + q1) / 2
      }
    }
  }

  const colorize = () => {
    // percentiles from a sample, not a full sort: cheap and just as stable
    const sample = []
    const stride = Math.max(1, Math.floor(F.length / 4096))
    for (let i = 0; i < F.length; i += stride) sample.push(F[i])
    sample.sort((a, b) => a - b)
    const lo = sample[Math.floor(sample.length * 0.02)]
    const hi = sample[Math.floor(sample.length * 0.98)]
    const k = 1 / (hi - lo || 1)
    const lx = -0.55
    const ly = -0.65
    const lz = 0.52
    const slope = k * m * 0.012
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        let t = (F[i] - lo) * k
        t = t < 0 ? 0 : t > 1 ? 1 : t
        let j = 1
        while (j < stops.length - 1 && stops[j].t < t) j++
        const a = stops[j - 1]
        const b = stops[j]
        let f = (t - a.t) / (b.t - a.t || 1)
        f = f < 0 ? 0 : f > 1 ? 1 : f
        f = f * f * (3 - 2 * f)
        const gx = (F[x < w - 1 ? i + 1 : i] - F[x > 0 ? i - 1 : i]) * slope
        const gy = (F[y < h - 1 ? i + w : i] - F[y > 0 ? i - w : i]) * slope
        const nd = (-gx * lx - gy * ly + lz) / Math.sqrt(gx * gx + gy * gy + 1)
        const spec = Math.pow(nd > 0 ? nd : 0, 24) * gloss * 255
        const silk = 1 + 0.035 * Math.sin(t * 150 + Q[i] * 24)
        const vein = veins * Math.max(0, 1 - Math.abs(Q[i] - 0.42) * 14) * 0.6
        const lit = (0.82 + 0.28 * nd) * silk * (1 - vein)
        pixels[i * 4] = (a.c[0] + (b.c[0] - a.c[0]) * f) * lit + spec
        pixels[i * 4 + 1] = (a.c[1] + (b.c[1] - a.c[1]) * f) * lit + spec
        pixels[i * 4 + 2] = (a.c[2] + (b.c[2] - a.c[2]) * f) * lit + spec
        pixels[i * 4 + 3] = 255
      }
    }
  }

  const step = (rows) => {
    if (row >= gh) return true
    const end = Math.min(gh, row + Math.max(1, rows))
    while (row < end) field(row++)
    if (row < gh) return false
    upsample()
    colorize()
    return true
  }

  return { width: w, height: h, pixels, step }
}

/** Where a file sits in the fan: -1 … 1 across the visible stack, 0 for one file. */
function fanSlot(index, count) {
  return count <= 1 ? 0 : (index / (count - 1)) * 2 - 1
}
// #endregion

const recipeOf = (art) => (typeof art === "string" ? ART_PRESETS[art] : art)

// ---------------------------------------------------------------------------
// One shared painter: every folder on the page queues its art here and the
// queue spends a few milliseconds a frame, so a row of folders never janks.

const artCache = new Map()
const queue = []
let pumping = false

function pump() {
  if (pumping) return
  pumping = true
  const tick = () => {
    const until = performance.now() + 7
    while (queue.length && performance.now() < until) {
      const head = queue[0]
      if (head.job.step(4)) {
        queue.shift()
        const c = document.createElement("canvas")
        c.width = head.job.width
        c.height = head.job.height
        c.getContext("2d")?.putImageData(new ImageData(head.job.pixels, c.width, c.height), 0, 0)
        head.done(c)
      }
    }
    if (queue.length) requestAnimationFrame(tick)
    else pumping = false
  }
  requestAnimationFrame(tick)
}

/** Lower priority paints first: back panels (0) before the files tucked behind glass (1). */
function paint(recipe, seed, w, h, priority) {
  const key = JSON.stringify([recipe, seed, w, h])
  let p = artCache.get(key)
  if (!p) {
    p = new Promise((done) => {
      // never jump the job already in progress
      let at = queue.length
      while (at > 1 && queue[at - 1].priority > priority) at--
      queue.splice(at, 0, { job: createArtJob(w, h, recipe, seed), priority, done })
      pump()
    })
    artCache.set(key, p)
  }
  return p
}

// ---------------------------------------------------------------------------
// Geometry, in the folder's own units. The stage is drawn at 340 × 272 and
// scaled to `width`, so the shapes can be fixed paths.

const W = 340
const H = 272
const HEADROOM = 54 // room above the back panel for the files to rise into
const FRONT_TOP = 74
const FRONT_H = H - FRONT_TOP
const SHEET_W = 272
const SHEET_H = 184

const BACK_PATH =
  "M0 56A22 22 0 0 1 22 34L146 34C170 34 172 0 198 0L318 0A22 22 0 0 1 340 22L340 250A22 22 0 0 1 318 272L22 272A22 22 0 0 1 0 250Z"
const FRONT_PATH =
  "M0 22A22 22 0 0 1 22 0L118 0C144 0 146 32 172 32L318 32A22 22 0 0 1 340 54L340 " +
  (FRONT_H - 22) +
  "A22 22 0 0 1 318 " +
  FRONT_H +
  "L22 " +
  FRONT_H +
  "A22 22 0 0 1 0 " +
  (FRONT_H - 22) +
  "Z"

const MAX_VISIBLE = 4
/* ---------------------------------------------------------------------------
   The folder itself, as plain DOM. Same three layers as the original: a back
   panel with the art, the files, and a frosted front panel hinged on its
   bottom edge. Rest → hover leans the glass → click opens and fans the files.
   ------------------------------------------------------------------------- */
const NS = 'http://www.w3.org/2000/svg';
let uidN = 0;

function h(tag, cls, attrs){
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function artCanvas(art, seed, w, h_, density, priority, cls){
  const c = document.createElement('canvas');
  c.className = cls; c.setAttribute('aria-hidden', 'true');
  c.style.width = w + 'px'; c.style.height = h_ + 'px'; c.style.maxWidth = 'none';
  const pw = Math.round(w * density), ph = Math.round(h_ * density);
  paint(recipeOf(art), seed, pw, ph, priority).then(src => {
    if (!c.isConnected && !c.parentNode) return;
    c.width = src.width; c.height = src.height;
    c.getContext('2d')?.drawImage(src, 0, 0);
    c.dataset.ready = '';
  });
  return c;
}

function createFolder(host, opts){
  const o = Object.assign({
    label: 'Folder', meta: '', tone: 'dark', art: 'aurora', seed: 3, image: '',
    files: [], labelPlacement: 'bottom-left', appear: true, appearDelay: 0,
    maxWidth: 360, moreLabel: 'More', onSelect: null, onMore: null, onOpenChange: null
  }, opts);
  const uid = 'gf' + (++uidN);
  let open = false, entered = !o.appear, width = 0;

  const root = h('div', 'gf-root');
  root.dataset.tone = o.tone;
  root.dataset.place = o.labelPlacement;
  const stage = h('div', 'gf-stage');
  const tilt = h('div', 'gf-tilt');
  stage.appendChild(tilt);
  root.appendChild(stage);

  tilt.appendChild(h('div', 'gf-shadow', { 'aria-hidden': 'true' }));

  const back = h('div', 'gf-back', { 'aria-hidden': 'true' });
  back.style.clipPath = `path('${BACK_PATH}')`;
  tilt.appendChild(back);

  const backRim = document.createElementNS(NS, 'svg');
  backRim.setAttribute('class', 'gf-rim gf-back-rim');
  backRim.setAttribute('viewBox', `0 0 ${W} ${H}`);
  backRim.setAttribute('aria-hidden', 'true');
  backRim.innerHTML = `<path d="${BACK_PATH}"/>`;
  tilt.appendChild(backRim);

  const front = h('div', 'gf-front');
  front.style.clipPath = `path('${FRONT_PATH}')`;
  front.innerHTML = `
    <div class="gf-tint" aria-hidden="true"></div>
    <div class="gf-spec" aria-hidden="true"></div>
    <svg class="gf-rim gf-front-rim" viewBox="0 0 ${W} ${FRONT_H}" aria-hidden="true">
      <defs><linearGradient id="${uid}-rim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0.95"/>
        <stop offset="0.35" stop-color="#fff" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0.12"/>
      </linearGradient></defs>
      <path d="${FRONT_PATH}" stroke="url(#${uid}-rim)"/>
    </svg>`;
  const hit = h('button', 'gf-hit', { type: 'button' });
  const labelEl = h('div', 'gf-label');
  const titleEl = h('span', 'gf-title');
  const metaEl = h('span', 'gf-meta');
  labelEl.append(titleEl, metaEl);
  front.append(hit, labelEl);
  tilt.appendChild(front);

  const filesEl = h('div', 'gf-files', { role: 'list' });
  tilt.appendChild(filesEl);

  const key = h('button', 'gf-key gf-key--more', { type: 'button' });
  key.innerHTML = `<svg class="gf-glyph gf-glyph--grid" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/>
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/></svg>`;
  tilt.appendChild(key);

  host.appendChild(root);

  const density = () => Math.min(1.5, Math.max(1, window.devicePixelRatio || 1)) * (width / W);

  function paintBack(){
    back.innerHTML = '';
    if (o.image){
      const im = h('img', 'gf-art', { src: o.image, alt: '', width: W + 24, height: H + 24, draggable: 'false' });
      back.appendChild(im);
    } else if (o.art !== 'none'){
      back.appendChild(artCanvas(o.art, o.seed, W + 24, H + 24, density(), 0, 'gf-art'));
    }
    back.appendChild(h('div', 'gf-back-sheen'));
  }

  function renderFiles(){
    filesEl.innerHTML = '';
    filesEl.setAttribute('aria-label', o.label);
    const start = Math.max(0, o.files.length - MAX_VISIBLE);
    const visible = o.files.slice(start);
    visible.forEach((file, v) => {
      const slot = fanSlot(v, visible.length);
      const jitter = rng(hashString(file.name) + start + v);
      const picture = !!(file.art || file.image || file.html);
      const wrap = h('div', 'gf-sheet-slot', { role: 'listitem' });
      const sheet = h(file.href ? 'a' : 'button', 'gf-sheet' + (picture ? ' gf-sheet--art' : '') + (file.cls ? ' ' + file.cls : ''));
      if (file.href){ sheet.href = file.href; sheet.target = '_blank'; sheet.rel = 'noopener'; }
      else sheet.type = 'button';
      sheet.style.setProperty('--gf-slot', slot);
      sheet.style.setProperty('--gf-depth', visible.length - 1 - v);
      sheet.style.setProperty('--gf-jx', ((jitter() - 0.5) * 10).toFixed(2) + 'px');
      sheet.style.setProperty('--gf-jr', ((jitter() - 0.5) * 3.2).toFixed(2) + 'deg');
      sheet.style.zIndex = v + 1;
      if (file.style) for (const k in file.style) sheet.style.setProperty(k, file.style[k]);
      if (file.html){
        const box = h('span', 'gf-sheet-custom');
        box.innerHTML = file.html;
        sheet.appendChild(box);
      } else if (file.image){
        sheet.appendChild(h('img', 'gf-sheet-art', { src: file.image, alt: '', width: SHEET_W, height: SHEET_H, draggable: 'false', decoding: 'async' }));
      } else if (file.art){
        sheet.appendChild(artCanvas(file.art, hashString(file.name) % 997, SHEET_W, SHEET_H, Math.min(density(), 1.25), 1, 'gf-sheet-art'));
      } else {
        const lines = h('span', 'gf-lines', { 'aria-hidden': 'true' });
        lines.innerHTML = ['86%','92%','64%','88%','42%'].map(w => `<i style="width:${w}"></i>`).join('');
        sheet.appendChild(lines);
      }
      const head = h('span', 'gf-sheet-head');
      const nm = h('span', 'gf-sheet-name'); nm.textContent = file.name;
      head.appendChild(nm);
      if (file.meta){ const mt = h('span', 'gf-sheet-meta'); mt.textContent = file.meta; head.appendChild(mt); }
      sheet.appendChild(head);
      sheet.addEventListener('click', e => {
        if (!open){ e.preventDefault(); setOpen(true); return; }
        o.onSelect?.(start + v, file, e);
      });
      wrap.appendChild(sheet);
      filesEl.appendChild(wrap);
    });
    filesEl.toggleAttribute('inert', !open);
  }

  function renderLabel(){
    titleEl.textContent = o.label;
    const count = o.files.length;
    metaEl.textContent = o.meta || (count + (count === 1 ? ' item' : ' items'));
    hit.setAttribute('aria-label', (open ? o.closeLabel || 'Close ' : o.openLabel || 'Open ') + o.label);
    key.setAttribute('aria-label', o.moreLabel);
    key.title = o.moreLabel;
  }

  function layout(){
    const avail = host.clientWidth || o.maxWidth;
    const next = Math.max(220, Math.min(o.maxWidth, avail));
    if (next === width) return;
    const first = !width;
    width = next;
    const k = width / W;
    root.style.width = width + 'px';
    root.style.height = (H + HEADROOM) * k + 'px';
    stage.style.transform = `translateY(${HEADROOM * k}px) scale(${k})`;
    if (first){ paintBack(); renderFiles(); }
  }

  function setOpen(next){
    open = !!next;
    root.toggleAttribute('data-open', open);
    hit.setAttribute('aria-expanded', String(open));
    filesEl.toggleAttribute('inert', !open);
    renderLabel();
    o.onOpenChange?.(open);
  }

  hit.addEventListener('click', () => setOpen(!open));
  key.addEventListener('click', e => { e.stopPropagation(); o.onMore?.(); });

  // Light and parallax follow the cursor; no layout, just two custom props.
  let raf = 0, px = 0, py = 0;
  const write = () => { raf = 0; root.style.setProperty('--gf-px', px.toFixed(3)); root.style.setProperty('--gf-py', py.toFixed(3)); };
  root.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    const r = root.getBoundingClientRect();
    px = ((e.clientX - r.left) / r.width) * 2 - 1;
    py = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (!raf) raf = requestAnimationFrame(write);
  });
  root.addEventListener('pointerleave', () => { px = 0; py = 0; if (!raf) raf = requestAnimationFrame(write); });

  const onKey = e => { if (e.key === 'Escape' && open){ setOpen(false); hit.focus(); } };
  const onDown = e => { if (open && !root.contains(e.target)) setOpen(false); };
  document.addEventListener('keydown', onKey);
  document.addEventListener('pointerdown', onDown);

  // Assemble the first time it scrolls into view.
  let io = null, t = 0;
  if (!entered && 'IntersectionObserver' in window){
    io = new IntersectionObserver(es => {
      if (!es.some(x => x.isIntersecting)) return;
      io.disconnect(); io = null;
      t = setTimeout(() => root.setAttribute('data-entered', ''), o.appearDelay);
    }, { threshold: 0.2 });
    io.observe(root);
  } else root.setAttribute('data-entered', '');

  const ro = 'ResizeObserver' in window ? new ResizeObserver(layout) : null;
  ro?.observe(host);
  layout();
  renderLabel();
  setOpen(false);

  return {
    el: root,
    get open(){ return open; },
    setOpen,
    update(next){
      const repaint = next.art !== undefined && JSON.stringify(next.art) !== JSON.stringify(o.art)
                   || next.image !== undefined && next.image !== o.image
                   || next.seed !== undefined && next.seed !== o.seed;
      Object.assign(o, next);
      if (next.tone) root.dataset.tone = next.tone;
      if (repaint) paintBack();
      if (next.files) renderFiles();
      renderLabel();
    },
    destroy(){
      io?.disconnect(); ro?.disconnect(); clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      root.remove();
    }
  };
}

window.GlassFolder = { create: createFolder, presets: ART_PRESETS };
})();

/* ==========================================================================
   glass-text.js — the hero name as liquid glass.
   The letters are a lens: a signed-distance field of the real laid-out text
   becomes a height field; the background video is sampled through it with
   refraction, then lit like the app bar's water drop (bright rim, iridescent
   fresnel, specular that follows the cursor, a soft shadow under the glass).
   The DOM text stays (selectable, readable by screen readers) — it just turns
   transparent while the glass is drawn.

   One WebGL context serves every glass heading on the page: it renders each
   one into a corner of its own buffer and copies that into the heading's 2D
   canvas, so ten headings never exhaust the browser's context limit.
   When the video's pixels can't be read (file://, a host without CORS) the
   still poster — the loop's first frame — is refracted instead. No WebGL2 at
   all → a CSS glass look.
   ========================================================================== */
(() => {
'use strict';

const PAD = 26            // css px of canvas around the text block (rim, shadow)


/* Exact signed distance (css px, negative inside) of an alpha mask. */
function sdfFromMask(alpha, W, H, dpr) {
  const n = W * H, INF = 1e20
  const outer = new Float64Array(n), inner = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    // Solid letters: glyphs built from overlapping contours rasterise with
    // faint seams where the pieces meet; those would read as lines in glass.
    const a = alpha[i * 4 + 3] >= 90 ? 1 : 0
    if (a >= 1) { outer[i] = 0; inner[i] = INF }
    else if (a <= 0) { outer[i] = INF; inner[i] = 0 }
    else { const d = 0.5 - a; outer[i] = d > 0 ? d * d : 0; inner[i] = d < 0 ? d * d : 0 }
  }
  const N = Math.max(W, H)
  const f = new Float64Array(N), z = new Float64Array(N + 1), v = new Uint16Array(N)
  edt2(outer, W, H, f, v, z, INF); edt2(inner, W, H, f, v, z, INF)
  const out = new Float32Array(n)
  for (let i = 0; i < n; i++) out[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / dpr
  return out
}
function edt2(grid, W, H, f, v, z, INF) {
  for (let x = 0; x < W; x++) edt1(grid, x, W, H, f, v, z, INF)
  for (let y = 0; y < H; y++) edt1(grid, y * W, 1, W, f, v, z, INF)
}
function edt1(grid, offset, stride, len, f, v, z, INF) {
  v[0] = 0; z[0] = -INF; z[1] = INF; f[0] = grid[offset]
  for (let q = 1, k = 0, s = 0; q < len; q++) {
    f[q] = grid[offset + q * stride]
    const q2 = q * q
    do { const r = v[k]; s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2 } while (s <= z[k] && --k > -1)
    k++; v[k] = q; z[k] = s; z[k + 1] = INF
  }
  for (let q = 0, k = 0; q < len; q++) {
    while (z[k + 1] < q) k++
    const r = v[k], qr = q - r
    grid[offset + q * stride] = f[r] + qr * qr
  }
}

const VERT = `#version 300 es
in vec2 aPos; void main(){ gl_Position = vec4(aPos, 0., 1.); }`

const FRAG = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uSdf;     // css px, negative inside
uniform sampler2D uBg;      // the video frame (or its poster)
uniform vec2 uSize;         // canvas, device px
uniform float uDpr;
uniform vec4 uRect;         // canvas rect in the viewport, css px
uniform vec4 uCover;        // where the background image sits: x, y, w, h (css px)
uniform float uOp;          // opacity of the background media layer
uniform vec3 uBase;         // page colour under it
uniform vec2 uMouse;        // css px, canvas space
uniform float uMouseOn;
uniform float uTime;
uniform float uBevel;       // css px over which an edge rounds into the face

float S(vec2 fc){ return texture(uSdf, fc / uSize).r; }
vec3 bgAt(vec2 view){
  vec2 uv = clamp((view - uCover.xy) / uCover.zw, 0.0, 1.0);
  return texture(uBg, uv).rgb * uOp + uBase * (1.0 - uOp);
}

void main(){
  vec2 fc = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);   // device px, y down
  float d = S(fc);
  vec2 p = fc / uDpr;                                          // css px, canvas space
  vec2 view = uRect.xy + p;

  // soft shadow that the glass casts just below itself
  float ds = S(fc - vec2(0.0, 5.0 * uDpr));
  float shadow = smoothstep(9.0, -3.0, ds) * 0.32;

  float cov = clamp(0.5 - d * uDpr, 0.0, 1.0);
  if (cov <= 0.0) { o = vec4(0.0, 0.0, 0.0, shadow); return; }

  // height: a quarter-round bevel that flattens into the face
  float t = clamp(-d / uBevel, 0.0, 1.0);
  float hgt = sqrt(1.0 - (1.0 - t) * (1.0 - t));
  vec2 e = vec2(uDpr, 0.0);
  vec2 g = vec2(S(fc + e.xy) - S(fc - e.xy), S(fc + e.yx) - S(fc - e.yx)) * 0.5;   // css px per css px
  float slope = t < 1.0 ? (1.0 - t) / max(hgt, 0.08) / uBevel : 0.0;
  vec3 n = normalize(vec3(g * slope * uBevel * 1.6, 1.0));

  // refraction: the rim bends the scene inward, the face barely moves it
  vec2 off = -n.xy * 26.0 * (1.0 - 0.6 * hgt);
  vec2 q = view + off;
  vec3 c = bgAt(q) * 0.36
         + (bgAt(q + vec2(2.5, 0.0)) + bgAt(q - vec2(2.5, 0.0)) + bgAt(q + vec2(0.0, 2.5)) + bgAt(q - vec2(0.0, 2.5))) * 0.16;
  // a clear, slightly milky glass body — like the bar's water drop
  c = mix(c * 1.1, vec3(1.0), 0.10) + vec3(0.02, 0.03, 0.045);

  // soft light gathered along the rounded edge (no hard outline)
  float edge = 1.0 - t;
  c = mix(c, vec3(1.0), edge * edge * 0.30);

  // gentle iridescence where the surface turns steep
  float fres = clamp((1.0 - n.z) * 2.2, 0.0, 1.0);
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + fres * 0.85 + view.x * 0.0028 + uTime * 0.035));
  c = mix(c, irid, fres * 0.16);

  // the drop's bright crescent on the lower edge, and a key light top-left
  float cres = smoothstep(0.12, 0.6, dot(n.xy, normalize(vec2(0.55, 0.85)))) * edge;
  vec3 V = vec3(0.0, 0.0, 1.0);
  float spec = pow(max(dot(reflect(-normalize(vec3(-0.45, -0.8, 0.85)), n), V), 0.0), 32.0);
  vec2 m = p - uMouse;
  vec3 Lm = normalize(vec3(-m / 260.0, 0.9));
  float specM = pow(max(dot(reflect(-Lm, n), V), 0.0), 24.0) * uMouseOn;
  c += vec3(cres * 0.38 + spec * 0.75 + specM * 0.45);

  c = clamp(c, 0.0, 1.0);
  float a = cov + shadow * (1.0 - cov);
  o = vec4(c * cov, a);
}`


/* ------------------------------------------------------------ shared GL */
let G = null
function gl0() {
  if (G !== null) return G
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: true })
  if (!gl) return (G = false)
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s }
  const prog = gl.createProgram()
  try { gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)) }
  catch (e) { console.warn('glass text', e); return (G = false) }
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return (G = false)
  gl.useProgram(prog)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const U = {}
  for (const k of ['uSdf', 'uBg', 'uSize', 'uDpr', 'uRect', 'uCover', 'uOp', 'uBase', 'uMouse', 'uMouseOn', 'uTime', 'uBevel']) U[k] = gl.getUniformLocation(prog, k)
  const bgTex = gl.createTexture()
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bgTex); params(gl)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 26, 34, 255]))
  gl.uniform1i(U.uSdf, 0); gl.uniform1i(U.uBg, 1)
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); items.forEach(it => toCss(it)); items.clear(); G = false })
  return (G = { canvas, gl, U, bgTex })
}
function params(gl) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
}

/* ------------------------------------------------------- the background */
const bg = { media: null, video: null, poster: null, w: 1280, h: 720, videoBlocked: false, posterReady: false }
function uploadBg() {
  const { gl, bgTex } = G
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bgTex)
  const v = bg.video
  if (v && !bg.videoBlocked && v.classList.contains('on') && v.readyState >= 2 && v.videoWidth) {
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v)
      bg.w = v.videoWidth; bg.h = v.videoHeight
      return
    } catch (e) { bg.videoBlocked = true }        // file:// or no CORS: stay on the poster
  }
  if (bg.poster && bg.poster.naturalWidth && !bg.posterReady) {
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bg.poster)
      bg.w = bg.poster.naturalWidth; bg.h = bg.poster.naturalHeight; bg.posterReady = true
    } catch (e) { bg.posterReady = true }
  }
}
const videoMoving = () => !!(bg.video && !bg.videoBlocked && !bg.video.paused && bg.video.classList.contains('on'))

/* ---------------------------------------------------------- the items */
const items = new Set()
const mouse = { x: -1e4, y: -1e4, inside: false }
let raf = 0, last = 0, time = 0
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

function toCss(it) {
  it.dead = true
  it.canvas.remove()
  it.el.classList.remove('gtext-on')
  it.el.classList.add('gtext-css')
}

/* draw every glyph exactly where the browser laid it out, then its SDF */
function build(it) {
  const el = it.el
  const r = el.getBoundingClientRect()
  if (!r.width || !r.height) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cw = r.width + PAD * 2, ch = r.height + PAD * 2
  const W = Math.round(cw * dpr), H = Math.round(ch * dpr)
  it.canvas.width = W; it.canvas.height = H
  it.canvas.style.width = cw + 'px'; it.canvas.style.height = ch + 'px'
  it.canvas.style.left = (el.offsetLeft - PAD) + 'px'
  it.canvas.style.top = (el.offsetTop - PAD) + 'px'
  const cs = getComputedStyle(el)
  const size = parseFloat(cs.fontSize)
  it.bevel = Math.max(4, Math.min(11, size * 0.13))
  const c2 = document.createElement('canvas'); c2.width = W; c2.height = H
  const ctx = c2.getContext('2d', { willReadFrequently: true })
  ctx.scale(dpr, dpr)
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#fff'
  const asc = ctx.measureText('Hg').fontBoundingBoxAscent || size * 0.8
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const s = node.textContent
    for (let i = 0; i < s.length; i++) {
      if (/\s/.test(s[i])) continue
      range.setStart(node, i); range.setEnd(node, i + 1)
      const b = range.getBoundingClientRect()
      if (!b.width) continue
      ctx.fillText(s[i], b.left - r.left + PAD, b.top - r.top + PAD + asc)
    }
  }
  const sdf = sdfFromMask(ctx.getImageData(0, 0, W, H).data, W, H, dpr)
  const { gl } = G
  if (!it.sdfTex) { it.sdfTex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, it.sdfTex); params(gl) }
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, it.sdfTex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, W, H, 0, gl.RED, gl.FLOAT, sdf)
  Object.assign(it, { W, H, dpr, ready: true })
  el.classList.add('gtext-on')
  frame(performance.now(), true)
}

function render(it) {
  const { gl, U, canvas } = G
  if (canvas.width < it.W || canvas.height < it.H) {
    canvas.width = Math.max(canvas.width, it.W); canvas.height = Math.max(canvas.height, it.H)
  }
  const r = it.canvas.getBoundingClientRect()
  const vw = innerWidth, vh = innerHeight
  const k = Math.max(vw / bg.w, vh / bg.h), dw = bg.w * k, dh = bg.h * k
  const op = bg.media ? parseFloat(getComputedStyle(bg.media).opacity) || 1 : 1
  const mx = mouse.x - r.left, my = mouse.y - r.top
  const near = mouse.inside && mx > -240 && my > -240 && mx < r.width + 240 && my < r.height + 240 ? 1 : 0
  it.mouseOn += (near - it.mouseOn) * 0.18
  gl.viewport(0, 0, it.W, it.H)
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, it.sdfTex)
  gl.uniform2f(U.uSize, it.W, it.H)
  gl.uniform1f(U.uDpr, it.dpr)
  gl.uniform4f(U.uRect, r.left, r.top, r.width, r.height)
  gl.uniform4f(U.uCover, (vw - dw) / 2, (vh - dh) / 2, dw, dh)
  gl.uniform1f(U.uOp, op)
  gl.uniform3f(U.uBase, 8 / 255, 8 / 255, 10 / 255)
  gl.uniform2f(U.uMouse, mx, my)
  gl.uniform1f(U.uMouseOn, it.mouseOn)
  gl.uniform1f(U.uTime, time)
  gl.uniform1f(U.uBevel, it.bevel)
  gl.enable(gl.SCISSOR_TEST); gl.scissor(0, 0, it.W, it.H)
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.disable(gl.SCISSOR_TEST)
  // the result sits in the buffer's bottom-left corner; canvas y runs down
  it.ctx.clearRect(0, 0, it.W, it.H)
  it.ctx.drawImage(canvas, 0, canvas.height - it.H, it.W, it.H, 0, 0, it.W, it.H)
  return Math.abs(near - it.mouseOn) > 0.01
}

function frame(now, once) {
  if (!once) raf = 0
  if (!G) return
  const dt = Math.min((now - last) / 1000, 0.1); last = now; time += dt
  uploadBg()
  let busy = false
  for (const it of items) if (it.ready && !it.dead && it.visible) busy = render(it) || busy
  if (once) return
  const anyVisible = [...items].some(it => it.visible && it.ready)
  if (anyVisible && !document.hidden && !reduce && (videoMoving() || busy)) raf = requestAnimationFrame(frame)
}
function kick() { if (!raf && G) { last = performance.now(); raf = requestAnimationFrame(frame) } }

let wired = false
function wireOnce() {
  if (wired) return
  wired = true
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; mouse.x = e.clientX; mouse.y = e.clientY; mouse.inside = true; kick() }, { passive: true })
  document.addEventListener('pointerleave', () => { mouse.inside = false; kick() })
  addEventListener('scroll', () => { if (!raf) frame(performance.now(), true) }, { passive: true })
  document.addEventListener('visibilitychange', kick)
  bg.video?.addEventListener('playing', kick)
}

function mount(el, opts) {
  const o = opts || {}
  if (o.media) bg.media = o.media
  if (o.video) bg.video = o.video
  if (o.poster && !bg.poster) { bg.poster = new Image(); bg.poster.onload = () => { bg.posterReady = false; frame(performance.now(), true) }; bg.poster.src = o.poster }
  const canvas = document.createElement('canvas')
  canvas.className = 'gtext-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  const it = { el, canvas, ctx: canvas.getContext('2d'), sdfTex: null, W: 0, H: 0, dpr: 1, bevel: 6, ready: false, dead: false, visible: false, mouseOn: 0 }
  if (!gl0()) { toCss(it); return { destroy() { el.classList.remove('gtext-css') }, refresh() {} } }
  wireOnce()
  // a sibling, not a child: the page rewrites headings with textContent
  if (getComputedStyle(el.parentElement).position === 'static') el.parentElement.style.position = 'relative'
  el.insertAdjacentElement('afterend', canvas)
  items.add(it)
  const io = new IntersectionObserver(es => { it.visible = es[0].isIntersecting; if (it.visible) kick() }, { rootMargin: '120px 0px' })
  io.observe(el)
  let t = 0
  const rebuild = () => { clearTimeout(t); t = setTimeout(() => { if (!it.dead) build(it) }, 80) }
  const ro = new ResizeObserver(rebuild); ro.observe(el)
  const mo = new MutationObserver(rebuild); mo.observe(el, { childList: true, characterData: true, subtree: true })
  ;(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { build(it); kick() })
  return {
    refresh: rebuild,
    destroy() {
      it.dead = true; items.delete(it); io.disconnect(); ro.disconnect(); mo.disconnect(); clearTimeout(t)
      canvas.remove(); el.classList.remove('gtext-on', 'gtext-css')
      if (it.sdfTex && G) G.gl.deleteTexture(it.sdfTex)
    }
  }
}

window.GlassText = { mount }
})();

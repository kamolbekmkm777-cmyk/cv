/* ==========================================================================
   glass-text.js — the hero name as liquid glass.
   The letters are a lens: a signed-distance field of the real laid-out text
   becomes a height field; the background video is sampled through it with
   refraction, then lit like the app bar's water drop (bright rim, iridescent
   fresnel, specular that follows the cursor, a soft shadow under the glass).
   The DOM text stays (selectable, readable by screen readers) — it just turns
   transparent while the glass is drawn. No WebGL2, a cross-origin video, or
   file:// → a CSS glass look instead.
   ========================================================================== */
(() => {
'use strict';

const PAD = 26            // css px of canvas around the text block (rim, shadow)


/* Exact signed distance (css px, negative inside) of an alpha mask. */
function sdfFromMask(alpha, W, H, dpr) {
  const n = W * H, INF = 1e20
  const outer = new Float64Array(n), inner = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    const a = alpha[i * 4 + 3] / 255
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
  // a clear, slightly bright glass body
  c = c * 1.12 + vec3(0.035, 0.045, 0.06);

  // iridescent fresnel at the steep edge
  float fres = clamp((1.0 - n.z) * 3.2, 0.0, 1.0);
  vec3 irid = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + fres * 0.85 + view.x * 0.0028 + uTime * 0.035));
  c = mix(c, mix(vec3(1.0), irid, 0.5), fres * 0.5);

  // key light from the top-left, plus a light that follows the cursor
  vec3 V = vec3(0.0, 0.0, 1.0);
  float spec = pow(max(dot(reflect(-normalize(vec3(-0.45, -0.8, 0.85)), n), V), 0.0), 60.0);
  vec2 m = p - uMouse;
  vec3 Lm = normalize(vec3(-m / 260.0, 0.9));
  float specM = pow(max(dot(reflect(-Lm, n), V), 0.0), 28.0) * uMouseOn;
  float glow = exp(-dot(m, m) / 26000.0) * uMouseOn * 0.10;
  c += vec3(spec * 0.95 + specM * 0.6 + glow);

  // the bright inner rim, like the drop's meniscus
  float rim = smoothstep(2.2, 0.0, abs(d + 1.3));
  c = mix(c, vec3(1.0), rim * 0.6);
  // a whisper of a dark outer line keeps the shape legible on bright fog
  float line = smoothstep(1.4, 0.0, abs(d)) * 0.18;
  c *= 1.0 - line;

  c = clamp(c, 0.0, 1.0);
  float a = cov + shadow * (1.0 - cov);
  o = vec4(c * cov, a);
}`

function mount(el, opts) {
  const o = Object.assign({ media: null, video: null, poster: '' }, opts)
  const canvas = document.createElement('canvas')
  canvas.className = 'gtext-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false })
  if (!gl) return null
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s }
  const prog = gl.createProgram()
  try {
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
  } catch (e) { console.warn('glass text', e); return null }
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const U = {}
  for (const k of ['uSdf', 'uBg', 'uSize', 'uDpr', 'uRect', 'uCover', 'uOp', 'uBase', 'uMouse', 'uMouseOn', 'uTime', 'uBevel']) U[k] = gl.getUniformLocation(prog, k)
  const sdfTex = gl.createTexture(), bgTex = gl.createTexture()
  const params = () => {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sdfTex); params()
  gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bgTex); params()
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 26, 34, 255]))
  gl.uniform1i(U.uSdf, 0); gl.uniform1i(U.uBg, 1)

  // A sibling, not a child: the page rewrites the name with textContent,
  // which would wipe anything inside it.
  el.insertAdjacentElement('afterend', canvas)
  let W = 0, H = 0, dpr = 1, ready = false, bevel = 6, srcW = 1280, srcH = 720
  let posterImg = null, usingVideo = false, dead = false, raf = 0, visible = true, last = 0, time = 0
  const mouse = { x: -1e4, y: -1e4, on: 0, target: 0 }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  /* draw every glyph exactly where the browser laid it out */
  function build() {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const cw = r.width + PAD * 2, ch = r.height + PAD * 2
    W = Math.round(cw * dpr); H = Math.round(ch * dpr)
    canvas.width = W; canvas.height = H
    canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px'
    canvas.style.left = (el.offsetLeft - PAD) + 'px'
    canvas.style.top = (el.offsetTop - PAD) + 'px'
    const cs = getComputedStyle(el)
    const size = parseFloat(cs.fontSize)
    bevel = Math.max(3, Math.min(9, size * 0.085))
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
    const data = ctx.getImageData(0, 0, W, H).data
    const sdf = sdfFromMask(data, W, H, dpr)
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sdfTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, W, H, 0, gl.RED, gl.FLOAT, sdf)
    ready = true
    el.classList.add('gtext-on')
    draw()
  }

  function upload() {
    const v = o.video
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bgTex)
    try {
      if (v && v.classList.contains('on') && v.readyState >= 2 && v.videoWidth) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v)
        srcW = v.videoWidth; srcH = v.videoHeight; usingVideo = true
        return
      }
      if (posterImg && posterImg.complete && posterImg.naturalWidth && !usingVideo) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, posterImg)
        srcW = posterImg.naturalWidth; srcH = posterImg.naturalHeight
      }
    } catch (e) {
      // a video from a host without CORS: keep the CSS glass instead
      fail()
    }
  }

  function draw() {
    if (!ready || dead) return
    upload()
    if (dead) return
    const r = canvas.getBoundingClientRect()
    const vw = innerWidth, vh = innerHeight
    const k = Math.max(vw / srcW, vh / srcH)
    const dw = srcW * k, dh = srcH * k
    const op = o.media ? parseFloat(getComputedStyle(o.media).opacity) || 1 : 1
    gl.viewport(0, 0, W, H)
    gl.uniform2f(U.uSize, W, H)
    gl.uniform1f(U.uDpr, dpr)
    gl.uniform4f(U.uRect, r.left, r.top, r.width, r.height)
    gl.uniform4f(U.uCover, (vw - dw) / 2, (vh - dh) / 2, dw, dh)
    gl.uniform1f(U.uOp, op)
    gl.uniform3f(U.uBase, 8 / 255, 8 / 255, 10 / 255)
    gl.uniform2f(U.uMouse, mouse.x, mouse.y)
    gl.uniform1f(U.uMouseOn, mouse.on)
    gl.uniform1f(U.uTime, time)
    gl.uniform1f(U.uBevel, bevel)
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  function loop() {
    if (raf || dead) return
    last = performance.now()
    const tick = now => {
      raf = 0
      const dt = Math.min((now - last) / 1000, 0.1); last = now; time += dt
      mouse.on += (mouse.target - mouse.on) * Math.min(1, dt * 6)
      draw()
      const moving = (o.video && !o.video.paused && o.video.classList.contains('on')) || Math.abs(mouse.target - mouse.on) > 0.01
      if (visible && !document.hidden && (moving || mouse.target) && !reduce) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  function fail() {
    dead = true
    cancelAnimationFrame(raf)
    canvas.remove()
    el.classList.remove('gtext-on')
    el.classList.add('gtext-css')
  }

  // the poster is the loop's first frame: refraction works before the video
  if (o.poster) { posterImg = new Image(); posterImg.onload = () => draw(); posterImg.src = o.poster }
  o.video?.addEventListener('playing', loop)
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) loop() })
  io.observe(el)
  const host = el.closest('.hero') || el
  host.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return
    const r = canvas.getBoundingClientRect()
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.target = 1; loop()
  })
  host.addEventListener('pointerleave', () => { mouse.target = 0; loop() })
  addEventListener('scroll', () => { if (visible && !raf) draw() }, { passive: true })
  let rebuildT = 0
  const rebuild = () => { clearTimeout(rebuildT); rebuildT = setTimeout(() => { if (!dead) build() }, 80) }
  new ResizeObserver(rebuild).observe(el)
  new MutationObserver(rebuild).observe(el, { childList: true, characterData: true, subtree: true })
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); fail() })

  ;(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { build(); loop() })

  return {
    refresh: rebuild,
    destroy() { dead = true; cancelAnimationFrame(raf); io.disconnect(); canvas.remove(); el.classList.remove('gtext-on', 'gtext-css') }
  }
}

window.GlassText = { mount }
})();

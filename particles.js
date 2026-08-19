/* ==========================================================================
   particles.js — the living background. A full-screen field of ~30 000
   points (BufferGeometry + Points) drifting on simplex noise inside a
   shader; anything near the pointer gets pushed away with force ∝ 1/d².

   The pointer can be a mouse, a touch — or a HAND: hand-control.js calls
   window.ParticleField.setPointer(x, y) with its virtual cursor, so waving
   a hand at the camera parts the particles like water.

   Loaded as an ES module straight from the CDN (same pattern as the
   Supabase SDK and MediaPipe in this project — no build step). If the CDN
   or WebGL is unavailable the module exits quietly and the site simply
   shows the static CSS floor.
   ========================================================================== */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';

const canvas = document.getElementById('pfield');
if (canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) init();

function init(){
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:false, powerPreference:'low-power' });
  } catch { return; }                                  // no WebGL → CSS floor stays

  const coarse = matchMedia('(pointer: coarse)').matches || innerWidth < 768;
  const COUNT = coarse ? 12000 : 30000;
  const DPR = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2);
  renderer.setPixelRatio(DPR);

  const scene = new THREE.Scene();
  let aspect = innerWidth / innerHeight;
  const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
  camera.position.z = 1;

  /* Points live in normalized space: x,y ∈ [-1.3, 1.3] — a little beyond the
     frustum so drift and repulsion never expose an empty edge. */
  const pos  = new Float32Array(COUNT * 3);
  const rand = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++){
    pos[i*3]   = (Math.random()*2 - 1) * 1.3;
    pos[i*3+1] = (Math.random()*2 - 1) * 1.3;
    pos[i*3+2] = 0;
    rand[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));

  const uniforms = {
    uTime:    { value: 0 },
    uAspect:  { value: aspect },
    uDpr:     { value: DPR },
    uPointer: { value: new THREE.Vector2(9, 9) },   // far away = inert
    uPush:    { value: 0 },                          // 0..1, eases in/out
    uColA:    { value: new THREE.Color('#F0A23C') },
    uColB:    { value: new THREE.Color('#FFC46B') }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float aRand;
      uniform float uTime, uAspect, uDpr, uPush;
      uniform vec2 uPointer;
      varying float vMix, vAlpha;

      /* Ashima 3D simplex noise (public domain) */
      vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      void main(){
        /* World space: x stretched by aspect so distances stay circular. */
        vec2 world = vec2(position.x * uAspect, position.y);

        /* Slow noise flow — two decorrelated fields give a liquid drift. */
        float t = uTime * 0.05;
        vec2 flow = vec2(
          snoise(vec3(position.xy * 1.7,        t + aRand * 3.1)),
          snoise(vec3(position.xy * 1.7 + 40.0, t - aRand * 2.3))
        ) * 0.075;
        world += flow;

        /* Pointer repulsion: force = k / d². Near points fly, far ones sit. */
        vec2 d = world - uPointer;
        float d2 = dot(d, d);
        float f = uPush * 0.0035 / (d2 + 0.0018);
        world += normalize(d + 0.0001) * min(f, 0.45);

        vMix = aRand;
        /* Twinkle: each point breathes on its own noise phase. */
        vAlpha = 0.28 + 0.5 * (0.5 + 0.5 * snoise(vec3(position.xy * 3.0, uTime * 0.22 + aRand * 7.0)));

        gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 0.0, 1.0);
        gl_PointSize = (0.9 + 1.5 * aRand) * uDpr;
      }`,
    fragmentShader: /* glsl */`
      precision mediump float;
      uniform vec3 uColA, uColB;
      varying float vMix, vAlpha;
      void main(){
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float a = smoothstep(0.5, 0.12, d) * vAlpha;
        if (a < 0.01) discard;
        gl_FragColor = vec4(mix(uColA, uColB, vMix), a * 0.5);
      }`
  });

  scene.add(new THREE.Points(geo, mat));

  /* ----------------------------------------------------------- pointer */
  const target = { x: 9, y: 9, active: 0, lastMove: 0 };
  const cur = new THREE.Vector2(9, 9);

  const toWorld = (cx, cy) => ({
    x: (cx / innerWidth  * 2 - 1) * aspect,
    y: -(cy / innerHeight * 2 - 1)
  });

  function setPointer(cx, cy){
    const w = toWorld(cx, cy);
    target.x = w.x; target.y = w.y;
    target.active = 1; target.lastMove = performance.now();
  }
  function clearPointer(){ target.active = 0; }

  addEventListener('pointermove', e => setPointer(e.clientX, e.clientY), { passive:true });
  addEventListener('touchmove', e => {
    const t = e.touches[0]; if (t) setPointer(t.clientX, t.clientY);
  }, { passive:true });

  /* Public hook — hand-control.js feeds its virtual cursor here. */
  window.ParticleField = { setPointer, clearPointer };

  /* ------------------------------------------------------------ resize */
  function resize(){
    aspect = innerWidth / innerHeight;
    camera.left = -aspect; camera.right = aspect;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = aspect;
    renderer.setSize(innerWidth, innerHeight, false);
  }
  addEventListener('resize', resize);
  resize();

  /* -------------------------------------------------------------- loop */
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(tick);
  });

  const clock = new THREE.Clock();
  function tick(){
    if (!running) return;
    uniforms.uTime.value = clock.getElapsedTime();

    // Pointer eases toward its target; the push strength fades out ~2s
    // after the last movement so the field settles back like water.
    cur.x += (target.x - cur.x) * 0.14;
    cur.y += (target.y - cur.y) * 0.14;
    uniforms.uPointer.value.copy(cur);
    const idle = performance.now() - target.lastMove;
    const want = target.active && idle < 2000 ? 1 : 0;
    uniforms.uPush.value += (want - uniforms.uPush.value) * 0.06;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

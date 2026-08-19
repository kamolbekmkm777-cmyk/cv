/* ==========================================================================
   admin.js — the owner's control panel, served only at /admin.

   AUTH: Supabase Auth is the ONLY gate. signInWithPassword() is checked on
   the server; no password hash ships in this code. Even with the panel HTML
   in hand, an anonymous visitor cannot publish anything — the RLS policy in
   supabase.sql rejects every anon write.
   ========================================================================== */
(() => {
'use strict';

const CV = window.CV;
const { $, $$, esc, uid, tidyUrl, toast, ICONS, SOCIAL_META } = CV;
const data = () => CV.data;

const PORTFOLIO_CATS = ['bot','site','app','esp32','award','other'];
const CAT_LABELS = { bot:'Botlar', site:'Saytlar', app:'Ilovalar', esp32:'ESP32', award:'Mukofotlar', other:'Boshqa' };

/* Supabase xatolarini odam tiliga o'girish */
const authErrUz = m => {
  m = String(m || '');
  if (/missing email|phone/i.test(m))       return 'Email kiritilmadi';
  if (/invalid login credentials/i.test(m)) return 'Email yoki parol noto\'g\'ri';
  if (/email not confirmed/i.test(m))       return 'Email tasdiqlanmagan — Supabase\'da userni «Auto Confirm» bilan qayta yarating';
  if (/rate limit/i.test(m))                return 'Juda ko\'p urinish — birozdan so\'ng qayta urining';
  return m || 'Kirib bo\'lmadi';
};

function flashSaved(){
  const el = $('#adminSaved'); if(!el) return;
  el.classList.add('on'); clearTimeout(el._t);
  el._t = setTimeout(()=>el.classList.remove('on'), 1200);
}
CV.onSave(flashSaved);

/* Trilingual input group for a { uz, en, ru } field. */
function mlInput(path, cur, opt){
  opt = opt || {};
  cur = (cur && typeof cur === 'object') ? cur : {};
  const one = lg => {
    const val = cur[lg] || '';
    const miss = val.trim() ? '' : ' mlf__in--miss';
    return opt.textarea
      ? `<textarea rows="${opt.rows||2}" class="mlf__in${miss}" data-ml="${path}" data-lang="${lg}" placeholder="${esc(opt.ph||'')}">${esc(val)}</textarea>`
      : `<input type="text" class="mlf__in${miss}" data-ml="${path}" data-lang="${lg}" value="${esc(val)}" placeholder="${esc(opt.ph||'')}">`;
  };
  return `<div class="field full mlf">
    <label>${opt.label||''} <span class="mlf__req">3 tilda</span></label>
    <div class="mlf__row"><span class="mlf__lg">UZ</span>${one('uz')}</div>
    <div class="mlf__row"><span class="mlf__lg">EN</span>${one('en')}</div>
    <div class="mlf__row"><span class="mlf__lg">RU</span>${one('ru')}</div>
  </div>`;
}

/* ------------------------------------------------- AVATAR CROP (Telegram) */
const cropState = { img:null, natW:0, natH:0, base:1, zoom:1, ox:0, oy:0, size:300, cb:null, drag:null };

function cropClamp(){
  const c = cropState, k = c.base * c.zoom;
  const w = c.natW * k, h = c.natH * k;
  c.ox = Math.min(0, Math.max(c.size - w, c.ox));
  c.oy = Math.min(0, Math.max(c.size - h, c.oy));
}
function cropPaint(){
  const c = cropState, im = $('#cropImg'); if (!im || !c.img) return;
  const k = c.base * c.zoom;
  im.style.width  = (c.natW * k) + 'px';
  im.style.height = (c.natH * k) + 'px';
  im.style.transform = `translate(${c.ox}px, ${c.oy}px)`;
}
function cropSetZoom(z, cx, cy){
  const c = cropState;
  const old = c.base * c.zoom;
  c.zoom = Math.min(4, Math.max(1, z));
  const now = c.base * c.zoom;
  const px = cx ?? c.size/2, py = cy ?? c.size/2;
  c.ox = px - (px - c.ox) * (now / old);
  c.oy = py - (py - c.oy) * (now / old);
  cropClamp(); cropPaint();
  const r = $('#cropZoom'); if (r && Math.abs(+r.value - c.zoom*100) > 1) r.value = Math.round(c.zoom*100);
}
function openCrop(src, cb){
  const m = $('#cropModal'); if (!m) return;
  const c = cropState;
  c.cb = cb; c.zoom = 1; c.drag = null;
  c.size = $('#cropStage').clientWidth || 300;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    c.img = img; c.natW = img.naturalWidth; c.natH = img.naturalHeight;
    c.base = c.size / Math.min(c.natW, c.natH);
    c.ox = (c.size - c.natW * c.base) / 2;
    c.oy = (c.size - c.natH * c.base) / 2;
    $('#cropImg').src = src;
    $('#cropZoom').value = 100;
    cropPaint();
    m.classList.add('open'); m.setAttribute('aria-hidden','false');
  };
  img.onerror = () => toast('Rasmni ochib bo\'lmadi');
  img.src = src;
}
function closeCrop(){
  const m = $('#cropModal'); if (!m) return;
  m.classList.remove('open'); m.setAttribute('aria-hidden','true');
  const im = $('#cropImg'); if (im) im.removeAttribute('src');
  cropState.img = null; cropState.cb = null;
}
function cropExport(){
  const c = cropState; if (!c.img) return;
  const OUT = 900, k2 = OUT / c.size, k = c.base * c.zoom;
  const cv = document.createElement('canvas'); cv.width = cv.height = OUT;
  const x = cv.getContext('2d');
  x.fillStyle = '#111'; x.fillRect(0,0,OUT,OUT);
  try {
    x.drawImage(c.img, c.ox*k2, c.oy*k2, c.natW*k*k2, c.natH*k*k2);
    cv.toBlob(b => {
      if (!b) { toast('Saqlab bo\'lmadi'); return; }
      const cb = c.cb; closeCrop(); cb?.(b);
    }, 'image/jpeg', 0.88);
  } catch(e){
    toast('Bu rasmni tahrirlab bo\'lmaydi — faylni qaytadan yuklang');
  }
}
function initCrop(){
  const stage = $('#cropStage'); if (!stage) return;
  stage.addEventListener('pointerdown', e => {
    e.preventDefault();
    cropState.drag = { x: e.clientX, y: e.clientY, ox: cropState.ox, oy: cropState.oy };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    const d = cropState.drag; if (!d) return;
    cropState.ox = d.ox + (e.clientX - d.x);
    cropState.oy = d.oy + (e.clientY - d.y);
    cropClamp(); cropPaint();
  });
  const end = () => { cropState.drag = null; };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  stage.addEventListener('wheel', e => {
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    cropSetZoom(cropState.zoom * (e.deltaY < 0 ? 1.08 : 0.93), e.clientX - r.x, e.clientY - r.y);
  }, { passive:false });
  $('#cropZoom').addEventListener('input', e => cropSetZoom(Number(e.target.value)/100));
  $('#cropSave').onclick = cropExport;
  $('#cropCancel').onclick = closeCrop;
  $('#cropModal').addEventListener('click', e => { if (e.target.id === 'cropModal') closeCrop(); });
}

/* ============================================================ RENDERERS */
const admin = {
  fill(){
    $$('[data-path]').forEach(el => {
      const v = CV.get(el.dataset.path);
      if (el.type === 'checkbox') el.checked = !!v;
      else el.value = (v && typeof v === 'object') ? '' : (v ?? '');
    });
    $$('.pane [data-ml]:not([data-rendered])').forEach(el => {
      const o = CV.get(el.dataset.ml);
      el.value = (o && typeof o === 'object') ? (o[el.dataset.lang] || '') : '';
    });
    const asz = $('#avatarSizeR');
    if (asz){ asz.value = Number(data().profile.photoSize) || 250; $('#avatarSizeL').textContent = asz.value; }
    const vol = $('#musicVol');
    if (vol){ vol.value = data().music.volume ?? 40; $('#volLabel').textContent = vol.value; }
    this.renderPortfolio(); this.renderExperience(); this.renderEducation();
    this.renderFavorites(); this.renderSocial(); this.renderMusic(); this.renderGallery();
    this.renderSync();
  },

  renderSync(){
    const st = window.Cloud?.status?.() || { enabled:false };
    const cls = st.signedIn ? ' syncbar--live' : ' syncbar--err';
    const txt = st.signedIn
      ? `Bulutga ulangan: <b>${esc(st.email)}</b> — har tahrir ~1.5 soniyada hammaga chop etiladi.`
      : `Sessiya tugagan — qayta kiring.`;
    const el = $('#syncTop');
    if (el) el.innerHTML = `<div class="syncbar${cls}"><i class="syncbar__dot"></i><span class="syncbar__t">${txt}</span></div>`;
  },

  renderPortfolio(){
    $('#adminPortfolio').innerHTML = data().portfolio.map((p,i) => `
      <div class="item">
        <div class="item__h"><b>${esc(p.slug || 'loyiha '+(i+1))}</b><button class="item__x" data-del="portfolio" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          <div class="field"><label>Slug (sahifa manzili: /work?p=…)</label><input type="text" data-path="portfolio.${i}.slug" value="${esc(p.slug||'')}"></div>
          <div class="field"><label>Kategoriya</label>
            <select data-path="portfolio.${i}.cat">
              ${PORTFOLIO_CATS.map(c=>`<option value="${c}" ${(p.cat||'other')===c?'selected':''}>${CAT_LABELS[c]}</option>`).join('')}
            </select></div>
          ${mlInput(`portfolio.${i}.title`, p.title, {label:'Nom'})}
          ${mlInput(`portfolio.${i}.description`, p.description, {label:'Qisqa tavsif (kartochkada)', textarea:true})}
          ${mlInput(`portfolio.${i}.problem`, p.problem, {label:'MUAMMO — 2 gap', textarea:true, rows:3})}
          ${mlInput(`portfolio.${i}.built`, p.built, {label:'NIMA QURDIM — 3–4 gap', textarea:true, rows:4})}

          <div class="field full">
            <label>QARORLAR — «nega X emas, Y tanladim» (3 tagacha)</label>
            ${(p.decisions||[]).map((d,j) => `
              <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px">
                <div style="flex:1">${mlInput(`portfolio.${i}.decisions.${j}`, d, {label:'Qaror '+(j+1), textarea:true})}</div>
                <button class="item__x" data-deldec="${i}.${j}" style="margin-top:26px">×</button>
              </div>`).join('')}
            ${(p.decisions||[]).length < 3 ? `<button class="btn btn--ghost" data-adddec="${i}">+ Qaror qo'shish</button>` : ''}
          </div>

          <div class="field full">
            <label>RAQAMLAR — faqat haqiqiy raqamlar (masalan: 500 — kunlik xabar). Bo'sh = bo'lim ko'rinmaydi.</label>
            ${(p.numbers||[]).map((n,j) => `
              <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px">
                <div class="field" style="width:120px;margin:0"><label>Qiymat</label><input type="text" data-path="portfolio.${i}.numbers.${j}.v" value="${esc(n.v||'')}" placeholder="500/kun"></div>
                <div style="flex:1">${mlInput(`portfolio.${i}.numbers.${j}.l`, n.l, {label:'Izoh'})}</div>
                <button class="item__x" data-delnum="${i}.${j}" style="margin-top:26px">×</button>
              </div>`).join('')}
            <button class="btn btn--ghost" data-addnum="${i}">+ Raqam qo'shish</button>
          </div>

          <div class="field"><label>Stack (vergul bilan)</label><input type="text" data-tags="${i}" value="${esc((p.tags||[]).join(', '))}"></div>
          <div class="field"><label>Jonli havola</label><input type="text" data-path="portfolio.${i}.link" value="${esc(p.link||'')}" placeholder="https://..."></div>
          <div class="field"><label>Kod (GitHub)</label><input type="text" data-path="portfolio.${i}.repo" value="${esc(p.repo||'')}" placeholder="https://github.com/..."></div>
          <div class="field full"><label>Rasm URL</label><input type="text" data-path="portfolio.${i}.image" value="${esc(p.image||'')}" placeholder="https://... yoki yuklang">
            <input type="file" accept="image/*" data-img="${i}"></div>
        </div>
      </div>`).join('');
  },

  renderExperience(){
    $('#adminExperience').innerHTML = data().experience.map((e,i) => `
      <div class="item">
        <div class="item__h"><b>Tajriba ${i+1}</b><button class="item__x" data-del="experience" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          <div class="field full"><label>Kompaniya</label><input type="text" data-path="experience.${i}.company" value="${esc(e.company)}"></div>
          ${mlInput(`experience.${i}.period`, e.period, {label:'Davr'})}
          ${mlInput(`experience.${i}.title`, e.title, {label:'Lavozim'})}
          ${mlInput(`experience.${i}.description`, e.description, {label:'Tavsif', textarea:true})}
        </div>
      </div>`).join('');
  },

  renderEducation(){
    const w = $('#adminEducation'); if (!w) return;
    w.innerHTML = (data().education||[]).map((e,i) => `
      <div class="item">
        <div class="item__h"><b>Taʼlim ${i+1}</b><button class="item__x" data-del="education" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          ${mlInput(`education.${i}.name`, e.name, {label:'Nomi (maktab/litsey/universitet)'})}
          ${mlInput(`education.${i}.period`, e.period, {label:"Yillari (masalan: 2013 — 2022)"})}
          ${mlInput(`education.${i}.description`, e.description, {label:"Batafsil ma'lumot", textarea:true})}
          <div class="field full">
            <label>Hujjatlar va rasmlar</label>
            <div class="edudocs">
              ${(e.docs||[]).map((d,j) => `
                <span class="edudoc" style="background-image:url('${esc(d.thumb || d.src)}')">
                  <button class="gcell__x" data-deldoc="${i}.${j}" title="O'chirish">×</button>
                </span>`).join('')}
            </div>
            <label class="btn btn--ghost" style="cursor:pointer;margin-top:8px;display:inline-flex">📄 Hujjat/rasm qo'shish
              <input type="file" accept="image/*" data-edudoc="${i}" multiple hidden>
            </label>
          </div>
        </div>
      </div>`).join('');
  },

  renderFavorites(){
    $('#adminFavorites').innerHTML = (data().favorites||[]).map((f,i) => `
      <div class="item">
        <div class="item__h"><b>Link ${i+1}</b><button class="item__x" data-del="favorites" data-i="${i}">O'chirish</button></div>
        <div class="item__g">
          <div class="field"><label>Icon (emoji)</label><input type="text" data-path="favorites.${i}.icon" value="${esc(f.icon)}" placeholder="🎧" maxlength="4"></div>
          <div class="field full"><label>URL</label><input type="text" data-path="favorites.${i}.url" value="${esc(f.url)}" placeholder="https://..."></div>
          ${mlInput(`favorites.${i}.title`, f.title, {label:'Nom'})}
        </div>
      </div>`).join('');
  },

  renderSocial(){
    $('#adminSocial').innerHTML = Object.keys(SOCIAL_META).map(k => `
      <div class="srow">
        <span class="srow__i"><svg viewBox="0 0 24 24"><path d="${ICONS[k]}"/></svg></span>
        <div class="srow__f">
          <label>${SOCIAL_META[k].label}</label>
          <input type="text" data-path="social.${k}" value="${esc(data().social?.[k] || '')}" placeholder="${SOCIAL_META[k].ph}">
        </div>
      </div>`).join('');
  },

  renderMusic(){
    const w = $('#adminTracks'); if (!w) return;
    const cur = tidyUrl(data().music.src);
    w.innerHTML = (data().tracks||[]).map((t,i) => {
      const on = cur && tidyUrl(t.url) === cur;
      return `
      <div class="mediarow ${on?'active':''}">
        <span class="mediarow__thumb">${esc(t.icon || '🎵')}</span>
        <div class="mediarow__f">
          <input type="text" data-path="tracks.${i}.name" value="${esc(t.name)}" placeholder="Qo'shiq nomi">
          <input type="text" data-path="tracks.${i}.url" value="${esc(t.url)}" placeholder="Audio fayl: https://...mp3">
          <input type="text" data-path="tracks.${i}.link" value="${esc(t.link||'')}" placeholder="Havola: YouTube / Spotify (ixtiyoriy)">
        </div>
        <div class="mediarow__acts">
          <button class="mediarow__btn ${on?'mediarow__btn--use':''}" data-usetrack="${i}" ${on?'disabled':''}>${on?'✓ Tanlangan':'Qo\'yish'}</button>
          <button class="mediarow__btn mediarow__btn--red" data-del="tracks" data-i="${i}">O'chirish</button>
        </div>
      </div>`;
    }).join('') || `<p class="hint">Hali musiqa yo'q — pastdan qo'shing.</p>`;
  },

  renderGallery(){
    const w = $('#adminGallery'); if (!w) return;
    const cap = g => (g.caption && typeof g.caption === 'object') ? g.caption : {};
    w.innerHTML = (data().gallery||[]).map((g,i) => `
      <div class="gcell" style="background-image:url('${esc(g.thumb || g.src)}')">
        <button class="gcell__x" data-del="gallery" data-i="${i}" title="O'chirish">×</button>
        <div class="gcell__caps">
          <input class="gcell__cap" type="text" data-ml="gallery.${i}.caption" data-lang="uz" data-rendered="1" value="${esc(cap(g).uz||'')}" placeholder="izoh UZ">
          <input class="gcell__cap" type="text" data-ml="gallery.${i}.caption" data-lang="en" data-rendered="1" value="${esc(cap(g).en||'')}" placeholder="caption EN">
          <input class="gcell__cap" type="text" data-ml="gallery.${i}.caption" data-lang="ru" data-rendered="1" value="${esc(cap(g).ru||'')}" placeholder="подпись RU">
        </div>
      </div>`).join('') || `<p class="hint">Hali rasm yo'q — tepadan qo'shing.</p>`;
  }
};

/* ============================================================ HANDLERS */
function initHandlers(){
  // Tabs
  $('#adminNav').addEventListener('click', e => {
    const t = e.target.closest('.admin__tab'); if (!t) return;
    $$('.admin__tab').forEach(x => x.classList.toggle('active', x === t));
    $$('.pane').forEach(p => p.classList.toggle('active', p.dataset.pane === t.dataset.tab));
  });

  const main = $('.admin__main');

  const writeScalar = el => {
    let v = el.type === 'checkbox' ? el.checked : el.value;
    CV.set(el.dataset.path, v);
    CV.saveSoon();
  };

  main.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.path){ writeScalar(el); return; }
    if (el.dataset.ml){
      const o = CV.get(el.dataset.ml);
      if (o && typeof o === 'object' && !Array.isArray(o)) o[el.dataset.lang] = el.value;
      else CV.set(el.dataset.ml, { uz:'', en:'', ru:'', [el.dataset.lang]: el.value });
      el.classList.toggle('mlf__in--miss', !el.value.trim());
      CV.saveSoon(); return;
    }
    if (el.dataset.tags !== undefined){
      data().portfolio[+el.dataset.tags].tags = el.value.split(',').map(s=>s.trim()).filter(Boolean);
      CV.saveSoon(); return;
    }
    if (el.id === 'avatarSizeR'){
      data().profile.photoSize = Number(el.value);
      $('#avatarSizeL').textContent = el.value;
      CV.saveSoon(); return;
    }
    if (el.id === 'musicVol'){
      data().music.volume = Number(el.value);
      $('#volLabel').textContent = el.value;
      CV.saveSoon(); return;
    }
  });

  main.addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (del){
      const k = del.dataset.del, i = +del.dataset.i;
      const gone = data()[k][i];
      if ((k === 'gallery' || k === 'portfolio') && !confirm('O\'chirilsinmi?')) return;
      data()[k].splice(i, 1);
      const url = gone?.src || gone?.url || '';
      if (url) window.Cloud?.remove?.(url);
      if (gone?.thumb && gone.thumb !== url) window.Cloud?.remove?.(gone.thumb);
      if (k === 'tracks' && tidyUrl(gone?.url) === tidyUrl(data().music.src)){
        data().music.src = ''; data().music.presetId = '';
      }
      CV.save(); admin.fill(); toast('O\'chirildi'); return;
    }

    const dd = e.target.closest('[data-deldoc]');
    if (dd){
      const [ei, dj] = dd.dataset.deldoc.split('.').map(Number);
      const doc = data().education?.[ei]?.docs?.[dj];
      if (!doc) return;
      if (!confirm('Bu hujjat o\'chirilsinmi?')) return;
      data().education[ei].docs.splice(dj, 1);
      if (doc.src) window.Cloud?.remove?.(doc.src);
      CV.save(); admin.renderEducation(); toast('O\'chirildi');
      return;
    }

    const ad = e.target.closest('[data-adddec]');
    if (ad){
      const p = data().portfolio[+ad.dataset.adddec]; if (!p) return;
      (p.decisions ||= []).push({ uz:'', en:'', ru:'' });
      CV.save(); admin.renderPortfolio(); return;
    }
    const dDec = e.target.closest('[data-deldec]');
    if (dDec){
      const [i, j] = dDec.dataset.deldec.split('.').map(Number);
      data().portfolio[i]?.decisions?.splice(j, 1);
      CV.save(); admin.renderPortfolio(); return;
    }
    const an = e.target.closest('[data-addnum]');
    if (an){
      const p = data().portfolio[+an.dataset.addnum]; if (!p) return;
      (p.numbers ||= []).push({ v:'', l:{ uz:'', en:'', ru:'' } });
      CV.save(); admin.renderPortfolio(); return;
    }
    const dn = e.target.closest('[data-delnum]');
    if (dn){
      const [i, j] = dn.dataset.delnum.split('.').map(Number);
      data().portfolio[i]?.numbers?.splice(j, 1);
      CV.save(); admin.renderPortfolio(); return;
    }

    const add = e.target.closest('[data-add]');
    if (add){
      const k = add.dataset.add;
      const ml = uz => ({ uz, en:'', ru:'' });
      const blank = {
        experience: { period:ml('2026 — Hozir'), title:ml('Lavozim'), company:'Kompaniya', description:ml('Tavsif...') },
        portfolio:  { slug:'yangi-ish-'+uid().slice(0,4), title:ml('Yangi loyiha'), description:ml(''),
                      problem:ml(''), built:ml(''), decisions:[], numbers:[],
                      image:'', link:'', repo:'', tags:[], cat:'other' },
        favorites:  { icon:'🔗', title:ml('Yangi link'), url:'' },
        education:  { id:'e'+uid(), name:ml("Yangi ta'lim"), period:ml(''), description:ml(''), docs:[] },
        tracks:     { id:'t'+uid(), name:'Yangi musiqa', url:'', link:'', icon:'🎵' }
      }[k];
      if (!blank) return;
      data()[k].unshift(CV.clone(blank));
      CV.save(); admin.fill(); return;
    }

    const ut = e.target.closest('[data-usetrack]');
    if (ut){
      const t = data().tracks[+ut.dataset.usetrack]; if (!t) return;
      if (!tidyUrl(t.url)) { toast('Avval musiqa URL ni kiriting'); return; }
      data().music.presetId = t.id; data().music.src = t.url;
      CV.save(); admin.renderMusic(); toast('▶ ' + t.name);
      return;
    }

    if (e.target.id === 'avatarEdit'){
      const cur = data().profile.avatar || CV.DEFAULTS.profile.avatar;
      openCrop(cur, async blob => {
        try {
          toast('Yuklanmoqda…', 60000);
          const file = new File([blob], 'avatar.jpg', { type:'image/jpeg' });
          const src = await put(file, 'avatar', 4);
          if (!src){ toast('Yuklanmadi'); return; }
          data().profile.avatar = src;
          const f = $('[data-path="profile.avatar"]'); if (f) f.value = src;
          CV.save(); toast('Rasm yangilandi');
        } catch(err){ toast(err?.message || 'Saqlab bo\'lmadi'); }
      });
      return;
    }
  });

  $('#galleryAddUrl').onclick = () => {
    const u = tidyUrl(prompt('Rasm URL manzili:') || '');
    if (!u) return;
    data().gallery.push({ id:'g'+uid(), src:u, thumb:'', caption:{ uz:'', en:'', ru:'' } });
    CV.save(); admin.renderGallery(); toast('Qo\'shildi');
  };

  /* ------------------------------------------------------------ uploads */
  const put = async (file, folder, limitMB) => {
    if (!(window.Cloud?.enabled && window.Cloud.status().signedIn)){
      toast('Sessiya tugagan — qayta kiring'); return null;
    }
    if (file.size > limitMB*1024*1024){
      toast(`Fayl ${limitMB}MB dan kichik bo'lsin`); return null;
    }
    return window.Cloud.upload(file, folder);
  };

  main.addEventListener('change', async e => {
    const el = e.target;
    if (el.tagName === 'SELECT' && el.dataset.path){ writeScalar(el); return; }
    const files = Array.from(el.files || []);
    if (!files.length) return;
    const busy = msg => toast(msg, 60000);

    try {
      if (el.id === 'brandLogoFile'){
        busy('Yuklanmoqda…');
        const src = await put(files[0], 'brand', 2); if (!src) return;
        data().branding.logo = src;
        const f = $('[data-path="branding.logo"]'); if (f) f.value = src;
        CV.save(); toast('Logo yangilandi');
      }
      else if (el.id === 'brandFaviconFile'){
        busy('Yuklanmoqda…');
        const src = await put(files[0], 'brand', 1); if (!src) return;
        data().branding.favicon = src;
        const f = $('[data-path="branding.favicon"]'); if (f) f.value = src;
        CV.save(); toast('Favicon yangilandi');
      }
      else if (el.id === 'avatarFile'){
        const obj = URL.createObjectURL(files[0]);
        el.value = '';
        openCrop(obj, async blob => {
          URL.revokeObjectURL(obj);
          try {
            busy('Yuklanmoqda…');
            const file = new File([blob], 'avatar.jpg', { type:'image/jpeg' });
            const src = await put(file, 'avatar', 4); if (!src) { toast('Yuklanmadi'); return; }
            data().profile.avatar = src;
            const f = $('[data-path="profile.avatar"]'); if (f) f.value = src;
            CV.save(); toast('Rasm yangilandi');
          } catch(err){ toast(err?.message || 'Yuklab bo\'lmadi'); }
        });
        return;
      }
      else if (el.dataset.img !== undefined){
        busy('Yuklanmoqda…');
        const src = await put(files[0], 'portfolio', 4); if (!src) return;
        data().portfolio[+el.dataset.img].image = src;
        CV.save(); admin.renderPortfolio(); toast('Rasm yuklandi');
      }
      else if (el.id === 'galleryFiles'){
        let n = 0;
        for (const [k, f] of files.entries()){
          busy(`Yuklanmoqda… ${k+1}/${files.length}`);
          const src = await put(f, 'gallery', 10);
          if (!src) continue;
          data().gallery.push({ id:'g'+uid(), src, thumb:'', caption:{ uz:'', en:'', ru:'' } });
          n++;
        }
        CV.save(); admin.renderGallery();
        toast(n ? `${n} ta rasm qo'shildi` : 'Hech narsa qo\'shilmadi');
      }
      else if (el.id === 'musicFile'){
        let n = 0;
        for (const [k, f] of files.entries()){
          busy(`Yuklanmoqda… ${k+1}/${files.length}`);
          const url = await put(f, 'audio', 12);
          if (!url) continue;
          data().tracks.unshift({ id:'t'+uid(), name: f.name.replace(/\.[^.]*$/,''), url, icon:'🎵' });
          n++;
        }
        CV.save(); admin.renderMusic(); toast(n ? `${n} ta musiqa qo'shildi` : 'Qo\'shilmadi');
      }
      else if (el.dataset.edudoc !== undefined){
        const ei = +el.dataset.edudoc; let n = 0;
        for (const [k, f] of files.entries()){
          busy(`Yuklanmoqda… ${k+1}/${files.length}`);
          const src = await put(f, 'edu', 8);
          if (!src) continue;
          (data().education[ei].docs ||= []).push({ src });
          n++;
        }
        CV.save(); admin.renderEducation();
        toast(n ? `${n} ta hujjat qo'shildi` : 'Qo\'shilmadi');
      }
    } catch(err){
      console.warn('upload', err);
      toast(err?.message || 'Yuklab bo\'lmadi');
    } finally {
      el.value = '';
    }
  });

  /* ---------------------------------------------------------- reset pane */
  const dl = (blob, name) => {
    const u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = name; a.click(); URL.revokeObjectURL(u);
  };
  $('#sbPush').onclick = async () => {
    try { toast('Saqlanmoqda…', 30000); await window.Cloud.save(data()); toast('☁ Bulutga saqlandi — hamma ko\'radi'); }
    catch(err){ toast(err?.message || 'Saqlab bo\'lmadi'); }
  };
  $('#sbPull').onclick = async () => {
    try {
      const remote = await window.Cloud.load();
      if (!remote){ toast('Bulutda hali ma\'lumot yo\'q'); return; }
      if (!confirm('Bulutdagi nusxa shu brauzerdagi o\'zgarishlar ustiga yoziladi. Davom etilsinmi?')) return;
      CV.data = CV.normalizeML(CV.migrate(CV.merge(CV.DEFAULTS, remote)));
      CV.save(); admin.fill(); toast('Bulutdan yuklandi');
    } catch(err){ toast(err?.message || 'Yuklab bo\'lmadi'); }
  };
  $('#exportData').onclick = () => {
    dl(new Blob([JSON.stringify(data(),null,2)], {type:'application/json'}), 'cv-data.json');
    toast('Eksport qilindi');
  };
  $('#publishData').onclick = () => {
    const js = `/* Auto-generated from the admin panel. */\nwindow.DEPLOYED_DATA = ${JSON.stringify(data(),null,2)};\n`;
    dl(new Blob([js], {type:'application/javascript'}), 'data.js');
    toast('data.js yuklandi');
  };
  $('#importData').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try {
        CV.data = CV.normalizeML(CV.migrate(CV.merge(CV.DEFAULTS, JSON.parse(ev.target.result))));
        CV.save(); admin.fill(); toast('Import qilindi');
      }
      catch { toast('JSON noto\'g\'ri'); }
    };
    r.readAsText(f);
  };
  $('#resetData').onclick = () => {
    if (!confirm('Barcha o\'zgarishlar o\'chadi. Davom etilsinmi?')) return;
    CV.data = CV.normalizeML(CV.migrate(CV.clone(CV.DEFAULTS)));
    CV.save(); admin.fill(); toast('Standart holatga qaytarildi');
  };
}

/* ============================================================ AUTH GATE */
async function openPanel(){
  // The published copy is the truth — pull it before editing so the admin
  // never overwrites a newer publish from another device.
  try { await CV.loadCloud(); } catch(e){ console.warn('cloud', e); }
  $('#loginGate').hidden = true;
  const p = $('#adminPanel');
  p.hidden = false;
  admin.fill();
}

function showGate(msg){
  $('#adminPanel').hidden = true;
  $('#loginGate').hidden = false;
  if (msg) $('#loginMsg').innerHTML = msg;
}

async function init(){
  initHandlers(); initCrop();

  const C = window.Cloud;
  if (!C?.enabled){
    showGate('<b style="color:#ff8f8f">Bulut sozlanmagan.</b> Admin panel Supabase orqali ishlaydi — <code>config.js</code> ni to\'ldiring (SUPABASE.md).');
    $('#loginForm').style.display = 'none';
    return;
  }

  try { await C.init(); } catch(e){ console.warn(e); }
  if (C.status().signedIn){ openPanel(); }
  else {
    showGate('');
    try { $('#sbEmail').value = localStorage.getItem('sb-last-email') || ''; } catch {}
  }

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const b = $('#sbLogin');
    try {
      const email = $('#sbEmail').value.trim();
      const pass  = $('#sbPass').value;
      if (!email || !pass){ toast('Email va parolni kiriting'); return; }
      b.disabled = true;
      await C.signIn(email, pass);
      try { localStorage.setItem('sb-last-email', email); } catch {}
      $('#sbPass').value = '';
      openPanel();
      toast('☁ Kirdingiz — endi har o\'zgarish hammaga chop etiladi', 3000);
    } catch(err){ toast(authErrUz(err?.message)); }
    finally { b.disabled = false; }
  });

  $('#sbLogout').onclick = async () => {
    await C.signOut?.();
    showGate('Chiqdingiz.');
  };
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', init);
else init();
})();

/* ==========================================================================
   cloud.js — optional Supabase backing store.

   Why this exists: the admin panel used to write to localStorage, so edits
   only ever existed in the browser that made them. Photos/audio/video as
   base64 also blew past the ~5MB quota fast. With Supabase configured:

     • site content  → one jsonb row in `site_data` (public read, admin write)
     • media files   → `media` storage bucket (public read, admin write)

   Everything here is OPTIONAL and lazy. If config.js is missing or blank,
   Cloud.enabled === false, no network request is made, and app.js silently
   falls back to localStorage. The site never breaks because the cloud is
   unreachable — it just stops syncing.

   Security: the anon key is public by design (it ships in every Supabase
   web app). What protects your data is the RLS policy in supabase.sql —
   anon can read, only a signed-in admin can write.
   ========================================================================== */
(() => {
'use strict';

const CFG = window.SITE_CONFIG || {};
const URL_ = String(CFG.supabaseUrl || '').trim().replace(/\/+$/, '');
const KEY  = String(CFG.supabaseAnonKey || '').trim();
const BUCKET = String(CFG.bucket || 'media').trim();
const SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const configured = !!(URL_ && KEY && !/YOUR_|xxxx/i.test(URL_ + KEY));

let sb = null;          // the supabase client, once loaded
let ready = null;       // in-flight init promise, so we only load the SDK once
const listeners = new Set();

const emit = () => listeners.forEach(f => { try { f(Cloud.status()); } catch {} });

async function client(){
  if (!configured) return null;
  return ready ||= (async () => {
    const { createClient } = await import(/* @vite-ignore */ SDK);
    sb = createClient(URL_, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'cv-sb-auth' }
    });
    sb.auth.onAuthStateChange(emit);
    return sb;
  })();
}

/* A file name that can't collide and can't smuggle a path.
   Random suffix instead of Date.now() alone so two uploads in the same
   millisecond (multi-select) can't overwrite each other. */
function safeName(file, folder){
  const ext = (file.name.match(/\.[a-z0-9]{1,5}$/i)?.[0] || '').toLowerCase();
  const base = file.name.replace(/\.[^.]*$/, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'file';
  const rand = Math.random().toString(36).slice(2, 8);
  return `${folder}/${Date.now().toString(36)}-${rand}-${base}${ext}`;
}

const Cloud = {
  get enabled(){ return configured; },

  status(){
    return {
      enabled: configured,
      signedIn: !!sb?.auth && !!Cloud._user,
      email: Cloud._user?.email || '',
      bucket: BUCKET
    };
  },
  _user: null,

  onChange(fn){ listeners.add(fn); return () => listeners.delete(fn); },

  /* Resolve the current session (if the admin ticked "remember me" earlier). */
  async init(){
    const c = await client(); if (!c) return Cloud.status();
    const { data } = await c.auth.getSession();
    Cloud._user = data?.session?.user || null;
    c.auth.onAuthStateChange((_e, s) => { Cloud._user = s?.user || null; emit(); });
    emit();
    return Cloud.status();
  },

  async signIn(email, password){
    const c = await client(); if (!c) throw new Error('Bulut sozlanmagan');
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    Cloud._user = data.user; emit();
    return data.user;
  },

  async signOut(){
    const c = await client(); if (!c) return;
    await c.auth.signOut();
    Cloud._user = null; emit();
  },

  /* Read the published site content. Returns null when there's nothing
     stored yet (fresh project) — the caller then keeps its local copy. */
  async load(){
    const c = await client(); if (!c) return null;
    const { data, error } = await c.from('site_data').select('data').eq('id', 1).maybeSingle();
    if (error) throw error;
    return data?.data ?? null;
  },

  /* Publish. Requires a signed-in admin — RLS rejects anon writes. */
  async save(payload){
    const c = await client(); if (!c) throw new Error('Bulut sozlanmagan');
    if (!Cloud._user) throw new Error('Avval Bulut bo\'limidan kiring');
    const { error } = await c.from('site_data')
      .upsert({ id: 1, data: payload, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) throw error;
    return true;
  },

  /* Upload one file, return its public URL. `folder` groups them in the
     bucket: gallery/ audio/ video/ avatar/ */
  async upload(file, folder = 'misc'){
    const c = await client(); if (!c) throw new Error('Bulut sozlanmagan');
    if (!Cloud._user) throw new Error('Avval Bulut bo\'limidan kiring');
    const path = safeName(file, folder);
    const { error } = await c.storage.from(BUCKET)
      .upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = c.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  /* Best-effort cleanup when an admin deletes an item we uploaded.
     Never throws: a failed delete must not block the UI edit. */
  async remove(publicUrl){
    try {
      const c = await client(); if (!c || !Cloud._user) return false;
      const marker = `/object/public/${BUCKET}/`;
      const i = String(publicUrl || '').indexOf(marker);
      if (i < 0) return false;                       // not one of ours
      const path = decodeURIComponent(publicUrl.slice(i + marker.length).split('?')[0]);
      const { error } = await c.storage.from(BUCKET).remove([path]);
      return !error;
    } catch { return false; }
  }
};

window.Cloud = Cloud;
})();

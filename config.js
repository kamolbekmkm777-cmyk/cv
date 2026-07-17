/* ==========================================================================
   config.example.js  →  nusxa oling va `config.js` deb saqlang.

   config.js Vercel'ga deploy bo'ladi (u .gitignore'da EMAS — brauzer uni
   o'qishi kerak). Bu xavfsiz: anon key ochiq bo'lishi uchun mo'ljallangan,
   himoya supabase.sql dagi RLS qoidalarida.

   HECH QACHON bu yerga `service_role` kalitini yozmang — u hamma narsani
   ochib beradi.
   ========================================================================== */
window.SITE_CONFIG = {
  // Supabase → Project Settings → API → Project URL
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',

  // Supabase → Project Settings → API → Project API keys → `anon` `public`
  supabaseAnonKey: 'YOUR_ANON_PUBLIC_KEY',

  // Storage bucket nomi (supabase.sql shu nom bilan yaratadi)
  bucket: 'media'
};

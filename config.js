/* ==========================================================================
   config.js — Supabase ulanish sozlamalari.

   Bu fayl brauzerga yuklanadi va SHUNDAY BO'LISHI KERAK: `anon` kalit ochiq
   bo'lishga mo'ljallangan (har qanday Supabase saytida ko'rinadi). Himoya
   supabase.sql dagi RLS qoidalarida: anon faqat O'QIY oladi, yozish uchun
   admin email/parol bilan kirish shart.

   HECH QACHON bu yerga `service_role` yoki `sb_secret_...` kalitini yozmang —
   ular barcha himoyani chetlab o'tadi.
   ========================================================================== */
window.SITE_CONFIG = {
  supabaseUrl: 'https://ocbkxquwqwypjoweveyf.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jYmt4cXV3cXd5cGpvd2V2ZXlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NTg2MjMsImV4cCI6MjEwMDAzNDYyM30.Ts1hBkgi-iTTacHeVyAY4cF-nDkaIx9MKDYx40LkXHc',
  bucket: 'media'
};

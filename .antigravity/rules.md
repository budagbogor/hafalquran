# Antigravity Agent Rules — Hafalan Al-Qur'an App

## Tentang Project
Aplikasi hafalan Al-Qur'an untuk orang dewasa, berbasis neurosains.
Stack: React 18 + Vite 4 + Supabase + deploy ke Vercel.

## Struktur Penting
- `src/App.jsx` — semua screens (Dashboard, Hafalan, Muraja'ah, Jadwal, Metode)
- `src/supabase.js` — auth & database helpers
- `supabase/schema.sql` — jalankan sekali di Supabase SQL Editor
- `vercel.json` — SPA routing config untuk Vercel

## Rules untuk Agent
- Jangan ubah struktur komponen: AuthScreen, SurahDetailScreen, dan QuranHafalanApp harus tetap komponen TERPISAH (bukan nested) untuk menghindari React Hooks violation
- Semua `useState` dan `useEffect` harus berada SEBELUM `if (!authChecked)` dan `if (!user)` di komponen QuranHafalanApp
- Gunakan `import.meta.env.VITE_*` untuk environment variables, bukan hardcode
- Styling menggunakan inline CSS (CSS-in-JS), tidak ada file CSS terpisah
- Semua teks Arab menggunakan font Scheherazade New

## Environment Variables
VITE_SUPABASE_URL=https://tyrxsvjgzfgifbwkbkkp.supabase.co
VITE_SUPABASE_ANON_KEY=(lihat .env.local)

## Deploy
- Build: `npm run build` → output di `dist/`
- Vercel: auto-detect Vite, set env vars di dashboard
- Supabase Auth redirect URL: tambahkan URL Vercel di Supabase → Auth → URL Configuration

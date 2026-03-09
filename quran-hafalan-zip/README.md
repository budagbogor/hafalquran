# Hafalan Al-Qur'an
### Aplikasi Hafalan Berbasis Neurosains — B.O.A. Indonesia

---

## 🚀 Quick Start

### 1. Jalankan SQL Schema di Supabase (lakukan sekali)
> Supabase Dashboard → project `tyrxsvjgzfgifbwkbkkp` → **SQL Editor** → paste `supabase/schema.sql` → **Run**

### 2. Buka di Google Antigravity
1. Download & install Antigravity: [antigravity.google/download](https://antigravity.google/download)
2. **Open Folder** → pilih folder project ini
3. Jalankan di terminal:
   ```bash
   npm install
   npm run dev
   ```
4. Buka browser: `http://localhost:3000`

> **Tips Antigravity:** Gunakan Agent Manager untuk task seperti *"Tambahkan fitur audio murattal"* atau *"Perbaiki tampilan di iPhone SE"*. Agent akan baca `.antigravity/rules.md` sebagai konteks project.

---

## ☁️ Deploy ke Vercel

### Via Vercel Dashboard (Recommended)
1. Push project ke GitHub
2. Buka [vercel.com/new](https://vercel.com/new) → Import repo
3. **Framework Preset:** Vite *(auto-detected)*
4. Set **Environment Variables:**

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://tyrxsvjgzfgifbwkbkkp.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | *(anon key dari Supabase → Settings → API)* |

5. Klik **Deploy** ✅

### Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Setelah Deploy — Setup Supabase Redirect
Supabase Dashboard → **Authentication → URL Configuration**
- **Site URL:** `https://nama-project.vercel.app`
- **Redirect URLs:** `https://nama-project.vercel.app/**`

---

## 📁 Struktur Project

```
quran-hafalan/
├── .antigravity/
│   └── rules.md        ← Context untuk Antigravity agent
├── src/
│   ├── App.jsx         ← Semua screens (3 komponen terpisah)
│   ├── supabase.js     ← Supabase client & helpers
│   └── main.jsx        ← Entry point React
├── supabase/
│   └── schema.sql      ← Database schema (run sekali)
├── index.html
├── vite.config.js
├── vercel.json         ← SPA routing
├── package.json
└── .env.local          ← Dev credentials (jangan di-commit)
```

---

## ⚙️ Environment Variables

**Development** — buat `.env.local`:
```
VITE_SUPABASE_URL=https://tyrxsvjgzfgifbwkbkkp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Production** — set di Vercel Dashboard (jangan commit ke git).

---

## 🧠 Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📖 Teks Quran Madinah | Uthmani via api.alquran.cloud |
| 🔐 Auth | Login/Daftar via Supabase |
| ☁️ Cloud Sync | Progress real-time ke PostgreSQL |
| ⟳ Spaced Repetition | Jadwal muraja'ah otomatis |
| 📅 Jadwal Harian | 4 sesi (Subuh/Pagi/Ashar/Isya) |
| 🧠 5 Metode Ilmiah | Chunking, SRS, Multi-Sensory, dll |

---

## 🏗️ Tech Stack

| | |
|---|---|
| Frontend | React 18 + Vite 4 |
| Auth & DB | Supabase (PostgreSQL) |
| Hosting | Vercel |
| IDE | Google Antigravity |
| Quran API | api.alquran.cloud |

---

*B.O.A. INDONESIA © 2026*

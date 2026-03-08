-- ================================================
-- SCHEMA: Hafalan Al-Qur'an App
-- Project: tyrxsvjgzfgifbwkbkkp
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------
-- TABLE: profiles (data user)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  nama TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- TABLE: hafalan (progress per surah per user)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS hafalan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  surah_id INTEGER NOT NULL CHECK (surah_id BETWEEN 1 AND 114),
  status TEXT NOT NULL DEFAULT 'belum' CHECK (status IN ('belum', 'proses', 'hafal')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  repetitions INTEGER DEFAULT 0,
  last_review TIMESTAMPTZ,
  next_review TIMESTAMPTZ,
  method TEXT DEFAULT 'chunking',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, surah_id)
);

-- ------------------------------------------------
-- TABLE: muraja_log (riwayat setiap sesi muraja'ah)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS muraja_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  surah_id INTEGER NOT NULL,
  quality TEXT NOT NULL CHECK (quality IN ('lancar', 'perlu_ulang')),
  duration_seconds INTEGER DEFAULT 0,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- TABLE: jadwal_reminder (toggle reminder per sesi)
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS jadwal_reminder (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sesi TEXT NOT NULL CHECK (sesi IN ('subuh', 'pagi', 'ashar', 'isya')),
  aktif BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sesi)
);

-- ------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hafalan ENABLE ROW LEVEL SECURITY;
ALTER TABLE muraja_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_reminder ENABLE ROW LEVEL SECURITY;

-- Profiles: user hanya bisa lihat & edit data sendiri
CREATE POLICY "User can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "User can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "User can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Hafalan: user hanya bisa akses hafalan sendiri
CREATE POLICY "User can manage own hafalan" ON hafalan
  FOR ALL USING (user_id = auth.uid());

-- Muraja log: user hanya bisa akses log sendiri
CREATE POLICY "User can manage own muraja_log" ON muraja_log
  FOR ALL USING (user_id = auth.uid());

-- Jadwal: user hanya bisa akses jadwal sendiri
CREATE POLICY "User can manage own jadwal" ON jadwal_reminder
  FOR ALL USING (user_id = auth.uid());

-- ------------------------------------------------
-- FUNCTION: Auto-update updated_at timestamp
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hafalan_updated_at
  BEFORE UPDATE ON hafalan
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

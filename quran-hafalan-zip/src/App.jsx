import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, signIn, signUp, signOut, loadHafalan, upsertHafalan, insertMurajaLog, loadReminders, upsertReminder } from "./supabase.js";

// ===== DATA & CONSTANTS =====
const SURAHS = [
  { id: 1,   name: "Al-Fatihah",    arabic: "الْفَاتِحَة",      ayat: 7,   juz: 1  },
  { id: 2,   name: "Al-Baqarah",    arabic: "الْبَقَرَة",       ayat: 286, juz: 1  },
  { id: 3,   name: "Ali Imran",     arabic: "آلِ عِمْرَان",     ayat: 200, juz: 3  },
  { id: 4,   name: "An-Nisa",       arabic: "النِّسَاء",        ayat: 176, juz: 4  },
  { id: 5,   name: "Al-Maidah",     arabic: "الْمَائِدَة",      ayat: 120, juz: 6  },
  { id: 6,   name: "Al-An'am",      arabic: "الْأَنْعَام",      ayat: 165, juz: 7  },
  { id: 7,   name: "Al-A'raf",      arabic: "الْأَعْرَاف",      ayat: 206, juz: 8  },
  { id: 8,   name: "Al-Anfal",      arabic: "الْأَنْفَال",      ayat: 75,  juz: 9  },
  { id: 9,   name: "At-Taubah",     arabic: "التَّوْبَة",       ayat: 129, juz: 10 },
  { id: 10,  name: "Yunus",         arabic: "يُونُس",           ayat: 109, juz: 11 },
  { id: 11,  name: "Hud",           arabic: "هُود",             ayat: 123, juz: 11 },
  { id: 12,  name: "Yusuf",         arabic: "يُوسُف",           ayat: 111, juz: 12 },
  { id: 13,  name: "Ar-Ra'd",       arabic: "الرَّعْد",         ayat: 43,  juz: 13 },
  { id: 14,  name: "Ibrahim",       arabic: "إِبْرَاهِيم",      ayat: 52,  juz: 13 },
  { id: 15,  name: "Al-Hijr",       arabic: "الْحِجْر",         ayat: 99,  juz: 14 },
  { id: 16,  name: "An-Nahl",       arabic: "النَّحْل",         ayat: 128, juz: 14 },
  { id: 17,  name: "Al-Isra",       arabic: "الْإِسْرَاء",      ayat: 111, juz: 15 },
  { id: 18,  name: "Al-Kahfi",      arabic: "الْكَهْف",         ayat: 110, juz: 15 },
  { id: 19,  name: "Maryam",        arabic: "مَرْيَم",          ayat: 98,  juz: 16 },
  { id: 20,  name: "Taha",          arabic: "طه",               ayat: 135, juz: 16 },
  { id: 21,  name: "Al-Anbiya",     arabic: "الْأَنْبِيَاء",    ayat: 112, juz: 17 },
  { id: 22,  name: "Al-Hajj",       arabic: "الْحَجّ",          ayat: 78,  juz: 17 },
  { id: 23,  name: "Al-Mu'minun",   arabic: "الْمُؤْمِنُون",    ayat: 118, juz: 18 },
  { id: 24,  name: "An-Nur",        arabic: "النُّور",          ayat: 64,  juz: 18 },
  { id: 25,  name: "Al-Furqan",     arabic: "الْفُرْقَان",      ayat: 77,  juz: 18 },
  { id: 26,  name: "Asy-Syu'ara",   arabic: "الشُّعَرَاء",      ayat: 227, juz: 19 },
  { id: 27,  name: "An-Naml",       arabic: "النَّمْل",         ayat: 93,  juz: 19 },
  { id: 28,  name: "Al-Qasas",      arabic: "الْقَصَص",         ayat: 88,  juz: 20 },
  { id: 29,  name: "Al-Ankabut",    arabic: "الْعَنْكَبُوت",    ayat: 69,  juz: 20 },
  { id: 30,  name: "Ar-Rum",        arabic: "الرُّوم",          ayat: 60,  juz: 21 },
  { id: 31,  name: "Luqman",        arabic: "لُقْمَان",         ayat: 34,  juz: 21 },
  { id: 32,  name: "As-Sajdah",     arabic: "السَّجْدَة",       ayat: 30,  juz: 21 },
  { id: 33,  name: "Al-Ahzab",      arabic: "الْأَحْزَاب",      ayat: 73,  juz: 21 },
  { id: 34,  name: "Saba",          arabic: "سَبَأ",            ayat: 54,  juz: 22 },
  { id: 35,  name: "Fatir",         arabic: "فَاطِر",           ayat: 45,  juz: 22 },
  { id: 36,  name: "Yasin",         arabic: "يس",               ayat: 83,  juz: 22 },
  { id: 37,  name: "As-Saffat",     arabic: "الصَّافَّات",      ayat: 182, juz: 23 },
  { id: 38,  name: "Sad",           arabic: "ص",                ayat: 88,  juz: 23 },
  { id: 39,  name: "Az-Zumar",      arabic: "الزُّمَر",         ayat: 75,  juz: 23 },
  { id: 40,  name: "Gafir",         arabic: "غَافِر",           ayat: 85,  juz: 24 },
  { id: 41,  name: "Fussilat",      arabic: "فُصِّلَت",         ayat: 54,  juz: 24 },
  { id: 42,  name: "Asy-Syura",     arabic: "الشُّورَى",        ayat: 53,  juz: 25 },
  { id: 43,  name: "Az-Zukhruf",    arabic: "الزُّخْرُف",       ayat: 89,  juz: 25 },
  { id: 44,  name: "Ad-Dukhan",     arabic: "الدُّخَان",        ayat: 59,  juz: 25 },
  { id: 45,  name: "Al-Jasiyah",    arabic: "الْجَاثِيَة",      ayat: 37,  juz: 25 },
  { id: 46,  name: "Al-Ahqaf",      arabic: "الْأَحْقَاف",      ayat: 35,  juz: 26 },
  { id: 47,  name: "Muhammad",      arabic: "مُحَمَّد",         ayat: 38,  juz: 26 },
  { id: 48,  name: "Al-Fath",       arabic: "الْفَتْح",         ayat: 29,  juz: 26 },
  { id: 49,  name: "Al-Hujurat",    arabic: "الْحُجُرَات",      ayat: 18,  juz: 26 },
  { id: 50,  name: "Qaf",           arabic: "ق",                ayat: 45,  juz: 26 },
  { id: 51,  name: "Az-Zariyat",    arabic: "الذَّارِيَات",     ayat: 60,  juz: 26 },
  { id: 52,  name: "At-Tur",        arabic: "الطُّور",          ayat: 49,  juz: 27 },
  { id: 53,  name: "An-Najm",       arabic: "النَّجْم",         ayat: 62,  juz: 27 },
  { id: 54,  name: "Al-Qamar",      arabic: "الْقَمَر",         ayat: 55,  juz: 27 },
  { id: 55,  name: "Ar-Rahman",     arabic: "الرَّحْمَن",       ayat: 78,  juz: 27 },
  { id: 56,  name: "Al-Waqi'ah",    arabic: "الْوَاقِعَة",      ayat: 96,  juz: 27 },
  { id: 57,  name: "Al-Hadid",      arabic: "الْحَدِيد",        ayat: 29,  juz: 27 },
  { id: 58,  name: "Al-Mujadilah",  arabic: "الْمُجَادِلَة",    ayat: 22,  juz: 28 },
  { id: 59,  name: "Al-Hasyr",      arabic: "الْحَشْر",         ayat: 24,  juz: 28 },
  { id: 60,  name: "Al-Mumtahanah", arabic: "الْمُمْتَحَنَة",   ayat: 13,  juz: 28 },
  { id: 61,  name: "As-Saf",        arabic: "الصَّف",           ayat: 14,  juz: 28 },
  { id: 62,  name: "Al-Jumu'ah",    arabic: "الْجُمُعَة",       ayat: 11,  juz: 28 },
  { id: 63,  name: "Al-Munafiqun",  arabic: "الْمُنَافِقُون",   ayat: 11,  juz: 28 },
  { id: 64,  name: "At-Tagabun",    arabic: "التَّغَابُن",      ayat: 18,  juz: 28 },
  { id: 65,  name: "At-Talaq",      arabic: "الطَّلَاق",        ayat: 12,  juz: 28 },
  { id: 66,  name: "At-Tahrim",     arabic: "التَّحْرِيم",      ayat: 12,  juz: 28 },
  { id: 67,  name: "Al-Mulk",       arabic: "الْمُلْك",         ayat: 30,  juz: 29 },
  { id: 68,  name: "Al-Qalam",      arabic: "الْقَلَم",         ayat: 52,  juz: 29 },
  { id: 69,  name: "Al-Haqqah",     arabic: "الْحَاقَّة",       ayat: 52,  juz: 29 },
  { id: 70,  name: "Al-Ma'arij",    arabic: "الْمَعَارِج",      ayat: 44,  juz: 29 },
  { id: 71,  name: "Nuh",           arabic: "نُوح",             ayat: 28,  juz: 29 },
  { id: 72,  name: "Al-Jin",        arabic: "الْجِن",           ayat: 28,  juz: 29 },
  { id: 73,  name: "Al-Muzzammil",  arabic: "الْمُزَّمِّل",     ayat: 20,  juz: 29 },
  { id: 74,  name: "Al-Muddassir",  arabic: "الْمُدَّثِّر",     ayat: 56,  juz: 29 },
  { id: 75,  name: "Al-Qiyamah",    arabic: "الْقِيَامَة",      ayat: 40,  juz: 29 },
  { id: 76,  name: "Al-Insan",      arabic: "الْإِنْسَان",      ayat: 31,  juz: 29 },
  { id: 77,  name: "Al-Mursalat",   arabic: "الْمُرْسَلَات",    ayat: 50,  juz: 29 },
  { id: 78,  name: "An-Naba",       arabic: "النَّبَأ",         ayat: 40,  juz: 30 },
  { id: 79,  name: "An-Nazi'at",    arabic: "النَّازِعَات",     ayat: 46,  juz: 30 },
  { id: 80,  name: "'Abasa",        arabic: "عَبَسَ",           ayat: 42,  juz: 30 },
  { id: 81,  name: "At-Takwir",     arabic: "التَّكْوِير",      ayat: 29,  juz: 30 },
  { id: 82,  name: "Al-Infitar",    arabic: "الْإِنْفِطَار",    ayat: 19,  juz: 30 },
  { id: 83,  name: "Al-Mutaffifin", arabic: "الْمُطَفِّفِين",   ayat: 36,  juz: 30 },
  { id: 84,  name: "Al-Insyiqaq",   arabic: "الِانْشِقَاق",     ayat: 25,  juz: 30 },
  { id: 85,  name: "Al-Buruj",      arabic: "الْبُرُوج",        ayat: 22,  juz: 30 },
  { id: 86,  name: "At-Tariq",      arabic: "الطَّارِق",        ayat: 17,  juz: 30 },
  { id: 87,  name: "Al-A'la",       arabic: "الْأَعْلَى",       ayat: 19,  juz: 30 },
  { id: 88,  name: "Al-Gasyiyah",   arabic: "الْغَاشِيَة",      ayat: 26,  juz: 30 },
  { id: 89,  name: "Al-Fajr",       arabic: "الْفَجْر",         ayat: 30,  juz: 30 },
  { id: 90,  name: "Al-Balad",      arabic: "الْبَلَد",         ayat: 20,  juz: 30 },
  { id: 91,  name: "Asy-Syams",     arabic: "الشَّمْس",         ayat: 15,  juz: 30 },
  { id: 92,  name: "Al-Lail",       arabic: "اللَّيْل",         ayat: 21,  juz: 30 },
  { id: 93,  name: "Ad-Duha",       arabic: "الضُّحَى",         ayat: 11,  juz: 30 },
  { id: 94,  name: "Asy-Syarh",     arabic: "الشَّرْح",         ayat: 8,   juz: 30 },
  { id: 95,  name: "At-Tin",        arabic: "التِّين",          ayat: 8,   juz: 30 },
  { id: 96,  name: "Al-'Alaq",      arabic: "الْعَلَق",         ayat: 19,  juz: 30 },
  { id: 97,  name: "Al-Qadr",       arabic: "الْقَدْر",         ayat: 5,   juz: 30 },
  { id: 98,  name: "Al-Bayyinah",   arabic: "الْبَيِّنَة",      ayat: 8,   juz: 30 },
  { id: 99,  name: "Az-Zalzalah",   arabic: "الزَّلْزَلَة",     ayat: 8,   juz: 30 },
  { id: 100, name: "Al-Adiyat",     arabic: "الْعَادِيَات",     ayat: 11,  juz: 30 },
  { id: 101, name: "Al-Qariah",     arabic: "الْقَارِعَة",      ayat: 11,  juz: 30 },
  { id: 102, name: "At-Takasur",    arabic: "التَّكَاثُر",      ayat: 8,   juz: 30 },
  { id: 103, name: "Al-Asr",        arabic: "الْعَصْر",         ayat: 3,   juz: 30 },
  { id: 104, name: "Al-Humazah",    arabic: "الْهُمَزَة",       ayat: 9,   juz: 30 },
  { id: 105, name: "Al-Fil",        arabic: "الْفِيل",          ayat: 5,   juz: 30 },
  { id: 106, name: "Quraisy",       arabic: "قُرَيْش",          ayat: 4,   juz: 30 },
  { id: 107, name: "Al-Maun",       arabic: "الْمَاعُون",       ayat: 7,   juz: 30 },
  { id: 108, name: "Al-Kautsar",    arabic: "الْكَوْثَر",       ayat: 3,   juz: 30 },
  { id: 109, name: "Al-Kafirun",    arabic: "الْكَافِرُون",     ayat: 6,   juz: 30 },
  { id: 110, name: "An-Nasr",       arabic: "النَّصْر",         ayat: 3,   juz: 30 },
  { id: 111, name: "Al-Masad",      arabic: "الْمَسَد",         ayat: 5,   juz: 30 },
  { id: 112, name: "Al-Ikhlas",     arabic: "الْإِخْلَاص",      ayat: 4,   juz: 30 },
  { id: 113, name: "Al-Falaq",      arabic: "الْفَلَق",         ayat: 5,   juz: 30 },
  { id: 114, name: "An-Nas",        arabic: "النَّاس",          ayat: 6,   juz: 30 },
];

const METHODS = [
  {
    id: "chunking",
    name: "Chunking Method",
    icon: "◈",
    color: "#C8A96E",
    ref: "Miller (1956) — 7±2 chunks optimal",
    desc: "Hafal 3–5 ayat per sesi, kelompokkan berdasarkan tema makna",
    steps: ["Baca 1 ayat 7x", "Tutup & ulang dari ingatan", "Tambah ayat berikut", "Gabung & ulang semua"],
  },
  {
    id: "spaced",
    name: "Spaced Repetition",
    icon: "⟳",
    color: "#7BAFD4",
    ref: "Ebbinghaus (1885) — Forgetting Curve",
    desc: "Review pada interval yang semakin bertambah untuk konsolidasi memori jangka panjang",
    steps: ["Hari 1: Hafal baru", "Hari 2: Review 3x", "Hari 4: Review 2x", "Hari 7: Review 1x"],
  },
  {
    id: "multisensory",
    name: "Multi-Sensory",
    icon: "◎",
    color: "#9B7EC8",
    ref: "Paivio (1986) + Shams & Seitz (2008)",
    desc: "Gabungkan visual, audio (murattal), dan kinestetik (menulis) secara bersamaan",
    steps: ["Dengar murattal 3x", "Ikuti sambil melihat", "Tulis ayat tangan", "Recite tanpa lihat"],
  },
  {
    id: "semantic",
    name: "Semantic Encoding",
    icon: "◐",
    color: "#6BAF92",
    ref: "Craik & Lockhart (1972) — Levels of Processing",
    desc: "Pahami makna sebelum menghafal — deep processing lebih kuat dari rote memorization",
    steps: ["Baca terjemahan", "Visualisasikan maknanya", "Hafal dengan konteks", "Jelaskan makna pada orang lain"],
  },
];

const SCHEDULE_INTERVALS = [1, 3, 7, 14, 30, 60]; // spaced repetition days

// ===== INITIAL STATE =====
const initHafalanData = () => {
  const data = {};
  SURAHS.forEach(s => {
    data[s.id] = {
      status: "belum", // belum / proses / hafal
      progress: 0,
      lastReview: null,
      nextReview: null,
      repetitions: 0,
      method: "chunking",
    };
  });
  return data;
};

// ===== AUTH SCREEN (standalone component — no hooks issue) =====
const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#141824", border: "1px solid #1E2535", borderRadius: 12,
  padding: "13px 16px", color: "#E8DCC8", fontSize: 13,
  fontFamily: "'DM Sans', sans-serif", outline: "none",
};

function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handle = async () => {
    setLoading(true); setMsg("");
    try {
      if (tab === "login") {
        const data = await signIn(email, password);
        // data = { user, session } from Supabase
        const loggedUser = data?.user || data?.session?.user;
        if (loggedUser) {
          onLogin(loggedUser);
        } else {
          setMsg("Login berhasil, memuat data...");
        }
      } else {
        await signUp(email, password, nama);
        setMsg("✓ Cek email untuk konfirmasi, lalu login.");
      }
    } catch (e) { setMsg(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0C14", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 24px", maxWidth: 430, margin: "0 auto",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ fontSize: 18, color: "#C8A96E66", fontFamily: "serif", marginBottom: 14, letterSpacing: 3 }}>
          بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
        </div>
        <h1 style={{ fontSize: 34, fontFamily: "'Playfair Display', serif", color: "#E8DCC8", margin: 0, lineHeight: 1.2 }}>
          Hafalan<br /><span style={{ color: "#C8A96E" }}>Al-Qur'an</span>
        </h1>
        <div style={{ fontSize: 10, color: "#2A3050", marginTop: 10, letterSpacing: "0.18em", fontFamily: "'DM Sans', sans-serif" }}>
          B.O.A. INDONESIA • BERBASIS NEUROSAINS
        </div>
      </div>

      <div style={{ display: "flex", marginBottom: 20, background: "#141824", borderRadius: 12, padding: 4, width: "100%" }}>
        {["login","register"].map(t => (
          <button key={t} onClick={() => { setTab(t); setMsg(""); }} style={{
            flex: 1, padding: "10px 0", border: "none", borderRadius: 9, cursor: "pointer",
            background: tab === t ? "#C8A96E" : "transparent",
            color: tab === t ? "#0A0C14" : "#4A5068",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
            fontFamily: "'DM Sans', sans-serif",
          }}>{t === "login" ? "MASUK" : "DAFTAR"}</button>
        ))}
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        {tab === "register" && (
          <input value={nama} onChange={e => setNama(e.target.value)}
            placeholder="Nama lengkap" style={inputStyle} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" type="email" style={inputStyle} />
        <input value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password (min. 6 karakter)" type="password" style={inputStyle}
          onKeyDown={e => e.key === "Enter" && handle()} />

        {msg && (
          <div style={{
            fontSize: 11, padding: "10px 14px", borderRadius: 10,
            background: msg.startsWith("✓") ? "#6BAF9215" : "#E8504015",
            color: msg.startsWith("✓") ? "#6BAF92" : "#E85040",
            border: `1px solid ${msg.startsWith("✓") ? "#6BAF9240" : "#E8504040"}`,
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
          }}>{msg}</div>
        )}

        <button onClick={handle} disabled={loading} style={{
          width: "100%", padding: "16px 0", marginTop: 4,
          background: loading ? "#5A4A2E" : "linear-gradient(135deg, #C8A96E, #A8893E)",
          border: "none", borderRadius: 14, cursor: loading ? "not-allowed" : "pointer",
          color: "#0A0C14", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {loading ? "Memproses..." : tab === "login" ? "✦ MASUK" : "✦ DAFTAR SEKARANG"}
        </button>
      </div>

      <div style={{ marginTop: 40, fontSize: 9, color: "#1E2535", letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}>
        B.O.A. INDONESIA © 2026
      </div>
    </div>
  );
}


function SurahDetailScreen({ surah, hafalanData, markStatus, onBack }) {
    const [ayahs, setAyahs] = useState([]);
    const [terjemahan, setTerjemahan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTerjemahan, setShowTerjemahan] = useState(true);
    const [activeAyah, setActiveAyah] = useState(null);
    const d = hafalanData[surah.id];

    useEffect(() => {
      const fetchAyahs = async () => {
        setLoading(true); setError(null);
        try {
          const [arRes, idRes] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/surah/${surah.id}/quran-uthmani`),
            fetch(`https://api.alquran.cloud/v1/surah/${surah.id}/id.indonesian`),
          ]);
          const arData = await arRes.json();
          const idData = await idRes.json();
          if (arData.code === 200) setAyahs(arData.data.ayahs);
          if (idData.code === 200) setTerjemahan(idData.data.ayahs);
        } catch (e) {
          setError("Gagal memuat. Periksa koneksi internet.");
        } finally { setLoading(false); }
      };
      fetchAyahs();
    }, [surah.id]);

    return (
      <div style={{ paddingBottom: 140 }}>
        {/* Sticky header */}
        <div style={{
          background: "#0A0C14", padding: "52px 20px 16px",
          borderBottom: "1px solid #1E2535",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <button onClick={onBack} style={{
              background: "#1E2535", border: "1px solid #2A3045", borderRadius: 10,
              color: "#C8A96E", fontSize: 20, width: 38, height: 38,
              cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", color: "#E8DCC8" }}>{surah.name}</span>
                <span style={{ fontSize: 22, color: "#C8A96E", fontFamily: "serif" }}>{surah.arabic}</span>
              </div>
              <div style={{ fontSize: 10, color: "#4A5068", marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>
                {surah.ayat} ayat • Juz {surah.juz} •
                <span style={{ color: d.status === "hafal" ? "#C8A96E" : d.status === "proses" ? "#7BAFD4" : "#4A5068", marginLeft: 4, fontWeight: 700, textTransform: "uppercase" }}>{d.status}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowTerjemahan(v => !v)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
              background: showTerjemahan ? "#7BAFD418" : "#141824",
              border: `1px solid ${showTerjemahan ? "#7BAFD4" : "#1E2535"}`,
              color: showTerjemahan ? "#7BAFD4" : "#4A5068",
              fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}>◎ TERJEMAHAN</button>
            {d.status !== "hafal" ? (
              <button onClick={() => markStatus(surah.id, "hafal")} style={{
                flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                background: "#C8A96E18", border: "1px solid #C8A96E55",
                color: "#C8A96E", fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              }}>✓ TANDAI HAFAL</button>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#C8A96E", fontSize: 20 }}>✦</div>
            )}
          </div>
        </div>

        {/* Bismillah */}
        {surah.id !== 9 && surah.id !== 1 && (
          <div style={{ textAlign: "center", padding: "24px 20px 8px", fontSize: 26, color: "#C8A96E", fontFamily: "'Scheherazade New', serif", direction: "rtl", lineHeight: 2 }}>
            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#4A5068", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
            <div style={{ fontSize: 32, color: "#C8A96E55", marginBottom: 12 }}>◈</div>
            Memuat teks Al-Qur'an Madinah...
          </div>
        )}

        {error && (
          <div style={{ margin: 20, background: "#E8504015", border: "1px solid #E8504040", borderRadius: 14, padding: 16, fontSize: 12, color: "#E85040", fontFamily: "'DM Sans', sans-serif" }}>
            {error}
          </div>
        )}

        {!loading && !error && ayahs.map((ayah, idx) => {
          const tr = terjemahan[idx];
          const active = activeAyah === ayah.numberInSurah;
          return (
            <div key={ayah.number} onClick={() => setActiveAyah(active ? null : ayah.numberInSurah)}
              style={{ padding: "18px 20px", borderBottom: "1px solid #141824", background: active ? "#C8A96E08" : "transparent", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: active ? "#C8A96E" : "#1E2535",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: active ? "#0A0C14" : "#4A5068",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}>{ayah.numberInSurah}</div>
              </div>
              <div style={{
                fontSize: 24, fontFamily: "'Scheherazade New', 'Traditional Arabic', serif",
                color: "#E8DCC8", direction: "rtl", textAlign: "right", lineHeight: 2.2,
              }}>
                {ayah.text} <span style={{ color: "#C8A96E88", fontSize: 18 }}>﴿{ayah.numberInSurah}﴾</span>
              </div>
              {showTerjemahan && tr && (
                <div style={{ fontSize: 12, color: "#5A6080", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, borderTop: "1px solid #1A1E2E", paddingTop: 10, marginTop: 10, fontStyle: "italic" }}>
                  {tr.text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
}


export default function QuranHafalanApp() {
  const [screen, setScreen] = useState("dashboard");
  const [hafalanData, setHafalanData] = useState(initHafalanData());
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("chunking");
  const [activeTab, setActiveTab] = useState("semua");
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [sessionStep, setSessionStep] = useState(0);
  const [showMethodDetail, setShowMethodDetail] = useState(null);
  const [todayDone, setTodayDone] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeJuz, setActiveJuz] = useState(0);
  const [selectedSurahDetail, setSelectedSurahDetail] = useState(null);
  const timerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [reminders, setReminders] = useState({ subuh: true, pagi: false, ashar: true, isya: true });

  // ===== ALL HOOKS FIRST — no early returns before this =====

  // Timer
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      }
      setAuthChecked(true);
    }).catch(() => setAuthChecked(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setHafalanData(initHafalanData());
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    setSyncing(true);
    try {
      const hafalanRows = await loadHafalan(userId);
      if (hafalanRows?.length > 0) {
        const newData = initHafalanData();
        hafalanRows.forEach(row => {
          newData[row.surah_id] = {
            status: row.status,
            progress: row.progress,
            repetitions: row.repetitions,
            lastReview: row.last_review,
            nextReview: row.next_review,
            method: row.method || "chunking",
          };
        });
        setHafalanData(newData);
      }
      const reminderRows = await loadReminders(userId);
      if (reminderRows?.length > 0) {
        const r = { subuh: true, pagi: false, ashar: true, isya: true };
        reminderRows.forEach(row => { r[row.sesi] = row.aktif; });
        setReminders(r);
      }
    } catch (e) {
      console.error("loadUserData error:", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    try { await signOut(); } catch(e) {}
    setUser(null);
    setHafalanData(initHafalanData());
  };

  // ===== CONDITIONAL RENDERS (after all hooks) =====
  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0C14", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#C8A96E66", fontSize: 32 }}>◈</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={(u) => { setUser(u); loadUserData(u.id); }} />;
  }

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const stats = {
    hafal: Object.values(hafalanData).filter(d => d.status === "hafal").length,
    proses: Object.values(hafalanData).filter(d => d.status === "proses").length,
    total: SURAHS.length,
  };

  const dueToday = SURAHS.filter(s => {
    const d = hafalanData[s.id];
    if (!d.nextReview) return false;
    return new Date(d.nextReview) <= new Date();
  });

  const markStatus = async (surahId, status) => {
    const now = new Date();
    const nextReview = new Date(now.getTime() + SCHEDULE_INTERVALS[0] * 86400000).toISOString();
    const payload = {
      status,
      lastReview: now.toISOString(),
      nextReview: status === "hafal" ? nextReview : null,
      repetitions: (hafalanData[surahId].repetitions || 0) + 1,
      progress: status === "hafal" ? 100 : status === "proses" ? 50 : 0,
    };
    setHafalanData(prev => ({ ...prev, [surahId]: { ...prev[surahId], ...payload } }));
    if (status === "hafal") setTodayDone(d => d + 1);
    // Sync to Supabase
    if (user) {
      try {
        await upsertHafalan(user.id, surahId, {
          status: payload.status,
          progress: payload.progress,
          repetitions: payload.repetitions,
          last_review: payload.lastReview,
          next_review: payload.nextReview,
        });
      } catch (e) { console.error("Sync error:", e); }
    }
  };

  const markMuraja = async (surahId, quality) => {
    const d = hafalanData[surahId];
    const rep = d.repetitions || 0;
    const nextIdx = Math.min(rep, SCHEDULE_INTERVALS.length - 1);
    const days = quality === "lancar" ? SCHEDULE_INTERVALS[nextIdx] : 1;
    const nextReview = new Date(Date.now() + days * 86400000).toISOString();
    const now = new Date().toISOString();
    setHafalanData(prev => ({
      ...prev,
      [surahId]: { ...prev[surahId], nextReview, lastReview: now, repetitions: rep + 1 }
    }));
    // Sync to Supabase
    if (user) {
      try {
        await upsertHafalan(user.id, surahId, {
          next_review: nextReview,
          last_review: now,
          repetitions: rep + 1,
        });
        await insertMurajaLog(user.id, surahId, quality === "lancar" ? "lancar" : "perlu_ulang", timer);
      } catch (e) { console.error("Muraja sync error:", e); }
    }
  };

// ===== UI SCREENS =====

  const NavBar = () => (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "linear-gradient(180deg, rgba(10,12,20,0) 0%, #0A0C14 15%)",
      display: "flex", flexDirection: "column",
      zIndex: 100, backdropFilter: "blur(12px)",
    }}>
      {/* Nav buttons */}
      <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0 6px" }}>
        {[
          { id: "dashboard", icon: "⌂", label: "Beranda" },
          { id: "hafalan", icon: "◈", label: "Hafalan" },
          { id: "muraja", icon: "⟳", label: "Muraja'ah" },
          { id: "jadwal", icon: "◷", label: "Jadwal" },
          { id: "metode", icon: "◎", label: "Metode" },
        ].map(nav => (
          <button key={nav.id} onClick={() => { setScreen(nav.id); setSelectedSurahDetail(null); }} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: (screen === nav.id || (nav.id === 'hafalan' && selectedSurahDetail)) ? "#C8A96E" : "#4A5068",
            transition: "color 0.2s", padding: "4px 10px",
          }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>{nav.icon}</span>
            <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", fontWeight: 500 }}>{nav.label}</span>
          </button>
        ))}
      </div>
      {/* Footer copyright */}
      <div style={{
        textAlign: "center",
        padding: "6px 0 calc(10px + env(safe-area-inset-bottom, 8px))",
        borderTop: "1px solid #1A1E2E",
      }}>
        <span style={{
          fontSize: 9, color: "#2A3050", fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "0.12em", fontWeight: 600,
        }}>B.O.A. INDONESIA © 2026</span>
      </div>
    </nav>
  );

  // DASHBOARD
  const Dashboard = () => (
    <div style={{ padding: "0 20px 140px" }}>
      {/* Header */}
      <div style={{ padding: "56px 0 32px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4A5068", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
              بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
            </div>
            <h1 style={{ fontSize: 28, fontFamily: "'Playfair Display', Georgia, serif", color: "#E8DCC8", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              Hafalan<br /><span style={{ color: "#C8A96E" }}>Al-Qur'an</span>
            </h1>
            <div style={{ fontSize: 10, color: "#4A5068", marginTop: 8, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em" }}>
              BERBASIS NEUROSAINS • UNTUK ORANG DEWASA
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, paddingTop: 4 }}>
            {syncing && (
              <div style={{ fontSize: 9, color: "#7BAFD4", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em" }}>
                ⟳ SYNCING...
              </div>
            )}
            <div style={{ fontSize: 9, color: "#C8A96E88", fontFamily: "'DM Sans', sans-serif", maxWidth: 100, textAlign: "right", letterSpacing: "0.05em" }}>
              {user.email?.split("@")[0]}
            </div>
            <button onClick={handleLogout} style={{
              background: "#1E2535", border: "1px solid #2A3045", borderRadius: 8,
              color: "#4A5068", fontSize: 9, padding: "5px 10px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em",
            }}>KELUAR</button>
          </div>
        </div>
      </div>

      {/* Stats Ring */}
      <div style={{
        background: "linear-gradient(135deg, #141824 0%, #0D1018 100%)",
        borderRadius: 20, padding: 24, marginBottom: 20,
        border: "1px solid #1E2535",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="45" cy="45" r="38" fill="none" stroke="#1E2535" strokeWidth="6" />
            <circle cx="45" cy="45" r="38" fill="none" stroke="#C8A96E" strokeWidth="6"
              strokeDasharray={`${(stats.hafal / stats.total) * 239} 239`}
              strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#C8A96E", fontFamily: "'Playfair Display', serif" }}>{stats.hafal}</span>
            <span style={{ fontSize: 9, color: "#4A5068", letterSpacing: "0.1em" }}>SURAH</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#E8DCC8", fontSize: 15, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Progress Hafalan</div>
          {[
            { label: "Hafal", value: stats.hafal, color: "#C8A96E" },
            { label: "Dalam Proses", value: stats.proses, color: "#7BAFD4" },
            { label: "Belum Mulai", value: stats.total - stats.hafal - stats.proses, color: "#2A3045" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "#6A7090", flex: 1, fontFamily: "'DM Sans', sans-serif" }}>{s.label}</span>
              <span style={{ fontSize: 12, color: "#E8DCC8", fontWeight: 600 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Tasks */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "#E8DCC8", fontFamily: "'Playfair Display', serif", letterSpacing: "0.02em" }}>Agenda Hari Ini</span>
          <span style={{ fontSize: 10, color: "#C8A96E", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em" }}>
            {todayDone} SELESAI
          </span>
        </div>

        {dueToday.length > 0 ? dueToday.slice(0, 3).map(s => (
          <div key={s.id} style={{
            background: "#141824", borderRadius: 14, padding: "14px 16px",
            marginBottom: 10, border: "1px solid #1E2535",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #7BAFD4, #5A8FB4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "#fff", flexShrink: 0,
            }}>⟳</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "#E8DCC8", fontFamily: "'Playfair Display', serif" }}>{s.name}</div>
              <div style={{ fontSize: 10, color: "#4A5068", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>Muraja'ah terjadwal</div>
            </div>
            <button onClick={() => { setSelectedSurah(s); setSelectedSurahDetail(null); setScreen("muraja"); }} style={{
              background: "#1E2535", border: "1px solid #2A3045", borderRadius: 8,
              color: "#7BAFD4", fontSize: 10, padding: "6px 12px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em",
            }}>MULAI</button>
          </div>
        )) : (
          <div style={{
            background: "#141824", borderRadius: 14, padding: 20, textAlign: "center",
            border: "1px solid #1E2535",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✦</div>
            <div style={{ fontSize: 12, color: "#C8A96E", fontFamily: "'DM Sans', sans-serif" }}>Tidak ada muraja'ah terjadwal hari ini</div>
            <div style={{ fontSize: 10, color: "#4A5068", marginTop: 4 }}>Mulai hafalan baru atau tambah waktu belajar</div>
          </div>
        )}
      </div>

      {/* Method Highlight */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#E8DCC8", fontFamily: "'Playfair Display', serif", marginBottom: 14 }}>
          Metode Ilmiah Aktif
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {METHODS.slice(0, 4).map(m => (
            <div key={m.id} onClick={() => { setSelectedMethod(m.id); setScreen("metode"); }}
              style={{
                background: "#141824", borderRadius: 14, padding: 14,
                border: `1px solid ${m.color}22`, cursor: "pointer",
              }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 11, color: m.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 9, color: "#4A5068", marginTop: 4, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{m.ref}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <button onClick={() => { setScreen("hafalan"); setSelectedSurahDetail(null); }} style={{
        width: "100%", padding: "16px 0",
        background: "linear-gradient(135deg, #C8A96E, #A8893E)",
        border: "none", borderRadius: 16, cursor: "pointer",
        color: "#0A0C14", fontSize: 13, fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em",
      }}>
        ✦ MULAI SESI HAFALAN
      </button>
    </div>
  );

  // HAFALAN SCREEN — 114 Surah lengkap
  const HafalanScreen = () => {
    // Filter by status tab
    let filtered = activeTab === "semua" ? SURAHS
      : activeTab === "proses" ? SURAHS.filter(s => hafalanData[s.id].status === "proses")
      : activeTab === "hafal" ? SURAHS.filter(s => hafalanData[s.id].status === "hafal")
      : SURAHS.filter(s => hafalanData[s.id].status === "belum");

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.arabic.includes(q) ||
        String(s.id).includes(q)
      );
    }

    // Filter by juz
    if (activeJuz > 0) {
      filtered = filtered.filter(s => s.juz === activeJuz);
    }

    // Group by juz for display
    const grouped = filtered.reduce((acc, s) => {
      const j = s.juz;
      if (!acc[j]) acc[j] = [];
      acc[j].push(s);
      return acc;
    }, {});
    const juzKeys = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    // Progress per juz
    const juzProgress = (juz) => {
      const inJuz = SURAHS.filter(s => s.juz === juz);
      const done = inJuz.filter(s => hafalanData[s.id].status === "hafal").length;
      return { done, total: inJuz.length };
    };

    return (
      <div style={{ padding: "0 20px 140px" }}>
        <div style={{ padding: "52px 0 16px" }}>
          <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "#E8DCC8", margin: 0 }}>
            114 <span style={{ color: "#C8A96E" }}>Surah</span>
          </h2>
          <div style={{ fontSize: 10, color: "#4A5068", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
            {stats.hafal} hafal • {stats.proses} proses • {stats.total - stats.hafal - stats.proses} belum
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#4A5068" }}>⌕</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama surah..."
            style={{
              width: "100%", boxSizing: "border-box",
              background: "#141824", border: "1px solid #1E2535", borderRadius: 12,
              padding: "11px 14px 11px 36px", color: "#E8DCC8", fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "#4A5068", cursor: "pointer", fontSize: 16,
            }}>×</button>
          )}
        </div>

        {/* Status Tabs */}
        <div style={{ display: "flex", gap: 7, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
          {["semua", "proses", "hafal", "belum"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? "#C8A96E" : "#141824",
              border: `1px solid ${activeTab === tab ? "#C8A96E" : "#1E2535"}`,
              borderRadius: 20, padding: "6px 14px", cursor: "pointer",
              color: activeTab === tab ? "#0A0C14" : "#6A7090",
              fontSize: 10, fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, letterSpacing: "0.08em", whiteSpace: "nowrap",
            }}>{tab.toUpperCase()}</button>
          ))}
        </div>

        {/* Juz Filter Strip */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
          <button onClick={() => setActiveJuz(0)} style={{
            background: activeJuz === 0 ? "#7BAFD4" : "#141824",
            border: `1px solid ${activeJuz === 0 ? "#7BAFD4" : "#1E2535"}`,
            borderRadius: 20, padding: "5px 14px", cursor: "pointer",
            color: activeJuz === 0 ? "#0A0C14" : "#6A7090",
            fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, whiteSpace: "nowrap",
          }}>ALL JUZ</button>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => {
            const p = juzProgress(juz);
            const done = p.done === p.total && p.total > 0;
            return (
              <button key={juz} onClick={() => setActiveJuz(juz)} style={{
                background: activeJuz === juz ? "#7BAFD4" : done ? "#7BAFD422" : "#141824",
                border: `1px solid ${activeJuz === juz ? "#7BAFD4" : done ? "#7BAFD444" : "#1E2535"}`,
                borderRadius: 20, padding: "5px 12px", cursor: "pointer",
                color: activeJuz === juz ? "#0A0C14" : done ? "#7BAFD4" : "#6A7090",
                fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, whiteSpace: "nowrap",
              }}>{juz}</button>
            );
          })}
        </div>

        {/* Results count */}
        {(searchQuery || activeJuz > 0) && (
          <div style={{ fontSize: 10, color: "#4A5068", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
            {filtered.length} surah ditemukan
            {activeJuz > 0 && ` di Juz ${activeJuz}`}
          </div>
        )}

        {/* Grouped Surah List */}
        {filtered.length === 0 ? (
          <div style={{ background: "#141824", borderRadius: 14, padding: 24, textAlign: "center", border: "1px solid #1E2535" }}>
            <div style={{ fontSize: 24, color: "#4A5068", marginBottom: 8 }}>◈</div>
            <div style={{ fontSize: 12, color: "#4A5068", fontFamily: "'DM Sans', sans-serif" }}>Tidak ada surah yang cocok</div>
          </div>
        ) : juzKeys.map(juz => (
          <div key={juz}>
            {/* Juz Header */}
            {(activeJuz === 0 && !searchQuery) && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 6 }}>
                <div style={{
                  background: "#7BAFD418", border: "1px solid #7BAFD433", borderRadius: 8,
                  padding: "4px 12px", fontSize: 10, color: "#7BAFD4", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}>JUZ {juz}</div>
                <div style={{ flex: 1, height: 1, background: "#1E2535" }} />
                <div style={{ fontSize: 9, color: "#4A5068", fontFamily: "'DM Sans', sans-serif" }}>
                  {juzProgress(juz).done}/{juzProgress(juz).total} hafal
                </div>
              </div>
            )}

            {grouped[juz].map(s => {
              const d = hafalanData[s.id];
              return (
                <div key={s.id}
                  style={{
                    background: "#141824", borderRadius: 14, padding: "13px 14px",
                    marginBottom: 8, border: "1px solid #1E2535",
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                  }}
                  onClick={(e) => { if (!e.target.closest("button")) { setSelectedSurahDetail(s); } }}
                >
                  {/* Nomor */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: d.status === "hafal" ? "linear-gradient(135deg, #C8A96E, #A8893E)"
                      : d.status === "proses" ? "linear-gradient(135deg, #7BAFD4, #5A8FB4)"
                      : "#1E2535",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: d.status === "belum" ? "#4A5068" : "#fff",
                    fontFamily: "'Playfair Display', serif", fontWeight: 700,
                  }}>{s.id}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#E8DCC8", fontFamily: "'Playfair Display', serif" }}>{s.name}</span>
                      <span style={{ fontSize: 15, color: "#C8A96E88", fontFamily: "serif" }}>{s.arabic}</span>
                    </div>
                    <div style={{ fontSize: 9, color: "#4A5068", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>
                      {s.ayat} ayat • Juz {s.juz}
                      {d.status !== "belum" && ` • ${d.repetitions}× ulang`}
                      <span style={{ color: "#C8A96E55", marginLeft: 4 }}>• Tap untuk baca ›</span>
                    </div>
                    {d.status !== "belum" && (
                      <div style={{ marginTop: 5, height: 2, background: "#1E2535", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${d.progress}%`, background: d.status === "hafal" ? "#C8A96E" : "#7BAFD4", borderRadius: 2, transition: "width 0.4s" }} />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                    {d.status !== "hafal" && (
                      <button onClick={() => markStatus(s.id, "hafal")} style={{
                        background: "#C8A96E18", border: "1px solid #C8A96E44",
                        borderRadius: 7, color: "#C8A96E", fontSize: 9,
                        padding: "5px 9px", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                      }}>HAFAL ✓</button>
                    )}
                    {d.status === "belum" && (
                      <button onClick={() => markStatus(s.id, "proses")} style={{
                        background: "#7BAFD418", border: "1px solid #7BAFD444",
                        borderRadius: 7, color: "#7BAFD4", fontSize: 9,
                        padding: "5px 9px", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                      }}>MULAI</button>
                    )}
                    {d.status === "hafal" && (
                      <span style={{ fontSize: 16, color: "#C8A96E", textAlign: "center" }}>✦</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // MURAJA'AH SCREEN
  const MurajaScreen = () => {
    const hafalSurahs = SURAHS.filter(s => hafalanData[s.id].status === "hafal" || hafalanData[s.id].status === "proses");

    return (
      <div style={{ padding: "0 20px 140px" }}>
        <div style={{ padding: "56px 0 24px" }}>
          <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "#E8DCC8", margin: 0 }}>
            Muraja'ah <span style={{ color: "#7BAFD4" }}>& Ujian</span>
          </h2>
          <div style={{ fontSize: 11, color: "#4A5068", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
            Retrieval Practice — Karpicke & Roediger (2008)
          </div>
        </div>

        {/* Timer Card */}
        <div style={{
          background: "linear-gradient(135deg, #141824, #0D1018)", borderRadius: 20,
          padding: 24, marginBottom: 20, border: "1px solid #1E2535", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, fontFamily: "'Playfair Display', serif", color: "#C8A96E", letterSpacing: 4, marginBottom: 16 }}>
            {formatTime(timer)}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => setTimerActive(!timerActive)} style={{
              background: timerActive ? "#C8A96E22" : "linear-gradient(135deg, #C8A96E, #A8893E)",
              border: timerActive ? "1px solid #C8A96E" : "none",
              borderRadius: 12, padding: "10px 24px",
              color: timerActive ? "#C8A96E" : "#0A0C14",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em",
            }}>{timerActive ? "⏸ JEDA" : "▶ MULAI"}</button>
            <button onClick={() => { setTimer(0); setTimerActive(false); }} style={{
              background: "#1E2535", border: "1px solid #2A3045", borderRadius: 12,
              padding: "10px 20px", color: "#6A7090", fontSize: 12,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>RESET</button>
          </div>
        </div>

        {/* Method: 7-3-2-1 */}
        <div style={{
          background: "#141824", borderRadius: 16, padding: 18, marginBottom: 20,
          border: "1px solid #9B7EC822",
        }}>
          <div style={{ fontSize: 12, color: "#9B7EC8", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 10, letterSpacing: "0.1em" }}>
            ◎ TEKNIK 7-3-2-1 (Spaced Repetition)
          </div>
          {[
            { day: "Hari 1", times: 7, color: "#C8A96E" },
            { day: "Hari 2", times: 3, color: "#9B7EC8" },
            { day: "Hari 3", times: 2, color: "#7BAFD4" },
            { day: "Hari 7", times: 1, color: "#6BAF92" },
          ].map(r => (
            <div key={r.day} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "#4A5068", width: 48, fontFamily: "'DM Sans', sans-serif" }}>{r.day}</span>
              <div style={{ flex: 1, height: 6, background: "#1E2535", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${(r.times / 7) * 100}%`, background: r.color, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 11, color: r.color, fontWeight: 700, width: 24, textAlign: "right" }}>{r.times}×</span>
            </div>
          ))}
        </div>

        {/* Surah Cards for Muraja */}
        <div style={{ fontSize: 13, color: "#E8DCC8", fontFamily: "'Playfair Display', serif", marginBottom: 14 }}>
          Pilih Surah untuk Muraja'ah
        </div>

        {hafalSurahs.length === 0 ? (
          <div style={{
            background: "#141824", borderRadius: 14, padding: 24, textAlign: "center",
            border: "1px solid #1E2535",
          }}>
            <div style={{ fontSize: 11, color: "#4A5068", fontFamily: "'DM Sans', sans-serif" }}>
              Belum ada surah yang dihafal. Mulai dari menu Hafalan.
            </div>
          </div>
        ) : hafalSurahs.map(s => {
          const d = hafalanData[s.id];
          const nextDate = d.nextReview ? new Date(d.nextReview).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-";
          return (
            <div key={s.id} style={{
              background: "#141824", borderRadius: 14, padding: 16, marginBottom: 10,
              border: "1px solid #1E2535",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, color: "#E8DCC8", fontFamily: "'Playfair Display', serif" }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "#4A5068", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                    Review ke-{d.repetitions + 1} • Berikutnya: {nextDate}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: "#C8A96E" }}>{s.arabic}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => markMuraja(s.id, "lancar")} style={{
                  flex: 1, padding: "9px 0",
                  background: "linear-gradient(135deg, #6BAF9222, #4A8F7222)",
                  border: "1px solid #6BAF9244", borderRadius: 10,
                  color: "#6BAF92", fontSize: 10, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: "0.08em",
                }}>✓ LANCAR</button>
                <button onClick={() => markMuraja(s.id, "perlu")} style={{
                  flex: 1, padding: "9px 0",
                  background: "#C8A96E11", border: "1px solid #C8A96E33", borderRadius: 10,
                  color: "#C8A96E", fontSize: 10, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: "0.08em",
                }}>⟳ PERLU ULANG</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // JADWAL SCREEN
  const JadwalScreen = () => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const sessions = [
      { time: "05:00 – 06:00", label: "Subuh", desc: "Hafalan baru — otak paling segar (Neuroplasticity peak)", icon: "☽", color: "#C8A96E" },
      { time: "08:00 – 08:30", label: "Pagi", desc: "Review cepat — working memory consolidation", icon: "◎", color: "#7BAFD4" },
      { time: "15:00 – 15:30", label: "Ashar", desc: "Muraja'ah — retrieval practice (Karpicke, 2008)", icon: "⟳", color: "#9B7EC8" },
      { time: "20:00 – 20:30", label: "Isya", desc: "Pra-tidur — memory consolidation selama tidur", icon: "✦", color: "#6BAF92" },
    ];
    // reminders from parent state (synced to Supabase)
    const handleToggleReminder = async (key) => {
      const newVal = !reminders[key];
      setReminders(r => ({ ...r, [key]: newVal }));
      if (user) {
        try { await upsertReminder(user.id, key, newVal); }
        catch(e) { console.error(e); }
      }
    };

    return (
      <div style={{ padding: "0 20px 140px" }}>
        <div style={{ padding: "56px 0 24px" }}>
          <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "#E8DCC8", margin: 0 }}>
            Jadwal <span style={{ color: "#6BAF92" }}>Harian</span>
          </h2>
          <div style={{ fontSize: 11, color: "#4A5068", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
            Adult Learning Theory — Knowles (1980) + Park & Bischof (2013)
          </div>
        </div>

        {/* Week Strip */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {days.map((d, i) => {
            const isToday = i === new Date().getDay() - 1;
            return (
              <div key={d} style={{
                flex: 1, background: isToday ? "#C8A96E" : "#141824",
                borderRadius: 10, padding: "8px 4px", textAlign: "center",
                border: `1px solid ${isToday ? "#C8A96E" : "#1E2535"}`,
              }}>
                <div style={{ fontSize: 9, color: isToday ? "#0A0C14" : "#4A5068", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{d}</div>
                <div style={{ fontSize: 14, color: isToday ? "#0A0C14" : "#2A3045" }}>◆</div>
              </div>
            );
          })}
        </div>

        {/* Session Cards */}
        {sessions.map((s, i) => {
          const key = ["subuh", "pagi", "ashar", "isya"][i];
          return (
            <div key={s.label} style={{
              background: "#141824", borderRadius: 16, padding: 16, marginBottom: 12,
              border: `1px solid ${s.color}22`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: `${s.color}22`, border: `1px solid ${s.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: s.color,
              }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "#E8DCC8", fontFamily: "'Playfair Display', serif" }}>{s.label}</span>
                  <span style={{ fontSize: 10, color: s.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{s.time}</span>
                </div>
                <div style={{ fontSize: 10, color: "#4A5068", marginTop: 4, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              <button onClick={() => handleToggleReminder(key)} style={{
                width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                background: reminders[key] ? s.color : "#1E2535",
                position: "relative", flexShrink: 0, transition: "background 0.2s",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 8, background: "#fff",
                  position: "absolute", top: 2,
                  left: reminders[key] ? 18 : 2, transition: "left 0.2s",
                }} />
              </button>
            </div>
          );
        })}

        {/* Neuroscience tip */}
        <div style={{
          background: "linear-gradient(135deg, #C8A96E11, #A8893E0A)", borderRadius: 16,
          padding: 18, border: "1px solid #C8A96E22", marginTop: 8,
        }}>
          <div style={{ fontSize: 11, color: "#C8A96E", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 8, letterSpacing: "0.1em" }}>
            ✦ TIPS NEUROSAINS
          </div>
          <div style={{ fontSize: 11, color: "#8A9080", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
            Otak orang dewasa mencapai puncak plastisitas neural 60-90 menit setelah bangun tidur. Waktu subuh adalah waktu terbaik untuk hafalan baru — memori jangka panjang dikonsolidasi saat tidur malam.
          </div>
        </div>
      </div>
    );
  };

  // METODE SCREEN
  const MetodeScreen = () => (
    <div style={{ padding: "0 20px 140px" }}>
      <div style={{ padding: "56px 0 24px" }}>
        <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "#E8DCC8", margin: 0 }}>
          Metode <span style={{ color: "#9B7EC8" }}>Ilmiah</span>
        </h2>
        <div style={{ fontSize: 11, color: "#4A5068", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
          Berdasarkan 40 referensi ilmiah neurosains & psikologi kognitif
        </div>
      </div>

      {/* Science basis */}
      <div style={{
        background: "#141824", borderRadius: 16, padding: 18, marginBottom: 20,
        border: "1px solid #1E2535",
      }}>
        <div style={{ fontSize: 11, color: "#C8A96E", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 12, letterSpacing: "0.1em" }}>
          ◈ DASAR ILMIAH — RECITATION ACADEMY
        </div>
        {[
          { cat: "Prefrontal Cortex", refs: "[1–4] Arain, Petanjek, Rosch, Somerville" },
          { cat: "Working Memory", refs: "[5–9] Funahashi, Baddeley, D'Esposito" },
          { cat: "Method of Loci", refs: "[10–15] Dresler, Wagner, Maguire, Legge" },
          { cat: "Spatial Memory", refs: "[16–18] O'Keefe, Maguire, Konishi" },
          { cat: "Levels of Processing", refs: "[19–22] Craik & Lockhart, Tulving, Galli" },
          { cat: "Multi-Sensory", refs: "[23–26] Paivio, Shams, Mayer" },
          { cat: "Spaced Repetition", refs: "[27–30] Ebbinghaus, Cepeda, Karpicke, Roediger" },
          { cat: "Adult Learning", refs: "[31–34] Knowles, Kolb, Draganski, Park" },
          { cat: "Chunking", refs: "[35–36] Miller (7±2), Gobet" },
          { cat: "Cognitive Neuroscience", refs: "[37–40] Squire, Tulving, Atkinson, D'Esposito" },
        ].map(r => (
          <div key={r.cat} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
            <div style={{ width: 5, height: 5, borderRadius: 1, background: "#C8A96E", flexShrink: 0, marginTop: 5 }} />
            <div>
              <span style={{ fontSize: 11, color: "#E8DCC8", fontFamily: "'DM Sans', sans-serif" }}>{r.cat}</span>
              <span style={{ fontSize: 10, color: "#4A5068", fontFamily: "'DM Sans', sans-serif" }}> — {r.refs}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Method Details */}
      {METHODS.map(m => (
        <div key={m.id} style={{
          background: "#141824", borderRadius: 16, marginBottom: 14,
          border: `1px solid ${m.color}33`, overflow: "hidden",
        }}>
          <div onClick={() => setShowMethodDetail(showMethodDetail === m.id ? null : m.id)}
            style={{
              padding: 18, display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
            }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${m.color}22`, border: `1px solid ${m.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, color: m.color, flexShrink: 0,
            }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "#E8DCC8", fontFamily: "'Playfair Display', serif" }}>{m.name}</div>
              <div style={{ fontSize: 9, color: m.color, fontFamily: "'DM Sans', sans-serif", marginTop: 3, letterSpacing: "0.06em" }}>{m.ref}</div>
            </div>
            <span style={{ color: "#4A5068", fontSize: 16 }}>{showMethodDetail === m.id ? "▲" : "▼"}</span>
          </div>

          {showMethodDetail === m.id && (
            <div style={{ padding: "0 18px 18px" }}>
              <div style={{ fontSize: 11, color: "#8A8098", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginBottom: 14 }}>
                {m.desc}
              </div>
              <div style={{ fontSize: 11, color: m.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 10, letterSpacing: "0.1em" }}>
                LANGKAH PRAKTIS:
              </div>
              {m.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: `${m.color}22`, border: `1px solid ${m.color}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: m.color, fontWeight: 700,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 11, color: "#8A9098", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
              <button onClick={() => { setScreen("hafalan"); setSelectedSurahDetail(null); }} style={{
                marginTop: 10, width: "100%", padding: "11px 0",
                background: `${m.color}22`, border: `1px solid ${m.color}44`,
                borderRadius: 10, color: m.color, fontSize: 11,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                letterSpacing: "0.08em",
              }}>GUNAKAN METODE INI →</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ===== RENDER =====
  return (
    <div style={{
      minHeight: "100vh", background: "#0A0C14",
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: 430, margin: "0 auto", position: "relative",
      paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #0A0C14; }
        ::-webkit-scrollbar { display: none; }
        input { -webkit-appearance: none; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, #C8A96E08 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {screen === "dashboard" && <Dashboard />}
        {screen === "hafalan" && !selectedSurahDetail && <HafalanScreen />}
        {screen === "hafalan" && selectedSurahDetail && (
          <SurahDetailScreen
            surah={selectedSurahDetail}
            hafalanData={hafalanData}
            markStatus={markStatus}
            onBack={() => setSelectedSurahDetail(null)}
          />
        )}
        {screen === "muraja" && <MurajaScreen />}
        {screen === "jadwal" && <JadwalScreen />}
        {screen === "metode" && <MetodeScreen />}
      </div>

      <NavBar />
    </div>
  );
}

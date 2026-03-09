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
    name: "Chunking + Snowball",
    icon: "◈",
    color: "var(--gold)",
    ref: "Miller (1956) • Gobet (2001) • Baddeley (2003)",
    tagline: "Hafal ayat demi ayat, lalu gulung seperti bola salju",
    why: "Otak dewasa hanya mampu menyimpan 4–7 potongan informasi baru sekaligus di working memory. Dengan Chunking + Snowball, kita tidak membebani otak — hafalan dibangun satu lapis per lapis sampai utuh.",
    duration: "30–45 menit/sesi",
    bestFor: "Surah baru, ayat panjang, pemula",
    session: [
      { phase: "PERSIAPAN", time: "5 menit", icon: "◇", color: "var(--gold)88", steps: [
        "Ambil wudhu & duduk tenang — otak butuh kondisi relaks untuk encoding",
        "Baca terjemahan seluruh surah/bagian yang akan dihafal — pahami alurnya",
        "Tentukan target: 3–5 ayat per sesi (jangan lebih)",
      ]},
      { phase: "HAFAL AYAT 1", time: "5 menit", icon: "①", color: "var(--gold)", steps: [
        "Baca ayat 1 dengan tartil sambil melihat → 3 kali",
        "Tutup mushaf → ucapkan dari ingatan → 3 kali",
        "Jika salah, buka lagi → ulangi. Jangan lanjut sebelum ayat 1 lancar",
        "Test terakhir: ucapkan ayat 1 tanpa lihat 2 kali berturut-turut ✓",
      ]},
      { phase: "HAFAL AYAT 2 + SNOWBALL", time: "7 menit", icon: "②", color: "var(--gold)", steps: [
        "Hafal ayat 2 dengan cara sama (lihat 3x → tutup 3x)",
        "SNOWBALL: Ucapkan Ayat 1 + Ayat 2 berturut-turut tanpa lihat → 3 kali",
        "Ini kunci metode — menggabung selalu lebih kuat dari hafal terpisah",
      ]},
      { phase: "LANJUT HINGGA TARGET", time: "15 menit", icon: "③", color: "var(--gold)", steps: [
        "Ulangi pola: hafal ayat baru → Snowball dari ayat 1 s.d. ayat terbaru",
        "Setiap tambah 1 ayat, selalu mulai ulangan dari ayat pertama",
        "Berhenti saat mencapai target (3–5 ayat). Jangan paksa lebih",
      ]},
      { phase: "PENUTUP & KONSOLIDASI", time: "5 menit", icon: "◈", color: "var(--gold)CC", steps: [
        "Ucapkan seluruh hafalan hari ini dari awal tanpa lihat — 2 kali",
        "Tandai ayat yang masih ragu untuk diulang besok pagi",
        "Jadwalkan review: besok pagi (Subuh), 3 hari lagi, 7 hari lagi",
      ]},
    ],
  },
  {
    id: "spaced",
    name: "Spaced Repetition 7-3-2-1",
    icon: "⟳",
    color: "var(--blue)",
    ref: "Ebbinghaus (1885) • Cepeda et al. (2006) • Karpicke & Roediger (2008)",
    tagline: "Review di waktu yang tepat, sebelum otak lupa",
    why: "Tanpa review, otak dewasa melupakan 70% hafalan baru dalam 24 jam (Forgetting Curve). Spaced Repetition memaksa otak me-retrieve memori tepat sebelum dilupakan — setiap retrieval memperkuat jalur saraf.",
    duration: "10–15 menit/sesi review",
    bestFor: "Menjaga hafalan lama, konsolidasi jangka panjang",
    session: [
      { phase: "HARI 1 — HAFAL BARU", time: "30–45 menit", icon: "①", color: "var(--blue)", steps: [
        "Hafal target surah/ayat dengan metode Chunking Snowball",
        "Di akhir sesi: recite seluruh hafalan baru tanpa lihat — catat berapa kali salah",
        "Set pengingat: besok pagi review pertama",
      ]},
      { phase: "HARI 2 — REVIEW 1 (7×)", time: "10 menit", icon: "②", color: "var(--blue)", steps: [
        "Sebelum buka mushaf: coba recite dari ingatan dulu — di sinilah penguatan terjadi",
        "Recite hafalan kemarin 7 kali berturut-turut (boleh sambil melihat di pengulangan 5–7)",
        "Otak sedang berjuang mengambil memori = memperkuat sinaps",
        "Tandai: Lancar ✓ atau Perlu Perbaikan ⚠",
      ]},
      { phase: "HARI 4 — REVIEW 2 (3×)", time: "7 menit", icon: "③", color: "var(--blue)", steps: [
        "Tanpa melihat mushaf, recite 3 kali dari awal",
        "Jika ada yang terlupa: lihat sebentar, lalu tutup dan ulangi bagian itu 3×",
        "Setelah lancar, recite sekali lagi dari awal sampai akhir",
      ]},
      { phase: "HARI 7 — REVIEW 3 (2×)", time: "5 menit", icon: "④", color: "var(--blue)", steps: [
        "Recite 2 kali tanpa lihat. Jika ada kesalahan, tambah 1 kali lagi",
        "Ini titik kritis: hafalan yang lolos hari ke-7 biasanya masuk memori jangka panjang",
      ]},
      { phase: "HARI 14, 30, 60 — MAINTENANCE", time: "3–5 menit", icon: "⟳", color: "var(--blue)88", steps: [
        "Cukup recite 1× tanpa lihat di setiap interval",
        "Jika masih lancar → interval berikutnya. Jika terlupa → kembali ke Hari 2",
        "Gunakan menu Muraja'ah di app ini untuk tracking otomatis",
      ]},
    ],
  },
  {
    id: "multisensory",
    name: "Multi-Sensory VAKT",
    icon: "◎",
    color: "var(--purple)",
    ref: "Paivio (1986) • Shams & Seitz (2008) • Mayer (2009)",
    tagline: "Libatkan mata, telinga, tangan, dan suara sekaligus",
    why: "Otak dewasa menyimpan memori lebih kuat ketika informasi masuk lewat banyak saluran indera sekaligus (Visual + Auditory + Kinesthetic). Dual Coding Theory: teks Arab + suara = dua jalur encoding yang saling memperkuat.",
    duration: "40–50 menit/sesi",
    bestFor: "Ayat yang sulit dihafal, cocok untuk tipe belajar visual/auditory",
    session: [
      { phase: "VISUAL — Lihat & Amati", time: "8 menit", icon: "👁", color: "var(--purple)", steps: [
        "Buka mushaf, baca ayat target perlahan — perhatikan bentuk huruf dan pola tulisan",
        "Bayangkan 'foto' teks di kepala: di baris mana, di pojok mana halaman",
        "Tutup mata → bayangkan teks ada di depan Anda → buka → koreksi",
        "Ulangi 3× sampai Anda bisa 'melihat' ayat di mata pikiran",
      ]},
      { phase: "AUDITORY — Dengar & Ikuti", time: "10 menit", icon: "♪", color: "var(--purple)", steps: [
        "Cari murattal qari favorit (Mishari Rashid, Mahmoud Khalil, dll.) di YouTube/aplikasi",
        "Dengarkan ayat target 3× tanpa ikut membaca — resapi irama dan makhraj",
        "Dengarkan lagi 3× sambil mengikuti dengan bisikan (shadowing)",
        "Dengarkan 1× terakhir, lalu coba recite sendiri mengikuti irama yang baru didengar",
      ]},
      { phase: "KINESTHETIC — Tulis Tangan", time: "12 menit", icon: "✎", color: "var(--purple)", steps: [
        "Tulis ayat target di kertas dengan tangan — jangan ketik, harus tulis tangan",
        "Menulis mengaktifkan motor memory — jenis memori berbeda dari auditory",
        "Tulis 2× sambil melihat, lalu tutup mushaf dan tulis 1× dari ingatan",
        "Bandingkan tulisan Anda dengan mushaf — perbaiki yang salah",
      ]},
      { phase: "RECITE — Gabungkan Semua", time: "10 menit", icon: "◎", color: "var(--purple)CC", steps: [
        "Recite ayat keras-keras (bukan bisik) sambil membayangkan teks di kepala",
        "Ucapkan 5× tanpa lihat — gunakan irama murattal yang tadi didengar",
        "Setiap kali recite, bayangkan MAKNA ayat dalam pikiran — multi-layer encoding",
        "Test akhir: tutup mata, recite sekali → ini simpan ke long-term memory",
      ]},
    ],
  },
  {
    id: "semantic",
    name: "Semantic Deep Processing",
    icon: "◐",
    color: "var(--green)",
    ref: "Craik & Lockhart (1972) • Tulving (1983) • Park & Bischof (2013)",
    tagline: "Pahami dulu, hafal kemudian — otak dewasa belajar dari makna",
    why: "Otak dewasa (post-25) lebih kuat di Semantic Memory (makna/konteks) daripada Rote Memory (hafalan buta). Penelitian Craik & Lockhart: informasi yang diproses secara DALAM (makna) diingat 3× lebih lama dibanding hafalan mekanis.",
    duration: "45–60 menit/sesi",
    bestFor: "Ideal untuk orang dewasa, surah yang panjang dan kompleks",
    session: [
      { phase: "PAHAMI KONTEKS", time: "10 menit", icon: "◇", color: "var(--green)", steps: [
        "Baca terjemahan seluruh surah/bagian — jangan langsung hafal",
        "Baca tafsir ringkas (boleh pakai aplikasi) — apa tema utama? Siapa yang dituju?",
        "Tanyakan pada diri: 'Mengapa ayat ini ada setelah ayat sebelumnya?'",
        "Catat 1–2 kalimat: 'Ayat ini bicara tentang...'",
      ]},
      { phase: "PETA MAKNA AYAT", time: "10 menit", icon: "◐", color: "var(--green)", steps: [
        "Bagi ayat menjadi 'frasa makna' — setiap frasa punya satu ide",
        "Contoh: 'الرَّحْمَنِ الرَّحِيمِ' → 'Dua sifat kasih Allah yang berbeda nuansanya'",
        "Untuk setiap frasa Arab, hafal padanan maknanya dalam bahasa Indonesia",
        "Ini bukan terjemahan kaku — tapi 'jangkar makna' yang bantu ingat urutan",
      ]},
      { phase: "HAFAL DENGAN CERITA MAKNA", time: "15 menit", icon: "①", color: "var(--green)", steps: [
        "Baca ayat 1 Arab → ucapkan maknanya → baca lagi Arab → tutup → recite",
        "Setiap kali recite Arab, 'rasakan' makna mengalir — bukan hafal kata, tapi makna",
        "Jika lupa kata → ingat dulu MAKNANYA → biasanya kata Arab ikut muncul",
        "Snowball: tambah ayat berikut, selalu gabung dari ayat pertama",
      ]},
      { phase: "AJARKAN KE ORANG LAIN (Feynman Technique)", time: "10 menit", icon: "◎", color: "var(--green)", steps: [
        "Recite hafalan, lalu jelaskan maknanya kepada siapapun (anak, istri, teman, cermin)",
        "Jika Anda bisa menjelaskan dengan bahasa sederhana → hafalan sudah di long-term memory",
        "Jika ada yang tidak bisa dijelaskan → itu bagian yang perlu diulang",
        "Teknik Feynman (Nobel Physicist): 'Jika tidak bisa jelaskan sederhana, berarti belum paham'",
      ]},
      { phase: "RETRIEVAL TEST", time: "10 menit", icon: "✓", color: "var(--green)CC", steps: [
        "Tutup semua referensi. Recite dari awal tanpa lihat",
        "Jika lupa → jangan langsung lihat. Coba 30 detik recall dulu — perjuangan ini yang memperkuat",
        "Catat mana yang lancar, mana yang masih ragu",
        "Baru buka mushaf untuk koreksi — ulangi bagian yang salah 5×",
      ]},
    ],
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
  background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
  padding: "13px 16px", color: "var(--text)", fontSize: 13,
  fontFamily: "'DM Sans', sans-serif", outline: "none",
};
const inputPlaceholderFix = `
  input::placeholder { color: var(--muted); opacity: 1; }
  input:focus { border-color: var(--gold) !important; outline: none; }
  select { color: var(--text); background: var(--card); }
`;

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
      minHeight: "100vh", background: "var(--bg)", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "32px 24px", maxWidth: 430, margin: "0 auto",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{inputPlaceholderFix}</style>
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ fontSize: 18, color: "var(--text-dim)", fontFamily: "serif", marginBottom: 14, letterSpacing: 3 }}>
          بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
        </div>
        <h1 style={{ fontSize: 34, fontFamily: "'Playfair Display', serif", color: "var(--text)", margin: 0, lineHeight: 1.2 }}>
          Hafalan<br /><span style={{ color: "var(--gold)" }}>Al-Qur'an</span>
        </h1>
        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 10, letterSpacing: "0.18em", fontFamily: "'DM Sans', sans-serif" }}>
          B.O.A. INDONESIA • BERBASIS NEUROSAINS
        </div>
      </div>

      <div style={{ display: "flex", marginBottom: 20, background: "var(--card)", borderRadius: 12, padding: 4, width: "100%" }}>
        {["login","register"].map(t => (
          <button key={t} onClick={() => { setTab(t); setMsg(""); }} style={{
            flex: 1, padding: "10px 0", border: "none", borderRadius: 9, cursor: "pointer",
            background: tab === t ? "var(--gold)" : "transparent",
            color: tab === t ? "var(--bg)" : "var(--text-secondary)",
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
            background: msg.startsWith("✓") ? "var(--green)15" : "var(--red)15",
            color: msg.startsWith("✓") ? "var(--green)" : "var(--red)",
            border: `1px solid ${msg.startsWith("✓") ? "var(--green)40" : "var(--red)40"}`,
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5,
          }}>{msg}</div>
        )}

        <button onClick={handle} disabled={loading} style={{
          width: "100%", padding: "16px 0", marginTop: 4,
          background: loading ? "var(--gold-disabled)" : "linear-gradient(135deg, var(--gold), var(--gold-dark))",
          border: "none", borderRadius: 14, cursor: loading ? "not-allowed" : "pointer",
          color: "var(--bg)", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {loading ? "Memproses..." : tab === "login" ? "✦ MASUK" : "✦ DAFTAR SEKARANG"}
        </button>
      </div>

      <div style={{ marginTop: 40, fontSize: 9, color: "var(--subtle)", letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}>
        B.O.A. INDONESIA © 2026
      </div>
    </div>
  );
}


function SurahDetailScreen({ surah, hafalanData, markStatus, resetStatus, onBack }) {
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
          background: "var(--bg)", padding: "52px 20px 16px",
          borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <button onClick={onBack} style={{
              background: "var(--border)", border: "1px solid var(--border-mid)", borderRadius: 10,
              color: "var(--gold)", fontSize: 20, width: 38, height: 38,
              cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            }}>←</button>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 20, fontFamily: "'Playfair Display', serif", color: "var(--text)" }}>{surah.name}</span>
                <span style={{ fontSize: 22, color: "var(--gold)", fontFamily: "serif" }}>{surah.arabic}</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>
                {surah.ayat} ayat • Juz {surah.juz} •
                <span style={{ color: d.status === "hafal" ? "var(--gold)" : d.status === "proses" ? "var(--blue)" : "var(--muted)", marginLeft: 4, fontWeight: 700, textTransform: "uppercase" }}>{d.status}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowTerjemahan(v => !v)} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
              background: showTerjemahan ? "var(--blue)18" : "var(--card)",
              border: `1px solid ${showTerjemahan ? "var(--blue)" : "var(--border)"}`,
              color: showTerjemahan ? "var(--blue)" : "var(--muted)",
              fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            }}>◎ TERJEMAHAN</button>
            {d.status === "belum" && (
              <button onClick={() => markStatus(surah.id, "proses")} style={{
                flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                background: "var(--blue)18", border: "1px solid var(--blue)55",
                color: "var(--blue)", fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              }}>▶ MULAI HAFAL</button>
            )}
            {d.status === "proses" && (
              <button onClick={() => markStatus(surah.id, "hafal")} style={{
                flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                background: "var(--gold)18", border: "1px solid var(--gold)55",
                color: "var(--gold)", fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              }}>✓ TANDAI HAFAL</button>
            )}
            {d.status === "hafal" && (
              <button onClick={() => resetStatus(surah.id)} style={{
                flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                background: "var(--red)12", border: "1px solid var(--red)33",
                color: "var(--red)", fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              }}>↩ BATALKAN HAFAL</button>
            )}
          </div>
        </div>

        {/* Bismillah */}
        {surah.id !== 9 && surah.id !== 1 && (
          <div style={{ textAlign: "center", padding: "24px 20px 8px", fontSize: 26, color: "var(--gold)", fontFamily: "'Scheherazade New', serif", direction: "rtl", lineHeight: 2 }}>
            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
            <div style={{ fontSize: 32, color: "var(--gold)55", marginBottom: 12 }}>◈</div>
            Memuat teks Al-Qur'an Madinah...
          </div>
        )}

        {error && (
          <div style={{ margin: 20, background: "var(--red)15", border: "1px solid var(--red)40", borderRadius: 14, padding: 16, fontSize: 12, color: "var(--red)", fontFamily: "'DM Sans', sans-serif" }}>
            {error}
          </div>
        )}

        {!loading && !error && ayahs.map((ayah, idx) => {
          const tr = terjemahan[idx];
          const active = activeAyah === ayah.numberInSurah;
          return (
            <div key={ayah.number} onClick={() => setActiveAyah(active ? null : ayah.numberInSurah)}
              style={{ padding: "18px 20px", borderBottom: "1px solid var(--card)", background: active ? "var(--gold)08" : "transparent", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7,
                  background: active ? "var(--gold)" : "var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: active ? "var(--bg)" : "var(--muted)",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}>{ayah.numberInSurah}</div>
              </div>
              <div style={{
                fontSize: 24, fontFamily: "'Scheherazade New', 'Traditional Arabic', serif",
                color: "var(--text)", direction: "rtl", textAlign: "right", lineHeight: 2.2,
              }}>
                {ayah.text} <span style={{ color: "var(--gold)88", fontSize: 18 }}>﴿{ayah.numberInSurah}﴾</span>
              </div>
              {showTerjemahan && tr && (
                <div style={{ fontSize: 12, color: "var(--muted-alt)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, borderTop: "1px solid var(--border-soft)", paddingTop: 10, marginTop: 10, fontStyle: "italic" }}>
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
  const [activeMethodSession, setActiveMethodSession] = useState(null); // { methodId, stepIdx, phaseIdx }
  const [sessionChecked, setSessionChecked] = useState({}); // { 'phaseIdx-stepIdx': bool }
  const [todayDone, setTodayDone] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeJuz, setActiveJuz] = useState(0);
  const [selectedSurahDetail, setSelectedSurahDetail] = useState(null);
  const timerRef = useRef(null);

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [reminders, setReminders] = useState({ subuh: true, pagi: false, ashar: true, isya: true });
  const [toast, setToast] = useState(null); // { surahId, surahName, prevStatus, timer }
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [prayerLocation, setPrayerLocation] = useState(null);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [prayerError, setPrayerError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState(() => localStorage.getItem("hafal-theme") || "dark");

  // ===== ALL HOOKS FIRST — no early returns before this =====

  // Timer hafalan
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  // Theme persistence
  useEffect(() => {
    document.documentElement.className = theme === "light" ? "light" : "";
    localStorage.setItem("hafal-theme", theme);
  }, [theme]);

  // Jam real-time (update tiap menit)
  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(tick);
  }, []);

  // Ambil jadwal sholat berdasarkan GPS
  const fetchPrayerTimes = useCallback(async () => {
    setPrayerLoading(true);
    setPrayerError(null);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      // Reverse geocode pakai nominatim (gratis, no key)
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=id`
      );
      const geoData = await geoRes.json();
      const city = geoData.address?.city || geoData.address?.town || geoData.address?.county || geoData.address?.state || "Lokasi Anda";
      const country = geoData.address?.country_code?.toUpperCase() || "ID";
      // Ambil jadwal sholat via aladhan.com (gratis, no key)
      const today = new Date();
      const dd = String(today.getDate()).padStart(2,'0');
      const mm = String(today.getMonth()+1).padStart(2,'0');
      const yyyy = today.getFullYear();
      const prayRes = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=20&school=1`
      );
      // method=20 = Kemenag Indonesia, school=1 = Hanafi (Ashar)
      const prayData = await prayRes.json();
      if (prayData.code === 200) {
        const t = prayData.data.timings;
        setPrayerTimes({
          Subuh:   t.Fajr,
          Terbit:  t.Sunrise,
          Dzuhur:  t.Dhuhr,
          Ashar:   t.Asr,
          Maghrib: t.Maghrib,
          Isya:    t.Isha,
        });
        setPrayerLocation({ city, country, lat: latitude, lon: longitude });
      } else {
        setPrayerError("Gagal mengambil jadwal sholat.");
      }
    } catch (e) {
      if (e.code === 1) setPrayerError("Izin lokasi ditolak. Aktifkan GPS di browser/app.");
      else if (e.code === 2) setPrayerError("GPS tidak tersedia. Coba di tempat lain.");
      else setPrayerError("Gagal memuat jadwal. Periksa koneksi internet.");
    } finally {
      setPrayerLoading(false);
    }
  }, []);

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
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--gold)66", fontSize: 32 }}>◈</div>
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
    const prevData = hafalanData[surahId]; // simpan state sebelumnya untuk undo
    const now = new Date();
    const nextReview = new Date(now.getTime() + SCHEDULE_INTERVALS[0] * 86400000).toISOString();
    const payload = {
      status,
      lastReview: now.toISOString(),
      nextReview: status === "hafal" ? nextReview : null,
      repetitions: (prevData.repetitions || 0) + 1,
      progress: status === "hafal" ? 100 : status === "proses" ? 50 : 0,
    };
    setHafalanData(prev => ({ ...prev, [surahId]: { ...prev[surahId], ...payload } }));
    if (status === "hafal") setTodayDone(d => d + 1);

    // Tampilkan toast undo selama 5 detik
    const surah = SURAHS.find(s => s.id === surahId);
    if (toast?.timer) clearTimeout(toast.timer);
    const timer = setTimeout(() => setToast(null), 5000);
    setToast({ surahId, surahName: surah?.name, prevData, status, timer });

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

  // Undo: kembalikan ke status sebelumnya
  const undoMarkStatus = async () => {
    if (!toast) return;
    const { surahId, prevData } = toast;
    if (toast.timer) clearTimeout(toast.timer);
    setToast(null);
    setHafalanData(prev => ({ ...prev, [surahId]: prevData }));
    if (toast.status === "hafal") setTodayDone(d => Math.max(0, d - 1));
    // Sync undo ke Supabase
    if (user) {
      try {
        await upsertHafalan(user.id, surahId, {
          status: prevData.status,
          progress: prevData.progress,
          repetitions: prevData.repetitions,
          last_review: prevData.lastReview,
          next_review: prevData.nextReview,
        });
      } catch (e) { console.error("Undo sync error:", e); }
    }
  };

  // Reset surah ke belum (dari halaman detail atau kartu)
  const resetStatus = async (surahId) => {
    const prevData = hafalanData[surahId];
    const payload = { status: "belum", progress: 0, nextReview: null, lastReview: null, repetitions: 0 };
    setHafalanData(prev => ({ ...prev, [surahId]: { ...prev[surahId], ...payload } }));
    if (prevData.status === "hafal") setTodayDone(d => Math.max(0, d - 1));
    if (user) {
      try {
        await upsertHafalan(user.id, surahId, {
          status: "belum", progress: 0, repetitions: 0,
          last_review: null, next_review: null,
        });
      } catch (e) { console.error("Reset sync error:", e); }
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

  // ===== TOAST UNDO NOTIFIKASI =====
  const Toast = () => {
    if (!toast) return null;
    const label = toast.status === "hafal" ? "Ditandai Hafal" : toast.status === "proses" ? "Mulai Hafalan" : "Diubah";
    return (
      <div style={{
        position: "fixed", bottom: 110, left: "50%", transform: "translateX(-50%)",
        zIndex: 200, maxWidth: 360, width: "calc(100% - 40px)",
        background: "var(--border)", border: "1px solid var(--gold)44",
        borderRadius: 14, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        animation: "slideUp 0.25s ease",
      }}>
        <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity:0; } to { transform: translateX(-50%) translateY(0); opacity:1; } }`}</style>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            {label}: <span style={{ color: "var(--gold)" }}>{toast.surahName}</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
            Tap Batalkan jika salah klik
          </div>
        </div>
        <button onClick={undoMarkStatus} style={{
          background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
          border: "none", borderRadius: 9, padding: "7px 14px",
          color: "var(--bg)", fontSize: 11, fontWeight: 700,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0,
        }}>↩ Batalkan</button>
      </div>
    );
  };

  const NavBar = () => (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "linear-gradient(180deg, transparent 0%, var(--bg) 15%)",
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
          { id: "doa",     icon: "🤲", label: "Doa" },
        ].map(nav => (
          <button key={nav.id} onClick={() => { setScreen(nav.id); setSelectedSurahDetail(null); }} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: (screen === nav.id || (nav.id === 'hafalan' && selectedSurahDetail)) ? "var(--gold)" : "var(--muted)",
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
        borderTop: "1px solid var(--border-soft)",
      }}>
        <span style={{
          fontSize: 9, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif",
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
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
              بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
            </div>
            <h1 style={{ fontSize: 28, fontFamily: "'Playfair Display', Georgia, serif", color: "var(--text)", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
              Hafalan<br /><span style={{ color: "var(--gold)" }}>Al-Qur'an</span>
            </h1>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 8, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em" }}>
              BERBASIS NEUROSAINS • UNTUK ORANG DEWASA
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, paddingTop: 4 }}>
            {syncing && (
              <div style={{ fontSize: 9, color: "var(--blue)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em" }}>
                ⟳ SYNCING...
              </div>
            )}
            <div style={{ fontSize: 9, color: "var(--gold)88", fontFamily: "'DM Sans', sans-serif", maxWidth: 100, textAlign: "right", letterSpacing: "0.05em" }}>
              {user.email?.split("@")[0]}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setScreen("panduan")} style={{
                background: "var(--gold)22", border: "1px solid var(--gold)44", borderRadius: 8,
                color: "var(--gold)", fontSize: 9, padding: "5px 10px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", fontWeight: 700,
              }}>? PANDUAN</button>
              <button onClick={() => setScreen("doa")} style={{
                background: "var(--purple)22", border: "1px solid var(--purple)44", borderRadius: 8,
                color: "var(--purple)", fontSize: 9, padding: "5px 10px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", fontWeight: 700,
              }}>🤲 DOA</button>
              <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} title={theme === "dark" ? "Mode Terang" : "Mode Gelap"} style={{
                background: "var(--border)", border: "1px solid var(--border-mid)", borderRadius: 8,
                color: "var(--text-dim)", fontSize: 15, padding: "3px 9px", cursor: "pointer",
                lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
              }}>{theme === "dark" ? "☀" : "☾"}</button>
              <button onClick={handleLogout} style={{
                background: "var(--border)", border: "1px solid var(--border-mid)", borderRadius: 8,
                color: "var(--muted)", fontSize: 9, padding: "5px 10px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em",
              }}>KELUAR</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Ring */}
      <div style={{
        background: "linear-gradient(135deg, var(--card) 0%, var(--bg-deeper) 100%)",
        borderRadius: 20, padding: 24, marginBottom: 20,
        border: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
          <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="45" cy="45" r="38" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="45" cy="45" r="38" fill="none" stroke="var(--gold)" strokeWidth="6"
              strokeDasharray={`${(stats.hafal / stats.total) * 239} 239`}
              strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>{stats.hafal}</span>
            <span style={{ fontSize: 9, color: "var(--muted)", letterSpacing: "0.1em" }}>SURAH</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "var(--text)", fontSize: 15, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Progress Hafalan</div>
          {[
            { label: "Hafal", value: stats.hafal, color: "var(--gold)" },
            { label: "Dalam Proses", value: stats.proses, color: "var(--blue)" },
            { label: "Belum Mulai", value: stats.total - stats.hafal - stats.proses, color: "var(--border-mid)" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "var(--text-dim)", flex: 1, fontFamily: "'DM Sans', sans-serif" }}>{s.label}</span>
              <span style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Tasks */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", letterSpacing: "0.02em" }}>Agenda Hari Ini</span>
          <span style={{ fontSize: 10, color: "var(--gold)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.12em" }}>
            {todayDone} SELESAI
          </span>
        </div>

        {dueToday.length > 0 ? dueToday.slice(0, 3).map(s => (
          <div key={s.id} style={{
            background: "var(--card)", borderRadius: 14, padding: "14px 16px",
            marginBottom: 10, border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, var(--blue), var(--blue-dark))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, color: "#fff", flexShrink: 0,
            }}>⟳</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif" }}>{s.name}</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>Muraja'ah terjadwal</div>
            </div>
            <button onClick={() => { setSelectedSurah(s); setSelectedSurahDetail(null); setScreen("muraja"); }} style={{
              background: "var(--border)", border: "1px solid var(--border-mid)", borderRadius: 8,
              color: "var(--blue)", fontSize: 10, padding: "6px 12px", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em",
            }}>MULAI</button>
          </div>
        )) : (
          <div style={{
            background: "var(--card)", borderRadius: 14, padding: 20, textAlign: "center",
            border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✦</div>
            <div style={{ fontSize: 12, color: "var(--gold)", fontFamily: "'DM Sans', sans-serif" }}>Tidak ada muraja'ah terjadwal hari ini</div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>Mulai hafalan baru atau tambah waktu belajar</div>
          </div>
        )}
      </div>

      {/* Method Highlight */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", marginBottom: 14 }}>
          Metode Ilmiah Aktif
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {METHODS.slice(0, 4).map(m => (
            <div key={m.id} onClick={() => { setSelectedMethod(m.id); setScreen("metode"); }}
              style={{
                background: "var(--card)", borderRadius: 14, padding: 14,
                border: `1px solid ${m.color}22`, cursor: "pointer",
              }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 11, color: m.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 4, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{m.ref}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <button onClick={() => { setScreen("hafalan"); setSelectedSurahDetail(null); }} style={{
        width: "100%", padding: "16px 0",
        background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
        border: "none", borderRadius: 16, cursor: "pointer",
        color: "var(--bg)", fontSize: 13, fontWeight: 700,
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
          <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "var(--text)", margin: 0 }}>
            114 <span style={{ color: "var(--gold)" }}>Surah</span>
          </h2>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
            {stats.hafal} hafal • {stats.proses} proses • {stats.total - stats.hafal - stats.proses} belum
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "var(--muted)" }}>⌕</span>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama surah..."
            style={{
              width: "100%", boxSizing: "border-box",
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12,
              padding: "11px 14px 11px 36px", color: "var(--text)", fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", outline: "none",
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16,
            }}>×</button>
          )}
        </div>

        {/* Status Tabs */}
        <div style={{ display: "flex", gap: 7, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
          {["semua", "proses", "hafal", "belum"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? "var(--gold)" : "var(--card)",
              border: `1px solid ${activeTab === tab ? "var(--gold)" : "var(--border)"}`,
              borderRadius: 20, padding: "6px 14px", cursor: "pointer",
              color: activeTab === tab ? "var(--bg)" : "var(--text-dim)",
              fontSize: 10, fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700, letterSpacing: "0.08em", whiteSpace: "nowrap",
            }}>{tab.toUpperCase()}</button>
          ))}
        </div>

        {/* Juz Filter Strip */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
          <button onClick={() => setActiveJuz(0)} style={{
            background: activeJuz === 0 ? "var(--blue)" : "var(--card)",
            border: `1px solid ${activeJuz === 0 ? "var(--blue)" : "var(--border)"}`,
            borderRadius: 20, padding: "5px 14px", cursor: "pointer",
            color: activeJuz === 0 ? "var(--bg)" : "var(--text-dim)",
            fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, whiteSpace: "nowrap",
          }}>ALL JUZ</button>
          {Array.from({ length: 30 }, (_, i) => i + 1).map(juz => {
            const p = juzProgress(juz);
            const done = p.done === p.total && p.total > 0;
            return (
              <button key={juz} onClick={() => setActiveJuz(juz)} style={{
                background: activeJuz === juz ? "var(--blue)" : done ? "var(--blue)22" : "var(--card)",
                border: `1px solid ${activeJuz === juz ? "var(--blue)" : done ? "var(--blue)44" : "var(--border)"}`,
                borderRadius: 20, padding: "5px 12px", cursor: "pointer",
                color: activeJuz === juz ? "var(--bg)" : done ? "var(--blue)" : "var(--text-dim)",
                fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, whiteSpace: "nowrap",
              }}>{juz}</button>
            );
          })}
        </div>

        {/* Results count */}
        {(searchQuery || activeJuz > 0) && (
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
            {filtered.length} surah ditemukan
            {activeJuz > 0 && ` di Juz ${activeJuz}`}
          </div>
        )}

        {/* Grouped Surah List */}
        {filtered.length === 0 ? (
          <div style={{ background: "var(--card)", borderRadius: 14, padding: 24, textAlign: "center", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 24, color: "var(--muted)", marginBottom: 8 }}>◈</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif" }}>Tidak ada surah yang cocok</div>
          </div>
        ) : juzKeys.map(juz => (
          <div key={juz}>
            {/* Juz Header */}
            {(activeJuz === 0 && !searchQuery) && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, marginTop: 6 }}>
                <div style={{
                  background: "var(--blue)18", border: "1px solid var(--blue)33", borderRadius: 8,
                  padding: "4px 12px", fontSize: 10, color: "var(--blue)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                }}>JUZ {juz}</div>
                <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
                <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
                  {juzProgress(juz).done}/{juzProgress(juz).total} hafal
                </div>
              </div>
            )}

            {grouped[juz].map(s => {
              const d = hafalanData[s.id];
              return (
                <div key={s.id}
                  style={{
                    background: "var(--card)", borderRadius: 14, padding: "13px 14px",
                    marginBottom: 8, border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                  }}
                  onClick={(e) => { if (!e.target.closest("button")) { setSelectedSurahDetail(s); } }}
                >
                  {/* Nomor */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: d.status === "hafal" ? "linear-gradient(135deg, var(--gold), var(--gold-dark))"
                      : d.status === "proses" ? "linear-gradient(135deg, var(--blue), var(--blue-dark))"
                      : "var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: d.status === "belum" ? "var(--muted)" : "#fff",
                    fontFamily: "'Playfair Display', serif", fontWeight: 700,
                  }}>{s.id}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif" }}>{s.name}</span>
                      <span style={{ fontSize: 15, color: "var(--gold)88", fontFamily: "serif" }}>{s.arabic}</span>
                    </div>
                    <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>
                      {s.ayat} ayat • Juz {s.juz}
                      {d.status !== "belum" && ` • ${d.repetitions}× ulang`}
                      <span style={{ color: "var(--gold)55", marginLeft: 4 }}>• Tap untuk baca ›</span>
                    </div>
                    {d.status !== "belum" && (
                      <div style={{ marginTop: 5, height: 2, background: "var(--border)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${d.progress}%`, background: d.status === "hafal" ? "var(--gold)" : "var(--blue)", borderRadius: 2, transition: "width 0.4s" }} />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                    {d.status !== "hafal" && (
                      <button onClick={() => markStatus(s.id, "hafal")} style={{
                        background: "var(--gold)18", border: "1px solid var(--gold)44",
                        borderRadius: 7, color: "var(--gold)", fontSize: 9,
                        padding: "5px 9px", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                      }}>HAFAL ✓</button>
                    )}
                    {d.status === "belum" && (
                      <button onClick={() => markStatus(s.id, "proses")} style={{
                        background: "var(--blue)18", border: "1px solid var(--blue)44",
                        borderRadius: 7, color: "var(--blue)", fontSize: 9,
                        padding: "5px 9px", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                      }}>MULAI</button>
                    )}
                    {d.status === "hafal" && (
                      <button onClick={() => resetStatus(s.id)} style={{
                        background: "var(--gold)12", border: "1px solid var(--gold)33",
                        borderRadius: 7, color: "var(--gold)88", fontSize: 9,
                        padding: "5px 9px", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                      }}>↩ RESET</button>
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
          <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "var(--text)", margin: 0 }}>
            Muraja'ah <span style={{ color: "var(--blue)" }}>& Ujian</span>
          </h2>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
            Retrieval Practice — Karpicke & Roediger (2008)
          </div>
        </div>

        {/* Timer Card */}
        <div style={{
          background: "linear-gradient(135deg, var(--card), var(--bg-deeper))", borderRadius: 20,
          padding: 24, marginBottom: 20, border: "1px solid var(--border)", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, fontFamily: "'Playfair Display', serif", color: "var(--gold)", letterSpacing: 4, marginBottom: 16 }}>
            {formatTime(timer)}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => setTimerActive(!timerActive)} style={{
              background: timerActive ? "var(--gold)22" : "linear-gradient(135deg, var(--gold), var(--gold-dark))",
              border: timerActive ? "1px solid var(--gold)" : "none",
              borderRadius: 12, padding: "10px 24px",
              color: timerActive ? "var(--gold)" : "var(--bg)",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em",
            }}>{timerActive ? "⏸ JEDA" : "▶ MULAI"}</button>
            <button onClick={() => { setTimer(0); setTimerActive(false); }} style={{
              background: "var(--border)", border: "1px solid var(--border-mid)", borderRadius: 12,
              padding: "10px 20px", color: "var(--text-dim)", fontSize: 12,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            }}>RESET</button>
          </div>
        </div>

        {/* Method: 7-3-2-1 */}
        <div style={{
          background: "var(--card)", borderRadius: 16, padding: 18, marginBottom: 20,
          border: "1px solid var(--purple)22",
        }}>
          <div style={{ fontSize: 12, color: "var(--purple)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 10, letterSpacing: "0.1em" }}>
            ◎ TEKNIK 7-3-2-1 (Spaced Repetition)
          </div>
          {[
            { day: "Hari 1", times: 7, color: "var(--gold)" },
            { day: "Hari 2", times: 3, color: "var(--purple)" },
            { day: "Hari 3", times: 2, color: "var(--blue)" },
            { day: "Hari 7", times: 1, color: "var(--green)" },
          ].map(r => (
            <div key={r.day} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "var(--muted)", width: 48, fontFamily: "'DM Sans', sans-serif" }}>{r.day}</span>
              <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${(r.times / 7) * 100}%`, background: r.color, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 11, color: r.color, fontWeight: 700, width: 24, textAlign: "right" }}>{r.times}×</span>
            </div>
          ))}
        </div>

        {/* Surah Cards for Muraja */}
        <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", marginBottom: 14 }}>
          Pilih Surah untuk Muraja'ah
        </div>

        {hafalSurahs.length === 0 ? (
          <div style={{
            background: "var(--card)", borderRadius: 14, padding: 24, textAlign: "center",
            border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif" }}>
              Belum ada surah yang dihafal. Mulai dari menu Hafalan.
            </div>
          </div>
        ) : hafalSurahs.map(s => {
          const d = hafalanData[s.id];
          const nextDate = d.nextReview ? new Date(d.nextReview).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-";
          return (
            <div key={s.id} style={{
              background: "var(--card)", borderRadius: 14, padding: 16, marginBottom: 10,
              border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, color: "var(--text)", fontFamily: "'Playfair Display', serif" }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                    Review ke-{d.repetitions + 1} • Berikutnya: {nextDate}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: "var(--gold)" }}>{s.arabic}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => markMuraja(s.id, "lancar")} style={{
                  flex: 1, padding: "9px 0",
                  background: "linear-gradient(135deg, var(--green)22, var(--green-dark)22)",
                  border: "1px solid var(--green)44", borderRadius: 10,
                  color: "var(--green)", fontSize: 10, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: "0.08em",
                }}>✓ LANCAR</button>
                <button onClick={() => markMuraja(s.id, "perlu")} style={{
                  flex: 1, padding: "9px 0",
                  background: "var(--gold)11", border: "1px solid var(--gold)33", borderRadius: 10,
                  color: "var(--gold)", fontSize: 10, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600, letterSpacing: "0.08em",
                }}>⟳ PERLU ULANG</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // JADWAL SCREEN — Jadwal Hafalan Harian
  const JadwalScreen = () => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const sessions = [
      { timeKey: "Subuh",  label: "Subuh",  desc: "Hafalan baru — otak paling segar (Neuroplasticity peak)",        icon: "☽", color: "var(--gold)",   reminderKey: "subuh" },
      { timeKey: null,     label: "Pagi",   desc: "Review cepat — working memory consolidation",                    icon: "◎", color: "var(--blue)",   reminderKey: "pagi",  staticTime: "08:00" },
      { timeKey: "Ashar",  label: "Ashar",  desc: "Muraja'ah — retrieval practice (Karpicke, 2008)",               icon: "⟳", color: "var(--purple)", reminderKey: "ashar" },
      { timeKey: "Isya",   label: "Isya",   desc: "Pra-tidur — memory consolidation selama tidur",                 icon: "✦", color: "var(--green)",  reminderKey: "isya"  },
    ];

    const handleToggleReminder = async (key) => {
      const newVal = !reminders[key];
      setReminders(r => ({ ...r, [key]: newVal }));
      if (user) {
        try { await upsertReminder(user.id, key, newVal); }
        catch(e) { console.error(e); }
      }
    };

    const toMins = (str) => {
      if (!str) return -1;
      const [h, m] = str.split(":").map(Number);
      return h * 60 + m;
    };
    const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();

    return (
      <div style={{ padding: "0 20px 140px" }}>
        {/* Header */}
        <div style={{ padding: "56px 0 20px" }}>
          <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "var(--text)", margin: 0 }}>
            Jadwal <span style={{ color: "var(--green)" }}>Hafalan</span>
          </h2>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
            Adult Learning Theory — Knowles (1980) + Park & Bischof (2013)
          </div>
        </div>

        {/* Shortcut ke jadwal sholat */}
        <div onClick={() => setScreen("sholat")} style={{
          background: "var(--green)12", border: "1px solid var(--green)33",
          borderRadius: 14, padding: "12px 16px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
        }}>
          <span style={{ fontSize: 22 }}>🕌</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "var(--green)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Lihat Jadwal Sholat</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
              {prayerLocation ? `📍 ${prayerLocation.city} — Tap untuk detail` : "Tap untuk deteksi waktu sholat otomatis"}
            </div>
          </div>
          <span style={{ color: "var(--border-mid)", fontSize: 18 }}>›</span>
        </div>

        {/* Week Strip */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {days.map((d, i) => {
            const isToday = i === new Date().getDay() - 1;
            return (
              <div key={d} style={{
                flex: 1, background: isToday ? "var(--gold)" : "var(--card)",
                borderRadius: 10, padding: "8px 4px", textAlign: "center",
                border: `1px solid ${isToday ? "var(--gold)" : "var(--border)"}`,
              }}>
                <div style={{ fontSize: 9, color: isToday ? "var(--bg)" : "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{d}</div>
                <div style={{ fontSize: 14, color: isToday ? "var(--bg)" : "var(--text-dim)" }}>◆</div>
              </div>
            );
          })}
        </div>

        {/* Sesi Belajar */}
        <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", marginBottom: 14 }}>
          Sesi Belajar Harian
        </div>

        {sessions.map((s) => {
          const prayTime = s.timeKey && prayerTimes ? prayerTimes[s.timeKey] : s.staticTime || null;
          const displayTime = prayTime || "—";
          const isNow = s.timeKey && prayerTimes
            ? Math.abs(toMins(prayerTimes[s.timeKey]) - nowMins) < 30
            : false;
          return (
            <div key={s.label} style={{
              background: isNow ? `${s.color}0E` : "var(--card)",
              borderRadius: 16, padding: 16, marginBottom: 12,
              border: `1px solid ${isNow ? s.color + "44" : s.color + "22"}`,
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
                  <span style={{ fontSize: 14, color: "var(--text)", fontFamily: "'Playfair Display', serif" }}>{s.label}</span>
                  <span style={{ fontSize: 11, color: s.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                    {displayTime}
                    {s.timeKey && prayerTimes && <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 3 }}>(sholat)</span>}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>{s.desc}</div>
                {isNow && (
                  <div style={{ fontSize: 9, color: s.color, marginTop: 4, fontWeight: 700, letterSpacing: "0.08em" }}>● WAKTU SHOLAT SEKARANG</div>
                )}
              </div>
              <button onClick={() => handleToggleReminder(s.reminderKey)} style={{
                width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                background: reminders[s.reminderKey] ? s.color : "var(--border)",
                position: "relative", flexShrink: 0, transition: "background 0.2s",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 8, background: "#fff",
                  position: "absolute", top: 2,
                  left: reminders[s.reminderKey] ? 18 : 2, transition: "left 0.2s",
                }} />
              </button>
            </div>
          );
        })}

        {/* Neuroscience tip */}
        <div style={{
          background: "linear-gradient(135deg, var(--gold)11, var(--gold-dark)0A)", borderRadius: 16,
          padding: 18, border: "1px solid var(--gold)22", marginTop: 4,
        }}>
          <div style={{ fontSize: 11, color: "var(--gold)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 8, letterSpacing: "0.1em" }}>
            ✦ TIPS NEUROSAINS
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
            Otak orang dewasa mencapai puncak plastisitas neural 60–90 menit setelah bangun tidur. Waktu subuh adalah waktu terbaik untuk hafalan baru — memori jangka panjang dikonsolidasi saat tidur malam.
          </div>
        </div>
      </div>
    );
  };

  // SHOLAT SCREEN — Jadwal Waktu Sholat
  const SholatScreen = () => {
    const toMins = (str) => {
      if (!str) return -1;
      const [h, m] = str.split(":").map(Number);
      return h * 60 + m;
    };
    const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    const prayerKeys = prayerTimes ? ["Subuh","Terbit","Dzuhur","Ashar","Maghrib","Isya"] : [];
    const mainKeys   = ["Subuh","Dzuhur","Ashar","Maghrib","Isya"];
    const nextPrayer = prayerTimes
      ? mainKeys.find(k => toMins(prayerTimes[k]) > nowMins) || "Subuh"
      : null;
    const nextMins = prayerTimes && nextPrayer
      ? (toMins(prayerTimes[nextPrayer]) - nowMins + 1440) % 1440
      : null;
    const formatCountdown = (mins) => {
      if (mins === null) return "";
      const h = Math.floor(mins / 60), m = mins % 60;
      return h > 0 ? `${h} jam ${m} mnt` : `${m} menit lagi`;
    };

    const prayerMeta = {
      Subuh:   { icon: "☽", color: "var(--gold)",   desc: "Fajar — waktu terbaik hafalan baru" },
      Terbit:  { icon: "◇", color: "var(--text-dim)", desc: "Matahari terbit — waktu larangan sholat" },
      Dzuhur:  { icon: "◉", color: "var(--blue)",   desc: "Tengah hari — review cepat setelah sholat" },
      Ashar:   { icon: "⟳", color: "var(--purple)", desc: "Sore — muraja'ah & retrieval practice" },
      Maghrib: { icon: "◐", color: "var(--red)",    desc: "Magrib — istirahat sejenak, banyak dzikir" },
      Isya:    { icon: "✦", color: "var(--green)",  desc: "Malam — pra-tidur, konsolidasi memori" },
    };

    return (
      <div style={{ padding: "0 20px 140px" }}>
        {/* Header */}
        <div style={{ padding: "56px 0 20px" }}>
          <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "var(--text)", margin: 0 }}>
            Waktu <span style={{ color: "var(--green)" }}>Sholat</span>
          </h2>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
            Otomatis sesuai lokasi GPS smartphone
          </div>
        </div>

        {/* Clock + Lokasi Card */}
        <div style={{
          background: "linear-gradient(135deg, var(--card) 0%, var(--bg-deeper) 100%)",
          borderRadius: 20, padding: 20, marginBottom: 20,
          border: "1px solid var(--green)33",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 36, color: "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700, letterSpacing: 2, lineHeight: 1 }}>
                {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>
                {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              {prayerLocation && (
                <div style={{ fontSize: 11, color: "var(--green)", fontFamily: "'DM Sans', sans-serif", marginTop: 4, fontWeight: 700 }}>
                  📍 {prayerLocation.city}
                </div>
              )}
            </div>
            <button onClick={fetchPrayerTimes} disabled={prayerLoading} style={{
              background: prayerLoading ? "var(--border)" : "linear-gradient(135deg, var(--green), var(--green-dark))",
              border: "none", borderRadius: 12, padding: "10px 14px",
              color: prayerLoading ? "var(--muted)" : "var(--bg)",
              fontSize: 10, fontWeight: 700, cursor: prayerLoading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.5,
            }}>
              {prayerLoading ? "⟳" : "📍"}<br/>{prayerLoading ? "Memuat..." : "Deteksi
Lokasi"}
            </button>
          </div>

          {/* Error */}
          {prayerError && (
            <div style={{
              background: "var(--red)15", border: "1px solid var(--red)33", borderRadius: 12,
              padding: "10px 14px", fontSize: 11, color: "var(--red)",
              fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5, marginBottom: 12,
            }}>⚠️ {prayerError}</div>
          )}

          {/* Next prayer highlight */}
          {prayerTimes && nextPrayer && (
            <div style={{
              background: "var(--green)15", border: "1px solid var(--green)44",
              borderRadius: 14, padding: "14px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em" }}>SHOLAT BERIKUTNYA</div>
                <div style={{ fontSize: 20, color: "var(--green)", fontFamily: "'Playfair Display', serif", fontWeight: 700, marginTop: 4 }}>
                  {prayerMeta[nextPrayer]?.icon} {nextPrayer}
                </div>
                <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", marginTop: 2 }}>
                  {prayerTimes[nextPrayer]}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, color: "var(--green)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                  {formatCountdown(nextMins)}
                </div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 4, maxWidth: 120, lineHeight: 1.4 }}>
                  {prayerMeta[nextPrayer]?.desc}
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!prayerTimes && !prayerLoading && !prayerError && (
            <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
              <div style={{ fontSize: 36, color: "var(--green)33", marginBottom: 12 }}>🕌</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                Tap <strong style={{ color: "var(--green)" }}>Deteksi Lokasi</strong> untuk menampilkan<br/>jadwal sholat wilayah Anda secara otomatis
              </div>
            </div>
          )}
        </div>

        {/* Prayer times list — detailed */}
        {prayerTimes && (
          <div>
            <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", marginBottom: 14 }}>
              Waktu Sholat Hari Ini
            </div>
            {Object.entries(prayerTimes).map(([name, time]) => {
              const meta = prayerMeta[name] || { icon: "◇", color: "var(--muted)", desc: "" };
              const isNext = name === nextPrayer;
              const isPast = toMins(time) < nowMins && !isNext;
              const isMain = mainKeys.includes(name);
              return (
                <div key={name} style={{
                  background: isNext ? "var(--green)12" : "var(--card)",
                  borderRadius: 16, padding: "14px 16px", marginBottom: 10,
                  border: `1px solid ${isNext ? "var(--green)44" : isPast ? "var(--border-soft)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", gap: 14,
                  opacity: isPast && !isMain ? 0.5 : 1,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    background: isNext ? "var(--green)22" : `${meta.color}18`,
                    border: `1px solid ${isNext ? "var(--green)44" : meta.color + "33"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, color: isNext ? "var(--green)" : meta.color,
                  }}>{meta.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 15, color: isNext ? "var(--green)" : isPast ? "var(--text-dim)" : "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                        {name}
                      </span>
                      <span style={{ fontSize: 18, color: isNext ? "var(--green)" : isPast ? "var(--muted)" : "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                        {time}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: isNext ? "var(--green)88" : "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>
                      {meta.desc}
                      {isPast && <span style={{ color: "var(--muted-alt)", marginLeft: 6 }}>• Sudah lewat</span>}
                      {isNext && <span style={{ fontWeight: 700, marginLeft: 6 }}>• {formatCountdown(nextMins)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info metode kalkulasi */}
        {prayerTimes && (
          <div style={{
            background: "var(--green)0A", border: "1px solid var(--green)22",
            borderRadius: 14, padding: 14, marginTop: 4,
          }}>
            <div style={{ fontSize: 9, color: "var(--green)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>
              ℹ METODE KALKULASI
            </div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
              Menggunakan metode <strong style={{ color: "var(--text)" }}>Kementerian Agama Republik Indonesia</strong> (method=20) via aladhan.com. Waktu disesuaikan otomatis dengan koordinat GPS smartphone Anda.
            </div>
          </div>
        )}
      </div>
    );
  };

  // METODE SCREEN
  const MetodeScreen = () => {
    // If in active session mode
    if (activeMethodSession) {
      const m = METHODS.find(x => x.id === activeMethodSession.methodId);
      if (!m) return null;
      const phase = m.session[activeMethodSession.phaseIdx];
      const totalPhases = m.session.length;
      const phaseIdx = activeMethodSession.phaseIdx;
      const checkedKey = (pi, si) => `${pi}-${si}`;
      const allChecked = phase.steps.every((_, si) => sessionChecked[checkedKey(phaseIdx, si)]);
      const isLastPhase = phaseIdx === totalPhases - 1;
      const donePhases = m.session.filter((_, pi) => pi < phaseIdx).length;

      return (
        <div style={{ padding: "0 0 120px" }}>
          {/* Session Header */}
          <div style={{
            background: "var(--bg)", padding: "52px 20px 16px",
            borderBottom: `1px solid ${m.color}33`,
            position: "sticky", top: 0, zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <button onClick={() => { setActiveMethodSession(null); setSessionChecked({}); }} style={{
                background: "var(--border)", border: "1px solid var(--border-mid)", borderRadius: 10,
                color: m.color, fontSize: 20, width: 38, height: 38,
                cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              }}>←</button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: m.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}>
                  {m.icon} {m.name.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                  Fase {phaseIdx + 1} dari {totalPhases}
                </div>
              </div>
              <div style={{ fontSize: 10, color: m.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                {phase.time}
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${((phaseIdx) / totalPhases) * 100}%`, background: m.color, borderRadius: 2, transition: "width 0.4s" }} />
            </div>
          </div>

          <div style={{ padding: "24px 20px" }}>
            {/* Phase title */}
            <div style={{
              background: `${m.color}15`, border: `1px solid ${m.color}33`,
              borderRadius: 16, padding: "16px 18px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${m.color}22`, border: `1px solid ${m.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: m.color,
              }}>{phase.icon}</div>
              <div>
                <div style={{ fontSize: 14, color: m.color, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                  {phase.phase}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                  Estimasi waktu: {phase.time}
                </div>
              </div>
            </div>

            {/* Checklist steps */}
            <div style={{ marginBottom: 24 }}>
              {phase.steps.map((step, si) => {
                const key = checkedKey(phaseIdx, si);
                const checked = !!sessionChecked[key];
                return (
                  <div key={si}
                    onClick={() => setSessionChecked(prev => ({ ...prev, [key]: !checked }))}
                    style={{
                      display: "flex", gap: 14, padding: "14px 16px", marginBottom: 10,
                      background: checked ? `${m.color}12` : "var(--card)",
                      border: `1px solid ${checked ? m.color + "44" : "var(--border)"}`,
                      borderRadius: 14, cursor: "pointer", alignItems: "flex-start",
                      transition: "all 0.2s",
                    }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                      background: checked ? m.color : "var(--border)",
                      border: `1px solid ${checked ? m.color : "var(--border-mid)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, color: checked ? "var(--bg)" : "var(--muted)",
                      transition: "all 0.2s", marginTop: 1,
                    }}>{checked ? "✓" : si + 1}</div>
                    <span style={{
                      fontSize: 12, color: checked ? "var(--text-dim)" : "var(--text-warm)",
                      fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6,
                      textDecoration: checked ? "line-through" : "none",
                      transition: "all 0.2s",
                    }}>{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10 }}>
              {phaseIdx > 0 && (
                <button onClick={() => setActiveMethodSession(prev => ({ ...prev, phaseIdx: prev.phaseIdx - 1 }))} style={{
                  flex: 1, padding: "13px 0", background: "var(--card)",
                  border: "1px solid var(--border)", borderRadius: 14,
                  color: "var(--text-dim)", fontSize: 12, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                }}>← Sebelumnya</button>
              )}
              {!isLastPhase ? (
                <button
                  onClick={() => allChecked && setActiveMethodSession(prev => ({ ...prev, phaseIdx: prev.phaseIdx + 1 }))}
                  style={{
                    flex: 2, padding: "13px 0",
                    background: allChecked ? `linear-gradient(135deg, ${m.color}, ${m.color}CC)` : "var(--border)",
                    border: "none", borderRadius: 14,
                    color: allChecked ? "var(--bg)" : "var(--muted)",
                    fontSize: 12, cursor: allChecked ? "pointer" : "not-allowed",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.06em",
                  }}>
                  {allChecked ? "Fase Berikutnya →" : `Centang semua (${phase.steps.filter((_,si) => sessionChecked[checkedKey(phaseIdx,si)]).length}/${phase.steps.length})`}
                </button>
              ) : (
                <button
                  onClick={() => { if (allChecked) { setActiveMethodSession(null); setSessionChecked({}); setScreen("hafalan"); setSelectedSurahDetail(null); }}}
                  style={{
                    flex: 2, padding: "13px 0",
                    background: allChecked ? "linear-gradient(135deg, var(--green), var(--green-dark))" : "var(--border)",
                    border: "none", borderRadius: 14,
                    color: allChecked ? "var(--bg)" : "var(--muted)",
                    fontSize: 12, cursor: allChecked ? "pointer" : "not-allowed",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.06em",
                  }}>
                  {allChecked ? "✦ Sesi Selesai! Mulai Hafal →" : `Centang semua dulu (${phase.steps.filter((_,si) => sessionChecked[checkedKey(phaseIdx,si)]).length}/${phase.steps.length})`}
                </button>
              )}
            </div>

            {/* Phase overview mini */}
            <div style={{ display: "flex", gap: 6, marginTop: 20, justifyContent: "center" }}>
              {m.session.map((ph, pi) => (
                <div key={pi} style={{
                  width: pi === phaseIdx ? 24 : 8, height: 8, borderRadius: 4,
                  background: pi < phaseIdx ? m.color : pi === phaseIdx ? m.color : "var(--border)",
                  opacity: pi < phaseIdx ? 0.5 : 1,
                  transition: "width 0.3s",
                }} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default: method list view
    return (
      <div style={{ padding: "0 20px 140px" }}>
        <div style={{ padding: "56px 0 20px" }}>
          <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "var(--text)", margin: 0 }}>
            Metode <span style={{ color: "var(--purple)" }}>Ilmiah</span>
          </h2>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
            4 metode berbasis neurosains • Panduan sesi interaktif
          </div>
        </div>

        {/* Intro card */}
        <div style={{
          background: "linear-gradient(135deg, var(--purple)11, var(--purple-dark)11)", borderRadius: 16,
          padding: 18, marginBottom: 20, border: "1px solid var(--purple)33",
        }}>
          <div style={{ fontSize: 12, color: "var(--purple)", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: 8, letterSpacing: "0.08em" }}>
            ◎ MENGAPA METODE INI UNTUK ORANG DEWASA?
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8 }}>
            Otak dewasa berbeda dari anak-anak. Prefrontal cortex sudah matang — kita lebih kuat di <span style={{ color: "var(--text)" }}>memori bermakna</span> dan lebih lemah di <span style={{ color: "var(--text)" }}>hafalan mekanis</span>. Keempat metode ini dirancang memanfaatkan kekuatan unik otak dewasa.
          </div>
        </div>

        {/* Methods list */}
        {METHODS.map(m => (
          <div key={m.id} style={{
            background: "var(--card)", borderRadius: 16, marginBottom: 14,
            border: `1px solid ${m.color}33`, overflow: "hidden",
          }}>
            {/* Collapsed header */}
            <div onClick={() => setShowMethodDetail(showMethodDetail === m.id ? null : m.id)}
              style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: `${m.color}22`, border: `1px solid ${m.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, color: m.color,
              }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: "var(--text)", fontFamily: "'Playfair Display', serif" }}>{m.name}</div>
                <div style={{ fontSize: 10, color: m.color, fontFamily: "'DM Sans', sans-serif", marginTop: 3, fontStyle: "italic" }}>"{m.tagline}"</div>
                <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 3, letterSpacing: "0.04em" }}>
                  ⏱ {m.duration} • {m.bestFor}
                </div>
              </div>
              <span style={{ color: "var(--muted)", fontSize: 16, flexShrink: 0 }}>{showMethodDetail === m.id ? "▲" : "▼"}</span>
            </div>

            {/* Expanded detail */}
            {showMethodDetail === m.id && (
              <div style={{ padding: "0 18px 18px" }}>
                {/* Why this works */}
                <div style={{
                  background: `${m.color}0D`, border: `1px solid ${m.color}22`,
                  borderRadius: 12, padding: "12px 14px", marginBottom: 16,
                }}>
                  <div style={{ fontSize: 9, color: m.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>
                    🧠 MENGAPA INI BEKERJA UNTUK OTAK DEWASA
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                    {m.why}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 8, fontStyle: "italic" }}>
                    📚 {m.ref}
                  </div>
                </div>

                {/* Session phases overview */}
                <div style={{ fontSize: 11, color: m.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, marginBottom: 10, letterSpacing: "0.08em" }}>
                  ALUR SESI ({m.session.length} FASE):
                </div>
                {m.session.map((phase, pi) => (
                  <div key={pi} style={{ display: "flex", gap: 12, marginBottom: 8, alignItems: "center" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: `${m.color}22`, border: `1px solid ${m.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, color: m.color,
                    }}>{phase.icon}</div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{phase.phase}</span>
                      <span style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif" }}> — {phase.time}</span>
                    </div>
                  </div>
                ))}

                {/* Start session button */}
                <button onClick={() => { setActiveMethodSession({ methodId: m.id, phaseIdx: 0 }); setSessionChecked({}); }} style={{
                  marginTop: 14, width: "100%", padding: "14px 0",
                  background: `linear-gradient(135deg, ${m.color}, ${m.color}CC)`,
                  border: "none", borderRadius: 12,
                  color: "var(--bg)", fontSize: 12, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 800, letterSpacing: "0.1em",
                }}>▶ MULAI SESI PANDUAN INTERAKTIF</button>
              </div>
            )}
          </div>
        ))}

        {/* Science refs */}
        <div style={{ background: "var(--card)", borderRadius: 16, padding: 18, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, color: "var(--gold)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 12, letterSpacing: "0.1em" }}>
            ◈ 40 REFERENSI ILMIAH — RECITATION ACADEMY
          </div>
          {[
            { cat: "Prefrontal Cortex", refs: "Arain, Petanjek, Rosch, Somerville" },
            { cat: "Working Memory", refs: "Funahashi, Baddeley, D'Esposito" },
            { cat: "Method of Loci", refs: "Dresler, Wagner, Maguire, Legge" },
            { cat: "Spatial Memory", refs: "O'Keefe, Maguire, Konishi" },
            { cat: "Levels of Processing", refs: "Craik & Lockhart, Tulving, Galli" },
            { cat: "Multi-Sensory", refs: "Paivio, Shams, Mayer" },
            { cat: "Spaced Repetition", refs: "Ebbinghaus, Cepeda, Karpicke, Roediger" },
            { cat: "Adult Learning", refs: "Knowles, Kolb, Draganski, Park" },
            { cat: "Chunking", refs: "Miller (7±2), Gobet" },
            { cat: "Cognitive Neuroscience", refs: "Squire, Tulving, Atkinson, D'Esposito" },
          ].map(r => (
            <div key={r.cat} style={{ display: "flex", gap: 10, marginBottom: 7, alignItems: "flex-start" }}>
              <div style={{ width: 4, height: 4, borderRadius: 1, background: "var(--gold)55", flexShrink: 0, marginTop: 6 }} />
              <div>
                <span style={{ fontSize: 10, color: "var(--text)", fontFamily: "'DM Sans', sans-serif" }}>{r.cat}</span>
                <span style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif" }}> — {r.refs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };


  // ===== PANDUAN SCREEN =====
  const PanduanScreen = () => {
    const [activeSection, setActiveSection] = useState(null);

    const PANDUAN_SECTIONS = [
      {
        id: "mulai",
        icon: "✦",
        color: "var(--gold)",
        title: "Cara Memulai Hafalan",
        subtitle: "Untuk pemula — langkah 1 s.d. selesai",
        steps: [
          {
            n: "1", title: "Pilih Surah Target",
            body: "Buka menu Hafalan → pilih surah yang ingin dihafal. Untuk pemula, mulai dari surah pendek di Juz 30 (An-Nas, Al-Falaq, Al-Ikhlas). Tap kartu surah untuk melihat teks Arab lengkap.",
            tips: "Jangan langsung pilih surah panjang. Bangun kepercayaan diri dulu dengan 3–5 surah pendek.",
            icon: "◈",
          },
          {
            n: "2", title: "Pilih Metode Hafalan",
            body: "Buka menu Panduan → Metode Hafalan → pilih salah satu dari 4 metode. Untuk pemula, disarankan mulai dengan Chunking + Snowball karena paling sistematis dan cocok untuk otak dewasa.",
            tips: "Konsisten dengan 1 metode dulu selama 2 minggu sebelum mencoba metode lain.",
            icon: "◎",
          },
          {
            n: "3", title: "Jalankan Sesi Interaktif",
            body: "Di halaman Metode, tap ▶ MULAI SESI PANDUAN INTERAKTIF. Ikuti setiap fase dan centang langkah yang sudah dikerjakan. Tombol Fase Berikutnya hanya aktif jika semua langkah sudah dicentang.",
            tips: "Satu sesi = 30–45 menit. Jangan terburu. Kualitas lebih penting dari kuantitas.",
            icon: "▶",
          },
          {
            n: "4", title: "Tandai Status Hafalan",
            body: "Setelah berhasil menghafal surah, kembali ke menu Hafalan → tap kartu surah → tap HAFAL ✓ atau buka halaman detail surah → tap TANDAI HAFAL. Status akan berubah ke emas.",
            tips: "Tandai PROSES jika masih belajar, HAFAL hanya jika sudah bisa recite tanpa lihat 3 kali berturut-turut.",
            icon: "✓",
          },
          {
            n: "5", title: "Lakukan Muraja'ah Terjadwal",
            body: "Buka menu Muraja'ah → pilih surah yang sudah dihafal → tap ✓ LANCAR atau ⟳ PERLU ULANG. App akan otomatis menjadwalkan kapan harus review lagi berdasarkan sistem 7-3-2-1.",
            tips: "Muraja'ah adalah kunci. Hafalan tanpa review akan hilang dalam 3–7 hari.",
            icon: "⟳",
          },
        ],
      },
      {
        id: "alur",
        icon: "◷",
        color: "var(--blue)",
        title: "Rutinitas Harian yang Ideal",
        subtitle: "Jadwal belajar berbasis neurosains otak dewasa",
        steps: [
          {
            n: "☽", title: "Subuh (05:00–06:00) — Hafalan Baru",
            body: "Ini waktu terbaik untuk menghafal materi baru. Otak mencapai puncak neuroplastisitas 60–90 menit setelah bangun tidur. Gunakan sesi 30–45 menit dengan metode pilihan Anda.",
            tips: "Setelah sholat Subuh, langsung mulai. Jangan cek HP dulu — distraksi memecah fokus prefrontal cortex.",
            icon: "☽",
          },
          {
            n: "◎", title: "Pagi (08:00–08:30) — Review Cepat",
            body: "Review singkat hafalan kemarin. Cukup recite 3–5 kali tanpa lihat mushaf. Ini fase konsolidasi working memory yang terjadi setelah tidur malam.",
            tips: "Jika ada yang terlupa, jangan panik. Itu normal dan justru penanda otak sedang memperkuat jalur memori.",
            icon: "◎",
          },
          {
            n: "⟳", title: "Ashar (15:00–15:30) — Muraja'ah",
            body: "Buka menu Muraja'ah di app. Kerjakan semua surah yang terjadwal hari ini. Tandai LANCAR atau PERLU ULANG secara jujur. Sesi ini memanfaatkan retrieval practice — efek testing.",
            tips: "Gunakan timer di menu Muraja'ah untuk mendisiplinkan diri. 20–25 menit cukup untuk 2–3 surah.",
            icon: "⟳",
          },
          {
            n: "✦", title: "Isya (20:00–20:30) — Pra-Tidur",
            body: "Recite seluruh hafalan dalam sholat atau setelahnya. Otak akan mengkonsolidasi memori ini selama tidur malam. Ini salah satu mekanisme terkuat dalam neurosains memori.",
            tips: "Jangan langsung tidur setelah recite — beri jeda 10–15 menit. Tidur terlalu cepat setelah belajar bisa mengganggu konsolidasi.",
            icon: "✦",
          },
        ],
      },
      {
        id: "fitur",
        icon: "◈",
        color: "var(--purple)",
        title: "Panduan Fitur App",
        subtitle: "Semua yang bisa dilakukan di app ini",
        steps: [
          {
            n: "⌂", title: "Beranda — Dashboard Progress",
            body: "Tampilkan ringkasan: jumlah surah hafal/proses/belum, agenda muraja'ah hari ini, dan shortcut ke metode ilmiah. Progress ring berubah seiring hafalan bertambah.",
            tips: "Jika ada surah terjadwal di agenda, selesaikan dulu sebelum hafalan baru.",
            icon: "⌂",
          },
          {
            n: "◈", title: "Hafalan — 114 Surah Lengkap",
            body: "Daftar 114 surah dengan status & progress. Tap kartu surah → baca teks Arab Madinah (Uthmani) + terjemahan Indonesia. Gunakan filter Juz & tab Status untuk navigasi cepat.",
            tips: "Tap ayat untuk highlight. Gunakan toggle Terjemahan untuk fokus ke teks Arab saja saat menghafal.",
            icon: "◈",
          },
          {
            n: "⟳", title: "Muraja'ah — Sistem Review Otomatis",
            body: "Setelah hafal surah, gunakan menu ini untuk review berkala. Timer bawaan untuk mengukur durasi sesi. Tandai LANCAR atau PERLU ULANG — app otomatis atur jadwal review berikutnya.",
            tips: "Pilih PERLU ULANG dengan jujur. App akan jadwalkan lebih sering — ini lebih baik dari menandai LANCAR padahal masih ragu.",
            icon: "⟳",
          },
          {
            n: "◷", title: "Jadwal — Waktu Sholat & Sesi Belajar",
            body: "Tap Deteksi Lokasi untuk jadwal sholat otomatis sesuai GPS. Aktifkan toggle pengingat di setiap sesi belajar. Waktu sholat Subuh/Ashar/Isya otomatis tersambung ke jadwal belajar.",
            tips: "Aktifkan izin lokasi di browser/app agar fitur jadwal sholat berfungsi.",
            icon: "◷",
          },
          {
            n: "◎", title: "Metode — Panduan Sesi Interaktif",
            body: "4 metode ilmiah dengan panduan langkah demi langkah. Bisa diakses dari menu Panduan → Metode Hafalan. Setiap metode punya sesi interaktif dengan checklist yang harus diselesaikan per fase.",
            tips: "Selesaikan seluruh fase dalam satu duduk jika memungkinkan untuk hasil terbaik.",
            icon: "◎",
          },
          {
            n: "↩", title: "Undo & Reset Status",
            body: "Salah tap Hafal? Ada 3 cara batalkan: (1) Toast 'Batalkan' yang muncul 5 detik setelah tap, (2) Tombol ↩ RESET di kartu surah, (3) Tombol ↩ BATALKAN HAFAL di halaman detail surah.",
            tips: "Toast undo hanya muncul 5 detik — segera tap jika salah klik.",
            icon: "↩",
          },
        ],
      },
      {
        id: "faq",
        icon: "◐",
        color: "var(--green)",
        title: "Pertanyaan Umum (FAQ)",
        subtitle: "Jawaban untuk pertanyaan yang sering muncul",
        steps: [
          {
            n: "Q", title: "Berapa ayat yang wajar dihafal per hari?",
            body: "Untuk orang dewasa: 3–5 ayat per sesi adalah optimal (Miller, 1956). Lebih dari itu justru menurunkan kualitas hafalan. Konsistensi harian 3 ayat lebih baik dari 20 ayat sehari lalu berhenti 3 hari.",
            tips: "Motto: 'Sedikit tapi istiqomah mengalahkan banyak tapi putus.'",
            icon: "◐",
          },
          {
            n: "Q", title: "Kenapa saya cepat lupa padahal sudah hafal?",
            body: "Ini normal — disebut Forgetting Curve (Ebbinghaus). Otak dewasa melupakan 70% dalam 24 jam jika tidak direview. Solusinya bukan hafal lebih keras, tapi review lebih teratur dengan Spaced Repetition.",
            tips: "Buka menu Muraja'ah setiap hari. Itulah kunci hafalan jangka panjang.",
            icon: "◐",
          },
          {
            n: "Q", title: "Metode mana yang cocok untuk saya?",
            body: "Chunking + Snowball → cocok untuk semua, terutama pemula. Spaced Repetition → untuk menjaga hafalan yang sudah ada. Multi-Sensory VAKT → jika Anda tipe visual/auditory atau suka mendengar murattal. Semantic → jika Anda ingin pahami makna sebelum hafal.",
            tips: "Tidak ada yang salah — coba keduanya selama 1 minggu, pilih yang lebih nyaman.",
            icon: "◐",
          },
          {
            n: "Q", title: "Bagaimana jika tidak punya banyak waktu?",
            body: "Cukup 2 sesi: Subuh (15 menit hafal baru) + Ashar (10 menit muraja'ah). Total 25 menit/hari. Penelitian Park & Bischof (2013): otak dewasa lebih efektif dengan sesi pendek & sering daripada maraton hafalan.",
            tips: "Set alarm 2 kali sehari. Konsistensi jadwal = kunci neuroplastisitas otak dewasa.",
            icon: "◐",
          },
          {
            n: "Q", title: "Apakah data saya tersimpan jika ganti HP?",
            body: "Ya. Semua progress hafalan, status surah, dan pengaturan pengingat tersimpan di cloud (Supabase) dan terhubung ke akun email Anda. Login dengan email yang sama di HP baru dan data akan langsung muncul.",
            tips: "Pastikan selalu login sebelum mulai sesi agar data tersinkronisasi.",
            icon: "◐",
          },
        ],
      },
    ];

    // If section is open, show it full
    if (activeSection) {
      const sec = PANDUAN_SECTIONS.find(s => s.id === activeSection);
      return (
        <div style={{ paddingBottom: 120 }}>
          {/* Sticky header */}
          <div style={{
            background: "var(--bg)", padding: "52px 20px 16px",
            borderBottom: `1px solid ${sec.color}33`,
            position: "sticky", top: 0, zIndex: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setActiveSection(null)} style={{
                background: "var(--border)", border: "1px solid var(--border-mid)", borderRadius: 10,
                color: sec.color, fontSize: 20, width: 38, height: 38,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>←</button>
              <div>
                <div style={{ fontSize: 16, color: "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                  {sec.title}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                  {sec.subtitle}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "20px 20px" }}>
            {sec.steps.map((step, idx) => (
              <div key={idx} style={{
                background: "var(--card)", borderRadius: 16, padding: 18,
                marginBottom: 14, border: `1px solid ${sec.color}22`,
                position: "relative", overflow: "hidden",
              }}>
                {/* Number badge */}
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  width: 32, height: 32, borderRadius: 10,
                  background: `${sec.color}22`, border: `1px solid ${sec.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: sec.color,
                }}>{step.icon}</div>

                {/* Step number */}
                <div style={{
                  display: "inline-block",
                  background: sec.color, borderRadius: 7,
                  padding: "2px 10px", fontSize: 10, color: "var(--bg)",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
                  letterSpacing: "0.08em", marginBottom: 10,
                }}>LANGKAH {step.n}</div>

                <div style={{ fontSize: 14, color: "var(--text)", fontFamily: "'Playfair Display', serif", marginBottom: 10, paddingRight: 40 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, marginBottom: 12 }}>
                  {step.body}
                </div>

                {/* Tips box */}
                <div style={{
                  background: `${sec.color}10`, border: `1px solid ${sec.color}22`,
                  borderRadius: 10, padding: "10px 12px",
                  display: "flex", gap: 8, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 12, color: sec.color, flexShrink: 0 }}>💡</span>
                  <div style={{ fontSize: 11, color: `${sec.color}CC`, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                    {step.tips}
                  </div>
                </div>
              </div>
            ))}

            {/* CTA at bottom of section */}
            {activeSection === "mulai" && (
              <button onClick={() => { setActiveSection(null); setScreen("metode"); }} style={{
                width: "100%", padding: "15px 0", marginTop: 6,
                background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
                border: "none", borderRadius: 14, cursor: "pointer",
                color: "var(--bg)", fontSize: 13, fontWeight: 800,
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em",
              }}>▶ MULAI — BUKA METODE HAFALAN</button>
            )}
            {activeSection === "alur" && (
              <button onClick={() => { setActiveSection(null); setScreen("sholat"); }} style={{
                width: "100%", padding: "15px 0", marginTop: 6,
                background: "linear-gradient(135deg, var(--blue), var(--blue-dark))",
                border: "none", borderRadius: 14, cursor: "pointer",
                color: "var(--bg)", fontSize: 13, fontWeight: 800,
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em",
              }}>◷ ATUR JADWAL SHOLAT & BELAJAR</button>
            )}
            {activeSection === "fitur" && (
              <button onClick={() => { setActiveSection(null); setScreen("hafalan"); }} style={{
                width: "100%", padding: "15px 0", marginTop: 6,
                background: "linear-gradient(135deg, var(--purple), var(--purple-dark))",
                border: "none", borderRadius: 14, cursor: "pointer",
                color: "#fff", fontSize: 13, fontWeight: 800,
                fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em",
              }}>◈ BUKA DAFTAR SURAH</button>
            )}
          </div>
        </div>
      );
    }

    // Landing page
    return (
      <div style={{ padding: "0 20px 140px" }}>
        {/* Header */}
        <div style={{ padding: "56px 0 24px" }}>
          <h2 style={{ fontSize: 26, fontFamily: "'Playfair Display', serif", color: "var(--text)", margin: 0, lineHeight: 1.2 }}>
            Panduan <span style={{ color: "var(--gold)" }}>Penggunaan</span>
          </h2>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
            Mulai dari sini — semua yang perlu diketahui untuk menghafal Al-Qur'an secara sistematis
          </div>
        </div>

        {/* Hero start card */}
        <div style={{
          background: "linear-gradient(135deg, var(--gold)22 0%, var(--gold-dark)0A 100%)",
          borderRadius: 20, padding: 20, marginBottom: 24,
          border: "1px solid var(--gold)44",
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🕌</div>
          <div style={{ fontSize: 18, color: "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700, marginBottom: 8 }}>
            Selamat Datang
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, marginBottom: 16 }}>
            App ini menggunakan <span style={{ color: "var(--gold)" }}>40 penelitian neurosains</span> untuk membantu orang dewasa menghafal Al-Qur'an secara efektif. Ikuti panduan ini untuk hasil terbaik.
          </div>
          <button onClick={() => setActiveSection("mulai")} style={{
            width: "100%", padding: "13px 0",
            background: "linear-gradient(135deg, var(--gold), var(--gold-dark))",
            border: "none", borderRadius: 12, cursor: "pointer",
            color: "var(--bg)", fontSize: 12, fontWeight: 800,
            fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.1em",
          }}>✦ CARA MEMULAI HAFALAN →</button>
        </div>

        {/* Section cards */}
        {PANDUAN_SECTIONS.map(sec => (
          <div key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            style={{
              background: "var(--card)", borderRadius: 16, padding: "16px 18px",
              marginBottom: 12, border: `1px solid ${sec.color}33`,
              display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
            }}>
            <div style={{
              width: 52, height: 52, borderRadius: 15, flexShrink: 0,
              background: `${sec.color}22`, border: `1px solid ${sec.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, color: sec.color,
            }}>{sec.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                {sec.title}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 4, lineHeight: 1.4 }}>
                {sec.subtitle}
              </div>
              <div style={{ fontSize: 9, color: `${sec.color}88`, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                {sec.steps.length} {sec.id === "faq" ? "pertanyaan" : "langkah"} →
              </div>
            </div>
            <span style={{ color: "var(--border-mid)", fontSize: 20 }}>›</span>
          </div>
        ))}

        {/* Quick access to Metode */}
        <div style={{
          background: "var(--card)", borderRadius: 16, padding: "16px 18px",
          marginBottom: 12, border: "1px solid var(--purple)33",
          display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
        }} onClick={() => setScreen("metode")}>
          <div style={{
            width: 52, height: 52, borderRadius: 15, flexShrink: 0,
            background: "var(--purple)22", border: "1px solid var(--purple)44",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, color: "var(--purple)",
          }}>◎</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
              Metode Hafalan Ilmiah
            </div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
              4 metode dengan sesi panduan interaktif
            </div>
            <div style={{ fontSize: 9, color: "var(--purple)88", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
              Chunking • Spaced Repetition • Multi-Sensory • Semantic →
            </div>
          </div>
          <span style={{ color: "var(--border-mid)", fontSize: 20 }}>›</span>
        </div>

        {/* Version info */}
        <div style={{ textAlign: "center", padding: "16px 0 4px" }}>
          <div style={{ fontSize: 9, color: "var(--subtle)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.15em" }}>
            HAFALAN AL-QUR'AN v1.2 • B.O.A. INDONESIA © 2026
          </div>
          <div style={{ fontSize: 9, color: "var(--subtle)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
            Berdasarkan 40 Referensi Ilmiah • recitationacademy.com
          </div>
        </div>
      </div>
    );
  };



  // ===== DATA DZIKIR PAGI & PETANG =====
  const DZIKIR_PAGI = [
    {
      id: "dz_p1", judul: "Ayat Kursi", ulang: 1,
      sumber: "HR. An-Nasa'i, shahih",
      arab: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
      latin: "Allāhu lā ilāha illā huw, al-ḥayyul-qayyūm, lā ta'khudhuhu sinatuw walā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...",
      arti: "Allah, tidak ada tuhan selain Dia, Yang Mahahidup, Yang terus menerus mengurus makhluk-Nya, tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan di bumi...",
      faedah: "Siapa yang membaca Ayat Kursi setiap pagi, ia akan senantiasa berada dalam perlindungan Allah hingga petang. (HR. Al-Hakim, shahih)",
    },
    {
      id: "dz_p2", judul: "Surah Al-Ikhlas, Al-Falaq, An-Nas", ulang: 3,
      sumber: "HR. Abu Dawud & At-Tirmidzi, hasan shahih",
      arab: "قُلْ هُوَ اللَّهُ أَحَدٌ ۞ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
      latin: "Qul huwallāhu aḥad... Qul a'ūdhu birabbil-falaq... Qul a'ūdhu birabbin-nās...",
      arti: "Al-Ikhlas, Al-Falaq, dan An-Nas — dibaca masing-masing 3 kali setiap pagi dan petang",
      faedah: "Nabi ﷺ bersabda: 'Membaca ketiga surah ini tiga kali di pagi dan petang sudah cukup bagimu dari segala sesuatu.' (HR. Abu Dawud, hasan)",
    },
    {
      id: "dz_p3", judul: "Doa Sayyidul Istighfar", ulang: 1,
      sumber: "HR. Al-Bukhari no. 6306",
      arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
      latin: "Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā 'abduk, wa anā 'alā 'ahdika wa wa'dika mastatha'tu, a'ūdhu bika min syarri mā ṣana'tu, abū'u laka bini'matika 'alayya wa abū'u bidhanbī faghfir lī fa'innahū lā yaghfirudhdhunūba illā anta",
      arti: "Ya Allah, Engkau adalah Tuhanku, tiada tuhan selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu. Aku berada di atas perjanjian-Mu dan janji-Mu semampuku. Aku berlindung kepada-Mu dari kejahatan yang aku perbuat. Aku mengakui nikmat-Mu atasku dan aku mengakui dosaku, maka ampunilah aku karena sesungguhnya tidak ada yang mengampuni dosa kecuali Engkau",
      faedah: "Nabi ﷺ bersabda: 'Siapa yang mengucapkannya dengan yakin di pagi hari lalu meninggal sebelum petang, ia masuk surga. Begitu pula jika dibaca petang hari.' (HR. Bukhari)",
    },
    {
      id: "dz_p4", judul: "Tasbih, Tahmid, Tahlil, Takbir", ulang: 33,
      sumber: "HR. Muslim no. 597",
      arab: "سُبْحَانَ اللهِ ۞ الْحَمْدُ لِلَّهِ ۞ لَا إِلَهَ إِلَّا اللهُ ۞ اللهُ أَكْبَرُ",
      latin: "Subḥānallāh (33×) • Alḥamdulillāh (33×) • Allāhu Akbar (33×) • Lā ilāha illallāhu waḥdahū lā syarīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syay'in qadīr (1×)",
      arti: "Maha Suci Allah (33×) • Segala puji bagi Allah (33×) • Allah Maha Besar (33×) • Tidak ada tuhan kecuali Allah semata, tidak ada sekutu bagi-Nya, milik-Nya segala kerajaan dan pujian, dan Dia Mahakuasa atas segala sesuatu (1×)",
      faedah: "Nabi ﷺ bersabda: 'Siapa yang setelah setiap sholat bertasbih 33×, bertahmid 33×, bertakbir 33×... diampuni dosanya meski sebanyak buih lautan.' (HR. Muslim)",
    },
    {
      id: "dz_p5", judul: "Doa Perlindungan Pagi", ulang: 3,
      sumber: "HR. Abu Dawud no. 5069, shahih",
      arab: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      latin: "Bismillāhil-ladhī lā yaḍurru ma'asmihi syay'un fil-arḍi wa lā fis-samā', wa huwas-samī'ul-'alīm",
      arti: "Dengan nama Allah yang bersama nama-Nya tidak ada sesuatu pun yang dapat memberi mudarat di bumi maupun di langit, dan Dia Maha Mendengar lagi Maha Mengetahui",
      faedah: "Nabi ﷺ bersabda: 'Siapa yang mengucapkannya tiga kali di pagi dan petang, tidak ada sesuatu pun yang membahayakannya.' (HR. Abu Dawud, shahih)",
    },
    {
      id: "dz_p6", judul: "Doa Keselamatan & Afiyah", ulang: 3,
      sumber: "HR. At-Tirmidzi no. 3388, hasan",
      arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي",
      latin: "Allāhumma innī as'alukal-'afwa wal-'āfiyata fid-dunyā wal-ākhirah. Allāhumma innī as'alukal-'afwa wal-'āfiyata fī dīnī wa dunyāya wa ahlī wa mālī",
      arti: "Ya Allah, sesungguhnya aku memohon kepada-Mu maaf dan kesehatan di dunia dan akhirat. Ya Allah, aku memohon kepada-Mu maaf dan kesehatan dalam agamaku, duniaku, keluargaku, dan hartaku",
      faedah: "Ibnu Umar berkata: Nabi ﷺ tidak pernah meninggalkan doa ini setiap pagi dan petang. 'Tidak ada yang lebih baik yang diminta seseorang selain 'afiyah (keselamatan/kesehatan).' (HR. At-Tirmidzi)",
    },
    {
      id: "dz_p7", judul: "Sholawat Ibrahimiyah", ulang: 10,
      sumber: "HR. Al-Bukhari & Muslim",
      arab: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
      latin: "Allāhumma ṣalli 'alā Muḥammadin wa 'alā āli Muḥammad, kamā ṣallayta 'alā Ibrāhīma wa 'alā āli Ibrāhīm, innaka ḥamīdum majīd",
      arti: "Ya Allah, limpahkanlah sholawat kepada Muhammad dan keluarga Muhammad, sebagaimana Engkau melimpahkan sholawat kepada Ibrahim dan keluarga Ibrahim. Sesungguhnya Engkau Maha Terpuji lagi Maha Mulia",
      faedah: "Nabi ﷺ bersabda: 'Siapa yang bersholawat kepadaku 10 kali di pagi hari, Allah akan melindunginya dari segala kejelekan di hari itu.' (HR. An-Nasa'i, hasan)",
    },
  ];

  const DZIKIR_PETANG = [
    {
      id: "dz_t1", judul: "Ayat Kursi", ulang: 1,
      sumber: "HR. An-Nasa'i, shahih",
      arab: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
      latin: "Allāhu lā ilāha illā huw, al-ḥayyul-qayyūm, lā ta'khudhuhu sinatuw walā nawm, lahū mā fis-samāwāti wa mā fil-arḍ...",
      arti: "Allah, tidak ada tuhan selain Dia, Yang Mahahidup, Yang terus menerus mengurus makhluk-Nya, tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan di bumi...",
      faedah: "Siapa yang membaca Ayat Kursi setiap petang, ia akan senantiasa berada dalam perlindungan Allah hingga pagi. (HR. Al-Hakim)",
    },
    {
      id: "dz_t2", judul: "Surah Al-Ikhlas, Al-Falaq, An-Nas", ulang: 3,
      sumber: "HR. Abu Dawud & At-Tirmidzi, hasan shahih",
      arab: "قُلْ هُوَ اللَّهُ أَحَدٌ ۞ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
      latin: "Qul huwallāhu aḥad... Qul a'ūdhu birabbil-falaq... Qul a'ūdhu birabbin-nās...",
      arti: "Dibaca masing-masing 3 kali setiap petang — perlindungan dari segala kejahatan makhluk, kegelapan, sihir, dan bisikan setan",
      faedah: "Imam Ibnu Qayyim: ketiga surah ini adalah 'perisai qalbu' yang melindungi dari segala gangguan lahir dan batin.",
    },
    {
      id: "dz_t3", judul: "Doa Memasuki Petang", ulang: 1,
      sumber: "HR. Abu Dawud no. 5068, shahih",
      arab: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      latin: "Amsaynā wa amsal-mulku lillāh, walḥamdulillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syay'in qadīr",
      arti: "Kami memasuki waktu petang dan kerajaan hanya milik Allah. Segala puji bagi Allah. Tidak ada tuhan kecuali Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya segala kerajaan dan pujian, dan Dia Mahakuasa atas segala sesuatu",
      faedah: "Lafaz ini adalah pengakuan tauhid yang memperbarui ikatan seorang hamba dengan Tuhannya di setiap pergantian siang dan malam.",
    },
    {
      id: "dz_t4", judul: "Doa Sayyidul Istighfar", ulang: 1,
      sumber: "HR. Al-Bukhari no. 6306",
      arab: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
      latin: "Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā 'abduk...",
      arti: "Ya Allah, Engkau adalah Tuhanku, tiada tuhan selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu... (lihat lengkapnya di tab Doa Sebelum Hafal)",
      faedah: "Siapa yang membaca ini di petang hari dengan penuh keyakinan lalu meninggal malam itu, maka ia masuk surga. (HR. Bukhari)",
    },
    {
      id: "dz_t5", judul: "Doa Perlindungan dari Keburukan Malam", ulang: 3,
      sumber: "HR. At-Tirmidzi no. 3391, hasan shahih",
      arab: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      latin: "A'ūdhu bikalimātillāhit-tāmmāti min syarri mā khalaq",
      arti: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan apa yang Dia ciptakan",
      faedah: "Nabi ﷺ bersabda: 'Siapa yang mengucapkannya ketika singgah di suatu tempat, tidak ada sesuatu pun yang membahayakannya sampai ia meninggalkan tempat itu.' (HR. Muslim)",
    },
    {
      id: "dz_t6", judul: "Doa Mohon Ampun & Taubat", ulang: 3,
      sumber: "HR. At-Tirmidzi no. 3397, hasan",
      arab: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
      latin: "Astaghfirullāhal-'aẓīmal-ladhī lā ilāha illā huwal-ḥayyul-qayyūmu wa atūbu ilaih",
      arti: "Aku memohon ampun kepada Allah Yang Maha Agung, yang tidak ada tuhan selain Dia, Yang Mahahidup lagi Maha Berdiri Sendiri, dan aku bertaubat kepada-Nya",
      faedah: "Nabi ﷺ bersabda: 'Siapa yang membacanya, diampuni dosanya meski sebesar buih lautan.' (HR. At-Tirmidzi, hasan)",
    },
    {
      id: "dz_t7", judul: "Tasbih, Tahmid, Tahlil, Takbir", ulang: 33,
      sumber: "HR. Muslim no. 597",
      arab: "سُبْحَانَ اللهِ ۞ الْحَمْدُ لِلَّهِ ۞ لَا إِلَهَ إِلَّا اللهُ ۞ اللهُ أَكْبَرُ",
      latin: "Subḥānallāh (33×) • Alḥamdulillāh (33×) • Allāhu Akbar (33×) • Lā ilāha illallāhu waḥdahū lā syarīka lahu, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syay'in qadīr (1×)",
      arti: "Maha Suci Allah (33×) • Segala puji bagi Allah (33×) • Allah Maha Besar (33×) • Tidak ada tuhan kecuali Allah semata... (1×)",
      faedah: "Menutup hari dengan kalimat tasbih adalah sunnah yang sangat dianjurkan. Diampuni dosanya meski sebanyak buih lautan. (HR. Muslim)",
    },
    {
      id: "dz_t8", judul: "Doa Sebelum Tidur (Penutup Petang)", ulang: 1,
      sumber: "HR. Al-Bukhari no. 6313",
      arab: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
      latin: "Bismikallāhumma amūtu wa aḥyā",
      arti: "Dengan menyebut nama-Mu ya Allah, aku mati dan aku hidup",
      faedah: "Dibaca saat berbaring hendak tidur. Nabi ﷺ mengajarkan kalimat ini sebagai penutup hari — penyerahan diri total kepada Allah antara hidup dan mati setiap malam.",
    },
  ];
  const DZIKIR_SHOLAT = [
    {
      id: "ds_1",
      judul: "Istighfar 3×",
      urutan: 1,
      waktu: "Langsung setelah salam",
      color: "var(--green)",
      arab: "أَسْتَغْفِرُ اللهَ",
      latin: "Astaghfirullāh (3×)",
      arti: "Aku memohon ampun kepada Allah (dibaca 3 kali)",
      sumber: "HR. Muslim no. 591",
      faedah: "Nabi ﷺ membaca istighfar 3× langsung setelah salam sebelum berpindah posisi. Ibnu Rajab Al-Hanbali: istighfar setelah ibadah adalah mengakui kekurangan dalam beribadah kepada Allah yang Mahasempurna.",
    },
    {
      id: "ds_2",
      judul: "Doa Setelah Salam",
      urutan: 2,
      waktu: "Setelah istighfar 3×",
      color: "var(--green)",
      arab: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
      latin: "Allāhumma antas-salāmu wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām",
      arti: "Ya Allah, Engkau adalah As-Salam (Maha Sejahtera) dan dari-Mulah kesejahteraan itu. Maha Berkah Engkau wahai Dzat yang memiliki keagungan dan kemuliaan",
      sumber: "HR. Muslim no. 592 dari Tsauban radhiyallahu 'anhu",
      faedah: "Imam An-Nawawi: salam dalam doa ini adalah nama Allah yang mengandung makna keselamatan yang sempurna. Nabi ﷺ tidak pernah meninggalkan doa ini setelah setiap sholat fardhu.",
    },
    {
      id: "ds_3",
      judul: "Tasbih, Tahmid, Takbir — 33×",
      urutan: 3,
      waktu: "Setelah doa salam",
      color: "var(--blue)",
      arab: "سُبْحَانَ اللهِ ۞ الْحَمْدُ لِلَّهِ ۞ اللهُ أَكْبَرُ",
      latin: "Subḥānallāh (33×) — Alḥamdulillāh (33×) — Allāhu Akbar (33×)\n\nPenutup: Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syay'in qadīr (1×)",
      arti: "Maha Suci Allah 33× • Segala puji bagi Allah 33× • Allah Maha Besar 33× • Penutup: Tidak ada tuhan kecuali Allah semata, tidak ada sekutu bagi-Nya, milik-Nya segala kerajaan dan pujian, Dia Mahakuasa atas segala sesuatu (1×)",
      sumber: "HR. Muslim no. 597 dari Abu Hurairah radhiyallahu 'anhu",
      faedah: "Nabi ﷺ bersabda: 'Siapa yang bertasbih 33×, bertahmid 33×, bertakbir 33× setelah setiap sholat... diampuni dosanya meski sebanyak buih lautan.' Ini adalah dzikir paling utama setelah sholat.",
    },
    {
      id: "ds_4",
      judul: "Ayat Kursi",
      urutan: 4,
      waktu: "Setelah tasbih-tahmid-takbir",
      color: "var(--gold)",
      arab: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
      latin: "Allāhu lā ilāha illā huw, al-ḥayyul-qayyūm, lā ta'khudhuhu sinatuw walā nawm, lahū mā fis-samāwāti wa mā fil-arḍ, man dhallladhī yasyfa'u 'indahū illā bi'idhnih, ya'lamu mā bayna aydīhim wa mā khalfahum, wa lā yuḥīṭūna bisyay'im min 'ilmihī illā bimā syā', wasi'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya'ūduhū ḥifẓuhumā, wa huwal-'aliyyul-'aẓīm",
      arti: "Allah — tidak ada tuhan selain Dia — Yang Mahahidup, Yang terus-menerus mengurus makhluk-Nya. Tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang ada di hadapan dan di belakang mereka. Mereka tidak mengetahui sesuatu pun dari ilmu-Nya kecuali yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dia tidak merasa berat memelihara keduanya. Dan Dia Mahatinggi lagi Maha Agung. (QS. Al-Baqarah: 255)",
      sumber: "HR. An-Nasa'i, Ibnu Hibban — shahih",
      faedah: "Nabi ﷺ bersabda: 'Siapa yang membaca Ayat Kursi setelah setiap sholat fardhu, tidak ada yang menghalanginya masuk surga kecuali kematian.' (HR. An-Nasa'i, shahih menurut Ibnu Hibban). Ini adalah dzikir yang paling dianjurkan ulama setelah setiap sholat.",
    },
    {
      id: "ds_5",
      judul: "Tahlil & La Ilaha Illallah",
      urutan: 5,
      waktu: "Boleh dibaca kapan saja setelah sholat",
      color: "var(--gold)",
      arab: "لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      latin: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syay'in qadīr",
      arti: "Tidak ada tuhan kecuali Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya segala kerajaan dan segala pujian. Dan Dia Mahakuasa atas segala sesuatu",
      sumber: "HR. Al-Bukhari no. 844 & Muslim no. 594",
      faedah: "Nabi ﷺ bersabda: 'Siapa yang mengucapkan ini setelah setiap sholat fardhu, diampuni dosanya meski sebanyak buih lautan.' (HR. Muslim). Kalimat tahlil ini adalah dzikir paling agung dalam Islam.",
    },
    {
      id: "ds_6",
      judul: "Doa Minta Pertolongan Beribadah",
      urutan: 6,
      waktu: "Khusus setelah sholat Subuh & Ashar — sunnah muakkad",
      color: "var(--purple)",
      arab: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
      latin: "Allāhumma a'innī 'alā dhikrika wa syukrika wa ḥusni 'ibādatik",
      arti: "Ya Allah, tolonglah aku untuk berdzikir kepada-Mu, bersyukur kepada-Mu, dan beribadah kepada-Mu dengan baik",
      sumber: "HR. Abu Dawud no. 1522, shahih — diajarkan Nabi ﷺ kepada Mu'adz bin Jabal",
      faedah: "Nabi ﷺ berpesan kepada Mu'adz: 'Wahai Mu'adz, demi Allah aku sungguh menyayangimu, maka jangan pernah tinggalkan setiap selesai sholat: Allāhumma a'innī...' Doa ini mencakup tiga fondasi ibadah: dzikir, syukur, dan husn al-'ibadah.",
    },
    {
      id: "ds_7",
      judul: "Doa Berlindung dari 4 Perkara",
      urutan: 7,
      waktu: "Setelah setiap sholat fardhu",
      color: "var(--purple)",
      arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْجُبْنِ، وَأَعُوذُ بِكَ أَنْ أُرَدَّ إِلَى أَرْذَلِ الْعُمُرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الدُّنْيَا، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ",
      latin: "Allāhumma innī a'ūdhu bika minal-jubn, wa a'ūdhu bika an uradda ilā ardhali-l'umur, wa a'ūdhu bika min fitnatid-dunyā, wa a'ūdhu bika min 'adhābil-qabr",
      arti: "Ya Allah, aku berlindung kepada-Mu dari sifat pengecut, aku berlindung kepada-Mu dari dikembalikan ke usia yang paling lemah (pikun), aku berlindung kepada-Mu dari fitnah dunia, dan aku berlindung kepada-Mu dari azab kubur",
      sumber: "HR. Al-Bukhari no. 6374",
      faedah: "Doa ini adalah perlindungan komprehensif: dari kelemahan jiwa (pengecut), kelemahan jasad (pikun), godaan dunia, dan siksa akhirat. Cocok sekali bagi penghafal Al-Qur'an yang butuh keberanian, kekuatan ingatan, fokus dari dunia, dan bekal akhirat.",
    },
    {
      id: "ds_8",
      judul: "Doa Kebaikan Dunia & Akhirat",
      urutan: 8,
      waktu: "Setelah setiap sholat",
      color: "var(--blue)",
      arab: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      latin: "Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā 'adhāban-nār",
      arti: "Ya Tuhan kami, berikanlah kepada kami kebaikan di dunia dan kebaikan di akhirat, dan peliharalah kami dari azab neraka",
      sumber: "QS. Al-Baqarah: 201 — HR. Al-Bukhari & Muslim",
      faedah: "Anas bin Malik berkata: 'Doa yang paling banyak dipanjatkan Nabi ﷺ adalah doa ini.' (HR. Muslim). Imam As-Suyuthi: doa ini mencakup seluruh kebaikan dunia dan akhirat dalam satu kalimat yang singkat dan sempurna.",
    },
    {
      id: "ds_9",
      judul: "Doa Nabi untuk Keluarga & Umat",
      urutan: 9,
      waktu: "Setelah sholat Subuh & Maghrib",
      color: "var(--green)",
      arab: "اللَّهُمَّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
      latin: "Allāhummagh-fir lī wa liwālidayya warḥamhumā kamā rabbayānī ṣaghīrā",
      arti: "Ya Allah, ampunilah aku dan kedua orang tuaku, dan kasihilah mereka sebagaimana mereka telah mendidikku waktu kecil",
      sumber: "Terinspirasi dari QS. Al-Isra: 24, doa yang diajarkan para ulama",
      faedah: "Imam Ibnu Katsir: mendoakan orang tua setelah sholat adalah amalan terbaik seorang anak. Bagi penghafal Al-Qur'an, pahala hafalannya akan mengalir juga kepada orang tua yang telah mendukung dan mendidiknya.",
    },
    {
      id: "ds_10",
      judul: "Sholawat Penutup Majlis",
      urutan: 10,
      waktu: "Penutup setelah semua dzikir",
      color: "var(--gold)",
      arab: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
      latin: "Subḥānakallāhumma wa biḥamdik, asyhadu an lā ilāha illā anta, astaghfiruka wa atūbu ilaik",
      arti: "Maha Suci Engkau ya Allah dan dengan memuji-Mu, aku bersaksi bahwa tidak ada tuhan selain Engkau, aku memohon ampun kepada-Mu dan bertaubat kepada-Mu",
      sumber: "HR. At-Tirmidzi no. 3433, shahih — Kaffaratul Majlis (penebus majlis)",
      faedah: "Doa kaffaratul majlis ini cocok dibaca sebagai penutup seluruh rangkaian dzikir setelah sholat. Ia menghapus kekurangan dan kelalaian yang terjadi selama sholat dan dzikir.",
    },
  ];



  // ===== DOA SCREEN =====
  const DoaScreen = () => {
    const [activeTab, setActiveTabDoa] = useState("sebelum");
    const [expandedDoa, setExpandedDoa] = useState(null);
    const [expandedTips, setExpandedTips] = useState(null);
    const [expandedDzikir, setExpandedDzikir] = useState(null);
    const [dzikir_waktu, setDzikirWaktu] = useState("pagi");

    const DOA_SEBELUM = [
      {
        id: "niat",
        judul: "Niat Menghafal Al-Qur'an",
        arab: "نَوَيْتُ حِفْظَ الْقُرْآنِ الْكَرِيمِ لِوَجْهِ اللهِ تَعَالَى",
        latin: "Nawaytu ḥifẓal-Qur'ānil-Karīmi liwajhillāhi ta'ālā",
        arti: "Aku niatkan menghafal Al-Qur'an Al-Karim semata-mata karena Allah Ta'ala",
        sumber: "Niat yang diajarkan para ulama hafidz sebagai pembuka sesi hafalan",
        faedah: "Imam Ibnu Rajab al-Hanbali: 'Amal dimulai dari niat yang lurus. Hafalan yang diniatkan ikhlas karena Allah akan mendapat pertolongan khusus dari-Nya dan menjadi lebih mudah diingat.'",
        color: "var(--gold)",
      },
      {
        id: "ilmu",
        judul: "Doa Mohon Ilmu yang Bermanfaat",
        arab: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
        latin: "Allāhumma innī as'aluka 'ilman nāfi'an, wa rizqan ṭayyiban, wa 'amalan mutaqabbalan",
        arti: "Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima",
        sumber: "HR. Ibnu Majah no. 925, shahih — dibaca setelah salam Subuh",
        faedah: "Imam Nawawi dalam Al-Adzkar: dianjurkan membaca doa ini sebelum setiap majelis ilmu dan sesi menghafal Al-Qur'an",
        color: "var(--gold)",
      },
      {
        id: "fahm",
        judul: "Doa Mohon Kemudahan Memahami",
        arab: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",
        latin: "Rabbisy-raḥlī ṣadrī, wa yassir lī amrī, waḥlul 'uqdatam-millisānī yafqahū qawlī",
        arti: "Ya Tuhanku, lapangkanlah dadaku, mudahkanlah urusanku, dan lepaskanlah kekakuan dari lidahku agar mereka memahami perkataanku",
        sumber: "QS. Thaha: 25–28 — doa Nabi Musa 'alaihissalam",
        faedah: "Imam Al-Qurthubi: doa ini adalah 'kunci langit' untuk kemudahan berbicara dan menghafal. Para ulama hafidz membacanya sebagai pembuka setiap sesi hafalan.",
        color: "var(--blue)",
      },
      {
        id: "hifz",
        judul: "Doa Khusus Penghafal Al-Qur'an",
        arab: "اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ، وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدىً وَرَحْمَةً، اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ، وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ",
        latin: "Allāhummarḥamnī bil-Qur'ān, waj'alhu lī imāman wa nūran wa hudan wa raḥmah. Allāhumma dhakkirnī minhu mā nasītu wa 'allimnī minhu mā jahiltu",
        arti: "Ya Allah, rahmatilah aku dengan Al-Qur'an, jadikanlah ia bagiku pemimpin, cahaya, petunjuk, dan rahmat. Ya Allah, ingatkanlah aku dari apa yang aku lupa darinya, dan ajarilah aku dari apa yang aku tidak ketahui darinya",
        sumber: "HR. Al-Hakim (1/739), dihasankan oleh Syaikh Al-Albani",
        faedah: "Imam Ibnu Katsir menyebut doa ini sebagai doa khusus para huffadz (penghafal). Kalimat 'dzakkirnī mā nasītu' secara langsung memohon kepada Allah untuk membantu mengingat hafalan yang terlupa.",
        color: "var(--purple)",
      },
      {
        id: "tawfiq",
        judul: "Doa Mohon Taufik & Kemudahan",
        arab: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
        latin: "Allāhumma lā sahla illā mā ja'altahu sahlā, wa anta taj'alul-ḥazna idhā shi'ta sahlā",
        arti: "Ya Allah, tidak ada yang mudah kecuali apa yang Engkau jadikan mudah, dan Engkau menjadikan yang sulit itu mudah jika Engkau menghendaki",
        sumber: "HR. Ibnu Hibban, shahih",
        faedah: "Imam Ibnul Qayyim: doa ini adalah pengakuan bahwa segala kemudahan berasal dari Allah. Membacanya sebelum menghafal menanamkan tawakal yang menguatkan hati untuk terus berusaha.",
        color: "var(--green)",
      },
    ];

    const DOA_SESUDAH = [
      {
        id: "syukur",
        judul: "Doa Syukur Selesai Menghafal",
        arab: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
        latin: "Alḥamdulillāhil-ladhī bini'matihī tatimmuṣ-ṣāliḥāt",
        arti: "Segala puji bagi Allah yang dengan nikmat-Nya segala kebaikan menjadi sempurna",
        sumber: "HR. Al-Hakim dari Ibnu Abbas, dihasankan",
        faedah: "Imam Al-Munawi: syukur atas nikmat menghafal akan menambah keberkahan hafalan dan memudahkan sesi berikutnya. Syukur adalah pupuk yang menumbuhkan nikmat.",
        color: "var(--gold)",
      },
      {
        id: "tsabat",
        judul: "Doa Mohon Hafalan Dikuatkan",
        arab: "اللَّهُمَّ ثَبِّتْنِي عَلَى حِفْظِ كِتَابِكَ، وَانْفَعْنِي بِهِ فِي الدُّنْيَا وَالآخِرَةِ",
        latin: "Allāhumma thabbitnī 'alā ḥifẓi kitābik, wanfa'nī bihī fid-dunyā wal-ākhirah",
        arti: "Ya Allah, teguhkanlah aku atas hafalan kitab-Mu, dan berilah aku manfaat darinya di dunia dan akhirat",
        sumber: "Doa yang diajarkan para masyaikh Qur'an di pesantren-pesantren tahfidz",
        faedah: "Syaikh Ibnu Baz: memohon kepada Allah untuk menjaga hafalan sama pentingnya dengan proses menghafal itu sendiri. Allah-lah penjaga sejati Al-Qur'an dalam dada.",
        color: "var(--blue)",
      },
      {
        id: "amal",
        judul: "Doa Agar Hafalan Menjadi Amal",
        arab: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ، وَمِنْ قَلْبٍ لَا يَخْشَعُ، وَمِنْ نَفْسٍ لَا تَشْبَعُ، وَمِنْ دُعَاءٍ لَا يُسْمَعُ",
        latin: "Allāhumma innī a'ūdhu bika min 'ilmin lā yanfa', wa min qalbin lā yakhsha', wa min nafsin lā tashba', wa min du'ā'in lā yusma'",
        arti: "Ya Allah, aku berlindung kepada-Mu dari ilmu yang tidak bermanfaat, dari hati yang tidak khusyuk, dari jiwa yang tidak pernah puas, dan dari doa yang tidak didengar",
        sumber: "HR. Muslim no. 2722, dari Zaid bin Arqam",
        faedah: "Imam Nawawi: doa ini adalah benteng dari riya dan kesombongan ilmu. Penghafal Al-Qur'an sangat rentan terhadap ujian kesombongan, doa ini menjaganya.",
        color: "var(--purple)",
      },
      {
        id: "keluarga",
        judul: "Doa untuk Keluarga Penghafal",
        arab: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
        latin: "Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata a'yunin waj'alnā lil-muttaqīna imāmā",
        arti: "Ya Tuhan kami, anugerahkanlah kepada kami pasangan dan keturunan yang menyejukkan hati, dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa",
        sumber: "QS. Al-Furqan: 74",
        faedah: "Syaikh Utsman Al-Khamis: penghafal yang mendoakan keluarganya mendapat keberkahan berlipat. Hafalan adalah warisan terindah yang bisa diteruskan ke anak-cucu.",
        color: "var(--green)",
      },
    ];

    const TIPS_ULAMA = [
      {
        id: "ikhlas",
        icon: "✦",
        judul: "Ikhlas & Niat yang Benar",
        ulama: "Imam Ibnul Qayyim Al-Jauziyyah",
        wafat: "751 H",
        color: "var(--gold)",
        isi: "Ikhlas adalah ruh dari setiap amal. Hafalan yang dicampuri riya' — meski satu huruf — akan menjadi beban di akhirat, bukan pahala. Periksa niat sebelum setiap sesi: 'Untuk siapa aku menghafal ini?'",
        kutipan: "\"Al-Qur'an adalah firman Allah. Maka yang paling berhak menjaganya adalah mereka yang hatinya paling bersih dari selain Allah.\"",
        amal: ["Perbarui niat setiap duduk untuk menghafal", "Sembunyikan hafalan — tidak perlu dipamerkan sebelum kuat", "Jadikan sholat sebagai tempat 'menguji' hafalan, bukan panggung"],
      },
      {
        id: "istiqamah",
        icon: "⟳",
        judul: "Istiqamah Lebih Utama dari Banyak",
        ulama: "Imam Al-Bukhari",
        wafat: "256 H",
        color: "var(--blue)",
        isi: "Imam Al-Bukhari hafal Al-Qur'an sejak kecil dan tidak pernah meninggalkan wirid hariannya meski dalam perjalanan atau sakit. Beliau berkata: 'Amalan yang paling dicintai Allah adalah yang paling ajeg, meskipun sedikit.'",
        kutipan: "\"Orang yang hafal sedikit tapi istiqamah muraja'ahnya lebih mulia dari yang hafal banyak lalu melupakannya.\"",
        amal: ["Tetapkan target harian minimal: 3 ayat/hari", "Jangan skip muraja'ah meski hanya 5 menit", "Tandai kalender — streak konsekutif membangun motivasi"],
      },
      {
        id: "wudhu",
        icon: "◇",
        judul: "Kebersihan Lahir Membantu Kebersihan Batin",
        ulama: "Imam Malik bin Anas",
        wafat: "179 H",
        color: "var(--blue)",
        isi: "Imam Malik tidak pernah membaca atau mengajarkan hadits kecuali dalam keadaan berwudhu dan berpakaian bersih. Beliau berkata bahwa Allah menjadikan ilmu suci, maka ia hanya akan hinggap di jiwa yang menjaga kesucian.",
        kutipan: "\"Tidak pantas bagi seorang yang menyimpan kalam Allah di dadanya untuk bermalas-malasan dalam menjaga wudhu dan kebersihan.\"",
        amal: ["Mulai sesi hafalan dalam keadaan berwudhu", "Pilih tempat bersih dan tenang, jauh dari TV/musik", "Kenakan pakaian yang sopan — tubuh yang terjaga memengaruhi fokus pikiran"],
      },
      {
        id: "tadabbur",
        icon: "◐",
        judul: "Tadabbur Sebelum Menghafal",
        ulama: "Imam Ibnu Jarir Al-Thabari",
        wafat: "310 H",
        color: "var(--purple)",
        isi: "Al-Thabari menulis tafsir 30 jilid karena beliau meyakini bahwa memahami makna adalah fondasi hafalan yang kuat. Beliau selalu membaca terjemahan dan tafsir ringkas sebelum menghafalkan ayat apapun.",
        kutipan: "\"Siapa yang menghafal tanpa memahami, ia seperti membangun rumah di atas pasir. Siapa yang memahami lalu menghafal, ia membangun di atas batu karang.\"",
        amal: ["Baca terjemahan ayat target sebelum menghafal", "Tanyakan: apa yang Allah ingin aku pahami dari ayat ini?", "Hubungkan ayat dengan kehidupan nyata sehari-hari"],
      },
      {
        id: "tilawah",
        icon: "♪",
        judul: "Perbanyak Tilawah Sebelum Menghafal",
        ulama: "Imam As-Suyuthi",
        wafat: "911 H",
        color: "var(--purple)",
        isi: "As-Suyuthi — ulama yang menulis lebih dari 500 kitab — membaca minimal 1 juz tilawah setiap hari seumur hidupnya. Beliau berkata bahwa telinga yang terbiasa mendengar ayat akan memudahkan lisan menghafalnya.",
        kutipan: "\"Jangan langsung menghafal tanpa membaca dulu berkali-kali. Dengarkan sendiri suaramu membacannya — itu adalah cara paling alami otak menyimpan bunyi.\"",
        amal: ["Baca ayat target minimal 7× dengan tartil sebelum menghafal", "Dengarkan murattal qari terpercaya", "Rekam suaramu sendiri dan dengarkan ulang"],
      },
      {
        id: "lapar",
        icon: "◉",
        judul: "Hindari Perut Terlalu Kenyang",
        ulama: "Imam Al-Ghazali",
        wafat: "505 H",
        color: "var(--green)",
        isi: "Al-Ghazali dalam Ihya Ulumuddin menjelaskan bahwa terlalu kenyang adalah musuh ilmu dan hafalan. Darah yang mengalir ke perut akan mengurangi aliran ke otak, menyebabkan kantuk dan lemahnya konsentrasi.",
        kutipan: "\"Kenyangnya perut adalah kekeringan hati, beratnya badan, hilangnya kecerdasan, dan lemahnya hafalan.\"",
        amal: ["Menghafal terbaik: 1–2 jam setelah Subuh saat perut belum penuh", "Jika siang, tunggu 1,5 jam setelah makan besar", "Air putih cukup — dehidrasi ringan menurunkan memori 10–15%"],
      },
      {
        id: "dosa",
        icon: "✧",
        judul: "Jauhi Maksiat, Jaga Akhlak",
        ulama: "Imam Asy-Syafi'i",
        wafat: "204 H",
        color: "var(--green)",
        isi: "Kisah masyhur: Imam Asy-Syafi'i mengadu kepada gurunya Imam Waqi' tentang hafalannya yang buruk. Waqi' menjawab: 'Tinggalkan maksiat, karena ilmu adalah cahaya dan cahaya Allah tidak diberikan kepada orang yang bermaksiat.'",
        kutipan: "\"Ilmu adalah cahaya. Dan cahaya Allah tidak diberikan kepada orang yang bermaksiat.\" — Imam Waqi' kepada Asy-Syafi'i muda",
        amal: ["Jaga pandangan dari yang haram — mata yang terjaga membantu fokus hafalan", "Hindari musik yang melalaikan — telinga yang terbiasa Al-Qur'an lebih tajam", "Perbanyak istighfar sebelum mulai — bersihkan hati seperti membersihkan layar"],
      },
      {
        id: "muraja",
        icon: "⟲",
        judul: "Muraja'ah adalah Separuh Hafalan",
        ulama: "Imam Ibnu Abi Syaibah",
        wafat: "235 H",
        color: "var(--red)",
        isi: "Para ulama salaf berkata: menghafal itu mudah, menjaga hafalan itulah yang berat. Imam Ahmad bin Hanbal setiap malam mengulang minimal sepertujuh Al-Qur'an dalam shalatnya, sehingga beliau mengkhatamkan Al-Qur'an dalam sholat setiap 7 malam.",
        kutipan: "\"Hafalan yang tidak dimuraja'ah 3 hari berturut-turut ibarat buah yang dipetik sebelum matang — akan busuk sebelum bermanfaat.\"",
        amal: ["Gunakan menu Muraja'ah di app setiap hari", "Jadikan sholat sebagai 'ujian hafalan' — recite ayat hafalan di setiap rakaat", "Sebelum tidur: recite satu halaman hafalan tanpa lihat"],
      },
    ];

    const tabStyle = (active) => ({
      flex: 1, padding: "9px 0", border: "none", borderRadius: 10, cursor: "pointer",
      background: active ? "var(--gold)" : "transparent",
      color: active ? "var(--bg)" : "var(--text-secondary)",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
      fontFamily: "'DM Sans', sans-serif",
    });

    const currentDoa = activeTab === "sebelum" ? DOA_SEBELUM : activeTab === "sesudah" ? DOA_SESUDAH : null;

    return (
      <div style={{ padding: "0 0 140px" }}>
        {/* Header */}
        <div style={{ padding: "56px 20px 20px" }}>
          <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "var(--text)", margin: 0 }}>
            Doa & <span style={{ color: "var(--gold)" }}>Adab</span> Menghafal
          </h2>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
            Adab para ulama salaf dalam menjaga hafalan Al-Qur'an
          </div>
        </div>

        {/* Tab selector */}
        <div style={{ padding: "0 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", background: "var(--card)", borderRadius: 14, padding: 4, border: "1px solid var(--border)", gap: 2 }}>
            {[
              { id: "sebelum", label: "Sblm Hafal" },
              { id: "sesudah", label: "Stlh Hafal" },
              { id: "dzikir",  label: "Pagi/Petang" },
              { id: "sholat",  label: "Usai Sholat" },
              { id: "tips",    label: "Ulama" },
            ].map(t => (
              <button key={t.id} style={{
                flex: 1, padding: "8px 1px", border: "none", borderRadius: 9, cursor: "pointer",
                background: activeTab === t.id ? "var(--gold)" : "transparent",
                color: activeTab === t.id ? "var(--bg)" : "var(--text-secondary)",
                fontSize: 8, fontWeight: 700, letterSpacing: "0.02em",
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3,
              }} onClick={() => setActiveTabDoa(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* DOA cards */}
        {currentDoa && (
          <div style={{ padding: "0 20px" }}>
            {/* Banner info */}
            <div style={{
              background: "var(--gold)12", border: "1px solid var(--gold)33",
              borderRadius: 14, padding: "12px 16px", marginBottom: 16,
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>📿</span>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                {activeTab === "sebelum"
                  ? "Baca doa-doa ini sebelum memulai sesi hafalan. Tidak harus semuanya — pilih yang paling menyentuh hati."
                  : "Tutup setiap sesi hafalan dengan doa syukur dan permohonan agar Allah menjaga hafalan dalam dada."}
              </div>
            </div>

            {currentDoa.map((doa) => {
              const isOpen = expandedDoa === doa.id;
              return (
                <div key={doa.id} style={{
                  background: "var(--card)", borderRadius: 18, marginBottom: 14,
                  border: `1px solid ${isOpen ? doa.color + "55" : "var(--border)"}`,
                  overflow: "hidden",
                }}>
                  {/* Header tap */}
                  <div onClick={() => setExpandedDoa(isOpen ? null : doa.id)} style={{
                    padding: "16px 18px", cursor: "pointer",
                    display: "flex", alignItems: "flex-start", gap: 12,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: `${doa.color}22`, border: `1px solid ${doa.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, color: doa.color,
                    }}>🤲</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                        {doa.judul}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>
                        {doa.sumber}
                      </div>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: 18, flexShrink: 0, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
                  </div>

                  {/* Expanded content */}
                  {isOpen && (
                    <div style={{ padding: "0 18px 18px" }}>
                      {/* Arab text */}
                      <div style={{
                        background: `${doa.color}0C`, border: `1px solid ${doa.color}22`,
                        borderRadius: 14, padding: "18px 16px", marginBottom: 14, textAlign: "right",
                      }}>
                        <div style={{
                          fontSize: 22, color: "var(--text)", lineHeight: 2.2,
                          fontFamily: "'Scheherazade New', 'Amiri', serif",
                          direction: "rtl",
                        }}>
                          {doa.arab}
                        </div>
                      </div>

                      {/* Latin */}
                      <div style={{
                        fontSize: 12, color: doa.color, fontFamily: "'DM Sans', sans-serif",
                        fontStyle: "italic", lineHeight: 1.8, marginBottom: 10,
                        padding: "0 4px",
                      }}>
                        {doa.latin}
                      </div>

                      {/* Arti */}
                      <div style={{
                        fontSize: 12, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.8, marginBottom: 14, padding: "0 4px",
                      }}>
                        <span style={{ color: "var(--muted)", fontSize: 10 }}>Artinya: </span>
                        {doa.arti}
                      </div>

                      {/* Faedah ulama */}
                      <div style={{
                        background: "var(--bg-deeper)", borderRadius: 12, padding: "12px 14px",
                        borderLeft: `3px solid ${doa.color}`,
                      }}>
                        <div style={{ fontSize: 9, color: doa.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>
                          💡 FAEDAH ULAMA
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                          {doa.faedah}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TIPS ULAMA tab */}
        {activeTab === "tips" && (
          <div style={{ padding: "0 20px" }}>
            <div style={{
              background: "var(--purple)12", border: "1px solid var(--purple)33",
              borderRadius: 14, padding: "12px 16px", marginBottom: 16,
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>📚</span>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                Kumpulan adab & tips menghafal dari para ulama salaf. Mereka adalah bukti hidup bahwa Al-Qur'an bisa dihafal oleh siapa saja yang benar-benar bersungguh-sungguh.
              </div>
            </div>

            {TIPS_ULAMA.map((tip) => {
              const isOpen = expandedTips === tip.id;
              return (
                <div key={tip.id} style={{
                  background: "var(--card)", borderRadius: 18, marginBottom: 14,
                  border: `1px solid ${isOpen ? tip.color + "55" : "var(--border)"}`,
                  overflow: "hidden",
                }}>
                  <div onClick={() => setExpandedTips(isOpen ? null : tip.id)} style={{
                    padding: "16px 18px", cursor: "pointer",
                    display: "flex", alignItems: "flex-start", gap: 12,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: `${tip.color}22`, border: `1px solid ${tip.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, color: tip.color,
                    }}>{tip.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                        {tip.judul}
                      </div>
                      <div style={{ fontSize: 10, color: tip.color, fontFamily: "'DM Sans', sans-serif", marginTop: 3, fontWeight: 600 }}>
                        {tip.ulama} <span style={{ color: "var(--muted)", fontWeight: 400 }}>— wafat {tip.wafat}</span>
                      </div>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: 18, flexShrink: 0, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
                  </div>

                  {isOpen && (
                    <div style={{ padding: "0 18px 18px" }}>
                      {/* Isi */}
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, marginBottom: 14 }}>
                        {tip.isi}
                      </div>

                      {/* Kutipan */}
                      <div style={{
                        background: `${tip.color}0C`, borderRadius: 14, padding: "14px 16px",
                        borderLeft: `3px solid ${tip.color}`, marginBottom: 14,
                      }}>
                        <div style={{ fontSize: 11, color: tip.color, fontFamily: "'Playfair Display', serif", fontStyle: "italic", lineHeight: 1.8 }}>
                          {tip.kutipan}
                        </div>
                        <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 6, letterSpacing: "0.08em" }}>
                          — {tip.ulama}
                        </div>
                      </div>

                      {/* Amal praktis */}
                      <div style={{ background: "var(--bg-deeper)", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ fontSize: 9, color: tip.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>
                          ✦ AMAL PRAKTIS
                        </div>
                        {tip.amal.map((a, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                            <div style={{ width: 18, height: 18, borderRadius: 6, background: `${tip.color}22`, border: `1px solid ${tip.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: tip.color, flexShrink: 0, marginTop: 1 }}>
                              {i + 1}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                              {a}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== DZIKIR PAGI & PETANG ===== */}
        {activeTab === "dzikir" && (
          <div style={{ padding: "0 20px" }}>
            {/* Waktu selector */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[
                { id: "pagi",   label: "🌅 Dzikir Pagi",   sub: "Setelah Subuh", color: "var(--gold)" },
                { id: "petang", label: "🌆 Dzikir Petang",  sub: "Setelah Ashar", color: "var(--purple)" },
              ].map(w => (
                <div key={w.id} onClick={() => setDzikirWaktu(w.id)} style={{
                  flex: 1, background: dzikir_waktu === w.id ? `${w.color}20` : "var(--card)",
                  border: `1px solid ${dzikir_waktu === w.id ? w.color + "66" : "var(--border)"}`,
                  borderRadius: 14, padding: "12px 14px", cursor: "pointer", textAlign: "center",
                }}>
                  <div style={{ fontSize: 13, color: dzikir_waktu === w.id ? w.color : "var(--text)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{w.label}</div>
                  <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 3 }}>{w.sub}</div>
                </div>
              ))}
            </div>

            {/* Info banner */}
            <div style={{
              background: dzikir_waktu === "pagi" ? "var(--gold)10" : "var(--purple)10",
              border: `1px solid ${dzikir_waktu === "pagi" ? "var(--gold)30" : "var(--purple)30"}`,
              borderRadius: 14, padding: "11px 14px", marginBottom: 16,
              fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7,
            }}>
              {dzikir_waktu === "pagi"
                ? "📖 HR. Abu Dawud & At-Tirmidzi — Dibaca setelah sholat Subuh hingga matahari terbit"
                : "📖 HR. Abu Dawud & At-Tirmidzi — Dibaca setelah sholat Ashar hingga matahari terbenam"}
            </div>

            {(dzikir_waktu === "pagi" ? DZIKIR_PAGI : DZIKIR_PETANG).map((dz, idx) => {
              const isOpen = expandedDzikir === dz.id;
              const accentColor = dzikir_waktu === "pagi" ? "var(--gold)" : "var(--purple)";
              return (
                <div key={dz.id} style={{
                  background: "var(--card)", borderRadius: 18, marginBottom: 12,
                  border: `1px solid ${isOpen ? accentColor + "55" : "var(--border)"}`,
                  overflow: "hidden",
                }}>
                  {/* Header */}
                  <div onClick={() => setExpandedDzikir(isOpen ? null : dz.id)} style={{
                    padding: "14px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    {/* Nomor */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: `${accentColor}20`, border: `1px solid ${accentColor}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: accentColor, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    }}>{idx + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{dz.judul}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: 9, color: accentColor, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                          background: `${accentColor}18`, padding: "2px 7px", borderRadius: 6 }}>
                          {dz.ulang}× ulang
                        </span>
                        <span style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>{dz.sumber}</span>
                      </div>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div style={{ padding: "0 16px 16px" }}>
                      {/* Arab */}
                      <div style={{
                        background: `${accentColor}0A`, border: `1px solid ${accentColor}22`,
                        borderRadius: 14, padding: "18px 16px", marginBottom: 12,
                        textAlign: "right",
                      }}>
                        <div style={{
                          fontSize: 20, color: "var(--text)", lineHeight: 2.2,
                          fontFamily: "'Scheherazade New', 'Amiri', serif",
                          direction: "rtl",
                        }}>{dz.arab}</div>
                      </div>
                      {/* Latin */}
                      <div style={{ fontSize: 11, color: accentColor, fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", lineHeight: 1.8, marginBottom: 8, padding: "0 4px" }}>
                        {dz.latin}
                      </div>
                      {/* Arti */}
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, marginBottom: 12, padding: "0 4px" }}>
                        <span style={{ color: "var(--muted)", fontSize: 10 }}>Artinya: </span>{dz.arti}
                      </div>
                      {/* Faedah */}
                      {dz.faedah && (
                        <div style={{ background: "var(--bg-deeper)", borderRadius: 12, padding: "11px 14px", borderLeft: `3px solid ${accentColor}` }}>
                          <div style={{ fontSize: 9, color: accentColor, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>💡 FAEDAH</div>
                          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>{dz.faedah}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ===== DZIKIR SETELAH SHOLAT ===== */}
        {activeTab === "sholat" && (
          <div style={{ padding: "0 20px" }}>
            {/* Banner */}
            <div style={{
              background: "var(--green)10", border: "1px solid var(--green)30",
              borderRadius: 14, padding: "12px 16px", marginBottom: 16,
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🕌</span>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
                Dzikir setelah sholat fardhu berdasarkan hadits shahih. Urutan sesuai yang dipraktikkan Nabi ﷺ — dari salam hingga selesai.
              </div>
            </div>

            {/* Urutan panduan singkat */}
            <div style={{
              background: "var(--card)", borderRadius: 14, padding: "12px 16px",
              marginBottom: 16, border: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 10, color: "var(--gold)", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>
                ✦ URUTAN LENGKAP
              </div>
              {[
                { n: "1", t: "Istighfar 3×", c: "var(--green)" },
                { n: "2", t: "Allāhumma antas-salām...", c: "var(--green)" },
                { n: "3", t: "Tasbih · Tahmid · Takbir (33×)", c: "var(--blue)" },
                { n: "4", t: "Ayat Kursi (1×)", c: "var(--gold)" },
                { n: "5", t: "Lā ilāha illallāhu waḥdah...", c: "var(--gold)" },
                { n: "6", t: "Allāhumma a'innī...", c: "var(--purple)" },
                { n: "→", t: "+ Doa pilihan sesuai kebutuhan", c: "var(--muted)" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "center" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: `${row.c}20`, border: `1px solid ${row.c}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: row.c, fontWeight: 700, flexShrink: 0 }}>{row.n}</div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>{row.t}</div>
                </div>
              ))}
            </div>

            {/* Doa list */}
            {DZIKIR_SHOLAT.map((dz) => {
              const isOpen = expandedDzikir === dz.id;
              return (
                <div key={dz.id} style={{
                  background: "var(--card)", borderRadius: 18, marginBottom: 12,
                  border: `1px solid ${isOpen ? dz.color + "55" : "var(--border)"}`,
                  overflow: "hidden",
                }}>
                  <div onClick={() => setExpandedDzikir(isOpen ? null : dz.id)} style={{
                    padding: "14px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: `${dz.color}20`, border: `1px solid ${dz.color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, color: dz.color, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    }}>{dz.urutan}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>{dz.judul}</div>
                      <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 3, lineHeight: 1.4 }}>{dz.waktu}</div>
                    </div>
                    <span style={{ color: "var(--muted)", fontSize: 18, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>›</span>
                  </div>

                  {isOpen && (
                    <div style={{ padding: "0 16px 16px" }}>
                      {/* Arab */}
                      <div style={{
                        background: `${dz.color}0A`, border: `1px solid ${dz.color}22`,
                        borderRadius: 14, padding: "18px 16px", marginBottom: 12,
                        textAlign: "right",
                      }}>
                        <div style={{
                          fontSize: 20, color: "var(--text)", lineHeight: 2.2,
                          fontFamily: "'Scheherazade New', 'Amiri', serif",
                          direction: "rtl",
                        }}>{dz.arab}</div>
                      </div>
                      {/* Latin */}
                      <div style={{ fontSize: 11, color: dz.color, fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", lineHeight: 1.8, marginBottom: 8, padding: "0 4px", whiteSpace: "pre-line" }}>
                        {dz.latin}
                      </div>
                      {/* Arti */}
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.8, marginBottom: 12, padding: "0 4px" }}>
                        <span style={{ color: "var(--muted)", fontSize: 10 }}>Artinya: </span>{dz.arti}
                      </div>
                      {/* Sumber */}
                      <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginBottom: 12, padding: "0 4px", fontStyle: "italic" }}>
                        {dz.sumber}
                      </div>
                      {/* Faedah */}
                      <div style={{ background: "var(--bg-deeper)", borderRadius: 12, padding: "11px 14px", borderLeft: `3px solid ${dz.color}` }}>
                        <div style={{ fontSize: 9, color: dz.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>💡 FAEDAH</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>{dz.faedah}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    );
  };


  // ===== RENDER =====
  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: 430, margin: "0 auto", position: "relative",
      paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        :root {
        --bg: #0A0C14;
        --bg-deeper: #0D1018;
        --card: #141824;
        --border-soft: #1A1E2E;
        --border: #1E2535;
        --border-mid: #2A3045;
        --muted-deep: #2A3050;
        --muted-alt: #5A6080;
        --subtle: #384058;
        --muted: #7A8298;
        --gold-disabled: #5A4A2E;
        --blue-dark: #5A8FB4;
        --text-dim: #9AA0B8;
        --text-dim2: #8A9080;
        --text-secondary: #B0A898;
        --text-warm: #C8C0A8;
        --text: #EDE0CA;
        --gold: #D4B478;
        --gold-dark: #A8893E;
        --blue: #8BBDE0;
        --purple: #A88CD4;
        --green: #78C0A0;
        --green-dark: #4A8F72;
        --purple-dark: #7B5EA8;
        --red: #F06050;
      }
        :root.light {
        --bg: #F5F0E8;
        --bg-deeper: #EDE8DC;
        --card: #FFFFFF;
        --border-soft: #E8E0D0;
        --border: #DDD5C0;
        --border-mid: #C8BFAA;
        --muted-deep: #B8A890;
        --muted-alt: #9A8D78;
        --subtle: #C0B4A0;
        --muted: #6A5D4A;
        --gold-disabled: #C8A020;
        --blue-dark: #4A7FA4;
        --text-dim: #5A4D3A;
        --text-dim2: #6A5D4A;
        --text-secondary: #483C2A;
        --text-warm: #3A2E1C;
        --text: #1A1208;
        --gold: #9A6E10;
        --gold-dark: #7A5210;
        --blue: #2A6A9C;
        --purple: #5A3E90;
        --green: #1A6A48;
        --green-dark: #0A4A30;
        --purple-dark: #4A2E78;
        --red: #B02010;
      }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box;
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease; }
        html, body { margin: 0; padding: 0; background: var(--bg); }
        ::-webkit-scrollbar { display: none; }
        input { -webkit-appearance: none; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, var(--gold)08 0%, transparent 70%)" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {screen === "dashboard" && <Dashboard />}
        {screen === "hafalan" && !selectedSurahDetail && <HafalanScreen />}
        {screen === "hafalan" && selectedSurahDetail && (
          <SurahDetailScreen
            surah={selectedSurahDetail}
            hafalanData={hafalanData}
            markStatus={markStatus}
            resetStatus={resetStatus}
            onBack={() => setSelectedSurahDetail(null)}
          />
        )}
        {screen === "muraja" && <MurajaScreen />}
        {screen === "jadwal" && <JadwalScreen />}
        {screen === "metode" && <MetodeScreen />}
        {screen === "sholat" && <SholatScreen />}
        {screen === "doa" && <DoaScreen />}
        {screen === "panduan" && <PanduanScreen />}
      </div>

      <Toast />
      <NavBar />
    </div>
  );
}

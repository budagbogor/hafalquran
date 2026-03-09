import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, signIn, signUp, signOut, loadHafalan, upsertHafalan, insertMurajaLog, loadReminders, upsertReminder } from "./supabase.js";
import { dzikirData } from "./data/dzikir.js";

// ===== DATA & CONSTANTS =====
const SURAHS = [
  { id: 1, name: "Al-Fatihah", arabic: "الْفَاتِحَة", ayat: 7, juz: 1 },
  { id: 2, name: "Al-Baqarah", arabic: "الْبَقَرَة", ayat: 286, juz: 1 },
  { id: 3, name: "Ali Imran", arabic: "آلِ عِمْرَان", ayat: 200, juz: 3 },
  { id: 4, name: "An-Nisa", arabic: "النِّسَاء", ayat: 176, juz: 4 },
  { id: 5, name: "Al-Maidah", arabic: "الْمَائِدَة", ayat: 120, juz: 6 },
  { id: 6, name: "Al-An'am", arabic: "الْأَنْعَام", ayat: 165, juz: 7 },
  { id: 7, name: "Al-A'raf", arabic: "الْأَعْرَاف", ayat: 206, juz: 8 },
  { id: 8, name: "Al-Anfal", arabic: "الْأَنْفَال", ayat: 75, juz: 9 },
  { id: 9, name: "At-Taubah", arabic: "التَّوْبَة", ayat: 129, juz: 10 },
  { id: 10, name: "Yunus", arabic: "يُونُس", ayat: 109, juz: 11 },
  { id: 11, name: "Hud", arabic: "هُود", ayat: 123, juz: 11 },
  { id: 12, name: "Yusuf", arabic: "يُوسُف", ayat: 111, juz: 12 },
  { id: 13, name: "Ar-Ra'd", arabic: "الرَّعْد", ayat: 43, juz: 13 },
  { id: 14, name: "Ibrahim", arabic: "إِبْرَاهِيم", ayat: 52, juz: 13 },
  { id: 15, name: "Al-Hijr", arabic: "الْحِجْر", ayat: 99, juz: 14 },
  { id: 16, name: "An-Nahl", arabic: "النَّحْل", ayat: 128, juz: 14 },
  { id: 17, name: "Al-Isra", arabic: "الْإِسْرَاء", ayat: 111, juz: 15 },
  { id: 18, name: "Al-Kahfi", arabic: "الْكَهْف", ayat: 110, juz: 15 },
  { id: 19, name: "Maryam", arabic: "مَرْيَم", ayat: 98, juz: 16 },
  { id: 20, name: "Taha", arabic: "طه", ayat: 135, juz: 16 },
  { id: 21, name: "Al-Anbiya", arabic: "الْأَنْبِيَاء", ayat: 112, juz: 17 },
  { id: 22, name: "Al-Hajj", arabic: "الْحَجّ", ayat: 78, juz: 17 },
  { id: 23, name: "Al-Mu'minun", arabic: "الْمُؤْمِنُون", ayat: 118, juz: 18 },
  { id: 24, name: "An-Nur", arabic: "النُّور", ayat: 64, juz: 18 },
  { id: 25, name: "Al-Furqan", arabic: "الْفُرْقَان", ayat: 77, juz: 18 },
  { id: 26, name: "Asy-Syu'ara", arabic: "الشُّعَرَاء", ayat: 227, juz: 19 },
  { id: 27, name: "An-Naml", arabic: "النَّمْل", ayat: 93, juz: 19 },
  { id: 28, name: "Al-Qasas", arabic: "الْقَصَص", ayat: 88, juz: 20 },
  { id: 29, name: "Al-Ankabut", arabic: "الْعَنْكَبُوت", ayat: 69, juz: 20 },
  { id: 30, name: "Ar-Rum", arabic: "الرُّوم", ayat: 60, juz: 21 },
  { id: 31, name: "Luqman", arabic: "لُقْمَان", ayat: 34, juz: 21 },
  { id: 32, name: "As-Sajdah", arabic: "السَّجْدَة", ayat: 30, juz: 21 },
  { id: 33, name: "Al-Ahzab", arabic: "الْأَحْزَاب", ayat: 73, juz: 21 },
  { id: 34, name: "Saba", arabic: "سَبَأ", ayat: 54, juz: 22 },
  { id: 35, name: "Fatir", arabic: "فَاطِر", ayat: 45, juz: 22 },
  { id: 36, name: "Yasin", arabic: "يس", ayat: 83, juz: 22 },
  { id: 37, name: "As-Saffat", arabic: "الصَّافَّات", ayat: 182, juz: 23 },
  { id: 38, name: "Sad", arabic: "ص", ayat: 88, juz: 23 },
  { id: 39, name: "Az-Zumar", arabic: "الزُّمَر", ayat: 75, juz: 23 },
  { id: 40, name: "Gafir", arabic: "غَافِر", ayat: 85, juz: 24 },
  { id: 41, name: "Fussilat", arabic: "فُصِّلَت", ayat: 54, juz: 24 },
  { id: 42, name: "Asy-Syura", arabic: "الشُّورَى", ayat: 53, juz: 25 },
  { id: 43, name: "Az-Zukhruf", arabic: "الزُّخْرُف", ayat: 89, juz: 25 },
  { id: 44, name: "Ad-Dukhan", arabic: "الدُّخَان", ayat: 59, juz: 25 },
  { id: 45, name: "Al-Jasiyah", arabic: "الْجَاثِيَة", ayat: 37, juz: 25 },
  { id: 46, name: "Al-Ahqaf", arabic: "الْأَحْقَاف", ayat: 35, juz: 26 },
  { id: 47, name: "Muhammad", arabic: "مُحَمَّد", ayat: 38, juz: 26 },
  { id: 48, name: "Al-Fath", arabic: "الْفَتْح", ayat: 29, juz: 26 },
  { id: 49, name: "Al-Hujurat", arabic: "الْحُجُرَات", ayat: 18, juz: 26 },
  { id: 50, name: "Qaf", arabic: "ق", ayat: 45, juz: 26 },
  { id: 51, name: "Az-Zariyat", arabic: "الذَّارِيَات", ayat: 60, juz: 26 },
  { id: 52, name: "At-Tur", arabic: "الطُّور", ayat: 49, juz: 27 },
  { id: 53, name: "An-Najm", arabic: "النَّجْم", ayat: 62, juz: 27 },
  { id: 54, name: "Al-Qamar", arabic: "الْقَمَر", ayat: 55, juz: 27 },
  { id: 55, name: "Ar-Rahman", arabic: "الرَّحْمَن", ayat: 78, juz: 27 },
  { id: 56, name: "Al-Waqi'ah", arabic: "الْوَاقِعَة", ayat: 96, juz: 27 },
  { id: 57, name: "Al-Hadid", arabic: "الْحَدِيد", ayat: 29, juz: 27 },
  { id: 58, name: "Al-Mujadilah", arabic: "الْمُجَادِلَة", ayat: 22, juz: 28 },
  { id: 59, name: "Al-Hasyr", arabic: "الْحَشْر", ayat: 24, juz: 28 },
  { id: 60, name: "Al-Mumtahanah", arabic: "الْمُمْتَحَنَة", ayat: 13, juz: 28 },
  { id: 61, name: "As-Saf", arabic: "الصَّف", ayat: 14, juz: 28 },
  { id: 62, name: "Al-Jumu'ah", arabic: "الْجُمُعَة", ayat: 11, juz: 28 },
  { id: 63, name: "Al-Munafiqun", arabic: "الْمُنَافِقُون", ayat: 11, juz: 28 },
  { id: 64, name: "At-Tagabun", arabic: "التَّغَابُن", ayat: 18, juz: 28 },
  { id: 65, name: "At-Talaq", arabic: "الطَّلَاق", ayat: 12, juz: 28 },
  { id: 66, name: "At-Tahrim", arabic: "التَّحْرِيم", ayat: 12, juz: 28 },
  { id: 67, name: "Al-Mulk", arabic: "الْمُلْك", ayat: 30, juz: 29 },
  { id: 68, name: "Al-Qalam", arabic: "الْقَلَم", ayat: 52, juz: 29 },
  { id: 69, name: "Al-Haqqah", arabic: "الْحَاقَّة", ayat: 52, juz: 29 },
  { id: 70, name: "Al-Ma'arij", arabic: "الْمَعَارِج", ayat: 44, juz: 29 },
  { id: 71, name: "Nuh", arabic: "نُوح", ayat: 28, juz: 29 },
  { id: 72, name: "Al-Jin", arabic: "الْجِن", ayat: 28, juz: 29 },
  { id: 73, name: "Al-Muzzammil", arabic: "الْمُزَّمِّل", ayat: 20, juz: 29 },
  { id: 74, name: "Al-Muddassir", arabic: "الْمُدَّثِّر", ayat: 56, juz: 29 },
  { id: 75, name: "Al-Qiyamah", arabic: "الْقِيَامَة", ayat: 40, juz: 29 },
  { id: 76, name: "Al-Insan", arabic: "الْإِنْسَان", ayat: 31, juz: 29 },
  { id: 77, name: "Al-Mursalat", arabic: "الْمُرْسَلَات", ayat: 50, juz: 29 },
  { id: 78, name: "An-Naba", arabic: "النَّبَأ", ayat: 40, juz: 30 },
  { id: 79, name: "An-Nazi'at", arabic: "النَّازِعَات", ayat: 46, juz: 30 },
  { id: 80, name: "'Abasa", arabic: "عَبَسَ", ayat: 42, juz: 30 },
  { id: 81, name: "At-Takwir", arabic: "التَّكْوِير", ayat: 29, juz: 30 },
  { id: 82, name: "Al-Infitar", arabic: "الْإِنْفِطَار", ayat: 19, juz: 30 },
  { id: 83, name: "Al-Mutaffifin", arabic: "الْمُطَفِّفِين", ayat: 36, juz: 30 },
  { id: 84, name: "Al-Insyiqaq", arabic: "الِانْشِقَاق", ayat: 25, juz: 30 },
  { id: 85, name: "Al-Buruj", arabic: "الْبُرُوج", ayat: 22, juz: 30 },
  { id: 86, name: "At-Tariq", arabic: "الطَّارِق", ayat: 17, juz: 30 },
  { id: 87, name: "Al-A'la", arabic: "الْأَعْلَى", ayat: 19, juz: 30 },
  { id: 88, name: "Al-Gasyiyah", arabic: "الْغَاشِيَة", ayat: 26, juz: 30 },
  { id: 89, name: "Al-Fajr", arabic: "الْفَجْر", ayat: 30, juz: 30 },
  { id: 90, name: "Al-Balad", arabic: "الْبَلَد", ayat: 20, juz: 30 },
  { id: 91, name: "Asy-Syams", arabic: "الشَّمْس", ayat: 15, juz: 30 },
  { id: 92, name: "Al-Lail", arabic: "اللَّيْل", ayat: 21, juz: 30 },
  { id: 93, name: "Ad-Duha", arabic: "الضُّحَى", ayat: 11, juz: 30 },
  { id: 94, name: "Asy-Syarh", arabic: "الشَّرْح", ayat: 8, juz: 30 },
  { id: 95, name: "At-Tin", arabic: "التِّين", ayat: 8, juz: 30 },
  { id: 96, name: "Al-'Alaq", arabic: "الْعَلَق", ayat: 19, juz: 30 },
  { id: 97, name: "Al-Qadr", arabic: "الْقَدْر", ayat: 5, juz: 30 },
  { id: 98, name: "Al-Bayyinah", arabic: "الْبَيِّنَة", ayat: 8, juz: 30 },
  { id: 99, name: "Az-Zalzalah", arabic: "الزَّلْزَلَة", ayat: 8, juz: 30 },
  { id: 100, name: "Al-Adiyat", arabic: "الْعَادِيَات", ayat: 11, juz: 30 },
  { id: 101, name: "Al-Qariah", arabic: "الْقَارِعَة", ayat: 11, juz: 30 },
  { id: 102, name: "At-Takasur", arabic: "التَّكَاثُر", ayat: 8, juz: 30 },
  { id: 103, name: "Al-Asr", arabic: "الْعَصْر", ayat: 3, juz: 30 },
  { id: 104, name: "Al-Humazah", arabic: "الْهُمَزَة", ayat: 9, juz: 30 },
  { id: 105, name: "Al-Fil", arabic: "الْفِيل", ayat: 5, juz: 30 },
  { id: 106, name: "Quraisy", arabic: "قُرَيْش", ayat: 4, juz: 30 },
  { id: 107, name: "Al-Maun", arabic: "الْمَاعُون", ayat: 7, juz: 30 },
  { id: 108, name: "Al-Kautsar", arabic: "الْكَوْثَر", ayat: 3, juz: 30 },
  { id: 109, name: "Al-Kafirun", arabic: "الْكَافِرُون", ayat: 6, juz: 30 },
  { id: 110, name: "An-Nasr", arabic: "النَّصْر", ayat: 3, juz: 30 },
  { id: 111, name: "Al-Masad", arabic: "الْمَسَد", ayat: 5, juz: 30 },
  { id: 112, name: "Al-Ikhlas", arabic: "الْإِخْلَاص", ayat: 4, juz: 30 },
  { id: 113, name: "Al-Falaq", arabic: "الْفَلَق", ayat: 5, juz: 30 },
  { id: 114, name: "An-Nas", arabic: "النَّاس", ayat: 6, juz: 30 },
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
      {
        phase: "PERSIAPAN", time: "5 menit", icon: "◇", color: "var(--gold)88", steps: [
          "Ambil wudhu & duduk tenang — otak butuh kondisi relaks untuk encoding",
          "Baca terjemahan seluruh surah/bagian yang akan dihafal — pahami alurnya",
          "Tentukan target: 3–5 ayat per sesi (jangan lebih)",
        ]
      },
      {
        phase: "HAFAL AYAT 1", time: "5 menit", icon: "①", color: "var(--gold)", steps: [
          "Baca ayat 1 dengan tartil sambil melihat → 3 kali",
          "Tutup mushaf → ucapkan dari ingatan → 3 kali",
          "Jika salah, buka lagi → ulangi. Jangan lanjut sebelum ayat 1 lancar",
          "Test terakhir: ucapkan ayat 1 tanpa lihat 2 kali berturut-turut ✓",
        ]
      },
      {
        phase: "HAFAL AYAT 2 + SNOWBALL", time: "7 menit", icon: "②", color: "var(--gold)", steps: [
          "Hafal ayat 2 dengan cara sama (lihat 3x → tutup 3x)",
          "SNOWBALL: Ucapkan Ayat 1 + Ayat 2 berturut-turut tanpa lihat → 3 kali",
          "Ini kunci metode — menggabung selalu lebih kuat dari hafal terpisah",
        ]
      },
      {
        phase: "LANJUT HINGGA TARGET", time: "15 menit", icon: "③", color: "var(--gold)", steps: [
          "Ulangi pola: hafal ayat baru → Snowball dari ayat 1 s.d. ayat terbaru",
          "Setiap tambah 1 ayat, selalu mulai ulangan dari ayat pertama",
          "Berhenti saat mencapai target (3–5 ayat). Jangan paksa lebih",
        ]
      },
      {
        phase: "PENUTUP & KONSOLIDASI", time: "5 menit", icon: "◈", color: "var(--gold)CC", steps: [
          "Ucapkan seluruh hafalan hari ini dari awal tanpa lihat — 2 kali",
          "Tandai ayat yang masih ragu untuk diulang besok pagi",
          "Jadwalkan review: besok pagi (Subuh), 3 hari lagi, 7 hari lagi",
        ]
      },
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
      {
        phase: "HARI 1 — HAFAL BARU", time: "30–45 menit", icon: "①", color: "var(--blue)", steps: [
          "Hafal target surah/ayat dengan metode Chunking Snowball",
          "Di akhir sesi: recite seluruh hafalan baru tanpa lihat — catat berapa kali salah",
          "Set pengingat: besok pagi review pertama",
        ]
      },
      {
        phase: "HARI 2 — REVIEW 1 (7×)", time: "10 menit", icon: "②", color: "var(--blue)", steps: [
          "Sebelum buka mushaf: coba recite dari ingatan dulu — di sinilah penguatan terjadi",
          "Recite hafalan kemarin 7 kali berturut-turut (boleh sambil melihat di pengulangan 5–7)",
          "Otak sedang berjuang mengambil memori = memperkuat sinaps",
          "Tandai: Lancar ✓ atau Perlu Perbaikan ⚠",
        ]
      },
      {
        phase: "HARI 4 — REVIEW 2 (3×)", time: "7 menit", icon: "③", color: "var(--blue)", steps: [
          "Tanpa melihat mushaf, recite 3 kali dari awal",
          "Jika ada yang terlupa: lihat sebentar, lalu tutup dan ulangi bagian itu 3×",
          "Setelah lancar, recite sekali lagi dari awal sampai akhir",
        ]
      },
      {
        phase: "HARI 7 — REVIEW 3 (2×)", time: "5 menit", icon: "④", color: "var(--blue)", steps: [
          "Recite 2 kali tanpa lihat. Jika ada kesalahan, tambah 1 kali lagi",
          "Ini titik kritis: hafalan yang lolos hari ke-7 biasanya masuk memori jangka panjang",
        ]
      },
      {
        phase: "HARI 14, 30, 60 — MAINTENANCE", time: "3–5 menit", icon: "⟳", color: "var(--blue)88", steps: [
          "Cukup recite 1× tanpa lihat di setiap interval",
          "Jika masih lancar → interval berikutnya. Jika terlupa → kembali ke Hari 2",
          "Gunakan menu Muraja'ah di app ini untuk tracking otomatis",
        ]
      },
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
      {
        phase: "VISUAL — Lihat & Amati", time: "8 menit", icon: "👁", color: "var(--purple)", steps: [
          "Buka mushaf, baca ayat target perlahan — perhatikan bentuk huruf dan pola tulisan",
          "Bayangkan 'foto' teks di kepala: di baris mana, di pojok mana halaman",
          "Tutup mata → bayangkan teks ada di depan Anda → buka → koreksi",
          "Ulangi 3× sampai Anda bisa 'melihat' ayat di mata pikiran",
        ]
      },
      {
        phase: "AUDITORY — Dengar & Ikuti", time: "10 menit", icon: "♪", color: "var(--purple)", steps: [
          "Cari murattal qari favorit (Mishari Rashid, Mahmoud Khalil, dll.) di YouTube/aplikasi",
          "Dengarkan ayat target 3× tanpa ikut membaca — resapi irama dan makhraj",
          "Dengarkan lagi 3× sambil mengikuti dengan bisikan (shadowing)",
          "Dengarkan 1× terakhir, lalu coba recite sendiri mengikuti irama yang baru didengar",
        ]
      },
      {
        phase: "KINESTHETIC — Tulis Tangan", time: "12 menit", icon: "✎", color: "var(--purple)", steps: [
          "Tulis ayat target di kertas dengan tangan — jangan ketik, harus tulis tangan",
          "Menulis mengaktifkan motor memory — jenis memori berbeda dari auditory",
          "Tulis 2× sambil melihat, lalu tutup mushaf dan tulis 1× dari ingatan",
          "Bandingkan tulisan Anda dengan mushaf — perbaiki yang salah",
        ]
      },
      {
        phase: "RECITE — Gabungkan Semua", time: "10 menit", icon: "◎", color: "var(--purple)CC", steps: [
          "Recite ayat keras-keras (bukan bisik) sambil membayangkan teks di kepala",
          "Ucapkan 5× tanpa lihat — gunakan irama murattal yang tadi didengar",
          "Setiap kali recite, bayangkan MAKNA ayat dalam pikiran — multi-layer encoding",
          "Test akhir: tutup mata, recite sekali → ini simpan ke long-term memory",
        ]
      },
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
      {
        phase: "PAHAMI KONTEKS", time: "10 menit", icon: "◇", color: "var(--green)", steps: [
          "Baca terjemahan seluruh surah/bagian — jangan langsung hafal",
          "Baca tafsir ringkas (boleh pakai aplikasi) — apa tema utama? Siapa yang dituju?",
          "Tanyakan pada diri: 'Mengapa ayat ini ada setelah ayat sebelumnya?'",
          "Catat 1–2 kalimat: 'Ayat ini bicara tentang...'",
        ]
      },
      {
        phase: "PETA MAKNA AYAT", time: "10 menit", icon: "◐", color: "var(--green)", steps: [
          "Bagi ayat menjadi 'frasa makna' — setiap frasa punya satu ide",
          "Contoh: 'الرَّحْمَنِ الرَّحِيمِ' → 'Dua sifat kasih Allah yang berbeda nuansanya'",
          "Untuk setiap frasa Arab, hafal padanan maknanya dalam bahasa Indonesia",
          "Ini bukan terjemahan kaku — tapi 'jangkar makna' yang bantu ingat urutan",
        ]
      },
      {
        phase: "HAFAL DENGAN CERITA MAKNA", time: "15 menit", icon: "①", color: "var(--green)", steps: [
          "Baca ayat 1 Arab → ucapkan maknanya → baca lagi Arab → tutup → recite",
          "Setiap kali recite Arab, 'rasakan' makna mengalir — bukan hafal kata, tapi makna",
          "Jika lupa kata → ingat dulu MAKNANYA → biasanya kata Arab ikut muncul",
          "Snowball: tambah ayat berikut, selalu gabung dari ayat pertama",
        ]
      },
      {
        phase: "AJARKAN KE ORANG LAIN (Feynman Technique)", time: "10 menit", icon: "◎", color: "var(--green)", steps: [
          "Recite hafalan, lalu jelaskan maknanya kepada siapapun (anak, istri, teman, cermin)",
          "Jika Anda bisa menjelaskan dengan bahasa sederhana → hafalan sudah di long-term memory",
          "Jika ada yang tidak bisa dijelaskan → itu bagian yang perlu diulang",
          "Teknik Feynman (Nobel Physicist): 'Jika tidak bisa jelaskan sederhana, berarti belum paham'",
        ]
      },
      {
        phase: "RETRIEVAL TEST", time: "10 menit", icon: "✓", color: "var(--green)CC", steps: [
          "Tutup semua referensi. Recite dari awal tanpa lihat",
          "Jika lupa → jangan langsung lihat. Coba 30 detik recall dulu — perjuangan ini yang memperkuat",
          "Catat mana yang lancar, mana yang masih ragu",
          "Baru buka mushaf untuk koreksi — ulangi bagian yang salah 5×",
        ]
      },
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
      <style>{`
        :root {
          /* Premium Dark Mode - Midnight Indigo & Muted Gold */
          --bg: #090B10; --bg-deeper: #05060A; --card: #12151D;
          --border-soft: #1C212D; --border: #252B3A; --border-mid: #323A4D;
          --muted-deep: #404B62; --muted: #6B7B96; --gold-disabled: #5E503B;
          --muted-alt: #8294B2; --blue-dark: #4A81A5; --text-dim: #98A9C6;
          --text-dim2: #B0BED8; --text-secondary: #C8D4E8; --text-warm: #E6DCCH;
          --text: #F2EFE9; /* Very Soft Ivory Off-White */
          --gold: #CBA568; --gold-dark: #A3824A; /* Muted Prestige Gold */
          --blue: #7DB2D4; --purple: #9F8ECC; --green: #68B091;
          --green-dark: #458A6D; --purple-dark: #7460A3; --red: #E26666;
        }
        :root.light {
          /* Elegant Light Mode - Warm Sand & Deep Espresso */
          --bg: #FDFBF7; --bg-deeper: #F5F2EA; --card: #FFFFFF;
          --border-soft: #EDE8DF; --border: #E2DBCE; --border-mid: #D4CAB7;
          --muted-deep: #B8AC9A; --muted: #948875; --gold-disabled: #D4BD86;
          --muted-alt: #A39682; --blue-dark: #487A99; --text-dim: #756A58;
          --text-dim2: #857A66; --text-secondary: #5E5445; --text-warm: #4A4135;
          --text: #2D2821; /* Deep Espresso */
          --gold: #BA9045; --gold-dark: #947132; /* Deep Muted Gold */
          --blue: #599BC2; --purple: #8367AC; --green: #3F946D;
          --green-dark: #2A6E4F; --purple-dark: #5C4582; --red: #D64D4D;
        }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box;
            transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                        color 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                        border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); }
        ::-webkit-scrollbar { display: none; }
        input { -webkit-appearance: none; }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ fontSize: 18, color: "var(--gold)", opacity: 0.66, fontFamily: "serif", marginBottom: 14, letterSpacing: 3 }}>
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
        {["login", "register"].map(t => (
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

      <div style={{ marginTop: 40, fontSize: 9, color: "var(--muted)", letterSpacing: "0.15em", fontFamily: "'DM Sans', sans-serif" }}>
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
        // Menggunakan API Quran.com (Quran Madinah/Uthmani)
        const [arRes, idRes] = await Promise.all([
          fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surah.id}`),
          fetch(`https://api.quran.com/api/v4/quran/translations/33?chapter_number=${surah.id}`),
        ]);
        const arData = await arRes.json();
        const idData = await idRes.json();

        if (arData.verses) {
          setAyahs(arData.verses.map((v, i) => ({
            number: v.id,
            numberInSurah: i + 1,
            text: String(v.text_uthmani).trim()
          })));
        }
        if (idData.translations) {
          setTerjemahan(idData.translations.map(t => ({ text: String(t.text).trim() })));
        }
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
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
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

        // Remove Bismillah from the first verse (except Al-Fatihah & At-Tawbah) because we already display it as a header
        let ayahText = ayah.text;
        if (ayah.numberInSurah === 1 && surah.id !== 1 && surah.id !== 9) {
          ayahText = ayahText.replace(/^بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ\s?/, "")
            .replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s?/, "")
            .replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\s?/, "");
        }

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
              {ayahText} <span style={{ color: "var(--gold)88", fontSize: 18 }}>﴿{ayah.numberInSurah}﴾</span>
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

// ===== DOA & DZIKIR SCREEN =====
const DoaScreen = () => {
  const [tab, setTab] = useState("hafalan"); // hafalan | pagi | petang | sholat

  const activeData = dzikirData[tab] || [];

  return (
    <div style={{ padding: "0 20px 140px" }}>
      <div style={{ padding: "56px 0 24px" }}>
        <h2 style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: "var(--text)", margin: 0 }}>
          <span style={{ color: "var(--gold)" }}>Doa</span> & Dzikir
        </h2>

        {/* Sub-Header Tabs */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, overflowX: "auto", paddingBottom: 8, msOverflowStyle: "none", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {[
            { id: "hafalan", label: "Hafalan" },
            { id: "sholat", label: "Setelah Sholat" },
            { id: "pagi", label: "Dzikir Pagi" },
            { id: "petang", label: "Dzikir Petang" }
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: tab === t.id ? "var(--gold)" : "var(--card)",
              color: tab === t.id ? "var(--bg)" : "var(--text-secondary)",
              border: `1px solid ${tab === t.id ? "var(--gold)" : "var(--border)"}`,
              padding: "8px 16px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer", whiteSpace: "nowrap"
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {activeData.map((item, idx) => (
          <div key={item.id + idx} style={{
            background: "var(--card)", borderRadius: 16, padding: "20px 24px",
            border: "1px solid var(--border)", position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "var(--gold)", fontWeight: 700, letterSpacing: "0.1em" }}>
                {item.sumber || "Dzikir"}
              </div>
              {item.count && (
                <div style={{ fontSize: 9, background: "var(--gold)22", color: "var(--gold)", padding: "4px 8px", borderRadius: 6, fontWeight: 700 }}>
                  {item.count}x
                </div>
              )}
            </div>

            <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>
              {item.title}
            </div>

            <div style={{
              fontSize: 24, color: "var(--gold)", fontFamily: "'Scheherazade New', 'Traditional Arabic', serif",
              textAlign: "right", direction: "rtl", lineHeight: 2.0, marginBottom: 16
            }}>
              {item.arabic}
            </div>

            <div style={{ fontSize: 11, color: "var(--blue)", fontFamily: "'DM Sans', sans-serif", fontStyle: "italic", marginBottom: 8, lineHeight: 1.6 }}>
              {item.latin}
            </div>

            <div style={{ fontSize: 12, color: "var(--muted-alt)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
              "{item.terjemahan}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// ===== COMPONENTS =====

const Toast = ({ toast, undoMarkStatus }) => {
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
        <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
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

const NavBar = ({ screen, setScreen, setSelectedSurahDetail, selectedSurahDetail }) => (
  <nav style={{
    position: "fixed", bottom: 0, left: 0, right: 0,
    background: "linear-gradient(180deg, transparent 0%, var(--bg) 15%)",
    display: "flex", flexDirection: "column",
    zIndex: 100, backdropFilter: "blur(12px)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-around", padding: "10px 0 6px" }}>
      {[
        { id: "dashboard", icon: "⌂", label: "Beranda" },
        { id: "hafalan", icon: "◈", label: "Hafalan" },
        { id: "muraja", icon: "⟳", label: "Muraja'ah" },
        { id: "jadwal", icon: "◷", label: "Jadwal" },
        { id: "doa", icon: "🤲", label: "Dzikir" },
        { id: "sholat", icon: "🕌", label: "Sholat" },
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
    <div style={{
      textAlign: "center",
      padding: "6px 0 calc(10px + env(safe-area-inset-bottom, 8px))",
      borderTop: "1px solid var(--border-soft)",
    }}>
      <span style={{
        fontSize: 9, color: "var(--muted-deep)", fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.12em", fontWeight: 600,
      }}>B.O.A. INDONESIA © 2026</span>
    </div>
  </nav>
);

const Dashboard = ({
  user, syncing, setTheme, theme, handleLogout, setScreen, setSelectedSurahDetail,
  stats, todayDone, dueToday, setSelectedSurah, formatTime, timerActive, setTimerActive, setTimer
}) => (
  <div style={{ padding: "0 20px 140px" }}>
    {/* Header */}
    <div style={{ padding: "56px 0 32px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>
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
            <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>Muraja'ah terjadwal</div>
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
          <div key={m.id} onClick={() => { setScreen("metode"); }}
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

const HafalanScreen = ({
  activeTab, setActiveTab, searchQuery, setSearchQuery, activeJuz, setActiveJuz,
  hafalanData, stats, markStatus, resetStatus, setSelectedSurahDetail
}) => {
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
          <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>Tidak ada surah yang cocok</div>
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
              <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>
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

const MetodeScreen = ({
  activeMethodSession, setActiveMethodSession, sessionChecked, setSessionChecked, setScreen, setSelectedSurahDetail
}) => {
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
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
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
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
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
                onClick={() => { if (allChecked) setActiveMethodSession(prev => ({ ...prev, phaseIdx: prev.phaseIdx + 1 })); }}
                style={{
                  flex: 2, padding: "13px 0",
                  background: allChecked ? `linear-gradient(135deg, ${m.color}, ${m.color}CC)` : "var(--border)",
                  border: "none", borderRadius: 14,
                  color: allChecked ? "var(--bg)" : "var(--muted)",
                  fontSize: 12, cursor: allChecked ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.06em",
                }}>
                {allChecked ? "Fase Berikutnya →" : `Centang semua (${phase.steps.filter((_, si) => sessionChecked[checkedKey(phaseIdx, si)]).length}/${phase.steps.length})`}
              </button>
            ) : (
              <button
                onClick={() => { if (allChecked) { setActiveMethodSession(null); setSessionChecked({}); setScreen("hafalan"); setSelectedSurahDetail(null); } }}
                style={{
                  flex: 2, padding: "13px 0",
                  background: allChecked ? "linear-gradient(135deg, var(--green), var(--green-dark))" : "var(--border)",
                  border: "none", borderRadius: 14,
                  color: allChecked ? "var(--bg)" : "var(--muted)",
                  fontSize: 12, cursor: allChecked ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 700, letterSpacing: "0.06em",
                }}>
                {allChecked ? "✦ Sesi Selesai! Mulai Hafal →" : `Centang semua dulu (${phase.steps.filter((_, si) => sessionChecked[checkedKey(phaseIdx, si)]).length}/${phase.steps.length})`}
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
          <div onClick={() => setScreen("metode")}
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
              <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 3, letterSpacing: "0.04em" }}>
                ⏱ {m.duration} • {m.bestFor}
              </div>
            </div>
            <span style={{ color: "var(--muted)", fontSize: 16, flexShrink: 0 }}>▼</span>
          </div>
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
              <span style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}> — {r.refs}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PanduanScreen = ({ setScreen }) => {
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
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
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
            <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 4, lineHeight: 1.4 }}>
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
          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
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
        <div style={{ fontSize: 9, color: "var(--border)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.15em" }}>
          HAFALAN AL-QUR'AN v1.2 • B.O.A. INDONESIA © 2026
        </div>
        <div style={{ fontSize: 9, color: "var(--border)", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
          Berdasarkan 40 Referensi Ilmiah • recitationacademy.com
        </div>
      </div>
    </div>
  );
};

const JadwalScreen = ({
  reminders, setReminders, user, currentTime, prayerTimes, prayerLocation, setScreen
}) => {
  const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const sessions = [
    { timeKey: "Subuh", label: "Subuh", desc: "Hafalan baru — otak paling segar (Neuroplasticity peak)", icon: "☽", color: "var(--gold)", reminderKey: "subuh" },
    { timeKey: null, label: "Pagi", desc: "Review cepat — working memory consolidation", icon: "◎", color: "var(--blue)", reminderKey: "pagi", staticTime: "08:00" },
    { timeKey: "Ashar", label: "Ashar", desc: "Muraja'ah — retrieval practice (Karpicke, 2008)", icon: "⟳", color: "var(--purple)", reminderKey: "ashar" },
    { timeKey: "Isya", label: "Isya", desc: "Pra-tidur — memory consolidation selama tidur", icon: "✦", color: "var(--green)", reminderKey: "isya" },
  ];

  const handleToggleReminder = async (key) => {
    const newVal = !reminders[key];
    setReminders(r => ({ ...r, [key]: newVal }));
    if (user) {
      try { await upsertReminder(user.id, key, newVal); }
      catch (e) { console.error(e); }
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
          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
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
              <div style={{ fontSize: 14, color: isToday ? "var(--bg)" : "var(--border-mid)" }}>◆</div>
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

const SholatScreen = ({
  currentTime, prayerTimes, prayerLocation, prayerLoading, prayerError, fetchPrayerTimes
}) => {
  const toMins = (str) => {
    if (!str) return -1;
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
  };
  const nowMins = currentTime.getHours() * 60 + currentTime.getMinutes();
  const mainKeys = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];
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
    Subuh: { icon: "☽", color: "var(--gold)", desc: "Fajar — waktu terbaik hafalan baru" },
    Terbit: { icon: "◇", color: "var(--text-dim)", desc: "Matahari terbit — waktu larangan sholat" },
    Dzuhur: { icon: "◉", color: "var(--blue)", desc: "Tengah hari — review cepat setelah sholat" },
    Ashar: { icon: "⟳", color: "var(--purple)", desc: "Sore — muraja'ah & retrieval practice" },
    Maghrib: { icon: "◐", color: "var(--red)", desc: "Magrib — istirahat sejenak, banyak dzikir" },
    Isya: { icon: "✦", color: "var(--green)", desc: "Malam — pra-tidur, konsolidasi memori" },
  };

  // Auto-request GPS saat pertama kali layar Sholat dibuka
  useEffect(() => {
    if (!prayerTimes && !prayerLoading && !prayerError) {
      fetchPrayerTimes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDenied = prayerError && prayerError.includes("ditolak");

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
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 6 }}>
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
            {prayerLoading ? "⟳" : "📍"}<br />{prayerLoading ? "Memuat..." : "Perbarui Lokasi"}
          </button>
        </div>

        {/* Error dengan panduan aktifkan GPS Android */}
        {prayerError && (
          <div style={{
            background: "var(--red)15", border: "1px solid var(--red)33", borderRadius: 12,
            padding: "12px 14px", fontSize: 11, color: "var(--red)",
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 12,
          }}>
            <div style={{ fontWeight: 700, marginBottom: isDenied ? 10 : 0 }}>⚠️ {prayerError}</div>
            {isDenied && (
              <div style={{
                background: "var(--card)", borderRadius: 10, padding: "10px 12px",
                border: "1px solid var(--border)",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: "var(--gold)", fontSize: 10, letterSpacing: "0.08em" }}>
                  🤖 CARA AKTIFKAN IZIN LOKASI DI ANDROID:
                </div>
                {[
                  "Buka Pengaturan HP → Aplikasi → Browser Anda (Chrome/Firefox/dll)",
                  "Pilih Izin → Lokasi (Location)",
                  "Pilih \"Izinkan saat menggunakan aplikasi\"",
                  "Kembali ke aplikasi ini dan tap Perbarui Lokasi",
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, background: "var(--gold)22",
                      border: "1px solid var(--gold)44", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, color: "var(--gold)", fontWeight: 700,
                    }}>{i + 1}</div>
                    <div style={{ fontSize: 10, color: "var(--text-secondary)", lineHeight: 1.5 }}>{step}</div>
                  </div>
                ))}
                <button onClick={fetchPrayerTimes} style={{
                  width: "100%", marginTop: 6, padding: "9px 0",
                  background: "linear-gradient(135deg, var(--green), var(--green-dark))",
                  border: "none", borderRadius: 9, color: "var(--bg)",
                  fontSize: 11, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em",
                }}>📍 Coba Lagi Deteksi Lokasi</button>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {prayerLoading && (
          <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
            <div style={{ fontSize: 24, color: "var(--green)33", marginBottom: 8 }}>📡</div>
            <div style={{ fontSize: 11, color: "var(--green)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em" }}>
              Mendeteksi lokasi GPS...
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 6, lineHeight: 1.6 }}>
              Jika muncul popup izin lokasi,<br />
              pilih <strong style={{ color: "var(--text)" }}>"Izinkan"</strong> untuk mendeteksi waktu sholat Anda
            </div>
          </div>
        )}

        {/* Next prayer highlight */}
        {prayerTimes && nextPrayer && (
          <div style={{
            background: "var(--green)15", border: "1px solid var(--green)44",
            borderRadius: 14, padding: "14px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em" }}>SHOLAT BERIKUTNYA</div>
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
              <div style={{ fontSize: 9, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 4, maxWidth: 120, lineHeight: 1.4 }}>
                {prayerMeta[nextPrayer]?.desc}
              </div>
            </div>
          </div>
        )}

        {/* Empty state — hanya tampil jika tidak loading dan tidak ada error */}
        {!prayerTimes && !prayerLoading && !prayerError && (
          <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
            <div style={{ fontSize: 36, color: "var(--green)33", marginBottom: 12 }}>🕌</div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
              Menunggu izin GPS...<br />
              <span style={{ fontSize: 10 }}>Jika tidak otomatis, tap <strong style={{ color: "var(--green)" }}>Perbarui Lokasi</strong></span>
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
          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
            Menggunakan metode <strong style={{ color: "var(--text)" }}>Kementerian Agama Republik Indonesia</strong> (method=20) via aladhan.com. Waktu disesuaikan otomatis dengan koordinat GPS smartphone Anda.
          </div>
        </div>
      )}
    </div>
  );
};

const MurajaScreen = ({
  hafalanData, timer, setTimer, timerActive, setTimerActive, formatTime, markMuraja, setSelectedSurah, setSelectedSurahDetail, setScreen
}) => {
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
          <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>
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
                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
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
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const prayRes = await fetch(
        `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=20&school=1`
      );
      // method=20 = Kemenag Indonesia, school=1 = Hanafi (Ashar)
      const prayData = await prayRes.json();
      if (prayData.code === 200) {
        const t = prayData.data.timings;
        setPrayerTimes({
          Subuh: t.Fajr,
          Terbit: t.Sunrise,
          Dzuhur: t.Dhuhr,
          Ashar: t.Asr,
          Maghrib: t.Maghrib,
          Isya: t.Isha,
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
    try { await signOut(); } catch (e) { }
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
          /* Premium Dark Mode - Midnight Indigo & Muted Gold */
          --bg: #090B10; --bg-deeper: #05060A; --card: #12151D;
          --border-soft: #1C212D; --border: #252B3A; --border-mid: #323A4D;
          --muted-deep: #404B62; --muted: #6B7B96; --gold-disabled: #5E503B;
          --muted-alt: #8294B2; --blue-dark: #4A81A5; --text-dim: #98A9C6;
          --text-dim2: #B0BED8; --text-secondary: #C8D4E8; --text-warm: #E6DCCH;
          --text: #F2EFE9; /* Very Soft Ivory Off-White */
          --gold: #CBA568; --gold-dark: #A3824A; /* Muted Prestige Gold */
          --blue: #7DB2D4; --purple: #9F8ECC; --green: #68B091;
          --green-dark: #458A6D; --purple-dark: #7460A3; --red: #E26666;
        }
        :root.light {
          /* Elegant Light Mode - Warm Sand & Deep Espresso */
          --bg: #FDFBF7; --bg-deeper: #F5F2EA; --card: #FFFFFF;
          --border-soft: #EDE8DF; --border: #E2DBCE; --border-mid: #D4CAB7;
          --muted-deep: #B8AC9A; --muted: #948875; --gold-disabled: #D4BD86;
          --muted-alt: #A39682; --blue-dark: #487A99; --text-dim: #756A58;
          --text-dim2: #857A66; --text-secondary: #5E5445; --text-warm: #4A4135;
          --text: #2D2821; /* Deep Espresso */
          --gold: #BA9045; --gold-dark: #947132; /* Deep Muted Gold */
          --blue: #599BC2; --purple: #8367AC; --green: #3F946D;
          --green-dark: #2A6E4F; --purple-dark: #5C4582; --red: #D64D4D;
        }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box;
            transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                        color 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                        border-color 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        html, body { margin: 0; padding: 0; background: var(--bg); color: var(--text); }
        ::-webkit-scrollbar { display: none; }
        input { -webkit-appearance: none; }
      `}</style>
      <NavBar
        screen={screen}
        setScreen={setScreen}
        setSelectedSurahDetail={setSelectedSurahDetail}
        selectedSurahDetail={selectedSurahDetail}
      />

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 80% 50% at 50% 0%, var(--gold)08 0%, transparent 70%)"
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {screen === "dashboard" && (
          <Dashboard
            user={user}
            syncing={syncing}
            theme={theme}
            setTheme={setTheme}
            handleLogout={handleLogout}
            stats={stats}
            todayDone={todayDone}
            dueToday={dueToday}
            setScreen={setScreen}
            setSelectedSurah={setSelectedSurah}
            setSelectedSurahDetail={setSelectedSurahDetail}
            formatTime={formatTime}
            timerActive={timerActive}
            setTimerActive={setTimerActive}
            setTimer={setTimer}
          />
        )}
        {screen === "hafalan" && !selectedSurahDetail && (
          <HafalanScreen
            activeJuz={activeJuz}
            setActiveJuz={setActiveJuz}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            hafalanData={hafalanData}
            stats={stats}
            markStatus={markStatus}
            resetStatus={resetStatus}
            setSelectedSurahDetail={setSelectedSurahDetail}
          />
        )}
        {screen === "hafalan" && selectedSurahDetail && (
          <SurahDetailScreen
            surah={selectedSurahDetail}
            hafalanData={hafalanData}
            markStatus={markStatus}
            resetStatus={resetStatus}
            onBack={() => setSelectedSurahDetail(null)}
          />
        )}
        {screen === "muraja" && (
          <MurajaScreen
            hafalanData={hafalanData}
            timer={timer}
            setTimer={setTimer}
            timerActive={timerActive}
            setTimerActive={setTimerActive}
            formatTime={formatTime}
            markMuraja={markMuraja}
            setSelectedSurah={setSelectedSurah}
            setSelectedSurahDetail={setSelectedSurahDetail}
            setScreen={setScreen}
          />
        )}
        {screen === "jadwal" && (
          <JadwalScreen
            reminders={reminders}
            setReminders={setReminders}
            user={user}
            currentTime={currentTime}
            prayerTimes={prayerTimes}
            prayerLocation={prayerLocation}
            setScreen={setScreen}
          />
        )}
        {screen === "doa" && <DoaScreen />}
        {screen === "metode" && (
          <MetodeScreen
            activeMethodSession={activeMethodSession}
            setActiveMethodSession={setActiveMethodSession}
            sessionChecked={sessionChecked}
            setSessionChecked={setSessionChecked}
            setScreen={setScreen}
            setSelectedSurahDetail={setSelectedSurahDetail}
          />
        )}
        {screen === "sholat" && (
          <SholatScreen
            currentTime={currentTime}
            prayerTimes={prayerTimes}
            prayerLocation={prayerLocation}
            prayerLoading={prayerLoading}
            prayerError={prayerError}
            fetchPrayerTimes={fetchPrayerTimes}
          />
        )}
        {screen === "panduan" && <PanduanScreen setScreen={setScreen} />}
      </div>

      <Toast toast={toast} undoMarkStatus={undoMarkStatus} />
    </div>
  );
}

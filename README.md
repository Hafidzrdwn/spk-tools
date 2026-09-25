# 🧠 DecisiGraph

> **Alat bantu Sistem Pendukung Keputusan (SPK) berbasis web — kalkulasi transparan, hasil bisa ditelusuri, dan mudah dipahami siapa pun.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-blueviolet?style=flat-square)](./package.json)

---

<!-- TODO: ganti dengan screenshot asli aplikasi -->
<!-- ![DecisiGraph Screenshot](docs/assets/screenshot.png) -->

---

## 📌 Tentang Proyek

**DecisiGraph** adalah aplikasi web untuk membantu proses pengambilan keputusan multi-kriteria (MCDM) secara transparan dan terstruktur. Alih-alih menghitung manual di spreadsheet yang rawan kesalahan, DecisiGraph mengotomatiskan seluruh alur kalkulasi — dari input matriks keputusan hingga peringkat akhir — lengkap dengan **jejak kalkulasi per sel** yang bisa ditelusuri kapan saja.

Proyek ini lahir untuk menjawab kebutuhan nyata mahasiswa, peneliti, dan praktisi yang sering mengerjakan tugas atau penelitian SPK: *"Saya tahu hasilnya, tapi saya tidak yakin kalkulasinya benar."* DecisiGraph membuat proses itu menjadi *verifiable* dan *explainable*.

---

## ✨ Fitur Utama

### 🔢 Lima Metode MCDM

| Metode | Deskripsi Singkat |
|---|---|
| **SAW** *(Simple Additive Weighting)* | Penjumlahan bobot terstandarisasi, metode paling fundamental |
| **WP** *(Weighted Product)* | Perkalian pangkat berbobot, lebih ketat terhadap nilai rendah |
| **TOPSIS** | Jarak ke solusi ideal positif/negatif (Euclidean distance) |
| **AHP** *(Analytic Hierarchy Process)* | Perbandingan berpasangan Saaty dengan uji konsistensi (CR) |
| **Story-to-Matrix** *(AI-assisted)* | Konversi narasi teks bebas menjadi matriks keputusan terstruktur |

### 🛠️ Fitur Pembeda

- **🔍 Traceability Inspector** — Klik sel mana pun di tabel hasil untuk melihat formula lengkap dan nilai sumber yang dipakai dalam kalkulasi tersebut.
- **📊 Multi-Method Comparison** — Bandingkan hasil ranking SAW, WP, dan TOPSIS secara side-by-side; deteksi otomatis pergeseran peringkat (*rank shift*) dan analisis divergensi antar metode.
- **📄 Export PDF** — Hasilkan laporan profesional siap cetak: ringkasan proyek, matriks keputusan, tahapan kalkulasi, ranking akhir, dan kesimpulan naratif otomatis.
- **🧭 Interactive Tour** — Panduan langkah-demi-langkah interaktif per metode, langsung di dalam aplikasi — cocok untuk pemula yang baru belajar SPK.
- **📖 Glosarium Istilah** — Hover pada istilah teknis (Benefit, Cost, CR, λmax, dll.) untuk membaca penjelasan kontekstual tanpa meninggalkan halaman.
- **📐 Shared Decision Matrix** — Satu input matriks dipakai lintas semua metode — ubah satu nilai, semua tab langsung terupdate secara reaktif.
- **📋 Template Studi Kasus** — Muat contoh kasus nyata (pemilihan laptop, rekrutmen karyawan, dll.) untuk eksplorasi instan tanpa input manual.

---

## 🗺️ Roadmap

DecisiGraph dikembangkan secara bertahap dengan visi jangka panjang menjadi platform SPK yang komprehensif.

### ✅ v1.0 — *Foundation* · **Sekarang**

MVP penuh: 5 metode MCDM, Traceability Inspector, Multi-Method Comparison, Export PDF, Interactive Tour, Glosarium, dan Story-to-Matrix.

---

### 🔧 v1.1 — *Refinement*

> Fokus: stabilitas dan kenyamanan berdasarkan umpan balik pengguna nyata.

- Perbaikan bug yang ditemukan pasca-rilis
- Peningkatan UX berdasarkan testimoni pengguna — teks lebih jelas, alur lebih intuitif, responsivitas mobile lebih baik

---

### 🌐 v2.0 — *Platform*

> Fokus: dari alat lokal menjadi platform berbasis akun dengan penyimpanan data persisten.

- Landing page dengan autentikasi **Google Sign-In** (OAuth — tidak ada password)
- Proyek tersimpan di cloud — tidak hilang saat tab ditutup atau perangkat berganti
- Manajemen proyek lengkap: buat baru, muat ulang, hapus, dan lihat riwayat semua proyek yang pernah dikerjakan
- Riwayat ekspor PDF tersimpan dan bisa diunduh ulang kapan saja
- Pengalaman seperti **Google Docs** untuk data keputusan — buka proyek lama dari perangkat mana pun

---

### 🚀 v3.0 — *Evolution*

> Fokus: pengalaman premium dan ekosistem yang lebih kaya.

- Perbaikan bug dan peningkatan performa keseluruhan
- **Mode Gelap** *(Dark Mode)* penuh
- Peningkatan UI/UX secara menyeluruh berdasarkan feedback akumulatif v1.x dan v2.x
- Sistem **langganan** *(subscription)* dengan fitur premium eksklusif — detail akan diumumkan mendekati rilis

---

## 🧰 Tech Stack

| Kategori | Teknologi |
|---|---|
| **Framework UI** | React 18 + TypeScript 5.5 |
| **Build Tool** | Vite 5 |
| **Styling** | TailwindCSS v4 (CSS-first config, `@theme`) |
| **State Management** | Zustand + Immer |
| **Animasi** | Framer Motion |
| **Kalkulasi Presisi** | Decimal.js |
| **Chart & Visualisasi** | Recharts |
| **PDF Generation** | @react-pdf/renderer |
| **Form & Validasi** | React Hook Form + Zod |
| **Icon** | Lucide React |
| **Testing** | Vitest + @testing-library/react + jsdom |

---

## 📁 Struktur Folder

```
decisigraph/
├── src/
│   ├── App.tsx                  # Root aplikasi & layout utama
│   ├── app/                     # Konfigurasi routing & route definitions
│   ├── components/              # Komponen UI reusable
│   │   ├── layout/              # AppShell, Header, TemplateSelectorModal
│   │   └── ui/                  # Atom: Badge, Button, Card, GaugeMeter, dll.
│   ├── core/                    # Logika bisnis murni (framework-agnostic)
│   │   ├── math/                # Engine kalkulasi: SAW, WP, TOPSIS, AHP, Compare
│   │   ├── tour/                # Definisi langkah interactive tour per metode
│   │   ├── parser/              # Story-to-Matrix NLP parser
│   │   └── constants/           # Konstanta global (tabel RI Saaty, dll.)
│   ├── features/                # Fitur per domain
│   │   ├── saw/                 # Tab & komponen SAW
│   │   ├── wp/                  # Tab & komponen WP
│   │   ├── topsis/              # Tab & komponen TOPSIS
│   │   ├── ahp/                 # Tab & komponen AHP
│   │   ├── comparison/          # Tab Multi-Method Comparison
│   │   ├── export/              # Export PDF (DecisiPdfReport)
│   │   ├── glossary/            # GlossaryTerm + definisi istilah
│   │   ├── inspector/           # Traceability Inspector
│   │   ├── story-to-matrix/     # Tab Story-to-Matrix (AI-assisted)
│   │   ├── tour/                # TourRunner, TourLauncherMenu, WelcomeModal
│   │   └── shared/              # MatrixInputGrid, CriteriaEditor, AlternativeEditor
│   ├── store/                   # Zustand stores (project, ui, tour)
│   ├── styles/                  # globals.css + design tokens (`@theme`)
│   ├── test/                    # Unit test (Vitest)
│   ├── types/                   # TypeScript domain types
│   ├── utils/                   # Helper functions: cn(), format, dll.
│   └── validators/              # Zod schema validators
├── docs/                        # Dokumentasi teknis & spesifikasi
├── public/                      # Aset statis
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started

### Prasyarat

- **Node.js** v18 atau lebih baru
- **npm** v9 atau lebih baru

### Instalasi & Menjalankan

```bash
# 1. Clone repositori
git clone https://github.com/hafidzrdwn/decisigraph.git
cd decisigraph

# 2. Install dependensi
npm install

# 3. Jalankan server pengembangan
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173` secara default.

### Perintah Lainnya

```bash
# Jalankan semua unit test
npm run test

# Build untuk produksi
npm run build

# Preview hasil build produksi secara lokal
npm run preview
```

---

## 📖 Cara Pakai Singkat

Setelah aplikasi terbuka, mulailah dengan mengisi **Matriks Keputusan Bersama** di panel atas — tambahkan kriteria beserta bobot dan tipe (Benefit/Cost), alternatif kandidat, lalu isi nilainya. Pilih metode dari tab navigasi (SAW, WP, TOPSIS, atau AHP) dan hasil kalkulasi lengkap muncul secara instan. Untuk panduan interaktif langkah-demi-langkah, klik tombol **"Bantuan"** di pojok kanan atas dan pilih tour yang sesuai — tour akan memandu Anda melewati setiap fitur secara terstruktur tanpa perlu membaca dokumentasi eksternal.

---

## 🧪 Testing

DecisiGraph menggunakan **Vitest** sebagai test runner dengan **jsdom** sebagai environment DOM.

```bash
# Jalankan semua test sekali
npm run test

# Mode watch — rerun otomatis saat ada perubahan file
npx vitest
```

File test berada di `src/test/`. Cakupan pengujian meliputi:

- **Engine kalkulasi** — validasi output matematis SAW, WP, TOPSIS, AHP terhadap nilai referensi manual
- **Normalisasi bobot** — edge case bobot nol, bobot desimal, distribusi tidak rata
- **Uji Konsistensi AHP** — validasi nilai CR dengan matriks konsisten dan inkonsisten (Saaty)

---

## 🤝 Kontribusi

DecisiGraph saat ini merupakan proyek pribadi yang dikembangkan sebagai bagian dari portofolio dan riset akademis. Belum menerima kontribusi eksternal secara aktif pada versi ini.

Namun jika kamu menemukan **bug**, punya **ide fitur**, atau sekadar ingin berdiskusi soal MCDM — silakan buka [Issue](https://github.com/hafidzrdwn/decisigraph/issues) di GitHub. Semua masukan sangat dihargai dan akan dipertimbangkan untuk roadmap berikutnya.

---

## 📄 Lisensi

Didistribusikan di bawah **MIT License**. Lihat file [`LICENSE`](./LICENSE) untuk detail lengkap.

---

## 👤 Author & Credit

Dibuat dengan ☕ dan antusiasme tinggi oleh:

**Hafidz Ridwan**
- GitHub: [@hafidzrdwn](https://github.com/hafidzrdwn)

---

<div align="center">
  <sub>DecisiGraph v1.0 — Kalkulasi transparan, keputusan lebih percaya diri.</sub>
</div>

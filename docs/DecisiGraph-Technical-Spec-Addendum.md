# DecisiGraph — Technical Spec Addendum (Bagian 11–18)
### Pelengkap `DecisiGraph-Technical-Spec.md`, mencakup fitur lanjutan: bantuan pengguna, persistence, export, branding & konsistensi desain

> Penomoran bagian melanjutkan dokumen utama (yang berakhir di Bagian 10). Semua aturan arsitektur dari dokumen utama tetap berlaku: pure logic di `core/`, satu komponen satu file, viewmodel sebagai jembatan store↔UI, dsb.

---

## 11. Modul Bantuan Pengguna (Help & Onboarding System)

Sistem ini punya 3 lapis, dari yang paling pasif ke paling aktif:
1. **Glosarium** — pasif, dibuka kapan saja saat butuh definisi istilah.
2. **Panduan umum (teks)** — semi-aktif, muncul di awal + bisa dibuka ulang, isinya bacaan singkat.
3. **Tour interaktif** — aktif, menuntun user klik-klik langsung di UI nyata.

### 11.1 Glosarium

**Kontrak data** (`src/core/constants/glossaryTerms.ts`):
```ts
export interface GlossaryEntry {
  term: string;          // "SAW", "Bobot (W)", dst — ini yang dipakai sorting alfabet
  definition: string;    // penjelasan awam, 1-3 kalimat
  relatedTabs?: MethodId[]; // tab mana yang relevan, untuk filter kontekstual
  symbol?: string;       // simbol matematika terkait, misal "wⱼ", "Σ", "√"
}

export const GLOSSARY_TERMS: GlossaryEntry[] = [/* lihat isi lengkap di bawah */];
```

**Isi lengkap yang wajib ada** (agent tinggal transkrip ke file, sudah diurutkan A-Z — SORT ULANG otomatis di runtime by `.localeCompare()`, bukan hardcode urutan, supaya aman kalau ada tambahan term nanti):

| Istilah | Simbol | Definisi Awam |
|---|---|---|
| A+ (Solusi Ideal Positif) | A⁺ | Titik "skenario terbaik" dalam TOPSIS — nilai terbagus yang mungkin dicapai di tiap kriteria. |
| A− (Solusi Ideal Negatif) | A⁻ | Titik "skenario terburuk" dalam TOPSIS — nilai terjelek yang mungkin terjadi di tiap kriteria. |
| AHP (Analytic Hierarchy Process) | — | Metode yang menghitung bobot kriteria dari perbandingan berpasangan (mana yang lebih penting) yang dilakukan manusia, bukan dari data mentah. |
| Alternatif | Aᵢ | Pilihan/kandidat yang mau dibandingkan, misal 5 calon laboran (A1–A5) atau 3 vendor cloud. |
| Benefit | — | Sifat kriteria di mana **semakin tinggi nilainya, semakin baik** (contoh: nilai tes, IPK). |
| Bobot (Weight) | wⱼ | Angka yang menunjukkan seberapa penting suatu kriteria dibanding kriteria lain. Total seluruh bobot ternormalisasi harus = 1,0. |
| Consistency Index (CI) | CI | Angka yang mengukur seberapa "acak" atau tidak logis perbandingan berpasangan di AHP. |
| Consistency Ratio (CR) | CR | Hasil bagi CI dengan Random Index (RI). Jika CR ≤ 0,10, perbandingan dianggap cukup konsisten/logis untuk dipakai. |
| Cost | — | Sifat kriteria di mana **semakin rendah nilainya, semakin baik** (contoh: harga, gaji diminta). |
| Euclidean Distance | D | Cara mengukur "jarak" antara dua titik data secara geometris — dipakai TOPSIS untuk menghitung seberapa dekat suatu alternatif ke solusi ideal. |
| Kriteria | Cⱼ | Faktor/aspek yang dipakai untuk menilai alternatif, misal "Nilai Tes", "Pengalaman", "Gaji Diminta". |
| Lambda Max (λmax) | λmax | Nilai rata-rata konsistensi yang dihitung dari matriks perbandingan AHP, dipakai untuk mencari CI. |
| Matriks Keputusan | X | Tabel mentah berisi nilai semua alternatif di semua kriteria, sebelum diolah/dinormalisasi. |
| Matriks Ternormalisasi | R | Matriks keputusan yang sudah "disamakan skalanya" (misal nilai 0–100 dan nilai jutaan rupiah jadi bisa dibandingkan adil). |
| MCDM / MADM | — | Singkatan dari *Multi-Criteria/Attribute Decision Making* — istilah payung untuk semua metode di aplikasi ini (SAW, WP, TOPSIS, AHP). |
| Normalisasi | — | Proses mengubah angka mentah (skala berbeda-beda) jadi skala yang setara/adil untuk dibandingkan. |
| Pairwise Comparison (Perbandingan Berpasangan) | — | Teknik AHP di mana user membandingkan dua kriteria sekaligus ("A berapa kali lebih penting dari B?"), bukan menilai satu-satu. |
| Perangkingan | — | Hasil akhir berupa urutan alternatif dari yang terbaik ke terburuk. |
| Priority Vector (Vektor Prioritas) | w | Hasil akhir bobot kriteria dari proses AHP, didapat dari rata-rata baris matriks pairwise ternormalisasi. |
| Random Index (RI) | RI | Angka acuan tetap (dari tabel Saaty) yang dipakai membagi CI untuk mendapat CR, nilainya beda-beda tergantung jumlah kriteria. |
| Rᵢⱼ | rᵢⱼ | Notasi nilai satu sel di matriks yang sudah dinormalisasi (alternatif ke-i, kriteria ke-j). |
| SAW (Simple Additive Weighting) | — | Metode paling sederhana: normalisasi nilai, lalu jumlahkan hasil kali nilai×bobot tiap kriteria. |
| Skala Saaty | 1–9 | Skala angka 1 sampai 9 yang dipakai AHP untuk menyatakan "seberapa penting" satu kriteria dibanding lainnya (1 = sama penting, 9 = mutlak lebih penting). |
| SPK (Sistem Pendukung Keputusan) | — | Istilah umum untuk sistem/tools yang membantu manusia mengambil keputusan secara lebih terstruktur dan objektif. |
| TOPSIS | — | Metode yang memilih alternatif berdasarkan mana yang paling dekat ke "skenario terbaik" (A+) dan paling jauh dari "skenario terburuk" (A−). |
| Vektor S | S | Hasil perkalian pangkat (belum dinormalisasi) di metode WP, sebelum jadi Vektor V. |
| Vektor V | V / Vᵢ | Skor akhir tiap alternatif di SAW dan WP — makin besar makin baik, dipakai untuk ranking. |
| WP (Weighted Product) | — | Metode yang menilai alternatif lewat perkalian (bukan penjumlahan seperti SAW), dengan bobot jadi pangkat. |
| Xᵢⱼ | xᵢⱼ | Notasi nilai mentah satu sel di matriks keputusan awal (alternatif ke-i, kriteria ke-j), sebelum dinormalisasi. |
| Zero-Guard | — | Mekanisme pengaman di WP yang mendeteksi nilai 0 pada kriteria Cost, karena secara matematis akan menghasilkan pembagian tak terhingga (Infinity) jika dibiarkan. |

**UI** (`src/features/glossary/`):
- `GlossaryDrawer.tsx`: panel slide-in dari kanan (bukan modal penuh, supaya user tetap bisa lihat konteks halaman), berisi search bar + daftar term dikelompokkan per huruf awal (sticky header huruf, seperti kamus/kontak HP).
- `GlossaryTerm.tsx`: komponen wrapper kecil `<GlossaryTerm term="SAW">SAW</GlossaryTerm>` yang render teks dengan underline dotted + on-hover Tooltip menampilkan definisi singkat + link "lihat detail" yang membuka `GlossaryDrawer` langsung scroll ke term tersebut. **Pakai komponen ini** untuk membungkus istilah teknis di label-label UI (nama tab, label kolom W/Benefit/Cost, dsb) — bukan cuma di halaman glosarium.
- Akses global: ikon buku/tanda tanya di `Header.tsx` yang selalu terlihat di semua tab.

### 11.2 Panduan Umum (Welcome & Text Guide)

`src/features/tour/WelcomeModal.tsx`:
- Muncul otomatis saat pertama kali buka aplikasi (dicek dari `useTourStore.hasSeenWelcome`, localStorage).
- Isi teks singkat (bukan tour interaktif dulu): apa itu DecisiGraph, apa itu SPK secara 1 paragraf awam, daftar singkat 5 tab yang tersedia + fungsinya masing-masing 1 baris.
- Dua tombol: **"Mulai Tour"** (memicu Fase 9/10 di bawah) dan **"Lewati, langsung mulai"** (menutup modal, set `hasSeenWelcome = true`).
- Modal ini **bisa dibuka lagi kapan saja** lewat menu Help di header (lihat `TourLauncherMenu.tsx` di 11.3), bukan cuma sekali seumur hidup.

### 11.3 Interactive Tour Engine (Infrastruktur)

**Library yang direkomendasikan:** `react-joyride` — dipilih karena mendukung *controlled mode* (kita yang kontrol step index dari state sendiri, bukan library yang otomatis maju), yang krusial untuk kebutuhan "step wajib dicoba dulu baru lanjut".

**Kontrak data** (`src/core/tour/types.ts`):
```ts
export interface TourStep {
  id: string;
  targetSelector: string;      // css selector, gunakan atribut data-tour-id="..." di komponen target
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Jika diisi, tombol "Lanjut" disembunyikan/disabled sampai kondisi ini true. */
  requiredAction?: {
    description: string;                          // teks instruksi ke user, misal "Coba klik Auto-distribute weight"
    isSatisfied: (projectState: DecisiProjectState) => boolean;
  };
}

export interface TourDefinition {
  id: 'general' | 'saw' | 'wp' | 'topsis' | 'ahp' | 'story';
  title: string;
  steps: TourStep[];
}
```

**State** (`src/store/useTourStore.ts`, PERSISTED ke localStorage — lihat Bagian 12):
```ts
interface TourStore {
  completedTours: Record<string, boolean>;  // { general: true, saw: false, ... }
  hasSeenWelcome: boolean;
  activeTourId: string | null;
  activeStepIndex: number;

  setHasSeenWelcome: (v: boolean) => void;
  startTour: (tourId: string) => void;
  goToNextStep: () => void;
  skipTour: () => void;
  finishTour: (tourId: string) => void;
  resetAllTourProgress: () => void; // dipakai tombol "Lihat semua tour lagi" di menu Help
}
```

**Cara kerja "smart required step":**
1. `TourRunner.tsx` merender step aktif dari `TourDefinition` yang sedang jalan.
2. Kalau step punya `requiredAction`, subscribe ke `useProjectStore` (via `useProjectStore.subscribe(...)` atau selector reaktif) untuk cek `isSatisfied(state)` tiap kali state berubah.
3. Selama belum `isSatisfied`, tombol "Lanjut" di-disable dan tampilkan teks instruksi dari `requiredAction.description` dengan aksen warna berbeda (misal border indigo pulsing) supaya user sadar ini bukan step pasif.
4. Begitu `isSatisfied` jadi true, auto-advance ke step berikutnya (dengan sedikit delay 400-600ms supaya tidak terasa "meloncat").
5. Tombol **"Lewati Tour"** selalu tersedia di semua step (required atau tidak) — user tidak boleh terjebak/dipaksa.

**Deteksi status tour** (localStorage, lihat Bagian 12): setiap tour (general + 5 tour per-tab) statusnya disimpan TERPISAH per id, supaya user bisa ulang tour spesifik tanpa reset semua.

`TourLauncherMenu.tsx` (dropdown dari ikon Help di header, akses global kapan saja):
- "Buka Panduan Umum" → buka `WelcomeModal`
- "Tour Fitur Umum" → mulai tour `general`
- "Tour Mendalam: SAW" / "WP" / "TOPSIS" / "AHP" / "Story-to-Matrix" → mulai tour tab terkait (disabled/dim kalau user belum pernah membuka tab tersebut sama sekali, supaya tidak bingung)
- "Buka Glosarium" → buka `GlossaryDrawer`
- Badge kecil (titik/centang) di tiap item menunjukkan sudah selesai atau belum

### 11.4 Konten Tour — Rincian per Jenis

**Tour Umum (`generalTourSteps`)** — fokus ke navigasi & fitur, BUKAN rumus. Wajib mencakup minimal step untuk: (1) penjelasan 5 tab, (2) cara tambah/hapus kriteria, (3) toggle Benefit/Cost, (4) cara tambah/hapus alternatif, (5) tombol hitung, (6) ikon Help & Glosarium. Salah satu step **required**: minta user benar-benar klik "Tambah Kriteria" sekali sebelum lanjut.

**Tour per Tab (deep-dive)** — masing-masing fokus ke ALUR PROSES BISNIS metode tersebut, bukan cuma tombol:
- `sawTourSteps`: jelaskan konsep normalisasi (kenapa perlu), tunjukkan bedanya kolom Benefit vs Cost, **required step**: minta user hover ke satu sel hasil normalisasi untuk memicu Inspector (Bagian 5 dokumen utama), lanjut ke penjelasan Vektor V.
- `wpTourSteps`: jelaskan kenapa Cost jadi pangkat negatif, **required step**: sengaja isi 0 di sel cost untuk memicu Zero-Guard alert, lalu perbaiki lagi — supaya user paham proteksinya sejak awal, bukan kaget nanti.
- `topsisTourSteps`: jelaskan A+/A− dengan visual radar chart, **required step**: hover ke titik A+ atau A− di radar chart.
- `ahpTourSteps`: jelaskan skala Saaty, **required step**: minta user geser slider pairwise sampai gauge consistency berubah warna (baik ke hijau maupun merah, yang penting mencoba), lalu tunjukkan tombol "Saran Koreksi" kalau merah.
- `storyTourSteps`: **required step**: klik salah satu "Coba Contoh" template, lihat hasil ekstraksi, lalu tunjukkan `ModeSwitcher`.

Setiap tour deep-dive idealnya **5–8 step saja** (sesuai request: jangan kepanjangan) — cukup untuk memastikan user mencoba minimal 1 aksi kunci per tab, bukan menjelaskan ulang seluruh dokumen ini.

---

## 12. Persistence Layer (State Tidak Hilang saat Refresh)

**Prinsip:** semua state yang mahal untuk diulang (data yang diketik user) WAJIB persist. State yang murah/sementara (hover cell, dropdown terbuka) TIDAK perlu persist.

| State | Persist? | Mekanisme |
|---|---|---|
| `useProjectStore` (title, criteria, alternatives, activeMethod) | ✅ Ya | `zustand/middleware persist` → localStorage key `decisigraph-project-state` |
| `useTourStore` (completedTours, hasSeenWelcome) | ✅ Ya | `persist` → localStorage key `decisigraph-tour-state` |
| Tab aktif (`useUiStore.activeTab`) | ✅ Ya | Sinkron ke **URL query param** `?tab=saw` (lebih baik dari localStorage karena URL bisa di-share/bookmark) |
| `hoveredCellId`, dropdown/menu terbuka | ❌ Tidak | State React biasa, memang wajar reset saat refresh |

**Implementasi persist store:**
```ts
export const useProjectStore = create<ProjectStore>()(
  persist(
    immer((set, get) => ({ /* ...seperti Bagian 4 dokumen utama... */ })),
    {
      name: 'decisigraph-project-state',
      version: 1,
      partialize: (state) => ({
        title: state.title,
        activeMethod: state.activeMethod,
        criteria: state.criteria,
        alternatives: state.alternatives,
      }),
      // migrate: (persisted, version) => persisted, // siapkan slot ini untuk breaking change di masa depan
    }
  )
);
```

**Sinkronisasi tab ke URL** (`src/features/shared/useUrlTabSync.ts`):
- Saat app mount: baca `?tab=` dari URL, kalau valid set sebagai `activeTab` awal (override default). Kalau tidak ada/invalid, pakai default.
- Setiap `activeTab` berubah: `history.replaceState(null, '', `?tab=${activeTab}`)` — TANPA reload halaman, tanpa nge-push history baru tiap klik tab (pakai `replaceState`, bukan `pushState`, supaya tombol Back browser tidak jadi aneh diisi puluhan entry tab).

**Reset HARUS eksplisit membersihkan storage:**
```ts
resetProject: () => {
  useProjectStore.persist.clearStorage();
  set(INITIAL_PROJECT_STATE);
}
```
Tour progress (`useTourStore`) **TIDAK ikut ke-reset** saat user reset data proyek — ini dua concern yang berbeda (data kerja vs riwayat belajar pakai app).

---

## 13. Export Laporan ke PDF

**Library:** `@react-pdf/renderer` — dipilih ketimbang `html2canvas + jsPDF` karena menghasilkan PDF berbasis teks vector asli (tajam, bisa di-select/copy, ukuran file kecil), bukan screenshot raster yang gampang blur/pecah saat di-zoom.

**Kontrak data** (`src/features/export/types.ts`):
```ts
export interface ReportPayload {
  projectTitle: string;
  generatedAt: string;          // ISO string, format tanggal Indonesia saat render
  method: MethodId;
  criteria: Criterion[];
  alternatives: Alternative[];
  result: MethodResult;
  comparisonResult?: ReturnType<typeof compareRankings>; // opsional, kalau user export dari mode Multi-Method Comparison
}
```

**Struktur halaman PDF yang WAJIB ada** (`src/features/export/DecisiPdfReport.tsx`), supaya "rapi, terstruktur, explainable" bukan cuma dump tabel:
1. **Cover section**: judul proyek, nama metode yang dipakai, tanggal generate, badge kecil "Dibuat dengan DecisiGraph".
2. **Ringkasan Kriteria**: tabel kriteria + tipe (Benefit/Cost) + bobot ternormalisasi.
3. **Matriks Keputusan Awal**: tabel mentah alternatif × kriteria.
4. **Tahapan Perhitungan**: ringkasan `formulaSteps` — TIDAK perlu render semua sel (bisa puluhan), cukup 1 contoh sel per tahap sebagai ilustrasi rumus dipakai, dengan catatan "lihat aplikasi untuk detail interaktif seluruh sel".
5. **Hasil Akhir & Ranking**: tabel final, alternatif terbaik ditandai jelas (badge/warna emerald).
6. **Kesimpulan otomatis**: 1 paragraf naratif hasil generate dari data (misal "Berdasarkan metode SAW, [Nama Alternatif] terpilih sebagai yang terbaik dengan skor X, unggul terutama pada kriteria Y").
7. **Footer tiap halaman**: nomor halaman + copyright (lihat Bagian 14.2).

**Trigger export** (`ExportButton.tsx`): gunakan `@react-pdf/renderer`'s `pdf(<DecisiPdfReport .../>).toBlob()` lalu trigger download — tampilkan loading state (generate PDF bisa makan waktu 1-2 detik untuk data besar).

---

## 14. Branding, Copyright & Perbaikan UX

### 14.1 Logo & Favicon
`src/components/layout/Logo.tsx` — mark abstrak sederhana (misal 3 node terhubung membentuk pola keputusan/graph, dalam warna accent-primary/accent-secondary gradient) + wordmark "DecisiGraph" di sampingnya, dipakai di `Header.tsx`. Favicon (`public/favicon.svg`) pakai versi ikon-only dari logo yang sama (konsisten, bukan icon generik Vite/React bawaan).

### 14.2 Footer & Copyright
`src/components/layout/Footer.tsx`, tampil di semua halaman (atau minimal di area footer AppShell):
```
© {new Date().getFullYear()} DecisiGraph — Dibuat oleh Hafidz Ridwan
[link ke https://github.com/hafidzrdwn, ikon GitHub dari lucide-react, buka tab baru]
```
Teks copyright yang SAMA (versi ringkas 1 baris) juga wajib muncul di footer laporan PDF (Bagian 13, poin 7).

### 14.3 Perbaikan UX Tombol Reset
Masalah saat ini: tombol reset kurang jelas fungsinya/berisiko diklik tidak sengaja. Perbaikan:
- Label eksplisit **"Reset Proyek"** + ikon (misal `RotateCcw` dari lucide-react), bukan cuma ikon polos tanpa label.
- Klik tombol **tidak langsung menghapus** — wajib buka `ResetConfirmDialog.tsx` (pakai `components/ui/Dialog.tsx`, komponen baru — lihat Bagian 15) berisi:
  - Judul: "Reset proyek ini?"
  - Body: "Semua kriteria, alternatif, dan hasil perhitungan akan dihapus dan tidak bisa dikembalikan."
  - Tombol "Batal" (default focus) dan "Ya, Reset" (warna rose/destructive, butuh klik eksplisit).

### 14.4 Editable Project Title (gaya Google Docs)
`src/features/project/EditableProjectTitle.tsx`:
- Kondisi normal: judul proyek tampil sebagai teks besar + ikon pensil kecil yang **muncul saat hover** di sampingnya (bukan selalu terlihat, biar bersih).
- Klik teks ATAU ikon pensil → berubah jadi `<input>` dengan ukuran font & style identik dengan teks aslinya (supaya tidak ada "lompatan" visual), auto-focus + select-all isi lama.
- Simpan saat `onBlur` atau tekan Enter; batal & kembalikan nilai lama saat tekan Escape.
- Update ke `useProjectStore` (otomatis ikut ter-persist sesuai Bagian 12).

---

## 15. Update Design System (Tambahan dari Bagian 7 Dokumen Utama)

**Komponen baru yang WAJIB ditambahkan ke `components/ui/`:**
- `Dialog.tsx` — modal generik (dipakai Reset confirm, Welcome modal, bisa dipakai ulang untuk kebutuhan modal lain). Harus mendukung `onOpenChange`, fokus trap dasar, close via Escape/klik backdrop.
- `Drawer.tsx` — panel slide-in dari sisi kanan/kiri (dipakai `GlossaryDrawer`).
- `DropdownMenu.tsx` — dipakai `TourLauncherMenu`.
- `Tooltip.tsx` sudah ada di spec awal — pastikan dipakai ulang oleh `GlossaryTerm`, jangan bikin tooltip custom baru.

**Aturan konsistensi warna ikon (perbaikan bug yang dilaporkan user):**
> Ditemukan inkonsistensi: beberapa ikon di empty state pakai warna Tailwind default (misal kuning) alih-alih token desain yang sudah ditentukan.

Aturan tegas untuk agent saat audit/perbaikan (Fase QA):
- Ikon/teks/border yang bersifat **aksen umum** (branding, tombol primer, empty state netral) → HARUS pakai `text-accent-primary` / `text-accent-secondary` (indigo/violet), TIDAK BOLEH pakai warna default Tailwind (`text-yellow-500`, `text-blue-500`, dst) kecuali memang didefinisikan sebagai token baru di `tailwind.config.ts`.
- Ikon/badge yang bersifat **semantik Benefit/Cost atau A+/A−** → HARUS pakai `text-benefit` (emerald) / `text-cost` (rose), konsisten di SEMUA tab, bukan cuma di TOPSIS.
- Kalau agent menemukan warna "acak" (bukan dari 4 token ini + slate untuk netral), itu bug — ganti ke token yang paling sesuai konteks, bukan dibiarkan.

---

## 16. Update Struktur Folder (Tambahan)

```
src/
├── core/
│   ├── constants/
│   │   └── glossaryTerms.ts        # NEW
│   └── tour/                       # NEW
│       ├── types.ts
│       ├── generalTourSteps.ts
│       ├── sawTourSteps.ts
│       ├── wpTourSteps.ts
│       ├── topsisTourSteps.ts
│       ├── ahpTourSteps.ts
│       └── storyTourSteps.ts
│
├── store/
│   └── useTourStore.ts             # NEW (persisted)
│
├── components/
│   ├── ui/
│   │   ├── Dialog.tsx              # NEW
│   │   ├── Drawer.tsx              # NEW
│   │   └── DropdownMenu.tsx        # NEW
│   └── layout/
│       ├── Logo.tsx                # NEW
│       └── Footer.tsx              # NEW
│
├── features/
│   ├── tour/                       # NEW
│   │   ├── WelcomeModal.tsx
│   │   ├── TourRunner.tsx
│   │   └── TourLauncherMenu.tsx
│   ├── glossary/                   # NEW
│   │   ├── GlossaryDrawer.tsx
│   │   └── GlossaryTerm.tsx
│   ├── export/                     # NEW
│   │   ├── ExportButton.tsx
│   │   ├── DecisiPdfReport.tsx
│   │   ├── generateReport.ts
│   │   └── types.ts
│   ├── project/                    # NEW
│   │   ├── EditableProjectTitle.tsx
│   │   ├── ResetProjectButton.tsx
│   │   └── ResetConfirmDialog.tsx
│   └── shared/
│       └── useUrlTabSync.ts        # NEW
```

---

## 17. Update Dependencies

Tambahan dari daftar Bagian 9 dokumen utama:
```json
{
  "dependencies": {
    "react-joyride": "^2.8.0",
    "@react-pdf/renderer": "^3.4.0"
  }
}
```
`zustand/middleware` (persist) sudah termasuk dalam package `zustand` yang sudah ada — tidak perlu instalasi tambahan.

---

## 18. README.md — Spesifikasi Konten

README wajib mencakup, dengan urutan ini:
1. **Header**: nama proyek "DecisiGraph" + tagline singkat + badge (tech stack: React, TypeScript, Vite, Tailwind — pakai shields.io).
2. **Screenshot/GIF placeholder** (agent tulis komentar HTML `<!-- TODO: ganti dengan screenshot asli -->` kalau belum ada asetnya).
3. **Tentang Proyek**: 2-3 kalimat apa itu DecisiGraph & masalah SPK yang dijawab.
4. **Fitur Utama**: list 5 metode (SAW/WP/TOPSIS/AHP/Story-to-Matrix) + fitur pembeda (Traceability Inspector, Multi-Method Comparison, Export PDF, Interactive Tour, Glosarium).
5. **Tech Stack**: list singkat sesuai Bagian 0 & 9 dokumen utama + Bagian 17 addendum ini.
6. **Struktur Folder**: ringkasan tree (boleh dipersingkat, tidak perlu semua file, cukup level 2).
7. **Getting Started**: `git clone`, `npm install`, `npm run dev`, `npm run test`, `npm run build`.
8. **Cara Pakai Singkat**: 1 paragraf + arahkan ke fitur Tour di dalam aplikasi untuk panduan lengkap.
9. **Testing**: cara jalankan test, folder mana yang di-test.
10. **Kontribusi** (opsional, boleh sederhana: "Proyek pribadi/tugas, belum menerima kontribusi eksternal saat ini").
11. **Lisensi** (agent tanyakan/asumsikan MIT jika tidak ditentukan, sebutkan eksplisit).
12. **Author & Credit**:
    ```
    Dibuat oleh **Hafidz Ridwan**
    GitHub: https://github.com/hafidzrdwn
    ```

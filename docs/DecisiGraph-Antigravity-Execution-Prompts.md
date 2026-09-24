# DecisiGraph — Execution Playbook untuk Google Antigravity
### Prompt-by-prompt, disusun mengikuti `DecisiGraph-Technical-Spec.md`

---

## Cara Pakai Dokumen Ini

1. **Taruh kedua file spec di repo**, misal di `docs/DecisiGraph-Technical-Spec.md` dan `docs/DecisiGraph-Antigravity-Execution-Prompts.md`, lalu commit dulu sebelum mulai. Agent Antigravity bisa membaca file di workspace sebagai konteks — ini menghindari agent "mengarang" struktur folder sendiri.
2. **Gunakan Manager view** (bukan chat editor biasa) untuk task-task berukuran fase/fitur di bawah — supaya kamu dapat Artifact (plan, hasil test, screenshot) yang bisa direview sebelum agent lanjut eksekusi.
3. **Satu prompt = satu task**. Jangan gabungkan beberapa nomor jadi satu pesan, meski kelihatan "hemat waktu" — ini justru bikin agent kehilangan fokus dan hasil lebih sering meleset dari spec.
4. **Urutan bersifat wajib.** Fase 2 butuh Fase 1 selesai & lulus test, Fase 3 butuh Fase 2 selesai, dst. Jangan loncat.
5. **Sebelum approve plan**, cek apakah agent benar-benar merujuk ke file spec (bukan bikin struktur sendiri). Kalau planning-nya melenceng, komentari Artifact-nya dulu dan minta revisi plan — jangan biarkan lanjut eksekusi dengan plan yang salah.
6. Setiap prompt di bawah sudah memakai format **Intent / Boundary / Requirements / Keep / Acceptance** — format ini yang bikin Antigravity tidak "ngambang" dan tahu persis kapan sebuah task dianggap selesai.

---

## Fase 0 — Project Scaffolding

### Prompt 0.1 — Inisialisasi Proyek
```
Intent: Inisialisasi proyek DecisiGraph sesuai docs/DecisiGraph-Technical-Spec.md bagian 0, 1, 9.

Boundary: Hanya setup tooling & skeleton folder kosong. JANGAN tulis logic bisnis apa pun dulu.

Requirements:
- Buat project Vite + React 18 + TypeScript.
- Install semua dependencies persis seperti daftar di bagian 9 spec (zustand, immer, zod, react-hook-form, @hookform/resolvers, framer-motion, recharts, lucide-react, decimal.js, nanoid, clsx, tailwind-merge) + devDependencies (vitest, @testing-library/react, tailwindcss).
- Setup Tailwind dengan konfigurasi token warna & font persis seperti bagian 7 spec (surface, accent-primary, accent-secondary, benefit, cost, font sans/mono, dot-grid background).
- Setup path alias "@/" -> "src/" di vite.config.ts DAN tsconfig.json.
- Buat seluruh folder skeleton kosong (boleh pakai file .gitkeep) persis sesuai tree folder di bagian 1 spec — termasuk core/, store/, types/, validators/, components/, features/, utils/, styles/, test/.
- Setup vitest config dasar.

Keep: -

Acceptance: `npm run dev` jalan tanpa error menampilkan halaman default, `npm run test` jalan tanpa error (boleh 0 test), struktur folder persis cocok dengan bagian 1 spec (tunjukkan tree hasilnya).
```

---

## Fase 1 — Core Math Engine

> Semua prompt di fase ini TIDAK BOLEH menyentuh React/komponen — murni `core/math/*` dan test-nya (aturan bagian 1 spec).

### Prompt 1.1 — Types & Normalisasi Dasar
```
Intent: Buat fondasi tipe data & util normalisasi sesuai docs/DecisiGraph-Technical-Spec.md bagian 2 & 3.1.

Boundary: Hanya file src/types/domain.ts, src/core/math/types.ts, src/core/math/normalize.ts. Jangan buat file lain, jangan import React di file-file ini.

Requirements:
- src/types/domain.ts: interface Criterion, Alternative, DecisiProjectState, type CriterionType, MethodId — copy persis dari bagian 2 spec.
- src/core/math/types.ts: interface TraceStep, MethodResult, RankingRow — copy persis dari bagian 2 spec.
- src/core/math/normalize.ts: fungsi generik normalisasi benefit/cost yang akan dipakai calculateSAW (rumus di bagian 3.1).

Keep: -

Acceptance: File-file ini pure TypeScript, tidak ada import dari 'react' atau 'zustand', dan `tsc --noEmit` tidak error.
```

### Prompt 1.2 — SAW Engine
```
Intent: Implementasikan calculateSAW() sesuai rumus di docs/DecisiGraph-Technical-Spec.md bagian 3.1, dengan trace payload lengkap.

Boundary: Hanya src/core/math/saw.ts dan src/test/core/saw.test.ts.

Requirements:
- Signature persis: calculateSAW(criteria: Criterion[], alternatives: Alternative[]): MethodResult
- Normalisasi benefit: r_ij = x_ij / max_i(x_ij); cost: r_ij = min_i(x_ij) / x_ij
- V_i = Σ_j(w_j * r_ij), ranking descending berdasarkan V_i
- WAJIB isi formulaSteps[] untuk setiap sel dengan formulaLabel yang human-readable, contoh persis dari spec: "Cost ⟹ x12 = min(X)/x12 = 20/50 = 0.4"
- Tulis unit test dengan minimal 1 kasus benefit, 1 kasus cost, dan 1 kasus campuran, verifikasi angka finalRanking secara manual di komentar test.

Keep: -

Acceptance: `npm run test saw` lulus semua, output formulaSteps bisa dibaca manusia bukan cuma angka mentah.
```

### Prompt 1.3 — WP Engine (dengan Zero-Guard)
```
Intent: Implementasikan calculateWP() sesuai docs/DecisiGraph-Technical-Spec.md bagian 3.2, termasuk validasi zero-guard.

Boundary: src/core/math/wp.ts, src/validators/matrixSchemas.ts (bagian wpZeroGuard saja), src/test/core/wp.test.ts.

Requirements:
- w_j* = +w_j untuk Benefit, -w_j untuk Cost.
- S_i = Π_j(x_ij ^ w_j*), V_i = S_i / Σ_i(S_i).
- Fungsi wpZeroGuard(alternatives, criteria) di matrixSchemas.ts (pakai Zod) yang mengembalikan daftar { alternativeId, criterionId } untuk sel bernilai 0 pada kriteria Cost.
- calculateWP() harus melempar error terstruktur (bukan crash silent) jika zero-guard menemukan pelanggaran — tampilkan pesan spesifik menyebut alternatif & kriteria mana.
- Test harus mencakup: kasus normal, DAN kasus sel 0 di kriteria cost (harus terdeteksi zero-guard, bukan menghasilkan Infinity).

Keep: Jangan ubah signature calculateSAW dari prompt sebelumnya.

Acceptance: `npm run test wp` lulus, termasuk test yang membuktikan zero-guard mencegah Infinity/NaN.
```

### Prompt 1.4 — TOPSIS Engine
```
Intent: Implementasikan calculateTOPSIS() sesuai docs/DecisiGraph-Technical-Spec.md bagian 3.3.

Boundary: src/core/math/topsis.ts, src/test/core/topsis.test.ts.

Requirements:
- Normalisasi vektor: r_ij = x_ij / sqrt(Σ_i(x_ij²))
- Matriks terbobot y_ij = w_j * r_ij
- A+/A- ditentukan sesuai tipe kriteria (benefit vs cost) — ikuti aturan persis di spec.
- D+_i dan D-_i (Euclidean distance) harus muncul di formulaSteps dengan stage: 'DISTANCE'.
- C_i = D-_i / (D+_i + D-_i), ranking descending.
- Sertakan di MethodResult data titik A+ dan A- (untuk dipakai radar chart nanti) — taruh di intermediateMatrices dengan key 'idealPositive' dan 'idealNegative'.

Keep: Jangan ubah file dari prompt 1.2 dan 1.3.

Acceptance: `npm run test topsis` lulus dengan minimal 1 kasus yang membandingkan manual hasil D+/D-/C_i di komentar test.
```

### Prompt 1.5 — AHP Engine & Consistency Check
```
Intent: Implementasikan calculateAHP() dan consistency check sesuai docs/DecisiGraph-Technical-Spec.md bagian 3.4.

Boundary: src/core/math/ahp.ts, src/core/math/ahp-consistency.ts, src/core/constants/randomIndexTable.ts, src/core/constants/saatyScale.ts, src/test/core/ahp.test.ts.

Requirements:
- randomIndexTable.ts: copy persis tabel RI (n=1..10) dari bagian 3.4 spec.
- ahp.ts: hitung priority vector dari matriks pairwise (normalisasi kolom lalu rata-rata baris).
- ahp-consistency.ts (file TERPISAH dari ahp.ts, sesuai arsitektur spec): hitung λmax, CI, CR, dan fungsi suggestConsistencyFix() yang mencari pasangan (i,j) paling menyimpang dari rasio priority vector.
- Test HARUS mencakup: 1 kasus matriks konsisten (CR ≤ 0.1) dan 1 kasus matriks TIDAK konsisten (CR > 0.1), buktikan suggestConsistencyFix() mengembalikan pasangan yang masuk akal.

Keep: Jangan ubah file dari prompt 1.2–1.4.

Acceptance: `npm run test ahp` lulus, CR yang dihitung untuk kasus contoh cocok dengan perhitungan manual (tulis di komentar test).
```

### Prompt 1.6 — Verifikasi Fase 1 (Gate sebelum lanjut Fase 2)
```
Intent: Jalankan seluruh test suite core/math, laporkan coverage, dan pastikan tidak ada file core/ yang mengimpor React/Zustand.

Boundary: Read-only + perbaikan kecil jika ada test gagal. Jangan tambah fitur baru.

Requirements:
- Jalankan `npm run test` untuk seluruh folder src/test/core/.
- Grep semua file di src/core/ untuk memastikan tidak ada `import ... from 'react'` atau `from 'zustand'`.
- Laporkan ringkasan: berapa test lulus, apakah ada core/math yang belum sesuai signature MethodResult di spec bagian 2.

Keep: Semua implementasi dari prompt 1.1–1.5 tidak boleh diubah kecuali untuk memperbaiki bug yang ditemukan.

Acceptance: Semua test hijau, laporan konfirmasi tidak ada pelanggaran aturan "core harus pure".
```

---

## Fase 2 — State, Design System & UI per Tab

### Prompt 2.1 — Zustand Store
```
Intent: Buat state management sesuai docs/DecisiGraph-Technical-Spec.md bagian 4.

Boundary: src/store/useProjectStore.ts, src/store/useUiStore.ts, src/store/selectors.ts.

Requirements:
- useProjectStore pakai middleware immer, dengan action: addCriterion, removeCriterion, updateCriterion, autoDistributeWeights, addAlternative, removeAlternative, updateCellValue, setActiveMethod.
- normalizedWeight TIDAK disimpan manual — hitung via selector (useTotalWeight, useIsWeightValid) di selectors.ts.
- useUiStore terpisah, berisi activeTab, hoveredCellId, setHoveredCell.
- Import Criterion/Alternative/DecisiProjectState dari src/types/domain.ts (jangan duplikat definisi).

Keep: Jangan ubah apa pun di src/core/.

Acceptance: Store bisa di-import dan action-nya bisa dipanggil dari komponen test sederhana tanpa error TypeScript.
```

### Prompt 2.2 — Design System Dasar (components/ui & layout)
```
Intent: Bangun komponen UI dasar (design system) sesuai docs/DecisiGraph-Technical-Spec.md bagian 0 (Clean Fun Tech) dan bagian 7 (token Tailwind).

Boundary: HANYA src/components/ui/*.tsx dan src/components/layout/*.tsx. Jangan sentuh src/features/.

Requirements:
- ui/: Button, Card (glass-card style: bg-white/85 backdrop-blur-md, border slate-200, rounded-2xl), Input, NumericInput (pakai font-mono), Slider, Tabs, Tooltip, Badge (varian benefit=emerald, cost=rose), GaugeMeter (SVG arc, terima props value 0-1 dan threshold warna).
- layout/: AppShell (grid layout utama), DotGridBackground (radial-gradient dot pattern sesuai spec), Header.
- Semua komponen pakai utils/cn.ts (wrapper clsx + tailwind-merge) — buat file ini juga jika belum ada.
- Setiap komponen < 150 baris. Kalau GaugeMeter butuh lebih, pecah sub-bagian SVG ke helper function di file yang sama (bukan file baru, karena ini masih 1 komponen visual).

Keep: Jangan ubah store dari prompt 2.1.

Acceptance: Buat 1 halaman Storybook-like sederhana (boleh temporary di App.tsx) yang render semua komponen ini sekaligus untuk screenshot verifikasi visual — tunjukkan sebagai Artifact.
```

### Prompt 2.3 — Shared Feature Components & Routing Tab
```
Intent: Bangun komponen input matriks generik yang dipakai lintas tab, dan wiring navigasi 5 tab, sesuai docs/DecisiGraph-Technical-Spec.md bagian 1 & 2.

Boundary: src/features/shared/*.tsx, src/app/routes.ts, src/App.tsx.

Requirements:
- CriteriaEditor.tsx: tambah/hapus kriteria, toggle Benefit/Cost (pakai Badge), tombol "Auto-distribute weight" yang memanggil store.autoDistributeWeights().
- AlternativeEditor.tsx: tambah/hapus baris alternatif.
- MatrixInputGrid.tsx: tabel generik props-driven (terima criteria[], alternatives[], onChangeCell) — dipakai ulang oleh SAW/WP/TOPSIS, JANGAN duplikat tabel per tab.
- routes.ts: daftar 5 tab (id, label, icon dari lucide-react) sesuai bagian arsitektur tab di blueprint asli (SAW, WP, TOPSIS, AHP, Story-to-Matrix).
- App.tsx: render AppShell + Tabs, switch activeTab dari useUiStore, animasi transisi pakai Framer Motion (spring, sesuai blueprint asli).

Keep: Jangan ubah komponen dari prompt 2.2, gunakan apa adanya.

Acceptance: Klik antar tab menampilkan placeholder kosong per tab dengan animasi spring, tidak ada console error.
```

### Prompt 2.4 — SAW Tab (Lengkap)
```
Intent: Rangkai tab SAW yang fungsional penuh, sesuai docs/DecisiGraph-Technical-Spec.md bagian 1 (features/saw) dan bagian 3.1.

Boundary: src/features/saw/**.

Requirements:
- useSawViewModel.ts: ambil criteria & alternatives dari useProjectStore, panggil calculateSAW() dari core/math/saw.ts, kembalikan shape siap pakai UI (jangan panggil calculateSAW dari komponen langsung — wajib lewat hook ini).
- SawTab.tsx: rangkai MatrixInputGrid (input) + SawNormalizationTable + SawRankingTable.
- SawNormalizationTable.tsx & SawRankingTable.tsx: tampilkan hasil dari viewmodel, gunakan NumericInput/font-mono untuk angka.
- Live Mathematical Stepper: tampilkan 3 tahap (Matriks Awal → Normalisasi R → Perangkingan V) sesuai blueprint asli, boleh pakai Tabs kecil atau accordion.

Keep: Jangan ubah core/math/saw.ts — kalau ternyata shape return-nya kurang, tambah di viewmodel, bukan ubah kontrak MethodResult.

Acceptance: Isi 3 kriteria + 3 alternatif dummy, hasil ranking tampil benar dan cocok dengan hasil unit test SAW dari Fase 1.
```

### Prompt 2.5 — WP Tab (Lengkap)
```
Intent: Rangkai tab WP fungsional penuh sesuai docs/DecisiGraph-Technical-Spec.md bagian 1 (features/wp) dan bagian 3.2.

Boundary: src/features/wp/**.

Requirements:
- useWpViewModel.ts: panggil calculateWP(), tangani error zero-guard dari core, kembalikan flag hasZeroGuardViolation + detail-nya ke UI.
- WpZeroGuardAlert.tsx: tampilkan alert jelas (bukan generic) sel mana yang bermasalah, dengan warna rose/cost.
- WpExponentPanel.tsx: visualisasikan transformasi w menjadi +wj/-wj sesuai tipe kriteria (blueprint asli menyebut ini eksplisit).
- WpVectorTable.tsx: tampilkan Vektor S dan Vektor V.
- Tombol "Hitung" harus DISABLED selama zero-guard violation belum diperbaiki user.

Keep: Jangan ubah core/math/wp.ts.

Acceptance: Masukkan sel 0 di kriteria cost → tombol hitung disabled + alert muncul spesifik menyebut alternatif & kriteria; perbaiki nilai → tombol aktif, hasil V muncul benar.
```

### Prompt 2.6 — TOPSIS Tab (Lengkap + Radar Chart)
```
Intent: Rangkai tab TOPSIS fungsional penuh sesuai docs/DecisiGraph-Technical-Spec.md bagian 1 (features/topsis) dan bagian 3.3.

Boundary: src/features/topsis/**.

Requirements:
- useTopsisViewModel.ts: panggil calculateTOPSIS(), ekstrak idealPositive/idealNegative untuk radar chart.
- TopsisIdealSolutionRow.tsx: baris A+ menyala hijau (emerald), A- menyala merah muda (rose), sesuai blueprint asli.
- TopsisDistanceCard.tsx: rincian akar kuadrat D+/D- per alternatif.
- TopsisRadarChart.tsx: pakai Recharts RadarChart, satu axis per kriteria, plot semua alternatif + titik A+ + titik A- dalam skala 0-1 yang sudah dinormalisasi.

Keep: Jangan ubah core/math/topsis.ts.

Acceptance: Radar chart tampil dengan minimal 3 alternatif + garis A+/A- yang visually berbeda warna, C_i ranking cocok dengan test Fase 1.
```

### Prompt 2.7 — AHP Tab (Lengkap)
```
Intent: Rangkai tab AHP fungsional penuh sesuai docs/DecisiGraph-Technical-Spec.md bagian 1 (features/ahp) dan bagian 3.4.

Boundary: src/features/ahp/**.

Requirements:
- useAhpViewModel.ts: kelola state matriks pairwise, panggil calculateAHP() & ahp-consistency setiap slider berubah (live recompute, sesuai konsep reaktif blueprint asli).
- AhpPairwiseSlider.tsx: slider Saaty 1-9 per pasangan kriteria A vs B; saat digeser ke nilai k, WAJIB auto-set matrix[B][A] = 1/k di viewmodel (bukan cuma tampilan).
- AhpMatrixGrid.tsx: tampilkan seluruh matriks termasuk nilai kebalikan otomatis, read-only untuk sel hasil auto-isi.
- AhpConsistencyGauge.tsx: bungkus GaugeMeter, hijau jika CR ≤ 0.10, merah berkedip (pakai animate-pulse) jika CR > 0.10, dengan tombol "Saran Koreksi Perbandingan" yang memanggil suggestConsistencyFix().

Keep: Jangan ubah core/math/ahp.ts atau ahp-consistency.ts.

Acceptance: Geser slider hingga matriks sengaja dibuat tidak konsisten → gauge merah berkedip muncul, klik "Saran Koreksi" menampilkan usulan nilai baru yang masuk akal.
```

---

## Fase 3 — Traceability & Comparison

### Prompt 3.1 — Hover-to-Trace Inspector
```
Intent: Implementasikan fitur pembeda utama produk ini sesuai docs/DecisiGraph-Technical-Spec.md bagian 5.

Boundary: src/features/inspector/**, plus modifikasi MINIMAL pada tabel-tabel hasil di SAW/WP/TOPSIS (ganti <td> jadi <TraceableCell>).

Requirements:
- TraceableCell.tsx: wrapper yang punya data-cell-id, onMouseEnter memanggil useUiStore.setHoveredCell(cellId).
- useCellTrace.ts: lookup formulaSteps[] (dari viewmodel masing-masing tab) berdasarkan hoveredCellId.
- FormulaFloatingCard.tsx: render via createPortal ke document.body, posisi dihitung dari getBoundingClientRect() sel yang di-hover, tampilkan formulaLabel dari TraceStep.
- Highlight sel sumber: semua elemen dengan data-cell-id yang match sourceCellIds[] dapat class animate-pulse ring-2 ring-indigo-400.
- Terapkan ke MINIMAL tabel normalisasi SAW dan tabel weighted TOPSIS sebagai bukti konsep.

Keep: Jangan ubah struktur data TraceStep di core/math/types.ts — kalau field kurang, itu bug di Fase 1, laporkan jangan diakali di sini.

Acceptance: Hover ke satu sel hasil normalisasi SAW → floating card muncul dengan rumus persis seperti contoh di spec ("Cost ⟹ ..."), dan sel sumber di tabel awal ikut menyala.
```

### Prompt 3.2 — Multi-Method Comparison Mode
```
Intent: Implementasikan perbandingan hasil SAW/WP/TOPSIS untuk dataset yang sama, sesuai docs/DecisiGraph-Technical-Spec.md bagian 3 (compareRankings) dan blueprint asli bagian 3.

Boundary: src/core/math/compareRankings.ts (pure logic), src/features/comparison/**.

Requirements:
- compareRankings.ts: fungsi pure yang menerima 3 finalRanking[] (dari SAW/WP/TOPSIS) untuk dataset criteria+alternatives yang sama, mengembalikan tabel gabungan + flag apakah ranking #1 berubah antar metode.
- MultiMethodComparisonTable.tsx: tampilkan tabel side-by-side.
- RankingShiftExplanation.tsx: jika ranking #1 berbeda antar metode, tampilkan penjelasan singkat kenapa (misal: alternatif unggul di kriteria yang bobotnya besar tapi lemah di kriteria lain — sesuaikan logic penjelasannya dengan data aktual, jangan template generic kosong).

Keep: Jangan ubah viewmodel tab SAW/WP/TOPSIS yang sudah ada, cukup konsumsi hasilnya.

Acceptance: Buat 1 dataset dummy yang sengaja menghasilkan ranking #1 berbeda antara SAW dan TOPSIS, tunjukkan tabel comparison + penjelasan pergeserannya masuk akal.
```

---

## Fase 4 — Story-to-Matrix Parser

### Prompt 4.1 — Parser Core (Logic Saja)
```
Intent: Implementasikan parser teks ke matriks sesuai docs/DecisiGraph-Technical-Spec.md bagian 6.

Boundary: src/core/parser/**, src/test/core/parser.test.ts (buat foldernya). Jangan buat UI dulu.

Requirements:
- entityExtractor.ts: parse baris format "Kandidat: Budi, Nilai Tes: 85, Pengalaman: 3 thn, Gaji: 5 jt" menjadi Alternative[] — fuzzy match key ke criteria existing, strip satuan umum (thn, jt, rb, %) sebelum parse Number.
- comparisonDetector.ts: deteksi pola "X kali lebih penting dari Y" / "X jauh lebih penting dibanding Y", mapping ke skala Saaty sesuai tabel di spec bagian 6.
- caseTemplates.ts: 5 preset DecisiProjectState siap pakai (Pemilihan Vendor Cloud, Seleksi Penerima Beasiswa, Penentuan Lokasi Kafe, + 2 lainnya bertema akademik/bisnis).
- Test: minimal 3 kasus entityExtractor (format rapi, format dengan spasi tidak konsisten, format dengan satuan berbeda) dan 2 kasus comparisonDetector.
- Untuk teks yang tidak match pola manapun, kembalikan hasil null/error terstruktur dengan pesan jelas — JANGAN mencoba menebak-nebak (sesuai catatan realistis di spec: MVP hanya dukung pola eksplisit).

Keep: -

Acceptance: `npm run test parser` lulus, dan ada test eksplisit yang membuktikan input tidak dikenal menghasilkan pesan error yang jelas, bukan crash.
```

### Prompt 4.2 — Story-to-Matrix Tab (UI)
```
Intent: Bangun UI tab Story-to-Matrix sesuai docs/DecisiGraph-Technical-Spec.md bagian 1 (features/story-to-matrix) dan bagian 6, mengonsumsi parser dari Prompt 4.1.

Boundary: src/features/story-to-matrix/**.

Requirements:
- StoryTextArea.tsx: textarea besar dengan placeholder contoh soal studi kasus.
- ExtractedPreviewTable.tsx: preview hasil ekstraksi sebelum di-commit ke store (user harus konfirmasi dulu).
- ModeSwitcher.tsx: toggle dua arah Cerita ↔ Form (form ke cerita: generate narasi dari state existing; cerita ke form: panggil parser).
- Tombol "Coba Contoh": munculkan 5 template dari caseTemplates.ts, klik salah satu langsung mengisi textarea/state.
- Auto-Detection: jika comparisonDetector mendeteksi pola perbandingan relatif, munculkan prompt konfirmasi "Terdeteksi perbandingan relatif, arahkan ke tab AHP?" — jangan auto-pindah tab tanpa konfirmasi user (UX safety).

Keep: Jangan ubah core/parser/** dari prompt 4.1.

Acceptance: Paste salah satu dari 5 contoh template, klik parse, preview tabel muncul benar, klik konfirmasi mengisi useProjectStore dengan data yang bisa langsung dipakai tab SAW/WP/TOPSIS/AHP.
```

---

## Fase 5 — QA & Polish (Bonus, di luar 4 fase asli)

### Prompt 5.1 — Review Akhir
```
Intent: QA pass menyeluruh sebelum dianggap MVP selesai.

Boundary: Perbaikan kecil di file manapun, TIDAK menambah fitur baru.

Requirements:
- Cek semua 5 tab bisa diakses tanpa console error dengan data kosong (empty state harus wajar, bukan crash).
- Cek responsif di lebar layar sempit (bento grid tidak boleh overflow horizontal tak terkontrol).
- Cek seluruh angka desimal konsisten formatnya (pakai utils/formatNumber.ts, bukan tercecer toFixed() manual di berbagai file).
- Cek tidak ada file komponen yang melebihi ~150 baris tanpa alasan kuat — kalau ada, pecah.
- Jalankan seluruh test suite (core + parser), pastikan semua hijau.

Keep: Semua fitur yang sudah berfungsi dari Fase 1-4.

Acceptance: Laporan checklist QA di atas, dengan screenshot Artifact untuk setiap tab dalam kondisi terisi data dummy.
```

---

## Catatan Strategi Prompting

- Kalau di tengah jalan agent mulai "berimprovisasi" keluar dari struktur spec (nama file beda, folder beda), **hentikan dan revisi plan-nya**, jangan biarkan lanjut lalu diperbaiki belakangan — semakin jauh menyimpang, semakin mahal biaya perbaikannya nanti.
- Untuk task besar dengan banyak file (misal Prompt 2.2, 2.4), Antigravity akan menampilkan implementation plan dulu sebelum eksekusi — **selalu baca plan itu**, bandingkan dengan Requirements di prompt, baru approve.
- Kalau satu prompt gagal berulang kali dengan pendekatan sama, jangan re-run prompt yang sama — pecah jadi 2 prompt lebih kecil (misal Prompt 2.2 dipecah jadi "ui primitives" dan "layout components" terpisah).

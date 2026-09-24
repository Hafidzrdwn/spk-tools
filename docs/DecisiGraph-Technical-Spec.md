# DecisiGraph — Technical Implementation Spec
### (Turunan detail dari Product Blueprint, siap dieksekusi AI coding agent)

> Dokumen ini adalah **spesifikasi teknis eksekusi**, bukan sekadar ide produk. Tujuannya: seorang AI agent programmer (atau developer manusia) bisa langsung mulai coding tanpa perlu menebak-nebak arsitektur, struktur folder, rumus, atau kontrak data.

---

## 0. Ringkasan Keputusan Teknis (TL;DR untuk Agent)

| Aspek | Keputusan | Alasan |
|---|---|---|
| Bahasa | **TypeScript**, bukan plain JS | Blueprint asli sudah pakai `interface` — matematika SPK butuh type-safety ketat (index kriteria, weight, dsb rawan salah tipe) |
| Build tool | Vite + React 18 | Sesuai request user |
| Styling | Tailwind CSS 3 + `clsx` + `tailwind-merge` | Sesuai request user, ditambah util standar untuk conditional className |
| State management | **Zustand** (bukan Redux/Context API polos) | State proyek (criteria, alternatives, activeMethod) bersifat global lintas tab tapi sederhana; Zustand minim boilerplate, cocok untuk reactive recompute tiap slider/input berubah |
| Validasi input | **Zod** | Validasi matriks (angka non-null, 0-guard WP, dsb) perlu schema declaratif, bukan if-else manual bertumpuk |
| Form dinamis | **React Hook Form** + Zod resolver | Untuk tabel kriteria/alternatif yang barisnya dinamis (tambah/hapus) |
| Animasi | **Framer Motion** | Spring animation saat pindah tab / tambah baris (sudah disebut di blueprint asli) |
| Chart | **Recharts** | Radar chart & scatter chart out-of-the-box, API deklaratif, ringan dipelajari agent |
| Precision math | **decimal.js** (opsional tapi disarankan) | Floating point error (`0.1 + 0.2`) bisa mengacaukan CR gauge AHP & ranking SAW yang mepet. Pakai untuk kalkulasi inti, format ke `number` biasa hanya saat render |
| Icon | **lucide-react** | Ringan, konsisten dengan estetika "clean fun tech" |
| Testing | **Vitest** + React Testing Library | Vite-native, cepat |
| ID generator | **nanoid** | Untuk id kriteria/alternatif dinamis |

**Prinsip arsitektur wajib:** pisahkan **"otak" (pure math functions, tanpa React)** dari **"wajah" (komponen UI)**. Semua fungsi hitung SAW/WP/TOPSIS/AHP harus bisa di-*unit test* tanpa perlu render komponen apa pun. Ini juga yang menjawab requirement "jangan menumpuk panjang pada 1 file" — pemisahan ini otomatis memecah kompleksitas.

---

## 1. Struktur Folder Lengkap

```
decisigraph/
├── public/
├── src/
│   ├── main.tsx
│   ├── App.tsx                        # Root: AppShell + Tabs router (state-based, bukan react-router)
│   │
│   ├── app/
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx      # (opsional) dark mode toggle di masa depan
│   │   └── routes.ts                  # daftar tab: id, label, icon — dipakai Tabs & AppShell
│   │
│   ├── core/                          # ⭐ PURE LOGIC — TIDAK BOLEH import React di sini
│   │   ├── math/
│   │   │   ├── types.ts               # NormalizationResult, WeightedResult, TraceStep, dst
│   │   │   ├── normalize.ts           # fungsi normalisasi generik (dipakai SAW & basis TOPSIS)
│   │   │   ├── saw.ts                 # calculateSAW()
│   │   │   ├── wp.ts                  # calculateWP()
│   │   │   ├── topsis.ts              # calculateTOPSIS()
│   │   │   ├── ahp.ts                 # calculateAHP()
│   │   │   ├── ahp-consistency.ts     # hitung CI, CR, λmax terpisah dari ahp.ts inti
│   │   │   └── compareRankings.ts     # logic untuk "Multi-Method Comparison Mode"
│   │   ├── constants/
│   │   │   ├── saatyScale.ts          # label 1–9 untuk slider AHP
│   │   │   └── randomIndexTable.ts    # tabel RI (n=1..10) untuk hitung CR
│   │   └── parser/
│   │       ├── entityExtractor.ts     # regex/heuristik "Kandidat: Budi, Nilai Tes: 85, ..."
│   │       ├── comparisonDetector.ts  # deteksi frasa "X kali lebih penting dari Y" → arahkan ke AHP
│   │       └── caseTemplates.ts       # 5 template studi kasus preset
│   │
│   ├── store/                         # Zustand — satu-satunya sumber kebenaran state
│   │   ├── useProjectStore.ts         # criteria[], alternatives[], activeMethod, title
│   │   ├── useUiStore.ts              # activeTab, hoveredCellId, isInspectorOpen
│   │   └── selectors.ts               # selector turunan (mis. totalWeight, isWeightValid)
│   │
│   ├── types/
│   │   └── domain.ts                  # Criterion, Alternative, DecisiProjectState (re-export dari core jika perlu dipakai UI)
│   │
│   ├── validators/
│   │   └── matrixSchemas.ts           # Zod schema: criterionSchema, alternativeSchema, zeroGuardSchema
│   │
│   ├── components/                    # Design system — "dumb" components, tanpa business logic
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx               # glass-card: bg-white/85 backdrop-blur-md
│   │   │   ├── Input.tsx
│   │   │   ├── NumericInput.tsx       # input khusus angka + font mono
│   │   │   ├── Slider.tsx             # dipakai ulang untuk Saaty slider
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Badge.tsx              # Benefit(emerald) / Cost(rose) pill
│   │   │   └── GaugeMeter.tsx         # consistency gauge (SVG arc)
│   │   └── layout/
│   │       ├── AppShell.tsx
│   │       ├── DotGridBackground.tsx  # radial-gradient dot pattern
│   │       └── Header.tsx
│   │
│   ├── features/                      # Satu folder = satu tab = satu domain fitur
│   │   ├── shared/
│   │   │   ├── MatrixInputGrid.tsx    # tabel input dipakai SAW/WP/TOPSIS (generic, props-driven)
│   │   │   ├── CriteriaEditor.tsx     # tambah/hapus kriteria, toggle Benefit/Cost, auto-distribute weight
│   │   │   └── AlternativeEditor.tsx  # tambah/hapus baris alternatif
│   │   │
│   │   ├── saw/
│   │   │   ├── SawTab.tsx
│   │   │   ├── components/
│   │   │   │   ├── SawNormalizationTable.tsx
│   │   │   │   └── SawRankingTable.tsx
│   │   │   └── useSawViewModel.ts     # hook: ambil state dari store → panggil calculateSAW() → shape utk UI
│   │   │
│   │   ├── wp/
│   │   │   ├── WpTab.tsx
│   │   │   ├── components/
│   │   │   │   ├── WpExponentPanel.tsx    # visualisasi transformasi w → +w/-w
│   │   │   │   ├── WpZeroGuardAlert.tsx
│   │   │   │   └── WpVectorTable.tsx      # tabel S dan V
│   │   │   └── useWpViewModel.ts
│   │   │
│   │   ├── topsis/
│   │   │   ├── TopsisTab.tsx
│   │   │   ├── components/
│   │   │   │   ├── TopsisIdealSolutionRow.tsx  # baris A+ / A-
│   │   │   │   ├── TopsisDistanceCard.tsx      # rincian akar kuadrat D+/D-
│   │   │   │   └── TopsisRadarChart.tsx        # Recharts RadarChart
│   │   │   └── useTopsisViewModel.ts
│   │   │
│   │   ├── ahp/
│   │   │   ├── AhpTab.tsx
│   │   │   ├── components/
│   │   │   │   ├── AhpPairwiseSlider.tsx   # slider Saaty A vs B
│   │   │   │   ├── AhpMatrixGrid.tsx       # auto-isi nilai kebalikan (1/x)
│   │   │   │   └── AhpConsistencyGauge.tsx # wrap GaugeMeter + tombol "Saran Koreksi"
│   │   │   └── useAhpViewModel.ts
│   │   │
│   │   ├── story-to-matrix/
│   │   │   ├── StoryToMatrixTab.tsx
│   │   │   ├── components/
│   │   │   │   ├── StoryTextArea.tsx
│   │   │   │   ├── ExtractedPreviewTable.tsx
│   │   │   │   └── ModeSwitcher.tsx        # toggle Cerita ↔ Form
│   │   │   └── useStoryParserViewModel.ts
│   │   │
│   │   ├── inspector/                      # fitur LINTAS TAB — hover-to-trace
│   │   │   ├── components/
│   │   │   │   ├── TraceableCell.tsx       # wrapper <td> yang handle hover & highlight
│   │   │   │   └── FormulaFloatingCard.tsx # floating card munculkan rumus
│   │   │   └── useCellTrace.ts             # baca formulaSteps dari trace payload by cellId
│   │   │
│   │   └── comparison/
│   │       ├── MultiMethodComparisonTable.tsx
│   │       └── RankingShiftExplanation.tsx
│   │
│   ├── utils/
│   │   ├── formatNumber.ts            # format 4 desimal konsisten, locale id-ID
│   │   ├── idGenerator.ts             # wrap nanoid
│   │   └── cn.ts                      # wrap clsx + tailwind-merge
│   │
│   ├── styles/
│   │   └── globals.css                # @tailwind + CSS variables design token
│   │
│   └── test/
│       └── core/
│           ├── saw.test.ts
│           ├── wp.test.ts
│           ├── topsis.test.ts
│           └── ahp.test.ts
│
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Aturan keras untuk agent:**
1. File di `core/math/*` **tidak boleh** mengimpor apa pun dari `react`, `zustand`, atau folder `components/`/`features/`. Murni fungsi `(input) => output`.
2. Setiap file komponen UI idealnya **< 150 baris**. Kalau lebih, pecah jadi sub-komponen di folder `components/` milik tab tersebut.
3. Setiap `useXxxViewModel.ts` adalah satu-satunya jembatan antara `store` + `core/math` dengan komponen tab. Komponen tab **tidak boleh** memanggil `calculateSAW()` dkk secara langsung.

---

## 2. Kontrak Data (Type Definitions)

`src/types/domain.ts`
```ts
export type CriterionType = 'BENEFIT' | 'COST';

export interface Criterion {
  id: string;
  name: string;
  type: CriterionType;
  weight: number;            // bobot mentah, misal 3, 5, 1 (belum dinormalisasi)
  normalizedWeight: number;  // weight / totalWeight, HARUS selalu jumlah = 1.0 (toleransi 1e-9)
}

export interface Alternative {
  id: string;
  name: string;
  values: Record<string, number>; // key = criterion.id
}

export type MethodId = 'SAW' | 'WP' | 'TOPSIS' | 'AHP' | 'AUTO';

export interface DecisiProjectState {
  title: string;
  activeMethod: MethodId;
  criteria: Criterion[];
  alternatives: Alternative[];
}
```

`src/core/math/types.ts` — payload wajib untuk fitur Traceability (bagian paling krusial dari diferensiasi produk ini):

```ts
/** Satu langkah rumus untuk SATU sel, dipakai FormulaFloatingCard */
export interface TraceStep {
  cellId: string;            // format: "{method}-{alternativeId}-{criterionId}-{stage}"
  stage: 'RAW' | 'NORMALIZED' | 'WEIGHTED' | 'DISTANCE' | 'FINAL';
  formulaLabel: string;      // "Cost ⟹ x12 = min(X) / x12"  → siap tampil, bukan cuma angka
  inputs: Record<string, number>;   // { min: 20, x: 50 } → dipakai highlight sel sumber
  sourceCellIds: string[];   // id sel-sel di tabel awal yang harus ikut nyala (pulse effect)
  result: number;
}

export interface MethodResult<TRanking = RankingRow> {
  intermediateMatrices: Record<string, number[][]>; // { normalized: [...], weighted: [...] }
  formulaSteps: TraceStep[];
  finalRanking: TRanking[];
}

export interface RankingRow {
  alternativeId: string;
  alternativeName: string;
  score: number;
  rank: number; // 1 = terbaik
}
```

> **Kenapa ini penting dijelaskan ke agent:** fitur "Interactive Value Inspector" di blueprint asli gagal kalau setiap fungsi (`calculateSAW`, dst) cuma mengembalikan angka akhir. Maka **setiap** fungsi kalkulasi WAJIB mengembalikan `formulaSteps[]` sebagai bagian dari return value-nya, bukan dihitung ulang di layer UI.

---

## 3. Spesifikasi Algoritma per Metode (dengan rumus eksplisit)

### 3.1 SAW (Simple Additive Weighting)

```
Langkah 1 — Normalisasi:
  Benefit: r_ij = x_ij / max_i(x_ij)
  Cost   : r_ij = min_i(x_ij) / x_ij

Langkah 2 — Perangkingan:
  V_i = Σ_j ( w_j * r_ij )     // w_j = normalizedWeight

Ranking: V_i terbesar = terbaik
```

Signature fungsi:
```ts
function calculateSAW(
  criteria: Criterion[],
  alternatives: Alternative[]
): MethodResult
```
`formulaSteps` untuk stage `'NORMALIZED'` harus generate label berbeda tergantung `criterion.type` (contoh persis dari blueprint: `Cost ⟹ x12 = min(X)/x12 = 20/50 = 0.4`).

### 3.2 WP (Weighted Product)

```
Langkah 1 — Pangkat pembobotan:
  w_j* = +w_j  jika Benefit
  w_j* = -w_j  jika Cost

Langkah 2 — Vektor S:
  S_i = Π_j ( x_ij ^ w_j* )

Langkah 3 — Normalisasi:
  V_i = S_i / Σ_i(S_i)

Ranking: V_i terbesar = terbaik
```

**Zero-Guard wajib** (sesuai blueprint): sebelum kalkulasi jalan, validasi via Zod —
```ts
// validators/matrixSchemas.ts
export const wpZeroGuard = (alternatives: Alternative[], criteria: Criterion[]) => {
  // return list of { alternativeId, criterionId } yang bernilai 0
  // UI: WpZeroGuardAlert.tsx render pesan spesifik per sel, BUKAN generic "input invalid"
};
```
Alasan teknis yang perlu agent tahu: `0 ^ (-w)` = `Infinity`, dan ini akan merusak seluruh normalisasi `V_i`. Guard ini **blocking** — tombol "Hitung" harus disabled sampai semua sel cost yang bernilai 0 diperbaiki.

### 3.3 TOPSIS (Vector Geometry)

```
Langkah 1 — Normalisasi vektor:
  r_ij = x_ij / √( Σ_i(x_ij²) )

Langkah 2 — Matriks terbobot:
  y_ij = w_j * r_ij

Langkah 3 — Solusi ideal:
  Benefit → A+_j = max_i(y_ij),  A-_j = min_i(y_ij)
  Cost    → A+_j = min_i(y_ij),  A-_j = max_i(y_ij)

Langkah 4 — Jarak Euclidean:
  D+_i = √( Σ_j (y_ij - A+_j)² )
  D-_i = √( Σ_j (y_ij - A-_j)² )

Langkah 5 — Nilai preferensi:
  C_i = D-_i / (D+_i + D-_i)

Ranking: C_i terbesar = terbaik
```
`TopsisRadarChart.tsx` memplot setiap alternatif + titik A+ (hijau) + titik A- (merah muda) dalam ruang N-dimensi kriteria (Recharts `RadarChart` — satu axis per kriteria, dinormalisasi 0–1 dari `y_ij` agar skala antar kriteria adil di radar).

### 3.4 AHP (Saaty Pairwise Studio)

```
Langkah 1 — Normalisasi kolom matriks pairwise:
  Setiap kolom dibagi dengan jumlah kolomnya

Langkah 2 — Priority vector:
  w_i = rata-rata tiap baris matriks yang sudah dinormalisasi

Langkah 3 — Consistency check:
  Weighted sum vector = MatriksPairwise × PriorityVector
  λmax = rata-rata ( WeightedSumVector_i / PriorityVector_i )
  CI = (λmax - n) / (n - 1)
  CR = CI / RI(n)

CR ≤ 0.10 → konsisten (hijau)
CR > 0.10  → tidak konsisten (merah, tampilkan "Saran Koreksi")
```

Tabel RI (`core/constants/randomIndexTable.ts`):
```ts
export const RANDOM_INDEX_TABLE: Record<number, number> = {
  1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12,
  6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49,
};
```

**Auto-isi nilai kebalikan** — saat slider Saaty digeser untuk pasangan (A, B) menjadi nilai `k`, maka:
```ts
matrix[A][B] = k;
matrix[B][A] = 1 / k;
```
Ini harus terjadi di level `useAhpViewModel.ts` (state update), bukan cuma tampilan visual, karena `matrix[B][A]` dipakai langsung di kalkulasi CR.

**"Saran Koreksi Perbandingan"** (fitur yang di blueprint disebut tapi belum dirinci — ini usulan implementasi konkret): cari pasangan (i,j) di mana `matrix[i][j]` paling menyimpang dari rasio `priorityVector[i]/priorityVector[j]` yang implied, lalu sarankan nilai baru yang mendekati konsistensi. Taruh logic ini di `ahp-consistency.ts` sebagai fungsi terpisah `suggestConsistencyFix()`, agar `ahp.ts` inti tetap bersih.

---

## 4. State Management (Zustand)

`src/store/useProjectStore.ts`
```ts
interface ProjectStore extends DecisiProjectState {
  addCriterion: () => void;
  removeCriterion: (id: string) => void;
  updateCriterion: (id: string, patch: Partial<Criterion>) => void;
  autoDistributeWeights: () => void;       // tombol "Auto-distribute weight"

  addAlternative: () => void;
  removeAlternative: (id: string) => void;
  updateCellValue: (alternativeId: string, criterionId: string, value: number) => void;

  setActiveMethod: (method: MethodId) => void;
}
```
- Gunakan middleware `immer` (`zustand/middleware/immer`) supaya update nested (`values` di dalam `alternatives[]`) tetap immutable tanpa spread manual bertingkat.
- `normalizedWeight` **tidak disimpan manual** — hitung via selector turunan tiap kali `criteria` berubah (`selectors.ts` → `useTotalWeight()`, `useIsWeightValid()`), supaya tidak pernah out-of-sync.

`src/store/useUiStore.ts` — terpisah dari data proyek karena lifecycle beda (UI state di-reset kalau pindah tab, project state tidak):
```ts
interface UiStore {
  activeTab: MethodId;
  hoveredCellId: string | null;   // dipakai Inspector untuk tahu formula mana yang tampil
  setHoveredCell: (id: string | null) => void;
}
```

---

## 5. Fitur Traceability & Inspector — Detail Implementasi

Ini fitur pembeda utama, jadi perlu breakdown paling konkret:

1. Setiap sel hasil (`<td>`) di tabel Normalisasi/Weighted/dst dibungkus `<TraceableCell cellId={...}>` alih-alih `<td>` polos.
2. `TraceableCell` `onMouseEnter` → panggil `useUiStore.setHoveredCell(cellId)`.
3. `useCellTrace(cellId)` melakukan lookup ke `formulaSteps[]` (hasil dari `calculateSAW()` dkk yang disimpan di viewmodel) untuk menemukan `TraceStep` yang cocok.
4. `FormulaFloatingCard` di-render via **portal** (`createPortal` ke `document.body`) supaya tidak terpotong `overflow` tabel, diposisikan pakai `getBoundingClientRect()` dari sel yang di-hover.
5. Highlight sel sumber: semua elemen dengan `data-cell-id` yang match `sourceCellIds[]` mendapat class `animate-pulse ring-2 ring-indigo-400` via conditional className, bukan lewat DOM manipulation manual.

---

## 6. Story-to-Matrix Parser — Pendekatan Teknis

Blueprint asli menyebut "regex/heuristik" — berikut breakdown supaya agent tidak bingung mulai dari mana:

```ts
// core/parser/entityExtractor.ts
// Target pola: "Kandidat: Budi, Nilai Tes: 85, Pengalaman: 3 thn, Gaji: 5 jt"
// Strategi: split per baris → per baris split by koma → per fragmen split by ":" pertama
// key (kiri ":") auto-mapping ke criterion existing via fuzzy match sederhana (lowercase + trim)
// value (kanan ":") di-strip satuan umum (thn, jt, rb, %) via regex map lalu di-parse Number
```

```ts
// core/parser/comparisonDetector.ts
// Target pola: "A 3 kali lebih penting dari B" / "A jauh lebih penting dibanding B"
// Strategi: regex capture (entitas1, kata_intensitas, entitas2)
// kata_intensitas → mapping ke skala Saaty:
//   "sedikit lebih penting" → 3
//   "lebih penting"          → 5
//   "jauh lebih penting"     → 7
//   "mutlak lebih penting"   → 9
// Jika ditemukan pola ini → set activeMethod = 'AHP' dan prefill pairwise matrix
```

`caseTemplates.ts` menyimpan 5 preset (Pemilihan Vendor Cloud, Seleksi Beasiswa, Penentuan Lokasi Kafe, +2 lainnya bebas ditentukan agent) sebagai object `DecisiProjectState` siap pakai, dipicu tombol "Coba Contoh" di `StoryToMatrixTab`.

**Catatan realistis untuk agent:** parser berbasis regex ini akan rapuh terhadap variasi bahasa natural. Untuk MVP (Fase 4), cukup dukung pola-pola di atas secara eksplisit dan tampilkan pesan jelas ("Format tidak dikenali, coba format: ...") daripada mencoba NLP general-purpose.

---

## 7. Desain Sistem → Implementasi Tailwind

`tailwind.config.ts` (token warna sesuai blueprint asli):
```ts
export default {
  theme: {
    extend: {
      colors: {
        surface: '#F8FAFC',        // Slate 50
        'accent-primary': '#4F46E5',  // Indigo 600
        'accent-secondary': '#8B5CF6', // Violet 500
        benefit: '#10B981',        // Emerald — Benefit / A+
        cost: '#F43F5E',           // Rose — Cost / A-
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '1rem',   // rounded-2xl
        control: '0.75rem', // rounded-xl
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(#cbd5e1 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '20px 20px',
      },
    },
  },
};
```
Angka matriks & notasi matematika **selalu** pakai `font-mono` (class utilitas `NumericInput` dan sel tabel hasil) — ini eksplisit di blueprint asli dan gampang terlewat kalau tidak ditulis di sini.

---

## 8. Roadmap Eksekusi — Actionable per File

Fase asli dipertahankan, tapi tiap fase sekarang punya checklist file konkret.

**Fase 1 — Core Engine (target: `core/` selesai + lulus semua test)**
- [ ] `core/math/types.ts`, `normalize.ts`
- [ ] `core/math/saw.ts` + `test/core/saw.test.ts`
- [ ] `core/math/wp.ts` + `test/core/wp.test.ts` (termasuk kasus zero-guard)
- [ ] `core/math/topsis.ts` + `test/core/topsis.test.ts`
- [ ] `core/math/ahp.ts`, `ahp-consistency.ts` + `test/core/ahp.test.ts`
- [ ] `core/constants/randomIndexTable.ts`, `saatyScale.ts`
- **Definition of Done**: semua fungsi punya unit test dengan angka contoh dari blueprint (mis. kasus 20/50 = 0.4), dan mengembalikan `formulaSteps[]` yang lengkap.

**Fase 2 — Reactive UI & Store**
- [ ] `store/useProjectStore.ts`, `useUiStore.ts`, `selectors.ts`
- [ ] `components/ui/*` (design system dasar)
- [ ] `features/shared/CriteriaEditor.tsx`, `AlternativeEditor.tsx`, `MatrixInputGrid.tsx`
- [ ] `features/saw/*`, `features/wp/*`, `features/topsis/*` (hubungkan viewmodel ke core)
- [ ] `features/ahp/AhpPairwiseSlider.tsx` + auto-isi kebalikan

**Fase 3 — Traceability & Visual Inspector**
- [ ] `features/inspector/*` (TraceableCell, FormulaFloatingCard, useCellTrace)
- [ ] `features/topsis/components/TopsisRadarChart.tsx`
- [ ] `features/comparison/*` (Multi-Method Comparison Mode)

**Fase 4 — Story Parser & Templates**
- [ ] `core/parser/*`
- [ ] `features/story-to-matrix/*`
- [ ] 5 `caseTemplates.ts`

---

## 9. Dependencies (`package.json` inti)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "immer": "^10.1.0",
    "zod": "^3.23.0",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.9.0",
    "framer-motion": "^11.3.0",
    "recharts": "^2.12.0",
    "lucide-react": "^0.400.0",
    "decimal.js": "^10.4.0",
    "nanoid": "^5.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.4.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0"
  }
}
```

---

## 10. Konvensi Kode untuk Agent

- Path alias `@/` → `src/` (set di `vite.config.ts` + `tsconfig.json`), supaya import tidak `../../../../core/math/saw`.
- Satu komponen = satu file = satu default export bernama sama dengan filename.
- Fungsi di `core/` selalu **pure** dan **deterministic** — tidak boleh ada `Math.random()`, `Date.now()`, atau side effect. ID generation (`nanoid`) hanya dipanggil dari `store/`.
- Penamaan hook viewmodel selalu `use[Nama]ViewModel`, penamaan hook logic non-UI lain `use[Nama]`.
- Setiap PR/commit idealnya scope ke satu folder `features/xxx/` atau satu file `core/math/xxx.ts` — jangan campur perubahan UI dan logic matematika dalam satu commit besar.

---

*Dokumen ini melengkapi (bukan menggantikan) Product Blueprint asli — bagian desain visual, mikro-interaksi, dan urutan fase dari blueprint asli tetap berlaku, dokumen ini menambah lapisan "bagaimana cara kodenya".*

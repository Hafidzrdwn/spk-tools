import type { MethodId } from '@/types/domain';

export interface GlossaryEntry {
  term: string;          // "SAW", "Bobot (W)", dst — dipakai sorting alfabet
  definition: string;    // penjelasan awam, 1-3 kalimat
  relatedTabs?: MethodId[]; // tab mana yang relevan, untuk filter kontekstual
  symbol?: string;       // simbol matematika terkait, misal "wⱼ", "Σ", "√"
}

export const GLOSSARY_TERMS: GlossaryEntry[] = [
  { term: 'A+ (Solusi Ideal Positif)', symbol: 'A⁺', definition: 'Titik "skenario terbaik" dalam TOPSIS — nilai terbagus yang mungkin dicapai di tiap kriteria.', relatedTabs: ['TOPSIS'] },
  { term: 'A− (Solusi Ideal Negatif)', symbol: 'A⁻', definition: 'Titik "skenario terburuk" dalam TOPSIS — nilai terjelek yang mungkin terjadi di tiap kriteria.', relatedTabs: ['TOPSIS'] },
  { term: 'AHP (Analytic Hierarchy Process)', definition: 'Metode yang menghitung bobot kriteria dari perbandingan berpasangan (mana yang lebih penting) yang dilakukan manusia, bukan dari data mentah.', relatedTabs: ['AHP'] },
  { term: 'Alternatif', symbol: 'Aᵢ', definition: 'Pilihan/kandidat yang mau dibandingkan, misal 5 calon laboran (A1–A5) atau 3 vendor cloud.' },
  { term: 'Benefit', definition: 'Sifat kriteria di mana semakin tinggi nilainya, semakin baik (contoh: nilai tes, IPK).' },
  { term: 'Bobot (Weight)', symbol: 'wⱼ', definition: 'Angka yang menunjukkan seberapa penting suatu kriteria dibanding kriteria lain. Total seluruh bobot ternormalisasi harus = 1,0.' },
  { term: 'Consistency Index (CI)', symbol: 'CI', definition: 'Angka yang mengukur seberapa "acak" atau tidak logis perbandingan berpasangan di AHP.', relatedTabs: ['AHP'] },
  { term: 'Consistency Ratio (CR)', symbol: 'CR', definition: 'Hasil bagi CI dengan Random Index (RI). Jika CR ≤ 0,10, perbandingan dianggap cukup konsisten/logis untuk dipakai.', relatedTabs: ['AHP'] },
  { term: 'Cost', definition: 'Sifat kriteria di mana semakin rendah nilainya, semakin baik (contoh: harga, gaji diminta).' },
  { term: 'Euclidean Distance', symbol: 'D', definition: 'Cara mengukur "jarak" antara dua titik data secara geometris — dipakai TOPSIS untuk menghitung seberapa dekat suatu alternatif ke solusi ideal.', relatedTabs: ['TOPSIS'] },
  { term: 'Kriteria', symbol: 'Cⱼ', definition: 'Faktor/aspek yang dipakai untuk menilai alternatif, misal "Nilai Tes", "Pengalaman", "Gaji Diminta".' },
  { term: 'Lambda Max (λmax)', symbol: 'λmax', definition: 'Nilai rata-rata konsistensi yang dihitung dari matriks perbandingan AHP, dipakai untuk mencari CI.', relatedTabs: ['AHP'] },
  { term: 'Matriks Keputusan', symbol: 'X', definition: 'Tabel mentah berisi nilai semua alternatif di semua kriteria, sebelum diolah/dinormalisasi.' },
  { term: 'Matriks Ternormalisasi', symbol: 'R', definition: 'Matriks keputusan yang sudah "disamakan skalanya" (misal nilai 0–100 dan nilai jutaan rupiah jadi bisa dibandingkan adil).' },
  { term: 'MCDM / MADM', definition: 'Singkatan dari Multi-Criteria/Attribute Decision Making — istilah payung untuk semua metode di aplikasi ini (SAW, WP, TOPSIS, AHP).' },
  { term: 'Normalisasi', definition: 'Proses mengubah angka mentah (skala berbeda-beda) jadi skala yang setara/adil untuk dibandingkan.' },
  { term: 'Pairwise Comparison (Perbandingan Berpasangan)', definition: 'Teknik AHP di mana user membandingkan dua kriteria sekaligus ("A berapa kali lebih penting dari B?"), bukan menilai satu-satu.', relatedTabs: ['AHP'] },
  { term: 'Perangkingan', definition: 'Hasil akhir berupa urutan alternatif dari yang terbaik ke terburuk.' },
  { term: 'Priority Vector (Vektor Prioritas)', symbol: 'w', definition: 'Hasil akhir bobot kriteria dari proses AHP, didapat dari rata-rata baris matriks pairwise ternormalisasi.', relatedTabs: ['AHP'] },
  { term: 'Random Index (RI)', symbol: 'RI', definition: 'Angka acuan tetap (dari tabel Saaty) yang dipakai membagi CI untuk mendapat CR, nilainya beda-beda tergantung jumlah kriteria.', relatedTabs: ['AHP'] },
  { term: 'Rᵢⱼ', symbol: 'rᵢⱼ', definition: 'Notasi nilai satu sel di matriks yang sudah dinormalisasi (alternatif ke-i, kriteria ke-j).' },
  { term: 'SAW (Simple Additive Weighting)', definition: 'Metode paling sederhana: normalisasi nilai, lalu jumlahkan hasil kali nilai×bobot tiap kriteria.', relatedTabs: ['SAW'] },
  { term: 'Skala Saaty', symbol: '1–9', definition: 'Skala angka 1 sampai 9 yang dipakai AHP untuk menyatakan "seberapa penting" satu kriteria dibanding lainnya (1 = sama penting, 9 = mutlak lebih penting).', relatedTabs: ['AHP'] },
  { term: 'SPK (Sistem Pendukung Keputusan)', definition: 'Istilah umum untuk sistem/tools yang membantu manusia mengambil keputusan secara lebih terstruktur dan objektif.' },
  { term: 'TOPSIS', definition: 'Metode yang memilih alternatif berdasarkan mana yang paling dekat ke "skenario terbaik" (A+) dan paling jauh dari "skenario terburuk" (A−).', relatedTabs: ['TOPSIS'] },
  { term: 'Vektor S', symbol: 'S', definition: 'Hasil perkalian pangkat (belum dinormalisasi) di metode WP, sebelum jadi Vektor V.', relatedTabs: ['WP'] },
  { term: 'Vektor V', symbol: 'V / Vᵢ', definition: 'Skor akhir tiap alternatif di SAW dan WP — makin besar makin baik, dipakai untuk ranking.', relatedTabs: ['SAW', 'WP'] },
  { term: 'WP (Weighted Product)', definition: 'Metode yang menilai alternatif lewat perkalian (bukan penjumlahan seperti SAW), dengan bobot jadi pangkat.', relatedTabs: ['WP'] },
  { term: 'Xᵢⱼ', symbol: 'xᵢⱼ', definition: 'Notasi nilai mentah satu sel di matriks keputusan awal (alternatif ke-i, kriteria ke-j), sebelum dinormalisasi.' },
  { term: 'Zero-Guard', definition: 'Mekanisme pengaman di WP yang mendeteksi nilai 0 pada kriteria Cost, karena secara matematis akan menghasilkan pembagian tak terhingga (Infinity) jika dibiarkan.', relatedTabs: ['WP'] },
];

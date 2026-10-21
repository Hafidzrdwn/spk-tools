import type { AiNarrativeRequest } from './types';

export function buildGeminiPrompt(request: AiNarrativeRequest): string {
  const { projectTitle, criteria, alternatives, rankings, activeMethods, budgetConstraint } = request;

  const criteriaSummary = criteria
    .map((c) => `- ${c.name} (Tipe: ${c.type}, Bobot: ${(c.normalizedWeight || c.weight || 0) * 100}%, Satuan: ${c.unit || '-'})`)
    .join('\n');

  const alternativeSummary = alternatives
    .map((a) => {
      const vals = criteria.map((c) => `${c.name}: ${a.values[c.id] ?? '-'}`).join(', ');
      return `- ${a.name} [${vals}]`;
    })
    .join('\n');

  const rankingSummary = activeMethods
    .map((m) => {
      const rList = rankings[m] ?? [];
      const ordered = [...rList].sort((a, b) => a.rank - b.rank);
      const str = ordered.map((r) => `#${r.rank} ${r.alternativeName} (skor: ${r.score.toFixed(4)})`).join(' -> ');
      return `Metode ${m.toUpperCase()}: ${str}`;
    })
    .join('\n');

  return `Kamu adalah Analis Sistem Pendukung Keputusan (SPK/MCDM) dan Konsultan Manajemen Senior.
Tugasmu adalah menganalisis perbandingan multi-metode (SAW, WP, TOPSIS) pada dataset keputusan berikut, lalu menyusun laporan narasi eksekutif profesional untuk dicetak ke dokumen resmi PDF.

DATASET KEPUTUSAN:
Judul Studi Kasus: "${projectTitle}"
Metode Aktif: ${activeMethods.map((m) => m.toUpperCase()).join(', ')}
${budgetConstraint ? `Batasan Anggaran Tersedia: ${budgetConstraint}\n` : ''}

Daftar Kriteria & Bobot:
${criteriaSummary}

Daftar Alternatif & Nilai Mentah:
${alternativeSummary}

Hasil Peringkat Antar Metode:
${rankingSummary}

INSTRUKSI PENULISAN:
Buatlah analisis dalam bahasa Indonesia yang runtut, berbasis data matematis riil, tajam, dan tidak bertele-tele.
PENTING: Jangan gunakan tanda baca em dash (— atau --), gunakan tanda koma atau tanda hubung biasa (-) sesuai kaidah bahasa Indonesia.
Kamu WAJIB mengembalikan output dalam format JSON murni (JSON valid tanpa markdown code block \`\`\`json) dengan 3 properti string berikut:

{
  "sectionA_rankingShifts": "Analisis pergeseran peringkat antar metode dan penyebab matematisnya. Sebutkan program/alternatif mana yang berubah peringkat dan mana yang tetap di peringkat 1. Jelaskan cara kedua/ketiga metode menggabungkan nilai kriteria (SAW linier aditif dapat menutupi nilai rendah, WP perkalian pangkat menghukum nilai rendah, TOPSIS jarak geometris). Sebutkan data kriteria spesifik alternatif yang memicu perbedaan tersebut, serta evaluasi jika selisih skor antar alternatif berdekatan.",
  
  "sectionB_methodValidity": "Jawaban tegas atas pertanyaan: 'Apakah salah satu metode salah?'. Berikan alasan ilmiah bahwa kedua metode dihitung dengan prosedur yang benar, perbedaannya berpijak pada asumsi komputasi, tidak ada peringkat absolut tunggal yang paling benar (SPK adalah alat bantu keputusan), serta sebutkan bahwa metode hanya salah jika terjadi galat prosedur (misal Cost diperlakukan Benefit).",
  
  "sectionC_recommendations": "Rekomendasi strategis pengambil keputusan. Gunakan format langkah aksi bernomor: 1. Prioritas pertama alternatif konsensus terbaik (sebutkan nama alternatif dan keunggulan utamanya); 2. Penggabungan urutan konsensus rata-rata peringkat; 3. Penyesuaian dengan kapasitas anggaran/operasional (alternatif mana yang didanai lebih dulu dan mana yang jadi Plan B); 4. Uji sensitivitas bobot pada peringkat berdekatan sebelum keputusan final ditetapkan."
}`;
}

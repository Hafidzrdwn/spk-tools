import type { AiNarrativeRequest } from './types';

export function buildGeminiPrompt(request: AiNarrativeRequest): string {
  const { projectTitle, criteria, alternatives, rankings, activeMethods, budgetConstraint, contextMetadata } = request;

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

  const contextSection = contextMetadata
    ? [
        'KONTEKS STUDI KASUS & STAKEHOLDER:',
        `- Institusi/Organisasi: ${contextMetadata.institutionOrOrg || 'Instansi Terkait'}`,
        `- Target Pemangku Kepentingan: ${contextMetadata.targetStakeholder || 'Pimpinan & Tim Pengambil Keputusan'}`,
        `- Bidang/Domain: ${contextMetadata.domainContext || 'Pengambilan Keputusan Manajerial'}`,
        contextMetadata.rawNarrativeSummary ? `- Ringkasan Latar Belakang: ${contextMetadata.rawNarrativeSummary}` : '',
        '',
      ].filter(Boolean).join('\n')
    : '';

  return `Kamu adalah Analis Sistem Pendukung Keputusan (SPK/MCDM) dan Konsultan Manajemen Eksekutif.
Tugasmu adalah menganalisis perbandingan multi-metode pada dataset keputusan berikut dan menyusun laporan ringkas, lugas, serta rekomendasi langkah aksi bernomor untuk pemangku kepentingan.

${contextSection}DATASET KEPUTUSAN:
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
1. GAYA BAHASA: Sangat ringkas, lugas, padat data, dan TIDAK BERTELE-TELE. Hindari paragraf panjang yang berulang-ulang.
2. DILARANG menggunakan tanda baca em dash ("—", "–", atau "--"), gunakan tanda koma atau tanda hubung spasi (" - ").
3. Output WAJIB dalam format JSON murni (tanpa tag markdown \`\`\`json) dengan 3 properti string:

{
  "sectionA_rankingShifts": "Ringkasan lugas (maksimal 2-3 kalimat): Sebutkan langsung alternatif mana yang bergeser atau bertahan di puncak konsensus, dan penyebab matematis intinya (kompensasi linier aditif SAW vs penalti eksponensial WP).",
  
  "sectionB_methodValidity": "Pernyataan validitas ringkas (maksimal 2 kalimat): Nyatakan secara tegas bahwa kedua metode valid secara matematis karena berangkat dari aksioma komputasi yang berbeda, serta tidak ada peringkat absolut tunggal dalam SPK.",
  
  "sectionC_recommendations": "Rekomendasi langkah aksi WAJIB dalam format POIN BERNOMOR (1., 2., 3., 4.), masing-masing 1-2 kalimat konkret dan mencantumkan peran pemangku kepentingan spesifik dalam kurung siku sesuai konteks dokumen (contoh: [Rektor / Pimpinan Lembaga], [Tim Anggaran / PIC Operasional], [Tim Pengadaan Teknis], [Tim Audit/Pakar]). Poin 1 wajib memuat rekomendasi prioritas utama alternatif teratas; Poin 2 urutan konsensus; Poin 3 mitigasi alternatif cadangan (Plan B); Poin 4 langkah verifikasi atau eksekusi sebelum kontrak."
}`;
}


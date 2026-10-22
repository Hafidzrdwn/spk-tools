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
  "sectionA_rankingShifts": "Analisis pergeseran peringkat dan implikasi trade-off strategis (maksimal 2-3 kalimat): Sebutkan langsung alternatif mana yang konsisten di puncak dan alternatif mana yang bergeser. Jelaskan alasan kausal berbasis trade-off manajerial (misal: satu alternatif unggul pada spesifikasi teknis namun terbebani biaya tinggi, sementara alternatif lain memimpin berkat efisiensi anggaran berimbang) serta dampaknya terhadap keputusan organisasi.",
  
  "sectionB_methodValidity": "Pertimbangan ketahanan keputusan dan objektivitas (maksimal 2 kalimat): Nyatakan bahwa perbedaan hasil antar metode bukanlah anomali, melainkan instrumen uji ketahanan (robustness check) dari dua sudut pandang berbeda (efisiensi berimbang agregat vs seleksi ketat tanpa toleransi defisit kritis), sehingga keputusan akhir terbukti tahan uji dan bebas bias tunggal.",
  
  "sectionC_recommendations": "Rekomendasi langkah aksi WAJIB dalam format POIN BERNOMOR (1., 2., 3., 4.). SETIAP POIN HARUS DITULIS DI BARIS BARU TERSENDIRI DENGAN ENTER/NEWLINE (\\n) (contoh:\\n1. [Rektor / Pimpinan Lembaga] ...\\n2. [Tim Anggaran / PIC Operasional] ...\\n3. [Tim Pengadaan Teknis] ...\\n4. [Tim Audit/Pakar] ...). Masing-masing 1-2 kalimat konkret dan mencantumkan peran pemangku kepentingan spesifik dalam kurung siku sesuai konteks dokumen. Poin 1 WAJIB MENJELASKAN ALASAN MENGAPA ALTERNATIF TERATAS DIPILIH (sebutkan nama kriteria unggulan dominan, perbandingan efisiensi biaya, dan rasionalitas dampaknya bagi institusi); Poin 2 pemanfaatan urutan konsensus untuk alokasi dana bertahap; Poin 3 justifikasi alternatif cadangan (Plan B) beserta kondisi pemicu peralihannya; Poin 4 langkah mitigasi teknis dan verifikasi audit sebelum penandatanganan kontrak final. JANGAN gabungkan seluruh poin dalam satu kalimat bersambung tanpa jeda baris baru."
}`;
}


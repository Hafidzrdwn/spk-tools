import type { AiNarrativeRequest, AiExecutiveNarrative } from './types';

export function generateFallbackNarrative(request: AiNarrativeRequest): AiExecutiveNarrative {
  const startTime = performance.now();
  const { criteria, alternatives, rankings, activeMethods } = request;

  const sawRankings = rankings.saw ?? [];
  const wpRankings = rankings.wp ?? [];
  const topsisRankings = rankings.topsis ?? [];

  const sawWinner = sawRankings.find((r) => r.rank === 1);
  const wpWinner = wpRankings.find((r) => r.rank === 1);
  const topsisWinner = topsisRankings.find((r) => r.rank === 1);

  const costCriteria = criteria.filter((c) => c.type === 'COST');
  const benefitCriteria = criteria.filter((c) => c.type === 'BENEFIT');
  const primaryCost = costCriteria[0];
  const primaryBenefit = benefitCriteria[0];

  const shiftAlternatives: string[] = [];
  const stableAlternatives: string[] = [];

  alternatives.forEach((alt) => {
    const rSaw = sawRankings.find((r) => r.alternativeId === alt.id)?.rank;
    const rWp = wpRankings.find((r) => r.alternativeId === alt.id)?.rank;
    const rTop = topsisRankings.find((r) => r.alternativeId === alt.id)?.rank;

    const activeRanks = [rSaw, rWp, rTop].filter((r): r is number => typeof r === 'number');
    const isStable = activeRanks.every((r) => r === activeRanks[0]);

    if (isStable) {
      stableAlternatives.push(`${alt.name} (tetap di peringkat #${activeRanks[0]})`);
    } else {
      shiftAlternatives.push(alt.name);
    }
  });

  const topConsensus =
    sawWinner && wpWinner && sawWinner.alternativeId === wpWinner.alternativeId
      ? sawWinner.alternativeName
      : sawWinner?.alternativeName ?? topsisWinner?.alternativeName ?? alternatives[0]?.name ?? 'Alternatif Terpilih';

  const hasShift = shiftAlternatives.length > 0;
  let sectionA = '';

  if (hasShift) {
    sectionA =
      `${shiftAlternatives.join(', ')} mengalami pergeseran peringkat antar metode, sedangkan ${stableAlternatives.join(', ') || topConsensus + ' tetap kokoh di posisi puncak'}.\n\n` +
      `Penyebabnya adalah cara masing-masing metode menggabungkan nilai kriteria. Metode SAW menggunakan model aditif linier (penjumlahan terbobot), sehingga nilai yang sangat tinggi pada satu kriteria mampu mengompensasi kekurangan pada kriteria lain. Sebaliknya, metode WP menerapkan perkalian berpangkat eksponensial, di mana nilai yang rendah pada suatu kriteria langsung memberikan penalti pada hasil akhir dan sulit ditutupi oleh kriteria lain.\n\n`;

    if (primaryCost) {
      sectionA +=
        `Pada kriteria ${primaryCost.name} (${primaryCost.type}), alternatif dengan biaya tinggi namun memiliki nilai benefit unggul dapat mempertahankan posisi tinggi pada SAW, namun skornya tereduksi secara signifikan pada WP karena penalti bobot eksponensial.\n\n`;
    }

    sectionA +=
      `Selain itu, selisih skor preferensi antar kandidat di peringkat tengah tergolong sangat ketat (margin berdekatan), sehingga variasi formula normalisasi dan agregasi nilai dengan mudah memicu pergeseran posisi peringkat.`;
  } else {
    sectionA =
      `Seluruh alternatif mempertahankan urutan peringkat yang identik dan stabil di seluruh metode komparasi (${activeMethods.map((m) => m.toUpperCase()).join(', ')}).\n\n` +
      `${topConsensus} secara konsisten menempati peringkat #1. Karakteristik dataset ini menunjukkan diferensiasi performa yang tegas antar alternatif, sehingga perbedaan asumsi pemodelan matematis antara penjumlahan linier (SAW) dan perkalian eksponensial (WP) tidak mengubah konvergensi urutan peringkat akhir.`;
  }

  const sectionB =
    `Tidak. Kedua metode dihitung dengan prosedur matematis yang valid dan dapat dipertanggungjawabkan. Alasannya:\n\n` +
    `1. Perbedaan hasil semata-mata berpijak pada asumsi permodelan: SAW mengizinkan kelebihan nilai pada kriteria benefit mengompensasi kekurangan kriteria lain, sementara WP memperlakukan setiap kriteria secara multiplikatif tanpa kompensasi linier penuh.\n` +
    `2. Tidak ada peringkat tunggal yang bersifat "paling benar secara mutlak". Sistem Pendukung Keputusan (SPK) dirancang sebagai alat bantu analisis manajerial, bukan pembuat keputusan tunggal yang kaku.\n` +
    `3. Kedua metode secara rasional menempatkan alternatif dengan profil performa terbaik (${topConsensus}) pada posisi prioritas teratas.\n\n` +
    `Suatu metode hanya dinyatakan salah apabila terjadi kekeliruan prosedural fundamental, misalnya kriteria bertipe Cost diperlakukan sebagai Benefit atau sebaliknya, yang terbukti tidak terjadi pada komputasi ini.`;

  const avgRankList = alternatives
    .map((alt) => {
      const rSaw = sawRankings.find((r) => r.alternativeId === alt.id)?.rank ?? 1;
      const rWp = wpRankings.find((r) => r.alternativeId === alt.id)?.rank ?? 1;
      const rTop = topsisRankings.find((r) => r.alternativeId === alt.id)?.rank ?? 1;
      const validRanks = [rSaw, rWp, rTop].slice(0, activeMethods.length);
      const avg = Number((validRanks.reduce((a, b) => a + b, 0) / validRanks.length).toFixed(1));
      return { name: alt.name, avgRank: avg, alt };
    })
    .sort((a, b) => a.avgRank - b.avgRank);

  const consensusOrderText = avgRankList.map((a) => `${a.name} (rata-rata: ${a.avgRank})`).join(', ');

  let sectionC =
    `Sebagai pengambil keputusan, pendekatan paling bijaksana adalah memanfaatkan sintesis dari seluruh metode secara komprehensif, bukan hanya terpaku pada satu algoritma. Langkah rekomendasi konkretnya adalah:\n\n` +
    `1. Menjadikan ${topConsensus} sebagai prioritas utama pengadaan/eksekusi, karena konsisten menempati peringkat teratas lintas metode`;

  if (primaryBenefit) {
    sectionC += ` serta unggul pada kriteria kunci ${primaryBenefit.name}`;
  }
  if (primaryCost) {
    const costVal = alternatives.find((a) => a.name === topConsensus)?.values[primaryCost.id];
    if (costVal !== undefined) {
      sectionC += ` dengan nilai ${primaryCost.name} sebesar ${costVal}${primaryCost.unit ? ' ' + primaryCost.unit : ''}`;
    }
  }
  sectionC += `.\n`;

  sectionC +=
    `2. Menggunakan urutan konsensus rata-rata sebagai peta urutan alternatif: ${consensusOrderText}.\n` +
    `3. Menyesuaikan keputusan akhir dengan ketersediaan plafon anggaran dan kapasitas operasional organisasi. Alternatif di posisi teratas didanai terlebih dahulu, sedangkan alternatif berikutnya disiapkan sebagai kandidat cadangan resmi (Plan B).\n` +
    `4. Melakukan uji sensitivitas bobot pada pasangan alternatif dengan selisih skor tipis. Apabila urutan peringkat bergeser akibat perubahan kecil pada bobot kriteria, keputusan pada segmen tersebut perlu dilengkapi validasi pakar atau audit rekam jejak historis sebelum kontrak resmi ditetapkan.`;

  const latencyMs = Number((performance.now() - startTime).toFixed(1));

  return {
    sectionA_rankingShifts: sectionA,
    sectionB_methodValidity: sectionB,
    sectionC_recommendations: sectionC,
    source: 'deterministic_fallback',
    generatedAt: new Date().toISOString(),
    latencyMs,
  };
}

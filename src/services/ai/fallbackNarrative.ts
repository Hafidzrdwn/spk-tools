import type { AiNarrativeRequest, AiExecutiveNarrative } from './types';

export function generateFallbackNarrative(request: AiNarrativeRequest): AiExecutiveNarrative {
  const startTime = performance.now();
  const { criteria, alternatives, rankings, activeMethods, contextMetadata } = request;

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
    const isStable = activeRanks.length > 0 && activeRanks.every((r) => r === activeRanks[0]);

    if (isStable) {
      stableAlternatives.push(alt.name);
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
      `Kandidat ${topConsensus} kokoh menempati peringkat teratas lintas metode, sementara variasi posisi terjadi pada ${shiftAlternatives.slice(0, 3).join(', ')}. ` +
      `Dinamika ini dipicu oleh formula matematis: metode SAW menerapkan penjumlahan terbobot linier yang mengizinkan keunggulan suatu kriteria menutupi kelemahan kriteria lain, sedangkan metode WP menerapkan perkalian eksponensial yang memberikan penalti tegas pada nilai kriteria rendah.`;
  } else {
    sectionA =
      `Seluruh kandidat mempertahankan urutan peringkat yang identik dan stabil di seluruh metode komparasi (${activeMethods.map((m) => m.toUpperCase()).join(', ')}). ` +
      `${topConsensus} secara konsisten menempati peringkat #1 berkat keunggulan terukur pada seluruh kriteria evaluasi tanpa terpengaruh perbedaan aksioma matematis antar metode.`;
  }

  const sectionB =
    `Tidak ada metode yang keliru. Seluruh metode komparasi terbukti valid dan dihitung sesuai kaidah prosedural yang benar. ` +
    `Perbedaan urutan semata-mata berpijak pada asumsi agregasi matematis masing-masing algoritma, dan tidak ada peringkat absolut tunggal karena SPK dirancang sebagai instrumen pendukung keputusan manajerial.`;


  const avgRankList = alternatives
    .map((alt) => {
      const rSaw = sawRankings.find((r) => r.alternativeId === alt.id)?.rank ?? 1;
      const rWp = wpRankings.find((r) => r.alternativeId === alt.id)?.rank ?? 1;
      const rTop = topsisRankings.find((r) => r.alternativeId === alt.id)?.rank ?? 1;
      const validRanks = [rSaw, rWp, rTop].slice(0, Math.max(1, activeMethods.length));
      const avg = Number((validRanks.reduce((a, b) => a + b, 0) / validRanks.length).toFixed(1));
      return { name: alt.name, avgRank: avg, alt };
    })
    .sort((a, b) => a.avgRank - b.avgRank);

  const consensusOrderText = avgRankList.map((a) => `${a.name} (rata-rata: ${a.avgRank})`).join(', ');

  const leaderTag = contextMetadata?.targetStakeholder
    ? `[${contextMetadata.targetStakeholder}]`
    : '[Pimpinan Lembaga / Pengambil Keputusan]';
  const opTag = contextMetadata?.institutionOrOrg
    ? `[Tim Anggaran & PIC ${contextMetadata.institutionOrOrg}]`
    : '[Tim Anggaran & PIC Operasional]';
  const techTag = '[Tim Teknis / Panitia Pengadaan]';
  const auditTag = '[Tim Evaluasi & Audit Internal]';

  let benefitCostNote = '';
  if (primaryBenefit) {
    benefitCostNote += ` dengan keunggulan pada kriteria ${primaryBenefit.name}`;
  }
  if (primaryCost) {
    const costVal = alternatives.find((a) => a.name === topConsensus)?.values[primaryCost.id];
    if (costVal !== undefined) {
      benefitCostNote += ` serta efisiensi ${primaryCost.name} sebesar ${costVal}${primaryCost.unit ? ' ' + primaryCost.unit : ''}`;
    }
  }

  const planBAlt = avgRankList[1]?.name || 'alternatif peringkat kedua';

  const sectionC = [
    `1. ${leaderTag}: Menetapkan ${topConsensus} sebagai keputusan prioritas utama pengadaan/eksekusi${benefitCostNote}.`,
    `2. ${opTag}: Memanfaatkan urutan konsensus rata-rata (${consensusOrderText}) sebagai acuan alokasi pendanaan bertahap, dan memposisikan ${planBAlt} sebagai cadangan resmi (Plan B).`,
    `3. ${techTag}: Melakukan verifikasi spesifikasi teknis dan negosiasi kontrak dengan vendor/pelaksana terpilih sebelum penandatanganan dokumen final.`,
    `4. ${auditTag}: Menguji sensitivitas bobot pada pasangan kriteria dengan selisih skor tipis guna memitigasi risiko fluktuasi parameter operasional.`,
  ].join('\n');

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


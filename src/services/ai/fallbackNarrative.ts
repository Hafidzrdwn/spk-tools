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
      `Kandidat ${topConsensus} kokoh menempati peringkat teratas konsensus, sementara pergeseran posisi pada ${shiftAlternatives.slice(0, 3).join(', ')} merefleksikan trade-off manajerial yang nyata. ` +
      `Perbedaan hasil antara metode agregasi linear (SAW) dan penalti multiplikatif (WP) terjadi karena alternatif tertentu unggul pada spesifikasi teknis namun terbebani biaya tinggi, sedangkan alternatif lainnya menawarkan efisiensi anggaran berimbang. Pimpinan disarankan mempertimbangkan prioritas antara penghematan biaya jangka pendek atau ketahanan mutu layanan jangka panjang.`;
  } else {
    sectionA =
      `Seluruh kandidat mempertahankan urutan peringkat yang identik dan stabil di seluruh metode komparasi (${activeMethods.map((m) => m.toUpperCase()).join(', ')}). ` +
      `${topConsensus} secara konsisten menempati peringkat #1 berkat profil performa yang seimbang antara keunggulan manfaat dan efisiensi biaya, membuktikan ketahanannya dari berbagai sudut pandang evaluasi.`;
  }

  const sectionB =
    `Tidak ada metode yang keliru. Perbedaan urutan antar metode bukanlah anomali, melainkan instrumen uji ketahanan keputusan (robustness check). ` +
    `Evaluasi multi-metode menguji setiap opsi dari dua perspektif kritis: efisiensi berimbang agregat (SAW) serta seleksi ketat tanpa toleransi kelemahan kritis (WP), sehingga opsi yang bertahan di puncak terbukti objektif dan minim risiko bias.`;

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

  let causalReason = '';
  if (primaryBenefit && primaryCost) {
    const costVal = alternatives.find((a) => a.name === topConsensus)?.values[primaryCost.id];
    const benefitVal = alternatives.find((a) => a.name === topConsensus)?.values[primaryBenefit.id];
    const bStr = benefitVal !== undefined ? ` (skor: ${benefitVal}${primaryBenefit.unit ? ' ' + primaryBenefit.unit : ''})` : '';
    const cStr = costVal !== undefined ? ` sebesar ${costVal}${primaryCost.unit ? ' ' + primaryCost.unit : ''}` : '';
    causalReason = ` karena terbukti unggul dominan pada kriteria ${primaryBenefit.name}${bStr} dengan beban efisiensi ${primaryCost.name}${cStr}, sehingga memberikan rasio manfaat-biaya tertinggi dan risiko operasional paling terkendali bagi institusi`;
  } else if (primaryBenefit) {
    const benefitVal = alternatives.find((a) => a.name === topConsensus)?.values[primaryBenefit.id];
    const bStr = benefitVal !== undefined ? ` sebesar ${benefitVal}${primaryBenefit.unit ? ' ' + primaryBenefit.unit : ''}` : '';
    causalReason = ` karena unggul dominan pada kriteria prioritas ${primaryBenefit.name}${bStr} yang menjadi tolok ukur utama keberhasilan program`;
  } else if (primaryCost) {
    const costVal = alternatives.find((a) => a.name === topConsensus)?.values[primaryCost.id];
    const cStr = costVal !== undefined ? ` sebesar ${costVal}${primaryCost.unit ? ' ' + primaryCost.unit : ''}` : '';
    causalReason = ` karena menawarkan efisiensi anggaran paling optimal pada kriteria ${primaryCost.name}${cStr} yang melindungi likuiditas pembiayaan`;
  } else {
    causalReason = ` karena mencapai konsensus skor preferensi tertinggi secara konsisten lintas metode evaluasi`;
  }

  const planBAlt = avgRankList[1]?.name || 'alternatif peringkat kedua';

  const sectionC = [
    `1. ${leaderTag}: Menetapkan ${topConsensus} sebagai keputusan prioritas utama pengadaan/eksekusi${causalReason}.`,
    `2. ${opTag}: Memanfaatkan urutan konsensus rata-rata (${consensusOrderText}) sebagai peta jalan alokasi anggaran bertahap, dan memposisikan ${planBAlt} sebagai cadangan resmi (Plan B) jika kuota pembiayaan mengalami penyesuaian.`,
    `3. ${techTag}: Melakukan verifikasi spesifikasi teknis mendalam dan negosiasi jaminan layanan sebelum penandatanganan dokumen kontrak definitif.`,
    `4. ${auditTag}: Menguji sensitivitas parameter biaya terhadap dinamika harga pasar guna memastikan stabilitas keputusan tetap kokoh sepanjang masa kontrak.`,
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


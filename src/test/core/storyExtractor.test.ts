import { describe, it, expect } from 'vitest';
import {
  extractMatrixFromStoryText,
  buildFallbackStoryResult,
  buildStoryExtractionPrompt,
} from '@/services/ai/storyExtractorService';

describe('Story-to-Matrix Intelligent Extractor', () => {
  const himasifoCase = `HIMASIFO memiliki anggaran sebesar Rp15.000.000 untuk menentukan prioritas program kerja selama satu periode kepengurusan. Terdapat lima usulan kegiatan, yaitu seminar nasional teknologi dengan anggaran Rp5.000.000 dan target 200 peserta, pelatihan pengembangan web dengan anggaran Rp3.000.000 dan target 60 peserta, kompetisi inovasi mahasiswa dengan anggaran Rp4.500.000 dan target 100 peserta, pengabdian masyarakat dengan anggaran Rp2.500.000 dan target 80 peserta, serta malam keakraban mahasiswa dengan anggaran Rp6.000.000 dan target 150 peserta. Setiap kegiatan memiliki tingkat urgensi, manfaat bagi mahasiswa, kesesuaian dengan tujuan himpunan, dan tingkat kesulitan pelaksanaan yang berbeda.`;

  it('membangun prompt ekstraksi matriks dengan instruksi SPK terstruktur', () => {
    const prompt = buildStoryExtractionPrompt(himasifoCase);
    expect(prompt).toContain('HIMASIFO');
    expect(prompt).toContain('COST');
    expect(prompt).toContain('BENEFIT');
    expect(prompt).toContain('projectTitle');
  });

  it('mengekstrak studi kasus HIMASIFO menjadi 5 alternatif dan kriteria seimbang', async () => {
    const result = await extractMatrixFromStoryText(himasifoCase, '');

    expect(result.alternatives.length).toBe(5);
    expect(result.criteria.length).toBeGreaterThanOrEqual(2);

    const altNames = result.alternatives.map((a) => a.name.toLowerCase());
    expect(altNames.some((n) => n.includes('seminar'))).toBe(true);
    expect(altNames.some((n) => n.includes('pelatihan'))).toBe(true);
    expect(altNames.some((n) => n.includes('kompetisi'))).toBe(true);

    const costCrit = result.criteria.find((c) => c.type === 'COST');
    expect(costCrit).toBeDefined();

    const sumNorm = result.criteria.reduce((acc, c) => acc + c.normalizedWeight, 0);
    expect(sumNorm).toBeCloseTo(1, 2);

    for (const alt of result.alternatives) {
      for (const crit of result.criteria) {
        expect(typeof alt.values[crit.id]).toBe('number');
        expect(alt.values[crit.id]).toBeGreaterThan(0);
      }
    }

    if (result.contextMetadata) {
      expect(result.contextMetadata.institutionOrOrg || result.contextMetadata.targetStakeholder).toBeTruthy();
    }
  });

  it('menghasilkan alternatif minimal dan fallback terstruktur untuk teks ringkas', async () => {
    const briefCase = `Tim marketing memiliki 3 kandidat influencer: Influencer A dengan tarif 5 juta dan 100k followers, Influencer B dengan tarif 8 juta dan 250k followers, Influencer C dengan tarif 3 juta dan 40k followers.`;
    const result = await extractMatrixFromStoryText(briefCase, '');

    expect(result.alternatives.length).toBe(3);
    expect(result.criteria.length).toBeGreaterThanOrEqual(2);

    for (const alt of result.alternatives) {
      for (const crit of result.criteria) {
        expect(typeof alt.values[crit.id]).toBe('number');
      }
    }
  });

  it('buildFallbackStoryResult memetakan institusi HIMASIFO dan batasan anggaran', () => {
    const res = buildFallbackStoryResult(himasifoCase);
    expect(res.projectTitle).toContain('HIMASIFO');
    expect(res.budgetConstraint).toBe(15000000);
    expect(res.contextMetadata?.institutionOrOrg).toBe('HIMASIFO');
    expect(res.alternatives.length).toBe(5);
  });

  it('resetProject membersihkan story raw text pada localStorage dan mereset story mode', async () => {
    const { useProjectStore } = await import('@/store/useProjectStore');
    const { useUiStore } = await import('@/store/useUiStore');

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('decisigraph_story_raw_text', 'Teks cerita lama yang tidak boleh tertinggal');
    }
    useUiStore.getState().setStoryMode('form');
    useUiStore.getState().setStoryHasExtracted(true);

    useProjectStore.getState().resetProject();

    if (typeof localStorage !== 'undefined') {
      expect(localStorage.getItem('decisigraph_story_raw_text')).toBeNull();
    }
    expect(useUiStore.getState().storyMode).toBe('story');
    expect(useUiStore.getState().storyHasExtracted).toBe(false);
    expect(useProjectStore.getState().criteria.length).toBe(0);
    expect(useProjectStore.getState().alternatives.length).toBe(0);
  });
});

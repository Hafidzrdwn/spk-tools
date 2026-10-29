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

  it('mengekstrak studi kasus kompleks Bali DigiFest dengan 3 alternatif dan 6 kriteria berbobot secara akurat', async () => {
    const baliDigiFestStory = `Pemilihan proyek MVP untuk lomba AI Web Innovation Challenge Bali DigiFest 2026 kategori Mahasiswa secara individu dalam batas waktu 8 hari (29 Oktober – 7 November 2026) mengevaluasi 3 Alternatif Proyek, yaitu A1 (SirkularBali AI – kategori Bali Smart Society) berupa web klasifikasi sampah berbasis Computer Vision serta manajemen angkut TPS3R dan kalkulator ESG, A2 (KriyaLokal AI – kategori Business & MSME Digitalization) berupa platform pembuat katalog digital budaya multi-bahasa dari input suara dan foto produk beserta RAG Chatbot untuk UMKM, serta A3 (AksaraDwipa AI – kategori Education & Smart Information Systems) berupa web evaluasi tulis tangan Aksara Bali di atas Canvas dengan OCR Vision dan tutor bahasa daerah. Penilaian menggunakan 6 Kriteria yang diadaptasi dari rubrik resmi Tahap 1 dengan total bobot 100% (1.00), meliputi: C1 (AI Relevance & Implementation) dengan bobot 0.25 (25%) bertipe Benefit yang menilai kedalaman integrasi AI pada fungsi utama; C2 (Problem Relevance & Impact) dengan bobot 0.20 (20%) bertipe Benefit yang menilai urgensi masalah nyata di Bali dan dampak solusinya; C3 (MVP Functionality & Reliability) dengan bobot 0.20 (20%) bertipe Benefit yang menilai kestabilan fungsi utama saat diuji langsung oleh juri; C4 (Innovation & Differentiation) dengan bobot 0.15 (15%) bertipe Benefit yang menilai keunikan produk dibanding solusi manual/existing; C5 (Technical Feasibility & Kecepatan Eksekusi Solo 8 Hari) dengan bobot 0.15 (15%) bertipe Benefit yang menilai kelayakan arsitektur serta ketercapaian pembuatan MVP + dokumentasi GitHub secara individu sebelum tenggat waktu; serta C6 (Risiko Error AI & Beban Kepatuhan/Kompleksitas Sistem) dengan bobot 0.05 (5%) bertipe Cost yang mengukur potensi kegagalan atau halusinasi model saat verifikasi teknis dan kerumitan pemenuhan syarat kelengkapan dokumen. Berdasarkan analisis kondisi pengerjaan dari nol dalam 8 hari oleh 1 orang, matriks nilai masing-masing alternatif pada skala 1–100 adalah: Alternatif A1 (SirkularBali AI) memperoleh skor C1 = 85, C2 = 92, C3 = 95, C4 = 78, C5 = 94, dan C6 = 20; Alternatif A2 (KriyaLokal AI) memperoleh skor C1 = 95, C2 = 90, C3 = 85, C4 = 88, C5 = 75, dan C6 = 55; sedangkan Alternatif A3 (AksaraDwipa AI) memperoleh skor C1 = 88, C2 = 85, C3 = 65, C4 = 95, C5 = 60, dan C6 = 80.`;

    const result = await extractMatrixFromStoryText(baliDigiFestStory, '');

    expect(result.alternatives.length).toBe(3);
    expect(result.criteria.length).toBe(6);

    const altNames = result.alternatives.map((a) => a.name);
    expect(altNames.some((n) => n.includes('SirkularBali'))).toBe(true);
    expect(altNames.some((n) => n.includes('KriyaLokal'))).toBe(true);
    expect(altNames.some((n) => n.includes('AksaraDwipa'))).toBe(true);

    const costCrit = result.criteria.find((c) => c.type === 'COST');
    expect(costCrit).toBeDefined();
    expect(costCrit?.name).toContain('C6');

    const sumNorm = result.criteria.reduce((acc, c) => acc + c.normalizedWeight, 0);
    expect(sumNorm).toBeCloseTo(1, 2);

    const a1 = result.alternatives.find((a) => a.name.includes('SirkularBali'))!;
    const c1 = result.criteria.find((c) => c.name.includes('C1'))!;
    const c6 = result.criteria.find((c) => c.name.includes('C6'))!;
    expect(a1.values[c1.id]).toBe(85);
    expect(a1.values[c6.id]).toBe(20);

    const a2 = result.alternatives.find((a) => a.name.includes('KriyaLokal'))!;
    expect(a2.values[c1.id]).toBe(95);

    const a3 = result.alternatives.find((a) => a.name.includes('AksaraDwipa'))!;
    expect(a3.values[c1.id]).toBe(88);
  });
});

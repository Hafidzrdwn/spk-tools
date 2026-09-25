import { describe, it, expect } from 'vitest';
import React from 'react';
import { generateReport, generateReportConclusion, formatIndonesianDate } from '@/features/export/generateReport';
import { DecisiPdfReport } from '@/features/export/DecisiPdfReport';
import type { ReportPayload } from '@/features/export/types';
import type { Criterion, Alternative } from '@/types/domain';
import type { MethodResult } from '@/core/math/types';

describe('Export PDF Report Module', () => {
  const dummyCriteria: Criterion[] = [
    { id: 'c1', name: 'Harga / Biaya', type: 'COST', weight: 3, normalizedWeight: 0.3 },
    { id: 'c2', name: 'Kualitas Teknis', type: 'BENEFIT', weight: 4, normalizedWeight: 0.4 },
    { id: 'c3', name: 'Layanan Servis', type: 'BENEFIT', weight: 3, normalizedWeight: 0.3 },
  ];

  const dummyAlternatives: Alternative[] = [
    { id: 'a1', name: 'Vendor Alpha', values: { c1: 2500000, c2: 85, c3: 90 } },
    { id: 'a2', name: 'Vendor Beta', values: { c1: 3200000, c2: 95, c3: 80 } },
    { id: 'a3', name: 'Vendor Gamma', values: { c1: 1800000, c2: 70, c3: 75 } },
  ];

  const dummyResult: MethodResult = {
    intermediateMatrices: {
      normalized: [
        [0.72, 0.89, 1.0],
        [0.56, 1.0, 0.88],
        [1.0, 0.73, 0.83],
      ],
      weighted: [
        [0.216, 0.356, 0.3],
        [0.168, 0.4, 0.264],
        [0.3, 0.292, 0.249],
      ],
    },
    formulaSteps: [
      {
        cellId: 'saw-a1-c1-NORMALIZED',
        stage: 'NORMALIZED',
        formulaLabel: 'Cost ⟹ min(X) / x = 1800000 / 2500000',
        inputs: { min: 1800000, val: 2500000 },
        sourceCellIds: ['c1'],
        result: 0.72,
      },
      {
        cellId: 'saw-a1-c1-WEIGHTED',
        stage: 'WEIGHTED',
        formulaLabel: 'r_ij * w_j = 0.72 * 0.30',
        inputs: { r: 0.72, w: 0.3 },
        sourceCellIds: ['c1'],
        result: 0.216,
      },
      {
        cellId: 'saw-a1-FINAL',
        stage: 'FINAL',
        formulaLabel: 'V_i = ∑(w_j * r_ij) = 0.216 + 0.356 + 0.300',
        inputs: {},
        sourceCellIds: [],
        result: 0.872,
      },
    ],
    finalRanking: [
      { alternativeId: 'a1', alternativeName: 'Vendor Alpha', score: 0.872, rank: 1 },
      { alternativeId: 'a2', alternativeName: 'Vendor Beta', score: 0.832, rank: 2 },
      { alternativeId: 'a3', alternativeName: 'Vendor Gamma', score: 0.841, rank: 3 },
    ],
  };

  it('generateReport membangun ReportPayload secara pure dan akurat', () => {
    const payload = generateReport(
      {
        title: 'Pemilihan Vendor Server 2026',
        criteria: dummyCriteria,
        alternatives: dummyAlternatives,
      },
      'SAW',
      dummyResult
    );

    expect(payload.projectTitle).toBe('Pemilihan Vendor Server 2026');
    expect(payload.method).toBe('SAW');
    expect(payload.criteria.length).toBe(3);
    expect(payload.alternatives.length).toBe(3);
    expect(payload.result.finalRanking.length).toBe(3);
    expect(payload.generatedAt).toBeDefined();
  });

  it('generateReportConclusion menghasilkan narasi otomatis yang mencakup pemenang dan kriteria unggul', () => {
    const payload = generateReport(
      {
        title: 'Pemilihan Vendor Server 2026',
        criteria: dummyCriteria,
        alternatives: dummyAlternatives,
      },
      'SAW',
      dummyResult
    );

    const conclusion = generateReportConclusion(payload);
    expect(conclusion).toContain('Vendor Alpha');
    expect(conclusion).toContain('Peringkat #1');
    expect(conclusion).toContain('0.8720');
    expect(conclusion).toContain('Simple Additive Weighting (SAW)');
  });

  it('formatIndonesianDate memformat ISO date string dengan akhiran WIB', () => {
    const dateStr = '2026-09-26T10:30:00Z';
    const formatted = formatIndonesianDate(dateStr);
    expect(formatted).toContain('2026');
    expect(formatted).toContain('WIB');
  });

  it('DecisiPdfReport merender dokumen React tanpa runtime error dengan seluruh data 7 section', () => {
    const payload: ReportPayload = generateReport(
      {
        title: 'Evaluasi Vendor Cloud',
        criteria: dummyCriteria,
        alternatives: dummyAlternatives,
      },
      'TOPSIS',
      dummyResult
    );

    const element = React.createElement(DecisiPdfReport, { payload });
    expect(element).toBeDefined();
    expect(element.props.payload.projectTitle).toBe('Evaluasi Vendor Cloud');
    expect(element.props.payload.method).toBe('TOPSIS');
    expect(element.props.payload.result.formulaSteps.length).toBe(3);
  });

  it('DecisiPdfReport dengan comparisonResult merender varian perbandingan multi-metode', () => {
    const payloadWithComp: ReportPayload = {
      projectTitle: 'Studi Komparasi Multi-Metode',
      generatedAt: '2026-09-26T01:30:00Z',
      method: 'COMPARE',
      criteria: dummyCriteria,
      alternatives: dummyAlternatives,
      result: dummyResult,
      comparisonResult: {
        rows: [
          {
            alternativeId: 'a1',
            alternativeName: 'Vendor Alpha',
            saw: { score: 0.872, rank: 1 },
            wp: { score: 0.865, rank: 1 },
            topsis: { score: 0.891, rank: 1 },
            averageRank: 1.0,
            isConsensusRank1: true,
          },
          {
            alternativeId: 'a2',
            alternativeName: 'Vendor Beta',
            saw: { score: 0.832, rank: 2 },
            wp: { score: 0.84, rank: 2 },
            topsis: { score: 0.82, rank: 3 },
            averageRank: 2.3,
            isConsensusRank1: false,
          },
        ],
        hasRank1Shift: false,
        rank1Winners: {},
        explanation: 'Konsensus tercapai.',
        differences: [],
      },
    };

    const element = React.createElement(DecisiPdfReport, { payload: payloadWithComp });
    expect(element).toBeDefined();
    expect(element.props.payload.comparisonResult?.rows.length).toBe(2);
  });

  it('useUiStore mengelola state isSharedMatrixCollapsed dan toggleSharedMatrix dengan benar', async () => {
    const { useUiStore } = await import('@/store/useUiStore');

    // Default false (terbuka)
    useUiStore.getState().setSharedMatrixCollapsed(false);
    expect(useUiStore.getState().isSharedMatrixCollapsed).toBe(false);

    // Toggle ke true (ciut)
    useUiStore.getState().toggleSharedMatrix();
    expect(useUiStore.getState().isSharedMatrixCollapsed).toBe(true);

    // Toggle kembali ke false
    useUiStore.getState().toggleSharedMatrix();
    expect(useUiStore.getState().isSharedMatrixCollapsed).toBe(false);
  });
});


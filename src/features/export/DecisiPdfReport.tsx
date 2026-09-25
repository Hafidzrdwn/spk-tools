import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ReportPayload } from './types';
import {
  formatIndonesianDate,
  getMethodFullName,
  generateReportConclusion,
} from './generateReport';
import type { TraceStep } from '@/core/math/types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#334155',
    backgroundColor: '#FFFFFF',
  },
  // Section 1: Cover Header
  headerContainer: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#4F46E5',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  brandBadgeText: {
    color: '#4338CA',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  generatedDateText: {
    fontSize: 8,
    color: '#64748B',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  methodBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  methodBadge: {
    backgroundColor: '#4F46E5',
    borderRadius: 4,
    paddingVertical: 2.5,
    paddingHorizontal: 7,
  },
  methodBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
  methodSubtitle: {
    fontSize: 8.5,
    color: '#64748B',
  },

  // Section Headers
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.8,
    borderBottomColor: '#E2E8F0',
  },

  // Table Utilities
  table: {
    borderWidth: 0.8,
    borderColor: '#CBD5E1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.8,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
    minHeight: 20,
  },
  tableRowHeader: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
  },
  tableRowAlternate: {
    backgroundColor: '#FAFAFA',
  },
  tableRowWinner: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  tableCellHeader: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
    padding: 4.5,
  },
  tableCell: {
    fontSize: 8,
    color: '#334155',
    padding: 4.5,
  },

  // Badges
  benefitBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
    borderRadius: 3,
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    alignSelf: 'flex-start',
  },
  benefitText: {
    color: '#047857',
    fontSize: 7,
    fontWeight: 'bold',
  },
  costBadge: {
    backgroundColor: '#FFF1F2',
    borderWidth: 0.5,
    borderColor: '#FECDD3',
    borderRadius: 3,
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    alignSelf: 'flex-start',
  },
  costText: {
    color: '#BE123C',
    fontSize: 7,
    fontWeight: 'bold',
  },
  rank1Badge: {
    backgroundColor: '#10B981',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignSelf: 'flex-start',
  },
  rank1BadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: 'bold',
  },

  // Section 4: Formula Steps
  stepCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    borderRadius: 3,
    padding: 6,
    marginBottom: 5,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  stepStageName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#4338CA',
    textTransform: 'uppercase',
  },
  stepFormula: {
    fontSize: 8,
    fontFamily: 'Courier',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    padding: 4,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 2,
    marginVertical: 2,
  },
  stepResultText: {
    fontSize: 7.5,
    color: '#64748B',
    marginTop: 2,
  },
  stepNoteText: {
    fontSize: 7.5,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Section 6: Kesimpulan Otomatis
  conclusionCard: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3.5,
    borderLeftColor: '#4F46E5',
    borderTopWidth: 0.8,
    borderRightWidth: 0.8,
    borderBottomWidth: 0.8,
    borderColor: '#E2E8F0',
    borderRadius: 3,
    padding: 10,
  },
  conclusionParagraph: {
    fontSize: 8.5,
    color: '#1E293B',
    lineHeight: 1.45,
    textAlign: 'justify',
  },

  // Section 7: Footer Tiap Halaman
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.8,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
  },
  footerCopyright: {
    fontSize: 7.5,
    color: '#64748B',
  },
  footerPage: {
    fontSize: 7.5,
    color: '#64748B',
    fontWeight: 'bold',
  },
});

export interface DecisiPdfReportProps {
  payload: ReportPayload;
}

export const DecisiPdfReport: React.FC<DecisiPdfReportProps> = ({ payload }) => {
  const currentYear = new Date().getFullYear();
  const indonesianDate = formatIndonesianDate(payload.generatedAt);
  const methodFullName = getMethodFullName(payload.method);
  const narrativeConclusion = generateReportConclusion(payload);

  // Ambil 1 representasi contoh sel per tahap (formulaSteps)
  const representativeSteps: TraceStep[] = [];
  const seenStages = new Set<string>();
  for (const step of payload.result.formulaSteps || []) {
    if (!seenStages.has(step.stage)) {
      seenStages.add(step.stage);
      representativeSteps.push(step);
    }
  }

  // Hitung pembagian lebar kolom untuk tabel matriks awal
  const critCount = Math.max(1, payload.criteria.length);
  const altColWidthPercent = 30;
  const critColWidthPercent = (100 - altColWidthPercent) / critCount;

  return (
    <Document
      title={`Laporan SPK - ${payload.projectTitle}`}
      author="DecisiGraph"
      subject={`Laporan Analisis Metode ${payload.method}`}
    >
      <Page size="A4" style={styles.page}>
        {/* ===================================================================
            SECTION 1: COVER / HEADER
        ==================================================================== */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>Dibuat dengan DecisiGraph</Text>
            </View>
            <Text style={styles.generatedDateText}>{indonesianDate}</Text>
          </View>

          <Text style={styles.projectTitle}>{payload.projectTitle}</Text>

          <View style={styles.methodBadgeRow}>
            <View style={styles.methodBadge}>
              <Text style={styles.methodBadgeText}>Metode: {payload.method}</Text>
            </View>
            <Text style={styles.methodSubtitle}>{methodFullName}</Text>
          </View>
        </View>

        {/* ===================================================================
            SECTION 2: RINGKASAN KRITERIA
        ==================================================================== */}
        <View style={styles.sectionContainer} wrap={false}>
          <Text style={styles.sectionTitle}>2. Ringkasan Kriteria Evaluasi</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableRowHeader]}>
              <Text style={[styles.tableCellHeader, { width: '8%', textAlign: 'center' }]}>No</Text>
              <Text style={[styles.tableCellHeader, { width: '42%' }]}>Nama Kriteria</Text>
              <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'center' }]}>Tipe</Text>
              <Text style={[styles.tableCellHeader, { width: '15%', textAlign: 'right' }]}>Bobot Mentah</Text>
              <Text style={[styles.tableCellHeader, { width: '15%', textAlign: 'right' }]}>Normalisasi</Text>
            </View>

            {payload.criteria.map((crit, idx) => {
              const isEven = idx % 2 === 1;
              const normalizedPct = (crit.normalizedWeight * 100).toFixed(1) + '%';
              return (
                <View
                  key={crit.id}
                  style={[styles.tableRow, isEven ? styles.tableRowAlternate : {}]}
                >
                  <Text style={[styles.tableCell, { width: '8%', textAlign: 'center', color: '#64748B' }]}>
                    {idx + 1}
                  </Text>
                  <Text style={[styles.tableCell, { width: '42%', fontWeight: 'bold' }]}>
                    {crit.name}
                  </Text>
                  <View style={[styles.tableCell, { width: '20%', alignItems: 'center' }]}>
                    {crit.type === 'BENEFIT' ? (
                      <View style={styles.benefitBadge}>
                        <Text style={styles.benefitText}>BENEFIT</Text>
                      </View>
                    ) : (
                      <View style={styles.costBadge}>
                        <Text style={styles.costText}>COST</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>
                    {crit.weight}
                  </Text>
                  <Text style={[styles.tableCell, { width: '15%', textAlign: 'right', fontWeight: 'bold', color: '#4F46E5' }]}>
                    {normalizedPct}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ===================================================================
            SECTION 3: MATRIKS KEPUTUSAN AWAL
        ==================================================================== */}
        <View style={styles.sectionContainer} wrap={false}>
          <Text style={styles.sectionTitle}>3. Matriks Keputusan Awal (Tabel Mentah)</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableRowHeader]}>
              <Text style={[styles.tableCellHeader, { width: `${altColWidthPercent}%` }]}>
                Alternatif / Kandidat
              </Text>
              {payload.criteria.map((crit) => (
                <Text
                  key={crit.id}
                  style={[
                    styles.tableCellHeader,
                    { width: `${critColWidthPercent}%`, textAlign: 'center' },
                  ]}
                >
                  {crit.name}
                </Text>
              ))}
            </View>

            {payload.alternatives.map((alt, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <View
                  key={alt.id}
                  style={[styles.tableRow, isEven ? styles.tableRowAlternate : {}]}
                >
                  <Text style={[styles.tableCell, { width: `${altColWidthPercent}%`, fontWeight: 'bold' }]}>
                    {alt.name}
                  </Text>
                  {payload.criteria.map((crit) => {
                    const val = alt.values[crit.id];
                    return (
                      <Text
                        key={crit.id}
                        style={[
                          styles.tableCell,
                          { width: `${critColWidthPercent}%`, textAlign: 'center' },
                        ]}
                      >
                        {val !== undefined ? val : '-'}
                      </Text>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>

        {/* ===================================================================
            SECTION 4: TAHAPAN PERHITUNGAN (1 CONTOH SEL PER TAHAP)
        ==================================================================== */}
        <View style={styles.sectionContainer} wrap={false}>
          <Text style={styles.sectionTitle}>4. Tahapan Perhitungan Matematis (Ilustrasi Formula)</Text>

          {representativeSteps.length > 0 ? (
            representativeSteps.map((step, idx) => (
              <View key={`${step.stage}-${idx}`} style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <Text style={styles.stepStageName}>Tahap {idx + 1}: {step.stage}</Text>
                  <Text style={{ fontSize: 7.5, color: '#64748B' }}>Sel: {step.cellId}</Text>
                </View>
                <Text style={styles.stepFormula}>{step.formulaLabel}</Text>
                <Text style={styles.stepResultText}>
                  Hasil komputasi sel representatif: <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>{Number(step.result).toFixed(4)}</Text>
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.stepCard}>
              <Text style={styles.stepResultText}>
                Kalkulasi telah diproses secara langsung oleh mesin inferensi {payload.method}.
              </Text>
            </View>
          )}

          <Text style={styles.stepNoteText}>
            * Catatan: Bagian ini menampilkan 1 contoh sel representatif per tahap untuk menjelaskan ilustrasi rumus yang dipakai. Buka Traceability Inspector pada aplikasi web DecisiGraph untuk audit interaktif seluruh sel secara lengkap.
          </Text>
        </View>

        {/* ===================================================================
            SECTION 5: HASIL AKHIR & RANKING
        ==================================================================== */}
        <View style={styles.sectionContainer} wrap={false}>
          <Text style={styles.sectionTitle}>5. Hasil Akhir & Ranking Komprehensif</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableRowHeader]}>
              <Text style={[styles.tableCellHeader, { width: '12%', textAlign: 'center' }]}>Rank</Text>
              <Text style={[styles.tableCellHeader, { width: '40%' }]}>Nama Alternatif</Text>
              <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'right' }]}>Skor Akhir</Text>
              <Text style={[styles.tableCellHeader, { width: '28%', textAlign: 'center' }]}>Status Rekomendasi</Text>
            </View>

            {payload.result.finalRanking.map((row) => {
              const isRank1 = row.rank === 1;
              return (
                <View
                  key={row.alternativeId}
                  style={[styles.tableRow, isRank1 ? styles.tableRowWinner : {}]}
                >
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        width: '12%',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: isRank1 ? '#047857' : '#334155',
                      },
                    ]}
                  >
                    #{row.rank}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        width: '40%',
                        fontWeight: isRank1 ? 'bold' : 'normal',
                        color: isRank1 ? '#064E3B' : '#0F172A',
                      },
                    ]}
                  >
                    {row.alternativeName}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        width: '20%',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: isRank1 ? '#047857' : '#4F46E5',
                      },
                    ]}
                  >
                    {Number(row.score).toFixed(4)}
                  </Text>
                  <View style={[styles.tableCell, { width: '28%', alignItems: 'center' }]}>
                    {isRank1 ? (
                      <View style={styles.rank1Badge}>
                        <Text style={styles.rank1BadgeText}>★ Rekomendasi Utama</Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: 7.5, color: '#64748B' }}>Alternatif Prioritas #{row.rank}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ===================================================================
            SECTION 5.B: PERBANDINGAN MULTI-METODE (OPSIONAL)
        ==================================================================== */}
        {payload.comparisonResult && payload.comparisonResult.rows.length > 0 && (
          <View style={styles.sectionContainer} wrap={false}>
            <Text style={styles.sectionTitle}>5.B Analisis Konsensus Multi-Metode (SAW vs WP vs TOPSIS)</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCellHeader, { width: '32%' }]}>Alternatif</Text>
                <Text style={[styles.tableCellHeader, { width: '17%', textAlign: 'center' }]}>SAW</Text>
                <Text style={[styles.tableCellHeader, { width: '17%', textAlign: 'center' }]}>WP</Text>
                <Text style={[styles.tableCellHeader, { width: '17%', textAlign: 'center' }]}>TOPSIS</Text>
                <Text style={[styles.tableCellHeader, { width: '17%', textAlign: 'center' }]}>Rata-rata</Text>
              </View>

              {payload.comparisonResult.rows.map((row, idx) => {
                const isConsensus = row.isConsensusRank1;
                const isEven = idx % 2 === 1;
                return (
                  <View
                    key={row.alternativeId}
                    style={[
                      styles.tableRow,
                      isConsensus ? styles.tableRowWinner : isEven ? styles.tableRowAlternate : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        {
                          width: '32%',
                          fontWeight: isConsensus ? 'bold' : 'normal',
                          color: isConsensus ? '#064E3B' : '#0F172A',
                        },
                      ]}
                    >
                      {row.alternativeName} {isConsensus ? '★' : ''}
                    </Text>
                    <Text style={[styles.tableCell, { width: '17%', textAlign: 'center', fontSize: 7.5 }]}>
                      #{row.saw.rank} ({row.saw.score.toFixed(3)})
                    </Text>
                    <Text style={[styles.tableCell, { width: '17%', textAlign: 'center', fontSize: 7.5 }]}>
                      #{row.wp.rank} ({row.wp.score.toFixed(3)})
                    </Text>
                    <Text style={[styles.tableCell, { width: '17%', textAlign: 'center', fontSize: 7.5 }]}>
                      #{row.topsis.rank} ({row.topsis.score.toFixed(3)})
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        {
                          width: '17%',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: isConsensus ? '#047857' : '#4F46E5',
                        },
                      ]}
                    >
                      Rank {row.averageRank.toFixed(1)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ===================================================================
            SECTION 6: KESIMPULAN OTOMATIS
        ==================================================================== */}
        <View style={styles.sectionContainer} wrap={false}>
          <Text style={styles.sectionTitle}>6. Kesimpulan & Rekomendasi Keputusan</Text>
          <View style={styles.conclusionCard}>
            <Text style={styles.conclusionParagraph}>{narrativeConclusion}</Text>
          </View>
        </View>

        {/* ===================================================================
            SECTION 7: FOOTER TIAP HALAMAN (FIXED)
        ==================================================================== */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerCopyright}>
            © {currentYear} DecisiGraph — Dibuat oleh Hafidz Ridwan
          </Text>
          <Text
            style={styles.footerPage}
            render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default DecisiPdfReport;

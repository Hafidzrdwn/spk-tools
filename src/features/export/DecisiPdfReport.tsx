import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ReportPayload } from './types';
import {
  formatIndonesianDate,
  getMethodFullName,
  generateReportConclusion,
} from './generateReport';
import { formatDisplayNumber } from '@/utils/numberFormat';
import { useUiStore } from '@/store/useUiStore';

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 44,
    paddingHorizontal: 30,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#334155',
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#4F46E5',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 0.8,
    borderColor: '#C7D2FE',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  brandBadgeText: {
    color: '#4338CA',
    fontSize: 7.5,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  generatedDateText: {
    fontSize: 7.5,
    color: '#64748B',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  methodBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 4,
  },
  methodBadge: {
    backgroundColor: '#4F46E5',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  methodBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: 'bold',
  },
  methodSubtitle: {
    fontSize: 8,
    color: '#64748B',
  },

  chapterHeader: {
    marginTop: 14,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  chapterTag: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 2.5,
  },

  sectionSubTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 7.8,
    color: '#64748B',
    lineHeight: 1.35,
    marginBottom: 6,
  },

  formulaCard: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
    borderTopWidth: 0.5,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 3,
    padding: 5,
    marginBottom: 6,
  },
  formulaTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#4338CA',
    marginBottom: 2,
  },
  formulaEquation: {
    fontFamily: 'Courier',
    fontSize: 7.8,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    padding: 3.5,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },

  table: {
    borderWidth: 0.7,
    borderColor: '#CBD5E1',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.6,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
    minHeight: 18,
  },
  tableRowHeader: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 0.9,
    borderBottomColor: '#CBD5E1',
  },
  tableRowAlternate: {
    backgroundColor: '#FAFAFA',
  },
  tableRowWinner: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 2.5,
    borderLeftColor: '#10B981',
  },
  tableCellHeader: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#334155',
    padding: 3.5,
  },
  tableCell: {
    fontSize: 7.5,
    color: '#334155',
    padding: 3.5,
  },

  benefitBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 0.5,
    borderColor: '#A7F3D0',
    borderRadius: 2.5,
    paddingVertical: 1,
    paddingHorizontal: 4,
    alignSelf: 'center',
  },
  benefitText: {
    color: '#047857',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
  costBadge: {
    backgroundColor: '#FFF1F2',
    borderWidth: 0.5,
    borderColor: '#FECDD3',
    borderRadius: 2.5,
    paddingVertical: 1,
    paddingHorizontal: 4,
    alignSelf: 'center',
  },
  costText: {
    color: '#BE123C',
    fontSize: 6.5,
    fontWeight: 'bold',
  },
  rank1Badge: {
    backgroundColor: '#10B981',
    borderRadius: 2.5,
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    alignSelf: 'center',
  },
  rank1BadgeText: {
    color: '#FFFFFF',
    fontSize: 6.8,
    fontWeight: 'bold',
  },

  infoCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 0.6,
    borderColor: '#E2E8F0',
    borderRadius: 3,
    padding: 8,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  infoCardBody: {
    fontSize: 7.6,
    color: '#475569',
    lineHeight: 1.4,
  },

  conclusionCard: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3.5,
    borderLeftColor: '#4F46E5',
    borderTopWidth: 0.6,
    borderRightWidth: 0.6,
    borderBottomWidth: 0.6,
    borderColor: '#E2E8F0',
    borderRadius: 3,
    padding: 9,
    marginTop: 8,
  },
  conclusionParagraph: {
    fontSize: 8,
    color: '#1E293B',
    lineHeight: 1.45,
    textAlign: 'justify',
  },

  footer: {
    position: 'absolute',
    bottom: 18,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.6,
    borderTopColor: '#E2E8F0',
    paddingTop: 5,
  },
  footerCopyright: {
    fontSize: 7,
    color: '#64748B',
  },
  footerPage: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: 'bold',
  },
});

export interface DecisiPdfReportProps {
  payload: ReportPayload;
  numberFormat?: 'comma' | 'dot';
}

export const DecisiPdfReport: React.FC<DecisiPdfReportProps> = ({
  payload,
  numberFormat: propNumberFormat,
}) => {
  const currentYear = new Date().getFullYear();
  const indonesianDate = formatIndonesianDate(payload.generatedAt);
  const numberFormat =
    propNumberFormat || useUiStore.getState().numberFormat || 'comma';
  const narrativeConclusion =
    payload.conclusionText || generateReportConclusion(payload, numberFormat);

  const critCount = Math.max(1, payload.criteria.length);
  const altColWidthPercent = 28;
  const critColWidthPercent = (100 - altColWidthPercent) / critCount;

  const safeConfig = payload.config || {
    selectedMethods: [payload.method || 'SAW'],
    includeComparison: !!payload.comparisonResult,
    includeAhp: payload.method === 'AHP',
    includeStory: false,
    includeExecutiveSummary: true,
  };

  const showSaw =
    payload.sawData && safeConfig.selectedMethods.includes('SAW');
  const showWp =
    payload.wpData && safeConfig.selectedMethods.includes('WP');
  const showTopsis =
    payload.topsisData && safeConfig.selectedMethods.includes('TOPSIS');
  const showAhp =
    payload.ahpData && safeConfig.includeAhp;
  const showStory =
    payload.storyData && safeConfig.includeStory;
  const showComparison =
    payload.comparisonData &&
    safeConfig.includeComparison &&
    payload.comparisonData.result.rows.length > 0;

  let chapterCounter = 1;

  return (
    <Document
      title={`Laporan SPK - ${payload.projectTitle}`}
      author="DecisiGraph"
      subject="Laporan Analisis Keputusan Multi-Metode"
    >
      <Page size="A4" style={styles.page}>
        {/* ===================================================================
            COVER / HEADER
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
            {safeConfig.selectedMethods.map((m) => (
              <View key={m} style={styles.methodBadge}>
                <Text style={styles.methodBadgeText}>{m}</Text>
              </View>
            ))}
            {showComparison && (
              <View style={[styles.methodBadge, { backgroundColor: '#059669' }]}>
                <Text style={styles.methodBadgeText}>Komparasi Multi-Metode</Text>
              </View>
            )}
            {showAhp && (
              <View style={[styles.methodBadge, { backgroundColor: '#7C3AED' }]}>
                <Text style={styles.methodBadgeText}>AHP Prioritas</Text>
              </View>
            )}
            <Text style={styles.methodSubtitle}>
              Cakupan: {safeConfig.selectedMethods.map((m) => getMethodFullName(m)).join(' • ')}
            </Text>
          </View>
        </View>

        {/* ===================================================================
            BAB 1: RINGKASAN KRITERIA EVALUASI
        ==================================================================== */}
        <View wrap={false}>
          <View style={styles.chapterHeader}>
            <Text style={styles.chapterTitle}>
              Bab {chapterCounter++}: Ringkasan Kriteria Evaluasi
            </Text>
            <Text style={styles.chapterTag}>Data Input</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Berikut merupakan daftar kriteria pengambilan keputusan beserta klasifikasi tipe, bobot awal, bobot ternormalisasi, dan satuan ukur:
          </Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableRowHeader]}>
              <Text style={[styles.tableCellHeader, { width: '8%', textAlign: 'center' }]}>No</Text>
              <Text style={[styles.tableCellHeader, { width: '38%' }]}>Nama Kriteria</Text>
              <Text style={[styles.tableCellHeader, { width: '16%', textAlign: 'center' }]}>Tipe</Text>
              <Text style={[styles.tableCellHeader, { width: '14%', textAlign: 'right' }]}>Bobot Mentah</Text>
              <Text style={[styles.tableCellHeader, { width: '14%', textAlign: 'right' }]}>Bobot (wj)</Text>
              <Text style={[styles.tableCellHeader, { width: '10%', textAlign: 'center' }]}>Satuan</Text>
            </View>

            {payload.criteria.map((crit, idx) => {
              const isEven = idx % 2 === 1;
              const normalizedPct =
                formatDisplayNumber(crit.normalizedWeight * 100, { decimals: 1, separator: numberFormat }) + '%';
              return (
                <View
                  key={crit.id}
                  style={[styles.tableRow, isEven ? styles.tableRowAlternate : {}]}
                >
                  <Text style={[styles.tableCell, { width: '8%', textAlign: 'center', color: '#64748B' }]}>
                    {idx + 1}
                  </Text>
                  <Text style={[styles.tableCell, { width: '38%', fontWeight: 'bold' }]}>
                    {crit.name}
                  </Text>
                  <View style={[styles.tableCell, { width: '16%', alignItems: 'center' }]}>
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
                  <Text style={[styles.tableCell, { width: '14%', textAlign: 'right' }]}>
                    {formatDisplayNumber(crit.weight, { decimals: 2, separator: numberFormat })}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: '14%', textAlign: 'right', fontWeight: 'bold', color: '#4F46E5' },
                    ]}
                  >
                    {normalizedPct}
                  </Text>
                  <Text style={[styles.tableCell, { width: '10%', textAlign: 'center', color: '#64748B' }]}>
                    {crit.unit || '-'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ===================================================================
            BAB 2: MATRIKS KEPUTUSAN AWAL (X)
        ==================================================================== */}
        <View wrap={false}>
          <View style={styles.chapterHeader}>
            <Text style={styles.chapterTitle}>
              Bab {chapterCounter++}: Matriks Keputusan Awal (Matriks X)
            </Text>
            <Text style={styles.chapterTag}>Data Mentah</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Tabel matriks keputusan awal memuat nilai numerik kuantitatif tiap alternatif terhadap masing-masing kriteria:
          </Text>

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
                  <Text
                    style={[
                      styles.tableCell,
                      { width: `${altColWidthPercent}%`, fontWeight: 'bold', color: '#0F172A' },
                    ]}
                  >
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
                        {val !== undefined
                          ? formatDisplayNumber(val, { decimals: 4, separator: numberFormat })
                          : '-'}
                      </Text>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>

        {/* ===================================================================
            BAB 3: STORY-TO-MATRIX (JIKA TERSEDIA / DIPILIH)
        ==================================================================== */}
        {showStory && payload.storyData && (
          <View wrap={false}>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterTitle}>
                Bab {chapterCounter++}: Narasi Cerita Kasus & Pemetaan Entitas (Story-to-Matrix)
              </Text>
              <Text style={[styles.chapterTag, { backgroundColor: '#F3E8FF', color: '#7E22CE' }]}>
                Heuristik NLP
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Transkrip Narasi Cerita Masukan:</Text>
              <Text style={[styles.infoCardBody, { fontStyle: 'italic' }]}>
                "{payload.storyData.narrativeText}"
              </Text>
            </View>

            <Text style={styles.sectionSubTitle}>Hasil Ekstraksi Entitas & Pembentukan Matriks:</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCellHeader, { width: '30%' }]}>Entitas Terdeteksi</Text>
                <Text style={[styles.tableCellHeader, { width: '70%' }]}>Spesifikasi Nilai Kriteria Terpetakan</Text>
              </View>
              {payload.storyData.extractedAlternatives.map((alt, idx) => {
                const specs = payload.criteria
                  .map(
                    (c) =>
                      `${c.name}: ${formatDisplayNumber(alt.values[c.id] ?? 0, { decimals: 2, separator: numberFormat })}${c.unit ? ` ${c.unit}` : ''}`
                  )
                  .join(' | ');
                return (
                  <View
                    key={alt.id}
                    style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlternate : {}]}
                  >
                    <Text style={[styles.tableCell, { width: '30%', fontWeight: 'bold' }]}>
                      {alt.name}
                    </Text>
                    <Text style={[styles.tableCell, { width: '70%', color: '#475569' }]}>
                      {specs}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {showSaw && payload.sawData && (
          <View>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterTitle}>
                Bab {chapterCounter++}: Metode Simple Additive Weighting (SAW)
              </Text>
              <Text style={styles.chapterTag}>Kalkulasi Rinci</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Metode SAW (Simple Additive Weighting) menentukan preferensi melalui normalisasi linear skala nilai matriks terhadap nilai ekstrim kriteria, kemudian menjumlahkan perkalian bobot kriteria.
            </Text>

            <View wrap={false}>
              <Text style={styles.sectionSubTitle}>Langkah 1: Penentuan Nilai Ekstrim Kriteria</Text>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Formulasi Normalisasi SAW:</Text>
                <Text style={styles.formulaEquation}>
                  Benefit: r_ij = x_ij / max(X_j)   |   Cost: r_ij = min(X_j) / x_ij
                </Text>
              </View>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCellHeader, { width: '35%' }]}>Nama Kriteria</Text>
                  <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'center' }]}>Tipe</Text>
                  <Text style={[styles.tableCellHeader, { width: '22%', textAlign: 'right' }]}>Nilai Ekstrim</Text>
                  <Text style={[styles.tableCellHeader, { width: '23%', textAlign: 'center' }]}>Formula Dipakai</Text>
                </View>
                {payload.criteria.map((crit, idx) => {
                  const ext = payload.sawData!.extremums[crit.id] || { min: 0, max: 0 };
                  const targetExt = crit.type === 'BENEFIT' ? ext.max : ext.min;
                  return (
                    <View
                      key={crit.id}
                      style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlternate : {}]}
                    >
                      <Text style={[styles.tableCell, { width: '35%', fontWeight: 'bold' }]}>
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
                      <Text style={[styles.tableCell, { width: '22%', textAlign: 'right', fontWeight: 'bold', color: '#4F46E5' }]}>
                        {crit.type === 'BENEFIT' ? 'Max: ' : 'Min: '}
                        {formatDisplayNumber(targetExt, { decimals: 4, separator: numberFormat })}
                      </Text>
                      <Text style={[styles.tableCell, { width: '23%', textAlign: 'center', fontFamily: 'Courier', fontSize: 7 }]}>
                        {crit.type === 'BENEFIT' ? 'x_ij / Max' : 'Min / x_ij'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View wrap={false}>
              <Text style={styles.sectionSubTitle}>Langkah 2: Matriks Ternormalisasi (Matriks R)</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCellHeader, { width: `${altColWidthPercent}%` }]}>
                    Alternatif
                  </Text>
                  {payload.criteria.map((crit) => (
                    <Text
                      key={crit.id}
                      style={[
                        styles.tableCellHeader,
                        { width: `${critColWidthPercent}%`, textAlign: 'center' },
                      ]}
                    >
                      {`r_${crit.name.slice(0, 8)}`}
                    </Text>
                  ))}
                </View>
                {payload.alternatives.map((alt, altIndex) => {
                  const normRow = payload.sawData!.normalizedMatrix[altIndex] || [];
                  return (
                    <View
                      key={alt.id}
                      style={[styles.tableRow, altIndex % 2 === 1 ? styles.tableRowAlternate : {}]}
                    >
                      <Text style={[styles.tableCell, { width: `${altColWidthPercent}%`, fontWeight: 'bold' }]}>
                        {alt.name}
                      </Text>
                      {payload.criteria.map((_, critIndex) => {
                        const val = normRow[critIndex];
                        return (
                          <Text
                            key={critIndex}
                            style={[
                              styles.tableCell,
                              { width: `${critColWidthPercent}%`, textAlign: 'center', fontFamily: 'Courier', fontSize: 7.2 },
                            ]}
                          >
                            {val !== undefined ? formatDisplayNumber(val, { decimals: 4, separator: numberFormat }) : '-'}
                          </Text>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* SAW Step 3: Nilai Terbobot & Ranking Akhir */}
            <View wrap={false}>
              <Text style={styles.sectionSubTitle}>Langkah 3 & 4: Nilai Preferensi (Vi) dan Ranking Akhir SAW</Text>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Formulasi Skor Preferensi SAW:</Text>
                <Text style={styles.formulaEquation}>
                  {'V_i = ∑_{j=1}^m (w_j · r_ij)'}
                </Text>
              </View>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCellHeader, { width: '12%', textAlign: 'center' }]}>Peringkat</Text>
                  <Text style={[styles.tableCellHeader, { width: '40%' }]}>Alternatif</Text>
                  <Text style={[styles.tableCellHeader, { width: '24%', textAlign: 'right' }]}>Skor Preferensi (Vi)</Text>
                  <Text style={[styles.tableCellHeader, { width: '24%', textAlign: 'center' }]}>Status Rekomendasi</Text>
                </View>
                {payload.sawData.ranking.map((row) => {
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
                            width: '24%',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: isRank1 ? '#047857' : '#4F46E5',
                            fontFamily: 'Courier',
                          },
                        ]}
                      >
                        {formatDisplayNumber(row.score, { decimals: 4, separator: numberFormat })}
                      </Text>
                      <View style={[styles.tableCell, { width: '24%', alignItems: 'center' }]}>
                        {isRank1 ? (
                          <View style={styles.rank1Badge}>
                            <Text style={styles.rank1BadgeText}>★ Juara #1 SAW</Text>
                          </View>
                        ) : (
                          <Text style={{ fontSize: 7, color: '#64748B' }}>Alternatif #{row.rank}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ===================================================================
            BAB: METODE WP (WEIGHTED PRODUCT)
        ==================================================================== */}
        {showWp && payload.wpData && (
          <View>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterTitle}>
                Bab {chapterCounter++}: Metode Weighted Product (WP)
              </Text>
              <Text style={styles.chapterTag}>Kalkulasi Rinci</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Metode Weighted Product (WP) menggunakan perkalian perpangkatan bobot untuk menghubungkan nilai atribut. Tiap bobot kriteria dipangkatkan positif untuk atribut Benefit dan negatif untuk atribut Cost.
            </Text>

            {/* WP Step 1: Pangkat Bobot */}
            <View wrap={false}>
              <Text style={styles.sectionSubTitle}>Langkah 1: Penentuan Pangkat Bobot Kriteria (wj*)</Text>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Formulasi Pangkat Bobot WP:</Text>
                <Text style={styles.formulaEquation}>
                  Benefit: w_j* = +w_j   |   Cost: w_j* = -w_j
                </Text>
              </View>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCellHeader, { width: '35%' }]}>Kriteria</Text>
                  <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'center' }]}>Tipe</Text>
                  <Text style={[styles.tableCellHeader, { width: '22%', textAlign: 'right' }]}>Bobot (wj)</Text>
                  <Text style={[styles.tableCellHeader, { width: '23%', textAlign: 'right' }]}>Pangkat Eksponen (wj*)</Text>
                </View>
                {payload.criteria.map((crit, idx) => {
                  const w = payload.wpData!.normalizedWeights[crit.id] ?? crit.normalizedWeight;
                  const wStar = payload.wpData!.weightPowers[crit.id] ?? (crit.type === 'BENEFIT' ? w : -w);
                  return (
                    <View
                      key={crit.id}
                      style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlternate : {}]}
                    >
                      <Text style={[styles.tableCell, { width: '35%', fontWeight: 'bold' }]}>
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
                      <Text style={[styles.tableCell, { width: '22%', textAlign: 'right' }]}>
                        {formatDisplayNumber(w, { decimals: 4, separator: numberFormat })}
                      </Text>
                      <Text style={[styles.tableCell, { width: '23%', textAlign: 'right', fontWeight: 'bold', fontFamily: 'Courier', color: wStar >= 0 ? '#047857' : '#BE123C' }]}>
                        {wStar >= 0 ? `+${formatDisplayNumber(wStar, { decimals: 4, separator: numberFormat })}` : formatDisplayNumber(wStar, { decimals: 4, separator: numberFormat })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* WP Step 2: Vektor S & Total Sum S */}
            <View wrap={false}>
              <Text style={styles.sectionSubTitle}>Langkah 2: Perkalian Eksponensial & Vektor S</Text>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Formulasi Vektor S:</Text>
                <Text style={styles.formulaEquation}>
                  {'S_i = ∏_{j=1}^m (x_ij ^ w_j*)'}
                </Text>
              </View>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCellHeader, { width: '10%', textAlign: 'center' }]}>No</Text>
                  <Text style={[styles.tableCellHeader, { width: '50%' }]}>Alternatif</Text>
                  <Text style={[styles.tableCellHeader, { width: '40%', textAlign: 'right' }]}>Nilai Vektor S (Si)</Text>
                </View>
                {payload.wpData.vectorS.map((item, idx) => (
                  <View
                    key={item.alternativeId}
                    style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlternate : {}]}
                  >
                    <Text style={[styles.tableCell, { width: '10%', textAlign: 'center', color: '#64748B' }]}>
                      {idx + 1}
                    </Text>
                    <Text style={[styles.tableCell, { width: '50%', fontWeight: 'bold' }]}>
                      {item.alternativeName}
                    </Text>
                    <Text style={[styles.tableCell, { width: '40%', textAlign: 'right', fontFamily: 'Courier', fontWeight: 'bold', color: '#4F46E5' }]}>
                      {formatDisplayNumber(item.score, { decimals: 4, separator: numberFormat })}
                    </Text>
                  </View>
                ))}
                <View style={[styles.tableRow, { backgroundColor: '#EEF2FF', borderTopWidth: 1, borderTopColor: '#C7D2FE' }]}>
                  <Text style={[styles.tableCell, { width: '60%', fontWeight: 'bold', color: '#4338CA' }]}>
                    Total Jumlahan Vektor S (∑ Si)
                  </Text>
                  <Text style={[styles.tableCell, { width: '40%', textAlign: 'right', fontWeight: 'bold', fontFamily: 'Courier', color: '#4338CA' }]}>
                    {formatDisplayNumber(payload.wpData.totalSumS, { decimals: 4, separator: numberFormat })}
                  </Text>
                </View>
              </View>
            </View>

            {/* WP Step 3: Vektor V & Ranking Akhir */}
            <View wrap={false}>
              <Text style={styles.sectionSubTitle}>Langkah 3: Vektor Preferensi Relatif (Vi) dan Ranking WP</Text>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Formulasi Vektor Preferensi WP:</Text>
                <Text style={styles.formulaEquation}>
                  {'V_i = S_i / (∑_{k=1}^n S_k)'}
                </Text>
              </View>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCellHeader, { width: '12%', textAlign: 'center' }]}>Peringkat</Text>
                  <Text style={[styles.tableCellHeader, { width: '40%' }]}>Alternatif</Text>
                  <Text style={[styles.tableCellHeader, { width: '24%', textAlign: 'right' }]}>Nilai Preferensi (Vi)</Text>
                  <Text style={[styles.tableCellHeader, { width: '24%', textAlign: 'center' }]}>Status Rekomendasi</Text>
                </View>
                {payload.wpData.ranking.map((row) => {
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
                            width: '24%',
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: isRank1 ? '#047857' : '#4F46E5',
                            fontFamily: 'Courier',
                          },
                        ]}
                      >
                        {formatDisplayNumber(row.score, { decimals: 4, separator: numberFormat })}
                      </Text>
                      <View style={[styles.tableCell, { width: '24%', alignItems: 'center' }]}>
                        {isRank1 ? (
                          <View style={styles.rank1Badge}>
                            <Text style={styles.rank1BadgeText}>★ Juara #1 WP</Text>
                          </View>
                        ) : (
                          <Text style={{ fontSize: 7, color: '#64748B' }}>Alternatif #{row.rank}</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              {payload.wpData.hasZeroCostAdjustment && (
                <View style={[styles.infoCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                  <Text style={[styles.infoCardTitle, { color: '#1E40AF' }]}>Catatan Matematis (WP Zero-Guard Epsilon Adjustment):</Text>
                  <Text style={[styles.infoCardBody, { color: '#1E3A8A' }]}>
                    Ditemukan sel matriks bernilai 0 pada kriteria bertipe Cost. Sesuai kaidah komputasi MCDM, nilai 0 disesuaikan menjadi epsilon (ε = 0,0001) guna mencegah pembagian nol tak hingga (0^-w = ∞) sehingga kalkulasi tetap valid.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ===================================================================
            BAB: METODE TOPSIS
        ==================================================================== */}
        {showTopsis && payload.topsisData && (
          <View>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterTitle}>
                Bab {chapterCounter++}: Metode TOPSIS
              </Text>
              <Text style={styles.chapterTag}>Kalkulasi Rinci</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Metode TOPSIS (Technique for Order of Preference by Similarity to Ideal Solution) mendasarkan keputusan bahwa alternatif terbaik harus memiliki jarak terdekat dengan solusi ideal positif (A+) dan jarak terjauh dari solusi ideal negatif (A-).
            </Text>

            {/* TOPSIS Step 1: Pembagi Euclidean */}
            <View wrap={false}>
              <Text style={styles.sectionSubTitle}>Langkah 1: Pembagi Normalisasi Euclidean</Text>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Formulasi Pembagi Euclidean TOPSIS:</Text>
                <Text style={styles.formulaEquation}>
                  {'Pembagi = √( ∑_{i=1}^n x_ij² )   |   r_ij = x_ij / √( ∑ x_ij² )'}
                </Text>
              </View>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCellHeader, { width: '40%' }]}>Kriteria</Text>
                  <Text style={[styles.tableCellHeader, { width: '30%', textAlign: 'right' }]}>Jumlahan Kuadrat (∑ x²)</Text>
                  <Text style={[styles.tableCellHeader, { width: '30%', textAlign: 'right' }]}>Akar Pembagi (√(∑ x²))</Text>
                </View>
                {payload.criteria.map((crit, idx) => {
                  const normInfo = payload.topsisData!.columnNorms[crit.id] || { sumSquares: 0, norm: 0 };
                  return (
                    <View
                      key={crit.id}
                      style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlternate : {}]}
                    >
                      <Text style={[styles.tableCell, { width: '40%', fontWeight: 'bold' }]}>
                        {crit.name}
                      </Text>
                      <Text style={[styles.tableCell, { width: '30%', textAlign: 'right', fontFamily: 'Courier' }]}>
                        {formatDisplayNumber(normInfo.sumSquares, { decimals: 4, separator: numberFormat })}
                      </Text>
                      <Text style={[styles.tableCell, { width: '30%', textAlign: 'right', fontWeight: 'bold', fontFamily: 'Courier', color: '#4F46E5' }]}>
                        {formatDisplayNumber(normInfo.norm, { decimals: 4, separator: numberFormat })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* TOPSIS Step 2: Solusi Ideal Positif & Negatif */}
            <View wrap={false}>
              <Text style={styles.sectionSubTitle}>Langkah 2: Solusi Ideal Positif (A+) dan Solusi Ideal Negatif (A-)</Text>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Formulasi Solusi Ideal:</Text>
                <Text style={styles.formulaEquation}>
                  Benefit: A+ = max(y_ij), A- = min(y_ij)   |   Cost: A+ = min(y_ij), A- = max(y_ij)
                </Text>
              </View>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCellHeader, { width: '34%' }]}>Kriteria</Text>
                  <Text style={[styles.tableCellHeader, { width: '16%', textAlign: 'center' }]}>Tipe</Text>
                  <Text style={[styles.tableCellHeader, { width: '25%', textAlign: 'right' }]}>Solusi Ideal Positif (A+)</Text>
                  <Text style={[styles.tableCellHeader, { width: '25%', textAlign: 'right' }]}>Solusi Ideal Negatif (A-)</Text>
                </View>
                {payload.criteria.map((crit, idx) => {
                  const aPlus = payload.topsisData!.idealPositive[idx] ?? 0;
                  const aMinus = payload.topsisData!.idealNegative[idx] ?? 0;
                  return (
                    <View
                      key={crit.id}
                      style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlternate : {}]}
                    >
                      <Text style={[styles.tableCell, { width: '34%', fontWeight: 'bold' }]}>
                        {crit.name}
                      </Text>
                      <View style={[styles.tableCell, { width: '16%', alignItems: 'center' }]}>
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
                      <Text style={[styles.tableCell, { width: '25%', textAlign: 'right', fontFamily: 'Courier', color: '#047857', fontWeight: 'bold' }]}>
                        {formatDisplayNumber(aPlus, { decimals: 4, separator: numberFormat })}
                      </Text>
                      <Text style={[styles.tableCell, { width: '25%', textAlign: 'right', fontFamily: 'Courier', color: '#BE123C', fontWeight: 'bold' }]}>
                        {formatDisplayNumber(aMinus, { decimals: 4, separator: numberFormat })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* TOPSIS Step 3: Jarak Euclidean & Kedekatan Relatif Ci */}
            <View wrap={false}>
              <Text style={styles.sectionSubTitle}>Langkah 3: Jarak Euclidean (D+, D-) dan Kedekatan Relatif (Ci)</Text>
              <View style={styles.formulaCard}>
                <Text style={styles.formulaTitle}>Formulasi Kedekatan Relatif:</Text>
                <Text style={styles.formulaEquation}>
                  D+ = √(∑(y_ij - A+j)²),  D- = √(∑(y_ij - A-j)²),  C_i = D- / (D+ + D-)
                </Text>
              </View>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableRowHeader]}>
                  <Text style={[styles.tableCellHeader, { width: '10%', textAlign: 'center' }]}>Rank</Text>
                  <Text style={[styles.tableCellHeader, { width: '30%' }]}>Alternatif</Text>
                  <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'right' }]}>Jarak D+</Text>
                  <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'right' }]}>Jarak D-</Text>
                  <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'right' }]}>Skor Ci (Final)</Text>
                </View>
                {payload.topsisData.ranking.map((row) => {
                  const dist = payload.topsisData!.distances.find(
                    (d) => d.alternativeId === row.alternativeId
                  );
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
                            width: '10%',
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
                            width: '30%',
                            fontWeight: isRank1 ? 'bold' : 'normal',
                            color: isRank1 ? '#064E3B' : '#0F172A',
                          },
                        ]}
                      >
                        {row.alternativeName}
                      </Text>
                      <Text style={[styles.tableCell, { width: '20%', textAlign: 'right', fontFamily: 'Courier' }]}>
                        {dist ? formatDisplayNumber(dist.dPlus, { decimals: 4, separator: numberFormat }) : '-'}
                      </Text>
                      <Text style={[styles.tableCell, { width: '20%', textAlign: 'right', fontFamily: 'Courier' }]}>
                        {dist ? formatDisplayNumber(dist.dMinus, { decimals: 4, separator: numberFormat }) : '-'}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          {
                            width: '20%',
                            textAlign: 'right',
                            fontFamily: 'Courier',
                            fontWeight: 'bold',
                            color: isRank1 ? '#047857' : '#4F46E5',
                          },
                        ]}
                      >
                        {formatDisplayNumber(row.score, { decimals: 4, separator: numberFormat })}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ===================================================================
            BAB: METODE AHP (ANALYTIC HIERARCHY PROCESS)
        ==================================================================== */}
        {showAhp && payload.ahpData && (
          <View wrap={false}>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterTitle}>
                Bab {chapterCounter++}: Analytic Hierarchy Process (AHP Saaty)
              </Text>
              <Text style={[styles.chapterTag, { backgroundColor: '#F3E8FF', color: '#7E22CE' }]}>
                Pembobotan Kriteria
              </Text>
            </View>
            <Text style={styles.sectionDescription}>
              Metode AHP digunakan untuk menguji konsistensi preferensi berpasangan antar kriteria dan menurunkan vektor prioritas matematis berbasis nilai eigen maksimum.
            </Text>

            {/* AHP Pairwise Table */}
            <Text style={styles.sectionSubTitle}>1. Matriks Perbandingan Berpasangan (Pairwise Matrix)</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCellHeader, { width: '25%' }]}>Kriteria</Text>
                {payload.criteria.map((c) => (
                  <Text
                    key={c.id}
                    style={[
                      styles.tableCellHeader,
                      { width: `${75 / critCount}%`, textAlign: 'center' },
                    ]}
                  >
                    {c.name.slice(0, 8)}
                  </Text>
                ))}
              </View>
              {payload.criteria.map((cRow, i) => (
                <View
                  key={cRow.id}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlternate : {}]}
                >
                  <Text style={[styles.tableCell, { width: '25%', fontWeight: 'bold' }]}>
                    {cRow.name}
                  </Text>
                  {payload.criteria.map((_, j) => {
                    const val = payload.ahpData!.pairwiseMatrix[i]?.[j] ?? 1;
                    return (
                      <Text
                        key={j}
                        style={[
                          styles.tableCell,
                          {
                            width: `${75 / critCount}%`,
                            textAlign: 'center',
                            fontFamily: 'Courier',
                            fontSize: 7,
                          },
                        ]}
                      >
                        {formatDisplayNumber(val, { decimals: 3, separator: numberFormat })}
                      </Text>
                    );
                  })}
                </View>
              ))}
              <View style={[styles.tableRow, { backgroundColor: '#EEF2FF', borderTopWidth: 1, borderTopColor: '#C7D2FE' }]}>
                <Text style={[styles.tableCell, { width: '25%', fontWeight: 'bold', color: '#4338CA' }]}>
                  Jumlah Kolom (∑)
                </Text>
                {payload.criteria.map((_, j) => {
                  const colSum = payload.ahpData!.colSums[j] ?? 1;
                  return (
                    <Text
                      key={j}
                      style={[
                        styles.tableCell,
                        {
                          width: `${75 / critCount}%`,
                          textAlign: 'center',
                          fontFamily: 'Courier',
                          fontWeight: 'bold',
                          color: '#4338CA',
                          fontSize: 7,
                        },
                      ]}
                    >
                      {formatDisplayNumber(colSum, { decimals: 3, separator: numberFormat })}
                    </Text>
                  );
                })}
              </View>
            </View>

            {/* AHP Consistency Summary */}
            <Text style={styles.sectionSubTitle}>2. Uji Konsistensi Logika Saaty</Text>
            <View style={styles.formulaCard}>
              <Text style={styles.formulaTitle}>Formulasi Konsistensi Saaty:</Text>
              <Text style={styles.formulaEquation}>
                CI = (λ_max - n) / (n - 1)   |   CR = CI / RI   (Konsisten jika CR ≤ 0.10)
              </Text>
            </View>

            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'center' }]}>Lambda Max (λmax)</Text>
                <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'center' }]}>Consistency Index (CI)</Text>
                <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'center' }]}>Random Index (RI)</Text>
                <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'center' }]}>Consistency Ratio (CR)</Text>
                <Text style={[styles.tableCellHeader, { width: '20%', textAlign: 'center' }]}>Status Evaluasi</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '20%', textAlign: 'center', fontFamily: 'Courier', fontWeight: 'bold' }]}>
                  {formatDisplayNumber(payload.ahpData.consistency.lambdaMax, { decimals: 4, separator: numberFormat })}
                </Text>
                <Text style={[styles.tableCell, { width: '20%', textAlign: 'center', fontFamily: 'Courier' }]}>
                  {formatDisplayNumber(payload.ahpData.consistency.ci, { decimals: 4, separator: numberFormat })}
                </Text>
                <Text style={[styles.tableCell, { width: '20%', textAlign: 'center', fontFamily: 'Courier' }]}>
                  {formatDisplayNumber(payload.ahpData.consistency.ri, { decimals: 2, separator: numberFormat })}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    {
                      width: '20%',
                      textAlign: 'center',
                      fontFamily: 'Courier',
                      fontWeight: 'bold',
                      color: payload.ahpData.consistency.isConsistent ? '#047857' : '#BE123C',
                    },
                  ]}
                >
                  {formatDisplayNumber(payload.ahpData.consistency.cr, { decimals: 4, separator: numberFormat })}
                </Text>
                <View style={[styles.tableCell, { width: '20%', alignItems: 'center' }]}>
                  {payload.ahpData.consistency.isConsistent ? (
                    <View style={styles.benefitBadge}>
                      <Text style={styles.benefitText}>KONSISTEN (≤ 0.10)</Text>
                    </View>
                  ) : (
                    <View style={styles.costBadge}>
                      <Text style={styles.costText}>INKONSISTEN (&gt; 0.10)</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ===================================================================
            BAB: KOMPARASI MULTI-METODE (JIKA DIPILIH / AKTIF)
        ==================================================================== */}
        {showComparison && payload.comparisonData && (
          <View wrap={false}>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterTitle}>
                Bab {chapterCounter++}: Analisis Komparasi Multi-Metode
              </Text>
              <Text style={[styles.chapterTag, { backgroundColor: '#D1FAE5', color: '#047857' }]}>
                Cross-Method Consensus
              </Text>
            </View>
            <Text style={styles.sectionDescription}>
              Tabel komparasi komprehensif menampilkan ranking side-by-side antar metode, analisis pergeseran peringkat (rank shift), dan tingkat konsensus keputusan.
            </Text>

            {/* Side-by-side comparison table */}
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <Text style={[styles.tableCellHeader, { width: '30%' }]}>Alternatif</Text>
                {payload.comparisonData.activeMethods.includes('saw') && (
                  <Text style={[styles.tableCellHeader, { width: '17%', textAlign: 'center' }]}>Rank SAW</Text>
                )}
                {payload.comparisonData.activeMethods.includes('wp') && (
                  <Text style={[styles.tableCellHeader, { width: '17%', textAlign: 'center' }]}>Rank WP</Text>
                )}
                {payload.comparisonData.activeMethods.includes('topsis') && (
                  <Text style={[styles.tableCellHeader, { width: '17%', textAlign: 'center' }]}>Rank TOPSIS</Text>
                )}
                <Text style={[styles.tableCellHeader, { width: '19%', textAlign: 'center' }]}>Rata-rata Rank</Text>
              </View>

              {payload.comparisonData.result.rows.map((row, idx) => {
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
                          width: '30%',
                          fontWeight: isConsensus ? 'bold' : 'normal',
                          color: isConsensus ? '#064E3B' : '#0F172A',
                        },
                      ]}
                    >
                      {row.alternativeName} {isConsensus ? '★' : ''}
                    </Text>
                    {payload.comparisonData!.activeMethods.includes('saw') && (
                      <Text style={[styles.tableCell, { width: '17%', textAlign: 'center', fontSize: 7 }]}>
                        #{row.saw.rank} ({formatDisplayNumber(row.saw.score, { decimals: 3, separator: numberFormat })})
                      </Text>
                    )}
                    {payload.comparisonData!.activeMethods.includes('wp') && (
                      <Text style={[styles.tableCell, { width: '17%', textAlign: 'center', fontSize: 7 }]}>
                        #{row.wp.rank} ({formatDisplayNumber(row.wp.score, { decimals: 3, separator: numberFormat })})
                      </Text>
                    )}
                    {payload.comparisonData!.activeMethods.includes('topsis') && (
                      <Text style={[styles.tableCell, { width: '17%', textAlign: 'center', fontSize: 7 }]}>
                        #{row.topsis.rank} ({formatDisplayNumber(row.topsis.score, { decimals: 3, separator: numberFormat })})
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.tableCell,
                        {
                          width: '19%',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: isConsensus ? '#047857' : '#4F46E5',
                        },
                      ]}
                    >
                      Rank {formatDisplayNumber(row.averageRank, { decimals: 2, separator: numberFormat })}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Shift & Sensitivity Analysis Box */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Analisis Stabilitas & Dinamika Ranking:</Text>
              <Text style={styles.infoCardBody}>
                {payload.comparisonData.result.explanation ||
                  'Evaluasi multi-metode menunjukkan konsistensi yang baik pada urutan alternatif prioritas.'}
              </Text>
            </View>
          </View>
        )}

        {/* ===================================================================
            BAB: KESIMPULAN & REKOMENDASI EKSEKUTIF
        ==================================================================== */}
        <View wrap={false}>
          <View style={styles.chapterHeader}>
            <Text style={styles.chapterTitle}>
              Bab {chapterCounter++}: Kesimpulan & Rekomendasi Keputusan
            </Text>
            <Text style={styles.chapterTag}>Rangkuman Final</Text>
          </View>

          <View style={styles.conclusionCard}>
            <Text style={styles.conclusionParagraph}>{narrativeConclusion}</Text>
          </View>
        </View>

        {/* ===================================================================
            FOOTER TIAP HALAMAN (FIXED)
        ==================================================================== */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerCopyright}>
            © {currentYear} DecisiGraph - Sistem Pendukung Keputusan Multi-Kriteria
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

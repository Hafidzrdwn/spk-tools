import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

const mathStyles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3.5,
    borderLeftColor: '#4F46E5',
    borderTopWidth: 0.8,
    borderRightWidth: 0.8,
    borderBottomWidth: 0.8,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    padding: 7,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 6,
  },
  titleBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 0.6,
    borderColor: '#C7D2FE',
    borderRadius: 2.5,
    paddingVertical: 1,
    paddingHorizontal: 5,
  },
  titleBadgeText: {
    fontSize: 6.8,
    fontWeight: 'bold',
    color: '#4338CA',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formulaBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.8,
    borderColor: '#E2E8F0',
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  equationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeBenefit: {
    backgroundColor: '#ECFDF5',
    borderWidth: 0.6,
    borderColor: '#A7F3D0',
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 4,
    marginRight: 6,
  },
  badgeBenefitText: {
    fontSize: 6.8,
    fontWeight: 'bold',
    color: '#047857',
  },
  badgeCost: {
    backgroundColor: '#FFF1F2',
    borderWidth: 0.6,
    borderColor: '#FECDD3',
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 4,
    marginRight: 6,
  },
  badgeCostText: {
    fontSize: 6.8,
    fontWeight: 'bold',
    color: '#BE123C',
  },
  mathRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mathVar: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  mathSub: {
    fontSize: 6.5,
    color: '#0F172A',
  },
  mathSup: {
    fontSize: 6.5,
    color: '#0F172A',
  },
  mathOperator: {
    fontSize: 9.5,
    color: '#0F172A',
    marginHorizontal: 3,
  },
  fractionContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  fractionNum: {
    fontSize: 8.5,
    color: '#0F172A',
    fontWeight: 'medium',
    textAlign: 'center',
    marginBottom: 1,
  },
  fractionBar: {
    height: 0.9,
    backgroundColor: '#0F172A',
    width: '100%',
    minWidth: 26,
  },
  fractionDen: {
    fontSize: 8.5,
    color: '#0F172A',
    fontWeight: 'medium',
    textAlign: 'center',
    marginTop: 1,
  },
  summationContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  sumSymbol: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 1,
  },
  sumBound: {
    fontSize: 5.5,
    color: '#475569',
    textAlign: 'center',
  },
  sqrtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sqrtSymbol: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  sqrtRadicand: {
    borderTopWidth: 0.9,
    borderTopColor: '#0F172A',
    paddingTop: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const PdfFormulaCard: React.FC<{
  title: string;
  badge?: string;
  children: React.ReactNode;
}> = ({ title, badge = 'FORMULA', children }) => (
  <View style={mathStyles.card}>
    <View style={mathStyles.cardHeader}>
      <View style={mathStyles.titleBadge}>
        <Text style={mathStyles.titleBadgeText}>{badge}</Text>
      </View>
      <Text style={mathStyles.cardTitle}>{title}</Text>
    </View>
    <View style={mathStyles.formulaBox}>{children}</View>
  </View>
);

export const PdfSawNormFormula: React.FC = () => (
  <PdfFormulaCard title="Formulasi Normalisasi Matriks R (SAW)">
    <View style={mathStyles.equationRow}>
      <View style={mathStyles.equationBlock}>
        <View style={mathStyles.badgeBenefit}>
          <Text style={mathStyles.badgeBenefitText}>BENEFIT</Text>
        </View>
        <View style={mathStyles.mathRow}>
          <Text style={mathStyles.mathVar}>r<Text style={mathStyles.mathSub}>ij</Text></Text>
          <Text style={mathStyles.mathOperator}> = </Text>
          <View style={mathStyles.fractionContainer}>
            <Text style={mathStyles.fractionNum}>x<Text style={mathStyles.mathSub}>ij</Text></Text>
            <View style={mathStyles.fractionBar} />
            <Text style={mathStyles.fractionDen}>max<Text style={mathStyles.mathSub}>k</Text>(x<Text style={mathStyles.mathSub}>kj</Text>)</Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 9.5, color: '#94A3B8' }}>|</Text>

      <View style={mathStyles.equationBlock}>
        <View style={mathStyles.badgeCost}>
          <Text style={mathStyles.badgeCostText}>COST</Text>
        </View>
        <View style={mathStyles.mathRow}>
          <Text style={mathStyles.mathVar}>r<Text style={mathStyles.mathSub}>ij</Text></Text>
          <Text style={mathStyles.mathOperator}> = </Text>
          <View style={mathStyles.fractionContainer}>
            <Text style={mathStyles.fractionNum}>min<Text style={mathStyles.mathSub}>k</Text>(x<Text style={mathStyles.mathSub}>kj</Text>)</Text>
            <View style={mathStyles.fractionBar} />
            <Text style={mathStyles.fractionDen}>x<Text style={mathStyles.mathSub}>ij</Text></Text>
          </View>
        </View>
      </View>
    </View>
  </PdfFormulaCard>
);

export const PdfSawScoreFormula: React.FC = () => (
  <PdfFormulaCard title="Formulasi Skor Preferensi Akhir (SAW)">
    <View style={mathStyles.mathRow}>
      <Text style={mathStyles.mathVar}>V<Text style={mathStyles.mathSub}>i</Text></Text>
      <Text style={mathStyles.mathOperator}> = </Text>
      <View style={mathStyles.summationContainer}>
        <Text style={mathStyles.sumBound}>m</Text>
        <Text style={mathStyles.sumSymbol}>{'\u2211'}</Text>
        <Text style={mathStyles.sumBound}>j=1</Text>
      </View>
      <Text style={mathStyles.mathVar}> (w<Text style={mathStyles.mathSub}>j</Text> {'\u00B7'} r<Text style={mathStyles.mathSub}>ij</Text>)</Text>
      <Text style={{ fontSize: 8, color: '#475569', marginLeft: 16 }}>
        (Penjumlahan terbobot seluruh kriteria untuk alternatif ke-i)
      </Text>
    </View>
  </PdfFormulaCard>
);

export const PdfWpWeightPowerFormula: React.FC = () => (
  <PdfFormulaCard title="Formulasi Normalisasi Pangkat Bobot (WP)">
    <View style={mathStyles.equationRow}>
      <View style={mathStyles.equationBlock}>
        <View style={mathStyles.badgeBenefit}>
          <Text style={mathStyles.badgeBenefitText}>BENEFIT</Text>
        </View>
        <View style={mathStyles.mathRow}>
          <Text style={mathStyles.mathVar}>w<Text style={mathStyles.mathSub}>j</Text><Text style={mathStyles.mathSup}>*</Text></Text>
          <Text style={mathStyles.mathOperator}> = +</Text>
          <Text style={mathStyles.mathVar}>w<Text style={mathStyles.mathSub}>j</Text></Text>
          <Text style={{ fontSize: 8, color: '#475569', marginLeft: 4 }}>(Positif)</Text>
        </View>
      </View>

      <Text style={{ fontSize: 9.5, color: '#94A3B8' }}>|</Text>

      <View style={mathStyles.equationBlock}>
        <View style={mathStyles.badgeCost}>
          <Text style={mathStyles.badgeCostText}>COST</Text>
        </View>
        <View style={mathStyles.mathRow}>
          <Text style={mathStyles.mathVar}>w<Text style={mathStyles.mathSub}>j</Text><Text style={mathStyles.mathSup}>*</Text></Text>
          <Text style={mathStyles.mathOperator}> = -</Text>
          <Text style={mathStyles.mathVar}>w<Text style={mathStyles.mathSub}>j</Text></Text>
          <Text style={{ fontSize: 8, color: '#475569', marginLeft: 4 }}>(Negatif)</Text>
        </View>
      </View>
    </View>
  </PdfFormulaCard>
);

export const PdfWpVectorSFormula: React.FC = () => (
  <PdfFormulaCard title="Formulasi Vektor S (WP)">
    <View style={mathStyles.mathRow}>
      <Text style={mathStyles.mathVar}>S<Text style={mathStyles.mathSub}>i</Text></Text>
      <Text style={mathStyles.mathOperator}> = </Text>
      <View style={mathStyles.summationContainer}>
        <Text style={mathStyles.sumBound}>m</Text>
        <Text style={mathStyles.sumSymbol}>{'\u220F'}</Text>
        <Text style={mathStyles.sumBound}>j=1</Text>
      </View>
      <Text style={mathStyles.mathVar}> (x<Text style={mathStyles.mathSub}>ij</Text>)</Text>
      <Text style={{ fontSize: 6.8, marginTop: -6, fontWeight: 'bold', color: '#4F46E5' }}>
        w<Text style={{ fontSize: 5 }}>j</Text>*
      </Text>
      <Text style={{ fontSize: 8, color: '#475569', marginLeft: 16 }}>
        (Perkalian geometris dari nilai alternatif dipangkatkan bobot)
      </Text>
    </View>
  </PdfFormulaCard>
);

export const PdfWpVectorVFormula: React.FC = () => (
  <PdfFormulaCard title="Formulasi Vektor V & Preferensi Relatif (WP)">
    <View style={mathStyles.mathRow}>
      <Text style={mathStyles.mathVar}>V<Text style={mathStyles.mathSub}>i</Text></Text>
      <Text style={mathStyles.mathOperator}> = </Text>
      <View style={mathStyles.fractionContainer}>
        <Text style={mathStyles.fractionNum}>S<Text style={mathStyles.mathSub}>i</Text></Text>
        <View style={mathStyles.fractionBar} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0F172A', marginRight: 2 }}>{'\u2211'}</Text>
          <Text style={mathStyles.fractionDen}>S<Text style={mathStyles.mathSub}>k</Text></Text>
        </View>
      </View>
      <Text style={{ fontSize: 8, color: '#475569', marginLeft: 16 }}>
        (Rasio vektor S terhadap total jumlahan seluruh vektor S)
      </Text>
    </View>
  </PdfFormulaCard>
);

export const PdfTopsisNormFormula: React.FC = () => (
  <PdfFormulaCard title="Formulasi Pembagi Euclidean & Normalisasi (TOPSIS)">
    <View style={mathStyles.equationRow}>
      <View style={mathStyles.mathRow}>
        <Text style={mathStyles.mathVar}>Pembagi<Text style={mathStyles.mathSub}>j</Text></Text>
        <Text style={mathStyles.mathOperator}> = </Text>
        <View style={mathStyles.sqrtContainer}>
          <Text style={mathStyles.sqrtSymbol}>{'\u221A'}</Text>
          <View style={mathStyles.sqrtRadicand}>
            <View style={mathStyles.summationContainer}>
              <Text style={mathStyles.sumBound}>n</Text>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0F172A', lineHeight: 1 }}>{'\u2211'}</Text>
              <Text style={mathStyles.sumBound}>i=1</Text>
            </View>
            <Text style={mathStyles.mathVar}> (x<Text style={mathStyles.mathSub}>ij</Text>)</Text>
            <Text style={{ fontSize: 6.5, marginTop: -5, fontWeight: 'bold', color: '#0F172A' }}>{'\u00B2'}</Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 9.5, color: '#94A3B8' }}>|</Text>

      <View style={mathStyles.mathRow}>
        <Text style={mathStyles.mathVar}>r<Text style={mathStyles.mathSub}>ij</Text></Text>
        <Text style={mathStyles.mathOperator}> = </Text>
        <View style={mathStyles.fractionContainer}>
          <Text style={mathStyles.fractionNum}>x<Text style={mathStyles.mathSub}>ij</Text></Text>
          <View style={mathStyles.fractionBar} />
          <Text style={mathStyles.fractionDen}>Pembagi<Text style={mathStyles.mathSub}>j</Text></Text>
        </View>
      </View>
    </View>
  </PdfFormulaCard>
);

export const PdfTopsisIdealFormula: React.FC = () => (
  <PdfFormulaCard title="Formulasi Solusi Ideal Positif & Negatif (TOPSIS)">
    <View style={mathStyles.equationRow}>
      <View style={mathStyles.equationBlock}>
        <View style={mathStyles.badgeBenefit}>
          <Text style={mathStyles.badgeBenefitText}>SOLUSI IDEAL POSITIF (A+)</Text>
        </View>
        <Text style={{ fontSize: 8.5, color: '#0F172A', fontWeight: 'bold' }}>
          A<Text style={mathStyles.mathSup}>+</Text> = {'{'} max(y<Text style={mathStyles.mathSub}>ij</Text>) Benefit,  min(y<Text style={mathStyles.mathSub}>ij</Text>) Cost {'}'}
        </Text>
      </View>

      <View style={mathStyles.equationBlock}>
        <View style={mathStyles.badgeCost}>
          <Text style={mathStyles.badgeCostText}>SOLUSI IDEAL NEGATIF (A-)</Text>
        </View>
        <Text style={{ fontSize: 8.5, color: '#0F172A', fontWeight: 'bold' }}>
          A<Text style={mathStyles.mathSup}>-</Text> = {'{'} min(y<Text style={mathStyles.mathSub}>ij</Text>) Benefit,  max(y<Text style={mathStyles.mathSub}>ij</Text>) Cost {'}'}
        </Text>
      </View>
    </View>
  </PdfFormulaCard>
);

export const PdfTopsisDistancesFormula: React.FC = () => (
  <PdfFormulaCard title="Formulasi Jarak Euclidean & Kedekatan Relatif (TOPSIS)">
    <View style={mathStyles.equationRow}>
      <View style={mathStyles.mathRow}>
        <Text style={mathStyles.mathVar}>D<Text style={mathStyles.mathSub}>i</Text><Text style={mathStyles.mathSup}>+</Text></Text>
        <Text style={mathStyles.mathOperator}> = </Text>
        <View style={mathStyles.sqrtContainer}>
          <Text style={mathStyles.sqrtSymbol}>{'\u221A'}</Text>
          <View style={mathStyles.sqrtRadicand}>
            <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#0F172A' }}>{'\u2211'}</Text>
            <Text style={mathStyles.mathVar}>(y<Text style={mathStyles.mathSub}>ij</Text> - A<Text style={mathStyles.mathSub}>j</Text><Text style={mathStyles.mathSup}>+</Text>)</Text>
            <Text style={{ fontSize: 6.5, marginTop: -5, fontWeight: 'bold', color: '#0F172A' }}>{'\u00B2'}</Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 9.5, color: '#94A3B8' }}>|</Text>

      <View style={mathStyles.mathRow}>
        <Text style={mathStyles.mathVar}>D<Text style={mathStyles.mathSub}>i</Text><Text style={mathStyles.mathSup}>-</Text></Text>
        <Text style={mathStyles.mathOperator}> = </Text>
        <View style={mathStyles.sqrtContainer}>
          <Text style={mathStyles.sqrtSymbol}>{'\u221A'}</Text>
          <View style={mathStyles.sqrtRadicand}>
            <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#0F172A' }}>{'\u2211'}</Text>
            <Text style={mathStyles.mathVar}>(y<Text style={mathStyles.mathSub}>ij</Text> - A<Text style={mathStyles.mathSub}>j</Text><Text style={mathStyles.mathSup}>-</Text>)</Text>
            <Text style={{ fontSize: 6.5, marginTop: -5, fontWeight: 'bold', color: '#0F172A' }}>{'\u00B2'}</Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 9.5, color: '#94A3B8' }}>|</Text>

      <View style={mathStyles.mathRow}>
        <Text style={mathStyles.mathVar}>C<Text style={mathStyles.mathSub}>i</Text></Text>
        <Text style={mathStyles.mathOperator}> = </Text>
        <View style={mathStyles.fractionContainer}>
          <Text style={mathStyles.fractionNum}>D<Text style={mathStyles.mathSub}>i</Text><Text style={mathStyles.mathSup}>-</Text></Text>
          <View style={mathStyles.fractionBar} />
          <Text style={mathStyles.fractionDen}>D<Text style={mathStyles.mathSub}>i</Text><Text style={mathStyles.mathSup}>+</Text> + D<Text style={mathStyles.mathSub}>i</Text><Text style={mathStyles.mathSup}>-</Text></Text>
        </View>
      </View>
    </View>
  </PdfFormulaCard>
);

export const PdfAhpConsistencyFormula: React.FC = () => (
  <PdfFormulaCard title="Formulasi Uji Konsistensi Hierarki Saaty (AHP)">
    <View style={mathStyles.equationRow}>
      <View style={mathStyles.mathRow}>
        <Text style={mathStyles.mathVar}>CI</Text>
        <Text style={mathStyles.mathOperator}> = </Text>
        <View style={mathStyles.fractionContainer}>
          <Text style={mathStyles.fractionNum}>{'\u03BB'}<Text style={mathStyles.mathSub}>max</Text> - n</Text>
          <View style={mathStyles.fractionBar} />
          <Text style={mathStyles.fractionDen}>n - 1</Text>
        </View>
      </View>

      <Text style={{ fontSize: 9.5, color: '#94A3B8' }}>|</Text>

      <View style={mathStyles.mathRow}>
        <Text style={mathStyles.mathVar}>CR</Text>
        <Text style={mathStyles.mathOperator}> = </Text>
        <View style={mathStyles.fractionContainer}>
          <Text style={mathStyles.fractionNum}>CI</Text>
          <View style={mathStyles.fractionBar} />
          <Text style={mathStyles.fractionDen}>RI</Text>
        </View>
      </View>

      <Text style={{ fontSize: 8.5, color: '#047857', fontWeight: 'bold', marginLeft: 8 }}>
        (Matriks konsisten apabila rasio CR {'\u2264'} 0.10)
      </Text>
    </View>
  </PdfFormulaCard>
);

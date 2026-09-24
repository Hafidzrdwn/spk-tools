export type CriterionType = 'BENEFIT' | 'COST';

export interface Criterion {
  id: string;
  name: string;
  type: CriterionType;
  weight: number;            // bobot mentah, misal 3, 5, 1 (belum dinormalisasi)
  normalizedWeight: number;  // weight / totalWeight, HARUS selalu jumlah = 1.0 (toleransi 1e-9)
}

export interface Alternative {
  id: string;
  name: string;
  values: Record<string, number>; // key = criterion.id
}

export type MethodId = 'SAW' | 'WP' | 'TOPSIS' | 'AHP' | 'AUTO';

export interface DecisiProjectState {
  title: string;
  activeMethod: MethodId;
  criteria: Criterion[];
  alternatives: Alternative[];
}

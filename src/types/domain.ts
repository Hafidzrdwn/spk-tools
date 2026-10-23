export type CriterionType = 'BENEFIT' | 'COST';

export interface Criterion {
  id: string;
  name: string;
  unit?: string;
  type: CriterionType;
  weight: number;
  normalizedWeight: number;
}

export interface Alternative {
  id: string;
  name: string;
  values: Record<string, number>;
}

export type MethodId = 'SAW' | 'WP' | 'TOPSIS' | 'AHP' | 'AUTO' | 'COMPARE' | 'EVALUATION';

export interface CaseContextMetadata {
  caseTitle?: string;
  institutionOrOrg?: string;
  targetStakeholder?: string;
  domainContext?: string;
  rawNarrativeSummary?: string;
}

export interface DecisiProjectState {
  title: string;
  activeMethod: MethodId;
  criteria: Criterion[];
  alternatives: Alternative[];
  contextMetadata?: CaseContextMetadata;
}


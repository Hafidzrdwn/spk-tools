import { z } from 'zod';
import type { Alternative, Criterion } from '@/types/domain';

export interface ZeroGuardViolation {
  alternativeId: string;
  criterionId: string;
}

export const positiveCostValueSchema = z
  .number({
    required_error: 'Nilai matriks wajib diisi',
    invalid_type_error: 'Nilai matriks harus berupa angka',
  })
  .gt(0, { message: 'Nilai kriteria Cost pada metode WP harus lebih besar dari 0' });

export function wpZeroGuard(
  alternatives: Alternative[],
  criteria: Criterion[]
): ZeroGuardViolation[] {
  const violations: ZeroGuardViolation[] = [];
  const costCriteria = criteria.filter((c) => c.type === 'COST');

  if (costCriteria.length === 0) {
    return violations;
  }

  for (const alt of alternatives) {
    for (const crit of costCriteria) {
      const rawValue = alt.values[crit.id];
      const result = positiveCostValueSchema.safeParse(rawValue);
      if (!result.success) {
        violations.push({
          alternativeId: alt.id,
          criterionId: crit.id,
        });
      }
    }
  }

  return violations;
}

export const criterionSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit: z.string().optional(),
  type: z.enum(['BENEFIT', 'COST']),
  weight: z.number(),
  normalizedWeight: z.number().optional().default(0),
});

export const alternativeSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.record(z.string(), z.number()),
});

export const caseContextMetadataSchema = z.object({
  caseTitle: z.string().optional(),
  institutionOrOrg: z.string().optional(),
  targetStakeholder: z.string().optional(),
  domainContext: z.string().optional(),
  rawNarrativeSummary: z.string().optional(),
}).optional();

export const projectStatePersistedSchema = z.object({
  title: z.string().default('Proyek SPK Baru'),
  activeMethod: z.enum(['SAW', 'WP', 'TOPSIS', 'AHP', 'AUTO', 'COMPARE', 'EVALUATION']).catch('SAW'),
  criteria: z.array(criterionSchema).default([]),
  alternatives: z.array(alternativeSchema).default([]),
  contextMetadata: caseContextMetadataSchema,
});

export type ProjectStatePersisted = z.infer<typeof projectStatePersistedSchema>;


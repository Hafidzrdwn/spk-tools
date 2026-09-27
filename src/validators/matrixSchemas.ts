import { z } from 'zod';
import type { Alternative, Criterion } from '@/types/domain';

export interface ZeroGuardViolation {
  alternativeId: string;
  criterionId: string;
}

/**
 * Zod schema untuk validasi nilai numerik non-zero positif pada kriteria Cost WP
 */
export const positiveCostValueSchema = z
  .number({
    required_error: 'Nilai matriks wajib diisi',
    invalid_type_error: 'Nilai matriks harus berupa angka',
  })
  .gt(0, { message: 'Nilai kriteria Cost pada metode WP harus lebih besar dari 0' });

/**
 * wpZeroGuard memvalidasi alternatif dan kriteria untuk metode WP.
 * Mengembalikan daftar { alternativeId, criterionId } untuk sel bernilai 0 (atau <= 0) pada kriteria Cost.
 */
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

/**
 * Zod schema untuk validasi item kriteria tersimpan
 */
export const criterionSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['BENEFIT', 'COST']),
  weight: z.number(),
  normalizedWeight: z.number().optional().default(0),
});

/**
 * Zod schema untuk validasi item alternatif tersimpan
 */
export const alternativeSchema = z.object({
  id: z.string(),
  name: z.string(),
  values: z.record(z.string(), z.number()),
});

/**
 * Zod schema untuk validasi state proyek yang dipersist di localStorage (Spec Addendum 2 §20.1)
 */
export const projectStatePersistedSchema = z.object({
  title: z.string(),
  activeMethod: z.enum(['SAW', 'WP', 'TOPSIS', 'AHP', 'AUTO']),
  criteria: z.array(criterionSchema),
  alternatives: z.array(alternativeSchema),
});

export type ProjectStatePersisted = z.infer<typeof projectStatePersistedSchema>;

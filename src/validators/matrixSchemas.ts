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

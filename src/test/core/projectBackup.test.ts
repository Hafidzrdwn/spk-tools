import { describe, it, expect } from 'vitest';
import {
  createProjectBackup,
  serializeProjectBackup,
  parseAndValidateProjectBackup,
  sanitizeFilename,
} from '@/features/project/projectBackupService';
import type { DecisiProjectState } from '@/types/domain';

const sampleProject: DecisiProjectState = {
  title: 'Evaluasi Pemilihan Vendor Cloud',
  activeMethod: 'COMPARE',
  criteria: [
    {
      id: 'crit_1',
      name: 'Biaya Bulanan',
      unit: 'Juta Rp',
      type: 'COST',
      weight: 4,
      normalizedWeight: 0.4,
    },
    {
      id: 'crit_2',
      name: 'Uptime SLA',
      unit: '%',
      type: 'BENEFIT',
      weight: 6,
      normalizedWeight: 0.6,
    },
  ],
  alternatives: [
    {
      id: 'alt_1',
      name: 'Cloud AWS',
      values: { crit_1: 15, crit_2: 99.9 },
    },
    {
      id: 'alt_2',
      name: 'Cloud GCP',
      values: { crit_1: 12, crit_2: 99.5 },
    },
  ],
};

describe('projectBackupService', () => {
  it('berhasil melakukan serialisasi backup dengan amplop metadata v1.1 dan preferensi global', () => {
    const backup = createProjectBackup(sampleProject, { numberFormat: 'comma' });
    expect(backup.format).toBe('decisigraph-project-backup');
    expect(backup.version).toBe('1.1');
    expect(backup.project.title).toBe('Evaluasi Pemilihan Vendor Cloud');
    expect(backup.project.criteria.length).toBe(2);
    expect(backup.project.alternatives.length).toBe(2);
    expect(backup.preferences?.numberFormat).toBe('comma');

    const json = serializeProjectBackup(sampleProject, { numberFormat: 'comma' });
    expect(json).toContain('"decisigraph-project-backup"');
    expect(json).toContain('"Cloud AWS"');
    expect(json).toContain('"numberFormat": "comma"');
  });

  it('berhasil memvalidasi dan memulihkan payload backup envelope standar beserta preferensi', () => {
    const json = serializeProjectBackup(sampleProject, { numberFormat: 'dot' });
    const result = parseAndValidateProjectBackup(json);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project.title).toBe('Evaluasi Pemilihan Vendor Cloud');
      expect(result.data.project.activeMethod).toBe('COMPARE');
      expect(result.data.project.criteria.length).toBe(2);
      expect(result.data.project.alternatives.length).toBe(2);
      expect(result.data.project.alternatives[0].values['crit_1']).toBe(15);
      expect(result.data.preferences?.numberFormat).toBe('dot');
    }
  });

  it('berhasil memvalidasi payload raw project state tanpa amplop', () => {
    const rawJson = JSON.stringify(sampleProject);
    const result = parseAndValidateProjectBackup(rawJson);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project.title).toBe('Evaluasi Pemilihan Vendor Cloud');
      expect(result.data.project.criteria[0].name).toBe('Biaya Bulanan');
    }
  });

  it('berhasil memvalidasi format zustand persist { state: { ... } }', () => {
    const zustandJson = JSON.stringify({
      state: sampleProject,
      version: 1,
    });
    const result = parseAndValidateProjectBackup(zustandJson);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project.title).toBe('Evaluasi Pemilihan Vendor Cloud');
    }
  });

  it('menolak string kosong atau whitespace', () => {
    const result = parseAndValidateProjectBackup('   ');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('kosong');
    }
  });

  it('menolak sintaks JSON yang rusak/cacat', () => {
    const result = parseAndValidateProjectBackup('{ title: "Broken JSON"');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Format JSON tidak valid');
    }
  });

  it('menolak struktur skema yang tidak valid (misal bobot string bukan angka)', () => {
    const invalidData = {
      title: 'Proyek Cacat',
      criteria: [
        {
          id: 'c1',
          name: 'K1',
          type: 'BENEFIT',
          weight: 'BUKAN_ANGKA',
        },
      ],
      alternatives: [],
    };
    const result = parseAndValidateProjectBackup(JSON.stringify(invalidData));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Validasi skema gagal');
    }
  });

  it('sanitizeFilename menghasilkan slug yang aman', () => {
    expect(sanitizeFilename('Evaluasi Vendor (2026) / PT. Maju!')).toBe('evaluasi-vendor-2026-pt-maju');
    expect(sanitizeFilename('   ')).toBe('proyek-spk');
  });
});

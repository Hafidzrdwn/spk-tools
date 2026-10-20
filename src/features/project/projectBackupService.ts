import type { DecisiProjectState } from '@/types/domain';
import { projectStatePersistedSchema } from '@/validators/matrixSchemas';

export interface DecisiBackupPayload {
  format: 'decisigraph-project-backup';
  version: '1.1';
  exportedAt: string;
  project: DecisiProjectState;
}

export function sanitizeFilename(name: string): string {
  const clean = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'proyek-spk';
}

export function createProjectBackup(state: DecisiProjectState): DecisiBackupPayload {
  return {
    format: 'decisigraph-project-backup',
    version: '1.1',
    exportedAt: new Date().toISOString(),
    project: {
      title: state.title || 'Proyek SPK Baru',
      activeMethod: state.activeMethod || 'SAW',
      criteria: state.criteria ?? [],
      alternatives: state.alternatives ?? [],
    },
  };
}

export function serializeProjectBackup(state: DecisiProjectState): string {
  const payload = createProjectBackup(state);
  return JSON.stringify(payload, null, 2);
}

export function downloadProjectBackup(state: DecisiProjectState, filenamePrefix?: string): void {
  const jsonString = serializeProjectBackup(state);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const safeTitle = sanitizeFilename(filenamePrefix || state.title);
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `decisigraph-backup-${safeTitle}-${dateStr}.json`;

  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 1000);
}

export async function copyProjectBackupToClipboard(state: DecisiProjectState): Promise<boolean> {
  const jsonString = serializeProjectBackup(state);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(jsonString);
      return true;
    }
  } catch {
    // fallback below
  }

  // Fallback for non-secure / permission fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = jsonString;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export function parseAndValidateProjectBackup(
  rawInput: string
): { success: true; data: DecisiProjectState } | { success: false; error: string } {
  if (!rawInput || typeof rawInput !== 'string' || !rawInput.trim()) {
    return { success: false, error: 'Data JSON kosong atau tidak terbaca' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawInput.trim());
  } catch (err) {
    return {
      success: false,
      error: `Format JSON tidak valid: ${err instanceof Error ? err.message : 'Sintaks salah'}`,
    };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { success: false, error: 'Isi data harus berupa objek JSON' };
  }

  const obj = parsed as Record<string, unknown>;

  // Check if wrapped in backup envelope { project: ... }
  let targetObj = obj;
  if (obj.project && typeof obj.project === 'object' && obj.project !== null) {
    targetObj = obj.project as Record<string, unknown>;
  } else if (obj.state && typeof obj.state === 'object' && obj.state !== null) {
    // Support zustand persist dump { state: { ... } }
    targetObj = obj.state as Record<string, unknown>;
  }

  // Fallbacks for optional fields
  const normalizedCandidate = {
    title: typeof targetObj.title === 'string' && targetObj.title.trim() ? targetObj.title.trim() : 'Proyek SPK Baru',
    activeMethod:
      typeof targetObj.activeMethod === 'string' &&
      ['SAW', 'WP', 'TOPSIS', 'AHP', 'AUTO', 'COMPARE'].includes(targetObj.activeMethod)
        ? targetObj.activeMethod
        : 'SAW',
    criteria: Array.isArray(targetObj.criteria) ? targetObj.criteria : [],
    alternatives: Array.isArray(targetObj.alternatives) ? targetObj.alternatives : [],
  };

  const validationResult = projectStatePersistedSchema.safeParse(normalizedCandidate);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors
      .slice(0, 3)
      .map((e) => `${e.path.join('.') || 'root'}: ${e.message}`)
      .join(', ');
    return {
      success: false,
      error: `Validasi skema gagal (${errorMessages})`,
    };
  }

  return {
    success: true,
    data: validationResult.data as DecisiProjectState,
  };
}

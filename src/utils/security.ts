export interface RateLimitConfig {
  cooldownSeconds: number;
  maxPerDay: number;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
  remainingCooldownSeconds?: number;
  remainingDailyQuota?: number;
}

const inMemoryCooldownMap = new Map<string, number>();
const inMemoryDailyCountMap = new Map<string, { count: number; date: string }>();

export function sanitizeText(text: string, maxLength = 1000): string {
  if (!text) return '';
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 100) return false;
  const trimmed = email.trim();
  if (trimmed.includes('..')) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

export function validateImageUpload(
  file: File,
  maxSizeBytes = 2 * 1024 * 1024
): { valid: boolean; error?: string } {
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return {
      valid: false,
      error: 'Berkas SVG tidak diizinkan demi keamanan (potensi script tersembunyi). Harap gunakan JPG, PNG, atau WebP.',
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Format gambar harus berupa JPG, PNG, atau WebP.',
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
  if (!hasValidExt) {
    return {
      valid: false,
      error: 'Ekstensi berkas tidak valid. Harap gunakan .jpg, .jpeg, .png, atau .webp.',
    };
  }

  const dotParts = fileNameLower.split('.');
  if (dotParts.length > 2) {
    const dangerousExtensions = ['html', 'htm', 'php', 'js', 'exe', 'sh', 'bat', 'vbs'];
    const hasDangerousMiddle = dotParts.slice(1, -1).some((part) => dangerousExtensions.includes(part));
    if (hasDangerousMiddle) {
      return {
        valid: false,
        error: 'Nama berkas terindikasi memiliki ekstensi ganda yang mencurigakan.',
      };
    }
  }

  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Ukuran gambar terlalu besar. Maksimal ${maxMb} MB.`,
    };
  }

  return { valid: true };
}

export function checkRateLimit(
  actionKey: string,
  config: RateLimitConfig
): RateLimitCheckResult {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  const memLastTime = inMemoryCooldownMap.get(actionKey);
  if (typeof memLastTime === 'number') {
    const memElapsed = Math.floor((now - memLastTime) / 1000);
    if (memElapsed < config.cooldownSeconds) {
      const waitSeconds = config.cooldownSeconds - memElapsed;
      return {
        allowed: false,
        reason: `Mohon tunggu ${waitSeconds} detik lagi sebelum mengirim kembali.`,
        remainingCooldownSeconds: waitSeconds,
      };
    }
  }

  const memDaily = inMemoryDailyCountMap.get(actionKey);
  if (memDaily && memDaily.date === today && memDaily.count >= config.maxPerDay) {
    return {
      allowed: false,
      reason: `Batas pengiriman formulir harian (${config.maxPerDay}x per hari) telah tercapai untuk mencegah spam.`,
      remainingDailyQuota: 0,
    };
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    return { allowed: true };
  }

  try {
    const storageKey = `rate_limit_${actionKey}`;
    const rawData = localStorage.getItem(storageKey);

    if (!rawData) {
      return { allowed: true, remainingDailyQuota: config.maxPerDay };
    }

    const data: { lastTime: number; countToday: number; date: string } = JSON.parse(rawData);

    const elapsedSeconds = Math.floor((now - data.lastTime) / 1000);
    if (elapsedSeconds < config.cooldownSeconds) {
      const waitSeconds = config.cooldownSeconds - elapsedSeconds;
      return {
        allowed: false,
        reason: `Mohon tunggu ${waitSeconds} detik lagi sebelum mengirim kembali.`,
        remainingCooldownSeconds: waitSeconds,
      };
    }

    const countToday = data.date === today ? data.countToday : 0;
    if (countToday >= config.maxPerDay) {
      return {
        allowed: false,
        reason: `Batas pengiriman formulir harian (${config.maxPerDay}x per hari) telah tercapai untuk mencegah spam. Anda dapat menyalin teks laporan secara manual.`,
        remainingDailyQuota: 0,
      };
    }

    return {
      allowed: true,
      remainingDailyQuota: config.maxPerDay - countToday,
    };
  } catch {
    return { allowed: true };
  }
}

export function recordRateLimitSubmission(actionKey: string): void {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  inMemoryCooldownMap.set(actionKey, now);
  const currentMem = inMemoryDailyCountMap.get(actionKey);
  const nextMemCount = currentMem && currentMem.date === today ? currentMem.count + 1 : 1;
  inMemoryDailyCountMap.set(actionKey, { count: nextMemCount, date: today });

  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const storageKey = `rate_limit_${actionKey}`;
    const rawData = localStorage.getItem(storageKey);

    let countToday = 1;
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        if (data.date === today) {
          countToday = (data.countToday || 0) + 1;
        }
      } catch {
        countToday = 1;
      }
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        lastTime: now,
        countToday,
        date: today,
      })
    );
  } catch (err) {
    console.warn('Gagal mencatat rate limit storage:', err);
  }
}

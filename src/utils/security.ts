
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

export function sanitizeText(text: string, maxLength = 1000): string {
  if (!text) return '';
  return text
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
  maxSizeBytes = 5 * 1024 * 1024
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

  if (file.size > maxSizeBytes) {
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Ukuran gambar terlalu besar. Maksimal ${maxMb}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Mengecek apakah pengiriman form diizinkan berdasarkan jeda waktu (cooldown)
 * dan kuota harian untuk mencegah spam dan stress-test pada API kuota terbatas (Web3Forms/Firebase).
 */
export function checkRateLimit(
  actionKey: string,
  config: RateLimitConfig
): RateLimitCheckResult {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { allowed: true };
  }

  try {
    const storageKey = `rate_limit_${actionKey}`;
    const today = new Date().toISOString().slice(0, 10);
    const rawData = localStorage.getItem(storageKey);

    if (!rawData) {
      return { allowed: true, remainingDailyQuota: config.maxPerDay };
    }

    const data: { lastTime: number; countToday: number; date: string } = JSON.parse(rawData);
    const now = Date.now();

    // 1. Cek jeda cooldown
    const elapsedSeconds = Math.floor((now - data.lastTime) / 1000);
    if (elapsedSeconds < config.cooldownSeconds) {
      const waitSeconds = config.cooldownSeconds - elapsedSeconds;
      return {
        allowed: false,
        reason: `Mohon tunggu ${waitSeconds} detik lagi sebelum mengirim kembali.`,
        remainingCooldownSeconds: waitSeconds,
      };
    }

    // 2. Cek kuota harian
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

/**
 * Mencatat pengiriman form yang berhasil ke dalam localStorage
 */
export function recordRateLimitSubmission(actionKey: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const storageKey = `rate_limit_${actionKey}`;
    const today = new Date().toISOString().slice(0, 10);
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
        lastTime: Date.now(),
        countToday,
        date: today,
      })
    );
  } catch (err) {
    console.warn('Gagal mencatat rate limit storage:', err);
  }
}

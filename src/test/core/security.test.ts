import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sanitizeText,
  isValidEmail,
  validateImageUpload,
  checkRateLimit,
  recordRateLimitSubmission,
} from '@/utils/security';
import { sendReportEmailDirect, type ReportEmailPayload } from '@/utils/reportEmail';

describe('Security & Anti-Spam Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('sanitizeText', () => {
    it('membersihkan tag HTML dan karakter < > untuk mencegah XSS', () => {
      const dirty = '<script>alert("xss")</script>Halo Dunia';
      const clean = sanitizeText(dirty);
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
      expect(clean).toBe('scriptalert("xss")/scriptHalo Dunia');
    });

    it('memotong panjang string sesuai maxLength', () => {
      const longText = 'A'.repeat(200);
      const result = sanitizeText(longText, 50);
      expect(result.length).toBe(50);
    });

    it('menangani string kosong atau null/undefined secara aman', () => {
      expect(sanitizeText('')).toBe('');
      // @ts-expect-error test invalid type gracefully
      expect(sanitizeText(null)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('menerima format email valid', () => {
      expect(isValidEmail('pengguna@decisigraph.app')).toBe(true);
      expect(isValidEmail('admin.spk@kampus.ac.id')).toBe(true);
      expect(isValidEmail('test_user+tag@domain.co')).toBe(true);
    });

    it('menolak format email tidak valid atau berisiko', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('bukan-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
      expect(isValidEmail('user@domain..com')).toBe(false);
      expect(isValidEmail('a'.repeat(95) + '@domain.com')).toBe(false); // > 100 chars
    });
  });

  describe('validateImageUpload', () => {
    it('menerima format gambar raster yang aman (JPEG, PNG, WebP)', () => {
      const jpgFile = new File(['dummy content'], 'screenshot.jpg', { type: 'image/jpeg' });
      const pngFile = new File(['dummy content'], 'bukti.png', { type: 'image/png' });
      const webpFile = new File(['dummy content'], 'error.webp', { type: 'image/webp' });

      expect(validateImageUpload(jpgFile).valid).toBe(true);
      expect(validateImageUpload(pngFile).valid).toBe(true);
      expect(validateImageUpload(webpFile).valid).toBe(true);
    });

    it('menolak berkas SVG demi mencegah Stored XSS / embedded script', () => {
      const svgFile = new File(['<svg onload="alert(1)"></svg>'], 'vector.svg', {
        type: 'image/svg+xml',
      });
      const res = validateImageUpload(svgFile);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('SVG tidak diizinkan demi keamanan');
    });

    it('menolak format non-gambar seperti PDF atau executable', () => {
      const exeFile = new File(['binary'], 'virus.exe', { type: 'application/x-msdownload' });
      const pdfFile = new File(['pdf'], 'dokumen.pdf', { type: 'application/pdf' });

      expect(validateImageUpload(exeFile).valid).toBe(false);
      expect(validateImageUpload(pdfFile).valid).toBe(false);
    });

    it('menolak berkas yang melebihi batas ukuran maksimal', () => {
      const bigBuffer = new Uint8Array(6 * 1024 * 1024);
      const largeFile = new File([bigBuffer], 'giant.png', { type: 'image/png' });
      const res = validateImageUpload(largeFile, 5 * 1024 * 1024);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Ukuran gambar terlalu besar');
    });
  });

  describe('Rate Limiting & Cooldown Protection', () => {
    it('mengizinkan pengiriman awal jika belum pernah mengirim', () => {
      const check = checkRateLimit('test_action', { cooldownSeconds: 30, maxPerDay: 3 });
      expect(check.allowed).toBe(true);
      expect(check.remainingDailyQuota).toBe(3);
    });

    it('menahan pengiriman jika masih dalam durasi cooldown', () => {
      recordRateLimitSubmission('test_action');

      const check = checkRateLimit('test_action', { cooldownSeconds: 60, maxPerDay: 3 });
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('Mohon tunggu');
      expect(check.remainingCooldownSeconds).toBeGreaterThan(0);
    });

    it('menolak pengiriman jika kuota harian telah habis', () => {
      const today = new Date().toISOString().slice(0, 10);
      // Simulasikan 3 kali pengiriman hari ini dengan jeda waktu lampau
      localStorage.setItem(
        'rate_limit_capped_action',
        JSON.stringify({
          lastTime: Date.now() - 100000, // cooldown lewat
          countToday: 3,
          date: today,
        })
      );

      const check = checkRateLimit('capped_action', { cooldownSeconds: 10, maxPerDay: 3 });
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('Batas pengiriman formulir harian');
      expect(check.remainingDailyQuota).toBe(0);
    });
  });

  describe('Honeypot Bot Trap in sendReportEmailDirect', () => {
    it('segera merespon sukses dan TIDAK memanggil API jika botHoneypot terisi', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      const payloadWithBot: ReportEmailPayload = {
        name: 'Spam Bot 3000',
        email: 'spammer@bot.net',
        category: 'BUG',
        title: 'Cheap Pills Online',
        description: 'Buy now click here http://spam.xyz',
        botHoneypot: 'filled_by_automated_bot_crawler',
      };

      const result = await sendReportEmailDirect(payloadWithBot, 'mock_access_key');
      expect(result.success).toBe(true);
      expect(result.message).toContain('berhasil dikirim');
      // Kuota API aman karena fetch sama sekali tidak dipanggil!
      expect(fetchSpy).not.toHaveBeenCalled();

      fetchSpy.mockRestore();
    });
  });
});

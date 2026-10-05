import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  subscribeToReviews,
  submitReview,
  subscribeToAnalytics,
  trackPageView,
  shouldTrackRouteToday,
  getClientEnvironmentInfo,
} from '@/services/firebase';
import {
  formatReportEmailBody,
  openEmailClientWithReport,
  sendReportEmailDirect,
  copyReportToClipboard,
  type ReportEmailPayload,
} from '@/utils/reportEmail';
import { formatRelativeTime } from '@/utils/dateFormatter';

describe('Firebase Service & Fallback Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('subscribeToReviews mengembalikan fungsi unsubscribe yang valid', () => {
    const unsub = subscribeToReviews((revs) => {
      expect(Array.isArray(revs)).toBe(true);
    });
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('submitReview berhasil menyimpan review saat terkonfigurasi atau melempar error informatif saat belum terkonfigurasi', async () => {
    try {
      const res = await submitReview({
        name: 'Tester Unit',
        role: 'QA Engineer',
        rating: 5,
        comment: 'Kalkulasi TOPSIS sangat akurat dan transparan.',
      });
      expect(res.success).toBe(true);
      expect(typeof res.id).toBe('string');
    } catch (err: any) {
      expect(err.message).toContain('Firebase Realtime Database belum terkonfigurasi');
    }
  });

  it('subscribeToAnalytics menyediakan handler unsubscribe dan callback valid', () => {
    const unsub = subscribeToAnalytics((data) => {
      expect(data).toHaveProperty('totalViews');
      expect(data).toHaveProperty('deviceBreakdown');
    });
    expect(typeof unsub).toBe('function');
    unsub();
  });

  it('getClientEnvironmentInfo mendeteksi info platform dari navigator', () => {
    const info = getClientEnvironmentInfo();
    expect(info).toHaveProperty('device');
    expect(info).toHaveProperty('browser');
    expect(info).toHaveProperty('os');
  });

  it('getClientEnvironmentInfo mendeteksi Android Mobile secara akurat (bukan Linux)', () => {
    // Android Chrome
    const androidChromeUA = 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    const res1 = getClientEnvironmentInfo(androidChromeUA);
    expect(res1.os).toBe('Android');
    expect(res1.device).toBe('Mobile');
    expect(res1.browser).toBe('Chrome');

    // Android Firefox
    const androidFirefoxUA = 'Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0';
    const res2 = getClientEnvironmentInfo(androidFirefoxUA);
    expect(res2.os).toBe('Android');
    expect(res2.device).toBe('Mobile');
    expect(res2.browser).toBe('Firefox');
  });

  it('getClientEnvironmentInfo mendeteksi iPhone iOS dan Firefox iOS (FxiOS) secara akurat', () => {
    // iPhone Safari
    const iPhoneSafariUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
    const res1 = getClientEnvironmentInfo(iPhoneSafariUA);
    expect(res1.os).toBe('iOS');
    expect(res1.device).toBe('Mobile');
    expect(res1.browser).toBe('Safari');

    // iPhone Firefox (FxiOS)
    const iPhoneFirefoxUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15';
    const res2 = getClientEnvironmentInfo(iPhoneFirefoxUA);
    expect(res2.os).toBe('iOS');
    expect(res2.device).toBe('Mobile');
    expect(res2.browser).toBe('Firefox');
  });

  it('getClientEnvironmentInfo mendeteksi Desktop Windows Edge dan Desktop Linux Firefox', () => {
    // Windows Edge
    const winEdgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
    const res1 = getClientEnvironmentInfo(winEdgeUA);
    expect(res1.os).toBe('Windows');
    expect(res1.device).toBe('Desktop');
    expect(res1.browser).toBe('Edge');

    // Desktop Linux Firefox
    const linuxFirefoxUA = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0';
    const res2 = getClientEnvironmentInfo(linuxFirefoxUA);
    expect(res2.os).toBe('Linux');
    expect(res2.device).toBe('Desktop');
    expect(res2.browser).toBe('Firefox');
  });

  it('trackPageView mencatat kunjungan pertama dan mengabaikan refresh berulang pada rute yang sama', async () => {
    const firstCall = await trackPageView('/test-route');
    expect(typeof firstCall).toBe('boolean');

    // Kunjungan kedua (refresh) pada rute yang sama langsung di-skip (false)
    const secondCall = await trackPageView('/test-route');
    expect(secondCall).toBe(false);
  });

  it('shouldTrackRouteToday mendeduplikasi kunjungan pada hari dan rute yang sama', () => {
    const today = '2026-10-06';
    // Kunjungan pertama rute /
    expect(shouldTrackRouteToday('/', today)).toBe(true);

    // Kunjungan kedua (refresh) pada rute / di hari yang sama -> di-skip
    expect(shouldTrackRouteToday('/', today)).toBe(false);
    expect(shouldTrackRouteToday('/?ref=navbar', today)).toBe(false);

    // Kunjungan pertama ke rute lain (/board) pada hari yang sama -> dicatat
    expect(shouldTrackRouteToday('/board', today)).toBe(true);

    // Refresh pada rute /board -> di-skip
    expect(shouldTrackRouteToday('/board', today)).toBe(false);

    // Kunjungan pada hari berikutnya (tanggal baru) -> dicatat kembali dan membersihkan cache lama
    const tomorrow = '2026-10-07';
    expect(shouldTrackRouteToday('/', tomorrow)).toBe(true);
    expect(shouldTrackRouteToday('/board', tomorrow)).toBe(true);
  });
});

describe('Report Email Helper Module', () => {
  const dummyPayload: ReportEmailPayload = {
    name: 'Ahmad Faiz',
    email: 'faiz@example.com',
    category: 'BUG',
    title: 'Perhitungan AHP CR tidak sinkron saat 4 kriteria',
    description: 'Ketika matriks bernilai pecahan 1/3, hasil lambdaMax melonjak di baris ketiga.',
    attachmentName: 'screenshot_error.png',
  };

  it('formatReportEmailBody menghasilkan format teks email yang terstruktur', () => {
    const text = formatReportEmailBody(dummyPayload);

    expect(text).toContain('[LAPORAN DECISIGRAPH v1.1 - BUG]');
    expect(text).toContain('Ahmad Faiz');
    expect(text).toContain('faiz@example.com');
    expect(text).toContain('screenshot_error.png');
    expect(text).toContain('INFORMASI SISTEM & BROWSER');
    expect(text).toContain('Ketika matriks bernilai pecahan 1/3');
  });

  it('openEmailClientWithReport memanggil window.open dengan URL mailto yang valid', () => {
    const originalOpen = window.open;
    const mockOpen = vi.fn();
    window.open = mockOpen;

    const result = openEmailClientWithReport(dummyPayload, 'admin@decisigraph.app');
    expect(result).toBe(true);
    expect(mockOpen).toHaveBeenCalled();
    const calledUrl = mockOpen.mock.calls[0][0];
    expect(calledUrl).toContain('mailto:admin@decisigraph.app');
    expect(calledUrl).toContain('subject=');
    expect(calledUrl).toContain('body=');

    window.open = originalOpen;
  });

  it('copyReportToClipboard memanggil navigator.clipboard.writeText', async () => {
    const originalClipboard = navigator.clipboard;
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const res = await copyReportToClipboard(dummyPayload);
    expect(res).toBe(true);
    expect(writeTextMock).toHaveBeenCalled();

    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it('sendReportEmailDirect mengembalikan pesan kesalahan jika accessKey tidak tersedia', async () => {
    const res = await sendReportEmailDirect(dummyPayload, '');
    expect(res.success).toBe(false);
    expect(res.message).toContain('Kunci akses Web3Forms belum dikonfigurasi');
  });

  it('sendReportEmailDirect berhasil mengirim request ke Web3Forms API dan merespon sukses', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Form submitted successfully' }),
    });

    const res = await sendReportEmailDirect(dummyPayload, 'mock-access-key');
    expect(res.success).toBe(true);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.web3forms.com/submit',
      expect.objectContaining({
        method: 'POST',
      })
    );

    globalThis.fetch = originalFetch;
  });

  it('sendReportEmailDirect menangani kegagalan API atau jaringan dengan baik', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

    const res = await sendReportEmailDirect(dummyPayload, 'mock-access-key');
    expect(res.success).toBe(false);
    expect(res.message).toBe('Network offline');

    globalThis.fetch = originalFetch;
  });
});

describe('Clean Path Routing & pathToView Helper', () => {
  it('memetakan path URL secara benar ke AppView', async () => {
    const { pathToView, useUiStore } = await import('@/store/useUiStore');

    expect(pathToView('/')).toBe('landing');
    expect(pathToView('')).toBe('landing');
    expect(pathToView('/board')).toBe('board');
    expect(pathToView('/board/')).toBe('board');
    expect(pathToView('/workboard')).toBe('board');
    expect(pathToView('/review')).toBe('review');
    expect(pathToView('/reviews')).toBe('review');
    expect(pathToView('/analytics')).toBe('analytics');

    // Test setCurrentView
    useUiStore.getState().setCurrentView('board');
    expect(useUiStore.getState().currentView).toBe('board');

    useUiStore.getState().setCurrentView('review');
    expect(useUiStore.getState().currentView).toBe('review');

    useUiStore.getState().setCurrentView('analytics');
    expect(useUiStore.getState().currentView).toBe('analytics');

    useUiStore.getState().setCurrentView('landing');
    expect(useUiStore.getState().currentView).toBe('landing');
  });
});

describe('formatRelativeTime Utility', () => {
  const baseTime = new Date('2026-10-06T12:00:00.000Z');

  it('mengembalikan "-" untuk input kosong atau tanggal tidak valid', () => {
    expect(formatRelativeTime('')).toBe('-');
    expect(formatRelativeTime('invalid-date')).toBe('-');
  });

  it('mengembalikan "Baru saja" untuk waktu kurang dari 60 detik (bukan "0 menit yang lalu")', () => {
    // 0 detik
    expect(formatRelativeTime(baseTime, baseTime)).toBe('Baru saja');

    // 30 detik yang lalu
    const thirtySecAgo = new Date(baseTime.getTime() - 30 * 1000);
    expect(formatRelativeTime(thirtySecAgo, baseTime)).toBe('Baru saja');

    // 45 detik yang lalu (kasus spesifik yang sebelumnya bug "0 menit yang lalu")
    const fortyFiveSecAgo = new Date(baseTime.getTime() - 45 * 1000);
    expect(formatRelativeTime(fortyFiveSecAgo, baseTime)).toBe('Baru saja');

    // 59 detik yang lalu
    const fiftyNineSecAgo = new Date(baseTime.getTime() - 59 * 1000);
    expect(formatRelativeTime(fiftyNineSecAgo, baseTime)).toBe('Baru saja');
  });

  it('mengembalikan format menit yang tepat mulai detik ke-60', () => {
    // 60 detik yang lalu -> 1 menit
    const oneMinAgo = new Date(baseTime.getTime() - 60 * 1000);
    expect(formatRelativeTime(oneMinAgo, baseTime)).toBe('1 menit yang lalu');

    // 119 detik yang lalu -> 1 menit
    const almostTwoMinAgo = new Date(baseTime.getTime() - 119 * 1000);
    expect(formatRelativeTime(almostTwoMinAgo, baseTime)).toBe('1 menit yang lalu');

    // 120 detik yang lalu -> 2 menit
    const twoMinAgo = new Date(baseTime.getTime() - 120 * 1000);
    expect(formatRelativeTime(twoMinAgo, baseTime)).toBe('2 menit yang lalu');
  });

  it('mengembalikan format jam dan hari yang tepat', () => {
    // 1 jam yang lalu
    const oneHourAgo = new Date(baseTime.getTime() - 3600 * 1000);
    expect(formatRelativeTime(oneHourAgo, baseTime)).toBe('1 jam yang lalu');

    // 2 hari yang lalu
    const twoDaysAgo = new Date(baseTime.getTime() - 2 * 86400 * 1000);
    expect(formatRelativeTime(twoDaysAgo, baseTime)).toBe('2 hari yang lalu');
  });
});


import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  subscribeToReviews,
  submitReview,
  subscribeToAnalytics,
  trackPageView,
  getClientEnvironmentInfo,
} from '@/services/firebase';
import {
  formatReportEmailBody,
  openEmailClientWithReport,
  copyReportToClipboard,
  type ReportEmailPayload,
} from '@/utils/reportEmail';

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

  it('trackPageView berjalan dengan aman tanpa error saat database unconfigured', async () => {
    await expect(trackPageView('/board')).resolves.toBeUndefined();
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


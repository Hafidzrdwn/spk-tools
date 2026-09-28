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

  it('subscribeToReviews mengembalikan daftar review default saat database lokal kosong', () => {
    let capturedReviews: any[] = [];
    const unsub = subscribeToReviews((revs) => {
      capturedReviews = revs;
    });

    expect(capturedReviews.length).toBeGreaterThanOrEqual(1);
    expect(capturedReviews[0]).toHaveProperty('name');
    expect(capturedReviews[0]).toHaveProperty('rating');
    expect(capturedReviews[0]).toHaveProperty('comment');
    unsub();
  });

  it('submitReview berhasil menambahkan ulasan baru ke store realtime', async () => {
    const res = await submitReview({
      name: 'Tester Unit',
      role: 'QA Engineer',
      rating: 5,
      comment: 'Kalkulasi TOPSIS sangat akurat dan transparan.',
    });

    expect(res.success).toBe(true);
    expect(res.id).toBeDefined();

    let updatedReviews: any[] = [];
    const unsub = subscribeToReviews((revs) => {
      updatedReviews = revs;
    });

    const found = updatedReviews.find((r) => r.name === 'Tester Unit');
    expect(found).toBeDefined();
    expect(found?.rating).toBe(5);
    expect(found?.comment).toContain('TOPSIS');
    unsub();
  });

  it('subscribeToAnalytics menyediakan metrik page views dan breakdown perangkat', () => {
    let analyticsData: any = null;
    const unsub = subscribeToAnalytics((data) => {
      analyticsData = data;
    });

    expect(analyticsData).not.toBeNull();
    expect(analyticsData.totalViews).toBeGreaterThan(0);
    expect(analyticsData.deviceBreakdown).toHaveProperty('desktop');
    expect(analyticsData.deviceBreakdown).toHaveProperty('mobile');
    unsub();
  });

  it('trackPageView mencatat penambahan view dan visit log', async () => {
    await trackPageView('/test-path');

    let analyticsData: any = null;
    const unsub = subscribeToAnalytics((data) => {
      analyticsData = data;
    });

    expect(analyticsData.recentVisits.some((v: any) => v.path === '/test-path')).toBe(true);
    unsub();
  });

  it('getClientEnvironmentInfo mendeteksi info platform dari navigator', () => {
    const info = getClientEnvironmentInfo();
    expect(info).toHaveProperty('device');
    expect(info).toHaveProperty('browser');
    expect(info).toHaveProperty('os');
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

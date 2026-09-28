import { getClientEnvironmentInfo } from '@/services/firebase';

export interface ReportEmailPayload {
  name: string;
  email: string;
  category: 'BUG' | 'KELUHAN' | 'FEEDBACK' | 'FEATURE_REQUEST';
  title: string;
  description: string;
  attachmentName?: string;
  attachmentDataUrl?: string; // base64 data url for preview
}

const DEFAULT_TARGET_EMAIL =
  import.meta.env.VITE_ADMIN_REPORT_EMAIL || 'test@example.com';

/**
 * Format teks email laporan yang rapi dan terstruktur
 */
export function formatReportEmailBody(payload: ReportEmailPayload): string {
  const env = getClientEnvironmentInfo();
  const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' });

  return `[LAPORAN DECISIGRAPH v1.1 - ${payload.category}]
==================================================

1. INFORMASI PELAPOR:
   - Nama Pengguna : ${payload.name}
   - Email Kontak  : ${payload.email}
   - Waktu Kirim   : ${timestamp}

2. DETAIL LAPORAN:
   - Kategori Masalah : ${payload.category}
   - Judul / Topik    : ${payload.title}
   - Rincian Masalah  :
--------------------------------------------------
${payload.description}
--------------------------------------------------

3. INFORMASI SISTEM & BROWSER (DIAGNOSTIK):
   - Perangkat : ${env.device}
   - Browser   : ${env.browser}
   - OS        : ${env.os}
   - User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}
   - Lampiran  : ${payload.attachmentName ? `Ada (${payload.attachmentName})` : 'Tidak ada'}

==================================================
Dikirim secara otomatis melalui Formulir Laporan DecisiGraph v1.1`;
}

/**
 * Buka client email pengguna (Outlook, Gmail, Thunderbird, Mail app)
 * dengan subject dan body yang sudah diformat rapi
 */
export function openEmailClientWithReport(payload: ReportEmailPayload, targetEmail = DEFAULT_TARGET_EMAIL): boolean {
  const subject = encodeURIComponent(`[DecisiGraph ${payload.category}] ${payload.title} - dari ${payload.name}`);
  const body = encodeURIComponent(formatReportEmailBody(payload));
  const mailtoUrl = `mailto:${targetEmail}?subject=${subject}&body=${body}`;

  try {
    window.open(mailtoUrl, '_blank');
    return true;
  } catch (err) {
    console.error('Gagal membuka mailto client:', err);
    return false;
  }
}

/**
 * Salin laporan teks rapi ke clipboard
 */
export async function copyReportToClipboard(payload: ReportEmailPayload): Promise<boolean> {
  try {
    const text = formatReportEmailBody(payload);
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

import { getClientEnvironmentInfo } from '@/services/firebase';
import { sanitizeText } from '@/utils/security';

export interface ReportEmailPayload {
  name: string;
  email: string;
  category: 'BUG' | 'KELUHAN' | 'FEEDBACK' | 'FEATURE_REQUEST';
  title: string;
  description: string;
  attachmentName?: string;
  attachmentDataUrl?: string; // base64 data url for preview
  botHoneypot?: string; // Silent bot-catcher field to safeguard free API quota
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

export interface SendReportResult {
  success: boolean;
  message?: string;
}

export async function sendReportEmailDirect(
  payload: ReportEmailPayload,
  accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
): Promise<SendReportResult> {
  if (payload.botHoneypot && payload.botHoneypot.trim() !== '') {
    return {
      success: true,
      message: 'Laporan kendala berhasil dikirim otomatis ke email tim pengembang.',
    };
  }

  if (!accessKey) {
    return {
      success: false,
      message: 'Kunci akses Web3Forms belum dikonfigurasi. Harap isi VITE_WEB3FORMS_ACCESS_KEY pada file .env.',
    };
  }

  const cleanName = sanitizeText(payload.name, 100);
  const cleanEmail = sanitizeText(payload.email, 100);
  const cleanTitle = sanitizeText(payload.title, 150);
  const cleanDescription = sanitizeText(payload.description, 2000);

  const env = getClientEnvironmentInfo();
  const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' });
  const subject = `[DecisiGraph ${payload.category}] ${cleanTitle} - dari ${cleanName}`;

  const bodyData: Record<string, string> = {
    access_key: accessKey,
    subject: subject,
    from_name: `DecisiGraph (${cleanName})`,
    name: cleanName,
    email: cleanEmail,
    category: payload.category,
    title: cleanTitle,
    message: cleanDescription,
    device: env.device,
    browser: env.browser,
    os: env.os,
    sent_at: timestamp,
  };

  if (payload.attachmentName) {
    bodyData.attachment_name = sanitizeText(payload.attachmentName, 100);
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: 'Laporan kendala berhasil dikirim otomatis ke email tim pengembang.',
      };
    }

    return {
      success: false,
      message: data.message || 'Gagal mengirim laporan ke server email.',
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Terjadi kendala jaringan saat mengirim laporan.';
    return {
      success: false,
      message: msg,
    };
  }
}

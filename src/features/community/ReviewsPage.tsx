import React, { useState, useEffect, useRef } from 'react';
import {
  subscribeToReviews,
  submitReview,
  type ReviewItem,
} from '@/services/firebase';
import {
  sendReportEmailDirect,
  copyReportToClipboard,
  type ReportEmailPayload,
} from '@/utils/reportEmail';
import {
  sanitizeText,
  isValidEmail,
  validateImageUpload,
  checkRateLimit,
  recordRateLimitSubmission,
} from '@/utils/security';
import { formatRelativeTime } from '@/utils/dateFormatter';
import StarRatingInput from '@/components/ui/StarRatingInput';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { toast } from 'sonner';
import {
  Star,
  Send,
  Upload,
  X,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const [formMode, setFormMode] = useState<'review' | 'bug'>('review');

  // Reviews State & Realtime Subscription
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Form Review State
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('Pengambil Keputusan');
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewErrors, setReviewErrors] = useState<{ name?: string; comment?: string }>({});

  // Form Bug Report State
  const [bugName, setBugName] = useState('');
  const [bugEmail, setBugEmail] = useState('');
  const [bugCategory, setBugCategory] = useState<'BUG' | 'KELUHAN' | 'FEEDBACK' | 'FEATURE_REQUEST'>('BUG');
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [botHoneypot, setBotHoneypot] = useState(''); // Anti-bot honeypot trap
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bugErrors, setBugErrors] = useState<{
    name?: string;
    email?: string;
    title?: string;
    description?: string;
  }>({});
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [bugSubmitStatus, setBugSubmitStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubReviews = subscribeToReviews((data) => {
      setReviews(data);
      setIsLoadingReviews(false);
    });

    return () => {
      unsubReviews();
    };
  }, []);

  // Upload handler for bug report screenshots
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageUpload(file, 5 * 1024 * 1024);
    if (!validation.valid) {
      toast.error(validation.error || 'Format berkas gambar tidak diizinkan demi keamanan.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate Limit: 30 detik cooldown, maksimal 5 ulasan/hari
    const rateCheck = checkRateLimit('community_review', { cooldownSeconds: 30, maxPerDay: 5 });
    if (!rateCheck.allowed) {
      toast.error(rateCheck.reason || 'Batas pengiriman ulasan tercapai.');
      return;
    }

    const cleanName = sanitizeText(reviewerName, 60);
    const cleanComment = sanitizeText(reviewComment, 1000);

    const errors: { name?: string; comment?: string } = {};
    if (!cleanName) {
      errors.name = 'Nama lengkap wajib diisi.';
    }
    if (!cleanComment) {
      errors.comment = 'Ulasan wajib diisi.';
    } else if (cleanComment.length < 5) {
      errors.comment = 'Ulasan minimal 5 karakter.';
    }

    if (Object.keys(errors).length > 0) {
      setReviewErrors(errors);
      toast.error('Silakan lengkapi formulir ulasan dengan benar.');
      return;
    }

    setReviewErrors({});
    setIsSubmittingReview(true);
    try {
      await submitReview({
        name: cleanName,
        role: sanitizeText(reviewerRole, 50),
        rating: ratingScore,
        comment: cleanComment,
      });
      recordRateLimitSubmission('community_review');
      toast.success('Terima kasih! Ulasan Anda berhasil diterbitkan.');
      setReviewComment('');
      setReviewerName('');
    } catch {
      toast.error('Gagal mengirim ulasan. Silakan coba sesaat lagi.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Validate Bug Report fields
  const validateBugReport = (): boolean => {
    const errors: { name?: string; email?: string; title?: string; description?: string } = {};

    const cleanName = sanitizeText(bugName, 60);
    const cleanEmail = sanitizeText(bugEmail, 100);
    const cleanTitle = sanitizeText(bugTitle, 120);
    const cleanDesc = sanitizeText(bugDescription, 2000);

    if (!cleanName) {
      errors.name = 'Nama pelapor wajib diisi.';
    }

    if (!cleanEmail) {
      errors.email = 'Email kontak wajib diisi.';
    } else if (!isValidEmail(cleanEmail)) {
      errors.email = 'Format alamat email tidak valid (maksimal 100 karakter).';
    }

    if (!cleanTitle) {
      errors.title = 'Topik kendala wajib diisi.';
    }

    if (!cleanDesc) {
      errors.description = 'Rincian kendala wajib diisi.';
    } else if (cleanDesc.length < 10) {
      errors.description = 'Jelaskan kendala minimal 10 karakter.';
    }

    setBugErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Send Bug Report Email Otomatis dengan proteksi kuota & anti-bot
  const handleSendBugReportEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBugSubmitStatus(null);

    // 1. Silent Honeypot Trap: Jika bot mengisi field tersembunyi, langsung tanggapi sukses
    // tanpa pernah memanggil Web3Forms API agar kuota 250/bulan tetap aman
    if (botHoneypot && botHoneypot.trim() !== '') {
      toast.success('Laporan berhasil dikirim langsung ke email pengembang!');
      setBugSubmitStatus({
        type: 'success',
        message: 'Terima kasih! Laporan kendala Anda telah kami terima dan akan segera ditindaklanjuti oleh pengembang.',
      });
      setBugName('');
      setBugEmail('');
      setBugCategory('BUG');
      setBugTitle('');
      setBugDescription('');
      setBotHoneypot('');
      removeImage();
      setBugErrors({});
      return;
    }

    if (!validateBugReport()) {
      toast.error('Harap lengkapi semua kolom bertanda * dengan benar.');
      return;
    }

    // 2. Rate Limit & Cooldown Check: 60 detik cooldown, maksimal 3 laporan per hari
    const rateCheck = checkRateLimit('bug_report_email', { cooldownSeconds: 60, maxPerDay: 3 });
    if (!rateCheck.allowed) {
      toast.error(rateCheck.reason || 'Batas pengiriman laporan tercapai.');
      setBugSubmitStatus({
        type: 'error',
        message: rateCheck.reason || 'Batas pengiriman laporan harian telah tercapai untuk mencegah spam.',
      });
      return;
    }

    setIsSubmittingBug(true);

    const payload: ReportEmailPayload = {
      name: sanitizeText(bugName, 60),
      email: sanitizeText(bugEmail, 100),
      category: bugCategory,
      title: sanitizeText(bugTitle, 120),
      description: sanitizeText(bugDescription, 2000),
      attachmentName: imageFile ? sanitizeText(imageFile.name, 100) : undefined,
      attachmentDataUrl: imagePreview || undefined,
      botHoneypot: botHoneypot,
    };

    try {
      const result = await sendReportEmailDirect(payload);
      if (result.success) {
        recordRateLimitSubmission('bug_report_email');
        toast.success('Laporan berhasil dikirim langsung ke email pengembang!');
        setBugSubmitStatus({
          type: 'success',
          message: 'Terima kasih! Laporan kendala Anda telah kami terima dan akan segera ditindaklanjuti oleh pengembang.',
        });
        // Reset form
        setBugName('');
        setBugEmail('');
        setBugCategory('BUG');
        setBugTitle('');
        setBugDescription('');
        setBotHoneypot('');
        removeImage();
        setBugErrors({});
      } else {
        toast.error(result.message || 'Gagal mengirim laporan kendala.');
        setBugSubmitStatus({
          type: 'error',
          message: result.message || 'Gagal mengirim laporan. Periksa koneksi internet atau kunci akses API.',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat mengirim laporan.';
      toast.error(msg);
      setBugSubmitStatus({ type: 'error', message: msg });
    } finally {
      setIsSubmittingBug(false);
    }
  };

  const handleCopyBugReport = async () => {
    if (!validateBugReport()) {
      toast.error('Lengkapi formulir bertanda * terlebih dahulu sebelum menyalin.');
      return;
    }

    const payload: ReportEmailPayload = {
      name: sanitizeText(bugName, 60),
      email: sanitizeText(bugEmail, 100) || 'user@decisigraph.app',
      category: bugCategory,
      title: sanitizeText(bugTitle, 120),
      description: sanitizeText(bugDescription, 2000),
      attachmentName: imageFile ? sanitizeText(imageFile.name, 100) : undefined,
    };

    const copied = await copyReportToClipboard(payload);
    if (copied) {
      toast.success('Draf laporan berhasil disalin ke clipboard!');
    } else {
      toast.error('Gagal menyalin ke clipboard.');
    }
  };

  // Average Rating
  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '-';

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="space-y-1 text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Ulasan Komunitas & Pusat Masukan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Sampaikan evaluasi pengalaman Anda menggunakan DecisiGraph atau laporkan kendala operasional untuk penyempurnaan sistem.
        </p>
      </div>

      {/* Main Grid: Form (Left 5 Cols) & Reviews Stream (Right 7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Container */}
        <div className="lg:col-span-5 space-y-4">
          {/* Neutral Clean Form Mode Selector */}
          <div className="p-1 bg-slate-100 rounded-lg flex items-center gap-1 text-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setFormMode('review')}
              className={`flex-1 min-h-11 flex items-center justify-center py-2 px-3 rounded-md transition-colors cursor-pointer text-center font-medium ${
                formMode === 'review'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Beri Ulasan
            </button>
            <button
              type="button"
              onClick={() => setFormMode('bug')}
              className={`flex-1 min-h-11 flex items-center justify-center py-2 px-3 rounded-md transition-colors cursor-pointer text-center font-medium ${
                formMode === 'bug'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lapor Kendala
            </button>
          </div>

          {/* Form A: Kirim Ulasan */}
          {formMode === 'review' && (
            <Card className="border-slate-200 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Tulis Penilaian & Ulasan
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Ulasan Anda akan langsung tampil secara terbuka pada linimasa komunitas.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  {/* Clean Interactive Star Rating Input */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-700 block">
                      Tingkat Kepuasan Anda <span className="text-rose-500">*</span>
                    </label>
                    <StarRatingInput
                      value={ratingScore}
                      onChange={setRatingScore}
                      size="lg"
                      showLabel={true}
                    />
                  </div>

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={60}
                      value={reviewerName}
                      onChange={(e) => {
                        setReviewerName(e.target.value);
                        if (reviewErrors.name) setReviewErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Contoh: Rian Anggoro"
                      className={`w-full px-3 py-1.5 sm:py-2 bg-slate-50 border rounded-lg outline-none transition-colors font-medium text-slate-900 text-sm sm:text-xs min-h-10 sm:min-h-9 ${
                        reviewErrors.name
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                    {reviewErrors.name && (
                      <span className="text-[11px] text-rose-600 font-medium block">
                        {reviewErrors.name}
                      </span>
                    )}
                  </div>

                  {/* Role Selector (Optional) */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 flex items-center justify-between">
                      <span>Peran / Profesi</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <select
                      value={reviewerRole}
                      onChange={(e) => setReviewerRole(e.target.value)}
                      className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 text-sm sm:text-xs min-h-10 sm:min-h-9"
                    >
                      <option value="Pengambil Keputusan">Pengambil Keputusan / Manajer</option>
                      <option value="Mahasiswa">Mahasiswa / Peneliti</option>
                      <option value="Dosen">Dosen / Akademisi</option>
                      <option value="Data Analyst">Data Analyst / Engineer</option>
                      <option value="Umum">Pengguna Umum</option>
                    </select>
                  </div>

                  {/* Comment Textarea */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Ulasan & Masukan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={reviewComment}
                      onChange={(e) => {
                        setReviewComment(e.target.value);
                        if (reviewErrors.comment) setReviewErrors((prev) => ({ ...prev, comment: undefined }));
                      }}
                      placeholder="Bagikan pengalaman kalkulasi SPK, transparansi KaTeX, atau kemudahan komparasi metode..."
                      className={`w-full px-3 py-1.5 sm:py-2 bg-slate-50 border rounded-lg outline-none transition-colors font-medium resize-none leading-relaxed text-slate-900 text-sm sm:text-xs min-h-20 sm:min-h-18 ${
                        reviewErrors.comment
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-200 focus:bg-white focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                    {reviewErrors.comment && (
                      <span className="text-[11px] text-rose-600 font-medium block">
                        {reviewErrors.comment}
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmittingReview}
                    className="w-full min-h-11 justify-center py-2.5 text-xs font-semibold shadow-2xs gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Form B: Lapor Kendala / Bug */}
          {formMode === 'bug' && (
            <Card className="border-slate-200 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Laporkan Kendala Teknis
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Kirimkan detail kendala, bug kalkulasi, atau masukan sistem langsung secara otomatis ke email tim pengembang.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSendBugReportEmail} className="space-y-3.5 text-xs">
                  {/* Status Banner (Success / Error Feedback) */}
                  {bugSubmitStatus && (
                    <div
                      className={`p-3 rounded-xl border flex items-start gap-2.5 animate-in fade-in duration-200 ${
                        bugSubmitStatus.type === 'success'
                          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50/90 border-rose-200 text-rose-800'
                      }`}
                    >
                      {bugSubmitStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 text-xs leading-relaxed">
                        <span className="font-semibold block mb-0.5">
                          {bugSubmitStatus.type === 'success' ? 'Laporan Terkirim!' : 'Gagal Mengirim Laporan'}
                        </span>
                        <span>{bugSubmitStatus.message}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBugSubmitStatus(null)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title="Tutup pesan"
                        aria-label="Tutup pesan notifikasi"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {/* Honeypot Anti-Spam Bot Trap (Invisible to real users, catches automated spam bots) */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="company_website">Website</label>
                    <input
                      id="company_website"
                      type="text"
                      name="company_website"
                      value={botHoneypot}
                      onChange={(e) => setBotHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">
                        Nama Anda <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={60}
                        value={bugName}
                        onChange={(e) => {
                          setBugName(e.target.value);
                          if (bugErrors.name) setBugErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="Nama pelapor"
                        className={`w-full px-3 py-1.5 sm:py-2 bg-slate-50 border rounded-lg outline-none font-medium text-slate-900 text-sm sm:text-xs min-h-10 sm:min-h-9 ${
                          bugErrors.name ? 'border-rose-400 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                      {bugErrors.name && (
                        <span className="text-[10px] text-rose-600 block">{bugErrors.name}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">
                        Email Kontak <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        maxLength={100}
                        value={bugEmail}
                        onChange={(e) => {
                          setBugEmail(e.target.value);
                          if (bugErrors.email) setBugErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="email@anda.com"
                        className={`w-full px-3 py-1.5 sm:py-2 bg-slate-50 border rounded-lg outline-none font-medium text-slate-900 text-sm sm:text-xs min-h-10 sm:min-h-9 ${
                          bugErrors.email ? 'border-rose-400 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                      {bugErrors.email && (
                        <span className="text-[10px] text-rose-600 block">{bugErrors.email}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">
                        Kategori <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={bugCategory}
                        onChange={(e) => setBugCategory(e.target.value as any)}
                        className="w-full px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800 text-sm sm:text-xs min-h-10 sm:min-h-9"
                      >
                        <option value="BUG">Bug / Error Kalkulasi</option>
                        <option value="KELUHAN">Kendala Tampilan / UX</option>
                        <option value="FEATURE_REQUEST">Usulan Fitur Baru</option>
                        <option value="FEEDBACK">Masukan Umum</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">
                        Topik / Judul <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={120}
                        value={bugTitle}
                        onChange={(e) => {
                          setBugTitle(e.target.value);
                          if (bugErrors.title) setBugErrors((prev) => ({ ...prev, title: undefined }));
                        }}
                        placeholder="Ringkasan topik kendala"
                        className={`w-full px-3 py-1.5 sm:py-2 bg-slate-50 border rounded-lg outline-none font-medium text-slate-900 text-sm sm:text-xs min-h-10 sm:min-h-9 ${
                          bugErrors.title ? 'border-rose-400 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                      {bugErrors.title && (
                        <span className="text-[10px] text-rose-600 block">{bugErrors.title}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      Rincian Kendala <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={bugDescription}
                      onChange={(e) => {
                        setBugDescription(e.target.value);
                        if (bugErrors.description) setBugErrors((prev) => ({ ...prev, description: undefined }));
                      }}
                      placeholder="Jelaskan langkah yang memicu kendala, angka matriks, atau pesan error yang muncul..."
                      className={`w-full px-3 py-1.5 sm:py-2 bg-slate-50 border rounded-lg outline-none font-medium resize-none leading-relaxed text-slate-900 text-sm sm:text-xs min-h-20 sm:min-h-18 ${
                        bugErrors.description ? 'border-rose-400 focus:ring-1 focus:ring-rose-500' : 'border-slate-200 focus:ring-1 focus:ring-indigo-500'
                      }`}
                    />
                    {bugErrors.description && (
                      <span className="text-[10px] text-rose-600 block">{bugErrors.description}</span>
                    )}
                  </div>

                  {/* Screenshot upload */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 flex items-center justify-between">
                      <span>Tangkapan Layar</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Opsional, maks 5MB)</span>
                    </label>

                    {!imagePreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg bg-slate-50 hover:bg-slate-100/60 text-center cursor-pointer transition-colors min-h-14 flex flex-col items-center justify-center"
                      >
                        <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-700 block">Lampirkan bukti gambar</span>
                        <span className="text-[10px] text-slate-400">Format PNG, JPG, atau WebP</span>
                      </div>
                    ) : (
                      <div className="relative rounded-lg border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Preview tangkapan layar"
                          className="w-14 h-11 object-cover rounded border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0 truncate">
                          <span className="font-semibold text-slate-800 text-xs block truncate">
                            {imageFile?.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {imageFile ? (imageFile.size / 1024).toFixed(0) + ' KB' : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
                          title="Hapus gambar"
                          aria-label="Hapus gambar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmittingBug}
                      className="flex-1 min-h-11 justify-center py-2.5 text-xs font-semibold shadow-2xs gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmittingBug ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengirim Laporan...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim Laporan Otomatis</span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCopyBugReport}
                      className="min-h-11 min-w-11 flex items-center justify-center px-3 py-2 text-xs font-medium cursor-pointer shrink-0"
                      title="Salin teks laporan ke clipboard"
                      aria-label="Salin teks laporan ke clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Reviews Stream (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Summary Score Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">{avgRating}</span>
                <div className="flex items-center text-amber-400">
                  {hasReviews ? (
                    [1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Belum ada rating</span>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-500 block truncate sm:whitespace-normal">
                {hasReviews
                  ? `Berdasarkan ${reviews.length} ulasan pengguna aktif`
                  : 'Belum ada ulasan yang tersimpan'}
              </span>
            </div>

            <Badge variant="neutral" size="sm" className="font-mono text-[10px] hidden sm:inline-flex shrink-0">
              Linimasa Komunitas
            </Badge>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Daftar Ulasan Pengguna:
            </h3>

            {isLoadingReviews ? (
              <div className="space-y-3 animate-pulse" role="status" aria-label="Memuat ulasan...">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                        <div className="space-y-1">
                          <div className="w-24 sm:w-32 h-3.5 rounded bg-slate-300" />
                          <div className="w-16 sm:w-20 h-2.5 rounded bg-slate-200" />
                        </div>
                      </div>
                      <div className="w-16 sm:w-20 h-4 rounded bg-amber-100 shrink-0" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-3 rounded bg-slate-100" />
                      <div className="w-4/5 h-3 rounded bg-slate-100" />
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="w-16 h-2.5 rounded bg-slate-200" />
                      <div className="w-20 h-4 rounded-full bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-2">
                <h4 className="text-sm font-bold text-slate-800">Belum Ada Ulasan Masuk</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Jadilah pengguna pertama yang membagikan masukan evaluasi metode SPK di DecisiGraph melalui formulir di samping.
                </p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5 transition-colors w-full overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                        {rev.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{rev.name}</h4>
                        <span className="text-[10px] text-slate-400 block truncate">{rev.role || 'Pengguna'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed wrap-break-word">
                    "{rev.comment}"
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 gap-2">
                    <span className="truncate" title={new Date(rev.createdAt).toLocaleString('id-ID')}>
                      {formatRelativeTime(rev.createdAt)}
                    </span>
                    <span className="text-slate-500 font-medium shrink-0">Terverifikasi</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;

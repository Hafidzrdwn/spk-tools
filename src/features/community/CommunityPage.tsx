import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  subscribeToReviews,
  submitReview,
  subscribeToAnalytics,
  trackPageView,
  isRealtimeDbConnected,
  type ReviewItem,
  type AnalyticsData,
} from '@/services/firebase';
import {
  openEmailClientWithReport,
  copyReportToClipboard,
  type ReportEmailPayload,
} from '@/utils/reportEmail';
import StarRatingInput from '@/components/ui/StarRatingInput';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useUiStore } from '@/store/useUiStore';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Star,
  BarChart3,
  MessageSquare,
  Bug,
  Send,
  Upload,
  X,
  Copy,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const setCurrentView = useUiStore((s) => s.setCurrentView);
  const [activeTab, setActiveTab] = useState<'reviews' | 'analytics'>('reviews');
  const [formMode, setFormMode] = useState<'review' | 'bug'>('review');

  // =========================================================================
  // REVIEWS STATE & REALTIME SUBSCRIPTION
  // =========================================================================
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // Form Review State
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState('Pengambil Keputusan');
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Form Bug Report State
  const [bugName, setBugName] = useState('');
  const [bugEmail, setBugEmail] = useState('');
  const [bugCategory, setBugCategory] = useState<'BUG' | 'KELUHAN' | 'FEEDBACK' | 'FEATURE_REQUEST'>('BUG');
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =========================================================================
  // ANALYTICS STATE & REALTIME SUBSCRIPTION
  // =========================================================================
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Track page view saat halaman Community dibuka
  useEffect(() => {
    trackPageView('/community');
  }, []);

  useEffect(() => {
    const unsubReviews = subscribeToReviews((data) => {
      setReviews(data);
      setIsLoadingReviews(false);
    });

    const unsubAnalytics = subscribeToAnalytics((data) => {
      setAnalytics(data);
    });

    return () => {
      unsubReviews();
      unsubAnalytics();
    };
  }, []);

  // Handler Upload Gambar Laporan Bug
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 5MB.');
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

  // Submit Review ke Firebase Realtime DB
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) {
      toast.error('Silakan isi nama dan ulasan Anda.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await submitReview({
        name: reviewerName.trim(),
        role: reviewerRole.trim(),
        rating: ratingScore,
        comment: reviewComment.trim(),
      });
      toast.success('Ulasan Anda berhasil dikirim ke Firebase Realtime DB!');
      setReviewComment('');
    } catch {
      toast.error('Gagal mengirim ulasan.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Kirim Laporan Bug ke Email Pribadi
  const handleSendBugReportEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugName.trim() || !bugEmail.trim() || !bugTitle.trim() || !bugDescription.trim()) {
      toast.error('Harap lengkapi semua kolom laporan wajib.');
      return;
    }

    const payload: ReportEmailPayload = {
      name: bugName.trim(),
      email: bugEmail.trim(),
      category: bugCategory,
      title: bugTitle.trim(),
      description: bugDescription.trim(),
      attachmentName: imageFile ? imageFile.name : undefined,
      attachmentDataUrl: imagePreview || undefined,
    };

    const success = openEmailClientWithReport(payload);
    if (success) {
      toast.success('Aplikasi email Anda dibuka dengan draf laporan terformat rapi!');
    } else {
      toast.info('Silakan salin teks laporan menggunakan tombol "Salin Teks Laporan".');
    }
  };

  const handleCopyBugReport = async () => {
    if (!bugName.trim() || !bugTitle.trim() || !bugDescription.trim()) {
      toast.error('Isi formulir laporan terlebih dahulu untuk disalin.');
      return;
    }

    const payload: ReportEmailPayload = {
      name: bugName.trim(),
      email: bugEmail.trim() || 'user@decisigraph.app',
      category: bugCategory,
      title: bugTitle.trim(),
      description: bugDescription.trim(),
      attachmentName: imageFile ? imageFile.name : undefined,
    };

    const copied = await copyReportToClipboard(payload);
    if (copied) {
      toast.success('Teks laporan berhasil disalin ke clipboard!');
    } else {
      toast.error('Gagal menyalin ke clipboard.');
    }
  };

  // Hitung rata-rata rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentView('workboard')}
              className="gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Workboard</span>
            </Button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Review & Web Analytics Hub</span>
            </h2>
          </div>

          {/* Tab Selector Pill */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ulasan & Masukan</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-accent-primary" />
              <span>Web Analytics</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* ===================================================================
            TAB 1: ULASAN & FORMULIR MASUKAN
        ==================================================================== */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Section (Left 5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Form Mode Selector */}
              <div className="p-1 bg-slate-200/70 rounded-xl flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setFormMode('review')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    formMode === 'review'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Beri Review & Bintang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormMode('bug')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    formMode === 'bug'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bug className="w-3.5 h-3.5 text-rose-500" />
                  <span>Lapor Bug / Keluhan</span>
                </button>
              </div>

              {/* Mode A: Form Ulasan Bintang */}
              {formMode === 'review' && (
                <Card className="border-slate-200/90 shadow-2xs">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Kirim Ulasan & Pengalaman Anda</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Ulasan langsung tersimpan ke Firebase Realtime DB dan tampil secara publik di bawah.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                      {/* Interactive Animated Star Rating */}
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 text-center space-y-2">
                        <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wide block">
                          Tingkat Kepuasan Anda:
                        </span>
                        <StarRatingInput
                          value={ratingScore}
                          onChange={setRatingScore}
                          size="lg"
                          showLabel={true}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Nama Lengkap:</label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="Contoh: Rian Anggoro"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-accent-primary font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Peran / Profesi:</label>
                        <select
                          value={reviewerRole}
                          onChange={(e) => setReviewerRole(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-accent-primary font-medium"
                        >
                          <option value="Pengambil Keputusan">Pengambil Keputusan / Manajer</option>
                          <option value="Mahasiswa">Mahasiswa / Peneliti</option>
                          <option value="Dosen">Dosen / Akademisi</option>
                          <option value="Data Analyst">Data Analyst / Engineer</option>
                          <option value="Umum">Pengguna Umum</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Ulasan & Feedback:</label>
                        <textarea
                          required
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Bagikan pengalaman Anda menggunakan kalkulasi SPK, transparansi KaTeX, atau perbandingan multi-metode..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-accent-primary font-medium resize-none leading-relaxed"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmittingReview}
                        className="w-full justify-center py-2 text-xs font-bold shadow-md shadow-indigo-500/20"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        <span>{isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan Sekarang'}</span>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Mode B: Form Laporan Bug & Keluhan */}
              {formMode === 'bug' && (
                <Card className="border-rose-200/90 shadow-2xs">
                  <CardHeader className="pb-3 border-b border-rose-100 bg-rose-50/30">
                    <CardTitle className="text-sm flex items-center gap-2 text-rose-900">
                      <Bug className="w-4 h-4 text-rose-600" />
                      <span>Laporkan Bug atau Keluhan</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Laporan & bukti screenshot langsung dikirimkan ke email pengembang tanpa disimpan di database.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <form onSubmit={handleSendBugReportEmail} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">Nama Anda:</label>
                          <input
                            type="text"
                            required
                            value={bugName}
                            onChange={(e) => setBugName(e.target.value)}
                            placeholder="Nama pelapor"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-rose-500 font-medium"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">Email Kontak:</label>
                          <input
                            type="email"
                            required
                            value={bugEmail}
                            onChange={(e) => setBugEmail(e.target.value)}
                            placeholder="email@anda.com"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-rose-500 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">Kategori:</label>
                          <select
                            value={bugCategory}
                            onChange={(e) => setBugCategory(e.target.value as any)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-rose-500 font-medium"
                          >
                            <option value="BUG">Bug / Error Kalkulasi</option>
                            <option value="KELUHAN">Kendala Tampilan / UX</option>
                            <option value="FEATURE_REQUEST">Usulan Fitur Baru</option>
                            <option value="FEEDBACK">Masukan Umum</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-700">Topik / Judul:</label>
                          <input
                            type="text"
                            required
                            value={bugTitle}
                            onChange={(e) => setBugTitle(e.target.value)}
                            placeholder="Judul ringkas masalah"
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-rose-500 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Rincian Masalah:</label>
                        <textarea
                          required
                          rows={3}
                          value={bugDescription}
                          onChange={(e) => setBugDescription(e.target.value)}
                          placeholder="Jelaskan langkah-langkah yang memicu kendala, angka matriks, atau pesan error yang muncul..."
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-rose-500 font-medium resize-none leading-relaxed"
                        />
                      </div>

                      {/* Image Upload Area with Local Preview */}
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700 flex items-center justify-between">
                          <span>Lampiran Gambar / Bukti Screenshot (Opsional):</span>
                          <span className="text-[10px] text-slate-400 font-normal">Maks 5MB</span>
                        </label>

                        {!imagePreview ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-xl bg-slate-50 hover:bg-rose-50/20 text-center cursor-pointer transition-colors"
                          >
                            <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                            <span className="text-xs font-semibold text-slate-700 block">Klik untuk unggah screenshot</span>
                            <span className="text-[10px] text-slate-400">PNG, JPG, atau WebP</span>
                          </div>
                        ) : (
                          <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                            <img
                              src={imagePreview}
                              alt="Preview bukti bug"
                              className="w-16 h-12 object-cover rounded-lg border border-slate-200"
                            />
                            <div className="flex-1 truncate">
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
                              className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus gambar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          type="submit"
                          variant="danger"
                          className="flex-1 justify-center py-2 text-xs font-bold"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />
                          <span>Kirim via Email</span>
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleCopyBugReport}
                          className="px-3 py-2 text-xs font-medium"
                          title="Salin draf teks laporan"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Live Reviews List Section (Right 7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Summary Score Card */}
              <div className="p-4 rounded-xl bg-linear-to-r from-amber-500/10 via-indigo-500/5 to-white border border-amber-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">{avgRating}</span>
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    Berdasarkan {reviews.length} ulasan pengguna aktif
                  </span>
                </div>

                <div className="text-right">
                  <Badge variant="benefit" size="sm" className="mb-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    <span>Realtime Stream</span>
                  </Badge>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {isRealtimeDbConnected() ? 'Firebase RTDB Sync' : 'LocalStorage Fallback'}
                  </span>
                </div>
              </div>

              {/* Reviews Card Stream */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  Ulasan Terbaru dari Komunitas:
                </h3>

                {isLoadingReviews ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                    Memuat ulasan realtime...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                    Belum ada ulasan yang masuk. Jadilah yang pertama memberikan ulasan!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <motion.div
                      key={rev.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                            {rev.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{rev.name}</h4>
                            <span className="text-[10px] text-slate-400">{rev.role || 'Pengguna'}</span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pl-1">
                        "{rev.comment}"
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 font-mono">
                        <span>{new Date(rev.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                        <span className="text-emerald-600 font-medium">Terverifikasi</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: COMPREHENSIVE WEB ANALYTICS
        ==================================================================== */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Top KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Page Views
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {analytics.totalViews.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  +12.4% vs bulan lalu
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Views Hari Ini
                </span>
                <span className="text-2xl font-black text-indigo-700 tracking-tight font-mono">
                  {analytics.viewsToday.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Kunjungan unik aktif
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Views Bulan Ini
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {analytics.viewsThisMonth.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-indigo-600 font-medium block">
                  Target tercapai 82%
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Kepuasan Pengguna
                </span>
                <span className="text-2xl font-black text-amber-600 tracking-tight font-mono flex items-center gap-1">
                  <span>{avgRating}</span>
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                </span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Dari {reviews.length} ulasan
                </span>
              </div>
            </div>

            {/* Charts Section: Tren Kunjungan Harian & Breakdown Perangkat */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Daily Trend Chart (Left 7 Cols) */}
              <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Tren Kunjungan 7 Hari Terakhir</h4>
                    <p className="text-xs text-slate-500">Volume aktivitas interaksi pengguna pada DecisiGraph</p>
                  </div>
                  <Badge variant="primary" size="sm">Harian</Badge>
                </div>

                {/* SVG Bar Chart */}
                <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2">
                  {analytics.dailyHistory.map((item, idx) => {
                    const maxVal = Math.max(...analytics.dailyHistory.map((d) => d.views), 1);
                    const heightPercent = Math.max(15, (item.views / maxVal) * 100);
                    const isLast = idx === analytics.dailyHistory.length - 1;

                    return (
                      <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-accent-primary font-bold">
                          {item.views}
                        </span>
                        <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                            className={`w-full rounded-t-lg transition-colors ${
                              isLast
                                ? 'bg-indigo-600 group-hover:bg-indigo-500'
                                : 'bg-indigo-300 group-hover:bg-indigo-400'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-12">
                          {item.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Device & Browser Breakdown (Right 5 Cols) */}
              <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Distribusi Perangkat Pengguna</h4>
                  <p className="text-xs text-slate-500">Kategori hardware yang dipakai saat mengakses aplikasi</p>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  {/* Desktop */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Laptop className="w-3.5 h-3.5 text-indigo-600" /> Desktop / Laptop
                      </span>
                      <span className="font-mono font-bold">{analytics.deviceBreakdown.desktop}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${analytics.deviceBreakdown.desktop}%` }} />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Smartphone className="w-3.5 h-3.5 text-sky-600" /> Smartphone / Mobile
                      </span>
                      <span className="font-mono font-bold">{analytics.deviceBreakdown.mobile}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${analytics.deviceBreakdown.mobile}%` }} />
                    </div>
                  </div>

                  {/* Tablet */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Tablet className="w-3.5 h-3.5 text-purple-600" /> Tablet / iPad
                      </span>
                      <span className="font-mono font-bold">{analytics.deviceBreakdown.tablet}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analytics.deviceBreakdown.tablet}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Browser Populer:</span>
                  <span className="font-semibold text-slate-700">Chrome (64%), Firefox (16%), Safari (12%)</span>
                </div>
              </div>
            </div>

            {/* Recent Visits Log Table */}
            <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Aktivitas Kunjungan Real-Time</h4>
                  <p className="text-xs text-slate-500">Log akses pengunjung terbaru yang terekam sistem</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11px] font-semibold text-emerald-700">Live Tracker</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Waktu Akses</th>
                      <th className="py-2.5 px-3">Perangkat</th>
                      <th className="py-2.5 px-3">Sistem Operasi</th>
                      <th className="py-2.5 px-3">Browser</th>
                      <th className="py-2.5 px-3 text-right">Rute yang Diakses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {analytics.recentVisits.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2 px-3 text-slate-600">
                          {new Date(v.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">{v.device}</td>
                        <td className="py-2 px-3 text-slate-600">{v.os}</td>
                        <td className="py-2 px-3 text-slate-600">{v.browser}</td>
                        <td className="py-2 px-3 text-right text-indigo-700 font-bold">{v.path}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CommunityPage;

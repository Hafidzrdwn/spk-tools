import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  subscribeToReviews,
  submitReview,
  type ReviewItem,
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
import { toast } from 'sonner';
import {
  Star,
  Bug,
  Send,
  Upload,
  X,
  Copy,
  ExternalLink,
  Sparkles,
  CheckCircle2,
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

  // Form Bug Report State
  const [bugName, setBugName] = useState('');
  const [bugEmail, setBugEmail] = useState('');
  const [bugCategory, setBugCategory] = useState<'BUG' | 'KELUHAN' | 'FEEDBACK' | 'FEATURE_REQUEST'>('BUG');
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  // Submit Review
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
      toast.success('Terima kasih! Ulasan Anda berhasil dikirim.');
      setReviewComment('');
    } catch {
      toast.error('Gagal mengirim ulasan. Silakan coba sesaat lagi.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Send Bug Report Email
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
      toast.success('Aplikasi email dibuka dengan draf laporan terformat rapi!');
    } else {
      toast.info('Silakan gunakan tombol "Salin Teks" untuk menyalin format laporan.');
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

  // Average Rating
  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '-';

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span>Ulasan Komunitas & Pusat Masukan</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Sampaikan pengalaman Anda menggunakan DecisiGraph, kirim evaluasi bintang, atau laporkan kendala teknis.
        </p>
      </div>

      {/* Main Grid: Form (Left) & Reviews Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Container (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Form Mode Selector */}
          <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 text-xs border border-slate-200/80">
            <button
              type="button"
              onClick={() => setFormMode('review')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                formMode === 'review'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Beri Review</span>
            </button>
            <button
              type="button"
              onClick={() => setFormMode('bug')}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                formMode === 'bug'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-rose-500" />
              <span>Lapor Kendala</span>
            </button>
          </div>

          {/* Form A: Kirim Ulasan */}
          {formMode === 'review' && (
            <Card className="border-slate-200/90 shadow-2xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Bagikan Penilaian Anda</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Ulasan Anda akan langsung tampil secara terbuka untuk komunitas pengguna.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  {/* Interactive Star Rating */}
                  <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70 text-center space-y-2">
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
                    <label className="font-semibold text-slate-700">Ulasan & Masukan:</label>
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
                    className="w-full justify-center py-2 text-xs font-bold shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    <span>{isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan Sekarang'}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Form B: Lapor Kendala / Bug */}
          {formMode === 'bug' && (
            <Card className="border-rose-200/90 shadow-2xs">
              <CardHeader className="pb-3 border-b border-rose-100 bg-rose-50/30">
                <CardTitle className="text-sm flex items-center gap-2 text-rose-900">
                  <Bug className="w-4 h-4 text-rose-600" />
                  <span>Laporkan Kendala atau Bug</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Laporan dan tangkapan layar langsung diformat untuk dikirim ke email pengembang.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleSendBugReportEmail} className="space-y-3 text-xs">
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
                        placeholder="Ringkasan topik"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-rose-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Rincian Kendala:</label>
                    <textarea
                      required
                      rows={3}
                      value={bugDescription}
                      onChange={(e) => setBugDescription(e.target.value)}
                      placeholder="Jelaskan langkah-langkah yang memicu kendala, angka matriks, atau pesan error yang muncul..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-rose-500 font-medium resize-none leading-relaxed"
                    />
                  </div>

                  {/* Screenshot upload preview */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 flex items-center justify-between">
                      <span>Bukti Tangkapan Layar (Opsional):</span>
                      <span className="text-[10px] text-slate-400 font-normal">Maks 5MB</span>
                    </label>

                    {!imagePreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-xl bg-slate-50 hover:bg-rose-50/20 text-center cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                        <span className="text-xs font-semibold text-slate-700 block">Klik untuk lampirkan gambar</span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, atau WebP</span>
                      </div>
                    ) : (
                      <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Preview tangkapan layar"
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
                          className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                      className="px-3 py-2 text-xs font-medium cursor-pointer"
                      title="Salin teks laporan ke clipboard"
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
          <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-black text-slate-900 tracking-tight">{avgRating}</span>
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
              <span className="text-xs text-slate-500">
                {hasReviews
                  ? `Berdasarkan ${reviews.length} ulasan pengguna aktif`
                  : 'Belum ada ulasan yang tersimpan'}
              </span>
            </div>

            <Badge variant="benefit" size="sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>Pembaruan Langsung</span>
            </Badge>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Daftar Ulasan Komunitas:
            </h3>

            {isLoadingReviews ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                Memuat data ulasan...
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Belum Ada Ulasan Masuk</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Belum ada ulasan di database. Jadilah pengguna pertama yang membagikan pengalaman evaluasi SPK Anda melalui formulir di samping!
                </p>
              </div>
            ) : (
              reviews.map((rev) => (
                <motion.div
                  key={rev.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200/80">
                        {rev.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{rev.name}</h4>
                        <span className="text-[10px] text-slate-400">{rev.role || 'Pengguna'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-0.5">
                    "{rev.comment}"
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 font-mono">
                    <span>{new Date(rev.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                    <span className="text-emerald-600 font-semibold font-sans">Terverifikasi</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;

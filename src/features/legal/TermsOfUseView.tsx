import React from 'react';
import { TermsLegalIllustration } from '@/components/illustrations';
import { Scale, CheckCircle2, AlertTriangle, ShieldAlert, FileText, Code2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const TermsOfUseView: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-3.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Pedoman Penggunaan Berkeadilan</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Syarat & Ketentuan Penggunaan
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Selamat datang di <strong>DecisiGraph</strong>. Dengan mengakses, menjelajahi, atau memanfaatkan platform ini, 
            Anda menyetujui ketentuan penggunaan yang dirancang untuk menjaga integritas keilmuan, objektivitas matematis, 
            dan kenyamanan bersama seluruh pengguna.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Versi Dokumen:</span>
            <Badge variant="neutral" size="sm">1.1 (Oktober 2026)</Badge>
            <span className="text-slate-300">&bull;</span>
            <span className="font-medium text-indigo-700">Lisensi Terbuka MIT</span>
          </div>
        </div>

        <div className="md:col-span-5 flex justify-center">
          <TermsLegalIllustration className="w-full max-w-xs sm:max-w-sm" />
        </div>
      </section>

      <section className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-left space-y-2.5">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Pernyataan Penting: Batasan Hasil Perhitungan Matematis SPK</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
          DecisiGraph adalah instrumen perangkat lunak sistem pendukung keputusan (*Decision Support System*) 
          yang mengolah angka berdasarkan algoritma matematis formal (SAW, WP, TOPSIS, AHP) dan sintesis asistensi kecerdasan buatan. 
          <strong> Hasil peringkat dan skor yang ditampilkan adalah instrumen rekomendasi analitis objektif</strong>, 
          bukan keputusan mutlak yang mengikat secara hukum, finansial, atau manajerial. 
          Tanggung jawab atas keputusan akhir, pengadaan barang/jasa, atau penetapan kebijakan tetap berada sepenuhnya pada pertimbangan pengambil keputusan manusia (*human-in-the-loop*).
        </p>
      </section>

      <section className="space-y-5 text-left">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              1. Kelayakan & Akses Layanan
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              DecisiGraph dapat diakses secara gratis oleh mahasiswa, akademisi, peneliti, maupun praktisi profesional. 
              Platform ini tidak memungut biaya lisensi dasar pada versi saat ini (v1.1).
            </p>
            <p>
              Anda berhak menggunakan seluruh modul (kalkulasi 4 metode, inspeksi formula KaTeX, evaluasi sensitivitas, 
              ekstraksi dokumen AI, dan ekspor laporan PDF) untuk keperluan penelitian ilmiah, tugas akhir, skripsi, tesis, 
              maupun evaluasi operasional internal organisasi Anda.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <FileText className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              2. Tanggung Jawab atas Data Input & Pembobotan
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Prinsip <em>&quot;Garbage In, Garbage Out&quot;</em> berlaku penuh dalam metodologi SPK. 
              Kualitas peringkat alternatif sangat ditentukan oleh validitas data nilai mentah dan pembobotan kriteria yang Anda berikan.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Pengguna bertanggung jawab memastikan rasio konsistensi AHP berada dalam ambang batas wajar ($CR &lt; 0.10$).</li>
              <li>Pengguna bertanggung jawab memeriksa ketepatan penentuan atribut Benefit (keuntungan/kualitas) dan Cost (biaya/risiko).</li>
              <li>Pengguna disarankan memeriksa ulang matriks hasil ekstraksi AI pada dialog verifikasi sebelum melakukan perhitungan final.</li>
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-rose-700">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              3. Larangan Penggunaan & Integritas Sistem
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>Dalam memanfaatkan layanan DecisiGraph, Anda setuju untuk TIDAK:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Melakukan serangan flooding, scraping otomatis berlebihan, atau rekayasa untuk menguras kuota API gratis pihak ketiga.</li>
              <li>Mengirimkan pesan spam, tautan phishing, atau ujaran kebencian melalui formulir ulasan komunitas atau formulir pelaporan bug.</li>
              <li>Mengunggah dokumen yang memuat malware, skrip berbahaya, atau muatan berhak cipta ilegal pada Document Loader.</li>
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-blue-700">
            <Code2 className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              4. Hak Cipta & Lisensi Sumber Terbuka (MIT License)
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Basis kode DecisiGraph dirilis di bawah lisensi resmi <strong>MIT License</strong>. 
              Anda bebas mempelajari, memodifikasi, dan mendistribusikan kode dengan tetap menyertakan atribusi hak cipta pengembang asli.
            </p>
            <p>
              Seluruh nama dagang, logo DecisiGraph, dan ilustrasi SVG kustom merupakan bagian dari identitas visual karya 
              <strong> Hafidz Ridwan</strong>. Laporan PDF yang dihasilkan dari proyek Anda sepenuhnya menjadi milik Anda untuk digunakan secara bebas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfUseView;

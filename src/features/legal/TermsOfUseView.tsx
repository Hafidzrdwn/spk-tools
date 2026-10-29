import React from 'react';
import { TermsBoxMascot } from '@/components/illustrations';

export const TermsOfUseView: React.FC = () => {
  return (
    <div className="space-y-10 sm:space-y-12 text-left">
      <section className="border-b border-slate-200 pb-8 sm:pb-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Ketentuan Layanan
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Syarat &amp; Ketentuan Penggunaan
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            Selamat datang di DecisiGraph. Dengan mengakses atau memanfaatkan alat bantu ini, 
            Anda menyetujui pedoman penggunaan yang dirancang untuk menjaga integritas keilmuan, 
            kejelasan batasan hukum hasil SPK, dan kenyamanan sesama pengguna.
          </p>

          <div className="pt-1 text-xs text-slate-400">
            Versi Dokumen: 1.1 (Oktober 2026) &bull; Lisensi Terbuka MIT
          </div>
        </div>

        <div className="md:col-span-4 flex justify-center md:justify-end">
          <TermsBoxMascot className="w-48 sm:w-56" />
        </div>
      </section>

      <section className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-2 max-w-3xl">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            Pemberitahuan Penting
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Batasan Hasil Matematis SPK
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          DecisiGraph adalah instrumen perangkat lunak sistem pendukung keputusan 
          berbasis formula matematis formal (SAW, WP, TOPSIS, AHP) dan asistensi AI. 
          Hasil perankingan dan skor adalah instrumen rekomendasi analitis objektif, bukan penetapan mutlak yang mengikat secara hukum 
          maupun manajerial. Keputusan final pengadaan, alokasi anggaran, atau kebijakan tetap berada sepenuhnya di tangan pengambil keputusan manusia.
        </p>
      </section>

      <section className="space-y-8 max-w-3xl">
        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">01</span>
            <h2 className="text-base font-bold text-slate-900">
              Akses &amp; Kelayakan Penggunaan
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-7">
            DecisiGraph dapat diakses secara bebas tanpa pungutan biaya lisensi dasar pada versi saat ini. 
            Anda berhak menggunakan seluruh modul (kalkulasi multi-metode, inspeksi formula KaTeX, simulasi sensitivitas, 
            dan ekspor laporan PDF) untuk keperluan penelitian akademik, tugas akhir, skripsi, tesis, maupun evaluasi internal organisasi Anda.
          </p>
        </article>

        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">02</span>
            <h2 className="text-base font-bold text-slate-900">
              Tanggung Jawab Data Input &amp; Pembobotan
            </h2>
          </div>
          <div className="space-y-2 text-sm text-slate-600 leading-relaxed pl-7">
            <p>
              Ketepatan hasil perankingan alternatif sangat bergantung pada validitas nilai matriks dan pertimbangan bobot yang Anda tetapkan. 
              Pengguna bertanggung jawab untuk:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Memeriksa nilai rasio konsistensi pembobotan AHP berada di ambang batas wajar ($CR &lt; 0.10$).</li>
              <li>Menentukan atribut kriteria Benefit vs Cost secara teliti.</li>
              <li>Meninjau kembali matriks hasil ekstraksi AI pada dialog verifikasi sebelum digunakan untuk kalkulasi final.</li>
            </ul>
          </div>
        </article>

        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">03</span>
            <h2 className="text-base font-bold text-slate-900">
              Integritas Sistem &amp; Etika Komunitas
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-7">
            Pengguna dilarang melakukan serangan penolakan layanan (DoS/DDoS), scraping otomatis yang mengeksploitasi kuota API gratis pihak ketiga, 
            mengirimkan spam ulasan, atau mengunggah muatan berbahaya melalui Document Loader. Ulasan pada Community Board harus bernada konstruktif 
            dan bebas dari konten pelecehan atau promosi ilegal.
          </p>
        </article>

        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">04</span>
            <h2 className="text-base font-bold text-slate-900">
              Lisensi Perangkat Lunak (MIT License)
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-7">
            Kode sumber DecisiGraph didistribusikan di bawah lisensi resmi <strong>MIT License</strong>. 
            Anda berhak meninjau, mengadaptasi, dan mengembangkan kembali kode sumber dengan tetap menyertakan atribusi hak cipta pengembang asli. 
            Dokumen dan laporan PDF yang dihasilkan dari proyek SPK Anda sepenuhnya menjadi hak milik Anda tanpa klaim kepemilikan dari DecisiGraph.
          </p>
        </article>
      </section>
    </div>
  );
};

export default TermsOfUseView;

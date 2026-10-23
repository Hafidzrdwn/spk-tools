import React, { useState } from 'react';
import { ReleasesBoxMascot } from '@/components/illustrations';

export const ReleasesView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'v1_1' | 'v1_0' | 'future'>('all');

  return (
    <div className="space-y-10 sm:space-y-12 text-left">
      <section className="border-b border-slate-200 pb-8 sm:pb-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Linimasa Produk
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Catatan Rilis &amp; Perkembangan
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            Rekam jejak pembaruan DecisiGraph dari fondasi awal hingga platform Decision Intelligence modern. 
            Seluruh peningkatan formula, stabilitas arsitektur AI, dan modul pelengkap dirangkum secara transparan.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Versi
            </button>
            <button
              type="button"
              onClick={() => setFilter('v1_1')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === 'v1_1'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              v1.1 (Saat Ini)
            </button>
            <button
              type="button"
              onClick={() => setFilter('v1_0')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === 'v1_0'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              v1.0 (MVP)
            </button>
            <button
              type="button"
              onClick={() => setFilter('future')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filter === 'future'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Roadmap Masa Depan
            </button>
          </div>
        </div>

        <div className="md:col-span-4 flex justify-center md:justify-end">
          <ReleasesBoxMascot className="w-48 sm:w-56" />
        </div>
      </section>

      <section className="space-y-10 max-w-3xl">
        {(filter === 'all' || filter === 'v1_1') && (
          <article className="border-l-2 border-indigo-600 pl-6 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/70">
                  v1.1.0
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-500 font-medium">23 Oktober 2026</span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-indigo-700 font-semibold text-[11px]">Rilis Stabil Saat Ini</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Decision Intelligence, AI Synthesis &amp; Evaluation Hub
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Transformasi menyeluruh DecisiGraph menjadi platform evaluasi keputusan komprehensif 
              dengan integrasi Google GenAI, hub analisis sensitivitas, dan ekstraksi dokumen otomatis.
            </p>

            <div className="space-y-3 pt-1 text-sm text-slate-700">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Fitur Unggulan v1.1:
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 leading-relaxed">
                  <li>
                    <strong>Sintesis Manajerial AI &amp; Penalaran Kausal:</strong> Rekomendasi peran bertingkat untuk Leader, Operator, Technical, dan Audit dengan timeout ketat 8 detik dan 100% deterministic fallback.
                  </li>
                  <li>
                    <strong>Hub Evaluasi Sensitivitas &amp; Goal Seeking:</strong> Slider simulasi perubahan bobot kriteria secara real-time dan kalkulasi peningkatan skor minimum untuk kandidat runner-up.
                  </li>
                  <li>
                    <strong>AI Document Loader:</strong> Ekstraksi berkas proposal PDF, DOCX, XLSX, dan teks menjadi matriks terstandarisasi dengan dialog verifikasi.
                  </li>
                  <li>
                    <strong>Story-to-Matrix V1.1:</strong> Mode narasi bebas berbasis Gemini dan mode format standar regex dengan auto-cleanup saat reset proyek.
                  </li>
                  <li>
                    <strong>Standardisasi Nominal Rupiah (`Rp ...`):</strong> Format mata uang seragam di seluruh teks narasi AI, tabel evaluasi, dan ekspor.
                  </li>
                  <li>
                    <strong>Dynamic Multi-Method PDF Executive Report:</strong> Laporan eksekutif berstandar ISO multi-bab dengan formula matematika LaTeX.
                  </li>
                  <li>
                    <strong>Universal Project Backup &amp; Restore:</strong> Sinkronisasi ekspor/impor JSON lengkap di header global.
                  </li>
                </ul>
              </div>
            </div>
          </article>
        )}

        {(filter === 'all' || filter === 'v1_0') && (
          <article className="border-l-2 border-slate-300 pl-6 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  v1.0.0
                </span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-500 font-medium">September 2026</span>
                <span className="text-slate-400">&bull;</span>
                <span className="text-slate-500 text-[11px]">Rilis Fondasi (MVP)</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Fondasi 4 Metode SPK &amp; Traceability Inspector
              </h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Arsitektur awal kalkulasi matematis transparan untuk sistem pendukung keputusan.
            </p>

            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 leading-relaxed">
              <li>Implementasi engine matematis 4 metode: SAW, WP, TOPSIS, dan pembobotan AHP.</li>
              <li>Traceability Inspector: Inspeksi formula KaTeX dan substitusi nilai per sel matriks.</li>
              <li>Uji Rasio Konsistensi Saaty (CR &lt; 0.10) dengan visualisasi matriks berpasangan.</li>
              <li>Tabel komparasi multi-metode dasar dan deteksi rank shift.</li>
              <li>Glosarium istilah SPK interaktif dan panduan interaktif (Tour).</li>
            </ul>
          </article>
        )}

        {(filter === 'all' || filter === 'future') && (
          <article className="border-l-2 border-dashed border-slate-300 pl-6 space-y-4">
            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-slate-600 uppercase tracking-wider">
                Roadmap Pengembangan
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Rencana Rilis Mendatang
              </h2>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs block">v2.0 — Arsitektur Modular SPK &amp; Cloud Persistence</span>
                <p className="leading-relaxed">
                  Pemisahan konseptual Weighting Engine (AHP, Entropy, ROC) vs Ranking Engine (SAW, WP, TOPSIS, MOORA, WASPAS), 
                  autentikasi Google OAuth tanpa kata sandi, dan penyimpanan histori proyek di cloud.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900 text-xs block">v3.0 — Advanced Decision Methods &amp; Audit Trail</span>
                <p className="leading-relaxed">
                  Dukungan metode lanjutan (ANP, PROMETHEE, VIKOR, COPRAS, EDAS), Full Dark Mode, dan jejak audit kepatuhan regulasi.
                </p>
              </div>
            </div>
          </article>
        )}
      </section>
    </div>
  );
};

export default ReleasesView;

import React, { useState } from 'react';
import { ChangelogTimelineIllustration } from '@/components/illustrations';
import { Sparkles, History, CheckCircle2, Cpu, FileSpreadsheet, FileText } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const ReleasesView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'v1_1' | 'v1_0' | 'future'>('all');

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-3.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Linimasa Perkembangan Produk</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Catatan Rilis &amp; Versi DecisiGraph
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Ikuti rekam jejak evolusi DecisiGraph dari fondasi awal hingga menjadi platform 
            <em> Decision Intelligence</em> modern. Seluruh fitur baru, peningkatan algoritma matematis, 
            dan optimasi performa didokumentasikan secara transparan.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Catatan
            </button>
            <button
              type="button"
              onClick={() => setFilter('v1_1')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'v1_1'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              v1.1 (Rilis Saat Ini)
            </button>
            <button
              type="button"
              onClick={() => setFilter('v1_0')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'v1_0'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              v1.0 (MVP)
            </button>
            <button
              type="button"
              onClick={() => setFilter('future')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'future'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Roadmap Masa Depan
            </button>
          </div>
        </div>

        <div className="md:col-span-5 flex justify-center">
          <ChangelogTimelineIllustration className="w-full max-w-xs sm:max-w-sm" />
        </div>
      </section>

      {/* Version Entries */}
      <div className="space-y-8 text-left">
        {/* Entry v1.1.0 */}
        {(filter === 'all' || filter === 'v1_1') && (
          <article className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-emerald-500/30 shadow-2xs space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[11px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
              Rilis Saat Ini (Stable)
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="md" className="font-mono text-xs font-bold bg-emerald-600 text-white border-transparent">
                  v1.1.0
                </Badge>
                <span className="text-xs text-slate-400 font-medium">23 Oktober 2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Decision Intelligence, AI Synthesis &amp; Evaluation Hub
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Transformasi besar DecisiGraph dari sekadar kalkulator metode menjadi platform analisis keputusan cerdas berstandar eksekutif.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Feature 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs">
                  <Cpu className="w-4 h-4 shrink-0" />
                  <span>Sintesis Manajerial AI &amp; Penalaran Kausal</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Integrasi Google GenAI (Gemini 2.5/3.x Flash) dengan penalaran kausal yang menghubungkan atribut kriteria dengan dampak nyata. 
                  Menyajikan rekomendasi peran bertingkat untuk Leader, Operator, Technical, dan Audit dengan batas timeout 8 detik.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Hub Evaluasi Sensitivitas &amp; Goal Seeking</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Slider interaktif untuk mensimulasikan perubahan bobot kriteria secara dinamis. 
                  Algoritma invers Goal Seeking menghitung peningkatan skor minimum yang dibutuhkan alternatif runner-up untuk menjadi juara 1.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  <span>AI Document Loader (PDF, DOCX, XLSX, TXT)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Kemampuan mengunggah dokumen studi kasus nyata dalam format PDF, Word, Excel, dan teks. 
                  Sistem mengekstrak nama proyek, pagu anggaran, kriteria benefit/cost, dan nilai alternatif dengan dialog verifikasi sebelum impor.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Dynamic Multi-Method PDF Executive Report</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Laporan PDF komprehensif multi-bab siap cetak: Ringkasan Eksekutif AI, konteks studi kasus, 
                  tabel langkah matematis LaTeX untuk SAW, WP, TOPSIS, AHP, analisis konsensus, dan lampiran matriks.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Pembaruan Lainnya:</span>
                <span>Standardisasi nominal Rupiah (`Rp ...`), Universal JSON Backup, AST Comment Cleaner, dan 138 unit tests lulus 100%.</span>
              </div>
            </div>
          </article>
        )}

        {/* Entry v1.0.0 */}
        {(filter === 'all' || filter === 'v1_0') && (
          <article className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="md" className="font-mono text-xs font-bold">
                  v1.0.0
                </Badge>
                <span className="text-xs text-slate-400 font-medium">September 2026</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Foundation MVP: 4 Metode SPK &amp; Traceability Inspector
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Fondasi awal kalkulator SPK interaktif dengan transparansi rumus matematis per sel matriks.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 list-disc pl-5">
              <li>Implementasi 4 metode MCDM: SAW, WP, TOPSIS, dan pembobotan hierarki AHP.</li>
              <li>Traceability Inspector: Klik sel mana pun untuk melihat substitusi rumus KaTeX.</li>
              <li>Uji Rasio Konsistensi Saaty (CR &lt; 0.10) dengan visualisasi matriks resiprokal.</li>
              <li>Tabel komparasi multi-metode dasar dan deteksi pergeseran peringkat (rank shift).</li>
              <li>Glosarium istilah kontekstual dan tur panduan interaktif per metode.</li>
            </ul>
          </article>
        )}

        {/* Future Roadmaps */}
        {(filter === 'all' || filter === 'future') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-700">
              <History className="w-5 h-5 shrink-0" />
              <h2 className="text-lg font-bold text-slate-900">Roadmap Masa Depan DecisiGraph</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* v2.0 */}
              <div className="p-5 rounded-xl bg-indigo-50/50 border border-indigo-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm" className="font-bold">v2.0 (Dalam Rencana)</Badge>
                  <span className="text-[11px] text-indigo-600 font-semibold">SPK Modular &amp; Cloud</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Arsitektur Modular Engine &amp; Cloud Persistence
                </h3>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>Pemisahan konsep modular: Weighting Engine (AHP, Entropy, ROC) vs Ranking Engine (SAW, WP, TOPSIS, MOORA, WASPAS).</li>
                  <li>Autentikasi Google OAuth tanpa kata sandi untuk menyimpan histori proyek di cloud.</li>
                  <li>Kolaborasi multi-pengguna untuk peninjauan keputusan bersama secara daring.</li>
                </ul>
              </div>

              {/* v3.0 */}
              <div className="p-5 rounded-xl bg-purple-50/50 border border-purple-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm" className="font-bold">v3.0 (Visi Lanjutan)</Badge>
                  <span className="text-[11px] text-purple-600 font-semibold">Enterprise MCDM Suite</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Advanced Decision Methods &amp; Audit Trail
                </h3>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>Metode keputusan lanjutan: ANP (Analytic Network Process), PROMETHEE, VIKOR, COPRAS, dan EDAS.</li>
                  <li>Mode Gelap penuh (*Full Dark Mode*) dengan palet kontras tinggi.</li>
                  <li>Jejak audit kepatuhan regulasi dan sertifikat keputusan digital.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReleasesView;

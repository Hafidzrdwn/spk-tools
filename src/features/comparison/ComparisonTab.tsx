import React from 'react';
import useComparisonViewModel from './useComparisonViewModel';
import MultiMethodComparisonTable from './components/MultiMethodComparisonTable';
import RankingShiftExplanation from './components/RankingShiftExplanation';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Scale, Sparkles, Layers } from 'lucide-react';

export const ComparisonTab: React.FC = () => {
  const { hasData, comparison, loadShiftDemoCase } = useComparisonViewModel();

  return (
    <div className="space-y-6">
      {/* Top Banner & Demo Case Trigger */}
      <Card className="bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-200/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-control bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 shadow-xs">
              <Scale className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
                  Multi-Method Comparison Mode
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-mono px-2 py-0.5 rounded-full font-bold">
                  SAW &bull; WP &bull; TOPSIS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi komparatif hasil perangkingan multi-metode pada dataset yang sama untuk menguji stabilitas keputusan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadShiftDemoCase}
              className="text-xs font-semibold shadow-2xs cursor-pointer"
              title="Muat dataset pengujian yang sengaja menghasilkan pemenang berbeda antara SAW dan TOPSIS"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent-primary" />
              Muat Contoh Kasus Pergeseran
            </Button>
          </div>
        </CardContent>
      </Card>

      {!hasData ? (
        <Card className="border-dashed border-2 border-slate-200/90 bg-white/70">
          <CardContent className="p-8 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 text-accent-primary flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Menunggu Data Matriks Keputusan</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Tambahkan kriteria dan alternatif pada tab input atau klik tombol "Muat Contoh Kasus Pergeseran" di atas untuk melihat perbandingan secara instan.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Penjelasan Pergeseran Peringkat (Data-Driven Explanation) */}
          <RankingShiftExplanation comparison={comparison} />

          {/* Tabel Matriks Komparasi Side-by-Side */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-slate-100">
              <CardTitle className="text-sm">Matriks Perbandingan Peringkat & Skor Antar Metode</CardTitle>
              <CardDescription>
                Peringkat #1 ditandai dengan lencana hijau, dilengkapi nilai skor asli tiap algoritma dan konsensus akhir
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <MultiMethodComparisonTable rows={comparison.rows} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComparisonTab;

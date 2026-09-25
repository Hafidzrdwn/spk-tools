import React from 'react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useTourStore } from '@/store/useTourStore';
import { useProjectStore } from '@/store/useProjectStore';
import { setCriteriaBaseline } from '@/core/tour/generalTourSteps';
import { Sparkles, Calculator, Layers, Compass, Sliders, Scale } from 'lucide-react';

export interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: (tourId: string) => void;
}

const TAB_GUIDES = [
  {
    name: 'SAW',
    badge: 'Linear',
    icon: Calculator,
    desc: 'Penjumlahan terbobot linier yang intuitif dan cepat untuk penilaian kriteria sederhana.',
  },
  {
    name: 'WP',
    badge: 'Product',
    icon: Layers,
    desc: 'Perkalian berpangkat bobot untuk mengevaluasi alternatif secara proporsional.',
  },
  {
    name: 'TOPSIS',
    badge: 'Distance',
    icon: Compass,
    desc: 'Mencari solusi terbaik terdekat dari solusi ideal positif dan terjauh dari ideal negatif.',
  },
  {
    name: 'AHP',
    badge: 'Hierarchy',
    icon: Sliders,
    desc: 'Penentuan bobot prioritas berbasis matriks perbandingan berpasangan (pairwise) dan uji konsistensi (CR).',
  },
  {
    name: 'Perbandingan',
    badge: 'Analysis',
    icon: Scale,
    desc: 'Komparasi peringkat antar metode, visualisasi radar chart, dan uji sensitivitas bobot.',
  },
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
}) => {
  const setHasSeenWelcome = useTourStore((s) => s.setHasSeenWelcome);
  const startTour = useTourStore((s) => s.startTour);

  const handleStartTour = () => {
    setCriteriaBaseline(useProjectStore.getState().criteria.length);
    setHasSeenWelcome(true);
    onClose();
    if (onStartTour) {
      onStartTour('general');
    } else {
      startTour('general');
    }
  };

  const handleSkip = () => {
    setHasSeenWelcome(true);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleSkip();
      }}
      className="max-w-xl max-h-[85vh]"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-accent-primary shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Selamat datang di DecisiGraph</h2>
            <p className="text-xs text-slate-500 font-normal">Sistem Pendukung Keputusan (SPK) Multi-Metode Modern</p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-slate-500 hover:text-slate-700">
            Lewati, langsung mulai
          </Button>
          <Button variant="primary" size="sm" onClick={handleStartTour} className="gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mulai Tour</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pt-1 pb-1">
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
          DecisiGraph membantu Anda menentukan keputusan terbaik secara objektif, ilmiah, dan transparan.
          Mulai dengan mendefinisikan alternatif dan kriteria pada <strong>Matriks Keputusan Bersama</strong>,
          lalu telaah hasil perhitungan menggunakan berbagai algoritma SPK di bawah ini:
        </p>

        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            5 Metode & Panel Analisis:
          </span>
          <div className="grid gap-2">
            {TAB_GUIDES.map((tab) => {
              const Icon = tab.icon;
              return (
                <div
                  key={tab.name}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-colors shadow-2xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-50/70 border border-indigo-100/60 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">{tab.name}</span>
                      <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5">
                        {tab.badge}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tab.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default WelcomeModal;

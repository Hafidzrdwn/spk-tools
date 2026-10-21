import React from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useEvaluationViewModel, type EvaluationSubPanel } from './useEvaluationViewModel';
import AspectEvaluationPanel from './components/AspectEvaluationPanel';
import SensitivityScenarioPanel from './components/SensitivityScenarioPanel';
import WhatIfGoalSeekingPanel from './components/WhatIfGoalSeekingPanel';
import ManagerialAiPanel from './components/ManagerialAiPanel';
import { Compass, Scale, Sliders, Target, FileText, RotateCcw } from 'lucide-react';

export const EvaluationTab: React.FC = () => {
  const {
    hasData,
    criteria,
    alternatives,
    activePanel,
    setActivePanel,
    spearmanMethodB,
    setSpearmanMethodB,
    spearmanResult,
    goalCongruence,
    marginOfVictory,
    crossovers,
    customWeights,
    updateCriterionWeight,
    resetWeights,
    sensitivitySimulation,
    scenarios,
    whatIfAltId,
    setWhatIfAltId,
    whatIfCritId,
    setWhatIfCritId,
    whatIfValue,
    setWhatIfValue,
    whatIfResult,
    goalSeekingAltId,
    setGoalSeekingAltId,
    goalSeekingCritId,
    setGoalSeekingCritId,
    goalSeekingResult,
    managerialSynthesis,
    loadCvMajuJayaCase,
    isDemoActive,
    savedUserState,
    revertToUserData,
  } = useEvaluationViewModel();

  const subNavItems: { id: EvaluationSubPanel; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'aspects', label: '1. Evaluasi 3 Aspek', icon: Scale },
    { id: 'sensitivity', label: '2. Sensitivitas & Skenario', icon: Sliders },
    { id: 'whatif', label: '3. What-If & Goal Seeking', icon: Target },
    { id: 'managerial', label: '4. Rekomendasi Manajerial', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-200/80">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
                  Decision Evaluation & Analysis
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-mono px-2 py-0.5 rounded-full font-bold">
                  Decision Analysis Framework
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Uji ketahanan keputusan, korelasi Spearman, simulasi sensitivitas bobot, dan mitigasi risiko Plan B.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDemoActive && savedUserState ? (
              <Button
                variant="secondary"
                size="md"
                onClick={revertToUserData}
                className="text-xs font-semibold shadow-2xs cursor-pointer gap-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                title="Kembalikan data kriteria dan alternatif Anda sebelumnya"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kembalikan Data Saya</span>
              </Button>
            ) : null}
            <Button
              variant={isDemoActive ? 'secondary' : 'primary'}
              size="md"
              onClick={loadCvMajuJayaCase}
              className="text-xs font-semibold shadow-2xs cursor-pointer gap-1.5"
              title="Muat dataset modul studi kasus CV Maju Jaya (Spearman ρ = 1, Goal Seeking A5, dll.)"
            >
              <span>{isDemoActive ? 'Muat Ulang Kasus CV' : 'Muat Kasus CV Maju Jaya'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {!hasData ? (
        <Card className="border-dashed border-2 border-slate-200/90 bg-white/70">
          <CardContent className="p-8 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Menunggu Data Matriks Keputusan</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Tambahkan kriteria dan alternatif pada tabel input di atas, atau klik tombol "Muat Kasus CV Maju Jaya" untuk langsung melihat analisis evaluasi keputusan secara lengkap.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full scrollbar-none touch-pan-x">
            {subNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivePanel(item.id)}
                  className={`min-h-9 px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-white text-indigo-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {activePanel === 'aspects' && (
            <AspectEvaluationPanel
              goalCongruence={goalCongruence}
              spearmanResult={spearmanResult}
              marginOfVictory={marginOfVictory}
              spearmanMethodB={spearmanMethodB}
              onSelectSpearmanMethodB={setSpearmanMethodB}
            />
          )}

          {activePanel === 'sensitivity' && (
            <SensitivityScenarioPanel
              criteria={criteria}
              customWeights={customWeights}
              onUpdateWeight={updateCriterionWeight}
              onResetWeights={resetWeights}
              simulation={sensitivitySimulation}
              crossovers={crossovers}
              scenarios={scenarios}
            />
          )}

          {activePanel === 'whatif' && (
            <WhatIfGoalSeekingPanel
              criteria={criteria}
              alternatives={alternatives}
              whatIfAltId={whatIfAltId}
              onSelectWhatIfAltId={setWhatIfAltId}
              whatIfCritId={whatIfCritId}
              onSelectWhatIfCritId={setWhatIfCritId}
              whatIfValue={whatIfValue}
              onChangeWhatIfValue={setWhatIfValue}
              whatIfResult={whatIfResult}
              goalSeekingAltId={goalSeekingAltId}
              onSelectGoalSeekingAltId={setGoalSeekingAltId}
              goalSeekingCritId={goalSeekingCritId}
              onSelectGoalSeekingCritId={setGoalSeekingCritId}
              goalSeekingResult={goalSeekingResult}
            />
          )}

          {activePanel === 'managerial' && (
            <ManagerialAiPanel synthesis={managerialSynthesis} />
          )}
        </div>
      )}
    </div>
  );
};

export default EvaluationTab;

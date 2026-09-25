import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';
import Tabs from '@/components/ui/Tabs';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useUiStore } from '@/store/useUiStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useNormalizedCriteria } from '@/store/selectors';
import { ROUTES } from '@/app/routes';
import CriteriaEditor from '@/features/shared/CriteriaEditor';
import AlternativeEditor from '@/features/shared/AlternativeEditor';
import MatrixInputGrid from '@/features/shared/MatrixInputGrid';
import SawTab from '@/features/saw/SawTab';
import WpTab from '@/features/wp/WpTab';
import TopsisTab from '@/features/topsis/TopsisTab';
import AhpTab from '@/features/ahp/AhpTab';
import ComparisonTab from '@/features/comparison/ComparisonTab';
import StoryToMatrixTab from '@/features/story-to-matrix/StoryToMatrixTab';
import TemplateSelectorModal from '@/components/layout/TemplateSelectorModal';
import ResetProjectButton from '@/features/project/ResetProjectButton';
import ExportButton from '@/features/export/ExportButton';
import useUrlTabSync from '@/features/shared/useUrlTabSync';
import GlossaryTerm from '@/features/glossary/GlossaryTerm';
import WelcomeModal from '@/features/tour/WelcomeModal';
import TourRunner from '@/features/tour/TourRunner';
import { generalTourDefinition } from '@/core/tour/generalTourSteps';
import { sawTourDefinition } from '@/core/tour/sawTourSteps';
import { wpTourDefinition } from '@/core/tour/wpTourSteps';
import { topsisTourDefinition } from '@/core/tour/topsisTourSteps';
import { ahpTourDefinition } from '@/core/tour/ahpTourSteps';
import { storyTourDefinition } from '@/core/tour/storyTourSteps';
import { useTourStore } from '@/store/useTourStore';
import { Sparkles, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { MethodId } from '@/types/domain';

export default function App() {
  useUrlTabSync();
  const { activeTab, setActiveTab } = useUiStore();
  const { title, setTitle, alternatives, updateCellValue, loadProjectState } = useProjectStore();
  const criteria = useNormalizedCriteria();
  const activeEditorSection = useUiStore((s) => s.activeEditorSection);
  const setActiveEditorSection = useUiStore((s) => s.setActiveEditorSection);
  const isSharedMatrixCollapsed = useUiStore((s) => s.isSharedMatrixCollapsed);
  const toggleSharedMatrix = useUiStore((s) => s.toggleSharedMatrix);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const hasSeenWelcome = useTourStore((s) => s.hasSeenWelcome);
  const isWelcomeOpen = useUiStore((s) => s.isWelcomeOpen);
  const openWelcome = useUiStore((s) => s.openWelcome);
  const closeWelcome = useUiStore((s) => s.closeWelcome);

  useEffect(() => {
    if (!hasSeenWelcome) {
      openWelcome();
    }
  }, [hasSeenWelcome, openWelcome]);

  const currentRoute = ROUTES.find((r) => r.id === activeTab) || ROUTES[0];

  const tabItems = ROUTES.map((r) => ({
    id: r.id,
    label: ['SAW', 'WP', 'TOPSIS', 'AHP'].includes(r.id) ? (
      <GlossaryTerm term={r.id} position="bottom">{r.label}</GlossaryTerm>
    ) : (
      r.label
    ),
    icon: r.icon,
    badge: r.badge,
  }));

  return (
    <AppShell
      headerProps={{
        title,
        activeMethod: activeTab,
        onTitleChange: setTitle,
        actions: (
          <div className="flex items-center gap-2">
            <ExportButton variant="primary" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTemplateModalOpen(true)}
              data-tour-id="load-template-btn"
              title="Buka pilihan template studi kasus SPK"
            >
              <FolderOpen className="w-3.5 h-3.5 text-accent-primary" />
              <span className="hidden sm:inline">Muat Contoh Kasus</span>
            </Button>
            <ResetProjectButton />
          </div>
        ),
      }}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation Tabs Bar & Fully Visible Method Description */}
        <div className="space-y-2.5 p-3 rounded-card bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs">
          <div data-tour-id="nav-tabs" className="overflow-x-auto pb-0.5 scrollbar-none">
            <Tabs<MethodId> items={tabItems} activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2 bg-indigo-50/50 rounded-control border border-indigo-100/60 text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="primary" size="sm">
                {currentRoute.badge}
              </Badge>
              <span className="font-bold text-slate-800">
                {['SAW', 'WP', 'TOPSIS', 'AHP'].includes(currentRoute.id) ? (
                  <GlossaryTerm term={currentRoute.id} position="bottom">{currentRoute.label}</GlossaryTerm>
                ) : (
                  currentRoute.label
                )}:
              </span>
            </div>
            <span className="text-slate-600 leading-relaxed">
              {currentRoute.description}
            </span>
          </div>
        </div>

        {/* Shared Matrix & Model Input Section (Collapsible) */}
        <Card data-tour-id="shared-matrix-card" className="transition-all duration-200 shadow-2xs">
          <CardHeader className="border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between py-2.5 px-4 gap-2">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                data-tour-id="shared-matrix-toggle-btn"
                onClick={toggleSharedMatrix}
                className="p-1.5 rounded-control hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                title={isSharedMatrixCollapsed ? 'Buka Matriks Keputusan Bersama' : 'Ciutkan Matriks Keputusan Bersama'}
              >
                {isSharedMatrixCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-accent-primary" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">Matriks Keputusan Bersama (Shared Input)</CardTitle>
                  {isSharedMatrixCollapsed && (
                    <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold border border-indigo-200/60">
                      {criteria.length} Kriteria • {alternatives.length} Alternatif (Diciutkan)
                    </span>
                  )}
                </div>
                <CardDescription>
                  {isSharedMatrixCollapsed
                    ? 'Klik "Buka Matriks" atau tombol panah untuk mengedit nilai sel, kriteria, dan alternatif.'
                    : 'Input data alternatif & kriteria dipakai lintas metode'}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {!isSharedMatrixCollapsed && (
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-control">
                  <button
                    type="button"
                    data-tour-id="editor-tab-matrix"
                    onClick={() => setActiveEditorSection('matrix')}
                    className={`px-3 py-1 text-xs font-semibold rounded ${activeEditorSection === 'matrix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Tabel Matriks
                  </button>
                  <button
                    type="button"
                    data-tour-id="editor-tab-criteria"
                    onClick={() => setActiveEditorSection('criteria')}
                    className={`px-3 py-1 text-xs font-semibold rounded ${activeEditorSection === 'criteria' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Kriteria ({criteria.length})
                  </button>
                  <button
                    type="button"
                    data-tour-id="editor-tab-alternatives"
                    onClick={() => setActiveEditorSection('alternatives')}
                    className={`px-3 py-1 text-xs font-semibold rounded ${activeEditorSection === 'alternatives' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Alternatif ({alternatives.length})
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={toggleSharedMatrix}
                className="px-2.5 py-1 text-xs font-semibold rounded-control border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                {isSharedMatrixCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-accent-primary" />
                    <span>Buka Matriks</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ciutkan</span>
                  </>
                )}
              </button>
            </div>
          </CardHeader>

          {!isSharedMatrixCollapsed && (
            <CardContent className="pt-4">
              {activeEditorSection === 'matrix' && (
                <MatrixInputGrid
                  criteria={criteria}
                  alternatives={alternatives}
                  onChangeCell={updateCellValue}
                />
              )}
              {activeEditorSection === 'criteria' && <CriteriaEditor />}
              {activeEditorSection === 'alternatives' && <AlternativeEditor />}
            </CardContent>
          )}
        </Card>

        {/* Tab-Specific Viewport with Spring Motion */}
        <div data-tour-id="compute-section">
          <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          >
            {activeTab === 'SAW' ? (
              <SawTab />
            ) : activeTab === 'WP' ? (
              <WpTab />
            ) : activeTab === 'TOPSIS' ? (
              <TopsisTab />
            ) : activeTab === 'AHP' ? (
              <AhpTab />
            ) : activeTab === 'COMPARE' ? (
              <ComparisonTab />
            ) : activeTab === 'AUTO' ? (
              <StoryToMatrixTab />
            ) : (
              <Card className="min-h-70 flex flex-col justify-center items-center text-center p-8 border-dashed border-2 border-slate-200/90 bg-white/60">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-accent-primary flex items-center justify-center mb-3 shadow-xs">
                  {currentRoute.icon}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-medium mb-2">
                  Tab ID: {activeTab}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Panel Komputasi {currentRoute.label}
                </h2>
                <p className="text-xs text-slate-500 max-w-md mb-5 leading-relaxed">
                  {currentRoute.description}.
                  Komponen stepper kalkulasi dan tabel hasil untuk tab ini siap dirangkai pada tahap berikutnya.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-50 px-3 py-1.5 rounded-control border border-slate-200/60">
                  <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
                  <span>Transisi Spring Motion Aktif (Framer Motion)</span>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {/* Modal Multi-Template Kasus */}
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={(tpl) => loadProjectState(tpl.state)}
      />

      {/* Modal Sambutan & Panduan Awal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={closeWelcome}
      />

      {/* Interactive Tour Engine Runner */}
      <TourRunner
        tours={{
          general: generalTourDefinition,
          saw: sawTourDefinition,
          wp: wpTourDefinition,
          topsis: topsisTourDefinition,
          ahp: ahpTourDefinition,
          story: storyTourDefinition,
        }}
      />
    </AppShell>
  );
}

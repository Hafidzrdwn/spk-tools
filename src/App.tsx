import React, { useState } from 'react';
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
import { Sparkles, RefreshCw, FolderOpen } from 'lucide-react';
import type { MethodId } from '@/types/domain';

export default function App() {
  const { activeTab, setActiveTab } = useUiStore();
  const { title, setTitle, alternatives, updateCellValue, resetProject, loadProjectState } = useProjectStore();
  const criteria = useNormalizedCriteria();
  const [activeEditorSection, setActiveEditorSection] = useState<'matrix' | 'criteria' | 'alternatives'>('matrix');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const currentRoute = ROUTES.find((r) => r.id === activeTab) || ROUTES[0];

  const tabItems = ROUTES.map((r) => ({
    id: r.id,
    label: r.label,
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsTemplateModalOpen(true)}
              title="Buka pilihan template studi kasus SPK"
            >
              <FolderOpen className="w-3.5 h-3.5 text-accent-primary" />
              <span>Muat Contoh Kasus</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={resetProject} title="Reset seluruh data ke kondisi awal kosong">
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            </Button>
          </div>
        ),
      }}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation Tabs Bar & Fully Visible Method Description */}
        <div className="space-y-2.5 p-3 rounded-card bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs">
          <div className="overflow-x-auto pb-0.5 scrollbar-none">
            <Tabs<MethodId> items={tabItems} activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2 bg-indigo-50/50 rounded-control border border-indigo-100/60 text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="primary" size="sm">
                {currentRoute.badge}
              </Badge>
              <span className="font-bold text-slate-800">{currentRoute.label}:</span>
            </div>
            <span className="text-slate-600 leading-relaxed">
              {currentRoute.description}
            </span>
          </div>
        </div>

        {/* Shared Matrix & Model Input Section */}
        <Card>
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-3">
            <div>
              <CardTitle className="text-sm">Matriks Keputusan Bersama (Shared Input)</CardTitle>
              <CardDescription>Input data alternatif & kriteria dipakai lintas metode</CardDescription>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-control">
              <button
                type="button"
                onClick={() => setActiveEditorSection('matrix')}
                className={`px-3 py-1 text-xs font-semibold rounded ${activeEditorSection === 'matrix' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tabel Matriks
              </button>
              <button
                type="button"
                onClick={() => setActiveEditorSection('criteria')}
                className={`px-3 py-1 text-xs font-semibold rounded ${activeEditorSection === 'criteria' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Kriteria ({criteria.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveEditorSection('alternatives')}
                className={`px-3 py-1 text-xs font-semibold rounded ${activeEditorSection === 'alternatives' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Alternatif ({alternatives.length})
              </button>
            </div>
          </CardHeader>

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
        </Card>

        {/* Tab-Specific Viewport with Spring Motion */}
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
              <Card className="min-h-[280px] flex flex-col justify-center items-center text-center p-8 border-dashed border-2 border-slate-200/90 bg-white/60">
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

      {/* Modal Multi-Template Kasus */}
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={(tpl) => loadProjectState(tpl.state)}
      />
    </AppShell>
  );
}

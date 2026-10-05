import React from 'react';
import useStoryToMatrixViewModel from './useStoryToMatrixViewModel';
import ModeSwitcher from './components/ModeSwitcher';
import StoryTextArea from './components/StoryTextArea';
import ExtractedPreviewTable from './components/ExtractedPreviewTable';
import AhpPromptModal from './components/AhpPromptModal';
import TemplatePickerModal from './components/TemplatePickerModal';
import Card, { CardContent } from '@/components/ui/Card';
import { Sparkles, Wand2 } from 'lucide-react';

export const StoryToMatrixTab: React.FC = () => {
  const {
    mode, setMode, rawText, setRawText, previewAlternatives,
    criteria, unmatchedCriteria, detectedComparisons, isAhpPromptOpen,
    setIsAhpPromptOpen, isTemplatePickerOpen, setIsTemplatePickerOpen,
    errorMessage, isCommitted, handleParse, handleCommit,
    handleSelectTemplate, generateNarrativeFromState, redirectToAhp,
    PARSER_CASE_PRESETS,
  } = useStoryToMatrixViewModel();

  const handleSwitchToStory = () => {
    if (!rawText.trim()) {
      const generated = generateNarrativeFromState();
      if (generated) setRawText(generated);
    }
    setMode('story');
  };

  const handleSwitchToForm = () => {
    if (previewAlternatives.length === 0 && rawText.trim()) {
      handleParse();
    } else {
      setMode('form');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Story-to-Matrix */}
      <Card className="bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-200/80">
        <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-100/90 border border-indigo-200/90 flex items-center justify-center text-indigo-700 shadow-xs shrink-0 mt-0.5">
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent-primary shrink-0" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide leading-tight">
                  Story-to-Matrix Intelligent Parser
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-mono px-2 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0 border border-indigo-200/60">
                  NLP Heuristic
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Konversi teks narasi kasus menjadi matriks keputusan kuantitatif secara otomatis tanpa entri manual satu per satu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-0.5 sm:pt-0">
            <button
              type="button"
              data-tour-id="story-try-example-btn"
              onClick={() => setIsTemplatePickerOpen(true)}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-primary shrink-0" />
              <span>Coba Contoh</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Mode Switcher (Cerita ↔ Form) */}
      <div data-tour-id="story-mode-switcher">
        <ModeSwitcher
          mode={mode}
          onSwitchToStory={handleSwitchToStory}
          onSwitchToForm={handleSwitchToForm}
        />
      </div>

      {/* Content View: Mode Cerita (Textarea) vs Mode Form (Table Preview) */}
      {mode === 'story' ? (
        <div data-tour-id="story-textarea-card">
          <StoryTextArea
            value={rawText}
            onChange={setRawText}
            onParse={handleParse}
            onOpenTemplates={() => setIsTemplatePickerOpen(true)}
            errorMessage={errorMessage}
          />
        </div>
      ) : (
        <div data-tour-id="story-preview-section">
          <ExtractedPreviewTable
            criteria={criteria}
            alternatives={previewAlternatives}
            unmatchedCriteria={unmatchedCriteria}
            onCommit={handleCommit}
            onBackToEdit={() => setMode('story')}
            isCommitted={isCommitted}
          />
        </div>
      )}

      {/* Modal Prompt Deteksi Perbandingan Relatif AHP */}
      <AhpPromptModal
        isOpen={isAhpPromptOpen}
        onClose={() => setIsAhpPromptOpen(false)}
        onConfirm={redirectToAhp}
        detectedComparisons={detectedComparisons}
      />

      {/* Modal Pemilih Template Kasus */}
      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onSelect={handleSelectTemplate}
        presets={PARSER_CASE_PRESETS}
      />
    </div>
  );
};

export default StoryToMatrixTab;

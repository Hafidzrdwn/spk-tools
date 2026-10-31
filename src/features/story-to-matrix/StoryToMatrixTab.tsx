import React, { useState, useEffect } from 'react';
import useStoryToMatrixViewModel from './useStoryToMatrixViewModel';
import ModeSwitcher from './components/ModeSwitcher';
import StoryTextArea from './components/StoryTextArea';
import ExtractedPreviewTable from './components/ExtractedPreviewTable';
import AhpPromptModal from './components/AhpPromptModal';
import TemplatePickerModal from './components/TemplatePickerModal';
import Card, { CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Sparkles } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { getEffectiveGeminiApiKey } from '@/services/ai';

export const StoryToMatrixTab: React.FC = () => {
  const openAiConfig = useUiStore((s) => s.openAiConfig);
  const aiKeyVersion = useUiStore((s) => s.aiKeyVersion);
  const [hasAiKey, setHasAiKey] = useState(false);

  useEffect(() => {
    const key = getEffectiveGeminiApiKey();
    setHasAiKey(Boolean(key && key.length > 0));
  }, [aiKeyVersion]);

  const {
    mode, setMode, rawText, setRawText, previewAlternatives, setPreviewAlternatives,
    criteria, setTempCriteria, unmatchedCriteria, detectedComparisons, isAhpPromptOpen,
    setIsAhpPromptOpen, isTemplatePickerOpen, setIsTemplatePickerOpen,
    errorMessage, isCommitted, handleParse, handleCommit,
    handleSelectTemplate, generateNarrativeFromState, redirectToAhp,
    PARSER_CASE_PRESETS,
    storyInputMode, setStoryInputMode, isAnalyzing, contextMetadata,
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
      <Card className="bg-linear-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-200/80">
        <CardContent className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="min-w-0">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide leading-tight">
                Story-to-Matrix Intelligent Parser
              </span>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Konversi narasi cerita atau studi kasus menjadi matriks keputusan terstruktur secara otomatis tanpa entri manual.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAiConfig}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            title="Kelola Kunci AI Gemini untuk Ekstraksi Narasi"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Kunci AI</span>
            <Badge
              variant={hasAiKey ? 'benefit' : 'neutral'}
              size="sm"
              className="text-[10px] py-0 px-1.5 font-bold"
            >
              {hasAiKey ? 'Aktif' : 'Atur Kunci'}
            </Badge>
          </button>
        </CardContent>
      </Card>

      <div data-tour-id="story-mode-switcher">
        <ModeSwitcher
          mode={mode}
          onSwitchToStory={handleSwitchToStory}
          onSwitchToForm={handleSwitchToForm}
        />
      </div>

      {mode === 'story' ? (
        <div data-tour-id="story-textarea-card">
          <StoryTextArea
            value={rawText}
            onChange={setRawText}
            onParse={handleParse}
            onOpenTemplates={() => setIsTemplatePickerOpen(true)}
            errorMessage={errorMessage}
            storyInputMode={storyInputMode}
            onChangeMode={setStoryInputMode}
            isAnalyzing={isAnalyzing}
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
            contextMetadata={contextMetadata}
            onUpdateCriteria={setTempCriteria}
            onUpdateAlternatives={setPreviewAlternatives}
          />
        </div>
      )}

      <AhpPromptModal
        isOpen={isAhpPromptOpen}
        onClose={() => setIsAhpPromptOpen(false)}
        onConfirm={redirectToAhp}
        detectedComparisons={detectedComparisons}
      />

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

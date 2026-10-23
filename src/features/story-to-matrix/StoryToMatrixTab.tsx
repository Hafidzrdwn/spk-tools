import React from 'react';
import useStoryToMatrixViewModel from './useStoryToMatrixViewModel';
import ModeSwitcher from './components/ModeSwitcher';
import StoryTextArea from './components/StoryTextArea';
import ExtractedPreviewTable from './components/ExtractedPreviewTable';
import AhpPromptModal from './components/AhpPromptModal';
import TemplatePickerModal from './components/TemplatePickerModal';
import Card, { CardContent } from '@/components/ui/Card';

export const StoryToMatrixTab: React.FC = () => {
  const {
    mode, setMode, rawText, setRawText, previewAlternatives,
    criteria, unmatchedCriteria, detectedComparisons, isAhpPromptOpen,
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
        <CardContent className="p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4">
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

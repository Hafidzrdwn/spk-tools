export {
  extractAlternativesFromText,
  type EntityExtractionResult,
  type EntityExtractionSuccess,
  type EntityExtractionError,
  type LineError,
} from './entityExtractor';

export {
  detectComparisonsFromText,
  type ComparisonDetectionResult,
  type ComparisonDetectionSuccess,
  type ComparisonDetectionError,
  type DetectedComparison,
} from './comparisonDetector';

export {
  PARSER_CASE_PRESETS,
  type ParserCasePreset,
} from './caseTemplates';

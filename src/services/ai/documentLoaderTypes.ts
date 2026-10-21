import type { Criterion, Alternative } from '@/types/domain';

export type DocumentFileType = 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'json' | 'unknown';

export interface DocumentFilePayload {
  name: string;
  size: number;
  type: DocumentFileType;
  mimeType: string;
  textContent?: string;
  base64Data?: string;
}

export type DocumentLoaderErrorCode =
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'CORRUPTED_FILE'
  | 'DOCUMENT_EMPTY'
  | 'INSUFFICIENT_DATA'
  | 'API_KEY_MISSING'
  | 'AI_SERVICE_ERROR'
  | 'SCHEMA_VALIDATION_ERROR';

export interface DocumentLoaderError {
  code: DocumentLoaderErrorCode;
  message: string;
  details?: string;
  suggestion?: string;
}

export interface ExtractedRawCriterion {
  name: string;
  type: 'BENEFIT' | 'COST';
  weight?: number;
  unit?: string;
  description?: string;
}

export interface ExtractedRawAlternative {
  name: string;
  values: Record<string, number>;
}

export interface DocumentExtractionAiResponse {
  projectTitle: string;
  projectDescription?: string;
  criteria: ExtractedRawCriterion[];
  alternatives: ExtractedRawAlternative[];
  summary?: string;
  confidenceScore?: number;
  warnings?: string[];
}

export interface ProcessedDocumentResult {
  projectTitle: string;
  projectDescription?: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  sourceFile: {
    name: string;
    size: number;
    type: DocumentFileType;
  };
  warnings: string[];
  confidenceScore: number;
  modelUsed?: string;
}

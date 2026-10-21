import mammoth from 'mammoth';
import type { DocumentFilePayload, DocumentFileType, DocumentLoaderError } from './documentLoaderTypes';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function detectFileType(file: File): DocumentFileType {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf' || file.type === 'application/pdf') return 'pdf';
  if (
    extension === 'docx' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  if (extension === 'txt' || file.type === 'text/plain') return 'txt';
  if (extension === 'md' || extension === 'markdown') return 'md';
  if (extension === 'csv' || file.type === 'text/csv') return 'csv';
  if (extension === 'json' || file.type === 'application/json') return 'json';
  return 'unknown';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function readDocumentFile(file: File): Promise<DocumentFilePayload> {
  if (file.size === 0) {
    const error: DocumentLoaderError = {
      code: 'DOCUMENT_EMPTY',
      message: `Berkas "${file.name}" kosong (0 byte).`,
      suggestion: 'Pastikan berkas memiliki konten data evaluasi keputusan dan tidak korup.',
    };
    throw error;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const error: DocumentLoaderError = {
      code: 'FILE_TOO_LARGE',
      message: 'Ukuran berkas melebihi batas maksimum 10 MB.',
      suggestion: 'Harap kompres berkas atau gunakan dokumen dengan ukuran di bawah 10 MB.',
    };
    throw error;
  }

  const detectedType = detectFileType(file);
  if (detectedType === 'unknown') {
    const error: DocumentLoaderError = {
      code: 'UNSUPPORTED_FORMAT',
      message: `Format berkas "${file.name}" tidak didukung.`,
      suggestion: 'Silakan gunakan berkas PDF (.pdf), Word (.docx), atau Teks (.txt, .md, .csv, .json).',
    };
    throw error;
  }

  try {
    if (detectedType === 'pdf') {
      const buffer = await file.arrayBuffer();
      if (buffer.byteLength === 0) {
        const error: DocumentLoaderError = {
          code: 'DOCUMENT_EMPTY',
          message: 'Berkas PDF kosong (0 byte).',
          suggestion: 'Pastikan berkas PDF yang Anda pilih memiliki konten dan tidak korup.',
        };
        throw error;
      }
      const base64Data = arrayBufferToBase64(buffer);
      return {
        name: file.name,
        size: file.size,
        type: 'pdf',
        mimeType: 'application/pdf',
        base64Data,
      };
    }

    if (detectedType === 'docx') {
      const buffer = await file.arrayBuffer();
      if (buffer.byteLength === 0) {
        const error: DocumentLoaderError = {
          code: 'DOCUMENT_EMPTY',
          message: 'Berkas Word (.docx) kosong (0 byte).',
          suggestion: 'Pastikan berkas Word yang Anda pilih memiliki isi teks atau tabel.',
        };
        throw error;
      }

      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      const text = (result.value || '').trim();

      if (!text) {
        const error: DocumentLoaderError = {
          code: 'DOCUMENT_EMPTY',
          message: 'Dokumen Word tidak memuat teks atau tabel yang dapat diekstrak.',
          suggestion: 'Pastikan berkas .docx memuat teks atau tabel data evaluasi, bukan sekadar gambar murni.',
        };
        throw error;
      }

      return {
        name: file.name,
        size: file.size,
        type: 'docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        textContent: text,
      };
    }

    const text = (await file.text()).trim();
    if (!text) {
      const error: DocumentLoaderError = {
        code: 'DOCUMENT_EMPTY',
        message: 'Berkas teks kosong.',
        suggestion: 'Pastikan berkas teks memuat data tabel kriteria dan alternatif keputusan.',
      };
      throw error;
    }

    return {
      name: file.name,
      size: file.size,
      type: detectedType,
      mimeType: file.type || 'text/plain',
      textContent: text,
    };
  } catch (err: unknown) {
    if ((err as DocumentLoaderError)?.code) {
      throw err;
    }
    const error: DocumentLoaderError = {
      code: 'CORRUPTED_FILE',
      message: `Gagal membaca isi berkas "${file.name}".`,
      details: err instanceof Error ? err.message : String(err),
      suggestion: 'Pastikan berkas tidak rusak atau terenkripsi kata sandi.',
    };
    throw error;
  }
}

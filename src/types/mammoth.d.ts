declare module 'mammoth' {
  export interface MammothMessage {
    type: string;
    message: string;
  }

  export interface MammothResult {
    value: string;
    messages: MammothMessage[];
  }

  export function extractRawText(input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string }): Promise<MammothResult>;
  export function convertToHtml(input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string }): Promise<MammothResult>;
}

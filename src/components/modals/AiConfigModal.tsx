import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { getEffectiveGeminiApiKey, setCustomGeminiApiKey } from '@/services/ai';
import { useUiStore } from '@/store/useUiStore';

export interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({ isOpen, onClose }) => {
  const notifyAiKeyUpdated = useUiStore((s) => s.notifyAiKeyUpdated);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [showKeyText, setShowKeyText] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentKey = getEffectiveGeminiApiKey();
      setApiKeyInput(currentKey);
      setHasStoredKey(Boolean(currentKey && currentKey.length > 0));
      setShowKeyText(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    const trimmed = apiKeyInput.trim();
    setCustomGeminiApiKey(trimmed);
    notifyAiKeyUpdated();
    const activeKey = getEffectiveGeminiApiKey();
    setHasStoredKey(Boolean(activeKey && activeKey.length > 0));
    if (trimmed) {
      toast.success('Kunci Gemini API berhasil disimpan.');
    } else {
      toast.info('Kunci Gemini API telah dikosongkan.');
    }
    onClose();
  };

  const handleRemove = () => {
    setCustomGeminiApiKey('');
    setApiKeyInput('');
    setHasStoredKey(false);
    notifyAiKeyUpdated();
    toast.info('Kunci Gemini API berhasil dihapus.');
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Pengaturan Kunci Gemini AI"
      className="max-w-md"
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between py-1">
          <span className="text-slate-600 font-medium">Status Integrasi</span>
          <Badge variant={hasStoredKey ? 'benefit' : 'neutral'} size="sm">
            {hasStoredKey ? 'Kunci Terhubung' : 'Belum Dikonfigurasi'}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="input-central-gemini-key" className="font-semibold text-slate-800">
              API Key Google Gemini
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Dapatkan Kunci Gratis &nearr;
            </a>
          </div>

          <div className="relative">
            <input
              id="input-central-gemini-key"
              type={showKeyText ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Tempel kunci API (AIzaSy...)"
              className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs text-slate-900"
            />
            <button
              type="button"
              onClick={() => setShowKeyText((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              title={showKeyText ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
            Kunci ini digunakan untuk fitur ekstraksi dokumen, story-to-matrix, dan analisis narasi.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed">
          Kunci disimpan secara lokal di peramban (localStorage) perangkat Anda dan dikirim langsung ke Google AI tanpa melalui server perantara.
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {hasStoredKey ? (
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium cursor-pointer"
            >
              Hapus Kunci
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="text-xs font-semibold cursor-pointer px-4"
            >
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AiConfigModal;

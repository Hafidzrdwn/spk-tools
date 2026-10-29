import React, { useState, useEffect } from 'react';
import { Sparkles, KeyRound, Eye, EyeOff, Check, ExternalLink, ShieldCheck, Trash2 } from 'lucide-react';
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
      toast.success('Kunci Gemini API berhasil disimpan. Fitur AI siap digunakan!');
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
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0 text-indigo-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pengaturan Kunci Google Gemini AI
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Pusat konfigurasi API AI untuk seluruh fitur DecisiGraph
            </p>
          </div>
        </div>
      }
      className="max-w-lg"
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-700">Status Integrasi:</span>
            {hasStoredKey ? (
              <Badge variant="benefit" size="sm" className="font-bold text-[10px]">
                Kunci AI Aktif
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm" className="text-[10px] bg-amber-100 text-amber-800 border-amber-200">
                Belum Terpasang (Mode Lokal)
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            {hasStoredKey ? 'Siap Ekstraksi & Narasi' : 'Menggunakan Parser Offline'}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="input-central-gemini-key" className="font-bold text-slate-800">
              Kunci API Google Gemini (VITE_GEMINI_API_KEY)
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
            >
              <span>Dapatkan Kunci Gratis</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              id="input-central-gemini-key"
              type={showKeyText ? 'text' : 'password'}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Tempel kunci API Gemini Anda (contoh: AIzaSy...)"
              className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs text-slate-900"
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

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Kunci API ini digunakan bersama untuk fitur <strong>AI Document Loader</strong>, <strong>Story-to-Matrix Intelligent Parser</strong>, serta <strong>Narasi Eksekutif Otomatis</strong>.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200/60 flex items-start gap-2 text-[11px] text-indigo-900">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Keamanan Terjamin:</strong> Kunci disimpan secara lokal di browser Anda (localStorage) dan dikirim langsung ke endpoint Google AI tanpa disimpan di server kami.
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
          {hasStoredKey ? (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-medium inline-flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Kunci</span>
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
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="gap-1.5 text-xs font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Kunci</span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AiConfigModal;


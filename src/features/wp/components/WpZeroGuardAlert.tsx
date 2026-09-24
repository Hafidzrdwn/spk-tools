import React from 'react';
import type { ZeroGuardViolationDetail } from '../useWpViewModel';
import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export interface WpZeroGuardAlertProps {
  violations: ZeroGuardViolationDetail[];
  className?: string;
}

export const WpZeroGuardAlert: React.FC<WpZeroGuardAlertProps> = ({ violations, className }) => {
  if (violations.length === 0) return null;

  return (
    <div
      className={`rounded-card border-2 border-rose-300 bg-rose-50/95 p-4.5 shadow-sm text-rose-950 space-y-3 animate-in fade-in-50 duration-200 ${className ?? ''}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-200 text-cost flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-rose-900">
              Pelanggaran WP Zero-Guard ({violations.length} Sel Bernilai 0)
            </h4>
            <Badge variant="cost" size="sm">
              Kalkulasi Diblokir
            </Badge>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">
            Metode Weighted Product (WP) tidak memperbolehkan nilai <strong>0</strong> pada kriteria bertipe <strong>Cost</strong> karena dipangkatkan negatif (<code className="bg-rose-100/80 px-1 py-0.5 rounded font-mono text-[11px]">0^-w = 1 / 0^w = Infinity</code>), yang menyebabkan pembagian nol dan merusak seluruh Vektor S.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-rose-200/90 bg-white/95 p-3 space-y-2">
        <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wide block">
          Daftar Sel yang Wajib Diperbaiki:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {violations.map((v, idx) => (
            <div
              key={`${v.alternativeId}-${v.criterionId}-${idx}`}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-rose-50/60 border border-rose-200 text-xs"
            >
              <div className="min-w-0">
                <span className="font-bold text-slate-800 truncate block">
                  {v.alternativeName}
                </span>
                <span className="text-[11px] text-rose-600 truncate block">
                  Kriteria: {v.criterionName}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-rose-100 text-rose-800 border border-rose-200">
                  Nilai: {v.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-rose-700 bg-rose-100/60 px-3 py-1.5 rounded-lg border border-rose-200/60">
        <AlertTriangle className="w-3.5 h-3.5 text-cost shrink-0" />
        <span>Ubah nilai sel di atas menjadi angka positif (&gt; 0) pada tabel input agar kalkulasi dapat dilanjutkan.</span>
      </div>
    </div>
  );
};

export default WpZeroGuardAlert;

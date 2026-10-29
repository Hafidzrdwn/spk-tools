import React, { useState } from 'react';
import { AuthorBoxMascot } from '@/components/illustrations';
import Button from '@/components/ui/Button';

export const AboutView: React.FC = () => {
  const targetWaNumber = '6282141068404';

  const quickPresets = [
    'Halo Mas Hafidz, saya ingin berdiskusi mengenai studi kasus SPK.',
    'Halo Mas Hafidz, saya ada pertanyaan seputar penggunaan fitur DecisiGraph.',
    'Halo Mas Hafidz, saya ingin memberi masukan/usulan fitur untuk rilis mendatang.',
    'Halo Mas Hafidz, saya tertarik berkolaborasi dalam riset atau pengembangan SPK.',
  ];

  const [selectedPreset, setSelectedPreset] = useState(quickPresets[0]);
  const [customNote, setCustomNote] = useState('');
  const [senderName, setSenderName] = useState('');

  const finalMessage = `${selectedPreset}${
    customNote.trim() ? `\n\nCatatan tambahan:\n${customNote.trim()}` : ''
  }${
    senderName.trim() ? `\n\nSalam,\n${senderName.trim()}` : ''
  }`;

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(finalMessage);
    const waUrl = ['https:', '', `wa.me/${targetWaNumber}`].join('/') + `?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-10 sm:space-y-12 text-left">
      <section className="border-b border-slate-200 pb-8 sm:pb-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Kreator Platform
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Hafidz Ridwan
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            Pengembang di balik DecisiGraph. Platform ini dibangun atas komitmen terhadap transparansi 
            proses pengambilan keputusan: memadukan ketelitian kalkulasi 
            matematis multi-kriteria dengan keleluasaan asistensi kecerdasan buatan.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://github.com/hafidzrdwn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/hafidzrdwn/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>
        </div>

        <div className="md:col-span-4 flex justify-center md:justify-end">
          <AuthorBoxMascot className="w-48 sm:w-56" />
        </div>
      </section>

      <section className="space-y-4 max-w-3xl">
        <h2 className="text-base font-bold text-slate-900">
          Filosofi Pengembangan
        </h2>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <p>
            DecisiGraph berakar dari pengalaman praktis menghadapi persoalan sistem pendukung keputusan (SPK). 
            Sering kali, perhitungan manual di spreadsheet rawan kekeliruan logika dan sulit diaudit oleh orang lain, 
            sementara alat bantu otomatis yang ada cenderung tertutup.
          </p>
          <p>
            Aplikasi ini dirancang dengan prinsip keterlacakan penuh: setiap angka normalisasi, 
            bobot preferensi, dan hasil perankingan dapat ditelusuri rumusnya secara presisi, 
            sekaligus diperkaya dengan sintesis kecerdasan buatan untuk membantu interpretasi manajerial.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8 space-y-5 max-w-3xl">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Bantuan &amp; Diskusi Langsung
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Hubungi Hafidz via WhatsApp
          </h2>
          <p className="text-xs text-slate-500">
            Pilih pesan cepat di bawah atau tulis pesan Anda untuk memulai percakapan langsung via WhatsApp (082141068404).
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Pilih Topik Percakapan Cepat:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPreset(preset)}
                className={`p-3 rounded-lg text-left text-xs transition-colors border cursor-pointer ${
                  selectedPreset === preset
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Anda (Opsional):
            </label>
            <input
              type="text"
              placeholder="Nama Anda"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Khusus (Opsional):
            </label>
            <input
              type="text"
              placeholder="Misal: kasus pemilihan vendor / skripsi"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenWhatsApp}
            className="w-full sm:w-auto text-xs font-semibold min-h-11 px-6 justify-center shadow-2xs"
          >
            Kirim ke WhatsApp
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutView;

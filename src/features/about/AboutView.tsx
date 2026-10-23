import React, { useState } from 'react';
import { AuthorAvatarIllustration } from '@/components/illustrations';
import { MessageSquare, Github, Send, Copy, Check, Heart, ExternalLink, Lightbulb, Code2, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

export const AboutView: React.FC = () => {
  const [topic, setTopic] = useState('Konsultasi Studi Kasus SPK');
  const [senderName, setSenderName] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const targetWaNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';

  const formattedWhatsAppText = `Halo Mas Hafidz, perkenalkan saya ${senderName.trim() || 'Pengguna DecisiGraph'}${
    organization.trim() ? ` dari ${organization.trim()}` : ''
  }.

*Topik Pertanyaan:* ${topic}
*Pesan:*
${message.trim() || 'Saya ingin berdiskusi mengenai penggunaan DecisiGraph untuk analisis SPK.'}

---
(Dikirim melalui Bantuan Langsung DecisiGraph SPK)`;

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(formattedWhatsAppText);
    const waUrl = ['https:', '', `wa.me/${targetWaNumber}`].join('/') + `?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedWhatsAppText);
      setIsCopied(true);
      toast.success('Pesan WhatsApp berhasil disalin ke clipboard!');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error('Gagal menyalin teks ke clipboard.');
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-3.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-semibold">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Kreator &amp; Pengembang Platform</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tentang Pengembang &amp; Misi DecisiGraph
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Hai! Saya <strong>Hafidz Ridwan</strong>, kreator di balik DecisiGraph. 
            Platform ini lahir dari pengalaman riset dan pengamatan langsung terhadap proses pengambilan keputusan multi-kriteria: 
            banyak orang memahami konsep teorinya, namun sering kali terhambat oleh kerumitan spreadsheet, 
            formula yang rawan eror, serta hasil analisis yang sulit dijelaskan kepada orang lain.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/hafidzrdwn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub @hafidzrdwn</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <Badge variant="primary" size="md" className="font-medium text-xs">
              Software Engineer &amp; MCDM Researcher
            </Badge>
          </div>
        </div>

        <div className="md:col-span-5 flex justify-center">
          <AuthorAvatarIllustration className="w-full max-w-xs sm:max-w-sm" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">1. Transparansi Radikal</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Tidak ada kotak hitam (*black-box*). Setiap desimal, formula KaTeX, dan normalisasi per sel dapat diinspeksi langsung hingga ke nilai sumbernya.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">2. Human-in-the-Loop AI</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI bertugas membantu menyusun struktur matriks dan sintesis manajerial, namun otoritas pertimbangan akhir tetap sepenuhnya berada pada pemangku kepentingan.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Code2 className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">3. Akses Terbuka &amp; Nyaman</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Berjalan 100% di browser tanpa instalasi software berat, ramah ponsel cerdas, bebas iklan komersial, dan dirilis di bawah lisensi terbuka MIT.
          </p>
        </div>
      </section>

      <section className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-indigo-500/20 shadow-2xs text-left space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Bantuan &amp; Diskusi Langsung Pengembang</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Kirim Pertanyaan Langsung ke WhatsApp Hafidz
            </h2>
            <p className="text-xs text-slate-500">
              Punya pertanyaan seputar metodologi SPK, saran fitur, atau kendala teknis? 
              Gunakan formulir ini untuk membuat format pesan WhatsApp otomatis yang rapi dan terstruktur.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Topik Pertanyaan / Diskusi:
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-xs font-medium rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Konsultasi Studi Kasus SPK">💡 Konsultasi Studi Kasus SPK &amp; Metodologi</option>
                <option value="Laporan Kendala / Bug Teknis">🐛 Laporan Kendala / Bug Teknis</option>
                <option value="Usulan Fitur Baru untuk v2.0">✨ Usulan Fitur Baru untuk Rilis v2.0</option>
                <option value="Diskusi Riset & Kolaborasi">🤝 Diskusi Riset &amp; Kolaborasi Akademik</option>
                <option value="Pertanyaan Umum">💬 Pertanyaan Umum Lainnya</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Anda (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian / Sarah"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instansi / Kampus (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Universitas / Perusahaan"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Isi Pertanyaan / Pesan:
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan pertanyaan, studi kasus SPK yang sedang Anda kerjakan, atau detail kendala..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenWhatsApp}
                className="w-full sm:w-auto text-xs font-bold gap-2 min-h-11 px-5 justify-center bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              >
                <Send className="w-4 h-4" />
                <span>Buka Chat WhatsApp Sekarang</span>
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleCopyText}
                className="w-full sm:w-auto text-xs font-semibold gap-2 min-h-11 px-4 justify-center"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Format Pesan'}</span>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-left">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold border-b border-slate-200/80 pb-2">
              <span>Pratinjau Format Pesan WhatsApp:</span>
              <span className="text-emerald-700 font-mono font-bold">wa.me</span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed shadow-2xs">
              {formattedWhatsAppText}
            </div>

            <p className="text-[10px] text-slate-400 leading-tight pt-1">
              *Teks di atas akan otomatis dimuat ke kolom chat WhatsApp begitu Anda mengklik tombol kirim.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutView;

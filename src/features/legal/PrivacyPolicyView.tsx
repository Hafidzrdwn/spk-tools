import React from 'react';
import { PrivacySecurityIllustration } from '@/components/illustrations';
import { ShieldCheck, HardDrive, Database, Mail, Cpu, RefreshCw, Lock } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 space-y-3.5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Komitmen Transparansi Data</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kebijakan Privasi DecisiGraph
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            DecisiGraph beroperasi dengan prinsip <strong>Local-First & Radical Transparency</strong>. 
            Kami percaya bahwa analisis keputusan multi-kriteria Anda bersifat privat. 
            Halaman ini menjelaskan secara terbuka apa saja yang diproses pada sistem, 
            layanan pihak ketiga yang terhubung, dan bagaimana privasi Anda senantiasa terlindungi.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-700">Terakhir diperbarui:</span>
            <Badge variant="neutral" size="sm">23 Oktober 2026</Badge>
            <span className="text-slate-300">&bull;</span>
            <span className="font-medium text-emerald-700">Berlaku untuk Versi 1.1</span>
          </div>
        </div>

        <div className="md:col-span-5 flex justify-center">
          <PrivacySecurityIllustration className="w-full max-w-xs sm:max-w-sm" />
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-xs font-bold text-slate-900">Local-First Storage</h2>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Data matriks, nama kandidat, dan bobot tersimpan di peramban Anda (localStorage). Tidak dikirim ke database kami.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h2 className="text-xs font-bold text-slate-900">Tanpa Pelacak Iklan</h2>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Bebas cookie iklan pihak ketiga (seperti Facebook Pixel atau Google AdSense). Tidak ada pelacakan profil komersial.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5 sm:col-span-2 lg:col-span-1">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h2 className="text-xs font-bold text-slate-900">Kendali Reset Total</h2>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Sekali klik tombol &quot;Reset Proyek&quot;, seluruh data studi kasus dan cache narasi langsung musnah dari peramban Anda.
          </p>
        </div>
      </section>

      <section className="space-y-5 text-left">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-indigo-700">
            <HardDrive className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              1. Penyimpanan Data Lokal (Local Storage Browser)
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Saat Anda menggunakan DecisiGraph untuk menghitung metode SAW, WP, TOPSIS, atau AHP, 
              seluruh data input (nama alternatif, kriteria, nilai bobot, tipe benefit/cost, dan matriks perbandingan) 
              disimpan secara eksklusif di dalam <strong>Local Storage</strong> peramban Anda.
            </p>
            <p>
              Artinya, data tersebut berada di bawah kendali fisik perangkat Anda. Kami tidak memiliki salinan cadangan di peladen 
              (*server-side*) DecisiGraph untuk proyek pribadi Anda. Jika Anda membuka aplikasi di komputer lain, 
              data tidak akan otomatis sinkron kecuali Anda mengekspor file cadangan JSON menggunakan fitur <em>Project Backup</em>.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              2. Statistik Penggunaan & Deduplikasi Kunjungan (Komunitas & Analitik)
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Pada tab <strong>/analytics</strong> dan linimasa <strong>/review</strong>, DecisiGraph menampilkan data agregat 
              transparan berupa total kunjungan harian, sistem operasi, dan peramban yang digunakan.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>
                <strong>Deduplikasi Alamat IP:</strong> Untuk mencegah inflasi angka kunjungan palsu (spam reload) dan menjaga batas kuota layanan gratis, 
                sistem mencatat hash teknis alamat IP untuk satu hari kalender. Kami tidak mengaitkan alamat IP Anda dengan identitas pribadi apa pun.
              </li>
              <li>
                <strong>Pembersihan Otomatis (*Garbage Collection*):</strong> Riwayat kunci deduplikasi lokal dibersihkan secara berkala 
                dari memori browser begitu melewati ambang batas tanggal hari aktif.
              </li>
              <li>
                <strong>Bebas Fingerprinting Invasif:</strong> Kami tidak melakukan canvas fingerprinting, audio fingerprinting, atau pelacakan lintas domain.
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-blue-700">
            <Database className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              3. Formulir Komunitas & Ulasan Pengguna (Firebase Realtime Database)
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Jika Anda secara sukarela memberikan ulasan pada halaman Komunitas, informasi yang Anda kirimkan meliputi:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li>Nama Tampilan (*Display Name*) yang Anda masukkan secara manual.</li>
              <li>Peran / Profesi yang Anda pilih (misal: Mahasiswa, Dosen, Peneliti, Praktisi).</li>
              <li>Tingkat kepuasan bintang (1–5 bintang) dan teks ulasan pengalaman Anda.</li>
              <li>Waktu kirim (*timestamp*).</li>
            </ul>
            <p>
              Data ini tersimpan pada Firebase Realtime Database dan bersifat publik untuk dibaca oleh komunitas pengguna lain. 
              Mohon jangan menyertakan nomor telepon, kata sandi, atau data rahasia pada kolom ulasan publik.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-amber-700">
            <Mail className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              4. Formulir Pelaporan Kendala & Bantuan (Web3Forms API)
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Ketika Anda melaporkan bug atau kendala teknis melalui modal pengaduan dalam aplikasi, data yang Anda masukkan 
              (email pengirim, ringkasan kendala, langkah reproduksi, dan tangkapan layar) diteruskan langsung ke kotak surat pengembang 
              melalui layanan <strong>Web3Forms</strong>.
            </p>
            <p>
              Formulir ini dilengkapi dengan <em>invisible bot honeypot</em> dan sistem jeda waktu (*cooldown* 60 detik) 
              guna memitigasi serangan denial-of-service atau spamming. Alamat email Anda hanya digunakan untuk membalas tindak lanjut laporan kendala Anda.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-purple-700">
            <Cpu className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              5. Pemrosesan Dokumen & Kecerdasan Buatan (Google Gemini API)
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Fitur <strong>Story-to-Matrix</strong> dan <strong>AI Document Loader</strong> memungkinkan Anda mengunggah berkas 
              (PDF, DOCX, XLSX, TXT) atau menempelkan narasi studi kasus. 
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>
                <strong>Pemrosesan Transit:</strong> Potongan teks dokumen dikirim secara aman (melalui protokol HTTPS terenkripsi) 
                ke endpoint Google Gemini API untuk mengekstrak kriteria, bobot, dan alternatif keputusan.
              </li>
              <li>
                <strong>Nol Penyimpanan Permanen:</strong> DecisiGraph tidak menyimpan berkas mentah Anda di server eksternal. 
                Begitu hasil ekstraksi matriks diterima di browser, teks mentah hanya disimpan sementara di peramban Anda untuk keperluan sesi aktif.
              </li>
              <li>
                <strong>Saran Kebijakan Berkas:</strong> Pengguna dihimbau untuk tidak mengunggah dokumen yang berisi rahasia militer/negara, 
                rekam medis rahasia, atau data finansial berizin khusus.
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5 text-rose-700">
            <RefreshCw className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-bold text-slate-900">
              6. Hak Pengguna & Prosedur Penghapusan Data
            </h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Karena data utama berada di browser Anda, Anda memiliki hak penuh untuk:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-600">
              <li>Mengekspor seluruh data proyek ke berkas JSON cadangan kapan saja.</li>
              <li>Menghapus seluruh histori input dengan menekan tombol <strong>&quot;Reset Proyek&quot;</strong> pada menu aplikasi.</li>
              <li>Membersihkan <em>Local Storage / Cookies</em> melalui menu Pengaturan Browser Anda untuk menghapus jejak permanen.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyView;

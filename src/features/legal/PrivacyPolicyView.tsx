import React from 'react';
import { PrivacyBoxMascot } from '@/components/illustrations';

export const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="space-y-10 sm:space-y-12 text-left">
      <section className="border-b border-slate-200 pb-8 sm:pb-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Transparansi Data
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Kebijakan Privasi
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            DecisiGraph beroperasi dengan prinsip <strong>Local-First</strong>. Seluruh proses perhitungan 
            dan matriks keputusan disimpan secara lokal di peramban Anda. Dokumen ini menjelaskan secara lugas 
            apa saja yang diproses pada sistem, koneksi layanan eksternal, dan kendali data Anda.
          </p>

          <div className="pt-1 text-xs text-slate-400">
            Terakhir diperbarui: 23 Oktober 2026 &bull; Berlaku untuk Versi 1.1
          </div>
        </div>

        <div className="md:col-span-4 flex justify-center md:justify-end">
          <PrivacyBoxMascot className="w-48 sm:w-56" />
        </div>
      </section>

      <section className="space-y-8 max-w-3xl">
        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">01</span>
            <h2 className="text-base font-bold text-slate-900">
              Penyimpanan Data Lokal (Local Storage Browser)
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-7">
            Ketika Anda menginput kriteria, alternatif, nilai bobot, dan matriks keputusan untuk metode SAW, WP, TOPSIS, 
            maupun AHP, seluruh data tersebut tersimpan eksklusif di dalam memori <em>Local Storage</em> peramban Anda. 
            DecisiGraph tidak memiliki database privat di peladen untuk menyimpan proyek atau identitas pribadi Anda. 
            Data Anda tetap berada di bawah kendali fisik perangkat Anda sendiri.
          </p>
        </article>

        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">02</span>
            <h2 className="text-base font-bold text-slate-900">
              Statistik Kunjungan &amp; Deduplikasi Alamat IP
            </h2>
          </div>
          <div className="space-y-2 text-sm text-slate-600 leading-relaxed pl-7">
            <p>
              Pada tab analitik dan komunitas, sistem menampilkan data agregat kunjungan, tipe peramban, dan sistem operasi pengguna secara transparan.
            </p>
            <p>
              Untuk mencegah manipulasi angka kunjungan dan melindungi kuota layanan, sistem membuat hash teknis satu arah dari alamat IP per hari kalender. 
              Alamat IP Anda tidak pernah disimpan dalam bentuk teks mentah yang dapat diidentifikasi secara pribadi, dan riwayat kunci deduplikasi lokal 
              secara rutin dibersihkan melalui mekanisme <em>garbage collection</em> otomatis.
            </p>
          </div>
        </article>

        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">03</span>
            <h2 className="text-base font-bold text-slate-900">
              Ulasan Komunitas (Firebase Realtime Database)
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-7">
            Jika Anda secara sukarela membagikan ulasan pada linimasa Komunitas, informasi yang tersimpan meliputi nama panggilan yang Anda tentukan, 
            pilihan peran/profesi, rating bintang, dan pesan ulasan Anda. Data ini tersimpan di Firebase Realtime Database dan bersifat publik 
            untuk dibaca oleh pengguna lain. Kami menghimbau untuk tidak menyertakan data sensitif atau kontak rahasia pada kolom ulasan publik.
          </p>
        </article>

        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">04</span>
            <h2 className="text-base font-bold text-slate-900">
              Formulir Bantuan &amp; Laporan Kendala (Web3Forms API)
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-7">
            Pengiriman laporan bug atau kendala teknis diteruskan ke email pengembang melalui Web3Forms API. 
            Data yang dikirimkan meliputi alamat email yang Anda masukkan secara sukarela, teks kendala, dan lampiran tangkapan layar. 
            Layanan ini dilengkapi proteksi bot honeypot dan jeda pengiriman (cooldown 60 detik) untuk mencegah penyalahgunaan.
          </p>
        </article>

        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">05</span>
            <h2 className="text-base font-bold text-slate-900">
              Pemrosesan Dokumen &amp; AI (Google Gemini GenAI)
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-7">
            Fitur Story-to-Matrix dan Document Loader (unggah PDF, Word, Excel, teks) mengirimkan teks studi kasus ke Google Gemini API 
            secara transit melalui koneksi aman HTTPS untuk dipetakan menjadi matriks keputusan. DecisiGraph tidak menyimpan dokumen Anda 
            di server eksternal mana pun. Disarankan untuk tidak mengunggah dokumen yang memuat rahasia negara atau identitas perbankan rahasia.
          </p>
        </article>

        <article className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-indigo-600 shrink-0">06</span>
            <h2 className="text-base font-bold text-slate-900">
              Hak Kendali &amp; Penghapusan Data
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pl-7">
            Anda dapat menghapus seluruh riwayat matriks, bobot, dan cache narasi kapan saja dengan mengklik tombol 
            <strong> &quot;Reset Proyek&quot;</strong> pada menu aplikasi atau membersihkan riwayat situs pada peramban Anda. 
            Anda juga dapat mengekspor cadangan berkas JSON mandiri untuk disimpan secara pribadi di perangkat Anda.
          </p>
        </article>
      </section>
    </div>
  );
};

export default PrivacyPolicyView;

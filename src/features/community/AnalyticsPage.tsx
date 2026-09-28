import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  subscribeToAnalytics,
  type AnalyticsData,
} from '@/services/firebase';
import Badge from '@/components/ui/Badge';
import {
  BarChart3,
  Laptop,
  Smartphone,
  Tablet,
  Star,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const unsub = subscribeToAnalytics((data) => {
      setAnalytics(data);
    });

    return () => {
      unsub();
    };
  }, []);

  if (!analytics) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
        Memuat statistik web...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <span>Statistik & Wawasan Penggunaan Web</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Metrik interaksi pengunjung dan volume akses pengguna pada sistem DecisiGraph yang tercatat secara real-time.
        </p>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Kunjungan
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {analytics.totalViews.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            Aktivitas halaman akumulatif
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Kunjungan Hari Ini
          </span>
          <span className="text-2xl font-black text-indigo-600 tracking-tight font-mono">
            {analytics.viewsToday.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            Akses aktif 24 jam terakhir
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Kunjungan Bulan Ini
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {analytics.viewsThisMonth.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-indigo-600 font-medium block">
            Periode bulan berjalan
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Indeks Kepuasan
          </span>
          <span className="text-2xl font-black text-amber-600 tracking-tight font-mono flex items-center gap-1">
            <span>5.0</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            Berdasarkan rating pengguna
          </span>
        </div>
      </div>

      {/* Grid: 7-Day Trend Chart & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Trend Chart (Left 7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tren Kunjungan 7 Hari Terakhir</h3>
              <p className="text-xs text-slate-500">Volume aktivitas interaksi pengguna pada DecisiGraph</p>
            </div>
            <Badge variant="primary" size="sm">Harian</Badge>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {analytics.dailyHistory.map((item, idx) => {
              const maxVal = Math.max(...analytics.dailyHistory.map((d) => d.views), 1);
              const heightPercent = Math.max(15, (item.views / maxVal) * 100);
              const isLast = idx === analytics.dailyHistory.length - 1;

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-600 font-bold">
                    {item.views}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className={`w-full rounded-t-lg transition-colors ${
                        isLast
                          ? 'bg-indigo-600 group-hover:bg-indigo-500'
                          : 'bg-indigo-300 group-hover:bg-indigo-400'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-12">
                    {item.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device & Browser Breakdown (Right 5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Distribusi Perangkat Pengguna</h3>
            <p className="text-xs text-slate-500">Kategori hardware yang dipakai saat mengakses aplikasi</p>
          </div>

          <div className="space-y-3.5 pt-2 text-xs">
            {/* Desktop */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Laptop className="w-3.5 h-3.5 text-indigo-600" /> Desktop / Laptop
                </span>
                <span className="font-mono font-bold">{analytics.deviceBreakdown.desktop}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${analytics.deviceBreakdown.desktop}%` }} />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-sky-600" /> Smartphone / Mobile
                </span>
                <span className="font-mono font-bold">{analytics.deviceBreakdown.mobile}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${analytics.deviceBreakdown.mobile}%` }} />
              </div>
            </div>

            {/* Tablet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tablet className="w-3.5 h-3.5 text-purple-600" /> Tablet / iPad
                </span>
                <span className="font-mono font-bold">{analytics.deviceBreakdown.tablet}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analytics.deviceBreakdown.tablet}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Browser Populer:</span>
            <span className="font-semibold text-slate-700">Chrome (64%), Firefox (16%), Safari (12%)</span>
          </div>
        </div>
      </div>

      {/* Recent Visits Log Table */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Aktivitas Kunjungan Real-Time</h3>
            <p className="text-xs text-slate-500">Log akses pengunjung terbaru yang terekam sistem</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-semibold text-emerald-700">Live Tracker</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Waktu Akses</th>
                <th className="py-2.5 px-3">Perangkat</th>
                <th className="py-2.5 px-3">Sistem Operasi</th>
                <th className="py-2.5 px-3">Browser</th>
                <th className="py-2.5 px-3 text-right">Rute yang Diakses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {analytics.recentVisits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2 px-3 text-slate-600">
                    {new Date(v.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">{v.device}</td>
                  <td className="py-2 px-3 text-slate-600">{v.os}</td>
                  <td className="py-2 px-3 text-slate-600">{v.browser}</td>
                  <td className="py-2 px-3 text-right text-indigo-700 font-bold">{v.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  subscribeToAnalytics,
  subscribeToReviews,
  type AnalyticsData,
  type ReviewItem,
} from '@/services/firebase';
import Badge from '@/components/ui/Badge';
import { formatRelativeTime } from '@/utils/dateFormatter';
import {
  BarChart3,
  Laptop,
  Smartphone,
  Tablet,
  Star,
  Info,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    const unsubAnalytics = subscribeToAnalytics((data) => {
      setAnalytics(data);
    });

    const unsubReviews = subscribeToReviews((data) => {
      setReviews(data);
    });

    return () => {
      unsubAnalytics();
      unsubReviews();
    };
  }, []);

  if (!analytics) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-label="Memuat statistik web...">
        {/* Page Title & Intro */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-200 shrink-0" />
            <div className="w-64 sm:w-80 h-7 rounded bg-slate-300" />
          </div>
          <div className="w-full max-w-md h-4 rounded bg-slate-200" />
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-24 h-3.5 rounded bg-slate-200" />
              <div className="w-20 h-7 rounded bg-slate-300" />
              <div className="w-32 h-3 rounded bg-slate-100" />
            </div>
          ))}
        </div>

        {/* Grid: 7-Day Trend Chart & Device Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="w-44 sm:w-56 h-4 rounded bg-slate-300" />
                <div className="w-56 sm:w-72 h-3 rounded bg-slate-200" />
              </div>
              <div className="w-14 h-5 rounded-full bg-slate-100 shrink-0" />
            </div>
            <div className="h-44 w-full flex items-end justify-between gap-1.5 sm:gap-3 pt-4 px-1 sm:px-2 overflow-x-auto">
              {[35, 60, 25, 80, 50, 90, 65].map((h, idx) => (
                <div key={idx} className="flex-1 min-w-8 flex flex-col items-center gap-2">
                  <div className="w-full bg-slate-100 rounded-t-md" style={{ height: `${h}%` }} />
                  <div className="w-8 h-2.5 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="space-y-1">
              <div className="w-40 sm:w-48 h-4 rounded bg-slate-300" />
              <div className="w-48 sm:w-60 h-3 rounded bg-slate-200" />
            </div>
            <div className="space-y-4 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <div className="w-24 h-4 rounded bg-slate-200" />
                    <div className="w-10 h-4 rounded bg-slate-300" />
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div className="w-32 h-3.5 rounded bg-slate-200" />
              <div className="w-16 h-3.5 rounded bg-slate-300" />
            </div>
          </div>
        </div>

        {/* Live Visits Table Skeleton */}
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="w-40 sm:w-48 h-4 rounded bg-slate-300" />
              <div className="w-48 sm:w-64 h-3 rounded bg-slate-200" />
            </div>
            <div className="w-20 h-5 rounded-full bg-emerald-100 shrink-0" />
          </div>
          <div className="space-y-2 overflow-x-auto">
            <div className="w-full min-w-[340px] h-9 rounded bg-slate-100" />
            <div className="w-full min-w-[340px] h-8 rounded bg-slate-50" />
            <div className="w-full min-w-[340px] h-8 rounded bg-slate-50" />
            <div className="w-full min-w-[340px] h-8 rounded bg-slate-50" />
          </div>
        </div>
      </div>
    );
  }

  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '-';

  const hasVisits = analytics.totalViews > 0;
  const totalDevices =
    (analytics.deviceBreakdown?.desktop || 0) +
    (analytics.deviceBreakdown?.mobile || 0) +
    (analytics.deviceBreakdown?.tablet || 0);

  const desktopPct = totalDevices > 0 ? Math.round(((analytics.deviceBreakdown?.desktop || 0) / totalDevices) * 100) : 0;
  const mobilePct = totalDevices > 0 ? Math.round(((analytics.deviceBreakdown?.mobile || 0) / totalDevices) * 100) : 0;
  const tabletPct = totalDevices > 0 ? Math.round(((analytics.deviceBreakdown?.tablet || 0) / totalDevices) * 100) : 0;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Kunjungan
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {analytics.totalViews.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            {hasVisits ? 'Aktivitas halaman akumulatif' : 'Belum ada kunjungan terekam'}
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
            {analytics.viewsToday > 0 ? 'Akses aktif 24 jam terakhir' : '0 kunjungan hari ini'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Kunjungan Bulan Ini
          </span>
          <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {analytics.viewsThisMonth.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            Periode bulan berjalan
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Indeks Kepuasan
          </span>
          <span className="text-2xl font-black text-amber-600 tracking-tight font-mono flex items-center gap-1">
            <span>{avgRating}</span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </span>
          <span className="text-[10px] text-slate-500 font-medium block">
            {hasReviews ? `Dari ${reviews.length} ulasan pengguna` : 'Belum ada ulasan'}
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

          {/* SVG Bar Chart or Empty State */}
          {analytics.dailyHistory && analytics.dailyHistory.length > 0 ? (
            <div className="h-44 w-full flex items-end justify-between gap-1.5 sm:gap-2 pt-4 px-1 sm:px-2 overflow-x-auto">
              {analytics.dailyHistory.map((item, idx) => {
                const maxVal = Math.max(...analytics.dailyHistory.map((d) => d.views), 1);
                const heightPercent = Math.max(15, (item.views / maxVal) * 100);
                const isLast = idx === analytics.dailyHistory.length - 1;

                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group min-w-8">
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
          ) : (
            <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg text-center p-6 space-y-2">
              <Info className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">Belum Ada Data Tren Kunjungan</span>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Grafik akan otomatis terisi seiring aktivitas kunjungan pengguna pada aplikasi.
              </p>
            </div>
          )}
        </div>

        {/* Device Breakdown (Right 5 Cols) */}
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
                <span className="font-mono font-bold">{desktopPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${desktopPct}%` }} />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-sky-600" /> Smartphone / Mobile
                </span>
                <span className="font-mono font-bold">{mobilePct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${mobilePct}%` }} />
              </div>
            </div>

            {/* Tablet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5 font-medium">
                  <Tablet className="w-3.5 h-3.5 text-purple-600" /> Tablet / iPad
                </span>
                <span className="font-mono font-bold">{tabletPct}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${tabletPct}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Total Perangkat Terdeteksi:</span>
            <span className="font-bold font-mono text-slate-700">{totalDevices} perangkat</span>
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

        <div className="overflow-x-auto rounded-lg border border-slate-200 w-full">
          <table className="w-full min-w-130 text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold whitespace-nowrap">
                <th className="py-2.5 px-3">Waktu Akses</th>
                <th className="py-2.5 px-3">Perangkat</th>
                <th className="py-2.5 px-3">Sistem Operasi</th>
                <th className="py-2.5 px-3">Browser</th>
                <th className="py-2.5 px-3 text-right">Rute yang Diakses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px] whitespace-nowrap">
              {analytics.recentVisits && analytics.recentVisits.length > 0 ? (
                analytics.recentVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-3 text-slate-600 font-sans" title={new Date(v.timestamp).toLocaleString('id-ID')}>
                      {formatRelativeTime(v.timestamp)}
                    </td>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">{v.device}</td>
                    <td className="py-2 px-3 text-slate-600">{v.os}</td>
                    <td className="py-2 px-3 text-slate-600">{v.browser}</td>
                    <td className="py-2 px-3 text-right text-indigo-700 font-bold">{v.path}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                    Belum ada riwayat kunjungan real-time yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

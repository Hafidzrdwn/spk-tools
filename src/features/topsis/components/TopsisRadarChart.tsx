import React from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import type { RadarDataPoint } from '../useTopsisViewModel';
import { markTopsisHover } from '@/core/tour/topsisTourSteps';

export interface TopsisRadarChartProps {
  radarData: RadarDataPoint[];
  alternativeKeys: { name: string; color: string }[];
}

export const TopsisRadarChart: React.FC<TopsisRadarChartProps> = ({
  radarData,
  alternativeKeys,
}) => {
  if (radarData.length === 0 || alternativeKeys.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-control border border-slate-200">
        Data kriteria dan alternatif belum cukup untuk memplot Radar Chart.
      </div>
    );
  }

  return (
    <div className="w-full bg-white/90 rounded-card border border-slate-200/80 p-4 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Visualisasi Multi-Dimensi (Radar Profile)</h4>
          <p className="text-xs text-slate-500">
            Perbandingan profil kontur alternatif terhadap Solusi Ideal Positif (A+) dan Solusi Ideal Negatif (A-)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span
            data-tour-id="topsis-radar-point"
            onMouseEnter={() => markTopsisHover()}
            className="flex items-center gap-1.5 text-benefit cursor-pointer hover:underline"
            title="Arahkan kursor untuk memeriksa titik A+"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-benefit inline-block" />
            <span>A+ (Ideal)</span>
          </span>
          <span
            onMouseEnter={() => markTopsisHover()}
            className="flex items-center gap-1.5 text-cost cursor-pointer hover:underline"
            title="Arahkan kursor untuk memeriksa titik A-"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cost inline-block" />
            <span>A- (Anti-Ideal)</span>
          </span>
        </div>
      </div>

      <div className="w-full h-90 sm:h-100">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="criterion"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              stroke="#cbd5e1"
            />

            {/* Garis Solusi Ideal Positif A+ (Emerald) */}
            <Radar
              name="A+ (Solusi Ideal Positif)"
              dataKey="idealPositive"
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="#10B981"
              fillOpacity={0.12}
              dot={{ r: 4, onMouseEnter: () => markTopsisHover() }}
              onMouseEnter={() => markTopsisHover()}
            />

            {/* Garis Solusi Ideal Negatif A- (Rose) */}
            <Radar
              name="A- (Solusi Ideal Negatif)"
              dataKey="idealNegative"
              stroke="#F43F5E"
              strokeWidth={2}
              strokeDasharray="3 3"
              fill="#F43F5E"
              fillOpacity={0.08}
              dot={{ r: 4, onMouseEnter: () => markTopsisHover() }}
              onMouseEnter={() => markTopsisHover()}
            />

            {/* Garis Setiap Alternatif */}
            {alternativeKeys.map((alt) => (
              <Radar
                key={alt.name}
                name={alt.name}
                dataKey={alt.name}
                stroke={alt.color}
                strokeWidth={2}
                fill={alt.color}
                fillOpacity={0.18}
              />
            ))}

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                fontSize: '11px',
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: '12px',
                fontSize: '11px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopsisRadarChart;

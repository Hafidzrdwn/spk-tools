import type { ReactNode } from 'react';
import type { MethodId } from '@/types/domain';
import { Calculator, Layers, Compass, Sliders, Sparkles } from 'lucide-react';
import React from 'react';

export interface RouteTab {
  id: MethodId;
  label: string;
  icon: ReactNode;
  badge?: string;
  description: string;
}

export const ROUTES: RouteTab[] = [
  {
    id: 'SAW',
    label: 'SAW',
    icon: React.createElement(Calculator, { className: 'w-4 h-4' }),
    badge: 'Additive',
    description: 'Simple Additive Weighting — Penjumlahan Terbobot',
  },
  {
    id: 'WP',
    label: 'WP',
    icon: React.createElement(Layers, { className: 'w-4 h-4' }),
    badge: 'Product',
    description: 'Weighted Product — Perkalian Pangkat Bobot',
  },
  {
    id: 'TOPSIS',
    label: 'TOPSIS',
    icon: React.createElement(Compass, { className: 'w-4 h-4' }),
    badge: 'Geometry',
    description: 'Technique for Order Preference by Similarity to Ideal Solution',
  },
  {
    id: 'AHP',
    label: 'AHP',
    icon: React.createElement(Sliders, { className: 'w-4 h-4' }),
    badge: 'Pairwise',
    description: 'Analytic Hierarchy Process — Matriks Perbandingan Berpasangan',
  },
  {
    id: 'AUTO',
    label: 'Story to Matrix',
    icon: React.createElement(Sparkles, { className: 'w-4 h-4' }),
    badge: 'Parser',
    description: 'Konversi Bahasa Alami / Studi Kasus ke Matriks Keputusan',
  },
];

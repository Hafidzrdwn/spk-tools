import type { MethodId } from '@/types/domain';

export interface RouteTab {
  id: MethodId;
  label: string;
  badge?: string;
  description: string;
}

export const ROUTES: RouteTab[] = [
  {
    id: 'SAW',
    label: 'SAW',
    badge: 'Additive',
    description: 'Simple Additive Weighting - Penjumlahan Terbobot',
  },
  {
    id: 'WP',
    label: 'WP',
    badge: 'Product',
    description: 'Weighted Product - Perkalian Pangkat Bobot',
  },
  {
    id: 'TOPSIS',
    label: 'TOPSIS',
    badge: 'Geometry',
    description: 'Technique for Order Preference by Similarity to Ideal Solution',
  },
  {
    id: 'AHP',
    label: 'AHP',
    badge: 'Pairwise',
    description: 'Analytic Hierarchy Process - Matriks Perbandingan Berpasangan',
  },
  {
    id: 'COMPARE',
    label: 'Perbandingan',
    badge: 'Compare',
    description: 'Evaluasi Komparatif & Analisis Pergeseran Peringkat (SAW, WP, TOPSIS)',
  },
  {
    id: 'AUTO',
    label: 'Story to Matrix',
    badge: 'Parser',
    description: 'Konversi Bahasa Alami / Studi Kasus ke Matriks Keputusan',
  },
];

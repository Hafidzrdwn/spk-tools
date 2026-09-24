import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import NumericInput from '@/components/ui/NumericInput';
import Slider from '@/components/ui/Slider';
import Badge from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import Tabs, { type TabItem } from '@/components/ui/Tabs';
import GaugeMeter from '@/components/ui/GaugeMeter';
import type { MethodId } from '@/types/domain';

export default function App() {
  const [activeMethod, setActiveMethod] = useState<MethodId>('SAW');
  const [projectTitle, setProjectTitle] = useState('Pemilihan Supplier Bahan Baku 2026');
  const [numericVal, setNumericVal] = useState(85.5);
  const [sliderVal, setSliderVal] = useState(5);
  const [textInput, setTextInput] = useState('Kualitas Layanan');

  const methodTabs: TabItem<MethodId>[] = [
    { id: 'SAW', label: 'SAW', badge: 'Simple' },
    { id: 'WP', label: 'WP', badge: 'Product' },
    { id: 'TOPSIS', label: 'TOPSIS', badge: 'Geometry' },
    { id: 'AHP', label: 'AHP', badge: 'Pairwise' },
  ];

  const saatyTicks = [
    { value: 1, label: '1' },
    { value: 3, label: '3' },
    { value: 5, label: '5' },
    { value: 7, label: '7' },
    { value: 9, label: '9' },
  ];

  return (
    <AppShell
      headerProps={{
        title: projectTitle,
        activeMethod,
        onTitleChange: setProjectTitle,
        actions: (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Reset
            </Button>
            <Button variant="primary" size="sm">
              Simpan Proyek
            </Button>
          </div>
        ),
      }}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Banner Pengantar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-card bg-white/70 backdrop-blur-md border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-benefit animate-pulse" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                DecisiGraph Design System Gallery
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Koleksi komponen UI bertema <strong className="text-slate-700">Clean Fun Tech</strong> dengan token warna Tailwind CSS v4.
            </p>
          </div>
          <Tabs items={methodTabs} activeTab={activeMethod} onChange={setActiveMethod} />
        </div>

        {/* Baris 1: Buttons & Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Aksi interaktif dengan efek spring dan palet token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Button variant="primary" size="sm">Primary</Button>
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="benefit" size="sm">Benefit</Button>
                <Button variant="cost" size="sm">Cost</Button>
                <Button variant="danger" size="sm">Danger</Button>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="md" isLoading>Loading</Button>
                <Button variant="secondary" size="md" disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Badges & Tooltips */}
          <Card>
            <CardHeader>
              <CardTitle>Badges & Tooltips</CardTitle>
              <CardDescription>Penanda atribut kriteria dan keterangan mengambang</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="benefit">Benefit / Max (Emerald)</Badge>
                <Badge variant="cost">Cost / Min (Rose)</Badge>
                <Badge variant="primary">Accent Indigo</Badge>
                <Badge variant="secondary">Accent Violet</Badge>
                <Badge variant="neutral">Neutral Slate</Badge>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">Coba hover:</span>
                <Tooltip content="Kriteria bertipe Benefit akan dinormalisasi r = x / max">
                  <span className="inline-flex cursor-help">
                    <Badge variant="benefit">Hover Me (Benefit)</Badge>
                  </span>
                </Tooltip>
                <Tooltip content="Kriteria bertipe Cost akan dinormalisasi r = min / x" position="bottom">
                  <span className="inline-flex cursor-help">
                    <Badge variant="cost">Hover Me (Cost)</Badge>
                  </span>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baris 2: Input & NumericInput */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Text & Numeric Inputs</CardTitle>
              <CardDescription>Input formulir dengan font mono khusus perhitungan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nama Kriteria"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                helperText="Nama kriteria akan ditampilkan pada header tabel matriks"
              />
              <NumericInput
                label="Nilai Matriks (Font Mono)"
                value={numericVal}
                onChange={setNumericVal}
                step={0.5}
                min={0}
                max={100}
              />
            </CardContent>
          </Card>

          {/* Card Slider (Skala Saaty) */}
          <Card>
            <CardHeader>
              <CardTitle>Saaty Pairwise Slider</CardTitle>
              <CardDescription>Slider interaktif untuk bobot dan perbandingan AHP 1-9</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                label="Tingkat Kepentingan Relatif (1 - 9)"
                value={sliderVal}
                onChange={setSliderVal}
                min={1}
                max={9}
                step={1}
                valueDisplay={`Skala ${sliderVal}`}
                ticks={saatyTicks}
              />
              <div className="p-3 rounded-control bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
                <span className="font-semibold text-accent-primary">Makna Nilai {sliderVal}: </span>
                {sliderVal === 1 && 'Kedua kriteria sama penting (Equal).'}
                {sliderVal === 3 && 'Kriteria A sedikit lebih penting dibanding B (Moderate).'}
                {sliderVal === 5 && 'Kriteria A lebih penting dibanding B (Strong).'}
                {sliderVal === 7 && 'Kriteria A sangat penting dibanding B (Very Strong).'}
                {sliderVal === 9 && 'Kriteria A mutlak lebih penting dibanding B (Extreme).'}
                {[2, 4, 6, 8].includes(sliderVal) && 'Nilai kompromi di antara dua tingkatan intensitas.'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Baris 3: GaugeMeter AHP Consistency */}
        <Card>
          <CardHeader>
            <CardTitle>AHP Consistency Gauge Meter</CardTitle>
            <CardDescription>Kurva SVG arc reaktif dengan threshold warna (konsisten ≤ 0.10, inkonsisten &gt; 0.10)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
              <div className="flex flex-col items-center p-4 rounded-control bg-slate-50/70 border border-slate-200/60">
                <GaugeMeter value={0.034} threshold={0.1} label="Hasil Matriks Konsisten (CR = 0.0340)" />
                <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ Memenuhi syarat AHP (CR ≤ 0.10)</p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-control bg-slate-50/70 border border-slate-200/60">
                <GaugeMeter value={0.185} threshold={0.1} label="Hasil Matriks Inkonsisten (CR = 0.1850)" />
                <p className="text-[11px] text-rose-500 font-medium mt-1">⚠ Perlu saran koreksi perbandingan (CR &gt; 0.10)</p>
              </div>

              <div className="flex flex-col items-center p-4 rounded-control bg-slate-50/70 border border-slate-200/60">
                <GaugeMeter value={sliderVal / 20} threshold={0.1} label={`Kaitkan dengan Slider (CR = ${(sliderVal / 20).toFixed(4)})`} />
                <p className="text-[11px] text-slate-500 font-medium mt-1">Ubah slider di atas untuk menguji gauge ini</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

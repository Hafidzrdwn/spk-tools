import React from 'react';
import Card, { CardContent, CardHeader } from './Card';

export const TabSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" role="status" aria-label="Memuat modul tab...">
      {/* Top Banner / Summary Card Skeleton */}
      <Card className="border-slate-200/80 bg-white/70">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-control bg-slate-200 shrink-0" />
            <div className="space-y-2 w-full sm:w-48">
              <div className="h-3 w-28 bg-slate-200 rounded-xs" />
              <div className="h-5 w-40 bg-slate-200 rounded-xs" />
            </div>
          </div>
          <div className="w-28 h-10 bg-slate-200 rounded-control shrink-0" />
        </CardContent>
      </Card>

      {/* Stepper Navigation Skeleton */}
      <div className="flex items-center gap-2 p-2 bg-slate-100/80 rounded-card border border-slate-200/70">
        <div className="h-8 w-32 bg-slate-200 rounded-control" />
        <div className="h-8 w-36 bg-slate-200/70 rounded-control" />
        <div className="h-8 w-32 bg-slate-200/50 rounded-control" />
      </div>

      {/* Main Table Card Skeleton */}
      <Card className="border-slate-200/80 bg-white/85">
        <CardHeader className="p-5 pb-3 space-y-2">
          <div className="h-5 w-52 bg-slate-200 rounded-xs" />
          <div className="h-3.5 w-80 max-w-full bg-slate-200/70 rounded-xs" />
        </CardHeader>
        <CardContent className="p-5 pt-2">
          {/* Table Container Skeleton */}
          <div className="border border-slate-200/80 rounded-control overflow-hidden">
            {/* Table Header */}
            <div className="bg-slate-100/80 px-4 py-3 flex items-center gap-4 border-b border-slate-200/80">
              <div className="h-3.5 w-12 bg-slate-200 rounded-xs" />
              <div className="h-3.5 w-28 bg-slate-200 rounded-xs" />
              <div className="h-3.5 w-24 bg-slate-200 rounded-xs" />
              <div className="h-3.5 w-24 bg-slate-200 rounded-xs" />
              <div className="h-3.5 w-20 bg-slate-200 rounded-xs ml-auto" />
            </div>
            {/* Table Rows */}
            <div className="divide-y divide-slate-100 bg-white">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="px-4 py-3.5 flex items-center gap-4">
                  <div className="h-3 w-8 bg-slate-200/60 rounded-xs" />
                  <div className="h-3 w-32 bg-slate-200/80 rounded-xs" />
                  <div className="h-3 w-20 bg-slate-200/60 rounded-xs" />
                  <div className="h-3 w-20 bg-slate-200/60 rounded-xs" />
                  <div className="h-3 w-16 bg-slate-200/80 rounded-xs ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <span className="sr-only">Memuat konten tab...</span>
    </div>
  );
};

export default TabSkeleton;

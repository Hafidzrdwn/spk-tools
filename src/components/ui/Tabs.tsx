import React, { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  variant?: 'pill' | 'underline';
}

export function Tabs<T extends string = string>({
  items,
  activeTab,
  onChange,
  className,
  variant = 'pill',
}: TabsProps<T>) {
  if (variant === 'underline') {
    return (
      <div className={cn('flex border-b border-slate-200 gap-6 overflow-x-auto scrollbar-none', className)}>
        {items.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer',
                isActive
                  ? 'border-accent-primary text-accent-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              )}
            >
              {tab.icon && <span className="shrink-0 flex items-center">{tab.icon}</span>}
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center p-1 bg-slate-100/90 rounded-control border border-slate-200/60 gap-1 overflow-x-auto max-w-full scrollbar-none',
        className
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'h-9 px-3.5 flex items-center justify-center gap-2 text-xs font-semibold rounded-[0.55rem] transition-colors duration-150 select-none whitespace-nowrap shrink-0 cursor-pointer',
              isActive
                ? 'bg-white text-slate-900 shadow-2xs shadow-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            )}
          >
            {tab.icon && <span className="shrink-0 flex items-center">{tab.icon}</span>}
            <span className="whitespace-nowrap leading-none">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 leading-none',
                  isActive ? 'bg-indigo-50 text-accent-primary' : 'bg-slate-200/80 text-slate-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;

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
      <div className={cn('flex border-b border-slate-200 gap-6', className)}>
        {items.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 py-3 px-1 text-sm font-semibold border-b-2 transition-all duration-150',
                isActive
                  ? 'border-accent-primary text-accent-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
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
    <div className={cn('inline-flex p-1 bg-slate-100/90 rounded-control border border-slate-200/60 gap-1', className)}>
      {items.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-[0.55rem] transition-all duration-150 select-none',
              isActive
                ? 'bg-white text-slate-900 shadow-2xs shadow-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  isActive ? 'bg-indigo-50 text-accent-primary' : 'bg-slate-200 text-slate-600'
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

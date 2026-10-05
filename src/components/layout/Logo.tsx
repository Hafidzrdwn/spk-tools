import React from 'react';
import { cn } from '@/utils/cn';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: {
    mark: 'w-6 h-6',
    text: 'text-sm',
    gap: 'gap-2',
  },
  md: {
    mark: 'w-8 h-8',
    text: 'text-base',
    gap: 'gap-2.5',
  },
  lg: {
    mark: 'w-10 h-10',
    text: 'text-xl',
    gap: 'gap-3',
  },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showWordmark = true,
  className,
}) => {
  const cfg = sizeConfig[size];

  return (
    <div
      className={cn('flex items-center shrink-0', cfg.gap, className)}
      role="img"
      aria-label="DecisiGraph"
    >
      {/* Decision Graph Mark with robust gradient container */}
      <div
        className={cn(
          cfg.mark,
          'shrink-0 rounded-control shadow-xs overflow-hidden flex items-center justify-center p-0.5 select-none'
        )}
        style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)' }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Graph Edges / Decision Tree Branches */}
          <path
            d="M16 8.5L8.5 23.5M16 8.5L23.5 23.5M8.5 23.5H23.5"
            stroke="rgba(255, 255, 255, 0.65)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* 3 Graph Nodes (Decision Hub & Alternatives) */}
          <circle cx="16" cy="8.5" r="3.5" fill="#FFFFFF" />
          <circle cx="8.5" cy="23.5" r="3" fill="#FFFFFF" />
          <circle cx="23.5" cy="23.5" r="3" fill="#FFFFFF" />
          {/* Inner Node Accents */}
          <circle cx="16" cy="8.5" r="1.5" fill="#4F46E5" />
          <circle cx="8.5" cy="23.5" r="1.2" fill="#4F46E5" />
          <circle cx="23.5" cy="23.5" r="1.2" fill="#4F46E5" />
        </svg>
      </div>

      {/* Wordmark Text */}
      {showWordmark && (
        <span className={cn('font-bold tracking-tight select-none', cfg.text)}>
          <span className="text-slate-900">Decisi</span>
          <span className="bg-linear-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            Graph
          </span>
        </span>
      )}
    </div>
  );
};

export default Logo;

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
    <div className={cn('flex items-center shrink-0', cfg.gap, className)}>
      {/* Inline SVG Decision Graph Mark */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(cfg.mark, 'shrink-0 rounded-control shadow-xs overflow-hidden')}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="decisi-logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="decisi-logo-node" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#EDE9FE" />
          </linearGradient>
        </defs>
        {/* Background squircle with primary-secondary gradient */}
        <rect width="32" height="32" rx="7" fill="url(#decisi-logo-bg)" />
        {/* Graph Edges / Decision Tree Branches */}
        <path
          d="M16 8.5L8.5 23.5M16 8.5L23.5 23.5M8.5 23.5H23.5"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 3 Graph Nodes (Decision Hub & Alternatives) */}
        <circle cx="16" cy="8.5" r="3.5" fill="url(#decisi-logo-node)" />
        <circle cx="8.5" cy="23.5" r="3" fill="url(#decisi-logo-node)" />
        <circle cx="23.5" cy="23.5" r="3" fill="url(#decisi-logo-node)" />
        {/* Inner Node Accents */}
        <circle cx="16" cy="8.5" r="1.5" fill="#4F46E5" />
        <circle cx="8.5" cy="23.5" r="1.2" fill="#4F46E5" />
        <circle cx="23.5" cy="23.5" r="1.2" fill="#4F46E5" />
      </svg>

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

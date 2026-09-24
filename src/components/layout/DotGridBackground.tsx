import React, { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface DotGridBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const DotGridBackground: React.FC<DotGridBackgroundProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative min-h-screen w-full bg-surface bg-dot-grid text-slate-800 antialiased',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default DotGridBackground;

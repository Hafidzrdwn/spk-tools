import React from 'react';
import { cn } from '@/utils/cn';

export interface GaugeMeterProps {
  value: number; // 0 to 1
  threshold?: number; // e.g. 0.10 for AHP CR
  label?: string;
  size?: number; // default 140
  strokeWidth?: number;
  className?: string;
}

// Helper kalkulasi koordinat busur SVG
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  value,
  threshold = 0.1,
  label = 'Consistency Ratio',
  size = 140,
  strokeWidth = 12,
  className,
}) => {
  const clampedValue = Math.min(1, Math.max(0, value));
  const isOptimal = clampedValue <= threshold;

  // Sudut busur setengah lingkaran (0° sampai 180°)
  const startAngle = 0;
  const maxAngle = 180;
  const currentAngle = startAngle + clampedValue * (maxAngle - startAngle);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const bgPath = describeArc(center, center, radius, 0, 180);
  const fillPath = describeArc(center, center, radius, 0, currentAngle);

  const statusColor = isOptimal ? 'text-benefit stroke-benefit' : 'text-cost stroke-cost';
  const statusBgColor = isOptimal ? 'stroke-emerald-100' : 'stroke-rose-100';

  return (
    <div className={cn('flex flex-col items-center justify-center p-3 text-center select-none', className)}>
      <div className="relative" style={{ width: size, height: size / 2 + 16 }}>
        <svg width={size} height={size / 2 + strokeWidth} className="overflow-visible">
          {/* Background Arc */}
          <path
            d={bgPath}
            fill="none"
            className={statusBgColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Fill Arc */}
          {clampedValue > 0 && (
            <path
              d={fillPath}
              fill="none"
              className={cn('transition-all duration-500 ease-out', statusColor)}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Nilai di tengah */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="font-mono text-xl font-bold tracking-tight text-slate-800">
            {value.toFixed(4)}
          </span>
          <span className={cn('text-[11px] font-semibold uppercase tracking-wider', isOptimal ? 'text-benefit' : 'text-cost')}>
            {isOptimal ? 'Konsisten' : 'Inkonsisten'}
          </span>
        </div>
      </div>

      {label && <span className="mt-2 text-xs font-medium text-slate-500">{label}</span>}
    </div>
  );
};

export default GaugeMeter;

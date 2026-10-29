import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  readOnly?: boolean;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: 'Perlu Banyak Peningkatan',
  2: 'Cukup, Masih Ada Kendala',
  3: 'Bagus & Berfungsi Baik',
  4: 'Sangat Puas & Membantu',
  5: 'Luar Biasa & Sangat Presisi',
};

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  size = 'md',
  showLabel = true,
  className,
  readOnly = false,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const activeRating = hovered !== null ? hovered : value;
  const currentText = RATING_DESCRIPTIONS[activeRating] || RATING_DESCRIPTIONS[5];

  const starSizeClass =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className="flex items-center gap-1.5"
        role="radiogroup"
        aria-label="Rating Bintang 1 sampai 5"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          const isSelected = star === value;

          return (
            <motion.button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange(star)}
              onMouseEnter={() => !readOnly && setHovered(star)}
              onMouseLeave={() => !readOnly && setHovered(null)}
              whileHover={!readOnly ? { scale: 1.12 } : {}}
              whileTap={!readOnly ? { scale: 0.95 } : {}}
              className={cn(
                'relative min-h-11 min-w-11 flex items-center justify-center p-1 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                readOnly ? 'cursor-default' : 'cursor-pointer'
              )}
              title={`${star} Bintang - ${RATING_DESCRIPTIONS[star]}`}
              aria-label={`${star} Bintang`}
              aria-checked={isSelected}
              role="radio"
            >
              <Star
                className={cn(
                  starSizeClass,
                  'transition-colors duration-150',
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-slate-300 hover:text-amber-300'
                )}
              />
            </motion.button>
          );
        })}
      </div>

      {showLabel && activeRating > 0 && (
        <div className="text-xs font-medium text-slate-500">
          <span className="font-semibold text-slate-700">{activeRating} dari 5</span>
          <span className="mx-1.5 text-slate-300">&bull;</span>
          <span>{currentText}</span>
        </div>
      )}
    </div>
  );
};

export default StarRatingInput;

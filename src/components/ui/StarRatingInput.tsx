import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StarRatingInputProps {
  value: number; // 1 to 5
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  readOnly?: boolean;
}

const RATING_LABELS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: 'Perlu Banyak Peningkatan', emoji: '😕', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  2: { text: 'Cukup, Masih Ada Kendala', emoji: '😐', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  3: { text: 'Bagus & Berfungsi Baik', emoji: '🙂', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  4: { text: 'Sangat Puas & Membantu', emoji: '😊', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  5: { text: 'Luar Biasa & Sangat Presisi!', emoji: '🤩', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
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
  const currentMeta = RATING_LABELS[activeRating] || RATING_LABELS[5];

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
              whileHover={!readOnly ? { scale: 1.22, rotate: [0, -5, 5, 0] } : {}}
              whileTap={!readOnly ? { scale: 0.9 } : {}}
              className={cn(
                'relative min-h-11 min-w-11 flex items-center justify-center p-1 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                readOnly ? 'cursor-default' : 'cursor-pointer'
              )}
              title={`${star} Bintang - ${RATING_LABELS[star].text}`}
              aria-label={`${star} Bintang`}
              aria-checked={isSelected}
              role="radio"
            >
              {/* Star Icon */}
              <Star
                className={cn(
                  starSizeClass,
                  'transition-all duration-200',
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                    : 'text-slate-300 hover:text-amber-200'
                )}
              />

              {/* Sparkle micro-animation saat rating 5 dipilih */}
              <AnimatePresence>
                {isSelected && star === 5 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 text-amber-500 pointer-events-none"
                  >
                    <Sparkles className="w-3 h-3 animate-spin duration-1000" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Label Sentimen Dinamis */}
      {showLabel && activeRating > 0 && (
        <motion.div
          key={activeRating}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs transition-all',
            currentMeta.color
          )}
        >
          <span>{currentMeta.emoji}</span>
          <span>{currentMeta.text}</span>
        </motion.div>
      )}
    </div>
  );
};

export default StarRatingInput;

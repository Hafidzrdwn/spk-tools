import React from 'react';

export interface DocumentDropzoneIllustrationProps {
  className?: string;
  size?: number;
}

export const DocumentDropzoneIllustration: React.FC<DocumentDropzoneIllustrationProps> = ({
  className = 'w-16 h-16',
  size = 64,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dropBaseGrad" x1="16" y1="16" x2="64" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EEF2FF" />
          <stop offset="1" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="dropAccentGrad" x1="28" y1="20" x2="56" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
        <filter id="dropShadow" x="14" y="16" width="52" height="52" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#312E81" floodOpacity="0.08" />
        </filter>
      </defs>

      <circle cx="40" cy="40" r="34" fill="url(#dropBaseGrad)" fillOpacity="0.6" stroke="#C7D2FE" strokeWidth="1" strokeDasharray="3 3" />

      <g filter="url(#dropShadow)">
        <rect x="22" y="20" width="36" height="42" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <path d="M46 20L58 32H50C47.7909 32 46 30.2091 46 28V20Z" fill="#EEF2FF" stroke="#CBD5E1" strokeWidth="1.5" />

        <rect x="27" y="37" width="16" height="2.5" rx="1.25" fill="#6366F1" />
        <rect x="27" y="43" width="22" height="2" rx="1" fill="#94A3B8" />
        <rect x="27" y="48" width="18" height="2" rx="1" fill="#94A3B8" />
        <rect x="27" y="53" width="20" height="2" rx="1" fill="#CBD5E1" />
      </g>

      <circle cx="53" cy="53" r="13" fill="url(#dropAccentGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
      <path
        d="M53 47V59M53 47L49 51M53 47L57 51"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DocumentDropzoneIllustration;

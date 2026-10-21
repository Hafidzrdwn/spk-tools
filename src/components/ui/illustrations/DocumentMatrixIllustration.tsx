import React from 'react';

export interface DocumentMatrixIllustrationProps {
  className?: string;
  size?: number;
}

export const DocumentMatrixIllustration: React.FC<DocumentMatrixIllustrationProps> = ({
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
        <linearGradient id="docGrad" x1="12" y1="8" x2="52" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="28" y1="24" x2="68" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="benefitGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="costGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F43F5E" />
          <stop offset="1" stopColor="#E11D48" />
        </linearGradient>
        <filter id="shadowFilter" x="22" y="20" width="52" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1E1B4B" floodOpacity="0.12" />
        </filter>
      </defs>

      <rect x="14" y="10" width="40" height="52" rx="6" fill="url(#docGrad)" fillOpacity="0.95" />
      <path d="M42 10L54 22H46C43.7909 22 42 20.2091 42 18V10Z" fill="#818CF8" />

      <rect x="20" y="26" width="16" height="3" rx="1.5" fill="#E0E7FF" fillOpacity="0.8" />
      <rect x="20" y="33" width="22" height="2.5" rx="1.25" fill="#C7D2FE" fillOpacity="0.6" />
      <rect x="20" y="39" width="18" height="2.5" rx="1.25" fill="#C7D2FE" fillOpacity="0.6" />
      <rect x="20" y="45" width="20" height="2.5" rx="1.25" fill="#C7D2FE" fillOpacity="0.6" />

      <g filter="url(#shadowFilter)">
        <rect x="28" y="24" width="42" height="46" rx="8" fill="url(#cardGrad)" stroke="#CBD5E1" strokeWidth="1.5" />

        <rect x="33" y="30" width="32" height="7" rx="3" fill="#EEF2FF" />
        <rect x="36" y="32.5" width="8" height="2" rx="1" fill="#6366F1" />
        <circle cx="50" cy="33.5" r="1.5" fill="url(#costGrad)" />
        <circle cx="59" cy="33.5" r="1.5" fill="url(#benefitGrad)" />

        <line x1="33" y1="41" x2="65" y2="41" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
        <rect x="36" y="44" width="10" height="2" rx="1" fill="#94A3B8" />
        <rect x="49" y="44" width="6" height="2" rx="1" fill="#64748B" />
        <rect x="58" y="44" width="6" height="2" rx="1" fill="#64748B" />

        <line x1="33" y1="49.5" x2="65" y2="49.5" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
        <rect x="36" y="52.5" width="11" height="2" rx="1" fill="#94A3B8" />
        <rect x="49" y="52.5" width="6" height="2" rx="1" fill="#64748B" />
        <rect x="58" y="52.5" width="6" height="2" rx="1" fill="#64748B" />

        <line x1="33" y1="58" x2="65" y2="58" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
        <rect x="36" y="61" width="9" height="2" rx="1" fill="#94A3B8" />
        <rect x="49" y="61" width="6" height="2" rx="1" fill="#64748B" />
        <rect x="58" y="61" width="6" height="2" rx="1" fill="#64748B" />
      </g>

      <path
        d="M26 54C22 54 18 50 18 44C18 38 22 34 26 34"
        stroke="#A5B4FC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
      <circle cx="26" cy="54" r="2" fill="#6366F1" />
    </svg>
  );
};

export default DocumentMatrixIllustration;

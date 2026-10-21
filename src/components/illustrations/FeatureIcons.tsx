import React from 'react';

export interface IllustrationIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const TraceabilitySvgIcon: React.FC<IllustrationIconProps> = ({
  size = 40,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    {...props}
  >
    <defs>
      <linearGradient id="traceGrad1" x1="4" y1="8" x2="44" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="traceCell" x1="12" y1="12" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#EEF2FF" />
        <stop offset="100%" stopColor="#C7D2FE" />
      </linearGradient>
      <filter id="traceGlow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Background Grid Plate */}
    <rect x="6" y="6" width="36" height="36" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
    <path d="M6 18H42M6 30H42M18 6V42M30 6V42" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />

    {/* Highlighted Matrix Cell */}
    <rect x="19" y="19" width="10" height="10" rx="3" fill="url(#traceCell)" stroke="#818CF8" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="2" fill="#4F46E5" />

    {/* Precision Lens */}
    <circle cx="27" cy="21" r="9" stroke="url(#traceGrad1)" strokeWidth="2.5" fill="#FFFFFF" fillOpacity="0.4" />
    <path d="M34 28L41 35" stroke="url(#traceGrad1)" strokeWidth="3" strokeLinecap="round" />
    {/* Mathematical Sigma inside lens */}
    <path d="M25 18H29L26 21L29 24H25" stroke="#4338CA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const RankShiftSvgIcon: React.FC<IllustrationIconProps> = ({
  size = 40,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    {...props}
  >
    <defs>
      <linearGradient id="shiftPillar1" x1="10" y1="20" x2="18" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#3730A3" />
      </linearGradient>
      <linearGradient id="shiftPillar2" x1="20" y1="12" x2="28" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="shiftPillar3" x1="30" y1="26" x2="38" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    {/* Base Platform */}
    <ellipse cx="24" cy="40" rx="18" ry="4" fill="#F1F5F9" />

    {/* Comparative 3D Pillars */}
    <rect x="10" y="22" width="7" height="17" rx="2" fill="url(#shiftPillar1)" />
    <rect x="20.5" y="14" width="7" height="25" rx="2" fill="url(#shiftPillar2)" />
    <rect x="31" y="27" width="7" height="12" rx="2" fill="url(#shiftPillar3)" />

    {/* Delta Dynamics Trajectory Arrow */}
    <path
      d="M13 18C16 10 28 8 35 15"
      stroke="#059669"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="2 2"
    />
    <path
      d="M32 14L36 15L35 19"
      stroke="#059669"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(0 5)"
    />
    {/* Star Indicator on Top Pillar */}
    <circle cx="24" cy="15" r="3" fill="#F59E0B" />
  </svg>
);

export const StoryMatrixSvgIcon: React.FC<IllustrationIconProps> = ({
  size = 40,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    {...props}
  >
    <defs>
      <linearGradient id="storyCube" x1="26" y1="14" x2="42" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#6D28D9" />
      </linearGradient>
    </defs>
    {/* Unfolding Narrative Page */}
    <path
      d="M8 10C8 8.89543 8.89543 8 10 8H26L32 14V38C32 39.1046 31.1046 40 30 40H10C8.89543 40 8 39.1046 8 38V10Z"
      fill="#F8FAFC"
      stroke="#CBD5E1"
      strokeWidth="1.5"
    />
    {/* Fold corner */}
    <path d="M26 8V14H32" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
    {/* Text Lines */}
    <line x1="12" y1="16" x2="22" y2="16" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="21" x2="20" y2="21" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="26" x2="18" y2="26" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

    {/* Transformation Beam into Structured Matrix Voxels */}
    <path d="M24 24L32 20M24 29L32 30" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="1.5 1.5" />

    {/* Floating Matrix Voxel Cubes */}
    <rect x="32" y="14" width="9" height="9" rx="2" fill="url(#storyCube)" stroke="#C4B5FD" strokeWidth="1" />
    <rect x="32" y="26" width="9" height="9" rx="2" fill="url(#storyCube)" stroke="#C4B5FD" strokeWidth="1" />
  </svg>
);

export const FormalReportSvgIcon: React.FC<IllustrationIconProps> = ({
  size = 40,
  className = '',
  ...props
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    {...props}
  >
    <defs>
      <linearGradient id="reportGrad" x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
    </defs>
    {/* Shadow Sheet */}
    <rect x="14" y="10" width="26" height="32" rx="3" fill="#E2E8F0" />
    {/* Main Formal Sheet */}
    <rect x="10" y="6" width="26" height="32" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />

    {/* Document Header Bar */}
    <rect x="14" y="10" width="14" height="2.5" rx="1" fill="#4F46E5" />
    <rect x="14" y="15" width="18" height="1.5" rx="0.75" fill="#94A3B8" />

    {/* Analytical Mini Chart */}
    <rect x="14" y="26" width="3" height="6" rx="0.5" fill="#CBD5E1" />
    <rect x="19" y="23" width="3" height="9" rx="0.5" fill="#818CF8" />
    <rect x="24" y="20" width="3" height="12" rx="0.5" fill="#4F46E5" />

    {/* Official Seal / Medallion */}
    <circle cx="33" cy="34" r="5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
    <circle cx="33" cy="34" r="3" fill="#FEF3C7" />
    <path d="M31 34V37M33 33L35 35" stroke="#D97706" strokeWidth="1" strokeLinecap="round" transform="translate(2 3)" />
  </svg>
);

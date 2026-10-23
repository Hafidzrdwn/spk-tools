import React from 'react';

export interface PageIllustrationProps {
  className?: string;
}

export const PrivacyBoxMascot: React.FC<PageIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-xs mx-auto select-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 280 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <linearGradient id="pvmCubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="pvmCubeFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>
          <linearGradient id="pvmCubeSide" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
          <radialGradient id="pvmShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="140" cy="205" rx="75" ry="14" fill="url(#pvmShadow)" />

        <g transform="translate(70, 45)">
          <path d="M70 15 L135 48 L70 82 L5 48 Z" fill="url(#pvmCubeTop)" />
          <path d="M5 48 L70 82 L70 145 L5 112 Z" fill="url(#pvmCubeFront)" />
          <path d="M70 82 L135 48 L135 112 L70 145 Z" fill="url(#pvmCubeSide)" />

          <g transform="translate(18, 62)">
            <ellipse cx="16" cy="18" rx="3.5" ry="5" fill="#FFFFFF" />
            <ellipse cx="36" cy="18" rx="3.5" ry="5" fill="#FFFFFF" />
            <circle cx="17" cy="17" r="2" fill="#1E1B4B" />
            <circle cx="37" cy="17" r="2" fill="#1E1B4B" />
            <ellipse cx="10" cy="24" rx="4" ry="2" fill="#F472B6" opacity="0.6" />
            <ellipse cx="42" cy="24" rx="4" ry="2" fill="#F472B6" opacity="0.6" />
            <path d="M22 25 Q26 29 30 25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>

          <g transform="translate(36, 102)">
            <rect x="0" y="8" width="20" height="16" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <path d="M4 8 V4 C4 1.5 6 0 10 0 C14 0 16 1.5 16 4 V8" stroke="#F8FAFC" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="10" cy="15" r="2" fill="#4F46E5" />
            <path d="M10 17 V20" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          <path d="M75 18 L100 8" stroke="#EEF2FF" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <circle cx="104" cy="7" r="2.5" fill="#EEF2FF" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
};

export const TermsBoxMascot: React.FC<PageIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-xs mx-auto select-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 280 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <linearGradient id="tbmCubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="tbmCubeFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="tbmCubeSide" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id="tbmShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="140" cy="205" rx="75" ry="14" fill="url(#tbmShadow)" />

        <g transform="translate(70, 45)">
          <path d="M70 15 L135 48 L70 82 L5 48 Z" fill="url(#tbmCubeTop)" />
          <path d="M5 48 L70 82 L70 145 L5 112 Z" fill="url(#tbmCubeFront)" />
          <path d="M70 82 L135 48 L135 112 L70 145 Z" fill="url(#tbmCubeSide)" />

          <g transform="translate(18, 62)">
            <ellipse cx="16" cy="18" rx="3.5" ry="5" fill="#FFFFFF" />
            <ellipse cx="36" cy="18" rx="3.5" ry="5" fill="#FFFFFF" />
            <circle cx="16" cy="18" r="2" fill="#0F172A" />
            <circle cx="36" cy="18" r="2" fill="#0F172A" />
            <ellipse cx="10" cy="24" rx="4" ry="2" fill="#94A3B8" opacity="0.5" />
            <ellipse cx="42" cy="24" rx="4" ry="2" fill="#94A3B8" opacity="0.5" />
            <path d="M23 25 Q26 27 29 25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>

          <g transform="translate(45, 0)">
            <line x1="25" y1="20" x2="25" y2="40" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="20" x2="50" y2="20" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="3" cy="28" rx="8" ry="3" fill="#64748B" />
            <ellipse cx="47" cy="28" rx="8" ry="3" fill="#64748B" />
            <line x1="0" y1="20" x2="3" y2="28" stroke="#94A3B8" strokeWidth="1" />
            <line x1="50" y1="20" x2="47" y2="28" stroke="#94A3B8" strokeWidth="1" />
          </g>

          <g transform="translate(32, 102)">
            <rect x="0" y="0" width="22" height="18" rx="3" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="4" y1="5" x2="18" y2="5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4" y1="9" x2="15" y2="9" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16" cy="13" r="2.5" fill="#4F46E5" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export const ReleasesBoxMascot: React.FC<PageIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-xs mx-auto select-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 280 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <linearGradient id="rbmCubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="rbmCubeFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3730A3" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>
          <linearGradient id="rbmCubeSide" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <radialGradient id="rbmShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="140" cy="205" rx="75" ry="14" fill="url(#rbmShadow)" />

        <g transform="translate(70, 45)">
          <path d="M70 15 L135 48 L70 82 L5 48 Z" fill="url(#rbmCubeTop)" />
          <path d="M5 48 L70 82 L70 145 L5 112 Z" fill="url(#rbmCubeFront)" />
          <path d="M70 82 L135 48 L135 112 L70 145 Z" fill="url(#rbmCubeSide)" />

          <g transform="translate(18, 62)">
            <ellipse cx="16" cy="18" rx="4" ry="5" fill="#FFFFFF" />
            <ellipse cx="36" cy="18" rx="4" ry="5" fill="#FFFFFF" />
            <circle cx="17" cy="16" r="2.2" fill="#0F172A" />
            <circle cx="37" cy="16" r="2.2" fill="#0F172A" />
            <circle cx="15.5" cy="15" r="0.8" fill="#FFFFFF" />
            <circle cx="35.5" cy="15" r="0.8" fill="#FFFFFF" />
            <ellipse cx="9" cy="23" rx="4" ry="2" fill="#F472B6" opacity="0.6" />
            <ellipse cx="43" cy="23" rx="4" ry="2" fill="#F472B6" opacity="0.6" />
            <path d="M22 24 Q26 29 30 24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>

          <g transform="translate(115, 60)">
            <rect x="0" y="0" width="16" height="30" rx="6" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1.5" />
            <polygon points="8,35 3,46 13,46" fill="#F59E0B" opacity="0.8" />
          </g>

          <g transform="translate(24, 102)">
            <rect x="0" y="0" width="38" height="16" rx="8" fill="#1E1B4B" stroke="#6366F1" strokeWidth="1.5" />
            <text x="19" y="11" fill="#EEF2FF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">
              v1.1.0
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

export const AuthorBoxMascot: React.FC<PageIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-xs mx-auto select-none flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 280 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <defs>
          <linearGradient id="abmCubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="abmCubeFront" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E40AF" />
          </linearGradient>
          <linearGradient id="abmCubeSide" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <radialGradient id="abmShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="140" cy="205" rx="75" ry="14" fill="url(#abmShadow)" />

        <g transform="translate(70, 45)">
          <path d="M70 15 L135 48 L70 82 L5 48 Z" fill="url(#abmCubeTop)" />
          <path d="M5 48 L70 82 L70 145 L5 112 Z" fill="url(#abmCubeFront)" />
          <path d="M70 82 L135 48 L135 112 L70 145 Z" fill="url(#abmCubeSide)" />

          <g transform="translate(18, 56)">
            <rect x="6" y="10" width="16" height="13" rx="4" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
            <rect x="30" y="10" width="16" height="13" rx="4" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
            <line x1="22" y1="16" x2="30" y2="16" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="14" cy="16.5" r="2.5" fill="#FFFFFF" />
            <circle cx="38" cy="16.5" r="2.5" fill="#FFFFFF" />
            <ellipse cx="4" cy="24" rx="4" ry="2" fill="#F472B6" opacity="0.6" />
            <ellipse cx="48" cy="24" rx="4" ry="2" fill="#F472B6" opacity="0.6" />
            <path d="M22 28 Q26 33 30 28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>

          <g transform="translate(24, 106)">
            <rect x="0" y="8" width="38" height="18" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
            <rect x="4" y="2" width="30" height="7" rx="1.5" fill="#38BDF8" opacity="0.8" />
          </g>

          <g transform="translate(100, 75)">
            <rect x="0" y="4" width="10" height="12" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <ellipse cx="5" cy="4" rx="5" ry="2" fill="#94A3B8" />
          </g>
        </g>
      </svg>
    </div>
  );
};

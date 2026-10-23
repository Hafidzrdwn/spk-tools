import React from 'react';

export interface PageIllustrationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PrivacySecurityIllustration: React.FC<PageIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-md mx-auto select-none ${className}`}>
      <svg
        viewBox="0 0 520 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-lg"
      >
        <defs>
          <linearGradient id="secShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="secVaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="secGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="secCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Ground Isometric Plane */}
        <path
          d="M260 290 L460 210 L260 145 L60 210 Z"
          fill="#EEF2FF"
          stroke="#E0E7FF"
          strokeWidth="2"
        />

        {/* Local Device Vault Box (Isometric 2.5D) */}
        <g transform="translate(140, 160)">
          {/* Top Face */}
          <path d="M70 0 L140 35 L70 70 L0 35 Z" fill="#4338CA" />
          {/* Left Face */}
          <path d="M0 35 L70 70 L70 120 L0 85 Z" fill="#312E81" />
          {/* Right Face */}
          <path d="M70 70 L140 35 L140 85 L70 120 Z" fill="#3730A3" />
          {/* Vault Dial / Lock */}
          <circle cx="70" cy="92" r="14" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2" />
          <circle cx="70" cy="92" r="6" fill="#F59E0B" />
          <rect x="68" y="80" width="4" height="6" rx="2" fill="#818CF8" />
        </g>

        {/* Guardian Cyber Shield Floating */}
        <g transform="translate(230, 70)" filter="url(#softGlow)">
          <path
            d="M50 0 C75 0 95 12 100 35 C100 80 50 115 50 115 C50 115 0 80 0 35 C5 12 25 0 50 0 Z"
            fill="url(#secShieldGrad)"
            stroke="#A5B4FC"
            strokeWidth="3"
          />
          {/* Keyhole icon on shield */}
          <path
            d="M50 35 A8 8 0 0 1 58 43 C58 46.5 55.5 49.5 52 50.5 L53 65 L47 65 L48 50.5 C44.5 49.5 42 46.5 42 43 A8 8 0 0 1 50 35 Z"
            fill="#FFFFFF"
          />
          <circle cx="50" cy="43" r="3" fill="#4F46E5" />
        </g>

        {/* Friendly Auditor Character (Isometric 2.5D Style) */}
        <g transform="translate(70, 95)">
          {/* Body/Coat */}
          <path d="M45 75 L70 75 L80 135 L35 135 Z" fill="#1E293B" />
          {/* Tie */}
          <path d="M57 78 L61 95 L57 105 L53 95 Z" fill="#4F46E5" />
          {/* Head & Hair */}
          <circle cx="57" cy="50" r="17" fill="#FDE68A" />
          <path d="M40 45 C40 30 74 30 74 45 C70 38 48 38 40 45 Z" fill="#334155" />
          {/* Glasses */}
          <rect x="47" y="47" width="9" height="6" rx="2" stroke="#0F172A" strokeWidth="1.5" fill="none" />
          <rect x="58" y="47" width="9" height="6" rx="2" stroke="#0F172A" strokeWidth="1.5" fill="none" />
          <line x1="56" y1="50" x2="58" y2="50" stroke="#0F172A" strokeWidth="1.5" />
          {/* Smiling mouth */}
          <path d="M53 58 Q57 62 61 58" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          {/* Holding Security Tablet */}
          <rect x="25" y="90" width="30" height="20" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" transform="rotate(-15 25 90)" />
          <line x1="28" y1="96" x2="42" y2="92" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="102" x2="45" y2="98" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Floating Cloud Speech Bubble */}
        <g transform="translate(195, 20)">
          {/* Bubble Background with Tail */}
          <path
            d="M15 0 H235 C243 0 250 7 250 15 V65 C250 73 243 80 235 80 H60 L40 96 L45 80 H15 C7 80 0 73 0 65 V15 C0 7 7 0 15 0 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            filter="drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08))"
          />
          {/* Header Title in Bubble */}
          <text x="20" y="24" fill="#4338CA" fontSize="12" fontWeight="700" fontFamily="sans-serif">
            🛡️ Privasi Anda Prioritas Mutlak
          </text>
          {/* Dialogue Text in Bubble */}
          <text x="20" y="44" fill="#334155" fontSize="10.5" fontWeight="500" fontFamily="sans-serif">
            Kalkulasi & matriks keputusan Anda disimpan
          </text>
          <text x="20" y="59" fill="#334155" fontSize="10.5" fontWeight="500" fontFamily="sans-serif">
            lokal di browser. Bebas pelacakan invasif!
          </text>
        </g>

        {/* Floating Verified Trust Badges */}
        <g transform="translate(390, 160)">
          <circle cx="25" cy="25" r="22" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="2" />
          <path d="M16 25 L22 31 L34 19" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="55" y="22" fill="#065F46" fontSize="10" fontWeight="700" fontFamily="sans-serif">
            Local-First Engine
          </text>
          <text x="55" y="34" fill="#64748B" fontSize="9" fontFamily="sans-serif">
            100% Kendali di Tangan Anda
          </text>
        </g>
      </svg>
    </div>
  );
};

export const TermsLegalIllustration: React.FC<PageIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-md mx-auto select-none ${className}`}>
      <svg
        viewBox="0 0 520 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-lg"
      >
        <defs>
          <linearGradient id="termDocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="termScaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
        </defs>

        {/* Isometric Base Grid */}
        <path
          d="M260 290 L460 210 L260 145 L60 210 Z"
          fill="#F8FAFC"
          stroke="#E2E8F0"
          strokeWidth="2"
        />

        {/* Large Verified Decision Contract (Isometric 2.5D) */}
        <g transform="translate(190, 80)">
          {/* Paper sheet */}
          <path
            d="M0 45 L110 0 L180 35 L70 80 Z"
            fill="url(#termDocGrad)"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
          {/* Document thickness */}
          <path d="M0 45 L70 80 L70 95 L0 60 Z" fill="#E2E8F0" />
          <path d="M70 80 L180 35 L180 50 L70 95 Z" fill="#CBD5E1" />

          {/* Lines of text on document */}
          <line x1="45" y1="36" x2="120" y2="7" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="55" y1="46" x2="140" y2="16" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="65" y1="56" x2="135" y2="30" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Wax / Verified Seal */}
          <circle cx="130" cy="55" r="16" fill="#4F46E5" />
          <path d="M124 55 L128 59 L137 50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Scales of Justice & Multi-Criteria Decision (Isometric Pillar) */}
        <g transform="translate(340, 130)">
          {/* Central Pillar */}
          <rect x="28" y="20" width="8" height="90" rx="3" fill="#334155" />
          <ellipse cx="32" cy="110" rx="24" ry="10" fill="#1E293B" />
          {/* Horizontal Beam */}
          <line x1="-15" y1="25" x2="79" y2="25" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          {/* Left Pan (Criteria Weights) */}
          <line x1="-15" y1="25" x2="-25" y2="60" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="-15" y1="25" x2="-5" y2="60" stroke="#94A3B8" strokeWidth="1.5" />
          <ellipse cx="-15" cy="62" rx="18" ry="6" fill="#6366F1" />
          {/* Right Pan (Alternatives Score) */}
          <line x1="79" y1="25" x2="69" y2="55" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="79" y1="25" x2="89" y2="55" stroke="#94A3B8" strokeWidth="1.5" />
          <ellipse cx="79" cy="57" rx="18" ry="6" fill="#10B981" />
        </g>

        {/* Friendly Character Pointing to Fair Terms */}
        <g transform="translate(60, 100)">
          {/* Body */}
          <path d="M45 70 L75 70 L85 140 L35 140 Z" fill="#3B82F6" />
          {/* Head & Hair */}
          <circle cx="60" cy="45" r="18" fill="#FED7AA" />
          <path d="M42 40 C42 24 78 24 78 40 C72 32 48 32 42 40 Z" fill="#1E293B" />
          {/* Friendly expression */}
          <circle cx="55" cy="45" r="2" fill="#1E293B" />
          <circle cx="67" cy="45" r="2" fill="#1E293B" />
          <path d="M57 52 Q61 56 65 52" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Arm pointing forward */}
          <path d="M72 80 L115 65" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
          <circle cx="117" cy="64" r="5" fill="#FED7AA" />
        </g>

        {/* Cloud Speech Bubble */}
        <g transform="translate(190, 15)">
          <path
            d="M15 0 H245 C253 0 260 7 260 15 V65 C260 73 253 80 245 80 H65 L45 96 L50 80 H15 C7 80 0 73 0 65 V15 C0 7 7 0 15 0 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            filter="drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08))"
          />
          <text x="20" y="24" fill="#1E40AF" fontSize="12" fontWeight="700" fontFamily="sans-serif">
            ⚖️ Instrumen Objektif Pendukung Keputusan
          </text>
          <text x="20" y="44" fill="#334155" fontSize="10.5" fontWeight="500" fontFamily="sans-serif">
            Hasil perhitungan matematis adalah alat bantu analisis.
          </text>
          <text x="20" y="59" fill="#334155" fontSize="10.5" fontWeight="500" fontFamily="sans-serif">
            Keputusan strategis final tetap berada di tangan Anda!
          </text>
        </g>
      </svg>
    </div>
  );
};

export const ChangelogTimelineIllustration: React.FC<PageIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-md mx-auto select-none ${className}`}>
      <svg
        viewBox="0 0 520 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-lg"
      >
        <defs>
          <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="v11ActiveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Roadmap Path */}
        <path
          d="M60 220 C140 220 160 170 240 170 C320 170 340 110 440 100"
          stroke="#CBD5E1"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="10 6"
        />

        {/* Node v1.0 (Completed) */}
        <g transform="translate(60, 220)">
          <circle cx="0" cy="0" r="16" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="3" />
          <path d="M-6 0 L-2 4 L6 -4" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="-18" y="32" fill="#475569" fontSize="11" fontWeight="700" fontFamily="sans-serif">
            v1.0 MVP
          </text>
        </g>

        {/* Node v1.1 (Current Active Milestone) */}
        <g transform="translate(240, 170)">
          {/* Glowing pulse ring */}
          <circle cx="0" cy="0" r="24" fill="#D1FAE5" opacity="0.6" />
          <circle cx="0" cy="0" r="18" fill="url(#v11ActiveGrad)" stroke="#FFFFFF" strokeWidth="3" />
          <text x="0" y="4" fill="#FFFFFF" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            1.1
          </text>
          <rect x="-35" y="26" width="70" height="20" rx="10" fill="#065F46" />
          <text x="0" y="39" fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            Rilis Saat Ini
          </text>
        </g>

        {/* Node v2.0 (Planned) */}
        <g transform="translate(440, 100)">
          <circle cx="0" cy="0" r="18" fill="#EEF2FF" stroke="#818CF8" strokeWidth="3" strokeDasharray="4 3" />
          <text x="0" y="4" fill="#4F46E5" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            v2.0
          </text>
          <text x="0" y="32" fill="#6366F1" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
            Cloud SPK
          </text>
        </g>

        {/* Rocket Launching Progress */}
        <g transform="translate(260, 85) rotate(-25)">
          <path d="M25 0 C25 0 50 15 50 35 L40 45 L10 45 L0 35 C0 15 25 0 25 0 Z" fill="url(#rocketGrad)" />
          <circle cx="25" cy="22" r="6" fill="#FFFFFF" />
          {/* Flame */}
          <path d="M15 45 Q25 65 35 45" fill="#F59E0B" />
        </g>

        {/* Cloud Speech Bubble */}
        <g transform="translate(140, 10)">
          <path
            d="M15 0 H250 C258 0 265 6 265 14 V55 C265 63 258 70 250 70 H45 L25 84 L30 70 H15 C7 70 0 63 0 55 V14 C0 6 7 0 15 0 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            filter="drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08))"
          />
          <text x="18" y="24" fill="#059669" fontSize="11.5" fontWeight="700" fontFamily="sans-serif">
            🚀 Evolusi Berkelanjutan DecisiGraph
          </text>
          <text x="18" y="42" fill="#334155" fontSize="10" fontWeight="500" fontFamily="sans-serif">
            Setiap rilis membawa peningkatan presisi, efisiensi,
          </text>
          <text x="18" y="56" fill="#334155" fontSize="10" fontWeight="500" fontFamily="sans-serif">
            dan kecerdasan AI berbasis masukan nyata pengguna.
          </text>
        </g>
      </svg>
    </div>
  );
};

export const AuthorAvatarIllustration: React.FC<PageIllustrationProps> = ({
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-sm mx-auto select-none ${className}`}>
      <svg
        viewBox="0 0 460 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        <defs>
          <linearGradient id="devShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="devDeskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
          <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>

        {/* Ambient Isometric Workstation Platform */}
        <path
          d="M230 320 L410 240 L230 180 L50 240 Z"
          fill="#EEF2FF"
          stroke="#C7D2FE"
          strokeWidth="2"
        />

        {/* Isometric Desk */}
        <g transform="translate(120, 200)">
          {/* Desktop Top */}
          <path d="M110 0 L220 50 L110 100 L0 50 Z" fill="url(#devDeskGrad)" stroke="#CBD5E1" strokeWidth="2" />
          {/* Desk Side */}
          <path d="M0 50 L110 100 L110 115 L0 65 Z" fill="#E2E8F0" />
          <path d="M110 100 L220 50 L220 65 L110 115 Z" fill="#CBD5E1" />

          {/* Coffee Mug */}
          <ellipse cx="180" cy="55" rx="7" ry="4" fill="#3B82F6" />
          <rect x="173" y="47" width="14" height="8" fill="#60A5FA" />
          <ellipse cx="180" cy="47" rx="7" ry="4" fill="#93C5FD" />
        </g>

        {/* Laptop Displaying SPK Charts */}
        <g transform="translate(200, 170)">
          {/* Base */}
          <path d="M0 35 L40 50 L80 35 L40 20 Z" fill="#64748B" />
          {/* Screen */}
          <path d="M0 35 L40 20 L40 -25 L0 -10 Z" fill="url(#laptopGrad)" stroke="#475569" strokeWidth="1.5" />
          {/* Screen Content: Bar chart in green/indigo */}
          <rect x="8" y="2" width="4" height="15" fill="#10B981" transform="skewY(-20)" />
          <rect x="15" y="8" width="4" height="18" fill="#6366F1" transform="skewY(-20)" />
          <rect x="22" y="14" width="4" height="10" fill="#F59E0B" transform="skewY(-20)" />
        </g>

        {/* Hafidz Ridwan 2.5D Avatar Character */}
        <g transform="translate(130, 80)">
          {/* Body / Polo Shirt */}
          <path d="M50 85 L95 85 L110 170 L35 170 Z" fill="url(#devShirtGrad)" />
          {/* Collar */}
          <path d="M60 85 L72 105 L84 85 Z" fill="#1E3A8A" />

          {/* Lanyard Badge with "HAFIDZ | CREATOR" */}
          <path d="M68 85 L65 130 L79 130 L76 85" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
          <rect x="58" y="130" width="28" height="20" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
          <rect x="62" y="133" width="20" height="4" rx="1" fill="#3B82F6" />
          <circle cx="72" cy="142" r="3" fill="#64748B" />

          {/* Head & Hair */}
          <circle cx="72" cy="50" r="23" fill="#FED7AA" />
          {/* Modern Neat Haircut */}
          <path
            d="M49 45 C48 20 95 18 95 45 C90 30 55 30 49 45 Z"
            fill="#1E293B"
          />
          {/* Side hair */}
          <path d="M49 45 L49 55 L53 50 Z" fill="#1E293B" />

          {/* Glasses */}
          <rect x="56" y="46" width="12" height="9" rx="3" stroke="#0F172A" strokeWidth="2" fill="none" />
          <rect x="73" y="46" width="12" height="9" rx="3" stroke="#0F172A" strokeWidth="2" fill="none" />
          <line x1="68" y1="50" x2="73" y2="50" stroke="#0F172A" strokeWidth="2" />

          {/* Eyes & Friendly Smile */}
          <circle cx="62" cy="50" r="2" fill="#0F172A" />
          <circle cx="79" cy="50" r="2" fill="#0F172A" />
          <path d="M66 61 Q72 67 78 61" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Arms typing on laptop */}
          <path d="M40 110 L85 140" stroke="#2563EB" strokeWidth="10" strokeLinecap="round" />
          <circle cx="87" cy="141" r="6" fill="#FED7AA" />
        </g>

        {/* Friendly Floating Speech Bubble */}
        <g transform="translate(170, 15)">
          <path
            d="M15 0 H260 C268 0 275 7 275 15 V70 C275 78 268 85 260 85 H60 L35 102 L45 85 H15 C7 85 0 78 0 70 V15 C0 7 7 0 15 0 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            filter="drop-shadow(0 4px 12px rgba(15, 23, 42, 0.08))"
          />
          <text x="18" y="24" fill="#2563EB" fontSize="12" fontWeight="700" fontFamily="sans-serif">
            👋 Halo, Saya Hafidz Ridwan!
          </text>
          <text x="18" y="44" fill="#334155" fontSize="10.5" fontWeight="500" fontFamily="sans-serif">
            Pengembang di balik DecisiGraph. Ada studi kasus
          </text>
          <text x="18" y="59" fill="#334155" fontSize="10.5" fontWeight="500" fontFamily="sans-serif">
            SPK atau saran fitur? Jangan ragu chat langsung!
          </text>
        </g>
      </svg>
    </div>
  );
};

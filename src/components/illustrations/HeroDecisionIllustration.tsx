import React from "react";

export interface HeroIllustrationProps {
  className?: string;
  activeMethod?: "SAW" | "WP" | "TOPSIS" | "AHP";
}

export const HeroDecisionIllustration: React.FC<HeroIllustrationProps> = ({
  className = "",
  activeMethod = "SAW",
}) => {
  const isSaw = activeMethod === "SAW";
  const isWp = activeMethod === "WP";
  const isTopsis = activeMethod === "TOPSIS";
  const isAhp = activeMethod === "AHP";

  return (
    <div
      className={`relative w-full aspect-16/11 sm:aspect-16/10 flex items-center justify-center select-none overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 540 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain filter drop-shadow-xl"
      >
        <defs>
          {/* Ambient Lighting Gradients */}
          <radialGradient id="heroGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#4F46E5" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="planeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#EEF2FF" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient
            id="charSuit"
            x1="0"
            y1="0"
            x2="100"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>

          <linearGradient id="cubeFaceTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <linearGradient id="cubeFaceLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>
          <linearGradient id="cubeFaceRight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>

          <linearGradient id="accentEmerald" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="accentAmber" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <filter id="shadowPlate" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="12"
              stdDeviation="16"
              floodColor="#1E1B4B"
              floodOpacity="0.08"
            />
          </filter>
        </defs>

        {/* Backdrop Ambient Glow */}
        <circle cx="270" cy="190" r="170" fill="url(#heroGlow)" />

        {/* =========================================================================
            ISOMETRIC FLOORING GRID
        ========================================================================== */}
        <g opacity="0.6">
          <path
            d="M70 240L270 340L470 240L270 140Z"
            fill="url(#planeGrad)"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            filter="url(#shadowPlate)"
          />
          {/* Internal Grid Lines */}
          <path
            d="M120 215L320 315M170 190L370 290M220 165L420 265"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <path
            d="M220 315L420 215M170 290L370 190M120 265L320 165"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
        </g>

        {/* =========================================================================
            3D PILLARS / MATRIX RANKING PODIUMS (ISOMETRIC)
        ========================================================================== */}
        {/* Pillar 3 - Rank 3 (Left-Back) */}
        <g transform="translate(190, 160)">
          {/* Top Face */}
          <path
            d="M0 0L24 -12L48 0L24 12Z"
            fill="#E2E8F0"
            stroke="#CBD5E1"
            strokeWidth="0.8"
          />
          {/* Left Face */}
          <path d="M0 0L24 12V36L0 24Z" fill="#CBD5E1" />
          {/* Right Face */}
          <path d="M24 12L48 0V24L24 36Z" fill="#94A3B8" />
          <text
            x="24"
            y="3"
            textAnchor="middle"
            fontSize="8"
            fontFamily="Courier"
            fontWeight="bold"
            fill="#64748B"
          >
            #3
          </text>
        </g>

        {/* Pillar 2 - Rank 2 (Right) */}
        <g transform="translate(310, 190)">
          {/* Top Face */}
          <path
            d="M0 0L28 -14L56 0L28 14Z"
            fill="#C7D2FE"
            stroke="#A5B4FC"
            strokeWidth="0.8"
          />
          {/* Left Face */}
          <path d="M0 0L28 14V60L0 46Z" fill="#818CF8" />
          {/* Right Face */}
          <path d="M28 14L56 0V46L28 60Z" fill="#6366F1" />
          <text
            x="28"
            y="4"
            textAnchor="middle"
            fontSize="9"
            fontFamily="Courier"
            fontWeight="bold"
            fill="#312E81"
          >
            #2
          </text>
        </g>

        {/* Pillar 1 - Rank 1 (Center High) */}
        <g transform="translate(242, 125)">
          {/* Top Face */}
          <path
            d="M0 0L34 -17L68 0L34 17Z"
            fill="#A7F3D0"
            stroke="#6EE7B7"
            strokeWidth="1"
          />
          {/* Left Face */}
          <path d="M0 0L34 17V105L0 88Z" fill="url(#accentEmerald)" />
          {/* Right Face */}
          <path d="M34 17L68 0V88L34 105Z" fill="#047857" />

          {/* Trophy Badge floating above Pillar 1 */}
          <g transform="translate(34, -28)">
            <circle
              cx="0"
              cy="0"
              r="13"
              fill="#FFFFFF"
              stroke="#10B981"
              strokeWidth="2"
            />
            <path
              d="M-6 -4H6V1C6 4.3 3.3 7 0 7C-3.3 7 -6 4.3 -6 1V-4Z"
              fill="#F59E0B"
            />
            <path d="M-2 7H2V10H-2Z" fill="#D97706" />
            <path d="M-4 10H4V12H-4Z" fill="#B45309" />
            <circle cx="0" cy="0" r="2.5" fill="#FEF3C7" />
          </g>
          <text
            x="34"
            y="9"
            textAnchor="middle"
            fontSize="11"
            fontFamily="Courier"
            fontWeight="bold"
            fill="#065F46"
          >
            #1
          </text>
        </g>

        {/* =========================================================================
            FLOATING HOLOGRAPHIC MCDM CUBES & PLANES
        ========================================================================== */}
        {/* Cube A: SAW Linear Weights (Upper Left) */}
        <g transform="translate(80, 110)">
          <path
            d="M0 0L20 -10L40 0L20 10Z"
            fill="url(#cubeFaceTop)"
            stroke="#C7D2FE"
            strokeWidth="0.8"
          />
          <path d="M0 0L20 10V32L0 22Z" fill="url(#cubeFaceLeft)" />
          <path d="M20 10L40 0V22L20 32Z" fill="url(#cubeFaceRight)" />
          {/* Sigma Symbol on Top */}
          <text
            x="20"
            y="3"
            textAnchor="middle"
            fontSize="11"
            fontFamily="Courier"
            fontWeight="bold"
            fill="#FFFFFF"
          >
            ∑
          </text>
          <rect
            x="-8"
            y="38"
            width="56"
            height="15"
            rx="3"
            fill="#EEF2FF"
            stroke="#C7D2FE"
            strokeWidth="0.8"
          />
          <text
            x="20"
            y="49"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="bold"
            fill="#4338CA"
          >
            SAW Aditif
          </text>
        </g>

        {/* Cube B: WP Exponential (Upper Right) */}
        <g transform="translate(420, 95)">
          <path
            d="M0 0L20 -10L40 0L20 10Z"
            fill="#DDD6FE"
            stroke="#C4B5FD"
            strokeWidth="0.8"
          />
          <path d="M0 0L20 10V30L0 20Z" fill="#8B5CF6" />
          <path d="M20 10L40 0V20L20 30Z" fill="#7C3AED" />
          {/* Product Symbol */}
          <text
            x="20"
            y="3"
            textAnchor="middle"
            fontSize="10"
            fontFamily="Courier"
            fontWeight="bold"
            fill="#4C1D95"
          >
            ∏
          </text>
          <rect
            x="-6"
            y="36"
            width="52"
            height="15"
            rx="3"
            fill="#F5F3FF"
            stroke="#DDD6FE"
            strokeWidth="0.8"
          />
          <text
            x="20"
            y="47"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="bold"
            fill="#6D28D9"
          >
            WP Vektor S
          </text>
        </g>

        {/* Holographic Arc / Curve linking SAW to Rank #1 */}
        <path
          d="M120 130 C 160 110, 200 115, 242 125"
          stroke="#818CF8"
          strokeWidth="1.8"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />

        {/* Holographic Arc linking WP to Rank #1 */}
        <path
          d="M420 115 C 370 100, 320 110, 276 120"
          stroke="#A78BFA"
          strokeWidth="1.8"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />

        {/* =========================================================================
            2D/3D STYLIZED DECISION SCIENTIST CHARACTER (RIGHT FOREGROUND)
        ========================================================================== */}
        <g transform="translate(385, 175)">
          {/* Character Shadow */}
          <ellipse
            cx="45"
            cy="140"
            rx="26"
            ry="7"
            fill="#CBD5E1"
            opacity="0.6"
          />

          {/* Lower Body & Legs */}
          <path d="M34 95L30 138H41L45 100L49 138H60L56 95Z" fill="#1E293B" />
          {/* Shoes */}
          <rect x="25" y="136" width="16" height="6" rx="3" fill="#0F172A" />
          <rect x="49" y="136" width="16" height="6" rx="3" fill="#0F172A" />

          {/* Torso / Modern Minimalist Suit */}
          <path
            d="M26 44C26 40 32 36 45 36C58 36 64 40 64 44L61 96H29L26 44Z"
            fill="url(#charSuit)"
          />
          {/* Shirt Collar & Inner Lapel */}
          <path d="M38 36L45 52L52 36Z" fill="#FFFFFF" />
          <path d="M44 48L45 80L46 48Z" fill="#818CF8" />

          {/* Head & Face */}
          <ellipse cx="45" cy="25" rx="12" ry="13" fill="#FCD34D" />

          {/* Modern Sleek Glasses */}
          <rect
            x="34"
            y="22"
            width="10"
            height="5"
            rx="1.5"
            fill="#4F46E5"
            stroke="#FFFFFF"
            strokeWidth="0.8"
          />
          <rect
            x="46"
            y="22"
            width="10"
            height="5"
            rx="1.5"
            fill="#4F46E5"
            stroke="#FFFFFF"
            strokeWidth="0.8"
          />
          <line
            x1="44"
            y1="24.5"
            x2="46"
            y2="24.5"
            stroke="#FFFFFF"
            strokeWidth="1"
          />

          {/* Hair (Clean Modern crop) */}
          <path d="M33.2 29 C32 25 33 20 37 17 C40 15 44 16 46 19 C49 15 54 17 56 21 C58 24 57 27 56.5 29 L51 27 C50 23 47 22 44 24 C40 23 37 26 33.2 29Z" fill="#0F172A" transform="translate(0 -8)"/><path d="M46 19 Q44 23 46 26" stroke="#334155" strokeWidth="1" fill="none" strokeLinecap="round" transform="translate(-3 -6)"/>

          {/* Left Arm gesturing towards holographic Matrix */}
          <path
            d="M26 44L7 62L-8 56"
            stroke="#1E1B4B"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Hand with glowing touch particle */}
          <circle cx="-10" cy="55" r="4.5" fill="#FCD34D" />
          <circle
            cx="-10"
            cy="55"
            r="7"
            stroke="#6366F1"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />

          {/* Right Arm resting cleanly */}
          <path
            d="M63 44L70 70L65 85"
            stroke="#1E1B4B"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="65" cy="87" r="4" fill="#FCD34D" />
        </g>

        {/* =========================================================================
            HOLOGRAPHIC FLOATING DATA METRICS (LEFT FOREGROUND)
        ========================================================================== */}
        <g transform="translate(100, 220)">
          {/* Glass Card Plate */}
          <rect
            x="0"
            y="0"
            width="135"
            height="65"
            rx="8"
            fill="#FFFFFF"
            fillOpacity="0.92"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            filter="url(#shadowPlate)"
          />
          {/* Header Bar */}
          <rect x="10" y="10" width="55" height="6" rx="2" fill="#4F46E5" />
          <rect x="10" y="21" width="115" height="1" fill="#E2E8F0" />

          {/* Score comparison metrics */}
          <text x="10" y="34" fontSize="8" fontWeight="bold" fill="#0F172A">
            {activeMethod}
          </text>
          <text
            x="125"
            y="34"
            textAnchor="end"
            fontSize="9"
            fontFamily="Courier"
            fontWeight="bold"
            fill="#059669"
          >
            {isSaw
              ? "V1 = 0.882"
              : isWp
                ? "V1 = 0.285"
                : isTopsis
                  ? "C1* = 0.892"
                  : "CR = 0.038"}
          </text>

          <text x="10" y="47" fontSize="7.5" fill="#64748B">
            {isAhp ? "Uji Saaty" : "Evaluasi"}
          </text>
          <text
            x="125"
            y="47"
            textAnchor="end"
            fontSize="8.5"
            fontFamily="Courier"
            fontWeight="bold"
            fill="#4F46E5"
          >
            {isAhp
              ? "0.038 < 0.1"
              : isTopsis
                ? "Solusi Ideal"
                : isWp
                  ? "Vektor S"
                  : "Aditif Linear"}
          </text>

          {/* Micro Mini Progress indicator */}
          <rect x="10" y="54" width="115" height="3" rx="1.5" fill="#F1F5F9" />
          <rect x="10" y="54" width="85" height="3" rx="1.5" fill="#10B981" />
        </g>

        {/* Ambient floating math sparkles */}
        <text
          x="210"
          y="80"
          fontSize="11"
          fontFamily="Courier"
          fill="#818CF8"
          opacity="0.7"
          fontWeight="bold"
        >
          λ_max
        </text>
        <text
          x="350"
          y="70"
          fontSize="12"
          fontFamily="Courier"
          fill="#34D399"
          opacity="0.7"
          fontWeight="bold"
        >
          D_i⁺
        </text>
        <circle cx="160" cy="90" r="2.5" fill="#818CF8" opacity="0.8" />
        <circle cx="390" cy="85" r="2" fill="#34D399" opacity="0.8" />
      </svg>
    </div>
  );
};

export default HeroDecisionIllustration;

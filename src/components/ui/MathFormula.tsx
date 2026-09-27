import React, { useMemo } from 'react';
import katex from 'katex';
import { cn } from '@/utils/cn';

export interface MathFormulaProps {
  /** LaTeX formula string, e.g. "r_{ij} = \\frac{x_{ij}}{\\max(x_j)}" */
  math: string;
  /** Whether to render as inline math or block/display math */
  inline?: boolean;
  /** Extra CSS classes */
  className?: string;
  /** Accessible text for screen readers */
  ariaLabel?: string;
}

/**
 * Reusable Mathematical Notation Component powered by KaTeX.
 * - Supports inline math (vertically aligned with surrounding text)
 * - Supports block / display math with responsive anti-overflow horizontal scrollbar
 * - Safe XSS rendering with throwOnError: false
 * - Semantic accessibility role="math" and aria-label
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  math,
  inline = false,
  className,
  ariaLabel,
}) => {
  const html = useMemo(() => {
    if (!math || !math.trim()) return '';
    try {
      return katex.renderToString(math, {
        displayMode: !inline,
        throwOnError: false,
        strict: false,
        output: 'html', // Pure HTML rendering avoids browser MathML validation errors (<msub/>) while role="math" + aria-label preserve full accessibility
      });
    } catch {
      return math;
    }
  }, [math, inline]);

  if (!html) return null;

  if (inline) {
    return (
      <span
        role="math"
        aria-label={ariaLabel || math}
        className={cn('inline-block align-baseline font-normal text-current', className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      role="math"
      aria-label={ariaLabel || math}
      className={cn(
        'w-full max-w-full overflow-x-auto overflow-y-hidden py-1.5 px-2 my-1 text-center scrollbar-thin rounded-lg text-slate-800',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathFormula;

/**
 * Converts dynamic formula labels from calculation engines (e.g. "x11/max(X) = 80/90 = 0.8889")
 * into clean, beautifully formatted LaTeX expressions for KaTeX rendering.
 */
export function formatTraceToLatex(rawLabel: string): string {
  if (!rawLabel || !rawLabel.trim()) return '';

  let cleaned = rawLabel.trim();

  // If already full LaTeX, return as-is
  if (cleaned.startsWith('\\') || (cleaned.includes('\\frac') && cleaned.includes('{'))) {
    return cleaned;
  }

  // Handle prefix like "Cost ⟹ " or "Benefit ⟹ " or "BENEFIT ⟹ "
  let prefix = '';
  if (cleaned.includes('⟹')) {
    const parts = cleaned.split('⟹');
    prefix = `\\text{${parts[0].trim()}} \\implies `;
    cleaned = parts.slice(1).join('⟹').trim();
  }

  // Handle SAW Normalization: "x12 = min(X)/x12 = 20/50 = 0.4"
  // or "x11 = x11/max(X) = 80/90 = 0.8889"
  cleaned = cleaned
    .replace(/x(\d+)(\d+)\s*=\s*x(\d+)(\d+)\/max\(X\)\s*=\s*(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)\s*=\s*([0-9.]+)/g,
      'r_{$1$2} = \\frac{x_{$1$2}}{\\max(X)} = \\frac{$5}{$6} = $7')
    .replace(/x(\d+)(\d+)\s*=\s*min\(X\)\/x(\d+)(\d+)\s*=\s*(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)\s*=\s*([0-9.]+)/g,
      'r_{$1$2} = \\frac{\\min(X)}{x_{$1$2}} = \\frac{$5}{$6} = $7');

  // Handle SAW Weighting: "v11 = w1 * r11 = 0.3 * 0.8889 = 0.2667"
  cleaned = cleaned.replace(/v(\d+)(\d+)\s*=\s*w(\d+)\s*\*\s*r(\d+)(\d+)\s*=\s*([0-9.]+)\s*\*\s*([0-9.]+)\s*=\s*([0-9.]+)/g,
    'v_{$1$2} = w_{$3} \\times r_{$4$5} = $6 \\times $7 = $8');

  // Handle SAW Final: "V1 = Σ(w_j * r_1j) = 0.2667 + 0.2423 + 0.075 + 0.2833 = 0.8673"
  cleaned = cleaned.replace(/V(\d+)\s*=\s*[Σ∑]\(w_j\s*\*\s*r_(\d+)j\)\s*=\s*([0-9.+ ]+)\s*=\s*([0-9.]+)/g,
    'V_{$1} = \\sum_{j=1}^{n} (w_j \\times r_{$2j}) = $3 = $4');

  // Handle WP Weighting: "x11^(w1*) = 80^(+0.3) = 3.7144"
  cleaned = cleaned.replace(/x(\d+)(\d+)\^\(w(\d+)\*\)\s*=\s*([0-9.]+)\^\(([+-]?[0-9.]+)\)\s*=\s*([0-9.]+)/g,
    'x_{$1$2}^{w_{$3}^*} = $4^{$5} = $6');

  // Handle WP Vector S: "S1 = Π(x_1j ^ w_j*) = 3.7144 * 3.1221 * 0.9013 * 3.7821 = 39.7218"
  cleaned = cleaned.replace(/S(\d+)\s*=\s*[Π∏]\(x_(\d+)j\s*\^\s*w_j\*\)\s*=\s*([0-9.* ]+)\s*=\s*([0-9.]+)/g,
    (_match, p1, p2, p3, p4) => {
      const formattedTerms = p3.split('*').map((s: string) => s.trim()).join(' \\times ');
      return `S_{${p1}} = \\prod_{j=1}^{n} (x_{${p2}j}^{w_j^*}) = ${formattedTerms} = ${p4}`;
    });

  // Handle WP Vector V: "V1 = S1 / Σ(S) = 39.7218 / 158.1264 = 0.2512"
  cleaned = cleaned.replace(/V(\d+)\s*=\s*S(\d+)\s*\/\s*[Σ∑]\(S\)\s*=\s*([0-9.]+)\s*\/\s*([0-9.]+)\s*=\s*([0-9.]+)/g,
    'V_{$1} = \\frac{S_{$2}}{\\sum S} = \\frac{$3}{$4} = $5');

  // Handle TOPSIS Normalization: "r11 = x11 / √(Σ x_i1²) = 80 / √(27350) = 0.4837"
  cleaned = cleaned.replace(/r(\d+)(\d+)\s*=\s*x(\d+)(\d+)\s*\/\s*√\([Σ∑]\s*x_i(\d+)²\)\s*=\s*([0-9.]+)\s*\/\s*√\(([0-9.]+)\)\s*=\s*([0-9.]+)/g,
    'r_{$1$2} = \\frac{x_{$1$2}}{\\sqrt{\\sum x_{i$5}^2}} = \\frac{$6}{\\sqrt{$7}} = $8');

  // Handle TOPSIS Weighting: "y11 = w1 * r11 = 0.3 * 0.4837 = 0.1451"
  cleaned = cleaned.replace(/y(\d+)(\d+)\s*=\s*w(\d+)\s*\*\s*r(\d+)(\d+)\s*=\s*([0-9.]+)\s*\*\s*([0-9.]+)\s*=\s*([0-9.]+)/g,
    'y_{$1$2} = w_{$3} \\times r_{$4$5} = $6 \\times $7 = $8');

  // Handle TOPSIS Distance+: "D+_1 = √(Σ(y_1j - A+j)²) = √(0.0012) = 0.0342"
  cleaned = cleaned.replace(/D\+_(\d+)\s*=\s*√\([Σ∑]\(y_(\d+)j\s*-\s*A\+j\)²\)\s*=\s*√\(([0-9.]+)\)\s*=\s*([0-9.]+)/g,
    'D_{$1}^+ = \\sqrt{\\sum (y_{$2j} - A_j^+)^2} = \\sqrt{$3} = $4');

  // Handle TOPSIS Distance-: "D-_1 = √(Σ(y_1j - A-j)²) = √(0.0032) = 0.0566"
  cleaned = cleaned.replace(/D-_(\d+)\s*=\s*√\([Σ∑]\(y_(\d+)j\s*-\s*A-j\)²\)\s*=\s*√\(([0-9.]+)\)\s*=\s*([0-9.]+)/g,
    'D_{$1}^- = \\sqrt{\\sum (y_{$2j} - A_j^-)^2} = \\sqrt{$3} = $4');

  // Handle TOPSIS Relative Closeness: "C_1 = D-_1 / (D+_1 + D-_1) = 0.0566 / (0.0342 + 0.0566) = 0.6232"
  cleaned = cleaned.replace(/C_(\d+)\s*=\s*D-_(\d+)\s*\/\s*\(D\+_(\d+)\s*\+\s*D-_(\d+)\)\s*=\s*([0-9.]+)\s*\/\s*\(([0-9.]+)\s*\+\s*([0-9.]+)\)\s*=\s*([0-9.]+)/g,
    'C_{$1} = \\frac{D_{$2}^-}{D_{$3}^+ + D_{$4}^-} = \\frac{$5}{$6 + $7} = $8');

  // Handle AHP Normalization: "normA11 = a11 / Σ_col1 = 1 / 2.3333 = 0.4286"
  cleaned = cleaned.replace(/normA(\d+)(\d+)\s*=\s*a(\d+)(\d+)\s*\/\s*[Σ∑]_col(\d+)\s*=\s*([0-9.]+)\s*\/\s*([0-9.]+)\s*=\s*([0-9.]+)/g,
    '\\bar{a}_{$1$2} = \\frac{a_{$1$2}}{\\sum_{i} a_{i$5}} = \\frac{$6}{$7} = $8');

  // Handle AHP Priority: "w1 = Σ_row1 / n = 1.25 / 3 = 0.4167"
  cleaned = cleaned.replace(/w(\d+)\s*=\s*[Σ∑]_row(\d+)\s*\/\s*n\s*=\s*([0-9.]+)\s*\/\s*([0-9]+)\s*=\s*([0-9.]+)/g,
    'w_{$1} = \\frac{\\sum_{j} \\bar{a}_{$2j}}{n} = \\frac{$3}{$4} = $5');

  // General fallback replacements for remaining symbols
  cleaned = cleaned
    .replace(/\*/g, ' \\times ')
    .replace(/[Σ∑]/g, '\\sum ')
    .replace(/[Π∏]/g, '\\prod ')
    .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/√([0-9a-zA-Z_]+)/g, '\\sqrt{$1}')
    .replace(/<=|≤/g, ' \\le ')
    .replace(/>=|≥/g, ' \\ge ')
    .replace(/!=|≠/g, ' \\ne ')
    .replace(/λmax|lambdaMax/gi, '\\lambda_{\\max}')
    .replace(/\bCI\b/g, '\\text{CI}')
    .replace(/\bCR\b/g, '\\text{CR}')
    .replace(/\bRI\b/g, '\\text{RI}');

  return `${prefix}${cleaned}`;
}

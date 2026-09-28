import React from 'react';
import { Github } from 'lucide-react';
import { cn } from '@/utils/cn';
import DecimalFormatToggle from './DecimalFormatToggle';
import Badge from '@/components/ui/Badge';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-3.5 px-6 mt-auto',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-1.5 font-medium">
            <span>&copy; {currentYear} DecisiGraph</span>
            <span className="text-slate-300">&bull;</span>
            <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5 font-bold">
              v1.1
            </Badge>
            <span className="text-slate-300">&bull;</span>
            <span>Dibuat oleh Hafidz Ridwan</span>
          </p>
        </div>

        {/* Global Decimal Format Preference Status Bar Widget */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Format Desimal:</span>
          <DecimalFormatToggle />
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/hafidzrdwn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-accent-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 rounded px-1.5 py-0.5"
            aria-label="GitHub Hafidz Ridwan"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

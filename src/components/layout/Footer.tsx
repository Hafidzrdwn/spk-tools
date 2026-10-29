import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import DecimalFormatToggle from './DecimalFormatToggle';
import Badge from '@/components/ui/Badge';
import { prefetchRoute } from '@/services/routePrefetch';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'w-full px-4 sm:px-6 py-4 sm:py-3.5 border-t border-slate-200/90 bg-white/95 text-xs text-slate-500 mt-auto',
        className
      )}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-medium">
          <span className="text-slate-700 font-semibold">&copy; {currentYear} DecisiGraph</span>
          <Link to="/releases" onMouseEnter={prefetchRoute.releases} className="hover:opacity-85">
            <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5 font-bold cursor-pointer">
              v1.1
            </Badge>
          </Link>
          <span className="text-slate-300 hidden sm:inline">&bull;</span>
          <span className="text-slate-500">Platform Evaluasi SPK &amp; Decision Intelligence</span>
        </div>

        <nav aria-label="Footer Nav" className="flex flex-wrap items-center justify-center gap-3 font-medium text-slate-600">
          <Link to="/about" onMouseEnter={prefetchRoute.about} className="hover:text-indigo-600 transition-colors">
            Tentang &amp; Bantuan
          </Link>
          <span className="text-slate-200">&bull;</span>
          <Link to="/releases" onMouseEnter={prefetchRoute.releases} className="hover:text-indigo-600 transition-colors">
            Catatan Rilis
          </Link>
          <span className="text-slate-200">&bull;</span>
          <Link to="/privacy" onMouseEnter={prefetchRoute.privacy} className="hover:text-indigo-600 transition-colors">
            Privasi
          </Link>
          <span className="text-slate-200">&bull;</span>
          <Link to="/terms" onMouseEnter={prefetchRoute.terms} className="hover:text-indigo-600 transition-colors">
            Ketentuan
          </Link>
        </nav>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <span className="text-slate-500 font-medium">Format Desimal:</span>
          <DecimalFormatToggle />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

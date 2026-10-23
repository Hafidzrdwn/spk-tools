import React from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
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
        'w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-3.5 px-6 mt-auto',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <p className="flex items-center gap-1.5 font-medium">
            <span>&copy; {currentYear} DecisiGraph</span>
            <span className="text-slate-300">&bull;</span>
            <Link to="/releases" onMouseEnter={prefetchRoute.releases} className="hover:opacity-85">
              <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5 font-bold cursor-pointer">
                v1.1
              </Badge>
            </Link>
          </p>

          <span className="text-slate-300 hidden sm:inline">&bull;</span>

          <nav aria-label="Navigasi Footer" className="flex items-center gap-3 font-medium">
            <Link
              to="/about"
              onMouseEnter={prefetchRoute.about}
              className="text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Tentang &amp; Bantuan
            </Link>
            <span className="text-slate-200">&bull;</span>
            <Link
              to="/releases"
              onMouseEnter={prefetchRoute.releases}
              className="text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Catatan Rilis
            </Link>
            <span className="text-slate-200">&bull;</span>
            <Link
              to="/privacy"
              onMouseEnter={prefetchRoute.privacy}
              className="text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Privasi
            </Link>
            <span className="text-slate-200">&bull;</span>
            <Link
              to="/terms"
              onMouseEnter={prefetchRoute.terms}
              className="text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Ketentuan
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Format Desimal:</span>
            <DecimalFormatToggle />
          </div>

          <a
            href="https://github.com/hafidzrdwn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-accent-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 rounded px-1.5 py-0.5"
            aria-label="GitHub Hafidz Ridwan"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Github } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-xs py-4 px-6 mt-auto',
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p className="flex items-center gap-1.5 font-medium">
          <span>&copy; {currentYear} DecisiGraph &mdash; Dibuat oleh Hafidz Ridwan</span>
        </p>

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
    </footer>
  );
};

export default Footer;

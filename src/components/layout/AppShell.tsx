import React from 'react';
import { cn } from '@/utils/cn';
import Header, { type HeaderProps } from './Header';
import DotGridBackground from './DotGridBackground';

export interface AppShellProps {
  headerProps?: HeaderProps;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  headerProps,
  children,
  sidebar,
  className,
}) => {
  return (
    <DotGridBackground>
      {/* Top Header */}
      <Header {...headerProps} />

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {sidebar ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <aside className="md:col-span-1">{sidebar}</aside>
            <main className={cn('md:col-span-3', className)}>{children}</main>
          </div>
        ) : (
          <main className={cn('w-full', className)}>{children}</main>
        )}
      </div>
    </DotGridBackground>
  );
};

export default AppShell;

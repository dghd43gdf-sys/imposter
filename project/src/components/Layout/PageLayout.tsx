import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  maxWidth = 'lg' 
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              )}
              {subtitle && (
                <p className="text-slate-400">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
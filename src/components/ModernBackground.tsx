import React from 'react';

export const ModernBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        {/* Multiple animated orbs for more dynamic effect */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-float"
          style={{
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-float"
          style={{
            animation: 'float 25s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float"
          style={{
            animation: 'float 30s ease-in-out infinite'
          }}
        />
        
        {/* Additional smaller orbs for depth */}
        <div 
          className="absolute top-3/4 left-1/6 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-float"
          style={{
            animation: 'float 18s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute top-1/6 right-1/3 w-48 h-48 bg-pink-500/8 rounded-full blur-2xl animate-float"
          style={{
            animation: 'float 22s ease-in-out infinite reverse'
          }}
        />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5 animate-grid-move"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
  );
};
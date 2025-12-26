import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Futuristic geometric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        {/* Animated geometric shapes */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)
            `,
            animation: 'geometricFloat 20s ease-in-out infinite'
          }}
        />
        
        {/* Hexagonal pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(30deg, transparent 24%, rgba(99, 102, 241, 0.3) 25%, rgba(99, 102, 241, 0.3) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.3) 75%, rgba(99, 102, 241, 0.3) 76%, transparent 77%),
              linear-gradient(-30deg, transparent 24%, rgba(168, 85, 247, 0.3) 25%, rgba(168, 85, 247, 0.3) 26%, transparent 27%, transparent 74%, rgba(168, 85, 247, 0.3) 75%, rgba(168, 85, 247, 0.3) 76%, transparent 77%)
            `,
            backgroundSize: '60px 104px',
            animation: 'hexMove 30s linear infinite'
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `particleFloat ${8 + Math.random() * 12}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Scanning lines effect */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%)',
            animation: 'scanLine 8s ease-in-out infinite'
          }}
        />
      </div>
      
      <style jsx>{`
        @keyframes geometricFloat {
          0%, 100% { 
            transform: translate(0%, 0%) rotate(0deg);
          }
          25% { 
            transform: translate(2%, -1%) rotate(1deg);
          }
          50% { 
            transform: translate(-1%, 2%) rotate(-1deg);
          }
          75% { 
            transform: translate(-2%, -1%) rotate(0.5deg);
          }
        }
        
        @keyframes hexMove {
          0% { 
            transform: translate(0, 0);
          }
          100% { 
            transform: translate(60px, 104px);
          }
        }
        
        @keyframes particleFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.6;
          }
          25% { 
            transform: translateY(-20px) translateX(10px) scale(1.1);
            opacity: 0.8;
          }
          50% { 
            transform: translateY(-40px) translateX(-5px) scale(0.9);
            opacity: 0.4;
          }
          75% { 
            transform: translateY(-20px) translateX(-10px) scale(1.05);
            opacity: 0.7;
          }
        }
        
        @keyframes scanLine {
          0%, 100% { 
            transform: translateX(-100%);
          }
          50% { 
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};
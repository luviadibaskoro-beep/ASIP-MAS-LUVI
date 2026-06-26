import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function PremiumSplash({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(1); // 1: logo, 2: loading, 3: transition, 4: done
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < 1000) {
        setStage(1);
        setProgress(0);
      } else if (elapsed < 4200) {
        setStage(2);
        // Map 1000-4200ms (3.2 seconds) to 0-100% progress
        const percent = Math.min(100, Math.floor(((elapsed - 1000) / 3200) * 100));
        setProgress(percent);
      } else if (elapsed < 5000) {
        setStage(3);
        setProgress(100);
      } else {
        setStage(4);
        clearInterval(interval);
        
        // Start exit fadeout
        setIsExiting(true);
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, 600); // fade transition duration
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div 
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center 
        bg-gradient-to-b from-[#FFF0F0] to-[#FFFFFF] 
        dark:from-[#1a1118] dark:to-[#0f172a] 
        transition-opacity duration-500 ease-out select-none
        ${isExiting ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Inject custom styling for floating hearts and glows */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(30px) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-120px) scale(1.1) rotate(15deg);
            opacity: 0;
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.5;
          }
        }

        .heart-float-1 { animation: floatUp 3.2s infinite linear; }
        .heart-float-2 { animation: floatUp 2.7s infinite linear 0.7s; }
        .heart-float-3 { animation: floatUp 3.7s infinite linear 1.4s; }
        .heart-float-4 { animation: floatUp 2.9s infinite linear 2.1s; }

        .pulse-glow {
          animation: pulseGlow 3.5s infinite ease-in-out;
        }
      `}</style>

      {/* Main Container */}
      <div className="relative flex flex-col items-center max-w-sm w-full px-8 text-center">
        
        {/* Floating Heart Elements (only visible during loading) */}
        {stage < 3 && (
          <div className="absolute top-10 w-full h-40 pointer-events-none overflow-hidden">
            <Heart className="absolute left-[30%] heart-float-1 w-4 h-4 text-rosebrand-400 fill-rosebrand-400" />
            <Heart className="absolute left-[65%] heart-float-2 w-3.5 h-3.5 text-rosebrand-300 fill-rosebrand-300" />
            <Heart className="absolute left-[20%] heart-float-3 w-5 h-5 text-rosebrand-500 fill-rosebrand-500" />
            <Heart className="absolute left-[75%] heart-float-4 w-4 h-4 text-rosebrand-400 fill-rosebrand-300" />
          </div>
        )}

        {/* Logo Glow Ring */}
        <div 
          className={`
            absolute -top-3 w-48 h-48 rounded-full bg-rosebrand-200/20 dark:bg-rose-950/20 blur-2xl pulse-glow pointer-events-none transition-all duration-1000
            ${stage >= 3 ? 'scale-[0.5] -translate-y-20' : ''}
          `}
        />

        {/* Logo Container (Scales and moves up in stage 3) */}
        <div 
          className={`
            relative z-10 w-44 h-44 rounded-full border-4 border-rosebrand-200 dark:border-rose-900/40 shadow-2xl bg-white p-2.5 flex items-center justify-center transition-all duration-[800ms] ease-in-out
            ${stage >= 3 ? 'scale-[0.6] -translate-y-24 shadow-lg' : 'scale-100'}
          `}
        >
          <img 
            src="/logo.png" 
            alt="ASIPCare Logo" 
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        {/* Loading Progress Bar & percentage (Fades out in stage 3) */}
        <div 
          className={`
            mt-12 flex flex-col items-center transition-all duration-500 ease-in-out
            ${stage >= 3 ? 'opacity-0 transform translate-y-4 scale-95 pointer-events-none' : 'opacity-100'}
          `}
        >
          <div className="w-60 h-2 bg-rose-100 dark:bg-slate-800 rounded-full overflow-hidden border border-rose-200/20 relative">
            <div 
              className="h-full bg-gradient-to-r from-rosebrand-400 via-rosebrand-500 to-brand-500 rounded-full transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-black text-rosebrand-500 dark:text-rose-400 mt-3 tracking-widest">
            {progress}%
          </span>
          <span className="text-xs text-rosebrand-400/80 dark:text-rose-450/80 mt-1 italic animate-pulse font-medium">
            Memuat dengan cinta... ❤️
          </span>
        </div>

        {/* Tagline & Brand Intro (Fades in during stage 3) */}
        <div 
          className={`
            absolute top-44 left-0 right-0 flex flex-col items-center transition-all duration-[800ms] ease-out
            ${stage >= 3 ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform translate-y-8 scale-95 pointer-events-none'}
          `}
        >
          <h1 className="text-4xl font-black bg-gradient-to-r from-rosebrand-500 to-brand-500 bg-clip-text text-transparent tracking-wide">
            ASIP<span className="font-extralight italic">Care</span>
          </h1>
          <p className="text-xs text-rosebrand-600 dark:text-rose-400 font-black mt-3 uppercase tracking-[0.25em]">
            Catat • Pantau • Sayangi
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Air Susu Ibu Perah, Cinta untuk Si Kecil
          </p>
        </div>

      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Animar la barra del 0 al 100% en 2000ms
    const duration = 2000;
    const intervalTime = 20;
    const increment = (100 / (duration / intervalTime));

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setFading(true);
      setTimeout(() => {
        onComplete();
      }, 500); // 500ms para el fade out
    }
  }, [progress, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo / Título con efecto glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 rounded-full animate-pulse"></div>
          <h1 className="relative text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Syncro
          </h1>
        </div>
        
        {/* Barra de progreso superfina */}
        <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden mt-8">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-[20ms] ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Texto opcional pequeño */}
        <p className="text-xs text-slate-500 mt-2 font-medium tracking-widest uppercase">Cargando Entorno</p>
      </div>
    </div>
  );
};

export default SplashScreen;

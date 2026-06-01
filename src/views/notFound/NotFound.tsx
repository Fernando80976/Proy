import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Home, ArrowLeft, OctagonAlert } from 'lucide-react';


const crearParticulasSistema = () => {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${6 + Math.random() * 4}s`,
    size: Math.random() * 2 + 1, 
  }));
};

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [showSystem, setShowSystem] = useState<boolean>(false);
  const [particulasFondo] = useState(crearParticulasSistema);

  useEffect(() => {
    const timer = setTimeout(() => setShowSystem(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans p-4 md:p-8 select-none">
      
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-system-glow)_0%,transparent_65%)] opacity-5" />
        
      
        {particulasFondo.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-system-glow/30 animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
      
      
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-10 z-10 font-mono text-[10px] md:text-xs tracking-[0.25em] text-system-glow/20">
        <div className="flex justify-between w-full border-b border-white/5 pb-2">
          <span>[SYSTEM_ERROR // INVALID_URI]</span>
          <span>[LOCATION: OUT_OF_COMPUTATION]</span>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none hidden md:block">
          <span className="text-7xl font-mono font-black tracking-[0.3em] opacity-5 text-foreground block uppercase text-stroke-system">
            UNEXPECTED GATE
          </span>
          <span className="text-[10px] font-mono tracking-widest text-system-glow/30 block mt-2">
            WARNING: PROTOCOL_PLAYER_INTERRUPT
          </span>
        </div>

        <div className="flex justify-between w-full border-t border-white/5 pt-2">
          <span>[STATUS: REGION_NOT_FOUND]</span>
          <span>[THE_ARISE_OF_MONARCH]</span>
        </div>
      </div>

      
      <div className={`relative z-20 w-full max-w-xl mx-auto flex flex-col items-center transition-all duration-700 ${showSystem ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]'}`}>
        
      
        <div className="system-panel rounded-lg p-6 md:p-10 relative w-full bg-card/95 backdrop-blur-md border border-system-glow/20 shadow-[0_0_40px_rgba(0,229,255,0.03)] text-center group overflow-hidden">
          
      
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-system-glow/40" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-system-glow/40" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-system-glow/40" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-system-glow/40" />

      
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-system-glow/10 blur-md opacity-50" />
              <div className="p-4 bg-white/5 border border-system-glow/30 rounded-md relative z-10 text-system-glow shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <AlertTriangle className="w-9 h-9 animate-float" />
              </div>
            </div>
          </div>

      
          <div className="space-y-2 mb-6">
            <span className="font-mono text-xs tracking-[0.3em] font-bold text-system-glow/70 uppercase block">
              🚨 [ {t('error.codigo', 'CODE: 404 - EXCEPTION_FAILED')} ]
            </span>
            <h1 className="text-2xl md:text-3xl font-mono font-black tracking-widest text-foreground uppercase text-glow-strong">
              {t('error.titulo', 'ZONA NO INSTANCIADA')}
            </h1>
          </div>

      
          <div className="py-5 px-4 md:px-6 border border-white/5 bg-white/5 rounded-md space-y-3 mb-6 relative">
            <p className="font-mono text-system-gold text-xs md:text-sm font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2">
              <OctagonAlert className="w-3.5 h-3.5" />
              {t('error.advertencia', 'NOTIFICACIÓN DEL SISTEMA')}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed font-sans text-pretty opacity-90">
              {t('error.mensaje_p1', 'El Cazador ha intentado acceder a una región dimensional que no pertenece a ninguna ')}
              <span className="inline-block whitespace-nowrap text-system-glow font-data font-bold px-2 py-0.5 bg-system-glow/10 rounded border border-system-glow/20 tracking-tight">
                {t('error.mazmorra_no_instanciada', 'MAZMORRA ACTIVA')}
              </span>
              {t('error.mensaje_p2', '. El Sistema no puede sincronizar las coordenadas actuales con la base de datos de portales.')}
            </p>
          </div>

      
          <div className="space-y-1 mb-6 text-left">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
              <span>Sincronización del Entorno</span>
              <span className="text-red-400">0% [FAILED]</span>
            </div>
            <div className="h-1 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-red-500/50 w-[0%] transition-all duration-500" />
            </div>
          </div>

      
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground/40 px-1 uppercase tracking-widest pb-4 border-b border-white/5">
            <span>URI: UNRESOLVED</span>
            <span>GATE: RE_ROUTING_REQUIRED</span>
          </div>

      
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            
      
            <button
              onClick={() => navigate('/')}
              className="relative group overflow-hidden rounded-sm cursor-pointer transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.08)] hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            >
      
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-system-glow/20 to-transparent group-hover:animate-scan pointer-events-none z-10" />
              
              <div className="relative flex items-center justify-center gap-2.5 py-3 px-4 bg-black border-2 border-system-glow text-system-glow font-system text-xs font-bold uppercase tracking-[0.2em] group-hover:bg-system-glow/10 transition-colors duration-300">
                <Home size={14} className="group-hover:scale-110 transition-transform" />
                {t('error.volver_seguro', 'ZONA SEGURA')}
              </div>
            </button>
            
      
            <button 
              onClick={() => window.history.back()}
              className="py-3 px-4 rounded-sm bg-white/5 border-2 border-white/10 text-muted-foreground hover:text-white hover:border-white/30 font-system text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 hover:bg-white/10"
            >
              <ArrowLeft size={14} />
              {t('error.reintentar', 'REGRESAR')}
            </button>

          </div>

        </div>

      
        <p className="mt-6 font-mono text-[9px] tracking-[0.35em] text-muted-foreground/30 uppercase">
          {t('error.proyecto', 'THE ARISE OF MONARCH - STATUS INTERFACE VER 2.0')}
        </p>

      </div>
    </div>
  );
};

export default NotFound;
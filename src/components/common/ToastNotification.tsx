import { toast } from 'sonner';
import { AlertTriangle, AlertCircle, AlertOctagon, XCircle, CircleCheck, Cpu  } from 'lucide-react';

export const toastNotification = {
  success: (title: string, message: string) => {
    toast.custom(() => (
      <div className="
        relative flex flex-col overflow-hidden
        w-[95vw] sm:w-[415px]
        bg-background/95 backdrop-blur-2xl
        border border-system-glow/40 
        shadow-[0_0_40px_rgba(var(--system-glow),0.15)]
        animate-fade-in-up transition-all duration-500
        group
      ">
        {/* DETALLES HUD DE PRECISIÓN */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-system-glow animate-corner-pulse z-20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-system-glow animate-corner-pulse z-20" />
        
        {/* Línea de escaneo vertical decorativa lateral */}
        <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-system-glow to-transparent opacity-50" />

        {/* CABECERA COMPACTA */}
        <div className="relative flex items-center justify-between px-4 py-1.5 bg-system-glow/20 border-b border-system-glow/30 overflow-hidden">
          <div className="flex items-center gap-2 relative z-10">
            <Cpu size={12} className="text-system-glow animate-pulse" />
            <span className="font-system text-[9px] tracking-[0.4em] font-black text-system-glow uppercase">
              System Notification
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
        </div>

        {/* CUERPO DISTRIBUIDO (Horizontal para ahorrar espacio vertical) */}
        <div className="p-3 sm:p-4 flex gap-4 items-start relative">
          
          {/* ICONO COMPACTO */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="relative p-2 bg-system-glow/10 border border-system-glow/50 rounded-sm glow-border group-hover:scale-110 transition-transform duration-300">
              <CircleCheck size={18} className="text-system-glow" />
              {/* Ping de notificación activa */}
              {/* <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-system-glow opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-system-glow"></span>
              </span> */}
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-system text-foreground font-black italic uppercase text-[15px] sm:text-lg tracking-tight leading-none text-glow-strong truncate mb-2">
              {title}
            </h3>
            
            {/* CONTENEDOR DE MENSAJE CON ALTURA CONTROLADA */}
            <div className="relative max-h-[80px] overflow-y-auto custom-scrollbar pr-2">
              
              <p className="relative font-data text-foreground/90 font-medium italic text-[12px] sm:text-[13px] leading-relaxed pl-3 py-1 border-l-2 border-system-glow/70">
                {message}
              </p>
            </div>
          </div>
          
        </div>
      </div>
    ), { duration: 4500 });
  },

  warning: (title: string, message: string) => {
    toast.custom(() => (
      <div className="
        relative flex flex-col overflow-hidden
        w-[95vw] sm:w-[415px]
        bg-background/95 backdrop-blur-2xl
        border border-system-gold/40 
        shadow-[0_0_40px_rgba(var(--system-gold),0.15)]
        animate-fade-in-up transition-all duration-500
        group
      ">
        {/* ESQUINAS HUD */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-system-gold animate-corner-pulse z-20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-system-gold animate-corner-pulse z-20" />
        
        {/* Escaneo lateral */}
        <div className="absolute left-0 top-0 w-[2px] h-full bg-gradient-to-b from-transparent via-system-gold to-transparent opacity-50" />

        {/* CABECERA */}
        <div className="relative flex items-center justify-between px-4 py-1.5 bg-system-gold/20 border-b border-system-gold/30 overflow-hidden">
          <div className="flex items-center gap-2 relative z-10">
            <AlertCircle size={12} className="text-system-gold animate-pulse" />
            <span className="font-system text-[9px] tracking-[0.4em] font-black text-system-gold uppercase">
              System Warning
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
        </div>

        {/* CUERPO */}
        <div className="p-3 sm:p-4 flex gap-4 items-center relative">
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="relative p-2 bg-system-gold/10 border border-system-gold/50 rounded-sm group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle size={18} className="text-system-gold" />
            </div>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-system text-foreground font-black italic uppercase text-[15px] sm:text-lg tracking-tight leading-none text-system-gold truncate mb-2">
              {title}
            </h3>
            <div className="relative max-h-[80px] overflow-y-auto custom-scrollbar pr-2">
              <p className="relative font-data text-foreground/90 font-medium italic text-[12px] sm:text-[13px] leading-relaxed pl-3 py-1 border-l-2 border-system-gold/70 bg-system-gold/5">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 5000 });
  },

  error: (title: string, message: string) => {
    toast.custom(() => (
      <div className="
        relative flex flex-col overflow-hidden
        w-[95vw] sm:w-[415px]
        bg-background/95 backdrop-blur-2xl
        border border-system-red/50 
        shadow-[0_0_45px_rgba(var(--system-red),0.25)]
        group
      ">
        {/* ESQUINAS HUD ROJAS */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-system-red animate-pulse z-20 shadow-[0_0_10px_rgba(var(--system-red),0.5)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-system-red animate-pulse z-20 shadow-[0_0_10px_rgba(var(--system-red),0.5)]" />
        
        {/* Línea de escaneo roja crítica */}
        <div className="absolute left-0 top-0 w-[2px] h-full bg-system-red opacity-70 animate-pulse" />

        {/* CABECERA CRÍTICA */}
        <div className="relative flex items-center justify-between px-4 py-1.5 bg-system-red/30 border-b border-system-red/40 overflow-hidden">
          <div className="flex items-center gap-2 relative z-10">
            <AlertOctagon size={12} className="animate-bounce text-system-red" />
            <span className="font-system text-[9px] tracking-[0.4em] font-black uppercase text-system-red">
              System Error
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
        </div>

        {/* CUERPO ERROR */}
        <div className="p-3 sm:p-4 flex gap-4 items-center relative bg-system-red/5">
          <div className="flex-shrink-0 flex flex-col items-center justify-center">
            <div className="relative p-2 bg-system-red/20 border border-system-red rounded-sm group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(var(--system-red),0.4)]">
              <XCircle  size={18} className="text-system-red" />
            </div>
          </div>

          <div className="flex-col min-w-0 flex-1">
            <h3 className="font-system text-system-red font-black italic uppercase text-[15px] sm:text-lg tracking-tighter leading-none mb-2 drop-shadow-[0_0_8px_rgba(var(--system-red),0.6)]">
              {title}
            </h3>
            <div className="max-h-[80px] overflow-y-auto custom-scrollbar pr-2">
              <p className="font-data text-foreground/90 font-medium text-[12px] sm:text-[13px] border-l-2 border-system-red pl-3 py-1 italic bg-system-red/10">
                {message}
              </p>
            </div>
          </div>
        </div>

      </div>
    ), { duration: 6000 });
  },
};
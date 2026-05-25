import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Cpu, OctagonAlert , CheckCircle2 } from 'lucide-react';

type NotificationType = 'error' | 'warning' | 'info' | 'system';

interface SystemNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: NotificationType;
}

const SystemNotification = ({ isOpen, onClose, title, message, type = 'system' }: SystemNotificationProps) => {
  
  const config = {
    error: {
      icon: <OctagonAlert className="w-12 h-12" />,
      color: 'var(--system-red)', // Rojo fijo
      defaultTitle: 'SISTEMA: ERROR CRÍTICO',
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12" />,
      color: 'var(--system-gold)', // Dorado fijo
      defaultTitle: 'SISTEMA: ADVERTENCIA',
    },
    info: {
      icon: <Info className="w-12 h-12" />,
      color: 'var(--system-cyan)', // Dinámico si el tema cambia esta variable
      defaultTitle: 'SISTEMA: INFORMACIÓN',
    },
    system: {
      icon: <Cpu className="w-12 h-12" />,
      color: 'var(--system-glow)', // Dinámico (el azul/morado principal)
      defaultTitle: 'SISTEMA: MENSAJE',
    }
  };

  const current = config[type];

  // Nota: He quitado el wrapper hsl() de los estilos inline para que 
  // las variables var(--color) que ya traen el formato funcionen directo.
  const themeColor = current.color;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 pointer-events-none font-mono">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[3px] pointer-events-auto"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="relative w-full max-w-2xl pointer-events-auto"
          >
            <div 
              className="system-panel relative overflow-hidden bg-background/95 border rounded-lg transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              style={{ 
                // Ahora todos tienen borde de color, pero info/system dependen de las variables del tema
                borderColor: `hsl(${themeColor})`,
                boxShadow: `0 0 25px hsl(${themeColor} / 0.15)`
              }}
            >
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
                <div className="flex items-center gap-3">
                   <Cpu className="w-5 h-5" style={{ color: `hsl(${themeColor})` }} />
                   <h2 className="text-lg font-mono uppercase tracking-widest font-bold" style={{ color: `hsl(${themeColor})` }}>
                    {title || current.defaultTitle}
                  </h2>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-4 opacity-30" style={{ backgroundColor: `hsl(${themeColor})` }} />
                  <div className="w-1 h-4 opacity-60" style={{ backgroundColor: `hsl(${themeColor})` }} />
                  <div className="w-1 h-4" style={{ backgroundColor: `hsl(${themeColor})` }} />
                </div>
              </div>

              {/* Cuerpo */}
              <div className="p-8 flex flex-col items-center gap-8 text-center">
                
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold uppercase tracking-[0.4em] opacity-70" style={{ color: `hsl(${themeColor})` }}>
                    Notificación del Sistema
                  </p>
                  <div className="h-[1px] w-24 mx-auto opacity-30" style={{ backgroundColor: `hsl(${themeColor})` }} />
                </div>

                <div 
                  className="filter animate-float"
                  style={{ 
                    color: `hsl(${themeColor})`,
                    filter: `drop-shadow(0 0 15px hsl(${themeColor} / 0.5))`
                  }}
                >
                  {current.icon}
                </div>

                <p className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter px-4 leading-tight">
                    {message}
                </p>

                <div className="flex justify-center w-full pt-4">
                  <button
                    onClick={onClose}
                    className="relative group w-full max-w-sm overflow-hidden rounded transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:animate-scan pointer-events-none" />
                    
                    <div 
                      className="relative flex items-center justify-center gap-3 py-4 bg-black border-2 font-mono text-xs uppercase tracking-[0.3em] font-bold transition-colors group-hover:bg-white/[0.05]"
                      style={{ 
                        borderColor: `hsl(${themeColor})`,
                        color: `hsl(${themeColor})` 
                      }}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Aceptar Registro
                    </div>
                  </button>
                </div>
              </div>

              {/* Esquinas Decorativas */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 opacity-40" style={{ borderColor: `hsl(${themeColor})` }} />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 opacity-40" style={{ borderColor: `hsl(${themeColor})` }} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SystemNotification;
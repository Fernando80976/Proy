import { Dialog, DialogPanel } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Coins, Star, ChevronsUp, CheckCircle2, Sparkles } from 'lucide-react';
// import { useTranslation } from 'react-i18next';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    leveled_up: boolean;
    gains: {
      gold: number;
      exp: number;
      levels_gained: number;
    };
    current_state: {
      level: number;
      gold: number;
    };
  } | null;
}

const RewardModal = ({ isOpen, onClose, data }: RewardModalProps) => {
//   const { t } = useTranslation();
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={onClose} className="relative z-[150]">
          {/* Fondo desenfocado sutil - Mantiene visibilidad del Dashboard */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[3px]" 
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
            <DialogPanel className="w-full max-w-2xl pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="relative"
              >
                {/* Estética StatusWindow: Borde fino y fondo semi-transparente */}
                <div className="system-panel rounded-lg overflow-hidden bg-background/95 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                  
                  {/* Header: Igual que Status Window */}
                  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
                    <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-system-gold animate-float" />
                      {data.leveled_up ? "SISTEMA: EVOLUCIÓN DETECTADA" : "SISTEMA: RECOMPENSA DE MISIÓN"}
                    </h2>
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-system-glow/30" />
                      <div className="w-1 h-4 bg-system-glow/60" />
                      <div className="w-1 h-4 bg-system-glow" />
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Mensaje Principal */}
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-mono text-system-glow uppercase tracking-[0.4em] opacity-70">Resultados del reclamo</p>
                      <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                        {data.leveled_up ? "LEVEL UP" : "RECOMPENSA"}
                      </h3>
                    </div>

                    {/* Contenedor de Recompensas: Estilo Atributos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Oro */}
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded group hover:border-system-gold/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-system-gold/10 rounded border border-system-gold/20">
                            <Coins className="w-5 h-5 text-system-gold" />
                          </div>
                          <span className="text-xs font-mono font-bold text-muted-foreground uppercase">Oro</span>
                        </div>
                        <span className="text-xl font-mono font-bold gold-text">
                          +{data.gains.gold.toLocaleString()} G
                        </span>
                      </div>

                      {/* Experiencia */}
                      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded group hover:border-system-glow/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-system-glow/10 rounded border border-system-glow/20">
                            <Star className="w-5 h-5 text-system-glow" />
                          </div>
                          <span className="text-xs font-mono font-bold text-muted-foreground uppercase">Exp</span>
                        </div>
                        <span className="text-xl font-mono font-bold text-system-glow">
                          +{data.gains.exp.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Sección Level Up: Inspirada en la barra de Fatiga/EXP */}
                    {data.leveled_up && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-system-glow">
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-system-glow/50" />
                          <Sparkles className="w-5 h-5 animate-pulse" />
                          <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Nuevo Estado</span>
                          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-system-glow/50" />
                        </div>

                        <div className="flex items-center justify-center gap-8 py-4 bg-system-glow/5 border border-system-glow/20 rounded">
                          <div className="text-center">
                            <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Nivel Anterior</p>
                            <p className="text-2xl font-mono font-bold text-white/40 italic">Lv.{data.current_state.level - data.gains.levels_gained}</p>
                          </div>
                          <ChevronsUp className="w-8 h-8 text-system-glow animate-bounce" />
                          <div className="text-center">
                            <p className="text-[9px] font-mono text-system-glow uppercase mb-1 font-bold">Nivel Actual</p>
                            <p className="text-4xl font-mono font-black text-white italic drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">Lv.{data.current_state.level}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botón Confirmar: Estilo botón "Aplicar" de Status */}
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={onClose}
                        className="relative group w-full max-w-sm overflow-hidden rounded transition-all duration-500 shadow-[0_0_20px_rgba(0,229,255,0.1)]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-system-glow/20 to-transparent group-hover:animate-scan pointer-events-none" />
                        <div className="relative flex items-center justify-center gap-3 py-4 bg-black border-2 border-system-glow text-system-glow font-mono text-xs uppercase tracking-[0.3em] font-bold group-hover:bg-system-glow/10 transition-colors">
                          <CheckCircle2 className="w-5 h-5" />
                          Confirmar Reporte
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Detalles decorativos de las esquinas */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-system-glow/40" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-system-glow/40" />
                </div>
              </motion.div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default RewardModal;
import React, { useEffect, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, Palette, CheckCircle2, ChevronRight, Settings2, Check, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/theme/ThemeContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalConfiguracion: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  // SOLUCIÓN AL ERROR: Usamos useRef para guardar el punto de restauración (Savepoint).
  // Las referencias no provocan re-renders y actúan como una memoria estática del estado exacto
  // en el que el cazador abrió el portal de configuración.
  const backupTheme = useRef<'blue' | 'purple'>(theme);
  const backupLang = useRef<string>(i18n.resolvedLanguage || 'es');

  const wasOpen = useRef(false);
  // Cada vez que el modal pasa de cerrado a abierto (isOpen === true),
  // actualizamos las referencias para capturar el estado real actual del juego.
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      backupTheme.current = theme;
      backupLang.current = i18n.resolvedLanguage || 'es';
    }

    wasOpen.current = isOpen;
    
  }, [isOpen, theme, i18n.resolvedLanguage]);

  const languages = [
    { code: 'es', label: t('config.idiomas.es'), tag: 'SYS_DECOD_ESP_01' },
    { code: 'en', label: t('config.idiomas.en'), tag: 'SYS_DECOD_ENG_02' },
  ];

  // REVERTIR CAMBIOS (Pulsar la X o cerrar sin guardar):
  // Comparamos el estado actual del juego con nuestras referencias de respaldo.
  const handleCancelar = () => {
    if (theme !== backupTheme.current) {
      toggleTheme();
    }
    if (i18n.resolvedLanguage !== backupLang.current) {
      i18n.changeLanguage(backupLang.current);
    }
    onClose(); // Cierra el HUD
  };

  // CONFIRMAR CAMBIOS (Pulsar Guardar):
  // Como los cambios ya se aplicaron en caliente sobre la interfaz, solo consolidamos cerrando el panel.
  const handleGuardar = () => {
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleCancelar} // Si pulsan la tecla ESC o hacen clic fuera, restauramos el backup por seguridad
      className="relative z-[100]"
    >
      {/* FONDO CINEMÁTICO: Difuminado de interfaz de juego con Tailwind v4 */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in" aria-hidden="true" />

      {/* Contenedor posicional centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        
        {/* PANEL PRINCIPAL */}
        <DialogPanel className="relative w-full max-w-2xl system-panel rounded-lg bg-neutral-950/95 border border-system-glow/30 p-5 md:p-7 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden animate-logo-reveal transition-all">
          
          {/* CABECERA: TÍTULO Y BOTÓN DE CANCELACIÓN */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <DialogTitle as="h2" className="text-xl md:text-2xl font-system system-text uppercase tracking-widest flex items-center gap-3">
              <Settings2 className="w-5.5 h-5.5 text-system-glow shrink-0 animate-float" />
              <span className="truncate">{t('inicio.configuracion')}</span>
            </DialogTitle>
            
            <button 
              onClick={handleCancelar} // Ejecuta la restauración de inmediato
              className="text-neutral-400 hover:text-red-500 transition-all duration-200 hover:scale-105 p-1 bg-white/5 border border-white/10 hover:border-red-500 rounded-sm cursor-pointer shrink-0"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* CUERPO INTERNO DEL HUD */}
          <div className="flex flex-col gap-8">
            
            {/* PROTOCOLO DE INTERFAZ: CAMBIO DE COLOR EN CALIENTE */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs md:text-sm font-mono text-system-glow/80 uppercase tracking-[0.25em]">
                {t('config.protocolo_interfaz')}
              </h3>

              <div className="relative mt-1 group">
                <button 
                  onClick={toggleTheme} // Muta el contexto global. La UI del juego cambia de color instantáneamente de fondo
                  className="relative w-full flex items-center justify-between px-5 py-4.5 rounded-md bg-system-glow/5 border border-system-glow/20 hover:border-system-glow/40 hover:bg-system-glow/10 transition-all duration-300 group/btn cursor-pointer"
                >
                  <div className="flex flex-col text-left gap-1">
                    <div className="flex items-center gap-2.5">
                      <Palette className="w-4.5 h-4.5 text-system-glow shrink-0 animate-pulse" />
                      <span className="text-base md:text-lg font-data font-bold text-white tracking-wide uppercase">
                        {theme === 'blue' ? t('config.modo_azul') : t('config.modo_morado')}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 font-data font-medium tracking-tight max-w-[90%] leading-normal">
                      Sincroniza el color del HUD del Monarca para canalizar tu energía de cazador.
                    </p>
                  </div>

                  <div className="flex items-center pl-3 border-l border-white/10 shrink-0">
                    <ChevronRight className="w-4.5 h-4.5 text-system-glow/40 group-hover/btn:translate-x-1 group-hover/btn:text-system-glow transition-all" />
                  </div>
                </button>
              </div>
            </div>

            {/* MATRIZ LINGÜÍSTICA: CAMBIO DE IDIOMA EN CALIENTE */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs md:text-sm font-mono text-system-glow/80 uppercase tracking-[0.25em]">
                {t('config.sincro_lingual')}
              </h3>

              <div className="flex flex-col gap-3.5">
                {languages.map((lang) => {
                  const isActive = i18n.resolvedLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => i18n.changeLanguage(lang.code)} // Cambia las claves de traducción dinámicamente
                      className={`flex items-center justify-between px-5 py-4.5 rounded border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                        isActive
                          ? 'border-system-glow bg-system-glow/5 text-white shadow-[0_0_12px_rgba(0,229,255,0.05)]'
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 w-[3.5px] h-full bg-system-glow shadow-[0_0_8px_hsl(var(--system-glow))]" />
                      )}
                      
                      <div className="text-left flex flex-col justify-center">
                        <span className={`font-mono text-base md:text-lg tracking-widest uppercase font-black transition-colors ${isActive ? 'text-system-glow' : 'text-neutral-300'}`}>
                          {lang.label}
                        </span>
                        <span className="text-[9px] font-data text-neutral-500 uppercase tracking-widest font-bold mt-0.5">
                          {lang.tag}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center relative z-10 shrink-0">
                        {isActive ? (
                          <CheckCircle2 className="w-5 h-5 text-system-glow filter drop-shadow-[0_0_4px_hsl(var(--system-glow))]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20 bg-black" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* PIE DEL MODAL: GUARDAR Y FIJAR CAMBIOS */}
          <div className="mt-8 pt-5 border-t border-white/10 flex flex-col items-center gap-3">
            <p className="text-[11px] font-data font-bold uppercase tracking-[0.2em] text-system-glow/90 animate-pulse text-center">
              {t('status.sincro_requerida')}
            </p>
            
            <button
              onClick={handleGuardar} // Consolida el estado actual
              className="relative group w-full max-w-xs md:max-w-sm overflow-hidden rounded-sm transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.1)]"
            >
              <div className="relative flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 font-system text-sm md:text-base bg-black border-2 border-system-glow text-system-glow group-hover:bg-system-glow/10 transition-all duration-300">
                <Check className="w-4.5 h-4.5 shrink-0 animate-bounce" />
                <span className="uppercase tracking-[0.2em] sm:tracking-[0.25em] font-bold whitespace-nowrap">
                  {t('config.guardar')}
                </span>
              </div>
            </button>

            {/* Microaviso estético de sobreescritura */}
            <div className="flex items-center justify-center gap-1.5 opacity-30 mt-1 w-full text-center">
              <ShieldAlert className="w-3.5 h-3.5 text-system-glow shrink-0" />
              <span className="text-[8px] font-mono text-system-glow tracking-[0.35em] uppercase truncate">
                SYSTEM_CONFIGURATION_OVERRIDE
              </span>
            </div>
          </div>

        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ModalConfiguracion;
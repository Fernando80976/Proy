import { useMemo } from 'react';
import { 
  X, Trophy, Check, Loader2, Lock, Info, AlertTriangle, Swords,
  Wind, Heart, Brain, Eye, Crown 
} from 'lucide-react';
import { type Title } from '../../services/StatusService';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  titles: Title[] | undefined;
  activeTitleId: number | null | undefined;
  onSelect: (id: number) => void;
  isPending: boolean;
  errorMessege: Error | null;
}

const TITLE_THEME_CONFIG = {
  strength: {
    icon: <Swords className="w-4 h-4 sm:w-5 sm:h-5" />,
    textColor: 'text-red-400',
    borderColor: 'border-red-500/40',
    hoverBorderColor: 'hover:border-red-500',
    bgActive: 'bg-red-500/15 shadow-[inset_0_0_24px_rgba(239,68,68,0.2)]',
    bgHover: 'hover:bg-red-500/10',
    badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
    laserBg: 'bg-red-500',
    laserHover: 'group-hover:bg-red-500/50'
  },
  agility: {
    icon: <Wind className="w-4 h-4 sm:w-5 sm:h-5" />,
    textColor: 'text-green-400',
    borderColor: 'border-green-500/40',
    hoverBorderColor: 'hover:border-green-500',
    bgActive: 'bg-green-500/15 shadow-[inset_0_0_24px_rgba(74,222,128,0.2)]',
    bgHover: 'hover:bg-green-500/10',
    badgeBg: 'bg-green-500/20 text-green-400 border-green-500/40',
    laserBg: 'bg-green-400',
    laserHover: 'group-hover:bg-green-400/50'
  },
  vitality: {
    icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />,
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/40',
    hoverBorderColor: 'hover:border-orange-500',
    bgActive: 'bg-orange-500/15 shadow-[inset_0_0_24px_rgba(251,146,60,0.2)]',
    bgHover: 'hover:bg-orange-500/10',
    badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    laserBg: 'bg-orange-400',
    laserHover: 'group-hover:bg-orange-400/50'
  },
  intelligence: {
    icon: <Brain className="w-4 h-4 sm:w-5 sm:h-5" />,
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    hoverBorderColor: 'hover:border-blue-500',
    bgActive: 'bg-blue-500/15 shadow-[inset_0_0_24px_rgba(96,165,250,0.2)]',
    bgHover: 'hover:bg-blue-500/10',
    badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    laserBg: 'bg-blue-400',
    laserHover: 'group-hover:bg-blue-400/50'
  },
  sense: {
    icon: <Eye className="w-4 h-4 sm:w-5 sm:h-5" />,
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    hoverBorderColor: 'hover:border-purple-500',
    bgActive: 'bg-purple-500/15 shadow-[inset_0_0_24px_rgba(192,132,252,0.2)]',
    bgHover: 'hover:bg-purple-500/10',
    badgeBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    laserBg: 'bg-purple-400',
    laserHover: 'group-hover:bg-purple-400/50'
  },
  default: {
    icon: <Crown className="w-4 h-4 sm:w-5 sm:h-5" />,
    textColor: 'text-system-glow',
    borderColor: 'border-system-glow/40',
    hoverBorderColor: 'hover:border-system-glow',
    bgActive: 'bg-system-glow/25 shadow-[inset_0_0_24px_rgba(0,242,255,0.2)]',
    bgHover: 'hover:bg-system-glow/15',
    badgeBg: 'bg-system-glow/20 text-system-glow border-system-glow/40',
    laserBg: 'bg-system-glow',
    laserHover: 'group-hover:bg-system-glow/50'
  }
};

const TitleSelectorModal = ({ isOpen, onClose, titles, activeTitleId, onSelect, isPending, errorMessege }: Props) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const sortedTitles = useMemo(() => {
    if (!titles) return [];
    return [...titles].sort((a, b) => {
      if (a.id === activeTitleId) return -1;
      if (b.id === activeTitleId) return 1;
      if (a.is_unlocked && !b.is_unlocked) return -1;
      if (!a.is_unlocked && b.is_unlocked) return 1;
      return a.min_level_required - b.min_level_required;
    });
  }, [titles, activeTitleId]);

  const getTitleTheme = (effectObj: Record<string, string>) => {
    const effectText = `${effectObj['es'] || ''} ${effectObj['en'] || ''}`.toLowerCase();

    if (effectText.includes('fuerza') || effectText.includes('strength') || effectText.includes('str')) return TITLE_THEME_CONFIG.strength;
    if (effectText.includes('agilidad') || effectText.includes('agility') || effectText.includes('agi')) return TITLE_THEME_CONFIG.agility;
    if (effectText.includes('vitalidad') || effectText.includes('vitality') || effectText.includes('vit')) return TITLE_THEME_CONFIG.vitality;
    if (effectText.includes('inteligencia') || effectText.includes('intelligence') || effectText.includes('int')) return TITLE_THEME_CONFIG.intelligence;
    if (effectText.includes('percepcion') || effectText.includes('percepción') || effectText.includes('sense') || effectText.includes('per')) return TITLE_THEME_CONFIG.sense;

    return TITLE_THEME_CONFIG.default;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-[100]">
      <div className="fixed inset-0 z-[100] flex items-center sm:items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
        
        {/* CONTENEDOR PRINCIPAL: Max-h adaptativo para que nunca se corte en móviles */}
        <DialogPanel className="relative w-full max-w-xl bg-background border border-system-glow/30 shadow-[0_0_40px_rgba(0,242,255,0.15)] sm:shadow-[0_0_60px_rgba(0,242,255,0.2)] flex flex-col rounded-t-xl sm:rounded-xl animate-fade-in-up overflow-hidden max-h-[92vh] sm:max-h-[85vh]">

          {/* MARCADORES HUD EN ESQUINAS */}
          <div className="absolute top-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-system-glow z-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-system-glow z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-system-glow z-20 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-system-glow z-20 pointer-events-none" />
          
          {/* CABECERA DEL MODAL: Padding y textos fluidos */}
          <div className="sticky top-0 z-20 p-4 sm:p-6 border-b border-system-glow/15 bg-background/95 backdrop-blur-xl flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <div className="relative flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 sm:w-7 sm:h-7 text-system-glow animate-float relative z-10" />
                <div className="absolute inset-0 blur-lg bg-system-glow/40 animate-pulse-glow rounded-full" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg sm:text-2xl font-mono font-black text-white tracking-[0.1em] sm:tracking-[0.15em] uppercase italic text-glow-strong truncate">
                  {t('titulos.cabecera')}
                </DialogTitle>
                <p className="text-[10px] sm:text-xs font-mono text-system-glow/80 uppercase tracking-wider sm:tracking-widest flex items-center gap-1 mt-0.5 truncate">
                  <Swords className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> {t('titulos.subcabecera')}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-muted-foreground hover:text-red-400 transition-all p-1.5 sm:p-2 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 rounded group cursor-pointer shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* CONTENEDOR DE TÍTULOS DINÁMICOS */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-3 max-h-[50vh] sm:max-h-[62vh] relative bg-background">
            
            {!errorMessege && sortedTitles.length === 0 && (
              <div className="text-center py-12 sm:py-16 text-muted-foreground opacity-50 font-mono text-xs sm:text-sm uppercase tracking-widest italic">
                {t('titulos.vacio')}
              </div>
            )}

            {errorMessege && (
              <div className="flex flex-col items-center justify-center py-8 text-red-400 gap-3 border border-red-500/30 bg-red-950/40 rounded-lg p-4 animate-glitch">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
                <div className="text-center font-mono uppercase">
                  <p className="text-xs sm:text-sm font-bold tracking-wide">{t('status.error_titles')}</p>
                  <p className="text-[10px] opacity-70 mt-1">{t(`backend_errors.ERR_INTERNAL_SYSTEM`)}</p>
                </div>
              </div>
            )}

            {sortedTitles.map((title, index) => {
              const isActive = activeTitleId === title.id;
              const isLocked = !title.is_unlocked;
              const theme = getTitleTheme(title.description_effect);

              return (
                <button
                  key={title.id}
                  disabled={isPending || isActive || isLocked}
                  onClick={() => onSelect(title.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`
                    relative w-full flex flex-col transition-all duration-300 group text-left rounded-lg p-3 sm:p-3.5 border
                    ${isActive 
                      ? `${theme.borderColor} ${theme.bgActive}` 
                      : isLocked
                        ? 'border-red-500/15 bg-red-950/15 grayscale cursor-not-allowed' 
                        : `border-system-glow/20 bg-background/95 ${theme.hoverBorderColor} ${theme.bgHover} hover:translate-x-1 sm:hover:translate-x-2`}
                  `}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] sm:w-[4px] transition-all duration-300 
                    ${isActive ? theme.laserBg : `bg-transparent ${theme.laserHover}`}`} 
                  />

                  {/* FILA SUPERIOR DEL ELEMENTO: Adaptable flex-row o flex-col en pantallas ultra pequeñas */}
                  <div className="flex justify-between items-start sm:items-center gap-2 mb-1.5 relative w-full z-10">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-red-400 shrink-0" />
                      ) : (
                        <div className={`${theme.textColor} shrink-0`}>
                          {theme.icon}
                        </div>
                      )}
                      <span className={`font-mono text-sm sm:text-base font-black tracking-wider uppercase transition-colors truncate
                        ${isActive ? theme.textColor : isLocked ? 'text-red-400/60' : 'text-foreground group-hover:text-white'}`}>
                        {title.name[currentLang] || title.name['en']}
                      </span>
                    </div>
                    
                    {/* Badges con padding responsivo */}
                    <div className="font-mono text-[10px] sm:text-xs uppercase tracking-normal shrink-0">
                      {isActive ? (
                        <div className={`flex items-center gap-1 sm:gap-2 border px-2 py-0.5 sm:py-1 rounded ${theme.badgeBg}`}>
                          <span className="text-[9px] sm:text-[10px] font-black tracking-widest animate-pulse">{t('titulos.activo')}</span>
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </div>
                      ) : isLocked ? (
                        <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/40 px-2 py-0.5 sm:py-1 rounded text-red-400 font-bold text-[10px] sm:text-xs">
                          <span>LV. {title.min_level_required}</span>
                        </div>
                      ) : (
                        <div className={`opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity border px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-black tracking-widest ${theme.badgeBg}`}>
                          {'EQUIPAR'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DESCRIPCIÓN */}
                  <p className={`text-xs sm:text-sm mb-2 sm:mb-2.5 leading-relaxed font-sans transition-colors max-w-[98%]
                    ${isActive ? 'text-white' : isLocked ? 'text-red-400/40' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {title.description[currentLang] || title.description['en']}
                  </p>

                  {/* SECCIÓN DEL BUFF ADQUIRIDO */}
                  <div className={`
                    flex items-center gap-2 text-[11px] sm:text-xs font-mono border w-full transition-all rounded px-2.5 py-1.5
                    ${isActive 
                      ? `${theme.borderColor} bg-white/5 text-white` 
                      : isLocked
                        ? 'border-red-500/20 text-red-400/50 bg-red-950/10'
                        : `border-system-glow/20 bg-system-glow/5 ${theme.hoverBorderColor}`}
                  `}>
                    <Info className={`w-3.5 h-3.5 shrink-0 ${isLocked ? 'text-red-400/60' : theme.textColor}`} />
                    <span className="source-code truncate tracking-wide sm:tracking-widest">
                      <span className="opacity-60">{t('titulos.efecto_especial')}:</span>{' '}
                      {isLocked ? (
                        <span className="text-red-400 font-medium italic">
                          {t('titulos.bloqueado', { lvl: title.min_level_required }) || `Restringido`}
                        </span>
                      ) : (
                        <span className={`font-data ${isActive ? theme.textColor : `text-foreground group-hover:${theme.textColor}`}`}>
                          {title.description_effect[currentLang] || title.description_effect['en']}
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* FOOTER GENERAL - COMPACTO, SEGURO Y TOTALMENTE RESPONSIVE */}
          <div className="sticky bottom-0 z-20 p-4 bg-background/95 border-t border-system-glow/15 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-6 backdrop-blur-md font-mono select-none">
            
            {/* SECCIÓN PROGRESO (Izquierda en desktop, arriba en móvil) */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-1">
              <span className="text-[10px] sm:text-[10.5px] text-muted-foreground uppercase tracking-[0.12em] sm:tracking-[0.15em] font-bold shrink-0">
                {t('titulos.tasa_coleccion')}
              </span>
              
              <div className="flex-1 h-[4px] sm:h-[6.5px] bg-system-glow/10 border border-system-glow/20 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-system-glow/70 shadow-[0_0_8px_rgba(0,242,255,0.6)] transition-all duration-1000 ease-out"
                  style={{ width: `${((titles?.filter(t => t.is_unlocked).length || 0) / (titles?.length || 1)) * 100}%` }}
                />
              </div>
              
              <span className="text-xs sm:text-sm text-system-glow font-black tracking-widest shrink-0 bg-system-glow/5 px-1.5 sm:px-2 py-0.5 border border-system-glow/10 rounded">
                {titles?.filter(t => t.is_unlocked).length || 0}/{titles?.length || 0}
              </span>
            </div>
            
            {/* SECCIÓN ESTADO (Derecha en desktop, abajo centrado/derecha en móvil) */}
            <div className="shrink-0 flex items-center justify-end min-w-0 sm:min-w-[140px]">
              {isPending ? (
                <div className="w-full sm:w-auto flex items-center justify-center gap-2 text-system-glow font-black uppercase tracking-wider text-[10px] sm:text-[10.5px] bg-system-glow/10 border border-system-glow/30 px-2.5 py-1 rounded animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin text-system-glow" />
                  <span>{t('titulos.aplicando')}</span>
                </div>
              ) : (
                <div className="w-full sm:w-auto text-right text-[9.5px] sm:text-[10.5px] text-muted-foreground opacity-40 tracking-widest uppercase italic font-bold">
                  {t('titulos.version') || 'SYS-MONARCH v4.0'}
                </div>
              )}
            </div>

          </div>
          
        </DialogPanel>
      </div>
    </Dialog>

  );
};

export default TitleSelectorModal;
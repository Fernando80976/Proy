import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, X } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

interface StatTooltipProps {
  statLabel: string;     
  base: number;          
  equipment: number;     
  title: number;         
  classBonus: number;    
}

const StatTooltip: React.FC<StatTooltipProps> = ({
  statLabel,
  base,
  equipment,
  title,
  classBonus,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);

  
  const renderRows = () => (
    <div className="space-y-2 text-sm font-mono leading-relaxed">
      <div className="flex justify-between">
        <span className="text-zinc-400">{t('status.tooltip.base', 'Base')}</span>
        <span className="text-white font-bold">{base}</span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">{t('status.tooltip.equipment', 'Equipamiento')}</span>
        <span className={`font-bold ${equipment > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
          +{equipment}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">{t('status.tooltip.title', 'Título')}</span>
        <span className={`font-bold ${title > 0 ? 'text-purple-400' : 'text-zinc-500'}`}>
          +{title}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">{t('status.tooltip.class', 'Clase')}</span>
        <span className={`font-bold ${classBonus > 0 ? 'text-blue-400' : 'text-zinc-500'}`}>
          +{classBonus}
        </span>
      </div>
    </div>
  );

  return (
    <div className="inline-block ml-2 align-middle select-none">
      
  
      <div 
        className="hidden md:block relative animate-fade-in"
        onMouseEnter={() => setIsDesktopHovered(true)}
        onMouseLeave={() => setIsDesktopHovered(false)}
      >
      
        <Info 
          className={`w-4 h-4 cursor-help transition-all duration-200 ${
            isDesktopHovered 
              ? 'text-system-glow drop-shadow-[0_0_4px_rgba(0,229,255,0.6)] scale-110' 
              : 'text-zinc-500'
          }`} 
        />
        
      
        <div 
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 p-4 rounded-sm system-panel backdrop-blur-md origin-bottom transition-all duration-200 ease-out z-50 shadow-[0_0_20px_rgba(0,0,0,0.8)] ${
            isDesktopHovered 
              ? 'opacity-100 pointer-events-auto scale-100' 
              : 'opacity-0 pointer-events-none scale-95'
          }`}
        >
          <div className="flex justify-between items-baseline w-full mb-3 border-b border-white/10 pb-2">
            <h3 className="text-sm font-system text-system-glow uppercase tracking-wider">
              {statLabel}
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground ml-auto">
              DESGLOSE
            </span>
          </div>
          
          {renderRows()}
          
      
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-950" />
        </div>
      </div>

      
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="block md:hidden p-1 -m-1 text-zinc-500 active:text-system-glow transition-colors focus:outline-none"
        aria-label={t('status.tooltip.view_breakdown', { stat: statLabel })}
      >
        <Info className="w-4 h-4 text-zinc-400 active:scale-110 transition-transform" />
      </button>

      
      <Transition show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-50 md:hidden" onClose={() => setIsOpen(false)}>
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden flex items-end justify-center">
              <TransitionChild
                as={React.Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <DialogPanel className="w-full max-w-md rounded-t-xl system-panel p-5 shadow-[0_-8px_30px_rgba(0,229,255,0.15)] pb-8">
                  <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-4">
                    <DialogTitle className="font-mono uppercase tracking-wider flex flex-col gap-1">
                      <span className="text-lg font-bold text-system-glow">
                        {statLabel}
                      </span>
                      <span className="text-xs font-medium text-zinc-500 tracking-widest">
                        {t('status.tooltip.mobile_title', 'DESGLOSE DEL SISTEMA')}
                      </span>
                    </DialogTitle>

                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-1 -mt-0.5 -mr-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all focus:outline-none"
                      aria-label={t('status.tooltip.close_breakdown')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-white/5 p-4 rounded border border-white/5 shadow-inner">
                    {renderRows()}
                  </div>

                  <div className="mt-5 text-center">
                    <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase">
                      {t('status.tooltip_note')}
                    </p>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
};

export default StatTooltip;
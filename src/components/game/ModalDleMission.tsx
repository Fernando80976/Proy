import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DleService, { 
  type AttributeComparison,
  type SavedAttempt 
} from '../../services/DleService';
import { Ban, Check, ArrowUp, ArrowDown, Loader2, Target, Search, Fingerprint } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAsset } from '../../hook/useAsset';
import { useTranslation } from 'react-i18next';


export interface DleAttemptUI {
  name: string;
  image_key: string;
  race: AttributeComparison;
  rank: AttributeComparison;
  class: AttributeComparison;
  affiliation: AttributeComparison;
}

interface DleModalProps {
  isOpen: boolean;
  onClose: () => void;
}


const DleModal: React.FC<DleModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const getAssetUrl = useAsset();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: catalog = [] } = useQuery({
    queryKey: ['dle-catalog'],
    queryFn: DleService.getCharactersCatalog,
    enabled: isOpen,
    staleTime: 1000 * 60 * 60,
  });

  const { data: dailyStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['dle-status'],
    queryFn: DleService.getDailyStatus,
    enabled: isOpen,
    refetchOnWindowFocus: true,
  });

  const mutation = useMutation({
    mutationFn: (characterId: number) => DleService.submitGuess(characterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dle-status'] });
      setSearchTerm("");
    },
  });

  const attempts = useMemo(() => {
    if (!dailyStatus?.attempts_history || catalog.length === 0) return [];
    
    return dailyStatus.attempts_history.map((att: SavedAttempt) => {
      const char = catalog.find(c => c.id === att.character_id);
      return {
        name: char?.name_data || "???", 
        image_key: char?.image_key || "unknown",
        ...att.comparison
      } as DleAttemptUI;
    });
  }, [dailyStatus, catalog]);

  const isWon = dailyStatus?.is_completed || false;

  const filteredCharacters = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return catalog
      .filter(char => 
        char.name_data.toLowerCase().includes(term) &&
        !attempts.some(att => att.name === char.name_data)
      )
      .slice(0, 5);
  }, [searchTerm, catalog, attempts]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="system-panel w-full max-w-5xl h-[95vh] sm:h-[85vh] flex flex-col rounded-sm border border-system-glow/40 relative overflow-hidden shadow-[0_0_30px_rgba(0,242,255,0.1)]">
        
        
        <div className="absolute top-0 left-0 w-8 h-8 sm:w-16 sm:h-16 border-t-2 border-l-2 border-system-glow opacity-60 pointer-events-none animate-corner-pulse" />
        <div className="absolute top-0 right-0 w-8 h-8 sm:w-16 sm:h-16 border-t-2 border-r-2 border-system-glow opacity-60 pointer-events-none animate-corner-pulse" />
        <div className="absolute bottom-0 left-0 w-8 h-8 sm:w-16 sm:h-16 border-b-2 border-l-2 border-system-glow opacity-60 pointer-events-none animate-corner-pulse" />
        <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-16 sm:h-16 border-b-2 border-r-2 border-system-glow opacity-60 pointer-events-none animate-corner-pulse" />
        
        
        <div className="p-4 sm:p-6 border-b border-system-glow/30 flex justify-between items-start sm:items-center bg-gradient-to-r from-system-glow/10 via-transparent to-transparent relative">
          <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none" />
          <div className="flex items-center gap-3 sm:gap-5 z-10 w-full pr-8 sm:pr-0">
            <div className="p-2 sm:p-3 bg-black/50 border border-system-glow/50 relative overflow-hidden group shrink-0">
              <div className="absolute inset-0 bg-system-glow/20 animate-pulse-cyan" />
              <Target className="w-6 h-6 sm:w-8 sm:h-8 system-text relative z-10" />
            </div>
            <div>
              <h2 className="font-system text-lg sm:text-3xl tracking-[0.1em] sm:tracking-[0.2em] text-monarch uppercase leading-none text-glow-strong">
                {t('dle.title')}
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
                <span className={`font-mono text-[10px] sm:text-xs uppercase px-2 py-0.5 border ${isWon ? 'border-system-green text-system-green bg-system-green/10' : 'border-system-glow/50 text-system-glow bg-system-glow/10'}`}>
                  {t('dle.status')}: {isWon ? t('dle.state_confirmed') : t('dle.state_in_progress')}
                </span>
                <span className="font-mono text-[10px] sm:text-xs text-system-glow/80 uppercase px-2 py-0.5 border border-system-glow/20">
                  {t('dle.attempts')}: {attempts.length}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="system-text hover:text-white transition-all text-xl sm:text-2xl p-1 sm:p-2 hover:bg-system-red/20 hover:border-system-red border border-transparent z-10 absolute right-2 sm:static">✕</button>
        </div>

        
        <div className="p-3 sm:p-6 flex-1 overflow-hidden flex flex-col gap-4 sm:gap-6 bg-vignette relative">
          <div className="absolute inset-0 bg-monarch-gradient opacity-20 pointer-events-none" />
          
        
          {!isWon && (
            <div className="relative z-20">
              <div className="flex items-center gap-2 sm:gap-3 bg-black/60 border border-system-glow/30 p-1 sm:p-2 focus-within:border-system-glow focus-within:shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-system-glow animate-pulse" />
                <Search className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-4 system-text opacity-70 shrink-0" />
                <input 
                  type="text"
                  value={searchTerm}
                  disabled={mutation.isPending}
                  placeholder={mutation.isPending ? t('dle.processing') : t('dle.placeholder')}
                  className="w-full bg-transparent p-2 sm:p-3 text-white font-mono text-sm sm:text-base tracking-wider placeholder:text-system-glow/40 focus:outline-none uppercase"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {filteredCharacters.length > 0 && (
                <div className="absolute w-full mt-2 system-panel border border-system-glow/50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-2 bg-black/95 z-50 max-h-[40vh] overflow-y-auto">
                  {filteredCharacters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => mutation.mutate(char.id)}
                      className="w-full flex items-center p-2 sm:p-3 hover:bg-system-glow/20 border-b border-system-glow/20 last:border-none group transition-all"
                    >
                      <div className="w-10 h-10 sm:w-14 sm:h-14 border border-system-glow/40 overflow-hidden bg-black relative shrink-0">
                        <div className="absolute inset-0 bg-system-glow/10 group-hover:bg-transparent transition-colors z-10" />
                         <img 
                            src={getAssetUrl(char.image_key)} 
                            alt={char.name_data} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            onError={(e) => { e.currentTarget.src = getAssetUrl(null); }}
                          />
                      </div>
                      <span className="ml-3 sm:ml-5 font-system text-sm sm:text-lg system-text tracking-widest uppercase group-hover:text-white group-hover:text-glow-strong transition-all text-left">
                        {char.name_data}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        
          {isWon && (
            <div className="system-glass border-system-green/50 p-4 sm:p-6 text-center animate-pulse-glow relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-system-green opacity-30" />
              <Fingerprint className="w-8 h-8 sm:w-12 sm:h-12 text-system-green mx-auto mb-2 animate-bounce" />
              <h3 className="font-system text-2xl sm:text-4xl text-system-green tracking-[0.15em]">{t('dle.confirmed')}</h3>
              <p className="font-mono text-system-green/80 text-xs sm:text-sm mt-2 sm:mt-3 uppercase tracking-widest">{t('dle.confirmed')}</p>
            </div>
          )}

        
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative z-10">
            {isLoadingStatus ? (
               <div className="flex flex-col justify-center items-center h-full gap-4 sm:gap-6">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 system-text animate-spin opacity-50" />
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 system-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <span className="font-mono system-text text-xs sm:text-sm tracking-widest animate-pulse text-center px-4">{t('dle.syncing')}</span>
               </div>
            ) : (
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[650px] lg:min-w-0 space-y-3 sm:space-y-4">
                  
        
                  <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] gap-2 sm:gap-3 text-[10px] sm:text-xs font-mono system-text text-center border-b border-system-glow/30 pb-2 sm:pb-3 uppercase tracking-widest px-1 sm:px-2">
                    <div className="text-left pl-2">{t('dle.subject')}</div>
                    <div>{t('dle.race')}</div>
                    <div>{t('dle.rank')}</div>
                    <div>{t('dle.class')}</div>
                    <div>{t('dle.affiliation')}</div>
                    <div>{t('dle.state')}</div>
                  </div>

        
                  {attempts.map((attempt, index) => {
                    const isFullMatch = attempt.race.result === 'correct' && attempt.rank.result === 'correct' && attempt.class.result === 'correct' && attempt.affiliation.result === 'correct';
                    
                    return (
                      <div 
                        key={index} 
                        className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr] gap-2 sm:gap-3 p-1 sm:p-2 border bg-black/40 backdrop-blur-sm animate-slide-in group hover:bg-black/60 transition-all duration-300
                          ${isFullMatch ? 'border-system-green/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-system-glow/20 hover:border-system-glow/50'}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
        
                        <div className="h-20 sm:h-24 system-glass border border-system-glow/20 flex flex-col relative overflow-hidden group-hover:border-system-glow/50 transition-colors">
                            <img 
                                src={getAssetUrl(attempt.image_key)} 
                                alt={attempt.name} 
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                                onError={(e) => { e.currentTarget.src = getAssetUrl(null); }}
                              />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 w-full p-1 sm:p-2 border-t border-system-glow/20 bg-black/60 backdrop-blur-md">
                              <span className="block font-system text-[10px] sm:text-xs text-white uppercase truncate leading-tight">{attempt.name}</span>
                            </div>
                        </div>
                        
        
                        <AttributeCell label={t('dle.race')} match={attempt.race} /> 
                        <AttributeCell label={t('dle.rank')} match={attempt.rank} />
                        <AttributeCell label={t('dle.class')} match={attempt.class} />
                        <AttributeCell label={t('dle.affiliation')} match={attempt.affiliation} />
                        
        
                        <div className={`h-20 sm:h-24 flex flex-col items-center justify-center border transition-all duration-700 relative overflow-hidden
                          ${isFullMatch 
                          ? 'bg-system-green/10 border-system-green shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]' 
                          : 'bg-system-red/5 border-system-red/20'}`}>
                            
                            {isFullMatch && <div className="absolute inset-0 bg-system-green/20 animate-pulse" />}
                            
                            <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                              {isFullMatch ? 
                                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-system-green drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" /> : 
                                <Ban className="w-5 h-5 sm:w-6 sm:h-6 text-system-red/50" />
                              }
                              <span className={`font-mono text-[8px] sm:text-[9px] uppercase tracking-widest px-1 sm:px-2 py-0.5 sm:py-1 border 
                                ${isFullMatch ? 'text-system-green border-system-green/50 bg-black/50' : 'text-system-red/50 border-system-red/20'}`}>
                                {isFullMatch ? t('dle.ok') : t('dle.fail')}
                              </span>
                            </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};


const AttributeCell = ({ label, match }: { label: string, match: AttributeComparison }) => {
  const styles = {
    correct: 'bg-system-green/20 border-system-green text-system-green shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]',
    incorrect: 'bg-black/50 border-system-glow/10 text-system-glow/40 grayscale',
    higher: 'bg-system-gold/10 border-system-gold/50 text-system-gold shadow-[inset_0_0_10px_rgba(250,204,21,0.1)] animate-pulse-glow',
    lower: 'bg-system-gold/10 border-system-gold/50 text-system-gold shadow-[inset_0_0_10px_rgba(250,204,21,0.1)] animate-pulse-glow',
    partial: 'bg-system-gold/20 border-system-gold text-system-gold'
  };

  return (
    <div className={`h-20 sm:h-24 flex flex-col relative border transition-all duration-500 overflow-hidden group-hover:brightness-110 ${styles[match.result] || styles.incorrect}`}>
      

      <div className="bg-black/60 border-b border-inherit px-1 py-0.5 w-full text-center">
        <span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.1em] sm:tracking-[0.2em] opacity-70 truncate block">{label}</span>
      </div>


      <div className="flex-1 flex flex-col items-center justify-center p-1 relative z-10">
        <span className={`font-system text-[10px] sm:text-xs uppercase text-center leading-tight ${match.result === 'correct' ? 'text-glow-strong' : ''}`}>
          {match.value.es}
        </span>
        

        <div className="mt-1 flex items-center justify-center h-4 sm:h-5">
          {match.result === 'higher' && <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-system-gold animate-bounce" />}
          {match.result === 'lower' && <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-system-gold animate-bounce" />}
          {match.result === 'correct' && (
            <div className="w-4 sm:w-6 h-[1px] bg-system-green shadow-[0_0_8px_rgba(16,185,129,1)] relative">
              <div className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-system-green rounded-full left-1/2 -translate-x-1/2 -top-0.5 sm:-top-1 shadow-[0_0_10px_rgba(16,185,129,1)]" />
            </div>
          )}
        </div>
      </div>
      

      <div className="absolute left-0 top-0 w-full h-[1px] bg-white/20 opacity-0 group-hover:animate-scanline-fast" />
    </div>
  );
};



export default DleModal;
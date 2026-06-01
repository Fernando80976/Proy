import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Landmark, Moon, Lock, Skull, Layers, Zap, Loader2, AlertTriangle } from 'lucide-react';
import { DungeonService } from '../../services/DungeonService';
import BattleModal from '../../components/game/ModalBattle';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import PreLoader from '../../components/common/Preloader';
import { useSystemNotify } from '../../context/notifications/SystemNotifyContext';


interface Dungeon {
  id: number;
  name: string;
  rank: string;
  recommendedLevel: number;
  floors: number;
  boss: string;
  rewards: {
    exp: number;
  };
}


interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  textColor: string;
  glow?: boolean; 
}

const DungeonsPanel = () => {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const currentLang = (i18n.language?.split('-')[0] || 'es') as 'es' | 'en';


  const { showNotify } = useSystemNotify();

  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);

  
  const { data: player, isLoading, error } = useQuery({
    queryKey: ['playerProfile'], 
    queryFn: DungeonService.getProfile,
    staleTime: 1000 * 60 * 5, 
  });

  
  const { data: dungeonCatalog = [] , isLoading: isDungeonCatalogLoading } = useQuery({
    queryKey: ['dungeonsCatalog'],
    queryFn: DungeonService.getDungeons,
    staleTime: 1000 * 60 * 5,
  
    select: (data) => data.sort((a, b) => a.min_level - b.min_level), 
  });

  
  const restMutation = useMutation({
    mutationFn: DungeonService.rest,
    onSuccess: () => {
  
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorCode = err.response?.data?.mensaje || err.response?.data?.detail;
          showNotify(
          `${t(`backend_errors.${errorCode}`)}`,
          "error",
          "'ERROR EN EL SISTEMA'"
          );
      }
    }
  });

  if (isLoading || isDungeonCatalogLoading) {
    return (
      <div className="min-h-300 bg-background flex items-center justify-center p-4 sm:p-6">
        <PreLoader message={t('dungeons.sync_message')} />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="system-panel m-4 p-6 border-red-500/50 text-red-400 font-mono text-center flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12" />
        <p className="uppercase tracking-widest text-sm sm:text-base">{t('dungeons.connection_lost')}</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['playerProfile'] })} className="border border-red-500/40 px-4 py-2 hover:bg-red-500/10 transition-colors text-xs">{t('dungeons.reconnect')}</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
  
      <div className="system-panel p-4 sm:p-6 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md relative overflow-hidden">
  
        {restMutation.isPending && (
          <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-system-glow" />
          </div>
        )}

  
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-mono system-text tracking-[0.15em] sm:tracking-[0.3em] flex items-center gap-2 sm:gap-3">
              <Landmark className="text-system-glow w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> {t('dungeons.title')}
            </h2>
            <p className="text-[12px] text-muted-foreground uppercase font-mono mt-1">{t('dungeons.status_operational')}</p>
          </div>
          
          <button 
            onClick={() => restMutation.mutate()}
            disabled={restMutation.isPending}
            className="w-full sm:w-auto justify-center px-6 py-2.5 sm:py-2 border font-mono text-xs transition-all rounded-md flex items-center gap-2 border-system-glow/40 text-system-glow hover:bg-system-glow/10 active:scale-95"
          >
            <Moon className="w-4 h-4" /> {restMutation.isPending ? t('dungeons.button_restoring') : t('dungeons.button_rest')}
          </button>
        </div>
        
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
           <DungeonStatBar 
             label={t('dungeons.health_label')} 
             current={player.hp_current} 
             max={player.hp_max} 
             color="bg-red-500" 
             textColor="text-red-400"
           />
           <DungeonStatBar 
             label={t('dungeons.fatigue_label')} 
             current={player.fatigue} 
             max={player.fatigue_max} 
             color="bg-system-glow" 
             textColor="text-system-glow"
             glow
           />
        </div>
      </div>

  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {dungeonCatalog.map(dungeon => {
          const isLocked = player.level < dungeon.min_level;
          
  
          const displayName = typeof dungeon.name === 'string' 
            ? dungeon.name 
            : (dungeon.name?.[currentLang] || dungeon.name?.es || t('dungeons.unknown_dungeon'));
          
          return (
            <div 
              key={dungeon.id}
              onClick={() => {
                if (isLocked) return;

  
                const formattedDungeon: Dungeon = {
                  id: dungeon.id,
                  name: displayName,
                  rank: dungeon.rank,
                  recommendedLevel: dungeon.min_level,
                  floors: dungeon.max_enemies,
                  boss: dungeon.boss_id ? `${t('dungeons.boss_prefix')}#${dungeon.boss_id}` : t('dungeons.unknown_boss'),
                  rewards: { exp: 0 },
                };

                
                setSelectedDungeon(formattedDungeon);
              }}
              className={`group relative p-5 sm:p-6 rounded-xl border transition-all duration-300 ${
                isLocked 
                  ? 'bg-black/20 border-white/5 opacity-60 cursor-not-allowed grayscale' 
                  : 'bg-white/5 border-white/10 hover:border-system-glow/50 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <div className="flex justify-between mb-4">
                <Skull className={`${isLocked ? 'text-muted-foreground' : 'text-system-glow'} w-5 h-5 sm:w-6 sm:h-6`} />
                <span className={`font-black font-mono text-lg sm:text-xl ${isLocked ? 'text-muted-foreground' : 'text-system-glow'}`}>
                  {dungeon.rank}
                </span>
              </div>
              
              <h3 className="font-bold text-sm sm:text-base text-white mb-4 uppercase tracking-tighter group-hover:text-system-glow transition-colors line-clamp-2 min-h-10 sm:min-h-12">
                {displayName}
              </h3>

              <div className="flex justify-between items-center text-[12.5px] font-mono text-muted-foreground uppercase pt-4 border-t border-white/5">
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {t('dungeons.floors_template', { count: dungeon.max_enemies })}</span>
                <span className={isLocked ? 'text-red-500' : 'text-system-glow'}>
                  {isLocked ? <Lock className="w-3.5 h-3.5 inline mr-1" /> : <Zap className="w-3.5 h-3.5 inline mr-1 text-system-gold" />}
                  {t('dungeons.rec_level', { level: dungeon.min_level })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      
      {selectedDungeon && (
        <BattleModal 
          dungeon={selectedDungeon} 
          onClose={() => {
            setSelectedDungeon(null);
            queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
            queryClient.invalidateQueries({ queryKey: ['skills'] });
            queryClient.invalidateQueries({ queryKey: ['playerTitles'] });
            queryClient.invalidateQueries({ queryKey: ['hunter-missions'] });
          }} 
        />
      )}
    </div>
  );
};


const DungeonStatBar = ({ label, current, max, color, textColor, glow }: StatBarProps) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[12px] font-mono uppercase tracking-widest text-muted-foreground">
      <span>{label}</span>
      <span className={`${textColor} font-bold`}>{current} / {max}</span>
    </div>
    <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 p-[1px]">
      <div 
        className={`h-full transition-all duration-700 ease-out rounded-full ${color} ${glow ? 'shadow-[0_0_10px_#00ffff]' : ''}`} 
        style={{ width: `${Math.min((current / max) * 100, 100)}%` }} 
      />
    </div>
  </div>
);

export default DungeonsPanel;
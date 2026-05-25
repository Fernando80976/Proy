import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Landmark, Moon, Lock, Skull, Layers, Zap, Loader2, AlertTriangle } from 'lucide-react';
import { DungeonService } from '../../services/DungeonService';
import BattleModal from '../../components/game/ModalBattle';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import PreLoader from '../../components/common/Preloader';

// Define la estructura de una mazmorra del catálogo
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

// Define las props que recibe el componente de la barra
interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  textColor: string;
  glow?: boolean; // El signo ? significa que es opcional
}

const DungeonsPanel = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);

  // 1. Obtener perfil del cazador (Compartido con StatusWindow)
  const { data: player, isLoading, error } = useQuery({
    queryKey: ['playerProfile'], // Misma clave que en StatusWindow para compartir caché
    queryFn: DungeonService.getProfile,
    staleTime: 1000 * 60 * 5, 
  });

  const { data: dungeonCatalog = [] , isLoading: isDungeonCatalogLoading } = useQuery({
    queryKey: ['dungeonsCatalog'],
    queryFn: DungeonService.getDungeons,
    staleTime: 1000 * 60 * 5,
    select: (data): Dungeon[] =>
      data.map((d) => {
        const parsedName = typeof d.name === 'string' ? d.name : d.name?.es || d.name?.en || 'Unknown Dungeon';
        return {
          id: d.id,
          name: parsedName,
          rank: d.rank,
          recommendedLevel: d.min_level,
          floors: d.max_enemies,
          boss: d.boss_id ? `Boss #${d.boss_id}` : 'Unknown Boss',
          rewards: { exp: 0 },
        };
      }),
  });

  // 2. Mutación para la acción de Descansar (Rest)
  const restMutation = useMutation({
    mutationFn: DungeonService.rest,
    onSuccess: () => {
      // Invalidamos la caché para que el HUD se actualice con la vida llena y fatiga 0
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorCode = err.response?.data?.mensaje || err.response?.data?.detail;
        alert(`[SYSTEM ERROR]: ${t(`backend_errors.${errorCode}`)}`);
      }
    }
  });

  if (isLoading || isDungeonCatalogLoading) {
    return (
      <div className="min-h-100 bg-background flex items-center justify-center p-6">
        <PreLoader message="Sincronizando Con el Sistema..." />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="system-panel p-6 border-red-500/50 text-red-400 font-mono text-center flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12" />
        <p className="uppercase tracking-widest">Connection to the System Lost</p>
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['playerProfile'] })} className="border border-red-500/40 px-4 py-2 hover:bg-red-500/10 transition-colors text-xs">RECONNECT</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* HUD de Estado: Sincronizado con el Sistema */}
      <div className="system-panel p-6 bg-black/40 border border-white/10 rounded-xl backdrop-blur-md relative overflow-hidden">
        {/* Indicador de carga de mutación */}
        {restMutation.isPending && (
          <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-system-glow" />
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-mono system-text tracking-[0.3em] flex items-center gap-3">
              <Landmark className="text-system-glow" /> GATE SELECTION
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase font-mono mt-1">Status: Operational</p>
          </div>
          
          <button 
            onClick={() => restMutation.mutate()}
            disabled={restMutation.isPending}
            className={`px-6 py-2 border font-mono text-xs transition-all rounded-md flex items-center gap-2 border-system-glow/40 text-system-glow hover:bg-system-glow/10 active:scale-95 `}
          >
            <Moon className="w-4 h-4" /> {restMutation.isPending ? 'RESTORING...' : 'REST'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <DungeonStatBar 
             label="Hunter Health" 
             current={player.hp_current} 
             max={player.hp_max} 
             color="bg-red-500" 
             textColor="text-red-400"
           />
           <DungeonStatBar 
             label="Physical Fatigue" 
             current={player.fatigue} 
             max={player.fatigue_max} 
             color="bg-system-glow" 
             textColor="text-system-glow"
             glow
           />
        </div>
      </div>

      {/* Grid de Mazmorras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dungeonCatalog.map(dungeon => {
          const isLocked = player.level < dungeon.recommendedLevel;
          
          return (
            <div 
              key={dungeon.id}
              onClick={() => !isLocked && setSelectedDungeon(dungeon)}
              className={`group relative p-6 rounded-xl border transition-all duration-300 ${
                isLocked 
                  ? 'bg-black/20 border-white/5 opacity-60 cursor-not-allowed grayscale' 
                  : 'bg-white/5 border-white/10 hover:border-system-glow/50 hover:bg-white/10 cursor-pointer'
              }`}
            >
              <div className="flex justify-between mb-4">
                <Skull className={`${isLocked ? 'text-muted-foreground' : 'text-system-glow'} w-6 h-6`} />
                <span className={`font-black font-mono text-xl ${isLocked ? 'text-muted-foreground' : 'text-system-glow'}`}>
                  {dungeon.rank}
                </span>
              </div>
              
              <h3 className="font-bold text-base text-white mb-4 uppercase tracking-tighter group-hover:text-system-glow transition-colors">
                {dungeon.name}
              </h3>

              <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground uppercase pt-4 border-t border-white/5">
                <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {dungeon.floors} FLOORS</span>
                <span className={isLocked ? 'text-red-500' : 'text-system-glow'}>
                  {isLocked ? <Lock className="w-3 h-3 inline mr-1" /> : <Zap className="w-3 h-3 inline mr-1 text-system-gold" />}
                  REC. LVL: {dungeon.recommendedLevel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE COMBATE */}
      {selectedDungeon && (
        <BattleModal 
          dungeon={selectedDungeon} 
          onClose={() => {
            setSelectedDungeon(null);
            // Al cerrar el combate, forzamos refresco para ver la nueva fatiga o nivel
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

// Sub-componente para las barras de estado (DRY - Don't Repeat Yourself)
const DungeonStatBar = ({ label, current, max, color, textColor, glow }: StatBarProps) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
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
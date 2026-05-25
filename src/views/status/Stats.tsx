import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Swords, Wind, Heart, Brain, Eye, Star, Crown, Shield, AlertTriangle, Loader2, Check, RotateCcw, X, ChevronRight, Trophy, Coins } from 'lucide-react';
import { hunterService } from '../../services/StatusService'; 
import axios from 'axios';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TitleSelectorModal from '../../components/game/ModalTittleSelect';
import PreLoader from '../../components/common/Preloader';
import { useSystemNotify } from '../../context/notifications/SystemNotifyContext';
import { toastNotification } from '../../components/common/ToastNotification';
import { type BackendErrorKey } from '../../types/TranslationsTypes';

const STAT_CONFIG = [
  { key: 'strength' as const, label: 'STR', icon: <Swords className="w-4 h-4" />, color: 'text-red-400', barColor: 'bg-red-400' },
  { key: 'agility' as const, label: 'AGI', icon: <Wind className="w-4 h-4" />, color: 'text-green-400', barColor: 'bg-green-400' },
  { key: 'vitality' as const, label: 'VIT', icon: <Heart className="w-4 h-4" />, color: 'text-orange-400', barColor: 'bg-orange-400' },
  { key: 'intelligence' as const, label: 'INT', icon: <Brain className="w-4 h-4" />, color: 'text-blue-400', barColor: 'bg-blue-400' },
  { key: 'sense' as const, label: 'PER', icon: <Eye className="w-4 h-4" />, color: 'text-purple-400', barColor: 'bg-purple-400' },
];

const StatusWindow = () => {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language; 
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { showNotify } = useSystemNotify();

  const [tempStats, setTempStats] = useState({
    strength: 0, agility: 0, vitality: 0, intelligence: 0, sense: 0
  });

  // 1. Perfil del jugador
  const { data: player, isLoading: isLoadingPlayer, error: playerError } = useQuery({
    queryKey: ['playerProfile'],
    queryFn: hunterService.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  // 2. Mutación de Stats
  const mutation = useMutation({
    mutationFn: (stats: typeof tempStats) => hunterService.updateStats(stats),
    onSuccess: () => {
      toastNotification.success("ESTADÍSTICAS ACTUALIZADAS", "Tus puntos de habilidad se han asignado correctamente.");
      setTempStats({ strength: 0, agility: 0, vitality: 0, intelligence: 0, sense: 0 });
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
      
      queryClient.invalidateQueries({ queryKey: ['global-ranking'] });
      queryClient.invalidateQueries({ queryKey: ['my-ranking-position'] });
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorCode : BackendErrorKey = err.response?.data?.mensaje || err.response?.data?.detail;
        showNotify(
          `${t(`backend_errors.${errorCode}`)}`,
          "error",
          "'ERROR EN EL SISTEMA'"
        );
        
      } else {
          showNotify(
          `${t('backend_errors.ERR_INTERNAL_SYSTEM')}`,
          "error",
          "'ERROR EN EL SISTEMA'"
        );
      }
      setTempStats({ strength: 0, agility: 0, vitality: 0, intelligence: 0, sense: 0 });
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
    }
  });

  // 3. Obtener catálogo de títulos
  const { data: titles, error: titlesError, isLoading: isLoadingTitles } = useQuery({
    queryKey: ['playerTitles'],
    queryFn: hunterService.getAllTitles,
    staleTime: 1000 * 60 * 5
  });

  // 4. Mutación de Título
  const titleMutation = useMutation({
    mutationFn: (id: number) => hunterService.updateActiveTitle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorCode : BackendErrorKey = err.response?.data?.mensaje || err.response?.data?.detail;
        showNotify(
          `${t(`backend_errors.${errorCode}`)}`,
          "error",
          "'ERROR EN EL SISTEMA'"
        );
        
      } else {
          showNotify(
          `${t('backend_errors.ERR_INTERNAL_SYSTEM')}`,
          "error",
          "'ERROR EN EL SISTEMA'"
        );
      }
      setIsModalOpen(false);
    }
  });
  
  // LÓGICA DE TÍTULO TRADUCIDO DESDE EL BACK
  const getActiveTitleName = () => {
    if (!player?.active_title_id) return t('status.no_title');
    if (isLoadingTitles) return t('status.loading');
    if (titlesError) return t('status.error_titles');
    const active = titles?.find(t => t.id === player.active_title_id);
    return active ? active.name[i18n.language] : "Unknown Title"; 
  };

  const currentTitleName = getActiveTitleName();
  
  if (isLoadingPlayer || isLoadingTitles) {
    return (
      <div className="min-h-250 bg-background flex items-center justify-center p-6">
        <PreLoader message="Sincronizando Con el Sistema..." />
      </div>
    );
  }

  if (playerError || !player) {
    let errorKey : BackendErrorKey = "ERR_INTERNAL_SYSTEM";
    if (axios.isAxiosError(playerError)) {
      errorKey = playerError.response?.data?.mensaje || playerError.response?.data?.detail;
    }
    return (
      <div className="system-panel p-6 border-red-500/50 text-red-400 font-mono text-center h-86 flex flex-col items-center justify-center gap-2">
        <AlertTriangle className="w-16 h-16 mx-auto mb-2" />
        <p className="uppercase tracking-tighter text-lg mb-1">System Failure</p>
        <p className="font-bold text-xl">{t(`backend_errors.${errorKey}`)}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-[20px] border border-red-500/50 px-2 py-1 hover:bg-red-500/10"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  // --- LÓGICA DE SIMULACIÓN PARA UI ---
  const spentPoints = Object.values(tempStats).reduce((a, b) => a + b, 0);
  const remainingPoints = player.stat_points - spentPoints;

  // Cálculo de simulación de HP y MP (Igual que el backend)
  const simulatedHpMax = player.hp_max + (tempStats.vitality * 15);
  const simulatedMpMax = player.mp_max + (tempStats.intelligence * 5);
  
  // Si estaba lleno, simulamos que sigue lleno con el nuevo tope
  const simulatedHpCurrent = player.hp_current >= player.hp_max ? simulatedHpMax : player.hp_current;
  const simulatedMpCurrent = player.mp_current >= player.mp_max ? simulatedMpMax : player.mp_current;

  const expPercentage = Math.floor((player.experience / player.exp_next_level) * 100);
  const hpPercentage = (simulatedHpCurrent / simulatedHpMax) * 100;
  const mpPercentage = (simulatedMpCurrent / simulatedMpMax) * 100;
  const fatiguePercentage = (player.fatigue / player.fatigue_max) * 100;

  const handleAddStat = (key: keyof typeof tempStats) => {
    if (remainingPoints > 0) {
      setTempStats(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  const handleResetStat = (key: keyof typeof tempStats) => {
    setTempStats(prev => ({ ...prev, [key]: 0 }));
  };

  const handleResetAll = () => {
    setTempStats({ strength: 0, agility: 0, vitality: 0, intelligence: 0, sense: 0 });
  };

  const fatigueColor = player.fatigue >= 70 ? 'text-orange-500' : 'text-yellow-400';
  const fatigueBarColor = player.fatigue >= 85 ? 'from-red-600 to-orange-500' : 'from-yellow-600 to-yellow-400';

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      
      {/* Tarjeta de Información */}
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-system system-text uppercase tracking-widest flex items-center gap-2">
            <Crown className="w-6 h-6 animate-float" />
            {t('status.titulo')}
          </h2>
          {player.fatigue >= 80 && (
            <div className="flex items-center gap-2 text-red-500 animate-pulse font-data text-sm border border-red-500/50 px-3 py-1 rounded bg-red-500/10">
              <AlertTriangle className="w-4 h-4" />
              {t('status.advertencia_fatiga')}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold text-foreground font-sans tracking-tight">{player.username}</h3>
              
              <div className="relative mt-6 group">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="relative flex items-center gap-3 px-4 py-2 rounded-md bg-system-glow/5 border border-system-glow/20 hover:border-system-glow/50 hover:bg-system-glow/10 transition-all duration-300 group/btn"
                >
                  <span className="absolute -top-2.5 left-2 px-2 bg-background text-[10px] font-mono text-system-glow uppercase tracking-widest border-x border-system-glow/20">
                    {t('status.titulo_actual')}
                  </span>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-system-gold/80 group-hover/btn:text-system-gold transition-colors" />
                    <span className={`text-sm font-data font-bold italic tracking-wide transition-colors duration-300 ${
                      titlesError ? 'text-red-500 animate-pulse' : 'text-white'
                    }`}>
                      {currentTitleName}
                    </span>
                  </div>
                  <div className="flex items-center ml-2 pl-2 border-l border-white/10">
                    <ChevronRight className="w-4 h-4 text-system-glow/40 group-hover/btn:translate-x-0.5 group-hover/btn:text-system-glow transition-all" />
                  </div>
                  {/* Detalles del título */}
                  {/* <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-system-glow/40" />
                  <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-system-glow/40" />*/}
                </button> 
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Star className="w-6 h-6 text-system-gold animate-pulse" />
                <span className="text-3xl font-mono gold-text">Lv.{player.level}</span>
              </div>
              <span className="text-sm font-data font-bold uppercase text-system-glow border border-system-glow/30 px-3 py-0.5 rounded bg-system-glow/5">
                {t('status.rango')} {player.rank}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm bg-white/5 p-3 rounded border border-white/10">
            <Shield className="w-5 h-5 text-system-glow" />
            <span className="text-muted-foreground font-data font-bold uppercase text-xs tracking-widest">{t('status.clase')}</span>
            <span className="font-data text-sm text-system-glow font-bold uppercase">{player.class_name[currentLang] || 'NINGUNA'}</span>
          </div>

          <div className="grid gap-5">
            {/* HP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-data font-bold uppercase tracking-wider">
                <span className="text-red-400">{t('status.hp')}</span>
                <span className={`text-red-400 transition-colors ${tempStats.vitality > 0 ? 'text-system-glow' : ''}`}>
                   {simulatedHpCurrent} / {simulatedHpMax}
                   {tempStats.vitality > 0 && <span className="ml-2 font-mono text-xs"> (+{tempStats.vitality * 15})</span>}
                </span>
              </div>
              <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-red-500/20 p-[1px]">
                <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" style={{ width: `${hpPercentage}%` }} />
              </div>
            </div>

            {/* MP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-data font-bold uppercase tracking-wider">
                <span className="text-blue-400">{t('status.mp')}</span>
                <span className={`text-blue-400 transition-colors ${tempStats.intelligence > 0 ? 'text-system-glow' : ''}`}>
                  {simulatedMpCurrent} / {simulatedMpMax}
                  {tempStats.intelligence > 0 && <span className="ml-2 font-mono text-xs"> (+{tempStats.intelligence * 5})</span>}
                </span>
              </div>
              <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-blue-500/20 p-[1px]">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ width: `${mpPercentage}%` }} />
              </div>
            </div>

            {/* Fatigue */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-data font-bold uppercase tracking-wider">
                <span className={fatigueColor}>{t('status.fatiga')}</span>
                <span className={fatigueColor}>{player.fatigue} / {player.fatigue_max}</span>
              </div>
              <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-yellow-500/20 p-[1px]">
                <div className={`h-full rounded-full bg-gradient-to-r ${fatigueBarColor} transition-all duration-1000`} style={{ width: `${fatiguePercentage}%` }} />
              </div>
            </div>

            {/* EXP */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-data font-bold uppercase tracking-wider">
                <span className="text-system-glow">EXP ({player.experience} / {player.exp_next_level})</span>
                <span className="text-system-glow">{expPercentage}%</span>
              </div>
              <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-system-glow/20 p-[1px]">
                <div className="h-full rounded-full bg-system-glow shadow-[0_0_10px_rgba(0,229,255,0.4)] transition-all duration-1000" style={{ width: `${expPercentage}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-system-gold" />
              <span className="text-sm font-data font-bold uppercase text-muted-foreground tracking-widest">{t('status.oro')}</span>
            </div>
            <span className="text-xl font-mono gold-text font-bold">{player.gold.toLocaleString()} G</span>
          </div>
        </div>
      </div>

      {/* Panel de Estadísticas */}
      <div className="system-panel rounded-lg p-6 border-system-glow/20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-mono system-text uppercase tracking-[0.2em]">{t('status.atributos')}</h2>
          <div className="flex items-center gap-3">
            {spentPoints > 0 && (
              <button 
                onClick={handleResetAll}
                className="flex items-center gap-1.5 text-xs font-data font-bold text-red-400 hover:text-red-300 transition-colors uppercase border border-red-400/30 px-3 py-1 rounded bg-red-400/5 active:scale-95"
              >
                <X className="w-4 h-4" /> {t('status.reset_all')}
              </button>
            )}
            {remainingPoints > 0 && (
              <div className="flex items-center gap-2 bg-system-gold/10 px-4 py-1.5 rounded border border-system-gold/30 animate-pulse">
                <span className="text-xs font-data text-system-gold font-bold uppercase tracking-tight">
                  {t('status.puntos_disponibles')} {remainingPoints}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {STAT_CONFIG.map(({ key, label, icon, color, barColor }) => {
            const baseValue = player[key] as number;
            const extraValue = tempStats[key];
            const totalDisplay = baseValue + extraValue;
            // const maxStatValue = Math.max(
            //   player.strength,
            //   player.agility,
            //   player.vitality,
            //   player.intelligence,
            //   player.sense,
            //   100 // Mínimo visual para que nunca sea demasiado pequeño
            // );

            const maxStatValue = 300;

            return (
              <div key={key} className="flex items-center gap-6 group">
                <div className={`flex items-center gap-4 w-24 ${color}`}>
                  <div className="p-2 bg-white/5 rounded border border-white/5 group-hover:border-current transition-colors">
                    {icon}
                  </div>
                  <span className="text-lg font-mono tracking-tighter">{label}</span>
                </div>
                <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${barColor} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${Math.min((totalDisplay / maxStatValue) * 100, 100)}%` }} />
                </div>
                <div className="flex items-center gap-6 min-w-[160px] justify-end">
                  <span className={`font-mono text-xl font-bold w-16 text-right ${extraValue > 0 ? 'text-system-glow animate-pulse' : ''}`}>
                    {totalDisplay}
                  </span>
                  <div className="flex items-center gap-2 w-[70px] justify-start">
                        {remainingPoints > 0 && (
                        <button 
                            onClick={() => handleAddStat(key)}
                            disabled={mutation.isPending}
                            className="w-7 h-7 flex items-center justify-center rounded bg-system-glow/10 text-system-glow border border-system-glow/30 hover:bg-system-glow hover:text-black transition-all active:scale-90"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                        )}

                        {extraValue > 0 && (
                        <button 
                            onClick={() => handleResetStat(key)}
                            className="w-7 h-7 flex items-center justify-center rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-90"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón de Confirmar */}
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center gap-4">
          <p className={`text-xs font-data font-bold uppercase tracking-[0.2em] transition-opacity duration-500 ${
            spentPoints > 0 ? 'text-system-glow opacity-100 animate-pulse' : 'text-white/20 opacity-50'
          }`}>
            {spentPoints > 0 ? t('status.sincro_requerida') : t('status.esperando_puntos')}
          </p>
          
          <button
            onClick={() => spentPoints > 0 && mutation.mutate(tempStats)}
            disabled={mutation.isPending || spentPoints === 0}
            className={`relative group w-full max-w-sm overflow-hidden rounded-sm transition-all duration-500 ${
              spentPoints > 0 ? 'opacity-100 scale-100 cursor-pointer shadow-[0_0_25px_rgba(0,229,255,0.15)]' : 'opacity-30 scale-[0.98] cursor-not-allowed grayscale'
            }`}
          >
              {spentPoints > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-system-glow/30 to-transparent group-hover:animate-scan pointer-events-none z-10" />
              )}

              <div className={`relative flex items-center justify-center gap-4 py-4 font-system text-sm transition-all duration-300 border-2 ${
                spentPoints > 0 ? 'bg-black border-system-glow text-system-glow group-hover:bg-system-glow/10' : 'bg-white/5 border-white/10 text-white/30'
              }`}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="uppercase tracking-[0.3em] font-bold">{t('status.subiendo_datos')}</span>
                </>
              ) : (
                <>
                  <Check className={`w-5 h-5 ${spentPoints > 0 ? 'animate-bounce' : ''}`} />
                  <span className="uppercase tracking-[0.3em] font-bold">
                    {spentPoints > 0 ? t('status.aplicar') : t('status.seleccionar')}
                  </span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* MODAL DE TÍTULOS */}
      <TitleSelectorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        titles={titles} 
        activeTitleId={player?.active_title_id}
        onSelect={(id) => titleMutation.mutate(id)}
        isPending={titleMutation.isPending}
        errorMessege={titlesError}
      />
      
    </div>
  );
}

export default StatusWindow;
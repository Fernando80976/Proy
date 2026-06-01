import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Swords, Wind, Heart, Brain, Eye, Star, Crown, Shield, AlertTriangle, Loader2, Check, X, ChevronRight, Trophy, Coins, Zap, Target, Sword, Minus, ChartNoAxesColumn } from 'lucide-react';
import { hunterService } from '../../services/StatusService'; 
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TitleSelectorModal from '../../components/game/ModalTittleSelect';
import PreLoader from '../../components/common/Preloader';
import { useSystemNotify } from '../../context/notifications/SystemNotifyContext';
import { toastNotification } from '../../components/common/ToastNotification';
import { type BackendErrorKey } from '../../types/TranslationsTypes';
import StatTooltip from './StatsTooltip';


import { Joyride, STATUS, type EventData } from 'react-joyride';
import { getSystemTutorialSteps } from '../../tutorial/tutorialSteps';
import { joyrideOptions, joyrideStyles } from '../../tutorial/joyrideConfig';

const STAT_CONFIG = [
  { key: 'strength' as const, label: 'STR', icon: <Swords className="w-4 h-4" />, color: 'text-red-400', barColor: 'bg-red-400' },
  { key: 'agility' as const, label: 'AGI', icon: <Wind className="w-4 h-4" />, color: 'text-green-400', barColor: 'bg-green-400' },
  { key: 'vitality' as const, label: 'VIT', icon: <Heart className="w-4 h-4" />, color: 'text-orange-400', barColor: 'bg-orange-400' },
  { key: 'intelligence' as const, label: 'INT', icon: <Brain className="w-4 h-4" />, color: 'text-blue-400', barColor: 'bg-blue-400' },
  { key: 'sense' as const, label: 'PER', icon: <Eye className="w-4 h-4" />, color: 'text-purple-400', barColor: 'bg-purple-400' },
];

const CLASS_ICON_MAP: Record<string, React.ReactNode> = {
  "GUERRERO": <Sword className="w-5 h-5 text-system-glow" />,
  "ASESINO": <Swords className="w-5 h-5 text-system-glow" />,
  "MAGO": <Zap className="w-5 h-5 text-system-glow" />,
  "ARQUERO": <Target className="w-5 h-5 text-system-glow" />,
  "TANQUE": <Shield className="w-5 h-5 text-system-glow" />,
  "default": <Shield className="w-5 h-5 text-system-glow" />
};

const StatusWindow = () => {
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] ?? 'es';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showNotify } = useSystemNotify();

  const [tempStats, setTempStats] = useState({
    strength: 0, agility: 0, vitality: 0, intelligence: 0, sense: 0
  });

  const [assignMode, setAssignMode] = useState<'1' | '10' | 'max'>('1');

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  const { data: player, isLoading: isLoadingPlayer, error: playerError } = useQuery({
    queryKey: ['playerProfile'],
    queryFn: hunterService.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  
  const handleJoyrideCallback = async (data: EventData) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      try {
        await hunterService.markTutorialComplete();
        queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
      } catch (error) {
        console.error('Error marking tutorial as complete:', error);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: (stats: typeof tempStats) => hunterService.updateStats(stats),
    onSuccess: () => {
      toastNotification.success(t('status.stats_updated'), t('status.stats_updated_message'));
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

  const { data: titles, error: titlesError, isLoading: isLoadingTitles } = useQuery({
    queryKey: ['playerTitles'],
    queryFn: hunterService.getAllTitles,
    staleTime: 1000 * 60 * 5
  });

  const titleMutation = useMutation({
    mutationFn: (id: number) => hunterService.updateActiveTitle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const errorCode : BackendErrorKey = err.response?.data?.mensaje || err.response?.data?.detail;
        
        if (err.response?.status === 401) {
          return;
        }
        
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

  const getActiveTitleName = () => {
    if (!player?.active_title_id) return t('status.no_title');
    if (isLoadingTitles) return t('status.loading');
    if (titlesError) return t('status.error_titles');
    const active = titles?.find(t => t.id === player.active_title_id);
    return active ? active.name[currentLang] || active.name.es : t('status.no_title'); 
  };

  const currentTitleName = getActiveTitleName();
  
  if (isLoadingPlayer || isLoadingTitles) {
    return (
      <div className="min-h-300 bg-background flex items-center justify-center p-6">
        <PreLoader message={t('class.loading_sync')} />
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
        <p className="uppercase tracking-tighter text-lg mb-1">{t('status.system_failure')}</p>
        <p className="font-bold text-xl">{t(`backend_errors.${errorKey}`)}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 text-[20px] border border-red-500/50 px-2 py-1 hover:bg-red-500/10"
        >
          {t('status.retry_connection')}
        </button>
      </div>
    );
  }

  const spentPoints = Object.values(tempStats).reduce((a, b) => a + b, 0);
  const remainingPoints = player.stat_points - spentPoints;

  const simulatedHpMax = player.hp_max + (tempStats.vitality * 15);
  const simulatedMpMax = player.mp_max + (tempStats.intelligence * 5);
  
  const simulatedHpCurrent = player.hp_current >= player.hp_max ? simulatedHpMax : player.hp_current;
  const simulatedMpCurrent = player.mp_current >= player.mp_max ? simulatedMpMax : player.mp_current;

  const expPercentage = Math.floor((player.experience / player.exp_next_level) * 100);
  const hpPercentage = (simulatedHpCurrent / simulatedHpMax) * 100;
  const mpPercentage = (simulatedMpCurrent / simulatedMpMax) * 100;
  const fatiguePercentage = (player.fatigue / player.fatigue_max) * 100;

  const handleAddStat = (key: keyof typeof tempStats) => {
    if (remainingPoints <= 0) return;
    let pointsToAdd = 1;
    if (assignMode === '10') pointsToAdd = Math.min(10, remainingPoints);
    else if (assignMode === 'max') pointsToAdd = remainingPoints;
    setTempStats(prev => ({ ...prev, [key]: prev[key] + pointsToAdd }));
  };

  const handleRemoveStat = (key: keyof typeof tempStats) => {
    const extraValue = tempStats[key];
    if (extraValue <= 0) return;
    let pointsToRemove = 1;
    if (assignMode === '10') pointsToRemove = Math.min(10, extraValue);
    else if (assignMode === 'max') pointsToRemove = extraValue;
    setTempStats(prev => ({ ...prev, [key]: prev[key] - pointsToRemove }));
  };

  const handleResetAll = () => {
    setTempStats({ strength: 0, agility: 0, vitality: 0, intelligence: 0, sense: 0 });
  };

  const fatigueColor = player.fatigue >= 70 ? 'text-orange-500' : 'text-yellow-400';
  const fatigueBarColor = player.fatigue >= 85 ? 'from-red-600 to-orange-500' : 'from-yellow-600 to-yellow-400';
  const rawClassName = player.class_name?.es?.toUpperCase() || "DEFAULT";
  const ClassIcon = CLASS_ICON_MAP[rawClassName] || CLASS_ICON_MAP["default"];
  const ClassNameHpMp = `text-xs font-data font-bold uppercase tracking-wider`;

  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-fade-in-up">
      
      
      <Joyride
        continuous={true}
        steps={getSystemTutorialSteps(t, windowWidth)}
        run={!!player && !player.has_completed_tutorial}
        onEvent={handleJoyrideCallback}
        options={joyrideOptions}
        locale={{
          back: t('tutorial.back', 'Atrás'),
          close: t('tutorial.close', 'Entendido'),
          last: t('tutorial.last', 'Finalizar Registro'),
          next: t('tutorial.next', 'Siguiente'),
          skip: t('tutorial.skip', 'Omitir Sistema'),
        }}
        styles={joyrideStyles}
      />

      <div className="system-panel rounded-lg p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-3">
          <h2 className="text-lg md:text-xl font-system system-text uppercase tracking-widest flex items-center gap-2">
            <Crown className="w-5 h-5 md:w-6 md:h-6 animate-float" />
            {t('status.titulo')}
          </h2>
          {player.fatigue >= 80 && (
            <div className="flex items-center justify-center gap-2 text-red-500 animate-pulse font-data text-xs md:text-sm border border-red-500/50 px-3 py-1 rounded bg-red-500/10 w-full sm:w-auto">
              <AlertTriangle className="w-4 h-4" />
              {t('status.advertencia_fatiga')}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground font-sans tracking-tight truncate">
                {player.username}
              </h3>
              
              <div className="relative mt-4 md:mt-6 group w-max">
                <button 
                  id="tutorial-title-btn"
                  onClick={() => setIsModalOpen(true)}
                  className="relative flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-2 rounded-md bg-system-glow/5 border border-system-glow/20 hover:border-system-glow/50 hover:bg-system-glow/10 transition-all duration-300 group/btn"
                >
                  <span className="absolute -top-2.5 left-2 px-2 bg-background text-[9px] md:text-[10px] font-mono text-system-glow uppercase tracking-widest border-x border-system-glow/20">
                    {t('status.titulo_actual')}
                  </span>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4 text-system-gold/80 group-hover/btn:text-system-gold transition-colors" />
                    <span className={`text-xs md:text-sm font-data font-bold italic tracking-wide transition-colors duration-300 ${
                      titlesError ? 'text-red-500 animate-pulse' : 'text-white'
                    }`}>
                      {currentTitleName}
                    </span>
                  </div>
                  <div className="flex items-center pl-2 border-l border-white/10">
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-system-glow/40 group-hover/btn:translate-x-0.5 group-hover/btn:text-system-glow transition-all" />
                  </div>
                </button> 
              </div>
            </div>
            
            <div className="text-left md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-2 border-t border-white/10 md:border-0 pt-4 md:pt-0">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 md:w-6 md:h-6 text-system-gold animate-pulse" />
                <span className="text-2xl md:text-3xl font-mono gold-text">Lv.{player.level}</span>
              </div>
              <span className="text-xs md:text-sm font-data font-bold uppercase text-system-glow border border-system-glow/30 px-3 py-0.5 rounded bg-system-glow/5">
                {t('status.rango')} {player.rank}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm bg-white/5 p-2 md:p-3 rounded border border-white/10 overflow-hidden">
            {ClassIcon}
            <span className="text-muted-foreground font-data font-bold uppercase tracking-widest shrink-0">
              {t('status.clase')}
            </span>
            <span className="font-data text-system-glow font-bold uppercase truncate">
              {player.class_name[currentLang] || t('status.no_class')}
            </span>
          </div>

          <div className="grid gap-4 md:gap-5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className={`text-red-400 ${ClassNameHpMp}`}>{t('status.hp')}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-red-400 transition-colors ${ClassNameHpMp} ${tempStats.vitality > 0 ? 'text-system-glow' : ''}`}>
                    {simulatedHpCurrent} / {simulatedHpMax}
                    {tempStats.vitality > 0 && <span className="ml-1 md:ml-2 font-mono text-[9px] md:text-xs"> (+{tempStats.vitality * 15})</span>}
                  </span>
                  <StatTooltip 
                    statLabel={t('status.tooltip.hp_total', 'SALUD TOTAL (HP)')} 
                    base={player.hp_max - (player.bonus_hp_max ?? 0)} 
                    equipment={player.bonus_hp_max ?? 0} 
                    title={0} 
                    classBonus={0} 
                  />
                </div>
              </div>
              <div className="h-2 md:h-2.5 bg-black/40 rounded-full overflow-hidden border border-red-500/20 p-[1px]">
                <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" style={{ width: `${hpPercentage}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] sm:text-xs">
                <span className={`text-blue-400 ${ClassNameHpMp}`}>{t('status.mp')}</span>
                <div className="flex items-center gap-1">
                  <span className={`text-blue-400 transition-colors ${ClassNameHpMp} ${tempStats.intelligence > 0 ? 'text-system-glow' : ''}`}>
                    {simulatedMpCurrent} / {simulatedMpMax}
                    {tempStats.intelligence > 0 && <span className="ml-1 md:ml-2 font-mono text-[9px] md:text-xs"> (+{tempStats.intelligence * 5})</span>}
                  </span>
                  <StatTooltip 
                    statLabel={t('status.tooltip.mp_total', 'MAGIA TOTAL (MP)')} 
                    base={player.mp_max - (player.bonus_mp_max ?? 0)} 
                    equipment={player.bonus_mp_max ?? 0} 
                    title={0} 
                    classBonus={0} 
                  />
                </div>
              </div>
              <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-blue-500/20 p-[1px]">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ width: `${mpPercentage}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-data font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                <span className={fatigueColor}>{t('status.fatiga')}</span>
                <span className={fatigueColor}>{player.fatigue} / {player.fatigue_max}</span>
              </div>
              <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-yellow-500/20 p-[1px]">
                <div className={`h-full rounded-full bg-gradient-to-r ${fatigueBarColor} transition-all duration-1000`} style={{ width: `${fatiguePercentage}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-data font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                <span className="text-system-glow">EXP ({player.experience} / {player.exp_next_level})</span>
                <span className="text-system-glow">{expPercentage}%</span>
              </div>
              <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-system-glow/20 p-[1px]">
                <div className="h-full rounded-full bg-system-glow shadow-[0_0_10px_rgba(0,229,255,0.4)] transition-all duration-1000" style={{ width: `${expPercentage}%` }} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 md:pt-5 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-system-gold" />
              <span className="text-xs md:text-sm font-data font-bold uppercase text-muted-foreground tracking-widest">{t('status.oro')}</span>
            </div>
            <span className="text-lg md:text-xl font-mono gold-text font-bold">{player.gold.toLocaleString()} G</span>
          </div>
        </div>
      </div>

      <div className="system-panel rounded-lg p-4 md:p-6 border-system-glow/20" id="tutorial-atributos">
        <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:items-center md:h-9 relative mb-8 md:mb-12">
          <div className="flex items-center justify-center md:justify-start h-full">
            <h2 className="text-lg md:text-xl font-mono system-text uppercase tracking-[0.2em] select-none flex items-center gap-2">
              <ChartNoAxesColumn className="w-4 h-4 md:w-5 md:h-5 text-system-glow" />
              {t('status.atributos')}
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center h-full relative w-full">
            <div id="tutorial-modo-asignacion" className={`flex items-center justify-center border p-0.5 rounded text-[10px] md:text-xs font-mono transition-all duration-300 h-8 shrink-0 w-full md:w-auto ${
              player.stat_points > 0 ? 'border-system-glow/30 bg-system-glow/4 shadow-[0_0_15px_rgba(0,229,255,0.05)]' : 'border-white/5 bg-white/5 opacity-30 pointer-events-none'
            }`}>
              {(['1', '10', 'max'] as const).map((mode) => {
                const isSelected = assignMode === mode && player.stat_points > 0;
                return (
                  <button key={mode} type="button" disabled={player.stat_points === 0} onClick={() => setAssignMode(mode)}
                    className={`px-3 md:px-4 h-full flex-1 md:flex-none rounded-sm uppercase tracking-tighter transition-all ${
                      player.stat_points > 0 ? 'cursor-pointer' : 'cursor-not-allowed'
                    } ${isSelected ? 'bg-system-glow text-black font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'text-system-glow/60 hover:text-system-glow disabled:text-white/20'}`}
                  >
                    {mode === 'max' ? 'MAX' : `+${mode}`}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 md:mt-2 flex items-center justify-center w-full md:w-max h-6">
              {spentPoints > 0 && (
                <button onClick={handleResetAll} className="flex items-center justify-center gap-1.5 text-[10px] font-data font-bold text-red-400 hover:text-red-300 transition-all uppercase border border-red-400/30 px-2.5 py-1 md:py-0.5 rounded bg-red-400/5 active:scale-95 cursor-pointer animate-fade-in shadow-[0_0_10px_rgba(248,113,113,0.05)] w-full md:w-auto">
                  <X className="w-3 h-3" /> {t('status.reset_all')}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end h-full mt-4 md:mt-0">
            <div className={`flex items-center gap-2 px-4 py-2 md:py-1.5 rounded border transition-all duration-300 w-full sm:w-auto justify-center ${
              remainingPoints > 0 ? 'bg-system-gold/10 text-system-gold border-system-gold/30 animate-pulse shadow-[0_0_12px_rgba(234,179,8,0.1)]' : 'bg-white/5 text-white/30 border-white/10 opacity-60'
            }`}>
              <span className="text-[11px] md:text-xs font-data font-bold uppercase tracking-tight whitespace-nowrap">
                {t('status.puntos_disponibles')}: <span className="font-mono font-black">{remainingPoints}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:gap-6 mt-4">
          {STAT_CONFIG.map(({ key, label, icon, color, barColor }) => {
            const baseValue = player[key] as number;
            const extraValue = tempStats[key];
            const totalDisplay = baseValue + extraValue;
            const maxStatValue = 300;

            const baseNatural = player[`base_${key}` as keyof typeof player] as number ?? baseValue;
            const equipmentBonus = player[`bonus_${key}` as keyof typeof player] as number ?? 0;
            const titleBonus = player[`title_bonus_${key}` as keyof typeof player] as number ?? 0;
            const classBonus = player[`class_bonus_${key}` as keyof typeof player] as number ?? 0;

            return (
              <div key={key} className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-6 group/row relative hover:z-10 bg-white/5 md:bg-transparent p-3 md:p-0 rounded-lg md:rounded-none border border-white/5 md:border-transparent">
                <div className={`flex items-center justify-between md:justify-start gap-4 w-full md:w-24 ${color}`}>
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-1.5 md:p-2 bg-background/50 md:bg-white/5 rounded border border-white/10 group-hover/row:border-current transition-colors">
                      {icon}
                    </div>
                    <span className="text-base md:text-lg font-mono tracking-tighter">{label}</span>
                  </div>
                  <div className="flex items-center gap-2 md:hidden">
                    <span className={`font-mono text-lg font-bold ${extraValue > 0 ? 'text-system-glow animate-pulse' : 'text-white'}`}>
                      {totalDisplay}
                    </span>
                    <StatTooltip statLabel={label} base={baseNatural} equipment={equipmentBonus} title={titleBonus} classBonus={classBonus} />
                  </div>
                </div>
                
                <div className="hidden sm:block flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${barColor} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} style={{ width: `${Math.min((totalDisplay / maxStatValue) * 100, 100)}%` }} />
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-4 md:min-w-[190px] mt-2 md:mt-0 pt-2 md:pt-0 border-t border-white/10 md:border-t-0">
                  <div className="hidden md:flex items-center justify-end">
                    <span className={`font-mono text-xl font-bold w-12 text-right ${extraValue > 0 ? 'text-system-glow animate-pulse' : 'text-white'}`}>
                      {totalDisplay}
                    </span>
                    <StatTooltip statLabel={label} base={baseNatural} equipment={equipmentBonus} title={titleBonus} classBonus={classBonus} />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-[72px] justify-end">
                    <button 
                      onClick={() => handleAddStat(key)}
                      disabled={remainingPoints <= 0 || mutation.isPending}
                      className={`tutorial-add-point flex-1 md:flex-none h-8 md:w-8 flex items-center justify-center rounded transition-all select-none border ${
                        remainingPoints > 0 && !mutation.isPending ? 'bg-system-glow/10 text-system-glow border-system-glow/30 hover:bg-system-glow hover:text-black active:scale-90 shadow-[0_0_8px_rgba(0,229,255,0.15)]' : 'bg-background/50 text-white/10 border-white/5 opacity-40'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleRemoveStat(key)}
                      disabled={extraValue === 0}
                      className={`flex-1 md:flex-none h-8 md:w-8 flex items-center justify-center rounded transition-all select-none border font-mono text-base ${
                        extraValue > 0 ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500 hover:text-white active:scale-90 shadow-[0_0_8px_rgba(239,68,68,0.1)]' : 'bg-background/50 text-white/10 border-white/5 opacity-40'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center gap-4">
          <p className={`text-xs font-data font-bold uppercase tracking-[0.2em] transition-opacity duration-500 ${
            spentPoints > 0 ? 'text-system-glow opacity-100 animate-pulse' : 'text-white/20 opacity-50'
          }`}>
            {spentPoints > 0 ? t('status.sincro_requerida') : t('status.esperando_puntos')}
          </p>
          
          <button
            id="tutorial-boton-aplicar"
            onClick={() => spentPoints > 0 && mutation.mutate(tempStats)}
            disabled={mutation.isPending || spentPoints === 0}
            className={`relative group w-full max-w-sm overflow-hidden rounded-sm transition-all duration-500 ${
              spentPoints > 0 ? 'opacity-100 scale-100 shadow-[0_0_25px_rgba(0,229,255,0.15)]' : 'opacity-30 scale-[0.98] cursor-not-allowed grayscale'
            }`}
          >
            <div className={`relative flex items-center justify-center gap-4 py-4 font-system text-sm transition-all duration-300 border-2 ${
              spentPoints > 0 ? 'border-system-glow/30 bg-system-glow/4 shadow-[0_0_15px_rgba(0,229,255,0.05)] text-system-glow group-hover:bg-system-glow/10' : 'bg-white/5 border-white/10 text-white/30'
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
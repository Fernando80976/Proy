import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ScrollText, CheckCircle, RefreshCw, ChevronRight, Box, Loader2, Trophy, Target, ShieldAlert, Swords, Gamepad2, Archive, X
} from 'lucide-react';
import axios from 'axios';
import QuestService, { type RewardItem } from '../../services/QuestService';
import PreLoader from '../../components/common/Preloader';
import RewardModal from '../../components/game/ModalReward';
import { useSystemNotify } from '../../context/notifications/SystemNotifyContext';
import { useTranslation } from 'react-i18next';

import DleModal from '../../components/game/ModalDleMission'; 


const QuestTypeBadge = ({ type }: { type: string }) => {
  const { t } = useTranslation();
  const styles: Record<string, string> = {
    daily: 'bg-system-glow/10 text-system-glow border-system-glow/30',
    story: 'bg-system-gold/10 text-system-gold border-system-gold/30 shadow-[0_0_10px_rgba(255,184,0,0.1)]',
    emergency: 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse font-bold',
    penalty: 'bg-red-900/40 text-red-400 border-red-900/50 shadow-inner',
  };
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-mono uppercase tracking-[0.2em] border backdrop-blur-md ${styles[type] || ''}`}>
      <div className={`w-1.5 h-1.5 rounded-full bg-current ${type === 'emergency' ? 'animate-ping' : 'shadow-[0_0_5px_currentColor]'}`} />
      {t(`quests.type_${type}`, { defaultValue: type })}
    </span>
  );
};

const QuestsPanel = () => {
  const { t, i18n } = useTranslation();

  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'daily' | 'story' | 'complete'>('all');
  
  const [rewardData, setRewardData] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showDleModal, setShowDleModal] = useState(false);

  const queryClient = useQueryClient();
  const { showNotify } = useSystemNotify();

  const progressMutation = useMutation({
    mutationFn: ({ id, inc, max }: { id: number, inc: number, max?: boolean }) => 
      QuestService.updateProgress(id, inc, max), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunter-missions'] });
    },
    onError: (error) => {
      const msg = axios.isAxiosError(error) ? error.response?.data?.detail : "System Error";
      alert("PROGRESS ERROR: " + msg);
    }
  });

  const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: ['hunter-missions'] });
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['playerTitles'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
  };

  const claimMutation = useMutation({
    mutationFn: (instanceId: number) => QuestService.claimReward(instanceId),
    onSuccess: (data) => {
      setRewardData(data);
      setShowRewardModal(true);
      invalidateAll();
      setSelectedQuestId(null);
    },
    onError: (error) => {
      const msg = axios.isAxiosError(error) ? error.response?.data?.detail || error.response?.data?.mensaje : "Unknown System Error";
      showNotify(
        msg.includes("_") ? `${t(`backend_errors.${msg}`)}` : `${msg}`, 
        'error', 
        'FALLO EN EL SISTEMA'
      );
    }
  });

  const { data: missions = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['hunter-missions'],
    queryFn: QuestService.getMyMissions,
  });

  const filteredQuests = [...missions]
    .filter(q => {
      if (filter === 'complete') {
        return q.status === 'claimed'; 
      }
      if (q.status === 'claimed') return false;

      const matchesType = filter === 'all' || q.mission_type === filter;
      return matchesType;
    })
    .sort((a, b) => {
      if (filter === 'complete') return 0;
      if (a.status === 'completed' && b.status !== 'completed') return -1;
      if (b.status === 'completed' && a.status !== 'completed') return 1;
      return 0;
    });

  const selectedQuest = missions.find(q => q.instance_id === selectedQuestId);
  const currentLang = i18n.language?.split('-')[0] ?? 'es';
  const selectedQuestTitle = selectedQuest ? selectedQuest.title[currentLang] || selectedQuest.title.es : '';
  const selectedQuestDescription = selectedQuest ? selectedQuest.description[currentLang] || selectedQuest.description.es : '';
  const selectedQuestStatusLabel = selectedQuest ? (
    selectedQuest.status === 'completed'
      ? t('quests.status_ready_to_claim')
      : selectedQuest.status === 'claimed'
        ? t('quests.status_archived')
        : t(`quests.status_${selectedQuest.status}`, { defaultValue: selectedQuest.status.toUpperCase() })
  ) : '';

  if (isLoading) return (
      <div className="min-h-185 bg-background flex items-center justify-center p-6">
        <PreLoader message={t('quests.syncing')} />
      </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto p-4 animate-fade-in">
      

      <div className="system-panel rounded-2xl p-6 border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent h-[75vh] flex flex-col w-full">
        

        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-system-glow/10 rounded-lg">
              <ScrollText className="w-6 h-6 text-system-glow shadow-glow" />
            </div>
            <h2 className="text-2xl font-mono font-black system-text uppercase tracking-tighter italic">{t('quests.title')}</h2>
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="p-2 hover:bg-system-glow/20 rounded-full transition-all active:scale-90"
          >
            <RefreshCw className={`w-5 h-5 text-system-glow/70 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>


        <div className="flex gap-1 mb-6 p-1.5 bg-black/60 rounded-xl border border-white/5 overflow-x-auto no-scrollbar shrink-0">
          {(['all', 'daily', 'story', 'complete'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 min-w-[70px] px-2 py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
                filter === f ? 'bg-system-glow text-black font-bold shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              {t(`quests.filter_${f}`)}
            </button>
          ))}
        </div>


        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
          {filteredQuests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale">
              <ShieldAlert className="w-12 h-12 mb-2" />
              <p className="font-mono text-xs tracking-[0.2em]">
                {filter === 'complete' ? t('quests.no_history_recorded') : t('quests.no_missions_detected')}
              </p>
            </div>
          ) : (
            filteredQuests.map(quest => (
              <button
                key={quest.instance_id}
                onClick={() => setSelectedQuestId(quest.instance_id)}
                className={`w-full group relative p-4 rounded-xl border transition-all duration-500 overflow-hidden shrink-0 ${
                  selectedQuestId === quest.instance_id 
                  ? 'bg-system-glow/10 border-system-glow/50 shadow-lg lg:translate-x-2' 
                  : quest.status === 'completed' 
                    ? 'bg-system-green/5 border-system-green/30 hover:border-system-green/60' 
                    : quest.status === 'claimed'
                      ? 'bg-white/[0.01] border-white/5 opacity-60 hover:opacity-100'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                {selectedQuestId === quest.instance_id && (
                  <div className="absolute left-0 top-0 w-1 h-full bg-system-glow shadow-[0_0_10px_#00f2ff]" />
                )}
                
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex flex-col gap-1.5 text-left">
                    <span className={`text-[8px] font-mono uppercase tracking-[0.3em] font-bold ${
                      quest.status === 'claimed'
                      ? 'text-white/40'
                      : quest.mission_type === 'emergency' ? 'text-red-500' : 'text-system-glow/60'
                    }`}>
                      {quest.status === 'completed'
                        ? t('quests.status_ready_to_claim')
                        : quest.status === 'claimed'
                          ? t('quests.status_archived')
                          : t(`quests.type_${quest.mission_type}`, { defaultValue: quest.mission_type })}
                    </span>
                    <h3 className={`text-[13px] font-bold tracking-tight transition-colors ${
                      quest.status === 'completed' 
                      ? 'text-system-green' 
                      : quest.status === 'claimed'
                        ? 'text-white/60'
                        : 'text-white/90 group-hover:text-white'
                    }`}>
                      {quest.title[currentLang] || quest.title.es}
                    </h3>
                  </div>
                  {quest.status === 'completed' ? (
                    <div className="p-1 bg-system-green/20 rounded-full animate-pulse">
                      <CheckCircle className="w-5 h-5 text-system-green" />
                    </div>
                  ) : quest.status === 'claimed' ? (
                      <Archive className="w-4 h-4 text-white/20" />
                  ) : (
                    <ChevronRight className={`w-4 h-4 transition-all duration-300 ${selectedQuestId === quest.instance_id ? 'translate-x-1 text-system-glow' : 'text-white/20'}`} />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>


      <div className={`
        ${selectedQuest ? 'flex' : 'hidden lg:flex'} 
        fixed inset-0 z-50 p-4 bg-black/80 backdrop-blur-md items-center justify-center
        lg:relative lg:inset-auto lg:z-0 lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:h-[75vh] lg:w-full
      `}>
        {selectedQuest ? (
          <div 
            key={selectedQuest.instance_id} 
            className="system-panel rounded-2xl p-6 sm:p-8 border border-system-glow/20 bg-gradient-to-br from-system-glow/[0.03] to-neutral-950 w-full max-w-lg lg:max-w-none h-[85vh] lg:h-full flex flex-col justify-between animate-fade-in relative overflow-x-hidden overflow-y-auto custom-scrollbar"
          >
            

            <div className="absolute top-0 right-0 w-64 h-64 bg-system-glow/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none z-0" />


            <button 
              onClick={() => setSelectedQuestId(null)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all lg:hidden z-20"
            >
              <X className="w-5 h-5" />
            </button>


            <div className="relative z-10 flex-1">
              <div className="flex justify-between items-start mb-6 pr-8 lg:pr-0">
                <div className="max-w-[70%]">
                  <QuestTypeBadge type={selectedQuest.mission_type} />
                  <h2 className="text-2xl sm:text-3xl font-black mt-4 font-sans tracking-tighter text-white uppercase italic leading-none">
                    {selectedQuestTitle}
                  </h2>
                  <div className="h-1 w-20 bg-system-glow mt-3 mb-3" />
                  <p className="text-white/60 text-xs leading-relaxed font-light italic">
                    "{selectedQuestDescription}"
                  </p>
                </div>
                
                <div className="bg-black/60 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 text-center min-w-[90px] sm:min-w-[110px] shadow-2xl">
                  <p className="text-[9px] font-mono text-system-glow/50 uppercase tracking-[0.2em] mb-1">{t('quests.status')}</p>
                  <p className={`text-xs sm:text-sm font-black font-mono tracking-tighter ${
                      selectedQuest.status === 'completed' ? 'text-system-green' : selectedQuest.status === 'claimed' ? 'text-white/50' : 'text-system-glow'
                  }`}>
                    {selectedQuestStatusLabel}
                  </p>
                </div>
              </div>


              <div className="space-y-6 mb-6">
                <div className={`p-4 sm:p-6 rounded-2xl border backdrop-blur-sm ${selectedQuest.status === 'claimed' ? 'bg-white/[0.01] border-white/5' : 'bg-white/[0.03] border-white/5'}`}>
                  <div className="flex justify-between items-end mb-4">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                      <Target className={`w-4 h-4 ${selectedQuest.status === 'claimed' ? 'text-white/20' : 'text-system-glow'}`} /> {t('quests.objective_progress')}
                    </h4>
                    <div className="text-right">
                      <span className={`text-xl font-mono font-black ${selectedQuest.status === 'claimed' ? 'text-white/60' : 'text-white'}`}>{selectedQuest.current_progress}</span>
                      <span className="text-white/20 font-mono text-xs ml-1">/ {selectedQuest.target_value}</span>
                    </div>
                  </div>
                  
                  <div className="relative h-3 bg-black/60 rounded-full overflow-hidden p-[2px] border border-white/5 mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        selectedQuest.status === 'claimed'
                        ? 'bg-white/20'
                        : selectedQuest.current_progress >= selectedQuest.target_value 
                          ? 'bg-gradient-to-r from-system-green to-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]' 
                          : 'bg-gradient-to-r from-system-cyan via-system-glow to-blue-500 shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                      }`}
                      style={{ width: `${Math.min((selectedQuest.current_progress / selectedQuest.target_value) * 100, 100)}%` }}
                    />
                  </div>

                  {selectedQuest.status === 'active' && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {selectedQuest.target_type === 'dle_guess' && (
                        <button 
                          onClick={() => setShowDleModal(true)}
                          className="group relative flex-1 py-2.5 overflow-hidden rounded-xl transition-all active:scale-[0.98] border border-system-glow/30 bg-system-glow/5 hover:bg-system-glow/10"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2 text-system-glow font-mono text-[10px] font-black uppercase tracking-[0.15em]">
                            <Gamepad2 className="w-4 h-4 animate-bounce" />
                            {t('quests.start_riddle_challenge')}
                          </span>
                        </button>
                      )}

                      <button 
                        onClick={() => progressMutation.mutate({ id: selectedQuest.instance_id, inc: 0, max: true })}
                        disabled={progressMutation.isPending}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-500 font-mono text-[9px] uppercase tracking-widest transition-all w-full sm:w-auto"
                      >
                        {progressMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Swords className="w-3 h-3" />}
                        {t('quests.instant_complete')}
                      </button>
                    </div>
                  )}
                </div>


                <div className={selectedQuest.status === 'claimed' ? 'opacity-40' : ''}>
                  <h4 className="text-[10px] font-mono text-system-gold uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-system-gold" /> {t('quests.rewards_for_completion')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="reward-card p-3 border-system-glow/30 bg-system-glow/[0.05] flex flex-col items-center justify-center rounded-xl border">
                      <span className="text-[8px] text-system-glow/70 uppercase tracking-widest mb-1">{t('quests.experience')}</span>
                      <span className="text-xl text-white font-black tracking-tighter">+{selectedQuest.reward_exp}</span>
                    </div>
                    
                    <div className="reward-card p-3 border-system-gold/30 bg-system-gold/[0.05] flex flex-col items-center justify-center rounded-xl border">
                      <span className="text-[8px] text-system-gold/70 uppercase tracking-widest mb-1">{t('quests.gold_units')}</span>
                      <span className="text-xl text-white font-black tracking-tighter">+{selectedQuest.reward_gold}</span>
                    </div>

                    {selectedQuest.reward_items?.map((item: RewardItem, idx: number) => (
                      <div key={idx} className="reward-card p-3 border-purple-500/30 bg-purple-500/[0.05] flex flex-col items-center justify-center rounded-xl border col-span-2 sm:col-span-1">
                        <Box className="w-4 h-4 text-purple-400 mb-1" />
                        <p className="text-[8px] text-purple-200/50 leading-none mb-1">
                          {typeof item.name === "string"
                            ? item.name
                            : item.name?.es ?? item.name?.en ?? `Item #${item.item_id}`}
                        </p>
                        <p className="text-white font-black text-base leading-none">x{item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            <div className="relative z-10 shrink-0 mt-auto">
              <button 
                onClick={() => {
                  if (selectedQuest.status === 'completed') {
                    claimMutation.mutate(selectedQuest.instance_id);
                  }
                }}
                disabled={selectedQuest.status !== 'completed' || claimMutation.isPending}
                className={`group relative w-full py-4 overflow-hidden rounded-xl transition-all duration-300 ${
                  selectedQuest.status === 'completed'
                    ? 'active:scale-[0.98] cursor-pointer'
                    : 'cursor-not-allowed opacity-50'
                }`}
              >
                {selectedQuest.status === 'completed' ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-system-green/20 via-system-green/40 to-system-green/20 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 border border-system-green/50 rounded-xl group-hover:border-system-green transition-colors" />
                    <div className="absolute bottom-0 left-0 h-[2px] bg-system-green w-full shadow-[0_0_20px_#4ade80]" />
                  </>
                ) : selectedQuest.status === 'claimed' ? (
                  <>
                    <div className="absolute inset-0 bg-white/[0.02]" />
                    <div className="absolute inset-0 border border-white/10 rounded-xl" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-white/[0.01]" />
                    <div className="absolute inset-0 border border-white/5 rounded-xl" />
                  </>
                )}
                
                <span className={`relative z-10 flex items-center justify-center gap-3 font-mono text-xs font-black uppercase tracking-[0.3em] ${
                  selectedQuest.status === 'completed' ? 'text-system-green' : 'text-white/30'
                }`}>
                  {claimMutation.isPending ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : selectedQuest.status === 'completed' ? (
                    <>
                      <CheckCircle className="w-4 h-4 animate-pulse" />
                      {t('quests.button_collect_rewards')}
                    </>
                  ) : selectedQuest.status === 'claimed' ? (
                    <>
                      <Archive className="w-4 h-4 text-white/20" />
                      {t('quests.button_rewards_already_claimed')}
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-white/20" />
                      {t('quests.button_quest_incomplete')}
                    </>
                  )}
                </span>
              </button>
            </div>

          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center system-panel rounded-2xl bg-white/[0.01] border border-dashed border-white/10 p-8 text-center animate-fade-in">
            <ScrollText className="w-16 h-16 text-white/20 animate-pulse mb-4" />
            <h3 className="font-mono text-md uppercase tracking-[0.3em] text-white/30 mb-2 italic animate-pulse">{t('quests.select_a_quest')}</h3>
            <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest max-w-[200px] animate-pulse">{t('quests.awaiting_command')}</p>
          </div>
        )}
      </div>


      <RewardModal isOpen={showRewardModal} onClose={() => setShowRewardModal(false)} data={rewardData} />
      <DleModal isOpen={showDleModal} onClose={() => { setShowDleModal(false); queryClient.invalidateQueries({ queryKey: ['hunter-missions'] }); }} />

    </div>
  );
};

export default QuestsPanel;
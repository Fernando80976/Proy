import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ScrollText, CheckCircle, RefreshCw, ChevronRight, Box, Loader2, Trophy, Target, ShieldAlert, Swords, Gamepad2
} from 'lucide-react';
import axios from 'axios';
import QuestService, { type RewardItem } from '../../services/QuestService';
import PreLoader from '../../components/common/Preloader';
import RewardModal from '../../components/game/ModalReward';
import { useSystemNotify } from '../../context/notifications/SystemNotifyContext';
import { useTranslation } from 'react-i18next';

import DleModal from '../../components/game/ModalDleMission'; 

// --- Subcomponentes de UI ---
const QuestTypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    daily: 'bg-system-glow/10 text-system-glow border-system-glow/30',
    story: 'bg-system-gold/10 text-system-gold border-system-gold/30 shadow-[0_0_10px_rgba(255,184,0,0.1)]',
    emergency: 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse font-bold',
    penalty: 'bg-red-900/40 text-red-400 border-red-900/50 shadow-inner',
  };
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-mono uppercase tracking-[0.2em] border backdrop-blur-md ${styles[type] || ''}`}>
      <div className={`w-1.5 h-1.5 rounded-full bg-current ${type === 'emergency' ? 'animate-ping' : 'shadow-[0_0_5px_currentColor]'}`} />
      {type}
    </span>
  );
};

const QuestsPanel = () => {
  const { t } = useTranslation();

  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'daily' | 'story' | 'emergency' | 'penalty'>('all');
  
  const [rewardData, setRewardData] = useState(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  
  const [showDleModal, setShowDleModal] = useState(false);

  const queryClient = useQueryClient();

  const { showNotify } = useSystemNotify(); // Extraer la función

//PARA PRUEBAS HAY QUE BORRARLO EN EL FUTURO
const progressMutation = useMutation({
  // Añadimos 'max' al objeto de argumentos
  mutationFn: ({ id, inc, max }: { id: number, inc: number, max?: boolean }) => 
    QuestService.updateProgress(id, inc, max), 
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['hunter-missions'] });
    // Opcional: si al completar quieres que se seleccione automáticamente para reclamar
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


  // 2. MUTACIÓN PARA RECLAMAR
  const claimMutation = useMutation({
    mutationFn: (instanceId: number) => QuestService.claimReward(instanceId),
    onSuccess: (data) => {
      
      // 3. En lugar del alert, guardamos la data y abrimos el modal
      setRewardData(data);
      setShowRewardModal(true);

      invalidateAll();

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

  // 3. QUERY PARA OBTENER MISIONES
  const { data: missions = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['hunter-missions'],
    queryFn: QuestService.getMyMissions,
  });

  const filteredQuests = missions.filter(q => {
    const matchesFilter = filter === 'all' || q.mission_type === filter;
    return matchesFilter && q.status !== 'claimed';
  });

  const selectedQuest = missions.find(q => q.instance_id === selectedQuestId);

  if (isLoading) return (
      <div className="min-h-185 bg-background flex items-center justify-center p-6">
        <PreLoader message="Sincronizando Con el Sistema..." />
      </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto p-4 animate-fade-in">
      
      {/* SECCIÓN IZQUIERDA: LISTA DE MISIONES */}
      <div className="lg:col-span-5 space-y-4">
        <div className="system-panel rounded-2xl p-6 border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-system-glow/10 rounded-lg">
                <ScrollText className="w-6 h-6 text-system-glow shadow-glow" />
              </div>
              <h2 className="text-2xl font-mono font-black system-text uppercase tracking-tighter italic">Quest Log</h2>
            </div>
            <button 
              onClick={() => refetch()} 
              disabled={isFetching}
              className="p-2 hover:bg-system-glow/20 rounded-full transition-all active:scale-90"
            >
              <RefreshCw className={`w-5 h-5 text-system-glow/70 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex gap-1 mb-6 p-1.5 bg-black/60 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
            {(['all', 'daily', 'story', 'emergency', 'penalty'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 min-w-[70px] px-2 py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all duration-300 ${
                  filter === f ? 'bg-system-glow text-black font-bold shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="space-y-3 h-[55vh] overflow-y-auto pr-3 custom-scrollbar">
            {filteredQuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale">
                <ShieldAlert className="w-12 h-12 mb-2" />
                <p className="font-mono text-xs tracking-[0.2em]">NO MISSIONS DETECTED</p>
              </div>
            ) : (
              filteredQuests.map(quest => (
                <button
                  key={quest.instance_id}
                  onClick={() => setSelectedQuestId(quest.instance_id)}
                  className={`w-full group relative p-4 rounded-xl border transition-all duration-500 overflow-hidden ${
                    selectedQuestId === quest.instance_id 
                    ? 'bg-system-glow/10 border-system-glow/50 shadow-lg translate-x-2' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  {selectedQuestId === quest.instance_id && (
                    <div className="absolute left-0 top-0 w-1 h-full bg-system-glow shadow-[0_0_10px_#00f2ff]" />
                  )}
                  
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className={`text-[8px] font-mono uppercase tracking-[0.3em] font-bold ${
                        quest.mission_type === 'emergency' ? 'text-red-500' : 'text-system-glow/60'
                      }`}>
                        {quest.mission_type}
                      </span>
                      <h3 className="text-[13px] font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">{quest.title.es}</h3>
                    </div>
                    {quest.status === 'completed' ? (
                      <div className="p-1 bg-system-green/20 rounded-full">
                        <CheckCircle className="w-5 h-5 text-system-green" />
                      </div>
                    ) : (
                      <ChevronRight className={`w-4 h-4 transition-all duration-300 ${selectedQuestId === quest.instance_id ? 'translate-x-1 text-system-glow' : 'text-white/20'}`} />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: DETALLE DE LA MISIÓN */}
      <div className="lg:col-span-7">
        {selectedQuest && selectedQuest.status !== 'claimed' ? (
          <div className="system-panel rounded-2xl p-10 border border-system-glow/20 bg-gradient-to-br from-system-glow/[0.03] to-transparent h-full flex flex-col animate-slide-in relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-system-glow/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="mb-10 flex justify-between items-start relative z-10">
              <div className="max-w-[70%]">
                <QuestTypeBadge type={selectedQuest.mission_type} />
                <h2 className="text-4xl font-black mt-6 font-sans tracking-tighter text-white uppercase italic leading-none">
                  {selectedQuest.title.es}
                </h2>
                <div className="h-1 w-20 bg-system-glow mt-4 mb-4" />
                <p className="text-white/60 text-sm leading-relaxed font-light italic">
                  "{selectedQuest.description.es}"
                </p>
              </div>
              
              <div className="bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center min-w-[120px] shadow-2xl">
                <p className="text-[9px] font-mono text-system-glow/50 uppercase tracking-[0.2em] mb-1">Status</p>
                <p className={`text-base font-black font-mono tracking-tighter ${selectedQuest.status === 'completed' ? 'text-system-green' : 'text-system-glow'}`}>
                  {selectedQuest.status.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Progreso */}
            <div className="space-y-10 flex-1 relative z-10">
              <div className="p-8 bg-white/[0.03] rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-5">
                  <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Target className="w-4 h-4 text-system-glow" /> Objective Progress
                  </h4>
                  <div className="text-right">
                    <span className="text-2xl font-mono font-black text-white">{selectedQuest.current_progress}</span>
                    <span className="text-system-glow/40 font-mono text-sm ml-2">/ {selectedQuest.target_value}</span>
                  </div>
                </div>
                
                <div className="relative h-4 bg-black/60 rounded-full overflow-hidden p-[2px] border border-white/5 mb-6">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      selectedQuest.current_progress >= selectedQuest.target_value 
                      ? 'bg-gradient-to-r from-system-green to-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.4)]' 
                      : 'bg-gradient-to-r from-system-cyan via-system-glow to-blue-500 shadow-[0_0_15px_rgba(0,242,255,0.3)]'
                    }`}
                    style={{ width: `${Math.min((selectedQuest.current_progress / selectedQuest.target_value) * 100, 100)}%` }}
                  />
                </div>

                {/* LÓGICA PARA EL BOTÓN DEL JUEGO DLE */}
                {selectedQuest.status === 'active' && selectedQuest.target_type === 'dle_guess' && (
                  <button 
                    onClick={() => setShowDleModal(true)}
                    className="group relative w-full mb-4 py-4 overflow-hidden rounded-xl transition-all active:scale-[0.98] border border-system-glow/30 bg-system-glow/5 hover:bg-system-glow/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-system-glow/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <span className="relative z-10 flex items-center justify-center gap-3 text-system-glow font-mono text-xs font-black uppercase tracking-[0.2em]">
                      <Gamepad2 className="w-5 h-5 animate-bounce" />
                      Iniciar Desafío de Adivinanza
                    </span>
                  </button>
                )}

                {/* BOTÓN PARA SUBIR PROGRESO (SIMULAR ACCIÓN) */}
                {selectedQuest.status === 'active' && (
                <button 
                  onClick={() => progressMutation.mutate({ id: selectedQuest.instance_id, inc: 0, max: true })}
                  disabled={progressMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-500 font-mono text-[10px] uppercase tracking-widest transition-all"
                >
                  {progressMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Swords className="w-3 h-3" />}
                  Instant Complete (Dev Mode)
                </button>
                )}
              </div>

              {/* Recompensas */}
              <div>
                <h4 className="text-[10px] font-mono text-system-gold uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-system-gold" /> Rewards for Completion
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="reward-card border-system-glow/30 bg-system-glow/[0.05]">
                    <span className="text-[9px] text-system-glow/70 uppercase tracking-widest mb-2">Experience</span>
                    <span className="text-2xl text-white font-black tracking-tighter">+{selectedQuest.reward_exp}</span>
                  </div>
                  
                  <div className="reward-card border-system-gold/30 bg-system-gold/[0.05]">
                    <span className="text-[9px] text-system-gold/70 uppercase tracking-widest mb-2">Gold Units</span>
                    <span className="text-2xl text-white font-black tracking-tighter">+{selectedQuest.reward_gold}</span>
                  </div>

                  {selectedQuest.reward_items?.map((item: RewardItem, idx: number) => (
                    <div key={idx} className="reward-card border-purple-500/30 bg-purple-500/[0.05]">
                      <Box className="w-5 h-5 text-purple-400 mb-2" />
                      <div className="text-center">
                        <p className="text-[10px] text-purple-200/50 leading-none mb-1">ITEM_ID: {item.item_id}</p>
                        <p className="text-white font-black text-lg leading-none">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOTÓN RECLAMAR */}
            {selectedQuest.status === 'completed' && (
              <button 
                onClick={() => claimMutation.mutate(selectedQuest.instance_id)}
                disabled={claimMutation.isPending}
                className="group relative w-full mt-12 py-6 overflow-hidden rounded-xl transition-all active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-system-green/20 via-system-green/40 to-system-green/20 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 border border-system-green/50 rounded-xl group-hover:border-system-green transition-colors" />
                
                <span className="relative z-10 flex items-center justify-center gap-4 text-system-green font-mono text-sm font-black uppercase tracking-[0.4em]">
                  {claimMutation.isPending ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 animate-pulse" />
                      Collect Rewards
                    </>
                  )}
                </span>
                
                <div className="absolute bottom-0 left-0 h-[2px] bg-system-green w-full shadow-[0_0_20px_#4ade80] opacity-50 group-hover:opacity-100" />
              </button>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center system-panel rounded-2xl bg-white/[0.01] border border-dashed border-white/10 p-20 text-center">
            <ScrollText className="w-20 h-20 text-white/20 animate-pulse" />
            <h3 className="font-mono text-lg uppercase tracking-[0.3em] text-white/30 mb-2 italic animate-pulse">Select an active quest</h3>
            <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest max-w-[200px] animate-pulse">The system is awaiting your command, Hunter.</p>
          </div>
        )}
      </div>

        <RewardModal 
        isOpen={showRewardModal} 
        onClose={() => setShowRewardModal(false)} 
        data={rewardData} 
      />

      {/* NUEVO MODAL DLE */}
      <DleModal 
        isOpen={showDleModal} 
        onClose={() => {
            setShowDleModal(false);
            // Opcional: Refrescar misiones al cerrar por si completó el juego
            queryClient.invalidateQueries({ queryKey: ['hunter-missions'] });
        }} 
      />

    </div>
  );
};

export default QuestsPanel;
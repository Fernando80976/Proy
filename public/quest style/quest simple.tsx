import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion'; // Para transiciones fluidas
import { 
  ScrollText, CheckCircle, RefreshCw, ChevronRight, Box, Loader2, Trophy, Target, ShieldAlert
} from 'lucide-react';
// import axios from 'axios';
import QuestService, { type RewardItem } from '../../services/QuestService';

const QuestTypeBadge = ({ type }: { type: string }) => {
  const styles: Record<string, string> = {
    daily: 'bg-system-glow/10 text-system-glow border-system-glow/40 shadow-[0_0_8px_rgba(0,242,255,0.2)]',
    story: 'bg-system-gold/10 text-system-gold border-system-gold/40 shadow-[0_0_8px_rgba(255,215,0,0.2)]',
    emergency: 'bg-red-500/10 text-red-500 border-red-500/40 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.3)]',
    penalty: 'bg-red-900/40 text-red-600 border-red-600/50',
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest border-l-4 ${styles[type] || ''}`}>
      {type === 'emergency' && <ShieldAlert className="w-3 h-3" />}
      {type}
    </span>
  );
};

const QuestsPanel = () => {
  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'daily' | 'story' | 'emergency' | 'penalty'>('all');
  const queryClient = useQueryClient();

  const { data: missions = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['hunter-missions'],
    queryFn: QuestService.getMyMissions,
  });

  const claimMutation = useMutation({
    mutationFn: (instanceId: number) => QuestService.claimReward(instanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hunter-missions'] });
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
    }
  });

  const filteredQuests = missions.filter(q => (filter === 'all' || q.mission_type === filter) && q.status !== 'claimed');
  const selectedQuest = missions.find(q => q.instance_id === selectedQuestId);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-system-glow animate-spin opacity-20" />
        <Loader2 className="w-16 h-16 text-system-glow animate-spin absolute inset-0 [animation-duration:1.5s]" />
      </div>
      <p className="mt-6 text-system-glow font-mono text-sm tracking-[0.3em] animate-pulse uppercase italic">Synchronizing Hunter Log...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto p-6">
      
      {/* PANEL IZQUIERDO: SELECCIÓN DE MISIONES */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-end justify-between px-2">
          <div>
            <h2 className="text-2xl font-black font-mono system-text uppercase tracking-tighter flex items-center gap-3">
              <div className="w-2 h-8 bg-system-glow shadow-[0_0_10px_#00f2ff]" />
              Quest Log
            </h2>
          </div>
          <button 
            onClick={() => refetch()} 
            className="group p-2 rounded-lg border border-white/10 hover:border-system-glow/50 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground group-hover:text-system-glow ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filtros Tácticos */}
        <div className="flex gap-2 p-1.5 bg-black/40 border border-white/5 rounded-sm backdrop-blur-md overflow-x-auto custom-scrollbar">
          {(['all', 'daily', 'story', 'emergency'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 min-w-[80px] py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase transition-all ${
                filter === f ? 'bg-system-glow text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'text-muted-foreground hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lista de Misiones Animada */}
        <div className="space-y-3 h-[65vh] overflow-y-auto pr-3 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredQuests.map((quest, index) => (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={quest.instance_id}
                onClick={() => setSelectedQuestId(quest.instance_id)}
                className={`w-full group relative overflow-hidden rounded-md border-l-4 transition-all duration-300 ${
                  selectedQuestId === quest.instance_id 
                  ? 'bg-gradient-to-r from-system-glow/20 to-transparent border-system-glow shadow-lg' 
                  : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="p-4 flex justify-between items-center relative z-10">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${quest.mission_type === 'emergency' ? 'text-red-500' : 'text-system-glow/60'}`}>
                      {quest.mission_type} // ID-{quest.instance_id}
                    </span>
                    <h3 className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors uppercase tracking-tight">
                      {quest.title.es}
                    </h3>
                  </div>
                  {quest.status === 'completed' ? (
                    <div className="flex items-center gap-2 text-system-green font-mono text-[10px] font-bold">
                      <span className="animate-pulse">COMPLETE</span>
                      <CheckCircle className="w-5 h-5 drop-shadow-[0_0_5px_#4ade80]" />
                    </div>
                  ) : (
                    <ChevronRight className={`w-4 h-4 transition-all ${selectedQuestId === quest.instance_id ? 'translate-x-1 text-system-glow' : 'opacity-30 group-hover:opacity-100'}`} />
                  )}
                </div>
                {/* Efecto de escaneo al seleccionar */}
                {selectedQuestId === quest.instance_id && (
                  <motion.div 
                    layoutId="scanline"
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-system-glow/10 to-transparent h-1/2 w-full z-0"
                    animate={{ top: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* PANEL DERECHO: DETALLE INTEGRADO */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {selectedQuest ? (
            <motion.div 
              key={selectedQuest.instance_id}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="system-panel rounded-xl p-8 border border-white/10 relative overflow-hidden h-full flex flex-col"
            >

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <QuestTypeBadge type={selectedQuest.mission_type} />
                    <h2 className="text-4xl font-black mt-4 text-white uppercase tracking-tighter leading-none">
                      {selectedQuest.title.es}
                    </h2>
                    <div className="h-1 w-24 bg-system-glow mt-2 shadow-[0_0_10px_#00f2ff]" />
                  </div>
                  <div className="bg-black/60 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center min-w-[120px] shadow-2xl">
                    <p className="text-[9px] font-mono text-system-glow/50 uppercase tracking-[0.2em] mb-1">Status</p>
                    <p className={`text-base font-black font-mono tracking-tighter ${selectedQuest.status === 'completed' ? 'text-system-green' : 'text-system-glow'}`}>
                    {selectedQuest.status.toUpperCase()}
                    </p>
                  </div>
                </div>

                <p className="text-gray-400 font-medium leading-relaxed mb-8 border-l-2 border-white/10 pl-4 italic">
                  "{selectedQuest.description.es}"
                </p>

                {/* Progress Tracker */}
                <div className="bg-black/60 rounded-lg p-6 border border-white/5 mb-8">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-2 text-system-glow font-mono text-[10px] font-bold tracking-widest">
                      <Target className="w-4 h-4" /> CURRENT PROGRESS
                    </div>
                    <div className="text-xl font-mono font-black text-white">
                      {selectedQuest.current_progress} <span className="text-xs text-muted-foreground uppercase mx-1">/</span> {selectedQuest.target_value}
                    </div>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full border border-white/10 p-0.5 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((selectedQuest.current_progress / selectedQuest.target_value) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full relative ${
                        selectedQuest.current_progress >= selectedQuest.target_value 
                        ? 'bg-gradient-to-r from-emerald-500 to-system-green' 
                        : 'bg-gradient-to-r from-cyan-600 to-system-glow'
                      }`}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite]" />
                    </motion.div>
                  </div>
                </div>

                {/* Rewards Section */}
                <div className="flex-1">
                  <h4 className="text-xs font-mono text-system-gold uppercase tracking-[0.3em] mb-4 flex items-center gap-2 font-black">
                    <Trophy className="w-4 h-4 shadow-sm" /> Acquisition Rewards
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="reward-card border-system-glow/30 bg-system-glow/5 !items-start">
                      <span className="text-[9px] text-system-glow font-black uppercase">Exp Points</span>
                      <span className="text-2xl text-white font-black mt-1">+{selectedQuest.reward_exp}</span>
                    </div>
                    <div className="reward-card border-system-gold/30 bg-system-gold/5 !items-start">
                      <span className="text-[9px] text-system-gold font-black uppercase">Gold Coins</span>
                      <span className="text-2xl text-white font-black mt-1">+{selectedQuest.reward_gold}</span>
                    </div>
                    {selectedQuest.reward_items?.map((item: RewardItem, idx: number) => (
                      <div key={idx} className="reward-card border-purple-500/30 bg-purple-500/10 !items-start">
                         <div className="flex justify-between w-full">
                           <span className="text-[9px] text-purple-400 font-black uppercase tracking-tighter">Mystery Box</span>
                           <Box className="w-3 h-3 text-purple-400" />
                         </div>
                        <span className="text-lg text-white font-black mt-1 italic">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Claim Button */}
                {selectedQuest.status === 'completed' && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => claimMutation.mutate(selectedQuest.instance_id)}
                    disabled={claimMutation.isPending}
                    className="mt-8 relative w-full py-5 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-system-green transform skew-x-12 translate-x-[-110%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                    <div className="absolute inset-0 border-2 border-system-green flex items-center justify-center font-mono text-sm font-black tracking-[0.4em] text-system-green group-hover:text-black transition-colors">
                      {claimMutation.isPending ? <Loader2 className="animate-spin" /> : "COLLECT REWARDS"}
                    </div>
                  </motion.button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-black/20 border-2 border-dashed border-white/5 rounded-xl text-muted-foreground">
              <div className="relative mb-6">
                <Target className="w-16 h-16 opacity-10" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute inset-0 bg-system-glow blur-3xl rounded-full"
                />
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.5em] animate-pulse">Select Active Mission</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestsPanel;
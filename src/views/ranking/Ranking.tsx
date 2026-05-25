import { useQuery } from '@tanstack/react-query';
import { Swords, Medal, Crown, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { rankingService, type RankingHunter } from '../../services/RankingService.ts';
import PreLoader from '../../components/common/Preloader';
import { useMemo, useState, useRef } from 'react'; // Añadido useRef
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 10;

const getRankColor = (rank: string) => {
  switch (rank) {
    case 'S': return 'text-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.6)]';
    case 'A': return 'text-purple-400';
    case 'B': return 'text-blue-400';
    case 'C': return 'text-green-400';
    case 'D': return 'text-yellow-200';
    case 'E': return 'text-slate-400';
    default: return 'text-slate-500';
  }
};

const RankingPanel = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Referencia para controlar el scroll del contenedor del Ranking
  const rankingTopRef = useRef<HTMLDivElement>(null);

  const { i18n } = useTranslation();
  const currentLang = i18n.language; 

  // 1. Obtener el ranking global completo (incluye NPCs)
  const { data: rankingData = [], isLoading: isLoadingGlobal, isError: isErrorGlobal } = useQuery({
    queryKey: ['global-ranking'],
    queryFn: () => rankingService.getGlobalRanking(),
  });

  // 2. Obtener mis datos específicos en el ranking
  const { data: myPosition, isLoading: isLoadingMe } = useQuery({
    queryKey: ['my-ranking-position'],
    queryFn: rankingService.getMyPosition,
  });

  const paginatedHunters = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return rankingData.slice(start, start + ITEMS_PER_PAGE);
  }, [rankingData, currentPage]);

  const totalPages = Math.ceil(rankingData.length / ITEMS_PER_PAGE);

  // Manejador asíncrono para asegurar que el DOM se actualice antes de subir
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    
    setTimeout(() => {
      if (rankingTopRef.current) {
        const yOffset = -24; // Margen de cortesía superior
        const elementPosition = rankingTopRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset + yOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 10);
  };

  if (isLoadingGlobal || isLoadingMe) {
    return (
      <div className="min-h-362 bg-background flex items-center justify-center p-6">
        <PreLoader message="Sincronizando Con el Sistema..." />
      </div>
    );
  }

  if (isErrorGlobal) {
    return (
      <div className="p-10 border-2 border-red-500/50 bg-red-500/10 rounded-xl text-center">
        <p className="font-mono text-red-500 text-lg uppercase tracking-widest">[ERROR: Connection to Mana Network Lost]</p>
      </div>
    );
  }

  return (
    // Asignamos la referencia al nodo raíz para que el cálculo posicional sea exacto
    <div ref={rankingTopRef} className="flex flex-col gap-8 animate-fade-in-up mx-auto w-full max-w-[1240px]">
      
      {/* --- SECCIÓN 1: RESUMEN DEL JUGADOR --- */}
      <div className="system-panel rounded-2xl p-4 md:p-6 border-b-4 border-b-system-gold/50 bg-system-gold/5 shadow-lg">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="p-3 md:p-4 bg-system-gold/20 rounded-xl border border-system-gold/40 shadow-[0_0_20px_rgba(255,184,0,0.25)]">
            <Crown className="w-6 h-6 md:w-8 h-8 text-system-gold" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-mono font-bold text-system-gold uppercase tracking-[0.25em]">Association Records</h2>
            <p className="text-[10px] md:text-xs text-muted-foreground font-mono uppercase tracking-[0.3em] mt-1">Official Hunter Ranking System</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Global Rank", val: `#${myPosition?.position || '--'}`, color: "text-system-gold" },
            { label: "Hunter Rank", val: myPosition?.hunter_rank || 'E', color: getRankColor(myPosition?.hunter_rank || 'E') },
            { label: "Current Level", val: myPosition?.level || 1, color: "text-system-glow" },
            { label: "Power Score", val: myPosition?.power_score.toLocaleString() || '0', color: "text-purple-400" },
          ].map((stat, i) => (
            <div key={i} className="bg-black/60 border border-white/10 rounded-2xl p-4 md:p-5 text-center group hover:border-system-gold/40 transition-all duration-300">
              <span className="text-[10px] md:text-xs text-muted-foreground font-mono font-bold block mb-1 md:mb-2 uppercase tracking-wider">{stat.label}</span>
              <span className={`text-xl md:text-2xl font-mono font-bold ${stat.color} group-hover:scale-110 transition-transform inline-block`}>
                {stat.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* --- SECCIÓN 2: TABLA DE CLASIFICACIÓN --- */}
      <div className="system-panel rounded-2xl p-4 md:p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-5">
          <Medal className="w-5 h-5 md:w-6 h-6 text-system-glow" />
          <h3 className="text-sm md:text-base font-mono text-system-glow uppercase tracking-[0.2em]">Leaderboard</h3>
        </div>

        <div className="space-y-4">
          {paginatedHunters?.map((hunter: RankingHunter) => {
            const isMe = !hunter.is_npc && hunter.username === myPosition?.username;
            const isRealPlayer = !hunter.is_npc;

            return (
              <div
                key={hunter.username}
                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl transition-all border-2 ${
                  isMe 
                    ? 'border-system-glow bg-system-glow/15 shadow-[0_0_20px_rgba(0,229,255,0.2)] scale-[1.01] z-10' 
                    : isRealPlayer
                      ? 'border-white/10 bg-white/5 hover:border-white/30' 
                      : 'border-white/5 bg-white/[0.02] opacity-80 hover:opacity-100 transition-opacity'
                }`}
              >
                {/* Contenedor Superior Móvil */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold italic shrink-0 border-2 ${
                    hunter.position === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                    hunter.position === 2 ? 'bg-slate-300/20 text-slate-300 border-slate-300/40' :
                    hunter.position === 3 ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                    isMe ? 'bg-system-glow/30 text-system-glow border-system-glow/50' : 'bg-black/40 text-muted-foreground border-white/10'
                  }`}>
                    {hunter.position}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-sm font-bold font-sans uppercase truncate tracking-normal max-w-[140px] xs:max-w-none ${
                        isMe ? 'text-system-glow' : isRealPlayer ? 'text-white' : 'text-slate-400'
                      }`}>
                        {hunter.username}
                      </span>
                      
                      {isMe && (
                        <span className="text-[10px] font-mono font-bold bg-system-glow text-black px-2 py-0.5 rounded-sm animate-pulse whitespace-nowrap">
                          YOU
                        </span>
                      )}
                      {!isMe && isRealPlayer && (
                        <span className="text-[10px] font-mono font-bold border border-blue-500/50 text-blue-400 px-2 py-0.5 rounded-sm whitespace-nowrap">
                          PLAYER
                        </span>
                      )}
                      {!isMe && !isRealPlayer && (
                        <span className="text-[10px] font-mono font-bold border border-red-500/50 text-red-400 px-2 py-0.5 rounded-sm tracking-widest whitespace-nowrap">
                          NPC
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-mono uppercase tracking-[0.15em] line-clamp ${
                      isMe ? 'text-system-glow/80' : 'text-muted-foreground/80'
                    }`}>
                      {hunter.class[currentLang]}
                    </p>
                  </div>
                </div>

                {/* Contenedor Inferior Móvil / Stats */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 shrink-0 border-t border-white/5 pt-3 sm:pt-0 sm:border-t-0">
                  <div className="flex sm:hidden flex-col items-start">
                    <span className="text-[10px] text-muted-foreground font-sans font-bold uppercase mb-0.5 tracking-tighter">Combat Power</span>
                    <div className={`flex items-center gap-1.5 text-xs font-data font-bold ${isMe ? 'text-system-glow' : 'text-white/90'}`}>
                      <Swords className="w-3.5 h-3.5 text-purple-500/70" /> {hunter.power_score.toLocaleString()}
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[12px] text-muted-foreground font-sans font-bold uppercase mb-1 tracking-tighter">Combat Power</span>
                    <div className={`flex items-center gap-2 text-sm font-data font-bold ${isMe ? 'text-system-glow' : 'text-white/90'}`}>
                      <Swords className="w-4 h-4 text-purple-500/70" /> {hunter.power_score.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-center min-w-[50px] sm:min-w-[60px]">
                    <span className="text-[10px] sm:text-[12px] text-muted-foreground font-sans font-bold uppercase mb-0.5 sm:mb-1">Rank</span>
                    <span className={`text-xs sm:text-sm font-mono font-black ${getRankColor(hunter.hunter_rank)}`}>
                      {hunter.hunter_rank}
                    </span>
                  </div>

                  <div className="flex flex-col items-end min-w-[45px] sm:min-w-[50px]">
                    <span className="text-[10px] sm:text-[12px] text-muted-foreground font-sans font-bold uppercase mb-0.5 sm:mb-1">Level</span>
                    <div className="flex text-xs sm:text-sm items-center gap-1.5 font-data text-system-glow font-bold">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-system-glow/20" /> {hunter.level}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* --- CONTROLES DE PAGINACIÓN --- */}
        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 md:pt-8">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest text-center sm:text-left">
            Records found: <span className="text-white">{rankingData.length}</span> hunters
          </p>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-system-glow/20 hover:border-system-glow/50 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white/5 transition-all group"
            >
              <ChevronLeft className="w-5 h-5 text-system-glow group-hover:scale-110" />
            </button>

            <span className="font-mono text-xs md:text-sm text-white px-4 md:px-6 py-2 bg-white/5 rounded-lg border border-white/5 whitespace-nowrap">
              PAGE <span className="text-system-glow">{currentPage}</span> / {totalPages}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="p-2.5 md:p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-system-glow/20 hover:border-system-glow/50 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-white/5 transition-all group"
            >
              <ChevronRight className="w-5 h-5 text-system-glow group-hover:scale-110" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPanel;
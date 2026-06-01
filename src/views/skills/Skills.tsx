import { useState, useMemo } from 'react';
import { 
  Sparkles, Lock, Zap, Clock, Flame, Sword, Eye, 
  Wind, Ghost, Heart, Shield, ArrowUp, Search,
  ChevronsUp
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import SkillsService, { type Skill } from '../../services/SkillsService';
import PreLoader from '../../components/common/Preloader';
import { toastNotification } from '../../components/common/ToastNotification';
import { hunterService } from '../../services/StatusService';


const SkillIcon = ({ name, unlocked }: { name: string, unlocked: boolean }) => {
  const props = { 
    className: `w-7 h-7 transition-transform duration-500 group-hover/card:scale-110 group-hover/card:rotate-6 ${
      unlocked ? 'text-system-glow drop-shadow-[0_0_10px_var(--color-system-glow)]' : 'text-zinc-600'
    }` 
  };
  const n = name.toLowerCase();
  if (n.includes('espada') || n.includes('strike') || n.includes('corte') || n.includes('slash')) return <Sword {...props} />;
  if (n.includes('ojo') || n.includes('percepción') || n.includes('perception') || n.includes('mirada')) return <Eye {...props} />;
  if (n.includes('velocidad') || n.includes('viento') || n.includes('speed') || n.includes('wind')) return <Wind {...props} />;
  if (n.includes('fuego') || n.includes('llama') || n.includes('fire') || n.includes('burst')) return <Flame {...props} />;
  if (n.includes('sombra') || n.includes('sigilo') || n.includes('shadow') || n.includes('monarca')) return <Ghost {...props} />;
  if (n.includes('salud') || n.includes('vida') || n.includes('health') || n.includes('heal')) return <Heart {...props} />;
  if (n.includes('defensa') || n.includes('escudo') || n.includes('shield') || n.includes('armor')) return <Shield {...props} />;
  return <Sparkles {...props} />;
};


interface SkillCardProps {
  skill: Skill;
  currentLang: string;
  playerSP: number;
  onUpgrade: (id: number) => void;
  isPending: boolean;
}

const SkillCard = ({ skill, currentLang, playerSP, onUpgrade, isPending }: SkillCardProps) => {
  const { t } = useTranslation();
  const nombre = skill.name[currentLang] || skill.name['es'] || t('skills.unknown_skill');
  const descripcion = skill.description[currentLang] || skill.description['es'] || t('skills.no_description');
  
  const isMaxLevel = skill.current_level >= skill.max_level;
  const upgradeCost = skill.next_upgrade_cost ?? skill.base_upgrade_sp_cost;
  const canAfford = playerSP >= upgradeCost;

  return (
    <div
      className={`group/card flex flex-col justify-between p-5 sm:p-6 rounded-xl transition-all duration-300 border backdrop-blur-md relative overflow-hidden ${
        skill.is_unlocked 
          ? 'border-zinc-800/80 bg-zinc-900/40 hover:border-system-glow/60 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(var(--color-system-glow),0.15)]' 
          : 'border-zinc-900 bg-zinc-950/20 opacity-50 relative after:absolute after:inset-0 after:bg-[linear-gradient(45deg,transparent_45%,rgba(239,68,68,0.03)_50%,transparent_55%)] after:bg-[length:10px_10px]'
      }`}
    >

      {skill.is_unlocked && (
        <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-system-glow/5 blur-3xl pointer-events-none transition-all duration-700 group-hover/card:bg-system-glow/15 group-hover/card:scale-125" />
      )}

      <div className="relative z-10">

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-stretch sm:items-start text-center sm:text-left">
          

          <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:gap-2.5 shrink-0 w-full sm:w-auto">
            

            <div className={`w-18 h-18 rounded-xl flex items-center justify-center border-2 transition-all duration-500 relative ${
              skill.is_unlocked 
                ? 'border-system-glow/30 bg-zinc-900/80 group-hover/card:border-system-glow group-hover/card:bg-system-glow/10 group-hover/card:shadow-[0_0_15px_rgba(var(--color-system-glow),0.2)]' 
                : 'border-white/10 bg-zinc-950/60'
            }`}>
              {skill.is_unlocked ? (
                <SkillIcon name={nombre} unlocked={true} />
              ) : (
                <Lock className="w-6 h-6 text-zinc-600 animate-pulse" />
              )}
              

              {skill.is_unlocked && (
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-system-glow/40 rounded-tr-sm group-hover/card:border-system-glow" />
              )}
            </div>
            

            <div className="flex flex-col items-end gap-1.5 sm:hidden">
              {skill.is_unlocked && (
                <span className="text-[10px] font-mono font-extrabold border border-system-cyan/30 text-system-cyan bg-system-cyan/5 px-2 py-0.5 rounded uppercase tracking-widest shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                  {t('skills.active')}
                </span>
              )}

              <span className={`text-[12.5px] font-mono font-black px-2.5 py-0.5 rounded border tracking-widest transition-all duration-300 ${
                skill.is_unlocked 
                  ? 'bg-system-glow/10 border-system-glow/40 text-system-glow' 
                  : 'bg-white/5 border-white/10 text-slate-500'
              }`}>
                {skill.is_unlocked ? `LVL ${skill.current_level}` : t('skills.locked')}
              </span>
            </div>

            <span className={`hidden sm:inline-block text-[12.5px] font-mono font-black px-2.5 py-0.5 rounded border tracking-widest transition-all duration-300 ${
              skill.is_unlocked 
                ? 'bg-system-glow/10 border-system-glow/40 text-system-glow' 
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}>
              {skill.is_unlocked ? `LVL ${skill.current_level}` : t('skills.locked')}
            </span>
          </div>


          <div className="flex-1 min-w-0 pt-0.5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className={`text-xl sm:text-lg md:text-xl font-mono font-bold uppercase tracking-wider line-clamp-none transition-colors duration-300 ${
                skill.is_unlocked ? 'text-zinc-200 group-hover/card:text-system-glow' : 'text-zinc-600'
              }`}>
                {nombre}
              </h3>
              

              {skill.is_unlocked && (
                <span className="hidden sm:inline-block text-[11px] font-mono font-extrabold border border-system-cyan/30 text-system-cyan bg-system-cyan/5 px-2.5 py-0.5 rounded uppercase tracking-widest shrink-0 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
                  {t('skills.active')}
                </span>
              )}
            </div>
            

            <p className={`text-sm font-sans mt-2.5 leading-relaxed min-h-[60px] max-h-[70px] overflow-y-auto custom-scrollbar transition-colors duration-300 ${
              skill.is_unlocked ? 'text-zinc-400 group-hover/card:text-zinc-300' : 'text-zinc-700'
            }`}>
              {descripcion}
            </p>
          </div>
        </div>



        {skill.is_unlocked && (
          <div className="mt-5 grid grid-cols-3 gap-2 bg-zinc-950/40 p-1.5 border border-zinc-900/60 rounded-xl group-hover/card:border-zinc-800/80 transition-colors duration-300">
            

            <div className="flex flex-col items-center justify-center py-2 rounded-lg bg-zinc-900/20 border border-transparent hover:border-system-glow/50 transition-colors">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">

                <span className="sm:hidden">MP</span>
                <span className="hidden sm:inline">{t('skills.mana')}</span>
              </span>
              <div className="flex items-center gap-1 mt-1 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
                <Zap className="w-4 h-4 fill-sky-400/10 shrink-0" />
                <span className="text-sm font-mono font-bold tracking-tight">{skill.current_mana_cost ?? skill.mana_cost}</span>
              </div>
            </div>


            <div className="flex flex-col items-center justify-center py-2 rounded-lg bg-zinc-900/20 border border-transparent hover:border-rose-400/50 transition-colors">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">

                <span className="sm:hidden">DMG</span>
                <span className="hidden sm:inline">{t('skills.damage')}</span>
              </span>
              <div className="flex items-center gap-1 mt-1 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]">
                <Sword className="w-4 h-4 shrink-0" />
                <span className="text-sm font-mono font-bold tracking-tight">x{skill.damage_multiplier || '1.0'}</span>
              </div>
            </div>


            <div className="flex flex-col items-center justify-center py-2 rounded-lg bg-zinc-900/20 border border-transparent hover:border-system-gold/50 transition-colors">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">

                <span className="sm:hidden">CD</span>
                <span className="hidden sm:inline">{t('skills.cooldown')}</span>
              </span>
              <div className="flex items-center gap-1 mt-1 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.25)]">
                <Clock className="w-4 h-4 shrink-0" />
                <span className="text-sm font-mono font-bold tracking-tight">{skill.cooldown}T</span>
              </div>
            </div>

          </div>
        )}
      </div>


      <div className="mt-5 pt-4 border-t border-zinc-900/80 relative z-10">
        {skill.is_unlocked ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 w-full">
            

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex justify-between items-center text-[12.5px] font-mono uppercase mb-1.5">
                <span className="text-zinc-500 tracking-wider font-bold">{t('skills.mastery')}</span>
                <span className={`font-black tracking-widest transition-all shrink-0 ${isMaxLevel ? "text-system-gold animate-pulse" : "text-system-glow"}`}>
                  {isMaxLevel ? t('skills.max') : `${skill.current_level} / ${skill.max_level}`}
                </span>
              </div>
              <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/60 p-[0.2px]">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isMaxLevel 
                      ? 'bg-system-gold shadow-[0_0_8px_var(--color-system-gold)]' 
                      : 'bg-system-glow shadow-[0_0_8px_var(--color-system-glow)]'
                  }`} 
                  style={{ width: `${(skill.current_level / skill.max_level) * 100}%` }}
                />
              </div>
            </div>


            {!isMaxLevel ? (
              <button
                onClick={() => onUpgrade(skill.id)}
                disabled={isPending || !canAfford}
                className={`shrink-0 h-10 px-5 rounded-lg font-mono text-sm font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer select-none whitespace-nowrap ${
                  canAfford && !isPending 
                    ? 'bg-zinc-950/40 border-system-glow/50 text-system-glow hover:bg-system-glow hover:text-zinc-950 hover:border-system-glow hover:shadow-[0_0_18px_rgba(var(--color-system-glow),0.35)]' 
                    : 'bg-zinc-900/10 border-zinc-800/60 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-6 h-6 transition-transform duration-300 group-hover:translate-y-[-1px]" />
                <span>{upgradeCost} SP</span>
              </button>
            ) : (
              <div className="shrink-0 h-10 px-5 rounded-lg bg-system-gold/5 border border-system-gold/20 flex items-center justify-center text-system-gold font-mono text-xs font-black tracking-widest uppercase shadow-[0_0_12px_rgba(var(--color-system-gold),0.05)] whitespace-nowrap">
                {t('skills.max')}
              </div>
            )}
          </div>
        ) : (

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-950/60 border border-system-red/10 px-4 py-2.5 rounded-xl">
            <span className="text-xs font-mono text-system-red font-bold uppercase tracking-widest flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-system-red animate-pulse" /> 
              {t('skills.restricted')}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-900/40 border border-zinc-800 px-2.5 py-0.5 rounded-md tracking-wide">
              {t('skills.required_level', { level: skill.min_level_required })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


const SkillsPanel = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const currentLang = localStorage.getItem('i18nextLng') || 'es'; 

  const { data: player } = useQuery({
    queryKey: ['playerProfile'],
    queryFn: hunterService.getProfile,
  });

  const { data: skills = [], isLoading, isError } = useQuery({
    queryKey: ['skills'],
    queryFn: SkillsService.getAllSkills,
  });

  const { t } = useTranslation();
  const upgradeMutation = useMutation({
    mutationFn: (skillId: number) => SkillsService.upgradeSkill(skillId),
    onSuccess: (data) => {
      toastNotification.success(data.message || t('skills.buy_skill_success'), t('skills.buy_skill_message'));
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
    },
    onError: (err) => {
      toastNotification.error(t('skills.system_error'), err.message || t('skills.insufficient_sp'));
    }
  });

  const filteredSkills = useMemo(() => {
    return skills
      .filter(skill => {
        if (!searchTerm.trim()) return true;
        const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cleanSearch = normalizeText(searchTerm);
        const skillName = skill.name[currentLang] || skill.name['es'] || '';
        return normalizeText(skillName).includes(cleanSearch);
      })
      .sort((skillA, skillB) => {
        if (skillA.is_unlocked && !skillB.is_unlocked) return -1;
        if (!skillA.is_unlocked && skillB.is_unlocked) return 1;
        const normalizeText = (text: string) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const nameA = normalizeText(skillA.name[currentLang] || skillA.name['es'] || '');
        const nameB = normalizeText(skillB.name[currentLang] || skillB.name['es'] || '');
        return nameA.localeCompare(nameB);
      });
  }, [skills, searchTerm, currentLang]);

  if (isLoading) {
    return (
      <div className="min-h-350 flex items-center justify-center p-6">
        <PreLoader message={t('skills.syncing')} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10 border border-system-red/30 bg-system-red/5 rounded-xl text-center max-w-[1240px] mx-auto shadow-[0_0_30px_var(--color-system-red)/0.05]">
        <p className="font-mono text-system-red text-lg uppercase tracking-widest animate-pulse">{t('skills.error_connection')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-fade-in-up mx-auto w-full max-w-[1240px] px-4 py-4">
      

      <div className="system-panel rounded-2xl p-4 sm:p-5 md:p-6 border-b-2 border-system-gold/40 bg-zinc-900/20 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center gap-4">
            <div className="p-3 md:p-4 bg-zinc-900/80 rounded-xl border border-system-glow/60 shadow-[0_0_15px_var(--color-system-glow)/0.15]">
              <Zap className="w-6 h-6 md:w-8 h-8 system-text animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-mono font-black system-text uppercase tracking-[0.15em] sm:tracking-[0.25em]">{t('skills.title')}</h2>
              <p className="text-[9px] sm:text-[10px] md:text-xs text-zinc-400 font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1">{t('skills.subtitle')}</p>
            </div>
          </div>


          <div className="flex items-center justify-between lg:justify-end gap-5 bg-zinc-900/60 px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-zinc-800 hover:border-system-glow/60 shadow-inner w-full lg:w-auto min-w-0 sm:min-w-[240px]">
            <span className="text-[10px] md:text-sm text-zinc-400 font-mono font-bold uppercase tracking-widest">{t('skills.skill_points')}</span>
            <div className="flex items-center gap-2 shrink-0">
              <ChevronsUp className="w-7 h-7 text-system-glow" />
              <span className="text-xl md:text-2xl font-mono text-system-glow font-bold tracking-tight">
                {player?.skill_points ?? 0} <span className="text-xs md:text-base text-system-glow/80">SP</span>
              </span>
            </div>
          </div>

        </div>
      </div>


      <div className="system-panel rounded-2xl p-4 sm:p-5 md:p-6 bg-zinc-900/10 border border-zinc-900">
        

        <div className="w-full bg-zinc-900/40 border border-zinc-800/80 p-2 rounded-xl mb-6 shadow-md transition-all">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-zinc-500 pointer-events-none transition-colors" />
            <input 
              type="text"
              placeholder={t('skills.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 sm:h-13 bg-zinc-950/80 border border-zinc-800/60 rounded-lg pl-12 pr-5 py-3 text-sm font-mono tracking-wide placeholder:text-zinc-600 text-zinc-200 focus:outline-none focus:border-system-glow/60 focus:bg-zinc-950 focus:shadow-[0_0_15px_rgba(var(--color-system-glow),0.1)] transition-all"
            />
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSkills.map((skill) => (
            <SkillCard 
              key={skill.id} 
              skill={skill} 
              currentLang={currentLang}
              playerSP={player?.skill_points ?? 0}
              onUpgrade={(id) => upgradeMutation.mutate(id)}
              isPending={upgradeMutation.isPending}
            />
          ))}
        </div>


        {filteredSkills.length === 0 && (
          <div className="text-center py-12 text-zinc-600 font-mono text-sm border border-dashed border-zinc-800 bg-zinc-900/5 rounded-xl mt-6 uppercase tracking-widest">
            ⚠️ {t('skills.no_matches')}
          </div>
        )}
      </div>

    </div>
  );
};

export default SkillsPanel;
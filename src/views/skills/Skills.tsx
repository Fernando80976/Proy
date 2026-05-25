import { 
  Sparkles, Lock, Zap, Clock, Flame, Sword, Eye, 
  Wind, Ghost, Heart, Shield, ArrowUpCircle 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SkillsService, { type Skill } from '../../services/SkillsService';
import PreLoader from '../../components/common/Preloader';
import { toastNotification } from '../../components/common/ToastNotification';
import { hunterService } from '../../services/StatusService';

// --- Helper de Iconos ---
const SkillIcon = ({ name, unlocked }: { name: string, unlocked: boolean }) => {
  const props = { className: `w-7 h-7 ${unlocked ? 'animate-pulse-glow text-system-glow' : 'text-muted-foreground'}` };
  const n = name.toLowerCase();
  if (n.includes('espada') || n.includes('strike')) return <Sword {...props} />;
  if (n.includes('ojo') || n.includes('percepción')) return <Eye {...props} />;
  if (n.includes('velocidad') || n.includes('viento')) return <Wind {...props} />;
  if (n.includes('fuego') || n.includes('llama')) return <Flame {...props} />;
  if (n.includes('sombra') || n.includes('sigilo')) return <Ghost {...props} />;
  if (n.includes('salud') || n.includes('vida')) return <Heart {...props} />;
  if (n.includes('defensa') || n.includes('escudo')) return <Shield {...props} />;
  return <Sparkles {...props} />;
};

const SkillsPanel = () => {
  const queryClient = useQueryClient();

  // 1. Obtenemos el perfil del jugador (contiene los SP actuales)
  const { data: player } = useQuery({
    queryKey: ['playerProfile'],
    queryFn: hunterService.getProfile,
  });

  // 2. Obtenemos el catálogo de habilidades
  const { data: skills = [], isLoading, isError } = useQuery({
    queryKey: ['skills'],
    queryFn: SkillsService.getAllSkills,
  });

  // 3. Mutación para mejorar habilidad
  const upgradeMutation = useMutation({
    mutationFn: (skillId: number) => SkillsService.upgradeSkill(skillId),
    onSuccess: (data) => {
      toastNotification.success(data.message || "Evolución Exitosa", "El sistema ha registrado el incremento de poder.");
      // CRITICO: Invalidamos ambas queries para que el SP y el nivel de la skill se actualicen visualmente
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
    },
    onError: (err) => {
      toastNotification.error("Error del Sistema", err.message || "Recursos insuficientes o nivel de jugador bajo.");
    }
  });

  const activeSkills = skills.filter(s => s.mana_cost > 0);
  const passiveSkills = skills.filter(s => s.mana_cost === 0);

  const SkillCard = ({ skill }: { skill: Skill }) => {
    const nombre = skill.name['es'] || 'Habilidad Desconocida';
    const descripcion = skill.description['es'] || 'Sin descripción disponible.';
    
    // CORRECCIÓN: Lógica de nivel máximo
    const isMaxLevel = skill.current_level >= skill.max_level;
    
    // CORRECCIÓN: Cálculo de SP reactivo basado en el perfil del jugador cargado
    const currentSP = player?.skill_points ?? 0;
    const canAfford = currentSP >= skill.base_upgrade_sp_cost;

    return (
      <div className={`system-panel rounded-lg p-5 border transition-all duration-300 relative overflow-hidden ${
        skill.is_unlocked 
          ? 'border-system-glow/20 bg-system-glow/5 shadow-[0_0_15px_rgba(0,229,255,0.05)]' 
          : 'border-white/5 opacity-60 grayscale'
      }`}>

        <div className="flex gap-5">
          {/* Icono de Habilidad */}
          <div className={`relative flex-shrink-0 w-16 h-16 flex items-center justify-center border rounded transform rotate-3 bg-black/60 ${
            skill.is_unlocked ? 'border-system-glow/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]' : 'border-white/10'
          }`}>
            <div className="-rotate-3">
              {skill.is_unlocked ? <SkillIcon name={nombre} unlocked={true} /> : <Lock className="w-6 h-6 text-muted-foreground" />}
            </div>
          </div>

          {/* Información Principal */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-mono font-bold uppercase tracking-widest text-lg ${
                  skill.is_unlocked ? 'text-white' : 'text-muted-foreground'
                }`}>
                  {nombre}
                </h3>
                {skill.is_unlocked && (
                   <p className="text-[10px] font-mono text-system-glow/60 uppercase">Estado: Operativo</p>
                )}
              </div>

              {skill.is_unlocked && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[9px] font-mono text-muted-foreground uppercase leading-none">LVL</span>
                    <span className="text-xl font-mono font-black text-system-glow italic leading-none">
                      {skill.current_level}
                    </span>
                  </div>
                  
                  {!isMaxLevel && (
                    <button
                      onClick={() => upgradeMutation.mutate(skill.id)}
                      disabled={upgradeMutation.isPending || !canAfford}
                      className={`group relative flex items-center justify-center p-1.5 rounded border transition-all ${
                        canAfford 
                          ? 'border-system-glow bg-system-glow/10 hover:bg-system-glow hover:text-black shadow-[0_0_10px_rgba(0,229,255,0.2)]' 
                          : 'border-white/10 opacity-40 cursor-not-allowed'
                      }`}
                      title={canAfford ? `Mejorar por ${skill.base_upgrade_sp_cost} SP` : "Puntos de SP insuficientes"}
                    >
                      <ArrowUpCircle className={`w-5 h-5 ${canAfford ? 'animate-bounce-subtle' : ''}`} />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-xs font-sans text-muted-foreground leading-relaxed italic line-clamp-2">
              "{descripcion}"
            </p>
          </div>
        </div>

        {/* Footer de Stats */}
        {skill.is_unlocked ? (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 mb-4">
              
              {/* COSTE DE MANÁ */}
              {skill.mana_cost > 0 && (
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-blue-400/60 uppercase">Consumo MP</span>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-mono text-blue-400 font-bold">
                      {skill.current_mana_cost ?? skill.mana_cost}
                    </span>
                  </div>
                </div>
              )}

              {skill.damage_multiplier > 1 && (
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-red-400/60 uppercase">Potencia</span>
                  <div className="flex items-center gap-1.5">
                    <Sword className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-sm font-mono text-red-400 font-bold">x{skill.damage_multiplier}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-muted-foreground uppercase">Cooldown</span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-sm font-mono font-bold">{skill.cooldown}T</span>
                </div>
              </div>
              
              {/* Coste de SP interactivo */}
              {!isMaxLevel && (
                <div className="ml-auto flex flex-col items-end">
                  <span className="text-[9px] font-mono text-system-glow uppercase">Coste Mejora</span>
                  <div className={`text-sm font-mono font-bold px-2 rounded ${canAfford ? 'text-white bg-system-glow/20' : 'text-red-500 bg-red-500/10'}`}>
                    {skill.next_upgrade_cost} SP
                  </div>
                </div>
              )}
            </div>

            {/* BARRA DE MAESTRÍA CORREGIDA */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-mono uppercase tracking-widest">
                <span className="text-muted-foreground">Progreso de Maestría</span>
                <span className={isMaxLevel ? "text-amber-400 animate-pulse" : "text-system-glow"}>
                  {isMaxLevel ? "Nivel Máximo Alcanzado" : `${skill.current_level} / ${skill.max_level}`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px] ${
                    isMaxLevel 
                      ? 'bg-amber-400 shadow-amber-400/50' 
                      : 'bg-gradient-to-r from-system-glow/40 via-system-glow to-system-glow/40 shadow-system-glow/50'
                  }`} 
                  style={{ width: `${(skill.current_level / skill.max_level) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-white/5">
              <div className="flex items-center gap-2 bg-red-500/5 p-2 rounded">
                <Lock className="w-3 h-3 text-red-500" />
                <span className="text-[10px] font-mono text-red-400/80 uppercase tracking-widest">
                  Bloqueado: Requiere Nivel {skill.min_level_required}
                </span>
              </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="min-h-[400px] flex items-center justify-center"><PreLoader message="Sincronizando con el Gran Oráculo..." /></div>;
  if (isError) return <div className="text-center text-red-500 font-mono p-10">Error: Enlace con el sistema interrumpido.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 animate-fade-in">
      
      {/* HEADER HUD */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-system-glow/20 blur opacity-30"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-center bg-black/60 border-x border-system-glow/30 p-8 backdrop-blur-md">
          <div className="text-center md:text-left">
            <h1 className="text-6xl font-mono font-black system-text tracking-tighter italic uppercase leading-none">
              Habilidades
            </h1>
            <div className="flex items-center gap-2 mt-3 justify-center md:justify-start">
              <div className="h-1 w-16 bg-system-glow"></div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em]">
                Protocolo de Evolución de Cazador
              </p>
            </div>
          </div>

          <div className="mt-8 md:mt-0 flex flex-col items-center md:items-end">
            <span className="text-[10px] font-mono text-system-glow uppercase tracking-[0.2em] mb-2">
              Puntos de Habilidad Disponibles
            </span>
            <div className="flex items-center gap-5 bg-system-glow/5 border border-system-glow/20 px-10 py-4 rounded relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-system-glow"></div>
              <Sparkles className="w-7 h-7 text-system-glow animate-pulse" />
              <span className="text-5xl font-mono font-bold text-white leading-none">
                {player?.skill_points ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-16">
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-mono font-bold text-white uppercase tracking-[0.2em] px-4 border-l-4 border-system-glow">
              Activas
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-system-glow/20 to-transparent" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {activeSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </section>

        <section className="pb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-mono font-bold text-white/40 uppercase tracking-[0.2em] px-4 border-l-4 border-white/20">
              Pasivas
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {passiveSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SkillsPanel;
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Swords, Heart, Zap, Shield, RotateCw, Loader2 } from 'lucide-react';
import { BattleService, type BattleEntity, type BattleState } from '../../services/BattleService';

interface BattleStatBlockProps {
  entity: BattleEntity;
  label: string;
  isPlayer?: boolean;
  reverse?: boolean;
}

interface StatBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  icon: React.ReactNode;
  reverse?: boolean;
}

interface BattleModalProps {
  dungeon: { id: number; name: string; boss: string };
  onClose: () => void;
}

const BattleModal = ({ dungeon, onClose }: BattleModalProps) => {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Conexión inicial
  useEffect(() => {
    const ws = BattleService.createConnection((state) => setBattleState(state), dungeon.id);
    wsRef.current = ws;

    return () => ws.close(); // Cleanup al cerrar el modal
  }, [dungeon.id]);

  // Scroll automático del log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleState?.log]);

  const parseName = (name: string | { [key: string]: string }) => 
    typeof name === 'string' ? name : name?.en || '???';

  if (!battleState) return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-mono">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-system-glow animate-spin mx-auto mb-4" />
        <p className="text-system-glow animate-pulse uppercase tracking-[0.3em]">Iniciando Resonancia de Maná...</p>
      </div>
    </div>
  );

  if (!battleState.player || !battleState.enemy || !battleState.log) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-mono">
        <div className="text-center text-red-400">
          <p className="uppercase tracking-[0.2em]">Error de sincronizacion de batalla</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 border border-red-500/40 rounded">Cerrar</button>
        </div>
      </div>
    );
  }

  const { player, enemy, status, turn, round } = battleState;
  const isPlayerTurn = turn === 'player' && status === 'active';

  return createPortal(
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="system-panel w-full max-w-2xl rounded-xl p-6 bg-black/60 border border-system-glow/30 shadow-[0_0_50px_-12px_rgba(0,255,255,0.3)]">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <h2 className="font-mono text-system-glow uppercase tracking-widest flex items-center gap-2 text-lg">
            <Swords className="w-5 h-5 text-red-500" /> {dungeon.name}
          </h2>
          <span className="font-mono text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
            ROUND {round}
          </span>
        </div>

        {/* HUD de Combate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <BattleStatBlock entity={player} label={player.name} isPlayer />
          <BattleStatBlock entity={enemy} label={enemy.name || dungeon.boss} reverse />
        </div>

        {/* Log de Eventos */}
        <div className="bg-black/40 rounded-lg p-4 h-48 overflow-y-auto font-mono text-[11px] border border-white/5 mb-6 custom-scrollbar shadow-inner">
          {battleState.log?.map((line, i) => (
            <p key={i} className={`mb-1 transition-all duration-300 ${line.includes('WIN') ? 'text-system-glow font-bold' : line.includes('DIED') ? 'text-red-500' : 'text-slate-300'}`}>
              <span className="opacity-30 mr-2">[{i}]</span> {line}
            </p>
          ))}
          {turn === 'enemy' && status === 'active' && (
            <div className="text-red-500 animate-pulse mt-2 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Enemigo atacando...
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Panel de Acciones */}
        <div className="space-y-3">
          {status === 'active' ? (
            <>
              <button 
                disabled={!isPlayerTurn} 
                onClick={() => BattleService.sendAction(wsRef.current, 'attack')}
                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-system-glow/10 hover:border-system-glow/50 rounded-lg text-xs font-mono uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-20"
              >
                <Shield className="w-4 h-4" /> Ataque Básico
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                {player.skills?.map((skill) => (
                  <button
                    key={skill.id}
                    disabled={!isPlayerTurn || skill.cd > 0 || player.mp < skill.mana_cost}
                    onClick={() => BattleService.sendAction(wsRef.current, 'skill', skill.id)}
                    className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-system-glow/20 text-left transition-all disabled:opacity-20 relative group"
                  >
                    <div className="text-[10px] text-system-glow font-bold uppercase truncate">{parseName(skill.name)}</div>
                    <div className="text-[9px] text-muted-foreground">
                      {skill.cd > 0 ? `COOLDOWN: ${skill.cd}` : `COST: ${skill.mana_cost} MP`}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex gap-4 animate-bounce-in">
              <button onClick={onClose} className="flex-1 py-4 bg-system-glow text-black font-black rounded-lg uppercase text-xs tracking-widest hover:brightness-110">Cerrar Puerta</button>
              <button onClick={() => BattleService.sendAction(wsRef.current, 'reset', undefined, dungeon.id)} className="flex-1 py-4 bg-white/10 rounded-lg uppercase text-xs flex items-center justify-center gap-2 border border-white/20 hover:bg-white/20 transition-all"><RotateCw className="w-4 h-4" /> Reintentar</button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

// --- SUB-COMPONENTES AUXILIARES ---

const BattleStatBlock = ({ entity, label, isPlayer, reverse }: BattleStatBlockProps) => (
  <div className={`space-y-3 ${reverse ? 'text-right' : ''}`}>
    <p className={`font-mono text-xs uppercase font-bold tracking-tighter ${isPlayer ? 'text-system-glow' : 'text-red-400'}`}>
      {label}
    </p>
    <StatBar label="HP" current={entity.hp} max={entity.max_hp} color="bg-red-500" icon={<Heart className="w-3 h-3 text-red-400" />} reverse={reverse} />
    {isPlayer && (
       <StatBar label="MP" current={entity.mp} max={entity.max_mp} color="bg-blue-500" icon={<Zap className="w-3 h-3 text-blue-400" />} reverse={reverse} />
    )}
  </div>
);

const StatBar = ({ label, current, max, color, icon, reverse }: StatBarProps) => (
  <div>
    <div className={`flex justify-between text-[10px] font-mono mb-1 ${reverse ? 'flex-row-reverse' : ''}`}>
      <span className="flex items-center gap-1">{icon} {label}</span>
      <span>{current} / {max}</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
      <div 
        className={`h-full transition-all duration-500 ${color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} 
        style={{ width: `${Math.max(0, (current / Math.max(1, max)) * 100)}%` }} 
      />
    </div>
  </div>
);

export default BattleModal;
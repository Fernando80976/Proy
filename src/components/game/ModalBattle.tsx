import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Swords,
  Heart,
  Zap,
  Shield,
  RotateCw,
  Loader2,
  Moon,
  FlaskConical,
  ArrowLeft,
  Footprints,
} from 'lucide-react';
import { BattleService, type BattleEntity, type BattleState } from '../../services/BattleService';
import { useTranslation } from 'react-i18next';

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

type MenuView = 'main' | 'attack' | 'items';

const BattleModal = ({ dungeon, onClose }: BattleModalProps) => {
  const { t } = useTranslation();
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [wsError, setWsError] = useState<string | null>(null);

  const [menuView, setMenuView] = useState<MenuView>('main');
  const wsRef = useRef<WebSocket | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = BattleService.createConnection(
      (state) => setBattleState(state),
      dungeon.id,
      (error) => setWsError(error),
    );
    wsRef.current = ws;
    return () => ws.close();
  }, [dungeon.id]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleState?.log]);

  useEffect(() => {
  document.body.style.overflow = 'hidden';

  return () => {
    document.body.style.overflow = '';
  };
}, []);

  const parseName = (name: string | { [key: string]: string }) =>
    typeof name === 'string' ? name : name?.en || '???';

  if (wsError)
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-mono">
        <div className="system-panel text-center p-10 rounded-xl border border-system-glow/30 bg-black/60 max-w-sm w-full">
          <Moon className="w-12 h-12 text-system-glow mx-auto mb-4" />
          <p className="text-system-glow uppercase tracking-widest text-lg mb-2">
            {t('backend_errors.ERR_MAX_FATIGUE_TITLE')}
          </p>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            {t(`backend_errors.${wsError}`)}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-system-glow/40 text-system-glow hover:bg-system-glow/10 rounded-md text-sm uppercase tracking-widest transition-colors"
          >
            {t('backend_errors.ERR_MAX_FATIGUE_BTN')}
          </button>
        </div>
      </div>
    );

  if (!battleState)
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-mono">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-system-glow animate-spin mx-auto mb-4" />
          <p className="text-system-glow animate-pulse uppercase tracking-widest text-sm">
            {t('battle.initializing')}
          </p>
        </div>
      </div>
    );

  if (!battleState.player || !battleState.enemy || !battleState.log) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-mono">
        <div className="text-center text-red-400">
          <p className="uppercase tracking-widest text-base">{t('battle.sync_error')}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 border border-red-500/40 rounded">
            {t('battle.close')}
          </button>
        </div>
      </div>
    );
  }

  const { player, enemy, status, turn, round } = battleState;
  const isPlayerTurn = turn === 'player' && status === 'active';
  const displayMenu = isPlayerTurn ? menuView : 'main';

  return createPortal(
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 overflow-auto animate-fade-in">
      <div className="system-panel w-full max-w-[min(100vw-1.5rem,42rem)] max-h-[calc(100vh-2rem)]s rounded-xl p-4 sm:p-6 bg-black/60 border border-system-glow/30 shadow-[0_0_50px_-12px_rgba(0,255,255,0.15)]">
        <div className="flex flex-col h-full">
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 border-b border-white/10 pb-4">
            <h2 className="font-mono text-system-glow uppercase tracking-wider flex items-center gap-3 text-lg">
              <Swords className="w-5 h-5 text-red-500" /> <span className="font-bold text-lg">{dungeon.name}</span>
            </h2>
            <span className="font-mono text-sm text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">
              {t('battle.round')} {round}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <BattleStatBlock entity={player} label={player.name} isPlayer />
              <BattleStatBlock entity={enemy} label={enemy.name || dungeon.boss} reverse />
            </div>

          
            <div className="bg-black/40 rounded-lg p-4 h-40 sm:h-48 overflow-y-auto font-mono text-sm border border-white/5 mb-6 custom-scrollbar shadow-inner">
              {battleState.log?.map((line, i) => (
                <p
                  key={i}
                  className={`mb-1 leading-relaxed ${
                    line.includes('WIN')
                      ? 'text-system-glow font-bold'
                      : line.includes('DIED')
                      ? 'text-red-500 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="opacity-40 mr-2">[{i}]</span> {line}
                </p>
              ))}
              {turn === 'enemy' && status === 'active' && (
                <div className="text-red-500 animate-pulse mt-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> <span className="font-bold">{t('battle.enemy_attacking')}</span>
                </div>
              )}
              <div ref={logEndRef} />
            </div>

          
            <div className="min-h-[120px]">
              {status === 'active' ? (
                <div className="animate-fade-in">
          
                  {displayMenu === 'main' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { icon: Swords, label: t('battle.attack'), view: 'attack', color: 'text-red-400' },
                        { icon: FlaskConical, label: t('battle.consumable'), view: 'items', color: 'text-yellow-400' },
                        { icon: Footprints, label: t('battle.flee'), view: null, color: 'text-gray-400' },
                      ].map((item, i) => (
                        <button
                          key={i}
                          disabled={!isPlayerTurn}
                          onClick={() => (item.view ? setMenuView(item.view as MenuView) : onClose())}
                          className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-sm font-mono uppercase flex flex-col items-center justify-center gap-3 disabled:opacity-20 transition-colors"
                        >
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                          <span className="font-bold tracking-wide text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

          
                  {(displayMenu === 'attack' || displayMenu === 'items') && (
                    <div className="space-y-3 animate-fade-in">
                      <button
                        onClick={() => setMenuView('main')}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-lg text-sm font-mono uppercase flex items-center justify-center gap-2 hover:bg-white/10 text-muted-foreground"
                      >
                        <ArrowLeft className="w-4 h-4" /> {t('battle.back')}
                      </button>

                      {displayMenu === 'attack' && (
                        <button
                          disabled={!isPlayerTurn}
                          onClick={() => {
                            BattleService.sendAction(wsRef.current, 'attack');
                            setMenuView('main');
                          }}
                          className="w-full py-3 bg-white/5 border border-system-glow/30 rounded-lg text-sm font-mono uppercase text-system-glow font-bold hover:bg-system-glow/10 transition-all"
                        >
                          <Shield className="w-4 h-4 inline mr-2" /> {t('battle.basic_attack')}
                        </button>
                      )}

                      {displayMenu === 'attack' && player.skills && player.skills.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5 mt-2">
                          {player.skills.map((skill) => (
                            <button
                              key={skill.id}
                              disabled={!isPlayerTurn || skill.cd > 0 || player.mp < skill.mana_cost}
                              onClick={() => {
                                BattleService.sendAction(wsRef.current, 'skill', skill.id);
                                setMenuView('main');
                              }}
                              className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-system-glow/20 text-left transition-all disabled:opacity-20"
                            >
                              <div className="text-[12px] text-system-glow font-bold uppercase truncate">
                                {parseName(skill.name)}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-1">
                                {skill.cd > 0 ? `${t('battle.cooldown')}: ${skill.cd}` : `${t('battle.cost')}: ${skill.mana_cost} MP`}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {displayMenu === 'items' && (
                        <>
                          {player.potions && player.potions.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {player.potions.map((potion) => (
                                <button
                                  key={potion.inventory_id}
                                  disabled={!isPlayerTurn}
                                  onClick={() => {
                                    BattleService.sendAction(
                                      wsRef.current,
                                      'potion',
                                      undefined,
                                      undefined,
                                      potion.inventory_id,
                                    );
                                    setMenuView('main');
                                  }}
                                  className="p-2 rounded-lg border border-yellow-500/20 bg-white/5 hover:bg-yellow-500/10 text-left transition-all disabled:opacity-20"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <FlaskConical className="w-4 h-4 text-yellow-400" />
                                    <span className="text-[12px] text-yellow-400 font-bold uppercase truncate">
                                      {parseName(potion.name)}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground">x{potion.quantity}</div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center p-4 border border-white/5 bg-white/5 rounded-lg text-muted-foreground text-sm font-mono uppercase">
                              {t('battle.no_consumables')}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-system-glow text-black font-black rounded-lg uppercase text-sm"
                  >
                    {t('battle.close_gate')}
                  </button>
                  <button
                    onClick={() => BattleService.sendAction(wsRef.current, 'reset', undefined, dungeon.id)}
                    className="flex-1 py-3 bg-white/10 rounded-lg uppercase text-sm flex items-center justify-center gap-2 border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <RotateCw className="w-4 h-4" /> {t('battle.retry')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};



const BattleStatBlock = ({ entity, label, isPlayer, reverse }: BattleStatBlockProps) => (
  <div className={`space-y-3 ${reverse ? 'text-right' : ''}`}>
    <p
      className={`font-mono uppercase font-bold tracking-wider ${
        isPlayer ? 'text-system-glow text-sm' : 'text-red-400 text-sm'
      }`}
    >
      {label}
    </p>
    <StatBar
      label="HP"
      current={entity.hp}
      max={entity.max_hp}
      color="bg-red-500"
      icon={<Heart className="w-4 h-4 text-red-400" />}
      reverse={reverse}
    />
    {isPlayer && (
      <StatBar
        label="MP"
        current={entity.mp}
        max={entity.max_mp}
        color="bg-blue-500"
        icon={<Zap className="w-4 h-4 text-blue-400" />}
        reverse={reverse}
      />
    )}
  </div>
);

const StatBar = ({ label, current, max, color, icon, reverse }: StatBarProps) => (
  <div className="flex flex-col gap-1">
    <div className={`flex justify-between items-center text-[12px] font-mono ${reverse ? 'flex-row-reverse' : ''}`}>
      <span className="flex items-center gap-2 opacity-80">
        {icon} <span className="font-medium">{label}</span>
      </span>
      <span className="font-bold text-sm">{current} / {max}</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
      <div
        className={`h-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.max(0, (current / Math.max(1, max)) * 100)}%` }}
      />
    </div>
  </div>
);

export default BattleModal;
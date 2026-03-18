'use client'

import { PlayerData, DungeonInfo, getDungeons, clearDungeon, extractShadow, restPlayer, getRankColor, loadAuth } from '@/lib/game-store'
import { Landmark, Skull, Layers, Lock, Swords, Moon, Ghost, RotateCw, Filter } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface DungeonsPanelProps {
  player: PlayerData
  onUpdatePlayer: (player: PlayerData) => void
}

type BattleState = 'idle' | 'entering' | 'fighting' | 'victory' | 'defeat'

interface TurnBattleSkill {
  name: string
  cd: number
  description?: string
  type?: string
  power?: number
}

interface TurnBattleFighter {
  name: string
  hp: number
  max_hp: number
  level?: number
  status?: string
  skills: TurnBattleSkill[]
}

interface TurnBattleState {
  enemy: TurnBattleFighter
  player: TurnBattleFighter
  turn: 'player' | 'enemy' | string
  round?: number
  log: string[]
}

const getHpPercent = (hp: number, maxHp: number) => {
  if (!maxHp || maxHp <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)))
}

export function DungeonsPanel({ player, onUpdatePlayer }: DungeonsPanelProps) {
  const [dungeons] = useState<DungeonInfo[]>(getDungeons)
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonInfo | null>(null)
  const [battleState, setBattleState] = useState<BattleState>('idle')
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [showBattle, setShowBattle] = useState(false)
  const [bossHp, setBossHp] = useState(100)
  const [rankFilter, setRankFilter] = useState<string>('all')
  const wsRef = useRef<WebSocket | null>(null)
  const [turnBattle, setTurnBattle] = useState<TurnBattleState | null>(null)
  const [openTurnBattle, setOpenTurnBattle] = useState(false)
  const [turnBattleStatus, setTurnBattleStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [turnBattleError, setTurnBattleError] = useState('')
  const [activeSkill, setActiveSkill] = useState<number | null>(null)

  const ranks = ['all', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'National']

  const filteredDungeons = rankFilter === 'all' ? dungeons : dungeons.filter(d => d.rank === rankFilter)

  const canEnter = (dungeon: DungeonInfo) => {
    return player.level >= Math.max(1, dungeon.recommendedLevel - 3) && player.fatigue < player.maxFatigue
  }

  const startDungeon = (dungeon: DungeonInfo) => {
    setSelectedDungeon(dungeon)
    setShowBattle(true)
    setBattleState('entering')
    setBattleLog(['Entering dungeon...'])
    setBossHp(100)

    setTimeout(() => {
      setBattleState('fighting')
      setBattleLog(prev => [...prev, `Floor 1/${dungeon.floors} - Fighting monsters...`])
    }, 1000)
  }

  useEffect(() => {
    if (battleState !== 'fighting' || !selectedDungeon) return

    const totalPower = player.stats.strength * 2 + player.stats.agility + player.stats.intelligence + player.shadows.length * 5
    const dungeonDifficulty = selectedDungeon.recommendedLevel * 3
    const winChance = Math.min(0.95, Math.max(0.3, totalPower / (totalPower + dungeonDifficulty)))

    let currentFloor = 1
    const totalFloors = selectedDungeon.floors
    const interval = setInterval(() => {
      const floorCleared = Math.random() < winChance
      
        
      if (floorCleared) {
        const safeFloor = Math.min(currentFloor, totalFloors)
        setBossHp(prev => Math.max(0, prev - (100 / totalFloors)))
        setBattleLog(prev => [...prev, `Floor ${safeFloor}/${totalFloors} cleared!`])

        if (safeFloor >= totalFloors) {
          setBattleState('victory')
          setBattleLog(prev => [...prev, `Boss "${selectedDungeon.boss}" defeated!`, 'Dungeon cleared!'])
          clearInterval(interval)
          return
        }

        currentFloor = safeFloor + 1
      } else {
        setBattleState('defeat')
        const safeFloor = Math.min(currentFloor, totalFloors)
        setBattleLog(prev => [...prev, `Defeated on floor ${safeFloor}... The dungeon was too strong.`])
        clearInterval(interval)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [battleState, selectedDungeon, player.stats, player.shadows.length])

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  const handleVictoryRewards = () => {
    if (!selectedDungeon) return
    let p = clearDungeon(player, selectedDungeon)
    onUpdatePlayer(p)
    setShowBattle(false)
    setBattleState('idle')
  }

  const handleExtractShadow = () => {
    if (!selectedDungeon) return
    let p = clearDungeon(player, selectedDungeon)
    p = extractShadow(p, selectedDungeon.name, selectedDungeon.boss, selectedDungeon.rank)
    onUpdatePlayer(p)
    setShowBattle(false)
    setBattleState('idle')
  }

  const handleDefeat = () => {
    setShowBattle(false)
    setBattleState('idle')
  }

  const handleRest = () => {
    onUpdatePlayer(restPlayer(player))
  }

  const startTurnBattle = () => {
    setOpenTurnBattle(true)
    setTurnBattleError('')
    setTurnBattleStatus('connecting')

    const auth = loadAuth()
    if (!auth) {
      setTurnBattleStatus('error')
      setTurnBattleError('Sesion no encontrada. Inicia sesion para entrar al combate por turnos.')
      return
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    const wsBase = process.env.NEXT_PUBLIC_BATTLE_WS_URL ?? 'wss://repoback-h7gh.onrender.com/ws'
    const wsUrl = `${wsBase}?username=${encodeURIComponent(auth.username)}&session_token=${encodeURIComponent(auth.sessionToken)}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      setTurnBattleStatus('connected')
    }

    ws.onmessage = evt => {
      try {
        const st = JSON.parse(evt.data) as TurnBattleState
        setTurnBattle({ ...st })
      } catch {
        setTurnBattleError('No se pudo interpretar la respuesta del servidor de combate.')
      }
    }

    ws.onerror = () => {
      setTurnBattleStatus('error')
      setTurnBattleError('No fue posible conectar con el servidor de combate por turnos.')
    }

    ws.onclose = () => {
      setTurnBattleStatus(prev => (prev === 'error' ? 'error' : 'idle'))
    }
  }

  const closeTurnBattle = () => {
    setOpenTurnBattle(false)
    setActiveSkill(null)
    setTurnBattleStatus('idle')
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  const sendSkill = (i: number) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    setActiveSkill(i)
    wsRef.current.send(JSON.stringify({ skill: i }))
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            Dungeons
          </h2>
          <button
            type="button"
            onClick={startTurnBattle}
            className="px-3 py-2 rounded bg-blue-500/20 text-blue-200 border border-blue-400/40 hover:bg-blue-500/30 transition-colors text-xs font-mono"
          >
            Arena por Turnos
          </button>
          <button
            onClick={handleRest}
            className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-system-glow transition-colors px-2 py-1 rounded border border-border hover:border-system-glow/30"
          >
            <Moon className="w-3 h-3" />
            Rest
          </button>
          
        </div>

        {/* Fatigue Bar */}
        <div className="mb-4 p-3 rounded system-panel">
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-muted-foreground">Fatigue</span>
            <span className={player.fatigue >= player.maxFatigue ? 'text-system-red' : 'text-foreground'}>{player.fatigue}/{player.maxFatigue}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                player.fatigue >= player.maxFatigue ? 'bg-system-red' : player.fatigue >= 70 ? 'bg-yellow-500' : 'bg-system-green'
              }`}
              style={{ width: `${(player.fatigue / player.maxFatigue) * 100}%` }}
            />
          </div>
          {player.fatigue >= player.maxFatigue && (
            <p className="mt-2 text-system-red text-[10px] font-mono uppercase">Maximum fatigue reached. Rest to continue.</p>
          )}
        </div>

        {/* Rank Filter */}
        <div className="flex gap-1.5 mb-4 flex-wrap items-center">
          <Filter className="w-3 h-3 text-muted-foreground mr-1" />
          {ranks.map(r => (
            <button
              key={r}
              onClick={() => setRankFilter(r)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border transition-all ${
                rankFilter === r
                  ? 'bg-system-glow/20 text-system-glow border-system-glow/40'
                  : 'bg-secondary/50 text-muted-foreground border-border hover:border-system-glow/20'
              }`}
            >
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredDungeons.map(dungeon => {
            const accessible = canEnter(dungeon)
            const cleared = player.dungeonHistory.includes(dungeon.id)
            const isRepeat = cleared
            return (
              <div
                key={dungeon.id}
                className={`system-panel rounded-lg p-4 transition-all ${
                  accessible ? 'cursor-pointer hover:border-system-glow/50' : 'opacity-40 pointer-events-none'
                } ${cleared ? 'border-system-green/20' : ''}`}
                onClick={() => accessible ? startDungeon(dungeon) : undefined}
                role={accessible ? 'button' : undefined}
                tabIndex={accessible ? 0 : undefined}
                onKeyDown={(e) => { if (e.key === 'Enter' && accessible) startDungeon(dungeon) }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {!accessible ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : isRepeat ? (
                      <RotateCw className="w-4 h-4 text-system-green" />
                    ) : (
                      <Skull className="w-4 h-4 text-system-red" />
                    )}
                    <span className="text-sm font-bold font-sans text-foreground">{dungeon.name}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold ${getRankColor(dungeon.rank)}`}>
                    {dungeon.rank}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-xs text-muted-foreground font-sans">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{dungeon.floors} Floors</span>
                    <span className="mx-1">-</span>
                    <Swords className="w-3 h-3" />
                    <span>{dungeon.boss}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-system-glow">Lv.{dungeon.recommendedLevel}+</span>
                    <span className="mx-1">|</span>
                    <span className="text-system-gold">+{isRepeat ? Math.floor(dungeon.rewards.gold * 0.6) : dungeon.rewards.gold}G</span>
                    <span className="mx-1">|</span>
                    <span className="text-system-glow">+{isRepeat ? Math.floor(dungeon.rewards.exp * 0.6) : dungeon.rewards.exp}EXP</span>
                  </div>
                </div>
                {isRepeat && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-system-green uppercase">
                    <RotateCw className="w-2.5 h-2.5" /> Cleared - 60% rewards
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Battle Dialog */}
      <Dialog open={showBattle} onOpenChange={(open) => { if (!open && battleState !== 'fighting' && battleState !== 'entering') setShowBattle(false) }}>
        <DialogContent className="system-panel border-system-glow/30 max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="font-mono system-text flex items-center gap-2">
              <Swords className="w-5 h-5" />
              {selectedDungeon?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-sans">
              {battleState === 'entering' && 'Entering the dungeon...'}
              {battleState === 'fighting' && `Fighting through ${selectedDungeon?.floors} floors...`}
              {battleState === 'victory' && 'Dungeon cleared!'}
              {battleState === 'defeat' && 'You have been defeated...'}
            </DialogDescription>
          </DialogHeader>

          {/* Boss HP Bar */}
          {selectedDungeon && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-system-red">{selectedDungeon.boss}</span>
                <span className="text-system-red">{Math.max(0, Math.round(bossHp))}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500"
                  style={{ width: `${Math.max(0, bossHp)}%` }}
                />
              </div>
            </div>
          )}

          {/* Battle Log */}
          <div className="max-h-48 overflow-y-auto bg-background/50 rounded p-3 font-mono text-xs flex flex-col gap-1">
            {battleLog.map((log, i) => (
              <p key={i} className={`animate-slide-in ${
                log.includes('cleared') ? 'text-system-green' :
                log.includes('defeated') || log.includes('Defeated') ? 'text-system-red' :
                log.includes('Boss') ? 'text-system-gold' :
                'text-muted-foreground'
              }`}>
                {'> '}{log}
              </p>
            ))}
            {battleState === 'fighting' && (
              <p className="text-system-glow animate-pulse">{'> Fighting...'}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {battleState === 'victory' && (
              <>
                <button
                  onClick={handleVictoryRewards}
                  className="flex-1 py-2 rounded font-mono text-xs uppercase bg-system-glow/20 text-system-glow border border-system-glow/40 hover:bg-system-glow/30 transition-all"
                >
                  Collect Rewards
                </button>
                {player.skills.some(s => s.id === 'shadow_extraction' && s.unlocked) && (
                  <button
                    onClick={handleExtractShadow}
                    className="flex-1 py-2 rounded font-mono text-xs uppercase bg-purple-500/20 text-purple-400 border border-purple-500/40 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-1"
                  >
                    <Ghost className="w-3 h-3" />
                    Extract Shadow
                  </button>
                )}
              </>
            )}
            {battleState === 'defeat' && (
              <button
                onClick={handleDefeat}
                className="flex-1 py-2 rounded font-mono text-xs uppercase bg-system-red/20 text-system-red border border-system-red/40 hover:bg-system-red/30 transition-all"
              >
                Return
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {openTurnBattle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 md:p-4">
          <div className="relative w-full max-w-6xl h-[calc(100dvh-1rem)] md:h-[calc(100dvh-2rem)] rounded-2xl border border-blue-400/40 bg-slate-950/95 shadow-[0_0_60px_rgba(56,189,248,0.25)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-blue-400/20 bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-blue-500/20">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Combat Simulator</p>
                <h2 className="text-base sm:text-lg md:text-2xl font-mono text-cyan-100">Arena de Turnos - Estilo Pokemon</h2>
              </div>
              <button
                type="button"
                onClick={closeTurnBattle}
                className="px-3 py-2 rounded border border-red-400/40 text-red-200 hover:bg-red-500/20 transition-colors"
              >
                Cerrar
              </button>
            </div>

            <div className="p-3 md:p-5 flex-1 min-h-0 flex flex-col gap-3 md:gap-4">
              {!turnBattle && (
                <div className="rounded-xl border border-blue-400/30 bg-slate-900/70 p-5 text-center">
                  <p className="font-mono text-cyan-100 text-lg">
                    {turnBattleStatus === 'connecting' ? 'Conectando con el servidor de batalla...' : 'Esperando datos del combate...'}
                  </p>
                  <p className="text-sm text-cyan-200/70 mt-2">Se abrira el campo en cuanto llegue el primer estado.</p>
                </div>
              )}

              {turnBattleError && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-red-200 text-sm">
                  {turnBattleError}
                </div>
              )}

              {turnBattle && (
                <>
                  <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-b from-sky-300/20 via-emerald-300/10 to-slate-900 p-3 md:p-4 relative overflow-hidden h-[34dvh] min-h-[220px] max-h-[320px]">
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.15)_0%,transparent_60%)]" />

                    <div className="relative z-10 w-full h-full">
                      <div className="absolute right-0 top-0 w-[48%] max-w-sm rounded-xl border border-slate-800 bg-slate-950/85 p-2.5 md:p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-mono text-sm md:text-base text-red-200 truncate">{turnBattle.enemy.name}</p>
                            <p className="text-xs text-red-100/70">Lv. {turnBattle.enemy.level ?? 50}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded border border-red-300/30 text-red-100/80">{turnBattle.enemy.status ?? 'NORMAL'}</span>
                        </div>
                        <div className="mt-2">
                          <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-orange-300 transition-all duration-300"
                              style={{ width: `${getHpPercent(turnBattle.enemy.hp, turnBattle.enemy.max_hp)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-red-100/80 mt-1 text-right">HP {turnBattle.enemy.hp}/{turnBattle.enemy.max_hp}</p>
                        </div>
                      </div>

                      <div className="absolute left-[52%] top-[34%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-red-300/40 bg-gradient-to-b from-red-400/20 to-black/60 flex items-center justify-center shadow-2xl shadow-red-900/40">
                        <span className="text-center font-mono text-[10px] sm:text-xs md:text-sm text-red-100 px-2 line-clamp-2">{turnBattle.enemy.name}</span>
                      </div>

                      <div className="absolute left-[34%] bottom-[12%] -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-cyan-300/40 bg-gradient-to-b from-cyan-300/20 to-black/60 flex items-center justify-center shadow-2xl shadow-cyan-900/40">
                        <span className="text-center font-mono text-[10px] sm:text-xs md:text-sm text-cyan-100 px-2 line-clamp-2">{turnBattle.player.name}</span>
                      </div>

                      <div className="absolute left-0 bottom-0 w-[52%] max-w-sm rounded-xl border border-slate-800 bg-slate-950/85 p-2.5 md:p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-mono text-sm md:text-base text-cyan-100 truncate">{turnBattle.player.name}</p>
                            <p className="text-xs text-cyan-100/70">Lv. {turnBattle.player.level ?? 50}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded border border-cyan-300/30 text-cyan-100/80">{turnBattle.player.status ?? 'NORMAL'}</span>
                        </div>
                        <div className="mt-2">
                          <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-300 transition-all duration-300"
                              style={{ width: `${getHpPercent(turnBattle.player.hp, turnBattle.player.max_hp)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-cyan-100/80 mt-1 text-right">HP {turnBattle.player.hp}/{turnBattle.player.max_hp}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-3 md:gap-4 flex-1 min-h-0">
                    <div className="rounded-xl border border-cyan-400/30 bg-slate-900/80 p-3 md:p-4 min-h-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-mono text-cyan-100 text-sm sm:text-base md:text-lg">Selecciona Movimiento</h3>
                        <span className="text-xs px-3 py-1 rounded border border-cyan-300/30 text-cyan-100/80">
                          {turnBattle.turn === 'player' ? 'Tu turno' : 'Turno enemigo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(turnBattle.player.skills ?? []).map((sk, i) => {
                          const disabled = sk.cd > 0 || turnBattle.turn !== 'player' || turnBattleStatus !== 'connected'
                          const isActive = activeSkill === i
                          return (
                            <button
                              key={i}
                              disabled={disabled}
                              onClick={() => sendSkill(i)}
                              className={`rounded-lg border px-4 py-3 text-left transition-all ${
                                isActive
                                  ? 'border-emerald-300 bg-emerald-400/20'
                                  : 'border-cyan-300/30 bg-cyan-400/10 hover:bg-cyan-400/20'
                              } disabled:opacity-45 disabled:cursor-not-allowed`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-cyan-100 text-sm truncate">{sk.name}</p>
                                <span className="text-[10px] uppercase tracking-wider text-cyan-100/70">{sk.type ?? 'Skill'}</span>
                              </div>
                              <p className="text-[11px] mt-1 text-cyan-100/70 line-clamp-2">{sk.description ?? 'Movimiento tactico del cazador.'}</p>
                              <div className="mt-2 flex items-center justify-between text-xs text-cyan-100/70">
                                <span>Power: {sk.power ?? '-'}</span>
                                <span>{sk.cd > 0 ? `CD ${sk.cd}` : 'Ready'}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-indigo-300/30 bg-slate-900/80 p-3 md:p-4 min-h-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-mono text-indigo-100 text-sm sm:text-base md:text-lg">Registro de Combate</h3>
                        <span className="text-xs text-indigo-100/70">Ronda {turnBattle.round ?? Math.max(turnBattle.log.length, 1)}</span>
                      </div>

                      <div className="h-full space-y-2 text-sm">
                        {(turnBattle.log ?? []).length === 0 && (
                          <p className="text-indigo-100/60">Aun no hay acciones registradas.</p>
                        )}

                        {(turnBattle.log ?? []).slice(-6).map((entry, index) => (
                          <div key={`${entry}-${index}`} className="rounded border border-indigo-200/20 bg-indigo-500/10 p-2 text-indigo-100/90 font-mono text-xs md:text-sm">
                            <span className="text-indigo-200/60 mr-2">{String(index + 1).padStart(2, '0')}.</span>
                            {entry}
                          </div>
                        ))}

                        {(turnBattle.log ?? []).length > 6 && (
                          <p className="text-[11px] text-indigo-100/60">Mostrando los 6 eventos mas recientes.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

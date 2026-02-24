'use client'

import { PlayerData, DungeonInfo, getDungeons, clearDungeon, extractShadow, restPlayer, getRankColor } from '@/lib/game-store'
import { Landmark, Skull, Gift, Layers, Lock, Swords, Moon, Ghost, RotateCw, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface DungeonsPanelProps {
  player: PlayerData
  onUpdatePlayer: (player: PlayerData) => void
}

type BattleState = 'idle' | 'entering' | 'fighting' | 'victory' | 'defeat'

export function DungeonsPanel({ player, onUpdatePlayer }: DungeonsPanelProps) {
  const [dungeons] = useState<DungeonInfo[]>(getDungeons)
  const [selectedDungeon, setSelectedDungeon] = useState<DungeonInfo | null>(null)
  const [battleState, setBattleState] = useState<BattleState>('idle')
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [showBattle, setShowBattle] = useState(false)
  const [bossHp, setBossHp] = useState(100)
  const [rankFilter, setRankFilter] = useState<string>('all')

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
    const interval = setInterval(() => {
      if (currentFloor <= selectedDungeon.floors) {
        const floorCleared = Math.random() < winChance
        if (floorCleared) {
          setBossHp(prev => Math.max(0, prev - (100 / selectedDungeon.floors)))
          setBattleLog(prev => [...prev, `Floor ${currentFloor}/${selectedDungeon.floors} cleared!`])
          currentFloor++
        } else {
          setBattleState('defeat')
          setBattleLog(prev => [...prev, `Defeated on floor ${currentFloor}... The dungeon was too strong.`])
          clearInterval(interval)
        }
      } else {
        setBattleState('victory')
        setBattleLog(prev => [...prev, `Boss "${selectedDungeon.boss}" defeated!`, 'Dungeon cleared!'])
        clearInterval(interval)
      }
    }, 800)

    return () => clearInterval(interval)
  }, [battleState, selectedDungeon, player.stats, player.shadows.length])

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

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2">
            <Landmark className="w-5 h-5" />
            Dungeons
          </h2>
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
    </div>
  )
}

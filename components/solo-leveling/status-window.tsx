'use client'

import { PlayerData, allocateStat, PlayerStats } from '@/lib/game-store'
import { Plus, Swords, Wind, Heart, Brain, Eye, Star, Crown, Shield, Zap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface StatusWindowProps {
  player: PlayerData
  onUpdatePlayer: (player: PlayerData) => void
}

const STAT_CONFIG: { key: keyof Omit<PlayerStats, 'availablePoints'>; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'strength', label: 'STR', icon: <Swords className="w-4 h-4" />, color: 'text-red-400' },
  { key: 'agility', label: 'AGI', icon: <Wind className="w-4 h-4" />, color: 'text-green-400' },
  { key: 'vitality', label: 'VIT', icon: <Heart className="w-4 h-4" />, color: 'text-orange-400' },
  { key: 'intelligence', label: 'INT', icon: <Brain className="w-4 h-4" />, color: 'text-blue-400' },
  { key: 'perception', label: 'PER', icon: <Eye className="w-4 h-4" />, color: 'text-purple-400' },
]

export function StatusWindow({ player, onUpdatePlayer }: StatusWindowProps) {
  const handleAllocate = (stat: keyof Omit<PlayerStats, 'availablePoints'>) => {
    onUpdatePlayer(allocateStat(player, stat))
  }

  const expPercentage = (player.exp / player.expToNext) * 100
  const hpPercentage = (player.hp / player.maxHp) * 100
  const mpPercentage = (player.mp / player.maxMp) * 100
  const fatiguePercentage = (player.fatigue / player.maxFatigue) * 100

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Player Info Card */}
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Status Window
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {'[Player Info]'}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground font-sans">{player.name}</h3>
              <p className="text-sm text-muted-foreground font-sans">{player.title}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Star className="w-4 h-4 text-system-gold" />
                <span className="text-lg font-mono gold-text">Lv.{player.level}</span>
              </div>
              <span className={`text-xs font-mono uppercase ${player.hunterRank === 'S' || player.hunterRank === 'SS' || player.hunterRank === 'National' ? 'text-system-gold' : 'text-system-glow'}`}>
                Rank {player.hunterRank}
              </span>
            </div>
          </div>

          {/* Job Class */}
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-system-glow" />
            <span className="text-muted-foreground font-sans">Job:</span>
            <span className="font-mono text-system-glow">{player.jobClass}</span>
          </div>

          {/* EXP Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">EXP</span>
              <span className="text-system-glow">{player.exp} / {player.expToNext}</span>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute inset-0 h-full bg-gradient-to-r from-system-glow/80 to-system-cyan/80 transition-all duration-500"
                style={{ width: `${expPercentage}%` }}
              />
            </div>
          </div>

          {/* HP Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-red-400">HP</span>
              <span className="text-red-400">{player.hp} / {player.maxHp}</span>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute inset-0 h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
          </div>

          {/* MP Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-blue-400">MP</span>
              <span className="text-blue-400">{player.mp} / {player.maxMp}</span>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute inset-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                style={{ width: `${mpPercentage}%` }}
              />
            </div>
          </div>

          {/* Fatigue Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-yellow-400">Fatigue</span>
              <span className="text-yellow-400">{player.fatigue} / {player.maxFatigue}</span>
            </div>
            <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="absolute inset-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
                style={{ width: `${fatiguePercentage}%` }}
              />
            </div>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Zap className="w-4 h-4 text-system-gold" />
            <span className="text-sm font-mono gold-text">{player.gold.toLocaleString()} Gold</span>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono system-text uppercase tracking-widest">Stats</h2>
          {player.stats.availablePoints > 0 && (
            <span className="text-xs font-mono text-system-gold animate-pulse">
              +{player.stats.availablePoints} Points Available
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {STAT_CONFIG.map(({ key, label, icon, color }) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 w-20 ${color}`}>
                {icon}
                <span className="text-sm font-mono">{label}</span>
              </div>
              <div className="flex-1">
                <Progress
                  value={Math.min((player.stats[key] / 100) * 100, 100)}
                  className="h-2 bg-secondary"
                />
              </div>
              <span className="w-10 text-right text-sm font-mono text-foreground">
                {player.stats[key]}
              </span>
              {player.stats.availablePoints > 0 && (
                <button
                  onClick={() => handleAllocate(key)}
                  className="p-1 rounded bg-system-glow/20 text-system-glow hover:bg-system-glow/40 transition-all border border-system-glow/30"
                  aria-label={`Increase ${label}`}
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Combat Stats */}
      <div className="system-panel rounded-lg p-6">
        <h2 className="text-lg font-mono system-text uppercase tracking-widest mb-4">Combat Record</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-mono">Dungeons Cleared</span>
            <span className="text-xl font-mono text-foreground">{player.totalDungeonClears}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-mono">Monsters Killed</span>
            <span className="text-xl font-mono text-foreground">{player.totalMonstersKilled}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-mono">Days Active</span>
            <span className="text-xl font-mono text-foreground">{player.daysActive}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-mono">Shadow Army</span>
            <span className="text-xl font-mono text-foreground">{player.shadows.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

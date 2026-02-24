'use client'

import { PlayerData, getRankColor } from '@/lib/game-store'
import { Ghost, Star, Zap, Skull } from 'lucide-react'

interface ShadowArmyPanelProps {
  player: PlayerData
}

export function ShadowArmyPanel({ player }: ShadowArmyPanelProps) {
  const totalPower = player.shadows.reduce((sum, s) => sum + s.power, 0)

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2">
            <Ghost className="w-5 h-5" />
            Shadow Army
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {player.shadows.length} Shadows
          </span>
        </div>

        {/* Army stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="system-panel rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground font-mono block mb-1">Total Shadows</span>
            <span className="text-xl font-mono text-system-glow">{player.shadows.length}</span>
          </div>
          <div className="system-panel rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground font-mono block mb-1">Total Power</span>
            <span className="text-xl font-mono text-system-gold">{totalPower}</span>
          </div>
          <div className="system-panel rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground font-mono block mb-1">Avg Power</span>
            <span className="text-xl font-mono text-purple-400">
              {player.shadows.length > 0 ? Math.round(totalPower / player.shadows.length) : 0}
            </span>
          </div>
        </div>

        {/* Shadow extraction info */}
        {!player.skills.some(s => s.id === 'shadow_extraction' && s.unlocked) && (
          <div className="mb-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Ghost className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-mono text-purple-400">Shadow Extraction Locked</span>
            </div>
            <p className="text-xs text-muted-foreground font-sans">
              Reach Level 15 to unlock the Shadow Extraction skill and begin building your shadow army.
            </p>
          </div>
        )}

        {/* Shadows List */}
        {player.shadows.length === 0 ? (
          <div className="text-center py-12">
            <Ghost className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-sans">No shadows extracted yet</p>
            <p className="text-muted-foreground/60 text-xs font-sans mt-1">
              Defeat dungeon bosses and extract their shadows
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {player.shadows.map(shadow => (
              <div key={shadow.id} className="system-panel rounded-lg p-4 hover:border-purple-500/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <Skull className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold font-sans text-foreground">{shadow.name}</h3>
                      <span className={`text-[10px] font-mono font-bold ${getRankColor(shadow.rank)}`}>
                        {shadow.rank}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans mb-2">
                      Origin: {shadow.type}
                    </p>
                    <div className="flex gap-4 text-[10px] font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-system-gold" />
                        Lv.{shadow.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-purple-400" />
                        {shadow.power} PWR
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

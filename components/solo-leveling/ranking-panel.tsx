'use client'

import { useEffect, useMemo, useState } from 'react'
import { PlayerData, getRankColor, HunterRank } from '@/lib/game-store'
import { Trophy, Star, Swords, Ghost, Medal } from 'lucide-react'

interface RankingPanelProps {
  player: PlayerData
}

interface NpcHunter {
  username?: string
  name: string
  level: number
  rank: HunterRank
  title: string
  kills: number
  dungeons: number
  shadows: number
}

interface DbHunter {
  username: string
  name: string
  level: number
  rank: HunterRank
  title: string
  kills: number
  dungeons: number
  shadows: number
}

interface RankingApiPayload {
  players?: DbHunter[]
}

const NPC_HUNTERS: NpcHunter[] = [
  { name: 'Go Gunhee', level: 45, rank: 'SS', title: 'Chairman', kills: 5840, dungeons: 312, shadows: 0 },
  { name: 'Cha Hae-In', level: 38, rank: 'S', title: 'Vice Guild Master', kills: 3200, dungeons: 245, shadows: 0 },
  { name: 'Choi Jong-In', level: 35, rank: 'S', title: 'Guild Master', kills: 2800, dungeons: 198, shadows: 0 },
  { name: 'Baek Yoonho', level: 33, rank: 'S', title: 'White Tiger', kills: 2600, dungeons: 180, shadows: 0 },
  { name: 'Lim Tae-Gyu', level: 31, rank: 'S', title: 'Hunters Guild', kills: 2100, dungeons: 156, shadows: 0 },
  { name: 'Min Byung-Gu', level: 30, rank: 'S', title: 'Healer', kills: 800, dungeons: 200, shadows: 0 },
  { name: 'Hwang Dong-Suk', level: 20, rank: 'A', title: 'Raider', kills: 1200, dungeons: 89, shadows: 0 },
  { name: 'Yoo Jin-Ho', level: 15, rank: 'B', title: 'Vice Master', kills: 400, dungeons: 45, shadows: 0 },
  { name: 'Park Heejin', level: 10, rank: 'C', title: 'Scout', kills: 200, dungeons: 30, shadows: 0 },
]

export function RankingPanel({ player }: RankingPanelProps) {
  const [dbHunters, setDbHunters] = useState<DbHunter[]>([])

  useEffect(() => {
    let ignore = false

    async function loadRanking() {
      try {
        const response = await fetch('/api/player/ranking', { cache: 'no-store' })
        if (!response.ok) return

        const payload = await response.json() as RankingApiPayload
        if (ignore) return
        setDbHunters(Array.isArray(payload.players) ? payload.players : [])
      } catch {
        if (!ignore) setDbHunters([])
      }
    }

    void loadRanking()

    return () => {
      ignore = true
    }
  }, [])

  const allHunters = useMemo(() => {
    const normalizedPlayerName = player.name.trim().toLowerCase()

    const merged = [
      {
        username: normalizedPlayerName,
        name: player.name,
        level: player.level,
        rank: player.hunterRank,
        title: player.title,
        kills: player.totalMonstersKilled,
        dungeons: player.totalDungeonClears,
        shadows: player.shadows.length,
        isPlayer: true,
      },
      ...dbHunters
        .filter(h => h.name.trim().toLowerCase() !== normalizedPlayerName)
        .map(h => ({ ...h, isPlayer: false })),
      ...NPC_HUNTERS.map(h => ({ ...h, isPlayer: false })),
    ]

    return merged.sort((a, b) => b.level - a.level)
  }, [player, dbHunters])

  const playerRank = allHunters.findIndex(h => h.isPlayer) + 1

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Player Ranking Summary */}
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Hunter Rankings
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="system-panel rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground font-mono block mb-1">Your Rank</span>
            <span className="text-2xl font-mono text-system-gold">#{playerRank}</span>
          </div>
          <div className="system-panel rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground font-mono block mb-1">Hunter Rank</span>
            <span className={`text-2xl font-mono font-bold ${getRankColor(player.hunterRank)}`}>{player.hunterRank}</span>
          </div>
          <div className="system-panel rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground font-mono block mb-1">Level</span>
            <span className="text-2xl font-mono text-system-glow">{player.level}</span>
          </div>
          <div className="system-panel rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground font-mono block mb-1">Power Score</span>
            <span className="text-2xl font-mono text-purple-400">
              {player.stats.strength + player.stats.agility + player.stats.vitality + player.stats.intelligence + player.stats.perception + player.shadows.length * 10}
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="system-panel rounded-lg p-6">
        <h3 className="text-sm font-mono system-text uppercase tracking-widest mb-4 flex items-center gap-2">
          <Medal className="w-4 h-4" />
          Leaderboard
        </h3>

        <div className="flex flex-col gap-2">
          {allHunters.map((hunter, index) => (
            <div
              key={hunter.name}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                hunter.isPlayer
                  ? 'system-panel border-system-glow/40 bg-system-glow/5'
                  : 'bg-secondary/30 border border-transparent'
              }`}
            >
              {/* Rank number */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                index === 1 ? 'bg-gray-400/20 text-gray-300' :
                index === 2 ? 'bg-orange-500/20 text-orange-400' :
                'bg-secondary text-muted-foreground'
              }`}>
                {index + 1}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold font-sans truncate ${hunter.isPlayer ? 'text-system-glow' : 'text-foreground'}`}>
                    {hunter.name}
                  </span>
                  {hunter.isPlayer && (
                    <span className="text-[10px] font-mono text-system-glow bg-system-glow/10 px-1.5 py-0.5 rounded">YOU</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-sans">{hunter.title}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                <span className={`font-bold ${getRankColor(hunter.rank)}`}>{hunter.rank}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-3 h-3 text-system-gold" />{hunter.level}
                </span>
                <span className="hidden items-center gap-1 text-muted-foreground md:inline-flex">
                  <Swords className="w-3 h-3" />{hunter.kills}
                </span>
                {hunter.shadows > 0 && (
                  <span className="hidden items-center gap-1 text-purple-400 md:inline-flex">
                    <Ghost className="w-3 h-3" />{hunter.shadows}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

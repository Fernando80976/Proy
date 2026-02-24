'use client'

import { PlayerData, completeQuestObjective, resetDailyQuests, Quest } from '@/lib/game-store'
import { ScrollText, CheckCircle, Circle, AlertTriangle, Skull, Clock, RefreshCw, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface QuestsPanelProps {
  player: PlayerData
  onUpdatePlayer: (player: PlayerData) => void
}

function QuestTypeIcon({ type }: { type: Quest['type'] }) {
  switch (type) {
    case 'daily': return <Clock className="w-4 h-4 text-system-glow" />
    case 'story': return <ScrollText className="w-4 h-4 text-system-gold" />
    case 'emergency': return <AlertTriangle className="w-4 h-4 text-system-red" />
    case 'penalty': return <Skull className="w-4 h-4 text-red-500" />
  }
}

function QuestTypeBadge({ type }: { type: Quest['type'] }) {
  const styles: Record<Quest['type'], string> = {
    daily: 'bg-system-glow/20 text-system-glow border-system-glow/30',
    story: 'bg-system-gold/20 text-system-gold border-system-gold/30',
    emergency: 'bg-system-red/20 text-system-red border-system-red/30',
    penalty: 'bg-red-500/20 text-red-500 border-red-500/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${styles[type]}`}>
      <QuestTypeIcon type={type} />
      {type}
    </span>
  )
}

export function QuestsPanel({ player, onUpdatePlayer }: QuestsPanelProps) {
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'daily' | 'story' | 'emergency' | 'penalty'>('all')

  const filteredQuests = player.quests.filter(q => {
    if (filter === 'all') return q.active
    return q.type === filter && q.active
  })

  const handleProgress = (questId: string, objIndex: number) => {
    onUpdatePlayer(completeQuestObjective(player, questId, objIndex, 1))
  }

  const handleResetDaily = () => {
    onUpdatePlayer(resetDailyQuests(player))
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Quests
          </h2>
          <button
            onClick={handleResetDaily}
            className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-system-glow transition-colors px-2 py-1 rounded border border-border hover:border-system-glow/30"
            aria-label="Reset daily quests"
          >
            <RefreshCw className="w-3 h-3" />
            New Day
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'daily', 'story', 'emergency', 'penalty'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider border transition-all ${
                filter === f
                  ? 'bg-system-glow/20 text-system-glow border-system-glow/40'
                  : 'bg-secondary/50 text-muted-foreground border-border hover:border-system-glow/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Quest List */}
        <div className="flex flex-col gap-3">
          {filteredQuests.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm font-sans py-8">No active quests</p>
          ) : (
            filteredQuests.map(quest => (
              <div key={quest.id}>
                <button
                  onClick={() => setSelectedQuest(selectedQuest === quest.id ? null : quest.id)}
                  className={`w-full text-left system-panel rounded-lg p-4 transition-all ${
                    quest.completed ? 'opacity-60' : ''
                  } ${selectedQuest === quest.id ? 'border-system-glow/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {quest.completed ? (
                        <CheckCircle className="w-5 h-5 text-system-green mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-foreground font-sans">{quest.title}</span>
                          <QuestTypeBadge type={quest.type} />
                        </div>
                        <p className="text-xs text-muted-foreground font-sans">{quest.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform shrink-0 ${selectedQuest === quest.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Expanded Quest Details */}
                {selectedQuest === quest.id && (
                  <div className="mt-2 ml-8 system-panel rounded-lg p-4 animate-slide-in">
                    <h4 className="text-xs font-mono text-system-glow uppercase tracking-widest mb-3">Objectives</h4>
                    <div className="flex flex-col gap-2 mb-4">
                      {quest.objectives.map((obj, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-foreground font-sans">{obj.description}</span>
                              <span className="font-mono text-muted-foreground">{obj.current}/{obj.target}</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${
                                  obj.current >= obj.target ? 'bg-system-green' : 'bg-system-glow'
                                }`}
                                style={{ width: `${Math.min((obj.current / obj.target) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          {!quest.completed && obj.current < obj.target && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleProgress(quest.id, i); }}
                                className="px-2 py-1 rounded text-[10px] font-mono bg-system-glow/20 text-system-glow border border-system-glow/30 hover:bg-system-glow/30 transition-all"
                              >
                                +1
                              </button>
                              {obj.target >= 10 && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onUpdatePlayer(completeQuestObjective(player, quest.id, i, 10)); }}
                                  className="px-2 py-1 rounded text-[10px] font-mono bg-system-gold/20 text-system-gold border border-system-gold/30 hover:bg-system-gold/30 transition-all"
                                >
                                  +10
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); onUpdatePlayer(completeQuestObjective(player, quest.id, i, obj.target - obj.current)); }}
                                className="px-2 py-1 rounded text-[10px] font-mono bg-system-green/20 text-system-green border border-system-green/30 hover:bg-system-green/30 transition-all"
                              >
                                MAX
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border pt-3">
                      <h4 className="text-xs font-mono text-system-gold uppercase tracking-widest mb-2">Rewards</h4>
                      <div className="flex gap-4 text-xs font-mono">
                        <span className="text-system-glow">+{quest.rewards.exp} EXP</span>
                        <span className="text-system-gold">+{quest.rewards.gold} Gold</span>
                        {quest.rewards.items && (
                          <span className="text-purple-400">+{quest.rewards.items.length} Items</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

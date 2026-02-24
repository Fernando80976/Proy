'use client'

import { PlayerData, upgradeSkill, Skill } from '@/lib/game-store'
import { Sparkles, Lock, ArrowUp, Zap, Clock, Flame, Sword, Eye, Wind, Hand, Ghost, ArrowLeftRight, Crown, Heart, Target, Shield } from 'lucide-react'

interface SkillsPanelProps {
  player: PlayerData
  onUpdatePlayer: (player: PlayerData) => void
}

function SkillIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'Sword': return <Sword className="w-6 h-6" />
    case 'Eye': return <Eye className="w-6 h-6" />
    case 'Zap': return <Wind className="w-6 h-6" />
    case 'Flame': return <Flame className="w-6 h-6" />
    case 'Hand': return <Hand className="w-6 h-6" />
    case 'Ghost': return <Ghost className="w-6 h-6" />
    case 'ArrowLeftRight': return <ArrowLeftRight className="w-6 h-6" />
    case 'Crown': return <Crown className="w-6 h-6" />
    case 'Heart': return <Heart className="w-6 h-6" />
    case 'Target': return <Target className="w-6 h-6" />
    case 'Shield': return <Shield className="w-6 h-6" />
    default: return <Sparkles className="w-6 h-6" />
  }
}

export function SkillsPanel({ player, onUpdatePlayer }: SkillsPanelProps) {
  const handleUpgrade = (skillId: string) => {
    onUpdatePlayer(upgradeSkill(player, skillId))
  }

  const activeSkills = player.skills.filter(s => s.type === 'active')
  const passiveSkills = player.skills.filter(s => s.type === 'passive')

  const SkillCard = ({ skill }: { skill: Skill }) => {
    const upgradeCost = skill.level * 50
    const canUpgrade = skill.unlocked && skill.level < skill.maxLevel && player.gold >= upgradeCost

    return (
      <div className={`system-panel rounded-lg p-4 transition-all ${!skill.unlocked ? 'opacity-40' : ''}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${skill.unlocked ? 'bg-system-glow/20 text-system-glow' : 'bg-secondary text-muted-foreground'}`}>
            {skill.unlocked ? <SkillIcon icon={skill.icon} /> : <Lock className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold font-sans text-foreground">{skill.name}</h3>
              {skill.unlocked && (
                <span className="text-[10px] font-mono text-system-glow">Lv.{skill.level}/{skill.maxLevel}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-sans mb-2">{skill.description}</p>
            {skill.unlocked ? (
              <div className="flex flex-wrap gap-3 text-[10px] font-mono text-muted-foreground">
                {skill.manaCost > 0 && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <Zap className="w-3 h-3" />{skill.manaCost} MP
                  </span>
                )}
                {skill.damage && (
                  <span className="flex items-center gap-1 text-red-400">
                    <Flame className="w-3 h-3" />{skill.damage} DMG
                  </span>
                )}
                {skill.cooldown > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{skill.cooldown}s
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[10px] font-mono text-muted-foreground">Unlocks at Lv.{skill.requiredLevel}</p>
            )}
          </div>
          {canUpgrade && (
            <button
              onClick={() => handleUpgrade(skill.id)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono bg-system-glow/20 text-system-glow border border-system-glow/30 hover:bg-system-glow/30 transition-all shrink-0"
            >
              <ArrowUp className="w-3 h-3" />
              {upgradeCost}G
            </button>
          )}
        </div>
        {/* Level bar */}
        {skill.unlocked && (
          <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-system-glow transition-all duration-300"
              style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Active Skills */}
      <div className="system-panel rounded-lg p-6">
        <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5" />
          Active Skills
        </h2>
        <div className="flex flex-col gap-3">
          {activeSkills.map(skill => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>

      {/* Passive Skills */}
      <div className="system-panel rounded-lg p-6">
        <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" />
          Passive Skills
        </h2>
        <div className="flex flex-col gap-3">
          {passiveSkills.map(skill => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  )
}

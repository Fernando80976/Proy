'use client'

import { PlayerData, getShopItems, buyItem, ShopItem, getRarityColor, getRarityBg } from '@/lib/game-store'
import { ShoppingBag, Coins, Sword, Shield, Droplet, Gem, Box, CheckCircle } from 'lucide-react'
import { useState, useMemo } from 'react'

interface ShopPanelProps {
  player: PlayerData
  onUpdatePlayer: (player: PlayerData) => void
}

function ShopItemIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'Sword': return <Sword className="w-5 h-5" />
    case 'Shield': return <Shield className="w-5 h-5" />
    case 'Droplet': return <Droplet className="w-5 h-5" />
    case 'Sparkles': return <Gem className="w-5 h-5" />
    case 'Gem': return <Gem className="w-5 h-5" />
    default: return <Box className="w-5 h-5" />
  }
}

export function ShopPanel({ player, onUpdatePlayer }: ShopPanelProps) {
  const shopItems = useMemo(() => getShopItems(), [])
  const [filter, setFilter] = useState<'all' | 'weapon' | 'armor' | 'potion' | 'rune'>('all')
  const [notification, setNotification] = useState<string | null>(null)

  const filteredItems = shopItems.filter(item =>
    filter === 'all' || item.type === filter
  )

  const handleBuy = (item: ShopItem) => {
    const result = buyItem(player, item)
    if (result) {
      onUpdatePlayer(result)
      setNotification(`Purchased ${item.name}!`)
      setTimeout(() => setNotification(null), 2000)
    } else {
      setNotification('Not enough gold!')
      setTimeout(() => setNotification(null), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            System Shop
          </h2>
          <span className="flex items-center gap-1 text-sm font-mono gold-text">
            <Coins className="w-4 h-4" />
            {player.gold.toLocaleString()}G
          </span>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-3 rounded text-xs font-mono text-center animate-fade-in-up ${
            notification.includes('Not enough') ? 'bg-system-red/10 border border-system-red/30 text-system-red' : 'bg-system-green/10 border border-system-green/30 text-system-green'
          }`}>
            {notification}
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'weapon', 'armor', 'potion', 'rune'] as const).map(f => (
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

        {/* Items */}
        <div className="grid gap-3 md:grid-cols-2">
          {filteredItems.map(item => {
            const canAfford = player.gold >= item.price
            return (
              <div key={item.id} className={`system-panel rounded-lg p-4 transition-all ${getRarityBg(item.rarity)}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getRarityBg(item.rarity)} ${getRarityColor(item.rarity)}`}>
                    <ShopItemIcon icon={item.icon} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold font-sans text-foreground">{item.name}</h3>
                      <span className={`text-[10px] font-mono uppercase ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans mb-2">{item.description}</p>
                    {item.stats && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.stats.strength && <span className="text-[10px] font-mono text-red-400">+{item.stats.strength} STR</span>}
                        {item.stats.agility && <span className="text-[10px] font-mono text-green-400">+{item.stats.agility} AGI</span>}
                        {item.stats.vitality && <span className="text-[10px] font-mono text-orange-400">+{item.stats.vitality} VIT</span>}
                        {item.stats.intelligence && <span className="text-[10px] font-mono text-blue-400">+{item.stats.intelligence} INT</span>}
                        {item.stats.perception && <span className="text-[10px] font-mono text-purple-400">+{item.stats.perception} PER</span>}
                      </div>
                    )}
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 rounded text-[10px] font-mono uppercase flex items-center justify-center gap-1 transition-all ${
                        canAfford
                          ? 'bg-system-gold/20 text-system-gold border border-system-gold/30 hover:bg-system-gold/30'
                          : 'bg-secondary text-muted-foreground border border-border opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3 h-3" />
                      {item.price.toLocaleString()} Gold
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

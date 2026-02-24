'use client'

import { PlayerData, sellItem, equipItem, getRarityColor, getRarityBg } from '@/lib/game-store'
import { Package, Sword, Shield, Droplet, Gem, Key, Box, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface InventoryPanelProps {
  player: PlayerData
  onUpdatePlayer: (player: PlayerData) => void
}

function ItemIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'Sword': return <Sword className="w-5 h-5" />
    case 'Shield': return <Shield className="w-5 h-5" />
    case 'Droplet': return <Droplet className="w-5 h-5" />
    case 'Sparkles': return <Gem className="w-5 h-5" />
    case 'Gem': return <Gem className="w-5 h-5" />
    case 'Key': return <Key className="w-5 h-5" />
    default: return <Box className="w-5 h-5" />
  }
}

export function InventoryPanel({ player, onUpdatePlayer }: InventoryPanelProps) {
  const [filter, setFilter] = useState<'all' | 'weapon' | 'armor' | 'potion' | 'material' | 'rune'>('all')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const filteredItems = player.inventory.filter(item =>
    filter === 'all' || item.type === filter
  )

  const handleSell = (itemId: string) => {
    onUpdatePlayer(sellItem(player, itemId))
    setSelectedItem(null)
  }

  const handleEquip = (itemId: string) => {
    onUpdatePlayer(equipItem(player, itemId))
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="system-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-mono system-text uppercase tracking-widest flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {player.inventory.length} Items
          </span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'weapon', 'armor', 'potion', 'material', 'rune'] as const).map(f => (
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

        {/* Item Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredItems.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground text-sm font-sans py-8">No items found</p>
          ) : (
            filteredItems.map(item => (
              <div key={item.id}>
                <button
                  onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                  className={`w-full text-left rounded-lg p-3 border transition-all ${getRarityBg(item.rarity)} ${getRarityColor(item.rarity)} ${
                    selectedItem === item.id ? 'ring-1 ring-system-glow' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ItemIcon icon={item.icon} />
                    {item.equipped && <CheckCircle className="w-3 h-3 text-system-green" />}
                  </div>
                  <p className="text-xs font-bold font-sans truncate text-foreground">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] font-mono uppercase ${getRarityColor(item.rarity)}`}>{item.rarity}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">x{item.quantity}</span>
                  </div>
                </button>

                {/* Expanded details */}
                {selectedItem === item.id && (
                  <div className="mt-2 system-panel rounded-lg p-3 animate-slide-in">
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
                    <div className="flex gap-2">
                      {(item.type === 'weapon' || item.type === 'armor') && !item.equipped && (
                        <button
                          onClick={() => handleEquip(item.id)}
                          className="flex-1 py-1 rounded text-[10px] font-mono uppercase bg-system-glow/20 text-system-glow border border-system-glow/30 hover:bg-system-glow/30 transition-all"
                        >
                          Equip
                        </button>
                      )}
                      {!item.equipped && (
                        <button
                          onClick={() => handleSell(item.id)}
                          className="flex-1 py-1 rounded text-[10px] font-mono uppercase bg-system-gold/20 text-system-gold border border-system-gold/30 hover:bg-system-gold/30 transition-all"
                        >
                          Sell ({item.sellPrice}G)
                        </button>
                      )}
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

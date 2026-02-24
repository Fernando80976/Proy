'use client'

import { useState, useEffect, useCallback } from 'react'
import { PlayerData, savePlayer, loadPlayer, createNewPlayer, saveAuth, loadAuth, clearAuth, addExp } from '@/lib/game-store'
import { LoginScreen } from './login-screen'
import { StatusWindow } from './status-window'
import { QuestsPanel } from './quests-panel'
import { DungeonsPanel } from './dungeons-panel'
import { InventoryPanel } from './inventory-panel'
import { SkillsPanel } from './skills-panel'
import { ShadowArmyPanel } from './shadow-army-panel'
import { ShopPanel } from './shop-panel'
import { RankingPanel } from './ranking-panel'
import {
  Crown, ScrollText, Landmark, Package, Sparkles, Ghost, ShoppingBag, Trophy,
  LogOut, Menu, X, Swords, ChevronRight
} from 'lucide-react'

type TabId = 'status' | 'quests' | 'dungeons' | 'inventory' | 'skills' | 'shadows' | 'shop' | 'ranking'

interface NavItem {
  id: TabId
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'status', label: 'Status', icon: <Crown className="w-4 h-4" /> },
  { id: 'quests', label: 'Quests', icon: <ScrollText className="w-4 h-4" /> },
  { id: 'dungeons', label: 'Dungeons', icon: <Landmark className="w-4 h-4" /> },
  { id: 'inventory', label: 'Inventory', icon: <Package className="w-4 h-4" /> },
  { id: 'skills', label: 'Skills', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'shadows', label: 'Shadows', icon: <Ghost className="w-4 h-4" /> },
  { id: 'shop', label: 'Shop', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'ranking', label: 'Ranking', icon: <Trophy className="w-4 h-4" /> },
]

export function GameDashboard() {
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('status')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [systemMessage, setSystemMessage] = useState<string | null>(null)

  // Load saved state
  useEffect(() => {
    const auth = loadAuth()
    if (auth) {
      const savedPlayer = loadPlayer()
      if (savedPlayer) {
        setPlayer(savedPlayer)
        setIsLoggedIn(true)
      }
    }
  }, [])

  // Auto-save
  useEffect(() => {
    if (player) savePlayer(player)
  }, [player])

  const handleLogin = (username: string) => {
    const existing = loadPlayer()
    const p = existing && existing.name === username ? existing : createNewPlayer(username)
    saveAuth(username)
    savePlayer(p)
    setPlayer(p)
    setIsLoggedIn(true)
    showSystemMessage('System activated. Welcome, Player.')
  }

  const handleLogout = () => {
    clearAuth()
    setPlayer(null)
    setIsLoggedIn(false)
  }

  const handleUpdatePlayer = useCallback((updatedPlayer: PlayerData) => {
    setPlayer(updatedPlayer)
  }, [])

  const showSystemMessage = (msg: string) => {
    setSystemMessage(msg)
    setTimeout(() => setSystemMessage(null), 3000)
  }

  if (!isLoggedIn || !player) {
    return <LoginScreen onLogin={handleLogin} />
  }

  const expPercentage = (player.exp / player.expToNext) * 100

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* System notification */}
      {systemMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="system-panel rounded-lg px-6 py-3 border-system-glow/50">
            <p className="text-sm font-mono system-text">{systemMessage}</p>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 text-muted-foreground hover:text-system-glow transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-system-glow" />
              <span className="text-sm font-mono system-text uppercase tracking-widest hidden sm:block">System</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mini player info */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-foreground font-sans">{player.name}</p>
                <p className="text-[10px] font-mono text-system-glow">Lv.{player.level} | {player.hunterRank} Rank</p>
              </div>
              <div className="w-32 hidden md:block">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-system-glow transition-all duration-500"
                    style={{ width: `${expPercentage}%` }}
                  />
                </div>
                <p className="text-[9px] font-mono text-muted-foreground text-right mt-0.5">
                  {player.exp}/{player.expToNext} EXP
                </p>
              </div>
              <span className="text-xs font-mono gold-text hidden sm:block">{player.gold.toLocaleString()}G</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded text-muted-foreground hover:text-system-red transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation */}
        <nav
          className={`fixed lg:sticky top-[57px] left-0 z-30 h-[calc(100vh-57px)] bg-card/95 backdrop-blur border-r border-border w-56 transition-transform duration-300 lg:translate-x-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-1 p-3">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-sans transition-all text-left ${
                  activeTab === item.id
                    ? 'bg-system-glow/10 text-system-glow border border-system-glow/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {activeTab === item.id && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-4xl w-full overflow-y-auto">
          {activeTab === 'status' && <StatusWindow player={player} onUpdatePlayer={handleUpdatePlayer} />}
          {activeTab === 'quests' && <QuestsPanel player={player} onUpdatePlayer={handleUpdatePlayer} />}
          {activeTab === 'dungeons' && <DungeonsPanel player={player} onUpdatePlayer={handleUpdatePlayer} />}
          {activeTab === 'inventory' && <InventoryPanel player={player} onUpdatePlayer={handleUpdatePlayer} />}
          {activeTab === 'skills' && <SkillsPanel player={player} onUpdatePlayer={handleUpdatePlayer} />}
          {activeTab === 'shadows' && <ShadowArmyPanel player={player} />}
          {activeTab === 'shop' && <ShopPanel player={player} onUpdatePlayer={handleUpdatePlayer} />}
          {activeTab === 'ranking' && <RankingPanel player={player} />}
        </main>
      </div>
    </div>
  )
}

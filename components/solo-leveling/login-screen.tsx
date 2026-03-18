"use client";

import { useState, useEffect, useRef } from 'react'
import { Swords, Eye, EyeOff } from 'lucide-react'
import { loadAuth } from '@/lib/game-store'

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>
}

interface BattleSkill {
  name: string
  cd: number
  description?: string
  type?: string
  power?: number
}

interface BattleFighter {
  name: string
  hp: number
  max_hp: number
  level?: number
  status?: string
  skills: BattleSkill[]
}

interface BattleState {
  enemy: BattleFighter
  player: BattleFighter
  turn: 'player' | 'enemy' | string
  round?: number
  log: string[]
}

const getHpPercent = (hp: number, maxHp: number) => {
  if (!maxHp || maxHp <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((hp / maxHp) * 100)))
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSystem, setShowSystem] = useState(false)
  const [error, setError] = useState('')
  const wsRef = useRef<WebSocket | null>(null)

  const [battle, setBattle] = useState<BattleState | null>(null)
  const [openBattle, setOpenBattle] = useState(false)
  const [battleStatus, setBattleStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [battleError, setBattleError] = useState('')
  const [activeSkill, setActiveSkill] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowSystem(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  const startTurnBattle = () => {
    setOpenBattle(true)
    setBattleError('')
    setBattleStatus('connecting')

    const auth = loadAuth()
    if (!auth) {
      setBattleStatus('error')
      setBattleError('Sesion no encontrada. Inicia sesion para entrar al combate por turnos.')
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
      setBattleStatus('connected')
    }

    ws.onmessage = evt => {
      try {
        const st = JSON.parse(evt.data) as BattleState
        setBattle({ ...st })
      } catch {
        setBattleError('No se pudo interpretar la respuesta del servidor de combate.')
      }
    }

    ws.onerror = () => {
      setBattleStatus('error')
      setBattleError('No fue posible conectar con el servidor de combate por turnos.')
    }

    ws.onclose = () => {
      setBattleStatus(prev => (prev === 'error' ? 'error' : 'idle'))
    }
  }

  const closeBattle = () => {
    setOpenBattle(false)
    setActiveSkill(null)
    setBattleStatus('idle')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) {
      setError('Enter your Hunter name')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    setIsLoading(true)

    const result = await onLogin(username.trim(), password)
    if (!result.ok) {
      setError(result.message ?? 'No se pudo conectar con el servidor.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">

      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-system-glow/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-system-glow/10 to-transparent h-20"
          style={{ animation: 'scan-line 4s linear infinite' }}
        />
      </div>

      {/* UI principal */}
      <div className={`relative z-10 w-full max-w-lg mx-4 transition-all duration-1000 ${showSystem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="system-panel rounded-xl p-8 md:p-10">

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Swords className="w-8 h-8 text-system-glow" />
              <h1 className="text-3xl font-mono font-bold tracking-wider system-text">SYSTEM</h1>
              <Swords className="w-8 h-8 text-system-glow" />
            </div>
            <p className="text-muted-foreground text-sm font-sans tracking-wide">
              {'[You have been chosen as a Player]'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-background/80 border border-system-glow/30 rounded px-4 py-3 text-foreground"
              placeholder="Sung Jinwoo"
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-background/80 border border-system-glow/30 rounded px-4 py-3 pr-12"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={isLoading} className="w-full py-3 rounded bg-system-glow/20">
              {isLoading ? "Connecting..." : "Arise"}
            </button>

            <button
              type="button"
              onClick={startTurnBattle}
              className="w-full py-3 rounded bg-blue-500/20 text-blue-200 border border-blue-400/40 hover:bg-blue-500/30 transition-colors"
            >
              Abrir Arena de Combate por Turnos
            </button>

          </form>

        </div>
      </div>

      {openBattle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 md:p-4">
          <div className="relative w-full max-w-6xl h-[calc(100dvh-1rem)] md:h-[calc(100dvh-2rem)] rounded-2xl border border-blue-400/40 bg-slate-950/95 shadow-[0_0_60px_rgba(56,189,248,0.25)] overflow-hidden flex flex-col">

            <div className="flex items-center justify-between px-5 py-4 border-b border-blue-400/20 bg-gradient-to-r from-blue-500/20 via-cyan-400/10 to-blue-500/20">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Combat Simulator</p>
                <h2 className="text-base sm:text-lg md:text-2xl font-mono text-cyan-100">Arena de Turnos - Estilo Pokemon</h2>
              </div>
              <button
                type="button"
                onClick={closeBattle}
                className="px-3 py-2 rounded border border-red-400/40 text-red-200 hover:bg-red-500/20 transition-colors"
              >
                Cerrar
              </button>
            </div>

            <div className="p-3 md:p-5 flex-1 min-h-0 flex flex-col gap-3 md:gap-4">
              {!battle && (
                <div className="rounded-xl border border-blue-400/30 bg-slate-900/70 p-5 text-center">
                  <p className="font-mono text-cyan-100 text-lg">
                    {battleStatus === 'connecting' ? 'Conectando con el servidor de batalla...' : 'Esperando datos del combate...'}
                  </p>
                  <p className="text-sm text-cyan-200/70 mt-2">Se abrirá el campo en cuanto llegue el primer estado.</p>
                </div>
              )}

              {battleError && (
                <div className="rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 text-red-200 text-sm">
                  {battleError}
                </div>
              )}

              {battle && (
                <>
                  <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-b from-sky-300/20 via-emerald-300/10 to-slate-900 p-3 md:p-4 relative overflow-hidden h-[34dvh] min-h-[220px] max-h-[320px]">
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.15)_0%,transparent_60%)]" />

                    <div className="relative z-10 w-full h-full">
                      <div className="absolute right-0 top-0 w-[48%] max-w-sm rounded-xl border border-slate-800 bg-slate-950/85 p-2.5 md:p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-mono text-sm md:text-base text-red-200 truncate">{battle.enemy.name}</p>
                            <p className="text-xs text-red-100/70">Lv. {battle.enemy.level ?? 50}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded border border-red-300/30 text-red-100/80">{battle.enemy.status ?? 'NORMAL'}</span>
                        </div>
                        <div className="mt-2">
                          <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-500 to-orange-300 transition-all duration-300"
                              style={{ width: `${getHpPercent(battle.enemy.hp, battle.enemy.max_hp)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-red-100/80 mt-1 text-right">HP {battle.enemy.hp}/{battle.enemy.max_hp}</p>
                        </div>
                      </div>

                      <div className="absolute left-[52%] top-[34%] -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-red-300/40 bg-gradient-to-b from-red-400/20 to-black/60 flex items-center justify-center shadow-2xl shadow-red-900/40">
                        <span className="text-center font-mono text-[10px] sm:text-xs md:text-sm text-red-100 px-2 line-clamp-2">{battle.enemy.name}</span>
                      </div>

                      <div className="absolute left-[34%] bottom-[12%] -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border-4 border-cyan-300/40 bg-gradient-to-b from-cyan-300/20 to-black/60 flex items-center justify-center shadow-2xl shadow-cyan-900/40">
                        <span className="text-center font-mono text-[10px] sm:text-xs md:text-sm text-cyan-100 px-2 line-clamp-2">{battle.player.name}</span>
                      </div>

                      <div className="absolute left-0 bottom-0 w-[52%] max-w-sm rounded-xl border border-slate-800 bg-slate-950/85 p-2.5 md:p-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-mono text-sm md:text-base text-cyan-100 truncate">{battle.player.name}</p>
                            <p className="text-xs text-cyan-100/70">Lv. {battle.player.level ?? 50}</p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded border border-cyan-300/30 text-cyan-100/80">{battle.player.status ?? 'NORMAL'}</span>
                        </div>
                        <div className="mt-2">
                          <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-300 transition-all duration-300"
                              style={{ width: `${getHpPercent(battle.player.hp, battle.player.max_hp)}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-cyan-100/80 mt-1 text-right">HP {battle.player.hp}/{battle.player.max_hp}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-3 md:gap-4 flex-1 min-h-0">
                    <div className="rounded-xl border border-cyan-400/30 bg-slate-900/80 p-3 md:p-4 min-h-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-mono text-cyan-100 text-sm sm:text-base md:text-lg">Selecciona Movimiento</h3>
                        <span className="text-xs px-3 py-1 rounded border border-cyan-300/30 text-cyan-100/80">
                          {battle.turn === 'player' ? 'Tu turno' : 'Turno enemigo'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(battle.player.skills ?? []).map((sk, i) => {
                          const disabled = sk.cd > 0 || battle.turn !== 'player' || battleStatus !== 'connected'
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
                              <p className="text-[11px] mt-1 text-cyan-100/70 line-clamp-2">{sk.description ?? 'Movimiento táctico del cazador.'}</p>
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
                        <span className="text-xs text-indigo-100/70">Ronda {battle.round ?? Math.max(battle.log.length, 1)}</span>
                      </div>

                      <div className="h-full space-y-2 text-sm">
                        {(battle.log ?? []).length === 0 && (
                          <p className="text-indigo-100/60">Aun no hay acciones registradas.</p>
                        )}

                        {(battle.log ?? []).slice(-6).map((entry, index) => (
                          <div key={`${entry}-${index}`} className="rounded border border-indigo-200/20 bg-indigo-500/10 p-2 text-indigo-100/90 font-mono text-xs md:text-sm">
                            <span className="text-indigo-200/60 mr-2">{String(index + 1).padStart(2, '0')}.</span>
                            {entry}
                          </div>
                        ))}

                        {(battle.log ?? []).length > 6 && (
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
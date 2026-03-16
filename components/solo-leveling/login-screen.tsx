"use client";

import { useState, useEffect, useRef } from 'react'
import { Swords, Eye, EyeOff } from 'lucide-react'

interface LoginScreenProps {
  onLogin: (username: string) => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSystem, setShowSystem] = useState(false)
  const [error, setError] = useState('')
  const wsRef = useRef<WebSocket | null>(null)

  const [battle, setBattle] = useState<any>(null)
  const [openBattle, setOpenBattle] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSystem(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const startTurnBattle = () => {
    setOpenBattle(true)
    const ws = new WebSocket("wss://repoback-h7gh.onrender.com/ws")
    wsRef.current = ws

    ws.onmessage = evt => {
      const st = JSON.parse(evt.data)
      setBattle({ ...st })
    }
  }

  const sendSkill = (i: number) => {
    if (!wsRef.current) return
    wsRef.current.send(JSON.stringify({ skill: i }))
  }

  const handleSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      onLogin(username.trim())
    }, 1500)
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
      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-1000 ${showSystem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="system-panel rounded-lg p-8">

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

            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-background/80 border border-system-glow/30 rounded px-4 py-3"
              placeholder="Enter password"
            />

            <button type="submit" disabled={isLoading} className="w-full py-3 rounded bg-system-glow/20">
              {isLoading ? "Connecting..." : "Arise"}
            </button>

            {/* JUEGO DE TURNOS */}
            <button
              type="button"
              onClick={startTurnBattle}
              className="w-full py-3 rounded bg-purple-600/20 text-purple-300 border border-purple-600/40"
            >
              Iniciar Combate de Turnos
            </button>

            {openBattle && battle && (
              <div className="bg-black/60 border border-purple-500 p-4 rounded mt-4 text-white">

                <h2 className="font-mono text-xl text-purple-300 mb-2">
                  {battle.enemy.name}
                </h2>
                <p className="text-red-400">HP: {battle.enemy.hp}/{battle.enemy.max_hp}</p>

                <hr className="my-3 border-purple-500/30" />

                <h2 className="font-mono text-lg text-blue-300">You</h2>
                <p className="text-cyan-400">HP: {battle.player.hp}/{battle.player.max_hp}</p>

                <hr className="my-3 border-purple-500/30" />

                <h3 className="text-purple-300 mb-2">Skills</h3>
                <div className="grid grid-cols-3 gap-2">
                  {battle.player.skills.map((sk: any, i: number) => (
                    <button
                      key={i}
                      disabled={sk.cd > 0 || battle.turn !== "player"}
                      onClick={() => sendSkill(i)}
                      className="bg-purple-800/40 border border-purple-500/40 rounded px-2 py-2 text-xs disabled:opacity-40"
                    >
                      {sk.name}
                      <br />
                      {sk.cd > 0 ? `CD: ${sk.cd}` : "READY"}
                    </button>
                  ))}
                </div>

                <hr className="my-3 border-purple-500/30" />

                <div className="text-xs text-purple-200 h-24 overflow-y-auto font-mono">
                  {battle.log.map((l: string, idx: number) => (
                    <p key={idx}>{l}</p>
                  ))}
                </div>

              </div>
            )}

          </form>

        </div>
      </div>
    </div>
  )
}
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [gameState, setGameState] = useState<any>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowSystem(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
    }
  }, [])

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

  // 🎮 Enviar inputs al backend
  const sendInput = (input: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
      p1: input      // Player 1 enviará WASD, J, K…
    }));

    }
  }

  // 🎮 EVENTOS DEL TECLADO → PYGAME
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState) return

      if (e.key === "w") sendInput({ up: true })
      if (e.key === "s") sendInput({ down: true })
      if (e.key === "a") sendInput({ left: true })
      if (e.key === "d") sendInput({ right: true })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameState])

  // 🎮 Iniciar WebSocket del juego
  const startStream = async () => {

    const ws = new WebSocket("ws://localhost:8081/ws")
    wsRef.current = ws

    ws.onopen = () => {
      console.log("WS GAME conectado")
    }

    ws.onerror = err => {
      console.error("WS GAME ERROR:", err)
    }

    ws.onmessage = evt => {
      try {
        const state = JSON.parse(evt.data)
        setGameState(state)
      } catch {
        console.warn("Mensaje no es JSON")
      }
    }
  }

  // 🎮 Pintar en canvas cuando cambie gameState
  useEffect(() => {
  if (!gameState || !canvasRef.current) return;

  const ctx = canvasRef.current.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, 800, 600);

  // Player 1
  ctx.fillStyle = "cyan";
  ctx.fillRect(gameState.p1.x, gameState.p1.y, 30, 30);

  // Player 2 (enemigo o IA)
  ctx.fillStyle = "red";
  ctx.fillRect(gameState.p2.x, gameState.p2.y, 30, 30);
}, [gameState]);

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

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-system-glow/10 to-transparent h-20"
          style={{ animation: 'scan-line 4s linear infinite' }}
        />
      </div>

      {/* Login Panel */}
      <div
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-1000 ${showSystem ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="system-panel rounded-lg p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Swords className="w-8 h-8 text-system-glow" />
              <h1 className="text-3xl font-mono font-bold tracking-wider system-text">SYSTEM</h1>
              <Swords className="w-8 h-8 text-system-glow" />
            </div>
            <p className="text-muted-foreground text-sm font-sans tracking-wide">
              {'[You have been chosen as a Player]'}
            </p>
            <p className="text-muted-foreground text-xs mt-1 font-sans">
              {'Enter your credentials to access the System'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-system-glow uppercase tracking-widest">
                Hunter Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background/80 border border-system-glow/30 rounded px-4 py-3 text-foreground font-sans"
                placeholder="Sung Jinwoo"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-system-glow uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/80 border border-system-glow/30 rounded px-4 py-3 text-foreground font-sans pr-12"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-system-red text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded font-mono text-sm uppercase bg-system-glow/20"
            >
              {isLoading ? "Connecting..." : "Arise"}
            </button>

            {/* 🎮 Iniciar juego */}
            <button
              type="button"
              onClick={startStream}
              className="w-full py-3 rounded bg-blue-600/20 text-blue-400 border border-blue-600/40"
            >
              Iniciar Juego
            </button>

            {/* 🎮 Lienzo del juego */}
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full border border-system-glow/20 mt-4 rounded shadow bg-black"
            />

          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground/60 text-[10px] font-mono uppercase tracking-widest">
              Solo Leveling System v1.0.0
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
"use client";

import { useState, useEffect } from 'react'
import { Swords, Eye, EyeOff } from 'lucide-react'

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSystem, setShowSystem] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setShowSystem(true), 500)
    return () => clearTimeout(timer)
  }, [])

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

          </form>

        </div>
      </div>
    </div>
  )
}
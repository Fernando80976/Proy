import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'

type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'National'

interface PlayerProfileRow {
  username: string
  game_data: unknown
}

interface PublicRankingPlayer {
  username: string
  name: string
  title: string
  level: number
  rank: HunterRank
  kills: number
  dungeons: number
  shadows: number
  powerScore: number
}

const VALID_RANKS: HunterRank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'National']

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const asNumber = (value: unknown, fallback = 0): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

const asString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback
}

const asRank = (value: unknown): HunterRank => {
  if (typeof value === 'string' && VALID_RANKS.includes(value as HunterRank)) {
    return value as HunterRank
  }
  return 'E'
}

const mapGameDataToRankingPlayer = (username: string, gameData: unknown): PublicRankingPlayer | null => {
  const data = asRecord(gameData)
  if (!data) return null

  const stats = asRecord(data.stats)
  const shadows = Array.isArray(data.shadows) ? data.shadows.length : 0

  const strength = asNumber(stats?.strength)
  const agility = asNumber(stats?.agility)
  const vitality = asNumber(stats?.vitality)
  const intelligence = asNumber(stats?.intelligence)
  const perception = asNumber(stats?.perception)

  return {
    username,
    name: asString(data.name, username),
    title: asString(data.title, 'Hunter'),
    level: asNumber(data.level, 1),
    rank: asRank(data.hunterRank),
    kills: asNumber(data.totalMonstersKilled),
    dungeons: asNumber(data.totalDungeonClears),
    shadows,
    powerScore: strength + agility + vitality + intelligence + perception + shadows * 10,
  }
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('player_profiles')
    .select('username,game_data')
    .order('updated_at', { ascending: false })
    .limit(300)

  if (error) {
    return NextResponse.json({ error: 'No se pudo cargar el ranking global.' }, { status: 500 })
  }

  const rows = (data ?? []) as PlayerProfileRow[]
  const players = rows
    .map(row => mapGameDataToRankingPlayer(row.username, row.game_data))
    .filter((player): player is PublicRankingPlayer => player !== null)

  return NextResponse.json({ players })
}

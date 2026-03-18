import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'

interface PlayerProfileRow {
  game_data: unknown
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as { username?: string; sessionToken?: string } | null

  const username = payload?.username?.trim().toLowerCase()
  const sessionToken = payload?.sessionToken?.trim()

  if (!username || !sessionToken) {
    return NextResponse.json({ error: 'Sesion invalida.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('player_profiles')
    .select('game_data')
    .eq('username', username)
    .eq('session_token', sessionToken)
    .maybeSingle<PlayerProfileRow>()

  if (error) {
    return NextResponse.json({ error: 'No se pudo cargar el perfil.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Sesion expirada.' }, { status: 401 })
  }

  return NextResponse.json({ playerData: data.game_data ?? null })
}

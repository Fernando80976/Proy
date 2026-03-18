import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as {
    username?: string
    sessionToken?: string
    playerData?: unknown
  } | null

  const username = payload?.username?.trim().toLowerCase()
  const sessionToken = payload?.sessionToken?.trim()
  const playerData = payload?.playerData

  if (!username || !sessionToken || !playerData) {
    return NextResponse.json({ error: 'Payload invalido.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('player_profiles')
    .update({
      game_data: playerData,
      updated_at: new Date().toISOString(),
    })
    .eq('username', username)
    .eq('session_token', sessionToken)
    .select('username')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'No se pudo guardar el progreso.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Sesion invalida.' }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}

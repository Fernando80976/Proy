import { createHash, randomUUID } from 'crypto'
import { NextResponse } from 'next/server'

import { createNewPlayer } from '@/lib/game-store'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface PlayerProfileRow {
  username: string
  password_hash: string
  session_token: string
  game_data: unknown
}

const mapSupabaseError = (context: string, error: { message?: string; code?: string; details?: string | null }) => {
  const detailParts = [error.code, error.message, error.details ?? undefined].filter(Boolean)
  const details = detailParts.length > 0 ? detailParts.join(' | ') : 'unknown_error'
  return `${context}. Detalle: ${details}`
}

const hashPassword = (password: string): string => {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as { username?: string; password?: string } | null

  const username = payload?.username?.trim()
  const password = payload?.password ?? ''

  if (!username || password.length < 4) {
    return NextResponse.json({ error: 'Username y password invalidos.' }, { status: 400 })
  }

  const normalizedUsername = username.toLowerCase()
  const passwordHash = hashPassword(password)
  const sessionToken = randomUUID()

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('player_profiles')
    .select('username,password_hash,session_token,game_data')
    .eq('username', normalizedUsername)
    .maybeSingle<PlayerProfileRow>()

  if (existingError) {
    return NextResponse.json({ error: mapSupabaseError('No se pudo consultar la cuenta del jugador', existingError) }, { status: 500 })
  }

  if (existing && existing.password_hash !== passwordHash) {
    return NextResponse.json({ error: 'Credenciales invalidas.' }, { status: 401 })
  }

  if (!existing) {
    const playerData = createNewPlayer(username)

    const { error: insertError } = await supabaseAdmin
      .from('player_profiles')
      .insert({
        username: normalizedUsername,
        password_hash: passwordHash,
        session_token: sessionToken,
        game_data: playerData,
        last_login_at: new Date().toISOString(),
      })

    if (insertError) {
      return NextResponse.json({ error: mapSupabaseError('No se pudo crear la cuenta del jugador', insertError) }, { status: 500 })
    }

    return NextResponse.json({
      playerData,
      auth: {
        username: normalizedUsername,
        sessionToken,
      },
    })
  }

  const fallbackData = createNewPlayer(username)
  const playerData = (existing.game_data && typeof existing.game_data === 'object')
    ? existing.game_data
    : fallbackData

  const { error: updateSessionError } = await supabaseAdmin
    .from('player_profiles')
    .update({
      session_token: sessionToken,
      last_login_at: new Date().toISOString(),
    })
    .eq('username', normalizedUsername)

  if (updateSessionError) {
    return NextResponse.json({ error: mapSupabaseError('No se pudo actualizar la sesion del jugador', updateSessionError) }, { status: 500 })
  }

  return NextResponse.json({
    playerData,
    auth: {
      username: normalizedUsername,
      sessionToken,
    },
  })
}

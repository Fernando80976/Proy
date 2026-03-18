-- Per-user save profiles for custom login (username + password)
-- Run this in Supabase SQL editor after 001_create_players_table.sql.

create table if not exists public.player_profiles (
  username text primary key,
  password_hash text not null,
  session_token text not null,
  game_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create index if not exists idx_player_profiles_updated_at
  on public.player_profiles (updated_at desc);

create or replace function public.set_player_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_player_profiles_updated_at on public.player_profiles;

create trigger trg_player_profiles_updated_at
before update on public.player_profiles
for each row
execute function public.set_player_profiles_updated_at();

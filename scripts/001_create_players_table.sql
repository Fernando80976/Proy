-- Solo Leveling System - Player Data Table
-- Stores all player game state in a single JSONB column for flexibility
-- The complex nested data (skills, quests, inventory, shadows) fits perfectly in JSONB

create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  hunter_name text not null default 'Hunter',
  game_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.players enable row level security;

-- RLS Policies: users can only access their own data
create policy "players_select_own" on public.players
  for select using (auth.uid() = id);

create policy "players_insert_own" on public.players
  for insert with check (auth.uid() = id);

create policy "players_update_own" on public.players
  for update using (auth.uid() = id);

create policy "players_delete_own" on public.players
  for delete using (auth.uid() = id);

-- Auto-create player row on user signup via trigger
create or replace function public.handle_new_player()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.players (id, hunter_name, game_data)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'hunter_name', 'Hunter'),
    '{}'::jsonb
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_player on auth.users;

create trigger on_auth_user_created_player
  after insert on auth.users
  for each row
  execute function public.handle_new_player();

-- Ranking view: public leaderboard data (no RLS needed for views)
create or replace view public.leaderboard as
select
  id,
  hunter_name,
  (game_data->>'level')::int as level,
  game_data->>'hunterRank' as hunter_rank,
  game_data->>'title' as title,
  (game_data->>'totalDungeonClears')::int as dungeon_clears,
  (game_data->>'totalMonstersKilled')::int as monsters_killed,
  updated_at
from public.players
where game_data->>'level' is not null
order by (game_data->>'level')::int desc, (game_data->>'totalMonstersKilled')::int desc;

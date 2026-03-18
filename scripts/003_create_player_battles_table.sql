create table if not exists public.player_battles (
  username text primary key references public.player_profiles(username) on delete cascade,
  battle_state jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_player_battles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_player_battles_updated_at on public.player_battles;

create trigger trg_player_battles_updated_at
before update on public.player_battles
for each row
execute function public.set_player_battles_updated_at();

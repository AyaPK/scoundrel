-- profiles: stores username linked to auth.users
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  created_at timestamptz default now() not null
);

-- game_runs: one row per completed game
create table public.game_runs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  victory boolean not null,
  score integer not null,
  turns_played integer not null,
  final_health integer not null
);

-- game_sessions: one row per user (upserted), stores in-progress state
create table public.game_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  updated_at timestamptz default now() not null,
  game_state jsonb not null
);

-- RLS
alter table public.profiles enable row level security;
alter table public.game_runs enable row level security;
alter table public.game_sessions enable row level security;

create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own runs" on public.game_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own session" on public.game_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile on signup (handles both email and OAuth users)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

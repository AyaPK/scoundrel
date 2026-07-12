-- Add coins balance to profiles
alter table public.profiles
  add column coins integer not null default 0;

-- RPC: atomically award coins after a run (floors at 0)
create or replace function public.award_run_coins(p_user_id uuid, p_score integer)
returns void as $$
begin
  update public.profiles
  set coins = coins + greatest(0, 100 + p_score)
  where id = p_user_id;
end;
$$ language plpgsql security definer;

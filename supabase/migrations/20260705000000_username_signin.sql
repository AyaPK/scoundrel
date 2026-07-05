-- Resolve a username to its auth email for client-side username login
create or replace function public.get_email_for_username(p_username text)
returns text
language sql
security definer
stable
as $$
  select au.email
  from public.profiles p
  join auth.users au on au.id = p.id
  where lower(p.username) = lower(p_username)
  limit 1;
$$;

grant execute on function public.get_email_for_username to anon, authenticated;

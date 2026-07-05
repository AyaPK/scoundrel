-- Grant table-level permissions so authenticated users can actually perform DML
-- (RLS policies alone are not enough if GRANT is missing)
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.game_runs to authenticated;
grant select, insert, update, delete on public.game_sessions to authenticated;

-- anon needs select on profiles only (for username→email lookup during sign-in)
grant select on public.profiles to anon;

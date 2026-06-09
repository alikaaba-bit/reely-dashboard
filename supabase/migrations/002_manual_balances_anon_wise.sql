-- Reely dashboard is unauthenticated (anon key, no login). The original
-- manual_balances policy only allowed the `authenticated` role, so the
-- dashboard could neither read nor write manual balances — Highbeam showed
-- the env fallback and edits silently failed. Grant anon access to match the
-- app's design, and add Wise as a manual cash account.

grant select, insert, update on public.manual_balances to anon;

drop policy if exists "anon_all_manual_balances" on public.manual_balances;
create policy "anon_all_manual_balances" on public.manual_balances
  for all to anon using (true) with check (true);

insert into public.manual_balances (account_name, balance, updated_at)
values ('Wise', 0, now())
on conflict (account_name) do nothing;

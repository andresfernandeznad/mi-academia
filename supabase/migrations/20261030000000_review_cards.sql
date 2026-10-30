-- Review progress, one row per (user, question). The browser's IndexedDB is the offline source of
-- truth; this table is the copy that lets several devices share it. Conflicts resolve by updated_at.
create table public.review_cards (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  question_id text not null,
  box smallint not null check (box between 1 and 5),
  due date not null,
  updated_at timestamptz not null,
  primary key (user_id, question_id)
);

comment on table public.review_cards is 'Leitner review state per question, synced from the Mi Academia PWA.';

-- The anon key ships in the frontend, so Row Level Security is the only thing between one
-- account's rows and everyone else. Enable it before any grant.
alter table public.review_cards enable row level security;

-- (select auth.uid()) is evaluated once per statement instead of once per row.
create policy "Read own cards" on public.review_cards
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Insert own cards" on public.review_cards
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Update own cards" on public.review_cards
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- No delete policy: the app never deletes cards. Deleting the account cascades.
grant select, insert, update on public.review_cards to authenticated;

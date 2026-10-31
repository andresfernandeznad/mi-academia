-- Days on which the learner studied (answered a question in a lesson or in the review), one row per
-- (user, day). The set only grows, so devices merge by union: no updated_at and no conflicts.
create table public.study_days (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);

comment on table public.study_days is 'Local calendar days with study activity, synced from the Mi Academia PWA.';

-- Same reasoning as review_cards: the anon key ships in the frontend, so RLS goes on before any grant.
alter table public.study_days enable row level security;

create policy "Read own study days" on public.study_days
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Insert own study days" on public.study_days
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- No update or delete policy: a study day is never changed or removed. Deleting the account cascades.
-- Uploads use INSERT ... ON CONFLICT DO NOTHING, which needs only the insert privilege.
grant select, insert on public.study_days to authenticated;

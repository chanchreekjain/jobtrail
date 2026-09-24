-- One row per AI call, so a per-user daily cap can be enforced.
-- The API keys are the app's, shared by everyone: without a cap, one
-- person pasting all day leaves nothing for anyone else.
create table usage_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  kind       text not null check (kind in ('extract', 'match', 'resume', 'intel')),
  created_at timestamptz not null default now()
);

create index on usage_events (user_id, created_at);

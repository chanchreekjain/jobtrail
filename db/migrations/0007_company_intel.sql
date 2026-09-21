-- Company research, shared across users, plus a log of who spent searches.

-- One row per company, not per user: "what does Swiggy do" has the same
-- answer whoever asks, so the first lookup pays and everyone after reads
-- it for free. Deliberately has no user_id.
create table company_intel (
  id           uuid primary key default gen_random_uuid(),
  -- Lowercased, trimmed name, so "Swiggy" and " swiggy " hit one row.
  company_key  text not null unique,
  company_name text not null,
  -- The researched content: summary, facts with source URLs, careers page.
  -- jsonb because its shape will change while we build, and nothing
  -- ever filters on what's inside it.
  data         jsonb not null,
  fetched_at   timestamptz not null default now()
);

-- One row each time a user's lookup actually spent a search credit.
-- The weekly allowance is a count of this table over the last 7 days.
create table intel_lookups (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  company_key text not null,
  created_at  timestamptz not null default now()
);

create index on intel_lookups (user_id, created_at);

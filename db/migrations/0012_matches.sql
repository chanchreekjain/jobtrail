-- One match result per (job, resume) pair. A new resume upload means new
-- pairs, so old scores are never silently reused for a different resume.
create table matches (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  job_id       uuid not null references jobs(id) on delete cascade,
  resume_id    uuid not null references resumes(id) on delete cascade,
  -- Per requirement: met or not, and the resume evidence behind it.
  results      jsonb not null,
  must_met     int not null,
  must_total   int not null,
  nice_met     int not null,
  nice_total   int not null,
  -- 0–100, or null when the JD listed no requirements at all.
  score        int check (score between 0 and 100),
  created_at   timestamptz not null default now(),
  unique (job_id, resume_id)
);

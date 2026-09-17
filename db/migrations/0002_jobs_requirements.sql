create table jobs (
  id         uuid primary key default gen_random_uuid(),
  raw_jd     text not null,
  jd_hash    text not null unique,
  created_at timestamptz not null default now()
);

create table requirements (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid not null references jobs(id) on delete cascade,
  text       text not null,
  kind       text not null,
  skill      text not null,
  created_at timestamptz not null default now()
);

create index on requirements (job_id);
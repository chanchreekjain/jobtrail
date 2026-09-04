create table applications (
  id          uuid primary key default gen_random_uuid(),
  company     text not null,
  role        text not null,
  status      text not null default 'draft',
  source_url  text,
  created_at  timestamptz not null default now()
);
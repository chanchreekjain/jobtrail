-- Every row in this app now belongs to somebody.

create table users (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  name       text,
  image      text,
  created_at timestamptz not null default now()
);

-- Nullable on purpose: rows that already exist have no owner yet.
alter table jobs
  add column user_id uuid references users(id) on delete cascade;

alter table applications
  add column user_id uuid references users(id) on delete cascade;

-- A pasted JD is unique per person, not globally. Two people pasting
-- the same posting each need their own row.
alter table jobs drop constraint jobs_jd_hash_key;
create unique index jobs_user_jd_hash_key on jobs (user_id, jd_hash);

create index on jobs (user_id);
create index on applications (user_id);

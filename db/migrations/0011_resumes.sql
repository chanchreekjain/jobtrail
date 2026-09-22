-- What we learned from a user's resume. The PDF itself is NOT stored:
-- it's read once, and only the extracted facts are kept.
-- Each upload is a new row, so history survives; the newest row is the
-- current resume.
create table resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  file_name   text not null,
  headline    text,
  -- Lowercase single-skill names, the same style as requirements.skill,
  -- so the match score can compare the two directly.
  skills      text[] not null default '{}',
  years_experience numeric check (years_experience >= 0),
  -- Roles and education: displayed, never filtered on, so jsonb.
  experience  jsonb not null default '[]',
  education   jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

create index on resumes (user_id, created_at desc);

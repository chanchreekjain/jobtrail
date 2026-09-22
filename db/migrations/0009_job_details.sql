-- The details most JDs state and job-seekers filter on.
-- All nullable: most JDs leave some of these out, and a blank is honest.

alter table jobs
  add column location        text,
  -- check constraints: the database itself refuses any other value, so
  -- "Hybrid", "hybrid" and "WFH" can never end up as three different things.
  add column work_mode       text check (work_mode in ('remote', 'hybrid', 'onsite')),
  add column employment_type text check (employment_type in ('full_time', 'part_time', 'contract', 'internship')),
  add column experience_min  int  check (experience_min >= 0),
  -- Salary as the JD wrote it ("12–18 LPA") is what we show; the parsed
  -- numbers beside it are for sorting and filtering later, and may be
  -- null even when the raw text isn't.
  add column salary_raw      text,
  add column salary_min      numeric,
  add column salary_max      numeric,
  add column salary_currency text,
  add column salary_period   text check (salary_period in ('year', 'month', 'hour')),
  add column contact_email   text,
  -- Anything important that fits no column: "travel 40%", "German required".
  add column notes           text;

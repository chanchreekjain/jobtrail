alter table applications
  add column job_id     uuid references jobs(id) on delete cascade,
  add column applied_at date;

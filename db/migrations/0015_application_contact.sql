-- A contact the user typed themselves. Separate from jobs.contact_email,
-- which is whatever the JD stated: the user's own value wins when set,
-- and clearing it falls back to the JD's again.
alter table applications
  add column contact_email text;

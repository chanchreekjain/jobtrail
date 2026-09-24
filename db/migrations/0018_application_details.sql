-- A details line the user writes themselves. When set it replaces the
-- summary built from the job description ("Bengaluru · Hybrid · 12–18 LPA"),
-- and clearing it brings that back.
alter table applications
  add column details_note text;

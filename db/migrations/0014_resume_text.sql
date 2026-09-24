-- The resume's own words, so matching isn't limited to the skills list
-- the extractor happened to pick up. Emails and phone numbers are
-- stripped before this is saved.
alter table resumes
  add column body text;

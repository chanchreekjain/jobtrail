-- How a match was decided:
--   'ai'    — every requirement judged by Gemini, synonyms included
--   'basic' — exact skill-name matches only, used when Gemini is down
-- A 'basic' score is upgraded to 'ai' the next time Gemini answers.
alter table matches
  add column method text not null default 'ai' check (method in ('ai', 'basic'));

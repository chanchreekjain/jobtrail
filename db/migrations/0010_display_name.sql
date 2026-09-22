-- A name the user chooses, separate from the one Google supplies.
-- Null means "use my Google name", so clearing the box falls back to it
-- instead of leaving the user nameless.
alter table users
  add column display_name text check (char_length(display_name) <= 60);

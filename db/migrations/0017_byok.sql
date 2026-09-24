-- A user's own Gemini API key, encrypted before it ever reaches the
-- database. We keep the last four characters in the clear so the UI can
-- show which key is set without decrypting anything.
alter table users
  add column gemini_key_encrypted text,
  add column gemini_key_last4     text,
  add column gemini_key_set_at    timestamptz;

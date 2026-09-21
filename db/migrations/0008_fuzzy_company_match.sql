-- Lets us ask "is there a cached company whose name is close to this one?"
-- pg_trgm compares strings by their overlapping three-letter chunks, so
-- "nicrosoft" and "microsoft" score as similar despite the typo.
create extension if not exists pg_trgm;

-- Makes similarity lookups fast once the cache holds thousands of companies.
create index company_intel_key_trgm
  on company_intel using gin (company_key gin_trgm_ops);

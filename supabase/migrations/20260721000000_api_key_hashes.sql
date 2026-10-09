-- AcademiaAI: hash API keys at rest
--
-- public.api_keys stored the full API key in plaintext (api_key TEXT UNIQUE).
-- A database dump, a leaked backup, or any read-path SQL injection exposed
-- every customer's live credential. Keys are now stored as SHA-256 hashes
-- (the key is 128 bits of UUID entropy, so a deterministic hash is safe —
-- rainbow tables do not apply — and lookups stay a single indexed equality).
-- A short display prefix is kept for the dashboard UI.
--
-- Existing rows are backfilled before the plaintext column is dropped.

create extension if not exists pgcrypto;

alter table public.api_keys add column if not exists api_key_hash text;
alter table public.api_keys add column if not exists key_prefix text;

update public.api_keys
   set api_key_hash = encode(digest(api_key, 'sha256'), 'hex'),
       key_prefix = left(api_key, 12)
 where api_key_hash is null;

create unique index if not exists idx_api_keys_hash on public.api_keys(api_key_hash);

alter table public.api_keys alter column api_key_hash set not null;

drop index if exists idx_api_keys_key;
alter table public.api_keys drop column if exists api_key;

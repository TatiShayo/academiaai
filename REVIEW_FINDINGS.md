# AcademiaAI — Review Findings

Audit date: 2026-07-18. Findings are ordered by severity. Status: **Fixed** =
remediated and verified in this pass; **Recommended** = deliberately deferred
with a safe current posture.

## Critical

### C1. Auth bypass + denial-of-wallet via `e2e-bypass` cookie — FIXED
`tool-guard.checkUsage()` and `lib/supabase/middleware.ts` honoured an
`e2e-bypass=true` cookie **unconditionally**, and the cookie was set with
`httpOnly:false`. Any anonymous client could set it (or read/replay it) to
obtain an authenticated, unlimited context — skipping authentication, rate
limiting **and** monthly quota on every LLM endpoint. That is both a full auth
bypass and an unbounded denial-of-wallet against the OpenAI key.
- Fix: the bypass is now honoured **only** when the server is started with
  `E2E_TEST_MODE=true` (never set in production); the cookie is `httpOnly:true`.
- Regression test: `src/__tests__/e2e-bypass-guard.test.ts` (proves 401 without
  the flag, allowed only with it). This is the proven+fixed abuse chain.

### C2. Over-permissive RLS policies (default-allow) — FIXED
`user_usage` and `profiles` shipped `FOR ALL USING (true) WITH CHECK (true)`
policies **without a `TO` clause**, so they applied to the `public` role
(anon + authenticated) rather than only the service role. Any logged-in user
could read or modify **any** row — e.g. reset their own usage quota to dodge the
paywall, or read another user's profile/usage (cross-tenant).
- Fix: `supabase/migrations/20260718000000_rls_default_deny.sql` drops those
  policies and re-scopes them `TO service_role`, restoring default-deny with
  owner-scoped read/update for ordinary users. (`service_role` bypasses RLS
  anyway, so it never needed a public policy.)

### C3. Tool endpoints had no auth / rate-limit / quota — FIXED
`/api/tools/{humanize,enhance,plagiarism-risk,citations,quiz,syllabus}` called
the model directly with only shape checks — no session auth, no rate limiting,
no quota. Anyone could drive unlimited paid model calls (denial-of-wallet) and
bypass the monthly free-tier limit.
- Fix: every tool route now goes through `checkUsage()` (auth + per-user rate
  limit + quota) and `trackUsage()`, and validates input with zod.

## High

### H1. Prompt injection on untrusted document/user text — FIXED
Tool and `/api/v1` routes fed user/document text straight into the model. A
document could contain "ignore previous instructions…".
- Fix: `wrapUntrusted()` wraps all untrusted text in explicit delimiters with a
  data-not-instructions directive; applied across `/api/tools/*` and `/api/v1/*`.

### H2. `/api/v1/*` API-key lookup used the anon client — FIXED (functional + security)
Key validation queried `api_keys` with the cookie-bound anon client. With no
session, RLS (`auth.uid() = user_id`) hides every row, so **all** API-key
requests failed to validate. Switched to the service-role admin client for the
lookup only. (Also fixes the public API being effectively unusable.)

### H3. File upload: no auth, no size cap, no content validation — FIXED
`/api/tools/humanize/upload` accepted any file, unauthenticated, and parsed it
with mammoth. Risks: unauthenticated CPU-heavy parsing (DoS), oversized uploads,
binary/malformed payloads.
- Fix: requires `checkUsage()` auth; 5 MB cap; filename basename-only (path
  traversal defence); `.docx` magic-byte (`PK\x03\x04`) check before parsing;
  NUL-byte heuristic to reject binaries mislabelled `.txt`.

### H4. Missing Content-Security-Policy / Permissions-Policy — FIXED
Only HSTS/X-Frame/X-CTO/Referrer headers were set. Added a CSP (self + Stripe +
Supabase + OpenAI connect-src, `frame-ancestors 'none'`, `object-src 'none'`),
`Permissions-Policy`, and `X-DNS-Prefetch-Control` in `next.config.ts`.

## Medium

### M1. API keys stored in plaintext — RECOMMENDED
`api_keys.api_key` is stored as the raw token. A DB read discloses live keys.
Recommend storing only a SHA-256 hash, looking up by hash in `/api/v1/*`, and
showing the plaintext once at creation. Deferred because it also requires
changing the settings UI's key listing; current posture relies on RLS + limited
service-role access.

### M2. In-memory rate limiting — RECOMMENDED
`rate-limit.ts` is per-process (resets on restart, not shared across instances).
Adequate for single-instance/demo; move to Redis/Postgres for horizontal scale.
Unbounded-growth was already mitigated with periodic cleanup.

### M3. Leaderboard full-table scan, unauthenticated — FIXED (mitigated)
`getTotalWordsProcessed()` selects all `profiles` rows and sums in JS on every
public request. Added HTTP + route caching (`revalidate = 300`,
`s-maxage=300`). Recommend a DB-side aggregate/materialised counter at scale.

### M4. Documents are client-only (localStorage) — RECOMMENDED
The saved library lives entirely in the browser; it is not server-persisted, not
shared across devices, and not covered by RLS. Fine for the current product
stage; flagged for a future server-backed `documents` table.

## Low / cleanup
- Removed the redundant `src/middleware.ts` re-export (Next 16 requires the
  single `proxy.ts` entrypoint) — was breaking `next build`.
- `stripe.ts` and `supabase/env.ts` now construct clients with build-safe
  placeholders so a keyless `next build` doesn't crash at module load.
- Unused `lucide-react` `Check` imports and other unused-var warnings remain as
  non-blocking eslint warnings.

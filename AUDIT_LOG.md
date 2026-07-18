# AcademiaAI — Audit Log

## Session 2026-07-18 — Full audit + hardening (Claude Fable 5)

Starting point: a checkpoint commit (`2ed4c71`) that had left the tool routes,
unit tests, and dashboard UI in three mutually inconsistent states, with
production dependencies uninstalled and the build broken.

### Environment / gate bootstrap
- Installed missing deps: `stripe`, `mammoth`, `lucide-react`, `gray-matter`,
  `next-mdx-remote`, `diff`, `class-variance-authority`, `clsx`, `cmdk`,
  `framer-motion`, `tailwind-merge`, `@base-ui/react`, `@supabase/ssr`,
  `@supabase/supabase-js`, and dev `@playwright/test`, `@types/diff`.
- Fixed `stripe` `apiVersion` type mismatch.

### Security (found → fixed)
1. **Auth bypass + denial-of-wallet** via unconditional, `httpOnly:false`
   `e2e-bypass` cookie → gated behind `E2E_TEST_MODE=true`, cookie now
   `httpOnly`. Regression test added. (Critical — proven exploit chain.)
2. **Default-allow RLS** on `user_usage` and `profiles` (`FOR ALL USING(true)`
   applied to `public`) → new migration re-scopes to `service_role`; owners keep
   least-privilege read/update. (Critical — cross-tenant + paywall bypass.)
3. **Unauthenticated, unmetered LLM tool routes** → all `/api/tools/*` now go
   through `checkUsage()` (auth + rate limit + quota) + `trackUsage()` + zod.
   (Critical — denial-of-wallet.)
4. **Prompt injection** → `wrapUntrusted()` delimiters on all untrusted text in
   `/api/tools/*` and `/api/v1/*`. (High.)
5. **`/api/v1/*` key lookup used anon client** (RLS-blocked, always failed) →
   switched to service-role admin client. (High — functional + security.)
6. **Upload hardening** → auth required; 5 MB cap; extension allowlist;
   basename-only (path traversal); `.docx` magic-byte + `.txt` binary checks.
   (High.)
7. **Security headers** → added CSP, Permissions-Policy, X-DNS-Prefetch-Control.
   (High.)

### Performance / reliability
- Added `/dashboard` error boundary + loading skeleton.
- Cached the public leaderboard full-table scan (`revalidate=300` + Cache-Control).

### Build / consistency fixes
- Removed redundant `src/middleware.ts` (Next 16 requires single `proxy.ts`).
- Build-safe placeholder init for Stripe and Supabase clients (`lib/supabase/env.ts`)
  so keyless `next build` doesn't crash at module load.
- Reconciled the humanize dashboard UI to the secured route contract; rewrote the
  Playwright spec against the actual UI.
- Removed the global module mocks in `vitest.setup.ts` that clobbered
  `openai.test.ts`.

### Abuse chain proven + fixed (deliverable 5)
Cross-tenant / denial-of-wallet via the `e2e-bypass` cookie: an anonymous client
sets `e2e-bypass=true` and every LLM endpoint treats it as an authenticated,
unlimited user. Fixed by requiring `E2E_TEST_MODE`; locked in by
`src/__tests__/e2e-bypass-guard.test.ts`.

### Deferred (with safe current posture)
- API keys stored plaintext (recommend hashed storage) — see REVIEW_FINDINGS M1.
- In-memory rate limiter (recommend Redis for multi-instance) — M2.
- Client-only document library (recommend server table) — M4.

### Gate results
- `tsc --noEmit`: PASS (0 errors)
- `eslint`: PASS (0 errors, 9 non-blocking warnings)
- `next build` (NODE_OPTIONS=--max-old-space-size=4096): PASS (45 routes)
- `vitest run`: PASS (57/57)
- `playwright test`: PASS (1/1)

**Full gate: GREEN.**

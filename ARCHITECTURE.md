# AcademiaAI — Architecture

AcademiaAI is a Next.js 16 (App Router, Turbopack, React 19) academic-writing
assistant with a Supabase (Postgres + Auth) backend, optional OpenAI-backed
tools, and Stripe billing. It exposes a set of writing tools (humanize, enhance,
plagiarism-risk, citations, quiz, syllabus), a public JSON API (`/api/v1/*`)
authenticated by API keys, and a marketing/blog surface.

## High-level modules

```
src/
  app/
    (marketing)            landing (/), blog (/blog, MDX), tool SEO pages (/tools/*), docs (/docs/api)
    login, signup          Supabase email auth pages
    auth/callback          OAuth/code exchange -> session
    auth/signout           POST -> sign out
    dashboard/*            authenticated app: humanize, enhance, plagiarism, citations,
                           quiz, syllabus, documents, settings (API keys)
    api/
      tools/*              first-party tool endpoints (session-auth via tool-guard)
      tools/humanize/upload  .docx/.txt extraction (mammoth)
      v1/*                 public API (Bearer API-key auth)
      keys                 CRUD for a user's API keys
      usage                current user's plan/quota
      leaderboard          public aggregate of words processed (cached)
      stripe/create-checkout, stripe/webhook   billing
      extension-waitlist   marketing form stub
  lib/
    openai.ts              chat() LLM client + wrapUntrusted() injection guard + offline mocks
    tool-guard.ts          checkUsage()/trackUsage(): auth + rate limit + quota for tool routes
    rate-limit.ts          in-memory per-user + per-API-key rate limiters
    schemas.ts             zod schemas for every API boundary
    usage.ts               server usage/plan accounting (admin client)
    usage-limits.ts        client-side usage mirror (localStorage)
    storage.ts             client-side document/library persistence (localStorage)
    documents-provider.tsx React context over the localStorage document store
    stripe.ts              Stripe SDK singleton (+ isStripeConfigured)
    supabase/
      client.ts            browser client
      server.ts            RSC/route-handler client (cookie-bound)
      middleware.ts        session refresh + route protection (proxy)
      admin.ts             service-role client (bypasses RLS; server-only)
      env.ts               resolves Supabase URL/key with build-safe placeholders
  proxy.ts                 Next 16 middleware entrypoint -> updateSession
supabase/migrations/*      user_usage, api_keys, profiles, RLS hardening
e2e/                       Playwright: humanize -> copy -> save flow
```

## Data flow

### First-party tools (`/api/tools/*`)
1. `checkUsage()` (tool-guard) resolves the caller:
   - In an explicit test server (`E2E_TEST_MODE=true`) a signed `e2e-bypass`
     cookie yields a synthetic user.
   - Otherwise the Supabase session user is required (401 if absent).
   - Per-user in-memory rate limit (429) and monthly quota (`canProcess`, 402)
     are enforced before any LLM call (denial-of-wallet protection).
2. The request body is validated with a zod schema (400 on failure).
3. User/document text is wrapped with `wrapUntrusted()` delimiters before being
   passed to `chat()` (prompt-injection mitigation).
4. `trackUsage()` increments the monthly doc count and words-processed total.

### Public API (`/api/v1/*`)
- `Authorization: Bearer <api_key>` -> the key is looked up with the
  **service-role admin client** (RLS would otherwise hide the row from an
  unauthenticated caller). Revoked keys are rejected.
- Per-API-key daily rate limit (`checkApiRateLimit`).
- `last_used_at` is stamped; words processed are accounted.

### Auth & session
- `proxy.ts` -> `lib/supabase/middleware.updateSession` refreshes the session
  cookie on every request and guards `/dashboard/*` (redirect to `/login` when
  unauthenticated) and bounces authenticated users away from `/login`,`/signup`,`/`.

### Billing
- `stripe/create-checkout` creates subscription or pay-per-doc sessions with
  `user_id` in metadata; `stripe/webhook` verifies the signature and flips the
  user's plan (`setPro`/`unlockSingle`/`setFree`).

## External services
| Service  | Client                    | Notes |
|----------|---------------------------|-------|
| Supabase | `@supabase/ssr` + admin   | Postgres, Auth, RLS. Admin client is server-only. |
| OpenAI   | `fetch` in `lib/openai`   | `gpt-4o-mini`. Falls back to labelled offline mocks when no key. |
| Stripe   | `stripe` SDK              | Checkout + webhooks. Gated by `isStripeConfigured()`. |

## Persistence model
- **Server (Postgres):** `user_usage` (monthly quota/plan), `api_keys`,
  `profiles` (lifetime words). All RLS-protected, default-deny, owner-scoped
  read + service-role writes.
- **Client (localStorage):** the document library, activity log and drafts live
  in the browser (`storage.ts`, `documents-provider.tsx`). Documents are not yet
  server-persisted — see REVIEW_FINDINGS.md.

## Notable design constraints
- `env.ts` supplies placeholder Supabase credentials so `next build` succeeds in
  keyless CI/demo environments; real values are always present at runtime.
- The `e2e-bypass` affordance is disabled unless the server is explicitly started
  with `E2E_TEST_MODE=true`, so it cannot be abused in production.

# AcademiaAI

AI-powered academic writing assistant: humanize AI text, enhance academic tone,
scan plagiarism risk, generate citations, build quizzes and syllabi — plus a
public JSON API, API-key management, and Stripe billing.

Built with **Next.js 16** (App Router, React 19, Turbopack), **Supabase**
(Postgres + Auth + RLS), **OpenAI** (`gpt-4o-mini`), and **Stripe**.

## Features

- **Writing tools** — humanizer, academic enhancer, plagiarism-risk scanner,
  citation generator, quiz generator, syllabus organizer.
- **Document upload** — `.docx`/`.txt` extraction (validated: size, extension,
  magic bytes).
- **Public API** — `/api/v1/{humanize,enhance,citations}` authenticated by
  per-user API keys with daily rate limits.
- **Accounts & billing** — Supabase email auth; free tier with monthly quota;
  Stripe subscription and pay-per-doc unlocks.
- **Marketing/SEO** — landing page with structured data, MDX blog, sitemap,
  robots, per-tool SEO pages.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the module map and data flow.
Security posture and audit results are in
[REVIEW_FINDINGS.md](./REVIEW_FINDINGS.md).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev                        # http://localhost:3000
```

### Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin client (usage/keys). Never expose. |
| `OPENAI_API_KEY` | Enables real model calls; without it, labelled offline mocks are used |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Billing |
| `NEXT_PUBLIC_APP_URL` | Absolute URL for Stripe redirects |

The build is resilient to missing Supabase/Stripe keys (placeholders are used at
build time), so `next build` works in CI without secrets.

### Database

Apply the SQL in `supabase/migrations/` (via the Supabase CLI or dashboard).
All tables are RLS-protected, default-deny, owner-scoped for reads and
service-role for writes.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit/integration tests |
| `npx tsc --noEmit` | Type check |
| `npx playwright test` | End-to-end (builds + serves with `E2E_TEST_MODE`) |

## Testing

- **Unit/integration** (`src/**/__tests__`, `src/__tests__`): tool routes,
  usage/quota enforcement, mock generators, and the `e2e-bypass` security
  regression test — 57 tests.
- **E2E** (`e2e/humanize.spec.ts`): full humanize → copy → save-to-library flow
  in Chromium.

## Security highlights

- Auth + per-user rate limit + monthly quota enforced before any LLM call
  (denial-of-wallet protection).
- Prompt-injection mitigation: untrusted document/user text is delimiter-wrapped.
- Default-deny RLS on every table; the test-only auth bypass is gated behind an
  explicit `E2E_TEST_MODE` flag.
- CSP, HSTS, Permissions-Policy and related headers on every response.
- Validated file uploads (type/size/magic-byte/path-traversal).

See [REVIEW_FINDINGS.md](./REVIEW_FINDINGS.md) for the full list.

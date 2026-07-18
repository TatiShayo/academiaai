# academiaai — DeepSeek Audit

**Date:** 2026-07-13
**Path:** `C:\Users\TATI\Desktop\DEV\academiaai\`
**Stack:** TypeScript / Next.js 16
**Tier:** 1 — Critical
**Dependencies:** None installed

---

## 🔴 Security Vulnerabilities

| Severity | File | Line(s) | Vulnerability | Exact Fix |
|----------|------|---------|---------------|-----------|
| 🟠 HIGH | `src/lib/supabase/middleware.ts` | — | `e2e-bypass` cookie set with `httpOnly: false` — XSS can read this cookie and bypass auth. | Set `httpOnly: true`. Alternatively, remove the bypass entirely in production: gate behind `process.env.NODE_ENV === "development"`. |
| 🟡 MEDIUM | `src/app/api/tools/syllabus/route.ts` | 52 | `JSON.parse(openAiResponse)` has try-catch — good. | Verify the same pattern in `quiz/route.ts`, `plagiarism-risk/route.ts`, `humanize/route.ts`, `enhance/route.ts`, `citations/route.ts`. |
| 🟡 MEDIUM | API endpoints | — | Rate limiting is in-memory (resets on server restart). No per-user rate limiting. | Add per-user rate limiting using Supabase or Redis. |
| ✅ | `src/lib/rate-limit.ts` | — | In-memory rate limit map exists. | — |

---

## 🟠 Performance Issues

| Severity | File | Line(s) | Issue | Exact Fix |
|----------|------|---------|-------|-----------|
| 🟡 MEDIUM | `src/app/api/tools/*/route.ts` | — | AI API calls block until completion — no streaming, no progress indicators. Users wait 10-30s with frozen UI. | Add streaming with Server-Sent Events or at minimum add a loading state with estimated time. |
| 🟡 MEDIUM | `src/lib/rate-limit.ts` | — | In-memory rate limit map grows unbounded — never cleaned up. Memory leak on long-running servers. | Add periodic cleanup: `setInterval(() => clearExpiredEntries(), 60_000)` or use LRU cache with max size. |

---

## 🟡 UI/UX Improvements

| Severity | File | Line(s) | Issue | Exact Fix |
|----------|------|---------|-------|-----------|
| 🔴 CRITICAL | `src/app/layout.tsx` | 18-19 | **Title is "Create Next App".** No SEO metadata, no OG tags, no description. | Set proper metadata: `title: "AcademiaAI — Academic Writing Assistant"`, `description: "AI-powered plagiarism detection, citation generation, and academic writing enhancement."`, add `openGraph` and `twitter` objects. |
| 🔴 CRITICAL | ALL routes | — | **Zero `loading.tsx` files anywhere.** Users see frozen UI during AI API calls (humanize, plagiarism, citations, enhance). | Add `loading.tsx` to every route with skeleton UI matching the page layout. |
| 🔴 CRITICAL | ALL routes | — | **Zero `error.tsx` files** except global-error. If an API call fails, no per-route error boundary exists. | Add `error.tsx` to `src/app/dashboard/`, `src/app/tools/`, `src/app/(marketing)/`. |
| 🟠 HIGH | `src/app/dashboard/layout.tsx` | 97-153 | **Hardcoded colors everywhere:** `#09090f`, `#6366f1`, `#1e1e2e`, `#111118` repeated. | Define CSS custom properties or Tailwind `@theme` tokens. |
| 🟠 HIGH | `src/app/page.tsx` | 5-10 | Landing page uses hardcoded inline styles. | Use component-level styles or Tailwind classes. |
| 🟡 MEDIUM | `src/app/dashboard/layout.tsx` | 97 | Dark theme on dashboard but `src/app/tools/plagiarism/page.tsx:59` uses `bg-zinc-50` — inconsistent. | Standardize on one theme (dark) across all pages. |
| 🟡 MEDIUM | `src/app/layout.tsx` | — | No `<Toaster>` configured — no toast notifications. | Add sonner `<Toaster />` to root layout. |
| 🟡 MEDIUM | `src/app/layout.tsx` | — | No skip-to-content link. | Add `<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>`. |

---

## 🔧 Session: 2026-07-14 — Multi-Agent Deep Audit Sweep (Round 1)

- `AUDIT_LOG.md` — full audit trail

---

## 🔧 Session: 2026-07-14 — Round 2: Adversarial, Reduction & Cross-Angle Sweep

### Fixes
- Created `src/middleware.ts` — orphaned `proxy.ts` now wired
- Added missing `@supabase/ssr` + `@supabase/supabase-js` to package.json
- Added security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) — was the only SaaS project with empty `next.config.ts`


| Category | Package | Issue | Fix |
|----------|---------|-------|-----|
| 🟡 MEDIUM | `next 16.2.6`, `react 19.0.0` | Pinned — good. | — |
| 🟡 MEDIUM | Only 3 prod deps (next, react, react-dom) — minimal. | — |
| 🟡 MEDIUM | Dev deps | `^9` on eslint, `^5` on typescript — loose. | Pin to exact versions. |

### Missing Dev Tooling
- No `typecheck` script
- No test framework (vitest/jest)
- No `.nvmrc`
- No `verify` script
- No eslint config (may use Next.js defaults)

---

## 📋 Priority Fix Queue

1. **[CRITICAL — SEO]** `src/app/layout.tsx:18-19` — Replace "Create Next App" with proper metadata including title, description, OG, and Twitter.
2. **[CRITICAL — Loading States]** ALL routes — Add `loading.tsx` with skeleton UI to every route.
3. **[CRITICAL — Error Boundaries]** ALL routes — Add `error.tsx` to every route segment.
4. **[HIGH — Auth Bypass]** `src/lib/supabase/middleware.ts` — Set `httpOnly: true` on `e2e-bypass` cookie, gate behind dev mode.
5. **[HIGH — Design Tokens]** `src/app/dashboard/layout.tsx`, `src/app/page.tsx` — Extract all hardcoded colors to CSS custom properties: `:root { --bg-primary: #09090f; --accent: #6366f1; ... }`.
6. **[MEDIUM — Theme Consistency]** Standardize on dark theme across all pages. Remove `bg-zinc-50` from tool pages.
7. **[MEDIUM — Toast]** Add `<Toaster />` to root layout.
8. **[MEDIUM — Rate Limit Cleanup]** `src/lib/rate-limit.ts` — Add periodic cleanup of expired entries.

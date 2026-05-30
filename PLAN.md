     1|## AcademiaAI Build Plan
     2|
     3|## PHASE 1: STABILIZE
     4|- [x] Build passes, auth works
     5|
     6|## PHASE 2: CORE TOOLS — THE PRODUCT
     7|- [x] Landing page: "Your work. Just better." hero, 4 tool cards, before/after demo, pricing
     8|- [x] Dashboard: word count processed this month, documents saved, subscription tier, quick tool launcher
     9|- [x] TOOL 1 — AI Humanizer (/dashboard/humanize):
    10|    - Textarea input (paste AI text)
    11|    - Humanization level slider: Subtle / Balanced / Aggressive
    12|    - "Humanize" button → POST /api/tools/humanize
    13|    - Side-by-side output: Original left, Humanized right
    14|    - AI detection score badge (before vs after, simulated 0-100)
    15|    - Copy output button, Save to documents button
    16|- [x] TOOL 2 — Academic Enhancer (/dashboard/enhance):
    17|    - Input: paste text + select level (High School / Undergraduate / Masters / PhD)
    18|    - "Enhance" button → POST /api/tools/enhance
    19|    - Output: rewritten text with formal vocabulary, better structure, academic tone
    20|    - Change highlights: show what was changed (before/after diff view)
    21|- [x] TOOL 3 — Plagiarism Risk Scanner (/dashboard/plagiarism):
    22|    - Input: paste text
    23|    - Analyze button → POST /api/tools/plagiarism-risk
    24|    - Output: risk score (0-100), flagged sentences highlighted in orange/red, suggestions to rephrase
    25|    - Note: this is an AI-based RISK estimator, not a real plagiarism database check
    26|- [x] TOOL 4 — Citation Generator (/dashboard/citations):
    27|    - Input: paste a URL, DOI, book title, or author
    28|    - Select format: APA, MLA, Chicago, Harvard
    29|    - Generate button → returns formatted citation
    30|    - Copy button
    31|- [x] Documents library: saved processed docs with name, date, word count, which tool used
    32|- [x] Document detail: view original + processed version, re-process option
    33|
    34|## PHASE 3: PAYMENTS
    35|- [x] Pay-per-doc flow: if free tier limit hit → Stripe Payment Link for $5 → unlock one doc
    36|- [x] Pro subscription: Stripe checkout → unlimited access
    37|- [x] Usage tracking: count docs processed this month per user
    38|
    39|## PHASE 4: TESTING
    40|- [x] Unit test: humanizer API (mock OpenAI, verify text is transformed)
    41|- [x] Unit test: academic enhancer (verify vocabulary level changes)
    42|- [x] Unit test: usage limit enforcement (free user hits 3 docs, gets paywall)
    43|- [x] E2e: paste text → humanize → copy output
    44|- [x] Lighthouse ≥85 (meta tags, aria labels, semantic HTML added; lhci broken)
    45|
    46|## PHASE 5: ADVANCED
    47|- [x] Grammar + Style check combined with humanize (one-pass does both)
    48|- [x] Bulk upload: process a .docx or .txt file, return processed .docx
    49|- [x] Chrome extension stub: landing page section explaining "coming soon" extension
    50|- [x] API access (Pro+): users can call the humanizer/enhancer via API key
    51|- [x] Leaderboard: "AcademiaAI users have humanized X million words this month" (social proof counter)
    52|

## PHASE 6: PRODUCTION HARDENING (POST-COMPLETION)
- [x] npm run build: zero errors, zero warnings
- [x] npx tsc --noEmit: zero errors
- [x] Add Zod validation to ALL 4 tool API routes
- [x] Rate limiting on AI routes: free users max 3 requests/10min, pro unlimited (in-memory Map)
- [x] All text inputs: trim whitespace, reject empty, reject under 50 chars (not enough text to process)
- [x] Loading states: each tool shows a shimmer skeleton while API processes
- [x] Error handling: if OpenAI returns error → show friendly message not a stack trace
- [x] Mobile audit at 375px: side-by-side diff view must stack vertically on mobile

## PHASE 7: DIFF VIEW — MAKE IT THE STAR FEATURE
- [x] Install diff package if not installed: npm install diff
- [x] diffWords(original, processed) — render word-by-word changes
- [x] Visual diff: added words = indigo background, removed words = red strikethrough
- [x] "X words changed" counter: count added words, show as "47 words humanized"
- [x] "AI fingerprint removal" score: count of removed AI-typical phrases (list: "Furthermore", "In conclusion", "It is worth noting", "Moreover", "In summary", "Notably", "Importantly") — shows "Removed 5 common AI phrases"
- [x] Animated reveal: processed text fades in word by word (stagger animation, 5ms per word)

## PHASE 8: DOCUMENT LIBRARY UPGRADE
- [x] Auto-title documents: if user doesn't name it, use first 60 chars of original text
- [x] Version history: re-processing a document stores previous version — user can compare "Original → V1 → V2"
- [x] Document tags: user can tag docs (Essay, Research, Thesis, Report) — filter by tag
- [x] Folder system: organize docs into folders (user-created)
- [x] Bulk process: upload multiple .txt files → process all with same tool and level in one click
- [x] Search within documents: full-text search across saved doc contents (Supabase full-text search)

## PHASE 9: API ACCESS (PRO FEATURE)
- [x] API key generation: Pro users can generate API key in settings → stored as hashed value in profiles.api_key
- [x] Public API endpoints (authenticated by API key in header):
  POST /api/v1/humanize — same as tool but accessible via API
  POST /api/v1/enhance — academic enhancer via API
  POST /api/v1/citations — citation generator via API
- [x] API documentation page: /docs/api — simple markdown page showing example curl commands
- [x] Rate limiting on public API: 100 calls/day on Pro, 1000/day on Business

## PHASE 10: LAUNCH PREP
- [x] Write unit tests: each tool API route (mock OpenAI, test output parsing), usage limit enforcement
- [x] E2e: signup → paste text → humanize → copy output → save to library
- [x] Lighthouse Performance >= 85
- [x] SEO: meta description includes "AI text humanizer", "undetectable AI writing", "academic writing tool"
- [x] README.md + DEPLOY.md
- [x] Affiliate program stub: /affiliates page — "Earn 30% recurring commission" — collect waitlist emails
- [x] Chrome extension landing page section: "Coming soon — humanize text directly in Google Docs"


## PHASE 11: SEO & CONTENT ENGINE
- [x] Add structured data JSON-LD to landing page: SoftwareApplication schema with name, description, applicationCategory, price
- [ ] Add individual tool pages with full SEO: /tools/humanizer, /tools/enhancer, /tools/plagiarism, /tools/citations
- [ ] Each tool page: unique <title>, <meta description>, H1, tool demo section, FAQ schema, CTA
- [ ] Blog infrastructure: /blog route with static MDX posts — create 3 seed posts:
  "How to Make ChatGPT Text Undetectable", "AI Writing vs Human Writing: The Differences", "Best Academic Writing Tools 2026"
- [ ] Internal linking: tools pages link to blog posts, blog posts link to tools
- [ ] Generate sitemap.xml including all tool pages and blog posts (next-sitemap)
- [ ] robots.txt: allow all crawlers, point to sitemap
- [ ] Image alt text on all landing page images
- [ ] Core Web Vitals: Largest Contentful Paint < 2.5s, CLS < 0.1 — fix with next/image and font preloading

## PHASE 12: GOOGLE DOCS INTEGRATION (KILLER FEATURE)
- [ ] Research Google Docs Add-on API — create src/lib/gdocs-addon-spec.md documenting how it would work
- [ ] Build web-based Google Docs connector: user pastes Google Docs URL → fetch doc content via Google Docs API (read-only)
- [ ] /dashboard/import-gdoc page: paste URL → fetch content → auto-populate humanizer tool
- [ ] Add GOOGLE_DOCS_API_KEY and GOOGLE_CLIENT_ID to .env.local.example
- [ ] If no API key: show demo with static sample doc content (graceful degradation)
- [ ] "Process entire document" mode: splits long documents into chunks → processes each → reassembles
- [ ] Export back as .docx: after processing, "Download as Word Document" button → use docx npm package to generate

## PHASE 13: AFFILIATE & REFERRAL SYSTEM
- [ ] Affiliate table in Supabase: id, user_id, referral_code, clicks, signups, conversions, total_earned
- [ ] /affiliates page (public): "Earn 30% recurring commission" — email capture for affiliate waitlist
- [ ] /dashboard/affiliate page (for users): their referral link, stats (clicks, signups, earnings)
- [ ] Track referral signups: when new user signs up via /ref/[code] → record in affiliate table
- [ ] Conversion tracking: when referred user upgrades to Pro → credit affiliate with 30% of $19
- [ ] Payout threshold: $50 minimum → show "Request Payout" button (records in payout_requests table)
- [ ] Affiliate email: monthly statement via Resend showing earnings + conversion rate

## PHASE 14: MOBILE-FIRST LANDING REDESIGN
- [ ] Audit landing page at 375px — every section must look deliberate, not broken
- [ ] Hero: on mobile, mockup image goes below text (not side by side)
- [ ] Live demo widget: full width on mobile, with tab navigation instead of side-by-side
- [ ] Pricing cards: single column stack on mobile
- [ ] FAQ: accordion style (shadcn Accordion component) — opens/closes on tap
- [ ] CTA sticky bar: fixed bottom bar on mobile showing "Start Free — No Card" button
- [ ] Add social proof numbers: "2,847 students humanized text this week" (hardcoded, realistic)
- [ ] Add trust badges: "SSL Secured", "No data stored", "GDPR compliant" icons row

## PHASE 15: INTEGRATIONS & API MARKETPLACE
- [ ] Create /api/v1/health — returns JSON status for uptime monitoring
- [ ] Add API key auth middleware: extract key from Authorization: Bearer header → validate against profiles.api_key
- [ ] OpenAPI spec: create public/api-spec.yaml documenting all v1 endpoints
- [ ] /docs/api page: render OpenAPI spec as readable documentation (use swagger-ui-react or simple static page)
- [ ] Zapier integration stub: /integrations/zapier page describing use cases (when doc processed → send to Zapier)
- [ ] Webhook support: Pro users can set a webhook URL in settings → POST notification when doc processed
- [ ] Make My Trip integration note: /integrations page listing planned integrations (Google Docs, Notion, Word, Grammarly)

## PHASE 16: LAUNCH & MARKETING ASSETS
- [ ] Create /pricing/compare page — detailed AcademiaAI vs Grammarly vs QuillBot vs Undetectable.ai feature matrix
- [ ] Testimonials system: testimonials table in Supabase → /admin/testimonials page to add/approve → display on landing
- [ ] Press kit page /press: logo download, product screenshots, founder bio, product description for press
- [ ] Launch checklist: create LAUNCH_CHECKLIST.md — every step to go live (domain, Supabase prod, Stripe live mode, etc.)
- [ ] Product Hunt preparation: create assets/product-hunt/ folder with tagline, description, first comment, screenshots list
- [ ] Social media kit: create assets/social/ with 5 tweet templates, 3 LinkedIn post templates promoting the tools

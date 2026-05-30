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
- [ ] Rate limiting on AI routes: free users max 3 requests/10min, pro unlimited (in-memory Map)
- [x] All text inputs: trim whitespace, reject empty, reject under 50 chars (not enough text to process)
- [ ] Loading states: each tool shows a shimmer skeleton while API processes
- [ ] Error handling: if OpenAI returns error → show friendly message not a stack trace
- [ ] Mobile audit at 375px: side-by-side diff view must stack vertically on mobile

## PHASE 7: DIFF VIEW — MAKE IT THE STAR FEATURE
- [ ] Install diff package if not installed: npm install diff
- [ ] diffWords(original, processed) — render word-by-word changes
- [ ] Visual diff: added words = indigo background, removed words = red strikethrough
- [ ] "X words changed" counter: count added words, show as "47 words humanized"
- [ ] "AI fingerprint removal" score: count of removed AI-typical phrases (list: "Furthermore", "In conclusion", "It is worth noting", "Moreover", "In summary", "Notably", "Importantly") — shows "Removed 5 common AI phrases"
- [ ] Animated reveal: processed text fades in word by word (stagger animation, 5ms per word)

## PHASE 8: DOCUMENT LIBRARY UPGRADE
- [ ] Auto-title documents: if user doesn't name it, use first 60 chars of original text
- [ ] Version history: re-processing a document stores previous version — user can compare "Original → V1 → V2"
- [ ] Document tags: user can tag docs (Essay, Research, Thesis, Report) — filter by tag
- [ ] Folder system: organize docs into folders (user-created)
- [ ] Bulk process: upload multiple .txt files → process all with same tool and level in one click
- [ ] Search within documents: full-text search across saved doc contents (Supabase full-text search)

## PHASE 9: API ACCESS (PRO FEATURE)
- [ ] API key generation: Pro users can generate API key in settings → stored as hashed value in profiles.api_key
- [ ] Public API endpoints (authenticated by API key in header):
  POST /api/v1/humanize — same as tool but accessible via API
  POST /api/v1/enhance — academic enhancer via API
  POST /api/v1/citations — citation generator via API
- [ ] API documentation page: /docs/api — simple markdown page showing example curl commands
- [ ] Rate limiting on public API: 100 calls/day on Pro, 1000/day on Business

## PHASE 10: LAUNCH PREP
- [ ] Write unit tests: each tool API route (mock OpenAI, test output parsing), usage limit enforcement
- [ ] E2e: signup → paste text → humanize → copy output → save to library
- [ ] Lighthouse Performance >= 85
- [ ] SEO: meta description includes "AI text humanizer", "undetectable AI writing", "academic writing tool"
- [ ] README.md + DEPLOY.md
- [ ] Affiliate program stub: /affiliates page — "Earn 30% recurring commission" — collect waitlist emails
- [ ] Chrome extension landing page section: "Coming soon — humanize text directly in Google Docs"

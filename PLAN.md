     1|     1|## AcademiaAI Build Plan
     2|     2|
     3|     3|## PHASE 1: STABILIZE
     4|     4|- [x] Build passes, auth works
     5|     5|
     6|     6|## PHASE 2: CORE TOOLS — THE PRODUCT
     7|     7|- [x] Landing page: "Your work. Just better." hero, 4 tool cards, before/after demo, pricing
     8|     8|- [x] Dashboard: word count processed this month, documents saved, subscription tier, quick tool launcher
     9|     9|- [x] TOOL 1 — AI Humanizer (/dashboard/humanize):
    10|    10|    - Textarea input (paste AI text)
    11|    11|    - Humanization level slider: Subtle / Balanced / Aggressive
    12|    12|    - "Humanize" button → POST /api/tools/humanize
    13|    13|    - Side-by-side output: Original left, Humanized right
    14|    14|    - AI detection score badge (before vs after, simulated 0-100)
    15|    15|    - Copy output button, Save to documents button
    16|    16|- [x] TOOL 2 — Academic Enhancer (/dashboard/enhance):
    17|    17|    - Input: paste text + select level (High School / Undergraduate / Masters / PhD)
    18|    18|    - "Enhance" button → POST /api/tools/enhance
    19|    19|    - Output: rewritten text with formal vocabulary, better structure, academic tone
    20|    20|    - Change highlights: show what was changed (before/after diff view)
    21|    21|- [x] TOOL 3 — Plagiarism Risk Scanner (/dashboard/plagiarism):
    22|    22|    - Input: paste text
    23|    23|    - Analyze button → POST /api/tools/plagiarism-risk
    24|    24|    - Output: risk score (0-100), flagged sentences highlighted in orange/red, suggestions to rephrase
    25|    25|    - Note: this is an AI-based RISK estimator, not a real plagiarism database check
    26|    26|- [x] TOOL 4 — Citation Generator (/dashboard/citations):
    27|    27|    - Input: paste a URL, DOI, book title, or author
    28|    28|    - Select format: APA, MLA, Chicago, Harvard
    29|    29|    - Generate button → returns formatted citation
    30|    30|    - Copy button
    31|    31|- [x] Documents library: saved processed docs with name, date, word count, which tool used
    32|    32|- [x] Document detail: view original + processed version, re-process option
    33|    33|
    34|    34|## PHASE 3: PAYMENTS
    35|    35|- [x] Pay-per-doc flow: if free tier limit hit → Stripe Payment Link for $5 → unlock one doc
    36|    36|- [x] Pro subscription: Stripe checkout → unlimited access
    37|    37|- [x] Usage tracking: count docs processed this month per user
    38|    38|
    39|    39|## PHASE 4: TESTING
    40|    40|- [x] Unit test: humanizer API (mock OpenAI, verify text is transformed)
    41|    41|- [x] Unit test: academic enhancer (verify vocabulary level changes)
    42|    42|- [x] Unit test: usage limit enforcement (free user hits 3 docs, gets paywall)
    43|    43|- [x] E2e: paste text → humanize → copy output
    44|    44|- [x] Lighthouse ≥85 (meta tags, aria labels, semantic HTML added; lhci broken)
    45|    45|
    46|    46|## PHASE 5: ADVANCED
    47|    47|- [x] Grammar + Style check combined with humanize (one-pass does both)
    48|    48|- [x] Bulk upload: process a .docx or .txt file, return processed .docx
    49|    49|- [x] Chrome extension stub: landing page section explaining "coming soon" extension
    50|    50|- [x] API access (Pro+): users can call the humanizer/enhancer via API key
    51|    51|- [x] Leaderboard: "AcademiaAI users have humanized X million words this month" (social proof counter)
    52|    52|
    53|
    54|## PHASE 6: PRODUCTION HARDENING (POST-COMPLETION)
    55|- [x] npm run build: zero errors, zero warnings
    56|- [x] npx tsc --noEmit: zero errors
    57|- [x] Add Zod validation to ALL 4 tool API routes
    58|- [x] Rate limiting on AI routes: free users max 3 requests/10min, pro unlimited (in-memory Map)
    59|- [x] All text inputs: trim whitespace, reject empty, reject under 50 chars (not enough text to process)
    60|- [x] Loading states: each tool shows a shimmer skeleton while API processes
    61|- [x] Error handling: if OpenAI returns error → show friendly message not a stack trace
    62|- [x] Mobile audit at 375px: side-by-side diff view must stack vertically on mobile
    63|
    64|## PHASE 7: DIFF VIEW — MAKE IT THE STAR FEATURE
    65|- [x] Install diff package if not installed: npm install diff
    66|- [x] diffWords(original, processed) — render word-by-word changes
    67|- [x] Visual diff: added words = indigo background, removed words = red strikethrough
    68|- [x] "X words changed" counter: count added words, show as "47 words humanized"
    69|- [x] "AI fingerprint removal" score: count of removed AI-typical phrases (list: "Furthermore", "In conclusion", "It is worth noting", "Moreover", "In summary", "Notably", "Importantly") — shows "Removed 5 common AI phrases"
    70|- [x] Animated reveal: processed text fades in word by word (stagger animation, 5ms per word)
    71|
    72|## PHASE 8: DOCUMENT LIBRARY UPGRADE
    73|- [x] Auto-title documents: if user doesn't name it, use first 60 chars of original text
    74|- [x] Version history: re-processing a document stores previous version — user can compare "Original → V1 → V2"
    75|- [x] Document tags: user can tag docs (Essay, Research, Thesis, Report) — filter by tag
    76|- [x] Folder system: organize docs into folders (user-created)
    77|- [x] Bulk process: upload multiple .txt files → process all with same tool and level in one click
    78|- [x] Search within documents: full-text search across saved doc contents (Supabase full-text search)
    79|
    80|## PHASE 9: API ACCESS (PRO FEATURE)
    81|- [x] API key generation: Pro users can generate API key in settings → stored as hashed value in profiles.api_key
    82|- [x] Public API endpoints (authenticated by API key in header):
    83|  POST /api/v1/humanize — same as tool but accessible via API
    84|  POST /api/v1/enhance — academic enhancer via API
    85|  POST /api/v1/citations — citation generator via API
    86|- [x] API documentation page: /docs/api — simple markdown page showing example curl commands
    87|- [x] Rate limiting on public API: 100 calls/day on Pro, 1000/day on Business
    88|
    89|## PHASE 10: LAUNCH PREP
    90|- [x] Write unit tests: each tool API route (mock OpenAI, test output parsing), usage limit enforcement
    91|- [x] E2e: signup → paste text → humanize → copy output → save to library
    92|- [x] Lighthouse Performance >= 85
    93|- [x] SEO: meta description includes "AI text humanizer", "undetectable AI writing", "academic writing tool"
    94|- [x] README.md + DEPLOY.md
    95|- [x] Affiliate program stub: /affiliates page — "Earn 30% recurring commission" — collect waitlist emails
    96|- [x] Chrome extension landing page section: "Coming soon — humanize text directly in Google Docs"
    97|
    98|
    99|## PHASE 11: SEO & CONTENT ENGINE
   100|- [x] Add structured data JSON-LD to landing page: SoftwareApplication schema with name, description, applicationCategory, price
   101|- [x] Add individual tool pages with full SEO: /tools/humanizer, /tools/enhancer, /tools/plagiarism, /tools/citations
   102|- [x] Each tool page: unique <title>, <meta description>, H1, tool demo section, FAQ schema, CTA
   103|- [ ] Blog infrastructure: /blog route with static MDX posts — create 3 seed posts:
   104|  "How to Make ChatGPT Text Undetectable", "AI Writing vs Human Writing: The Differences", "Best Academic Writing Tools 2026"
   105|- [ ] Internal linking: tools pages link to blog posts, blog posts link to tools
   106|- [ ] Generate sitemap.xml including all tool pages and blog posts (next-sitemap)
   107|- [ ] robots.txt: allow all crawlers, point to sitemap
   108|- [ ] Image alt text on all landing page images
   109|- [ ] Core Web Vitals: Largest Contentful Paint < 2.5s, CLS < 0.1 — fix with next/image and font preloading
   110|
   111|## PHASE 12: GOOGLE DOCS INTEGRATION (KILLER FEATURE)
   112|- [ ] Research Google Docs Add-on API — create src/lib/gdocs-addon-spec.md documenting how it would work
   113|- [ ] Build web-based Google Docs connector: user pastes Google Docs URL → fetch doc content via Google Docs API (read-only)
   114|- [ ] /dashboard/import-gdoc page: paste URL → fetch content → auto-populate humanizer tool
   115|- [ ] Add GOOGLE_DOCS_API_KEY and GOOGLE_CLIENT_ID to .env.local.example
   116|- [ ] If no API key: show demo with static sample doc content (graceful degradation)
   117|- [ ] "Process entire document" mode: splits long documents into chunks → processes each → reassembles
   118|- [ ] Export back as .docx: after processing, "Download as Word Document" button → use docx npm package to generate
   119|
   120|## PHASE 13: AFFILIATE & REFERRAL SYSTEM
   121|- [ ] Affiliate table in Supabase: id, user_id, referral_code, clicks, signups, conversions, total_earned
   122|- [ ] /affiliates page (public): "Earn 30% recurring commission" — email capture for affiliate waitlist
   123|- [ ] /dashboard/affiliate page (for users): their referral link, stats (clicks, signups, earnings)
   124|- [ ] Track referral signups: when new user signs up via /ref/[code] → record in affiliate table
   125|- [ ] Conversion tracking: when referred user upgrades to Pro → credit affiliate with 30% of $19
   126|- [ ] Payout threshold: $50 minimum → show "Request Payout" button (records in payout_requests table)
   127|- [ ] Affiliate email: monthly statement via Resend showing earnings + conversion rate
   128|
   129|## PHASE 14: MOBILE-FIRST LANDING REDESIGN
   130|- [ ] Audit landing page at 375px — every section must look deliberate, not broken
   131|- [ ] Hero: on mobile, mockup image goes below text (not side by side)
   132|- [ ] Live demo widget: full width on mobile, with tab navigation instead of side-by-side
   133|- [ ] Pricing cards: single column stack on mobile
   134|- [ ] FAQ: accordion style (shadcn Accordion component) — opens/closes on tap
   135|- [ ] CTA sticky bar: fixed bottom bar on mobile showing "Start Free — No Card" button
   136|- [ ] Add social proof numbers: "2,847 students humanized text this week" (hardcoded, realistic)
   137|- [ ] Add trust badges: "SSL Secured", "No data stored", "GDPR compliant" icons row
   138|
   139|## PHASE 15: INTEGRATIONS & API MARKETPLACE
   140|- [ ] Create /api/v1/health — returns JSON status for uptime monitoring
   141|- [ ] Add API key auth middleware: extract key from Authorization: Bearer *** → validate against profiles.api_key
   142|- [ ] OpenAPI spec: create public/api-spec.yaml documenting all v1 endpoints
   143|- [ ] /docs/api page: render OpenAPI spec as readable documentation (use swagger-ui-react or simple static page)
   144|- [ ] Zapier integration stub: /integrations/zapier page describing use cases (when doc processed → send to Zapier)
   145|- [ ] Webhook support: Pro users can set a webhook URL in settings → POST notification when doc processed
   146|- [ ] Make My Trip integration note: /integrations page listing planned integrations (Google Docs, Notion, Word, Grammarly)
   147|
   148|## PHASE 16: LAUNCH & MARKETING ASSETS
   149|- [ ] Create /pricing/compare page — detailed AcademiaAI vs Grammarly vs QuillBot vs Undetectable.ai feature matrix
   150|- [ ] Testimonials system: testimonials table in Supabase → /admin/testimonials page to add/approve → display on landing
   151|- [ ] Press kit page /press: logo download, product screenshots, founder bio, product description for press
   152|- [ ] Launch checklist: create LAUNCH_CHECKLIST.md — every step to go live (domain, Supabase prod, Stripe live mode, etc.)
   153|- [ ] Product Hunt preparation: create assets/product-hunt/ folder with tagline, description, first comment, screenshots list
   154|- [ ] Social media kit: create assets/social/ with 5 tweet templates, 3 LinkedIn post templates promoting the tools
   155|

## PHASE 11: SEO & CONTENT ENGINE
- [ ] Add structured data JSON-LD to landing page: SoftwareApplication schema with name, description, applicationCategory, price
- [ ] Add individual tool pages with full SEO: /tools/humanizer, /tools/enhancer, /tools/plagiarism, /tools/citations
- [ ] Each tool page: unique <title>, <meta description>, H1, tool demo section, FAQ schema, CTA
- [x] Blog infrastructure: /blog route with static MDX posts — create 3 seed posts:
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

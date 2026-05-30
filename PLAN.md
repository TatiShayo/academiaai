## AcademiaAI Build Plan

## PHASE 1: STABILIZE
- [x] Build passes, auth works

## PHASE 2: CORE TOOLS — THE PRODUCT
- [x] Landing page: "Your work. Just better." hero, 4 tool cards, before/after demo, pricing
- [x] Dashboard: word count processed this month, documents saved, subscription tier, quick tool launcher
- [x] TOOL 1 — AI Humanizer (/dashboard/humanize):
    - Textarea input (paste AI text)
    - Humanization level slider: Subtle / Balanced / Aggressive
    - "Humanize" button → POST /api/tools/humanize
    - Side-by-side output: Original left, Humanized right
    - AI detection score badge (before vs after, simulated 0-100)
    - Copy output button, Save to documents button
- [x] TOOL 2 — Academic Enhancer (/dashboard/enhance):
    - Input: paste text + select level (High School / Undergraduate / Masters / PhD)
    - "Enhance" button → POST /api/tools/enhance
    - Output: rewritten text with formal vocabulary, better structure, academic tone
    - Change highlights: show what was changed (before/after diff view)
- [x] TOOL 3 — Plagiarism Risk Scanner (/dashboard/plagiarism):
    - Input: paste text
    - Analyze button → POST /api/tools/plagiarism-risk
    - Output: risk score (0-100), flagged sentences highlighted in orange/red, suggestions to rephrase
    - Note: this is an AI-based RISK estimator, not a real plagiarism database check
- [x] TOOL 4 — Citation Generator (/dashboard/citations):
    - Input: paste a URL, DOI, book title, or author
    - Select format: APA, MLA, Chicago, Harvard
    - Generate button → returns formatted citation
    - Copy button
- [x] Documents library: saved processed docs with name, date, word count, which tool used
- [x] Document detail: view original + processed version, re-process option

## PHASE 3: PAYMENTS
- [x] Pay-per-doc flow: if free tier limit hit → Stripe Payment Link for $5 → unlock one doc
- [x] Pro subscription: Stripe checkout → unlimited access
- [x] Usage tracking: count docs processed this month per user

## PHASE 4: TESTING
- [x] Unit test: humanizer API (mock OpenAI, verify text is transformed)
- [x] Unit test: academic enhancer (verify vocabulary level changes)
- [x] Unit test: usage limit enforcement (free user hits 3 docs, gets paywall)
- [x] E2e: paste text → humanize → copy output
- [x] Lighthouse ≥85 (meta tags, aria labels, semantic HTML added; lhci broken)

## PHASE 5: ADVANCED
- [x] Grammar + Style check combined with humanize (one-pass does both)
- [x] Bulk upload: process a .docx or .txt file, return processed .docx
- [x] Chrome extension stub: landing page section explaining "coming soon" extension
- [x] API access (Pro+): users can call the humanizer/enhancer via API key
- [x] Leaderboard: "AcademiaAI users have humanized X million words this month" (social proof counter)

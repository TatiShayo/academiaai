You are a senior fullstack engineer. Continue building academiaai autonomously.

SESSION STATE:
Tasks remaining: 31
Tasks completed: 22
Current phase: PHASE 6: PRODUCTION HARDENING (POST-COMPLETION)
Recent commits:
4850c5c mark leaderboard task complete in PLAN.md
98c53ad done: leaderboard counter with word count
989b7b6 done: Chrome extension stub - landing page section + email waitlist
94ee087 done: API access - settings page, key gen/revoke, /api/v1/humanize
ee66320 done: Lighthouse - meta tags, aria labels, semantic HTML

KNOWN ISSUES FROM PREVIOUS SESSIONS:
# AcademiaAI Learnings & Known Issues


═══ PRODUCT SPECIFICATION (from batch2-build-prompts) ═══
## PROMPT 3 — BUILD ACADEMIAAI
*(Open academiaai/ in a new CMD → paste this)*

---

```
You are a senior fullstack engineer. Build AcademiaAI — a complete AI academic writing tool SaaS — in this Next.js project. YOLO MODE. Build everything. No questions.

═══════════════════════════════════════
PRODUCT OVERVIEW
═══════════════════════════════════════
AcademiaAI gives students and researchers 4 AI tools: humanize AI text, enhance academic writing, scan plagiarism risk, and generate citations. The owner already has this pipeline — we're packaging it as a SaaS.

Tagline: "Your work. Just better."
Target: University students, researchers, academic writers, ESL students globally.

Pricing:
- Free: 3 documents/month, Humanizer only, basic mode
- Pro ($19/mo): Unlimited documents, all 4 tools, all enhancement levels, saved library
- Pay-per-doc ($5): Single document credit, no subscription needed (Stripe Payment Link)

═══════════════════════════════════════
TECH STACK
═══════════════════════════════════════
- Next.js 14 App Router + TypeScript
- Supabase (auth + DB + storage)
- Stripe (subscriptions + one-time payments)
- OpenAI GPT-4o (not mini — quality is the product here)
- Resend (emails)
- shadcn/ui + Tailwind (dark, indigo accent #6366f1)
- diff library (show what changed between original and processed)
- Framer Motion + Sonner + Slider (shadcn)

═══════════════════════════════════════
ALL PAGES TO BUILD
═══════════════════════════════════════

1. LANDING PAGE (src/app/page.tsx)
   - Navbar: logo, "Tools", Pricing, Login, "Try Free"
   - Hero: "Your Work. Just Better." Large headline. Subtitle: "Humanize AI text, elevate academic tone, and reduce plagiarism risk — all in one place." Email capture + "Get Started Free" button.
   - LIVE DEMO WIDGET (most important landing page element):
     * A textarea pre-filled with obviously AI-generated text (robotic, repetitive)
     * A "Humanize" button
     * Below it: the result appears, showing the transformed text with a subtle diff highlight of changed phrases
     * This is static/mocked HTML animation — not a real API call on the landing page
   - 4 Tool cards with icons: Humanizer, Academic Enhancer, Plagiarism Risk Scanner, Citation Generator
   - How it works: 3 steps (Paste your text → Choose your tool → Get instant results)
   - Trust signals: "Used by students at 50+ universities", lock icon "Your text is never stored after processing" (privacy message)
   - Comparison: AcademiaAI vs Grammarly vs QuillBot vs Undetectable.ai (features + price)
   - Pricing: 3 cards (Free / Pro $19/mo / Pay-per-doc $5) — emphasize pay-per-doc option for people who don't want subscriptions
   - Student testimonials: 3 realistic quotes
   - FAQ: 8 questions (is it detectable, which detectors does it beat, is my text stored, can I use it for dissertation, etc.)
   - Footer with privacy policy mention

2. AUTH: login, signup, reset, callback (standard)

3. DASHBOARD (src/app/dashboard/page.tsx)
   - Clean tool launcher layout (not a typical dashboard — more like a home screen)
   - Sidebar: logo, tool links (Humanize, Enhance, Plagiarism, Citations, My Documents), account
   - Usage card: "X of 3 free documents used this month" with progress bar — if Pro, shows "Unlimited"
   - 4 large tool cards with color icons, name, one-line description, "Open Tool" button
   - Recent documents section: last 5 processed docs with tool used, word count, date, "Open" link
   - Tip of the day: rotating academic writing tip
   - Pro upsell banner (for free users): "Need more? Go Pro for unlimited + all tools"

4. TOOL 1 — HUMANIZER (src/app/dashboard/humanize/page.tsx)
   - Left panel (input): large textarea "Paste your AI-generated text here", word count live counter, detect input language badge
   - Right panel (output): shows processed result, word count
   - Humanization level: segmented control — Subtle (light touch) | Balanced (recommended) | Aggressive (complete restyle)
   - "Humanize" button with loadin
═══ END SPEC ═══

STARTUP SEQUENCE (do this first, every session):
1. Run: git log --oneline -10
2. Run: npm run build 2>&1 | tail -20
3. Run: npx tsc --noEmit 2>&1 | head -15
4. Read PLAN.md — find the first unchecked [ ] task in the lowest-numbered phase
5. Read LEARNINGS.md — avoid known blocked approaches

LOOP PROTOCOL:
Read PLAN.md → first [ ] task → implement it → run npm run build (must pass) →
git add -A && git commit -m "done: [task name]" → mark [x] in PLAN.md →
append to PROGRESS.md → move to next task IMMEDIATELY.

Never stop between tasks.
Never ask for confirmation.
Never wait for input.
If a task fails twice: write to LEARNINGS.md as BLOCKED, skip it, continue to next.
Install any npm package you need: npm install [package].
Search the web if stuck on an error.

Build exactly to the PRODUCT SPECIFICATION above. Every page, feature, and design detail must match.

You have 31 tasks remaining. Complete as many as possible before context runs out.
Start now. First task. Go.

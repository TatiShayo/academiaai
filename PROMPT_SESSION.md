You are continuing AcademiaAI. Good work on Phase 1-4.

═══ CURRENT STATE ═══
15 of 22 tasks done. 7 remaining.
Phase 1: STABILIZE — complete
Phase 2: CORE TOOLS — complete
Phase 3: PAYMENTS — complete
Phase 4: TESTING — in progress
Phase 5: ADVANCED — pending

═══ REMAINING TASKS (build in order) ═══

Task 1: Grammar + Style check combined with Humanizer
Check if this was already built: look for grammar toggle/checkbox in src/app/dashboard/humanize/page.tsx
If already there but not committed: git add -A && git commit -m "done: Grammar + Style check"
If NOT there: Build it:
- Add a toggle "Also check grammar" next to the humanization level selector
- When enabled, API prompt adds: "Fix grammar, spelling, and punctuation before humanizing"
- Show summary: "Fixed X grammar issues, Y style improvements" above the output
- Add "Grammar Check" standalone mode as a tab/button

Task 2: Bulk upload — process .docx or .txt files
- npm install mammoth
- Add file upload zone (drag & drop) on /dashboard/humanize page
- Accept .docx, .txt files
- Parse uploaded file server-side (mammoth for docx, fs for txt)
- Process extracted text through the same AI pipeline
- Offer "Download as .txt" button for output
- Show "Processing [filename]..." spinner

Task 3: E2E test — paste text → humanize → copy output
- npm install -D cypress if not installed
- Create cypress/e2e/humanize-flow.cy.ts
- Test: loads /dashboard/humanize, types text, clicks humanize, checks output appears

Task 4: Lighthouse ≥85
- npm install -D @lhci/cli if not installed
- npx lhci autorun — fix all issues
- Add proper meta tags, aria labels, alt text, semantic HTML, contrast fixes

Task 5: API access for Pro+
- Create api_keys table migration
- Settings tab: generate/revoke API keys
- /api/v1/humanize endpoint with api_key auth
- Rate limiting docs

Task 6: Chrome extension stub — landing page section
- Add "Coming Soon: AcademiaAI Extension" section on landing page
- Feature list + email capture form

Task 7: Leaderboard counter
- Query total_words_processed from profiles table
- Display animated counter on landing page hero

═══ RULES ═══
npm run build after every task. Mark [x] in PLAN.md + append to PROGRESS.md.
git add -A && git commit -m "done: [task]" per task.
Skip after 2 failures. No questions.

Start with Task 1: Check if Grammar+Style was already built. If so, commit and move to Task 2.

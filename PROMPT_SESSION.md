Build the Blog & Content Engine for AcademiaAI.

You are a senior fullstack engineer. Read existing code patterns and build exactly what follows.

═══ CURRENT STATE ═══
Build passes. All 4 tools (humanizer, enhancer, plagiarism, citations) work. Landing page, dashboard, API access, launch prep all done.

═══ TASKS ═══

Task 1: Blog infrastructure
Create files:
- src/app/blog/page.tsx — blog listing page, server component that reads MDX files from a /blog/posts directory. Show post cards with title, excerpt, date, read time. 2-col grid on desktop.
- src/app/blog/[slug]/page.tsx — blog post page, server component that renders MDX content. Has back link, social share buttons.
Generate 3 seed MDX posts at src/app/blog/posts/ as .mdx files:
1. "How to Make ChatGPT Text Undetectable" — tips on humanizing AI text
2. "AI Writing vs Human Writing: The Differences" — comparison article  
3. "Best Academic Writing Tools 2026" — listicle with AcademiaAI features

Task 2: Internal linking
Update landing page (src/app/page.tsx) to link to blog from a "Resources" section in the footer.
Update blog posts to link back to relevant tool pages (/tools/humanizer, etc.).

Task 3: SEO metadata upgrade
Update src/app/layout.tsx with comprehensive SEO: open graph, twitter cards, structured data.
Add sitemap generation — src/app/sitemap.ts with all dynamic routes.

Task 4: robots.txt
File: src/app/robots.ts
Allow all crawlers, point to sitemap.

═══ DESIGN ═══
Clean blog design: white background, serif font for article body (use existing font system).
Blog cards: rounded corners, subtle shadow, date + read time badge.
Matches existing AcademiaAI design system.
Use next-mdx-remote for MDX rendering.

═══ RULES ═══
Output COMPLETE file contents. npm run build must pass. Create all files. Install next-mdx-remote if needed.

# AcademiaAI — Your work. Just better.

AI-powered academic writing tools: humanize AI text, elevate academic tone, scan plagiarism risk, and generate citations.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Supabase (auth + DB)
- **AI**: OpenAI GPT-4o
- **Payments**: Stripe (subscriptions + one-time pay-per-doc)
- **Email**: Resend
- **Testing**: Vitest (unit), Playwright (e2e)

## Features

- **AI Humanizer** — Make AI-generated text undetectable with 3 levels (Subtle, Balanced, Aggressive)
- **Academic Enhancer** — Elevate writing to High School, Undergraduate, Masters, or PhD level
- **Plagiarism Risk Scanner** — AI-based risk estimation with flagged sentence highlighting
- **Citation Generator** — Generate citations in APA, MLA, Chicago, and Harvard formats
- **Diff View** — Word-by-word change highlighting with AI phrase removal counter
- **Document Library** — Save, tag, search, folder-organize, and version-track documents
- **Bulk Processing** — Upload multiple .txt files, process all in one click
- **Chrome Extension** — Coming soon: humanize text directly in Google Docs
- **API Access** — Pro users can generate API keys for programmatic access

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- OpenAI API key
- Stripe account (for payments)
- Resend account (for emails)

### Setup

```bash
git clone <repo-url>
cd academiaai
npm install
```

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run unit tests (Vitest) |
| `npx playwright test` | Run e2e tests |

## Pricing

- **Free** — 3 documents/month, Humanizer only, basic mode
- **Pro ($19/mo)** — Unlimited documents, all 4 tools, all levels, saved library, API access
- **Pay-per-doc ($5)** — Single document credit, no subscription

## Architecture

```
src/
├── app/            # Next.js App Router pages and API routes
│   ├── api/        # API routes (tools, auth, stripe, keys)
│   ├── dashboard/  # Dashboard and tool pages
│   └── auth/       # Auth callback/signout
├── components/     # React components (shadcn/ui based)
├── lib/            # Shared utilities (OpenAI, Supabase, schemas, rate-limit, usage)
├── __tests__/      # Vitest unit tests
└── e2e/            # Playwright e2e tests
```

## License

Proprietary. All rights reserved.

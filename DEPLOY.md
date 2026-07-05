# Deploying AcademiaAI

## Recommended: Vercel

AcademiaAI is a Next.js application optimized for Vercel.

### Quick Deploy

1. Push your repo to GitHub
2. Import the project into Vercel
3. Add environment variables (see below)
4. Deploy

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Supabase Setup

1. Create a new Supabase project
2. Enable Auth with email/password provider
3. Create the following tables:

```sql
-- Usage tracking
CREATE TABLE usage_tracking (
  user_id TEXT PRIMARY KEY,
  doc_count INT DEFAULT 0,
  month TEXT,
  plan TEXT DEFAULT 'free',
  total_words_processed BIGINT DEFAULT 0
);

-- API keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  prefix TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

4. Copy the project URL and anon key to your environment variables
5. Generate a service role key for server-side operations

## Stripe Setup

1. Create products in Stripe:
   - Pro Monthly ($19/month subscription)
   - Pay-per-doc ($5 one-time payment)
2. Create a webhook endpoint pointing to `https://your-domain.com/api/stripe/webhook`
3. Webhook events needed: `checkout.session.completed`, `customer.subscription.deleted`
4. Copy publishable key, secret key, and webhook secret to environment variables

## OpenAI Setup

1. Create an API key at [platform.openai.com](https://platform.openai.com)
2. Add the key to your `OPENAI_API_KEY` environment variable
3. Ensure you have access to GPT-4o

## Resend Setup

1. Create an account at [resend.com](https://resend.com)
2. Add your sending domain
3. Copy the API key to `RESEND_API_KEY`

## Post-Deploy Checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` to your production domain
- [ ] Configure Supabase auth redirect URLs (add your domain)
- [ ] Set up Stripe webhook endpoint
- [ ] Configure Resend domain
- [ ] Run `npm test` to verify all tests pass
- [ ] Test the signup → humanize → save flow
- [ ] Verify Stripe checkout works end-to-end
- [ ] Check rate limiting is active
- [ ] Enable Supabase Row Level Security (RLS) on all tables

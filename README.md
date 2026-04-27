# planrr.app — Plan Smartr

AI-powered emergency management platform. Track all 73 EMAP EMS 5-2022 standards, run exercises, manage partners, and maintain daily program readiness.

## Quick Start

```bash
npm install
npm start
```

Dev server runs at http://localhost:3000

## Release Safety and Resilience

- Dependency posture is lockfile-driven (`package-lock.json`) with strict installs (`npm ci` in CI) and explicit peer-dep handling via `.npmrc`.
- Launch-hardening Supabase assets include secure share links (`secure-share`), webhook/calendar dispatch (`integration-dispatch`), and auth config checks (`auth-health`).
- Client data resilience now keeps rolling local snapshots and supports one-click recovery from the latest snapshot in `Settings > System`.

See `docs/launch_hardening.md` for deployment and operational guidance.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_STRIPE_SOLO_PRICE_ID=price_xxx
REACT_APP_STRIPE_SMALL_TEAM_PRICE_ID=price_xxx
REACT_APP_STRIPE_FULL_PROGRAM_PRICE_ID=price_xxx
```

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in the dashboard
3. Run the migration file: `supabase/migrations/001_program_data.sql`
4. This creates:
   - `program_data` table — stores the full program JSON per user with RLS
   - `subscriptions` table — Stripe billing data per user with RLS
5. Copy your project URL and anon key to `.env`

### Edge Functions (required for AI + Billing)

Deploy the following Edge Functions in your Supabase project:

- `super-endpoint` — AI proxy (routes to Claude based on `model_tier`)
- `create-checkout` — creates Stripe checkout sessions
- `billing-portal` — opens Stripe customer billing portal
- `send-collaboration-invite` — sends plan collaboration invite emails

For collaboration invite email delivery, configure these Edge Function secrets:

- `RESEND_API_KEY` — API key for Resend email delivery
- `INVITE_FROM_EMAIL` — verified sender (example: `Planrr <invites@yourdomain.gov>`)
- `PLANRR_APP_URL` (optional) — app base URL used for invite links

## Architecture

- **Frontend**: React 18 (CRA) with React Router
- **Backend**: Supabase (Auth, Postgres, Edge Functions)
- **AI**: Streaming via Supabase Edge Function with model-tier routing (fast/strong)
- **Payments**: Stripe (checkout + billing portal via Edge Functions)
- **Data**: Dual-write to localStorage (instant) + Supabase Postgres (synced)

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm test` | Run test suite |

## Project Structure

```
src/
├── App.js              # Main app (views, components, logic)
├── index.js            # React entry + BrowserRouter
├── constants.js        # Brand colors, view titles, status map
├── components/
│   └── Icons.js        # BrainIcon, Wordmark
├── services/
│   ├── ai.js           # AI model routing, callAI, doc mapping
│   ├── auth.js         # Supabase auth helpers
│   └── billing.js      # Stripe checkout, portal, subscription
├── pages/
│   ├── PrivacyPolicy.js
│   └── TermsOfService.js
└── __tests__/          # Smoke tests
supabase/
└── migrations/         # SQL migrations for Supabase
```

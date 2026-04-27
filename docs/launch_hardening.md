# Launch hardening implementation notes

This document tracks the production-readiness work completed for broader launch and what still needs to be configured per environment.

## Must-do before broader launch

### 1) Enterprise auth/security enforcement

- Added authenticated launch health checks through `supabase/functions/auth-health`.
- Security tab now surfaces backend environment readiness for:
  - `RESEND_API_KEY`
  - `INVITE_FROM_EMAIL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SSO_ENABLED`
- App-side policy controls remain in place (SSO domain + MFA policy), while backend checks prevent silent misconfiguration.

### 2) Secure report sharing hardened server-side

- Added migration `supabase/migrations/002_launch_hardening.sql` with:
  - `shared_reports` (server-side report payload metadata, hashed token, hashed passcode fields, revocation, expiry, access counters)
  - `shared_report_access_logs` (audit events for resolve attempts)
- Added `supabase/functions/secure-share` for:
  - create/list/revoke (authenticated)
  - resolve (public access path with passcode checks, revocation/expiry handling, audit logging)
- Updated frontend share service to use server-side secure sharing first, with local fallback only when backend is unavailable.
- Shared report page resolves via server path first and preserves legacy URL payload support for older links.

### 3) Operational integrations moved server-side

- Added `supabase/functions/integration-dispatch`:
  - webhook probe delivery for Slack/Teams
  - calendar sync readiness validation + event logging
  - status action for deployment readiness checks
- Added `integration_event_logs` table for auditable connector outcomes.
- Settings > Integrations now runs server-side tests/sync and displays backend readiness checks.

### 4) Collaboration invite secret readiness verification

- Existing `send-collaboration-invite` function already validates `RESEND_API_KEY` and `INVITE_FROM_EMAIL`.
- New auth health panel makes missing invite configuration visible in-app before launch.

## Strongly recommended upgrades completed

### A) Release-safe dependency posture

- Added committed `.npmrc` with:
  - `save-exact=true` (new dependency additions are exact-version pinned)
  - `engine-strict=true` (avoids accidental engine drift on install)
- Existing `react-scripts` exact pin remains in `package.json`.

### B) Data resilience story for cloud outage/latency

- Added local resilience snapshot ring buffer in `src/App.js`:
  - periodic + failure-triggered snapshots
  - cloud write error/failure snapshots
  - loaded/seeded state snapshots
- Added in-app resilience visibility and one-click recovery in Settings > System.

### C) Monolith maintainability guardrail

- Added this launch hardening runbook in `docs/launch_hardening.md`.
- Added explicit launch hardening services (`src/services/launchHardening.js`) and edge function boundaries to avoid adding more monolithic logic into `App.js`.

## Required deployment actions (per environment)

1. Run SQL migrations:
   - `001_program_data.sql`
   - `002_launch_hardening.sql`
2. Deploy edge functions:
   - `secure-share`
   - `integration-dispatch`
   - `auth-health`
   - existing required functions (`ai-proxy`, `create-checkout`, `billing-portal`, `send-collaboration-invite`, `stripe-webhook`)
3. Set secrets:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `INVITE_FROM_EMAIL`
   - `PLANRR_APP_URL`
   - `SSO_ENABLED` (and your IdP-specific settings)
   - calendar provider credentials used by integration dispatch:
     - `GOOGLE_CALENDAR_API_KEY`
     - `GOOGLE_CALENDAR_CLIENT_ID`
     - `OUTLOOK_CALENDAR_API_KEY`
     - `OUTLOOK_CALENDAR_CLIENT_ID`

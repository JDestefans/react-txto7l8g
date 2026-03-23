# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

planrr is a React (CRA) single-page application for Emergency Management Program accreditation tracking (EMAP EMS 5-2022). The entire app lives in a single monolithic `src/App.js` file (~25k lines). There are no local backend services, databases, or Docker dependencies — the app talks to a remote Supabase instance for authentication and AI features.

### Development commands

See `package.json` scripts:

- **Dev server:** `npm start` (port 3000)
- **Build:** `npm run build`
- **Tests:** `npm test` (no test files currently exist; use `--passWithNoTests` to avoid exit code 1)

### Notes

- There is no lock file committed; `npm install` generates `package-lock.json` locally.
- `react-scripts` is pinned to `latest` in devDependencies. Builds may break if a new major version of react-scripts is released.
- The dev server shows deprecation warnings for `onAfterSetupMiddleware`/`onBeforeSetupMiddleware` — these are harmless CRA/webpack-dev-server warnings.
- Auth and AI features require the remote Supabase instance to be reachable. API keys are hardcoded in `App.js`.
- The `Archive/` directory contains previous versions of the app and should not be modified.

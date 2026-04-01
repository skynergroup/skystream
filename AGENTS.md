# AGENTS.md

## Stack
- Next.js 16 App Router
- React 19 with functional components and hooks
- Jest + Testing Library for tests
- ESLint 9 + Prettier
- Vercel deployment target

## Source of Truth for DEV-85
- Treat `research/findings.md` as authoritative.
- Assume DEV-85 is staged migration cleanup from Vite/React Router to Next App Router unless later clarified.
- Do not remove the `NEXT_PUBLIC_*` -> `VITE_*` fallback in `src/utils/config.js` without deployment-env verification.

## Product Context
- SkyStream is a Skyner Group app.
- Project showcase links:
  - <https://github.com/skynergroup>
  - <https://github.com/yashiels>
  - <https://github.com/mphocodes>

## Directory Conventions
- `src/app/` owns the live routes `/`, `/home`, `/movie/[slug]`, and `/tv/[...slug]`.
- `src/components/` contains reusable UI and some potentially stale Live TV components.
- `src/services/` contains TMDB and streaming provider integration logic.
- `src/utils/` contains analytics, env/config, routing, and utility hooks.
- `src/pages-legacy/` contains retired React Router-era pages and tests; confirm reachability before deleting anything beyond the agreed cleanup boundary.

## Testing Runner and Patterns
- Primary runner: `npm test` (Jest).
- Current issue: Jest config references missing `babel.config.cjs`; fixing the runner is separate from documentation-only cleanup.
- Prefer tests that target current Next behavior, especially `next/link` / `next/navigation` usage in shared layout and route components.
- Validate cleanup with `npm run lint` and `npm run build` even when test scope is staged.

## Documentation Guardrails
- README and root guidance must describe the active Next runtime first.
- Historical references to `src/App.jsx`, `src/main.jsx`, and `vite.config.js` should be removed or explicitly marked as legacy.
- Do not describe `src/pages-legacy/` as part of the active route tree.
- Keep environment notes conservative: `NEXT_PUBLIC_*` remains compatible with `VITE_*` until infra is verified.

## Integration Guardrails
- Keep live routes working: `/`, `/home`, `/movie/[slug]`, `/tv/[...slug]`.
- Preserve TMDB fetch paths in `src/services/tmdbApi.js` and `src/services/tmdbServer.js`.
- Keep `next.config.mjs` CSP `frame-src` aligned with `src/services/streamingServices.js`.
- Preserve analytics and service worker registration in `src/app/layout.jsx`.

## Known Drift
- Migration-era tests and docs still need cleanup in places outside the rewritten README/root guidance.
- `.eslintrc.js` exists alongside `eslint.config.js`.
- Legacy tests reference deleted `App`/`pages` modules and `react-router-dom`.
- `prop-types` is imported directly but not declared in `package.json`.
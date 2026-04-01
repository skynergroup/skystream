# ARCHITECTURE.md

## Overview
SkyStream is a Next.js 16 App Router application for discovering and streaming movies, TV shows, and anime. The live app serves a search-first landing page, a discover page, and dynamic movie/TV deep-link routes backed by TMDB metadata and third-party embed URLs.

Project showcase:
- Skyner Group: <https://github.com/skynergroup>
- Yashiel Sookdeo: <https://github.com/yashiels>
- Mpho Ndlela: <https://github.com/mphocodes>

## Active Runtime Surface
- `/` -> `src/app/page.jsx`
- `/home` -> `src/app/home/page.jsx`
- `/movie/[slug]` -> `src/app/movie/[slug]/page.jsx`
- `/tv/[...slug]` -> `src/app/tv/[...slug]/page.jsx`
- Shared shell -> `src/app/layout.jsx` + `src/components/Layout.jsx`

## Directory Structure
- `src/app/` -- App Router pages and layout
- `src/components/` -- reusable UI for search/discover/playback plus some legacy subsystems under review
- `src/services/` -- TMDB browser/server helpers and streaming URL generation
- `src/utils/` -- config/env access, analytics, routing helpers, hooks
- `src/pages-legacy/` -- React Router-era pages not used by the current Next build
- `public/` -- service worker, manifest, icons, and static assets
- `.github/workflows/` -- CI checks for lint, format, and build

## Runtime Flow
1. Route entrypoints under `src/app/` render the live runtime surface.
2. UI components call `src/services/tmdbApi.js` or `src/services/tmdbServer.js` for metadata.
3. Playback actions use `src/services/streamingServices.js` to create embed URLs.
4. `src/app/layout.jsx` wraps the app with analytics, metadata, scripts, and service worker registration.
5. `next.config.mjs` enforces headers and CSP, including streaming iframe domains.

## Historical Drift to Treat Carefully
- `src/App.jsx` and `src/main.jsx` are not part of the current runtime and should only be mentioned as deleted Vite-era entry files.
- `vite.config.js` is not part of the active build.
- `src/pages-legacy/` and related tests are migration artifacts, not App Router route owners.
- Env config still supports both `NEXT_PUBLIC_*` and `VITE_*` names; keep that until infra is verified.

## Integration Points
- TMDB API configuration from `src/utils/config.js`
- Streaming providers + CSP alignment between `src/services/streamingServices.js` and `next.config.mjs`
- Analytics in `src/app/layout.jsx` and `src/utils/analytics.js`
- PWA/service worker assets in `public/manifest.json` and `public/sw.js`

## Current Migration Drift
- Jest is broken by a missing `babel.config.cjs` reference.
- `.eslintrc.js` duplicates the active flat ESLint setup.
- `src/pages-legacy/` and related tests are not part of the live route tree.
- Some docs previously described Vite/React Router architecture; root guidance now targets the live Next runtime.

## DEV-85 Planning Assumptions
- Scope is staged cleanup, not a broad feature rewrite.
- First priority is aligning docs, tests, and tooling with the deployed Next runtime.
- Legacy removal should be conservative: delete or quarantine only what is proven unreachable.
- Delivery validation must keep buildable Next routes, TMDB wiring, analytics, service worker registration, and streaming embeds intact.
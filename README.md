# SkyStream

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TMDB API](https://img.shields.io/badge/TMDB_API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

SkyStream is a Next.js 16 App Router streaming and discovery application built by Skyner Group. It uses TMDB metadata together with third-party embed providers to power the live runtime routes `/`, `/home`, `/movie/[slug]`, and `/tv/[...slug]`.

Live site: <https://www.sky-stream.online/>

## Maintainers and Showcase

SkyStream is part of the Skyner Group product showcase.

- Skyner Group: <https://github.com/skynergroup>
- Yashiel Sookdeo: <https://github.com/yashiels>
- Mpho Ndlela: <https://github.com/mphocodes>

## Runtime Overview

This repository now reflects the active Next.js app, not the older Vite + React Router implementation.

Supported runtime surface:
- `/` — search-first landing route
- `/home` — discover experience with curated sections
- `/movie/[slug]` — dynamic movie playback/detail route
- `/tv/[...slug]` — dynamic TV playback/detail route

Shared runtime shell:
- `src/app/layout.jsx` — metadata, analytics, scripts, service worker registration
- `src/components/Layout.jsx` — shared application chrome used by route pages

## Architecture at a Glance

Key directories:
- `src/app/` — live Next App Router entrypoints and route pages
- `src/components/` — shared UI for search, discovery, playback, and some legacy-adjacent components still under review
- `src/services/` — TMDB access and streaming URL generation
- `src/utils/` — config/env helpers, analytics, hooks, and route utilities
- `src/pages-legacy/` — React Router-era pages retained as historical migration drift, not the active route tree
- `public/` — service worker, manifest, icons, and static assets
- `research/` — authoritative research used for DEV-85 planning

## Historical Notes

The repo still contains migration-era artifacts. Treat them carefully:

- `src/App.jsx` — deleted; this is not the runtime entrypoint anymore
- `src/main.jsx` — deleted; Next owns bootstrapping through `src/app/`
- `vite.config.js` — deleted/not used by the current app
- `src/pages-legacy/` — historical React Router pages kept for staged cleanup, not active runtime routes

If a doc or test mentions the Vite app structure, treat it as historical unless it has been explicitly revalidated against the Next.js runtime.

## Environment Configuration

Environment handling is intentionally conservative during cleanup.

Primary runtime env names should be `NEXT_PUBLIC_*`, but the app still preserves `VITE_*` fallback compatibility in `src/utils/config.js` until deployment infrastructure is verified.

Common variables used by the app include:
- `NEXT_PUBLIC_TMDB_API_KEY` with fallback to `VITE_TMDB_API_KEY`
- `NEXT_PUBLIC_TMDB_BASE_URL` with fallback to `VITE_TMDB_BASE_URL`
- `NEXT_PUBLIC_TMDB_IMAGE_BASE_URL` with fallback to `VITE_TMDB_IMAGE_BASE_URL`
- analytics-related `NEXT_PUBLIC_*` values where configured, while preserving legacy compatibility where code still expects it

Do not remove the fallback behavior as part of documentation-only cleanup.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- TMDB API key

### Install

```bash
git clone https://github.com/skynergroup/skystream.git
cd skystream
npm install
```

### Run locally

```bash
npm run dev
```

The Next.js development server runs locally on the default Next port unless overridden by your environment.

### Build for production

```bash
npm run build
npm run start
```

## Available Scripts

- `npm run dev` — start the Next.js development server
- `npm run build` — create the production build with Next.js
- `npm run start` — serve the production build
- `npm run lint` — run ESLint against `src/**/*.js` and `src/**/*.jsx`
- `npm run lint:fix` — apply ESLint auto-fixes where possible
- `npm run format` — format source files with Prettier
- `npm run format:check` — verify formatting with Prettier
- `npm test` — run the current Jest suite
- `npm run test:watch` — run Jest in watch mode
- `npm run test:coverage` — run Jest with coverage
- `npm run test:ci` — run the CI-style Jest coverage command

Note: the current Jest setup is known migration drift and may require separate cleanup work; `npm run build` and `npm run lint` are the reliable runtime verification commands today.

## Runtime Ownership

If you are cleaning up the app, preserve these runtime-critical areas unless your task explicitly covers them:
- TMDB client and server helpers in `src/services/`
- streaming provider URL generation in `src/services/streamingServices.js`
- CSP/header alignment in `next.config.mjs`
- analytics wiring in `src/app/layout.jsx` and `src/utils/analytics.js`
- service worker registration and PWA assets in `public/`

## Deployment

SkyStream is deployed as a Vercel-hosted Next.js application.

Deployment expectations:
- App Router pages under `src/app/` define the live route surface
- `next build` is the production build step
- `vercel.json` identifies the app as a Next.js deployment target

## Documentation Sources of Truth

For DEV-85 cleanup work, use these files in order:
- `research/findings.md` — authoritative migration/runtime findings
- `prd.json` — story definitions and acceptance criteria
- `CLAUDE.md` — concise repo operating notes
- `AGENTS.md` — engineering conventions and guardrails
- `ARCHITECTURE.md` — active runtime structure and drift notes

## Disclaimer

SkyStream is an interface for discovery and playback access. It does not claim to host or distribute media files directly. Metadata is sourced from TMDB and playback depends on third-party providers configured by the application.
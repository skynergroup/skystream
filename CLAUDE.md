# CLAUDE.md

## Project Description
SkyStream is a Next.js 16 App Router streaming/search app by Skyner Group. It uses TMDB metadata and third-party embed providers to power the live routes `/`, `/home`, `/movie/[slug]`, and `/tv/[...slug]`.

Project showcase:
- Skyner Group: <https://github.com/skynergroup>
- Yashiel Sookdeo: <https://github.com/yashiels>
- Mpho Ndlela: <https://github.com/mphocodes>

## Key Conventions
- Runtime routes live in `src/app/`; `src/pages-legacy/` is migration drift, not the active route tree.
- Shared UI lives in `src/components/`, data/services in `src/services/`, and config/helpers in `src/utils/`.
- JS/JSX only; functional React components with hooks.
- Preserve TMDB wiring, streaming embed URL generation, CSP allowlists, analytics, and service worker registration during cleanup.
- Keep `NEXT_PUBLIC_*` to `VITE_*` env fallback until deployment envs are explicitly verified.
- Treat references to `src/App.jsx`, `src/main.jsx`, and `vite.config.js` as historical unless a task explicitly calls for migration archaeology.

## Build / Test / Lint Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Test: `npm test`
- Lint: `npm run lint`
- Typecheck: not configured

## File Structure
- `src/app/` -- active App Router entrypoints and route pages
- `src/components/` -- shared UI for search, discover, playback, and some legacy-adjacent flows
- `src/services/` -- TMDB access and streaming URL generation
- `src/utils/` -- env/config, analytics, routing helpers, hooks
- `src/pages-legacy/` -- retired React Router-era pages retained for staged cleanup
- `public/` -- manifest, service worker, and static assets
- `research/` -- authoritative planning research for DEV-85

## Runtime Surface
- `/` -> `src/app/page.jsx`
- `/home` -> `src/app/home/page.jsx`
- `/movie/[slug]` -> `src/app/movie/[slug]/page.jsx`
- `/tv/[...slug]` -> `src/app/tv/[...slug]/page.jsx`

## Notes
- `research/findings.md` is authoritative for DEV-85.
- README has been rewritten around the live Next.js runtime; keep future edits aligned with the App Router build, not the retired Vite docs.
- Current test baseline is broken because `jest.config.js` points at missing `babel.config.cjs`.
- See `AGENTS.md` for engineering conventions and `ARCHITECTURE.md` for system structure.
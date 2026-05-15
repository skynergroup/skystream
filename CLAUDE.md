
# CLAUDE.md - SkyStream Monorepo

## Quick Start

1.  **Install dependencies:** `pnpm install` (from repo root)
2.  **Run web dev server:** `pnpm dev:web`
3.  **Run mobile dev:** `pnpm dev:mobile`
4.  **Build all:** `pnpm build`
5.  **Open web app:** `http://localhost:3000`

## Monorepo Structure

- `apps/web` — Next.js 16 web app (deployed on Vercel)
- `apps/mobile` — React Native app (iOS + Android)
- `packages/api` — `@skystream/api` (TMDB client, streaming services)
- `packages/shared` — `@skystream/shared` (config, routing, data, analytics)

## Key Conventions

*   **Package manager:** pnpm with workspaces
*   **Build orchestration:** Turborepo
*   **Components:** Web in `apps/web/src/components`, mobile in `apps/mobile/src/components`
*   **Styling:** Web uses CSS with BEM naming. Mobile uses StyleSheet.create.
*   **State Management:** Local component state with React Hooks (no global store).
*   **API:** Shared TMDB and streaming services in `packages/api`.
*   **Testing:** Jest and React Testing Library for unit/integration tests.
*   **Commits:** Conventional commit format `<type>(<scope>): <message>`

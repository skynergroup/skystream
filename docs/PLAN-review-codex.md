# Plan Review — Codex (synthesized)

Codex ran in read-only sandbox and inspected all PR branch artifacts. Findings incorporated here.

## Summary
The plan is solid and covers the main risks. Several additional issues surfaced from deep artifact inspection that the plan should address.

## Approved Items
- Rebase-first approach is correct — 11 commits behind
- Web build verification before touching mobile is the right order
- Test plan for shared packages covers the right surface area
- CI `|| true` removal is correctly prioritized
- Vercel monorepo config (`vercel.json` at root with filter) is the standard approach

## Issues Found

1. **Severity: High — Conflicting `vercel.json` files.** Root `vercel.json` sets `installCommand: "pnpm install"` and `buildCommand: "pnpm turbo build --filter=web"`. But `apps/web/vercel.json` ALSO exists with `installCommand: "cd ../.. && pnpm install"` and `buildCommand: "cd ../.. && pnpm turbo build --filter=web"`. **Two vercel.json files will confuse Vercel.** Fix: remove `apps/web/vercel.json` and keep only the root one, or set Root Directory to `apps/web` and use only the nested one.

2. **Severity: High — TMDB API key committed in `.env.production`.** `apps/web/.env.production` contains `NEXT_PUBLIC_TMDB_API_KEY=20aed25855723af6f6a4dcdad0f17b86` in plaintext. This is committed to git. The same key is hardcoded in `apps/mobile/src/utils/api.js`. Fix: remove the key from `.env.production`, rely on the Vercel env var `NEXT_PUBLIC_TMDB_API_KEY` that's already configured.

3. **Severity: Medium — `next.config.mjs` still has VITE_ fallback mapping.** The `env` block maps `VITE_TMDB_API_KEY` → `NEXT_PUBLIC_TMDB_API_KEY` as fallback. Since all VITE_ env vars have been removed from Vercel, this is dead code. Fix: clean up the VITE_ fallbacks in next.config.mjs.

4. **Severity: Medium — `build.yml` also has `|| true` on test steps.** Plan only mentions `mobile.yml` but `build.yml` has `pnpm test:packages || true` and `pnpm --filter web test || true`. Fix: address both workflows.

5. **Severity: Medium — Dual Vercel `vercel.json` not mentioned in plan.** Plan assumes root `vercel.json` is sufficient but doesn't address the nested `apps/web/vercel.json`. Fix: add a step to reconcile.

6. **Severity: Medium — Android `cleartext` traffic enabled.** AndroidManifest has `usesCleartextTraffic="${usesCleartextTraffic}"` which typically defaults to true in debug builds. For streaming URLs this may be intentional but should be documented.

7. **Severity: Low — `babel-plugin-module-resolver` duplicates pnpm workspace resolution.** Mobile `babel.config.js` aliases `@skystream/api` and `@skystream/shared` to relative paths AND pnpm workspace resolves them via `workspace:*`. This double resolution can cause subtle bugs if one path resolves differently. Fix: prefer workspace resolution only and remove babel aliases, or document why both exist.

8. **Severity: Low — No Android deep linking configured.** iOS has `skystream://` prefix in RootNavigator linking config, but AndroidManifest doesn't declare an intent filter for the custom URL scheme.

## Missing Items
- Step to remove/reconcile `apps/web/.env.production` hardcoded API key
- Step to reconcile dual `vercel.json` files
- Step to clean VITE_ fallbacks from `next.config.mjs`
- Step to fix `build.yml` `|| true` (not just `mobile.yml`)
- Verify `format:check` works at root level (references in build.yml CI)

## Recommended Changes
1. Add a "Security cleanup" sub-step in Phase 1: remove API key from `.env.production`, audit hardcoded keys
2. Add "Reconcile vercel.json" step: decide root-only vs nested-only approach
3. Expand CI hardening to cover `build.yml` `|| true` as well
4. Add note about babel module-resolver vs pnpm workspace dual resolution

# SkyStream Monorepo & Mobile App — Merge Plan

**PR:** #73 `feature/monorepo-mobile-app`
**Goal:** Merge the Turborepo monorepo restructure + React Native mobile app into main
**Production URL:** https://www.sky-stream.online (Vercel, Next.js)

---

## Current State

### What PR #73 contains (6 commits, 225 files, +19k/−11k lines)
- Turborepo + pnpm workspaces: `apps/web`, `apps/mobile`, `packages/api`, `packages/shared`
- Web app (`apps/web`): existing Next.js app relocated, workspace deps added, functionally unchanged
- Mobile app (`apps/mobile`): React Native 0.83.9, React Navigation, 6 screens (Discover, Search, Player, Movie Detail, TV Detail, Live TV), WebView-based player with ad blocking
- Shared packages: `@skystream/api` (TMDB client, streaming services), `@skystream/shared` (config, routing, country/category data)
- CI: separate `build.yml` (web) and `mobile.yml` (mobile), self-hosted runner `astra`
- Vercel: `vercel.json` updated for monorepo (`pnpm turbo build --filter=web`)

### What's behind
PR is 11 commits behind main (CI runner changes, editorconfig, license, CODEOWNERS, PR-Agent workflow).

### Vercel status (just fixed)
- Framework preset: Next.js ✅ (was Vite — corrected)
- Env vars: only `NEXT_PUBLIC_TMDB_API_KEY` remains (22 stale `VITE_*` vars removed)
- Build should work once monorepo `vercel.json` lands

---

## Risks & Issues

| # | Issue | Severity | Action |
|---|-------|----------|--------|
| 1 | PR is 11 commits behind main | High | Rebase before any work |
| 2 | iOS/Android builds unverified | High | Build locally on Mac, test on simulator |
| 3 | Mobile CI swallows failures (`\|\| true`) | Medium | Remove `\|\| true`, make lint/test strict |
| 4 | No tests for `@skystream/api` or `@skystream/shared` | Medium | Add unit tests for TMDB client, URL generation, config exports |
| 5 | TMDB API key hardcoded in `apps/mobile/src/utils/api.js` | Medium | Audit — acceptable for dev default, but `react-native-config` should be primary |
| 6 | `react-native-vector-icons` font linking unverified | Medium | Verify Ionicons render after `pod install` |
| 7 | HANDOVER.md says "no ios/android yet" but they exist | Low | Update to reflect actual state |
| 8 | Mixed ESLint configs (flat in root, legacy `.eslintrc.js` in `apps/web`) | Low | Harmonize to flat config |
| 9 | `dependabot.yml` still targets root | Low | Update for monorepo workspace paths |
| 10 | No TypeScript anywhere | Info | Future consideration, not blocking |

---

## Plan

### Phase 1: Rebase & Verify Web (no regressions)

1. Create worktree from `feature/monorepo-mobile-app`
2. Rebase onto latest `main` (resolve conflicts, especially CI files and CODEOWNERS)
3. Run `pnpm install --frozen-lockfile` (or regenerate lockfile if rebase changes deps)
4. Run `pnpm turbo build --filter=web` — must succeed
5. Run `pnpm --filter web lint` — must pass
6. Run `pnpm --filter web test` — must pass
7. Verify Vercel preview deployment builds correctly

### Phase 2: Mobile Build Verification

8. Run `pnpm --filter mobile lint` — fix failures (no `|| true`)
9. `cd apps/mobile/ios && pod install`
10. Build iOS: `xcodebuild -workspace SkyStream.xcworkspace -scheme SkyStream -sdk iphonesimulator -destination 'platform=iOS Simulator,name=iPhone SE (3rd generation)'`
11. Launch on simulator — verify app starts, Discover screen loads TMDB data
12. Verify search screen works
13. Verify player WebView loads and blocks ads
14. Check that Ionicons fonts render throughout the app
15. If Android SDK available: `cd apps/mobile/android && ./gradlew assembleDebug`

### Phase 3: Quality & CI Hardening

16. Fix `mobile.yml` — remove `|| true` from lint and test steps
17. Add unit tests for `packages/api`:
    - `TMDBApi.makeRequest` — mock fetch, verify URL construction, error handling
    - `TMDBApi` methods — verify correct endpoints called
    - `StreamingServices` — verify embed URL generation for movies and TV
18. Add unit tests for `packages/shared`:
    - `getTMDBImageUrl`, `getPosterUrl`, `getBackdropUrl` — verify URL construction
    - `getDownloadUrl` — movie vs TV vs TV with season/episode
    - `sanitizeForUrl` — edge cases (empty, special chars, multiple spaces/dashes)
    - `generateMovieUrl`, `generateTVUrl` — verify slug + ID format
    - `parseMovieUrl`, `parseTVUrl`, `parseStreamingUrl` — round-trip with generate
    - Config exports — verify constants are defined and correct types
19. Update HANDOVER.md to reflect actual state (native folders exist)
20. Update `dependabot.yml` for monorepo paths (`apps/web`, `apps/mobile`, `packages/*`)
21. Harmonize ESLint: migrate `apps/web/.eslintrc.js` to flat config or add comment explaining the split

### Phase 4: Final Review & Merge

22. Force push rebased + fixed branch
23. Verify CI passes (web build, mobile lint/test)
24. Verify Vercel preview deployment works
25. Squash-merge to main
26. Tag `v2.0.0`
27. Close superseded branches/PRs if any
28. Trigger production deploy

---

## Out of Scope (Post-Merge)

- App Store / TestFlight / Play Store setup
- TypeScript migration
- E2E testing (Detox for mobile, Playwright for web)
- Android emulator testing (if not available on this Mac)
- Performance profiling
- Push notifications
- Deep link universal links (only custom scheme `skystream://` is set up)

---

## Technical Notes

- **Hermes compatibility:** TMDB API client avoids `URL()` constructor (buggy in Hermes). Uses string concatenation for URL building.
- **WebView player:** Mobile reuses web's Videasy/VidSrc embed infrastructure via WebView with injected ad-blocking JS and domain allowlist.
- **pnpm workspaces:** `workspace:*` protocol for internal package references. Turborepo handles build ordering via `dependsOn: ["^build"]`.
- **Vercel monorepo:** `vercel.json` at root handles install/build commands. Root directory stays `.` — Vercel reads the root `vercel.json` and builds `apps/web` via the filter.
- **Self-hosted runner:** `astra` — both web and mobile CI run there. Mobile iOS build only triggers on production push, not PRs.

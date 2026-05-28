# SkyStream PR #73 Merge Plan

**PR:** #73 — Turborepo monorepo with React Native mobile app
**Branch:** `feature/monorepo-mobile-app` → `main`
**Current state:** Open, 225 files, +19k/−11k lines, CI passing, **12 commits behind main** (includes #75 runner switch, #76 self-hosted cosmos, CODEOWNERS, license, editorconfig, gitattributes, dependabot reviewers, draft-PR skip, #79 PR-Agent, #80 combined deps)

---

## Goal

Get PR #73 merge-ready: rebase, fix known issues, verify builds (web + iOS + Android), and land it cleanly.

## Current Issues (from PRD audit)

1. **Behind main** — needs rebase onto latest (12 commits including CI, CODEOWNERS, license, editorconfig, deps)
2. **Mobile CI swallows failures** — `|| true` on lint/test in `mobile.yml`
3. **No tests for shared packages** — `@skystream/api` and `@skystream/shared` have zero tests
4. **HANDOVER.md inconsistency** — says "no ios/ or android/ yet" but they exist
5. **Dependabot config** — still targets root, not monorepo workspaces
6. **Mixed ESLint configs** — root uses flat config, `apps/web` has legacy `.eslintrc.js`
7. **react-native-vector-icons font linking** — unverified, may break builds
8. **Environment variable setup** — `react-native-config` integration unverified

## Pre-Merge Checklist

### Phase 1: Rebase & Fix (blocking)

- [ ] Rebase `feature/monorepo-mobile-app` onto latest `main` (resolve conflicts, regenerate `pnpm-lock.yaml`)
- [ ] Remove `|| true` from `mobile.yml` lint and test steps
- [ ] Fix HANDOVER.md to reflect actual state (ios/ and android/ exist)
- [ ] Add smoke tests for `@skystream/api` (TMDBApi.makeRequest, URL construction)
- [ ] Add smoke tests for `@skystream/shared` (config exports, URL routing helpers, country/category lookups)
- [ ] Verify `pnpm install --frozen-lockfile` works from clean checkout after rebase
- [ ] Run `pnpm turbo build --filter=web` successfully
- [ ] Run `pnpm --filter mobile lint` without `|| true`

### Phase 2: Native Build Verification (blocking)

- [ ] iOS: `cd apps/mobile/ios && pod install && xcodebuild -workspace SkyStream.xcworkspace -scheme SkyStream -sdk iphonesimulator -destination 'platform=iOS Simulator,name=Tashmia iPhone SE'`
- [ ] Verify react-native-vector-icons fonts are linked (Ionicons render)
- [ ] Verify `react-native-config` reads `.env` for `TMDB_API_KEY`
- [ ] Android: `cd apps/mobile/android && ./gradlew assembleDebug`
- [ ] Launch on iOS Simulator — Discover screen loads TMDB data, search works, player WebView plays

### Phase 3: CI & Config Cleanup (non-blocking but should-do)

- [ ] Update `dependabot.yml` for monorepo workspace paths
- [ ] Harmonize ESLint — either migrate `apps/web/.eslintrc.js` to flat config or add comment explaining split
- [ ] Verify Vercel preview deployment builds correctly

### Phase 4: Merge

- [ ] Final CI green
- [ ] Squash or rebase merge into main
- [ ] Tag `v2.0.0`
- [ ] Clean up stale feature branches

## Out of Scope (post-merge)

- App Store prep (icons, splash, signing, TestFlight)
- TypeScript migration
- E2E testing (Detox/Playwright)
- Production mobile CI build job (iOS/Android)

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Rebase conflicts (CI, CODEOWNERS, package.json, .gitignore) | High | 12 commits divergence — CI workflow completely rewritten on main (single `build.yml` using `npm ci` on `cosmos` runner vs PR's monorepo pnpm workflows). Must reconcile manually. Delete pnpm-lock.yaml and regenerate. |
| iOS build fails (CocoaPods/Xcode) | Medium | Mac has Xcode 16.4 + iOS 18.6 simulator ready |
| Vercel deployment regresses | High | Test preview deployment before merge |
| Font linking breaks on clean checkout | Low | Test `pod install` from scratch |

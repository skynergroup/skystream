# SkyStream Monorepo — Implementation Plan

**PR:** #73 `feature/monorepo-mobile-app`
**Reviewed by:** Tashmia (plan), Codex (review)
**Target:** Merge to main, tag v2.0.0

---

## Prerequisites

- Worktree: `<repo>/.worktrees/monorepo-merge` from `feature/monorepo-mobile-app`
- Tools: pnpm, turbo, cocoapods, Xcode 16.4, iOS Simulator, Vercel CLI
- Invariant: `pnpm turbo build --filter=web` must pass after every step

---

## Phase 1: Rebase & Security Cleanup

### 1.1 Create worktree and rebase
```bash
git worktree add .worktrees/monorepo-merge -b agent/monorepo-merge origin/feature/monorepo-mobile-app
cd .worktrees/monorepo-merge
git rebase origin/main
```
**Known conflicts (12 commits behind):**
- `.github/workflows/build.yml` — main rewrote this to a single `npm ci`-based CI on `cosmos` runner. PR has monorepo pnpm workflows. **Keep PR's monorepo workflows** (`build.yml`, `mobile.yml`, `packages.yml`) but port main's improvements: `concurrency` group, draft-PR skip, `actions/checkout@v6`, `actions/setup-node@v6`.
- `.github/CODEOWNERS` — main changed to `@skynergroup/senior`. Keep that.
- `.gitignore` — merge both (main has no RN/turbo entries; PR adds them).
- `.gitattributes` — main added this file. Keep main's version.
- `.editorconfig` — main added this file. Keep main's version.
- `package.json` — main bumped deps (jest 30.4, eslint 10, react 19.2.6, next 16.2.6). PR restructured to turbo root. **Use PR's turbo root structure but adopt main's dep versions in `apps/web/package.json`.**
- `package-lock.json` — main has npm lockfile. PR uses pnpm. **Delete `package-lock.json`, keep `pnpm-lock.yaml`, regenerate with `pnpm install`.**
- `.github/dependabot.yml` — main added `@skynergroup/senior` reviewer. Merge and also update for monorepo paths.
- `LICENSE` — main added MIT license. Keep it.
- `.github/workflows/pr-agent.yml` — main added this. Keep it.

### 1.2 Security cleanup — hardcoded API keys
- Remove `NEXT_PUBLIC_TMDB_API_KEY=20aed25855723af6f6a4dcdad0f17b86` from `apps/web/.env.production`
  - Replace with `NEXT_PUBLIC_TMDB_API_KEY=` (empty — Vercel env var provides it)
- Audit `apps/mobile/src/utils/api.js` — the hardcoded key `20aed25855723af6f6a4dcdad0f17b86` is acceptable as a dev default since TMDB keys are free/non-secret, but add a comment noting it should come from `react-native-config` in production
- Verify the same key exists in GitHub repo secrets (already confirmed via HANDOVER.md)

### 1.3 Reconcile dual vercel.json
- **Root `vercel.json`** has: `installCommand: "pnpm install"`, `buildCommand: "pnpm turbo build --filter=web"`, `outputDirectory: "apps/web/.next"`
- **`apps/web/vercel.json`** has: `installCommand: "cd ../.. && pnpm install"`, `buildCommand: "cd ../.. && pnpm turbo build --filter=web"`
- **Decision:** Keep root `vercel.json` only. Delete `apps/web/vercel.json`. Vercel Root Directory stays `.`.

### 1.4 Clean VITE_ fallbacks from next.config.mjs
- Remove `process.env.VITE_TMDB_API_KEY`, `process.env.VITE_TMDB_BASE_URL`, `process.env.VITE_APP_NAME`, `process.env.VITE_APP_VERSION` fallbacks from the `env` block
- These are dead code now that all VITE_ env vars have been removed from Vercel

### 1.5 Verify web build
```bash
pnpm install
pnpm turbo build --filter=web   # Must pass
pnpm --filter web lint           # Must pass
pnpm --filter web test           # Note failures (2 pre-existing)
```

---

## Phase 2: Mobile Build Verification

### 2.1 Mobile lint (strict)
```bash
pnpm --filter mobile lint        # No || true — fix failures
```

### 2.2 iOS build
```bash
cd apps/mobile/ios
pod install
xcodebuild -workspace SkyStream.xcworkspace \
  -scheme SkyStream \
  -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone SE (3rd generation),OS=18.6' \
  build
```

### 2.3 iOS simulator smoke test
- App launches, StatusBar matches theme
- Discover screen loads TMDB data (trending, popular movies, popular TV)
- Search screen works — type query, results appear
- Tap movie → MovieDetailScreen loads full details
- Tap play → PlayerScreen WebView loads, ads blocked
- Verify Ionicons render (tab bar icons, back buttons)

### 2.4 Android build (if SDK available)
```bash
cd apps/mobile/android
./gradlew assembleDebug
```

---

## Phase 3: CI Hardening & Quality

### 3.1 Fix mobile.yml — remove || true
```yaml
# Before:
- name: Lint mobile
  run: pnpm --filter mobile lint || true
- name: Test mobile
  run: pnpm --filter mobile test || true

# After:
- name: Lint mobile
  run: pnpm --filter mobile lint
- name: Test mobile
  run: pnpm --filter mobile test
```

### 3.2 Fix build.yml — remove || true from test steps
```yaml
# Before:
- name: Test packages
  run: pnpm test:packages || true
- name: Test web
  run: pnpm --filter web test || true

# After:
- name: Test packages
  run: pnpm test:packages
- name: Test web
  run: pnpm --filter web test
```

### 3.3 Add unit tests for packages/api
Create `packages/api/src/__tests__/TMDBApi.test.js`:
- Mock `globalThis.fetch`
- `makeRequest` — correct URL construction, query params, error handling
- Endpoint methods — correct paths (`/trending/all/week`, `/movie/popular`, etc.)
- `StreamingServices` — Vidsrc/Videasy URL generation for movies and TV (with seasons/episodes)

Create `packages/api/package.json` test script:
```json
"scripts": { "test": "node --experimental-vm-modules ../../node_modules/.bin/jest" }
```

### 3.4 Add unit tests for packages/shared
Create `packages/shared/src/__tests__/config.test.js`:
- `getTMDBImageUrl` — with path, without path (null), custom size
- `getPosterUrl`, `getBackdropUrl` — correct default sizes
- `getDownloadUrl` — movie, TV, TV with season/episode
- Config constants — `APP_CONFIG`, `TMDB_DEFAULTS`, `PLAYER_DEFAULTS` defined

Create `packages/shared/src/__tests__/routing.test.js`:
- `sanitizeForUrl` — normal, empty, special chars, multiple dashes
- `generateMovieUrl` / `generateTVUrl` — slug + ID format
- `parseMovieUrl` / `parseTVUrl` — round-trip with generate
- `parseStreamingUrl` — delegates correctly
- `isStreamingUrl` — true/false cases

### 3.5 Update HANDOVER.md
- Change "no ios/ or android/ yet" to reflect that native folders exist and were generated
- Update remaining work list

### 3.6 Update dependabot.yml for monorepo
```yaml
updates:
  - package-ecosystem: npm
    directory: /apps/web
    schedule:
      interval: weekly
    groups:
      web-dependencies:
        patterns: ["*"]
  - package-ecosystem: npm
    directory: /apps/mobile
    schedule:
      interval: weekly
    groups:
      mobile-dependencies:
        patterns: ["*"]
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
```

### 3.7 ESLint config harmonization
- Option A (recommended): Keep `apps/web/.eslintrc.js` for now, add comment explaining legacy config is intentional for the web app's specific rules. Root `eslint.config.js` (flat config) was for the old flat structure.
- Option B: Migrate `apps/web/.eslintrc.js` to flat config in `apps/web/eslint.config.js`. More work, lower priority.
- Remove root `eslint.config.js` if it only served the old flat structure — web has its own now.

### 3.8 Babel module-resolver audit
- `apps/mobile/babel.config.js` aliases `@skystream/api` → `../../packages/api/src` AND pnpm workspace resolves `workspace:*`
- This is intentional — Metro uses the babel aliases at bundle time, pnpm workspace is for install-time resolution
- Add a brief comment in `babel.config.js` explaining why both exist

---

## Phase 4: Commit, Push & Verify

### 4.1 Commit
Split into focused commits or squash — recommended:
```
chore(monorepo): security cleanup and vercel config fixes #73
test(packages): add unit tests for api and shared #73
ci(workflows): remove || true, strict lint and test #73
chore(docs): update HANDOVER.md and dependabot for monorepo #73
```
All commits with `Co-authored-by: Yashiel Sookdeo <yashiel@skyner.co.za>`

### 4.2 Force push rebased branch
```bash
git push --force-with-lease origin feature/monorepo-mobile-app
```

### 4.3 Verify CI passes
- Web build workflow passes
- Mobile lint/test workflow passes
- Packages workflow passes

### 4.4 Verify Vercel preview deployment
- Check the Vercel bot comment on the PR
- Visit the preview URL — web app loads and functions

### 4.5 Merge
- Squash-merge to main (or rebase-merge if commit history is clean)
- Tag `v2.0.0`
- Verify production deployment at https://www.sky-stream.online

---

## Post-Merge (Future)

- App Store / TestFlight / Play Store setup
- TypeScript migration (start with shared packages)
- E2E testing (Detox for mobile, Playwright for web)
- Android deep linking (intent filter for `skystream://` scheme)
- Performance profiling
- Push notifications

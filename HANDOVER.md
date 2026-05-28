# SkyStream Monorepo Restructuring — Handover

## What Was Done

The SkyStream repo has been restructured from a flat Next.js app into a Turborepo monorepo. All 7 phases are complete, including the native iOS/Android project folders for the mobile app.

### Completed Phases

**Phase 0 — Monorepo Scaffolding** ✅
- Created root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`
- Moved all app files into `apps/web/`
- Switched from npm to pnpm
- Web app builds and 286/288 tests pass (2 pre-existing failures in StreamingResultCard)

**Phase 1 — @skystream/api Package** ✅
- `packages/api/src/tmdb/TMDBApi.js` — TMDBApi class with constructor injection (`apiKey`, `baseUrl`, `imageBaseUrl`, `logger`)
- `packages/api/src/streaming/StreamingServices.js` — verbatim copy (zero deps)
- `apps/web/src/services/tmdbApi.js` — thin shim that creates instance with env vars
- `apps/web/src/services/streamingServices.js` — re-exports from package

**Phase 2 — @skystream/shared Package** ✅
- `packages/shared/src/routing/index.js` — pure URL functions (sanitizeForUrl, generateMovieUrl, parseTVUrl, etc.)
- `packages/shared/src/data/` — countries.js, categories.js (verbatim copies)
- `packages/shared/src/config/index.js` — constants, image URL helpers

**Phase 3 — Updated Web Imports** ✅
- 5 component files updated to import from `@skystream/shared` instead of local `../data/` paths
- StreamingPlayerModal splits imports: `@skystream/shared` for pure routing, local for `updateBrowserUrl`

**Phase 4+5 — React Native App** ✅
- Full app structure at `apps/mobile/`
- Native `ios/` and `android/` project folders generated with `react-native init` (RN 0.83.9)
- Navigation: 3-tab bottom tabs (Discover, Search, Live TV), each with stack navigators
- 7 main screens: SearchScreen, DiscoverScreen, MovieDetailScreen, TVDetailScreen, PlayerScreen, LiveTVScreen + 4 LiveTV sub-screens
- 5 components: ContentCard, ContentRow, FeaturedHero, ServerSelector, SkeletonLoader
- Hooks: useTheme (Appearance API + AsyncStorage), useServerPreference
- Theme system mirroring web CSS variables
- Player uses WebView for embed URLs, react-native-video for HLS

**Phase 6 — CI/CD** ✅
- `.github/workflows/build.yml` — web lint + test + build (pnpm)
- `.github/workflows/mobile.yml` — mobile lint + iOS/Android builds
- `.github/workflows/packages.yml` — shared package tests on PR

**Secrets** ✅
- `TMDB_API_KEY` added to GitHub repo secrets via `gh secret set`

### Current Repo Structure

```
skystream/                          # Monorepo root
├── turbo.json
├── package.json                    # pnpm workspace root
├── pnpm-workspace.yaml
├── .npmrc                          # shamefully-hoist=true
├── .github/workflows/
│   ├── build.yml                   # web CI
│   ├── mobile.yml                  # mobile CI
│   └── packages.yml                # shared packages CI
├── packages/
│   ├── api/                        # @skystream/api
│   │   └── src/
│   │       ├── tmdb/TMDBApi.js
│   │       ├── streaming/StreamingServices.js
│   │       └── index.js
│   └── shared/                     # @skystream/shared
│       └── src/
│           ├── config/index.js
│           ├── routing/index.js
│           ├── data/{countries,categories}.js
│           └── index.js
├── apps/
│   ├── web/                        # Next.js 16 app (fully working)
│   │   ├── package.json            # has workspace:* deps on @skystream/api and @skystream/shared
│   │   ├── src/app/                # App Router pages
│   │   ├── src/components/         # All web components + CSS
│   │   ├── src/services/           # tmdbApi.js shim, streamingServices.js shim, tmdbServer.js
│   │   └── src/utils/              # web-only hooks and utils
│   └── mobile/                     # React Native app (RN 0.83.9, native folders generated)
│       ├── package.json
│       ├── metro.config.js
│       ├── babel.config.js
│       ├── eslint.config.mjs       # flat ESLint config
│       ├── App.jsx
│       ├── index.js
│       ├── ios/                     # native iOS project (Xcode workspace + Podfile)
│       ├── android/                 # native Android project (Gradle)
│       └── src/
│           ├── navigation/         # RootNavigator, BottomTabNavigator, 3 stacks
│           ├── screens/            # 7 screens + LiveTV/ sub-screens
│           ├── components/         # 5 shared components
│           ├── hooks/              # useTheme, useServerPreference
│           ├── theme/              # colors, spacing, fontSize, borderRadius
│           └── utils/api.js        # configured TMDBApi instance
```

## What Remains

> **Done since the original handover:** native `ios/` and `android/` project
> folders were generated with `react-native init` (RN 0.83.9) and committed,
> package unit tests were added for `@skystream/api` and `@skystream/shared`,
> CI workflows are now strict (no `|| true`), and a flat ESLint config was added
> for the mobile app.

### 1. Install Native Dependencies
```bash
pnpm install            # from the repo root
cd apps/mobile/ios && pod install
```

### 2. Link Native Modules
These RN packages need native linking (should be auto-linked):
- `react-native-screens`
- `react-native-safe-area-context`
- `react-native-vector-icons` (needs manual font linking in Xcode/Android)
- `react-native-webview`
- `react-native-video`
- `@react-native-async-storage/async-storage`

`react-native-vector-icons` specifically requires:
- **iOS**: Add fonts to `Info.plist` and Xcode build phases
- **Android**: Add `apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")` to `android/app/build.gradle`

### 3. Test on Simulators
```bash
pnpm --filter mobile ios     # iOS Simulator
pnpm --filter mobile android # Android Emulator
```

### 4. Fix Any Runtime Issues
- Verify Metro resolves `@skystream/api` and `@skystream/shared` correctly
- Test all screens: Search → results → detail → player
- Test Live TV flow: mode → filter → channel list → player
- Verify WebView embeds load (Vidsrc/Videasy URLs)
- Verify react-native-video plays HLS streams

### 5. Environment Variable Cleanup
- `apps/mobile/src/utils/api.js` already reads `react-native-config` (`Config.TMDB_API_KEY`)
  with a hardcoded dev fallback; wire the production key through the build `.env`
- Ensure `.env` is in mobile `.gitignore`
- Update CI workflows to inject the `TMDB_API_KEY` secret as an env var during build

### 6. App Store Preparation (Future)
- App icons and splash screen
- iOS: Xcode signing, provisioning profiles
- Android: Keystore for release signing
- Deep linking: Configure URL scheme `skystream://` in both platforms

## Key Technical Notes

- **TMDB API Key**: stored in GitHub repo secrets as `TMDB_API_KEY` and in the Vercel project env (`NEXT_PUBLIC_TMDB_API_KEY`); not committed to the repo
- **Web app verification**: `pnpm --filter web build` must always pass — this is the invariant
- **Pre-existing test failures**: 2 tests in `StreamingResultCard.test.jsx` fail due to Next.js Image component URL transformation — not caused by restructuring
- **Metro monorepo config**: `metro.config.js` uses `watchFolders` pointing to workspace root and `disableHierarchicalLookup: true`
- **shamefully-hoist=true**: Required in `.npmrc` for Metro to resolve hoisted dependencies
- **Node version**: 22 (per `.nvmrc`)

## Prompt for Next Session

```
Continue the SkyStream monorepo work. Read HANDOVER.md at the repo root for full context.

The monorepo (web + mobile) is fully scaffolded and the native ios/ and android/
folders now exist. Everything is done EXCEPT bringing the mobile app up on devices:
1. pnpm install, then `cd apps/mobile/ios && pod install`
2. Link native modules (especially react-native-vector-icons fonts)
3. Test on iOS simulator / Android emulator and fix any runtime issues
4. Wire the production TMDB key through the mobile build .env (react-native-config)

The web app must continue building — verify with `pnpm --filter web build` after any changes.
```

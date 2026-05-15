# SkyStream Monorepo Restructuring — Handover

## What Was Done

The SkyStream repo has been restructured from a flat Next.js app into a Turborepo monorepo. All 7 phases are complete except generating the native iOS/Android project folders.

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

**Phase 4+5 — React Native App** ✅ (source code only, no native folders yet)
- Full app structure at `apps/mobile/`
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
│   └── mobile/                     # React Native app (SOURCE ONLY — no ios/ or android/ yet)
│       ├── package.json
│       ├── metro.config.js
│       ├── babel.config.js
│       ├── App.jsx
│       ├── index.js
│       └── src/
│           ├── navigation/         # RootNavigator, BottomTabNavigator, 3 stacks
│           ├── screens/            # 7 screens + LiveTV/ sub-screens
│           ├── components/         # 5 shared components
│           ├── hooks/              # useTheme, useServerPreference
│           ├── theme/              # colors, spacing, fontSize, borderRadius
│           └── utils/api.js        # configured TMDBApi instance
```

## What Remains

### 1. Generate Native iOS/Android Folders
The `apps/mobile/` has all JS source code but NO `ios/` or `android/` native project folders. These need to be generated:

```bash
cd apps/mobile
npx @react-native-community/cli init SkyStream --directory . --skip-install
```

OR alternatively, init in a temp dir and copy the `ios/` and `android/` folders:

```bash
npx @react-native-community/cli init SkyStream --skip-install
cp -r SkyStream/ios apps/mobile/ios
cp -r SkyStream/android apps/mobile/android
rm -rf SkyStream
```

After generating:
- Update `ios/SkyStream/AppDelegate.mm` or `AppDelegate.swift` if needed
- Update `android/app/src/main/java/.../MainActivity.java` to match package name
- Copy `apps/mobile/index.js` registration name matches the native project name

### 2. Install Native Dependencies
```bash
cd /Users/yashielsookdeo/Developer/yashiels/skynergroup/skystream
pnpm install
cd apps/mobile/ios && pod install
```

### 3. Link Native Modules
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

### 4. Test on Simulators
```bash
pnpm --filter mobile ios     # iOS Simulator
pnpm --filter mobile android # Android Emulator
```

### 5. Fix Any Runtime Issues
- Verify Metro resolves `@skystream/api` and `@skystream/shared` correctly
- Test all screens: Search → results → detail → player
- Test Live TV flow: mode → filter → channel list → player
- Verify WebView embeds load (Vidsrc/Videasy URLs)
- Verify react-native-video plays HLS streams

### 6. Environment Variable Cleanup
- Move TMDB API key from hardcoded in `apps/mobile/src/utils/api.js` to `react-native-config` `.env` file
- Add `.env` to mobile `.gitignore`
- Update CI workflows to inject `TMDB_API_KEY` secret as env var during build

### 7. App Store Preparation (Future)
- App icons and splash screen
- iOS: Xcode signing, provisioning profiles
- Android: Keystore for release signing
- Deep linking: Configure URL scheme `skystream://` in both platforms

## Key Technical Notes

- **TMDB API Key**: `20aed25855723af6f6a4dcdad0f17b86` (also in GitHub secrets as `TMDB_API_KEY`)
- **Web app verification**: `pnpm --filter web build` must always pass — this is the invariant
- **Pre-existing test failures**: 2 tests in `StreamingResultCard.test.jsx` fail due to Next.js Image component URL transformation — not caused by restructuring
- **Metro monorepo config**: `metro.config.js` uses `watchFolders` pointing to workspace root and `disableHierarchicalLookup: true`
- **shamefully-hoist=true**: Required in `.npmrc` for Metro to resolve hoisted dependencies
- **Node version**: 22 (per `.nvmrc`)

## Prompt for Next Session

```
Continue the SkyStream monorepo restructuring. Read HANDOVER.md at the repo root for full context.

The monorepo is at /Users/yashielsookdeo/Developer/yashiels/skynergroup/skystream

Everything is done EXCEPT:
1. Generate the native ios/ and android/ folders for apps/mobile/ (React Native CLI init)
2. Install dependencies and pod install
3. Link native modules (especially react-native-vector-icons fonts)
4. Test on iOS simulator and fix any runtime issues
5. Move TMDB API key to react-native-config

Use subagents to parallelize where possible. The web app must continue building — verify with `pnpm --filter web build` after any changes.
```

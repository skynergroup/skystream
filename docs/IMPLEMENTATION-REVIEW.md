# Implementation Plan Review

- **Actual conflict set:** `git merge-tree --write-tree --messages --name-only origin/main origin/feature/monorepo-mobile-app` reports conflicts in `.github/workflows/build.yml`, `.npmrc`, `package-lock.json`, and `package.json`.
- **Conflict prediction issue:** the plan correctly predicts `build.yml`, `package.json`, and `package-lock.json`, but misses the `.npmrc` add/add conflict. Keep the PR's pnpm settings and drop main's npm-only `legacy-peer-deps=true`.
- **Not actual conflicts:** `.github/CODEOWNERS`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.github/dependabot.yml`, `LICENSE`, and `.github/workflows/pr-agent.yml` need reconciliation/retention, but they are not merge conflicts in the final-tree merge.
- **Workflow branch trigger missing:** main changed CI pushes from `production` to `main`; port that to `build.yml` and `mobile.yml`, including the mobile iOS/Android `if: github.ref == 'refs/heads/production'` guards.
- **Package test paths:** `packages/api/src/__tests__/TMDBApi.test.js`, `packages/shared/src/__tests__/config.test.js`, and `packages/shared/src/__tests__/routing.test.js` are valid paths. Consider a separate `StreamingServices.test.js` for `packages/api/src/streaming/StreamingServices.js`.
- **Package test scripts:** both `packages/api/package.json` and `packages/shared/package.json` currently have no `scripts`; the plan only adds an API test script. Add a `test` script to both or `pnpm test:packages` will not prove both packages.
- **Mobile test hardening:** `apps/mobile` has `test: jest` but no mobile test files. Removing `|| true` from `pnpm --filter mobile test` will fail unless tests are added or the script uses an intentional `--passWithNoTests`.
- **Commands:** `pnpm install`, `pnpm turbo build --filter=web`, `pnpm --filter web lint`, `pnpm --filter web test`, and `pnpm --filter mobile lint` match package names/scripts. Package test commands need the script additions above.
- **Extra cleanup step:** VITE fallbacks also exist in `apps/web/src/services/tmdbServer.js` and `apps/web/jest.config.js`, not only `apps/web/next.config.mjs`.
- **pnpm config cleanup:** root `package.json` still has `pnpm.onlyBuiltDependencies`, while `pnpm-workspace.yaml` already has `onlyBuiltDependencies`; pnpm 10 ignores the package field, so remove the duplicate root field.
- **Push flow bug:** the worktree branch is `agent/monorepo-merge`, so `git push --force-with-lease origin feature/monorepo-mobile-app` is not the right refspec. Use `git push --force-with-lease origin HEAD:feature/monorepo-mobile-app`.
- **Verify flow:** after pushing, use PR-specific checks (`gh pr view 73`, `gh pr checks 73 --watch`) and then verify the Vercel preview. The plan's CI/Vercel verification order is otherwise sound.

# Cross-Phase Learnings

## 2026-04-05 PHASE-1

### Technical Notes
- Project uses Next.js 16.2.2 with Turbopack
- CSS Modules with BEM-like naming convention
- CSS variables defined in globals.css (--netflix-red, --text-primary, etc.)
- All components should use 'use client' directive for client-side interactivity

### Process Notes
- Implementing stories directly is faster than spawning workers for small tasks (< 30 min estimates)
- Dependencies must be installed (`npm install`) before running build/lint
- ESLint requires npx or local path (not in global PATH)

### Fixed Issues
- prd.json had invalid JSON due to unescaped quotes in grep commands - fixed by escaping quotes

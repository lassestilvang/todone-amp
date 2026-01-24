# AGENTS.md - Todone Task Management Application

Always make sure to update the AGENTS.md file with any new agents or changes to existing ones.

**IMPORTANT**: Code must lint and type check, tests must pass, and the project must build after completing changes.

## Build & Commands

- **Dev**: `bun run dev` (Vite dev server with Bun runtime)
- **Build**: `bun run build` (TypeScript + Vite)
- **Test**: `bun test` (Bun test runner)
- **Single test**: `bun test ./path/to/test.ts`
- **E2E Test**: `bun run test:e2e` (Playwright, all browsers)
- **E2E Test UI**: `bun run test:e2e:ui` (Playwright interactive UI)
- **E2E Chromium**: `bun run test:e2e:chromium` (Playwright, Chromium only)
- **Lint**: `bun run lint` (ESLint, zero warnings)
- **Type check**: `bun run type-check` (TypeScript)
- **Storybook**: `bun run storybook` (Component docs on port 6006)
- **Build Storybook**: `bun run build-storybook` (Static build)
- **Performance Budget**: `bun run perf:budget` (Build + Lighthouse CI)
- **Lighthouse**: `bun run lighthouse` (Lighthouse CI on built dist)

## Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Dexie.js (IndexedDB wrapper) in `src/db/`
- **State**: Zustand in `src/store/`
- **UI**: Tailwind CSS + Lucide icons
- **Drag-drop**: @dnd-kit libraries
- **Structure**: `src/` → components, hooks, pages, store, types, utils, views

## Code Style

- **Format**: Prettier (semi: false, singleQuote: true, printWidth: 100, tabWidth: 2)
- **Linting**: ESLint + @typescript-eslint (strict rules, zero warnings)
- **Imports**: ES modules, path alias `@/*` maps to `src/*`
- **TypeScript**: Strict mode, no unused locals/parameters, jsx: react-jsx
- **Naming**: camelCase for functions/variables, PascalCase for components
- **React**: Functional components only, hooks-based, export components (lint rule)

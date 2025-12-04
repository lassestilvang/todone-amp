# AGENTS.md - Todone Task Management Application

## Build & Commands
- **Dev**: `npm run dev` (Vite dev server)
- **Build**: `npm run build` (TypeScript + Vite)
- **Test**: `npm run test` (Vitest)
- **Single test**: `npm run test -- path/to/test.ts`
- **Lint**: `npm run lint` (ESLint, zero warnings)
- **Type check**: `npm run type-check` (TypeScript)

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

| Field | Value |
|-------|-------|
| **App** | Director — Consultant operations hub |
| **Stack** | React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Zustand 5 |
| **Port** | 3950 (frontend only) |
| **Database** | None — all data in browser localStorage |
| **Status** | MVP |

## Commands

```bash
npm run dev          # Frontend dev server (port 3950)
npm run build        # TypeScript check + Vite production build → dist/
npm run lint         # ESLint
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
npm run preview      # Serve production build locally
```

## Architecture

**Frontend-only SPA.** No backend, no database, no authentication. All persistence is browser localStorage via Zustand `persist` middleware. Each store writes to `director-{storename}` keys.

### State Management

Zustand stores in `src/stores/` — one file per domain (clients, engagements, discovery, scaffolding, ocai, terminology, settings).

### Data Seeding

`App.tsx` exports `DATA_VERSION`. On version mismatch, all localStorage is cleared and re-seeded from `src/lib/sample-data.ts`. Increment `DATA_VERSION` when changing data models.

### Component Organization

- `src/pages/` — Route-level components (7 routes, React Router DOM 7)
- `src/components/ui/` — shadcn/ui primitives (Radix UI + CVA)
- `src/components/layout/` — AppShell, Sidebar
- `src/components/shared/` — Cross-feature reusable components (GradientButton, SegmentedToggle)
- `src/components/wizard/` — Generic WizardCard component
- `src/components/kanban/` — Generic KanbanBoard, KanbanColumn, KanbanCard

### Core Libraries (`src/lib/`)

| File | Purpose |
|------|---------|
| `utils.ts` | ID generation, date formatting, cn() helper |

## Design System

Dark glassmorphism aesthetic with amber/gold accent. HSL token system defined in `src/index.css`.

- **Background:** Deep navy `hsl(225, 64%, 11%)`
- **Cards:** Semi-transparent with `backdrop-blur`
- **Primary accent:** Amber/gold `hsl(38, 92%, 50%)` (differentiator from Control's blue)
- **Gradients:** Blue → Teal → Purple on gradient buttons
- **Typography:** Inter Variable, `font-light` throughout
- **Inputs:** Bottom-border only, transparent background
- **Animations:** Pure CSS `@keyframes` (no Framer Motion)

Component library is shadcn/ui with Radix UI primitives. Icons from Lucide React.

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_USE_MOCK_DATA` | Use mock AI fallbacks | `true` |

OpenRouter API key is configured at runtime in Settings page, stored in localStorage.

## Types

All shared types in `src/types/index.ts` (created in P1).

## Path Alias

`@/*` maps to `src/*` (configured in tsconfig and vite).

## Charter & Documentation

Project charter and execution plan live in `documentation/`.

## Origin

Director was cloned from Control (client-facing app) with all client-specific code stripped. The two apps share the same design system origin but are independent repositories.

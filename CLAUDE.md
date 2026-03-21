# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

| Field | Value |
|-------|-------|
| **App** | Control — AI development operations hub |
| **Stack** | React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, Zustand 5 |
| **Port** | 3940 (frontend), 4100 (mock WebSocket server) |
| **Database** | None — all data in browser localStorage |
| **Status** | Prototype |

## Commands

```bash
npm run dev          # Frontend dev server (port 3940)
npm run demo         # Frontend + mock WebSocket agent server together
npm run mock-server  # Mock WebSocket server only (port 4100)
npm run build        # TypeScript check + Vite production build → dist/
npm run lint         # ESLint
npm run preview      # Serve production build locally
```

No test framework is configured.

## Architecture

**Frontend-only SPA.** No backend, no database. All persistence is browser localStorage via Zustand `persist` middleware. Each store writes to `control-{storename}` keys.

### State Management

Zustand stores in `src/stores/` — one file per domain (ideas, charters, issues, activity, agent-sessions, agents-skills, scaffolding, settings, users, dev-settings). Self-contained feature modules in `src/modules/` have their own stores.

### Data Seeding

`App.tsx` tracks `DATA_VERSION`. On version mismatch, all localStorage is cleared and re-seeded from `src/lib/sample-data.ts`. Increment `DATA_VERSION` when changing data models.

### Component Organization

- `src/pages/` — Route-level components (10 routes, React Router DOM 7)
- `src/components/ui/` — shadcn/ui primitives (Radix UI + CVA)
- `src/components/{feature}/` — Feature-specific components (admin, wizard, production, scoring, etc.)
- `src/components/shared/` — Cross-feature reusable components
- `src/modules/` — Self-contained feature modules with own components, stores, types, and logic:
  - `issue-reporter/` — Conversational issue filing wizard
  - `issue-scoring/` — Scoring engine, auto-remediation, weight editors
  - `agents-skills/` — Agent & skill management

### Core Libraries (`src/lib/`)

| File | Purpose |
|------|---------|
| `scoring.ts` | Rules-based idea scoring (keyword heuristics, no AI) — Impact 30%, Urgency 25%, Feasibility 25%, Alignment 20% |
| `charter-generator.ts` | Charter generation via Anthropic API or mock fallback (`VITE_USE_MOCK_DATA`) |
| `agent-connection.ts` | WebSocket client for agent build servers |
| `abstraction-layer.ts` | Translates raw CLI output to plain-English milestones |
| `permissions.ts` | RBAC helpers (admin/developer/viewer) — UI enforcement only |
| `sample-data.ts` | Demo data for all stores |

### Key Hooks (`src/hooks/`)

- `useAgentConnection` — WebSocket lifecycle, output buffering, abstraction layer integration
- `useDictation` — Web Speech API with auto-restart on silence timeout

## Design System

Dark glassmorphism aesthetic. HSL token system defined in `src/index.css`.

- **Background:** Deep navy `hsl(225, 64%, 11%)`
- **Cards:** Semi-transparent with `backdrop-blur`
- **Primary accent:** Vivid blue `hsl(217, 100%, 61%)`
- **Gradients:** Blue → Teal → Purple on buttons, card borders, hero text
- **Typography:** Inter Variable, `font-light` throughout
- **Inputs:** Bottom-border only, transparent background
- **Animations:** Pure CSS `@keyframes` (no Framer Motion)

Component library is shadcn/ui with Radix UI primitives. Icons from Lucide React.

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_USE_MOCK_DATA` | Use mock charter generation | `true` |
| `VITE_ANTHROPIC_API_KEY` | Live charter generation API key | _(empty)_ |
| `VITE_AGENT_WS_URL` | WebSocket URL for agent server | `ws://localhost:4100` |

OpenRouter API key for AI scoring features is configured at runtime in Admin panel, stored in localStorage.

## Types

All shared types in `src/types/index.ts`. Module-specific types colocated in `src/modules/{module}/types/`.

Key status flows:
- **Idea:** scored → on-deck → development → production → archived
- **Issue:** open → in-progress → resolved → closed
- **Agent Session:** connecting → connected → building → paused → complete/error/stopped

## Path Alias

`@/*` maps to `src/*` (configured in tsconfig and vite).

## Charter & Documentation

Project charters and design references live in `documentation/`. The primary charter is `documentation/charter.yaml`.

## Global Rules

This project follows shared conventions in `~/.claude/rules/`. Key references:
- `branding.md` — Ahaus corporate branding (not used here; Control has its own dark theme)
- `code-style.md` — TypeScript patterns, naming, imports
- `technology-preferences.md` — Stack defaults
- `architecture.md` — Project structure patterns

**Note:** Control departs from global defaults in these ways:
- No backend/GraphQL/MS SQL — frontend-only prototype
- Dark glassmorphism theme instead of Ahaus corporate branding
- Zustand instead of Context API
- Client-side AI calls instead of server-side OpenRouter pattern
- No authentication (MSAL not applicable)

# Changelog

## [0.3.0] — P2: Full routing, Director shell verified, Settings page complete

- All 7 routes wired with root redirect (/ → /clients) and 404 catch-all
- Settings page: OpenRouter API key entry (password with show/hide toggle), model selection per AI function, MOCK MODE badge, About section with version from package.json
- API key persists in localStorage via Zustand settings store
- Smoke tests for SettingsPage (3 tests) — all passing
- Installed @testing-library/react for component testing

## [0.2.0] — P1: Domain types, Zustand stores, comprehensive sample data seeded

- Created `src/types/index.ts` with all Director domain interfaces and enums (Client, Engagement, DiscoverySession, ScaffoldingPackage, OCAIAssessment, TerminologyEntry)
- Created 7 Zustand persist stores with `director-` key prefix (clients, engagements, discovery, scaffolding, ocai, terminology, settings)
- Created comprehensive sample data for two fictional clients:
  - Precision Dynamics: scaffolding phase, 3 completed discovery sessions, validated scaffolding package with all 8 sections, analyzed L1 OCAI, L2 in progress, 32 terminology entries
  - Midwest Distribution Co: discovery phase, 2 sessions (1 complete, 1 in-progress), partial scaffolding, deployed L1 OCAI
- Implemented DATA_VERSION seeding in App.tsx — clears and re-seeds all stores on version mismatch

## [0.1.0] — P0: Clone and strip Control, establish Director identity

- Cloned Control repository, removed all client-specific pages, modules, components, stores, libs, hooks, and types
- Removed mock-server directory and WebSocket dependencies
- Updated branding: Director name, amber/gold accent color (`hsl(38, 92%, 50%)`), Project Foundry sidebar footer
- Updated Sidebar navigation: Clients, Engagements, Discovery, Scaffolding, OCAI, Terminology, Settings
- Set Vite dev server to port 3950 with allowed hosts for lab.ahaus.com and director.ahaus.com
- Created placeholder pages for all 7 routes with root redirect to /clients and 404 catch-all
- Renamed package to "director", set version to 0.1.0
- Refactored shared components (WizardCard, KanbanBoard) to be generic — removed Control-specific store dependencies
- Created .env and .env.example with VITE_USE_MOCK_DATA=true
- Verified: zero TypeScript errors, zero lint warnings, clean build

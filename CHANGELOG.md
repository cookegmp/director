# Changelog

## [0.6.0] — P5: Discovery page with session list, interview wizard, AI extraction with mock fallback

- Session list grouped by type (Stakeholder Interview, System Walkthrough, Workflow Observation, Brand Collection) with status badges
- Session detail panel showing transcript, extracted data (JSON view), and scaffolding sections affected badges
- New session creation form with type selector, title, participants, and datetime input
- AI-guided interview wizard with scripted conversation flows per session type
- Interview flows: stakeholder (8 steps), system walkthrough (6), workflow observation (6), brand collection (5)
- Mock AI extraction with 600-1200ms simulated delay — no real API calls when VITE_USE_MOCK_DATA=true
- OpenRouter client module (`src/lib/openrouter.ts`) with mock mode guard and API key from settings store
- Mock AI stubs (`src/lib/mock-ai.ts`) for extraction and OCAI generation

## [0.5.0] — P4: Engagements page complete

- Per-client engagement list with phase and status badges
- Phase progression stepper with Advance/Revert controls and confirm dialogs
- Engagement detail with tabbed view: Overview (stats), Discovery (count + link), Scaffolding (completion % + link), OCAI (count + link), Settings (status edit)
- New engagement creation dialog with phase selector and date inputs
- Client selector dropdown defaults to first client

## [0.4.0] — P3: Clients page complete

- Client list with status badges, filter by status dropdown, text search, sortable columns (name, status, updated)
- Client detail panel with engagement history, status progression stepper, quick-action navigation links
- Status progression visualization (prospect → discovery → scaffolding → building → active) with click-to-change and confirm dialog
- New client creation dialog with validation (name required)
- Sample data renders correctly: Precision Dynamics (scaffolding), Midwest Distribution Co (discovery)

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

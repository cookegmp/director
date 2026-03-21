# Changelog

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

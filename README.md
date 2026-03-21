# Director

Consultant operations hub for managing client engagements, conducting discovery sessions, assembling scaffolding packages, administering OCAI cultural assessments, and maintaining terminology decoders.

## Purpose

Director is the governance and pre-production tool used exclusively by Project Foundry consultants. It guides discovery, manages scaffolding assembly, administers OCAI assessments, and produces the scaffolding packages that feed everything downstream. Director never deploys to clients.

All data persists to browser `localStorage` — there is no backend or database. The application is a frontend-only single-page app fully demonstrable without any server infrastructure or API keys.

## Tech Stack

- **Runtime:** Node.js 20.x
- **Framework:** Vite 7.x (SPA, no SSR)
- **Frontend:** React 19.x, TypeScript 5.9.x (strict mode)
- **Styling:** Tailwind CSS 4.x, shadcn/ui (Radix UI primitives)
- **State:** Zustand 5.x with `persist` middleware (localStorage)
- **Routing:** React Router DOM 7.x
- **Drag and Drop:** dnd-kit
- **Icons:** Lucide React 0.575.x
- **Testing:** Vitest 4.x, jsdom, Testing Library
- **Package Manager:** npm

## Prerequisites

- Node.js 20.x or later
- A modern browser (Chrome or Edge recommended)

## Installation

```bash
git clone https://github.com/cookegmp/director
cd director
npm install
npm run dev
```

Open [http://localhost:3950](http://localhost:3950)

The app auto-seeds demo data on first load. No database setup required.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_USE_MOCK_DATA` | When `true`, all AI features use mock fallbacks with simulated delays | `true` |

The OpenRouter API key for live AI features is configured at runtime via the Settings page and stored in `localStorage`.

## Development

```bash
npm run dev          # Dev server (port 3950)
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest single run
npm run test:watch   # Vitest watch mode
npm run preview      # Serve production build locally
```

### Demo Data Reset

Sample data is versioned via `DATA_VERSION` in `src/App.tsx`. Incrementing it clears all `localStorage` and re-seeds on next load. To manually reset, clear `localStorage` in DevTools and reload.

## Application Routes

| Route | Page | Description |
|-------|------|-------------|
| `/clients` | Clients | Client list with filtering, sorting, detail panel, status progression |
| `/engagements` | Engagements | Per-client engagement list with phase progression controls |
| `/discovery` | Discovery | Session list by type, AI-guided interview wizard |
| `/scaffolding` | Scaffolding | Two-tier editor (Operational / Build Intelligence), terminology decoder |
| `/ocai` | OCAI | Assessment dashboard, L1/L2 builders, CVF radar chart |
| `/terminology` | Terminology | Searchable decoder table with bulk import/export |
| `/settings` | Settings | OpenRouter API key, model selection, mock mode indicator |

## Design System

Dark glassmorphism aesthetic inherited from Control with amber/gold accent (`hsl(38, 92%, 50%)`) as the visual differentiator. All other tokens are identical.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `hsl(225, 64%, 11%)` | Deep navy page background |
| `--card` | `hsl(225, 50%, 15%)` | Card backgrounds |
| `--primary` | `hsl(38, 92%, 50%)` | Amber/gold accent |

## Data Persistence

All data lives in `localStorage` via Zustand persist stores with `director-` key prefix. Data version tracked under `director-data-version`.

## Build and Deployment

```bash
npm run build
```

Outputs to `dist/`. Serve from any static host or NGINX with `try_files $uri $uri/ /index.html`.

Allowed hosts: `localhost`, `127.0.0.1`, `lab.ahaus.com`, `director.ahaus.com`

# StageManager

AI development operations hub for capturing ideas, scoring opportunities, generating project charters, tracking issues, and monitoring agentic build sessions.

## Purpose

StageManager is the internal development lifecycle tool used after an AI consulting engagement to manage ongoing development operations. It gives the team a structured way to:

- Capture process improvement ideas through a guided intake wizard
- Score and prioritize opportunities across impact, urgency, feasibility, and alignment dimensions
- Generate project charters and execution plans via Claude API (or mock fallback)
- Track bugs and feature requests submitted from end users
- Monitor live agentic build sessions in real time via WebSocket
- Manage agents, skills, AI model assignments, and environment server connections through an admin panel

All data persists to browser `localStorage` — there is no backend or database. The application is a frontend-only single-page app intended to be demonstrable without any server infrastructure beyond the optional mock WebSocket server.

## Tech Stack

- **Runtime:** Node.js 20.x
- **Framework:** Vite 7.x (SPA, no SSR)
- **Frontend:** React 19.x, TypeScript 5.9.x
- **Styling:** Tailwind CSS 4.x, shadcn/ui (Radix UI primitives)
- **State:** Zustand 5.x with localStorage persistence middleware
- **Routing:** React Router DOM 7.x
- **Icons:** Lucide React 0.575.x
- **AI:** Anthropic Claude API (direct browser call, optional) or mock fallback
- **Mock Server:** Node.js WebSocket server (`ws`) for simulating agent build sessions
- **Package Manager:** npm

## Prerequisites

- Node.js 20.x or later ([Download](https://nodejs.org/))
- A modern browser with Web Speech API support for voice dictation (Chrome recommended; Firefox does not support the Web Speech API)
- Optional: Anthropic API key for live charter generation
- Optional: OpenRouter API key for AI-assisted issue scoring, agent management, and scoring features (configured in Admin)

## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd stagemanager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure it:
   ```bash
   cp .env .env.local
   ```
   Edit `.env.local` with your values (see Environment Variables below).

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3940](http://localhost:3940)

The app auto-seeds realistic demo data on first load. No database setup is required.

## Environment Variables

Create a `.env.local` file (or edit `.env`) in the project root. All variables are optional — the app runs fully on mock data with no API keys.

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `VITE_USE_MOCK_DATA` | When `true`, charter generation uses simulated output instead of the Anthropic API | `true` |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for live charter generation. When set and `VITE_USE_MOCK_DATA` is `false`, charters are generated via `claude-sonnet-4-20250514` | _(empty — mock mode)_ |
| `VITE_AGENT_WS_URL` | WebSocket URL for the live agent build server. In development, points to the local mock server | `ws://localhost:4100` |

**Note:** The OpenRouter API key for AI scoring features (issue scoring, agent management, idea chat) is configured at runtime through the Admin panel, not through environment variables. It is stored in `localStorage`.

## Development

```bash
# Start the frontend dev server only (port 3940)
npm run dev

# Start the frontend AND mock WebSocket agent server together
npm run demo

# Start the mock WebSocket agent server only (port 4100)
npm run mock-server

# Create a production build
npm run build

# Preview the production build locally
npm run preview

# Run ESLint
npm run lint
```

### Using the Mock Agent Server

The mock WebSocket server (`mock-server/index.ts`) simulates an agentic coding tool streaming build output. It runs on `ws://localhost:4100` and replays a scripted build session that includes status transitions, progress lines, errors, and recovery events.

To use it:

1. Run `npm run demo` to start both the frontend and mock server, or run them in separate terminals with `npm run dev` and `npm run mock-server`.
2. In the app, navigate to an idea that has reached the "Development" stage and open its charter.
3. Use the build control bar to connect to the agent and start a build.
4. The mock server streams output that the abstraction layer translates into plain-English milestones for non-technical stakeholders.

If you have a real agent server, set `VITE_AGENT_WS_URL` to its WebSocket URL.

### Demo Data Reset

Sample data is versioned. When the data model changes (tracked by `DATA_VERSION` in `src/App.tsx`), `localStorage` is automatically cleared and re-seeded on next page load. To manually reset demo data, clear `localStorage` in browser DevTools and reload.

## Project Structure

```
stagemanager/
├── src/
│   ├── App.tsx                  # Root component, routing, and data seeding
│   ├── main.tsx                 # Vite entry point
│   ├── index.css                # Global styles, CSS custom properties, animations
│   │
│   ├── components/
│   │   ├── admin/               # Admin panel tabs (users, servers, AI config, translation, agents/skills)
│   │   ├── idea-views/          # Idea detail state views (Scored, OnDeck, InDevelopment, Production, Archived)
│   │   ├── layout/              # AppShell, Sidebar navigation
│   │   ├── production/          # Agent build monitor (dashboard, issue feed, health indicators)
│   │   ├── scoring/             # Score breakdown display component
│   │   ├── shared/              # Gradient button, segmented toggle, wizard entry point
│   │   ├── ui/                  # shadcn/ui base components (button, card, badge, etc.)
│   │   ├── wizard/              # Intake wizard card and step components
│   │   └── DictationButton.tsx  # Voice dictation button (Web Speech API)
│   │
│   ├── pages/                   # Route-level page components
│   │   ├── DashboardPage.tsx    # / — priority queue, active projects, activity feed
│   │   ├── IntakePage.tsx       # /new/idea — multi-step intake wizard
│   │   ├── IssueReportPage.tsx  # /report — AI-driven issue reporter
│   │   ├── IdeasListPage.tsx    # /ideas — full ideas list with filters
│   │   ├── IdeaDetailPage.tsx   # /ideas/:id — scored idea detail and charter actions
│   │   ├── ChartersListPage.tsx # /charters — all generated charters
│   │   ├── CharterViewPage.tsx  # /charters/:id — charter document and build monitor
│   │   ├── IssuesPage.tsx       # /issues — issue list and detail panel
│   │   └── ScaffoldingPage.tsx  # /scaffolding — read-only scaffolding document viewer
│   │
│   ├── stores/                  # Zustand stores (all persisted to localStorage)
│   │   ├── ideas.ts             # Idea CRUD and status transitions
│   │   ├── charters.ts          # Charter storage and retrieval
│   │   ├── issues.ts            # Issue tracking
│   │   ├── activity.ts          # Activity feed
│   │   ├── agent-sessions.ts    # Live agent build session state
│   │   ├── agents-skills.ts     # Agent and skill definitions
│   │   ├── scaffolding.ts       # Scaffolding documents
│   │   ├── settings.ts          # Server config and AI model assignments
│   │   ├── users.ts             # User management and current user
│   │   └── dev-settings.ts      # Developer environment/model toggles
│   │
│   ├── lib/
│   │   ├── scoring.ts           # Rules-based idea scoring engine
│   │   ├── charter-generator.ts # Charter generation (Anthropic API or mock)
│   │   ├── agent-connection.ts  # WebSocket client for agent build server
│   │   ├── abstraction-layer.ts # Translates raw build output to plain English
│   │   ├── permissions.ts       # Role-based permission helpers
│   │   ├── sample-data.ts       # Demo data for all stores
│   │   └── utils.ts             # Shared utilities (ID generation, date formatting)
│   │
│   ├── modules/
│   │   ├── agents-skills/       # Agent and skill management UI
│   │   ├── issue-reporter/      # AI-driven conversational issue reporter
│   │   └── issue-scoring/       # Issue scoring engine, auto-remediation, and settings
│   │       ├── components/      # Score display, weight editors, remediation UI
│   │       ├── engine/          # Scoring calculation logic
│   │       ├── remediation/     # Auto-remediation trigger, monitor, queue, threshold evaluator
│   │       ├── stores/          # issue-scores, remediation-sessions, remediation-settings
│   │       └── types/           # Independent type definitions for this module
│   │
│   ├── hooks/
│   │   ├── useAgentConnection.ts  # Manages WebSocket lifecycle and output translation
│   │   └── useDictation.ts        # Web Speech API dictation with auto-restart
│   │
│   └── types/
│       └── index.ts             # All shared TypeScript interfaces and enums
│
├── mock-server/
│   ├── index.ts                 # WebSocket server entry point (port 4100)
│   └── build-session.ts         # Scripted build event sequence
│
├── documentation/               # Project charters and design reference docs
├── public/                      # Static assets
├── .env                         # Default environment variable template
├── vite.config.ts               # Vite config (port 3940, allowed hosts)
├── tsconfig.app.json            # TypeScript config for src/
└── package.json
```

## Application Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Priority queue, active projects, activity feed, quick actions |
| `/new/idea` | Intake Wizard | Six-step wizard to capture a new process improvement idea |
| `/report` | Issue Reporter | AI-driven conversational wizard to file a bug or feature request |
| `/ideas` | Ideas List | All ideas, filterable by status and score tier |
| `/ideas/:id` | Idea Detail | Full intake summary, score breakdown, charter generation action |
| `/charters` | Charters List | All generated project charters |
| `/charters/:id` | Charter View | Charter document, execution plan, live build monitor |
| `/issues` | Issues | Bug and feature request list with inline detail panel |
| `/scaffolding` | Scaffolding | Read-only viewer for organizational scaffolding documents |
| `/admin` | Admin | Users, servers, AI config, translation, agents and skills |

## Key Features

### Idea Intake Wizard

A six-step guided form that collects: problem description, impact, current state, desired outcome, constraints, and urgency level. Each step can optionally use AI-generated suggestion tags. Voice dictation (Web Speech API) is available on all text fields via the microphone button.

On completion, the scoring engine evaluates the answers across four weighted dimensions and assigns a composite priority score (0-100) placed into one of four tiers: Critical (80-100), High (60-79), Medium (40-59), Low (0-39).

### Scoring Engine

Located at `src/lib/scoring.ts`. Uses a rules-based keyword and heuristic approach — no AI call required. Dimension weights:

| Dimension | Weight | Key Factors |
|-----------|--------|-------------|
| Impact | 30% | People affected, frequency, severity keywords |
| Urgency | 25% | Urgency selector value, blocking signals |
| Feasibility | 25% | Inverse complexity — fewer constraints = higher score |
| Alignment | 20% | Match with modernization, automation, efficiency keywords |

### Charter Generation

When a user clicks "Generate Charter" on a scored idea, the system calls the Anthropic API (`claude-sonnet-4-20250514`) with a prompt combining the intake answers and score breakdown. The response is a structured JSON charter with project overview, objectives, technical approach, acceptance criteria, estimated timeline, and a phased execution plan.

If `VITE_USE_MOCK_DATA=true` or no API key is configured, a realistic mock charter is generated locally without any API call. This makes the prototype fully demonstrable without credentials.

### AI-Driven Issue Reporter

Located in `src/modules/issue-reporter/`. A conversational wizard that guides users through filing a bug or feature request. The AI pre-fills fields based on context, suggests a title, checks for possible duplicates, and presents a review card before submission. Supports voice dictation.

### Issue Scoring and Auto-Remediation

Located in `src/modules/issue-scoring/`. Scores submitted issues across configurable dimensions:

- **Bugs:** Severity, blast radius, reproducibility, remediation confidence, recurrence
- **Feature requests:** Demand, alignment, complexity, impact

Scoring weights and thresholds are configurable through the Admin panel. When a bug score exceeds the remediation threshold, the system can recommend or automatically trigger a remediation agent session. All settings are stored in `localStorage`.

### Agent Build Monitor

When a charter reaches the development stage, users can connect to an agent build server via WebSocket and start a build session. The `ProductionDashboard` component shows:

- **Translated feed:** Plain-English summaries of build progress (abstraction layer converts raw CLI output)
- **Raw output panel:** Full unfiltered agent output for developers
- **Control bar:** Connect, start, pause, resume, and stop build controls
- **Health indicators:** Session status, error count, elapsed time

### Admin Panel

Accessible at `/admin` by users with the `admin` role. Contains:

- **Users tab:** Manage user accounts and roles (admin, developer, viewer)
- **Servers tab:** Configure environment server connections (DSP, development, production) with WebSocket host/port/path and connection testing
- **AI Config tab:** Set the OpenRouter API key, assign AI models per function (charter, scoring, conversation, issue scoring, idea chat, abstraction), enable/disable each function, configure translation verbosity, and toggle zero data retention
- **Agents & Skills tab:** Define agent configurations (name, model, system prompt, tools, max turns) and skills (trigger, instructions, sync targets across environments)
- **Scoring tab:** Adjust dimension weights for idea scoring, bug scoring, and feature scoring; configure auto-remediation thresholds

### Role-Based Permissions

| Permission | Admin | Developer | Viewer |
|------------|-------|-----------|--------|
| View dashboard | Yes | Yes | Yes |
| Create / edit ideas | Yes | Yes | No |
| Generate charters | Yes | Yes | No |
| Control builds | Yes | Yes | No |
| File issues | Yes | Yes | Yes |
| Manage issues | Yes | Yes | No |
| View scaffolding | Yes | Yes | Yes |
| Access admin panel | Yes | No | No |
| Manage users / servers / AI | Yes | No | No |

### Voice Dictation

Available on intake wizard text fields, issue report form, and the build monitor review card. Uses the Web Speech API (`SpeechRecognition`). Supports continuous listening with automatic restart when the browser kills the session due to silence timeouts. Requires microphone permission and a browser that supports the Web Speech API (Chrome/Edge recommended).

## Design System

StageManager uses a dark glassmorphism aesthetic defined through CSS custom properties (HSL tokens) in `src/index.css`.

- **Background:** Deep navy (`hsl(225, 64%, 11%)`)
- **Cards:** Glassmorphism with `backdrop-blur` and semi-transparent navy
- **Primary accent:** Vivid blue (`hsl(217, 100%, 61%)`)
- **Gradient:** Blue → Teal → Purple used on primary action buttons, animated card borders, and hero text
- **Typography:** Inter variable font, `font-light` throughout
- **Inputs:** Bottom-border only, transparent background (no boxed inputs)
- **Borders:** Animated conic-gradient rotating border on featured cards via CSS `::before` pseudo-element

## Data Persistence

All data lives in `localStorage`. Each Zustand store writes to a dedicated key:

| Store | localStorage Key |
|-------|-----------------|
| Ideas | `stagemanager-ideas` |
| Charters | `stagemanager-charters` |
| Issues | `stagemanager-issues` |
| Activity | `stagemanager-activity` |
| Agent Sessions | `stagemanager-agent-sessions` |
| Agents & Skills | `stagemanager-agents-skills` |
| Scaffolding | `stagemanager-scaffolding` |
| Settings (servers, AI) | `stagemanager-settings` |
| Users | `stagemanager-users` |
| Dev Settings | `stagemanager-dev-settings` |
| Reported Issues | `stagemanager-reported-issues` |
| Issue Scores | `stagemanager-issue-scores` |
| Remediation Sessions | `stagemanager-remediation-sessions` |

Data version is tracked under `stagemanager-data-version`. Incrementing `DATA_VERSION` in `src/App.tsx` forces a full re-seed on next load.

## Build and Deployment

The app builds to a static `dist/` directory. No server-side rendering or API layer is required.

```bash
npm run build
```

Output goes to `dist/`. Serve it from any static file host or NGINX.

### NGINX Configuration (Internal Deployment)

The development server runs on port 3940 and is accessible at `stagemanager.ahaus.com`. NGINX handles SSL termination externally. The app does not manage SSL or proxying.

Allowed hosts configured in `vite.config.ts`:
- `lab.ahaus.com`
- `stagemanager.ahaus.com`

For production deployment, build the static bundle and serve `dist/` via NGINX with a fallback to `index.html` for client-side routing:

```nginx
location / {
    root /path/to/dist;
    try_files $uri $uri/ /index.html;
}
```

## Known Issues and Limitations

- **No backend:** All data is stored in `localStorage`. Clearing browser storage loses all data. Multi-user collaboration is not supported.
- **AI calls are client-side:** Charter generation makes a direct browser-to-Anthropic API call, which requires `anthropic-dangerous-direct-browser-access: true`. This is prototype behavior only and should not be carried forward to a production backend integration.
- **OpenRouter key in localStorage:** The OpenRouter API key entered in Admin is persisted to `localStorage` in plain text. Do not use production API keys on shared machines.
- **Voice dictation browser support:** Only works in browsers that support the Web Speech API. Firefox does not support it. Safari support is partial.
- **Remediation agent integration:** The auto-remediation system triggers a build session but the actual agent connection depends on a real or mock WebSocket server being available.
- **No authentication:** Any user can access any route including `/admin`. The role-based permission system enforces UI visibility only — there is no server-side enforcement.

## Contact

- **Maintainer:** IT Department / Development Team
- **Repository:** Internal — see your Git server
- **Questions:** Contact IT or the development team

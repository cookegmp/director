# Control

AI development operations hub for capturing ideas, scoring opportunities, generating project charters, tracking issues, and monitoring agentic build sessions.

## Purpose

Control is the development lifecycle tool used after an AI consulting engagement to manage ongoing development operations. It gives the team a structured way to:

- Capture process improvement ideas through a guided intake wizard
- Score and prioritize opportunities across impact, urgency, feasibility, and alignment dimensions
- Generate project charters and execution plans via Claude API (or mock fallback)
- Track bugs and feature requests submitted from end users
- Monitor live agentic build sessions in real time via WebSocket
- Manage agents, skills, AI model assignments, and environment server connections through an admin panel

All data persists to browser `localStorage` — there is no backend or database. The application is a frontend-only single-page app intended to be fully demonstrable without any server infrastructure beyond the optional mock WebSocket server.

## Tech Stack

- **Runtime:** Node.js 20.x
- **Framework:** Vite 7.x (SPA, no SSR)
- **Frontend:** React 19.x, TypeScript 5.9.x
- **Styling:** Tailwind CSS 4.x, shadcn/ui (Radix UI primitives)
- **State:** Zustand 5.x with `persist` middleware (localStorage)
- **Routing:** React Router DOM 7.x
- **Drag and Drop:** dnd-kit (Kanban board)
- **Icons:** Lucide React 0.575.x
- **AI:** Anthropic Claude API (direct browser call, optional) or mock fallback
- **Mock Server:** Node.js WebSocket server (`ws`) for simulating agent build sessions
- **Testing:** Vitest 4.x, jsdom, Testing Library
- **Package Manager:** npm

## Prerequisites

- Node.js 20.x or later ([Download](https://nodejs.org/))
- A modern browser — Chrome or Edge recommended (Firefox and Safari lack full Web Speech API support for voice dictation)
- Optional: Anthropic API key for live charter generation
- Optional: OpenRouter API key for AI-assisted issue scoring, idea chat, agent output translation, and other AI features (configured at runtime in the Admin panel)

## Installation

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd control
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Review and configure environment variables:

   ```bash
   # The .env file contains defaults — edit it directly or create a .env.local override
   cp .env .env.local
   ```

   See the Environment Variables section below. The app runs fully on mock data with no API keys configured.

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3940](http://localhost:3940)

The app auto-seeds realistic demo data on first load. No database setup is required.

## Environment Variables

The `.env` file at the project root contains defaults. Create `.env.local` to override locally without modifying the tracked file. All variables are optional — the app runs on mock data with no API keys.

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_USE_MOCK_DATA` | When `true`, charter generation uses simulated output instead of calling the Anthropic API | `true` |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for live charter generation. Requires `VITE_USE_MOCK_DATA=false`. Uses `claude-sonnet-4-20250514` | _(empty)_ |
| `VITE_AGENT_WS_URL` | WebSocket URL for the agent build server. In development, points to the local mock server | `ws://localhost:4100` |

**OpenRouter API key:** The key used for AI-assisted features (issue scoring, idea chat, build output translation, agent/skill management) is configured at runtime through the Admin panel and stored in `localStorage`. It is not an environment variable.

**Security note:** Do not store production API keys in `.env.local` on shared machines. The OpenRouter key saved via the Admin panel is stored in plain text in `localStorage`.

## Development

```bash
# Start the frontend dev server only (port 3940)
npm run dev

# Start the frontend AND mock WebSocket agent server together
npm run demo

# Start the mock WebSocket agent server only (port 4100)
npm run mock-server

# Create a production build (TypeScript check + Vite bundle)
npm run build

# Preview the production build locally
npm run preview

# Run ESLint
npm run lint

# Format with Prettier
npm run format

# Check formatting without writing changes
npm run format:check

# Run tests (Vitest, single run)
npm run test

# Run tests in watch mode
npm run test:watch
```

### Using the Mock Agent Server

The mock WebSocket server (`mock-server/index.ts`) simulates an agentic coding tool streaming build output. It runs on `ws://localhost:4100` and replays a scripted build session that includes status transitions, progress lines, errors, and recovery events.

To use it:

1. Run `npm run demo` to start both the frontend and mock server together, or run them separately in two terminals with `npm run dev` and `npm run mock-server`.
2. In the app, navigate to an idea that has a generated charter and is in the "Development" stage.
3. Open the charter view and use the build control bar to connect to the agent and start a build.
4. The mock server streams output that the abstraction layer translates into plain-English milestones for non-technical stakeholders.

If you have a real agent build server, set `VITE_AGENT_WS_URL` to its WebSocket URL.

### Demo Data Reset

Sample data is versioned. When the data model changes shape (tracked by `DATA_VERSION` in `src/App.tsx`), `localStorage` is automatically cleared and re-seeded on next page load. To manually reset demo data, open browser DevTools, clear `localStorage`, and reload the page.

To force a re-seed after changing sample data, increment `DATA_VERSION` in `src/App.tsx`.

### Testing

The test suite uses Vitest with jsdom. Tests live in `src/**/*.{test,spec}.{ts,tsx}` and the setup file is `src/test/setup.ts`. Currently the suite contains a smoke test confirming the test runner works. Component tests can be added alongside their source files.

```bash
npm run test         # Single run
npm run test:watch   # Watch mode
```

## Project Structure

```
control/
├── src/
│   ├── App.tsx                  # Root component, routing, data version check, and seeding
│   ├── main.tsx                 # Vite entry point
│   ├── index.css                # Global styles, CSS custom properties (HSL tokens), animations
│   │
│   ├── pages/                   # Route-level page components
│   │   ├── DashboardPage.tsx    # / — priority queue, active projects, activity feed
│   │   ├── IntakePage.tsx       # /new/idea — six-step intake wizard
│   │   ├── IssueReportPage.tsx  # /report — AI-driven conversational issue reporter
│   │   ├── IdeasListPage.tsx    # /ideas — ideas list (list view + Kanban board)
│   │   ├── IdeaDetailPage.tsx   # /ideas/:id — scored idea detail, charter actions
│   │   ├── ChartersListPage.tsx # /charters — all generated charters
│   │   ├── CharterViewPage.tsx  # /charters/:id — charter document and build monitor
│   │   ├── IssuesPage.tsx       # /issues — issue list with inline detail panel
│   │   ├── ScaffoldingPage.tsx  # /scaffolding — read-only scaffolding document viewer
│   │   └── NewPage.tsx          # /new — redirects to /new/idea
│   │
│   ├── components/
│   │   ├── admin/               # Admin panel tabs: users, servers, AI config, agents/skills,
│   │   │                        #   build translation, scoring
│   │   ├── dev-portal/          # Agent build monitor UI: control bar, translated feed,
│   │   │                        #   raw output panel, charter reference panel
│   │   ├── idea-views/          # Status-specific idea detail views (Scored, OnDeck,
│   │   │                        #   InDevelopment, Production, Archived)
│   │   ├── kanban/              # Drag-and-drop Kanban board (dnd-kit): board, column, card
│   │   ├── layout/              # AppShell, Sidebar navigation
│   │   ├── production/          # Production dashboard: health indicators, issue feed
│   │   ├── scoring/             # Score breakdown display component
│   │   ├── shared/              # Gradient button, segmented toggle, wizard entry components
│   │   ├── timeline/            # Idea history timeline dialog
│   │   ├── ui/                  # shadcn/ui base components (button, card, badge, tabs, etc.)
│   │   ├── wizard/              # Intake wizard card and step components
│   │   └── DictationButton.tsx  # Voice dictation button (Web Speech API)
│   │
│   ├── stores/                  # Zustand stores — all persisted to localStorage
│   │   ├── ideas.ts             # Idea CRUD and status transitions
│   │   ├── charters.ts          # Charter storage and retrieval
│   │   ├── issues.ts            # Issue tracking
│   │   ├── activity.ts          # Activity feed
│   │   ├── agent-sessions.ts    # Live agent build session state
│   │   ├── agents-skills.ts     # Agent and skill definitions
│   │   ├── scaffolding.ts       # Scaffolding documents
│   │   ├── settings.ts          # Server config, AI model assignments, DoW compliance
│   │   ├── users.ts             # User management and current user
│   │   └── dev-settings.ts      # Developer environment and model toggles
│   │
│   ├── lib/
│   │   ├── scoring.ts           # Rules-based idea scoring engine (no AI required)
│   │   ├── charter-generator.ts # Charter generation via Anthropic API or mock fallback
│   │   ├── agent-connection.ts  # WebSocket client class for the agent build server
│   │   ├── abstraction-layer.ts # Pattern-matching translator: raw CLI output → plain English
│   │   ├── permissions.ts       # Role-based permission helpers (UI enforcement only)
│   │   ├── sample-data.ts       # Demo data for all stores
│   │   └── utils.ts             # Shared utilities (ID generation, date formatting)
│   │
│   ├── modules/                 # Self-contained feature modules with own stores and types
│   │   ├── agents-skills/       # Agent and skill management UI (list, detail, creation wizard,
│   │   │                        #   skill sync across environments)
│   │   ├── issue-reporter/      # AI-driven conversational issue reporter (wizard, annotation
│   │   │                        #   canvas for screenshots, duplicate detection, review card)
│   │   └── issue-scoring/       # Issue scoring engine, auto-remediation, weight editors
│   │       ├── components/      # Score display, weight editors, remediation approval/banner
│   │       ├── engine/          # Bug scorer, feature scorer, score calculator, context
│   │       │                    #   assembler, remediation trigger/monitor/queue/threshold
│   │       ├── stores/          # issue-scores, remediation-sessions, remediation-settings
│   │       └── types/           # Module-scoped TypeScript type definitions
│   │
│   ├── hooks/
│   │   ├── useAgentConnection.ts  # WebSocket lifecycle management and output translation
│   │   ├── useDictation.ts        # Web Speech API with auto-restart on silence timeout
│   │   └── useIdeaTimeline.ts     # Derives chronological timeline events for an idea
│   │
│   ├── test/
│   │   ├── setup.ts             # Vitest + Testing Library setup
│   │   └── smoke.test.ts        # Basic smoke test
│   │
│   └── types/
│       └── index.ts             # All shared TypeScript interfaces, enums, and utility functions
│
├── mock-server/
│   ├── index.ts                 # WebSocket server entry point (port 4100)
│   └── build-session.ts         # Scripted build event sequence with delays and error events
│
├── documentation/               # Project charter (charter.yaml) and design reference docs
├── public/
│   └── level-set-logo.svg       # Level Set AI branding asset used in sidebar footer
├── .env                         # Default environment variable values (tracked in git)
├── vite.config.ts               # Vite config: port 3940, allowed hosts, path alias
├── vitest.config.ts             # Vitest config: jsdom environment, test file patterns
├── tsconfig.app.json            # TypeScript config for src/
├── tsconfig.node.json           # TypeScript config for vite.config.ts and mock-server/
└── package.json
```

## Application Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Priority queue, active projects, activity feed, quick actions |
| `/new/idea` | Intake Wizard | Six-step wizard to capture a new process improvement idea |
| `/report` | Issue Reporter | AI-driven conversational wizard to file a bug or feature request |
| `/ideas` | Ideas List | All ideas — list view or Kanban board, filterable and sortable |
| `/ideas/:id` | Idea Detail | Full intake summary, score breakdown, status-specific actions |
| `/charters` | Charters List | All generated project charters |
| `/charters/:id` | Charter View | Charter document, execution plan, live agent build monitor |
| `/issues` | Issues | Bug and feature request list with inline detail panel |
| `/scaffolding` | Scaffolding | Read-only viewer for organizational scaffolding documents |
| `/admin` | Admin | Users, servers, AI config, agents/skills, translation, scoring |

## Key Features

### Idea Intake Wizard

A six-step guided form that collects: problem description, impact, current state, desired outcome, constraints, and urgency level. Voice dictation (Web Speech API) is available on all text fields. Suggestion tags appear on each step to help users express their answers quickly.

On completion the scoring engine evaluates the answers and assigns a composite priority score (0-100) sorted into one of four tiers: Critical (80-100), High (60-79), Medium (40-59), Low (0-39).

### Ideas List — List and Kanban Views

The Ideas list page offers two view modes selectable via a segmented toggle:

- **List view:** Filterable table with search, status filter, score tier filter, and sort controls (by score, newest, or oldest). Each row shows title, composite score badge, status badge, and a history button that opens the timeline dialog.
- **Kanban board:** Drag-and-drop board with columns for Scored, On Deck, Development, and Production. Cards can be dragged between columns to advance an idea's status. Uses dnd-kit for pointer and keyboard sensor support.

The **Idea History Timeline** dialog shows a chronological log of events for a specific idea (creation, scoring, charter generation, build events, issue linkage, status changes).

### Scoring Engine

Located at `src/lib/scoring.ts`. Uses a rules-based keyword and heuristic approach — no AI call required for idea scoring. Dimension weights:

| Dimension | Weight | Key Factors |
|-----------|--------|-------------|
| Impact | 30% | People affected, frequency, severity keywords |
| Urgency | 25% | Urgency selector value, blocking/deadline signals |
| Feasibility | 25% | Inverse complexity — fewer constraints = higher score |
| Alignment | 20% | Match with modernization, automation, efficiency keywords |

Scoring weights are adjustable through the Admin panel (Scoring tab).

### Charter Generation

When a user clicks "Generate Charter" on a scored idea, the system calls the Anthropic API (`claude-sonnet-4-20250514`) with a prompt combining the intake answers and score breakdown. The response is a structured JSON charter containing: project overview, objectives, technical approach, acceptance criteria, estimated timeline, and a phased execution plan.

When `VITE_USE_MOCK_DATA=true` (the default) or no API key is provided, a realistic mock charter is generated locally with a simulated 1.5-second delay. This makes the prototype fully demonstrable without any API credentials.

### AI-Driven Issue Reporter

Located in `src/modules/issue-reporter/`. A conversational wizard that guides users through filing a bug or feature request via a chat-like interface. The AI:

- Asks context-appropriate follow-up questions based on the issue type
- Pre-fills structured fields (title, description, severity, steps to reproduce, expected/actual behavior)
- Checks for potential duplicates against existing issues
- Captures a screenshot with an annotation canvas for highlighting problem areas
- Presents a review card before submission

Supports voice dictation throughout. Browser metadata (URL, viewport, user agent) is automatically captured and attached to the report.

### Issue Scoring and Auto-Remediation

Located in `src/modules/issue-scoring/`. Scores submitted issues using configurable dimension weights:

- **Bug scoring:** Severity, blast radius, reproducibility, remediation confidence, recurrence
- **Feature scoring:** User demand, strategic alignment, implementation complexity, impact

When a bug score exceeds the configured remediation threshold, the system can recommend or automatically trigger a remediation agent session. Remediation sessions flow through a queue and can require approval before execution. All weights and thresholds are configurable through the Admin panel (Scoring tab).

### Agent Build Monitor

When a charter reaches the development stage, users can connect to an agent build server via WebSocket and start a build session. Located in `src/components/dev-portal/` and `src/components/production/`, this view provides:

- **Translated feed:** Plain-English summaries of build progress, generated by `src/lib/abstraction-layer.ts` which pattern-matches raw CLI output against translation rules
- **Raw output panel:** Full unfiltered agent output for developers who want technical detail
- **Control bar:** Connect, start, pause, resume, and stop build controls with live status indicator
- **Health indicators:** Session status, error count, elapsed time
- **Translation verbosity:** Configurable in Admin (Build Translation tab) from terse to verbose

### Admin Panel

Accessible at `/admin` by users with the `admin` role. Contains six tabs:

| Tab | Purpose |
|-----|---------|
| Users & Roles | Create, edit, and deactivate user accounts; assign roles |
| Environment Servers | Configure DSP, development, and production agent server connections (host, port, WebSocket path); test connectivity |
| AI Configuration | Set OpenRouter API key; assign AI models per function (charter, scoring, conversation, issue scoring, idea chat, abstraction); enable/disable each function; toggle zero data retention and DoW compliance mode |
| Agents & Skills | Define agent configurations (model, system prompt, tools, max turns) and skills (trigger, instructions, sync targets across environments) |
| Build Translation | Configure abstraction layer verbosity level with a live preview |
| Scoring | Adjust dimension weights for idea scoring, bug scoring, and feature scoring; configure auto-remediation threshold and approval requirements |

### DoW Compliance Mode

When enabled in Admin (AI Configuration tab), DoW compliance mode:

- Forces zero data retention on (and prevents disabling it)
- Replaces all Anthropic model assignments with equivalent OpenAI/non-Anthropic models
- Switches the dev portal model away from Claude
- Injects a DoW Compliance Policy document into the scaffolding package

### Role-Based Permissions

Permissions are enforced in the UI only — there is no server-side enforcement.

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

The sidebar includes a user switcher (prototype simulation) that lets you switch between users to test role-based visibility.

### Voice Dictation

Available on intake wizard text fields, issue report wizard, and build monitor inputs. Uses the Web Speech API (`SpeechRecognition`) via `src/hooks/useDictation.ts`. Supports continuous listening with automatic restart when the browser ends the session due to silence timeout. Requires microphone permission. Chrome and Edge are recommended; Firefox does not support the Web Speech API.

## Design System

Control uses a dark glassmorphism aesthetic. Colors are defined as HSL custom properties in `src/index.css` using the shadcn/ui token system, enabling opacity modifiers throughout.

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `hsl(225, 64%, 11%)` | Page background — deep navy |
| `--card` | `hsl(225, 50%, 15%)` | Card backgrounds — slightly lighter navy |
| `--primary` | `hsl(217, 100%, 61%)` | Primary accent — vivid blue |
| `--active` | `hsl(175, 63%, 47%)` | Teal — running/in-progress states |
| `--completed` | `hsl(142, 71%, 45%)` | Green — success/done states |
| `--error` | `hsl(0, 72%, 51%)` | Red — failed/destructive states |

Key design patterns:

- Cards use `bg-card/50 backdrop-blur-sm` for the glassmorphism effect
- Featured cards have an animated rotating conic-gradient border via CSS `::before` pseudo-element
- Primary action buttons use a three-stop gradient (Blue → Teal → Purple)
- Inputs are bottom-border only with transparent backgrounds (no boxed fields)
- Typography uses Inter variable font at `font-light` weight throughout
- Radix UI `border-radius` is set to `9999px` (pill) for buttons and badges

## Data Persistence

All data lives in `localStorage`. Each Zustand store writes to a dedicated key:

| Store | localStorage Key |
|-------|-----------------|
| Ideas | `control-ideas` |
| Charters | `control-charters` |
| Issues | `control-issues` |
| Activity | `control-activity` |
| Agent Sessions | `control-agent-sessions` |
| Agents & Skills | `control-agents-skills` |
| Scaffolding | `control-scaffolding` |
| Settings (servers, AI) | `control-settings` |
| Users | `control-users` |
| Dev Settings | `control-dev-settings` |
| Reported Issues (module) | `control-reported-issues` |
| Issue Scores (module) | `control-issue-scores` |
| Remediation Settings (module) | `control-remediation-settings` |
| Remediation Sessions (module) | `control-remediation-sessions` |

Data version is tracked under `control-data-version`. Incrementing `DATA_VERSION` in `src/App.tsx` clears all keys above and re-seeds from `src/lib/sample-data.ts` on the next page load.

## Build and Deployment

The app builds to a static `dist/` directory with no server-side rendering or API layer.

```bash
npm run build
```

TypeScript is checked (`tsc -b`) before Vite bundles the output to `dist/`. Serve `dist/` from any static file host or NGINX.

### NGINX Configuration

The dev server runs on port 3940. NGINX handles SSL termination externally. The app does not manage SSL or proxying.

Allowed hosts configured in `vite.config.ts`:

- `lab.ahaus.com`
- `control.ahaus.com`

For production, serve the `dist/` bundle via NGINX with a fallback to `index.html` for client-side routing:

```nginx
location / {
    root /path/to/dist;
    try_files $uri $uri/ /index.html;
}
```

## Known Issues and Limitations

- **No backend:** All data is in `localStorage`. Clearing browser storage loses all data. Multi-user collaboration is not supported — each browser session is independent.
- **Client-side AI calls:** Charter generation makes a direct browser-to-Anthropic API call using `anthropic-dangerous-direct-browser-access: true`. This is prototype behavior only and must not be carried forward to a production integration (the API key would be exposed).
- **OpenRouter key in localStorage:** The OpenRouter key entered in Admin is stored in `localStorage` in plain text. Do not enter production API keys on shared machines.
- **Voice dictation browser support:** Only works in browsers that implement the Web Speech API. Firefox does not support it. Safari support is partial and inconsistent.
- **Remediation agent connection:** The auto-remediation system triggers a build session but requires a real or mock WebSocket server to be available and reachable.
- **No real authentication:** Any user can navigate to any route including `/admin`. The RBAC system controls UI visibility only. In production this would require server-side authentication.
- **localStorage size limit:** Browsers typically limit `localStorage` to 5-10 MB. Heavy use of screenshots in issue reports (stored as base64 data URLs) can fill this quickly.

## Contact

- **Maintainer:** IT Department / Development Team
- **Repository:** Internal — see your Git server
- **Questions:** Contact IT or the development team

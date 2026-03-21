# Control Charter — Revision Notes

## Changes from Initial Draft to Current Version

---

### Project Description

Updated to reflect the full idea-to-production lifecycle. Control is no longer described as just a prioritization and charter generation tool — it now encompasses initiating and monitoring agentic coding builds directly from the interface, managing deployed applications in production, and translating technical agent output into plain English through an abstraction layer.

---

### Tech Stack

Added `websocket` as a dependency under a new `realtime` key. This supports the streaming connection between Control and the client's development server for real-time agent output during builds.

---

### Idea Lifecycle States

The idea status enum changed from four states to five:

**Before:** `new`, `scored`, `charter-generated`, `archived`

**After:** `scored`, `charter-generated`, `in-development`, `production`, `archived`

Removed `new` (ideas enter as `scored` after completing the intake wizard). Added `in-development` and `production` as post-charter states. All status transitions are manual — the client clicks to advance.

---

### Idea Detail View (Adaptive)

The single static idea detail view was replaced with an adaptive view that renders completely different content depending on the idea's current lifecycle state. The route stays the same (`/ideas/:id`) but the UI morphs through four presentations:

**State: scored** — Functions as before. Shows intake answers, composite priority score with four-dimension breakdown (impact, urgency, feasibility, alignment), and actions to generate a charter, edit, archive, or link issues.

**State: charter-generated** — Shows the generated charter and execution plan as the primary focus, with the score breakdown collapsed as secondary context. New actions: start development, regenerate charter, edit idea.

**State: in-development** — The priority score disappears entirely. Replaced by the development portal (see below).

**State: production** — The development portal is replaced by production health indicators and the issue feed (see below).

---

### New Section: Development Portal

Added within the `in-development` state of the idea detail view. This is a control panel for agentic coding sessions with three major components:

**Agent Control Bar** — Prominent strip showing connection status (connected, disconnected, building, paused, error) with colored indicators using the semantic color system. Three controls: Start Build, Pause Build, Stop Build. Controls are contextual — only valid actions are enabled based on current agent state. Start sends the charter and scaffolding to the agent. Pause preserves state for resume. Stop terminates and requires confirmation.

**Translated Activity Feed** — Real-time streaming feed of agent activity translated into plain English. Each entry has a timestamp, plain-language summary, and status icon. Auto-scrolls with scroll-lock when the user scrolls up. Entries are grouped by charter execution plan phases when possible. Entries fade in with subtle animation. Error entries highlighted with the error semantic color.

**Raw Output Panel** — Collapsible panel toggled via a "Technical View" button. Shows actual agent output in monospace with syntax highlighting. Collapsed by default. Scrolls in sync with the translated feed so both views show the same point in the build.

Also includes a collapsible charter reference panel and linked issues list.

---

### New Section: Production Portal

Added within the `production` state of the idea detail view. Replaces the development portal with application health monitoring:

**Health Indicators** — Four metric cards:

- Open Bug Count: number with severity breakdown, color-coded (green 0–2, amber 3–5, red 6+ or any critical)
- Avg Resolution Time: duration display, color-coded (green <3 days, amber 3–7, red >7)
- Feature Request Count: informational, no color coding
- Issue Trend: sparkline or directional arrow showing 30-day volume trend (green decreasing, amber stable, red increasing)

**Issue Feed** — Same issue list component as the main issues view but scoped to this specific project.

**Charter Reference** — Collapsible, read-only. Historical context for what was planned versus what was built.

Actions include filing new issues and returning to development if a major revision is needed.

---

### New Section: Abstraction Layer

Entirely new charter section defining the translation engine that sits between raw agent output and the client-facing feed. Key elements:

**Translation Rules** — Pattern-matching system that maps technical output to plain English. Organized by category (project setup, component creation, testing, errors, deployment). Each rule has a regex-style match pattern and a corresponding translation. Examples:

- `npm install` → "Installing required components"
- `Created src/components/Dashboard.tsx` → "Built the main dashboard view"
- `Error: Module not found. Retrying...` → "Encountered an issue — working through it"
- `14/14 tests passed` → "All quality checks passed"

**Phase Mapping** — Translations are grouped by charter execution plan phases when possible, so the client sees progress against the plan rather than just a stream of activity.

**Fallback** — For unmatched output, a Claude API call translates on the fly. Excluded from prototype scope but architecturally accounted for.

**Prototype Note** — Pattern matching only for the prototype. No API fallback.

---

### New Section: Agent Connection

Entirely new charter section defining the WebSocket protocol between Control and the development server:

**Client-to-Server Messages:** `start-build` (with charter and scaffolding payload), `pause-build`, `resume-build`, `stop-build`

**Server-to-Client Messages:** `agent-output` (raw output line with timestamp), `agent-status` (state changes), `agent-error` (with recoverable flag)

**Prototype Note** — Includes specification for a mock WebSocket server that simulates a realistic 60–90 second build session with phase transitions, realistic timing delays, and at least one error-recovery sequence. Startable via a single npm script.

---

### New Data Model: Agent Session

New model tracking agentic coding sessions:

- Links to parent idea and governing charter
- Status enum: `connecting`, `connected`, `building`, `paused`, `stopped`, `error`, `complete`
- Timestamps for started, paused, stopped, completed
- Stores both translated entries and raw output lines
- Error log for issues encountered during the build

**New Sub-Model: Translated Entry** — Individual entries in the translated feed with timestamp, plain English summary, mapped charter phase, entry type (progress, milestone, error, recovery, complete), and the corresponding raw source.

---

### Data Model: Charter

Removed the `status` field from the charter model. Charter status tracking was previously its own progression (draft → reviewed → in-progress → complete). This is now handled by the parent idea's lifecycle state, which is the single source of truth for where a project stands.

---

### Data Model: Idea

Added `active-session-id` field (string or null) linking to the current agent session when an idea is in the `in-development` state.

---

### Activity Model

Expanded the activity type enum to include new lifecycle events: `idea-scored`, `build-started`, `build-paused`, `build-stopped`, `build-complete`, `moved-to-production`. Added `agent-session` to the entity-type enum.

---

### Scope: Included

Added to prototype scope:

- Adaptive idea detail view with four lifecycle states
- Development portal with agent control bar (start/stop/pause)
- Real-time translated activity feed
- Collapsible raw output panel (Technical View)
- Abstraction layer with pattern-matching translation
- Mock WebSocket server
- Production health indicators
- Manual status transitions across the full lifecycle
- Sample data across all five lifecycle states

---

### Scope: Excluded

Changed: "Integration with external agentic coding tools" replaced with "Live agent connection to actual development servers (mock only for prototype)." Also added "Claude API fallback for abstraction layer translations" to excluded list.

---

### Scope: Sample Data

Expanded from three scored ideas to five ideas across all lifecycle states: one scored at high priority, one with a generated charter, one in-development with a partial mock build session, one in production with associated issues, and one archived. Added a pre-recorded mock build session for development portal demos.

---

### File Structure

**New component directories:**

- `dev-portal/` — Agent control bar, translated feed, raw output panel, phase groupings
- `production/` — Health indicators, issue trend sparkline, production dashboard

**New store:**

- `agent-sessions.ts` — Zustand store for agent sessions and streaming state

**New lib files:**

- `abstraction-layer.ts` — Translation engine with pattern matching
- `agent-connection.ts` — WebSocket client for agent communication

**Updated lib:**

- `sample-data.ts` — Now includes pre-recorded build sessions

**New top-level directory:**

- `mock-server/` — Contains mock WebSocket server entry point, pre-recorded build session data, and README

---

### Setup

Added `ws` to npm install commands. Added three npm scripts: `dev` (standard Vite), `mock-server` (starts the mock WebSocket server), and `demo` (runs both concurrently). Added `VITE_AGENT_WS_URL` environment variable pointing to the mock server by default with override capability for real server connections.

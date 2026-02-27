// Pre-recorded build session events (~75 seconds total)
// Each event has a delay (ms from previous), output line, and optional status change

export interface BuildEvent {
  delay: number
  line?: string
  status?: string
  error?: { message: string; recoverable: boolean }
  complete?: boolean
}

export const buildSession: BuildEvent[] = [
  // Phase 1: Foundation & Data Integration (~0-20s)
  { delay: 500, status: 'building' },
  { delay: 1000, line: 'Initializing project workspace...' },
  { delay: 800, line: 'mkdir -p src/components src/pages src/hooks src/lib src/types src/stores' },
  { delay: 600, line: 'Writing package.json with project dependencies' },
  { delay: 1200, line: 'npm install -- installing 24 packages' },
  { delay: 2000, line: 'npm install complete (24 packages, 0 vulnerabilities)' },
  { delay: 800, line: 'Writing tsconfig.json' },
  { delay: 600, line: 'Writing vite.config.ts' },
  { delay: 600, line: 'Writing tailwind.config.ts' },
  { delay: 800, line: 'Created src/types/index.ts -- data models and type definitions' },
  { delay: 1000, line: 'Created src/lib/utils.ts -- utility functions' },
  { delay: 800, line: 'Writing .env with environment configuration' },
  { delay: 600, line: 'git init && git commit -m "feat: project foundation"' },
  { delay: 1000, line: 'CREATE TABLE JobOperations (Id, JobNum, AssemblySeq, OperSeq, Status)' },
  { delay: 800, line: 'CREATE TABLE OperatorUpdates (Id, JobOperationId, OperatorId, Timestamp)' },
  { delay: 600, line: 'schema/job.graphql -- defining job tracking API schema' },
  { delay: 800, line: 'resolver: job queries and mutations connected' },

  // Phase 2: Operator Interface (~20-40s)
  { delay: 1200, line: 'Created src/components/ui/Button.tsx' },
  { delay: 800, line: 'Created src/components/ui/Card.tsx' },
  { delay: 800, line: 'Created src/components/ui/Badge.tsx' },
  { delay: 1000, line: 'Created src/components/features/JobCard.tsx' },
  { delay: 1200, line: 'Created src/pages/OperatorDashboard.tsx' },
  { delay: 1000, line: 'Created src/components/features/StatusUpdatePanel.tsx' },
  { delay: 800, line: 'Created src/hooks/useJobOperations.ts' },
  { delay: 1000, line: 'Writing barcode scanner integration for job lookup' },
  { delay: 1200, line: 'Created src/components/features/OfflineQueue.tsx' },

  // Error-recovery sequence (~40s mark)
  { delay: 1500, line: 'Error: TypeScript compilation failed -- cannot find module @/stores/jobs' },
  {
    delay: 500,
    error: { message: 'TypeScript compilation error in OperatorDashboard.tsx', recoverable: true },
  },
  { delay: 2000, line: 'fixing: adding missing jobs store module' },
  { delay: 1000, line: 'Created src/stores/jobs.ts -- Zustand job state store' },
  { delay: 800, line: 'retrying TypeScript compilation...' },
  { delay: 1200, line: 'resolved -- all type errors fixed' },

  // Phase 3: Management Dashboard & Alerts (~45-60s)
  { delay: 1000, line: 'Created src/pages/ManagerDashboard.tsx' },
  { delay: 1200, line: 'Created src/components/features/LiveJobGrid.tsx' },
  { delay: 1000, line: 'WebSocket server configured for real-time status updates' },
  { delay: 800, line: 'Created src/components/features/AlertRulesEngine.tsx' },
  { delay: 1000, line: 'Created src/components/features/ThroughputMetrics.tsx' },
  { delay: 800, line: 'Created src/hooks/useWebSocketUpdates.ts' },

  // Phase 4: Testing & Build (~60-75s)
  { delay: 1200, line: 'Running test suite...' },
  { delay: 800, line: 'PASS src/stores/jobs.test.ts' },
  { delay: 600, line: 'PASS src/hooks/useJobOperations.test.ts' },
  { delay: 600, line: 'PASS src/components/features/StatusUpdatePanel.test.ts' },
  { delay: 800, line: '12/12 tests passed' },
  { delay: 600, line: 'linting pass -- 0 errors, 0 warnings' },
  { delay: 800, line: 'typecheck -- no type errors' },
  { delay: 1000, line: 'vite build -- building for production...' },
  { delay: 2000, line: 'bundle size: 142.3 kB (gzip: 45.8 kB)' },
  { delay: 800, line: 'Build complete -- all phases finished' },
  { delay: 500, line: 'git commit -m "feat: shop floor job tracking application complete"' },
  { delay: 500, complete: true },
]

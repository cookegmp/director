import type {
  Idea,
  Charter,
  Issue,
  Activity,
  ScaffoldingDocument,
} from '@/types';

// ============================================================================
// AHAUS Tool & Engineering — Sample Data
// Fictional manufacturing company demo data for StageManager prototype
// ============================================================================

const NOW = new Date();
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86400000).toISOString();
// --- IDEAS ---

export const sampleIdeas: Idea[] = [
  {
    id: 'idea-001',
    title: 'Automate shop floor job status tracking to eliminate manual traveler updates',
    status: 'charter-generated',
    intakeAnswers: {
      problem: 'Shop floor operators manually update paper travelers for each job operation. Status is often hours behind reality, leading to confusion about which jobs are ready for the next step. Production managers spend 30+ minutes per day just walking the floor to check job statuses.',
      impact: 'Affects the entire production floor — approximately 40 operators, 5 production managers, and the scheduling team. Issues occur daily on every active job. Downstream effects include missed delivery dates and inefficient machine utilization because the next job isn\'t staged on time.',
      'current-state': 'Paper-based travelers that follow each job through the shop. Operators are supposed to log completion times but often forget or delay. A spreadsheet is maintained by the lead scheduler but is always outdated. Epicor has job tracking but shop floor adoption is near zero because the interface is too slow.',
      'desired-outcome': 'Real-time visibility into every job operation status. Operators can tap to update status in seconds. Production managers see a live dashboard. Automatic alerts when jobs are blocked or behind schedule. Integration with Epicor for bidirectional status sync.',
      constraints: 'Must integrate with existing Epicor Kinetic ERP. Needs to work on shop floor tablets (mounted on machines). Limited IT bandwidth for infrastructure changes. Cannot disrupt current production during rollout.',
      urgency: 'Causing daily friction',
    },
    scores: { impact: 88, urgency: 75, feasibility: 72, alignment: 85 },
    compositeScore: 80.6,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
    linkedCharterId: 'charter-001',
    linkedIssueIds: ['issue-001', 'issue-003'],
  },
  {
    id: 'idea-002',
    title: 'Digital quote builder with automated pricing calculations',
    status: 'scored',
    intakeAnswers: {
      problem: 'Sales engineers spend 2-4 hours building each quote in Excel. Pricing calculations are inconsistent because each engineer has their own spreadsheet templates with different rate tables. Quotes sometimes go out with errors in material cost calculations.',
      impact: 'Affects the 3-person sales engineering team and impacts customer response time. On average, 5-8 quotes per week are generated. Slow turnaround and pricing errors have directly led to lost opportunities.',
      'current-state': 'Excel spreadsheets with manually updated rate tables. Each engineer maintains their own version. No centralized pricing database. Quotes are emailed as PDF attachments with no tracking of win/loss rates.',
      'desired-outcome': 'A unified quote builder with centralized rate tables that auto-calculate material, labor, and overhead costs. Version-controlled templates. Ability to track quote status and win/loss metrics. Integration with Salesforce for opportunity tracking.',
      constraints: 'Must integrate with Salesforce CRM. Needs to support complex BOM (bill of materials) structures. Must handle both standard pricing and custom project-based quotes.',
      urgency: 'Causing daily friction',
    },
    scores: { impact: 75, urgency: 70, feasibility: 65, alignment: 78 },
    compositeScore: 72.1,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    linkedCharterId: null,
    linkedIssueIds: [],
  },
  {
    id: 'idea-003',
    title: 'Predictive maintenance alerts for CNC machines',
    status: 'scored',
    intakeAnswers: {
      problem: 'CNC machines occasionally go down for unplanned maintenance, causing job delays and idle labor. Currently there\'s no systematic way to predict when maintenance is needed beyond calendar-based schedules that don\'t account for actual usage.',
      impact: 'Affects the machining department (15 CNC machines, 20 operators). Unplanned downtime occurs roughly once a month per machine. Each incident costs approximately $2,000-$5,000 in lost productivity and emergency repair costs.',
      'current-state': 'Calendar-based maintenance schedules. Operators report issues verbally. No data collection on machine health indicators. Maintenance history is tracked in Epicor but not analyzed for patterns.',
      'desired-outcome': 'Collect machine runtime data and health indicators. Predict maintenance needs based on actual usage patterns. Alert maintenance team before failures occur. Reduce unplanned downtime by 50%+.',
      constraints: 'Many machines are older and may not have modern monitoring capabilities. Limited budget for sensor hardware. Needs to work with FANUC and other controller types.',
      urgency: 'Would improve efficiency',
    },
    scores: { impact: 65, urgency: 50, feasibility: 45, alignment: 70 },
    compositeScore: 57.5,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
    linkedCharterId: null,
    linkedIssueIds: [],
  },
];

// --- CHARTERS ---

export const sampleCharters: Charter[] = [
  {
    id: 'charter-001',
    ideaId: 'idea-001',
    title: 'Automate shop floor job status tracking to eliminate manual traveler updates',
    status: 'draft',
    scaffoldingRefs: ['company-context', 'technology-preferences', 'quality-standards'],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    linkedIssueIds: ['issue-001', 'issue-003'],
    content: {
      projectOverview: 'This project will build a real-time job status tracking system for the AHAUS shop floor, replacing the current paper-based traveler system. The application will enable operators to update job operation status with a single tap on shop floor tablets, provide production managers with a live dashboard of all active jobs, and integrate bidirectionally with Epicor Kinetic ERP for scheduling and reporting.',
      objectives: [
        'Eliminate paper travelers by providing digital, real-time job status updates from the shop floor',
        'Reduce production manager "floor walks" from 30+ minutes daily to near-zero by providing live status dashboards',
        'Achieve bidirectional integration with Epicor Kinetic for job operations and status synchronization',
        'Provide automated alerts when jobs are blocked, behind schedule, or approaching due dates',
        'Ensure the system works reliably on shop floor tablet devices mounted on machines',
      ],
      technicalApproach: 'The solution will be built as a responsive web application using React with TypeScript for the frontend, optimized for touch interaction on shop floor tablets. The backend will use Node.js with GraphQL (Apollo Server) to provide flexible data querying. MS SQL Server will store operational data with a read-only connection to Epicor\'s database for job and operation information. Real-time updates will use WebSocket connections to push status changes to all connected dashboards instantly.',
      acceptanceCriteria: [
        'Operators can update job operation status in under 3 seconds (tap-to-complete)',
        'Dashboard accurately reflects current job statuses within 5 seconds of an update',
        'Epicor job data syncs automatically every 5 minutes (configurable)',
        'System sends alerts for blocked and overdue jobs via the notification system',
        'Application is functional and responsive on 10-inch shop floor tablets',
        'No data loss during network interruptions — offline queue with auto-retry',
      ],
      estimatedTimeline: '8 weeks for initial prototype, 14 weeks for production deployment',
      executionPlan: [
        {
          phase: 'Foundation & Data Integration',
          tasks: [
            'Set up project infrastructure with CI/CD pipeline',
            'Design database schema for job tracking and operator interactions',
            'Build Epicor read-only data access layer for jobs, assemblies, and operations',
            'Implement authentication via Azure AD with shop floor device support',
          ],
          duration: '2 weeks',
          dependencies: [],
        },
        {
          phase: 'Operator Interface',
          tasks: [
            'Build touch-optimized operator status update screen',
            'Implement job search and barcode/QR scanning for quick job lookup',
            'Create operation checklist and completion workflow',
            'Build offline queue for updates during network interruptions',
          ],
          duration: '3 weeks',
          dependencies: ['Foundation & Data Integration'],
        },
        {
          phase: 'Management Dashboard & Alerts',
          tasks: [
            'Build real-time job status dashboard with filtering and sorting',
            'Implement WebSocket-based live updates across all connected clients',
            'Create alert rules engine for blocked, overdue, and priority jobs',
            'Build reporting views for throughput metrics and bottleneck analysis',
          ],
          duration: '2 weeks',
          dependencies: ['Operator Interface'],
        },
        {
          phase: 'Deployment & Training',
          tasks: [
            'Configure production environment and shop floor tablets',
            'Conduct pilot with one production cell before full rollout',
            'Create operator quick-reference guide for shop floor posting',
            'Train production managers on dashboard and alert configuration',
          ],
          duration: '1 week',
          dependencies: ['Management Dashboard & Alerts'],
        },
      ],
    },
  },
];

// --- ISSUES ---

export const sampleIssues: Issue[] = [
  {
    id: 'issue-001',
    type: 'bug',
    title: 'Epicor job import shows duplicate operations for split jobs',
    description: 'When a job has been split in Epicor (e.g., Job 12345.1 and 12345.2), the data import is pulling operations from both splits and displaying them under a single job. This causes the operator screen to show more operations than actually exist for their specific job split.',
    severity: 'high',
    status: 'open',
    projectId: 'charter-001',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    comments: [
      {
        id: 'comment-001',
        author: 'Mark Price',
        content: 'This might be related to how we\'re joining on JobNum without filtering by AssemblySeq. Need to check the query.',
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    id: 'issue-002',
    type: 'feature-request',
    title: 'Add operator shift handoff notes',
    description: 'Operators requested the ability to leave notes for the next shift when a job is in-progress but not completed. Currently they write on sticky notes attached to the machine.',
    severity: 'medium',
    status: 'open',
    projectId: 'charter-001',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    comments: [],
  },
  {
    id: 'issue-003',
    type: 'bug',
    title: 'Dashboard load time exceeds 10 seconds with 200+ active jobs',
    description: 'When there are more than 200 active jobs displayed on the production dashboard, the initial load takes over 10 seconds. This is likely due to loading all jobs and operations in a single query without pagination.',
    severity: 'high',
    status: 'in-progress',
    projectId: 'charter-001',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
    comments: [
      {
        id: 'comment-002',
        author: 'Dev Team',
        content: 'Implementing cursor-based pagination. Should resolve once we batch operations loading with DataLoader.',
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    id: 'issue-004',
    type: 'feature-request',
    title: 'Export weekly schedule report as PDF',
    description: 'Production managers want to print a weekly schedule report that shows all jobs organized by machine/workcenter. This is for their morning standup meetings where not everyone has a tablet handy.',
    severity: 'low',
    status: 'open',
    projectId: null,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
    comments: [],
  },
  {
    id: 'issue-005',
    type: 'bug',
    title: 'Login session expires during shift causing operators to re-authenticate',
    description: 'Operators report being logged out mid-shift and having to re-authenticate. This is disruptive on shop floor tablets where typing credentials is slow. Session should persist for at least 12 hours for shop floor devices.',
    severity: 'critical',
    status: 'resolved',
    projectId: 'charter-001',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(3),
    comments: [
      {
        id: 'comment-003',
        author: 'Dev Team',
        content: 'Fixed by extending token refresh window to 12 hours for devices identified as shop floor tablets. Deployed to production.',
        createdAt: daysAgo(3),
      },
    ],
  },
];

// --- ACTIVITIES ---

export const sampleActivities: Activity[] = [
  {
    id: 'act-001',
    type: 'idea-created',
    entityId: 'idea-001',
    entityType: 'idea',
    summary: 'New idea scored: "Automate shop floor job status tracking" (81)',
    createdAt: daysAgo(5),
  },
  {
    id: 'act-002',
    type: 'charter-generated',
    entityId: 'charter-001',
    entityType: 'charter',
    summary: 'Charter generated for "Automate shop floor job status tracking"',
    createdAt: daysAgo(3),
  },
  {
    id: 'act-003',
    type: 'issue-filed',
    entityId: 'issue-001',
    entityType: 'issue',
    summary: 'New bug report: "Epicor job import shows duplicate operations"',
    createdAt: daysAgo(2),
  },
  {
    id: 'act-004',
    type: 'idea-created',
    entityId: 'idea-002',
    entityType: 'idea',
    summary: 'New idea scored: "Digital quote builder" (72)',
    createdAt: daysAgo(8),
  },
  {
    id: 'act-005',
    type: 'issue-filed',
    entityId: 'issue-005',
    entityType: 'issue',
    summary: 'Bug resolved: "Login session expires during shift"',
    createdAt: daysAgo(3),
  },
  {
    id: 'act-006',
    type: 'status-changed',
    entityId: 'issue-003',
    entityType: 'issue',
    summary: 'Issue "Dashboard load time" moved to in-progress',
    createdAt: daysAgo(1),
  },
  {
    id: 'act-007',
    type: 'idea-created',
    entityId: 'idea-003',
    entityType: 'idea',
    summary: 'New idea scored: "Predictive maintenance alerts for CNC" (58)',
    createdAt: daysAgo(12),
  },
  {
    id: 'act-008',
    type: 'issue-filed',
    entityId: 'issue-002',
    entityType: 'issue',
    summary: 'Feature request: "Add operator shift handoff notes"',
    createdAt: daysAgo(4),
  },
];

// --- SCAFFOLDING DOCUMENTS ---

export const sampleScaffolding: ScaffoldingDocument[] = [
  {
    id: 'scaffold-001',
    type: 'company-context',
    title: 'AHAUS Tool & Engineering — Company Context',
    lastUpdated: daysAgo(30),
    content: `AHAUS Tool & Engineering is a custom manufacturing company founded in 1946, located in Richmond, Indiana. The company specializes in automation equipment, workholding solutions, and precision machining with approximately 100 employees operating in a 100,000 square foot facility.

## Core Services

- Custom automation equipment design and manufacturing
- Workholding fixtures for machining, assembly, and inspection
- Controls and robotics integration (FANUC Certified)
- Precision CNC machining to .0002 inch tolerances
- Full engineering and design services

## Industries Served

The company serves aerospace, automotive, medical technologies, energy, agriculture, heavy truck, and consumer products industries. Medical manufacturing expertise spans 25+ years with elevated precision and documentation standards.

## Key Systems

- Epicor Kinetic — ERP system for production planning, inventory, and job costing
- Salesforce — CRM for customer and opportunity management
- Microsoft 365 — Email, SharePoint, collaboration
- SolidWorks — Mechanical and electrical CAD/CAM
- ISO 9001:2015 certified quality management system

## Leadership

- Rick Ahaus, Chairman of the Board
- Kevin Ahaus, President
- Jeff Sheridan, Vice President
- Mark Price, Engineering Operations Manager`,
  },
  {
    id: 'scaffold-002',
    type: 'technology-preferences',
    title: 'Technology Standards & Preferences',
    lastUpdated: daysAgo(30),
    content: `## Core Stack

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js with GraphQL (Apollo Server)
- Primary Database: MS SQL Server 2019 (on-premises)
- Vector/Embeddings: PostgreSQL + pgvector (when needed)
- AI Provider: OpenRouter (Claude Sonnet 4.5 default)
- Authentication: Azure AD / Microsoft Entra ID via MSAL

## Infrastructure

- Production: Docker containers on Ubuntu-based servers
- Development: Ubuntu Linux workstations
- SSL: NGINX reverse proxy handles all SSL termination
- Hosting: On-premises servers, internal network with VPN access

## Package Preferences

- Validation: Zod for type-safe schema validation
- State Management: Zustand for React applications
- Data Fetching: Apollo Client for GraphQL
- Icons: Lucide React
- Dates: date-fns for lightweight date utilities

## Standards

- TypeScript strict mode on all projects
- ESLint + Prettier for code formatting
- Conventional commits (feat/fix/docs/refactor)
- Feature branch workflow with PR reviews`,
  },
  {
    id: 'scaffold-003',
    type: 'brand-standards',
    title: 'Visual Identity & Brand Standards',
    lastUpdated: daysAgo(30),
    content: `## Brand Colors

- Primary: AHAUS Orange (#FF6F20)
- Secondary: Black (#111111)
- Backgrounds: Light gray (#F5F5F5) for pages, white for cards
- Text: Charcoal (#333333) for headings, dark gray (#666666) for body

## Typography

- Primary font: Inter (sans-serif)
- Monospace: JetBrains Mono for technical values
- Heading weight: font-semibold
- Body weight: font-normal

## Design Principles

- Modern, clean, and functional interfaces
- Data-first — content and information take priority
- Generous whitespace and clear visual hierarchy
- Cards with subtle shadows on white backgrounds
- Orange (#FF6F20) reserved for primary actions and CTAs
- Accessible contrast ratios (4.5:1 minimum)

## Logo Usage

- Dark logo on light backgrounds
- Light logo on dark backgrounds (headers, footers)
- Minimum width: 120px
- Minimum clear space: 16px on all sides`,
  },
  {
    id: 'scaffold-004',
    type: 'security-patterns',
    title: 'Security & Authentication Patterns',
    lastUpdated: daysAgo(30),
    content: `## Authentication

All web applications use Azure AD (Microsoft Entra ID) via MSAL for single sign-on. Single-tenant configuration with stateless token validation.

## Key Patterns

- Tokens stored in httpOnly cookies — not accessible to JavaScript
- Development bypass mode available with AUTH_BYPASS=true (disabled in production)
- Group-based authorization for role management
- Session tokens valid for 1 hour with automatic refresh (12 hours for shop floor devices)

## Data Protection

- All customer designs, specifications, and pricing are confidential
- Medical device projects require elevated documentation and traceability
- No public internet exposure — applications are internal-facing only
- Database connections use parameterized queries exclusively (no string concatenation)
- SQL injection prevention through prepared statements

## Compliance

- ISO 9001:2015 quality management system
- ITAR awareness for defense-related projects
- Medical device documentation standards for applicable projects`,
  },
  {
    id: 'scaffold-005',
    type: 'quality-standards',
    title: 'Quality & Development Standards',
    lastUpdated: daysAgo(30),
    content: `## Code Quality

- TypeScript strict mode required on all projects
- ESLint with recommended TypeScript rules
- Prettier for consistent formatting
- No explicit "any" types without justification
- Consistent type imports (import type { ... })

## Testing Approach

- Unit tests for business logic and utility functions
- Integration tests for API endpoints and database queries
- End-to-end tests for critical user workflows
- Test data factories instead of hardcoded fixtures

## Documentation

- README.md for every project with setup instructions
- Charter documents for all new development initiatives
- Inline comments only where behavior is non-obvious
- TSDoc for exported functions and public APIs

## Git Workflow

- Feature branch workflow (feature/, bugfix/, hotfix/)
- Conventional commit messages (feat, fix, docs, refactor)
- Pull request reviews required before merge
- No force-pushing to main/master branches

## Quality Objectives (from ISO)

- On-time delivery
- Low warranty cost
- Low rework cost
- Sustainable cost of goods sold`,
  },
];

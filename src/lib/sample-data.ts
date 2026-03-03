import type {
  Idea,
  Charter,
  Issue,
  Activity,
  ScaffoldingDocument,
  AgentSession,
  User,
  EnvironmentServer,
  AISettings,
} from '@/types'
import type { IssueScore, RemediationSession } from '@/modules/issue-scoring/types'

// ============================================================================
// AHAUS Tool & Engineering — Sample Data
// Fictional manufacturing company demo data for StageManager prototype
// ============================================================================

const NOW = new Date()
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86400000).toISOString()
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3600000).toISOString()

// --- IDEAS ---

export const sampleIdeas: Idea[] = [
  {
    id: 'idea-001',
    title: 'Automate shop floor job status tracking to eliminate manual traveler updates',
    status: 'production',
    intakeAnswers: {
      problem:
        'Shop floor operators manually update paper travelers for each job operation. Status is often hours behind reality, leading to confusion about which jobs are ready for the next step. Production managers spend 30+ minutes per day just walking the floor to check job statuses.',
      impact:
        "Affects the entire production floor — approximately 40 operators, 5 production managers, and the scheduling team. Issues occur daily on every active job. Downstream effects include missed delivery dates and inefficient machine utilization because the next job isn't staged on time.",
      'current-state':
        'Paper-based travelers that follow each job through the shop. Operators are supposed to log completion times but often forget or delay. A spreadsheet is maintained by the lead scheduler but is always outdated. Epicor has job tracking but shop floor adoption is near zero because the interface is too slow.',
      'desired-outcome':
        'Real-time visibility into every job operation status. Operators can tap to update status in seconds. Production managers see a live dashboard. Automatic alerts when jobs are blocked or behind schedule. Integration with Epicor for bidirectional status sync.',
      constraints:
        'Must integrate with existing Epicor Kinetic ERP. Needs to work on shop floor tablets (mounted on machines). Limited IT bandwidth for infrastructure changes. Cannot disrupt current production during rollout.',
      urgency: 'Causing daily friction',
    },
    scores: { impact: 88, urgency: 75, feasibility: 72, alignment: 85 },
    compositeScore: 80.6,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2),
    linkedCharterId: 'charter-001',
    linkedIssueIds: ['issue-001', 'issue-002', 'issue-003', 'issue-005', 'issue-006', 'issue-007'],
    activeSessionId: null,
    sortOrder: 0,
  },
  {
    id: 'idea-002',
    title: 'Digital quote builder with automated pricing calculations',
    status: 'scored',
    intakeAnswers: {
      problem:
        'Sales engineers spend 2-4 hours building each quote in Excel. Pricing calculations are inconsistent because each engineer has their own spreadsheet templates with different rate tables. Quotes sometimes go out with errors in material cost calculations.',
      impact:
        'Affects the 3-person sales engineering team and impacts customer response time. On average, 5-8 quotes per week are generated. Slow turnaround and pricing errors have directly led to lost opportunities.',
      'current-state':
        'Excel spreadsheets with manually updated rate tables. Each engineer maintains their own version. No centralized pricing database. Quotes are emailed as PDF attachments with no tracking of win/loss rates.',
      'desired-outcome':
        'A unified quote builder with centralized rate tables that auto-calculate material, labor, and overhead costs. Version-controlled templates. Ability to track quote status and win/loss metrics. Integration with Salesforce for opportunity tracking.',
      constraints:
        'Must integrate with Salesforce CRM. Needs to support complex BOM (bill of materials) structures. Must handle both standard pricing and custom project-based quotes.',
      urgency: 'Causing daily friction',
    },
    scores: { impact: 75, urgency: 70, feasibility: 65, alignment: 78 },
    compositeScore: 72.1,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    linkedCharterId: null,
    linkedIssueIds: [],
    activeSessionId: null,
    sortOrder: 0,
  },
  {
    id: 'idea-003',
    title: 'Predictive maintenance alerts for CNC machines',
    status: 'archived',
    intakeAnswers: {
      problem:
        "CNC machines occasionally go down for unplanned maintenance, causing job delays and idle labor. Currently there's no systematic way to predict when maintenance is needed beyond calendar-based schedules that don't account for actual usage.",
      impact:
        'Affects the machining department (15 CNC machines, 20 operators). Unplanned downtime occurs roughly once a month per machine. Each incident costs approximately $2,000-$5,000 in lost productivity and emergency repair costs.',
      'current-state':
        'Calendar-based maintenance schedules. Operators report issues verbally. No data collection on machine health indicators. Maintenance history is tracked in Epicor but not analyzed for patterns.',
      'desired-outcome':
        'Collect machine runtime data and health indicators. Predict maintenance needs based on actual usage patterns. Alert maintenance team before failures occur. Reduce unplanned downtime by 50%+.',
      constraints:
        'Many machines are older and may not have modern monitoring capabilities. Limited budget for sensor hardware. Needs to work with FANUC and other controller types.',
      urgency: 'Would improve efficiency',
    },
    scores: { impact: 65, urgency: 50, feasibility: 45, alignment: 70 },
    compositeScore: 57.5,
    createdAt: daysAgo(40),
    updatedAt: daysAgo(15),
    linkedCharterId: null,
    linkedIssueIds: [],
    activeSessionId: null,
    sortOrder: 0,
  },
  {
    id: 'idea-004',
    title: 'Engineering document search portal for QMS and SharePoint',
    status: 'on-deck',
    intakeAnswers: {
      problem:
        "Engineers and quality personnel spend significant time searching for documents across SharePoint, network shares, and the QMS system. There's no unified search — you have to know which system a document lives in before you can find it.",
      impact:
        'Affects all 15+ engineers, the quality team (4 people), and project managers. Document searches happen 10-20 times per day per person. Estimated 30-60 minutes of wasted time daily across the team.',
      'current-state':
        'Documents are spread across SharePoint Online, network file shares (SMB), and a folder-based QMS system. Each has its own search mechanism. No cross-system search capability. File naming conventions are inconsistent.',
      'desired-outcome':
        'A single search interface that queries all document repositories. Results ranked by relevance. Preview documents without opening. Filter by document type, project, date range. Bookmark frequently accessed documents.',
      constraints:
        'Must integrate with Microsoft 365 / SharePoint API. Read-only access to network shares. Must respect existing access permissions. Cannot modify the underlying document storage systems.',
      urgency: 'Causing daily friction',
    },
    scores: { impact: 82, urgency: 72, feasibility: 68, alignment: 80 },
    compositeScore: 76.2,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(4),
    linkedCharterId: 'charter-002',
    linkedIssueIds: [],
    activeSessionId: null,
    sortOrder: 0,
  },
  {
    id: 'idea-005',
    title: 'Customer specification analysis tool with AI-powered extraction',
    status: 'development',
    intakeAnswers: {
      problem:
        'When customers send RFQs, engineers manually read through specification documents (often 50-200 pages) to extract relevant requirements. This is time-consuming and error-prone — critical specs are sometimes missed.',
      impact:
        'Affects the quoting process for every new project. Each RFQ review takes 2-6 hours of engineer time. Missing a spec during review can lead to costly rework or project overruns. Approximately 3-5 RFQs received per week.',
      'current-state':
        "Engineers manually read PDF/DOCX specifications, highlighting key requirements and transcribing them into project requirement documents. Some use ctrl+F to search but there's no structured extraction.",
      'desired-outcome':
        'Upload a customer spec document. AI extracts key requirements: materials, tolerances, surface finishes, testing requirements, certifications needed, delivery requirements. Structured output that can be reviewed and exported to project planning.',
      constraints:
        'Must handle PDF and DOCX formats. Customer documents are confidential and must stay on-premises. Extraction accuracy must be verifiable — engineers review AI output. Must handle GD&T notation and manufacturing-specific terminology.',
      urgency: 'Would improve efficiency',
    },
    scores: { impact: 78, urgency: 60, feasibility: 55, alignment: 82 },
    compositeScore: 69.3,
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
    linkedCharterId: 'charter-003',
    linkedIssueIds: [],
    activeSessionId: 'session-001',
    sortOrder: 0,
  },
]

// --- CHARTERS ---

export const sampleCharters: Charter[] = [
  {
    id: 'charter-001',
    ideaId: 'idea-001',
    title: 'Automate shop floor job status tracking to eliminate manual traveler updates',
    scaffoldingRefs: ['company-context', 'technology-preferences', 'quality-standards'],
    createdAt: daysAgo(25),
    updatedAt: daysAgo(5),
    linkedIssueIds: ['issue-001', 'issue-002', 'issue-003', 'issue-005', 'issue-006', 'issue-007'],
    content: {
      projectOverview:
        'This project will build a real-time job status tracking system for the AHAUS shop floor, replacing the current paper-based traveler system. The application will enable operators to update job operation status with a single tap on shop floor tablets, provide production managers with a live dashboard of all active jobs, and integrate bidirectionally with Epicor Kinetic ERP for scheduling and reporting.',
      objectives: [
        'Eliminate paper travelers by providing digital, real-time job status updates from the shop floor',
        'Reduce production manager "floor walks" from 30+ minutes daily to near-zero by providing live status dashboards',
        'Achieve bidirectional integration with Epicor Kinetic for job operations and status synchronization',
        'Provide automated alerts when jobs are blocked, behind schedule, or approaching due dates',
        'Ensure the system works reliably on shop floor tablet devices mounted on machines',
      ],
      technicalApproach:
        "The solution will be built as a responsive web application using React with TypeScript for the frontend, optimized for touch interaction on shop floor tablets. The backend will use Node.js with GraphQL (Apollo Server) to provide flexible data querying. MS SQL Server will store operational data with a read-only connection to Epicor's database for job and operation information. Real-time updates will use WebSocket connections to push status changes to all connected dashboards instantly.",
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
  {
    id: 'charter-002',
    ideaId: 'idea-004',
    title: 'Engineering document search portal for QMS and SharePoint',
    scaffoldingRefs: ['company-context', 'technology-preferences', 'security-patterns'],
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    linkedIssueIds: [],
    content: {
      projectOverview:
        'Build a unified document search portal that provides a single search interface across SharePoint Online, network file shares, and the QMS document system. The portal will index metadata and content from all sources, enabling engineers and quality personnel to find any document quickly regardless of where it is stored.',
      objectives: [
        'Provide a single search interface for documents across SharePoint, network shares, and QMS',
        'Return search results ranked by relevance with document previews',
        'Support filtering by document type, project, date range, and source system',
        'Respect existing access permissions from source systems',
        'Enable bookmarking and recent document history for quick access',
      ],
      technicalApproach:
        'The application will use React with TypeScript for the frontend with a Node.js GraphQL backend. Microsoft Graph API will handle SharePoint document access. Network share indexing will use a background service that periodically scans configured paths. Document metadata will be stored in MS SQL Server with full-text search capabilities. For enhanced search, document content will be extracted and indexed for keyword matching.',
      acceptanceCriteria: [
        'Search returns results from all three document sources within 2 seconds',
        'Document previews display without downloading the full document',
        'Access control from source systems is respected — users only see documents they can access',
        'Search supports common engineering document terms including part numbers and drawing references',
        'Bookmarked documents are accessible in one click from the dashboard',
      ],
      estimatedTimeline:
        '6 weeks for MVP with SharePoint integration, 10 weeks for full multi-source support',
      executionPlan: [
        {
          phase: 'Search Infrastructure',
          tasks: [
            'Set up project with React frontend and Node.js/GraphQL backend',
            'Implement Microsoft Graph API integration for SharePoint document access',
            'Design search index schema in MS SQL Server with full-text search',
            'Build authentication flow with Azure AD and permission mapping',
          ],
          duration: '2 weeks',
          dependencies: [],
        },
        {
          phase: 'Search Interface',
          tasks: [
            'Build search bar with auto-complete and suggestion support',
            'Create search results page with relevance ranking and snippets',
            'Implement document preview panel using Microsoft Graph file preview',
            'Add filters for document type, project, date range, and source',
          ],
          duration: '2 weeks',
          dependencies: ['Search Infrastructure'],
        },
        {
          phase: 'Network Share Integration',
          tasks: [
            'Build background indexer service for SMB network share scanning',
            'Implement file metadata extraction (PDF, DOCX, DXF, SolidWorks)',
            'Add network share results to unified search index',
            'Configure scheduled re-indexing with change detection',
          ],
          duration: '2 weeks',
          dependencies: ['Search Interface'],
        },
      ],
    },
  },
  {
    id: 'charter-003',
    ideaId: 'idea-005',
    title: 'Customer specification analysis tool with AI-powered extraction',
    scaffoldingRefs: [
      'company-context',
      'technology-preferences',
      'security-patterns',
      'quality-standards',
    ],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    linkedIssueIds: [],
    content: {
      projectOverview:
        'Develop an AI-powered tool that accepts customer specification documents (PDF/DOCX), extracts key manufacturing requirements using LLM analysis, and presents structured output for engineer review. The tool will identify materials, tolerances, surface finishes, testing requirements, certifications, and delivery specifications, dramatically reducing RFQ review time.',
      objectives: [
        'Accept PDF and DOCX specification documents for automated analysis',
        'Extract structured requirements: materials, tolerances, surface finishes, testing, certifications',
        'Present extracted data in a reviewable, editable format for engineer validation',
        'Handle manufacturing-specific terminology and GD&T notation',
        'Keep all document processing on-premises for customer data confidentiality',
      ],
      technicalApproach:
        'The frontend will use React with TypeScript for the upload and review interface. The backend uses Node.js with document parsing (pdf-parse, mammoth) for text extraction, then sends content to Claude via OpenRouter for structured requirement extraction. Extraction results are stored in MS SQL Server. The system uses prompt engineering with manufacturing domain context to improve extraction accuracy.',
      acceptanceCriteria: [
        'Successfully extracts requirements from 90%+ of customer specification formats',
        'Extraction results are presented within 60 seconds of document upload',
        'Engineers can review, edit, and approve extracted requirements before finalizing',
        'System correctly identifies GD&T symbols and tolerance callouts',
        'Exported requirement lists can be used in project planning documents',
        'All document processing stays on-premises — no customer data sent to external services',
      ],
      estimatedTimeline: '5 weeks for core extraction, 8 weeks for full review workflow',
      executionPlan: [
        {
          phase: 'Document Processing Foundation',
          tasks: [
            'Set up project infrastructure with document upload API',
            'Implement PDF and DOCX text extraction pipeline',
            'Build document chunking strategy for LLM context windows',
            'Configure OpenRouter integration with extraction prompt templates',
          ],
          duration: '2 weeks',
          dependencies: [],
        },
        {
          phase: 'AI Extraction Engine',
          tasks: [
            'Design extraction prompt with manufacturing domain knowledge',
            'Build structured output parser for requirement categorization',
            'Implement GD&T notation recognition and tolerance extraction',
            'Add confidence scoring for extracted requirements',
          ],
          duration: '2 weeks',
          dependencies: ['Document Processing Foundation'],
        },
        {
          phase: 'Review Interface',
          tasks: [
            'Build document upload and processing status UI',
            'Create requirement review and editing interface',
            'Implement approval workflow with export to project planning format',
            'Add extraction history and document comparison features',
          ],
          duration: '2 weeks',
          dependencies: ['AI Extraction Engine'],
        },
      ],
    },
  },
]

// --- AGENT SESSIONS ---

export const sampleAgentSessions: AgentSession[] = [
  {
    id: 'session-001',
    ideaId: 'idea-005',
    charterId: 'charter-003',
    status: 'paused',
    createdAt: daysAgo(1),
    connectedAt: hoursAgo(20),
    completedAt: null,
    stoppedAt: null,
    translatedEntries: [
      {
        id: 'te-001',
        timestamp: hoursAgo(20),
        summary: 'Installing required components',
        type: 'progress',
        phase: 'Document Processing Foundation',
        rawLineIndex: 0,
      },
      {
        id: 'te-002',
        timestamp: hoursAgo(20),
        summary: 'Setting up project structure',
        type: 'progress',
        phase: 'Document Processing Foundation',
        rawLineIndex: 1,
      },
      {
        id: 'te-003',
        timestamp: hoursAgo(19.5),
        summary: 'Configuring build system',
        type: 'progress',
        phase: 'Document Processing Foundation',
        rawLineIndex: 2,
      },
      {
        id: 'te-004',
        timestamp: hoursAgo(19),
        summary: 'Setting up TypeScript configuration',
        type: 'progress',
        phase: 'Document Processing Foundation',
        rawLineIndex: 3,
      },
      {
        id: 'te-005',
        timestamp: hoursAgo(18.5),
        summary: 'Built the upload API endpoint',
        type: 'milestone',
        phase: 'Document Processing Foundation',
        rawLineIndex: 4,
      },
      {
        id: 'te-006',
        timestamp: hoursAgo(18),
        summary: 'Created PDF text extraction pipeline',
        type: 'milestone',
        phase: 'Document Processing Foundation',
        rawLineIndex: 5,
      },
      {
        id: 'te-007',
        timestamp: hoursAgo(17.5),
        summary: 'Created DOCX text extraction pipeline',
        type: 'milestone',
        phase: 'Document Processing Foundation',
        rawLineIndex: 6,
      },
      {
        id: 'te-008',
        timestamp: hoursAgo(17),
        summary: 'Built document chunking for LLM context',
        type: 'progress',
        phase: 'Document Processing Foundation',
        rawLineIndex: 7,
      },
      {
        id: 'te-009',
        timestamp: hoursAgo(16.5),
        summary: 'Configuring OpenRouter integration',
        type: 'progress',
        phase: 'Document Processing Foundation',
        rawLineIndex: 8,
      },
      {
        id: 'te-010',
        timestamp: hoursAgo(16),
        summary: 'Encountered an issue -- working through it',
        type: 'error',
        phase: 'AI Extraction Engine',
        rawLineIndex: 9,
      },
      {
        id: 'te-011',
        timestamp: hoursAgo(15.5),
        summary: 'Fixing: missing type definition for extraction schema',
        type: 'recovery',
        phase: 'AI Extraction Engine',
        rawLineIndex: 10,
      },
      {
        id: 'te-012',
        timestamp: hoursAgo(15),
        summary: 'Issue resolved -- moving forward',
        type: 'recovery',
        phase: 'AI Extraction Engine',
        rawLineIndex: 11,
      },
      {
        id: 'te-013',
        timestamp: hoursAgo(14.5),
        summary: 'Built extraction prompt with manufacturing domain knowledge',
        type: 'milestone',
        phase: 'AI Extraction Engine',
        rawLineIndex: 12,
      },
      {
        id: 'te-014',
        timestamp: hoursAgo(14),
        summary: 'Created structured output parser',
        type: 'progress',
        phase: 'AI Extraction Engine',
        rawLineIndex: 13,
      },
      {
        id: 'te-015',
        timestamp: hoursAgo(13.5),
        summary: 'All 8 quality checks passed',
        type: 'milestone',
        phase: 'AI Extraction Engine',
        rawLineIndex: 14,
      },
    ],
    rawOutput: [
      { index: 0, timestamp: hoursAgo(20), content: 'npm install -- installing 18 packages' },
      {
        index: 1,
        timestamp: hoursAgo(20),
        content: 'mkdir -p src/components src/pages src/hooks src/lib src/types',
      },
      { index: 2, timestamp: hoursAgo(19.5), content: 'Writing vite.config.ts' },
      { index: 3, timestamp: hoursAgo(19), content: 'Writing tsconfig.json' },
      {
        index: 4,
        timestamp: hoursAgo(18.5),
        content: 'Created src/pages/UploadPage.tsx -- document upload API endpoint',
      },
      {
        index: 5,
        timestamp: hoursAgo(18),
        content: 'Created src/lib/pdf-extractor.ts -- PDF text extraction',
      },
      {
        index: 6,
        timestamp: hoursAgo(17.5),
        content: 'Created src/lib/docx-extractor.ts -- DOCX text extraction',
      },
      {
        index: 7,
        timestamp: hoursAgo(17),
        content: 'Created src/lib/chunker.ts -- document chunking strategy',
      },
      {
        index: 8,
        timestamp: hoursAgo(16.5),
        content: 'Writing src/lib/openrouter.ts -- OpenRouter integration',
      },
      {
        index: 9,
        timestamp: hoursAgo(16),
        content: 'Error: TypeScript compilation failed -- cannot find ExtractionSchema type',
      },
      {
        index: 10,
        timestamp: hoursAgo(15.5),
        content: 'fixing: adding ExtractionSchema type definition to types/index.ts',
      },
      {
        index: 11,
        timestamp: hoursAgo(15),
        content: 'resolved -- TypeScript compilation successful',
      },
      {
        index: 12,
        timestamp: hoursAgo(14.5),
        content: 'Created src/lib/extraction-prompt.ts -- manufacturing domain extraction',
      },
      {
        index: 13,
        timestamp: hoursAgo(14),
        content: 'Created src/lib/output-parser.ts -- structured requirement parser',
      },
      { index: 14, timestamp: hoursAgo(13.5), content: '8/8 tests passed' },
    ],
    errors: [
      {
        timestamp: hoursAgo(16),
        message: 'TypeScript compilation error: cannot find ExtractionSchema type',
        recoverable: true,
      },
    ],
  },
]

// --- ISSUES ---

export const sampleIssues: Issue[] = [
  {
    id: 'issue-001',
    type: 'bug',
    title: 'Epicor job import shows duplicate operations for split jobs',
    description:
      'When a job has been split in Epicor (e.g., Job 12345.1 and 12345.2), the data import is pulling operations from both splits and displaying them under a single job. This causes the operator screen to show more operations than actually exist for their specific job split.',
    severity: 'high',
    status: 'open',
    projectId: 'charter-001',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    comments: [
      {
        id: 'comment-001',
        author: 'Mark Price',
        content:
          "This might be related to how we're joining on JobNum without filtering by AssemblySeq. Need to check the query.",
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    id: 'issue-002',
    type: 'feature-request',
    title: 'Add operator shift handoff notes',
    description:
      'Operators requested the ability to leave notes for the next shift when a job is in-progress but not completed. Currently they write on sticky notes attached to the machine.',
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
    description:
      'When there are more than 200 active jobs displayed on the production dashboard, the initial load takes over 10 seconds. This is likely due to loading all jobs and operations in a single query without pagination.',
    severity: 'high',
    status: 'in-progress',
    projectId: 'charter-001',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(1),
    comments: [
      {
        id: 'comment-002',
        author: 'Dev Team',
        content:
          'Implementing cursor-based pagination. Should resolve once we batch operations loading with DataLoader.',
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    id: 'issue-004',
    type: 'feature-request',
    title: 'Export weekly schedule report as PDF',
    description:
      'Production managers want to print a weekly schedule report that shows all jobs organized by machine/workcenter. This is for their morning standup meetings where not everyone has a tablet handy.',
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
    description:
      'Operators report being logged out mid-shift and having to re-authenticate. This is disruptive on shop floor tablets where typing credentials is slow. Session should persist for at least 12 hours for shop floor devices.',
    severity: 'critical',
    status: 'resolved',
    projectId: 'charter-001',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(3),
    comments: [
      {
        id: 'comment-003',
        author: 'Dev Team',
        content:
          'Fixed by extending token refresh window to 12 hours for devices identified as shop floor tablets. Deployed to production.',
        createdAt: daysAgo(3),
      },
    ],
  },
  {
    id: 'issue-006',
    type: 'bug',
    title: 'Operator name not showing on completed operations',
    description:
      'When an operator completes a job operation, the dashboard shows "Unknown" instead of the operator name. The data is correctly stored in the database but the resolver is not joining the Users table.',
    severity: 'medium',
    status: 'resolved',
    projectId: 'charter-001',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(5),
    comments: [
      {
        id: 'comment-004',
        author: 'Dev Team',
        content: 'Fixed DataLoader for user resolution. Deployed.',
        createdAt: daysAgo(5),
      },
    ],
  },
  {
    id: 'issue-007',
    type: 'feature-request',
    title: 'Add machine utilization metrics to manager dashboard',
    description:
      'Managers want to see machine utilization percentages based on job operation time tracking data. This would show how effectively each machine/workcenter is being used.',
    severity: 'medium',
    status: 'open',
    projectId: 'charter-001',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    comments: [],
  },
]

// --- ACTIVITIES ---

export const sampleActivities: Activity[] = [
  {
    id: 'act-001',
    type: 'idea-created',
    entityId: 'idea-001',
    entityType: 'idea',
    summary: 'New idea scored: "Automate shop floor job status tracking" (81)',
    createdAt: daysAgo(30),
  },
  {
    id: 'act-002',
    type: 'charter-generated',
    entityId: 'charter-001',
    entityType: 'charter',
    summary: 'Charter generated for "Automate shop floor job status tracking"',
    createdAt: daysAgo(25),
  },
  {
    id: 'act-003',
    type: 'build-started',
    entityId: 'idea-001',
    entityType: 'idea',
    summary: 'Development started for "Shop floor job status tracking"',
    createdAt: daysAgo(20),
  },
  {
    id: 'act-004',
    type: 'build-complete',
    entityId: 'idea-001',
    entityType: 'idea',
    summary: 'Build complete for "Shop floor job status tracking"',
    createdAt: daysAgo(10),
  },
  {
    id: 'act-005',
    type: 'moved-to-production',
    entityId: 'idea-001',
    entityType: 'idea',
    summary: '"Shop floor job status tracking" moved to production',
    createdAt: daysAgo(5),
  },
  {
    id: 'act-006',
    type: 'issue-filed',
    entityId: 'issue-001',
    entityType: 'issue',
    summary: 'New bug report: "Epicor job import shows duplicate operations"',
    createdAt: daysAgo(2),
  },
  {
    id: 'act-007',
    type: 'idea-created',
    entityId: 'idea-002',
    entityType: 'idea',
    summary: 'New idea scored: "Digital quote builder" (72)',
    createdAt: daysAgo(8),
  },
  {
    id: 'act-008',
    type: 'issue-filed',
    entityId: 'issue-005',
    entityType: 'issue',
    summary: 'Bug resolved: "Login session expires during shift"',
    createdAt: daysAgo(3),
  },
  {
    id: 'act-009',
    type: 'status-changed',
    entityId: 'issue-003',
    entityType: 'issue',
    summary: 'Issue "Dashboard load time" moved to in-progress',
    createdAt: daysAgo(1),
  },
  {
    id: 'act-010',
    type: 'idea-created',
    entityId: 'idea-004',
    entityType: 'idea',
    summary: 'New idea scored: "Engineering document search portal" (76)',
    createdAt: daysAgo(6),
  },
  {
    id: 'act-011',
    type: 'charter-generated',
    entityId: 'charter-002',
    entityType: 'charter',
    summary: 'Charter generated for "Engineering document search portal"',
    createdAt: daysAgo(4),
  },
  {
    id: 'act-012',
    type: 'idea-created',
    entityId: 'idea-005',
    entityType: 'idea',
    summary: 'New idea scored: "Customer specification analysis tool" (69)',
    createdAt: daysAgo(10),
  },
  {
    id: 'act-013',
    type: 'charter-generated',
    entityId: 'charter-003',
    entityType: 'charter',
    summary: 'Charter generated for "Customer specification analysis tool"',
    createdAt: daysAgo(7),
  },
  {
    id: 'act-014',
    type: 'build-started',
    entityId: 'idea-005',
    entityType: 'idea',
    summary: 'Development started for "Customer specification analysis"',
    createdAt: daysAgo(1),
  },
  {
    id: 'act-015',
    type: 'build-paused',
    entityId: 'idea-005',
    entityType: 'idea',
    summary: 'Build paused for "Customer specification analysis" — awaiting review',
    createdAt: hoursAgo(13),
  },
  {
    id: 'act-016',
    type: 'idea-created',
    entityId: 'idea-003',
    entityType: 'idea',
    summary: 'New idea scored: "Predictive maintenance alerts for CNC" (58)',
    createdAt: daysAgo(40),
  },
  {
    id: 'act-017',
    type: 'issue-filed',
    entityId: 'issue-002',
    entityType: 'issue',
    summary: 'Feature request: "Add operator shift handoff notes"',
    createdAt: daysAgo(4),
  },
  {
    id: 'act-018',
    type: 'issue-scored',
    entityId: 'issue-001',
    entityType: 'issue',
    summary: 'Bug "Epicor job import shows duplicate operations" scored 85 (Critical)',
    createdAt: daysAgo(2),
  },
  {
    id: 'act-019',
    type: 'remediation-triggered',
    entityId: 'issue-001',
    entityType: 'issue',
    summary: 'Auto-remediation triggered for "Epicor job import shows duplicate operations"',
    createdAt: daysAgo(2),
  },
  {
    id: 'act-020',
    type: 'remediation-completed',
    entityId: 'issue-001',
    entityType: 'issue',
    summary: 'Auto-remediation completed for "Epicor job import shows duplicate operations"',
    createdAt: daysAgo(2),
  },
  {
    id: 'act-021',
    type: 'issue-scored',
    entityId: 'issue-003',
    entityType: 'issue',
    summary: 'Bug "Dashboard load time exceeds 10 seconds" scored 65 (High)',
    createdAt: daysAgo(1),
  },
  {
    id: 'act-022',
    type: 'remediation-recommended',
    entityId: 'issue-003',
    entityType: 'issue',
    summary: 'Auto-fix recommended for "Dashboard load time exceeds 10 seconds"',
    createdAt: daysAgo(1),
  },
  {
    id: 'act-023',
    type: 'remediation-failed',
    entityId: 'issue-006',
    entityType: 'issue',
    summary: 'Auto-remediation failed for "Operator name not showing on completed operations"',
    createdAt: daysAgo(5),
  },
]

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
]

// --- ADMIN: USERS ---

export const sampleUsers: User[] = [
  {
    id: 'user-001',
    name: 'Alex Chen',
    email: 'alex@example.com',
    role: 'admin',
    status: 'active',
    lastActive: hoursAgo(1),
    createdAt: daysAgo(90),
    updatedAt: daysAgo(1),
  },
  {
    id: 'user-002',
    name: 'Jordan Rivera',
    email: 'jordan@example.com',
    role: 'developer',
    status: 'active',
    lastActive: hoursAgo(3),
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5),
  },
  {
    id: 'user-003',
    name: 'Sam Patel',
    email: 'sam@example.com',
    role: 'viewer',
    status: 'active',
    lastActive: daysAgo(2),
    createdAt: daysAgo(30),
    updatedAt: daysAgo(10),
  },
]

// --- ADMIN: ENVIRONMENT SERVERS ---

export const sampleServers: EnvironmentServer[] = [
  {
    id: 'srv-dsp',
    environment: 'dsp',
    label: 'DSP',
    host: 'localhost',
    port: 8080,
    websocketPath: '/agent',
    connectionStatus: 'connected',
    lastTested: hoursAgo(2),
    errorMessage: null,
  },
  {
    id: 'srv-dev',
    environment: 'development',
    label: 'Development',
    host: '',
    port: 8080,
    websocketPath: '/agent',
    connectionStatus: 'disconnected',
    lastTested: null,
    errorMessage: null,
  },
  {
    id: 'srv-prod',
    environment: 'production',
    label: 'Production',
    host: '',
    port: 8080,
    websocketPath: '/agent',
    connectionStatus: 'disconnected',
    lastTested: null,
    errorMessage: null,
  },
]

// --- ADMIN: AI SETTINGS ---

export const sampleAISettings: AISettings = {
  openrouterApiKey: '',
  keyStatus: 'unconfigured',
  charterModel: 'anthropic/claude-sonnet-4',
  charterEnabled: true,
  executionPlanModel: 'anthropic/claude-sonnet-4',
  executionPlanEnabled: true,
  scoringModel: 'anthropic/claude-haiku',
  scoringEnabled: true,
  conversationModel: 'anthropic/claude-sonnet-4',
  conversationEnabled: true,
  bugScoringModel: 'anthropic/claude-haiku',
  bugScoringEnabled: true,
  featureScoringModel: 'anthropic/claude-haiku',
  featureScoringEnabled: true,
  ideaChatModel: 'anthropic/claude-sonnet-4',
  ideaChatEnabled: true,
  abstractionModel: 'anthropic/claude-haiku',
  abstractionEnabled: true,
  translationVerbosity: 3,
  zeroDataRetention: false,
  dowCompliance: false,
}

// --- ISSUE SCORES (Mock Seed Data) ---

export const sampleIssueScores: IssueScore[] = [
  // Bug ~85 — auto-trigger tier, completed remediation
  {
    issue_id: 'issue-001',
    score_type: 'bug',
    composite_score: 85,
    tier: 'critical',
    dimensions: [
      {
        dimension: 'severity',
        score: 80,
        weight: 0.25,
        weighted_score: 20,
        explanation:
          'High severity — duplicate operations cause operator confusion and potential scrap from running wrong operations.',
      },
      {
        dimension: 'blast_radius',
        score: 90,
        weight: 0.25,
        weighted_score: 22.5,
        explanation:
          'Affects all split jobs across the entire shop floor. Every operator working a split job sees incorrect data.',
      },
      {
        dimension: 'reproducibility',
        score: 95,
        weight: 0.2,
        weighted_score: 19,
        explanation:
          '100% reproducible on any split job. Steps: create split job in Epicor, import into tracker, observe duplicate operations.',
      },
      {
        dimension: 'remediation_confidence',
        score: 75,
        weight: 0.2,
        weighted_score: 15,
        explanation:
          'Root cause is clear — SQL join missing AssemblySeq filter. Fix is straightforward in the data access layer.',
      },
      {
        dimension: 'recurrence',
        score: 85,
        weight: 0.1,
        weighted_score: 8.5,
        explanation:
          'Occurs on every import cycle for any split job. Will continue until the query is patched.',
      },
    ],
    remediation_status: 'completed',
    remediation_session_id: 'rem-session-001',
    scored_at: daysAgo(2),
    scored_by: 'rules_fallback',
  },
  // Bug ~65 — recommend tier
  {
    issue_id: 'issue-003',
    score_type: 'bug',
    composite_score: 65,
    tier: 'high',
    dimensions: [
      {
        dimension: 'severity',
        score: 70,
        weight: 0.25,
        weighted_score: 17.5,
        explanation: 'High — dashboard is slow but still functional. No data loss or corruption.',
      },
      {
        dimension: 'blast_radius',
        score: 60,
        weight: 0.25,
        weighted_score: 15,
        explanation: 'Affects production managers viewing the dashboard. Operators are unaffected.',
      },
      {
        dimension: 'reproducibility',
        score: 80,
        weight: 0.2,
        weighted_score: 16,
        explanation:
          'Reproducible when 200+ active jobs exist. Load consistently exceeds 10 seconds.',
      },
      {
        dimension: 'remediation_confidence',
        score: 50,
        weight: 0.2,
        weighted_score: 10,
        explanation:
          'Pagination required — moderate confidence as it involves query restructuring and DataLoader implementation.',
      },
      {
        dimension: 'recurrence',
        score: 65,
        weight: 0.1,
        weighted_score: 6.5,
        explanation:
          'Occurs whenever job count exceeds threshold, which happens during peak production.',
      },
    ],
    remediation_status: 'recommended',
    remediation_session_id: null,
    scored_at: daysAgo(1),
    scored_by: 'rules_fallback',
  },
  // Bug ~30 — file-only tier (below threshold)
  {
    issue_id: 'issue-005',
    score_type: 'bug',
    composite_score: 30,
    tier: 'low',
    dimensions: [
      {
        dimension: 'severity',
        score: 60,
        weight: 0.25,
        weighted_score: 15,
        explanation: 'Was critical when active but has since been resolved.',
      },
      {
        dimension: 'blast_radius',
        score: 20,
        weight: 0.25,
        weighted_score: 5,
        explanation: 'Only affected shop floor tablet devices, not desktop users.',
      },
      {
        dimension: 'reproducibility',
        score: 30,
        weight: 0.2,
        weighted_score: 6,
        explanation: 'No longer reproducible — fix has been deployed.',
      },
      {
        dimension: 'remediation_confidence',
        score: 10,
        weight: 0.2,
        weighted_score: 2,
        explanation: 'Already resolved — no remediation needed.',
      },
      {
        dimension: 'recurrence',
        score: 20,
        weight: 0.1,
        weighted_score: 2,
        explanation: 'Token refresh window extended to 12 hours. Unlikely to recur.',
      },
    ],
    remediation_status: null,
    remediation_session_id: null,
    scored_at: daysAgo(3),
    scored_by: 'rules_fallback',
  },
  // Bug — failed remediation (issue-006)
  {
    issue_id: 'issue-006',
    score_type: 'bug',
    composite_score: 55,
    tier: 'medium',
    dimensions: [
      {
        dimension: 'severity',
        score: 50,
        weight: 0.25,
        weighted_score: 12.5,
        explanation: 'Medium — displays "Unknown" for operator name, cosmetic but reduces trust.',
      },
      {
        dimension: 'blast_radius',
        score: 55,
        weight: 0.25,
        weighted_score: 13.75,
        explanation: 'Affects all completed operations viewed on the dashboard.',
      },
      {
        dimension: 'reproducibility',
        score: 70,
        weight: 0.2,
        weighted_score: 14,
        explanation: 'Was 100% reproducible before fix. Now resolved.',
      },
      {
        dimension: 'remediation_confidence',
        score: 40,
        weight: 0.2,
        weighted_score: 8,
        explanation: 'DataLoader fix required understanding the resolver chain.',
      },
      {
        dimension: 'recurrence',
        score: 35,
        weight: 0.1,
        weighted_score: 3.5,
        explanation: 'Fix deployed. Similar issues could recur with other entity resolvers.',
      },
    ],
    remediation_status: 'failed',
    remediation_session_id: 'rem-session-002',
    scored_at: daysAgo(5),
    scored_by: 'rules_fallback',
  },
  // Feature request ~80 — high_value tier
  {
    issue_id: 'issue-002',
    score_type: 'feature',
    composite_score: 80,
    tier: 'high_value',
    dimensions: [
      {
        dimension: 'demand',
        score: 85,
        weight: 0.3,
        weighted_score: 25.5,
        explanation:
          'Directly requested by multiple operators across shifts. Addresses a daily workflow gap.',
      },
      {
        dimension: 'alignment',
        score: 90,
        weight: 0.3,
        weighted_score: 27,
        explanation:
          'Strongly aligns with charter objective to eliminate paper-based processes on the shop floor.',
      },
      {
        dimension: 'complexity',
        score: 60,
        weight: 0.2,
        weighted_score: 12,
        explanation:
          'Moderate complexity — requires new data model for notes and UI for input/display.',
      },
      {
        dimension: 'impact',
        score: 78,
        weight: 0.2,
        weighted_score: 15.6,
        explanation: 'Improves shift continuity and reduces information loss during handoffs.',
      },
    ],
    remediation_status: null,
    remediation_session_id: null,
    scored_at: daysAgo(4),
    scored_by: 'rules_fallback',
  },
  // Feature request ~55 — moderate_value tier
  {
    issue_id: 'issue-007',
    score_type: 'feature',
    composite_score: 55,
    tier: 'moderate_value',
    dimensions: [
      {
        dimension: 'demand',
        score: 50,
        weight: 0.3,
        weighted_score: 15,
        explanation: 'Requested by management team. Not yet requested by operators.',
      },
      {
        dimension: 'alignment',
        score: 70,
        weight: 0.3,
        weighted_score: 21,
        explanation: 'Aligns with reporting views charter objective for throughput metrics.',
      },
      {
        dimension: 'complexity',
        score: 40,
        weight: 0.2,
        weighted_score: 8,
        explanation: 'Requires aggregation queries and new dashboard components.',
      },
      {
        dimension: 'impact',
        score: 55,
        weight: 0.2,
        weighted_score: 11,
        explanation: 'Would improve machine scheduling decisions but not an immediate blocker.',
      },
    ],
    remediation_status: null,
    remediation_session_id: null,
    scored_at: daysAgo(3),
    scored_by: 'rules_fallback',
  },
]

// --- REMEDIATION SESSIONS (Mock Seed Data) ---

export const sampleRemediationSessions: RemediationSession[] = [
  // Completed session for issue-001
  {
    id: 'rem-session-001',
    issue_id: 'issue-001',
    project_id: 'charter-001',
    status: 'completed',
    environment: 'dsp',
    session_id: null,
    created_at: daysAgo(2),
    started_at: daysAgo(2),
    completed_at: daysAgo(2),
    error_message: null,
  },
  // Failed session for issue-006
  {
    id: 'rem-session-002',
    issue_id: 'issue-006',
    project_id: 'charter-001',
    status: 'failed',
    environment: 'dsp',
    session_id: null,
    created_at: daysAgo(5),
    started_at: daysAgo(5),
    completed_at: daysAgo(5),
    error_message: 'Agent session timed out after 120 seconds without producing a fix.',
  },
]

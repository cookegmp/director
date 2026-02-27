// ============================================================================
// Issue Reporter Module — TypeScript Types
// ============================================================================
// Independent type definitions for the issue reporter module.
// These do NOT import from or extend the idea intake types.
// ============================================================================

// --- Enums ---

export type IssueClassification = 'bug' | 'feature'
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low'
export type IssueReportStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'wont_fix'
export type IssueSource = 'internal' | 'external'
export type IssueEnvironment = 'dsp' | 'development' | 'production'

// --- AI Response Types ---

export interface AIQuestionResponse {
  done: false
  question: string
  suggestions?: string[]
  helper_text?: string
}

export interface AICompletionResponse {
  done: true
  classification: IssueClassification
  title: string
  description: string
  severity: IssueSeverity
  steps_to_reproduce: string[] | null
  expected_behavior: string | null
  actual_behavior: string | null
  desired_outcome: string | null
  affected_area: string | null
  potential_duplicates: PotentialDuplicate[]
  conversation_summary: string
}

export type AIResponse = AIQuestionResponse | AICompletionResponse

export interface PotentialDuplicate {
  issueId: string
  title: string
  similarity_reason: string
}

// --- Conversation State ---

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export type ConversationPhase =
  | 'idle'
  | 'type-select'
  | 'initializing'
  | 'conversing'
  | 'completing'
  | 'review'
  | 'submitted'

export interface ConversationState {
  phase: ConversationPhase
  messages: ConversationMessage[]
  currentQuestion: string | null
  currentSuggestions: string[]
  currentHelperText: string | null
  stepCount: number
  projectId: string | null
  appName: string | null
  issueType: IssueClassification | null
  report: IssueReport | null
  screenshot: string | null
  isLoading: boolean
  error: string | null
}

// --- Issue Report (AI-generated, user-editable) ---

export interface IssueReport {
  classification: IssueClassification
  title: string
  description: string
  severity: IssueSeverity
  steps_to_reproduce: string[] | null
  expected_behavior: string | null
  actual_behavior: string | null
  desired_outcome: string | null
  affected_area: string | null
  potential_duplicates: PotentialDuplicate[]
  conversation_summary: string
}

// --- Submitted Issue (stored in data layer) ---

export interface ReportedIssue {
  id: string
  type: IssueClassification
  title: string
  description: string
  severity: IssueSeverity
  status: IssueReportStatus
  project_id: string | null
  app_id: string | null
  source: IssueSource
  environment: IssueEnvironment | null
  affected_area: string | null
  steps_to_reproduce: string[] | null
  expected_behavior: string | null
  actual_behavior: string | null
  desired_outcome: string | null
  reporter_name: string | null
  reporter_email: string | null
  reporter_user_id: string | null
  screenshot: string | null
  metadata: BrowserMetadata
  conversation_summary: string | null
  linked_duplicate_id: string | null
  created_at: string
  updated_at: string
}

export interface IssueComment {
  id: string
  issue_id: string
  author_name: string
  author_user_id: string | null
  body: string
  created_at: string
}

export interface BrowserMetadata {
  userAgent: string
  url: string
  viewport: { width: number; height: number }
  devicePixelRatio: number
  timestamp: string
}

// --- Context for AI ---

export interface AIContext {
  scaffolding: string | null
  charterExecutionPlan: string | null
  existingIssues: ExistingIssueRef[]
}

export interface ExistingIssueRef {
  id: string
  type: string
  title: string
  status: string
  severity: string
  affected_area: string | null
  description: string
}

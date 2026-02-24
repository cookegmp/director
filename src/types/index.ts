// ============================================================================
// StageManager — TypeScript Types
// ============================================================================

// --- Enums ---

export type IdeaStatus = 'scored' | 'charter-generated' | 'in-development' | 'production' | 'archived';
export type IssueType = 'bug' | 'feature-request';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type ActivityType =
  | 'idea-created'
  | 'idea-scored'
  | 'charter-generated'
  | 'issue-filed'
  | 'status-changed'
  | 'build-started'
  | 'build-paused'
  | 'build-stopped'
  | 'build-complete'
  | 'moved-to-production';
export type EntityType = 'idea' | 'charter' | 'issue' | 'agent-session';
export type ScoreTier = 'critical' | 'high' | 'medium' | 'low';
export type UrgencyLevel = 'Blocking other work' | 'Causing daily friction' | 'Would improve efficiency' | 'Exploring for the future';

// --- Agent Session Types ---

export type AgentSessionStatus = 'connecting' | 'connected' | 'building' | 'paused' | 'complete' | 'error' | 'stopped';

export type TranslatedEntryType = 'progress' | 'milestone' | 'error' | 'recovery' | 'complete';

export interface TranslatedEntry {
  id: string;
  timestamp: string;
  summary: string;
  type: TranslatedEntryType;
  phase: string;
  rawLineIndex: number;
}

export interface RawOutputLine {
  index: number;
  timestamp: string;
  content: string;
}

export interface AgentError {
  timestamp: string;
  message: string;
  recoverable: boolean;
}

export interface AgentSession {
  id: string;
  ideaId: string;
  charterId: string;
  status: AgentSessionStatus;
  translatedEntries: TranslatedEntry[];
  rawOutput: RawOutputLine[];
  errors: AgentError[];
  createdAt: string;
  connectedAt: string | null;
  completedAt: string | null;
  stoppedAt: string | null;
}

// --- WebSocket Messages ---

export type ClientMessage =
  | { type: 'start-build'; charterId: string; ideaId: string }
  | { type: 'pause-build' }
  | { type: 'resume-build' }
  | { type: 'stop-build' }
  | { type: 'send-message'; message: string };

export type ServerMessage =
  | { type: 'status'; status: AgentSessionStatus }
  | { type: 'output'; line: string; timestamp: string }
  | { type: 'error'; message: string; recoverable: boolean }
  | { type: 'complete' };

// --- Scoring ---

export interface ScoreDimensions {
  impact: number;
  urgency: number;
  feasibility: number;
  alignment: number;
}

// --- Data Models ---

export interface Idea {
  id: string;
  title: string;
  status: IdeaStatus;
  intakeAnswers: Record<string, string>;
  scores: ScoreDimensions;
  compositeScore: number;
  createdAt: string;
  updatedAt: string;
  linkedCharterId: string | null;
  linkedIssueIds: string[];
  activeSessionId: string | null;
}

export interface CharterContent {
  projectOverview: string;
  objectives: string[];
  technicalApproach: string;
  acceptanceCriteria: string[];
  estimatedTimeline: string;
  executionPlan: CharterPhase[];
}

export interface CharterPhase {
  phase: string;
  tasks: string[];
  duration: string;
  dependencies: string[];
}

export interface Charter {
  id: string;
  ideaId: string;
  title: string;
  content: CharterContent;
  scaffoldingRefs: string[];
  createdAt: string;
  updatedAt: string;
  linkedIssueIds: string[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  type: IssueType;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  entityId: string;
  entityType: EntityType;
  summary: string;
  createdAt: string;
}

export interface ScaffoldingDocument {
  id: string;
  type: ScaffoldingDocType;
  title: string;
  content: string;
  lastUpdated: string;
}

export type ScaffoldingDocType =
  | 'company-context'
  | 'technology-preferences'
  | 'brand-standards'
  | 'security-patterns'
  | 'quality-standards';

// --- Wizard ---

export interface WizardStep {
  id: string;
  question: string;
  placeholder?: string;
  suggestions?: string[];
  required: boolean;
  inputType: 'textarea' | 'select';
  submitLabel?: string;
}

// --- Utility ---

export function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function getTierColor(tier: ScoreTier): string {
  switch (tier) {
    case 'critical': return 'hsl(0, 72%, 51%)';
    case 'high': return 'hsl(25, 95%, 53%)';
    case 'medium': return 'hsl(217, 100%, 61%)';
    case 'low': return 'hsl(220, 14%, 55%)';
  }
}

export function getTierBadgeClasses(tier: ScoreTier): string {
  switch (tier) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

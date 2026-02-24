// ============================================================================
// StageManager — TypeScript Types
// ============================================================================

// --- Enums ---

export type IdeaStatus = 'new' | 'scored' | 'charter-generated' | 'archived';
export type CharterStatus = 'draft' | 'reviewed' | 'in-progress' | 'complete';
export type IssueType = 'bug' | 'feature-request';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type ActivityType = 'idea-created' | 'charter-generated' | 'issue-filed' | 'status-changed';
export type EntityType = 'idea' | 'charter' | 'issue';
export type ScoreTier = 'critical' | 'high' | 'medium' | 'low';
export type UrgencyLevel = 'Blocking other work' | 'Causing daily friction' | 'Would improve efficiency' | 'Exploring for the future';

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
  status: CharterStatus;
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

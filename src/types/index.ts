// ─── Client ────────────────────────────────────────────────

export type ClientStatus = 'prospect' | 'discovery' | 'scaffolding' | 'building' | 'active' | 'archived'

export type ClientSizeRange = 'small' | 'mid' | 'large'

export interface Client {
  id: string
  name: string
  industry: string
  size_range: ClientSizeRange
  status: ClientStatus
  primary_contact: string
  notes: string
  created_at: string
  updated_at: string
}

export const CLIENT_STATUS_ORDER: ClientStatus[] = [
  'prospect',
  'discovery',
  'scaffolding',
  'building',
  'active',
  'archived',
]

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  prospect: 'Prospect',
  discovery: 'Discovery',
  scaffolding: 'Scaffolding',
  building: 'Building',
  active: 'Active',
  archived: 'Archived',
}

// ─── Engagement ────────────────────────────────────────────

export type EngagementPhase = 'discovery' | 'scaffolding' | 'first_build' | 'handoff' | 'subscription'

export type EngagementStatus = 'active' | 'paused' | 'complete'

export interface Engagement {
  id: string
  client_id: string
  phase: EngagementPhase
  start_date: string
  target_end_date: string | null
  actual_end_date: string | null
  status: EngagementStatus
}

export const ENGAGEMENT_PHASE_ORDER: EngagementPhase[] = [
  'discovery',
  'scaffolding',
  'first_build',
  'handoff',
  'subscription',
]

export const ENGAGEMENT_PHASE_LABELS: Record<EngagementPhase, string> = {
  discovery: 'Discovery',
  scaffolding: 'Scaffolding',
  first_build: 'First Build',
  handoff: 'Handoff',
  subscription: 'Subscription',
}

// ─── Discovery Session ─────────────────────────────────────

export type DiscoverySessionType =
  | 'stakeholder_interview'
  | 'system_walkthrough'
  | 'workflow_observation'
  | 'brand_collection'

export type DiscoverySessionStatus = 'scheduled' | 'in_progress' | 'complete' | 'reviewed'

export interface DiscoverySession {
  id: string
  engagement_id: string
  session_type: DiscoverySessionType
  title: string
  participants: string[]
  transcript: string
  extracted_data: Record<string, unknown>
  scaffolding_sections_affected: string[]
  status: DiscoverySessionStatus
  session_date: string
}

export const SESSION_TYPE_LABELS: Record<DiscoverySessionType, string> = {
  stakeholder_interview: 'Stakeholder Interview',
  system_walkthrough: 'System Walkthrough',
  workflow_observation: 'Workflow Observation',
  brand_collection: 'Brand Collection',
}

// ─── Scaffolding Package ───────────────────────────────────

export type ScaffoldingValidationStatus = 'draft' | 'review' | 'validated' | 'exported'

export interface ScaffoldingPackage {
  id: string
  engagement_id: string
  version: string
  tier1_process_workflow: Record<string, unknown>
  tier1_culture_profile: Record<string, unknown>
  tier1_data_systems: Record<string, unknown>
  tier2_company_context: Record<string, unknown>
  tier2_brand_standards: Record<string, unknown>
  tier2_tech_preferences: Record<string, unknown>
  tier2_quality_standards: Record<string, unknown>
  tier2_security_patterns: Record<string, unknown>
  validation_status: ScaffoldingValidationStatus
  exported_at: string | null
}

export type SectionCompletionStatus = 'empty' | 'draft' | 'reviewed' | 'validated'

export const SCAFFOLDING_TIER1_SECTIONS = [
  { key: 'tier1_process_workflow', label: 'Process & Workflow' },
  { key: 'tier1_culture_profile', label: 'Culture Profile' },
  { key: 'tier1_data_systems', label: 'Data & Systems' },
] as const

export const SCAFFOLDING_TIER2_SECTIONS = [
  { key: 'tier2_company_context', label: 'Company Context' },
  { key: 'tier2_brand_standards', label: 'Brand Standards' },
  { key: 'tier2_tech_preferences', label: 'Tech Preferences' },
  { key: 'tier2_quality_standards', label: 'Quality Standards' },
  { key: 'tier2_security_patterns', label: 'Security Patterns' },
] as const

export type ScaffoldingSectionKey =
  | (typeof SCAFFOLDING_TIER1_SECTIONS)[number]['key']
  | (typeof SCAFFOLDING_TIER2_SECTIONS)[number]['key']

// ─── OCAI Assessment ───────────────────────────────────────

export type OCAILevel = 'baseline_1' | 'workflow_2' | 'idea_3'

export type OCAIStatus = 'draft' | 'deployed' | 'collecting' | 'complete' | 'analyzed'

export interface OCAIAssessment {
  id: string
  engagement_id: string
  level: OCAILevel
  target_scope: string
  questions: Record<string, unknown>[]
  responses: Record<string, unknown>[]
  analysis: Record<string, unknown>
  status: OCAIStatus
}

export const OCAI_LEVEL_LABELS: Record<OCAILevel, string> = {
  baseline_1: 'Level 1 — Baseline',
  workflow_2: 'Level 2 — Workflow',
  idea_3: 'Level 3 — Idea',
}

// ─── Terminology Entry ─────────────────────────────────────

export interface TerminologyEntry {
  id: string
  scaffolding_id: string
  client_term: string
  universal_concept: string
  context: string
  source_session_id: string | null
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AgentDefinition,
  SkillDefinition,
  AgentStatus,
  SkillStatus,
  SkillSyncStatus,
} from '@/types'

interface AgentsSkillsState {
  agents: AgentDefinition[]
  skills: SkillDefinition[]

  // Agent actions
  addAgent: (agent: Omit<AgentDefinition, 'id' | 'createdAt' | 'updatedAt'>) => AgentDefinition
  updateAgent: (id: string, updates: Partial<AgentDefinition>) => void
  removeAgent: (id: string) => void
  setAgentStatus: (id: string, status: AgentStatus) => void

  // Skill actions
  addSkill: (
    skill: Omit<SkillDefinition, 'id' | 'createdAt' | 'updatedAt' | 'syncTargets'>,
  ) => SkillDefinition
  updateSkill: (id: string, updates: Partial<SkillDefinition>) => void
  removeSkill: (id: string) => void
  setSkillStatus: (id: string, status: SkillStatus) => void
  setSyncStatus: (skillId: string, environment: string, status: SkillSyncStatus) => void
  syncSkill: (skillId: string, environment: string) => Promise<void>
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const SAMPLE_AGENTS: AgentDefinition[] = [
  {
    id: 'agent-001',
    name: 'Charter Architect',
    description:
      'Generates detailed project charters from intake data, scaffolding documents, and organizational context.',
    model: 'anthropic/claude-sonnet-4',
    systemPrompt:
      'You are a project charter architect. Given intake answers and scaffolding context, generate a comprehensive project charter.',
    tools: ['scaffolding-reader', 'intake-parser', 'charter-writer'],
    maxTurns: 10,
    status: 'active',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-01-15T14:30:00Z',
  },
  {
    id: 'agent-002',
    name: 'Issue Scorer',
    description:
      'Analyzes reported issues and scores them across severity, blast radius, reproducibility, and other dimensions.',
    model: 'anthropic/claude-haiku',
    systemPrompt:
      'You are an issue scoring specialist. Analyze the issue details and score across the configured dimensions.',
    tools: ['issue-reader', 'context-assembler', 'score-writer'],
    maxTurns: 5,
    status: 'active',
    createdAt: '2025-12-05T09:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'agent-003',
    name: 'Build Translator',
    description:
      'Translates raw agent build output into plain-English summaries for non-technical stakeholders.',
    model: 'anthropic/claude-haiku',
    systemPrompt: 'You translate raw build output into clear, concise plain-English summaries.',
    tools: ['pattern-matcher', 'phase-detector'],
    maxTurns: 1,
    status: 'inactive',
    createdAt: '2026-01-20T16:00:00Z',
    updatedAt: '2026-01-20T16:00:00Z',
  },
]

const SAMPLE_SKILLS: SkillDefinition[] = [
  {
    id: 'skill-001',
    name: 'Generate Charter',
    description:
      'Creates a project charter from a scored idea, pulling in scaffolding context and execution plan structure.',
    agentId: 'agent-001',
    trigger: '/charter',
    instructions:
      'When triggered, load the idea intake answers and all scaffolding documents. Generate a charter with: overview, objectives, technical approach, acceptance criteria, timeline, and phased execution plan.',
    status: 'active',
    syncTargets: { dsp: 'synced', development: 'synced', production: 'not-synced' },
    createdAt: '2025-12-01T10:30:00Z',
    updatedAt: '2026-01-15T14:30:00Z',
  },
  {
    id: 'skill-002',
    name: 'Score Issue',
    description:
      'Runs AI-powered scoring on a reported bug or feature request across configured dimensions.',
    agentId: 'agent-002',
    trigger: '/score-issue',
    instructions:
      'Load the issue details and parent project context. Score across all configured dimensions using the active weight configuration. Return structured scores with explanations.',
    status: 'active',
    syncTargets: { dsp: 'synced', development: 'pending', production: 'not-synced' },
    createdAt: '2025-12-05T09:30:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'skill-003',
    name: 'Duplicate Detector',
    description:
      'Scans existing issues to find potential duplicates when a new issue is being reported.',
    agentId: null,
    trigger: '/check-duplicates',
    instructions:
      'Compare the incoming issue description against all open and recent issues. Return matches with similarity reasoning.',
    status: 'draft',
    syncTargets: {},
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-01T08:00:00Z',
  },
]

export const useAgentsSkillsStore = create<AgentsSkillsState>()(
  persist(
    (set, get) => ({
      agents: SAMPLE_AGENTS,
      skills: SAMPLE_SKILLS,

      addAgent: (input) => {
        const now = new Date().toISOString()
        const agent: AgentDefinition = {
          ...input,
          id: `agent-${generateId()}`,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ agents: [...state.agents, agent] }))
        return agent
      },

      updateAgent: (id, updates) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a,
          ),
        })),

      removeAgent: (id) =>
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
          // Unlink skills from this agent
          skills: state.skills.map((s) =>
            s.agentId === id ? { ...s, agentId: null, updatedAt: new Date().toISOString() } : s,
          ),
        })),

      setAgentStatus: (id, status) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a,
          ),
        })),

      addSkill: (input) => {
        const now = new Date().toISOString()
        const skill: SkillDefinition = {
          ...input,
          id: `skill-${generateId()}`,
          syncTargets: {},
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ skills: [...state.skills, skill] }))
        return skill
      },

      updateSkill: (id, updates) =>
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s,
          ),
        })),

      removeSkill: (id) =>
        set((state) => ({
          skills: state.skills.filter((s) => s.id !== id),
        })),

      setSkillStatus: (id, status) =>
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s,
          ),
        })),

      setSyncStatus: (skillId, environment, status) =>
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === skillId
              ? {
                  ...s,
                  syncTargets: { ...s.syncTargets, [environment]: status },
                  updatedAt: new Date().toISOString(),
                }
              : s,
          ),
        })),

      syncSkill: async (skillId, environment) => {
        // Set to pending
        get().setSyncStatus(skillId, environment, 'pending')

        // Simulate sync delay
        await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000))

        // Simulate success (90%) or error (10%)
        const success = Math.random() > 0.1
        get().setSyncStatus(skillId, environment, success ? 'synced' : 'error')
      },
    }),
    { name: 'stagemanager-agents-skills' },
  ),
)

// ============================================================================
// Issue Reporter — Conversation State Store
// ============================================================================
// Manages the AI conversation state, current report, and screenshot.
// Independent from the idea intake stores.
// ============================================================================

import { create } from 'zustand'
import type {
  ConversationState,
  ConversationPhase,
  ConversationMessage,
  IssueClassification,
  IssueReport,
} from '../types'

interface IssueReporterState extends ConversationState {
  // Actions
  setPhase: (phase: ConversationPhase) => void
  setProjectId: (projectId: string | null) => void
  setAppName: (appName: string | null) => void
  setIssueType: (issueType: IssueClassification) => void
  addMessage: (message: ConversationMessage) => void
  setCurrentQuestion: (question: string, suggestions?: string[], helperText?: string | null) => void
  incrementStep: () => void
  setReport: (report: IssueReport) => void
  updateReport: (updates: Partial<IssueReport>) => void
  setScreenshot: (screenshot: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState: ConversationState = {
  phase: 'idle',
  messages: [],
  currentQuestion: null,
  currentSuggestions: [],
  currentHelperText: null,
  stepCount: 0,
  projectId: null,
  appName: null,
  issueType: null,
  report: null,
  screenshot: null,
  isLoading: false,
  error: null,
}

export const useIssueReporterStore = create<IssueReporterState>()((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setProjectId: (projectId) => set({ projectId }),

  setAppName: (appName) => set({ appName }),

  setIssueType: (issueType) => set({ issueType }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setCurrentQuestion: (question, suggestions = [], helperText = null) =>
    set({
      currentQuestion: question,
      currentSuggestions: suggestions,
      currentHelperText: helperText,
    }),

  incrementStep: () => set((state) => ({ stepCount: state.stepCount + 1 })),

  setReport: (report) => set({ report, phase: 'review' }),

  updateReport: (updates) =>
    set((state) => ({
      report: state.report ? { ...state.report, ...updates } : null,
    })),

  setScreenshot: (screenshot) => set({ screenshot }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}))

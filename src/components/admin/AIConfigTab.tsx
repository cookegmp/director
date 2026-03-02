import { useState } from 'react'
import { ShieldCheck, ShieldAlert, Info } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { useSettingsStore } from '@/stores/settings'
import APIKeyField from './APIKeyField'
import ModelAssignment from './ModelAssignment'

const MODEL_FUNCTIONS = [
  {
    functionKey: 'charter' as const,
    label: 'Charter Generation',
    description:
      'Generates project charters for new product ideas from intake data and scaffolding context. Benefits from a high-capability model since charter quality directly impacts build outcomes.',
    whenDisabled:
      'Charter generation falls back to mock/template output. A notice appears on the charter generation button: "AI generation disabled — using template output."',
  },
  {
    functionKey: 'executionPlan' as const,
    label: 'Execution Plan',
    description:
      'Generates phased execution plans for new product charters — tasks, durations, and dependencies. Benefits from a capable model since plan quality shapes the entire build sequence.',
    whenDisabled:
      'Execution plans use template-based generation with standard phases. Plans may be less tailored to the specific project context.',
  },
  {
    functionKey: 'ideaChat' as const,
    label: 'Idea Chat',
    description:
      'Powers the conversational assistant for new product idea intake. Helps users articulate the problem, business impact, and urgency for a proposed new application or process.',
    whenDisabled:
      'Idea intake falls back to the standard static form wizard with pre-defined questions.',
  },
  {
    functionKey: 'scoring' as const,
    label: 'Idea Scoring',
    description:
      'Scores new product ideas across four dimensions (impact, urgency, feasibility, alignment). Ideas are proposals for entirely new applications or processes — not enhancements to existing ones.',
    whenDisabled:
      'Scoring uses the rules-based heuristic engine only. A notice appears on scored ideas: "Scored using rules engine (AI scoring disabled)."',
  },
  {
    functionKey: 'conversation' as const,
    label: 'Issue Reporter Chat',
    description:
      'Powers the conversational wizard for reporting bugs or requesting enhancements to existing applications. Handles multi-turn dialogue and classifies submissions automatically.',
    whenDisabled:
      'The issue reporter falls back to a fixed-question wizard with pre-defined intake steps instead of a conversational AI flow.',
  },
  {
    functionKey: 'bugScoring' as const,
    label: 'Bug Scoring',
    description:
      'Scores reported bugs for existing applications across five dimensions (severity, blast radius, reproducibility, remediation confidence, recurrence). Can use a lighter model since scoring is analytical.',
    whenDisabled:
      'Bug scoring uses the rules-based heuristic engine only. Scored bugs display "Scored using rules engine (AI scoring disabled)."',
  },
  {
    functionKey: 'featureScoring' as const,
    label: 'Feature Request Scoring',
    description:
      'Scores feature requests (enhancements to existing applications) across four dimensions (demand, alignment, complexity, impact). Can use a lighter model since scoring is analytical.',
    whenDisabled:
      'Feature request scoring uses the rules-based heuristic engine only. Scored requests display "Scored using rules engine (AI scoring disabled)."',
  },
  {
    functionKey: 'abstraction' as const,
    label: 'Build Translation',
    description:
      'Translates raw agent output into plain English during builds. Used as fallback when pattern matching does not cover the output. Also powers phase-mapping intelligence.',
    whenDisabled:
      'The abstraction layer uses pattern matching only. Unmatched agent output is displayed as-is in the translated feed.',
  },
]

function AIConfigTab() {
  const aiSettings = useSettingsStore((s) => s.aiSettings)
  const updateAISettings = useSettingsStore((s) => s.updateAISettings)
  const [dowInfoOpen, setDowInfoOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-light text-foreground">AI Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Configure the AI provider and model settings for all AI-powered features. All AI calls
          route through OpenRouter.
        </p>
      </div>

      <APIKeyField />

      {/* DoW Compliance Toggle */}
      <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-foreground">DoW Compliance</h3>
                <button
                  onClick={() => setDowInfoOpen(true)}
                  className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="DoW compliance information"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Restrict the platform to Department of War approved AI vendors only. Removes
                Anthropic models, locks Zero Data Retention, and disables Claude Code in the dev
                portal.
              </p>
            </div>
          </div>
          <Switch
            checked={aiSettings.dowCompliance}
            onCheckedChange={(checked) => updateAISettings({ dowCompliance: checked })}
          />
        </div>
      </div>

      {/* Zero Data Retention Toggle */}
      <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Zero Data Retention</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                When enabled, OpenRouter providers will not store or train on any data sent through
                the API. Recommended for sensitive project data.
              </p>
              {aiSettings.dowCompliance && (
                <p className="text-xs text-amber-400 mt-1">Locked on by DoW Compliance</p>
              )}
            </div>
          </div>
          <Switch
            checked={aiSettings.zeroDataRetention}
            onCheckedChange={(checked) => updateAISettings({ zeroDataRetention: checked })}
            disabled={aiSettings.dowCompliance}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Model Assignment
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {MODEL_FUNCTIONS.map((fn) => (
            <ModelAssignment key={fn.functionKey} {...fn} />
          ))}
        </div>
      </div>

      {/* DoW Compliance Info Dialog */}
      <Dialog open={dowInfoOpen} onOpenChange={setDowInfoOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              DoW Compliance Mode
            </DialogTitle>
            <DialogDescription>
              Enabling DoW Compliance restricts the platform to Department of War approved AI vendors
              and enforces data handling requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="text-amber-400 font-mono text-xs mt-0.5 shrink-0">1.</span>
              <p>
                <span className="text-foreground font-medium">Anthropic models removed</span> — All
                Claude models are replaced with OpenAI equivalents across every function assignment.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400 font-mono text-xs mt-0.5 shrink-0">2.</span>
              <p>
                <span className="text-foreground font-medium">Zero Data Retention locked on</span>{' '}
                — ZDR cannot be disabled while DoW Compliance is active.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400 font-mono text-xs mt-0.5 shrink-0">3.</span>
              <p>
                <span className="text-foreground font-medium">Claude Code disabled</span> — The
                Claude model option is hidden from the dev portal build environment settings.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400 font-mono text-xs mt-0.5 shrink-0">4.</span>
              <p>
                <span className="text-foreground font-medium">Compliance scaffolding injected</span>{' '}
                — A DoW compliance policy document is added to the scaffolding context automatically.
              </p>
            </div>
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AIConfigTab

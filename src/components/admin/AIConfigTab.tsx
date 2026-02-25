import { ShieldCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/stores/settings';
import APIKeyField from './APIKeyField';
import ModelAssignment from './ModelAssignment';

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
];

function AIConfigTab() {
  const aiSettings = useSettingsStore((s) => s.aiSettings);
  const updateAISettings = useSettingsStore((s) => s.updateAISettings);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-light text-foreground">AI Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Configure the AI provider and model settings for all AI-powered features. All AI calls route through OpenRouter.
        </p>
      </div>

      <APIKeyField />

      <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-foreground">Zero Data Retention</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                When enabled, OpenRouter providers will not store or train on any data sent through the API.
                Recommended for sensitive project data.
              </p>
            </div>
          </div>
          <Switch
            checked={aiSettings.zeroDataRetention}
            onCheckedChange={(checked) => updateAISettings({ zeroDataRetention: checked })}
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
    </div>
  );
}

export default AIConfigTab;

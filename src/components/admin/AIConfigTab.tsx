import APIKeyField from './APIKeyField';
import ModelAssignment from './ModelAssignment';

const MODEL_FUNCTIONS = [
  {
    functionKey: 'charter' as const,
    label: 'Charter Generation',
    description:
      'Generates project charters from intake data and scaffolding context. Benefits from a high-capability model since charter quality directly impacts build outcomes.',
    whenDisabled:
      'Charter generation falls back to mock/template output. A notice appears on the charter generation button: "AI generation disabled — using template output."',
  },
  {
    functionKey: 'scoring' as const,
    label: 'Idea Scoring',
    description:
      'AI-assisted scoring of ideas across the four dimensions (impact, urgency, feasibility, alignment). Can use a lighter model since scoring is analytical rather than generative.',
    whenDisabled:
      'Scoring uses the rules-based heuristic engine only. A notice appears on scored ideas: "Scored using rules engine (AI scoring disabled)."',
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
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-light text-foreground">AI Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Configure the AI provider and model settings for all AI-powered features. All AI calls route through OpenRouter.
        </p>
      </div>

      <APIKeyField />

      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Model Assignment
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {MODEL_FUNCTIONS.map((fn) => (
            <ModelAssignment key={fn.functionKey} {...fn} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIConfigTab;

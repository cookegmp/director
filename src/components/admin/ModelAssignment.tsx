import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore } from '@/stores/settings';

const STATIC_MODELS = [
  'anthropic/claude-sonnet-4',
  'anthropic/claude-haiku',
  'anthropic/claude-opus',
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'google/gemini-2.0-flash',
  'google/gemini-2.5-pro',
  'meta/llama-3.1-70b',
  'mistral/mistral-large',
];

interface ModelAssignmentProps {
  functionKey: 'charter' | 'executionPlan' | 'scoring' | 'conversation' | 'issueScoring' | 'ideaChat' | 'abstraction';
  label: string;
  description: string;
  whenDisabled: string;
}

function ModelAssignment({ functionKey, label, description, whenDisabled }: ModelAssignmentProps) {
  const aiSettings = useSettingsStore((s) => s.aiSettings);
  const updateAISettings = useSettingsStore((s) => s.updateAISettings);

  const modelKey = `${functionKey}Model` as keyof typeof aiSettings;
  const enabledKey = `${functionKey}Enabled` as keyof typeof aiSettings;

  const currentModel = aiSettings[modelKey] as string;
  const isEnabled = aiSettings[enabledKey] as boolean;

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <h4 className="text-sm font-medium text-foreground">{label}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => updateAISettings({ [enabledKey]: checked })}
        />
      </div>

      {isEnabled ? (
        <Select
          value={currentModel}
          onValueChange={(val) => updateAISettings({ [modelKey]: val })}
        >
          <SelectTrigger className="bg-transparent border-border text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATIC_MODELS.map((model) => (
              <SelectItem key={model} value={model}>
                <span className="font-mono text-xs">{model}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p className="text-xs text-amber-400/80 bg-amber-500/10 rounded-lg px-3 py-2 leading-relaxed">
          {whenDisabled}
        </p>
      )}
    </div>
  );
}

export default ModelAssignment;

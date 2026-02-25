import { Slider } from '@/components/ui/slider';
import { useSettingsStore } from '@/stores/settings';
import VerbosityPreview from './VerbosityPreview';

const VERBOSITY_LABELS: Record<number, string> = {
  1: 'Minimal',
  2: 'Brief',
  3: 'Standard',
  4: 'Detailed',
  5: 'Verbose',
};

function TranslationTab() {
  const verbosity = useSettingsStore((s) => s.aiSettings.translationVerbosity);
  const setVerbosity = useSettingsStore((s) => s.setVerbosity);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-light text-foreground">Build Translation Settings</h2>
        <p className="text-sm text-muted-foreground">
          Fine-tune how the abstraction layer translates agent output into plain English for the development portal.
        </p>
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-5 space-y-5">
        <div>
          <h3 className="text-sm font-medium text-foreground mb-1">Translation Verbosity</h3>
          <p className="text-xs text-muted-foreground">
            Controls how much detail appears in the translated activity feed during builds.
          </p>
        </div>

        <div className="space-y-3">
          <Slider
            min={1}
            max={5}
            step={1}
            value={[verbosity]}
            onValueChange={([val]) => setVerbosity(val)}
            className="py-2"
          />
          <div className="flex justify-between">
            {Object.entries(VERBOSITY_LABELS).map(([level, label]) => (
              <span
                key={level}
                className={`text-xs transition-colors ${
                  Number(level) === verbosity
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <VerbosityPreview level={verbosity} />
    </div>
  );
}

export default TranslationTab;

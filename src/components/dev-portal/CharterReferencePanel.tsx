import { useState, useMemo } from 'react';
import { ChevronRight, CheckCircle, Circle, Activity } from 'lucide-react';
import { useChartersStore } from '@/stores/charters';
import type { TranslatedEntry } from '@/types';

type PhaseStatus = 'complete' | 'in-progress' | 'not-started';

const STATUS_CONFIG: Record<PhaseStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  complete: { label: 'Complete', icon: CheckCircle, className: 'text-green-400' },
  'in-progress': { label: 'In Progress', icon: Activity, className: 'text-primary' },
  'not-started': { label: 'Not Started', icon: Circle, className: 'text-muted-foreground' },
};

interface CharterReferencePanelProps {
  charterId: string;
  entries?: TranslatedEntry[];
}

function CharterReferencePanel({ charterId, entries = [] }: CharterReferencePanelProps) {
  const charter = useChartersStore((s) => s.getCharter(charterId));
  const [collapsed, setCollapsed] = useState(true);

  // Derive phase status from translated entries
  const phaseStatuses = useMemo(() => {
    const planPhases = charter?.content.executionPlan ?? [];
    const phaseNames = planPhases.map((p) => p.phase.toLowerCase());

    // Collect entry types per phase
    const phaseEntryTypes = new Map<string, Set<string>>();
    for (const entry of entries) {
      const key = entry.phase.toLowerCase();
      if (!phaseEntryTypes.has(key)) {
        phaseEntryTypes.set(key, new Set());
      }
      phaseEntryTypes.get(key)!.add(entry.type);
    }

    return phaseNames.map((name): PhaseStatus => {
      const types = phaseEntryTypes.get(name);
      if (!types) return 'not-started';
      if (types.has('complete')) return 'complete';
      return 'in-progress';
    });
  }, [charter, entries]);

  if (!charter) return null;

  const { content } = charter;

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full px-5 py-3"
      >
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            !collapsed ? 'rotate-90' : ''
          }`}
        />
        <span className="text-sm font-light text-foreground">Charter Reference</span>
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-5 max-h-[500px] overflow-y-auto feed-scroll">
          {/* Overview */}
          <section>
            <h3 className="text-sm font-medium text-foreground mb-2">Project Overview</h3>
            <p className="text-sm text-foreground/70 font-light leading-relaxed">{content.projectOverview}</p>
          </section>

          {/* Objectives */}
          <section>
            <h3 className="text-sm font-medium text-foreground mb-2">Objectives</h3>
            <ul className="space-y-1.5">
              {content.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/70 font-light">
                  <span className="text-primary text-xs mt-0.5">{i + 1}.</span>
                  {obj}
                </li>
              ))}
            </ul>
          </section>

          {/* Acceptance Criteria */}
          <section>
            <h3 className="text-sm font-medium text-foreground mb-2">Acceptance Criteria</h3>
            <ul className="space-y-1.5">
              {content.acceptanceCriteria.map((criteria, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/70 font-light">
                  <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                  {criteria}
                </li>
              ))}
            </ul>
          </section>

          {/* Execution Plan */}
          <section>
            <h3 className="text-sm font-medium text-foreground mb-2">Execution Plan</h3>
            <div className="space-y-2">
              {content.executionPlan.map((phase, i) => {
                const status = phaseStatuses[i] ?? 'not-started';
                const config = STATUS_CONFIG[status];
                const StatusIcon = config.icon;

                return (
                  <div key={i} className="border border-border rounded-[1rem] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-medium text-foreground">
                        Phase {i + 1}: {phase.phase}
                      </h4>
                      <div className={`flex items-center gap-1.5 ${config.className}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span className="text-xs">{config.label}</span>
                      </div>
                    </div>
                    <ul className="space-y-0.5">
                      {phase.tasks.map((task, j) => (
                        <li key={j} className="text-xs text-foreground/60 font-light flex items-start gap-1.5">
                          <span className="text-muted-foreground">-</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default CharterReferencePanel;

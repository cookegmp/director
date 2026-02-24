import { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { useChartersStore } from '@/stores/charters';
import { Badge } from '@/components/ui/badge';

interface CharterReferencePanelProps {
  charterId: string;
}

function CharterReferencePanel({ charterId }: CharterReferencePanelProps) {
  const charter = useChartersStore((s) => s.getCharter(charterId));
  const [collapsed, setCollapsed] = useState(true);

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
              {content.executionPlan.map((phase, i) => (
                <div key={i} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-medium text-foreground">
                      Phase {i + 1}: {phase.phase}
                    </h4>
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      {phase.duration}
                    </Badge>
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
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default CharterReferencePanel;

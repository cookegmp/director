import { ArrowLeft, Zap, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAgentsSkillsStore } from '@/stores/agents-skills';
import type { SkillDefinition, SkillSyncStatus } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  inactive: 'bg-muted text-muted-foreground border-border',
  draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const SYNC_STYLES: Record<SkillSyncStatus, { className: string; label: string }> = {
  synced: { className: 'bg-teal-500/20 text-teal-400 border-teal-500/30', label: 'Synced' },
  pending: { className: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Pending' },
  error: { className: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Error' },
  'not-synced': { className: 'bg-muted text-muted-foreground border-border', label: 'Not Synced' },
};

interface SkillDetailPanelProps {
  skill: SkillDefinition;
  onBack: () => void;
}

function SkillDetailPanel({ skill, onBack }: SkillDetailPanelProps) {
  const setSkillStatus = useAgentsSkillsStore((s) => s.setSkillStatus);
  const agents = useAgentsSkillsStore((s) => s.agents);
  const linkedAgent = skill.agentId ? agents.find((a) => a.id === skill.agentId) : null;

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to skills
      </button>

      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-light text-foreground">{skill.name}</h2>
              <p className="text-sm text-muted-foreground">{skill.description}</p>
            </div>
          </div>
          <Badge variant="outline" className={STATUS_STYLES[skill.status]}>
            {skill.status.charAt(0).toUpperCase() + skill.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Trigger</span>
              <p className="text-sm text-foreground mt-1 font-mono">{skill.trigger}</p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Linked Agent</span>
              {linkedAgent ? (
                <p className="text-sm text-foreground mt-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                  {linkedAgent.name}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">Independent (no agent)</p>
              )}
            </div>

            {Object.keys(skill.syncTargets).length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sync Status</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {Object.entries(skill.syncTargets).map(([env, status]) => {
                    const config = SYNC_STYLES[status];
                    return (
                      <Badge key={env} variant="outline" className={config.className}>
                        {env}: {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Instructions</span>
            <div className="mt-1.5 p-3 bg-muted/30 rounded-lg border border-border max-h-64 overflow-y-auto">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{skill.instructions}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
          {skill.status !== 'active' && (
            <Button onClick={() => setSkillStatus(skill.id, 'active')} size="sm">
              Activate
            </Button>
          )}
          {skill.status === 'active' && (
            <Button onClick={() => setSkillStatus(skill.id, 'inactive')} variant="outline" size="sm">
              Deactivate
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            Created {new Date(skill.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SkillDetailPanel;

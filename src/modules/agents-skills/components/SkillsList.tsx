import { useState } from 'react';
import { Plus, MoreHorizontal, Zap, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAgentsSkillsStore } from '@/stores/agents-skills';
import type { SkillDefinition } from '@/types';
import SkillDetailPanel from './SkillDetailPanel';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  inactive: 'bg-muted text-muted-foreground border-border',
  draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const STATUS_DOTS: Record<string, string> = {
  active: 'bg-teal-400',
  inactive: 'bg-muted-foreground',
  draft: 'bg-amber-400',
};

interface SkillsListProps {
  onCreateNew: () => void;
}

function SkillsList({ onCreateNew }: SkillsListProps) {
  const skills = useAgentsSkillsStore((s) => s.skills);
  const agents = useAgentsSkillsStore((s) => s.agents);
  const setSkillStatus = useAgentsSkillsStore((s) => s.setSkillStatus);
  const removeSkill = useAgentsSkillsStore((s) => s.removeSkill);
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return null;
    return agents.find((a) => a.id === agentId)?.name ?? null;
  };

  if (selectedSkill) {
    return (
      <SkillDetailPanel
        skill={selectedSkill}
        onBack={() => setSelectedSkill(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-foreground">Skills</h2>
          <p className="text-sm text-muted-foreground">
            Triggered capabilities registered in the Backstage database.
          </p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-12 text-center">
          <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No skills configured yet.</p>
          <Button onClick={onCreateNew} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create your first skill
          </Button>
        </div>
      ) : (
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Skill
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Trigger
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Agent
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Updated
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {skills.map((skill) => {
                const agentName = getAgentName(skill.agentId);

                return (
                  <tr
                    key={skill.id}
                    className="transition-colors hover:bg-accent/30 cursor-pointer"
                    onClick={() => setSelectedSkill(skill)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{skill.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[280px]">{skill.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-mono">
                        {skill.trigger}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {agentName ? (
                        <span className="text-sm text-foreground/80 flex items-center gap-1.5">
                          <Link2 className="w-3 h-3 text-muted-foreground" />
                          {agentName}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Independent</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={STATUS_STYLES[skill.status]}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_DOTS[skill.status]}`} />
                        {skill.status.charAt(0).toUpperCase() + skill.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(skill.updatedAt)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {skill.status !== 'active' && (
                            <DropdownMenuItem onClick={() => setSkillStatus(skill.id, 'active')}>
                              Activate
                            </DropdownMenuItem>
                          )}
                          {skill.status === 'active' && (
                            <DropdownMenuItem onClick={() => setSkillStatus(skill.id, 'inactive')}>
                              Deactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => removeSkill(skill.id)}
                          >
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SkillsList;

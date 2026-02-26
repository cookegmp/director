import { useState } from 'react';
import { Plus, MoreHorizontal, Bot, Cpu } from 'lucide-react';
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
import type { AgentDefinition } from '@/types';
import AgentDetailPanel from './AgentDetailPanel';

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

interface AgentsListProps {
  onCreateNew: () => void;
}

function AgentsList({ onCreateNew }: AgentsListProps) {
  const agents = useAgentsSkillsStore((s) => s.agents);
  const setAgentStatus = useAgentsSkillsStore((s) => s.setAgentStatus);
  const removeAgent = useAgentsSkillsStore((s) => s.removeAgent);
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);

  if (selectedAgent) {
    return (
      <AgentDetailPanel
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-foreground">Agents</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered workers registered in the Backstage database.
          </p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-12 text-center">
          <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No agents configured yet.</p>
          <Button onClick={onCreateNew} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create your first agent
          </Button>
        </div>
      ) : (
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Agent
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Model
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Tools
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
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="transition-colors hover:bg-accent/30 cursor-pointer"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[280px]">{agent.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                      <Cpu className="w-3 h-3" />
                      {agent.model.split('/').pop()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {agent.tools.slice(0, 2).map((tool) => (
                        <Badge key={tool} variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                          {tool}
                        </Badge>
                      ))}
                      {agent.tools.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{agent.tools.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={STATUS_STYLES[agent.status]}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_DOTS[agent.status]}`} />
                      {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(agent.updatedAt)}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {agent.status !== 'active' && (
                          <DropdownMenuItem onClick={() => setAgentStatus(agent.id, 'active')}>
                            Activate
                          </DropdownMenuItem>
                        )}
                        {agent.status === 'active' && (
                          <DropdownMenuItem onClick={() => setAgentStatus(agent.id, 'inactive')}>
                            Deactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => removeAgent(agent.id)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AgentsList;

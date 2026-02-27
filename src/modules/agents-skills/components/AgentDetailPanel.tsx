import { ArrowLeft, Bot, Cpu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAgentsSkillsStore } from '@/stores/agents-skills'
import type { AgentDefinition } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  inactive: 'bg-muted text-muted-foreground border-border',
  draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

interface AgentDetailPanelProps {
  agent: AgentDefinition
  onBack: () => void
}

function AgentDetailPanel({ agent, onBack }: AgentDetailPanelProps) {
  const setAgentStatus = useAgentsSkillsStore((s) => s.setAgentStatus)
  const skills = useAgentsSkillsStore((s) => s.skills)
  const linkedSkills = skills.filter((s) => s.agentId === agent.id)

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to agents
      </button>

      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-light text-foreground">{agent.name}</h2>
              <p className="text-sm text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          <Badge variant="outline" className={STATUS_STYLES[agent.status]}>
            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Model</span>
              <p className="text-sm text-foreground mt-1 font-mono flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                {agent.model}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Max Turns
              </span>
              <p className="text-sm text-foreground mt-1">{agent.maxTurns}</p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Tools</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {agent.tools.map((tool) => (
                  <Badge key={tool} variant="outline" className="text-xs font-mono">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>

            {linkedSkills.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Linked Skills
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {linkedSkills.map((skill) => (
                    <Badge key={skill.id} variant="outline" className="text-xs">
                      {skill.trigger} {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              System Prompt
            </span>
            <div className="mt-1.5 p-3 bg-muted/30 rounded-lg border border-border max-h-64 overflow-y-auto">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {agent.systemPrompt}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
          {agent.status !== 'active' && (
            <Button onClick={() => setAgentStatus(agent.id, 'active')} size="sm">
              Activate
            </Button>
          )}
          {agent.status === 'active' && (
            <Button
              onClick={() => setAgentStatus(agent.id, 'inactive')}
              variant="outline"
              size="sm"
            >
              Deactivate
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            Created {new Date(agent.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AgentDetailPanel

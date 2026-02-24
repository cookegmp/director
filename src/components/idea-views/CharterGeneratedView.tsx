import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RefreshCw, Pencil, ChevronRight, CheckCircle } from 'lucide-react';
import { useIdeasStore } from '@/stores/ideas';
import { useChartersStore } from '@/stores/charters';
import { useActivityStore } from '@/stores/activity';
import { useAgentSessionsStore } from '@/stores/agent-sessions';
import ScoreBreakdown from '@/components/scoring/ScoreBreakdown';
import GradientButton from '@/components/shared/GradientButton';
import { Badge } from '@/components/ui/badge';
import { generateId } from '@/lib/utils';
import { generateCharter } from '@/lib/charter-generator';
import type { Idea } from '@/types';

interface CharterGeneratedViewProps {
  idea: Idea;
}

function CharterGeneratedView({ idea }: CharterGeneratedViewProps) {
  const navigate = useNavigate();
  const updateIdea = useIdeasStore((s) => s.updateIdea);
  const charter = useChartersStore((s) => s.getCharter(idea.linkedCharterId ?? ''));
  const updateCharter = useChartersStore((s) => s.updateCharter);
  const addActivity = useActivityStore((s) => s.addActivity);
  const addSession = useAgentSessionsStore((s) => s.addSession);
  const [scoreCollapsed, setScoreCollapsed] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  if (!charter) return null;

  const { content } = charter;

  const handleStartDevelopment = () => {
    const sessionId = generateId();
    const now = new Date().toISOString();

    addSession({
      id: sessionId,
      ideaId: idea.id,
      charterId: charter.id,
      status: 'connecting',
      translatedEntries: [],
      rawOutput: [],
      errors: [],
      createdAt: now,
      connectedAt: null,
      completedAt: null,
      stoppedAt: null,
    });

    updateIdea(idea.id, {
      status: 'development',
      activeSessionId: sessionId,
    });

    addActivity({
      id: generateId(),
      type: 'build-started',
      entityId: idea.id,
      entityType: 'idea',
      summary: `Development started for "${idea.title}"`,
      createdAt: now,
    });
  };

  const handleRegenerateCharter = async () => {
    setRegenerating(true);
    try {
      const now = new Date().toISOString();
      const newContent = await generateCharter(idea);
      updateCharter(charter.id, { content: newContent });
      addActivity({
        id: generateId(),
        type: 'charter-generated',
        entityId: charter.id,
        entityType: 'charter',
        summary: `Charter regenerated for "${idea.title}"`,
        createdAt: now,
      });
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Score breakdown (collapsible) */}
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border">
        <button
          onClick={() => setScoreCollapsed(!scoreCollapsed)}
          className="flex items-center gap-2 w-full px-6 py-4"
        >
          <ChevronRight
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              !scoreCollapsed ? 'rotate-90' : ''
            }`}
          />
          <span className="text-sm font-light text-foreground">Priority Score</span>
          <span className="text-sm text-muted-foreground ml-2">
            {Math.round(idea.compositeScore)}
          </span>
        </button>
        {!scoreCollapsed && (
          <div className="px-6 pb-5 border-t border-border pt-4">
            <ScoreBreakdown scores={idea.scores} compositeScore={idea.compositeScore} />
          </div>
        )}
      </div>

      {/* Charter content - primary focus */}
      <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-3">Project Overview</h2>
        <p className="text-foreground/80 font-light leading-relaxed">{content.projectOverview}</p>
      </section>

      <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-3">Objectives</h2>
        <ul className="space-y-2">
          {content.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-primary mt-0.5 text-sm font-medium">{i + 1}.</span>
              <span className="text-foreground/80 font-light">{obj}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-3">Acceptance Criteria</h2>
        <ul className="space-y-2">
          {content.acceptanceCriteria.map((criteria, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <span className="text-foreground/80 font-light">{criteria}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Execution Plan */}
      <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-4">Execution Plan</h2>
        <div className="space-y-4">
          {content.executionPlan.map((phase, i) => (
            <div key={i} className="border border-border rounded-[0.75rem] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-foreground font-medium text-sm">
                  Phase {i + 1}: {phase.phase}
                </h3>
                <Badge variant="outline" className="text-muted-foreground">
                  {phase.duration}
                </Badge>
              </div>
              <ul className="space-y-1 ml-4">
                {phase.tasks.map((task, j) => (
                  <li key={j} className="text-sm text-foreground/70 font-light flex items-start gap-2">
                    <span className="text-muted-foreground">-</span>
                    {task}
                  </li>
                ))}
              </ul>
              {phase.dependencies.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Depends on: {phase.dependencies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <GradientButton onClick={handleStartDevelopment}>
          <Play className="w-4 h-4" />
          Start Development
        </GradientButton>
        <button
          onClick={handleRegenerateCharter}
          disabled={regenerating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
          {regenerating ? 'Regenerating...' : 'Regenerate Charter'}
        </button>
        <button
          onClick={() => navigate('/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
      </div>
    </div>
  );
}

export default CharterGeneratedView;

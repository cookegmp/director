import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Pencil, Archive } from 'lucide-react';
import { useIdeasStore } from '@/stores/ideas';
import { useChartersStore } from '@/stores/charters';
import { useActivityStore } from '@/stores/activity';
import ScoreBreakdown from '@/components/scoring/ScoreBreakdown';
import GradientButton from '@/components/shared/GradientButton';
import { generateId } from '@/lib/utils';
import { generateCharter } from '@/lib/charter-generator';
import type { Idea } from '@/types';

const STEP_LABELS: Record<string, string> = {
  problem: 'Problem / Opportunity',
  impact: 'Impact & Scope',
  'current-state': 'Current State',
  'desired-outcome': 'Desired Outcome',
  constraints: 'Constraints',
  urgency: 'Urgency',
};

interface ScoredViewProps {
  idea: Idea;
}

function ScoredView({ idea }: ScoredViewProps) {
  const navigate = useNavigate();
  const updateIdea = useIdeasStore((s) => s.updateIdea);
  const addCharter = useChartersStore((s) => s.addCharter);
  const addActivity = useActivityStore((s) => s.addActivity);
  const [generating, setGenerating] = useState(false);

  const handleGenerateCharter = async () => {
    setGenerating(true);
    try {
      const charterId = generateId();
      const now = new Date().toISOString();
      const content = await generateCharter(idea);

      addCharter({
        id: charterId,
        ideaId: idea.id,
        title: idea.title,
        content,
        scaffoldingRefs: ['company-context', 'technology-preferences', 'quality-standards'],
        createdAt: now,
        updatedAt: now,
        linkedIssueIds: [],
      });

      updateIdea(idea.id, {
        status: 'on-deck',
        linkedCharterId: charterId,
      });

      addActivity({
        id: generateId(),
        type: 'charter-generated',
        entityId: charterId,
        entityType: 'charter',
        summary: `Charter generated for "${idea.title}"`,
        createdAt: now,
      });

      navigate(`/ideas/${idea.id}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleArchive = () => {
    updateIdea(idea.id, { status: 'archived' });
    navigate('/ideas');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Score breakdown */}
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-4">Priority Score</h2>
        <ScoreBreakdown scores={idea.scores} compositeScore={idea.compositeScore} />
      </div>

      {/* Intake summary */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <h2 className="text-lg font-light text-foreground mb-4">Intake Summary</h2>
          <div className="space-y-4">
            {Object.entries(idea.intakeAnswers).map(([stepId, answer]) => {
              if (!answer) return null;
              return (
                <div key={stepId}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {STEP_LABELS[stepId] ?? stepId}
                  </h3>
                  <p className="text-foreground font-light">{answer}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <GradientButton onClick={handleGenerateCharter} disabled={generating}>
            <FileText className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Charter'}
          </GradientButton>
          {idea.linkedCharterId && (
            <Link
              to={`/charters/${idea.linkedCharterId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-primary/30 transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Charter
            </Link>
          )}
          <button
            onClick={() => navigate('/new/idea')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleArchive}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <Archive className="w-4 h-4" />
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScoredView;

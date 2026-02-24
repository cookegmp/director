import { useNavigate } from 'react-router-dom';
import { ArchiveRestore } from 'lucide-react';
import { useIdeasStore } from '@/stores/ideas';
import type { Idea } from '@/types';

const STEP_LABELS: Record<string, string> = {
  problem: 'Problem / Opportunity',
  impact: 'Impact & Scope',
  'current-state': 'Current State',
  'desired-outcome': 'Desired Outcome',
  constraints: 'Constraints',
  urgency: 'Urgency',
};

interface ArchivedViewProps {
  idea: Idea;
}

function ArchivedView({ idea }: ArchivedViewProps) {
  const navigate = useNavigate();
  const updateIdea = useIdeasStore((s) => s.updateIdea);

  const handleUnarchive = () => {
    // Restore to scored (safest fallback)
    updateIdea(idea.id, { status: 'scored' });
    navigate(`/ideas/${idea.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <span className="text-sm text-muted-foreground">This idea has been archived</span>
        </div>
        <h2 className="text-lg font-light text-foreground mb-4">Intake Summary</h2>
        <div className="space-y-4">
          {Object.entries(idea.intakeAnswers).map(([stepId, answer]) => {
            if (!answer) return null;
            return (
              <div key={stepId}>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {STEP_LABELS[stepId] ?? stepId}
                </h3>
                <p className="text-foreground/70 font-light">{answer}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleUnarchive}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-primary/30 transition-colors"
        >
          <ArchiveRestore className="w-4 h-4" />
          Unarchive
        </button>
      </div>
    </div>
  );
}

export default ArchivedView;

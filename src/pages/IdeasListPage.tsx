import { Link } from 'react-router-dom';
import { useIdeasStore } from '@/stores/ideas';
import { Badge } from '@/components/ui/badge';
import { getScoreTier, getTierBadgeClasses, STATUS_LABELS } from '@/types';
import type { IdeaStatus } from '@/types';

const STATUS_BADGE_CLASSES: Record<IdeaStatus, string> = {
  scored: 'text-muted-foreground',
  'charter-generated': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'in-development': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  production: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function IdeasListPage() {
  const ideas = useIdeasStore((s) => s.ideas);
  const sorted = [...ideas].sort((a, b) => b.compositeScore - a.compositeScore);

  return (
    <div>
      <h1 className="text-2xl font-light text-foreground mb-6">Ideas</h1>
      {sorted.length === 0 ? (
        <p className="text-muted-foreground">No ideas yet. Start by creating a new idea.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((idea) => {
            const tier = getScoreTier(idea.compositeScore);
            return (
              <Link
                key={idea.id}
                to={`/ideas/${idea.id}`}
                className="block bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground font-light">{idea.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {idea.intakeAnswers.problem?.slice(0, 100)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getTierBadgeClasses(tier)}>
                      {Math.round(idea.compositeScore)}
                    </Badge>
                    <Badge variant="outline" className={STATUS_BADGE_CLASSES[idea.status]}>
                      {STATUS_LABELS[idea.status]}
                    </Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default IdeasListPage;

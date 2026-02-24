import { Link } from 'react-router-dom';
import { useChartersStore } from '@/stores/charters';
import { useIdeasStore } from '@/stores/ideas';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/types';
import type { IdeaStatus } from '@/types';

const STATUS_BADGE_CLASSES: Record<IdeaStatus, string> = {
  scored: 'text-muted-foreground',
  'charter-generated': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'in-development': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  production: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function ChartersListPage() {
  const charters = useChartersStore((s) => s.charters);
  const getIdea = useIdeasStore((s) => s.getIdea);

  return (
    <div>
      <h1 className="text-2xl font-light text-foreground mb-6">Charters</h1>
      {charters.length === 0 ? (
        <p className="text-muted-foreground">No charters generated yet.</p>
      ) : (
        <div className="space-y-3">
          {charters.map((charter) => {
            const idea = getIdea(charter.ideaId);
            return (
              <Link
                key={charter.id}
                to={`/charters/${charter.id}`}
                className="block bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground font-light">{charter.title}</h3>
                  {idea && (
                    <Badge variant="outline" className={STATUS_BADGE_CLASSES[idea.status]}>
                      {STATUS_LABELS[idea.status]}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ChartersListPage;

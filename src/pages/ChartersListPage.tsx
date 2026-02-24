import { Link } from 'react-router-dom';
import { useChartersStore } from '@/stores/charters';
import { Badge } from '@/components/ui/badge';

function ChartersListPage() {
  const charters = useChartersStore((s) => s.charters);

  return (
    <div>
      <h1 className="text-2xl font-light text-foreground mb-6">Charters</h1>
      {charters.length === 0 ? (
        <p className="text-muted-foreground">No charters generated yet.</p>
      ) : (
        <div className="space-y-3">
          {charters.map((charter) => (
            <Link
              key={charter.id}
              to={`/charters/${charter.id}`}
              className="block bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-foreground font-light">{charter.title}</h3>
                <Badge variant="outline">{charter.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChartersListPage;

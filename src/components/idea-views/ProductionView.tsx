import { Link } from 'react-router-dom';
import { Bug, Wrench } from 'lucide-react';
import { useIdeasStore } from '@/stores/ideas';
import { useActivityStore } from '@/stores/activity';
import ProductionDashboard from '@/components/production/ProductionDashboard';
import { generateId } from '@/lib/utils';
import type { Idea } from '@/types';

interface ProductionViewProps {
  idea: Idea;
}

function ProductionView({ idea }: ProductionViewProps) {
  const updateIdea = useIdeasStore((s) => s.updateIdea);
  const addActivity = useActivityStore((s) => s.addActivity);

  const charterId = idea.linkedCharterId ?? '';

  const handleReturnToDevelopment = () => {
    const now = new Date().toISOString();
    updateIdea(idea.id, { status: 'development' });
    addActivity({
      id: generateId(),
      type: 'build-started',
      entityId: idea.id,
      entityType: 'idea',
      summary: `"${idea.title}" returned to development`,
      createdAt: now,
    });
  };

  return (
    <div className="space-y-6">
      <ProductionDashboard charterId={charterId} projectId={charterId} />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link
          to="/report"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-button text-white text-sm font-medium active:scale-95 transition-transform"
        >
          <Bug className="w-4 h-4" />
          File New Issue
        </Link>
        <button
          onClick={handleReturnToDevelopment}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Wrench className="w-4 h-4" />
          Return to Development
        </button>
      </div>
    </div>
  );
}

export default ProductionView;

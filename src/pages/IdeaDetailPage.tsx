import { useParams, Link } from 'react-router-dom';
import { useIdeasStore } from '@/stores/ideas';
import IdeaDetailHeader from '@/components/idea-views/IdeaDetailHeader';
import ScoredView from '@/components/idea-views/ScoredView';
import CharterGeneratedView from '@/components/idea-views/CharterGeneratedView';
import InDevelopmentView from '@/components/idea-views/InDevelopmentView';
import ProductionView from '@/components/idea-views/ProductionView';
import ArchivedView from '@/components/idea-views/ArchivedView';

function IdeaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const idea = useIdeasStore((s) => s.getIdea(id ?? ''));

  if (!idea) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Idea not found.</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <IdeaDetailHeader idea={idea} />
      {renderView(idea)}
    </div>
  );
}

function renderView(idea: ReturnType<typeof useIdeasStore.getState>['ideas'][number]) {
  switch (idea.status) {
    case 'scored':
      return <ScoredView idea={idea} />;
    case 'charter-generated':
      return <CharterGeneratedView idea={idea} />;
    case 'in-development':
      return <InDevelopmentView idea={idea} />;
    case 'production':
      return <ProductionView idea={idea} />;
    case 'archived':
      return <ArchivedView idea={idea} />;
  }
}

export default IdeaDetailPage;

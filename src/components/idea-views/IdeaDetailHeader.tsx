import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getScoreTier, getTierBadgeClasses, STATUS_LABELS } from '@/types';
import type { Idea, IdeaStatus } from '@/types';

const STATUS_BADGE_CLASSES: Record<IdeaStatus, string> = {
  scored: 'text-muted-foreground',
  'on-deck': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'development': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  production: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

interface IdeaDetailHeaderProps {
  idea: Idea;
}

function IdeaDetailHeader({ idea }: IdeaDetailHeaderProps) {
  const navigate = useNavigate();
  const tier = getScoreTier(idea.compositeScore);

  return (
    <div className="flex items-center gap-3 mb-8">
      <button
        onClick={() => navigate(-1)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-2xl font-light text-foreground">{idea.title}</h1>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className={getTierBadgeClasses(tier)}>
            Score: {Math.round(idea.compositeScore)}
          </Badge>
          <Badge variant="outline" className={STATUS_BADGE_CLASSES[idea.status]}>
            {STATUS_LABELS[idea.status]}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default IdeaDetailHeader;

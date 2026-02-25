// ============================================================================
// Issue Scoring — Score Badge
// ============================================================================
// Compact score badge for list views. Shows numeric score with tier color.
// ============================================================================

import { Badge } from '@/components/ui/badge';
import type { ScoreType } from '../types';
import { getBugScoreTier, getFeatureScoreTier, getBugTierClasses, getFeatureTierClasses } from '../types';

interface ScoreBadgeProps {
  score: number;
  type: ScoreType;
}

function ScoreBadge({ score, type }: ScoreBadgeProps) {
  const rounded = Math.round(score);
  const classes =
    type === 'bug'
      ? getBugTierClasses(getBugScoreTier(rounded))
      : getFeatureTierClasses(getFeatureScoreTier(rounded));

  return (
    <Badge variant="outline" className={`${classes} text-xs tabular-nums`}>
      {rounded}
    </Badge>
  );
}

export default ScoreBadge;

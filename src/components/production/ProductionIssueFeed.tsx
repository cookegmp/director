import { useIssuesStore } from '@/stores/issues';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import type { IssueSeverity, IssueStatus, IssueType } from '@/types';

const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const STATUS_COLORS: Record<IssueStatus, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'in-progress': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const TYPE_COLORS: Record<IssueType, string> = {
  bug: 'bg-red-500/20 text-red-400 border-red-500/30',
  'feature-request': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

interface ProductionIssueFeedProps {
  projectId: string;
}

function ProductionIssueFeed({ projectId }: ProductionIssueFeedProps) {
  const issues = useIssuesStore((s) => s.issues);
  const projectIssues = issues
    .filter((i) => i.projectId === projectId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (projectIssues.length === 0) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-3">Issues</h2>
        <p className="text-sm text-muted-foreground">No issues filed for this project yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
      <h2 className="text-lg font-light text-foreground mb-4">Issues</h2>
      <div className="space-y-2 max-h-[400px] overflow-y-auto feed-scroll">
        {projectIssues.map((issue) => (
          <div
            key={issue.id}
            className="p-3 rounded-lg border border-border hover:border-primary/20 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-xs ${TYPE_COLORS[issue.type]}`}>
                {issue.type === 'bug' ? 'Bug' : 'Feature'}
              </Badge>
              <Badge variant="outline" className={`text-xs ${SEVERITY_COLORS[issue.severity]}`}>
                {issue.severity}
              </Badge>
              <Badge variant="outline" className={`text-xs ${STATUS_COLORS[issue.status]}`}>
                {issue.status}
              </Badge>
            </div>
            <h3 className="text-sm text-foreground font-light">{issue.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(issue.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductionIssueFeed;

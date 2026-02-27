import { Bug, Clock, MessageSquare, TrendingDown, TrendingUp, Minus, Target } from 'lucide-react'
import { useIssuesStore } from '@/stores/issues'
import { useIssueScoresStore } from '@/modules/issue-scoring/stores/issue-scores'

interface HealthIndicatorsProps {
  projectId: string
}

function HealthIndicators({ projectId }: HealthIndicatorsProps) {
  const issues = useIssuesStore((s) => s.issues)
  const allScores = useIssueScoresStore((s) => s.scores)
  const projectIssues = issues.filter((i) => i.projectId === projectId)

  const openBugs = projectIssues.filter(
    (i) => i.type === 'bug' && (i.status === 'open' || i.status === 'in-progress'),
  )
  const criticalBugs = openBugs.filter((i) => i.severity === 'critical')
  const featureRequests = projectIssues.filter(
    (i) => i.type === 'feature-request' && i.status !== 'closed',
  )

  // Calculate avg resolution time from resolved/closed bugs
  const resolvedBugs = projectIssues.filter(
    (i) => i.type === 'bug' && (i.status === 'resolved' || i.status === 'closed'),
  )
  const avgResolutionDays =
    resolvedBugs.length > 0
      ? Math.round(
          resolvedBugs.reduce((sum, bug) => {
            const created = new Date(bug.createdAt).getTime()
            const updated = new Date(bug.updatedAt).getTime()
            return sum + (updated - created) / (1000 * 60 * 60 * 24)
          }, 0) / resolvedBugs.length,
        )
      : 0

  // Simple trend: compare open bugs now vs what we'd estimate as "previous" based on resolved count
  const trend =
    resolvedBugs.length > openBugs.length
      ? 'decreasing'
      : resolvedBugs.length === openBugs.length
        ? 'stable'
        : 'increasing'

  const bugCountColor =
    criticalBugs.length > 0 || openBugs.length >= 6
      ? 'text-red-400'
      : openBugs.length >= 3
        ? 'text-amber-400'
        : 'text-green-400'

  const resolutionColor =
    avgResolutionDays > 7
      ? 'text-red-400'
      : avgResolutionDays > 3
        ? 'text-amber-400'
        : 'text-green-400'

  const trendColor =
    trend === 'increasing'
      ? 'text-red-400'
      : trend === 'stable'
        ? 'text-amber-400'
        : 'text-green-400'
  const TrendIcon =
    trend === 'increasing' ? TrendingUp : trend === 'decreasing' ? TrendingDown : Minus

  // Avg Bug Score
  const bugIssueIds = projectIssues.filter((i) => i.type === 'bug').map((i) => i.id)
  const bugScores = allScores.filter(
    (s) => bugIssueIds.includes(s.issue_id) && s.score_type === 'bug',
  )
  const avgBugScore =
    bugScores.length > 0
      ? Math.round(bugScores.reduce((sum, s) => sum + s.composite_score, 0) / bugScores.length)
      : null
  const avgScoreColor =
    avgBugScore === null
      ? 'text-muted-foreground'
      : avgBugScore > 60
        ? 'text-red-400'
        : avgBugScore > 40
          ? 'text-amber-400'
          : 'text-green-400'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Open Bug Count */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-1">
          <Bug className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Open Bugs</span>
        </div>
        <p className={`text-2xl font-light tabular-nums ${bugCountColor}`}>{openBugs.length}</p>
        {criticalBugs.length > 0 && (
          <p className="text-xs text-red-400 mt-1">{criticalBugs.length} critical</p>
        )}
      </div>

      {/* Avg Resolution Time */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Avg Resolution
          </span>
        </div>
        <p className={`text-2xl font-light tabular-nums ${resolutionColor}`}>
          {resolvedBugs.length > 0 ? `${avgResolutionDays}d` : '--'}
        </p>
      </div>

      {/* Feature Request Count */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Feature Requests
          </span>
        </div>
        <p className="text-2xl font-light text-foreground tabular-nums">{featureRequests.length}</p>
      </div>

      {/* Issue Trend */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Issue Trend</span>
        </div>
        <p className={`text-lg font-light capitalize ${trendColor}`}>{trend}</p>
      </div>

      {/* Avg Bug Score */}
      <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Avg Bug Score
          </span>
        </div>
        <p className={`text-2xl font-light tabular-nums ${avgScoreColor}`}>
          {avgBugScore !== null ? avgBugScore : '--'}
        </p>
        {bugScores.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{bugScores.length} scored</p>
        )}
      </div>
    </div>
  )
}

export default HealthIndicators

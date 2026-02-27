import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Filter, ChevronRight, ArrowUpDown } from 'lucide-react'
import { useIssuesStore } from '@/stores/issues'
import { useActivityStore } from '@/stores/activity'
import { useIssueScoresStore } from '@/modules/issue-scoring/stores/issue-scores'
import { Badge } from '@/components/ui/badge'
import GradientButton from '@/components/shared/GradientButton'
import ScoreBadge from '@/modules/issue-scoring/components/ScoreBadge'
import ScoreDisplay from '@/modules/issue-scoring/components/ScoreDisplay'
import RemediationBanner from '@/modules/issue-scoring/components/RemediationBanner'
import { generateId, formatRelativeTime } from '@/lib/utils'
import type { IssueType, IssueSeverity, IssueStatus, Issue } from '@/types'

const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const STATUS_COLORS: Record<IssueStatus, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'in-progress': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const TYPE_COLORS: Record<IssueType, string> = {
  bug: 'bg-red-500/20 text-red-400 border-red-500/30',
  'feature-request': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

function IssuesPage() {
  const issues = useIssuesStore((s) => s.issues)
  const updateIssue = useIssuesStore((s) => s.updateIssue)
  const addActivity = useActivityStore((s) => s.addActivity)

  const scores = useIssueScoresStore((s) => s.scores)

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [filterType, setFilterType] = useState<IssueType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all')
  const [sortByScore, setSortByScore] = useState(false)

  const filteredIssues = issues
    .filter((issue) => {
      if (filterType !== 'all' && issue.type !== filterType) return false
      if (filterStatus !== 'all' && issue.status !== filterStatus) return false
      return true
    })
    .sort((a, b) => {
      if (!sortByScore) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      const scoreA = scores.find((s) => s.issue_id === a.id)?.composite_score ?? -1
      const scoreB = scores.find((s) => s.issue_id === b.id)?.composite_score ?? -1
      return scoreB - scoreA
    })

  const handleStatusChange = (issue: Issue, newStatus: IssueStatus) => {
    updateIssue(issue.id, { status: newStatus })
    addActivity({
      id: generateId(),
      type: 'status-changed',
      entityId: issue.id,
      entityType: 'issue',
      summary: `Issue "${issue.title}" moved to ${newStatus}`,
      createdAt: new Date().toISOString(),
    })
    setSelectedIssue({ ...issue, status: newStatus })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light text-foreground">Issues</h1>
        <Link to="/report">
          <GradientButton>
            <Plus className="w-4 h-4" />
            New Issue
          </GradientButton>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as IssueType | 'all')}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1"
        >
          <option value="all">All Types</option>
          <option value="bug">Bugs</option>
          <option value="feature-request">Feature Requests</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as IssueStatus | 'all')}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <button
          onClick={() => setSortByScore(!sortByScore)}
          className={`flex items-center gap-1 text-sm transition-colors ${
            sortByScore ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Score
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue list */}
        <div className="lg:col-span-2 space-y-2">
          {filteredIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No issues match the current filters.
            </p>
          ) : (
            filteredIssues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className={`w-full text-left p-4 rounded-[1rem] border transition-colors ${
                  selectedIssue?.id === issue.id
                    ? 'bg-accent/50 border-primary/30'
                    : 'bg-card/50 backdrop-blur-sm border-border hover:border-primary/20'
                }`}
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
                  {(() => {
                    const issueScore = scores.find((s) => s.issue_id === issue.id)
                    return issueScore ? (
                      <ScoreBadge score={issueScore.composite_score} type={issueScore.score_type} />
                    ) : null
                  })()}
                </div>
                <h3 className="text-sm text-foreground font-light">{issue.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(issue.createdAt)}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Detail panel / Form */}
        <div>
          {selectedIssue ? (
            <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={TYPE_COLORS[selectedIssue.type]}>
                  {selectedIssue.type === 'bug' ? 'Bug' : 'Feature Request'}
                </Badge>
                <Badge variant="outline" className={SEVERITY_COLORS[selectedIssue.severity]}>
                  {selectedIssue.severity}
                </Badge>
              </div>
              <h2 className="text-lg font-light text-foreground">{selectedIssue.title}</h2>
              <p className="text-sm text-foreground/80 font-light leading-relaxed">
                {selectedIssue.description || 'No description provided.'}
              </p>
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(['open', 'in-progress', 'resolved', 'closed'] as IssueStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedIssue, status)}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          selectedIssue.status === status
                            ? STATUS_COLORS[status]
                            : 'border-border text-muted-foreground hover:border-foreground/30'
                        }`}
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Created {formatRelativeTime(selectedIssue.createdAt)}
              </p>

              {/* Score Display & Remediation */}
              {(() => {
                const issueScore = scores.find((s) => s.issue_id === selectedIssue.id)
                if (!issueScore) return null
                return (
                  <div className="space-y-3 pt-2">
                    <RemediationBanner score={issueScore} projectId={selectedIssue.projectId} />
                    <ScoreDisplay score={issueScore} />
                  </div>
                )
              })()}
            </div>
          ) : (
            <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 text-center">
              <ChevronRight className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Select an issue to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IssuesPage

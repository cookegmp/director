import { useState } from 'react';
import { Plus, Filter, ChevronRight } from 'lucide-react';
import { useIssuesStore } from '@/stores/issues';
import { useChartersStore } from '@/stores/charters';
import { useActivityStore } from '@/stores/activity';
import { Badge } from '@/components/ui/badge';
import GradientButton from '@/components/shared/GradientButton';
import { generateId, formatRelativeTime } from '@/lib/utils';
import type { IssueType, IssueSeverity, IssueStatus, Issue } from '@/types';

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

function IssuesPage() {
  const issues = useIssuesStore((s) => s.issues);
  const addIssue = useIssuesStore((s) => s.addIssue);
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const charters = useChartersStore((s) => s.charters);
  const addActivity = useActivityStore((s) => s.addActivity);

  const [showForm, setShowForm] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterType, setFilterType] = useState<IssueType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<IssueType>('bug');
  const [formSeverity, setFormSeverity] = useState<IssueSeverity>('medium');
  const [formDescription, setFormDescription] = useState('');
  const [formProjectId, setFormProjectId] = useState<string>('');

  const filteredIssues = issues.filter((issue) => {
    if (filterType !== 'all' && issue.type !== filterType) return false;
    if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
    return true;
  });

  const handleSubmit = () => {
    if (!formTitle.trim()) return;
    const now = new Date().toISOString();
    const issueId = generateId();
    addIssue({
      id: issueId,
      type: formType,
      title: formTitle,
      description: formDescription,
      severity: formSeverity,
      status: 'open',
      projectId: formProjectId || null,
      createdAt: now,
      updatedAt: now,
      comments: [],
    });
    addActivity({
      id: generateId(),
      type: 'issue-filed',
      entityId: issueId,
      entityType: 'issue',
      summary: `New ${formType === 'bug' ? 'bug report' : 'feature request'}: "${formTitle}"`,
      createdAt: now,
    });
    setFormTitle('');
    setFormDescription('');
    setFormProjectId('');
    setShowForm(false);
  };

  const handleStatusChange = (issue: Issue, newStatus: IssueStatus) => {
    updateIssue(issue.id, { status: newStatus });
    addActivity({
      id: generateId(),
      type: 'status-changed',
      entityId: issue.id,
      entityType: 'issue',
      summary: `Issue "${issue.title}" moved to ${newStatus}`,
      createdAt: new Date().toISOString(),
    });
    setSelectedIssue({ ...issue, status: newStatus });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light text-foreground">Issues</h1>
        <GradientButton onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          New Issue
        </GradientButton>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue list */}
        <div className="lg:col-span-2 space-y-2">
          {filteredIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No issues match the current filters.</p>
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
          {showForm ? (
            <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 space-y-4">
              <h2 className="text-lg font-light text-foreground">New Issue</h2>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Issue title..."
                className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground/40 focus:outline-none py-2"
              />
              <div className="flex gap-3">
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as IssueType)}
                  className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1 flex-1"
                >
                  <option value="bug">Bug</option>
                  <option value="feature-request">Feature Request</option>
                </select>
                <select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value as IssueSeverity)}
                  className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1 flex-1"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              {charters.length > 0 && (
                <select
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1"
                >
                  <option value="">No project linked</option>
                  {charters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows={4}
                className="w-full bg-transparent border-b-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none py-2"
              />
              <div className="flex items-center gap-3">
                <GradientButton onClick={handleSubmit} disabled={!formTitle.trim()}>
                  Submit
                </GradientButton>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedIssue ? (
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
                  {(['open', 'in-progress', 'resolved', 'closed'] as IssueStatus[]).map((status) => (
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
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Created {formatRelativeTime(selectedIssue.createdAt)}
              </p>
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
  );
}

export default IssuesPage;

import { Link } from 'react-router-dom';
import {
  Plus,
  Bug,
  Lightbulb,
  FileText,
  ArrowRight,
  TrendingUp,
  Play,
  Pause,
  Square,
  CheckCircle,
  Rocket,
} from 'lucide-react';
import { useIdeasStore } from '@/stores/ideas';
import { useChartersStore } from '@/stores/charters';
import { useIssuesStore } from '@/stores/issues';
import { useActivityStore } from '@/stores/activity';
import { Badge } from '@/components/ui/badge';
import GradientButton from '@/components/shared/GradientButton';
import { getScoreTier, getTierBadgeClasses, STATUS_LABELS } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import type { IdeaStatus } from '@/types';

const ACTIVITY_ICONS: Record<string, typeof Lightbulb> = {
  'idea-created': Lightbulb,
  'idea-scored': Lightbulb,
  'charter-generated': FileText,
  'issue-filed': Bug,
  'status-changed': TrendingUp,
  'build-started': Play,
  'build-paused': Pause,
  'build-stopped': Square,
  'build-complete': CheckCircle,
  'moved-to-production': Rocket,
};

const STATUS_BADGE_CLASSES: Record<IdeaStatus, string> = {
  scored: 'text-muted-foreground',
  'on-deck': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'development': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  production: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function DashboardPage() {
  const ideas = useIdeasStore((s) => s.ideas);
  const charters = useChartersStore((s) => s.charters);
  const issues = useIssuesStore((s) => s.issues);
  const allActivities = useActivityStore((s) => s.activities);
  const activities = [...allActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const sortedIdeas = [...ideas]
    .filter((i) => i.status !== 'archived')
    .sort((a, b) => b.compositeScore - a.compositeScore);

  // Active projects: ideas in on-deck, development, or production that have a linked charter
  const activeProjectIdeas = ideas.filter(
    (i) =>
      (i.status === 'on-deck' || i.status === 'development' || i.status === 'production') &&
      i.linkedCharterId
  );

  const activeProjectCount = activeProjectIdeas.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Operations overview
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3">
          <Link to="/new">
            <GradientButton>
              <Plus className="w-4 h-4" />
              New
            </GradientButton>
          </Link>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-foreground hover:border-primary/30 transition-colors"
          >
            <Bug className="w-4 h-4" />
            Report Issue
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Ideas', value: ideas.length, icon: Lightbulb, to: '/ideas' },
          { label: 'Active Projects', value: activeProjectCount, icon: FileText, to: '/charters' },
          { label: 'Open Issues', value: issues.filter((i) => i.status === 'open').length, icon: Bug, to: '/issues' },
        ].map(({ label, value, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-2xl font-light text-foreground tabular-nums">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Queue */}
        <div className="lg:col-span-2 bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-light text-foreground">Priority Queue</h2>
            <Link
              to="/ideas"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {sortedIdeas.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No ideas scored yet.{' '}
              <Link to="/new" className="text-primary hover:underline">
                Create your first idea
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {sortedIdeas.slice(0, 5).map((idea, index) => {
                const tier = getScoreTier(idea.compositeScore);
                return (
                  <Link
                    key={idea.id}
                    to={`/ideas/${idea.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    <span className="text-sm text-muted-foreground w-5 tabular-nums">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-light truncate group-hover:text-primary transition-colors">
                        {idea.title}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getTierBadgeClasses(tier)} text-xs`}
                    >
                      {Math.round(idea.compositeScore)}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <h2 className="text-lg font-light text-foreground mb-4">Recent Activity</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 8).map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] ?? Lightbulb;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 rounded-md bg-muted/50">
                      <Icon className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground/80 font-light leading-relaxed">
                        {activity.summary}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active Projects */}
      {activeProjectIdeas.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-light text-foreground">Active Projects</h2>
            <Link
              to="/charters"
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjectIdeas.map((idea) => {
              const charter = charters.find((c) => c.id === idea.linkedCharterId);
              return (
                <Link
                  key={idea.id}
                  to={`/ideas/${idea.id}`}
                  className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
                >
                  <h3 className="text-sm text-foreground font-light truncate">
                    {charter?.title ?? idea.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={`text-xs ${STATUS_BADGE_CLASSES[idea.status]}`}>
                      {STATUS_LABELS[idea.status]}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

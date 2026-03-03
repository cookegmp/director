import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { List, LayoutGrid, Search, Filter, ArrowUpDown } from 'lucide-react'
import { useIdeasStore } from '@/stores/ideas'
import { Badge } from '@/components/ui/badge'
import { getScoreTier, getTierBadgeClasses, STATUS_LABELS } from '@/types'
import type { IdeaStatus } from '@/types'
import KanbanBoard from '@/components/kanban/KanbanBoard'

const STATUS_BADGE_CLASSES: Record<IdeaStatus, string> = {
  scored: 'text-muted-foreground',
  'on-deck': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  development: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  production: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

type ViewMode = 'list' | 'board'
type SortBy = 'score' | 'newest' | 'oldest'
type ScoreTierFilter = 'all' | 'critical' | 'high' | 'medium' | 'low'

const SORT_LABELS: Record<SortBy, string> = {
  score: 'Score',
  newest: 'Newest',
  oldest: 'Oldest',
}

const SORT_CYCLE: SortBy[] = ['score', 'newest', 'oldest']

function IdeasListPage() {
  const ideas = useIdeasStore((s) => s.ideas)
  const [view, setView] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<IdeaStatus | 'all'>('all')
  const [filterTier, setFilterTier] = useState<ScoreTierFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('score')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return ideas
      .filter((idea) => {
        if (q && !idea.title.toLowerCase().includes(q) && !idea.intakeAnswers.problem?.toLowerCase().includes(q)) return false
        if (filterStatus !== 'all' && idea.status !== filterStatus) return false
        if (filterTier !== 'all') {
          const s = idea.compositeScore
          if (filterTier === 'critical' && s < 80) return false
          if (filterTier === 'high' && (s < 60 || s >= 80)) return false
          if (filterTier === 'medium' && (s < 40 || s >= 60)) return false
          if (filterTier === 'low' && s >= 40) return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        return b.compositeScore - a.compositeScore
      })
  }, [ideas, search, filterStatus, filterTier, sortBy])

  const cycleSortBy = () => {
    const idx = SORT_CYCLE.indexOf(sortBy)
    setSortBy(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light text-foreground">Ideas</h1>

        {/* View toggle */}
        <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              view === 'list'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setView('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              view === 'board'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Board
          </button>
        </div>
      </div>

      {/* Filter bar — list view only */}
      {view === 'list' && (
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-0 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ideas..."
              className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1 pl-6 w-44"
            />
          </div>
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as IdeaStatus | 'all')}
            className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1"
          >
            <option value="all">All Statuses</option>
            <option value="scored">Scored</option>
            <option value="on-deck">On Deck</option>
            <option value="development">Development</option>
            <option value="production">Production</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as ScoreTierFilter)}
            className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none py-1"
          >
            <option value="all">All Tiers</option>
            <option value="critical">Critical (80+)</option>
            <option value="high">High (60-79)</option>
            <option value="medium">Medium (40-59)</option>
            <option value="low">Low (&lt;40)</option>
          </select>
          <button
            onClick={cycleSortBy}
            className={`flex items-center gap-1 text-sm transition-colors ${
              sortBy !== 'score' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {SORT_LABELS[sortBy]}
          </button>
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} of {ideas.length} ideas
          </span>
        </div>
      )}

      {view === 'board' ? (
        <KanbanBoard />
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No ideas match the current filters.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((idea) => {
            const tier = getScoreTier(idea.compositeScore)
            return (
              <Link
                key={idea.id}
                to={`/ideas/${idea.id}`}
                className="block bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground font-light">{idea.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {idea.intakeAnswers.problem?.slice(0, 100)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={getTierBadgeClasses(tier)}>
                      {Math.round(idea.compositeScore)}
                    </Badge>
                    <Badge variant="outline" className={STATUS_BADGE_CLASSES[idea.status]}>
                      {STATUS_LABELS[idea.status]}
                    </Badge>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default IdeasListPage

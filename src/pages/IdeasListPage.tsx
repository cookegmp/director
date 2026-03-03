import { useState } from 'react'
import { Link } from 'react-router-dom'
import { List, LayoutGrid } from 'lucide-react'
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

function IdeasListPage() {
  const ideas = useIdeasStore((s) => s.ideas)
  const sorted = [...ideas].sort((a, b) => b.compositeScore - a.compositeScore)
  const [view, setView] = useState<ViewMode>('list')

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

      {view === 'board' ? (
        <KanbanBoard />
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground">No ideas yet. Start by creating a new idea.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((idea) => {
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

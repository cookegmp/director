import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getScoreTier, getTierBadgeClasses } from '@/types'
import type { Idea } from '@/types'

interface KanbanCardProps {
  idea: Idea
}

interface KanbanCardContentProps {
  idea: Idea
  dragHandleProps?: {
    listeners?: DraggableSyntheticListeners
    attributes?: React.HTMLAttributes<HTMLButtonElement>
  }
  isDragging?: boolean
}

export const KanbanCardContent = forwardRef<HTMLDivElement, KanbanCardContentProps>(
  function KanbanCardContent({ idea, dragHandleProps, isDragging }, ref) {
    const tier = getScoreTier(idea.compositeScore)
    const problemSnippet = idea.intakeAnswers.problem?.slice(0, 80)

    return (
      <div
        ref={ref}
        className={`group bg-card/60 backdrop-blur-sm rounded-lg border border-border p-3 transition-all ${
          isDragging ? 'shadow-lg shadow-primary/10 border-primary/40 opacity-90' : 'hover:border-primary/20'
        }`}
      >
        <div className="flex items-start gap-2">
          <button
            className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
            {...dragHandleProps?.listeners}
            {...dragHandleProps?.attributes}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <Link to={`/ideas/${idea.id}`} className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`${getTierBadgeClasses(tier)} text-[10px] px-1.5 py-0`}>
                {Math.round(idea.compositeScore)}
              </Badge>
              <h4 className="text-sm font-light text-foreground truncate">{idea.title}</h4>
            </div>
            {problemSnippet && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {problemSnippet}...
              </p>
            )}
          </Link>
        </div>
      </div>
    )
  },
)

function KanbanCard({ idea }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: idea.id,
    data: { type: 'card', idea },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <KanbanCardContent
        idea={idea}
        dragHandleProps={{ listeners, attributes }}
        isDragging={isDragging}
      />
    </div>
  )
}

export default KanbanCard

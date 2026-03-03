import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import type { Idea, IdeaStatus } from '@/types'

interface KanbanColumnProps {
  status: IdeaStatus
  label: string
  ideas: Idea[]
  accentColor: string
}

function KanbanColumn({ status, label, ideas, accentColor }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  })

  const ideaIds = ideas.map((i) => i.id)

  return (
    <div className="flex flex-col w-[280px] shrink-0">
      {/* Header */}
      <div className="mb-3">
        <div className={`h-1 rounded-full mb-3 ${accentColor}`} />
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {ideas.length}
          </span>
        </div>
      </div>

      {/* Card list */}
      <SortableContext items={ideaIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-2 min-h-[120px] rounded-lg p-2 transition-colors ${
            isOver ? 'bg-primary/5 border border-dashed border-primary/30' : 'border border-transparent'
          }`}
        >
          {ideas.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[100px] text-xs text-muted-foreground/50">
              Drop ideas here
            </div>
          ) : (
            ideas.map((idea) => <KanbanCard key={idea.id} idea={idea} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default KanbanColumn

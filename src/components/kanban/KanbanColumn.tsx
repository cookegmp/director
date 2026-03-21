import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'
import type { KanbanItem } from './KanbanCard'

interface KanbanColumnProps {
  id: string
  label: string
  items: KanbanItem[]
  accentColor: string
}

function KanbanColumn({ id, label, items, accentColor }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
    data: { type: 'column', id },
  })

  const itemIds = items.map((i) => i.id)

  return (
    <div className="flex flex-col w-[280px] shrink-0">
      {/* Header */}
      <div className="mb-3">
        <div className={`h-1 rounded-full mb-3 ${accentColor}`} />
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
      </div>

      {/* Card list */}
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-2 min-h-[120px] rounded-lg p-2 transition-colors ${
            isOver
              ? 'bg-primary/5 border border-dashed border-primary/30'
              : 'border border-transparent'
          }`}
        >
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[100px] text-xs text-muted-foreground/50">
              Drop items here
            </div>
          ) : (
            items.map((item) => <KanbanCard key={item.id} item={item} />)
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export default KanbanColumn

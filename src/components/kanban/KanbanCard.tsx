import { forwardRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'

export interface KanbanItem {
  id: string
  title: string
  subtitle?: string
}

interface KanbanCardProps {
  item: KanbanItem
}

interface KanbanCardContentProps {
  item: KanbanItem
  dragHandleProps?: {
    listeners?: DraggableSyntheticListeners
    attributes?: React.HTMLAttributes<HTMLButtonElement>
  }
  isDragging?: boolean
}

export const KanbanCardContent = forwardRef<HTMLDivElement, KanbanCardContentProps>(
  function KanbanCardContent({ item, dragHandleProps, isDragging }, ref) {
    return (
      <div
        ref={ref}
        className={`group bg-card/60 backdrop-blur-sm rounded-lg border border-border p-3 transition-all ${
          isDragging
            ? 'shadow-lg shadow-primary/10 border-primary/40 opacity-90'
            : 'hover:border-primary/20'
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
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-light text-foreground truncate">{item.title}</h4>
            {item.subtitle && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                {item.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  },
)

function KanbanCard({ item }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'card', item },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <KanbanCardContent
        item={item}
        dragHandleProps={{ listeners, attributes }}
        isDragging={isDragging}
      />
    </div>
  )
}

export default KanbanCard

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import type { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanCardContent } from './KanbanCard'
import KanbanColumn from './KanbanColumn'
import type { KanbanItem } from './KanbanCard'

export interface KanbanColumnDef {
  id: string
  label: string
  accent: string
}

interface KanbanBoardProps {
  columns: KanbanColumnDef[]
  items: Record<string, KanbanItem[]>
  onDragEnd?: (itemId: string, fromColumn: string, toColumn: string) => void
}

function KanbanBoard({ columns, items, onDragEnd: onDragEndProp }: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const findColumn = useCallback(
    (itemId: string): string | null => {
      for (const col of columns) {
        if (items[col.id]?.some((i) => i.id === itemId)) {
          return col.id
        }
      }
      return null
    },
    [columns, items],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = event.active.id as string
      for (const col of columns) {
        const item = items[col.id]?.find((i) => i.id === id)
        if (item) {
          setActiveItem(item)
          break
        }
      }
    },
    [columns, items],
  )

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Visual feedback handled by dnd-kit
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveItem(null)
      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string
      const fromColumn = findColumn(activeId)
      if (!fromColumn) return

      let toColumn: string | null = null
      if (overId.startsWith('column-')) {
        toColumn = overId.replace('column-', '')
      } else {
        toColumn = findColumn(overId)
      }
      if (!toColumn) return

      if (fromColumn !== toColumn && onDragEndProp) {
        onDragEndProp(activeId, fromColumn, toColumn)
      }
    },
    [findColumn, onDragEndProp],
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-scroll flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            label={col.label}
            items={items[col.id] ?? []}
            accentColor={col.accent}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? <KanbanCardContent item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard

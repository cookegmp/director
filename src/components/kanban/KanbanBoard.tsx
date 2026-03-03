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
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useIdeasStore } from '@/stores/ideas'
import { useActivityStore } from '@/stores/activity'
import { generateId } from '@/lib/utils'
import { KanbanCardContent } from './KanbanCard'
import KanbanColumn from './KanbanColumn'
import { STATUS_LABELS } from '@/types'
import type { Idea, IdeaStatus } from '@/types'

const COLUMNS: { status: IdeaStatus; label: string; accent: string }[] = [
  { status: 'scored', label: 'Scored', accent: 'bg-gray-400' },
  { status: 'on-deck', label: 'On Deck', accent: 'bg-blue-500' },
  { status: 'development', label: 'Development', accent: 'bg-teal-500' },
  { status: 'production', label: 'Production', accent: 'bg-green-500' },
]

function KanbanBoard() {
  const ideas = useIdeasStore((s) => s.ideas)
  const reorderIdeas = useIdeasStore((s) => s.reorderIdeas)
  const moveIdea = useIdeasStore((s) => s.moveIdea)
  const addActivity = useActivityStore((s) => s.addActivity)

  const [activeIdea, setActiveIdea] = useState<Idea | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Get ideas for a column, sorted by sortOrder
  const getColumnIdeas = useCallback(
    (status: IdeaStatus) =>
      ideas.filter((i) => i.status === status).sort((a, b) => a.sortOrder - b.sortOrder),
    [ideas],
  )

  // Find which column an idea belongs to
  const findColumn = useCallback(
    (id: string): IdeaStatus | null => {
      const idea = ideas.find((i) => i.id === id)
      return idea?.status ?? null
    },
    [ideas],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const idea = ideas.find((i) => i.id === event.active.id)
      setActiveIdea(idea ?? null)
    },
    [ideas],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      const activeColumn = findColumn(activeId)
      if (!activeColumn) return

      // Determine the target column
      let overColumn: IdeaStatus | null = null
      if (overId.startsWith('column-')) {
        overColumn = overId.replace('column-', '') as IdeaStatus
      } else {
        overColumn = findColumn(overId)
      }
      if (!overColumn || activeColumn === overColumn) return

      // Move the idea to the new column (visual feedback mid-drag)
      const destIdeas = getColumnIdeas(overColumn)
      const overIndex = destIdeas.findIndex((i) => i.id === overId)
      const newIndex = overIndex >= 0 ? overIndex : destIdeas.length

      moveIdea(activeId, overColumn, newIndex)
    },
    [findColumn, getColumnIdeas, moveIdea],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveIdea(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string
      const activeColumn = findColumn(activeId)
      if (!activeColumn) return

      // Same-column reorder
      let overColumn: IdeaStatus | null = null
      if (overId.startsWith('column-')) {
        overColumn = overId.replace('column-', '') as IdeaStatus
      } else {
        overColumn = findColumn(overId)
      }
      if (!overColumn) return

      const columnIdeas = getColumnIdeas(overColumn)
      const oldIndex = columnIdeas.findIndex((i) => i.id === activeId)
      const newIndex = columnIdeas.findIndex((i) => i.id === overId)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reordered = arrayMove(
          columnIdeas.map((i) => i.id),
          oldIndex,
          newIndex,
        )
        reorderIdeas(overColumn, reordered)
      }

      // Log activity if status changed
      const originalIdea = activeIdea
      if (originalIdea && originalIdea.status !== overColumn) {
        const idea = ideas.find((i) => i.id === activeId)
        addActivity({
          id: generateId(),
          type: 'status-changed',
          entityId: activeId,
          entityType: 'idea',
          summary: `"${idea?.title ?? 'Idea'}" moved from ${STATUS_LABELS[originalIdea.status]} to ${STATUS_LABELS[overColumn]}`,
          createdAt: new Date().toISOString(),
        })
      }
    },
    [findColumn, getColumnIdeas, reorderIdeas, ideas, activeIdea, addActivity],
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
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            ideas={getColumnIdeas(col.status)}
            accentColor={col.accent}
          />
        ))}
      </div>

      <DragOverlay>
        {activeIdea ? <KanbanCardContent idea={activeIdea} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard

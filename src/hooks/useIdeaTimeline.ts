import { useMemo } from 'react'
import { useActivityStore } from '@/stores/activity'
import { useAgentSessionsStore } from '@/stores/agent-sessions'
import type { Idea, TimelineEvent, TimelineEventCategory, ActivityType } from '@/types'

const ACTIVITY_CATEGORY_MAP: Partial<Record<ActivityType, TimelineEventCategory>> = {
  'idea-created': 'creation',
  'idea-scored': 'scoring',
  'charter-generated': 'charter',
  'build-started': 'development',
  'build-paused': 'development',
  'build-stopped': 'development',
  'build-complete': 'development',
  'moved-to-production': 'production',
  'issue-filed': 'issue',
  'issue-scored': 'issue',
  'status-changed': 'development',
  'remediation-recommended': 'issue',
  'remediation-approved': 'issue',
  'remediation-triggered': 'issue',
  'remediation-completed': 'issue',
  'remediation-failed': 'issue',
}

function useIdeaTimeline(idea: Idea): TimelineEvent[] {
  const activities = useActivityStore((s) => s.activities)
  const sessions = useAgentSessionsStore((s) => s.sessions)

  return useMemo(() => {
    const events: TimelineEvent[] = []
    const seenIds = new Set<string>()

    // Direct idea activities
    for (const act of activities) {
      if (act.entityType === 'idea' && act.entityId === idea.id) {
        events.push({
          id: act.id,
          timestamp: act.createdAt,
          category: ACTIVITY_CATEGORY_MAP[act.type] ?? 'development',
          title: act.summary,
          activityType: act.type,
        })
        seenIds.add(act.id)
      }
    }

    // Charter activities
    if (idea.linkedCharterId) {
      for (const act of activities) {
        if (act.entityType === 'charter' && act.entityId === idea.linkedCharterId && !seenIds.has(act.id)) {
          events.push({
            id: act.id,
            timestamp: act.createdAt,
            category: 'charter',
            title: act.summary,
            activityType: act.type,
          })
          seenIds.add(act.id)
        }
      }
    }

    // Issue activities
    if (idea.linkedIssueIds.length > 0) {
      const issueIdSet = new Set(idea.linkedIssueIds)
      for (const act of activities) {
        if (act.entityType === 'issue' && issueIdSet.has(act.entityId) && !seenIds.has(act.id)) {
          events.push({
            id: act.id,
            timestamp: act.createdAt,
            category: 'issue',
            title: act.summary,
            activityType: act.type,
          })
          seenIds.add(act.id)
        }
      }
    }

    // Agent sessions — extract key timestamps
    const ideaSessions = sessions.filter((s) => s.ideaId === idea.id)
    for (const session of ideaSessions) {
      const sessionStartId = `session-start-${session.id}`
      if (!seenIds.has(sessionStartId)) {
        events.push({
          id: sessionStartId,
          timestamp: session.createdAt,
          category: 'development',
          title: 'Agent build session started',
          description: `Session ${session.id}`,
        })
        seenIds.add(sessionStartId)
      }

      if (session.completedAt) {
        const sessionCompleteId = `session-complete-${session.id}`
        if (!seenIds.has(sessionCompleteId)) {
          events.push({
            id: sessionCompleteId,
            timestamp: session.completedAt,
            category: 'development',
            title: 'Agent build session completed',
            description: `Session ${session.id}`,
          })
          seenIds.add(sessionCompleteId)
        }
      }

      if (session.stoppedAt) {
        const sessionStoppedId = `session-stopped-${session.id}`
        if (!seenIds.has(sessionStoppedId)) {
          events.push({
            id: sessionStoppedId,
            timestamp: session.stoppedAt,
            category: 'development',
            title: 'Agent build session stopped',
            description: `Session ${session.id}`,
          })
          seenIds.add(sessionStoppedId)
        }
      }
    }

    // Sort oldest first
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return events
  }, [idea, activities, sessions])
}

export default useIdeaTimeline

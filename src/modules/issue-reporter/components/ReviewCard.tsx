// ============================================================================
// Issue Reporter — Review Card
// ============================================================================
// Displays the AI-generated report with editable fields, classification
// and severity badges, duplicate check, and screenshot attachment.
// ============================================================================

import { useState, useRef } from 'react'
import { Bug, Sparkles, AlertTriangle, ChevronDown } from 'lucide-react'
import DictationButton from '@/components/DictationButton'
import { Badge } from '@/components/ui/badge'
import GradientButton from '@/components/shared/GradientButton'
import { useIssueReporterStore } from '../stores/issue-reporter'
import { useReportedIssuesStore } from '../stores/issues'
import { useActivityStore } from '@/stores/activity'
import { useIssuesStore } from '@/stores/issues'
import { useUsersStore } from '@/stores/users'
import { generateId } from '@/lib/utils'
import { mapReportToIssue } from '../lib/field-mapper'
import { scoreAndEvaluate } from '@/modules/issue-scoring/lib/score-and-evaluate'
import DuplicateCheck from './DuplicateCheck'
import ScreenshotSection from './ScreenshotSection'
import type { IssueSeverity } from '../types'

interface ReviewCardProps {
  onRestart: () => void
  onCancel: () => void
  onSubmitted: (issueId: string) => void
}

const SEVERITY_COLORS: Record<IssueSeverity, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const SEVERITY_OPTIONS: IssueSeverity[] = ['critical', 'high', 'medium', 'low']

function ReviewCard({ onRestart, onCancel, onSubmitted }: ReviewCardProps) {
  const { report, updateReport, screenshot, projectId } = useIssueReporterStore()
  const addReportedIssue = useReportedIssuesStore((s) => s.addIssue)
  const addLegacyIssue = useIssuesStore((s) => s.addIssue)
  const addActivity = useActivityStore((s) => s.addActivity)
  const currentUser = useUsersStore((s) => s.getCurrentUser())

  const [showSeveritySelect, setShowSeveritySelect] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [linkedDuplicateId, setLinkedDuplicateId] = useState<string | null>(null)
  const [showRestartConfirm, setShowRestartConfirm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  if (!report) return null

  const isBug = report.classification === 'bug'

  const handleSubmit = () => {
    setIsSubmitting(true)

    const reportedIssue = mapReportToIssue(report, {
      projectId,
      screenshot,
      userId: currentUser?.id ?? null,
      userName: currentUser?.name ?? null,
      userEmail: currentUser?.email ?? null,
      linkedDuplicateId,
    })

    // Store in the issue reporter's own store
    addReportedIssue(reportedIssue)

    // Also add to the legacy issues store for compatibility with existing views
    addLegacyIssue({
      id: reportedIssue.id,
      type: report.classification === 'bug' ? 'bug' : 'feature-request',
      title: report.title,
      description: report.description,
      severity: report.severity,
      status: 'open',
      projectId: projectId,
      createdAt: reportedIssue.created_at,
      updatedAt: reportedIssue.updated_at,
      comments: [],
    })

    // Log activity
    addActivity({
      id: generateId(),
      type: 'issue-filed',
      entityId: reportedIssue.id,
      entityType: 'issue',
      summary: `New ${isBug ? 'bug report' : 'feature request'}: "${report.title}"`,
      createdAt: new Date().toISOString(),
    })

    // Score the issue async (non-blocking)
    scoreAndEvaluate(reportedIssue).catch((err) => console.warn('Issue scoring failed:', err))

    onSubmitted(reportedIssue.id)
  }

  const handleLinkDuplicate = (issueId: string) => {
    setLinkedDuplicateId(issueId)
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center px-4 sm:px-8 py-8 sm:py-16 max-w-3xl mx-auto w-full -mt-8">
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 sm:p-10">
        {/* Header — classification + severity badges */}
        <div className="flex items-center gap-3 mb-4">
          <Badge
            variant="outline"
            className={`${
              isBug
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-teal-500/20 text-teal-400 border-teal-500/30'
            } gap-1.5`}
          >
            {isBug ? <Bug className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
            {isBug ? 'Bug' : 'Feature Request'}
          </Badge>

          <div className="relative">
            <button
              onClick={() => setShowSeveritySelect(!showSeveritySelect)}
              className="flex items-center gap-1"
            >
              <Badge
                variant="outline"
                className={`${SEVERITY_COLORS[report.severity]} capitalize cursor-pointer`}
              >
                {report.severity}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Badge>
            </button>
            {showSeveritySelect && (
              <div className="absolute top-full mt-1 bg-popover border border-border rounded-lg shadow-xl z-10 py-1 min-w-[120px]">
                {SEVERITY_OPTIONS.map((sev) => (
                  <button
                    key={sev}
                    onClick={() => {
                      updateReport({ severity: sev })
                      setShowSeveritySelect(false)
                    }}
                    className={`w-full px-3 py-1.5 text-sm text-left hover:bg-accent transition-colors capitalize ${
                      sev === report.severity ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editable title */}
        <input
          type="text"
          value={report.title}
          onChange={(e) => updateReport({ title: e.target.value })}
          className="w-full text-xl sm:text-2xl font-light text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors pb-2 mb-6"
        />

        {/* Sections */}
        <div className="space-y-6">
          {/* Description */}
          <EditableSection
            label="Description"
            value={report.description}
            onChange={(val) => updateReport({ description: val })}
          />

          {/* Bug-specific: Steps to reproduce */}
          {isBug && report.steps_to_reproduce && (
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Steps to Reproduce
              </label>
              <div className="space-y-1">
                {report.steps_to_reproduce.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground mt-0.5 w-5 shrink-0">
                      {i + 1}.
                    </span>
                    <input
                      value={step}
                      onChange={(e) => {
                        const updated = [...(report.steps_to_reproduce ?? [])]
                        updated[i] = e.target.value
                        updateReport({ steps_to_reproduce: updated })
                      }}
                      className="flex-1 text-sm text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors py-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bug-specific: Expected vs Actual */}
          {isBug && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditableSection
                label="Expected Behavior"
                value={report.expected_behavior ?? ''}
                onChange={(val) => updateReport({ expected_behavior: val })}
              />
              <EditableSection
                label="Actual Behavior"
                value={report.actual_behavior ?? ''}
                onChange={(val) => updateReport({ actual_behavior: val })}
              />
            </div>
          )}

          {/* Feature-specific: Desired outcome */}
          {!isBug && report.desired_outcome && (
            <EditableSection
              label="Desired Outcome"
              value={report.desired_outcome}
              onChange={(val) => updateReport({ desired_outcome: val })}
            />
          )}

          {/* Affected area */}
          {report.affected_area && (
            <div>
              <label className="block text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Affected Area
              </label>
              <input
                value={report.affected_area}
                onChange={(e) => updateReport({ affected_area: e.target.value })}
                className="text-sm text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors py-1 w-full"
              />
            </div>
          )}
        </div>

        {/* Duplicate check */}
        {report.potential_duplicates.length > 0 && (
          <div className="mt-6">
            <DuplicateCheck
              duplicates={report.potential_duplicates}
              onLinkDuplicate={handleLinkDuplicate}
              linkedDuplicateId={linkedDuplicateId}
            />
          </div>
        )}

        {/* Screenshot */}
        <div className="mt-6">
          <ScreenshotSection />
        </div>

        {/* Linked duplicate notice */}
        {linkedDuplicateId && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-300">
              This will be linked to existing issue #{linkedDuplicateId} instead of creating a new
              issue.
            </p>
            <button
              onClick={() => setLinkedDuplicateId(null)}
              className="ml-auto text-xs text-amber-400 hover:text-amber-300"
            >
              Unlink
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
          <GradientButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </GradientButton>

          <div className="ml-auto flex items-center gap-2">
            <ConfirmButton
              label="Start Over"
              confirmLabel="Are you sure?"
              show={showRestartConfirm}
              onToggle={setShowRestartConfirm}
              onConfirm={onRestart}
            />
            <ConfirmButton
              label="Cancel"
              confirmLabel="Discard report?"
              show={showCancelConfirm}
              onToggle={setShowCancelConfirm}
              onConfirm={onCancel}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Helper Components ---

function EditableSection({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (val: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const baseRef = useRef('')

  return (
    <div>
      <label className="block text-xs text-muted-foreground uppercase tracking-wide mb-2">
        {label}
      </label>
      {isEditing ? (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            rows={4}
            autoFocus
            className="w-full text-sm text-foreground bg-muted/30 rounded-lg border border-border focus:border-primary focus:outline-none transition-colors p-3 pr-12 resize-none"
          />
          <div className="absolute right-2 bottom-2">
            <DictationButton
              onResult={(text) => {
                const committed = baseRef.current + text
                baseRef.current = committed
                onChange(committed)
              }}
              onInterim={(text) => {
                if (text) onChange(baseRef.current + text)
              }}
              onListeningChange={(listening) => {
                if (listening) baseRef.current = value
              }}
            />
          </div>
        </div>
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className="text-sm text-foreground/80 leading-relaxed cursor-text hover:bg-muted/20 rounded-lg p-2 -m-2 transition-colors"
        >
          {value || <span className="text-muted-foreground italic">Click to add...</span>}
        </p>
      )}
    </div>
  )
}

function ConfirmButton({
  label,
  confirmLabel,
  show,
  onToggle,
  onConfirm,
}: {
  label: string
  confirmLabel: string
  show: boolean
  onToggle: (show: boolean) => void
  onConfirm: () => void
}) {
  if (show) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{confirmLabel}</span>
        <button
          onClick={() => {
            onToggle(false)
            onConfirm()
          }}
          className="text-xs text-destructive hover:text-destructive/80 transition-colors"
        >
          Yes
        </button>
        <button
          onClick={() => onToggle(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => onToggle(true)}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
    </button>
  )
}

export default ReviewCard

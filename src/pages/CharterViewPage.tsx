import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Copy, CheckCircle, Lightbulb, ChevronRight } from 'lucide-react'
import { useChartersStore } from '@/stores/charters'
import { useIdeasStore } from '@/stores/ideas'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { STATUS_LABELS } from '@/types'
import type { CharterContent, IdeaStatus } from '@/types'

const STATUS_BADGE_CLASSES: Record<IdeaStatus, string> = {
  scored: 'text-muted-foreground',
  'on-deck': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  development: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  production: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

function CharterViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const charter = useChartersStore((s) => s.getCharter(id ?? ''))
  const idea = useIdeasStore((s) => s.getIdea(charter?.ideaId ?? ''))
  const [copied, setCopied] = useState(false)
  const [collapsedScaffolding, setCollapsedScaffolding] = useState(true)

  if (!charter) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Charter not found.</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const { content } = charter

  const handleCopy = async () => {
    const text = formatCharterAsText(charter.title, content)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-light text-foreground">{charter.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            {idea && (
              <Badge variant="outline" className={STATUS_BADGE_CLASSES[idea.status]}>
                {STATUS_LABELS[idea.status]}
              </Badge>
            )}
            <Link
              to={`/ideas/${charter.ideaId}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3" />
              View in Idea Detail
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Charter document (read-only) */}
      <div className="space-y-6">
        {/* Overview */}
        <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <h2 className="text-lg font-light text-foreground mb-3">Project Overview</h2>
          <p className="text-foreground/80 font-light leading-relaxed">{content.projectOverview}</p>
        </section>

        {/* Objectives */}
        <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <h2 className="text-lg font-light text-foreground mb-3">Objectives</h2>
          <ul className="space-y-2">
            {content.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-primary mt-0.5 text-sm font-medium">{i + 1}.</span>
                <span className="text-foreground/80 font-light">{obj}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Technical approach */}
        <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <h2 className="text-lg font-light text-foreground mb-3">Technical Approach</h2>
          <p className="text-foreground/80 font-light leading-relaxed">
            {content.technicalApproach}
          </p>
        </section>

        {/* Acceptance criteria */}
        <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <h2 className="text-lg font-light text-foreground mb-3">Acceptance Criteria</h2>
          <ul className="space-y-2">
            {content.acceptanceCriteria.map((criteria, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span className="text-foreground/80 font-light">{criteria}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Timeline */}
        <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <h2 className="text-lg font-light text-foreground mb-3">Estimated Timeline</h2>
          <p className="text-foreground/80 font-light">{content.estimatedTimeline}</p>
        </section>

        {/* Execution plan */}
        <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <h2 className="text-lg font-light text-foreground mb-4">Execution Plan</h2>
          <div className="space-y-4">
            {content.executionPlan.map((phase, i) => (
              <div key={i} className="border border-border rounded-[0.75rem] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-foreground font-medium text-sm">
                    Phase {i + 1}: {phase.phase}
                  </h3>
                  <Badge variant="outline" className="text-muted-foreground">
                    {phase.duration}
                  </Badge>
                </div>
                <ul className="space-y-1 ml-4">
                  {phase.tasks.map((task, j) => (
                    <li
                      key={j}
                      className="text-sm text-foreground/70 font-light flex items-start gap-2"
                    >
                      <span className="text-muted-foreground">-</span>
                      {task}
                    </li>
                  ))}
                </ul>
                {phase.dependencies.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Depends on: {phase.dependencies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Scaffolding context (collapsible) */}
        <section className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
          <button
            onClick={() => setCollapsedScaffolding(!collapsedScaffolding)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-light text-foreground">Scaffolding Context</h2>
            <ChevronRight
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                !collapsedScaffolding ? 'rotate-90' : ''
              }`}
            />
          </button>
          {!collapsedScaffolding && (
            <div className="mt-3 space-y-2">
              {charter.scaffoldingRefs.map((ref) => (
                <div key={ref} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm text-foreground/70 font-light">{ref}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function formatCharterAsText(title: string, content: CharterContent): string {
  const lines = [
    `# ${title}`,
    '',
    '## Project Overview',
    content.projectOverview,
    '',
    '## Objectives',
    ...content.objectives.map((o, i) => `${i + 1}. ${o}`),
    '',
    '## Technical Approach',
    content.technicalApproach,
    '',
    '## Acceptance Criteria',
    ...content.acceptanceCriteria.map((c) => `- ${c}`),
    '',
    `## Estimated Timeline`,
    content.estimatedTimeline,
    '',
    '## Execution Plan',
    ...content.executionPlan.flatMap((p, i) => [
      `### Phase ${i + 1}: ${p.phase} (${p.duration})`,
      ...p.tasks.map((t) => `- ${t}`),
      p.dependencies.length > 0 ? `Dependencies: ${p.dependencies.join(', ')}` : '',
      '',
    ]),
  ]
  return lines.join('\n')
}

export default CharterViewPage

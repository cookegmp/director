import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SCAFFOLDING_TIER1_SECTIONS, SCAFFOLDING_TIER2_SECTIONS } from '@/types'
import type { ScaffoldingPackage, SectionCompletionStatus } from '@/types'
import SectionEditor from './SectionEditor'

const STATUS_COLORS: Record<SectionCompletionStatus, string> = {
  empty: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  draft: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  reviewed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  validated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

function getSectionStatus(data: Record<string, unknown>): SectionCompletionStatus {
  if (!data || Object.keys(data).length === 0) return 'empty'
  return 'draft'
}

interface ScaffoldingLayoutProps {
  pkg: ScaffoldingPackage
}

function ScaffoldingLayout({ pkg }: ScaffoldingLayoutProps) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorSection, setEditorSection] = useState<{
    key: string
    label: string
    data: Record<string, unknown>
  } | null>(null)

  const openEditor = (key: string, label: string) => {
    const data = pkg[key as keyof ScaffoldingPackage] as Record<string, unknown>
    setEditorSection({ key, label, data: data ?? {} })
    setEditorOpen(true)
  }

  const renderSection = (key: string, label: string) => {
    const data = (pkg[key as keyof ScaffoldingPackage] ?? {}) as Record<string, unknown>
    const status = getSectionStatus(data)
    const fieldCount = Object.keys(data).length

    return (
      <div
        key={key}
        className="bg-card/30 rounded-lg border border-border p-4 flex items-center justify-between hover:border-border/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={STATUS_COLORS[status]}>
            {status}
          </Badge>
          <div>
            <p className="text-sm text-foreground font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{fieldCount} field{fieldCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={() => openEditor(key, label)}>
          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tier 1 */}
      <div>
        <h2 className="text-lg font-light text-primary mb-4">Tier 1 — Operational Intelligence</h2>
        <div className="space-y-3">
          {SCAFFOLDING_TIER1_SECTIONS.map((s) => renderSection(s.key, s.label))}
        </div>
      </div>

      {/* Tier 2 */}
      <div>
        <h2 className="text-lg font-light text-primary mb-4">Tier 2 — Build Intelligence</h2>
        <div className="space-y-3">
          {SCAFFOLDING_TIER2_SECTIONS.map((s) => renderSection(s.key, s.label))}
        </div>
      </div>

      {editorSection && (
        <SectionEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          packageId={pkg.id}
          sectionKey={editorSection.key}
          sectionLabel={editorSection.label}
          data={editorSection.data}
        />
      )}
    </div>
  )
}

export default ScaffoldingLayout

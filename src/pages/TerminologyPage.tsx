import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useClientsStore } from '@/stores/clients'
import { useEngagementsStore } from '@/stores/engagements'
import { useScaffoldingStore } from '@/stores/scaffolding'
import { useTerminologyStore } from '@/stores/terminology'
import TerminologyDecoder from '@/components/scaffolding/TerminologyDecoder'

function TerminologyPage() {
  const clients = useClientsStore((s) => s.clients)
  const engagements = useEngagementsStore((s) => s.engagements)
  const packages = useScaffoldingStore((s) => s.packages)
  const entries = useTerminologyStore((s) => s.entries)
  const deleteEntry = useTerminologyStore((s) => s.deleteEntry)

  // Build package options with client names
  const packageOptions = packages.map((p) => {
    const eng = engagements.find((e) => e.id === p.engagement_id)
    const client = eng ? clients.find((c) => c.id === eng.client_id) : null
    return {
      id: p.id,
      engagementId: p.engagement_id,
      label: `${client?.name ?? 'Unknown'} — v${p.version}`,
      clientName: client?.name ?? 'Unknown',
      validationStatus: p.validation_status,
    }
  })

  const [selectedPackageId, setSelectedPackageId] = useState(packageOptions[0]?.id ?? '')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const selectedOption = packageOptions.find((p) => p.id === selectedPackageId)
  const packageEntries = entries.filter((e) => e.scaffolding_id === selectedPackageId)
  const withSource = packageEntries.filter((e) => e.source_session_id).length
  const withoutSource = packageEntries.length - withSource

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} selected entries?`)) return
    for (const id of selectedIds) {
      deleteEntry(id)
    }
    setSelectedIds(new Set())
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Terminology</h1>
          <p className="text-muted-foreground mt-1">
            {selectedOption?.clientName ?? 'Select a package'}{' '}
            {selectedOption && (
              <Badge variant="outline" className="ml-2 text-xs">{selectedOption.validationStatus}</Badge>
            )}
          </p>
        </div>
        {selectedIds.size > 0 && (
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete {selectedIds.size} Selected
          </Button>
        )}
      </div>

      {/* Package selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Scaffolding Package:</label>
        <select
          value={selectedPackageId}
          onChange={(e) => {
            setSelectedPackageId(e.target.value)
            setSelectedIds(new Set())
          }}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-1.5 px-1 min-w-[250px]"
        >
          {packageOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-card">{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card/30 rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-light text-foreground">{packageEntries.length}</p>
          <p className="text-xs text-muted-foreground">Total Entries</p>
        </div>
        <div className="bg-card/30 rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-light text-foreground">{withSource}</p>
          <p className="text-xs text-muted-foreground">With Source Session</p>
        </div>
        <div className="bg-card/30 rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-light text-foreground">{withoutSource}</p>
          <p className="text-xs text-muted-foreground">Without Source</p>
        </div>
      </div>

      {/* Bulk select checkboxes — rendered via table override */}
      {selectedPackageId && selectedOption && (
        <div className="space-y-4">
          {/* Bulk select table */}
          <div className="bg-card/30 rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === packageEntries.length && packageEntries.length > 0}
                      onChange={() => {
                        if (selectedIds.size === packageEntries.length) setSelectedIds(new Set())
                        else setSelectedIds(new Set(packageEntries.map((e) => e.id)))
                      }}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Client Term</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Universal Concept</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Context</th>
                </tr>
              </thead>
              <tbody>
                {packageEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(entry.id)}
                        onChange={() => toggleSelect(entry.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-sm text-foreground font-medium">{entry.client_term}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{entry.universal_concept}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[200px]">{entry.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reuse TerminologyDecoder for add/import/export actions */}
          <TerminologyDecoder
            scaffoldingId={selectedPackageId}
            engagementId={selectedOption.engagementId}
            clientName={selectedOption.clientName}
          />
        </div>
      )}
    </div>
  )
}

export default TerminologyPage

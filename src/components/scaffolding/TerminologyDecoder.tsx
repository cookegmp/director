import { useState, useMemo } from 'react'
import { Plus, Download, Upload, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTerminologyStore } from '@/stores/terminology'
import { useDiscoveryStore } from '@/stores/discovery'

interface TerminologyDecoderProps {
  scaffoldingId: string
  engagementId: string
  clientName: string
}

function TerminologyDecoder({ scaffoldingId, engagementId, clientName }: TerminologyDecoderProps) {
  const allEntries = useTerminologyStore((s) => s.entries)
  const entries = useMemo(() => allEntries.filter((e) => e.scaffolding_id === scaffoldingId), [allEntries, scaffoldingId])
  const addEntry = useTerminologyStore((s) => s.addEntry)
  const deleteEntry = useTerminologyStore((s) => s.deleteEntry)
  const allSessions = useDiscoveryStore((s) => s.sessions)
  const sessions = useMemo(() => allSessions.filter((s) => s.engagement_id === engagementId), [allSessions, engagementId])

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'client_term' | 'universal_concept'>('client_term')
  const [sortAsc, setSortAsc] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [showImport, setShowImport] = useState(false)

  // New entry form state
  const [newTerm, setNewTerm] = useState('')
  const [newConcept, setNewConcept] = useState('')
  const [newContext, setNewContext] = useState('')
  const [newSourceSession, setNewSourceSession] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = entries
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (e) => e.client_term.toLowerCase().includes(q) || e.universal_concept.toLowerCase().includes(q),
      )
    }
    return [...result].sort((a, b) => {
      const cmp = a[sortKey].localeCompare(b[sortKey])
      return sortAsc ? cmp : -cmp
    })
  }, [entries, search, sortKey, sortAsc])

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(true) }
  }

  const handleAddEntry = () => {
    if (!newTerm.trim() || !newConcept.trim()) return
    addEntry({
      scaffolding_id: scaffoldingId,
      client_term: newTerm.trim(),
      universal_concept: newConcept.trim(),
      context: newContext.trim(),
      source_session_id: newSourceSession,
    })
    setNewTerm('')
    setNewConcept('')
    setNewContext('')
    setNewSourceSession(null)
    setShowNewForm(false)
  }

  const handleExportJSON = () => {
    const json = JSON.stringify(entries, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `terminology-${clientName.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const header = 'Client Term,Universal Concept,Context,Source Session ID'
    const rows = entries.map((e) =>
      `"${e.client_term}","${e.universal_concept}","${e.context}","${e.source_session_id ?? ''}"`,
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `terminology-${clientName.replace(/\s+/g, '-').toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (selectedItems: { term: string; value: string; sessionTitle: string; sessionId: string }[]) => {
    for (const item of selectedItems) {
      addEntry({
        scaffolding_id: scaffoldingId,
        client_term: item.term,
        universal_concept: typeof item.value === 'string' ? item.value : String(item.value),
        context: item.sessionTitle,
        source_session_id: item.sessionId,
      })
    }
    setShowImport(false)
  }

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms..."
            className="w-full bg-transparent border-b border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-1.5 pl-6"
          />
        </div>
        <Button size="sm" onClick={() => setShowNewForm(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> New Entry
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowImport(true)}>
          <Upload className="w-3.5 h-3.5 mr-1" /> Import from Discovery
        </Button>
        <Button size="sm" variant="ghost" onClick={handleExportJSON}>
          <Download className="w-3.5 h-3.5 mr-1" /> JSON
        </Button>
        <Button size="sm" variant="ghost" onClick={handleExportCSV}>
          <Download className="w-3.5 h-3.5 mr-1" /> CSV
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card/30 rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th
                className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground"
                onClick={() => toggleSort('client_term')}
              >
                Client Term {sortKey === 'client_term' && (sortAsc ? '↑' : '↓')}
              </th>
              <th
                className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground"
                onClick={() => toggleSort('universal_concept')}
              >
                Universal Concept {sortKey === 'universal_concept' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Context</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-sm text-muted-foreground py-8">No entries found.</td>
              </tr>
            ) : (
              filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-foreground font-medium">{entry.client_term}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{entry.universal_concept}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-[200px]">{entry.context}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${entry.client_term}"?`)) deleteEntry(entry.id)
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Entry Dialog */}
      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-light">New Terminology Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <input value={newTerm} onChange={(e) => setNewTerm(e.target.value)} placeholder="Client term *"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2" autoFocus />
            <input value={newConcept} onChange={(e) => setNewConcept(e.target.value)} placeholder="Universal concept *"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2" />
            <input value={newContext} onChange={(e) => setNewContext(e.target.value)} placeholder="Context"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2" />
            <select value={newSourceSession ?? ''} onChange={(e) => setNewSourceSession(e.target.value || null)}
              className="w-full bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-2">
              <option value="" className="bg-card">No source session</option>
              {sessions.filter((s) => s.status === 'complete').map((s) => (
                <option key={s.id} value={s.id} className="bg-card">{s.title}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowNewForm(false)}>Cancel</Button>
              <Button onClick={handleAddEntry} disabled={!newTerm.trim() || !newConcept.trim()}>Add Entry</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        sessions={sessions}
        onImport={handleImport}
      />
    </div>
  )
}

// ─── Import Dialog ─────────────────────────────────────────

function ImportDialog({
  open,
  onOpenChange,
  sessions,
  onImport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessions: { id: string; title: string; extracted_data: Record<string, unknown>; status: string }[]
  onImport: (items: { term: string; value: string; sessionTitle: string; sessionId: string }[]) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const completedSessions = sessions.filter((s) => s.status === 'complete')
  const allItems = completedSessions.flatMap((s) =>
    Object.entries(s.extracted_data).map(([key, value]) => ({
      key: `${s.id}::${key}`,
      term: key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
      sessionTitle: s.title,
      sessionId: s.id,
    })),
  )

  const toggle = (key: string) => {
    const next = new Set(selected)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelected(next)
  }

  const handleImport = () => {
    const items = allItems.filter((i) => selected.has(i.key))
    onImport(items)
    setSelected(new Set())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-light">Import from Discovery Sessions</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {allItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No extracted data available.</p>
          ) : (
            allItems.map((item) => (
              <label key={item.key} className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/20">
                <input
                  type="checkbox"
                  checked={selected.has(item.key)}
                  onChange={() => toggle(item.key)}
                  className="mt-0.5 rounded border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">{item.term}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground/60">{item.sessionTitle}</p>
                </div>
              </label>
            ))
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={selected.size === 0}>
              Import {selected.size} Item{selected.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TerminologyDecoder

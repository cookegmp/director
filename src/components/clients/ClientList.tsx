import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CLIENT_STATUS_LABELS } from '@/types'
import type { Client, ClientStatus } from '@/types'

const STATUS_COLORS: Record<ClientStatus, string> = {
  prospect: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  discovery: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  scaffolding: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  building: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  archived: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
}

type SortKey = 'name' | 'status' | 'updated'

interface ClientListProps {
  clients: Client[]
  selectedId: string | null
  onSelect: (client: Client) => void
}

function ClientList({ clients, selectedId, onSelect }: ClientListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortAsc, setSortAsc] = useState(true)

  const filtered = useMemo(() => {
    let result = clients

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q),
      )
    }

    result = [...result].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      else cmp = a.updated_at.localeCompare(b.updated_at)
      return sortAsc ? cmp : -cmp
    })

    return result
  }, [clients, statusFilter, search, sortKey, sortAsc])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-transparent border-b border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-1.5 pl-6"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClientStatus | 'all')}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-1.5 px-1"
        >
          <option value="all" className="bg-card">All Statuses</option>
          {Object.entries(CLIENT_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key} className="bg-card">{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card/30 rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th
                className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort('name')}
              >
                Name {sortKey === 'name' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Industry</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Size</th>
              <th
                className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort('status')}
              >
                Status {sortKey === 'status' && (sortAsc ? '↑' : '↓')}
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Contact</th>
              <th
                className="text-left text-xs font-medium text-muted-foreground px-4 py-3 cursor-pointer hover:text-foreground transition-colors"
                onClick={() => toggleSort('updated')}
              >
                Updated {sortKey === 'updated' && (sortAsc ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  No clients found.
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => onSelect(client)}
                  className={`border-b border-border/50 cursor-pointer transition-colors ${
                    selectedId === client.id
                      ? 'bg-primary/5'
                      : 'hover:bg-card/50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-foreground font-medium">{client.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{client.industry}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{client.size_range}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={STATUS_COLORS[client.status]}>
                      {CLIENT_STATUS_LABELS[client.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{client.primary_contact || '—'}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(client.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ClientList

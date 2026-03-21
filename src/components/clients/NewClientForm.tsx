import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useClientsStore } from '@/stores/clients'
import type { ClientSizeRange } from '@/types'

interface NewClientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function NewClientForm({ open, onOpenChange }: NewClientFormProps) {
  const addClient = useClientsStore((s) => s.addClient)

  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [sizeRange, setSizeRange] = useState<ClientSizeRange>('mid')
  const [primaryContact, setPrimaryContact] = useState('')
  const [notes, setNotes] = useState('')

  const canSubmit = name.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    addClient({
      name: name.trim(),
      industry: industry.trim(),
      size_range: sizeRange,
      status: 'prospect',
      primary_contact: primaryContact.trim(),
      notes: notes.trim(),
    })

    setName('')
    setIndustry('')
    setSizeRange('mid')
    setPrimaryContact('')
    setNotes('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-light">New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Company name"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Industry</label>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Manufacturing, Distribution"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Size Range</label>
            <select
              value={sizeRange}
              onChange={(e) => setSizeRange(e.target.value as ClientSizeRange)}
              className="w-full bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-2"
            >
              <option value="small" className="bg-card">Small (1–50 employees)</option>
              <option value="mid" className="bg-card">Mid (51–250 employees)</option>
              <option value="large" className="bg-card">Large (250+ employees)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Primary Contact</label>
            <input
              value={primaryContact}
              onChange={(e) => setPrimaryContact(e.target.value)}
              placeholder="Name, Title"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional context..."
              rows={3}
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none py-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Create Client
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewClientForm

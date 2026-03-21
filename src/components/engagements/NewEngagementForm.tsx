import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useEngagementsStore } from '@/stores/engagements'
import type { EngagementPhase } from '@/types'

interface NewEngagementFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
}

function NewEngagementForm({ open, onOpenChange, clientId }: NewEngagementFormProps) {
  const addEngagement = useEngagementsStore((s) => s.addEngagement)

  const [phase, setPhase] = useState<EngagementPhase>('discovery')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]!)
  const [targetEndDate, setTargetEndDate] = useState('')

  const canSubmit = startDate.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    addEngagement({
      client_id: clientId,
      phase,
      start_date: startDate,
      target_end_date: targetEndDate || null,
      actual_end_date: null,
      status: 'active',
    })

    setPhase('discovery')
    setStartDate(new Date().toISOString().split('T')[0]!)
    setTargetEndDate('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-light">New Engagement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Phase</label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value as EngagementPhase)}
              className="w-full bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-2"
            >
              <option value="discovery" className="bg-card">Discovery</option>
              <option value="scaffolding" className="bg-card">Scaffolding</option>
              <option value="first_build" className="bg-card">First Build</option>
              <option value="handoff" className="bg-card">Handoff</option>
              <option value="subscription" className="bg-card">Subscription</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Start Date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground focus:outline-none transition-colors py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Target End Date</label>
            <input
              type="date"
              value={targetEndDate}
              onChange={(e) => setTargetEndDate(e.target.value)}
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground focus:outline-none transition-colors py-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Create Engagement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewEngagementForm

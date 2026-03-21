import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDiscoveryStore } from '@/stores/discovery'
import type { DiscoverySessionType } from '@/types'

interface NewSessionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  engagementId: string
}

function NewSessionForm({ open, onOpenChange, engagementId }: NewSessionFormProps) {
  const addSession = useDiscoveryStore((s) => s.addSession)

  const [sessionType, setSessionType] = useState<DiscoverySessionType>('stakeholder_interview')
  const [title, setTitle] = useState('')
  const [participants, setParticipants] = useState('')
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 16))

  const canSubmit = title.trim().length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    addSession({
      engagement_id: engagementId,
      session_type: sessionType,
      title: title.trim(),
      participants: participants.split(',').map((p) => p.trim()).filter(Boolean),
      transcript: '',
      extracted_data: {},
      scaffolding_sections_affected: [],
      status: 'scheduled',
      session_date: new Date(sessionDate).toISOString(),
    })

    setTitle('')
    setParticipants('')
    setSessionType('stakeholder_interview')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-light">New Discovery Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as DiscoverySessionType)}
              className="w-full bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-2"
            >
              <option value="stakeholder_interview" className="bg-card">Stakeholder Interview</option>
              <option value="system_walkthrough" className="bg-card">System Walkthrough</option>
              <option value="workflow_observation" className="bg-card">Workflow Observation</option>
              <option value="brand_collection" className="bg-card">Brand Collection</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Session title"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Participants (comma-separated)</label>
            <input
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Sarah Chen, Mark Donnelly"
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Session Date</label>
            <input
              type="datetime-local"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground focus:outline-none transition-colors py-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit}>Create Session</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewSessionForm

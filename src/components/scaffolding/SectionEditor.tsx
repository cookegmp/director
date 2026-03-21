import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useScaffoldingStore } from '@/stores/scaffolding'

interface SectionEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageId: string
  sectionKey: string
  sectionLabel: string
  data: Record<string, unknown>
}

function flattenData(data: Record<string, unknown>): Record<string, string> {
  const flat: Record<string, string> = {}
  for (const [key, value] of Object.entries(data)) {
    flat[key] = typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  }
  if (Object.keys(flat).length === 0) {
    flat['content'] = ''
  }
  return flat
}

function SectionEditor({ open, onOpenChange, packageId, sectionKey, sectionLabel, data }: SectionEditorProps) {
  const updateSection = useScaffoldingStore((s) => s.updateSection)
  const initialFields = useMemo(() => flattenData(data), [data])
  const [fields, setFields] = useState<Record<string, string>>(initialFields)

  const handleSave = () => {
    const parsed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(fields)) {
      try {
        parsed[key] = JSON.parse(value)
      } catch {
        parsed[key] = value
      }
    }
    updateSection(packageId, sectionKey, parsed)
    onOpenChange(false)
  }

  const handleAddField = () => {
    const name = window.prompt('Field name:')
    if (name && !fields[name]) {
      setFields({ ...fields, [name]: '' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-light">Edit: {sectionLabel}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {Object.entries(fields).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">{key}</label>
              <textarea
                value={value}
                onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                rows={Math.max(3, Math.min(8, value.split('\n').length + 1))}
                className="w-full bg-transparent border border-border rounded-lg focus:border-primary text-xs text-foreground font-mono focus:outline-none transition-colors resize-none p-2"
              />
            </div>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={handleAddField} className="text-xs">
            + Add Field
          </Button>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Section</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SectionEditor

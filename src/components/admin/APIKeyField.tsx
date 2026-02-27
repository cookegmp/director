import { useState } from 'react'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, CircleDashed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSettingsStore } from '@/stores/settings'

function APIKeyField() {
  const aiSettings = useSettingsStore((s) => s.aiSettings)
  const updateAISettings = useSettingsStore((s) => s.updateAISettings)
  const verifyApiKey = useSettingsStore((s) => s.verifyApiKey)
  const [editing, setEditing] = useState(false)
  const [localKey, setLocalKey] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const maskedKey = aiSettings.openrouterApiKey
    ? `••••••••${aiSettings.openrouterApiKey.slice(-4)}`
    : ''

  const handleEdit = () => {
    setEditing(true)
    setLocalKey('')
  }

  const handleVerify = async () => {
    if (editing) {
      updateAISettings({ openrouterApiKey: localKey })
      setEditing(false)
    }
    setVerifying(true)
    await verifyApiKey()
    setVerifying(false)
  }

  const statusConfig = {
    valid: {
      icon: CheckCircle,
      label: 'Valid',
      className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    invalid: {
      icon: XCircle,
      label: 'Invalid',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    unconfigured: {
      icon: CircleDashed,
      label: 'Not configured',
      className: 'bg-muted text-muted-foreground border-border',
    },
  }

  const status = statusConfig[aiSettings.keyStatus]
  const StatusIcon = status.icon

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-light text-foreground">OpenRouter API Key</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Required for charter generation, scoring, and build translation.
          </p>
        </div>
        <Badge variant="outline" className={status.className}>
          <StatusIcon className="w-3 h-3 mr-1.5" />
          {status.label}
        </Badge>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">API Key</label>
          {editing ? (
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                className="w-full bg-transparent border-b-2 border-border text-foreground focus:border-primary outline-none py-1.5 text-sm font-mono transition-colors pr-8"
                placeholder="sk-or-..."
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-0 bottom-1.5 text-muted-foreground hover:text-foreground"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div
              onClick={handleEdit}
              className="w-full border-b-2 border-border py-1.5 text-sm font-mono text-muted-foreground cursor-pointer hover:border-primary transition-colors"
            >
              {maskedKey || 'Click to enter key…'}
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          )}
          <Button size="sm" onClick={handleVerify} disabled={verifying}>
            {verifying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Verifying…
              </>
            ) : (
              'Verify Key'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default APIKeyField

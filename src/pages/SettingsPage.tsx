import { useState } from 'react'
import { Eye, EyeOff, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settings'
import packageJson from '../../package.json'

const MODEL_OPTIONS = [
  { value: 'anthropic/claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
  { value: 'anthropic/claude-haiku', label: 'Claude Haiku' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
]

const AI_FUNCTIONS = [
  { key: 'interview_wizard', label: 'Interview Wizard' },
  { key: 'ocai_builder', label: 'OCAI Builder' },
  { key: 'extraction', label: 'Data Extraction' },
]

function SettingsPage() {
  const apiKey = useSettingsStore((s) => s.openrouter_api_key)
  const selectedModels = useSettingsStore((s) => s.selected_models)
  const mockMode = useSettingsStore((s) => s.mock_mode)
  const setApiKey = useSettingsStore((s) => s.setApiKey)
  const setModel = useSettingsStore((s) => s.setModel)

  const [keyVisible, setKeyVisible] = useState(false)
  const [keyDraft, setKeyDraft] = useState(apiKey)

  const isMockEnv = import.meta.env.VITE_USE_MOCK_DATA === 'true'

  const handleSaveKey = () => {
    setApiKey(keyDraft)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure AI provider and application preferences.</p>
      </div>

      {/* Section 1: AI Provider */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-primary">AI Provider</CardTitle>
          <CardDescription>OpenRouter API configuration for live AI features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">OpenRouter API Key</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={keyVisible ? 'text' : 'password'}
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder="sk-or-..."
                  className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setKeyVisible(!keyVisible)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {keyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                onClick={handleSaveKey}
                size="sm"
                disabled={keyDraft === apiKey}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Stored in localStorage. Never sent to any server other than OpenRouter.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">Model Selection</label>
            {AI_FUNCTIONS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">{label}</span>
                <select
                  value={selectedModels[key] ?? MODEL_OPTIONS[0]!.value}
                  onChange={(e) => setModel(key, e.target.value)}
                  className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-1.5 px-1 min-w-[200px]"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Mock Data */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-primary">Mock Data</CardTitle>
          <CardDescription>AI call simulation status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-muted-foreground shrink-0" />
            {isMockEnv || mockMode ? (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                MOCK MODE — AI calls are simulated
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                LIVE MODE
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Set <code className="px-1 py-0.5 bg-muted rounded text-xs">VITE_USE_MOCK_DATA=false</code> in{' '}
            <code className="px-1 py-0.5 bg-muted rounded text-xs">.env</code> and restart the dev server to enable
            live AI calls.
          </p>
        </CardContent>
      </Card>

      {/* Section 3: About */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-primary">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Application:</span>
            <span className="text-sm text-foreground font-medium">Director</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Version:</span>
            <span className="text-sm text-foreground">{packageJson.version}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Build:</span>
            <span className="text-sm text-foreground">MVP — Prototype</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage

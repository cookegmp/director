import { useState } from 'react'
import { CheckCircle, Download } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useClientsStore } from '@/stores/clients'
import { useEngagementsStore } from '@/stores/engagements'
import { useScaffoldingStore } from '@/stores/scaffolding'
import ScaffoldingLayout from '@/components/scaffolding/ScaffoldingLayout'
import TerminologyDecoder from '@/components/scaffolding/TerminologyDecoder'
import { SCAFFOLDING_TIER1_SECTIONS, SCAFFOLDING_TIER2_SECTIONS } from '@/types'

function ScaffoldingPage() {
  const clients = useClientsStore((s) => s.clients)
  const engagements = useEngagementsStore((s) => s.engagements)
  const packages = useScaffoldingStore((s) => s.packages)
  const updatePackage = useScaffoldingStore((s) => s.updatePackage)

  const [selectedEngagementId, setSelectedEngagementId] = useState(engagements[0]?.id ?? '')
  const [showValidation, setShowValidation] = useState(false)

  const pkg = packages.find((p) => p.engagement_id === selectedEngagementId)
  const client = clients.find((c) => {
    const eng = engagements.find((e) => e.id === selectedEngagementId)
    return eng && c.id === eng.client_id
  })

  const engagementOptions = engagements.map((e) => {
    const c = clients.find((cl) => cl.id === e.client_id)
    return { id: e.id, label: `${c?.name ?? 'Unknown'} — ${e.phase}` }
  })

  // Validation
  const allSections = [...SCAFFOLDING_TIER1_SECTIONS, ...SCAFFOLDING_TIER2_SECTIONS]
  const emptySections = pkg
    ? allSections.filter((s) => {
        const data = pkg[s.key as keyof typeof pkg]
        return !data || typeof data !== 'object' || Object.keys(data as object).length === 0
      })
    : allSections

  const handleValidate = () => {
    if (emptySections.length === 0 && pkg) {
      updatePackage(pkg.id, { validation_status: 'validated' })
    }
    setShowValidation(true)
  }

  const handleExport = () => {
    if (!pkg || !client) return
    const json = JSON.stringify(pkg, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scaffolding-${client.name.replace(/\s+/g, '-').toLowerCase()}-v${pkg.version}.json`
    a.click()
    URL.revokeObjectURL(url)
    updatePackage(pkg.id, { exported_at: new Date().toISOString(), validation_status: 'exported' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Scaffolding</h1>
          <p className="text-muted-foreground mt-1">
            {client?.name ?? 'Select an engagement'} {pkg && (
              <Badge variant="outline" className="ml-2 text-xs">v{pkg.version} — {pkg.validation_status}</Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleValidate} disabled={!pkg}>
            <CheckCircle className="w-4 h-4 mr-1" /> Validate
          </Button>
          <Button onClick={handleExport} disabled={!pkg}>
            <Download className="w-4 h-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Engagement selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Engagement:</label>
        <select
          value={selectedEngagementId}
          onChange={(e) => setSelectedEngagementId(e.target.value)}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-1.5 px-1 min-w-[250px]"
        >
          {engagementOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-card">{opt.label}</option>
          ))}
        </select>
      </div>

      {pkg ? (
        <Tabs defaultValue="sections">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="terminology">Terminology</TabsTrigger>
          </TabsList>
          <TabsContent value="sections" className="mt-6">
            <ScaffoldingLayout pkg={pkg} />
          </TabsContent>
          <TabsContent value="terminology" className="mt-6">
            <TerminologyDecoder
              scaffoldingId={pkg.id}
              engagementId={selectedEngagementId}
              clientName={client?.name ?? 'Unknown'}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <p className="text-sm text-muted-foreground py-8 text-center">No scaffolding package for this engagement.</p>
      )}

      {/* Validation Dialog */}
      <Dialog open={showValidation} onOpenChange={setShowValidation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-light">Validation Results</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            {emptySections.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">All sections populated. Package validated.</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {emptySections.length} section{emptySections.length !== 1 ? 's' : ''} still empty:
                </p>
                <ul className="space-y-1">
                  {emptySections.map((s) => (
                    <li key={s.key} className="text-sm text-amber-400">• {s.label}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={() => setShowValidation(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ScaffoldingPage

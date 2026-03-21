import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useClientsStore } from '@/stores/clients'
import { useEngagementsStore } from '@/stores/engagements'
import { useOcaiStore } from '@/stores/ocai'
import AssessmentDashboard from '@/components/ocai/AssessmentDashboard'
import Level1Builder from '@/components/ocai/Level1Builder'
import Level2Builder from '@/components/ocai/Level2Builder'
import ResponseCollection from '@/components/ocai/ResponseCollection'
import AnalysisPanel from '@/components/ocai/AnalysisPanel'
import GapAnalysisView from '@/components/ocai/GapAnalysisView'
import type { OCAIAssessment } from '@/types'

function OcaiPage() {
  const clients = useClientsStore((s) => s.clients)
  const engagements = useEngagementsStore((s) => s.engagements)
  const allAssessments = useOcaiStore((s) => s.assessments)
  const updateAssessment = useOcaiStore((s) => s.updateAssessment)

  const [selectedEngagementId, setSelectedEngagementId] = useState(engagements[0]?.id ?? '')
  const [selectedAssessment, setSelectedAssessment] = useState<OCAIAssessment | null>(null)

  const assessments = useMemo(
    () => allAssessments.filter((a) => a.engagement_id === selectedEngagementId),
    [allAssessments, selectedEngagementId],
  )

  const engagementOptions = engagements.map((e) => {
    const c = clients.find((cl) => cl.id === e.client_id)
    return { id: e.id, label: `${c?.name ?? 'Unknown'} — ${e.phase}` }
  })

  // Refresh selected assessment from store when it changes
  const currentAssessment = selectedAssessment
    ? assessments.find((a) => a.id === selectedAssessment.id) ?? selectedAssessment
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light tracking-tight">OCAI</h1>
        <p className="text-muted-foreground mt-1">Organizational Culture Assessment Instrument.</p>
      </div>

      {/* Engagement selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Engagement:</label>
        <select
          value={selectedEngagementId}
          onChange={(e) => {
            setSelectedEngagementId(e.target.value)
            setSelectedAssessment(null)
          }}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-1.5 px-1 min-w-[250px]"
        >
          {engagementOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-card">{opt.label}</option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="build-l1">Build L1</TabsTrigger>
          <TabsTrigger value="build-l2">Build L2</TabsTrigger>
          <TabsTrigger value="gap-analysis">Gap Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AssessmentDashboard
              assessments={assessments}
              selectedId={selectedAssessment?.id ?? null}
              onSelect={setSelectedAssessment}
            />

            {currentAssessment && (
              <div className="space-y-6">
                {/* Deploy button for draft assessments */}
                {currentAssessment.status === 'draft' && (
                  <Button
                    onClick={() => {
                      updateAssessment(currentAssessment.id, { status: 'deployed' })
                      setSelectedAssessment({ ...currentAssessment, status: 'deployed' })
                    }}
                  >
                    Deploy Assessment
                  </Button>
                )}

                {/* Response collection for deployed/collecting */}
                {(currentAssessment.status === 'deployed' || currentAssessment.status === 'collecting') && (
                  <ResponseCollection assessment={currentAssessment} />
                )}

                {/* Analysis for complete/analyzed */}
                {(currentAssessment.status === 'complete' || currentAssessment.status === 'analyzed') && (
                  <AnalysisPanel assessment={currentAssessment} />
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="build-l1" className="mt-6">
          <Level1Builder engagementId={selectedEngagementId} />
        </TabsContent>

        <TabsContent value="build-l2" className="mt-6">
          <Level2Builder engagementId={selectedEngagementId} />
        </TabsContent>

        <TabsContent value="gap-analysis" className="mt-6">
          <GapAnalysisView assessments={assessments} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OcaiPage

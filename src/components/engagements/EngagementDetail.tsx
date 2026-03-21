import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDiscoveryStore } from '@/stores/discovery'
import { useScaffoldingStore } from '@/stores/scaffolding'
import { useOcaiStore } from '@/stores/ocai'
import { useEngagementsStore } from '@/stores/engagements'
import PhaseProgressionControl from './PhaseProgressionControl'
import { ENGAGEMENT_PHASE_LABELS, SCAFFOLDING_TIER1_SECTIONS, SCAFFOLDING_TIER2_SECTIONS } from '@/types'
import type { Engagement } from '@/types'

interface EngagementDetailProps {
  engagement: Engagement
}

function EngagementDetail({ engagement }: EngagementDetailProps) {
  const navigate = useNavigate()
  const updateEngagement = useEngagementsStore((s) => s.updateEngagement)
  const allSessions = useDiscoveryStore((s) => s.sessions)
  const sessions = useMemo(() => allSessions.filter((s) => s.engagement_id === engagement.id), [allSessions, engagement.id])
  const allPackages = useScaffoldingStore((s) => s.packages)
  const scaffolding = useMemo(() => allPackages.find((p) => p.engagement_id === engagement.id), [allPackages, engagement.id])
  const allAssessments = useOcaiStore((s) => s.assessments)
  const assessments = useMemo(() => allAssessments.filter((a) => a.engagement_id === engagement.id), [allAssessments, engagement.id])

  const allSections = [...SCAFFOLDING_TIER1_SECTIONS, ...SCAFFOLDING_TIER2_SECTIONS]
  const completedSections = scaffolding
    ? allSections.filter((s) => {
        const data = scaffolding[s.key as keyof typeof scaffolding]
        return data && typeof data === 'object' && Object.keys(data as object).length > 0
      }).length
    : 0
  const completionPct = Math.round((completedSections / allSections.length) * 100)

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="text-primary border-primary/30">
            {ENGAGEMENT_PHASE_LABELS[engagement.phase]}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            Started {engagement.start_date}
            {engagement.target_end_date && ` · Target: ${engagement.target_end_date}`}
          </p>
        </div>
        <Badge
          variant="outline"
          className={
            engagement.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : engagement.status === 'paused'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
          }
        >
          {engagement.status}
        </Badge>
      </div>

      <PhaseProgressionControl
        currentPhase={engagement.phase}
        onPhaseChange={(phase) => updateEngagement(engagement.id, { phase })}
      />

      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discovery">Discovery ({sessions.length})</TabsTrigger>
          <TabsTrigger value="scaffolding">Scaffolding ({completionPct}%)</TabsTrigger>
          <TabsTrigger value="ocai">OCAI ({assessments.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-light text-foreground">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-light text-foreground">{completionPct}%</p>
              <p className="text-xs text-muted-foreground">Scaffolding</p>
            </div>
            <div className="bg-muted/20 rounded-lg p-3 text-center">
              <p className="text-2xl font-light text-foreground">{assessments.length}</p>
              <p className="text-xs text-muted-foreground">Assessments</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discovery" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">{sessions.length} discovery session{sessions.length !== 1 ? 's' : ''} recorded.</p>
          <Button size="sm" variant="ghost" onClick={() => navigate('/discovery')}>
            Go to Discovery <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </TabsContent>

        <TabsContent value="scaffolding" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {completedSections} of {allSections.length} sections populated ({completionPct}% complete).
          </p>
          <Button size="sm" variant="ghost" onClick={() => navigate('/scaffolding')}>
            Go to Scaffolding <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </TabsContent>

        <TabsContent value="ocai" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">{assessments.length} assessment{assessments.length !== 1 ? 's' : ''} created.</p>
          <Button size="sm" variant="ghost" onClick={() => navigate('/ocai')}>
            Go to OCAI <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <select
                value={engagement.status}
                onChange={(e) => updateEngagement(engagement.id, { status: e.target.value as Engagement['status'] })}
                className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-1 px-1"
              >
                <option value="active" className="bg-card">Active</option>
                <option value="paused" className="bg-card">Paused</option>
                <option value="complete" className="bg-card">Complete</option>
              </select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EngagementDetail

// ============================================================================
// Admin — Agents & Skills Tab
// ============================================================================
// Nested subtabs for Agents, Skills, and Sync configuration.
// Each subtab transitions between list view and AI-assisted creation wizard.
// ============================================================================

import { useState } from 'react'
import { Bot, Zap, RefreshCw } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AgentsList from '@/modules/agents-skills/components/AgentsList'
import SkillsList from '@/modules/agents-skills/components/SkillsList'
import SkillSyncPanel from '@/modules/agents-skills/components/SkillSyncPanel'
import CreationWizard from '@/modules/agents-skills/components/CreationWizard'
import type { CreationType } from '@/modules/agents-skills/lib/ai-conversation'

function AgentsSkillsTab() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardType, setWizardType] = useState<CreationType | null>(null)

  const openWizard = (type: CreationType) => {
    setWizardType(type)
    setWizardOpen(true)
  }

  const closeWizard = () => {
    setWizardOpen(false)
    setWizardType(null)
  }

  if (wizardOpen) {
    return <CreationWizard onClose={closeWizard} defaultType={wizardType} />
  }

  return (
    <Tabs defaultValue="agents" className="space-y-6">
      <TabsList variant="line">
        <TabsTrigger value="agents" className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5" />
          Agents
        </TabsTrigger>
        <TabsTrigger value="skills" className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          Skills
        </TabsTrigger>
        <TabsTrigger value="sync" className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Sync
        </TabsTrigger>
      </TabsList>

      <TabsContent value="agents">
        <AgentsList onCreateNew={() => openWizard('agent')} />
      </TabsContent>
      <TabsContent value="skills">
        <SkillsList onCreateNew={() => openWizard('skill')} />
      </TabsContent>
      <TabsContent value="sync">
        <SkillSyncPanel />
      </TabsContent>
    </Tabs>
  )
}

export default AgentsSkillsTab

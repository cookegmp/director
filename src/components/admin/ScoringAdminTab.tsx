// ============================================================================
// Admin — Scoring Admin Tab
// ============================================================================
// Nested subtabs for Idea, Bug, and Feature Request scoring configuration.
// Each subtab has a two-column layout: settings panel + weight sliders.
// ============================================================================

import { Lightbulb, Bug, Sparkles } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RemediationSettingsPanel from '@/modules/issue-scoring/components/RemediationSettings';
import IdeaScoringSettingsPanel from '@/modules/issue-scoring/components/IdeaScoringSettings';
import FeatureScoringSettingsPanel from '@/modules/issue-scoring/components/FeatureScoringSettings';
import { IdeaWeightEditor, BugWeightEditor, FeatureWeightEditor } from '@/modules/issue-scoring/components/ScoreWeightEditor';

function IdeaScoringSubtab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-6">Auto-Charter</h2>
        <IdeaScoringSettingsPanel />
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <IdeaWeightEditor />
      </div>
    </div>
  );
}

function BugScoringSubtab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-6">Auto-Remediation</h2>
        <RemediationSettingsPanel />
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <BugWeightEditor />
      </div>
    </div>
  );
}

function FeatureScoringSubtab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-6">Auto-Prioritize</h2>
        <FeatureScoringSettingsPanel />
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <FeatureWeightEditor />
      </div>
    </div>
  );
}

function ScoringAdminTab() {
  return (
    <Tabs defaultValue="bug" className="space-y-6">
      <TabsList variant="line">
        <TabsTrigger value="idea" className="flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" />
          Idea Scoring
        </TabsTrigger>
        <TabsTrigger value="bug" className="flex items-center gap-1.5">
          <Bug className="w-3.5 h-3.5" />
          Bug Scoring
        </TabsTrigger>
        <TabsTrigger value="feature" className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Feature Request Scoring
        </TabsTrigger>
      </TabsList>

      <TabsContent value="idea">
        <IdeaScoringSubtab />
      </TabsContent>
      <TabsContent value="bug">
        <BugScoringSubtab />
      </TabsContent>
      <TabsContent value="feature">
        <FeatureScoringSubtab />
      </TabsContent>
    </Tabs>
  );
}

export default ScoringAdminTab;

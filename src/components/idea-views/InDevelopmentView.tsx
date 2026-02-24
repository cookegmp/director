import { useState } from 'react';
import { Rocket, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { useIdeasStore } from '@/stores/ideas';
import { useActivityStore } from '@/stores/activity';
import { useAgentSessionsStore } from '@/stores/agent-sessions';
import { useAgentConnection } from '@/hooks/useAgentConnection';
import AgentControlBar from '@/components/dev-portal/AgentControlBar';
import TranslatedFeed from '@/components/dev-portal/TranslatedFeed';
import RawOutputPanel from '@/components/dev-portal/RawOutputPanel';
import CharterReferencePanel from '@/components/dev-portal/CharterReferencePanel';
import { generateId } from '@/lib/utils';
import type { Idea } from '@/types';

interface InDevelopmentViewProps {
  idea: Idea;
}

function InDevelopmentView({ idea }: InDevelopmentViewProps) {
  const updateIdea = useIdeasStore((s) => s.updateIdea);
  const addActivity = useActivityStore((s) => s.addActivity);
  const session = useAgentSessionsStore((s) => s.getSession(idea.activeSessionId ?? ''));
  const [highlightLine, setHighlightLine] = useState<number | undefined>();

  const charterId = idea.linkedCharterId ?? '';

  const {
    connect,
    startBuild,
    pauseBuild,
    resumeBuild,
    stopBuild,
  } = useAgentConnection({
    sessionId: idea.activeSessionId ?? '',
    charterId,
    ideaId: idea.id,
  });

  const handleStart = () => {
    connect();
    // Small delay to let WS connect, then start build
    setTimeout(() => startBuild(), 500);
  };

  const handleMoveToProduction = () => {
    const now = new Date().toISOString();
    updateIdea(idea.id, { status: 'production' });
    addActivity({
      id: generateId(),
      type: 'moved-to-production',
      entityId: idea.id,
      entityType: 'idea',
      summary: `"${idea.title}" moved to production`,
      createdAt: now,
    });
  };

  const handleBackToCharter = () => {
    updateIdea(idea.id, { status: 'charter-generated' });
  };

  const sessionStatus = session?.status ?? 'stopped';
  const entries = session?.translatedEntries ?? [];
  const rawLines = session?.rawOutput ?? [];

  return (
    <div className="space-y-4">
      {/* Agent Control Bar */}
      <AgentControlBar
        status={sessionStatus}
        onStart={handleStart}
        onPause={pauseBuild}
        onResume={resumeBuild}
        onStop={stopBuild}
        onConnect={() => {
          connect();
          setTimeout(() => startBuild(), 500);
        }}
      />

      {/* Feed + Raw Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-4">
          <h3 className="text-sm font-light text-foreground mb-3">Build Progress</h3>
          <TranslatedFeed
            entries={entries}
            onEntryClick={(idx) => setHighlightLine(idx)}
          />
        </div>
        <div className="space-y-4">
          <RawOutputPanel lines={rawLines} highlightIndex={highlightLine} />
          <CharterReferencePanel charterId={charterId} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {(sessionStatus === 'complete' || sessionStatus === 'stopped') && (
          <button
            onClick={handleMoveToProduction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-button text-white text-sm font-medium active:scale-95 transition-transform"
          >
            <Rocket className="w-4 h-4" />
            Move to Production
          </button>
        )}
        <button
          onClick={handleBackToCharter}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Charter
        </button>
      </div>
    </div>
  );
}

export default InDevelopmentView;

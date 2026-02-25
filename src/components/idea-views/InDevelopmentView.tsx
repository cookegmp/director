import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, ArrowLeft as ArrowLeftIcon, Bug } from 'lucide-react';
import { useIdeasStore } from '@/stores/ideas';
import { useActivityStore } from '@/stores/activity';
import { useAgentSessionsStore } from '@/stores/agent-sessions';
import { useAgentConnection } from '@/hooks/useAgentConnection';
import AgentControlBar from '@/components/dev-portal/AgentControlBar';
import EntryCard from '@/components/dev-portal/EntryCard';
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
    sendMessage,
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
    updateIdea(idea.id, { status: 'on-deck' });
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

      {/* Entry Card — full width wizard-style */}
      <EntryCard
        entries={entries}
        onEntryClick={(idx) => setHighlightLine(idx)}
        onSendMessage={sendMessage}
        sessionStatus={sessionStatus}
      />

      {/* Raw Output + Charter Reference — stacked below */}
      <RawOutputPanel lines={rawLines} highlightIndex={highlightLine} />
      <CharterReferencePanel charterId={charterId} entries={entries} />

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
        <Link
          to={`/report${charterId ? `?project=${charterId}` : ''}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <Bug className="w-4 h-4" />
          File Issue
        </Link>
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

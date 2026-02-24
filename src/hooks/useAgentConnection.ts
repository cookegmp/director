import { useEffect, useRef, useCallback, useMemo } from 'react';
import { AgentConnection } from '@/lib/agent-connection';
import { translateOutput } from '@/lib/abstraction-layer';
import { useAgentSessionsStore } from '@/stores/agent-sessions';
import { useChartersStore } from '@/stores/charters';
import { generateId } from '@/lib/utils';
import type { AgentSessionStatus } from '@/types';

interface UseAgentConnectionOptions {
  sessionId: string;
  charterId: string;
  ideaId: string;
}

export function useAgentConnection({ sessionId, charterId, ideaId }: UseAgentConnectionOptions) {
  const connectionRef = useRef<AgentConnection | null>(null);
  const rawIndexRef = useRef(0);

  const appendTranslatedEntry = useAgentSessionsStore((s) => s.appendTranslatedEntry);
  const appendRawOutput = useAgentSessionsStore((s) => s.appendRawOutput);
  const appendError = useAgentSessionsStore((s) => s.appendError);
  const updateSessionStatus = useAgentSessionsStore((s) => s.updateSessionStatus);

  const charter = useChartersStore((s) => s.getCharter(charterId));
  const phases = useMemo(() => charter?.content.executionPlan ?? [], [charter]);

  const connect = useCallback(() => {
    if (connectionRef.current) return;

    const conn = new AgentConnection({
      onOpen: () => {
        updateSessionStatus(sessionId, 'connected');
      },
      onClose: () => {
        connectionRef.current = null;
      },
      onOutput: (line: string, timestamp: string) => {
        const index = rawIndexRef.current++;
        appendRawOutput(sessionId, { index, timestamp, content: line });

        const translated = translateOutput(line, phases);
        appendTranslatedEntry(sessionId, {
          id: generateId(),
          timestamp,
          summary: translated.summary,
          type: translated.type,
          phase: translated.phase,
          rawLineIndex: index,
        });
      },
      onStatus: (status: AgentSessionStatus) => {
        updateSessionStatus(sessionId, status);
      },
      onError: (message: string, recoverable: boolean) => {
        appendError(sessionId, {
          timestamp: new Date().toISOString(),
          message,
          recoverable,
        });
        if (!recoverable) {
          updateSessionStatus(sessionId, 'error');
        }
      },
    });

    conn.connect();
    connectionRef.current = conn;
    updateSessionStatus(sessionId, 'connecting');
  }, [sessionId, phases, appendTranslatedEntry, appendRawOutput, appendError, updateSessionStatus]);

  const disconnect = useCallback(() => {
    connectionRef.current?.disconnect();
    connectionRef.current = null;
  }, []);

  const startBuild = useCallback(() => {
    connectionRef.current?.startBuild(charterId, ideaId);
  }, [charterId, ideaId]);

  const pauseBuild = useCallback(() => {
    connectionRef.current?.pauseBuild();
  }, []);

  const resumeBuild = useCallback(() => {
    connectionRef.current?.resumeBuild();
  }, []);

  const stopBuild = useCallback(() => {
    connectionRef.current?.stopBuild();
  }, []);

  const sendMessage = useCallback((message: string) => {
    connectionRef.current?.sendMessage(message);
  }, []);

  useEffect(() => {
    return () => {
      connectionRef.current?.disconnect();
      connectionRef.current = null;
    };
  }, []);

  return {
    connect,
    disconnect,
    startBuild,
    pauseBuild,
    resumeBuild,
    stopBuild,
    sendMessage,
  };
}

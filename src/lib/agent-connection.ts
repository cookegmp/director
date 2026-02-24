import type { ClientMessage, ServerMessage, AgentSessionStatus } from '@/types';

export interface AgentConnectionCallbacks {
  onOpen: () => void;
  onClose: (code: number, reason: string) => void;
  onOutput: (line: string, timestamp: string) => void;
  onStatus: (status: AgentSessionStatus) => void;
  onError: (message: string, recoverable: boolean) => void;
}

const DEFAULT_WS_URL = 'ws://localhost:4100';

export class AgentConnection {
  private ws: WebSocket | null = null;
  private url: string;
  private callbacks: AgentConnectionCallbacks;

  constructor(callbacks: AgentConnectionCallbacks) {
    this.url = import.meta.env.VITE_AGENT_WS_URL ?? DEFAULT_WS_URL;
    this.callbacks = callbacks;
  }

  connect(): void {
    if (this.ws) {
      this.disconnect();
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.callbacks.onOpen();
    };

    this.ws.onclose = (event) => {
      this.callbacks.onClose(event.code, event.reason);
      this.ws = null;
    };

    this.ws.onerror = () => {
      this.callbacks.onError('WebSocket connection error', true);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as ServerMessage;
        switch (message.type) {
          case 'status':
            this.callbacks.onStatus(message.status);
            break;
          case 'output':
            this.callbacks.onOutput(message.line, message.timestamp);
            break;
          case 'error':
            this.callbacks.onError(message.message, message.recoverable);
            break;
          case 'complete':
            this.callbacks.onStatus('complete');
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private send(message: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  startBuild(charterId: string, ideaId: string): void {
    this.send({ type: 'start-build', charterId, ideaId });
  }

  pauseBuild(): void {
    this.send({ type: 'pause-build' });
  }

  resumeBuild(): void {
    this.send({ type: 'resume-build' });
  }

  stopBuild(): void {
    this.send({ type: 'stop-build' });
  }

  sendMessage(message: string): void {
    this.send({ type: 'send-message', message });
  }

  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

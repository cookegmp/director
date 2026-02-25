import { useState } from 'react';
import { Wifi, WifiOff, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/stores/settings';
import type { EnvironmentServer } from '@/types';

const ENV_META: Record<string, { label: string; warning?: string }> = {
  dsp: {
    label: 'DSP',
    warning:
      'This environment bypasses standard permission checks. Only use for development builds where speed is prioritized over access control. Do not point at production infrastructure.',
  },
  development: { label: 'Development' },
  production: { label: 'Production' },
};

interface ServerCardProps {
  server: EnvironmentServer;
}

function ServerCard({ server }: ServerCardProps) {
  const updateServer = useSettingsStore((s) => s.updateServer);
  const testConnection = useSettingsStore((s) => s.testConnection);
  const [testing, setTesting] = useState(false);
  const meta = ENV_META[server.environment];

  const handleTest = async () => {
    setTesting(true);
    await testConnection(server.id);
    setTesting(false);
  };

  const wsUrl = `ws://${server.host || '…'}:${server.port}${server.websocketPath}`;

  const statusConfig = {
    connected: { icon: Wifi, label: 'Connected', className: 'bg-teal-500/20 text-teal-400 border-teal-500/30', dot: 'bg-teal-400' },
    disconnected: { icon: WifiOff, label: 'Disconnected', className: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
    error: { icon: AlertTriangle, label: 'Error', className: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' },
  };

  const status = statusConfig[server.connectionStatus];

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-light text-foreground">{meta.label}</h3>
        <Badge variant="outline" className={status.className}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`} />
          {status.label}
        </Badge>
      </div>

      {meta.warning && (
        <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80 leading-relaxed">{meta.warning}</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Server Host</label>
          <input
            type="text"
            value={server.host}
            onChange={(e) => updateServer(server.id, { host: e.target.value })}
            className="w-full bg-transparent border-b-2 border-border text-foreground focus:border-primary outline-none py-1.5 text-sm transition-colors"
            placeholder="192.168.1.100 or hostname.internal"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Port</label>
            <input
              type="number"
              value={server.port}
              onChange={(e) => updateServer(server.id, { port: parseInt(e.target.value, 10) || 8080 })}
              className="w-full bg-transparent border-b-2 border-border text-foreground focus:border-primary outline-none py-1.5 text-sm transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">WebSocket Path</label>
            <input
              type="text"
              value={server.websocketPath}
              onChange={(e) => updateServer(server.id, { websocketPath: e.target.value })}
              className="w-full bg-transparent border-b-2 border-border text-foreground focus:border-primary outline-none py-1.5 text-sm transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="pt-1 space-y-3">
        <p className="text-xs text-muted-foreground font-mono truncate">{wsUrl}</p>

        {server.connectionStatus === 'error' && server.errorMessage && (
          <p className="text-xs text-red-400">{server.errorMessage}</p>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleTest}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              Testing…
            </>
          ) : (
            'Test Connection'
          )}
        </Button>
      </div>
    </div>
  );
}

export default ServerCard;

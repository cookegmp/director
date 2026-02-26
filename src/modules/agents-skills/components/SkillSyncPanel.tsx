import { useState } from 'react';
import { RefreshCw, Check, AlertCircle, Loader2, Zap, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAgentsSkillsStore } from '@/stores/agents-skills';
import { useSettingsStore } from '@/stores/settings';
import type { SkillSyncStatus } from '@/types';

const SYNC_ICON: Record<SkillSyncStatus, typeof Check> = {
  synced: Check,
  pending: Loader2,
  error: AlertCircle,
  'not-synced': RefreshCw,
};

const SYNC_STYLES: Record<SkillSyncStatus, string> = {
  synced: 'text-teal-400',
  pending: 'text-amber-400 animate-spin',
  error: 'text-red-400',
  'not-synced': 'text-muted-foreground',
};

const SYNC_LABELS: Record<SkillSyncStatus, string> = {
  synced: 'Synced',
  pending: 'Syncing...',
  error: 'Error',
  'not-synced': 'Not synced',
};

function SkillSyncPanel() {
  const skills = useAgentsSkillsStore((s) => s.skills);
  const syncSkill = useAgentsSkillsStore((s) => s.syncSkill);
  const setSyncStatus = useAgentsSkillsStore((s) => s.setSyncStatus);
  const servers = useSettingsStore((s) => s.servers);
  const [syncingCells, setSyncingCells] = useState<Set<string>>(new Set());

  // Only show active/inactive skills (not drafts)
  const syncableSkills = skills.filter((s) => s.status !== 'draft');
  const environments = servers.map((s) => ({
    id: s.environment,
    label: s.environment.charAt(0).toUpperCase() + s.environment.slice(1),
    connected: s.connectionStatus === 'connected',
  }));

  const handleToggleSync = async (skillId: string, env: string, currentStatus: SkillSyncStatus) => {
    const cellKey = `${skillId}-${env}`;

    if (currentStatus === 'synced' || currentStatus === 'error') {
      // Unsync
      setSyncStatus(skillId, env, 'not-synced');
      return;
    }

    // Sync
    setSyncingCells((prev) => new Set(prev).add(cellKey));
    await syncSkill(skillId, env);
    setSyncingCells((prev) => {
      const next = new Set(prev);
      next.delete(cellKey);
      return next;
    });
  };

  const handleSyncAll = async (env: string) => {
    const toSync = syncableSkills.filter((s) => {
      const status = s.syncTargets[env] || 'not-synced';
      return status === 'not-synced' || status === 'error';
    });

    for (const skill of toSync) {
      const cellKey = `${skill.id}-${env}`;
      setSyncingCells((prev) => new Set(prev).add(cellKey));
    }

    await Promise.all(
      toSync.map(async (skill) => {
        await syncSkill(skill.id, env);
        setSyncingCells((prev) => {
          const next = new Set(prev);
          next.delete(`${skill.id}-${env}`);
          return next;
        });
      })
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-light text-foreground">Skill Sync</h2>
        <p className="text-sm text-muted-foreground">
          Select which skills to sync to each environment server. Only active and inactive skills can be synced.
        </p>
      </div>

      {syncableSkills.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-12 text-center">
          <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No syncable skills. Create and activate skills first.
          </p>
        </div>
      ) : environments.length === 0 ? (
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border p-12 text-center">
          <Server className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No environment servers configured. Add servers in the Environment Servers tab.
          </p>
        </div>
      ) : (
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Skill
                </th>
                {environments.map((env) => (
                  <th key={env.id} className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <span>{env.label}</span>
                      {!env.connected && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-border">
                          Offline
                        </Badge>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {syncableSkills.map((skill) => (
                <tr key={skill.id} className="transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{skill.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{skill.trigger}</p>
                      </div>
                    </div>
                  </td>
                  {environments.map((env) => {
                    const status: SkillSyncStatus = skill.syncTargets[env.id] || 'not-synced';
                    const cellKey = `${skill.id}-${env.id}`;
                    const isSyncing = syncingCells.has(cellKey) || status === 'pending';
                    const StatusIcon = SYNC_ICON[status];

                    return (
                      <td key={env.id} className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1.5">
                          <Switch
                            checked={status === 'synced' || status === 'pending'}
                            onCheckedChange={() => handleToggleSync(skill.id, env.id, status)}
                            disabled={isSyncing}
                          />
                          <span className="flex items-center gap-1 text-[11px]">
                            <StatusIcon className={`w-3 h-3 ${SYNC_STYLES[status]}`} />
                            <span className={status === 'error' ? 'text-red-400' : 'text-muted-foreground'}>
                              {SYNC_LABELS[status]}
                            </span>
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sync all row */}
          <div className="border-t border-border px-4 py-3 flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Sync all unsynchronized skills:</span>
            <div className="flex gap-2">
              {environments.map((env) => (
                <Button
                  key={env.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSyncAll(env.id)}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  {env.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillSyncPanel;

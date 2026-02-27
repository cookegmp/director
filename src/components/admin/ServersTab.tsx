import { useSettingsStore } from '@/stores/settings'
import ServerCard from './ServerCard'

function ServersTab() {
  const servers = useSettingsStore((s) => s.servers)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-light text-foreground">Environment Servers</h2>
        <p className="text-sm text-muted-foreground">
          Configure the environment servers StageManager connects to for agentic coding sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>
    </div>
  )
}

export default ServersTab

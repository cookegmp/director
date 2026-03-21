import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClientsStore } from '@/stores/clients'
import ClientList from '@/components/clients/ClientList'
import ClientDetailPanel from '@/components/clients/ClientDetailPanel'
import NewClientForm from '@/components/clients/NewClientForm'
import type { Client } from '@/types'

function ClientsPage() {
  const clients = useClientsStore((s) => s.clients)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Client
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedClient ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <ClientList
            clients={clients}
            selectedId={selectedClient?.id ?? null}
            onSelect={setSelectedClient}
          />
        </div>

        {selectedClient && (
          <div className="lg:col-span-1">
            <ClientDetailPanel
              client={selectedClient}
              onClose={() => setSelectedClient(null)}
            />
          </div>
        )}
      </div>

      <NewClientForm open={showNewForm} onOpenChange={setShowNewForm} />
    </div>
  )
}

export default ClientsPage

import { Users, Server, Brain, Languages } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUsersStore } from '@/stores/users';
import { canAccessAdmin } from '@/lib/permissions';
import UsersTab from './UsersTab';
import ServersTab from './ServersTab';
import AIConfigTab from './AIConfigTab';
import TranslationTab from './TranslationTab';

const tabs = [
  { id: 'users', label: 'Users & Roles', icon: Users },
  { id: 'servers', label: 'Environment Servers', icon: Server },
  { id: 'ai', label: 'AI Configuration', icon: Brain },
  { id: 'translation', label: 'Build Translation', icon: Languages },
];

function AdminPage() {
  const currentUser = useUsersStore((s) => s.getCurrentUser());

  if (!currentUser || !canAccessAdmin(currentUser.role)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-8 text-center max-w-md">
          <h2 className="text-xl font-light text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-light text-foreground mb-6">Admin Settings</h1>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-sm border border-border p-1 h-auto flex-wrap">
          {tabs.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-4 py-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="servers">
          <ServersTab />
        </TabsContent>
        <TabsContent value="ai">
          <AIConfigTab />
        </TabsContent>
        <TabsContent value="translation">
          <TranslationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminPage;

import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Lightbulb,
  FileText,
  Bug,
  FolderOpen,
  Plus,
  Settings,
  ChevronDown,
  Shield,
  Code2,
  Eye,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUsersStore } from '@/stores/users'
import { canAccessAdmin } from '@/lib/permissions'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/new/idea', icon: Plus, label: 'New Idea' },
  { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
  { to: '/charters', icon: FileText, label: 'Charters' },
  { to: '/issues', icon: Bug, label: 'Issues' },
  { to: '/scaffolding', icon: FolderOpen, label: 'Scaffolding' },
]

const ROLE_ICON = {
  admin: Shield,
  developer: Code2,
  viewer: Eye,
}

function Sidebar() {
  const currentUser = useUsersStore((s) => s.getCurrentUser())
  const users = useUsersStore((s) => s.users)
  const setCurrentUser = useUsersStore((s) => s.setCurrentUser)
  const showAdmin = currentUser && canAccessAdmin(currentUser.role)

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-light tracking-tight">
          <span className="animated-gradient-text">Control</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Development Operations Hub</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        {showAdmin && (
          <>
            <div className="h-px bg-sidebar-border my-2" />
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              Admin
            </NavLink>
          </>
        )}
      </nav>

      {/* Current user switcher (prototype simulation) */}
      {currentUser && (
        <div className="px-3 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-sidebar-accent/50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <p className="px-2 py-1.5 text-xs text-muted-foreground">Switch user (prototype)</p>
              {users
                .filter((u) => u.status === 'active')
                .map((user) => {
                  const RoleIcon = ROLE_ICON[user.role]
                  return (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => setCurrentUser(user.id)}
                      className={user.id === currentUser.id ? 'bg-accent' : ''}
                    >
                      <RoleIcon className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                      <span className="flex-1">{user.name}</span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {user.role}
                      </span>
                    </DropdownMenuItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="px-4 pb-2">
        <p className="text-xs text-muted-foreground text-center">Prototype v0.1.0</p>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-sidebar-border">
        <div className="flex items-center justify-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
          <span className="text-[10px] text-muted-foreground tracking-wide uppercase">
            Powered by
          </span>
          <img src="/level-set-logo.svg" alt="Level Set AI Consulting" className="h-16 rounded" />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

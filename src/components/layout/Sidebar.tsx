import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  FileText,
  Bug,
  FolderOpen,
  Plus,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/new', icon: Plus, label: 'New Idea' },
  { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
  { to: '/charters', icon: FileText, label: 'Charters' },
  { to: '/issues', icon: Bug, label: 'Issues' },
  { to: '/scaffolding', icon: FolderOpen, label: 'Scaffolding' },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex flex-col min-h-screen shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-light tracking-tight">
          <span className="animated-gradient-text">StageManager</span>
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
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          Prototype v0.1.0
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;

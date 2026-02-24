import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          <Outlet />
        </div>
        <div className="fixed bottom-3 right-3 flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
          <span className="text-[10px] text-muted-foreground tracking-wide uppercase">Powered by</span>
          <img
            src="/level-set-logo.svg"
            alt="Level Set AI Consulting"
            className="h-8 rounded"
          />
        </div>
      </main>
    </div>
  );
}

export default AppShell;

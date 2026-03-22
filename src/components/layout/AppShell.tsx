import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { usePresentationStore } from '@/stores/presentation'

function AppShell() {
  const presenting = usePresentationStore((s) => s.active)

  return (
    <div className="flex min-h-screen">
      {!presenting && <Sidebar />}
      <main className="flex-1 overflow-auto relative">
        <div className={presenting ? 'px-4 py-4' : 'max-w-7xl mx-auto px-6 sm:px-8 py-8'}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppShell

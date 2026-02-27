import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function AppShell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AppShell

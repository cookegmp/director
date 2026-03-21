import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import AppShell from '@/components/layout/AppShell'
import ClientsPage from '@/pages/ClientsPage'
import EngagementsPage from '@/pages/EngagementsPage'
import DiscoveryPage from '@/pages/DiscoveryPage'
import ScaffoldingPage from '@/pages/ScaffoldingPage'
import OcaiPage from '@/pages/OcaiPage'
import TerminologyPage from '@/pages/TerminologyPage'
import SettingsPage from '@/pages/SettingsPage'

const DATA_VERSION = 1
const VERSION_KEY = 'director-data-version'

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/clients" replace />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/engagements" element={<EngagementsPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/scaffolding" element={<ScaffoldingPage />} />
            <Route path="/ocai" element={<OcaiPage />} />
            <Route path="/terminology" element={<TerminologyPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="*"
              element={
                <div className="text-center py-20">
                  <h1 className="text-2xl font-light mb-2">Page not found</h1>
                  <p className="text-muted-foreground">
                    The page you are looking for does not exist.
                  </p>
                </div>
              }
            />
          </Route>
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  )
}

// Exported for use in P1 seeding logic
export { DATA_VERSION, VERSION_KEY }
export default App

import { Component, useEffect } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
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
import { seedSampleData } from '@/lib/sample-data'

const DATA_VERSION = 1
const VERSION_KEY = 'director-data-version'

// ─── Error Boundary ────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Director ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-8 max-w-md text-center">
            <h1 className="text-xl font-light text-foreground mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Return to Home
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Data Seeding ──────────────────────────────────────────

function SeedData() {
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY)
    const currentVersion = parseInt(storedVersion ?? '0', 10)

    if (currentVersion < DATA_VERSION) {
      localStorage.removeItem('director-clients')
      localStorage.removeItem('director-engagements')
      localStorage.removeItem('director-discovery')
      localStorage.removeItem('director-scaffolding')
      localStorage.removeItem('director-ocai')
      localStorage.removeItem('director-terminology')
      localStorage.removeItem('director-settings')

      seedSampleData()
      localStorage.setItem(VERSION_KEY, String(DATA_VERSION))
    }
  }, [])

  return null
}

// ─── App ───────────────────────────────────────────────────

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <TooltipProvider>
          <SeedData />
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
    </ErrorBoundary>
  )
}

export { DATA_VERSION, VERSION_KEY }
export default App

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import ClientsPage from '@/pages/ClientsPage'
import EngagementsPage from '@/pages/EngagementsPage'
import DiscoveryPage from '@/pages/DiscoveryPage'
import ScaffoldingPage from '@/pages/ScaffoldingPage'
import OcaiPage from '@/pages/OcaiPage'
import TerminologyPage from '@/pages/TerminologyPage'
import SettingsPage from '@/pages/SettingsPage'

// Seed sample data for tests
import { seedSampleData } from '@/lib/sample-data'
seedSampleData()

function renderPage(element: React.ReactElement, initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <TooltipProvider>
        {element}
      </TooltipProvider>
    </MemoryRouter>,
  )
}

describe('Clients page', () => {
  it('renders Precision Dynamics', () => {
    renderPage(<ClientsPage />, '/clients')
    expect(screen.getByText('Precision Dynamics')).toBeInTheDocument()
  })

  it('renders Midwest Distribution Co', () => {
    renderPage(<ClientsPage />, '/clients')
    expect(screen.getByText('Midwest Distribution Co')).toBeInTheDocument()
  })
})

describe('Engagements page', () => {
  it('renders without crashing', () => {
    renderPage(<EngagementsPage />, '/engagements')
    expect(screen.getByText('Engagements')).toBeInTheDocument()
  })
})

describe('Discovery page', () => {
  it('renders heading', () => {
    const { container } = renderPage(<DiscoveryPage />, '/discovery')
    expect(container.querySelector('h1')?.textContent).toBe('Discovery')
  })
})

describe('Scaffolding page', () => {
  it('renders Operational Intelligence', () => {
    renderPage(<ScaffoldingPage />, '/scaffolding')
    expect(screen.getByText(/Operational Intelligence/)).toBeInTheDocument()
  })
})

describe('OCAI page', () => {
  it('renders without crashing', () => {
    renderPage(<OcaiPage />, '/ocai')
    expect(screen.getByText('OCAI')).toBeInTheDocument()
  })
})

describe('Terminology page', () => {
  it('renders without crashing', () => {
    renderPage(<TerminologyPage />, '/terminology')
    expect(screen.getByText('Terminology')).toBeInTheDocument()
  })
})

describe('Settings page', () => {
  it('renders OpenRouter API Key label', () => {
    renderPage(<SettingsPage />, '/settings')
    expect(screen.getByText('OpenRouter API Key')).toBeInTheDocument()
  })

  it('renders MOCK MODE badge', () => {
    renderPage(<SettingsPage />, '/settings')
    expect(screen.getByText(/MOCK MODE/)).toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SettingsPage from './SettingsPage'

describe('SettingsPage', () => {
  it('renders the OpenRouter API Key label', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('OpenRouter API Key')).toBeInTheDocument()
  })

  it('renders mock mode badge when VITE_USE_MOCK_DATA is true', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText(/MOCK MODE/)).toBeInTheDocument()
  })

  it('renders the About section with version', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Director')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })
})

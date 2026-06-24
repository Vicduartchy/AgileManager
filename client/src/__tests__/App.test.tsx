import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

vi.mock('../store', () => ({
  useStore: () => ({
    roles: [], squads: [], agilistas: [], loading: false,
    fetchAll: vi.fn(), moveAgilista: vi.fn(), updateAgilista: vi.fn(), deleteAgilista: vi.fn(),
  }),
}))

describe('App', () => {
  it('renders login screen with brand name', () => {
    render(<App />)
    const matches = screen.getAllByText(/AgileManager/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows login form', () => {
    render(<App />)
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })
})

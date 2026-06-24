import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Dashboard from '../pages/Dashboard'

vi.mock('../store', () => ({
  useStore: () => ({
    roles: [],
    squads: [
      { id: 1, nome: 'Alpha', tribo: 'Tech', ativa: 1, agilistas: [{ id: 1, nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: 1, status: 'ativo' }] },
      { id: 2, nome: 'Beta', tribo: 'Ops', ativa: 1, agilistas: [] },
    ],
    agilistas: [
      { id: 1, nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: 1, status: 'ativo' },
      { id: 2, nome: 'Bob', email: 'bob@x.com', role_id: 1, squad_id: null, status: 'ativo' },
    ],
    loading: false,
    fetchAll: vi.fn(),
  }),
}))

describe('Dashboard', () => {
  it('shows active agilistas count in the correct card', () => {
    render(<Dashboard />)
    const label = screen.getByText('Agilistas Ativos')
    expect(label.closest('div')).toHaveTextContent('2')
  })

  it('shows squad without agilista warning', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Beta/)).toBeInTheDocument()
  })

  it('shows agilistas without squad (pool)', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Bob/)).toBeInTheDocument()
  })
})

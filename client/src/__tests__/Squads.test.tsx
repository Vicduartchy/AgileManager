import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Squads from '../pages/Squads'

vi.mock('../store', () => ({
  useStore: () => ({
    squads: [
      { id: 1, nome: 'Alpha', tribo: 'Tech', ativa: 1, agilistas: [
        { id: 1, nome: 'Ana', email: 'a@x.com', role_id: 1, squad_id: 1, status: 'ativo' }
      ]},
    ],
    fetchAll: vi.fn(),
  }),
}))

vi.mock('../api', () => ({ api: { squads: { create: vi.fn(), update: vi.fn() } } }))

describe('Squads', () => {
  it('renders squad name and tribo', () => {
    render(<Squads />)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument()
  })

  it('shows agilista count', () => {
    render(<Squads />)
    expect(screen.getByText('1 agilista')).toBeInTheDocument()
  })
})

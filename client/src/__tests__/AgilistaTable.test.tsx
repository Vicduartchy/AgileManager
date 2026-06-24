import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import AgilistaTable from '../components/AgilistaTable'
import type { Agilista, Role, Squad } from '../types'

const roles: Role[] = [{ id: 1, nome: 'SM' }]
const squads: Squad[] = [{ id: 1, nome: 'Alpha', tribo: 'Tech', ativa: 1 }]
const agilistas: Agilista[] = [
  { id: 1, nome: 'Ana Lima', email: 'ana@x.com', role_id: 1, squad_id: 1, status: 'ativo' },
  { id: 2, nome: 'Bob Silva', email: 'bob@x.com', role_id: 1, squad_id: null, status: 'ativo' },
]
const onUpdate = vi.fn()

describe('AgilistaTable', () => {
  it('renders all agilistas', () => {
    render(<AgilistaTable agilistas={agilistas} roles={roles} squads={squads} onUpdate={onUpdate} />)
    expect(screen.getByDisplayValue('Ana Lima')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Bob Silva')).toBeInTheDocument()
  })

  it('filters by name search', async () => {
    render(<AgilistaTable agilistas={agilistas} roles={roles} squads={squads} onUpdate={onUpdate} />)
    await userEvent.type(screen.getByPlaceholderText(/buscar/i), 'bob')
    expect(screen.queryByDisplayValue('Ana Lima')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('Bob Silva')).toBeInTheDocument()
  })
})

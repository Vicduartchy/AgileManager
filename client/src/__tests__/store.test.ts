import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStore } from '../store'

const mockRoles = [{ id: 1, nome: 'SM' }]
const mockSquads = [{ id: 1, nome: 'Alpha', tribo: 'Tech', ativa: 1, agilistas: [] }]
const mockAgilistas = [{ id: 1, nome: 'Ana', email: 'ana@x.com', role_id: 1, squad_id: null, status: 'ativo' as const }]

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn((url: string) => {
    if (url.includes('/roles')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockRoles) })
    if (url.includes('/squads')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSquads) })
    if (url.includes('/agilistas')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockAgilistas) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  }))
  // reset store
  useStore.setState({ roles: [], squads: [], agilistas: [], loading: false })
})

describe('useStore', () => {
  it('fetchAll populates roles, squads, agilistas', async () => {
    const { result } = renderHook(() => useStore())
    await act(async () => { await result.current.fetchAll() })
    expect(result.current.roles).toEqual(mockRoles)
    expect(result.current.squads).toEqual(mockSquads)
    expect(result.current.agilistas).toEqual(mockAgilistas)
  })
})

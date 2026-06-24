import { create } from 'zustand'
import { api } from './api'
import type { Role, SquadWithAgilistas, Agilista } from './types'

interface State {
  roles: Role[]
  squads: SquadWithAgilistas[]
  agilistas: Agilista[]
  loading: boolean
  fetchAll: () => Promise<void>
  moveAgilista: (agilista_id: number, squad_id: number) => Promise<void>
  updateAgilista: (id: number, data: Partial<Agilista>) => Promise<void>
}

export const useStore = create<State>((set, get) => ({
  roles: [],
  squads: [],
  agilistas: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true })
    const [roles, squads, agilistas] = await Promise.all([
      api.roles.list(),
      api.squads.list(),
      api.agilistas.list(),
    ])
    set({ roles, squads, agilistas, loading: false })
  },

  moveAgilista: async (agilista_id, squad_id) => {
    await api.alocacoes.move(agilista_id, squad_id)
    await get().fetchAll()
  },

  updateAgilista: async (id, data) => {
    await api.agilistas.update(id, data)
    await get().fetchAll()
  },
}))

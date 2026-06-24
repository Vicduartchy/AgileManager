import type { Role, Squad, SquadWithAgilistas, Agilista, NewAgilista, Alocacao } from './types'

const BASE = '/api'

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  roles: {
    list: () => fetch(`${BASE}/roles`).then(r => json<Role[]>(r)),
  },
  squads: {
    list: () => fetch(`${BASE}/squads`).then(r => json<SquadWithAgilistas[]>(r)),
    create: (data: { nome: string; tribo: string }) =>
      fetch(`${BASE}/squads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => json<Squad>(r)),
    update: (id: number, data: Partial<Squad>) =>
      fetch(`${BASE}/squads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => json<Squad>(r)),
  },
  agilistas: {
    list: (filters?: { role_id?: number; squad_id?: number; status?: string }) => {
      const params = new URLSearchParams()
      if (filters?.role_id) params.set('role_id', String(filters.role_id))
      if (filters?.squad_id) params.set('squad_id', String(filters.squad_id))
      if (filters?.status) params.set('status', filters.status)
      return fetch(`${BASE}/agilistas?${params}`).then(r => json<Agilista[]>(r))
    },
    create: (data: NewAgilista) =>
      fetch(`${BASE}/agilistas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => json<Agilista>(r)),
    update: (id: number, data: Partial<Agilista>) =>
      fetch(`${BASE}/agilistas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(r => json<Agilista>(r)),
    bulk: (rows: NewAgilista[]) =>
      fetch(`${BASE}/agilistas/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      }).then(r => json<{ created: number; updated: number }>(r)),
  },
  alocacoes: {
    move: (agilista_id: number, squad_id: number) =>
      fetch(`${BASE}/alocacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agilista_id, squad_id }),
      }).then(r => json<Alocacao>(r)),
    history: (agilista_id: number) =>
      fetch(`${BASE}/alocacoes/${agilista_id}`).then(r => json<Alocacao[]>(r)),
  },
}

import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { api } from '../api'

export default function Roles() {
  const { roles, fetchAll } = useStore()
  const [newRole, setNewRole] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleAdd = async () => {
    const name = newRole.trim()
    if (!name) return
    if (roles.some(r => r.nome.toLowerCase() === name.toLowerCase())) {
      alert('Role já existe')
      return
    }
    setAdding(true)
    try {
      await api.roles.create(name)
      setNewRole('')
      await fetchAll()
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (id: number, nome: string) => {
    if (!confirm(`Remover role "${nome}"?`)) return
    await api.roles.remove(id)
    await fetchAll()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-navy">Roles</h1>
        <p className="text-[13px] text-[#6b7280] mt-0.5">Gerencie as roles disponíveis para os agilistas</p>
      </div>

      <div
        className="bg-white border border-[#E0E0E0] rounded-[10px] p-5"
        style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)' }}
      >
        <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6b7280] mb-3">
          Roles cadastradas
        </div>

        <div className="flex flex-wrap">
          {roles.length === 0 ? (
            <span className="text-[13px] text-[#6b7280]">Nenhuma role cadastrada.</span>
          ) : (
            roles.map(r => (
              <span
                key={r.id}
                className="inline-flex items-center gap-2 bg-white border-[1.5px] border-[#E0E0E0] rounded-full px-4 py-1.5 text-[13px] font-semibold text-navy m-1"
              >
                {r.nome}
                <button
                  onClick={() => handleRemove(r.id, r.nome)}
                  className="text-[#6b7280] hover:text-red-600 leading-none text-base"
                  title="Remover"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-2.5 mt-5 pt-4 border-t border-[#E0E0E0]">
          <input
            className="px-3 py-2.5 bg-page-bg border-[1.5px] border-[#E0E0E0] rounded-lg text-sm outline-none focus:border-brand-red"
            style={{ maxWidth: 240, width: '100%' }}
            placeholder="Nome da nova role..."
            value={newRole}
            onChange={e => setNewRole(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
          />
          <button
            onClick={handleAdd}
            disabled={!newRole.trim() || adding}
            className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-semibold rounded-lg bg-brand-red text-white hover:bg-[#a33a22] disabled:opacity-50 transition-colors"
          >
            + Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

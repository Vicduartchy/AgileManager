import { useEffect, useState } from 'react'
import { Plus, ChevronDown, X, Save } from 'lucide-react'
import { useStore } from '../store'
import { api } from '../api'

export default function Squads() {
  const { squads, fetchAll } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', tribo: '' })
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCreate = async () => {
    if (!form.nome) return
    setSaving(true)
    try {
      await api.squads.create(form)
      setOpen(false)
      setForm({ nome: '', tribo: '' })
      await fetchAll()
    } finally {
      setSaving(false)
    }
  }

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const inputClass = 'w-full px-3 py-2.5 bg-page-bg border-[1.5px] border-[#E0E0E0] rounded-lg text-sm outline-none focus:border-brand-red'
  const labelClass = 'block text-[11px] font-bold text-navy uppercase tracking-[0.5px] mb-1.5'

  const statusBadge: Record<string, string> = {
    ativo: 'bg-[#dcfce7] text-[#166534]',
    inativo: 'bg-[#fee2e2] text-[#991b1b]',
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-navy">Squads</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Crie, edite e organize as squads do time</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-red text-white text-[13px] font-semibold rounded-lg hover:bg-[#a33a22] transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          Nova Squad
        </button>
      </div>

      {/* Squad accordion list */}
      <div className="space-y-3">
        {squads.map(squad => {
          const isOpen = expanded.has(squad.id)
          const count = squad.agilistas.length
          return (
            <div
              key={squad.id}
              className="bg-white border border-[#E0E0E0] rounded-[10px] overflow-hidden"
              style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer border-l-4 border-l-brand-red hover:bg-[#fdf5f3] transition-colors"
                onClick={() => toggleExpand(squad.id)}
              >
                <div>
                  <strong className="text-navy">{squad.nome}</strong>
                  <span className="text-[#6b7280] text-[12px] ml-2.5">{squad.tribo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6b7280] text-[12px]">
                    {count} {count === 1 ? 'agilista' : 'agilistas'}
                  </span>
                  {!squad.ativa && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b]">
                      Inativa
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className="text-[#6b7280] transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="px-5 py-4 border-t border-[#E0E0E0] flex flex-wrap gap-2">
                  {squad.agilistas.length === 0 ? (
                    <span className="text-[#6b7280] text-[13px]">Nenhum agilista alocado nesta squad.</span>
                  ) : (
                    squad.agilistas.map(m => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 bg-page-bg border border-[#E0E0E0] rounded-lg px-3.5 py-2 text-[13px]"
                      >
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#e8edf5] text-navy">SM</span>
                        <span>{m.nome}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[m.status] ?? 'bg-[#e8edf5] text-navy'}`}>
                          {m.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}

        {squads.length === 0 && (
          <div className="text-center py-14 text-[#6b7280]">
            Nenhuma squad cadastrada.
          </div>
        )}
      </div>

      {/* Create modal */}
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(9,32,64,.5)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-[14px]"
            style={{ width: 500, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(9,32,64,.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0E0E0]">
              <h2 className="text-[16px] font-bold text-navy">Nova Squad</h2>
              <button onClick={() => setOpen(false)} className="text-[#6b7280] hover:text-brand-red p-0.5 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={labelClass}>Nome da Squad *</label>
                <input className={inputClass} placeholder="Ex: Squad Pagamentos" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Tribo / Área</label>
                <input className={inputClass} placeholder="Ex: Tribo Financeiro" value={form.tribo} onChange={e => setForm(f => ({ ...f, tribo: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[#E0E0E0]">
              <button onClick={() => setOpen(false)} className="px-4 py-2 text-[13px] font-semibold rounded-lg border border-[#E0E0E0] bg-white text-[#1a1a2e] hover:border-brand-red hover:text-brand-red transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.nome || saving}
                className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-lg bg-brand-red text-white hover:bg-[#a33a22] disabled:opacity-50 transition-colors"
              >
                <Save size={13} />
                {saving ? 'Criando...' : 'Criar Squad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

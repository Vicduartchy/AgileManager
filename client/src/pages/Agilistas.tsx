import { useEffect, useState } from 'react'
import { useStore } from '../store'
import AgilistaTable from '../components/AgilistaTable'
import { api } from '../api'
import type { Agilista } from '../types'

type ModalState = { open: false } | { open: true; editing: Agilista | null }

const emptyForm = { nome: '', email: '', role_id: '', squad_id: '', status: 'ativo' }

export default function Agilistas() {
  const { agilistas, roles, squads, fetchAll, updateAgilista, deleteAgilista } = useStore()
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [form, setForm] = useState(emptyForm)
  const [filterRole, setFilterRole] = useState('')
  const [filterSquad, setFilterSquad] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchAll() }, [fetchAll])

  const openNew = () => {
    setForm(emptyForm)
    setModal({ open: true, editing: null })
  }

  const openEdit = (a: Agilista) => {
    setForm({
      nome: a.nome,
      email: a.email,
      role_id: String(a.role_id),
      squad_id: a.squad_id ? String(a.squad_id) : '',
      status: a.status,
    })
    setModal({ open: true, editing: a })
  }

  const closeModal = () => setModal({ open: false })

  const handleSave = async () => {
    if (!form.nome || !form.role_id) return
    setSaving(true)
    try {
      if (modal.open && modal.editing) {
        await updateAgilista(modal.editing.id, {
          nome: form.nome,
          email: form.email,
          role_id: Number(form.role_id),
          squad_id: form.squad_id ? Number(form.squad_id) : null,
          status: form.status as 'ativo' | 'inativo',
        })
      } else {
        await api.agilistas.create({
          nome: form.nome,
          email: form.email,
          role_id: Number(form.role_id),
          squad_id: form.squad_id ? Number(form.squad_id) : null,
          status: 'ativo',
        })
        await fetchAll()
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const squadList = squads.map(s => ({ id: s.id, nome: s.nome, tribo: s.tribo, ativa: s.ativa }))

  const filtered = agilistas.filter(a => {
    if (filterRole && a.role_id !== Number(filterRole)) return false
    if (filterSquad && a.squad_id !== Number(filterSquad)) return false
    if (filterStatus && a.status !== filterStatus) return false
    return true
  })

  const selClass = 'px-3 py-2 bg-white border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] text-[#1a1a2e] outline-none focus:border-brand-red cursor-pointer'
  const labelClass = 'block text-[11px] font-bold text-navy uppercase tracking-[0.5px] mb-1.5'
  const inputClass = 'w-full px-3 py-2.5 bg-page-bg border-[1.5px] border-[#E0E0E0] rounded-lg text-sm outline-none focus:border-brand-red'

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-navy">Agilistas</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Gerencie todos os agilistas do time de governança</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-red text-white text-[13px] font-semibold rounded-lg hover:bg-[#a33a22] transition-colors"
        >
          + Novo Agilista
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5 mb-4 items-center">
        <select className={selClass} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">Todas as roles</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
        </select>
        <select className={selClass} value={filterSquad} onChange={e => setFilterSquad(e.target.value)}>
          <option value="">Todas as squads</option>
          {squads.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
        <select className={selClass} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        {(filterRole || filterSquad || filterStatus) && (
          <button
            className="text-[13px] text-brand-red hover:underline"
            onClick={() => { setFilterRole(''); setFilterSquad(''); setFilterStatus('') }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      <AgilistaTable
        agilistas={filtered}
        roles={roles}
        squads={squadList}
        onUpdate={updateAgilista}
        onDelete={deleteAgilista}
        onEdit={openEdit}
      />

      {/* Modal */}
      {modal.open && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(9,32,64,.5)' }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-[14px] overflow-y-auto"
            style={{ width: 500, maxWidth: '95vw', maxHeight: '90vh', boxShadow: '0 20px 60px rgba(9,32,64,.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0E0E0]">
              <h2 className="text-[16px] font-bold text-navy">
                {modal.editing ? 'Editar Agilista' : 'Novo Agilista'}
              </h2>
              <button onClick={closeModal} className="text-[#6b7280] hover:text-brand-red text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={labelClass}>Nome *</label>
                <input
                  className={inputClass}
                  placeholder="Nome completo"
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="email@empresa.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelClass}>Role *</label>
                <select
                  className={`w-full px-3 py-2.5 bg-page-bg border-[1.5px] border-[#E0E0E0] rounded-lg text-sm outline-none focus:border-brand-red`}
                  value={form.role_id}
                  onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}
                >
                  <option value="">Selecione...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Squad</label>
                <select
                  className={`w-full px-3 py-2.5 bg-page-bg border-[1.5px] border-[#E0E0E0] rounded-lg text-sm outline-none focus:border-brand-red`}
                  value={form.squad_id}
                  onChange={e => setForm(f => ({ ...f, squad_id: e.target.value }))}
                >
                  <option value="">— Pool (sem squad) —</option>
                  {squads.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>
              {modal.editing && (
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    className={`w-full px-3 py-2.5 bg-page-bg border-[1.5px] border-[#E0E0E0] rounded-lg text-sm outline-none focus:border-brand-red`}
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-[#E0E0E0]">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-[13px] font-semibold rounded-lg border border-[#E0E0E0] bg-white text-[#1a1a2e] hover:border-brand-red hover:text-brand-red transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!form.nome || !form.role_id || saving}
                className="px-4 py-2 text-[13px] font-semibold rounded-lg bg-brand-red text-white hover:bg-[#a33a22] disabled:opacity-50 transition-colors"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

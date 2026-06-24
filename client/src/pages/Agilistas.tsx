import { useEffect, useState } from 'react'
import { useStore } from '../store'
import AgilistaTable from '../components/AgilistaTable'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '../api'

export default function Agilistas() {
  const { agilistas, roles, squads, fetchAll, updateAgilista } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', role_id: '' })

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCreate = async () => {
    await api.agilistas.create({ nome: form.nome, email: form.email, role_id: Number(form.role_id), squad_id: null, status: 'ativo' })
    setOpen(false)
    setForm({ nome: '', email: '', role_id: '' })
    await fetchAll()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Agilistas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Novo Agilista</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Agilista</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <Input placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              <Input placeholder="E-mail" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <select className="w-full border rounded px-3 py-2 text-sm" value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}>
                <option value="">Selecione um role</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
              </select>
              <Button onClick={handleCreate} disabled={!form.nome || !form.email || !form.role_id}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <AgilistaTable
        agilistas={agilistas}
        roles={roles}
        squads={squads.map(s => ({ id: s.id, nome: s.nome, tribo: s.tribo, ativa: s.ativa }))}
        onUpdate={updateAgilista}
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api } from '../api'

export default function Squads() {
  const { squads, fetchAll } = useStore()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', tribo: '' })

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCreate = async () => {
    await api.squads.create(form)
    setOpen(false)
    setForm({ nome: '', tribo: '' })
    await fetchAll()
  }

  const handleToggle = async (id: number, ativa: number) => {
    await api.squads.update(id, { ativa: ativa ? 0 : 1 })
    await fetchAll()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Squads</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>+ Nova Squad</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Squad</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <Input placeholder="Nome da squad" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              <Input placeholder="Tribo / Área" value={form.tribo} onChange={e => setForm(f => ({ ...f, tribo: e.target.value }))} />
              <Button onClick={handleCreate} disabled={!form.nome || !form.tribo}>Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {squads.map(squad => (
          <div key={squad.id} className={`bg-white rounded-lg border p-4 space-y-2 ${!squad.ativa ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{squad.nome}</p>
                <p className="text-sm text-gray-500">{squad.tribo}</p>
              </div>
              <button
                onClick={() => handleToggle(squad.id, squad.ativa)}
                className="text-xs text-gray-400 hover:text-gray-700"
              >
                {squad.ativa ? 'Inativar' : 'Ativar'}
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {squad.agilistas.length} {squad.agilistas.length === 1 ? 'agilista' : 'agilistas'}
            </p>
            <div className="flex flex-wrap gap-1">
              {squad.agilistas.map(a => (
                <span key={a.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{a.nome}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { parseSheet, validateRows, type ParsedRow } from '../lib/parseSheet'
import type { Role, Squad, NewAgilista } from '../types'

interface Props {
  roles: Role[]
  squads: Squad[]
  onImport: (rows: NewAgilista[]) => Promise<void>
}

export default function UploadModal({ roles, squads, onImport }: Props) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const parsed = await parseSheet(file)
    const errs = validateRows(parsed)
    setRows(parsed)
    setErrors(errs)
  }

  const handleConfirm = async () => {
    const mapped: NewAgilista[] = rows.map(r => {
      const role = roles.find(ro => ro.nome.toLowerCase() === r.role.toLowerCase())
      const squad = r.squad ? squads.find(s => s.nome.toLowerCase() === r.squad!.toLowerCase()) : undefined
      return { nome: r.nome, email: r.email, role_id: role?.id ?? 0, squad_id: squad?.id ?? null, status: 'ativo' as const }
    })
    await onImport(mapped)
    setOpen(false)
    setRows([])
    setErrors([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Importar Planilha</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Importar Agilistas via Planilha</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <input ref={inputRef} type="file" accept=".xlsx,.csv" onChange={handleFile} className="text-sm" />
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 space-y-1">
              {errors.map((e, i) => <p key={i}>{e}</p>)}
            </div>
          )}
          {rows.length > 0 && errors.length === 0 && (
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="bg-gray-50">
                  {['Nome', 'E-mail', 'Role', 'Squad'].map(h => <th key={h} className="px-3 py-2 text-left border">{h}</th>)}
                </tr></thead>
                <tbody>{rows.map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-1 border">{r.nome}</td>
                    <td className="px-3 py-1 border">{r.email}</td>
                    <td className="px-3 py-1 border">{r.role}</td>
                    <td className="px-3 py-1 border">{r.squad ?? '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirm} disabled={rows.length === 0 || errors.length > 0}>
              Importar {rows.length} registro(s)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useState, useMemo } from 'react'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  createColumnHelper, flexRender,
} from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import type { Agilista, Role, Squad } from '../types'

interface Props {
  agilistas: Agilista[]
  roles: Role[]
  squads: Squad[]
  onUpdate: (id: number, data: Partial<Agilista>) => Promise<void>
}

const col = createColumnHelper<Agilista>()

export default function AgilistaTable({ agilistas, roles, squads, onUpdate }: Props) {
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(() => [
    col.accessor('nome', {
      header: 'Nome',
      cell: ({ row, getValue }) => (
        <input
          className="w-full border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
          defaultValue={getValue()}
          onBlur={e => {
            if (e.target.value !== row.original.nome) {
              onUpdate(row.original.id, { nome: e.target.value })
            }
          }}
        />
      ),
    }),
    col.accessor('email', {
      header: 'E-mail',
      cell: ({ row, getValue }) => (
        <input
          className="w-full border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
          defaultValue={getValue()}
          onBlur={e => {
            if (e.target.value !== row.original.email) {
              onUpdate(row.original.id, { email: e.target.value })
            }
          }}
        />
      ),
    }),
    col.accessor('role_id', {
      header: 'Role',
      cell: ({ row, getValue }) => (
        <select
          className="border rounded px-2 py-1 text-sm"
          value={getValue()}
          onChange={e => onUpdate(row.original.id, { role_id: Number(e.target.value) })}
        >
          {roles.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
        </select>
      ),
    }),
    col.accessor('squad_id', {
      header: 'Squad',
      cell: ({ row, getValue }) => (
        <select
          className="border rounded px-2 py-1 text-sm"
          value={getValue() ?? ''}
          onChange={e => onUpdate(row.original.id, { squad_id: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">— Pool —</option>
          {squads.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      ),
    }),
    col.accessor('status', {
      header: 'Status',
      cell: ({ row, getValue }) => (
        <select
          className="border rounded px-2 py-1 text-sm"
          value={getValue()}
          onChange={e => onUpdate(row.original.id, { status: e.target.value as 'ativo' | 'inativo' })}
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      ),
    }),
  ], [roles, squads, onUpdate])

  const table = useReactTable({
    data: agilistas,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar por nome, e-mail..."
        value={globalFilter}
        onChange={e => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="px-4 py-3 text-left font-medium text-gray-600">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

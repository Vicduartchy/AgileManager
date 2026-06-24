import { useState, useMemo } from 'react'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  createColumnHelper, flexRender,
} from '@tanstack/react-table'
import type { Agilista, Role, Squad, Alocacao } from '../types'
import { api } from '../api'

interface Props {
  agilistas: Agilista[]
  roles: Role[]
  squads: Squad[]
  onUpdate: (id: number, data: Partial<Agilista>) => Promise<void>
  onDelete?: (id: number) => Promise<void>
  onEdit?: (agilista: Agilista) => void
}

const chipRole: Record<string, string> = {
  SM: 'bg-[#e8edf5] text-navy',
  PMO: 'bg-[#fdf0ec] text-brand-red',
  'Agile Coach': 'bg-[#faf0ee] text-[#9b5a4a]',
  RTE: 'bg-[#f0f9ff] text-[#0369a1]',
}

const statusBadge: Record<string, string> = {
  ativo: 'bg-[#dcfce7] text-[#166534]',
  inativo: 'bg-[#fee2e2] text-[#991b1b]',
}

const col = createColumnHelper<Agilista>()

export default function AgilistaTable({ agilistas, roles, squads, onUpdate, onDelete, onEdit }: Props) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [histAgilista, setHistAgilista] = useState<Agilista | null>(null)
  const [history, setHistory] = useState<Alocacao[]>([])
  const [histLoading, setHistLoading] = useState(false)

  const openHistory = async (a: Agilista) => {
    setHistAgilista(a)
    setHistLoading(true)
    try {
      const data = await api.alocacoes.history(a.id)
      setHistory(data)
    } catch {
      setHistory([])
    } finally {
      setHistLoading(false)
    }
  }

  const columns = useMemo(() => [
    col.accessor('nome', {
      header: 'Nome',
      cell: ({ getValue }) => (
        <strong className="text-navy">{getValue()}</strong>
      ),
    }),
    col.accessor('email', {
      header: 'E-mail',
      cell: ({ getValue }) => (
        <span className="text-[#6b7280]">{getValue()}</span>
      ),
    }),
    col.accessor('role_id', {
      header: 'Role',
      cell: ({ getValue }) => {
        const role = roles.find(r => r.id === getValue())
        const cls = chipRole[role?.nome ?? ''] ?? 'bg-[#e8edf5] text-navy'
        return (
          <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cls}`}>
            {role?.nome ?? '—'}
          </span>
        )
      },
    }),
    col.accessor('squad_id', {
      header: 'Squad',
      cell: ({ row, getValue }) => (
        <select
          className="bg-page-bg border-[1.5px] border-[#E0E0E0] text-[#1a1a2e] rounded-md px-2 py-1 text-[12px] cursor-pointer outline-none focus:border-brand-red"
          value={getValue() ?? ''}
          onChange={e => onUpdate(row.original.id, { squad_id: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">Pool</option>
          {squads.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      ),
    }),
    col.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const v = getValue()
        const cls = statusBadge[v] ?? 'bg-[#e8edf5] text-navy'
        return (
          <span className={`text-[11px] font-bold px-2.5 py-[3px] rounded-full ${cls}`}>
            {v === 'ativo' ? 'Ativo' : 'Inativo'}
          </span>
        )
      },
    }),
    col.display({
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          {onEdit && (
            <button
              onClick={() => onEdit(row.original)}
              title="Editar"
              className="px-2 py-1 text-[12px] font-semibold rounded-lg border border-[#E0E0E0] bg-white text-[#1a1a2e] hover:border-brand-red hover:text-brand-red transition-colors"
            >
              ✏
            </button>
          )}
          <button
            onClick={() => openHistory(row.original)}
            title="Histórico"
            className="px-2 py-1 text-[12px] font-semibold rounded-lg border border-[#E0E0E0] bg-white text-[#1a1a2e] hover:border-brand-red hover:text-brand-red transition-colors"
          >
            ⏱
          </button>
          {onDelete && (
            <button
              onClick={async () => {
                if (confirm(`Remover ${row.original.nome}?`)) {
                  await onDelete(row.original.id)
                }
              }}
              title="Remover"
              className="px-2 py-1 text-[12px] font-semibold rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              🗑
            </button>
          )}
        </div>
      ),
    }),
  ], [roles, squads, onUpdate, onDelete, onEdit])

  const table = useReactTable({
    data: agilistas,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <>
      {/* Search box */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">🔍</span>
        <input
          placeholder="Buscar por nome ou e-mail..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="w-full max-w-md pl-9 pr-3 py-2 bg-white border-[1.5px] border-[#E0E0E0] rounded-lg text-[13px] outline-none focus:border-brand-red"
        />
      </div>

      {/* Table */}
      <div
        className="bg-white border border-[#E0E0E0] rounded-[10px] overflow-hidden"
        style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)' }}
      >
        <table className="w-full text-[13px]">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-[0.6px]"
                    style={{ background: '#092040', color: 'rgba(255,255,255,.8)' }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-14 text-[#6b7280]">
                  Nenhum agilista encontrado.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b border-[#E0E0E0] last:border-0"
                  style={{ transition: 'background .1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fdf5f3')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* History modal */}
      {histAgilista && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(9,32,64,.5)' }}
          onClick={() => setHistAgilista(null)}
        >
          <div
            className="bg-white rounded-[14px] overflow-y-auto"
            style={{ width: 500, maxWidth: '95vw', maxHeight: '90vh', boxShadow: '0 20px 60px rgba(9,32,64,.25)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0E0E0]">
              <h2 className="text-[16px] font-bold text-navy">Histórico de Alocação</h2>
              <button
                onClick={() => setHistAgilista(null)}
                className="text-[#6b7280] hover:text-brand-red text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="font-bold text-navy mb-4">{histAgilista.nome}</div>
              {histLoading ? (
                <p className="text-[#6b7280] text-[13px]">Carregando...</p>
              ) : history.length === 0 ? (
                <p className="text-[#6b7280] text-[13px]">Sem histórico registrado.</p>
              ) : (
                [...history].reverse().map((h, i) => (
                  <div key={i} className="flex gap-3 py-2.5 border-b border-[#E0E0E0] last:border-0 text-[13px]">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-red mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Squad #{h.squad_id}</div>
                      <div className="text-[11px] text-[#6b7280]">
                        {h.data_inicio} → {h.data_fim ?? 'atual'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

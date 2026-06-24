import { useEffect } from 'react'
import { useStore } from '../store'

const chipRole: Record<string, string> = {
  SM: 'bg-[#e8edf5] text-navy',
  PMO: 'bg-[#fdf0ec] text-brand-red',
  'Agile Coach': 'bg-[#faf0ee] text-[#9b5a4a]',
  RTE: 'bg-[#f0f9ff] text-[#0369a1]',
}

export default function Dashboard() {
  const { squads, agilistas, fetchAll, loading } = useStore()

  useEffect(() => { fetchAll() }, [fetchAll])

  const squadsAtivas = squads.filter(s => s.ativa)
  const aglistasAtivos = agilistas.filter(a => a.status === 'ativo')
  const semSquad = aglistasAtivos.filter(a => a.squad_id === null)
  const squadsSemAgilista = squadsAtivas.filter(s => s.agilistas.length === 0)

  if (loading) return <p className="text-[#6b7280] p-6">Carregando...</p>

  const metrics = [
    {
      label: 'Agilistas Ativos',
      value: aglistasAtivos.length,
      sub: 'em squads ativas',
      borderColor: '#092040',
      valueColor: 'text-navy',
    },
    {
      label: 'Squads Ativas',
      value: squadsAtivas.length,
      sub: 'no total',
      borderColor: '#BF452A',
      valueColor: 'text-brand-red',
    },
    {
      label: 'Pool (sem squad)',
      value: semSquad.length,
      sub: 'aguardando alocação',
      borderColor: '#D99789',
      valueColor: 'text-salmon',
    },
    {
      label: 'Squads Sem Agilista',
      value: squadsSemAgilista.length,
      sub: 'atenção necessária',
      borderColor: '#dc2626',
      valueColor: 'text-red-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-navy">Dashboard</h1>
        <p className="text-[13px] text-[#6b7280] mt-0.5">Visão geral da gestão de agilistas</p>
      </div>

      {/* Metric cards — label is a direct child of the card div so closest('div') finds the card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(m => (
          <div
            key={m.label}
            className="bg-white border border-[#E0E0E0] rounded-[10px] p-5"
            style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)', borderLeft: `4px solid ${m.borderColor}` }}
          >
            <span className="block text-[11px] font-bold uppercase tracking-[0.7px] text-[#6b7280] mb-2">
              {m.label}
            </span>
            <div className={`text-[36px] font-extrabold leading-none mb-0.5 ${m.valueColor}`}>{m.value}</div>
            <div className="text-[12px] text-[#6b7280]">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Allocation map */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6b7280] mb-3.5">
          Mapa de alocação
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {squadsAtivas.map(squad => (
            <div
              key={squad.id}
              className="bg-white border border-[#E0E0E0] rounded-[10px] p-[18px]"
              style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)' }}
            >
              <div className="font-bold text-navy mb-0.5">{squad.nome}</div>
              <div className="text-[12px] text-[#6b7280] mb-3">{squad.tribo}</div>
              <div className="flex flex-wrap gap-1.5">
                {squad.agilistas.length === 0 ? (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#fef9ec] text-[#b45309] border border-[#fcd34d]">
                    Sem agilista
                  </span>
                ) : (
                  squad.agilistas.map(a => {
                    const cls = chipRole['SM'] || 'bg-[#e8edf5] text-navy'
                    return (
                      <span key={a.id} className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
                        {a.nome.split(' ')[0]}
                      </span>
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pool */}
      {semSquad.length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#6b7280] mb-3.5">
            Pool — aguardando alocação
          </div>
          <div
            className="bg-white border border-[#E0E0E0] rounded-[10px] p-5"
            style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)' }}
          >
            <div className="flex flex-wrap gap-2">
              {semSquad.map(a => (
                <span key={a.id} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#f0f9ff] text-[#0369a1]">
                  {a.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

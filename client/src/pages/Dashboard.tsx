import { useEffect } from 'react'
import { Users, Layers, UserMinus, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'

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
      iconBg: '#e8edf5',
      iconColor: '#092040',
      Icon: Users,
    },
    {
      label: 'Squads Ativas',
      value: squadsAtivas.length,
      sub: 'no total',
      borderColor: '#BF452A',
      valueColor: 'text-brand-red',
      iconBg: '#fdf0ec',
      iconColor: '#BF452A',
      Icon: Layers,
    },
    {
      label: 'Pool (sem squad)',
      value: semSquad.length,
      sub: 'aguardando alocação',
      borderColor: '#D99789',
      valueColor: 'text-salmon',
      iconBg: '#faf0ee',
      iconColor: '#D99789',
      Icon: UserMinus,
    },
    {
      label: 'Squads Sem Agilista',
      value: squadsSemAgilista.length,
      sub: 'atenção necessária',
      borderColor: '#dc2626',
      valueColor: 'text-red-600',
      iconBg: '#fee2e2',
      iconColor: '#dc2626',
      Icon: AlertTriangle,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-navy">Dashboard</h1>
        <p className="text-[13px] text-[#6b7280] mt-0.5">Visão geral da gestão de agilistas</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(({ label, value, sub, borderColor, valueColor, iconBg, iconColor, Icon }) => (
          <div
            key={label}
            className="bg-white border border-[#E0E0E0] rounded-[10px] p-5 relative"
            style={{ boxShadow: '0 2px 8px rgba(9,32,64,.08)', borderLeft: `4px solid ${borderColor}` }}
          >
            {/* icon floated top-right — not a div so closest('div') skips it */}
            <span
              className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: iconBg, color: iconColor }}
            >
              <Icon size={18} strokeWidth={1.8} />
            </span>
            {/* label is a direct child span — closest('div') finds the card div */}
            <span className="block text-[11px] font-bold uppercase tracking-[0.7px] text-[#6b7280] mb-2 pr-12">
              {label}
            </span>
            <div className={`text-[36px] font-extrabold leading-none mb-0.5 ${valueColor}`}>{value}</div>
            <div className="text-[12px] text-[#6b7280]">{sub}</div>
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
                  squad.agilistas.map(a => (
                    <span key={a.id} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#e8edf5] text-navy">
                      {a.nome.split(' ')[0]}
                    </span>
                  ))
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

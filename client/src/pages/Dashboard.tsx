import { useEffect } from 'react'
import { useStore } from '../store'

export default function Dashboard() {
  const { squads, agilistas, fetchAll, loading } = useStore()

  useEffect(() => { fetchAll() }, [fetchAll])

  const squadsAtivas = squads.filter(s => s.ativa)
  const aglistasAtivos = agilistas.filter(a => a.status === 'ativo')
  const semSquad = aglistasAtivos.filter(a => a.squad_id === null)
  const squadsSemAgilista = squadsAtivas.filter(s => s.agilistas.length === 0)

  if (loading) return <p className="text-gray-500 p-6">Carregando...</p>

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Agilistas Ativos', value: aglistasAtivos.length },
          { label: 'Squads Ativas', value: squadsAtivas.length },
          { label: 'Sem Squad', value: semSquad.length },
          { label: 'Squads Sem Agilista', value: squadsSemAgilista.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border p-4">
        <h2 className="font-semibold mb-4">Mapa de Alocação</h2>
        <div className="space-y-3">
          {squadsAtivas.map(squad => (
            <div key={squad.id} className="flex items-start gap-3">
              <span className="font-medium w-40 shrink-0">{squad.nome}</span>
              <div className="flex flex-wrap gap-2">
                {squad.agilistas.length === 0
                  ? <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Sem agilista</span>
                  : squad.agilistas.map(a => (
                      <span key={a.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{a.nome}</span>
                    ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {semSquad.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h2 className="font-semibold mb-4">Pool — Sem Squad</h2>
          <div className="flex flex-wrap gap-2">
            {semSquad.map(a => (
              <span key={a.id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{a.nome}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import Nav from './components/Nav'
import Dashboard from './pages/Dashboard'
import Agilistas from './pages/Agilistas'
import Squads from './pages/Squads'

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">AgileManager</h1>
      </header>
      <Nav current={page} onChange={setPage} />
      <main>
        {page === 'dashboard' && <Dashboard />}
        {page === 'agilistas' && <Agilistas />}
        {page === 'squads' && <Squads />}
      </main>
    </div>
  )
}

import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Agilistas from './pages/Agilistas'
import Squads from './pages/Squads'
import Upload from './pages/Upload'
import Roles from './pages/Roles'

type Page = 'dashboard' | 'agilistas' | 'squads' | 'upload' | 'roles'

const NAV = [
  { id: 'dashboard' as Page, label: 'Dashboard' },
  { id: 'agilistas' as Page, label: 'Agilistas' },
  { id: 'squads' as Page, label: 'Squads' },
  { id: 'upload' as Page, label: 'Upload' },
  { id: 'roles' as Page, label: 'Roles' },
]

export default function App() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [page, setPage] = useState<Page>('dashboard')
  const [loginEmail, setLoginEmail] = useState('admin@empresa.com')
  const [loginPass, setLoginPass] = useState('123456')

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div
          className="bg-white rounded-2xl mx-auto"
          style={{ padding: '48px 40px', width: 380, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}
        >
          <div className="text-center text-2xl font-extrabold text-navy mb-2 tracking-wide">AgileManager</div>
          <div className="text-center text-[#6b7280] text-[13px] mb-8">
            Gestão de agilistas · Governança ágil
          </div>
          <div className="h-px bg-[#E0E0E0] my-5" />
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-navy uppercase tracking-[0.5px] mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-3 py-2.5 bg-page-bg border-[1.5px] border-[#E0E0E0] rounded-lg text-sm outline-none focus:border-brand-red"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-navy uppercase tracking-[0.5px] mb-1.5">
                Senha
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-page-bg border-[1.5px] border-[#E0E0E0] rounded-lg text-sm outline-none focus:border-brand-red"
              />
            </div>
            <button
              className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-[#0d2d56] transition-colors"
              onClick={() => setUser({ email: loginEmail, name: loginEmail.split('@')[0] })}
            >
              Entrar
            </button>
          </div>
          <p className="text-center text-xs text-[#6b7280] mt-4">
            Protótipo — use qualquer credencial
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-page-bg">
      {/* Topbar */}
      <header
        className="flex items-center justify-between flex-shrink-0"
        style={{ background: '#092040', height: 60, padding: '0 28px' }}
      >
        <div className="text-[18px] font-extrabold tracking-wide text-white">
          Agile<span className="text-salmon">Manager</span>
        </div>
        <nav className="flex gap-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: page === item.id ? '#BF452A' : 'transparent',
                color: page === item.id ? '#fff' : 'rgba(255,255,255,.65)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-content font-bold text-[13px]"
            style={{ background: '#D99789', color: '#092040' }}
          >
            {user.name[0].toUpperCase()}
          </div>
          <span className="text-[13px] text-white/70">{user.name}</span>
          <button
            onClick={() => setUser(null)}
            className="text-xs text-white/70 hover:text-white transition-colors px-3 py-1 rounded border border-white/20 hover:border-white/50"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto" style={{ padding: '28px 32px' }}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'agilistas' && <Agilistas />}
        {page === 'squads' && <Squads />}
        {page === 'upload' && <Upload />}
        {page === 'roles' && <Roles />}
      </main>
    </div>
  )
}

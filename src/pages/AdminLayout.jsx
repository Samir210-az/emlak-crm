import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, Users, Handshake, LogOut, Home } from 'lucide-react'
import { watchAuth, logout } from '../lib/db.js'

const navItems = [
  { to: '/admin/properties', label: 'Obyektlər', icon: Building2 },
  { to: '/admin/clients', label: 'Müştərilər', icon: Users },
  { to: '/admin/deals', label: 'Sövdələşmələr', icon: Handshake },
]

export default function AdminLayout() {
  const [user, setUser] = useState(undefined) // undefined = yüklənir, null = girmə yoxdur
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = watchAuth((u) => setUser(u))
    return unsub
  }, [])

  useEffect(() => {
    if (user === null) navigate('/login')
  }, [user, navigate])

  if (user === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Yüklənir...</div>
  }
  if (!user) return null

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <Home size={20} className="text-brand-600" />
          <span className="font-semibold text-slate-800">Əmlak CRM</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => logout()}
          className="mx-3 mb-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
        >
          <LogOut size={17} /> Çıxış
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ uid: user.uid }} />
      </main>
    </div>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { Home, Building2, LogIn, UserPlus } from 'lucide-react'

export default function PublicBottomNav({ tenantId }) {
  const location = useLocation()

  const items = [
    { to: '/', label: 'Ana səhifə', icon: Home, match: (p) => p === '/' },
  ]

  if (tenantId) {
    items.push({
      to: `/elanlar/${tenantId}`,
      label: 'Elanlar',
      icon: Building2,
      match: (p) => p.startsWith('/elanlar'),
    })
  }

  items.push(
    { to: '/qeydiyyat', label: 'Qeydiyyat', icon: UserPlus, match: (p) => p === '/qeydiyyat' },
    { to: '/giris', label: 'Daxil ol', icon: LogIn, match: (p) => p === '/giris' },
  )

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-slate-950/95 backdrop-blur">
      {items.map((item) => {
        const active = item.match(location.pathname)
        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition ${
              active ? 'text-amber-400' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <item.icon size={19} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

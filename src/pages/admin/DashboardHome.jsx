import { useEffect, useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Building2, Users, Handshake, TrendingUp, Plus, MapPin, ArrowRight, Wallet, Send } from 'lucide-react'
import { watchProperties, watchClients, watchDeals } from '../../lib/db.js'

export default function DashboardHome() {
  const { uid: tenantId } = useOutletContext()
  const [properties, setProperties] = useState([])
  const [clients, setClients] = useState([])
  const [deals, setDeals] = useState([])

  useEffect(() => watchProperties(tenantId, setProperties), [tenantId])
  useEffect(() => watchClients(tenantId, setClients), [tenantId])
  useEffect(() => watchDeals(tenantId, setDeals), [tenantId])

  const activeProps = properties.filter((p) => p.status !== 'passiv')
  const openDeals = deals.filter((d) => d.stage !== 'bitib')
  const closedThisMonth = deals.filter((d) => {
    if (d.stage !== 'bitib') return false
    const dt = new Date(d.createdAt)
    const now = new Date()
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()
  })
  const monthRevenue = closedThisMonth.reduce((sum, d) => sum + (Number(d.commission) || 0), 0)

  const kpis = [
    { label: 'Aktiv elanlar', value: activeProps.length, icon: Building2 },
    { label: 'Müştərilər', value: clients.length, icon: Users },
    { label: 'Açıq sövdələşmələr', value: openDeals.length, icon: Handshake },
    { label: 'Bu ay komissiya', value: `${monthRevenue.toLocaleString('az-AZ')} AZN`, icon: Wallet },
  ]

  const recentProps = [...properties].slice(0, 4)

  return (
    <div className="min-h-full overflow-x-hidden bg-slate-950 p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Xoş gəldin 👋</h1>
        <p className="text-sm text-white/40">Agentliyinin bugünkü icmalı</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <k.icon size={19} />
            </div>
            <p className="text-2xl font-bold text-amber-400">{k.value}</p>
            <p className="mt-0.5 text-xs text-white/40">{k.label}</p>
          </div>
        ))}
      </div>

      {/* AI Köməkçi status kartı çıxarıldı — artıq lazımsız, AI mövcud və işlək */}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-white">Son əlavə olunan obyektlər</h2>
            <Link to="../properties" className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300">
              Hamısı <ArrowRight size={12} />
            </Link>
          </div>
          {recentProps.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Hələ obyekt yoxdur"
              text="İlk elanını əlavə et ki, müştərilərin AI köməkçi ilə tapa bilsin."
              cta="Obyekt əlavə et"
              to="../properties"
            />
          ) : (
            <div className="space-y-3">
              {recentProps.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-white/20">
                      <Building2 size={18} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{p.title}</p>
                    <p className="flex items-center gap-1 text-xs text-white/40">
                      <MapPin size={11} /> {p.district || '—'}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-amber-400">{p.price} AZN</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-400/10 to-transparent p-6 backdrop-blur">
          <TrendingUp size={20} className="mb-3 text-amber-400" />
          <h2 className="font-semibold text-white">Sürətli hərəkətlər</h2>
          <p className="mt-1 text-xs text-white/40">Ən çox istifadə olunan addımlar</p>
          <div className="mt-4 space-y-2">
            <Link to="../properties" className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
              Yeni obyekt əlavə et <Plus size={15} />
            </Link>
            <Link to="../clients" className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
              Yeni müştəri qeyd et <Plus size={15} />
            </Link>
            <Link to="../deals" className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
              Sövdələşmə başlat <Plus size={15} />
            </Link>
            <Link to="../properties" className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300 transition hover:bg-amber-400/20">
              Saytlara elan mətni hazırla <Send size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text, cta, to }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/20">
        <Icon size={22} />
      </div>
      <p className="text-sm font-medium text-white/80">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-white/40">{text}</p>
      <Link to={to} className="mt-4 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-amber-300">
        {cta}
      </Link>
    </div>
  )
}

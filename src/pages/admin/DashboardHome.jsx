import { useEffect, useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { Building2, Users, Handshake, TrendingUp, Plus, MapPin, ArrowRight, Wallet } from 'lucide-react'
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
    { label: 'Aktiv elanlar', value: activeProps.length, icon: Building2, color: 'text-brand-600 bg-brand-50' },
    { label: 'Müştərilər', value: clients.length, icon: Users, color: 'text-purple-600 bg-purple-50' },
    { label: 'Açıq sövdələşmələr', value: openDeals.length, icon: Handshake, color: 'text-amber-600 bg-amber-50' },
    { label: 'Bu ay komissiya', value: `${monthRevenue.toLocaleString('az-AZ')} AZN`, icon: Wallet, color: 'text-emerald-600 bg-emerald-50' },
  ]

  const recentProps = [...properties].slice(0, 4)

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Xoş gəldin 👋</h1>
        <p className="text-sm text-slate-500">Agentliyinin bugünkü icmalı</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${k.color}`}>
              <k.icon size={19} />
            </div>
            <p className="text-2xl font-bold text-slate-800">{k.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Son əlavə olunan obyektlər</h2>
            <Link to="../properties" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800">
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
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                      <Building2 size={18} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{p.title}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={11} /> {p.district || '—'}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-brand-600">{p.price} AZN</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
          <TrendingUp size={20} className="mb-3 text-amber-400" />
          <h2 className="font-semibold">Sürətli hərəkətlər</h2>
          <p className="mt-1 text-xs text-white/50">Ən çox istifadə olunan addımlar</p>
          <div className="mt-4 space-y-2">
            <Link to="../properties" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm transition hover:bg-white/15">
              Yeni obyekt əlavə et <Plus size={15} />
            </Link>
            <Link to="../clients" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm transition hover:bg-white/15">
              Yeni müştəri qeyd et <Plus size={15} />
            </Link>
            <Link to="../deals" className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm transition hover:bg-white/15">
              Sövdələşmə başlat <Plus size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, text, cta, to }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
        <Icon size={22} />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-slate-400">{text}</p>
      <Link to={to} className="mt-4 rounded-full bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700">
        {cta}
      </Link>
    </div>
  )
}

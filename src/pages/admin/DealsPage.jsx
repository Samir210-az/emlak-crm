import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, User, Home, Coins, Handshake } from 'lucide-react'
import { watchDeals, addDeal, updateDealStage, deleteDeal, DEAL_STAGES } from '../../lib/db.js'

const stageMeta = {
  beh: { label: 'Beh müqaviləsi', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  bank_tesdiqi: { label: 'Bank təsdiqi', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  notariat: { label: 'Notariat', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  tehvil_teslim: { label: 'Təhvil-təslim', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  bitib: { label: 'Bağlanıb', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

const emptyForm = { propertyTitle: '', clientName: '', amount: '', commission: '' }

export default function DealsPage() {
  const { uid: tenantId } = useOutletContext()
  const [deals, setDeals] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [dragId, setDragId] = useState(null)

  useEffect(() => watchDeals(tenantId, setDeals), [tenantId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.propertyTitle || !form.clientName) return
    await addDeal(tenantId, form)
    setForm(emptyForm)
    setShowForm(false)
  }

  function onDrop(stage) {
    if (dragId) updateDealStage(tenantId, dragId, stage)
    setDragId(null)
  }

  const totalPipeline = deals.filter((d) => d.stage !== 'bitib').reduce((s, d) => s + (Number(d.amount) || 0), 0)

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Sövdələşmə boru xətti</h1>
          <p className="text-sm text-slate-500">
            {deals.length} sövdələşmə · aktiv boru xəttində {totalPipeline.toLocaleString('az-AZ')} AZN
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          <Plus size={16} /> Yeni sövdələşmə
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <input placeholder="Obyekt" value={form.propertyTitle} onChange={(e) => setForm({ ...form, propertyTitle: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input placeholder="Müştəri adı" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input placeholder="Məbləğ (AZN)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Komissiya (AZN)" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white sm:col-span-2">
            Əlavə et
          </button>
        </form>
      )}

      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <Handshake size={28} className="mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">Hələ sövdələşmə yoxdur</p>
          <p className="mt-1 text-xs text-slate-400">İlk sövdələşməni əlavə et, sonra kartı sürükləyərək mərhələni dəyiş.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => {
            const items = deals.filter((d) => d.stage === stage)
            const meta = stageMeta[stage]
            return (
              <div
                key={stage}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(stage)}
                className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className={`mb-3 flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold ${meta.color}`}>
                  {meta.label}
                  <span className="rounded-full bg-white/70 px-2 py-0.5">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((d) => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={() => setDragId(d.id)}
                      className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                          <Home size={12} className="text-slate-400" /> {d.propertyTitle}
                        </p>
                        <button onClick={() => deleteDeal(tenantId, d.id)} className="text-slate-300 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <User size={11} /> {d.clientName}
                      </p>
                      {(d.amount || d.commission) && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-600">
                          <Coins size={11} />
                          {d.amount ? `${d.amount} AZN` : ''} {d.commission ? `· komissiya ${d.commission} AZN` : ''}
                        </p>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && <p className="py-6 text-center text-[11px] text-slate-300">Boşdur</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

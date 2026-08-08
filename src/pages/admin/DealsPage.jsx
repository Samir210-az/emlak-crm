import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, User, Home, Coins, Handshake } from 'lucide-react'
import { watchDeals, addDeal, updateDealStage, deleteDeal, DEAL_STAGES, RENT_STAGES } from '../../lib/db.js'

const saleStageMeta = {
  beh: { label: 'Beh müqaviləsi', color: 'bg-sky-400/10 text-sky-300 border-sky-400/20' },
  bank_tesdiqi: { label: 'Bank təsdiqi', color: 'bg-amber-400/10 text-amber-300 border-amber-400/20' },
  notariat: { label: 'Notariat', color: 'bg-purple-400/10 text-purple-300 border-purple-400/20' },
  tehvil_teslim: { label: 'Təhvil-təslim', color: 'bg-indigo-400/10 text-indigo-300 border-indigo-400/20' },
  bitib: { label: 'Bağlanıb', color: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' },
}
const rentStageMeta = {
  muqavile: { label: 'Müqavilə hazırlanır', color: 'bg-sky-400/10 text-sky-300 border-sky-400/20' },
  depozit: { label: 'Depozit ödənilib', color: 'bg-amber-400/10 text-amber-300 border-amber-400/20' },
  acar_teslim: { label: 'Açar təhvil verilib', color: 'bg-indigo-400/10 text-indigo-300 border-indigo-400/20' },
  bitib: { label: 'Bağlanıb', color: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' },
}

const emptyForm = { propertyTitle: '', clientName: '', amount: '', commission: '', dealType: 'satış' }
const inputCls = 'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-400/50'

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

  const saleDeals = deals.filter((d) => d.dealType !== 'kirayə')
  const rentDeals = deals.filter((d) => d.dealType === 'kirayə')
  const totalPipeline = deals.filter((d) => d.stage !== 'bitib').reduce((s, d) => s + (Number(d.amount) || 0), 0)

  return (
    <div className="min-h-full bg-slate-950 p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Sövdələşmələr</h1>
          <p className="text-sm text-white/40">
            {deals.length} sövdələşmə · davam edənlərdə {totalPipeline.toLocaleString('az-AZ')} AZN
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300"
        >
          <Plus size={16} /> Yeni sövdələşmə
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
          <div className="flex gap-2 sm:col-span-2">
            {['satış', 'kirayə'].map((dt) => (
              <button
                key={dt}
                type="button"
                onClick={() => setForm({ ...form, dealType: dt })}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  form.dealType === dt ? 'bg-amber-400 text-slate-900' : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {dt === 'satış' ? 'Satış' : 'Kirayə'}
              </button>
            ))}
          </div>
          <input placeholder="Obyekt" value={form.propertyTitle} onChange={(e) => setForm({ ...form, propertyTitle: e.target.value })}
            className={inputCls} required />
          <input placeholder="Müştəri adı" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            className={inputCls} required />
          <input placeholder={form.dealType === 'kirayə' ? 'Aylıq məbləğ (AZN)' : 'Məbləğ (AZN)'} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className={inputCls} />
          <input placeholder="Komissiya (AZN)" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })}
            className={inputCls} />
          <button type="submit" className="rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300 sm:col-span-2">
            Əlavə et
          </button>
        </form>
      )}

      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <Handshake size={28} className="mb-3 text-white/20" />
          <p className="text-sm font-medium text-white/70">Hələ sövdələşmə yoxdur</p>
          <p className="mt-1 text-xs text-white/40">İlk sövdələşməni əlavə et, sonra kartı sürükləyərək mərhələni dəyiş.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {saleDeals.length > 0 && (
            <Board title="Satış sövdələşmələri" stages={DEAL_STAGES} meta={saleStageMeta} deals={saleDeals}
              tenantId={tenantId} dragId={dragId} setDragId={setDragId} onDrop={onDrop} />
          )}
          {rentDeals.length > 0 && (
            <Board title="Kirayə sövdələşmələri" stages={RENT_STAGES} meta={rentStageMeta} deals={rentDeals}
              tenantId={tenantId} dragId={dragId} setDragId={setDragId} onDrop={onDrop} />
          )}
        </div>
      )}
    </div>
  )
}

function Board({ title, stages, meta, deals, tenantId, setDragId, onDrop }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/40">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const items = deals.filter((d) => d.stage === stage)
          const m = meta[stage]
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(stage)}
              className="w-64 shrink-0 rounded-2xl border border-white/10 bg-white/[0.02] p-3"
            >
              <div className={`mb-3 flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold ${m.color}`}>
                {m.label}
                <span className="rounded-full bg-white/10 px-2 py-0.5">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((d) => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={() => setDragId(d.id)}
                    className="cursor-grab rounded-xl border border-white/10 bg-white/[0.04] p-3 active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                        <Home size={12} className="text-white/30" /> {d.propertyTitle}
                      </p>
                      <button onClick={() => deleteDeal(tenantId, d.id)} className="text-white/20 hover:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-white/50">
                      <User size={11} /> {d.clientName}
                    </p>
                    {(d.amount || d.commission) && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-amber-400">
                        <Coins size={11} />
                        {d.amount ? `${d.amount} AZN` : ''} {d.commission ? `· komissiya ${d.commission} AZN` : ''}
                      </p>
                    )}
                  </div>
                ))}
                {items.length === 0 && <p className="py-6 text-center text-[11px] text-white/20">Boşdur</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

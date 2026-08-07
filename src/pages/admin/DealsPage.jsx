import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { watchDeals, addDeal, updateDealStage, deleteDeal, DEAL_STAGES } from '../../lib/db.js'

const stageLabels = {
  beh: 'Beh müqaviləsi',
  bank_tesdiqi: 'Bank təsdiqi',
  notariat: 'Notariat',
  tehvil_teslim: 'Təhvil-təslim',
  bitib: 'Bitib',
}

const emptyForm = { propertyTitle: '', clientName: '', amount: '', commission: '' }

export default function DealsPage() {
  const { uid } = useOutletContext()
  const [deals, setDeals] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => watchDeals(uid, setDeals), [uid])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.propertyTitle || !form.clientName) return
    await addDeal(uid, form)
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Sövdələşmələr</h1>
          <p className="text-sm text-slate-500">{deals.length} aktiv sövdələşmə</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
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

      <div className="space-y-3">
        {deals.map((d) => (
          <div key={d.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{d.propertyTitle}</p>
                <p className="text-xs text-slate-500">{d.clientName} · {d.amount ? `${d.amount} AZN` : ''} {d.commission ? `(komissiya ${d.commission} AZN)` : ''}</p>
              </div>
              <button onClick={() => deleteDeal(uid, d.id)} className="text-slate-300 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
            <div className="mt-3 flex gap-1.5">
              {DEAL_STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => updateDealStage(uid, d.id, stage)}
                  className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition ${
                    d.stage === stage ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {stageLabels[stage]}
                </button>
              ))}
            </div>
          </div>
        ))}
        {deals.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Hələ sövdələşmə yoxdur.</p>}
      </div>
    </div>
  )
}

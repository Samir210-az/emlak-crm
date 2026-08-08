import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, Phone, Users } from 'lucide-react'
import { watchClients, addClient, deleteClient } from '../../lib/db.js'

const emptyForm = { name: '', phone: '', budget: '', district: '', rooms: '' }
const inputCls = 'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-400/50'

export default function ClientsPage() {
  const { uid: tenantId } = useOutletContext()
  const [clients, setClients] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => watchClients(tenantId, setClients), [tenantId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.name || !form.phone) return
    await addClient(tenantId, form)
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <div className="min-h-full bg-slate-950 p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Müştərilər</h1>
          <p className="text-sm text-white/40">{clients.length} müştəri</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300">
          <Plus size={16} /> Yeni müştəri
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
          <input placeholder="Ad Soyad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls} required />
          <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls} required />
          <input placeholder="Büdcə (AZN)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className={inputCls} />
          <input placeholder="İstədiyi rayon" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
            className={inputCls} />
          <button type="submit" className="rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300 sm:col-span-2">
            Əlavə et
          </button>
        </form>
      )}

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
          <Users size={28} className="mb-3 text-white/20" />
          <p className="text-sm font-medium text-white/70">Hələ müştəri əlavə olunmayıb</p>
          <p className="mt-1 text-xs text-white/40">"Yeni müştəri" düyməsinə bas və ilkini əlavə et.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          {clients.map((c) => (
            <div key={c.id} className="flex items-center justify-between border-b border-white/5 px-5 py-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{c.name}</p>
                <p className="flex items-center gap-1 text-xs text-white/40"><Phone size={11} /> {c.phone}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/40">{c.district} · {c.budget ? `${c.budget} AZN` : '—'}</span>
                <button onClick={() => deleteClient(tenantId, c.id)} className="text-white/20 hover:text-red-400">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

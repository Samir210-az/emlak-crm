import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, Phone } from 'lucide-react'
import { watchClients, addClient, deleteClient } from '../../lib/db.js'

const emptyForm = { name: '', phone: '', budget: '', district: '', rooms: '' }

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
    <div className="min-h-full bg-slate-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Müştərilər</h1>
          <p className="text-sm text-slate-500">{clients.length} müştəri</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
          <Plus size={16} /> Yeni müştəri
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <input placeholder="Ad Soyad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input placeholder="Büdcə (AZN)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="İstədiyi rayon" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button type="submit" className="rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white sm:col-span-2">
            Əlavə et
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {clients.map((c) => (
          <div key={c.id} className="flex items-center justify-between border-b border-slate-100 px-5 py-3 last:border-0">
            <div>
              <p className="text-sm font-medium text-slate-800">{c.name}</p>
              <p className="flex items-center gap-1 text-xs text-slate-500"><Phone size={11} /> {c.phone}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">{c.district} · {c.budget ? `${c.budget} AZN` : '—'}</span>
              <button onClick={() => deleteClient(tenantId, c.id)} className="text-slate-300 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
        {clients.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Hələ müştəri əlavə olunmayıb.</p>}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, MapPin } from 'lucide-react'
import { watchProperties, addProperty, deleteProperty } from '../../lib/db.js'

const emptyForm = { title: '', district: '', rooms: '', price: '', image: '', status: 'aktiv' }

export default function PropertiesPage() {
  const { uid: tenantId } = useOutletContext()
  const [properties, setProperties] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => watchProperties(tenantId, setProperties), [tenantId])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title || !form.price) return
    await addProperty(tenantId, form)
    setForm(emptyForm)
    setShowForm(false)
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Obyektlər</h1>
          <p className="text-sm text-slate-500">{properties.length} obyekt</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          <Plus size={16} /> Yeni obyekt
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <input placeholder="Başlıq (məs. 3 otaqlı, Nərimanov)" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input placeholder="Rayon" value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Otaq sayı" type="number" value={form.rooms}
            onChange={(e) => setForm({ ...form, rooms: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Qiymət (AZN)" type="number" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input placeholder="Şəkil URL (postimg.cc)" value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          <button type="submit" className="rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white sm:col-span-2">
            Əlavə et
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {p.image ? (
              <img src={p.image} alt={p.title} className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-36 items-center justify-center bg-slate-100 text-slate-300">Şəkil yoxdur</div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} /> {p.district || '—'}
                  </p>
                </div>
                <button onClick={() => deleteProperty(tenantId, p.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold text-brand-600">{p.price} AZN</p>
            </div>
          </div>
        ))}
        {properties.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-400">Hələ obyekt əlavə olunmayıb.</p>
        )}
      </div>
    </div>
  )
}

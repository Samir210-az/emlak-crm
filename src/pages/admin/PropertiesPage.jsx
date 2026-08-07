import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, MapPin, Star, Copy, ExternalLink } from 'lucide-react'
import { watchProperties, addProperty, deleteProperty, updateProperty } from '../../lib/db.js'

const emptyForm = {
  title: '', district: '', address: '', rooms: '', floor: '', floorTotal: '',
  area: '', documentType: 'çıxarış', price: '', images: '', description: '',
  status: 'aktiv', featured: false,
}

export default function PropertiesPage() {
  const { uid: tenantId } = useOutletContext()
  const [properties, setProperties] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => watchProperties(tenantId, setProperties), [tenantId])

  const publicUrl = `${window.location.origin}/elanlar/${tenantId}`

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.title || !form.price) return
    const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean)
    await addProperty(tenantId, { ...form, images })
    setForm(emptyForm)
    setShowForm(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8">
      <div className="mb-4 flex items-center justify-between">
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

      {/* Public listings link */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
        <p className="text-sm text-brand-800">
          <strong>Günün mənzilləri</strong> — ictimai elan səhifən:
        </p>
        <code className="rounded bg-white px-2 py-1 text-xs text-brand-700">{publicUrl}</code>
        <button onClick={copyLink} className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800">
          <Copy size={13} /> {copied ? 'Kopyalandı!' : 'Kopyala'}
        </button>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800">
          <ExternalLink size={13} /> Aç
        </a>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          <input placeholder="Başlıq (məs. Yeni Yasamal, 3 otaqlı)" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" required />
          <input placeholder="Rayon" value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Ünvan (küçə, metro)" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Otaq sayı" type="number" value={form.rooms}
            onChange={(e) => setForm({ ...form, rooms: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Saha (m²)" type="number" value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Mərtəbə" type="number" value={form.floor}
            onChange={(e) => setForm({ ...form, floor: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input placeholder="Ümumi mərtəbə sayı" type="number" value={form.floorTotal}
            onChange={(e) => setForm({ ...form, floorTotal: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="çıxarış">Çıxarış</option>
            <option value="qanuni">Qanuni (2 otaq və s.)</option>
            <option value="etibarnamə">Etibarnamə</option>
          </select>
          <input placeholder="Qiymət (AZN)" type="number" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <textarea placeholder="Şəkil URL-ləri (hər sətirdə bir link, postimg.cc)" value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          <textarea placeholder="Təsvir" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
            <input type="checkbox" checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <Star size={14} className="text-amber-400" /> "Günün mənzili" kimi önə çıxar
          </label>
          <button type="submit" className="rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white sm:col-span-2">
            Əlavə et
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {p.images?.[0] ? (
              <img src={p.images[0]} alt={p.title} className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-36 items-center justify-center bg-slate-100 text-slate-300">Şəkil yoxdur</div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    {p.featured && <Star size={13} className="text-amber-400 fill-amber-400" />}
                    {p.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} /> {p.district || '—'}
                  </p>
                </div>
                <button onClick={() => deleteProperty(tenantId, p.id)} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold text-brand-600">{p.price} AZN</p>
              <button
                onClick={() => updateProperty(tenantId, p.id, { featured: !p.featured })}
                className="mt-2 text-xs text-slate-400 hover:text-brand-600"
              >
                {p.featured ? 'Önə çıxarmadan sil' : "Günün mənzili et"}
              </button>
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

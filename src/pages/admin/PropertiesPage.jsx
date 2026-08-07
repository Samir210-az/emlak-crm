import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, MapPin, Star, Copy, ExternalLink, Landmark, Home as HomeIcon, Send, Building2 } from 'lucide-react'
import { watchProperties, addProperty, deleteProperty, updateProperty } from '../../lib/db.js'
import { generateListingText, LISTING_PLATFORMS } from '../../lib/listingText.js'

const emptyForm = {
  title: '', district: '', address: '', rooms: '', floor: '', floorTotal: '',
  area: '', documentType: 'çıxarış', dealType: 'satış', mortgage: false,
  price: '', images: '', description: '', status: 'aktiv', featured: false,
}

export default function PropertiesPage() {
  const { uid: tenantId } = useOutletContext()
  const [properties, setProperties] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [binaModal, setBinaModal] = useState(null)

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

  function openBinaModal(p) {
    setBinaModal({ property: p, platform: 'bina', text: generateListingText(p, 'bina'), copied: false })
  }

  function switchPlatform(platformId) {
    setBinaModal((m) => ({ ...m, platform: platformId, text: generateListingText(m.property, platformId), copied: false }))
  }

  function copyBinaText() {
    navigator.clipboard.writeText(binaModal.text)
    setBinaModal((m) => ({ ...m, copied: true }))
    setTimeout(() => setBinaModal((m) => (m ? { ...m, copied: false } : m)), 2000)
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

          <div className="flex gap-2 sm:col-span-2">
            {['satış', 'kirayə'].map((dt) => (
              <button
                key={dt}
                type="button"
                onClick={() => setForm({ ...form, dealType: dt })}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  form.dealType === dt ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dt === 'satış' ? 'Satış' : 'Kirayə'}
              </button>
            ))}
          </div>

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
          <input placeholder={form.dealType === 'kirayə' ? 'Aylıq qiymət (AZN)' : 'Qiymət (AZN)'} type="number" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm" required />

          {form.dealType === 'satış' && (
            <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
              <input type="checkbox" checked={form.mortgage}
                onChange={(e) => setForm({ ...form, mortgage: e.target.checked })} />
              <Landmark size={14} className="text-brand-500" /> İpoteka mümkündür
            </label>
          )}

          <textarea placeholder="Şəkil URL-ləri (hər sətirdə bir link)" value={form.images}
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
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  p.dealType === 'kirayə' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {p.dealType === 'kirayə' ? 'Kirayə' : 'Satış'}
                </span>
                {p.mortgage && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                    <Landmark size={10} /> İpoteka
                  </span>
                )}
              </div>
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
              <p className="mt-2 text-sm font-semibold text-brand-600">
                {p.price} AZN{p.dealType === 'kirayə' ? ' / ay' : ''}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => updateProperty(tenantId, p.id, { featured: !p.featured })}
                  className="text-xs text-slate-400 hover:text-brand-600"
                >
                  {p.featured ? 'Önə çıxarmadan sil' : 'Günün mənzili et'}
                </button>
                <button
                  onClick={() => openBinaModal(p)}
                  className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
                >
                  <Send size={11} /> Elan mətni
                </button>
              </div>
            </div>
          </div>
        ))}
        {properties.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
            <Building2 size={28} className="mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Hələ obyekt əlavə olunmayıb</p>
            <p className="mt-1 text-xs text-slate-400">"Yeni obyekt" düyməsinə bas və ilk elanını əlavə et.</p>
          </div>
        )}
      </div>

      {binaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setBinaModal(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-2">
              <HomeIcon size={18} className="text-amber-500" />
              <h2 className="font-semibold text-slate-800">Elan mətni — platforma seç</h2>
            </div>
            <div className="mb-3 flex gap-2">
              {LISTING_PLATFORMS.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => switchPlatform(pl.id)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                    binaModal.platform === pl.id ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pl.name}
                </button>
              ))}
            </div>
            <p className="mb-3 text-xs text-slate-500">
              Bu saytların açıq API-si yoxdur, elan yalnız əl ilə daxil edilir. Mətni kopyalayıb
              seçdiyin platformanın "Yeni elan" səhifəsində yapışdıra bilərsən.
            </p>
            <textarea
              readOnly
              value={binaModal.text}
              rows={12}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={copyBinaText}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                <Copy size={14} /> {binaModal.copied ? 'Kopyalandı!' : 'Mətni kopyala'}
              </button>
              <a
                href={LISTING_PLATFORMS.find((pl) => pl.id === binaModal.platform).url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <ExternalLink size={14} /> Saytı aç
              </a>
            </div>
            <button onClick={() => setBinaModal(null)} className="mt-3 w-full text-center text-xs text-slate-400 hover:text-slate-600">
              Bağla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

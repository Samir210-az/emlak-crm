import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Plus, Trash2, MapPin, Star, Copy, ExternalLink, Landmark, Home as HomeIcon, Send, Building2, Search } from 'lucide-react'
import { watchProperties, addProperty, deleteProperty, updateProperty } from '../../lib/db.js'
import { generateListingText, LISTING_PLATFORMS } from '../../lib/listingText.js'
import { sampleProperties } from '../../lib/seedData.js'

const emptyForm = {
  title: '', district: '', address: '', rooms: '', floor: '', floorTotal: '',
  area: '', documentType: 'çıxarış', dealType: 'satış', mortgage: false,
  price: '', ownerPhone: '', images: '', description: '', status: 'aktiv', featured: false,
}

const inputCls = 'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-400/50'

export default function PropertiesPage() {
  const { uid: tenantId } = useOutletContext()
  const [properties, setProperties] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [binaModal, setBinaModal] = useState(null)
  const [query, setQuery] = useState('')
  const [seeding, setSeeding] = useState(false)

  useEffect(() => watchProperties(tenantId, setProperties), [tenantId])

  const filtered = properties.filter((p) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (p.title || '').toLowerCase().includes(q) || (p.district || '').toLowerCase().includes(q) || (p.address || '').toLowerCase().includes(q)
  })

  const publicUrl = `${window.location.origin}/elanlar/${tenantId}`

  async function loadSampleData() {
    setSeeding(true)
    try {
      for (const p of sampleProperties) {
        await addProperty(tenantId, p)
      }
    } finally {
      setSeeding(false)
    }
  }

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
    <div className="min-h-full bg-slate-950 p-6 sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Obyektlər</h1>
          <p className="text-sm text-white/40">{properties.length} obyekt</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
        >
          <Plus size={16} /> Yeni obyekt
        </button>
      </div>

      {properties.length === 0 && (
        <button
          onClick={loadSampleData}
          disabled={seeding}
          className="mb-4 w-full rounded-xl border border-dashed border-amber-400/30 bg-amber-400/5 py-3 text-sm font-medium text-amber-400 transition hover:bg-amber-400/10 disabled:opacity-60"
        >
          {seeding ? 'Yüklənir...' : '✨ Nümunə elanlar yüklə (5 real görünüşlü elan)'}
        </button>
      )}

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5">
        <Search size={16} className="text-white/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Başlıq, rayon və ya ünvana görə axtar..."
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
        <p className="text-sm text-amber-100">
          <strong className="text-amber-400">Günün mənzilləri</strong> — ictimai elan səhifən:
        </p>
        <code className="rounded bg-white/10 px-2 py-1 text-xs text-white/70">{publicUrl}</code>
        <button onClick={copyLink} className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300">
          <Copy size={13} /> {copied ? 'Kopyalandı!' : 'Kopyala'}
        </button>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300">
          <ExternalLink size={13} /> Aç
        </a>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-2">
          <input placeholder="Başlıq (məs. Yeni Yasamal, 3 otaqlı)" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={`${inputCls} sm:col-span-2`} required />

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

          <input placeholder="Rayon" value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })} className={inputCls} />
          <input placeholder="Ünvan (küçə, metro)" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
          <input placeholder="Otaq sayı" type="number" value={form.rooms}
            onChange={(e) => setForm({ ...form, rooms: e.target.value })} className={inputCls} />
          <input placeholder="Saha (m²)" type="number" value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })} className={inputCls} />
          <input placeholder="Mərtəbə" type="number" value={form.floor}
            onChange={(e) => setForm({ ...form, floor: e.target.value })} className={inputCls} />
          <input placeholder="Ümumi mərtəbə sayı" type="number" value={form.floorTotal}
            onChange={(e) => setForm({ ...form, floorTotal: e.target.value })} className={inputCls} />
          <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}
            className={inputCls}>
            <option className="bg-slate-900" value="çıxarış">Çıxarış</option>
            <option className="bg-slate-900" value="qanuni">Qanuni (2 otaq və s.)</option>
            <option className="bg-slate-900" value="etibarnamə">Etibarnamə</option>
          </select>
          <input placeholder={form.dealType === 'kirayə' ? 'Aylıq qiymət (AZN)' : 'Qiymət (AZN)'} type="number" value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} required />
          <input placeholder="Mülk sahibinin telefonu" type="tel" value={form.ownerPhone}
            onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} className={`${inputCls} sm:col-span-2`} />

          {form.dealType === 'satış' && (
            <label className="flex items-center gap-2 text-sm text-white/60 sm:col-span-2">
              <input type="checkbox" checked={form.mortgage}
                onChange={(e) => setForm({ ...form, mortgage: e.target.checked })} />
              <Landmark size={14} className="text-amber-400" /> İpoteka mümkündür
            </label>
          )}

          <textarea placeholder="Şəkil URL-ləri (hər sətirdə bir link)" value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3}
            className={`${inputCls} sm:col-span-2`} />
          <textarea placeholder="Təsvir" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
            className={`${inputCls} sm:col-span-2`} />
          <label className="flex items-center gap-2 text-sm text-white/60 sm:col-span-2">
            <input type="checkbox" checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <Star size={14} className="text-amber-400" /> "Günün mənzili" kimi önə çıxar
          </label>
          <button type="submit" className="rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300 sm:col-span-2">
            Əlavə et
          </button>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            {p.images?.[0] ? (
              <img src={p.images[0]} alt={p.title} className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-36 items-center justify-center bg-white/5 text-white/20">Şəkil yoxdur</div>
            )}
            <div className="p-4">
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  p.dealType === 'kirayə' ? 'bg-purple-400/15 text-purple-300' : 'bg-emerald-400/15 text-emerald-300'
                }`}>
                  {p.dealType === 'kirayə' ? 'Kirayə' : 'Satış'}
                </span>
                {p.mortgage && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-400/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                    <Landmark size={10} /> İpoteka
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    {p.featured && <Star size={13} className="text-amber-400 fill-amber-400" />}
                    {p.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                    <MapPin size={12} /> {p.district || '—'}
                  </p>
                </div>
                <button onClick={() => deleteProperty(tenantId, p.id)} className="text-white/20 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-2 text-sm font-semibold text-amber-400">
                {p.price} AZN{p.dealType === 'kirayə' ? ' / ay' : ''}
              </p>
              <button
                onClick={() => openBinaModal(p)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-400/20"
              >
                <Send size={12} /> Saytlara elan mətni hazırla (Bina.az / Tap.az / Arenda.az)
              </button>
              <button
                onClick={() => updateProperty(tenantId, p.id, { featured: !p.featured })}
                className="mt-2 text-xs text-white/40 hover:text-amber-400"
              >
                {p.featured ? 'Önə çıxarmadan sil' : 'Günün mənzili et'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <Building2 size={28} className="mb-3 text-white/20" />
            <p className="text-sm font-medium text-white/70">{properties.length === 0 ? 'Hələ obyekt əlavə olunmayıb' : 'Axtarışa uyğun obyekt tapılmadı'}</p>
            <p className="mt-1 text-xs text-white/40">{properties.length === 0 ? '"Yeni obyekt" düyməsinə bas və ilk elanını əlavə et.' : 'Başqa açar söz sınayın.'}</p>
          </div>
        )}
      </div>

      {binaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setBinaModal(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-2">
              <HomeIcon size={18} className="text-amber-400" />
              <h2 className="font-semibold text-white">Elan mətni — platforma seç</h2>
            </div>
            <div className="mb-3 flex gap-2">
              {LISTING_PLATFORMS.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => switchPlatform(pl.id)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
                    binaModal.platform === pl.id ? 'bg-amber-400 text-slate-900' : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {pl.name}
                </button>
              ))}
            </div>
            <p className="mb-3 text-xs text-white/40">
              Bu saytların açıq API-si yoxdur, elan yalnız əl ilə daxil edilir. Mətni kopyalayıb
              seçdiyin platformanın "Yeni elan" səhifəsində yapışdıra bilərsən.
            </p>
            <textarea
              readOnly
              value={binaModal.text}
              rows={12}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/80"
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={copyBinaText}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300"
              >
                <Copy size={14} /> {binaModal.copied ? 'Kopyalandı!' : 'Mətni kopyala'}
              </button>
              <a
                href={LISTING_PLATFORMS.find((pl) => pl.id === binaModal.platform).url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5"
              >
                <ExternalLink size={14} /> Saytı aç
              </a>
            </div>
            <button onClick={() => setBinaModal(null)} className="mt-3 w-full text-center text-xs text-white/30 hover:text-white/60">
              Bağla
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

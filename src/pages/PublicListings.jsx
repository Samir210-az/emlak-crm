import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Home, MapPin, Star, FileText, Layers, Ruler, Landmark, Search, ArrowLeft } from 'lucide-react'
import { watchProperties } from '../lib/db.js'
import ChatWidget from '../components/ChatWidget.jsx'
import Footer from '../components/Footer.jsx'

export default function PublicListings() {
  const { tenantId } = useParams()
  const [properties, setProperties] = useState(null)
  const [filter, setFilter] = useState('hamısı')
  const [query, setQuery] = useState('')

  useEffect(() => watchProperties(tenantId, setProperties), [tenantId])

  const active = (properties || []).filter((p) => p.status !== 'passiv')
  const dealFiltered = filter === 'hamısı' ? active : active.filter((p) => p.dealType === filter)
  const visible = dealFiltered.filter((p) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (p.title || '').toLowerCase().includes(q) || (p.district || '').toLowerCase().includes(q)
  })
  const featured = visible.filter((p) => p.featured)
  const rest = visible.filter((p) => !p.featured)

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-white/10 bg-gradient-to-r from-brand-900 via-slate-950 to-brand-900 px-6 py-8 text-center">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white">
          <ArrowLeft size={13} /> Əmlak CRM ana səhifəsi
        </Link>
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 text-amber-400">
          <Home size={20} />
          <span className="text-xs font-semibold uppercase tracking-widest">Günün mənzilləri</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
          Ən yaxşı təkliflər · Ən yaxşı qiymətlər
        </h1>
        <p className="mt-2 text-sm text-white/50">Doğru seçim, doğru ünvan</p>

        <div className="mx-auto mt-6 flex max-w-xs items-center gap-1 rounded-full bg-white/5 p-1">
          {['hamısı', 'satış', 'kirayə'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 rounded-full py-2 text-xs font-semibold capitalize transition ${
                filter === f ? 'bg-amber-400 text-slate-900' : 'text-white/60 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mx-auto mt-4 flex max-w-md items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5">
          <Search size={15} className="text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rayon və ya başlığa görə axtar..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
          />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {properties === null && <p className="text-center text-white/40">Yüklənir...</p>}
        {properties !== null && visible.length === 0 && (
          <p className="text-center text-white/40">Bu kateqoriyada hazırda aktiv elan yoxdur.</p>
        )}

        {featured.length > 0 && (
          <>
            <SectionLabel text="Seçilmiş elanlar" />
            <ListingTable properties={featured} tenantId={tenantId} highlight />
          </>
        )}

        {rest.length > 0 && (
          <>
            <SectionLabel text="Bütün elanlar" />
            <ListingTable properties={rest} tenantId={tenantId} />
          </>
        )}
      </div>

      <Footer />
      <ChatWidget properties={visible} />
    </div>
  )
}

function SectionLabel({ text }) {
  return (
    <div className="mb-3 mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400/80 first:mt-0">
      <div className="h-px flex-1 bg-amber-400/20" />
      {text}
      <div className="h-px flex-1 bg-amber-400/20" />
    </div>
  )
}

function ListingTable({ properties, tenantId, highlight }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="hidden bg-white/5 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-white/40 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr]">
        <span>Ünvan</span>
        <span>Otaq</span>
        <span>Sənəd</span>
        <span>Mərtəbə</span>
        <span>Saha</span>
        <span className="text-right">Qiymət</span>
      </div>
      <div className="divide-y divide-white/5">
        {properties.map((p) => (
          <Link
            key={p.id}
            to={`/elanlar/${tenantId}/${p.id}`}
            className={`grid grid-cols-2 gap-y-1 px-5 py-4 text-sm transition hover:bg-white/[0.04] sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] sm:items-center ${
              highlight ? 'bg-amber-400/[0.03]' : ''
            }`}
          >
            <span className="col-span-2 flex items-center gap-2 font-medium text-white sm:col-span-1">
              {highlight && <Star size={13} className="shrink-0 text-amber-400 fill-amber-400" />}
              <MapPin size={13} className="shrink-0 text-white/30" />
              <span className="truncate">{p.title}{p.district ? ` · ${p.district}` : ''}</span>
              {p.dealType === 'kirayə' && (
                <span className="shrink-0 rounded-full bg-purple-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-purple-300">Kirayə</span>
              )}
              {p.mortgage && (
                <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-blue-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-blue-300">
                  <Landmark size={9} /> İpoteka
                </span>
              )}
            </span>
            <span className="text-white/60 sm:text-white/70">{p.rooms ? `${p.rooms} otaq` : '—'}</span>
            <span className="flex items-center gap-1 text-white/60"><FileText size={12} />{p.documentType || '—'}</span>
            <span className="flex items-center gap-1 text-white/60"><Layers size={12} />{p.floor ? `${p.floor}/${p.floorTotal || '?'}` : '—'}</span>
            <span className="flex items-center gap-1 text-white/60"><Ruler size={12} />{p.area ? `${p.area} m²` : '—'}</span>
            <span className="text-right font-bold text-amber-400">
              {Number(p.price).toLocaleString('az-AZ')} AZN{p.dealType === 'kirayə' ? '/ay' : ''}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

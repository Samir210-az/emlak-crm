import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, FileText, Layers, Ruler, Phone, DoorOpen, Landmark, Home as HomeIcon } from 'lucide-react'
import { ref, db, onValue, tenantPath } from '../lib/firebase.js'
import PublicBottomNav from '../components/PublicBottomNav.jsx'

export default function PropertyDetail() {
  const { tenantId, propertyId } = useParams()
  const [property, setProperty] = useState(undefined)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    const unsub = onValue(ref(db, tenantPath(tenantId, 'properties', propertyId)), (snap) => {
      setProperty(snap.val())
    })
    return unsub
  }, [tenantId, propertyId])

  if (property === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white/40">Yüklənir...</div>
  }
  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-white">
        <p>Elan tapılmadı.</p>
        <Link to={`/elanlar/${tenantId}`} className="text-amber-400 hover:underline">Geri qayıt</Link>
      </div>
    )
  }

  const images = property.images?.length ? property.images : []
  const waMessage = encodeURIComponent(`Salam, "${property.title}" elanı ilə maraqlanıram.`)

  return (
    <div className="min-h-screen bg-slate-950 pb-16 text-white">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <Link to={`/elanlar/${tenantId}`} className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
            <ArrowLeft size={15} /> Bütün elanlara qayıt
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white">
            <HomeIcon size={13} /> ƏMLAK CRM
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {images.length > 0 ? (
            <>
              <img src={images[activeImg]} alt={property.title} className="h-80 w-full object-cover sm:h-96" />
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto p-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                        activeImg === i ? 'border-amber-400' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-80 items-center justify-center text-white/30">Şəkil əlavə olunmayıb</div>
          )}
        </div>

        <div className="mt-6">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              property.dealType === 'kirayə' ? 'bg-purple-400/15 text-purple-300' : 'bg-emerald-400/15 text-emerald-300'
            }`}>
              {property.dealType === 'kirayə' ? 'Kirayə' : 'Satış'}
            </span>
            {property.mortgage && (
              <span className="flex items-center gap-1 rounded-full bg-blue-400/15 px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                <Landmark size={11} /> İpoteka mümkündür
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-white/50">
            <MapPin size={15} /> {property.address || property.district || '—'}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoCard label="Otaq" value={property.rooms ? `${property.rooms} otaq` : '—'} icon={DoorOpen} />
            <InfoCard label="Saha" value={property.area ? `${property.area} m²` : '—'} icon={Ruler} />
            <InfoCard label="Mərtəbə" value={property.floor ? `${property.floor}/${property.floorTotal || '?'}` : '—'} icon={Layers} />
            <InfoCard label="Sənəd" value={property.documentType || '—'} icon={FileText} />
          </div>

          {property.description && (
            <p className="mt-6 leading-relaxed text-white/70">{property.description}</p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
            <p className="text-2xl font-extrabold text-amber-400">
              {Number(property.price).toLocaleString('az-AZ')} AZN{property.dealType === 'kirayə' ? ' / ay' : ''}
            </p>
            <div className="flex gap-2">
              {property.ownerPhone && (
                <a
                  href={`tel:${property.ownerPhone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  <Phone size={15} /> Zəng et
                </a>
              )}
              <a
                href={`https://wa.me/${property.ownerPhone ? property.ownerPhone.replace(/[^\d]/g, '') : ''}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                <Phone size={15} /> Əlaqə saxla
              </a>
            </div>
          </div>
        </div>
      </div>
      <PublicBottomNav tenantId={tenantId} />
    </div>
  )
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <Icon size={16} className="mx-auto mb-1 text-amber-400" />
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[11px] text-white/40">{label}</p>
    </div>
  )
}

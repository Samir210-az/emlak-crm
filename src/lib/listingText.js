// Çoxplatformalı elan mətni generatoru (bina.az, tap.az, arenda.az formatlarına uyğun)

function baseLines(p) {
  const dealLabel = p.dealType === 'kirayə' ? 'KİRAYƏ VERİLİR' : 'SATILIR'
  return [
    `${dealLabel}: ${p.title}`,
    [p.address, p.district].filter(Boolean).join(', '),
    [
      p.rooms && `${p.rooms} otaqlı`,
      p.area && `${p.area} m²`,
      p.floor && `${p.floor}/${p.floorTotal || '?'} mərtəbə`,
    ].filter(Boolean).join(', '),
    `Sənəd: ${p.documentType || 'çıxarış'}`,
    p.mortgage ? 'İpoteka mümkündür ✅' : null,
  ].filter((l) => l !== null)
}

export const LISTING_PLATFORMS = [
  { id: 'bina', name: 'Bina.az', url: 'https://bina.az/items/new', color: '#e10600' },
  { id: 'tap', name: 'Tap.az', url: 'https://tap.az/elan/yeni', color: '#00a4e4' },
  { id: 'arenda', name: 'Arenda.az', url: 'https://arenda.az/elan-yerlesdir', color: '#f5a623' },
]

export function generateListingText(p, platformId = 'bina') {
  const lines = [...baseLines(p), '', p.description || '', '', `Qiymət: ${Number(p.price).toLocaleString('az-AZ')} AZN`]

  if (platformId === 'arenda') {
    lines.push('', 'Kirayə/satış şərtləri barədə əlavə məlumat üçün əlaqə saxlayın.')
  } else if (platformId === 'tap') {
    lines.push('', '#emlak #dasinmazemlak #' + (p.district || 'baki').replace(/\s+/g, ''))
  } else {
    lines.push('', 'Ətraflı məlumat və baxış üçün əlaqə saxlayın.')
  }

  return lines.join('\n')
}

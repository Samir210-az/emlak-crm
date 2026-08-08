// Çoxplatformalı elan mətni generatoru (bina.az, tap.az, emlak.az, evler.az, arenda.az formatlarına uyğun)

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
  { id: 'bina', name: 'Bina.az', url: 'https://bina.az/items/new' },
  { id: 'tap', name: 'Tap.az', url: 'https://tap.az/elanlar/new' },
  { id: 'emlak', name: 'Emlak.az', url: 'https://www.emlak.az/elan-ver' },
  { id: 'evler', name: 'Evler.az', url: 'https://evler.az/elan-yerlesdir' },
  { id: 'arenda', name: 'Arenda.az', url: 'https://arenda.az/elan-yerlesdir' },
]

export function generateListingText(p, platformId = 'bina') {
  const lines = [...baseLines(p), '', p.description || '', '', `Qiymət: ${Number(p.price).toLocaleString('az-AZ')} AZN`]

  if (platformId === 'arenda') {
    lines.push('', 'Kirayə/satış şərtləri barədə əlavə məlumat üçün əlaqə saxlayın.')
  } else if (platformId === 'tap') {
    lines.push('', '#emlak #dasinmazemlak #' + (p.district || 'baki').replace(/\s+/g, ''))
  } else if (platformId === 'emlak' || platformId === 'evler') {
    lines.push('', 'Ətraflı məlumat, baxış vaxtı və sənədləşmə üçün əlaqə saxlayın.')
  } else {
    lines.push('', 'Ətraflı məlumat və baxış üçün əlaqə saxlayın.')
  }

  return lines.join('\n')
}

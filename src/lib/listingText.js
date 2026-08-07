// Bina.az / tap.az formatında hazır elan mətni yaradır (template-based, sürətli, AI-ya ehtiyac yoxdur)
export function generateListingText(p) {
  const dealLabel = p.dealType === 'kirayə' ? 'KİRAYƏ VERİLİR' : 'SATILIR'
  const lines = [
    `${dealLabel}: ${p.title}`,
    [p.address, p.district].filter(Boolean).join(', '),
    [
      p.rooms && `${p.rooms} otaqlı`,
      p.area && `${p.area} m²`,
      p.floor && `${p.floor}/${p.floorTotal || '?'} mərtəbə`,
    ].filter(Boolean).join(', '),
    `Sənəd: ${p.documentType || 'çıxarış'}`,
    p.mortgage ? 'İpoteka mümkündür ✅' : null,
    '',
    p.description || '',
    '',
    `Qiymət: ${Number(p.price).toLocaleString('az-AZ')} AZN`,
    '',
    'Ətraflı məlumat və baxış üçün əlaqə saxlayın.',
  ].filter((l) => l !== null)

  return lines.join('\n')
}

export const BINA_AZ_NEW_LISTING_URL = 'https://bina.az/items/new'

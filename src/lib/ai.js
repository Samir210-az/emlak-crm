// AI agent məntiqi — söhbəti idarə edir, uyğun obyektləri tapır və
// /api/chat serverless funksiyası vasitəsilə Groq-a sorğu göndərir.
// (Groq API açarı frontend-də saxlanmır — server tərəfdə, api/chat.js-də.)

export async function askAgent(messages, availableProperties) {
  const systemPrompt = `Sən "Əmlak CRM" agentliyinin süni intellekt köməkçisisən.
Vəzifən: müştəri ilə səmimi, qısa və peşəkar Azərbaycan dilində danışmaq.
Əvvəlcə öyrən: (1) satış axtarır, yoxsa kirayə, (2) rayon, (3) otaq sayı,
(4) büdcə, (5) ipoteka lazımdırmı. Bunlara görə bazadakı obyektlərin
"dealType" (satış/kirayə) və "mortgage" (true/false) sahələrinə uyğun filtr et.
Uyğun obyekt varsa, onun ID-sini [PROPERTY:id] formatında cavabın sonunda qeyd et
ki, sistem şəkili avtomatik göndərsin.
Həddindən artıq uzun cavab vermə, WhatsApp söhbəti kimi qısa yaz.

Mövcud obyektlər (JSON):
${JSON.stringify(availableProperties?.slice(0, 30) || [])}`

  // Groq/OpenAI formatı yalnız {role, content} qəbul edir — UI üçün əlavə
  // etdiyimiz "properties", "cta" kimi sahələri təmizləyirik ki, xəta verməsin.
  const cleanMessages = messages.map(({ role, content }) => ({ role, content }))

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'system', content: systemPrompt }, ...cleanMessages],
    }),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const errJson = await res.json()
      detail = errJson.detail || errJson.error || ''
    } catch {}
    const err = new Error('AI cavab vermədi: ' + detail)
    err.status = res.status
    throw err
  }
  const data = await res.json()
  return data.reply
}

// Cavabın içindən [PROPERTY:id] tag-larını çıxarıb təmiz mətn + id siyahısı qaytarır
export function extractPropertyRefs(text) {
  const regex = /\[PROPERTY:([a-zA-Z0-9_-]+)\]/g
  const ids = []
  let match
  while ((match = regex.exec(text)) !== null) ids.push(match[1])
  const clean = text.replace(regex, '').trim()
  return { clean, ids }
}

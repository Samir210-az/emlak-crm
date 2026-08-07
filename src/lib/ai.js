// AI agent məntiqi — söhbəti idarə edir, uyğun obyektləri tapır və
// /api/chat serverless funksiyası vasitəsilə Groq-a sorğu göndərir.
// (Groq API açarı frontend-də saxlanmır — server tərəfdə, api/chat.js-də.)

export async function askAgent(messages, availableProperties) {
  const systemPrompt = `Sən "Əmlak CRM" agentliyinin süni intellekt köməkçisisən.
Vəzifən: müştəri ilə səmimi, qısa və peşəkar Azərbaycan dilində danışmaq,
onun büdcəsini, rayon seçimini və otaq sayını öyrənmək, sonra bazadakı
uyğun obyektləri təklif etmək. Əgər uyğun obyekt varsa, onun ID-sini
[PROPERTY:id] formatında cavabın sonunda qeyd et ki, sistem şəkili avtomatik göndərsin.
Həddindən artıq uzun cavab vermə, WhatsApp söhbəti kimi qısa yaz.

Mövcud obyektlər (JSON):
${JSON.stringify(availableProperties?.slice(0, 30) || [])}`

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  })

  if (!res.ok) throw new Error('AI cavab vermədi')
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

// Vercel Serverless Function — Groq API-yə təhlükəsiz proxy.
// GROQ_API_KEY Vercel Environment Variables-də saxlanmalıdır (frontend-də yox!).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnız POST icazəlidir' })
  }

  const { messages } = req.body

  async function callGroq() {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.6,
        max_tokens: 400,
      }),
    })
    if (!groqRes.ok) {
      const errText = await groqRes.text()
      const err = new Error(errText)
      err.status = groqRes.status
      throw err
    }
    return groqRes.json()
  }

  try {
    let data
    try {
      data = await callGroq()
    } catch (firstErr) {
      // Keçici rate-limit/network xətaları üçün bir dəfə təkrar cəhd
      await new Promise((r) => setTimeout(r, 700))
      data = await callGroq()
    }
    const reply = data.choices?.[0]?.message?.content || 'Üzr istəyirəm, cavab tapa bilmədim.'
    return res.status(200).json({ reply })
  } catch (err) {
    console.error('Groq xətası:', err.status, err.message)
    return res.status(502).json({ error: 'Groq xətası', detail: err.message, status: err.status })
  }
}

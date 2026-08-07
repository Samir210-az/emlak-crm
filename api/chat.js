// Vercel Serverless Function — Groq API-yə təhlükəsiz proxy.
// GROQ_API_KEY Vercel Environment Variables-də saxlanmalıdır (frontend-də yox!).
// Vercel Dashboard -> Project Settings -> Environment Variables -> GROQ_API_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnız POST icazəlidir' })
  }

  try {
    const { messages } = req.body

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
      return res.status(502).json({ error: 'Groq xətası', detail: errText })
    }

    const data = await groqRes.json()
    const reply = data.choices?.[0]?.message?.content || 'Üzr istəyirəm, cavab tapa bilmədim.'
    return res.status(200).json({ reply })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

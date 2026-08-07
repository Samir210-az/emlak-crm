// WhatsApp Business Cloud API webhook (Meta) — GƏLƏCƏK MƏRHƏLƏ.
// Meta Business hesabı + WhatsApp Business API təsdiqi tələb edir.
// Sənəd: https://developers.facebook.com/docs/whatsapp/cloud-api
//
// Axın:
// 1. Meta bu URL-ə GET sorğusu göndərib "hub.verify_token" yoxlayır (aşağıda WHATSAPP_VERIFY_TOKEN)
// 2. Müştəri mesaj yazanda Meta bu URL-ə POST göndərir
// 3. Biz mesajı /api/chat-dəki eyni AI məntiqinə ötürürük
// 4. Cavabı WhatsApp Cloud API vasitəsilə geri göndəririk

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return res.status(200).send(challenge)
    }
    return res.status(403).send('Verify token uyğun gəlmədi')
  }

  if (req.method === 'POST') {
    // TODO: req.body-dən müştəri mesajını çıxar, AI-yə göndər,
    // cavabı WhatsApp Cloud API (graph.facebook.com/v20.0/{phone-id}/messages) ilə geri göndər.
    // Bu hissə Meta Business hesabı hazır olduqda tamamlanacaq.
    return res.status(200).json({ received: true })
  }

  return res.status(405).end()
}

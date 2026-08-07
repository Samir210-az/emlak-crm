import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Home } from 'lucide-react'
import { askAgent, extractPropertyRefs } from '../lib/ai'

export default function ChatWidget({ properties = [] }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salam! 👋 Sizə uyğun ev/mənzil tapmaqda kömək edə bilərəm. Hansı rayonda, neçə otaqlı və hansı büdcədə axtarırsınız?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const raw = await askAgent(next, properties)
      const { clean, ids } = extractPropertyRefs(raw)
      const matched = properties.filter((p) => ids.includes(p.id))
      setMessages((m) => [...m, { role: 'assistant', content: clean, properties: matched }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Bağışlayın, hazırda cavab verə bilmirəm. Bir az sonra cəhd edin.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-xl shadow-brand-500/30 transition-transform hover:scale-105 animate-float"
        aria-label="AI köməkçi ilə danış"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] max-w-[92vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-up">
          <div className="flex items-center gap-3 bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Home size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold">Əmlak AI Köməkçi</p>
              <p className="text-xs text-white/80">Adətən dərhal cavab verir</p>
            </div>
          </div>

          <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-brand-600 text-white'
                      : 'rounded-bl-sm bg-white text-slate-700 shadow-sm'
                  }`}
                >
                  {m.content}
                  {m.properties?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {m.properties.map((p) => (
                        <div key={p.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                          {p.image && <img src={p.image} alt={p.title} className="h-28 w-full object-cover" />}
                          <div className="p-2">
                            <p className="text-xs font-semibold text-slate-800">{p.title}</p>
                            <p className="text-xs text-brand-600 font-medium">{p.price} AZN</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-slate-400">Yazır...</p>}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Mesajınızı yazın..."
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-400"
            />
            <button
              onClick={send}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

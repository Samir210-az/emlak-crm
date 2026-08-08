import { useState, useRef, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { askAgent, extractPropertyRefs } from '../lib/ai'

export default function ChatWidget({ properties = [] }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salam! 👋 Sizə uyğun ev/mənzil tapmaqda kömək edə bilərəm. Satış, yoxsa kirayə axtarırsınız?' },
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
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-xl shadow-amber-400/30 transition-transform hover:scale-105 animate-float"
        aria-label="AI köməkçi ilə danış"
      >
        {open ? <X size={26} className="text-slate-900" /> : <img src="/ai-mascot.png" alt="AI köməkçi" className="h-12 w-12 object-contain" />}
      </button>

      {open && (
        <div className="fixed bottom-36 right-5 z-50 flex h-[500px] w-[340px] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl animate-fade-up">
          <div className="flex items-center gap-3 bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-3">
            <img src="/ai-mascot.png" alt="" className="h-9 w-9 object-contain" />
            <div>
              <p className="text-sm font-semibold text-white">Əmlak AI Köməkçi</p>
              <p className="text-xs text-white/40">Adətən dərhal cavab verir</p>
            </div>
          </div>

          <div ref={scrollRef} className="chat-scroll flex-1 space-y-3 overflow-y-auto bg-slate-950 p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-amber-400 text-slate-900'
                      : 'rounded-bl-sm bg-white/[0.06] text-white/90 border border-white/10'
                  }`}
                >
                  {m.content}
                  {m.properties?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {m.properties.map((p) => (
                        <div key={p.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                          {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-28 w-full object-cover" />}
                          <div className="p-2">
                            <p className="text-xs font-semibold text-white">{p.title}</p>
                            <p className="text-xs font-medium text-amber-400">{p.price} AZN</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-white/30">Yazır...</p>}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 bg-slate-900 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Mesajınızı yazın..."
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
            />
            <button
              onClick={send}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-slate-900 transition hover:bg-amber-300"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

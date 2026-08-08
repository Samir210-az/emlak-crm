import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Send, Phone, UserPlus } from 'lucide-react'
import { askAgent, extractPropertyRefs } from '../lib/ai'
import { addClient } from '../lib/db.js'

export default function ChatWidget({ properties = [], tenantId = null, demoMode = false }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salam! 👋 Sizə uyğun ev/mənzil tapmaqda kömək edə bilərəm. Satış, yoxsa kirayə axtarırsınız?' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadSaved, setLeadSaved] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, showLeadForm])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')

    if (demoMode) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Bu, Əmlak CRM-in demo AI köməkçisidir. Öz agentliyiniz üçün canlı, real elanlarla işləyən AI-yə çıxış üçün qeydiyyatdan keçin — 7 gün pulsuz sınaq var 👇',
          cta: true,
        },
      ])
      return
    }

    setLoading(true)
    try {
      const raw = await askAgent(next, properties)
      const { clean, ids } = extractPropertyRefs(raw)
      const matched = properties.filter((p) => ids.includes(p.id))
      setMessages((m) => [...m, { role: 'assistant', content: clean, properties: matched }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: `Bağışlayın, hazırda cavab verə bilmirəm.\n\n🔧 Debug: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  async function submitLead(e) {
    e.preventDefault()
    if (!leadName.trim() || !leadPhone.trim()) return
    if (tenantId) {
      const userTexts = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' · ')
      await addClient(tenantId, {
        name: leadName.trim(),
        phone: leadPhone.trim(),
        district: '',
        budget: '',
        source: 'AI chat',
        note: userTexts.slice(0, 300),
      })
    }
    setLeadSaved(true)
    setShowLeadForm(false)
    setMessages((m) => [...m, { role: 'assistant', content: `Təşəkkürlər, ${leadName.trim()}! Məlumatlarınız qeyd olundu, tezliklə sizinlə əlaqə saxlanılacaq. 📞` }])
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 right-4 z-50 flex h-24 w-24 items-center justify-center transition-transform hover:scale-110 animate-float"
        aria-label="AI köməkçi ilə danış"
      >
        {!open && <span className="absolute inset-2 -z-10 animate-ping rounded-full bg-amber-400/40" />}
        {!open && <span className="absolute inset-3 -z-10 rounded-full bg-amber-400/20 blur-xl" />}
        {open ? (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 shadow-2xl">
            <X size={28} className="text-slate-900" />
          </span>
        ) : (
          <img src="/ai-mascot.png" alt="AI köməkçi" className="h-24 w-24 object-contain drop-shadow-2xl" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-36 right-5 z-50 flex h-[500px] w-[340px] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl animate-fade-up">
          <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-3">
            <div className="flex items-center gap-3">
              <img src="/ai-mascot.png" alt="" className="h-9 w-9 object-contain" />
              <div>
                <p className="text-sm font-semibold text-white">Əmlak AI Köməkçi</p>
                <p className="text-xs text-white/40">Adətən dərhal cavab verir</p>
              </div>
            </div>
            {tenantId && !leadSaved && (
              <button
                onClick={() => setShowLeadForm((s) => !s)}
                className="flex shrink-0 items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1.5 text-[10px] font-semibold text-amber-400 hover:bg-amber-400/25"
                title="Əlaqə nömrənizi buraxın"
              >
                <Phone size={11} /> Əlaqə burax
              </button>
            )}
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
                  {m.cta && (
                    <div className="mt-2 flex gap-2">
                      <Link to="/qeydiyyat" className="flex-1 rounded-lg bg-amber-400 py-2 text-center text-xs font-semibold text-slate-900 hover:bg-amber-300">
                        Qeydiyyatdan keç
                      </Link>
                      <Link to="/giris" className="flex-1 rounded-lg border border-white/15 py-2 text-center text-xs font-semibold text-white hover:bg-white/5">
                        Daxil ol
                      </Link>
                    </div>
                  )}
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

            {showLeadForm && (
              <form onSubmit={submitLead} className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <UserPlus size={13} /> Əlaqə məlumatınızı buraxın
                </p>
                <input
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Adınız"
                  className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  required
                />
                <input
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="Telefon nömrəniz"
                  type="tel"
                  className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-amber-400/50"
                  required
                />
                <button type="submit" className="w-full rounded-lg bg-amber-400 py-2 text-xs font-semibold text-slate-900 hover:bg-amber-300">
                  Göndər
                </button>
              </form>
            )}
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

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, MessageSquareText, ShieldCheck, Sparkles } from 'lucide-react'
import ChatWidget from '../components/ChatWidget.jsx'
import Footer from '../components/Footer.jsx'

// Nümunə obyektlər — real işə salınanda Firebase-dən gələcək
const sampleProperties = [
  { id: 'p1', title: '3 otaqlı, Nərimanov r.', price: '95000', rooms: 3, image: null },
  { id: 'p2', title: '2 otaqlı, Yasamal r.', price: '68000', rooms: 2, image: null },
  { id: 'p3', title: '4 otaqlı, Xətai r.', price: '142000', rooms: 4, image: null },
]

export default function HomePage() {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with parallax gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-600 to-brand-400 animate-gradient">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            transform: `translateY(${offset * 0.2}px)`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-28 text-center text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur">
            <Sparkles size={14} /> AI dəstəkli əmlak platforması
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-6xl animate-fade-up">
            Əmlak agentliyinizi <br className="hidden sm:block" />
            <span className="text-brand-100">süni intellektlə</span> idarə edin
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-brand-50/90">
            Obyekt bazası, müştəri uyğunlaşdırması və saytda/WhatsApp-da 7/24 danışan
            AI agent — hamısı bir platformada.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/qeydiyyat" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-lg transition hover:scale-105">
              7 gün pulsuz sınayın
            </Link>
            <Link to="/giris" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Daxil ol
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Building2, title: 'Ağıllı obyekt bazası', text: 'Foto, qiymət, status — hamısı bir yerdə, avtomatik sıralama ilə.' },
            { icon: MessageSquareText, title: 'AI chat + WhatsApp', text: 'Müştəri ilə söhbət edir, şəkil göndərir, yeni təklif çıxarır.' },
            { icon: ShieldCheck, title: 'Sövdələşmə izləmə', text: 'Beh → bank təsdiqi → notariat → təhvil-təslim, addım-addım.' },
          ].map((f, i) => (
            <div key={i} className="group rounded-2xl border border-slate-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <f.icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-800">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <ChatWidget properties={sampleProperties} />
    </div>
  )
}

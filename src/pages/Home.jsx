import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Building2, Sparkles, ArrowRight } from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PublicBottomNav from '../components/PublicBottomNav.jsx'
import ChatWidget from '../components/ChatWidget.jsx'

const HERO_IMG = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1800&q=80'

const demoListings = [
  { title: 'Yeni Yasamal, 3 otaqlı', price: '275 000', tag: 'Günün mənzili' },
  { title: 'Xətai r., Gəncə prospekti', price: '145 000', tag: 'Kirayə var' },
]

const demoProperties = [
  { id: 'demo1', title: 'Yeni Yasamal, 3 otaqlı', price: '275000', rooms: '3', dealType: 'satış', district: 'Yasamal', images: [] },
  { id: 'demo2', title: 'Xətai r., Gəncə prospekti, 2 otaqlı', price: '650', rooms: '2', dealType: 'kirayə', district: 'Xətai', images: [] },
]

export default function HomePage() {
  return (
    <div className="bg-slate-950 pb-16">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-900">
            <Building2 size={16} />
          </span>
          ƏMLAK CRM
        </span>
        <Link to="/giris" className="text-sm font-medium text-white/70 transition hover:text-white">
          Daxil ol
        </Link>
      </nav>

      {/* HERO — TƏK EKRAN */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="Müasir mənzil" className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/80 to-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent" />
        </div>

        <div className="absolute top-1/4 -left-16 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl animate-float" />
        <div className="absolute bottom-24 right-[8%] h-40 w-40 rounded-full bg-brand-400/10 blur-3xl animate-float" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 pt-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-400"
          >
            <Sparkles size={13} /> AI dəstəkli əmlak platforması
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-extrabold leading-[1.12] text-white sm:text-5xl"
          >
            Əmlak agentliyinizi <span className="text-amber-400">süni intellektlə</span> idarə edin
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-5 max-w-md text-sm text-white/60 sm:text-base"
          >
            Satış və kirayə elanları, ipoteka statusu, müştəri ilə 7/24 danışan AI agent
            və 5 aparıcı sayt üçün hazır elan mətni — hamısı bir yerdə.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/qeydiyyat"
              className="flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/20 transition hover:scale-105 hover:bg-amber-300"
            >
              7 gün pulsuz sınayın <ArrowRight size={16} />
            </Link>
            <Link
              to="/giris"
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Artıq hesabım var
            </Link>
          </motion.div>

          {/* mini demo card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left backdrop-blur"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">Günün mənzilləri</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> canlı
              </span>
            </div>
            {demoListings.map((l, i) => (
              <div key={i} className="flex items-center justify-between border-t border-white/5 py-2.5 first:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{l.title}</p>
                  <p className="text-[11px] text-white/40">{l.tag}</p>
                </div>
                <p className="text-sm font-bold text-amber-400">{l.price} AZN</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
      <ChatWidget properties={demoProperties} />
      <PublicBottomNav />
    </div>
  )
}

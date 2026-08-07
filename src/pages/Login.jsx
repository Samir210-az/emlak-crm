import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Lock, Mail } from 'lucide-react'
import { login } from '../lib/db.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch {
      setError('E-poçt və ya şifrə yanlışdır.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-600 to-brand-400 animate-gradient px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl animate-fade-up"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Building2 size={24} />
          </div>
          <h1 className="text-lg font-semibold text-slate-800">Agentlik girişi</h1>
          <p className="text-sm text-slate-500">Əmlak CRM admin panelinə daxil olun</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
            <Mail size={16} className="text-slate-400" />
            <input
              type="email"
              required
              placeholder="E-poçt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
            <Lock size={16} className="text-slate-400" />
            <input
              type="password"
              required
              placeholder="Şifrə"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm outline-none"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? 'Yoxlanılır...' : 'Daxil ol'}
        </button>
      </form>
    </div>
  )
}

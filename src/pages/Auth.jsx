import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { db, ref, set, get, tenantPath } from "../lib/firebase.js";
import { saveSession, slugify } from "../lib/session.js";

const HERO_IMG = "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1800&q=80";
const cleanPhone = (p) => p.replace(/[^\d]/g, "");

export default function Auth() {
  const location = useLocation();
  const isRegister = location.pathname.includes("qeydiyyat");
  const navigate = useNavigate();

  const [ad, setAd] = useState("");
  const [agentlik, setAgentlik] = useState("");
  const [telefon, setTelefon] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    if (!ad || !telefon || pin.length < 4) {
      setError("Zəhmət olmasa bütün xanaları doldur (PIN minimum 4 rəqəm olsun).");
      return;
    }
    setLoading(true);
    try {
      const phoneKey = cleanPhone(telefon);
      const indexRef = ref(db, `emlak_crm/phone_index/${phoneKey}`);
      const existing = await get(indexRef);
      if (existing.exists()) {
        setError("Bu nömrə ilə artıq qeydiyyat var. Daxil ol səhifəsindən gir.");
        setLoading(false);
        return;
      }
      const tenantId = `${slugify(ad)}-${phoneKey.slice(-4)}`;
      const trialDays = 7;
      await set(ref(db, tenantPath(tenantId, "profil")), {
        ad,
        agentlik: agentlik || ad,
        telefon,
        pin,
        yaradilib: Date.now(),
        access_until: Date.now() + trialDays * 24 * 60 * 60 * 1000,
        plan: "sınaq",
      });
      await set(indexRef, tenantId);
      if (window.notifyTelegram) {
        window.notifyTelegram(
          `🏠 Yeni qeydiyyat — Əmlak CRM\nAgentlik: ${agentlik || ad}\nAd: ${ad}\nTelefon: ${telefon}\nLink: https://emlak-az.vercel.app`
        );
      }
      saveSession(tenantId, { ad, agentlik });
      navigate("/admin");
    } catch (err) {
      setError("Xəta baş verdi: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!telefon || !pin) {
      setError("Telefon nömrəsi və PIN daxil et.");
      return;
    }
    setLoading(true);
    try {
      const phoneKey = cleanPhone(telefon);
      const indexSnap = await get(ref(db, `emlak_crm/phone_index/${phoneKey}`));
      if (!indexSnap.exists()) {
        setError("Bu nömrə ilə qeydiyyat tapılmadı.");
        setLoading(false);
        return;
      }
      const tenantId = indexSnap.val();
      const profilSnap = await get(ref(db, tenantPath(tenantId, "profil")));
      const profil = profilSnap.val();
      if (!profil || String(profil.pin) !== String(pin)) {
        setError("PIN yanlışdır.");
        setLoading(false);
        return;
      }
      saveSession(tenantId, { ad: profil.ad, agentlik: profil.agentlik });
      navigate("/admin");
    } catch (err) {
      setError("Xəta baş verdi: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/85 to-slate-950" />
      </div>
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl animate-float" />
      <div className="absolute bottom-0 -right-20 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl animate-float" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-xl font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-900">
            <Building2 size={18} />
          </span>
          ƏMLAK CRM
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-7 flex gap-2 rounded-full bg-white/5 p-1">
            <Link
              to="/qeydiyyat"
              className={`flex-1 rounded-full py-2.5 text-center text-sm font-medium transition-all ${
                isRegister ? "bg-amber-400 text-slate-900" : "text-white/60 hover:text-white"
              }`}
            >
              Qeydiyyat
            </Link>
            <Link
              to="/giris"
              className={`flex-1 rounded-full py-2.5 text-center text-sm font-medium transition-all ${
                !isRegister ? "bg-amber-400 text-slate-900" : "text-white/60 hover:text-white"
              }`}
            >
              Daxil ol
            </Link>
          </div>

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <>
                <Field label="Adın Soyadın" value={ad} onChange={setAd} placeholder="Elçin Məmmədov" />
                <Field label="Agentlik adı (istəyə bağlı)" value={agentlik} onChange={setAgentlik} placeholder="Bakı Əmlak MMC" />
              </>
            )}
            <Field label="Telefon nömrəsi" value={telefon} onChange={setTelefon} placeholder="051 457 25 38" type="tel" />
            <Field
              label={isRegister ? "PIN təyin et (min. 4 rəqəm)" : "PIN"}
              value={pin}
              onChange={setPin}
              placeholder="••••"
              type="password"
              maxLength={8}
            />

            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>{isRegister ? "Hesab yarat (7 gün pulsuz)" : "Daxil ol"} <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-white/40">
          Məlumatların tam ayrı və qorunur — heç kim başqasının panelini görə bilməz.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", maxLength }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/50">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/30 transition-all focus:border-amber-400/50 focus:bg-white/[0.09] focus:outline-none"
      />
    </label>
  );
}

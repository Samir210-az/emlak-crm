import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Building2, ArrowRight, Loader2 } from "lucide-react";
import { db, ref, set, get, tenantPath } from "../lib/firebase.js";
import { saveSession, slugify } from "../lib/session.js";

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
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-600 to-brand-400 animate-gradient flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-float" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-float" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8 text-white font-semibold text-xl">
          <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-brand-700">
            <Building2 size={18} />
          </span>
          Əmlak CRM
        </Link>

        <div className="bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">
          <div className="flex gap-2 mb-7 bg-white/10 rounded-full p-1">
            <Link
              to="/qeydiyyat"
              className={`flex-1 text-center text-sm font-medium py-2.5 rounded-full transition-all ${
                isRegister ? "bg-white text-brand-700" : "text-white/70 hover:text-white"
              }`}
            >
              Qeydiyyat
            </Link>
            <Link
              to="/giris"
              className={`flex-1 text-center text-sm font-medium py-2.5 rounded-full transition-all ${
                !isRegister ? "bg-white text-brand-700" : "text-white/70 hover:text-white"
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

            {error && <p className="text-red-100 text-sm bg-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white text-brand-700 font-semibold rounded-xl py-3 mt-2 transition hover:bg-brand-50 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>{isRegister ? "Hesab yarat (7 gün pulsuz)" : "Daxil ol"} <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
        <p className="text-center text-white/50 text-xs mt-6">
          Məlumatların tam ayrı və qorunur — heç kim başqasının panelini görə bilməz.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", maxLength }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-white/60 mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:border-white/50 focus:bg-white/[0.15] transition-all"
      />
    </label>
  );
}

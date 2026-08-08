import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Building2, Plus, Phone, Eye, MapPin, Monitor, Trash2 } from "lucide-react";
import { db, ref, onValue, set, remove } from "../lib/firebase.js";

const ADMIN_PIN = "AN2026EA";
const DAY = 24 * 60 * 60 * 1000;

export default function SuperAdmin() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [tenants, setTenants] = useState({});
  const [dbError, setDbError] = useState("");
  const [visits, setVisits] = useState({});
  const [tab, setTab] = useState("agentlikler");

  useEffect(() => {
    if (!authed) return;
    const r2 = ref(db, "emlak_crm/analytics");
    const unsub2 = onValue(r2, (snap) => setVisits(snap.val() || {}));
    return () => unsub2();
  }, [authed]);

  useEffect(() => {
    if (!authed) return;
    const r = ref(db, "emlak_crm/tenants");
    const unsub = onValue(
      r,
      (snap) => {
        setDbError("");
        setTenants(snap.val() || {});
      },
      (err) => setDbError(err.message || String(err))
    );
    return () => unsub();
  }, [authed]);

  function handlePin(e) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setAuthed(true);
      setError("");
    } else {
      setError("PIN yanlışdır.");
    }
  }

  const [writeError, setWriteError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [doneId, setDoneId] = useState(null);

  async function extend(tenantId, currentAccessUntil, days) {
    const key = `${tenantId}-${days}`;
    setBusyId(key);
    setWriteError("");
    try {
      const base = currentAccessUntil && currentAccessUntil > Date.now() ? currentAccessUntil : Date.now();
      await set(ref(db, `emlak_crm/tenants/${tenantId}/profil/access_until`), base + days * DAY);
      const plan = days >= 365 ? "illik" : days >= 28 ? "aylıq" : "sınaq";
      await set(ref(db, `emlak_crm/tenants/${tenantId}/profil/plan`), plan);
      setDoneId(key);
      setTimeout(() => setDoneId((cur) => (cur === key ? null : cur)), 1500);
    } catch (err) {
      setWriteError(err.message || String(err));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTenant(tenantId, phone) {
    if (!window.confirm(`Diqqət! "${tenantId}" agentliyini silmək istədiyinə əminsən? Bütün obyektləri, müştəriləri və sövdələşmələri həmişəlik silinəcək.`)) return;
    setBusyId(`del-${tenantId}`);
    try {
      await remove(ref(db, `emlak_crm/tenants/${tenantId}`));
      if (phone) {
        const phoneKey = phone.replace(/[^\d]/g, "");
        await remove(ref(db, `emlak_crm/phone_index/${phoneKey}`));
      }
    } catch (err) {
      setWriteError(err.message || String(err));
    } finally {
      setBusyId(null);
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16">
        <motion.form
          onSubmit={handlePin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl"
        >
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
            <Lock className="text-amber-400" size={20} />
          </div>
          <h1 className="mb-1 text-xl font-semibold text-white">Usta Panel</h1>
          <p className="mb-6 text-sm text-white/40">Yalnız SECURITY GROUP admin girişi</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/25 focus:border-amber-400/60 focus:outline-none"
          />
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-300">
            Daxil ol
          </button>
        </motion.form>
      </div>
    );
  }

  const list = Object.entries(tenants).sort((a, b) => (b[1].profil?.yaradilib || 0) - (a[1].profil?.yaradilib || 0));

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-5 text-lg font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-900">
            <Building2 size={16} />
          </span>
          Əmlak CRM — Usta Panel
          <span className="ml-2 text-sm font-normal text-white/40">{list.length} agentlik</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTab("agentlikler")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "agentlikler" ? "bg-amber-400 text-slate-900" : "border border-white/10 bg-white/5 text-white/60"
            }`}
          >
            Agentliklər
          </button>
          <button
            onClick={() => setTab("ziyaretciler")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "ziyaretciler" ? "bg-amber-400 text-slate-900" : "border border-white/10 bg-white/5 text-white/60"
            }`}
          >
            <Eye size={14} /> Ziyarətçilər
          </button>
        </div>

        {dbError && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/5 p-5">
            <p className="mb-1 text-sm font-semibold text-red-400">Firebase icazə xətası</p>
            <p className="break-all font-mono text-xs text-white/50">{dbError}</p>
            <p className="mt-2 text-xs text-white/40">
              Firebase Console → Realtime Database → Rules bölməsində "tenants" səviyyəsinə
              <code className="text-amber-400"> .read: true </code> əlavə et.
            </p>
          </div>
        )}
        {writeError && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-400/5 p-5">
            <p className="mb-1 text-sm font-semibold text-red-400">Uzatma alınmadı</p>
            <p className="break-all font-mono text-xs text-white/50">{writeError}</p>
          </div>
        )}

        {tab === "agentlikler" &&
          (list.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
              <p className="text-sm text-white/35">Hələ qeydiyyatdan keçən agentlik yoxdur.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
              {list.map(([id, t]) => {
                const p = t.profil || {};
                const until = p.access_until;
                const daysLeft = until ? Math.ceil((until - Date.now()) / DAY) : null;
                const expired = until && Date.now() > until;
                return (
                  <div key={id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-medium text-white">{p.agentlik || p.ad || id}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/45">
                        <Phone size={11} /> {p.telefon || "—"} · {p.ad || "—"}
                      </p>
                      <p className={`mt-1 font-mono text-xs ${expired ? "text-red-400" : "text-emerald-400"}`}>
                        {until
                          ? expired
                            ? `Bitib (${Math.abs(daysLeft)} gün əvvəl)`
                            : `${daysLeft} gün qalıb`
                          : "Müddət təyin olunmayıb"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => extend(id, until, 7)}
                        disabled={busyId === `${id}-7`}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                          doneId === `${id}-7` ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-400" : "border-white/10 bg-white/5 text-white/70 hover:border-amber-400/50 hover:text-amber-400"
                        }`}
                      >
                        <Plus size={12} /> {busyId === `${id}-7` ? "..." : doneId === `${id}-7` ? "✓ Oldu" : "7 gün"}
                      </button>
                      <button
                        onClick={() => extend(id, until, 30)}
                        disabled={busyId === `${id}-30`}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                          doneId === `${id}-30` ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-400" : "border-white/10 bg-white/5 text-white/70 hover:border-amber-400/50 hover:text-amber-400"
                        }`}
                      >
                        <Plus size={12} /> {busyId === `${id}-30` ? "..." : doneId === `${id}-30` ? "✓ Oldu" : "1 ay"}
                      </button>
                      <button
                        onClick={() => extend(id, until, 365)}
                        disabled={busyId === `${id}-365`}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                          doneId === `${id}-365` ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-400" : "border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                        }`}
                      >
                        <Plus size={12} /> {busyId === `${id}-365` ? "..." : doneId === `${id}-365` ? "✓ Oldu" : "1 il"}
                      </button>
                      <button
                        onClick={() => deleteTenant(id, p.telefon)}
                        disabled={busyId === `del-${id}`}
                        className="flex items-center gap-1 rounded-full border border-red-400/20 bg-red-400/5 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-400/15 disabled:opacity-40"
                      >
                        <Trash2 size={12} /> {busyId === `del-${id}` ? "..." : "Sil"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {tab === "ziyaretciler" && <VisitorsList visits={visits} />}
      </main>
    </div>
  );
}

function VisitorsList({ visits }) {
  const list = Object.entries(visits).sort((a, b) => (b[1].tarix || 0) - (a[1].tarix || 0));

  if (list.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
        <p className="text-sm text-white/35">Hələ ziyarətçi qeydə alınmayıb.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-white/50">Cəmi: {list.length} ziyarət</p>
      <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
        {list.map(([id, v]) => (
          <div key={id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="font-mono text-sm font-medium text-white">{v.ip || "naməlum IP"}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/45">
                <MapPin size={11} /> {[v.sehir, v.olke].filter(Boolean).join(", ") || "Naməlum yer"}
                {v.isp && ` · ${v.isp}`}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/35">
                <Monitor size={11} /> {v.cihaz} · {v.brauzer} · {v.sehife}
              </p>
            </div>
            <span className="shrink-0 font-mono text-xs text-white/40">
              {new Date(v.tarix).toLocaleString("az-AZ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

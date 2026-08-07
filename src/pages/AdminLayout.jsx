import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Building2, Users, Handshake, LogOut, Home, Lock, LayoutDashboard } from "lucide-react";
import { getSession, clearSession } from "../lib/session.js";
import { watchProfil } from "../lib/db.js";

const navItems = [
  { to: "/admin/dashboard", label: "İcmal", icon: LayoutDashboard },
  { to: "/admin/properties", label: "Obyektlər", icon: Building2 },
  { to: "/admin/clients", label: "Müştərilər", icon: Users },
  { to: "/admin/deals", label: "Sövdələşmələr", icon: Handshake },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const session = getSession();
  const [profil, setProfil] = useState(undefined);

  useEffect(() => {
    if (!session) {
      navigate("/giris");
      return;
    }
    const unsub = watchProfil(session.tenantId, setProfil);
    return unsub;
  }, [session, navigate]);

  if (!session) return null;
  if (profil === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Yüklənir...</div>;
  }

  const expired = profil && profil.access_until && Date.now() > profil.access_until;
  if (expired) return <TrialExpired ad={profil.ad} onLogout={() => { clearSession(); navigate("/giris"); }} />;

  const daysLeft = profil?.access_until ? Math.max(0, Math.ceil((profil.access_until - Date.now()) / 86400000)) : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-5">
          <Home size={20} className="text-brand-600" />
          <span className="font-semibold text-slate-800">Əmlak CRM</span>
        </div>
        {profil?.plan === "sınaq" && daysLeft !== null && (
          <div className="mx-3 mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Sınaq müddəti: {daysLeft} gün qalıb
          </div>
        )}
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => { clearSession(); navigate("/giris"); }}
          className="mx-3 mb-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
        >
          <LogOut size={17} /> Çıxış
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet context={{ uid: session.tenantId }} />
      </main>
    </div>
  );
}

function TrialExpired({ ad, onLogout }) {
  const waMessage = encodeURIComponent(`Salam, mən ${ad || "əmlak agenti"}. Əmlak CRM sınaq müddətim bitib, abunə olmaq istəyirəm.`);
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-600 to-brand-400 animate-gradient flex items-center justify-center px-4 py-16">
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="text-white" size={26} />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">Sınaq müddətin bitib</h1>
        <p className="text-white/70 text-sm mb-8 leading-relaxed">
          {ad ? `${ad}, ` : ""}7 günlük pulsuz sınaq müddətin başa çatıb. Davam etmək üçün abunə ol —
          obyektlərinin, müştərilərinin və sövdələşmələrinin bütün datası qorunub saxlanılır.
        </p>
        <a
          href={`https://wa.me/994552107111?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-white py-3 text-sm font-semibold text-brand-700 mb-3 transition hover:bg-brand-50"
        >
          WhatsApp ilə əlaqə saxla
        </a>
        <button onClick={onLogout} className="text-white/60 hover:text-white text-sm transition-colors">
          Çıxış et
        </button>
      </div>
    </div>
  );
}

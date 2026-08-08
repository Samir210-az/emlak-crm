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

  function handleLogout() {
    clearSession();
    navigate("/giris");
  }

  return (
    <div className="min-h-screen bg-slate-50 sm:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:hidden">
        <span className="flex items-center gap-2 font-semibold text-slate-800">
          <Home size={18} className="text-brand-600" /> Əmlak CRM
        </span>
        {profil?.plan === "sınaq" && daysLeft !== null && (
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
            {daysLeft} gün qalıb
          </span>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white sm:flex">
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
          onClick={handleLogout}
          className="mx-3 mb-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
        >
          <LogOut size={17} /> Çıxış
        </button>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-x-hidden pb-20 sm:pb-0">
        <Outlet context={{ uid: session.tenantId }} />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white sm:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                isActive ? "text-brand-600" : "text-slate-400"
              }`
            }
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-slate-400">
          <LogOut size={19} />
          Çıxış
        </button>
      </nav>
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

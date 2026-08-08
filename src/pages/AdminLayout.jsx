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
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white/40">Yüklənir...</div>;
  }

  const expired = profil && profil.access_until && Date.now() > profil.access_until;
  if (expired) return <TrialExpired ad={profil.ad} onLogout={() => { clearSession(); navigate("/giris"); }} />;

  const daysLeft = profil?.access_until ? Math.max(0, Math.ceil((profil.access_until - Date.now()) / 86400000)) : null;

  function handleLogout() {
    clearSession();
    navigate("/giris");
  }

  return (
    <div className="min-h-screen bg-slate-950 sm:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-3 sm:hidden">
        <span className="flex items-center gap-2 font-semibold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-900">
            <Home size={15} />
          </span>
          Əmlak CRM
        </span>
        {profil?.plan === "sınaq" && daysLeft !== null && (
          <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
            {daysLeft} gün qalıb
          </span>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-slate-950 sm:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-900">
            <Home size={16} />
          </span>
          <span className="font-semibold text-white">Əmlak CRM</span>
        </div>
        {profil?.plan === "sınaq" && daysLeft !== null && (
          <div className="mx-3 mb-3 rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-400">
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
                  isActive ? "bg-amber-400/10 text-amber-400" : "text-white/50 hover:bg-white/5 hover:text-white"
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
          className="mx-3 mb-5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} /> Çıxış
        </button>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-x-hidden pb-20 sm:pb-0">
        <Outlet context={{ uid: session.tenantId }} />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-slate-950 sm:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium ${
                isActive ? "text-amber-400" : "text-white/40"
              }`
            }
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium text-white/40">
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-16">
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
          <Lock className="text-amber-400" size={26} />
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-white">Sınaq müddətin bitib</h1>
        <p className="mb-8 text-sm leading-relaxed text-white/50">
          {ad ? `${ad}, ` : ""}7 günlük pulsuz sınaq müddətin başa çatıb. Davam etmək üçün abunə ol —
          obyektlərinin, müştərilərinin və sövdələşmələrinin bütün datası qorunub saxlanılır.
        </p>
        <a
          href={`https://wa.me/994552107111?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 block w-full rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
        >
          WhatsApp ilə əlaqə saxla
        </a>
        <button onClick={onLogout} className="text-sm text-white/40 transition-colors hover:text-white">
          Çıxış et
        </button>
      </div>
    </div>
  );
}

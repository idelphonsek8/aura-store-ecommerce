import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, User, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/mon-compte", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/mon-compte/commandes", label: "Mes commandes", icon: Package },
  { to: "/mon-compte/profil", label: "Mon profil", icon: User },
  { to: "/mon-compte/securite", label: "Sécurité", icon: ShieldCheck },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 border-b border-border">
            <Link to="/"><img src="/logo.png" alt="Aura Store" className="h-8 w-auto" /></Link>
        <p className="text-xs text-ink-tertiary mt-1">Espace client</p>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive ? "bg-ink text-white" : "text-ink-secondary hover:bg-muted"
              }`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-border">
        <p className="px-3 text-xs text-ink-tertiary mb-2 truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error-bg"
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function CustomerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-border bg-surface">
        <SidebarContent />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface shadow-level3">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="lg:hidden sticky top-0 z-30 bg-surface border-b border-border h-14 flex items-center px-4 gap-3">
          <button onClick={() => setDrawerOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted">
            <Menu size={20} />
          </button>
          <span className="font-display font-semibold text-sm">Espace client</span>
        </div>
        <main className="flex-1 p-4 md:p-8 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

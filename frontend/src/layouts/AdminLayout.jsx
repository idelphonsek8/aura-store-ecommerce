import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Users, Package, Tag, Settings, LogOut, Menu, X, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/produits", label: "Produits", icon: Package },
  { to: "/admin/categories", label: "Catégories", icon: Tag },
];

function SidebarContent({ collapsed, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/connexion");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 border-b border-border-strong flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-display font-bold text-ink">A</div>
        {!collapsed && <span className="font-display font-bold text-white">Aura Admin</span>}
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            title={label}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive ? "bg-white text-ink" : "text-white/70 hover:bg-white/10"
              }`
            }
          >
            <Icon size={18} /> {!collapsed && label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        {!collapsed && <p className="px-3 text-xs text-white/50 mb-2 truncate">{user?.email}</p>}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10"
          title="Déconnexion"
        >
          <LogOut size={18} /> {!collapsed && "Déconnexion"}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside
        className={`hidden lg:flex flex-col bg-ink shrink-0 transition-all ${collapsed ? "w-20" : "w-64"}`}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-ink shadow-level3">
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-surface border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={20} />
            </button>
            <button
              className="hidden lg:flex w-9 h-9 items-center justify-center rounded-lg hover:bg-muted"
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
            </button>
            <span className="font-display font-semibold text-ink">Administration</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-display font-semibold text-sm text-ink">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <span className="hidden md:inline text-sm font-medium text-ink">{user?.first_name} {user?.last_name}</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

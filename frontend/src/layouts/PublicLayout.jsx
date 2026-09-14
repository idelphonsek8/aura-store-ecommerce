import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const navLinks = [
  { to: "/", label: "Accueil", end: true },
  { to: "/produits", label: "Produits" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur border-b border-border">
        <div className="max-w-container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Aura Store" className="h-14 w-auto -my-2" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? "text-ink" : "text-ink-secondary hover:text-ink"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/panier")}
              className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted"
              aria-label="Panier"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <Link
                to="/mon-compte"
                className="hidden md:flex items-center gap-2 text-sm font-medium text-ink hover:text-accent"
              >
                <User size={18} /> Mon compte
              </Link>
            ) : (
              <Link
                to="/connexion"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-xl bg-ink text-white text-sm font-semibold hover:bg-[#27272A]"
              >
                Connexion
              </Link>
            )}

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-ink py-2"
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to={user ? "/mon-compte" : "/connexion"}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-white bg-ink rounded-xl px-4 py-3 text-center"
            >
              {user ? "Mon compte" : "Connexion"}
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface mt-16">
        <div className="max-w-container mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
                <img src="/logo.png" alt="Aura Store" className="h-16 w-auto mb-2" />
            <p className="text-sm text-ink-secondary">
              Une sélection minimaliste et élégante pour votre quotidien.
            </p>
          </div>
          <div>
            <p className="font-display font-semibold text-sm mb-3">Navigation</p>
            <div className="flex flex-col gap-2 text-sm text-ink-secondary">
              <Link to="/produits">Produits</Link>
              <Link to="/a-propos">À propos</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div>
            <p className="font-display font-semibold text-sm mb-3">Coordonnées</p>
            <div className="flex flex-col gap-2 text-sm text-ink-secondary">
              <span>Cotonou, Bénin</span>
              <span>contact@aurastore.com</span>
              <span>+229 90 00 00 00</span>
            </div>
          </div>
          <div>
            <p className="font-display font-semibold text-sm mb-3">Suivez-nous</p>
            <div className="flex flex-col gap-2 text-sm text-ink-secondary">
              <span>Instagram</span>
              <span>Facebook</span>
              <span>TikTok</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-container mx-auto px-4 md:px-6 py-4 text-xs text-ink-tertiary flex flex-col md:flex-row justify-between gap-2">
            <span>© 2026 Aura Store. Tous droits réservés.</span>
            <span>Mentions légales · Confidentialité · CGV</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
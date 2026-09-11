import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../utils/format";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleAdd = (e) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    addItem(product, 1);
    showToast(`${product.name} ajouté au panier`);
  };

  return (
    <Link
      to={`/produits/${product.id}`}
      className="group block bg-surface border border-border rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-level2 hover:border-border-strong"
    >
      <div className="relative aspect-[4/5] bg-muted overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-tertiary text-sm">
            Aucune image
          </div>
        )}
        {product.stock <= 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-display font-semibold text-ink-tertiary">
            Rupture de stock
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-display font-semibold tracking-wide uppercase text-ink-tertiary mb-1">
          {product.category_name}
        </p>
        <h3 className="font-display font-semibold text-sm text-ink line-clamp-2 mb-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-ink">{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-ink text-white hover:bg-[#27272A] disabled:opacity-30 disabled:cursor-not-allowed transition"
            aria-label="Ajouter au panier"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}

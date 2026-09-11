import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";

const DELIVERY_FEE = 2000;

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-container mx-auto px-4 md:px-6 py-16">
        <EmptyState
          icon={<ShoppingBag size={40} />}
          title="Votre panier est vide"
          description="Parcourez notre catalogue pour trouver des produits qui vous plaisent."
          action={<Button as={Link} to="/produits">Voir les produits</Button>}
        />
      </div>
    );
  }

  const total = subtotal + DELIVERY_FEE;

  return (
    <div className="max-w-container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-display font-bold text-ink mb-8">Mon panier</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 bg-surface border border-border rounded-xl p-4">
              <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-lg bg-muted overflow-hidden">
                {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <Link to={`/produits/${product.id}`} className="font-display font-semibold text-sm text-ink hover:underline line-clamp-2">
                    {product.name}
                  </Link>
                  <button onClick={() => removeItem(product.id)} className="text-ink-tertiary hover:text-error shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center h-8 rounded-lg bg-muted border border-border">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-full flex items-center justify-center active:scale-90">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="w-8 h-full flex items-center justify-center active:scale-90 disabled:opacity-30"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="font-display font-semibold text-sm text-ink">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 h-fit sticky top-24">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">Résumé</h2>
          <div className="flex justify-between text-sm text-ink-secondary mb-2">
            <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-secondary mb-4">
            <span>Livraison</span><span>{formatPrice(DELIVERY_FEE)}</span>
          </div>
          <div className="flex justify-between font-display font-bold text-ink text-lg border-t border-border pt-4 mb-6">
            <span>Total</span><span>{formatPrice(total)}</span>
          </div>
          <Button variant="primary" size="lg" className="w-full mb-3" onClick={() => navigate("/commande")}>
            Passer la commande
          </Button>
          <Button as={Link} to="/produits" variant="secondary" size="lg" className="w-full">
            Continuer mes achats
          </Button>
        </div>
      </div>
    </div>
  );
}

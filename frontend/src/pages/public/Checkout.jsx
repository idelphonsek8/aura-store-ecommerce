import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../api/orders";
import { formatPrice } from "../../utils/format";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";

const DELIVERY_FEE = { STANDARD: 2000, RETRAIT: 0 };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: user?.first_name || "", last_name: user?.last_name || "",
    phone: user?.phone || "", email: user?.email || "",
    delivery_address: user?.address || "", city: "", area: "", extra_info: "",
    delivery_method: "STANDARD",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return <Navigate to="/connexion" state={{ from: { pathname: "/commande" } }} replace />;
  }
  if (items.length === 0) {
    return <Navigate to="/panier" replace />;
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const deliveryFee = DELIVERY_FEE[form.delivery_method];
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const order = await createOrder({
        ...form,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      clearCart();
      navigate(`/commande/confirmation/${order.id}`, { state: { order } });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const flat = {};
        Object.entries(data).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(flat);
      } else {
        setErrors({ general: "Impossible de valider la commande. Veuillez réessayer." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-display font-bold text-ink mb-8">Finaliser ma commande</h1>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {errors.general && <p className="text-sm text-error bg-error-bg rounded-lg px-3 py-2">{errors.general}</p>}
          {errors.items && <p className="text-sm text-error bg-error-bg rounded-lg px-3 py-2">{errors.items}</p>}

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Informations personnelles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Prénom" value={form.first_name} onChange={set("first_name")} required />
              <Input label="Nom" value={form.last_name} onChange={set("last_name")} required />
              <Input label="Téléphone" value={form.phone} onChange={set("phone")} required />
              <Input label="Email" type="email" value={form.email} onChange={set("email")} required />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Livraison</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {[
                { value: "STANDARD", label: "Livraison standard", desc: `+ ${formatPrice(2000)}` },
                { value: "RETRAIT", label: "Retrait en boutique", desc: "Gratuit" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-col gap-1 border rounded-xl p-4 cursor-pointer ${form.delivery_method === opt.value ? "border-ink ring-2 ring-ink/10" : "border-border"}`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio" name="delivery_method" value={opt.value}
                      checked={form.delivery_method === opt.value}
                      onChange={set("delivery_method")}
                    />
                    <span className="text-sm font-medium text-ink">{opt.label}</span>
                  </div>
                  <span className="text-xs text-ink-tertiary ml-6">{opt.desc}</span>
                </label>
              ))}
            </div>

            {form.delivery_method === "STANDARD" && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Adresse" className="sm:col-span-2" value={form.delivery_address} onChange={set("delivery_address")} error={errors.delivery_address} required />
                <Input label="Ville" value={form.city} onChange={set("city")} />
                <Input label="Quartier" value={form.area} onChange={set("area")} />
                <Input label="Informations complémentaires" className="sm:col-span-2" value={form.extra_info} onChange={set("extra_info")} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 h-fit sticky top-24">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">Résumé de la commande</h2>
          <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span className="text-ink-secondary">{product.name} × {quantity}</span>
                <span className="font-medium text-ink">{formatPrice(product.price * quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-ink-secondary">
              <span>Sous-total</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink-secondary">
              <span>Frais de livraison</span><span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-display font-bold text-ink text-lg pt-2">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full mt-6" disabled={submitting}>
            {submitting ? "Validation..." : "Confirmer ma commande"}
          </Button>
        </div>
      </form>
    </div>
  );
}

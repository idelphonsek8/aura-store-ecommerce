import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { fetchMyOrder } from "../../api/orders";
import { formatPrice, formatDate, formatDateTime } from "../../utils/format";
import { StatusBadge } from "../../components/Badge";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";

const FLOW = ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "EXPEDIEE", "LIVREE"];
const FLOW_LABELS = {
  EN_ATTENTE: "Commande passée", CONFIRMEE: "Confirmée",
  EN_PREPARATION: "En préparation", EXPEDIEE: "Expédiée", LIVREE: "Livrée",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchMyOrder(id).then((o) => { setOrder(o); setStatus("success"); }).catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") return <Loader />;
  if (status === "error" || !order) return <ErrorState message="Cette commande est introuvable ou ne vous appartient pas." />;

  const currentIndex = FLOW.indexOf(order.status);

  return (
    <div>
      <Link to="/mon-compte/commandes" className="text-sm text-ink-secondary hover:text-ink">← Retour aux commandes</Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">{order.order_number}</h1>
          <p className="text-sm text-ink-secondary">{formatDateTime(order.created_at)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Progress tracker */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-8">
        {order.status === "ANNULEE" ? (
          <div className="flex items-center gap-3 text-error">
            <X size={20} /> <span className="font-display font-semibold">Commande annulée</span>
          </div>
        ) : (
          <div className="flex items-center">
            {FLOW.map((step, i) => (
              <div key={step} className="flex-1 flex items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentIndex ? "bg-ink text-white" : "bg-muted text-ink-tertiary"}`}>
                    {i < currentIndex ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="text-xs text-center text-ink-secondary max-w-[5rem]">{FLOW_LABELS[step]}</span>
                </div>
                {i < FLOW.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < currentIndex ? "bg-ink" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="font-display font-semibold text-ink mb-4">Produits</h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-surface border border-border rounded-xl p-4">
                <div>
                  <p className="font-medium text-sm text-ink">{item.product_name}</p>
                  <p className="text-xs text-ink-tertiary">Quantité : {item.quantity} × {formatPrice(item.unit_price)}</p>
                </div>
                <span className="font-display font-semibold text-sm text-ink">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display font-semibold text-ink mb-4">Détails</h2>
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 text-sm">
            <div>
              <p className="text-ink-tertiary text-xs mb-1">Adresse</p>
              <p className="text-ink">{order.delivery_address || "—"} {order.city && `, ${order.city}`}</p>
            </div>
            <div>
              <p className="text-ink-tertiary text-xs mb-1">Livraison</p>
              <p className="text-ink">{order.delivery_method === "STANDARD" ? "Livraison standard" : "Retrait en boutique"}</p>
            </div>
            <div className="border-t border-border pt-3 flex flex-col gap-1">
              <div className="flex justify-between"><span className="text-ink-secondary">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-ink-secondary">Livraison</span><span>{formatPrice(order.delivery_fee)}</span></div>
              <div className="flex justify-between font-display font-bold text-ink pt-1"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

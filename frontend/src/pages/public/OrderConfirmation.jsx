import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { fetchMyOrder } from "../../api/orders";
import { formatPrice, formatDateTime } from "../../utils/format";
import { StatusBadge } from "../../components/Badge";
import Button from "../../components/Button";
import Loader from "../../components/Loader";

export default function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order) return;
    fetchMyOrder(id).then(setOrder).finally(() => setLoading(false));
  }, [id, order]);

  if (loading) return <Loader />;
  if (!order) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={32} className="text-success" />
      </div>
      <h1 className="text-2xl font-display font-bold text-ink mb-2">Commande enregistrée avec succès</h1>
      <p className="text-ink-secondary mb-8">Merci pour votre confiance. Un récapitulatif vous a été envoyé par email.</p>

      <div className="bg-surface border border-border rounded-xl p-6 text-left mb-8">
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-ink-secondary text-sm">Numéro de commande</span>
          <span className="font-display font-semibold text-ink">{order.order_number}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-ink-secondary text-sm">Date</span>
          <span className="font-medium text-ink text-sm">{formatDateTime(order.created_at)}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-border">
          <span className="text-ink-secondary text-sm">Montant</span>
          <span className="font-medium text-ink text-sm">{formatPrice(order.total)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-ink-secondary text-sm">Statut</span>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button as={Link} to={`/mon-compte/commandes/${order.id}`} size="lg">Suivre ma commande</Button>
        <Button as={Link} to="/produits" variant="secondary" size="lg">Retour à la boutique</Button>
      </div>
    </div>
  );
}

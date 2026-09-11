import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAdminOrder, updateOrderStatus } from "../../api/admin";
import { formatPrice, formatDateTime } from "../../utils/format";
import { StatusBadge, STATUS_LABELS } from "../../components/Badge";
import { useToast } from "../../context/ToastContext";
import Select from "../../components/Select";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [newStatus, setNewStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    fetchAdminOrder(id)
      .then((o) => { setOrder(o); setNewStatus(o.status); setStatus("success"); })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrder(updated);
      showToast("Statut mis à jour avec succès.");
    } catch {
      showToast("Impossible de mettre à jour le statut.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return <Loader />;
  if (status === "error" || !order) return <ErrorState message="Commande introuvable." />;

  return (
    <div>
      <Link to="/admin/commandes" className="text-sm text-ink-secondary hover:text-ink">← Retour aux commandes</Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">{order.order_number}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Informations</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><p className="text-ink-tertiary text-xs">Client</p><p className="text-ink font-medium">{order.customer_name}</p></div>
              <div><p className="text-ink-tertiary text-xs">Email</p><p className="text-ink font-medium">{order.customer_email}</p></div>
              <div><p className="text-ink-tertiary text-xs">Téléphone</p><p className="text-ink font-medium">{order.phone}</p></div>
              <div><p className="text-ink-tertiary text-xs">Date</p><p className="text-ink font-medium">{formatDateTime(order.created_at)}</p></div>
              <div className="sm:col-span-2"><p className="text-ink-tertiary text-xs">Adresse</p><p className="text-ink font-medium">{order.delivery_address}, {order.city} {order.area}</p></div>
              <div><p className="text-ink-tertiary text-xs">Livraison</p><p className="text-ink font-medium">{order.delivery_method === "STANDARD" ? "Standard" : "Retrait en boutique"}</p></div>
              <div><p className="text-ink-tertiary text-xs">Montant</p><p className="text-ink font-medium">{formatPrice(order.total)}</p></div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Produits</h2>
            <div className="flex flex-col gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-medium text-ink">{item.product_name}</p>
                    <p className="text-xs text-ink-tertiary">{item.quantity} × {formatPrice(item.unit_price)}</p>
                  </div>
                  <span className="font-display font-semibold text-ink">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Historique des statuts</h2>
            <div className="flex flex-col gap-3">
              {order.status_history.map((h) => (
                <div key={h.id} className="flex justify-between text-sm">
                  <span className="text-ink-secondary">
                    {h.old_status ? `${STATUS_LABELS[h.old_status]} → ` : ""}{STATUS_LABELS[h.new_status]}
                    {h.changed_by_name && <span className="text-ink-tertiary"> par {h.changed_by_name}</span>}
                  </span>
                  <span className="text-ink-tertiary text-xs">{formatDateTime(h.changed_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 h-fit sticky top-24">
          <h2 className="font-display font-semibold text-ink mb-4">Changer le statut</h2>
          <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="mb-4">
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
          <Button onClick={handleSave} disabled={saving || newStatus === order.status} className="w-full">
            {saving ? "Enregistrement..." : "Enregistrer le statut"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchAdminCustomer } from "../../api/admin";
import { formatPrice, formatDate } from "../../utils/format";
import { StatusBadge } from "../../components/Badge";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchAdminCustomer(id).then((d) => { setData(d); setStatus("success"); }).catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") return <Loader />;
  if (status === "error" || !data) return <ErrorState message="Client introuvable." />;

  const { customer, stats, orders } = data;

  return (
    <div>
      <Link to="/admin/clients" className="text-sm text-ink-secondary hover:text-ink">← Retour aux clients</Link>

      <div className="grid md:grid-cols-3 gap-8 mt-4">
        <div className="md:col-span-1">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-1">{customer.first_name} {customer.last_name}</h2>
            <p className="text-sm text-ink-secondary mb-4">Client depuis le {formatDate(customer.created_at)}</p>
            <div className="flex flex-col gap-2 text-sm">
              <div><span className="text-ink-tertiary">Email : </span>{customer.email}</div>
              <div><span className="text-ink-tertiary">Téléphone : </span>{customer.phone || "—"}</div>
              <div><span className="text-ink-tertiary">Adresse : </span>{customer.address || "—"}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <p className="text-xl font-display font-bold text-ink">{stats.orders_count}</p>
              <p className="text-xs text-ink-secondary mt-1">Commandes</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <p className="text-xl font-display font-bold text-ink">{stats.orders_delivered}</p>
              <p className="text-xs text-ink-secondary mt-1">Livrées</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <p className="text-sm font-display font-bold text-ink">{formatPrice(stats.total_spent)}</p>
              <p className="text-xs text-ink-secondary mt-1">Total dépensé</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="font-display font-semibold text-ink mb-4">Historique des commandes</h2>
          <div className="flex flex-col gap-3">
            {orders.length === 0 && <p className="text-sm text-ink-tertiary">Aucune commande pour ce client.</p>}
            {orders.map((o) => (
              <Link key={o.id} to={`/admin/commandes/${o.id}`} className="flex justify-between items-center bg-surface border border-border rounded-xl p-4 hover:border-border-strong">
                <div>
                  <p className="font-medium text-sm text-ink">{o.order_number}</p>
                  <p className="text-xs text-ink-tertiary">{formatDate(o.created_at)}</p>
                </div>
                <span className="text-sm font-medium text-ink">{formatPrice(o.total)}</span>
                <StatusBadge status={o.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

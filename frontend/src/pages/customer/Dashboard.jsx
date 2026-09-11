import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, CheckCircle2 } from "lucide-react";
import { fetchMyOrders } from "../../api/orders";
import { useAuth } from "../../context/AuthContext";
import { formatPrice, formatDate } from "../../utils/format";
import { StatusBadge } from "../../components/Badge";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import DataTable from "../../components/DataTable";

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    fetchMyOrders({ page_size: 5 }).then((d) => setOrders(d.results));
  }, []);

  if (orders === null) return <Loader />;

  const total = orders.length;
  const enCours = orders.filter((o) => !["LIVREE", "ANNULEE"].includes(o.status)).length;
  const livrees = orders.filter((o) => o.status === "LIVREE").length;

  const columns = [
    { key: "order_number", header: "Numéro", render: (r) => <Link to={`/mon-compte/commandes/${r.id}`} className="font-medium text-ink hover:underline">{r.order_number}</Link> },
    { key: "created_at", header: "Date", render: (r) => formatDate(r.created_at) },
    { key: "total", header: "Montant", render: (r) => formatPrice(r.total) },
    { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
    { key: "action", header: "", render: (r) => <Link to={`/mon-compte/commandes/${r.id}`} className="text-accent text-sm font-medium hover:underline">Voir</Link> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-ink mb-1">Bonjour, {user?.first_name}</h1>
      <p className="text-ink-secondary mb-8">Voici un aperçu de votre activité.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Commandes totales", value: total, icon: Package },
          { label: "Commandes en cours", value: enCours, icon: Clock },
          { label: "Commandes livrées", value: livrees, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Icon size={20} className="text-ink" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-ink">{value}</p>
              <p className="text-xs text-ink-secondary">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display font-semibold text-lg text-ink mb-4">Dernières commandes</h2>
      {orders.length === 0 ? (
        <EmptyState title="Vous n'avez pas encore de commande" description="Découvrez notre catalogue pour passer votre première commande." />
      ) : (
        <DataTable columns={columns} data={orders} />
      )}
    </div>
  );
}

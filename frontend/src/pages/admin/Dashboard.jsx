import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Clock, Users, Package, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fetchDashboard } from "../../api/admin";
import { formatPrice, formatDate } from "../../utils/format";
import { StatusBadge } from "../../components/Badge";
import Loader from "../../components/Loader";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { fetchDashboard().then(setData); }, []);

  if (!data) return <Loader />;

  const cards = [
    { label: "Commandes du jour", value: data.orders_today, icon: ShoppingBag },
    { label: "Commandes en attente", value: data.orders_pending, icon: Clock },
    { label: "Total clients", value: data.total_customers, icon: Users },
    { label: "Produits actifs", value: data.active_products, icon: Package },
    { label: "Chiffre d'affaires", value: formatPrice(data.revenue), icon: DollarSign },
  ];

  return (
    <div className="relative">
      <div
        className="pointer-events-none fixed inset-0 bg-no-repeat bg-center opacity-[0.06]"
        style={{ backgroundImage: "url('/logo.png')", backgroundSize: "480px" }}
      />
      <div className="relative">
        <h1 className="text-2xl font-display font-bold text-ink mb-6">Tableau de bord</h1>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {cards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-surface border border-border rounded-xl p-5">
              <Icon size={18} className="text-ink-tertiary mb-3" />
              <p className="text-xl font-display font-bold text-ink">{value}</p>
              <p className="text-xs text-ink-secondary mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 mb-8">
          <h2 className="font-display font-semibold text-ink mb-4">Évolution des ventes (14 derniers jours)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.sales_series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
              <XAxis dataKey="date" tickFormatter={(d) => formatDate(d).slice(0, 6)} tick={{ fontSize: 11, fill: "#A1A1AA" }} />
              <YAxis tick={{ fontSize: 11, fill: "#A1A1AA" }} />
              <Tooltip formatter={(v) => formatPrice(v)} labelFormatter={(d) => formatDate(d)} />
              <Line type="monotone" dataKey="total" stroke="#09090B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Dernières commandes</h2>
            <div className="flex flex-col gap-3">
              {data.recent_orders.map((o) => (
                <Link key={o.id} to={`/admin/commandes/${o.id}`} className="flex justify-between items-center text-sm hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-lg">
                  <span className="font-medium text-ink">{o.order_number}</span>
                  <span className="text-ink-secondary">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                </Link>
              ))}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Produits en stock faible</h2>
            <div className="flex flex-col gap-3">
              {data.low_stock_products.length === 0 && <p className="text-sm text-ink-tertiary">Aucun produit à signaler.</p>}
              {data.low_stock_products.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm">
                  <span className="text-ink">{p.name}</span>
                  <span className="font-medium text-warning">{p.stock} en stock</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
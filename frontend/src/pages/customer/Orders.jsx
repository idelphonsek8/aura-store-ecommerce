import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Package } from "lucide-react";
import { fetchMyOrders } from "../../api/orders";
import { formatPrice, formatDate } from "../../utils/format";
import { StatusBadge } from "../../components/Badge";
import { STATUS_LABELS } from "../../components/Badge";
import Select from "../../components/Select";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const navigate = useNavigate();
  const page = Number(searchParams.get("page") || 1);

  const load = useCallback(() => {
    fetchMyOrders(Object.fromEntries(searchParams.entries())).then(setData);
  }, [searchParams]);

  useEffect(() => { load(); }, [load]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  if (!data) return <Loader />;

  const totalPages = Math.ceil(data.count / 10) || 1;

  const columns = [
    { key: "order_number", header: "Numéro" },
    { key: "created_at", header: "Date", render: (r) => formatDate(r.created_at) },
    { key: "items_count", header: "Articles", render: (r) => `${r.items_count} article${r.items_count > 1 ? "s" : ""}` },
    { key: "total", header: "Montant", render: (r) => formatPrice(r.total) },
    { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
    { key: "action", header: "", render: (r) => <Link to={`/mon-compte/commandes/${r.id}`} className="text-accent text-sm font-medium hover:underline">Voir</Link> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-ink mb-6">Mes commandes</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); updateParam("search", search); }} className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par numéro..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </form>
        <Select className="sm:w-56" value={searchParams.get("status") || ""} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>

      {data.results.length === 0 ? (
        <EmptyState icon={<Package size={36} />} title="Aucune commande trouvée" description="Modifiez vos filtres ou passez votre première commande." />
      ) : (
        <>
          <DataTable columns={columns} data={data.results} onRowClick={(r) => navigate(`/mon-compte/commandes/${r.id}`)} />
          <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParam("page", p)} />
        </>
      )}
    </div>
  );
}

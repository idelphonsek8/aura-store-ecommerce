import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { fetchAdminOrders } from "../../api/admin";
import { formatPrice, formatDate } from "../../utils/format";
import { StatusBadge, STATUS_LABELS } from "../../components/Badge";
import Select from "../../components/Select";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const navigate = useNavigate();
  const page = Number(searchParams.get("page") || 1);

  const load = useCallback(() => {
    fetchAdminOrders(Object.fromEntries(searchParams.entries())).then(setData);
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
    { key: "customer_name", header: "Client" },
    { key: "created_at", header: "Date", render: (r) => formatDate(r.created_at) },
    { key: "total", header: "Montant", render: (r) => formatPrice(r.total) },
    { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
    { key: "action", header: "", render: () => <span className="text-accent text-sm font-medium">Voir</span> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-ink mb-6">Commandes</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); updateParam("search", search); }} className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher (numéro, client, email)..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </form>
        <Select className="sm:w-56" value={searchParams.get("status") || ""} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>

      {data.results.length === 0 ? (
        <EmptyState title="Aucune commande trouvée" description="Modifiez vos filtres de recherche." />
      ) : (
        <>
          <DataTable columns={columns} data={data.results} onRowClick={(r) => navigate(`/admin/commandes/${r.id}`)} />
          <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParam("page", p)} />
        </>
      )}
    </div>
  );
}

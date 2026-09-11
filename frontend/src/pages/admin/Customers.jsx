import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Users } from "lucide-react";
import { fetchAdminCustomers } from "../../api/admin";
import { formatPrice, formatDate } from "../../utils/format";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";

export default function AdminCustomers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const navigate = useNavigate();
  const page = Number(searchParams.get("page") || 1);

  const load = useCallback(() => {
    fetchAdminCustomers(Object.fromEntries(searchParams.entries())).then(setData);
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
    { key: "name", header: "Client", render: (r) => `${r.first_name} ${r.last_name}` },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "created_at", header: "Inscription", render: (r) => formatDate(r.created_at) },
    { key: "orders_count", header: "Commandes" },
    { key: "orders_total", header: "Montant cumulé", render: (r) => formatPrice(r.orders_total) },
    { key: "action", header: "", render: () => <span className="text-accent text-sm font-medium">Voir</span> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-ink mb-6">Clients</h1>

      <form onSubmit={(e) => { e.preventDefault(); updateParam("search", search); }} className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
        />
      </form>

      {data.results.length === 0 ? (
        <EmptyState icon={<Users size={36} />} title="Aucun client trouvé" />
      ) : (
        <>
          <DataTable columns={columns} data={data.results} onRowClick={(r) => navigate(`/admin/clients/${r.id}`)} />
          <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParam("page", p)} />
        </>
      )}
    </div>
  );
}

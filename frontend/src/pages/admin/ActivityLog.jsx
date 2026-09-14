import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ScrollText } from "lucide-react";
import { fetchActivityLog } from "../../api/admin";
import { formatDateTime } from "../../utils/format";
import DataTable from "../../components/DataTable";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import Select from "../../components/Select";
import Pagination from "../../components/Pagination";

const ACTION_LABELS = {
  LOGIN: "Connexion",
  LOGOUT: "Déconnexion",
  REGISTER: "Inscription",
  PASSWORD_CHANGED: "Mot de passe modifié",
  PROFILE_UPDATED: "Profil modifié",
  ORDER_CREATED: "Commande créée",
  ORDER_STATUS_CHANGED: "Statut de commande modifié",
  PRODUCT_CREATED: "Produit créé",
  PRODUCT_UPDATED: "Produit modifié",
  CATEGORY_CREATED: "Catégorie créée",
  CATEGORY_UPDATED: "Catégorie modifiée",
  MANAGER_CREATED: "Gestionnaire créé",
  MANAGER_UPDATED: "Gestionnaire modifié",
};

const ROLE_LABELS = { CLIENT: "Client", MANAGER: "Gestionnaire", ADMIN: "Administrateur" };

export default function AdminActivityLog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const page = Number(searchParams.get("page") || 1);

  const load = useCallback(() => {
    fetchActivityLog(Object.fromEntries(searchParams.entries())).then(setData);
  }, [searchParams]);

  useEffect(() => { load(); }, [load]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  if (!data) return <Loader />;
  const totalPages = Math.ceil(data.count / 20) || 1;

  const columns = [
    { key: "created_at", header: "Date", render: (r) => formatDateTime(r.created_at) },
    { key: "user_email", header: "Utilisateur" },
    { key: "role", header: "Rôle", render: (r) => ROLE_LABELS[r.role] || r.role || "—" },
    { key: "action", header: "Action", render: (r) => ACTION_LABELS[r.action] || r.action },
    { key: "description", header: "Détail", render: (r) => r.description || "—" },
    { key: "ip_address", header: "Adresse IP", render: (r) => r.ip_address || "—" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-ink mb-6">Journal d'activité</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); updateParam("search", search); }} className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher (email, détail)..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </form>
        <Select className="sm:w-56" value={searchParams.get("action") || ""} onChange={(e) => updateParam("action", e.target.value)}>
          <option value="">Toutes les actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select className="sm:w-48" value={searchParams.get("role") || ""} onChange={(e) => updateParam("role", e.target.value)}>
          <option value="">Tous les rôles</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>

      {data.results.length === 0 ? (
        <EmptyState icon={<ScrollText size={36} />} title="Aucune activité trouvée" description="Modifiez vos filtres de recherche." />
      ) : (
        <>
          <DataTable columns={columns} data={data.results} keyField="id" />
          <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParam("page", p)} />
        </>
      )}
    </div>
  );
}
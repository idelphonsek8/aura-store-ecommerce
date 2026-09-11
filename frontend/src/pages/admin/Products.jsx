import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Search, Plus, Package } from "lucide-react";
import { fetchAdminProducts, fetchAdminCategories, updateAdminProduct } from "../../api/admin";
import { formatPrice } from "../../utils/format";
import { useToast } from "../../context/ToastContext";
import Select from "../../components/Select";
import Button from "../../components/Button";
import DataTable from "../../components/DataTable";
import EmptyState from "../../components/EmptyState";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { ConfirmModal } from "../../components/Modal";

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [confirmProduct, setConfirmProduct] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const page = Number(searchParams.get("page") || 1);

  const load = useCallback(() => {
    fetchAdminProducts(Object.fromEntries(searchParams.entries())).then(setData);
  }, [searchParams]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchAdminCategories().then(setCategories); }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const toggleActive = async () => {
    const fd = new FormData();
    fd.append("is_active", (!confirmProduct.is_active).toString());
    await updateAdminProduct(confirmProduct.id, fd);
    showToast(confirmProduct.is_active ? "Produit désactivé." : "Produit activé.");
    setConfirmProduct(null);
    load();
  };

  if (!data) return <Loader />;
  const totalPages = Math.ceil(data.count / 12) || 1;

  const columns = [
    { key: "image", header: "", render: (r) => (
      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden">
        {r.image && <img src={r.image} alt="" className="w-full h-full object-cover" />}
      </div>
    ) },
    { key: "name", header: "Produit" },
    { key: "category", header: "Catégorie", render: (r) => categories.find((c) => c.id === r.category)?.name || "—" },
    { key: "price", header: "Prix", render: (r) => formatPrice(r.price) },
    { key: "stock", header: "Stock" },
    { key: "is_active", header: "Statut", render: (r) => (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.is_active ? "bg-success-bg text-success" : "bg-muted text-ink-tertiary"}`}>
        {r.is_active ? "Actif" : "Inactif"}
      </span>
    ) },
    { key: "actions", header: "Actions", render: (r) => (
      <div className="flex gap-3 text-sm font-medium" onClick={(e) => e.stopPropagation()}>
        <Link to={`/admin/produits/${r.id}/modifier`} className="text-accent hover:underline">Modifier</Link>
        <button onClick={() => setConfirmProduct(r)} className="text-ink-secondary hover:underline">
          {r.is_active ? "Désactiver" : "Activer"}
        </button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Produits</h1>
        <Button as={Link} to="/admin/produits/nouveau"><Plus size={16} /> Ajouter un produit</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={(e) => { e.preventDefault(); updateParam("search", search); }} className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </form>
        <Select className="sm:w-48" value={searchParams.get("category") || ""} onChange={(e) => updateParam("category", e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select className="sm:w-40" value={searchParams.get("status") || ""} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="">Tous statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </Select>
        <Select className="sm:w-40" value={searchParams.get("stock") || ""} onChange={(e) => updateParam("stock", e.target.value)}>
          <option value="">Tout stock</option>
          <option value="low">Stock faible</option>
          <option value="out">Rupture</option>
        </Select>
      </div>

      {data.results.length === 0 ? (
        <EmptyState icon={<Package size={36} />} title="Aucun produit trouvé" />
      ) : (
        <>
          <DataTable columns={columns} data={data.results} onRowClick={(r) => navigate(`/admin/produits/${r.id}/modifier`)} />
          <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParam("page", p)} />
        </>
      )}

      <ConfirmModal
        open={!!confirmProduct}
        onClose={() => setConfirmProduct(null)}
        onConfirm={toggleActive}
        title={confirmProduct?.is_active ? "Désactiver le produit ?" : "Activer le produit ?"}
        message={`Voulez-vous vraiment ${confirmProduct?.is_active ? "désactiver" : "activer"} « ${confirmProduct?.name} » ?`}
        confirmLabel={confirmProduct?.is_active ? "Désactiver" : "Activer"}
        danger={confirmProduct?.is_active}
      />
    </div>
  );
}

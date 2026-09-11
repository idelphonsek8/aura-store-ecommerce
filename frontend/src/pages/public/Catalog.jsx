import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, PackageX } from "lucide-react";
import { fetchProducts, fetchCategories } from "../../api/catalog";
import ProductCard from "../../components/ProductCard";
import { Skeleton } from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import Pagination from "../../components/Pagination";
import Select from "../../components/Select";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const page = Number(searchParams.get("page") || 1);
  const pageSize = 12;

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const params = Object.fromEntries(searchParams.entries());
      const data = await fetchProducts(params);
      setProducts(data.results);
      setCount(data.count);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam("search", searchInput);
  };

  const totalPages = Math.ceil(count / pageSize) || 1;

  return (
    <div className="max-w-container mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-display font-bold text-ink mb-2">Nos produits</h1>
      <p className="text-ink-secondary mb-8">{count} article{count !== 1 ? "s" : ""} disponible{count !== 1 ? "s" : ""}</p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <aside className="lg:w-64 shrink-0 flex flex-col gap-5">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </form>

          <div>
            <h3 className="font-display font-semibold text-sm text-ink mb-2">Catégorie</h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              <button
                onClick={() => updateParam("category", "")}
                className={`text-left px-3 py-2 rounded-lg text-sm ${!searchParams.get("category") ? "bg-ink text-white" : "hover:bg-muted text-ink-secondary"}`}
              >
                Toutes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam("category", cat.slug)}
                  className={`text-left px-3 py-2 rounded-lg text-sm ${searchParams.get("category") === cat.slug ? "bg-ink text-white" : "hover:bg-muted text-ink-secondary"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-ink mb-2">Disponibilité</h3>
            <Select
              value={searchParams.get("availability") || ""}
              onChange={(e) => updateParam("availability", e.target.value)}
            >
              <option value="">Toutes</option>
              <option value="in_stock">En stock</option>
              <option value="out_of_stock">Rupture de stock</option>
            </Select>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-ink mb-2">Prix (FCFA)</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                defaultValue={searchParams.get("price_min") || ""}
                onBlur={(e) => updateParam("price_min", e.target.value)}
                className="w-1/2 h-10 rounded-lg border border-border px-3 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                defaultValue={searchParams.get("price_max") || ""}
                onBlur={(e) => updateParam("price_max", e.target.value)}
                className="w-1/2 h-10 rounded-lg border border-border px-3 text-sm"
              />
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-end mb-4">
            <Select
              className="w-full sm:w-56"
              value={searchParams.get("sort") || "newest"}
              onChange={(e) => updateParam("sort", e.target.value)}
            >
              <option value="newest">Nouveautés</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
            </Select>
          </div>

          {status === "loading" && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}
            </div>
          )}

          {status === "error" && <ErrorState message="Impossible de charger les produits." onRetry={load} />}

          {status === "success" && products.length === 0 && (
            <EmptyState icon={<PackageX size={40} />} title="Aucun produit trouvé" description="Essayez de modifier vos filtres de recherche." />
          )}

          {status === "success" && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={(p) => updateParam("page", p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

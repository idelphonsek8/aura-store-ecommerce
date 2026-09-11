import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Truck, ShieldCheck, MousePointerClick, Headphones, ArrowRight } from "lucide-react";
import { fetchProducts, fetchCategories } from "../../api/catalog";
import ProductCard from "../../components/ProductCard";
import { Skeleton } from "../../components/Loader";

const ADVANTAGES = [
  { icon: Truck, title: "Livraison rapide", desc: "Recevez vos commandes en un temps record, partout en ville." },
  { icon: ShieldCheck, title: "Produits de qualité", desc: "Une sélection rigoureuse pour garantir votre satisfaction." },
  { icon: MousePointerClick, title: "Commande simple", desc: "Un parcours d'achat fluide, du panier à la livraison." },
  { icon: Headphones, title: "Assistance client", desc: "Une équipe disponible pour répondre à toutes vos questions." },
];

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [newest, setNewest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [popularRes, newestRes, categoriesRes] = await Promise.all([
          fetchProducts({ page_size: 4 }),
          fetchProducts({ page_size: 4, sort: "newest" }),
          fetchCategories(),
        ]);
        setPopular(popularRes.results);
        setNewest(newestRes.results);
        setCategories(categoriesRes);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-ink leading-[1.1] mb-6">
            Un style sobre, <span className="text-accent">une qualité</span> qui dure.
          </h1>
          <p className="text-lg text-ink-secondary mb-8 max-w-md">
            Aura Store rassemble des essentiels du quotidien pensés avec soin — mode, maison et accessoires,
            dans une sélection minimaliste et élégante.
          </p>
          <Link
            to="/produits"
            className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3.5 rounded-xl font-display font-semibold hover:bg-[#27272A] transition"
          >
            Découvrir nos produits <ArrowRight size={18} />
          </Link>
        </div>
        <div className="aspect-square rounded-xl bg-muted flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
            alt="Sélection de produits Aura Store"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-container mx-auto px-4 md:px-6 py-8">
          <h2 className="text-2xl font-display font-semibold text-ink mb-6">Catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/produits?category=${cat.slug}`}
                className="rounded-xl border border-border bg-surface p-5 text-center hover:border-border-strong hover:shadow-level1 transition"
              >
                <span className="font-display font-semibold text-sm text-ink">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular products */}
      <section className="max-w-container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-semibold text-ink">Produits populaires</h2>
          <Link to="/produits" className="text-sm font-medium text-accent hover:underline">Voir tout</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)
            : popular.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Advantages */}
      <section className="bg-surface border-y border-border mt-8">
        <div className="max-w-container mx-auto px-4 md:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center md:text-left">
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mb-3 mx-auto md:mx-0">
                <Icon size={20} className="text-ink" />
              </div>
              <h3 className="font-display font-semibold text-sm text-ink mb-1">{title}</h3>
              <p className="text-xs text-ink-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New products */}
      <section className="max-w-container mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-semibold text-ink">Nouveaux produits</h2>
          <Link to="/produits?sort=newest" className="text-sm font-medium text-accent hover:underline">Voir tout</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5]" />)
            : newest.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}

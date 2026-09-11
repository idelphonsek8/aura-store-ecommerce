import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Minus, Plus, ShoppingCart, CheckCircle2, XCircle } from "lucide-react";
import { fetchProduct, fetchProducts } from "../../api/catalog";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { formatPrice } from "../../utils/format";
import Loader from "../../components/Loader";
import ErrorState from "../../components/ErrorState";
import ProductCard from "../../components/ProductCard";
import Button from "../../components/Button";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [status, setStatus] = useState("loading");
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    setStatus("loading");
    setQuantity(1);
    setActiveImage(0);
    fetchProduct(id)
      .then(async (p) => {
        setProduct(p);
        setStatus("success");
        const similarRes = await fetchProducts({ category: p.category.slug, page_size: 4 });
        setSimilar(similarRes.results.filter((sp) => sp.id !== p.id));
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") return <Loader />;
  if (status === "error" || !product) return <ErrorState message="Ce produit est introuvable." />;

  const images = [product.image, ...(product.images || []).map((i) => i.image)].filter(Boolean);
  const canIncrease = quantity < product.stock;

  const handleAdd = () => {
    addItem(product, quantity);
    showToast(`${quantity} × ${product.name} ajouté au panier`);
  };

  return (
    <div className="max-w-container mx-auto px-4 md:px-6 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-xl bg-muted overflow-hidden mb-3">
            {images.length > 0 ? (
              <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-tertiary">Aucune image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activeImage ? "border-ink" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-display font-semibold tracking-wide uppercase text-ink-tertiary mb-2">
            {product.category.name}
          </p>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink mb-3">{product.name}</h1>
          <p className="text-2xl font-display font-bold text-ink mb-4">{formatPrice(product.price)}</p>

          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-sm text-success font-medium">
                <CheckCircle2 size={16} /> En stock ({product.stock} disponible{product.stock > 1 ? "s" : ""})
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-error font-medium">
                <XCircle size={16} /> Rupture de stock
              </span>
            )}
          </div>

          <p className="text-ink-secondary mb-6">{product.description_short}</p>

          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-ink">Quantité</span>
                <div className="flex items-center h-10 rounded-lg bg-muted border border-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-full flex items-center justify-center text-ink active:scale-90"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-medium text-ink">{quantity}</span>
                  <button
                    onClick={() => canIncrease && setQuantity((q) => q + 1)}
                    disabled={!canIncrease}
                    className="w-10 h-full flex items-center justify-center text-ink active:scale-90 disabled:opacity-30"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <Button variant="primary" size="lg" onClick={handleAdd} className="w-full md:w-auto">
                <ShoppingCart size={18} /> Ajouter au panier
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-16 max-w-2xl">
        <h2 className="text-xl font-display font-semibold text-ink mb-4">Description</h2>
        <p className="text-ink-secondary leading-relaxed whitespace-pre-line">{product.description}</p>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-display font-semibold text-ink mb-6">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

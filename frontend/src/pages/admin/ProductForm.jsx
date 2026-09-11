import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchAdminProduct, createAdminProduct, updateAdminProduct, fetchAdminCategories } from "../../api/admin";
import { useToast } from "../../context/ToastContext";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import Loader from "../../components/Loader";

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "", category: "", price: "", stock: "", description_short: "", description: "", is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetchAdminProduct(id).then((p) => {
      setForm({
        name: p.name, category: p.category, price: p.price, stock: p.stock,
        description_short: p.description_short, description: p.description, is_active: p.is_active,
      });
      setImagePreview(p.image);
      setLoading(false);
    });
  }, [id, isEdit]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);

    try {
      if (isEdit) {
        await updateAdminProduct(id, fd);
        showToast("Produit modifié avec succès.");
      } else {
        await createAdminProduct(fd);
        showToast("Produit ajouté avec succès.");
      }
      navigate("/admin/produits");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const flat = {};
        Object.entries(data).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(flat);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl">
      <Link to="/admin/produits" className="text-sm text-ink-secondary hover:text-ink">← Retour aux produits</Link>
      <h1 className="text-2xl font-display font-bold text-ink mt-3 mb-6">{isEdit ? "Modifier le produit" : "Ajouter un produit"}</h1>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4">
        <Input label="Nom du produit" value={form.name} onChange={set("name")} error={errors.name} required />

        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Catégorie" value={form.category} onChange={set("category")} error={errors.category} required>
            <option value="">Sélectionner...</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Statut" value={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "true" }))}>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Prix (FCFA)" type="number" step="0.01" value={form.price} onChange={set("price")} error={errors.price} required />
          <Input label="Stock" type="number" value={form.stock} onChange={set("stock")} error={errors.stock} required />
        </div>

        <Input label="Description courte" value={form.description_short} onChange={set("description_short")} error={errors.description_short} />

        <label className="block">
          <span className="block mb-1.5 text-sm font-medium text-ink">Description complète</span>
          <textarea
            rows={5} value={form.description} onChange={set("description")}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </label>

        <div>
          <span className="block mb-1.5 text-sm font-medium text-ink">Image principale</span>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden shrink-0">
              {imagePreview && <img src={imagePreview} alt="" className="w-full h-full object-cover" />}
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="text-sm" />
          </div>
          {errors.image && <span className="block mt-1 text-xs text-error">{errors.image}</span>}
        </div>

        <div className="flex gap-3 mt-2">
          <Button type="submit" disabled={submitting}>{submitting ? "Enregistrement..." : "Enregistrer"}</Button>
          <Button as={Link} to="/admin/produits" variant="secondary" type="button">Annuler</Button>
        </div>
      </form>
    </div>
  );
}

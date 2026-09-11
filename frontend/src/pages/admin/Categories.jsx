import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { fetchAdminCategories, createAdminCategory, updateAdminCategory } from "../../api/admin";
import { useToast } from "../../context/ToastContext";
import DataTable from "../../components/DataTable";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function AdminCategories() {
  const [categories, setCategories] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const load = () => fetchAdminCategories().then(setCategories);
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", is_active: true }); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, description: cat.description, is_active: cat.is_active }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await updateAdminCategory(editing.id, form);
        showToast("Catégorie modifiée avec succès.");
      } else {
        await createAdminCategory(form);
        showToast("Catégorie ajoutée avec succès.");
      }
      setModalOpen(false);
      load();
    } catch {
      showToast("Une erreur est survenue.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (cat) => {
    await updateAdminCategory(cat.id, { is_active: !cat.is_active });
    load();
  };

  if (!categories) return <Loader />;

  const columns = [
    { key: "name", header: "Nom" },
    { key: "description", header: "Description", render: (r) => r.description || "—" },
    { key: "is_active", header: "Statut", render: (r) => (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.is_active ? "bg-success-bg text-success" : "bg-muted text-ink-tertiary"}`}>
        {r.is_active ? "Actif" : "Inactif"}
      </span>
    ) },
    { key: "actions", header: "Actions", render: (r) => (
      <div className="flex gap-3 text-sm font-medium">
        <button onClick={() => openEdit(r)} className="text-accent hover:underline">Modifier</button>
        <button onClick={() => toggleActive(r)} className="text-ink-secondary hover:underline">
          {r.is_active ? "Désactiver" : "Activer"}
        </button>
      </div>
    ) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Catégories</h1>
        <Button onClick={openCreate}><Plus size={16} /> Ajouter une catégorie</Button>
      </div>

      <DataTable columns={columns} data={categories} />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-ink hover:bg-muted">Annuler</button>
            <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2.5 rounded-xl bg-ink text-white text-sm font-semibold hover:bg-[#27272A]">
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input label="Nom" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <label className="block">
            <span className="block mb-1.5 text-sm font-medium text-ink">Description</span>
            <textarea
              rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}

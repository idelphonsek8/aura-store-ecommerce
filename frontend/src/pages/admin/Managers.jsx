import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { fetchManagers, createManager, updateManager } from "../../api/admin";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/format";
import DataTable from "../../components/DataTable";
import Loader from "../../components/Loader";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function AdminManagers() {
  const [managers, setManagers] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

   const load = () => fetchManagers().then((data) => setManagers(data.results || data));
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ first_name: "", last_name: "", email: "", phone: "", password: "" });
    setErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await createManager(form);
      showToast("Gestionnaire créé avec succès.");
      setModalOpen(false);
      load();
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

  const toggleActive = async (manager) => {
    await updateManager(manager.id, { is_active: !manager.is_active });
    showToast(manager.is_active ? "Gestionnaire désactivé." : "Gestionnaire activé.");
    load();
  };

  if (!managers) return <Loader />;

  const columns = [
    { key: "name", header: "Nom", render: (r) => `${r.first_name} ${r.last_name}` },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone", render: (r) => r.phone || "—" },
    { key: "created_at", header: "Créé le", render: (r) => formatDate(r.created_at) },
    { key: "is_active", header: "Statut", render: (r) => (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.is_active ? "bg-success-bg text-success" : "bg-muted text-ink-tertiary"}`}>
        {r.is_active ? "Actif" : "Inactif"}
      </span>
    ) },
    { key: "actions", header: "Actions", render: (r) => (
      <button onClick={() => toggleActive(r)} className="text-accent text-sm font-medium hover:underline">
        {r.is_active ? "Désactiver" : "Activer"}
      </button>
    ) },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Gestionnaires</h1>
        <Button onClick={openCreate}><Plus size={16} /> Ajouter un gestionnaire</Button>
      </div>

      {managers.length === 0 ? (
        <EmptyState icon={<Users size={36} />} title="Aucun gestionnaire" description="Ajoutez un compte gestionnaire pour déléguer le suivi des commandes." />
      ) : (
        <DataTable columns={columns} data={managers} />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nouveau gestionnaire"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-ink hover:bg-muted">Annuler</button>
            <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2.5 rounded-xl bg-ink text-white text-sm font-semibold hover:bg-[#27272A]">
              {submitting ? "Création..." : "Créer"}
            </button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {errors.general && <p className="text-sm text-error bg-error-bg rounded-lg px-3 py-2">{errors.general}</p>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prénom" value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} error={errors.first_name} required />
            <Input label="Nom" value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} error={errors.last_name} required />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} required />
          <Input label="Téléphone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} error={errors.phone} />
          <Input label="Mot de passe" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} required />
        </form>
      </Modal>
    </div>
  );
}
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../api/orders";
import { useToast } from "../../context/ToastContext";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    first_name: user?.first_name || "", last_name: user?.last_name || "",
    phone: user?.phone || "", email: user?.email || "", address: user?.address || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await updateProfile(form);
      setUser(updated);
      showToast("Profil mis à jour avec succès.");
    } catch {
      showToast("Impossible de mettre à jour le profil.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-display font-bold text-ink mb-6">Mon profil</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-surface border border-border rounded-xl p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Prénom" value={form.first_name} onChange={set("first_name")} />
          <Input label="Nom" value={form.last_name} onChange={set("last_name")} />
        </div>
        <Input label="Téléphone" value={form.phone} onChange={set("phone")} />
        <Input label="Email" type="email" value={form.email} disabled className="opacity-60 cursor-not-allowed" />
        <Input label="Adresse" value={form.address} onChange={set("address")} />
        <Button type="submit" disabled={submitting} className="self-start mt-2">
          {submitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}

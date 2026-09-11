import { useState } from "react";
import { changePassword } from "../../api/auth";
import { useToast } from "../../context/ToastContext";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function Security() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ current_password: "", new_password: "", new_password_confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await changePassword(form);
      showToast("Mot de passe modifié avec succès.");
      setForm({ current_password: "", new_password: "", new_password_confirm: "" });
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

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-display font-bold text-ink mb-6">Sécurité</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-surface border border-border rounded-xl p-6">
        <Input label="Mot de passe actuel" type="password" value={form.current_password} onChange={set("current_password")} error={errors.current_password} required />
        <Input label="Nouveau mot de passe" type="password" value={form.new_password} onChange={set("new_password")} error={errors.new_password} required />
        <Input label="Confirmer le nouveau mot de passe" type="password" value={form.new_password_confirm} onChange={set("new_password_confirm")} error={errors.new_password_confirm} required />
        <Button type="submit" disabled={submitting} className="self-start mt-2">
          {submitting ? "Modification..." : "Modifier le mot de passe"}
        </Button>
      </form>
    </div>
  );
}

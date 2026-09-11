import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "", email: "", password: "", password_confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.first_name) errs.first_name = "Le prénom est requis.";
    if (!form.last_name) errs.last_name = "Le nom est requis.";
    if (!form.email) errs.email = "L'email est requis.";
    if (form.password.length < 8) errs.password = "8 caractères minimum.";
    if (form.password !== form.password_confirm) errs.password_confirm = "Les mots de passe ne correspondent pas.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(form);
      navigate("/mon-compte");
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const flat = {};
        Object.entries(data).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? v[0] : v; });
        setErrors(flat);
      } else {
        setErrors({ general: "Une erreur est survenue. Veuillez réessayer." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-20">
      <h1 className="text-2xl font-display font-bold text-ink mb-1">Créer mon compte</h1>
      <p className="text-ink-secondary text-sm mb-8">Rejoignez Aura Store pour suivre vos commandes facilement.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.general && <p className="text-sm text-error bg-error-bg rounded-lg px-3 py-2">{errors.general}</p>}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Prénom" value={form.first_name} onChange={set("first_name")} error={errors.first_name} />
          <Input label="Nom" value={form.last_name} onChange={set("last_name")} error={errors.last_name} />
        </div>
        <Input label="Téléphone" value={form.phone} onChange={set("phone")} error={errors.phone} />
        <Input label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
        <div className="relative">
          <Input
            label="Mot de passe" type={showPassword ? "text" : "password"}
            value={form.password} onChange={set("password")} error={errors.password}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-9 text-ink-tertiary">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <Input
          label="Confirmer le mot de passe" type={showPassword ? "text" : "password"}
          value={form.password_confirm} onChange={set("password_confirm")} error={errors.password_confirm}
        />
        <Button type="submit" size="lg" disabled={submitting} className="mt-2">
          {submitting ? "Création..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="text-sm text-ink-secondary text-center mt-6">
        J'ai déjà un compte — <Link to="/connexion" className="text-accent font-medium hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}

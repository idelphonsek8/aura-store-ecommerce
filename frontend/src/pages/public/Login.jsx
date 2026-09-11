import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      const dest = location.state?.from?.pathname || "/mon-compte";
      navigate(dest);
    } catch {
      setError("Identifiant ou mot de passe incorrect.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 md:py-24">
      <h1 className="text-2xl font-display font-bold text-ink mb-1">Connexion</h1>
      <p className="text-ink-secondary text-sm mb-8">Accédez à votre espace client Aura Store.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-sm text-error bg-error-bg rounded-lg px-3 py-2">{error}</p>}
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="relative">
          <Input
            label="Mot de passe" type={showPassword ? "text" : "password"}
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-9 text-ink-tertiary">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-secondary">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-border" />
            Se souvenir de moi
          </label>
          <Link to="/mot-de-passe-oublie" className="text-accent font-medium hover:underline">Mot de passe oublié ?</Link>
        </div>
        <Button type="submit" size="lg" disabled={submitting} className="mt-2">
          {submitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <p className="text-sm text-ink-secondary text-center mt-6">
        Pas encore de compte — <Link to="/inscription" className="text-accent font-medium hover:underline">Créer un compte</Link>
      </p>
    </div>
  );
}

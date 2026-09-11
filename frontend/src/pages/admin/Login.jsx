import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await adminLogin(email, password);
      navigate("/admin");
    } catch {
      setError("Identifiant ou mot de passe incorrect.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm bg-surface rounded-xl p-8 shadow-level3">
        <div className="w-10 h-10 rounded-lg bg-ink flex items-center justify-center font-display font-bold text-white mb-6">A</div>
        <h1 className="text-xl font-display font-bold text-ink mb-1">Administration</h1>
        <p className="text-sm text-ink-secondary mb-6">Connectez-vous à votre espace back-office.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-sm text-error bg-error-bg rounded-lg px-3 py-2">{error}</p>}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" size="lg" disabled={submitting} className="mt-2">
            {submitting ? "Connexion..." : "Se connecter"}
          </Button>
        </form>
      </div>
    </div>
  );
}

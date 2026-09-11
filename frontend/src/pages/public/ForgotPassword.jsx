import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 md:py-24">
      <h1 className="text-2xl font-display font-bold text-ink mb-1">Mot de passe oublié</h1>
      <p className="text-ink-secondary text-sm mb-8">
        Indiquez votre adresse email, nous vous enverrons un lien de réinitialisation.
      </p>
      {sent ? (
        <p className="text-sm text-success bg-success-bg rounded-lg px-4 py-3">
          Si un compte existe avec cette adresse, un email a été envoyé.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" size="lg">Envoyer le lien</Button>
        </form>
      )}
      <p className="text-sm text-ink-secondary text-center mt-6">
        <Link to="/connexion" className="text-accent font-medium hover:underline">Retour à la connexion</Link>
      </p>
    </div>
  );
}

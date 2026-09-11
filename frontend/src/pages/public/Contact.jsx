import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useToast } from "../../context/ToastContext";

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast("Votre message a bien été envoyé.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-ink mb-4">Contactez-nous</h1>
        <p className="text-ink-secondary mb-8">Une question ? Notre équipe vous répond sous 24h.</p>
        <div className="flex flex-col gap-4 text-sm text-ink-secondary">
          <div className="flex items-center gap-3"><Mail size={18} /> contact@aurastore.com</div>
          <div className="flex items-center gap-3"><Phone size={18} /> +229 90 00 00 00</div>
          <div className="flex items-center gap-3"><MapPin size={18} /> Cotonou, Bénin</div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label className="block">
          <span className="block mb-1.5 text-sm font-medium text-ink">Message</span>
          <textarea
            rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required
            className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </label>
        <Button type="submit" size="lg">Envoyer le message</Button>
      </form>
    </div>
  );
}

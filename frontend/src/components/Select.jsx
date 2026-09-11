export default function Select({ label, error, className = "", children, ...props }) {
  return (
    <label className="block">
      {label && <span className="block mb-1.5 text-sm font-medium text-ink">{label}</span>}
      <select
        className={`w-full h-12 rounded-xl border px-4 text-sm text-ink bg-surface outline-none transition-all ${
          error ? "border-error" : "border-border focus:border-ink focus:ring-2 focus:ring-ink/10"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="block mt-1 text-xs text-error">{error}</span>}
    </label>
  );
}

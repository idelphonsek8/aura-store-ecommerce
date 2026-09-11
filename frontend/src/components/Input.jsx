import { forwardRef } from "react";

const Input = forwardRef(function Input({ label, error, className = "", ...props }, ref) {
  return (
    <label className="block">
      {label && <span className="block mb-1.5 text-sm font-medium text-ink">{label}</span>}
      <input
        ref={ref}
        className={`w-full h-12 rounded-xl border px-4 text-sm text-ink bg-surface placeholder:text-ink-tertiary outline-none transition-all ${
          error
            ? "border-error focus:ring-2 focus:ring-error/20"
            : "border-border focus:border-ink focus:ring-2 focus:ring-ink/10"
        } ${className}`}
        {...props}
      />
      {error && <span className="block mt-1 text-xs text-error">{error}</span>}
    </label>
  );
});

export default Input;

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-display font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "text-sm px-3 py-2",
    md: "text-sm px-5 py-3",
    lg: "text-base px-6 py-3.5",
  };
  const variants = {
    primary: "bg-ink text-white hover:bg-[#27272A] shadow-level1 hover:shadow-level2",
    secondary: "bg-transparent border border-border text-ink hover:bg-muted",
    accent: "bg-accent text-white hover:brightness-95 shadow-level1",
    ghost: "bg-transparent text-ink hover:bg-muted",
    danger: "bg-transparent border border-error text-error hover:bg-error-bg",
  };
  return (
    <Component className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
}

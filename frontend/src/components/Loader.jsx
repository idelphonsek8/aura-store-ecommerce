export default function Loader({ label = "Chargement..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-ink-tertiary">
      <div className="w-8 h-8 border-2 border-border border-t-ink rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-muted rounded-xl ${className}`} />;
}

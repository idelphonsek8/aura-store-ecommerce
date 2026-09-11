const STATUS_STYLES = {
  EN_ATTENTE: "bg-muted text-ink",
  CONFIRMEE: "bg-[#DBEAFE] text-info",
  EN_PREPARATION: "bg-warning-bg text-warning",
  EXPEDIEE: "bg-[#DBEAFE] text-info",
  LIVREE: "bg-success-bg text-success",
  ANNULEE: "bg-error-bg text-error",
};

export const STATUS_LABELS = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  EN_PREPARATION: "En préparation",
  EXPEDIEE: "Expédiée",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export function StatusBadge({ status }) {
  return (
    <Badge className={STATUS_STYLES[status] || "bg-muted text-ink"}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

export default function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-display font-semibold tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

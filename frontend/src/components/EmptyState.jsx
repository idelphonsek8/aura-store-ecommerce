export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {icon && <div className="mb-4 text-ink-tertiary">{icon}</div>}
      <h3 className="font-display font-semibold text-lg text-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-secondary max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

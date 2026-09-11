import Button from "./Button";

export default function ErrorState({ message = "Une erreur est survenue.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <h3 className="font-display font-semibold text-lg text-error mb-1">Oups</h3>
      <p className="text-sm text-ink-secondary max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  );
}

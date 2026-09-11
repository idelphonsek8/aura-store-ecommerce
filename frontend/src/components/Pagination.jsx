import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-ink-tertiary">…</span>}
          <button
            onClick={() => onChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium ${
              p === page ? "bg-ink text-white" : "border border-border hover:bg-muted text-ink"
            }`}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

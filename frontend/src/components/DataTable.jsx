export default function DataTable({ columns, data, keyField = "id", onRowClick, mobileCard }) {
  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden md:block overflow-x-auto border border-border rounded-xl bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((col) => (
                <th key={col.key} className="text-left font-display font-semibold text-ink-secondary px-4 py-3 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-border last:border-0 ${onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-ink whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((row) => (
          <div
            key={row[keyField]}
            onClick={() => onRowClick?.(row)}
            className={`bg-surface border border-border rounded-xl p-4 ${onRowClick ? "cursor-pointer active:bg-muted/50" : ""}`}
          >
            {mobileCard ? mobileCard(row) : columns.map((col) => (
              <div key={col.key} className="flex justify-between py-1 text-sm">
                <span className="text-ink-tertiary">{col.header}</span>
                <span className="text-ink font-medium">{col.render ? col.render(row) : row[col.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

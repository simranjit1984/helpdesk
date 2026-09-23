export function SectionTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-blue-700">{title}</h3>
      <p className="text-sm text-bluegrey-600 mt-1 leading-relaxed">{description}</p>
    </div>
  );
}

export interface ClaimRow {
  id: string;
  label: string;
  claimName: string;
  claimValue: string;
}

export function ClaimTable({
  headerLabel,
  rows,
  onChangeName,
  onChangeValue,
  readOnly,
}: {
  headerLabel: string;
  rows: ClaimRow[];
  onChangeName?: (index: number, v: string) => void;
  onChangeValue?: (index: number, v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="border border-bluegrey-200 rounded-md overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-3 px-4 py-2.5 bg-bluegrey-50 border-b border-bluegrey-200 text-xs font-semibold text-bluegrey-500 uppercase tracking-wider">
        <span>{headerLabel}</span>
        <span>Claim name</span>
        <span>Claim value</span>
      </div>
      <div className="divide-y divide-bluegrey-100">
        {rows.map((row, i) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_1fr_1fr] gap-3 items-center px-4 py-3"
          >
            <span
              className="text-sm font-medium text-bluegrey-900 truncate"
              title={row.label}
            >
              {row.label}
            </span>
            <input
              type="text"
              value={row.claimName}
              readOnly={readOnly}
              onChange={(e) => onChangeName?.(i, e.target.value)}
              placeholder="e.g. role"
              className="h-9 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono disabled:bg-bluegrey-50 read-only:bg-bluegrey-50"
            />
            <input
              type="text"
              value={row.claimValue}
              readOnly={readOnly}
              onChange={(e) => onChangeValue?.(i, e.target.value)}
              placeholder="e.g. admin"
              className="h-9 px-3 text-sm border border-bluegrey-300 rounded-sm bg-white text-bluegrey-900 placeholder:text-bluegrey-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono disabled:bg-bluegrey-50 read-only:bg-bluegrey-50"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

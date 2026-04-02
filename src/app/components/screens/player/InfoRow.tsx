// ─── Profile info row ─────────────────────────────────────────────────────────
export const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-2 border-b border-gray-50 py-2 last:border-0">
    <span className="w-28 shrink-0 text-sm text-gray-400">{label}</span>
    <span className="min-w-0 flex-1 text-sm font-medium text-gray-800">
      {children}
    </span>
  </div>
);
